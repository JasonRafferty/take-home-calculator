import { defineConfig } from "vite";

// Project is served from https://jasonrafferty.github.io/take-home-calculator/
// so production builds need the repo name as the base path. Local dev/preview
// stay at "/".
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/take-home-calculator/" : "/",
}));
