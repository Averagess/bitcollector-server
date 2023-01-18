module.exports = {
  verbose: true,
  testURL: 'http://localhost',
  testEnvironment: "node",
  roots: [
    "<rootDir>"
  ],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testRegex: "src(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  globals: {
    "ts-jest": {
      "tsConfigFile": "tsconfig.json"
    }
  },
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],

}