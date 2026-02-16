# Mobile Programming Backend

TypeScript backend API for Mobile Programming authentication app with JWT, OTP verification, and rate limiting.

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Environment Setup
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

### Development
```bash
npm run dev
```
Server runs on `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## 📋 API Endpoints

### Health Check
- **GET** `/api/health` - Server health check

### Authentication

#### Register Simple (No OTP)
- **POST** `/api/auth/register-simple`
- Request body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "0123456789" // optional
}
```
- Response: User object + JWT token

#### Register with OTP
1. **POST** `/api/auth/send-otp` - Send OTP to email
```json
{
  "email": "user@example.com",
  "purpose": "register"
}
```

2. **POST** `/api/auth/verify-otp` - Verify OTP code
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

3. **POST** `/api/auth/register` - Complete registration
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "0123456789" // optional
}
```

#### Login
- **POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- Response: User object + JWT token

#### Forgot Password
1. **POST** `/api/auth/send-otp` - Send OTP to email
```json
{
  "email": "user@example.com",
  "purpose": "forgot-password"
}
```

2. **POST** `/api/auth/verify-otp` - Verify OTP code
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

3. **POST** `/api/auth/reset-password` - Reset password
```json
{
  "email": "user@example.com",
  "newPassword": "newpassword123"
}
```

### User Profile (Protected)
- **GET** `/api/user/profile`
- Headers: `Authorization: Bearer <JWT_TOKEN>`
- Response: User object

## 🔐 Security Features

### JWT Authentication
- Token expiry: 7 days (configurable)
- Bearer token in Authorization header
- Automatic token verification on protected routes

### OTP System
- 6-digit random codes
- 5-minute expiry (configurable)
- Purpose-based validation (register/forgot-password)
- Console logging in development (email integration ready)

### Rate Limiting
- 3 OTP requests per 15 minutes per email
- Prevents spam and abuse
- Automatic cleanup after window expires

### Password Security
- bcrypt hashing with salt rounds: 10
- Minimum 6 characters validation
- Secure password storage

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **CORS**: cors middleware
- **Environment**: dotenv

## 📂 Project Structure

```
src/
├── config/              # Environment and constants
├── types/               # TypeScript type definitions
├── storage/             # In-memory data storage
├── services/            # Business logic layer
├── middleware/          # Express middleware
├── controllers/         # HTTP request handlers
├── routes/              # API route definitions
├── utils/               # Utility functions
├── app.ts               # Express app setup
└── server.ts            # Entry point
```

## 🧪 Testing Endpoints

### Using curl

**Health check:**
```bash
curl http://localhost:3000/api/health
```

**Register simple:**
```bash
curl -X POST http://localhost:3000/api/auth/register-simple \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","fullName":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**Profile (with token):**
```bash
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

**OTP flow:**
```bash
# 1. Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"otp@example.com","purpose":"register"}'

# 2. Check console for OTP code, then verify
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"otp@example.com","otp":"123456"}'

# 3. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"otp@example.com","password":"test123","fullName":"OTP User"}'
```

## ⚙️ Environment Variables

```env
NODE_ENV=development              # development | production
PORT=3000                         # Server port
JWT_SECRET=your-secret-key        # JWT signing secret
JWT_EXPIRY=7d                     # Token expiry (7d, 24h, etc.)
OTP_EXPIRY_MINUTES=5              # OTP validity duration
RATE_LIMIT_MAX_REQUESTS=3         # Max OTP requests per window
RATE_LIMIT_WINDOW_MINUTES=15      # Rate limit time window
```

## ⚠️ Development Notes

- **OTP Email**: Currently logged to console. Integrate real email service for production (nodemailer, SendGrid, etc.)
- **Storage**: In-memory storage. Replace with database (MongoDB, PostgreSQL) for production
- **JWT Secret**: Use strong random secret in production, store in environment variables
- **CORS**: Configure allowed origins for production
- **Rate Limiting**: Consider Redis for distributed rate limiting in production

## 🔄 Mobile App Integration

The mobile app connects via `services/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

For physical devices, replace `localhost` with your computer's IP address:
```typescript
const API_BASE_URL = 'http://192.168.1.100:3000/api';
```

## 📦 NPM Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production build
- `npm run type-check` - Check TypeScript types without compilation

## 🎯 Code Quality

- **Strict TypeScript**: No `any` types in business logic
- **Modular Architecture**: All files under 200 lines
- **Error Handling**: Consistent error responses
- **Type Safety**: Full type coverage across codebase
- **Clean Code**: Clear separation of concerns

## 📝 License

ISC

---

**Built with TypeScript, Express, and JWT for secure authentication** 🔐
