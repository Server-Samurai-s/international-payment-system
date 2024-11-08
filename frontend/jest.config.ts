import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // Use 'jsdom' for frontend tests
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
    '^@react-three/fiber$': '<rootDir>/src/__mocks__/@react-three/fiber.ts', // Add this line
    '^@react-three/drei$': '<rootDir>/src/__mocks__/@react-three/drei.ts', // Add this line
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'], // Optional: if you have a setup file
};

export default config;