import { Router } from "express";
import {
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  loggedOutUser,
  loginUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgottenPassword,
  verifyEmailRequest,
} from "../controllers/auth.controllers.js";
import {
  changeCurrentPasswordValidator,
  resetForgottenPasswordValidator,
  userForgotPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
} from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//unsecure route
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/verify-email/:verificationToken").get(verifyEmailRequest);
router.route("/refresh-token").post(refreshAccessToken);
router
  .route("/forgot-password")
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
router
  .route("/reset-password/:resetToken")
  .post(resetForgottenPasswordValidator(), validate, resetForgottenPassword);

//secure routes
router.route("/logout").post(verifyJWT, loggedOutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification);

router
  .route("/change-password")
  .post(
    verifyJWT,
    changeCurrentPasswordValidator(),
    validate,
    changeCurrentPassword,
  );

export default router;
