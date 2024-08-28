const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

const PORT = 8086;
const UPLOAD_DIR = 'C:/TEMP';

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/upload') {
        const form = new formidable.IncomingForm({ uploadDir: UPLOAD_DIR, keepExtensions: true });

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error('Error during file upload:', err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error uploading file');
                return;
            }

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Files uploaded successfully');
        });

    } else if (req.method === 'GET' && req.url === '/list_files') {
        fs.readdir(UPLOAD_DIR, (err, files) => {
            if (err) {
                console.error('Error reading files:', err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error reading files');
                return;
            }

            const fileDetails = files.map(fileName => ({
                name: fileName,
                url: `http://localhost:${PORT}/uploaded_files/${fileName}`,
            }));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(fileDetails));
        });

    } else if (req.url.startsWith('/uploaded_files')) {
        const filePath = path.join(UPLOAD_DIR, path.basename(req.url));

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end(JSON.stringify(err));
                return;
            }

            res.writeHead(200);
            res.end(data);
        });

    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
