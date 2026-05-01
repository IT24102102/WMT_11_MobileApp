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

        // Apply district filter if targetDistricts exist
        if (targetDistricts.length > 0) {
            // Support various casings to ensure matches (Kandy, kandy, KANDY)
            const districtVariants = targetDistricts.flatMap(d => [
                d,
                d.toLowerCase(),
                d.toUpperCase(),
                d.charAt(0).toUpperCase() + d.slice(1).toLowerCase()
            ]);
            query.districts = { $in: [...new Set(districtVariants)] };
        }

        // NOTE: We are NOT adding sellerRole: 'PRODUCT_MANAGER' here because 
        // some existing products in the DB (like Curbix) are missing that field.
        // This ensures maximum visibility for the Farmer.

        console.log(`[AVAILABILITY_DEBUG] User: ${user.email} | Districts: [${targetDistricts}]`);

        // Log totals for debugging
        const totalInDB = await Product.countDocuments({});
        const totalActiveInDB = await Product.countDocuments({ status: "Active" });
        console.log(`[AVAILABILITY_DEBUG] Total in DB: ${totalInDB} | Total Active: ${totalActiveInDB}`);

        const products = await Product.find(query)
            .populate("seller", "name email phone")
            .populate("manager", "name email phone");

        // Map products to ensure they have a 'seller' field even if the DB record uses 'manager'
        const mappedProducts = products.map(p => {
            const productObj = p.toObject();
            if (!productObj.seller && productObj.manager) {
                productObj.seller = productObj.manager;
            }
            // Ensure a fallback name if seller population failed
            if (!productObj.seller) {
                productObj.seller = { name: "AgroLanka Provider" };
            }
            return productObj;
        });

        console.log(`[AVAILABILITY_DEBUG] Returning ${mappedProducts.length} products to frontend.`);

        res.json(mappedProducts);
    } catch (error) {
        console.error("[AVAILABILITY_DEBUG] ERROR:", error);
        next(error);
    }
};

// @desc    Get manager's own listings
// @route   GET /api/products/my-listings
const getMyListings = async (req, res, next) => {
    try {
        // Find products where current user is either 'seller' or 'manager'
        const products = await Product.find({ 
            $or: [{ seller: req.user._id }, { manager: req.user._id }] 
        }).populate("seller", "name email").populate("manager", "name email");
        
        // Ensure consistency for frontend
        const mappedProducts = products.map(p => {
            const productObj = p.toObject();
            if (!productObj.seller && productObj.manager) {
                productObj.seller = productObj.manager;
            }
            return productObj;
        });

        res.json(mappedProducts);
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

        if (product.seller?.toString() !== req.user._id.toString() && 
            product.manager?.toString() !== req.user._id.toString()) {
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
