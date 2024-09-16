import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { MaterialIcons } from '@expo/vector-icons';
import { db, auth } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TransactionsScreen = ({ route }) => {
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const isOfflineMode = route.params?.offlineMode || false;

  const fetchTransactions = useCallback(async () => {
    try {
      const storedTransactions = await AsyncStorage.getItem('transactions');
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }

      if (!isOfflineMode) {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const transactionsRef = doc(db, 'transactions', userId);
          const docSnap = await getDoc(transactionsRef);
          if (docSnap.exists()) {
            const transactionsData = docSnap.data().transactions || [];
            setTransactions(transactionsData.sort((a, b) => b.date.toDate() - a.date.toDate()));
            await AsyncStorage.setItem('transactions', JSON.stringify(transactionsData));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      Alert.alert('Error', 'Failed to fetch transactions. Please try again.');
    }
  }, [isOfflineMode]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  }, [fetchTransactions]);

  const deleteTransaction = useCallback(async (transactionId) => {
    try {
      const storedTransactions = await AsyncStorage.getItem('transactions');
      if (storedTransactions) {
        const parsedTransactions = JSON.parse(storedTransactions);
        const updatedTransactions = parsedTransactions.filter(t => t.id !== transactionId);
        await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));

        if (!isOfflineMode) {
          const userId = auth.currentUser.uid;
          const transactionsRef = doc(db, 'transactions', userId);
          await updateDoc(transactionsRef, { transactions: updatedTransactions });
        }

        setTransactions(updatedTransactions);
        Alert.alert('Success', 'Transaction deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      Alert.alert('Error', 'Failed to delete transaction');
    }
  }, [isOfflineMode]);

  const deleteAllTransactions = useCallback(async () => {
    try {
      await AsyncStorage.setItem('transactions', JSON.stringify([]));
      setTransactions([]);

      if (!isOfflineMode && auth.currentUser) {
        const userId = auth.currentUser.uid;
        const transactionsRef = doc(db, 'transactions', userId);
        await updateDoc(transactionsRef, { transactions: [] });
      }

      Alert.alert('Success', 'All transactions deleted successfully');
    } catch (error) {
      console.error('Error deleting all transactions:', error);
      Alert.alert('Error', 'Failed to delete all transactions');
    }
  }, [isOfflineMode]);

  const confirmDelete = useCallback((transactionId) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => deleteTransaction(transactionId) }
      ]
    );
  }, [deleteTransaction]);

  const confirmDeleteAll = useCallback(() => {
    Alert.alert(
      'Delete All Transactions',
      'Are you sure you want to delete all transactions? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete All', onPress: deleteAllTransactions }
      ]
    );
  }, [deleteAllTransactions]);

  const formatDate = (date) => {
    if (date instanceof Date) {
      return date.toLocaleString();
    } else if (date && typeof date.toDate === 'function') {
      return date.toDate().toLocaleString();
    } else if (typeof date === 'string') {
      return new Date(date).toLocaleString();
    }
    return 'Invalid Date';
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionContent}>
        <CustomText style={styles.transactionBudget}>{item.budgetName}</CustomText>
        <CustomText style={styles.transactionAmount}>${item.amount.toFixed(2)}</CustomText>
        <CustomText style={styles.transactionDate}>
          {formatDate(item.date)}
        </CustomText>
      </View>
      <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteButton}>
        <MaterialIcons name="delete" size={24} color="#E74C3C" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#2C3E50', '#3498DB']} style={styles.header}>
        <CustomText style={styles.headerText}>Transactions</CustomText>
      </LinearGradient>
      {transactions.length > 0 && (
        <CustomButton
          title="Delete All Transactions"
          onPress={confirmDeleteAll}
          buttonStyle={styles.deleteAllButton}
          textStyle={styles.deleteAllButtonText}
        />
      )}
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="account-balance-wallet" size={64} color="#BDC3C7" />
            <CustomText style={styles.emptyText}>No transactions</CustomText>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF0F1',
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ECF0F1',
  },
  listContent: {
    padding: 15,
  },
  transactionItem: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  transactionContent: {
    flex: 1,
  },
  transactionBudget: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  transactionAmount: {
    fontSize: 18,
    color: '#2ECC71',
    marginTop: 5,
  },
  transactionDate: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 5,
  },
  deleteButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#7F8C8D',
  },
  deleteAllButton: {
    backgroundColor: '#E74C3C',
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 5,
    borderRadius: 8,
  },
  deleteAllButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TransactionsScreen;
