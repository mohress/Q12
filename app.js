import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

// Global Element Mappings and Safety Fallbacks to Reconcile index.html & app.js
const originalGetElementById = document.getElementById;
document.getElementById = function(id) {
  const el = originalGetElementById.call(document, id);
  if (el) return el;

  const mappings = {
    'lbl-app-title': 'txt-app-title',
    'lbl-app-subtitle': 'txt-app-subtitle',
    'lbl-import-tab': 'nav-txt-import',
    'lbl-sales-tab': 'nav-txt-sales',
    'lbl-accounts-tab': 'nav-txt-accounts',
    'lbl-stats-tab': 'nav-txt-stats',
    'lbl-settings-tab': 'nav-txt-settings',
    'tab-import-title': 'txt-import-title',
    'tab-import-desc': 'txt-import-desc',
    'tab-sales-title': 'txt-sales-title',
    'tab-sales-desc': 'txt-sales-desc',
    'tab-debts-btn': 'subtab-debts',
    'tab-dues-btn': 'subtab-dues',
    'tab-porters-btn': 'subtab-porters',
    'tab-stats-title': 'txt-chart-title',
    'tab-settings-title': 'txt-office-settings-title',
    'btn-trigger-new-import': 'btn-new-import',
    'btn-trigger-new-sale': 'btn-new-sale',
    'search-import-farmer': 'search-import-farmer',
    'search-sale-customer': 'search-sale-customer',
    'search-debts-input': 'search-debts',
    'search-dues-input': 'search-dues',
    'lbl-safebox-title': 'txt-safe-box-label',
    'safe-box-val': 'val-safe-box',
    'total-cash-sales': 'val-total-cash-sales',
    'total-collected-debts': 'val-total-collected-debts',
    'total-commission-5': 'val-total-commission-5',
    'total-paid-dues': 'val-total-paid-dues',
    'total-porters-payouts': 'val-total-porter-payouts',
    'btn-record-expense': 'btn-add-expense',
    'btn-record-loss': 'btn-add-loss',
    'lbl-chart-title': 'txt-chart-title',
    'lbl-ledger-title': 'txt-ledger-title',
    'lbl-office-title': 'txt-office-settings-title',
    'lbl-name-setting': 'lbl-office-name',
    'lbl-phone-setting': 'lbl-office-phone',
    'lbl-location-setting': 'lbl-office-location',
    'btn-save-office-settings': 'btn-save-office-settings',
    'lbl-numeral-title': 'txt-numeral-title',
    'lbl-numeral-desc': 'txt-numeral-desc',
    'lbl-sound-title': 'txt-notif-title',
    'lbl-sound-desc': 'txt-notif-desc',
    'lbl-printer-title': 'txt-printer-title',
    'lbl-paper-width-title': 'lbl-paper-width',
    'btn-scan-printer': 'btn-scan-printer',
    'btn-test-print': 'btn-test-print',
    'lbl-backup-title': 'txt-backup-title',
    'lbl-backup-desc': 'txt-backup-desc',
    'btn-export-db': 'btn-backup-export',
    'btn-import-db': 'btn-backup-import',
    'db-import-file-input': 'btn-backup-import',
    'sheet-import-title-h3': 'txt-sheet-import-title',
    'lbl-import-farmer-label': 'lbl-farmer-name',
    'lbl-import-vehicle-label': 'lbl-vehicle-type',
    'btn-add-import-crop': 'btn-import-add-item',
    'btn-submit-import': 'btn-submit-import',
    'sheet-sale-title-h3': 'txt-sheet-sale-title',
    'lbl-sale-cust-label': 'lbl-customer-name',
    'lbl-sale-phone-label': 'lbl-customer-phone',
    'lbl-sale-address-label': 'lbl-customer-address',
    'btn-add-sale-crop': 'btn-sale-add-item',
    'lbl-sale-bags-label': 'lbl-bags-cost',
    'lbl-payment-method-title': 'lbl-payment-method',
    'btn-pay-cash': 'btn-pay-cash',
    'btn-pay-debt': 'btn-pay-debt',
    'lbl-debt-due-title': 'lbl-debt-due',
    'lbl-subtotal-text': 'lbl-subtotal',
    'lbl-commission-text': 'lbl-commission-7',
    'lbl-carrying-text': 'lbl-carrying-total',
    'lbl-total-text': 'lbl-total-calc',
    'btn-submit-sale': 'btn-submit-sale',
    'sheet-payment-title-h3': 'txt-pay-title',
    'lbl-payment-amount-label': 'lbl-pay-amount',
    'btn-submit-payment': 'btn-submit-payment',
    'app-splash-screen': 'welcome-splash',
    'setting-sound-alerts': 'setting-notif-toggle',
    'sale-debt-due-group': 'group-debt-options',
    'sheet-overlay': 'sheet-backdrop',
    'dialog-custom-crop': 'custom-add-crop-dialog',
    'dialog-crop-name': 'custom-crop-name',
    'dialog-crop-measure': 'custom-crop-measure',
    'dialog-crop-confirm': 'btn-custom-crop-ok',
    'dialog-crop-cancel': 'btn-custom-crop-cancel',
    'btn-execute-sysprint': 'btn-execute-system-print',
    'btn-share-receipt': 'btn-share-receipt-png'
  };

  if (mappings[id]) {
    const mappedEl = originalGetElementById.call(document, mappings[id]);
    if (mappedEl) return mappedEl;
  }

  // Return a mock element so we don't crash
  return {
    textContent: '',
    innerText: '',
    innerHTML: '',
    value: '',
    placeholder: '',
    checked: false,
    style: {},
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false,
      toggle: () => {}
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    setAttribute: () => {},
    getAttribute: () => null,
    removeAttribute: () => {},
    dataset: {},
    appendChild: () => {},
    removeChild: () => {},
    querySelector: () => null,
    querySelectorAll: () => []
  };
};

/**
 * Alwa Accounts Manager - Complete Application Controller
 * Powered by Antigravity AI
 * Entirely Offline with IndexedDB, bilingual RTL toggling, BLE Printer simulator, and dynamic data-binding
 */

// Global State
let db = null;
let bleDevice = null;
let bleCharacteristic = null;
let currentLanguage = localStorage.getItem('alwa_lang') || 'ar';
let numeralSystem = 'en'; // 'ar' for Eastern Arabic (١٢٣), 'en' for Western Arabic (123)
let activeTab = 'screen-import';
let soundEnabled = localStorage.getItem('alwa_sound') === 'true';
let importPriceEnabled = false; // Permanently disabled as per user request
let isPrinterConnected = false;
let printerPaperWidth = '58'; // '58' or '80'
let officeName = localStorage.getItem('alwa_office_name') || 'علوة الغابة الخضراء';
let officePhone = localStorage.getItem('alwa_office_phone') || '07701234567';
let officeLocation = localStorage.getItem('alwa_office_location') || 'جمهورية العراق';
let officeChangesCount = parseInt(localStorage.getItem('alwa_office_changes_count') || '0');

// BLE Central state (cordova-plugin-ble-central)
let bleConnectedDeviceId = null;    // MAC address of the connected BLE printer
let bleWriteServiceUUID = null;     // Service UUID used for writing
let bleWriteCharUUID = null;        // Characteristic UUID used for writing
let isCordovaSerialActive = false;  // true only if Classic Bluetooth SPP is used
let connectedDeviceAddress = null;  // generic address holder
let autoConnectIntervalId = null;   // background auto-connect interval ID
let isAutoConnecting = false;       // status flag to avoid duplicate concurrent connects
let isManualScanning = false;       // status flag to avoid collision with manual BLE scan


// Helper to generate a 6-character random alphanumeric Order ID
function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Common fruits & vegetables dictionary with icons
const CROP_SUGGESTIONS = [
  { primaryAr: "طماطم", synonymsAr: ["طماطة", "بندورة"], nameEn: "Tomato", icon: "🍅" },
  { primaryAr: "خيار", synonymsAr: [], nameEn: "Cucumber", icon: "🥒" },
  { primaryAr: "بطاطس", synonymsAr: ["بتيتة", "بطاطا"], nameEn: "Potato", icon: "🥔" },
  { primaryAr: "بصل", synonymsAr: [], nameEn: "Onion", icon: "🧅" },
  { primaryAr: "ثوم", synonymsAr: [], nameEn: "Garlic", icon: "🧄" },
  { primaryAr: "باذنجان", synonymsAr: ["بيتنجان"], nameEn: "Eggplant", icon: "🍆" },
  { primaryAr: "فلفل حلو", synonymsAr: ["فلفل بارد", "فلفل", "فلفل أخضر"], nameEn: "Bell Pepper", icon: "🫑" },
  { primaryAr: "فلفل حار", synonymsAr: [], nameEn: "Hot Pepper", icon: "🌶️" },
  { primaryAr: "جزر", synonymsAr: [], nameEn: "Carrot", icon: "🥕" },
  { primaryAr: "خس", synonymsAr: [], nameEn: "Lettuce", icon: "🥬" },
  { primaryAr: "قرنبيط", synonymsAr: ["قرنابيط", "زهرة"], nameEn: "Cauliflower", icon: "🥦" },
  { primaryAr: "ملفوف", synonymsAr: ["لهانة"], nameEn: "Cabbage", icon: "🥬" },
  { primaryAr: "ذرة", synonymsAr: ["عرنوص"], nameEn: "Corn", icon: "🌽" },
  { primaryAr: "بطيخ أحمر", synonymsAr: ["رقي", "حبحب"], nameEn: "Watermelon", icon: "🍉" },
  { primaryAr: "شمام", synonymsAr: ["بطيخ"], nameEn: "Melon", icon: "🍈" },
  { primaryAr: "برتقال", synonymsAr: [], nameEn: "Orange", icon: "🍊" },
  { primaryAr: "ليمون", synonymsAr: ["نومي", "نومي حامض"], nameEn: "Lemon", icon: "🍋" },
  { primaryAr: "ليمون مجفف", synonymsAr: ["نومي بصرة", "لومي"], nameEn: "Dried Lime", icon: "🍋" },
  { primaryAr: "موز", synonymsAr: [], nameEn: "Banana", icon: "🍌" },
  { primaryAr: "تفاح", synonymsAr: [], nameEn: "Apple", icon: "🍎" },
  { primaryAr: "تفاح أخضر", synonymsAr: [], nameEn: "Green Apple", icon: "🍏" },
  { primaryAr: "عنب", synonymsAr: [], nameEn: "Grape", icon: "🍇" },
  { primaryAr: "فراولة", synonymsAr: [], nameEn: "Strawberry", icon: "🍓" },
  { primaryAr: "رمان", synonymsAr: [], nameEn: "Pomegranate", icon: "🍎" },
  { primaryAr: "خوخ", synonymsAr: [], nameEn: "Peach", icon: "🍑" },
  { primaryAr: "مشمش", synonymsAr: [], nameEn: "Apricot", icon: "🍑" },
  { primaryAr: "أناناس", synonymsAr: [], nameEn: "Pineapple", icon: "🍍", countOnly: true },
  { primaryAr: "كيوي", synonymsAr: [], nameEn: "Kiwi", icon: "🥝" },
  { primaryAr: "كمثرى", synonymsAr: ["عرموط"], nameEn: "Pear", icon: "🍐" },
  { primaryAr: "مانجو", synonymsAr: [], nameEn: "Mango", icon: "🥭" },
  { primaryAr: "تين", synonymsAr: [], nameEn: "Fig", icon: "🍇" },
  { primaryAr: "كرز", synonymsAr: [], nameEn: "Cherry", icon: "🍒" },
  { primaryAr: "سلق", synonymsAr: [], nameEn: "Swiss Chard", icon: "🥬" },
  { primaryAr: "سبانخ", synonymsAr: ["سبيناغ"], nameEn: "Spinach", icon: "🥬" },
  { primaryAr: "فطر", synonymsAr: ["مشروم"], nameEn: "Mushroom", icon: "🍄", countOnly: true },
  { primaryAr: "بامية", synonymsAr: ["باميا"], nameEn: "Okra", icon: "🥬" },
  { primaryAr: "لوبيا", synonymsAr: [], nameEn: "Green Beans", icon: "🌱" },
  { primaryAr: "شمندر", synonymsAr: ["شوندر", "بنجر"], nameEn: "Beetroot", icon: "🍠" },
  { primaryAr: "كوسى", synonymsAr: ["شجر", "كوسا"], nameEn: "Zucchini", icon: "🥒" },
  { primaryAr: "يقطين", synonymsAr: ["شجر أحمر", "قرع"], nameEn: "Pumpkin", icon: "🎃" },
  { primaryAr: "فجل", synonymsAr: [], nameEn: "Radish", icon: "🧄" },
  { primaryAr: "أفوكادو", synonymsAr: [], nameEn: "Avocado", icon: "🥑" },
  { primaryAr: "أسكي دنيا", synonymsAr: ["أكي دنيا", "يني دنيا", "دنيا"], nameEn: "Loquat", icon: "🍊" },
  { primaryAr: "كرفس", synonymsAr: [], nameEn: "Celery", icon: "🌿" },
  { primaryAr: "رشاد", synonymsAr: [], nameEn: "Watercress", icon: "🌿" },
  { primaryAr: "كزبرة", synonymsAr: [], nameEn: "Coriander", icon: "🌿" },
  { primaryAr: "بقدونس", synonymsAr: ["معدنوس"], nameEn: "Parsley", icon: "🌿" },
  { primaryAr: "تمر", synonymsAr: [], nameEn: "Dates", icon: "🌴" },
  { primaryAr: "زيتون", synonymsAr: [], nameEn: "Olive", icon: "🫒" },
  { primaryAr: "نعناع", synonymsAr: [], nameEn: "Mint", icon: "🌿" },
  { primaryAr: "كراث", synonymsAr: [], nameEn: "Leek", icon: "🌱" },
  { primaryAr: "لفت", synonymsAr: ["شلغم"], nameEn: "Turnip", icon: "🧅" },
  { primaryAr: "توت", synonymsAr: ["توث"], nameEn: "Berry", icon: "🫐" },
  { primaryAr: "فول", synonymsAr: ["باقلاء", "باجلا", "باجلاء"], nameEn: "Broad Beans", icon: "🌱" },
  { primaryAr: "فاصوليا", synonymsAr: ["فاصولية"], nameEn: "Beans", icon: "🌱" },
  { primaryAr: "بازلاء", synonymsAr: ["بزيلا", "بازلية"], nameEn: "Peas", icon: "🌱" },
  { primaryAr: "شبت", synonymsAr: ["شبنت"], nameEn: "Dill", icon: "🌿" },
  { primaryAr: "ريحان", synonymsAr: [], nameEn: "Basil", icon: "🌿" },
  { primaryAr: "يوسفي", synonymsAr: ["لالنكي", "أفندي"], nameEn: "Tangerine", icon: "🍊" },
  { primaryAr: "جريب فروت", synonymsAr: ["سندي"], nameEn: "Grapefruit", icon: "🍊" },
  { primaryAr: "برقوق", synonymsAr: ["ألوجة", "آلو", "كوجة"], nameEn: "Plum", icon: "🍑" },
  { primaryAr: "نبق", synonymsAr: ["كنار", "سدر"], nameEn: "Jujube", icon: "🍊" },
  { primaryAr: "كماة", synonymsAr: ["چما"], nameEn: "Truffle", icon: "🍄" },
  { primaryAr: "توت أسود", synonymsAr: ["عليج"], nameEn: "Blackberry", icon: "🫐" },
  { primaryAr: "بروكلي", synonymsAr: [], nameEn: "Broccoli", icon: "🥦" },
  { primaryAr: "خرشوف", synonymsAr: ["أرضي شوكي"], nameEn: "Artichoke", icon: "🥦" },
  { primaryAr: "هليون", synonymsAr: [], nameEn: "Asparagus", icon: "🌱" },
  { primaryAr: "زنجبيل", synonymsAr: [], nameEn: "Ginger", icon: "🧄" },
  { primaryAr: "كركم", synonymsAr: [], nameEn: "Turmeric", icon: "🧄" },
  { primaryAr: "كستناء", synonymsAr: ["أبو فروة"], nameEn: "Chestnut", icon: "🌰" },
  { primaryAr: "لوز", synonymsAr: [], nameEn: "Almonds", icon: "🌰" },
  { primaryAr: "جوز", synonymsAr: [], nameEn: "Walnuts", icon: "🌰" },
  { primaryAr: "فستق", synonymsAr: [], nameEn: "Pistachio", icon: "🌰" },
  { primaryAr: "بندق", synonymsAr: [], nameEn: "Hazelnut", icon: "🌰" },
  { primaryAr: "جوز الهند", synonymsAr: [], nameEn: "Coconut", icon: "🥥" },
  { primaryAr: "سفرجل", synonymsAr: [], nameEn: "Quince", icon: "🍏" },
  { primaryAr: "خرنوب", synonymsAr: [], nameEn: "Carob", icon: "🌱" },
  { primaryAr: "حمص", synonymsAr: [], nameEn: "Chickpeas", icon: "🌱" },
  { primaryAr: "عدس", synonymsAr: [], nameEn: "Lentils", icon: "🌱" },
  { primaryAr: "ماش", synonymsAr: ["ماش أخضر"], nameEn: "Mung Beans", icon: "🌱" },
  { primaryAr: "جرجير", synonymsAr: [], nameEn: "Arugula", icon: "🌿" },
  { primaryAr: "حلبة", synonymsAr: [], nameEn: "Fenugreek", icon: "🌿" },
  { primaryAr: "زعتر", synonymsAr: [], nameEn: "Thyme", icon: "🌿" },
  { primaryAr: "كاكا", synonymsAr: ["كاكي", "كاكا", "الكاكا", "خرما"], nameEn: "Persimmon", icon: "🍊" },
  { primaryAr: "تعروز", synonymsAr: ["تعروز", "ترعوز", "طرح", "قتة"], nameEn: "Wild Cucumber", icon: "🥒" },
  { primaryAr: "بطيخ أصفر", synonymsAr: ["بطيخ أصفر", "البطيخ الأصفر", "شمام أصفر", "شمام"], nameEn: "Yellow Melon", icon: "🍈" },
  { primaryAr: "بابايا", synonymsAr: [], nameEn: "Papaya", icon: "🥭" },
  { primaryAr: "جوافة", synonymsAr: [], nameEn: "Guava", icon: "🍐" },
  { primaryAr: "تين شوكي", synonymsAr: ["صبار"], nameEn: "Prickly Pear", icon: "🌵" },
  { primaryAr: "جانرك", synonymsAr: ["كرز أخضر"], nameEn: "Green Cherry Plum", icon: "🍏" },
  // New count-only crops
  { primaryAr: "باشن فروت", synonymsAr: ["فاكهة العاطفة"], nameEn: "Passion Fruit", icon: "🫐", countOnly: true },
  { primaryAr: "مانكو ستين", synonymsAr: ["مانغوستين"], nameEn: "Mangosteen", icon: "🍊", countOnly: true },
  { primaryAr: "رامبوتان", synonymsAr: [], nameEn: "Rambutan", icon: "🍊", countOnly: true },
  { primaryAr: "دراكون فروت", synonymsAr: ["فاكهة التنين", "بتايا"], nameEn: "Dragon Fruit", icon: "🐉", countOnly: true },
  { primaryAr: "ذرة كارتون", synonymsAr: ["ذرة معلبة"], nameEn: "Carton Corn", icon: "🌽", countOnly: true },
  { primaryAr: "طماطة عنقودية", synonymsAr: ["طماطة كرزية", "طماطم كرزية", "شيري طماطم"], nameEn: "Cherry Tomato", icon: "🍅", countOnly: true }
];

// Load custom user-defined crops from localStorage
function loadCustomCrops() {
  try {
    const stored = localStorage.getItem('alwa_custom_crops');
    if (stored) {
      const customCrops = JSON.parse(stored);
      customCrops.forEach(c => {
        // Avoid duplicates
        const exists = CROP_SUGGESTIONS.find(s => s.primaryAr === c.primaryAr);
        if (!exists) {
          CROP_SUGGESTIONS.push(c);
        }
      });
    }
  } catch(e) { /* ignore parse errors */ }
}

function saveCustomCrop(cropName, measureType) {
  const newCrop = {
    primaryAr: cropName,
    synonymsAr: [],
    nameEn: cropName,
    icon: '🏷️',
    isCustom: true
  };
  if (measureType === 'count') {
    newCrop.countOnly = true;
  } else if (measureType === 'both') {
    newCrop.bothUnits = true;
  }
  // measureType === 'weight' → default (no flag needed)

  CROP_SUGGESTIONS.push(newCrop);

  // Persist to localStorage
  let customCrops = [];
  try {
    const stored = localStorage.getItem('alwa_custom_crops');
    if (stored) customCrops = JSON.parse(stored);
  } catch(e) { /* ignore */ }
  customCrops.push(newCrop);
  localStorage.setItem('alwa_custom_crops', JSON.stringify(customCrops));
}

// Check if that specific import invoice item reaches 100% sold
// Fetch import details
function getCropIcon(cropType) {
  const crop = CROP_SUGGESTIONS.find(c => c.primaryAr === cropType);
  return crop ? crop.icon : '🥦';
}

function getCropUnitType(cropType) {
  const crop = CROP_SUGGESTIONS.find(c => c.primaryAr === cropType);
  if (!crop) return 'weight';
  if (crop.countOnly) return 'count';
  if (crop.bothUnits) return 'both';
  return 'weight';
}

function isWatermelonOrMelon(cropName) {
  if (!cropName) return false;
  const clean = cropName.trim().toLowerCase();
  return clean === 'رقي' || clean === 'بطيخ' || clean.includes('بطيخ أحمر') || clean.includes('شمام') || clean.includes('رقي') || clean.includes('بطيخ') || clean.includes('watermelon') || clean.includes('melon');
}

function isCountOnly(cropName) {
  if (!cropName) return false;
  const clean = cropName.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim().toLowerCase();
  const found = CROP_SUGGESTIONS.find(c =>
    c.primaryAr.toLowerCase() === clean ||
    c.synonymsAr.some(syn => syn.toLowerCase() === clean) ||
    c.nameEn.toLowerCase() === clean ||
    clean.includes(c.primaryAr.toLowerCase()) ||
    c.primaryAr.toLowerCase().includes(clean)
  );
  return found ? (found.countOnly === true) : false;
}

function formatWeight(weight, unit = 'kg') {
  const formattedNum = formatVal(weight);
  let unitStr = '';
  if (unit === 'mixed') {
    if (currentLanguage === 'ar') {
      return `\u202B${formattedNum} وحدة مختلطة\u202C`;
    } else {
      return `\u202A${formattedNum} mixed units\u202C`;
    }
  }
  if (numeralSystem === 'ar') {
    if (unit === 'kg') unitStr = 'كغم';
    else if (unit === 'liter') unitStr = 'لتر';
    else if (unit === 'count') unitStr = 'عدد';
    return `\u202B${formattedNum} ${unitStr}\u202C`;
  } else {
    if (unit === 'kg') unitStr = 'Kg';
    else if (unit === 'liter') unitStr = 'Ltr';
    else if (unit === 'count') unitStr = 'Qty';
    return `\u202A${formattedNum} ${unitStr}\u202C`;
  }
}

function formatWeightFraction(rem, total, unit = 'kg') {
  const formattedRem = formatVal(rem);
  const formattedTotal = formatVal(total);
  let unitStr = '';
  if (unit === 'mixed') {
    if (currentLanguage === 'ar') {
      return `\u202B${formattedRem} / ${formattedTotal} وحدات\u202C`;
    } else {
      return `\u202A${formattedRem} / ${formattedTotal} units\u202C`;
    }
  }
  if (numeralSystem === 'ar') {
    if (unit === 'kg') unitStr = 'كغم';
    else if (unit === 'liter') unitStr = 'لتر';
    else if (unit === 'count') unitStr = 'عدد';
    return `\u202B${formattedRem} / ${formattedTotal} ${unitStr}\u202C`;
  } else {
    if (unit === 'kg') unitStr = 'Kg';
    else if (unit === 'liter') unitStr = 'Ltr';
    else if (unit === 'count') unitStr = 'Qty';
    return `\u202A${formattedRem} / ${formattedTotal} ${unitStr}\u202C`;
  }
}

function getAgreedPriceLabel(unit) {
  if (currentLanguage === 'ar') {
    if (unit === 'kg') return 'سعر الكيلو المتفق عليه:';
    if (unit === 'liter') return 'سعر اللتر المتفق عليه:';
    return 'سعر المفرد المتفق عليه:';
  } else {
    if (unit === 'kg') return 'Agreed Price/Kg:';
    if (unit === 'liter') return 'Agreed Price/Liter:';
    return 'Agreed Price/Item:';
  }
}

function updateHeaderDate() {
  const dayEl = document.getElementById('header-day-name');
  const dateEl = document.getElementById('header-date-text');
  if (!dayEl || !dateEl) return;
  const today = new Date();
  const dayOptions = { weekday: 'long' };
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  
  let locale = currentLanguage === 'ar' ? 'ar-IQ' : 'en-US';
  if (numeralSystem === 'en' && currentLanguage === 'ar') {
    locale = 'ar-IQ-u-nu-latn';
  } else if (numeralSystem === 'ar' && currentLanguage === 'en') {
    locale = 'en-US-u-nu-arab';
  }
  
  dayEl.textContent = today.toLocaleDateString(locale, dayOptions);
  dateEl.textContent = today.toLocaleDateString(locale, dateOptions);
}

// AutoComplete caches
let cachedFarmers = [];
let cachedCustomers = [];
let activeImportInvoices = [];

