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

    let rawCanvas: HTMLCanvasElement;
    try {
      // Calculate dynamic scale factor based on actual visible DOM element width
      const elementWidth = element.offsetWidth || designWidth;
      const scaleFactor = canvasWidth / elementWidth;

      rawCanvas = await html2canvas(element, {
        scale: scaleFactor,
        backgroundColor: '#FFFFFF',
        logging: false,
        useCORS: true,
        allowTaint: true
      } as any);
    } catch (err) {
      console.error('[BLEPrinterDriver] html2canvas direct capture failed:', err);
      return false;
    }

    // 2. Map captured dimensions onto the final exact target canvas (ensures solid white flat background)
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvasWidth;
    const finalHeight = Math.round(rawCanvas.height * (canvasWidth / rawCanvas.width));
    finalCanvas.height = finalHeight;

    const finalCtx = finalCanvas.getContext('2d');
    if (!finalCtx) {
      console.error('[BLEPrinterDriver] Failed to initialize 2D context');
      return false;
    }

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
    return await this.sendBinaryPayload(payload, config, pacingDelay, chunkSize);
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

    if (config.type === 'mock') {
      console.log('[BLEPrinterDriver] Mock print dispatch successful');
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

          if (pacingDelay > 0) {
            await new Promise((resolve) => setTimeout(resolve, pacingDelay));
          }
        }
        return true;
      } catch (err) {
        console.error('[BLEPrinterDriver] Web Bluetooth write failure:', err);
        return false;
      }
    }

    // --- CASE 2: CORDOVA CLASSIC BLUETOOTH SERIAL SPP ---
    if (config.type === 'classic' && typeof (window as any).bluetoothSerial !== 'undefined') {
      try {
        const btSerial = (window as any).bluetoothSerial;
        await new Promise<void>((resolve, reject) => {
          const serialChunkSize = 128; // Classic Bluetooth can take larger chunks comfortably
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
              setTimeout(writeNext, 30); // 30ms stable classic serial delay
            }, (err: any) => {
              reject(err);
            });
          }
          writeNext();
        });
        return true;
      } catch (err) {
        console.error('[BLEPrinterDriver] Classic Bluetooth Serial write failure:', err);
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
              setTimeout(writeNext, pacingDelay);
            }, (err: any) => {
              // Fail-safe: try write with response if without-response is rejected
              ble.write(deviceId, serviceUUID, charUUID, buffer, () => {
                offset += chunkSize;
                setTimeout(writeNext, pacingDelay);
              }, (writeErr: any) => {
                console.error('[BLEPrinterDriver] Cordova BLE write block error:', writeErr);
                reject(writeErr);
              });
            });
          }
          writeNext();
        });
        return true;
      } catch (err) {
        console.error('[BLEPrinterDriver] Cordova BLE Central write failure:', err);
        return false;
      }
    }

    console.warn('[BLEPrinterDriver] No active hardware port matching config parameters was found.');
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
