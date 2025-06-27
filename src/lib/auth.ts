import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { db } from "@/configs/db/mongodb";
import { admin, openAPI, username } from "better-auth/plugins";
import { ac, dj, admin as adminRole } from "./permissions";
import env from "@/env";

export const auth = betterAuth({
    emailAndPassword: {  
        enabled: true,
        disableSignUp: true,
    },
    user: {
        additionalFields: {
            deviceId: {
                type: "string",
                default: null,
            },
            contactNumber: {
                type: "string",
                default: null,
            },
        },
    },
    database: mongodbAdapter(db),
    plugins: [
        openAPI(),
        username(),
        admin({
            ac,
            defaultRole: "dj",
            adminRoles: ["admin"],
            roles: {
              dj,
              admin: adminRole,
            },
          }),
      ],
      advanced: {
        cookiePrefix: "dhwani",
        crossSubDomainCookies: {
            enabled: true,
            domain: env.COOKIE_DOMAIN,
        },
    },
      trustedOrigins: [
        "http://localhost:3000",
      ],
})