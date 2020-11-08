import { ImbaDocument,Monarch,highlight as imbaHighlight,M } from 'imba/program'

const cache = {}

const replacements = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
}

const typenames = {
	'[': 'square open'
	']': 'square close'
	'{': 'curly open'
	'}': 'curly close'
	'(': 'paren open'
	')': 'paren close'
}

def classify types
	types.join(' ').replace(/[\[\]\{\}\(\)]/g,do(m) typenames[m]).replace(/[^\w\- ]/g,'')

def escape str
	str.replace(/[\&\<\>]/g) do(m) replacements[m]

export def clean str
	str = str.replace(/^(~\w*[\[\|]?)?\t*[ ]+/gm) do(m) m.replace(/[ ]{4}/g,'\t')

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

		else
			let lines = str.split('\n')
			for line,i in lines
				tokens.push({type: 'white',value: '\n'}) if i > 0
				tokens.push({type: 'text', value: line, offset:0})
			
	else
		tokens = ImbaDocument.tmp(str).parse!

	###
	let html = imbaHighlight(tokens)
	out.html = html # parts.join('')
	out.options = out.flags
	out.flags = Object.keys(flags).join(' ')
	cache[str] = out
	return out
	###

	let parts = []
	let vref = 1

	let head = null
	let foot = null
	let ids = []
	let indent = 0

	for token,i in tokens
		let next = tokens[i + 1]
		if inject[token.offset]
			# console.log 'injecting now',token.offset,token.type,token.value,inject[token.offset]
			parts.push(inject[token.offset])
			delete inject[token.offset]

		# unless token.value
		#	console.log 'no value??',token

		let value = token.value or ''
		let end  = token.offset + value.length
		let types = token.type.split('.')
		let [typ,subtyp] = types
		if typenames[typ]
			[typ,subtyp] = typenames[typ].split(' ')

		let mods = token.mods
		let sym = token.symbol

		if sym and sym.scoped?
			let symkind = sym.semanticKind
			
			let id = ids.indexOf(sym)
			if id == -1
				id = ids.push(sym) - 1

			mods |= sym.semanticFlags
			types.push('__ref')
			types.push(symkind+'_')
			types.push('symbol--'+id)

		if mods
			for own k,v of M
				if k.match(/^[a-z]/) and mods & v
					types.push(k+'_')
					

		if subtyp == 'start' or subtyp == 'open'
			parts.push("<b class='{typ}'>")
			continue unless value

		if (subtyp == 'end' or subtyp == 'close') and !value
			parts.push('</b>')
			continue

		if typ == 'push'
			let kind = subtyp.indexOf('_') >= 0 ? 'group' : 'scope'
			let end = token.scope && token.scope.end
			parts.push("<b class='{kind}-{subtyp.split('_').pop!} _{subtyp} o{token.offset} e{end && end.offset}'>")
			continue
		elif typ == 'pop'
			parts.push("</b>")
			continue

		if typ == 'br'
			indent = 0

		if typ != 'white' and typ != 'line'
			value = "<span class='{classify types} o{token.offset}' data-rawtypes='{token.type}'>{escape(value or '')}</span>"
			# value = "<span class='{types.join(' ')}' data-offset={token.offset}>{escape(value)}</span>"
		elif typ == 'white'
			let val = ""
			let k = 0
			let ind = 0
			while value[k]
				let chr = value[k++]
				if chr == '\t'
					ind++
					val += "<span class='tab t{k - 1}'>{chr}</span>"
				else
					val += chr
			
			if ind
				indent = ind

			value = val
			# value = "<span data-offset={token.offset}>{value}</span>"

		# else
		#	value = "<span data-offset={token.offset}>{value}</span>"

		if typ == 'comment' and token.value == '# ---\n'
			if !head
				let prev = tokens[i - 1]
				let ind = indent
				parts.unshift("<div class='code-head ind{ind}'>")
				parts.push('</div>')
				head = token
				while ind > 0
					flags["ind{ind--}"] = yes

			elif !foot
				parts.push('<div class="code-foot">')
				foot = token
			# pop next token
			# try tokens[i + 1].value = ''
			continue

		parts.push(value)

		if inject[end] and (!next or typ != 'line')
			parts.push(inject[end])
			delete inject[end]
		
		if subtyp == 'end' or subtyp == 'close'
			parts.push('</b>')

	if foot
		parts.push('</div>')

	out.html = parts.join('')
	out.options = out.flags
	out.flags = Object.keys(flags).join(' ')
	cache[str] = out
	return out
	# return (<code.{Object.keys(flags).join(' ')} innerHTML=html>).outerHTML