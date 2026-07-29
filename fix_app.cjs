const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const parts = appJs.split('const customSvgs = {');
if (parts.length > 2) {
  // It was inserted twice
  appJs = parts[0] + 'const customSvgs = {' + parts.slice(2).join('const customSvgs = {');
}

fs.writeFileSync('app.js', appJs);
console.log("Fixed double injection.");
