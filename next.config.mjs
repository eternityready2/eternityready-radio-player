/** @type {import('next').NextConfig} */

const cspHeader = `
    upgrade-insecure-requests;
`;

const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  trailingSlash: true,
  experimental: {
    instrumentationHook: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "is1-ssl.mzstatic.com",
        pathname: "**",
      },
    ],
  },
  // async headers() {
  //   if (process.env.NODE_ENV === "production") {
  //     return [
  //       {
  //         source: "/(.*)",
  //         headers: [
  //           {
  //             key: "Content-Security-Policy",
  //             value: cspHeader.replace(/\n/g, ""),
  //           },
  //         ],
  //       },
  //     ];
  //   }
  //   return [];
  // },
  webpack: (config) => {
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/stream-proxy/:hostname/:path*",
        destination: "https://:hostname/:path*",
      },
      {
        source: "/itunes-api/:path*",
        destination: "https://itunes.apple.com/:path*",
      },
      {
        source: "/apple-music/:path*",
        destination: "https://music.apple.com/us/artist/:path*",
      },
    ];
  },
};

export default nextConfig;
