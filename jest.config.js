module.exports = {
  verbose: true,
  testEnvironment: "node",
  testEnvironmentOptions: {
    "url" : 'http://localhost'
  },
  roots: [
    "<rootDir>"
  ],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testRegex: "src(/__tests__/.*|(\\.|/)(test|spec))\\.(js?|ts?)$",
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