import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatDate(date: string | Date): string { return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(date)); }
export function getInitials(name: string): string { return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2); }
export function truncate(text: string, length: number): string { return text.length <= length ? text : text.slice(0, length) + "…"; }
export function capitalize(text: string): string { return text.charAt(0).toUpperCase() + text.slice(1); }
