import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { db } from "@/configs/db/mongodb";
import { openAPI, username, magicLink } from "better-auth/plugins";
import { resend } from "@/lib/emails/resend";
import VerifyEmail from "@/lib/emails/verify-email";

export const auth = betterAuth({
    emailAndPassword: {  
        enabled: true
    },
    database: mongodbAdapter(db),
    plugins: [
        openAPI(),
        username(),
        magicLink({
          sendMagicLink: async ({ email, token, url }, request) => {
            await resend.emails.send({
              from: "Clasher's Academy <no-reply@emails.clashersacademy.com>",
              to: email,
              subject: "Magic Link",
              html: VerifyEmail({url, token, email, request}),
            });
          },
        }),
      ],
})