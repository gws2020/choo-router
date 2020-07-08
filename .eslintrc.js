module.exports = {
    'env': {
        'browser': true,
        'es6': true,
        'node': true
    },
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly'
    },
    'parser':'vue-eslint-parser',
    'parserOptions': {
        'parser': '@typescript-eslint/parser',
        'ecmaVersion': 2018,
        'sourceType': 'module',
        'ecmaFeatures': {
            'legacyDecorators': true
        }
    },
    'plugins': [
        '@typescript-eslint',
        'vue'
    ],
    'rules': {
        'no-new': 0,
        'no-unused-vars': 0,
        'comma-dangle': [0, 0],
        'semi': 0,
        'quotes': [0, 'single'],
        'no-eval': 1,
        'no-implied-eval': 1
    }
};
