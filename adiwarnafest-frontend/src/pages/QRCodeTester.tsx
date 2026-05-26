import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Download, QrCode } from '@phosphor-icons/react';
import { generateQRCodeDataUrl, downloadQRCode, ALL_QR_CODES } from '../utils/qrGenerator';

const QRCodeTester: React.FC = () => {
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const toast = React.useRef<Toast>(null);

  useEffect(() => {
    const generateAll = async () => {
      try {
        const codes: Record<string, string> = {};
        for (const qr of ALL_QR_CODES) {
          codes[qr.id] = await generateQRCodeDataUrl(qr.id);
        }
        setQrCodes(codes);
      } catch (error) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to generate QR codes',
          life: 3000
        });
      } finally {
        setLoading(false);
      }
    };

    generateAll();
  }, []);

  const handleDownload = (qrId: string, label: string) => {
    if (qrCodes[qrId]) {
      const filename = label.replace(/[^a-zA-Z0-9]/g, '_') + '.png';
      downloadQRCode(qrCodes[qrId], filename);
      toast.current?.show({
        severity: 'success',
        summary: 'Downloaded',
        detail: `${filename} has been downloaded`,
        life: 3000
      });
    }
  };

  if (loading) {
    return (
      <div className="surface-0 min-h-screen flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner mb-3"></div>
          <p className="text-600 font-medium">Generating QR codes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-0 min-h-screen p-6">
      <Toast ref={toast} position="bottom-center" />

      <div className="mx-auto max-w-6xl">
        <div className="flex align-items-center gap-3 mb-6">
          <QrCode size={32} weight="fill" style={{ color: 'var(--color-primary)' }} />
          <h1 className="m-0 text-3xl font-bold">QR Code Generator</h1>
        </div>

        <p className="text-600 mb-8">
          Generate and download QR codes for booth scanning and account registration. Right-click any image to save it locally.
        </p>

        <div className="grid mt-6">
          {ALL_QR_CODES.map((qr) => {
            const isRegistrationKey = qr.id.includes('REGKEY');
            return (
              <div key={qr.id} className="col-12 md:col-6 lg:col-3 p-3">
                <div
                  className="bg-white border-round-2xl p-4 shadow-4 h-full flex flex-column gap-4 align-items-center text-center"
                  style={{
                    border: isRegistrationKey ? '2px solid #7c3aed' : 'none'
                  }}
                >
                  {isRegistrationKey && (
                    <div
                      className="px-3 py-1 border-round-3xl text-[10px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: '#7c3aed', color: '#fff' }}
                    >
                      Registration
                    </div>
                  )}
                  <h3 className="m-0 text-lg font-bold">{qr.label}</h3>

                  {qrCodes[qr.id] && (
                    <img
                      src={qrCodes[qr.id]}
                      alt={qr.label}
                      className="w-12rem h-12rem border-round-xl border-2"
                      style={{ borderColor: isRegistrationKey ? '#7c3aed' : 'var(--color-primary)' }}
                    />
                  )}

                  <div className="flex flex-column gap-2 w-full">
                    <Button
                      label="Download PNG"
                      icon={<Download size={20} className="mr-2" />}
                      className="w-full"
                      onClick={() => handleDownload(qr.id, qr.label)}
                      style={{
                        backgroundColor: isRegistrationKey ? '#7c3aed' : 'var(--color-primary)',
                        borderColor: isRegistrationKey ? '#7c3aed' : 'var(--color-primary)'
                      }}
                    />
                    <p className="m-0 text-[10px] text-500 italic break-word">
                      Contains: <strong style={{ wordBreak: 'break-all' }}>{qr.id}</strong>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-blue-50 border-round-2xl p-4 border-1 border-blue-100">
          <p className="m-0 text-sm text-blue-900 mb-2">
            <strong>How to test booths:</strong> Download the booth QR codes, then go to a booth in the Lucky Draw page, click "Scan QR Code", and scan or upload the image to test.
          </p>
          <p className="m-0 text-sm text-blue-900">
            <strong>How to test registration:</strong> Download the Registration Key QR. Go to Login → Create Account, fill in your details, and scan or paste this key when prompted.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeTester;
