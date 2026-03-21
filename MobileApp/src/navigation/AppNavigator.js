import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';

import { AuthContext } from '../context/AuthContext';
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FarmerDashboard from '../screens/FarmerDashboard';
import HomeScreen from '../screens/HomeScreen';
import FeaturePlaceholderScreen from '../screens/FeaturePlaceholderScreen';
import LeafDiagnosticScreen from '../screens/LeafDiagnosticScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isLoading, userToken, userInfo } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Landing">
        {userToken == null ? (
          // Auth screens
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Main App screens
          <>
            <Stack.Screen name="Home" component={FarmerDashboard} />
            <Stack.Screen name="RegisterCrop" component={FeaturePlaceholderScreen} initialParams={{ title: 'Register Crop' }} />
            <Stack.Screen name="FinancialAid" component={FeaturePlaceholderScreen} initialParams={{ title: 'Financial Aid' }} />
            <Stack.Screen name="MachineryHub" component={FeaturePlaceholderScreen} initialParams={{ title: 'Machinery Hub' }} />
            <Stack.Screen name="AgriProducts" component={FeaturePlaceholderScreen} initialParams={{ title: 'Agri Products' }} />
            <Stack.Screen name="SellHarvest" component={FeaturePlaceholderScreen} initialParams={{ title: 'Sell Harvest' }} />
            <Stack.Screen name="LeafDiagnostic" component={LeafDiagnosticScreen} />
            <Stack.Screen name="Profile" component={HomeScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};


export default AppNavigator;
