import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.Controller.js";

const router =  Router();

router.route("/").get(healthCheck)


export default router;