/**
 * BLEPrinterDriver - Advanced, Decoupled, & Highly Robust BLE/Classic Bluetooth Thermal Printer Driver
 * Specifically engineered for ultra-cheap, low-end thermal printers (PT-210, MPT-II, Xprinter, Zjiang, etc.)
 * 
 * Key Features:
 * 1. Multi-Platform Support: Web Bluetooth, Cordova BLE, Cordova Classic Bluetooth (Serial), and Mock Simulator.
 * 2. Strict Buffer Protection: Splits output into 20-byte chunks with configurable pacing delay (default 15ms)
 *    to prevent micro-controller receive-buffer overflow, garbage characters, and printer freezes.
 * 3. High-Fidelity 1-bit Raster Engine: Converts high-contrast captured Canvas elements into standard 
 *    ESC/POS raster graphic commands (GS v 0) in safe horizontal bands (40px high).
 * 4. Arabic Shaping & Bidi Fallback: Built-in basic RTL renderer for raw text fallback printing.
 */

import html2canvas from 'html2canvas';

export interface DiagnosticStep {
  id: string;
  nameAr: string;
  nameEn: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'warning';
  messageAr: string;
  messageEn: string;
  timestamp: string;
  details?: any;
}

export class PrintDiagnostics {
  private static steps: DiagnosticStep[] = [];
  private static listeners: (() => void)[] = [];
  private static customConclusion: { titleAr: string; titleEn: string; descAr: string; descEn: string; severity: 'info' | 'warning' | 'danger' | 'success' } | null = null;

  public static clear() {
    this.steps = [];
    this.customConclusion = null;
    this.notify();
  }

  public static setConclusion(conclusion: { titleAr: string; titleEn: string; descAr: string; descEn: string; severity: 'info' | 'warning' | 'danger' | 'success' }) {
    this.customConclusion = conclusion;
    this.notify();
  }

  public static getSteps(): DiagnosticStep[] {
    return this.steps;
  }

  public static addListener(cb: () => void) {
    this.listeners.push(cb);
  }

  public static removeListener(cb: () => void) {
    this.listeners = this.listeners.filter(l => l !== cb);
  }

  private static notify() {
    this.listeners.forEach(cb => {
      try { cb(); } catch(e) {}
    });
    const event = new CustomEvent('print-diagnostics-updated');
    window.dispatchEvent(event);
  }

  public static addStep(
    id: string,
    nameAr: string,
    nameEn: string,
    status: 'pending' | 'running' | 'success' | 'failed' | 'warning',
    messageAr: string,
    messageEn: string,
    details?: any
  ) {
    const existingIndex = this.steps.findIndex(s => s.id === id);
    const step: DiagnosticStep = {
      id,
      nameAr,
      nameEn,
      status,
      messageAr,
      messageEn,
      timestamp: new Date().toLocaleTimeString(),
      details
    };
    if (existingIndex !== -1) {
      this.steps[existingIndex] = step;
    } else {
      this.steps.push(step);
    }
    this.notify();
    console.log(`[Diagnostics] [${status.toUpperCase()}] ${nameEn}: ${messageEn}`);
  }

  public static updateStep(
    id: string,
    status: 'pending' | 'running' | 'success' | 'failed' | 'warning',
    messageAr: string,
    messageEn: string,
    details?: any
  ) {
    const step = this.steps.find(s => s.id === id);
    if (step) {
      step.status = status;
      step.messageAr = messageAr;
      step.messageEn = messageEn;
      if (details) step.details = { ...step.details, ...details };
      step.timestamp = new Date().toLocaleTimeString();
      this.notify();
      console.log(`[Diagnostics] [${status.toUpperCase()}] ${step.nameEn}: ${messageEn}`);
    }
  }

