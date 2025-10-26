export interface S3Env {
  S3_ENABLED?: string;
  AWS_REGION?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  S3_BUCKET?: string;
  S3_PUBLIC_URL_BASE?: string; // optional CDN base (e.g., https://cdn.example.com)
}

export function s3Enabled(env: NodeJS.ProcessEnv): boolean {
  return env.S3_ENABLED === 'true' && !!env.S3_BUCKET && !!env.AWS_REGION && !!env.AWS_ACCESS_KEY_ID && !!env.AWS_SECRET_ACCESS_KEY;
}
