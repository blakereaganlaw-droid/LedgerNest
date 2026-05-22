import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "pnpm.exe",
      "next-env.d.ts",
    ],
  },
  ...nextCoreWebVitals,
];

export default eslintConfig;
