const upstreamTransformer = require("@expo/metro-config/babel-transformer");

module.exports.transform = async ({ src, filename, options }) => {
  // Only transform for web platform
  if (options.platform === "web") {
    // Replace import.meta.env with process.env
    src = src.replace(/import\.meta\.env/g, "process.env");
    // Replace import.meta.url with empty string (fallback)
    src = src.replace(/import\.meta\.url/g, '""');
  }

  return upstreamTransformer.transform({ src, filename, options });
};
