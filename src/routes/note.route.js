// routes/note.route.js
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";

import {
  createNote,
  getNotes,
  getNoteDetails,
  updateNote,
  deleteNote
} from "../controllers/note.controller.js";

import {
  noteCreateValidator,
  noteUpdateValidator
} from "../validations/note.validation.js";

const router = Router();

router.use(verifyJWT);

// List + Create Notes
router
  .route("/:projectId")
  .get(getNotes)
  .post(noteCreateValidator(), validate, createNote);

// Note Details + Update + Delete
router
  .route("/:projectId/n/:noteId")
  .get(getNoteDetails)
  .put(noteUpdateValidator(), validate, updateNote)
  .delete(deleteNote);

export default router;
