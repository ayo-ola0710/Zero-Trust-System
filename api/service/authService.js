import bycrypt from "bcrypt";
import { query } from "../config/db.js";
import { generateToken } from "../utils/token.js";

export const registerUser = async (username, role, password, deviceFingerprint) => {
  try {
    const doesExisit = await query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (doesExisit.rows.length > 0) {
      throw new Error("User already exists");
    }

    const hashedpassword = bycrypt.hashSync(password, 12);

    const newUser = {
      username,
      role,
      status: "active",
      password: hashedpassword,
    };

    const result = await query(
      "INSERT INTO users (username, role, status, password) VALUES (?, ?, ?, ?)",
      [newUser.username, newUser.role, newUser.status, newUser.password],
    );

    const userId = result.lastID;

    if (deviceFingerprint) {
      await query(
        "INSERT INTO devices (user_id, device_fingerprint, trusted_status) VALUES (?, ?, ?)",
        [userId, deviceFingerprint, "trusted"],
      );
    }

    // Log registration
    await query(
      "INSERT INTO logs (user_id, resource_accessed, status) VALUES (?, ?, ?)",
      [userId, "/api/auth/register", "Success - User Registered"]
    );

    return { ...newUser, id: userId };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const loginUser = async (username, password, deviceFingerprint) => {
  try {
    const user = await query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (user.rows.length === 0) {
      throw new Error("User not found");
    }

    const isPasswordValid = bycrypt.compareSync(
      password,
      user.rows[0].password,
    );
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    if (user.rows[0].status !== "active") {
      throw new Error("User is not active");
    }

    const userId = user.rows[0].id;

    // Check if the device exists for this user
    const existingDevice = await query(
      "SELECT * FROM devices WHERE user_id = ? AND device_fingerprint = ?",
      [userId, deviceFingerprint],
    );

    if (existingDevice.rows.length === 0) {
      // Save the new device fingerprint
      await query(
        "INSERT INTO devices (user_id, device_fingerprint, trusted_status) VALUES (?, ?, ?)",
        [userId, deviceFingerprint, "untrusted"], // New devices are untrusted by default
      );
    }

    const token = generateToken({
      id: userId,
      username: user.rows[0].username,
      role: user.rows[0].role,
    });

    // Log successful login
    const deviceStatus = existingDevice.rows.length > 0 
      ? existingDevice.rows[0].trusted_status 
      : "untrusted";
    await query(
      "INSERT INTO logs (user_id, resource_accessed, status) VALUES (?, ?, ?)",
      [userId, "/api/auth/login", `Success - Login (Device: ${deviceStatus})`]
    );

    return { ...user.rows[0], token, deviceFingerprint };
  } catch (error) {
    throw new Error(error.message);
  }
};
