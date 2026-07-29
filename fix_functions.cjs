const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const funcsToAdd = `
function findCropSuggestion(cropType) {
  if (!cropType) return null;
  const cleanType = cropType.toString().trim().toLowerCase();
  
  for (const crop of CROP_SUGGESTIONS) {
    if (crop.primaryAr.toLowerCase() === cleanType) return crop;
    if (crop.nameEn && crop.nameEn.toLowerCase() === cleanType) return crop;
    if (crop.synonymsAr) {
      for (const syn of crop.synonymsAr) {
        if (syn.toLowerCase() === cleanType) return crop;
      }
    }
  }
  
  try {
    const customCrops = JSON.parse(localStorage.getItem('CUSTOM_CROPS') || '[]');
    for (const crop of customCrops) {
      if (crop.primaryAr && crop.primaryAr.toLowerCase() === cleanType) return crop;
    }
  } catch (e) {}

  return null;
}

function getCropIcon(cropType, isHtml = true) {
  if (!cropType) return '🥦';
  
  const cleanStr = cropType.toString().trim();
  const emojiMatch = cleanStr.match(/^([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/u);
  if (emojiMatch) {
    return sanitizeCropIcon(emojiMatch[0], isHtml);
  }

  const crop = findCropSuggestion(cropType);
  if (crop && crop.icon) {
    return sanitizeCropIcon(crop.icon, isHtml);
  }

  return '🥦';
}
`;

const insertIndex = appJs.indexOf('function getCropUnitType(cropType) {');
if (insertIndex !== -1) {
  appJs = appJs.slice(0, insertIndex) + funcsToAdd + appJs.slice(insertIndex);
  fs.writeFileSync('app.js', appJs);
  console.log("Functions added back successfully.");
} else {
  console.log("Could not find insertion point.");
}
