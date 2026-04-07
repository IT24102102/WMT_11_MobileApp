const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    getAvailableProducts,
    getMyListings,
    createProduct,
    getPendingProducts,
    reviewProduct,
    deleteProduct
} = require("../Controllers/productController");

router.get("/testdump", async (req, res) => {
    const Product = require("../models/Product");
    const district = "Kandy";
    const query = {
        status: "Active",
        districts: { $regex: new RegExp(`^\\s*${district}\\s*$`, 'i') },
    };
    const products = await Product.find(query).lean();
    res.json({ query, results: products });
});

router.get("/available", protect, getAvailableProducts);
router.get("/my-listings", protect, authorize("PRODUCT_MANAGER", "FARMER"), getMyListings);
router.post("/", protect, authorize("PRODUCT_MANAGER", "FARMER"), createProduct);
router.get("/pending", protect, authorize("ADMIN"), getPendingProducts);
router.put("/:id/review", protect, authorize("ADMIN"), reviewProduct);
router.delete("/:id", protect, authorize("PRODUCT_MANAGER", "FARMER"), deleteProduct);

module.exports = router;
