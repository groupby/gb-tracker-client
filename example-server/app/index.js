var path = require('path');
var express = require('express');
var app = express();

const publicPath = path.join(__dirname, './public');

app.use('/', express.static(publicPath));

const PORT = 3000;

app.listen(PORT);
console.log(`serving on port: ${PORT}`);
