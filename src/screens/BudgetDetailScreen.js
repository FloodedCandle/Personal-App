import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import CustomText from '../components/CustomText';
import { MaterialIcons } from '@expo/vector-icons';

const BudgetDetailScreen = ({ route, navigation }) => {
    const { budget } = route.params;

    if (!budget) {
        return (
            <View style={styles.container}>
                <CustomText>Budget not found</CustomText>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <MaterialIcons name={budget.icon} size={50} color="#2C3E50" />
                <CustomText style={styles.title}>{budget.name}</CustomText>
            </View>
            <View style={styles.details}>
                <CustomText style={styles.detailText}>Goal: ${budget.goal}</CustomText>
                <CustomText style={styles.detailText}>Spent: ${budget.amountSpent || 0}</CustomText>
                <CustomText style={styles.detailText}>Start Date: {budget.startDate.toDate().toLocaleDateString()}</CustomText>
                <CustomText style={styles.detailText}>End Date: {budget.endDate.toDate().toLocaleDateString()}</CustomText>
                <CustomText style={styles.detailText}>Repeatable: {budget.isRepeatable ? 'Yes' : 'No'}</CustomText>
                <CustomText style={styles.detailText}>Notifications: {budget.notificationEnabled ? 'Enabled' : 'Disabled'}</CustomText>
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
});

export default BudgetDetailScreen;