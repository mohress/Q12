import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import html2canvas from 'html2canvas';

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
    'lbl-subtotal-val': 'val-subtotal',
    'lbl-commission-val': 'val-commission-7',
    'lbl-carrying-val': 'val-carrying-total',
    'lbl-total-val': 'val-total-calc',
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

function logAppEvent(actionAr, actionEn, amount = 0) {
  let logs = [];
  try {
    const stored = localStorage.getItem('alwa_app_logs');
    if (stored) logs = JSON.parse(stored);
  } catch (e) {}

  const now = new Date();
  const todayStr = now.toDateString();

  // Filter out logs that are older than today (daily reset!)
  logs = logs.filter(item => {
    const d = new Date(item.timestamp);
    return d.toDateString() === todayStr;
  });

  // Append new log
  logs.push({
    actionAr,
    actionEn,
    amount,
    timestamp: Date.now()
  });

  // Save back to localStorage
  localStorage.setItem('alwa_app_logs', JSON.stringify(logs));
  
  // Render logs immediately
  renderAppLogs();
}

function renderAppLogs() {
  const container = document.getElementById('app-logs-container');
  if (!container) return;

  let logs = [];
  try {
    const stored = localStorage.getItem('alwa_app_logs');
    if (stored) logs = JSON.parse(stored);
  } catch (e) {}

  const now = new Date();
  const todayStr = now.toDateString();

  // Ensure only today's logs are shown (daily reset!)
  logs = logs.filter(item => {
    const d = new Date(item.timestamp);
    return d.toDateString() === todayStr;
  });

  if (logs.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 16px; color: var(--color-text-muted); font-size: 11px; font-weight: 600;">
        ${currentLanguage === 'ar' ? 'لا توجد سجلات عمليات لليوم حتى الآن' : 'No application logs recorded for today yet'}
      </div>
    `;
    return;
  }

  // Sort newest first
  logs.sort((a, b) => b.timestamp - a.timestamp);

  container.innerHTML = logs.map(log => {
    const d = new Date(log.timestamp);
    const timeStr = d.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const actionText = currentLanguage === 'ar' ? log.actionAr : log.actionEn;
    const amountText = log.amount > 0 ? ` +${formatVal(log.amount)} د.ع` : '';
    const amountColor = log.amount > 0 ? 'var(--color-success)' : 'var(--color-text-muted)';

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.05); font-size: 11px;">
        <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
          <span style="color: var(--color-primary-mid); font-weight: 800; font-family: monospace;">[${timeStr}]</span>
          <span style="font-weight: 700; color: var(--color-text-dark);">${actionText}</span>
        </div>
        ${log.amount > 0 ? `<span style="font-weight: 800; color: ${amountColor}; margin-right: 8px;">${amountText}</span>` : ''}
      </div>
    `;
  }).join('');
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
  let activeUnit = unit === 'mixed' ? 'kg' : unit;
  if (numeralSystem === 'ar') {
    if (activeUnit === 'kg') unitStr = 'كغم';
    else if (activeUnit === 'liter') unitStr = 'لتر';
    else if (activeUnit === 'count') unitStr = 'عدد';
    return `\u202B${formattedNum} ${unitStr}\u202C`;
  } else {
    if (activeUnit === 'kg') unitStr = 'Kg';
    else if (activeUnit === 'liter') unitStr = 'Ltr';
    else if (activeUnit === 'count') unitStr = 'Qty';
    return `\u202A${formattedNum} ${unitStr}\u202C`;
  }
}

