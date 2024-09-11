import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import CustomText from '../components/CustomText';

const BudgetItem = ({ name, amountSpent, amountTotal, onPress }) => {
    const progress = (amountSpent / amountTotal) * 100;

    return (
        <TouchableOpacity style={styles.budgetItem} onPress={onPress}>
            <MaterialIcons name="attach-money" size={24} color="#2ECC71" />
            <View style={styles.budgetDetails}>
                <CustomText style={styles.budgetName}>{name}</CustomText>
                <View style={styles.progressContainer}>
                    <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBar, { width: `${progress}%` }]} />
                    </View>
                    <CustomText style={styles.progressText}>${amountSpent} / ${amountTotal}</CustomText>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    budgetItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#2C3E50',
        borderRadius: 8,
        shadowColor: '#2C3E50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    budgetDetails: {
        marginLeft: 10,
        flex: 1,
    },
    budgetName: {
        fontSize: 16,
        color: '#ECF0F1',
        fontWeight: 'bold',
    },
    progressContainer: {
        flexDirection: 'column',
        marginTop: 5,
    },
    progressBarBackground: {
        height: 10,
        backgroundColor: '#BDC3C7', // Background color for remaining progress
        borderRadius: 5,
        width: '100%',
    },
    progressBar: {
        height: 10,
        backgroundColor: '#2ECC71', // Color for progress
        borderRadius: 5,
        position: 'absolute',
        left: 0,
        top: 0,
    },
    progressText: {
        fontSize: 14,
        color: '#ECF0F1',
        marginTop: 5,
    },
});

export default BudgetItem;
