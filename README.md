# PataNyumba

**PataNyumba** is a modern, Kenyan-focused property marketplace web application designed to connect landlords and property seekers. Built with a robust frontend stack, it features role-based dashboards for admins, landlords, and clients, offering a comprehensive suite of tools for managing and discovering real estate.

## 🌟 Key Features

### 🏠 Public Browsing & Search
- **Dynamic Search:** Filter properties by location, type (e.g., Apartment, Bungalow, Office), and budget.
- **County-Based Discovery:** Browse properties organized by major Kenyan counties.
- **Detailed Listings:** View high-quality images, pricing, deposits, amenities, and landlord contact information.
- **Direct Communication:** One-click WhatsApp integration to contact landlords directly.

### 🛡️ Role-Based Access Control
The application is structured around three distinct user roles:
1. **Admin:** Full control over user management and property moderation. Can approve, reject, verify, or delete listings, and manage user statuses.
2. **Landlord:** Ability to submit new property listings, view submission status, and manage their own listings (hide/unhide/delete).
3. **Client:** Ability to browse properties, save favorites, and initiate inquiries.

### 🎨 Modern User Interface
- Built with **React 19** and **TypeScript** for a robust, type-safe experience.
- Styled using **Tailwind CSS** and **shadcn/ui** for a clean, responsive, and accessible design.
- Features a fully functional dark/light mode toggle.
- Interactive map integration for property locations.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS, shadcn/ui, Framer Motion
- **State Management:** React Context API
- **Form Handling:** React Hook Form, Zod
- **Routing:** Wouter
- **Icons:** Lucide React
- **Data Storage:** LocalStorage (for demo/mock data purposes)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or later recommended)
- pnpm (v10.4.1 or later)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd patanyumba
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   pnpm dev
   ```
   The application will be available at `http://localhost:3000`.

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
├── server/               # Express server for serving static assets
├── shared/               # Shared constants and types
├── public/               # Static assets
└── dist/                 # Production build output
```

## 🔐 Demo Credentials

The application comes pre-seeded with demo users for testing purposes:

| Role     | Email             | Password   |
|----------|-------------------|------------|
| Admin    | `admin@pata.com`  | `admin123` |
| Landlord | `john@landlord.com`| `land123` |
| Client   | `jane@client.com` | `client123` |

*Note: All user data and properties are stored in the browser's LocalStorage. Clearing your browser data will reset the application to its default seeded state.*

## 📦 Available Scripts

- `pnpm dev`: Starts the Vite development server with hot-reloading.
- `pnpm build`: Builds the frontend for production and bundles the Express server.
- `pnpm start`: Runs the production build using Node.js.
- `pnpm preview`: Runs the Vite preview server for the built frontend.
- `pnpm check`: Runs the TypeScript compiler to check for type errors.
- `pnpm format`: Formats the codebase using Prettier.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
