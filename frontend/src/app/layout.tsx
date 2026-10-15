import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Layout } from '@/components/layout/MainLayout';
import { AuthProvider } from '@/context/AuthContext';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jurista - PakLaw-AI Assistant',
  description: 'Bilingual legal intelligence platform for Pakistani advocates',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Anti-flash: apply theme class before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('jurista_theme');
            if (t === 'light') document.documentElement.classList.add('light');
            else document.documentElement.classList.add('dark');
          } catch(e) { document.documentElement.classList.add('dark'); }
        `}} />
      </head>
      <body style={{ margin: 0 }}>
        <AuthProvider>
          <ThemeProvider>
            <Layout>{children}</Layout>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
