import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import CustomText from '../components/CustomText';
import { chartThemes } from '../config/chartThemes';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChartThemeScreen = ({ navigation, route }) => {
    const [currentTheme, setCurrentTheme] = useState(route.params.currentTheme);
    const isOfflineMode = route.params.isOfflineMode;

    const handleThemeSelect = async (theme) => {
        try {
            if (isOfflineMode) {
                await AsyncStorage.setItem('offlineChartTheme', theme);
            } else {
                const userId = auth.currentUser?.uid;
                if (userId) {
                    await updateDoc(doc(db, 'userPreferences', userId), { chartTheme: theme });
                }
                await AsyncStorage.setItem('onlineChartTheme', theme);
            }
            setCurrentTheme(theme);
            navigation.goBack();
        } catch (error) {
            console.error('Error updating chart theme:', error);
            Alert.alert('Error', 'Failed to update chart theme. Please try again.');
        }
    };

    const renderThemeItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.themeItem, currentTheme === item && styles.selectedTheme]}
            onPress={() => handleThemeSelect(item)}
        >
            <CustomText style={styles.themeText}>{item}</CustomText>
            <View style={styles.colorPreview}>
                {chartThemes[item].map((color, index) => (
                    <View key={index} style={[styles.colorSample, { backgroundColor: color }]} />
                ))}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <CustomText style={styles.modeText}>
                {isOfflineMode ? 'Offline Mode' : 'Online Mode'}
            </CustomText>
            <FlatList
                data={Object.keys(chartThemes)}
                renderItem={renderThemeItem}
                keyExtractor={(item) => item}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ECF0F1',
        padding: 20,
    },
    themeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginBottom: 10,
    },
    selectedTheme: {
        backgroundColor: '#E8F6FF',
    },
    themeText: {
        fontSize: 16,
        color: '#2C3E50',
    },
    colorPreview: {
        flexDirection: 'row',
    },
    colorSample: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginLeft: 5,
    },
    modeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
        textAlign: 'center',
        marginVertical: 10,
    },
});

export default ChartThemeScreen;