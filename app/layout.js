import "./globals.css";

export const metadata = {
  title: "CMS Portfolio",
  description: "Un CMS moderne pour portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning className="dark">
      <body suppressHydrationWarning className="bg-dark-bg text-dark-text min-h-screen">
        {children}
      </body>
    </html>
  );
}