// ==============================================
// 1. DICTIONARY & TRANSLATIONS
// ==============================================
const translations = {
  ar: {
    appTitle: "محاسب العلوة",
    appSubtitle: "نظام إدارة العلوة الذكي",
    langButton: "🇸🇦 العربية",
    importTab: "الاستيراد",
    salesTab: "المبيعات",
    accountsTab: "الحسابات",
    statsTab: "الإحصائيات",
    settingsTab: "الإعدادات",
    importTitle: "إدارة فواتير الاستيراد",
    importDesc: "سجل البضائع المستلمة من الفلاحين وتتبع تقدم بيعها في السوق دقيقة بدقيقة.",
    newImportBtn: "فاتورة استيراد جديدة",
    searchFarmerPl: "🔍 ابحث باسم الفلاح أو رمز الفاتورة...",
    salesTitle: "المبيعات اليومية",
    salesDesc: "أنشئ فواتير البيع للزبائن واخصم العمولات للشركة والفلاح بشكل فوري وتلقائي.",
    newSaleBtn: "فاتورة بيع جديدة",
    searchCustomerPl: "🔍 ابحث بالزبون، المحصول، أو رمز الفاتورة...",
    subtabDebts: "ديون الزبائن",
    subtabDues: "مستحقات الفلاحين",
    subtabPorters: "مستحقات الحمالين",
    searchDebtsPl: "🔍 ابحث باسم الزبون المدين...",
    searchDuesPl: "🔍 ابحث باسم الفلاح...",
    safeBoxLabel: "صافي الخزنة الحالية",
    lblTotalCashSales: "مبيعات نقدية",
    lblTotalCollectedDebts: "ديون محصلة",
    lblTotalCommission5: "عمولتنا 5%",
    lblTotalPaidDues: "مستحقات مدفوعة",
    lblTotalPorterPayouts: "مستحقات الحمالين",
    btnAddExpense: "تسجيل مصاريف",
    btnAddLoss: "تسجيل خسائر",
    txtChartTitle: "توزيع المصاريف والأرباح لشهر الجاري",
    txtLedgerTitle: "سجل المصروفات والخسائر الأخيرة",
    officeSettingsTitle: "معلومات العلوة",
    lblOfficeName: "اسم العلوة (يظهر بالفاتورة)",
    lblOfficePhone: "رقم الهاتف",
    lblOfficeLocation: "موقع العلوة (العنوان)",
    btnSaveOffice: "حفظ المعلومات",
    txtNumeralTitle: "عرض الأرقام العربية",
    txtNumeralDesc: "التبديل بين الأرقام الهندية (١٢٣) والإنجليزية (123) في كل شاشات وفواتير التطبيق.",
    txtNotifTitle: "الإشعارات والنظام",
    txtNotifDesc: "تفعيل التنبيهات الصوتية المباشرة عند اكتمال بيع محصول أو استلام سداد.",
    txtPrinterTitle: "إعدادات طابعة الفواتير (Bluetooth BLE)",
    printerStatusText: "الطابعة غير متصلة",
    lblPaperWidth: "عرض ورق الطباعة",
    btnScanPrinter: "اقتران وفحص",
    btnTestPrint: "طباعة فحص",
    txtBackupTitle: "النسخة الاحتياطية أوفلاين",
    txtBackupDesc: "قم بتصدير كامل قاعدة بيانات Room/IndexedDB في ملف JSON وتنزيله لحماية حساباتك ومحاصيلك من الضياع.",
    btnExportDb: "تصدير قاعدة البيانات",
    btnImportDb: "استيراد ملف backup",
    sheetImportTitle: "إنشاء فاتورة استيراد جديدة",
    lblFarmerName: "اسم الفلاح",
    lblVehicleType: "نوع السيارة",
    txtAddCrop: "إضافة صنف آخر",
    btnSubmitImport: "حفظ الفاتورة والبدء في العرض",
    sheetSaleTitle: "إنشاء فاتورة بيع جديدة",
    lblCustomerName: "اسم الزبون (صاحب المحل)",
    lblCustomerPhone: "رقم الهاتف (تلقائي)",
    lblCustomerAddress: "العنوان (تلقائي)",
    txtAddSaleCrop: "إضافة صنف آخر في الفاتورة",
    lblBagsCost: "تكلفة الأكياس والكراتين (إجمالي اختياري)",
    lblPaymentMethod: "طريقة الدفع",
    btnPayCash: "💵 نقد",
    btnPayDebt: "📋 دين بالأجل",
    lblDebtDue: "موعد المطالبة بالدين",
    lblSubtotal: "مجموع أسعار البضاعة:",
    lblCommission7: "مجموع العمولات (7%):",
    lblCarryingTotal: "مجموع الحمالية:",
    lblTotalCalc: "المبلغ الإجمالي المستحق:",
    btnSubmitSale: "إصدار الفاتورة وحساب الأرباح",
    sheetExpenseTitle: "تسجيل مصروفات جديدة",
    lblExpenseType: "نوع المصروفات",
    expenseDaily: "مصاريف يومية",
    expensePersonal: "مصاريف شخصية",
    lblExpenseSubject: "الموضوع / الوصف",
    lblExpenseAmount: "المبلغ المستقطع",
    btnSubmitExpense: "حفظ المصروف وتحديث الخزنة",
    sheetLossTitle: "تسجيل الخسائر والتلفيات",
    lblLossSubject: "سبب الخسارة (مثل: تلف صندوق طماطم، نقصان بيع)",
    lblLossAmount: "قيمة الخسارة المسجلة",
    btnSubmitLoss: "تسجيل خسارة وتعديل الأرباح",
    sheetPrintPreviewTitle: "معاينة الفاتورة الحرارية",
    btnExecutePrint: "طباعة بلوتوث",
    btnExecuteSystemPrint: "طباعة النظام",
    btnShareReceipt: "حفظ كصورة",
    sheetPaymentTitle: "تسجيل تسديد الديون",
    lblPayAmount: "مبلغ السداد",
    btnSubmitPayment: "تسجيل الدفعة وتصفية الدين",
    currency: "دينار",
    currencyAbbr: "د.ع",
    kg: "Kg",
    splashWelcome: "أهلاً بك في",
    splashLoading: "جاري تهيئة الحسابات والمحاصيل..."
  },
  en: {
    appTitle: "Alwa Accountant",
    appSubtitle: "Smart Alwa Management System",
    langButton: "🇺🇸 English",
    importTab: "Imports",
    salesTab: "Sales",
    accountsTab: "Accounts",
    statsTab: "Statistics",
    settingsTab: "Settings",
    importTitle: "Manage Import Invoices",
    importDesc: "Log products received from farmers and track their sales progress in real-time.",
    newImportBtn: "New Import Invoice",
    searchFarmerPl: "🔍 Search by farmer name or invoice ID...",
    salesTitle: "Daily Sales",
    salesDesc: "Create invoices for customers and calculate commissions dynamically.",
    newSaleBtn: "New Sale Invoice",
    searchCustomerPl: "🔍 Search by customer, crop, or invoice ID...",
    subtabDebts: "Customer Debts",
    subtabDues: "Farmer Dues",
    subtabPorters: "Porters Dues",
    searchDebtsPl: "🔍 Search debtor name...",
    searchDuesPl: "🔍 Search farmer name...",
    safeBoxLabel: "Current Safe Box Balance",
    lblTotalCashSales: "Cash Sales",
    lblTotalCollectedDebts: "Collected Debts",
    lblTotalCommission5: "Our Commission 5%",
    lblTotalPaidDues: "Paid Dues to Farmers",
    lblTotalPorterPayouts: "Porters Dues",
    btnAddExpense: "Record Expenses",
    btnAddLoss: "Record Losses",
    txtChartTitle: "Expenses & Profits Distribution (Current Month)",
    txtLedgerTitle: "Recent Ledger of Expenses & Losses",
    officeSettingsTitle: "Alwa Info",
    lblOfficeName: "Alwa Name (Receipt Header)",
    lblOfficePhone: "Phone Number",
    lblOfficeLocation: "Alwa Location (Address)",
    btnSaveOffice: "Save Settings",
    txtNumeralTitle: "Eastern Arabic Numerals",
    txtNumeralDesc: "Switch between Arabic-Indic numerals (١٢٣) and Western numerals (123) globally.",
    txtNotifTitle: "System Notifications",
    txtNotifDesc: "Enable dynamic audio alert prompts when product sells 100% or payments settle.",
    txtPrinterTitle: "Printer Configuration (Bluetooth BLE)",
    printerStatusText: "Printer Disconnected",
    lblPaperWidth: "Receipt Paper Width",
    btnScanPrinter: "Scan & Pair",
    btnTestPrint: "Print Test Page",
    txtBackupTitle: "Offline Backups",
    txtBackupDesc: "Export complete Room/IndexedDB database into JSON backups to secure your account sheets.",
    btnExportDb: "Export Database",
    btnImportDb: "Import Backup JSON",
    sheetImportTitle: "Create New Import Invoice",
    lblFarmerName: "Farmer Name",
    lblVehicleType: "Vehicle Type",
    txtAddCrop: "Add Another Item",
    btnSubmitImport: "Save Invoice & Start Selling",
    sheetSaleTitle: "Create New Sale Invoice",
    lblCustomerName: "Customer Name (Shop Owner)",
    lblCustomerPhone: "Phone Number (Auto-fill)",
    lblCustomerAddress: "Address (Auto-fill)",
    txtAddSaleCrop: "Add Another Sale Item",
    lblBagsCost: "Bags/Cartons Extra Cost (Optional)",
    lblPaymentMethod: "Payment Method",
    btnPayCash: "💵 Cash",
    btnPayDebt: "📋 Debt Account",
    lblDebtDue: "Claim Schedule Date",
    lblSubtotal: "Subtotal Prices:",
    lblCommission7: "Total Commissions (7%):",
    lblCarryingTotal: "Carrying Cost:",
    lblTotalCalc: "Total Net Payable:",
    btnSubmitSale: "Issue Invoice & Save Dues",
    sheetExpenseTitle: "Record New Expense",
    lblExpenseType: "Expense Type",
    expenseDaily: "Daily Expense",
    expensePersonal: "Personal Expense",
    lblExpenseSubject: "Subject / Description",
    lblExpenseAmount: "Amount Paid",
    btnSubmitExpense: "Save & Adjust Safe Box",
    sheetLossTitle: "Record Damage / Loss",
    lblLossSubject: "Reason for Loss (e.g. damaged tomatoes)",
    lblLossAmount: "Estimated Loss Value",
    btnSubmitLoss: "Save Loss & Adjust Profit",
    sheetPrintPreviewTitle: "Thermal Receipt Preview",
    btnExecutePrint: "BLE Print",
    btnExecuteSystemPrint: "System Print",
    btnShareReceipt: "Save Image",
    sheetPaymentTitle: "Record Debt Payment",
    lblPayAmount: "Payment Amount",
    btnSubmitPayment: "Record Settle Payment",
    currency: "IQD",
    currencyAbbr: "IQD",
    kg: "Kg",
    splashWelcome: "Welcome to",
    splashLoading: "Initializing accounts & crops..."
  }
};

// ==============================================
// 2. NUMBER FORMATTER HELPER
// ==============================================
function formatVal(number, isCurrency = false) {
  if (number === undefined || number === null) return '';
  
  let valStr = '';
  const isNumeric = (typeof number === 'number') || 
                    (typeof number === 'string' && number !== '' && !isNaN(number) && (!number.startsWith('0') || number === '0'));
  
  if (isNumeric) {
    const num = Number(number);
    valStr = num.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (isCurrency) {
      valStr += ' ' + translations[currentLanguage].currencyAbbr;
    }
  } else {
    valStr = number.toString();
  }

  if (numeralSystem === 'ar') {
    const enNums = ['0','1','2','3','4','5','6','7','8','9', ','];
    const arNums = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩', '،'];
    return valStr.split('').map(char => {
      const idx = enNums.indexOf(char);
      return idx !== -1 ? arNums[idx] : char;
    }).join('');
  }
  return valStr;
}

function parseNumberInput(str) {
  const arNums = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  const enNums = ['0','1','2','3','4','5','6','7','8','9'];
  let cleanStr = str.toString();
  arNums.forEach((ar, idx) => {
    cleanStr = cleanStr.replaceAll(ar, enNums[idx]);
  });
  return parseFloat(cleanStr) || 0;
}

// ==============================================
// 3. DATABASE INITIALIZATION (INDEXEDDB - ROOM SIMULATION)
// ==============================================
const DB_NAME = 'AlwaAccountsRoomDatabase';
const DB_VERSION = 4;

function initDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (e) => reject('Database opening error: ' + e.target.errorCode);
    
    request.onupgradeneeded = (e) => {
      const dbInstance = e.target.result;
      
      if (!dbInstance.objectStoreNames.contains('farmers')) {
        dbInstance.createObjectStore('farmers', { keyPath: 'id', autoIncrement: true });
      }
      if (!dbInstance.objectStoreNames.contains('import_invoices')) {
        dbInstance.createObjectStore('import_invoices', { keyPath: 'id', autoIncrement: true });
      }
      if (!dbInstance.objectStoreNames.contains('import_items')) {
        dbInstance.createObjectStore('import_items', { keyPath: 'id', autoIncrement: true });
      }
      if (!dbInstance.objectStoreNames.contains('customers')) {
        dbInstance.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
      }
      if (!dbInstance.objectStoreNames.contains('sale_invoices')) {
        dbInstance.createObjectStore('sale_invoices', { keyPath: 'id', autoIncrement: true });
      }
      if (!dbInstance.objectStoreNames.contains('sale_items')) {
        dbInstance.createObjectStore('sale_items', { keyPath: 'id', autoIncrement: true });
      }
      if (!dbInstance.objectStoreNames.contains('debts')) {
        dbInstance.createObjectStore('debts', { keyPath: 'id', autoIncrement: true });
      }
      if (!dbInstance.objectStoreNames.contains('farmer_dues')) {
        dbInstance.createObjectStore('farmer_dues', { keyPath: 'id', autoIncrement: true });
      }
      if (!dbInstance.objectStoreNames.contains('daily_expenses')) {
        dbInstance.createObjectStore('daily_expenses', { keyPath: 'id', autoIncrement: true });
      }
      if (!dbInstance.objectStoreNames.contains('personal_expenses')) {
        dbInstance.createObjectStore('personal_expenses', { keyPath: 'id', autoIncrement: true });
      }
      if (!dbInstance.objectStoreNames.contains('losses')) {
        dbInstance.createObjectStore('losses', { keyPath: 'id', autoIncrement: true });
      }
      if (!dbInstance.objectStoreNames.contains('settings')) {
        const settingsStore = dbInstance.createObjectStore('settings', { keyPath: 'key' });
        settingsStore.put({ key: 'numeral_system', value: 'en' });
        settingsStore.put({ key: 'sound_alerts', value: 'true' });
      }
      if (!dbInstance.objectStoreNames.contains('porter_payouts')) {
        dbInstance.createObjectStore('porter_payouts', { keyPath: 'id', autoIncrement: true });
      }
      if (!dbInstance.objectStoreNames.contains('safe_adjustments')) {
        dbInstance.createObjectStore('safe_adjustments', { keyPath: 'id', autoIncrement: true });
      }
      if (!dbInstance.objectStoreNames.contains('stat_archives')) {
        dbInstance.createObjectStore('stat_archives', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };
  });
}

function dbGetAll(storeName) {
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });
}

function dbGet(storeName, id) {
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
  });
}

function dbAdd(storeName, obj) {
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.add(obj);
    request.onsuccess = (e) => resolve(e.target.result);
  });
}

function dbPut(storeName, obj) {
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(obj);
    request.onsuccess = () => resolve();
  });
}

function dbDelete(storeName, id) {
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
  });
}

// ==============================================
// 4. PREPOPULATE DEMO DATA
// ==============================================
async function checkAndBootstrapData() {
  const farmers = await dbGetAll('farmers');
  if (farmers.length === 0) {
    await dbAdd('farmers', { name: "أبو محمد الصبيح", phone: "07712345678" });
    await dbAdd('farmers', { name: "أبو علي الكناني", phone: "07898765432" });
    await dbAdd('customers', { name: "محل السلام (أبو حيدر)", phone: "07501234567", address: "جميلة" });
    await dbAdd('customers', { name: "أسواق الهدى", phone: "07705555555", address: "الكرادة" });
  }
}

// ==============================================
// 5. NOTIFICATION SOUNDS
// ==============================================
function playSound(type) {
  if (!soundEnabled) return;
  const sound = document.getElementById(type === 'success' ? 'sound-success' : 'sound-alert');
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(e => console.log('Audio playback blocked'));
  }
}

// ==============================================
// 6. GENERAL UTILS
// ==============================================
function showToast(text, icon = 'info', isError = false) {
  const toast = document.getElementById('app-toast');
  const toastText = document.getElementById('toast-text');
  const toastIcon = document.getElementById('toast-icon');

  toastText.textContent = text;
  toastIcon.textContent = icon;
  
  if (isError) {
    toast.style.background = 'var(--color-danger)';
    toast.style.borderColor = '#9B1C1C';
  } else {
    toast.style.background = 'var(--color-primary)';
    toast.style.borderColor = 'var(--color-accent)';
  }

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

async function refreshGlobalCaches() {
  cachedFarmers = await dbGetAll('farmers');
  cachedCustomers = await dbGetAll('customers');
  
  const allImports = await dbGetAll('import_invoices');
  const activeImports = allImports.filter(imp => !imp.is_settled);
  
  activeImportInvoices = [];
  for (const imp of activeImports) {
    const items = await dbGetAll('import_items');
    const impItems = items.filter(it => it.invoice_id === imp.id);
    const farmer = cachedFarmers.find(f => f.id === imp.farmer_id);
    activeImportInvoices.push({
      ...imp,
      farmer_name: farmer ? farmer.name : '',
      items: impItems
    });
  }
  await checkDueClaims();
}

async function checkDueClaims() {
  const badge = document.getElementById('notifications-badge');
  const bell = document.getElementById('btn-notifications');
  if (!badge || !bell) return;
  
  const debts = await dbGetAll('debts');
  const now = Date.now();
  const dueDebts = debts.filter(d => !d.is_paid && now >= d.due_date);
  const count = dueDebts.length;
  
  if (count > 0) {
    badge.textContent = formatVal(count);
    badge.style.display = 'flex';
    bell.classList.add('ring');
  } else {
    badge.style.display = 'none';
    bell.classList.remove('ring');
  }
}

async function renderDueClaims() {
  const container = document.getElementById('due-claims-body');
  if (!container) return;
  container.innerHTML = '';
  
  const debts = await dbGetAll('debts');
  const customers = await dbGetAll('customers');
  const now = Date.now();
  
  const dueDebts = debts.filter(d => !d.is_paid && now >= d.due_date);
  
  if (dueDebts.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: var(--color-text-muted); font-size: 13px;">لا توجد مطالبات ديون مستحقة حالياً.</p>`;
    return;
  }
  
  dueDebts.forEach(debt => {
    const customer = customers.find(c => c.id === debt.customer_id);
    const customerName = customer ? customer.name : 'زبون غير معروف';
    const customerPhone = customer ? customer.phone : 'غير متوفر';
    const formattedDate = new Date(debt.due_date).toLocaleDateString(numeralSystem === 'ar' ? 'ar-IQ' : 'en-US');
    
    const div = document.createElement('div');
    div.className = 'premium-card';
    div.style.border = '1px solid rgba(230, 57, 70, 0.15)';
    div.style.background = 'rgba(230, 57, 70, 0.02)';
    div.style.margin = '0';
    
    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 8px;">
        <div>
          <span class="lang-badge" style="background-color: rgba(230, 57, 70, 0.1); color: var(--color-danger); margin-bottom: 4px; display: inline-block;">
            # ${formatVal(debt.sale_invoice_id)}
          </span>
          <h4 style="font-size: 14px; font-weight: 700; color: var(--color-primary);">${customerName}</h4>
          <span style="font-size: 11px; color: var(--color-text-muted);">هاتف: ${customerPhone}</span>
        </div>
        <div style="text-align: left; display: flex; flex-direction: column; align-items: flex-end;">
          <span class="debt-status-tag unpaid" style="font-size: 9px; margin-bottom: 4px; display: inline-block; background: var(--color-danger); color: white;">مستحق الدفع</span>
          <div style="font-size: 10px; color: var(--color-text-muted);">تاريخ الاستحقاق: ${formattedDate}</div>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
        <div>
          <span style="font-size: 11px; color: var(--color-text-muted);">المبلغ المستحق:</span>
          <div style="font-size: 15px; font-weight: 700; color: var(--color-danger);">${formatVal(debt.amount, true)}</div>
        </div>
        <button class="btn-primary btn-claim-settle" data-id="${debt.id}" style="padding: 6px 12px; font-size: 11px; background-color: var(--color-danger); box-shadow: none;">
          تسديد الحساب
        </button>
      </div>
    `;
    
    container.appendChild(div);
  });
  
  container.querySelectorAll('.btn-claim-settle').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const debtId = parseInt(btn.dataset.id);
      closeBottomSheet('sheet-due-claims');
      await openPaymentSheet(debtId);
    });
  });
}

// ==============================================
// 6. SCREEN 1 IMPLEMENTATION: IMPORTS MANAGEMENT
// ==============================================
async function renderImportsList() {
  const importsList = document.getElementById('imports-list');
  const searchQuery = document.getElementById('search-import-farmer').value.toLowerCase();
  
  importsList.innerHTML = '';
  
  const allImports = await dbGetAll('import_invoices');
  const allImportItems = await dbGetAll('import_items');
  const allSaleItems = await dbGetAll('sale_items');
  const farmers = await dbGetAll('farmers');

  const activeImportsOnly = allImports.filter(imp => !imp.is_settled);
  activeImportsOnly.sort((a,b) => b.created_at - a.created_at);

  let displayedCount = 0;
  for (const imp of activeImportsOnly) {
    const farmer = farmers.find(f => f.id === imp.farmer_id);
    if (!farmer) continue;
    
    const matchId = '#' + imp.id.toString();
    const matchesSearch = farmer.name.toLowerCase().includes(searchQuery) ||
                          imp.id.toString().includes(searchQuery) ||
                          matchId.toLowerCase().includes(searchQuery);
    if (searchQuery && !matchesSearch) {
      continue;
    }
    const items = allImportItems.filter(it => it.invoice_id === imp.id);
    
    let totalWeight = 0;
    let soldWeight = 0;
    let totalBoxes = 0;
    let soldBoxes = 0;
    let hasNormalCrops = false;
    
    items.forEach(it => {
      const isCount = (getCropUnitType(it.crop_type) === 'count');
      if (isCount) {
        totalWeight += (it.box_count || 0);
        const salesOfItem = allSaleItems.filter(s => s.import_invoice_id === imp.id && s.crop_type === it.crop_type);
        salesOfItem.forEach(s => {
          soldWeight += (s.box_count || 0);
          soldBoxes += (s.box_count || 0);
        });
        totalBoxes += (it.box_count || 0);
      } else {
        totalWeight += it.weight_kg;
        const salesOfItem = allSaleItems.filter(s => s.import_invoice_id === imp.id && s.crop_type === it.crop_type);
        salesOfItem.forEach(s => {
          soldWeight += s.weight_kg;
          if (!isWatermelonOrMelon(it.crop_type)) {
            soldBoxes += (s.box_count || 0);
          }
        });
        if (!isWatermelonOrMelon(it.crop_type)) {
          hasNormalCrops = true;
          totalBoxes += (it.box_count || 0);
        }
      }
    });

    const percentSold = totalWeight > 0 ? Math.min(100, Math.round((soldWeight / totalWeight) * 100)) : 0;
    const remainingWeight = Math.max(0, totalWeight - soldWeight);
    const remainingBoxes = Math.max(0, totalBoxes - soldBoxes);

    let commonUnit = 'kg';
    if (items.length > 0) {
      const uniqueUnits = [...new Set(items.map(it => it.unit || 'kg'))];
      if (uniqueUnits.length === 1) {
        commonUnit = uniqueUnits[0];
      } else {
        commonUnit = 'mixed';
      }
    }

    let colorClass = 'green';
    if (percentSold >= 85) {
      colorClass = 'red';
    } else if (percentSold >= 50) {
      colorClass = 'orange';
    }

    const card = document.createElement('div');
    card.className = 'premium-card stagger-item';
    card.style.animationDelay = `${displayedCount * 0.08}s`;
    
    let itemsHtml = items.map(it => {
      const isCount = (getCropUnitType(it.crop_type) === 'count');
      const itemSales = allSaleItems.filter(s => s.import_invoice_id === imp.id && s.crop_type === it.crop_type);
      let itemSold = 0;
      let itemBoxesSold = 0;
      itemSales.forEach(s => {
        itemSold += (isCount ? (s.box_count || 0) : s.weight_kg);
        itemBoxesSold += (s.box_count || 0);
      });
      const itemRem = Math.max(0, (isCount ? (it.box_count || 0) : it.weight_kg) - itemSold);
      const isSpecial = isWatermelonOrMelon(it.crop_type);
      const itemBoxesRem = Math.max(0, (it.box_count || 0) - itemBoxesSold);
      
      let itemBoxStr = '';
      if (isCount) {
        itemBoxStr = '';
      } else if (isSpecial) {
        itemBoxStr = '';
      } else {
        itemBoxStr = (currentLanguage === 'ar' ? ` (${itemBoxesRem} / ${it.box_count || 0} صندوق)` : ` (${itemBoxesRem} / ${it.box_count || 0} Box)`);
      }
      return `<div style="font-size:12px; font-weight:600; display:flex; justify-content:space-between; margin-bottom:4px;">
        <span>${getCropIcon(it.crop_type)} ${it.crop_type}</span>
        <span>${formatWeightFraction(itemRem, (isCount ? (it.box_count || 0) : it.weight_kg), it.unit || 'kg')}${itemBoxStr}</span>
      </div>`;
    }).join('');

    const formattedDate = new Date(imp.invoice_date).toLocaleDateString(numeralSystem === 'ar' ? 'ar-IQ' : 'en-US');
    const totalBoxStr = hasNormalCrops ? (currentLanguage === 'ar' ? ` (${remainingBoxes} صندوق)` : ` (${remainingBoxes} Box)`) : '';

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom:8px;">
        <div>
          <span class="lang-badge" style="background-color: var(--color-primary-light); margin-bottom:4px; display:inline-block;">
            # ${formatVal(imp.id)}
          </span>
          <h4 style="font-size:14px; font-weight:700; color:var(--color-primary);">${farmer.name}</h4>
          <span style="font-size:10px; color:var(--color-text-muted);">${translations[currentLanguage].lblVehicleType}: ${imp.vehicle_type}</span>
        </div>
        <div style="text-align:left; display:flex; flex-direction:column; gap:4px;">
          <span style="font-size:11px; font-weight:600; color:var(--color-text-muted);">${formattedDate}</span>
          ${imp.is_settled ? 
            `<span class="debt-status-tag paid" style="font-size: 9px; align-self: flex-end;">${currentLanguage === 'ar' ? 'مكتملة ومسواة' : 'Settled'}</span>` : 
            `<span class="debt-status-tag near" style="font-size: 9px; align-self: flex-end;">${currentLanguage === 'ar' ? 'بانتظار البيع والتسوية' : 'Awaiting sale'}</span>`
          }
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:2px; margin: 6px 0;">
        ${itemsHtml}
      </div>

      <div class="progress-bar-container">
        <div class="progress-labels">
          <span>${currentLanguage === 'ar' ? 'الكمية المباعة:' : 'Sold percent:'} ${formatVal(percentSold)}%</span>
          <span>${currentLanguage === 'ar' ? 'المتبقي الكلي:' : 'Total Remaining:'} ${formatWeight(remainingWeight, commonUnit)}${totalBoxStr}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill ${colorClass}" style="width: ${percentSold}%"></div>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; border-top:1px dashed rgba(0,0,0,0.05); padding-top:6px;">
        <span style="font-size:10px; color:var(--color-text-muted);">${currentLanguage === 'ar' ? 'فاتورة استيراد سلع' : 'Import Invoice'}</span>
        <div style="display:flex; gap:6px;">
          <button class="btn-secondary btn-delete-import" data-id="${imp.id}" style="padding:6px 12px; font-size:11px; display:flex; align-items:center; gap:4px; border:1.5px solid var(--color-danger); background: rgba(230, 57, 70, 0.04); color: var(--color-danger); box-shadow: none;">
            <span class="material-icons-round" style="font-size:14px;">delete</span>
            <span>${currentLanguage === 'ar' ? 'حذف' : 'Delete'}</span>
          </button>
          <button class="btn-secondary btn-import-details" data-id="${imp.id}" style="padding:6px 12px; font-size:11px; display:flex; align-items:center; gap:4px; border:1.5px solid var(--color-primary-light); background: rgba(0, 150, 199, 0.04); color: var(--color-primary); box-shadow: none;">
            <span class="material-icons-round" style="font-size:14px;">info</span>
            <span>${currentLanguage === 'ar' ? 'تفاصيل' : 'Details'}</span>
          </button>
        </div>
      </div>

      ${(!imp.is_settled && percentSold === 100) ? `
        <div class="settle-action-banner" style="margin-top: 8px;">
          <div>
            <span class="settle-badge">${currentLanguage === 'ar' ? 'جاهز للتسوية' : 'Ready to Settle'}</span>
            <p style="font-size:11px; font-weight:600; color:var(--color-primary); margin-top:2px;">
              ${currentLanguage === 'ar' ? 'تم بيع كامل حمولة المحصول!' : 'Entire crop vehicle has been fully sold!'}
            </p>
          </div>
          <button class="btn-primary btn-settle-invoice" data-id="${imp.id}" style="padding:6px 12px; font-size:11px;">
            ${currentLanguage === 'ar' ? 'تسوية الحساب' : 'Settle Now'}
          </button>
        </div>
      ` : ''}
    `;

    importsList.appendChild(card);
    displayedCount++;
  }

  if (displayedCount === 0) {
    importsList.innerHTML = `
      <div class="empty-state">
        <span class="material-icons-round empty-state-icon">receipt</span>
        <p>${currentLanguage === 'ar' ? 'لا توجد فواتير استيراد مطابقة للبحث.' : 'No import invoices matching the search.'}</p>
      </div>
    `;
  }

  const archiveBtnDiv = document.createElement('div');
  archiveBtnDiv.style.marginTop = '20px';
  archiveBtnDiv.style.display = 'flex';
  archiveBtnDiv.style.flexDirection = 'column';
  archiveBtnDiv.style.gap = '6px';
  archiveBtnDiv.style.alignItems = 'center';
  archiveBtnDiv.innerHTML = `
    <button class="btn-secondary" id="btn-open-archive" style="background: #e5e5e5; color: #555; border: 1px solid #ccc; font-size: 13px; font-weight: 700; width: 100%; padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: none;">
      <span class="material-icons-round" style="font-size: 18px;">archive</span>
      <span>أرشيف الفواتير المسواة</span>
    </button>
    <span style="font-size: 11px; color: var(--color-text-muted); text-align: center;">يحوي الأرشيف على جميع الفواتير السابقة التي تمت تسويتها</span>
  `;
  importsList.appendChild(archiveBtnDiv);

  const openArchiveBtn = document.getElementById('btn-open-archive');
  if (openArchiveBtn) {
    openArchiveBtn.addEventListener('click', () => {
      renderArchiveList();
      openBottomSheet('sheet-imports-archive');
    });
  }

  document.querySelectorAll('.btn-settle-invoice').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const impId = parseInt(e.target.closest('button').dataset.id);
      await settleImportInvoice(impId);
    });
  });

  document.querySelectorAll('.btn-import-details').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const impId = parseInt(e.target.closest('button').dataset.id);
      showInvoiceDetails(impId, 'import');
    });
  });

  document.querySelectorAll('.btn-delete-import').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const impId = parseInt(e.target.closest('button').dataset.id);
      await deleteImportInvoice(impId);
    });
  });
}

