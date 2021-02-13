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
		specials: []
		highlights: []
	}
	
	str = str.replace(/^(~\w*[\[\|]?)?\t*[ ]+/gm) do(m) m.replace(/[ ]{4}/g,'\t')
	
	let flags = out.flags
	let lines = str.split('\n')
	let cites = {}

	# console.log 'lines',lines
	if lines[0].indexOf('# ~') == 0
		lines.shift!.replace(/~(\w+)(?:\=([^\s]+))?/g) do(m,flag,val) flags[flag] = val or yes
	
	if lines[0].indexOf('# [') == 0
		lines.shift! # .replace(/~(\w+)(?:\=([^\s]+))?/g) do(m,flag,val) flags[flag] = val or yes

	for line,i in lines
		# if line[0] == '~'
		#	console.log line,line.replace(/^(~\w*)\|(.*)$/,'$1[$2]~')
		lines[i] = line.replace(/^(~\w*)\|(.*)$/,'$1[$2]~')
		
	str = lines.join('\n')

	let inject = {}
	let next
	while next = str.match(/~(\w*)\[|\]~/)
		let offset = str.indexOf(next[0])
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

	if true
		let i = tokens.length
		while --i >= 0
			let token = tokens[i]
			if token.type == 'comment' and token.value[2] == '~'
				let [m,m1,body] = token.value.match(/# ~([^\~]+)~ (.+)/)
				let [pat,opts] = m1.split('|')
				let idx = str.indexOf(pat)
				let region = {pattern: pat, offset: idx, text:body, j:'top'}
				let col = 0
				if opts
					for item in opts.split('&')
						let [k,v] = item.split('=')
						region[k] = v or true
				
				out.highlights.unshift(region)
				cites[idx] ||= []
				cites[idx].push(region)
				token.skip = true
				# token.type = 'highlight'
				token.type = 'br'
				token.value = '\n'

				while idx and str[--idx] != '\n'
					col++

				region.col = col
				# tokens.splice(i,1) # remove from list

	let idrefs = 1
	for token,i in tokens
		let next = tokens[i + 1]
		if inject[token.offset]
			parts.push(inject[token.offset])
			delete inject[token.offset]

		if cites[token.offset]
			let val = token.value
			let fullVal = (token.scope && token.scope.value)
			for region in cites[token.offset]
				if !region.#token
					let pat = region.pattern
					let match = fullVal and fullVal.indexOf(pat) == 0 and pat.length >= (fullVal.length - 1)
					match ||= val and val == pat
					if match
						token.idRef ||= idrefs++
						region.sel = ".region-{token.idRef}"
						region.#token = token
			# MAP!

	let len = tokens.length

	while len > 0 and tokens[len - 1].type == 'br'
		# console.log 'dropped br!!',
		tokens.pop!
		len--

	for token,i in tokens
		let next = tokens[i + 1]
		if inject[token.offset]
			parts.push(inject[token.offset])
			delete inject[token.offset]

		# unless token.value
		#	console.log 'no value??',token

		let value = token.value or ''
		let end  = token.offset + value.length
		let types = token.type.split('.')
		let classNames = ''
		let [typ,subtyp] = types
		if typenames[typ]
			[typ,subtyp] = typenames[typ].split(' ')

		if token.idRef
			classNames += " region-{token.idRef}"

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
			parts.push("<b class='{typ}{classNames}'>")
			continue unless value

		if (subtyp == 'end' or subtyp == 'close') and !value
			parts.push('</b>')
			continue

		if typ == 'push'
			let kind = subtyp.indexOf('_') >= 0 ? 'group' : 'scope'
			let end = token.scope && token.scope.end
			let attrs = {}

			if subtyp == 'rule'
				let ruleval = token.scope.value
				if let m = ruleval.match(/^\.(demo-options|demo-[\w\-]+)/)
					classNames += ' ' + m[1] # .slice(5)
					out.flags['has-' + m[1]] = yes

			parts.push("<b class='{kind}-{subtyp.split('_').pop!} _{subtyp} o{token.offset} e{end && end.offset}{classNames}' typ='{subtyp}'>")
			continue
		elif typ == 'pop'
			parts.push("</b>")
			continue

		if typ == 'br'
			indent = 0

		if typ == 'comment'
			if value.match(/^\# ~/)
				continue

		if typ != 'white' and typ != 'line'
			let inner = escape(value or '')
			value = "<span class='{classify types} o{token.offset}{classNames}' data-rawtypes='{token.type}'>"
			value += inner
			value += '</span>'
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