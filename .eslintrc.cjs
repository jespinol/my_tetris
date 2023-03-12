module.exports = {
    extends: 'airbnb',
    env: {'browser': true},
    parserOptions: {ecmaVersion: 2022,},
    rules: {
        'import/extensions': 'off',
        'no-plusplus': ['error', {'allowForLoopAfterthoughts': true}]
    }
}