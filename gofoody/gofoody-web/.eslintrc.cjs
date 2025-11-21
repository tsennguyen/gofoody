module.exports = {
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['react', '@typescript-eslint', 'react-hooks', 'prettier'],
  settings: { react: { version: 'detect' } },
  rules: {
    'prettier/prettier': 'warn',
    'react/react-in-jsx-scope': 'off',
  },
};
