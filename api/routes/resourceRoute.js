import { Router } from "express";
import { zeroTrustEngine } from "../middleware/zeroTrustMiddleware.js";

const resourceRouter = Router();

// A public route
resourceRouter.get("/public", (req, res) => {
  res.json({ message: "This is a public resource." });
});

// A route protected by the Zero Trust Engine for all authenticated users
resourceRouter.get("/profile", zeroTrustEngine(['admin', 'staff', 'guest']), (req, res) => {
  res.json({ message: `Hello ${req.user.username}, this is your protected profile.`, user: req.user });
});

// A route restricted to admins only
resourceRouter.get("/admin-data", zeroTrustEngine(['admin']), (req, res) => {
  res.json({ message: "Welcome Admin! Here is the sensitive data." });
});

// A route restricted to staff or admins
resourceRouter.get("/staff-docs", zeroTrustEngine(['admin', 'staff']), (req, res) => {
  res.json({ message: "Welcome Staff! Here are the documentation files." });
});

export default resourceRouter;
