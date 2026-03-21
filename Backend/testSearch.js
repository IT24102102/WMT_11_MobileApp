const mongoose = require("mongoose");
const User = require("./models/User");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const testFind = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: "farmer@test.com" });
        if (user) {
            console.log("✅ Found user:", user.email, "Role:", user.role);
        } else {
            console.log("❌ User not found!");
        }
        process.exit(0);
    } catch (err) {
        console.error("❌ DB Search Error:", err);
        process.exit(1);
    }
};
testFind();
