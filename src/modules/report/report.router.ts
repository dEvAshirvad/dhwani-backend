import { Router } from "express";
import ReportHandler from "./report.handler";

const router = Router();

router.post("/", ReportHandler.createReport);
router.get("/", ReportHandler.createReportGet);
router.get("/list", ReportHandler.getReports);
router.delete("/", ReportHandler.clearReports);

export default router;