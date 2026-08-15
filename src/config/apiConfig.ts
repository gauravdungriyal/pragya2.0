// Centralized API Configuration
// Modes: 'DEMO_SERVER' | 'PROD_SERVER'
export const API_MODE: 'DEMO_SERVER' | 'PROD_SERVER' = 'DEMO_SERVER';
export const USE_DEMO_API = API_MODE === 'DEMO_SERVER';

export const DEMO_API_URL = 'https://demo.pragya-yog.com/api_v2.php';
export const PROD_API_URL = 'https://pragya-yog.com/api.php';

export const API_BASE_URL = API_MODE === 'DEMO_SERVER' ? DEMO_API_URL : PROD_API_URL;

// Pragya AI Chatbot API Endpoints
export const CHAT_API_URL = (import.meta as any).env?.VITE_CHAT_API_URL || 'https://pragya-ai-assistant.vercel.app/api/chat';
export const CHAT_EMBED_URL = (import.meta as any).env?.VITE_CHAT_EMBED_URL || 'https://pragya-ai-assistant.vercel.app/';
