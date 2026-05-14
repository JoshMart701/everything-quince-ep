"use client";
import { useEffect } from "react";

export default function GetQuotesRedirect() {
  useEffect(() => {
    window.location.replace("/#quotes");
  }, []);
  return null;
}
