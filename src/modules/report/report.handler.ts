import { Request, Response } from "express";
import ReportServices from "./report.services";
import Respond from "@/lib/respond";
import { QueryReportsSchema } from "./report.model";
import { QueryOptions } from "mongoose";
import { format } from "date-fns";
import env from "@/env";

export default class ReportHandler {
  static async createReport(req: Request, res: Response) {
    try {
      const { deviceId, soundLevel, latitude, longitude, apiKey } = req.body as unknown as { deviceId: string, soundLevel: number, latitude: number, longitude: number, apiKey: string };
      const location = latitude && longitude ? { latitude, longitude } : undefined;

      if (apiKey !== env.API_KEY) {
        res.status(401).json({ok: 0, message: "Unauthorized API Key is invalid"});
      }

      if (!deviceId || !soundLevel) {
        if (!deviceId) {
          res.status(400).json({ok: 0, message: "Device ID is required"});
        }
        if (!soundLevel) {
          res.status(400).json({ok: 0, message: "Sound level is required"});
        }
        res.status(400).json({ok: 0, message: "Device ID and sound level are required"});
      }

      const result = await ReportServices.createReport({deviceId, soundLevel, location});
      
      res.status(200).json({ok: 1, message: "Report created successfully", created: format(result.createdAt, "yyyy-MM-dd HH:mm:ss")});
    } catch (error) {
      throw error;
    }
  }
  static async createReportGet(req: Request, res: Response) {
    try {
      const { deviceId, soundLevel, latitude, longitude, apiKey } = req.query as unknown as { deviceId: string, soundLevel: number, latitude: number, longitude: number, apiKey: string };
      const location = latitude && longitude ? { latitude, longitude } : undefined;

      if (apiKey !== env.API_KEY) {
        res.status(401).json({ok: 0, message: "Unauthorized API Key is invalid"});
      }

      if (!deviceId || !soundLevel) {
        if (!deviceId) {
          res.status(400).json({ok: 0, message: "Device ID is required"});
        }
        if (!soundLevel) {
          res.status(400).json({ok: 0, message: "Sound level is required"});
        }
        res.status(400).json({ok: 0, message: "Device ID and sound level are required"});
      }

      const result = await ReportServices.createReport({deviceId, soundLevel, location});
      
      res.status(200).json({ok: 1, message: "Report created successfully", created: format(result.createdAt, "yyyy-MM-dd HH:mm:ss")});
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