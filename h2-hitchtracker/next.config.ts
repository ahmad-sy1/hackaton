import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keeps next dev from appending generated agent rules to CLAUDE.md.
  agentRules: false,
};

export default nextConfig;