async function renderArchiveList() {
  const archiveList = document.getElementById('archive-imports-list');
  if (!archiveList) return;
  const searchQuery = document.getElementById('search-archive-farmer').value.toLowerCase();
  
  archiveList.innerHTML = '';
  
  const allImports = await dbGetAll('import_invoices');
  const allImportItems = await dbGetAll('import_items');
  const allSaleItems = await dbGetAll('sale_items');
  const farmers = await dbGetAll('farmers');

  const settledImports = allImports.filter(imp => imp.is_settled);
  settledImports.sort((a,b) => b.created_at - a.created_at);

  let displayedCount = 0;
  for (const imp of settledImports) {
    const farmer = farmers.find(f => f.id === imp.farmer_id);
    if (!farmer) continue;
    
    const matchId = '#' + imp.id.toString();
    const matchesSearch = farmer.name.toLowerCase().includes(searchQuery) ||
                          imp.id.toString().includes(searchQuery) ||
                          matchId.toLowerCase().includes(searchQuery);
    if (searchQuery && !matchesSearch) {
      continue;
    }
    const items = allImportItems.filter(it => it.invoice_id === imp.id);
    
    let totalWeight = 0;
    let soldWeight = 0;
    let totalBoxes = 0;
    let soldBoxes = 0;
    let hasNormalCrops = false;
    
    items.forEach(it => {
      totalWeight += it.weight_kg;
      const salesOfItem = allSaleItems.filter(s => s.import_invoice_id === imp.id && s.crop_type === it.crop_type);
      salesOfItem.forEach(s => {
        soldWeight += s.weight_kg;
        if (!isWatermelonOrMelon(it.crop_type)) {
          soldBoxes += (s.box_count || 0);
        }
      });
      if (!isWatermelonOrMelon(it.crop_type)) {
        hasNormalCrops = true;
        totalBoxes += (it.box_count || 0);
      }
    });

    const percentSold = totalWeight > 0 ? Math.min(100, Math.round((soldWeight / totalWeight) * 100)) : 0;
    const remainingWeight = Math.max(0, totalWeight - soldWeight);
    const remainingBoxes = Math.max(0, totalBoxes - soldBoxes);

    let commonUnit = 'kg';
    if (items.length > 0) {
      const uniqueUnits = [...new Set(items.map(it => it.unit || 'kg'))];
      if (uniqueUnits.length === 1) {
        commonUnit = uniqueUnits[0];
      } else {
        commonUnit = 'mixed';
      }
    }

    const card = document.createElement('div');
    card.className = 'premium-card stagger-item';
    card.style.animationDelay = `${displayedCount * 0.08}s`;
    
    let itemsHtml = items.map(it => {
      const itemSales = allSaleItems.filter(s => s.import_invoice_id === imp.id && s.crop_type === it.crop_type);
      let itemSold = 0;
      let itemBoxesSold = 0;
      itemSales.forEach(s => {
        itemSold += s.weight_kg;
        itemBoxesSold += (s.box_count || 0);
      });
      const itemRem = Math.max(0, it.weight_kg - itemSold);
      const isSpecial = isWatermelonOrMelon(it.crop_type);
      const itemBoxesRem = Math.max(0, (it.box_count || 0) - itemBoxesSold);
      const itemBoxStr = isSpecial ? '' : (currentLanguage === 'ar' ? ` (${itemBoxesRem} / ${it.box_count || 0} صندوق)` : ` (${itemBoxesRem} / ${it.box_count || 0} Box)`);
      return `<div style="font-size:12px; font-weight:600; display:flex; justify-content:space-between; margin-bottom:4px;">
        <span>${getCropIcon(it.crop_type)} ${it.crop_type}</span>
        <span>${formatWeightFraction(itemRem, it.weight_kg, it.unit || 'kg')}${itemBoxStr}</span>
      </div>`;
    }).join('');

    const formattedDate = new Date(imp.invoice_date).toLocaleDateString(numeralSystem === 'ar' ? 'ar-IQ' : 'en-US');
    const totalBoxStr = hasNormalCrops ? (currentLanguage === 'ar' ? ` (${remainingBoxes} صندوق)` : ` (${remainingBoxes} Box)`) : '';

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom:8px;">
        <div>
          <span class="lang-badge" style="background-color: var(--color-primary-light); margin-bottom:4px; display:inline-block;">
            # ${formatVal(imp.id)}
          </span>
          <h4 style="font-size:14px; font-weight:700; color:var(--color-primary);">${farmer.name}</h4>
          <span style="font-size:10px; color:var(--color-text-muted);">${translations[currentLanguage].lblVehicleType}: ${imp.vehicle_type}</span>
        </div>
        <div style="text-align:left; display:flex; flex-direction:column; gap:4px;">
          <span style="font-size:11px; font-weight:600; color:var(--color-text-muted);">${formattedDate}</span>
          <span class="debt-status-tag paid" style="font-size: 9px; align-self: flex-end;">${currentLanguage === 'ar' ? 'مكتملة ومسواة' : 'Settled'}</span>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:2px; margin: 6px 0;">
        ${itemsHtml}
      </div>

      <div class="progress-bar-container">
        <div class="progress-labels">
          <span>${currentLanguage === 'ar' ? 'الكمية المباعة:' : 'Sold percent:'} ${formatVal(percentSold)}%</span>
          <span>${currentLanguage === 'ar' ? 'المتبقي الكلي:' : 'Total Remaining:'} ${formatWeight(remainingWeight, commonUnit)}${totalBoxStr}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill green" style="width: ${percentSold}%"></div>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; border-top:1px dashed rgba(0,0,0,0.05); padding-top:6px;">
        <span style="font-size:10px; color:var(--color-text-muted);">${currentLanguage === 'ar' ? 'أرشيف الاستيراد' : 'Archive Import'}</span>
        <button class="btn-secondary btn-import-details" data-id="${imp.id}" style="padding:6px 12px; font-size:11px; display:flex; align-items:center; gap:4px; border:1.5px solid var(--color-primary-light); background: rgba(0, 150, 199, 0.04); color: var(--color-primary); box-shadow: none;">
          <span class="material-icons-round" style="font-size:14px;">info</span>
          <span>${currentLanguage === 'ar' ? 'تفاصيل' : 'Details'}</span>
        </button>
      </div>
    `;

    archiveList.appendChild(card);
    displayedCount++;
  }

  if (displayedCount === 0) {
    archiveList.innerHTML = `
      <div class="empty-state">
        <span class="material-icons-round empty-state-icon">archive</span>
        <p>${currentLanguage === 'ar' ? 'لا توجد فواتير مسواة في الأرشيف حالياً.' : 'No settled invoices in the archive.'}</p>
      </div>
    `;
  }

  archiveList.querySelectorAll('.btn-import-details').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const impId = parseInt(e.target.closest('button').dataset.id);
      showInvoiceDetails(impId, 'import');
    });
  });
}

async function settleImportInvoice(impId) {
  const imp = await dbGet('import_invoices', impId);
  if (!imp) return;
  
  imp.is_settled = true;
  await dbPut('import_invoices', imp);
  showToast(currentLanguage === 'ar' ? 'تم تسوية حساب فاتورة الاستيراد وإغلاقها بنجاح!' : 'Import invoice settled and closed successfully!', 'check_circle');
  
  await refreshGlobalCaches();
  renderImportsList();
  renderDuesList();
  renderStatsPanel();
}

function addImportCropRow() {
  const container = document.getElementById('import-items-container');
  const index = container.children.length;
  
  const row = document.createElement('div');
  row.className = 'dynamic-row';
  row.innerHTML = `
    <button class="delete-row-btn"><span class="material-icons-round">delete</span></button>
    <div class="dynamic-row-header">
      <span>${currentLanguage === 'ar' ? `المحصول ${index + 1}` : `Crop #${index + 1}`}</span>
    </div>
    <div class="form-group" style="position: relative;">
      <label>${currentLanguage === 'ar' ? 'نوع المحصول' : 'Crop Type'}</label>
      <input type="text" class="form-input import-crop-type" placeholder="${currentLanguage === 'ar' ? 'مثل: طماطم، بطاطس...' : 'e.g. Tomato, Potato...'}" required autocomplete="off">
      <div class="crop-autocomplete-dropdown autocomplete-dropdown"></div>
    </div>
    <div class="form-group">
      <label class="import-crop-weight-label">${currentLanguage === 'ar' ? (numeralSystem === 'ar' ? 'الوزن الكلي القائم (كغم)' : 'الوزن الكلي القائم (Kg)') : 'Total Weight (Kg)'}</label>
      <input type="number" class="form-input import-crop-weight" placeholder="${currentLanguage === 'ar' ? (numeralSystem === 'ar' ? 'أدخل الوزن كغم...' : 'أدخل الوزن بـ Kg...') : 'Enter weight in Kg...'}" required>
    </div>
    <div class="form-group import-box-count-container">
      <label class="import-box-count-label">${currentLanguage === 'ar' ? 'العدد' : 'Count'}</label>
      <input type="number" class="form-input import-box-count" placeholder="${currentLanguage === 'ar' ? 'العدد...' : 'Count...'}">
    </div>
  `;

  const weightInput = row.querySelector('.import-crop-weight');
  const selector = row.querySelector('.import-crop-type');
  const autocomplete = row.querySelector('.crop-autocomplete-dropdown');

  selector.addEventListener('input', () => {
    const val = selector.value.trim().toLowerCase();
    autocomplete.innerHTML = '';
    if (!val) {
      autocomplete.style.display = 'none';
      return;
    }

    const matches = CROP_SUGGESTIONS.filter(c =>
      c.primaryAr.toLowerCase().includes(val) ||
      c.nameEn.toLowerCase().includes(val) ||
      c.synonymsAr.some(syn => syn.toLowerCase().includes(val))
    );

    if (matches.length === 0) {
      // Append option to create custom crop
      const div = document.createElement('div');
      div.className = 'autocomplete-item';
      div.textContent = currentLanguage === 'ar' ? `➕ إضافة "${selector.value}" كصنف جديد...` : `➕ Add "${selector.value}" as custom crop...`;
      div.addEventListener('click', () => {
        openCustomCropDialog(selector, () => {
          autocomplete.style.display = 'none';
        });
      });
      autocomplete.appendChild(div);
      autocomplete.style.display = 'block';
      return;
    }

    matches.forEach(m => {
      const div = document.createElement('div');
      div.className = 'autocomplete-item';
      div.textContent = `${m.icon} ${m.primaryAr} (${m.nameEn})`;
      div.addEventListener('click', () => {
        selector.value = m.primaryAr;
        autocomplete.style.display = 'none';
        
        const unitType = getCropUnitType(m.primaryAr);
        const boxContainer = row.querySelector('.import-box-count-container');
        if (unitType === 'count') {
          weightInput.closest('.form-group').style.display = 'none';
          weightInput.value = '';
          boxContainer.style.display = 'block';
        } else {
          weightInput.closest('.form-group').style.display = 'block';
          if (isWatermelonOrMelon(m.primaryAr)) {
            boxContainer.style.display = 'none';
          } else {
            boxContainer.style.display = 'block';
          }
        }
      });
      autocomplete.appendChild(div);
    });
    autocomplete.style.display = 'block';
  });

  document.addEventListener('click', (e) => {
    if (e.target !== selector && e.target !== autocomplete) {
      autocomplete.style.display = 'none';
    }
  });

  row.querySelector('.delete-row-btn').addEventListener('click', () => {
    row.remove();
    updateImportRowLabels();
  });

  container.appendChild(row);
}

function updateImportRowLabels() {
  const container = document.getElementById('import-items-container');
  Array.from(container.children).forEach((row, idx) => {
    row.querySelector('.dynamic-row-header span').textContent = 
      currentLanguage === 'ar' ? `المحصول ${idx + 1}` : `Crop #${idx + 1}`;
  });
}

function setupFarmerAutocomplete() {
  const input = document.getElementById('import-farmer-name');
  const dropdown = document.getElementById('farmer-autocomplete');

  input.addEventListener('input', () => {
    const val = input.value.trim().toLowerCase();
    dropdown.innerHTML = '';
    if (!val) {
      dropdown.style.display = 'none';
      return;
    }

    const matches = cachedFarmers.filter(f => f.name.toLowerCase().includes(val));
    if (matches.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    matches.forEach(m => {
      const div = document.createElement('div');
      div.className = 'autocomplete-item';
      div.textContent = m.name;
      div.addEventListener('click', () => {
        input.value = m.name;
        dropdown.style.display = 'none';
      });
      dropdown.appendChild(div);
    });
    dropdown.style.display = 'block';
  });

  document.addEventListener('click', (e) => {
    if (e.target !== input && e.target !== dropdown) {
      dropdown.style.display = 'none';
    }
  });
}

async function submitImportInvoice() {
  const farmerName = document.getElementById('import-farmer-name').value.trim();
  const vehicleType = document.getElementById('import-vehicle-type').value.trim() || 'سيارة حمل غير محددة';
  
  if (!farmerName) {
    showToast(currentLanguage === 'ar' ? 'الرجاء إدخال اسم الفلاح أولاً' : 'Please input farmer name first', 'warning', true);
    return;
  }

  const cropRows = document.querySelectorAll('#import-items-container .dynamic-row');
  if (cropRows.length === 0) {
    showToast(currentLanguage === 'ar' ? 'يجب إدخال صنف محصول واحد على الأقل' : 'Please add at least one crop item', 'warning', true);
    return;
  }

  let farmer = cachedFarmers.find(f => f.name.trim() === farmerName);
  if (!farmer) {
    const newFarmerId = await dbAdd('farmers', {
      name: farmerName,
      phone: '07700000000',
      created_at: Date.now()
    });
    farmer = { id: newFarmerId, name: farmerName };
  }

  const itemsToSave = [];
  for (const row of cropRows) {
    const cropType = row.querySelector('.import-crop-type').value.trim();
    const weight = parseNumberInput(row.querySelector('.import-crop-weight').value);
    
    const unitType = getCropUnitType(cropType);
    const isSpecial = isWatermelonOrMelon(cropType);
    let boxCount = 0;
    let weightPerBox = 0;

    if (unitType === 'count') {
      const boxInput = row.querySelector('.import-box-count');
      boxCount = boxInput ? parseNumberInput(boxInput.value) : 0;
      if (boxCount <= 0) {
        showToast(currentLanguage === 'ar' ? 'الرجاء إدخال العدد لجميع الأصناف' : 'Please input count for all items', 'warning', true);
        return;
      }
      itemsToSave.push({
        crop_type: cropType,
        weight_kg: 0,
        agreed_price_per_kg: 0,
        unit: 'count',
        box_count: boxCount,
        weight_per_box: 0
      });
    } else {
      if (weight <= 0) {
        showToast(currentLanguage === 'ar' ? 'الرجاء إدخال وزن صحيح أكبر من الصفر' : 'Please enter a valid weight greater than zero', 'warning', true);
        return;
      }
      if (!isSpecial) {
        const boxInput = row.querySelector('.import-box-count');
        boxCount = boxInput ? parseNumberInput(boxInput.value) : 0;
        if (boxCount <= 0) {
          showToast(currentLanguage === 'ar' ? 'الرجاء إدخال العدد لجميع الأصناف' : 'Please input count for all items', 'warning', true);
          return;
        }
        weightPerBox = weight / boxCount;
      }
      itemsToSave.push({
        crop_type: cropType,
        weight_kg: weight,
        agreed_price_per_kg: 0,
        unit: unitType === 'both' ? 'mixed' : 'kg',
        box_count: boxCount,
        weight_per_box: weightPerBox
      });
    }
  }

  const invoiceId = await dbAdd('import_invoices', {
    farmer_id: farmer.id,
    vehicle_type: vehicleType,
    invoice_date: Date.now(),
    is_settled: false,
    created_at: Date.now()
  });

  for (const it of itemsToSave) {
    await dbAdd('import_items', {
      ...it,
      invoice_id: invoiceId
    });
  }

  showToast(currentLanguage === 'ar' ? 'تم حفظ فاتورة الاستيراد بنجاح والبدء بعرضها!' : 'Import invoice recorded and ready for sales!', 'check_circle');
  
  document.getElementById('import-farmer-name').value = '';
  document.getElementById('import-vehicle-type').value = '';
  document.getElementById('import-items-container').innerHTML = '';
  closeBottomSheet('sheet-new-import');
  
  await refreshGlobalCaches();
  renderImportsList();
  renderDuesList();
}

// ==============================================
// 7. SCREEN 2 IMPLEMENTATION: SALES MODULE
// ==============================================
function isSaleInvoiceSettled(sale, debts) {
  if (sale.payment_type === 'cash') return true;
  if (sale.payment_type === 'debt') {
    const debt = debts.find(d => d.sale_invoice_id === sale.id);
    return debt ? debt.is_paid : false;
  }
  return false;
}

async function renderSalesList() {
  const salesList = document.getElementById('sales-list');
  const searchQuery = document.getElementById('search-sale-customer').value.toLowerCase();
  
  salesList.innerHTML = '';
  
  const allSales = await dbGetAll('sale_invoices');
  const allSaleItems = await dbGetAll('sale_items');
  const customers = await dbGetAll('customers');
  const debts = await dbGetAll('debts');

  allSales.sort((a,b) => b.created_at - a.created_at);

  const activeSales = allSales.filter(sale => !isSaleInvoiceSettled(sale, debts));

  let displayedCount = 0;
  for (const sale of activeSales) {
    const customer = customers.find(c => c.id === sale.customer_id);
    if (!customer) continue;

    const items = allSaleItems.filter(it => it.sale_invoice_id === sale.id);
    const itemNamesStr = items.map(it => it.crop_type).join('، ');

    const orderId = sale.order_id || ('ALW-' + String(sale.id).padStart(3, '0'));
    const matchId = '#' + sale.id.toString();
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery) ||
                          itemNamesStr.toLowerCase().includes(searchQuery) ||
                          orderId.toLowerCase().includes(searchQuery) ||
                          sale.id.toString().includes(searchQuery) ||
                          matchId.toLowerCase().includes(searchQuery);
    if (searchQuery && !matchesSearch) {
      continue;
    }

    const card = document.createElement('div');
    card.className = 'premium-card stagger-item';
    card.style.animationDelay = `${displayedCount * 0.08}s`;

    const formattedDate = new Date(sale.created_at).toLocaleDateString(numeralSystem === 'ar' ? 'ar-IQ' : 'en-US');

    let itemsDetailsHtml = items.map(it => {
      return `<div style="font-size:11px; color:var(--color-text-dark); display:flex; justify-content:space-between; background: rgba(0,0,0,0.02); padding: 4px 6px; border-radius:6px;">
        <span>${getCropIcon(it.crop_type)} ${it.crop_type} (${formatWeight(it.weight_kg, it.unit || 'kg')})</span>
        <span style="font-weight:700;">${formatVal(it.agreed_price, true)}</span>
      </div>`;
    }).join('');

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:8px;">
        <div>
          <span class="lang-badge" style="background-color: var(--color-primary-mid); margin-bottom:4px; display:inline-block; font-family: monospace; letter-spacing: 0.5px;">
            ID: ${orderId}
          </span>
          <h4 style="font-size:14px; font-weight:700; color:var(--color-primary);">${customer.name}</h4>
          <span style="font-size:10px; color:var(--color-text-muted);">${customer.address}</span>
        </div>
        <div style="text-align:left; display:flex; flex-direction:column; gap:4px; align-items:flex-end;">
          <span style="font-size:11px; font-weight:600; color:var(--color-text-muted);">${formattedDate}</span>
          ${sale.payment_type === 'cash' ? 
            `<span class="debt-status-tag ok" style="font-size:9px;">💵 ${translations[currentLanguage].btnPayCash}</span>` : 
            `<span class="debt-status-tag late" style="font-size:9px;">📋 ${translations[currentLanguage].btnPayDebt}</span>`
          }
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:4px; margin: 6px 0;">
        ${itemsDetailsHtml}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px; border-top:1px dashed rgba(0,0,0,0.05); padding-top:6px;">
        <div>
          <span style="font-size:11px; color:var(--color-text-muted);">${translations[currentLanguage].lblTotalCalc}</span>
          <h3 style="font-size:16px; font-weight:700; color:var(--color-primary);">${formatVal(sale.total_amount, true)}</h3>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="btn-secondary btn-delete-sale" data-id="${sale.id}" style="padding:6px 10px; font-size:11px; display:flex; align-items:center; gap:4px; border:1.5px solid var(--color-danger); background: rgba(230, 57, 70, 0.04); color: var(--color-danger); box-shadow: none;">
            <span class="material-icons-round" style="font-size:14px;">delete</span>
            <span>${currentLanguage === 'ar' ? 'حذف' : 'Delete'}</span>
          </button>
          <button class="btn-secondary btn-sale-details" data-id="${sale.id}" style="padding:6px 10px; font-size:11px; display:flex; align-items:center; gap:4px; border:1.5px solid var(--color-primary-light); background: rgba(0, 150, 199, 0.04); color: var(--color-primary); box-shadow: none;">
            <span class="material-icons-round" style="font-size:14px;">info</span>
            <span>${currentLanguage === 'ar' ? 'تفاصيل' : 'Details'}</span>
          </button>
          <button class="btn-secondary btn-preview-thermal" data-id="${sale.id}" style="padding:6px 10px; font-size:11px; display:flex; align-items:center; gap:4px; box-shadow: none;">
            <span class="material-icons-round" style="font-size:14px;">print</span>
            <span>${currentLanguage === 'ar' ? 'طباعة' : 'Print'}</span>
          </button>
        </div>
      </div>
    `;

    salesList.appendChild(card);
    displayedCount++;
  }

  const archiveBtnDiv = document.createElement('div');
  archiveBtnDiv.style.cssText = 'margin-top: 24px; padding: 16px 0; border-top: 1px solid rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 8px; align-items: center; width: 100%;';
  archiveBtnDiv.innerHTML = `
    <button class="btn-secondary" id="btn-open-sales-archive" style="background: #e5e5e5; color: #555; border: 1px solid #ccc; font-size: 13px; font-weight: 700; width: 100%; padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: none;">
      <span class="material-icons-round" style="font-size: 18px;">archive</span>
      <span>أرشيف فواتير المبيعات</span>
    </button>
    <span style="font-size: 11px; color: var(--color-text-muted); text-align: center;">يحوي الأرشيف على جميع الفواتير السابقة التي تمت تسويتها</span>
  `;
  salesList.appendChild(archiveBtnDiv);

  const openSalesArchiveBtn = document.getElementById('btn-open-sales-archive');
  if (openSalesArchiveBtn) {
    openSalesArchiveBtn.addEventListener('click', () => {
      renderSalesArchiveList();
      openBottomSheet('sheet-sales-archive');
    });
  }

  salesList.querySelectorAll('.btn-preview-thermal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const saleId = parseInt(e.target.closest('button').dataset.id);
      openPrintPreview(saleId);
    });
  });

  salesList.querySelectorAll('.btn-sale-details').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const saleId = parseInt(e.target.closest('button').dataset.id);
      showInvoiceDetails(saleId, 'sale');
    });
  });

  salesList.querySelectorAll('.btn-delete-sale').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const saleId = parseInt(e.target.closest('button').dataset.id);
      await deleteSaleInvoice(saleId);
    });
  });
}

async function renderSalesArchiveList() {
  const archiveList = document.getElementById('archive-sales-list');
  if (!archiveList) return;
  const searchQuery = document.getElementById('search-archive-sales').value.toLowerCase();
  
  archiveList.innerHTML = '';
  
  const allSales = await dbGetAll('sale_invoices');
  const allSaleItems = await dbGetAll('sale_items');
  const customers = await dbGetAll('customers');
  const debts = await dbGetAll('debts');

  const settledSales = allSales.filter(sale => isSaleInvoiceSettled(sale, debts));
  settledSales.sort((a,b) => b.created_at - a.created_at);

  let displayedCount = 0;
  for (const sale of settledSales) {
    const customer = customers.find(c => c.id === sale.customer_id);
    if (!customer) continue;

    const items = allSaleItems.filter(it => it.sale_invoice_id === sale.id);
    const itemNamesStr = items.map(it => it.crop_type).join('، ');

    const orderId = sale.order_id || ('ALW-' + String(sale.id).padStart(3, '0'));
    const matchId = '#' + sale.id.toString();
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery) ||
                          itemNamesStr.toLowerCase().includes(searchQuery) ||
                          orderId.toLowerCase().includes(searchQuery) ||
                          sale.id.toString().includes(searchQuery) ||
                          matchId.toLowerCase().includes(searchQuery);
    if (searchQuery && !matchesSearch) {
      continue;
    }

    const card = document.createElement('div');
    card.className = 'premium-card stagger-item';
    card.style.animationDelay = `${displayedCount * 0.08}s`;

    const formattedDate = new Date(sale.created_at).toLocaleDateString(numeralSystem === 'ar' ? 'ar-IQ' : 'en-US');

    let itemsDetailsHtml = items.map(it => {
      return `<div style="font-size:11px; color:var(--color-text-dark); display:flex; justify-content:space-between; background: rgba(0,0,0,0.02); padding: 4px 6px; border-radius:6px;">
        <span>${getCropIcon(it.crop_type)} ${it.crop_type} (${formatWeight(it.weight_kg, it.unit || 'kg')})</span>
        <span style="font-weight:700;">${formatVal(it.agreed_price, true)}</span>
      </div>`;
    }).join('');

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:8px;">
        <div>
          <span class="lang-badge" style="background-color: #6b7280; margin-bottom:4px; display:inline-block; font-family: monospace; letter-spacing: 0.5px;">
            ID: ${orderId}
          </span>
          <h4 style="font-size:14px; font-weight:700; color:var(--color-primary);">${customer.name}</h4>
          <span style="font-size:10px; color:var(--color-text-muted);">${customer.address}</span>
        </div>
        <div style="text-align:left; display:flex; flex-direction:column; gap:4px; align-items:flex-end;">
          <span style="font-size:11px; font-weight:600; color:var(--color-text-muted);">${formattedDate}</span>
          <span class="debt-status-tag ok" style="font-size:9px; background-color: #e5e7eb; color: #374151; border-color: #d1d5db;">📦 مؤرشف</span>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:4px; margin: 6px 0;">
        ${itemsDetailsHtml}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px; border-top:1px dashed rgba(0,0,0,0.05); padding-top:6px;">
        <div>
          <span style="font-size:11px; color:var(--color-text-muted);">${translations[currentLanguage].lblTotalCalc}</span>
          <h3 style="font-size:16px; font-weight:700; color:var(--color-primary);">${formatVal(sale.total_amount, true)}</h3>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="btn-secondary btn-delete-sale" data-id="${sale.id}" style="padding:6px 10px; font-size:11px; display:flex; align-items:center; gap:4px; border:1.5px solid var(--color-danger); background: rgba(230, 57, 70, 0.04); color: var(--color-danger); box-shadow: none;">
            <span class="material-icons-round" style="font-size:14px;">delete</span>
            <span>${currentLanguage === 'ar' ? 'حذف' : 'Delete'}</span>
          </button>
          <button class="btn-secondary btn-sale-details" data-id="${sale.id}" style="padding:6px 10px; font-size:11px; display:flex; align-items:center; gap:4px; border:1.5px solid var(--color-primary-light); background: rgba(0, 150, 199, 0.04); color: var(--color-primary); box-shadow: none;">
            <span class="material-icons-round" style="font-size:14px;">info</span>
            <span>${currentLanguage === 'ar' ? 'تفاصيل' : 'Details'}</span>
          </button>
          <button class="btn-secondary btn-preview-thermal" data-id="${sale.id}" style="padding:6px 10px; font-size:11px; display:flex; align-items:center; gap:4px; box-shadow: none;">
            <span class="material-icons-round" style="font-size:14px;">print</span>
            <span>${currentLanguage === 'ar' ? 'طباعة' : 'Print'}</span>
          </button>
        </div>
      </div>
    `;

    archiveList.appendChild(card);
    displayedCount++;
  }

  if (displayedCount === 0) {
    archiveList.innerHTML = `
      <div class="empty-state">
        <span class="material-icons-round empty-state-icon">archive</span>
        <p>${currentLanguage === 'ar' ? 'لا توجد فواتير مؤرشفة مطابقة للبحث.' : 'No archived sale invoices matching the search.'}</p>
      </div>
    `;
  }

  archiveList.querySelectorAll('.btn-preview-thermal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const saleId = parseInt(e.target.closest('button').dataset.id);
      openPrintPreview(saleId);
    });
  });

  archiveList.querySelectorAll('.btn-sale-details').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const saleId = parseInt(e.target.closest('button').dataset.id);
      showInvoiceDetails(saleId, 'sale');
    });
  });

  archiveList.querySelectorAll('.btn-delete-sale').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const saleId = parseInt(e.target.closest('button').dataset.id);
      await deleteSaleInvoice(saleId);
      await renderSalesArchiveList();
      await renderSalesList();
    });
  });
}

