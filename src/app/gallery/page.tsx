"use client";
import { useEffect } from "react";

export default function GalleryRedirect() {
  useEffect(() => {
    window.location.replace("/#gallery");
  }, []);
  return null;
}
