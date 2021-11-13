const router = require("express").Router();

const userController = require("../controller/userController");

const { isAuthenticated, signup } = require("../middlewares");
/*get*/
/*__Email Verification__*/
router.get("/Verify/:token", userController.EmailVerification);
/*__Reset password Form __*/
router.get("/reset/:token", userController.Resetpasswordcreate);
/*__Dash border __*/
router.get("/dash", isAuthenticated, userController.BookSearch);
/*post*/
/*__Signup__*/
router.post("/signup", signup, userController.signup);
/*__login and books for user__*/
router.post("/login", userController.login, userController.BookSearch);
/*Resending Email verification */
router.post("/ResendVerifymail", userController.ResendEmailVerification);
/*posting request for forgetpassworld */
router.post("/Forgetpassword", userController.forgetpasswordReq);
/*changing password  */
router.post("/reset/:token", userController.Resetpassword);

module.exports = router;
