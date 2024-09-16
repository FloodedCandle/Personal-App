import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import GetStartedScreen from './src/screens/GetStartedScreen';
import OfflineOptionScreen from './src/screens/OfflineOptionScreen';
import DrawerNavigator from './src/components/DrawerNavigator';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import BudgetDetailScreen from './src/screens/BudgetDetailScreen';
// ... other imports

const Stack = createStackNavigator();

const App = () => {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="GetStarted">
            <Stack.Screen
              name="GetStarted"
              component={GetStartedScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="OfflineOption"
              component={OfflineOptionScreen}
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
              initialParams={{ offlineMode: true }} // Add this line
            />
            {/* ... other screens */}
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </Provider>
  );
};

export default App;
