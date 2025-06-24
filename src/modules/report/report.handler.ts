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

      console.log('Body parameters:', req.body);
      console.log('Extracted apiKey:', apiKey);
      console.log('Expected API_KEY:', env.API_KEY);

      if (!apiKey) {
        res.status(401).json({ok: 0, message: "API Key is required"});
        return;
      }

      if (apiKey !== env.API_KEY) {
        res.status(401).json({ok: 0, message: "Unauthorized API Key is invalid"});
        return;
      }

      if (!deviceId || !soundLevel) {
        if (!deviceId) {
          res.status(400).json({ok: 0, message: "Device ID is required"});
          return;
        }
        if (!soundLevel) {
          res.status(400).json({ok: 0, message: "Sound level is required"});
          return;
        }
        res.status(400).json({ok: 0, message: "Device ID and sound level are required"});
        return;
      }

      const result = await ReportServices.createReport({deviceId, soundLevel, location});
      
      res.status(200).json({ok: 1, message: "Report created successfully", created: format(result.createdAt, "yyyy-MM-dd HH:mm:ss")});
      return;
    } catch (error) {
      throw error;
    }
  }
  static async createReportGet(req: Request, res: Response) {
    try {
      console.log('Query parameters:', req.query);
      
      // Handle malformed query parameters due to HTML entity encoding
      const deviceId = req.query.deviceId as string;
      const soundLevel = (req.query['amp;soundLevel'] || req.query.soundLevel) as string;
      const apiKey = (req.query['amp;apiKey'] || req.query.apiKey) as string;
      const latitude = (req.query['amp;latitude'] || req.query.latitude) as string;
      const longitude = (req.query['amp;longitude'] || req.query.longitude) as string;
      
      const location = latitude && longitude ? { 
        latitude: parseFloat(latitude), 
        longitude: parseFloat(longitude) 
      } : undefined;

      console.log('Extracted parameters:', { deviceId, soundLevel, apiKey, latitude, longitude });
      console.log('Expected API_KEY:', env.API_KEY);

      if (!apiKey) {
        res.status(401).json({ok: 0, message: "API Key is required"});
        return;
      }

      if (apiKey !== env.API_KEY) {
        res.status(401).json({ok: 0, message: "Unauthorized API Key is invalid"});
        return;
      }

      if (!deviceId || !soundLevel) {
        if (!deviceId) {
          res.status(400).json({ok: 0, message: "Device ID is required"});
          return;
        }
        if (!soundLevel) {
          res.status(400).json({ok: 0, message: "Sound level is required"});
          return;
        }
        res.status(400).json({ok: 0, message: "Device ID and sound level are required"});
        return;
      }

      const result = await ReportServices.createReport({
        deviceId, 
        soundLevel: parseFloat(soundLevel), 
        location
      });
      
      res.status(200).json({ok: 1, message: "Report created successfully", created: format(result.createdAt, "yyyy-MM-dd HH:mm:ss")});
      return;
    } catch (error) {
      console.error('Error in createReportGet:', error);
      res.status(500).json({ok: 0, message: "Internal server error"});
      return;
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