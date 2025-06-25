import env from "@/env";
import { z } from "zod";

export const messageSchema = z.object({
    message: z.string().min(1),
    numbers: z.string().min(10),
    language: z.enum(["english", "unicode"]).default("english")
});

export type MessageInput = z.infer<typeof messageSchema>;

export default class MessageServices {
    static async sendSMS(input: MessageInput) {
        try {
            // Validate input
            const validatedInput = messageSchema.parse(input);

            const urlencoded = new URLSearchParams();
            urlencoded.append("message", validatedInput.message);
            urlencoded.append("language", "english");
            urlencoded.append("route", "q");
            urlencoded.append("numbers", validatedInput.numbers);
            urlencoded.append("flash", "1");

            // const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
            //     method: "POST",
            //     headers: {
            //         "authorization": env.FAST2SMS_API_KEY || "",
            //         "Content-Type": "application/x-www-form-urlencoded"
            //     },
            //     body: urlencoded,
            //     redirect: "follow"
            // });

            // if (!response.ok) {
            //     throw new Error(`SMS API Error: ${response.statusText}`);
            // }

            // return await response.json();
            return {
                ok: 1,
                message: "SMS sent successfully"
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error(`Validation Error: ${error.errors.map(e => e.message).join(", ")}`);
            }
            throw error;
        }
    }
} 