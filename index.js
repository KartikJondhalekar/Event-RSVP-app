import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
    DynamoDBClient,
    BatchGetItemCommand,
    UpdateItemCommand,
    PutItemCommand,
    QueryCommand,
    TransactWriteItemsCommand
} from '@aws-sdk/client-dynamodb';
import { randomUUID } from 'crypto';

const dynamodb = new DynamoDBClient({ region: process.env.REGION });
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ===== JWT Token Validation Middleware =====
function verifyToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No token provided');
    }

    const token = authHeader.split(' ')[1];
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        throw new Error('Invalid or expired token');
    }
}

// ===== Check if user is admin =====
function requireAdmin(user) {
    if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
    }
}

export const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const method = event.requestContext.http.method;
    const path = event.requestContext.http.path;
    const pathParams = event.pathParameters || {};
    const queryParams = event.queryStringParameters || {};
    const body = event.body ? JSON.parse(event.body) : {};
    const authHeader = event.headers?.authorization || event.headers?.Authorization;

    if (method === 'OPTIONS') {
        return json({}, 200);
    }

    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    });

    try {
        // ============ POST /auth/register ============
        if (method === 'POST' && path === '/auth/register') {
            const { email, password, full_name } = body;

            if (!email || !password || !full_name) {
                return json({ message: 'Email, password, and full name are required' }, 400);
            }

            // Check if user already exists
            const [existingUsers] = await conn.execute(
                'SELECT user_id FROM users WHERE email = ?',
                [email]
            );

            if (existingUsers.length > 0) {
                return json({ message: 'User already exists with this email' }, 400);
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);
            const userId = randomUUID();

            // Insert new user
            await conn.execute(
                'INSERT INTO users (user_id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
                [userId, email, passwordHash, full_name, 'user']
            );

            return json({
                message: 'User registered successfully',
                user_id: userId
            }, 201);
        }

        // ============ POST /auth/login ============
        if (method === 'POST' && path === '/auth/login') {
            const { email, password } = body;

            if (!email || !password) {
                return json({ message: 'Email and password are required' }, 400);
            }

            // Get user
            const [users] = await conn.execute(
                'SELECT user_id, email, password_hash, full_name, role FROM users WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                return json({ message: 'Invalid email or password' }, 401);
            }

            const user = users[0];

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return json({ message: 'Invalid email or password' }, 401);
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    user_id: user.user_id,
                    email: user.email,
                    role: user.role
                },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return json({
                message: 'Login successful',
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    token: token
                }
            });
        }

        // ============ POST /events (Admin only - Create event) ============
        if (method === 'POST' && path === '/events') {
            const userData = verifyToken(authHeader);
            requireAdmin(userData);

            const { title, description, venue, start_at, banner_url } = body;

            if (!title || !venue || !start_at) {
                return json({ message: 'Title, venue, and start_at are required' }, 400);
            }

            const eventId = randomUUID();

            await conn.execute(
                `INSERT INTO events (event_id, title, description, venue, start_at, banner_url, created_by) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [eventId, title, description, venue, start_at, banner_url, userData.user_id]
            );

            return json({
                message: 'Event created successfully',
                event_id: eventId
            }, 201);
        }

        // ============ GET /events/{event_id} ============
        if (method === 'GET' && path.startsWith("/event/")) {
            const eventId = pathParams.event_id;
            console.log('Looking for event ID:', eventId);

            const [rows] = await conn.execute('SELECT * FROM events WHERE event_id = ?', [eventId]);
            if (rows.length === 0) {
                return json({ message: "Event not found" }, 404);
            }
            return json(rows[0]);
        }

        // ============ GET /stats/{event_id} (Admin only) ============
        if (method === 'GET' && path.startsWith("/stats/")) {
            const userData = verifyToken(authHeader);
            requireAdmin(userData);

            const eventId = pathParams.event_id;
            console.log('Getting stats for:', eventId);

            const responses = ['Yes', 'No'];
            const keys = responses.map(r => ({
                pk: { S: `EVENT#${eventId}` },
                sk: { S: `RESPONSE#${r}` }
            }));

            const result = await dynamodb.send(new BatchGetItemCommand({
                RequestItems: {
                    'event-rsvp-responses': { Keys: keys }
                }
            }));

            const items = result.Responses?.['event-rsvp-responses'] || [];
            const counts = { Yes: 0, No: 0 };
            for (const item of items) {
                const key = item.sk.S.split('#')[1];
                counts[key] = Number(item.count?.N || 0);
            }

            return json(counts);
        }

        // ============ POST /rsvp ============
        if (method === 'POST' && path === '/rsvp') {
            const { event_id, full_name, email, response } = body;
            console.log('RSVP request:', { event_id, full_name, email, response });

            if (!event_id || !full_name || !email || !response) {
                return json({
                    message: "Missing required fields. Email is required to prevent duplicate RSVPs."
                }, 400);
            }

            const now = Date.now();

            try {
                await dynamodb.send(new TransactWriteItemsCommand({
                    TransactItems: [
                        {
                            Put: {
                                TableName: "event-rsvp-responses",
                                Item: {
                                    pk: { S: `EVENT#${event_id}` },
                                    sk: { S: `RESPONDENT#${email}` },
                                    full_name: { S: full_name },
                                    email: { S: email },
                                    response: { S: response },
                                    timestamp: { N: String(now) }
                                },
                                ConditionExpression: "attribute_not_exists(pk) AND attribute_not_exists(sk)"
                            }
                        },
                        {
                            Update: {
                                TableName: "event-rsvp-responses",
                                Key: {
                                    pk: { S: `EVENT#${event_id}` },
                                    sk: { S: `RESPONSE#${response}` }
                                },
                                UpdateExpression: "ADD #count :one",
                                ExpressionAttributeNames: { "#count": "count" },
                                ExpressionAttributeValues: { ":one": { N: "1" } }
                            }
                        }
                    ]
                }));

                return json({ message: "RSVP recorded" }, 200);

            } catch (err) {
                if (err.name === "TransactionCanceledException" || err.name === "ConditionalCheckFailedException") {
                    return json({
                        message: "You have already RSVP'd for this event with this email.",
                        code: "DUPLICATE_RSVP"
                    }, 400);
                }
                console.error("DynamoDB error:", err);
                return json({ error: err.message }, 500);
            }
        }

        // ============ GET /attendees/{event_id} ============
        if (method === 'GET' && path.startsWith("/attendees/")) {
            const eventId = pathParams.event_id;
            const responseType = queryParams.response;

            let keyCondition = "pk = :pk AND begins_with(sk, :prefix)";
            let expressionValues = {
                ":pk": { S: `EVENT#${eventId}` },
                ":prefix": { S: "RESPONDENT#" }
            };

            const result = await dynamodb.send(new QueryCommand({
                TableName: "event-rsvp-responses",
                KeyConditionExpression: keyCondition,
                ExpressionAttributeValues: expressionValues,
            }));

            let attendees = result.Items.map(item => ({
                full_name: item.full_name?.S,
                email: item.email?.S,
                response: item.response?.S,
                timestamp: parseInt(item.timestamp?.N)
            }));

            if (responseType) {
                attendees = attendees.filter(a => a.response === responseType);
            }

            return json(attendees);
        }

        // ============ GET /events ============
        if (method === 'GET' && path === '/events') {
            console.log('Getting all events');
            const [rows] = await conn.execute(`
                SELECT event_id, title, description, start_at, venue, banner_url, created_at
                FROM events
                ORDER BY start_at ASC
            `);
            return json(rows);
        }

        // ============ Fallback ============
        return json({ message: "Route not found" }, 404);

    } catch (err) {
        console.error('Error:', err);

        // Handle specific authentication errors
        if (err.message.includes('token') || err.message.includes('Unauthorized')) {
            return json({ error: err.message }, 401);
        }

        return json({ error: err.message }, 500);
    } finally {
        if (conn) await conn.end();
    }
};

// Helper function for consistent json responses
function json(data, statusCode = 200) {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token, X-Requested-With',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(data)
    };
}