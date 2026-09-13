const { getDefaultConfig } = require('expo/metro-config');
// SDK 57 resolves pnpm workspaces and TypeScript source exports automatically.
// Tamagui uses its runtime; add compiler configuration only after measuring it.
module.exports = getDefaultConfig(__dirname);
