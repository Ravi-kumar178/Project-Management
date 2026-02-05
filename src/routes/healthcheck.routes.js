/**
 * @swagger
 * /api/v1/healthcheck:
 *   get:
 *     summary: Health check API
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server is running
 */


import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controllers.js";

const router = Router();

router.route("/").get(healthCheck);

export default router;
