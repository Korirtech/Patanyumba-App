# Persistent User Registration & Credential Storage Implementation

## Overview

This document outlines the implementation of persistent user registration and credential storage in the Patanyumba application. The system now uses a SQLite database to store user credentials and profile information, replacing the previous localStorage-only approach.

## Architecture

### Database Layer (`server/db.ts`)

- **Database**: SQLite (better-sqlite3)
- **Location**: `data/patanyumba.db` (created automatically)
- **Tables**:
  - `users`: Stores user accounts with credentials
  - `properties`: Stores property listings
  - `property_amenities`: Many-to-many relationship for property amenities
  - `property_images`: Property images
  - `favorites`: User favorites
  - `inquiries`: Property inquiries

### Backend API Layer (`server/auth.ts`)

Three main endpoints for authentication:

#### 1. **POST /api/auth/register**
Registers a new user with persistent storage.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0712345678",
  "password": "securepassword",
  "role": "client" | "landlord"
}
```

**Response (201 Created):**
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0712345678",
  "role": "client",
  "status": "active",
  "createdAt": "2026-07-24T14:00:00.000Z"
}
```

**Error Responses:**
- `400`: Missing required fields or invalid password length
- `409`: Email already registered

#### 2. **POST /api/auth/login**
Authenticates a user and returns session data.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (200 OK):**
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0712345678",
  "role": "client",
  "status": "active",
  "createdAt": "2026-07-24T14:00:00.000Z"
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid credentials
- `403`: Account suspended

#### 3. **GET /api/auth/user/:id**
Retrieves user information by ID.

**Response (200 OK):**
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0712345678",
  "role": "client",
  "status": "active",
  "createdAt": "2026-07-24T14:00:00.000Z"
}
```

### Frontend API Client (`client/src/lib/api.ts`)

Provides TypeScript functions for API communication:

```typescript
// Register a new user
await registerUser({
  name: "John Doe",
  email: "john@example.com",
  phone: "0712345678",
  password: "securepassword",
  role: "client"
});

// Login user
await loginUser("john@example.com", "securepassword");

// Get user by ID
await getUser("user_id");
```

### Authentication Context (`client/src/contexts/AuthContext.tsx`)

Updated to use backend APIs:

- **Async Operations**: `login()` and `register()` now return `Promise<boolean>`
- **Loading State**: New `isLoading` state for tracking API calls
- **Error Handling**: Errors from API are displayed via toast notifications
- **Session Persistence**: User sessions are stored in localStorage for offline access

### Updated Components

#### Register.tsx
- Updated to handle async registration
- Disables inputs during API call
- Shows loading state on submit button

#### Login.tsx
- Updated to handle async login
- Disables inputs during API call
- Shows loading state on submit button

## Data Flow

### Registration Flow
```
User fills form → Register.tsx → AuthContext.register()
  → registerUser() API call → /api/auth/register
  → Database stores user → Response with user data
  → Session stored in localStorage → Navigate to dashboard
```

### Login Flow
```
User enters credentials → Login.tsx → AuthContext.login()
  → loginUser() API call → /api/auth/login
  → Database validates credentials → Response with user data
  → Session stored in localStorage → Navigate to dashboard
```

## Security Considerations

### Current Implementation (Development)
- Passwords stored in plain text (⚠️ NOT FOR PRODUCTION)
- No HTTPS enforcement
- No rate limiting

### Production Recommendations
1. **Password Hashing**: Use bcrypt or similar
   ```typescript
   import bcrypt from 'bcrypt';
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **HTTPS**: Enforce HTTPS in production

3. **JWT Tokens**: Implement JWT-based authentication
   ```typescript
   const token = jwt.sign({ userId: user.id }, SECRET_KEY);
   ```

4. **Rate Limiting**: Add rate limiting to prevent brute force attacks

5. **Input Validation**: Validate and sanitize all inputs

6. **CORS**: Configure CORS properly

## Database Initialization

The database is automatically initialized on server startup via `initializeDatabase()` in `server/index.ts`. Tables are created if they don't exist.

### Seed Data

The application includes seed data in localStorage for testing. To migrate to database:

```typescript
// Get users from localStorage
const users = getUsers();

// Insert into database
users.forEach(user => {
  userQueries.create(user);
});
```

## Environment Variables

No additional environment variables required for basic setup. For production:

```env
DATABASE_PATH=/path/to/database
NODE_ENV=production
JWT_SECRET=your_secret_key
```

## Testing the Implementation

### 1. Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "0712345678",
    "password": "testpass123",
    "role": "client"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### 3. Get User
```bash
curl http://localhost:3000/api/auth/user/USER_ID
```

## File Structure

```
patanyumba/
├── server/
│   ├── index.ts          # Server entry point with DB init
│   ├── db.ts             # Database setup and queries
│   └── auth.ts           # Authentication API routes
├── client/src/
│   ├── lib/
│   │   ├── api.ts        # API client functions
│   │   └── store.ts      # Updated setSession function
│   ├── contexts/
│   │   └── AuthContext.tsx # Updated with async operations
│   └── pages/
│       ├── Register.tsx   # Updated for async registration
│       └── Login.tsx      # Updated for async login
└── data/
    └── patanyumba.db     # SQLite database (auto-created)
```

## Next Steps

1. **Password Hashing**: Implement bcrypt for password security
2. **JWT Authentication**: Add JWT tokens for stateless auth
3. **Email Verification**: Add email verification on registration
4. **Password Reset**: Implement password reset functionality
5. **User Profile Updates**: Add endpoints for updating user info
6. **Admin Management**: Add admin endpoints for user management
7. **Logging**: Implement comprehensive logging

## Troubleshooting

### Database Not Created
- Check file permissions in the `data/` directory
- Ensure `better-sqlite3` is properly installed

### API Endpoints Not Working
- Verify server is running on port 3000
- Check that middleware is properly configured in `server/index.ts`
- Review console logs for errors

### Session Not Persisting
- Check browser localStorage is enabled
- Verify session data is being stored correctly
- Check browser console for errors

## References

- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [Express.js Documentation](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
