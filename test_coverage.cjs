const fs = require('fs');
const appJs = fs.readFileSync('app.js', 'utf8');

const match = appJs.match(/const fluentMapping = {([^}]+)}/);
if (match) {
  console.log(match[0]);
}
