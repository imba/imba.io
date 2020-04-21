import { ImbaDocument } from 'imba-document'

const cache = {}

const replacements = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
};

def escape str
	str.replace(/[\&\<\>]/g) do(m) replacements[m]

def highlight str
	if cache[str]
		return cache[str]

	let tokens = ImbaDocument.tmp(str).getTokens()
	let parts = []

	for token in tokens
		let value = token.value
		let types = token.type.split('.')
		let [typ,subtyp] = types
		
		if token.variable
			types = ['variable']
			if token.variable.varscope
				types.push("scope_{token.variable.varscope.type}")

		if typ != 'white' and typ != 'line'
			value = "<span class='{types.join(' ')}' data-offset={token.offset}>{escape(value)}</span>"

		parts.push(value)
	return cache[str] = parts.join('')

tag app-code
	
	def awaken
		# get the code and highlight it
		self

	def render
		<self>

tag app-code-block < app-code

	def mount
		unless highlighted
			plain = innerText
			innerHTML = highlighted = highlight(plain)

tag app-code-inline < app-code

### css

app-code-block {
	white-space: pre;
	padding: 24px 24px 24px 24px;
	border-radius: 3px;
	background: var(--code-bg-lighter);
	display: block;
	font-size: 13px;
	color: var(--code-color);
}

###