const router = require("express").Router();
const userControllers = require("../controllers/userControllers");

//get all users
router.get("/user/all", userControllers.getAllUsers);
//get user by username
router.get("/user/:username", userControllers.getUserByUsername);

//create user
router.post("/user/register", userControllers.createUser);
//login user
router.post("/user/login", userControllers.signin);
//change user password
router.patch("/user/changepassword/:userId", userControllers.changePassword);

//forgot password api
router.post("/user/forgot-password", userControllers.forgot_password);
//reset password api
router.patch("/user/reset-password/:tokenId", userControllers.reset_password);

module.exports = router;
