import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Alert, TouchableOpacity } from 'react-native';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { MaterialIcons } from '@expo/vector-icons';
import { db, auth } from '../config/firebaseConfig';
import { doc, updateDoc, arrayUnion, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

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

    const handleEdit = () => {
        navigation.navigate('EditBudget', { budget });
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
                            const userId = auth.currentUser.uid;
                            const userBudgetsRef = doc(db, 'userBudgets', userId);
                            const docSnap = await getDoc(userBudgetsRef);
                            if (docSnap.exists()) {
                                const userBudgets = docSnap.data().budgets;
                                const updatedBudgets = userBudgets.filter(b => b.id !== budget.id);
                                await updateDoc(userBudgetsRef, { budgets: updatedBudgets });
                                navigation.goBack();
                            }
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