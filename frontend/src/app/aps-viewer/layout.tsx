import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "APS Viewer",
  description: "Autodesk Platform Services Viewer",
};

export default function APSViewerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">{children}</main>
    </div>
  );
}
