import { ImbaDocument,Monarch } from 'imba-document'

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

export def highlight str,lang
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
		lines.shift!.replace(/~(\w+)(?:\=([^\s]+))?/g) do(m,flag,val) flags[flag] = val or yes

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
	let head = null
	let foot = null

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
			if !head
				parts.unshift('<div class="code-head">')
				parts.push('</div>')
				head = token
			elif !foot
				parts.push('<div class="code-foot">')
				foot = token

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

	if foot
		parts.push('</div>')

	out.html = parts.join('')
	out.options = out.flags
	out.flags = Object.keys(flags).join(' ')
	cache[str] = out
	return out
	# return (<code.{Object.keys(flags).join(' ')} innerHTML=html>).outerHTML