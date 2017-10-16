
# var imbac = global.Imbac
import Lexer from 'imba/src/compiler/lexer'

import './util' as util

var NODETYPE = 'b'
var KEYWORDS = [
	'null', 'this',
	'delete', 'typeof', 'in', 'instanceof',
	'throw', 'break', 'continue', 'debugger',
	'if', 'else', 'switch', 'for', 'while', 'do', 'try', 'catch', 'finally',
	'class', 'extends', 'super', 'return',
	'undefined', 'then', 'unless', 'until', 'loop', 'of', 'by',
	'when','def','tag','do','elif','begin','var','let','self','await','import',
	'and','or','is','isnt','not','isa','case','nil','export','default','require'
]

var classes = {
	'+': '_imop op add math'
	'++': '_imop op incr math'
	'--': '_imop op decr math'
	'-': '_imop op sub math'
	'=': '_imop op eq'
	'/': '_imop op div math'
	'*': '_imop op mult math'
	'?': '_imop op ternary'
	',': '_imop op comma'
	':': '_imop op colon'
	'.': '_imop op dot'
	'.:': '_imop op cdot'
	'!': '_imop op unary'
	'?.': '_imop op qdot'
	'[': '_imopen sb sbl'
	']': '_imclose sb sbr'
	'(': '_imopen rb rbl'
	')': '_imclose rb rbr'
	'{': '_imopen cb cbl'
	'}': '_imclose cb cbr'
	'#': '_imop op hash'
	'call_start': '_imopen call rb rbl'
	'call_end':   '_imclose call rb rbr'
	'tag_start':  '_imopen tag_open'
	'tag_end':    '_imclose tag_close'

	'true': '_imbool true'
	'yes': '_imbool true'
	'false': '_imbool false'
	'no': '_imbool false'
	'value': '_imvalue'

	'{{': '_imopen'
	'}}': '_imclose'

	'index': '_imindex'
	'"': 'doublequote'
	"'": 'singlequote'

	'regex': '_imregex regex'
	'identifier': '_imtok _imidentifier identifier'
	'key': '_imkey key'

	'compound_assign': 'op assign compound'
	'str': '_imstr string'
	'num': '_imnum number'
	'string': '_imstr string'
	'number': '_imnum number'
	'math': '_imop op math'
	'unary': '_imop op unary'
	'forin': 'keyword in'
	'forof': 'keyword of'
	'own': 'keyword own'
	'compare': '_imop op compare'
	'herecomment': '_herecomment'
	'relation': 'keyword relation'
	'export': 'keyword export'
	'default': 'keyword default'
	'global': 'keyword global'
	'extern': 'keyword global'
	'extend': 'keyword extend'
	'require': 'keyword require'
	'from': 'keyword from'
	'logic': 'keyword logic'
	'post_if': 'keyword if post_if'
	'post_for': 'keyword for post_for'
	'prop': 'keyword prop'
	'attr': 'keyword attr'

	'selector_start': '_imopen _imselopen selector_start'
	'selector_end': '_imclose _imselclose selector_end'
	'index_start': '_imopen index_start'
	'index_end': '_imclose index_end'
	'block_param_start': '_imopen'
	'block_param_end': '_imclose'

	'string_start': '_imstrstart string_start'
	'string_end': '_imstrend string_end'
	'neostring': '_imtok _imneostring'
}

var INTERPOLATING = '_imistring'

var OPEN = {
	'tag_start': '_imtagnode tagnode'
	'call_start': '_imparens call'
	'selector_start': '_imsel selector'
	'string_start': '_imistring'
	'index_start': '_imindex'
	'block_param_start': '_impair _imblockparams'
	'value_start': '_imvalue'
	# 'indent': '_indent'
	'(': '_imparens paren'
	'{{': '_imiexpr'
	'{': '_imcurly curly'
	'[': '_imsquare square'
	'("': '_imistring'
}



