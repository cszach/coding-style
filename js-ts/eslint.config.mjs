import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
	...tseslint.configs.recommended,
	prettierConfig,
	{
		rules: {
			// General
			eqeqeq: ["error", "always"],
			"no-var": "error",
			"prefer-const": "error",
			curly: "error",

			// TypeScript
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/consistent-type-imports": [
				"error",
				{
					prefer: "type-imports",
					fixStyle: "separate-type-imports"
				}
			],

			// Naming
			"@typescript-eslint/naming-convention": [
				"error",
				{
					selector: "memberLike",
					modifiers: ["private"],
					format: ["camelCase"],
					leadingUnderscore: "forbid"
				}
			],

			// Functions
			"func-style": ["error", "declaration", { allowArrowFunctions: true }],

			// Loops
			"@typescript-eslint/prefer-for-of": "error",

			// Classes
			"@typescript-eslint/member-ordering": [
				"error",
				{
					default: [
						"public-static-field",
						"private-static-field",
						"public-instance-field",
						"private-instance-field",
						"public-static-method",
						"private-static-method",
						"constructor",
						["public-instance-get", "public-instance-set"],
						"public-instance-method",
						"private-instance-method"
					]
				}
			],

			// Exports
			"no-restricted-syntax": [
				"error",
				{
					selector: "ExportDefaultDeclaration",
					message: "Use named exports. Never use default exports."
				}
			]
		}
	}
);
