# @log basic strings
'simple string'

# @log interoplated strings with {}
"running imba version: {imba.version}"

# @log template strings
`template string {imba.version}`

# Multiline strings are allowed in Imba. Newlines and indentation is ignored.
# @log multiline string
'simple string
multiple lines'

###
Block strings, delimited by """ or ''', can be used to hold formatted or indentation-sensitive text (or, if you just don’t feel like escaping quotes and apostrophes). The indentation level that begins the block is maintained throughout, so you can keep it all aligned with the body of your code.
###

# @log block strings
"""
	multiline
		teste
	string
"""
