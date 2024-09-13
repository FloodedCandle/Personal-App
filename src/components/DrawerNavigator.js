import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import NotificationScreen from '../screens/NotificationsScreen';
import BudgetScreen from '../screens/BudgetScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TransactionScreen from '../screens/TransactionsScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import CurrencyScreen from '../screens/CurrencyScreen';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          drawerIcon: () => <MaterialIcons name="person" size={24} color="#2C3E50" />
        }}
      />
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          drawerIcon: () => <MaterialIcons name="home" size={24} color="#2C3E50" />
        }}
      />
      <Drawer.Screen
        name="Notification"
        component={NotificationScreen}
        options={{
          drawerIcon: () => <MaterialIcons name="notifications" size={24} color="#2C3E50" />
        }}
      />
      <Drawer.Screen
        name="Budget"
        component={BudgetScreen}
        options={{
          drawerIcon: () => <MaterialIcons name="account-balance-wallet" size={24} color="#2C3E50" />
        }}
      />
      <Drawer.Screen
        name="Transaction"
        component={TransactionScreen}
        options={{
          drawerIcon: () => <MaterialIcons name="swap-horiz" size={24} color="#2C3E50" />
        }}
      />
      <Drawer.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          drawerIcon: () => <MaterialIcons name="bar-chart" size={24} color="#2C3E50" />
        }}
      />
      <Drawer.Screen
        name="Currency"
        component={CurrencyScreen}
        options={{
          drawerIcon: () => <MaterialIcons name="attach-money" size={24} color="#2C3E50" />
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