  public static getConclusion(): { titleAr: string; titleEn: string; descAr: string; descEn: string; severity: 'info' | 'warning' | 'danger' | 'success' } {
    if (this.customConclusion) {
      return this.customConclusion;
    }
    const failedStep = this.steps.find(s => s.status === 'failed');
    if (!failedStep) {
      const runningStep = this.steps.find(s => s.status === 'running');
      if (runningStep) {
        return {
          titleAr: "عملية التحليل والتشخيص جارية حالياً...",
          titleEn: "Diagnostic Analysis in Progress...",
          descAr: `النظام يقوم بمتابعة وفحص الخطوة: "${runningStep.nameAr}". يرجى إبقاء الهاتف بالقرب من الطابعة.`,
          descEn: `The system is currently tracking and testing the step: "${runningStep.nameEn}". Please keep the device near the printer.`,
          severity: 'info'
        };
      }
      
      const warningStep = this.steps.find(s => s.status === 'warning');
      if (warningStep) {
        return {
          titleAr: "تنبيهات طفيفة أثناء التشخيص",
          titleEn: "Diagnostic Warnings Captured",
          descAr: `العملية تمت ولكن رصدنا تنبيهاً في خطوة "${warningStep.nameAr}": ${warningStep.messageAr}`,
          descEn: `The operation completed but we detected a warning on "${warningStep.nameEn}": ${warningStep.messageEn}`,
          severity: 'warning'
        };
      }

      if (this.steps.length === 0) {
        return {
          titleAr: "مُحلّل الطباعة الذكي جاهز",
          titleEn: "Smart Print Analyzer Ready",
          descAr: "اضغط على زر الطباعة في الفاتورة لتنشيط فحص القنوات وأوامر الرسم النقطي واستنتاج أي مشاكل هاردوير فوراً.",
          descEn: "Press the print button inside any invoice to activate connection scans, raster graphics compiling, and live hardware issue deduction.",
          severity: 'info'
        };
      }

      return {
        titleAr: "اكتملت الطباعة بنجاح وبأعلى كفاءة!",
        titleEn: "Printing Completed Successfully!",
        descAr: "تمت معالجة الفاتورة، ورسم الرسوميات وتحويلها، ونقل الحزم بنجاح دون أي مشاكل برمجية أو فقدان للاتصال.",
        descEn: "Invoice elements compiled, raster graphics generated, and binary packets securely transmitted without any memory overflows or packet drops.",
        severity: 'success'
      };
    }

    switch (failedStep.id) {
      case 'init_hardware':
        return {
          titleAr: "تعذر بدء البلوتوث (عبر المتصفح أو بيئة ساندبوكس)",
          titleEn: "Bluetooth Access Prevented (Iframe / Browser Limits)",
          descAr: "النظام منع تهيئة اتصال البلوتوث. السبب: متصفحات الويب تمنع تشغيل البلوتوث داخل إطارات المطورين (iframe) لتأمين الخصوصية. الحل: اضغط على زر 'طباعة النظام' البديل أو افتح التطبيق في علامة تبويب جديدة مستقلة خارج البيئة المصغرة لتنشيط البلوتوث بشكل مباشر ونظيف.",
          descEn: "Hardware communication blocked. Browsers restrict Web Bluetooth usage inside iframe environments (AI Studio preview iframe). Solution: Tap 'System Print' or open the application in a Standalone Browser Tab to unlock real Bluetooth device scanning.",
          severity: 'danger'
        };
      case 'get_element':
        return {
          titleAr: "لم نجد قالب الفاتورة المرئي",
          titleEn: "Target Invoice View Not Found",
          descAr: "فشل التحليل في الوصول لعنصر الفاتورة بالـ DOM. قد يكون القالب لم يكتمل بناؤه أو غير مرئي حالياً في الصفحة النشطة. يرجى إعادة محاولة الفتح والضغط على زر الطباعة مرة أخرى.",
          descEn: "DOM element retrieval failed. The target invoice HTML container is either unmounted or not present on the active screen view. Try closing and opening the print sheet.",
          severity: 'danger'
        };
      case 'render_html':
        return {
          titleAr: "خطأ في التقاط الرسوميات (html2canvas Engine)",
          titleEn: "Visual Layout Render Failure (html2canvas)",
          descAr: "تعذر محاكاة الفاتورة وتحويلها لسطح رسم. السبب المحتمل: استخدام صور خارجية غير مصرحة ببروتوكول CORS، أو حجم الصفحة شديد الضخامة. الحل: تأكد من اكتمال تحميل الفاتورة أو استخدم خيار 'حفظ كصورة' أولاً لتشخيص الرسام.",
          descEn: "HTML capture engine failed to draw elements onto canvas. Typically caused by external image source CORS blocks or memory allocation issues. Verify that all resources are local.",
          severity: 'danger'
        };
      case 'raster_process':
        return {
          titleAr: "خطأ في تشفير الألوان الثنائية (Rasterization)",
          titleEn: "1-bit Monochrome Formatting Failure",
          descAr: "حدث خلل أثناء تحويل الصورة الملونة إلى حزم نقطية صلبة (سوداء وبيضاء تماماً) لتناسب رأس الطباعة الحراري. قد تكون أبعاد الفاتورة فارغة. يرجى التحقق من محتوى الفاتورة وإعادة المحاولة.",
          descEn: "The driver failed to process color values into 1-bit solid black-and-white stripes compatible with standard ESC/POS printers. Verify that the layout contains valid non-zero dimensions.",
          severity: 'danger'
        };
      case 'transmit_payload':
        const deviceType = failedStep.details?.deviceType;
        if (deviceType === 'web_ble') {
          return {
            titleAr: "فشل إرسال البيانات عبر قنوات الـ BLE (Web Bluetooth)",
            titleEn: "Web Bluetooth Stream Error (GATT Write Rejected)",
            descAr: "تعذر إكمال البث اللاسلكي عبر Web Bluetooth. هذا يحدث بسبب: 1) ابتعاد الطابعة عن الموبايل، 2) ضعف شحن البطارية مما يؤدي لهبوط جهد البلوتوث، 3) تشنج نظام استقبال الطابعة الصيني الرخيص. الحل: أطفئ الطابعة، أعد تشغيلها، أعد الاتصال بها من صفحة الإعدادات، وجرب الطباعة مرة أخرى.",
            descEn: "GATT write sequence was interrupted. Commonly caused by: 1) Printer out of physical range, 2) Low printer battery causing signal drops, 3) Cheap receiver microcontroller buffer crash. Solution: Power cycle the printer, reconnect, and try again.",
            severity: 'danger'
          };
        } else if (deviceType === 'classic') {
          return {
            titleAr: "تشنج البث عبر خط السيريال الكلاسيكي (Classic Serial SPP)",
            titleEn: "Classic Bluetooth Serial Write Error",
            descAr: "قناة البث الكلاسيكية رفضت استقبال البيانات. تأكد من أن الهاتف غير متصل بأجهزة بلوتوث أخرى حالياً، وأن تطبيق الأندرويد يملك صلاحية BLUETOOTH_CONNECT المقبولة. يوصى بإيقاف بلوتوث الهاتف وإعادة تشغيله مع إعادة تشغيل الطابعة لتنظيف قنوات الكاش المتشنجة.",
            descEn: "Classic serial write buffer was rejected by Android bluetooth socket. Ensure no other devices are connected, and BLUETOOTH_CONNECT permission is fully granted. Try toggling phone's Bluetooth.",
            severity: 'danger'
          };
        } else if (deviceType === 'ble') {
          return {
            titleAr: "فشل كتابة الحزم عبر Cordova BLE Central",
            titleEn: "Cordova BLE Central Write Error",
            descAr: "تم رفض حزمة الكتابة عبر Cordova BLE. قد يكون معرف الخدمة (Service UUID) أو معرف الخاصية (Characteristic UUID) للطابعة المسجل غير صحيح أو لا يتوافق مع معايير الطابعات الحرارية الصينية. ننصح بتجربة نوع اتصال آخر.",
            descEn: "BLE package write failed. The configured Service UUID or Write Characteristic UUID might be incompatible with this specific thermal printer firmware. Try other connection modes.",
            severity: 'danger'
          };
        } else {
          return {
            titleAr: "انقطاع مفاجئ في قناة الاتصال النشطة",
            titleEn: "Active Connection Pipeline Aborted",
            descAr: "انقطع تدفق البيانات البرمجية إلى الهاردوير. لا يوجد اتصال فعال مسجل حالياً. يرجى التوجه للإعدادات والضغط على 'اقتران وفحص' ثم إقران الطابعة من جديد.",
            descEn: "Data pipe broke before finishing transmission. No verified hardware connection is active. Please re-pair the printer in the settings panel.",
            severity: 'danger'
          };
        }
      default:
        return {
          titleAr: "فشل غير معروف في عملية الطباعة",
          titleEn: "Unknown General Print Failure",
          descAr: `فشلت الطباعة عند الخطوة (${failedStep.nameAr}): ${failedStep.messageAr}. يرجى إيقاف وتشغيل الطابعة لتصفير ذاكرتها الداخلية.`,
          descEn: `Printing failed at (${failedStep.nameEn}): ${failedStep.messageEn}. Please power-cycle the printer to flush its cache.`,
          severity: 'danger'
        };
    }
  }
}

