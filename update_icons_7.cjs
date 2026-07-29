const fs = require('fs');

const replacements = {
  'spinach_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="spinachGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#22c55e"/><stop offset="50%" stop-color="#16a34a"/><stop offset="100%" stop-color="#14532d"/></linearGradient></defs><path d="M 50,95 Q 45,90 50,75 C 20,70 10,50 20,35 C 10,25 30,5 50,15 C 70,5 90,25 80,35 C 90,50 80,70 50,75 Z" fill="url(#spinachGrad)"/><path d="M 50,90 L 50,15 M 50,65 Q 35,50 25,45 M 50,50 Q 65,40 75,35 M 50,40 Q 35,30 25,25 M 50,30 Q 60,20 65,15" stroke="#4ade80" stroke-width="2" fill="none" opacity="0.8" stroke-linecap="round"/></svg>`,
  'basil_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="basilGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4ade80"/><stop offset="50%" stop-color="#22c55e"/><stop offset="100%" stop-color="#15803d"/></linearGradient></defs><path d="M 50,95 Q 50,70 50,50" stroke="#15803d" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M 50,55 C 20,70 5,45 15,25 C 25,5 50,15 50,55 Z" fill="url(#basilGrad)"/><path d="M 50,55 C 80,70 95,45 85,25 C 75,5 50,15 50,55 Z" fill="url(#basilGrad)"/><path d="M 50,45 C 35,50 25,35 35,20 C 45,5 50,15 50,45 Z" fill="#4ade80"/><path d="M 50,45 C 65,50 75,35 65,20 C 55,5 50,15 50,45 Z" fill="#4ade80"/></svg>`,
  'quince_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="quinceGrad" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#eab308"/><stop offset="100%" stop-color="#a16207"/></radialGradient></defs><path d="M 50,15 L 55,5 Q 65,-5 75,10 Q 60,20 50,15 Z" fill="#4ade80"/><path d="M 50,15 L 50,5" stroke="#78350f" stroke-width="4" stroke-linecap="round"/><path d="M 50,15 C 25,10 10,40 15,65 C 20,90 40,95 50,95 C 60,95 80,90 85,65 C 90,40 75,10 50,15 Z" fill="url(#quinceGrad)"/><circle cx="30" cy="70" r="2" fill="#ca8a04" opacity="0.5"/><circle cx="45" cy="80" r="2.5" fill="#ca8a04" opacity="0.5"/><circle cx="70" cy="65" r="2" fill="#ca8a04" opacity="0.5"/><circle cx="25" cy="50" r="1.5" fill="#ca8a04" opacity="0.5"/><circle cx="65" cy="80" r="2" fill="#ca8a04" opacity="0.5"/><ellipse cx="35" cy="35" rx="6" ry="15" transform="rotate(-30 35 35)" fill="rgba(255,255,255,0.4)" filter="blur(1px)"/></svg>`,
  'guava_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="guavaOut" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#bef264"/><stop offset="50%" stop-color="#4ade80"/><stop offset="100%" stop-color="#166534"/></radialGradient><radialGradient id="guavaIn" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fecdd3"/><stop offset="40%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#be123c"/></radialGradient></defs><circle cx="35" cy="45" r="30" fill="url(#guavaOut)"/><circle cx="25" cy="25" r="3" fill="#14532d"/><ellipse cx="65" cy="65" rx="25" ry="25" fill="url(#guavaOut)"/><ellipse cx="65" cy="65" rx="22" ry="22" fill="#fef08a"/><ellipse cx="65" cy="65" rx="18" ry="18" fill="url(#guavaIn)"/><circle cx="60" cy="60" r="1.5" fill="#fef08a"/><circle cx="68" cy="58" r="1.5" fill="#fef08a"/><circle cx="58" cy="68" r="1.5" fill="#fef08a"/><circle cx="65" cy="70" r="1.5" fill="#fef08a"/><circle cx="72" cy="65" r="1.5" fill="#fef08a"/><circle cx="62" cy="64" r="1.5" fill="#fef08a"/><circle cx="68" cy="68" r="1.5" fill="#fef08a"/></svg>`,
  'pomegranate_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="pomOut" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#fca5a5"/><stop offset="50%" stop-color="#dc2626"/><stop offset="100%" stop-color="#7f1d1d"/></radialGradient><radialGradient id="pomIn" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#fef9c3"/></radialGradient></defs><circle cx="50" cy="55" r="40" fill="url(#pomOut)"/><path d="M 40,16 L 35,5 L 45,10 L 50,0 L 55,10 L 65,5 L 60,16 Z" fill="#991b1b"/><path d="M 25,60 C 20,40 50,30 75,50 C 65,70 30,70 25,60 Z" fill="url(#pomIn)"/><circle cx="40" cy="45" r="4" fill="#ef4444"/><circle cx="50" cy="42" r="4.5" fill="#dc2626"/><circle cx="60" cy="45" r="4" fill="#b91c1c"/><circle cx="35" cy="55" r="4" fill="#dc2626"/><circle cx="45" cy="55" r="4.5" fill="#991b1b"/><circle cx="55" cy="55" r="4" fill="#ef4444"/><circle cx="65" cy="52" r="4" fill="#dc2626"/><circle cx="40" cy="63" r="4" fill="#b91c1c"/><circle cx="50" cy="63" r="4.5" fill="#ef4444"/><circle cx="60" cy="60" r="4" fill="#dc2626"/><ellipse cx="35" cy="40" rx="4" ry="12" transform="rotate(-30 35 40)" fill="rgba(255,255,255,0.3)" filter="blur(1px)"/></svg>`
};

let appJs = fs.readFileSync('app.js', 'utf8');

for (const [key, value] of Object.entries(replacements)) {
  const regex = new RegExp(`'${key}': \\\`.*?\\\`,`);
  if (regex.test(appJs)) {
    appJs = appJs.replace(regex, `'${key}': \`${value}\`,`);
  } else {
    // Check if it exists without regex
    const exactStr = `'${key}':`;
    if (appJs.includes(exactStr)) {
      const start = appJs.indexOf(exactStr);
      const end = appJs.indexOf('`,', start) + 2;
      appJs = appJs.slice(0, start) + `'${key}': \`${value}\`,` + appJs.slice(end);
    } else {
      const customSvgsStart = appJs.indexOf('const customSvgs = {\n');
      if (customSvgsStart !== -1) {
        appJs = appJs.slice(0, customSvgsStart + 'const customSvgs = {\n'.length) + `  '${key}': \`${value}\`,\n` + appJs.slice(customSvgsStart + 'const customSvgs = {\n'.length);
      }
    }
  }
}

fs.writeFileSync('app.js', appJs);
console.log("Updated requested icons successfully.");
