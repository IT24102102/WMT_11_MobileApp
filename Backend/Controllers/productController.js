const Product = require("../models/Product");

// @desc    Get products available in user's region (Farmer/Public)
// @route   GET /api/products/available
const getAvailableProducts = async (req, res, next) => {
    try {
        const user = req.user;
        let query = { status: "Active" };

        // 1. Collect all target districts for the user
        let targetDistricts = [];
        
        // From assigned ASC (Farmers, Officers, etc)
        if (user.assignedAsc?.district) {
            targetDistricts.push(user.assignedAsc.district.trim());
        }
        
        // From service areas (Product Managers)
        if (user.serviceDistricts && user.serviceDistricts.length > 0) {
            user.serviceDistricts.forEach(d => {
                if (d && d.trim()) targetDistricts.push(d.trim());
            });
        }

        // Deduplicate and filter out empty strings
        targetDistricts = [...new Set(targetDistricts)].filter(d => d && d.trim());

        console.log(`[AVAILABILITY_DEBUG] --- Request Start ---`);
        console.log(`[AVAILABILITY_DEBUG] User ID: ${user._id}`);
        console.log(`[AVAILABILITY_DEBUG] User Role: ${user.role}`);
        console.log(`[AVAILABILITY_DEBUG] Assigned ASC: ${JSON.stringify(user.assignedAsc)}`);
        console.log(`[AVAILABILITY_DEBUG] Target Districts: [${targetDistricts.join(', ')}]`);

        // 2. Apply district filter
        if (targetDistricts.length > 0) {
            // Using a more robust regex that handles any weird spacing/casing better
            query.$or = targetDistricts.map(d => ({
                districts: { $regex: new RegExp(d.trim(), 'i') }
            }));
        }

        const totalActiveInDB = await Product.countDocuments({ status: "Active" });
        console.log(`[AVAILABILITY_DEBUG] Total Active Products in DB (anywhere): ${totalActiveInDB}`);

        const products = await Product.find(query).populate("seller", "name email phone");
        console.log(`[AVAILABILITY_DEBUG] Matching Products Found: ${products.length}`);
        console.log(`[AVAILABILITY_DEBUG] --- Request End ---`);
        res.json(products);
    } catch (error) {
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
