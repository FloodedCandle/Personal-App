import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Alert, Switch, TouchableOpacity } from 'react-native';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { db, auth } from '../config/firebaseConfig';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';

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

    const handleCreateBudget = async () => {
        if (!name || !goal) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            const userId = auth.currentUser.uid;
            const userBudgetsRef = doc(db, 'userBudgets', userId);

            const newBudget = {
                id: Date.now().toString(),
                name,
                goal: parseFloat(goal),
                amountSpent: 0,
                category: category.name,
                icon: category.icon,
                notificationsEnabled,
                reminderFrequency,
                createdAt: new Date(),
            };

            const docSnap = await getDoc(userBudgetsRef);
            if (docSnap.exists()) {
                await updateDoc(userBudgetsRef, {
                    budgets: arrayUnion(newBudget)
                });
            } else {
                await updateDoc(userBudgetsRef, {
                    budgets: [newBudget]
                });
            }

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