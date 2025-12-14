import type { NextConfig } from "next"

const repo = "angular-certification-prep"

const nextConfig: NextConfig = {
    output: "export",
    trailingSlash: true,
    images: {
        unoptimized: true
    },
    basePath: `/${repo}`,
    assetPrefix: `/${repo}/`
}

export default nextConfig
