# Production Deployment & Hosting Guide

This guide details steps for deploying the Ascend platform production-ready under Vercel (Frontend), Render (Backend), and MongoDB Atlas (Database).

---

## 1. Database Setup: MongoDB Atlas

1. Create a free-tier cluster in [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Triage Network Access rules to allow IP access from Render server nodes (or choose `0.0.0.0/0` if necessary).
3. Generate database users credentials and copy the primary connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/ascend?retryWrites=true&w=majority
   ```

---

## 2. Backend Hosting: Render

1. Create a new **Web Service** in [Render Console](https://dashboard.render.com).
2. Connect your Git repository.
3. Configure settings:
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && node dist/index.js`
4. Add Environment Variables inside Settings:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (or leave default, Render sets PORT automatically)
   - `CLIENT_URL`: `https://your-custom-frontend.vercel.app`
   - `MONGODB_URI`: `mongodb+srv://...` (from Atlas)
   - `JWT_SECRET`: (generated secure string)
   - `JWT_REFRESH_SECRET`: (generated secure string)
   - `GEMINI_API_KEY`: (from Google AI Console)
   - `RAZORPAY_KEY_ID`: (from Razorpay Dashboard)
   - `RAZORPAY_KEY_SECRET`: (from Razorpay Dashboard)
   - `RAZORPAY_WEBHOOK_SECRET`: (from Razorpay Webhook Settings page)

---

## 3. Frontend Hosting: Vercel

1. Create a new project in [Vercel](https://vercel.com).
2. Link your Git repository.
3. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables inside Project Settings:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com/api/v1`
5. Click **Deploy**. Vercel will automatically generate SSL certificates for deployment domains.

---

## 4. Custom Domains & SSL

- **Render Backend Domain**: You can add a CNAME record mapping your subdomain (e.g. `api.yourdomain.com`) to Render's default routing address. Render issues Let's Encrypt certificates automatically.
- **Vercel Frontend Domain**: Map your apex domain (e.g. `yourdomain.com`) or subdomains (e.g. `app.yourdomain.com`) in Vercel domains manager dashboard. Configure DNS A records (pointing to `76.76.21.21`) or CNAME records (`cname.vercel-dns.com`).
