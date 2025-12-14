import { createServer } from 'http';
import { readFile } from 'fs';
import { extname } from 'path';

const port = 3000;

const server = createServer((req, res) => {

    // Default file
    let filePath = req.url === '/' ? 'index.html' : req.url.substring(1);

    let ext = extname(filePath);

    let contentType = 'text/html';

    // map extensions
    switch (ext) {
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'application/javascript';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
        case '.jpg':
        case '.jpeg':
        case '.gif':
            contentType = 'image/' + ext.replace('.', '');
            break;
    }

    readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
