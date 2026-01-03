import mongoose from "mongoose";
import os from "os";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

export const healthCheck = asyncHandler(async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";

    const healthData = {
        server: {
            status: "OK",
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        },
        database: {
            status: dbStatus,
        },
        system: {
            platform: os.platform(),
            cpu: os.cpus().length + " cores",
            memory: {
                total: os.totalmem(),
                free: os.freemem(),
                used: process.memoryUsage(),
            }
        },
        meta: {
            version: "1.0.0",
            environment: process.env.NODE_ENV || "development"
        }
    };

    return res.status(200).json(
        new ApiResponse(200, healthData, "System health OK")
    );
});
