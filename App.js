import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import NotificationScreen from './src/screens/NotificationsScreen';
import GetStartedScreen from './src/screens/GetStartedScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TransactionScreen from './src/screens/TransactionsScreen';
import StatisticScreen from './src/screens/StatisticsScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Getstarted">
        <Stack.Screen name="Get" component={GetStartedScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
        <Stack.Screen name="Budget" component={BudgetScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Transaction" component={TransactionScreen} />
        <Stack.Screen name="Statistic" component={StatisticScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;