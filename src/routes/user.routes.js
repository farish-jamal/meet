const express = require("express");
const multer = require("multer");
const { storage } = require("../storage/multer");
const {
  handlePostUpload,
  handleGetProfile,
  handleGetExplorePage,
  handleGetSinglePost,
  handleAddFriends
} = require("../controller/user.controller");
const { user } = require("../middlewares/protectedRoutes");
const router = express.Router();

const upload = multer({ storage: storage });

router.route("/upload").post(user, upload.single("image"), handlePostUpload);
router.route("/profile").get(user, handleGetProfile);
router.route("/explore").get(user, handleGetExplorePage);
router.route("/post/:id").get(user, handleGetSinglePost);
router.route("/addFriends").post(user, handleAddFriends);


router.use((err, req, res, next) => {
 console.error(err.stack);
 res.status(err.statusCode || 500).json({
   message: err.message || 'Internal Server Error',
 });
});


module.exports = router;
