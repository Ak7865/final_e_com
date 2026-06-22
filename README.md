# Lumière Skincare — Full-Stack eCommerce Platform

A professional, production-ready skincare ecommerce platform built with Next.js 15 App Router, TypeScript, Tailwind CSS, MongoDB Atlas, Cloudinary, and NextAuth v5.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Custom Design Tokens |
| Database | MongoDB Atlas + Mongoose |
| Auth | NextAuth v5 (JWT + Google OAuth) |
| Image Storage | Cloudinary |
| State Management | Zustand |
| Forms | React Hook Form + Zod |
| UI Components | Radix UI + Shadcn-style |
| Animations | Framer Motion |
| Charts | Recharts |
| Payments | Razorpay |
| Email | Nodemailer + Resend |
| Toast | Sonner |

---

## 📁 Folder Structure

```
e_com_skin/
├── app/
│   ├── (auth)/          # Login, Register, Forgot/Reset Password
│   ├── (shop)/          # Customer storefront routes
│   │   ├── page.tsx     # Homepage
│   │   ├── products/    # Product listing & detail
│   │   ├── cart/        # Shopping cart
│   │   ├── checkout/    # Checkout flow
│   │   ├── orders/      # Order history & tracking
│   │   ├── wishlist/    # Saved products
│   │   ├── profile/     # Customer profile
│   │   └── notifications/
│   ├── admin/           # Admin panel (role-protected)
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── customers/
│   │   ├── categories/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   └── settings/
│   └── api/             # API routes
├── components/
│   ├── admin/           # Admin-only components
│   ├── shop/            # Customer-facing components
│   └── ui/              # Shared UI primitives
├── models/              # Mongoose schemas
├── actions/             # Next.js Server Actions
├── lib/                 # DB connection, Cloudinary, utils
├── store/               # Zustand stores (cart, wishlist)
├── hooks/               # Custom React hooks
├── types/               # TypeScript type declarations
└── scripts/             # Seed scripts
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
# MongoDB Atlas
MONGODB_URI="mongodb+srv://..."

# NextAuth (local: http://localhost:3000 | production: https://final-e-com.vercel.app)
AUTH_SECRET="your-secret-here"
NEXTAUTH_URL="https://final-e-com.vercel.app"

# Google OAuth (https://console.cloud.google.com)
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Cloudinary (https://cloudinary.com)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-upload-preset"

# Email (Resend/SMTP)
EMAIL_SERVER_HOST="smtp.resend.com"
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER="resend"
EMAIL_SERVER_PASSWORD="your-resend-api-key"
EMAIL_FROM="noreply@yourdomain.com"

# App URL (local: http://localhost:3000 | production: https://final-e-com.vercel.app)
NEXT_PUBLIC_APP_URL="https://final-e-com.vercel.app"

# Razorpay (https://razorpay.com/docs)
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="your-secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
```

---

## 🛠️ Local Development

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Set up environment

```bash
cp .env.example .env.local
# Fill in your credentials
```

### 3. Seed the database

```bash
npm run seed
```

This creates:
- **Admin account**: `admin@lumiere.com` / `Admin@1234`
- **Customer account**: `customer@lumiere.com` / `Customer@1234`
- 6 product categories (Serums, Moisturizers, Cleansers, Masks, Sunscreen, Eye Care)
- 8 sample skincare products

### 4. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Authentication Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable **Google+ API**
4. Go to **Credentials → Create OAuth 2.0 Client ID**
5. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (local dev)
   - `https://final-e-com.vercel.app` (production)
6. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (local dev)
   - `https://final-e-com.vercel.app/api/auth/callback/google` (production)
7. Copy Client ID and Secret to `.env.local`

### Auth Secret

Generate a secure secret:
```bash
openssl rand -hex 32
```

---

## ☁️ Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to **Settings → Upload → Upload presets**
3. Create an unsigned preset named `skin-_care` (or update the env var)
4. Copy your Cloud Name, API Key, and API Secret

---

## 💳 Razorpay Setup

1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to **Settings → API Keys**
3. Generate test keys (prefix `rzp_test_`)
4. For production, activate your account and generate live keys

---

## 🗄️ MongoDB Atlas Setup

1. Create a cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a database user with read/write access
3. Whitelist your IP (or `0.0.0.0/0` for development)
4. Get your connection string and add to `MONGODB_URI`

---

## 🚢 Deploy to Vercel

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Vercel Environment Variables

Add all variables from `.env.local` to your Vercel project:
- Go to **Project Settings → Environment Variables**
- Add each key-value pair
- Set `AUTH_SECRET`, `AUTH_URL`, `NEXTAUTH_URL`, and `NEXT_PUBLIC_APP_URL` to `https://final-e-com.vercel.app`
- Ensure `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `MONGODB_URI` match your `.env.local` values

### Build Configuration

The `vercel-build` script handles peer dependency conflicts:
```json
"vercel-build": "npm install --legacy-peer-deps && next build"
```

---

## 👥 User Roles

| Role | Access |
|---|---|
| **Customer** | Shop, cart, wishlist, orders, profile, notifications |
| **Admin** | Everything above + full admin panel |

---

## 📦 Key Features

### Customer Side
- 🛍️ Product browsing with filters, search, sort
- ❤️ Wishlist with add-to-cart
- 🛒 Persistent cart (Zustand + localStorage)
- 💳 Checkout with COD + Razorpay online payment
- 📦 Order tracking with status timeline
- 👤 Profile management with image upload
- 🔔 Real-time notifications

### Admin Panel
- 📊 Dashboard with revenue charts and KPIs
- 📦 Product management (CRUD + CSV import/export)
- 🛒 Order management with status workflow
- 👥 Customer management with analytics
- 🏷️ Categories & coupon management
- 📈 Full analytics with Recharts
- 🔔 Notification center
- ⚙️ Store settings + profile management

---

## 🌱 Sample Data

After running `npm run seed`, you'll have:

| Category | Sample Product |
|---|---|
| Serums | Vitamin C Brightening Serum ($68) |
| Serums | Hyaluronic Hydra Boost Serum ($54) |
| Moisturizers | Rose Quartz Day Moisturizer ($62) |
| Moisturizers | Midnight Recovery Night Cream ($78) |
| Cleansers | Botanical Gel Cleanser ($32) |
| Masks | Clay Detox Mask ($44) |
| Sunscreen | Mineral Glow SPF 50 ($48) |
| Eye Care | Caffeine Eye Renewal Cream ($52) |

---

## 📄 License

MIT © Lumière Skincare 2025