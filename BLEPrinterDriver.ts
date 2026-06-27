/**
 * BLEPrinterDriver - Standalone, Decoupled BLE Thermal Printer Driver for 58mm Printers (ESC/POS)
 * 
 * Requirements:
 * 1. BLE Chunking: Automatically split any output byte array into 20-byte packets
 *    and send them sequentially with a 5ms delay to prevent buffer overflow.
 * 2. Basic Commands: Implement initialize() (0x1B, 0x40) and lineFeed().
 * 3. Arabic Bitmap Engine: Shapes Arabic text (RTL), draws it on a 1-bit monochrome canvas
 *    (max width 384 pixels), and wraps it in ESC/POS raster image command GS v 0 (0x1D, 0x76, 0x30, 0x00).
 * 
 * This class is decoupled from specific frameworks (Web Bluetooth, Cordova, or Capacitor)
 * by accepting a low-level write callback in the constructor.
 */

export class BLEPrinterDriver {
  private writeCallback: (chunk: Uint8Array) => Promise<void>;
  private queue: Promise<void> = Promise.resolve();
  private readonly maxPacketSize = 20;
  private readonly packetDelayMs = 5;
  private readonly printerWidthPixels = 384; // 58mm printer standard width (384 dots)

  /**
   * Constructor for the BLE Printer Driver.
   * @param writeCallback A callback function that receives a 20-byte chunk and writes it to the BLE characteristic.
   */
  constructor(writeCallback: (chunk: Uint8Array) => Promise<void>) {
    this.writeCallback = writeCallback;
  }

  /**
   * Queues and sends raw data through the BLE link, automatically chunking it into 20-byte packets
   * and introducing a 5ms delay between packets to prevent printer buffer overflow.
   * @param data The Uint8Array containing raw ESC/POS commands or bitmap data.
   */
  public async send(data: Uint8Array): Promise<void> {
    this.queue = this.queue.then(() => this.sendChunks(data));
    return this.queue;
  }

  /**
   * Internal helper to split data into chunks and send with delay.
   */
  private async sendChunks(data: Uint8Array): Promise<void> {
    for (let i = 0; i < data.length; i += this.maxPacketSize) {
      const chunk = data.slice(i, i + this.maxPacketSize);
      await this.writeCallback(chunk);
      await new Promise((resolve) => setTimeout(resolve, this.packetDelayMs));
    }
  }

  /**
   * Sends the standard ESC/POS Initialize command (ESC @ - 0x1B 0x40)
   * Clears the print buffer, resets settings, and prepares the printer for a new job.
   */
  public async initialize(): Promise<void> {
    const initCmd = new Uint8Array([0x1B, 0x40]);
    await this.send(initCmd);
  }

  /**
   * Sends a standard Line Feed command (LF - 0x0A)
   * Feeds paper by one line.
   */
  public async lineFeed(): Promise<void> {
    const lfCmd = new Uint8Array([0x0A]);
    await this.send(lfCmd);
  }

  /**
   * Feeds paper by multiple lines.
   * @param count Number of lines to feed.
   */
  public async feedLines(count: number): Promise<void> {
    const feedCmd = new Uint8Array([0x1B, 0x64, Math.min(255, Math.max(1, count))]);
    await this.send(feedCmd);
  }

  /**
   * Renders Arabic text (RTL and shaped) onto a 1-bit monochrome canvas,
   * then wraps the resulting bitmap in the standard ESC/POS GS v 0 raster command.
   * 
   * @param text The input Arabic text (can include newlines).
   * @param fontSize Font size in pixels (defaults to 24 for high legibility on 58mm paper).
   * @param lineHeight Line height in pixels (defaults to 32).
   * @returns A Uint8Array containing the ESC/POS GS v 0 raster image command and the bitmap data.
   */
  public renderArabicToBitmap(
    text: string,
    fontSize: number = 24,
    lineHeight: number = 32
  ): Uint8Array {
    if (typeof document === 'undefined') {
      throw new Error('renderArabicToBitmap requires a browser or web view environment with HTML5 Canvas support.');
    }

    // 1. Measure and wrap text using a temporary canvas to calculate the required height
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.printerWidthPixels;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      throw new Error('Failed to get 2D canvas context for text measurement');
    }