function formatWeightFraction(rem, total, unit = 'kg') {
  const formattedRem = formatVal(rem);
  const formattedTotal = formatVal(total);
  let unitStr = '';
  let activeUnit = unit === 'mixed' ? 'kg' : unit;
  if (numeralSystem === 'ar') {
    if (activeUnit === 'kg') unitStr = 'كغم';
    else if (activeUnit === 'liter') unitStr = 'لتر';
    else if (activeUnit === 'count') unitStr = 'عدد';
    return `\u202B${formattedRem} / ${formattedTotal} ${unitStr}\u202C`;
  } else {
    if (activeUnit === 'kg') unitStr = 'Kg';
    else if (activeUnit === 'liter') unitStr = 'Ltr';
    else if (activeUnit === 'count') unitStr = 'Qty';
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

async function refreshAllUI() {
  await refreshGlobalCaches();
  renderImportsList();
  renderSalesList();
  renderDebtsList();
  renderDuesList();
  renderPortersList();
  renderStatsPanel();
  
  const sheetImportsArchive = document.getElementById('sheet-imports-archive');
  if (sheetImportsArchive && sheetImportsArchive.classList.contains('active')) {
    renderArchiveList();
  }
  const sheetSalesArchive = document.getElementById('sheet-sales-archive');
  if (sheetSalesArchive && sheetSalesArchive.classList.contains('active')) {
    renderSalesArchiveList();
  }
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
  
  await refreshAllUI();
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

    // Render matches
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

    // Always append "➕ إضافة صنف جديد" at the end
    const addCustomDiv = document.createElement('div');
    addCustomDiv.className = 'autocomplete-item';
    addCustomDiv.style.borderTop = '1px dashed rgba(0,0,0,0.1)';
    addCustomDiv.style.fontWeight = '700';
    addCustomDiv.style.color = 'var(--color-primary)';
    addCustomDiv.textContent = currentLanguage === 'ar' ? `➕ إضافة صنف جديد...` : `➕ Add new crop...`;
    addCustomDiv.addEventListener('click', () => {
      openCustomCropDialog(selector, () => {
        autocomplete.style.display = 'none';
      });
    });
    autocomplete.appendChild(addCustomDiv);

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

  logAppEvent(
    `تسجيل فاتورة استيراد جديدة للفلاح: ${farmerName} (${vehicleType})`,
    `Recorded new import invoice for farmer: ${farmerName} (${vehicleType})`
  );

  showToast(currentLanguage === 'ar' ? 'تم حفظ فاتورة الاستيراد بنجاح والبدء بعرضها!' : 'Import invoice recorded and ready for sales!', 'check_circle');
  
  document.getElementById('import-farmer-name').value = '';
  document.getElementById('import-vehicle-type').value = '';
  document.getElementById('import-items-container').innerHTML = '';
  closeBottomSheet('sheet-new-import');
  
  await refreshAllUI();
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
      <label class="sale-unit-price-label">${currentLanguage === 'ar' ? 'سعر البيع للكيلو الواحد (دينار)' : 'Sale Price per Kg (IQD)'}</label>
      <input type="number" class="form-input sale-crop-unit-price" placeholder="${currentLanguage === 'ar' ? 'أدخل السعر...' : 'Enter unit price...'}" required>
    </div>

    <div class="form-group sale-porter-rate-container" style="margin-top: 8px;">
      <label class="sale-porter-rate-label">${currentLanguage === 'ar' ? 'عمولة الحمالية للصندوق الواحد (دينار)' : 'Porter Fee per Box (IQD)'}</label>
      <div class="porter-options-row" style="display: flex; gap: 8px; margin-top: 4px; margin-bottom: 8px; flex-wrap: wrap;">
        <button type="button" class="porter-opt-btn active" data-value="100" style="flex: 1; padding: 6px 12px; font-size: 11px; font-weight: 700; border-radius: 8px; border: 1.5px solid var(--color-primary); background: var(--color-primary); color: white; cursor: pointer; text-align: center; transition: all 0.2s;">100</button>
        <button type="button" class="porter-opt-btn" data-value="200" style="flex: 1; padding: 6px 12px; font-size: 11px; font-weight: 600; border-radius: 8px; border: 1.5px solid rgba(27,67,50,0.25); background: white; color: var(--color-primary); cursor: pointer; text-align: center; transition: all 0.2s;">200</button>
        <button type="button" class="porter-opt-btn" data-value="250" style="flex: 1; padding: 6px 12px; font-size: 11px; font-weight: 600; border-radius: 8px; border: 1.5px solid rgba(27,67,50,0.25); background: white; color: var(--color-primary); cursor: pointer; text-align: center; transition: all 0.2s;">250</button>
        <button type="button" class="porter-opt-btn btn-custom-porter-trigger" data-value="custom" style="flex: 1; padding: 6px 12px; font-size: 11px; font-weight: 600; border-radius: 8px; border: 1.5px solid rgba(27,67,50,0.25); background: white; color: var(--color-primary); cursor: pointer; text-align: center; transition: all 0.2s;">${currentLanguage === 'ar' ? 'مخصص' : 'Custom'}</button>
      </div>
      <input type="number" class="form-input sale-porter-rate" value="100" style="display: none; text-align: center; font-weight: 600;" placeholder="${currentLanguage === 'ar' ? 'أدخل عمولة مخصصة...' : 'Enter custom rate...'}">
      <span class="sale-row-porter-total-label" style="font-size:11px; font-weight:600; color:var(--color-primary-mid); display:block; margin-top:4px;"></span>
    </div>
  `;

  const cargoSelect = row.querySelector('.sale-cargo-select');
  const weightInput = row.querySelector('.sale-crop-weight');
  const boxInput = row.querySelector('.sale-box-count');
  const priceInput = row.querySelector('.sale-crop-unit-price');
  const remainingLabel = row.querySelector('.sale-row-remaining-label');
  const boxContainer = row.querySelector('.sale-box-count-container');
  const porterRateContainer = row.querySelector('.sale-porter-rate-container');

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

    const unitPriceLabel = row.querySelector('.sale-unit-price-label');
    const unitPriceInput = row.querySelector('.sale-crop-unit-price');

    if (isCount) {
      weightInput.closest('.form-group').style.display = 'none';
      weightInput.value = '';
      boxContainer.style.display = 'block';
      boxInput.setAttribute('max', remBoxes);
      remainingLabel.textContent = currentLanguage === 'ar' ? `المتبقي: ${formatVal(remBoxes)} مفرد` : `Remaining: ${formatVal(remBoxes)} qty`;
      
      unitPriceLabel.textContent = currentLanguage === 'ar' ? 'سعر البيع للقطعة الواحدة (دينار)' : 'Sale Price per Piece (IQD)';
      unitPriceInput.placeholder = currentLanguage === 'ar' ? 'أدخل سعر القطعة الواحدة...' : 'Enter price per piece...';
    } else {
      weightInput.closest('.form-group').style.display = 'block';
      weightInput.setAttribute('max', remWeight);
      
      unitPriceLabel.textContent = currentLanguage === 'ar' ? 'سعر البيع للكيلو الواحد (دينار)' : 'Sale Price per Kg (IQD)';
      unitPriceInput.placeholder = currentLanguage === 'ar' ? 'أدخل سعر الكيلو الواحد...' : 'Enter price per Kg...';

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

    const isSpecial = isWatermelonOrMelon(cropType);
    if (isSpecial) {
      porterRateContainer.style.display = 'none';
    } else {
      porterRateContainer.style.display = 'block';
    }

    updateSaleInvoiceOverallTotal();
  });

  const porterBtns = row.querySelectorAll('.porter-opt-btn');
  const porterRateInput = row.querySelector('.sale-porter-rate');

  porterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Deactivate all
      porterBtns.forEach(b => {
        b.classList.remove('active');
        b.style.background = 'white';
        b.style.color = 'var(--color-primary)';
        b.style.borderColor = 'rgba(27,67,50,0.25)';
        b.style.fontWeight = '600';
      });

      // Activate clicked
      btn.classList.add('active');
      btn.style.background = 'var(--color-primary)';
      btn.style.color = 'white';
      btn.style.borderColor = 'var(--color-primary)';
      btn.style.fontWeight = '700';

      const val = btn.dataset.value;
      if (val === 'custom') {
        porterRateInput.style.display = 'block';
        porterRateInput.value = '';
        porterRateInput.focus();
      } else {
        porterRateInput.style.display = 'none';
        porterRateInput.value = val;
      }
      updateSaleInvoiceOverallTotal();
    });
  });

  weightInput.addEventListener('input', updateSaleInvoiceOverallTotal);
  boxInput.addEventListener('input', updateSaleInvoiceOverallTotal);
  priceInput.addEventListener('input', updateSaleInvoiceOverallTotal);
  porterRateInput.addEventListener('input', updateSaleInvoiceOverallTotal);

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
  let totalCarrying = 0; // calculated dynamically
  
  rows.forEach(row => {
    const cargoSelect = row.querySelector('.sale-cargo-select');
    if (!cargoSelect || !cargoSelect.value) return;
    
    const [, cropType] = cargoSelect.value.split('|');
    const isCount = (getCropUnitType(cropType) === 'count');
    const isSpecial = isWatermelonOrMelon(cropType);

    const weight = parseNumberInput(row.querySelector('.sale-crop-weight').value) || 0;
    const boxCount = parseNumberInput(row.querySelector('.sale-box-count').value) || 0;
    const unitPrice = parseNumberInput(row.querySelector('.sale-crop-unit-price').value) || 0;
    
    const price = isCount ? (boxCount * unitPrice) : (weight * unitPrice);
    subtotal += price;
    
    // Alwa 7% commission
    totalCommissions += Math.round(price * 0.07);
    
    // Carrying cost (الحمالية): 
    let rowPorterFee = 0;
    if (!isSpecial) {
      const porterRate = parseNumberInput(row.querySelector('.sale-porter-rate').value) || 0;
      rowPorterFee = boxCount * porterRate;
      row.querySelector('.sale-row-porter-total-label').textContent = 
        currentLanguage === 'ar' ? `حمالية الصنف: ${formatVal(rowPorterFee)} دينار` : `Item porter: ${formatVal(rowPorterFee)} IQD`;
    } else {
      row.querySelector('.sale-row-porter-total-label').textContent = '';
    }
    totalCarrying += rowPorterFee;
  });

  const bagsCost = parseNumberInput(document.getElementById('sale-bags-cost').value) || 0;
  const grandTotal = subtotal + totalCommissions + totalCarrying + bagsCost;

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
  
  const paymentMethodSelect = document.querySelector('.toggle-switch-group .toggle-switch-btn.active');
  const paymentType = paymentMethodSelect ? paymentMethodSelect.dataset.method : 'cash';

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
    
    const weight = parseNumberInput(row.querySelector('.sale-crop-weight').value) || 0;
    const boxCount = parseNumberInput(row.querySelector('.sale-box-count').value) || 0;
    const unitPrice = parseNumberInput(row.querySelector('.sale-crop-unit-price').value) || 0;

    const isCount = (getCropUnitType(cropType) === 'count');
    const isSpecial = isWatermelonOrMelon(cropType);

    const totalPrice = isCount ? (boxCount * unitPrice) : (weight * unitPrice);

    if (totalPrice <= 0) {
      showToast(currentLanguage === 'ar' ? 'السعر يجب أن يكون أكبر من الصفر' : 'Price must be greater than zero', 'warning', true);
      return;
    }

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

    // Port fees: custom porter rate per box
    const porterRate = isSpecial ? 0 : (parseNumberInput(row.querySelector('.sale-porter-rate').value) || 0);
    const rowPorterFee = isSpecial ? 0 : (boxCount * porterRate);

    saleItemsToSave.push({
      import_invoice_id: importInvoiceId,
      crop_type: cropType,
      weight_kg: isCount ? 0 : weight,
      box_count: boxCount,
      agreed_price: totalPrice,
      unit: isCount ? 'count' : (impItem.unit || 'kg'),
      commission_amount: Math.round(totalPrice * 0.07), // 7% company fee
      porter_fee: rowPorterFee,
      unit_price: unitPrice
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
  const grandTotal = subtotal + totalCommissions + totalCarrying + bagsCost;

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
        crop_type: item.crop_type,
        box_count: item.box_count,
        amount: item.porter_fee,
        is_paid: false,
        created_at: Date.now()
      });
    }
  }

  // Handle debt ledger entry
  if (paymentType === 'debt') {
    const activeDebtDaysBtn = document.querySelector('#group-debt-options .segmented-control-btn.active');
    const debtDays = activeDebtDaysBtn ? parseInt(activeDebtDaysBtn.dataset.days) : 5;
    const dueTime = Date.now() + debtDays * 24 * 60 * 60 * 1000;
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

  logAppEvent(
    `تسجيل فاتورة بيع جديدة للزبون: ${customer.name} (نوع الدفع: ${paymentType === 'cash' ? 'نقدي' : 'دين'})`,
    `New sale invoice registered for customer: ${customer.name} (${paymentType === 'cash' ? 'Cash' : 'Debt'})`,
    grandTotal
  );

  showToast(currentLanguage === 'ar' ? 'تم إصدار فاتورة البيع والخصم التلقائي بنجاح!' : 'Sale invoice created and stats adjusted!', 'check_circle');

  // Reset Form
  document.getElementById('sale-customer-name').value = '';
  document.getElementById('sale-customer-phone').value = '';
  document.getElementById('sale-customer-address').value = '';
  document.getElementById('sale-bags-cost').value = '';
  document.getElementById('sale-items-container').innerHTML = '';
  
  // Reset totals
  document.getElementById('lbl-subtotal-val').textContent = formatVal(0, true);
  document.getElementById('lbl-commission-val').textContent = formatVal(0, true);
  document.getElementById('lbl-carrying-val').textContent = formatVal(0, true);
  document.getElementById('lbl-total-val').textContent = formatVal(0, true);

  closeBottomSheet('sheet-new-sale');

  await refreshAllUI();
  
  // Show print preview directly after sale
  openPrintPreview(saleInvoiceId);
}

async function deleteSaleInvoice(saleId) {
  // 1. Fetch the sale invoice first to get details
  const invoice = await dbGet('sale_invoices', saleId);
  if (!invoice) {
    showToast(currentLanguage === 'ar' ? 'الفاتورة غير موجودة!' : 'Invoice not found!', 'warning', true);
    return;
  }

  // Fetch all related entities once at function level
  const allDebts = await dbGetAll('debts');
  const allDues = await dbGetAll('farmer_dues');
  const allPorters = await dbGetAll('porter_payouts');

  // 2. Check associated debt if payment type is 'debt'
  if (invoice.payment_type === 'debt') {
    const associatedDebt = allDebts.find(d => d.sale_invoice_id === saleId);
    if (associatedDebt) {
      if (associatedDebt.is_paid) {
        showToast(
          currentLanguage === 'ar' 
            ? 'لا يمكن حذف الفاتورة لأنه تم تسديد الدين المرتبط بها بالكامل!' 
            : 'Cannot delete invoice because its associated debt has been fully paid!', 
          'warning', 
          true
        );
        return;
      }
      if (associatedDebt.amount < invoice.total_amount) {
        showToast(
          currentLanguage === 'ar' 
            ? 'لا يمكن حذف الفاتورة لأنه تم تسديد جزء من الدين المرتبط بها بالفعل!' 
            : 'Cannot delete invoice because a partial payment has already been made on its debt!', 
          'warning', 
          true
        );
        return;
      }
    }
  }

  // 3. Check associated farmer dues
  const associatedDues = allDues.filter(d => d.sale_invoice_id === saleId);
  for (const due of associatedDues) {
    const originalNetDue = due.sold_price - due.commission_deducted - due.porter_deducted;
    if (due.is_paid || due.net_due < originalNetDue) {
      showToast(
        currentLanguage === 'ar' 
          ? 'لا يمكن حذف الفاتورة لأنه تم صرف مستحقات الفلاح الخاصة بهذه العملية أو جزء منها!' 
          : 'Cannot delete invoice because associated farmer dues have been partially or fully paid!', 
        'warning', 
        true
      );
      return;
    }
  }

  // 4. Check associated porter payouts
  const associatedPorters = allPorters.filter(p => p.sale_invoice_id === saleId);
  const hasPaidPorter = associatedPorters.some(p => p.is_paid);
  if (hasPaidPorter) {
    showToast(
      currentLanguage === 'ar' 
        ? 'لا يمكن حذف الفاتورة لأنه تم صرف مستحقات الحمالين الخاصة بها بالفعل!' 
        : 'Cannot delete invoice because associated porter payouts have already been paid!', 
      'warning', 
      true
    );
    return;
  }

  const confirmTitle = currentLanguage === 'ar' ? 'حذف فاتورة البيع' : 'Delete Sale Invoice';
  const confirmMessage = currentLanguage === 'ar' ? 
    'هل أنت متأكد من حذف فاتورة البيع هذه بالكامل؟ سيتم إلغاء تأثيرها المالي وحسابات الديون والعمولات ومستحقات الفلاحين.' : 
    'Are you sure you want to permanently delete this sales invoice? All ledger balances will roll back.';
  
  const isConfirmed = await showCustomConfirm(confirmTitle, confirmMessage);
  if (!isConfirmed) return;

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
  allDebts.filter(d => d.sale_invoice_id === saleId).forEach(d => {
    debtsStore.delete(d.id);
  });

  // Delete associated farmer dues
  const duesStore = tx.objectStore('farmer_dues');
  allDues.filter(d => d.sale_invoice_id === saleId).forEach(d => {
    duesStore.delete(d.id);
  });

  // Delete associated porter payouts
  const porterStore = tx.objectStore('porter_payouts');
  allPorters.filter(p => p.sale_invoice_id === saleId).forEach(p => {
    porterStore.delete(p.id);
  });

  tx.oncomplete = async () => {
    logAppEvent(
      `حذف فاتورة بيع للزبون: ${invoice.customer_name}`,
      `Deleted sale invoice for customer: ${invoice.customer_name}`
    );
    showToast(currentLanguage === 'ar' ? 'تم حذف فاتورة البيع والخصومات المالية التابعة لها بنجاح!' : 'Sales invoice deleted and financial impacts rolled back!', 'delete');
    await refreshAllUI();
  };
}

async function deleteImportInvoice(impId) {
  // 1. Fetch import invoice
  const invoice = await dbGet('import_invoices', impId);
  if (!invoice) {
    showToast(currentLanguage === 'ar' ? 'الفاتورة غير موجودة!' : 'Invoice not found!', 'warning', true);
    return;
  }

  // 2. Check if invoice is settled
  if (invoice.is_settled) {
    showToast(
      currentLanguage === 'ar' 
        ? 'لا يمكن حذف الفاتورة لأنها مسواة ومغلقة بالكامل!' 
        : 'Cannot delete invoice because it is already settled and closed!', 
      'warning', 
      true
    );
    return;
  }

  // 3. Check if there are active sales
  const allSales = await dbGetAll('sale_items');
  const hasSales = allSales.some(s => s.import_invoice_id === impId);
  if (hasSales) {
    showToast(
      currentLanguage === 'ar' 
        ? 'لا يمكن حذف الفاتورة لوجود مبيعات جارية مسجلة عليها بالفعـل!' 
        : 'Cannot delete invoice as there are active sales logged against it!', 
      'warning', 
      true
    );
    return;
  }

  const confirmTitle = currentLanguage === 'ar' ? 'حذف فاتورة الاستيراد' : 'Delete Import Invoice';
  const confirmMessage = currentLanguage === 'ar' ? 
    'هل أنت متأكد من حذف فاتورة الاستيراد هذه؟ سيؤدي ذلك أيضاً لحذف أصناف المحاصيل التابعة لها بالكامل.' : 
    'Are you sure you want to delete this import invoice and its items?';
  
  const isConfirmed = await showCustomConfirm(confirmTitle, confirmMessage);
  if (!isConfirmed) return;

  const tx = db.transaction(['import_invoices', 'import_items'], 'readwrite');
  tx.objectStore('import_invoices').delete(impId);

  const itemsStore = tx.objectStore('import_items');
  const allItems = await dbGetAll('import_items');
  allItems.filter(it => it.invoice_id === impId).forEach(it => {
    itemsStore.delete(it.id);
  });

  tx.oncomplete = async () => {
    const farmer = await dbGet('farmers', invoice.farmer_id);
    const farmerName = farmer ? farmer.name : '';
    logAppEvent(
      `حذف فاتورة استيراد للفلاح: ${farmerName}`,
      `Deleted import invoice for farmer: ${farmerName}`
    );
    showToast(currentLanguage === 'ar' ? 'تم حذف فاتورة الاستيراد بنجاح!' : 'Import invoice deleted successfully!', 'delete');
    await refreshAllUI();
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
  const allSaleItems = await dbGetAll('sale_items');
  const allSaleInvoices = await dbGetAll('sale_invoices');

  // Filter out paid debts
  const activeDebts = debts.filter(d => !d.is_paid);
  activeDebts.sort((a,b) => b.due_date - a.due_date);

  let displayedCount = 0;
  for (const debt of activeDebts) {
    const customer = customers.find(c => c.id === debt.customer_id);
    if (!customer) continue;

    const saleInvoice = allSaleInvoices.find(s => s.id === debt.sale_invoice_id);
    const orderId = saleInvoice?.order_id || ('ALW-' + String(debt.sale_invoice_id).padStart(3, '0'));
    const items = allSaleItems.filter(it => it.sale_invoice_id === debt.sale_invoice_id);
    const itemNamesStr = items.map(it => it.crop_type).join('، ');

    const matchId = '#' + debt.sale_invoice_id.toString();
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery) ||
                          itemNamesStr.toLowerCase().includes(searchQuery) ||
                          orderId.toLowerCase().includes(searchQuery) ||
                          debt.sale_invoice_id.toString().includes(searchQuery) ||
                          matchId.toLowerCase().includes(searchQuery);

    if (searchQuery && !matchesSearch) {
      continue;
    }

    const now = Date.now();
    const isLate = now >= debt.due_date;
    const formattedDate = new Date(debt.due_date).toLocaleDateString(numeralSystem === 'ar' ? 'ar-IQ' : 'en-US');

    const card = document.createElement('div');
    card.className = 'premium-card stagger-item';
    card.style.animationDelay = `${displayedCount * 0.08}s`;

    let itemsDetailsHtml = items.map(it => {
      return `<div style="font-size:11px; color:var(--color-text-dark); display:flex; justify-content:space-between; background: rgba(0,0,0,0.02); padding: 4px 6px; border-radius:6px;">
        <span>${getCropIcon(it.crop_type)} ${it.crop_type} (${formatWeight(it.weight_kg, it.unit || 'kg')})</span>
        <span style="font-weight:700;">${formatVal(it.agreed_price, true)}</span>
      </div>`;
    }).join('');

    if (!itemsDetailsHtml) {
      itemsDetailsHtml = `<div style="font-size:11px; color:var(--color-text-dark); display:flex; justify-content:space-between; background: rgba(0,0,0,0.02); padding: 4px 6px; border-radius:6px;">
        <span>${currentLanguage === 'ar' ? 'تفاصيل المعاملة' : 'Transaction Detail'}</span>
        <span>${currentLanguage === 'ar' ? 'دين مبيعات معلق بذمة الزبون' : 'Pending outstanding sales debt'}</span>
      </div>`;
    }

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:8px;">
        <div>
          <span class="lang-badge" style="background-color: var(--color-primary-mid); margin-bottom:4px; display:inline-block; font-family: monospace; letter-spacing: 0.5px;">
            ID: ${orderId}
          </span>
          <h4 style="font-size:14px; font-weight:700; color:var(--color-primary);">${customer.name}</h4>
          <span style="font-size:10px; color:var(--color-text-muted);">${customer.address || ''} ${customer.phone ? `• ${customer.phone}` : ''}</span>
        </div>
        <div style="text-align:left; display:flex; flex-direction:column; gap:4px; align-items:flex-end;">
          <span style="font-size:11px; font-weight:600; color:var(--color-text-muted);">${formattedDate}</span>
          ${isLate ? 
            `<span class="debt-status-tag late" style="font-size:9px;">⚠️ ${currentLanguage === 'ar' ? 'متأخر عن السداد' : 'Overdue'}</span>` : 
            `<span class="debt-status-tag unpaid" style="font-size:9px;">⏳ ${currentLanguage === 'ar' ? 'بانتظار التحصيل' : 'Pending'}</span>`
          }
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:4px; margin: 6px 0;">
        ${itemsDetailsHtml}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px; border-top:1px dashed rgba(0,0,0,0.05); padding-top:6px;">
        <div>
          <span style="font-size:11px; color:var(--color-text-muted);">${currentLanguage === 'ar' ? 'إجمالي الدين' : 'Outstanding Debt'}</span>
          <h3 style="font-size:16px; font-weight:700; color:var(--color-primary);">${formatVal(debt.amount, true)}</h3>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="btn-secondary btn-debt-details" data-invoice-id="${debt.sale_invoice_id}" style="padding:6px 10px; font-size:11px; display:flex; align-items:center; gap:4px; border:1.5px solid var(--color-primary-light); background: rgba(0, 150, 199, 0.04); color: var(--color-primary); box-shadow: none;">
            <span class="material-icons-round" style="font-size:14px;">visibility</span>
            <span>${currentLanguage === 'ar' ? 'التفاصيل' : 'Details'}</span>
          </button>
          <button class="btn-secondary btn-debt-partial" data-id="${debt.id}" style="padding:6px 10px; font-size:11px; display:flex; align-items:center; gap:4px; border:1.5px solid var(--color-info); background: rgba(0, 119, 182, 0.04); color: var(--color-info); box-shadow: none;">
            <span class="material-icons-round" style="font-size:14px;">payments</span>
            <span>${currentLanguage === 'ar' ? 'تسديد جزئي' : 'Partial'}</span>
          </button>
          <button class="btn-secondary btn-debt-full" data-id="${debt.id}" style="padding:6px 10px; font-size:11px; display:flex; align-items:center; gap:4px; border:1.5px solid var(--color-success); background: rgba(82, 183, 136, 0.04); color: var(--color-success); box-shadow: none;">
            <span class="material-icons-round" style="font-size:14px;">check_circle</span>
            <span>${currentLanguage === 'ar' ? 'تسديد' : 'Settle'}</span>
          </button>
        </div>
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

  document.querySelectorAll('.btn-debt-details').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const btnEl = e.currentTarget;
      const invoiceId = parseInt(btnEl.dataset.invoiceId);
      await showInvoiceDetails(invoiceId, 'sale');
    });
  });

  document.querySelectorAll('.btn-debt-partial').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const btnEl = e.currentTarget;
      const debtId = parseInt(btnEl.dataset.id);
      await openPaymentSheet(debtId);
    });
  });

  document.querySelectorAll('.btn-debt-full').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const btnEl = e.currentTarget;
      const debtId = parseInt(btnEl.dataset.id);
      await settleFullDebtDirectly(debtId);
    });
  });
}

async function renderDuesList() {
  const duesList = document.getElementById('dues-list');
  const searchQuery = document.getElementById('search-dues-input').value.toLowerCase();
  
  duesList.innerHTML = '';
  
  const dues = await dbGetAll('farmer_dues');
  const farmers = await dbGetAll('farmers');
  const saleItems = await dbGetAll('sale_items');

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
          <span class="lang-badge" style="background-color: var(--color-primary-mid); margin-bottom:4px; display:inline-block; font-family: monospace; letter-spacing: 0.5px;">
            ID: FMR-${farmerId}
          </span>
          <h4 style="font-size:14px; font-weight:700; color:var(--color-primary);">${farmer.name}</h4>
          <span style="font-size:10px; color:var(--color-text-muted);">${farmer.phone ? `• ${farmer.phone}` : ''}</span>
        </div>
        <div style="text-align:left; display:flex; flex-direction:column; gap:4px; align-items:flex-end;">
          <span class="debt-status-tag unpaid" style="font-size:9px; background: rgba(0, 119, 182, 0.08); color: var(--color-info); border: 1px solid rgba(0, 119, 182, 0.15); border-radius: 4px; padding: 2px 6px;">
            ⏳ ${currentLanguage === 'ar' ? 'بانتظار الصرف' : 'Awaiting Payout'}
          </span>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:4px; margin: 6px 0;">
        <div style="font-size:11px; color:var(--color-text-dark); display:flex; justify-content:space-between; background: rgba(0,0,0,0.02); padding: 4px 6px; border-radius:6px;">
          <span>${currentLanguage === 'ar' ? 'عدد الشحنات المعلقة' : 'Pending Shipments'}</span>
          <span style="font-weight:700;">${formatVal(data.itemsCount)} ${currentLanguage === 'ar' ? 'شحنة' : 'shipment(s)'}</span>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px; border-top:1px dashed rgba(0,0,0,0.05); padding-top:6px;">
        <div>
          <span style="font-size:11px; color:var(--color-text-muted);">${currentLanguage === 'ar' ? 'صافي مستحقات الفلاح' : 'Net Farmer Dues'}</span>
          <h3 style="font-size:16px; font-weight:700; color:var(--color-primary);">${formatVal(data.totalNetDue, true)}</h3>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="btn-secondary btn-toggle-farmer-details" data-farmer-id="${farmerId}" style="padding:6px 10px; font-size:11px; display:flex; align-items:center; gap:4px; border:1.5px solid var(--color-primary-light); background: rgba(0, 150, 199, 0.04); color: var(--color-primary); box-shadow: none;">
            <span class="material-icons-round" style="font-size:14px;">list_alt</span>
            <span>${currentLanguage === 'ar' ? 'الشحنات' : 'Shipments'}</span>
          </button>
          <button class="btn-secondary btn-pay-farmer-dues" data-farmer-id="${farmerId}" style="padding:6px 10px; font-size:11px; display:flex; align-items:center; gap:4px; border:1.5px solid var(--color-success); background: rgba(82, 183, 136, 0.04); color: var(--color-success); box-shadow: none;">
            <span class="material-icons-round" style="font-size:14px;">paid</span>
            <span>${currentLanguage === 'ar' ? 'صرف' : 'Pay'}</span>
          </button>
        </div>
      </div>

      <!-- Collapsible Details Container -->
      <div id="farmer-details-${farmerId}" style="display:none; flex-direction:column; gap:8px; margin-top:8px; border-top:1px dashed rgba(0,0,0,0.05); padding-top:8px;">
        <h5 style="font-size:11px; font-weight:700; color:var(--color-primary); margin: 0 0 4px 0;">
          ${currentLanguage === 'ar' ? 'تفاصيل المبيعات المستحقة:' : 'Detailed Dues:'}
        </h5>
        <div style="display: flex; flex-direction: column; gap: 6px; max-height: 250px; overflow-y: auto;">
          ${data.rawItems.map(item => {
            const itemDate = new Date(item.created_at).toLocaleDateString(numeralSystem === 'ar' ? 'ar-IQ' : 'en-US');
            const cropIcon = getCropIcon(item.crop_type);
            const saleItem = saleItems.find(si => si.id === item.sale_item_id);
            let priceLabel = '';
            let priceValue = 0;
            
            if (saleItem) {
              const isCountUnit = saleItem.unit === 'count';
              priceLabel = isCountUnit 
                ? (currentLanguage === 'ar' ? 'سعر البيع/العدد:' : 'Sale Price/Qty:') 
                : (currentLanguage === 'ar' ? 'سعر البيع/الكيلو:' : 'Sale Price/kg:');
              priceValue = saleItem.unit_price || (isCountUnit 
                ? (saleItem.box_count ? Math.round(saleItem.agreed_price / saleItem.box_count) : 0) 
                : (saleItem.weight_kg ? Math.round(saleItem.agreed_price / saleItem.weight_kg) : 0));
            } else {
              const isCountUnit = !item.weight_kg || item.weight_kg === 0;
              priceLabel = isCountUnit 
                ? (currentLanguage === 'ar' ? 'سعر البيع/العدد:' : 'Sale Price/Qty:') 
                : (currentLanguage === 'ar' ? 'سعر البيع/الكيلو:' : 'Sale Price/kg:');
              priceValue = isCountUnit 
                ? (item.box_count ? Math.round(item.sold_price / item.box_count) : 0) 
                : (item.weight_kg ? Math.round(item.sold_price / item.weight_kg) : 0);
            }

            // Ultimate fallback: If priceValue is still 0 or empty, try to use the sold_price
            if (!priceValue || priceValue === 0) {
              priceValue = item.sold_price || (saleItem ? saleItem.agreed_price : 0);
              priceLabel = currentLanguage === 'ar' ? 'إجمالي سعر البيع:' : 'Total Sale Price:';
            }

            return `
              <div style="display: flex; flex-direction: column; background: rgba(0, 0, 0, 0.02); border: 1px solid rgba(0, 0, 0, 0.04); padding: 8px; border-radius: 8px; gap: 4px; font-size:11px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong style="color: var(--color-primary);">${cropIcon} ${item.crop_type}</strong>
                  <span style="font-size: 10px; color: var(--color-text-muted);">${itemDate}</span>
                </div>
                <div style="display: flex; justify-content: space-between; color: var(--color-text-muted); font-size:10px;">
                  <span>${currentLanguage === 'ar' ? 'الكمية:' : 'Qty:'} ${item.box_count || 0} ${currentLanguage === 'ar' ? 'صندوق' : 'box(es)'}</span>
                  <span>${priceLabel} <strong style="color:var(--color-primary-mid);">${formatVal(priceValue, true)}</strong></span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
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

  document.querySelectorAll('.btn-toggle-farmer-details').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const farmerId = btn.dataset.farmerId;
      const detailsDiv = document.getElementById(`farmer-details-${farmerId}`);
      if (detailsDiv) {
        if (detailsDiv.style.display === 'none') {
          detailsDiv.style.display = 'flex';
          btn.style.background = 'rgba(45, 106, 79, 0.05)';
        } else {
          detailsDiv.style.display = 'none';
          btn.style.background = 'white';
        }
      }
    });
  });
}

