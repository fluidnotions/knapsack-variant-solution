module.exports = {
	globals: {
		'ts-jest': {
			diagnostics: true,
		},
	},
	transform: {
		'^.+\\.ts$': 'ts-jest',
	},
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts)$',
	testEnvironment: 'node',
	moduleFileExtensions: ['ts', 'js', 'json', 'node'],
	modulePaths: ['<rootDir>/src']
}
