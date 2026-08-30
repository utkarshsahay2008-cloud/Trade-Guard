import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trade-Guard — Financial Safety & Behavioral Intelligence System',
  description: 'High-precision financial risk analyzer, Loss Shield position optimizer, What-If stress matrix, and behavioral trading intelligence.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2310B981%22 stroke-width=%222.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z%22/><path d=%22m9 12 2 2 4-4%22/></svg>',
  },
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
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2310B981%22 stroke-width=%222.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z%22/><path d=%22m9 12 2 2 4-4%22/></svg>"
        />
      </head>
      <body className="bg-canvas text-fin-charcoal min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
