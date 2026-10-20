# LeaveFlow — Frontend Application

Modern, intuitive, and responsive single-page web application for **LeaveFlow Enterprise Leave Management System**. Built with **React 19**, **Vite**, **Tailwind CSS v4**, and **Lucide Icons**.

---

## 🌟 Highlights & Features

- **Employee Self-Service**:
  - Interactive leave application form with live working-day calculations (auto-excluding weekends & holidays).
  - Dynamic interactive multi-date picker with **color-coded disabled dates** (🟡 Amber for Pending requests, 🟢 Green for Approved requests) preventing overlapping requests.
  - Real-time leave balance overview cards with visual utilization progress bars.
  - Personal leave history table with instant filtering by status (`All`, `Pending`, `Approved`, `Rejected`, `Cancelled`).
  - One-click request cancellation with automatic entitlement restoration.

- **Admin & Manager Control**:
  - Centralized Pending Approvals inbox with fast 1-click **Approve** and **Reject** actions (with optional justification comments).
  - Live Staff Directory synced with MongoDB Atlas database featuring full-text search, department filters, status toggles, and direct employee onboarding.
  - Executive dashboard metrics (Active Leaves, Today's Absences, Pending Reviews, Total Workforce).
  - Leave analytics charts and exportable absence reports.

- **Security & UX Excellence**:
  - Seamless authentication state management (`AppContext`) with persistent login and role-based route protection (`/admin/*`).
  - Toast notifications via Sonner for immediate user feedback.
  - Fully responsive layout tailored for desktops, tablets, and smartphones.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) |
| **Build Tool & Bundler** | [Vite 8](https://vite.dev/) |
| **Styling Engine** | [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **UI Primitives** | [Radix UI](https://www.radix-ui.com/) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) |
| **Routing** | [React Router v7](https://reactrouter.com/) |
| **Date Utilities** | [date-fns](https://date-fns.org/) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |
| **Charts** | [Recharts](https://recharts.org/) |

---

## 📁 Project Structure

```text
frontend/
├── public/                 # Static public assets & brand icons
├── src/
│   ├── assets/             # Images and styles
│   ├── components/         # Reusable UI components & layouts
│   │   ├── ui/             # Radix UI primitives (Button, Dialog, Card, Badge, etc.)
│   │   ├── Navbar.jsx      # Top navigation header
│   │   └── Sidebar.jsx     # Navigation sidebar
│   ├── context/
│   │   └── AppContext.jsx  # Global state (auth, leave balances, requests, employee directory)
│   ├── lib/
│   │   ├── api.js          # Dynamic API endpoint builder using VITE_API_URL
│   │   └── utils.js        # Classnames helper (clsx + tailwind-merge)
│   ├── pages/
│   │   ├── Login.jsx       # Employee & Admin authentication
│   │   ├── Register.jsx    # Self-registration onboarding
│   │   ├── Dashboard.jsx   # Role-aware home dashboard
│   │   ├── ApplyLeave.jsx  # Application form with calendar disabled-dates logic
│   │   ├── LeaveRequests.jsx# Request history & management
│   │   ├── Balances.jsx    # Leave category entitlements & balance breakdown
│   │   ├── Policies.jsx    # Company leave handbook & guidelines
│   │   ├── AdminApprovals.jsx # Manager review & decision queue
│   │   ├── AdminEmployees.jsx # Live database staff directory
│   │   ├── AdminDashboard.jsx # Executive overview & KPIs
│   │   └── AdminReports.jsx   # Analytics & trends
│   ├── App.jsx             # Route definitions & guards
│   ├── index.css           # Global Tailwind CSS styles and theme variables
│   └── main.jsx            # Application root mounting
├── .env                    # Local environment variables
├── .env.example            # Environment variables template
├── package.json
└── vite.config.js          # Vite config with React plugin and Tailwind v4
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher
- Running backend server (defaults to `http://localhost:5000`)

### 2. Installation
```bash
cd frontend
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure the variable points to your backend instance:
```env
VITE_API_URL=http://localhost:5000
```

### 4. Running the Development Server
```bash
npm run dev
```
The frontend will start at **`http://localhost:5173`**.

### 5. Production Build
```bash
npm run build
```
Generates an optimized production bundle in the `dist/` folder ready for static hosting.

To preview the production bundle locally:
```bash
npm run preview
```

---

## 🌐 Connecting to Remote Backend

All API calls throughout the frontend utilize the `apiUrl(endpoint)` helper from `src/lib/api.js`. When deploying to remote platforms (Vercel, Netlify, Render):
1. Navigate to the project settings in your hosting dashboard.
2. Under **Environment Variables**, add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://<your-backend-api-url>` (e.g., `https://leaveflow-api.onrender.com`)
3. Trigger a redeploy.
