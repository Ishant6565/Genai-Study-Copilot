import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeContext';
import { AuthProvider } from '@/components/layout/AuthContext';
import { CommandMenu } from '@/components/layout/CommandMenu';

export const metadata: Metadata = {
  title: 'StudyPilot AI — Enterprise AI Study Copilot',
  description: 'Turn your study material into an AI-powered learning system with grounded RAG, citations, quizzes, and flashcards.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 antialiased selection:bg-sky-500 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <CommandMenu />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
