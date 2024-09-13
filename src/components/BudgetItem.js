import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import CustomText from './CustomText';

const BudgetItem = ({ name, amountSpent, amountTotal, icon, onPress, onEdit, onDelete }) => {
    const progress = (amountSpent / amountTotal) * 100;

    return (
        <TouchableOpacity style={styles.budgetItem} onPress={onPress}>
            <View style={styles.iconContainer}>
                <MaterialIcons name={icon} size={24} color="#2ECC71" />
            </View>
            <View style={styles.budgetDetails}>
                <CustomText style={styles.budgetName}>{name}</CustomText>
                <View style={styles.progressContainer}>
                    <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBar, { width: `${progress}%` }]} />
                    </View>
                    <CustomText style={styles.progressText}>${amountSpent} / ${amountTotal}</CustomText>
                </View>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                    <MaterialIcons name="edit" size={24} color="#3498DB" />
                </TouchableOpacity>
                <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
                    <MaterialIcons name="delete" size={24} color="#E74C3C" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    budgetItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    iconContainer: {
        marginRight: 15,
    },
    budgetDetails: {
        flex: 1,
    },
    budgetName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 5,
    },
    progressContainer: {
        flexDirection: 'column',
    },
    progressBarBackground: {
        height: 6,
        backgroundColor: '#EBEDEF',
        borderRadius: 3,
        marginBottom: 5,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#3498DB',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: '#7F8C8D',
    },
    actionButtons: {
        flexDirection: 'row',
    },
    actionButton: {
        padding: 5,
    },
});

export default BudgetItem;