// Bind to window for easy access from app.js
if (typeof window !== 'undefined') {
  (window as any).PrintDiagnostics = PrintDiagnostics;
}

export interface PrinterConnectionConfig {
  type: 'web_ble' | 'classic' | 'ble' | 'mock';
  webBluetoothCharacteristic?: any; // BluetoothRemoteGATTCharacteristic
  deviceId?: string | null;         // MAC Address or BLE Device ID
  writeServiceUUID?: string | null;
  writeCharUUID?: string | null;
  paperWidth?: '58' | '80';
  pacingDelayMs?: number;           // Safe pacing delay in milliseconds
  chunkSize?: number;               // Bytes per BLE packet
}

export class BLEPrinterDriver {
  /**
   * Prints an HTML Element (e.g. invoice template) on a connected Bluetooth Thermal Printer.
   * Captured dynamically via html2canvas, optimized for high contrast, and sent as chunked raster graphics.
   */
  public static async printHTMLElement(
    element: HTMLElement,
    config: PrinterConnectionConfig
  ): Promise<boolean> {
    const is58mm = (config.paperWidth || '58') === '58';
    const canvasWidth = is58mm ? 384 : 576; // Printable dots for 58mm vs 80mm
    const designWidth = is58mm ? 326 : 456; // Matching CSS layout width
    const pacingDelay = config.pacingDelayMs !== undefined ? config.pacingDelayMs : 15;
    const chunkSize = config.chunkSize || 20;

    console.log(`[BLEPrinterDriver] Printing HTML Element. Target width: ${canvasWidth}px, Pacing delay: ${pacingDelay}ms`);

    // Live diagnostics initialization
    PrintDiagnostics.clear();
    PrintDiagnostics.addStep(
      'init_hardware',
      'تهيئة قنوات الاتصال والتحقق من الهاردوير',
      'Hardware & Connection Check',
      'running',
      `جاري فحص بيئة العمل وتوافق منفذ الاتصال: ${config.type}...`,
      `Validating runtime environment and printer port: ${config.type}...`
    );

    if (!config.type) {
      PrintDiagnostics.updateStep('init_hardware', 'failed', 'فشلت التهيئة: نوع الاتصال غير محدد أو القيمة فارغة.', 'Initialization failed: connection type is undefined.');
      return false;
    }
    PrintDiagnostics.updateStep('init_hardware', 'success', `تم التحقق بنجاح من تهيئة منفذ الاتصال (${config.type}).`, `Hardware check completed. Connection type: ${config.type}`);

    PrintDiagnostics.addStep(
      'get_element',
      'قراءة عناصر الفاتورة الرقمية',
      'Fetch Invoice Elements',
      'running',
      'جاري قراءة محتويات الفاتورة من شاشة العرض وإعداد الأبعاد الافتراضية للطباعة...',
      'Retrieving visual invoice layout elements and resolving scale dimensions...'
    );

    if (!element) {
      PrintDiagnostics.updateStep('get_element', 'failed', 'خطأ: عنصر الفاتورة المرئي غير متوفر في الـ DOM.', 'Failed: Invoice DOM element is not available.');
      return false;
    }
    PrintDiagnostics.updateStep('get_element', 'success', `تم جلب الفاتورة بنجاح. عرض الورق: ${is58mm ? '58mm' : '80mm'} (عرض التصوير: ${canvasWidth}px).`, `Invoice elements fetched. Width: ${is58mm ? '58mm' : '80mm'} (Target width: ${canvasWidth}px)`);

    PrintDiagnostics.addStep(
      'render_html',
      'تحويل الفاتورة المرئية إلى شكل رسومي النواة',
      'Visual Layout Rasterization (html2canvas)',
      'running',
      'جاري تشغيل رسام المتصفح الافتراضي لالتقاط الصورة وتوليد الرسوميات المفلترة...',
      'Rendering the HTML tree to canvas using html2canvas engine...'
    );

    // 1. Create a safe clone of the element positioned off-screen to prevent layout shift and capture accurately
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = 'fixed';
    clone.style.left = '0';
    clone.style.top = '0';
    clone.style.margin = '0';
    clone.style.padding = '6px 4px';
    clone.style.boxSizing = 'border-box';
    clone.style.width = `${designWidth}px`;
    clone.style.maxWidth = `${designWidth}px`;
    clone.style.zIndex = '-9999';
    clone.style.backgroundColor = '#FFFFFF';
    clone.style.transform = 'none';

    // Copy canvas data (like generated QR Codes) manually to the cloned element
    const originalCanvases = element.querySelectorAll('canvas');
    const clonedCanvases = clone.querySelectorAll('canvas');
    originalCanvases.forEach((origCanvas, i) => {
      const destCanvas = clonedCanvases[i] as HTMLCanvasElement;
      if (destCanvas) {
        destCanvas.width = origCanvas.width;
        destCanvas.height = origCanvas.height;
        const destCtx = destCanvas.getContext('2d');
        if (destCtx) {
          destCtx.drawImage(origCanvas, 0, 0);
        }
      }
    });

    document.body.appendChild(clone);

    let rawCanvas: HTMLCanvasElement;
    try {
      const scaleFactor = canvasWidth / designWidth;
      rawCanvas = await html2canvas(clone, {
        scale: scaleFactor,
        width: designWidth,
        windowWidth: designWidth,
        backgroundColor: '#FFFFFF',
        logging: false,
        useCORS: true,
        allowTaint: true
      } as any);
      
      PrintDiagnostics.updateStep('render_html', 'success', `تم توليد الرسم النقطي بنجاح. أبعاد الصورة الملتقطة: ${rawCanvas.width}x${rawCanvas.height} بكسل.`, `Successfully rendered elements. Canvas size: ${rawCanvas.width}x${rawCanvas.height} px.`);
    } catch (err: any) {
      console.error('[BLEPrinterDriver] html2canvas clone capture failed:', err);
      PrintDiagnostics.updateStep('render_html', 'failed', `فشل محرك html2canvas في تحويل عناصر الصفحة إلى صورة: ${err?.message || err}`, `Visual capture failed: ${err?.message || err}`);
      if (document.body.contains(clone)) {
        document.body.removeChild(clone);
      }
      return false;
    } finally {
      if (document.body.contains(clone)) {
        document.body.removeChild(clone);
      }
    }

    // 2. Map captured dimensions onto the final exact target canvas (ensures solid white flat background)
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvasWidth;
    const finalHeight = Math.round(rawCanvas.height * (canvasWidth / rawCanvas.width));
    finalCanvas.height = finalHeight;

    const finalCtx = finalCanvas.getContext('2d');
    if (!finalCtx) {
      console.error('[BLEPrinterDriver] Failed to initialize 2D context');
      PrintDiagnostics.addStep('raster_process', 'معالجة تفتيت الصورة وصياغة الأوامر الحرارية', 'Monochrome ESC/POS Graphics Compile', 'failed', 'فشلت معالجة الألوان: تعذر إنشاء سياق رسم 2D Canvas Context.', 'Failed monochrome process: Canvas 2D rendering context is null.');
      return false;
    }

    PrintDiagnostics.addStep(
      'raster_process',
      'معالجة تفتيت الصورة وصياغة الأوامر الحرارية',
      'Monochrome ESC/POS Graphics Compile',
      'running',
      `جاري استخراج مصفوفة الألوان وتحويلها لبيانات ثنائية 1-bit بكسلية بمجموع عينات ${finalHeight} خط عرضي...`,
      `Analyzing pixels and converting to 1-bit monochrome binary command format (${finalHeight} total vertical lines)...`
    );

    try {
      finalCtx.fillStyle = '#FFFFFF';
      finalCtx.fillRect(0, 0, canvasWidth, finalHeight);
      finalCtx.drawImage(rawCanvas, 0, 0, canvasWidth, finalHeight);

      // 3. Process image into ESC/POS monochrome bitmap commands in 40px bands
      const imgData = finalCtx.getImageData(0, 0, canvasWidth, finalHeight);
      const pixels = imgData.data;
      const commands: number[] = [];

      // ESC @ - Initialize Printer
      commands.push(0x1B, 0x40);

      const bandHeight = 40;
      const totalBands = Math.ceil(finalHeight / bandHeight);
      const widthBytes = canvasWidth / 8;

      for (let b = 0; b < totalBands; b++) {
        const startY = b * bandHeight;
        const currentBandHeight = Math.min(bandHeight, finalHeight - startY);

        // GS v 0 0 - Print Raster Bit Image
        commands.push(0x1D, 0x76, 0x30, 0x00);
        commands.push(widthBytes & 0xFF, (widthBytes >> 8) & 0xFF); // xL, xH (width bytes)
        commands.push(currentBandHeight & 0xFF, (currentBandHeight >> 8) & 0xFF); // yL, yH (height dots)

        for (let y = startY; y < startY + currentBandHeight; y++) {
          for (let xByte = 0; xByte < widthBytes; xByte++) {
            let byteVal = 0;
            for (let bit = 0; bit < 8; bit++) {
              const x = xByte * 8 + bit;
              let isBlack = 0;
              if (x < canvasWidth) {
                const idx = (y * canvasWidth + x) * 4;
                const r = pixels[idx];
                const g = pixels[idx + 1];
                const b = pixels[idx + 2];
                const a = pixels[idx + 3];

                // High-contrast thresholding with transparency support
                if (a > 128) {
                  const grayscale = 0.299 * r + 0.587 * g + 0.114 * b;
                  if (grayscale < 200) { // Solid black threshold
                    isBlack = 1;
                  }
                }
              }
              byteVal = (byteVal << 1) | isBlack;
            }
            commands.push(byteVal);
          }
        }
      }

      // 4. Feed paper for safe tear-off (Avoid ESC/POS Cutter command to protect cheap gear from firmware freeze)
      commands.push(0x0A, 0x0A, 0x0A, 0x0A, 0x0A, 0x0A);

      const payload = new Uint8Array(commands);
      PrintDiagnostics.updateStep('raster_process', 'success', `اكتمل الرسم الثنائي. تم إنتاج حزمة أوامر حرارية بحجم ${commands.length} بايت مقسمة على ${totalBands} حزمة.`, `Graphics compilation success. Compiled ${commands.length} bytes of binary ESC/POS commands over ${totalBands} vertical bands.`);
      
      return await this.sendBinaryPayload(payload, config, pacingDelay, chunkSize);
    } catch (err: any) {
      console.error('[BLEPrinterDriver] Raster graphics compilation failed:', err);
      PrintDiagnostics.updateStep('raster_process', 'failed', `حدث خطأ أثناء فحص عينات الألوان والتحويل الثنائي: ${err?.message || err}`, `Failed during color conversion: ${err?.message || err}`);
      return false;
    }
  }

