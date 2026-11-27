import path from "node:path";
import type { NextConfig } from "next";
const config:NextConfig={poweredByHeader:false,reactStrictMode:true,transpilePackages:["@purefolk/catalogue-domain"],turbopack:{root:path.resolve(process.cwd(),"../..")}};
export default config;
