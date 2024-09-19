# Budget App

A React Native application for managing personal budgets with Firebase integration.

## Project Structure

- `src/`: Source code directory
  - `components/`: React components
  - `config/`: Configuration files
  - `utils/`: Utility functions
- `App.js`: Main application component
- `index.js`: Entry point of the application

## Key Components

- `BudgetItem.js`: Component for displaying individual budget items
- `CustomButton.js`: Reusable custom button component
- `CustomText.js`: Reusable custom text component
- `DrawerNavigator.js`: Navigation component for the app

## Configuration

- `firebaseConfig.js`: Firebase configuration settings
- `chartThemes.js`: Themes for charts used in the app

## Utilities

- `notificationHelper.js`: Helper functions for managing notifications
- `syncQueue.js`: Utility for managing synchronization queues

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install` or `yarn install`
3. Set up Firebase configuration in `src/config/firebaseConfig.js`
4. Run the app: `npm start` or `yarn start`
