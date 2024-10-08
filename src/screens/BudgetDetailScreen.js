import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Alert, TouchableOpacity } from 'react-native';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setBudgets } from '../redux/budgetSlice';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';
import { addTransaction } from '../redux/transactionSlice';

const BudgetDetailScreen = ({ navigation, route }) => {
    const [budget, setBudget] = useState(route.params.budget);
    const [amount, setAmount] = useState('');
    const [isAddingFunds, setIsAddingFunds] = useState(false);
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        const checkOfflineMode = async () => {
            const offlineMode = await AsyncStorage.getItem('offlineMode');
            setIsOfflineMode(offlineMode === 'true');
        };
        checkOfflineMode();
        fetchBudgetDetails();
    }, []);

    const fetchBudgetDetails = async () => {
        try {
            const offlineMode = await AsyncStorage.getItem('offlineMode');
            const isOffline = offlineMode === 'true';
            setIsOfflineMode(isOffline);

            if (isOffline) {
                const storedBudgets = await AsyncStorage.getItem('offlineBudgets');
                if (storedBudgets) {
                    const budgets = JSON.parse(storedBudgets);
                    const updatedBudget = budgets.find(b => b.id === budget.id);
                    if (updatedBudget) {
                        dispatch(setBudgets([updatedBudget]));
                    }
                }
            } else {
                const storedBudgets = await AsyncStorage.getItem('budgets');
                if (storedBudgets) {
                    const budgets = JSON.parse(storedBudgets);
                    const updatedBudget = budgets.find(b => b.id === budget.id);
                    if (updatedBudget) {
                        dispatch(setBudgets([updatedBudget]));
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching budget details:', error);
        }
    };

    const addFunds = async () => {
        if (isAddingFunds) return;
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

        try {
            const updatedBudget = { ...budget, amountSpent: newTotalSpent };

            if (isOfflineMode) {
                const storedBudgets = await AsyncStorage.getItem('offlineBudgets');
                const budgets = storedBudgets ? JSON.parse(storedBudgets) : [];
                const updatedBudgets = budgets.map(b => b.id === updatedBudget.id ? updatedBudget : b);
                await AsyncStorage.setItem('offlineBudgets', JSON.stringify(updatedBudgets));
            } else {
                const userId = auth.currentUser.uid;
                const userBudgetsRef = doc(db, 'userBudgets', userId);
                const docSnap = await getDoc(userBudgetsRef);
                if (docSnap.exists()) {
                    const userBudgets = docSnap.data().budgets || [];
                    const updatedBudgets = userBudgets.map(b => b.id === updatedBudget.id ? updatedBudget : b);
                    await updateDoc(userBudgetsRef, { budgets: updatedBudgets });
                }

                const newTransaction = {
                    id: Date.now().toString(),
                    budgetId: budget.id,
                    budgetName: budget.name,
                    amount: fundAmount,
                    date: new Date().toISOString(),
                    type: 'expense'
                };

                if (!isOfflineMode) {
                    const transactionsRef = doc(db, 'transactions', userId);
                    await updateDoc(transactionsRef, {
                        transactions: arrayUnion({
                            ...newTransaction,
                            date: new Date()
                        })
                    });
                }


                const storedTransactions = await AsyncStorage.getItem('transactions');
                const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
                transactions.push(newTransaction);
                await AsyncStorage.setItem('transactions', JSON.stringify(transactions));
                dispatch(addTransaction(newTransaction));

                const storedBudgets = await AsyncStorage.getItem('budgets');
                if (storedBudgets) {
                    const budgets = JSON.parse(storedBudgets);
                    const updatedBudgets = budgets.map(b => b.id === updatedBudget.id ? updatedBudget : b);
                    await AsyncStorage.setItem('budgets', JSON.stringify(updatedBudgets));
                }
            }

            // Check if the budget is completed
            if (newTotalSpent >= budget.goal) {
                // Move the budget to completed in the local state
                const activeBudgets = (await AsyncStorage.getItem('budgets'))
                    ? JSON.parse(await AsyncStorage.getItem('budgets'))
                    : [];
                const updatedActiveBudgets = activeBudgets.filter(b => b.id !== budget.id);
                await AsyncStorage.setItem('budgets', JSON.stringify(updatedActiveBudgets));

                // Update Redux store
                dispatch(setBudgets(updatedActiveBudgets));

                Alert.alert(
                    "Budget Completed",
                    `Congratulations! You've reached your goal for "${budget.name}".`,
                    [
                        { text: "OK", onPress: () => navigation.navigate('Budget') }
                    ]
                );
            } else {
                setBudget(updatedBudget);
                dispatch(setBudgets([updatedBudget]));
            }

            setAmount('');
            Alert.alert('Success', 'Funds added successfully');
        } catch (error) {
            console.error('Error adding funds:', error);
            Alert.alert('Error', 'Failed to add funds. Please try again.');
        } finally {
            setIsAddingFunds(false);
        }
    };

    const addNotification = async (budgetName) => {
        try {
            const newNotification = {
                id: Date.now().toString(),
                message: `Budget "${budgetName}" has been completed!`,
                createdAt: new Date().toISOString()
            };

            const storageKey = isOfflineMode ? 'offlineNotifications' : 'notifications';
            const storedNotifications = await AsyncStorage.getItem(storageKey);
            const notifications = storedNotifications ? JSON.parse(storedNotifications) : [];
            notifications.push(newNotification);
            await AsyncStorage.setItem(storageKey, JSON.stringify(notifications));

            if (!isOfflineMode) {
                const userId = auth.currentUser.uid;
                const notificationsRef = doc(db, 'notifications', userId);
                await updateDoc(notificationsRef, {
                    notifications: arrayUnion({
                        ...newNotification,
                        createdAt: new Date()
                    })
                });
            }
        } catch (error) {
            console.error('Error adding notification:', error);
        }
    };

    const handleEdit = () => {
        navigation.navigate('EditBudget', {
            budget: budget,
            isOfflineMode: isOfflineMode
        });
    };

    const handleDelete = async () => {
        Alert.alert(
            "Delete Budget",
            "Are you sure you want to delete this budget?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            if (isOfflineMode) {
                                const storedBudgets = await AsyncStorage.getItem('offlineBudgets');
                                if (storedBudgets) {
                                    const budgets = JSON.parse(storedBudgets);
                                    const updatedBudgets = budgets.filter(b => b.id !== budget.id);
                                    await AsyncStorage.setItem('offlineBudgets', JSON.stringify(updatedBudgets));
                                }
                            } else {
                                const userId = auth.currentUser.uid;
                                const userBudgetsRef = doc(db, 'userBudgets', userId);
                                const docSnap = await getDoc(userBudgetsRef);
                                if (docSnap.exists()) {
                                    const userBudgets = docSnap.data().budgets || [];
                                    const updatedBudgets = userBudgets.filter(b => b.id !== budget.id);
                                    await updateDoc(userBudgetsRef, { budgets: updatedBudgets });
                                }

                                const storedBudgets = await AsyncStorage.getItem('budgets');
                                if (storedBudgets) {
                                    const budgets = JSON.parse(storedBudgets);
                                    const updatedBudgets = budgets.map(b => b.id === budget.id ? updatedBudget : b);
                                    await AsyncStorage.setItem('budgets', JSON.stringify(updatedBudgets));
                                }
                            }

                            dispatch(setBudgets([]));

                            Alert.alert('Success', 'Budget deleted successfully');
                            navigation.goBack();
                        } catch (error) {
                            console.error('Error deleting budget:', error);
                            Alert.alert('Error', 'Failed to delete budget. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <MaterialIcons name={budget.icon} size={50} color="#FFFFFF" />
                <CustomText style={styles.title}>{budget.name}</CustomText>
            </View>

            <View style={styles.card}>
                <View style={styles.row}>
                    <View style={styles.column}>
                        <CustomText style={styles.label}>Goal</CustomText>
                        <CustomText style={styles.value}>${budget.goal}</CustomText>
                    </View>
                    <View style={styles.column}>
                        <CustomText style={styles.label}>Spent</CustomText>
                        <CustomText style={styles.value}>${budget.amountSpent || 0}</CustomText>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.column}>
                        <CustomText style={styles.label}>Remaining</CustomText>
                        <CustomText style={styles.value}>${budget.goal - (budget.amountSpent || 0)}</CustomText>
                    </View>
                    <View style={styles.column}>
                        <CustomText style={styles.label}>Category</CustomText>
                        <CustomText style={styles.value}>{budget.category.name}</CustomText>
                    </View>
                </View>
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${(budget.amountSpent / budget.goal) * 100}%` }]} />
                </View>
            </View>

            <View style={styles.card}>
                <CustomText style={styles.cardTitle}>Add Funds</CustomText>
                <View style={styles.addFundsContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter amount"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                    />
                    <CustomButton
                        title="Add"
                        onPress={addFunds}
                        buttonStyle={styles.addButton}
                        disabled={isAddingFunds}
                    />
                </View>
            </View>

            <View style={styles.card}>
                <CustomText style={styles.cardTitle}>Additional Information</CustomText>
                <CustomText style={styles.infoText}>Notifications: {budget.notificationsEnabled ? 'Enabled' : 'Disabled'}</CustomText>
                {budget.notificationsEnabled && (
                    <CustomText style={styles.infoText}>Reminder Frequency: {budget.reminderFrequency}</CustomText>
                )}
                <CustomText style={styles.infoText}>Created: {formatDate(budget.createdAt)}</CustomText>
            </View>

            <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                    <MaterialIcons name="edit" size={24} color="#FFFFFF" />
                    <CustomText style={styles.buttonText}>Edit</CustomText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <MaterialIcons name="delete" size={24} color="#FFFFFF" />
                    <CustomText style={styles.buttonText}>Delete</CustomText>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F0F0',
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
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 20,
        margin: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    column: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        color: '#7F8C8D',
        marginBottom: 5,
    },
    value: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    progressBarContainer: {
        height: 10,
        backgroundColor: '#EAECEE',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#2ECC71',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 15,
    },
    addFundsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#EAECEE',
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        fontSize: 16,
    },
    addButton: {
        backgroundColor: '#2ECC71',
        paddingHorizontal: 20,
    },
    infoText: {
        fontSize: 16,
        color: '#2C3E50',
        marginBottom: 5,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 10,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3498DB',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginRight: 5,
        justifyContent: 'center',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E74C3C',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginLeft: 5,
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        marginLeft: 5,
        fontSize: 16,
    },
});

export default BudgetDetailScreen;