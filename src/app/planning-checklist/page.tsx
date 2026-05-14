"use client";
import { useEffect } from "react";

export default function PlanningChecklistRedirect() {
  useEffect(() => {
    window.location.replace("/#checklist");
  }, []);
  return null;
}
