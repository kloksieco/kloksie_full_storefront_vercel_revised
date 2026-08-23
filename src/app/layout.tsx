import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kloksie - Pieces with Presence',
  description: 'Curated collection of handcrafted pieces',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
