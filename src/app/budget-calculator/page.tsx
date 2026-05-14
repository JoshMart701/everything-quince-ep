"use client";
import { useEffect } from "react";

export default function BudgetCalculatorRedirect() {
  useEffect(() => {
    window.location.replace("/#budget");
  }, []);
  return null;
}
