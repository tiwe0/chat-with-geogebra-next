import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 	output: 'standalone',
	trailingSlash: true,
	assetPrefix: process.env.NODE_ENV === 'production' ? '/' : undefined,
	images: {
		unoptimized: true,
	}
};

export default nextConfig;
