import webpack from "webpack";
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const mode = 'export';
console.log("[Next] build mode", mode);

const disableChunk = !!process.env.DISABLE_CHUNK || mode === "export";
console.log("[Next] build with chunk: ", !disableChunk);

const APP_ALIAS_SUB_PATH = [
  "store",
  "config",
  "icons",
  "components",
  "client",
  "locales",
  "pages",
  "styles",
  "hook",
  "utils",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    if (disableChunk) {
      config.plugins.push(
        new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
      );
    }

    config.resolve.fallback = {
      child_process: false,
    };

    APP_ALIAS_SUB_PATH.forEach(item => {
      config.resolve.alias[`@${item}`] = path.resolve(__dirname, `app/${item}`);
    });

    config.resolve.alias['@app'] = path.resolve(__dirname, 'app');

    return config;
  },
  output: mode,
  images: {
    unoptimized: mode === "export",
  },
  experimental: {
    forceSwcTransforms: true,
  },
};

const CorsHeaders = [
  { key: "Access-Control-Allow-Credentials", value: "true" },
  { key: "Access-Control-Allow-Origin", value: "*" },
  {
    key: "Access-Control-Allow-Methods",
    value: "*",
  },
  {
    key: "Access-Control-Allow-Headers",
    value: "*",
  },
  {
    key: "Access-Control-Max-Age",
    value: "86400",
  },
];

if (mode !== "export") {
  nextConfig.headers = async () => {
    return [
      {
        source: "/api/:path*",
        headers: CorsHeaders,
      },
    ];
  };

  nextConfig.rewrites = async () => {
    const ret = [
      {
        source: "/login",
        destination: "/"
      },
      {
        source: "/chat",
        destination: "/"
      },
      {
        source: "/api/:path*",
        destination: "http://localhost:8082/api/:path*",
      },
    ];

    return {
      beforeFiles: ret,
    };
  };
}

export default nextConfig;
