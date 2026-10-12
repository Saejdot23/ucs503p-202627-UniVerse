import { Router } from "express";
import { createReport, listReports, resolveReport } from "../controllers/report.controllers.js";
import { verifyJWT, requireAdmin } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(createReport).get(requireAdmin, listReports);
router.route("/:id").patch(requireAdmin, resolveReport);

export default router;
