/* eslint-disable */
module.exports = {
  displayName: 'statgpt-admin-frontend',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transformIgnorePatterns: [
    '/node_modules/(?!(next-auth|@auth|jose|oauth4webapi|preact|preact-render-to-string|@panva)/)',
  ],
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/src/test-utils/svgMock.tsx',
  },
  coverageDirectory: '../../coverage/apps/statgpt-admin-frontend',
};