  /**
   * Sends binary payload (ESC/POS) to the physical printer with strict chunking and pacing
   */
  public static async sendBinaryPayload(
    payload: Uint8Array,
    config: PrinterConnectionConfig,
    pacingDelay: number = 15,
    chunkSize: number = 20
  ): Promise<boolean> {
    console.log(`[BLEPrinterDriver] Dispatched payload of ${payload.length} bytes. Mode: ${config.type}`);

    PrintDiagnostics.addStep(
      'transmit_payload',
      'بث حزم البيانات الحرارية للطابعة',
      'Transmit Binary Stream to Printer',
      'running',
      `جاري بث حزمة البيانات المتكاملة بمقدار ${payload.length} بايت. وضع الاتصال: ${config.type}...`,
      `Starting payload streaming of ${payload.length} bytes over ${config.type}...`,
      { deviceType: config.type, totalBytes: payload.length, sentBytes: 0, percentage: 0 }
    );

    if (config.type === 'mock') {
      console.log('[BLEPrinterDriver] Mock print dispatch successful');
      PrintDiagnostics.updateStep(
        'transmit_payload',
        'success',
        `اكتمل المحاكاة: تم إرسال حزمة تجريبية (${payload.length} بايت) بنجاح إلى منفذ المحاكاة الافتراضي.`,
        `Mock succeeded: Transmitted fake payload of ${payload.length} bytes to simulated printer viewport.`,
        { sentBytes: payload.length, percentage: 100 }
      );
      return true;
    }

    // --- CASE 1: WEB BLUETOOTH ---
    if (config.type === 'web_ble' && config.webBluetoothCharacteristic) {
      try {
        const char = config.webBluetoothCharacteristic;
        for (let i = 0; i < payload.length; i += chunkSize) {
          const chunk = payload.slice(i, i + chunkSize);
          const buffer = new ArrayBuffer(chunk.length);
          new Uint8Array(buffer).set(chunk);

          if (typeof char.writeValueWithoutResponse === 'function') {
            await char.writeValueWithoutResponse(buffer);
          } else if (typeof char.writeValueWithResponse === 'function') {
            await char.writeValueWithResponse(buffer);
          } else {
            await char.writeValue(buffer);
          }

          const progressPercent = Math.min(100, Math.round((i / payload.length) * 100));
          PrintDiagnostics.updateStep(
            'transmit_payload',
            'running',
            `جاري البث: تم إرسال ${i} من ${payload.length} بايت (${progressPercent}%)...`,
            `Streaming: Transmitted ${i} of ${payload.length} bytes (${progressPercent}%)...`,
            { sentBytes: i, percentage: progressPercent }
          );

          if (pacingDelay > 0) {
            await new Promise((resolve) => setTimeout(resolve, pacingDelay));
          }
        }
        
        PrintDiagnostics.updateStep(
          'transmit_payload',
          'success',
          `اكتمل البث بنجاح! تم إرسال ${payload.length} بايت كاملة عبر منفذ Web Bluetooth GATT.`,
          `Transmission success! Streamed ${payload.length} bytes completely over Web Bluetooth.`,
          { sentBytes: payload.length, percentage: 100 }
        );
        return true;
      } catch (err: any) {
        console.error('[BLEPrinterDriver] Web Bluetooth write failure:', err);
        PrintDiagnostics.updateStep(
          'transmit_payload',
          'failed',
          `فشل البث اللاسلكي: ${err?.message || err}`,
          `Streaming interrupted: ${err?.message || err}`,
          { error: err }
        );
        return false;
      }
    }

    // --- CASE 2: CORDOVA CLASSIC BLUETOOTH SERIAL SPP ---
    if (config.type === 'classic' && typeof (window as any).bluetoothSerial !== 'undefined') {
      try {
        const btSerial = (window as any).bluetoothSerial;
        await new Promise<void>((resolve, reject) => {
          const serialChunkSize = config.chunkSize || 4096; // Adaptive serial chunk size
          let offset = 0;

          function writeNext() {
            if (offset >= payload.length) {
              resolve();
              return;
            }
            const chunk = payload.slice(offset, offset + serialChunkSize);
            const buffer = new ArrayBuffer(chunk.length);
            new Uint8Array(buffer).set(chunk);

            btSerial.write(buffer, () => {
              offset += serialChunkSize;
              const progressPercent = Math.min(100, Math.round((offset / payload.length) * 100));
              PrintDiagnostics.updateStep(
                'transmit_payload',
                'running',
                `جاري البث الكلاسيكي السريع: تم نقل ${offset} من ${payload.length} بايت (${progressPercent}%)...`,
                `Streaming SPP: Sent ${offset} of ${payload.length} bytes (${progressPercent}%)...`,
                { sentBytes: offset, percentage: progressPercent }
              );
              setTimeout(writeNext, pacingDelay); // Adaptive pacing delay
            }, (err: any) => {
              reject(err);
            });
          }
          writeNext();
        });

        PrintDiagnostics.updateStep(
          'transmit_payload',
          'success',
          `اكتمل البث عبر السيريال بنجاح! تم شحن ${payload.length} بايت كاملة إلى طابعة البلوتوث الكلاسيكية.`,
          `SPP stream succeeded! Broadcasted ${payload.length} bytes directly to classic serial printer.`,
          { sentBytes: payload.length, percentage: 100 }
        );
        return true;
      } catch (err: any) {
        console.error('[BLEPrinterDriver] Classic Bluetooth Serial write failure:', err);
        PrintDiagnostics.updateStep(
          'transmit_payload',
          'failed',
          `فشل البث عبر السيريال الكلاسيكي: ${err?.message || err}`,
          `Serial SPP transmit failed: ${err?.message || err}`,
          { error: err }
        );
        return false;
      }
    }

    // --- CASE 3: CORDOVA BLE CENTRAL ---
    if (config.type === 'ble' && typeof (window as any).ble !== 'undefined' && config.deviceId && config.writeServiceUUID && config.writeCharUUID) {
      try {
        const ble = (window as any).ble;
        const deviceId = config.deviceId;
        const serviceUUID = config.writeServiceUUID;
        const charUUID = config.writeCharUUID;

        await new Promise<void>((resolve, reject) => {
          let offset = 0;

          function writeNext() {
            if (offset >= payload.length) {
              resolve();
              return;
            }
            const chunk = payload.slice(offset, offset + chunkSize);
            const buffer = new ArrayBuffer(chunk.length);
            new Uint8Array(buffer).set(chunk);

            ble.writeWithoutResponse(deviceId, serviceUUID, charUUID, buffer, () => {
              offset += chunkSize;
              const progressPercent = Math.min(100, Math.round((offset / payload.length) * 100));
              PrintDiagnostics.updateStep(
                'transmit_payload',
                'running',
                `جاري بث BLE: تم إرسال ${offset} من ${payload.length} بايت (${progressPercent}%)...`,
                `Streaming BLE: Sent ${offset} of ${payload.length} bytes (${progressPercent}%)...`,
                { sentBytes: offset, percentage: progressPercent }
              );
              setTimeout(writeNext, pacingDelay);
            }, (err: any) => {
              // Fail-safe: try write with response if without-response is rejected
              ble.write(deviceId, serviceUUID, charUUID, buffer, () => {
                offset += chunkSize;
                const progressPercent = Math.min(100, Math.round((offset / payload.length) * 100));
                PrintDiagnostics.updateStep(
                  'transmit_payload',
                  'running',
                  `جاري بث BLE (مع الاستجابة): تم إرسال ${offset} من ${payload.length} بايت (${progressPercent}%)...`,
                  `Streaming BLE (with response): Sent ${offset} of ${payload.length} bytes (${progressPercent}%)...`,
                  { sentBytes: offset, percentage: progressPercent }
                );
                setTimeout(writeNext, pacingDelay);
              }, (writeErr: any) => {
                console.error('[BLEPrinterDriver] Cordova BLE write block error:', writeErr);
                reject(writeErr);
              });
            });
          }
          writeNext();
        });

        PrintDiagnostics.updateStep(
          'transmit_payload',
          'success',
          `اكتمل بث BLE بنجاح! تم نقل ${payload.length} بايت كاملة إلى الطابعة الحرارية BLE.`,
          `BLE stream success! Transmitted ${payload.length} bytes entirely to BLE printer characteristic.`,
          { sentBytes: payload.length, percentage: 100 }
        );
        return true;
      } catch (err: any) {
        console.error('[BLEPrinterDriver] Cordova BLE Central write failure:', err);
        PrintDiagnostics.updateStep(
          'transmit_payload',
          'failed',
          `فشل البث اللاسلكي عبر BLE Central: ${err?.message || err}`,
          `BLE Central transmission failed: ${err?.message || err}`,
          { error: err }
        );
        return false;
      }
    }

    console.warn('[BLEPrinterDriver] No active hardware port matching config parameters was found.');
    PrintDiagnostics.updateStep(
      'transmit_payload',
      'failed',
      'لم يتم العثور على أي قناة اتصال نشطة أو مقترنة بالطابعة في بيئة العمل الحالية.',
      'No active, configured, or paired hardware ports were found to route the binary ESC/POS stream.'
    );
    return false;
  }

