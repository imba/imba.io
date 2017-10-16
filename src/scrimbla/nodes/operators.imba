
# should rather reconcile into token - or something like it
var names = {
	'.': 'dot'
	'=': 'eq'
	'?': 'q'
	'!': 'unary'
	':': 'colon'
	',': 'comma'
	'#': 'hash'
	'*': 'mult'
	'>>': 'bitshift'
}

tag imop < im

	type 'op'
	alias 'relation'
	alias 'compare'
	alias 'compound_assign'
	alias 'assign'
	alias 'block_arg'
	alias 'splat'
	alias 'logic'
	alias 'math'
	alias 'shift'
	alias 'unary'

	def validate code
		IM.isOp(code)

	def baseClasses
		super + ' ' + (names[code] or '')

	def use token
		var val = token and token.@value or code
		dom:className = "_im _imop op {names[val] or ''}"
		self

	# should merge with a more generic version for token in general
	# same goes for text etc
	def insert
		super

		if code == '//'
			log 'is a regex!!'
			reclassify('regex')

# link regular ops to op-node
'+ - * / = ++ -- == === != !== > < >= <= & && | || or . : ? &= ||= &&= ?. ?: , ! .. ... .: >> << #'.split(' ').map do |op|
	IM.Types[op] = IM.Types:op


# IM.Types:logic = IM.Types:op
# IM.Types:compare = IM.Types:op
# IM.Types:math = IM.Types:op
# IM.Types:shift = IM.Types:op

