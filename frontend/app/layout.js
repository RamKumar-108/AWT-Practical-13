import "./globals.css";

export const metadata = {
  title: "Live Task Board",
  description: "A simple real-time task management dashboard"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}