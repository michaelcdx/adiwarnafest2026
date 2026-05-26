import QRCode from 'qrcode';

export const generateQRCodeDataUrl = async (text: string): Promise<string> => {
  return QRCode.toDataURL(text, {
    width: 256,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' }
  });
};

export const downloadQRCode = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const BOOTH_IDS = [
  'ADIWARNA2026FEST8h7X9kL2mN4pQ6rS8tUvWx',
  'ADIWARNA2026FEST3aB5cD7eF9gH1jK2lM4nO6',
  'ADIWARNA2026FEST5xY2zZ9kL1mN7pQ3rS6tUvWx'
];

export const BOOTH_LABELS: Record<string, string> = {
  'ADIWARNA2026FEST8h7X9kL2mN4pQ6rS8tUvWx': 'Booth 1 - Vendor Booth',
  'ADIWARNA2026FEST3aB5cD7eF9gH1jK2lM4nO6': 'Booth 2 - GADPA Booth',
  'ADIWARNA2026FEST5xY2zZ9kL1mN7pQ3rS6tUvWx': 'Booth 3 - Sponsor Booth'
};

export const REGISTRATION_KEY = 'ADIWARNA2026REGKEYK9j2L3pQ4rS5tV6wX7yZ8aB';

export const ALL_QR_CODES: { id: string; label: string }[] = [
  { id: BOOTH_IDS[0], label: 'Booth 1 - Vendor Booth' },
  { id: BOOTH_IDS[1], label: 'Booth 2 - GADPA Booth' },
  { id: BOOTH_IDS[2], label: 'Booth 3 - Sponsor Booth' },
  { id: REGISTRATION_KEY, label: 'Registration Key - Account Creation' }
];
