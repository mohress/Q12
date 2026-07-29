const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const newSanitizeFunc = `function sanitizeCropIcon(icon, isHtml = true) {
  if (!icon) return '🥦';

  const radishSvg = \`<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.3));" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="radishGrad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#fbcfe8"/>
        <stop offset="20%" stop-color="#f43f5e"/>
        <stop offset="60%" stop-color="#be123c"/>
        <stop offset="100%" stop-color="#881337"/>
      </radialGradient>
      <radialGradient id="radishTip" cx="50%" cy="90%" r="50%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="40%" stop-color="#fdf2f8"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
      <linearGradient id="leafGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4ade80"/>
        <stop offset="100%" stop-color="#166534"/>
      </linearGradient>
    </defs>
    <path d="M 50,85 C 52,95 55,98 60,102" stroke="#e2e8f0" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <path d="M 50,20 C 85,20 95,45 90,65 C 85,85 60,95 50,95 C 40,95 15,85 10,65 C 5,45 15,20 50,20 Z" fill="url(#radishGrad)"/>
    <path d="M 50,20 C 85,20 95,45 90,65 C 85,85 60,95 50,95 C 40,95 15,85 10,65 C 5,45 15,20 50,20 Z" fill="url(#radishTip)"/>
    <ellipse cx="32" cy="38" rx="8" ry="18" transform="rotate(-25 32 38)" fill="rgba(255,255,255,0.7)" filter="blur(1px)"/>
    <ellipse cx="75" cy="55" rx="4" ry="12" transform="rotate(25 75 55)" fill="rgba(255,255,255,0.2)" filter="blur(1px)"/>
    <path d="M 50,22 C 35,5 15,10 10,25 C 5,40 30,25 50,22 Z" fill="url(#leafGrad)"/>
    <path d="M 50,22 C 65,5 85,10 90,25 C 95,40 70,25 50,22 Z" fill="url(#leafGrad)"/>
    <path d="M 50,22 C 45,-2 55,-2 50,22 Z" fill="#22c55e"/>
  </svg>\`;

  const turnipSvg = \`<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.3));" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="turnipGrad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="70%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#cbd5e1"/>
      </radialGradient>
      <linearGradient id="turnipTop" x1="0%" y1="0%" x2="0%" y2="50%">
        <stop offset="0%" stop-color="#a855f7"/>
        <stop offset="60%" stop-color="#d8b4fe"/>
        <stop offset="100%" stop-color="rgba(216,180,254,0)"/>
      </linearGradient>
      <linearGradient id="leafGradTurnip" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4ade80"/>
        <stop offset="100%" stop-color="#14532d"/>
      </linearGradient>
    </defs>
    <path d="M 50,85 C 48,95 45,98 40,102" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <path d="M 50,25 C 80,25 90,45 90,60 C 90,75 75,90 50,90 C 25,90 10,75 10,60 C 10,45 20,25 50,25 Z" fill="url(#turnipGrad)"/>
    <path d="M 50,25 C 80,25 90,45 90,60 C 90,75 75,90 50,90 C 25,90 10,75 10,60 C 10,45 20,25 50,25 Z" fill="url(#turnipTop)"/>
    <ellipse cx="30" cy="40" rx="8" ry="15" transform="rotate(-30 30 40)" fill="rgba(255,255,255,0.8)" filter="blur(1px)"/>
    <path d="M 50,25 C 40,10 20,5 15,15 C 10,25 35,25 50,25 Z" fill="url(#leafGradTurnip)"/>
    <path d="M 50,25 C 60,10 80,5 85,15 C 90,25 65,25 50,25 Z" fill="url(#leafGradTurnip)"/>
    <path d="M 50,25 C 45,5 55,5 50,25 Z" fill="#22c55e"/>
  </svg>\`;

  if (icon === 'radish_svg' || icon === '🌱') {
    // If it is explicitly radish, we use radish
    if (icon === 'radish_svg') {
      if (isHtml) return radishSvg;
      return '🌱';
    }
  }
  if (icon === 'turnip_svg') {
    if (isHtml) return turnipSvg;
    return '🌱';
  }

  const fluentMapping = {
    '🍅': 'Tomato', '🥒': 'Cucumber', '🥔': 'Potato', '🍆': 'Eggplant',
    '🌶️': 'Hot pepper', '🥕': 'Carrot', '🌽': 'Ear of corn', '🍉': 'Watermelon',
    '🍈': 'Melon', '🍊': 'Tangerine', '🍋': 'Lemon', '🍌': 'Banana',
    '🍎': 'Red apple', '🍏': 'Green apple', '🍇': 'Grapes', '🍓': 'Strawberry',
    '🍑': 'Peach', '🍍': 'Pineapple', '🥝': 'Kiwi fruit', '🍐': 'Pear',
    '🥭': 'Mango', '🍒': 'Cherries', '🍄': 'Mushroom', '🥬': 'Leafy green',
    '🥦': 'Broccoli', '🥑': 'Avocado', '🌿': 'Herb', '🌱': 'Seedling',
    '🌴': 'Palm tree', '🌰': 'Chestnut', '🥥': 'Coconut', '🍠': 'Sweet potato',
    '🎃': 'Jack-o-lantern', '🌵': 'Cactus', '🧅': 'Onion', '🧄': 'Garlic',
    '🫑': 'Bell pepper', '🫚': 'Ginger root',
    'onion_svg': 'Onion', 'garlic_svg': 'Garlic', 'bell_pepper_svg': 'Bell pepper'
  };

  let fluentName = null;
  if (fluentMapping[icon]) {
    fluentName = fluentMapping[icon];
  } else if (typeof icon === 'string') {
    for (const [key, val] of Object.entries(fluentMapping)) {
      if (icon.includes(key)) {
        fluentName = val;
        break;
      }
    }
  }

  if (fluentName) {
    if (isHtml) {
      const fileName = fluentName.toLowerCase().replace(/ /g, '_') + '_3d.png';
      const encodedDirName = encodeURIComponent(fluentName);
      const url = \`https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/\${encodedDirName}/3D/\${fileName}\`;
      return \`<img src="\${url}" style="width:1.4em; height:1.4em; vertical-align:middle; display:inline-block; margin:0 0.1em; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.15));" loading="lazy" />\`;
    }
    return icon.length > 3 ? '🌱' : icon; // If it's a long string like onion_svg, return seedling, else the emoji
  }

  if (typeof icon === 'string' && (icon.trim().startsWith('<svg') || icon.trim().startsWith('<img'))) {
    if (isHtml) return icon;
    return '🌱';
  }

  return isHtml ? \`<span style="font-size: 1.2em; display:inline-block; vertical-align:middle;">\${icon}</span>\` : icon;
}`;

const startIndex = appJs.indexOf('function sanitizeCropIcon(icon, isHtml = true) {');
const endIndexStr = "  return '🥦';\n}";
let endIndex = appJs.indexOf(endIndexStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  endIndex += endIndexStr.length;
  appJs = appJs.slice(0, startIndex) + newSanitizeFunc + appJs.slice(endIndex);
  fs.writeFileSync('app.js', appJs);
  console.log("Successfully replaced sanitizeCropIcon");
} else {
  console.log("Failed to find boundaries");
  console.log("Start:", startIndex, "End:", endIndex);
}
