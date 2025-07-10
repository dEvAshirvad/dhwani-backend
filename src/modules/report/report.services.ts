import ReportModel, { CreateReportSchema, QueryReportsSchema } from "./report.model";
import { db } from "@/configs/db/mongodb";
import APIError from "@/lib/errors/APIError";
import { QueryOptions, Types } from "mongoose";
import MessageServices from "../message/message.services";
import { UserWithRole } from "better-auth/plugins";
import { WithId } from "mongodb";

// Utility function to get IST time
const getISTTime = () => {
  return new Date(Date.now() + (5.5 * 60 * 60 * 1000)); // Add 5.5 hours for IST
};

export default class ReportServices {
    static async checkPastHighLevelViolations(deviceId: string, limit: number, user: WithId<Document> & { contactNumber: string }) {
        const twelveHoursAgo = new Date(Date.now() - (12 * 60 * 60 * 1000) + (5.5 * 60 * 60 * 1000)); // 12 hours ago in IST
        const reports = await ReportModel.find({ deviceId, violationLevel: "high", createdAt: { $gte: twelveHoursAgo } }).sort({ createdAt: -1 }).limit(limit);
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
        const twelveHoursAgo = new Date(Date.now() - (12 * 60 * 60 * 1000) + (5.5 * 60 * 60 * 1000)); // 12 hours ago in IST
        const reports = await ReportModel.find({ deviceId, violationLevel: "medium", createdAt: { $gte: twelveHoursAgo } }).sort({ createdAt: -1 }).limit(limit);
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
            createdAt: getISTTime(),
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
    static async getDashboardData() {
        try {
            // total number of vendors
            const users = await db.collection("user").find({role : "dj"}).toArray();
            const totalVendors = users.length;
            // total number of reports
            const totalReports = await ReportModel.countDocuments({});
            // total number of fines
            const totalFines = await ReportModel.countDocuments({isViolationFined : true});
            // total number of warnings
            const totalWarnings = await ReportModel.countDocuments({violationLevel : "medium"});
            // total number of high level violations
            const totalHighLevelViolations = await ReportModel.countDocuments({violationLevel : "high"});
            // total number of low level violations
            const totalLowLevelViolations = await ReportModel.countDocuments({violationLevel : "low"});
            // total number of active vendors (sessions that haven't expired)
            const totalActiveVendors = await db.collection("session").countDocuments({
                userId: { $in: users.map(user => user._id) },
                expiresAt: { $gt: new Date() }
            });
            return {
                totalVendors,
                totalReports,
                totalFines,
                totalWarnings,
                totalHighLevelViolations,
                totalLowLevelViolations,
                totalActiveVendors,
            };
        } catch (error) {
            throw error;
        }
    }
    static async getVendorReports({ query, limit = 30, page = 1 }: { query: any, limit: number, page: number }) {
        try {
            const skip = (page - 1) * limit;
            const [users, total] = await Promise.all([
                db.collection("user").find({role : "dj"}).limit(limit).skip(skip).toArray(),
                db.collection("user").countDocuments({role : "dj"})
            ]);
            const totalViolations = await ReportModel.find({
                userId: { $in: users.map(user => user._id) },
                violationLevel : { $in : ["high", "medium"] },
                ...query
            });
            const totalFines = await ReportModel.find({
                userId: { $in: users.map(user => user._id) },
                isViolationFined : true,
                ...query
            });
            const totalWarnings = await ReportModel.find({
                userId: { $in: users.map(user => user._id) },
                violationLevel : "medium",
                ...query
            });
            const totalHighLevelViolations = await ReportModel.find({
                userId: { $in: users.map(user => user._id) },
                violationLevel : "high",
                ...query
            });

            const usersWithReports = users.map((user) => {
                return {
                    ...user,
                    totalViolations : totalViolations.filter((report) => report.userId === user._id.toString()).length,
                    totalFines : totalFines.filter((report) => report.userId === user._id.toString()).length,
                    totalWarnings : totalWarnings.filter((report) => report.userId === user._id.toString()).length,
                    totalHighLevelViolations : totalHighLevelViolations.filter((report) => report.userId === user._id.toString()).length,
                }
            });

            return {
                docs : usersWithReports,
                total,
                page,
                limit,
                hasNextPage : page < Math.ceil(total / limit),
                hasPreviousPage : page > 1,
                totalPages : Math.ceil(total / limit),
            };
        } catch (error) {
            throw error;
        }
    }
}