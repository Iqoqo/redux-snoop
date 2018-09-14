module.exports = {
verbose: true,
  rootDir: ".",
  globals: {
    "ts-jest": {
      tsConfigFile: "tsconfig.jest.json"
    }
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testRegex: "(/__tests__/.*|(\\.|/)(spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverage: true,
  coveragePathIgnorePatterns: ["/node_modules/", "/test/", "/dist/"],
  testEnvironment: "node",
  setupFiles: ["./register.js"]
};
