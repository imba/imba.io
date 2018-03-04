export var language = {
	tokenPostfix: '.js',

	keywords: [
		'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'debugger',
		'default', 'delete', 'do', 'double', 'else', 'enum', 'export', 'extends', 'false', 'final',
		'finally', 'float', 'for', 'function', 'goto', 'if', 'implements', 'in',
		'instanceof', 'int', 'interface', 'long', 'native', 'new', 'null', 'package', 'private',
		'protected', 'public', 'return', 'short', 'static', 'super', 'switch', 'synchronized', 'this',
		'throw', 'throws', 'transient', 'true', 'try', 'typeof', 'var', 'void', 'volatile', 'while',
		'with', 'let','await','async'
	],

	builtins: [
		'define','require','window','document','undefined'
	],

	operators: [
		'=', '>', '<', '!', '~', '?', ':',
		'==', '<=', '>=', '!=', '&&', '||', '++', '--',
		'+', '-', '*', '/', '&', '|', '^', '%', '<<',
		'>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=',
		'^=', '%=', '<<=', '>>=', '>>>='
	],

	# define our own brackets as '<' and '>' do not match in javascript
	brackets: [
		{ open: '(', close: ')', token: 'bracket.parenthesis' },
		{ open: '{', close: '}', token: 'bracket.curly' },
		{ open: '[', close: ']', token: 'bracket.square' }
	],

	# common regular expressions
	symbols:  /[~!@#%\^&*-+=|\\:`<>.?\/]+/,
	escapes:  /\\(?:[btnfr\\"']|[0-7][0-7]?|[0-3][0-7]{2})/,
	exponent: /[eE][\-+]?[0-9]+/,

	regexpctl: /[(){}\[\]\$\^|\-*+?\.]/,
	regexpesc: /\\(?:[bBdDfnrstvwWn0\\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/,

	tokenizer: {
		root: [
			# identifiers and keywords
			[/([a-zA-Z_\$][\w\$]*)(\s*)(:?)/, {
				cases: {
					'$1==import': { token: 'keyword', next: '@import' }, # ['keyword','white','delimiter', '@import'],
					'$1@keywords': ['keyword','white','delimiter'],
					'$3': ['key.identifier','white','delimiter'],   # followed by :
					'$1@builtins': ['predefined.identifier','white','delimiter'],
					'@default': ['identifier','white','delimiter'],
				}
			}],

			# whitespace
			{ include: '@whitespace' },

			# regular expression: ensure it is terminated before beginning (otherwise it is an opeator)
			[/\/(?=([^\\\/]|\\.)+\/(?!\/))/, { token: 'regexp.slash', bracket: '@open', next: '@regexp'}],

			[/(<)([:\w]+)/, ['start.delimiter.tag', { token: 'tag', next: '@tagContent'} ]],

			# delimiters and operators
			[/[{}()\[\]]/, '@brackets'],
			[/[;,.]/, 'delimiter'],
			[/@symbols/, { cases: {'@operators': 'operator', '@default': '' }}],

			# numbers
			[/\d+\.\d*(@exponent)?/, 'number.float'],
			[/\.\d+(@exponent)?/, 'number.float'],
			[/\d+@exponent/, 'number.float'],
			[/0[xX][\da-fA-F]+/, 'number.hex'],
			[/0[0-7]+/, 'number.octal'],
			[/\d+/, 'number'],

			{ include: '@strings' }
		],

		strings: [
			# strings: recover on non-terminated strings
			[/"([^"\\]|\\.)*$/, 'string.invalid' ],  # non-teminated string
			[/'([^'\\]|\\.)*$/, 'string.invalid' ],  # non-teminated string
			[/"/,  'string', '@string."' ],
			[/'/,  'string', '@string.\'' ],
		]

		rootInBrace: [
			[/\}/, 'delimiter', '@pop']
			{ include: '@root' }
		]

		tagContent: [
			[/\/\s*>/, 'delimiter', '@pop' ]
			[/>/, { token: 'end.delimiter.tag', switchTo: '@tagBody' }],
			[/"([^"]*)"/, 'attribute.value'],
			[/'([^']*)'/, 'attribute.value'],
			[/[\w\-]+/, 'attribute.name'],
			[/\=/, 'delimiter'],
			[/\{/, 'delimiter', '@rootInBrace'],
			{ include: '@whitespace' }
		],

		tagBody: [
			[/\{/, 'delimiter', '@rootInBrace']
			[/(<)([:\w]+)/, ['start.delimiter.tag', { token: 'tag', next: '@tagContent'} ]],
			[/(<\/)(\w+)(>)/, ['delimiter', 'tag', {token: 'delimiter', next: '@pop' }]]
		],

		import: [
			[/;/, 'delimiter', '@pop']
			[/^/, 'white', '@pop']
			[/\b(from|as)\b/, 'keyword']
			{ include: '@whitespace' }
			{ include: '@strings' }
		],

		whitespace: [
			[/[ \t\r\n]+/, 'white'],
			[/\/\*/,       'comment', '@comment' ],
			[/\/\/.*$/,    'comment'],
		],

		comment: [
			[/[^\/*]+/, 'comment' ],
			# [/\/\*/, 'comment', '@push' ],    # nested comment not allowed :-(
			[/\/\*/,    'comment.invalid' ],
			["\\*/",    'comment', '@pop'  ],
			[/[\/*]/,   'comment' ]
		],

		string: [
			[/[^\\"']+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\\./,      'string.escape.invalid'],
			[/["']/,     {
				cases: {
					'$#==$S2': { token: 'string', next: '@pop' },
					'@default': 'string'
				}
			}]
		],

		# We match regular expression quite precisely
		regexp: [
			[/(\{)(\d+(?:,\d*)?)(\})/, ['@brackets.regexp.escape.control', 'regexp.escape.control', '@brackets.regexp.escape.control'] ],
			[/(\[)(\^?)(?=(?:[^\]\\\/]|\\.)+)/, ['@brackets.regexp.escape.control',{ token: 'regexp.escape.control', next: '@regexrange'}]],
			[/(\()(\?:|\?=|\?!)/, ['@brackets.regexp.escape.control','regexp.escape.control'] ],
			[/[()]/,        '@brackets.regexp.escape.control'],
			[/@regexpctl/,  'regexp.escape.control'],
			[/[^\\\/]/,     'regexp' ],
			[/@regexpesc/,  'regexp.escape' ],
			[/\\\./,        'regexp.invalid' ],
			['/',           { token: 'regexp.slash', bracket: '@close'}, '@pop' ],
		],

		regexrange: [
			[/-/,     'regexp.escape.control'],
			[/\^/,    'regexp.invalid'],
			[/@regexpesc/, 'regexp.escape'],
			[/[^\]]/, 'regexp'],
			[/\]/,    '@brackets.regexp.escape.control', '@pop'],
		],
	}
}