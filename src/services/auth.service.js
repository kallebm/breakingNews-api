import User from "../models/User.js";
import jwt from "jsonwebtoken";

const loginService = (emailUnique) =>
  User.findOne({ email: emailUnique }).select("+password");

const generateToken = (id) =>
  jwt.sign({ id: id }, process.env.SECRET_JWT, { expiresIn: 86400 });

export { loginService, generateToken };
