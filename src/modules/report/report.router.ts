import { Router } from "express";
import ReportHandler from "./report.handler";

const router = Router();

router.post("/", ReportHandler.createReport);
router.get("/", ReportHandler.createReportGet);
router.get("/list", ReportHandler.getReports);
router.delete("/", ReportHandler.clearReports);
router.get("/dashboard", ReportHandler.getDashboardData);
router.get("/vendor", ReportHandler.getVendorReports);

export default router;