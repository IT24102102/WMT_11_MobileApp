import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const login = async (email, password) => {
    try {
      console.log("Attempting login for:", email);
      const response = await apiClient.post('/auth/login', { email, password });
      console.log("Login successful:", response.data._id);
      const { token, ...user } = response.data;
      
      setUserToken(token);
      setUserInfo(user);
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userInfo', JSON.stringify(user));
      
      return { success: true };
    } catch (e) {
      console.log("Login error details:", e.response?.data || e.message);
      return { success: false, error: e.response?.data?.message || 'Login failed' };
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
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userInfo', JSON.stringify(user));
      
      return { success: true };
    } catch (e) {
      console.log("Registration error details:", e.response?.data || e.message);
      return { success: false, error: e.response?.data?.message || 'Registration failed' };
    }
  };


  const logout = async () => {
    setUserToken(null);
    setUserInfo(null);
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userInfo');
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let token = await SecureStore.getItemAsync('userToken');
      let user = await SecureStore.getItemAsync('userInfo');
      
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
    <AuthContext.Provider value={{ login, register, logout, isLoading, userToken, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};
