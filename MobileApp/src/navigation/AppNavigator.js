import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';

import { AuthContext } from '../context/AuthContext';
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FarmerDashboard from '../screens/FarmerDashboard';
import FarmerTabNavigator from './FarmerTabNavigator';
import AdminDashboard from '../screens/AdminDashboard';
import HomeScreen from '../screens/HomeScreen';
import FeaturePlaceholderScreen from '../screens/FeaturePlaceholderScreen';
import LeafDiagnosticScreen from '../screens/LeafDiagnosticScreen';
import RegisterCropScreen from '../screens/RegisterCropScreen';
import MyCropsScreen from '../screens/MyCropsScreen';
import MachineryHubScreen from '../screens/MachineryHubScreen';
import FinancialAidScreen from '../screens/FinancialAidScreen';
import AgriProductsScreen from '../screens/AgriProductsScreen';
import SellHarvestScreen from '../screens/SellHarvestScreen';
import MachineryAdminDashboard from '../screens/admin/MachineryAdminDashboard';
import ProductAdminDashboard from '../screens/admin/ProductAdminDashboard';
import ASCDashboard from '../screens/admin/ASCDashboard';
import FinancialAdminDashboard from '../screens/admin/FinancialAdminDashboard';
import AdminProductReview from '../screens/admin/AdminProductReview';
import ManageOfficers from '../screens/admin/ManageOfficers';
import ManageASC from '../screens/admin/ManageASC';
import CropDashboard from '../screens/admin/CropDashboard';
import RegionalReports from '../screens/admin/RegionalReports';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import PaymentScreen from '../screens/PaymentScreen';

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
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            {/* Test Bypass Screens */}
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="ASCDashboard" component={ASCDashboard} />
            <Stack.Screen name="MachineryAdmin" component={MachineryAdminDashboard} />
            <Stack.Screen name="ProductAdmin" component={ProductAdminDashboard} />
            <Stack.Screen name="FinancialAdmin" component={FinancialAdminDashboard} />
            <Stack.Screen name="ProductReview" component={AdminProductReview} />
            <Stack.Screen name="ManageASC" component={ManageASC} />
            <Stack.Screen name="ManageOfficers" component={ManageOfficers} />
            <Stack.Screen name="CropDashboard" component={CropDashboard} />
            <Stack.Screen name="RegionalReports" component={RegionalReports} />
          </>
        ) : (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            {userInfo?.role === 'ADMIN' ? (
              <Stack.Screen name="Home" component={AdminDashboard} />
            ) : userInfo?.role === 'ASC_OFFICER' ? (
              <Stack.Screen name="Home" component={ASCDashboard} />
            ) : userInfo?.role === 'FINANCIAL_OFFICER' ? (
              <Stack.Screen name="Home" component={FinancialAdminDashboard} />
            ) : userInfo?.role === 'MACHINERY_OFFICER' ? (
              <Stack.Screen name="Home" component={MachineryAdminDashboard} />
            ) : userInfo?.role === 'PRODUCT_MANAGER' ? (
              <Stack.Screen name="Home" component={ProductAdminDashboard} />
            ) : userInfo?.role === 'CROP_OFFICER' ? (
              <Stack.Screen name="Home" component={CropDashboard} />
            ) : (
              <Stack.Screen name="Home" component={FarmerTabNavigator} />
            )}
            <Stack.Screen name="MachineryAdmin" component={MachineryAdminDashboard} />
            <Stack.Screen name="ProductAdmin" component={ProductAdminDashboard} />
            <Stack.Screen name="ASCDashboard" component={ASCDashboard} />
            <Stack.Screen name="FinancialAdmin" component={FinancialAdminDashboard} />
            <Stack.Screen name="RegisterCrop" component={RegisterCropScreen} />
            <Stack.Screen name="MyCrops" component={MyCropsScreen} />
            <Stack.Screen name="MachineryHub" component={MachineryHubScreen} />
            <Stack.Screen name="FinancialAid" component={FinancialAidScreen} />
            <Stack.Screen name="AgriProducts" component={AgriProductsScreen} />
            <Stack.Screen name="SellHarvest" component={SellHarvestScreen} />
            <Stack.Screen name="LeafDiagnostic" component={LeafDiagnosticScreen} />
            <Stack.Screen name="Profile" component={HomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="ManageASC" component={ManageASC} />
            <Stack.Screen name="ManageOfficers" component={ManageOfficers} />
            <Stack.Screen name="ProductReview" component={AdminProductReview} />
            <Stack.Screen name="CropDashboard" component={CropDashboard} />
            <Stack.Screen name="RegionalReports" component={RegionalReports} />
            <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};


export default AppNavigator;
