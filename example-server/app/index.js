var path = require('path');
var express = require('express');
var app = express();

const publicPath = path.join(__dirname, './public');
const distPath = path.join(__dirname, './dist');

app.use('/', express.static(publicPath));
app.use('/dist', express.static(distPath));

const PORT = 7000;

app.listen(PORT);
console.log(`serving on port: ${PORT}`);
