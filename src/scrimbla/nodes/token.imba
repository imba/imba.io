
import Region from '../region'
import Highlighter from '../core/highlighter'


var keywords = [
	'true', 'false', 'null', 'this',
	'delete', 'typeof', 'in', 'instanceof',
	'throw', 'break', 'continue', 'debugger',
	'if', 'else', 'switch', 'for', 'while', 'do', 'try', 'catch', 'finally',
	'class', 'extends', 'super', 'return',
	'undefined', 'then', 'unless', 'until', 'loop', 'of', 'by',
	'when','def','tag','do','elif','begin','var','let','self','await','import',
	'and','or','is','isnt','not','yes','no','isa','case','nil', 'extend', 'export',
	'own','default','as','from','require'
]

# this is really the general token
tag imtok < im
	alias 'token'

	attr eref watch: yes

	def erefDidSet new, old
		# experimental
		# console.log 'erefDidSet',new,old
		flag('lvar',!!new) unless new and old
		self

	def isVarRef
		hasFlag('lvar')

	def clearVarRef
		eref = null
		setFlag('vartype',null)
		self

	def clone val
		IM.tok(val)

	def text= text
		super(text)
		classify

		var typ = IM.identify(text)

		if typ
			log 'reclassifying imtok immediately'
			code = text
			return reclassify(typ)

		# return raw token if not classified?
		@typ ? self : <imraw raw=text>

	def canPrepend text
		yes

	def canAppend text
		yes

	def classify map 
		map ||= IM.identify(code)
		if map
			map = '_imtok ' + map unless map.match(/\b_[\w]/)
			dom:className = map
			@typ = map
		else
			@typ = null
		self

	def validate code
		no

	def repair
		log 'repair'
		classify
		self

	def split region
		region = Region.normalize(region)
		var lft = code.substring(0,region.start)
		var rgt = code.slice(region.end)

		code = lft
		setNext(IM.tok(rgt))
		return self

	def mutated o = {}
		var dirty = dirtyExtent
		view.observer.pause do Highlighter.reparse(dirty)
		self

	def reuse tok, new, old
		return self if new == old
		super

	def mutated o = {}
		return self if !o:deep and validate(code)
		super

	def ondblclick e
		e.halt
		select

	# centralize highlight of variables/entities
	# def onmouseover e
	# 	e.halt.silence
	# 	
	# 	if eref
	# 		view.nodesForEntity(eref).map do |el| el.flag('hl')

	# def onmouseout e
	# 	e.halt.silence
	# 	if eref
	# 		view.nodesForEntity(eref).map do |el| el.unflag('hl')


tag imidentifier < imtok
	type 'identifier'

	attr name

	def validate code
		# regex for identifier
		log 'validate identifier',code,(/^[a-z](-?[\wA-Za-z_\-\x7f-\uffff\$]+)*$/).test(code)
		(/^[a-z](-?[\wA-Za-z_\-\x7f-\uffff\$]+)*$/).test(code) and keywords.indexOf(code) == -1

	def use tok, new, old
		console.log 'identifier setup',baseClasses
		name = tok.@value if tok and tok.@value
		@dom:className = baseClasses
		self

	def mutated
		# console.log 'imidentifier mutated'
		name = code
		if isVarRef
			clearVarRef
		super

	def canPrepend text
		# should we not run validate first?
		return no if (/[\n\t\+]+/).test(text)
		return yes

	def canAppend text
		return no if (/[\n\t ]+/).test(text)
		return yes

tag imkey < imtok
	type 'key'

	attr name

	def validate code
		# regex for identifier
		(/^[a-z](-?[\wA-Za-z_\-\x7f-\uffff\$]+)*$/).test(code) and keywords.indexOf(code) == -1

	def use tok, new, old
		# console.log 'identifier setup',baseClasses
		name = tok.@value if tok and tok.@value
		@dom:className = baseClasses
		self

	def mutated
		# console.log 'imidentifier mutated'
		name = code
		if isVarRef
			clearVarRef
		super


tag imtagtype < imtok
	type 'tag_type'

tag imtagid < imtok
	type 'tag_id'
	alias 'idref'

tag imconst < imtok
	type 'const'

	def validate code
		(/^[A-Z](-?[\wA-Za-z_\-\x7f-\uffff\$]+)*$/).test(code)

	# def onchanged code, prev
	# 	# console.log 'imconst onchanged',code,prev
	# 	flag('dirty') unless validate(code)


tag imivar < imtok
	type 'ivar'

tag imcvar < imtok
	type 'cvar'

tag imkeyword < imtok
	type 'keyword'
	alias 'new'

	def use tok, new, old
		# console.log 'setup imkeyword',tok, new, old
		var cls = baseClasses
		cls += ' ' + tok.@value if tok and tok.@value
		@dom:className = cls
		self

keywords.map do |keyword| IM.Types[keyword] = IM.Types:keyword

IM.Types:forin = IM.Types:keyword
IM.Types:forof = IM.Types:keyword
IM.Types:post_if = IM.Types:keyword
IM.Types:post_unless = IM.Types:keyword
IM.Types:post_for = IM.Types:keyword
IM.Types:post_while = IM.Types:keyword

tag imnum < imtok
	type 'number'

	def validate code
		(/^\d+(\.\d+)?$/).test(code)

	def reuse
		self

	def isAtomic
		yes

tag imint < imnum
	type 'int'

tag imfloat < imnum
	type 'float'

tag imbool < imtok
	type 'bool'
	alias 'true'
	alias 'false'

# this should be more advanced - no
tag imstr < imtok
	type 'string'

	def quote
		code[0]

	def quote= quote
		var result = quote + code.slice(1,-1) + quote
		view.replace(region,result)
		# code = quote + code.slice(1,-1) + quote
		self

	def use tok, new, old
		# console.log 'setup string',tok, new, old
		@dom:className = baseClasses
		code = new
		self

	def onunwrap e
		log 'imstring onunwrap!!!',e
		e.halt
		# look at prev and next as well?
		# should do this through the view
		code = code.slice(1,-1)

	def ondblclick e
		e.halt
		select

	def validate code
		if code[0] == '"'
			(/^\"([^"\{]*)\"$/).test(code)
		elif code[0] == "'"
			(/^\'([^'\{]*)\'$/).test(code)

	# trigger '"' do |token,o|
	# 	if o:mode == 'all'
	# 		token.quote = '"'
	# 		return true
	# 	elif token.quote == '"'
	# 		this.insert('\\"')
	# 		return true
	# 	else
	# 		this.insert('"')
		

	# trigger "'" do |token,o|
	# 	if o:mode == 'all'
	# 		token.quote = "'"
	# 	elif token.quote == "'"
	# 		this.insert("\\'")
	# 		return true
	# 	else
	# 		this.insert("'")



tag imneostring < imtok
	type 'neostring'

	def mutated o = {}
		return self if !o:deep and !code.match(/[\{\"\']/)
		super

tag imsym < imtok
	type 'symbol'

tag imtagattr < imtok
	type 'tag_attr'