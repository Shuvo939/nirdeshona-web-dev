export type ThemeChoice = "light" | "dark" | "system";
export const THEME_COOKIE = "nw_theme";

/** Runs in <head> before paint: applies the saved theme (or the device's) without a flash. */
export const themeInitScript = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(light|dark|system)/);var t=m?m[1]:"system";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.dataset.theme=t;}catch(e){}})();`;