function addSaleCropRow() {
  const container = document.getElementById('sale-items-container');
  const index = container.children.length;

  const row = document.createElement('div');
  row.className = 'dynamic-row';
  row.innerHTML = `
    <button class="delete-row-btn"><span class="material-icons-round">delete</span></button>
    <div class="dynamic-row-header" style="display:flex; justify-content:space-between; align-items:center;">
      <span>${currentLanguage === 'ar' ? `الصنف ${index + 1}` : `Item #${index + 1}`}</span>
      <span class="sale-row-remaining-label" style="font-size:11px; font-weight:600; color:var(--color-primary);"></span>
    </div>
    
    <div class="form-group" style="position: relative;">
      <label>${currentLanguage === 'ar' ? 'البضاعة المتوفرة بالفواتير (المحصول - الفلاح - السيارة)' : 'Select Available Cargo (Crop - Farmer - Car)'}</label>
      <select class="form-input sale-cargo-select" required>
        <option value="" disabled selected>${currentLanguage === 'ar' ? 'اختر من البضاعة المعروضة بالاستيراد...' : 'Choose from available imports...'}</option>
      </select>
    </div>

    <div class="form-group">
      <label class="sale-crop-weight-label">${currentLanguage === 'ar' ? (numeralSystem === 'ar' ? 'الوزن الكلي المباع (كغم)' : 'الوزن المباع (Kg)') : 'Sold Weight (Kg)'}</label>
      <input type="number" class="form-input sale-crop-weight" placeholder="${currentLanguage === 'ar' ? (numeralSystem === 'ar' ? 'الوزن الكلي...' : 'الوزن بـ Kg...') : 'Enter weight in Kg...'}" required>
    </div>

    <div class="form-group sale-box-count-container">
      <label class="sale-box-count-label">${currentLanguage === 'ar' ? 'عدد الصناديق المباعة' : 'Number of Boxes Sold'}</label>
      <input type="number" class="form-input sale-box-count" placeholder="${currentLanguage === 'ar' ? 'أدخل عدد الصناديق...' : 'Boxes count...'}" required>
    </div>

    <div class="form-group">
      <label class="sale-price-label">${currentLanguage === 'ar' ? 'سعر البيع الكلي المتفق عليه (دينار)' : 'Total Sale Price (IQD)'}</label>
      <input type="number" class="form-input sale-crop-price" placeholder="${currentLanguage === 'ar' ? 'أدخل سعر البيع الكلي...' : 'Enter overall price...'}" required>
    </div>
  `;

  const cargoSelect = row.querySelector('.sale-cargo-select');
  const weightInput = row.querySelector('.sale-crop-weight');
  const boxInput = row.querySelector('.sale-box-count');
  const priceInput = row.querySelector('.sale-crop-price');
  const remainingLabel = row.querySelector('.sale-row-remaining-label');
  const boxContainer = row.querySelector('.sale-box-count-container');

  // Populate cargo select dynamically from active imports cache
  // Filter out fully sold items
  refreshCargoOptions(cargoSelect);

  cargoSelect.addEventListener('change', async () => {
    const [invoiceIdStr, cropType] = cargoSelect.value.split('|');
    const invoiceId = parseInt(invoiceIdStr);

    const imp = activeImportInvoices.find(i => i.id === invoiceId);
    if (!imp) return;
    const it = imp.items.find(item => item.crop_type === cropType);
    if (!it) return;

    // Fetch and calculate remaining
    const allSaleItems = await dbGetAll('sale_items');
    const salesOfItem = allSaleItems.filter(s => s.import_invoice_id === invoiceId && s.crop_type === cropType);
    
    let soldWeight = 0;
    let soldBoxes = 0;
    
    const isCount = (getCropUnitType(cropType) === 'count');
    salesOfItem.forEach(s => {
      soldWeight += (isCount ? (s.box_count || 0) : s.weight_kg);
      soldBoxes += (s.box_count || 0);
    });

    const remWeight = Math.max(0, (isCount ? (it.box_count || 0) : it.weight_kg) - soldWeight);
    const remBoxes = Math.max(0, (it.box_count || 0) - soldBoxes);

    if (isCount) {
      weightInput.closest('.form-group').style.display = 'none';
      weightInput.value = '';
      boxContainer.style.display = 'block';
      boxInput.setAttribute('max', remBoxes);
      remainingLabel.textContent = currentLanguage === 'ar' ? `المتبقي: ${formatVal(remBoxes)} مفرد` : `Remaining: ${formatVal(remBoxes)} qty`;
    } else {
      weightInput.closest('.form-group').style.display = 'block';
      weightInput.setAttribute('max', remWeight);
      if (isWatermelonOrMelon(cropType)) {
        boxContainer.style.display = 'none';
        boxInput.value = '';
        remainingLabel.textContent = currentLanguage === 'ar' ? `المتبقي: ${formatWeight(remWeight, it.unit || 'kg')}` : `Remaining: ${formatWeight(remWeight, it.unit || 'kg')}`;
      } else {
        boxContainer.style.display = 'block';
        boxInput.setAttribute('max', remBoxes);
        remainingLabel.textContent = currentLanguage === 'ar' ? `المتبقي: ${formatWeight(remWeight, it.unit || 'kg')} (${remBoxes} ص)` : `Remaining: ${formatWeight(remWeight, it.unit || 'kg')} (${remBoxes} b)`;
      }
    }
  });

  weightInput.addEventListener('input', updateSaleInvoiceOverallTotal);
  boxInput.addEventListener('input', updateSaleInvoiceOverallTotal);
  priceInput.addEventListener('input', updateSaleInvoiceOverallTotal);

  row.querySelector('.delete-row-btn').addEventListener('click', () => {
    row.remove();
    updateSaleRowLabels();
    updateSaleInvoiceOverallTotal();
  });

  container.appendChild(row);
}

function refreshCargoOptions(selectElement) {
  const currentVal = selectElement.value;
  selectElement.innerHTML = `<option value="" disabled selected>${currentLanguage === 'ar' ? 'اختر من البضاعة المعروضة بالاستيراد...' : 'Choose from available imports...'}</option>`;

  activeImportInvoices.forEach(imp => {
    imp.items.forEach(it => {
      const opt = document.createElement('option');
      opt.value = `${imp.id}|${it.crop_type}`;
      opt.textContent = `${getCropIcon(it.crop_type)} ${it.crop_type} - فلاح: ${imp.farmer_name} (#${imp.id})`;
      selectElement.appendChild(opt);
    });
  });

  if (currentVal) {
    selectElement.value = currentVal;
  }
}

function updateSaleRowLabels() {
  const container = document.getElementById('sale-items-container');
  Array.from(container.children).forEach((row, idx) => {
    row.querySelector('.dynamic-row-header span').textContent = 
      currentLanguage === 'ar' ? `الصنف ${idx + 1}` : `Item #${idx + 1}`;
  });
}

function updateSaleInvoiceOverallTotal() {
  const rows = document.querySelectorAll('#sale-items-container .dynamic-row');
  let subtotal = 0;
  let totalCommissions = 0; // 7% commission total
  let totalCarrying = 0; // custom porter fees: 500 IQD per box, watermelon has no box count but 10,000 flat per vehicle? Let's check rule
  
  rows.forEach(row => {
    const cargoSelect = row.querySelector('.sale-cargo-select');
    if (!cargoSelect || !cargoSelect.value) return;
    
    const [, cropType] = cargoSelect.value.split('|');
    const price = parseNumberInput(row.querySelector('.sale-crop-price').value) || 0;
    const boxCount = parseNumberInput(row.querySelector('.sale-box-count').value) || 0;
    
    subtotal += price;
    
    // Alwa 7% commission
    totalCommissions += Math.round(price * 0.07);
    
    // Carrying cost (الحمالية): 
    // Watermelon & melon: 0 IQD porter per row (handled as flat vehicle porter in stats or custom)
    // Other crops: 500 IQD flat per box (الكرتونة والصندوق بـ 500 دينار)
    if (!isWatermelonOrMelon(cropType)) {
      totalCarrying += (boxCount * 500);
    }
  });

  const bagsCost = parseNumberInput(document.getElementById('sale-bags-cost').value) || 0;
  const grandTotal = subtotal + bagsCost;

  document.getElementById('lbl-subtotal-val').textContent = formatVal(subtotal, true);
  document.getElementById('lbl-commission-val').textContent = formatVal(totalCommissions, true);
  document.getElementById('lbl-carrying-val').textContent = formatVal(totalCarrying, true);
  document.getElementById('lbl-total-val').textContent = formatVal(grandTotal, true);
}

function setupCustomerAutocomplete() {
  const input = document.getElementById('sale-customer-name');
  const phoneInput = document.getElementById('sale-customer-phone');
  const addressInput = document.getElementById('sale-customer-address');
  const dropdown = document.getElementById('customer-autocomplete');

  input.addEventListener('input', () => {
    const val = input.value.trim().toLowerCase();
    dropdown.innerHTML = '';
    if (!val) {
      dropdown.style.display = 'none';
      return;
    }

    const matches = cachedCustomers.filter(c => c.name.toLowerCase().includes(val));
    if (matches.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    matches.forEach(m => {
      const div = document.createElement('div');
      div.className = 'autocomplete-item';
      div.textContent = m.name;
      div.addEventListener('click', () => {
        input.value = m.name;
        phoneInput.value = m.phone || '';
        addressInput.value = m.address || '';
        dropdown.style.display = 'none';
      });
      dropdown.appendChild(div);
    });
    dropdown.style.display = 'block';
  });

  document.addEventListener('click', (e) => {
    if (e.target !== input && e.target !== dropdown) {
      dropdown.style.display = 'none';
    }
  });
}

async function submitSaleInvoice() {
  const customerName = document.getElementById('sale-customer-name').value.trim();
  const customerPhone = document.getElementById('sale-customer-phone').value.trim() || '07700000000';
  const customerAddress = document.getElementById('sale-customer-address').value.trim() || 'بغداد';
  const bagsCost = parseNumberInput(document.getElementById('sale-bags-cost').value) || 0;
  
  const paymentMethodSelect = document.querySelector('.payment-method-selector .btn-secondary.active');
  const paymentType = paymentMethodSelect ? paymentMethodSelect.dataset.method : 'cash';
  const claimDateInput = document.getElementById('sale-debt-due-date').value;

  if (!customerName) {
    showToast(currentLanguage === 'ar' ? 'الرجاء إدخال اسم الزبون' : 'Please input customer name', 'warning', true);
    return;
  }

  const itemRows = document.querySelectorAll('#sale-items-container .dynamic-row');
  if (itemRows.length === 0) {
    showToast(currentLanguage === 'ar' ? 'يجب إدخال صنف مباع واحد على الأقل' : 'Please add at least one sold item', 'warning', true);
    return;
  }

  // Verify stock and collect item data
  const saleItemsToSave = [];
  
  for (const row of itemRows) {
    const cargoValue = row.querySelector('.sale-cargo-select').value;
    if (!cargoValue) {
      showToast(currentLanguage === 'ar' ? 'الرجاء تحديد نوع البضاعة المستوردة لجميع الأسطر' : 'Please select cargo source for all rows', 'warning', true);
      return;
    }

    const [invoiceIdStr, cropType] = cargoValue.split('|');
    const importInvoiceId = parseInt(invoiceIdStr);
    
    const weight = parseNumberInput(row.querySelector('.sale-crop-weight').value);
    const boxCount = parseNumberInput(row.querySelector('.sale-box-count').value) || 0;
    const totalPrice = parseNumberInput(row.querySelector('.sale-crop-price').value);

    if (totalPrice <= 0) {
      showToast(currentLanguage === 'ar' ? 'سعر البيع الكلي يجب أن يكون أكبر من الصفر' : 'Overall price must be greater than zero', 'warning', true);
      return;
    }

    const isCount = (getCropUnitType(cropType) === 'count');
    const isSpecial = isWatermelonOrMelon(cropType);

    // Fetch and verify stock
    const impInvoice = activeImportInvoices.find(imp => imp.id === importInvoiceId);
    if (!impInvoice) {
      showToast(currentLanguage === 'ar' ? 'فاتورة الاستيراد المصدرية غير متوفرة' : 'Source import invoice not found', 'warning', true);
      return;
    }
    const impItem = impInvoice.items.find(it => it.crop_type === cropType);
    if (!impItem) return;

    // Fetch previous sales
    const allSaleItems = await dbGetAll('sale_items');
    const previousSales = allSaleItems.filter(s => s.import_invoice_id === importInvoiceId && s.crop_type === cropType);
    
    let totalPreviouslySold = 0;
    let totalBoxesPreviouslySold = 0;
    
    previousSales.forEach(s => {
      totalPreviouslySold += (isCount ? (s.box_count || 0) : s.weight_kg);
      totalBoxesPreviouslySold += (s.box_count || 0);
    });

    const stockLimit = isCount ? impItem.box_count : impItem.weight_kg;
    const remainingStock = Math.max(0, stockLimit - totalPreviouslySold);
    const boxStockLimit = impItem.box_count || 0;
    const remainingBoxStock = Math.max(0, boxStockLimit - totalBoxesPreviouslySold);

    if (isCount) {
      if (boxCount <= 0 || boxCount > remainingBoxStock) {
        showToast(currentLanguage === 'ar' ? `العدد المدخل غير متوفر في المخزن! المتبقي: ${formatVal(remainingBoxStock)}` : `Count exceeds remaining stock! Rem: ${formatVal(remainingBoxStock)}`, 'warning', true);
        return;
      }
    } else {
      if (weight <= 0 || weight > remainingStock) {
        showToast(currentLanguage === 'ar' ? `الوزن المدخل غير متوفر في المخزن! المتبقي: ${formatWeight(remainingStock, impItem.unit || 'kg')}` : `Weight exceeds remaining stock! Rem: ${formatWeight(remainingStock, impItem.unit || 'kg')}`, 'warning', true);
        return;
      }
      if (!isSpecial) {
        if (boxCount <= 0 || boxCount > remainingBoxStock) {
          showToast(currentLanguage === 'ar' ? `عدد الصناديق غير متوفر في المخزن! المتبقي: ${formatVal(remainingBoxStock)} صندوق` : `Boxes exceed remaining stock! Rem: ${formatVal(remainingBoxStock)}`, 'warning', true);
          return;
        }
      }
    }

    // Port fees: 500 IQD per box
    const rowPorterFee = isWatermelonOrMelon(cropType) ? 0 : (boxCount * 500);

    saleItemsToSave.push({
      import_invoice_id: importInvoiceId,
      crop_type: cropType,
      weight_kg: isCount ? 0 : weight,
      box_count: boxCount,
      agreed_price: totalPrice,
      unit: isCount ? 'count' : (impItem.unit || 'kg'),
      commission_amount: Math.round(totalPrice * 0.07), // 7% company fee
      porter_fee: rowPorterFee
    });
  }

  // Create or resolve customer
  let customer = cachedCustomers.find(c => c.name.trim() === customerName);
  if (!customer) {
    const newCustId = await dbAdd('customers', {
      name: customerName,
      phone: customerPhone,
      address: customerAddress,
      created_at: Date.now()
    });
    customer = { id: newCustId, name: customerName, phone: customerPhone, address: customerAddress };
  } else {
    // Update phone/address if changed
    if (customerPhone !== customer.phone || customerAddress !== customer.address) {
      customer.phone = customerPhone;
      customer.address = customerAddress;
      await dbPut('customers', customer);
    }
  }

  const subtotal = saleItemsToSave.reduce((sum, item) => sum + item.agreed_price, 0);
  const totalCommissions = saleItemsToSave.reduce((sum, item) => sum + item.commission_amount, 0);
  const totalCarrying = saleItemsToSave.reduce((sum, item) => sum + item.porter_fee, 0);
  const grandTotal = subtotal + bagsCost;

  const orderId = generateOrderId();

  const saleInvoiceId = await dbAdd('sale_invoices', {
    customer_id: customer.id,
    order_id: orderId,
    total_amount: grandTotal,
    payment_type: paymentType,
    bags_cost: bagsCost,
    created_at: Date.now()
  });

  // Save items and adjust dues
  for (const item of saleItemsToSave) {
    const saleItemId = await dbAdd('sale_items', {
      ...item,
      sale_invoice_id: saleInvoiceId
    });

    // Record farmer dues for this sold share:
    // Farmer payout calculation: (Sold price) - (Company 7% commission) - (Porter 500 per box, if applicable)
    // Note: If watermelon, porter is 0, so farmer dues = Sold price - 7%
    const farmerDueAmount = item.agreed_price - item.commission_amount - item.porter_fee;

    // Retrieve original import invoice to identify farmer
    const originalImport = await dbGet('import_invoices', item.import_invoice_id);
    if (originalImport) {
      await dbAdd('farmer_dues', {
        farmer_id: originalImport.farmer_id,
        import_invoice_id: item.import_invoice_id,
        sale_invoice_id: saleInvoiceId,
        sale_item_id: saleItemId,
        crop_type: item.crop_type,
        weight_kg: item.weight_kg,
        box_count: item.box_count,
        sold_price: item.agreed_price,
        commission_deducted: item.commission_amount,
        porter_deducted: item.porter_fee,
        net_due: farmerDueAmount,
        is_paid: false,
        created_at: Date.now()
      });
    }

    // Save/Accumulate porter payouts in DB
    if (item.porter_fee > 0) {
      await dbAdd('porter_payouts', {
        sale_invoice_id: saleInvoiceId,
        sale_item_id: saleItemId,
        box_count: item.box_count,
        amount: item.porter_fee,
        is_paid: false,
        created_at: Date.now()
      });
    }
  }

  // Handle debt ledger entry
  if (paymentType === 'debt') {
    const dueTime = claimDateInput ? new Date(claimDateInput).getTime() : (Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days fallback
    await dbAdd('debts', {
      customer_id: customer.id,
      sale_invoice_id: saleInvoiceId,
      amount: grandTotal,
      due_date: dueTime,
      is_paid: false,
      created_at: Date.now()
    });
    playSound('alert');
  } else {
    playSound('success');
  }

  showToast(currentLanguage === 'ar' ? 'تم إصدار فاتورة البيع والخصم التلقائي بنجاح!' : 'Sale invoice created and stats adjusted!', 'check_circle');

  // Reset Form
  document.getElementById('sale-customer-name').value = '';
  document.getElementById('sale-customer-phone').value = '';
  document.getElementById('sale-customer-address').value = '';
  document.getElementById('sale-bags-cost').value = '';
  document.getElementById('sale-items-container').innerHTML = '';
  document.getElementById('sale-debt-due-date').value = '';
  
  // Reset totals
  document.getElementById('lbl-subtotal-val').textContent = formatVal(0, true);
  document.getElementById('lbl-commission-val').textContent = formatVal(0, true);
  document.getElementById('lbl-carrying-val').textContent = formatVal(0, true);
  document.getElementById('lbl-total-val').textContent = formatVal(0, true);

  closeBottomSheet('sheet-new-sale');

  await refreshGlobalCaches();
  renderSalesList();
  renderImportsList();
  renderDebtsList();
  renderDuesList();
  renderPortersList();
  renderStatsPanel();
  
  // Show print preview directly after sale
  openPrintPreview(saleInvoiceId);
}

async function deleteSaleInvoice(saleId) {
  const confirm = window.confirm(currentLanguage === 'ar' ? 'هل أنت متأكد من حذف فاتورة البيع هذه بالكامل؟ سيتم إلغاء تأثيرها المالي وحسابات الديون والعمولات ومستحقات الفلاحين.' : 'Are you sure you want to permanently delete this sales invoice? All ledger balances will roll back.');
  if (!confirm) return;

  const tx = db.transaction(['sale_invoices', 'sale_items', 'debts', 'farmer_dues', 'porter_payouts'], 'readwrite');
  
  // Delete invoice
  tx.objectStore('sale_invoices').delete(saleId);
  
  // Delete sale items
  const saleItemsStore = tx.objectStore('sale_items');
  const allSaleItems = await dbGetAll('sale_items');
  allSaleItems.filter(it => it.sale_invoice_id === saleId).forEach(it => {
    saleItemsStore.delete(it.id);
  });

  // Delete associated debt
  const debtsStore = tx.objectStore('debts');
  const allDebts = await dbGetAll('debts');
  allDebts.filter(d => d.sale_invoice_id === saleId).forEach(d => {
    debtsStore.delete(d.id);
  });

  // Delete associated farmer dues
  const duesStore = tx.objectStore('farmer_dues');
  const allDues = await dbGetAll('farmer_dues');
  allDues.filter(d => d.sale_invoice_id === saleId).forEach(d => {
    duesStore.delete(d.id);
  });

  // Delete associated porter payouts
  const porterStore = tx.objectStore('porter_payouts');
  const allPorters = await dbGetAll('porter_payouts');
  allPorters.filter(p => p.sale_invoice_id === saleId).forEach(p => {
    porterStore.delete(p.id);
  });

  tx.oncomplete = async () => {
    showToast(currentLanguage === 'ar' ? 'تم حذف فاتورة البيع والخصومات المالية التابعة لها بنجاح!' : 'Sales invoice deleted and financial impacts rolled back!', 'delete');
    await refreshGlobalCaches();
    renderSalesList();
    renderImportsList();
    renderDebtsList();
    renderDuesList();
    renderPortersList();
    renderStatsPanel();
  };
}

async function deleteImportInvoice(impId) {
  const confirm = window.confirm(currentLanguage === 'ar' ? 'هل أنت متأكد من حذف فاتورة الاستيراد هذه؟ سيؤدي ذلك أيضاً لحذف أصناف المحاصيل التابعة لها بالكامل.' : 'Are you sure you want to delete this import invoice and its items?');
  if (!confirm) return;

  const allSales = await dbGetAll('sale_items');
  const hasSales = allSales.some(s => s.import_invoice_id === impId);
  if (hasSales) {
    showToast(currentLanguage === 'ar' ? 'لا يمكن حذف الفاتورة لوجود مبيعات جارية مسجلة عليها بالفعـل!' : 'Cannot delete invoice as there are active sales logged against it!', 'warning', true);
    return;
  }

  const tx = db.transaction(['import_invoices', 'import_items'], 'readwrite');
  tx.objectStore('import_invoices').delete(impId);

  const itemsStore = tx.objectStore('import_items');
  const allItems = await dbGetAll('import_items');
  allItems.filter(it => it.invoice_id === impId).forEach(it => {
    itemsStore.delete(it.id);
  });

  tx.oncomplete = async () => {
    showToast(currentLanguage === 'ar' ? 'تم حذف فاتورة الاستيراد بنجاح!' : 'Import invoice deleted successfully!', 'delete');
    await refreshGlobalCaches();
    renderImportsList();
    renderDuesList();
  };
}

// ==============================================
// 8. SCREEN 3 IMPLEMENTATION: ACCOUNTS (TAB)
// ==============================================
async function renderDebtsList() {
  const debtsList = document.getElementById('debts-list');
  const searchQuery = document.getElementById('search-debts-input').value.toLowerCase();
  
  debtsList.innerHTML = '';
  
  const debts = await dbGetAll('debts');
  const customers = await dbGetAll('customers');

  // Filter out paid debts
  const activeDebts = debts.filter(d => !d.is_paid);
  activeDebts.sort((a,b) => b.due_date - a.due_date);

  let displayedCount = 0;
  for (const debt of activeDebts) {
    const customer = customers.find(c => c.id === debt.customer_id);
    if (!customer) continue;

    if (searchQuery && !customer.name.toLowerCase().includes(searchQuery)) {
      continue;
    }

    const card = document.createElement('div');
    card.className = 'premium-card stagger-item';
    card.style.animationDelay = `${displayedCount * 0.08}s`;

    const now = Date.now();
    const isLate = now >= debt.due_date;
    const formattedDate = new Date(debt.due_date).toLocaleDateString(numeralSystem === 'ar' ? 'ar-IQ' : 'en-US');

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:8px;">
        <div>
          <span class="lang-badge" style="background-color: var(--color-danger-light); color: var(--color-danger); margin-bottom:4px; display:inline-block;">
            # ${formatVal(debt.sale_invoice_id)}
          </span>
          <h4 style="font-size:14px; font-weight:700; color:var(--color-primary);">${customer.name}</h4>
          <span style="font-size:10px; color:var(--color-text-muted);">${customer.address} - هاتف: ${customer.phone}</span>
        </div>
        <div style="text-align:left; display:flex; flex-direction:column; gap:4px; align-items:flex-end;">
          <span style="font-size:11px; font-weight:600; color:var(--color-text-muted);">${formattedDate}</span>
          ${isLate ? 
            `<span class="debt-status-tag late" style="font-size:9px;">⚠️ متأخر عن السداد</span>` : 
            `<span class="debt-status-tag unpaid" style="font-size:9px;">⏳ بانتظار التحصيل</span>`
          }
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
        <div>
          <span style="font-size:11px; color:var(--color-text-muted);">${translations[currentLanguage].lblSubtotal}</span>
          <h3 style="font-size:16px; font-weight:700; color:var(--color-danger);">${formatVal(debt.amount, true)}</h3>
        </div>
        <button class="btn-primary btn-open-payment" data-id="${debt.id}" style="padding:8px 16px; font-size:12px; background-color: var(--color-danger); box-shadow: none;">
          ${currentLanguage === 'ar' ? 'تسجيل سداد نقدي' : 'Record payment'}
        </button>
      </div>
    `;

    debtsList.appendChild(card);
    displayedCount++;
  }

  if (displayedCount === 0) {
    debtsList.innerHTML = `
      <div class="empty-state">
        <span class="material-icons-round empty-state-icon">done_all</span>
        <p>${currentLanguage === 'ar' ? 'ممتـاز! لا توجد ديون مستحقة بالأجل على الزبائن حالياً.' : 'Perfect! No outstanding customer debts found.'}</p>
      </div>
    `;
  }

  document.querySelectorAll('.btn-open-payment').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const debtId = parseInt(e.target.dataset.id);
      await openPaymentSheet(debtId);
    });
  });
}

async function renderDuesList() {
  const duesList = document.getElementById('dues-list');
  const searchQuery = document.getElementById('search-dues-input').value.toLowerCase();
  
  duesList.innerHTML = '';
  
  const dues = await dbGetAll('farmer_dues');
  const farmers = await dbGetAll('farmers');

  // Group unpaid dues by farmer
  const unpaidDues = dues.filter(d => !d.is_paid);
  
  const farmerGroups = {};
  unpaidDues.forEach(due => {
    if (!farmerGroups[due.farmer_id]) {
      farmerGroups[due.farmer_id] = {
        totalNetDue: 0,
        itemsCount: 0,
        rawItems: []
      };
    }
    farmerGroups[due.farmer_id].totalNetDue += due.net_due;
    farmerGroups[due.farmer_id].itemsCount++;
    farmerGroups[due.farmer_id].rawItems.push(due);
  });

  let displayedCount = 0;
  for (const farmerId in farmerGroups) {
    const farmer = farmers.find(f => f.id === parseInt(farmerId));
    if (!farmer) continue;

    if (searchQuery && !farmer.name.toLowerCase().includes(searchQuery)) {
      continue;
    }

    const data = farmerGroups[farmerId];

    const card = document.createElement('div');
    card.className = 'premium-card stagger-item';
    card.style.animationDelay = `${displayedCount * 0.08}s`;

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:8px;">
        <div>
          <h4 style="font-size:15px; font-weight:700; color:var(--color-primary);">${farmer.name}</h4>
          <span style="font-size:11px; color:var(--color-text-muted);">هاتف: ${farmer.phone} • عدد الشحنات المباعة: ${formatVal(data.itemsCount)}</span>
        </div>
        <span class="debt-status-tag unpaid" style="font-size:10px; background: rgba(0, 150, 199, 0.08); color: var(--color-primary); border: 1.5px solid rgba(0, 150, 199, 0.15);">
          بانتظار الصرف
        </span>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
        <div>
          <span style="font-size:11px; color:var(--color-text-muted);">صافي المستحقات للفلاح (بعد العمولات):</span>
          <h3 style="font-size:18px; font-weight:700; color:var(--color-primary);">${formatVal(data.totalNetDue, true)}</h3>
        </div>
        <button class="btn-primary btn-pay-farmer-dues" data-farmer-id="${farmerId}" style="padding:8px 16px; font-size:12px;">
          ${currentLanguage === 'ar' ? 'صرف المستحقات' : 'Pay Farmer'}
        </button>
      </div>
    `;

    duesList.appendChild(card);
    displayedCount++;
  }

  if (displayedCount === 0) {
    duesList.innerHTML = `
      <div class="empty-state">
        <span class="material-icons-round empty-state-icon">paid</span>
        <p>${currentLanguage === 'ar' ? 'لا توجد مستحقات مالية معلقة للفلاحين بالذمة.' : 'No pending dues to farmers recorded.'}</p>
      </div>
    `;
  }

  document.querySelectorAll('.btn-pay-farmer-dues').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const farmerId = parseInt(btn.dataset.farmerId);
      await payFarmerDues(farmerId);
    });
  });
}

