const fs = require('fs');

function makeSvg(defs, body) {
  return `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${body}</svg>`;
}

function roundFruit(id, colors, hasLeaf = true) {
  const defs = `
    <radialGradient id="${id}Grad" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="${colors[0]}"/>
      <stop offset="40%" stop-color="${colors[1]}"/>
      <stop offset="80%" stop-color="${colors[2]}"/>
      <stop offset="100%" stop-color="${colors[3]}"/>
    </radialGradient>
  `;
  const body = `
    <circle cx="50" cy="55" r="40" fill="url(#${id}Grad)"/>
    <ellipse cx="35" cy="35" rx="8" ry="14" transform="rotate(-45 35 35)" fill="rgba(255,255,255,0.6)" filter="blur(1px)"/>
    ${hasLeaf ? `<path d="M 50,15 C 30,5 20,20 50,25 Z" fill="#4ade80"/><path d="M 50,25 C 48,15 52,15 50,15" stroke="#166534" stroke-width="2" fill="none"/>` : ''}
  `;
  return makeSvg(defs, body);
}

function leafyBundle(id, colors) {
  const defs = `
    <linearGradient id="${id}Grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${colors[0]}"/>
      <stop offset="100%" stop-color="${colors[1]}"/>
    </linearGradient>
  `;
  const body = `
    <path d="M 45,90 L 55,90 L 60,30 C 80,20 90,40 70,50 C 90,60 80,80 60,70 L 55,90" fill="url(#${id}Grad)"/>
    <path d="M 45,90 L 40,30 C 20,20 10,40 30,50 C 10,60 20,80 40,70 L 45,90" fill="url(#${id}Grad)"/>
    <path d="M 50,95 L 45,20 C 30,5 70,5 55,20 L 50,95" fill="url(#${id}Grad)"/>
    <path d="M 45,90 C 45,95 55,95 55,90 Z" fill="${colors[2]}"/>
  `;
  return makeSvg(defs, body);
}

function elongated(id, colors, curve = 0) {
  const defs = `
    <linearGradient id="${id}Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors[0]}"/>
      <stop offset="50%" stop-color="${colors[1]}"/>
      <stop offset="100%" stop-color="${colors[2]}"/>
    </linearGradient>
  `;
  const body = `
    <path d="M 20,20 Q ${50 + curve},50 80,80 Q ${60 + curve},90 20,20" fill="url(#${id}Grad)"/>
    <path d="M 15,15 L 25,25" stroke="#166534" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="40" cy="40" rx="4" ry="15" transform="rotate(-45 40 40)" fill="rgba(255,255,255,0.4)" filter="blur(1px)"/>
  `;
  return makeSvg(defs, body);
}

function pod(id, colors) {
  const defs = `
    <linearGradient id="${id}Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors[0]}"/>
      <stop offset="100%" stop-color="${colors[1]}"/>
    </linearGradient>
  `;
  const body = `
    <path d="M 10,90 C 20,40 60,10 90,10 C 80,50 40,90 10,90 Z" fill="url(#${id}Grad)"/>
    <ellipse cx="35" cy="65" rx="3" ry="12" transform="rotate(45 35 65)" fill="rgba(255,255,255,0.3)" filter="blur(1px)"/>
  `;
  return makeSvg(defs, body);
}

function bunch(id, colors) {
  const defs = `
    <radialGradient id="${id}Grad" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="${colors[0]}"/>
      <stop offset="100%" stop-color="${colors[1]}"/>
    </radialGradient>
  `;
  const body = `
    <circle cx="40" cy="40" r="15" fill="url(#${id}Grad)"/>
    <circle cx="60" cy="45" r="15" fill="url(#${id}Grad)"/>
    <circle cx="35" cy="60" r="15" fill="url(#${id}Grad)"/>
    <circle cx="55" cy="65" r="15" fill="url(#${id}Grad)"/>
    <circle cx="50" cy="80" r="15" fill="url(#${id}Grad)"/>
    <circle cx="70" cy="60" r="15" fill="url(#${id}Grad)"/>
    <path d="M 50,15 C 45,25 55,25 50,35" stroke="#166534" stroke-width="4" fill="none"/>
  `;
  return makeSvg(defs, body);
}

