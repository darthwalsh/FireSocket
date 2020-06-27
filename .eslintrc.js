module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
  },
  "extends": ["eslint:recommended", "google", "prettier"],
  "parserOptions": {
    "ecmaVersion": 2018,
  },
  "rules": {
    "linebreak-style": "off",
    "require-jsdoc": "off",
    "max-len": "off",
    "one-var": "off",
    "guard-for-in": "off",
    "no-case-declarations": "off",
    "valid-jsdoc": "off",

    // Too aggressive because of https://github.com/eslint/eslint/issues/11911
    "require-atomic-updates": "off",

    "eqeqeq": "error",
    "operator-assignment": "error",
    "object-shorthand": "error",
    "prefer-arrow-callback": "error",
    "arrow-body-style": "error",
  },
};
