module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": ["eslint:recommended", "google"],
    "parserOptions": {
        "ecmaVersion": 2018
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
        "quotes": ["error", "double"],
        "arrow-parens": ["error", "as-needed"],
        "prefer-arrow-callback": "error",
        "arrow-body-style": "error",
        "indent": [
            "error", 2, {
                "FunctionDeclaration": {
                    "body": 1,
                    "parameters": 2,
                },
                "FunctionExpression": {
                    "body": 1,
                    "parameters": 2,
                },
            }
        ]
    }
};