    tempCtx.font = `bold ${fontSize}px 'Cairo', 'Arial', sans-serif`;
    const wrappedLines = this.wrapText(tempCtx, text, this.printerWidthPixels - 16); // 8px margin on each side

    // Calculate canvas height based on the number of wrapped lines
    const height = Math.max(lineHeight, wrappedLines.length * lineHeight + 12);

    // 2. Create the actual drawing canvas
    const canvas = document.createElement('canvas');
    canvas.width = this.printerWidthPixels;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Failed to get 2D canvas context for rendering');
    }

    // Fill background with white (0 in monochrome representation)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, this.printerWidthPixels, height);

    // Configure text rendering properties
    ctx.fillStyle = '#000000'; // Black text (1 in monochrome)
    ctx.font = `bold ${fontSize}px 'Cairo', 'Arial', sans-serif`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'right'; // RTL text alignment
    // Set direction to RTL for native Arabic shaping and bidi ordering
    if ('direction' in ctx) {
      ctx.direction = 'rtl';
    }

    // Draw lines of text from right to left
    for (let i = 0; i < wrappedLines.length; i++) {
      const lineY = i * lineHeight + 6;
      // When textAlign = 'right', coordinates are anchored at the rightmost boundary of the canvas
      ctx.fillText(wrappedLines[i], this.printerWidthPixels - 8, lineY);
    }

    // 3. Convert RGBA Canvas pixel data into 1-bit Monochrome ESC/POS format
    const imgData = ctx.getImageData(0, 0, this.printerWidthPixels, height);
    const pixels = imgData.data;

    const bytesPerLine = this.printerWidthPixels / 8; // 384 / 8 = 48 bytes
    const dataSize = bytesPerLine * height;
    const monoData = new Uint8Array(dataSize);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < this.printerWidthPixels; x++) {
        const pixelIndex = (y * this.printerWidthPixels + x) * 4;
        const r = pixels[pixelIndex];
        const g = pixels[pixelIndex + 1];
        const b = pixels[pixelIndex + 2];
        const a = pixels[pixelIndex + 3];

        // Determine if pixel is considered "black" or "white"
        // Transparent pixels (a < 50) are treated as white
        let isBlack = false;
        if (a > 50) {
          // Standard luminance formula
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          if (luminance < 128) {
            isBlack = true;
          }
        }

        if (isBlack) {
          const byteIndex = y * bytesPerLine + Math.floor(x / 8);
          const bitIndex = 7 - (x % 8);
          monoData[byteIndex] |= (1 << bitIndex);
        }
      }
    }

    // 4. Wrap in standard ESC/POS GS v 0 command
    // Format: GS v 0 m xL xH yL yH d1...dk
    // GS = 0x1D, v = 0x76, 0 = 0x30
    // m = 0x00 (Normal mode)
    // xL, xH = width of image in bytes (384 dots / 8 = 48 bytes -> xL = 48, xH = 0)
    // yL, yH = height of image in lines (height -> yL = height % 256, yH = height / 256)
    const xL = bytesPerLine % 256;
    const xH = Math.floor(bytesPerLine / 256);
    const yL = height % 256;
    const yH = Math.floor(height / 256);

    const header = new Uint8Array([
      0x1D, 0x76, 0x30, 0x00,
      xL, xH,
      yL, yH
    ]);

    // Combine header and monochrome pixel data
    const commandPacket = new Uint8Array(header.length + monoData.length);
    commandPacket.set(header, 0);
    commandPacket.set(monoData, header.length);

    return commandPacket;
  }

  /**
   * Helper to print rendered Arabic text directly.
   * @param text The input Arabic text to render and print.
   * @param fontSize Optional font size (default: 24).
   * @param lineHeight Optional line height (default: 32).
   */
  public async printArabicText(
    text: string,
    fontSize: number = 24,
    lineHeight: number = 32
  ): Promise<void> {
    const bitmapCommand = this.renderArabicToBitmap(text, fontSize, lineHeight);
    await this.send(bitmapCommand);
  }

  /**
   * Multi-line aware word wrapping function.
   * Splits text into individual words, measures them, and returns array of lines.
   */
  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const paragraphs = text.split('\n');
    const lines: string[] = [];

    for (const paragraph of paragraphs) {
      if (paragraph.trim() === '') {
        lines.push('');
        continue;
      }

      const words = paragraph.split(/\s+/);
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }
    }

    return lines;
  }
}
