import ReportModel, { CreateReportSchema, QueryReportsSchema } from "./report.model";
import { db } from "@/configs/db/mongodb";
import APIError from "@/lib/errors/APIError";
import { QueryOptions } from "mongoose";
import MessageServices from "../message/message.services";
import { UserWithRole } from "better-auth/plugins";
import { WithId } from "mongodb";

export default class ReportServices {
    static async checkPastHighLevelViolations(deviceId: string, limit: number, user: WithId<Document> & { contactNumber: string }) {
        const reports = await ReportModel.find({ deviceId, violationLevel: "high" }).sort({ createdAt: -1 }).limit(limit);
        if (reports.length >= limit) {
            const response = await MessageServices.sendSMS({
                message: `You have been fined for violating the noise level limit. Please pay the fine to avoid further action.`,
                language: "english",
                numbers: user.contactNumber,
            });
            console.log( "High Level Violation", response);
            return true;
        }
        return false;
    }

    static async checkPastMediumLevelViolations(deviceId: string, limit: number, user: WithId<Document> & { contactNumber: string }) {
        const reports = await ReportModel.find({ deviceId, violationLevel: "medium" }).sort({ createdAt: -1 }).limit(limit);
        if (reports.length >= limit) {
            const response = await MessageServices.sendSMS({
                message: `It's a warning for you to reduce the noise level. Please reduce the noise level to avoid further action.`,
                language: "english",
                numbers: user.contactNumber,
            });
            console.log( "Medium Level Violation", response);
            return true;
        }
        return false;
    }
  
    static async createReport(report: CreateReportSchema) {
        try {
        const { deviceId, soundLevel } = report;
        const violationLevel = soundLevel > 100 ? "high" : soundLevel > 50 ? "medium" : "low";
        let isViolationFined = false;
       

        // Find User by deviceId
        const user: WithId<Document> & { contactNumber: string } | null = await db.collection("user").findOne({ deviceId }) as WithId<Document> & { contactNumber: string } | null;

        if (!user) {
            throw new APIError({
                STATUS : 404,
                TITLE : "User not found",
                MESSAGE : "User not found according to deviceId",
                META : {
                    deviceId,
                }
            })
        }

        console.log(violationLevel);
        switch (violationLevel) {
            case "high":
                console.log("High Level Violation Initiated");
                isViolationFined = await this.checkPastHighLevelViolations(deviceId, 3, user);
            case "medium":
                console.log("Medium Level Violation Initiated");
                await this.checkPastMediumLevelViolations(deviceId, 3, user);
        }

        const newReport = await ReportModel.create({
            ...report,
            violationLevel,
            isViolationFined,
            userId : user._id.toString(),
        });

        
        return newReport;
        } catch (error) {
        throw error;
        }
    }
    static async getReports({ query, limit, page }: { query: QueryOptions<QueryReportsSchema>, limit: number, page: number }) {
        try {
            const skip = (page - 1) * limit;
            const [ docs, total ] = await Promise.all([
                ReportModel.find(query).limit(limit).skip(skip),
                ReportModel.countDocuments(query)
            ]);
            return {
                docs,
                total,
                page,
                limit,
                totalPages : Math.ceil(total / limit),
                hasNextPage : page < Math.ceil(total / limit),
                hasPreviousPage : page > 1,
            };
        } catch (error) {
            throw error;
        }
    }
}