var CLOSE = {
	'tag_end': 'tag'
	'call_end': '_imparens call'
	'string_end': '_imistring'
	'selector_end': 'sel'
	'index_end': '_imindex'
	'block_param_end': '_impair _imblockparams'
	'value_end': '_imvalue'
	'}}': '_imiexpr'
	')': 'paren'
	']': 'square'
	'}': 'curly'
	'")': 'string'
}

var OPS = '+ - * / = ++ -- == === != !== > < >= <= & && | || or . : ?'.split(' ')

var hlo = {
	newline: "<b class='_imnewline'>\n</b>"
	space: do |m| "<b class='_imspace'>{m}</b>"
	tab: do |m| Array.new(m:length + 1).join("<b class='_imtab'>\t</b>")
}

def escapeCode code
	code = code.replace(/\</g,"&lt;")
	code = code.replace(/\>/g,"&gt;")
	return code

class Stack

	def initialize
		@stack = []
		return self

	def push val
		@stack.push(val)
		@current = val
		self

	def pop
		var len = @stack.pop
		@current = @stack[len - 1]
		self

	def toString
		@current

export class Token
	
	def type
		@type

	def value
		@value

	def loc
		@loc

	def len
		@len

	def initialize type, value, line, loc, len
		@type  = type
		@value = value
		@meta  = null
		@line  = line or 0
		@col   = -1
		@loc   = loc or 0
		@len   = len or 0
		this:generated = no
		this:newLine = no
		this:spaced = no
		return self

