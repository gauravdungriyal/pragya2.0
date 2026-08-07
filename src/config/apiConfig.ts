// Centralized API Configuration
// Set USE_DEMO_API to true for Testing/Demo Sandbox, or false for Live Production

export const USE_DEMO_API = true;

export const DEMO_API_URL = 'https://demo.pragya-yog.com/api_v2.php';
export const PROD_API_URL = 'https://pragya-yog.com/api.php';

export const API_BASE_URL = USE_DEMO_API ? DEMO_API_URL : PROD_API_URL;
