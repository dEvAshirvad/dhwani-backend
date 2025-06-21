import { Request, Response } from "express";
import ReportServices from "./report.services";
import Respond from "@/lib/respond";
import { QueryReportsSchema, queryReportsSchema, RootZodReportSchema, rootZoReportSchema } from "./report.model";
import { QueryOptions } from "mongoose";

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