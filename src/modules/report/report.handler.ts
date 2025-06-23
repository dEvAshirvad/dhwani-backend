import { Request, Response } from "express";
import ReportServices from "./report.services";
import Respond from "@/lib/respond";
import { QueryReportsSchema, queryReportsSchema, RootZodReportSchema, rootZoReportSchema } from "./report.model";
import { QueryOptions } from "mongoose";
import APIError from "@/lib/errors/APIError";

export default class ReportHandler {
  static async createReport(req: Request, res: Response) {
    try {
      const report = req.body;
      const result = await ReportServices.createReport(report);
      
      Respond(res, {
        message: "Report created successfully",
        data: result,
      }, 200);
    } catch (error) {
      throw error;
    }
  }
  static async createReportGet(req: Request, res: Response) {
    try {
      const { deviceId, soundLevel, latitude, longitude } = req.query as unknown as { deviceId: string, soundLevel: number, latitude: number, longitude: number };
      const location = latitude && longitude ? { latitude, longitude } : undefined;

      if (!deviceId || !soundLevel) {
        if (!deviceId) {
          throw new APIError({
            STATUS: 400,
            TITLE: "Bad Request",
            MESSAGE: "Device ID is required",
            ERRORS: [
              {
                field: "deviceId",
                message: "Device ID is required",
              },
            ],
          });
        }
        if (!soundLevel) {
          throw new APIError({
            STATUS: 400,
            TITLE: "Bad Request",
            MESSAGE: "Sound level is required",
            ERRORS: [
              {
                field: "soundLevel",
                message: "Sound level is required",
              },
            ],
          });
        }
        throw new APIError({
          STATUS: 400,
          TITLE: "Bad Request",
          MESSAGE: "Device ID and sound level are required",
          ERRORS: [
            {
              field: "deviceId",
              message: "Device ID is required",
            },
            {
              field: "soundLevel",
              message: "Sound level is required",
            },
          ],
        });
      }

      const result = await ReportServices.createReport({deviceId, soundLevel, location});
      
      Respond(res, {
        message: "Report created successfully",
        data: result,
      }, 200);
    } catch (error) {
      throw error;
    }
  }
  static async getReports(req: Request, res: Response) {
    try {
      const { limit, page, ...query } = req.query as unknown as { limit: number, page: number, query: QueryOptions<QueryReportsSchema> };
      const reports = await ReportServices.getReports({ query: query, limit : limit || 10, page : page || 1 });
      Respond(res, {
        message: "Reports fetched successfully",
        data: reports,
      }, 200);
    } catch (error) {
      throw error;
    }
  }
}