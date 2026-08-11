import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Layout } from '@/components/layout/MainLayout';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jurista ? PakLaw-AI Assistant',
  description: 'Bilingual legal intelligence platform for Pakistani advocates',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <ThemeProvider>
          <Layout>{children}</Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}
