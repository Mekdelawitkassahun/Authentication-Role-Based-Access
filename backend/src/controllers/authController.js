const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

const register = async (req, res, next) => {
  const existing = await User.findOne({ email: req.body.email });
  if (existing) return next(new AppError("Email already registered", 409));

  const user = await User.create(req.body);
  const token = signToken(user._id);

  return res.status(201).json({
    status: "success",
    token,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid credentials", 401));
  }

  const token = signToken(user._id);
  return res.status(200).json({
    status: "success",
    token,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

const me = async (req, res) =>
  res.status(200).json({
    status: "success",
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });

module.exports = { register, login, me };
