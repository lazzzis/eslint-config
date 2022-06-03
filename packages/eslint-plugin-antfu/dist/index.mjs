import { ESLintUtils } from '@typescript-eslint/utils';

const createEslintRule = ESLintUtils.RuleCreator((ruleName) => ruleName);

const RULE_NAME$2 = "if-newline";
const ifNewline = createEslintRule({
  name: RULE_NAME$2,
  meta: {
    type: "problem",
    docs: {
      description: "Newline after if",
      recommended: "error"
    },
    fixable: "code",
    schema: [],
    messages: {
      missingIfNewline: "Expect newline after if"
    }
  },
  defaultOptions: [],
  create: (context) => {
    return {
      IfStatement(node) {
        if (!node.consequent)
          return;
        if (node.consequent.type === "BlockStatement")
          return;
        if (node.test.loc.end.line === node.consequent.loc.start.line) {
          context.report({
            node,
            loc: {
              start: node.test.loc.end,
              end: node.consequent.loc.start
            },
            messageId: "missingIfNewline",
            fix(fixer) {
              return fixer.replaceTextRange([node.consequent.range[0], node.consequent.range[0]], "\n");
            }
          });
        }
      }
    };
  }
});

const RULE_NAME$1 = "import-dedupe";
const importDedupe = createEslintRule({
  name: RULE_NAME$1,
  meta: {
    type: "problem",
    docs: {
      description: "Fix duplication in imports",
      recommended: "error"
    },
    fixable: "code",
    schema: [],
    messages: {
      importDedupe: "Expect no duplication in imports"
    }
  },
  defaultOptions: [],
  create: (context) => {
    return {
      ImportDeclaration(node) {
        if (node.specifiers.length <= 1)
          return;
        const names = /* @__PURE__ */ new Set();
        node.specifiers.forEach((n) => {
          const id = n.local.name;
          if (names.has(id)) {
            context.report({
              node,
              loc: {
                start: n.loc.end,
                end: n.loc.start
              },
              messageId: "importDedupe",
              fix(fixer) {
                const s = n.range[0];
                let e = n.range[1];
                if (context.getSourceCode().text[e] === ",")
                  e += 1;
                return fixer.removeRange([s, e]);
              }
            });
          }
          names.add(id);
        });
      }
    };
  }
});

const RULE_NAME = "prefer-inline-type-import";
const preferInlineTypeImport = createEslintRule({
  name: RULE_NAME,
  meta: {
    type: "suggestion",
    docs: {
      description: "Newline after if",
      recommended: "error"
    },
    fixable: "code",
    schema: [],
    messages: {
      preferInlineTypeImport: "Prefer inline type import"
    }
  },
  defaultOptions: [],
  create: (context) => {
    const sourceCode = context.getSourceCode();
    return {
      ImportDeclaration: (node) => {
        if (node.specifiers.length === 1 && ["ImportNamespaceSpecifier", "ImportDefaultSpecifier"].includes(node.specifiers[0].type))
          return;
        if (node.importKind === "type") {
          context.report({
            *fix(fixer) {
              yield* removeTypeSpecifier(fixer, sourceCode, node);
              for (const specifier of node.specifiers)
                yield fixer.insertTextBefore(specifier, "type ");
            },
            loc: node.loc,
            messageId: "preferInlineTypeImport",
            node
          });
        }
      }
    };
  }
});
function* removeTypeSpecifier(fixer, sourceCode, node) {
  const importKeyword = sourceCode.getFirstToken(node);
  const typeIdentifier = sourceCode.getTokenAfter(importKeyword);
  yield fixer.remove(typeIdentifier);
  if (importKeyword.loc.end.column + 1 === typeIdentifier.loc.start.column) {
    yield fixer.removeRange([
      importKeyword.range[1],
      importKeyword.range[1] + 1
    ]);
  }
}

const index = {
  rules: {
    "if-newline": ifNewline,
    "import-dedupe": importDedupe,
    "prefer-inline-type-import": preferInlineTypeImport
  }
};

export { index as default };
