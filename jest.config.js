module.exports = {
  // collectCoverage: true,
  moduleFileExtensions: ['js', 'json', 'vue'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // setupFiles: ['dotenv/config'],
  // setupFilesAfterEnv: ['jest-extended/all', '<rootDir>/test/utils/jest-setup'],
  testEnvironment: 'jsdom',
  transform: {
    '.*\\.(vue)$': 'vue-jest',
    '.*\\.(m?js)$': 'babel-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
};
