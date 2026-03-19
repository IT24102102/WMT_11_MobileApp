import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const HomeScreen = () => {
  const { userInfo, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to AgroLanka</Text>
      {userInfo && (
        <View style={styles.infoBox}>
          <Text style={styles.label}>Name: <Text style={styles.value}>{userInfo.name}</Text></Text>
          <Text style={styles.label}>Email: <Text style={styles.value}>{userInfo.email}</Text></Text>
          <Text style={styles.label}>Role: <Text style={styles.value}>{userInfo.role}</Text></Text>
        </View>
      )}
      
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#2e7d32',
  },
  infoBox: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    backgroundColor: '#d32f2f',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
