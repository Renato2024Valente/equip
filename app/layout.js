import "./globals.css";

export const metadata = {
  title: "Controle de Notebooks",
  description: "Sistema de controle de notebooks com MongoDB",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
