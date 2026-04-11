import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

// Screens
import FarmerDashboard from '../screens/FarmerDashboard';
import MyCropsScreen from '../screens/MyCropsScreen';
import AgriProductsScreen from '../screens/AgriProductsScreen';
import SellHarvestScreen from '../screens/SellHarvestScreen';
import FarmerProfileScreen from '../screens/FarmerProfileScreen';

const Tab = createBottomTabNavigator();

const FarmerTabNavigator = () => {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MyCropsTab') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'BuyTab') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'SellTab') {
            iconName = focused ? 'pricetag' : 'pricetag-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2e7d32',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={FarmerDashboard} 
        options={{ title: t('farmer.home') || 'Home' }} 
      />
      <Tab.Screen 
        name="MyCropsTab" 
        component={MyCropsScreen} 
        options={{ title: t('farmer_crop.headerList') || 'Crops' }} 
      />
      <Tab.Screen 
        name="BuyTab" 
        component={AgriProductsScreen} 
        options={{ title: t('farmer.agriProducts') || 'Buy' }} 
      />
      <Tab.Screen 
        name="SellTab" 
        component={SellHarvestScreen} 
        options={{ title: t('farmer.sellHarvest') || 'Sell' }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={FarmerProfileScreen} 
        options={{ title: 'Profile' }} 
      />
    </Tab.Navigator>
  );
};

export default FarmerTabNavigator;
