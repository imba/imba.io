var names = 
	access: 'delimiter.access'
	ivar: 'variable.instance'
	constant: 'identifier.const'
	
# constant constructor.identifier
export var language = {
	defaultToken: 'invalid',
	ignoreCase: false,
	tokenPostfix: '.imba',
	brackets: [
		{ open: '{', close: '}', token: 'delimiter.curly' },
		{ open: '[', close: ']', token: 'delimiter.square' },
		{ open: '(', close: ')', token: 'delimiter.parenthesis' }
	],
	keywords: [
		'def', 'and', 'or', 'is', 'isnt', 'not', 'on', 'yes', '@', 'no', 'off',
		'true', 'false', 'null', 'this', 'self',
		'new', 'delete', 'typeof', 'in', 'instanceof',
		'return', 'throw', 'break', 'continue', 'debugger',
		'if', 'elif', 'else', 'switch', 'for', 'while', 'do', 'try', 'catch', 'finally',
		'class', 'extends', 'super',
		'undefined', 'then', 'unless', 'until', 'loop', 'of', 'by', 'when',
		'tag', 'prop', 'export', 'import', 'extend',
		'var', 'let', 'const', 'require', 'isa', 'await'
	],
	boolean: ['true','false','yes','no','undefined']
	contextual_keywords: [
		'from', 'global', 'attr'
	],
	operators: [
		'=', '!', '~', '?', ':',
		'&', '|', '^', '%', '<<',
		'>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=',
		'^=', '%=', '<<=', '>>=', '>>>=','..','...'
	],
	logic: [
		'>', '<', '==', '<=', '>=', '!=', '&&', '||'
	],
	ranges: ['..','...'],
	dot: ['.'],
	math: [
		'+', '-', '*', '/', '++', '--'
	],

	# we include these common regular expressions
	symbols: /[=><!~?&%|+\-*\/\^\.,\:]+/,
	escapes: /\\(?:[abfnrtv\\"'$]|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
	postaccess: /(:(?=\w))?/
	ivar: /\@[a-zA-Z_]\w*/
	constant: /[A-Z][A-Za-z\d\-\_]*/
	className: /[A-Z][A-Za-z\d\-\_]*|[A-Za-z\d\-\_]+/
	methodName: /[A-Za-z\_][A-Za-z\d\-\_]*\=?/
	identifier: /[a-z_][A-Za-z\d\-\_]*/
	
	regEx: /\/(?!\/\/)(?:[^\/\\]|\\.)*\/[igm]*/,
	
	regexpctl: /[(){}\[\]\$\^|\-*+?\.]/,
	regexpesc: /\\(?:[bBdDfnrstvwWn0\\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/,

	# The main tokenizer for our languages
	tokenizer: {
		root: [
			{ include: '@body' }
		],
		body: [
			[/([a-z]\w*)(\:)(?=\w)/, {
				cases: {
					'this:': ['variable.predefined.this','delimiter.access'],
					'self:': ['variable.predefined.self','delimiter.access'],
					'@default': ['identifier','delimiter.access']
				}
			}]

			[/(@ivar)(\:)(?=\w)/, [names:ivar,names:access]]
			[/(@constant)(\:)(?=\w)/, [names:constant,names:access]]

			[/(class|tag|module)(?=\s)/, { token: 'keyword.$1', next: '@declstart.$1'}],
			[/(def)(?=\s)/, { token: 'keyword.$1', next: '@defstart.$1'}],
			[/(prop|attr)(?=\s)/, { token: 'keyword.$1', next: '@propstart.$1'}],
			
			[/(import)(?=\s)/, { token: 'keyword.$1', next: '@importstart.$1'}],

			[/([a-z]\w*)(:?(?!\w))/, {
				cases: {
					'$2': ['key.identifier','delimiter'],
					'this': 'variable.predefined.this',
					'self': 'variable.predefined.self',
					'$1@boolean': { token: 'boolean.$0' },
					'$1@keywords': { token: 'keyword.$0' },
					'$1@contextual_keywords': { token: 'identifier.$0' },
					'@default': ['identifier','delimiter']
				}
			}],

			# [/([a-z]\w*)(:)(?!\w))/, { cases: {
			# 		'$2': ['key.identifier','delimiter'],
			# 		'this': 'variable.predefined.this',
			# 		'self': 'variable.predefined.self',
			# 		'$1@keywords': { token: 'keyword.$0' },
			# 		'$1@contextual_keywords': { token: 'identifier.$0' },
			# 		'@default': ['identifier','delimiter']
			# 	}

			# }],

			# identifiers and keywords
			[/\@[a-zA-Z_]\w*/, 'variable.instance'],
			[/\$\d+/, 'identifier.special'],
			[/\$[a-zA-Z_]\w*/, 'identifier.sys'],
			[/[A-Z][A-Za-z\d\-\_]*/, token: 'identifier.const'],
			[/[a-z_][A-Za-z\d\-\_]*/, token: 'identifier'],

			[/\(/, { token: 'paren.open', next: '@parens' }],
			
			# whitespace
			{ include: '@whitespace' },
			{ include: '@tag' },
			{ include: '@tag_singleton_ref' },
			
			# Comments
			[/### (javascript|compiles to)\:/, { token: 'comment', next: '@js_comment', nextEmbedded: 'text/javascript' }]

			{ include: '@comments' },
			[/(\:)([\@\w\-\_]+)/, ['symbol.start','symbol']],
			[/\$\d+/, 'entity.special.arg'],
			[/\&/, 'operator'],

			# regular expressions
			[/\/(?!\ )(?=([^\\\/]|\\.)+\/)/, { token: 'regexp.slash', bracket: '@open', next: '@regexp'}],
			[/}/, { cases: {
						'$S2==interpolatedstring': { token: 'string', next: '@pop' },
						'@default': '@brackets' } }],
			[/[\{\}\(\)\[\]]/, '@brackets'],
			{ include: '@operators' },
			
			# numbers
			{ include: '@number' },
			# delimiter: after number because of .\d floats
			[/[,]/, 'delimiter.comma'],
			[/[.]/, 'delimiter.dot'],
			# strings:
			[/"""/, 'string', '@herestring."""'],
			[/'''/, 'string', '@herestring.\'\'\''],
			[/"/, { cases: { '@eos': 'string', '@default': { token: 'string', next: '@string."' } } }],
			[/'/, { cases: { '@eos': 'string', '@default': { token: 'string', next: '@string.\'' } } }],
		],
		js_comment: [
			[/###/, token: 'comment', next: '@pop', nextEmbedded: '@pop']
		]

		string_start: [
			[/"""/, 'string', '@herestring."""'],
			[/'''/, 'string', '@herestring.\'\'\''],
			[/"/, { cases: { '@eos': 'string', '@default': { token: 'string', next: '@string."' } } }],
			[/'/, { cases: { '@eos': 'string', '@default': { token: 'string', next: '@string.\'' } } }],
		],
		value: [
			{ include: 'string_start' },
			{ include: '@number' },
		],
		unspaced_expr: [
			[/([a-z]\w*)(\:)(?=\w)/, {
				cases: {
					'this:': ['variable.predefined.this','delimiter.access'],
					'self:': ['variable.predefined.self','delimiter.access'],
					'@default': ['identifier','delimiter.access']
				}
			}]

			[/(@ivar)(\:)(?=\w)/, [names:ivar,names:access]]
			[/(@constant)(\:)(?=\w)/, [names:constant,names:access]]

		], 
		number: [
			[/\d+[eE]([\-+]?\d+)?/, 'number.float'],
			[/\d+\.\d+([eE][\-+]?\d+)?/, 'number.float'],
			[/0[xX][0-9a-fA-F]+/, 'number.hex'],
			[/0[0-7]+(?!\d)/, 'number.octal'],
			[/\d+/, 'number'],
		],
		operators: [
			[/@symbols/, { cases: {
						'@operators': 'operator',
						'@math': 'operator.math',
						'@logic': 'operator.logic',
						'@dot': 'operator.dot',
						'@default': 'delimiter'
					} }],
			[/\&\b/, 'operator']
		],
		whitespace: [
			[/[ \t\r\n]+/, 'white'],
		],
		comments: [
			[/###/, 'comment', '@comment'],
			[/#(\s.*)?$/, 'comment'],
		],
		
		tag: [
			[/\<\>/, { token: 'tag.empty' }],
			[/(<)([a-z][a-z\-\d]*(?:\:[A-Za-z\-\d]+)?)/, ['tag.open',{token: 'tag.name.tag-$2', next: '@tag_start'}]],
			[/(<)([A-Z][A-Za-z\-\d]*)/,['tag.open',{token: 'tag.name.local', next: '@tag_start'}]],
			[/(<)(?=[a-z\d\#\.\{\@])/, { token: 'tag.open', next: '@tag_start' }],
		],
		tag_singleton_ref: [
			[/\#(-*[a-zA-Z][\w\-]*)+/, 'tag.singleton.ref']
		],
		tag_parts: [
			[/\#(-*[a-zA-Z][\w\-]*)/, 'tag.id'],
			[/\.(-*[a-zA-Z][\w\-]*)/, 'tag.class'],
			[/\@(-*[a-zA-Z][\w\-]*)/, 'tag.iref'],
			[/[\#\.\@]\{/, { token: 'tag.interpolated.open', next: '@tag_inter' }],
		],
		tag_start: [
			[/[ \t\r\n]+/, { token: 'white', switchTo: '@tag_content' }],
			{ include: 'tag_parts' },
			[/\[/, { token: 'tag.data.open', next: '@tag_data' }],
			[/[\=\-]?\>/, { token: 'tag.close', next: '@pop' }],
		],
		tag_inter: [
			['}', { token: 'tag.interpolated.close', next: '@pop' }],
			{ include: 'body' }
		],
		tag_data: [
			[']', { token: 'tag.data.close', next: '@pop' }],
			{ include: 'body' }
		],
		tag_content: [
			# [/(\:[a-zA-Z][\w\-]*)((?:\.[a-zA-Z][\w\-]*)+|)\s*(\=)\s*/, ['tag.attribute.listener','tag.attribute.modifier','tag.attribute'], '@tag_attr_value'],
			[/(\:[a-zA-Z][\w\-]*)((?:\.[a-zA-Z][\w\-]*)+)/,['tag.attribute.listener','tag.attribute.modifier']],
			
			[/(\:[a-zA-Z][\w\-]*)/, { token: 'tag.attribute.listener'}],
			# [/(\.[a-zA-Z\-][\w\-]*)/, { token: 'tag.class.conditional'}],
			[/([a-zA-Z\-][\w\-]*(\:[a-zA-Z][\w\-]*)?)/, { token: 'tag.attribute.name'}],
			# [/([\:][a-zA-Z][\w\-]*([\:\.][a-zA-Z][\w\-]*)*)\s*(\=)\s*/, { token: 'tag.attribute.listener', next: '@tag_attr_value' }],
			# [/([@\.]?[a-zA-Z][\w\-]*([\:\.][a-zA-Z][\w\-]*)*)\s*(\=)\s*/, { token: 'tag.attribute', next: '@tag_attr_value' }],
			
			{ include: 'tag_parts' },
			{ include: '@whitespace' },
			# ['>', { token: 'tag.close', next: '@pop' }],
			[/[\=\-]?\>/, { token: 'tag.close', next: '@pop' }],
			# [/\s*\=\s*(?!\>)/, { token: 'tag.attribute.operator', next: '@tag_attr_value' }],
			[/(\=)\s*/, { token: 'delimiter.eq.tag', next: '@tag_attr_value' }], # switch to rather?
			[/\(/, { token: 'paren.open.tag', next: '@tag_parens' }]
		],
		tag_attr_value: [
			[/(?=(\:?[\w]+\=))/, { token: '', next: '@pop' }],
			[/(?=(\>|\s))/, { token: '', next: '@pop' }],
			[/\(/, { token: 'paren.open', next: '@parens' }],
			[/\{/, { token: 'brace.open', next: '@braces' }]
			[/\[/, { token: 'bracket.open', next: '@brackets' }]
			{ include: 'body' },
			# { include: 'unspaced_expr'},
			# [/\(/, { token: 'paren.open', next: '@parens' }],
			# [/\{/, { token: 'brace.open', next: '@braces' }]
		],
		tag_parens: [
			[/\)/, { token: 'paren.close.tag', next: '@pop' }],
			[/(\))(\:?)/, ['paren.close.tag','delimiter.colon'], '@pop' ],
			{ include: 'body' }
		],
		importstart: [
			[/^./, token: '@rematch', next: '@pop'],
			[/(from|as)/, { token: 'keyword.$1'}],
			[/[\{\}\,]/, { token: 'keyword'}],
			[/"""/, 'string', '@herestring."""'],
			[/'''/, 'string', '@herestring.\'\'\''],
			[/"/, { cases: { '@eos': 'string', '@default': { token: 'string', next: '@string."' } } }],
			[/'/, { cases: { '@eos': 'string', '@default': { token: 'string', next: '@string.\'' } } }],
			[/[a-z_A-Z][A-Za-z\d\-\_]*/, token: 'identifier.import']
		]

		parens: [
			[/\)/, { token: 'paren.close', next: '@pop' }],
			[/(\))(\:?)/, ['paren.close','delimiter.colon'], '@pop' ],
			{ include: 'body' }
		],
		braces: [
			['}', { token: 'brace.close', next: '@pop' }],
			{ include: 'body' }
		],
		brackets: [
			[']', { token: 'bracket.close', next: '@pop' }],
			{ include: 'body' }
		],

		declstart: [
			[/^./, token: '@rematch', next: '@pop'],
			[/[A-Z][A-Za-z\d\-\_]*/, token: 'identifier.decl.$S2'],
			[/\./, token: 'delimiter.dot'],
			[/[a-z_][A-Za-z\d\-\_]*/, token: 'identifier.decl.$S2'],
			[/[ \t\<\>]+/, 'operator.inherits string']
		],

		defstart: [
			[/(self)\./, token: 'identifier.decl.def.self'],
			[/@methodName/, token: 'identifier.decl.def', next: '@pop'],
			[/^./, token: '@rematch', next: '@pop'],
		],

		propstart: [
			[/@identifier/, token: 'identifier.decl.$S2', next: '@pop'],
			[/^./, token: '@rematch', next: '@pop'],
		],

		
		string: [
			[/[^"'\{\\]+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\./, 'string.escape.invalid'],
			[/\./, 'string.escape.invalid'],
			[/\{/, { cases: { '$S2=="': { token: 'string', next: 'root.interpolatedstring' }, '@default': 'string' } }],
			[/["']/, { cases: { '$#==$S2': { token: 'string', next: '@pop' }, '@default': 'string' } }],
			[/#/, 'string']
		],
		herestring: [
			[/("""|''')/, { cases: { '$1==$S2': { token: 'string', next: '@pop' }, '@default': 'string' } }],
			[/[^#\\'"\{]+/, 'string'],
			[/['"]+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\./, 'string.escape.invalid'],
			[/\{/, { cases: { '$S2=="""': { token: 'string', next: 'root.interpolatedstring' }, '@default': 'string' } }],
			[/#/, 'string']
		],
		comment: [
			[/[^#]+/, 'comment',],
			[/###/, 'comment', '@pop'],
			[/#/, 'comment'],
		],
		hereregexp: [
			[/[^\\\/#]/, 'regexp'],
			[/\\./, 'regexp'],
			[/#.*$/, 'comment'],
			['///[igm]*', { token: 'regexp', next: '@pop' }],
			[/\//, 'regexp'],
		],
		
		regexp: [
			[/(\{)(\d+(?:,\d*)?)(\})/, ['regexp.escape.control', 'regexp.escape.control', 'regexp.escape.control'] ],
			[/(\[)(\^?)(?=(?:[^\]\\\/]|\\.)+)/, ['regexp.escape.control',{ token: 'regexp.escape.control', next: '@regexrange'}]],
			[/(\()(\?:|\?=|\?!)/, ['regexp.escape.control','regexp.escape.control'] ],
			[/[()]/,        'regexp.escape.control'],
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
			[/\]/,    'regexp.escape.control', '@pop'],
		],
	}
}