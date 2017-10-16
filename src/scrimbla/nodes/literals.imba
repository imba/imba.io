extern eval

import '../core/util' as util

var SINGLE_STR = /^'[^']*'$/
var DOUBLE_STR = /^"[^"\{]*"$/
var COMMENT = /^\#[ \t][^\n]*$/

DOUBLE_STR = /^"([^\\"\{]|\\\\|\\")*"$/

tag imlit < im

	def validate code
		no

tag imregex < imlit

	type 'regex'

	def validate value
		true

	def pairing chr
		self

	def revalidate
		var reg = code
		var obj = try eval(reg)
		log 'regex is',reg,obj
		flag('invalid',!obj)
		self

	def mutated
		log 'regex mutated'
		revalidate

	def placeholder
		'/' + 'R'.repeat(size - 2) + '/'

	def isAtomic
		yes

