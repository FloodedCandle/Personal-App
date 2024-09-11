import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { db, auth } from '../config/firebaseConfig';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';

const BudgetScreen = ({ navigation }) => {
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const userId = auth.currentUser.uid;
      const q = query(collection(db, 'budgets'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const budgetList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBudgets(budgetList);
    } catch (error) {
      console.error('Error fetching budgets: ', error);
      Alert.alert('Error', 'Failed to fetch budgets. Please try again.');
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      await deleteDoc(doc(db, 'budgets', id));
      fetchBudgets(); // Refresh the list
      Alert.alert('Success', 'Budget deleted successfully');
    } catch (error) {
      console.error('Error deleting budget: ', error);
      Alert.alert('Error', 'Failed to delete budget. Please try again.');
    }
  };

  const renderBudgetItem = ({ item }) => (
    <View style={styles.budgetItem}>
      <CustomText style={styles.budgetName}>{item.name}</CustomText>
      <CustomText>Goal: ${item.goal}</CustomText>
      <CustomText>Amount Spent: ${item.amountSpent || 0}</CustomText>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${((item.amountSpent || 0) / item.goal) * 100}%` },
          ]}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('EditBudget', { budget: item })}>
          <MaterialIcons name="edit" size={24} color="#3498DB" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteBudget(item.id)}>
          <MaterialIcons name="delete" size={24} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>Your Budgets</CustomText>
      <CustomButton
        title="Create New Budget"
        onPress={() => navigation.navigate('CreateBudget')}
        buttonStyle={styles.createButton}
      />
      <FlatList
        data={budgets}
        renderItem={renderBudgetItem}
        keyExtractor={(item) => item.id}
      />
    </View>
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
  createButton: {
    backgroundColor: '#2ECC71',
    marginBottom: 20,
  },
  budgetItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
  },
  budgetName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#BDC3C7',
    borderRadius: 5,
    marginVertical: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#3498DB',
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
});

export default BudgetScreen;
