var marked = require 'marked'

marked.setOptions({
	gfm: true
	tables: true
	breaks: false
	pedantic: false
	sanitize: false
	smartLists: false
	smartypants: false
})

let state = {headings: [],last: null}

let slugmap = {
	'|': 'pipe'
	'=': 'eq'
	'&': 'and'
	'!': 'n'
	'?': 'q'
	'>': 'gt'
	'<': 'lt'
	'%': 'mod'
	'*': 'star'
	'/': 'slash'
	'^': 'up'
	'~': 'tilde'
}

let slugify = do(str)
	str = str.replace(/^\s+|\s+$/g, '').toLowerCase!.trim! # trim


	let from = "àáäâåèéëêìíïîòóöôùúüûñç·/_,:;"
	let to   = "aaaaaeeeeiiiioooouuuunc------"


	str = str.replace(/[\|\=\&\?\!\>\<\~\/\*\^\%]+/g) do
		$1.split('').map(do slugmap[$1]).join('-')
		# slugmap[$1] or '' # remove invalid chars
	str = str.replace(/[^a-z0-9 -]/g, '') # remove invalid chars
	str = str.replace(/\s+/g, '-') # collapse whitespace and replace by -
	str = str.replace(/-+/g, '-') # collapse dashes
	return str

let unescape = do(code)
	code = code.replace(/\&#39;/g,"'")
	code = code.replace(/\&quot;/g,'"')
	code = code.replace(/\&lt;/g,"<")
	code = code.replace(/\&gt;/g,">")
	code = code.replace(/\&amp;/g,"&")
	return code

let renderer = new marked.Renderer
 
def renderer.link href, title, text
	if href.match(/^\/.*\.md/)
		return (<embedded-app-document data-path=href>)
	elif href.match(/^\/examples\//) and text
		if (/Example/).test(text)
			return (<embedded-app-example data-path=href>)
		elif (/Code/).test(text)
			return (<app-code-block data-dir=href>)

	if href.match(/scrimba\.com.*\/c/)
		return (<a.scrimba href=href title=title target='_blank'> <span innerHTML=text>)
	return (<a href=href title=title> <span innerHTML=text>)

def renderer.blockquote quote
	return String(<blockquote innerHTML=quote>)

def renderer.paragraph text
	# state.last = text
	return String(<p innerHTML=text>)

def renderer.heading text, level
	let typ = "h{level}"
	let flags = [typ]
	let meta = {type: 'section', hlevel: level, flags: flags, level: level * 10, children: [], meta: {},options: {}}
	let m 

	state.last = meta

	if level == 6
		console.log 'FOUND LEVEL 6',text
		state.section.desc = text
		return ""

	while m = text.match(/^\.(\w+)/)
		flags.push(m[1])
		text = text.slice(m[0].length)

	text = text.replace(/\s*\[([\w\-]+)(?:\=([^\]]+))?\]\s*/g) do(m,key,value)
		let flag = key.toLowerCase!
		meta.options[flag] = value or yes
		flags.push(flag)

		if value
			let parts = value.split('+')
			# value = {}
			for part in parts when part.match(/^[\w\-]+$/)
				flags.push("{flag}-{part}")
				# value[part] = yes

		
		return ''

	if level == 1
		console.log 'heading',text

	if let n = text.match(/^-+\s/)
		meta.nesting = n[0].length
		meta.level += meta.nesting
		meta.type = 'doc'
		text = text.slice(n[0].length)

	let plain = text.replace(/\<[^\>]+\>/g,'')

	meta.slug = meta.options.slug or slugify(plain)
	meta.title = unescape(text)

	if text.indexOf('<code') == 0
		# should add code-flag?
		text = text.replace(/^\<code/,'<h'+level)
		text = text.replace('</code>','</h'+level+'>')
		return text

	state.headings.push(state.section = meta)

	let node = <{typ} .{flags.join(' ')}> <span innerHTML=text>
	meta.head = String(text)
	return "<!--:H:-->{String(node)}<!--:/H:-->"

def renderer.codespan code
	code = unescape(code)
	
	let lang = 'imba'
	if let m = code.match(/^(\w+)\$\s*/)
		lang = m[1]
		code = code.slice(m[0].length)
	elif code[0] == '>'
		lang = 'cli'
	elif code.indexOf('</') >= 0
		lang = 'html'

	self.code(code,lang, inline: yes)

def renderer.code code, lang, opts = {}
	let escaped = code.replace(/\</g,'&lt;').replace(/\>/g,'&gt;')
	let last = state.last

	let [type,name] = lang.split(' ')

	let parts = code.split(/^\~\~\~\~/m)
	let files = [{name: name, lang: type, code: parts[0]}]
	if parts.length > 1
		for part in parts.slice(1)
			let [start,...lines] = part.split('\n')
			let [lang,name] = start.split(' ')
			let code = lines.join('\n')
			files.push(start: start, name: name, lang: lang, code: code)
		# console.log "FOUND MULTIPLE FILES!!!",files

	if opts.inline
		<app-code-inline.code.code-inline.light data-lang=lang> escaped
	else
		# state.last = code
		let dir = this.toc.path.replace(/\.md$/g,'')
		let nr = ++this.toc.counter
		let path = dir + "_{nr}.imba"
		let meta = {}
		let flags = []

		if last and last.hlevel
			meta = JSON.parse(JSON.stringify(last.options))

		try
			let main = files[0].code
			let line = main.split('\n').find(do $1.match(/^# \[/)) or ''
			line = line.replace(/\[([\w\-]+)(?:\=([^\]]+))?\]\s*/g) do(m,key,value)
				let flag = key.toLowerCase!
				meta[flag] = value or yes
				flags.push(flag)

		<app-code-block.code.code-block data-meta=JSON.stringify(meta) data-path="{dir}/{nr}">
			for file in files
				<code data-name=file.name data-lang=file.lang> file.code.replace(/\</g,'&lt;').replace(/\>/g,'&gt;')
		# else
		#	<app-code-block.code.code-block data-lang=type data-name=name data-path=path data-meta=meta> escaped

def renderer.table header, body

	let title = header.slice(header.indexOf('<th>') + 4,header.indexOf('</th>'))
	body = body.replace(/td><embedded-app-example/g,'td class="example"><embedded-app-example')

	let out = <table data-title=title>
		<thead> '$HEADER$'
		<tbody> '$BODY$'

	return out.toString().replace('$HEADER$',header).replace('$BODY$',body)

export def render content, o = {}
	let object = {toString: (do this.body), toc: [],meta: {}}

	content = content.replace(/^---\n([^]+)\n---/m) do(m,inside)
		inside.split('\n').map do |line|
			var [k,v] = line.split(/\s*\:\s*/)
			object[k] = (/^\d+$/).test(v) ? parseFloat(v) : v

	content = content.replace(/\`\`\`(\n+)\`\`\`(?=\w+\s\w+\.)/g,'~~~~')

	state = {
		toc: object.toc
		headings: []
	}

	let opts = {
		gfm: true
		tables: true
		breaks: false
		pedantic: false
		sanitize: false
		smartLists: false
		smartypants: false
		renderer: renderer
	}

	object.toc.stack = []
	object.toc.counter = 0
	object.toc.options = o
	
	object.toc.path = o.path or ''
	# console.log 'sent path',o

	# if object:title
	let tokens = marked.lexer(content)
	let parser = new marked.Parser(opts, renderer)
	renderer.parser = parser
	renderer.toc = object.toc
	opts.parser = parser
	object.body = parser.parse(tokens)

	# console.log 'toc',object.toc.map do String($1.title)
	renderer.toc = null

	let segments = object.body.split(/<!--:H:-->.*?<!--:\/H:-->/g)

	let children = []
	let stack = []
	let sections = []
	object.level = 0
	object.children = []
	object.options = {}
	object.type
	let prev = object
	let intro = segments[0]

	for html,i in segments.slice(1)
		let up = prev
		let meta = state.headings[i]
		# meta.title,up && up.level
		let section = Object.assign({},meta,{children: []})
		let level = meta.level

		section.name = meta.slug
		section.html = html
		sections.push(section)

		while up.parent and level <= up.level
			up = up.parent

		section.parent = up

		if up == object
			section.type = 'doc'

		# if up.options.tabbed
		# 	if (level - up.level) < 11
		# 		section.type = 'doc'
		# 	else
		# 		console.log 'not tab??',level,up.level,section.name

		up.children.push(section)
		prev = section
		# console.log "{section.title}"

	let walk = do(section,pre = '')
		# console.log "{pre}{section.title} ({section.type} {section.level} {section.flags}) - {section.desc}"

		section.children = section.children.filter do !$1.options.skip

		for child in section.children
			walk(child,pre + '  ')	

	walk(object)

	if object.children.length > 1
		object.type = 'guide'

	delete object.toc

	for section in sections
		delete section.parent

	if object.children.length == 1
		# console.log 'children length is one!!',object.children[0]
		return object.children[0]

	return object