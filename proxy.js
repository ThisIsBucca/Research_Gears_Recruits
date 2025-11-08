const http = require('http');
const httpProxy = require('http-proxy');

// Create a proxy server
const proxy = httpProxy.createProxyServer({});

// Handle proxy errors
proxy.on('error', function (err, req, res) {
    console.error('Proxy error:', err);
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });
    res.end('Something went wrong with the proxy.');
});

// Create the server
const server = http.createServer(function(req, res) {
    // Add permissive CORS headers for development. We echo the incoming Origin
    // when present to support both 'localhost' and '127.0.0.1'. In production
    // the API should configure its own CORS policy and this proxy is not used.
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle OPTIONS requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Proxy the request
    proxy.web(req, res, {
        target: 'https://api.sokoni.africa',
        changeOrigin: true,
        secure: true
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});