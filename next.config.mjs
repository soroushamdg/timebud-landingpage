/** @type {import('next').NextConfig} */
const nextConfig = {
  // sharp uses native bindings — keep it out of the serverless bundle and
  // require()'d from node_modules at runtime instead.
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },
};

export default nextConfig;
