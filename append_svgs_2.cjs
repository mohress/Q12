const fs = require('fs');

function makeSvg(defs, body) {
  return `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${body}</svg>`;
}

const svgs = {
  cabbage_svg: makeSvg(
    `<radialGradient id="cabGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#bbf7d0"/><stop offset="50%" stop-color="#4ade80"/><stop offset="100%" stop-color="#166534"/></radialGradient>`,
    `<circle cx="50" cy="55" r="40" fill="url(#cabGrad)"/><path d="M 20,40 C 40,20 60,30 80,45" stroke="#14532d" stroke-width="2" fill="none" opacity="0.5"/><path d="M 30,70 C 50,50 70,60 85,75" stroke="#14532d" stroke-width="2" fill="none" opacity="0.5"/>`
  ),
  cauliflower_svg: makeSvg(
    `<radialGradient id="cauGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#f8fafc"/><stop offset="50%" stop-color="#f1f5f9"/><stop offset="100%" stop-color="#cbd5e1"/></radialGradient>`,
    `<circle cx="50" cy="50" r="35" fill="url(#cauGrad)"/><circle cx="35" cy="40" r="15" fill="url(#cauGrad)"/><circle cx="65" cy="40" r="15" fill="url(#cauGrad)"/><circle cx="50" cy="30" r="15" fill="url(#cauGrad)"/><path d="M 20,65 C 30,85 70,85 80,65 Z" fill="#86efac"/>`
  )
};

let appJs = fs.readFileSync('app.js', 'utf8');

// Insert new SVGs into customSvgs
const customSvgsStart = appJs.indexOf('const customSvgs = {\n');
if (customSvgsStart !== -1) {
  let toInsert = '';
  for (const [key, val] of Object.entries(svgs)) {
    toInsert += `  '${key}': \`${val}\`,\n`;
  }
  appJs = appJs.slice(0, customSvgsStart + 'const customSvgs = {\n'.length) + toInsert + appJs.slice(customSvgsStart + 'const customSvgs = {\n'.length);
}

// Replace duplicate icons
appJs = appJs.replace(/\{ primaryAr: "ملفوف", synonymsAr: \["لهانة"\], nameEn: "Cabbage", icon: "🥬" \}/, `{ primaryAr: "ملفوف", synonymsAr: ["لهانة"], nameEn: "Cabbage", icon: "cabbage_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "قرنبيط", synonymsAr: \["قرنابيط", "زهرة"\], nameEn: "Cauliflower", icon: "🥦" \}/, `{ primaryAr: "قرنبيط", synonymsAr: ["قرنابيط", "زهرة"], nameEn: "Cauliflower", icon: "cauliflower_svg" }`);

fs.writeFileSync('app.js', appJs);
console.log("Updated with unique SVGs for cabbage and cauliflower.");
