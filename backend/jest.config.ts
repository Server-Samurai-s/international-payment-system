export {};

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
      '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
      '\\.(css|less)$': 'identity-obj-proxy',
  },
  testTimeout: 20000, 
};
