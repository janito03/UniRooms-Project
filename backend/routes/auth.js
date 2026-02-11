const express = require("express");
const router = express.Router();
const { authenticate, isAdmin } = require("../middleware/auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (role === "admin") {
      return res.status(403).json({
        message: "Admin accounts can only be created via the setup script",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists",
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const allowedRoles = ["student", "teacher"];
    const normalizedRole = allowedRoles.includes(role) ? role : "student";

    const user = new User({
      username,
      email,
      password_hash,
      role: normalizedRole,
    });

    await user.save();

    res.status(201).json({
      message: "Registration successful",
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.isActive === false) {
      return res
        .status(403)
        .json({ message: "Account disabled. Contact admin." });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/users", authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-password_hash");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/users/:userId", authenticate, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.userId === userId) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isActive === false) {
      return res.status(400).json({ message: "User already disabled" });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: "User disabled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