const icons = {
  pomegranate_svg: roundFruit('pom', ['#fecdd3', '#f43f5e', '#be123c', '#881337'], false),
  loquat_svg: roundFruit('loq', ['#fef08a', '#facc15', '#eab308', '#a16207'], true),
  grapefruit_svg: roundFruit('gpf', ['#fed7aa', '#fb923c', '#ea580c', '#9a3412'], true),
  jujube_svg: roundFruit('juj', ['#fca5a5', '#ef4444', '#b91c1c', '#7f1d1d'], false),
  persimmon_svg: roundFruit('per', ['#fdba74', '#f97316', '#c2410c', '#7c2d12'], true),
  mangosteen_svg: roundFruit('man', ['#d8b4fe', '#a855f7', '#7e22ce', '#4c1d95'], true),
  rambutan_svg: roundFruit('ram', ['#fca5a5', '#ef4444', '#b91c1c', '#7f1d1d'], true),
  quince_svg: roundFruit('qui', ['#fef08a', '#fde047', '#eab308', '#a16207'], true),
  greencherryplum_svg: roundFruit('gcp', ['#bbf7d0', '#4ade80', '#16a34a', '#14532d'], false),
  guava_svg: roundFruit('gua', ['#dcfce7', '#86efac', '#22c55e', '#14532d'], true),
  apricot_svg: roundFruit('apr', ['#fed7aa', '#fb923c', '#ea580c', '#9a3412'], true),
  plum_svg: roundFruit('plu', ['#e9d5ff', '#c084fc', '#9333ea', '#581c87'], true),
  yellowmelon_svg: roundFruit('yme', ['#fef08a', '#fde047', '#eab308', '#a16207'], false),
  passionfruit_svg: roundFruit('pas', ['#e9d5ff', '#c084fc', '#9333ea', '#581c87'], false),
  
  spinach_svg: leafyBundle('spi', ['#4ade80', '#166534', '#bbf7d0']),
  swisschard_svg: leafyBundle('sch', ['#86efac', '#15803d', '#fca5a5']), // red stems
  celery_svg: leafyBundle('cel', ['#bbf7d0', '#22c55e', '#86efac']),
  watercress_svg: leafyBundle('wat', ['#4ade80', '#14532d', '#bbf7d0']),
  coriander_svg: leafyBundle('cor', ['#86efac', '#16a34a', '#dcfce7']),
  parsley_svg: leafyBundle('par', ['#4ade80', '#15803d', '#bbf7d0']),
  mint_svg: leafyBundle('min', ['#86efac', '#16a34a', '#bbf7d0']),
  dill_svg: leafyBundle('dil', ['#bbf7d0', '#22c55e', '#dcfce7']),
  basil_svg: leafyBundle('bas', ['#4ade80', '#15803d', '#86efac']),
  arugula_svg: leafyBundle('aru', ['#86efac', '#166534', '#bbf7d0']),
  fenugreek_svg: leafyBundle('fen', ['#bbf7d0', '#22c55e', '#dcfce7']),
  thyme_svg: leafyBundle('thy', ['#4ade80', '#14532d', '#86efac']),
  
  okra_svg: elongated('okr', ['#86efac', '#22c55e', '#14532d'], 0),
  zucchini_svg: elongated('zuc', ['#4ade80', '#16a34a', '#14532d'], 10),
  wildcucumber_svg: elongated('wcu', ['#bbf7d0', '#4ade80', '#15803d'], 5),
  leek_svg: elongated('lee', ['#fef08a', '#86efac', '#166534'], 0),
  asparagus_svg: elongated('asp', ['#bbf7d0', '#22c55e', '#14532d'], 0),
  
  greenbeans_svg: pod('grb', ['#86efac', '#16a34a']),
  broadbeans_svg: pod('brb', ['#4ade80', '#15803d']),
  carob_svg: pod('car', ['#78350f', '#451a03']),
  
  fig_svg: roundFruit('fig', ['#d8b4fe', '#a855f7', '#7e22ce', '#4c1d95'], true),
  berry_svg: bunch('ber', ['#fca5a5', '#dc2626']),
  blackberry_svg: bunch('blk', ['#d8b4fe', '#7e22ce']),
  truffle_svg: roundFruit('tru', ['#d6d3d1', '#a8a29e', '#78716c', '#44403c'], false),
  dates_svg: pod('dat', ['#92400e', '#451a03']),
  papaya_svg: elongated('pap', ['#fef08a', '#facc15', '#ca8a04'], 20),
  pricklypear_svg: roundFruit('prp', ['#fde047', '#eab308', '#a16207', '#713f12'], false),
  turmeric_svg: roundFruit('tur', ['#fef08a', '#facc15', '#ca8a04', '#854d0e'], false),
  beetroot_svg: roundFruit('bee', ['#fbcfe8', '#f43f5e', '#be123c', '#881337'], true)
};

fs.writeFileSync('generated_svgs.json', JSON.stringify(icons, null, 2));
console.log("Done");
