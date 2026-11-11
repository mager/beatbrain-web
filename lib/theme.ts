export type Theme = "light" | "dark";
export const THEME_STORAGE_KEY = "beatbrain-theme";

// Runs before paint. Storage can be disabled; the system remains the default.
export const THEME_INIT_SCRIPT = `(function(){var saved;try{saved=localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}var theme=saved==="light"||saved==="dark"?saved:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=theme})()`;
