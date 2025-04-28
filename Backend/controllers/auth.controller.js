const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");

/**
 * @description Authenticate a user and generate JWT token
 */
let login = async (req, res) => {
  try {
    // Validate request body using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array() 
      });
    }

    // Extract credentials from request body
    const { email, password } = req.body;

    // Check if user exists in database
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({
      status: false, 
      message: "Email not found" 
    });

    // Verify password using bcrypt
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) return res.status(400).json({
      status: false, 
      message: "Invalid password" 
    });

    // Set token expiration time (in seconds)
    const expiresIn = 86400; // 24 hours in seconds
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

    // Generate JWT token with user information
    const token = jwt.sign(
      { 
        id: user.id.toString(), 
        email: user.email, 
        role: user.role 
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn }
    );

    let userData = user.toObject();
    delete userData.password;


    res.status(200).json({ 
      status: true, 
      user: userData,
      auth: {
        token,
        expiresAt,
        tokenType: 'Bearer'
      }
    });
  } catch (error) {
    // Send error response
    res.status(500).json({ 
      status: false, 
      message: "Server error" 
    });
  }
};

/**
 * @description Register a new user account
 */
let signup = async (req, res) => {
  try {
    // Validate request body using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false, 
        message: "Data validation fails", 
        errors: errors.array() 
      });
    }
    
    // Extract user details from request body
    let { name, email, password, role, phone, verified } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({
      status: false, 
      message: "User already exists" 
    });

    // Create new user with the provided details
    user = new User({ 
      name, 
      email, 
      password, 
      role, 
      phone, 
      verified 
    });
    
    // Save user to database
    let savedObject = await user.save();

    // Remove sensitive information from user object
    let userObject = savedObject.toObject();
    delete userObject.password;

    // Send success response with user data
    res.status(201).json({
      status: true, 
      message: "User created", 
      user: userObject 
    });
  } catch (error) {
    // Send error response
    res.status(500).json({ 
      status: false, 
      message: "Server error" 
    });
  }
};

/**
 * @description Get authenticated user's profile information
 */
let profile = function (req, res) {
  try {
    let userData = req.user.toObject();
    delete userData.password;
    res.status(200).json({
      status: true, 
      userData
    });
  } catch (error) {
    res.status(500).json({
      status: false, 
      message: "Server error" 
    });
  }
};

// Export controller functions
module.exports = { 
  login, 
  signup, 
  profile 
};
