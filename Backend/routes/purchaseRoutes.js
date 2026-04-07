const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    createPurchase,
    getMyPurchases,
    getMySales
} = require("../Controllers/purchaseController");

router.post("/", protect, authorize("PRODUCT_MANAGER"), createPurchase);
router.get("/my-purchases", protect, authorize("PRODUCT_MANAGER"), getMyPurchases);
router.get("/my-sales", protect, authorize("FARMER"), getMySales);

module.exports = router;
