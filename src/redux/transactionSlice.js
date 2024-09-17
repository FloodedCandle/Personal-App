import { createSlice } from '@reduxjs/toolkit';

const transactionSlice = createSlice({
    name: 'transactions',
    initialState: [],
    reducers: {
        setTransactions: (state, action) => {
            return action.payload.map(transaction => ({
                ...transaction,
                date: transaction.date.toDate ? transaction.date.toDate().toISOString() : transaction.date
            }));
        },
        addTransaction: (state, action) => {
            state.push({
                ...action.payload,
                date: action.payload.date.toDate ? action.payload.date.toDate().toISOString() : action.payload.date
            });
        },
        updateTransaction: (state, action) => {
            const index = state.findIndex(transaction => transaction.id === action.payload.id);
            if (index !== -1) {
                state[index] = {
                    ...action.payload,
                    date: action.payload.date.toDate ? action.payload.date.toDate().toISOString() : action.payload.date
                };
            }
        },
        deleteTransaction: (state, action) => {
            return state.filter(transaction => transaction.id !== action.payload);
        },
    },
});

export const { setTransactions, addTransaction, updateTransaction, deleteTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;