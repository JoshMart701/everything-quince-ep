import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quinceañera Budget Calculator — El Paso TX",
  description: "Use our free quinceañera budget calculator to plan your El Paso quinceañera. Adjust sliders for venue, catering, photography, dress, DJ, and more to see your total cost.",
};

export default function BudgetCalculatorRedirect() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.location.replace("/#budget")`,
      }}
    />
  );
}
