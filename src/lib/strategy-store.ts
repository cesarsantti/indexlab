import { GeneratedIndex } from "./index-generator";

const KEY = "indexlab_generated_index";

export function saveIndex(index: GeneratedIndex): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(index));
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

export function loadIndex(): GeneratedIndex | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GeneratedIndex) : null;
  } catch {
    return null;
  }
}

export function clearIndex(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
