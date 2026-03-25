import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nic: '',
    phone: '',
    password: '',
    role: 'FARMER',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const handleRegister = async () => {
    const { name, email, nic, password } = formData;
    if (!name || !email || !nic || !password) {
      Alert.alert('Error', 'Please fill in all mandatory fields (Name, Email, NIC, Password)');
      return;
    }

    setLoading(true);
    const result = await register(formData);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Registration Failed', result.error);
    } else {
      console.log('Registration success! Redirecting to Dashboard...');
      setTimeout(() => {
        navigation.navigate('Home');
      }, 500);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Join AgroLanka</Text>
        <Text style={styles.subtitle}>Create your account to get started.</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="NIC Number"
          value={formData.nic}
          onChangeText={(text) => setFormData({ ...formData, nic: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
        />

        <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>Role:</Text>
          <TouchableOpacity 
            style={[styles.roleButton, formData.role === 'FARMER' && styles.roleButtonActive]}
            onPress={() => setFormData({ ...formData, role: 'FARMER' })}
          >
            <Text style={[styles.roleButtonText, formData.role === 'FARMER' && styles.roleButtonTextActive]}>Farmer</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleButton, formData.role === 'PRODUCT_MANAGER' && styles.roleButtonActive]}
            onPress={() => setFormData({ ...formData, role: 'PRODUCT_MANAGER' })}
          >
            <Text style={[styles.roleButtonText, formData.role === 'PRODUCT_MANAGER' && styles.roleButtonTextActive]}>Manager</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
  },
  roleLabel: {
    fontSize: 16,
    marginRight: 10,
    color: '#444',
  },
  roleButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#2e7d32',
    marginRight: 10,
  },
  roleButtonActive: {
    backgroundColor: '#2e7d32',
  },
  roleButtonText: {
    color: '#2e7d32',
  },
  roleButtonTextActive: {
    color: '#fff',
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

export default RegisterScreen;
