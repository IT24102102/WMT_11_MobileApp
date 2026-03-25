import React, { createContext, useState, useEffect } from 'react';
import UniversalStorage from '../utils/UniversalStorage';
import apiClient from '../api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const login = async (email, password) => {
    try {
      console.log("Attempting login for:", email);
      console.log("Using baseURL:", apiClient.defaults.baseURL);
      const response = await apiClient.post('/auth/login', { email, password });
      console.log("Login API Response Status:", response.status);
      console.log("Login successful content:", !!response.data);
      const { token, ...user } = response.data;
      
      setUserToken(token);
      setUserInfo(user);
      await UniversalStorage.setItem('userToken', token);
      await UniversalStorage.setItem('userInfo', JSON.stringify(user));
      
      return { success: true };
    } catch (e) {
      console.error("Login Error Object:", e);
      console.log("Login error data:", e.response?.data);
      console.log("Login error message:", e.message);
      return { success: false, error: e.response?.data?.message || e.message || 'Login failed' };
    }
  };


  const register = async (userData) => {
    try {
      console.log("Sending registration request:", userData);
      const response = await apiClient.post('/auth/register', userData);
      console.log("Registration response:", response.data);
      const { token, ...user } = response.data;
      
      setUserToken(token);
      setUserInfo(user);
      await UniversalStorage.setItem('userToken', token);
      await UniversalStorage.setItem('userInfo', JSON.stringify(user));
      
      return { success: true };
    } catch (e) {
      console.log("Registration error details:", e.response?.data || e.message);
      return { success: false, error: e.response?.data?.message || 'Registration failed' };
    }
  };


  const logout = async () => {
    setUserToken(null);
    setUserInfo(null);
    await UniversalStorage.removeItem('userToken');
    await UniversalStorage.removeItem('userInfo');
  };

  const updateUserInfo = async (newUser) => {
    setUserInfo(newUser);
    await UniversalStorage.setItem('userInfo', JSON.stringify(newUser));
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let token = await UniversalStorage.getItem('userToken');
      let user = await UniversalStorage.getItem('userInfo');
      
      if (token && user) {
        setUserToken(token);
        setUserInfo(JSON.parse(user));
      }
      setIsLoading(false);
    } catch (e) {
      console.log(`isLogged in error ${e}`);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ login, register, logout, updateUserInfo, isLoading, userToken, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};
