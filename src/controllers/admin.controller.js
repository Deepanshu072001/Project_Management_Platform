// controllers/admin.controller.js
import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { Subtask } from "../models/subtask.model.js";
import { Note } from "../models/note.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

// Verify user is admin globally
const checkIsAdmin = (user) => {
  if (user.role !== "admin") {
    throw new ApiError(403, "Admin access required");
  }
};

// Admin Overview Dashboard

export const getAdminDashboard = asyncHandler(async (req, res) => {
  checkIsAdmin(req.user);

  const totalUsers = await User.countDocuments();
  const totalProjects = await Project.countDocuments();
  const totalTasks = await Task.countDocuments();
  const totalSubtasks = await Subtask.countDocuments();
  const totalNotes = await Note.countDocuments();

  const activeProjects = await Project.countDocuments({
    updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });

  return res.status(200).json(
    new ApiResponse(200, {
      totals: {
        users: totalUsers,
        projects: totalProjects,
        tasks: totalTasks,
        subtasks: totalSubtasks,
        notes: totalNotes
      },
      activity: {
        activeProjectsLast7Days: activeProjects
      }
    }, "Admin dashboard stats fetched")
  );
});

// User Statistics

export const getUserStats = asyncHandler(async (req, res) => {
  checkIsAdmin(req.user);

  const totalUsers = await User.countDocuments();
  const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
  const unverifiedUsers = totalUsers - verifiedUsers;

  const adminCount = await User.countDocuments({ role: "admin" });
  const projectAdminCount = await User.countDocuments({ role: "project_admin" });
  const memberCount = await User.countDocuments({ role: "member" });

  return res.status(200).json(
    new ApiResponse(200, {
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      roleDistribution: {
        admin: adminCount,
        project_admin: projectAdminCount,
        member: memberCount
      }
    }, "User stats fetched")
  );
});

// Project Statistics

export const getProjectStats = asyncHandler(async (req, res) => {
  checkIsAdmin(req.user);

  const totalProjects = await Project.countDocuments();
  const projects = await Project.find().select("name members createdAt updatedAt");

  const projectMemberCounts = projects.map((p) => ({
    projectId: p._id,
    name: p.name,
    memberCount: p.members.length,
    lastUpdated: p.updatedAt
  }));

  return res.status(200).json(
    new ApiResponse(200, {
      totalProjects,
      projectMemberCounts
    }, "Project statistics fetched")
  );
});

// Task Statistics

export const getTaskStats = asyncHandler(async (req, res) => {
  checkIsAdmin(req.user);

  const totalTasks = await Task.countDocuments();
  const todo = await Task.countDocuments({ status: "todo" });
  const inProgress = await Task.countDocuments({ status: "in_progress" });
  const done = await Task.countDocuments({ status: "done" });

  return res.status(200).json(
    new ApiResponse(200, {
      totalTasks,
      statusDistribution: {
        todo,
        in_progress: inProgress,
        done
      }
    }, "Task stats fetched")
  );
});


// Recent Activity (Optional)

export const getRecentActivity = asyncHandler(async (req, res) => {
  checkIsAdmin(req.user);

  const recentTasks = await Task.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select("title status createdAt projectId");

  const recentProjects = await Project.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select("name createdAt");

  return res.status(200).json(
    new ApiResponse(200, {
      recentTasks,
      recentProjects
    }, "Recent activity fetched")
  );
});
