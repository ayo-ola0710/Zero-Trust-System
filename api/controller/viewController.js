import crypto from "crypto";
import { query } from "../config/db.js";

export const renderLanding = (req, res) => {
    res.render("landing", { layout: false });
};

export const renderLogin = (req, res) => {
    res.render("login", { error: req.query.error || null, layout: false });
};

export const renderDashboard = async (req, res) => {
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ip = req.ip || req.connection.remoteAddress || "Unknown";
    const deviceFingerprint = crypto.createHash("sha256").update(userAgent + ip).digest("hex");

    const deviceResult = await query(
        "SELECT * FROM devices WHERE user_id = ? AND device_fingerprint = ?",
        [req.user.id, deviceFingerprint]
    );

    res.render("dashboard", { 
        user: req.user, 
        device: deviceResult.rows[0],
        deviceFingerprint 
    });
};

export const renderReports = (req, res) => {
    res.render("reports", { user: req.user });
};

export const renderAdmin = async (req, res) => {
    const devicesResult = await query(`
        SELECT devices.*, users.username 
        FROM devices 
        JOIN users ON devices.user_id = users.id
    `);

    const logsResult = await query(`
        SELECT logs.*, users.username 
        FROM logs 
        JOIN users ON logs.user_id = users.id 
        ORDER BY logs.access_time DESC 
        LIMIT 50
    `);

    res.render("admin", { 
        user: req.user, 
        devices: devicesResult.rows, 
        logs: logsResult.rows 
    });
};

export const renderDevicePending = (req, res) => {
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ip = req.ip || req.connection.remoteAddress || "Unknown";
    const deviceFingerprint = crypto.createHash("sha256").update(userAgent + ip).digest("hex");

    res.render("device-pending", { user: req.user, deviceFingerprint });
};

// Admin Actions
export const trustDevice = async (req, res) => {
    const { deviceId } = req.body;
    await query("UPDATE devices SET trusted_status = 'trusted' WHERE id = ?", [deviceId]);
    res.redirect("/admin");
};

export const revokeDevice = async (req, res) => {
    const { deviceId } = req.body;
    await query("UPDATE devices SET trusted_status = 'untrusted' WHERE id = ?", [deviceId]);
    res.redirect("/admin");
};
