const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Generate JWT
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret_123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  const { name, email, nic, phone, password, role, assignedAsc, specialization, serviceDistricts } = req.body;

  try {
    if (!name || !email || !nic || !password) {
      res.status(400);
      throw new Error("Please add all fields");
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    const nicExists = await User.findOne({ nic });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists with this email");
    }

    if (nicExists) {
      res.status(400);
      throw new Error("User already exists with this NIC");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      nic,
      phone: phone || "",
      password: hashedPassword,
      role: role || 'FARMER',
      assignedAsc: assignedAsc || null,
      specialization: specialization || null,
      serviceDistricts: serviceDistricts || []
    });

    const newUser = await User.findById(user._id).populate('assignedAsc', 'name district');

    if (newUser) {
      res.status(201).json({
        _id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        nic: newUser.nic,
        phone: newUser.phone,
        role: newUser.role,
        assignedAsc: newUser.assignedAsc,
        specialization: newUser.specialization,
        serviceDistricts: newUser.serviceDistricts,
        token: generateToken(newUser.id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate('assignedAsc', 'name district');

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        assignedAsc: user.assignedAsc,
        specialization: user.specialization,
        serviceDistricts: user.serviceDistricts,
        token: generateToken(user.id),
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('assignedAsc', 'name district');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, assignedAsc, specialization, serviceDistricts } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (assignedAsc !== undefined) user.assignedAsc = assignedAsc;
    if (specialization !== undefined) user.specialization = specialization;
    if (serviceDistricts !== undefined) user.serviceDistricts = serviceDistricts;

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select("-password")
      .populate("assignedAsc", "name district");

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile
};