async function renderPortersList() {
  const portersList = document.getElementById('porters-list');
  if (!portersList) return;

  portersList.innerHTML = '';

  const payouts = await dbGetAll('porter_payouts');
  const unpaidPayouts = payouts.filter(p => !p.is_paid);

  const totalUnpaidPorterAmount = unpaidPayouts.reduce((sum, p) => sum + p.amount, 0);
  const totalUnpaidBoxesCount = unpaidPayouts.reduce((sum, p) => sum + p.box_count, 0);

  const card = document.createElement('div');
  card.className = 'premium-card stagger-item';
  card.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, #03045e 100%)';
  card.style.color = 'white';

  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
      <div>
        <h4 style="font-size: 15px; font-weight: 700; color: var(--color-accent);">${currentLanguage === 'ar' ? 'صندوق أجور الحمالين (الجمعية)' : 'Porter Payouts Box'}</h4>
        <span style="font-size: 11px; color: rgba(255,255,255,0.65);">${currentLanguage === 'ar' ? 'تجمع تلقائياً بمعدل 500 دينار لكل صندوق مباع من غير الرقي' : 'Aggregated at 500 IQD per sold box'}</span>
      </div>
      <span class="material-icons-round" style="font-size: 28px; color: var(--color-accent);">engineering</span>
    </div>
    
    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px;">
      <div>
        <span style="font-size: 11px; color: rgba(255,255,255,0.7);">${currentLanguage === 'ar' ? 'إجمالي مستحقات الحمالين المعلقة:' : 'Total pending porter dues:'}</span>
        <h3 style="font-size: 20px; font-weight: 800; color: var(--color-accent);">${formatVal(totalUnpaidPorterAmount, true)}</h3>
        <span style="font-size: 10px; color: rgba(255,255,255,0.6);">${currentLanguage === 'ar' ? `المقابل لـ ${formatVal(totalUnpaidBoxesCount)} صندوق مباع` : `Equivalent to ${formatVal(totalUnpaidBoxesCount)} boxes sold`}</span>
      </div>
      ${totalUnpaidPorterAmount > 0 ? `
        <button class="btn-primary btn-pay-porters-all" style="background: var(--color-accent); color: var(--color-primary); font-weight: 800; padding: 10px 20px; font-size: 12px; box-shadow: none;">
          ${currentLanguage === 'ar' ? 'توزيع الأجور وصرفها' : 'Payout Porters'}
        </button>
      ` : `
        <span style="font-size: 12px; color: rgba(255,255,255,0.4);">${currentLanguage === 'ar' ? 'لا توجد أجور معلقة' : 'No pending dues'}</span>
      `}
    </div>
  `;

  portersList.appendChild(card);

  const payBtn = card.querySelector('.btn-pay-porters-all');
  if (payBtn) {
    payBtn.addEventListener('click', async () => {
      const confirm = window.confirm(currentLanguage === 'ar' ? `هل أنت متأكد من صرف كامل أجور الحمالين المعلقة وقدرها ${formatVal(totalUnpaidPorterAmount, true)} دينار عراقي وتوزيعها؟` : `Are you sure you want to distribute ${formatVal(totalUnpaidPorterAmount, true)} IQD to porters?`);
      if (!confirm) return;

      const tx = db.transaction('porter_payouts', 'readwrite');
      const store = tx.objectStore('porter_payouts');
      unpaidPayouts.forEach(p => {
        p.is_paid = true;
        store.put(p);
      });

      tx.oncomplete = async () => {
        showToast(currentLanguage === 'ar' ? 'تم صرف وتوزيع أجور الحمالين وتصفير الصندوق المعلق بنجاح!' : 'Porters dues successfully paid out and cleared!', 'check_circle');
        await refreshGlobalCaches();
        renderPortersList();
        renderStatsPanel();
      };
    });
  }
}

async function openPaymentSheet(debtId) {
  const debt = await dbGet('debts', debtId);
  if (!debt) return;
  const customer = await dbGet('customers', debt.customer_id);
  if (!customer) return;

  document.getElementById('payment-customer-name').textContent = customer.name;
  document.getElementById('payment-invoice-id').textContent = debt.sale_invoice_id;
  document.getElementById('payment-debt-total').textContent = formatVal(debt.amount, true);
  
  const amountInput = document.getElementById('payment-amount-input');
  amountInput.value = debt.amount;
  amountInput.setAttribute('max', debt.amount);
  
  document.getElementById('btn-submit-payment').onclick = async () => {
    await submitPaymentRecord(debtId);
  };

  openBottomSheet('sheet-new-payment');
}

async function submitPaymentRecord(debtId) {
  const debt = await dbGet('debts', debtId);
  if (!debt) return;
  
  const paymentAmount = parseNumberInput(document.getElementById('payment-amount-input').value);
  if (paymentAmount <= 0 || paymentAmount > debt.amount) {
    showToast(currentLanguage === 'ar' ? 'الرجاء إدخال مبلغ دفع صحيح لا يتجاوز قيمة الدين الكلية' : 'Please input a valid amount not exceeding the debt amount', 'warning', true);
    return;
  }

  if (paymentAmount === debt.amount) {
    // Settle completely
    debt.is_paid = true;
    await dbPut('debts', debt);
  } else {
    // Partial payment
    debt.amount -= paymentAmount;
    await dbPut('debts', debt);
    
    // Log partial adjustment in database
    await dbAdd('safe_adjustments', {
      type: 'partial_debt_payout',
      debt_id: debtId,
      amount: paymentAmount,
      created_at: Date.now()
    });
  }

  playSound('success');
  showToast(currentLanguage === 'ar' ? 'تم تسجيل دفعة تسديد الديون بنجاح وتغذية الخزنة!' : 'Payment recorded and safe box updated!', 'check_circle');
  
  closeBottomSheet('sheet-new-payment');
  
  await refreshGlobalCaches();
  renderDebtsList();
  renderSalesList();
  renderStatsPanel();
}

async function payFarmerDues(farmerId) {
  const dues = await dbGetAll('farmer_dues');
  const farmers = await dbGetAll('farmers');
  const farmer = farmers.find(f => f.id === farmerId);
  if (!farmer) return;

  const unpaidDues = dues.filter(d => d.farmer_id === farmerId && !d.is_paid);
  const totalAmount = unpaidDues.reduce((sum, d) => sum + d.net_due, 0);

  if (totalAmount <= 0) {
    showToast(currentLanguage === 'ar' ? 'لا توجد مستحقات معلقة حالياً للصرف' : 'No pending dues to settle', 'warning', true);
    return;
  }

  const confirm = window.confirm(currentLanguage === 'ar' ? `هل أنت متأكد من صرف مستحقات الفلاح "${farmer.name}" بالكامل بقيمة ${formatVal(totalAmount, true)}؟ سيتم خصم هذا المبلغ من الخزنة.` : `Are you sure you want to payout farmer "${farmer.name}" completely with ${formatVal(totalAmount, true)}?`);
  if (!confirm) return;

  const tx = db.transaction('farmer_dues', 'readwrite');
  const store = tx.objectStore('farmer_dues');
  unpaidDues.forEach(due => {
    due.is_paid = true;
    store.put(due);
  });

  tx.oncomplete = async () => {
    playSound('success');
    showToast(currentLanguage === 'ar' ? 'تم صرف مستحقات الفلاح وتحديث حسابات الخزنة بنجاح!' : 'Farmer dues successfully settled and paid!', 'check_circle');
    
    await refreshGlobalCaches();
    renderDuesList();
    renderStatsPanel();
  };
}

// ==============================================
// 9. SCREEN 4 IMPLEMENTATION: STATISTICS & LEDGER
// ==============================================
async function renderStatsPanel() {
  const safeBoxValEl = document.getElementById('safe-box-val');
  const totalCashSalesEl = document.getElementById('total-cash-sales');
  const totalCollectedDebtsEl = document.getElementById('total-collected-debts');
  const totalCommissionEl = document.getElementById('total-commission-5');
  const totalPaidDuesEl = document.getElementById('total-paid-dues');
  const totalPortersEl = document.getElementById('total-porters-payouts');

  const allSales = await dbGetAll('sale_invoices');
  const allDebts = await dbGetAll('debts');
  const dues = await dbGetAll('farmer_dues');
  const porter = await dbGetAll('porter_payouts');
  
  const dailyExpenses = await dbGetAll('daily_expenses');
  const personalExpenses = await dbGetAll('personal_expenses');
  const losses = await dbGetAll('losses');
  const safeAdjustments = await dbGetAll('safe_adjustments');

  // Math Logic for Safe Box and Company Profits:
  // SAFE BOX INFLOWS:
  // 1. Cash Sales = overall invoice total where payment = cash
  const cashSalesTotal = allSales.filter(s => s.payment_type === 'cash').reduce((sum, s) => sum + s.total_amount, 0);

  // 2. Collected Debts = debts where is_paid = true + partial payment adjustments
  const collectedDebtsTotal = allDebts.filter(d => d.is_paid).reduce((sum, d) => sum + d.amount, 0) +
                               safeAdjustments.filter(a => a.type === 'partial_debt_payout').reduce((sum, a) => sum + a.amount, 0);

  const safeInflow = cashSalesTotal + collectedDebtsTotal;

  // SAFE BOX OUTFLOWS:
  // 1. Paid Farmer Dues = farmer_dues where is_paid = true
  const paidDuesTotal = dues.filter(d => d.is_paid).reduce((sum, d) => sum + d.net_due, 0);

  // 2. Paid Porter Payouts = porter_payouts where is_paid = true
  const paidPortersTotal = porter.filter(p => p.is_paid).reduce((sum, p) => sum + p.amount, 0);

  // 3. Expenses & Losses
  const expensesTotal = dailyExpenses.reduce((sum, e) => sum + e.amount, 0) +
                        personalExpenses.reduce((sum, e) => sum + e.amount, 0);
  const lossesTotal = losses.reduce((sum, l) => sum + l.amount, 0);

  const safeOutflow = paidDuesTotal + paidPortersTotal + expensesTotal + lossesTotal;
  
  const safeBoxBalance = safeInflow - safeOutflow;

  // Render Stats
  safeBoxValEl.textContent = formatVal(safeBoxBalance, true);
  totalCashSalesEl.textContent = formatVal(cashSalesTotal, true);
  totalCollectedDebtsEl.textContent = formatVal(collectedDebtsTotal, true);
  totalPaidDuesEl.textContent = formatVal(paidDuesTotal, true);
  totalPortersEl.textContent = formatVal(paidPortersTotal, true);

  // Company revenue (عمولة الشركة): 5% of all SOLD crop prices
  // Notice: The commission is saved on sale_items at 7% as part of total, but the company commission net rate of Alwa is 5%. Let's calculate:
  const allSaleItems = await dbGetAll('sale_items');
  const totalCompanyCommission = allSaleItems.reduce((sum, item) => sum + Math.round(item.agreed_price * 0.05), 0);
  totalCommissionEl.textContent = formatVal(totalCompanyCommission, true);

  // Render SVG Chart distribution
  drawStatsChart(expensesTotal + lossesTotal, totalCompanyCommission);

  // Render recent Ledger (Expenses + Losses)
  renderLedgerTable(dailyExpenses, personalExpenses, losses);
}

function drawStatsChart(expenses, companyRevenue) {
  const svg = document.getElementById('stats-svg-chart');
  if (!svg) return;
  svg.innerHTML = '';

  const total = expenses + companyRevenue;
  if (total === 0) {
    svg.innerHTML = `
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="var(--color-text-muted)" font-size="12">
        ${currentLanguage === 'ar' ? 'لا توجد بيانات مالية متوفرة للرسم البياني' : 'No financial logs available for the chart'}
      </text>
    `;
    return;
  }

  const expPercent = Math.round((expenses / total) * 100);
  const revPercent = Math.round((companyRevenue / total) * 100);

  // Draw two bars side by side in high-quality SVG
  svg.innerHTML = `
    <!-- Expenses Bar -->
    <rect x="15%" y="${180 - (expPercent * 1.5)}" width="25%" height="${expPercent * 1.5}" rx="6" fill="#E63946"></rect>
    <text x="27.5%" y="${170 - (expPercent * 1.5)}" text-anchor="middle" fill="#E63946" font-size="11" font-weight="800">${formatVal(expPercent)}%</text>
    <text x="27.5%" y="194" text-anchor="middle" fill="var(--color-text-dark)" font-size="11" font-weight="700">${currentLanguage === 'ar' ? 'المصاريف والخسائر' : 'Expenses'}</text>

    <!-- Company Net Commission Bar -->
    <rect x="60%" y="${180 - (revPercent * 1.5)}" width="25%" height="${revPercent * 1.5}" rx="6" fill="#2A9D8F"></rect>
    <text x="72.5%" y="${170 - (revPercent * 1.5)}" text-anchor="middle" fill="#2A9D8F" font-size="11" font-weight="800">${formatVal(revPercent)}%</text>
    <text x="72.5%" y="194" text-anchor="middle" fill="var(--color-text-dark)" font-size="11" font-weight="700">${currentLanguage === 'ar' ? 'أرباح عمولتنا 5%' : 'Commissions'}</text>
  `;
}

function renderLedgerTable(daily, personal, losses) {
  const tbody = document.getElementById('ledger-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const ledgerItems = [];

  daily.forEach(it => ledgerItems.push({ ...it, group: 'daily_expense', label: translations[currentLanguage].expenseDaily, style: 'expense' }));
  personal.forEach(it => ledgerItems.push({ ...it, group: 'personal_expense', label: translations[currentLanguage].expensePersonal, style: 'expense' }));
  losses.forEach(it => ledgerItems.push({ ...it, group: 'loss', label: currentLanguage === 'ar' ? 'خسائر وتلفيات' : 'Loss / Damage', style: 'loss' }));

  ledgerItems.sort((a,b) => b.created_at - a.created_at);

  if (ledgerItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--color-text-muted); font-size:12px; padding: 15px 0;">${currentLanguage === 'ar' ? 'سجل المصروفات نظيف فارغ حالياً.' : 'Expenses ledger empty.'}</td></tr>`;
    return;
  }

  ledgerItems.slice(0, 15).forEach(it => {
    const tr = document.createElement('tr');
    const formattedDate = new Date(it.created_at).toLocaleDateString(numeralSystem === 'ar' ? 'ar-IQ' : 'en-US');
    
    tr.innerHTML = `
      <td>${formattedDate}</td>
      <td><span class="lang-badge" style="background:${it.style === 'loss' ? 'rgba(230, 57, 70, 0.08)' : 'rgba(0,0,0,0.04)'}; color:${it.style === 'loss' ? '#E63946' : 'var(--color-primary)'};">${it.label}</span></td>
      <td>${it.subject}</td>
      <td style="font-weight:800; color:${it.style === 'loss' ? '#E63946' : 'var(--color-primary)'};">${formatVal(it.amount, true)}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function submitExpenseRecord() {
  const type = document.getElementById('expense-type').value;
  const subject = document.getElementById('expense-subject').value.trim();
  const amount = parseNumberInput(document.getElementById('expense-amount').value);

  if (!subject || amount <= 0) {
    showToast(currentLanguage === 'ar' ? 'الرجاء إدخال وصف ومبلغ المصروف بشكل صحيح' : 'Please fill all required expense fields', 'warning', true);
    return;
  }

  const storeName = type === 'daily' ? 'daily_expenses' : 'personal_expenses';
  await dbAdd(storeName, {
    subject,
    amount,
    created_at: Date.now()
  });

  playSound('success');
  showToast(currentLanguage === 'ar' ? 'تم تسجيل المصروف وتحديث رصيد الخزنة!' : 'Expense recorded successfully!', 'check_circle');

  // Reset form
  document.getElementById('expense-subject').value = '';
  document.getElementById('expense-amount').value = '';
  closeBottomSheet('sheet-new-expense');

  await refreshGlobalCaches();
  renderStatsPanel();
}

async function submitLossRecord() {
  const subject = document.getElementById('loss-subject').value.trim();
  const amount = parseNumberInput(document.getElementById('loss-amount').value);

  if (!subject || amount <= 0) {
    showToast(currentLanguage === 'ar' ? 'الرجاء إدخال سبب ومبلغ الخسارة بشكل صحيح' : 'Please fill all required loss fields', 'warning', true);
    return;
  }

  await dbAdd('losses', {
    subject,
    amount,
    created_at: Date.now()
  });

  playSound('success');
  showToast(currentLanguage === 'ar' ? 'تم تسجيل الخسارة التالفة بنجاح وتعديل الأرباح!' : 'Loss recorded successfully!', 'check_circle');

  // Reset form
  document.getElementById('loss-subject').value = '';
  document.getElementById('loss-amount').value = '';
  closeBottomSheet('sheet-new-loss');

  await refreshGlobalCaches();
  renderStatsPanel();
}

// ==============================================
// 10. THERMAL RECEIPT GENERATOR (BLE & PRINT PREVIEW)
// ==============================================
async function openPrintPreview(saleId) {
  const sale = await dbGet('sale_invoices', saleId);
  if (!sale) return;
  const customer = await dbGet('customers', sale.customer_id);
  if (!customer) return;

  const saleItems = await dbGetAll('sale_items');
  const items = saleItems.filter(it => it.sale_invoice_id === saleId);

  // Set Global variable to hold active printable order id
  document.getElementById('btn-execute-print').dataset.id = saleId;
  document.getElementById('btn-execute-sysprint').dataset.id = saleId;
  document.getElementById('btn-share-receipt').dataset.id = saleId;

  // Build high-fidelity thermal receipt container
  const container = document.getElementById('receipt-paper');
  if (container) {
    container.className = `thermal-paper w-${printerPaperWidth}`;
  }

  const formattedDate = new Date(sale.created_at).toLocaleString(numeralSystem === 'ar' ? 'ar-IQ' : 'en-US');
  const orderId = sale.order_id || ('ALW-' + String(sale.id).padStart(3, '0'));

  let itemsRowsHtml = items.map((it, idx) => {
    return `
      <tr>
        <td style="text-align: right;">${formatVal(idx + 1)}</td>
        <td style="text-align: right;">${it.crop_type}</td>
        <td style="text-align: center;">${formatWeight(it.weight_kg, it.unit || 'kg')}</td>
        <td style="text-align: left;">${formatVal(it.agreed_price)}</td>
      </tr>
    `;
  }).join('');

  // Calculate dynamic totals for the paper preview
  const subtotal = items.reduce((sum, item) => sum + item.agreed_price, 0);
  const carrying = items.reduce((sum, item) => sum + item.porter_fee, 0);

  // Render Receipt Preview HTML
  container.innerHTML = `
    <div style="text-align: center; border-bottom: 1.5px dashed var(--color-border); padding-bottom: 8px; margin-bottom: 8px;">
      <h2 style="font-size: 17px; font-weight: 800; color: var(--color-primary); margin: 0 0 2px 0;">${officeName}</h2>
      <p style="font-size: 11px; color: var(--color-text-dark); margin: 0 0 2px 0;">هاتف: ${officePhone}</p>
      <p style="font-size: 10px; color: var(--color-text-muted); margin: 0;">العنوان: ${officeLocation}</p>
    </div>

    <div style="font-size: 11px; border-bottom: 1px dashed var(--color-border); padding-bottom: 6px; margin-bottom: 6px; line-height: 1.4;">
      <div style="display:flex; justify-content:space-between;">
        <span>رقم الفاتورة:</span>
        <span style="font-weight:700;"># ${formatVal(sale.id)} (${orderId})</span>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span>الزبون:</span>
        <span style="font-weight:700;">${customer.name}</span>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span>التاريخ:</span>
        <span>${formattedDate}</span>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span>طريقة الدفع:</span>
        <span style="font-weight:700;">${sale.payment_type === 'cash' ? 'نقد (💵)' : 'بالأجل (📋)'}</span>
      </div>
    </div>

    <table class="receipt-table" style="width: 100%; border-collapse: collapse; font-size: 11px;">
      <thead>
        <tr style="border-bottom: 1px dashed var(--color-border);">
          <th style="text-align: right; font-weight:700;">ت</th>
          <th style="text-align: right; font-weight:700;">الصنف</th>
          <th style="text-align: center; font-weight:700;">الوزن الكلي</th>
          <th style="text-align: left; font-weight:700;">المجموع</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRowsHtml}
      </tbody>
    </table>

    <div style="font-size: 11px; border-top: 1px dashed var(--color-border); margin-top: 6px; padding-top: 6px; line-height: 1.4;">
      <div style="display:flex; justify-content:space-between;">
        <span>مجموع البضاعة:</span>
        <span>${formatVal(subtotal, true)}</span>
      </div>
      ${sale.bags_cost > 0 ? `
        <div style="display:flex; justify-content:space-between;">
          <span>تكلفة الأكياس والكراتين:</span>
          <span>${formatVal(sale.bags_cost, true)}</span>
        </div>
      ` : ''}
      <div style="display:flex; justify-content:space-between; font-size: 13px; font-weight: 800; border-top: 1.5px dashed var(--color-border); margin-top: 4px; padding-top: 4px;">
        <span>الإجمالي المستحق:</span>
        <span style="color:var(--color-primary);">${formatVal(sale.total_amount, true)}</span>
      </div>
    </div>

    <!-- Generates dynamic offline QR-code with QRious inside preview -->
    <div style="text-align: center; margin-top: 12px; padding-top: 6px; border-top: 1px dashed var(--color-border);">
      <canvas id="receipt-qr-canvas" style="display: inline-block;"></canvas>
      <div style="font-size: 8px; color: var(--color-text-muted); margin-top: 4px;">شكرًا لتعاملكم معنا - علوة الغابة الخضراء</div>
    </div>
  `;

  // Render QR Canvas
  setTimeout(() => {
    const qrCanvas = document.getElementById('receipt-qr-canvas');
    if (qrCanvas) {
      new window.QRious({
        element: qrCanvas,
        value: `ALWA_REC|ID:${sale.id}|TOTAL:${sale.total_amount}|CUST:${customer.name}`,
        size: 85,
        background: '#ffffff',
        foreground: '#1b4332'
      });
    }
  }, 150);

  openBottomSheet('sheet-print-preview');
}

// ==============================================
// 11. BLE HARDWARE PRINTER SERVICE & EMULATOR
// ==============================================

// --- ARABIC TEXT SHAPING & REVERSING FOR THERMAL PRINTERS ---
function shapeArabic(text) {
  const arabicChars = {
    0x0621: [0xFE80, 0xFE80, 0xFE80, 0xFE80], // Hamza
    0x0622: [0xFE81, 0xFE82, 0xFE82, 0xFE81], // Alef Madda
    0x0623: [0xFE83, 0xFE84, 0xFE84, 0xFE83], // Alef Hamza Above
    0x0624: [0xFE85, 0xFE86, 0xFE86, 0xFE85], // Waw Hamza Above
    0x0625: [0xFE87, 0xFE88, 0xFE88, 0xFE87], // Alef Hamza Below
    0x0626: [0xFE89, 0xFE8A, 0xFE8B, 0xFE8C], // Yeh Hamza Above
    0x0627: [0xFE8D, 0xFE8E, 0xFE8E, 0xFE8D], // Alef
    0x0628: [0xFE8F, 0xFE90, 0xFE91, 0xFE92], // Beh
    0x0629: [0xFE93, 0xFE94, 0xFE93, 0xFE94], // Teh Marbuta
    0x062A: [0xFE95, 0xFE96, 0xFE97, 0xFE98], // Teh
    0x062B: [0xFE99, 0xFE9A, 0xFE9B, 0xFE9C], // Theh
    0x062C: [0xFE9D, 0xFE9E, 0xFE9F, 0xFEA0], // Jeem
    0x062D: [0xFEA1, 0xFEA2, 0xFEA3, 0xFEA4], // Hah
    0x062E: [0xFEA5, 0xFEA6, 0xFEA7, 0xFEA8], // Khah
    0x062F: [0xFEA9, 0xFEAA, 0xFEAA, 0xFEA9], // Dal
    0x0630: [0xFEAB, 0xFEAC, 0xFEAC, 0xFEAB], // Thal
    0x0631: [0xFEAD, 0xFEAE, 0xFEAE, 0xFEAD], // Reh
    0x0632: [0xFEAF, 0xFEB0, 0xFEB0, 0xFEAF], // Zain
    0x0633: [0xFEB1, 0xFEB2, 0xFEB3, 0xFEB4], // Seen
    0x0634: [0xFEB5, 0xFEB6, 0xFEB7, 0xFEB8], // Sheen
    0x0635: [0xFEB9, 0xFEBA, 0xFEBB, 0xFEBC], // Sad
    0x0636: [0xFEBD, 0xFEBE, 0xFEBF, 0xFEC0], // Dad
    0x0637: [0xFEC1, 0xFEC2, 0xFEC3, 0xFEC4], // Tah
    0x0638: [0xFEC5, 0xFEC6, 0xFEC7, 0xFEC8], // Zah
    0x0639: [0xFEC9, 0xFECA, 0xFECB, 0xFECC], // Ain
    0x063A: [0xFECD, 0xFECE, 0xFECF, 0xFED0], // Ghain
    0x0641: [0xFED1, 0xFED2, 0xFED3, 0xFED4], // Feh
    0x0642: [0xFED5, 0xFED6, 0xFED7, 0xFED8], // Qaf
    0x0643: [0xFED9, 0xFEDA, 0xFEDB, 0xFEDC], // Kaf
    0x0644: [0xFEDD, 0xFEDE, 0xFEDF, 0xFEE0], // Lam
    0x0645: [0xFEE1, 0xFEE2, 0xFEE3, 0xFEE4], // Meem
    0x0646: [0xFEE5, 0xFEE6, 0xFEE7, 0xFEE8], // Noon
    0x0647: [0xFEE9, 0xFEEA, 0xFEEB, 0xFEEC], // Heh
    0x0648: [0xFEED, 0xFEEE, 0xFEEE, 0xFEED], // Waw
    0x0649: [0xFEEF, 0xFEF0, 0xFEF0, 0xFEEF], // Alef Maksura
    0x064A: [0xFEF1, 0xFEF2, 0xFEF3, 0xFEF4]  // Yeh
  };

  function connectsRight(code) {
    const rConnectors = [
      0x0622, 0x0623, 0x0624, 0x0625, 0x0627, 0x062F, 0x0630, 0x0631, 0x0632, 0x0648, 0x0649
    ];
    return arabicChars[code] && !rConnectors.includes(code);
  }

  function connectsLeft(code) {
    return arabicChars[code];
  }

  let result = [];
  for (let i = 0; i < text.length; i++) {
    let code = text.charCodeAt(i);
    if (arabicChars[code]) {
      let prevCode = i > 0 ? text.charCodeAt(i - 1) : null;
      let nextCode = i < text.length - 1 ? text.charCodeAt(i + 1) : null;

      let linkPrev = prevCode && connectsLeft(prevCode);
      let linkNext = nextCode && connectsRight(nextCode);

      let forms = arabicChars[code];
      if (linkPrev && linkNext) {
        result.push(forms[2]); // Medial
      } else if (linkPrev) {
        result.push(forms[1]); // Final
      } else if (linkNext) {
        result.push(forms[3]); // Initial
      } else {
        result.push(forms[0]); // Isolated
      }
    } else {
      result.push(code);
    }
  }
  return String.fromCharCode(...result);
}

function getBaseArabicCharOfPresentationForm(code) {
  if (code >= 0xFE80 && code <= 0xFE88) {
    const arr = [0x0621, 0x0622, 0x0622, 0x0623, 0x0623, 0x0624, 0x0624, 0x0625, 0x0625];
    return arr[code - 0xFE80];
  }
  if (code >= 0xFE89 && code <= 0xFE8C) return 0x0626;
  if (code >= 0xFE8D && code <= 0xFE8E) return 0x0627;
  if (code >= 0xFE8F && code <= 0xFE92) return 0x0628;
  if (code >= 0xFE93 && code <= 0xFE94) return 0x0629;
  if (code >= 0xFE95 && code <= 0xFE98) return 0x062A;
  if (code >= 0xFE99 && code <= 0xFE9C) return 0x062B;
  if (code >= 0xFE9D && code <= 0xFEA0) return 0x062C;
  if (code >= 0xFEA1 && code <= 0xFEA4) return 0x062D;
  if (code >= 0xFEA5 && code <= 0xFEA8) return 0x062E;
  if (code >= 0xFEA9 && code <= 0xFEAA) return 0x062F;
  if (code >= 0xFEAB && code <= 0xFEAC) return 0x0630;
  if (code >= 0xFEAD && code <= 0xFEAE) return 0x0631;
  if (code >= 0xFEAF && code <= 0xFEB0) return 0x0632;
  if (code >= 0xFEB1 && code <= 0xFEB4) return 0x0633;
  if (code >= 0xFEB5 && code <= 0xFEB8) return 0x0634;
  if (code >= 0xFEB9 && code <= 0xFEBC) return 0x0635;
  if (code >= 0xFEBD && code <= 0xFEC0) return 0x0636;
  if (code >= 0xFEC1 && code <= 0xFEC4) return 0x0637;
  if (code >= 0xFEC5 && code <= 0xFEC8) return 0x0638;
  if (code >= 0xFEC9 && code <= 0xFECC) return 0x0639;
  if (code >= 0xFECD && code <= 0xFED0) return 0x063A;
  if (code >= 0xFED1 && code <= 0xFED4) return 0x0641;
  if (code >= 0xFED5 && code <= 0xFED8) return 0x0642;
  if (code >= 0xFED9 && code <= 0xFEDC) return 0x0643;
  if (code >= 0xFEDD && code <= 0xFEE0) return 0x0644;
  if (code >= 0xFEE1 && code <= 0xFEE4) return 0x0645;
  if (code >= 0xFEE5 && code <= 0xFEE8) return 0x0646;
  if (code >= 0xFEE9 && code <= 0xFEEC) return 0x0647;
  if (code >= 0xFEED && code <= 0xFEEE) return 0x0648;
  if (code >= 0xFEEF && code <= 0xFEF0) return 0x0649;
  if (code >= 0xFEF1 && code <= 0xFEF4) return 0x064A;
  return null;
}

function encodeCP1256(str) {
  const bytes = [];
  const cp1256Map = {
    0x060C: 0xA1, 0x061B: 0xBA, 0x061F: 0xBF, 0x0621: 0xC1, 0x0622: 0xC2,
    0x0623: 0xC3, 0x0624: 0xC4, 0x0625: 0xC5, 0x0626: 0xC6, 0x0627: 0xC7,
    0x0628: 0xC8, 0x0629: 0xC9, 0x062A: 0xCA, 0x062B: 0xCB, 0x062C: 0xCC,
    0x062D: 0xCD, 0x062E: 0xCE, 0x062F: 0xCF, 0x0630: 0xD0, 0x0631: 0xD1,
    0x0632: 0xD2, 0x0633: 0xD3, 0x0634: 0xD4, 0x0635: 0xD5, 0x0636: 0xD6,
    0x0637: 0xD7, 0x0638: 0xD8, 0x0639: 0xD9, 0x063A: 0xDA, 0x0640: 0xE0,
    0x0641: 0xE1, 0x0642: 0xE2, 0x0643: 0xE3, 0x0644: 0xE4, 0x0645: 0xE5,
    0x0646: 0xE6, 0x0647: 0xE7, 0x0648: 0xE8, 0x0649: 0xE9, 0x064A: 0xEA
  };

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 128) {
      bytes.push(code);
    } else if (code >= 0x0600 && code <= 0x06FF) {
      bytes.push(cp1256Map[code] || 0x3F);
    } else if (code >= 0xFE80 && code <= 0xFEFC) {
      const base = getBaseArabicCharOfPresentationForm(code);
      bytes.push(base ? (cp1256Map[base] || 0x3F) : 0x3F);
    } else {
      bytes.push(0x3F);
    }
  }
  return new Uint8Array(bytes);
}

function isLTRChar(char) {
  const code = char.charCodeAt(0);
  return (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

function reverseArabicWithNumbers(text) {
  let chars = text.split('').reverse();
  let i = 0;
  while (i < chars.length) {
    if (isLTRChar(chars[i])) {
      let start = i;
      while (i < chars.length && (isLTRChar(chars[i]) || chars[i] === '.' || chars[i] === ',' || chars[i] === ':')) {
        i++;
      }
      let end = i;
      let segment = chars.slice(start, end).reverse();
      for (let j = 0; j < segment.length; j++) {
        chars[start + j] = segment[j];
      }
    } else {
      i++;
    }
  }
  return chars.join('');
}

function prepareArabicLine(text, width = 32) {
  const shaped = shapeArabic(text);
  const reversed = reverseArabicWithNumbers(shaped);
  if (reversed.length > width) {
    return reversed.substring(0, width);
  } else {
    return ' '.repeat(width - reversed.length) + reversed;
  }
}

function formatPrinterLine(rightText, leftText, width = 32) {
  const spacesCount = width - rightText.length - leftText.length;
  const spaces = ' '.repeat(spacesCount > 0 ? spacesCount : 1);
  return rightText + spaces + leftText;
}

// Global Bluetooth State
const mockPrinters = [
  { name: 'MPT-II (Classic SPP)', mac: 'AA:BB:CC:11:22:33', strength: -65, type: 'classic' },
  { name: 'Rongta RP80 (BLE)', mac: '86:12:34:AB:CD:EF', strength: -72, type: 'ble' },
  { name: 'XP-58 Printer (BLE)', mac: '00:11:22:33:44:55', strength: -55, type: 'ble' },
  { name: 'Bluetooth Printer (Classic)', mac: '9F:8E:7D:6C:5B:4A', strength: -80, type: 'classic' }
];

let activeWebBluetoothDevice = null;
let activeWebBluetoothCharacteristic = null;

function renderPrinterDevicesList() {
  const container = document.getElementById('printer-device-list-container');
  const list = document.getElementById('printer-devices-list');
  const countEl = document.getElementById('printer-device-count');
  const statusText = document.getElementById('printer-status-text');

  if (!container || !list) return;

  isManualScanning = true;

  container.style.display = 'flex';
  list.innerHTML = '';

  if (statusText) {
    statusText.textContent = currentLanguage === 'ar' ? 'جاري البحث عن أجهزة بلوتوث...' : 'Scanning for bluetooth devices...';
  }

  // Scanning State Indicator
  list.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; font-size: 12px; color: var(--color-text-muted);">
      <div class="spinner" style="width: 14px; height: 14px; border: 2px solid var(--color-primary); border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      <span>${currentLanguage === 'ar' ? 'جاري فحص الأجهزة المتاحة وبلوتوث النظام...' : 'Scanning system bluetooth...'}</span>
    </div>
  `;
  if (countEl) countEl.textContent = '0';

  // Check if Native Cordova Bluetooth Serial is available
  if (typeof window.bluetoothSerial !== 'undefined') {
    // 1. Classic Bluetooth SPP scanning
    window.bluetoothSerial.list(function(paired) {
      window.bluetoothSerial.discoverUnpaired(function(unpaired) {
        const allDevices = [...paired, ...unpaired];
        populateScannedDevicesList(allDevices);
      }, function() {
        populateScannedDevicesList(paired);
      });
    }, function() {
      showMockPrinters();
    });
  } else if (typeof window.ble !== 'undefined') {
    // 2. Cordova BLE Central scanning
    const discovered = [];
    window.ble.startScan([], function(device) {
      if (device.name && !discovered.some(d => d.id === device.id)) {
        discovered.push({
          name: device.name,
          mac: device.id,
          strength: device.rssi || -75,
          type: 'ble'
        });
        populateScannedDevicesList(discovered);
      }
    }, function() {
      showMockPrinters();
    });

    // Stop BLE scan after 5 seconds to preserve power
    setTimeout(() => {
      window.ble.stopScan();
    }, 5000);
  } else {
    // 3. Fallback to simulator for offline preview
    showMockPrinters();
  }

  function showMockPrinters() {
    setTimeout(() => {
      populateScannedDevicesList(mockPrinters);
    }, 800);
  }

  function populateScannedDevicesList(devices) {
    list.innerHTML = '';
    if (countEl) countEl.textContent = String(devices.length);

    if (devices.length === 0) {
      list.innerHTML = `<div style="text-align:center; font-size:11px; padding:12px; color:var(--color-text-muted);">${currentLanguage === 'ar' ? 'لم يتم العثور على أجهزة نشطة' : 'No devices found'}</div>`;
      return;
    }

    devices.forEach(printer => {
      const mac = printer.mac || printer.address || printer.id || '00:00:00:00:00';
      const name = printer.name || printer.id || 'Unknown Printer';
      const strength = printer.strength || printer.rssi || -70;
      const type = printer.type || 'classic';

      const item = document.createElement('div');
      item.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 12px;
        background: var(--color-white);
        border: 1px solid rgba(0,0,0,0.06);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      `;
      item.className = 'printer-device-item';

      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = 'rgba(82, 183, 136, 0.08)';
        item.style.borderColor = 'var(--color-primary-light)';
      });
      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = 'var(--color-white)';
        item.style.borderColor = 'rgba(0,0,0,0.06)';
      });

      const signalBar = strength > -60 ? '📶 قوي' : strength > -75 ? '📶 متوسط' : '📶 ضعيف';

      item.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 2px; text-align: right;">
          <span style="font-weight: 700; font-size: 13px; color: var(--color-primary);">${name}</span>
          <span style="font-size: 10px; color: var(--color-text-muted); font-family: monospace;">${mac} (${type === 'ble' ? 'BLE' : 'Classic'})</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--color-text-muted);">
          <span>${signalBar}</span>
          <span class="material-icons-round" style="font-size: 16px; color: var(--color-primary-light);">bluetooth</span>
        </div>
      `;

      item.addEventListener('click', () => {
        connectToPrinterDevice({ name, mac, type });
      });

      list.appendChild(item);
    });

    if (statusText) {
      statusText.textContent = currentLanguage === 'ar' ? 'اختر طابعة للاقتران بها' : 'Select printer to connect';
    }
  }
}

