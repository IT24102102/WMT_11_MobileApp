import axios from 'axios';
import UniversalStorage from '../utils/UniversalStorage';

// --- FLEXIBLE API CONFIGURATION ---
// 1. If using Local Wi-Fi (Phone and PC on same network): Use your Local IP
// 2. If using Expo Tunnel (--tunnel): Use your Pinggy or Serveo URL
const LOCAL_IP = '192.168.1.6'; // Replace with your current local IP if needed
// I have switched to localtunnel for better reliability in this session:
// Primary Tunnel (Serveo with Heartbeats):
const RAILWAY_URL = 'https://wmt11mobileapp-production.up.railway.app';

const apiClient = axios.create({
  // Permanent Cloud Host (Railway):
  baseURL: `${RAILWAY_URL}/api`,

  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
  },
  timeout: 45000, // Increased to 45s for maximum tunnel stability
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
