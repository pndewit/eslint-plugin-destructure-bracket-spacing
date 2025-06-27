# @pndewit/eslint-plugin-destructure-bracket-spacing
ESLint plugin to enforce consistent spacing for destructuring and constructing array and object brackets.

## Installation

```bash
npm install --save @pndewit/eslint-plugin-destructure-bracket-spacing
```

## Usage
```javascript
import destructureBracketSpacing from '@pndewit/eslint-plugin-destructure-bracket-spacing';

export default [
  destructureBracketSpacing.recommended,
  {
    rules: {
      '@pndewit/destructure-bracket-spacing': 'error',
    },
  },
];
```
