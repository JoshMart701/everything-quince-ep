import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Free Quinceañera Quotes — El Paso TX Vendors",
  description: "Request free quotes from El Paso's top quinceañera vendors. Submit one form to hear from matched venues, photographers, DJs, caterers, and more in El Paso, TX.",
};

export default function GetQuotesRedirect() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.location.replace("/#quotes")`,
      }}
    />
  );
}