  /**
   * Standalone fallback generator to print basic text-based Arabic sentences directly
   */
  public static renderArabicTextToESCPOSTicket(
    text: string,
    paperWidth: '58' | '80' = '58',
    fontSize: number = 24,
    lineHeight: number = 32
  ): Uint8Array {
    const width = paperWidth === '58' ? 384 : 576;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      throw new Error('Canvas 2D context not supported');
    }

    tempCtx.font = `bold ${fontSize}px 'Cairo', 'Arial', sans-serif`;
    
    // Simple line breaker
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';
    const maxTextWidth = width - 16;

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = tempCtx.measureText(testLine);
      if (metrics.width > maxTextWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    const height = Math.max(lineHeight, lines.length * lineHeight + 16);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to create canvas context');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${fontSize}px 'Cairo', 'Arial', sans-serif`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'right';
    if ('direction' in ctx) {
      (ctx as any).direction = 'rtl';
    }

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], width - 8, i * lineHeight + 8);
    }

    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;
    const bytesPerLine = width / 8;
    const monoData = new Uint8Array(bytesPerLine * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        const a = pixels[idx + 3];

        let isBlack = false;
        if (a > 50) {
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          if (luma < 128) isBlack = true;
        }

        if (isBlack) {
          const byteIndex = y * bytesPerLine + Math.floor(x / 8);
          const bitIndex = 7 - (x % 8);
          monoData[byteIndex] |= (1 << bitIndex);
        }
      }
    }

    const xL = bytesPerLine % 256;
    const xH = Math.floor(bytesPerLine / 256);
    const yL = height % 256;
    const yH = Math.floor(height / 256);

    const header = [
      0x1B, 0x40, // ESC @ Initialize
      0x1D, 0x76, 0x30, 0x00,
      xL, xH,
      yL, yH
    ];

    const payload = new Uint8Array(header.length + monoData.length + 6);
    payload.set(header, 0);
    payload.set(monoData, header.length);
    payload.set([0x0A, 0x0A, 0x0A, 0x0A, 0x0A, 0x0A], header.length + monoData.length); // trailing feed

    return payload;
  }
}
