import { Router } from "express";
import { 
    renderLanding,
    renderLogin, 
    renderDashboard, 
    renderReports, 
    renderAdmin, 
    renderDevicePending,
    trustDevice,
    revokeDevice
} from "../controller/viewController.js";
import { authenticate, checkUserStatus, checkDeviceTrust, authorizeRole, logAccess } from "../middleware/zeroTrustMiddleware.js";

const viewRouter = Router();

// Landing page (public)
viewRouter.get("/", renderLanding);

viewRouter.get("/login", renderLogin);

// Dashboard: Auth + Active Status
viewRouter.get("/dashboard", authenticate, logAccess, checkUserStatus, renderDashboard);

// Reports: Auth + Active + Trusted Device + Role(Staff/Admin)
viewRouter.get("/reports", authenticate, logAccess, checkUserStatus, checkDeviceTrust, authorizeRole(['staff', 'admin']), renderReports);

// Admin: Auth + Active + Role(Admin)
viewRouter.get("/admin", authenticate, logAccess, checkUserStatus, authorizeRole(['admin']), renderAdmin);

// Admin Actions
viewRouter.post("/api/admin/trust-device", authenticate, logAccess, checkUserStatus, authorizeRole(['admin']), trustDevice);
viewRouter.post("/api/admin/revoke-device", authenticate, logAccess, checkUserStatus, authorizeRole(['admin']), revokeDevice);

// Device Pending: Auth only (so they can see why they are blocked)
viewRouter.get("/device-pending", authenticate, logAccess, renderDevicePending);

export default viewRouter;
