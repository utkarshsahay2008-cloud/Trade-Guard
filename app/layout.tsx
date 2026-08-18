import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trade-Guard — Financial Safety & Behavioral Intelligence System',
  description: 'High-precision financial risk analyzer, Loss Shield position optimizer, What-If stress matrix, and behavioral trading intelligence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-canvas text-fin-charcoal min-h-screen font-sans selection:bg-slate-200">
        {children}
      </body>
    </html>
  );
}
