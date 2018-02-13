
var highlighter = require './highlighter'
import Theme from './theme'
import TokenTheme from './monarch.js'
# register theme
var raw = Theme.toMonaco
var theme = TokenTheme.createFromRawTokenTheme(raw:rules)

var code = """

class Todo < Test

	def initialize title
		@title = title
		@completed = no

	def complete
		@completed = yes
"""

var tokens = highlighter.tokenize('imba',code)
console.log "tokens!!",tokens

console.log highlighter.htmlify(tokens)
# for token in tokens:tokens
# 	let typ = theme._match(token:type)
# 	console.log "token",typ
# console.log tokens# 