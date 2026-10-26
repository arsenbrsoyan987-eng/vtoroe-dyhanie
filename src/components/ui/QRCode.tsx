import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  value: string;
  size?: number;
  title?: string;
}

export default function QRCode({ value, size = 200, title }: QRCodeProps) {
  return (
    <div className="bg-white p-4 rounded-sm inline-block">
      <QRCodeSVG value={value} size={size} level="H" includeMargin={false} />
      {title && <p className="text-center text-gray-500 text-xs mt-2">{title}</p>}
    </div>
  );
}