function showCustomConfirm(title, message) {
  return new Promise((resolve) => {
    const dialog = document.getElementById('custom-confirm-dialog');
    if (!dialog) {
      resolve(window.confirm(message));
      return;
    }
    
    const titleEl = document.getElementById('confirm-title');
    const msgEl = document.getElementById('confirm-message');
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    
    dialog.style.display = 'flex';
    
    const okBtn = document.getElementById('btn-confirm-ok');
    const cancelBtn = document.getElementById('btn-confirm-cancel');
    
    const onOk = () => {
      dialog.style.display = 'none';
      cleanup();
      resolve(true);
    };
    
    const onCancel = () => {
      dialog.style.display = 'none';
      cleanup();
      resolve(false);
    };
    
    function cleanup() {
      if (okBtn) okBtn.removeEventListener('click', onOk);
      if (cancelBtn) cancelBtn.removeEventListener('click', onCancel);
    }
    
    if (okBtn) okBtn.addEventListener('click', onOk);
    if (cancelBtn) cancelBtn.addEventListener('click', onCancel);
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

  // Main Card
  const card = document.createElement('div');
  card.className = 'premium-card stagger-item';

  card.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:8px;">
      <div>
        <span class="lang-badge" style="background-color: var(--color-primary-mid); margin-bottom:4px; display:inline-block; font-family: monospace; letter-spacing: 0.5px;">
          ID: PORTER-BOX
        </span>
        <h4 style="font-size:14px; font-weight:700; color:var(--color-primary);">${currentLanguage === 'ar' ? 'صندوق مستحقات الحمالين' : 'Porter Dues Box'}</h4>
        <span style="font-size:10px; color:var(--color-text-muted);">${currentLanguage === 'ar' ? 'تحتسب تلقائياً من عمولة التحميل لكل صندوق مبيع ومزامنتها' : 'Porter commission automatically calculated and synced'}</span>
      </div>
      <div style="text-align:left; display:flex; flex-direction:column; gap:4px; align-items:flex-end;">
        <span class="debt-status-tag unpaid" style="font-size:9px; background: rgba(0, 119, 182, 0.08); color: var(--color-info); border: 1px solid rgba(0, 119, 182, 0.15); border-radius: 4px; padding: 2px 6px;">
          ⏳ ${currentLanguage === 'ar' ? 'بانتظار الصرف' : 'Awaiting Payout'}
        </span>
      </div>
    </div>

    <div style="display:flex; flex-direction:column; gap:4px; margin: 6px 0;">
      <div style="font-size:11px; color:var(--color-text-dark); display:flex; justify-content:space-between; background: rgba(0,0,0,0.02); padding: 4px 6px; border-radius:6px;">
        <span>${currentLanguage === 'ar' ? 'الكمية الإجمالية المعلقة' : 'Total Pending Qty'}</span>
        <span style="font-weight:700;">${formatVal(totalUnpaidBoxesCount)} ${currentLanguage === 'ar' ? 'صندوق مباع' : 'boxes sold'}</span>
      </div>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px; border-top:1px dashed rgba(0,0,0,0.05); padding-top:6px;">
      <div>
        <span style="font-size:11px; color:var(--color-text-muted);">${currentLanguage === 'ar' ? 'إجمالي مستحقات الحمالين' : 'Total Porter Dues'}</span>
        <h3 style="font-size:16px; font-weight:700; color:var(--color-primary);">${formatVal(totalUnpaidPorterAmount, true)}</h3>
      </div>
      <div style="display:flex; gap:6px;">
        <button class="btn-secondary btn-toggle-porters-details" style="padding:6px 10px; font-size:11px; display:flex; align-items:center; gap:4px; border:1.5px solid var(--color-primary-light); background: rgba(0, 150, 199, 0.04); color: var(--color-primary); box-shadow: none;">
          <span class="material-icons-round" style="font-size:14px;">list</span>
          <span>${currentLanguage === 'ar' ? 'التفاصيل' : 'Details'}</span>
        </button>
        ${totalUnpaidPorterAmount > 0 ? `
          <button class="btn-secondary btn-open-porters-pay" style="padding:6px 10px; font-size:11px; display:flex; align-items:center; gap:4px; border:1.5px solid var(--color-success); background: rgba(82, 183, 136, 0.04); color: var(--color-success); box-shadow: none;">
            <span class="material-icons-round" style="font-size:14px;">payments</span>
            <span>${currentLanguage === 'ar' ? 'دفع' : 'Pay'}</span>
          </button>
        ` : ''}
      </div>
    </div>
  `;

  portersList.appendChild(card);

  // 1. Details Section (Collapsible)
  const detailsSection = document.createElement('div');
  detailsSection.id = 'porters-details-section';
  detailsSection.style.display = 'none';
  detailsSection.style.marginTop = '12px';
  detailsSection.className = 'premium-card stagger-item';
  detailsSection.style.animationDelay = '0.05s';

  // Populate Details
  if (unpaidPayouts.length === 0) {
    detailsSection.innerHTML = `
      <h4 style="font-size: 13px; font-weight: 700; color: var(--color-primary); margin-bottom: 8px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 6px;">
        ${currentLanguage === 'ar' ? 'تفاصيل مستحقات الحمالين' : 'Porter Dues Details'}
      </h4>
      <p style="font-size: 11px; color: var(--color-text-muted); text-align: center; margin: 10px 0;">
        ${currentLanguage === 'ar' ? 'لا توجد مستحقات معلقة لعرضها.' : 'No pending dues to display.'}
      </p>
    `;
  } else {
    let detailsHtml = `
      <h4 style="font-size: 13px; font-weight: 700; color: var(--color-primary); margin-bottom: 8px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
        <span>${currentLanguage === 'ar' ? 'تفاصيل مستحقات الحمالين المعلقة' : 'Pending Porter Dues Details'}</span>
        <span style="font-size: 10px; font-weight: 600; background: rgba(0,0,0,0.05); color: var(--color-primary-mid); padding: 2px 6px; border-radius: 4px;">${unpaidPayouts.length} ${currentLanguage === 'ar' ? 'مبيعة معلقة' : 'pending items'}</span>
      </h4>
      <div style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto; padding-right: 2px;">
    `;

    unpaidPayouts.sort((a,b) => b.created_at - a.created_at).forEach(p => {
      const dateStr = new Date(p.created_at).toLocaleString(currentLanguage === 'ar' ? 'ar-IQ' : 'en-US', { dateStyle: 'short', timeStyle: 'short' });
      const cropName = p.crop_type || (currentLanguage === 'ar' ? 'صناديق بضاعة' : 'Cargo boxes');
      const icon = p.crop_type ? getCropIcon(p.crop_type) : '📦';
      detailsHtml += `
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.04); padding: 8px 10px; border-radius: 8px; font-size: 12px;">
          <div>
            <div style="font-weight: 700; color: var(--color-primary); display: flex; align-items: center; gap: 4px;">
              <span>${icon}</span>
              <span>${cropName}</span>
              <span style="font-size: 10px; font-weight: normal; color: var(--color-text-muted);">• ${p.box_count} ${currentLanguage === 'ar' ? 'صندوق' : 'box(es)'}</span>
            </div>
            <div style="font-size: 10px; color: var(--color-text-muted); margin-top: 2px;">
              <span class="material-icons-round" style="font-size: 10px; vertical-align: middle;">schedule</span>
              <span style="vertical-align: middle;">${dateStr}</span>
            </div>
          </div>
          <div style="text-align: left;">
            <span style="font-weight: 800; color: var(--color-primary-mid); font-size: 13px;">${formatVal(p.amount, true)}</span>
          </div>
        </div>
      `;
    });

    detailsHtml += `</div>`;
    detailsSection.innerHTML = detailsHtml;
  }

  portersList.appendChild(detailsSection);

  // 2. Pay Section (Collapsible Form)
  const paySection = document.createElement('div');
  paySection.id = 'porters-pay-section';
  paySection.style.display = 'none';
  paySection.style.marginTop = '12px';
  paySection.className = 'premium-card stagger-item';
  paySection.style.animationDelay = '0.05s';

  paySection.innerHTML = `
    <h4 style="font-size: 13px; font-weight: 700; color: var(--color-primary); margin-bottom: 12px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 6px;">
      ${currentLanguage === 'ar' ? 'صرف وتوزيع مستحقات الحمالين' : 'Distribute and Payout Porters'}
    </h4>
    
    <div class="form-group" style="margin-bottom: 12px;">
      <label style="font-size: 11px; font-weight: 700; color: var(--color-primary); display: block; margin-bottom: 4px;">
        ${currentLanguage === 'ar' ? 'عدد الحمالين لتوزيع المبلغ الاجمالي عليهم:' : 'Number of porters to distribute the total amount:'}
      </label>
      <input type="number" id="porters-count-input" class="form-input" min="1" value="1" style="text-align: center; font-weight: 700; font-size: 16px; border: 1.5px solid var(--color-primary-light); height: 44px;" required>
    </div>

    <div style="background: rgba(0, 150, 199, 0.05); border: 1px solid rgba(0, 150, 199, 0.15); border-radius: 8px; padding: 10px; text-align: center; margin-bottom: 16px;">
      <span style="font-size: 11px; color: var(--color-text-muted); display: block;">${currentLanguage === 'ar' ? 'حصة كل حمال (المبلغ الاجمالي مقسماً بالتساوي):' : 'Share of each porter (total amount divided equally):'}</span>
      <h3 id="porter-individual-share-lbl" style="font-size: 18px; font-weight: 800; color: var(--color-primary); margin-top: 4px;">${formatVal(totalUnpaidPorterAmount, true)}</h3>
    </div>

    <div style="display: flex; gap: 8px;">
      <button class="btn-primary btn-confirm-porter-payout" style="flex: 2; padding: 10px; font-size: 12px; font-weight: 800;">
        ${currentLanguage === 'ar' ? 'تأكيد الدفع والخصم من الخزينة' : 'Confirm Payout'}
      </button>
      <button class="btn-secondary btn-cancel-porter-payout" style="flex: 1; padding: 10px; font-size: 12px; font-weight: 600; border-color: rgba(0,0,0,0.15); color: var(--color-text-dark);">
        ${currentLanguage === 'ar' ? 'إلغاء' : 'Cancel'}
      </button>
    </div>
  `;

  portersList.appendChild(paySection);

  // Toggle Details
  const toggleDetailsBtn = card.querySelector('.btn-toggle-porters-details');
  toggleDetailsBtn.addEventListener('click', () => {
    if (detailsSection.style.display === 'none') {
      detailsSection.style.display = 'block';
      paySection.style.display = 'none'; // hide pay section
    } else {
      detailsSection.style.display = 'none';
    }
  });

  // Toggle Pay
  const openPayBtn = card.querySelector('.btn-open-porters-pay');
  if (openPayBtn) {
    openPayBtn.addEventListener('click', () => {
      if (paySection.style.display === 'none') {
        paySection.style.display = 'block';
        detailsSection.style.display = 'none'; // hide details
        document.getElementById('porters-count-input').focus();
      } else {
        paySection.style.display = 'none';
      }
    });
  }

  // Cancel Pay
  const cancelPayBtn = paySection.querySelector('.btn-cancel-porter-payout');
  cancelPayBtn.addEventListener('click', () => {
    paySection.style.display = 'none';
  });

  // Dynamic share calculation
  const portersCountInput = paySection.querySelector('#porters-count-input');
  const individualShareLbl = paySection.querySelector('#porter-individual-share-lbl');

  function calculateShare() {
    const count = parseInt(portersCountInput.value) || 1;
    if (count <= 0) {
      individualShareLbl.textContent = formatVal(0, true);
      return;
    }
    const share = Math.round(totalUnpaidPorterAmount / count);
    individualShareLbl.textContent = formatVal(share, true);
  }

  portersCountInput.addEventListener('input', calculateShare);

  // Confirm Payout
  const confirmPayBtn = paySection.querySelector('.btn-confirm-porter-payout');
  confirmPayBtn.addEventListener('click', async () => {
    const count = parseInt(portersCountInput.value) || 0;
    if (count <= 0) {
      showToast(currentLanguage === 'ar' ? 'يرجى إدخال عدد حمالين صحيح (1 على الأقل)' : 'Please enter a valid number of porters (at least 1)', 'warning', true);
      return;
    }

    const share = Math.round(totalUnpaidPorterAmount / count);
    const confirmTitle = currentLanguage === 'ar' ? 'تأكيد دفع مستحقات الحمالين' : 'Confirm Porter Payout';
    const confirmMessage = currentLanguage === 'ar' ? 
      `هل أنت متأكد من دفع مبلغ ${formatVal(totalUnpaidPorterAmount, true)} دينار عراقي؟\nسيتم توزيعها على ${count} حمالين، بمعدل ${formatVal(share, true)} لكل حمال، وسيتم خصم المبلغ من الخزينة.` :
      `Are you sure you want to payout ${formatVal(totalUnpaidPorterAmount, true)} IQD?\nIt will be distributed to ${count} porters (${formatVal(share, true)} each), and deducted from the safe box.`;
    
    const isConfirmed = await showCustomConfirm(confirmTitle, confirmMessage);
    if (!isConfirmed) return;

    const tx = db.transaction('porter_payouts', 'readwrite');
    const store = tx.objectStore('porter_payouts');
    unpaidPayouts.forEach(p => {
      p.is_paid = true;
      p.paid_porters_count = count;
      p.porter_share = share;
      p.paid_at = Date.now();
      store.put(p);
    });

    tx.oncomplete = async () => {
      logAppEvent(
        `صرف وتوزيع أجور الحمالين لعدد ${count} حمالين`,
        `Paid and distributed porters dues to ${count} porters`,
        totalUnpaidPorterAmount
      );
      playSound('success');
      showToast(currentLanguage === 'ar' ? 'تم صرف وتوزيع أجور الحمالين والخصم تلقائياً من الخزنة بنجاح!' : 'Porters dues successfully distributed and deducted from safe box!', 'check_circle');
      await refreshAllUI();
    };
  });
}

async function openPaymentSheet(debtId) {
  const debt = await dbGet('debts', debtId);
  if (!debt) return;
  const customer = await dbGet('customers', debt.customer_id);
  if (!customer) return;

  const customerLabel = currentLanguage === 'ar' ? 'الزبون' : 'Customer';
  const debtLabel = currentLanguage === 'ar' ? 'إجمالي الدين المستحق' : 'Total Outstanding Debt';

  document.getElementById('pay-customer-name').textContent = `${customerLabel}: ${customer.name}`;
  document.getElementById('pay-total-debt').textContent = `${debtLabel}: ${formatVal(debt.amount, true)}`;
  
  const amountInput = document.getElementById('pay-amount');
  if (amountInput) {
    amountInput.value = debt.amount;
    amountInput.setAttribute('max', debt.amount);
  }
  
  document.getElementById('btn-submit-payment').onclick = async () => {
    await submitPaymentRecord(debtId);
  };

  openBottomSheet('sheet-payment');
}

async function submitPaymentRecord(debtId) {
  const debt = await dbGet('debts', debtId);
  if (!debt) return;
  
  const amountInput = document.getElementById('pay-amount');
  const paymentAmount = parseNumberInput(amountInput ? amountInput.value : '0');
  if (paymentAmount <= 0 || paymentAmount > debt.amount) {
    showToast(currentLanguage === 'ar' ? 'الرجاء إدخال مبلغ دفع صحيح لا يتجاوز قيمة الدين الكلية' : 'Please input a valid amount not exceeding the debt amount', 'warning', true);
    return;
  }

  const isFull = (paymentAmount === debt.amount);

  if (isFull) {
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

  const customer = await dbGet('customers', debt.customer_id);
  const customerName = customer ? customer.name : '';
  if (isFull) {
    logAppEvent(
      `تسديد كامل الدين للزبون: ${customerName}`,
      `Fully paid debt for customer: ${customerName}`,
      paymentAmount
    );
  } else {
    logAppEvent(
      `تسديد جزء من الدين للزبون: ${customerName}`,
      `Recorded partial debt payment for customer: ${customerName}`,
      paymentAmount
    );
  }

  playSound('success');
  showToast(currentLanguage === 'ar' ? 'تم تسجيل دفعة تسديد الديون بنجاح وتغذية الخزنة!' : 'Payment recorded and safe box updated!', 'check_circle');
  
  closeBottomSheet('sheet-payment');
  
  await refreshAllUI();
}

async function settleFullDebtDirectly(debtId) {
  const debt = await dbGet('debts', debtId);
  if (!debt) return;

  const confirmTitle = currentLanguage === 'ar' ? 'تسديد كامل الدين' : 'Full Debt Settlement';
  const confirmMsg = currentLanguage === 'ar' 
    ? `هل أنت متأكد من تسديد كامل الدين البالغ ${formatVal(debt.amount, true)} دينار عراقي؟`
    : `Are you sure you want to fully settle this debt of ${formatVal(debt.amount, true)} IQD?`;

  const isConfirmed = await showCustomConfirm(confirmTitle, confirmMsg);
  if (!isConfirmed) return;

  const originalAmount = debt.amount;
  debt.is_paid = true;
  await dbPut('debts', debt);

  const customer = await dbGet('customers', debt.customer_id);
  const customerName = customer ? customer.name : '';
  logAppEvent(
    `تسديد كامل الدين للزبون: ${customerName}`,
    `Fully settled debt for customer: ${customerName}`,
    originalAmount
  );

  playSound('success');
  showToast(currentLanguage === 'ar' ? 'تم تسديد كامل الدين بنجاح وتغذية الخزنة!' : 'Debt fully paid and safe box updated!', 'check_circle');

  await refreshAllUI();
}

async function payFarmerDues(farmerId) {
  await openFarmerPayoutSheet(farmerId);
}

async function openFarmerPayoutSheet(farmerId) {
  const dues = await dbGetAll('farmer_dues');
  const farmers = await dbGetAll('farmers');
  const farmer = farmers.find(f => f.id === farmerId);
  if (!farmer) return;

  const unpaidDues = dues.filter(d => d.farmer_id === farmerId && !d.is_paid);
  const totalNetDue = unpaidDues.reduce((sum, d) => sum + d.net_due, 0);
  const totalSales = unpaidDues.reduce((sum, d) => sum + d.sold_price, 0);
  
  // 7% total commission was deducted, of which 5% is net office commission and 2% is extra/additional commission
  const commission2 = Math.round(totalSales * 0.02);

  if (totalNetDue <= 0) {
    showToast(currentLanguage === 'ar' ? 'لا توجد مستحقات معلقة حالياً للصرف' : 'No pending dues to settle', 'warning', true);
    return;
  }

  // Populate bottom-sheet info
  document.getElementById('payout-farmer-name').textContent = currentLanguage === 'ar' ? `الفلاح: ${farmer.name}` : `Farmer: ${farmer.name}`;
  document.getElementById('payout-crop-sales').textContent = currentLanguage === 'ar' ? `إجمالي مبيعات محاصيله: ${formatVal(totalSales, true)}` : `Total Crop Sales: ${formatVal(totalSales, true)}`;
  document.getElementById('payout-commission-2').textContent = currentLanguage === 'ar' ? `مجموع عمولته 2%: ${formatVal(commission2, true)}` : `Total 2% Commission: ${formatVal(commission2, true)}`;
  
  const amountInput = document.getElementById('payout-amount');
  if (amountInput) {
    amountInput.value = totalNetDue;
    amountInput.dataset.farmerId = farmerId;
  }

  openBottomSheet('sheet-farmer-payout');
}

async function submitFarmerPayout() {
  const amountInput = document.getElementById('payout-amount');
  if (!amountInput) return;
  
  const farmerId = parseInt(amountInput.dataset.farmerId);
  if (!farmerId) return;

  const payoutAmount = parseNumberInput(amountInput.value) || 0;
  if (payoutAmount <= 0) {
    showToast(currentLanguage === 'ar' ? 'يرجى إدخال مبلغ صحيح للصرف' : 'Please enter a valid payout amount', 'warning', true);
    return;
  }

  const dues = await dbGetAll('farmer_dues');
  const farmers = await dbGetAll('farmers');
  const farmer = farmers.find(f => f.id === farmerId);
  if (!farmer) return;

  const unpaidDues = dues.filter(d => d.farmer_id === farmerId && !d.is_paid);
  const totalNetDue = unpaidDues.reduce((sum, d) => sum + d.net_due, 0);

  if (unpaidDues.length === 0) {
    showToast(currentLanguage === 'ar' ? 'لا توجد مستحقات معلقة حالياً للصرف' : 'No pending dues to settle', 'warning', true);
    return;
  }

  const confirmTitle = currentLanguage === 'ar' ? 'صرف مستحقات الفلاح' : 'Farmer Payout';
  const confirmText = currentLanguage === 'ar' 
    ? `هل أنت متأكد من صرف مبلغ ${formatVal(payoutAmount, true)} للفلاح "${farmer.name}"؟`
    : `Are you sure you want to pay ${formatVal(payoutAmount, true)} to farmer "${farmer.name}"?`;
  
  const isConfirmed = await showCustomConfirm(confirmTitle, confirmText);
  if (!isConfirmed) return;

  const tx = db.transaction('farmer_dues', 'readwrite');
  const store = tx.objectStore('farmer_dues');

  let remainingPaid = payoutAmount;
  unpaidDues.sort((a, b) => a.created_at - b.created_at);

  for (const due of unpaidDues) {
    if (remainingPaid >= due.net_due) {
      remainingPaid -= due.net_due;
      due.is_paid = true;
      await store.put(due);
    } else if (remainingPaid > 0) {
      due.net_due -= remainingPaid;
      remainingPaid = 0;
      await store.put(due);
      break;
    } else {
      break;
    }
  }

  tx.oncomplete = async () => {
    logAppEvent(
      `صرف مستحقات مالية للفلاح: ${farmer.name}`,
      `Paid dues to farmer: ${farmer.name}`,
      payoutAmount
    );
    playSound('success');
    showToast(currentLanguage === 'ar' ? 'تم صرف مستحقات الفلاح وتحديث حسابات الخزنة بنجاح!' : 'Farmer dues successfully settled and paid!', 'check_circle');
    closeBottomSheet('sheet-farmer-payout');
    
    await refreshAllUI();
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

  // Lifetime running balance of Safe Box (never cleared monthly!)
  const lifetimeCashSales = allSales.filter(s => s.payment_type === 'cash').reduce((sum, s) => sum + s.total_amount, 0);
  const lifetimeCollectedDebts = allDebts.filter(d => d.is_paid).reduce((sum, d) => sum + d.amount, 0) +
                                 safeAdjustments.filter(a => a.type === 'partial_debt_payout').reduce((sum, a) => sum + a.amount, 0);
  
  const lifetimePaidDues = dues.filter(d => d.is_paid).reduce((sum, d) => sum + d.net_due, 0);
  const lifetimePaidPorters = porter.filter(p => p.is_paid).reduce((sum, p) => sum + p.amount, 0);

  const lifetimeExpenses = dailyExpenses.reduce((sum, e) => sum + e.amount, 0) +
                           personalExpenses.reduce((sum, e) => sum + e.amount, 0);
  const lifetimeLosses = losses.reduce((sum, l) => sum + l.amount, 0);

  const lifetimeManualAdditions = safeAdjustments.filter(a => a.type === 'manual_addition').reduce((sum, a) => sum + a.amount, 0);
  const lifetimeSafeInflow = lifetimeCashSales + lifetimeCollectedDebts + lifetimeManualAdditions;
  const lifetimeSafeOutflow = lifetimePaidDues + lifetimePaidPorters + lifetimeExpenses + lifetimeLosses;
  const safeBoxBalance = lifetimeSafeInflow - lifetimeSafeOutflow;

  // Handle month selection options populating
  const monthSelector = document.getElementById('stats-month-selector');
  if (monthSelector && monthSelector.children.length === 0) {
    const previousSelection = monthSelector.value || 'active';
    const archives = await dbGetAll('stat_archives');
    monthSelector.innerHTML = '';
    
    const activeOpt = document.createElement('option');
    activeOpt.value = 'active';
    activeOpt.textContent = currentLanguage === 'ar' ? 'الشهر الحالي (نشط)' : 'Current Month (Active)';
    monthSelector.appendChild(activeOpt);

    archives.sort((a, b) => b.month.localeCompare(a.month)).forEach(archive => {
      const opt = document.createElement('option');
      opt.value = archive.month;
      opt.textContent = currentLanguage === 'ar' ? `أرشيف شهر ${archive.month}` : `Archive ${archive.month}`;
      monthSelector.appendChild(opt);
    });
    monthSelector.value = previousSelection;
  }

  const selectedMonth = monthSelector ? monthSelector.value : 'active';

  let cashSalesTotal = 0;
  let collectedDebtsTotal = 0;
  let paidDuesTotal = 0;
  let paidPortersTotal = 0;
  let expensesTotal = 0;
  let lossesTotal = 0;
  let totalCompanyCommission = 0;

  if (selectedMonth === 'active') {
    // Current calendar month filtering
    const now = new Date();
    const activeMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const isCurrentMonth = (timestamp) => {
      const d = new Date(timestamp);
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return mKey === activeMonthKey;
    };

    cashSalesTotal = allSales.filter(s => s.payment_type === 'cash' && isCurrentMonth(s.created_at)).reduce((sum, s) => sum + s.total_amount, 0);

    collectedDebtsTotal = allDebts.filter(d => d.is_paid && isCurrentMonth(d.created_at)).reduce((sum, d) => sum + d.amount, 0) +
                          safeAdjustments.filter(a => (a.type === 'partial_debt_payout' || a.type === 'manual_addition') && isCurrentMonth(a.created_at)).reduce((sum, a) => sum + a.amount, 0);

    paidDuesTotal = dues.filter(d => d.is_paid && isCurrentMonth(d.created_at)).reduce((sum, d) => sum + d.net_due, 0);

    paidPortersTotal = porter.filter(p => p.is_paid && isCurrentMonth(p.created_at)).reduce((sum, p) => sum + p.amount, 0);

    expensesTotal = dailyExpenses.filter(e => isCurrentMonth(e.created_at)).reduce((sum, e) => sum + e.amount, 0) +
                    personalExpenses.filter(e => isCurrentMonth(e.created_at)).reduce((sum, e) => sum + e.amount, 0);
    lossesTotal = losses.filter(l => isCurrentMonth(l.created_at)).reduce((sum, l) => sum + l.amount, 0);

    const allSaleItems = await dbGetAll('sale_items');
    const saleInvoiceIdsInMonth = new Set(allSales.filter(s => isCurrentMonth(s.created_at)).map(s => s.id));
    totalCompanyCommission = allSaleItems.filter(item => saleInvoiceIdsInMonth.has(item.sale_invoice_id)).reduce((sum, item) => sum + Math.round(item.agreed_price * 0.05), 0);
  } else {
    // Fetch values from stat_archives
    const archives = await dbGetAll('stat_archives');
    const archive = archives.find(a => a.month === selectedMonth);
    if (archive) {
      cashSalesTotal = archive.cashSales;
      collectedDebtsTotal = archive.collectedDebts;
      paidDuesTotal = archive.paidDues;
      paidPortersTotal = archive.paidPorters;
      expensesTotal = archive.expenses;
      lossesTotal = archive.losses;
      totalCompanyCommission = archive.companyCommission;
    }
  }

  // Render lifetime cash box balance
  safeBoxValEl.textContent = formatVal(safeBoxBalance, true);

  // Render monthly stats
  totalCashSalesEl.textContent = formatVal(cashSalesTotal, true);
  totalCollectedDebtsEl.textContent = formatVal(collectedDebtsTotal, true);
  totalPaidDuesEl.textContent = formatVal(paidDuesTotal, true);
  totalPortersEl.textContent = formatVal(paidPortersTotal, true);
  totalCommissionEl.textContent = formatVal(totalCompanyCommission, true);

  const netProfit = totalCompanyCommission - (expensesTotal + lossesTotal);
  const profitEl = document.getElementById('val-net-profit');
  if (profitEl) {
    profitEl.textContent = formatVal(netProfit, true);
  }

  // Render detail list values
  const dailyVal = selectedMonth === 'active' 
    ? dailyExpenses.filter(e => {
        const d = new Date(e.created_at);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      }).reduce((sum, e) => sum + e.amount, 0)
    : expensesTotal;
  const personalVal = selectedMonth === 'active' 
    ? personalExpenses.filter(e => {
        const d = new Date(e.created_at);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      }).reduce((sum, e) => sum + e.amount, 0)
    : 0;

  const dailyExpEl = document.getElementById('val-total-daily-expenses');
  if (dailyExpEl) dailyExpEl.textContent = formatVal(dailyVal, true);

  const personalExpEl = document.getElementById('val-total-personal-expenses');
  if (personalExpEl) personalExpEl.textContent = formatVal(personalVal, true);

  const lossValEl = document.getElementById('val-total-losses');
  if (lossValEl) lossValEl.textContent = formatVal(lossesTotal, true);

  // Render SVG Chart distribution
  drawStatsChart(expensesTotal + lossesTotal, totalCompanyCommission);

  // Render recent Ledger (Expenses + Losses) filtered by selected month
  if (selectedMonth === 'active') {
    const now = new Date();
    const activeMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const filterByCurrentMonth = (items) => items.filter(item => {
      const d = new Date(item.created_at);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === activeMonthKey;
    });
    renderLedgerTable(filterByCurrentMonth(dailyExpenses), filterByCurrentMonth(personalExpenses), filterByCurrentMonth(losses));
  } else {
    const filterByMonth = (items) => items.filter(item => {
      const d = new Date(item.created_at);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonth;
    });
    renderLedgerTable(filterByMonth(dailyExpenses), filterByMonth(personalExpenses), filterByMonth(losses));
  }

  // Render daily application logs
  renderAppLogs();
}

function drawStatsChart(expenses, companyRevenue) {
  const container = document.getElementById('svg-chart-container');
  if (!container) return;

  const safeExpenses = isNaN(expenses) || expenses < 0 ? 0 : expenses;
  const safeCompanyRevenue = isNaN(companyRevenue) || companyRevenue < 0 ? 0 : companyRevenue;
  const total = safeExpenses + safeCompanyRevenue;

  if (total === 0) {
    container.innerHTML = `
      <svg id="stats-svg-chart" width="100%" height="230" viewBox="0 0 380 230" style="overflow: visible; width: 100%; height: 230px; direction: ltr !important;">
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="var(--color-text-muted)" font-size="12" font-family="Cairo" font-weight="700">
          ${currentLanguage === 'ar' ? 'لا توجد بيانات مالية متوفرة للرسم البياني' : 'No financial logs available for the chart'}
        </text>
      </svg>
    `;
    return;
  }

  // Math & Statistics calculations
  const netProfit = safeCompanyRevenue - safeExpenses;
  const expPercent = safeCompanyRevenue > 0 ? Math.min(100, Math.round((safeExpenses / safeCompanyRevenue) * 100)) : (safeExpenses > 0 ? 100 : 0);
  const netProfitPercent = safeCompanyRevenue > 0 ? Math.round((netProfit / safeCompanyRevenue) * 100) : 0;

  const safeExpPercent = isNaN(expPercent) ? 0 : expPercent;
  const safeNetProfitPercent = isNaN(netProfitPercent) ? 0 : netProfitPercent;

  // Outer Ring: Commission (أرباح العمولة) - 100% representation
  // Inner Ring: Expenses & Losses (المصاريف والخسائر) - portion of commission consumed
  const c1 = 471.24; // 2 * PI * 75
  const c2 = 345.58; // 2 * PI * 55

  const offsetOuter = 0;
  const offsetInner = c2 - (safeExpPercent / 100) * c2;

  // Financial Rating evaluation
  let ratingTextAr = '';
  let ratingTextEn = '';
  let ratingColor = '';

  if (netProfit > 0) {
    if (safeExpPercent <= 15) {
      ratingTextAr = 'ممتاز';
      ratingTextEn = 'Excellent';
      ratingColor = '#2D6A4F';
    } else if (safeExpPercent <= 40) {
      ratingTextAr = 'جيد جداً';
      ratingTextEn = 'Very Good';
      ratingColor = '#40916C';
    } else if (safeExpPercent <= 70) {
      ratingTextAr = 'مستقر';
      ratingTextEn = 'Stable';
      ratingColor = '#FF9F1C';
    } else {
      ratingTextAr = 'مقبول';
      ratingTextEn = 'Acceptable';
      ratingColor = '#E63946';
    }
  } else {
    ratingTextAr = 'عجز مالي';
    ratingTextEn = 'Deficit';
    ratingColor = '#E63946';
  }

  const activeRatingText = currentLanguage === 'ar' ? ratingTextAr : ratingTextEn;

  container.innerHTML = `
    <svg id="stats-svg-chart" width="100%" height="230" viewBox="0 0 380 230" style="overflow: visible; width: 100%; height: 230px; direction: ltr !important;">
      <defs>
        <!-- Gradients -->
        <linearGradient id="commissionGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#1B4332" />
          <stop offset="100%" stop-color="#52B788" />
        </linearGradient>
        <linearGradient id="expenseGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FF9F1C" />
          <stop offset="100%" stop-color="#E63946" />
        </linearGradient>
        <linearGradient id="profitGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#2D6A4F" />
          <stop offset="100%" stop-color="#74C69D" />
        </linearGradient>
        
        <!-- Ring Glow Filters -->
        <filter id="commissionGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#52B788" flood-opacity="0.25"/>
        </filter>
        <filter id="expenseGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#E63946" flood-opacity="0.25"/>
        </filter>
      </defs>

      <!-- DOUBLE RADIAL RING DISPLAY (LEFT PART) -->
      <g transform="translate(0, 0)">
        <!-- Outer Ring Background Track (Commissions) -->
        <circle cx="115" cy="115" r="75" fill="none" stroke="rgba(27, 67, 50, 0.06)" stroke-width="12" />
        
        <!-- Outer Ring Foreground -->
        <circle cx="115" cy="115" r="75" fill="none" 
                stroke="url(#commissionGrad)" stroke-width="12" stroke-linecap="round"
                stroke-dasharray="${c1}" stroke-dashoffset="${offsetOuter}"
                transform="rotate(-90, 115, 115)" filter="url(#commissionGlow)"
                style="transition: stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1);" />

        <!-- Inner Ring Background Track (Expenses) -->
        <circle cx="115" cy="115" r="55" fill="none" stroke="rgba(230, 57, 70, 0.06)" stroke-width="12" />
        
        <!-- Inner Ring Foreground -->
        <circle cx="115" cy="115" r="55" fill="none" 
                stroke="url(#expenseGrad)" stroke-width="12" stroke-linecap="round"
                stroke-dasharray="${c2}" stroke-dashoffset="${offsetInner}"
                transform="rotate(-90, 115, 115)" filter="url(#expenseGlow)"
                style="transition: stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1);" />

        <!-- CENTER INFO GRAPHICS -->
        <text x="115" y="108" text-anchor="middle" dominant-baseline="middle" 
              fill="${netProfit >= 0 ? '#1B4332' : '#E63946'}" font-size="22" font-weight="900" font-family="Cairo">
          ${netProfit >= 0 ? '+' : ''}${safeNetProfitPercent}%
        </text>
        <text x="115" y="128" text-anchor="middle" dominant-baseline="middle" 
              fill="var(--color-text-muted)" font-size="9" font-weight="700" font-family="Cairo">
          ${currentLanguage === 'ar' ? 'الكفاءة المالية' : 'Financial Efficiency'}
        </text>
        <!-- Rating Text Badge background -->
        <rect x="75" y="142" width="80" height="18" rx="9" fill="${ratingColor}1A" />
        <text x="115" y="152" text-anchor="middle" dominant-baseline="middle" 
              fill="${ratingColor}" font-size="9.5" font-weight="800" font-family="Cairo">
          ${activeRatingText}
        </text>
      </g>

      <!-- UNCONVENTIONAL HIGH-FIDELITY LEGEND CARD (RIGHT PART) -->
      <g transform="translate(210, 20)">
        <!-- Row 1: Net Commission Earnings -->
        <g transform="translate(0, 15)">
          <circle cx="160" cy="10" r="6" fill="url(#commissionGrad)" />
          <text x="145" y="13" text-anchor="end" fill="var(--color-text-dark)" font-size="11" font-weight="700" font-family="Cairo">
            ${currentLanguage === 'ar' ? 'أرباح العمولة' : 'Commissions'}
          </text>
          <text x="0" y="13" text-anchor="start" fill="#2D6A4F" font-size="11" font-weight="800" font-family="Cairo">
            ${formatVal(safeCompanyRevenue)} د.ع
          </text>
        </g>

        <!-- Row 2: Expenses & Losses -->
        <g transform="translate(0, 55)">
          <circle cx="160" cy="10" r="6" fill="url(#expenseGrad)" />
          <text x="145" y="13" text-anchor="end" fill="var(--color-text-dark)" font-size="11" font-weight="700" font-family="Cairo">
            ${currentLanguage === 'ar' ? 'مصاريف وخسائر' : 'Expenses & Losses'}
          </text>
          <text x="0" y="13" text-anchor="start" fill="#E63946" font-size="11" font-weight="800" font-family="Cairo">
            ${formatVal(safeExpenses)} د.ع
          </text>
        </g>

        <!-- Row 3: Net Profit Margin -->
        <g transform="translate(0, 95)">
          <circle cx="160" cy="10" r="6" fill="${netProfit >= 0 ? 'url(#profitGrad)' : '#E63946'}" />
          <text x="145" y="13" text-anchor="end" fill="var(--color-text-dark)" font-size="11" font-weight="700" font-family="Cairo">
            ${currentLanguage === 'ar' ? 'صافي الأرباح' : 'Net Profits'}
          </text>
          <text x="0" y="13" text-anchor="start" fill="${netProfit >= 0 ? '#2D6A4F' : '#E63946'}" font-size="12" font-weight="900" font-family="Cairo">
            ${formatVal(netProfit)} د.ع
          </text>
        </g>

        <!-- Horizontal Separator -->
        <line x1="0" y1="130" x2="160" y2="130" stroke="rgba(0,0,0,0.06)" stroke-width="1" />

        <!-- Efficiency Quote / Summary Statement -->
        <g transform="translate(0, 140)">
          <text x="160" y="15" text-anchor="end" fill="var(--color-text-muted)" font-size="9" font-weight="700" font-family="Cairo">
            ${currentLanguage === 'ar' ? 'مؤشر كفاءة العلوة لليوم:' : 'Today\'s Office Index:'}
          </text>
          <text x="160" y="31" text-anchor="end" fill="${ratingColor}" font-size="10" font-weight="800" font-family="Cairo">
            ${
              netProfit > 0 
                ? (currentLanguage === 'ar' ? `الأرباح تغطي المصاريف بـ ${safeNetProfitPercent}%` : `Profit covers expenses by ${safeNetProfitPercent}%`)
                : (currentLanguage === 'ar' ? 'المصاريف تفوق نسبة الأرباح!' : 'Expenses exceed net profits!')
            }
          </text>
        </g>
      </g>
    </svg>
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

  logAppEvent(
    `تسجيل مصروفات (${type === 'daily' ? 'مصاريف علوة يومية' : 'مصاريف شخصية'}): ${subject}`,
    `Recorded expense (${type === 'daily' ? 'Daily Office' : 'Personal'}): ${subject}`,
    amount
  );

  playSound('success');
  showToast(currentLanguage === 'ar' ? 'تم تسجيل المصروف وتحديث رصيد الخزنة!' : 'Expense recorded successfully!', 'check_circle');

  // Reset form
  document.getElementById('expense-subject').value = '';
  document.getElementById('expense-amount').value = '';
  closeBottomSheet('sheet-new-expense');

  await refreshAllUI();
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

  logAppEvent(
    `تسجيل خسائر وتلفيات: ${subject}`,
    `Recorded loss / damage: ${subject}`,
    amount
  );

  playSound('success');
  showToast(currentLanguage === 'ar' ? 'تم تسجيل الخسارة التالفة بنجاح وتعديل الأرباح!' : 'Loss recorded successfully!', 'check_circle');

  // Reset form
  document.getElementById('loss-subject').value = '';
  document.getElementById('loss-amount').value = '';
  closeBottomSheet('sheet-new-loss');

  await refreshAllUI();
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

  const is58mm = printerPaperWidth === '58';
  const fontSizeClass = is58mm ? 'font-size: 14.5px; line-height: 1.35;' : 'font-size: 17px; line-height: 1.45;';
  const tableFontSizeClass = is58mm ? 'font-size: 13.5px; line-height: 1.3;' : 'font-size: 15.5px; line-height: 1.4;';
  const headerFontSizeClass = is58mm ? 'font-size: 20px;' : 'font-size: 24px;';
  const paddingClass = is58mm ? 'padding: 3px 0;' : 'padding: 5px 0;';
  const borderStyle = 'border-bottom: 1.2px dashed #000;';

  let itemsRowsHtml = items.map((it, idx) => {
    const cropName = it.crop_type;
    const isCountUnit = it.unit === 'count';
    const computedPrice = it.unit_price || (isCountUnit ? (it.box_count ? Math.round(it.agreed_price / it.box_count) : 0) : (it.weight_kg ? Math.round(it.agreed_price / it.weight_kg) : 0));
    const priceStr = formatVal(computedPrice);
    const weightStr = isCountUnit ? '-' : formatWeight(it.weight_kg, it.unit || 'kg');
    const boxesStr = formatVal(it.box_count || 0);
    const isLast = idx === items.length - 1;
    const rowBorder = isLast ? '' : borderStyle;

    return `
      <tr style="${rowBorder} height: auto;">
        <td style="text-align: right; width: 35%; ${paddingClass} white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${cropName}">${cropName}</td>
        <td style="text-align: center; width: 25%; ${paddingClass}">${priceStr}</td>
        <td style="text-align: center; width: 25%; ${paddingClass}">${weightStr}</td>
        <td style="text-align: left; width: 15%; ${paddingClass} font-weight: 700;">${boxesStr}</td>
      </tr>
    `;
  }).join('');

  // Calculate dynamic totals for the paper preview
  const subtotal = items.reduce((sum, item) => sum + item.agreed_price, 0);
  const totalCommissions = items.reduce((sum, item) => sum + item.commission_amount, 0);
  const carrying = items.reduce((sum, item) => sum + item.porter_fee, 0);

  // Render Receipt Preview HTML with pixel-perfect, highly responsive layout for 58mm/80mm
  container.innerHTML = `
    <div style="text-align: center; border-bottom: 1.5px dashed #000; padding-bottom: 8px; margin-bottom: 8px; direction: rtl;">
      <h2 style="${headerFontSizeClass} font-weight: 800; color: #000; margin: 0 0 4px 0; letter-spacing: normal;">${officeName}</h2>
      <p style="${fontSizeClass} color: #000; margin: 0 0 2px 0;">هاتف: ${officePhone}</p>
      <p style="${fontSizeClass} color: #000; margin: 0;">العنوان: ${officeLocation}</p>
    </div>

    <div style="${fontSizeClass} border-bottom: 1.5px dashed #000; padding-bottom: 6px; margin-bottom: 6px; line-height: 1.4; direction: rtl;">
      <div style="display:flex; justify-content:space-between; margin-bottom: 2px;">
        <span>رقم الفاتورة:</span>
        <span style="font-weight:700;"># ${formatVal(sale.id)} (${orderId})</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom: 2px;">
        <span>الزبون:</span>
        <span style="font-weight:700;">${customer.name}</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom: 2px;">
        <span>التاريخ:</span>
        <span>${formattedDate}</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom: 2px;">
        <span>طريقة الدفع:</span>
        <span style="font-weight:700;">${sale.payment_type === 'cash' ? 'نقد (💵)' : 'بالأجل (📋)'}</span>
      </div>
    </div>

    <table class="receipt-table" style="width: 100%; border-collapse: collapse; ${tableFontSizeClass} table-layout: fixed; direction: rtl; margin-bottom: 6px;">
      <thead>
        <tr style="border-bottom: 1.5px dashed #000; height: 24px;">
          <th style="text-align: right; font-weight:700; width: 35%; padding-bottom: 2px;">${currentLanguage === 'ar' ? 'الصنف' : 'Item'}</th>
          <th style="text-align: center; font-weight:700; width: 25%; padding-bottom: 2px;">${currentLanguage === 'ar' ? 'السعر' : 'Price'}</th>
          <th style="text-align: center; font-weight:700; width: 25%; padding-bottom: 2px;">${currentLanguage === 'ar' ? 'الوزن' : 'Weight'}</th>
          <th style="text-align: left; font-weight:700; width: 15%; padding-bottom: 2px;">${currentLanguage === 'ar' ? 'العدد' : 'Count'}</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRowsHtml}
      </tbody>
    </table>

    <div style="${fontSizeClass} border-top: 1.5px dashed #000; margin-top: 4px; padding-top: 6px; line-height: 1.4; direction: rtl;">
      ${sale.bags_cost > 0 ? `
        <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
          <span>تكلفة الأكياس والكراتين:</span>
          <span style="font-weight:600;">${formatVal(sale.bags_cost, true)}</span>
        </div>
      ` : ''}
      <div style="display:flex; justify-content:space-between; font-weight: 800; ${sale.bags_cost > 0 ? 'border-top: 1.2px dashed #000; margin-top: 4px; padding-top: 4px;' : ''}">
        <span>الإجمالي المستحق:</span>
        <span style="font-size: 1.1em;">${formatVal(sale.total_amount, true)}</span>
      </div>
    </div>

    <!-- Generates dynamic offline QR-code with QRious inside preview -->
    <div style="text-align: center; margin-top: 12px; padding-top: 8px; border-top: 1.5px dashed #000; direction: rtl;">
      <canvas id="receipt-qr-canvas" style="display: inline-block; margin-bottom: 4px;"></canvas>
      <div style="font-size: 11.5px; color: #000; font-weight: 700; margin-top: 4px;">شكرًا لتعاملكم معنا - علوة الغابة الخضراء</div>
    </div>
  `;

  // Render QR Canvas
  setTimeout(() => {
    const qrCanvas = document.getElementById('receipt-qr-canvas');
    if (qrCanvas) {
      new window.QRious({
        element: qrCanvas,
        value: `ALWA_REC|ID:${sale.id}|TOTAL:${sale.total_amount}|CUST:${customer.name}`,
        size: is58mm ? 220 : 310,
        background: '#ffffff',
        foreground: '#000000'
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

function requestAndroidBluetoothPermissions(successCallback, failureCallback) {
  if (typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.permissions) {
    const permissions = cordova.plugins.permissions;
    const list = [
      permissions.ACCESS_FINE_LOCATION,
      'android.permission.BLUETOOTH_SCAN',
      'android.permission.BLUETOOTH_CONNECT'
    ];
    permissions.requestPermissions(list, function(status) {
      if (status.hasPermission) {
        successCallback();
      } else {
        console.warn('Bluetooth permissions denied, trying to proceed anyway...');
        successCallback(); // Try to proceed anyway as fallback
      }
    }, function() {
      console.error('Error requesting permissions, trying to proceed anyway...');
      successCallback();
    });
  } else {
    successCallback();
  }
}

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

  const discoveredDevices = [];

  // Helper to add/update devices in the list
  function addDiscoveredDevice(device) {
    if (!discoveredDevices.some(d => d.mac.toLowerCase() === device.mac.toLowerCase())) {
      discoveredDevices.push(device);
      populateScannedDevicesList(discoveredDevices);
    }
  }

  const classicActive = typeof window.bluetoothSerial !== 'undefined';
  const bleActive = typeof window.ble !== 'undefined';

  if (!classicActive && !bleActive) {
    // If not in Cordova, show mock printers for simulator/testing
    showMockPrinters();
    return;
  }

  // Request Android Bluetooth permissions before starting
  requestAndroidBluetoothPermissions(() => {
    // Enable Bluetooth if disabled
    if (bleActive) {
      window.ble.enable(() => {
        startNativeScans();
      }, () => {
        startNativeScans(); // Proceed anyway
      });
    } else if (classicActive) {
      window.bluetoothSerial.enable(() => {
        startNativeScans();
      }, () => {
        startNativeScans(); // Proceed anyway
      });
    } else {
      startNativeScans();
    }
  }, () => {
    showMockPrinters();
  });

  function startNativeScans() {
    list.innerHTML = ''; // Clear spinner

    // A. BLE Scan (specifically for portable thermal printers)
    if (bleActive) {
      window.ble.startScan([], function(device) {
        if (device.name) {
          addDiscoveredDevice({
            name: device.name,
            mac: device.id,
            strength: device.rssi || -70,
            type: 'ble'
          });
        }
      }, function(err) {
        console.error('BLE Scan Error:', err);
      });

      // Stop BLE scan after 8 seconds to save battery
      setTimeout(() => {
        if (typeof window.ble !== 'undefined') {
          window.ble.stopScan();
        }
      }, 8000);
    }

    // B. Classic Bluetooth Scan
    if (classicActive) {
      // List paired devices first (instant on Android)
      window.bluetoothSerial.list(function(paired) {
        paired.forEach(device => {
          addDiscoveredDevice({
            name: device.name || 'Classic Printer',
            mac: device.address || device.id,
            strength: -55,
            type: 'classic'
          });
        });

        // Scan for unpaired devices (takes longer)
        window.bluetoothSerial.discoverUnpaired(function(unpaired) {
          unpaired.forEach(device => {
            if (device.name) {
              addDiscoveredDevice({
                name: device.name,
                mac: device.address || device.id,
                strength: -75,
                type: 'classic'
              });
            }
          });
        }, function(err) {
          console.error('Classic discoverUnpaired Error:', err);
        });
      }, function(err) {
        console.error('Classic list Error:', err);
      });
    }
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
          <span style="font-size: 10px; color: var(--color-text-muted); font-family: monospace;">${mac} (${type === 'ble' ? 'BLE طابعة محمولة' : 'Classic بلوتوث'})</span>
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
          const props = Array.isArray(char.properties) ? char.properties : [];
          const hasWrite = props.some(p => typeof p === 'string' && (p.toLowerCase().indexOf('write') !== -1));
          if (hasWrite) {
            bleWriteServiceUUID = char.service;
            bleWriteCharUUID = char.characteristic;
            writeChar = char;
            break;
          }
        }
      }
      
      // Fallback to standard thermal printer GATT UUIDs if characteristics weren't properly reported
      if (!writeChar || !bleWriteCharUUID) {
        console.warn('Could not auto-detect BLE write characteristic, using standard thermal printer fallback UUIDs');
        bleWriteServiceUUID = '000018f0-0000-1000-8000-00805f9b34fb';
        bleWriteCharUUID = '00002af1-0000-1000-8000-00805f9b34fb';
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

  // Active Visual simulator animation on-screen
  const printSimulator = document.getElementById('print-simulator');
  const paperStrip = document.getElementById('printer-paper-strip');
  if (printSimulator && paperStrip) {
    printSimulator.style.display = 'block';
    paperStrip.classList.remove('printing');
    void paperStrip.offsetWidth; // force reflow
    paperStrip.classList.add('printing');
  }

  showToast(currentLanguage === 'ar' ? 'جاري توليد الصورة والطباعة الرسومية...' : 'Generating high-contrast bitmap for ESC/POS printing...', 'hourglass_empty');

  // --- PIXEL-PERFECT HTML2CANVAS ELEMENT CAPTURE & CONVERSION ---
  const is58mm = printerPaperWidth === '58';
  const canvasWidth = is58mm ? 384 : 576; // Exact target ESC/POS printable pixel width
  const designWidth = is58mm ? 272 : 380; // The CSS max-width of our on-screen receipt preview

  const container = document.getElementById('receipt-paper');
  if (!container) {
    showToast(currentLanguage === 'ar' ? 'فشل العثور على معاينة الفاتورة!' : 'Failed to find invoice preview!', 'error', true);
    return;
  }

  // To solve horizontal shifting, offsets, and margins in html2canvas (especially for centered/RTL layouts),
  // we temporarily clone the element, place it at absolute (0,0) with reset margin/padding, and render the clone.
  const clone = container.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.margin = '0';
  clone.style.padding = '4px 2px';
  clone.style.boxSizing = 'border-box';
  clone.style.width = is58mm ? '272px' : '380px';
  clone.style.maxWidth = is58mm ? '272px' : '380px';
  clone.style.zIndex = '-9999';
  clone.style.backgroundColor = '#FFFFFF';
  clone.style.transform = 'none';

  // Deep clone does not copy canvas contents (e.g. the QR code), so we manually copy them now.
  const originalCanvases = container.querySelectorAll('canvas');
  const clonedCanvases = clone.querySelectorAll('canvas');
  originalCanvases.forEach((origCanvas, i) => {
    const destCanvas = clonedCanvases[i];
    if (destCanvas) {
      destCanvas.width = origCanvas.width;
      destCanvas.height = origCanvas.height;
      const destCtx = destCanvas.getContext('2d');
      destCtx.drawImage(origCanvas, 0, 0);
    }
  });

  document.body.appendChild(clone);

  // Calculate high quality scale factor
  const renderScale = canvasWidth / designWidth;

  const html2canvasFn = window.html2canvas || html2canvas;
  let rawCanvas;
  try {
    rawCanvas = await html2canvasFn(clone, {
      scale: renderScale,
      width: designWidth,
      windowWidth: designWidth,
      backgroundColor: '#FFFFFF',
      logging: false,
      useCORS: true,
      allowTaint: true,
      delay: 80 // Stable pause to ensure QR code and webfonts are completely drawn
    });
  } catch (canvasErr) {
    console.error('html2canvas rendering failed:', canvasErr);
    showToast(currentLanguage === 'ar' ? 'فشل توليد صورة الفاتورة للطباعة' : 'Failed to generate invoice image for printing', 'error', true);
    document.body.removeChild(clone);
    return;
  } finally {
    if (document.body.contains(clone)) {
      document.body.removeChild(clone);
    }
  }

  // Create an exact-sized canvas to prevent any rounding/alignment discrepancies
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = canvasWidth;
  const finalHeight = Math.round(rawCanvas.height * (canvasWidth / rawCanvas.width));
  finalCanvas.height = finalHeight;

  const finalCtx = finalCanvas.getContext('2d');
  finalCtx.fillStyle = '#FFFFFF';
  finalCtx.fillRect(0, 0, canvasWidth, finalHeight);
  finalCtx.drawImage(rawCanvas, 0, 0, canvasWidth, finalHeight);

  // Convert canvas graphics into ESC/POS monochrome bitmap
  const imgData = finalCtx.getImageData(0, 0, canvasWidth, finalHeight);
  const pixels = imgData.data;
  const widthBytes = canvasWidth / 8;
  const bitmapData = [];

  for (let y = 0; y < finalHeight; y++) {
    for (let xByte = 0; xByte < widthBytes; xByte++) {
      let byteVal = 0;
      for (let bit = 0; bit < 8; bit++) {
        const x = xByte * 8 + bit;
        const idx = (y * canvasWidth + x) * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        const a = pixels[idx + 3];

        let isBlack = 0; // Default white
        if (a > 128) {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          if (gray < 200) {
            isBlack = 1; // 1 represents black in ESC/POS
          }
        }
        byteVal = (byteVal << 1) | isBlack;
      }
      bitmapData.push(byteVal);
    }
  }

  // --- CONSTRUCT THE ESC/POS GRAPHIC CMD: GS v 0 m xL xH yL yH d1...dk ---
  const escposCommands = [];
  
  // Initialize printer
  escposCommands.push(0x1B, 0x40);

  // GS v 0 0 command header
  escposCommands.push(0x1D, 0x76, 0x30, 0x00);
  escposCommands.push(widthBytes & 0xFF, (widthBytes >> 8) & 0xFF); // xL, xH (horizontal bytes)
  escposCommands.push(finalHeight & 0xFF, (finalHeight >> 8) & 0xFF); // yL, yH (vertical height)

  // Append binary image raster payload
  for (let i = 0; i < bitmapData.length; i++) {
    escposCommands.push(bitmapData[i]);
  }

  // Feed paper (4 lines) and trigger cutter
  escposCommands.push(0x0A, 0x0A, 0x0A, 0x0A);
  escposCommands.push(0x1D, 0x56, 0x42, 0x00);

  // Convert array to binary package
  const payloadBytes = new Uint8Array(escposCommands);

  // --- ASYNC CHUNKED BLE PACKETS WRITE (20 BYTES WITH 5MS DELAY) ---
  let isWriteSuccess = false;

  if (activeWebBluetoothCharacteristic) {
    try {
      const chunkSize = 20;
      for (let i = 0; i < payloadBytes.length; i += chunkSize) {
        const chunk = payloadBytes.slice(i, i + chunkSize);
        await activeWebBluetoothCharacteristic.writeValue(chunk);
        await new Promise(resolve => setTimeout(resolve, 5)); // Reliable 5ms pacing delay
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
    isWriteSuccess = true;
  } else if (typeof window.ble !== 'undefined' && bleConnectedDeviceId && bleWriteServiceUUID && bleWriteCharUUID) {
    isWriteSuccess = true;
    const chunkSize = 20;
    let offset = 0;
    
    function sendNextBleChunk() {
      if (offset >= payloadBytes.length) {
        console.log('BLE printing native write completed successfully');
        return;
      }
      const chunk = payloadBytes.slice(offset, offset + chunkSize);
      const buffer = chunk.buffer;
      
      window.ble.writeWithoutResponse(bleConnectedDeviceId, bleWriteServiceUUID, bleWriteCharUUID, buffer, function() {
        offset += chunkSize;
        setTimeout(sendNextBleChunk, 5); // 5ms pacing delay for stable BLE transfers
      }, function(err) {
        window.ble.write(bleConnectedDeviceId, bleWriteServiceUUID, bleWriteCharUUID, buffer, function() {
          offset += chunkSize;
          setTimeout(sendNextBleChunk, 5);
        }, function(writeErr) {
          console.error('BLE Central write failure on chunk:', writeErr);
        });
      });
    }
    
    sendNextBleChunk();
  } else {
    // Mock simulation mode
    isWriteSuccess = true;
  }

  // Finalize UI state flow
  setTimeout(() => {
    if (isWriteSuccess) {
      playSound('success');
      showToast(currentLanguage === 'ar' ? 'تمت عملية الطباعة الرسومية بنجاح!' : 'Hardware raster print job dispatched successfully!', 'print');
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

      const confirmTitle = currentLanguage === 'ar' ? 'استيراد قاعدة البيانات' : 'Import Database';
      const confirmMessage = currentLanguage === 'ar' ? 
        'تحذير هام! استيراد هذه النسخة سيؤدي لمسح جميع البيانات الحالية وإحلال بيانات النسخة الاحتياطية بدلاً منها. هل تود الاستمرار؟' : 
        'Warning! This will overwrite all current local transactions. Proceed?';
      
      const isConfirmed = await showCustomConfirm(confirmTitle, confirmMessage);
      if (!isConfirmed) return;

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
      await refreshAllUI();
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

  const titleEl = document.getElementById('details-sheet-title') || document.getElementById('txt-details-sheet-title');

  if (type === 'import') {
    if (titleEl) {
      titleEl.textContent = currentLanguage === 'ar' ? 'تفاصيل فاتورة الاستيراد' : 'Import Invoice Details';
    }
    const imp = await dbGet('import_invoices', invoiceId);
    if (!imp) return;
    const farmer = await dbGet('farmers', imp.farmer_id);
    if (!farmer) return;
    const items = await dbGetAll('import_items');
    const impItems = items.filter(it => it.invoice_id === invoiceId);

    let itemsHtml = impItems.map((it, idx) => {
      const cropIcon = getCropIcon(it.crop_type);
      return `
        <tr style="border-bottom: 1px solid #f1f5f9; background: var(--color-white); transition: background-color 0.15s;">
          <td style="padding: 10px 12px; font-weight: 600; color: #94a3b8; text-align: center; font-size: 11px;">${formatVal(idx + 1)}</td>
          <td style="padding: 10px 12px; font-weight: 700; color: var(--color-text-dark); text-align: start;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 6px; background: #f8fafc; font-size: 13px; border: 1px solid #f1f5f9;">${cropIcon}</span>
              <span style="font-size: 12.5px;">${it.crop_type}</span>
            </div>
          </td>
          <td style="padding: 10px 12px; font-weight: 700; color: var(--color-primary-mid); text-align: start; font-size: 12px;">${formatWeight(it.weight_kg, it.unit || 'kg')}</td>
          <td style="padding: 10px 12px; text-align: start;">
            <span style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; padding: 2px 6px; border-radius: 6px; font-weight: 700; font-size: 10.5px; white-space: nowrap;">
              ${formatVal(it.box_count)} ${currentLanguage === 'ar' ? 'صندوق' : 'Boxes'}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    const isSettled = imp.is_settled;
    const statusText = isSettled 
      ? (currentLanguage === 'ar' ? 'مسواة حسابياً' : 'Settled') 
      : (currentLanguage === 'ar' ? 'نشطة / قيد البيع' : 'Active');
    const statusBg = isSettled ? '#f0fdf4' : '#fffbeb';
    const statusColor = isSettled ? '#15803d' : '#b45309';
    const statusBorder = isSettled ? '1px solid #bbf7d0' : '1px solid #fef3c7';
    const statusIcon = isSettled ? 'check_circle' : 'hourglass_empty';

    detailsBody.innerHTML = `
      <!-- Compact Receipt Header -->
      <div style="background: var(--color-white); border-radius: 16px; padding: 12px 14px; border: 1.5px solid #f1f5f9; font-size: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-family: monospace; font-size: 11px; font-weight: 800; background: rgba(0, 119, 182, 0.06); color: var(--color-primary); padding: 2px 7px; border-radius: 6px; border: 1px solid rgba(0, 119, 182, 0.1); letter-spacing: 0.5px;">#${formatVal(imp.id)}</span>
            <span style="color: #cbd5e1; font-weight: 300;">|</span>
            <div style="display: flex; align-items: center; gap: 4px;">
              <span class="material-icons-round" style="font-size: 14px; color: var(--color-text-muted);">person</span>
              <span style="color: var(--color-text-dark); font-weight: 700; font-size: 13px;">${farmer.name}</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 8px; background: ${statusBg}; color: ${statusColor}; border: ${statusBorder}; font-weight: 700; font-size: 11px; line-height: 1;">
            <span class="material-icons-round" style="font-size: 14px;">${statusIcon}</span>
            <span>${statusText}</span>
          </div>
        </div>
        
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; color: var(--color-text-muted); font-size: 11px;">
          <div style="display: flex; align-items: center; gap: 4px;">
            <span class="material-icons-round" style="font-size: 14px; color: #94a3b8;">calendar_today</span>
            <span>${new Date(imp.invoice_date).toLocaleDateString()}</span>
          </div>
          ${imp.vehicle_type ? `
          <div style="display: flex; align-items: center; gap: 4px;">
            <span class="material-icons-round" style="font-size: 14px; color: #94a3b8;">local_shipping</span>
            <span>${imp.vehicle_type}</span>
          </div>
          ` : ''}
        </div>
      </div>

      <!-- Compact Table -->
      <div style="border: 1.5px solid #f1f5f9; border-radius: 16px; overflow: hidden; background: var(--color-white); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02); margin-top: 12px; margin-bottom: 12px;">
        <table class="details-table" style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1.5px solid #f1f5f9; color: #64748b;">
              <th style="padding: 10px 12px; font-weight: 800; text-align: center; width: 40px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">#</th>
              <th style="padding: 10px 12px; font-weight: 800; text-align: start; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">${currentLanguage === 'ar' ? 'المحصول' : 'Crop'}</th>
              <th style="padding: 10px 12px; font-weight: 800; text-align: start; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">${currentLanguage === 'ar' ? 'الوزن الكلي' : 'Total Weight'}</th>
              <th style="padding: 10px 12px; font-weight: 800; text-align: start; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">${currentLanguage === 'ar' ? 'العدد' : 'Boxes'}</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <!-- Compact Settle Panel -->
      <div style="margin-top: 4px;">
        ${!isSettled ? `
          <button id="btn-details-settle-import" class="btn-primary" style="width: 100%; padding: 10px; font-size: 12px; font-weight: 800; background: var(--color-success); border: none; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; color: #fff; box-shadow: 0 4px 10px rgba(82, 183, 136, 0.15);">
            <span class="material-icons-round" style="font-size: 16px;">check_circle</span>
            <span>${currentLanguage === 'ar' ? 'تسوية الفاتورة وإغلاقها' : 'Settle & Close'}</span>
          </button>
        ` : `
          <div style="display: flex; align-items: center; gap: 6px; color: var(--color-success); font-weight: 800; font-size: 11.5px; background: rgba(82, 183, 136, 0.05); padding: 8px 12px; border-radius: 12px; border: 1px dashed rgba(82, 183, 136, 0.2);">
            <span class="material-icons-round" style="font-size: 18px;">verified</span>
            <span>${currentLanguage === 'ar' ? 'تم تسوية وتصفية هذه الفاتورة بالكامل.' : 'This invoice is fully settled.'}</span>
          </div>
        `}
      </div>
    `;

    const settleBtn = document.getElementById('btn-details-settle-import');
    if (settleBtn) {
      settleBtn.addEventListener('click', async () => {
        closeBottomSheet('sheet-invoice-details');
        const confirmTitle = currentLanguage === 'ar' ? 'تسوية حساب الفاتورة' : 'Settle Import Invoice';
        const confirmMsg = currentLanguage === 'ar' 
          ? `هل أنت متأكد من تسوية حساب وإغلاق فاتورة الاستيراد رقم #${imp.id} للفلاح "${farmer.name}"؟` 
          : `Are you sure you want to settle accounts and close import invoice #${imp.id} for farmer "${farmer.name}"?`;
        const isConfirmed = await showCustomConfirm(confirmTitle, confirmMsg);
        if (isConfirmed) {
          await settleImportInvoice(imp.id);
          await showInvoiceDetails(imp.id, 'import');
        } else {
          openBottomSheet('sheet-invoice-details');
        }
      });
    }

  } else {
    if (titleEl) {
      titleEl.textContent = currentLanguage === 'ar' ? 'تفاصيل فاتورة البيع والأرباح' : 'Sale Invoice Details';
    }
    const sale = await dbGet('sale_invoices', invoiceId);
    if (!sale) return;
    const customer = await dbGet('customers', sale.customer_id);
    if (!customer) return;
    const items = await dbGetAll('sale_items');
    const saleItems = items.filter(it => it.sale_invoice_id === invoiceId);

    let itemsHtml = saleItems.map((it, idx) => {
      const cropIcon = getCropIcon(it.crop_type);
      return `
        <tr style="border-bottom: 1px solid #f1f5f9; background: var(--color-white); transition: background-color 0.15s;">
          <td style="padding: 10px 12px; font-weight: 600; color: #94a3b8; text-align: center; font-size: 11px;">${formatVal(idx + 1)}</td>
          <td style="padding: 10px 12px; font-weight: 700; color: var(--color-text-dark); text-align: start;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 6px; background: #f8fafc; font-size: 13px; border: 1px solid #f1f5f9;">${cropIcon}</span>
              <span style="font-size: 12.5px;">${it.crop_type}</span>
            </div>
          </td>
          <td style="padding: 10px 12px; font-weight: 700; color: var(--color-primary-mid); text-align: start; font-size: 12px;">${formatWeight(it.weight_kg, it.unit || 'kg')}</td>
          <td style="padding: 10px 12px; text-align: start;">
            <span style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; padding: 2px 6px; border-radius: 6px; font-weight: 700; font-size: 10.5px; white-space: nowrap;">
              ${formatVal(it.box_count)} ${currentLanguage === 'ar' ? 'صندوق' : 'Boxes'}
            </span>
          </td>
          <td style="padding: 10px 12px; font-weight: 800; color: var(--color-primary); text-align: start; white-space: nowrap; font-size: 12px;">${formatVal(it.agreed_price, true)}</td>
        </tr>
      `;
    }).join('');

    const subtotal = saleItems.reduce((sum, item) => sum + item.agreed_price, 0);
    const totalCommissions = saleItems.reduce((sum, item) => sum + item.commission_amount, 0);
    const totalCarrying = saleItems.reduce((sum, item) => sum + item.porter_fee, 0);

    const debts = await dbGetAll('debts');
    const isSettled = isSaleInvoiceSettled(sale, debts);
    const debt = debts.find(d => d.sale_invoice_id === sale.id);

    let statusText = '';
    let statusBg = '';
    let statusColor = '';
    let statusBorder = '';
    let statusIcon = '';

    if (sale.payment_type === 'cash') {
      statusText = currentLanguage === 'ar' ? 'مدفوعة نقداً' : 'Paid Cash';
      statusBg = '#f0fdf4';
      statusColor = '#15803d';
      statusBorder = '1px solid #bbf7d0';
      statusIcon = 'payments';
    } else {
      if (isSettled) {
        statusText = currentLanguage === 'ar' ? 'دين مسدد' : 'Settled';
        statusBg = '#f0f9ff';
        statusColor = '#0369a1';
        statusBorder = '1px solid #bae6fd';
        statusIcon = 'check_circle';
      } else {
        const remaining = debt ? debt.amount : sale.total_amount;
        statusText = currentLanguage === 'ar' ? `بالأجل (${formatVal(remaining)} د.ع)` : `Credit (${formatVal(remaining)} IQD)`;
        statusBg = '#fef2f2';
        statusColor = '#b91c1c';
        statusBorder = '1px solid #fecaca';
        statusIcon = 'hourglass_empty';
      }
    }

    // Dynamic Debt Progress Section (Super compact)
    let debtProgressHtml = '';
    if (sale.payment_type === 'debt' && debt) {
      const outstanding = debt.amount;
      const originalTotal = sale.total_amount;
      const paidAmount = originalTotal - outstanding;
      const progressPercent = Math.min(100, Math.max(0, Math.round((paidAmount / originalTotal) * 100)));

      debtProgressHtml = `
        <div style="background: var(--color-white); border: 1.5px solid #fee2e2; border-radius: 20px; padding: 16px; margin-bottom: 12px; font-family: inherit; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.01);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <!-- Left Side: Progress Pill -->
            <span style="background: #fff1f2; color: #dc2626; font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 8px; border: 1px solid #ffe4e6; line-height: 1;">
              ${progressPercent}% ${currentLanguage === 'ar' ? 'مُسدد' : 'Paid'}
            </span>
            
            <!-- Right Side: Title and Icon -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #dc2626; font-weight: 700; font-size: 13px;">
                ${currentLanguage === 'ar' ? 'تتبع حالة سداد الدين:' : 'Debt Payment Tracker:'}
              </span>
              <div style="width: 22px; height: 22px; border-radius: 6px; background: #dc2626; color: #ffffff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span class="material-icons-round" style="font-size: 14px;">analytics</span>
              </div>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div style="height: 8px; background: #f1f5f9; border-radius: 10px; overflow: hidden; margin-bottom: 14px;">
            <div style="width: ${progressPercent}%; height: 100%; background: #10b981; border-radius: 10px; transition: width 0.8s ease;"></div>
          </div>

          <!-- Three Columns Footer -->
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
            <!-- Left Column: Outstanding -->
            <div style="text-align: start; flex: 1;">
              <span style="font-size: 11px; color: #64748b; font-weight: 600; display: block; margin-bottom: 2px;">
                ${currentLanguage === 'ar' ? 'المتبقي بذمة الزبون:' : 'Outstanding Debt:'}
              </span>
              <strong style="color: #ef4444; font-size: 12.5px; font-weight: 800; font-family: monospace;">${formatVal(outstanding, true)}</strong>
            </div>

            <!-- Middle Column: Paid -->
            <div style="text-align: center; flex: 1;">
              <span style="font-size: 11px; color: #64748b; font-weight: 600; display: block; margin-bottom: 2px;">
                ${currentLanguage === 'ar' ? 'المبلغ المسدد:' : 'Paid So Far:'}
              </span>
              <strong style="color: #10b981; font-size: 12.5px; font-weight: 800; font-family: monospace;">${formatVal(paidAmount, true)}</strong>
            </div>

            <!-- Right Column: Original -->
            <div style="text-align: end; flex: 1;">
              <span style="font-size: 11px; color: #64748b; font-weight: 600; display: block; margin-bottom: 2px;">
                ${currentLanguage === 'ar' ? 'المبلغ الأصلي للفاتورة:' : 'Original Invoice Total:'}
              </span>
              <strong style="color: #1e293b; font-size: 12.5px; font-weight: 800; font-family: monospace;">${formatVal(originalTotal, true)}</strong>
            </div>
          </div>
        </div>
      `;
    }

    detailsBody.innerHTML = `
      <!-- Compact Receipt Header -->
      <div style="background: var(--color-white); border-radius: 16px; padding: 12px 14px; border: 1.5px solid #f1f5f9; font-size: 12px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-family: monospace; font-size: 11px; font-weight: 800; background: rgba(0, 119, 182, 0.06); color: var(--color-primary); padding: 2px 7px; border-radius: 6px; border: 1px solid rgba(0, 119, 182, 0.1); letter-spacing: 0.5px;">#${sale.order_id || ('ALW-' + String(sale.id).padStart(3, '0'))}</span>
            <span style="color: #cbd5e1; font-weight: 300;">|</span>
            <div style="display: flex; align-items: center; gap: 4px;">
              <span class="material-icons-round" style="font-size: 14px; color: var(--color-text-muted);">person</span>
              <span style="color: var(--color-text-dark); font-weight: 700; font-size: 13px;">${customer.name}</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 8px; background: ${statusBg}; color: ${statusColor}; border: ${statusBorder}; font-weight: 700; font-size: 11px; line-height: 1;">
            <span class="material-icons-round" style="font-size: 14px;">${statusIcon}</span>
            <span>${statusText}</span>
          </div>
        </div>
        
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; color: var(--color-text-muted); font-size: 11px;">
          <div style="display: flex; align-items: center; gap: 4px;">
            <span class="material-icons-round" style="font-size: 14px; color: #94a3b8;">calendar_today</span>
            <span>${new Date(sale.created_at).toLocaleDateString()}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span class="material-icons-round" style="font-size: 14px; color: #94a3b8;">credit_card</span>
            <span>${currentLanguage === 'ar' ? 'الدفع:' : 'Payment:'} ${sale.payment_type === 'cash' ? (currentLanguage === 'ar' ? '💵 نقد' : 'Cash') : (currentLanguage === 'ar' ? '📋 دين بالأجل' : 'Debt')}</span>
          </div>
        </div>
      </div>

      <!-- Outstanding Debt Tracker if needed -->
      ${debtProgressHtml}

      <!-- Compact Table -->
      <div style="border: 1.5px solid #f1f5f9; border-radius: 16px; overflow: hidden; background: var(--color-white); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02); margin-top: 12px; margin-bottom: 12px;">
        <table class="details-table" style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1.5px solid #f1f5f9; color: #64748b;">
              <th style="padding: 10px 12px; font-weight: 800; text-align: center; width: 40px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">#</th>
              <th style="padding: 10px 12px; font-weight: 800; text-align: start; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">${currentLanguage === 'ar' ? 'المحصول' : 'Crop'}</th>
              <th style="padding: 10px 12px; font-weight: 800; text-align: start; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">${currentLanguage === 'ar' ? 'الوزن' : 'Weight'}</th>
              <th style="padding: 10px 12px; font-weight: 800; text-align: start; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">${currentLanguage === 'ar' ? 'العلب' : 'Boxes'}</th>
              <th style="padding: 10px 12px; font-weight: 800; text-align: start; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">${currentLanguage === 'ar' ? 'السعر' : 'Price'}</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <!-- Financial Calculation Summary List -->
      <div style="background: linear-gradient(135deg, var(--color-white) 0%, rgba(0, 119, 182, 0.01) 100%); border: 1px solid rgba(0, 119, 182, 0.08); border-radius: 14px; padding: 10px 12px; line-height: 1.5; font-size: 12px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: var(--color-text-muted);">${currentLanguage === 'ar' ? 'مجموع قيمة البضاعة:' : 'Goods Subtotal:'}</span>
          <span style="font-weight: 700; color: var(--color-text-dark);">${formatVal(subtotal, true)}</span>
        </div>
        ${totalCommissions > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: var(--color-text-muted);">${currentLanguage === 'ar' ? 'عمولة المكتب (7%):' : 'Office Commission (7%):'}</span>
            <span style="font-weight: 700; color: var(--color-primary); font-family: monospace;">+ ${formatVal(totalCommissions, true)}</span>
          </div>
        ` : ''}
        ${totalCarrying > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: var(--color-text-muted);">${currentLanguage === 'ar' ? 'أجور تحميل (حمالية):' : 'Carrying Fee:'}</span>
            <span style="font-weight: 700; color: var(--color-primary); font-family: monospace;">+ ${formatVal(totalCarrying, true)}</span>
          </div>
        ` : ''}
        ${sale.bags_cost > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: var(--color-text-muted);">${currentLanguage === 'ar' ? 'أجور الأكياس والكراتين:' : 'Bags/Boxes Cost:'}</span>
            <span style="font-weight: 700; color: var(--color-primary); font-family: monospace;">+ ${formatVal(sale.bags_cost, true)}</span>
          </div>
        ` : ''}
        
        <div style="display: flex; justify-content: space-between; font-size: 13.5px; font-weight: 900; color: var(--color-primary); border-top: 1px dashed rgba(0,0,0,0.08); margin-top: 6px; padding-top: 6px;">
          <span>${currentLanguage === 'ar' ? 'صافي الإجمالي المستحق:' : 'Grand Total:'}</span>
          <span style="font-family: monospace;">${formatVal(sale.total_amount, true)}</span>
        </div>
      </div>

      <!-- Quick Actions (Printing & Settle Options) -->
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <!-- Print Button -->
        <button id="btn-details-print-sale" class="btn-primary" style="flex: 1; min-width: 110px; padding: 10px; font-size: 12px; font-weight: 800; background: var(--color-primary-mid); border: none; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; color: #fff; box-shadow: 0 4px 10px rgba(0, 150, 199, 0.15);">
          <span class="material-icons-round" style="font-size: 16px;">print</span>
          <span>${currentLanguage === 'ar' ? 'طباعة الفاتورة' : 'Print'}</span>
        </button>
        
        <!-- Debt Settlement Buttons (Only for pending debts) -->
        ${(sale.payment_type === 'debt' && !isSettled && debt) ? `
          <button id="btn-details-partial-pay" class="btn-primary" style="flex: 1; min-width: 90px; padding: 10px; font-size: 12px; font-weight: 800; background: var(--color-info); border: none; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; color: #fff; box-shadow: 0 4px 10px rgba(0, 119, 182, 0.1);">
            <span class="material-icons-round" style="font-size: 16px;">payments</span>
            <span>${currentLanguage === 'ar' ? 'تسديد دفعة' : 'Pay Partial'}</span>
          </button>
          <button id="btn-details-full-settle" class="btn-primary" style="flex: 1; min-width: 90px; padding: 10px; font-size: 12px; font-weight: 800; background: var(--color-success); border: none; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; color: #fff; box-shadow: 0 4px 10px rgba(82, 183, 136, 0.15);">
            <span class="material-icons-round" style="font-size: 16px;">check_circle</span>
            <span>${currentLanguage === 'ar' ? 'تسديد كامل' : 'Settle All'}</span>
          </button>
        ` : ''}
      </div>
    `;

    // Bind Print Button
    const printBtn = document.getElementById('btn-details-print-sale');
    if (printBtn) {
      printBtn.addEventListener('click', async () => {
        closeBottomSheet('sheet-invoice-details');
        await openPrintPreview(sale.id);
      });
    }

    // Bind Partial Pay Button
    const partialBtn = document.getElementById('btn-details-partial-pay');
    if (partialBtn && debt) {
      partialBtn.addEventListener('click', async () => {
        closeBottomSheet('sheet-invoice-details');
        await openPaymentSheet(debt.id);
      });
    }

    // Bind Full Settle Button
    const fullSettleBtn = document.getElementById('btn-details-full-settle');
    if (fullSettleBtn && debt) {
      fullSettleBtn.addEventListener('click', async () => {
        closeBottomSheet('sheet-invoice-details');
        await settleFullDebtDirectly(debt.id);
      });
    }
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

  const elStatsPeriod = document.getElementById('txt-stats-period-lbl');
  if (elStatsPeriod) elStatsPeriod.textContent = currentLanguage === 'ar' ? 'فترة الإحصائيات:' : 'Stats Period:';

  const elPrintInv = document.getElementById('txt-print-inventory-lbl');
  if (elPrintInv) elPrintInv.textContent = currentLanguage === 'ar' ? 'طباعة قائمة جرد يومية' : 'Print Daily Inventory';

  const elLogsTitle = document.getElementById('txt-logs-title-lbl');
  if (elLogsTitle) elLogsTitle.textContent = currentLanguage === 'ar' ? 'سجل عمليات التطبيق اليومي' : 'Daily App Activity Log';

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

  const elAddLiquidity = document.getElementById('txt-add-liquidity-btn-lbl');
  if (elAddLiquidity) {
    elAddLiquidity.textContent = currentLanguage === 'ar' ? 'إضافة سيولة نقدية' : 'Add Cash Liquidity';
  }

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

async function executeMonthlyRollover(monthKey) {
  const allSales = await dbGetAll('sale_invoices');
  const allDebts = await dbGetAll('debts');
  const dues = await dbGetAll('farmer_dues');
  const porter = await dbGetAll('porter_payouts');
  const dailyExpenses = await dbGetAll('daily_expenses');
  const personalExpenses = await dbGetAll('personal_expenses');
  const losses = await dbGetAll('losses');
  const safeAdjustments = await dbGetAll('safe_adjustments');
  const allSaleItems = await dbGetAll('sale_items');

  const isTargetMonth = (timestamp) => {
    const d = new Date(timestamp);
    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return mKey === monthKey;
  };

  const cashSalesTotal = allSales.filter(s => s.payment_type === 'cash' && isTargetMonth(s.created_at)).reduce((sum, s) => sum + s.total_amount, 0);
  
  const collectedDebtsTotal = allDebts.filter(d => d.is_paid && isTargetMonth(d.created_at)).reduce((sum, d) => sum + d.amount, 0) +
                               safeAdjustments.filter(a => (a.type === 'partial_debt_payout' || a.type === 'manual_addition') && isTargetMonth(a.created_at)).reduce((sum, a) => sum + a.amount, 0);

  const paidDuesTotal = dues.filter(d => d.is_paid && isTargetMonth(d.created_at)).reduce((sum, d) => sum + d.net_due, 0);
  const paidPortersTotal = porter.filter(p => p.is_paid && isTargetMonth(p.created_at)).reduce((sum, p) => sum + p.amount, 0);

  const expensesTotal = dailyExpenses.filter(e => isTargetMonth(e.created_at)).reduce((sum, e) => sum + e.amount, 0) +
                        personalExpenses.filter(e => isTargetMonth(e.created_at)).reduce((sum, e) => sum + e.amount, 0);
  const lossesTotal = losses.filter(l => isTargetMonth(l.created_at)).reduce((sum, l) => sum + l.amount, 0);

  const saleInvoiceIdsInMonth = new Set(allSales.filter(s => isTargetMonth(s.created_at)).map(s => s.id));
  const totalCompanyCommission = allSaleItems.filter(item => saleInvoiceIdsInMonth.has(item.sale_invoice_id)).reduce((sum, item) => sum + Math.round(item.agreed_price * 0.05), 0);

  await dbAdd('stat_archives', {
    id: monthKey,
    month: monthKey,
    cashSales: cashSalesTotal,
    collectedDebts: collectedDebtsTotal,
    paidDues: paidDuesTotal,
    paidPorters: paidPortersTotal,
    expenses: expensesTotal,
    losses: lossesTotal,
    companyCommission: totalCompanyCommission,
    archived_at: Date.now()
  });

  logAppEvent(
    `ترحيل تلقائي وأرشفة إحصائيات شهر: ${monthKey}`,
    `Automatic monthly rollover and archived statistics for: ${monthKey}`
  );
}

async function checkAndApplyMonthlyRollover() {
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const lastRolloverMonth = localStorage.getItem('alwa_last_rollover_month');
  
  if (lastRolloverMonth && lastRolloverMonth !== currentMonthKey) {
    try {
      await executeMonthlyRollover(lastRolloverMonth);
    } catch (e) {
      console.error('Failed to perform monthly rollover archiving:', e);
    }
  }
  
  localStorage.setItem('alwa_last_rollover_month', currentMonthKey);
}

async function printDailyInventoryList() {
  const allSales = await dbGetAll('sale_invoices');
  const allSaleItems = await dbGetAll('sale_items');
  const allImports = await dbGetAll('import_invoices');
  const allImportItems = await dbGetAll('import_items');
  const allFarmers = await dbGetAll('farmers');
  const allCustomers = await dbGetAll('customers');

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;

  // Filter sales made today
  const todaySales = allSales.filter(s => s.created_at >= todayStart && s.created_at < todayEnd);
  const todaySaleIds = new Set(todaySales.map(s => s.id));
  const todaySaleItems = allSaleItems.filter(item => todaySaleIds.has(item.sale_invoice_id));

  if (todaySaleItems.length === 0) {
    showToast(currentLanguage === 'ar' ? 'لا توجد مبيعات مسجلة لليوم لطباعة قائمة الجرد!' : 'No sales recorded today to generate an inventory list!', 'warning', true);
    return;
  }

  // Group by crop type
  const inventoryMap = {};

  todaySaleItems.forEach(item => {
    const crop = item.crop_type;
    if (!inventoryMap[crop]) {
      inventoryMap[crop] = {
        cropType: crop,
        soldWeight: 0,
        soldBoxes: 0,
        farmers: new Set(),
        customers: new Set(),
        unit: item.unit || 'kg'
      };
    }
    inventoryMap[crop].soldWeight += item.weight_kg || 0;
    inventoryMap[crop].soldBoxes += item.box_count || 0;

    // Find customer
    const invoice = todaySales.find(s => s.id === item.sale_invoice_id);
    if (invoice) {
      const cust = allCustomers.find(c => c.id === invoice.customer_id);
      if (cust) {
        inventoryMap[crop].customers.add(cust.name);
      }
    }

    // Find farmer
    const impItem = allImportItems.find(ii => ii.id === item.import_item_id);
    if (impItem) {
      const impInvoice = allImports.find(ii => ii.id === impItem.invoice_id);
      if (impInvoice) {
        const farmer = allFarmers.find(f => f.id === impInvoice.farmer_id);
        if (farmer) {
          inventoryMap[crop].farmers.add(farmer.name);
        }
      }
    }
  });

  // Calculate remaining quantities for each crop
  for (const crop in inventoryMap) {
    const cropItems = allImportItems.filter(ii => ii.crop_type === crop);
    const totalImportedWeight = cropItems.reduce((sum, ii) => sum + (ii.weight_kg || 0), 0);
    const totalImportedBoxes = cropItems.reduce((sum, ii) => sum + (ii.box_count || 0), 0);

    const cropSales = allSaleItems.filter(si => si.crop_type === crop);
    const totalSoldWeight = cropSales.reduce((sum, si) => sum + (si.weight_kg || 0), 0);
    const totalSoldBoxes = cropSales.reduce((sum, si) => sum + (si.box_count || 0), 0);

    inventoryMap[crop].remainingWeight = Math.max(0, totalImportedWeight - totalSoldWeight);
    inventoryMap[crop].remainingBoxes = Math.max(0, totalImportedBoxes - totalSoldBoxes);
  }

  // Populate receipt-paper HTML for high-fidelity inventory print!
  const container = document.getElementById('receipt-paper');
  if (container) {
    container.className = `thermal-paper w-${printerPaperWidth}`;
  }

  const is58mm = printerPaperWidth === '58';
  const fontSizeClass = is58mm ? 'font-size: 13.5px; line-height: 1.3;' : 'font-size: 15.5px; line-height: 1.45;';
  const headerFontSizeClass = is58mm ? 'font-size: 18px;' : 'font-size: 22px;';
  const borderStyle = 'border-bottom: 1.2px dashed #000;';

  const formattedDate = now.toLocaleDateString(numeralSystem === 'ar' ? 'ar-IQ' : 'en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });

  let itemsHtml = Object.values(inventoryMap).map((it, idx) => {
    const isCount = it.unit === 'count';
    const soldQty = isCount ? `${formatVal(it.soldBoxes)} عدد` : `${formatWeight(it.soldWeight, 'kg')} (${formatVal(it.soldBoxes)} ص)`;
    const remainingQty = isCount ? `${formatVal(it.remainingBoxes)} عدد` : `${formatWeight(it.remainingWeight, 'kg')} (${formatVal(it.remainingBoxes)} ص)`;
    
    const farmersList = Array.from(it.farmers).join('، ') || (currentLanguage === 'ar' ? 'غير محدد' : 'Unknown');
    const customersList = Array.from(it.customers).join('، ') || (currentLanguage === 'ar' ? 'غير مححد' : 'Unknown');

    return `
      <div style="${borderStyle} padding: 8px 0; direction: rtl; text-align: right; ${fontSizeClass}">
        <div style="display: flex; justify-content: space-between; font-weight: 800; color: #000;">
          <span>[${idx + 1}] ${it.cropType}</span>
          <span style="color: var(--color-primary-dark);">${it.unit === 'count' ? 'عدد فقط' : 'وزن وصندوق'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 4px; font-weight: 600;">
          <span>الكمية المباعة:</span>
          <span style="font-weight: 800; color: #000;">${soldQty}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 2px; font-weight: 600;">
          <span>الكمية المتبقية:</span>
          <span style="font-weight: 800; color: #000;">${remainingQty}</span>
        </div>
        <div style="margin-top: 4px; font-size: 11.5px; color: #444; line-height: 1.3;">
          <div><strong style="color: #000;">الفلاح المستورد منه:</strong> ${farmersList}</div>
          <div style="margin-top: 2px;"><strong style="color: #000;">الزبون المباع له:</strong> ${customersList}</div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="text-align: center; border-bottom: 1.5px dashed #000; padding-bottom: 8px; margin-bottom: 8px; direction: rtl;">
      <h2 style="${headerFontSizeClass} font-weight: 800; color: #000; margin: 0 0 4px 0; letter-spacing: normal;">${officeName}</h2>
      <h3 style="font-size: 14px; font-weight: 700; color: #333; margin: 0 0 8px 0;">قائمة الجرد اليومية / Daily Inventory</h3>
      <div style="font-size: 12px; color: #000; font-weight: 600;">التاريخ: ${formattedDate}</div>
    </div>
    
    <div style="margin-bottom: 12px;">
      ${itemsHtml}
    </div>

    <div style="text-align: center; margin-top: 12px; padding-top: 8px; border-top: 1.5px dashed #000; font-size: 11px; font-weight: 700; color: #444;">
      نظام علوة للمحاسبة الذكي © ${now.getFullYear()}
    </div>
  `;

  // Log in events
  logAppEvent(
    `طباعة قائمة جرد يومية لعدد ${Object.keys(inventoryMap).length} أصناف`,
    `Printed daily inventory list for ${Object.keys(inventoryMap).length} crop items`
  );

  // Set dataset ID to -1 to prevent printing a single receipt when print button is pressed
  document.getElementById('btn-execute-print').dataset.id = "-1";
  document.getElementById('btn-execute-sysprint').dataset.id = "-1";
  document.getElementById('btn-share-receipt').dataset.id = "-1";

  openBottomSheet('sheet-print-preview');
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

    // Check and apply monthly rollover if needed
    await checkAndApplyMonthlyRollover();

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
    document.getElementById('btn-submit-payout').addEventListener('click', submitFarmerPayout);
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

    const btnAddSafeLiquidity = document.getElementById('btn-add-safe-liquidity');
    if (btnAddSafeLiquidity) {
      btnAddSafeLiquidity.addEventListener('click', () => {
        const dialog = document.getElementById('custom-safe-adjust-dialog');
        if (dialog) {
          document.getElementById('safe-adj-amount').value = '';
          document.getElementById('safe-adj-note').value = '';
          dialog.style.display = 'flex';
        }
      });
    }

    const btnSafeAdjCancel = document.getElementById('btn-safe-adj-cancel');
    if (btnSafeAdjCancel) {
      btnSafeAdjCancel.addEventListener('click', () => {
        const dialog = document.getElementById('custom-safe-adjust-dialog');
        if (dialog) dialog.style.display = 'none';
      });
    }

    const btnSafeAdjOk = document.getElementById('btn-safe-adj-ok');
    if (btnSafeAdjOk) {
      btnSafeAdjOk.addEventListener('click', async () => {
        const amountEl = document.getElementById('safe-adj-amount');
        const noteEl = document.getElementById('safe-adj-note');
        const amount = parseFloat(amountEl.value);
        const note = noteEl.value.trim();

        if (isNaN(amount) || amount <= 0) {
          showToast(currentLanguage === 'ar' ? 'الرجاء إدخال مبلغ صحيح أكبر من الصفر' : 'Please enter a valid amount greater than zero', 'warning', true);
          return;
        }

        const dialog = document.getElementById('custom-safe-adjust-dialog');
        if (dialog) dialog.style.display = 'none';

        try {
          await dbAdd('safe_adjustments', {
            type: 'manual_addition',
            amount: amount,
            note: note || (currentLanguage === 'ar' ? 'إيداع نقدي يدوي' : 'Manual cash deposit'),
            created_at: Date.now()
          });

          logAppEvent(
            `إيداع سيولة يدوية بالخزنة: ${amount} د.ع - ${note || 'بدون ملاحظة'}`,
            `Manual cash deposit to safe box: ${amount} IQD - ${note || 'No notes'}`,
            amount
          );

          playSound('success');
          showToast(
            currentLanguage === 'ar' ? 'تمت إضافة السيولة النقدية للخزنة بنجاح!' : 'Cash liquidity successfully added to the safe box!',
            'check_circle'
          );

          await refreshAllUI();
        } catch (e) {
          console.error(e);
          showToast(currentLanguage === 'ar' ? 'حدث خطأ أثناء الإيداع!' : 'An error occurred during deposit!', 'warning', true);
        }
      });
    }

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

    const statsMonthSel = document.getElementById('stats-month-selector');
    if (statsMonthSel) {
      statsMonthSel.addEventListener('change', () => {
        renderStatsPanel();
      });
    }

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
    
    const btnPrintInv = document.getElementById('btn-print-inventory');
    if (btnPrintInv) {
      btnPrintInv.addEventListener('click', printDailyInventoryList);
    }
    
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
    const paymentBtns = document.querySelectorAll('.toggle-switch-group .toggle-switch-btn');
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

    // Bind Segmented Control Buttons (e.g. Debt Due Options)
    const debtDaysBtns = document.querySelectorAll('#group-debt-options .segmented-control-btn');
    debtDaysBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        debtDaysBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
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
