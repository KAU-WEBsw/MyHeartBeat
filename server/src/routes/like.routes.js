const express = require("express");
const router = express.Router();

const likeController = require("../controllers/like.controller");

router.post("/likes", likeController.addLike);
router.delete("/likes", likeController.removeLike);

module.exports = router;