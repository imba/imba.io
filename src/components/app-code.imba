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

	let tokens = ImbaDocument.tmp(str.replace(/[ ]{4}/g,'\t')).getTokens()
	let parts = []

	for token,i in tokens
		let value = token.value
		let types = token.type.split('.')
		let [typ,subtyp] = types
		
		if token.variable
			types = ['variable']
			if token.variable.varscope
				types.push("scope_{token.variable.varscope.type}")

		if typ != 'white' and typ != 'line'
			value = "<span class='{types.join(' ')}' data-offset={token.offset}>{escape(value)}</span>"

		if typ == 'comment' and token.value == '# ---'
			parts.unshift('<div class="code-head">')
			parts.push('</div>')
			# pop next token
			try tokens[i + 1].value = ''
			continue

		parts.push(value)
	return cache[str] = parts.join('')

tag app-code
	
	def awaken
		# get the code and highlight it
		self

	def render
		<self>

tag app-code-block < app-code

	css .code-head = display: none

	def hydrate
		# console.log 'hydrating code block'
		plain = textContent.replace(/[ ]{4}/g,'\t')
		if plain.indexOf('# light') >= 0
			flags.add('light')
		highlighted = highlight(plain)
		innerHTML = '' # empty 

	def mount
		render!

	def run
		emit('run',{code: plain})
	
	def render
		# console.log 'render code block',is-mounted,is-awakened,__f
		return unless highlighted

		<self.(
			l:rel block p:5 6 radius:1 fs:13px
			color:$code-color bg:$code-bg-lighter
			white-space:pre-wrap
		)>
			<div.(l:abs top:1 right:1 c:blue400)>
				<button.(px:2 td.hover:underline fw:bold) @click.run> 'run'
			<code innerHTML=highlighted>

tag app-code-inline < app-code
