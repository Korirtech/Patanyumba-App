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
- Feature/unfeature properties
- Mark properties as:
  - Available
  - Rented
  - Coming Soon
- Marking a property as **Rented** automatically removes it from Featured Properties.
- View analytics, reports, and system management tools.

### 🏘️ Landlord

- Register an account
- Submit new property listings
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

# 🎨 Modern User Interface

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

# ✨ Recent Updates & Technical Improvements

## Unified Property Storage

Property data is now stored persistently in a **SQLite database** through the **Express.js backend**, replacing the previous LocalStorage-only implementation.

Benefits include:

- Persistent storage
- Better data integrity
- Cross-device consistency
- Reliable synchronization

---

## New Public API Endpoints

Public pages now retrieve data directly from the backend.

### Available Endpoints

```
GET /api/admin/properties/all
GET /api/admin/properties/detail/:id
GET /api/admin/properties/featured
```

These endpoints power:

- Home Page
- Properties Page
- Property Detail Page

ensuring users always receive the latest information.

---

## Enhanced Landlord Workflow

Landlords now submit properties directly to the backend.

Submission process:

```
Landlord
      ↓
Pending Review
      ↓
Admin Approval
      ↓
Public Listing
```

Only approved properties become publicly visible.

---

## Advanced Admin Property Management

Administrators can now:

- View all submitted properties
- Review pending listings
- Approve or reject submissions
- Feature or unfeature listings
- Update availability status
- Mark listings as rented
- Automatically remove rented properties from Featured Listings

---

## Client-Side Improvements

The following pages now fetch data dynamically from the backend API:

- Home
- Properties
- Property Detail

Client-side filtering, searching, and sorting remain fully functional.

---

# 🛠️ Tech Stack

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

# 🚀 Getting Started

## Prerequisites

- Node.js **v18+**
- pnpm **v10.4.1+**

---

## Installation

### Clone the repository

```bash
git clone <repository-url>
cd Patanyumba-App
```

### Install dependencies

```bash
pnpm install
```

### Start the development server

```bash
pnpm dev
```

Open your browser and visit:

**https://patanyumba-staging.onrender.com/**

---

# 📂 Project Structure

```text
patanyumba_project/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── pages/
│
├── server/
│
├── shared/
│
├── public/
│
└── dist/
```

---

# 🔐 Admin Credentials

The application includes an account for Admin logins.

| Role | Email | Password |
|------|-------|----------|
| Admin | pakanyumbaadmin@gmail.com | Paka123456 |

> **Note**
>
> - User sessions and preferences are stored in **LocalStorage**.
> - Property listings are stored persistently in the **SQLite database** via the Express backend.

---

# 📦 Available Scripts

| Command | Description |
|----------|-------------|
| `pnpm dev` | Start the development server |
| `pnpm build` | Build frontend and backend for production |
| `pnpm start` | Run the production server |
| `pnpm preview` | Preview the production frontend |
| `pnpm check` | Run TypeScript type checking |
| `pnpm format` | Format the project using Prettier |

---

# 🎯 Project Vision

PataNyumba aims to simplify the house-hunting experience in Kenya by providing a centralized, secure, and user-friendly platform where:

- Property seekers can easily discover rental homes.
- Landlords can efficiently market and manage their properties.
- Administrators can maintain platform quality through moderation and verification.

The long-term vision is to become Kenya's most trusted digital property marketplace, offering reliable listings, seamless communication, and innovative property management tools.

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/my-feature
```

3. Commit your changes

```bash
git commit -m "Add amazing feature"
```

4. Push to GitHub

```bash
git push origin feature/my-feature
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

See the **LICENSE** file for more information.

---

## 👨‍💻 Author

**Korir Kipkirui**

Building modern web applications that solve real-world problems through clean design, scalable architecture, and great user experiences.

---

⭐ If you find this project useful, don't forget to **Star** the repository!
