import { ImbaDocument,Monarch } from 'imba-document'

import * as sw from '../sw/controller'

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
	--code-constant: #8ab9ff # #d7bbeb;
	--code-background: #282c34;
	--code-bg-lighter: #29313f;
	--code-comment: #718096;
	--code-keyword: #ff9a8d; # #e88376;
	--code-operator: #ff9a8d;
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
	--code-type: #839fc7;
	--code-type-delimiter:#303F52;
	--code-property: #F7FAFC;
	--code-decorator: #63b3ed;
	--code-variable: #e8e6cb;
	--code-global-variable: #dcb9e4 # #ffc3c3;
	--code-root-variable: #d7bbeb;

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

	--code-key: #9dcbeb;

	# operators
	# --code-operator: #dee5f9
	--code-delimiter: #e3e3e3
	# --code-operator: #889cd6
	--code-delimiter-operator:#889cd6;

css .code
	tab-size: 4
	cursor:default
	& .invalid = color: red
	& .entity.other.inherited-tag = color: var(--code-entity); 
	& .entity.other.inherited-class = color: var(--code-entity); 
	& .invalid = color: red; 
	& .comment = color: var(--code-comment); 
	& .regexp = color: var(--code-regexp); 
	& .tag = color: var(--code-tag); 
	& .type = color: var(--code-type); 
	& .type.start = color: var(--code-type-delimiter); 
	& .entity.name.type = color: var(--code-entity); 
	& .keyword = color: var(--code-keyword);
	& .argparam = color: var(--code-keyword);
	& .delimiter = color: var(--code-delimiter);
	& .operator = color: var(--code-operator); 
	& .property = color: var(--code-property); 
	& .numeric = color: var(--code-numeric); 
	& .number = color: var(--code-numeric); 
	& .boolean = color: var(--code-boolean); 
	& .null = color: var(--code-null); 
	& .identifier = color: var(--code-identifier); 
	& .key = color: var(--code-key); 
	& .key + .operator = color: var(--code-key); 
	& .variable = color: var(--code-variable); 
	& .string = color: var(--code-string); 
	& .propname = color: var(--code-entity); 
	& .this = color: var(--code-this); 
	& .self = color: var(--code-this); 
	& .constant = color: var(--code-constant); 
	& .tag.reference = color: var(--code-tag-reference);
	& .tag.open = color: var(--code-tag-angle); 
	& .tag.close = color: var(--code-tag-angle); 
	& .tag.event = color: var(--code-tag-event); 
	& .tag.event-modifier = color: var(--code-tag-event); 
	# & .variable.scope_root = color: var(--code-root-variable); 
	& .constant.variable = color: var(--code-constant);
	& .variable.global = color: var(--code-global-variable);
	& .variable.imports = color: var(--code-global-variable);
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

	& span.operator.dot = color:var(--code-identifier)
	& span.region.more = display:none display.md:contents

	& .variable.highlight =
		bg:rgba(255, 253, 227, 0.11)
		box-shadow:0px 0px 0px 2px rgba(255, 253, 227, 0.11)
		border-radius:3px
		transition: all 0.15s

def escape str
	str.replace(/[\&\<\>]/g) do(m) replacements[m]

def highlight str,lang
	if cache[str]
		return cache[str]

	

	str = str.replace(/^\t*[ ]+/gm) do(m) m.replace(/[ ]{4}/g,'\t')
	let inject = {}
	let next
	while next = str.match(/(.*?)(\[###|###\])/)
		let offset = next[1].length
		inject[offset] = next[2][0] == '[' ? '<span class="region more">' : '</span>'
		str = str.slice(0,offset) + str.slice(offset + next[2].length)

	let tokens = []
	if lang != 'imba'
		if let tokenizer = Monarch.getTokenizer(lang)
			console.log 'found tokenizer',tokenizer
			let lines = str.split('\n')
			let state = tokenizer.getInitialState!

			for line,i in lines
				let lexed = tokenizer.tokenize(line,state,0)
				let count = lexed.tokens.length
				for tok,i in lexed.tokens
					if i == count - 1
						tok.value ||= line.slice(tok.offset)
					tokens.push(tok)
				tokens.push({type: 'white',value: '\n'})
				state = lexed.endState

			# tokens = tokenizer.tokenize(str,tokenizer.getInitialState!,0).tokens
	else
		tokens = ImbaDocument.tmp(str).getTokens()

	let parts = []
	let vref = 1

	for token,i in tokens

		# if inject[token.offset]
		#	parts.push(inject[token.offset])

		let value = token.value
		let types = token.type.split('.')
		let [typ,subtyp] = types
		
		if token.variable
			types = types.concat('variable')
			if token.variable != token
				types = types.concat token.variable.type.split('.')

			if token.variable.varscope
				types.push("scope_{token.variable.varscope.type}")
			if token.variable.modifiers
				types.push(...token.variable.modifiers)
			
			types = (type for type,i in types when types.indexOf(type) == i)

			let ref = token.variable.vref ||= vref++
			types.push("var{ref}")
			# console.log 'found varaible',token.variable

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
		l:rel block radius:1 font-size:13px
		color:$code-color bg:$code-bg-lighter
		t.not-md: 12px
		& .code-head = display: none

	css code
		display:block overflow-x:auto
		font-family: var(--code-font)
		white-space:pre p:3 4 p.md:5 6

	# css .output = bg:#2b2b2d

	css label
		bg:gray7 radius:2 l:abs flex center p:1

	css button = px:1 mx:1 t:gray6 medium radius:2 bg.hover:gray7-10 outline.focus:none
		@not-md & = mx:0 ml:1 bg:gray7-90 bg.hover:gray7-100 t:gray4
		&.active = bg:blue6 text:white

	css .tabs = d:flex radius:2

	prop tab = 'imba'
	prop lang

	def hydrate
		# console.log 'hydrating code block',outerHTML
		lang = dataset.lang
		plain = textContent.replace(/^\t*[ ]+/gm) do(m) m.replace(/[ ]{4}/g,'\t')
		if plain.indexOf('# light') >= 0
			flags.add('light')

		highlighted = highlight(plain,lang)
		innerHTML = '' # empty 

	def mount
		render!

	def run
		emit('run',{code: plain})

	def toggleJS
		console.log 'toggleJS',tab
		unless js
			let res = await sw.request(event: 'compile', body: plain, path: 'playground.imba')
			console.log 'result from serviceworker',res,plain
			js = res.js
			$compiled.innerHTML = highlight(res.js,'javascript')
			render!
		console.log 'got here!'
		tab = tab == 'js' ? 'imba' : 'js'
		console.log 'toggledJS',tab
		render!

		# flags.toggle('show-js')

	def pointerover e
		# console.log 'pointer over',e
		let vref = null
		if let el = e.target.closest('.variable')
			vref = el.className.split(/\s+/g).find do (/var\d+/).test($1)
		
		if vref != hlvar
			if hlvar
				el.classList.remove('highlight') for el in getElementsByClassName(hlvar)
			if vref
				el.classList.add('highlight') for el in getElementsByClassName(vref)
			hlvar = vref
			
	
	def render
		# console.log 'render code block',is-mounted,is-awakened,__f
		return unless highlighted

		<self @pointerover=pointerover>
			if lang == 'imba'
				<div.(l:abs top:2 right:2 top.not-md:-2 right.not-md:1)>
					<button .active=(tab == 'js') @click=toggleJS> 'js'
					<button @click=run> 'run'
			<code.source .(l:hidden)=(tab != 'imba') innerHTML=highlighted>
			<div.output.js .(l:hidden)=(tab != 'js')> <code$compiled>
			

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
