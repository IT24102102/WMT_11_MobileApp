import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    console.log('Login button clicked');
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    console.log('Calling AuthContext.login...');
    const result = await login(email, password);
    console.log('AuthContext.login result:', result);
    setLoading(false);

    if (!result.success) {
      console.log('Login failed, showing alert...');
      Alert.alert('Login Failed', result.error);
    } else {
      console.log('Login success! Redirecting to Dashboard...');
      setTimeout(() => {
        navigation.navigate('Home');
      }, 100);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>AgroLanka</Text>
        <Text style={styles.subtitle}>Welcome back! Please login.</Text>
        <Text style={{ fontSize: 10, color: 'blue', textAlign: 'center', marginBottom: 5 }}>
          Debug IP: http://192.168.1.6:5000/api
        </Text>
        
        <TouchableOpacity 
          style={{ marginBottom: 20, padding: 5, backgroundColor: '#eee', borderRadius: 5 }} 
          onPress={() => navigation.navigate('ASCDashboard')}
        >
          <Text style={{ fontSize: 10, color: '#666', textAlign: 'center' }}>
            [DEV ONLY] Tap to Check Admin Dashboard
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 20,
    color: '#2e7d32',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default LoginScreen;
