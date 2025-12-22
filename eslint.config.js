import eslintConfigAgent from 'eslint-config-agent';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts'],
  },
  ...eslintConfigAgent,
];
