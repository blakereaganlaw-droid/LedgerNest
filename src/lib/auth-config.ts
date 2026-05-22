export function getBaseURL(): string {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function getTrustedOrigins(): string[] {
  const origins = [
    process.env.APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    "http://localhost:3000",
  ];
  return [...new Set(origins.filter(Boolean) as string[])];
}

export const authConfig = {
  baseURL: getBaseURL(),
  trustedOrigins: getTrustedOrigins(),
};
