import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { MaterialIcons } from '@expo/vector-icons';
import { db, auth } from '../config/firebaseConfig';
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';

const BudgetDetailScreen = ({ route, navigation }) => {
    const [budget, setBudget] = useState(route.params.budget);
    const [amount, setAmount] = useState('');
    const [isAddingFunds, setIsAddingFunds] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchBudgetDetails();
        });

        return unsubscribe;
    }, [navigation]);

    const fetchBudgetDetails = async () => {
        const userId = auth.currentUser.uid;
        const userBudgetsRef = doc(db, 'userBudgets', userId);
        const docSnap = await getDoc(userBudgetsRef);
        if (docSnap.exists()) {
            const userBudgets = docSnap.data().budgets;
            const updatedBudget = userBudgets.find(b => b.id === budget.id);
            if (updatedBudget) {
                setBudget(updatedBudget);
            }
        }
    };

    const addFunds = async () => {
        if (isAddingFunds) return; // Prevent double-clicking
        setIsAddingFunds(true);

        if (!amount || isNaN(parseFloat(amount))) {
            Alert.alert('Invalid Amount', 'Please enter a valid number.');
            setIsAddingFunds(false);
            return;
        }

        const fundAmount = parseFloat(amount);
        const newTotalSpent = (budget.amountSpent || 0) + fundAmount;

        if (newTotalSpent > budget.goal) {
            Alert.alert(
                'Exceeds Goal',
                `Adding $${fundAmount} would exceed the budget goal. The maximum you can add is $${(budget.goal - (budget.amountSpent || 0)).toFixed(2)}.`,
                [{ text: 'OK' }]
            );
            setIsAddingFunds(false);
            return;
        }

        const userId = auth.currentUser.uid;
        const userBudgetsRef = doc(db, 'userBudgets', userId);

        try {
            const docSnap = await getDoc(userBudgetsRef);
            if (docSnap.exists()) {
                const userBudgets = docSnap.data().budgets;
                const updatedBudgets = userBudgets.map(b => {
                    if (b.id === budget.id) {
                        return { ...b, amountSpent: newTotalSpent };
                    }
                    return b;
                });

                await updateDoc(userBudgetsRef, { budgets: updatedBudgets });
                await addTransaction(budget.name, fundAmount);

                if (newTotalSpent >= budget.goal) {
                    await addNotification(budget.name);
                    Alert.alert('Budget Goal Reached', `Congratulations! You've reached your goal for "${budget.name}"`, [
                        { text: 'OK', onPress: () => navigation.navigate('Home') }
                    ]);
                } else {
                    Alert.alert('Success', 'Funds added successfully');
                    setAmount('');
                    fetchBudgetDetails();
                }
            }
        } catch (error) {
            console.error('Error adding funds:', error);
            Alert.alert('Error', 'Failed to add funds. Please try again.');
        } finally {
            setIsAddingFunds(false);
        }
    };

    const addNotification = async (budgetName) => {
        const userId = auth.currentUser.uid;
        const notificationsRef = doc(db, 'notifications', userId);
        const newNotification = {
            id: Date.now().toString(),
            message: `Budget "${budgetName}" has been completed!`,
            createdAt: new Date()
        };

        try {
            const docSnap = await getDoc(notificationsRef);
            if (docSnap.exists()) {
                await updateDoc(notificationsRef, {
                    notifications: arrayUnion(newNotification)
                });
            } else {
                await setDoc(notificationsRef, {
                    notifications: [newNotification]
                });
            }
            console.log('Notification added successfully');
        } catch (error) {
            console.error('Error adding notification:', error);
        }
    };

    const addTransaction = async (budgetName, amount) => {
        const userId = auth.currentUser.uid;
        const transactionsRef = doc(db, 'transactions', userId);
        await setDoc(transactionsRef, {
            transactions: arrayUnion({
                id: Date.now().toString(),
                budgetName,
                amount,
                date: new Date()
            })
        }, { merge: true });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <MaterialIcons name={budget.icon} size={50} color="#2C3E50" />
                <CustomText style={styles.title}>{budget.name}</CustomText>
            </View>
            <View style={styles.details}>
                <CustomText style={styles.detailText}>Goal: ${budget.goal}</CustomText>
                <CustomText style={styles.detailText}>Spent: ${budget.amountSpent || 0}</CustomText>
                <CustomText style={styles.detailText}>Remaining: ${budget.goal - (budget.amountSpent || 0)}</CustomText>
                <CustomText style={styles.detailText}>Category: {budget.category.name}</CustomText>
                <CustomText style={styles.detailText}>Icon: {budget.category.icon}</CustomText>
                <CustomText style={styles.detailText}>Notifications: {budget.notificationsEnabled ? 'Enabled' : 'Disabled'}</CustomText>
                {budget.notificationsEnabled && (
                    <CustomText style={styles.detailText}>Reminder Frequency: {budget.reminderFrequency}</CustomText>
                )}
                <CustomText style={styles.detailText}>Created: {formatDate(budget.createdAt)}</CustomText>
            </View>
            <View style={styles.addFundsContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter amount"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                />
                <CustomButton
                    title="Add Funds"
                    onPress={addFunds}
                    buttonStyle={styles.addButton}
                    disabled={isAddingFunds}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ECF0F1',
    },
    header: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#3498DB',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 10,
    },
    details: {
        padding: 20,
    },
    detailText: {
        fontSize: 18,
        marginBottom: 10,
        color: '#2C3E50',
    },
    addFundsContainer: {
        padding: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#3498DB',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: '#2ECC71',
    },
});

export default BudgetDetailScreen;