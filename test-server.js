const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'OK', 
    message: 'Test server is running',
    timestamp: new Date().toISOString()
  }));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});