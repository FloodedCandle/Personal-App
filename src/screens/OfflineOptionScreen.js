import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomText from '../components/CustomText';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OfflineOptionScreen = ({ navigation }) => {
    const handleOnlineMode = async () => {
        await AsyncStorage.setItem('offlineMode', 'false');
        navigation.navigate('Login');
    };

    const handleOfflineMode = async () => {
        await AsyncStorage.setItem('offlineMode', 'true');
        // Clear online data
        await AsyncStorage.multiRemove(['budgets', 'transactions', 'notifications']);
        navigation.navigate('MainApp', { screen: 'MainHome', params: { offlineMode: true } });
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#2C3E50', '#3498DB']} style={styles.gradient}>
                <View style={styles.content}>
                    <CustomText style={styles.title}>BudgetWaves</CustomText>
                    <CustomText style={styles.subtitle}>Choose your mode</CustomText>
                    <CustomButton
                        title="Online Mode"
                        onPress={handleOnlineMode}
                        buttonStyle={styles.button}
                        textStyle={styles.buttonText}
                    />
                    <CustomButton
                        title="Offline Mode"
                        onPress={handleOfflineMode}
                        buttonStyle={[styles.button, styles.offlineButton]}
                        textStyle={styles.buttonText}
                    />
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#FFFFFF',
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#2ECC71',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginBottom: 15,
        width: '80%',
    },
    offlineButton: {
        backgroundColor: '#E74C3C',
    },
    buttonText: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default OfflineOptionScreen;