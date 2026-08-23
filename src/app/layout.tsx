import type { Metadata } from "next";
import { Montserrat, Noto_Sans_KR } from "next/font/google";
import { AppProviders } from "@/components/app-providers";
import { CompareProvider } from "@/components/compare-provider";
import { SiteChrome } from "@/components/site-chrome";
import { company } from "@/lib/company";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(company.siteUrl),
  title: {
    default: `${company.nameKo} 쇼핑몰 | ${company.domain}`,
    template: `%s | ${company.nameEn}`,
  },
  description: company.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${montserrat.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <AppProviders>
          <CompareProvider>
            <SiteChrome>{children}</SiteChrome>
          </CompareProvider>
        </AppProviders>
      </body>
    </html>
  );
}
