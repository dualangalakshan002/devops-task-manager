module.exports = {
    testEnvironment: 'node',
    collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/db.js'],
    coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
};