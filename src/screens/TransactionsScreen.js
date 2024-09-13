import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import CustomText from '../components/CustomText';
import { db, auth } from '../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    try {
      const userId = auth.currentUser.uid;
      const transactionsRef = doc(db, 'transactions', userId);
      const docSnap = await getDoc(transactionsRef);
      if (docSnap.exists()) {
        const transactionData = docSnap.data().transactions || [];
        setTransactions(transactionData.sort((a, b) => b.date.seconds - a.date.seconds));
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <CustomText style={styles.transactionBudget}>{item.budgetName}</CustomText>
      <CustomText style={styles.transactionAmount}>${item.amount}</CustomText>
      <CustomText style={styles.transactionDate}>
        {new Date(item.date.seconds * 1000).toLocaleString()}
      </CustomText>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={<CustomText style={styles.emptyText}>No transactions</CustomText>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF0F1',
    padding: 20,
  },
  transactionItem: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
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
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#7F8C8D',
  },
});

export default TransactionsScreen;
