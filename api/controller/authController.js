import crypto from "crypto";
import { registerUser, loginUser } from "../service/authService.js";

export const register = async (req, res) => {
  try {
    const { username, role, password } = req.body;
    
    // Generate device fingerprint
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ip = req.ip || req.connection.remoteAddress || "Unknown";
    const deviceFingerprint = crypto
      .createHash("sha256")
      .update(userAgent + ip)
      .digest("hex");

    const newUser = await registerUser(username, role, password, deviceFingerprint);
    
    // Set cookie for browser
    res.cookie("token", newUser.token, { httpOnly: true });

    // Handle both JSON and Form requests
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      return res.redirect("/dashboard");
    }

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser, deviceFingerprint });
  } catch (error) {
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      return res.render("login", { error: error.message, layout: false });
    }
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Generate device fingerprint
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ip = req.ip || req.connection.remoteAddress || "Unknown";
    const deviceFingerprint = crypto
      .createHash("sha256")
      .update(userAgent + ip)
      .digest("hex");

    const user = await loginUser(username, password, deviceFingerprint);

    // Set cookie for browser
    res.cookie("token", user.token, { httpOnly: true });

    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      return res.redirect("/dashboard");
    }

    res.status(200).json({ message: "Login successful", user, deviceFingerprint });
  } catch (error) {
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      return res.render("login", { error: error.message, layout: false });
    }
    res.status(400).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  // Log logout if user is authenticated
  if (req.user) {
    try {
      const { query } = await import("../config/db.js");
      await query(
        "INSERT INTO logs (user_id, resource_accessed, status) VALUES (?, ?, ?)",
        [req.user.id, "/api/auth/logout", "Success - Logout"]
      );
    } catch (error) {
      console.error("Failed to log logout:", error.message);
    }
  }
  res.clearCookie("token");
  res.redirect("/");
};
