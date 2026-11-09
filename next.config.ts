import type { NextConfig } from "next";

const DEFAULT_DATABASE_URL =
  "postgresql://neondb_owner:npg_fgjM7pHsor0Q@ep-tiny-violet-b32s1rob-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const DEFAULT_DIRECT_URL =
  "postgresql://neondb_owner:npg_fgjM7pHsor0Q@ep-tiny-violet-b32s1rob.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = DEFAULT_DATABASE_URL;
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = DEFAULT_DIRECT_URL;
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL || DEFAULT_DIRECT_URL,
  },
};

export default nextConfig;
