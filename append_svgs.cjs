const fs = require('fs');

function makeSvg(defs, body) {
  return `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${body}</svg>`;
}

const svgs = {
  // Beans/Legumes
  olive_svg: makeSvg(
    `<radialGradient id="oliGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#bbf7d0"/><stop offset="50%" stop-color="#4ade80"/><stop offset="100%" stop-color="#14532d"/></radialGradient>`,
    `<ellipse cx="50" cy="55" rx="25" ry="35" fill="url(#oliGrad)" transform="rotate(15 50 55)"/><ellipse cx="45" cy="40" rx="4" ry="12" transform="rotate(-15 45 40)" fill="rgba(255,255,255,0.4)" filter="blur(1px)"/>`
  ),
  beans_svg: makeSvg(
    `<linearGradient id="beaGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fca5a5"/><stop offset="100%" stop-color="#7f1d1d"/></linearGradient>`,
    `<path d="M 25,60 C 25,30 50,20 75,30 C 85,35 85,65 75,70 C 50,80 25,90 25,60 Z" fill="url(#beaGrad)"/><ellipse cx="45" cy="45" rx="5" ry="10" transform="rotate(45 45 45)" fill="rgba(255,255,255,0.3)" filter="blur(1px)"/>`
  ),
  peas_svg: makeSvg(
    `<linearGradient id="peaGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#86efac"/><stop offset="100%" stop-color="#166534"/></linearGradient>`,
    `<path d="M 10,80 C 20,40 60,20 90,20 C 80,60 40,80 10,80 Z" fill="url(#peaGrad)"/><circle cx="35" cy="60" r="8" fill="#4ade80"/><circle cx="50" cy="50" r="8" fill="#4ade80"/><circle cx="65" cy="40" r="8" fill="#4ade80"/>`
  ),
  chickpeas_svg: makeSvg(
    `<radialGradient id="chiGrad" cx="40%" cy="40%" r="60%"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#a16207"/></radialGradient>`,
    `<circle cx="50" cy="55" r="25" fill="url(#chiGrad)"/><path d="M 35,45 C 30,40 25,50 35,55 Z" fill="#ca8a04"/>`
  ),
  lentils_svg: makeSvg(
    `<radialGradient id="lenGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#fb923c"/><stop offset="100%" stop-color="#9a3412"/></radialGradient>`,
    `<circle cx="35" cy="45" r="15" fill="url(#lenGrad)"/><circle cx="65" cy="55" r="15" fill="url(#lenGrad)"/><circle cx="45" cy="70" r="15" fill="url(#lenGrad)"/>`
  ),
  mungbeans_svg: makeSvg(
    `<radialGradient id="munGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#86efac"/><stop offset="100%" stop-color="#14532d"/></radialGradient>`,
    `<ellipse cx="40" cy="50" rx="12" ry="18" fill="url(#munGrad)" transform="rotate(30 40 50)"/><ellipse cx="65" cy="65" rx="12" ry="18" fill="url(#munGrad)" transform="rotate(-20 65 65)"/><ellipse cx="70" cy="40" rx="12" ry="18" fill="url(#munGrad)" transform="rotate(45 70 40)"/>`
  ),
  
  // Duplicates fix
  driedlime_svg: makeSvg(
    `<radialGradient id="dlGrad" cx="40%" cy="40%" r="60%"><stop offset="0%" stop-color="#d6d3d1"/><stop offset="50%" stop-color="#78716c"/><stop offset="100%" stop-color="#1c1917"/></radialGradient>`,
    `<circle cx="50" cy="55" r="35" fill="url(#dlGrad)"/><circle cx="40" cy="40" r="3" fill="#44403c"/><circle cx="60" cy="45" r="4" fill="#44403c"/><circle cx="50" cy="70" r="3" fill="#44403c"/>`
  ),
  tangerine_svg: makeSvg(
    `<radialGradient id="tanGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#fdba74"/><stop offset="50%" stop-color="#f97316"/><stop offset="100%" stop-color="#9a3412"/></radialGradient>`,
    `<circle cx="50" cy="55" r="35" fill="url(#tanGrad)"/><path d="M 50,20 C 40,5 20,15 45,25 Z" fill="#4ade80"/><ellipse cx="35" cy="35" rx="6" ry="12" transform="rotate(-45 35 35)" fill="rgba(255,255,255,0.4)" filter="blur(1px)"/>`
  ),
  cherrytomato_svg: makeSvg(
    `<radialGradient id="chtGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#fca5a5"/><stop offset="50%" stop-color="#ef4444"/><stop offset="100%" stop-color="#7f1d1d"/></radialGradient>`,
    `<circle cx="50" cy="55" r="25" fill="url(#chtGrad)"/><path d="M 50,30 L 45,20 L 50,10 L 55,20 Z" fill="#166534"/><ellipse cx="40" cy="45" rx="4" ry="8" transform="rotate(-45 40 45)" fill="rgba(255,255,255,0.4)" filter="blur(1px)"/>`
  ),
  cartoncorn_svg: makeSvg(
    `<linearGradient id="canGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#94a3b8"/><stop offset="50%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#475569"/></linearGradient>`,
    `<rect x="25" y="30" width="50" height="60" rx="5" fill="url(#canGrad)"/><rect x="25" y="20" width="50" height="10" fill="#64748b"/><circle cx="50" cy="60" r="15" fill="#facc15"/><circle cx="45" cy="55" r="3" fill="#ca8a04"/><circle cx="55" cy="65" r="3" fill="#ca8a04"/>`
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
appJs = appJs.replace(/\{ primaryAr: "زيتون", synonymsAr: \[\], nameEn: "Olive", icon: "🌱" \}/, `{ primaryAr: "زيتون", synonymsAr: [], nameEn: "Olive", icon: "olive_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "فاصوليا", synonymsAr: \["فاصولية"\], nameEn: "Beans", icon: "🌱" \}/, `{ primaryAr: "فاصوليا", synonymsAr: ["فاصولية"], nameEn: "Beans", icon: "beans_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "بازلاء", synonymsAr: \["بزيلا", "بازلية"\], nameEn: "Peas", icon: "🌱" \}/, `{ primaryAr: "بازلاء", synonymsAr: ["بزيلا", "بازلية"], nameEn: "Peas", icon: "peas_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "حمص", synonymsAr: \[\], nameEn: "Chickpeas", icon: "🌱" \}/, `{ primaryAr: "حمص", synonymsAr: [], nameEn: "Chickpeas", icon: "chickpeas_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "عدس", synonymsAr: \[\], nameEn: "Lentils", icon: "🌱" \}/, `{ primaryAr: "عدس", synonymsAr: [], nameEn: "Lentils", icon: "lentils_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "ماش", synonymsAr: \["ماش أخضر"\], nameEn: "Mung Beans", icon: "🌱" \}/, `{ primaryAr: "ماش", synonymsAr: ["ماش أخضر"], nameEn: "Mung Beans", icon: "mungbeans_svg" }`);

appJs = appJs.replace(/\{ primaryAr: "ليمون مجفف", synonymsAr: \["نومي بصرة", "لومي"\], nameEn: "Dried Lime", icon: "🍋" \}/, `{ primaryAr: "ليمون مجفف", synonymsAr: ["نومي بصرة", "لومي"], nameEn: "Dried Lime", icon: "driedlime_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "يوسفي", synonymsAr: \["لالنكي", "أفندي"\], nameEn: "Tangerine", icon: "🍊" \}/, `{ primaryAr: "يوسفي", synonymsAr: ["لالنكي", "أفندي"], nameEn: "Tangerine", icon: "tangerine_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "طماطة عنقودية", synonymsAr: \["طماطة كرزية", "طماطم كرزية", "شيري طماطم"\], nameEn: "Cherry Tomato", icon: "🍅", countOnly: true \}/, `{ primaryAr: "طماطة عنقودية", synonymsAr: ["طماطة كرزية", "طماطم كرزية", "شيري طماطم"], nameEn: "Cherry Tomato", icon: "cherrytomato_svg", countOnly: true }`);
appJs = appJs.replace(/\{ primaryAr: "ذرة كارتون", synonymsAr: \["ذرة معلبة"\], nameEn: "Carton Corn", icon: "🌽", countOnly: true \}/, `{ primaryAr: "ذرة كارتون", synonymsAr: ["ذرة معلبة"], nameEn: "Carton Corn", icon: "cartoncorn_svg", countOnly: true }`);

fs.writeFileSync('app.js', appJs);
console.log("Updated with unique SVGs for duplicates.");
