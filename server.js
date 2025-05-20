// Production server for Render deployment
const express = require('express');
const path = require('path');
const app = express();

// Set production environment
process.env.NODE_ENV = 'production';

// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, 'dist/client')));

// Import and use your API routes
const routes = require('./dist/server/routes.js');
routes.registerRoutes(app);

// For any request that doesn't match an API route, send the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/client/index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});