const parseEnvPaths = (envVar: string | undefined): string[] => {
  if (!envVar) return [];
  return envVar
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
};

const nonceExcluded = parseEnvPaths(process.env.NONCE_EXCLUDED_PATHS);
const rateLimitExcluded = parseEnvPaths(process.env.RATE_LIMIT_EXCLUDED_PATHS);

export const isNonceExcluded = (path: string): boolean => {
  // Check if path includes one of the excluded paths
  return nonceExcluded.some((excluded) => path.includes(excluded));
};

export const isRateLimitExcluded = (path: string): boolean => {
  // Check if path includes one of the excluded paths
  return rateLimitExcluded.some((excluded) => path.includes(excluded));
};
