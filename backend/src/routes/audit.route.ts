import { Router } from "express";
import { auditController } from "../controllers/audit.controller.js";

const router = Router();

router.post("/", auditController);

export default router;
