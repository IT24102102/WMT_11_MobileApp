import axios from 'axios';
import UniversalStorage from '../utils/UniversalStorage';

// --- FLEXIBLE API CONFIGURATION ---
// 1. If using Local Wi-Fi (Phone and PC on same network): Use your Local IP
// 2. Cloud Host (Render): Replace with your Render deployment URL once live
const LOCAL_IP = '192.168.1.6'; // Replace with your current local IP if needed

// 🚀 Replit Hosting:
const REPLIT_URL = 'https://wmt-11-mobile-app--it24102102.replit.app';

const apiClient = axios.create({
  // Permanent Cloud Host (Replit):
  baseURL: `${REPLIT_URL}/api`,

  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s timeout — Render free tier may cold-start on first request
});

// Add a request interceptor to include the JWT tokenw
apiClient.interceptors.request.use(
  async (config) => {
    const token = await UniversalStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
