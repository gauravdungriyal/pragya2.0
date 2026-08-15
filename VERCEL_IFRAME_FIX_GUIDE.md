# 🛠️ Resolving "refused to connect" (Iframe CSP Issue) on Vercel & AWS

This guide explains why `pragya-ai-assistant.vercel.app refused to connect` inside an `<iframe>` and provides step-by-step instructions to resolve it on **Vercel** and **AWS**.

---

## 🔍 Root Cause Analysis

In the backend server configuration (`backend/server.js`), security headers restrict which websites are allowed to embed the application inside an `<iframe>`:

```javascript
const FRAME_ANCESTORS = (process.env.FRAME_ANCESTORS || "https://pyshk.com https://www.pyshk.com")
  .split(/[\s,]+/)
  .filter(Boolean);
```

By default, if `FRAME_ANCESTORS` is not configured on your deployment platform, the server sends a strict Content-Security-Policy header (`frame-ancestors https://pyshk.com https://www.pyshk.com`). As a result, browsers block `localhost` or any other domain from embedding the app inside an `<iframe>`, resulting in:

> **"pragya-ai-assistant.vercel.app refused to connect"**

---

## ⚡ Option 1: Resolving the Issue on Vercel (Recommended)

Follow these steps to update the environment variables on Vercel:

### Step 1: Open Vercel Project Settings
1. Go to your [Vercel Dashboard](https://vercel.com).
2. Select your **Pragya AI Assistant** project.
3. Click on **Settings** in the top navigation bar.
4. Select **Environment Variables** from the left sidebar.

### Step 2: Add Environment Variables
Add the following key-value pairs:

| Key | Value | Description |
| :--- | :--- | :--- |
| `FRAME_ANCESTORS` | `*` | Allows framing from any domain (or specify `http://localhost:5173 https://pragya-yog.com`) |
| `ALLOWED_ORIGINS` | `*` | Allows CORS requests from all client domains |

### Step 3: Redeploy the Project
1. Navigate to the **Deployments** tab in Vercel.
2. Find your latest deployment, click the **`...`** (three dots) menu, and select **Redeploy**.
3. Once the deployment finishes, the server will issue a permissive framing policy, and the `<iframe>` in your website will load instantly without any connection errors.

---

## 🚀 Option 2: Deploying to AWS (Elastic Beanstalk / EC2 / App Runner)

If you decide to host the chatbot backend on AWS:

### 1. Upload Project Zip
Upload your compiled project zip file (`pragya-chatbot-aws.zip`).

### 2. Configure Environment Properties
Set the following environment variables in your AWS Elastic Beanstalk / EC2 `.env` / App Runner configuration:

```env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_uri
SESSION_SECRET=your_secret_key_123
FRAME_ANCESTORS=*
ALLOWED_ORIGINS=*
```

### 3. Update Frontend API Endpoint
Once deployed to AWS, update `src/config/apiConfig.ts` in your main website project:

```typescript
export const CHAT_EMBED_URL = 'https://your-aws-chatbot-domain.com/';
export const CHAT_API_URL = 'https://your-aws-chatbot-domain.com/api/chat';
```

---

## 💻 Frontend React Component Configuration

Your website's component [`src/components/AIChatWidget.tsx`](file:///d:/pragyayog2.0/src/components/AIChatWidget.tsx) is configured as a clean iframe modal wrapper:

```tsx
<iframe
  src={CHAT_EMBED_URL}
  title="Pragya AI Assistant"
  allow="microphone; autoplay; clipboard-write"
  style={{
    width: '100%',
    height: '100%',
    border: 'none',
    borderRadius: 'inherit'
  }}
/>
```

* **Microphone & Autoplay Permissions:** The `allow="microphone; autoplay; clipboard-write"` attribute ensures that the **Live Hands-Free Voice Overlay** and **Speech Synthesis** function seamlessly inside the embedded frame.
