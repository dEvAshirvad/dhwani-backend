import ReportModel, { CreateReportSchema, QueryReportsSchema } from "./report.model";
import { db } from "@/configs/db/mongodb";
import APIError from "@/lib/errors/APIError";
import { QueryOptions, Types } from "mongoose";
import MessageServices from "../message/message.services";
import { UserWithRole } from "better-auth/plugins";
import { WithId } from "mongodb";

export default class ReportServices {
    static async checkPastHighLevelViolations(deviceId: string, limit: number, user: WithId<Document> & { contactNumber: string }) {
        const reports = await ReportModel.find({ deviceId, violationLevel: "high", createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 12) } }).sort({ createdAt: -1 }).limit(limit); // 12 hours ago
        console.log(reports);
        if (reports.length >= limit) {
            MessageServices.sendSMS({
                message: `You have been fined for violating the noise level limit. Please pay the fine to avoid further action.`,
                language: "english",
                numbers: user.contactNumber,
            });
            return true;
        }
        return false;
    }

    static async checkPastMediumLevelViolations(deviceId: string, limit: number, user: WithId<Document> & { contactNumber: string }) {
        const reports = await ReportModel.find({ deviceId, violationLevel: "medium", createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 12) } }).sort({ createdAt: -1 }).limit(limit); // 12 hours ago
        if (reports.length >= limit) {
            MessageServices.sendSMS({
                message: `It's a warning for you to reduce the noise level. Please reduce the noise level to avoid further action.`,
                language: "english",
                numbers: user.contactNumber,
            });
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
        const user: WithId<Document> & { contactNumber: string, name: string } | null = await db.collection("user").findOne({ deviceId }) as WithId<Document> & { contactNumber: string, name: string } | null;

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
                isViolationFined = await this.checkPastHighLevelViolations(deviceId, 3, user);
            case "medium":
                this.checkPastMediumLevelViolations(deviceId, 3, user);
        }

        const newReport = await ReportModel.create({
            ...report,
            violationLevel,
            isViolationFined,
            userId : user._id.toString(),
        });

        
        return {
            ...newReport.toObject(),
            vendorName : user.name,
        };
        } catch (error) {
        throw error;
        }
    }
    static async getReports({ query, limit = 30, page = 1 }: { query: QueryOptions<QueryReportsSchema>, limit: number, page: number }) {
        try {
            const skip = (page - 1) * limit;
            const [ docs, total ] = await Promise.all([
                ReportModel.find(query).limit(limit).skip(skip).sort({ createdAt: -1 }),
                ReportModel.countDocuments(query)
            ]);

            const users = await db.collection("user").find({ _id: { $in: docs.map(doc => new Types.ObjectId(doc.userId)) } }).toArray();

            const docsWithUsers = docs.map(doc => ({
                ...doc.toObject(),
                vendorName : users.find(user => user._id.toString() === doc.userId)?.name,
                user : users.find(user => user._id.toString() === doc.userId),
            }));

            return {
                docs : docsWithUsers,
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
    static async clearReports() {
        try {
            const result = await ReportModel.deleteMany({});
            return result;
        } catch (error) {
            throw error;
        }
    }
}