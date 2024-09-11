import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch, Alert, Modal, TouchableOpacity } from 'react-native';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { TextInput } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db, auth } from '../config/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';

const iconOptions = [
    'attach-money', 'shopping-cart', 'home', 'directions-car', 'fastfood',
    'local-hospital', 'school', 'flight', 'fitness-center', 'pets'
];

const CreateBudgetScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [goal, setGoal] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [isRepeatable, setIsRepeatable] = useState(false);
    const [notificationEnabled, setNotificationEnabled] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState('attach-money');
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);

    const handleCreateBudget = async () => {
        if (!name || !goal) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            const userId = auth.currentUser.uid;
            await addDoc(collection(db, 'budgets'), {
                userId,
                name,
                goal: parseFloat(goal),
                amountSpent: 0,
                startDate,
                endDate,
                isRepeatable,
                notificationEnabled,
                icon: selectedIcon,
                createdAt: new Date(),
            });

            Alert.alert('Success', 'Budget created successfully');
            navigation.navigate('Home');
        } catch (error) {
            console.error('Error creating budget: ', error);
            Alert.alert('Error', 'Failed to create budget. Please try again.');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <CustomText style={styles.title}>Create New Budget</CustomText>

            <TextInput
                style={styles.input}
                placeholder="Budget Name"
                value={name}
                onChangeText={setName}
            />

            <TextInput
                style={styles.input}
                placeholder="Budget Goal"
                value={goal}
                onChangeText={setGoal}
                keyboardType="numeric"
            />

            <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartDatePicker(true)}>
                <CustomText>Start Date: {startDate.toDateString()}</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndDatePicker(true)}>
                <CustomText>End Date: {endDate.toDateString()}</CustomText>
            </TouchableOpacity>

            <View style={styles.switchContainer}>
                <CustomText>Repeatable:</CustomText>
                <Switch
                    value={isRepeatable}
                    onValueChange={setIsRepeatable}
                />
            </View>

            <View style={styles.switchContainer}>
                <CustomText>Enable Notifications:</CustomText>
                <Switch
                    value={notificationEnabled}
                    onValueChange={setNotificationEnabled}
                />
            </View>

            <TouchableOpacity style={styles.iconButton} onPress={() => setShowIconPicker(true)}>
                <MaterialIcons name={selectedIcon} size={24} color="#2C3E50" />
                <CustomText style={styles.iconButtonText}>Select Icon</CustomText>
            </TouchableOpacity>

            <CustomButton
                title="Create Budget"
                onPress={handleCreateBudget}
                buttonStyle={styles.createButton}
            />

            {showStartDatePicker && (
                <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowStartDatePicker(false);
                        if (selectedDate) setStartDate(selectedDate);
                    }}
                />
            )}

            {showEndDatePicker && (
                <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowEndDatePicker(false);
                        if (selectedDate) setEndDate(selectedDate);
                    }}
                />
            )}

            <Modal
                visible={showIconPicker}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <CustomText style={styles.modalTitle}>Select an Icon</CustomText>
                        <View style={styles.iconGrid}>
                            {iconOptions.map((icon) => (
                                <TouchableOpacity
                                    key={icon}
                                    style={styles.iconOption}
                                    onPress={() => {
                                        setSelectedIcon(icon);
                                        setShowIconPicker(false);
                                    }}
                                >
                                    <MaterialIcons name={icon} size={30} color="#2C3E50" />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <CustomButton
                            title="Cancel"
                            onPress={() => setShowIconPicker(false)}
                            buttonStyle={styles.cancelButton}
                        />
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ECF0F1',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2C3E50',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    dateButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    iconButtonText: {
        marginLeft: 10,
    },
    createButton: {
        backgroundColor: '#2ECC71',
        marginTop: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 20,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    iconOption: {
        margin: 10,
    },
    cancelButton: {
        backgroundColor: '#E74C3C',
        marginTop: 20,
    },
});

export default CreateBudgetScreen;