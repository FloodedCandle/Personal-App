import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { db } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const BudgetDetailScreen = ({ route, navigation }) => {
    const { budgetId } = route.params;
    const [budget, setBudget] = useState(null);
    const [amountToAdd, setAmountToAdd] = useState('');

    const fetchBudget = async () => {
        try {
            const budgetDoc = await getDoc(doc(db, 'budgets', budgetId));
            if (budgetDoc.exists()) {
                setBudget({ id: budgetDoc.id, ...budgetDoc.data() });
            } else {
                Alert.alert('Error', 'Budget not found');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error fetching budget: ', error);
            Alert.alert('Error', 'Failed to fetch budget details');
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchBudget();
        }, [budgetId])
    );

    const handleAddAmount = async () => {
        if (!amountToAdd || isNaN(amountToAdd)) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        try {
            const newAmountSpent = (budget.amountSpent || 0) + parseFloat(amountToAdd);
            await updateDoc(doc(db, 'budgets', budgetId), {
                amountSpent: newAmountSpent,
            });
            setBudget({ ...budget, amountSpent: newAmountSpent });
            setAmountToAdd('');
            Alert.alert('Success', 'Amount added successfully');
        } catch (error) {
            console.error('Error adding amount: ', error);
            Alert.alert('Error', 'Failed to add amount');
        }
    };

    const handleEditBudget = () => {
        navigation.navigate('EditBudget', { budget });
    };

    if (!budget) {
        return <CustomText>Loading...</CustomText>;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.iconContainer}>
                <MaterialIcons name={budget.icon} size={50} color="#2C3E50" />
            </View>
            <CustomText style={styles.title}>{budget.name}</CustomText>
            <CustomText style={styles.amount}>
                ${budget.amountSpent || 0} / ${budget.goal}
            </CustomText>
            <View style={styles.progressBarContainer}>
                <View
                    style={[
                        styles.progressBar,
                        { width: `${((budget.amountSpent || 0) / budget.goal) * 100}%` },
                    ]}
                />
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter amount to add"
                    value={amountToAdd}
                    onChangeText={setAmountToAdd}
                    keyboardType="numeric"
                />
                <CustomButton
                    title="Add Amount"
                    onPress={handleAddAmount}
                    buttonStyle={styles.addButton}
                />
            </View>
            <CustomButton
                title="Edit Budget"
                onPress={handleEditBudget}
                buttonStyle={styles.editButton}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ECF0F1',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#2C3E50',
    },
    amount: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
        color: '#2C3E50',
    },
    progressBarContainer: {
        height: 20,
        backgroundColor: '#BDC3C7',
        borderRadius: 10,
        marginBottom: 20,
    },
    progressBar: {
        height: 20,
        backgroundColor: '#3498DB',
        borderRadius: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
    },
    addButton: {
        backgroundColor: '#2ECC71',
    },
    editButton: {
        backgroundColor: '#3498DB',
    },
});

export default BudgetDetailScreen;