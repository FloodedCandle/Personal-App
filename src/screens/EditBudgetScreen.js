import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Alert, TouchableOpacity } from 'react-native';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { db, auth } from '../config/firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { updateBudget } from '../redux/budgetSlice';

const EditBudgetScreen = ({ route, navigation }) => {
    const { budget, isOfflineMode } = route.params;
    const [name, setName] = useState(budget.name);
    const [goal, setGoal] = useState(budget.goal.toString());
    const dispatch = useDispatch();

    const handleSave = async () => {
        if (!name || !goal) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            const updatedBudget = { ...budget, name, goal: parseFloat(goal) };

            if (isOfflineMode) {
                const storedBudgets = await AsyncStorage.getItem('offlineBudgets');
                if (storedBudgets) {
                    const budgets = JSON.parse(storedBudgets);
                    const updatedBudgets = budgets.map(b =>
                        b.id === budget.id ? updatedBudget : b
                    );
                    await AsyncStorage.setItem('offlineBudgets', JSON.stringify(updatedBudgets));
                    dispatch(updateBudget(updatedBudget));
                }
            } else {
                const userId = auth.currentUser.uid;
                const userBudgetsRef = doc(db, 'userBudgets', userId);
                const docSnap = await getDoc(userBudgetsRef);

                if (docSnap.exists()) {
                    const userBudgets = docSnap.data().budgets;
                    const updatedBudgets = userBudgets.map(b =>
                        b.id === budget.id ? updatedBudget : b
                    );

                    await updateDoc(userBudgetsRef, { budgets: updatedBudgets });

                    await AsyncStorage.setItem('budgets', JSON.stringify(updatedBudgets));
                    dispatch(updateBudget(updatedBudget));
                }
            }

            Alert.alert('Success', 'Budget updated successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Error updating budget: ', error);
            Alert.alert('Error', 'Failed to update budget. Please try again.');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <MaterialIcons name={budget.icon} size={50} color="#FFFFFF" />
                <CustomText style={styles.title}>Edit Budget</CustomText>
            </View>

            <View style={styles.card}>
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

                <CustomButton
                    title="Save Changes"
                    onPress={handleSave}
                    buttonStyle={styles.saveButton}
                />
            </View>

            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                <CustomText style={styles.cancelButtonText}>Cancel</CustomText>
            </TouchableOpacity>
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
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#2ECC71',
        marginTop: 20,
    },
    cancelButton: {
        alignItems: 'center',
        padding: 15,
        marginTop: 10,
    },
    cancelButtonText: {
        color: '#E74C3C',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditBudgetScreen;