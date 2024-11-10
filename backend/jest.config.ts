export {};

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node', // Use 'node' for backend tests
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
  },
  testTimeout: 20000, 
};