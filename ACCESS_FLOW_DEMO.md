# Zero Trust System - Access Flow Demonstration

## 🎯 User Journey & Access Control

### 1. Landing Page (Public Access)
**Route:** `/`
- **Access:** Everyone (no authentication required)
- **Purpose:** Marketing page showcasing the Zero Trust system
- **Features:**
  - Hero section with call-to-action
  - Feature highlights (Device Auth, Role-Based Access, Monitoring)
  - Statistics showcase
  - "Get Started" and "Login" buttons

---

### 2. Login/Register Page
**Route:** `/login`
- **Access:** Everyone (no authentication required)
- **Purpose:** User authentication entry point
- **Features:**
  - Toggle between Login and Register
  - Username and password fields
  - Role selection (for registration)
  - Device fingerprint generation on submission

---

### 3. Dashboard (Authenticated Users)
**Route:** `/dashboard`
- **Access Requirements:**
  - ✅ Must be authenticated
  - ✅ User account must be active
- **Purpose:** User's main control panel
- **Features:**
  - Welcome message with username
  - User role display
  - Device trust status
  - Recent activity log
  - Quick action buttons

---

### 4. Reports Page (Staff & Admin Only)
**Route:** `/reports`
- **Access Requirements:**
  - ✅ Must be authenticated
  - ✅ User account must be active
  - ✅ Device must be TRUSTED
  - ✅ Role must be Staff or Admin
- **Purpose:** View sensitive system reports
- **Features:**
  - Report cards with different categories
  - Detailed report table
  - Access level indicators
- **Blocked Users:**
  - Guests (insufficient role)
  - Users with untrusted devices → redirected to `/device-pending`

---

### 5. Admin Panel (Admin Only)
**Route:** `/admin`
- **Access Requirements:**
  - ✅ Must be authenticated
  - ✅ User account must be active
  - ✅ Role must be Admin
- **Purpose:** Manage device trust and user access
- **Features:**
  - Device statistics overview
  - List all devices with trust status
  - Approve/Revoke device access
  - User management
- **Blocked Users:**
  - Guests and Staff (insufficient role)

---

### 6. Device Pending Page
**Route:** `/device-pending`
- **Access Requirements:**
  - ✅ Must be authenticated
- **Purpose:** Inform users their device needs approval
- **Features:**
  - Display device fingerprint
  - Instructions for getting approval
  - Copy fingerprint button
  - Return to dashboard link
- **When Shown:**
  - User tries to access `/reports` with untrusted device

---

## 🔐 Access Control Matrix

| Page | Guest (Untrusted) | Guest (Trusted) | Staff (Untrusted) | Staff (Trusted) | Admin |
|------|-------------------|-----------------|-------------------|-----------------|-------|
| Landing (/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Login | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reports | ❌ | ❌ | ❌ (→ pending) | ✅ | ✅ |
| Admin | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 Testing the Flow

### Test Scenario 1: New Guest User
1. Visit `/` → See landing page
2. Click "Get Started" → Go to `/login`
3. Register as Guest
4. Redirected to `/dashboard` → See welcome screen
5. Try to access `/reports` → Redirected to `/device-pending`
6. Device needs admin approval

### Test Scenario 2: Staff with Trusted Device
1. Visit `/` → See landing page
2. Login as Staff
3. Admin approves device
4. Access `/dashboard` → Success
5. Access `/reports` → Success (trusted device + staff role)
6. Try `/admin` → Blocked (insufficient role)

### Test Scenario 3: Admin User
1. Visit `/` → See landing page
2. Login as Admin
3. Access `/dashboard` → Success
4. Access `/reports` → Success
5. Access `/admin` → Success
6. Can approve/revoke any device

---

## 🎨 Visual Design Features

### Landing Page
- Animated gradient background
- Floating particles animation
- Modern hero section
- Feature cards with hover effects
- Statistics showcase
- Call-to-action sections

### Authenticated Pages
- Consistent header with navigation
- Gradient backgrounds
- Card-based layouts
- Smooth transitions and animations
- Role-based UI elements
- Status badges and indicators

---

## 🔄 Logout Flow
- Click "Logout" from any authenticated page
- Session cleared
- Redirected to landing page (`/`)
- Must login again to access protected resources
