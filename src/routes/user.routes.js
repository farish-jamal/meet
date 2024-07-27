const express = require("express");
const multer = require("multer");
const { storage } = require("../storage/multer");
const {
  handlePostUpload,
  handleGetProfile,
  handleGetExplorePage,
  handleGetSinglePost
} = require("../controller/user.controller");
const { user } = require("../middlewares/protectedRoutes");
const router = express.Router();

const upload = multer({ storage: storage });

router.route("/upload").post(user, upload.single("image"), handlePostUpload);
router.route("/profile").get(user, handleGetProfile);
router.route("/explore").get(user, handleGetExplorePage);
router.route("/post/:id").get(user, handleGetSinglePost);

module.exports = router;
