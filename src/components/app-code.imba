import { ImbaDocument } from 'imba-document'

const cache = {}

const replacements = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
};

css :root
	--code-color: #e3e3e3;
	--code-identifier: #9dcbeb;
	--code-constant: #c1a5d6;
	--code-background: #282c34;
	--code-bg-lighter: #29313f;
	--code-comment: #718096;
	--code-keyword: #e88376;
	--code-operator: #e88376;
	--code-delimiter-operator:#6d829b;
	--code-numeric: #63b3ed;
	--code-boolean: #4299e1;
	--code-null: #4299e1;
	--code-entity: #8ab9ff;
	--code-string: #77b3d1;
	--code-entity: #8ab9ff;
	--code-regexp: #e9e19b;
	--code-this: #63b3ed;
	--code-tag: #e9e19b;
	--code-tag-event: #fff9c3;
	--code-tag-reference: #ffae86;
	--code-tag-angle: #9d9755;
	--code-type: #718096;
	--code-property: #F7FAFC;
	--code-decorator: #63b3ed;
	--code-variable: #e8e6cb;
	--code-root-variable: #e8e6cb;
	--code-font: "Source Code Pro", Consolas, Menlo, Monaco, Courier, monospace;
	--code-rule-mixin: #ff9292;
	--code-rule: #ffb8b8;
	--code-style: #c8c9b6;
	--code-style-scope: #fad8bf;
	--code-style: #e0ade3;
	--code-style-bracket:#e9e19b;
	--code-style-unit: #ff9191;
	--code-style-scope: #eb9fe5;
	--code-style-delimiter: #8c7590;
	--code-style-value: #a49feb;
	--code-style-value-size: #ff8c8c;
	--code-style-property: #e0ade3;
	--code-style-var: #ff93d0;
	--code-keyword-css: #fff7b6;
	--code-selector: #e9e19b;
	--code-selector-pseudostate: var(--code-selector);
	--code-selector-context: #eec49d;

css .code
	tab-size: 4
	& .invalid = color: red
	& .entity.other.inherited-tag = color: var(--code-entity); 
	& .entity.other.inherited-class = color: var(--code-entity); 
	& .invalid = color: red; 
	& .comment = color: var(--code-comment); 
	& .regexp = color: var(--code-regexp); 
	& .tag = color: var(--code-tag); 
	& .type = color: var(--code-type); 
	& .entity.name.type = color: var(--code-entity); 
	& .keyword = color: var(--code-keyword); font-weight: 600;
	& .argparam = color: var(--code-keyword); font-weight: 600;
	& .operator = color: var(--code-operator); 
	& .property = color: var(--code-property); 
	& .numeric = color: var(--code-numeric); 
	& .number = color: var(--code-numeric); 
	& .boolean = color: var(--code-boolean); 
	& .null = color: var(--code-null); 
	& .identifier = color: var(--code-identifier); 
	& .variable = color: var(--code-variable); 
	& .string = color: var(--code-string); 
	& .propname = color: var(--code-entity); 
	& .this = color: var(--code-this); 
	& .self = color: var(--code-this); 
	& .constant = color: var(--code-constant); 
	& .tag.reference = color: var(--code-tag-reference);
	& .tag.open = color: var(--code-tag-angle); 
	& .tag.close = color: var(--code-tag-angle); 
	& .tag.close = color: var(--code-tag-angle); 
	& .tag.event = color: var(--code-tag-event); 
	& .tag.event-modifier = color: var(--code-tag-event); 
	& .variable.scope_root = color: var(--code-root-variable); 
	& .decorator =color: var(--code-decorator); 
	& .tag.flag.start = opacity: 1;
	& .tag.rule-modifier = color: var(--code-rule-mixin); 
	& .tag.rule-modifier.start = opacity: 0.43; 
	& .tag.rule = color: var(--code-rule); 
	& .style.open = color: var(--code-style-bracket); 
	& .style.close = color: var(--code-style-bracket); 
	& .style.args.open = color: var(--code-style); 
	& .style.args.close = color: var(--code-style); 
	& .style = color: var(--code-style); 
	& .style.scope = color: var(--code-style-scope); 
	& .selector = color: var(--code-selector); 
	& .unit = color: var(--code-style-unit); 
	& .style.delimiter = color: var(--code-style-delimiter); 
	& .style.property = color: var(--code-style-property); 
	& .style.property.scope = color: var(--code-style-scope); 
	& .style.value = color: var(--code-style-value); 
	& .style.value.var = color: var(--code-style-var);
	& .style.value.size = color: var(--code-style-value-size); 
	& .selector.pseudostate = color: var(--code-selector-pseudostate); 
	& .selector.operator = color: var(--code-selector-operator); 
	& .selector.context = color: var(--code-selector-context) 
	& .style.start-operator = color: var(--code-delimiter-operator); 

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

	css &
		font-family: var(--code-font)
		color: var(--code-color)
		& .code-head = display: none

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
			l:rel block p:5 6 radius:1 font-size:13px
			color:$code-color bg:$code-bg-lighter
			white-space:pre-wrap
		)>
			<div.(l:abs top:1 right:1)>
				<button.(px:2 t:bold blue400 t.hover:underline) @click.run> 'run'
			<code innerHTML=highlighted>

tag app-code-inline < app-code

	css &
		display: inline-block;
		font-size: 0.75em;
		border-radius: 3px;
		background: hsla(210, 7%, 31%, 0.06);
		-webkit-box-decoration-break: clone;
		vertical-align: middle;
		padding: 0.1em 5px;
		font-family: var(--code-font);