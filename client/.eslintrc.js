module.exports = {
    extends: [
      'react-app',
      'react-app/jest'
    ],
    rules: {
      'react-hooks/exhaustive-deps': 'warn', // Change to warning instead of error
      'jsx-a11y/anchor-is-valid': 'warn', // Change to warning
      'no-unused-vars': 'warn' // Change to warning for unused variables
    }
  };