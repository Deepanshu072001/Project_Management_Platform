// routes/member.route.js
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  memberAddValidator,
  memberRoleUpdateValidator
} from "../validations/member.validation.js";

import {
  addMemberToProject,
  getProjectMembers,
  updateMemberRole,
  removeProjectMember
} from "../controllers/member.controller.js";

const router = Router();

// All member routes require login
router.use(verifyJWT);

// GET /:projectId/members -> list members
router.route("/:projectId/members").get(getProjectMembers);

// POST /:projectId/members -> add member
router
  .route("/:projectId/members")
  .post(memberAddValidator(), validate, addMemberToProject);

// PUT /:projectId/members/:userId -> update role
router
  .route("/:projectId/members/:userId")
  .put(memberRoleUpdateValidator(), validate, updateMemberRole);

// DELETE /:projectId/members/:userId -> remove user
router.route("/:projectId/members/:userId").delete(removeProjectMember);

export default router;
