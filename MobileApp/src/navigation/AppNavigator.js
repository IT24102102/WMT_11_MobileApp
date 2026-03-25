import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';

import { AuthContext } from '../context/AuthContext';
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FarmerDashboard from '../screens/FarmerDashboard';
import AdminDashboard from '../screens/AdminDashboard';
import HomeScreen from '../screens/HomeScreen';
import FeaturePlaceholderScreen from '../screens/FeaturePlaceholderScreen';
import LeafDiagnosticScreen from '../screens/LeafDiagnosticScreen';
import MachineryAdminDashboard from '../screens/admin/MachineryAdminDashboard';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isLoading, userToken, userInfo } = useContext(AuthContext);

  console.log('AppNavigator State:', { isLoading, userToken: !!userToken, userInfo: !!userInfo, role: userInfo?.role });

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
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            {userInfo?.role === 'ADMIN' ? (
              <Stack.Screen name="Home" component={AdminDashboard} />
            ) : userInfo?.role === 'MACHINERY_OFFICER' || userInfo?.role === 'ASC_OFFICER' ? (
              <Stack.Screen name="Home" component={MachineryAdminDashboard} />
            ) : (
              <Stack.Screen name="Home" component={FarmerDashboard} />
            )}
            <Stack.Screen name="MachineryAdmin" component={MachineryAdminDashboard} />
            <Stack.Screen name="RegisterCrop" component={FeaturePlaceholderScreen} initialParams={{ title: 'Register Crop' }} />
            <Stack.Screen name="FinancialAid" component={FeaturePlaceholderScreen} initialParams={{ title: 'Financial Aid' }} />
            <Stack.Screen name="MachineryHub" component={FeaturePlaceholderScreen} initialParams={{ title: 'Machinery Hub' }} />
            <Stack.Screen name="AgriProducts" component={FeaturePlaceholderScreen} initialParams={{ title: 'Agri Products' }} />
            <Stack.Screen name="SellHarvest" component={FeaturePlaceholderScreen} initialParams={{ title: 'Sell Harvest' }} />
            <Stack.Screen name="LeafDiagnostic" component={LeafDiagnosticScreen} />
            <Stack.Screen name="Profile" component={HomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};


export default AppNavigator;
