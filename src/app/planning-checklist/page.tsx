import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quinceañera Planning Checklist — El Paso TX",
  description: "Free interactive quinceañera planning checklist for El Paso families. 25-task month-by-month timeline covering venues, vendors, dresses, invitations, choreography, and more.",
};

export default function PlanningChecklistRedirect() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.location.replace("/#checklist")`,
      }}
    />
  );
}
