import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SHA256 as sha256 } from "crypto-js";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const hashPassword = (string) => {
  return sha256(string).toString();
};

export function validateEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

export function minifyScript(script) {
  return script
    .replace(/\s+/g, " ") // Replace multiple whitespace characters with a single space
    .replace(/>\s+</g, "><") // Remove spaces between HTML tags
    .replace(/;\s+/g, ";") // Remove spaces after semicolons
    .trim(); // Trim leading and trailing whitespace
}