export class Highlighter
	
	self.Mapping = classes

	def self.logger
		VIEW.logger

	def self.tokenize code, o = {}
		# console.log 'tokenize using local lexer'
		if global.Imbac
			return Imbac.tokenize(code,o)

		@lexer ||= Lexer.new
		@lexer.reset
		try
			@lexer.tokenize(code,o)
		catch e
			console.log 'caught tokenize error',e

	def self.reclassify domnode, type, token, newCode, oldCode

		type = type.toLowerCase
		# console.log 'reclassify node as type',domnode,type,token
		var cls = IM.Types[type] or Imba.TAGS["im{type}"] or IM.Types['token']

		var node = tag(domnode)

		if node isa cls
			return node.reuse(token, newCode, oldCode)

		if cls
			var node = cls.new(domnode).use(token, newCode, oldCode)

		return node


	def self.nestTokens tokens, offset
		var pairing = {
			'TAG_START': 'TAG_END'
			'SELECTOR_START': 'SELECTOR_END'
			'CALL_START': 'CALL_END'
			'INDEX_START': 'INDEX_END'
			'STRING_START': 'STRING_END'
			'BLOCK_PARAM_START': 'BLOCK_PARAM_END'
			'{{': '}}'
			'{': '}'
			'[': ']'
			'(': ')'
			'VALUE_START': 'VALUE_END'
		}

		var naming = {
			'TAG_START': 'tagnode'
			'SELECTOR_START': 'selector'
			'STRING_START': 'istring'
			'CALL_START': 'parens'
			'INDEX_START': 'square'
			'BLOCK_PARAM_START': 'blockparams'
			'VALUE_START': 'value'
			'{{': 'iexpr'
			'{': 'curly'
			'[': 'square'
			'(': 'parens'
		}

		var idx = 0

		var root = {
			_loc: 0
			_offset: 0
			_children: []
		}

		var stack = [root]
		var ends = []
		var offset = 0

		var loc,val,typ,ctx,tok

		while tok = tokens[idx++]
			loc = tok.@loc
			val = tok.@value
			typ = tok.@type

			# normalizing because we dont rewrite tokens (should start with that)
			# could use pairing provided by the lexer directly instead?
			typ = tok.@type = 'KEYWORD' if typ == 'IDENTIFIER' and (val == 'prop' or val == 'attr') # not always
			typ = tok.@type = '[' if typ == 'INDEX_START'
			typ = tok.@type = ']' if typ == 'INDEX_END'
			typ = tok.@type = '(' if typ == 'CALL_START'
			typ = tok.@type = ')' if typ == 'CALL_END'

			ctx = stack[stack:length - 1]

			loc -= ctx.@offset
			# offset relative to context
			var closer = pairing[typ]

			if closer
				var group = Token.new(naming[typ],'',-1,loc)
				group.@offset = ctx.@offset + loc
				offset += loc
				group.@children = []
				ends.push(closer)
				stack.push(group)
				ctx.@children.push(group)
				ctx = group

			tok.@loc -= ctx.@offset

			# update length at all times
			if tok.@len >= 1
				ctx.@children.push(tok)
				ctx.@len = tok.@loc + tok.@len

			if ends[ends:length - 1] == typ
				ends.pop
				ctx.@len = tok.@loc + tok.@len
				stack.pop
				# offset -= ctx.@offset

		# console.log 'children here',root.@children
		return root.@children
	
	def self.normalizeTokens code, tokens, offset = 0
		var idx = 0
		var caret = 0
		var new = []
		var tok, next, typ,val
		var loc = 0

		var stack = Stack.new

		var ws = do
			var newtok = null

			while loc > caret
				var chr = code[caret]
				if chr == '\t'
					newtok = Token.new('tab',chr,-1,caret,1)
				elif chr == '\n'
					newtok = Token.new('newline',chr,-1,caret,1)
				elif chr == ';'
					newtok = Token.new('semicolon',chr,-1,caret,1)
				elif chr == ' '
					if newtok and newtok.@type == 'whitespace'
						newtok.@value += ' '
						newtok.@len += 1
						caret++
						continue
					newtok = Token.new('whitespace',chr,-1,caret,1)
				elif chr == '#'
					var startloc = caret
					var comment = ''
					while caret < loc and code[caret] != '\n'
						comment += code[caret]
						caret++
					new.push(Token.new('comment',comment,-1,startloc,comment:length))
					continue
				else
					newtok = null

				caret++
				new.push(newtok) if newtok
			return

		var skip = ['TERMINATOR','INDENT','OUTDENT',' ',' \t']

		while tok = tokens[idx++]
			var next = tokens[idx]
			loc = tok.@loc
			val = tok.@value
			typ = tok.@type

			if typ == '#' and next and next.@type == 'IDENTIFIER'
				next.@type = 'IDREF'

			if typ == '(' and val == '("'
				stack.push(val)

			continue if skip.indexOf(typ) >= 0

			ws() if loc > caret
			caret = tok.@loc + tok.@len
			new.push(tok)

		# move to the end to possibly parse more whitespace
		loc = code:length
		ws()
		# now nest the tokens
		new = nestTokens(new)
		return new

	def self.whitespaceToTokens str
		var tok
		var tokens = []
		var caret = 0
		var len = str:length

		while len > caret
			var loc = caret
			var chr = str[caret++]
			if chr == '\t'
				tokens.push(tok = Token.new('tab',chr,-1,loc,1))
			elif chr == '\n'
				tokens.push(tok = Token.new('newline',chr,-1,loc,1))
			elif chr == ' '
				if tok and tok.@type == 'whitespace'
					tok.@value += ' '
					tok.@len += 1
					continue
				tokens.push(tok = Token.new('whitespace',chr,-1,loc,1))

		return tokens

	def self.reparse o

		if o isa Element
			let el = tag(o)
			el?.mutated if el
			return

		var nodes  = o:nodes
		var code   = o:code
		var tokens = o:tokens
		# should use a global logger-instance
		logger.groupCollapsed('reparse %s',JSON.stringify(code))
		logger.time('reparsing')
		CODE_REPARSE = code

		if util.isWhitespace(code) and !tokens
			tokens = self.whitespaceToTokens(code)
		# logger.log nodes.slice
		# big hack - adding a space at the end to close up selectors
		# should rather drop inline and let the parser pair up loose ends?
		unless tokens
			try
				tokens = self.tokenize(code,inline: yes, silent: yes, rewrite: no)
				tokens = normalizeTokens(code,tokens)
				logger.log tokens.slice
			catch e
				# console.log 'could not reparse tokens',code,e
				tokens = null

		logger.log nodes.slice

		if tokens
			applyTokens(code,tokens,nodes,o:nested,o:parent)

		logger.timeEnd('reparsing')
		logger.groupEnd
		return

	def self.applyTokens code, tokens, nodes, nested, parent
		# what about len and loc for inner nodes? Should this be set already?

		var node
		var prevNode

		var addNode = do |nodes,index,after|
			logger.log 'addNode',index
			var el = document.createElement(NODETYPE)

			if after
				if after:nextSibling
					after:parentNode.insertBefore(el,after:nextSibling)
				elif after:parentNode
					after:parentNode.appendChild(el)
			elif parent
				parent.appendChild(el)

			nodes.splice(index,0,el)
			return el

		var removeNode = do |nodes,index|
			logger.log 'removeNode',index
			var el = nodes[index]
			if el and el:parentNode
				el:parentNode.removeChild(el)
			nodes.splice(index,1)

		# loop through to set the locations of the nodes
		var nloc = 0
		for node in nodes
			node.@loc = nloc
			nloc += node.@len = node:textContent:length

		for tok,i in tokens
			var node = nodes[i]
			var tloc = tok.@loc
			var nloc = node and node.@loc

			while node and node.@len == 0
				logger.log 'remove node because it is empty',node
				removeNode(nodes,i)
				node = nodes[i]

			if !node
				# need to insert new node here - 
				node = addNode(nodes,i,prevNode)

			elif nloc > tloc
				node = addNode(nodes,i,prevNode)

			elif tloc > nloc
				removeNode(nodes,i)
				node = nodes[i]

			# need to insert new node here - 
			node = addNode(nodes,i,prevNode) if !node

			if tok.@type == 'STRING' and tok.@value.match(/\§{3}/)
				if nested
					nested.pop # this is the node
					prevNode = node
					continue

				# want to make sure it is a placeholder for the right thing

			var cval = code.substr(tloc,tok.@len)
			var cprev = node:textContent
			var element = reclassify(node,tok.@type,tok,cval,cprev)

			if tok.@children
				let cnodes = node:children
				if cnodes:length and cnodes:length == node:childNodes:length
					logger.log 'reuse the cnodes(!)',cnodes
					# otherwise we should remove the textNodes?
					# convert to array
					cnodes = Array:prototype:slice.call(cnodes)
				else
					logger.log 'wrong length'
					for cn in node:childNodes
						logger.log cn
					# see if previous value is the same?!
					node:innerHTML = ''
					cnodes = []

				# let o =
				# 	code: cval
				# 	nodes: cnodes
				# 	tokens: tok.@children # already parsed
				# 	nested: nested
				# 	parent: node
				
				applyTokens(cval,tok.@children,cnodes,nested,node)

			elif cprev != cval
				node:textContent = cval # tok.@value
				element.reparsed cval, cprev

			prevNode = node
			# tok.@len

		# loop through tokens? not sure it works due to the issues with whitespace?

		# remove excess original nodes
		while nodes:length > tokens:length
			var node = nodes.pop
			node:parentNode.removeChild(node) if node:parentNode
			# node.orphanize
		self

	# should later be able to rehighlight the text / nodes directly instead
	# probably more efficient
	def self.highlight code, o = {}
		# first try to parse etc?
		# could highlight single words as well
		o:hl ||= hlo
		var tokens = o:tokens or null

		unless tokens
			try
				# sure we dont want to rewrite anything now?
				console.time('tokenize') if DEBUG
				if o:mode == 'full'
					tokens = self.tokenize(code,{})
				else
					tokens = self.tokenize(code,{inline: yes, silent: yes, rewrite: no})
				console.timeEnd('tokenize') if DEBUG
			catch e
				tokens = e.@options:tokens if e.@options

		var hl = self.new(code,tokens,null,o)
		return hl.process

	prop options
	
	def initialize code, tokens, ast, o = {}
		@code = code
		@tokens = tokens
		@ast = ast

		o:render ||= {}
		o:hl ||= {}
		o:hl:newline ||= '<b class="_n">\n</b>'
		@options = o

		@options:nextVarCounter ||= 0
		@varRefs = {}

		if o:mode == 'full' and !ast
			@ast = Imbac.parse(@tokens,{})

		return self

	def varRef variable
		var i = @options:nested
		var pfx = i ? 'i' : ''
		@varRefs[variable.@ref] ||= (pfx + @options:nextVarCounter++)

	def parseWhitespace text
		# parsing comments
		var hl = @options:hl
		var comments = []

		text = text.replace(/(\#)([^\n]*)/g) do |m,s,q|
			if @options:render:comment
				m = @options:render:comment('comment',m)
			var nr = comments.push("<{NODETYPE} class='_im _imcomment'>{escapeCode(m)}</{NODETYPE}>")
			"${nr - 1}$"

		text = text.replace(/(\n|[ ]+|[\t]+)/g) do |m,l|
			if l == '\n'
				hl:newline or '\n'
			elif l[0] == ' '
				hl:space isa Function ? hl.space(l) : l
			elif l[0] == '\t'
				hl:tab isa Function ? hl.tab(l) : l

		if comments:length
			text = text.replace(/\$(\d+)\$/g) do |m,nr|
				comments[parseInt(nr)]
		return text

	def process
		var o = options

		var str = @code
		var pos = @tokens:length

		var stack = []
		var depth = 0
		var context = null

		var push = do |ctx|
			stack.push(ctx)
			depth = stack:length
			context = stack[depth - 1]

		var pop = do |ctx|
			stack.pop
			depth = stack:length
			context = stack[depth - 1]

		if @ast and @ast:analyze
			try @ast.analyze({}) catch e null

		var res = ""
		var pos = 0
		var caret = 0

		var open,close

		while var tok = @tokens[pos++]
			var next = @tokens[pos]

			if close
				res += "</{NODETYPE}>" unless o:inner and depth == 1
				close = null
				pop()

			var typ = tok.@type.toLowerCase
			var loc = tok.@loc
			var val = tok.@value
			var len = tok.@len # or tok.@value:length
			var meta = tok.@meta
			var attrs = ''

			if loc > caret
				var add = str.substring(caret,loc)
				add = parseWhitespace(add) unless context == INTERPOLATING
				res += add
				caret = loc

			close = CLOSE[typ]

			if open = OPEN[typ]
				# open = OPEN[val] || open
				push(open)
				res += "<{NODETYPE} class='{open}'>" unless o:inner and depth == 1

			if len == 0 or typ == 'terminator' or typ == 'indent' or typ == 'outdent'
				continue 

			if tok.@col == -1 and tok.@loc <= 0
				continue 

			var node = NODETYPE
			var content = str.substr(loc,len)

			var cls = classes[typ] or typ

			if cls isa Array
				node = cls[0]
				cls = cls[1]

			cls = cls.split(" ")

			if KEYWORDS.indexOf(typ) >= 0
				cls.unshift('keyword')

			caret = loc + len

			if typ == 'identifier'
				if content[0] == '#'
					cls.push('idref')
				
				if meta
					cls.push('access') if meta:type == 'ACCESS'

				if content == 'log'
					cls.push('log')

			if tok.@variable

				cls.push('lvar')
				let ref = self.varRef(tok.@variable)
				attrs += " eref='v{ref}'"
				# cls.push("ref-"+ref)

			if typ == 'herecomment'
				let end = "<{NODETYPE}>###</{NODETYPE}>"
				content = end + content.slice(3,-3) + end

			if typ == 'string'
				cls.push('pathname') if content.match(/^['"]?\.?\.\//)

			var clstr = cls.join(" ")
			clstr = '_imtok ' + clstr unless clstr.match(/\b\_/)
			res += "<{node} class='{clstr}'" + attrs + ">" + escapeCode(content) + "</{node}>"

		# close after?
		if close
			res += "</{NODETYPE}>"
			close = null

		if caret < str:length - 1
			var add = str.slice(caret)
			add = parseWhitespace(add) unless context == INTERPOLATING
			res += add

		if @tokens:length == 0
			res = @code

		return res