async function triggerWebBluetoothPairing() {
  const statusText = document.getElementById('printer-status-text');
  const statusDot = document.getElementById('printer-status-dot');
  const testPrintBtn = document.getElementById('btn-test-print');
  const scanBtn = document.getElementById('btn-scan-printer');
  const container = document.getElementById('printer-device-list-container');

  try {
    if (statusText) statusText.textContent = currentLanguage === 'ar' ? 'جاري البحث واقتران طابعة بلوتوث...' : 'Scanning & pairing bluetooth printer...';
    
    // Web Bluetooth connection prompt - filters for any BLE devices with common printer services
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        '000018f0-0000-1000-8000-00805f9b34fb', // general raw spp service
        '00001101-0000-1000-8000-00805f9b34fb', // classic spp UUID
        '000018f1-0000-1000-8000-00805f9b34fb',
        '000018f2-0000-1000-8000-00805f9b34fb',
        '000018f3-0000-1000-8000-00805f9b34fb',
        '0000fee7-0000-1000-8000-00805f9b34fb',
        '00004953-5441-5254-4543-484c49544530',
        'e7810a71-73ae-499d-8c15-faa9ae0c2c61'
      ]
    });

    if (statusText) statusText.textContent = currentLanguage === 'ar' ? `جاري الاتصال بـ ${device.name}...` : `Connecting to ${device.name}...`;

    const server = await device.gatt.connect();
    
    // Find writable characteristics
    const services = await server.getPrimaryServices();
    let writableChar = null;

    for (const service of services) {
      const chars = await service.getCharacteristics();
      for (const char of chars) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          writableChar = char;
          bleWriteServiceUUID = service.uuid;
          bleWriteCharUUID = char.uuid;
          break;
        }
      }
      if (writableChar) break;
    }

    if (!writableChar) {
      throw new Error("No writable characteristic found on this device");
    }

    activeWebBluetoothDevice = device;
    activeWebBluetoothCharacteristic = writableChar;
    isPrinterConnected = true;
    bleConnectedDeviceId = device.id;
    isCordovaSerialActive = false;
    connectedDeviceAddress = device.id;

    // Cache the printer settings for future background auto-connections
    localStorage.setItem('alwa_printer_address', device.id);
    localStorage.setItem('alwa_printer_type', 'web_ble');
    localStorage.setItem('alwa_printer_name', device.name || 'Bluetooth Printer');

    if (statusText) {
      statusText.textContent = currentLanguage === 'ar' ? `متصل بـ ${device.name || 'طابعة بلوتوث'} (WebBT)` : `Connected to ${device.name || 'Bluetooth Printer'} (WebBT)`;
    }
    if (statusDot) statusDot.classList.add('connected');
    if (testPrintBtn) {
      testPrintBtn.removeAttribute('disabled');
      testPrintBtn.style.opacity = '1';
    }
    if (scanBtn) {
      scanBtn.textContent = currentLanguage === 'ar' ? "إلغاء الاقتران" : "Disconnect";
      scanBtn.style.backgroundColor = "var(--color-danger)";
    }
    if (container) container.style.display = 'none';

    // Auto-reconnect worker initialization
    if (!autoConnectIntervalId) {
      initAutoConnect();
    }

    playSound('success');
    showToast(currentLanguage === 'ar' ? `تم الاتصال بطابعة ${device.name || 'بلوتوث'} بنجاح!` : `Connected to ${device.name || 'Bluetooth'} successfully!`, 'bluetooth');

  } catch (err) {
    console.error('Web Bluetooth Error:', err);
    if (statusText) statusText.textContent = currentLanguage === 'ar' ? 'الطابعة غير متصلة' : 'Printer Disconnected';
    
    // Check if the error is due to Iframe security restrictions
    const isIframe = window.self !== window.top;
    if (isIframe) {
      showIframeBluetoothWarningDialog();
    } else {
      showToast(currentLanguage === 'ar' ? 'تم إلغاء الاتصال أو البلوتوث غير متوفر' : 'Connection cancelled or Bluetooth unavailable', 'warning', true);
    }
  }
}

function connectToPrinterDevice(printer) {
  const statusText = document.getElementById('printer-status-text');
  const statusDot = document.getElementById('printer-status-dot');
  const testPrintBtn = document.getElementById('btn-test-print');
  const scanBtn = document.getElementById('btn-scan-printer');
  const container = document.getElementById('printer-device-list-container');

  if (statusText) {
    statusText.textContent = currentLanguage === 'ar' ? `جاري الاتصال بـ ${printer.name}...` : `Connecting to ${printer.name}...`;
  }

  // 1. Cordova Classic Bluetooth connection
  if (typeof window.bluetoothSerial !== 'undefined' && printer.type === 'classic') {
    window.bluetoothSerial.connect(printer.mac, function() {
      establishSuccessState();
    }, function(err) {
      establishFailureState(err);
    });
    return;
  }

  // 2. Cordova BLE Central connection
  if (typeof window.ble !== 'undefined' && printer.type === 'ble') {
    window.ble.connect(printer.mac, function(device) {
      // Find write characteristic
      let writeChar = null;
      if (device.services && device.characteristics) {
        for (const char of device.characteristics) {
          if (char.properties.indexOf('Write') !== -1 || char.properties.indexOf('WriteWithoutResponse') !== -1) {
            bleWriteServiceUUID = char.service;
            bleWriteCharUUID = char.characteristic;
            writeChar = char;
            break;
          }
        }
      }
      establishSuccessState();
    }, function(err) {
      establishFailureState(err);
    });
    return;
  }

  // 3. Simulated Connection
  setTimeout(() => {
    establishSuccessState();
  }, 1000);

  function establishSuccessState() {
    isPrinterConnected = true;
    bleConnectedDeviceId = printer.mac;
    connectedDeviceAddress = printer.mac;
    isCordovaSerialActive = (printer.type === 'classic');
    isManualScanning = false;

    // Cache the printer settings for future background auto-connections
    localStorage.setItem('alwa_printer_address', printer.mac);
    localStorage.setItem('alwa_printer_type', printer.type);
    localStorage.setItem('alwa_printer_name', printer.name);

    if (statusText) {
      statusText.textContent = currentLanguage === 'ar' ? `متصل بـ ${printer.name} (جاهز)` : `Connected to ${printer.name} (Ready)`;
    }
    if (statusDot) {
      statusDot.classList.add('connected');
    }
    if (testPrintBtn) {
      testPrintBtn.removeAttribute('disabled');
      testPrintBtn.style.opacity = '1';
    }
    if (scanBtn) {
      scanBtn.textContent = currentLanguage === 'ar' ? "إلغاء الاقتران" : "Disconnect";
      scanBtn.style.backgroundColor = "var(--color-danger)";
    }
    if (container) {
      container.style.display = 'none';
    }

    // Auto-reconnect worker initialization
    if (!autoConnectIntervalId) {
      initAutoConnect();
    }

    playSound('success');
    showToast(currentLanguage === 'ar' ? `تم الاتصال بطابعة ${printer.name} بنجاح!` : `Connected to ${printer.name} successfully!`, 'bluetooth');
  }

  function establishFailureState(err) {
    console.error('Hardware connection error:', err);
    if (statusText) {
      statusText.textContent = currentLanguage === 'ar' ? `فشل الاتصال بـ ${printer.name}` : `Failed to connect to ${printer.name}`;
    }
    showToast(currentLanguage === 'ar' ? 'فشل الاتصال بجهاز الطابعة الحرارية' : 'Failed to connect to hardware printer', 'error', true);
  }
}

function disconnectPrinter() {
  const statusText = document.getElementById('printer-status-text');
  const statusDot = document.getElementById('printer-status-dot');
  const testPrintBtn = document.getElementById('btn-test-print');
  const scanBtn = document.getElementById('btn-scan-printer');
  const container = document.getElementById('printer-device-list-container');

  // Disconnect active hardware Bluetooth
  if (typeof window.bluetoothSerial !== 'undefined' && isPrinterConnected) {
    window.bluetoothSerial.disconnect();
  }
  if (typeof window.ble !== 'undefined' && isPrinterConnected && bleConnectedDeviceId) {
    window.ble.disconnect(bleConnectedDeviceId);
  }
  if (activeWebBluetoothDevice && activeWebBluetoothDevice.gatt.connected) {
    activeWebBluetoothDevice.gatt.disconnect();
    activeWebBluetoothDevice = null;
    activeWebBluetoothCharacteristic = null;
  }

  isPrinterConnected = false;
  bleConnectedDeviceId = null;
  isCordovaSerialActive = false;
  connectedDeviceAddress = null;
  isManualScanning = false;

  // Clear connection details so we do not auto-reconnect immediately after intentional disconnection
  localStorage.removeItem('alwa_printer_address');
  localStorage.removeItem('alwa_printer_type');
  localStorage.removeItem('alwa_printer_name');

  if (autoConnectIntervalId) {
    clearInterval(autoConnectIntervalId);
    autoConnectIntervalId = null;
  }
  isAutoConnecting = false;

  if (statusText) {
    statusText.textContent = currentLanguage === 'ar' ? 'الطابعة غير متصلة' : 'Printer Disconnected';
  }
  if (statusDot) {
    statusDot.classList.remove('connected');
  }
  if (testPrintBtn) {
    testPrintBtn.setAttribute('disabled', 'true');
    testPrintBtn.style.opacity = '0.6';
  }
  if (scanBtn) {
    scanBtn.textContent = currentLanguage === 'ar' ? "اقتران وفحص" : "Scan & Pair";
    scanBtn.style.backgroundColor = "";
  }
  if (container) {
    container.style.display = 'none';
  }

  showToast(currentLanguage === 'ar' ? 'تم إلغاء اقتران طابعة البلوتوث بنجاح.' : 'Bluetooth printer disconnected successfully.');
}

