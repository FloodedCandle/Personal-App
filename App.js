import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import GetStartedScreen from './src/screens/GetStartedScreen';
import DrawerNavigator from './src/components/DrawerNavigator';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import BudgetDetailScreen from './src/screens/BudgetDetailScreen';
import CreateBudgetScreen from './src/screens/CreateBudgetScreen';
import EditBudgetScreen from './src/screens/EditBudgetScreen';
import ChartThemeScreen from './src/screens/ChartThemeScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="GetStarted">
          <Stack.Screen
            name="GetStarted"
            component={GetStartedScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MainApp"
            component={DrawerNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BudgetDetail"
            component={BudgetDetailScreen}
            options={{ title: 'Budget Details' }}
          />
          <Stack.Screen
            name="CreateBudget"
            component={CreateBudgetScreen}
            options={{ title: 'Create Budget' }}
          />
          <Stack.Screen
            name="EditBudget"
            component={EditBudgetScreen}
            options={{ title: 'Edit Budget' }}
          />
          <Stack.Screen
            name="ChartTheme"
            component={ChartThemeScreen}
            options={{ title: 'Chart Theme' }}
          />
          <Stack.Screen
            name="Statistics"
            component={StatisticsScreen}
            options={{ title: 'Statistics' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
