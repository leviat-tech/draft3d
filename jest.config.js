module.exports = {
  // collectCoverage: true,
  moduleFileExtensions: ['js', 'json', 'vue'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    'three/examples/(.*)$': 'three/examples/$1.js'
  },
  // setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['jest-extended/all'],
  testEnvironment: 'jsdom',
  transform: {
    '.*\\.(vue)$': 'vue-jest',
    '.*\\.(m?js)$': 'babel-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!three/examples)'],
};
