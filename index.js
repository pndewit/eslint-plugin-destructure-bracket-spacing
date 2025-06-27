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
                  data: {
                    tokenValue: token.value,
                  },
                  fix(fixer) {
                    return fixer.removeRange([token.range[1], nextToken.range[0]])
                  },
                })
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
                  data: {
                    tokenValue: token.value,
                  },
                  fix(fixer) {
                    return fixer.removeRange([previousToken.range[1], token.range[0]])
                  },
                })
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
                  data: {
                    tokenValue: token.value,
                  },
                  fix(fixer) {
                    return fixer.insertTextAfter(token, ' ')
                  },
                })
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
                  data: {
                    tokenValue: token.value,
                  },
                  fix(fixer) {
                    return fixer.insertTextBefore(token, ' ')
                  },
                })
              }

              /**
               * Determines whether two tokens are on the same line
               */
              function onSameLine(left, right) {
                return left.loc.end.line === right.loc.start.line;
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

                if (isDestructure && onSameLine(first, second)) {
                  if (!sourceCode.isSpaceBetween(first, second))
                    reportRequiredBeginningSpace(node, first);

                  if (!sourceCode.isSpaceBetween(penultimate, last))
                    reportRequiredEndingSpace(node, last);
                }

                if (isDefinition && first !== penultimate && onSameLine(penultimate, last)) {
                  if (sourceCode.isSpaceBetween(penultimate, last))
                    reportNoEndingSpace(node, last);

                  if (sourceCode.isSpaceBetween(first, second))
                    reportNoBeginningSpace(node, first);
                }
              }

              /**
               * Validates the spacing around array brackets
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

                if (isDestructure && onSameLine(first, second)) {
                  if (!sourceCode.isSpaceBetween(first, second))
                    reportRequiredBeginningSpace(node, first);

                  if (!sourceCode.isSpaceBetween(penultimate, last))
                    reportRequiredEndingSpace(node, last);
                }

                if (isDefinition && first !== penultimate && onSameLine(penultimate, last)) {
                  if (sourceCode.isSpaceBetween(penultimate, last))
                    reportNoEndingSpace(node, last);

                  if (sourceCode.isSpaceBetween(first, second))
                    reportNoBeginningSpace(node, first);
                }
              }

              /**
               * Determines if spacing in curly braces is valid.
               * @param node The AST node to check.
               * @param first The first token to check (should be the opening brace)
               * @param second The second token to check (should be first after the opening brace)
               * @param penultimate The penultimate token to check (should be last before closing brace)
               * @param last The last token to check (should be closing brace)
               */
              function validateBraceSpacing(node, first, second, penultimate, last) {
                if (onSameLine(first, second) && !sourceCode.isSpaceBetween(first, second)) {
                  reportRequiredBeginningSpace(node, first);
                }

                if (onSameLine(penultimate, last) && !sourceCode.isSpaceBetween(penultimate, last)) {
                  reportRequiredEndingSpace(node, last);
                }
              }

              /**
               * Reports a given import node if spacing in curly braces is invalid.
               * @param node An ImportDeclaration node to check.
               */
              function checkForImport(node) {
                if (!node.specifiers.length) return;

                let firstSpecifier = node.specifiers[0];
                const lastSpecifier = node.specifiers[node.specifiers.length - 1];

                if (lastSpecifier.type !== 'ImportSpecifier') return;
                if (firstSpecifier.type !== 'ImportSpecifier') [ , firstSpecifier ] = node.specifiers;

                const first = sourceCode.getFirstToken(firstSpecifier);
                const last = sourceCode.getLastToken(lastSpecifier);
                const second = sourceCode.getTokenAfter(first);
                const penultimate = sourceCode.getTokenBefore(last);

                validateBraceSpacing(node, first, second, penultimate, last)
              }

              /**
               * Reports a given export node if spacing in curly braces is invalid.
               * @param node An ExportNamedDeclaration node to check.
               */
              function checkForExport(node) {
                if (!node.specifiers.length) return

                const firstSpecifier = node.specifiers[0];
                const lastSpecifier = node.specifiers[node.specifiers.length - 1];
                const first = sourceCode.getFirstToken(firstSpecifier);
                const last = sourceCode.getLastToken(lastSpecifier);
                const second = sourceCode.getTokenAfter(first);
                const penultimate = sourceCode.getTokenBefore(last);

                validateBraceSpacing(node, first, second, penultimate, last)
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
