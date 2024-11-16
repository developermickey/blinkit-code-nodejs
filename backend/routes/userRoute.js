const Router = require("express");
const {
  signUpUserController,
  verifyEmailController,
  loginUserController,
  logoutUserController,
  uploadAvatar,
  updateUserDetails,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
} = require("../controllers/userController");

const auth = require("../middlewares/auth");

const upload = require("../middlewares/multer");

const userRouter = Router();

// Correct way to pass auth middleware and controller
userRouter.get("/logout", auth, logoutUserController); // This is correct
userRouter.post("/register", signUpUserController); // This is correct
userRouter.post("/verify-email", verifyEmailController); // This is correct
userRouter.post("/login", loginUserController); // This is correct
userRouter.put("/upload-avatar", auth, upload.single("avatar"), uploadAvatar);
userRouter.put("/update-user", auth, updateUserDetails);
userRouter.put("/forgot-password", forgotPassword);
userRouter.put("/verify-forgot-password-otp", verifyForgotPasswordOtp);
userRouter.put("/reset-password", resetPassword);

module.exports = userRouter;
