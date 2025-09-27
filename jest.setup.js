import '@testing-library/jest-dom'

// Add global type augmentation for Jest DOM matchers
global.expect.extend(require('@testing-library/jest-dom/matchers'))