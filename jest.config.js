module.exports = {
  testEnvironment: "node",
  testTimeout: 15000,
  verbose: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  testMatch: ["**/test/**/*.test.js"],
};
