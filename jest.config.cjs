/** @type {import('jest').Config} */
const config = {
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 90,
      statements: 90,
    },
  },
};

module.exports = config;
