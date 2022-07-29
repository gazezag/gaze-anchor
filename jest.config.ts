import type { InitialOptionsTsJest } from 'ts-jest';
// import { pathsToModuleNameMapper } from 'ts-jest';
// import { compilerOptions } from './tsconfig.json';

const config: InitialOptionsTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^core/(.*)$': '<rootDir>/packages/core/$1',
    '^api/(.*)$': '<rootDir>/packages/api/$1',
    '^plugins/(.*)$': '<rootDir>/packages/plugins/$1',
    '^utils/(.*)$': '<rootDir>/packages/utils/$1'
  }
  // moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
};

export default config;
