const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

appJs = appJs.replace("'🍠': 'Sweet potato'", "'🍠': 'Roasted sweet potato'");

fs.writeFileSync('app.js', appJs);
console.log("Fixed mapping in app.js");