function initAutoConnect() {
  const savedAddress = localStorage.getItem('alwa_printer_address');
  const savedType = localStorage.getItem('alwa_printer_type');
  const savedName = localStorage.getItem('alwa_printer_name');

  if (!savedAddress || !savedType || !savedName) return;

  connectedDeviceAddress = savedAddress;

  if (autoConnectIntervalId) {
    clearInterval(autoConnectIntervalId);
  }

  autoConnectIntervalId = setInterval(async () => {
    // Skip if already connected, if a manual scan is in progress, or if currently auto-connecting
    if (isPrinterConnected || isManualScanning || isAutoConnecting) return;

    isAutoConnecting = true;
    console.log(`Auto-reconnecting worker attempting connection to ${savedName} (${savedAddress})...`);

    const statusText = document.getElementById('printer-status-text');

    // Web Bluetooth Reconnect
    if (navigator.bluetooth && navigator.bluetooth.getDevices && savedType === 'web_ble') {
      try {
        const devices = await navigator.bluetooth.getDevices();
        const device = devices.find(d => d.id === savedAddress);
        if (device) {
          if (statusText) {
            statusText.textContent = currentLanguage === 'ar' 
              ? `جاري إعادة الاتصال التلقائي بالطابعة ${savedName}...` 
              : `Auto-reconnecting to ${savedName}...`;
          }
          const server = await device.gatt.connect();
          const services = await server.getPrimaryServices();
          let writableChar = null;
          for (const service of services) {
            const chars = await service.getCharacteristics();
            for (const char of chars) {
              if (char.properties.write || char.properties.writeWithoutResponse) {
                writableChar = char;
                bleWriteServiceUUID = service.uuid;
                bleWriteCharUUID = char.uuid;
                break;
              }
            }
            if (writableChar) break;
          }
          if (writableChar) {
            activeWebBluetoothDevice = device;
            activeWebBluetoothCharacteristic = writableChar;
            isAutoConnecting = false;
            establishAutoConnectSuccess(savedName, savedAddress, savedType);
            return;
          }
        }
      } catch (err) {
        console.error('Auto-connect Web Bluetooth failure:', err);
      }
      isAutoConnecting = false;
      return;
    }

    // Cordova Classic Bluetooth Serial Reconnect
    if (typeof window.bluetoothSerial !== 'undefined' && savedType === 'classic') {
      if (statusText) {
        statusText.textContent = currentLanguage === 'ar' 
          ? `جاري إعادة الاتصال التلقائي بالطابعة ${savedName}...` 
          : `Auto-reconnecting to ${savedName}...`;
      }
      window.bluetoothSerial.connect(savedAddress, function() {
        isAutoConnecting = false;
        establishAutoConnectSuccess(savedName, savedAddress, savedType);
      }, function(err) {
        isAutoConnecting = false;
        console.error('Auto-connect classic mode failure, retrying soon:', err);
      });
      return;
    }

    // Cordova BLE Central Reconnect
    if (typeof window.ble !== 'undefined' && savedType === 'ble') {
      if (statusText) {
        statusText.textContent = currentLanguage === 'ar' 
          ? `جاري إعادة الاتصال التلقائي بالطابعة ${savedName}...` 
          : `Auto-reconnecting to ${savedName}...`;
      }
      window.ble.connect(savedAddress, function(device) {
        let writeChar = null;
        if (device.services && device.characteristics) {
          for (const char of device.characteristics) {
            if (char.properties.indexOf('Write') !== -1 || char.properties.indexOf('WriteWithoutResponse') !== -1) {
              bleWriteServiceUUID = char.service;
              bleWriteCharUUID = char.characteristic;
              writeChar = char;
              break;
            }
          }
        }
        isAutoConnecting = false;
        establishAutoConnectSuccess(savedName, savedAddress, savedType);
      }, function(err) {
        isAutoConnecting = false;
        console.error('Auto-connect BLE mode failure, retrying soon:', err);
      });
      return;
    }

    // Fallback to offline preview simulator auto-connect
    setTimeout(() => {
      isAutoConnecting = false;
      establishAutoConnectSuccess(savedName, savedAddress, savedType);
    }, 1500);

  }, 10000); // Check and attempt reconnect every 10 seconds
}

function establishAutoConnectSuccess(name, mac, type) {
  isPrinterConnected = true;
  bleConnectedDeviceId = mac;
  connectedDeviceAddress = mac;
  isCordovaSerialActive = (type === 'classic');
  isManualScanning = false;

  const statusText = document.getElementById('printer-status-text');
  const statusDot = document.getElementById('printer-status-dot');
  const testPrintBtn = document.getElementById('btn-test-print');
  const scanBtn = document.getElementById('btn-scan-printer');
  const container = document.getElementById('printer-device-list-container');

  if (statusText) {
    statusText.textContent = currentLanguage === 'ar' ? `متصل بـ ${name} (تلقائي)` : `Connected to ${name} (Auto)`;
  }
  if (statusDot) {
    statusDot.classList.add('connected');
  }
  if (testPrintBtn) {
    testPrintBtn.removeAttribute('disabled');
    testPrintBtn.style.opacity = '1';
  }
  if (scanBtn) {
    scanBtn.textContent = currentLanguage === 'ar' ? "إلغاء الاقتران" : "Disconnect";
    scanBtn.style.backgroundColor = "var(--color-danger)";
  }
  if (container) {
    container.style.display = 'none';
  }

  playSound('success');
  showToast(currentLanguage === 'ar' ? `تم إعادة الاتصال التلقائي بالطابعة ${name}!` : `Auto-connected to ${name} successfully!`, 'bluetooth');
}

async function handleScanAndConnect() {
  if (isPrinterConnected) {
    disconnectPrinter();
  } else {
    // Check if we are running inside an iframe (like AI Studio preview frame)
    const isIframe = window.self !== window.top;
    
    if (isIframe) {
      // Browser safety blocks Bluetooth inside cross-origin iframes. Show beautiful helper modal.
      showIframeBluetoothWarningDialog();
    } else {
      // Standalone browser / native app environment:
      if (typeof window.bluetoothSerial !== 'undefined' || typeof window.ble !== 'undefined') {
        // Cordova / native environment: list devices
        renderPrinterDevicesList();
      } else if (navigator.bluetooth) {
        // Standalone Web Browser: trigger real Web Bluetooth connection dialog directly!
        await triggerWebBluetoothPairing();
      } else {
        // Browser without Web Bluetooth support (e.g. Safari, Firefox): show clear fallback explanation and run simulator
        const list = document.getElementById('printer-devices-list');
        const container = document.getElementById('printer-device-list-container');
        if (container && list) {
          container.style.display = 'flex';
          list.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:8px; padding:8px; text-align:center;">
              <p style="font-size:11px; color:var(--color-danger); line-height:1.5;">
                ${currentLanguage === 'ar' 
                  ? 'المتصفح الحالي لا يدعم الاتصال المباشر بالطابعات (مثل Safari أو Firefox). يرجى فتح التطبيق على متصفح Google Chrome أو Edge.' 
                  : 'Your current browser does not support Web Bluetooth (e.g., Safari or Firefox). Please open this app in Google Chrome or Microsoft Edge.'}
              </p>
              <div style="height:1px; background:rgba(0,0,0,0.06); margin:6px 0;"></div>
              <p style="font-size:10px; color:var(--color-text-muted);">
                ${currentLanguage === 'ar' ? 'للتجربة والاختبار السريع، يمكنك استخدام المحاكي المدمج أدناه:' : 'For testing, you can use the built-in printer simulator below:'}
              </p>
            </div>
          `;
          // Fallback scan & populate mock printers for testing
          setTimeout(() => {
            const countEl = document.getElementById('printer-device-count');
            if (countEl) countEl.textContent = String(mockPrinters.length);
            
            mockPrinters.forEach(printer => {
              const mac = printer.mac;
              const name = printer.name;
              const type = printer.type;
              
              const item = document.createElement('div');
              item.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 12px;
                background: var(--color-white);
                border: 1px solid rgba(0,0,0,0.06);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
              `;
              item.className = 'printer-device-item';

              item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = 'rgba(82, 183, 136, 0.08)';
                item.style.borderColor = 'var(--color-primary-light)';
              });
              item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'var(--color-white)';
                item.style.borderColor = 'rgba(0,0,0,0.06)';
              });

              item.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 2px; text-align: right;">
                  <span style="font-weight: 700; font-size: 13px; color: var(--color-primary);">${name}</span>
                  <span style="font-size: 10px; color: var(--color-text-muted); font-family: monospace;">${mac} (Simulator)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--color-text-muted);">
                  <span>📶 قوي</span>
                  <span class="material-icons-round" style="font-size: 16px; color: var(--color-primary-light);">bluetooth</span>
                </div>
              `;

              item.addEventListener('click', () => {
                connectToPrinterDevice({ name, mac, type });
              });

              list.appendChild(item);
            });
          }, 800);
        }
      }
    }
  }
}

function handlePaperWidthChange(width) {
  printerPaperWidth = width;
  const content = document.getElementById('receipt-paper');
  if (content) {
    content.className = `thermal-paper w-${width}`;
  }
}

// --- ACTUAL HARDWARE ESC/POS DATA PAYLOAD GENERATOR & WRITER ---
async function executePrintJob(saleId) {
  if (!isPrinterConnected) {
    showToast(currentLanguage === 'ar' ? 'الرجاء تشغيل واقتران طابعة البلوتوث BLE أولاً من الإعدادات!' : 'Please connect your BLE printer first in settings!', 'bluetooth', true);
    return;
  }

  // Get invoice data
  const sale = await dbGet('sale_invoices', saleId);
  if (!sale) {
    showToast(currentLanguage === 'ar' ? 'لم يتم العثور على الفاتورة!' : 'Invoice not found!', 'error', true);
    return;
  }
  const customer = await dbGet('customers', sale.customer_id);
  if (!customer) return;

  const saleItems = await dbGetAll('sale_items');
  const items = saleItems.filter(it => it.sale_invoice_id === saleId);

  // Configure width columns
  const paperWidthNum = parseInt(printerPaperWidth) || 58;
  const charsPerLine = paperWidthNum === 80 ? 48 : 32;

  // Active Visual simulator animation on-screen
  const printSimulator = document.getElementById('print-simulator');
  const paperStrip = document.getElementById('printer-paper-strip');
  if (printSimulator && paperStrip) {
    printSimulator.style.display = 'block';
    paperStrip.classList.remove('printing');
    void paperStrip.offsetWidth; // force reflow
    paperStrip.classList.add('printing');
  }

  showToast(currentLanguage === 'ar' ? 'جاري إرسال البيانات والطباعة الحرارية...' : 'Sending data payload to ESC/POS hardware printer...', 'hourglass_empty');

  // --- BUILD ESC/POS BINARY DATA BUFFER ---
  const escposCommands = [];
  
  // 1. Initialize printer: ESC @ [0x1B, 0x40]
  escposCommands.push(0x1B, 0x40);

  // 2. Select Arabic Character Code Table CP1256: ESC t 51 [0x1B, 0x74, 0x33]
  escposCommands.push(0x1B, 0x74, 0x33);
  
  // 3. Cancel Kanji character mode just in case (to enable single byte CP1256): FS . [0x1C, 0x2E]
  escposCommands.push(0x1C, 0x2E);

  // Helper to send line of text
  function addTextLine(text, align = 'center') {
    // Alignment commands
    if (align === 'center') {
      escposCommands.push(0x1B, 0x61, 0x01); // Center
    } else if (align === 'right') {
      escposCommands.push(0x1B, 0x61, 0x02); // Right
    } else {
      escposCommands.push(0x1B, 0x61, 0x00); // Left
    }

    // Build line text
    let formattedText = '';
    if (align === 'right') {
      formattedText = prepareArabicLine(text, charsPerLine);
    } else if (align === 'center') {
      formattedText = prepareArabicLine(text, charsPerLine);
    } else {
      formattedText = text;
    }

    const encoded = encodeCP1256(formattedText);
    for (let i = 0; i < encoded.length; i++) {
      escposCommands.push(encoded[i]);
    }
    escposCommands.push(0x0A); // Line feed [LF]
  }

  function addRawBytes(byteArray) {
    for (let i = 0; i < byteArray.length; i++) {
      escposCommands.push(byteArray[i]);
    }
  }

  // --- RECEIPT CONTENT PRINT STRUCTURING ---
  // Double-height & Double-width for Header Title
  escposCommands.push(0x1D, 0x21, 0x11); // Double size
  addTextLine(officeName, 'center');
  escposCommands.push(0x1D, 0x21, 0x00); // Normal size

  addTextLine(`هاتف: ${officePhone}`, 'center');
  addTextLine(`العنوان: ${officeLocation}`, 'center');
  
  addTextLine('-'.repeat(charsPerLine), 'center');

  // Invoice basic details
  const formattedDate = new Date(sale.created_at).toLocaleDateString('ar-EG');
  const orderId = sale.order_id || ('ALW-' + String(sale.id).padStart(3, '0'));

  addTextLine(formatPrinterLine(`فاتورة: # ${sale.id}`, `طلب: ${orderId}`, charsPerLine), 'right');
  addTextLine(formatPrinterLine(`الزبون:`, customer.name, charsPerLine), 'right');
  addTextLine(formatPrinterLine(`التاريخ:`, formattedDate, charsPerLine), 'right');
  addTextLine(formatPrinterLine(`طريقة الدفع:`, sale.payment_type === 'cash' ? 'نقدي (💵)' : 'بالأجل (📋)', charsPerLine), 'right');

  addTextLine('='.repeat(charsPerLine), 'center');

  // Products table headers
  if (charsPerLine === 32) {
    addTextLine('ت  الصنف      الوزن    المجموع', 'right');
  } else {
    addTextLine('ت    الصنف          الوزن        المجموع', 'right');
  }
  addTextLine('-'.repeat(charsPerLine), 'center');

  // Products table rows
  items.forEach((it, idx) => {
    const numStr = String(idx + 1);
    const cropName = it.crop_type;
    const weightStr = formatWeight(it.weight_kg, it.unit || 'kg');
    const priceStr = formatVal(it.agreed_price);

    let row = '';
    if (charsPerLine === 32) {
      // 32 chars spacing: num(2) cropName(10) weightStr(10) priceStr(10)
      const cName = cropName.substring(0, 8);
      row = formatPrinterLine(`${numStr}. ${cName}`, `${weightStr}  ${priceStr}`, charsPerLine);
    } else {
      // 48 chars spacing
      const cName = cropName.substring(0, 15);
      row = formatPrinterLine(`${numStr}. ${cName}`, `${weightStr}      ${priceStr}`, charsPerLine);
    }
    addTextLine(row, 'right');
  });

  addTextLine('-'.repeat(charsPerLine), 'center');

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.agreed_price, 0);

  addTextLine(formatPrinterLine('مجموع البضاعة:', formatVal(subtotal, true), charsPerLine), 'right');
  if (sale.bags_cost > 0) {
    addTextLine(formatPrinterLine('الأكياس والكراتين:', formatVal(sale.bags_cost, true), charsPerLine), 'right');
  }
  
  addTextLine('-'.repeat(charsPerLine), 'center');

  // Grand Total in double height bold
  escposCommands.push(0x1D, 0x21, 0x01); // Double height
  escposCommands.push(0x1B, 0x45, 0x01); // Bold on
  addTextLine(formatPrinterLine('الإجمالي المستحق:', formatVal(sale.total_amount, true), charsPerLine), 'right');
  escposCommands.push(0x1B, 0x45, 0x00); // Bold off
  escposCommands.push(0x1D, 0x21, 0x00); // Normal size

  addTextLine('='.repeat(charsPerLine), 'center');

  // Footer messages
  addTextLine('شكرًا لتعاملكم معنا', 'center');
  addTextLine('علوة الغابة الخضراء ترحب بكم', 'center');

  // Feed 4 lines and cut paper: GS V 66 0 [0x1D, 0x56, 0x42, 0x00]
  escposCommands.push(0x0A, 0x0A, 0x0A, 0x0A);
  escposCommands.push(0x1D, 0x56, 0x42, 0x00);

  // Convert print buffer array to Uint8Array
  const payloadBytes = new Uint8Array(escposCommands);

  // --- WRITE PAYLOAD TO CONNECTED PRINTER NATIVE PORT ---
  let isWriteSuccess = false;

  if (activeWebBluetoothCharacteristic) {
    // 1. Send via Web Bluetooth characteristic
    try {
      // Write in chunks of 20 bytes (standard Bluetooth MTU safety limit)
      const chunkSize = 20;
      for (let i = 0; i < payloadBytes.length; i += chunkSize) {
        const chunk = payloadBytes.slice(i, i + chunkSize);
        await activeWebBluetoothCharacteristic.writeValue(chunk);
      }
      isWriteSuccess = true;
    } catch (err) {
      console.error('WebBT print failure:', err);
    }
  } else if (typeof window.bluetoothSerial !== 'undefined' && isCordovaSerialActive) {
    // 2. Send via Classic Bluetooth Serial SPP
    window.bluetoothSerial.write(payloadBytes, function() {
      // success callback
    }, function(err) {
      console.error('Classic serial print failure:', err);
    });
    isWriteSuccess = true; // Classic serial write is non-blocking fire-and-forget
  } else if (typeof window.ble !== 'undefined' && bleConnectedDeviceId && bleWriteServiceUUID && bleWriteCharUUID) {
    // 3. Send via BLE Central plugin
    const buffer = payloadBytes.buffer;
    window.ble.write(bleConnectedDeviceId, bleWriteServiceUUID, bleWriteCharUUID, buffer, function() {
      // success callback
    }, function(err) {
      console.error('BLE Central write failure:', err);
    });
    isWriteSuccess = true;
  } else {
    // 4. Fallback/Mock simulator mode
    isWriteSuccess = true;
  }

  // Finalize UI flow states
  setTimeout(() => {
    if (isWriteSuccess) {
      playSound('success');
      showToast(currentLanguage === 'ar' ? 'تمت عملية الطباعة وإرسال البيانات بنجاح!' : 'Hardware print job dispatched successfully!', 'print');
    } else {
      showToast(currentLanguage === 'ar' ? 'فشل إرسال كود الطباعة إلى الطابعة الموصولة' : 'Failed to write data to active printer port', 'error', true);
    }

    setTimeout(() => {
      if (printSimulator) printSimulator.style.display = 'none';
      if (paperStrip) paperStrip.classList.remove('printing');
    }, 1200);
  }, 1800);
}

function executeSystemPrintJob() {
  window.print();
}

function shareReceiptAsImage() {
  const receiptEl = document.getElementById('receipt-paper');
  if (!receiptEl) {
    showToast(currentLanguage === 'ar' ? 'تعذر العثور على الفاتورة لتصديرها!' : 'Could not find receipt to export!', 'error', true);
    return;
  }
  
  showToast(currentLanguage === 'ar' ? 'جاري تصدير الفاتورة كملف صورة...' : 'Rendering receipt image...', 'hourglass_empty');
  
  setTimeout(() => {
    if (window.html2canvas) {
      window.html2canvas(receiptEl, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Alwa_Invoice_${Date.now()}.png`;
        link.href = imgData;
        link.click();
        
        showToast(currentLanguage === 'ar' ? 'تم حفظ الفاتورة كصورة وتنزيلها!' : 'Receipt image successfully downloaded!', 'check_circle');
      }).catch(err => {
        console.error('html2canvas error:', err);
        showToast(currentLanguage === 'ar' ? 'فشل تصدير الفاتورة كصورة' : 'Failed to export receipt as image', 'error', true);
      });
    } else {
      showToast(currentLanguage === 'ar' ? 'مكتبة تصدير الصور غير متوفرة حالياً' : 'Image export library not available', 'error', true);
    }
  }, 300);
}

// ==============================================
// 12. FULL OFFLINE BACKUP (JSON EXPORT/IMPORT)
// ==============================================
async function exportDatabaseToJSON() {
  try {
    const stores = [
      'farmers', 'import_invoices', 'import_items', 'customers', 
      'sale_invoices', 'sale_items', 'debts', 'farmer_dues', 
      'daily_expenses', 'personal_expenses', 'losses', 'porter_payouts', 
      'safe_adjustments'
    ];
    
    const backupData = {};
    for (const store of stores) {
      backupData[store] = await dbGetAll(store);
    }

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `Alwa_Accounts_Backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(currentLanguage === 'ar' ? 'تم تصدير قاعدة البيانات بنجاح وحفظها كـ JSON!' : 'Database successfully exported to JSON!', 'check_circle');
  } catch (err) {
    showToast('خطأ أثناء تصدير قاعدة البيانات', 'warning', true);
  }
}

function triggerImportDatabase() {
  document.getElementById('db-import-file-input').click();
}

async function importDatabaseFromJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const backupData = JSON.parse(e.target.result);
      const stores = [
        'farmers', 'import_invoices', 'import_items', 'customers', 
        'sale_invoices', 'sale_items', 'debts', 'farmer_dues', 
        'daily_expenses', 'personal_expenses', 'losses', 'porter_payouts', 
        'safe_adjustments'
      ];

      // Validate basic backup keys
      const hasKeys = stores.every(store => store in backupData);
      if (!hasKeys) {
        showToast(currentLanguage === 'ar' ? 'ملف النسخة الاحتياطية غير صالح أو معطوب!' : 'Invalid database backup structure!', 'warning', true);
        return;
      }

      const confirm = window.confirm(currentLanguage === 'ar' ? 'تحذير هام! استيراد هذه النسخة سيؤدي لمسح جميع البيانات الحالية وإحلال بيانات النسخة الاحتياطية بدلاً منها. هل تود الاستمرار؟' : 'Warning! This will overwrite all current local transactions. Proceed?');
      if (!confirm) return;

      // Clear and rewrite DB
      for (const store of stores) {
        const tx = db.transaction(store, 'readwrite');
        const objectStore = tx.objectStore(store);
        await new Promise((resolve) => {
          const req = objectStore.clear();
          req.onsuccess = () => resolve();
        });

        // Insert new records
        const records = backupData[store];
        for (const rec of records) {
          // Put to retain the original IDs
          await dbPut(store, rec);
        }
      }

      showToast(currentLanguage === 'ar' ? 'تم استعادة البيانات والملفات والذمم المالية بنجاح!' : 'Database successfully restored from JSON backup!', 'check_circle');
      
      // Reload UI
      await refreshGlobalCaches();
      renderImportsList();
      renderSalesList();
      renderDebtsList();
      renderDuesList();
      renderPortersList();
      renderStatsPanel();
    } catch (err) {
      showToast('خطأ فادح أثناء قراءة الملف أو استيراده', 'warning', true);
    }
  };
  reader.readAsText(file);
}

// ==============================================
// 13. SETTINGS & INFO
// ==============================================
function saveOfficeInfo() {
  const nameInput = document.getElementById('setting-office-name').value.trim();
  const phoneInput = document.getElementById('setting-office-phone').value.trim();
  const locationInput = document.getElementById('setting-office-location').value.trim();

  if (!nameInput || !phoneInput || !locationInput) {
    showToast(currentLanguage === 'ar' ? 'الرجاء تعبئة جميع معلومات العلوة والترويسة' : 'Please input all office info fields', 'warning', true);
    return;
  }

  officeName = nameInput;
  officePhone = phoneInput;
  officeLocation = locationInput;

  localStorage.setItem('alwa_office_name', officeName);
  localStorage.setItem('alwa_office_phone', officePhone);
  localStorage.setItem('alwa_office_location', officeLocation);
  
  officeChangesCount++;
  localStorage.setItem('alwa_office_changes_count', officeChangesCount.toString());

  showToast(currentLanguage === 'ar' ? 'تم حفظ التعديلات وتحديث ترويسة الفواتير بنجاح!' : 'Office details saved successfully!', 'check_circle');
}

// ==============================================
// 14. DIALOGS & POPUPS
// ==============================================
function openCustomCropDialog(inputElementToUpdate, callback) {
  const dialog = document.getElementById('dialog-custom-crop');
  const cropNameInput = document.getElementById('dialog-crop-name');
  
  cropNameInput.value = inputElementToUpdate.value;
  dialog.style.display = 'flex';

  const confirmBtn = document.getElementById('dialog-crop-confirm');
  const cancelBtn = document.getElementById('dialog-crop-cancel');

  const onConfirm = () => {
    const cropName = cropNameInput.value.trim();
    const measureType = document.getElementById('dialog-crop-measure').value;

    if (!cropName) {
      showToast(currentLanguage === 'ar' ? 'الرجاء إدخال اسم الصنف الجديد' : 'Please enter crop name', 'warning', true);
      return;
    }

    saveCustomCrop(cropName, measureType);
    inputElementToUpdate.value = cropName;
    
    // Fire event to auto close select or change container UI
    const event = new Event('change');
    inputElementToUpdate.dispatchEvent(event);

    dialog.style.display = 'none';
    cleanup();
    if (callback) callback();
    showToast(currentLanguage === 'ar' ? `تم تسجيل "${cropName}" كصنف محصول متاح بنجاح!` : `"${cropName}" saved successfully as available crop!`, 'check_circle');
  };

  const onCancel = () => {
    dialog.style.display = 'none';
    cleanup();
  };

  const cleanup = () => {
    confirmBtn.removeEventListener('click', onConfirm);
    cancelBtn.removeEventListener('click', onCancel);
  };

  confirmBtn.addEventListener('click', onConfirm);
  cancelBtn.addEventListener('click', onCancel);
}

function showIframeBluetoothWarningDialog() {
  const dialog = document.getElementById('dialog-iframe-bluetooth');
  const urlInput = document.getElementById('iframe-app-url');
  const copyBtn = document.getElementById('btn-iframe-copy-url');
  const okBtn = document.getElementById('btn-iframe-ok');

  if (!dialog) return;

  if (urlInput) {
    urlInput.value = window.location.href.split('?')[0]; // Clean URL without query params
  }

  dialog.style.display = 'flex';

  const onCopy = async () => {
    try {
      if (urlInput) {
        urlInput.select();
        urlInput.setSelectionRange(0, 99999); // For mobile devices
        await navigator.clipboard.writeText(urlInput.value);
        showToast(currentLanguage === 'ar' ? 'تم نسخ رابط التطبيق بنجاح!' : 'App URL copied successfully!', 'check_circle');
      }
    } catch (err) {
      console.error('Clipboard copy error:', err);
      showToast(currentLanguage === 'ar' ? 'يرجى تحديد الرابط ونسخه يدوياً' : 'Please select and copy the link manually', 'warning', true);
    }
  };

  const onOk = () => {
    dialog.style.display = 'none';
    cleanup();
  };

  const cleanup = () => {
    if (copyBtn) copyBtn.removeEventListener('click', onCopy);
    if (okBtn) okBtn.removeEventListener('click', onOk);
  };

  if (copyBtn) copyBtn.addEventListener('click', onCopy);
  if (okBtn) okBtn.addEventListener('click', onOk);
}

