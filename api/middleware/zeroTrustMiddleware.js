import crypto from "crypto";
import { verifyToken } from "../utils/token.js";
import { query } from "../config/db.js";

// Step 11: Authentication Middleware
export const authenticate = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    if (req.headers.accept?.includes("text/html")) {
      return res.redirect("/login");
    }
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Contains id, username, role
    next();
  } catch (error) {
    res.clearCookie("token");
    if (req.headers.accept?.includes("text/html")) {
      return res.redirect("/login");
    }
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

// Step 12: User Status Middleware (Helper for Zero Trust)
export const checkUserStatus = async (req, res, next) => {
  try {
    const user = await query("SELECT status FROM users WHERE id = ?", [req.user.id]);
    if (user.rows.length === 0 || user.rows[0].status !== "active") {
      if (req.headers.accept?.includes("text/html")) {
        res.clearCookie("token");
        return res.redirect("/login?error=account_inactive");
      }
      return res.status(403).json({ error: "User account is inactive or not found." });
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: "Server error checking user status." });
  }
};

// Step 12: Device Trust Middleware
export const checkDeviceTrust = async (req, res, next) => {
  try {
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ip = req.ip || req.connection.remoteAddress || "Unknown";
    const deviceFingerprint = crypto
      .createHash("sha256")
      .update(userAgent + ip)
      .digest("hex");

    const device = await query(
      "SELECT trusted_status FROM devices WHERE user_id = ? AND device_fingerprint = ?",
      [req.user.id, deviceFingerprint]
    );

    if (device.rows.length === 0 || device.rows[0].trusted_status !== "trusted") {
      if (req.headers.accept?.includes("text/html")) {
        return res.redirect("/device-pending");
      }
      return res.status(403).json({ 
        error: "Device is not trusted.", 
        redirect: "/device-pending" 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: "Server error checking device trust." });
  }
};

// Step 13: Role-Based Access Middleware
export const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      if (req.headers.accept?.includes("text/html")) {
        return res.status(403).render("layout", { 
          user: req.user,
          body: "<h2>Access Denied</h2><p>You do not have permission to view this page.</p>" 
        });
      }
      return res.status(403).json({ 
        error: `Access denied. Role '${req.user.role}' is not authorized for this resource.` 
      });
    }
    next();
  };
};

// Step 22: Access Logging Middleware
export const logAccess = async (req, res, next) => {
  // We'll wrap the original next() or response methods to capture the final outcome
  const originalNext = next;
  const originalRender = res.render;
  const originalJson = res.json;
  const originalRedirect = res.redirect;

  const recordLog = async (status) => {
    if (req.user) {
      try {
        await query(
          "INSERT INTO logs (user_id, resource_accessed, status) VALUES (?, ?, ?)",
          [req.user.id, req.originalUrl, status]
        );
      } catch (err) {
        console.error("❌ Failed to log access:", err.message);
      }
    }
  };

  // Intercept Redirect (usually Denials/Redirects to pending)
  res.redirect = function (url) {
    const status = url.includes("login") || url.includes("device-pending") ? "Denied (Redirect)" : "Allowed (Redirect)";
    recordLog(status);
    return originalRedirect.apply(res, arguments);
  };

  // Intercept JSON (API Denials or Success)
  res.json = function (data) {
    const status = res.statusCode >= 400 ? `Denied (${res.statusCode})` : "Allowed (JSON)";
    recordLog(status);
    return originalJson.apply(res, arguments);
  };

  // Intercept Render (UI Success or Denials)
  res.render = function (view, options) {
    const status = res.statusCode >= 400 ? `Denied (${res.statusCode})` : "Allowed (UI)";
    recordLog(status);
    return originalRender.apply(res, arguments);
  };

  next();
};

// Step 14: Combine Middleware (Zero Trust Engine)
export const zeroTrustEngine = (allowedRoles = ['admin', 'staff', 'guest']) => {
  return [
    authenticate,
    logAccess, // Added Logging here to capture attempts after authentication
    checkUserStatus,
    checkDeviceTrust,
    authorizeRole(allowedRoles)
  ];
};
