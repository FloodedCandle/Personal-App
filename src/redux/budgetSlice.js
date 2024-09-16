import { createSlice } from '@reduxjs/toolkit';

const budgetSlice = createSlice({
    name: 'budgets',
    initialState: [],
    reducers: {
        setBudgets: (state, action) => {
            return action.payload;
        },
        addBudget: (state, action) => {
            state.push(action.payload);
        },
        updateBudget: (state, action) => {
            const index = state.findIndex(budget => budget.id === action.payload.id);
            if (index !== -1) {
                state[index] = action.payload;
            }
        },
        deleteBudget: (state, action) => {
            return state.filter(budget => budget.id !== action.payload);
        },
    },
});

export const { setBudgets, addBudget, updateBudget, deleteBudget } = budgetSlice.actions;
export default budgetSlice.reducer;