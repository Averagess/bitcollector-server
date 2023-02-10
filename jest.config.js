module.exports = {
  verbose: true,
  testEnvironment: "node",
  testEnvironmentOptions: {
    url: "http://localhost",
  },
  roots: [
    "<rootDir>",
  ],
  transform: {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  testRegex: "(src|build)(/__tests__/.*|(\\.|/)(test|spec))\\.(js?|ts?)$",
  moduleFileExtensions: [
    "js",
    "json",
    "node",
    "ts",
  ],
  preset: "ts-jest",
};