const express = require("express");
const multer = require("multer");
const { storage } = require("../storage/multer");
const { handlePostUpload, handleGetProfile } = require("../controller/user.controller");
const { user } = require("../middlewares/protectedRoutes");
const router = express.Router();

const upload = multer({ storage: storage });

router.route('/upload').post(user, upload.single('image'), handlePostUpload);
router.route('/profile').get(user, handleGetProfile)

module.exports = router;