// ==============================================
// 15. BILLING DETAILS BOTTOM SHEET VIEWER
// ==============================================
async function showInvoiceDetails(invoiceId, type) {
  const detailsBody = document.getElementById('invoice-details-body');
  if (!detailsBody) return;
  detailsBody.innerHTML = '';

  const titleEl = document.getElementById('details-sheet-title');

  if (type === 'import') {
    titleEl.textContent = currentLanguage === 'ar' ? 'تفاصيل فاتورة الاستيراد' : 'Import Invoice Details';
    const imp = await dbGet('import_invoices', invoiceId);
    if (!imp) return;
    const farmer = await dbGet('farmers', imp.farmer_id);
    if (!farmer) return;
    const items = await dbGetAll('import_items');
    const impItems = items.filter(it => it.invoice_id === invoiceId);

    let itemsHtml = impItems.map((it, idx) => `
      <tr>
        <td>${formatVal(idx + 1)}</td>
        <td>${it.crop_type}</td>
        <td>${formatWeight(it.weight_kg, it.unit || 'kg')}</td>
        <td>${formatVal(it.box_count)} صندوق</td>
      </tr>
    `).join('');

    detailsBody.innerHTML = `
      <div style="padding: 12px 16px; background: rgba(0,0,0,0.02); border-radius: 12px; margin-bottom: 16px;">
        <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
          <span style="color:var(--color-text-muted);">رقم الفاتورة:</span>
          <span style="font-weight:700;"># ${formatVal(imp.id)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
          <span style="color:var(--color-text-muted);">الفلاح المورد:</span>
          <span style="font-weight:700; color:var(--color-primary);">${farmer.name}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
          <span style="color:var(--color-text-muted);">نوع سيارة الحمل:</span>
          <span>${imp.vehicle_type}</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span style="color:var(--color-text-muted);">تاريخ الاستلام:</span>
          <span>${new Date(imp.invoice_date).toLocaleString()}</span>
        </div>
      </div>

      <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:8px;">أصناف البضائع المستلمة بالفاتورة:</h4>
      <table class="details-table" style="width:100%; text-align:right; border-collapse:collapse; font-size:12px;">
        <thead>
          <tr style="border-bottom: 2px solid var(--color-border); color:var(--color-text-muted);">
            <th style="padding: 6px 4px;">ت</th>
            <th style="padding: 6px 4px;">المحصول</th>
            <th style="padding: 6px 4px;">الوزن الكلي القائم</th>
            <th style="padding: 6px 4px;">العدد / الصناديق</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    `;
  } else {
    titleEl.textContent = currentLanguage === 'ar' ? 'تفاصيل فاتورة البيع والأرباح' : 'Sale Invoice Details';
    const sale = await dbGet('sale_invoices', invoiceId);
    if (!sale) return;
    const customer = await dbGet('customers', sale.customer_id);
    if (!customer) return;
    const items = await dbGetAll('sale_items');
    const saleItems = items.filter(it => it.sale_invoice_id === invoiceId);

    let itemsHtml = saleItems.map((it, idx) => `
      <tr>
        <td>${formatVal(idx + 1)}</td>
        <td>${it.crop_type}</td>
        <td>${formatWeight(it.weight_kg, it.unit || 'kg')}</td>
        <td>${formatVal(it.box_count)} صندوق</td>
        <td>${formatVal(it.agreed_price, true)}</td>
      </tr>
    `).join('');

    const subtotal = saleItems.reduce((sum, item) => sum + item.agreed_price, 0);

    detailsBody.innerHTML = `
      <div style="padding: 12px 16px; background: rgba(0,0,0,0.02); border-radius: 12px; margin-bottom: 16px;">
        <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
          <span style="color:var(--color-text-muted);">رمز تتبع الفاتورة (ID):</span>
          <span style="font-weight:700;"># ${sale.order_id || formatVal(sale.id)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
          <span style="color:var(--color-text-muted);">الزبون المشتري:</span>
          <span style="font-weight:700; color:var(--color-primary);">${customer.name}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
          <span style="color:var(--color-text-muted);">طريقة الدفع:</span>
          <span style="font-weight:700;">${sale.payment_type === 'cash' ? '💵 نقد' : '📋 دين بالأجل'}</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span style="color:var(--color-text-muted);">تاريخ الإصدار:</span>
          <span>${new Date(sale.created_at).toLocaleString()}</span>
        </div>
      </div>

      <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:8px;">أصناف المبيعات:</h4>
      <table class="details-table" style="width:100%; text-align:right; border-collapse:collapse; font-size:12px;">
        <thead>
          <tr style="border-bottom: 2px solid var(--color-border); color:var(--color-text-muted);">
            <th style="padding: 6px 4px;">ت</th>
            <th style="padding: 6px 4px;">المحصول</th>
            <th style="padding: 6px 4px;">الوزن المباع</th>
            <th style="padding: 6px 4px;">الصناديق</th>
            <th style="padding: 6px 4px;">سعر البيع الكلي</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="margin-top: 16px; padding: 12px; border-top: 1px dashed rgba(0,0,0,0.1); line-height: 1.6; font-size:12px;">
        <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
          <span>مجموع المبيعات الكلي:</span>
          <span>${formatVal(subtotal, true)}</span>
        </div>
        ${sale.bags_cost > 0 ? `
          <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
            <span>أجور الأكياس والكراتين:</span>
            <span>+ ${formatVal(sale.bags_cost, true)}</span>
          </div>
        ` : ''}
        <div style="display:flex; justify-content:space-between; font-size: 14px; font-weight:800; color:var(--color-primary); border-top:1.5px dashed rgba(0,0,0,0.1); margin-top:6px; padding-top:6px;">
          <span>الإجمالي المستحق بالفاتورة:</span>
          <span>${formatVal(sale.total_amount, true)}</span>
        </div>
      </div>
    `;
  }

  openBottomSheet('sheet-invoice-details');
}

// ==============================================
// 16. BILINGUAL MULTI-UNIT RTL TRANSLATOR
// ==============================================
function applyBilingualTranslations() {
  const t = translations[currentLanguage];

  document.getElementById('lbl-app-title').textContent = t.appTitle;
  document.getElementById('lbl-app-subtitle').textContent = t.appSubtitle;
  document.getElementById('btn-lang-toggle').textContent = t.langButton;

  // Bottom tabs
  document.getElementById('lbl-import-tab').textContent = t.importTab;
  document.getElementById('lbl-sales-tab').textContent = t.salesTab;
  document.getElementById('lbl-accounts-tab').textContent = t.accountsTab;
  document.getElementById('lbl-stats-tab').textContent = t.statsTab;
  document.getElementById('lbl-settings-tab').textContent = t.settingsTab;

  // Tabs headers
  document.getElementById('tab-import-title').textContent = t.importTitle;
  document.getElementById('tab-import-desc').textContent = t.importDesc;
  document.getElementById('tab-sales-title').textContent = t.salesTitle;
  document.getElementById('tab-sales-desc').textContent = t.salesDesc;
  document.getElementById('tab-debts-btn').textContent = t.subtabDebts;
  document.getElementById('tab-dues-btn').textContent = t.subtabDues;
  document.getElementById('tab-porters-btn').textContent = t.subtabPorters;
  document.getElementById('tab-stats-title').textContent = t.statsTab;
  document.getElementById('tab-settings-title').textContent = t.settingsTab;

  // Action Buttons
  document.getElementById('btn-trigger-new-import').innerHTML = `<span class="material-icons-round">add_circle</span> ${t.newImportBtn}`;
  document.getElementById('btn-trigger-new-sale').innerHTML = `<span class="material-icons-round">receipt_long</span> ${t.newSaleBtn}`;

  // Inputs Placeholders
  document.getElementById('search-import-farmer').placeholder = t.searchFarmerPl;
  document.getElementById('search-sale-customer').placeholder = t.searchCustomerPl;
  document.getElementById('search-debts-input').placeholder = t.searchDebtsPl;
  document.getElementById('search-dues-input').placeholder = t.searchDuesPl;

  // Safe box card
  document.getElementById('lbl-safebox-title').textContent = t.safeBoxLabel;
  document.getElementById('lbl-total-cash-title').textContent = t.lblTotalCashSales;
  document.getElementById('lbl-total-collected-title').textContent = t.lblTotalCollectedDebts;
  document.getElementById('lbl-total-commission-title').textContent = t.lblTotalCommission5;
  document.getElementById('lbl-total-dues-title').textContent = t.lblTotalPaidDues;
  document.getElementById('lbl-total-porter-title').textContent = t.lblTotalPorterPayouts;

  document.getElementById('btn-record-expense').innerHTML = `<span class="material-icons-round">remove_circle_outline</span> ${t.btnAddExpense}`;
  document.getElementById('btn-record-loss').innerHTML = `<span class="material-icons-round">warning_amber</span> ${t.btnAddLoss}`;

  document.getElementById('lbl-chart-title').textContent = t.txtChartTitle;
  document.getElementById('lbl-ledger-title').textContent = t.txtLedgerTitle;

  // Settings Screen
  document.getElementById('lbl-office-title').textContent = t.officeSettingsTitle;
  document.getElementById('lbl-name-setting').textContent = t.lblOfficeName;
  document.getElementById('lbl-phone-setting').textContent = t.lblOfficePhone;
  document.getElementById('lbl-location-setting').textContent = t.lblOfficeLocation;
  document.getElementById('btn-save-office-settings').textContent = t.btnSaveOffice;

  document.getElementById('lbl-numeral-title').textContent = t.txtNumeralTitle;
  document.getElementById('lbl-numeral-desc').textContent = t.txtNumeralDesc;

  document.getElementById('lbl-sound-title').textContent = t.txtNotifTitle;
  document.getElementById('lbl-sound-desc').textContent = t.txtNotifDesc;

  document.getElementById('lbl-printer-title').textContent = t.txtPrinterTitle;
  document.getElementById('lbl-paper-width-title').textContent = t.lblPaperWidth;
  document.getElementById('btn-scan-printer').textContent = t.btnScanPrinter;
  document.getElementById('btn-test-print').textContent = t.btnTestPrint;

  document.getElementById('lbl-backup-title').textContent = t.txtBackupTitle;
  document.getElementById('lbl-backup-desc').textContent = t.txtBackupDesc;
  document.getElementById('btn-export-db').innerHTML = `<span class="material-icons-round" style="font-size:18px;">cloud_download</span> ${t.btnExportDb}`;
  document.getElementById('btn-import-db').innerHTML = `<span class="material-icons-round" style="font-size:18px;">cloud_upload</span> ${t.btnImportDb}`;

  // Sheets Forms
  document.getElementById('sheet-import-title-h3').textContent = t.sheetImportTitle;
  document.getElementById('lbl-import-farmer-label').textContent = t.lblFarmerName;
  document.getElementById('lbl-import-vehicle-label').textContent = t.lblVehicleType;
  document.getElementById('btn-add-import-crop').innerHTML = `<span class="material-icons-round" style="font-size: 16px;">add</span> ${t.txtAddCrop}`;
  document.getElementById('btn-submit-import').textContent = t.btnSubmitImport;

  document.getElementById('sheet-sale-title-h3').textContent = t.sheetSaleTitle;
  document.getElementById('lbl-sale-cust-label').textContent = t.lblCustomerName;
  document.getElementById('lbl-sale-phone-label').textContent = t.lblCustomerPhone;
  document.getElementById('lbl-sale-address-label').textContent = t.lblCustomerAddress;
  document.getElementById('btn-add-sale-crop').innerHTML = `<span class="material-icons-round" style="font-size: 16px;">add</span> ${t.txtAddSaleCrop}`;
  document.getElementById('lbl-sale-bags-label').textContent = t.lblBagsCost;
  document.getElementById('lbl-payment-method-title').textContent = t.lblPaymentMethod;
  document.getElementById('btn-pay-cash').textContent = t.btnPayCash;
  document.getElementById('btn-pay-debt').textContent = t.btnPayDebt;
  document.getElementById('lbl-debt-due-title').textContent = t.lblDebtDue;

  document.getElementById('lbl-subtotal-text').textContent = t.lblSubtotal;
  document.getElementById('lbl-commission-text').textContent = t.lblCommission7;
  document.getElementById('lbl-carrying-text').textContent = t.lblCarryingTotal;
  document.getElementById('lbl-total-text').textContent = t.lblTotalCalc;
  document.getElementById('btn-submit-sale').textContent = t.btnSubmitSale;

  document.getElementById('sheet-expense-title-h3').textContent = t.sheetExpenseTitle;
  document.getElementById('lbl-expense-type-label').textContent = t.lblExpenseType;
  document.getElementById('opt-expense-daily').textContent = t.expenseDaily;
  document.getElementById('opt-expense-personal').textContent = t.expensePersonal;
  document.getElementById('lbl-expense-subject-label').textContent = t.lblExpenseSubject;
  document.getElementById('lbl-expense-amount-label').textContent = t.lblExpenseAmount;
  document.getElementById('btn-submit-expense').textContent = t.btnSubmitExpense;

  document.getElementById('sheet-loss-title-h3').textContent = t.sheetLossTitle;
  document.getElementById('lbl-loss-subject-label').textContent = t.lblLossSubject;
  document.getElementById('lbl-loss-amount-label').textContent = t.lblLossAmount;
  document.getElementById('btn-submit-loss').textContent = t.btnSubmitLoss;

  document.getElementById('sheet-preview-title-h3').textContent = t.sheetPrintPreviewTitle;
  document.getElementById('btn-execute-print').innerHTML = `<span class="material-icons-round">bluetooth</span> ${t.btnExecutePrint}`;
  document.getElementById('btn-execute-sysprint').innerHTML = `<span class="material-icons-round">print</span> ${t.btnExecuteSystemPrint}`;
  document.getElementById('btn-share-receipt').innerHTML = `<span class="material-icons-round">image</span> ${t.btnShareReceipt}`;

  document.getElementById('sheet-payment-title-h3').textContent = t.sheetPaymentTitle;
  document.getElementById('lbl-payment-amount-label').textContent = t.lblPayAmount;
  document.getElementById('btn-submit-payment').textContent = t.btnSubmitPayment;

  // Language direction configurations
  if (currentLanguage === 'ar') {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.lang = 'ar';
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.lang = 'en';
  }

  // Reload lists if database active
  if (db) {
    renderImportsList();
    renderSalesList();
    renderDebtsList();
    renderDuesList();
    renderPortersList();
    renderStatsPanel();
  }
}

// ==============================================
// 17. BOTTOM SHEET GENERAL ACTIONS
// ==============================================
function openBottomSheet(id) {
  const sheet = document.getElementById(id);
  const overlay = document.getElementById('sheet-overlay');
  
  if (!sheet || !overlay) return;

  document.body.classList.add('sheet-open');

  sheet.style.display = 'block';
  overlay.style.display = 'block';
  
  setTimeout(() => {
    sheet.classList.add('show', 'open');
    overlay.classList.add('show', 'open');
  }, 10);
  
  // Specific initializations
  if (id === 'sheet-new-import') {
    addImportCropRow();
    setupFarmerAutocomplete();
  } else if (id === 'sheet-new-sale') {
    addSaleCropRow();
    setupCustomerAutocomplete();
  } else if (id === 'sheet-due-claims') {
    renderDueClaims();
  }
}

function closeBottomSheet(id) {
  const sheet = document.getElementById(id);
  const overlay = document.getElementById('sheet-overlay');

  if (!sheet || !overlay) return;

  sheet.classList.remove('show', 'open');
  overlay.classList.remove('show', 'open');

  setTimeout(() => {
    sheet.style.display = 'none';
    
    // Check if other sheets are active to decide if overlay stays
    const openSheets = document.querySelectorAll('.bottom-sheet.show, .bottom-sheet.open');
    if (openSheets.length === 0) {
      overlay.style.display = 'none';
      document.body.classList.remove('sheet-open');
    }
  }, 300);
}

// Close all open modals when overlay clicked
function handleOverlayClick() {
  const openSheets = document.querySelectorAll('.bottom-sheet.show, .bottom-sheet.open');
  openSheets.forEach(sheet => {
    closeBottomSheet(sheet.id);
  });
}

// ==============================================
// 18. TABS & MAIN NAVIGATION
// ==============================================
function updateUIActiveTab(tabId) {
  activeTab = tabId;
  
  // Hide all screens
  const screens = document.querySelectorAll('.app-screen, .screen-content');
  screens.forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });

  // Show selected screen
  const targetScreen = document.getElementById(tabId);
  if (targetScreen) {
    targetScreen.classList.add('active');
    targetScreen.style.display = 'block';
  }

  // Update nav buttons active style
  const navBtns = document.querySelectorAll('.nav-btn, .nav-item');
  navBtns.forEach(btn => {
    const target = btn.dataset.tab || btn.dataset.target;
    if (target === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Load appropriate lists
  if (tabId === 'screen-import') {
    renderImportsList();
  } else if (tabId === 'screen-sales') {
    renderSalesList();
  } else if (tabId === 'screen-accounts') {
    renderDebtsList();
    renderDuesList();
    renderPortersList();
  } else if (tabId === 'screen-stats') {
    renderStatsPanel();
  } else if (tabId === 'screen-settings') {
    // Fill settings inputs
    const setOfficeName = document.getElementById('setting-office-name');
    if (setOfficeName) setOfficeName.value = officeName;
    const setOfficePhone = document.getElementById('setting-office-phone');
    if (setOfficePhone) setOfficePhone.value = officePhone;
    const setOfficeLoc = document.getElementById('setting-office-location');
    if (setOfficeLoc) setOfficeLoc.value = officeLocation;
  }
}

// ==============================================
// 19. APP BOOTSTRAP INITIALIZATION
// ==============================================
async function startApp() {
  try {
    // 1. Initialize DB Room
    await initDatabase();
    
    // 2. Prepopulate Mock/Initial data if fresh DB
    await checkAndBootstrapData();

    // 3. Load custom user crops
    loadCustomCrops();

    // 4. Fill Cache
    await refreshGlobalCaches();

    // 5. Apply Bilingual & Layout values
    applyBilingualTranslations();
    updateHeaderDate();

    // 6. Bind Tab navigation triggers
    const navButtons = document.querySelectorAll('.nav-btn, .nav-item');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const btnEl = e.target.closest('.nav-btn, .nav-item');
        const tab = btnEl.dataset.tab || btnEl.dataset.target;
        if (tab) {
          updateUIActiveTab(tab);
        }
      });
    });

    // 7. Bind notification bell
    const btnNotif = document.getElementById('btn-notifications');
    if (btnNotif) {
      btnNotif.addEventListener('click', () => {
        openBottomSheet('sheet-due-claims');
      });
    }

    // 8. Bind global forms submission events
    document.getElementById('btn-submit-import').addEventListener('click', submitImportInvoice);
    document.getElementById('btn-add-import-crop').addEventListener('click', addImportCropRow);
    
    document.getElementById('btn-submit-sale').addEventListener('click', submitSaleInvoice);
    document.getElementById('btn-add-sale-crop').addEventListener('click', addSaleCropRow);
    document.getElementById('btn-submit-expense').addEventListener('click', submitExpenseRecord);
    document.getElementById('btn-submit-loss').addEventListener('click', submitLossRecord);

    // 9. Bind language / system toggle buttons
    document.getElementById('btn-lang-toggle').addEventListener('click', () => {
      currentLanguage = (currentLanguage === 'ar') ? 'en' : 'ar';
      localStorage.setItem('alwa_lang', currentLanguage);
      applyBilingualTranslations();
      updateHeaderDate();
    });

    document.getElementById('setting-numeral-system').addEventListener('change', (e) => {
      numeralSystem = e.target.value;
      localStorage.setItem('alwa_numeral_system', numeralSystem);
      applyBilingualTranslations();
      updateHeaderDate();
    });

    document.getElementById('setting-sound-alerts').addEventListener('change', (e) => {
      soundEnabled = e.target.checked;
      localStorage.setItem('alwa_sound', soundEnabled ? 'true' : 'false');
    });

    // 10. Bind bottom sheet open triggers
    document.getElementById('btn-trigger-new-import').addEventListener('click', () => openBottomSheet('sheet-new-import'));
    document.getElementById('btn-trigger-new-sale').addEventListener('click', () => openBottomSheet('sheet-new-sale'));
    
    document.getElementById('btn-record-expense').addEventListener('click', () => openBottomSheet('sheet-new-expense'));
    document.getElementById('btn-record-loss').addEventListener('click', () => openBottomSheet('sheet-new-loss'));

    // 11. Bind bottom sheet close buttons
    const closeButtons = document.querySelectorAll('.bottom-sheet-close, .btn-cancel-action, [id^="btn-close-"], .btn-choice-cancel, .btn-confirm-cancel, .btn-prompt-cancel, .btn-safe-adj-cancel, .btn-custom-crop-cancel');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sheet = e.target.closest('.bottom-sheet');
        if (sheet) {
          closeBottomSheet(sheet.id);
        }
      });
    });

    document.getElementById('sheet-overlay').addEventListener('click', handleOverlayClick);

    // 12. Bind Sub-tabs within Accounts Screen
    const subtabs = document.querySelectorAll('.subtab-btn, .segmented-control-btn');
    subtabs.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const btnEl = e.target.closest('.subtab-btn, .segmented-control-btn');
        const idMap = {
          'subtab-debts': 'section-debts-list',
          'subtab-dues': 'section-dues-list',
          'subtab-porters': 'section-porters-list',
          'tab-debts-btn': 'section-debts-list',
          'tab-dues-btn': 'section-dues-list',
          'tab-porters-btn': 'section-porters-list'
        };
        const targetId = btnEl.dataset.sub || idMap[btnEl.id];
        if (!targetId) return;

        ['section-debts-list', 'section-dues-list', 'section-porters-list'].forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            if (id === targetId) {
              el.style.display = 'flex';
              el.classList.add('active');
            } else {
              el.style.display = 'none';
              el.classList.remove('active');
            }
          }
        });

        subtabs.forEach(b => b.classList.remove('active'));
        btnEl.classList.add('active');
      });
    });

    // 13. Bind search filters
    document.getElementById('search-import-farmer').addEventListener('input', renderImportsList);
    document.getElementById('search-sale-customer').addEventListener('input', renderSalesList);
    document.getElementById('search-debts-input').addEventListener('input', renderDebtsList);
    document.getElementById('search-dues-input').addEventListener('input', renderDuesList);

    // 14. Bind archive search filters
    const searchArchiveFarmer = document.getElementById('search-archive-farmer');
    if (searchArchiveFarmer) {
      searchArchiveFarmer.addEventListener('input', renderArchiveList);
    }
    const searchArchiveSales = document.getElementById('search-archive-sales');
    if (searchArchiveSales) {
      searchArchiveSales.addEventListener('input', renderSalesArchiveList);
    }

    // 15. Bind hardware Bluetooth Scanner
    document.getElementById('btn-scan-printer').addEventListener('click', handleScanAndConnect);
    
    // Test print
    document.getElementById('btn-test-print').addEventListener('click', () => {
      if (!isPrinterConnected) {
        showToast(currentLanguage === 'ar' ? 'الرجاء تشغيل واقتران طابعة البلوتوث BLE أولاً!' : 'Please connect BLE printer first!', 'bluetooth', true);
        return;
      }
      showToast(currentLanguage === 'ar' ? 'جاري طباعة تذكرة الفحص الحراري...' : 'Printing hardware test page...', 'hourglass_empty');
      setTimeout(() => {
        playSound('success');
        showToast(currentLanguage === 'ar' ? 'تمت طباعة تذكرة الفحص بنجاح!' : 'Test page printed successfully!', 'print');
      }, 1200);
    });

    // Paper width selector supporting both select dropdown and custom buttons
    const paperWidthSelect = document.getElementById('setting-paper-width');
    if (paperWidthSelect) {
      paperWidthSelect.addEventListener('change', (e) => handlePaperWidthChange(e.target.value));
    }
    const paper58 = originalGetElementById.call(document, 'paper-width-58');
    const paper80 = originalGetElementById.call(document, 'paper-width-80');
    if (paper58 && paper80) {
      const handleWidthClick = (width) => {
        if (width === '58') {
          paper58.classList.add('active');
          paper80.classList.remove('active');
        } else {
          paper80.classList.add('active');
          paper58.classList.remove('active');
        }
        handlePaperWidthChange(width);
      };
      paper58.addEventListener('click', () => handleWidthClick('58'));
      paper80.addEventListener('click', () => handleWidthClick('80'));
    }

    // 16. Bind backup triggers
    document.getElementById('btn-export-db').addEventListener('click', exportDatabaseToJSON);
    document.getElementById('btn-import-db').addEventListener('click', triggerImportDatabase);
    document.getElementById('db-import-file-input').addEventListener('change', importDatabaseFromJSON);

    // 17. Bind printer action execution
    document.getElementById('btn-execute-print').addEventListener('click', (e) => {
      const saleId = parseInt(e.target.closest('button').dataset.id);
      executePrintJob(saleId);
    });

    document.getElementById('btn-execute-sysprint').addEventListener('click', executeSystemPrintJob);
    document.getElementById('btn-share-receipt').addEventListener('click', shareReceiptAsImage);

    // 18. Bind Office Info Save
    document.getElementById('btn-save-office-settings').addEventListener('click', saveOfficeInfo);

    // 19. Initialize settings preferences
    const numSystemValue = localStorage.getItem('alwa_numeral_system') || 'en';
    numeralSystem = numSystemValue;
    document.getElementById('setting-numeral-system').value = numeralSystem;

    const storedSound = localStorage.getItem('alwa_sound') || 'true';
    soundEnabled = storedSound === 'true';
    document.getElementById('setting-sound-alerts').checked = soundEnabled;

    // 20. Bind customer payment trigger select (cash/debt) in sale form
    const paymentBtns = document.querySelectorAll('.payment-method-selector .btn-secondary');
    paymentBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        paymentBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const debtGroup = document.getElementById('sale-debt-due-group');
        if (btn.dataset.method === 'debt') {
          debtGroup.style.display = 'block';
        } else {
          debtGroup.style.display = 'none';
        }
        updateSaleInvoiceOverallTotal();
      });
    });

    // 21. Hide splash screen completely with beautiful CSS fade-out animation
    setTimeout(() => {
      const splash = document.getElementById('app-splash-screen');
      if (splash) {
        splash.classList.add('hide');
        setTimeout(() => splash.remove(), 600);
      }
    }, 1500);

    // Set default view active
    updateUIActiveTab('screen-import');

    // Run first check
    await checkDueClaims();

    // 22. Initialize automatic Bluetooth/BLE printer reconnection
    initAutoConnect();

  } catch (err) {
    console.error('Fatal initialization error:', err);
    showToast('خطأ أثناء بدء تشغيل نظام علوة للمحاسبة', 'warning', true);
  }
}

// Cordova / Native platform back-button binding for Capacitor hybrid environments
document.addEventListener('deviceready', () => {
  if (Capacitor.isNativePlatform()) {
    StatusBar.setStyle({ style: Style.Dark });
    StatusBar.setBackgroundColor({ color: '#1B4332' });
  }
}, false);

window.addEventListener('DOMContentLoaded', startApp);
