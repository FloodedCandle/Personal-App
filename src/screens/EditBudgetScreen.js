import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { db, auth } from '../config/firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const EditBudgetScreen = ({ route, navigation }) => {
    const { budget } = route.params;
    const [name, setName] = useState(budget.name);
    const [goal, setGoal] = useState(budget.goal.toString());

    const handleSave = async () => {
        if (!name || !goal) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            const userId = auth.currentUser.uid;
            const userBudgetsRef = doc(db, 'userBudgets', userId);
            const docSnap = await getDoc(userBudgetsRef);

            if (docSnap.exists()) {
                const userBudgets = docSnap.data().budgets;
                const updatedBudgets = userBudgets.map(b =>
                    b.id === budget.id ? { ...b, name, goal: parseFloat(goal) } : b
                );

                await updateDoc(userBudgetsRef, { budgets: updatedBudgets });
                Alert.alert('Success', 'Budget updated successfully');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error updating budget: ', error);
            Alert.alert('Error', 'Failed to update budget. Please try again.');
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
            <CustomButton
                title="Save Changes"
                onPress={handleSave}
                buttonStyle={styles.saveButton}
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
    saveButton: {
        backgroundColor: '#2ECC71',
        marginTop: 20,
    },
});

export default EditBudgetScreen;