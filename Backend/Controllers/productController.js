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

        // Deduplicate
        targetDistricts = [...new Set(targetDistricts)];

        console.log(`[DEBUG] User ${user.email} (${user.role}) fetching products. Target Districts: [${targetDistricts.join(', ') || 'ALL'}]`);

        // 2. Apply district filter if user has a location preference
        if (targetDistricts.length > 0) {
            const regexDistricts = targetDistricts.map(d => new RegExp(`^\\s*${d}\\s*$`, 'i'));
            query.districts = { $in: regexDistricts };
        }

        // 3. Exclude user's own products
        query.seller = { $ne: user._id };

        const products = await Product.find(query).populate("seller", "name email phone");
        const totalProducts = await Product.countDocuments();
        console.log(`[DEBUG] Found ${products.length} matching products. (Total in DB: ${totalProducts})`);
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
            // If user provides specific districts, use them (filtering by service area for Managers if needed)
            districts = customDistricts.filter(d => d && d.trim());
        } else {
            // Default logic
            if (user.role === 'PRODUCT_MANAGER') {
                districts = user.serviceDistricts;
            } else if (user.role === 'FARMER') {
                districts = [user.assignedAsc?.district];
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
