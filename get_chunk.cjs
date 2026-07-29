const fs = require('fs');
const appJs = fs.readFileSync('app.js', 'utf8');
const startIndex = appJs.indexOf('function sanitizeCropIcon');
console.log(appJs.slice(startIndex, startIndex + 6000));
