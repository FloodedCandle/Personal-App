import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import NotificationScreen from '../screens/NotificationsScreen';
import BudgetScreen from '../screens/BudgetScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TransactionScreen from '../screens/TransactionsScreen';
import StatisticScreen from '../screens/StatisticsScreen';
import CurrencyScreen from '../screens/CurrncyScreen';
import { Text } from 'react-native';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ drawerIcon: () => <Text style={{ fontSize: 20 }}>👤</Text> }}
      />
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{ drawerIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text> }}
      />
      <Drawer.Screen
        name="Notification"
        component={NotificationScreen}
        options={{ drawerIcon: () => <Text style={{ fontSize: 20 }}>🔔</Text> }}
      />
      <Drawer.Screen
        name="Budget"
        component={BudgetScreen}
        options={{ drawerIcon: () => <Text style={{ fontSize: 20 }}>💰</Text> }}
      />

      <Drawer.Screen
        name="Transaction"
        component={TransactionScreen}
        options={{ drawerIcon: () => <Text style={{ fontSize: 20 }}>📈</Text> }}
      />
      <Drawer.Screen
        name="Statistic"
        component={StatisticScreen}
        options={{ drawerIcon: () => <Text style={{ fontSize: 20 }}>📊</Text> }}
      />
      <Drawer.Screen
        name="Currency"
        component={CurrencyScreen}
        options={{ drawerIcon: () => <Text style={{ fontSize: 20 }}>💱</Text> }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
