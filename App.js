import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import GetStartedScreen from './src/screens/GetStartedScreen';
import DrawerNavigator from './src/components/DrawerNavigator';
import LoginScreen from './src/screens/LoginScreen';  // Import the LoginScreen
import SignupScreen from './src/screens/SignupScreen';  // Import the SignupScreen

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
            component={LoginScreen}  // Add LoginScreen to the stack
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}  // Add SignupScreen to the stack
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Drawer"
            component={DrawerNavigator}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
