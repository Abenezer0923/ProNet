# 🚂 Railway Deployment Guide

This guide explains how to deploy the ProNet backend (User Service & API Gateway) to [Railway](https://railway.app) using the `railway.json` configuration file. This is the easiest way to deploy your entire stack.

## Prerequisites

1.  **GitHub Account**: You need access to the `Abenezer0923/ProNet` repository.
2.  **Railway Account**: Sign up at [railway.app](https://railway.app).
3.  **Resend API Key**: Sign up at [resend.com](https://resend.com) and get an API Key.
4.  **Railway CLI** (Optional but recommended): `npm i -g @railway/cli`

---

## 🚀 Option 1: One-Click Deployment (Recommended)

1.  Push your changes (including `railway.json`) to GitHub.
2.  Go to your Railway Dashboard.
3.  Click **+ New Project**.
4.  Select **Deploy from GitHub repo**.
5.  Select `Abenezer0923/ProNet`.
6.  Railway will detect the `railway.json` file and automatically configure:
    *   **Postgres Database**
    *   **User Service**
    *   **API Gateway**

7.  **Configure Variables**:
    Railway will ask you to provide values for the variables defined in `railway.json`:
    *   `JWT_SECRET`: Generate a random string.
    *   `RESEND_API_KEY`: Your key from Resend.
    *   `CLOUDINARY_CLOUD_NAME`: Your Cloudinary Name.
    *   `CLOUDINARY_API_KEY`: Your Cloudinary Key.
    *   `CLOUDINARY_API_SECRET`: Your Cloudinary Secret.
    *   `FRONTEND_URL`: URL of your frontend (e.g., `https://your-app.vercel.app`).

8.  Click **Deploy**.

---

## 🛠️ Option 2: Manual CLI Deployment

If you prefer using the command line:

1.  Login to Railway:
    ```bash
    railway login
    ```
2.  Initialize project:
    ```bash
    railway init
    ```
3.  Deploy:
    ```bash
    railway up
    ```

---

## 📧 Verify Email Sending

1.  Once deployed, try to **Sign Up** or use **Forgot Password**.
2.  Check the logs in Railway for the User Service. You should see:
    ```
    📧 Email service initialized with Resend
    ✅ OTP email sent successfully to ...
    ```

---

## 💡 Troubleshooting

*   **Database Connection**: The `railway.json` automatically links the services. If you see connection errors, ensure the `DATABASE_URL` variable is correctly propagated (Railway does this automatically).
*   **Build Failures**: Check the build logs. Ensure `npm install` runs correctly.
*   **WebSocket Issues**: Railway supports WebSockets out of the box.
