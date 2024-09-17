import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, SectionList } from 'react-native';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { MaterialIcons } from '@expo/vector-icons';
import BudgetItem from '../components/BudgetItem';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { db, auth } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { setBudgets } from '../redux/budgetSlice';

const BudgetScreen = () => {
  const [budgets, setBudgetsState] = useState({ active: [], completed: [] });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useFocusEffect(
    useCallback(() => {
      checkOfflineMode();
      fetchBudgets();
    }, [])
  );

  const checkOfflineMode = async () => {
    const offlineMode = await AsyncStorage.getItem('offlineMode');
    setIsOfflineMode(offlineMode === 'true');
  };

  const fetchBudgets = async () => {
    try {
      const offlineMode = await AsyncStorage.getItem('offlineMode');
      const isOffline = offlineMode === 'true';
      setIsOfflineMode(isOffline);

      let budgetsData;
      if (isOffline) {
        const storedBudgets = await AsyncStorage.getItem('offlineBudgets');
        budgetsData = storedBudgets ? JSON.parse(storedBudgets) : [];
      } else {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const userBudgetsRef = doc(db, 'userBudgets', userId);
          const docSnap = await getDoc(userBudgetsRef);
          if (docSnap.exists()) {
            budgetsData = docSnap.data().budgets || [];
          }
        }
      }

      const activeBudgets = budgetsData.filter(budget => budget.amountSpent < budget.goal);
      const completedBudgets = budgetsData.filter(budget => budget.amountSpent >= budget.goal);
      setBudgetsState({ active: activeBudgets, completed: completedBudgets });
      dispatch(setBudgets(budgetsData));
    } catch (error) {
      console.error('Error fetching budgets: ', error);
      Alert.alert('Error', 'Failed to fetch budgets. Please try again.');
    }
  };

  const handleEditBudget = (budget) => {
    navigation.navigate('EditBudget', { budget, isOfflineMode });
  };

  const handleDeleteBudget = async (budget) => {
    Alert.alert(
      "Delete Budget",
      "Are you sure you want to delete this budget?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const updatedBudgets = [...budgets.active, ...budgets.completed].filter(b => b.id !== budget.id);

              if (isOfflineMode) {
                await AsyncStorage.setItem('offlineBudgets', JSON.stringify(updatedBudgets));
              } else {
                const userId = auth.currentUser.uid;
                const userBudgetsRef = doc(db, 'userBudgets', userId);
                await updateDoc(userBudgetsRef, { budgets: updatedBudgets });
              }

              fetchBudgets();
              Alert.alert('Success', 'Budget deleted successfully');
            } catch (error) {
              console.error('Error deleting budget: ', error);
              Alert.alert('Error', 'Failed to delete budget. Please try again.');
            }
          }
        }
      ]
    );
  };

  const clearBudgets = async (type) => {
    Alert.alert(
      `Clear ${type} Budgets`,
      `Are you sure you want to clear all ${type.toLowerCase()} budgets?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          onPress: async () => {
            try {
              let updatedBudgets;
              if (type === 'Active') {
                updatedBudgets = budgets.completed;
              } else if (type === 'Completed') {
                updatedBudgets = budgets.active;
              }

              if (isOfflineMode) {
                await AsyncStorage.setItem('offlineBudgets', JSON.stringify(updatedBudgets));
              } else {
                const userId = auth.currentUser.uid;
                const userBudgetsRef = doc(db, 'userBudgets', userId);
                await updateDoc(userBudgetsRef, { budgets: updatedBudgets });
              }

              fetchBudgets();
              Alert.alert('Success', `All ${type.toLowerCase()} budgets have been cleared.`);
            } catch (error) {
              console.error(`Error clearing ${type.toLowerCase()} budgets:`, error);
              Alert.alert('Error', `Failed to clear ${type.toLowerCase()} budgets. Please try again.`);
            }
          }
        }
      ]
    );
  };

  const renderBudgetItem = ({ item }) => (
    <BudgetItem
      name={item.name}
      amountSpent={item.amountSpent || 0}
      amountTotal={item.goal || 0}
      icon={item.icon}
      onPress={() => navigation.navigate('BudgetDetail', { budget: item, isOfflineMode })}
      onEdit={() => handleEditBudget(item)}
      onDelete={() => handleDeleteBudget(item)}
    />
  );

  const getCategories = () => {
    const allBudgets = [...budgets.active, ...budgets.completed];
    const categorySet = new Set(allBudgets.map(budget => budget.category?.name || 'Uncategorized'));
    return ['All', ...Array.from(categorySet)];
  };

  const filterBudgets = (budgetList) => {
    return selectedCategory === 'All'
      ? budgetList
      : budgetList.filter(budget => budget.category?.name === selectedCategory);
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <CustomText style={styles.sectionHeaderText}>{title}</CustomText>
      <CustomButton
        title={`Clear ${title.split(' ')[0]}`}
        onPress={() => clearBudgets(title.split(' ')[0])}
        buttonStyle={styles.clearButton}
        textStyle={styles.clearButtonText}
      />
    </View>
  );

  const sections = [
    { title: 'Active Budgets', data: filterBudgets(budgets.active) },
    { title: 'Completed Budgets', data: filterBudgets(budgets.completed) },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.sortContainer}>
        <CustomText style={styles.sortLabel}>Sort by Category:</CustomText>
        <Picker
          selectedValue={selectedCategory}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        >
          {getCategories().map((category) => (
            <Picker.Item key={category} label={category} value={category} />
          ))}
        </Picker>
      </View>
      <SectionList
        sections={sections}
        renderItem={renderBudgetItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<CustomText style={styles.emptyText}>No budgets found. Create a new budget to get started!</CustomText>}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('CreateBudget', { isOfflineMode })}
      >
        <MaterialIcons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF0F1',
    padding: 20,
  },
  sortContainer: {
    marginBottom: 20,
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#7F8C8D',
  },
  addButton: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    backgroundColor: '#3498DB',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  sectionHeader: {
    backgroundColor: '#34495E',
    padding: 10,
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#E74C3C',
    padding: 5,
    borderRadius: 5,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});

export default BudgetScreen;
