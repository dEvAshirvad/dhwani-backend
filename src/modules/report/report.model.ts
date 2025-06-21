import { model, Schema } from "mongoose";
import { z } from "zod";

export const rootZoReportSchema = z.object({
  userId: z.string(),
  soundLevel: z.number(),
  location : z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  deviceId: z.string(),
  violationLevel: z.enum(["low", "medium", "high"]),
  isViolationFined: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createReportSchema = rootZoReportSchema.omit({
  userId: true,
  violationLevel: true,
  isViolationFined: true,
  createdAt: true,
  updatedAt: true,
});

export const queryReportsSchema = rootZoReportSchema.extend({
  limit: z.number().optional(),
  page: z.number().optional(),
}).optional();

export type QueryReportsSchema = z.infer<typeof queryReportsSchema>;
export type RootZodReportSchema = z.infer<typeof rootZoReportSchema>;
export type CreateReportSchema = z.infer<typeof createReportSchema>;

const reportSchema = new Schema<RootZodReportSchema>({
  userId: { type: String, required: true },
  soundLevel: { type: Number, required: true },
  location: { type: { latitude: Number, longitude: Number }, required: false },
  deviceId: { type: String, required: true },
  violationLevel: { type: String, required: true, enum: ["low", "medium", "high"] },
  isViolationFined: { type: Boolean, required: true, default: false },
}, { timestamps: true });

const ReportModel = model<RootZodReportSchema>("tb_reports", reportSchema);

export default ReportModel;