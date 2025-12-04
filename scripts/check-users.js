// scripts/check-users.js

import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Resolve root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load .env
dotenv.config({ path: path.join(rootDir, ".env") });

// Import User model
import { User } from "../src/models/user.model.js";

async function check() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected. Fetching users...");
    const users = await User.find({}, "email role");

    console.log("Users:");
    console.log(users);

    await mongoose.disconnect();
    console.log("Done.");
  } catch (err) {
    console.error("Error:", err);
  }
}

check();
