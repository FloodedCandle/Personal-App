import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch, Alert, Modal, TouchableOpacity } from 'react-native';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { TextInput } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../config/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';

const iconOptions = [
    'attach-money', 'shopping-cart', 'home', 'directions-car', 'fastfood',
    'local-hospital', 'school', 'flight', 'fitness-center', 'pets'
];

const EditBudgetScreen = ({ route, navigation }) => {
    const { budget } = route.params;
    const [name, setName] = useState(budget.name);
    const [goal, setGoal] = useState(budget.goal.toString());
    const [startDate, setStartDate] = useState(new Date(budget.startDate.seconds * 1000));
    const [endDate, setEndDate] = useState(new Date(budget.endDate.seconds * 1000));
    const [isRepeatable, setIsRepeatable] = useState(budget.isRepeatable);
    const [notificationEnabled, setNotificationEnabled] = useState(budget.notificationEnabled);
    const [selectedIcon, setSelectedIcon] = useState(budget.icon);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);

    const handleUpdateBudget = async () => {
        if (!name || !goal) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            await updateDoc(doc(db, 'budgets', budget.id), {
                name,
                goal: parseFloat(goal),
                startDate,
                endDate,
                isRepeatable,
                notificationEnabled,
                icon: selectedIcon,
            });

            Alert.alert('Success', 'Budget updated successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Error updating budget: ', error);
            Alert.alert('Error', 'Failed to update budget. Please try again.');
        }
    };

    // ... (rest of the component, similar to CreateBudgetScreen)

    return (
        <ScrollView style={styles.container}>
            <CustomText style={styles.title}>Edit Budget</CustomText>

            {/* ... (input fields, date pickers, switches, and icon picker, similar to CreateBudgetScreen) */}

            <CustomButton
                title="Update Budget"
                onPress={handleUpdateBudget}
                buttonStyle={styles.updateButton}
            />

            {/* ... (date pickers and icon picker modal, similar to CreateBudgetScreen) */}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    // ... (styles similar to CreateBudgetScreen)
    updateButton: {
        backgroundColor: '#3498DB',
        marginTop: 20,
    },
});

export default EditBudgetScreen;