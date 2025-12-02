import { Router } from "express";
import { 
    changeCurrentPassword, 
    forgotPasswordRequest, 
    getCurrentUser, 
    login, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    resendEmailVerification, 
    resetForgotPassword, 
    verifyEmail 
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import { 
    userRegisterValidator, 
    userLoginValidator, 
    userForgotPasswordValidator, 
    userResetForgotPasswordValidator, 
    userChangeCurrentPasswordValidator 
} from "../validations/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);

router.route("/login").post(userLoginValidator(), validate, login);

router.route("/verify-email/:verificationToken").get( verifyEmail );

router.route("/forgot-password").post( userForgotPasswordValidator(), validate, forgotPasswordRequest );

router.route("/reset-password/:resetToken").post( userResetForgotPasswordValidator(), validate, resetForgotPassword );

//secure route
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/current-user").post(verifyJWT, getCurrentUser);

router.route("/change-password").post(verifyJWT, userChangeCurrentPasswordValidator(), validate, changeCurrentPassword);

router.route("/resend-email-verification").post(verifyJWT, resendEmailVerification );


export default router;