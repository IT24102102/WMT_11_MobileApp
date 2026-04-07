const Purchase = require("../models/Purchase");
const Product = require("../models/Product");

// Generate a unique receipt number
const generateReceiptNumber = () => {
    const date = new Date();
    const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const random = Math.floor(Math.random() * 90000) + 10000;
    return `AGR-${datePart}-${random}`;
};

// @desc    Create a purchase (Product Manager buys from Farmer)
// @route   POST /api/purchases
const createPurchase = async (req, res, next) => {
    try {
        const { productId, paymentMethod } = req.body;

        const product = await Product.findById(productId).populate("seller", "name email");
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        if (product.status === "Out of Stock") {
            res.status(400);
            throw new Error("This product is already sold out");
        }

        if (product.seller._id.toString() === req.user._id.toString()) {
            res.status(400);
            throw new Error("You cannot purchase your own product");
        }

        const purchase = await Purchase.create({
            buyer: req.user._id,
            seller: product.seller._id,
            product: product._id,
            productName: product.name,
            amount: product.price,
            quantity: product.unit,
            paymentMethod,
            receiptNumber: generateReceiptNumber(),
            status: "Completed",
        });

        // Optionally mark product as sold (Out of Stock)
        product.status = "Out of Stock";
        await product.save();

        const populatedPurchase = await Purchase.findById(purchase._id)
            .populate("buyer", "name email")
            .populate("seller", "name email")
            .populate("product", "name image");

        res.status(201).json(populatedPurchase);
    } catch (error) {
        next(error);
    }
};

// @desc    Get purchases made by the logged-in Product Manager
// @route   GET /api/purchases/my-purchases
const getMyPurchases = async (req, res, next) => {
    try {
        const purchases = await Purchase.find({ buyer: req.user._id })
            .populate("seller", "name email")
            .populate("product", "name image")
            .sort({ createdAt: -1 });
        res.json(purchases);
    } catch (error) {
        next(error);
    }
};

// @desc    Get sales received by the logged-in Farmer
// @route   GET /api/purchases/my-sales
const getMySales = async (req, res, next) => {
    try {
        const sales = await Purchase.find({ seller: req.user._id })
            .populate("buyer", "name email")
            .populate("product", "name image")
            .sort({ createdAt: -1 });
        res.json(sales);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPurchase,
    getMyPurchases,
    getMySales
};
