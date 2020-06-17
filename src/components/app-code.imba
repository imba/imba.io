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
	--code-global-variable: #ecd5f1; # #dcb9e4 # #ffc3c3;
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
	--code-style-value-scope: #eec49d;
	--code-style-value-size: #ff8c8c;
	--code-style-property: #e0ade3;
	--code-style-property-scope: #df8de4; # #e9e19b;
	--code-style-var: #ff93d0;
	--code-keyword-css: #fff7b6;
	--code-selector: #e9e19b;
	--code-selector-pseudostate: var(--code-selector);
	--code-selector-context: #eec49d;
	--code-selector-placeholder:hsl(321, 100%, 79%) # hsl(36, 100%, 72%);

	--code-key: #9dcbeb;

	# operators
	--code-delimiter: #e3e3e3
	--code-delimiter-operator:#889cd6

css .code
	tab-size: 4
	cursor:default
	& .invalid color: red
	& .entity.other.inherited-tag color: var(--code-entity); 
	& .entity.other.inherited-class color: var(--code-entity); 
	& .invalid color: red; 
	& .comment color: var(--code-comment); 
	& .regexp color: var(--code-regexp); 
	& .tag color: var(--code-tag); 
	& .type color: var(--code-type); 
	& .type.start color: var(--code-type-delimiter); 
	& .entity.name.type color: var(--code-entity); 
	& .keyword color: var(--code-keyword);
	& .argparam color: var(--code-keyword);
	& .delimiter color: var(--code-delimiter);
	& .operator color: var(--code-operator); 
	& .property color: var(--code-property); 
	& .numeric color: var(--code-numeric); 
	& .number color: var(--code-numeric); 
	& .boolean color: var(--code-boolean); 
	& .null color: var(--code-null); 
	& .identifier color: var(--code-identifier); 
	& .key color: var(--code-key); 
	& .key + .operator color: var(--code-key); 
	& .variable color: var(--code-variable); 
	& .string color: var(--code-string); 
	& .propname color: var(--code-entity); 
	& .this color: var(--code-this); 
	& .self color: var(--code-this); 
	& .constant color: var(--code-constant); 
	& .tag.reference color: var(--code-tag-reference);
	& .tag.open color: var(--code-tag-angle); 
	& .tag.close color: var(--code-tag-angle); 
	& .tag.event color: var(--code-tag-event); 
	& .tag.event-modifier color: var(--code-tag-event); 
	& .constant.variable color: var(--code-constant);
	& .variable.global color: var(--code-global-variable);
	& .variable.imports color: var(--code-global-variable);
	& .decorator color: var(--code-decorator); 
	# & .tag.flag.start opacity: 1;
	& .tag.flag.mixin@not(.start) color: var(--code-selector-placeholder)
	& .tag.rule-modifier color: var(--code-rule-mixin); 
	& .tag.rule-modifier.start opacity: 0.43; 
	& .tag.rule color: var(--code-rule); 
	& .style.open color: var(--code-style-bracket); 
	& .style.close color: var(--code-style-bracket); 
	& .style.args.open color: var(--code-style); 
	& .style.args.close color: var(--code-style); 
	& .style color: var(--code-style); 
	& .style.scope color: var(--code-style-scope); 
	& .selector color: var(--code-selector); 
	& .unit color: var(--code-style-unit); 
	& .style.delimiter color: var(--code-style-delimiter); 
	& .style.property color: var(--code-style-property); 
	& .style.property.scope color: var(--code-style-property-scope);
	& .style.value color: var(--code-style-value); 
	& .style.value.var color: var(--code-style-var);
	& .style.value.size color: var(--code-style-value-size); 
	& .style.value.scope color: var(--code-style-value-scope); 
	& .style.modifier color: var(--code-style-value-scope); 
	& .selector.pseudostate color: var(--code-selector-pseudostate); 
	& .selector.operator color: var(--code-selector-operator); 
	& .selector.context color: var(--code-selector-context) 
	& .selector.mixin color: var(--code-selector-placeholder)
	& .style.start-operator color: var(--code-delimiter-operator);
	& span.operator.dot color:var(--code-identifier)
	& span.region.more display:none display.md:contents

	& .variable.highlight
		bg:rgba(255, 253, 227, 0.11)
		box-shadow:0px 0px 0px 2px rgba(255, 253, 227, 0.11)
		border-radius:3px
		transition: all 0.15s

	& .region.hl2
		bg:rgba(0, 0, 0, 0.11)
		box-shadow:0px 0px 0px 2px rgba(0, 0, 0, 0.11)
		border-radius:3px
		transition: all 0.15s

	& .region is:rel

	& .region.arrow@before
		content: " "
		is:abs block
		size:16px
		bg: url('/images/arrow.svg')
		background-size: contain
		bottom:100% right:50% mr:-2px mb:-2px

	# css
	.css.attribute.name color:var(--code-style-property)
	.css.attribute.value color:var(--code-style-value)

