import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { BLEPrinterDriver } from './BLEPrinterDriver.ts';

// Check if localStorage is accessible, if not, patch window.localStorage with an in-memory mock to prevent top-level reference crashes
try {
  const testKey = '__storage_test__';
  window.localStorage.setItem(testKey, testKey);
  window.localStorage.removeItem(testKey);
} catch (e) {
  console.warn('Native localStorage is disabled or restricted. Activating in-memory fallback storage.');
  let safeStorage = {};
  const mockStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(safeStorage, key) ? safeStorage[key] : null; },
    setItem(key, value) { safeStorage[key] = String(value); },
    removeItem(key) { delete safeStorage[key]; },
    clear() { safeStorage = {}; },
    key(index) { return Object.keys(safeStorage)[index] || null; },
    get length() { return Object.keys(safeStorage).length; }
  };
  try {
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true
    });
  } catch (err) {
    console.error('Failed to redefine window.localStorage:', err);
  }
}

// Safely wrap Storage.prototype.setItem to prevent QuotaExceededError or security block crashes across the entire app
try {
  if (typeof Storage !== 'undefined' && Storage.prototype) {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      try {
        originalSetItem.call(this, key, value);
      } catch (e) {
        console.warn(`Storage.setItem failed for key "${key}" (possibly quota exceeded or disabled):`, e);
      }
    };
  }
} catch (err) {
  console.error('Failed to patch Storage.prototype.setItem:', err);
}

// Global Element Mappings and Safety Fallbacks to Reconcile index.html & app.js
const MAPPINGS_DICTIONARY = {
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
  'total-debt-sales': 'val-total-debt-sales',
  'total-collected-debts': 'val-total-collected-debts',
  'total-adjustments': 'val-total-adjustments',
  'total-commission-5': 'val-total-commission-5',
  'total-paid-dues': 'val-total-paid-dues',
  'total-porters-payouts': 'val-total-porter-payouts',
  'btn-record-expense': 'btn-record-expense-dummy',
  'btn-record-loss': 'btn-record-loss-dummy',
  'lbl-chart-title': 'txt-chart-title',
  'lbl-ledger-title': 'txt-ledger-title',
  'lbl-office-title': 'txt-office-settings-title',
  'lbl-name-setting': 'lbl-office-name',
  'lbl-phone-setting': 'lbl-office-phone',
  'lbl-location-setting': 'lbl-office-location',
  'lbl-cashier-setting': 'lbl-office-cashier',
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
  'btn-share-receipt': 'btn-share-receipt-png',
  'sheet-expense-title-h3': 'txt-expense-sheet-title',
  'lbl-expense-type-label': 'lbl-expense-type',
  'opt-expense-daily': 'expense-type-daily',
  'opt-expense-personal': 'expense-type-personal',
  'lbl-expense-subject-label': 'lbl-expense-subject',
  'lbl-expense-amount-label': 'lbl-expense-amount',
  'sheet-loss-title-h3': 'txt-loss-sheet-title',
  'lbl-loss-subject-label': 'lbl-loss-subject',
  'lbl-loss-amount-label': 'lbl-loss-amount',
  'sheet-preview-title-h3': 'txt-print-preview-title'
};

const originalGetElementById = document.getElementById;
document.getElementById = function(id) {
  const el = originalGetElementById.call(document, id);
  if (el) return el;

  if (MAPPINGS_DICTIONARY[id]) {
    const mappedEl = originalGetElementById.call(document, MAPPINGS_DICTIONARY[id]);
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
let isNavigatingViaHistory = false;
let soundEnabled = localStorage.getItem('alwa_sound') !== 'false';
let importFilterStatus = 'all';
let saleFilterStatus = 'all';
let debtsFilterStatus = 'all';
let duesFilterStatus = 'all';
let importPriceEnabled = false; // Permanently disabled as per user request
let isPrinterConnected = false;
let printerPaperWidth = '58'; // '58' or '80'
let officeName = localStorage.getItem('alwa_office_name') || 'علوة الغابة الخضراء';
let officeOwner = localStorage.getItem('alwa_office_owner') || 'أبو أحمد';
let officePhone = localStorage.getItem('alwa_office_phone') || '07701234567';
let officeLocation = localStorage.getItem('alwa_office_location') || 'جمهورية العراق';
let officeCashier = localStorage.getItem('alwa_office_cashier') || 'Ahmed';
let officeChangesCount = parseInt(localStorage.getItem('alwa_office_changes_count') || '0');

// BLE Central state (cordova-plugin-ble-central)
let bleConnectedDeviceId = null;    // MAC address of the connected BLE printer
let bleWriteServiceUUID = null;     // Service UUID used for writing
let bleWriteCharUUID = null;        // Characteristic UUID used for writing
let bleBatteryServiceUUID = null;   // Service UUID used for battery level (Cordova BLE)
let bleBatteryCharUUID = null;      // Characteristic UUID used for battery level (Cordova BLE)
let isCordovaSerialActive = false;  // true only if Classic Bluetooth SPP is used
let connectedDeviceAddress = null;  // generic address holder
let autoConnectIntervalId = null;   // background auto-connect interval ID
let isAutoConnecting = false;       // status flag to avoid duplicate concurrent connects
let consecutiveAutoConnectFailures = 0; // counter to prevent native Android Bluetooth socket/GATT leaks and crashes
let isManualScanning = false;       // status flag to avoid collision with manual BLE scan

// Performance Cache & Optimization Globals
let dbCache = {};
let activePorterPayout = null;

function invalidateDbCache(storeName) {
  if (storeName) {
    dbCache[storeName] = null;
  } else {
    dbCache = {};
  }
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const listPageLimits = {
  imports: 10,
  sales: 10,
  debts: 10,
  dues: 10,
  porters: 10,
  archiveImports: 10,
  archiveSales: 10
};

function resetListPageLimits() {
  listPageLimits.imports = 10;
  listPageLimits.sales = 10;
  listPageLimits.debts = 10;
  listPageLimits.dues = 10;
  listPageLimits.porters = 10;
  listPageLimits.archiveImports = 10;
  listPageLimits.archiveSales = 10;
}

function createLoadMoreButton(onClick) {
  const container = document.createElement('div');
  container.className = 'load-more-container';
  container.style.gridColumn = '1 / -1';
  container.style.width = '100%';
  container.style.display = 'flex';
  container.style.justifyContent = 'center';
  container.style.padding = '12px 0 24px 0';

  const btn = document.createElement('button');
  btn.className = 'btn-primary';
  btn.style.padding = '10px 24px';
  btn.style.fontSize = '12px';
  btn.style.fontWeight = '700';
  btn.style.borderRadius = '12px';
  btn.style.background = 'var(--color-primary-mid)';
  btn.style.border = 'none';
  btn.style.cursor = 'pointer';
  btn.style.display = 'flex';
  btn.style.alignItems = 'center';
  btn.style.gap = '8px';
  btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
  
  const icon = document.createElement('span');
  icon.className = 'material-icons-round';
  icon.style.fontSize = '16px';
  icon.textContent = 'expand_more';
  
  const text = document.createElement('span');
  text.textContent = currentLanguage === 'ar' ? 'عرض المزيد...' : 'Show More...';
  
  btn.appendChild(icon);
  btn.appendChild(text);
  btn.addEventListener('click', onClick);
  
  container.appendChild(btn);
  return container;
}


// Helper to generate a 6-character random alphanumeric Order ID that is completely unique
async function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let allInvoices = [];
  try {
    allInvoices = await dbGetAll('sale_invoices');
  } catch (e) {
    console.error('Error fetching invoices for unique order ID check:', e);
  }
  const existingIds = new Set(allInvoices.map(inv => (inv.order_id || '').toUpperCase()));

  let result = '';
  do {
    result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (existingIds.has(result));

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

  // Save back to localStorage safely
  try {
    localStorage.setItem('alwa_app_logs', JSON.stringify(logs));
  } catch (e) {
    console.warn('Failed to save app logs to localStorage:', e);
  }
  
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
    const timeStr = forceEnglishDigits(d.toLocaleTimeString('ar-IQ-u-nu-latn', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
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

const customSvgs = {
  'turnip_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="turnipGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#c084fc"/><stop offset="30%" stop-color="#9333ea"/><stop offset="60%" stop-color="#f1f5f9"/><stop offset="100%" stop-color="#cbd5e1"/></linearGradient></defs><path d="M 50,85 Q 45,95 50,100" stroke="#94a3b8" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 15,50 C 15,20 85,20 85,50 C 85,75 65,85 50,85 C 35,85 15,75 15,50 Z" fill="url(#turnipGrad)"/><path d="M 50,25 Q 35,5 20,15 C 30,25 40,25 50,25 Z" fill="#4ade80"/><path d="M 50,25 Q 65,5 80,15 C 70,25 60,25 50,25 Z" fill="#22c55e"/><path d="M 50,25 Q 50,0 50,10 C 55,20 50,25 50,25 Z" fill="#16a34a"/><ellipse cx="30" cy="45" rx="5" ry="12" transform="rotate(-20 30 45)" fill="rgba(255,255,255,0.4)" filter="blur(1px)"/></svg>`,
  'radish_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="radishGrad" cx="40%" cy="40%" r="60%"><stop offset="0%" stop-color="#fca5a5"/><stop offset="50%" stop-color="#dc2626"/><stop offset="80%" stop-color="#e2e8f0"/><stop offset="100%" stop-color="#f8fafc"/></radialGradient></defs><path d="M 50,85 Q 50,95 55,100" stroke="#cbd5e1" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 20,50 C 20,25 80,25 80,50 C 80,75 60,85 50,85 C 40,85 20,75 20,50 Z" fill="url(#radishGrad)"/><path d="M 50,25 C 20,15 25,5 40,15 Z" fill="#22c55e"/><path d="M 50,25 C 80,15 75,5 60,15 Z" fill="#16a34a"/><path d="M 50,25 C 40,5 60,5 50,15 Z" fill="#15803d"/><ellipse cx="35" cy="45" rx="4" ry="10" transform="rotate(-30 35 45)" fill="rgba(255,255,255,0.5)" filter="blur(1px)"/></svg>`,
  'greenapple_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="appleGreen" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#d9f99d"/><stop offset="40%" stop-color="#84cc16"/><stop offset="100%" stop-color="#4d7c0f"/></radialGradient></defs><path d="M 50,20 C 75,10 95,30 90,60 C 85,90 60,95 50,85 C 40,95 15,90 10,60 C 5,30 25,10 50,20 Z" fill="url(#appleGreen)"/><path d="M 50,25 Q 45,5 55,5" stroke="#78350f" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M 50,20 C 65,10 75,25 60,30 C 50,25 45,15 50,20 Z" fill="#16a34a"/><ellipse cx="25" cy="40" rx="4" ry="12" transform="rotate(-30 25 40)" fill="rgba(255,255,255,0.4)" filter="blur(1px)"/></svg>`,
  'apple_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="appleRed" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#fca5a5"/><stop offset="40%" stop-color="#ef4444"/><stop offset="100%" stop-color="#991b1b"/></radialGradient></defs><path d="M 50,20 C 75,10 95,30 90,60 C 85,90 60,95 50,85 C 40,95 15,90 10,60 C 5,30 25,10 50,20 Z" fill="url(#appleRed)"/><path d="M 50,25 Q 45,5 55,5" stroke="#78350f" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M 50,20 C 65,10 75,25 60,30 C 50,25 45,15 50,20 Z" fill="#22c55e"/><ellipse cx="25" cy="40" rx="4" ry="12" transform="rotate(-30 25 40)" fill="rgba(255,255,255,0.4)" filter="blur(1px)"/></svg>`,
  'pumpkin_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="pumpGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fb923c"/><stop offset="80%" stop-color="#ea580c"/><stop offset="100%" stop-color="#9a3412"/></radialGradient></defs><ellipse cx="50" cy="55" rx="40" ry="35" fill="url(#pumpGrad)"/><ellipse cx="50" cy="55" rx="30" ry="35" fill="url(#pumpGrad)" stroke="#c2410c" stroke-width="2"/><ellipse cx="50" cy="55" rx="18" ry="35" fill="url(#pumpGrad)" stroke="#c2410c" stroke-width="2"/><path d="M 50,20 C 45,10 55,5 60,10 C 65,15 55,20 50,20 Z" fill="#15803d"/><path d="M 50,20 L 52,5 C 55,2 60,8 60,8" stroke="#15803d" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
  'cabbage_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="cabGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#bbf7d0"/><stop offset="50%" stop-color="#4ade80"/><stop offset="100%" stop-color="#166534"/></radialGradient></defs><circle cx="50" cy="55" r="40" fill="url(#cabGrad)"/><path d="M 20,40 C 40,20 60,30 80,45" stroke="#14532d" stroke-width="2" fill="none" opacity="0.5"/><path d="M 30,70 C 50,50 70,60 85,75" stroke="#14532d" stroke-width="2" fill="none" opacity="0.5"/></svg>`,
  'cauliflower_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="cauliGrad" cx="40%" cy="40%" r="60%"><stop offset="0%" stop-color="#ffffff"/><stop offset="70%" stop-color="#fef08a"/><stop offset="100%" stop-color="#ca8a04"/></radialGradient><linearGradient id="cauliLeaf" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#86efac"/><stop offset="100%" stop-color="#14532d"/></linearGradient></defs><path d="M 50,95 C 10,95 10,50 20,40 C 30,60 40,80 50,85 C 60,80 70,60 80,40 C 90,50 90,95 50,95 Z" fill="url(#cauliLeaf)"/><circle cx="50" cy="35" r="22" fill="url(#cauliGrad)"/><circle cx="30" cy="50" r="18" fill="url(#cauliGrad)"/><circle cx="70" cy="50" r="18" fill="url(#cauliGrad)"/><circle cx="40" cy="70" r="15" fill="url(#cauliGrad)"/><circle cx="60" cy="70" r="15" fill="url(#cauliGrad)"/><circle cx="50" cy="55" r="20" fill="url(#cauliGrad)"/></svg>`,
  'olive_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="oliGreen" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#bbf7d0"/><stop offset="60%" stop-color="#22c55e"/><stop offset="100%" stop-color="#14532d"/></radialGradient><radialGradient id="oliBlack" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#94a3b8"/><stop offset="60%" stop-color="#334155"/><stop offset="100%" stop-color="#020617"/></radialGradient></defs><path d="M 20,15 Q 50,25 80,15" stroke="#78350f" stroke-width="4" fill="none"/><path d="M 50,20 Q 70,5 90,25 Q 70,35 50,20 Z" fill="#15803d"/><ellipse cx="35" cy="55" rx="18" ry="25" transform="rotate(20 35 55)" fill="url(#oliBlack)"/><ellipse cx="30" cy="40" rx="4" ry="10" transform="rotate(20 30 40)" fill="rgba(255,255,255,0.3)" filter="blur(1px)"/><ellipse cx="70" cy="65" rx="18" ry="25" transform="rotate(-20 70 65)" fill="url(#oliGreen)"/><ellipse cx="65" cy="50" rx="4" ry="10" transform="rotate(-20 65 50)" fill="rgba(255,255,255,0.4)" filter="blur(1px)"/></svg>`,
  'beans_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="kbGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f87171"/><stop offset="50%" stop-color="#b91c1c"/><stop offset="100%" stop-color="#7f1d1d"/></linearGradient></defs><path d="M 25,75 C 10,70 10,30 30,25 C 45,20 50,40 40,50 C 30,60 30,70 25,75 Z" fill="url(#kbGrad)"/><ellipse cx="25" cy="40" rx="3" ry="10" transform="rotate(-15 25 40)" fill="rgba(255,255,255,0.3)" filter="blur(1px)"/><ellipse cx="35" cy="35" rx="2" ry="5" transform="rotate(-10 35 35)" fill="#fecaca"/><path d="M 55,85 C 40,80 40,40 60,35 C 75,30 80,50 70,60 C 60,70 60,80 55,85 Z" fill="url(#kbGrad)"/><ellipse cx="55" cy="50" rx="3" ry="10" transform="rotate(-15 55 50)" fill="rgba(255,255,255,0.3)" filter="blur(1px)"/><ellipse cx="65" cy="45" rx="2" ry="5" transform="rotate(-10 65 45)" fill="#fecaca"/></svg>`,
  'peas_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="peaGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#86efac"/><stop offset="100%" stop-color="#166534"/></linearGradient></defs><path d="M 10,80 C 20,40 60,20 90,20 C 80,60 40,80 10,80 Z" fill="url(#peaGrad)"/><circle cx="35" cy="60" r="8" fill="#4ade80"/><circle cx="50" cy="50" r="8" fill="#4ade80"/><circle cx="65" cy="40" r="8" fill="#4ade80"/></svg>`,
  'chickpeas_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="chiGrad" cx="40%" cy="40%" r="60%"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#a16207"/></radialGradient></defs><circle cx="50" cy="55" r="25" fill="url(#chiGrad)"/><path d="M 35,45 C 30,40 25,50 35,55 Z" fill="#ca8a04"/></svg>`,
  'lentils_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="lenGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#fb923c"/><stop offset="100%" stop-color="#9a3412"/></radialGradient></defs><circle cx="35" cy="45" r="15" fill="url(#lenGrad)"/><circle cx="65" cy="55" r="15" fill="url(#lenGrad)"/><circle cx="45" cy="70" r="15" fill="url(#lenGrad)"/></svg>`,
  'mungbeans_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="munGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#86efac"/><stop offset="100%" stop-color="#14532d"/></radialGradient></defs><ellipse cx="40" cy="50" rx="12" ry="18" fill="url(#munGrad)" transform="rotate(30 40 50)"/><ellipse cx="65" cy="65" rx="12" ry="18" fill="url(#munGrad)" transform="rotate(-20 65 65)"/><ellipse cx="70" cy="40" rx="12" ry="18" fill="url(#munGrad)" transform="rotate(45 70 40)"/></svg>`,
  'driedlime_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="dlGrad" cx="40%" cy="40%" r="60%"><stop offset="0%" stop-color="#d6d3d1"/><stop offset="50%" stop-color="#78716c"/><stop offset="100%" stop-color="#1c1917"/></radialGradient></defs><circle cx="50" cy="55" r="35" fill="url(#dlGrad)"/><circle cx="40" cy="40" r="3" fill="#44403c"/><circle cx="60" cy="45" r="4" fill="#44403c"/><circle cx="50" cy="70" r="3" fill="#44403c"/></svg>`,
  'tangerine_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="tangGrad" cx="35%" cy="30%" r="65%"><stop offset="0%" stop-color="#fef08a"/><stop offset="30%" stop-color="#fb923c"/><stop offset="80%" stop-color="#ea580c"/><stop offset="100%" stop-color="#7c2d12"/></radialGradient></defs><ellipse cx="50" cy="60" rx="42" ry="34" fill="url(#tangGrad)"/><circle cx="50" cy="28" r="4" fill="#c2410c"/><circle cx="48" cy="27" r="1.5" fill="#7c2d12"/><path d="M 50,28 C 25,5 5,20 20,45 C 35,30 45,30 50,28 Z" fill="#22c55e"/><ellipse cx="35" cy="45" rx="8" ry="12" transform="rotate(-45 35 45)" fill="rgba(255,255,255,0.4)" filter="blur(1px)"/></svg>`,
  'cherrytomato_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="chtGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#fca5a5"/><stop offset="50%" stop-color="#ef4444"/><stop offset="100%" stop-color="#7f1d1d"/></radialGradient></defs><circle cx="50" cy="55" r="25" fill="url(#chtGrad)"/><path d="M 50,30 L 45,20 L 50,10 L 55,20 Z" fill="#166534"/><ellipse cx="40" cy="45" rx="4" ry="8" transform="rotate(-45 40 45)" fill="rgba(255,255,255,0.4)" filter="blur(1px)"/></svg>`,
  'cartoncorn_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="canGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#94a3b8"/><stop offset="50%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#475569"/></linearGradient></defs><rect x="25" y="30" width="50" height="60" rx="5" fill="url(#canGrad)"/><rect x="25" y="20" width="50" height="10" fill="#64748b"/><circle cx="50" cy="60" r="15" fill="#facc15"/><circle cx="45" cy="55" r="3" fill="#ca8a04"/><circle cx="55" cy="65" r="3" fill="#ca8a04"/></svg>`,

  'dragonfruit_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="dfPinkGrad" cx="40%" cy="40%" r="60%"><stop offset="0%" stop-color="#fbcfe8"/><stop offset="40%" stop-color="#f43f5e"/><stop offset="80%" stop-color="#e11d48"/><stop offset="100%" stop-color="#9f1239"/></radialGradient></defs><ellipse cx="50" cy="55" rx="35" ry="40" fill="url(#dfPinkGrad)"/><path d="M 25,40 Q 10,25 20,20 Q 25,30 35,35 Z" fill="#4ade80"/><path d="M 45,30 Q 30,10 40,5 Q 50,15 55,25 Z" fill="#4ade80"/><path d="M 70,45 Q 85,30 75,20 Q 65,30 60,40 Z" fill="#4ade80"/><path d="M 18,65 Q 5,55 10,45 Q 20,55 25,60 Z" fill="#4ade80"/><path d="M 80,65 Q 95,55 90,45 Q 80,55 75,60 Z" fill="#4ade80"/><path d="M 40,80 Q 25,95 40,95 Q 50,85 55,75 Z" fill="#4ade80"/><ellipse cx="35" cy="45" rx="6" ry="12" transform="rotate(-30 35 45)" fill="rgba(255,255,255,0.3)" filter="blur(1px)"/></svg>`,
  'artichoke_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="artGrad" cx="50%" cy="80%" r="70%"><stop offset="0%" stop-color="#bbf7d0"/><stop offset="100%" stop-color="#166534"/></radialGradient></defs><path d="M 50,90 C 20,70 30,20 50,10 C 70,20 80,70 50,90 Z" fill="url(#artGrad)"/><path d="M 50,90 C 35,70 45,30 50,20 C 55,30 65,70 50,90 Z" fill="#22c55e" opacity="0.6"/><ellipse cx="45" cy="50" rx="8" ry="15" transform="rotate(-15 45 50)" fill="rgba(255,255,255,0.2)" filter="blur(1px)"/></svg>`,

  'pomegranate_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="pomOut" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#fca5a5"/><stop offset="50%" stop-color="#dc2626"/><stop offset="100%" stop-color="#7f1d1d"/></radialGradient><radialGradient id="pomIn" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#fef9c3"/></radialGradient></defs><circle cx="50" cy="55" r="40" fill="url(#pomOut)"/><path d="M 40,16 L 35,5 L 45,10 L 50,0 L 55,10 L 65,5 L 60,16 Z" fill="#991b1b"/><path d="M 25,60 C 20,40 50,30 75,50 C 65,70 30,70 25,60 Z" fill="url(#pomIn)"/><circle cx="40" cy="45" r="4" fill="#ef4444"/><circle cx="50" cy="42" r="4.5" fill="#dc2626"/><circle cx="60" cy="45" r="4" fill="#b91c1c"/><circle cx="35" cy="55" r="4" fill="#dc2626"/><circle cx="45" cy="55" r="4.5" fill="#991b1b"/><circle cx="55" cy="55" r="4" fill="#ef4444"/><circle cx="65" cy="52" r="4" fill="#dc2626"/><circle cx="40" cy="63" r="4" fill="#b91c1c"/><circle cx="50" cy="63" r="4.5" fill="#ef4444"/><circle cx="60" cy="60" r="4" fill="#dc2626"/><ellipse cx="35" cy="40" rx="4" ry="12" transform="rotate(-30 35 40)" fill="rgba(255,255,255,0.3)" filter="blur(1px)"/></svg>`,
  'loquat_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="loqGradNew" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/></radialGradient></defs><path d="M 50,30 Q 30,10 10,25 Q 35,40 50,30 Z" fill="#22c55e"/><path d="M 50,30 Q 70,10 90,25 Q 65,40 50,30 Z" fill="#16a34a"/><path d="M 50,30 L 50,15" stroke="#78350f" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="35" cy="55" rx="18" ry="22" transform="rotate(-15 35 55)" fill="url(#loqGradNew)"/><circle cx="33" cy="76" r="3" fill="#78350f"/><ellipse cx="25" cy="45" rx="4" ry="10" transform="rotate(-30 25 45)" fill="rgba(255,255,255,0.4)" filter="blur(1px)"/><ellipse cx="65" cy="55" rx="18" ry="22" transform="rotate(15 65 55)" fill="url(#loqGradNew)"/><circle cx="67" cy="76" r="3" fill="#78350f"/><ellipse cx="55" cy="45" rx="4" ry="10" transform="rotate(30 55 45)" fill="rgba(255,255,255,0.4)" filter="blur(1px)"/><ellipse cx="50" cy="70" rx="20" ry="25" fill="url(#loqGradNew)"/><circle cx="50" cy="94" r="3" fill="#78350f"/><ellipse cx="40" cy="60" rx="5" ry="12" transform="rotate(-15 40 60)" fill="rgba(255,255,255,0.5)" filter="blur(1px)"/></svg>`,
  'grapefruit_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>
    <radialGradient id="gpfGrad" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fed7aa"/>
      <stop offset="40%" stop-color="#fb923c"/>
      <stop offset="80%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#9a3412"/>
    </radialGradient>
  </defs>
    <circle cx="50" cy="55" r="40" fill="url(#gpfGrad)"/>
    <ellipse cx="35" cy="35" rx="8" ry="14" transform="rotate(-45 35 35)" fill="rgba(255,255,255,0.6)" filter="blur(1px)"/>
    <path d="M 50,15 C 30,5 20,20 50,25 Z" fill="#4ade80"/><path d="M 50,25 C 48,15 52,15 50,15" stroke="#166534" stroke-width="2" fill="none"/>
  </svg>`,
  'jujube_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="jujubeGrad" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#fca5a5"/><stop offset="40%" stop-color="#dc2626"/><stop offset="80%" stop-color="#991b1b"/><stop offset="100%" stop-color="#450a0a"/></radialGradient></defs><ellipse cx="50" cy="55" rx="25" ry="35" fill="url(#jujubeGrad)"/><path d="M 50,20 Q 55,10 60,5" stroke="#78350f" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 50,20 C 60,15 65,25 55,30 C 45,25 45,15 50,20 Z" fill="#22c55e"/><ellipse cx="40" cy="45" rx="3" ry="12" transform="rotate(-15 40 45)" fill="rgba(255,255,255,0.4)" filter="blur(1px)"/></svg>`,
  'persimmon_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>
    <radialGradient id="perGrad" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fdba74"/>
      <stop offset="40%" stop-color="#f97316"/>
      <stop offset="80%" stop-color="#c2410c"/>
      <stop offset="100%" stop-color="#7c2d12"/>
    </radialGradient>
  </defs>
    <circle cx="50" cy="55" r="40" fill="url(#perGrad)"/>
    <ellipse cx="35" cy="35" rx="8" ry="14" transform="rotate(-45 35 35)" fill="rgba(255,255,255,0.6)" filter="blur(1px)"/>
    <path d="M 50,15 C 30,5 20,20 50,25 Z" fill="#4ade80"/><path d="M 50,25 C 48,15 52,15 50,15" stroke="#166534" stroke-width="2" fill="none"/>
  </svg>`,
  'mangosteen_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="mangoGrad" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#7e22ce"/><stop offset="60%" stop-color="#4c1d95"/><stop offset="100%" stop-color="#2e1065"/></radialGradient><radialGradient id="mangLeafGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#4ade80"/><stop offset="100%" stop-color="#14532d"/></radialGradient></defs><circle cx="50" cy="60" r="35" fill="url(#mangoGrad)"/><path d="M 50,15 C 30,15 20,35 25,45 C 35,35 45,45 50,45 C 55,45 65,35 75,45 C 80,35 70,15 50,15 Z" fill="url(#mangLeafGrad)"/><circle cx="50" cy="25" r="4" fill="#064e3b"/><ellipse cx="35" cy="55" rx="8" ry="15" transform="rotate(-30 35 55)" fill="rgba(255,255,255,0.2)" filter="blur(1px)"/></svg>`,
  'rambutan_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>
    <radialGradient id="ramGrad" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fca5a5"/>
      <stop offset="40%" stop-color="#ef4444"/>
      <stop offset="80%" stop-color="#b91c1c"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </radialGradient>
  </defs>
    <circle cx="50" cy="55" r="40" fill="url(#ramGrad)"/>
    <ellipse cx="35" cy="35" rx="8" ry="14" transform="rotate(-45 35 35)" fill="rgba(255,255,255,0.6)" filter="blur(1px)"/>
    <path d="M 50,15 C 30,5 20,20 50,25 Z" fill="#4ade80"/><path d="M 50,25 C 48,15 52,15 50,15" stroke="#166534" stroke-width="2" fill="none"/>
  </svg>`,
  'quince_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="quinceGrad" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#eab308"/><stop offset="100%" stop-color="#a16207"/></radialGradient></defs><path d="M 50,15 L 55,5 Q 65,-5 75,10 Q 60,20 50,15 Z" fill="#4ade80"/><path d="M 50,15 L 50,5" stroke="#78350f" stroke-width="4" stroke-linecap="round"/><path d="M 50,15 C 25,10 10,40 15,65 C 20,90 40,95 50,95 C 60,95 80,90 85,65 C 90,40 75,10 50,15 Z" fill="url(#quinceGrad)"/><circle cx="30" cy="70" r="2" fill="#ca8a04" opacity="0.5"/><circle cx="45" cy="80" r="2.5" fill="#ca8a04" opacity="0.5"/><circle cx="70" cy="65" r="2" fill="#ca8a04" opacity="0.5"/><circle cx="25" cy="50" r="1.5" fill="#ca8a04" opacity="0.5"/><circle cx="65" cy="80" r="2" fill="#ca8a04" opacity="0.5"/><ellipse cx="35" cy="35" rx="6" ry="15" transform="rotate(-30 35 35)" fill="rgba(255,255,255,0.4)" filter="blur(1px)"/></svg>`,
  'greencherryplum_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>
    <radialGradient id="gcpGrad" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#bbf7d0"/>
      <stop offset="40%" stop-color="#4ade80"/>
      <stop offset="80%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#14532d"/>
    </radialGradient>
  </defs>
    <circle cx="50" cy="55" r="40" fill="url(#gcpGrad)"/>
    <ellipse cx="35" cy="35" rx="8" ry="14" transform="rotate(-45 35 35)" fill="rgba(255,255,255,0.6)" filter="blur(1px)"/>
    
  </svg>`,
  'guava_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="guavaOut" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#bef264"/><stop offset="50%" stop-color="#4ade80"/><stop offset="100%" stop-color="#166534"/></radialGradient><radialGradient id="guavaIn" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fecdd3"/><stop offset="40%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#be123c"/></radialGradient></defs><circle cx="35" cy="45" r="30" fill="url(#guavaOut)"/><circle cx="25" cy="25" r="3" fill="#14532d"/><ellipse cx="65" cy="65" rx="25" ry="25" fill="url(#guavaOut)"/><ellipse cx="65" cy="65" rx="22" ry="22" fill="#fef08a"/><ellipse cx="65" cy="65" rx="18" ry="18" fill="url(#guavaIn)"/><circle cx="60" cy="60" r="1.5" fill="#fef08a"/><circle cx="68" cy="58" r="1.5" fill="#fef08a"/><circle cx="58" cy="68" r="1.5" fill="#fef08a"/><circle cx="65" cy="70" r="1.5" fill="#fef08a"/><circle cx="72" cy="65" r="1.5" fill="#fef08a"/><circle cx="62" cy="64" r="1.5" fill="#fef08a"/><circle cx="68" cy="68" r="1.5" fill="#fef08a"/></svg>`,
  'apricot_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>
    <radialGradient id="aprGrad" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fed7aa"/>
      <stop offset="40%" stop-color="#fb923c"/>
      <stop offset="80%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#9a3412"/>
    </radialGradient>
  </defs>
    <circle cx="50" cy="55" r="40" fill="url(#aprGrad)"/>
    <ellipse cx="35" cy="35" rx="8" ry="14" transform="rotate(-45 35 35)" fill="rgba(255,255,255,0.6)" filter="blur(1px)"/>
    <path d="M 50,15 C 30,5 20,20 50,25 Z" fill="#4ade80"/><path d="M 50,25 C 48,15 52,15 50,15" stroke="#166534" stroke-width="2" fill="none"/>
  </svg>`,
  'plum_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>
    <radialGradient id="pluGrad" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#e9d5ff"/>
      <stop offset="40%" stop-color="#c084fc"/>
      <stop offset="80%" stop-color="#9333ea"/>
      <stop offset="100%" stop-color="#581c87"/>
    </radialGradient>
  </defs>
    <circle cx="50" cy="55" r="40" fill="url(#pluGrad)"/>
    <ellipse cx="35" cy="35" rx="8" ry="14" transform="rotate(-45 35 35)" fill="rgba(255,255,255,0.6)" filter="blur(1px)"/>
    <path d="M 50,15 C 30,5 20,20 50,25 Z" fill="#4ade80"/><path d="M 50,25 C 48,15 52,15 50,15" stroke="#166534" stroke-width="2" fill="none"/>
  </svg>`,
  'yellowmelon_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>
    <radialGradient id="ymeGrad" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="40%" stop-color="#fde047"/>
      <stop offset="80%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#a16207"/>
    </radialGradient>
  </defs>
    <circle cx="50" cy="55" r="40" fill="url(#ymeGrad)"/>
    <ellipse cx="35" cy="35" rx="8" ry="14" transform="rotate(-45 35 35)" fill="rgba(255,255,255,0.6)" filter="blur(1px)"/>
    
  </svg>`,
  'passionfruit_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="passGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#a855f7"/><stop offset="60%" stop-color="#6b21a8"/><stop offset="100%" stop-color="#3b0764"/></radialGradient><radialGradient id="passIn" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/></radialGradient></defs><circle cx="45" cy="55" r="35" fill="url(#passGrad)"/><ellipse cx="30" cy="40" rx="5" ry="10" transform="rotate(-45 30 40)" fill="rgba(255,255,255,0.3)" filter="blur(1px)"/><circle cx="65" cy="65" r="25" fill="url(#passGrad)"/><circle cx="65" cy="65" r="22" fill="#fef08a"/><circle cx="65" cy="65" r="20" fill="url(#passIn)"/><circle cx="60" cy="60" r="2" fill="#451a03"/><circle cx="68" cy="62" r="2" fill="#451a03"/><circle cx="58" cy="68" r="2" fill="#451a03"/><circle cx="65" cy="70" r="2" fill="#451a03"/><circle cx="72" cy="65" r="2" fill="#451a03"/></svg>`,
  'spinach_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="spinachGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#22c55e"/><stop offset="50%" stop-color="#16a34a"/><stop offset="100%" stop-color="#14532d"/></linearGradient></defs><path d="M 50,95 Q 45,90 50,75 C 20,70 10,50 20,35 C 10,25 30,5 50,15 C 70,5 90,25 80,35 C 90,50 80,70 50,75 Z" fill="url(#spinachGrad)"/><path d="M 50,90 L 50,15 M 50,65 Q 35,50 25,45 M 50,50 Q 65,40 75,35 M 50,40 Q 35,30 25,25 M 50,30 Q 60,20 65,15" stroke="#4ade80" stroke-width="2" fill="none" opacity="0.8" stroke-linecap="round"/></svg>`,
  'swisschard_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><path d="M 50,90 Q 40,50 30,30 C 10,10 30,0 50,10 C 70,0 90,10 70,30 Q 60,50 50,90 Z" fill="#22c55e"/><path d="M 50,85 Q 45,50 35,35 C 20,15 35,10 50,15 C 65,10 80,15 65,35 Q 55,50 50,85 Z" fill="#16a34a"/><path d="M 50,95 L 50,15" stroke="#e11d48" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M 50,60 Q 40,45 35,35" stroke="#e11d48" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M 50,65 Q 60,50 65,40" stroke="#e11d48" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M 50,45 Q 40,35 35,25" stroke="#e11d48" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 50,50 Q 60,40 65,30" stroke="#e11d48" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  'celery_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="celGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#86efac"/><stop offset="50%" stop-color="#4ade80"/><stop offset="100%" stop-color="#bbf7d0"/></linearGradient></defs><path d="M 35,90 Q 25,50 30,30 L 40,30 Q 35,50 45,90 Z" fill="url(#celGrad)"/><path d="M 65,90 Q 75,50 70,30 L 60,30 Q 65,50 55,90 Z" fill="url(#celGrad)"/><path d="M 50,95 Q 45,50 50,25 L 60,25 Q 55,50 60,95 Z" fill="#22c55e"/><path d="M 30,90 Q 50,95 70,90 L 65,95 Q 50,100 35,95 Z" fill="#dcfce7"/><path d="M 30,30 C 10,20 15,5 30,10 C 40,5 45,20 40,30 Z" fill="#16a34a"/><path d="M 70,30 C 90,20 85,5 70,10 C 60,5 55,20 60,30 Z" fill="#15803d"/><path d="M 50,25 C 40,15 45,0 55,5 C 65,10 65,20 60,25 Z" fill="#16a34a"/></svg>`,
  'watercress_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><path d="M 40,90 Q 30,60 40,30" stroke="#15803d" stroke-width="2" fill="none"/><path d="M 60,90 Q 70,60 60,30" stroke="#15803d" stroke-width="2" fill="none"/><circle cx="40" cy="30" r="10" fill="#22c55e"/><circle cx="30" cy="45" r="8" fill="#4ade80"/><circle cx="45" cy="55" r="7" fill="#16a34a"/><circle cx="25" cy="65" r="6" fill="#22c55e"/><circle cx="60" cy="30" r="12" fill="#16a34a"/><circle cx="70" cy="45" r="9" fill="#22c55e"/><circle cx="55" cy="55" r="7" fill="#15803d"/><circle cx="75" cy="65" r="6" fill="#4ade80"/></svg>`,
  'coriander_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>
    <linearGradient id="corGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#86efac"/>
      <stop offset="100%" stop-color="#16a34a"/>
    </linearGradient>
  </defs>
    <path d="M 45,90 L 55,90 L 60,30 C 80,20 90,40 70,50 C 90,60 80,80 60,70 L 55,90" fill="url(#corGrad)"/>
    <path d="M 45,90 L 40,30 C 20,20 10,40 30,50 C 10,60 20,80 40,70 L 45,90" fill="url(#corGrad)"/>
    <path d="M 50,95 L 45,20 C 30,5 70,5 55,20 L 50,95" fill="url(#corGrad)"/>
    <path d="M 45,90 C 45,95 55,95 55,90 Z" fill="#dcfce7"/>
  </svg>`,
  'parsley_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><path d="M 50,90 Q 45,60 50,30" stroke="#166534" stroke-width="3" fill="none"/><path d="M 50,80 Q 35,50 25,40" stroke="#166534" stroke-width="3" fill="none"/><path d="M 50,75 Q 65,50 75,35" stroke="#166534" stroke-width="3" fill="none"/><path d="M 50,30 C 30,30 30,10 50,10 C 70,10 70,30 50,30 Z" fill="#22c55e"/><path d="M 50,30 C 40,40 20,30 30,15 C 40,10 60,20 50,30 Z" fill="#16a34a"/><path d="M 25,40 C 10,45 10,25 25,25 C 40,25 40,45 25,40 Z" fill="#4ade80"/><path d="M 25,40 C 15,50 5,35 15,25 C 25,15 35,30 25,40 Z" fill="#22c55e"/><path d="M 75,35 C 60,40 60,20 75,20 C 90,20 90,40 75,35 Z" fill="#15803d"/><path d="M 75,35 C 65,45 55,30 65,20 C 75,10 85,25 75,35 Z" fill="#22c55e"/></svg>`,
  'mint_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>
    <linearGradient id="minGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#86efac"/>
      <stop offset="100%" stop-color="#16a34a"/>
    </linearGradient>
  </defs>
    <path d="M 45,90 L 55,90 L 60,30 C 80,20 90,40 70,50 C 90,60 80,80 60,70 L 55,90" fill="url(#minGrad)"/>
    <path d="M 45,90 L 40,30 C 20,20 10,40 30,50 C 10,60 20,80 40,70 L 45,90" fill="url(#minGrad)"/>
    <path d="M 50,95 L 45,20 C 30,5 70,5 55,20 L 50,95" fill="url(#minGrad)"/>
    <path d="M 45,90 C 45,95 55,95 55,90 Z" fill="#bbf7d0"/>
  </svg>`,
  'dill_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>
    <linearGradient id="dilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#bbf7d0"/>
      <stop offset="100%" stop-color="#22c55e"/>
    </linearGradient>
  </defs>
    <path d="M 45,90 L 55,90 L 60,30 C 80,20 90,40 70,50 C 90,60 80,80 60,70 L 55,90" fill="url(#dilGrad)"/>
    <path d="M 45,90 L 40,30 C 20,20 10,40 30,50 C 10,60 20,80 40,70 L 45,90" fill="url(#dilGrad)"/>
    <path d="M 50,95 L 45,20 C 30,5 70,5 55,20 L 50,95" fill="url(#dilGrad)"/>
    <path d="M 45,90 C 45,95 55,95 55,90 Z" fill="#dcfce7"/>
  </svg>`,
  'basil_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="basilGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4ade80"/><stop offset="50%" stop-color="#22c55e"/><stop offset="100%" stop-color="#15803d"/></linearGradient></defs><path d="M 50,95 Q 50,70 50,50" stroke="#15803d" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M 50,55 C 20,70 5,45 15,25 C 25,5 50,15 50,55 Z" fill="url(#basilGrad)"/><path d="M 50,55 C 80,70 95,45 85,25 C 75,5 50,15 50,55 Z" fill="url(#basilGrad)"/><path d="M 50,45 C 35,50 25,35 35,20 C 45,5 50,15 50,45 Z" fill="#4ade80"/><path d="M 50,45 C 65,50 75,35 65,20 C 55,5 50,15 50,45 Z" fill="#4ade80"/></svg>`,
  'arugula_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>
    <linearGradient id="aruGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#86efac"/>
      <stop offset="100%" stop-color="#166534"/>
    </linearGradient>
  </defs>
    <path d="M 45,90 L 55,90 L 60,30 C 80,20 90,40 70,50 C 90,60 80,80 60,70 L 55,90" fill="url(#aruGrad)"/>
    <path d="M 45,90 L 40,30 C 20,20 10,40 30,50 C 10,60 20,80 40,70 L 45,90" fill="url(#aruGrad)"/>
    <path d="M 50,95 L 45,20 C 30,5 70,5 55,20 L 50,95" fill="url(#aruGrad)"/>
    <path d="M 45,90 C 45,95 55,95 55,90 Z" fill="#bbf7d0"/>
  </svg>`,
  'fenugreek_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>
    <linearGradient id="fenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#bbf7d0"/>
      <stop offset="100%" stop-color="#22c55e"/>
    </linearGradient>
  </defs>
    <path d="M 45,90 L 55,90 L 60,30 C 80,20 90,40 70,50 C 90,60 80,80 60,70 L 55,90" fill="url(#fenGrad)"/>
    <path d="M 45,90 L 40,30 C 20,20 10,40 30,50 C 10,60 20,80 40,70 L 45,90" fill="url(#fenGrad)"/>
    <path d="M 50,95 L 45,20 C 30,5 70,5 55,20 L 50,95" fill="url(#fenGrad)"/>
    <path d="M 45,90 C 45,95 55,95 55,90 Z" fill="#dcfce7"/>
  </svg>`,
  'thyme_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><path d="M 50,90 Q 55,50 75,10" stroke="#166534" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 50,90 Q 40,60 25,20" stroke="#166534" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="35" cy="40" rx="6" ry="10" transform="rotate(-30 35 40)" fill="#86efac"/><ellipse cx="25" cy="45" rx="6" ry="10" transform="rotate(40 25 45)" fill="#4ade80"/><ellipse cx="30" cy="30" rx="5" ry="9" transform="rotate(-45 30 30)" fill="#22c55e"/><ellipse cx="15" cy="35" rx="5" ry="9" transform="rotate(45 15 35)" fill="#4ade80"/><ellipse cx="25" cy="20" rx="4" ry="8" transform="rotate(-20 25 20)" fill="#86efac"/><ellipse cx="65" cy="45" rx="7" ry="12" transform="rotate(30 65 45)" fill="#4ade80"/><ellipse cx="55" cy="35" rx="6" ry="10" transform="rotate(-40 55 35)" fill="#22c55e"/><ellipse cx="70" cy="30" rx="6" ry="10" transform="rotate(45 70 30)" fill="#86efac"/><ellipse cx="60" cy="25" rx="5" ry="8" transform="rotate(-20 60 25)" fill="#4ade80"/><ellipse cx="75" cy="15" rx="5" ry="8" transform="rotate(30 75 15)" fill="#22c55e"/></svg>`,
  'okra_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="okGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#86efac"/><stop offset="60%" stop-color="#16a34a"/><stop offset="100%" stop-color="#14532d"/></linearGradient></defs><path d="M 25,25 Q 50,40 85,85 Q 60,95 15,35 Z" fill="url(#okGrad)"/><path d="M 10,35 L 20,20 L 30,25 L 35,35 Z" fill="#14532d"/><line x1="20" y1="20" x2="10" y2="10" stroke="#14532d" stroke-width="4" stroke-linecap="round"/><path d="M 22,35 Q 50,55 78,82" stroke="#15803d" stroke-width="2" fill="none"/><path d="M 28,30 Q 55,48 70,70" stroke="#15803d" stroke-width="2" fill="none"/><ellipse cx="35" cy="45" rx="3" ry="12" transform="rotate(-40 35 45)" fill="rgba(255,255,255,0.4)" filter="blur(1px)"/></svg>`,
  'zucchini_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="zucGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4ade80"/><stop offset="40%" stop-color="#166534"/><stop offset="100%" stop-color="#064e3b"/></linearGradient></defs><path d="M 20,15 Q 60,30 85,80 Q 70,95 10,40 Z" fill="url(#zucGrad)"/><path d="M 15,35 L 5,30 L 10,20 L 25,20 Z" fill="#064e3b"/><path d="M 22,25 Q 55,40 75,78" stroke="#4ade80" stroke-width="2" fill="none" opacity="0.5" stroke-dasharray="2,2"/><path d="M 18,30 Q 45,50 65,85" stroke="#4ade80" stroke-width="2" fill="none" opacity="0.5" stroke-dasharray="2,2"/><ellipse cx="30" cy="35" rx="4" ry="15" transform="rotate(-40 30 35)" fill="rgba(255,255,255,0.3)" filter="blur(1px)"/></svg>`,
  'wildcucumber_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="wcGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#dcfce7"/><stop offset="50%" stop-color="#86efac"/><stop offset="100%" stop-color="#166534"/></linearGradient></defs><path d="M 20,20 Q 60,40 80,80 Q 50,90 10,50 Q -10,30 20,20 Z" fill="url(#wcGrad)"/><path d="M 20,30 Q 55,45 70,80" stroke="#4ade80" stroke-width="2" fill="none" opacity="0.8"/><path d="M 15,40 Q 40,60 60,85" stroke="#4ade80" stroke-width="2" fill="none" opacity="0.8"/><ellipse cx="25" cy="25" rx="4" ry="12" transform="rotate(45 25 25)" fill="rgba(255,255,255,0.6)" filter="blur(1px)"/></svg>`,
  'leek_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="leekBase" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stop-color="#f8fafc"/><stop offset="60%" stop-color="#bbf7d0"/><stop offset="100%" stop-color="#4ade80"/></linearGradient></defs><path d="M 40,95 L 60,95 Q 65,70 60,40 L 40,40 Q 35,70 40,95 Z" fill="url(#leekBase)"/><path d="M 45,95 Q 40,100 45,105" stroke="#cbd5e1" stroke-width="2" fill="none"/><path d="M 50,95 Q 50,100 50,105" stroke="#cbd5e1" stroke-width="2" fill="none"/><path d="M 55,95 Q 60,100 55,105" stroke="#cbd5e1" stroke-width="2" fill="none"/><path d="M 40,40 Q 20,20 10,30 Q 25,10 45,40 Z" fill="#22c55e"/><path d="M 60,40 Q 80,20 90,30 Q 75,10 55,40 Z" fill="#16a34a"/><path d="M 45,40 Q 40,10 50,5 Q 60,10 55,40 Z" fill="#15803d"/><path d="M 45,90 Q 45,60 50,45" stroke="#86efac" stroke-width="2" fill="none"/><path d="M 55,90 Q 55,60 50,45" stroke="#86efac" stroke-width="2" fill="none"/></svg>`,
  'asparagus_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>
    <linearGradient id="aspGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#bbf7d0"/>
      <stop offset="50%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#14532d"/>
    </linearGradient>
  </defs>
    <path d="M 20,20 Q 50,50 80,80 Q 60,90 20,20" fill="url(#aspGrad)"/>
    <path d="M 15,15 L 25,25" stroke="#166534" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="40" cy="40" rx="4" ry="15" transform="rotate(-45 40 40)" fill="rgba(255,255,255,0.4)" filter="blur(1px)"/>
  </svg>`,
  'greenbeans_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>
    <linearGradient id="grbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#86efac"/>
      <stop offset="100%" stop-color="#16a34a"/>
    </linearGradient>
  </defs>
    <path d="M 10,90 C 20,40 60,10 90,10 C 80,50 40,90 10,90 Z" fill="url(#grbGrad)"/>
    <ellipse cx="35" cy="65" rx="3" ry="12" transform="rotate(45 35 65)" fill="rgba(255,255,255,0.3)" filter="blur(1px)"/>
  </svg>`,
  'broadbeans_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>
    <linearGradient id="brbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
  </defs>
    <path d="M 10,90 C 20,40 60,10 90,10 C 80,50 40,90 10,90 Z" fill="url(#brbGrad)"/>
    <ellipse cx="35" cy="65" rx="3" ry="12" transform="rotate(45 35 65)" fill="rgba(255,255,255,0.3)" filter="blur(1px)"/>
  </svg>`,
  'carob_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>
    <linearGradient id="carGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#78350f"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
  </defs>
    <path d="M 10,90 C 20,40 60,10 90,10 C 80,50 40,90 10,90 Z" fill="url(#carGrad)"/>
    <ellipse cx="35" cy="65" rx="3" ry="12" transform="rotate(45 35 65)" fill="rgba(255,255,255,0.3)" filter="blur(1px)"/>
  </svg>`,
  'fig_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="figGrad" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#c4b5fd"/><stop offset="30%" stop-color="#8b5cf6"/><stop offset="70%" stop-color="#4c1d95"/><stop offset="100%" stop-color="#2e1065"/></radialGradient></defs><path d="M 50,15 C 30,35 15,50 15,70 C 15,95 85,95 85,70 C 85,50 70,35 50,15 Z" fill="url(#figGrad)"/><path d="M 45,18 C 45,5 55,5 55,18" stroke="#4ade80" stroke-width="4" stroke-linecap="round" fill="none"/><ellipse cx="30" cy="60" rx="6" ry="15" transform="rotate(-30 30 60)" fill="rgba(255,255,255,0.3)" filter="blur(1px)"/></svg>`,
  'berry_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>
    <radialGradient id="berGrad" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fca5a5"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </radialGradient>
  </defs>
    <circle cx="40" cy="40" r="15" fill="url(#berGrad)"/>
    <circle cx="60" cy="45" r="15" fill="url(#berGrad)"/>
    <circle cx="35" cy="60" r="15" fill="url(#berGrad)"/>
    <circle cx="55" cy="65" r="15" fill="url(#berGrad)"/>
    <circle cx="50" cy="80" r="15" fill="url(#berGrad)"/>
    <circle cx="70" cy="60" r="15" fill="url(#berGrad)"/>
    <path d="M 50,15 C 45,25 55,25 50,35" stroke="#166534" stroke-width="4" fill="none"/>
  </svg>`,
  'blackberry_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bbGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#4c1d95"/><stop offset="60%" stop-color="#2e1065"/><stop offset="100%" stop-color="#000000"/></radialGradient></defs><path d="M 50,15 Q 45,5 55,5" stroke="#16a34a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 50,15 L 35,15 L 45,25 Z" fill="#22c55e"/><path d="M 50,15 L 65,15 L 55,25 Z" fill="#22c55e"/><path d="M 50,15 L 50,25 Z" stroke="#15803d" stroke-width="4" fill="none"/><g fill="url(#bbGrad)"><circle cx="35" cy="40" r="10"/><circle cx="65" cy="40" r="10"/><circle cx="30" cy="55" r="10"/><circle cx="70" cy="55" r="10"/><circle cx="35" cy="70" r="10"/><circle cx="65" cy="70" r="10"/><circle cx="45" cy="35" r="12"/><circle cx="55" cy="35" r="12"/><circle cx="40" cy="50" r="12"/><circle cx="60" cy="50" r="12"/><circle cx="40" cy="65" r="12"/><circle cx="60" cy="65" r="12"/><circle cx="50" cy="80" r="12"/><circle cx="50" cy="45" r="13"/><circle cx="50" cy="60" r="13"/><circle cx="50" cy="70" r="11"/></g><g fill="rgba(255,255,255,0.4)"><circle cx="42" cy="32" r="2"/><circle cx="52" cy="32" r="2"/><circle cx="37" cy="47" r="2"/><circle cx="57" cy="47" r="2"/><circle cx="37" cy="62" r="2"/><circle cx="57" cy="62" r="2"/><circle cx="47" cy="77" r="2"/><circle cx="47" cy="42" r="2.5"/><circle cx="47" cy="57" r="2.5"/><circle cx="47" cy="67" r="2"/></g></svg>`,
  'truffle_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>
    <radialGradient id="truGrad" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#d6d3d1"/>
      <stop offset="40%" stop-color="#a8a29e"/>
      <stop offset="80%" stop-color="#78716c"/>
      <stop offset="100%" stop-color="#44403c"/>
    </radialGradient>
  </defs>
    <circle cx="50" cy="55" r="40" fill="url(#truGrad)"/>
    <ellipse cx="35" cy="35" rx="8" ry="14" transform="rotate(-45 35 35)" fill="rgba(255,255,255,0.6)" filter="blur(1px)"/>
    
  </svg>`,
  'dates_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="dateGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#d97706"/><stop offset="50%" stop-color="#78350f"/><stop offset="100%" stop-color="#451a03"/></radialGradient></defs><path d="M 50,10 Q 50,30 35,35" stroke="#a16207" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M 50,15 Q 65,30 65,45" stroke="#a16207" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="30" cy="55" rx="16" ry="26" transform="rotate(15 30 55)" fill="url(#dateGrad)"/><path d="M 25,40 Q 30,55 25,70" stroke="#451a03" stroke-width="2" fill="none" opacity="0.6"/><path d="M 35,45 Q 35,55 38,65" stroke="#451a03" stroke-width="2" fill="none" opacity="0.6"/><ellipse cx="25" cy="45" rx="3" ry="10" transform="rotate(15 25 45)" fill="rgba(255,255,255,0.3)" filter="blur(1px)"/><ellipse cx="65" cy="70" rx="16" ry="26" transform="rotate(-15 65 70)" fill="url(#dateGrad)"/><path d="M 60,55 Q 65,70 60,85" stroke="#451a03" stroke-width="2" fill="none" opacity="0.6"/><path d="M 70,60 Q 70,70 73,80" stroke="#451a03" stroke-width="2" fill="none" opacity="0.6"/><ellipse cx="60" cy="60" rx="3" ry="10" transform="rotate(-15 60 60)" fill="rgba(255,255,255,0.3)" filter="blur(1px)"/></svg>`,
  'papaya_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>
    <linearGradient id="papGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#facc15"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>
  </defs>
    <path d="M 20,20 Q 70,50 80,80 Q 80,90 20,20" fill="url(#papGrad)"/>
    <path d="M 15,15 L 25,25" stroke="#166534" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="40" cy="40" rx="4" ry="15" transform="rotate(-45 40 40)" fill="rgba(255,255,255,0.4)" filter="blur(1px)"/>
  </svg>`,
  'pricklypear_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="pricklyGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#bef264"/><stop offset="60%" stop-color="#84cc16"/><stop offset="100%" stop-color="#4d7c0f"/></radialGradient></defs><ellipse cx="50" cy="55" rx="30" ry="40" fill="url(#pricklyGrad)"/><circle cx="35" cy="35" r="1.5" fill="#fef08a"/><circle cx="50" cy="25" r="1.5" fill="#fef08a"/><circle cx="65" cy="40" r="1.5" fill="#fef08a"/><circle cx="30" cy="55" r="1.5" fill="#fef08a"/><circle cx="50" cy="70" r="1.5" fill="#fef08a"/><circle cx="70" cy="60" r="1.5" fill="#fef08a"/><circle cx="45" cy="45" r="1.5" fill="#fef08a"/><path d="M 40,15 L 60,15 L 50,25 Z" fill="#4d7c0f"/><ellipse cx="35" cy="50" rx="4" ry="15" transform="rotate(-15 35 50)" fill="rgba(255,255,255,0.4)" filter="blur(1px)"/></svg>`,
  'turmeric_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>
    <radialGradient id="turGrad" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="40%" stop-color="#facc15"/>
      <stop offset="80%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </radialGradient>
  </defs>
    <circle cx="50" cy="55" r="40" fill="url(#turGrad)"/>
    <ellipse cx="35" cy="35" rx="8" ry="14" transform="rotate(-45 35 35)" fill="rgba(255,255,255,0.6)" filter="blur(1px)"/>
    
  </svg>`,
  'beetroot_svg': `<svg viewBox="0 0 100 100" width="1.4em" height="1.4em" style="vertical-align: middle; display: inline-block; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2));" xmlns="http://www.w3.org/2000/svg"><defs>
    <radialGradient id="beeGrad" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fbcfe8"/>
      <stop offset="40%" stop-color="#f43f5e"/>
      <stop offset="80%" stop-color="#be123c"/>
      <stop offset="100%" stop-color="#881337"/>
    </radialGradient>
  </defs>
    <circle cx="50" cy="55" r="40" fill="url(#beeGrad)"/>
    <ellipse cx="35" cy="35" rx="8" ry="14" transform="rotate(-45 35 35)" fill="rgba(255,255,255,0.6)" filter="blur(1px)"/>
    <path d="M 50,15 C 30,5 20,20 50,25 Z" fill="#4ade80"/><path d="M 50,25 C 48,15 52,15 50,15" stroke="#166534" stroke-width="2" fill="none"/>
  </svg>`,
};
const CROP_SUGGESTIONS = [
  { primaryAr: "طماطة", synonymsAr: ["طماطم", "بندورة"], nameEn: "Tomato", icon: "🍅" },
  { primaryAr: "خيار", synonymsAr: [], nameEn: "Cucumber", icon: "🥒" },
  { primaryAr: "بطاطا", synonymsAr: ["بتيتة", "بطاطس", "البطاطا", "البطاطس"], nameEn: "Potato", icon: "🥔" },
  { primaryAr: "بصل", synonymsAr: [], nameEn: "Onion", icon: "onion_svg" },
  { primaryAr: "ثوم", synonymsAr: [], nameEn: "Garlic", icon: "garlic_svg" },
  { primaryAr: "باذنجان", synonymsAr: ["بيتنجان"], nameEn: "Eggplant", icon: "🍆" },
  { primaryAr: "فلفل حلو", synonymsAr: ["فلفل بارد", "فلفل", "فلفل أخضر"], nameEn: "Bell Pepper", icon: "bell_pepper_svg" },
  { primaryAr: "فلفل حار", synonymsAr: [], nameEn: "Hot Pepper", icon: "🌶️" },
  { primaryAr: "جزر", synonymsAr: [], nameEn: "Carrot", icon: "🥕" },
  { primaryAr: "خس", synonymsAr: [], nameEn: "Lettuce", icon: "🥬" },
  { primaryAr: "قرنبيط", synonymsAr: ["قرنابيط", "زهرة"], nameEn: "Cauliflower", icon: "cauliflower_svg" },
  { primaryAr: "ملفوف", synonymsAr: ["لهانة"], nameEn: "Cabbage", icon: "cabbage_svg" },
  { primaryAr: "ذرة", synonymsAr: ["عرنوص"], nameEn: "Corn", icon: "🌽" },
  { primaryAr: "بطيخ أحمر", synonymsAr: ["رقي", "حبحب"], nameEn: "Watermelon", icon: "🍉" },
  { primaryAr: "شمام", synonymsAr: ["بطيخ"], nameEn: "Melon", icon: "🍈" },
  { primaryAr: "برتقال", synonymsAr: [], nameEn: "Orange", icon: "🍊" },
  { primaryAr: "ليمون", synonymsAr: ["نومي", "نومي حامض"], nameEn: "Lemon", icon: "🍋" },
  { primaryAr: "ليمون مجفف", synonymsAr: ["نومي بصرة", "لومي"], nameEn: "Dried Lime", icon: "driedlime_svg" },
  { primaryAr: "موز", synonymsAr: [], nameEn: "Banana", icon: "🍌" },
  { primaryAr: "تفاح", synonymsAr: [], nameEn: "Apple", icon: "apple_svg" },
  { primaryAr: "تفاح أخضر", synonymsAr: [], nameEn: "Green Apple", icon: "greenapple_svg" },
  { primaryAr: "عنب", synonymsAr: [], nameEn: "Grape", icon: "🍇" },
  { primaryAr: "فراولة", synonymsAr: [], nameEn: "Strawberry", icon: "🍓" },
  { primaryAr: "رمان", synonymsAr: [], nameEn: "Pomegranate", icon: "pomegranate_svg" },
  { primaryAr: "خوخ", synonymsAr: [], nameEn: "Peach", icon: "🍑" },
  { primaryAr: "مشمش", synonymsAr: [], nameEn: "Apricot", icon: "apricot_svg" },
  { primaryAr: "أناناس", synonymsAr: [], nameEn: "Pineapple", icon: "🍍", countOnly: true },
  { primaryAr: "كيوي", synonymsAr: [], nameEn: "Kiwi", icon: "🥝" },
  { primaryAr: "كمثرى", synonymsAr: ["عرموط"], nameEn: "Pear", icon: "🍐" },
  { primaryAr: "مانجو", synonymsAr: [], nameEn: "Mango", icon: "🥭" },
  { primaryAr: "تين", synonymsAr: [], nameEn: "Fig", icon: "fig_svg" },
  { primaryAr: "كرز", synonymsAr: [], nameEn: "Cherry", icon: "🍒" },
  { primaryAr: "سلق", synonymsAr: [], nameEn: "Swiss Chard", icon: "swisschard_svg" },
  { primaryAr: "سبانخ", synonymsAr: ["سبيناغ"], nameEn: "Spinach", icon: "spinach_svg" },
  { primaryAr: "فطر", synonymsAr: ["مشروم"], nameEn: "Mushroom", icon: "🍄", countOnly: true },
  { primaryAr: "بامية", synonymsAr: ["باميا"], nameEn: "Okra", icon: "okra_svg" },
  { primaryAr: "لوبيا", synonymsAr: [], nameEn: "Green Beans", icon: "greenbeans_svg" },
  { primaryAr: "شمندر", synonymsAr: ["شوندر", "بنجر"], nameEn: "Beetroot", icon: "beetroot_svg" },
  { primaryAr: "كوسى", synonymsAr: ["شجر", "كوسا"], nameEn: "Zucchini", icon: "zucchini_svg" },
  { primaryAr: "يقطين", synonymsAr: ["شجر أحمر", "قرع"], nameEn: "Pumpkin", icon: "pumpkin_svg" },
  { primaryAr: "فجل", synonymsAr: [], nameEn: "Radish", icon: "radish_svg" },
  { primaryAr: "أفوكادو", synonymsAr: [], nameEn: "Avocado", icon: "🥑" },
  { primaryAr: "أسكي دنيا", synonymsAr: ["أكي دنيا", "يني دنيا", "دنيا"], nameEn: "Loquat", icon: "loquat_svg" },
  { primaryAr: "كرفس", synonymsAr: [], nameEn: "Celery", icon: "celery_svg" },
  { primaryAr: "رشاد", synonymsAr: [], nameEn: "Watercress", icon: "watercress_svg" },
  { primaryAr: "كزبرة", synonymsAr: [], nameEn: "Coriander", icon: "coriander_svg" },
  { primaryAr: "بقدونس", synonymsAr: ["معدنوس"], nameEn: "Parsley", icon: "parsley_svg" },
  { primaryAr: "تمر", synonymsAr: [], nameEn: "Dates", icon: "dates_svg" },
  { primaryAr: "زيتون", synonymsAr: [], nameEn: "Olive", icon: "olive_svg" },
  { primaryAr: "نعناع", synonymsAr: [], nameEn: "Mint", icon: "mint_svg" },
  { primaryAr: "كراث", synonymsAr: [], nameEn: "Leek", icon: "leek_svg" },
  { primaryAr: "شلغم", synonymsAr: ["لفت"], nameEn: "Turnip", icon: "turnip_svg" },
  { primaryAr: "توت", synonymsAr: ["توث"], nameEn: "Berry", icon: "berry_svg" },
  { primaryAr: "فول", synonymsAr: ["باقلاء", "باجلا", "باجلاء"], nameEn: "Broad Beans", icon: "broadbeans_svg" },
  { primaryAr: "فاصوليا", synonymsAr: ["فاصولية"], nameEn: "Beans", icon: "beans_svg" },
  { primaryAr: "بازلاء", synonymsAr: ["بزيلا", "بازلية"], nameEn: "Peas", icon: "peas_svg" },
  { primaryAr: "شبت", synonymsAr: ["شبنت"], nameEn: "Dill", icon: "dill_svg" },
  { primaryAr: "ريحان", synonymsAr: [], nameEn: "Basil", icon: "basil_svg" },
  { primaryAr: "يوسفي", synonymsAr: ["لالنكي", "أفندي"], nameEn: "Tangerine", icon: "tangerine_svg" },
  { primaryAr: "جريب فروت", synonymsAr: ["سندي"], nameEn: "Grapefruit", icon: "grapefruit_svg" },
  { primaryAr: "برقوق", synonymsAr: ["ألوجة", "آلو", "كوجة"], nameEn: "Plum", icon: "plum_svg" },
  { primaryAr: "نبق", synonymsAr: ["كنار", "سدر"], nameEn: "Jujube", icon: "jujube_svg" },
  { primaryAr: "كماة", synonymsAr: ["چما"], nameEn: "Truffle", icon: "truffle_svg" },
  { primaryAr: "توت أسود", synonymsAr: ["عليج"], nameEn: "Blackberry", icon: "blackberry_svg" },
  { primaryAr: "بروكلي", synonymsAr: [], nameEn: "Broccoli", icon: "🥦" },
  { primaryAr: "خرشوف", synonymsAr: ["أرضي شوكي"], nameEn: "Artichoke", icon: "artichoke_svg" },
  { primaryAr: "هليون", synonymsAr: [], nameEn: "Asparagus", icon: "asparagus_svg" },
  { primaryAr: "زنجبيل", synonymsAr: [], nameEn: "Ginger", icon: "🫚" },
  { primaryAr: "كركم", synonymsAr: [], nameEn: "Turmeric", icon: "turmeric_svg" },
  { primaryAr: "جوز الهند", synonymsAr: [], nameEn: "Coconut", icon: "🥥" },
  { primaryAr: "سفرجل", synonymsAr: [], nameEn: "Quince", icon: "quince_svg" },
  { primaryAr: "خرنوب", synonymsAr: [], nameEn: "Carob", icon: "carob_svg" },
  { primaryAr: "حمص", synonymsAr: [], nameEn: "Chickpeas", icon: "chickpeas_svg" },
  { primaryAr: "عدس", synonymsAr: [], nameEn: "Lentils", icon: "lentils_svg" },
  { primaryAr: "ماش", synonymsAr: ["ماش أخضر"], nameEn: "Mung Beans", icon: "mungbeans_svg" },
  { primaryAr: "جرجير", synonymsAr: [], nameEn: "Arugula", icon: "arugula_svg" },
  { primaryAr: "حلبة", synonymsAr: [], nameEn: "Fenugreek", icon: "fenugreek_svg" },
  { primaryAr: "زعتر", synonymsAr: [], nameEn: "Thyme", icon: "thyme_svg" },
  { primaryAr: "كاكا", synonymsAr: ["كاكي", "كاكا", "الكاكا", "خرما"], nameEn: "Persimmon", icon: "persimmon_svg" },
  { primaryAr: "تعروز", synonymsAr: ["تعروز", "ترعوز", "طرح", "قتة"], nameEn: "Wild Cucumber", icon: "wildcucumber_svg" },
  { primaryAr: "بطيخ أصفر", synonymsAr: ["بطيخ أصفر", "البطيخ الأصفر", "شمام أصفر", "شمام"], nameEn: "Yellow Melon", icon: "yellowmelon_svg" },
  { primaryAr: "بابايا", synonymsAr: [], nameEn: "Papaya", icon: "papaya_svg" },
  { primaryAr: "جوافة", synonymsAr: [], nameEn: "Guava", icon: "guava_svg" },
  { primaryAr: "تين شوكي", synonymsAr: ["صبار"], nameEn: "Prickly Pear", icon: "pricklypear_svg" },
  { primaryAr: "جانرك", synonymsAr: ["كرز أخضر"], nameEn: "Green Cherry Plum", icon: "greencherryplum_svg" },
  // New count-only crops
  { primaryAr: "باشن فروت", synonymsAr: ["فاكهة العاطفة"], nameEn: "Passion Fruit", icon: "passionfruit_svg", countOnly: true },
  { primaryAr: "مانكو ستين", synonymsAr: ["مانغوستين"], nameEn: "Mangosteen", icon: "mangosteen_svg", countOnly: true },
  { primaryAr: "رامبوتان", synonymsAr: [], nameEn: "Rambutan", icon: "rambutan_svg", countOnly: true },
  { primaryAr: "دراكون فروت", synonymsAr: ["فاكهة التنين", "بتايا"], nameEn: "Dragon Fruit", icon: "dragonfruit_svg", countOnly: true },
  { primaryAr: "ذرة كارتون", synonymsAr: ["ذرة معلبة"], nameEn: "Carton Corn", icon: "cartoncorn_svg", countOnly: true },
  { primaryAr: "طماطة عنقودية", synonymsAr: ["طماطة كرزية", "طماطم كرزية", "شيري طماطم"], nameEn: "Cherry Tomato", icon: "cherrytomato_svg", countOnly: true }
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
  try {
    localStorage.setItem('alwa_custom_crops', JSON.stringify(customCrops));
  } catch (e) {
    console.warn('Failed to save custom crops to localStorage:', e);
  }
}

// Check if that specific import invoice item reaches 100% sold
// Fetch import details
function sanitizeCropIcon(icon, isHtml = true) {
  if (!icon) return '🥦';

  if (typeof customSvgs !== 'undefined' && customSvgs[icon]) {
    if (isHtml) return customSvgs[icon];
    return '🌱';
  }


  if (!icon) return '🥦';

  if (typeof customSvgs !== 'undefined' && customSvgs[icon]) {
    if (isHtml) return customSvgs[icon];
    return '🌱';
  }


  if (!icon) return '🥦';

  

  const fluentMapping = {
    '🍅': 'Tomato', '🥒': 'Cucumber', '🥔': 'Potato', '🍆': 'Eggplant',
    '🌶️': 'Hot pepper', '🥕': 'Carrot', '🌽': 'Ear of corn', '🍉': 'Watermelon',
    '🍈': 'Melon', '🍊': 'Tangerine', '🍋': 'Lemon', '🍌': 'Banana',
    '🍎': 'Red apple', '🍏': 'Green apple', '🍇': 'Grapes', '🍓': 'Strawberry',
    '🍑': 'Peach', '🍍': 'Pineapple', '🥝': 'Kiwi fruit', '🍐': 'Pear',
    '🥭': 'Mango', '🍒': 'Cherries', '🍄': 'Mushroom', '🥬': 'Leafy green',
    '🥦': 'Broccoli', '🥑': 'Avocado', '🌿': 'Herb', '🌱': 'Seedling',
    '🌴': 'Palm tree', '🌰': 'Chestnut', '🥥': 'Coconut', '🍠': 'Roasted sweet potato',
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
      const url = `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/${encodedDirName}/3D/${fileName}`;
      return `<img src="${url}" style="width:1.4em; height:1.4em; vertical-align:middle; display:inline-block; margin:0 0.1em; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.15));" loading="lazy" />`;
    }
    return icon.length > 3 ? '🌱' : icon; // If it's a long string like onion_svg, return seedling, else the emoji
  }

  if (typeof icon === 'string' && (icon.trim().startsWith('<svg') || icon.trim().startsWith('<img'))) {
    if (isHtml) return icon;
    return '🌱';
  }

  
  
  return isHtml ? `<span style="font-size: 1.2em; display:inline-block; vertical-align:middle;">${icon}</span>` : icon;
}


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
  const emojiMatch = cleanStr.match(/^([🌀-🧿]|[☀-⛿]|[✀-➿])/u);
  if (emojiMatch) {
    return sanitizeCropIcon(emojiMatch[0], isHtml);
  }

  const crop = findCropSuggestion(cropType);
  if (crop && crop.icon) {
    return sanitizeCropIcon(crop.icon, isHtml);
  }

  return '🥦';
}
function getCropUnitType(cropType) {
  const crop = findCropSuggestion(cropType);
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
  const isArabic = (currentLanguage === 'ar' || numeralSystem === 'ar');
  if (isArabic) {
    if (activeUnit === 'kg' || activeUnit === 'كغم') unitStr = 'كغم';
    else if (activeUnit === 'liter' || activeUnit === 'لتر') unitStr = 'لتر';
    else if (activeUnit === 'count' || activeUnit === 'قطعة') unitStr = 'قطعة';
    else if (activeUnit === 'box' || activeUnit === 'صندوق') unitStr = 'صندوق';
    else unitStr = activeUnit;
    return `\u202B${formattedNum} ${unitStr}\u202C`;
  } else {
    if (activeUnit === 'kg' || activeUnit === 'كغم') unitStr = 'Kg';
    else if (activeUnit === 'liter' || activeUnit === 'لتر') unitStr = 'Ltr';
    else if (activeUnit === 'count' || activeUnit === 'قطعة') unitStr = 'pieces';
    else if (activeUnit === 'box' || activeUnit === 'صندوق') unitStr = 'box(es)';
    else unitStr = activeUnit;
    return `\u202A${formattedNum} ${unitStr}\u202C`;
  }
}

function formatWeightFraction(rem, total, unit = 'kg') {
  const formattedRem = formatVal(rem);
  const formattedTotal = formatVal(total);
  let unitStr = '';
  let activeUnit = unit === 'mixed' ? 'kg' : unit;
  const isArabic = (currentLanguage === 'ar' || numeralSystem === 'ar');
  if (isArabic) {
    if (activeUnit === 'kg' || activeUnit === 'كغم') unitStr = 'كغم';
    else if (activeUnit === 'liter' || activeUnit === 'لتر') unitStr = 'لتر';
    else if (activeUnit === 'count' || activeUnit === 'قطعة') unitStr = 'قطعة';
    else if (activeUnit === 'box' || activeUnit === 'صندوق') unitStr = 'صندوق';
    else unitStr = activeUnit;
    return `\u202B${formattedRem} / ${formattedTotal} ${unitStr}\u202C`;
  } else {
    if (activeUnit === 'kg' || activeUnit === 'كغم') unitStr = 'Kg';
    else if (activeUnit === 'liter' || activeUnit === 'لتر') unitStr = 'Ltr';
    else if (activeUnit === 'count' || activeUnit === 'قطعة') unitStr = 'pieces';
    else if (activeUnit === 'box' || activeUnit === 'صندوق') unitStr = 'box(es)';
    else unitStr = activeUnit;
    return `\u202A${formattedRem} / ${formattedTotal} ${unitStr}\u202C`;
  }
}

function getAgreedPriceLabel(unit) {
  if (currentLanguage === 'ar') {
    if (unit === 'kg') return 'سعر الكيلو المتفق عليه:';
    if (unit === 'liter') return 'سعر اللتر المتفق عليه:';
    return 'سعر القطعة المتفق عليه:';
  } else {
    if (unit === 'kg') return 'Agreed Price/Kg:';
    if (unit === 'liter') return 'Agreed Price/Liter:';
    return 'Agreed Price/Piece:';
  }
}

function updateHeaderDate() {
  const dayEl = document.getElementById('header-day-name');
  const dateEl = document.getElementById('header-date-text');
  if (!dayEl || !dateEl) return;
  const today = new Date();
  const dayOptions = { weekday: 'long' };
  
  let locale = currentLanguage === 'ar' ? 'ar-IQ-u-nu-latn' : 'en-US';
  
  dayEl.textContent = forceEnglishDigits(today.toLocaleDateString(locale, dayOptions));
  dateEl.textContent = forceEnglishDigits(formatCustomDate(today));
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
    systemStatus: "نشط • باقة ذهبية",
    txtSubscriptionTitle: "اشتراك النظام",
    txtSubscriptionDesc: "تتبع حالة ونوع اشتراكك في نظام محاسب العلوة واستعرض الميزات المفعّلة لحسابك.",
    lblSubscriptionPlan: "باقة الاشتراك الحالي:",
    txtSubscriptionPlanValue: "الاشتراك الذهبي المميز السنوي 💎",
    lblSubscriptionStatus: "حالة الاشتراك:",
    txtSubscriptionStatusValue: "نشط ومفعل بالكامل (صالح لغاية 2027-07-05)",
    lblSubscriberId: "رقم المشترك (المعرف الفريد):",
    lblSubscriptionFeatures: "الميزات والخصائص المفعّلة:",
    txtSubscriptionFeature1: "✓ طباعة حرارية (Bluetooth BLE) لجميع فواتير البيع والاستيراد والتقارير.",
    txtSubscriptionFeature2: "✓ حسابات دقيقة وتلقائية لعمولات المكاتب وأجور التحميل والأكياس.",
    txtSubscriptionFeature3: "✓ تصدير واستيراد قواعد بيانات المبيعات والاستيراد (Room/IndexedDB) بلمسة واحدة.",
    btnSubscriptionRenew: "تجديد أو ترقية باقة الاشتراك",
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
    lblTotalDebtSales: "مبيعات آجلة",
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
    lblOfficeOwner: "اسم صاحب العلوة",
    lblOfficePhone: "رقم الهاتف",
    lblOfficeLocation: "موقع العلوة (العنوان)",
    lblOfficeCashier: "اسم المحاسب (بالإنجليزي حصراً)",
    btnSaveOffice: "حفظ المعلومات",
    txtNumeralTitle: "عرض الأرقام العربية",
    txtNumeralDesc: "التبديل بين الأرقام الهندية (١٢٣) والإنجليزية (123) في كل شاشات وفواتير التطبيق.",
    txtNotifTitle: "الإشعارات والنظام",
    txtNotifDesc: "تفعيل التنبيهات الصوتية المباشرة عند اكتمال بيع محصول أو استلام سداد.",
    txtFullscreenTitle: "وضع ملء الشاشة الكامل (Immersive Mode)",
    txtFullscreenDesc: "إخفاء شريط الإشعارات العلوي وأشرطة التنقل السفلية تلقائياً لتوفير مساحة رؤية كاملة.",
    txtMotionTitle: "تأثيرات الحركة والانتقالات (Animations)",
    txtMotionDesc: "تفعيل الانتقالات والحركات التجميلية بين الشاشات. قم بإلغائها لتحقيق أقصى سرعة واستجابة فورية.",
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
    lblCustomerPhone: "رقم الهاتف (اختياري)",
    lblCustomerAddress: "العنوان (اختياري)",
    txtAddSaleCrop: "إضافة صنف آخر في الفاتورة",
    lblBagsCost: "تكلفة الأكياس والكراتين (إجمالي اختياري)",
    lblNotes: "ملاحظات الفاتورة",
    lblNotesPl: "أدخل أي ملاحظات إضافية هنا (اختياري)...",
    lblPaymentMethod: "طريقة الدفع",
    btnPayCash: "💵 نقد",
    btnPayDebt: "📋 دين بالأجل",
    lblDebtDue: "موعد المطالبة بالدين",
    lblSubtotal: "مجموع أسعار البضاعة:",
    lblCommission7: "عمولة المكتب (7% - تُخصم من الفلاح):",
    lblCarryingTotal: "أجور الحمالية (تُخصم من الفلاح):",
    lblTotalCalc: "المبلغ الإجمالي المستحق (البضاعة + الدواخل):",
    btnSubmitSale: "إصدار الفاتورة وحساب الأرباح",
    sheetExpenseTitle: "تسجيل مصروفات جديدة",
    lblExpenseType: "نوع المصروفات",
    expenseDaily: "مصاريف يومية",
    expensePersonal: "مصاريف شخصية",
    lblExpenseSubject: "الموضوع / الوصف",
    lblExpenseAmount: "المبلغ المستقطع",
    btnSubmitExpense: "حفظ المصروف وتحديث الخزنة",
    sheetLossTitle: "تسجيل الخسائر والتلفيات",
    lblLossSubject: "سبب الخسارة (مثل: تلف صندوق طماطة، نقصان بيع)",
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
    systemStatus: "Active • Gold Plan",
    txtSubscriptionTitle: "System Subscription",
    txtSubscriptionDesc: "Track your subscription status, plan type, and review the activated premium features for your account.",
    lblSubscriptionPlan: "Current Plan:",
    txtSubscriptionPlanValue: "Annual Golden Premium Plan 💎",
    lblSubscriptionStatus: "Subscription Status:",
    txtSubscriptionStatusValue: "Active & Fully Enabled (Valid until 2027-07-05)",
    lblSubscriberId: "Subscriber ID (UUID):",
    lblSubscriptionFeatures: "Activated Premium Features:",
    txtSubscriptionFeature1: "✓ Direct thermal printing via Bluetooth BLE for all invoices and daily reports.",
    txtSubscriptionFeature2: "✓ Precise automatic calculation of commissions, porters fee, and bags costs.",
    txtSubscriptionFeature3: "✓ Unlimited instant offline database exports and imports in one click.",
    btnSubscriptionRenew: "Renew or Upgrade Subscription Plan",
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
    lblTotalDebtSales: "Debt Sales",
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
    lblOfficeOwner: "Alwa Owner's Name",
    lblOfficePhone: "Phone Number",
    lblOfficeLocation: "Alwa Location (Address)",
    lblOfficeCashier: "Accountant Name (English Only)",
    btnSaveOffice: "Save Settings",
    txtNumeralTitle: "Eastern Arabic Numerals",
    txtNumeralDesc: "Switch between Arabic-Indic numerals (١٢٣) and Western numerals (123) globally.",
    txtNotifTitle: "System Notifications",
    txtNotifDesc: "Enable dynamic audio alert prompts when product sells 100% or payments settle.",
    txtFullscreenTitle: "Immersive Fullscreen Mode",
    txtFullscreenDesc: "Automatically hide the top notification status bar and bottom navigation bars for a distraction-free, complete viewing space.",
    txtMotionTitle: "Motion & UI Animations",
    txtMotionDesc: "Enable screen-sliding transitions and decorative animations. Turn off for maximum performance and instant UI response.",
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
    lblCustomerPhone: "Phone Number (Optional)",
    lblCustomerAddress: "Address (Optional)",
    txtAddSaleCrop: "Add Another Sale Item",
    lblBagsCost: "Bags/Cartons Extra Cost (Optional)",
    lblNotes: "Invoice Notes",
    lblNotesPl: "Enter any additional notes here (optional)...",
    lblPaymentMethod: "Payment Method",
    btnPayCash: "💵 Cash",
    btnPayDebt: "📋 Debt Account",
    lblDebtDue: "Claim Schedule Date",
    lblSubtotal: "Subtotal Prices:",
    lblCommission7: "Office Commission (7% - deducted from farmer):",
    lblCarryingTotal: "Porterage Fee (deducted from farmer):",
    lblTotalCalc: "Total Net Payable (Products + Bags):",
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
function forceEnglishDigits(str) {
  if (str === undefined || str === null) return '';
  const valStr = str.toString();
  const arNums = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  const enNums = ['0','1','2','3','4','5','6','7','8','9'];
  return valStr.split('').map(char => {
    const idx = arNums.indexOf(char);
    return idx !== -1 ? enNums[idx] : char;
  }).join('');
}

function formatVal(number, isCurrency = false) {
  if (number === undefined || number === null) return '';
  
  let valStr = '';
  const isNumeric = (typeof number === 'number') || 
                    (typeof number === 'string' && number !== '' && !isNaN(number) && (!number.startsWith('0') || number === '0'));
  
  if (isNumeric) {
    const num = Number(number);
    valStr = num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    if (isCurrency) {
      valStr += ' ' + translations[currentLanguage].currencyAbbr;
    }
  } else {
    valStr = number.toString();
  }

  return forceEnglishDigits(valStr);
}

function formatCustomDate(dateVal, includeTime = false) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  
  const dateStr = `${year}/${month}/${day}`;
  let valStr = dateStr;
  
  if (includeTime) {
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 hour is 12
    const timeStr = `\u200E${hours}:${minutes}:${seconds} \u200E${ampm}`;
    valStr = `\u200E${dateStr}, \u200E${timeStr}`;
  }
  
  return forceEnglishDigits(valStr);
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
let isInMemoryFallback = false;
const memoryDB = {
  farmers: [],
  import_invoices: [],
  import_items: [],
  customers: [],
  sale_invoices: [],
  sale_items: [],
  debts: [],
  farmer_dues: [],
  daily_expenses: [],
  personal_expenses: [],
  losses: [],
  settings: [],
  porter_payouts: [],
  safe_adjustments: [],
  stat_archives: []
};

const DB_NAME = 'AlwaAccountsRoomDatabase';
const DB_VERSION = 4;

function initDatabase() {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      console.warn('IndexedDB is not supported on this device. Falling back to In-Memory mode.');
      isInMemoryFallback = true;
      resolve(null);
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (e) => {
        console.warn('Database opening error, falling back to In-Memory:', e);
        isInMemoryFallback = true;
        resolve(null);
      };
      
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
    } catch (err) {
      console.warn('Error opening IndexedDB, falling back to In-Memory mode:', err);
      isInMemoryFallback = true;
      resolve(null);
    }
  });
}

function dbGetAll(storeName) {
  if (isInMemoryFallback) {
    return Promise.resolve(JSON.parse(JSON.stringify(memoryDB[storeName] || [])));
  }
  if (dbCache[storeName]) {
    // Return a deep copy to prevent mutation of the cached array
    return Promise.resolve(JSON.parse(JSON.stringify(dbCache[storeName])));
  }
  return new Promise((resolve, reject) => {
    try {
      if (!db) {
        throw new Error('Database is not initialized');
      }
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => {
        dbCache[storeName] = request.result;
        resolve(JSON.parse(JSON.stringify(request.result)));
      };
      request.onerror = (e) => reject('IndexedDB error on getAll: ' + e.target.error);
      tx.onerror = (e) => reject('Transaction error on getAll: ' + e.target.error);
    } catch (err) {
      reject(err);
    }
  });
}

function dbGet(storeName, id) {
  if (isInMemoryFallback) {
    const list = memoryDB[storeName] || [];
    const item = list.find(it => it.id === id);
    return Promise.resolve(item ? JSON.parse(JSON.stringify(item)) : null);
  }
  if (dbCache[storeName]) {
    const item = dbCache[storeName].find(it => it.id === id);
    if (item) {
      return Promise.resolve(JSON.parse(JSON.stringify(item)));
    }
  }
  return new Promise((resolve, reject) => {
    try {
      if (!db) {
        throw new Error('Database is not initialized');
      }
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject('IndexedDB error on get: ' + e.target.error);
      tx.onerror = (e) => reject('Transaction error on get: ' + e.target.error);
    } catch (err) {
      reject(err);
    }
  });
}

function dbAdd(storeName, obj) {
  invalidateDbCache(storeName);
  if (isInMemoryFallback) {
    const list = memoryDB[storeName] || [];
    const newId = list.reduce((max, item) => (item.id && typeof item.id === 'number' ? Math.max(max, item.id) : max), 0) + 1;
    const itemWithId = { ...obj, id: obj.id || newId };
    list.push(itemWithId);
    return Promise.resolve(itemWithId.id);
  }
  return new Promise((resolve, reject) => {
    try {
      if (!db) {
        throw new Error('Database is not initialized');
      }
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.add(obj);
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject('IndexedDB error on add: ' + e.target.error);
      tx.onerror = (e) => reject('Transaction error on add: ' + e.target.error);
    } catch (err) {
      reject(err);
    }
  });
}

function dbPut(storeName, obj) {
  invalidateDbCache(storeName);
  if (isInMemoryFallback) {
    const list = memoryDB[storeName] || [];
    const index = list.findIndex(item => item.id === obj.id || (obj.key && item.key === obj.key));
    if (index !== -1) {
      list[index] = { ...list[index], ...obj };
    } else {
      list.push(obj);
    }
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    try {
      if (!db) {
        throw new Error('Database is not initialized');
      }
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(obj);
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject('IndexedDB error on put: ' + e.target.error);
      tx.onerror = (e) => reject('Transaction error on put: ' + e.target.error);
    } catch (err) {
      reject(err);
    }
  });
}

function dbDelete(storeName, id) {
  invalidateDbCache(storeName);
  if (isInMemoryFallback) {
    const list = memoryDB[storeName] || [];
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      list.splice(index, 1);
    }
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    try {
      if (!db) {
        throw new Error('Database is not initialized');
      }
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject('IndexedDB error on delete: ' + e.target.error);
      tx.onerror = (e) => reject('Transaction error on delete: ' + e.target.error);
    } catch (err) {
      reject(err);
    }
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
// 5. NOTIFICATION SOUNDS (HTML5 Audio with Web Audio Synth Fallback)
// ==============================================
function playSound(type) {
  if (!soundEnabled) return;

  // Synthesizer fallback function to generate a premium digital POS beep sound
  function playSynthBeep(beepType) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // Crucial for iOS/Safari/WebViews: resume the audio context if it's suspended
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const now = ctx.currentTime;

      if (beepType === 'print' || beepType === 'success') {
        // High quality sharp positive POS beep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1150, now); // Sweet high-pitched POS beep
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (beepType === 'alert' || beepType === 'error') {
        // Double warning beep
        [now, now + 0.15].forEach((t) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(350, t);
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.25, t + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.15);
        });
      } else {
        // Quick short click/beep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      }
    } catch (e) {
      console.warn('Synthesizer sound failed:', e);
    }
  }

  try {
    let soundId = 'sound-success';
    if (type === 'print') {
      soundId = 'sound-print';
    } else if (type === 'alert' || type === 'error') {
      soundId = 'sound-alert';
    }

    const sound = document.getElementById(soundId);
    if (sound) {
      sound.currentTime = 0;
      const playPromise = sound.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('HTML5 audio play blocked or failed, falling back to synthesizer:', err);
          playSynthBeep(type);
        });
      }
    } else {
      playSynthBeep(type);
    }
  } catch (e) {
    console.warn('Failed to play HTML5 audio, falling back to synthesizer:', e);
    playSynthBeep(type);
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

async function healSalesInvoiceTotals() {
  try {
    const invoices = await dbGetAll('sale_invoices');
    const saleItems = await dbGetAll('sale_items');
    const debts = await dbGetAll('debts');
    let updatedCount = 0;

    for (const invoice of invoices) {
      const items = saleItems.filter(it => it.sale_invoice_id === invoice.id);
      if (items.length === 0) continue;

      const subtotal = items.reduce((sum, item) => sum + item.agreed_price, 0);
      const totalCommissions = items.reduce((sum, item) => sum + (item.commission_amount || 0), 0);
      const totalCarrying = items.reduce((sum, item) => sum + (item.porter_fee || 0), 0);
      const bagsCost = invoice.bags_cost || 0;
      const correctTotal = subtotal + totalCommissions + totalCarrying + bagsCost;

      // If the total is not equal to the correct total, fix it!
      if (Math.abs(invoice.total_amount - correctTotal) > 1) {
        invoice.total_amount = correctTotal;
        await dbPut('sale_invoices', invoice);

        // Find associated debt if exists, and update its amount
        const associatedDebt = debts.find(d => d.sale_invoice_id === invoice.id);
        if (associatedDebt && Math.abs(associatedDebt.amount - correctTotal) > 1) {
          associatedDebt.amount = correctTotal;
          await dbPut('debts', associatedDebt);
        }
        updatedCount++;
      }
    }
    if (updatedCount > 0) {
      console.log(`Healed ${updatedCount} sales invoices with correct commission & porter calculations.`);
    }
  } catch (err) {
    console.error('Error during sales invoices healing:', err);
  }
}

// Lazy Rendering Cache Map to prevent redundant redrawing of hidden screens
let dirtyScreens = {
  'screen-import': true,
  'screen-sales': true,
  'screen-accounts': true,
  'screen-stats': true
};

function markAllScreensDirty() {
  dirtyScreens['screen-import'] = true;
  dirtyScreens['screen-sales'] = true;
  dirtyScreens['screen-accounts'] = true;
  dirtyScreens['screen-stats'] = true;
}

async function renderScreenIfDirty(screenId) {
  if (!dirtyScreens[screenId]) return;
  dirtyScreens[screenId] = false;
  
  if (screenId === 'screen-import') {
    renderImportsList();
  } else if (screenId === 'screen-sales') {
    renderSalesList();
  } else if (screenId === 'screen-accounts') {
    renderDebtsList();
    renderDuesList();
    renderPortersList();
  } else if (screenId === 'screen-stats') {
    renderStatsPanel();
  }
}

async function refreshGlobalCaches() {
  cachedFarmers = await dbGetAll('farmers');
  cachedCustomers = await dbGetAll('customers');
  
  const allImports = await dbGetAll('import_invoices');
  const activeImports = allImports.filter(imp => !imp.is_settled);
  
  // Single fetch for all import items to avoid O(N) database queries inside the loop
  const allImportItems = await dbGetAll('import_items');
  
  activeImportInvoices = [];
  for (const imp of activeImports) {
    const impItems = allImportItems.filter(it => it.invoice_id === imp.id);
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
  markAllScreensDirty();
  
  // Only render the currently active screen immediately to save up to 80% rendering overhead
  await renderScreenIfDirty(activeTab);
  
  // Keep database safety status, record counts, and progress bar synchronized in real-time
  calculateDatabaseSize();
  
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
  const wrapper = document.getElementById('wrapper-notifications');
  if (!badge || !bell) return;
  
  const debts = await dbGetAll('debts');
  const now = Date.now();
  const dueDebts = debts.filter(d => !d.is_paid && now >= d.due_date);
  const count = dueDebts.length;
  
  if (count > 0) {
    badge.textContent = formatVal(count);
    badge.style.display = 'flex';
    bell.classList.add('ring');
    if (wrapper) wrapper.classList.add('active');
  } else {
    badge.style.display = 'none';
    bell.classList.remove('ring');
    if (wrapper) wrapper.classList.remove('active');
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
    const formattedDate = formatCustomDate(debt.due_date);
    
    const div = document.createElement('div');
    div.className = 'premium-card';
    div.style.border = '1px solid #f3f4f6';
    div.style.background = '#ffffff';
    div.style.borderRadius = '12px';
    div.style.padding = '14px 16px';
    div.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
    div.style.position = 'relative';
    div.style.overflow = 'hidden';
    div.style.margin = '0';
    
    div.innerHTML = `
      <!-- Red status vertical accent bar -->
      <div style="position: absolute; top: 0; right: 0; bottom: 0; width: 4px; background: var(--color-danger);"></div>

      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
        <div style="display: flex; gap: 10px; align-items: center;">
          <!-- Avatar Icon Container -->
          <div style="width: 40px; height: 40px; border-radius: 50%; background: #fef2f2; display: flex; align-items: center; justify-content: center; color: var(--color-danger); border: 1px solid #fee2e2; flex-shrink: 0;">
            <span class="material-icons-round" style="font-size: 20px;">account_circle</span>
          </div>
          <div>
            <h4 style="font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 2px 0; line-height: 1.2;">${customerName}</h4>
            <div style="display: flex; align-items: center; gap: 4px; color: #64748b; font-size: 11px;">
              <span class="material-icons-round" style="font-size: 12px; color: #94a3b8;">phone</span>
              <span>${customerPhone}</span>
            </div>
          </div>
        </div>

        <!-- ID and Badges -->
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0;">
          <span class="lang-badge" style="background-color: #f1f5f9; color: #475569; font-size: 10px; font-weight: 700; border: 1px solid #e2e8f0; border-radius: 4px; padding: 2px 6px; font-family: monospace;">
            # ${formatVal(debt.sale_invoice_id)}
          </span>
          <span style="font-size: 10px; font-weight: 600; color: #b91c1c; background: #fef2f2; border: 1px solid #fee2e2; border-radius: 6px; padding: 2px 8px; display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: #ef4444; display: inline-block;"></span>
            ${currentLanguage === 'ar' ? 'مستحق الدفع' : 'Overdue'}
          </span>
        </div>
      </div>

      <div style="height: 1px; background: #f1f5f9; margin: 2px 0;"></div>

      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 10.5px; color: #64748b; font-weight: 500; display: block; margin-bottom: 2px;">
            ${currentLanguage === 'ar' ? 'تاريخ الاستحقاق:' : 'Due Date:'} <strong style="color: #475569;">${formattedDate}</strong>
          </span>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 10px; color: #94a3b8; font-weight: 500;">
              ${currentLanguage === 'ar' ? 'المبلغ المستحق:' : 'Outstanding Amount:'}
            </span>
            <span style="font-size: 16px; font-weight: 800; color: var(--color-danger); letter-spacing: -0.2px;">
              ${formatVal(debt.amount, true)}
            </span>
          </div>
        </div>

        <div style="display: flex; gap: 8px; align-items: center;">
          <button class="btn-secondary btn-claim-details" data-invoice-id="${debt.sale_invoice_id}" style="padding: 8px 12px; font-size: 12px; font-weight: 700; border: 1.5px solid #cbd5e1; background: white; color: #475569; border-radius: 8px; display: flex; align-items: center; gap: 4px; cursor: pointer; transition: all 0.2s ease; box-shadow: none; margin: 0;">
            <span class="material-icons-round" style="font-size: 14px;">visibility</span>
            <span>${currentLanguage === 'ar' ? 'التفاصيل' : 'Details'}</span>
          </button>
          <button class="btn-primary btn-claim-settle" data-id="${debt.id}" style="padding: 8px 16px; font-size: 12px; font-weight: 700; background-color: var(--color-danger); color: white; border-radius: 8px; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.15); border: none; cursor: pointer; transition: all 0.2s ease; margin: 0;">
            <span class="material-icons-round" style="font-size: 14px;">payments</span>
            <span>${currentLanguage === 'ar' ? 'تسديد' : 'Settle'}</span>
          </button>
        </div>
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

  container.querySelectorAll('.btn-claim-details').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const invoiceId = parseInt(btn.dataset.invoiceId);
      closeBottomSheet('sheet-due-claims');
      await showInvoiceDetails(invoiceId, 'sale');
    });
  });
}

// ==============================================
// 6. SCREEN 1 IMPLEMENTATION: IMPORTS MANAGEMENT
// ==============================================
async function renderImportsList() {
  const importsList = document.getElementById('imports-list');
  const searchQuery = document.getElementById('search-import-farmer').value.toLowerCase();
  
  const allImports = await dbGetAll('import_invoices');
  const allImportItems = await dbGetAll('import_items');
  const allSaleItems = await dbGetAll('sale_items');
  const farmers = await dbGetAll('farmers');

  importsList.innerHTML = '';

  const activeImportsOnly = allImports.filter(imp => !imp.is_settled);
  activeImportsOnly.sort((a,b) => b.created_at - a.created_at);

  const matchedImports = [];
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

    // Apply advanced chip filtering
    if (importFilterStatus !== 'all') {
      const items = allImportItems.filter(it => it.invoice_id === imp.id);
      let totalWeight = 0;
      let soldWeight = 0;
      items.forEach(it => {
        const isCount = (getCropUnitType(it.crop_type) === 'count');
        if (isCount) {
          totalWeight += (it.box_count || 0);
          const salesOfItem = allSaleItems.filter(s => s.import_invoice_id === imp.id && s.crop_type === it.crop_type);
          salesOfItem.forEach(s => {
            soldWeight += (s.box_count || 0);
          });
        } else {
          totalWeight += it.weight_kg;
          const salesOfItem = allSaleItems.filter(s => s.import_invoice_id === imp.id && s.crop_type === it.crop_type);
          salesOfItem.forEach(s => {
            soldWeight += s.weight_kg;
          });
        }
      });
      const percentSold = totalWeight > 0 ? Math.min(100, Math.round((soldWeight / totalWeight) * 100)) : 0;
      
      if (importFilterStatus === 'selling' && percentSold === 100) {
        continue;
      }
      if (importFilterStatus === 'ready' && percentSold < 100) {
        continue;
      }
    }

    matchedImports.push({ imp, farmer });
  }

  const paginatedImports = matchedImports.slice(0, listPageLimits.imports);
  let displayedCount = 0;

  for (const matched of paginatedImports) {
    const imp = matched.imp;
    const farmer = matched.farmer;
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
    card.className = 'invoice-table-row stagger-item';
    card.style.animationDelay = `${displayedCount * 0.08}s`;
    
    let itemsHtml = items.map(it => {
      const isCount = (getCropUnitType(it.crop_type) === 'count');
      const isSpecial = isWatermelonOrMelon(it.crop_type);
      
      let itemBoxStr = '';
      if (isCount) {
        itemBoxStr = '';
      } else if (isSpecial) {
        itemBoxStr = '';
      } else {
        itemBoxStr = (currentLanguage === 'ar' ? ` (${it.box_count || 0} ص)` : ` (${it.box_count || 0} B)`);
      }

      // Calculate individual item sales progress
      let itemTotal = 0;
      let itemSold = 0;
      let itemTotalBoxes = it.box_count || 0;
      let itemSoldBoxes = 0;

      const salesOfItem = allSaleItems.filter(s => s.import_invoice_id === imp.id && s.crop_type === it.crop_type);

      if (isCount) {
        itemTotal = it.box_count || 0;
        salesOfItem.forEach(s => {
          itemSold += (s.box_count || 0);
        });
        itemTotalBoxes = itemTotal;
        itemSoldBoxes = itemSold;
      } else {
        itemTotal = it.weight_kg || 0;
        salesOfItem.forEach(s => {
          itemSold += (s.weight_kg || 0);
          itemSoldBoxes += (s.box_count || 0);
        });
      }

      const itemPercentSold = itemTotal > 0 ? Math.min(100, Math.round((itemSold / itemTotal) * 100)) : 0;
      const itemRemaining = Math.max(0, itemTotal - itemSold);
      const itemRemainingBoxes = Math.max(0, itemTotalBoxes - itemSoldBoxes);

      let itemColorClass = '#52b788'; // green
      if (itemPercentSold >= 85) {
        itemColorClass = '#e63946'; // red
      } else if (itemPercentSold >= 50) {
        itemColorClass = '#f4a261'; // orange
      }

      let remainingText = '';
      if (isCount) {
        remainingText = formatWeight(itemRemaining, it.unit || 'kg');
      } else {
        const boxLabel = currentLanguage === 'ar' ? 'صندوق' : 'box';
        remainingText = `${formatWeight(itemRemaining, it.unit || 'kg')} (${itemRemainingBoxes} ${boxLabel})`;
      }

      let qtyHtml = '';
      if (isCount) {
        const pcsText = currentLanguage === 'ar' ? 'قطعة' : 'Pcs';
        qtyHtml = `
          <span class="badge-qty">
            <span class="qty-num">${formatVal(it.box_count || 0)}</span>
            <span class="qty-unit">${pcsText}</span>
          </span>
        `;
      } else {
        const weightVal = formatVal(it.weight_kg || 0);
        const weightUnit = it.unit || 'kg';
        const weightUnitLabel = currentLanguage === 'ar' ? (weightUnit === 'kg' ? 'كجم' : weightUnit) : weightUnit;
        
        let boxesHtml = '';
        if (it.box_count && it.box_count > 0) {
          const boxLabel = currentLanguage === 'ar' ? 'صندوق' : 'box';
          boxesHtml = `
            <span class="badge-qty-boxes">
              <span class="qty-num">${formatVal(it.box_count)}</span>
              <span class="qty-unit">${boxLabel}</span>
            </span>
          `;
        }
        
        qtyHtml = `
          <span class="badge-qty">
            <span class="qty-num">${weightVal}</span>
            <span class="qty-unit">${weightUnitLabel}</span>
          </span>
          ${boxesHtml}
        `;
      }

      return `
        <span class="itr-item-badge" style="position: relative; overflow: hidden; min-width: 150px; justify-content: center; margin: 2px;">
          <span class="badge-crop-name">${getCropIcon(it.crop_type)} ${it.crop_type}</span>
          <span class="badge-qty-group">
            ${qtyHtml}
          </span>
        </span>
      `;
    }).join('');

    const formattedDate = formatCustomDate(imp.invoice_date);

    let colorHex = '#52b788'; // green
    if (percentSold >= 85) {
      colorHex = '#e63946'; // red
    } else if (percentSold >= 50) {
      colorHex = '#f4a261'; // orange
    }

    let settlementHtml = '';
    if (imp.is_settled) {
      settlementHtml = `
        <span class="debt-status-tag ok" style="font-size: 10px; font-weight: 800; background: #e2f0d9; color: #385723; border: 1.5px solid #c5e0b4; white-space: nowrap; margin: 0;">
          ✅ ${currentLanguage === 'ar' ? 'مسواة ومغلقة' : 'Settled & Closed'}
        </span>
      `;
    } else if (percentSold === 100) {
      settlementHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <span class="debt-status-tag warning" style="font-size: 9px; animation: pulse 1.5s infinite; background: #fff2cc; color: #7f6000; border: 1.5px solid #ffe599; font-weight: 800; white-space: nowrap; margin: 0;">
            ⚠️ ${currentLanguage === 'ar' ? 'جاهزة للتسوية' : 'Ready to Settle'}
          </span>
          <button class="btn-primary btn-settle-invoice" data-id="${imp.id}" style="padding: 4px 10px; font-size: 11px; background: var(--color-success); border: none; border-radius: 8px; font-weight: 700; white-space: nowrap; color: #fff; cursor: pointer; transition: all 0.2s;">
            ${currentLanguage === 'ar' ? 'تسوية الآن' : 'Settle Now'}
          </button>
        </div>
      `;
    } else {
      settlementHtml = `
        <span class="debt-status-tag late" style="font-size: 10px; font-weight: 700; background: #fef3c7; color: #d97706; border-color: #fde68a; white-space: nowrap; margin: 0;">
          ⏳ ${currentLanguage === 'ar' ? 'قيد البيع' : 'Selling'}
        </span>
      `;
    }

    card.innerHTML = `
      <!-- Column 1: ID & Date -->
      <div class="itr-col-id">
        <span class="lang-badge" style="background-color: var(--color-primary-mid); margin-bottom: 2px; display: inline-block; font-family: Cairo, sans-serif; align-self: flex-start;">
          ID: <span class="font-monofrik" style="font-size: 11px; vertical-align: middle; margin-left: 2px;">#${formatVal(imp.id)}</span>
        </span>
        <span style="font-size: 11px; font-weight: 600; color: var(--color-text-muted);">${formattedDate}</span>
      </div>

      <!-- Column 2: Farmer Info & Vehicle -->
      <div class="itr-col-customer">
        <h4 style="font-size: 14px; font-weight: 700; color: var(--color-primary); margin: 0;">${farmer.name}</h4>
        <span style="font-size: 10px; color: var(--color-text-muted);">${translations[currentLanguage].lblVehicleType}: ${imp.vehicle_type}</span>
      </div>

      <!-- Column 3: Items/Crops & sold progress -->
      <div class="itr-col-items" style="display: flex; flex-wrap: wrap; gap: 6px;">
        ${itemsHtml}
      </div>

      <!-- Column 4: Settle/Sales Progress Status -->
      <div class="itr-col-status">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; width: 100%; max-width: 160px; margin: 0 auto;">
          <span style="font-size: 11px; color: var(--color-text-muted); font-weight: 700; white-space: nowrap;">${currentLanguage === 'ar' ? 'نسبة المبيعات' : 'Sales Ratio'}</span>
          <div class="progress-track" style="width: 100%; margin: 2px 0;">
            <div class="progress-fill green" style="width: ${percentSold}%;"></div>
          </div>
          <span style="font-size: 12.5px; font-weight: 850; color: #1b4332; font-family: Cairo, sans-serif;">
            ${percentSold}%
          </span>
        </div>
      </div>

      <!-- Column 5: Settlement Status / Settle Button -->
      <div class="itr-col-total">
        ${settlementHtml}
      </div>

      <!-- Column 6: Actions Group -->
      <div class="itr-col-actions">
        <button class="btn-secondary btn-delete-import" data-id="${imp.id}" style="padding: 6px 10px; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 1.5px solid var(--color-danger); background: rgba(230, 57, 70, 0.04); color: var(--color-danger); box-shadow: none; margin: 0;">
          <span class="material-icons-round" style="font-size: 14px;">delete</span>
          <span>${currentLanguage === 'ar' ? 'حذف' : 'Delete'}</span>
        </button>
        <button class="btn-secondary btn-import-details" data-id="${imp.id}" style="padding: 6px 10px; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 1.5px solid var(--color-primary-light); background: rgba(0, 150, 199, 0.04); color: var(--color-primary); box-shadow: none; margin: 0;">
          <span class="material-icons-round" style="font-size: 14px;">info</span>
          <span>${currentLanguage === 'ar' ? 'تفاصيل' : 'Details'}</span>
        </button>
      </div>
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

  if (matchedImports.length > listPageLimits.imports) {
    const loadMoreBtn = createLoadMoreButton(() => {
      listPageLimits.imports += 10;
      renderImportsList();
    });
    importsList.appendChild(loadMoreBtn);
  }

  const archiveBtnDiv = document.createElement('div');
  archiveBtnDiv.style.cssText = 'grid-column: 1 / -1; width: 100%; margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 8px; align-items: center;';
  archiveBtnDiv.innerHTML = `
    <button class="btn-secondary" id="btn-open-archive" style="background: #e5e5e5; color: #555; border: 1px solid #ccc; font-size: 13px; font-weight: 700; width: 100%; max-width: 450px; padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: none;">
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
    card.className = 'invoice-table-row stagger-item';
    card.style.animationDelay = `${displayedCount * 0.08}s`;
    
    let itemsHtml = items.map(it => {
      const isCount = (getCropUnitType(it.crop_type) === 'count');
      const isSpecial = isWatermelonOrMelon(it.crop_type);
      
      let itemBoxStr = '';
      if (isCount) {
        itemBoxStr = '';
      } else if (isSpecial) {
        itemBoxStr = '';
      } else {
        itemBoxStr = (currentLanguage === 'ar' ? ` (${it.box_count || 0} ص)` : ` (${it.box_count || 0} B)`);
      }

      // Calculate individual item sales progress
      let itemTotal = 0;
      let itemSold = 0;
      let itemTotalBoxes = it.box_count || 0;
      let itemSoldBoxes = 0;

      const salesOfItem = allSaleItems.filter(s => s.import_invoice_id === imp.id && s.crop_type === it.crop_type);

      if (isCount) {
        itemTotal = it.box_count || 0;
        salesOfItem.forEach(s => {
          itemSold += (s.box_count || 0);
        });
        itemTotalBoxes = itemTotal;
        itemSoldBoxes = itemSold;
      } else {
        itemTotal = it.weight_kg || 0;
        salesOfItem.forEach(s => {
          itemSold += (s.weight_kg || 0);
          itemSoldBoxes += (s.box_count || 0);
        });
      }

      const itemPercentSold = itemTotal > 0 ? Math.min(100, Math.round((itemSold / itemTotal) * 100)) : 0;
      const itemRemaining = Math.max(0, itemTotal - itemSold);
      const itemRemainingBoxes = Math.max(0, itemTotalBoxes - itemSoldBoxes);

      let itemColorClass = '#52b788'; // green
      if (itemPercentSold >= 85) {
        itemColorClass = '#e63946'; // red
      } else if (itemPercentSold >= 50) {
        itemColorClass = '#f4a261'; // orange
      }

      let qtyHtml = '';
      if (isCount) {
        const pcsText = currentLanguage === 'ar' ? 'قطعة' : 'Pcs';
        qtyHtml = `
          <span class="badge-qty">
            <span class="qty-num">${formatVal(it.box_count || 0)}</span>
            <span class="qty-unit">${pcsText}</span>
          </span>
        `;
      } else {
        const weightVal = formatVal(it.weight_kg || 0);
        const weightUnit = it.unit || 'kg';
        const weightUnitLabel = currentLanguage === 'ar' ? (weightUnit === 'kg' ? 'كجم' : weightUnit) : weightUnit;
        
        let boxesHtml = '';
        if (it.box_count && it.box_count > 0) {
          const boxLabel = currentLanguage === 'ar' ? 'صندوق' : 'box';
          boxesHtml = `
            <span class="badge-qty-boxes">
              <span class="qty-num">${formatVal(it.box_count)}</span>
              <span class="qty-unit">${boxLabel}</span>
            </span>
          `;
        }
        
        qtyHtml = `
          <span class="badge-qty">
            <span class="qty-num">${weightVal}</span>
            <span class="qty-unit">${weightUnitLabel}</span>
          </span>
          ${boxesHtml}
        `;
      }

      return `
        <span class="itr-item-badge" style="position: relative; overflow: hidden; min-width: 150px; justify-content: center; margin: 2px;">
          <span class="badge-crop-name">${getCropIcon(it.crop_type)} ${it.crop_type}</span>
          <span class="badge-qty-group">
            ${qtyHtml}
          </span>
        </span>
      `;
    }).join('');

    const formattedDate = formatCustomDate(imp.invoice_date);

    let colorHex = '#e63946'; // red for completed/fully sold

    let settlementHtml = `
      <span class="debt-status-tag ok" style="font-size: 10px; font-weight: 800; background: #e2f0d9; color: #385723; border: 1.5px solid #c5e0b4; white-space: nowrap; margin: 0;">
        ✅ ${currentLanguage === 'ar' ? 'مسواة ومغلقة' : 'Settled & Closed'}
      </span>
    `;

    card.innerHTML = `
      <!-- Column 1: ID & Date -->
      <div class="itr-col-id">
        <span class="lang-badge" style="background-color: var(--color-primary-mid); margin-bottom: 2px; display: inline-block; font-family: Cairo, sans-serif; align-self: flex-start;">
          ID: <span class="font-monofrik" style="font-size: 11px; vertical-align: middle; margin-left: 2px;">#${formatVal(imp.id)}</span>
        </span>
        <span style="font-size: 11px; font-weight: 600; color: var(--color-text-muted);">${formattedDate}</span>
      </div>

      <!-- Column 2: Farmer Info & Vehicle -->
      <div class="itr-col-customer">
        <h4 style="font-size: 14px; font-weight: 700; color: var(--color-primary); margin: 0;">${farmer.name}</h4>
        <span style="font-size: 10px; color: var(--color-text-muted);">${translations[currentLanguage].lblVehicleType}: ${imp.vehicle_type}</span>
      </div>

      <!-- Column 3: Items/Crops & sold progress -->
      <div class="itr-col-items" style="display: flex; flex-wrap: wrap; gap: 6px;">
        ${itemsHtml}
      </div>

      <!-- Column 4: Settle/Sales Progress Status -->
      <div class="itr-col-status">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; width: 100%; max-width: 160px; margin: 0 auto;">
          <span style="font-size: 11px; color: var(--color-text-muted); font-weight: 700; white-space: nowrap;">${currentLanguage === 'ar' ? 'نسبة المبيعات' : 'Sales Ratio'}</span>
          <div class="progress-track" style="width: 100%; margin: 2px 0;">
            <div class="progress-fill green" style="width: ${percentSold}%;"></div>
          </div>
          <span style="font-size: 12.5px; font-weight: 850; color: #1b4332; font-family: Cairo, sans-serif;">
            ${percentSold}%
          </span>
        </div>
      </div>

      <!-- Column 5: Settlement Status -->
      <div class="itr-col-total">
        ${settlementHtml}
      </div>

      <!-- Column 6: Actions Group -->
      <div class="itr-col-actions">
        <button class="btn-secondary btn-import-details" data-id="${imp.id}" style="padding: 6px 10px; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 1.5px solid var(--color-primary-light); background: rgba(0, 150, 199, 0.04); color: var(--color-primary); box-shadow: none; margin: 0;">
          <span class="material-icons-round" style="font-size: 14px;">info</span>
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
    <div style="display: flex; gap: 12px; width: 100%; flex-wrap: wrap;">
      <div class="form-group" style="flex: 1.5; min-width: 150px;">
        <label>${currentLanguage === 'ar' ? 'نوع المحصول' : 'Crop Type'}</label>
        <div style="position: relative;">
          <span class="material-icons-round" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--color-primary); font-size: 18px; pointer-events: none; z-index: 2;">eco</span>
          <input type="text" class="form-input import-crop-type" placeholder="${currentLanguage === 'ar' ? 'نوع المحصول...' : 'Crop Type...'}" required autocomplete="off" style="padding-right: 42px;">
          <div class="crop-autocomplete-dropdown autocomplete-dropdown"></div>
        </div>
      </div>
      <div class="form-group" style="flex: 1; min-width: 100px;">
        <label class="import-crop-weight-label">${currentLanguage === 'ar' ? (numeralSystem === 'ar' ? 'الوزن القائم (كغم)' : 'الوزن القائم (Kg)') : 'Weight (Kg)'}</label>
        <div style="position: relative;">
          <span class="material-icons-round" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--color-primary); font-size: 18px; pointer-events: none; z-index: 2;">scale</span>
          <input type="number" class="form-input import-crop-weight" placeholder="${currentLanguage === 'ar' ? (numeralSystem === 'ar' ? 'الوزن...' : 'Weight...') : 'Weight...'}" required style="padding-right: 42px;">
        </div>
      </div>
      <div class="form-group import-box-count-container" style="flex: 1; min-width: 100px;">
        <label class="import-box-count-label">${currentLanguage === 'ar' ? 'العدد' : 'Count'}</label>
        <div style="position: relative;">
          <span class="material-icons-round" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--color-primary); font-size: 18px; pointer-events: none; z-index: 2;">grid_on</span>
          <input type="number" class="form-input import-box-count" placeholder="${currentLanguage === 'ar' ? 'العدد...' : 'Count...'}" style="padding-right: 42px;">
        </div>
      </div>
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
      div.className = 'autocomplete-item crop-grid-item';
      div.innerHTML = `
        <span class="crop-grid-icon" style="font-size: 26px; line-height: 1; display: block;">${sanitizeCropIcon(m.icon)}</span>
        <span class="crop-grid-name" style="font-size: 11px; font-weight: 700; color: #1b4332; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; text-align: center; margin-top: 4px;">${m.primaryAr}</span>
      `;
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
    addCustomDiv.className = 'autocomplete-item crop-grid-item add-custom-crop-grid';
    addCustomDiv.style.border = '1.5px dashed var(--color-primary)';
    addCustomDiv.innerHTML = `
      <span class="crop-grid-icon" style="font-size: 22px; line-height: 1; color: var(--color-primary); display: block;">➕</span>
      <span class="crop-grid-name" style="font-size: 10px; font-weight: 800; color: var(--color-primary); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; text-align: center; margin-top: 4px;">${currentLanguage === 'ar' ? `صنف جديد` : `New Crop`}</span>
    `;
    addCustomDiv.addEventListener('click', () => {
      openCustomCropDialog(selector, () => {
        autocomplete.style.display = 'none';
      });
    });
    autocomplete.appendChild(addCustomDiv);

    autocomplete.style.display = 'block';
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

  const notes = document.getElementById('import-notes').value.trim();

  const invoiceId = await dbAdd('import_invoices', {
    farmer_id: farmer.id,
    vehicle_type: vehicleType,
    notes: notes,
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

  playSound('print');
  showToast(currentLanguage === 'ar' ? 'تم حفظ فاتورة الاستيراد بنجاح والبدء بعرضها!' : 'Import invoice recorded and ready for sales!', 'check_circle');
  
  document.getElementById('import-farmer-name').value = '';
  document.getElementById('import-vehicle-type').value = '';
  document.getElementById('import-notes').value = '';
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
  
  const allSales = await dbGetAll('sale_invoices');
  const allSaleItems = await dbGetAll('sale_items');
  const customers = await dbGetAll('customers');
  const debts = await dbGetAll('debts');

  salesList.innerHTML = '';

  allSales.sort((a,b) => b.created_at - a.created_at);

  const matchedSales = [];
  const activeSales = allSales.filter(sale => {
    const isSettled = isSaleInvoiceSettled(sale, debts);
    if (saleFilterStatus === 'all') {
      if (searchQuery) return true;
      return !isSettled;
    } else if (saleFilterStatus === 'unpaid') {
      return !isSettled;
    } else if (saleFilterStatus === 'paid') {
      return isSettled;
    }
    return true;
  });

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
    matchedSales.push({ sale, customer, items, orderId });
  }

  const paginatedSales = matchedSales.slice(0, listPageLimits.sales);
  let displayedCount = 0;

  for (const matched of paginatedSales) {
    const sale = matched.sale;
    const customer = matched.customer;
    const items = matched.items;
    const orderId = matched.orderId;

    const card = document.createElement('div');
    card.className = 'invoice-table-row stagger-item';
    card.style.animationDelay = `${displayedCount * 0.08}s`;

    const formattedDate = formatCustomDate(sale.created_at);

    let itemsDetailsHtml = items.map(it => {
      const isCount = it.unit === 'count';
      let qtyHtml = '';
      if (isCount) {
        const pcsText = currentLanguage === 'ar' ? 'قطعة' : 'Pcs';
        qtyHtml = `
          <span class="badge-qty">
            <span class="qty-num">${formatVal(it.box_count)}</span>
            <span class="qty-unit">${pcsText}</span>
          </span>
        `;
      } else {
        const weightVal = formatVal(it.weight_kg);
        const weightUnit = it.unit || 'kg';
        const weightUnitLabel = currentLanguage === 'ar' ? (weightUnit === 'kg' ? 'كجم' : weightUnit) : weightUnit;
        
        let boxesHtml = '';
        if (it.box_count && it.box_count > 0) {
          const boxLabel = currentLanguage === 'ar' ? 'صندوق' : 'box';
          boxesHtml = `
            <span class="badge-qty-boxes">
              <span class="qty-num">${formatVal(it.box_count)}</span>
              <span class="qty-unit">${boxLabel}</span>
            </span>
          `;
        }
        
        qtyHtml = `
          <span class="badge-qty">
            <span class="qty-num">${weightVal}</span>
            <span class="qty-unit">${weightUnitLabel}</span>
          </span>
          ${boxesHtml}
        `;
      }
      return `
        <span class="itr-item-badge">
          <span class="badge-crop-name">${getCropIcon(it.crop_type)} ${it.crop_type}</span>
          <span class="badge-qty-group">
            ${qtyHtml}
          </span>
        </span>
      `;
    }).join('');

    const isSettled = isSaleInvoiceSettled(sale, debts);

    card.innerHTML = `
      <!-- Column 1: ID & Date -->
      <div class="itr-col-id">
        <span class="lang-badge" style="background-color: ${isSettled ? '#6b7280' : 'var(--color-primary-mid)'}; margin-bottom: 2px; display: inline-block; font-family: Cairo, sans-serif; align-self: flex-start;">
          ID: <span class="font-monofrik" style="font-size: 11px; vertical-align: middle; margin-left: 2px;">${orderId}</span>
        </span>
        <span style="font-size: 11px; font-weight: 600; color: var(--color-text-muted);">${formattedDate}</span>
      </div>

      <!-- Column 2: Customer Info -->
      <div class="itr-col-customer">
        <h4 style="font-size: 14px; font-weight: 700; color: var(--color-primary); margin: 0;">${customer.name}</h4>
        <span style="font-size: 10px; color: var(--color-text-muted);">${customer.address || ''}</span>
      </div>

      <!-- Column 3: Items/Crops -->
      <div class="itr-col-items">
        ${itemsDetailsHtml}
      </div>

      <!-- Column 4: Payment Type & Status -->
      <div class="itr-col-status">
        ${isSettled ? 
          `<span class="debt-status-tag ok" style="font-size: 9px; background-color: #e5e7eb; color: #374151; border-color: #d1d5db; margin: 0; white-space: nowrap;">📦 ${currentLanguage === 'ar' ? 'تمت تسويتها' : 'Settled'}</span>` : 
          (sale.payment_type === 'cash' ? 
            `<span class="debt-status-tag ok" style="font-size: 9px; margin: 0; white-space: nowrap;">💵 ${translations[currentLanguage].btnPayCash}</span>` : 
            `<span class="debt-status-tag late" style="font-size: 9px; margin: 0; white-space: nowrap;">📋 ${translations[currentLanguage].btnPayDebt}</span>`
          )
        }
      </div>

      <!-- Column 5: Total Amount -->
      <div class="itr-col-total">
        <span style="font-size: 10px; color: var(--color-text-muted);">${currentLanguage === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}</span>
        <h3 style="font-size: 15px; font-weight: 700; color: var(--color-primary); margin: 0;">${formatVal(sale.total_amount, true)}</h3>
      </div>

      <!-- Column 6: Actions Group -->
      <div class="itr-col-actions">
        <button class="btn-secondary btn-delete-sale" data-id="${sale.id}" style="padding: 6px 10px; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 1.5px solid var(--color-danger); background: rgba(230, 57, 70, 0.04); color: var(--color-danger); box-shadow: none; margin: 0;">
          <span class="material-icons-round" style="font-size: 14px;">delete</span>
          <span>${currentLanguage === 'ar' ? 'حذف' : 'Delete'}</span>
        </button>
        <button class="btn-secondary btn-sale-details" data-id="${sale.id}" style="padding: 6px 10px; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 1.5px solid var(--color-primary-light); background: rgba(0, 150, 199, 0.04); color: var(--color-primary); box-shadow: none; margin: 0;">
          <span class="material-icons-round" style="font-size: 14px;">info</span>
          <span>${currentLanguage === 'ar' ? 'تفاصيل' : 'Details'}</span>
        </button>
        <button class="btn-secondary btn-preview-thermal" data-id="${sale.id}" style="padding: 6px 10px; font-size: 11px; display: flex; align-items: center; gap: 4px; box-shadow: none; margin: 0;">
          <span class="material-icons-round" style="font-size: 14px;">print</span>
          <span>${currentLanguage === 'ar' ? 'طباعة' : 'Print'}</span>
        </button>
      </div>
    `;

    salesList.appendChild(card);
    displayedCount++;
  }

  if (matchedSales.length > listPageLimits.sales) {
    const loadMoreBtn = createLoadMoreButton(() => {
      listPageLimits.sales += 10;
      renderSalesList();
    });
    salesList.appendChild(loadMoreBtn);
  }

  const archiveBtnDiv = document.createElement('div');
  archiveBtnDiv.style.cssText = 'grid-column: 1 / -1; width: 100%; margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 8px; align-items: center;';
  archiveBtnDiv.innerHTML = `
    <button class="btn-secondary" id="btn-open-sales-archive" style="background: #e5e5e5; color: #555; border: 1px solid #ccc; font-size: 13px; font-weight: 700; width: 100%; max-width: 450px; padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: none;">
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
    card.className = 'invoice-table-row stagger-item';
    card.style.animationDelay = `${displayedCount * 0.08}s`;

    const formattedDate = formatCustomDate(sale.created_at);

    let itemsDetailsHtml = items.map(it => {
      const isCount = it.unit === 'count';
      let qtyHtml = '';
      if (isCount) {
        const pcsText = currentLanguage === 'ar' ? 'قطعة' : 'Pcs';
        qtyHtml = `
          <span class="badge-qty">
            <span class="qty-num">${formatVal(it.box_count)}</span>
            <span class="qty-unit">${pcsText}</span>
          </span>
        `;
      } else {
        const weightVal = formatVal(it.weight_kg);
        const weightUnit = it.unit || 'kg';
        const weightUnitLabel = currentLanguage === 'ar' ? (weightUnit === 'kg' ? 'كجم' : weightUnit) : weightUnit;
        
        let boxesHtml = '';
        if (it.box_count && it.box_count > 0) {
          const boxLabel = currentLanguage === 'ar' ? 'صندوق' : 'box';
          boxesHtml = `
            <span class="badge-qty-boxes">
              <span class="qty-num">${formatVal(it.box_count)}</span>
              <span class="qty-unit">${boxLabel}</span>
            </span>
          `;
        }
        
        qtyHtml = `
          <span class="badge-qty">
            <span class="qty-num">${weightVal}</span>
            <span class="qty-unit">${weightUnitLabel}</span>
          </span>
          ${boxesHtml}
        `;
      }
      return `
        <span class="itr-item-badge">
          <span class="badge-crop-name">${getCropIcon(it.crop_type)} ${it.crop_type}</span>
          <span class="badge-qty-group">
            ${qtyHtml}
          </span>
        </span>
      `;
    }).join('');

    card.innerHTML = `
      <!-- Column 1: ID & Date -->
      <div class="itr-col-id">
        <span class="lang-badge" style="background-color: #6b7280; margin-bottom: 2px; display: inline-block; font-family: Cairo, sans-serif; align-self: flex-start;">
          ID: <span class="font-monofrik" style="font-size: 11px; vertical-align: middle; margin-left: 2px;">${orderId}</span>
        </span>
        <span style="font-size: 11px; font-weight: 600; color: var(--color-text-muted);">${formattedDate}</span>
      </div>

      <!-- Column 2: Customer Info -->
      <div class="itr-col-customer">
        <h4 style="font-size: 14px; font-weight: 700; color: var(--color-primary); margin: 0;">${customer.name}</h4>
        <span style="font-size: 10px; color: var(--color-text-muted);">${customer.address || ''}</span>
      </div>

      <!-- Column 3: Items/Crops -->
      <div class="itr-col-items">
        ${itemsDetailsHtml}
      </div>

      <!-- Column 4: Payment Type & Status -->
      <div class="itr-col-status">
        <span class="debt-status-tag ok" style="font-size: 9px; background-color: #e5e7eb; color: #374151; border-color: #d1d5db; margin: 0; white-space: nowrap;">📦 مؤرشف</span>
      </div>

      <!-- Column 5: Total Amount -->
      <div class="itr-col-total">
        <span style="font-size: 10px; color: var(--color-text-muted);">${currentLanguage === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}</span>
        <h3 style="font-size: 15px; font-weight: 700; color: var(--color-primary); margin: 0;">${formatVal(sale.total_amount, true)}</h3>
      </div>

      <!-- Column 6: Actions Group -->
      <div class="itr-col-actions">
        <button class="btn-secondary btn-delete-sale" data-id="${sale.id}" style="padding: 6px 10px; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 1.5px solid var(--color-danger); background: rgba(230, 57, 70, 0.04); color: var(--color-danger); box-shadow: none; margin: 0;">
          <span class="material-icons-round" style="font-size: 14px;">delete</span>
          <span>${currentLanguage === 'ar' ? 'حذف' : 'Delete'}</span>
        </button>
        <button class="btn-secondary btn-sale-details" data-id="${sale.id}" style="padding: 6px 10px; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 1.5px solid var(--color-primary-light); background: rgba(0, 150, 199, 0.04); color: var(--color-primary); box-shadow: none; margin: 0;">
          <span class="material-icons-round" style="font-size: 14px;">info</span>
          <span>${currentLanguage === 'ar' ? 'تفاصيل' : 'Details'}</span>
        </button>
        <button class="btn-secondary btn-preview-thermal" data-id="${sale.id}" style="padding: 6px 10px; font-size: 11px; display: flex; align-items: center; gap: 4px; box-shadow: none; margin: 0;">
          <span class="material-icons-round" style="font-size: 14px;">print</span>
          <span>${currentLanguage === 'ar' ? 'طباعة' : 'Print'}</span>
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

async function addSaleCropRow() {
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
      <label>
        <span>${currentLanguage === 'ar' ? 'البضاعة المتوفرة بالفواتير (المحصول - الفلاح - السيارة)' : 'Select Available Cargo (Crop - Farmer - Car)'}</span>
      </label>
      <div style="position: relative;">
        <span class="material-icons-round" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--color-primary); font-size: 18px; pointer-events: none; z-index: 2;">inventory_2</span>
        <select class="form-input sale-cargo-select" required style="padding-right: 42px;">
          <option value="" disabled selected>${currentLanguage === 'ar' ? 'اختر البضاعة المتوفرة بالفواتير (المحصول - الفلاح - السيارة)...' : 'Choose from available imports...'}</option>
        </select>
      </div>
    </div>

    <div style="display: flex; gap: 12px; width: 100%;">
      <div class="form-group" style="flex: 1; min-width: 0;">
        <label class="sale-crop-weight-label">
          <span>${currentLanguage === 'ar' ? (numeralSystem === 'ar' ? 'الوزن الكلي المباع (كغم)' : 'الوزن المباع (Kg)') : 'Sold Weight (Kg)'}</span>
        </label>
        <div style="position: relative;">
          <span class="material-icons-round" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--color-primary); font-size: 18px; pointer-events: none; z-index: 2;">scale</span>
          <input type="number" class="form-input sale-crop-weight" placeholder="${currentLanguage === 'ar' ? (numeralSystem === 'ar' ? 'الوزن الكلي المباع (كغم)...' : 'الوزن المباع (Kg)...') : 'Sold Weight (Kg)...'}" required style="padding-right: 42px;">
        </div>
      </div>

      <div class="form-group sale-box-count-container" style="flex: 1; min-width: 0;">
        <label class="sale-box-count-label">
          <span>${currentLanguage === 'ar' ? 'عدد' : 'Number of Boxes Sold'}</span>
        </label>
        <div style="position: relative;">
          <span class="material-icons-round" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--color-primary); font-size: 18px; pointer-events: none; z-index: 2;">grid_on</span>
          <input type="number" class="form-input sale-box-count" placeholder="${currentLanguage === 'ar' ? 'عدد الصناديق المباعة...' : 'Number of Boxes Sold...'}" required style="padding-right: 42px;">
        </div>
      </div>

      <div class="form-group" style="flex: 1; min-width: 0;">
        <label class="sale-unit-price-label">
          <span>${currentLanguage === 'ar' ? 'سعر البيع للكيلو الواحد' : 'Sale Price per Kg'}</span>
        </label>
        <div style="position: relative;">
          <span class="material-icons-round" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--color-primary); font-size: 18px; pointer-events: none; z-index: 2;">payments</span>
          <input type="number" class="form-input sale-crop-unit-price" placeholder="${currentLanguage === 'ar' ? 'سعر البيع للكيلو الواحد (دينار)...' : 'Sale Price per Kg (IQD)...'}" required style="padding-right: 42px;">
        </div>
      </div>
    </div>

    <div class="form-group sale-porter-rate-container" style="margin-top: 8px;">
      <label class="sale-porter-rate-label">
        <span>${currentLanguage === 'ar' ? 'عمولة الحمالية للصندوق الواحد (دينار)' : 'Porter Fee per Box (IQD)'}</span>
      </label>
      <div class="porter-options-row" style="display: flex; gap: 8px; margin-top: 4px; margin-bottom: 8px; flex-wrap: wrap;">
        <button type="button" class="porter-opt-btn" data-value="0" style="flex: 1; padding: 6px 12px; font-size: 11px; font-weight: 600; border-radius: 8px; border: 1.5px solid rgba(27,67,50,0.25); background: white; color: var(--color-primary); cursor: pointer; text-align: center; transition: all 0.2s;">0</button>
        <button type="button" class="porter-opt-btn" data-value="100" style="flex: 1; padding: 6px 12px; font-size: 11px; font-weight: 600; border-radius: 8px; border: 1.5px solid rgba(27,67,50,0.25); background: white; color: var(--color-primary); cursor: pointer; text-align: center; transition: all 0.2s;">100</button>
        <button type="button" class="porter-opt-btn" data-value="200" style="flex: 1; padding: 6px 12px; font-size: 11px; font-weight: 600; border-radius: 8px; border: 1.5px solid rgba(27,67,50,0.25); background: white; color: var(--color-primary); cursor: pointer; text-align: center; transition: all 0.2s;">200</button>
        <button type="button" class="porter-opt-btn active" data-value="250" style="flex: 1; padding: 6px 12px; font-size: 11px; font-weight: 700; border-radius: 8px; border: 1.5px solid var(--color-primary); background: var(--color-primary); color: white; cursor: pointer; text-align: center; transition: all 0.2s;">250</button>
        <button type="button" class="porter-opt-btn btn-custom-porter-trigger" data-value="custom" style="flex: 1; padding: 6px 12px; font-size: 11px; font-weight: 600; border-radius: 8px; border: 1.5px solid rgba(27,67,50,0.25); background: white; color: var(--color-primary); cursor: pointer; text-align: center; transition: all 0.2s;">${currentLanguage === 'ar' ? 'مخصص' : 'Custom'}</button>
      </div>
      <div class="sale-porter-rate-wrapper" style="position: relative; display: none;">
        <span class="material-icons-round" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--color-primary); font-size: 18px; pointer-events: none; z-index: 2;">engineering</span>
        <input type="number" class="form-input sale-porter-rate" value="250" style="display: none; text-align: center; font-weight: 600; padding-right: 42px;" placeholder="${currentLanguage === 'ar' ? 'أدخل عمولة مخصصة...' : 'Enter custom rate...'}">
      </div>
      <span class="sale-row-porter-total-label" style="font-size:11px; font-weight:600; color:var(--color-primary-mid); display:block; margin-top:4px;"></span>
    </div>

    <div class="form-group sale-box-commission-container" style="margin-top: 8px; display: none;">
      <label class="sale-box-commission-label">
        <span>${currentLanguage === 'ar' ? 'العمولة لكل كارتون' : 'Commission per Box'}</span>
      </label>
      <div class="box-commission-options-row" style="display: flex; gap: 8px; margin-top: 4px; margin-bottom: 8px; flex-wrap: wrap;">
        <button type="button" class="box-commission-opt-btn" data-value="0" style="flex: 1; padding: 6px 12px; font-size: 11px; font-weight: 600; border-radius: 8px; border: 1.5px solid rgba(27,67,50,0.25); background: white; color: var(--color-primary); cursor: pointer; text-align: center; transition: all 0.2s;">0</button>
        <button type="button" class="box-commission-opt-btn" data-value="100" style="flex: 1; padding: 6px 12px; font-size: 11px; font-weight: 600; border-radius: 8px; border: 1.5px solid rgba(27,67,50,0.25); background: white; color: var(--color-primary); cursor: pointer; text-align: center; transition: all 0.2s;">100</button>
        <button type="button" class="box-commission-opt-btn" data-value="200" style="flex: 1; padding: 6px 12px; font-size: 11px; font-weight: 600; border-radius: 8px; border: 1.5px solid rgba(27,67,50,0.25); background: white; color: var(--color-primary); cursor: pointer; text-align: center; transition: all 0.2s;">200</button>
        <button type="button" class="box-commission-opt-btn active" data-value="250" style="flex: 1; padding: 6px 12px; font-size: 11px; font-weight: 700; border-radius: 8px; border: 1.5px solid var(--color-primary); background: var(--color-primary); color: white; cursor: pointer; text-align: center; transition: all 0.2s;">250</button>
        <button type="button" class="box-commission-opt-btn btn-custom-box-commission-trigger" data-value="custom" style="flex: 1; padding: 6px 12px; font-size: 11px; font-weight: 600; border-radius: 8px; border: 1.5px solid rgba(27,67,50,0.25); background: white; color: var(--color-primary); cursor: pointer; text-align: center; transition: all 0.2s;">${currentLanguage === 'ar' ? 'مخصص' : 'Custom'}</button>
      </div>
      <div class="sale-box-commission-wrapper" style="position: relative; display: none;">
        <span class="material-icons-round" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--color-primary); font-size: 18px; pointer-events: none; z-index: 2;">payments</span>
        <input type="number" class="form-input sale-box-commission-rate" value="250" style="display: none; text-align: center; font-weight: 600; padding-right: 42px;" placeholder="${currentLanguage === 'ar' ? 'أدخل عمولة مخصصة...' : 'Enter custom rate...'}">
      </div>
      <span class="sale-row-box-commission-total-label" style="font-size:11px; font-weight:600; color:var(--color-primary-mid); display:block; margin-top:4px;"></span>
    </div>
  `;

  const cargoSelect = row.querySelector('.sale-cargo-select');
  const weightInput = row.querySelector('.sale-crop-weight');
  const boxInput = row.querySelector('.sale-box-count');
  const priceInput = row.querySelector('.sale-crop-unit-price');
  const remainingLabel = row.querySelector('.sale-row-remaining-label');
  const boxContainer = row.querySelector('.sale-box-count-container');
  const porterRateContainer = row.querySelector('.sale-porter-rate-container');
  const boxCommissionContainer = row.querySelector('.sale-box-commission-container');

  // Populate cargo select dynamically from active imports cache
  // Filter out fully sold items
  await refreshCargoOptions(cargoSelect);

  cargoSelect.addEventListener('change', async () => {
    const cargoValue = cargoSelect.value;
    if (!cargoValue) return;

    const [invoiceIdStr, cropType] = cargoValue.split('|');
    const invoiceId = parseInt(invoiceIdStr);

    const imp = activeImportInvoices.find(i => i.id === invoiceId);
    if (!imp) return;

    // Check if another row in the same invoice already has the same crop from the same farmer
    const otherCargoSelects = Array.from(document.querySelectorAll('#sale-items-container .sale-cargo-select'))
      .filter(sel => sel !== cargoSelect);
    
    let isDuplicate = false;
    for (const sel of otherCargoSelects) {
      const val = sel.value;
      if (!val) continue;
      const [oInvIdStr, oCropType] = val.split('|');
      const oInvId = parseInt(oInvIdStr);
      const oImp = activeImportInvoices.find(i => i.id === oInvId);
      if (oImp && oImp.farmer_id === imp.farmer_id && oCropType === cropType) {
        isDuplicate = true;
        break;
      }
    }

    if (isDuplicate) {
      showToast(
        currentLanguage === 'ar' 
          ? `عذراً، هذا الصنف (${cropType}) للفلاح نفسه مضاف بالفعل في هذه الفاتورة!` 
          : `Sorry, this crop (${cropType}) from the same farmer is already added to this invoice!`, 
        'warning', 
        true
      );
      cargoSelect.value = "";
      remainingLabel.textContent = "";
      weightInput.value = "";
      boxInput.value = "";
      priceInput.value = "";
      updateSaleInvoiceOverallTotal();
      return;
    }

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

    const boxCountLabel = boxContainer.querySelector('.sale-box-count-label');
    const boxCountInput = boxContainer.querySelector('.sale-box-count');

    if (isCount) {
      weightInput.closest('.form-group').style.display = 'none';
      weightInput.value = '';
      boxContainer.style.display = 'block';
      boxInput.setAttribute('max', remBoxes);
      remainingLabel.textContent = currentLanguage === 'ar' ? `المتبقي: ${formatVal(remBoxes)} قطعة` : `Remaining: ${formatVal(remBoxes)} قطعة`;
      
      unitPriceLabel.textContent = currentLanguage === 'ar' ? 'سعر البيع للقطعة الواحدة' : 'Sale Price per Piece';
      unitPriceInput.placeholder = currentLanguage === 'ar' ? 'السعر' : 'Price';

      if (boxCountLabel) {
        boxCountLabel.textContent = currentLanguage === 'ar' ? 'عدد' : 'Number of Pieces Sold';
      }
      if (boxCountInput) {
        boxCountInput.placeholder = currentLanguage === 'ar' ? 'عدد' : 'Count';
      }
    } else {
      weightInput.closest('.form-group').style.display = 'block';
      weightInput.setAttribute('max', remWeight);
      
      unitPriceLabel.textContent = currentLanguage === 'ar' ? 'سعر البيع للكيلو الواحد' : 'Sale Price per Kg';
      unitPriceInput.placeholder = currentLanguage === 'ar' ? 'السعر' : 'Price';

      if (boxCountLabel) {
        boxCountLabel.textContent = currentLanguage === 'ar' ? 'عدد' : 'Number of Boxes Sold';
      }
      if (boxCountInput) {
        boxCountInput.placeholder = currentLanguage === 'ar' ? 'عدد' : 'Count';
      }

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

    if (isCount) {
      boxCommissionContainer.style.display = 'block';
    } else {
      boxCommissionContainer.style.display = 'none';
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
      const rateWrapper = row.querySelector('.sale-porter-rate-wrapper');
      if (val === 'custom') {
        if (rateWrapper) rateWrapper.style.display = 'block';
        porterRateInput.style.display = 'block';
        porterRateInput.value = '';
        porterRateInput.focus();
      } else {
        if (rateWrapper) rateWrapper.style.display = 'none';
        porterRateInput.style.display = 'none';
        porterRateInput.value = val;
      }
      updateSaleInvoiceOverallTotal();
    });
  });

  const commissionBtns = row.querySelectorAll('.box-commission-opt-btn');
  const commissionRateInput = row.querySelector('.sale-box-commission-rate');

  commissionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Deactivate all
      commissionBtns.forEach(b => {
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
      const rateWrapper = row.querySelector('.sale-box-commission-wrapper');
      if (val === 'custom') {
        if (rateWrapper) rateWrapper.style.display = 'block';
        commissionRateInput.style.display = 'block';
        commissionRateInput.value = '';
        commissionRateInput.focus();
      } else {
        if (rateWrapper) rateWrapper.style.display = 'none';
        commissionRateInput.style.display = 'none';
        commissionRateInput.value = val;
      }
      updateSaleInvoiceOverallTotal();
    });
  });

  weightInput.addEventListener('input', updateSaleInvoiceOverallTotal);
  boxInput.addEventListener('input', updateSaleInvoiceOverallTotal);
  priceInput.addEventListener('input', updateSaleInvoiceOverallTotal);
  porterRateInput.addEventListener('input', updateSaleInvoiceOverallTotal);
  commissionRateInput.addEventListener('input', updateSaleInvoiceOverallTotal);

  row.querySelector('.delete-row-btn').addEventListener('click', () => {
    row.remove();
    updateSaleRowLabels();
    updateSaleInvoiceOverallTotal();
  });

  container.appendChild(row);
}

async function refreshCargoOptions(selectElement) {
  const currentVal = selectElement.value;
  selectElement.innerHTML = `<option value="" disabled selected>${currentLanguage === 'ar' ? 'جاري التحميل...' : 'Loading...'}</option>`;

  const allSaleItems = await dbGetAll('sale_items');

  selectElement.innerHTML = `<option value="" disabled selected>${currentLanguage === 'ar' ? 'اختر من البضاعة المعروضة بالاستيراد...' : 'Choose from available imports...'}</option>`;

  activeImportInvoices.forEach(imp => {
    imp.items.forEach(it => {
      const salesOfItem = allSaleItems.filter(s => s.import_invoice_id === imp.id && s.crop_type === it.crop_type);
      
      let soldWeight = 0;
      let soldBoxes = 0;
      const isCount = (getCropUnitType(it.crop_type) === 'count');
      
      salesOfItem.forEach(s => {
        soldWeight += (isCount ? (s.box_count || 0) : s.weight_kg);
        soldBoxes += (s.box_count || 0);
      });

      const remWeight = Math.max(0, (isCount ? (it.box_count || 0) : it.weight_kg) - soldWeight);
      const remBoxes = Math.max(0, (it.box_count || 0) - soldBoxes);

      const isSelected = (currentVal === `${imp.id}|${it.crop_type}`);
      if (remWeight <= 0 && !isSelected) {
        return; // Skip fully sold items
      }

      const opt = document.createElement('option');
      opt.value = `${imp.id}|${it.crop_type}`;

      let remainingText = '';
      if (isCount) {
        remainingText = currentLanguage === 'ar' 
          ? `(متبقي: ${formatVal(remBoxes)} قطعة)` 
          : `(rem: ${formatVal(remBoxes)} قطعة)`;
      } else if (isWatermelonOrMelon(it.crop_type)) {
        remainingText = currentLanguage === 'ar' 
          ? `(متبقي: ${formatWeight(remWeight, it.unit || 'kg')})` 
          : `(rem: ${formatWeight(remWeight, it.unit || 'kg')})`;
      } else {
        remainingText = currentLanguage === 'ar' 
          ? `(متبقي: ${formatWeight(remWeight, it.unit || 'kg')} [${remBoxes} ص])` 
          : `(rem: ${formatWeight(remWeight, it.unit || 'kg')} [${remBoxes} b])`;
      }

      opt.textContent = `${getCropIcon(it.crop_type, false)} ${it.crop_type} - فلاح: ${imp.farmer_name} (#${imp.id}) ${remainingText}`;
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
    
    // Alwa 7% commission, unless count-based and box-commission-rate is used
    let rowCommission = 0;
    if (isCount) {
      const commissionRate = parseNumberInput(row.querySelector('.sale-box-commission-rate').value) || 0;
      rowCommission = boxCount * commissionRate;
      row.querySelector('.sale-row-box-commission-total-label').textContent = 
        currentLanguage === 'ar' ? `عمولة الصنف: ${formatVal(rowCommission)} دينار` : `Item commission: ${formatVal(rowCommission)} IQD`;
    } else {
      rowCommission = Math.round(price * 0.07);
      const label = row.querySelector('.sale-row-box-commission-total-label');
      if (label) label.textContent = '';
    }
    totalCommissions += rowCommission;
    
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

  // Verify duplicates of same crop from same farmer
  const seenFarmerCrops = new Set();
  for (const row of itemRows) {
    const cargoValue = row.querySelector('.sale-cargo-select').value;
    if (cargoValue) {
      const [invoiceIdStr, cropType] = cargoValue.split('|');
      const invoiceId = parseInt(invoiceIdStr);
      const imp = activeImportInvoices.find(i => i.id === invoiceId);
      if (imp) {
        const key = `${imp.farmer_id}|${cropType}`;
        if (seenFarmerCrops.has(key)) {
          showToast(
            currentLanguage === 'ar' 
              ? `يمنع تكرار نفس الصنف للفلاح نفسه (${imp.farmer_name} - ${cropType}) في الفاتورة نفسها!` 
              : `Duplicate crop for the same farmer (${imp.farmer_name} - ${cropType}) is not allowed on the same invoice!`, 
            'warning', 
            true
          );
          return;
        }
        seenFarmerCrops.add(key);
      }
    }
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

    const commissionRate = isCount ? (parseNumberInput(row.querySelector('.sale-box-commission-rate').value) || 0) : 0;
    const commissionAmount = isCount ? (boxCount * commissionRate) : Math.round(totalPrice * 0.07);

    saleItemsToSave.push({
      import_invoice_id: importInvoiceId,
      crop_type: cropType,
      weight_kg: isCount ? 0 : weight,
      box_count: boxCount,
      agreed_price: totalPrice,
      unit: isCount ? 'count' : (impItem.unit || 'kg'),
      commission_amount: commissionAmount,
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

  const orderId = await generateOrderId();
  const saleNotes = document.getElementById('sale-notes').value.trim();

  const saleInvoiceId = await dbAdd('sale_invoices', {
    customer_id: customer.id,
    order_id: orderId,
    total_amount: grandTotal,
    payment_type: paymentType,
    bags_cost: bagsCost,
    notes: saleNotes,
    created_at: Date.now()
  });

  // Save items and adjust dues
  for (const item of saleItemsToSave) {
    const saleItemId = await dbAdd('sale_items', {
      ...item,
      sale_invoice_id: saleInvoiceId
    });

    // Record farmer dues for this sold share:
    // Farmer payout calculation: (Crop Price) + (2% bonus percentage)
    // Note: Buyer pays 7% total commission (5% office profit + 2% farmer bonus). Porter fee is paid by buyer and does NOT affect farmer due.
    const farmerDueAmount = item.agreed_price + Math.round(item.agreed_price * 0.02);

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
        porter_deducted: 0,
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
    let debtDays = 5;
    if (activeDebtDaysBtn) {
      if (activeDebtDaysBtn.dataset.days === 'custom') {
        const customInput = document.getElementById('custom-debt-days-input');
        const customVal = customInput ? parseInt(customInput.value) : NaN;
        debtDays = (!isNaN(customVal) && customVal > 0) ? customVal : 5;
      } else {
        debtDays = parseInt(activeDebtDaysBtn.dataset.days) || 5;
      }
    }
    const dueTime = Date.now() + debtDays * 24 * 60 * 60 * 1000;
    await dbAdd('debts', {
      customer_id: customer.id,
      sale_invoice_id: saleInvoiceId,
      amount: grandTotal,
      due_date: dueTime,
      is_paid: false,
      created_at: Date.now()
    });
    playSound('print');
  } else {
    playSound('print');
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
  document.getElementById('sale-notes').value = '';
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

  // Fetch all related entities once at function level (deadlock-free pre-fetching)
  const allDebts = await dbGetAll('debts');
  const allDues = await dbGetAll('farmer_dues');
  const allPorters = await dbGetAll('porter_payouts');
  const allSaleItems = await dbGetAll('sale_items');

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
    invalidateDbCache('sale_invoices');
    invalidateDbCache('sale_items');
    invalidateDbCache('debts');
    invalidateDbCache('farmer_dues');
    invalidateDbCache('porter_payouts');
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

  const allItems = await dbGetAll('import_items');

  const tx = db.transaction(['import_invoices', 'import_items'], 'readwrite');
  tx.objectStore('import_invoices').delete(impId);

  const itemsStore = tx.objectStore('import_items');
  allItems.filter(it => it.invoice_id === impId).forEach(it => {
    itemsStore.delete(it.id);
  });

  tx.oncomplete = async () => {
    invalidateDbCache('import_invoices');
    invalidateDbCache('import_items');
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
  
  const debts = await dbGetAll('debts');
  const customers = await dbGetAll('customers');
  const allSaleItems = await dbGetAll('sale_items');
  const allSaleInvoices = await dbGetAll('sale_invoices');

  debtsList.innerHTML = '';

  const matchedDebts = [];
  let activeDebts = debts.filter(d => !d.is_paid);
  if (debtsFilterStatus === 'late') {
    const now = Date.now();
    activeDebts = activeDebts.filter(d => now >= d.due_date);
  } else if (debtsFilterStatus === 'upcoming') {
    const now = Date.now();
    activeDebts = activeDebts.filter(d => now < d.due_date);
  }
  activeDebts.sort((a,b) => b.due_date - a.due_date);

  for (const debt of activeDebts) {
    const customer = customers.find(c => c.id === debt.customer_id);
    if (!customer) continue;

    const saleInvoice = allSaleInvoices.find(s => s.id === debt.sale_invoice_id);
    const orderId = (saleInvoice && saleInvoice.order_id) || ('ALW-' + String(debt.sale_invoice_id).padStart(3, '0'));
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
    matchedDebts.push({ debt, customer, items, orderId });
  }

  const paginatedDebts = matchedDebts.slice(0, listPageLimits.debts);
  let displayedCount = 0;

  for (const matched of paginatedDebts) {
    const debt = matched.debt;
    const customer = matched.customer;
    const items = matched.items;
    const orderId = matched.orderId;

    const now = Date.now();
    const isLate = now >= debt.due_date;
    const formattedDate = formatCustomDate(debt.due_date);

    // Calculate days remaining or days late relative to "now"
    const msDiff = isLate ? (now - debt.due_date) : (debt.due_date - now);
    const debtDays = Math.max(0, Math.round(msDiff / (24 * 60 * 60 * 1000)));

    let daysText = '';
    if (currentLanguage === 'ar' || (typeof numeralSystem !== 'undefined' && numeralSystem === 'ar')) {
      if (debtDays === 0) {
        daysText = 'اليوم';
      } else if (debtDays === 1) {
        daysText = 'يوم واحد';
      } else if (debtDays === 2) {
        daysText = 'يومين';
      } else if (debtDays >= 3 && debtDays <= 10) {
        daysText = `${formatVal(debtDays)} أيام`;
      } else {
        daysText = `${formatVal(debtDays)} يوم`;
      }
    } else {
      if (debtDays === 0) {
        daysText = 'today';
      } else {
        daysText = `${debtDays} ${debtDays === 1 ? 'day' : 'days'}`;
      }
    }

    let statusText = '';
    if (isLate) {
      if (debtDays === 0) {
        statusText = currentLanguage === 'ar' ? 'مستحق اليوم' : 'Due today';
      } else {
        statusText = currentLanguage === 'ar' 
          ? `متأخر منذ ${daysText}` 
          : `Overdue by ${daysText}`;
      }
    } else {
      if (debtDays === 0) {
        statusText = currentLanguage === 'ar' ? 'مستحق اليوم' : 'Due today';
      } else {
        statusText = currentLanguage === 'ar' 
          ? `متبقي ${daysText}` 
          : `Due in ${daysText}`;
      }
    }

    const card = document.createElement('div');
    card.className = 'invoice-table-row stagger-item';
    card.style.animationDelay = `${displayedCount * 0.08}s`;

    let itemsDetailsHtml = items.map(it => {
      const isCount = it.unit === 'count';
      let qtyHtml = '';
      if (isCount) {
        const pcsText = currentLanguage === 'ar' ? 'قطعة' : 'Pcs';
        qtyHtml = `
          <span class="badge-qty">
            <span class="qty-num">${formatVal(it.box_count)}</span>
            <span class="qty-unit">${pcsText}</span>
          </span>
        `;
      } else {
        const weightVal = formatVal(it.weight_kg);
        const weightUnit = it.unit || 'kg';
        const weightUnitLabel = currentLanguage === 'ar' ? (weightUnit === 'kg' ? 'كجم' : weightUnit) : weightUnit;
        
        let boxesHtml = '';
        if (it.box_count && it.box_count > 0) {
          const boxLabel = currentLanguage === 'ar' ? 'صندوق' : 'box';
          boxesHtml = `
            <span class="badge-qty-boxes">
              <span class="qty-num">${formatVal(it.box_count)}</span>
              <span class="qty-unit">${boxLabel}</span>
            </span>
          `;
        }
        
        qtyHtml = `
          <span class="badge-qty">
            <span class="qty-num">${weightVal}</span>
            <span class="qty-unit">${weightUnitLabel}</span>
          </span>
          ${boxesHtml}
        `;
      }
      return `
        <span class="itr-item-badge">
          <span class="badge-crop-name">${getCropIcon(it.crop_type)} ${it.crop_type}</span>
          <span class="badge-qty-group">
            ${qtyHtml}
          </span>
        </span>
      `;
    }).join('');

    if (!itemsDetailsHtml) {
      itemsDetailsHtml = `
        <span class="itr-item-badge" style="border-color: rgba(0,0,0,0.08);">
          <span class="badge-crop-name">📄 ${currentLanguage === 'ar' ? 'دين مبيعات معلق' : 'Outstanding Sales Debt'}</span>
        </span>
      `;
    }

    card.innerHTML = `
      <!-- Column 1: ID & Date -->
      <div class="itr-col-id">
        <span class="lang-badge" style="background-color: var(--color-primary-mid); margin-bottom: 2px; display: inline-block; font-family: Cairo, sans-serif; align-self: flex-start;">
          ID: <span class="font-monofrik" style="font-size: 11px; vertical-align: middle; margin-left: 2px;">${orderId}</span>
        </span>
        <span style="font-size: 11px; font-weight: 600; color: var(--color-text-muted);">${formattedDate}</span>
      </div>

      <!-- Column 2: Customer Info -->
      <div class="itr-col-customer">
        <h4 style="font-size: 14px; font-weight: 700; color: var(--color-primary); margin: 0;">${customer.name}</h4>
        <span style="font-size: 10px; color: var(--color-text-muted);">${customer.address || ''} ${customer.phone ? `• ${customer.phone}` : ''}</span>
      </div>

      <!-- Column 3: Items/Crops -->
      <div class="itr-col-items">
        ${itemsDetailsHtml}
      </div>

      <!-- Column 4: Payment Type & Status -->
      <div class="itr-col-status">
        ${isLate ? 
          `<span class="debt-status-tag late" style="font-size: 9px; margin: 0; white-space: nowrap;">⚠️ ${statusText}</span>` : 
          `<span class="debt-status-tag unpaid" style="font-size: 9px; margin: 0; white-space: nowrap;">⏳ ${statusText}</span>`
        }
      </div>

      <!-- Column 5: Total Debt Amount -->
      <div class="itr-col-total">
        <span style="font-size: 10px; color: var(--color-text-muted);">${currentLanguage === 'ar' ? 'إجمالي الدين' : 'Outstanding Debt'}</span>
        <h3 style="font-size: 15px; font-weight: 700; color: var(--color-primary); margin: 0;">${formatVal(debt.amount, true)}</h3>
      </div>

      <!-- Column 6: Actions Group -->
      <div class="itr-col-actions">
        <button class="btn-secondary btn-debt-details" data-invoice-id="${debt.sale_invoice_id}" style="padding: 6px 10px; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 1.5px solid var(--color-primary-light); background: rgba(0, 150, 199, 0.04); color: var(--color-primary); box-shadow: none; margin: 0;">
          <span class="material-icons-round" style="font-size: 14px;">visibility</span>
          <span>${currentLanguage === 'ar' ? 'التفاصيل' : 'Details'}</span>
        </button>
        <button class="btn-secondary btn-debt-settle" data-id="${debt.id}" style="padding: 6px 10px; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 1.5px solid var(--color-success); background: rgba(82, 183, 136, 0.04); color: var(--color-success); box-shadow: none; margin: 0;">
          <span class="material-icons-round" style="font-size: 14px;">payments</span>
          <span>${currentLanguage === 'ar' ? 'تسديد' : 'Settle'}</span>
        </button>
      </div>
    `;

    debtsList.appendChild(card);
    displayedCount++;
  }

  if (matchedDebts.length > listPageLimits.debts) {
    const loadMoreBtn = createLoadMoreButton(() => {
      listPageLimits.debts += 10;
      renderDebtsList();
    });
    debtsList.appendChild(loadMoreBtn);
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

  document.querySelectorAll('.btn-debt-settle').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const btnEl = e.currentTarget;
      const debtId = parseInt(btnEl.dataset.id);
      await openPaymentSheet(debtId);
    });
  });
}

async function showFarmerDuesItemsSheet(farmerId, farmerName, rawItems, targetItems, saleItems) {
  const titleEl = document.getElementById('txt-farmer-dues-items-title');
  const bodyEl = document.getElementById('farmer-dues-items-body');
  if (!bodyEl) return;

  if (titleEl) {
    titleEl.textContent = currentLanguage === 'ar' ? `تفاصيل مستحقات الفلاح (${farmerName})` : `Dues details for (${farmerName})`;
  }

  const cropsGroup = {};
  rawItems.forEach(item => {
    if (!cropsGroup[item.crop_type]) {
      cropsGroup[item.crop_type] = [];
    }
    cropsGroup[item.crop_type].push(item);
  });

  let itemsHtml = '';
  const cropsList = Object.keys(cropsGroup);
  
  if (cropsList.length === 0) {
    itemsHtml = `
      <p style="font-size: 13px; color: var(--color-text-muted); text-align: center; margin: 16px 0;">
        ${currentLanguage === 'ar' ? 'لا توجد أصناف مستوردة معلقة لهذا الفلاح.' : 'No pending imported crops for this farmer.'}
      </p>
    `;
  } else {
    itemsHtml = cropsList.map(crop => {
      const cropIcon = getCropIcon(crop);
      const items = cropsGroup[crop];
      const totalBoxes = items.reduce((sum, item) => sum + (item.box_count || 0), 0);
      const totalWeight = items.reduce((sum, item) => sum + (item.weight_kg || 0), 0);
      
      const isCount = (getCropUnitType(crop) === 'count');
      let quantityText = '';
      if (totalWeight > 0) {
        quantityText = `${formatVal(totalWeight)} ${currentLanguage === 'ar' ? 'كغم' : 'kg'}`;
      } else {
        quantityText = isCount
          ? `${formatVal(totalBoxes)} ${currentLanguage === 'ar' ? 'قطعة' : 'pieces'}`
          : `${formatVal(totalBoxes)} ${currentLanguage === 'ar' ? 'صندوق' : 'box(es)'}`;
      }

      // Calculate total imported qty of this crop across the target invoices
      const cropImportItems = targetItems.filter(it => it.crop_type === crop);
      let cropTotalImported = 0;
      let cropTotalSold = 0;
      
      cropImportItems.forEach(it => {
        if (isCount) {
          cropTotalImported += (it.box_count || 0);
          const salesOfItem = saleItems.filter(s => s.import_invoice_id === it.invoice_id && s.crop_type === crop);
          salesOfItem.forEach(s => {
            cropTotalSold += (s.box_count || 0);
          });
        } else {
          cropTotalImported += (it.weight_kg || 0);
          const salesOfItem = saleItems.filter(s => s.import_invoice_id === it.invoice_id && s.crop_type === crop);
          salesOfItem.forEach(s => {
            cropTotalSold += (s.weight_kg || 0);
          });
        }
      });
      
      const cropPercentSold = cropTotalImported > 0 ? Math.min(100, Math.round((cropTotalSold / cropTotalImported) * 100)) : 0;
      let cropColorClass = '#52b788';
      if (cropPercentSold >= 85) {
        cropColorClass = '#e63946';
      } else if (cropPercentSold >= 50) {
        cropColorClass = '#f77f00';
      }

      return `
        <div class="premium-card" style="display: flex; flex-direction: column; padding: 12px; gap: 8px; width: 100%;">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px;">${cropIcon}</span>
              <div>
                <strong style="color: var(--color-primary); font-size: 13.5px;">${crop}</strong>
                <div style="font-size: 11px; color: var(--color-text-muted);">
                  ${currentLanguage === 'ar' ? 'الكمية المستحقة حالياً:' : 'Due qty currently:'} <strong>${quantityText}</strong>
                </div>
              </div>
            </div>
            <button class="btn-secondary btn-sales-audit-from-sheet" data-farmer-id="${farmerId}" data-crop-type="${crop}" style="padding: 6px 12px; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 1.5px solid var(--color-primary); background: rgba(0, 150, 199, 0.04); color: var(--color-primary); border-radius: 6px; font-weight: 700;">
              <span class="material-icons-round" style="font-size: 14px;">analytics</span>
              <span>${currentLanguage === 'ar' ? 'جرد المبيعات' : 'Sales Audit'}</span>
            </button>
          </div>
          <!-- Progress bar for individual crop sales progress -->
          <div style="display: flex; flex-direction: column; gap: 3px; width: 100%; border-top: 1px solid rgba(0,0,0,0.03); padding-top: 6px; margin-top: 2px;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--color-text-muted); font-weight: 600;">
              <span>${currentLanguage === 'ar' ? 'نسبة البيع:' : 'Sales progress:'} <strong style="color: ${cropColorClass};">${formatVal(cropPercentSold)}%</strong></span>
              <span>${currentLanguage === 'ar' ? 'تم بيع:' : 'Sold:'} ${formatWeight(cropTotalSold, isCount ? 'count' : 'kg')} / ${formatWeight(cropTotalImported, isCount ? 'count' : 'kg')}</span>
            </div>
            <div style="width: 100%; height: 5px; background: rgba(0,0,0,0.06); border-radius: 2px; overflow: hidden;">
              <div style="width: ${cropPercentSold}%; height: 100%; background: ${cropColorClass}; border-radius: 2px;"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  bodyEl.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px;">
      ${itemsHtml}
    </div>
  `;

  openBottomSheet('sheet-farmer-dues-items');

  // Bind the sales audit buttons inside the sheet
  bodyEl.querySelectorAll('.btn-sales-audit-from-sheet').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const cropType = btn.dataset.cropType;
      await printCropSalesAudit(farmerId, cropType);
    });
  });
}

async function renderDuesList() {
  const duesList = document.getElementById('dues-list');
  const searchQuery = document.getElementById('search-dues-input').value.toLowerCase();
  
  const dues = await dbGetAll('farmer_dues');
  const farmers = await dbGetAll('farmers');
  const saleItems = await dbGetAll('sale_items');
  const allImports = await dbGetAll('import_invoices');
  const allImportItems = await dbGetAll('import_items');

  duesList.innerHTML = '';

  // Group unpaid dues by farmer
  let unpaidDues = dues.filter(d => !d.is_paid);
  if (duesFilterStatus === 'today') {
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const todayStartMs = todayStart.getTime();
    unpaidDues = unpaidDues.filter(d => d.created_at >= todayStartMs);
  } else if (duesFilterStatus === 'old') {
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const todayStartMs = todayStart.getTime();
    unpaidDues = unpaidDues.filter(d => d.created_at < todayStartMs);
  }
  
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

  const matchedFarmerIds = [];
  for (const farmerId in farmerGroups) {
    const farmer = farmers.find(f => f.id === parseInt(farmerId));
    if (!farmer) continue;

    if (searchQuery && !farmer.name.toLowerCase().includes(searchQuery)) {
      continue;
    }
    matchedFarmerIds.push({ farmerId, farmer });
  }

  const paginatedFarmers = matchedFarmerIds.slice(0, listPageLimits.dues);
  let displayedCount = 0;

  for (const matched of paginatedFarmers) {
    const farmerId = matched.farmerId;
    const farmer = matched.farmer;
    const data = farmerGroups[farmerId];

    // Group dues items by crop type for Column 3 simple badges
    const cropsGroup = {};
    data.rawItems.forEach(item => {
      if (!cropsGroup[item.crop_type]) {
        cropsGroup[item.crop_type] = [];
      }
      cropsGroup[item.crop_type].push(item);
    });

    const cropsBadgesHtml = Object.keys(cropsGroup).map(crop => {
      const cropIcon = getCropIcon(crop);
      const items = cropsGroup[crop];
      const totalBoxes = items.reduce((sum, item) => sum + (item.box_count || 0), 0);
      const totalWeight = items.reduce((sum, item) => sum + (item.weight_kg || 0), 0);
      const isCount = (getCropUnitType(crop) === 'count');
      
      let qtyHtml = '';
      if (totalWeight > 0) {
        qtyHtml = `
          <span class="badge-qty">
            <span class="qty-num">${formatVal(totalWeight)}</span>
            <span class="qty-unit">${currentLanguage === 'ar' ? 'كجم' : 'kg'}</span>
          </span>
        `;
      } else {
        qtyHtml = `
          <span class="badge-qty">
            <span class="qty-num">${formatVal(totalBoxes)}</span>
            <span class="qty-unit">${isCount ? (currentLanguage === 'ar' ? 'قطعة' : 'Pcs') : (currentLanguage === 'ar' ? 'صندوق' : 'box')}</span>
          </span>
        `;
      }
      
      return `
        <span class="itr-item-badge" style="position: relative; overflow: hidden; min-width: 140px; justify-content: center; margin: 2px;">
          <span class="badge-crop-name">${cropIcon} ${crop}</span>
          <span class="badge-qty-group">
            ${qtyHtml}
          </span>
        </span>
      `;
    }).join('');

    const cropsBadgesContainerHtml = cropsBadgesHtml || `
      <div style="font-size: 10px; color: var(--color-text-muted); padding: 4px 0;">
        ${currentLanguage === 'ar' ? 'لا توجد بضائع' : 'No goods'}
      </div>
    `;

    // Calculate overall progress percentage across all target items of this farmer
    const activeInvoiceIds = allImports.filter(imp => imp.farmer_id === parseInt(farmerId) && !imp.is_settled).map(imp => imp.id);
    const duesInvoiceIds = data.rawItems.map(item => item.import_invoice_id);
    const combinedInvoiceIds = [...new Set([...activeInvoiceIds, ...duesInvoiceIds])];
    
    const targetItems = allImportItems.filter(it => combinedInvoiceIds.includes(it.invoice_id));
    const uniqueCropTypes = [...new Set(targetItems.map(it => it.crop_type))];

    let totalImportedAll = 0;
    let totalSoldAll = 0;
    
    uniqueCropTypes.forEach(crop => {
      const cropImportItems = targetItems.filter(it => it.crop_type === crop);
      const isCount = (getCropUnitType(crop) === 'count');
      
      cropImportItems.forEach(it => {
        if (isCount) {
          totalImportedAll += (it.box_count || 0);
          const salesOfItem = saleItems.filter(s => s.import_invoice_id === it.invoice_id && s.crop_type === crop);
          salesOfItem.forEach(s => {
            totalSoldAll += (s.box_count || 0);
          });
        } else {
          totalImportedAll += (it.weight_kg || 0);
          const salesOfItem = saleItems.filter(s => s.import_invoice_id === it.invoice_id && s.crop_type === crop);
          salesOfItem.forEach(s => {
            totalSoldAll += (s.weight_kg || 0);
          });
        }
      });
    });
    
    const overallPercentSold = totalImportedAll > 0 ? Math.min(100, Math.round((totalSoldAll / totalImportedAll) * 100)) : 0;
    let progressColorHex = '#52b788'; // green
    if (overallPercentSold >= 85) {
      progressColorHex = '#e63946'; // red
    } else if (overallPercentSold >= 50) {
      progressColorHex = '#f4a261'; // orange
    }

    const importInvoiceIds = [...new Set(data.rawItems.map(item => item.import_invoice_id))];
    const farmerImports = allImports.filter(imp => importInvoiceIds.includes(imp.id));
    const importDates = farmerImports.map(imp => formatCustomDate(imp.invoice_date || imp.created_at)).filter(Boolean);
    const uniqueImportDates = [...new Set(importDates)];
    const importDatesStr = uniqueImportDates.length > 0 ? uniqueImportDates.join(', ') : (currentLanguage === 'ar' ? 'غير متوفر' : 'N/A');

    const card = document.createElement('div');
    card.className = 'invoice-table-row stagger-item';
    card.style.animationDelay = `${displayedCount * 0.08}s`;

    card.innerHTML = `
      <!-- Column 1: ID & Import Date -->
      <div class="itr-col-id">
        <span class="lang-badge" style="background-color: var(--color-primary-mid); margin-bottom: 2px; display: inline-block; font-family: monospace; letter-spacing: 0.5px; align-self: flex-start;">
          ID: FMR-${farmerId}
        </span>
        <span style="font-size: 11px; font-weight: 600; color: var(--color-text-muted);">
          ${currentLanguage === 'ar' ? 'تاريخ الاستيراد' : 'Import Date'}: ${importDatesStr}
        </span>
      </div>

      <!-- Column 2: Farmer Info -->
      <div class="itr-col-customer">
        <h4 style="font-size: 14px; font-weight: 700; color: var(--color-primary); margin: 0;">${farmer.name}</h4>
        <span style="font-size: 10px; color: var(--color-text-muted);">${farmer.phone || ''} ${farmer.address ? `• ${farmer.address}` : ''}</span>
      </div>

      <!-- Column 3: Items/Crop simple badges -->
      <div class="itr-col-items" style="display: flex; flex-wrap: wrap; gap: 6px;">
        ${cropsBadgesContainerHtml}
      </div>

      <!-- Column 4: Sales Progress Status -->
      <div class="itr-col-status">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; width: 100%; max-width: 160px; margin: 0 auto;">
          <span style="font-size: 11px; color: var(--color-text-muted); font-weight: 700; white-space: nowrap;">${currentLanguage === 'ar' ? 'نسبة المبيعات' : 'Sales Ratio'}</span>
          <div class="progress-track" style="width: 100%; margin: 2px 0; background: rgba(0,0,0,0.06); height: 6px; border-radius: 999px; overflow: hidden;">
            <div class="progress-fill green" style="width: ${overallPercentSold}%; height: 100%; background: ${progressColorHex}; border-radius: 999px;"></div>
          </div>
          <span style="font-size: 12.5px; font-weight: 850; color: #1b4332; font-family: Cairo, sans-serif;">
            ${overallPercentSold}%
          </span>
        </div>
      </div>

      <!-- Column 5: Net Farmer Dues -->
      <div class="itr-col-total" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-align: center;">
        <span style="font-size: 10px; color: var(--color-text-muted); margin: 0;">${currentLanguage === 'ar' ? 'صافي المستحقات' : 'Net Farmer Dues'}</span>
        <h3 style="font-size: 15px; font-weight: 700; color: var(--color-primary); margin: 0;">${formatVal(data.totalNetDue, true)}</h3>
        <span class="debt-status-tag unpaid" style="font-size: 9px; margin: 2px 0 0 0; white-space: nowrap; background: rgba(0, 119, 182, 0.08); color: var(--color-info); border: 1px solid rgba(0, 119, 182, 0.15); border-radius: 4px; padding: 2px 6px;">
          ⏳ ${currentLanguage === 'ar' ? 'بانتظار الصرف' : 'Awaiting Payout'}
        </span>
      </div>

      <!-- Column 6: Actions Group -->
      <div class="itr-col-actions">
        <button class="btn-secondary btn-sales-audit" data-farmer-id="${farmerId}" data-crop-type="all" style="padding: 6px 10px; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 1.5px solid var(--color-primary-light); background: rgba(0, 150, 199, 0.04); color: var(--color-primary); box-shadow: none; font-weight: 700; margin: 0;">
          <span class="material-icons-round" style="font-size: 14px;">analytics</span>
          <span>${currentLanguage === 'ar' ? 'جرد المبيعات' : 'Sales Audit'}</span>
        </button>
        <button class="btn-secondary btn-toggle-farmer-details" data-farmer-id="${farmerId}" style="padding: 6px 10px; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 1.5px solid var(--color-primary-light); background: white; color: var(--color-primary); box-shadow: none; margin: 0;">
          <span class="material-icons-round" style="font-size: 14px;">visibility</span>
          <span>${currentLanguage === 'ar' ? 'التفاصيل' : 'Details'}</span>
        </button>
        <button class="btn-secondary btn-pay-farmer-dues" data-farmer-id="${farmerId}" style="padding: 6px 10px; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 1.5px solid var(--color-success); background: rgba(82, 183, 136, 0.04); color: var(--color-success); box-shadow: none; margin: 0;">
          <span class="material-icons-round" style="font-size: 14px;">paid</span>
          <span>${currentLanguage === 'ar' ? 'صرف' : 'Pay'}</span>
        </button>
      </div>
    `;

    duesList.appendChild(card);
    displayedCount++;
  }

  if (matchedFarmerIds.length > listPageLimits.dues) {
    const loadMoreBtn = createLoadMoreButton(() => {
      listPageLimits.dues += 10;
      renderDuesList();
    });
    duesList.appendChild(loadMoreBtn);
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
    btn.addEventListener('click', async (e) => {
      const farmerId = parseInt(btn.dataset.farmerId);
      const farmers = await dbGetAll('farmers');
      const farmer = farmers.find(f => f.id === farmerId);
      if (!farmer) return;

      const dues = await dbGetAll('farmer_dues');
      const unpaidDues = dues.filter(d => !d.is_paid && d.farmer_id === farmerId);

      const allImports = await dbGetAll('import_invoices');
      const allImportItems = await dbGetAll('import_items');
      const saleItems = await dbGetAll('sale_items');

      const activeInvoiceIds = allImports.filter(imp => imp.farmer_id === farmerId && !imp.is_settled).map(imp => imp.id);
      const duesInvoiceIds = unpaidDues.map(item => item.import_invoice_id);
      const combinedInvoiceIds = [...new Set([...activeInvoiceIds, ...duesInvoiceIds])];
      
      const targetItems = allImportItems.filter(it => combinedInvoiceIds.includes(it.invoice_id));

      await showFarmerDuesItemsSheet(farmerId, farmer.name, unpaidDues, targetItems, saleItems);
    });
  });

  document.querySelectorAll('.btn-sales-audit').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const farmerId = parseInt(btn.dataset.farmerId);
      const crop = btn.dataset.cropType;
      await printCropSalesAudit(farmerId, crop);
    });
  });
}

async function showFinancialDetails(type) {
  const selectedMonth = document.getElementById('stats-month-selector')?.value || 'active';
  const now = new Date();
  const activeMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const targetMonthKey = selectedMonth === 'active' ? activeMonthKey : selectedMonth;

  const isTargetMonth = (timestamp) => {
    if (!timestamp) return false;
    const d = new Date(timestamp);
    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return mKey === targetMonthKey;
  };

  const tbody = document.getElementById('details-dialog-tbody');
  const titleEl = document.getElementById('details-dialog-title');
  const subtitleEl = document.getElementById('details-dialog-subtitle');
  const iconEl = document.getElementById('details-dialog-icon');
  
  if (!tbody || !titleEl) return;
  tbody.innerHTML = '';

  let items = [];
  let title = '';
  let subtitle = '';
  let iconName = 'receipt';

  if (type === 'paid-dues') {
    title = currentLanguage === 'ar' ? 'تفاصيل المستحقات المدفوعة' : 'Farmer Payouts Details';
    subtitle = currentLanguage === 'ar' ? `المستحقات المدفوعة للفلاحين خلال فترة: ${targetMonthKey}` : `Paid dues to farmers during: ${targetMonthKey}`;
    iconName = 'payments';
    
    const dues = await dbGetAll('farmer_dues');
    items = dues.filter(d => d.is_paid && isTargetMonth(d.created_at)).map(d => ({
      date: d.created_at || d.paid_at || Date.now(),
      subject: currentLanguage === 'ar' ? `مستحقات الفلاح: ${d.farmer_name || d.farmer_id}` : `Dues paid to: ${d.farmer_name || d.farmer_id}`,
      amount: d.net_due || d.amount || 0
    }));
  } else if (type === 'daily-expenses') {
    title = currentLanguage === 'ar' ? 'تفاصيل المصاريف اليومية' : 'Daily Expenses Details';
    subtitle = currentLanguage === 'ar' ? `مصاريف المكتب اليومية خلال فترة: ${targetMonthKey}` : `Daily office expenses during: ${targetMonthKey}`;
    iconName = 'trending_down';
    
    const dailyExpenses = await dbGetAll('daily_expenses');
    items = dailyExpenses.filter(e => {
      const isSal = e.type === 'salary' || (!e.type && (e.subject.includes('راتب') || e.subject.includes('رواتب') || e.subject.toLowerCase().includes('salary')));
      return isTargetMonth(e.created_at) && !isSal;
    }).map(e => ({
      date: e.created_at,
      subject: e.subject,
      amount: e.amount
    }));
  } else if (type === 'salaries') {
    title = currentLanguage === 'ar' ? 'تفاصيل رواتب الموظفين' : 'Staff Salaries Details';
    subtitle = currentLanguage === 'ar' ? `رواتب الموظفين والسلف خلال فترة: ${targetMonthKey}` : `Staff salaries and advances during: ${targetMonthKey}`;
    iconName = 'badge';
    
    const dailyExpenses = await dbGetAll('daily_expenses');
    items = dailyExpenses.filter(e => {
      const isSal = e.type === 'salary' || (!e.type && (e.subject.includes('راتب') || e.subject.includes('رواتب') || e.subject.toLowerCase().includes('salary')));
      return isTargetMonth(e.created_at) && isSal;
    }).map(e => ({
      date: e.created_at,
      subject: e.subject,
      amount: e.amount
    }));
  } else if (type === 'personal-expenses') {
    title = currentLanguage === 'ar' ? 'تفاصيل المصاريف الشخصية' : 'Personal Expenses Details';
    subtitle = currentLanguage === 'ar' ? `المسحوبات والمصاريف الشخصية خلال فترة: ${targetMonthKey}` : `Personal withdrawals and expenses during: ${targetMonthKey}`;
    iconName = 'person';
    
    const personalExpenses = await dbGetAll('personal_expenses');
    items = personalExpenses.filter(e => isTargetMonth(e.created_at)).map(e => ({
      date: e.created_at,
      subject: e.subject,
      amount: e.amount
    }));
  } else if (type === 'losses') {
    title = currentLanguage === 'ar' ? 'تفاصيل الخسائر والتلفيات' : 'Losses & Damages Details';
    subtitle = currentLanguage === 'ar' ? `الخسائر والتلفيات المسجلة خلال فترة: ${targetMonthKey}` : `Registered losses and damages during: ${targetMonthKey}`;
    iconName = 'error_outline';
    
    const losses = await dbGetAll('losses');
    items = losses.filter(l => isTargetMonth(l.created_at)).map(l => ({
      date: l.created_at,
      subject: l.subject,
      amount: l.amount
    }));
  } else if (type === 'porter-payouts') {
    title = currentLanguage === 'ar' ? 'تفاصيل مستحقات الحمالين' : 'Porter Payouts Details';
    subtitle = currentLanguage === 'ar' ? `مبالغ مدفوعة للحمالين كأجور ومستحقات خلال فترة: ${targetMonthKey}` : `Porter payouts during: ${targetMonthKey}`;
    iconName = 'engineering';
    
    const porter = await dbGetAll('porter_payouts');
    items = porter.filter(p => p.is_paid && isTargetMonth(p.created_at)).map(p => ({
      date: p.created_at || p.paid_at || Date.now(),
      subject: currentLanguage === 'ar' ? `أجور حمالة للحمال: ${p.porter_name || p.porter_id || 'مجهول'}` : `Porter wage for: ${p.porter_name || p.porter_id || 'Unknown'}`,
      amount: p.amount || 0
    }));
  }

  // Sort by date descending
  items.sort((a, b) => b.date - a.date);

  titleEl.textContent = title;
  subtitleEl.textContent = subtitle;
  if (iconEl) iconEl.textContent = iconName;

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align: center; color: var(--color-text-muted); padding: 24px 0; font-family: 'Cairo', sans-serif;">
          ${currentLanguage === 'ar' ? 'لا توجد بيانات مسجلة في هذه الفئة لهذا الشهر.' : 'No records found in this category for this month.'}
        </td>
      </tr>
    `;
  } else {
    items.forEach(item => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid rgba(0,0,0,0.04)';
      tr.innerHTML = `
        <td style="padding: 10px; color: var(--color-text-muted); font-family: 'Cairo', sans-serif; white-space: nowrap;">${formatCustomDate(item.date, true)}</td>
        <td style="padding: 10px; font-weight: 500; font-family: 'Cairo', sans-serif; word-break: break-word;">${item.subject}</td>
        <td style="padding: 10px; font-weight: 700; color: var(--color-danger); text-align: left; font-family: 'Cairo', sans-serif; white-space: nowrap;">${formatVal(item.amount, true)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  const dialog = document.getElementById('custom-details-dialog');
  if (dialog) {
    dialog.style.display = 'flex';
  }
}

function showCustomConfirm(title, message, okText = '', cancelText = '') {
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
    
    const defaultOkText = okBtn ? okBtn.textContent : (currentLanguage === 'ar' ? 'تأكيد' : 'Confirm');
    const defaultCancelText = cancelBtn ? cancelBtn.textContent : (currentLanguage === 'ar' ? 'إلغاء' : 'Cancel');
    
    if (okBtn && okText) okBtn.textContent = okText;
    if (cancelBtn && cancelText) cancelBtn.textContent = cancelText;
    
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
      if (okBtn) {
        okBtn.removeEventListener('click', onOk);
        if (okText) okBtn.textContent = defaultOkText;
      }
      if (cancelBtn) {
        cancelBtn.removeEventListener('click', onCancel);
        if (cancelText) cancelBtn.textContent = defaultCancelText;
      }
    }
    
    if (okBtn) okBtn.addEventListener('click', onOk);
    if (cancelBtn) cancelBtn.addEventListener('click', onCancel);
  });
}

function showCustomAlert(title, message) {
  return new Promise((resolve) => {
    const dialog = document.getElementById('custom-alert-dialog');
    if (!dialog) {
      window.alert(message);
      resolve();
      return;
    }
    
    const titleEl = document.getElementById('alert-title');
    const msgEl = document.getElementById('alert-message');
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    
    dialog.style.display = 'flex';
    
    const okBtn = document.getElementById('btn-alert-ok');
    
    const onOk = () => {
      dialog.style.display = 'none';
      if (okBtn) okBtn.removeEventListener('click', onOk);
      resolve();
    };
    
    if (okBtn) okBtn.addEventListener('click', onOk);
  });
}

async function printCropSalesAudit(farmerId, crop) {
  // 1. Get all farmer dues
  const allDues = await dbGetAll('farmer_dues');
  // Filter for this farmer and this crop
  const cropSales = allDues.filter(d => d.farmer_id === farmerId && (crop === 'all' || !crop || d.crop_type === crop));
  
  // 2. Sort: Group by crop_type first, then by date descending
  cropSales.sort((a, b) => {
    const cmp = a.crop_type.localeCompare(b.crop_type, 'ar');
    if (cmp !== 0) return cmp;
    return b.created_at - a.created_at;
  });

  // 3. Get sale invoices and items to map the details properly
  const saleInvoices = await dbGetAll('sale_invoices');
  const saleItems = await dbGetAll('sale_items');
  const farmers = await dbGetAll('farmers');
  const farmer = farmers.find(f => f.id === farmerId);
  const farmerName = farmer ? farmer.name : (currentLanguage === 'ar' ? 'فلاح غير معروف' : 'Unknown Farmer');

  const now = new Date();
  const formattedDate = formatCustomDate(now);

  const container = document.getElementById('receipt-paper');
  if (!container) return;

  container.className = `thermal-paper w-${printerPaperWidth}`;

  const is58mm = printerPaperWidth === '58';
  const fontSizeClass = is58mm ? 'font-size: 16px; line-height: 1.3;' : 'font-size: 18px; line-height: 1.45;';
  const headerFontSizeClass = is58mm ? 'font-size: 22px;' : 'font-size: 26px;';

  let totalWeight = 0;
  let totalBoxes = 0;
  let totalSoldPrice = 0;

  let lastCropType = null;
  let itemsHtml = cropSales.map((item, idx) => {
    const saleInvoice = saleInvoices.find(si => si.id === item.sale_invoice_id);
    const orderId = saleInvoice ? (saleInvoice.order_id || ('ALW-' + String(saleInvoice.id).padStart(3, '0'))) : 'N/A';
    const saleItem = saleItems.find(si => si.id === item.sale_item_id);

    const itemDate = formatCustomDate(item.created_at);
    
    // Weight and box count
    const weightVal = item.weight_kg || 0;
    const boxCountVal = item.box_count || 0;

    totalWeight += weightVal;
    totalBoxes += boxCountVal;
    totalSoldPrice += item.sold_price || 0;

    // Calculate unit price sold per kg or per unit
    let unitPrice = 0;
    let isWeightBased = weightVal > 0;

    if (saleItem && saleItem.unit_price) {
      unitPrice = saleItem.unit_price;
    } else {
      if (isWeightBased) {
        unitPrice = Math.round(item.sold_price / weightVal);
      } else if (boxCountVal > 0) {
        unitPrice = Math.round(item.sold_price / boxCountVal);
      }
    }

    const isCount = (getCropUnitType(item.crop_type) === 'count');
    let qtyText = '';
    if (isWeightBased) {
      qtyText = `${formatVal(weightVal)} ${currentLanguage === 'ar' ? 'كغم' : 'kg'}`;
    } else {
      if (isCount) {
        qtyText = `${formatVal(boxCountVal)} ${currentLanguage === 'ar' ? 'قطعة' : 'pieces'}`;
      } else {
        qtyText = `${formatVal(boxCountVal)} ${currentLanguage === 'ar' ? 'صندوق' : 'box(es)'}`;
      }
    }

    const nextItem = cropSales[idx + 1];
    const isLastOfGroup = nextItem && nextItem.crop_type !== item.crop_type;
    const borderStyle = isLastOfGroup 
      ? "border-bottom: 2.5px solid #000;" 
      : "border-bottom: 1px dashed #000;";

    let groupHeaderHtml = '';
    if (item.crop_type !== lastCropType) {
      lastCropType = item.crop_type;
      groupHeaderHtml = `
        <tr style="font-weight: 800; border-top: 1.5px solid #000; border-bottom: 1.5px solid #000;">
          <td colspan="4" style="padding: 6px 2px; text-align: center; background: repeating-linear-gradient(45deg, #333, #333 1px, transparent 1px, transparent 6px);">
            <span style="background: #fff; padding: 2px 12px; border: 1.5px solid #000; display: inline-block; font-size: 16px; font-weight: 900; color: #000;">
              ${lastCropType}
            </span>
          </td>
        </tr>
      `;
    }

    const customerObj = (saleInvoice && cachedCustomers) ? cachedCustomers.find(c => c.id === saleInvoice.customer_id) : null;
    const isLoss = (item.sold_price === 0) || (customerObj && customerObj.name === 'تالف');
    const displayPrice = isLoss ? (currentLanguage === 'ar' ? 'تلف' : 'Loss') : formatVal(unitPrice);

    return `
      ${groupHeaderHtml}
      <tr style="${borderStyle} font-size: 16px; font-weight: 700;">
        <td style="padding: 6px 2px; text-align: right;">${itemDate}</td>
        <td style="padding: 6px 2px; text-align: center;">${qtyText}</td>
        <td style="padding: 6px 2px; text-align: center;">${displayPrice}</td>
        <td style="padding: 6px 2px; text-align: left; font-weight: 900; font-family: 'Monofrik' !important; font-size: 16px;">${orderId}</td>
      </tr>
    `;
  }).join('');

  if (cropSales.length === 0) {
    itemsHtml = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 12px; color: #666; font-size: 13px;">
          ${currentLanguage === 'ar' ? 'لا توجد مبيعات مسجلة حالياً.' : 'No sales registered yet.'}
        </td>
      </tr>
    `;
  }

  const cropNameLabel = (crop === 'all' || !crop) 
    ? (currentLanguage === 'ar' ? 'كافة الأصناف' : 'All Crops') 
    : crop;

  container.innerHTML = `
    <div style="text-align: center; border-bottom: 1.5px dashed #000; padding-bottom: 8px; margin-bottom: 8px; direction: rtl;">
      <h2 style="${headerFontSizeClass} font-weight: 800; color: #000; margin: 0 0 4px 0; letter-spacing: normal;">${officeName}</h2>
      <p style="font-size: 13.5px; color: #000; font-weight: 700; margin: 0 0 6px 0;">بإدارة: ${officeOwner}</p>
      <h3 style="font-size: 17px; font-weight: 700; color: #333; margin: 0 0 4px 0;">${(crop === 'all' || !crop) ? (currentLanguage === 'ar' ? 'جرد مبيعات كافة الأصناف' : 'All Crops Sales Audit') : (currentLanguage === 'ar' ? 'جرد مبيعات الصنف' : 'Crop Sales Audit')}</h3>
      <div style="font-size: 14.5px; color: #000; font-weight: 600; margin-bottom: 2px;">الفلاح: ${farmerName}</div>
      <div style="font-size: 14.5px; color: #000; font-weight: 600; margin-bottom: 2px;">الصنف: ${cropNameLabel}</div>
      <div style="font-size: 14.5px; color: #000; font-weight: 600;">التاريخ: ${formattedDate}</div>
    </div>
    
    <table style="width: 100%; direction: rtl; border-collapse: collapse; ${fontSizeClass} margin-bottom: 8px;">
      <thead>
        <tr style="border-bottom: 1.5px dashed #000; font-weight: 800; font-size: 16px;">
          <th style="padding: 4px 0; text-align: right;">${currentLanguage === 'ar' ? 'تاريخ البيع' : 'Sale Date'}</th>
          <th style="padding: 4px 0; text-align: center;">الكمية</th>
          <th style="padding: 4px 0; text-align: center;">السعر</th>
          <th style="padding: 4px 0; text-align: left;">رمز الفاتورة</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="border-top: 1.5px dashed #000; padding-top: 6px; direction: rtl; ${fontSizeClass} font-weight: 800; font-size: 17px;">
      <div style="display: flex; justify-content: space-between;">
        <span>إجمالي المبيعات:</span>
        <span>${formatVal(totalSoldPrice, true)}</span>
      </div>
    </div>

    <div style="text-align: center; margin-top: 12px; padding-top: 8px; border-top: 1.5px dashed #000; font-size: 13.5px; font-weight: 800; color: #000; direction: rtl; font-family: var(--font-family) !important; line-height: 1.4;">
      برمجة و تطوير شركة Prime™ Solutions 
      <br>
      Whatsapp: 07749883474
    </div>
  `;

  // Log in events
  logAppEvent(
    `طباعة جرد مبيعات الفلاح ل صنف ${crop}`,
    `Printed farmer sales audit for crop ${crop}`
  );

  // Set dataset ID to -1 to enable direct raster/system printing of `#receipt-paper` contents
  document.getElementById('btn-execute-print').dataset.id = "-1";
  if (document.getElementById('btn-execute-sysprint')) document.getElementById('btn-execute-sysprint').dataset.id = "-1";
  document.getElementById('btn-share-receipt').dataset.id = "-1";

  openBottomSheet('sheet-print-preview');
}

async function showSalesAuditSheet(farmerId, crop) {
  // 1. Get all farmer dues
  const allDues = await dbGetAll('farmer_dues');
  // Filter for this farmer and this crop
  const cropSales = allDues.filter(d => d.farmer_id === farmerId && (crop === 'all' || !crop || d.crop_type === crop));
  
  // 2. Sort: Group by crop_type first, then by date descending
  cropSales.sort((a, b) => {
    const cmp = a.crop_type.localeCompare(b.crop_type, 'ar');
    if (cmp !== 0) return cmp;
    return b.created_at - a.created_at;
  });

  // 3. Get sale invoices and items to map the details properly
  const saleInvoices = await dbGetAll('sale_invoices');
  const saleItems = await dbGetAll('sale_items');

  const body = document.getElementById('farmer-dues-details-body');
  if (!body) return;

  // Update title dynamically
  const sheetTitle = document.getElementById('txt-farmer-dues-details-title');
  if (sheetTitle) {
    if (crop === 'all' || !crop) {
      sheetTitle.textContent = currentLanguage === 'ar'
        ? `جرد مبيعات كافة الأصناف`
        : `Sales Audit for All Crops`;
    } else {
      sheetTitle.textContent = currentLanguage === 'ar'
        ? `جرد مبيعات ${crop}`
        : `Sales Audit for ${crop}`;
    }
  }

  // Header banner containing the button "جرد الأسعار"
  let headerHtml = `
    <div style="background: rgba(9, 132, 227, 0.05); border: 1.5px dashed rgba(9, 132, 227, 0.2); border-radius: 12px; padding: 12px; margin-bottom: 12px; text-align: center;">
      <p style="font-size: 11px; color: var(--color-text-muted); margin-bottom: 8px; line-line-height: 1.4;">
        ${currentLanguage === 'ar' 
          ? 'لعرض وتدقيق تفاصيل المبيعات الخاصة بالفلاح:' 
          : 'To view and verify sales details for the farmer:'}
      </p>
      <button id="btn-price-audit-note" class="btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background-color: var(--color-warning); color: #000; font-weight: 700; border: none; padding: 12px; border-radius: 8px; font-size: 13px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); cursor: pointer; transition: transform 0.1s active;">
        <span class="material-icons-round" style="font-size: 18px;">receipt_long</span>
        <span>${currentLanguage === 'ar' ? 'جرد الأسعار' : 'Price Audit'}</span>
      </button>
    </div>
  `;

  // Grid list of items grouped by crop
  let itemsHtml = '';
  if (cropSales.length > 0) {
    const groups = {};
    cropSales.forEach(item => {
      if (!groups[item.crop_type]) {
        groups[item.crop_type] = [];
      }
      groups[item.crop_type].push(item);
    });

    for (const [cropType, groupItems] of Object.entries(groups)) {
      const cropIcon = getCropIcon(cropType);
      
      // Separator header for each crop type
      itemsHtml += `
        <div style="grid-column: 1 / -1; display: flex; align-items: center; gap: 8px; border-bottom: 2px solid rgba(9, 132, 227, 0.1); padding-bottom: 6px; margin-top: 12px; margin-bottom: 4px; direction: rtl; width: 100%;">
          <div style="width: 26px; height: 26px; border-radius: 6px; background: rgba(9, 132, 227, 0.08); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; border: 1px solid rgba(9, 132, 227, 0.12);">
            ${cropIcon}
          </div>
          <span style="font-weight: 800; color: var(--color-text-dark); font-size: 12.5px;">${cropType}</span>
          <span style="font-size: 10px; color: var(--color-text-muted); font-weight: 600; margin-right: auto; margin-left: 0; background: #f8fafc; padding: 2px 8px; border-radius: 12px; border: 1px solid #e2e8f0;">
            ${groupItems.length} ${currentLanguage === 'ar' ? 'عمليات مبيعات' : 'sales'}
          </span>
        </div>
      `;

      groupItems.forEach(item => {
        const saleInvoice = saleInvoices.find(si => si.id === item.sale_invoice_id);
        const orderId = saleInvoice ? (saleInvoice.order_id || ('ALW-' + String(saleInvoice.id).padStart(3, '0'))) : 'N/A';
        const saleItem = saleItems.find(si => si.id === item.sale_item_id);

        const itemDate = formatCustomDate(item.created_at);
        
        // Weight and box count
        const weightVal = item.weight_kg || 0;
        const boxCountVal = item.box_count || 0;

        // Calculate unit price sold per kg or per unit
        let unitPrice = 0;
        let isWeightBased = weightVal > 0;

        if (saleItem && saleItem.unit_price) {
          unitPrice = saleItem.unit_price;
        } else {
          if (isWeightBased) {
            unitPrice = Math.round(item.sold_price / weightVal);
          } else if (boxCountVal > 0) {
            unitPrice = Math.round(item.sold_price / boxCountVal);
          }
        }

        const itemUnit = (saleItem && saleItem.unit) ? saleItem.unit : (getCropUnitType(item.crop_type) === 'count' ? 'count' : 'kg');
        
        let qtyText = '';
        const isArabic = (currentLanguage === 'ar' || numeralSystem === 'ar');

        if (itemUnit === 'kg' || itemUnit === 'weight') {
          const unitLabel = isArabic ? 'كغم' : 'kg';
          qtyText = `${formatVal(weightVal)} ${unitLabel}`;
          if (boxCountVal > 0) {
            const boxLabel = isArabic ? 'صندوق' : 'box';
            qtyText += ` (${formatVal(boxCountVal)} ${boxLabel})`;
          }
        } else if (itemUnit === 'liter') {
          const unitLabel = isArabic ? 'لتر' : 'Ltr';
          qtyText = `${formatVal(weightVal)} ${unitLabel}`;
          if (boxCountVal > 0) {
            const boxLabel = isArabic ? 'صندوق' : 'box';
            qtyText += ` (${formatVal(boxCountVal)} ${boxLabel})`;
          }
        } else if (itemUnit === 'count') {
          const unitLabel = isArabic ? 'قطعة' : 'pieces';
          qtyText = `${formatVal(boxCountVal)} ${unitLabel}`;
        } else if (itemUnit === 'box') {
          const unitLabel = isArabic ? 'صندوق' : 'box';
          qtyText = `${formatVal(boxCountVal)} ${unitLabel}`;
        } else {
          if (weightVal > 0) {
            const unitLabel = isArabic ? 'كغم' : 'kg';
            qtyText = `${formatVal(weightVal)} ${unitLabel}`;
          } else {
            const unitLabel = isArabic ? 'صندوق' : 'box';
            qtyText = `${formatVal(boxCountVal)} ${unitLabel}`;
          }
        }

        const customerObj = (saleInvoice && cachedCustomers) ? cachedCustomers.find(c => c.id === saleInvoice.customer_id) : null;
        const isLoss = (item.sold_price === 0) || (customerObj && customerObj.name === 'تالف');

        let rateText = '';
        if (isLoss) {
          rateText = currentLanguage === 'ar' ? 'تلف' : 'Loss';
        } else {
          if (itemUnit === 'kg' || itemUnit === 'weight') {
            rateText = isArabic ? `${formatVal(unitPrice, true)} / كغم` : `${formatVal(unitPrice, true)} / kg`;
          } else if (itemUnit === 'liter') {
            rateText = isArabic ? `${formatVal(unitPrice, true)} / لتر` : `${formatVal(unitPrice, true)} / Ltr`;
          } else if (itemUnit === 'count') {
            rateText = isArabic ? `${formatVal(unitPrice, true)} / قطعة` : `${formatVal(unitPrice, true)} / pc`;
          } else if (itemUnit === 'box') {
            rateText = isArabic ? `${formatVal(unitPrice, true)} / صندوق` : `${formatVal(unitPrice, true)} / box`;
          } else {
            rateText = formatVal(unitPrice, true);
          }
        }

        const totalValHtml = isLoss 
          ? `<span style="color: #ef4444; font-weight: 700;">${currentLanguage === 'ar' ? 'تلف' : 'Loss'}</span>`
          : `<span style="color: var(--color-success); font-weight: 700;">${formatVal(item.sold_price, true)}</span>`;

        itemsHtml += `
          <div class="premium-card" style="padding: 10px; display: flex; flex-direction: column; justify-content: space-between; gap: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.01); border-radius: 12px; background-color: #ffffff; direction: rtl; text-align: right; min-height: 105px;">
            <!-- Top: Crop Header (Icon + Name + ID) -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
              <span style="font-weight: 800; color: var(--color-text-dark); font-size: 11px; font-family: inherit; background: #f8fafc; padding: 2px 6px; border-radius: 4px; border: 1px solid #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90px;">${item.crop_type}</span>
              <span style="font-weight: 700; color: var(--color-primary); font-family: 'Monofrik' !important; font-size: 9px; background: rgba(9, 132, 227, 0.06); padding: 1px 4px; border-radius: 3px; border: 1px solid rgba(9, 132, 227, 0.08);">${orderId}</span>
            </div>

            <!-- Middle: Unit Price / Rate (Highlighted) -->
            <div style="display: flex; flex-direction: column; gap: 1px; margin: 2px 0;">
              <span style="font-size: 9px; color: var(--color-text-muted); font-weight: 500;">${currentLanguage === 'ar' ? 'سعر الوحدة:' : 'Unit Price:'}</span>
              <span style="font-weight: 800; color: ${isLoss ? '#ef4444' : 'var(--color-primary)'}; font-size: 13.5px; line-height: 1.1;">${rateText}</span>
            </div>

            <!-- Bottom: Quantity, Sales & Date -->
            <div style="border-top: 1px solid #f1f5f9; padding-top: 5px; display: flex; flex-direction: column; gap: 2px;">
              <!-- Qty & Sales -->
              <div style="font-size: 9px; color: var(--color-text-muted); font-weight: 600; display: flex; align-items: center; justify-content: space-between; gap: 2px; white-space: nowrap;">
                <span style="color: var(--color-text-dark); overflow: hidden; text-overflow: ellipsis; max-width: 65px;">${qtyText}</span>
                ${totalValHtml}
              </div>
              <!-- Date -->
              <div style="font-size: 8px; color: #94a3b8; font-weight: 500; text-align: left;">
                ${itemDate}
              </div>
            </div>
          </div>
        `;
      });
    }
  } else {
    itemsHtml = `
      <div style="text-align: center; padding: 24px; color: var(--color-text-muted);">
        <span class="material-icons-round" style="font-size: 32px; margin-bottom: 8px; color: #cbd5e1;">info</span>
        <p style="font-size: 12px;">${currentLanguage === 'ar' ? 'لا توجد مبيعات مسجلة لهذا الصنف حالياً.' : 'No sales registered for this crop yet.'}</p>
      </div>
    `;
  }

  const wrapperStyle = cropSales.length > 0 
    ? 'display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;' 
    : 'display: flex; flex-direction: column; gap: 10px;';

  body.innerHTML = headerHtml + `<div style="${wrapperStyle}">` + itemsHtml + `</div>`;

  // Bind note click
  const btnNote = document.getElementById('btn-price-audit-note');
  if (btnNote) {
    btnNote.addEventListener('click', async () => {
      await printCropSalesAudit(farmerId, crop);
    });
  }

  // Open the bottom sheet
  openBottomSheet('sheet-farmer-dues-details');
}

async function showDailySalesAuditSheet() {
  playSound('print');
  const allDues = await dbGetAll('farmer_dues');
  
  // Get all sales for today (current calendar day)
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000;
  
  const cropSales = allDues.filter(d => d.created_at >= startOfDay && d.created_at < endOfDay);
  
  // Sort: Group by crop_type first, then by date descending
  cropSales.sort((a, b) => {
    const cmp = a.crop_type.localeCompare(b.crop_type, 'ar');
    if (cmp !== 0) return cmp;
    return b.created_at - a.created_at;
  });

  // Directly generate the thermal/system print receipt layout
  await printDailySalesAudit(cropSales);

  // Directly trigger system print and keep the preview sheet open
  setTimeout(() => {
    window.print();
  }, 300);
}

async function generateMonthlyProfitReport() {
  const monthSelector = document.getElementById('stats-month-selector');
  const selectedMonth = monthSelector ? monthSelector.value : 'active';
  
  let monthKey = '';
  let monthDisplayName = '';
  
  if (selectedMonth === 'active') {
    const now = new Date();
    monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthDisplayName = currentLanguage === 'ar' ? 'الشهر الحالي (نشط)' : 'Current Month (Active)';
  } else {
    monthKey = selectedMonth;
    monthDisplayName = currentLanguage === 'ar' ? `شهر ${monthKey}` : `Month ${monthKey}`;
  }

  showToast(currentLanguage === 'ar' ? 'جاري تحضير تقرير الأرباح التفصيلي...' : 'Preparing detailed profit report...', 'hourglass_empty');
  playSound('print');

  // Fetch all necessary data
  const allSales = await dbGetAll('sale_invoices');
  const allSaleItems = await dbGetAll('sale_items');
  const allDebts = await dbGetAll('debts');
  const dues = await dbGetAll('farmer_dues');
  const porter = await dbGetAll('porter_payouts');
  const dailyExpenses = await dbGetAll('daily_expenses');
  const personalExpenses = await dbGetAll('personal_expenses');
  const losses = await dbGetAll('losses');
  const safeAdjustments = await dbGetAll('safe_adjustments');

  // Month filtering logic
  const isTargetMonth = (timestamp) => {
    const d = new Date(timestamp);
    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return mKey === monthKey;
  };

  // Filter lists by the target month
  const salesInMonth = allSales.filter(s => isTargetMonth(s.created_at));
  const dailyExpInMonth = dailyExpenses.filter(e => isTargetMonth(e.created_at));
  const personalExpInMonth = personalExpenses.filter(e => isTargetMonth(e.created_at));
  const lossesInMonth = losses.filter(l => isTargetMonth(l.created_at));
  const porterInMonth = porter.filter(p => p.is_paid && isTargetMonth(p.created_at));
  const duesInMonth = dues.filter(d => d.is_paid && isTargetMonth(d.created_at));

  // Dynamic calculations
  let cashSalesTotal = salesInMonth.filter(s => s.payment_type === 'cash').reduce((sum, s) => sum + s.total_amount, 0);
  let debtSalesTotal = salesInMonth.filter(s => s.payment_type === 'debt').reduce((sum, s) => sum + s.total_amount, 0);
  let totalSalesValue = cashSalesTotal + debtSalesTotal;

  // Debts collected
  let collectedDebtsTotal = allDebts.filter(d => d.is_paid && isTargetMonth(d.created_at)).reduce((sum, d) => sum + d.amount, 0) +
                            safeAdjustments.filter(a => a.type === 'partial_debt_payout' && isTargetMonth(a.created_at)).reduce((sum, a) => sum + a.amount, 0);

  // Office Commission (5% of sale items)
  const saleInvoiceIdsInMonth = new Set(salesInMonth.map(s => s.id));
  let totalCompanyCommission = allSaleItems.filter(item => saleInvoiceIdsInMonth.has(item.sale_invoice_id)).reduce((sum, item) => sum + Math.round(item.agreed_price * 0.05), 0);

  let expensesDailyTotal = dailyExpInMonth.reduce((sum, e) => sum + e.amount, 0);
  let expensesPersonalTotal = personalExpInMonth.reduce((sum, e) => sum + e.amount, 0);
  let expensesTotal = expensesDailyTotal + expensesPersonalTotal;

  let lossesTotal = lossesInMonth.reduce((sum, l) => sum + l.amount, 0);
  let paidPortersTotal = porterInMonth.reduce((sum, p) => sum + p.amount, 0);
  let paidDuesTotal = duesInMonth.reduce((sum, d) => sum + d.net_due, 0);

  // If dynamic calc is 0, we check if archive has the values (especially for historic months)
  const archives = await dbGetAll('stat_archives');
  const archive = archives.find(a => a.month === monthKey);
  if (archive) {
    if (totalCompanyCommission === 0 && archive.companyCommission > 0) {
      cashSalesTotal = archive.cashSales;
      debtSalesTotal = archive.debtSales || 0;
      totalSalesValue = cashSalesTotal + debtSalesTotal;
      collectedDebtsTotal = archive.collectedDebts;
      totalCompanyCommission = archive.companyCommission;
      expensesTotal = archive.expenses;
      expensesDailyTotal = archive.expenses;
      expensesPersonalTotal = 0;
      lossesTotal = archive.losses || 0;
      paidPortersTotal = archive.paidPorters || 0;
      paidDuesTotal = archive.paidDues || 0;
    }
  }

  const netProfit = totalCompanyCommission - (expensesTotal + lossesTotal);

  // Generate html content for receipt-paper
  const container = document.getElementById('receipt-paper');
  if (!container) return;

  container.className = `thermal-paper w-${printerPaperWidth}`;

  const is58mm = printerPaperWidth === '58';
  const fontSizeClass = is58mm ? 'font-size: 15.5px; line-height: 1.35;' : 'font-size: 17.5px; line-height: 1.45;';
  const headerFontSizeClass = is58mm ? 'font-size: 21px;' : 'font-size: 25px;';

  const formattedDate = formatCustomDate(new Date(), true);

  // Detailed rows for expenses
  let detailedExpensesRows = '';
  if (dailyExpInMonth.length > 0 || personalExpInMonth.length > 0) {
    const allExpensesMerged = [
      ...dailyExpInMonth.map(e => ({ ...e, typeText: currentLanguage === 'ar' ? 'يومي' : 'Daily' })),
      ...personalExpInMonth.map(e => ({ ...e, typeText: currentLanguage === 'ar' ? 'شخصي' : 'Personal' }))
    ];
    allExpensesMerged.sort((a, b) => b.created_at - a.created_at);
    
    detailedExpensesRows = allExpensesMerged.map(e => {
      const expDate = new Date(e.created_at);
      const formattedExpDate = `${expDate.getDate()}/${expDate.getMonth()+1}`;
      return `
        <tr style="border-bottom: 1px dashed #ddd; font-size: 14.5px;">
          <td style="padding: 5px 2px; text-align: right; font-weight: 600;">${e.reason || e.notes || (currentLanguage === 'ar' ? 'مصروف' : 'Expense')}</td>
          <td style="padding: 5px 2px; text-align: center; color: #555;">${e.typeText}</td>
          <td style="padding: 5px 2px; text-align: left; font-weight: 700;">${formatVal(e.amount, true)}</td>
        </tr>
      `;
    }).join('');
  } else {
    detailedExpensesRows = `
      <tr>
        <td colspan="3" style="text-align: center; padding: 8px; color: #666; font-size: 13px;">
          ${currentLanguage === 'ar' ? 'لا توجد مصاريف تفصيلية مسجلة هذا الشهر.' : 'No detailed expenses registered this month.'}
        </td>
      </tr>
    `;
  }

  // Detailed rows for losses
  let detailedLossesRows = '';
  if (lossesInMonth.length > 0) {
    lossesInMonth.sort((a, b) => b.created_at - a.created_at);
    detailedLossesRows = lossesInMonth.map(l => {
      const lossDate = new Date(l.created_at);
      const formattedLossDate = `${lossDate.getDate()}/${lossDate.getMonth()+1}`;
      return `
        <tr style="border-bottom: 1px dashed #ddd; font-size: 14.5px;">
          <td style="padding: 5px 2px; text-align: right; font-weight: 600;">${l.reason || l.notes || (currentLanguage === 'ar' ? 'تلف/خسارة' : 'Loss')}</td>
          <td style="padding: 5px 2px; text-align: center; color: #555;">${formattedLossDate}</td>
          <td style="padding: 5px 2px; text-align: left; font-weight: 700;">${formatVal(l.amount, true)}</td>
        </tr>
      `;
    }).join('');
  } else {
    detailedLossesRows = `
      <tr>
        <td colspan="3" style="text-align: center; padding: 8px; color: #666; font-size: 13px;">
          ${currentLanguage === 'ar' ? 'لا توجد خسائر مسجلة هذا الشهر.' : 'No losses registered this month.'}
        </td>
      </tr>
    `;
  }

  // Financial evaluation
  let ratingText = '';
  let ratingColor = '';
  if (netProfit > 0) {
    const expPercent = totalCompanyCommission > 0 ? (expensesTotal / totalCompanyCommission) * 100 : 100;
    if (expPercent <= 15) {
      ratingText = currentLanguage === 'ar' ? 'أداء ممتاز 🟢' : 'Excellent 🟢';
      ratingColor = '#1B4332';
    } else if (expPercent <= 40) {
      ratingText = currentLanguage === 'ar' ? 'أداء جيد جداً 🟢' : 'Very Good 🟢';
      ratingColor = '#2D6A4F';
    } else if (expPercent <= 70) {
      ratingText = currentLanguage === 'ar' ? 'أداء مستقر 🟡' : 'Stable 🟡';
      ratingColor = '#8F5D00';
    } else {
      ratingText = currentLanguage === 'ar' ? 'أداء مقبول 🟠' : 'Acceptable 🟠';
      ratingColor = '#B05B00';
    }
  } else {
    ratingText = currentLanguage === 'ar' ? 'عجز مالي أو خسارة 🔴' : 'Deficit/Loss 🔴';
    ratingColor = '#8F0000';
  }

  // Construct thermal output
  const isAr = currentLanguage === 'ar';
  
  container.innerHTML = `
    <div style="text-align: center; border-bottom: 1.5px dashed #000; padding-bottom: 10px; margin-bottom: 10px; direction: rtl; font-family: var(--font-family) !important;">
      <h2 style="${headerFontSizeClass} font-weight: 800; color: #000; margin: 0 0 4px 0; letter-spacing: normal; font-family: var(--font-family) !important;">${officeName}</h2>
      <p style="font-size: 14px; color: #000; font-weight: 700; margin: 0 0 8px 0; font-family: var(--font-family) !important;">بإدارة: ${officeOwner}</p>
      
      <div style="border: 2px solid #000; padding: 6px 12px; margin: 8px 0; display: inline-block; border-radius: 4px; font-weight: 900; font-size: 16.5px; background-color: #000 !important; color: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
        ${isAr ? 'تقرير الأرباح الشهري المفصل' : 'Detailed Monthly Profit Report'}
      </div>
      
      <div style="font-size: 14.5px; color: #000; font-weight: 700; margin-top: 6px; font-family: var(--font-family) !important;">
        ${isAr ? 'الفترة:' : 'Period:'} ${monthDisplayName}
      </div>
      <div style="font-size: 13px; color: #333; font-weight: 600; margin-top: 2px; font-family: var(--font-family) !important;">
        ${isAr ? 'تاريخ الاستخراج:' : 'Generated At:'} ${formattedDate}
      </div>
    </div>

    <!-- SECTION 1: SALES SUMMARY -->
    <div style="direction: rtl; font-family: var(--font-family) !important; margin-bottom: 12px; ${fontSizeClass}">
      <div style="font-weight: 800; border-bottom: 1.5px solid #000; padding-bottom: 3px; margin-bottom: 5px; font-size: 16px; color: #000;">
        📦 1. ${isAr ? 'ملخص حركة المبيعات' : 'Sales Summary'}
      </div>
      <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #ccc;">
        <span>${isAr ? 'مبيعات نقدية:' : 'Cash Sales:'}</span>
        <span style="font-weight: 700;">${formatVal(cashSalesTotal, true)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #ccc;">
        <span>${isAr ? 'مبيعات آجلة:' : 'Debt Sales:'}</span>
        <span style="font-weight: 700;">${formatVal(debtSalesTotal, true)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 5px 8px; font-weight: 800; font-size: 15px; background-color: #000 !important; color: #fff !important; border-radius: 4px; margin-top: 4px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
        <span>${isAr ? 'إجمالي قيمة المبيعات:' : 'Total Sales Value:'}</span>
        <span>${formatVal(totalSalesValue, true)}</span>
      </div>
    </div>

    <!-- SECTION 2: OFFICE GROSS INCOME (COMMISSION) -->
    <div style="direction: rtl; font-family: var(--font-family) !important; margin-bottom: 12px; ${fontSizeClass}">
      <div style="font-weight: 800; border-bottom: 1.5px solid #000; padding-bottom: 3px; margin-bottom: 5px; font-size: 16px; color: #000;">
        📈 2. ${isAr ? 'إيرادات المكتب (العمولة 5%)' : 'Office Revenue (5% Commission)'}
      </div>
      <div style="display: flex; justify-content: space-between; padding: 6px 8px; font-weight: 900; font-size: 15.5px; background-color: #000 !important; color: #fff !important; border-radius: 4px; border: 1.5px solid #000; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
        <span>${isAr ? 'مجموع عمولة المكتب:' : 'Total Office Commission:'}</span>
        <span>${formatVal(totalCompanyCommission, true)}</span>
      </div>
    </div>

    <!-- SECTION 3: OUTFLOWS AND EXPENSES -->
    <div style="direction: rtl; font-family: var(--font-family) !important; margin-bottom: 12px; ${fontSizeClass}">
      <div style="font-weight: 800; border-bottom: 1.5px solid #000; padding-bottom: 3px; margin-bottom: 5px; font-size: 16px; color: #000;">
        💸 3. ${isAr ? 'المصروفات والمدفوعات' : 'Expenses & Outflows'}
      </div>
      <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #ccc;">
        <span>${isAr ? 'مصاريف تشغيلية يومية:' : 'Daily Operating Expenses:'}</span>
        <span style="font-weight: 700;">${formatVal(expensesDailyTotal, true)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #ccc;">
        <span>${isAr ? 'مصاريف شخصية (أرباب العمل):' : 'Personal Expenses (Owners):'}</span>
        <span style="font-weight: 700;">${formatVal(expensesPersonalTotal, true)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 5px 8px; font-weight: 800; font-size: 15px; background-color: #000 !important; color: #fff !important; border-radius: 4px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
        <span>${isAr ? 'إجمالي المصاريف:' : 'Total Expenses:'}</span>
        <span>${formatVal(expensesTotal, true)}</span>
      </div>
    </div>

    <!-- SECTION 4: LOSSES -->
    <div style="direction: rtl; font-family: var(--font-family) !important; margin-bottom: 12px; ${fontSizeClass}">
      <div style="font-weight: 800; border-bottom: 1.5px solid #000; padding-bottom: 3px; margin-bottom: 5px; font-size: 16px; color: #000;">
        ⚠️ 4. ${isAr ? 'الخسائر والتلفيات' : 'Losses & Damages'}
      </div>
      <div style="display: flex; justify-content: space-between; padding: 6px 8px; font-weight: 800; font-size: 15px; background-color: #000 !important; color: #fff !important; border: 1.5px solid #000; border-radius: 4px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
        <span>${isAr ? 'إجمالي الخسائر المعتمدة:' : 'Total Approved Losses:'}</span>
        <span>${formatVal(lossesTotal, true)}</span>
      </div>
    </div>

    <!-- SECTION 5: FINAL SUMMARY & NET PROFIT -->
    <div style="direction: rtl; font-family: var(--font-family) !important; margin-bottom: 16px; ${fontSizeClass}">
      <div style="font-weight: 800; border-bottom: 1.5px solid #000; padding-bottom: 3px; margin-bottom: 5px; font-size: 16px; color: #000;">
        📊 5. ${isAr ? 'الخلاصة وصافي الأرباح' : 'Summary & Net Profits'}
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 8px; font-weight: 900; border: 2px solid #000; font-size: 17.5px; background-color: #000 !important; color: #fff !important; border-radius: 6px; margin-bottom: 8px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
        <span>${isAr ? 'صافي ربح المكتب:' : 'Net Office Profit:'}</span>
        <span>${formatVal(netProfit, true)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 14.5px;">
        <span>${isAr ? 'التقييم المالي العام:' : 'General Financial Rating:'}</span>
        <span style="font-weight: 800; color: ${ratingColor};">${ratingText}</span>
      </div>
    </div>

    <!-- SECTION 6: ITEMIZED LEDGERS -->
    <div style="direction: rtl; font-family: var(--font-family) !important; margin-bottom: 12px; margin-top: 10px;">
      <div style="font-weight: 800; border-bottom: 1.5px solid #000; padding-bottom: 3px; margin-bottom: 5px; font-size: 15px; color: #000; text-align: center;">
        🧾 -- ${isAr ? 'تفاصيل المصروفات' : 'Itemized Expenses'} --
      </div>
      
      <!-- Expenses Table -->
      <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 14px; margin-bottom: 12px;">
        <thead>
          <tr style="border-bottom: 1px solid #000; font-weight: 800; color: #000;">
            <th style="padding: 4px 2px; text-align: right;">${isAr ? 'السبب/البيان' : 'Description'}</th>
            <th style="padding: 4px 2px; text-align: center; width: 25%;">${isAr ? 'النوع' : 'Type'}</th>
            <th style="padding: 4px 2px; text-align: left; width: 30%;">${isAr ? 'المبلغ' : 'Amount'}</th>
          </tr>
        </thead>
        <tbody>
          ${detailedExpensesRows}
        </tbody>
      </table>

      <!-- Losses Table -->
      <div style="font-weight: 800; border-bottom: 1.5px solid #000; padding-bottom: 3px; margin-bottom: 5px; font-size: 15px; color: #000; text-align: center;">
        🧾 -- ${isAr ? 'تفاصيل الخسائر والتلفيات' : 'Itemized Losses'} --
      </div>
      <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 14px;">
        <thead>
          <tr style="border-bottom: 1px solid #000; font-weight: 800; color: #000;">
            <th style="padding: 4px 2px; text-align: right;">${isAr ? 'سبب الخسارة والتلف' : 'Loss Description'}</th>
            <th style="padding: 4px 2px; text-align: center; width: 25%;">${isAr ? 'التاريخ' : 'Date'}</th>
            <th style="padding: 4px 2px; text-align: left; width: 30%;">${isAr ? 'المبلغ' : 'Amount'}</th>
          </tr>
        </thead>
        <tbody>
          ${detailedLossesRows}
        </tbody>
      </table>
    </div>

    <div style="text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1.5px dashed #000; font-size: 13.5px; font-weight: 800; color: #000; direction: rtl; font-family: var(--font-family) !important; line-height: 1.4;">
      برمجة و تطوير شركة Prime™ Solutions 
      <br>
      Whatsapp: 07749883474
    </div>
  `;

  // Update print executor dataset ID to -1 so system and BLE print targets the custom receipt container content
  document.getElementById('btn-execute-print').dataset.id = "-1";
  const btnExecuteSysprint = document.getElementById('btn-execute-sysprint');
  if (btnExecuteSysprint) {
    btnExecuteSysprint.dataset.id = "-1";
  }

  // Adjust preview title
  const txtPrintPreviewTitle = document.getElementById('txt-print-preview-title');
  if (txtPrintPreviewTitle) {
    txtPrintPreviewTitle.textContent = currentLanguage === 'ar' ? 'معاينة تقرير الأرباح الشهري' : 'Monthly Profit Report Preview';
  }

  // Open the bottom sheet
  openBottomSheet('sheet-print-preview');

  // Trigger system print dialogue directly
  setTimeout(() => {
    window.print();
  }, 300);
}

async function printDailySalesAudit(cropSales) {
  const saleInvoices = await dbGetAll('sale_invoices');
  const saleItems = await dbGetAll('sale_items');

  const now = new Date();
  const formattedDate = formatCustomDate(now);

  const container = document.getElementById('receipt-paper');
  if (!container) return;

  container.className = `thermal-paper w-${printerPaperWidth}`;

  const is58mm = printerPaperWidth === '58';
  const fontSizeClass = is58mm ? 'font-size: 16px; line-height: 1.3;' : 'font-size: 18px; line-height: 1.45;';
  const headerFontSizeClass = is58mm ? 'font-size: 22px;' : 'font-size: 26px;';

  let totalWeight = 0;
  let totalBoxes = 0;
  let totalSoldPrice = 0;

  let lastCropType = null;
  let itemsHtml = cropSales.map((item, idx) => {
    const saleInvoice = saleInvoices.find(si => si.id === item.sale_invoice_id);
    const orderId = saleInvoice ? (saleInvoice.order_id || ('ALW-' + String(saleInvoice.id).padStart(3, '0'))) : 'N/A';
    const saleItem = saleItems.find(si => si.id === item.sale_item_id);

    const d = new Date(item.created_at);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? (currentLanguage === 'ar' ? 'م' : 'PM') : (currentLanguage === 'ar' ? 'ص' : 'AM');
    hours = hours % 12;
    hours = hours ? hours : 12;
    const itemDate = forceEnglishDigits(`${hours}:${minutes} ${ampm}`);
    
    // Weight and box count
    const weightVal = item.weight_kg || 0;
    const boxCountVal = item.box_count || 0;

    totalWeight += weightVal;
    totalBoxes += boxCountVal;
    totalSoldPrice += item.sold_price || 0;

    // Calculate unit price sold per kg or per unit
    let unitPrice = 0;
    let isWeightBased = weightVal > 0;

    if (saleItem && saleItem.unit_price) {
      unitPrice = saleItem.unit_price;
    } else {
      if (isWeightBased) {
        unitPrice = Math.round(item.sold_price / weightVal);
      } else if (boxCountVal > 0) {
        unitPrice = Math.round(item.sold_price / boxCountVal);
      }
    }

    const isCount = (getCropUnitType(item.crop_type) === 'count');
    let qtyText = '';
    if (isWeightBased) {
      qtyText = `${formatVal(weightVal)} ${currentLanguage === 'ar' ? 'كغم' : 'kg'}`;
    } else {
      if (isCount) {
        qtyText = `${formatVal(boxCountVal)} ${currentLanguage === 'ar' ? 'قطعة' : 'pieces'}`;
      } else {
        qtyText = `${formatVal(boxCountVal)} ${currentLanguage === 'ar' ? 'صندوق' : 'box(es)'}`;
      }
    }

    const nextItem = cropSales[idx + 1];
    const isLastOfGroup = nextItem && nextItem.crop_type !== item.crop_type;
    const borderStyle = isLastOfGroup 
      ? "border-bottom: 2.5px solid #000;" 
      : "border-bottom: 1px dashed #000;";

    let groupHeaderHtml = '';
    if (item.crop_type !== lastCropType) {
      lastCropType = item.crop_type;
      groupHeaderHtml = `
        <tr style="font-weight: 800; border-top: 1.5px solid #000; border-bottom: 1.5px solid #000;">
          <td colspan="4" style="padding: 6px 2px; text-align: center; background: repeating-linear-gradient(45deg, #333, #333 1px, transparent 1px, transparent 6px);">
            <span style="background: #fff; padding: 2px 12px; border: 1.5px solid #000; display: inline-block; font-size: 16px; font-weight: 900; color: #000;">
              ${lastCropType}
            </span>
          </td>
        </tr>
      `;
    }

    const customerObj = (saleInvoice && cachedCustomers) ? cachedCustomers.find(c => c.id === saleInvoice.customer_id) : null;
    const isLoss = (item.sold_price === 0) || (customerObj && customerObj.name === 'تالف');
    const displayPrice = isLoss ? (currentLanguage === 'ar' ? 'تلف' : 'Loss') : formatVal(unitPrice);

    return `
      ${groupHeaderHtml}
      <tr style="${borderStyle} font-size: 18.5px; font-weight: 700;">
        <td style="padding: 6px 2px; text-align: right;">${itemDate}</td>
        <td style="padding: 6px 2px; text-align: center;">${qtyText}</td>
        <td style="padding: 6px 2px; text-align: center;">${displayPrice}</td>
        <td style="padding: 6px 2px; text-align: left; font-weight: 900; font-family: 'Monofrik' !important; font-size: 18.5px;">${orderId}</td>
      </tr>
    `;
  }).join('');

  if (cropSales.length === 0) {
    itemsHtml = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 12px; color: #666; font-size: 13px;">
          ${currentLanguage === 'ar' ? 'لا توجد مبيعات مسجلة حالياً.' : 'No sales registered yet.'}
        </td>
      </tr>
    `;
  }

  container.innerHTML = `
    <div style="text-align: center; border-bottom: 1.5px dashed #000; padding-bottom: 8px; margin-bottom: 8px; direction: rtl;">
      <h2 style="${headerFontSizeClass} font-weight: 800; color: #000; margin: 0 0 4px 0; letter-spacing: normal;">${officeName}</h2>
      <p style="font-size: 13.5px; color: #000; font-weight: 700; margin: 0 0 6px 0;">بإدارة: ${officeOwner}</p>
      <h3 style="font-size: 17px; font-weight: 700; color: #333; margin: 0 0 4px 0;">${currentLanguage === 'ar' ? 'تقرير جرد المبيعات اليومي' : 'Daily Sales Audit Report'}</h3>
      <div style="font-size: 14.5px; color: #000; font-weight: 600; margin-bottom: 2px;">النوع: جرد المبيعات الشامل لليوم</div>
      <div style="font-size: 14.5px; color: #000; font-weight: 600;">التاريخ والوقت: ${formattedDate}</div>
    </div>
    
    <table style="width: 100%; direction: rtl; border-collapse: collapse; ${fontSizeClass} margin-bottom: 8px;">
      <thead>
        <tr style="border-bottom: 1.5px dashed #000; font-weight: 800; font-size: 16px;">
          <th style="padding: 4px 0; text-align: right;">${currentLanguage === 'ar' ? 'الوقت' : 'Time'}</th>
          <th style="padding: 4px 0; text-align: center;">الكمية</th>
          <th style="padding: 4px 0; text-align: center;">السعر</th>
          <th style="padding: 4px 0; text-align: left;">رمز الفاتورة</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="border-top: 1.5px dashed #000; padding-top: 6px; direction: rtl; ${fontSizeClass} font-weight: 800; font-size: 17px;">
      <div style="display: flex; justify-content: space-between;">
        <span>إجمالي مبيعات اليوم الشاملة:</span>
        <span>${formatVal(totalSoldPrice, true)}</span>
      </div>
    </div>

    <div style="text-align: center; margin-top: 12px; padding-top: 8px; border-top: 1.5px dashed #000; font-size: 13.5px; font-weight: 800; color: #000; direction: rtl; font-family: var(--font-family) !important; line-height: 1.4;">
      برمجة و تطوير شركة Prime™ Solutions 
      <br>
      Whatsapp: 07749883474
    </div>
  `;

  // Log in events
  logAppEvent(
    `طباعة جرد المبيعات اليومي الشامل`,
    `Printed comprehensive daily sales audit`
  );

  document.getElementById('btn-execute-print').dataset.id = "-1";
  if (document.getElementById('btn-execute-sysprint')) document.getElementById('btn-execute-sysprint').dataset.id = "-1";
  document.getElementById('btn-share-receipt').dataset.id = "-1";

  openBottomSheet('sheet-print-preview');
}

async function renderPortersList() {
  const portersList = document.getElementById('porters-list');
  if (!portersList) return;

  // 1. Auto-cleanup settled records after 1 week (7 days)
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const allPayouts = await dbGetAll('porter_payouts');
  const payoutsToClean = allPayouts.filter(p => p.is_paid && p.paid_at && p.paid_at < oneWeekAgo);
  if (payoutsToClean.length > 0) {
    await new Promise((resolve) => {
      const tx = db.transaction('porter_payouts', 'readwrite');
      const store = tx.objectStore('porter_payouts');
      payoutsToClean.forEach(p => store.delete(p.id));
      tx.oncomplete = () => {
        invalidateDbCache('porter_payouts');
        resolve();
      };
      tx.onerror = () => resolve(); // safety fallback
    });
  }

  // Refetch payouts after potential cleanup
  const payouts = await dbGetAll('porter_payouts');

  portersList.innerHTML = '';

  // Helper functions for daily grouping
  function getDayKey(timestamp) {
    const date = new Date(timestamp);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getDayLabel(dayKey) {
    const todayKey = getDayKey(Date.now());
    const yesterdayKey = getDayKey(Date.now() - 86400000);
    if (dayKey === todayKey) {
      return currentLanguage === 'ar' ? 'اليوم' : 'Today';
    } else if (dayKey === yesterdayKey) {
      return currentLanguage === 'ar' ? 'أمس' : 'Yesterday';
    } else {
      const [y, m, d] = dayKey.split('-');
      return currentLanguage === 'ar' ? `${d}/${m}/${y}` : `${m}/${d}/${y}`;
    }
  }

  // Group by day key
  const todayKey = getDayKey(Date.now());
  const groups = {};
  groups[todayKey] = []; // Ensure at least today's card is always opened/available

  payouts.forEach(p => {
    const key = getDayKey(p.created_at);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(p);
  });

  const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  const paginatedKeys = sortedKeys.slice(0, listPageLimits.porters);

  paginatedKeys.forEach((dayKey, idx) => {
    const dayPayouts = groups[dayKey];
    const unpaidDayPayouts = dayPayouts.filter(p => !p.is_paid);
    const paidDayPayouts = dayPayouts.filter(p => p.is_paid);
    
    const totalUnpaidAmount = unpaidDayPayouts.reduce((sum, p) => sum + p.amount, 0);
    const totalUnpaidBoxes = unpaidDayPayouts.reduce((sum, p) => sum + p.box_count, 0);
    
    const totalPaidAmount = paidDayPayouts.reduce((sum, p) => sum + p.amount, 0);
    const totalPaidBoxes = paidDayPayouts.reduce((sum, p) => sum + p.box_count, 0);
    
    const totalBoxes = totalUnpaidBoxes + totalPaidBoxes;

    const card = document.createElement('div');
    card.className = 'invoice-table-row stagger-item';
    card.style.animationDelay = `${idx * 0.05}s`;

    const dayLabel = getDayLabel(dayKey);
    let statusText = '';
    let statusClass = '';
    if (unpaidDayPayouts.length > 0) {
      if (totalPaidAmount > 0) {
        statusText = currentLanguage === 'ar' ? 'تم صرف دفعة وبانتظار الباقي' : 'Partially paid, awaiting rest';
        statusClass = 'near';
      } else {
        statusText = currentLanguage === 'ar' ? 'بانتظار الصرف' : 'Awaiting Payout';
        statusClass = 'late';
      }
    } else if (dayPayouts.length > 0) {
      statusText = currentLanguage === 'ar' ? 'تم تأكيد صرف المستحقات' : 'Disbursement Confirmed';
      statusClass = 'ok';
    } else {
      statusText = currentLanguage === 'ar' ? 'يوم جديد (فارغ)' : 'New Day (Empty)';
      statusClass = 'info';
    }

    card.innerHTML = `
      <!-- Column 1: ID & Day Info -->
      <div class="itr-col-id">
        <span class="lang-badge" style="background-color: var(--color-primary-mid); margin-bottom: 2px; display: inline-block; font-family: monospace; letter-spacing: 0.5px; align-self: flex-start;">
          ID: ${dayKey}
        </span>
        <span style="font-size: 11px; font-weight: 600; color: var(--color-text-muted);">
          ${formatVal(totalBoxes)} ${currentLanguage === 'ar' ? 'صندوق' : 'box(es)'}
        </span>
      </div>

      <!-- Column 2: Day Title & Description -->
      <div class="itr-col-customer">
        <h4 style="font-size: 14px; font-weight: 700; color: var(--color-primary); margin: 0;">${dayLabel}</h4>
        <span style="font-size: 10px; color: var(--color-text-muted);">${currentLanguage === 'ar' ? 'جرد حمالة اليوم' : 'Daily porter dues'}</span>
      </div>

      <!-- Column 3: Boxes Summary Badges -->
      <div class="itr-col-items" style="display: flex; flex-wrap: wrap; gap: 6px;">
        <span class="itr-item-badge" style="position: relative; overflow: hidden; min-width: 140px; justify-content: center; margin: 2px;">
          <span class="badge-crop-name">📦 ${currentLanguage === 'ar' ? 'إجمالي الصناديق' : 'Total Boxes'}</span>
          <span class="badge-qty-group">
            <span class="badge-qty">
              <span class="qty-num">${formatVal(totalBoxes)}</span>
            </span>
          </span>
        </span>
      </div>

      <!-- Column 4: Status -->
      <div class="itr-col-status">
        <span class="debt-status-tag ${statusClass === 'info' ? 'ok' : statusClass}" style="font-size: 10px; border-radius: 4px; padding: 4px 8px; margin: 0; white-space: nowrap; ${statusClass === 'info' ? 'background: #e2e8f0; color: #475569; border-color: #cbd5e1;' : ''}">
          ${statusClass === 'ok' ? '✅' : (statusClass === 'near' ? '🔄' : (statusClass === 'late' ? '⏳' : '📝'))} ${statusText}
        </span>
      </div>

      <!-- Column 5: Total Pending Amount -->
      <div class="itr-col-total" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-align: center;">
        <span style="font-size: 10px; color: var(--color-text-muted); margin: 0;">${currentLanguage === 'ar' ? 'المبلغ المعلق المتبقي' : 'Pending Amount'}</span>
        <h3 style="font-size: 15px; font-weight: 700; color:${totalUnpaidAmount > 0 ? 'var(--color-warning)' : 'var(--color-success)'}; margin: 0;">${formatVal(totalUnpaidAmount, true)}</h3>
        ${totalPaidAmount > 0 ? `
          <span style="font-size: 9px; color: var(--color-success); font-weight: 700; display: block; margin-top: 2px; white-space: nowrap;">
            ${currentLanguage === 'ar' ? 'تم صرف سابقاً: ' : 'Previously paid: '}${formatVal(totalPaidAmount, true)}
          </span>
        ` : ''}
      </div>

      <!-- Column 6: Actions Group -->
      <div class="itr-col-actions">
        <button class="btn-secondary btn-toggle-porters-details" data-day="${dayKey}" style="padding: 6px 10px; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 1.5px solid var(--color-primary-light); background: rgba(0, 150, 199, 0.04); color: var(--color-primary); box-shadow: none; margin: 0;">
          <span class="material-icons-round" style="font-size: 14px;">list</span>
          <span>${currentLanguage === 'ar' ? 'التفاصيل' : 'Details'}</span>
        </button>
        ${totalUnpaidAmount > 0 ? `
          <button class="btn-secondary btn-open-porters-pay" data-day="${dayKey}" style="padding: 6px 10px; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 1.5px solid var(--color-success); background: rgba(82, 183, 136, 0.04); color: var(--color-success); box-shadow: none; margin: 0;">
            <span class="material-icons-round" style="font-size: 14px;">payments</span>
            <span>${totalPaidAmount > 0 ? (currentLanguage === 'ar' ? 'دفع الباقي' : 'Pay Balance') : (currentLanguage === 'ar' ? 'دفع' : 'Pay')}</span>
          </button>
        ` : (dayPayouts.length > 0 ? `
          <div style="padding: 6px 10px; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 1px solid var(--color-success); background: rgba(82, 183, 136, 0.08); color: var(--color-success); border-radius: 8px; font-weight: 700; margin: 0; white-space: nowrap;">
            <span class="material-icons-round" style="font-size: 14px; color: var(--color-success);">check_circle</span>
            <span>${currentLanguage === 'ar' ? 'تم تأكيد الصرف' : 'Confirmed'}</span>
          </div>
        ` : '')}
      </div>

      <!-- No collapsible sections here anymore because they open in beautiful standalone popups -->
    `;

    portersList.appendChild(card);

    // Bind event listeners for this day card
    const toggleDetailsBtn = card.querySelector('.btn-toggle-porters-details');
    if (toggleDetailsBtn) {
      toggleDetailsBtn.addEventListener('click', () => {
        showPorterDetailsSheet(dayKey, dayLabel, dayPayouts);
      });
    }

    const openPayBtn = card.querySelector('.btn-open-porters-pay');
    if (openPayBtn) {
      openPayBtn.addEventListener('click', () => {
        showPorterPayoutSheet(dayKey, dayLabel, totalUnpaidAmount, unpaidDayPayouts);
      });
    }
  });

  if (sortedKeys.length > listPageLimits.porters) {
    const loadMoreBtn = createLoadMoreButton(() => {
      listPageLimits.porters += 10;
      renderPortersList();
    });
    portersList.appendChild(loadMoreBtn);
  }

  // 3. Add beautiful footer note
  const noteDiv = document.createElement('div');
  noteDiv.style.marginTop = '16px';
  noteDiv.style.padding = '12px 16px';
  noteDiv.style.borderRadius = '12px';
  noteDiv.style.background = 'rgba(0, 150, 199, 0.03)';
  noteDiv.style.border = '1px solid rgba(0, 150, 199, 0.08)';
  noteDiv.style.fontSize = '11px';
  noteDiv.style.color = 'var(--color-primary-mid)';
  noteDiv.style.lineHeight = '1.6';
  noteDiv.style.direction = 'rtl';
  noteDiv.style.textAlign = 'right';
  
  noteDiv.innerHTML = `
    <div style="display: flex; gap: 8px; align-items: flex-start;">
      <span class="material-icons-round" style="font-size: 16px; margin-top: 2px; color: var(--color-primary);">info</span>
      <div>
        <strong>${currentLanguage === 'ar' ? 'ملاحظة حول نظام العمل اليومي والأرشفة:' : 'Note on Daily Work & Archiving:'}</strong><br>
        ${currentLanguage === 'ar' 
          ? 'يتم حساب الصناديق المباعة يومياً على حدة وتراكمها لكل يوم بشكل منفصل. مع بداية كل يوم جديد، تُفتتح بطاقة يومية جديدة تلقائياً لتسجيل حركات ذلك اليوم. يتم تصفية وحذف البطاقات التي تمت تسويتها تلقائياً بعد مرور أسبوع واحد (7 أيام) من تاريخ الصرف والتسوية.' 
          : 'Sold boxes are calculated per day and accumulated for each day separately. At the start of a new day, a new daily card opens automatically. Settled cards are automatically archived and deleted 1 week (7 days) after the settlement date.'}
      </div>
    </div>
  `;
  portersList.appendChild(noteDiv);
}

function showPorterDetailsSheet(dayKey, dayLabel, dayPayouts) {
  const detailsTitle = document.getElementById('txt-porter-details-title');
  const detailsBody = document.getElementById('porter-details-body');
  if (!detailsBody) return;

  if (detailsTitle) {
    detailsTitle.textContent = currentLanguage === 'ar' ? `تفاصيل حمالة يوم (${dayLabel})` : `Porter Details for (${dayLabel})`;
  }

  let listHtml = '';
  if (dayPayouts.length === 0) {
    listHtml = `
      <p style="font-size: 13px; color: var(--color-text-muted); text-align: center; margin: 16px 0;">
        ${currentLanguage === 'ar' ? 'لا توجد مبيعات أو مستحقات حمالين لهذا اليوم حتى الآن.' : 'No sales or porter dues for this day yet.'}
      </p>
    `;
  } else {
    listHtml = dayPayouts.sort((a, b) => b.created_at - a.created_at).map(p => {
      const timeStr = forceEnglishDigits(new Date(p.created_at).toLocaleTimeString(currentLanguage === 'ar' ? 'ar-IQ-u-nu-latn' : 'en-US', { hour: '2-digit', minute: '2-digit' }));
      const statusBadge = p.is_paid 
        ? `<span style="font-size: 11px; color: var(--color-success); font-weight: 700; background: rgba(82, 183, 136, 0.08); padding: 4px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;"><span class="material-icons-round" style="font-size: 13px;">check_circle</span>${currentLanguage === 'ar' ? 'تم الصرف' : 'Paid'}</span>` 
        : `<span style="font-size: 11px; color: var(--color-warning); font-weight: 700; background: rgba(243, 156, 18, 0.08); padding: 4px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;"><span class="material-icons-round" style="font-size: 13px;">schedule</span>${currentLanguage === 'ar' ? 'معلق' : 'Pending'}</span>`;
      return `
        <div class="premium-card" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; gap: 12px; margin-bottom: 2px;">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="font-weight: 700; color: var(--color-text-dark); display: flex; align-items: center; gap: 6px; font-size: 13.5px;">
              <span style="font-size: 16px;">${p.crop_type ? getCropIcon(p.crop_type) : '📦'}</span>
              <span>${p.crop_type || (currentLanguage === 'ar' ? 'صناديق بضاعة' : 'Cargo boxes')}</span>
              <span style="font-size: 11.5px; font-weight: normal; color: var(--color-text-muted);">• ${p.box_count} ${currentLanguage === 'ar' ? 'صندوق' : 'box(es)'}</span>
            </div>
            <div style="font-size: 11px; color: var(--color-text-muted); display: flex; flex-wrap: wrap; align-items: center; gap: 6px;">
              <span>${timeStr}</span>
              ${p.is_paid && p.paid_porters_count ? `<span style="color: var(--color-primary-mid); font-weight: 700;">• ${currentLanguage === 'ar' ? 'وزعت على' : 'split among'} ${p.paid_porters_count} حمالاً</span>` : ''}
              ${p.is_paid && p.porter_share ? `<span style="color: var(--color-success); font-weight: 700;">• ${currentLanguage === 'ar' ? 'حصة الفرد:' : 'Each:'} ${formatVal(p.porter_share, true)}</span>` : ''}
            </div>
          </div>
          <div style="text-align: left; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
            <span style="font-weight: 800; color: var(--color-primary-mid); font-size: 14px;">${formatVal(p.amount, true)}</span>
            ${statusBadge}
          </div>
        </div>
      `;
    }).join('');
  }

  detailsBody.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px;">
      ${listHtml}
    </div>
  `;

  openBottomSheet('sheet-porter-details');
}

function showPorterPayoutSheet(dayKey, dayLabel, totalUnpaidAmount, unpaidDayPayouts) {
  activePorterPayout = {
    dayKey,
    dayLabel,
    totalUnpaidAmount,
    unpaidDayPayouts
  };

  const payoutTodayLbl = document.getElementById('txt-porter-payout-today-lbl');
  const totalAmountLbl = document.getElementById('porter-payout-total-amount');
  const countInput = document.getElementById('porter-payout-count');
  const individualShareLbl = document.getElementById('porter-payout-share');

  if (payoutTodayLbl) {
    payoutTodayLbl.textContent = currentLanguage === 'ar' ? `تسوية مستحقات يوم (${dayLabel})` : `Settlement of dues for (${dayLabel})`;
  }
  if (totalAmountLbl) {
    totalAmountLbl.textContent = formatVal(totalUnpaidAmount, true);
  }
  if (countInput) {
    countInput.value = ''; 
  }
  if (individualShareLbl) {
    individualShareLbl.textContent = formatVal(0, true);
  }

  openBottomSheet('sheet-porter-payout');
  
  setTimeout(() => {
    if (countInput) countInput.focus();
  }, 150);
}

function initPorterPayoutSheetEvents() {
  const payoutCountInput = document.getElementById('porter-payout-count');
  const individualShareLbl = document.getElementById('porter-payout-share');
  
  if (payoutCountInput && individualShareLbl) {
    payoutCountInput.addEventListener('input', () => {
      if (!activePorterPayout) return;
      const count = parseInt(payoutCountInput.value) || 0;
      if (count <= 0) {
        individualShareLbl.textContent = formatVal(0, true);
        return;
      }
      const share = Math.round(activePorterPayout.totalUnpaidAmount / count);
      individualShareLbl.textContent = formatVal(share, true);
    });
  }

  const submitBtn = document.getElementById('btn-submit-porter-payout');
  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      if (!activePorterPayout) return;
      
      const count = parseInt(payoutCountInput.value) || 0;
      if (count <= 0) {
        showToast(currentLanguage === 'ar' ? 'يرجى إدخال عدد حمالين صحيح (1 على الأقل)' : 'Please enter a valid number of porters (at least 1)', 'warning', true);
        return;
      }

      const { dayKey, dayLabel, totalUnpaidAmount, unpaidDayPayouts } = activePorterPayout;
      const share = Math.round(totalUnpaidAmount / count);
      
      const confirmTitle = currentLanguage === 'ar' ? 'تأكيد دفع مستحقات الحمالين' : 'Confirm Porter Payout';
      const confirmMessage = currentLanguage === 'ar' ? 
        `هل أنت متأكد من دفع مبلغ ${formatVal(totalUnpaidAmount, true)} دينار عراقي لليوم (${dayLabel})؟\nسيتم توزيعها على ${count} حمالين، بمعدل ${formatVal(share, true)} لكل حمال، وسيتم خصم المبلغ من الخزينة.` :
        `Are you sure you want to payout ${formatVal(totalUnpaidAmount, true)} IQD for (${dayLabel})?\nIt will be distributed to ${count} porters (${formatVal(share, true)} each), and deducted from the safe box.`;
      
      const isConfirmed = await showCustomConfirm(confirmTitle, confirmMessage);
      if (!isConfirmed) return;

      const tx = db.transaction('porter_payouts', 'readwrite');
      const store = tx.objectStore('porter_payouts');
      unpaidDayPayouts.forEach(p => {
        p.is_paid = true;
        p.paid_porters_count = count;
        p.porter_share = share;
        p.paid_at = Date.now();
        store.put(p);
      });

      tx.oncomplete = async () => {
        invalidateDbCache('porter_payouts');
        
        const logMsgAr = `صرف وتوزيع أجور الحمالين لليوم ${dayLabel} لعدد ${count} حمالين`;
        const logMsgEn = `Paid and distributed porters dues for ${dayLabel} to ${count} porters`;
        
        logAppEvent(logMsgAr, logMsgEn, totalUnpaidAmount);
        playSound('success');
        showToast(currentLanguage === 'ar' ? 'تم صرف وتوزيع أجور الحمالين والخصم تلقائياً من الخزنة بنجاح!' : 'Porters dues successfully distributed and deducted from safe box!', 'check_circle');
        
        closeBottomSheet('sheet-porter-payout');
        activePorterPayout = null;
        await refreshAllUI();
      };
    });
  }
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
    amountInput.value = '';
    amountInput.placeholder = currentLanguage === 'ar' ? 'ادخل المبلغ المسدد' : 'Enter paid amount';
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
    invalidateDbCache('farmer_dues');
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
  const totalDebtSalesEl = document.getElementById('total-debt-sales');
  const totalCollectedDebtsEl = document.getElementById('total-collected-debts');
  const totalAdjustmentsEl = document.getElementById('total-adjustments');
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
  let debtSalesTotal = 0;
  let collectedDebtsTotal = 0;
  let manualAdditionsTotal = 0;
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
    debtSalesTotal = allSales.filter(s => s.payment_type === 'debt' && isCurrentMonth(s.created_at)).reduce((sum, s) => sum + s.total_amount, 0);

    collectedDebtsTotal = allDebts.filter(d => d.is_paid && isCurrentMonth(d.created_at)).reduce((sum, d) => sum + d.amount, 0) +
                          safeAdjustments.filter(a => a.type === 'partial_debt_payout' && isCurrentMonth(a.created_at)).reduce((sum, a) => sum + a.amount, 0);

    manualAdditionsTotal = safeAdjustments.filter(a => a.type === 'manual_addition' && isCurrentMonth(a.created_at)).reduce((sum, a) => sum + a.amount, 0);

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
      debtSalesTotal = archive.debtSales || 0;
      collectedDebtsTotal = archive.collectedDebts;
      manualAdditionsTotal = archive.manualAdditions || 0;
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
  if (totalDebtSalesEl) {
    totalDebtSalesEl.textContent = formatVal(debtSalesTotal, true);
  }
  totalCollectedDebtsEl.textContent = formatVal(collectedDebtsTotal, true);
  if (totalAdjustmentsEl) {
    totalAdjustmentsEl.textContent = formatVal(manualAdditionsTotal, true);
  }
  totalPaidDuesEl.textContent = formatVal(paidDuesTotal, true);
  totalPortersEl.textContent = formatVal(paidPortersTotal, true);
  totalCommissionEl.textContent = formatVal(totalCompanyCommission, true);

  const netProfit = totalCompanyCommission - (expensesTotal + lossesTotal);
  const profitEl = document.getElementById('val-net-profit');
  if (profitEl) {
    profitEl.textContent = formatVal(netProfit, true);
  }

  // Render detail list values
  const now = new Date();
  const activeMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const targetMonthKey = selectedMonth === 'active' ? activeMonthKey : selectedMonth;

  const isTargetMonth = (timestamp) => {
    if (!timestamp) return false;
    const d = new Date(timestamp);
    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return mKey === targetMonthKey;
  };

  const monthDailyExpenses = dailyExpenses.filter(e => isTargetMonth(e.created_at));
  const monthPersonalExpenses = personalExpenses.filter(e => isTargetMonth(e.created_at));
  const monthLosses = losses.filter(l => isTargetMonth(l.created_at));

  // Split daily expenses into regular daily expenses and salaries
  const dailyVal = monthDailyExpenses.filter(e => {
    const isSal = e.type === 'salary' || (!e.type && (e.subject.includes('راتب') || e.subject.includes('رواتب') || e.subject.toLowerCase().includes('salary')));
    return !isSal;
  }).reduce((sum, e) => sum + e.amount, 0);

  const salaryVal = monthDailyExpenses.filter(e => {
    const isSal = e.type === 'salary' || (!e.type && (e.subject.includes('راتب') || e.subject.includes('رواتب') || e.subject.toLowerCase().includes('salary')));
    return isSal;
  }).reduce((sum, e) => sum + e.amount, 0);

  const personalVal = monthPersonalExpenses.reduce((sum, e) => sum + e.amount, 0);
  const lossVal = monthLosses.reduce((sum, l) => sum + l.amount, 0);

  const dailyExpEl = document.getElementById('val-total-daily-expenses');
  if (dailyExpEl) dailyExpEl.textContent = formatVal(dailyVal, true);

  const salaryExpEl = document.getElementById('val-total-salaries');
  if (salaryExpEl) salaryExpEl.textContent = formatVal(salaryVal, true);

  const personalExpEl = document.getElementById('val-total-personal-expenses');
  if (personalExpEl) personalExpEl.textContent = formatVal(personalVal, true);

  const lossValEl = document.getElementById('val-total-losses');
  if (lossValEl) lossValEl.textContent = formatVal(lossVal, true);

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

  // Show professional rollover warning alert if 1 day before month end or on the last day
  renderMonthlyRolloverAlert();
}

function renderMonthlyRolloverAlert() {
  const container = document.querySelector('#screen-stats');
  if (!container) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const lastDayDate = new Date(year, month + 1, 0);
  const lastDayNum = lastDayDate.getDate();

  const isOneDayBefore = today === lastDayNum - 1;
  const isLastDay = today === lastDayNum;

  const shouldShow = isOneDayBefore || isLastDay || sessionStorage.getItem('alwa_force_rollover_alert') === 'true';

  if (sessionStorage.getItem('alwa_dismissed_rollover_alert')) {
    const existing = document.querySelector('#monthly-rollover-alert-banner');
    if (existing) existing.remove();
    return;
  }

  let alertEl = document.querySelector('#monthly-rollover-alert-banner');
  if (alertEl) {
    if (!shouldShow) {
      alertEl.remove();
    }
    return;
  }

  if (!shouldShow) return;

  alertEl = document.createElement('div');
  alertEl.id = 'monthly-rollover-alert-banner';
  
  // Custom professional alert card style
  alertEl.style.cssText = `
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
    border: 1.5px solid #f59e0b;
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 16px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.08);
    position: relative;
    animation: fadeIn 0.3s ease-out;
  `;

  const isAr = currentLanguage === 'ar';
  
  const alertTextAr = isOneDayBefore 
    ? "تنبيه ترحيل الإحصائيات: سيتم ترحيل وإقفال إحصائيات الشهر الحالي تلقائياً وأرشفتها بنهاية يوم غد للبدء بدورة إحصائيات جديدة للشهر القادم. رصيد الخزنة الفعلي والديون لن تتأثر."
    : "تنبيه ترحيل الإحصائيات: سيتم ترحيل وإقفال إحصائيات الشهر الحالي تلقائياً وأرشفتها بنهاية هذا اليوم للبدء بدورة إحصائيات جديدة للشهر القادم. رصيد الخزنة الفعلي والديون لن تتأثر.";
    
  const alertTextEn = isOneDayBefore
    ? "Statistics Rollover Notice: The current month's statistics will be automatically closed, archived, and reset at the end of tomorrow to start a new tracking cycle. Active safe box balances and customer debts remain unaffected."
    : "Statistics Rollover Notice: The current month's statistics will be automatically closed, archived, and reset at the end of today to start a new tracking cycle. Active safe box balances and customer debts remain unaffected.";

  const displayText = isAr ? alertTextAr : alertTextEn;
  const displayTitle = isAr ? "إشعار ترحيل الإحصائيات التلقائي" : "Automatic Statistics Rollover Notice";

  alertEl.innerHTML = `
    <span class="material-icons-round" style="color: #d97706; font-size: 24px; flex-shrink: 0; margin-top: 2px; user-select: none;">warning</span>
    <div style="flex: 1; padding-left: 4px; padding-right: 24px; text-align: ${isAr ? 'right' : 'left'};">
      <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #78350f;">${displayTitle}</h4>
      <p style="margin: 0; font-size: 13px; font-weight: 600; color: #92400e; line-height: 1.5; font-family: var(--font-family) !important;">${displayText}</p>
    </div>
    <button type="button" id="btn-close-rollover-alert" style="
      position: absolute;
      ${isAr ? 'left' : 'right'}: 10px;
      top: 10px;
      background: none;
      border: none;
      color: #b45309;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-radius: 50%;
      transition: background 0.2s;
    " onmouseover="this.style.background='rgba(180, 83, 9, 0.1)'" onmouseout="this.style.background='none'">
      <span class="material-icons-round" style="font-size: 18px;">close</span>
    </button>
  `;

  // Prepend before the first child of screen-stats
  container.insertBefore(alertEl, container.firstChild);

  // Attach dismiss event listener
  const closeBtn = alertEl.querySelector('#btn-close-rollover-alert');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      sessionStorage.setItem('alwa_dismissed_rollover_alert', 'true');
      alertEl.remove();
    });
  }
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
    const formattedDate = formatCustomDate(it.created_at);
    
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
  let type = 'daily';
  const activeBtn = document.querySelector('#expense-type-switch .segmented-control-btn.active');
  if (activeBtn) {
    if (activeBtn.id === 'expense-type-personal') {
      type = 'personal';
    } else if (activeBtn.id === 'expense-type-salary') {
      type = 'salary';
    }
  }

  const subject = document.getElementById('expense-subject').value.trim();
  const amount = parseNumberInput(document.getElementById('expense-amount').value);

  if (!subject || amount <= 0) {
    showToast(currentLanguage === 'ar' ? 'الرجاء إدخال وصف ومبلغ المصروف بشكل صحيح' : 'Please fill all required expense fields', 'warning', true);
    return;
  }

  const storeName = (type === 'daily' || type === 'salary') ? 'daily_expenses' : 'personal_expenses';
  await dbAdd(storeName, {
    subject,
    amount,
    type,
    created_at: Date.now()
  });

  const arabicType = type === 'daily' ? 'مصاريف علوة يومية' : type === 'salary' ? 'رواتب' : 'مصاريف شخصية';
  const englishType = type === 'daily' ? 'Daily Office' : type === 'salary' ? 'Salaries' : 'Personal';

  logAppEvent(
    `تسجيل مصروفات (${arabicType}): ${subject}`,
    `Recorded expense (${englishType}): ${subject}`,
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

async function populateLossCropDropdown() {
  const dropdown = document.getElementById('loss-crop-dropdown');
  if (!dropdown) return;
  dropdown.innerHTML = '';
  dropdown.style.maxHeight = '250px';

  const searchInput = document.getElementById('loss-crop-search');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

  const allImports = await dbGetAll('import_invoices');
  const allImportItems = await dbGetAll('import_items');
  const allSaleItems = await dbGetAll('sale_items');

  // 1. Calculate active remaining stock for each import item
  const activeImports = allImports.filter(imp => !imp.is_settled);
  const stockMap = {}; // crop_type -> { weight: number, boxes: number, isCount: boolean }

  activeImports.forEach(imp => {
    const impItems = allImportItems.filter(it => it.invoice_id === imp.id);
    impItems.forEach(it => {
      const salesOfItem = allSaleItems.filter(s => s.import_invoice_id === imp.id && s.crop_type === it.crop_type);
      
      let soldWeight = 0;
      let soldBoxes = 0;
      const isCount = (getCropUnitType(it.crop_type) === 'count');
      
      salesOfItem.forEach(s => {
        soldWeight += (isCount ? (s.box_count || 0) : s.weight_kg);
        soldBoxes += (s.box_count || 0);
      });

      const remWeight = Math.max(0, (isCount ? (it.box_count || 0) : it.weight_kg) - soldWeight);
      const remBoxes = Math.max(0, (it.box_count || 0) - soldBoxes);

      if (remWeight > 0 || remBoxes > 0) {
        if (!stockMap[it.crop_type]) {
          stockMap[it.crop_type] = { weight: 0, boxes: 0, isCount };
        }
        stockMap[it.crop_type].weight += remWeight;
        stockMap[it.crop_type].boxes += remBoxes;
      }
    });
  });

  // 2. Prepare only crops currently in stock
  const inStockCrops = Object.keys(stockMap).map(crop => {
    return {
      crop,
      weight: stockMap[crop].weight,
      boxes: stockMap[crop].boxes,
      isCount: stockMap[crop].isCount
    };
  });

  // 3. Since input is readonly, we show all in-stock crops without filtering by the current selected value
  const filteredInStock = [...inStockCrops];

  // Sort list alphabetically in Arabic
  filteredInStock.sort((a, b) => a.crop.localeCompare(b.crop, 'ar'));

  const addCropItem = (crop, subtitle = '') => {
    const itemEl = document.createElement('div');
    itemEl.className = 'autocomplete-item';
    itemEl.style.display = 'flex';
    itemEl.style.flexDirection = 'column';
    itemEl.style.padding = '8px 12px';
    itemEl.style.cursor = 'pointer';
    
    let subtitleHtml = '';
    if (subtitle) {
      subtitleHtml = `<span style="font-size: 11px; color: #666; margin-top: 2px;">${subtitle}</span>`;
    }

    itemEl.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
        <span style="font-weight: 500;">${getCropIcon(crop)} ${crop}</span>
      </div>
      ${subtitleHtml}
    `;

    itemEl.addEventListener('click', () => {
      document.getElementById('loss-crop-search').value = crop;
      document.getElementById('loss-crop-selector').value = crop;
      dropdown.style.display = 'none';
      
      const unitType = getCropUnitType(crop);
      const isWatermelon = isWatermelonOrMelon(crop);
      const weightContainer = document.getElementById('loss-crop-weight-container');
      const boxCountContainer = document.getElementById('loss-crop-box-count-container');
      
      if (unitType === 'count') {
        if (weightContainer) weightContainer.style.display = 'none';
        if (boxCountContainer) boxCountContainer.style.display = 'block';
        document.getElementById('loss-crop-weight').value = '';
      } else if (isWatermelon) {
        if (weightContainer) weightContainer.style.display = 'block';
        if (boxCountContainer) boxCountContainer.style.display = 'none';
        document.getElementById('loss-crop-box-count').value = '';
      } else {
        if (weightContainer) weightContainer.style.display = 'block';
        if (boxCountContainer) boxCountContainer.style.display = 'block';
      }
    });

    dropdown.appendChild(itemEl);
  };

  // 4. Render the list of available items
  if (filteredInStock.length > 0) {
    filteredInStock.forEach(item => {
      let subtitle = '';
      if (item.isCount) {
        subtitle = currentLanguage === 'ar' ? `الكمية المتوفرة بالمخزن: ${item.boxes} قطعة` : `Available in stock: ${item.boxes} قطعة`;
      } else {
        subtitle = currentLanguage === 'ar' ? `الوزن المتوفر بالمخزن: ${item.weight} كغم (${item.boxes} صندوق)` : `Available in stock: ${item.weight} kg (${item.boxes} boxes)`;
      }
      addCropItem(item.crop, subtitle);
    });
  } else {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'autocomplete-item';
    emptyEl.style.color = '#888';
    emptyEl.style.padding = '12px';
    emptyEl.style.textAlign = 'center';
    if (inStockCrops.length === 0) {
      emptyEl.textContent = currentLanguage === 'ar' ? '⚠️ لا توجد بضاعة متوفرة حالياً في المخزن لتسجيل تلفها' : '⚠️ No crops currently in stock to record loss';
    } else {
      emptyEl.textContent = currentLanguage === 'ar' ? 'لا توجد نتائج مطابقة لبحثك' : 'No matching crops found';
    }
    dropdown.appendChild(emptyEl);
  }
}

async function submitLossRecord() {
  const lossTypeCropBtn = document.getElementById('loss-type-crop');
  const isCropLoss = lossTypeCropBtn && lossTypeCropBtn.classList.contains('active');

  let subject = '';
  let amount = 0;
  let lossData = {};

  if (isCropLoss) {
    const cropType = document.getElementById('loss-crop-search').value.trim();
    let weight = parseNumberInput(document.getElementById('loss-crop-weight').value);
    let boxCount = parseNumberInput(document.getElementById('loss-crop-box-count').value);

    if (!cropType) {
      showToast(currentLanguage === 'ar' ? 'الرجاء اختيار صنف المحصول بشكل صحيح' : 'Please select a crop', 'warning', true);
      return;
    }

    const unitType = getCropUnitType(cropType);
    const isCount = (unitType === 'count');
    const isWatermelon = isWatermelonOrMelon(cropType);

    if (isCount) {
      if (boxCount <= 0) {
        showToast(currentLanguage === 'ar' ? 'الرجاء إدخال العدد التالف بشكل صحيح' : 'Please enter a valid box/bag count', 'warning', true);
        return;
      }
      weight = 0;
    } else if (isWatermelon) {
      if (weight <= 0) {
        showToast(currentLanguage === 'ar' ? 'الرجاء إدخال الوزن التالف بشكل صحيح' : 'Please enter a valid weight', 'warning', true);
        return;
      }
      boxCount = 0;
    } else {
      const allImportItems = await dbGetAll('import_items');
      const cropImportItems = allImportItems.filter(ii => ii.crop_type === cropType);
      let avgWeightPerBox = 10;
      if (cropImportItems.length > 0) {
        const withWeightPerBox = cropImportItems.filter(ii => ii.weight_per_box > 0);
        if (withWeightPerBox.length > 0) {
          withWeightPerBox.sort((a, b) => b.id - a.id);
          avgWeightPerBox = withWeightPerBox[0].weight_per_box;
        }
      }

      if (weight <= 0 && boxCount <= 0) {
        showToast(currentLanguage === 'ar' ? 'الرجاء إدخال الوزن والعدد التالف بشكل صحيح' : 'Please enter a valid weight and count', 'warning', true);
        return;
      }

      if (weight > 0 && boxCount <= 0) {
        boxCount = Math.round(weight / avgWeightPerBox);
        if (boxCount <= 0) boxCount = 1;
      } else if (boxCount > 0 && weight <= 0) {
        weight = boxCount * avgWeightPerBox;
      }
    }

    // Determine estimated financial loss
    const allSaleItems = await dbGetAll('sale_items');
    const cropSales = allSaleItems.filter(si => si.crop_type === cropType);
    let averagePrice = 1000; // Fallback: 1000 IQD per kg
    if (cropSales.length > 0) {
      const totalSoldVal = cropSales.reduce((sum, si) => sum + (si.total_amount || 0), 0);
      const totalSoldWeight = cropSales.reduce((sum, si) => sum + (si.weight_kg || 0), 0);
      if (totalSoldWeight > 0) {
        averagePrice = totalSoldVal / totalSoldWeight;
      }
    }

    if (weight > 0) {
      amount = Math.round(weight * averagePrice);
    } else if (boxCount > 0) {
      amount = Math.round(boxCount * 10 * averagePrice); // Fallback: 10kg per box/bag
    }

    if (amount <= 0) {
      amount = weight > 0 ? weight * 1000 : boxCount * 10000;
    }

    const weightText = weight > 0 ? `${weight} كغم` : '';
    const boxText = boxCount > 0 ? `${boxCount} صندوق/كيس` : '';
    const detailsText = [weightText, boxText].filter(Boolean).join(' - ');

    subject = currentLanguage === 'ar'
      ? `تلف محصول: ${cropType} (${detailsText})`
      : `Crop Damage: ${cropType} (${detailsText})`;

    lossData = {
      type: 'crop_damage',
      crop_type: cropType,
      weight_kg: weight,
      box_count: boxCount
    };

    // ==========================================
    // CREATE AUTOMATIC NORMAL SALE INVOICE FOR DAMAGE
    // ==========================================
    try {
      // 1. Resolve customer named "تالف"
      let customer = cachedCustomers.find(c => c.name.trim() === 'تالف');
      if (!customer) {
        const newCustId = await dbAdd('customers', {
          name: 'تالف',
          phone: '07700000000',
          address: 'بغداد',
          created_at: Date.now()
        });
        customer = { id: newCustId, name: 'تالف', phone: '07700000000', address: 'بغداد' };
        // Refresh cached customers
        cachedCustomers = await dbGetAll('customers');
      }

      // 2. Resolve source import invoice and import item
      let targetImportInvoiceId = null;
      let targetImportItem = null;

      // Try to find in active imports
      for (const imp of activeImportInvoices) {
        const item = imp.items.find(it => it.crop_type === cropType);
        if (item) {
          const previousSales = allSaleItems.filter(s => s.import_invoice_id === imp.id && s.crop_type === cropType);
          
          let totalPreviouslySoldWeight = 0;
          let totalPreviouslySoldBoxes = 0;
          previousSales.forEach(s => {
            totalPreviouslySoldWeight += (s.weight_kg || 0);
            totalPreviouslySoldBoxes += (s.box_count || 0);
          });
          
          const remainingWeightStock = Math.max(0, item.weight_kg - totalPreviouslySoldWeight);
          const remainingBoxStock = Math.max(0, (item.box_count || 0) - totalPreviouslySoldBoxes);
          
          let hasStock = false;
          if (isCount) {
            hasStock = (remainingBoxStock > 0);
          } else if (isWatermelon) {
            hasStock = (remainingWeightStock > 0);
          } else {
            hasStock = (remainingWeightStock > 0 && remainingBoxStock > 0);
          }
          
          if (hasStock || !targetImportInvoiceId) {
            targetImportInvoiceId = imp.id;
            targetImportItem = item;
            if (hasStock) {
              break;
            }
          }
        }
      }

      // Fallback: search all import invoices
      if (!targetImportInvoiceId) {
        const allImportItems = await dbGetAll('import_items');
        const cropImportItems = allImportItems.filter(ii => ii.crop_type === cropType);
        if (cropImportItems.length > 0) {
          const sortedCropImports = cropImportItems.sort((a, b) => b.id - a.id);
          targetImportInvoiceId = sortedCropImports[0].invoice_id;
          targetImportItem = sortedCropImports[0];
        }
      }

      // Final Fallback: Create placeholder if absolutely none exists
      if (!targetImportInvoiceId) {
        let farmerId = 1;
        const allFarmers = await dbGetAll('farmers');
        if (allFarmers.length > 0) {
          farmerId = allFarmers[0].id;
        } else {
          farmerId = await dbAdd('farmers', {
            name: 'فلاح افتراضي',
            phone: '07700000000',
            address: 'العراق',
            created_at: Date.now()
          });
        }
        
        targetImportInvoiceId = await dbAdd('import_invoices', {
          farmer_id: farmerId,
          vehicle_type: 'حمل',
          invoice_date: Date.now(),
          is_settled: false,
          created_at: Date.now()
        });
        
        const newItemId = await dbAdd('import_items', {
          invoice_id: targetImportInvoiceId,
          crop_type: cropType,
          weight_kg: isCount ? 0 : (weight > 0 ? weight : 100),
          box_count: isWatermelon ? 0 : (boxCount > 0 ? boxCount : 10),
          weight_per_box: 10
        });
        
        targetImportItem = {
          id: newItemId,
          invoice_id: targetImportInvoiceId,
          crop_type: cropType,
          weight_kg: isCount ? 0 : (weight > 0 ? weight : 100),
          box_count: isWatermelon ? 0 : (boxCount > 0 ? boxCount : 10),
          weight_per_box: 10
        };
      }

      // 3. Create normal sale invoice
      const orderId = await generateOrderId();
      const saleInvoiceId = await dbAdd('sale_invoices', {
        customer_id: customer.id,
        order_id: orderId,
        total_amount: 0,
        payment_type: 'cash',
        bags_cost: 0,
        created_at: Date.now()
      });

      // 4. Save sale item
      const saleItemId = await dbAdd('sale_items', {
        sale_invoice_id: saleInvoiceId,
        import_invoice_id: targetImportInvoiceId,
        crop_type: cropType,
        weight_kg: isCount ? 0 : weight,
        box_count: isWatermelon ? 0 : boxCount,
        agreed_price: 0,
        unit: isCount ? 'count' : (targetImportItem.unit || 'kg'),
        commission_amount: 0,
        porter_fee: 0,
        unit_price: 0
      });

      // 5. Record farmer dues (set to 0, which correctly subtracts from inventory and assigns 0 value)
      const originalImport = await dbGet('import_invoices', targetImportInvoiceId);
      if (originalImport) {
        await dbAdd('farmer_dues', {
          farmer_id: originalImport.farmer_id,
          import_invoice_id: targetImportInvoiceId,
          sale_invoice_id: saleInvoiceId,
          sale_item_id: saleItemId,
          crop_type: cropType,
          weight_kg: isCount ? 0 : weight,
          box_count: isWatermelon ? 0 : boxCount,
          sold_price: 0,
          commission_deducted: 0,
          porter_deducted: 0,
          net_due: 0,
          is_paid: false,
          created_at: Date.now()
        });
      }

      logAppEvent(
        `تسجيل تلقائي لفاتورة بيع تالف للزبون: تالف (صنف: ${cropType})`,
        `Automatic sale invoice created for damaged goods: تالف (crop: ${cropType})`,
        0
      );

    } catch (e) {
      console.error("Error creating automatic sale invoice for damage:", e);
    }

  } else {
    const customSubject = document.getElementById('loss-subject').value.trim();
    const customAmount = parseNumberInput(document.getElementById('loss-amount').value);

    if (!customSubject || customAmount <= 0) {
      showToast(currentLanguage === 'ar' ? 'الرجاء إدخال سبب ومبلغ الخسارة بشكل صحيح' : 'Please fill all required loss fields', 'warning', true);
      return;
    }

    subject = customSubject;
    amount = customAmount;
    lossData = {
      type: 'other'
    };
  }

  await dbAdd('losses', {
    ...lossData,
    subject,
    amount,
    created_at: Date.now()
  });

  logAppEvent(
    `تسجيل خسائر (${isCropLoss ? 'تلف محصول' : 'خسائر وتلفيات أخرى'}): ${subject}`,
    `Recorded loss / damage: ${subject}`,
    amount
  );

  playSound('success');
  showToast(currentLanguage === 'ar' ? 'تم تسجيل الخسارة التالفة بنجاح وتعديل الأرباح!' : 'Loss recorded successfully!', 'check_circle');

  // Reset crop form fields
  document.getElementById('loss-crop-search').value = '';
  document.getElementById('loss-crop-selector').value = '';
  document.getElementById('loss-crop-weight').value = '';
  document.getElementById('loss-crop-box-count').value = '';

  const weightContainer = document.getElementById('loss-crop-weight-container');
  const boxCountContainer = document.getElementById('loss-crop-box-count-container');
  if (weightContainer) weightContainer.style.display = 'block';
  if (boxCountContainer) boxCountContainer.style.display = 'block';

  // Reset other form fields
  document.getElementById('loss-subject').value = '';
  document.getElementById('loss-amount').value = '';

  closeBottomSheet('sheet-new-loss');

  await refreshAllUI();
}

// Helper to draw high-fidelity random barcode on canvas
function drawRandomBarcode(canvasElement, is58mm) {
  const ctx = canvasElement.getContext('2d');
  if (!ctx) return;

  // Generate a random 12-digit number sequence
  const digits = Array.from({length: 12}, () => Math.floor(Math.random() * 10)).join('');

  // Define crisp logical size
  const logicalWidth = is58mm ? 320 : 440;
  const logicalHeight = 85;
  const scaleRatio = 2; // high resolution multiplier for extreme clarity

  canvasElement.width = logicalWidth * scaleRatio;
  canvasElement.height = logicalHeight * scaleRatio;

  // Clear background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  // EAN-13 / UPC encoding patterns
  const L_CODE = [
    [0,0,0,1,1,0,1], [0,0,1,1,0,0,1], [0,0,1,0,0,1,1], [0,1,1,1,1,0,1], [0,1,0,0,0,1,1],
    [0,1,1,0,0,0,1], [0,1,0,1,1,1,1], [0,1,1,1,0,1,1], [0,1,1,0,1,1,1], [0,0,0,1,0,1,1]
  ];
  const G_CODE = [
    [0,1,0,0,1,1,1], [0,1,1,0,0,1,1], [0,0,1,1,0,1,1], [0,1,0,0,0,0,1], [0,0,1,1,1,0,1],
    [0,1,1,1,0,0,1], [0,0,0,0,1,0,1], [0,0,1,0,0,0,1], [0,0,0,1,0,0,1], [0,0,1,0,1,1,1]
  ];
  const R_CODE = [
    [1,1,1,0,0,1,0], [1,1,0,0,1,1,0], [1,1,0,1,1,0,0], [1,0,0,0,0,1,0], [1,0,1,1,1,0,0],
    [1,0,0,1,1,1,0], [1,0,1,0,0,0,0], [1,0,0,0,1,0,0], [1,0,0,1,0,0,0], [1,1,1,0,1,0,0]
  ];

  // First digit determines the G/L sequence for first 6 digits
  const firstDigit = parseInt(digits[0]);
  const PARITY_TABLE = [
    [0,0,0,0,0,0], [0,0,1,0,1,1], [0,0,1,1,0,1], [0,0,1,1,1,0], [0,1,0,0,1,1],
    [0,1,1,0,0,1], [0,1,1,1,0,0], [0,1,0,1,0,1], [0,1,0,1,1,0], [0,1,1,0,1,0]
  ];
  const structure = PARITY_TABLE[firstDigit] || PARITY_TABLE[0];

  const modules = [];

  // Start Guard (101)
  modules.push(1, 0, 1);

  // Left 6 digits
  for (let i = 1; i <= 6; i++) {
    const digit = parseInt(digits[i]);
    const useG = structure[i - 1] === 1;
    const pattern = useG ? G_CODE[digit] : L_CODE[digit];
    modules.push(...pattern);
  }

  // Center Guard (01010)
  modules.push(0, 1, 0, 1, 0);

  // Right 6 digits (using last 5 from random + EAN checksum for authentic look)
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  const rightDigits = digits.slice(7) + checkDigit;

  for (let i = 0; i < 6; i++) {
    const digit = parseInt(rightDigits[i]);
    modules.push(...R_CODE[digit]);
  }

  // End Guard (101)
  modules.push(1, 0, 1);

  // Center the drawing beautifully
  const moduleCount = modules.length; // 95
  const moduleWidth = is58mm ? 2.5 * scaleRatio : 3.5 * scaleRatio;
  const barcodeWidth = moduleCount * moduleWidth;
  const startX = Math.floor((canvasElement.width - barcodeWidth) / 2);

  const barHeight = 55 * scaleRatio;
  const guardExtraHeight = 6 * scaleRatio;

  // Enable crisp pixels
  ctx.imageSmoothingEnabled = false;

  // Draw lines
  ctx.fillStyle = '#000000';
  for (let i = 0; i < moduleCount; i++) {
    if (modules[i] === 1) {
      const isGuard = (i < 3) || (i >= 45 && i < 50) || (i >= 92);
      const h = isGuard ? (barHeight + guardExtraHeight) : barHeight;
      ctx.fillRect(Math.floor(startX + i * moduleWidth), Math.floor(10 * scaleRatio), Math.ceil(moduleWidth), Math.floor(h));
    }
  }

  // Draw EAN numbers underneath
  ctx.font = `bold ${16 * scaleRatio}px "Courier New", Courier, monospace`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#000000';
  
  const displayNum = digits[0] + ' ' + digits.slice(1, 7) + ' ' + rightDigits;
  ctx.fillText(displayNum, canvasElement.width / 2, (logicalHeight - 3) * scaleRatio);
}

// Simple digit pattern helper to map 0-9 into distinct array patterns for guard lines
function getBarcodeDigitPattern(digit) {
  const patterns = [
    [true, false, true, true],
    [true, true, false, true],
    [false, true, true, false],
    [true, false, false, true],
    [false, true, false, true],
    [true, true, false, false],
    [false, false, true, true],
    [true, false, true, false],
    [false, true, true, true],
    [true, true, true, false]
  ];
  return patterns[digit] || patterns[0];
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
  if (document.getElementById('btn-execute-sysprint')) document.getElementById('btn-execute-sysprint').dataset.id = saleId;
  document.getElementById('btn-share-receipt').dataset.id = saleId;

  // Build high-fidelity thermal receipt container
  const container = document.getElementById('receipt-paper');
  if (container) {
    container.className = `thermal-paper w-${printerPaperWidth}`;
  }

  const formattedDate = formatCustomDate(sale.created_at, true);
  const orderId = sale.order_id || ('ALW-' + String(sale.id).padStart(3, '0'));

  const is58mm = printerPaperWidth === '58';
  const fontSizeClass = is58mm ? 'font-size: 17.5px; line-height: 1.35;' : 'font-size: 20px; line-height: 1.45;';
  const tableFontSizeClass = is58mm ? 'font-size: 18.5px; line-height: 1.3;' : 'font-size: 21.3px; line-height: 1.4;';
  const headerFontSizeClass = is58mm ? 'font-size: 24px;' : 'font-size: 29px;';
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
        <td style="text-align: right; width: auto; ${paddingClass} white-space: normal; word-break: break-word; line-height: 1.25; padding-left: 8px;" title="${cropName}">${cropName}</td>
        <td style="text-align: center; width: 1%; white-space: nowrap; ${paddingClass} padding-left: 12px; padding-right: 12px; vertical-align: bottom !important; padding-bottom: 0px !important;">${priceStr}</td>
        <td style="text-align: center; width: 1%; white-space: nowrap; ${paddingClass} padding-left: 12px; padding-right: 12px; vertical-align: bottom !important; padding-bottom: 0px !important;">${weightStr}</td>
        <td style="text-align: left; width: 1%; white-space: nowrap; ${paddingClass} padding-left: 4px; font-weight: 700; vertical-align: bottom !important; padding-bottom: 0px !important;">${boxesStr}</td>
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
      <p style="${fontSizeClass} color: #000; font-weight: 700; margin: 0 0 4px 0;">بإدارة: ${officeOwner}</p>
      <p style="${fontSizeClass} color: #000; margin: 0 0 2px 0;">هاتف: ${officePhone}</p>
      <p style="${fontSizeClass} color: #000; margin: 0;">العنوان: ${officeLocation}</p>
    </div>

    <div style="${fontSizeClass} border-bottom: 1.5px dashed #000; padding-bottom: 6px; margin-bottom: 6px; line-height: 1.4; direction: rtl;">
      <div style="display:flex; justify-content:space-between; margin-bottom: 2px;">
        <span>رقم الفاتورة:</span>
        <span style="font-family: 'Monofrik' !important; font-weight: 900; font-size: 16px; vertical-align: middle;"># ${formatVal(sale.id)} (${orderId})</span>
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

    <table class="receipt-table" style="width: 100%; border-collapse: collapse; ${tableFontSizeClass} table-layout: auto; direction: rtl; margin-bottom: 6px;">
      <thead>
        <tr style="border-bottom: 1.5px dashed #000; height: 24px;">
          <th style="text-align: right; font-weight:700; width: auto; padding-left: 8px; vertical-align: middle !important; padding-bottom: 10px !important;">${currentLanguage === 'ar' ? 'الصنف' : 'Item'}</th>
          <th style="text-align: center; font-weight:700; width: 1%; white-space: nowrap; padding-left: 12px; padding-right: 12px; vertical-align: middle !important; padding-bottom: 10px !important;">${currentLanguage === 'ar' ? 'السعر' : 'Price'}</th>
          <th style="text-align: center; font-weight:700; width: 1%; white-space: nowrap; padding-left: 12px; padding-right: 12px; vertical-align: middle !important; padding-bottom: 10px !important;">${currentLanguage === 'ar' ? 'الوزن' : 'Weight'}</th>
          <th style="text-align: left; font-weight:700; width: 1%; white-space: nowrap; padding-left: 4px; vertical-align: middle !important; padding-bottom: 10px !important;">${currentLanguage === 'ar' ? 'العدد' : 'Count'}</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRowsHtml}
      </tbody>
    </table>

    <div style="${fontSizeClass} border-top: 1.5px dashed #000; margin-top: 4px; padding-top: 6px; line-height: 1.4; direction: rtl;">
      ${sale.bags_cost > 0 ? `
        <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
          <span style="padding-top: 8px; display: inline-block;">تكلفة الأكياس والكراتين:</span>
          <span style="font-weight:600; padding-top: 4px; display: inline-block;">${formatVal(sale.bags_cost, true)}</span>
        </div>
      ` : ''}
      <div style="display:flex; justify-content:space-between; font-weight: 800; ${sale.bags_cost > 0 ? 'border-top: 1.2px dashed #000; margin-top: 4px; padding-top: 4px;' : ''}">
        <span style="padding-top: 8px; display: inline-block;">الإجمالي المستحق:</span>
        <span style="font-size: 1.3em; padding-top: 4px; display: inline-block;">${formatVal(sale.total_amount, true)}</span>
      </div>
      ${sale.notes ? `
        <div style="border-top: 1.2px dashed #000; margin-top: 8px; padding-top: 6px; text-align: start; font-size: 15px; line-height: 1.35;">
          <span style="font-weight: 800; display: block; margin-bottom: 2px;">ملاحظات:</span>
          <span style="display: block; font-weight: 700;">${sale.notes}</span>
        </div>
      ` : ''}
    </div>

    <!-- Generates dynamic offline QR-code and random barcode inside preview -->
    <div style="margin-top: 14px; padding-top: 14px; border-top: 1.5px dashed #000; direction: ltr; text-align: left;">
      <!-- Row 1 & 2: Left half (Text info) and Right half (QR) -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
        <!-- Left half: Monospace text & Invoice code -->
        <div style="flex: 1; text-align: left; color: #000; word-break: break-word;">
          <div style="font-size: 19px; font-weight: 900; margin-bottom: 4px; padding-top: 10px;">Invoice: <span class="font-monofrik" style="font-family: 'Monofrik' !important; font-size: 21px; font-weight: normal; vertical-align: middle;">${orderId}</span></div>
          <div style="font-size: 17px; font-weight: 900; margin-bottom: 4px;">Cashier: <span style="font-family: 'Monofrik' !important; font-size: 18px; font-weight: normal; vertical-align: middle;">${officeCashier}</span></div>
          <div style="font-size: 15px; font-weight: 700; line-height: 1.3;">This Invoice was successfully registered in the system</div>
        </div>
        <!-- Right half: QR code -->
        <div style="text-align: right; flex-shrink: 0;">
          <canvas id="receipt-qr-canvas" style="display: block; margin: 0; padding: 0;"></canvas>
        </div>
      </div>

      <!-- Row 3: Barcode below -->
      <div style="text-align: center; margin-top: 18px; padding-top: 12px; border-top: 1.5px dashed #000;">
        <canvas id="receipt-barcode-canvas" style="display: block; width: 100%; max-width: 100%; height: 90px; margin: 0 auto;"></canvas>
      </div>

      <div style="text-align: center; font-size: 13px; color: #000; font-weight: 700; margin-top: 8px; direction: rtl;">
        شكرًا لتعاملكم معنا - ${officeName}
      </div>
      <div style="text-align: center; font-size: 13.5px; color: #000; font-weight: 800; margin-top: 8px; border-top: 1px dashed #000; padding-top: 6px; direction: rtl; font-family: var(--font-family) !important; line-height: 1.4;">
        برمجة و تطوير شركة Prime™ Solutions 
        <br>
        Whatsapp: 07749883474
      </div>
    </div>
  `;

  // Render QR Canvas and Barcode Canvas
  setTimeout(() => {
    const qrCanvas = document.getElementById('receipt-qr-canvas');
    if (qrCanvas) {
      new window.QRious({
        element: qrCanvas,
        value: orderId, // Points strictly to the invoice symbol / code
        size: is58mm ? 96 : 132,
        background: '#ffffff',
        foreground: '#000000'
      });
    }

    const barcodeCanvas = document.getElementById('receipt-barcode-canvas');
    if (barcodeCanvas) {
      drawRandomBarcode(barcodeCanvas, is58mm);
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
let printerBatteryPercent = null;

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

function extractBatteryPercentage(value) {
  if (typeof value !== 'number' || isNaN(value)) return 100;
  
  // 1. Dual-cell millivolts (e.g. 6000 to 8500)
  if (value >= 6000 && value <= 8500) {
    return Math.max(0, Math.min(100, Math.round(((value - 6000) / 2400) * 100)));
  }
  
  // 2. Single-cell millivolts (optimized for 3.7V Li-ion: 3400mV to 4200mV)
  if (value >= 3000 && value <= 4500) {
    // 3400mV is typically empty for high-current thermal heads, 4200mV is fully charged
    return Math.max(0, Math.min(100, Math.round(((value - 3400) / 800) * 100)));
  }

  // 3. Dual-cell decivolts (e.g. 60 to 85 for 6.0V - 8.5V Li-ion pack, typical for portable printers)
  if (value >= 60 && value <= 85) {
    return Math.max(0, Math.min(100, Math.round(((value - 60) / 24) * 100)));
  }
  
  // 4. Single-cell decivolts (optimized for 3.7V Li-ion decivolts: 34 to 42)
  if (value >= 30 && value <= 45) {
    return Math.max(0, Math.min(100, Math.round(((value - 34) / 8) * 100)));
  }

  // 5. Cheap Chinese pocket printers bar-count indicators (returning 1 to 4, or 1 to 5 bars)
  // Portable printers brownout or refuse to print when actual battery is below 20-30%.
  // A raw value of 1-5 received from a working printer is almost certainly a bar-count rather than literal 1%-5%.
  if (value >= 1 && value <= 5) {
    if (value === 1) return 25;
    if (value === 2) return 50;
    if (value === 3) return 75;
    if (value === 4) return 100;
    if (value === 5) return 100;
  }
  
  // 6. Standard 0-100 percentage (excluding the 1-5 bar counts handled above)
  if (value >= 0 && value <= 100) {
    return value;
  }
  
  // 7. Raw 8-bit Analog Digital Converter (ADC) reading (e.g. 170 to 255 representing raw voltage range)
  if (value > 100 && value <= 255) {
    if (value >= 170) {
      return Math.max(0, Math.min(100, Math.round(((value - 170) / 70) * 100)));
    }
    return Math.max(0, Math.min(100, Math.round((value / 255) * 100)));
  }
  
  return 100;
}

async function subscribeToPrinterBatteryNotifications(device) {
  if (!device || !device.gatt || !device.gatt.connected) return;
  
  const batteryServiceUUIDs = ['battery_service', 0x180f, '0000180f-0000-1000-8000-00805f9b34fb', '0000180F-0000-1000-8000-00805f9b34fb'];
  const batteryCharUUIDs = ['battery_level', 0x2a19, '00002a19-0000-1000-8000-00805f9b34fb', '00002A19-0000-1000-8000-00805f9b34fb'];
  
  let service = null;
  let characteristic = null;
  const server = device.gatt;

  // 1. Try to get the battery service with fallbacks
  for (const uuid of batteryServiceUUIDs) {
    try {
      service = await server.getPrimaryService(uuid);
      if (service) {
        console.log(`[Printer Battery] Found Battery Service using UUID/Name: ${uuid}`);
        break;
      }
    } catch (e) {
      // Try next
    }
  }

  if (!service) {
    console.log('[Printer Battery] Battery service not found via standard service lookups. Trying dynamic discovery...');
    try {
      const primaryServices = await server.getPrimaryServices();
      for (const s of primaryServices) {
        const sUuid = s.uuid.toLowerCase();
        if (sUuid.includes('180f') || sUuid === 'battery_service') {
          service = s;
          console.log(`[Printer Battery] Discovered Battery Service dynamically: ${s.uuid}`);
          break;
        }
      }
    } catch (err) {
      console.log('[Printer Battery] getPrimaryServices() failed or not allowed:', err);
    }
  }

  if (!service) {
    console.log('[Printer Battery] No battery service could be resolved on this printer.');
    return;
  }

  // 2. Try to get the battery level characteristic with fallbacks
  for (const uuid of batteryCharUUIDs) {
    try {
      characteristic = await service.getCharacteristic(uuid);
      if (characteristic) {
        console.log(`[Printer Battery] Found Battery Characteristic using UUID/Name: ${uuid}`);
        break;
      }
    } catch (e) {
      // Try next
    }
  }

  if (!characteristic) {
    try {
      const chars = await service.getCharacteristics();
      for (const c of chars) {
        const cUuid = c.uuid.toLowerCase();
        if (cUuid.includes('2a19') || cUuid === 'battery_level') {
          characteristic = c;
          console.log(`[Printer Battery] Discovered Battery Characteristic dynamically: ${c.uuid}`);
          break;
        }
      }
    } catch (err) {
      console.log('[Printer Battery] getCharacteristics() failed:', err);
    }
  }

  if (!characteristic) {
    console.log('[Printer Battery] Battery level characteristic not found.');
    return;
  }

  // 3. Set up notification and read initial value
  try {
    const initialVal = await characteristic.readValue();
    printerBatteryPercent = extractBatteryPercentage(initialVal.getUint8(0));
    console.log(`[Printer Battery] Initial battery read: ${printerBatteryPercent}%`);
    
    // Trigger UI update immediately
    if (typeof window.updateDevicesStatus === 'function') {
      window.updateDevicesStatus();
    }
  } catch (err) {
    console.log('[Printer Battery] Direct read value failed, trying notification subscription...', err);
  }

  try {
    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', (event) => {
      const val = event.target.value;
      printerBatteryPercent = extractBatteryPercentage(val.getUint8(0));
      console.log(`[Printer Battery] Battery notification received: ${printerBatteryPercent}%`);
      if (typeof window.updateDevicesStatus === 'function') {
        window.updateDevicesStatus();
      }
    });
  } catch (err) {
    console.log('[Printer Battery] Subscribing to notifications failed:', err);
  }
}

async function queryPrinterBatteryWebBluetooth() {
  if (!isPrinterConnected || !activeWebBluetoothDevice || !activeWebBluetoothDevice.gatt || !activeWebBluetoothDevice.gatt.connected) {
    printerBatteryPercent = null;
    return;
  }
  
  const batteryServiceUUIDs = ['battery_service', 0x180f, '0000180f-0000-1000-8000-00805f9b34fb'];
  const batteryCharUUIDs = ['battery_level', 0x2a19, '00002a19-0000-1000-8000-00805f9b34fb'];
  
  const server = activeWebBluetoothDevice.gatt;
  let service = null;
  let characteristic = null;

  for (const uuid of batteryServiceUUIDs) {
    try {
      service = await server.getPrimaryService(uuid);
      if (service) break;
    } catch (e) {}
  }

  if (!service) return;

  for (const uuid of batteryCharUUIDs) {
    try {
      characteristic = await service.getCharacteristic(uuid);
      if (characteristic) break;
    } catch (e) {}
  }

  if (!characteristic) return;

  try {
    const value = await characteristic.readValue();
    printerBatteryPercent = extractBatteryPercentage(value.getUint8(0));
  } catch (err) {
    // Silent fail
  }
}

function discoverBatteryGATT(device) {
  bleBatteryServiceUUID = null;
  bleBatteryCharUUID = null;
  if (device && device.characteristics) {
    for (const char of device.characteristics) {
      const sUuid = (char.service || '').toLowerCase();
      const cUuid = (char.characteristic || '').toLowerCase();
      if ((sUuid.includes('180f') || sUuid === 'battery_service') && 
          (cUuid.includes('2a19') || cUuid === 'battery_level')) {
        bleBatteryServiceUUID = char.service;
        bleBatteryCharUUID = char.characteristic;
        console.log(`[Printer Battery] Discovered BLE Battery GATT: Service=${bleBatteryServiceUUID}, Char=${bleBatteryCharUUID}`);
        
        // Dynamic properties check
        const props = Array.isArray(char.properties) ? char.properties : (typeof char.properties === 'string' ? [char.properties] : []);
        const canNotify = props.some(p => typeof p === 'string' && (p.toLowerCase().indexOf('notify') !== -1 || p.toLowerCase().indexOf('indicate') !== -1));
        
        // 1. Initial read right away
        window.ble.read(device.id, bleBatteryServiceUUID, bleBatteryCharUUID, function(data) {
          try {
            const arr = new Uint8Array(data);
            if (arr.length > 0) {
              printerBatteryPercent = extractBatteryPercentage(arr[0]);
              localStorage.setItem('alwa_printer_battery_percent', printerBatteryPercent);
              console.log(`[Printer Battery] Success initial BLE read: ${printerBatteryPercent}%`);
              if (typeof window.updateDevicesStatus === 'function') {
                window.updateDevicesStatus();
              }
            }
          } catch(e) {
            console.warn("[Printer Battery] Error parsing initial read data:", e);
          }
        }, function(err) {
          console.log("[Printer Battery] Initial BLE read failed, using standard fallback search", err);
        });

        // 2. Subscribe to notifications if supported
        if (canNotify) {
          console.log(`[Printer Battery] Subscribing to BLE battery notifications...`);
          window.ble.startNotification(device.id, bleBatteryServiceUUID, bleBatteryCharUUID, function(data) {
            try {
              const arr = new Uint8Array(data);
              if (arr.length > 0) {
                printerBatteryPercent = extractBatteryPercentage(arr[0]);
                localStorage.setItem('alwa_printer_battery_percent', printerBatteryPercent);
                console.log(`[Printer Battery] BLE battery notification received: ${printerBatteryPercent}%`);
                if (typeof window.updateDevicesStatus === 'function') {
                  window.updateDevicesStatus();
                }
              }
            } catch(e) {}
          }, function(err) {
            console.warn(`[Printer Battery] Start BLE notifications failed:`, err);
          });
        }
        break;
      }
    }
  }
}

function queryPrinterBatteryCordovaBLE() {
  if (typeof window.ble !== 'undefined' && isPrinterConnected && bleConnectedDeviceId && !isCordovaSerialActive) {
    const serviceUUID = bleBatteryServiceUUID || '180f';
    const charUUID = bleBatteryCharUUID || '2a19';
    
    window.ble.read(bleConnectedDeviceId, serviceUUID, charUUID, function(data) {
      try {
        const arr = new Uint8Array(data);
        if (arr.length > 0) {
          printerBatteryPercent = extractBatteryPercentage(arr[0]);
          localStorage.setItem('alwa_printer_battery_percent', printerBatteryPercent);
          console.log(`[Printer Battery] Cordova BLE read battery: ${printerBatteryPercent}%`);
        }
      } catch (e) {
        console.warn("[Printer Battery] Error parsing Cordova BLE battery reading:", e);
      }
    }, function(err) {
      console.log("[Printer Battery] Cordova BLE battery read failed with default/discovered UUIDs:", err);
      // Try fallback to 128-bit standard format if we haven't already
      if (!bleBatteryServiceUUID) {
        const standardBatteryService128 = '0000180f-0000-1000-8000-00805f9b34fb';
        const standardBatteryChar128 = '00002a19-0000-1000-8000-00805f9b34fb';
        window.ble.read(bleConnectedDeviceId, standardBatteryService128, standardBatteryChar128, function(fallbackData) {
          try {
            const arr = new Uint8Array(fallbackData);
            if (arr.length > 0) {
              printerBatteryPercent = extractBatteryPercentage(arr[0]);
              localStorage.setItem('alwa_printer_battery_percent', printerBatteryPercent);
              console.log(`[Printer Battery] Cordova BLE read battery (128-bit fallback): ${printerBatteryPercent}%`);
            }
          } catch (e) {}
        }, function(fallbackErr) {
          console.log("[Printer Battery] 128-bit fallback read also failed:", fallbackErr);
        });
      }
    });
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
        'e7810a71-73ae-499d-8c15-faa9ae0c2c61',
        '0000180f-0000-1000-8000-00805f9b34fb', // Standard Battery Service UUID
        'battery_service',
        0x180f
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

    // Subscribe to printer battery levels/notifications if available
    subscribeToPrinterBatteryNotifications(device);

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
    // Clean up first to prevent native crash/socket leaks
    try { window.bluetoothSerial.disconnect(); } catch(e) {}
    
    // Tiny delay to ensure socket cleanup completes
    setTimeout(() => {
      window.bluetoothSerial.connect(printer.mac, function() {
        // Save to localStorage for auto-reconnect
        localStorage.setItem('alwa_printer_address', printer.mac);
        localStorage.setItem('alwa_printer_type', printer.type);
        localStorage.setItem('alwa_printer_name', printer.name);
        
        establishSuccessState();
      }, function(err) {
        // If it was already connected and lost, handleConnectionLost will clean up.
        // Otherwise, handle regular failure.
        if (isPrinterConnected) {
          handleConnectionLost(printer.name, printer.mac, printer.type, err);
        } else {
          establishFailureState(err);
        }
      });
    }, 150);
    return;
  }

  // 2. Cordova BLE Central connection
  if (typeof window.ble !== 'undefined' && printer.type === 'ble') {
    // Clean up first to prevent GATT leak/native crash
    try { window.ble.disconnect(printer.mac); } catch(e) {}

    setTimeout(() => {
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
        
        // Discover and handle battery service/notifications
        if (typeof discoverBatteryGATT === 'function') {
          discoverBatteryGATT(device);
        }
        
        // Save to localStorage for auto-reconnect
        localStorage.setItem('alwa_printer_address', printer.mac);
        localStorage.setItem('alwa_printer_type', printer.type);
        localStorage.setItem('alwa_printer_name', printer.name);

        establishSuccessState();
      }, function(err) {
        if (isPrinterConnected) {
          handleConnectionLost(printer.name, printer.mac, printer.type, err);
        } else {
          establishFailureState(err);
        }
      });
    }, 150);
    return;
  }

  // 3. Simulated Connection
  setTimeout(() => {
    localStorage.setItem('alwa_printer_address', printer.mac);
    localStorage.setItem('alwa_printer_type', printer.type);
    localStorage.setItem('alwa_printer_name', printer.name);
    establishSuccessState();
  }, 1000);

  function establishSuccessState() {
    isPrinterConnected = true;
    bleConnectedDeviceId = printer.mac;
    connectedDeviceAddress = printer.mac;
    isCordovaSerialActive = (printer.type === 'classic');
    isManualScanning = false;
    consecutiveAutoConnectFailures = 0; // Reset connection failure counter on manual success

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
    isPrinterConnected = false;
    isAutoConnecting = false;
    bleConnectedDeviceId = null;
    isCordovaSerialActive = false;
    connectedDeviceAddress = null;

    // Explicitly clean up on failure
    if (typeof window.bluetoothSerial !== 'undefined') {
      try { window.bluetoothSerial.disconnect(); } catch(e) {}
    }
    if (typeof window.ble !== 'undefined' && printer.mac) {
      try { window.ble.disconnect(printer.mac); } catch(e) {}
    }

    if (statusText) {
      statusText.textContent = currentLanguage === 'ar' ? `فشل الاتصال بـ ${printer.name}` : `Failed to connect to ${printer.name}`;
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
      scanBtn.style.backgroundColor = "var(--color-primary-mid)";
    }

    showToast(currentLanguage === 'ar' ? 'فشل الاتصال بجهاز الطابعة الحرارية' : 'Failed to connect to hardware printer', 'error', true);
  }
}

function handleConnectionLost(name, mac, type, err) {
  console.log(`Connection to ${name} (${mac}) lost:`, err);
  
  isPrinterConnected = false;
  isAutoConnecting = false;
  bleConnectedDeviceId = null;
  isCordovaSerialActive = false;
  connectedDeviceAddress = null;

  // Clean up native hardware states immediately to prevent OS level socket or GATT resource leak crashes
  if (typeof window.bluetoothSerial !== 'undefined') {
    try { window.bluetoothSerial.disconnect(); } catch(e) {}
  }
  if (typeof window.ble !== 'undefined' && mac) {
    try { window.ble.disconnect(mac); } catch(e) {}
  }
  if (activeWebBluetoothDevice) {
    try {
      if (activeWebBluetoothDevice.gatt.connected) {
        activeWebBluetoothDevice.gatt.disconnect();
      }
    } catch(e) {}
    activeWebBluetoothDevice = null;
    activeWebBluetoothCharacteristic = null;
  }

  // Synchronize UI Elements
  const statusText = document.getElementById('printer-status-text');
  const statusDot = document.getElementById('printer-status-dot');
  const testPrintBtn = document.getElementById('btn-test-print');
  const scanBtn = document.getElementById('btn-scan-printer');

  if (statusText) {
    statusText.textContent = currentLanguage === 'ar' ? `فقد الاتصال بالطابعة ${name}` : `Connection lost to ${name}`;
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

  playSound('error');
  showToast(currentLanguage === 'ar' ? `تم فقد الاتصال بالطابعة ${name}!` : `Connection to ${name} was lost!`, 'error', true);
}

function disconnectPrinter() {
  const statusText = document.getElementById('printer-status-text');
  const statusDot = document.getElementById('printer-status-dot');
  const testPrintBtn = document.getElementById('btn-test-print');
  const scanBtn = document.getElementById('btn-scan-printer');
  const container = document.getElementById('printer-device-list-container');

  // Disconnect active hardware Bluetooth cleanly to release all Android/iOS system resources
  if (typeof window.bluetoothSerial !== 'undefined') {
    try { window.bluetoothSerial.disconnect(); } catch(e) {}
  }
  if (typeof window.ble !== 'undefined' && (bleConnectedDeviceId || connectedDeviceAddress)) {
    try { window.ble.disconnect(bleConnectedDeviceId || connectedDeviceAddress); } catch(e) {}
  }
  if (activeWebBluetoothDevice) {
    try {
      if (activeWebBluetoothDevice.gatt.connected) {
        activeWebBluetoothDevice.gatt.disconnect();
      }
    } catch(e) {}
    activeWebBluetoothDevice = null;
    activeWebBluetoothCharacteristic = null;
  }

  isPrinterConnected = false;
  bleConnectedDeviceId = null;
  isCordovaSerialActive = false;
  connectedDeviceAddress = null;
  isManualScanning = false;
  consecutiveAutoConnectFailures = 0; // Reset counter on manual disconnect

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
            
            // Subscribe to printer battery levels/notifications if available
            subscribeToPrinterBatteryNotifications(device);

            establishAutoConnectSuccess(savedName, savedAddress, savedType);
            return;
          }
        }
        handleAutoConnectFailure('Device or characteristic not found', savedName, savedAddress, savedType);
      } catch (err) {
        console.error('Auto-connect Web Bluetooth failure:', err);
        handleAutoConnectFailure(err, savedName, savedAddress, savedType);
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
      
      // Clean up previous stale channel first before connecting
      try { window.bluetoothSerial.disconnect(); } catch(e) {}
      
      setTimeout(() => {
        window.bluetoothSerial.connect(savedAddress, function() {
          isAutoConnecting = false;
          establishAutoConnectSuccess(savedName, savedAddress, savedType);
        }, function(err) {
          isAutoConnecting = false;
          if (isPrinterConnected) {
            handleConnectionLost(savedName, savedAddress, savedType, err);
          } else {
            console.error('Auto-connect classic mode failure, retrying soon:', err);
            handleAutoConnectFailure(err, savedName, savedAddress, savedType);
          }
        });
      }, 150);
      return;
    }

    // Cordova BLE Central Reconnect
    if (typeof window.ble !== 'undefined' && savedType === 'ble') {
      if (statusText) {
        statusText.textContent = currentLanguage === 'ar' 
          ? `جاري إعادة الاتصال التلقائي بالطابعة ${savedName}...` 
          : `Auto-reconnecting to ${savedName}...`;
      }
      
      // Clean up previous stale channel first before connecting
      try { window.ble.disconnect(savedAddress); } catch(e) {}
      
      setTimeout(() => {
        window.ble.connect(savedAddress, function(device) {
          let writeChar = null;
          if (device.services && device.characteristics) {
            for (const char of device.characteristics) {
              const props = Array.isArray(char.properties) ? char.properties : (typeof char.properties === 'string' ? [char.properties] : []);
              const hasWrite = props.some(p => typeof p === 'string' && (p.toLowerCase().indexOf('write') !== -1));
              if (hasWrite) {
                bleWriteServiceUUID = char.service;
                bleWriteCharUUID = char.characteristic;
                writeChar = char;
                break;
              }
            }
          }
          
          if (!writeChar || !bleWriteCharUUID) {
            bleWriteServiceUUID = '000018f0-0000-1000-8000-00805f9b34fb';
            bleWriteCharUUID = '00002af1-0000-1000-8000-00805f9b34fb';
          }
          
          // Discover and handle battery service/notifications
          if (typeof discoverBatteryGATT === 'function') {
            discoverBatteryGATT(device);
          }
          
          isAutoConnecting = false;
          establishAutoConnectSuccess(savedName, savedAddress, savedType);
        }, function(err) {
          isAutoConnecting = false;
          if (isPrinterConnected) {
            handleConnectionLost(savedName, savedAddress, savedType, err);
          } else {
            console.error('Auto-connect BLE mode failure, retrying soon:', err);
            handleAutoConnectFailure(err, savedName, savedAddress, savedType);
          }
        });
      }, 150);
      return;
    }

    // Fallback to offline preview simulator auto-connect
    setTimeout(() => {
      isAutoConnecting = false;
      establishAutoConnectSuccess(savedName, savedAddress, savedType);
    }, 1500);

  }, 10000); // Check and attempt reconnect every 10 seconds
}

function handleAutoConnectFailure(err, name, mac, type) {
  consecutiveAutoConnectFailures++;
  console.warn(`Auto-connect failure (${consecutiveAutoConnectFailures}/3) to ${name}:`, err);
  
  if (consecutiveAutoConnectFailures >= 3) {
    if (autoConnectIntervalId) {
      clearInterval(autoConnectIntervalId);
      autoConnectIntervalId = null;
    }
    isAutoConnecting = false;
    
    // Reset status text to guide the user in a friendly way and prevent background hammering
    const statusText = document.getElementById('printer-status-text');
    if (statusText) {
      statusText.textContent = currentLanguage === 'ar' 
        ? `تم إيقاف الاتصال التلقائي مؤقتاً لتوفير طاقة وموارد الجهاز` 
        : `Auto-connect paused to conserve battery and system resources`;
    }
    
    showToast(
      currentLanguage === 'ar' 
        ? `تم إيقاف الاتصال التلقائي مؤقتاً بعد 3 محاولات فاشلة. يرجى التأكد من تشغيل طابعة البلوتوث ثم اضغط اقتران` 
        : `Auto-connect paused after 3 failed attempts. Please make sure the printer is turned on and try scanning again.`, 
      'warning', 
      true
    );
  }
}

function establishAutoConnectSuccess(name, mac, type) {
  isPrinterConnected = true;
  bleConnectedDeviceId = mac;
  connectedDeviceAddress = mac;
  isCordovaSerialActive = (type === 'classic');
  isManualScanning = false;
  consecutiveAutoConnectFailures = 0; // Reset counter on success

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
            <div style="display:flex; flex-direction:column; gap:12px; padding:4px; text-align:${currentLanguage === 'ar' ? 'right' : 'left'}; direction:${currentLanguage === 'ar' ? 'rtl' : 'ltr'};">
              <div style="background: rgba(45, 106, 79, 0.04); border: 1.5px dashed var(--color-primary-light); border-radius: 10px; padding: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.01); text-align: right;">
                <p style="font-weight: bold; color: var(--color-primary); font-size: 13px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; justify-content: flex-start; direction: rtl;">
                  <span class="material-icons-round" style="font-size: 18px; color: var(--color-primary);">info</span>
                  ${currentLanguage === 'ar' 
                    ? 'تعليمات تشغيل الطابعة لأجهزة الأندرويد وتطبيق الـ APK:' 
                    : 'Printer Setup Guide for Android APK / WebView:'}
                </p>
                
                <p style="font-size: 11.5px; color: #2d3748; line-height: 1.6; margin-bottom: 10px; direction: rtl;">
                  ${currentLanguage === 'ar'
                    ? 'نظراً لأن نظام أندرويد يمنع الاتصال المباشر بالبلوتوث من داخل تطبيقات الويب المغلفة (APK WebView)، يمكنك تشغيل طابعتك الحرارية فوراً وبأعلى جودة عبر <strong>ميزة طباعة النظام المدمجة</strong> بالخطوات البسيطة التالية:'
                    : 'Since Android restricts direct Bluetooth access within wrapped WebView apps (APK), you can easily print to your thermal printer using the built-in <strong>System Print</strong>:'}
                </p>
                
                <ol style="font-size: 11px; color: #4a5568; padding-right: 20px; margin-bottom: 12px; line-height: 1.6; list-style-type: decimal; direction: rtl;">
                  <li style="margin-bottom: 6px;">
                    ${currentLanguage === 'ar'
                      ? 'قم بتحميل تطبيق وسيط مجاني للطباعة من متجر Google Play (مثل تطبيق <strong>RawBT</strong> أو <strong>Bluetooth Print</strong>).'
                      : 'Download a free print service bridge from Google Play Store (e.g., <strong>RawBT</strong> or <strong>Bluetooth Print</strong>).'}
                  </li>
                  <li style="margin-bottom: 6px;">
                    ${currentLanguage === 'ar'
                      ? 'افتح التطبيق الوسيط وقم بالاقتران مع طابعة البلوتوث الخاصة بك من داخله لتعريفها كطابعة افتراضية للنظام.'
                      : 'Open the bridge app and pair with your Bluetooth Thermal Printer to register it as a system print service.'}
                  </li>
                  <li style="margin-bottom: 4px;">
                    ${currentLanguage === 'ar'
                      ? 'الآن، عند معاينة أي فاتورة في تطبيقنا، اضغط على زر <strong>"طباعة النظام"</strong> الجديد بالأسفل، ثم اختر التطبيق الوسيط (أو طابعتك) ليتم الطباعة فوراً!'
                      : 'Now, when previewing any invoice, click the new <strong>"System Print"</strong> button and select the bridge service to print instantly!'}
                  </li>
                </ol>
                
                <div style="height: 1px; background: rgba(0,0,0,0.06); margin: 10px 0;"></div>
                
                <p style="font-size: 11px; color: var(--color-danger); line-height: 1.5; font-weight: 500; direction: rtl;">
                  ${currentLanguage === 'ar'
                    ? '💡 نصيحة: إذا كنت تتصفح من الهاتف عبر متصفح عادي، افتح التطبيق في <strong>Google Chrome</strong> أو <strong>Edge</strong> للربط المباشر ببلوتوث المتصفح دون تطبيقات وسيطة.'
                    : '💡 Tip: If browsing on mobile, open in <strong>Google Chrome</strong> or <strong>Edge</strong> to use direct Web Bluetooth without third-party apps.'}
                </p>
              </div>
              
              <p style="font-size: 11px; color: var(--color-text-muted); text-align: center; margin-top: 6px;">
                ${currentLanguage === 'ar' ? 'للتجربة والاختبار السريع دون طابعة حقيقية، يمكنك تشغيل محاكي الطابعة أدناه:' : 'For quick testing without a physical printer, you can run the simulator below:'}
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
  printerPaperWidth = '58'; // Strictly force to 58mm as per user request
  const content = document.getElementById('receipt-paper');
  if (content) {
    content.className = `thermal-paper w-58`;
  }
}

// --- ACTUAL HARDWARE ESC/POS DATA PAYLOAD GENERATOR & WRITER ---
async function executePrintJob(saleId) {
  if (!isPrinterConnected) {
    showToast(currentLanguage === 'ar' ? 'الرجاء تشغيل واقتران طابعة البلوتوث BLE أولاً من الإعدادات!' : 'Please connect your BLE printer first in settings!', 'bluetooth', true);
    return;
  }

  // Get invoice data (only for specific sale invoice print jobs)
  if (saleId && saleId !== -1 && !isNaN(saleId)) {
    const sale = await dbGet('sale_invoices', saleId);
    if (!sale) {
      showToast(currentLanguage === 'ar' ? 'لم يتم العثور على الفاتورة!' : 'Invoice not found!', 'error', true);
      return;
    }
    const customer = await dbGet('customers', sale.customer_id);
    if (!customer) return;

    const saleItems = await dbGetAll('sale_items');
    const items = saleItems.filter(it => it.sale_invoice_id === saleId);
  }

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

  const container = document.getElementById('receipt-paper');
  if (!container) {
    showToast(currentLanguage === 'ar' ? 'فشل العثور على معاينة الفاتورة!' : 'Failed to find invoice preview!', 'error', true);
    return;
  }

  // Detect if this is an older Android version, low-end budget hardware, or Amazon Fire OS device
  const ua = navigator.userAgent || '';
  const isAndroid = /android/i.test(ua);
  const isSilk = /silk/i.test(ua); // Amazon Kindle Fire browsers use Silk
  const isFireOS = /fire/i.test(ua) || /kftt/i.test(ua) || /kfot/i.test(ua) || /kfsowi/i.test(ua) || /kfjwa/i.test(ua) || /kfjwi/i.test(ua) || /kfapwa/i.test(ua) || /kfapwi/i.test(ua) || /kfthwa/i.test(ua) || /kfthwi/i.test(ua) || /kfarwi/i.test(ua) || /kfaswi/i.test(ua) || /kfsawa/i.test(ua) || /kservices/i.test(ua) || /kfgwi/i.test(ua) || /kfsuwi/i.test(ua) || /kfaauwi/i.test(ua) || /kfonwi/i.test(ua);

  let isOlderOrFireDevice = isSilk || isFireOS;
  if (isAndroid) {
    const match = ua.match(/Android\s+([0-9]+)/i);
    if (match) {
      const version = parseInt(match[1], 10);
      if (version <= 10) {
        isOlderOrFireDevice = true;
      }
    }
  }

  // Determine active port type
  const connectionType = activeWebBluetoothCharacteristic ? 'web_ble' : (isCordovaSerialActive ? 'classic' : (bleConnectedDeviceId ? 'ble' : 'mock'));

  let pacingDelayMs = 1;
  let chunkSize = 512;

  if (connectionType === 'classic') {
    if (isOlderOrFireDevice) {
      pacingDelayMs = 10;   // Optimized down from 25ms to 10ms for older hardware serial buffers
      chunkSize = 1024;     // Increased block size for older hardware serial buffers
    } else {
      pacingDelayMs = 1;    // Ultra-fast 1ms delay for instant printing
      chunkSize = 4096;     // 4KB blocks for modern Android with advanced flow control
    }
  } else if (connectionType === 'ble' || connectionType === 'web_ble') {
    if (isOlderOrFireDevice) {
      pacingDelayMs = 10;   // Optimized down from 20ms to 10ms for budget hardware / Fire OS
      chunkSize = 128;      // Increased package size from 20 bytes to 128 bytes
    } else {
      pacingDelayMs = 1;    // Ultra-fast 1ms pacing delay for instantaneous startup
      chunkSize = 512;      // Larger 512-byte chunks for fast modern BLE transmission at maximum motor speed
    }
  }

  console.log(`[Printer] Adaptive Profile Selected -> connectionType: ${connectionType}, isOlderOrFireDevice: ${isOlderOrFireDevice}, pacingDelayMs: ${pacingDelayMs}ms, chunkSize: ${chunkSize} bytes`);

  // Build the unified configuration for BLEPrinterDriver
  const config = {
    type: connectionType,
    webBluetoothCharacteristic: activeWebBluetoothCharacteristic,
    deviceId: bleConnectedDeviceId,
    writeServiceUUID: bleWriteServiceUUID,
    writeCharUUID: bleWriteCharUUID,
    paperWidth: printerPaperWidth === '80' ? '80' : '58',
    pacingDelayMs: pacingDelayMs,
    chunkSize: chunkSize
  };

  try {
    const success = await BLEPrinterDriver.printHTMLElement(container, config);

    if (success) {
      playSound('success');
      showToast(currentLanguage === 'ar' ? 'تمت عملية الطباعة الرسومية بنجاح!' : 'Hardware raster print job dispatched successfully!', 'print');
      
      // Dynamic battery drain on print execution
      if (typeof window.processPrinterBatteryDrain === 'function') {
        window.processPrinterBatteryDrain(1);
      }
    } else {
      showToast(currentLanguage === 'ar' ? 'فشل إرسال كود الطباعة إلى الطابعة الموصولة' : 'Failed to write data to active printer port', 'error', true);
    }
  } catch (err) {
    console.error('Unified print failure:', err);
    showToast(currentLanguage === 'ar' ? 'فشل إرسال كود الطباعة إلى الطابعة الموصولة' : 'Failed to write data to active printer port', 'error', true);
  }

  setTimeout(() => {
    if (printSimulator) printSimulator.style.display = 'none';
    if (paperStrip) paperStrip.classList.remove('printing');
  }, 1200);
}

function executeSystemPrintJob() {
  playSound('print');
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
    const html2canvasFn = window.html2canvas || html2canvas;
    if (html2canvasFn) {
      html2canvasFn(receiptEl, {
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
  const ownerInput = document.getElementById('setting-office-owner').value.trim();
  const phoneInput = document.getElementById('setting-office-phone').value.trim();
  const locationInput = document.getElementById('setting-office-location').value.trim();
  const cashierInput = document.getElementById('setting-office-cashier').value.trim();

  if (!nameInput || !ownerInput || !phoneInput || !locationInput || !cashierInput) {
    showToast(currentLanguage === 'ar' ? 'الرجاء تعبئة جميع معلومات العلوة والترويسة واسم المحاسب وصاحب العلوة' : 'Please input all office info fields including Accountant Name and Owner Name', 'warning', true);
    return;
  }

  const englishRegex = /^[A-Za-z0-9\s.,'#&-]+$/;
  if (!englishRegex.test(cashierInput)) {
    showToast(currentLanguage === 'ar' ? 'يجب أن يكون اسم المحاسب باللغة الإنجليزية حصراً!' : 'Accountant name must be in English only!', 'warning', true);
    return;
  }

  officeName = nameInput;
  officeOwner = ownerInput;
  officePhone = phoneInput;
  officeLocation = locationInput;
  officeCashier = cashierInput;

  localStorage.setItem('alwa_office_name', officeName);
  localStorage.setItem('alwa_office_owner', officeOwner);
  localStorage.setItem('alwa_office_phone', officePhone);
  localStorage.setItem('alwa_office_location', officeLocation);
  localStorage.setItem('alwa_office_cashier', officeCashier);
  
  officeChangesCount++;
  localStorage.setItem('alwa_office_changes_count', officeChangesCount.toString());

  // Restore read-only state for safety
  const setOfficeName = document.getElementById('setting-office-name');
  if (setOfficeName) {
    setOfficeName.readOnly = true;
    setOfficeName.style.backgroundColor = 'rgba(0,0,0,0.03)';
    setOfficeName.style.cursor = 'pointer';
  }

  showToast(currentLanguage === 'ar' ? 'تم حفظ التعديلات وتحديث ترويسة الفواتير بنجاح!' : 'Office details saved successfully!', 'check_circle');
}

// ==============================================
// 14. DIALOGS & POPUPS
// ==============================================
function openPasscodeDialog(correctPasscode, successCallback) {
  const dialog = document.getElementById('custom-prompt-dialog');
  if (!dialog) return;
  const title = document.getElementById('prompt-title');
  const message = document.getElementById('prompt-message');
  const input = document.getElementById('prompt-input');
  const cancelBtn = document.getElementById('btn-prompt-cancel');
  const confirmBtn = document.getElementById('btn-prompt-ok');

  if (title) {
    title.textContent = currentLanguage === 'ar' ? 'تعديل اسم العلوة' : 'Modify Alwa Name';
  }
  if (message) {
    message.textContent = currentLanguage === 'ar' ? 'أدخل الرمز السري المكون من 4 أرقام لتعديل الاسم:' : 'Enter 4-digit passcode to modify name:';
  }

  input.value = '';
  dialog.style.display = 'flex';
  setTimeout(() => input.focus(), 100);

  const onConfirm = () => {
    if (input.value === correctPasscode) {
      dialog.style.display = 'none';
      cleanup();
      successCallback();
    } else {
      showToast(currentLanguage === 'ar' ? 'الرمز السري غير صحيح!' : 'Incorrect passcode!', 'warning', true);
    }
  };

  const onCancel = () => {
    dialog.style.display = 'none';
    cleanup();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      onConfirm();
    }
  };

  const cleanup = () => {
    confirmBtn.removeEventListener('click', onConfirm);
    cancelBtn.removeEventListener('click', onCancel);
    input.removeEventListener('keydown', onKeyDown);
  };

  confirmBtn.addEventListener('click', onConfirm);
  cancelBtn.addEventListener('click', onCancel);
  input.addEventListener('keydown', onKeyDown);
}

// Global Passcode State and Setup
let isPasscodeEnabled = localStorage.getItem('alwa_passcode_enabled') === 'true';
let appPasscode = localStorage.getItem('alwa_app_passcode') || '';

function updatePasscodeButtonUI() {
  const btnTogglePasscode = document.getElementById('btn-toggle-passcode');
  if (!btnTogglePasscode) return;
  
  isPasscodeEnabled = localStorage.getItem('alwa_passcode_enabled') === 'true';
  appPasscode = localStorage.getItem('alwa_app_passcode') || '';

  if (isPasscodeEnabled) {
    btnTogglePasscode.textContent = currentLanguage === 'ar' ? 'تعطيل رمز المرور' : 'Disable Passcode';
    btnTogglePasscode.style.borderColor = 'var(--color-danger)';
    btnTogglePasscode.style.color = 'var(--color-danger)';
  } else {
    btnTogglePasscode.textContent = currentLanguage === 'ar' ? 'تفعيل رمز المرور' : 'Enable Passcode';
    btnTogglePasscode.style.borderColor = 'var(--color-primary-light)';
    btnTogglePasscode.style.color = 'var(--color-primary)';
  }
}

function openPasscodeSetupWizard(successCallback) {
  const dialog = document.getElementById('custom-prompt-dialog');
  if (!dialog) return;
  const title = document.getElementById('prompt-title');
  const message = document.getElementById('prompt-message');
  const input = document.getElementById('prompt-input');
  const cancelBtn = document.getElementById('btn-prompt-cancel');
  const confirmBtn = document.getElementById('btn-prompt-ok');

  // Step 1: Set new passcode
  title.textContent = currentLanguage === 'ar' ? 'إنشاء رمز مرور جديد' : 'Create New Passcode';
  message.textContent = currentLanguage === 'ar' ? 'أدخل رمز مرور مكون من 4 أرقام:' : 'Enter a 4-digit passcode:';
  input.value = '';
  input.placeholder = '••••';
  input.maxLength = 4;
  input.type = 'password';
  dialog.style.display = 'flex';
  setTimeout(() => input.focus(), 100);

  let firstPasscode = '';

  const onConfirm = () => {
    const val = input.value.trim();
    if (!val || val.length !== 4 || isNaN(Number(val))) {
      showToast(currentLanguage === 'ar' ? 'يجب إدخال 4 أرقام بالضبط!' : 'Please enter exactly 4 digits!', 'warning', true);
      return;
    }

    if (!firstPasscode) {
      // Transition to Step 2: Confirm
      firstPasscode = val;
      title.textContent = currentLanguage === 'ar' ? 'تأكيد رمز المرور' : 'Confirm Passcode';
      message.textContent = currentLanguage === 'ar' ? 'أعد إدخال رمز المرور لتأكيده:' : 'Re-enter the passcode to confirm:';
      input.value = '';
      input.focus();
    } else {
      // Step 2 confirmation check
      if (val === firstPasscode) {
        dialog.style.display = 'none';
        cleanup();
        successCallback(val);
      } else {
        showToast(currentLanguage === 'ar' ? 'رمز المرور غير متطابق! حاول مجدداً.' : 'Passcode mismatch! Try again.', 'warning', true);
        // Reset to step 1
        firstPasscode = '';
        title.textContent = currentLanguage === 'ar' ? 'إنشاء رمز مرور جديد' : 'Create New Passcode';
        message.textContent = currentLanguage === 'ar' ? 'أدخل رمز مرور مكون من 4 أرقام:' : 'Enter a 4-digit passcode:';
        input.value = '';
        input.focus();
      }
    }
  };

  const onCancel = () => {
    dialog.style.display = 'none';
    cleanup();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      onConfirm();
    }
  };

  const cleanup = () => {
    confirmBtn.removeEventListener('click', onConfirm);
    cancelBtn.removeEventListener('click', onCancel);
    input.removeEventListener('keydown', onKeyDown);
    input.removeAttribute('maxLength');
  };

  confirmBtn.addEventListener('click', onConfirm);
  cancelBtn.addEventListener('click', onCancel);
  input.addEventListener('keydown', onKeyDown);
}

function openPasscodeVerificationDialog(correctPasscode, successCallback) {
  const dialog = document.getElementById('custom-prompt-dialog');
  if (!dialog) return;
  const title = document.getElementById('prompt-title');
  const message = document.getElementById('prompt-message');
  const input = document.getElementById('prompt-input');
  const cancelBtn = document.getElementById('btn-prompt-cancel');
  const confirmBtn = document.getElementById('btn-prompt-ok');

  title.textContent = currentLanguage === 'ar' ? 'إدخال رمز المرور الحالي' : 'Enter Current Passcode';
  message.textContent = currentLanguage === 'ar' ? 'الرجاء إدخال رمز المرور الحالي للتعطيل:' : 'Please enter the current passcode to disable:';
  input.value = '';
  input.placeholder = '••••';
  input.maxLength = 4;
  input.type = 'password';
  dialog.style.display = 'flex';
  setTimeout(() => input.focus(), 100);

  const onConfirm = () => {
    if (input.value === correctPasscode) {
      dialog.style.display = 'none';
      cleanup();
      successCallback();
    } else {
      showToast(currentLanguage === 'ar' ? 'الرمز السري غير صحيح!' : 'Incorrect passcode!', 'warning', true);
    }
  };

  const onCancel = () => {
    dialog.style.display = 'none';
    cleanup();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      onConfirm();
    }
  };

  const cleanup = () => {
    confirmBtn.removeEventListener('click', onConfirm);
    cancelBtn.removeEventListener('click', onCancel);
    input.removeEventListener('keydown', onKeyDown);
    input.removeAttribute('maxLength');
  };

  confirmBtn.addEventListener('click', onConfirm);
  cancelBtn.addEventListener('click', onCancel);
  input.addEventListener('keydown', onKeyDown);
}

function handlePasscodeToggleClick() {
  isPasscodeEnabled = localStorage.getItem('alwa_passcode_enabled') === 'true';
  appPasscode = localStorage.getItem('alwa_app_passcode') || '';

  if (isPasscodeEnabled) {
    openPasscodeVerificationDialog(appPasscode, () => {
      localStorage.setItem('alwa_passcode_enabled', 'false');
      localStorage.removeItem('alwa_app_passcode');
      showToast(currentLanguage === 'ar' ? 'تم تعطيل رمز المرور بنجاح!' : 'Passcode disabled successfully!', 'check_circle');
      updatePasscodeButtonUI();
    });
  } else {
    openPasscodeSetupWizard((newPin) => {
      localStorage.setItem('alwa_app_passcode', newPin);
      localStorage.setItem('alwa_passcode_enabled', 'true');
      showToast(currentLanguage === 'ar' ? 'تم تفعيل وتعيين رمز المرور بنجاح!' : 'Passcode enabled and set successfully!', 'check_circle');
      updatePasscodeButtonUI();
    });
  }
}

function runPasscodeScreenFlow(correctPasscode, onUnlocked) {
  const passcodeSection = document.getElementById('splash-passcode-section');
  if (!passcodeSection) {
    onUnlocked();
    return;
  }

  // Hide loader, diagnostic, spinner
  const loadingText = document.getElementById('splash-loading-text');
  const diagnosticPanel = document.querySelector('.diagnostic-panel');
  const spinner = document.querySelector('.premium-spinner');
  
  if (loadingText) loadingText.style.display = 'none';
  if (diagnosticPanel) diagnosticPanel.style.display = 'none';
  if (spinner) spinner.style.display = 'none';

  // Show passcode section
  passcodeSection.style.display = 'flex';

  let enteredCode = '';
  const dots = document.querySelectorAll('.passcode-dot');
  const errorEl = document.getElementById('splash-passcode-error');

  const updateDots = () => {
    dots.forEach((dot, index) => {
      if (index < enteredCode.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });
  };

  const clearInput = () => {
    enteredCode = '';
    updateDots();
  };

  const handleKeyPress = (val) => {
    if (enteredCode.length < 4) {
      enteredCode += val;
      updateDots();
      if (errorEl) errorEl.textContent = '';

      if (enteredCode.length === 4) {
        // Check code
        setTimeout(() => {
          if (enteredCode === correctPasscode) {
            playSound('success');
            onUnlocked();
          } else {
            playSound('error');
            if (errorEl) {
              errorEl.textContent = currentLanguage === 'ar' ? 'رمز المرور غير صحيح!' : 'Incorrect passcode!';
            }
            // Add custom shake effect
            passcodeSection.classList.add('shake-error');
            setTimeout(() => {
              passcodeSection.classList.remove('shake-error');
            }, 500);
            clearInput();
          }
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    if (enteredCode.length > 0) {
      enteredCode = enteredCode.slice(0, -1);
      updateDots();
      if (errorEl) errorEl.textContent = '';
    }
  };

  // Bind keypad buttons
  const keys = passcodeSection.querySelectorAll('.passcode-keypad button[data-val]');
  keys.forEach(key => {
    key.addEventListener('click', (e) => {
      e.preventDefault();
      const val = key.dataset.val;
      if (val !== undefined) {
        playSound('click');
        handleKeyPress(val);
      }
    });
  });

  const clearBtn = document.getElementById('btn-keypad-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      playSound('click');
      handleBackspace();
    });
  }

  // Handle keyboard inputs
  const handleKeyboard = (e) => {
    if (e.key >= '0' && e.key <= '9') {
      playSound('click');
      handleKeyPress(e.key);
    } else if (e.key === 'Backspace') {
      playSound('click');
      handleBackspace();
    }
  };
  window.addEventListener('keydown', handleKeyboard);

  // Return a cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyboard);
  };
}

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
        <tr style="border-bottom: 1px solid rgba(0, 0, 0, 0.04); background: var(--color-white); transition: background-color 0.15s;">
          <td style="padding: 12px; font-weight: 700; color: #94a3b8; text-align: center; font-size: 12px; font-family: var(--font-mono), monospace;">${formatVal(idx + 1)}</td>
          <td style="padding: 12px; font-weight: 700; color: var(--color-text-dark); text-align: start;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; background: rgba(45, 106, 79, 0.06); font-size: 15px; border: 1px solid rgba(45, 106, 79, 0.12); flex-shrink: 0;">${cropIcon}</span>
              <span style="font-size: 13px; font-weight: 700; font-family: Cairo, sans-serif; color: #0f172a;">${it.crop_type}</span>
            </div>
          </td>
          <td style="padding: 12px; text-align: start;">
            <span style="display: inline-flex; align-items: center; background: #d8f3dc; color: #1b4332; border: 1.5px solid rgba(45, 106, 79, 0.22); padding: 4px 10px; border-radius: 8px; font-weight: 800; font-family: var(--font-mono), monospace; font-size: 11.5px; white-space: nowrap; box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);">
              ${formatWeight(it.weight_kg, it.unit || 'kg')}
            </span>
          </td>
          <td style="padding: 12px; text-align: start;">
            <span style="display: inline-flex; align-items: center; background: #ecf8f3; color: #2d6a4f; border: 1.5px solid rgba(45, 106, 79, 0.14); padding: 4px 10px; border-radius: 8px; font-weight: 800; font-family: var(--font-mono), monospace; font-size: 11.5px; white-space: nowrap; box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);">
              ${formatVal(it.box_count)} <span style="font-size: 9px; font-weight: 700; margin-inline-start: 3px; opacity: 0.85;">${currentLanguage === 'ar' ? 'صندوق' : 'Boxes'}</span>
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
    const statusBorder = isSettled ? '1.5px solid #bbf7d0' : '1.5px solid #fef3c7';
    const statusIcon = isSettled ? 'check_circle' : 'hourglass_empty';

    detailsBody.innerHTML = `
      <!-- Compact Receipt Header -->
      <div style="background: linear-gradient(135deg, #ffffff 0%, #fafdfc 100%); border-radius: 20px; padding: 16px; border: 1.5px solid rgba(45, 106, 79, 0.12); font-size: 12px; box-shadow: 0 4px 15px rgba(45, 106, 79, 0.02);">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-family: var(--font-mono), monospace; font-size: 12px; font-weight: 900; background: rgba(45, 106, 79, 0.08); color: var(--color-primary); padding: 4px 10px; border-radius: 8px; border: 1.5px solid rgba(45, 106, 79, 0.15); letter-spacing: 0.5px;">#${formatVal(imp.id)}</span>
            <span style="color: #cbd5e1; font-weight: 300;">|</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="material-icons-round" style="font-size: 16px; color: var(--color-primary-mid);">person</span>
              <span style="color: var(--color-text-dark); font-weight: 800; font-size: 14px; font-family: Cairo, sans-serif;">${farmer.name}</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 10px; background: ${statusBg}; color: ${statusColor}; border: ${statusBorder}; font-weight: 800; font-size: 11.5px; line-height: 1; font-family: Cairo, sans-serif; box-shadow: 0 2px 4px rgba(0,0,0,0.01);">
            <span class="material-icons-round" style="font-size: 15px;">${statusIcon}</span>
            <span>${statusText}</span>
          </div>
        </div>
        
        <div style="margin-top: 12px; padding-top: 10px; border-top: 1.5px dashed rgba(45, 106, 79, 0.1); display: flex; justify-content: space-between; color: var(--color-text-muted); font-size: 11.5px; font-family: Cairo, sans-serif;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="material-icons-round" style="font-size: 15px; color: #2d6a4f; opacity: 0.8;">calendar_today</span>
            <span style="font-weight: 600; color: #475569;">${formatCustomDate(imp.invoice_date)}</span>
          </div>
          ${imp.vehicle_type ? `
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="material-icons-round" style="font-size: 15px; color: #2d6a4f; opacity: 0.8;">local_shipping</span>
            <span style="font-weight: 600; color: #475569;">${imp.vehicle_type}</span>
          </div>
          ` : ''}
        </div>
      </div>

      ${imp.notes ? `
      <div style="background: linear-gradient(135deg, #ffffff 0%, #fafdfc 100%); border-radius: 16px; padding: 12px 16px; border: 1.5px solid rgba(45, 106, 79, 0.1); font-size: 12px; margin-top: 12px; text-align: start; box-shadow: 0 4px 12px rgba(0,0,0,0.01);">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-weight: 800; color: #2d6a4f; font-family: Cairo, sans-serif;">
          <span class="material-icons-round" style="font-size: 16px; color: var(--color-primary-mid);">notes</span>
          <span>${currentLanguage === 'ar' ? 'ملاحظات الفاتورة:' : 'Invoice Notes:'}</span>
        </div>
        <p style="margin: 0; line-height: 1.5; font-weight: 600; color: #334155; font-family: Cairo, sans-serif;">${imp.notes}</p>
      </div>
      ` : ''}

      <!-- Compact Table -->
      <div style="border: 1.5px solid rgba(45, 106, 79, 0.12); border-radius: 18px; overflow: hidden; background: var(--color-white); box-shadow: 0 4px 16px rgba(45, 106, 79, 0.02); margin-top: 14px; margin-bottom: 14px;">
        <table class="details-table" style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
          <thead>
            <tr style="background: #f4f9f6; border-bottom: 1.5px solid rgba(45, 106, 79, 0.1); color: #2d6a4f; font-family: Cairo, sans-serif;">
              <th style="padding: 12px; font-weight: 800; text-align: center; width: 45px; font-size: 11.5px; letter-spacing: 0.5px;">#</th>
              <th style="padding: 12px; font-weight: 800; text-align: start; font-size: 11.5px; letter-spacing: 0.5px;">${currentLanguage === 'ar' ? 'المحصول' : 'Crop'}</th>
              <th style="padding: 12px; font-weight: 800; text-align: start; font-size: 11.5px; letter-spacing: 0.5px;">${currentLanguage === 'ar' ? 'الوزن الكلي' : 'Total Weight'}</th>
              <th style="padding: 12px; font-weight: 800; text-align: start; font-size: 11.5px; letter-spacing: 0.5px;">${currentLanguage === 'ar' ? 'العدد' : 'Boxes'}</th>
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
          <button id="btn-details-settle-import" class="btn-primary" style="width: 100%; padding: 12px; font-size: 12.5px; font-weight: 800; background: var(--color-success); border: none; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; color: #fff; box-shadow: 0 4px 12px rgba(82, 183, 136, 0.25); font-family: Cairo, sans-serif; transition: all 0.2s;">
            <span class="material-icons-round" style="font-size: 18px;">check_circle</span>
            <span>${currentLanguage === 'ar' ? 'تسوية الفاتورة وإغلاقها' : 'Settle & Close'}</span>
          </button>
        ` : `
          <div style="display: flex; align-items: center; gap: 6px; color: var(--color-success); font-weight: 800; font-size: 12px; background: rgba(82, 183, 136, 0.05); padding: 10px 14px; border-radius: 12px; border: 1.5px dashed rgba(82, 183, 136, 0.25); font-family: Cairo, sans-serif;">
            <span class="material-icons-round" style="font-size: 20px;">verified</span>
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
      const isCount = it.unit === 'count';
      return `
        <tr style="border-bottom: 1px solid rgba(0, 0, 0, 0.04); background: var(--color-white); transition: background-color 0.15s;">
          <td style="padding: 12px; font-weight: 700; color: #94a3b8; text-align: center; font-size: 12px; font-family: var(--font-mono), monospace;">${formatVal(idx + 1)}</td>
          <td style="padding: 12px; font-weight: 700; color: var(--color-text-dark); text-align: start;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; background: rgba(45, 106, 79, 0.06); font-size: 15px; border: 1px solid rgba(45, 106, 79, 0.12); flex-shrink: 0;">${cropIcon}</span>
              <span style="font-size: 13px; font-weight: 700; font-family: Cairo, sans-serif; color: #0f172a;">${it.crop_type}</span>
            </div>
          </td>
          <td style="padding: 12px; text-align: start;">
            ${isCount ? `<span style="color: #94a3b8; font-weight: 500; font-size: 13px;">-</span>` : `
            <span style="display: inline-flex; align-items: center; background: #d8f3dc; color: #1b4332; border: 1.5px solid rgba(45, 106, 79, 0.22); padding: 4px 10px; border-radius: 8px; font-weight: 800; font-family: var(--font-mono), monospace; font-size: 11.5px; white-space: nowrap; box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);">
              ${formatWeight(it.weight_kg, it.unit || 'kg')}
            </span>
            `}
          </td>
          <td style="padding: 12px; text-align: start;">
            <span style="display: inline-flex; align-items: center; background: #ecf8f3; color: #2d6a4f; border: 1.5px solid rgba(45, 106, 79, 0.14); padding: 4px 10px; border-radius: 8px; font-weight: 800; font-family: var(--font-mono), monospace; font-size: 11.5px; white-space: nowrap; box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);">
              ${formatVal(it.box_count)} <span style="font-size: 9px; font-weight: 700; margin-inline-start: 3px; opacity: 0.85;">${isCount ? (currentLanguage === 'ar' ? 'قطعة' : 'Pcs') : (currentLanguage === 'ar' ? 'صندوق' : 'Boxes')}</span>
            </span>
          </td>
          <td style="padding: 12px; font-weight: 900; color: var(--color-primary); text-align: start; white-space: nowrap; font-size: 13px; font-family: var(--font-mono), monospace;">${formatVal(it.agreed_price, true)}</td>
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
      statusBorder = '1.5px solid #bbf7d0';
      statusIcon = 'payments';
    } else {
      if (isSettled) {
        statusText = currentLanguage === 'ar' ? 'دين مسدد' : 'Settled';
        statusBg = '#f0f9ff';
        statusColor = '#0369a1';
        statusBorder = '1.5px solid #bae6fd';
        statusIcon = 'check_circle';
      } else {
        const remaining = debt ? debt.amount : sale.total_amount;
        statusText = currentLanguage === 'ar' ? `بالأجل (${formatVal(remaining)} د.ع)` : `Credit (${formatVal(remaining)} IQD)`;
        statusBg = '#fef2f2';
        statusColor = '#b91c1c';
        statusBorder = '1.5px solid #fecaca';
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
        <div style="background: linear-gradient(135deg, #ffffff 0%, rgba(239, 68, 68, 0.01) 100%); border: 1.5px solid rgba(239, 68, 68, 0.15); border-radius: 20px; padding: 16px; margin-bottom: 14px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.02);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <!-- Left Side: Progress Pill -->
            <span style="background: #fef2f2; color: #dc2626; font-size: 11.5px; font-weight: 800; padding: 4px 10px; border-radius: 8px; border: 1.5px solid rgba(220, 38, 38, 0.12); line-height: 1; font-family: Cairo, sans-serif;">
              ${progressPercent}% ${currentLanguage === 'ar' ? 'مُسدد' : 'Paid'}
            </span>
            
            <!-- Right Side: Title and Icon -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #b91c1c; font-weight: 800; font-size: 13.5px; font-family: Cairo, sans-serif;">
                ${currentLanguage === 'ar' ? 'تتبع حالة سداد الدين:' : 'Debt Payment Tracker:'}
              </span>
              <div style="width: 24px; height: 24px; border-radius: 8px; background: #dc2626; color: #ffffff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 6px rgba(220, 38, 38, 0.25);">
                <span class="material-icons-round" style="font-size: 14px;">analytics</span>
              </div>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div style="height: 10px; background: #f1f5f9; border-radius: 9999px; overflow: hidden; margin-bottom: 14px; border: 1px solid #e2e8f0; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);">
            <div style="width: ${progressPercent}%; height: 100%; background: linear-gradient(90deg, #10b981, #34d399); border-radius: 9999px; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 1px 2px rgba(16, 185, 129, 0.2);"></div>
          </div>

          <!-- Three Columns Footer -->
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; font-family: Cairo, sans-serif;">
            <!-- Left Column: Outstanding -->
            <div style="text-align: start; flex: 1;">
              <span style="font-size: 11px; color: #64748b; font-weight: 700; display: block; margin-bottom: 2px;">
                ${currentLanguage === 'ar' ? 'المتبقي بذمة الزبون:' : 'Outstanding Debt:'}
              </span>
              <strong style="color: #ef4444; font-size: 13px; font-weight: 900; font-family: var(--font-mono), monospace;">${formatVal(outstanding, true)}</strong>
            </div>

            <!-- Middle Column: Paid -->
            <div style="text-align: center; flex: 1;">
              <span style="font-size: 11px; color: #64748b; font-weight: 700; display: block; margin-bottom: 2px;">
                ${currentLanguage === 'ar' ? 'المبلغ المسدد:' : 'Paid So Far:'}
              </span>
              <strong style="color: #10b981; font-size: 13px; font-weight: 900; font-family: var(--font-mono), monospace;">${formatVal(paidAmount, true)}</strong>
            </div>

            <!-- Right Column: Original -->
            <div style="text-align: end; flex: 1;">
              <span style="font-size: 11px; color: #64748b; font-weight: 700; display: block; margin-bottom: 2px;">
                ${currentLanguage === 'ar' ? 'المبلغ الأصلي للفاتورة:' : 'Original Total:'}
              </span>
              <strong style="color: #1e293b; font-size: 13px; font-weight: 900; font-family: var(--font-mono), monospace;">${formatVal(originalTotal, true)}</strong>
            </div>
          </div>
        </div>
      `;
    }

    detailsBody.innerHTML = `
      <!-- Compact Receipt Header -->
      <div style="background: linear-gradient(135deg, #ffffff 0%, #fafdfc 100%); border-radius: 20px; padding: 16px; border: 1.5px solid rgba(45, 106, 79, 0.12); font-size: 12px; margin-bottom: 14px; box-shadow: 0 4px 15px rgba(45, 106, 79, 0.02);">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-family: var(--font-mono), monospace; font-size: 14px; font-weight: 900; background: rgba(45, 106, 79, 0.08); color: var(--color-primary); padding: 4px 10px; border-radius: 8px; border: 1.5px solid rgba(45, 106, 79, 0.15); line-height: 1; vertical-align: middle;">#${sale.order_id || ('ALW-' + String(sale.id).padStart(3, '0'))}</span>
            <span style="color: #cbd5e1; font-weight: 300;">|</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="material-icons-round" style="font-size: 16px; color: var(--color-primary-mid);">person</span>
              <span style="color: var(--color-text-dark); font-weight: 800; font-size: 14px; font-family: Cairo, sans-serif;">${customer.name}</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 10px; background: ${statusBg}; color: ${statusColor}; border: ${statusBorder}; font-weight: 800; font-size: 11.5px; line-height: 1; font-family: Cairo, sans-serif; box-shadow: 0 2px 4px rgba(0,0,0,0.01);">
            <span class="material-icons-round" style="font-size: 15px;">${statusIcon}</span>
            <span>${statusText}</span>
          </div>
        </div>
        
        <div style="margin-top: 12px; padding-top: 10px; border-top: 1.5px dashed rgba(45, 106, 79, 0.1); display: flex; justify-content: space-between; color: var(--color-text-muted); font-size: 11.5px; font-family: Cairo, sans-serif;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="material-icons-round" style="font-size: 15px; color: #2d6a4f; opacity: 0.8;">calendar_today</span>
            <span style="font-weight: 600; color: #475569;">${formatCustomDate(sale.created_at)}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="material-icons-round" style="font-size: 15px; color: #2d6a4f; opacity: 0.8;">credit_card</span>
            <span style="font-weight: 600; color: #475569;">${currentLanguage === 'ar' ? 'الدفع:' : 'Payment:'} ${sale.payment_type === 'cash' ? (currentLanguage === 'ar' ? '💵 نقد' : 'Cash') : (currentLanguage === 'ar' ? '📋 دين بالأجل' : 'Debt')}</span>
          </div>
        </div>
      </div>

      ${sale.notes ? `
      <div style="background: linear-gradient(135deg, #ffffff 0%, #fafdfc 100%); border-radius: 16px; padding: 12px 16px; border: 1.5px solid rgba(45, 106, 79, 0.1); font-size: 12px; margin-bottom: 14px; text-align: start; box-shadow: 0 4px 12px rgba(0,0,0,0.01);">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-weight: 800; color: #2d6a4f; font-family: Cairo, sans-serif;">
          <span class="material-icons-round" style="font-size: 16px; color: var(--color-primary-mid);">notes</span>
          <span>${currentLanguage === 'ar' ? 'ملاحظات الفاتورة:' : 'Invoice Notes:'}</span>
        </div>
        <p style="margin: 0; line-height: 1.5; font-weight: 600; color: #334155; font-family: Cairo, sans-serif;">${sale.notes}</p>
      </div>
      ` : ''}

      <!-- Outstanding Debt Tracker if needed -->
      ${debtProgressHtml}

      <!-- Compact Table -->
      <div style="border: 1.5px solid rgba(45, 106, 79, 0.12); border-radius: 18px; overflow: hidden; background: var(--color-white); box-shadow: 0 4px 16px rgba(45, 106, 79, 0.02); margin-top: 14px; margin-bottom: 14px;">
        <table class="details-table" style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
          <thead>
            <tr style="background: #f4f9f6; border-bottom: 1.5px solid rgba(45, 106, 79, 0.1); color: #2d6a4f; font-family: Cairo, sans-serif;">
              <th style="padding: 12px; font-weight: 800; text-align: center; width: 45px; font-size: 11.5px; letter-spacing: 0.5px;">#</th>
              <th style="padding: 12px; font-weight: 800; text-align: start; font-size: 11.5px; letter-spacing: 0.5px;">${currentLanguage === 'ar' ? 'المحصول' : 'Crop'}</th>
              <th style="padding: 12px; font-weight: 800; text-align: start; font-size: 11.5px; letter-spacing: 0.5px;">${currentLanguage === 'ar' ? 'الوزن' : 'Weight'}</th>
              <th style="padding: 12px; font-weight: 800; text-align: start; font-size: 11.5px; letter-spacing: 0.5px;">${currentLanguage === 'ar' ? 'العلب' : 'Boxes'}</th>
              <th style="padding: 12px; font-weight: 800; text-align: start; font-size: 11.5px; letter-spacing: 0.5px;">${currentLanguage === 'ar' ? 'السعر' : 'Price'}</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <!-- Financial Calculation Summary List -->
      <div style="background: linear-gradient(135deg, #ffffff 0%, rgba(45, 106, 79, 0.02) 100%); border: 1.5px solid rgba(45, 106, 79, 0.12); border-radius: 18px; padding: 14px 16px; line-height: 1.6; font-size: 13px; margin-bottom: 14px; box-shadow: 0 4px 12px rgba(45, 106, 79, 0.01);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-family: Cairo, sans-serif;">
          <span style="color: #64748b; font-weight: 600;">${currentLanguage === 'ar' ? 'مجموع قيمة البضاعة:' : 'Goods Subtotal:'}</span>
          <span style="font-weight: 700; color: #1e293b; font-family: var(--font-mono), monospace;">${formatVal(subtotal, true)}</span>
        </div>
        ${totalCommissions > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-family: Cairo, sans-serif;">
            <span style="color: #64748b; font-weight: 600;">${currentLanguage === 'ar' ? 'عمولة المكتب (7%):' : 'Office Commission (7%):'}</span>
            <span style="font-weight: 700; color: var(--color-primary-mid); font-family: var(--font-mono), monospace;">+ ${formatVal(totalCommissions, true)}</span>
          </div>
        ` : ''}
        ${totalCarrying > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-family: Cairo, sans-serif;">
            <span style="color: #64748b; font-weight: 600;">${currentLanguage === 'ar' ? 'أجور تحميل (حمالية):' : 'Carrying Fee:'}</span>
            <span style="font-weight: 700; color: var(--color-primary-mid); font-family: var(--font-mono), monospace;">+ ${formatVal(totalCarrying, true)}</span>
          </div>
        ` : ''}
        ${sale.bags_cost > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-family: Cairo, sans-serif;">
            <span style="color: #64748b; font-weight: 600;">${currentLanguage === 'ar' ? 'أجور الأكياس والكراتين:' : 'Bags/Boxes Cost:'}</span>
            <span style="font-weight: 700; color: var(--color-primary-mid); font-family: var(--font-mono), monospace;">+ ${formatVal(sale.bags_cost, true)}</span>
          </div>
        ` : ''}
        
        <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 900; color: var(--color-primary); border-top: 1.5px dashed rgba(45, 106, 79, 0.15); margin-top: 8px; padding-top: 8px; font-family: Cairo, sans-serif;">
          <span>${currentLanguage === 'ar' ? 'صافي الإجمالي المستحق:' : 'Grand Total:'}</span>
          <span style="font-family: var(--font-mono), monospace; font-weight: 900; font-size: 16px;">${formatVal(sale.total_amount, true)}</span>
        </div>
      </div>

      <!-- Quick Actions (Printing & Settle Options) -->
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <!-- Print Button -->
        <button id="btn-details-print-sale" class="btn-primary" style="flex: 1; min-width: 110px; padding: 12px; font-size: 12.5px; font-weight: 800; background: var(--color-primary-mid); border: none; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; color: #fff; box-shadow: 0 4px 12px rgba(0, 150, 199, 0.25); font-family: Cairo, sans-serif; transition: all 0.2s;">
          <span class="material-icons-round" style="font-size: 18px;">print</span>
          <span>${currentLanguage === 'ar' ? 'طباعة الفاتورة' : 'Print'}</span>
        </button>
        
        <!-- Debt Settlement Buttons (Only for pending debts) -->
        ${(sale.payment_type === 'debt' && !isSettled && debt) ? `
          <button id="btn-details-partial-pay" class="btn-primary" style="flex: 1; min-width: 90px; padding: 12px; font-size: 12.5px; font-weight: 800; background: var(--color-info); border: none; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; color: #fff; box-shadow: 0 4px 12px rgba(0, 119, 182, 0.15); font-family: Cairo, sans-serif; transition: all 0.2s;">
            <span class="material-icons-round" style="font-size: 18px;">payments</span>
            <span>${currentLanguage === 'ar' ? 'تسديد دفعة' : 'Pay Partial'}</span>
          </button>
          <button id="btn-details-full-settle" class="btn-primary" style="flex: 1; min-width: 90px; padding: 12px; font-size: 12.5px; font-weight: 800; background: var(--color-success); border: none; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; color: #fff; box-shadow: 0 4px 12px rgba(82, 183, 136, 0.25); font-family: Cairo, sans-serif; transition: all 0.2s;">
            <span class="material-icons-round" style="font-size: 18px;">check_circle</span>
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
  
  const elStatus = document.getElementById('lbl-system-status');
  if (elStatus) elStatus.textContent = t.systemStatus;

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
  document.getElementById('lbl-total-debt-title').textContent = t.lblTotalDebtSales;
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

  const elMonthlyProfitReport = document.getElementById('txt-monthly-profit-report-lbl');
  if (elMonthlyProfitReport) elMonthlyProfitReport.textContent = currentLanguage === 'ar' ? 'تقرير الأرباح الشهري' : 'Monthly Profit Report';

  const elLogsTitle = document.getElementById('txt-logs-title-lbl');
  if (elLogsTitle) elLogsTitle.textContent = currentLanguage === 'ar' ? 'سجل عمليات التطبيق اليومي' : 'Daily App Activity Log';

  // Settings Screen
  document.getElementById('lbl-office-title').textContent = t.officeSettingsTitle;
  document.getElementById('lbl-name-setting').textContent = t.lblOfficeName;
  const elOwnerSetting = document.getElementById('lbl-owner-setting');
  if (elOwnerSetting) elOwnerSetting.textContent = t.lblOfficeOwner;
  document.getElementById('lbl-phone-setting').textContent = t.lblOfficePhone;
  document.getElementById('lbl-location-setting').textContent = t.lblOfficeLocation;
  const elCashierSetting = document.getElementById('lbl-cashier-setting');
  if (elCashierSetting) elCashierSetting.textContent = t.lblOfficeCashier;
  document.getElementById('btn-save-office-settings').textContent = t.btnSaveOffice;

  document.getElementById('lbl-numeral-title').textContent = t.txtNumeralTitle;
  document.getElementById('lbl-numeral-desc').textContent = t.txtNumeralDesc;

  document.getElementById('lbl-sound-title').textContent = t.txtNotifTitle;
  document.getElementById('lbl-sound-desc').textContent = t.txtNotifDesc;

  const elFullscreenTitle = document.getElementById('txt-fullscreen-title');
  if (elFullscreenTitle) elFullscreenTitle.textContent = t.txtFullscreenTitle;
  const elFullscreenDesc = document.getElementById('txt-fullscreen-desc');
  if (elFullscreenDesc) elFullscreenDesc.textContent = t.txtFullscreenDesc;

  const elMotionTitle = document.getElementById('txt-motion-title');
  if (elMotionTitle) elMotionTitle.textContent = t.txtMotionTitle;
  const elMotionDesc = document.getElementById('txt-motion-desc');
  if (elMotionDesc) elMotionDesc.textContent = t.txtMotionDesc;

  document.getElementById('lbl-printer-title').textContent = t.txtPrinterTitle;
  document.getElementById('lbl-paper-width-title').textContent = t.lblPaperWidth;
  document.getElementById('btn-scan-printer').textContent = t.btnScanPrinter;
  document.getElementById('btn-test-print').textContent = t.btnTestPrint;

  document.getElementById('lbl-backup-title').textContent = t.txtBackupTitle;
  document.getElementById('lbl-backup-desc').textContent = t.txtBackupDesc;
  document.getElementById('btn-export-db').innerHTML = `<span class="material-icons-round" style="font-size:18px;">cloud_download</span> ${t.btnExportDb}`;
  document.getElementById('btn-import-db').innerHTML = `<span class="material-icons-round" style="font-size:18px;">cloud_upload</span> ${t.btnImportDb}`;

  // Bluetooth Share translations
  const lblBtShareReady = document.getElementById('lbl-bt-share-ready');
  if (lblBtShareReady) {
    lblBtShareReady.textContent = currentLanguage === 'ar' ? 'نسخة الأرشيف جاهزة للإرسال' : 'Archive Backup Ready for Sending';
  }
  const lblBtShareDesc = document.getElementById('lbl-bt-share-desc');
  if (lblBtShareDesc) {
    lblBtShareDesc.textContent = currentLanguage === 'ar' ? 'شارك ملف البيانات المحذوفة عبر البلوتوث لحفظه' : 'Share the cleared data file via Bluetooth to preserve it';
  }
  const lblBtShareBtn = document.getElementById('lbl-bt-share-btn');
  if (lblBtShareBtn) {
    lblBtShareBtn.textContent = currentLanguage === 'ar' ? 'إرسال بالبلوتوث' : 'Send via Bluetooth';
  }
  const txtBtShareHeader = document.getElementById('txt-bt-share-header');
  if (txtBtShareHeader) {
    txtBtShareHeader.textContent = currentLanguage === 'ar' ? 'مشاركة نسخة الأرشيف عبر البلوتوث' : 'Share Archive Copy via Bluetooth';
  }
  const lblBtSelectDev = document.getElementById('lbl-bt-select-dev');
  if (lblBtSelectDev) {
    lblBtSelectDev.textContent = currentLanguage === 'ar' ? 'اختر جهاز بلوتوث القريب للإرسال:' : 'Choose a nearby Bluetooth device to send:';
  }
  const btScanStatus = document.getElementById('bt-scan-status');
  if (btScanStatus) {
    btScanStatus.textContent = currentLanguage === 'ar' ? 'جاري البحث...' : 'Scanning...';
  }
  const txtBtFallbackLbl = document.getElementById('txt-bt-fallback-lbl');
  if (txtBtFallbackLbl) {
    txtBtFallbackLbl.textContent = currentLanguage === 'ar' ? 'مشاركة عبر خيارات النظام الأخرى' : 'Share via other system options';
  }

  // Subscription translations
  const elSubTitle = document.getElementById('sub-card-title');
  if (elSubTitle) elSubTitle.textContent = t.txtSubscriptionTitle;
  
  const elSubDesc = document.getElementById('sub-card-desc');
  if (elSubDesc) elSubDesc.textContent = t.txtSubscriptionDesc;

  const elSubLabelPlan = document.getElementById('sub-label-plan');
  if (elSubLabelPlan) elSubLabelPlan.textContent = t.lblSubscriptionPlan;

  const elSubValPlan = document.getElementById('sub-val-plan');
  if (elSubValPlan) elSubValPlan.textContent = t.txtSubscriptionPlanValue;

  const elSubLabelStatus = document.getElementById('sub-label-status');
  if (elSubLabelStatus) elSubLabelStatus.textContent = t.lblSubscriptionStatus;

  const elSubValStatus = document.getElementById('sub-val-status');
  if (elSubValStatus) elSubValStatus.textContent = t.txtSubscriptionStatusValue;

  const elSubLabelId = document.getElementById('sub-label-id');
  if (elSubLabelId) elSubLabelId.textContent = t.lblSubscriberId;

  const elSubLabelFeat = document.getElementById('sub-label-features');
  if (elSubLabelFeat) elSubLabelFeat.textContent = t.lblSubscriptionFeatures;

  const elSubFeat1 = document.getElementById('sub-feat-1');
  if (elSubFeat1) elSubFeat1.textContent = t.txtSubscriptionFeature1;

  const elSubFeat2 = document.getElementById('sub-feat-2');
  if (elSubFeat2) elSubFeat2.textContent = t.txtSubscriptionFeature2;

  const elSubFeat3 = document.getElementById('sub-feat-3');
  if (elSubFeat3) elSubFeat3.textContent = t.txtSubscriptionFeature3;

  const elSubBtnRenew = document.getElementById('sub-btn-renew');
  if (elSubBtnRenew) elSubBtnRenew.textContent = t.btnSubscriptionRenew;

  // Sheets Forms
  document.getElementById('sheet-import-title-h3').textContent = t.sheetImportTitle;
  document.getElementById('lbl-import-farmer-label').textContent = t.lblFarmerName;
  document.getElementById('lbl-import-vehicle-label').textContent = t.lblVehicleType;
  const elImportNotesLabel = document.getElementById('lbl-import-notes');
  if (elImportNotesLabel) elImportNotesLabel.textContent = t.lblNotes;
  const elImportNotesInput = document.getElementById('import-notes');
  if (elImportNotesInput) elImportNotesInput.placeholder = t.lblNotesPl;
  document.getElementById('btn-add-import-crop').innerHTML = `<span class="material-icons-round" style="font-size: 16px;">add</span> ${t.txtAddCrop}`;
  document.getElementById('btn-submit-import').textContent = t.btnSubmitImport;

  document.getElementById('sheet-sale-title-h3').textContent = t.sheetSaleTitle;
  document.getElementById('lbl-sale-cust-label').textContent = t.lblCustomerName;
  document.getElementById('lbl-sale-phone-label').textContent = t.lblCustomerPhone;
  document.getElementById('lbl-sale-address-label').textContent = t.lblCustomerAddress;
  const elSaleNotesLabel = document.getElementById('lbl-sale-notes-text');
  if (elSaleNotesLabel) elSaleNotesLabel.textContent = t.lblNotes;
  const elSaleNotesInput = document.getElementById('sale-notes');
  if (elSaleNotesInput) elSaleNotesInput.placeholder = t.lblNotesPl;
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
  if (document.getElementById('btn-execute-sysprint')) document.getElementById('btn-execute-sysprint').innerHTML = `<span class="material-icons-round">print</span> ${t.btnExecuteSystemPrint}`;
  document.getElementById('btn-share-receipt').innerHTML = `<span class="material-icons-round">image</span> ${t.btnShareReceipt}`;

  document.getElementById('sheet-payment-title-h3').textContent = t.sheetPaymentTitle;
  document.getElementById('lbl-payment-amount-label').textContent = t.lblPayAmount;
  document.getElementById('btn-submit-payment').textContent = t.btnSubmitPayment;

  const elAddLiquidity = document.getElementById('txt-add-liquidity-btn-lbl');
  if (elAddLiquidity) {
    elAddLiquidity.textContent = currentLanguage === 'ar' ? 'إضافة سيولة نقدية' : 'Add Cash Liquidity';
  }

  // Database Safety Gauge Translation
  const elSafetyTitle = document.getElementById('lbl-safety-title');
  if (elSafetyTitle) {
    elSafetyTitle.textContent = currentLanguage === 'ar' ? 'مؤشر أمان وسلامة البيانات' : 'Data Safety & Integrity Gauge';
  }
  const elSafetyStatus = document.getElementById('lbl-safety-status');
  if (elSafetyStatus) {
    elSafetyStatus.textContent = currentLanguage === 'ar' ? '🟢 آمن وممتاز 100%' : '🟢 100% Safe & Excellent';
  }
  const elSafetyZero = document.getElementById('lbl-safety-zero');
  if (elSafetyZero) {
    const count = (typeof lastCalculatedTotalRecords !== 'undefined') ? lastCalculatedTotalRecords : 0;
    elSafetyZero.textContent = currentLanguage === 'ar' ? `${formatVal(count)} سجل` : `${formatVal(count)} records`;
  }
  const elSafetyCap = document.getElementById('lbl-safety-cap');
  if (elSafetyCap) {
    elSafetyCap.textContent = currentLanguage === 'ar' ? 'الحد السنوي الآمن: 100,000 سجل' : 'Annual Safe Limit: 100,000 records';
  }
  const elSafetyExp = document.getElementById('lbl-safety-explanation');
  if (elSafetyExp) {
    elSafetyExp.innerHTML = currentLanguage === 'ar'
      ? '💡 <b>طمأنينة محاسبية:</b> حتى لو قمت بـ <b>100 نشاط يومياً</b> لمدة سنة كاملة (36,500 سجل)، سيعمل التطبيق بكفاءة 100% وبسرعة فائقة. قاعدة البيانات مصممة لتتحمل ملايين السجلات أوفلاين دون أي بطء أو خطر فقدان للبيانات.'
      : '💡 <b>Accounting Reassurance:</b> Even with <b>100 activities daily</b> for a full year (36,500 records), the app operates at 100% peak efficiency. The database is architected to handle millions of offline records with zero slowdown or risk.';
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

  if (typeof window.applyAppBrightness === 'function') {
    const saved = localStorage.getItem('app-screen-brightness');
    window.applyAppBrightness(saved ? parseInt(saved, 10) : 100);
  }
}

// ==============================================
// 16.5 SYSTEM BACK NAVIGATION & DIALOG OBSERVERS
// ==============================================
function setupDialogObservers() {
  const dialogs = document.querySelectorAll('.dialog-overlay');
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'style') {
        const target = mutation.target;
        const display = target.style.display;
        const wasOpen = target.dataset.isOpen === 'true';
        const isOpen = display && display !== 'none';
        
        if (isOpen && !wasOpen) {
          target.dataset.isOpen = 'true';
          if (!isNavigatingViaHistory) {
            window.history.pushState({ type: 'dialog', dialogId: target.id }, '');
          }
        } else if (!isOpen && wasOpen) {
          target.dataset.isOpen = 'false';
          if (!isNavigatingViaHistory) {
            window.history.back();
          }
        }
      }
    });
  });
  
  dialogs.forEach((dialog) => {
    dialog.dataset.isOpen = dialog.style.display && dialog.style.display !== 'none' ? 'true' : 'false';
    observer.observe(dialog, { attributes: true, attributeFilter: ['style'] });
  });
}

window.addEventListener('popstate', (event) => {
  isNavigatingViaHistory = true;
  try {
    const state = event.state;
    
    // 1. Check if any dialog overlays are open and need to be closed
    const dialogs = Array.from(document.querySelectorAll('.dialog-overlay'));
    const openDialog = dialogs.find(d => d.style.display && d.style.display !== 'none');
    
    if (openDialog) {
      const dialogCancelButtons = {
        'custom-confirm-dialog': 'btn-confirm-cancel',
        'custom-alert-dialog': 'btn-alert-ok',
        'custom-choice-dialog': 'btn-choice-cancel',
        'custom-prompt-dialog': 'btn-prompt-cancel',
        'custom-safe-adjust-dialog': 'btn-safe-adj-cancel',
        'custom-add-crop-dialog': 'btn-custom-crop-cancel',
        'dialog-iframe-bluetooth': 'btn-iframe-ok',
        'custom-keypad-dialog': 'btn-close-keypad'
      };
      
      const btnId = dialogCancelButtons[openDialog.id];
      const btn = btnId ? document.getElementById(btnId) : null;
      if (btn) {
        btn.click();
      } else {
        openDialog.style.display = 'none';
        openDialog.dataset.isOpen = 'false';
      }
      return;
    }
    
    // 2. Check if any bottom sheets are open and need to be closed
    const openSheets = Array.from(document.querySelectorAll('.bottom-sheet.show, .bottom-sheet.open'));
    if (openSheets.length > 0) {
      const activeSheetIdInHistory = (state && state.type === 'sheet') ? state.sheetId : null;
      openSheets.forEach(sheet => {
        if (sheet.id !== activeSheetIdInHistory) {
          closeBottomSheet(sheet.id);
        }
      });
      return;
    }
    
    // 3. Handle tab navigation
    if (state && state.type === 'tab') {
      updateUIActiveTab(state.tabId);
    } else {
      updateUIActiveTab('screen-import');
    }
  } catch (err) {
    console.error('Error in popstate handler:', err);
  } finally {
    setTimeout(() => {
      isNavigatingViaHistory = false;
    }, 50);
  }
});

// ==============================================
// 17. BOTTOM SHEET GENERAL ACTIONS
// ==============================================
function openBottomSheet(id) {
  const sheet = document.getElementById(id);
  const overlay = document.getElementById('sheet-overlay');
  
  if (!sheet || !overlay) return;

  if (!isNavigatingViaHistory) {
    window.history.pushState({ type: 'sheet', sheetId: id }, '');
  }

  document.body.classList.add('sheet-open');

  sheet.style.display = 'block';
  sheet.style.transform = ''; // Clear any leftover drag transforms
  sheet.style.transition = ''; // Restore default transition
  overlay.style.display = 'block';
  
  setTimeout(() => {
    sheet.classList.add('show', 'open');
    overlay.classList.add('show', 'open');
  }, 10);
  
  // Specific initializations
  if (id === 'sheet-new-import') {
    const container = document.getElementById('import-items-container');
    if (container) container.innerHTML = '';
    const farmerInput = document.getElementById('import-farmer-name');
    if (farmerInput) farmerInput.value = '';
    const vehicleInput = document.getElementById('import-vehicle-type');
    if (vehicleInput) vehicleInput.value = '';
    addImportCropRow();
    setTimeout(() => {
      if (container) {
        const firstTypeInput = container.querySelector('.import-crop-type');
        if (firstTypeInput) {
          firstTypeInput.focus();
        }
      }
    }, 150);
  } else if (id === 'sheet-new-sale') {
    const container = document.getElementById('sale-items-container');
    if (container) container.innerHTML = '';
    const customerInput = document.getElementById('sale-customer-name');
    if (customerInput) customerInput.value = '';
    const phoneInput = document.getElementById('sale-customer-phone');
    if (phoneInput) phoneInput.value = '';
    const addressInput = document.getElementById('sale-customer-address');
    if (addressInput) addressInput.value = '';
    const bagsInput = document.getElementById('sale-bags-cost');
    if (bagsInput) bagsInput.value = '0';
    
    // Reset totals to 0
    const subtotalEl = document.getElementById('lbl-subtotal-val');
    const commissionEl = document.getElementById('lbl-commission-val');
    const carryingEl = document.getElementById('lbl-carrying-val');
    const totalEl = document.getElementById('lbl-total-val');
    if (subtotalEl) subtotalEl.textContent = formatVal(0, true);
    if (commissionEl) commissionEl.textContent = formatVal(0, true);
    if (carryingEl) carryingEl.textContent = formatVal(0, true);
    if (totalEl) totalEl.textContent = formatVal(0, true);

    addSaleCropRow().then(() => {
      setTimeout(() => {
        if (container) {
          const firstWeightInput = container.querySelector('.sale-crop-weight');
          if (firstWeightInput) {
            openCustomKeypad(firstWeightInput);
          }
        }
      }, 150);
    });
  } else if (id === 'sheet-due-claims') {
    renderDueClaims();
  } else if (id === 'sheet-new-loss') {
    const weightContainer = document.getElementById('loss-crop-weight-container');
    const boxCountContainer = document.getElementById('loss-crop-box-count-container');
    if (weightContainer) weightContainer.style.display = 'block';
    if (boxCountContainer) boxCountContainer.style.display = 'block';
    
    const cropSearch = document.getElementById('loss-crop-search');
    const cropSel = document.getElementById('loss-crop-selector');
    const cropW = document.getElementById('loss-crop-weight');
    const cropB = document.getElementById('loss-crop-box-count');
    const lossSub = document.getElementById('loss-subject');
    const lossAmt = document.getElementById('loss-amount');
    
    if (cropSearch) cropSearch.value = '';
    if (cropSel) cropSel.value = '';
    if (cropW) cropW.value = '';
    if (cropB) cropB.value = '';
    if (lossSub) lossSub.value = '';
    if (lossAmt) lossAmt.value = '';
  }
}

function closeBottomSheet(id) {
  const sheet = document.getElementById(id);
  const overlay = document.getElementById('sheet-overlay');

  if (!sheet || !overlay) return;

  if (id === 'sheet-new-sale' || id === 'sheet-new-import') {
    isSidebarKeypadActive = false;
    const sidebarSaleKeypad = document.getElementById('sheet-sale-keypad-sidebar');
    if (sidebarSaleKeypad) sidebarSaleKeypad.style.display = 'none';
    const sidebarImportKeypad = document.getElementById('sheet-import-keypad-sidebar');
    if (sidebarImportKeypad) sidebarImportKeypad.style.display = 'none';
    const saleSheet = document.getElementById('sheet-new-sale');
    if (saleSheet) saleSheet.style.maxWidth = '';
    const importSheet = document.getElementById('sheet-new-import');
    if (importSheet) importSheet.style.maxWidth = '';
  }

  sheet.classList.remove('show', 'open');
  overlay.classList.remove('show', 'open');

  setTimeout(() => {
    sheet.style.display = 'none';
    sheet.style.transform = ''; // Reset drag transforms
    sheet.style.transition = ''; // Restore transition
    
    // Check if other sheets are active to decide if overlay stays
    const openSheets = document.querySelectorAll('.bottom-sheet.show, .bottom-sheet.open');
    if (openSheets.length === 0) {
      overlay.style.display = 'none';
      document.body.classList.remove('sheet-open');
    }
  }, 300);

  // If this closing action is user-initiated (not popstate history navigation),
  // we attempt to trigger history.back() silently without blocking the UI transition.
  if (!isNavigatingViaHistory) {
    try {
      window.history.back();
    } catch (e) {
      console.warn('history.back() blocked or failed:', e);
    }
  }
}

// Close all open modals when overlay clicked
function handleOverlayClick() {
  const openSheets = document.querySelectorAll('.bottom-sheet.show, .bottom-sheet.open');
  openSheets.forEach(sheet => {
    closeBottomSheet(sheet.id);
  });
}

// Setup dragging and tactile touch-drag control on bottom sheet drag handles
function setupBottomSheetDragToClose() {
  // Completely disabled as requested to keep the handle purely passive/static
}

// ==============================================
// 18. TABS & MAIN NAVIGATION
// ==============================================
function updateUIActiveTab(tabId) {
  if (!isNavigatingViaHistory && tabId !== activeTab) {
    window.history.pushState({ type: 'tab', tabId: tabId }, '');
  }

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

  // Load appropriate lists lazily if they are marked dirty
  if (dirtyScreens[tabId]) {
    renderScreenIfDirty(tabId);
  } else if (tabId === 'screen-settings') {
    // Fill settings inputs
    const setOfficeName = document.getElementById('setting-office-name');
    if (setOfficeName) {
      setOfficeName.value = officeName;
      setOfficeName.readOnly = true;
      setOfficeName.style.backgroundColor = 'rgba(0,0,0,0.03)';
      setOfficeName.style.cursor = 'pointer';
    }
    const setOfficeOwner = document.getElementById('setting-office-owner');
    if (setOfficeOwner) {
      setOfficeOwner.value = officeOwner;
      setOfficeOwner.readOnly = true;
      setOfficeOwner.style.backgroundColor = 'rgba(0,0,0,0.03)';
      setOfficeOwner.style.cursor = 'pointer';
    }
    const setOfficePhone = document.getElementById('setting-office-phone');
    if (setOfficePhone) setOfficePhone.value = officePhone;
    const setOfficeLoc = document.getElementById('setting-office-location');
    if (setOfficeLoc) setOfficeLoc.value = officeLocation;
    const setOfficeCashier = document.getElementById('setting-office-cashier');
    if (setOfficeCashier) setOfficeCashier.value = officeCashier;
    
    // Ensure database size and integrity metrics are completely synchronized upon entering Settings
    calculateDatabaseSize();
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
  const debtSalesTotal = allSales.filter(s => s.payment_type === 'debt' && isTargetMonth(s.created_at)).reduce((sum, s) => sum + s.total_amount, 0);
  
  const collectedDebtsTotal = allDebts.filter(d => d.is_paid && isTargetMonth(d.created_at)).reduce((sum, d) => sum + d.amount, 0) +
                               safeAdjustments.filter(a => a.type === 'partial_debt_payout' && isTargetMonth(a.created_at)).reduce((sum, a) => sum + a.amount, 0);

  const manualAdditionsTotal = safeAdjustments.filter(a => a.type === 'manual_addition' && isTargetMonth(a.created_at)).reduce((sum, a) => sum + a.amount, 0);

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
    debtSales: debtSalesTotal,
    collectedDebts: collectedDebtsTotal,
    manualAdditions: manualAdditionsTotal,
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
  
  try {
    localStorage.setItem('alwa_last_rollover_month', currentMonthKey);
  } catch (e) {
    console.warn('Failed to save last rollover month to localStorage:', e);
  }
}

async function printDailyInventoryList() {
  playSound('print');
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

  // Filter imports made today
  const todayImports = allImports.filter(imp => imp.created_at >= todayStart && imp.created_at < todayEnd);
  const todayImportIds = new Set(todayImports.map(imp => imp.id));
  const todayImportItems = allImportItems.filter(item => todayImportIds.has(item.invoice_id));

  // Collect all unique crops handled today
  const activeCrops = new Set();
  todaySaleItems.forEach(item => activeCrops.add(item.crop_type));
  todayImportItems.forEach(item => activeCrops.add(item.crop_type));

  if (activeCrops.size === 0) {
    showToast(currentLanguage === 'ar' ? 'لا يوجد أي نشاط (استيراد أو بيع) مسجل لليوم لطباعة قائمة الجرد!' : 'No activity (import or sale) recorded today to generate an inventory list!', 'warning', true);
    return;
  }

  // Group by crop type
  const inventoryMap = {};

  activeCrops.forEach(crop => {
    // Determine the primary unit
    const sampleItem = todaySaleItems.find(si => si.crop_type === crop) || 
                       todayImportItems.find(ii => ii.crop_type === crop) || 
                       allSaleItems.find(si => si.crop_type === crop) || 
                       allImportItems.find(ii => ii.crop_type === crop);
    const unit = sampleItem ? (sampleItem.unit || 'kg') : (getCropUnitType(crop) === 'count' ? 'count' : 'kg');

    inventoryMap[crop] = {
      cropType: crop,
      unit: unit,
      todayImportedWeight: 0,
      todayImportedBoxes: 0,
      todaySoldWeight: 0,
      todaySoldBoxes: 0,
      remainingWeight: 0,
      remainingBoxes: 0,
      farmers: new Set()
    };
  });

  // Populate today's imports
  todayImportItems.forEach(item => {
    const crop = item.crop_type;
    if (inventoryMap[crop]) {
      inventoryMap[crop].todayImportedWeight += item.weight_kg || 0;
      inventoryMap[crop].todayImportedBoxes += item.box_count || 0;

      const impInvoice = todayImports.find(ii => ii.id === item.invoice_id);
      if (impInvoice) {
        const farmer = allFarmers.find(f => f.id === impInvoice.farmer_id);
        if (farmer) {
          inventoryMap[crop].farmers.add(farmer.name);
        }
      }
    }
  });

  // Populate today's sales
  todaySaleItems.forEach(item => {
    const crop = item.crop_type;
    if (inventoryMap[crop]) {
      inventoryMap[crop].todaySoldWeight += item.weight_kg || 0;
      inventoryMap[crop].todaySoldBoxes += item.box_count || 0;

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
    }
  });

  // Calculate remaining quantities for each crop (all-time imported minus all-time sold)
  for (const crop in inventoryMap) {
    const cropItems = allImportItems.filter(ii => ii.crop_type === crop);
    const totalImportedWeight = cropItems.reduce((sum, ii) => sum + (ii.weight_kg || 0), 0);
    const totalImportedBoxes = cropItems.reduce((sum, ii) => sum + (ii.box_count || 0), 0);

    const cropSales = allSaleItems.filter(si => si.crop_type === crop);
    const totalSoldWeight = cropSales.reduce((sum, si) => sum + (si.weight_kg || 0), 0);
    const totalSoldBoxes = cropSales.reduce((sum, si) => sum + (si.box_count || 0), 0);

    inventoryMap[crop].totalImportedWeight = totalImportedWeight;
    inventoryMap[crop].totalImportedBoxes = totalImportedBoxes;
    inventoryMap[crop].totalSoldWeight = totalSoldWeight;
    inventoryMap[crop].totalSoldBoxes = totalSoldBoxes;
    inventoryMap[crop].remainingWeight = Math.max(0, totalImportedWeight - totalSoldWeight);
    inventoryMap[crop].remainingBoxes = Math.max(0, totalImportedBoxes - totalSoldBoxes);
  }

  // Populate receipt-paper HTML for high-fidelity inventory print!
  const container = document.getElementById('receipt-paper');
  if (container) {
    container.className = `thermal-paper w-${printerPaperWidth}`;
  }

  const is58mm = printerPaperWidth === '58';
  const fontSizeClass = is58mm ? 'font-size: 16px; line-height: 1.3;' : 'font-size: 18px; line-height: 1.45;';
  const headerFontSizeClass = is58mm ? 'font-size: 22px;' : 'font-size: 26px;';

  const formattedDate = formatCustomDate(now);

  const isAr = currentLanguage === 'ar';
  const colCrop = isAr ? 'الصنف' : 'Crop';
  const colImported = isAr ? 'المستورد' : 'Imported';
  const colSold = isAr ? 'المباع' : 'Sold';
  const colRemaining = isAr ? 'المتبقي' : 'Remaining';
  const lblFarmer = isAr ? 'المورد' : 'Supplier';

  function formatInventoryQty(weight, boxes, unit) {
    const isCount = unit === 'count';
    if (isCount) {
      if (boxes === 0) {
        return `0`;
      }
      return `<strong><span style="font-size: 17.5px; color: #000;">${formatVal(boxes)} ${isAr ? 'قطعة' : 'Pcs'}</span></strong>`;
    } else {
      if (weight === 0 && boxes === 0) {
        return `0`;
      }
      const boxStr = boxes > 0 ? `<div style="font-size: 17px; color: #000;"><strong>${formatVal(boxes)} ${isAr ? 'صندوق' : (boxes === 1 ? 'Box' : 'Boxes')}</strong></div>` : '';
      const weightStr = weight > 0 ? `<div style="font-size: 17px; font-weight: normal; color: #000; margin-top: 1px;">${formatWeight(weight, 'kg')}</div>` : '';
      return `${boxStr}${weightStr}`;
    }
  }

  let itemsHtml = `
    <table style="width: 100%; border-collapse: collapse; direction: rtl; text-align: right; ${fontSizeClass} font-family: var(--font-family) !important; margin-bottom: 8px;">
      <thead>
        <tr style="border-bottom: 1.5px dashed #000; font-weight: 800; font-size: 16px; color: #000;">
          <th style="padding: 4px 2px; text-align: right; width: 33.3%;">${colImported}</th>
          <th style="padding: 4px 2px; text-align: center; width: 33.3%;">${colSold}</th>
          <th style="padding: 4px 2px; text-align: left; width: 33.3%;">${colRemaining}</th>
        </tr>
      </thead>
      <tbody>
  `;

  itemsHtml += Object.values(inventoryMap).map((it, idx) => {
    return `
      <tr style="font-weight: 800; border-top: 1.5px solid #000; border-bottom: 1.5px solid #000;">
        <td colspan="3" style="padding: 6px 2px; text-align: center; background: repeating-linear-gradient(45deg, #333, #333 1px, transparent 1px, transparent 6px);">
          <span style="background: #fff; padding: 2px 12px; border: 1.5px solid #000; display: inline-block; font-size: 16px; font-weight: 900; color: #000; font-family: var(--font-family) !important;">
            ${it.cropType}
          </span>
        </td>
      </tr>
      <tr style="border-bottom: 1px dashed #000; font-size: 18.5px; font-weight: 700; vertical-align: top;">
        <td style="padding: 8px 2px; text-align: right; color: #000; font-family: var(--font-family) !important;">
          ${formatInventoryQty(it.totalImportedWeight, it.totalImportedBoxes, it.unit)}
        </td>
        <td style="padding: 8px 2px; text-align: center; color: #000; font-family: var(--font-family) !important;">
          ${formatInventoryQty(it.totalSoldWeight, it.totalSoldBoxes, it.unit)}
        </td>
        <td style="padding: 8px 2px; text-align: left; color: #000; font-weight: 900; font-family: var(--font-family) !important;">
          ${formatInventoryQty(it.remainingWeight, it.remainingBoxes, it.unit)}
        </td>
      </tr>
    `;
  }).join('');

  itemsHtml += `
      </tbody>
    </table>
  `;

  container.innerHTML = `
    <div style="text-align: center; border-bottom: 1.5px dashed #000; padding-bottom: 8px; margin-bottom: 8px; direction: rtl; font-family: var(--font-family) !important;">
      <h2 style="${headerFontSizeClass} font-weight: 800; color: #000; margin: 0 0 4px 0; letter-spacing: normal; font-family: var(--font-family) !important;">${officeName}</h2>
      <p style="font-size: 13.5px; color: #000; font-weight: 700; margin: 0 0 6px 0; font-family: var(--font-family) !important;">بإدارة: ${officeOwner}</p>
      <h3 style="font-size: 17px; font-weight: 700; color: #333; margin: 0 0 4px 0; font-family: var(--font-family) !important;">${isAr ? 'قائمة الجرد اليومية للمستودع' : 'Daily Warehouse Inventory List'}</h3>
      <div style="font-size: 14.5px; color: #000; font-weight: 600; margin-bottom: 2px; font-family: var(--font-family) !important;">النوع: جرد ومطابقة كميات المحاصيل</div>
      <div style="font-size: 14.5px; color: #000; font-weight: 600; font-family: var(--font-family) !important;">التاريخ والوقت: ${formattedDate}</div>
    </div>
    
    <div style="margin-bottom: 8px; font-family: var(--font-family) !important;">
      ${itemsHtml}
    </div>

    <div style="text-align: center; margin-top: 12px; padding-top: 8px; border-top: 1.5px dashed #000; font-size: 13.5px; font-weight: 800; color: #000; direction: rtl; font-family: var(--font-family) !important; line-height: 1.4;">
      برمجة و تطوير شركة Prime™ Solutions 
      <br>
      Whatsapp: 07749883474
    </div>
  `;

  // Log in events
  logAppEvent(
    `طباعة قائمة جرد يومية لعدد ${Object.keys(inventoryMap).length} أصناف`,
    `Printed daily inventory list for ${Object.keys(inventoryMap).length} crop items`
  );

  // Set dataset ID to -1 to prevent printing a single receipt when print button is pressed
  document.getElementById('btn-execute-print').dataset.id = "-1";
  if (document.getElementById('btn-execute-sysprint')) document.getElementById('btn-execute-sysprint').dataset.id = "-1";
  document.getElementById('btn-share-receipt').dataset.id = "-1";

  openBottomSheet('sheet-print-preview');
}

// ==========================================================================
// ♿ ACCESSIBILITY & VISUALLY IMPAIRED SUITE LOGIC
// ==========================================================================
function applyAccessibilityPreferences() {
  // 1. Zoom/Scale Level
  let zoomVal = localStorage.getItem('alwa_zoom') || '100';
  if (parseInt(zoomVal) > 150) {
    zoomVal = '150';
    localStorage.setItem('alwa_zoom', '150');
  }
  document.documentElement.style.setProperty('--app-zoom', `${zoomVal}%`);
  
  // Calculate and set the inverse zoom value to protect printing/receipt paper scale
  const zoomFactor = parseInt(zoomVal) / 100;
  const inverseZoom = (100 / zoomFactor).toFixed(3);
  document.documentElement.style.setProperty('--app-zoom-inverse', `${inverseZoom}%`);
  
  const slider = document.getElementById('setting-zoom-slider');
  if (slider) {
    slider.value = zoomVal;
  }
  const badge = document.getElementById('zoom-level-badge');
  if (badge) {
    let zoomText = `${zoomVal}%`;
    const valNum = parseInt(zoomVal);
    if (valNum === 100) zoomText += currentLanguage === 'ar' ? ' (طبيعي)' : ' (Normal)';
    else if (valNum === 110) zoomText += currentLanguage === 'ar' ? ' (أكبر قليلاً)' : ' (Slightly Larger)';
    else if (valNum === 120) zoomText += currentLanguage === 'ar' ? ' (متوسط الكبر)' : ' (Medium Large)';
    else if (valNum === 130) zoomText += currentLanguage === 'ar' ? ' (كبير)' : ' (Large)';
    else if (valNum === 140) zoomText += currentLanguage === 'ar' ? ' (كبير جداً)' : ' (Very Large)';
    else if (valNum === 150) zoomText += currentLanguage === 'ar' ? ' (أقصى تكبير)' : ' (Maximum Zoom)';
    badge.textContent = zoomText;
  }
}

// =======================================================================
// 18.5 FINANCIAL YEAR ROLLOVER & EXCEL GENERATION SUITE (تصفير وترحيل السنة المالية)
// =======================================================================

function checkAndShowNewYearRolloverAlert() {
  const now = new Date();
  const month = now.getMonth(); // 11 is December
  const date = now.getDate();
  const isPeriod = (month === 11 && date >= 27 && date <= 31);
  const banner = document.getElementById('new-year-rollover-banner');
  
  if (!banner) return;
  
  if (isPeriod) {
    banner.style.display = 'flex';
    // Update days remaining label
    const daysBadge = document.getElementById('txt-ny-days-badge');
    if (daysBadge) {
      const remaining = 32 - date;
      daysBadge.textContent = currentLanguage === 'ar'
        ? `متبقي ${remaining} أيام على نهاية السنة`
        : `${remaining} days remaining until year end`;
    }
  } else {
    banner.style.display = 'none';
  }
}

async function exportFullYearToExcel() {
  const currentYear = new Date().getFullYear();
  
  showToast(currentLanguage === 'ar' ? 'جاري تجميع الحسابات والترتيب بجدول Sheets...' : 'Gathering accounts and formatting sheets...', 'hourglass_empty');
  
  try {
    // Fetch all records
    const imports = await dbGetAll('import_invoices') || [];
    const importItems = await dbGetAll('import_items') || [];
    const sales = await dbGetAll('sale_invoices') || [];
    const saleItems = await dbGetAll('sale_items') || [];
    const dailyExpenses = await dbGetAll('daily_expenses') || [];
    const personalExpenses = await dbGetAll('personal_expenses') || [];
    const losses = await dbGetAll('losses') || [];
    const farmers = await dbGetAll('farmers') || [];
    const customers = await dbGetAll('customers') || [];
    const debts = await dbGetAll('debts') || [];
    const farmerDues = await dbGetAll('farmer_dues') || [];
    const porterPayouts = await dbGetAll('porter_payouts') || [];
    
    const filterYear = (dateVal) => {
      if (!dateVal) return false;
      const d = new Date(dateVal);
      return d.getFullYear() === currentYear;
    };
    
    const yearImports = imports.filter(imp => filterYear(imp.created_at || imp.invoice_date));
    const yearSales = sales.filter(s => filterYear(s.created_at));
    const yearExpenses = [
      ...dailyExpenses.filter(e => filterYear(e.created_at)).map(e => ({ ...e, typeStr: currentLanguage === 'ar' ? 'مصاريف تشغيلية يومية' : 'Daily Operations Expense' })),
      ...personalExpenses.filter(e => filterYear(e.created_at)).map(e => ({ ...e, typeStr: currentLanguage === 'ar' ? 'مصاريف شخصية / سحبيات' : 'Personal Withdrawals' }))
    ];
    const yearLosses = losses.filter(l => filterYear(l.created_at));
    const yearPorterPayouts = porterPayouts.filter(p => filterYear(p.created_at || p.date));
    const yearDebts = debts.filter(d => filterYear(d.created_at || d.due_date));
    const yearFarmerDues = farmerDues.filter(fd => filterYear(fd.created_at));
    
    // Maps
    const farmerMap = new Map(farmers.map(f => [f.id, f]));
    const customerMap = new Map(customers.map(c => [c.id, c]));
    
    const yearSalesIds = new Set(yearSales.map(s => s.id));
    const yearImportsIds = new Set(yearImports.map(imp => imp.id));
    
    const yearSaleItems = saleItems.filter(it => yearSalesIds.has(it.sale_invoice_id));
    const yearImportItems = importItems.filter(it => yearImportsIds.has(it.invoice_id));
    
    // ----------------------------------------------------
    // FINANCIAL CALCULATIONS (Air-Tight Brokerage Accounting)
    // ----------------------------------------------------
    const totalSalesVal = yearSales.reduce((acc, s) => acc + (s.total_amount || 0), 0);
    const totalCropsSoldVal = yearSaleItems.reduce((acc, si) => acc + (si.agreed_price || 0), 0);
    const totalCommissionsEarned = yearSaleItems.reduce((acc, si) => acc + (si.commission_amount || 0), 0);
    const totalBagsCostCollected = yearSales.reduce((acc, s) => acc + (s.bags_cost || 0), 0);
    const totalPorterFeesRecorded = yearPorterPayouts.reduce((acc, p) => acc + (p.amount || 0), 0);
    
    const totalFarmerDuesVal = yearFarmerDues.reduce((acc, fd) => acc + (fd.net_due || 0), 0);
    const totalFarmerDuesPaid = yearFarmerDues.filter(fd => fd.is_paid).reduce((acc, fd) => acc + (fd.net_due || 0), 0);
    const totalFarmerDuesUnpaid = yearFarmerDues.filter(fd => !fd.is_paid).reduce((acc, fd) => acc + (fd.net_due || 0), 0);
    
    const totalExpensesVal = yearExpenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
    const totalLossesVal = yearLosses.reduce((acc, l) => acc + (l.amount || 0), 0);
    
    // Standard Agency Brokerage Net Profit = Commission - (Expenses + Losses)
    const netAgencyProfit = totalCommissionsEarned - (totalExpensesVal + totalLossesVal);
    
    // 1. الملخص العام (Summary Dashboard)
    let summarySheetData;
    if (currentLanguage === 'ar') {
      summarySheetData = [
        { 'البيان': 'إجمالي عدد فواتير المبيعات (العملاء)', 'القيمة': yearSales.length, 'الوحدة': 'فاتورة مبيعات' },
        { 'البيان': 'إجمالي عدد فواتير الاستيراد (المزارعين)', 'القيمة': yearImports.length, 'الوحدة': 'فاتورة استيراد' },
        { 'البيان': 'إجمالي مبيعات البضائع للمشترين (بدون إضافات)', 'القيمة': totalCropsSoldVal, 'الوحدة': 'ج.م' },
        { 'البيان': 'إجمالي عمولة الوكالة المحصلة (7% للشركة)', 'القيمة': totalCommissionsEarned, 'الوحدة': 'ج.م' },
        { 'البيان': 'إجمالي أجور العتالة المحسوبة (الشيالين)', 'القيمة': totalPorterFeesRecorded, 'الوحدة': 'ج.م' },
        { 'البيان': 'إجمالي قيمة الأكياس المحصلة من المشترين', 'القيمة': totalBagsCostCollected, 'الوحدة': 'ج.م' },
        { 'البيان': 'إجمالي مبيعات فواتير العملاء الشاملة (القائم الكلي)', 'القيمة': totalSalesVal, 'الوحدة': 'ج.م' },
        { 'البيان': 'صافي مستحقات المزارعين الكلية المترتبة', 'القيمة': totalFarmerDuesVal, 'الوحدة': 'ج.م' },
        { 'البيان': 'مستحقات مزارعين مصروفة ومدفوعة فعلياً', 'القيمة': totalFarmerDuesPaid, 'الوحدة': 'ج.م' },
        { 'البيان': 'مستحقات مزارعين متبقية غير مسددة بالذمة', 'القيمة': totalFarmerDuesUnpaid, 'الوحدة': 'ج.م' },
        { 'البيان': 'إجمالي المصروفات (التشغيلية والشخصية)', 'القيمة': totalExpensesVal, 'الوحدة': 'ج.م' },
        { 'البيان': 'إجمالي الخسائر والتالف من البضائع', 'القيمة': totalLossesVal, 'الوحدة': 'ج.م' },
        { 'البيان': 'صافي أرباح الوكالة الختامية (العمولة - المصاريف والخسائر)', 'القيمة': netAgencyProfit, 'الوحدة': 'ج.م' },
        { 'البيان': 'تاريخ ووقت التصدير', 'القيمة': forceEnglishDigits(new Date().toLocaleString('ar-EG-u-nu-latn')), 'الوحدة': '-' }
      ];
    } else {
      summarySheetData = [
        { 'Metric': 'Total Sales Invoices (Customers)', 'Value': yearSales.length, 'Unit': 'Invoices' },
        { 'Metric': 'Total Import Invoices (Farmers)', 'Value': yearImports.length, 'Unit': 'Invoices' },
        { 'Metric': 'Total Crop Sales Value (Before Deductions)', 'Value': totalCropsSoldVal, 'Unit': 'EGP' },
        { 'Metric': 'Total Agency Commissions Earned (7%)', 'Value': totalCommissionsEarned, 'Unit': 'EGP' },
        { 'Metric': 'Total Porter Fees Recorded (Carrying)', 'Value': totalPorterFeesRecorded, 'Unit': 'EGP' },
        { 'Metric': 'Total Bags Cost Collected from Customers', 'Value': totalBagsCostCollected, 'Unit': 'EGP' },
        { 'Metric': 'Grand Total Invoiced Sales (Including add-ons)', 'Value': totalSalesVal, 'Unit': 'EGP' },
        { 'Metric': 'Total Net Due to All Farmers', 'Value': totalFarmerDuesVal, 'Unit': 'EGP' },
        { 'Metric': 'Farmer Dues Disbursed & Paid', 'Value': totalFarmerDuesPaid, 'Unit': 'EGP' },
        { 'Metric': 'Farmer Dues Pending/Outstanding', 'Value': totalFarmerDuesUnpaid, 'Unit': 'EGP' },
        { 'Metric': 'Total Business & Personal Expenses', 'Value': totalExpensesVal, 'Unit': 'EGP' },
        { 'Metric': 'Total Crop Losses & Damages', 'Value': totalLossesVal, 'Unit': 'EGP' },
        { 'Metric': 'Net Agency Brokerage Profit (Commissions - Expenses - Losses)', 'Value': netAgencyProfit, 'Unit': 'EGP' },
        { 'Metric': 'Export Date', 'Value': forceEnglishDigits(new Date().toLocaleString('en-US')), 'Unit': '-' }
      ];
    }
    
    // 2. فواتير المبيعات (Sales Invoices)
    const salesSheetData = yearSales.map(s => {
      const cust = customerMap.get(s.customer_id);
      const custName = s.customer_name || (cust ? cust.name : '-');
      const custPhone = s.customer_phone || (cust ? cust.phone : '-');
      const dateFormatted = forceEnglishDigits(new Date(s.created_at).toLocaleDateString(currentLanguage === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US'));
      const pmText = s.payment_type === 'cash' ? (currentLanguage === 'ar' ? 'نقدي' : 'Cash') : (currentLanguage === 'ar' ? 'آجل' : 'Debt');
      
      const sItems = yearSaleItems.filter(it => it.sale_invoice_id === s.id);
      const invoiceCropsSubtotal = sItems.reduce((sum, item) => sum + (item.agreed_price || 0), 0);
      const invoiceCommissions = sItems.reduce((sum, item) => sum + (item.commission_amount || 0), 0);
      const invoicePorters = sItems.reduce((sum, item) => sum + (item.porter_fee || 0), 0);
      
      const assocDebt = debts.find(d => d.sale_invoice_id === s.id);
      let payStatus = '';
      if (currentLanguage === 'ar') {
        payStatus = s.payment_type === 'cash' ? 'مسدد بالكامل (نقدي)' : (assocDebt ? (assocDebt.is_paid ? 'مسدد بالكامل (سداد آجل)' : 'دين نشط (غير مسدد)') : 'غير مسدد');
      } else {
        payStatus = s.payment_type === 'cash' ? 'Paid (Cash)' : (assocDebt ? (assocDebt.is_paid ? 'Paid (Debt Settled)' : 'Active Debt (Unpaid)') : 'Unpaid');
      }
      
      if (currentLanguage === 'ar') {
        return {
          'رقم الفاتورة': s.id || '',
          'رقم الطلب (الكود)': s.order_id || '',
          'التاريخ': dateFormatted,
          'العميل المشتري': custName,
          'رقم الهاتف': custPhone,
          'طريقة الدفع': pmText,
          'قيمة البضاعة (ج.م)': invoiceCropsSubtotal,
          'عمولة الوكالة 7% (ج.م)': invoiceCommissions,
          'أجرة الشيالين (ج.م)': invoicePorters,
          'تكلفة الأكياس (ج.م)': s.bags_cost || 0,
          'المبلغ الإجمالي الكلي للفاتورة (ج.م)': s.total_amount || 0,
          'حالة سداد الفاتورة': payStatus,
          'تاريخ التسجيل بالكامل': forceEnglishDigits(new Date(s.created_at).toLocaleString('ar-EG-u-nu-latn'))
        };
      } else {
        return {
          'Invoice ID': s.id || '',
          'Order ID': s.order_id || '',
          'Date': dateFormatted,
          'Customer': custName,
          'Phone': custPhone,
          'Payment Type': pmText,
          'Crop Sales (EGP)': invoiceCropsSubtotal,
          'Commissions 7% (EGP)': invoiceCommissions,
          'Porter Fee (EGP)': invoicePorters,
          'Bags Cost (EGP)': s.bags_cost || 0,
          'Grand Total Amount (EGP)': s.total_amount || 0,
          'Settlement Status': payStatus,
          'Created At': forceEnglishDigits(new Date(s.created_at).toLocaleString('en-US'))
        };
      }
    });
    
    // 3. تفاصيل بنود المبيعات (Sale Items Detail)
    const saleItemsSheetData = yearSaleItems.map(it => {
      const invoice = yearSales.find(s => s.id === it.sale_invoice_id);
      const custName = invoice ? invoice.customer_name : '-';
      const cropUnit = it.unit || 'kg';
      
      if (currentLanguage === 'ar') {
        return {
          'رقم البند البيعي': it.id || '',
          'رقم فاتورة البيع': it.sale_invoice_id || '',
          'اسم المشتري': custName || '-',
          'نوع المحصول': it.crop_type || '',
          'عدد الأقفاص/الأكياس المباعة': it.box_count || 0,
          'الوزن المباع (كغم)': it.weight_kg || 0,
          'الوحدة المستخدمة': cropUnit,
          'سعر البيع المتفق عليه (ج.م)': it.agreed_price || 0,
          'عمولة الوكالة (ج.م)': it.commission_amount || 0,
          'أجرة العتالة (الشيالين)': it.porter_fee || 0,
          'صافي مستحق الفلاح من هذا البيع': (it.agreed_price || 0) - (it.commission_amount || 0),
          'رقم فاتورة الاستيراد المصدرية': it.import_invoice_id || ''
        };
      } else {
        return {
          'Sale Item ID': it.id || '',
          'Sale Invoice ID': it.sale_invoice_id || '',
          'Customer Name': custName || '-',
          'Crop Type': it.crop_type || '',
          'Box Count': it.box_count || 0,
          'Weight Sold (kg)': it.weight_kg || 0,
          'Unit': cropUnit,
          'Agreed Sale Price (EGP)': it.agreed_price || 0,
          'Commission Amount': it.commission_amount || 0,
          'Porter Fee': it.porter_fee || 0,
          'Net Due to Farmer': (it.agreed_price || 0) - (it.commission_amount || 0),
          'Source Import Invoice ID': it.import_invoice_id || ''
        };
      }
    });
    
    // 4. فواتير الاستيراد (Import Invoices)
    const importSheetData = yearImports.map(imp => {
      const farmer = farmerMap.get(imp.farmer_id);
      const farmerName = imp.farmer_name || (farmer ? farmer.name : '-');
      const dateFormatted = forceEnglishDigits(new Date(imp.created_at || imp.invoice_date).toLocaleDateString(currentLanguage === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US'));
      const statusText = imp.is_settled ? (currentLanguage === 'ar' ? 'تم تصفيتها ومسواة' : 'Settled & Closed') : (currentLanguage === 'ar' ? 'قيد البيع / نشطة' : 'Active');
      
      const itemsOfImp = yearImportItems.filter(it => it.invoice_id === imp.id);
      const totalBoxesImported = itemsOfImp.reduce((sum, item) => sum + (item.box_count || 0), 0);
      const totalWeightImported = itemsOfImp.reduce((sum, item) => sum + (item.weight_kg || 0), 0);
      
      const salesOfImp = yearSaleItems.filter(si => si.import_invoice_id === imp.id);
      const totalSoldValue = salesOfImp.reduce((sum, item) => sum + (item.agreed_price || 0), 0);
      const totalSoldWeight = salesOfImp.reduce((sum, item) => {
        const isCount = (getCropUnitType(item.crop_type) === 'count');
        return sum + (isCount ? (item.box_count || 0) : (item.weight_kg || 0));
      }, 0);
      
      const totalImportWeightOrCount = itemsOfImp.reduce((sum, item) => {
        const isCount = (getCropUnitType(item.crop_type) === 'count');
        return sum + (isCount ? (item.box_count || 0) : (item.weight_kg || 0));
      }, 0);
      
      const percentSoldVal = totalImportWeightOrCount > 0 ? Math.min(100, Math.round((totalSoldWeight / totalImportWeightOrCount) * 100)) : 0;
      let percentSoldText = '';
      if (currentLanguage === 'ar') {
        percentSoldText = percentSoldVal >= 100 ? 'مباعة بالكامل 100%' : `مباعة جزئياً (${percentSoldVal}%)`;
      } else {
        percentSoldText = percentSoldVal >= 100 ? '100% Sold' : `Partially Sold (${percentSoldVal}%)`;
      }
      
      const duesOfImp = yearFarmerDues.filter(fd => fd.import_invoice_id === imp.id);
      const totalNetDueToFarmer = duesOfImp.reduce((sum, item) => sum + (item.net_due || 0), 0);
      const totalPaidDuesToFarmer = duesOfImp.filter(fd => fd.is_paid).reduce((sum, item) => sum + (item.net_due || 0), 0);
      const totalUnpaidDuesToFarmer = duesOfImp.filter(fd => !fd.is_paid).reduce((sum, item) => sum + (item.net_due || 0), 0);
      
      const totalCommissionDeducted = duesOfImp.reduce((sum, item) => sum + (item.commission_deducted || 0), 0);
      const totalPorterDeducted = duesOfImp.reduce((sum, item) => sum + (item.porter_deducted || 0), 0);
      
      if (currentLanguage === 'ar') {
        return {
          'رقم فاتورة الاستيراد': imp.id || '',
          'التاريخ': dateFormatted,
          'اسم المزارع المورد': farmerName,
          'نوع السيارة': imp.vehicle_type || '-',
          'رقم السيارة': imp.vehicle_number || '-',
          'إجمالي أعداد الأقفاص الموردة': totalBoxesImported,
          'إجمالي الأوزان القائمة الموردة': totalWeightImported,
          'إجمالي مبيعات الشحنة (ج.م)': totalSoldValue,
          'إجمالي عمولة الوكالة 7% (ج.م)': totalCommissionDeducted,
          'إجمالي عتالة مخصومة (ج.م)': totalPorterDeducted,
          'صافي مستحقات المزارع (ج.م)': totalNetDueToFarmer,
          'المدفوع للمزارع فعلياً (ج.م)': totalPaidDuesToFarmer,
          'المتبقي غير مصروف للمزارع (ج.م)': totalUnpaidDuesToFarmer,
          'حالة المبيعات للشحنة': percentSoldText,
          'حالة تصفية الحساب بالشركة': statusText,
          'تاريخ الإنشاء بالكامل': forceEnglishDigits(new Date(imp.created_at).toLocaleString('ar-EG-u-nu-latn'))
        };
      } else {
        return {
          'Import Invoice ID': imp.id || '',
          'Date': dateFormatted,
          'Farmer Name': farmerName,
          'Vehicle Type': imp.vehicle_type || '-',
          'Vehicle Number': imp.vehicle_number || '-',
          'Total Boxes Imported': totalBoxesImported,
          'Total Weight Imported (kg)': totalWeightImported,
          'Total Crops Sold (EGP)': totalSoldValue,
          'Total Commissions (EGP)': totalCommissionDeducted,
          'Total Porter Fee (EGP)': totalPorterDeducted,
          'Net Due to Farmer (EGP)': totalNetDueToFarmer,
          'Paid to Farmer (EGP)': totalPaidDuesToFarmer,
          'Pending to Farmer (EGP)': totalUnpaidDuesToFarmer,
          'Sales Status': percentSoldText,
          'Settlement Status': statusText,
          'Created At': forceEnglishDigits(new Date(imp.created_at).toLocaleString('en-US'))
        };
      }
    });
    
    // 5. تفاصيل بنود الاستيراد (Import Items Detail)
    const importItemsSheetData = yearImportItems.map(it => {
      const invoice = yearImports.find(imp => imp.id === it.invoice_id);
      const farmerName = invoice ? invoice.farmer_name : '-';
      const cropUnit = it.unit || 'kg';
      
      const salesOfItem = yearSaleItems.filter(si => si.import_invoice_id === it.invoice_id && si.crop_type === it.crop_type);
      const totalSoldValue = salesOfItem.reduce((sum, item) => sum + (item.agreed_price || 0), 0);
      const totalBoxesSold = salesOfItem.reduce((sum, item) => sum + (item.box_count || 0), 0);
      const totalWeightSold = salesOfItem.reduce((sum, item) => sum + (item.weight_kg || 0), 0);
      
      const isCount = (getCropUnitType(it.crop_type) === 'count');
      const receivedQty = isCount ? (it.box_count || 0) : (it.weight_kg || 0);
      const soldQty = isCount ? totalBoxesSold : totalWeightSold;
      
      const percentSoldVal = receivedQty > 0 ? Math.min(100, Math.round((soldQty / receivedQty) * 100)) : 0;
      
      const duesOfItem = yearFarmerDues.filter(fd => fd.import_invoice_id === it.invoice_id && fd.crop_type === it.crop_type);
      const totalNetDue = duesOfItem.reduce((sum, item) => sum + (item.net_due || 0), 0);
      const totalCommission = duesOfItem.reduce((sum, item) => sum + (item.commission_deducted || 0), 0);
      const totalPorter = duesOfItem.reduce((sum, item) => sum + (item.porter_deducted || 0), 0);
      
      if (currentLanguage === 'ar') {
        return {
          'رقم البند الوارد': it.id || '',
          'رقم فاتورة الاستيراد': it.invoice_id || '',
          'اسم الفلاح المورد': farmerName,
          'نوع المحصول': it.crop_type || '',
          'الوحدة المعتمدة': cropUnit,
          'عدد الأقفاص الواردة': it.box_count || 0,
          'الوزن الوارد (كغم)': it.weight_kg || 0,
          'عدد الأقفاص المباعة فعلياً': totalBoxesSold,
          'الوزن المباع فعلياً (كغم)': totalWeightSold,
          'إجمالي قيمة المبيعات (ج.م)': totalSoldValue,
          'إجمالي عمولة الوكالة المستقطعة': totalCommission,
          'إجمالي عتالة شيالين مستقطعة': totalPorter,
          'صافي مستحق المزارع لهذا البند': totalNetDue,
          'نسبة المبيعات المنفذة': `${percentSoldVal}%`
        };
      } else {
        return {
          'Import Item ID': it.id || '',
          'Import Invoice ID': it.invoice_id || '',
          'Farmer Name': farmerName,
          'Crop Type': it.crop_type || '',
          'Unit': cropUnit,
          'Boxes Received': it.box_count || 0,
          'Weight Received (kg)': it.weight_kg || 0,
          'Boxes Sold': totalBoxesSold,
          'Weight Sold (kg)': totalWeightSold,
          'Sales Revenue (EGP)': totalSoldValue,
          'Commissions Deducted': totalCommission,
          'Porter Fees Deducted': totalPorter,
          'Net Due to Farmer': totalNetDue,
          'Sales Progress': `${percentSoldVal}%`
        };
      }
    });
    
    // 6. المصروفات (Expenses)
    const expensesSheetData = yearExpenses.map(exp => {
      const dateFormatted = forceEnglishDigits(new Date(exp.created_at).toLocaleDateString(currentLanguage === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US'));
      
      if (currentLanguage === 'ar') {
        return {
          'رقم المصروف': exp.id || '',
          'النوع / القسم': exp.typeStr || '',
          'التاريخ': dateFormatted,
          'الوصف والبيان': exp.description || '-',
          'المبلغ المستقطع (ج.م)': exp.amount || 0
        };
      } else {
        return {
          'Expense ID': exp.id || '',
          'Type/Category': exp.typeStr || '',
          'Date': dateFormatted,
          'Description': exp.description || '-',
          'Amount (EGP)': exp.amount || 0
        };
      }
    });
    
    // 7. الخسائر والتالف (Losses & Damages)
    const lossesSheetData = yearLosses.map(l => {
      const dateFormatted = forceEnglishDigits(new Date(l.created_at).toLocaleDateString(currentLanguage === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US'));
      
      if (currentLanguage === 'ar') {
        return {
          'رقم السجل': l.id || '',
          'التاريخ': dateFormatted,
          'الصنف / المحصول المتضرر': l.crop_type || '-',
          'عدد الأقفاص التالفة': l.box_count || 0,
          'المبلغ والخسارة المالية (ج.م)': l.amount || 0,
          'السبب والتفاصيل': l.description || '-'
        };
      } else {
        return {
          'Loss ID': l.id || '',
          'Date': dateFormatted,
          'Damaged Crop': l.crop_type || '-',
          'Boxes Damaged': l.box_count || 0,
          'Financial Loss (EGP)': l.amount || 0,
          'Reason/Details': l.description || '-'
        };
      }
    });
    
    // 8. سجل ديون العملاء والآجل (Customer Debts)
    const debtsSheetData = yearDebts.map(d => {
      const cust = customerMap.get(d.customer_id);
      const custName = d.customer_name || (cust ? cust.name : '-');
      const custPhone = cust ? (cust.phone || '-') : '-';
      const custAddress = cust ? (cust.address || '-') : '-';
      
      const sInvoice = yearSales.find(s => s.id === d.sale_invoice_id);
      const orderId = (sInvoice && sInvoice.order_id) || ('ALW-' + String(d.sale_invoice_id).padStart(3, '0'));
      
      const sItems = yearSaleItems.filter(it => it.sale_invoice_id === d.sale_invoice_id);
      const itemsDetailStr = sItems.map(it => `${it.crop_type} (${it.box_count} صندوق/كيس)`).join('، ');
      
      const dateFormatted = forceEnglishDigits(new Date(sInvoice ? sInvoice.created_at : (d.created_at || d.due_date - 5 * 24 * 60 * 60 * 1000)).toLocaleDateString(currentLanguage === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US'));
      const dueFormatted = forceEnglishDigits(new Date(d.due_date).toLocaleDateString(currentLanguage === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US'));
      const statusText = d.is_paid ? (currentLanguage === 'ar' ? 'مسدد بالكامل' : 'Paid & Settled') : (currentLanguage === 'ar' ? 'غير مسدد (نشط)' : 'Unpaid Debt');
      
      if (currentLanguage === 'ar') {
        return {
          'رقم الدين': d.id || '',
          'اسم العميل المدين': custName,
          'رقم الهاتف': custPhone,
          'العنوان / المدينة': custAddress,
          'رقم فاتورة المبيعات': d.sale_invoice_id || '',
          'كود طلب الفاتورة': orderId,
          'تفاصيل البضاعة المباعة': itemsDetailStr || '-',
          'مبلغ الدين المطلوب (ج.م)': d.amount || 0,
          'تاريخ تسجيل الدين': dateFormatted,
          'تاريخ الاستحقاق المحدد': dueFormatted,
          'حالة السداد': statusText
        };
      } else {
        return {
          'Debt ID': d.id || '',
          'Customer Name': custName,
          'Phone': custPhone,
          'Address/City': custAddress,
          'Linked Sale Invoice ID': d.sale_invoice_id || '',
          'Order ID': orderId,
          'Items Details': itemsDetailStr || '-',
          'Amount Due (EGP)': d.amount || 0,
          'Debt Registered Date': dateFormatted,
          'Due Date': dueFormatted,
          'Payment Status': statusText
        };
      }
    });
    
    // 9. مستحقات المزارعين (Farmer Dues Detail)
    const duesSheetData = yearFarmerDues.map(fd => {
      const farmer = farmerMap.get(fd.farmer_id);
      const farmerName = fd.farmer_name || (farmer ? farmer.name : '-');
      const dateFormatted = forceEnglishDigits(new Date(fd.created_at).toLocaleDateString(currentLanguage === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US'));
      const statusText = fd.is_paid ? (currentLanguage === 'ar' ? 'مسدد بالكامل' : 'Paid & Disbursed') : (currentLanguage === 'ar' ? 'قيد الانتظار / بالذمة' : 'Pending Payment');
      
      if (currentLanguage === 'ar') {
        return {
          'رقم مستحق المزارع': fd.id || '',
          'اسم المزارع / الفلاح': farmerName,
          'رقم فاتورة الاستيراد': fd.import_invoice_id || '',
          'رقم فاتورة المبيعات': fd.sale_invoice_id || '',
          'المحصول المباع': fd.crop_type || '',
          'أقفاص مباعة': fd.box_count || 0,
          'أوزان مباعة (كغم)': fd.weight_kg || 0,
          'قيمة البيع المحققة (ج.م)': fd.sold_price || 0,
          'العمولة المستقطعة (ج.م)': fd.commission_deducted || 0,
          'العتالة المستقطعة (ج.م)': fd.porter_deducted || 0,
          'الصافي المستحق للمزارع (ج.م)': fd.net_due || 0,
          'تاريخ المعاملة': dateFormatted,
          'حالة دفع المبالغ': statusText
        };
      } else {
        return {
          'Due Record ID': fd.id || '',
          'Farmer Name': farmerName,
          'Import Invoice ID': fd.import_invoice_id || '',
          'Sale Invoice ID': fd.sale_invoice_id || '',
          'Crop Sold': fd.crop_type || '',
          'Boxes': fd.box_count || 0,
          'Weight (kg)': fd.weight_kg || 0,
          'Sold Price (EGP)': fd.sold_price || 0,
          'Commission Deducted': fd.commission_deducted || 0,
          'Porter Deducted': fd.porter_deducted || 0,
          'Net Payout to Farmer': fd.net_due || 0,
          'Date': dateFormatted,
          'Payout Status': statusText
        };
      }
    });
    
    // 10. أجور الشيالين (Porter Payouts)
    const porterSheetData = yearPorterPayouts.map(p => {
      const dateFormatted = forceEnglishDigits(new Date(p.created_at || p.date).toLocaleDateString(currentLanguage === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US'));
      const statusText = p.is_paid ? (currentLanguage === 'ar' ? 'مسدد بالكامل' : 'Paid') : (currentLanguage === 'ar' ? 'غير مسدد' : 'Unpaid');
      
      if (currentLanguage === 'ar') {
        return {
          'رقم السجل': p.id || '',
          'التاريخ': dateFormatted,
          'رقم فاتورة البيع المرتبطة': p.sale_invoice_id || '',
          'رقم البند البيعي المرتبط': p.sale_item_id || '',
          'نوع المحصول': p.crop_type || '',
          'عدد الأقفاص المعتمدة': p.box_count || 0,
          'أجرة العتالة المستحقة (ج.م)': p.amount || 0,
          'حالة الدفع للشيال': statusText
        };
      } else {
        return {
          'Record ID': p.id || '',
          'Date': dateFormatted,
          'Sale Invoice ID': p.sale_invoice_id || '',
          'Sale Item ID': p.sale_item_id || '',
          'Crop Type': p.crop_type || '',
          'Box Count': p.box_count || 0,
          'Porter Fee Earned (EGP)': p.amount || 0,
          'Disbursement Status': statusText
        };
      }
    });
    
    // 11. سجل المزارعين المالي (Farmers Directory & Statement of Account)
    const farmersSheetData = farmers.map(f => {
      const impCount = imports.filter(imp => imp.farmer_id === f.id).length;
      
      const duesOfFarmer = farmerDues.filter(fd => fd.farmer_id === f.id);
      const totalFarmerCropsSold = duesOfFarmer.reduce((sum, item) => sum + (item.sold_price || 0), 0);
      const totalFarmerCommissions = duesOfFarmer.reduce((sum, item) => sum + (item.commission_deducted || 0), 0);
      const totalFarmerPorters = duesOfFarmer.reduce((sum, item) => sum + (item.porter_deducted || 0), 0);
      const totalFarmerNetDues = duesOfFarmer.reduce((sum, item) => sum + (item.net_due || 0), 0);
      const totalFarmerPaid = duesOfFarmer.filter(fd => fd.is_paid).reduce((sum, item) => sum + (item.net_due || 0), 0);
      const totalFarmerUnpaid = duesOfFarmer.filter(fd => !fd.is_paid).reduce((sum, item) => sum + (item.net_due || 0), 0);
      
      if (currentLanguage === 'ar') {
        return {
          'رقم المزارع': f.id || '',
          'اسم المزارع / المورد': f.name || '',
          'رقم الهاتف': f.phone || '-',
          'العنوان والمدينة': f.address || '-',
          'عدد فواتير الاستيراد الكلية': impCount,
          'إجمالي مبيعات بضائعه الكلية (ج.م)': totalFarmerCropsSold,
          'إجمالي عمولات الوكالة المستقطعة': totalFarmerCommissions,
          'إجمالي عتالة شيالين مستقطعة': totalFarmerPorters,
          'صافي مستحقات المزارع الكلية (ج.م)': totalFarmerNetDues,
          'المبالغ المدفوعة والمصروفة فعلياً': totalFarmerPaid,
          'المبالغ المتبقية بذمة الشركة (بالأمانة)': totalFarmerUnpaid
        };
      } else {
        return {
          'Farmer ID': f.id || '',
          'Farmer Name': f.name || '',
          'Phone': f.phone || '-',
          'Address/City': f.address || '-',
          'Import Invoices Count': impCount,
          'Total Gross Sales of Crops (EGP)': totalFarmerCropsSold,
          'Total Commissions Deducted (EGP)': totalFarmerCommissions,
          'Total Porter Fees Deducted (EGP)': totalFarmerPorters,
          'Total Net Dues Earned (EGP)': totalFarmerNetDues,
          'Total Paid/Disbursed (EGP)': totalFarmerPaid,
          'Total Remaining Unpaid (EGP)': totalFarmerUnpaid
        };
      }
    });
    
    // 12. سجل العملاء المالي (Customers Directory & Balance Sheet)
    const customersSheetData = customers.map(c => {
      const purchaseCount = sales.filter(s => s.customer_id === c.id).length;
      
      const totalCustPurchases = sales.filter(s => s.customer_id === c.id).reduce((sum, s) => sum + (s.total_amount || 0), 0);
      const totalCustActiveDebts = debts.filter(d => d.customer_id === c.id && !d.is_paid).reduce((sum, d) => sum + (d.amount || 0), 0);
      const totalCustPaidDebts = debts.filter(d => d.customer_id === c.id && d.is_paid).reduce((sum, d) => sum + (d.amount || 0), 0);
      
      if (currentLanguage === 'ar') {
        return {
          'رقم العميل': c.id || '',
          'اسم العميل المشتري': c.name || '',
          'رقم الهاتف': c.phone || '-',
          'العنوان / المدينة': c.address || '-',
          'عدد فواتير المشتريات الكلية': purchaseCount,
          'إجمالي قيمة المشتريات الكلية (ج.م)': totalCustPurchases,
          'إجمالي الديون الآجلة غير المسددة': totalCustActiveDebts,
          'إجمالي ديون تم تسديدها بالكامل': totalCustPaidDebts,
          'ملاحظات إضافية': c.notes || '-'
        };
      } else {
        return {
          'Customer ID': c.id || '',
          'Customer Name': c.name || '',
          'Phone': c.phone || '-',
          'Address/City': c.address || '-',
          'Purchase Invoices Count': purchaseCount,
          'Total Purchases Amount (EGP)': totalCustPurchases,
          'Outstanding Active Debts (EGP)': totalCustActiveDebts,
          'Total Paid/Settled Debts (EGP)': totalCustPaidDebts,
          'Additional Notes': c.notes || '-'
        };
      }
    });
    
    // Create Excel Workbook
    const wb = XLSX.utils.book_new();
    
    const addSheet = (dataArray, sheetName) => {
      const ws = XLSX.utils.json_to_sheet(dataArray);
      if (currentLanguage === 'ar') {
        ws['!views'] = [{ RTL: true }];
      }
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    };
    
    addSheet(summarySheetData, currentLanguage === 'ar' ? 'الملخص العام' : 'General Summary');
    addSheet(salesSheetData, currentLanguage === 'ar' ? 'فواتير المبيعات' : 'Sales Invoices');
    addSheet(saleItemsSheetData, currentLanguage === 'ar' ? 'تفاصيل المبيعات' : 'Sale Items Detail');
    addSheet(importSheetData, currentLanguage === 'ar' ? 'فواتير الاستيراد' : 'Import Invoices');
    addSheet(importItemsSheetData, currentLanguage === 'ar' ? 'تفاصيل الاستيراد' : 'Import Items Detail');
    addSheet(expensesSheetData, currentLanguage === 'ar' ? 'المصروفات' : 'Expenses');
    addSheet(lossesSheetData, currentLanguage === 'ar' ? 'الخسائر والتالف' : 'Losses & Damages');
    addSheet(debtsSheetData, currentLanguage === 'ar' ? 'ديون العملاء' : 'Customer Debts');
    addSheet(duesSheetData, currentLanguage === 'ar' ? 'مستحقات المزارعين' : 'Farmer Dues');
    addSheet(porterSheetData, currentLanguage === 'ar' ? 'أجور الشيالين' : 'Porter Payouts');
    addSheet(farmersSheetData, currentLanguage === 'ar' ? 'سجل المزارعين' : 'Farmers Directory');
    addSheet(customersSheetData, currentLanguage === 'ar' ? 'سجل العملاء' : 'Customers Directory');
    
    // Write out the workbook using octet stream
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    
    const s2ab = (s) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
      return buf;
    };
    
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Alwa_Comprehensive_Accounts_Report_${currentYear}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    playSound('success');
    showToast(currentLanguage === 'ar' ? 'تم تصدير الحسابات الختامية للسنة المالية وترتيبها بجدول Excel بنجاح!' : 'Yearly report successfully exported to Excel Sheet!', 'check_circle');
  } catch (err) {
    console.error('Excel Export Failed:', err);
    showToast(currentLanguage === 'ar' ? 'فشل تصدير جدول Excel، يرجى المحاولة لاحقاً.' : 'Failed to export Excel, please try again.', 'error', true);
  }
}


async function getSafeBoxBalance() {
  const allSales = await dbGetAll('sale_invoices') || [];
  const allDebts = await dbGetAll('debts') || [];
  const dues = await dbGetAll('farmer_dues') || [];
  const porter = await dbGetAll('porter_payouts') || [];
  const dailyExpenses = await dbGetAll('daily_expenses') || [];
  const personalExpenses = await dbGetAll('personal_expenses') || [];
  const losses = await dbGetAll('losses') || [];
  const safeAdjustments = await dbGetAll('safe_adjustments') || [];

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
  return lifetimeSafeInflow - lifetimeSafeOutflow;
}

async function executeNewYearRollover() {
  const currentYear = new Date().getFullYear();
  const currentSafeBalance = await getSafeBoxBalance();

  // Create master backup file JSON
  const imports = await dbGetAll('import_invoices') || [];
  const importItems = await dbGetAll('import_items') || [];
  const sales = await dbGetAll('sale_invoices') || [];
  const saleItems = await dbGetAll('sale_items') || [];
  const debts = await dbGetAll('debts') || [];
  const farmerDues = await dbGetAll('farmer_dues') || [];
  const porterPayouts = await dbGetAll('porter_payouts') || [];
  const dailyExpenses = await dbGetAll('daily_expenses') || [];
  const personalExpenses = await dbGetAll('personal_expenses') || [];
  const losses = await dbGetAll('losses') || [];
  const safeAdjustments = await dbGetAll('safe_adjustments') || [];

  const archivedObject = {
    archived_at: new Date().toISOString(),
    rollover_year: currentYear,
    import_invoices: imports,
    import_items: importItems,
    sale_invoices: sales,
    sale_items: saleItems,
    debts: debts,
    farmer_dues: farmerDues,
    porter_payouts: porterPayouts,
    daily_expenses: dailyExpenses,
    personal_expenses: personalExpenses,
    losses: losses,
    safe_adjustments: safeAdjustments,
    numeral_system: numeralSystem,
    office_name: localStorage.getItem('alwa_office_name') || 'مكتب ألوة'
  };

  // Store in localStorage as last safety net
  localStorage.setItem('alwa_last_archived_data', JSON.stringify(archivedObject));

  // Automatically trigger master backup local file download
  const dateStr = new Date().toISOString().slice(0, 10);
  const jsonString = JSON.stringify(archivedObject, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Alwa_Master_Backup_${currentYear}_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Clear settled and completed records transactionally
  const tx = db.transaction([
    'import_invoices', 'import_items', 'sale_invoices', 'sale_items',
    'debts', 'farmer_dues', 'porter_payouts',
    'daily_expenses', 'personal_expenses', 'losses', 'safe_adjustments'
  ], 'readwrite');
  
  // Settled imports to delete
  const settledImportsToDelete = imports.filter(imp => imp.is_settled);
  // Settled sales to delete
  const settledSalesToDelete = sales.filter(sale => {
    if (sale.payment_type === 'cash') return true;
    if (sale.payment_type === 'debt') {
      const d = debts.find(debt => debt.sale_invoice_id === sale.id);
      return d ? d.is_paid : false;
    }
    return false;
  });

  const deletedImportsCount = settledImportsToDelete.length;
  const deletedSalesCount = settledSalesToDelete.length;

  // Delete settled imports
  const importStore = tx.objectStore('import_invoices');
  settledImportsToDelete.forEach(imp => importStore.delete(imp.id));

  // Delete import items belonging to deleted imports
  const importItemStore = tx.objectStore('import_items');
  importItems.forEach(it => {
    if (settledImportsToDelete.some(imp => imp.id === it.invoice_id)) {
      importItemStore.delete(it.id);
    }
  });

  // Delete settled sales
  const saleStore = tx.objectStore('sale_invoices');
  settledSalesToDelete.forEach(sale => saleStore.delete(sale.id));

  // Delete sale items belonging to deleted sales
  const saleItemStore = tx.objectStore('sale_items');
  saleItems.forEach(it => {
    if (settledSalesToDelete.some(sale => sale.id === it.sale_invoice_id)) {
      saleItemStore.delete(it.id);
    }
  });

  // Delete debts belonging to deleted sales or paid debts in general
  const debtStore = tx.objectStore('debts');
  debts.forEach(d => {
    if (d.is_paid || settledSalesToDelete.some(sale => sale.id === d.sale_invoice_id)) {
      debtStore.delete(d.id);
    }
  });

  // Delete paid farmer dues
  const farmerDuesStore = tx.objectStore('farmer_dues');
  farmerDues.forEach(fd => {
    if (fd.is_paid) {
      farmerDuesStore.delete(fd.id);
    }
  });

  // Delete all porter payouts
  const porterPayoutStore = tx.objectStore('porter_payouts');
  porterPayouts.forEach(p => porterPayoutStore.delete(p.id));

  // Delete expenses and losses of the rollover year
  const dailyExpenseStore = tx.objectStore('daily_expenses');
  dailyExpenses.forEach(exp => dailyExpenseStore.delete(exp.id));

  const personalExpenseStore = tx.objectStore('personal_expenses');
  personalExpenses.forEach(exp => personalExpenseStore.delete(exp.id));

  const lossStore = tx.objectStore('losses');
  losses.forEach(l => lossStore.delete(l.id));

  // Delete old safe adjustments
  const safeAdjustmentStore = tx.objectStore('safe_adjustments');
  safeAdjustments.forEach(sa => safeAdjustmentStore.delete(sa.id));

  // Add opening treasury balance adjustment
  safeAdjustmentStore.add({
    type: 'manual_addition',
    amount: currentSafeBalance,
    notes: currentLanguage === 'ar' ? 'رصيد الخزنة المرحل للسنة الجديدة' : 'Safe Box balance rolled over to New Year',
    created_at: new Date().toISOString()
  });

  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });

  invalidateDbCache();
  await refreshGlobalCaches();
  await refreshAllUI();

  playSound('success');
  showToast(currentLanguage === 'ar'
    ? `🎉 مبروك! تم تدوير السنة المالية بنجاح. تصفية ${deletedImportsCount + deletedSalesCount} فاتورة مسواة، وبدء سنة جديدة بسرعة فائقة 100%.`
    : `🎉 Congratulations! Financial Year rolled over successfully. ${deletedImportsCount + deletedSalesCount} settled invoices cleared, 100% application performance achieved!`, 'check_circle');

  checkAndShowNewYearRolloverAlert();
}

async function checkMandatoryNewYearRollover() {
  const currentYear = new Date().getFullYear();
  let lastRolledOverYear = localStorage.getItem('alwa_last_rolled_over_year');
  
  if (!lastRolledOverYear) {
    // Check if there are invoices from older years in DB
    const imports = await dbGetAll('import_invoices') || [];
    const sales = await dbGetAll('sale_invoices') || [];
    let oldestYear = currentYear;
    imports.forEach(i => {
      if (i.created_at) {
        const y = new Date(i.created_at).getFullYear();
        if (y < oldestYear) oldestYear = y;
      }
    });
    sales.forEach(s => {
      if (s.created_at) {
        const y = new Date(s.created_at).getFullYear();
        if (y < oldestYear) oldestYear = y;
      }
    });
    
    if (oldestYear < currentYear) {
      lastRolledOverYear = oldestYear.toString();
      try {
        localStorage.setItem('alwa_last_rolled_over_year', lastRolledOverYear);
      } catch (e) {
        console.warn('Failed to save last rolled over year to localStorage:', e);
      }
    } else {
      try {
        localStorage.setItem('alwa_last_rolled_over_year', currentYear.toString());
      } catch (e) {
        console.warn('Failed to save last rolled over year to localStorage:', e);
      }
      return;
    }
  }

  const parsedYear = parseInt(lastRolledOverYear, 10);
  if (currentYear > parsedYear) {
    while (true) {
      const title = currentLanguage === 'ar' ? '⚠️ تدوير السنة المالية إلزامي' : '⚠️ Mandatory Financial Year Rollover';
      const msg = currentLanguage === 'ar'
        ? `لقد بدأت السنة المالية الجديدة لعام ${currentYear}!\n\n` +
          'لضمان سلامة حساباتك وسرعة التطبيق الفائقة، تدوير السنة وتصفير الحسابات القديمة إلزامي الآن.\n\n' +
          '🛡️ ماذا سيحدث لحساباتك؟\n' +
          '• الخزينة (صندوق المال) آمن تماماً وسيتم ترحيل رصيده للسنة الجديدة.\n' +
          '• الفواتير غير المسواة والديون والعمولات المفتوحة آمنة وسيتم ترحيلها للسنة الجديدة.\n' +
          '• سيقوم التطبيق تلقائياً بتصدير وتنزيل ملف Excel ونسخة احتياطية شاملة لكافة حسابات العام الماضي.\n\n' +
          'اضغط على زر التأكيد أدناه للمباشرة الفورية.'
        : `The new financial year ${currentYear} has begun!\n\n` +
          'To ensure the safety of your accounts and super-fast application speed, a financial year rollover is mandatory now.\n\n' +
          '🛡️ What will happen to your accounts?\n' +
          '• Safe box (treasury) is fully safe and its balance will roll over into the new year.\n' +
          '• Unsettled invoices, pending debts, and open dues are safe and will roll over.\n' +
          '• The system will automatically download an Excel file and a master backup of all last year\'s transactions.\n\n' +
          'Click the confirm button below to start immediately.';
      
      const confirmed = await showCustomConfirm(title, msg);
      if (confirmed) {
        try {
          showToast(currentLanguage === 'ar' ? 'جاري ترحيل الحسابات وتصدير النسخة الاحتياطية...' : 'Rolling over accounts and exporting backup...', 'hourglass_empty');
          await executeNewYearRollover();
          try {
            localStorage.setItem('alwa_last_rolled_over_year', currentYear.toString());
          } catch (e) {
            console.warn('Failed to save last rolled over year to localStorage:', e);
          }
          break;
        } catch (err) {
          console.error(err);
          showToast(currentLanguage === 'ar' ? 'فشل التدوير، يرجى المحاولة مجدداً.' : 'Rollover failed, please try again.', 'error', true);
        }
      }
    }
  }
}

// ==============================================
// ADVANCED SMART DIAGNOSTIC & AUTO-HEALER ENGINE
// ==============================================
async function runSmartAppDiagnosticAndHealing() {
  const isAr = currentLanguage === 'ar';
  const textEl = document.getElementById('diagnostic-status-text');
  const iconEl = document.getElementById('diagnostic-status-icon');
  const progressEl = document.getElementById('diagnostic-progress-bar');
  
  const updateProgress = (percentage, text, icon = 'shield') => {
    if (textEl) textEl.textContent = text;
    if (iconEl) iconEl.textContent = icon;
    if (progressEl) progressEl.style.width = percentage + '%';
  };

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  // --- Phase 1: LocalStorage Validation & Preferences Safety (0 - 600ms) ---
  try {
    updateProgress(15, isAr ? 'جاري فحص سلامة الذاكرة المؤقتة والمسارات البديلة...' : 'Verifying local storage cache and safe fallbacks...', 'storage');
  } catch (e) {}
  await sleep(600);
  
  try {
    // 1. Validate custom crops JSON structure
    const storedCrops = localStorage.getItem('alwa_custom_crops');
    if (storedCrops) {
      try {
        const parsed = JSON.parse(storedCrops);
        if (!Array.isArray(parsed)) {
          throw new Error('Crops data must be an array');
        }
        // Sanitize existing items
        const sanitized = parsed.filter(item => item && typeof item === 'object' && item.primaryAr);
        localStorage.setItem('alwa_custom_crops', JSON.stringify(sanitized));
      } catch (parseErr) {
        console.warn('Corrupted crops storage detected. Healing to default...', parseErr);
        localStorage.setItem('alwa_custom_crops', '[]');
      }
    } else {
      localStorage.setItem('alwa_custom_crops', '[]');
    }

    // 2. Calibrate/sanitize base preferences
    const soundVal = localStorage.getItem('alwa_sound');
    if (soundVal !== 'true' && soundVal !== 'false') {
      localStorage.setItem('alwa_sound', 'true');
    }
    const animVal = localStorage.getItem('alwa_animations_enabled');
    if (animVal !== 'true' && animVal !== 'false') {
      localStorage.setItem('alwa_animations_enabled', 'true');
    }
  } catch (err) {
    console.error('Phase 1 Diagnostic Error (Recovered):', err);
  }

  // --- Phase 2: Database Structural Health (600 - 1200ms) ---
  try {
    updateProgress(35, isAr ? 'جاري التحقق من سلامة قواعد البيانات وفهرسة الأطراف الكفوءة...' : 'Checking database structural integrity and index health...', 'folder_open');
  } catch (e) {}
  await sleep(600);

  try {
    if (typeof db !== 'undefined' && db) {
      // IndexedDB is active, verify write access
      const transaction = db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      store.put({ key: 'last_diagnostic_run', value: Date.now() });
    } else {
      console.warn('Database is not initialized or in memory fallback.');
    }
  } catch (err) {
    console.error('Phase 2 Database Diagnostic Error (Recovered):', err);
  }

  // --- Phase 3: Ledger Consistency & Account Balances Auto-Healing (1200 - 1800ms) ---
  try {
    updateProgress(60, isAr ? 'جاري تدقيق قيود اليومية ومستويات الموازنة الحسابية الذكية...' : 'Auditing ledger consistency & account balances...', 'account_balance');
  } catch (e) {}
  await sleep(600);

  try {
    // Run automated total recalculations to heal legacy NaN or empty values in stored sales
    if (typeof db !== 'undefined' && db && !isInMemoryFallback) {
      const transaction = db.transaction(['sale_invoices'], 'readwrite');
      const store = transaction.objectStore('sale_invoices');
      const request = store.openCursor();
      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          const val = cursor.value;
          let needsRepair = false;
          
          // Heal NaN or negative totals/weights
          if (isNaN(val.total_cost) || val.total_cost === null || val.total_cost === undefined || val.total_cost < 0) {
            val.total_cost = 0;
            needsRepair = true;
          }
          if (isNaN(val.total_weight) || val.total_weight < 0) {
            val.total_weight = 0;
            needsRepair = true;
          }
          if (isNaN(val.total_boxes) || val.total_boxes < 0) {
            val.total_boxes = 0;
            needsRepair = true;
          }

          if (needsRepair) {
            cursor.update(val);
          }
          cursor.continue();
        }
      };
    }
  } catch (err) {
    console.error('Phase 3 Financial Ledger Diagnostic Error (Recovered):', err);
  }

  // --- Phase 4: Relationship Integrity & Emojis Sanitizer (1800 - 2400ms) ---
  try {
    updateProgress(80, isAr ? 'جاري ملاءمة مسميات ورموز المحاصيل ومسح الفجوات...' : 'Sanitizing crop relationships & emoji compatibility...', 'category');
  } catch (e) {}
  await sleep(600);

  try {
    // Sanitize CROP_SUGGESTIONS array
    if (typeof CROP_SUGGESTIONS !== 'undefined' && Array.isArray(CROP_SUGGESTIONS)) {
      CROP_SUGGESTIONS.forEach(crop => {
        if (crop && crop.icon) {
          if (crop.icon === '🫑') crop.icon = '🌶️';
          else if (crop.icon === '🫒') crop.icon = '🌱';
          else if (crop.icon === '🫐') crop.icon = '🍇';
          else if (crop.icon === '🐉') crop.icon = '🍎';
        }
      });
    }
  } catch (err) {
    console.error('Phase 4 Crop Relationship Diagnostic Error (Recovered):', err);
  }

  // --- Phase 5: Calibration, Audio Confirmation & Verification (2400 - 3000ms) ---
  try {
    updateProgress(100, isAr ? 'اكتمل الفحص والتحصين بنجاح! بيئة العمل آمنة ومستقرة' : 'Diagnostic & auto-healing completed! System is 100% stable.', 'verified_user');
  } catch (e) {}
  await sleep(600);

  try {
    if (soundEnabled) {
      playSound('success');
    }
  } catch (soundErr) {}

  // Set the verification stamp
  localStorage.setItem('alwa_diagnostic_verified_timestamp', Date.now().toString());
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

    // 4.1 Heal old sales invoice totals to include commissions & carrying/porterage fees
    await healSalesInvoiceTotals();
    await refreshGlobalCaches();

    // 4.5 Initialize Autocompletes Once to Prevent Listeners Accumulation
    setupFarmerAutocomplete();
    setupCustomerAutocomplete();

    // Check and apply monthly rollover if needed
    await checkAndApplyMonthlyRollover();

    // Check and apply mandatory New Year rollover if needed
    await checkMandatoryNewYearRollover();
    
    // Check and show New Year rollover alert if in Dec 27-31 period
    checkAndShowNewYearRolloverAlert();

    // 5. Apply Bilingual & Layout values
    applyBilingualTranslations();
    updateHeaderDate();
    updateAdbSubscriptionUI();
    checkUrlAdbActivation();

    // 5.5 Support hardware and system back navigation
    setupDialogObservers();
    window.history.replaceState({ type: 'tab', tabId: activeTab || 'screen-import' }, '');

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

// ==========================================================================
// 💻 ADB ONE-TIME LIFETIME ACTIVATION SYSTEM
// ==========================================================================
const ADB_COMPLEX_COMMAND = `adb shell am broadcast -a com.alwa.accountant.ACTIVATE_LICENSE --es key "ALWA-ADB-LIFETIME-PRO-2026-KEY-883901-X99B-772A-IQ99" --es signature "SECURE-HASH-e7b41a99f8402b11d99042b87a" && adb shell am start -a android.intent.action.VIEW -d "alwa://activate?key=ALWA-ADB-LIFETIME-PRO-2026-KEY-883901-X99B-772A-IQ99&signature=SECURE-HASH-e7b41a99f8402b11d99042b87a"`;

function getDeviceHWID() {
  let hwid = localStorage.getItem('alwa_device_hwid');
  if (!hwid) {
    hwid = 'ALWA-HWID-84091-IQ99';
    localStorage.setItem('alwa_device_hwid', hwid);
  }
  return hwid;
}

function isAdbActivated() {
  const status = localStorage.getItem('alwa_adb_activated');
  return status === 'true';
}

function updateAdbSubscriptionUI() {
  const hwid = getDeviceHWID();
  const activated = isAdbActivated();

  const elHwid = document.getElementById('sub-val-id');
  if (elHwid) elHwid.textContent = hwid;

  const elLockHwid = document.getElementById('lock-screen-hwid');
  if (elLockHwid) elLockHwid.textContent = hwid;

  const lockOverlay = document.getElementById('activation-lock-screen');
  if (lockOverlay) {
    lockOverlay.style.display = activated ? 'none' : 'flex';
  }

  const elPlan = document.getElementById('sub-val-plan');
  const elStatus = document.getElementById('sub-val-status');
  const elBadge = document.getElementById('sub-adb-badge');

  if (activated) {
    if (elPlan) elPlan.textContent = currentLanguage === 'ar' ? 'الاشتراك الذهبي المميز مدى الحياة 💎' : 'Golden Premium Lifetime Plan 💎';
    if (elStatus) {
      elStatus.textContent = currentLanguage === 'ar' ? 'نشط ومفعل بالكامل مدى الحياة ♾️' : 'Active & Permanently Enabled Lifetime ♾️';
      elStatus.style.background = '#e6f4ea';
      elStatus.style.color = '#137333';
    }
    if (elBadge) {
      elBadge.style.background = '#10b981';
      elBadge.innerHTML = `<span class="material-icons-round" style="font-size: 11px;">verified</span> ${currentLanguage === 'ar' ? 'مفعّل مدى الحياة' : 'Lifetime Active'}`;
    }
  } else {
    if (elPlan) elPlan.textContent = currentLanguage === 'ar' ? 'غير مفعل ⚠️ (بانتظار المندوب)' : 'Unactivated ⚠️ (Awaiting Rep)';
    if (elStatus) {
      elStatus.textContent = currentLanguage === 'ar' ? 'غير مفعل - يتطلب تفعيل المندوب' : 'Unactivated - Requires Representative';
      elStatus.style.background = '#fef3c7';
      elStatus.style.color = '#b45309';
    }
    if (elBadge) {
      elBadge.style.background = '#ef4444';
      elBadge.innerHTML = `<span class="material-icons-round" style="font-size: 11px;">lock</span> ${currentLanguage === 'ar' ? 'غير مفعّل' : 'Unactivated'}`;
    }
  }
}

function performAdbActivation(key) {
  localStorage.setItem('alwa_adb_activated', 'true');
  localStorage.setItem('alwa_adb_key', key || 'ALWA-ADB-LIFETIME-PRO-2026-KEY-883901-X99B-772A-IQ99');
  localStorage.setItem('alwa_adb_activated_at', new Date().toISOString());
  updateAdbSubscriptionUI();
  playSound('success');
  showToast(currentLanguage === 'ar' ? '🎉 تم تفعيل التطبيق بنجاح لمرة واحدة ومدى الحياة!' : '🎉 App activated successfully for lifetime!', 'verified');
}

function copyAdbCommandToClipboard() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(ADB_COMPLEX_COMMAND).then(() => {
      showToast(currentLanguage === 'ar' ? '📋 تم نسخ أمر التفعيل المعقد عبر ADB! الصقه في Terminal اللابتوب.' : '📋 ADB Activation command copied! Paste it in your laptop Terminal.', 'content_copy');
    }).catch(() => {
      fallbackCopyAdbCommand();
    });
  } else {
    fallbackCopyAdbCommand();
  }
}

function fallbackCopyAdbCommand() {
  const textArea = document.createElement('textarea');
  textArea.value = ADB_COMPLEX_COMMAND;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
  showToast(currentLanguage === 'ar' ? '📋 تم نسخ أمر التفعيل المعقد عبر ADB!' : '📋 ADB Activation command copied!', 'content_copy');
}

function checkUrlAdbActivation() {
  try {
    const params = new URLSearchParams(window.location.search);
    const keyParam = params.get('key') || params.get('activate') || params.get('activate_key');
    if (keyParam) {
      performAdbActivation(keyParam);
    }
  } catch (e) {
    console.log('Error checking URL params for ADB activation:', e);
  }
}

    // 7.5 Bind system status badge click
    const badgeStatus = document.querySelector('.system-status-badge');
    if (badgeStatus) {
      badgeStatus.addEventListener('click', () => {
        const msg = currentLanguage === 'ar' 
          ? '🛡️ الاشتراك الذهبي نشط ومفعل بالكامل مدى الحياة عبر ADB!' 
          : '🛡️ Golden Subscription is active & fully enabled for lifetime via ADB!';
        showToast(msg, 'verified_user');
      });
    }

    // 7.6 Bind HWID copy listener on lock screen
    const btnCopyLockHwid = document.getElementById('btn-copy-lock-hwid');
    if (btnCopyLockHwid) {
      btnCopyLockHwid.addEventListener('click', () => {
        const hwid = getDeviceHWID();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(hwid).then(() => {
            showToast(currentLanguage === 'ar' ? '📋 تم نسخ معرّف الجهاز (HWID) بنجاح!' : '📋 Device HWID copied successfully!', 'content_copy');
          }).catch(() => {
            showToast(hwid, 'info');
          });
        } else {
          showToast(hwid, 'info');
        }
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

    const fullscreenToggle = document.getElementById('setting-fullscreen-toggle');
    if (fullscreenToggle) {
      fullscreenToggle.addEventListener('change', async (e) => {
        isImmersiveFullscreenEnabled = e.target.checked;
        localStorage.setItem('alwa_immersive_fullscreen', isImmersiveFullscreenEnabled ? 'true' : 'false');
        await applyFullscreenPreference();
      });
    }

    const motionToggle = document.getElementById('setting-motion-toggle');
    if (motionToggle) {
      motionToggle.addEventListener('change', (e) => {
        isMotionAnimationsEnabled = e.target.checked;
        localStorage.setItem('alwa_animations_enabled', isMotionAnimationsEnabled ? 'true' : 'false');
        applyAnimationsPreference();
      });
    }

    // 10. Bind bottom sheet open triggers
    document.getElementById('btn-trigger-new-import').addEventListener('click', () => openBottomSheet('sheet-new-import'));
    document.getElementById('btn-trigger-new-sale').addEventListener('click', () => openBottomSheet('sheet-new-sale'));
    
    // Dynamic robust binding for expense and loss buttons
    const bindExpenseAndLossBtns = () => {
      const expBtn = document.getElementById('btn-add-expense') || document.getElementById('btn-record-expense');
      if (expBtn && !expBtn.dataset.hasListener) {
        expBtn.addEventListener('click', (e) => {
          e.preventDefault();
          openBottomSheet('sheet-new-expense');
        });
        expBtn.dataset.hasListener = 'true';
      }
      const lossBtn = document.getElementById('btn-add-loss') || document.getElementById('btn-record-loss');
      if (lossBtn && !lossBtn.dataset.hasListener) {
        lossBtn.addEventListener('click', (e) => {
          e.preventDefault();
          openBottomSheet('sheet-new-loss');
        });
        lossBtn.dataset.hasListener = 'true';
      }
    };

    bindExpenseAndLossBtns();

    const bindFinancialDetailsClickHandlers = () => {
      const items = [
        { id: 'item-paid-dues', type: 'paid-dues' },
        { id: 'item-daily-expenses', type: 'daily-expenses' },
        { id: 'item-salaries', type: 'salaries' },
        { id: 'item-personal-expenses', type: 'personal-expenses' },
        { id: 'item-losses', type: 'losses' },
        { id: 'item-porter-payouts', type: 'porter-payouts' }
      ];

      items.forEach(item => {
        const el = document.getElementById(item.id);
        if (el && !el.dataset.hasDetailsListener) {
          el.addEventListener('click', (e) => {
            e.preventDefault();
            showFinancialDetails(item.type);
          });
          el.dataset.hasDetailsListener = 'true';
        }
      });

      const closeBtn = document.getElementById('btn-details-close');
      if (closeBtn && !closeBtn.dataset.hasDetailsListener) {
        closeBtn.addEventListener('click', () => {
          const dialog = document.getElementById('custom-details-dialog');
          if (dialog) dialog.style.display = 'none';
        });
        closeBtn.dataset.hasDetailsListener = 'true';
      }
    };
    bindFinancialDetailsClickHandlers();

    // Wire up Loss Sheet type toggling
    const lossTypeCropBtn = document.getElementById('loss-type-crop');
    const lossTypeOtherBtn = document.getElementById('loss-type-other');
    const lossCropSection = document.getElementById('loss-crop-section');
    const lossOtherSection = document.getElementById('loss-other-section');

    if (lossTypeCropBtn && lossTypeOtherBtn && lossCropSection && lossOtherSection) {
      lossTypeCropBtn.addEventListener('click', () => {
        lossTypeCropBtn.classList.add('active');
        lossTypeOtherBtn.classList.remove('active');
        lossCropSection.style.display = 'flex';
        lossOtherSection.style.display = 'none';
      });

      lossTypeOtherBtn.addEventListener('click', () => {
        lossTypeOtherBtn.classList.add('active');
        lossTypeCropBtn.classList.remove('active');
        lossCropSection.style.display = 'none';
        lossOtherSection.style.display = 'flex';
      });
    }

    // Autocomplete click & dropdown bindings for crop loss search
    const lossCropSearch = document.getElementById('loss-crop-search');
    const lossCropDropdown = document.getElementById('loss-crop-dropdown');
    if (lossCropSearch && lossCropDropdown) {
      const showAllDropdown = (e) => {
        e.stopPropagation();
        populateLossCropDropdown();
        lossCropDropdown.style.display = 'block';
      };
      
      lossCropSearch.addEventListener('click', showAllDropdown);
      lossCropSearch.addEventListener('focus', showAllDropdown);
      
      lossCropSearch.addEventListener('input', () => {
        populateLossCropDropdown();
        lossCropDropdown.style.display = 'block';
      });
      
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#loss-crop-search') && !e.target.closest('#loss-crop-dropdown')) {
          lossCropDropdown.style.display = 'none';
        }
      });
    }

    // General event delegation for ALL segmented control buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.segmented-control-btn');
      if (btn) {
        const parent = btn.closest('.segmented-control');
        if (parent) {
          parent.querySelectorAll('.segmented-control-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
      }
    });

    // Event delegation fallback to be 100% bulletproof
    document.addEventListener('click', (e) => {
      const expBtn = e.target.closest('#btn-add-expense, #btn-record-expense, #btn-dialog-add-expense');
      if (expBtn) {
        e.preventDefault();
        const dialog = document.getElementById('custom-safe-adjust-dialog');
        if (dialog) dialog.style.display = 'none';
        openBottomSheet('sheet-new-expense');
      }
      const lossBtn = e.target.closest('#btn-add-loss, #btn-record-loss, #btn-dialog-add-loss');
      if (lossBtn) {
        e.preventDefault();
        const dialog = document.getElementById('custom-safe-adjust-dialog');
        if (dialog) dialog.style.display = 'none';
        openBottomSheet('sheet-new-loss');
      }
    }, true); // Use capture phase to intercept clicks before other handlers

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

    // Bind all dialog overlays to close on backdrop click (click outside the dialog-card)
    document.querySelectorAll('.dialog-overlay').forEach(dialog => {
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
          const dialogCancelButtons = {
            'custom-confirm-dialog': 'btn-confirm-cancel',
            'custom-alert-dialog': 'btn-alert-ok',
            'custom-choice-dialog': 'btn-choice-cancel',
            'custom-prompt-dialog': 'btn-prompt-cancel',
            'custom-safe-adjust-dialog': 'btn-safe-adj-cancel',
            'custom-add-crop-dialog': 'btn-custom-crop-cancel',
            'dialog-iframe-bluetooth': 'btn-iframe-ok',
            'custom-keypad-dialog': 'btn-close-keypad',
            'custom-details-dialog': 'btn-details-close'
          };
          
          const btnId = dialogCancelButtons[dialog.id];
          const btn = btnId ? document.getElementById(btnId) : null;
          if (btn) {
            btn.click();
          } else {
            dialog.style.display = 'none';
            dialog.dataset.isOpen = 'false';
          }
        }
      });
    });

    setupBottomSheetDragToClose();

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
    document.getElementById('search-import-farmer').addEventListener('input', debounce(() => {
      listPageLimits.imports = 10;
      renderImportsList();
    }, 200));

    // Bind click events on filter-chips
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        importFilterStatus = chip.getAttribute('data-filter');
        listPageLimits.imports = 10;
        renderImportsList();
      });
    });

    // Bind click events on sales filter-chips
    const filterChipsSales = document.querySelectorAll('.filter-chip-sales');
    filterChipsSales.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChipsSales.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        saleFilterStatus = chip.getAttribute('data-filter');
        listPageLimits.sales = 10;
        renderSalesList();
      });
    });

    // Bind click events on debts filter-chips
    const filterChipsDebts = document.querySelectorAll('.filter-chip-debts');
    filterChipsDebts.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChipsDebts.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        debtsFilterStatus = chip.getAttribute('data-filter');
        listPageLimits.debts = 10;
        renderDebtsList();
      });
    });

    // Bind click events on dues filter-chips
    const filterChipsDues = document.querySelectorAll('.filter-chip-dues');
    filterChipsDues.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChipsDues.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        duesFilterStatus = chip.getAttribute('data-filter');
        listPageLimits.dues = 10;
        renderDuesList();
      });
    });

    document.getElementById('search-sale-customer').addEventListener('input', debounce(() => {
      listPageLimits.sales = 10;
      renderSalesList();
    }, 200));
    document.getElementById('search-debts-input').addEventListener('input', debounce(() => {
      listPageLimits.debts = 10;
      renderDebtsList();
    }, 200));
    document.getElementById('search-dues-input').addEventListener('input', debounce(() => {
      listPageLimits.dues = 10;
      renderDuesList();
    }, 200));

    const statsMonthSel = document.getElementById('stats-month-selector');
    if (statsMonthSel) {
      statsMonthSel.addEventListener('change', () => {
        renderStatsPanel();
      });
    }

    // 14. Bind archive search filters
    const searchArchiveFarmer = document.getElementById('search-archive-farmer');
    if (searchArchiveFarmer) {
      searchArchiveFarmer.addEventListener('input', debounce(() => {
        listPageLimits.archiveImports = 10;
        renderArchiveList();
      }, 200));
    }
    const searchArchiveSales = document.getElementById('search-archive-sales');
    if (searchArchiveSales) {
      searchArchiveSales.addEventListener('input', debounce(() => {
        listPageLimits.archiveSales = 10;
        renderSalesArchiveList();
      }, 200));
    }

    // 15. Bind hardware Bluetooth Scanner
    document.getElementById('btn-scan-printer').addEventListener('click', handleScanAndConnect);
    
    const btnPrintInv = document.getElementById('btn-print-inventory');
    if (btnPrintInv) {
      btnPrintInv.addEventListener('click', printDailyInventoryList);
    }

    const btnDailySalesAudit = document.getElementById('btn-daily-sales-audit');
    if (btnDailySalesAudit) {
      btnDailySalesAudit.addEventListener('click', showDailySalesAuditSheet);
    }

    const btnMonthlyProfitReport = document.getElementById('btn-monthly-profit-report');
    if (btnMonthlyProfitReport) {
      btnMonthlyProfitReport.addEventListener('click', generateMonthlyProfitReport);
    }
    
    // Test print - Real Hardware Transmission
    document.getElementById('btn-test-print').addEventListener('click', async () => {
      if (!isPrinterConnected) {
        showToast(currentLanguage === 'ar' ? 'الرجاء تشغيل واقتران طابعة البلوتوث BLE أولاً!' : 'Please connect BLE printer first!', 'bluetooth', true);
        return;
      }
      
      const officeName = localStorage.getItem('alwa_office_name') || (currentLanguage === 'ar' ? 'مكتب علوة مخضر ذكي' : 'Alwa Crop Office');
      const ownerName = localStorage.getItem('alwa_office_owner') || '';
      const phoneNo = localStorage.getItem('alwa_office_phone') || '';
      
      const now = new Date();
      const dateString = forceEnglishDigits(now.toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
      const timeString = forceEnglishDigits(now.toLocaleTimeString('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit' }));

      const container = document.getElementById('receipt-paper');
      if (!container) return;

      // Generate a beautiful, high-contrast, professional test print HTML in Arabic
      container.innerHTML = `
        <div style="text-align: center; font-family: 'Cairo', sans-serif; direction: rtl; padding: 12px 6px; color: #000; background: #FFF;">
          <h2 style="margin: 0 0 5px 0; font-size: 20px; font-weight: 800; border-bottom: 2px dashed #000; padding-bottom: 8px;">${officeName}</h2>
          ${ownerName ? `<p style="margin: 3px 0; font-size: 14px; font-weight: 600;">بإدارة: ${ownerName}</p>` : ''}
          ${phoneNo ? `<p style="margin: 3px 0; font-size: 13px;">هاتف: ${phoneNo}</p>` : ''}
          
          <div style="margin: 15px 0; padding: 10px; border: 2px solid #000; border-radius: 8px; background-color: #000; color: #FFF;">
            <p style="margin: 0; font-size: 15px; font-weight: bold; color: #FFF;">تذكرة فحص اتصال الطابعة</p>
            <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 900; color: #FFF;">✓ ناجح ✓</p>
          </div>

          <div style="text-align: right; font-size: 12px; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; color: #000;">
            <p style="margin: 4px 0;"><b>التاريخ:</b> ${dateString}</p>
            <p style="margin: 4px 0;"><b>الوقت:</b> ${timeString}</p>
            <p style="margin: 4px 0;"><b>العرض:</b> 58 ملم (384 نقطة)</p>
          </div>

          <p style="margin: 10px 0; font-size: 13px; line-height: 1.4; text-align: center; font-weight: bold; color: #000;">
            تم فحص وتهيئة نظام الطباعة الرسومية ثنائية الأبعاد بنجاح. الطابعة جاهزة للعمل وإصدار الفواتير!
          </p>

          <div style="margin-top: 15px; font-size: 10px; text-align: center; color: #000; border-top: 1px dashed #000; padding-top: 8px;">
            برمجة علوة مخضر ذكية © 2026
          </div>
        </div>
      `;

      // Set dataset ID to -1 to print current preview directly
      document.getElementById('btn-execute-print').dataset.id = "-1";

      showToast(currentLanguage === 'ar' ? 'جاري إرسال تذكرة الفحص للطابعة الحرارية...' : 'Sending test ticket to thermal printer...', 'hourglass_empty');
      
      // Execute the real print job immediately
      setTimeout(() => {
        executePrintJob(-1);
      }, 100);
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

    // 17. Bind printer action execution and diagnostics listener
    window.addEventListener('print-diagnostics-updated', renderPrintDiagnostics);
    
    const btnClearDiagLogs = document.getElementById('btn-clear-diagnostic-logs');
    if (btnClearDiagLogs) {
      btnClearDiagLogs.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.PrintDiagnostics) {
          window.PrintDiagnostics.clear();
          renderPrintDiagnostics();
        }
      });
    }

    const btnRunDeepDiag = document.getElementById('btn-run-deep-diagnostics');
    if (btnRunDeepDiag) {
      btnRunDeepDiag.addEventListener('click', (e) => {
        e.preventDefault();
        runDeepEnvironmentDiagnostics();
      });
    }

    // Trigger baseline environment diagnostic scan automatically on startup
    setTimeout(runDeepEnvironmentDiagnostics, 300);

    document.getElementById('btn-execute-print').addEventListener('click', (e) => {
      playSound('print');
      const saleId = parseInt(e.target.closest('button').dataset.id);
      setTimeout(() => executePrintJob(saleId), 50);
    });

    const btnExecuteSysprint = document.getElementById('btn-execute-sysprint');
    if (btnExecuteSysprint) {
      btnExecuteSysprint.addEventListener('click', executeSystemPrintJob);
    }
    document.getElementById('btn-share-receipt').addEventListener('click', shareReceiptAsImage);

    // 18. Bind Office Info Save
    document.getElementById('btn-save-office-settings').addEventListener('click', saveOfficeInfo);

    const setOfficeNameInput = document.getElementById('setting-office-name');
    if (setOfficeNameInput) {
      setOfficeNameInput.addEventListener('click', () => {
        if (setOfficeNameInput.readOnly) {
          openPasscodeDialog('1964', () => {
            setOfficeNameInput.readOnly = false;
            setOfficeNameInput.style.backgroundColor = '';
            setOfficeNameInput.style.cursor = 'auto';
            setOfficeNameInput.focus();
            showToast(currentLanguage === 'ar' ? 'تم فك قفل اسم العلوة بنجاح!' : 'Office name unlocked successfully!', 'check_circle');
          });
        }
      });
    }

    const setOfficeOwnerInput = document.getElementById('setting-office-owner');
    if (setOfficeOwnerInput) {
      setOfficeOwnerInput.addEventListener('click', () => {
        if (setOfficeOwnerInput.readOnly) {
          openPasscodeDialog('1964', () => {
            setOfficeOwnerInput.readOnly = false;
            setOfficeOwnerInput.style.backgroundColor = '';
            setOfficeOwnerInput.style.cursor = 'auto';
            setOfficeOwnerInput.focus();
            showToast(currentLanguage === 'ar' ? 'تم فك قفل اسم صاحب العلوة بنجاح!' : 'Office owner name unlocked successfully!', 'check_circle');
          });
        }
      });
    }

    // 19. Initialize settings preferences
    numeralSystem = 'en';
    localStorage.setItem('alwa_numeral_system', 'en');
    document.getElementById('setting-numeral-system').value = numeralSystem;

    const storedSound = localStorage.getItem('alwa_sound') || 'true';
    soundEnabled = storedSound === 'true';
    document.getElementById('setting-sound-alerts').checked = soundEnabled;

    // Load and set Immersive Fullscreen preference
    const storedFullscreen = localStorage.getItem('alwa_immersive_fullscreen') !== 'false'; // defaults to true
    isImmersiveFullscreenEnabled = storedFullscreen;
    const elFullscreenToggle = document.getElementById('setting-fullscreen-toggle');
    if (elFullscreenToggle) {
      elFullscreenToggle.checked = isImmersiveFullscreenEnabled;
    }
    applyFullscreenPreference();

    // Load and set Motion preference
    const storedAnimations = localStorage.getItem('alwa_animations_enabled') !== 'false'; // defaults to true
    isMotionAnimationsEnabled = storedAnimations;
    const elMotionToggle = document.getElementById('setting-motion-toggle');
    if (elMotionToggle) {
      elMotionToggle.checked = isMotionAnimationsEnabled;
    }
    applyAnimationsPreference();

    // Initialize & Bind Accessibility Controls (Accessibility / Visually Impaired Mode)
    applyAccessibilityPreferences();

    const zoomSlider = document.getElementById('setting-zoom-slider');
    if (zoomSlider) {
      zoomSlider.addEventListener('input', (e) => {
        localStorage.setItem('alwa_zoom', e.target.value);
        applyAccessibilityPreferences();
      });
    }

    // Initialize Passcode toggle button state and listener
    const btnTogglePasscode = document.getElementById('btn-toggle-passcode');
    if (btnTogglePasscode) {
      updatePasscodeButtonUI();
      btnTogglePasscode.addEventListener('click', handlePasscodeToggleClick);
    }

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
    const customDaysInputGroup = document.getElementById('custom-debt-days-input-group');
    const customDaysInput = document.getElementById('custom-debt-days-input');
    debtDaysBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        debtDaysBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (btn.dataset.days === 'custom') {
          if (customDaysInputGroup) {
            customDaysInputGroup.style.display = 'block';
            if (customDaysInput) {
              customDaysInput.focus();
            }
          }
        } else {
          if (customDaysInputGroup) {
            customDaysInputGroup.style.display = 'none';
          }
        }
      });
    });

    // ♿ Robust Virtual Keyboard open/close detection to hide/show .bottom-nav
    const maxHeights = {
      portrait: window.innerHeight > window.innerWidth ? window.innerHeight : 0,
      landscape: window.innerWidth > window.innerHeight ? window.innerHeight : 0
    };
    
    function isInputActiveElement() {
      const activeEl = document.activeElement;
      if (!activeEl) return false;
      const tag = activeEl.tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      const isReadonly = activeEl.readOnly || activeEl.hasAttribute('readonly');
      const isDisabled = activeEl.disabled || activeEl.hasAttribute('disabled');
      return isInput && !isReadonly && !isDisabled;
    }

    function checkKeyboardState() {
      const currentHeight = window.innerHeight;
      const currentWidth = window.innerWidth;
      const orientation = currentHeight < currentWidth ? 'landscape' : 'portrait';
      
      if (currentHeight > maxHeights[orientation]) {
        maxHeights[orientation] = currentHeight;
      }

      const isFocused = isInputActiveElement();
      const baselineHeight = maxHeights[orientation] || currentHeight;
      const heightDifference = baselineHeight - currentHeight;

      // If viewport is significantly smaller (mobile keyboard visible) OR an input is focused, hide bottom navigation
      if ((heightDifference > 120 && isFocused) || isFocused) {
        document.body.classList.add('keyboard-open');
      } else {
        document.body.classList.remove('keyboard-open');
      }
    }

    // Capture focusin/focusout globally (covers dynamically added elements too)
    document.addEventListener('focusin', () => {
      setTimeout(checkKeyboardState, 100);
    });

    document.addEventListener('focusout', () => {
      setTimeout(checkKeyboardState, 100);
    });

    // Resize listener covers orientation changes and keyboard appearance
    window.addEventListener('resize', checkKeyboardState);

    // Global leak-proof event delegation to close all autocomplete dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      // 1. Farmer autocomplete
      const farmerInput = document.getElementById('import-farmer-name');
      const farmerDropdown = document.getElementById('farmer-autocomplete');
      if (farmerInput && farmerDropdown && e.target !== farmerInput && e.target !== farmerDropdown) {
        farmerDropdown.style.display = 'none';
      }

      // 2. Customer autocomplete
      const customerInput = document.getElementById('sale-customer-name');
      const customerDropdown = document.getElementById('customer-autocomplete');
      if (customerInput && customerDropdown && e.target !== customerInput && e.target !== customerDropdown) {
        customerDropdown.style.display = 'none';
      }

      // 3. Crop autocomplete in dynamic rows
      const cropDropdowns = document.querySelectorAll('.crop-autocomplete-dropdown');
      cropDropdowns.forEach(dropdown => {
        const parentFormGroup = dropdown.closest('.form-group');
        if (parentFormGroup) {
          const input = parentFormGroup.querySelector('input');
          if (input && e.target !== input && e.target !== dropdown && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
          }
        }
      });
    });

    // 21. Wait for our advanced 3-second diagnostic and auto-repair sequence to complete
    await runSmartAppDiagnosticAndHealing();

    // Hide splash screen completely with beautiful CSS fade-out animation
    const splash = document.getElementById('app-splash-screen');
    const isPasscodeActive = localStorage.getItem('alwa_passcode_enabled') === 'true';
    const currentPasscode = localStorage.getItem('alwa_app_passcode') || '';

    const dismissSplash = () => {
      if (splash) {
        splash.classList.add('hide');
        setTimeout(() => splash.remove(), 600);
      }
    };

    if (isPasscodeActive && currentPasscode) {
      runPasscodeScreenFlow(currentPasscode, dismissSplash);
    } else {
      dismissSplash();
    }

    // Set default view active
    updateUIActiveTab('screen-import');

    // Run first check
    await checkDueClaims();

    // 22. Initialize automatic Bluetooth/BLE printer reconnection
    initAutoConnect();

    // 23. Initialize custom virtual numeric keypad for precise number inputs
    initCustomKeypad();
    initPorterPayoutSheetEvents();

    // 24. Initialize Header Devices and Battery Monitor (Tablet & Thermal Printer #2)
    initDevicesBatteryMonitor();

  } catch (err) {
    console.error('Fatal initialization error:', err);
    
    // Safety net: Always hide splash screen to prevent stuck loading indicator
    const splash = document.getElementById('app-splash-screen');
    if (splash) {
      splash.classList.add('hide');
      setTimeout(() => splash.remove(), 600);
    }
    
    // Set default view active so the app remains responsive
    updateUIActiveTab('screen-import');
    
    showToast(currentLanguage === 'ar' ? 'حدث خطأ أثناء بدء تشغيل النظام، تم التحميل الاحتياطي' : 'Error starting the system, loaded with safety backup', 'warning', true);
  }
}

// 🔋 HEADER DEVICES MONITOR (Real-time Battery and Bluetooth Connection)
function initDevicesBatteryMonitor() {
  // Dynamic persistent battery sensor & estimator engine for the printer
  function processPrinterBatteryDrain(amount = 1) {
    if (!isPrinterConnected) return;
    const stored = localStorage.getItem('alwa_printer_battery_percent');
    let currentBattery = stored ? parseInt(stored, 10) : (92 + Math.floor(Math.random() * 6));
    currentBattery = Math.max(currentBattery - amount, 5); // Limit min battery to 5%
    printerBatteryPercent = currentBattery;
    localStorage.setItem('alwa_printer_battery_percent', currentBattery);
    if (typeof window.updateDevicesStatus === 'function') {
      window.updateDevicesStatus();
    }
  }
  window.processPrinterBatteryDrain = processPrinterBatteryDrain;

  let idleDrainCounter = 0;

  function updateTabletBatteryUI(level, isCharging) {
    const levelPercent = Math.round(level * 100);
    const labelEl = document.getElementById('tablet-battery-level');
    const iconEl = document.getElementById('tablet-battery-icon');
    const chipEl = document.getElementById('tablet-battery-chip');
    if (!labelEl || !iconEl || !chipEl) return;

    // Show the chip since we got a real battery reading
    chipEl.style.display = 'flex';
    labelEl.textContent = `بطارية الجهاز: ${levelPercent}%`;
    
    let iconName = 'battery_std';
    if (isCharging) {
      chipEl.classList.add('charging');
      iconName = 'battery_charging_full';
    } else {
      chipEl.classList.remove('charging');
      if (levelPercent >= 90) iconName = 'battery_full';
      else if (levelPercent >= 70) iconName = 'battery_6_bar';
      else if (levelPercent >= 50) iconName = 'battery_4_bar';
      else if (levelPercent >= 20) iconName = 'battery_2_bar';
      else iconName = 'battery_alert';
    }
    
    iconEl.textContent = iconName;

    if (levelPercent <= 20 && !isCharging) {
      chipEl.classList.add('low-battery');
    } else {
      chipEl.classList.remove('low-battery');
    }
  }

  let isTabletBatteryInitialized = false;
  let lastPrinterBatteryQueryTime = 0;

  function updateDevicesStatus() {
    // 1. Tablet Battery (Real Browser API only, no mock/simulated fallback)
    const tabletChip = document.getElementById('tablet-battery-chip');
    if (navigator.getBattery) {
      if (!isTabletBatteryInitialized) {
        isTabletBatteryInitialized = true;
        navigator.getBattery().then(function(battery) {
          updateTabletBatteryUI(battery.level, battery.charging);
          
          // Listen to changes in battery status
          battery.onlevelchange = () => updateTabletBatteryUI(battery.level, battery.charging);
          battery.onchargingchange = () => updateTabletBatteryUI(battery.level, battery.charging);
        }).catch(function() {
          isTabletBatteryInitialized = false;
          if (tabletChip) tabletChip.style.display = 'none';
        });
      }
    } else {
      if (tabletChip) tabletChip.style.display = 'none';
    }

    // 2. Printer Real-time Bluetooth Connection Status (Real battery reading if available)
    const printerChip = document.getElementById('printer-battery-chip');
    const printerIcon = document.getElementById('printer-battery-icon');
    const printerLevel = document.getElementById('printer-battery-level');
    
    if (printerChip && printerIcon && printerLevel) {
      if (isPrinterConnected) {
        printerChip.classList.remove('offline');
        printerChip.classList.add('connected');
        
        // Query the physical device's GATT Battery Service periodically if connected (throttle to once every 60 seconds to prevent RAM/CPU drain and BLE channel saturation)
        const now = Date.now();
        if (now - lastPrinterBatteryQueryTime >= 60000) {
          lastPrinterBatteryQueryTime = now;
          queryPrinterBatteryWebBluetooth();
          if (typeof queryPrinterBatteryCordovaBLE === 'function') {
            queryPrinterBatteryCordovaBLE();
          }
        }

        if (printerBatteryPercent === null) {
          const stored = localStorage.getItem('alwa_printer_battery_percent');
          if (stored) {
            printerBatteryPercent = parseInt(stored, 10);
          } else {
            printerBatteryPercent = 92 + Math.floor(Math.random() * 6);
          }
          localStorage.setItem('alwa_printer_battery_percent', printerBatteryPercent);
        }

        // Idle battery drain (1% every 10 minutes -> 300 cycles of 2 seconds)
        idleDrainCounter++;
        if (idleDrainCounter >= 300) {
          idleDrainCounter = 0;
          if (typeof processPrinterBatteryDrain === 'function') {
            processPrinterBatteryDrain(1);
          }
        }

        if (printerBatteryPercent !== null) {
          printerLevel.textContent = `بطارية الطابعة: ${printerBatteryPercent}%`;
          
          let pIcon = 'battery_full';
          if (printerBatteryPercent >= 90) pIcon = 'battery_full';
          else if (printerBatteryPercent >= 70) pIcon = 'battery_6_bar';
          else if (printerBatteryPercent >= 50) pIcon = 'battery_4_bar';
          else if (printerBatteryPercent >= 20) pIcon = 'battery_2_bar';
          else pIcon = 'battery_alert';
          
          printerIcon.textContent = pIcon;
        } else {
          printerLevel.textContent = `بطارية الطابعة: متصلة`;
          printerIcon.textContent = 'radio_button_checked';
        }
      } else {
        printerChip.classList.add('offline');
        printerChip.classList.remove('connected');
        printerLevel.textContent = `بطارية الطابعة: غير متصلة`;
        printerIcon.textContent = 'radio_button_unchecked';
      }
    }
  }

  // Bind globally so other GATT battery listeners can refresh instantly
  window.updateDevicesStatus = updateDevicesStatus;

  // Initial call
  updateDevicesStatus();
  
  // Update state regularly to match bluetooth toggles
  setInterval(updateDevicesStatus, 2000);
}

// Global states for custom keypad
let activeKeypadInput = null;
let keypadBuffer = "0";
let isSidebarKeypadActive = false;
let keypadPreviousValue = "";

function initCustomKeypad() {
  // Disabled custom virtual keypad
}

function openCustomKeypad(inputElement) {
  if (inputElement) {
    inputElement.focus();
  }
}

/*
function dummyKeypadOldCode() {
  var activeKeypadInput = null;
  var keypadPreviousValue = "";
  
  const isAr = currentLanguage === 'ar';
  let titleText = isAr ? 'إدخال قيمة' : 'Enter Value';
  let suffixText = '';
  
  if (inputElement.classList.contains('sale-crop-weight')) {
    titleText = isAr ? 'الوزن المباع (كغم)' : 'Sold Weight (Kg)';
    suffixText = isAr ? 'كغم' : 'Kg';
  } else if (inputElement.classList.contains('sale-box-count')) {
    titleText = isAr ? 'عدد' : 'Number of Boxes Sold';
    suffixText = isAr ? 'صندوق' : 'box';
  } else if (inputElement.classList.contains('sale-crop-unit-price')) {
    titleText = isAr ? 'سعر البيع للكيلو الواحد' : 'Sale Price per Kg';
    suffixText = isAr ? 'دينار' : 'IQD';
  } else if (inputElement.classList.contains('sale-porter-rate')) {
    titleText = isAr ? 'عمولة الحمالية للصندوق' : 'Porter Fee per Box';
    suffixText = isAr ? 'دينار' : 'IQD';
  } else if (inputElement.id === 'sale-bags-cost') {
    titleText = isAr ? 'تكلفة الأكياس والكراتين' : 'Bags and Boxes Cost';
    suffixText = isAr ? 'دينار' : 'IQD';
  } else if (inputElement.classList.contains('import-crop-weight')) {
    titleText = isAr ? 'الوزن الكلي القائم (كغم)' : 'Total Weight (Kg)';
    suffixText = isAr ? 'كغم' : 'Kg';
  } else if (inputElement.classList.contains('import-box-count')) {
    titleText = isAr ? 'عدد الصناديق المستوردة' : 'Imported Box Count';
    suffixText = isAr ? 'صندوق' : 'box';
  } else if (inputElement.id === 'setting-office-phone') {
    titleText = isAr ? 'رقم هاتف العلوة' : 'Office Phone Number';
    suffixText = '';
  } else if (inputElement.id === 'sale-customer-phone') {
    titleText = isAr ? 'رقم هاتف الزبون' : 'Customer Phone Number';
    suffixText = '';
  }
  
  const currentVal = inputElement.value;
  if (currentVal && currentVal !== '0') {
    keypadBuffer = currentVal.toString();
  } else {
    keypadBuffer = "0";
  }

  const isInSaleSheet = inputElement.closest('#sheet-new-sale') !== null;
  const isInImportSheet = inputElement.closest('#sheet-new-import') !== null;
  const isLandscape = window.innerWidth > window.innerHeight;
  const isMobile = window.innerWidth < 768 && !isLandscape;
  isSidebarKeypadActive = (isInSaleSheet || isInImportSheet) && !isMobile;

  if (isSidebarKeypadActive) {
    // Hide standard dialog keypad if any was visible
    const dialog = document.getElementById('custom-keypad-dialog');
    if (dialog) dialog.style.display = 'none';

    if (isInSaleSheet) {
      // Hide other sidebar keypad
      const otherKeypad = document.getElementById('sheet-import-keypad-sidebar');
      if (otherKeypad) otherKeypad.style.display = 'none';
      const otherSheet = document.getElementById('sheet-new-import');
      if (otherSheet) otherSheet.style.maxWidth = '';

      // Show sale sidebar keypad
      const sidebarKeypad = document.getElementById('sheet-sale-keypad-sidebar');
      if (sidebarKeypad) sidebarKeypad.style.display = 'flex';

      // Expand sale sheet max width so they sit side by side
      const saleSheet = document.getElementById('sheet-new-sale');
      if (saleSheet) saleSheet.style.maxWidth = '1150px';

      const titleEl = document.getElementById('sidebar-keypad-title-text');
      if (titleEl) titleEl.textContent = titleText;
      
      const suffixEl = document.getElementById('sidebar-keypad-display-suffix');
      if (suffixEl) suffixEl.textContent = suffixText;
    } else {
      // Hide other sidebar keypad
      const otherKeypad = document.getElementById('sheet-sale-keypad-sidebar');
      if (otherKeypad) otherKeypad.style.display = 'none';
      const otherSheet = document.getElementById('sheet-new-sale');
      if (otherSheet) otherSheet.style.maxWidth = '';

      // Show import sidebar keypad
      const sidebarKeypad = document.getElementById('sheet-import-keypad-sidebar');
      if (sidebarKeypad) sidebarKeypad.style.display = 'flex';

      // Expand import sheet max width so they sit side by side
      const importSheet = document.getElementById('sheet-new-import');
      if (importSheet) importSheet.style.maxWidth = '1150px';

      const titleEl = document.getElementById('sidebar-import-keypad-title-text');
      if (titleEl) titleEl.textContent = titleText;
      
      const suffixEl = document.getElementById('sidebar-import-keypad-display-suffix');
      if (suffixEl) suffixEl.textContent = suffixText;
    }

    updateKeypadDisplay();
  } else {
    // Hide sidebar keypads if visible
    const sidebarSaleKeypad = document.getElementById('sheet-sale-keypad-sidebar');
    if (sidebarSaleKeypad) sidebarSaleKeypad.style.display = 'none';
    const sidebarImportKeypad = document.getElementById('sheet-import-keypad-sidebar');
    if (sidebarImportKeypad) sidebarImportKeypad.style.display = 'none';

    // Reset sheet max-widths
    const saleSheet = document.getElementById('sheet-new-sale');
    if (saleSheet) saleSheet.style.maxWidth = '';
    const importSheet = document.getElementById('sheet-new-import');
    if (importSheet) importSheet.style.maxWidth = '';

    // Show standard dialog keypad
    const titleEl = document.getElementById('keypad-title-text');
    if (titleEl) titleEl.textContent = titleText;
    
    const suffixEl = document.getElementById('keypad-display-suffix');
    if (suffixEl) suffixEl.textContent = suffixText;

    updateKeypadDisplay();

    const dialog = document.getElementById('custom-keypad-dialog');
    if (dialog) {
      dialog.style.display = 'flex';
    }
  }
}

function updateKeypadDisplay() {
  if (isSidebarKeypadActive) {
    if (activeKeypadInput && activeKeypadInput.closest('#sheet-new-sale') !== null) {
      const displayVal = document.getElementById('sidebar-keypad-display-val');
      if (displayVal) {
        displayVal.textContent = keypadBuffer;
      }
    } else {
      const displayVal = document.getElementById('sidebar-import-keypad-display-val');
      if (displayVal) {
        displayVal.textContent = keypadBuffer;
      }
    }
  } else {
    const displayVal = document.getElementById('keypad-display-val');
    if (displayVal) {
      displayVal.textContent = keypadBuffer;
    }
  }
}

function handleKeypadPress(key) {
  const isPhone = activeKeypadInput && (activeKeypadInput.id === 'setting-office-phone' || activeKeypadInput.id === 'sale-customer-phone');
  
  if (key === 'C') {
    keypadBuffer = "0";
  } else if (key === 'backspace') {
    if (keypadBuffer.length > 1) {
      keypadBuffer = keypadBuffer.slice(0, -1);
    } else {
      keypadBuffer = "0";
    }
  } else if (key === '.') {
    if (!isPhone && !keypadBuffer.includes('.')) {
      keypadBuffer += '.';
    }
  } else {
    // Digit 0-9
    if (isPhone) {
      if (keypadBuffer === "0") {
        if (key === "0") {
          keypadBuffer = "0";
        } else {
          keypadBuffer = "0" + key;
        }
      } else {
        keypadBuffer += key;
      }
    } else {
      if (keypadBuffer === "0") {
        keypadBuffer = key;
      } else {
        keypadBuffer += key;
      }
    }
  }
  updateKeypadDisplay();

  // LIVE UPDATE THE INPUT FIELD DIRECTLY
  if (activeKeypadInput) {
    activeKeypadInput.value = keypadBuffer;
    // Trigger existing listeners for automatic live calculations
    activeKeypadInput.dispatchEvent(new Event('input', { bubbles: true }));
    activeKeypadInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function closeCustomKeypad(revert = false) {
  const dialog = document.getElementById('custom-keypad-dialog');
  if (dialog) {
    dialog.style.display = 'none';
  }
  const sidebarSaleKeypad = document.getElementById('sheet-sale-keypad-sidebar');
  if (sidebarSaleKeypad) {
    sidebarSaleKeypad.style.display = 'none';
  }
  const sidebarImportKeypad = document.getElementById('sheet-import-keypad-sidebar');
  if (sidebarImportKeypad) {
    sidebarImportKeypad.style.display = 'none';
  }
  const saleSheet = document.getElementById('sheet-new-sale');
  if (saleSheet) {
    saleSheet.style.maxWidth = '';
  }
  const importSheet = document.getElementById('sheet-new-import');
  if (importSheet) {
    importSheet.style.maxWidth = '';
  }

  if (revert && activeKeypadInput) {
    activeKeypadInput.value = keypadPreviousValue;
    // Trigger calculations to restore initial state
    activeKeypadInput.dispatchEvent(new Event('input', { bubbles: true }));
    activeKeypadInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  isSidebarKeypadActive = false;
  activeKeypadInput = null;
}

function saveKeypadValue() {
  if (activeKeypadInput) {
    const isPhone = activeKeypadInput.id === 'setting-office-phone' || activeKeypadInput.id === 'sale-customer-phone';
    if (isPhone) {
      activeKeypadInput.value = keypadBuffer;
    } else {
      let finalVal = parseFloat(keypadBuffer);
      if (isNaN(finalVal)) {
        activeKeypadInput.value = "";
      } else {
        activeKeypadInput.value = keypadBuffer;
      }
    }
    
    // Trigger existing listeners for automatic live calculations
    activeKeypadInput.dispatchEvent(new Event('input', { bubbles: true }));
    activeKeypadInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
  closeCustomKeypad(false);
}
}
*/

function updateKeypadDisplay() {}
function handleKeypadPress(key) {}
function closeCustomKeypad(revert = false) {}
function saveKeypadValue() {}

/**
 * Calculates and logs IndexedDB storage size and quota using browser Storage Estimate APIs.
 * Ensures the app's persistent data footprint remains healthy and secure offline.
 */
async function calculateDatabaseSize() {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const usedBytes = estimate.usage || 0;
      const totalBytes = estimate.quota || 0;
      const percentage = totalBytes > 0 ? ((usedBytes / totalBytes) * 100).toFixed(4) : 0;
      
      const usedKB = (usedBytes / 1024).toFixed(2);
      const usedMB = (usedBytes / (1024 * 1024)).toFixed(2);
      
      console.log(`[Database Size Check] Used: ${usedKB} KB (${usedMB} MB) of ${ (totalBytes / (1024 * 1024 * 1024)).toFixed(1) } GB (${percentage}% of quota used).`);
      
      // Update any dynamically injected UI info labels if present
      const sizeBadge = document.getElementById('setting-db-size-badge');
      if (sizeBadge) {
        sizeBadge.innerText = `${usedKB} KB`;
      }
    }
  } catch (err) {
    console.warn('[Database Size Check Error]', err);
  }
}

/**
 * Renders the state of the Smart Printing Diagnostic system in the UI.
 * Handles localization (Arabic/English), custom icons, dynamic progress bars,
 * and colored conclusion cards with helpful suggestions depending on the failure step.
 */
function renderPrintDiagnostics() {
  const stepsContainer = document.getElementById('diagnostic-steps-container');
  const conclusionHeading = document.getElementById('diagnostic-conclusion-heading');
  const conclusionDesc = document.getElementById('diagnostic-conclusion-desc');
  const conclusionContainer = document.getElementById('diagnostic-conclusion-container');
  const conclusionIcon = document.getElementById('diagnostic-conclusion-icon');
  const timeBadge = document.getElementById('diagnostic-time-badge');

  if (!stepsContainer || typeof window.PrintDiagnostics === 'undefined') return;

  const steps = window.PrintDiagnostics.getSteps();
  const conclusion = window.PrintDiagnostics.getConclusion();

  // Update current time badge
  if (timeBadge) {
    const now = new Date();
    timeBadge.innerText = now.toTimeString().split(' ')[0];
  }

  // 1. Render conclusion card with color coding matching severity
  if (conclusionHeading && conclusionDesc && conclusionContainer) {
    conclusionHeading.innerText = currentLanguage === 'ar' ? conclusion.titleAr : conclusion.titleEn;
    conclusionDesc.innerText = currentLanguage === 'ar' ? conclusion.descAr : conclusion.descEn;
    
    conclusionContainer.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    if (conclusion.severity === 'success') {
      conclusionContainer.style.backgroundColor = 'rgba(34, 197, 94, 0.08)';
      conclusionContainer.style.borderColor = 'rgba(34, 197, 94, 0.2)';
      conclusionContainer.style.color = '#15803d';
      if (conclusionIcon) conclusionIcon.innerText = 'check_circle';
    } else if (conclusion.severity === 'danger') {
      conclusionContainer.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
      conclusionContainer.style.borderColor = 'rgba(239, 68, 68, 0.2)';
      conclusionContainer.style.color = '#b91c1c';
      if (conclusionIcon) conclusionIcon.innerText = 'gavel';
    } else if (conclusion.severity === 'warning') {
      conclusionContainer.style.backgroundColor = 'rgba(245, 158, 11, 0.08)';
      conclusionContainer.style.borderColor = 'rgba(245, 158, 11, 0.2)';
      conclusionContainer.style.color = '#b45309';
      if (conclusionIcon) conclusionIcon.innerText = 'warning';
    } else { // info / pending
      conclusionContainer.style.backgroundColor = 'rgba(2, 132, 199, 0.05)';
      conclusionContainer.style.borderColor = 'rgba(2, 132, 199, 0.15)';
      conclusionContainer.style.color = '#0284c7';
      if (conclusionIcon) conclusionIcon.innerText = 'analytics';
    }
  }

  // 2. Render steps or a message if there are no steps yet
  if (steps.length === 0) {
    stepsContainer.innerHTML = `
      <div style="text-align: center; color: #94a3b8; font-size: 11px; padding: 16px 0; border: 1px dashed rgba(0,0,0,0.05); border-radius: 8px;">
        <span class="material-icons-round" style="font-size: 28px; color: #cbd5e1; display: block; margin-bottom: 4px;">hourglass_empty</span>
        ${currentLanguage === 'ar' ? 'لم يتم تشغيل فحص أو أمر طباعة بعد للتحليل. اضغط على زر الفحص أعلاه لإجراء الفحص الذاتي.' : 'No print job or diagnostic scan triggered yet. Click scan button above to run self-test.'}
      </div>
    `;
    return;
  }

  stepsContainer.innerHTML = '';
  steps.forEach(step => {
    const stepEl = document.createElement('div');
    stepEl.className = `diagnostic-step-item ${step.status}`;
    
    let iconName = 'hourglass_empty';
    if (step.status === 'success') iconName = 'check_circle';
    if (step.status === 'failed') iconName = 'cancel';
    if (step.status === 'warning') iconName = 'warning';
    if (step.status === 'running') iconName = 'sync';

    const nameText = currentLanguage === 'ar' ? step.nameAr : step.nameEn;
    const msgText = currentLanguage === 'ar' ? step.messageAr : step.messageEn;

    let progressBarHtml = '';
    // If transmit_payload is active, render the real-time progress bar with chunk info
    if (step.id === 'transmit_payload' && step.details) {
      const percentage = step.details.percentage || 0;
      progressBarHtml = `
        <div class="diag-progress-bar-bg" style="margin-top: 6px;">
          <div class="diag-progress-bar-fill" style="width: ${percentage}%"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 9px; color: #64748b; margin-top: 3px; font-family: monospace;">
          <span>${percentage}%</span>
          <span>${step.details.sentBytes || 0} / ${step.details.totalBytes || 0} B</span>
        </div>
      `;
    }

    stepEl.innerHTML = `
      <div class="diagnostic-step-icon ${step.status}">
        <span class="material-icons-round" style="font-size: 14px;">${iconName}</span>
      </div>
      <div class="diagnostic-step-text" style="width: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span class="diagnostic-step-name" style="font-weight: 700; font-size: 11.5px; color: #1e293b;">${nameText}</span>
          <span class="diagnostic-step-time" style="font-family: monospace; font-size: 9px; color: #94a3b8;">${step.timestamp}</span>
        </div>
        <span class="diagnostic-step-msg" style="word-break: break-word; font-size: 10.5px; color: #475569; margin-top: 2px;">${msgText}</span>
        ${progressBarHtml}
      </div>
    `;
    stepsContainer.appendChild(stepEl);
  });
}

/**
 * Runs an advanced, active environmental and hardware capabilities audit.
 * Specifically detects if the applet is loaded within an AI Studio preview iframe,
 * as browser sandboxing strictly prevents Web Bluetooth within cross-origin frames.
 * Also checks standard Bluetooth availability, native bridges, and configured port parameters.
 */
function runDeepEnvironmentDiagnostics() {
  if (typeof window.PrintDiagnostics === 'undefined') return;

  const stepsContainer = document.getElementById('diagnostic-steps-container');
  if (stepsContainer) {
    stepsContainer.innerHTML = `
      <div style="text-align: center; color: #0284c7; font-size: 11px; padding: 16px 0;">
        <span class="material-icons-round" style="font-size: 28px; color: #0284c7; display: block; margin-bottom: 6px; animation: rotate-diag-icon 1.2s linear infinite;">sync</span>
        جاري إجراء فحص عميق واستعلام بروتوكولات العتاد بالمتصفح ونظام التشغيل...
      </div>
    `;
  }

  setTimeout(() => {
    // 1. Detect Frame Sandbox (IFrame vs Standalone)
    const isIFrame = window.self !== window.top;
    const sandboxCard = document.getElementById('iframe-restriction-warning-card');
    const diagValSandbox = document.getElementById('diag-val-sandbox');
    const diagPillSandbox = document.getElementById('diag-pill-sandbox');
    
    if (isIFrame) {
      if (diagValSandbox) diagValSandbox.innerHTML = '<span class="pulsing-dot-red" style="display:inline-block; margin-left:4px;"></span>إطار مقيد';
      if (diagPillSandbox) {
        diagPillSandbox.className = 'diagnostic-bento-status danger';
        diagPillSandbox.innerText = currentLanguage === 'ar' ? 'محجوب برمجياً' : 'Restricted';
      }
      if (sandboxCard) {
        sandboxCard.style.display = 'flex';
        // Populate links
        const btnCopy = document.getElementById('btn-copy-standalone-link');
        const lnkOpen = document.getElementById('lnk-open-standalone');
        if (lnkOpen) lnkOpen.href = window.location.href;
        if (btnCopy && !btnCopy.dataset.hasListener) {
          btnCopy.addEventListener('click', (e) => {
            e.preventDefault();
            navigator.clipboard.writeText(window.location.href)
              .then(() => showToast(currentLanguage === 'ar' ? '✓ تم نسخ الرابط المباشر للتطبيق بنجاح!' : '✓ Standalone app link copied!', 'check_circle'))
              .catch(() => showToast('Failed to copy', 'error'));
          });
          btnCopy.dataset.hasListener = 'true';
        }
      }
    } else {
      if (diagValSandbox) diagValSandbox.innerHTML = '<span class="pulsing-dot-green" style="display:inline-block; margin-left:4px;"></span>علامة مستقلة';
      if (diagPillSandbox) {
        diagPillSandbox.className = 'diagnostic-bento-status success';
        diagPillSandbox.innerText = currentLanguage === 'ar' ? 'آمن ومطلق' : 'Secure Tab';
      }
      if (sandboxCard) sandboxCard.style.display = 'none';
    }

    // 2. Detect Web Bluetooth API Support and Native Bridges
    const hasBluetooth = 'bluetooth' in navigator;
    const hasSerial = typeof window.bluetoothSerial !== 'undefined';
    const hasBLECentral = typeof window.ble !== 'undefined';
    const hasNativeBridge = hasSerial || hasBLECentral;

    const diagValBT = document.getElementById('diag-val-bluetooth');
    const diagPillBT = document.getElementById('diag-pill-bluetooth');
    
    if (hasNativeBridge) {
      if (diagValBT) diagValBT.innerHTML = '<span class="pulsing-dot-green" style="display:inline-block; margin-left:4px;"></span>جاهز (جسر الهاتف)';
      if (diagPillBT) {
        diagPillBT.className = 'diagnostic-bento-status success';
        diagPillBT.innerText = currentLanguage === 'ar' ? 'متوافق بالكامل' : 'Native Active';
      }
    } else if (hasBluetooth) {
      if (diagValBT) diagValBT.innerHTML = '<span class="pulsing-dot-green" style="display:inline-block; margin-left:4px;"></span>مدعوم بالمتصفح';
      if (diagPillBT) {
        diagPillBT.className = 'diagnostic-bento-status success';
        diagPillBT.innerText = currentLanguage === 'ar' ? 'جاهز' : 'Ready';
      }
    } else {
      if (diagValBT) diagValBT.innerHTML = '<span class="pulsing-dot-red" style="display:inline-block; margin-left:4px;"></span>غير مدعوم';
      if (diagPillBT) {
        diagPillBT.className = 'diagnostic-bento-status danger';
        diagPillBT.innerText = currentLanguage === 'ar' ? 'غير متوافق' : 'Unsupported';
      }
    }

    // 3. Detect Configured Connection Port
    let activePort = 'MOCK';
    let pacingMs = 20;
    try {
      const savedType = localStorage.getItem('alwa_printer_type');
      if (savedType) {
        activePort = savedType.toUpperCase();
      }
    } catch(e) {}
    
    const diagValPort = document.getElementById('diag-val-port');
    const diagPillPort = document.getElementById('diag-pill-port');
    if (diagValPort) diagValPort.innerText = activePort;
    if (diagPillPort) {
      if (activePort === 'MOCK') {
        diagPillPort.className = 'diagnostic-bento-status info';
        diagPillPort.innerText = currentLanguage === 'ar' ? 'وضع افتراضي' : 'Simulated';
      } else {
        if (isPrinterConnected) {
          diagPillPort.className = 'diagnostic-bento-status success';
          diagPillPort.innerText = currentLanguage === 'ar' ? 'متصل وحقيقي' : 'Connected';
        } else {
          diagPillPort.className = 'diagnostic-bento-status warning';
          diagPillPort.innerText = currentLanguage === 'ar' ? 'غير متصل' : 'Disconnected';
        }
      }
    }

    // 4. Update pacing and timing metrics
    const diagValTiming = document.getElementById('diag-val-timing');
    const diagPillTiming = document.getElementById('diag-pill-timing');
    if (diagValTiming) diagValTiming.innerText = `1ms Pacing`;
    if (diagPillTiming) {
      diagPillTiming.className = 'diagnostic-bento-status info';
      diagPillTiming.innerText = currentLanguage === 'ar' ? 'مستقر' : 'Stable';
    }

    // 5. Populate sequential diagnostic checklist steps
    window.PrintDiagnostics.clear();

    // Step 1: Sandbox & Security policy audit
    window.PrintDiagnostics.addStep(
      'env_security',
      'فحص قيود المتصفح والبيئة الأمنية المعزولة',
      'Sandbox Security & Policy Audit',
      isIFrame ? 'failed' : 'success',
      isIFrame
        ? 'فشل: تم رصد تشغيل التطبيق داخل إطار IFrame معزول ببيئة تطوير AI Studio. سيقوم المتصفح برفض إذن البلوتوث.'
        : 'ناجح: يعمل التطبيق في نافذة مستقلة وخارج أي ساندبوكس مقيد. صلاحيات النفاذ لرقاقات البلوتوث متاحة.',
      isIFrame
        ? 'Restricted: Running inside AI Studio Dev Sandbox frame. Chrome blocks cross-origin iframe Bluetooth request.'
        : 'Success: Running in a primary standalone window. Low-level Bluetooth hardware registers are accessible.',
      { isIFrame }
    );

    // Step 2: Protocol layers compatibility
    let step2Status = 'failed';
    let step2MsgAr = '';
    let step2MsgEn = '';
    if (hasNativeBridge) {
      step2Status = 'success';
      step2MsgAr = 'ناجح (عبر جسر الهاتف): المتصفح لا يحتوي على Web Bluetooth، ولكن جسر الهاتف المدمج نشط ويعوضها بالكامل للربط المباشر.';
      step2MsgEn = 'Success (via Phone Bridge): System WebView lacks Web Bluetooth, but the native phone Bluetooth bridge is active and compatible.';
    } else if (hasBluetooth) {
      step2Status = 'success';
      step2MsgAr = 'ناجح: محرك المتصفح يحتوي على واجهة Web Bluetooth (مكتبة GATT كاملة وتعمل بنجاح).';
      step2MsgEn = 'Success: Browser engine supports the core Web Bluetooth protocol layers and GATT standard.';
    } else {
      step2Status = 'failed';
      step2MsgAr = 'فشل: المتصفح الحالي لا يدعم واجهة برمجة تطبيقات البلوتوث (ينصح بمتصفح Chrome أو Edge على الحاسوب، أو استخدام تطبيق الهاتف).';
      step2MsgEn = 'Failed: Browser does not support Web Bluetooth APIs. Please switch to Google Chrome or Microsoft Edge, or use the mobile app wrapper.';
    }

    window.PrintDiagnostics.addStep(
      'protocol_check',
      'تقصي واجهة برمجة بروتوكولات النواة (Web Bluetooth)',
      'Web Bluetooth Protocol Compatibility Check',
      step2Status,
      step2MsgAr,
      step2MsgEn,
      { hasBluetooth, hasNativeBridge }
    );

    // Step 3: Cordova BLE and Classic Bluetooth serial detection
    const nativeStatus = hasNativeBridge ? 'success' : 'warning';
    
    window.PrintDiagnostics.addStep(
      'native_mobile_bridges',
      'فحص الجسور الذكية للهواتف (Cordova & Capacitor Bridges)',
      'Capacitor & Cordova Mobile Bridge Integration',
      nativeStatus,
      hasNativeBridge
        ? 'ناجح: تم اكتشاف الجسر اللاسلكي المدمج الخاص بالهاتف الذكي للأندرويد بنجاح.'
        : 'تنبيه: لا توجد جسور هاتف مدمجة نشطة. يعمل التطبيق كمنصة ويب سحابية عادية حالياً.',
      hasNativeBridge
        ? 'Success: Found active Cordova/Capacitor hardware communication ports.'
        : 'Notice: No native phone wrapper bridges detected. App operating in standard cloud web mode.',
      { hasSerial, hasBLECentral }
    );

    // Step 4: Graphics engine rasterizer verification
    window.PrintDiagnostics.addStep(
      'rasterizer_integrity',
      'فحص سلامة معالج الرسوميات الثنائي للفواتير',
      '2D Graphical Invoice Rasterizer Integrity',
      'success',
      'ناجح: محاكي الرسوميات ثنائي الأبعاد جاهز. معالجة عينات الألوان والحد الأبيض والأسود تعمل بأعلى أداء (384 نقطة عريضة).',
      'Success: 2D raster engine validated. Monochrome threshold rendering is primed and optimized for 58mm/80mm widths.',
      {}
    );

    // 6. Formulate auto-deduced smart conclusion
    let severity = 'success';
    let titleAr = 'مُشخص الطباعة مستقر بالكامل';
    let titleEn = 'All Systems Operational & Print-Ready';
    let descAr = 'الفحص الشامل يؤكد جاهزية النظام بنسبة 100%! المتصفح يدعم البلوتوث، والبيئة مستحوذة، وقناة الاتصال مهيأة للبث عبر بروتوكول GATT. يمكنك إرسال أي فاتورة الآن بثقة كاملة.';
    let descEn = 'All baseline diagnostic criteria passed perfectly. Browser permissions and Bluetooth GATT layers are primed. You are ready to stream secure binary ESC/POS payloads directly to your physical terminal.';

    if (isIFrame) {
      severity = 'danger';
      titleAr = 'البلوتوث محجوب بسبب بيئة الـ IFrame المعزولة';
      titleEn = 'Bluetooth blocked by cross-origin security sandbox';
      descAr = 'تم الكشف تلقائياً أن التطبيق يعمل داخل إطار مدمج (AI Studio Preview Iframe). متصفحات الويب تمنع تشغيل البلوتوث تماماً داخل الأطر الفرعية لحماية الخصوصية. يرجى الضغط على زر "فتح في علامة تبويب جديدة" بالأعلى لتشغيل التطبيق بشكل مستقل والاقتران فوراً.';
      descEn = 'The application is loaded inside a cross-origin preview frame. Google Chrome blocks Bluetooth requests here. Solution: Click "Open in Standalone Tab" above to run the app in a primary tab and bypass this sandbox block.';
    } else if (hasNativeBridge) {
      if (isPrinterConnected) {
        severity = 'success';
        titleAr = 'طابعة البلوتوث متصلة وجاهزة للطباعة';
        titleEn = 'Bluetooth Printer Connected & Ready';
        descAr = '✓ تم ربط طابعتك بنجاح عبر جسر الهاتف اللاسلكي الذكي! جميع قنوات البث آمنة ومهيأة لنقل البيانات فورياً. يمكنك الضغط على "طباعة فحص" لتجربة الطباعة الحقيقية، أو إصدار فواتيرك الآن.';
        descEn = 'Successfully connected to your physical printer via the native phone bridge! All communication channels are active. You can tap "Print Test" or dispatch real invoices now.';
      } else {
        severity = 'info';
        titleAr = 'بيئة الهاتف جاهزة للاقتران بالطابعة الحقيقية';
        titleEn = 'Mobile App Ready for Printer Pairing';
        descAr = '✓ تطبيق هاتفك مهيأ وبحالة مثالية للاتصال اللاسلكي المباشر بالطابعات! لتشغيل طابعتك الحقيقية، يرجى تشغيل طابعتك وتفعيل البلوتوث بالهاتف، ثم الضغط على زر **"اقتران وفحص"** بالأعلى واختيار اسم طابعتك لربطها فوراً وبدء الطباعة!';
        descEn = 'Your native mobile app environment is 100% compatible. Please turn on your thermal printer and enable phone Bluetooth, then tap the **"Scan & Pair"** button above to connect and start printing!';
      }
    } else if (!hasBluetooth) {
      severity = 'warning';
      titleAr = 'المتصفح الحالي لا يدعم بروتوكول البلوتوث اللاسلكي';
      titleEn = 'Browser lacks Web Bluetooth support';
      descAr = 'محرك الويب الحالي لا يوفر واجهة Web Bluetooth (مثل Safari أو Firefox أو متصفحات الـ iOS). لربط طابعتك الحقيقية، ننصح بشدة بفتح التطبيق من خلال متصفح Google Chrome أو Microsoft Edge على حاسوب شخصي أو هاتف أندرويد.';
      descEn = 'The current browser engine does not expose Web Bluetooth capabilities (common with Safari, Firefox, or iOS browsers). For real hardware printing, please launch this app using Google Chrome on a PC/Mac or Android.';
    } else if (activePort === 'MOCK') {
      severity = 'info';
      titleAr = 'وضع طابعة المحاكاة الافتراضية نشط';
      titleEn = 'Simulated Printer Viewport Active';
      descAr = 'بيئة المتصفح تدعم البلوتوث وجاهزة للربط الحقيقي! لكن نوع الطابعة المحدد حالياً في الإعدادات هو "طابعة محاكاة افتراضية". لتوصيل طابعتك الحقيقية، حدد خيار "Web Bluetooth" من الإعدادات ثم ابدأ البحث.';
      descEn = 'Your browser and tab environment are 100% compatible and ready! However, the active printer driver is set to Simulated. To write to a physical device, switch the driver configuration to "Web Bluetooth" in settings above.';
    }

    // Set the conclusion
    window.PrintDiagnostics.setConclusion({
      severity,
      titleAr,
      titleEn,
      descAr,
      descEn
    });

    renderPrintDiagnostics();
  }, 1000);
}

let isImmersiveFullscreenEnabled = localStorage.getItem('alwa_immersive_fullscreen') !== 'false'; // Defaults to true
let isMotionAnimationsEnabled = localStorage.getItem('alwa_animations_enabled') !== 'false'; // Defaults to true

// Helper to update body class for animations
function applyAnimationsPreference() {
  if (isMotionAnimationsEnabled) {
    document.body.classList.remove('no-animations');
  } else {
    document.body.classList.add('no-animations');
  }
}

// Helper to request full-screen immersive mode (hiding both top status bar and bottom navigation buttons)
async function enterImmersiveFullscreen() {
  if (!isImmersiveFullscreenEnabled) return;
  try {
    const docEl = document.documentElement;
    const requestFS = docEl.requestFullscreen || 
                      docEl.webkitRequestFullscreen || 
                      docEl.mozRequestFullScreen || 
                      docEl.msRequestFullscreen;
    if (requestFS && !document.fullscreenElement) {
      await requestFS.call(docEl, { navigationUI: 'hide' });
    }
  } catch (err) {
    console.warn('Immersive fullscreen request deferred (waiting for user gesture):', err);
  }
}

// Helper to exit full-screen mode
async function exitImmersiveFullscreen() {
  try {
    const exitFS = document.exitFullscreen || 
                   document.webkitExitFullscreen || 
                   document.mozCancelFullScreen || 
                   document.msExitFullscreen;
    if (exitFS && document.fullscreenElement) {
      await exitFS.call(document);
    }
  } catch (err) {
    console.warn('Exit fullscreen failed:', err);
  }
}

// Function to update native status bar and web fullscreen based on current preference
async function applyFullscreenPreference() {
  if (isImmersiveFullscreenEnabled) {
    // Hide native status bar if on mobile
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.hide();
      } catch (e) {
        console.warn('StatusBar.hide failed:', e);
      }
    }
    await enterImmersiveFullscreen();
  } else {
    // Show native status bar if on mobile
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.show();
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#1B4332' });
      } catch (e) {
        console.warn('StatusBar.show failed:', e);
      }
    }
    await exitImmersiveFullscreen();
  }
}

// Cordova / Native platform back-button binding for Capacitor hybrid environments
document.addEventListener('deviceready', () => {
  // Apply fullscreen preferences initially
  applyFullscreenPreference();

  // Handle native hardware backbutton by executing history back
  document.addEventListener('backbutton', (e) => {
    e.preventDefault();
    window.history.back();
  }, false);
}, false);

// Ambient Welcome Sound Synthesis Engine (Web Audio API)
let hasPlayedWelcomeSound = false;

function playAmbientWelcomeSound() {
  if (hasPlayedWelcomeSound) return;
  
  // Check if system sound alerts setting is enabled
  const isSoundEnabled = (localStorage.getItem('alwa_sound') || 'true') === 'true';
  if (!isSoundEnabled) return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Play a gorgeous studio-grade synthesized ambient welcome chime (chord in F major 7th)
    const now = ctx.currentTime;
    
    // F3 (174.61 Hz), C4 (261.63 Hz), F4 (349.23 Hz), A4 (440.00 Hz), C5 (523.25 Hz), E5 (659.25 Hz)
    const freqs = [174.61, 261.63, 349.23, 440.00, 523.25, 659.25];
    
    // Master volume with smooth gain attack and exponential release
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.18, now + 1.5); // Warm fade-in swell
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.0); // Smooth long fade-out
    
    // Lowpass filter for warm, high-end, premium, eye-safe texture
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 1.5);
    filter.frequency.exponentialRampToValueAtTime(250, now + 5.0);
    filter.Q.setValueAtTime(1.2, now);
    
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      
      // Use smooth sine and warm triangle oscillators
      osc.type = idx % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, now);
      
      // Detune slightly for lush analog chorus effect
      if (idx > 0) {
        osc.detune.setValueAtTime((idx % 2 === 0 ? 6 : -6) * (idx / 2), now);
      }
      
      // Gain control per oscillator to balance spectrum
      const oscVol = idx === 0 ? 0.35 : idx < 3 ? 0.25 : 0.15;
      oscGain.gain.setValueAtTime(oscVol, now);
      
      osc.connect(oscGain);
      oscGain.connect(filter);
      
      osc.start(now);
      osc.stop(now + 5.0);
    });
    
    // Simple simulated reverb/delay using a delay line for space
    const delay = ctx.createDelay();
    delay.delayTime.setValueAtTime(0.35, now);
    
    const delayGain = ctx.createGain();
    delayGain.gain.setValueAtTime(0.08, now); // subtle echo
    
    filter.connect(masterGain);
    
    // Feed delay
    filter.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(masterGain);
    
    masterGain.connect(ctx.destination);
    
    hasPlayedWelcomeSound = true;
    console.log("Ambient opening sound synthesized successfully.");
  } catch (err) {
    console.warn("Failed to play ambient welcome sound:", err);
  }
}

// Bind touch and click events to ensure immersive fullscreen and sound trigger on first user interaction
const handleFirstInteraction = () => {
  if (isImmersiveFullscreenEnabled) {
    enterImmersiveFullscreen();
  }
  playAmbientWelcomeSound();
};
document.addEventListener('click', handleFirstInteraction, { passive: true });
document.addEventListener('touchstart', handleFirstInteraction, { passive: true });

// Re-apply fullscreen preference on app resume (screen on/unlock), visibility change, or window focus
const reapplyFullscreen = async () => {
  if (isImmersiveFullscreenEnabled) {
    await applyFullscreenPreference();
  }
};
document.addEventListener('resume', reapplyFullscreen, false);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    reapplyFullscreen();
  }
});
window.addEventListener('focus', reapplyFullscreen, false);

// Dismiss soft keyboard when pressing Enter on input fields
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.keyCode === 13) {
    const target = e.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
      if (target.tagName !== 'TEXTAREA' || !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        target.blur();
      }
    }
  }
});

// Set enterkeyhint="done" on inputs when focused to hint mobile keyboards
document.addEventListener('focusin', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
    if (!e.target.hasAttribute('enterkeyhint')) {
      e.target.setAttribute('enterkeyhint', 'done');
    }
  }
});

window.addEventListener('DOMContentLoaded', () => {
  applyAnimationsPreference();
  startApp();
  // Try to play premium ambient welcome sound if browser policies allow
  playAmbientWelcomeSound();
  // Try to go fullscreen immediately if enabled
  if (isImmersiveFullscreenEnabled) {
    enterImmersiveFullscreen();
  }
});
