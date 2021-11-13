const express = require("express");
const userController = require("../controller/userController");
const user = require("./userRoutes");
const router = express.Router();

router.use("/user", user);

router.post("/AddBooks", /*Admin middleware setup */ userController.AddBook);
module.exports = router;
