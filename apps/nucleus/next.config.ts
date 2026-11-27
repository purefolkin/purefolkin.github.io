import path from "node:path";
import type { NextConfig } from "next";
const config:NextConfig={poweredByHeader:false,reactStrictMode:true,transpilePackages:["@purefolk/catalogue-domain"],turbopack:{root:path.resolve(process.cwd(),"../..")},async headers(){return [{source:"/:path*",headers:[{key:"X-Content-Type-Options",value:"nosniff"},{key:"X-Frame-Options",value:"DENY"},{key:"Referrer-Policy",value:"strict-origin-when-cross-origin"}]}]}};
export default config;
