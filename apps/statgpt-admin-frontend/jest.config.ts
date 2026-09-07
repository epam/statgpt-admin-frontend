/* eslint-disable */
module.exports = {
  displayName: 'statgpt-admin-frontend',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/src/test-utils/svgMock.tsx',
  },
  coverageDirectory: '../../coverage/apps/statgpt-admin-frontend',
};