def escape str
	str.replace(/[\&\<\>]/g) do(m) replacements[m]

def highlight str,lang
	if cache[str]
		return cache[str]

	# find flags at the top
	let out = {
		flags: {}
	}
	
	str = str.replace(/^(~\w*[\[\|]?)?\t*[ ]+/gm) do(m) m.replace(/[ ]{4}/g,'\t')
	
	let flags = out.flags
	let lines = str.split('\n')

	# console.log 'lines',lines
	if lines[0].indexOf('# ~') == 0
		lines.shift!.replace(/~(\w+)/g) do(m,flag) flags[flag] = yes

	for line,i in lines
		# if line[0] == '~'
		#	console.log line,line.replace(/^(~\w*)\|(.*)$/,'$1[$2]~')
		lines[i] = line.replace(/^(~\w*)\|(.*)$/,'$1[$2]~')
		
	str = lines.join('\n')

	let inject = {}
	let next
	while next = str.match(/~(\w*)\[|\]~/)
		let offset = str.indexOf(next[0])
		# let offset = next[1].length
		let open = next[0][0] == '~'
		let typ = next[1] or 'focus'

		if open			
			flags['has-regions'] = yes
			flags["has-{typ}"] = yes

		inject[offset] = open ? "<span class='region {typ}'>" : '</span>'
		str = str.slice(0,offset) + str.slice(offset + next[0].length)

	out.plain = str
	console.log inject

	let tokens = []
	if lang != 'imba'
		if let tokenizer = Monarch.getTokenizer(lang)
			# console.log 'found tokenizer',tokenizer
			let lines = str.split('\n')
			let state = tokenizer.getInitialState!

			for line,i in lines
				tokens.push({type: 'white',value: '\n'}) if i > 0

				let lexed = tokenizer.tokenize(line,state,0)
				let count = lexed.tokens.length
				for tok,i in lexed.tokens
					if i == count - 1
						tok.value ||= line.slice(tok.offset)
					tokens.push(tok)
				
				state = lexed.endState

			# tokens = tokenizer.tokenize(str,tokenizer.getInitialState!,0).tokens
	else
		tokens = ImbaDocument.tmp(str).getTokens()

	let parts = []
	let vref = 1

	let pairs = 
		'style.openz': 'style.close'
	
	let closers = []

	for token,i in tokens
		let next = tokens[i + 1]
		if inject[token.offset]
			# console.log 'injecting now',token.offset,token.type,token.value,inject[token.offset]
			parts.push(inject[token.offset])
			delete inject[token.offset]


		let value = token.value
		let end  = token.offset + value.length
		let types = token.type.split('.')
		let [typ,subtyp] = types

		if pairs[token.type]
			parts.push("<span class='_{typ}'>")
			closers.unshift(pairs[token.type])
		
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
		else
			value = "<span data-offset={token.offset}>{value}</span>"

		if typ == 'comment' and token.value == '# ---'
			parts.unshift('<div class="code-head">')
			parts.push('</div>')
			# pop next token
			try tokens[i + 1].value = ''
			continue

		parts.push(value)

		if inject[end] and (!next or typ != 'line')
			parts.push(inject[end])
			delete inject[end]

		if closers[0] and token.type == closers[0]
			parts.push('</span>')
			closers.shift!

	out.html = parts.join('')
	out.options = out.flags
	out.flags = Object.keys(flags).join(' ')
	cache[str] = out
	return out
	# return (<code.{Object.keys(flags).join(' ')} innerHTML=html>).outerHTML

tag app-code
	
	def awaken
		# get the code and highlight it
		self

	def render
		<self>


tag app-code-block < app-code

	css pos:relative d:block radius:1 fs:13px t@not-md: 12px

	css $code pos:relative d:block radius:1 c:$code-color bg:$code-bg-lighter
		.code-head display: none

	css code
		display:block overflow-x:auto
		font-family: var(--code-font)
		white-space:pre p:3 4 p.md:5 6

	css label
		bg:gray7 radius:2 pos:absolute d:flex ai:center p:1

	css button px:1 mx:1 c:gray6 fw:500 radius:2 bg@hover:gray7/10 outline@focus:none
		@not-md mx:0 ml:1 bg:gray7/90 bg@hover:gray7/100 c:gray4
		@is-active bg:blue6 c:white

	css .tabs d:flex radius:2

	css .nostyles ._style d:none
	# css code.has-regions > span:not(.region) = opacity: 0.4
	css code.has-focus > span@not(.focus)@not(._style) opacity: 0.6
	css code.has-hide span.hide d:none
	css &.shared d:none

	css code@hover.has-hl > span@not(.hl)@not(._style) opacity: 0.7
	css code span.region.hl pos:relative
		@before
			pos:absolute inset:0 m:-1 radius:3 b:1px dashed yellow7 content:' '
			box-shadow: 0px 0px 10px 2px rgba(42, 50, 63,0.7), inset 0px 0px 2px 2px rgba(42, 50, 63,0.7)
			rotate:-1deg

	css $preview
		h:260px d:flex fd:column bg:white position:relative
		mt:-1 b:gray3 bg:white radius:0 0 3px 3px
		box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.05) color:gray6 z-index:2
		header d:none

	prop tab = 'imba'
	prop lang
	prop options = {}

	def hydrate
		# console.log 'hydrating code block',outerHTML
		lang = dataset.lang
		dataset.path
		# plain = textContent # .replace(/^\t*[ ]+/gm) do(m) m.replace(/[ ]{4}/g,'\t')
		code = highlight(textContent,lang)
		innerHTML = '' # empty
		options.compile = !code.options.nojs and !code.plain.match(/^tag /m)
		options.run = !code.options.norun
		# options.preview = code.options.preview
		# options.path = "/examples/{Math.round(Math.random! * 10000)}"
		# options.src = "/examples/"
		# console.log 'returned with code',code
		if code.options.preview
			let file = {path: dataset.path, body: code.plain}
			options.preview = file
			# sw.postMessage({event: 'file', path: file.path, body: file.body})
			# setTimeout(&,200) do
			#	options.preview = file
			#	render!

	def mount
		render!

	def run
		let source = ""
		for item in parentNode.querySelectorAll('app-code-block.shared')
			source += item.code.plain + '\n'

		source += code.plain

		let lines = source.split('\n')
		let last = lines.reverse!.find do !$1.match(/^[\t\s]*$/) and $1[0] != '\t'
		if let m = (last and last.match(/^tag ([\w\-]+)/))
			source += "\n\nimba.mount <{m[1]}>"
		# console.log 'found last',last
		emit('run',{code: source})

	def toggleJS
		console.log 'toggleJS',tab
		unless js
			let res = await sw.request(event: 'compile', body: code.plain, path: 'playground.imba')
			console.log 'result from serviceworker',res
			js = res.js
			$compiled.innerHTML = highlight(res.js,'javascript').html
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
		return unless code

		<self.{code.flags} @pointerover=pointerover>
			<div$code[pos:relative]>
				if lang == 'imba'
					<div[pos:absolute top:-2 @md:2 right:1 @md:2]>
						if options.compile
							<button .active=(tab == 'js') @click=toggleJS> 'js'
						if options.run
							<button @click=run> 'run'

				<div$source.source .(d:none)=(tab != 'imba')> <code.{code.flags} innerHTML=code.html>
				<div.output.js .(d:none)=(tab != 'js')> <code$compiled>
			if options.preview
				<app-repl-preview$preview file=options.preview>
			

tag app-code-inline < app-code

	css &
		display: inline-block
		font-size: 0.75em
		border-radius: 3px
		background: hsla(210, 7%, 31%, 0.06)
		-webkit-box-decoration-break: clone
		vertical-align: middle
		padding: 0.1em 5px
		font-family: var(--code-font)


tag app-code-preview
	def render
		<self>
			<div> 'Preview'
			<div$container> <iframe$frame>