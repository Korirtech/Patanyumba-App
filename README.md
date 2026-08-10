# 🏠 PataNyumba

**PataNyumba** is a modern, Kenyan-focused property marketplace web application designed to connect landlords and property seekers. Built with a robust **React + TypeScript frontend** and an **Express.js backend**, the platform provides secure, role-based dashboards for **Admins**, **Landlords**, and **Clients**, making property management and house hunting seamless, efficient, and accessible.

---

## 🌟 Key Features

### 🏠 Public Browsing & Search

- 🔍 **Dynamic Search** – Filter properties by location, property type, and budget.
- 📍 **County-Based Discovery** – Browse listings across major counties in Kenya.
- 🏡 **Detailed Property Listings** – View images, rental prices, deposits, amenities, descriptions, and landlord contact details.
- 💬 **Direct Communication** – Contact landlords instantly through WhatsApp integration.
- ⭐ **Featured Properties** – Highlighted listings displayed on the homepage and managed exclusively by administrators.

---

## 🛡️ Role-Based Access Control

PataNyumba provides three user roles with dedicated dashboards and permissions.

### 👑 Admin

- Manage users (Admins, Landlords, Clients)
- Approve or reject submitted properties
- Verify property listings
- Delete inappropriate listings
- **Feature/unfeature properties** for prominent display on the Home page
- Mark properties as:
  - Available
  - Rented
  - Coming Soon
- Marking a property as **Rented** automatically removes it from Featured Properties.
- View analytics, reports, and system management tools.

### 🏘️ Landlord

- Register an account
- **Submit new property listings directly to the server**
- View approval status
- Hide or unhide listings
- Delete owned listings
- Manage personal properties

### 👤 Client

- Browse available properties
- Save favorite listings
- Search using multiple filters
- Contact landlords directly
- View detailed property information

---

## 🎨 Modern User Interface

Built with modern web technologies to provide a fast, responsive, and accessible experience.

Features include:

- ⚛️ React 19 + TypeScript
- 🎨 Tailwind CSS
- 🧩 shadcn/ui components
- 🌙 Dark / Light mode
- 📱 Fully responsive layout
- 🗺️ Interactive property maps
- ⚡ Smooth animations using Framer Motion

---

## ✨ Recent Updates & Technical Improvements

### Unified Property Storage

Property data is now stored persistently in a **SQLite database** through the **Express.js backend**, replacing the previous LocalStorage-only implementation for properties. This ensures:

- Persistent storage across sessions
- Better data integrity
- Cross-device consistency
- Reliable synchronization between Landlord, Admin, and Public pages

### New Public API Endpoints

Public pages now retrieve data directly from the backend API, ensuring users always receive the latest information.

**Available Endpoints:**
- `GET /api/admin/properties/all` — Powers the Properties page
- `GET /api/admin/properties/detail/:id` — Powers the Property Detail page
- `GET /api/admin/properties/featured` — Powers the Home page featured section

### Enhanced Landlord Workflow

Landlords now submit properties directly to the backend. Submissions follow a clear lifecycle:
1. **Submission** by Landlord
2. **Pending Review** status
3. **Admin Approval** or Rejection
4. **Public Listing** (if approved)

### Advanced Admin Property Management

Administrators have comprehensive control over the property lifecycle, including reviewing pending listings, featuring properties, and managing availability statuses with automatic synchronization (e.g., auto-unfeaturing rented properties).

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19, TypeScript, Vite |
| Backend | Express.js |
| Database | SQLite |
| Styling | Tailwind CSS, shadcn/ui |
| Animations | Framer Motion |
| State Management | React Context API |
| Forms | React Hook Form, Zod |
| Routing | Wouter |
| Icons | Lucide React |
| Storage | SQLite (properties), LocalStorage (user sessions & settings) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js **v18+**
- pnpm **v10.4.1+**

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Patanyumba-App
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   pnpm dev
   ```

Open your browser and visit: `http://localhost:3000`

### Email verification configuration

Registration creates an **unverified** account, generates a six-digit code, and sends it through SMTP. Configure the following environment variables before testing email verification:

```env
APP_URL=https://your-deployed-domain.example
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-sender@example.com
SMTP_PASS=your-smtp-password-or-provider-token
SMTP_FROM=your-sender@example.com
```

For Gmail, use an **App Password** rather than the account password. On Render, set these values in the service environment settings; `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and `APP_URL` are marked as unsynchronized secrets in `render.yaml`. In production, registration returns an explicit error when the verification email cannot be delivered instead of creating an account that cannot be verified. In development, the code is returned as `devCode` only when SMTP delivery is unavailable, so the flow can still be tested locally.

---

## 📂 Project Structure

```text
patanyumba_project/
├── client/               # React frontend source code
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React Context providers (Auth, Theme, Favorites)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities, types, and store (mock data)
│   │   └── pages/        # Page components for routing
├── server/               # Express.js backend for API and data persistence
├── shared/               # Shared constants and types
├── public/               # Static assets
└── dist/                 # Production build output
```

---

## 🔐 Admin Credentials

The application includes an account for Admin logins.

| Role | Email | Password |
|------|-------|----------|
| Admin | `patanyumbaadmin@gmail.com` | `Pata123456` |

> **Note**
> - User sessions and preferences are stored in **LocalStorage**.
> - Property listings are stored persistently in the **SQLite database** via the Express backend.

---

## 📦 Available Scripts

| Command | Description |
|----------|-------------|
| `pnpm dev` | Start the development server |
| `pnpm build` | Build frontend and backend for production |
| `pnpm start` | Run the production server |
| `pnpm preview` | Preview the production frontend |
| `pnpm check` | Run TypeScript type checking |
| `pnpm test:server` | Run the server registration and email verification tests |
| `pnpm format` | Format the project using Prettier |

---

## 🎯 Project Vision

PataNyumba aims to simplify the house-hunting experience in Kenya by providing a centralized, secure, and user-friendly platform. The long-term vision is to become Kenya's most trusted digital property marketplace, offering reliable listings, seamless communication, and innovative property management tools.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m "Add amazing feature"`)
4. Push to GitHub (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Korir Kipkirui**

Building modern web applications that solve real-world problems through clean design, scalable architecture, and great user experiences.

---

⭐ If you find this project useful, don't forget to **Star** the repository!
