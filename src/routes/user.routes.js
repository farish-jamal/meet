const express = require("express");
const multer = require("multer");
const { storage } = require("../storage/multer");
const { handlePostUpload } = require("../controller/user.controller");
const { user } = require("../middlewares/protectedRoutes");
const router = express.Router();

const upload = multer({ storage: storage });

router.route('/upload').post(user, upload.single('image'), handlePostUpload);

module.exports = router;