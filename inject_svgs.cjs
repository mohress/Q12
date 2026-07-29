const fs = require('fs');

const generatedSvgs = JSON.parse(fs.readFileSync('generated_svgs.json', 'utf8'));
let appJs = fs.readFileSync('app.js', 'utf8');

let codeToInsert = `\nconst customSvgs = {\n`;
for (const [key, value] of Object.entries(generatedSvgs)) {
  codeToInsert += `  '${key}': \`${value}\`,\n`;
}
codeToInsert += `};\n`;

// Also, update the CROP_SUGGESTIONS array to use these keys instead of emojis, and remove the nuts
appJs = appJs.replace(/\{ primaryAr: "رمان", synonymsAr: \[\], nameEn: "Pomegranate", icon: "🍎" \}/, `{ primaryAr: "رمان", synonymsAr: [], nameEn: "Pomegranate", icon: "pomegranate_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "أسكي دنيا", synonymsAr: \["أكي دنيا", "يني دنيا", "دنيا"\], nameEn: "Loquat", icon: "🍊" \}/, `{ primaryAr: "أسكي دنيا", synonymsAr: ["أكي دنيا", "يني دنيا", "دنيا"], nameEn: "Loquat", icon: "loquat_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "جريب فروت", synonymsAr: \["سندي"\], nameEn: "Grapefruit", icon: "🍊" \}/, `{ primaryAr: "جريب فروت", synonymsAr: ["سندي"], nameEn: "Grapefruit", icon: "grapefruit_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "نبق", synonymsAr: \["كنار", "سدر"\], nameEn: "Jujube", icon: "🍊" \}/, `{ primaryAr: "نبق", synonymsAr: ["كنار", "سدر"], nameEn: "Jujube", icon: "jujube_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "كاكا", synonymsAr: \["كاكي", "كاكا", "الكاكا", "خرما"\], nameEn: "Persimmon", icon: "🍊" \}/, `{ primaryAr: "كاكا", synonymsAr: ["كاكي", "كاكا", "الكاكا", "خرما"], nameEn: "Persimmon", icon: "persimmon_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "مانكو ستين", synonymsAr: \["مانغوستين"\], nameEn: "Mangosteen", icon: "🍊", countOnly: true \}/, `{ primaryAr: "مانكو ستين", synonymsAr: ["مانغوستين"], nameEn: "Mangosteen", icon: "mangosteen_svg", countOnly: true }`);
appJs = appJs.replace(/\{ primaryAr: "رامبوتان", synonymsAr: \[\], nameEn: "Rambutan", icon: "🍊", countOnly: true \}/, `{ primaryAr: "رامبوتان", synonymsAr: [], nameEn: "Rambutan", icon: "rambutan_svg", countOnly: true }`);
appJs = appJs.replace(/\{ primaryAr: "سفرجل", synonymsAr: \[\], nameEn: "Quince", icon: "🍏" \}/, `{ primaryAr: "سفرجل", synonymsAr: [], nameEn: "Quince", icon: "quince_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "جانرك", synonymsAr: \["كرز أخضر"\], nameEn: "Green Cherry Plum", icon: "🍏" \}/, `{ primaryAr: "جانرك", synonymsAr: ["كرز أخضر"], nameEn: "Green Cherry Plum", icon: "greencherryplum_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "جوافة", synonymsAr: \[\], nameEn: "Guava", icon: "🍐" \}/, `{ primaryAr: "جوافة", synonymsAr: [], nameEn: "Guava", icon: "guava_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "مشمش", synonymsAr: \[\], nameEn: "Apricot", icon: "🍑" \}/, `{ primaryAr: "مشمش", synonymsAr: [], nameEn: "Apricot", icon: "apricot_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "برقوق", synonymsAr: \["ألوجة", "آلو", "كوجة"\], nameEn: "Plum", icon: "🍑" \}/, `{ primaryAr: "برقوق", synonymsAr: ["ألوجة", "آلو", "كوجة"], nameEn: "Plum", icon: "plum_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "بطيخ أصفر", synonymsAr: \["بطيخ أصفر", "البطيخ الأصفر", "شمام أصفر", "شمام"\], nameEn: "Yellow Melon", icon: "🍈" \}/, `{ primaryAr: "بطيخ أصفر", synonymsAr: ["بطيخ أصفر", "البطيخ الأصفر", "شمام أصفر", "شمام"], nameEn: "Yellow Melon", icon: "yellowmelon_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "باشن فروت", synonymsAr: \["فاكهة العاطفة"\], nameEn: "Passion Fruit", icon: "🍇", countOnly: true \}/, `{ primaryAr: "باشن فروت", synonymsAr: ["فاكهة العاطفة"], nameEn: "Passion Fruit", icon: "passionfruit_svg", countOnly: true }`);
appJs = appJs.replace(/\{ primaryAr: "سبانخ", synonymsAr: \["سبيناغ"\], nameEn: "Spinach", icon: "🥬" \}/, `{ primaryAr: "سبانخ", synonymsAr: ["سبيناغ"], nameEn: "Spinach", icon: "spinach_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "سلق", synonymsAr: \[\], nameEn: "Swiss Chard", icon: "🥬" \}/, `{ primaryAr: "سلق", synonymsAr: [], nameEn: "Swiss Chard", icon: "swisschard_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "كرفس", synonymsAr: \[\], nameEn: "Celery", icon: "🌿" \}/, `{ primaryAr: "كرفس", synonymsAr: [], nameEn: "Celery", icon: "celery_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "رشاد", synonymsAr: \[\], nameEn: "Watercress", icon: "🌿" \}/, `{ primaryAr: "رشاد", synonymsAr: [], nameEn: "Watercress", icon: "watercress_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "كزبرة", synonymsAr: \[\], nameEn: "Coriander", icon: "🌿" \}/, `{ primaryAr: "كزبرة", synonymsAr: [], nameEn: "Coriander", icon: "coriander_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "بقدونس", synonymsAr: \["معدنوس"\], nameEn: "Parsley", icon: "🌿" \}/, `{ primaryAr: "بقدونس", synonymsAr: ["معدنوس"], nameEn: "Parsley", icon: "parsley_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "نعناع", synonymsAr: \[\], nameEn: "Mint", icon: "🌿" \}/, `{ primaryAr: "نعناع", synonymsAr: [], nameEn: "Mint", icon: "mint_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "شبت", synonymsAr: \["شبنت"\], nameEn: "Dill", icon: "🌿" \}/, `{ primaryAr: "شبت", synonymsAr: ["شبنت"], nameEn: "Dill", icon: "dill_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "ريحان", synonymsAr: \[\], nameEn: "Basil", icon: "🌿" \}/, `{ primaryAr: "ريحان", synonymsAr: [], nameEn: "Basil", icon: "basil_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "جرجير", synonymsAr: \[\], nameEn: "Arugula", icon: "🌿" \}/, `{ primaryAr: "جرجير", synonymsAr: [], nameEn: "Arugula", icon: "arugula_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "حلبة", synonymsAr: \[\], nameEn: "Fenugreek", icon: "🌿" \}/, `{ primaryAr: "حلبة", synonymsAr: [], nameEn: "Fenugreek", icon: "fenugreek_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "زعتر", synonymsAr: \[\], nameEn: "Thyme", icon: "🌿" \}/, `{ primaryAr: "زعتر", synonymsAr: [], nameEn: "Thyme", icon: "thyme_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "بامية", synonymsAr: \["باميا"\], nameEn: "Okra", icon: "🥬" \}/, `{ primaryAr: "بامية", synonymsAr: ["باميا"], nameEn: "Okra", icon: "okra_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "كوسى", synonymsAr: \["شجر", "كوسا"\], nameEn: "Zucchini", icon: "🥒" \}/, `{ primaryAr: "كوسى", synonymsAr: ["شجر", "كوسا"], nameEn: "Zucchini", icon: "zucchini_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "تعروز", synonymsAr: \["تعروز", "ترعوز", "طرح", "قتة"\], nameEn: "Wild Cucumber", icon: "🥒" \}/, `{ primaryAr: "تعروز", synonymsAr: ["تعروز", "ترعوز", "طرح", "قتة"], nameEn: "Wild Cucumber", icon: "wildcucumber_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "كراث", synonymsAr: \[\], nameEn: "Leek", icon: "🌱" \}/, `{ primaryAr: "كراث", synonymsAr: [], nameEn: "Leek", icon: "leek_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "هليون", synonymsAr: \[\], nameEn: "Asparagus", icon: "🌱" \}/, `{ primaryAr: "هليون", synonymsAr: [], nameEn: "Asparagus", icon: "asparagus_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "لوبيا", synonymsAr: \[\], nameEn: "Green Beans", icon: "🌱" \}/, `{ primaryAr: "لوبيا", synonymsAr: [], nameEn: "Green Beans", icon: "greenbeans_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "فول", synonymsAr: \["باقلاء", "باجلا", "باجلاء"\], nameEn: "Broad Beans", icon: "🌱" \}/, `{ primaryAr: "فول", synonymsAr: ["باقلاء", "باجلا", "باجلاء"], nameEn: "Broad Beans", icon: "broadbeans_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "خرنوب", synonymsAr: \[\], nameEn: "Carob", icon: "🌱" \}/, `{ primaryAr: "خرنوب", synonymsAr: [], nameEn: "Carob", icon: "carob_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "تين", synonymsAr: \[\], nameEn: "Fig", icon: "🍇" \}/, `{ primaryAr: "تين", synonymsAr: [], nameEn: "Fig", icon: "fig_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "توت", synonymsAr: \["توث"\], nameEn: "Berry", icon: "🍇" \}/, `{ primaryAr: "توت", synonymsAr: ["توث"], nameEn: "Berry", icon: "berry_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "توت أسود", synonymsAr: \["عليج"\], nameEn: "Blackberry", icon: "🍇" \}/, `{ primaryAr: "توت أسود", synonymsAr: ["عليج"], nameEn: "Blackberry", icon: "blackberry_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "كماة", synonymsAr: \["چما"\], nameEn: "Truffle", icon: "🍄" \}/, `{ primaryAr: "كماة", synonymsAr: ["چما"], nameEn: "Truffle", icon: "truffle_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "تمر", synonymsAr: \[\], nameEn: "Dates", icon: "🌴" \}/, `{ primaryAr: "تمر", synonymsAr: [], nameEn: "Dates", icon: "dates_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "بابايا", synonymsAr: \[\], nameEn: "Papaya", icon: "🥭" \}/, `{ primaryAr: "بابايا", synonymsAr: [], nameEn: "Papaya", icon: "papaya_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "تين شوكي", synonymsAr: \["صبار"\], nameEn: "Prickly Pear", icon: "🌵" \}/, `{ primaryAr: "تين شوكي", synonymsAr: ["صبار"], nameEn: "Prickly Pear", icon: "pricklypear_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "كركم", synonymsAr: \[\], nameEn: "Turmeric", icon: "🫚" \}/, `{ primaryAr: "كركم", synonymsAr: [], nameEn: "Turmeric", icon: "turmeric_svg" }`);
appJs = appJs.replace(/\{ primaryAr: "شمندر", synonymsAr: \["شوندر", "بنجر"\], nameEn: "Beetroot", icon: "🍠" \}/, `{ primaryAr: "شمندر", synonymsAr: ["شوندر", "بنجر"], nameEn: "Beetroot", icon: "beetroot_svg" }`);

// Remove nuts
const nutLines = [
  '  { primaryAr: "كستناء", synonymsAr: ["أبو فروة"], nameEn: "Chestnut", icon: "🌰" },\n',
  '  { primaryAr: "لوز", synonymsAr: [], nameEn: "Almonds", icon: "🌰" },\n',
  '  { primaryAr: "جوز", synonymsAr: [], nameEn: "Walnuts", icon: "🌰" },\n',
  '  { primaryAr: "فستق", synonymsAr: [], nameEn: "Pistachio", icon: "🌰" },\n',
  '  { primaryAr: "بندق", synonymsAr: [], nameEn: "Hazelnut", icon: "🌰" },\n'
];
nutLines.forEach(line => {
  appJs = appJs.replace(line, '');
});

// Update sanitizeCropIcon
const sanitizeMatch = appJs.match(/function sanitizeCropIcon\(icon, isHtml = true\) \{([\s\S]*?)return isHtml \? `<span[^>]*>\$\{icon\}<\/span>` : icon;\n\}/);

if (sanitizeMatch) {
  const newSanitize = `function sanitizeCropIcon(icon, isHtml = true) {
  if (!icon) return '🥦';

  if (typeof customSvgs !== 'undefined' && customSvgs[icon]) {
    if (isHtml) return customSvgs[icon];
    return '🌱';
  }

${sanitizeMatch[1].replace(/const radishSvg[\s\S]*if \(icon === 'turnip_svg'\) \{\s*if \(isHtml\) return turnipSvg;\s*return '🌱';\s*\}/, '')}
  return isHtml ? \`<span style="font-size: 1.2em; display:inline-block; vertical-align:middle;">\${icon}</span>\` : icon;
}`;

  appJs = appJs.replace(sanitizeMatch[0], newSanitize);
}

const addIndex = appJs.indexOf('const CROP_SUGGESTIONS = [');
appJs = appJs.slice(0, addIndex) + codeToInsert + appJs.slice(addIndex);

fs.writeFileSync('app.js', appJs);
console.log("Updated app.js with SVG icons.");
