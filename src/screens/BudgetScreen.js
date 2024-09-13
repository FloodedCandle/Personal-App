import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import CustomText from '../components/CustomText';
import { MaterialIcons } from '@expo/vector-icons';
import { db, auth } from '../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import BudgetItem from '../components/BudgetItem';
import { useNavigation } from '@react-navigation/native';

const BudgetScreen = () => {
  const [budgets, setBudgets] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBudgets();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchBudgets = async () => {
    try {
      const userId = auth.currentUser.uid;
      const userBudgetsRef = doc(db, 'userBudgets', userId);
      const docSnap = await getDoc(userBudgetsRef);

      if (docSnap.exists()) {
        const userBudgets = docSnap.data().budgets || [];
        setBudgets(userBudgets);
      } else {
        setBudgets([]);
      }
    } catch (error) {
      console.error('Error fetching budgets: ', error);
      Alert.alert('Error', 'Failed to fetch budgets. Please try again.');
    }
  };

  const renderBudgetItem = ({ item }) => (
    <BudgetItem
      name={item.name}
      amountSpent={item.amountSpent || 0}
      amountTotal={item.goal}
      icon={item.icon}
      onPress={() => navigation.navigate('BudgetDetail', { budget: item })}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={budgets}
        renderItem={renderBudgetItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<CustomText style={styles.emptyText}>No budgets found. Create a new budget to get started!</CustomText>}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('CreateBudget')}
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
});

export default BudgetScreen;
