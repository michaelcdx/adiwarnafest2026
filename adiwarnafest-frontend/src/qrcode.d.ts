declare module 'qrcode' {
  interface QRCodeOptions {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  const QRCode: {
    toDataURL(text: string, options?: QRCodeOptions): Promise<string>;
    toCanvas(canvas: HTMLCanvasElement, text: string, options?: QRCodeOptions): Promise<void>;
    toString(text: string, options?: QRCodeOptions): Promise<string>;
  };

  export default QRCode;
}
