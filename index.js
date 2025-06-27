export default {
  recommended: {
    name: 'destructure-bracket-spacing/recommended',
    plugins: {
      '@pndewit': {
        rules: {
          'destructure-bracket-spacing': {
            meta: {
              type: 'layout',
              docs: {description: 'Enforce consistent spacing for destructuring and constructing array and object brackets'},
              fixable: 'whitespace',
              // schema: [],
            },
            create(context) {
              const { sourceCode } = context;

              /**
               * Reports that there shouldn't be a space after the first token
               * @param node The node to report in the event of an error.
               * @param token The token to use for the report.
               */
              function reportNoBeginningSpace(node, token) {
                const nextToken = sourceCode.getTokenAfter(token);

                context.report({
                  node,
                  loc: {start: token.loc.end, end: nextToken.loc.start},
                  message: 'There should be no space after \'{{tokenValue}}\'.',
                  data: {tokenValue: token.value},
                  fix: fixer => fixer.removeRange([token.range[1], nextToken.range[0]]),
                });
              }

              /**
               * Reports that there shouldn't be a space before the last token
               * @param node The node to report in the event of an error.
               * @param token The token to use for the report.
               */
              function reportNoEndingSpace(node, token) {
                const previousToken = sourceCode.getTokenBefore(token);

                context.report({
                  node,
                  loc: {start: previousToken.loc.end, end: token.loc.start},
                  message: 'There should be no space before \'{{tokenValue}}\'.',
                  data: {tokenValue: token.value},
                  fix: fixer => fixer.removeRange([previousToken.range[1], token.range[0]]),
                });
              }

              /**
               * Reports that there should be a space after the first token
               * @param node The node to report in the event of an error.
               * @param token The token to use for the report.
               */
              function reportRequiredBeginningSpace(node, token) {
                context.report({
                  node,
                  loc: token.loc,
                  message: 'A space is required after \'{{tokenValue}}\'.',
                  data: {tokenValue: token.value},
                  fix: fixer => fixer.insertTextAfter(token, ' '),
                });
              }

              /**
               * Reports that there should be a space before the last token
               * @param node The node to report in the event of an error.
               * @param token The token to use for the report.
               */
              function reportRequiredEndingSpace(node, token) {
                context.report({
                  node,
                  loc: token.loc,
                  message: 'A space is required before \'{{tokenValue}}\'.',
                  data: {tokenValue: token.value},
                  fix: fixer => fixer.insertTextBefore(token, ' '),
                });
              }

              /**
               * Validates the spacing around array brackets
               * @param beforeToken The token to check before the whitespace
               * @param afterToken The token to check after the whitespace
               * @param requiresSpace Boolean indicating whether a space is required
               * @param reportFn Callback function reporting findings
               */
              function validateSpace(beforeToken, afterToken, requiresSpace, reportFn) {
                const onSameLine = beforeToken.loc.end.line === afterToken.loc.start.line;
                if (onSameLine && requiresSpace !== sourceCode.isSpaceBetween(beforeToken, afterToken)) reportFn();
              }

              /**
               * Validates the spacing around array brackets
               * @param node The node we're checking for spacing
               */
              function validateArraySpacing(node) {
                if (!node.elements.length) return;

                const first = sourceCode.getFirstToken(node);
                const second = sourceCode.getFirstToken(node, 1);
                const last = sourceCode.getLastToken(node);
                const penultimate = sourceCode.getTokenBefore(last);

                const isDestructure = node.type === 'ArrayPattern';
                const isDefinition = node.type === 'ArrayExpression';

                if (isDestructure) {
                  validateSpace(first, second, true, reportRequiredBeginningSpace.bind(this, node, first));
                  validateSpace(penultimate, last, true, reportRequiredEndingSpace.bind(this, node, last));
                } else if (isDefinition && first !== penultimate) {
                  validateSpace(first, second, false, reportNoBeginningSpace.bind(this, node, first));
                  validateSpace(penultimate, last, false, reportNoEndingSpace.bind(this, node, last));
                }
              }

              /**
               * Validates the spacing around object brackets
               * @param node The node we're checking for spacing
               */
              function validateObjectSpacing(node) {
                if (!node.properties.length) return;

                const first = sourceCode.getFirstToken(node);
                const second = sourceCode.getFirstToken(node, 1);
                const last = sourceCode.getLastToken(node);
                const penultimate = sourceCode.getTokenBefore(last);

                const isDestructure = node.type === 'ObjectPattern';
                const isDefinition = node.type === 'ObjectExpression';

                if (isDestructure) {
                  validateSpace(first, second, true, reportRequiredBeginningSpace.bind(this, node, first));
                  validateSpace(penultimate, last, true, reportRequiredEndingSpace.bind(this, node, last));
                } else if (isDefinition && first !== penultimate) {
                  validateSpace(first, second, false, reportNoBeginningSpace.bind(this, node, first));
                  validateSpace(penultimate, last, false, reportNoEndingSpace.bind(this, node, last));
                }
              }

              /**
               * Reports a given import node if spacing in curly braces is invalid.
               * @param node An ImportDeclaration node to check.
               */
              function checkForImport(node) {
                if (!node.specifiers.length) return;

                let firstSpecifier = node.specifiers[0];
                const [ lastSpecifier ] = node.specifiers.slice(-1);

                if (lastSpecifier.type !== 'ImportSpecifier') return;
                if (firstSpecifier.type !== 'ImportSpecifier') [ , firstSpecifier ] = node.specifiers;

                const first = sourceCode.getTokenBefore(firstSpecifier);
                const last = sourceCode.getTokenAfter(lastSpecifier, {filter: token => token.type === 'Punctuator' && token.value !== ','});
                const second = sourceCode.getTokenAfter(first);
                const penultimate = sourceCode.getTokenBefore(last);

                validateSpace(first, second, true, reportRequiredBeginningSpace.bind(this, node, first));
                validateSpace(penultimate, last, true, reportRequiredEndingSpace.bind(this, node, last));
              }

              /**
               * Reports a given export node if spacing in curly braces is invalid.
               * @param node An ExportNamedDeclaration node to check.
               */
              function checkForExport(node) {
                if (!node.specifiers.length) return;

                const firstSpecifier = node.specifiers[0];
                const [ lastSpecifier ] = node.specifiers.slice(-1);
                const first = sourceCode.getTokenBefore(firstSpecifier);
                const last = sourceCode.getTokenAfter(lastSpecifier, {filter: token => token.type === 'Punctuator' && token.value !== ','});
                const second = sourceCode.getTokenAfter(first);
                const penultimate = sourceCode.getTokenBefore(last);

                validateSpace(first, second, false, reportNoBeginningSpace.bind(this, node, first));
                validateSpace(penultimate, last, false, reportNoEndingSpace.bind(this, node, last));
              }

              return {
                ArrayPattern: validateArraySpacing,
                ArrayExpression: validateArraySpacing,
                ObjectPattern: validateObjectSpacing,
                ObjectExpression: validateObjectSpacing,
                ImportDeclaration: checkForImport,
                ExportNamedDeclaration: checkForExport,
              };
            },
          },
        },
      },
    },
    rules: {
      '@pndewit/destructure-bracket-spacing': 'error',
    },
  },
};
