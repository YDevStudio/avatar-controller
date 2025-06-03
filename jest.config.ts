import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    transform: {
        '^.+\\.ts$': ['ts-jest', { useESM: true }],
    },
    globals: {
        'ts-jest': {
            useESM: true,
        },
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    moduleNameMapper: {
        '^three$': '<rootDir>/node_modules/three',
    },
    transformIgnorePatterns: [
        '/node_modules/(?!three|lit)',
    ],
};

export default config;