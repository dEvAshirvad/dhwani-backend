import { Router } from "express";
import ReportHandler from "./report.handler";

const router = Router();

router.post("/", ReportHandler.createReport);
router.get("/", ReportHandler.createReportGet);
router.get("/list", ReportHandler.getReports);

export default router;