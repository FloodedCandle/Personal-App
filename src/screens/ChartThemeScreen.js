import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import CustomText from '../components/CustomText';
import { chartThemes } from '../config/chartThemes';
import { db, auth } from '../config/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

const ChartThemeScreen = ({ navigation, route }) => {
    const { currentTheme } = route.params;

    const handleThemeSelect = async (theme) => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            const userPrefsRef = doc(db, 'userPreferences', userId);
            await setDoc(userPrefsRef, { chartTheme: theme }, { merge: true });

            navigation.goBack();
        } catch (error) {
            console.error('Error updating theme:', error);
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
});

export default ChartThemeScreen;