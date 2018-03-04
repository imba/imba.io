# ivar namespace.instance.identifier
var monarch = require('./monarch')
import Theme from './theme'
# import TokenTheme from './monarch.js'
# register theme
var raw = Theme.toMonaco
export var theme = monarch.TokenTheme.createFromRawTokenTheme(raw:rules)

var css = []
for color,i in theme.getColorMap when i > 0
	css[i] = ".mtk{i} \{ color: {color}; \}"

let mkt = theme._match("delimiter.access.imba")
if let i = mkt:_foreground
	css[i] += "\n.mtk{i}:before" + '{
	position: absolute;
	content: ".";
	color: #ea9b80;
}'

theme.CSS = css.join("\n")
	
export def styles
	css

var imbaLang = require './hl/imba'
var jsLang = require './hl/javascript'
monarch.register('imba',imbaLang:language)
monarch.register('js',jsLang:language)

export def tokenize lang, code, options = {}
	if $node$ and options:decorate and lang == 'imba'
		var compiler = require 'imba/compiler'
		var helpers = require 'imba/lib/compiler/helpers'
		let analysis = compiler.analyze(code,{target: 'web'})
		var locmap = helpers.locationToLineColMap(code)
		var vars = []
		for scope in analysis:scopes
			for item in scope:vars
				for ref in item:refs
					let loc = locmap[ref:loc[0]].concat('identifier.l' + item:type)
					vars.push(loc)
		
		vars = vars.sort do |a,b|
			if a[0] == b[0]
				a[1] - b[1]
			else
				a[0] - b[0]
		
		# console.log "decorations",vars

		options:decorations = vars

	var theme = options:theme
	var decorations = (options:decorations or []).slice
	var lexer = monarch.getLexer(lang)
	var types = theme ? null : []
	var map = {}
	var state = lexer.getInitialState
	var lines = []
	var dec = decorations.shift
	
	
	for line,ln in code.split('\n')
		var result = lexer.tokenize(line,state,0)
		let tokens = result:tokens.filter do |tok| tok:type.indexOf("white") == -1
		let offset = 0
		let lstr = ""

		for token,i in tokens
			# skip whitespace
			let tref
			
			# console.log ln,token:offset,token:type
			if dec and dec[0] == ln and dec[1] == token:offset
				# console.log "found decoration!!!",dec
				token:type = dec[2]
				dec = decorations.shift
	
			let next = tokens[i + 1]
			if theme
				tref = theme._match(token:type)
				tref = tref:_foreground
			else
				let type = token:type.replace(/\./g,' ').replace(lang,'').trim
				tref = map[type]
				if tref == undefined
					tref = map[type] = (types.push(type) - 1)

			let end = next ? next:offset : line:length
			lstr += String.fromCharCode(64 + tref)
			let move = (end) - offset
			lstr += String.fromCharCode(64 + move)
			offset += move
		
		state = result:endState
		lines.push(lstr)
	
	return [code,lines.join('\n'),types]

export def htmlify code, lineCount = 30
	var out = ""
	
	var raw = code[0]
	var tokens = code[1].split('\n')
	var types = code[2]
	
	var i = 0
	var start = 0
	var l = tokens:length
	var lines = raw.split('\n')
	
	var out = []
	
	for line,li in lines
		let start = 0
		let desc = tokens[li]
		let k = 0
		let s = ""
		while k < desc:length
			let code = desc.charCodeAt(k++) - 64			
			if k % 2 == 0 # move
				let content = line.slice(start,start = start + code)
				s += content.replace(/\</g,'&lt;').replace(/\>/g,'&gt;')
				s += '</span>'
			else
				s += '<span class="'+(types ? types[code] : ('mtk'+code)) +'">'
		out.push(s)
		
	return out.join('\n')
	
export def highlight lang, code, options = {}
	options:theme ?= theme
	var tokens = tokenize(lang,code,options)
	return htmlify(tokens)

