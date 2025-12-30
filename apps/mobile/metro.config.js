const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Transform import.meta.env to process.env for web compatibility
config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs"];

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("./metro-transform.js"),
};

module.exports = withNativeWind(config, { input: "./global.css" });
