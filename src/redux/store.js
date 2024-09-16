import { configureStore } from '@reduxjs/toolkit';
import budgetReducer from './budgetSlice';
import transactionReducer from './transactionSlice';
import userReducer from './userSlice';

export const store = configureStore({
    reducer: {
        budgets: budgetReducer,
        transactions: transactionReducer,
        user: userReducer,
    },
});