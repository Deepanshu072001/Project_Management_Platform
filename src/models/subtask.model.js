// models/subtask.model.js
import mongoose, { Schema } from "mongoose";

const subtaskSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export const Subtask = mongoose.model("Subtask", subtaskSchema);
