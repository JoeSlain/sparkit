module.exports = {
  preset: 'jest-expo',
  transform: { '^.+\\.[cm]?[jt]sx?$': 'babel-jest' },
  testMatch: ['<rootDir>/__tests__/**/*.test.[jt]s?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!((?:.pnpm/[^/]+/node_modules/)?(?:@agency/|@lingui/|@messageformat/|@tamagui/|valibot|react-native|@react-native/|@react-native-community/|expo|expo-.*|@expo/|@unimodules/|react-native-.*|@react-navigation/)))',
  ],
};
