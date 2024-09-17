import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Alert, Switch, TouchableOpacity } from 'react-native';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, auth } from '../config/firebaseConfig';
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { addBudget } from '../redux/budgetSlice';

const categories = [
    { name: 'Food', icon: 'restaurant' },
    { name: 'Transportation', icon: 'directions-car' },
    { name: 'Housing', icon: 'home' },
    { name: 'Entertainment', icon: 'movie' },
    { name: 'Shopping', icon: 'shopping-cart' },
    { name: 'Health', icon: 'favorite' },
    { name: 'Education', icon: 'school' },
    { name: 'Other', icon: 'category' },
];

const CreateBudgetScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [goal, setGoal] = useState('');
    const [category, setCategory] = useState(categories[0]);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [reminderFrequency, setReminderFrequency] = useState('weekly');
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        checkOfflineMode();
    }, []);

    const checkOfflineMode = async () => {
        const offlineMode = await AsyncStorage.getItem('offlineMode');
        setIsOfflineMode(offlineMode === 'true');
    };

    const handleCreateBudget = async () => {
        if (!name || !goal || !category) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            const newBudget = {
                id: Date.now().toString(),
                name,
                goal: parseFloat(goal),
                amountSpent: 0,
                category: {
                    name: category.name,
                    icon: category.icon
                },
                icon: category.icon,
                notificationsEnabled,
                reminderFrequency,
                createdAt: new Date().toISOString(),
            };

            console.log('Creating new budget:', newBudget);

            if (isOfflineMode) {
                const storedBudgets = await AsyncStorage.getItem('offlineBudgets');
                let updatedBudgets = storedBudgets ? JSON.parse(storedBudgets) : [];
                updatedBudgets.push(newBudget);
                await AsyncStorage.setItem('offlineBudgets', JSON.stringify(updatedBudgets));
            } else {
                const userId = auth.currentUser.uid;
                const userBudgetsRef = doc(db, 'userBudgets', userId);
                const docSnap = await getDoc(userBudgetsRef);

                if (docSnap.exists()) {
                    await updateDoc(userBudgetsRef, {
                        budgets: arrayUnion(newBudget)
                    });
                } else {
                    // If the document doesn't exist, create it with the new budget
                    await setDoc(userBudgetsRef, {
                        budgets: [newBudget]
                    });
                }

                // Update local storage for online mode as well
                const storedBudgets = await AsyncStorage.getItem('budgets');
                let updatedBudgets = storedBudgets ? JSON.parse(storedBudgets) : [];
                updatedBudgets.push(newBudget);
                await AsyncStorage.setItem('budgets', JSON.stringify(updatedBudgets));
            }

            // Update Redux store
            dispatch(addBudget(newBudget));

            Alert.alert('Success', 'Budget created successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Error creating budget: ', error);
            Alert.alert('Error', 'Failed to create budget. Please try again.');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.inputContainer}>
                <CustomText style={styles.label}>Budget Name</CustomText>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter budget name"
                />
            </View>

            <View style={styles.inputContainer}>
                <CustomText style={styles.label}>Budget Goal</CustomText>
                <TextInput
                    style={styles.input}
                    value={goal}
                    onChangeText={setGoal}
                    placeholder="Enter budget goal"
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.inputContainer}>
                <CustomText style={styles.label}>Category</CustomText>
                <View style={styles.categoryContainer}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.name}
                            style={[
                                styles.categoryItem,
                                category.name === cat.name && styles.selectedCategory,
                            ]}
                            onPress={() => setCategory(cat)}
                        >
                            <MaterialIcons name={cat.icon} size={24} color={category.name === cat.name ? '#FFFFFF' : '#2C3E50'} />
                            <CustomText style={[
                                styles.categoryText,
                                category.name === cat.name && styles.selectedCategoryText,
                            ]}>
                                {cat.name}
                            </CustomText>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.inputContainer}>
                <CustomText style={styles.label}>Enable Notifications</CustomText>
                <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                />
            </View>

            {notificationsEnabled && (
                <View style={styles.inputContainer}>
                    <CustomText style={styles.label}>Reminder Frequency</CustomText>
                    <View style={styles.frequencyContainer}>
                        {['daily', 'weekly', 'monthly'].map((freq) => (
                            <TouchableOpacity
                                key={freq}
                                style={[
                                    styles.frequencyItem,
                                    reminderFrequency === freq && styles.selectedFrequency,
                                ]}
                                onPress={() => setReminderFrequency(freq)}
                            >
                                <CustomText style={[
                                    styles.frequencyText,
                                    reminderFrequency === freq && styles.selectedFrequencyText,
                                ]}>
                                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                                </CustomText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            <CustomButton
                title="Create Budget"
                onPress={handleCreateBudget}
                buttonStyle={styles.createButton}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ECF0F1',
        padding: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#2C3E50',
    },
    input: {
        borderWidth: 1,
        borderColor: '#3498DB',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    selectedCategory: {
        backgroundColor: '#3498DB',
    },
    categoryText: {
        marginLeft: 10,
        color: '#2C3E50',
    },
    selectedCategoryText: {
        color: '#FFFFFF',
    },
    frequencyContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    frequencyItem: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    selectedFrequency: {
        backgroundColor: '#3498DB',
    },
    frequencyText: {
        color: '#2C3E50',
    },
    selectedFrequencyText: {
        color: '#FFFFFF',
    },
    createButton: {
        backgroundColor: '#2ECC71',
        marginTop: 20,
    },
});

export default CreateBudgetScreen;