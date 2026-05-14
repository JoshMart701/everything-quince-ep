import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quinceañera Inspiration Gallery — El Paso TX",
  description: "Browse stunning quinceañera photo inspiration from El Paso, TX. Find ideas for themes, décor, dresses, florals, and more for your daughter's quinceañera.",
};

export default function GalleryRedirect() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.location.replace("/#gallery")`,
      }}
    />
  );
}
