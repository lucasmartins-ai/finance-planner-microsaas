import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const ignores = {
  ignores: [
    ".next/**",
    "coverage/**",
    "node_modules/**",
    "playwright-report/**",
    "test-results/**",
  ],
};

const eslintConfig = [ignores, ...nextVitals, ...nextTypescript];

export default eslintConfig;
