import axios from 'axios';
import UniversalStorage from '../utils/UniversalStorage';

// --- FLEXIBLE API CONFIGURATION ---
// 1. If using Local Wi-Fi (Phone and PC on same network): Use your Local IP
// 2. If using Expo Tunnel (--tunnel): Use your Pinggy or Serveo URL
const LOCAL_IP = '192.168.1.6'; // Replace with your current local IP if needed
// I have started a NEW stable tunnel below using IPv4 (127.0.0.1) to avoid 502 errors:
const TUNNEL_URL = 'https://c8bb29a63633da8b-112-134-186-116.serveousercontent.com';

const apiClient = axios.create({
  // Choice A: Local Wifi
  // baseURL: `http://${LOCAL_IP}:5000/api`, 

  // Choice B: Public Tunnel (WORKS ON ANDROID)
  baseURL: `${TUNNEL_URL}/api`,

  headers: {
    'Content-Type': 'application/json',
  },
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
