const mongoose = require("mongoose");
const Product = require("./models/Product");
const ASC = require("./models/ASC");
require("dotenv").config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const ascs = await ASC.find({ name: /Galagedara/i });
    console.log("ASC:", ascs);

    const kandyProducts = await Product.find({ districts: "Kandy" });
    console.log("Products in Kandy:", kandyProducts);
    
    // Check available products
    const allProducts = await Product.find({});
    console.log("All Products:", allProducts.map(p => ({id: p._id, districts: p.districts, name: p.name})));
    process.exit(0);
}
run();
