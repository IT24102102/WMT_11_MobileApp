const express = require("express");
const router = express.Router();
const {
    registerCrop,
    getCrops,
    updateCropStatus
} = require("../Controllers/cropController");
const { protect, authorize } = require("../middleware/authMiddleware");

// @desc    Register a new crop
// @route   POST /api/crops
router.post("/", protect, authorize("FARMER"), registerCrop);

// @desc    Get all crops (Farmers see their own, Officers see their ASC)
// @route   GET /api/crops
router.get("/", protect, getCrops);

// @desc    Update crop registration status
// @route   PATCH /api/crops/:id/status
router.patch("/:id/status", protect, authorize("CROP_OFFICER", "ASC_OFFICER"), updateCropStatus);

module.exports = router;
