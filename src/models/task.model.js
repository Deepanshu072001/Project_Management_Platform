// models/task.model.js
import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo"
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    attachments: [
      {
        filename: String,
        url: String,
        mimetype: String,
        size: Number
      }
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);
