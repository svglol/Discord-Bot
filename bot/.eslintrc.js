module.exports = {
	'env': {
		'browser': true,
		'commonjs': true,
		'es2021': true,
		'node': true
	},
	'extends': [
		'eslint:recommended','plugin:@typescript-eslint/recommended'
	],
	'parser': '@typescript-eslint/parser',
	'parserOptions': {
		'ecmaVersion': 13
	},
	'plugins': ['@typescript-eslint'
	],
	'rules': {
		'indent': [
			'error',
			'tab'
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		],
		'@typescript-eslint/no-unused-vars': 'error',
		'no-var': 'error'
	}
};
