import { Router } from "express";
import {
  verifyJWT,
  validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createProjectNoteValidator } from "../validators/index.js";

import { UserRolesEnum } from "../utils/constants.js";

import {
  createProjectNote,
  listProjectNote,
  getProjectNoteDetails,
  updateProjectNote,
  deleteProjectNote,
} from "../controllers/note.controllers.js";

const router = Router();
router.use(verifyJWT);

router
  .route("/:projectId")
  .post(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    createProjectNoteValidator(),
    validate,
    createProjectNote,
  )
  .get(
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
      UserRolesEnum.PROJECT_MEMBER,
    ]),
    listProjectNote,
  );

router
  .route("/:projectId/n/:noteId")
  .get(
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
      UserRolesEnum.PROJECT_MEMBER,
    ]),
    getProjectNoteDetails,
  )
  .put(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    createProjectNoteValidator(),
    validate,
    updateProjectNote,
  )
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteProjectNote);

export default router;
