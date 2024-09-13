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
        if (!amount || isNaN(parseFloat(amount))) {
            Alert.alert('Invalid Amount', 'Please enter a valid number.');
            return;
        }

        const fundAmount = parseFloat(amount);
        const userId = auth.currentUser.uid;
        const userBudgetsRef = doc(db, 'userBudgets', userId);

        try {
            const docSnap = await getDoc(userBudgetsRef);
            if (docSnap.exists()) {
                const userBudgets = docSnap.data().budgets;
                const updatedBudgets = userBudgets.map(b => {
                    if (b.id === budget.id) {
                        const newAmountSpent = (b.amountSpent || 0) + fundAmount;
                        return { ...b, amountSpent: newAmountSpent };
                    }
                    return b;
                });

                await updateDoc(userBudgetsRef, { budgets: updatedBudgets });

                // Add transaction
                await addTransaction(budget.name, fundAmount);

                Alert.alert('Success', 'Funds added successfully');
                setAmount(''); // Clear the input field
                fetchBudgetDetails(); // Refresh the budget details
            }
        } catch (error) {
            console.error('Error adding funds:', error);
            Alert.alert('Error', 'Failed to add funds. Please try again.');
        }
    };

    const addNotification = async (budgetName) => {
        const userId = auth.currentUser.uid;
        const notificationsRef = doc(db, 'notifications', userId);
        await setDoc(notificationsRef, {
            notifications: arrayUnion({
                id: Date.now().toString(),
                message: `Budget "${budgetName}" has been completed!`,
                createdAt: new Date()
            })
        }, { merge: true });
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

    const formatDate = (date) => {
        if (date && date.seconds) {
            return new Date(date.seconds * 1000).toLocaleDateString();
        }
        return 'N/A';
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
                <CustomText style={styles.detailText}>Category: {budget.category}</CustomText>
                <CustomText style={styles.detailText}>Created: {formatDate(budget.createdAt)}</CustomText>
                {budget.notificationsEnabled && (
                    <CustomText style={styles.detailText}>Reminder: {budget.reminderFrequency}</CustomText>
                )}
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