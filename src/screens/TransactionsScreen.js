import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useSelector, useDispatch } from 'react-redux';
import { setTransactions } from '../redux/transactionSlice';

const TransactionsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const transactions = useSelector(state => state.transactions);
  const [refreshing, setRefreshing] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useFocusEffect(
    useCallback(() => {
      checkOfflineMode();
    }, [])
  );

  const checkOfflineMode = async () => {
    const offlineMode = await AsyncStorage.getItem('offlineMode');
    setIsOfflineMode(offlineMode === 'true');
    if (offlineMode !== 'true') {
      fetchTransactions();
    }
  };

  const fetchTransactions = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const transactionsRef = doc(db, 'transactions', userId);
        const docSnap = await getDoc(transactionsRef);
        if (docSnap.exists()) {
          const transactionsData = docSnap.data().transactions || [];
          const serializedTransactions = transactionsData.map(transaction => ({
            ...transaction,
            date: transaction.date.toDate().toISOString()
          }));
          dispatch(setTransactions(serializedTransactions));
          await AsyncStorage.setItem('transactions', JSON.stringify(serializedTransactions));
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      Alert.alert('Error', 'Failed to fetch transactions. Please try again.');
    }
  };

  const onRefresh = useCallback(async () => {
    if (!isOfflineMode) {
      setRefreshing(true);
      await fetchTransactions();
      setRefreshing(false);
    }
  }, [fetchTransactions, isOfflineMode]);

  const deleteTransaction = useCallback(async (transactionId) => {
    try {
      const updatedTransactions = transactions.filter(t => t.id !== transactionId);

      if (!isOfflineMode) {
        const userId = auth.currentUser.uid;
        const transactionsRef = doc(db, 'transactions', userId);
        await updateDoc(transactionsRef, { transactions: updatedTransactions });
      }

      const storageKey = isOfflineMode ? 'offlineTransactions' : 'transactions';
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedTransactions));

      dispatch(setTransactions(updatedTransactions));
      Alert.alert('Success', 'Transaction deleted successfully');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      Alert.alert('Error', 'Failed to delete transaction');
    }
  }, [isOfflineMode, transactions, dispatch]);

  const deleteAllTransactions = useCallback(async () => {
    try {
      if (!isOfflineMode) {
        const userId = auth.currentUser.uid;
        const transactionsRef = doc(db, 'transactions', userId);
        await updateDoc(transactionsRef, { transactions: [] });
      }

      const storageKey = isOfflineMode ? 'offlineTransactions' : 'transactions';
      await AsyncStorage.setItem(storageKey, JSON.stringify([]));

      dispatch(setTransactions([]));
      Alert.alert('Success', 'All transactions deleted successfully');
    } catch (error) {
      console.error('Error deleting all transactions:', error);
      Alert.alert('Error', 'Failed to delete all transactions');
    }
  }, [isOfflineMode, dispatch]);

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionContent}>
        <CustomText style={styles.transactionBudget}>{item.budgetName}</CustomText>
        <CustomText style={styles.transactionAmount}>${item.amount.toFixed(2)}</CustomText>
        <CustomText style={styles.transactionDate}>
          {new Date(item.date).toLocaleString()}
        </CustomText>
      </View>
      <TouchableOpacity onPress={() => deleteTransaction(item.id)} style={styles.deleteButton}>
        <MaterialIcons name="delete" size={24} color="#E74C3C" />
      </TouchableOpacity>
    </View>
  );

  if (isOfflineMode) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#2C3E50', '#3498DB']} style={styles.header}>
          <CustomText style={styles.headerText}>Transactions</CustomText>
        </LinearGradient>
        <View style={styles.offlineContainer}>
          <MaterialIcons name="wifi-off" size={64} color="#BDC3C7" />
          <CustomText style={styles.offlineText}>Transactions are not available in offline mode</CustomText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#2C3E50', '#3498DB']} style={styles.header}>
        <CustomText style={styles.headerText}>Transactions</CustomText>
      </LinearGradient>
      {transactions.length > 0 && (
        <CustomButton
          title="Delete All Transactions"
          onPress={() => {
            Alert.alert(
              'Delete All Transactions',
              'Are you sure you want to delete all transactions?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete All', onPress: deleteAllTransactions }
              ]
            );
          }}
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
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  offlineText: {
    fontSize: 18,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default TransactionsScreen;
