// lib/auth.ts
import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { admin as adminPlugin } from "better-auth/plugins";
import { ac, admin, user } from "@/lib/permissions";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseUrl: process.env.BETTER_AUTH_URL!,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    adminPlugin({
      ac,
      roles: { admin, user },
    }),
  ],
});
