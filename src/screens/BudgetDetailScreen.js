import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { MaterialIcons } from '@expo/vector-icons';

const BudgetDetailScreen = ({ route, navigation }) => {
    const { budget } = route.params;

    const handleEdit = () => {
        navigation.navigate('EditBudget', { budget });
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
            </View>
            <CustomButton
                title="Edit Budget"
                onPress={handleEdit}
                buttonStyle={styles.editButton}
            />
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
    editButton: {
        backgroundColor: '#2ECC71',
        margin: 20,
    },
});

export default BudgetDetailScreen;