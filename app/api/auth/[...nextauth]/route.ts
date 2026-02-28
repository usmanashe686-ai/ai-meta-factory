export const dynamic = "force-dynamic"; // Tell Next.js this API route is dynamic

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
