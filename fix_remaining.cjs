const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

// Replace the last few
appJs = appJs.replace(/\{ primaryAr: "دراكون فروت", synonymsAr: \["فاكهة التنين", "بتايا"\], nameEn: "Dragon Fruit", icon: "🍎", countOnly: true \}/, `{ primaryAr: "دراكون فروت", synonymsAr: ["فاكهة التنين", "بتايا"], nameEn: "Dragon Fruit", icon: "dragonfruit_svg", countOnly: true }`);
appJs = appJs.replace(/\{ primaryAr: "خرشوف", synonymsAr: \["أرضي شوكي"\], nameEn: "Artichoke", icon: "🥦" \}/, `{ primaryAr: "خرشوف", synonymsAr: ["أرضي شوكي"], nameEn: "Artichoke", icon: "artichoke_svg" }`);

const extraSvgs = `
  'dragonfruit_svg': \`<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="dfGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#fbcfe8"/><stop offset="50%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#be123c"/></radialGradient></defs><circle cx="50" cy="55" r="35" fill="url(#dfGrad)"/><path d="M 50,20 C 40,10 30,30 20,40" stroke="#86efac" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M 80,40 C 70,30 60,10 50,20" stroke="#86efac" stroke-width="4" stroke-linecap="round" fill="none"/><ellipse cx="40" cy="40" rx="6" ry="12" transform="rotate(-45 40 40)" fill="rgba(255,255,255,0.4)" filter="blur(1px)"/></svg>\`,
  'artichoke_svg': \`<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="artGrad" cx="50%" cy="80%" r="70%"><stop offset="0%" stop-color="#bbf7d0"/><stop offset="100%" stop-color="#166534"/></radialGradient></defs><path d="M 50,90 C 20,70 30,20 50,10 C 70,20 80,70 50,90 Z" fill="url(#artGrad)"/><path d="M 50,90 C 35,70 45,30 50,20 C 55,30 65,70 50,90 Z" fill="#22c55e" opacity="0.6"/><ellipse cx="45" cy="50" rx="8" ry="15" transform="rotate(-15 45 50)" fill="rgba(255,255,255,0.2)" filter="blur(1px)"/></svg>\`,
`;

appJs = appJs.replace(/const customSvgs = \{/, 'const customSvgs = {\n' + extraSvgs);
fs.writeFileSync('app.js', appJs);
