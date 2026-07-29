const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const startIndex = appJs.indexOf('function sanitizeCropIcon(icon, isHtml = true) {');
console.log("Current startIndex:", startIndex);
