const Product = require("../models/Product");

// @desc    Get products available in user's region (Farmer/Public)
// @route   GET /api/products/available
const getAvailableProducts = async (req, res, next) => {
    try {
        const user = req.user;
        let query = { status: "Active" };

        // 1. Collect all target districts for the user
        let targetDistricts = [];
        
        // Use both assignedAsc and a direct 'district' field if it exists
        if (user.assignedAsc?.district) {
            targetDistricts.push(user.assignedAsc.district.trim());
        } else if (user.district) {
            targetDistricts.push(user.district.trim());
        }
        
        if (user.serviceDistricts && user.serviceDistricts.length > 0) {
            user.serviceDistricts.forEach(d => { if (d) targetDistricts.push(d.trim()); });
        }

        targetDistricts = [...new Set(targetDistricts)].filter(Boolean);

        console.log(`[AVAILABILITY_DEBUG] User: ${user.email} | Districts: [${targetDistricts}]`);

        // BUILD QUERY
        let query = { status: "Active" };
        
        if (targetDistricts.length > 0) {
            // Case-insensitive regex match for ANY of the target districts
            query.districts = { 
                $in: targetDistricts.map(d => new RegExp(d, 'i')) 
            };
        }

        // Blind search just to check DB connectivity and content
        const allActive = await Product.find({ status: "Active" }).limit(5).lean();
        console.log(`[AVAILABILITY_DEBUG] Sample Active Products in DB: ${allActive.map(p => p.name + "(" + p.districts + ")").join(', ')}`);

        const products = await Product.find(query).populate("seller", "name email phone");
        console.log(`[AVAILABILITY_DEBUG] Matching Products Found: ${products.length} for districts ${targetDistricts}`);

        res.json(products);
    } catch (error) {
        console.error("[AVAILABILITY_DEBUG] ERROR:", error);
        next(error);
    }
};

// @desc    Get manager's own listings
// @route   GET /api/products/my-listings
const getMyListings = async (req, res, next) => {
    try {
        const products = await Product.find({ seller: req.user._id }).populate("seller", "name email");
        res.json(products);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new product listing
// @route   POST /api/products
const createProduct = async (req, res, next) => {
    try {
        const { name, category, description, price, unit, image, stock, districts: customDistricts } = req.body;
        const user = req.user;

        let districts = [];
        if (customDistricts && Array.isArray(customDistricts) && customDistricts.length > 0) {
            // If user provides specific districts, use them and trim them
            districts = customDistricts.filter(d => d && typeof d === 'string').map(d => d.trim());
        } else {
            // Default logic
            if (user.role === 'PRODUCT_MANAGER' && user.serviceDistricts) {
                districts = user.serviceDistricts.map(d => d.trim());
            } else if (user.role === 'FARMER' && user.assignedAsc?.district) {
                districts = [user.assignedAsc.district.trim()];
            }
        }

        if (!districts || districts.length === 0 || !districts[0]) {
            res.status(400);
            throw new Error("You must have a district assigned to list products.");
        }

        const regulatedCategories = ["Animal Health & Nutrition", "Crop Protection", "Crop Nutrients"];
        const status = (user.role === 'PRODUCT_MANAGER' && regulatedCategories.includes(category)) ? "Pending" : "Active";

        const product = await Product.create({
            name,
            category,
            description,
            price,
            unit,
            districts,
            seller: user._id,
            sellerRole: user.role,
            image,
            stock: Number(stock) || 0,
            status
        });

        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all pending products (Admin)
// @route   GET /api/products/pending
const getPendingProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ status: "Pending" }).populate("seller", "name email");
        res.json(products);
    } catch (error) {
        next(error);
    }
};

// @desc    Review/Approve a product listing
// @route   PUT /api/products/:id/review
const reviewProduct = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['Active', 'Rejected'].includes(status)) {
            res.status(400);
            throw new Error("Invalid status");
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        product.status = status;
        await product.save();
        res.json(product);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a product listing
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        if (product.seller.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error("Not authorized to delete this product");
        }

        await product.deleteOne();
        res.json({ message: "Product removed" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAvailableProducts,
    getMyListings,
    createProduct,
    getPendingProducts,
    reviewProduct,
    deleteProduct
};
