# Event RSVP Web Application

A modern, full-stack **Event RSVP platform** with **Role-Based Access Control** built on AWS serverless architecture. Users can browse events, register accounts, submit RSVPs, while administrators manage event creation and view analytics—all through a smooth, responsive interface.

![Architecture](https://img.shields.io/badge/Architecture-Serverless-orange) ![AWS](https://img.shields.io/badge/AWS-Lambda%20%7C%20S3%20%7C%20RDS%20%7C%20DynamoDB-yellow) ![Auth](https://img.shields.io/badge/Auth-JWT%20%7C%20RBAC-blue)

---

## ✨ Features

### 🌐 Public Access
- Browse upcoming events with details (title, venue, date, description)
- Responsive card-based layout
- Mobile-friendly design

### 🔐 Authenticated Users
- Secure registration and login with JWT authentication
- View full event details and RSVP (Yes/No)
- Email-based duplicate RSVP prevention
- Instant UI feedback with smooth animations

### 👑 Admin Features (RBAC)
- Create and manage events
- View real-time RSVP statistics (Yes/No counts)
- Access detailed attendee lists
- Protected endpoints with token verification

---

## 🏗️ Architecture

```
┌──────────────┐
│  CloudFront  │  Global CDN
└──────┬───────┘
       │
┌──────▼───────┐
│      S3      │  Static Hosting (HTML, CSS, JS)
└──────────────┘
       │ API Calls
       ↓
┌──────────────┐
│  API Gateway │  REST API + CORS
└──────┬───────┘
       │
┌──────▼───────┐
│    Lambda    │  Serverless Compute (Node.js)
└───┬──────┬───┘
    │      │
┌───▼──┐ ┌─▼────────┐
│ RDS  │ │ DynamoDB │
│MySQL │ │  NoSQL   │
└──────┘ └──────────┘
```

**Design Principles:**
- **Serverless-first** – Auto-scaling, pay-per-use, zero server management
- **Hybrid database** – RDS for relational data (users, events), DynamoDB for high-velocity operations (RSVPs)
- **JWT authentication** – Stateless tokens, no session storage required
- **Multi-layer security** – RBAC enforced at UI, API, and database levels
- **Global delivery** – CloudFront CDN for low-latency worldwide access

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** – Semantic structure
- **CSS3** – Modern animations and responsive design
- **Vanilla JavaScript** – Dynamic DOM manipulation, no frameworks
- **localStorage** – Client-side session persistence

### Backend
- **AWS Lambda** – Serverless Node.js runtime
- **API Gateway** – RESTful API routing
- **RDS MySQL** – Structured data (events, users)
- **DynamoDB** – High-performance RSVP tracking
- **bcryptjs** – Password hashing (10 salt rounds)
- **jsonwebtoken** – JWT generation and validation

### Infrastructure
- **S3** – Static website hosting
- **CloudFront** – Global CDN
- **IAM** – Access management

---

## 📂 Project Structure

```
.
├── Frontend (S3)
│   ├── index.html           # Main UI with dynamic modals
│   ├── style.css            # Styling with smooth transitions
│   ├── app.js               # Application initialization
│   ├── auth.js              # Authentication & RBAC logic
│   ├── events.js            # Event management & RSVP handling
│   └── utils.js             # API calls & utilities
│
├── Backend (Lambda)
│   ├── index.js             # Lambda handler with JWT auth
│   ├── package.json         # Dependencies
│   └── database-schema.sql  # MySQL schema
│
└── Development
    └── server.js            # Local development server
```

---

## 🔐 Security Implementation

### Authentication
- Passwords hashed with **bcrypt** (never stored as plaintext)
- **JWT tokens** with 7-day expiration
- Secure token storage in browser localStorage
- Token verification on every protected API request

### Authorization (RBAC)
- **Two roles:** `user` and `admin`
- Admin-only features:
  - Event creation (`POST /events`)
  - Statistics viewing (`GET /stats/:event_id`)
  - Protected at frontend (UI), API Gateway, and Lambda layers

### Data Protection
- SQL injection prevention via parameterized queries
- CORS configured for secure cross-origin requests
- Environment variables for sensitive credentials
- No secrets exposed to client-side code

---

## 💡 Key Learnings

### Cloud Architecture
- Designed and deployed serverless REST APIs on AWS
- Integrated relational (RDS) and NoSQL (DynamoDB) databases in a hybrid architecture
- Implemented JWT-based stateless authentication for serverless environments
- Configured CORS and API Gateway for secure frontend-backend communication
- Optimized global content delivery with CloudFront CDN

### Full-Stack Development
- Built role-based access control (RBAC) from scratch
- Implemented secure password hashing and token generation
- Created smooth, instant UX without page reloads
- Developed dynamic modal rendering system
- Managed authentication state across application lifecycle

### Best Practices
- Separation of concerns (static assets vs. compute)
- Defense in depth (multi-layer authorization)
- Environment-based configuration
- Clean code organization and maintainability
- Comprehensive error handling

---

## 🚀 Getting Started

### Local Development

```bash
# Clone the repository
git clone https://github.com/KartikJondhalekar/Event-RSVP-app
cd Event-RSVP-app

# Start local server
node server.js

# Access at http://localhost:3000
```

**Note:** Full functionality requires AWS backend deployment (Lambda, RDS, DynamoDB, API Gateway)

### AWS Deployment

1. Set up RDS MySQL database with provided schema
2. Create DynamoDB table for RSVP responses
3. Deploy Lambda function with environment variables
4. Configure API Gateway routes with CORS
5. Upload frontend files to S3
6. (Optional) Set up CloudFront distribution

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 📊 API Endpoints

| Endpoint | Method | Auth | Role | Description |
|----------|--------|------|------|-------------|
| `/events` | GET | No | Public | List all events |
| `/auth/register` | POST | No | Public | Create account |
| `/auth/login` | POST | No | Public | Login user |
| `/event/:id` | GET | Yes | User | Get event details |
| `/rsvp` | POST | Yes | User | Submit RSVP |
| `/attendees/:id` | GET | Yes | User | Get attendees |
| `/events` | POST | Yes | Admin | Create event |
| `/stats/:id` | GET | Yes | Admin | View statistics |

---

## 🎯 Project Highlights

- **Zero infrastructure management** – Fully serverless architecture
- **Auto-scaling** – Handles traffic spikes automatically
- **Cost-efficient** – Pay only for actual usage
- **Secure by design** – Multi-layer authentication and authorization
- **Production-ready** – Comprehensive error handling and validation
- **Modern UX** – Smooth transitions, instant feedback, no page reloads
- **Global reach** – CloudFront CDN for worldwide performance

---

## 🔮 Future Enhancements

- Email notifications for RSVP confirmations
- Event editing and deletion (admin)
- User profile management
- Event categories and search/filtering
- Calendar integration (iCal export)
- Email verification for new accounts
- Password reset functionality
- Event capacity limits and waitlists
- Multi-factor authentication (MFA)
- Analytics dashboard for admins

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

**Kartik Jondhalekar**

[![GitHub](https://img.shields.io/badge/GitHub-KartikJondhalekar-black?logo=github)](https://github.com/KartikJondhalekar)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?logo=linkedin)](https://linkedin.com/in/kartik-jondhalekar)

---

## 🙏 Acknowledgments

Built with modern web technologies and AWS serverless services to demonstrate production-ready full-stack development with authentication, authorization, and scalable cloud architecture.

**⭐ If you find this project useful, please consider giving it a star!**

---

**Built with ❤️ using AWS Serverless Architecture**
