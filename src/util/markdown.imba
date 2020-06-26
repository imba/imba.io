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

var slugify = do(str)
	str = str.replace(/^\s+|\s+$/g, '').toLowerCase() # trim
	var from = "àáäâåèéëêìíïîòóöôùúüûñç·/_,:;"
	var to   = "aaaaaeeeeiiiioooouuuunc------"
	str = str.replace(/[^a-z0-9 -]/g, '') # remove invalid chars
	str = str.replace(/\s+/g, '-') # collapse whitespace and replace by -
	str = str.replace(/-+/g, '-') # collapse dashes
	return str

var unescape = do(code)
	code = code.replace(/\&#39;/g,"'")
	code = code.replace(/\&quot;/g,'"')
	code = code.replace(/\&lt;/g,"<")
	code = code.replace(/\&gt;/g,">")
	code = code.replace(/\&amp;/g,"&")
	return code

var renderer = new marked.Renderer
 
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

def renderer.heading text, level
	var next = this.parser.peek || {}
	var flags = ["md-h{level}"]
	var meta = {flags: flags, level: level, children: [], meta: {}}
	var m 

	while m = text.match(/^\.(\w+)/)
		flags.push(m[1])
		text = text.slice(m[0].length)

	text = text.replace(/\s*\[(\w+)\]\s*/g) do(m,key)
		let flag = key.toLowerCase!
		meta.meta[flag] = yes
		flags.push(flag)
		return ''

	var plain = text.replace(/\<[^\>]+\>/g,'')
	var slug = slugify(plain)
	meta.title = unescape(text)

	# flags.push("next-{next.type}")

	if next.type == 'code' and level == 4
		next.meta = meta
		return ''

	if text.indexOf('<code') == 0
		# should add code-flag?
		
		text = text.replace(/^\<code/,'<h'+level)
		text = text.replace('</code>','</h'+level+'>')
		return text

	var stack = this.toc.stack

	while stack.length and stack[stack.length - 1].level >= level
		var prev = stack.pop()

	var par = stack[stack.length - 1]
	
	while stack[slug]
		slug = slug + '-'
	
	stack[slug] = meta.slug = slug

	if level < 3
		if par
			par.children.push(meta)
		else
			this.toc.push(meta)

	stack.push(meta)

	let typ = "h{level}"
	let node = <{typ} .{flags.join(' ')}> <span innerHTML=text>
	let pre = "<!--:{typ}:-->"
	return pre + node.toString()

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

	if opts.inline
		<app-code-inline.code.code-inline.light data-lang=lang> escaped
	else
		let path = this.toc.path.replace(/\.md$/g,'') + "_{++this.toc.counter}.imba"
		<app-code-block.code.code-block data-lang=lang data-path=path> escaped

def renderer.table header, body

	let title = header.slice(header.indexOf('<th>') + 4,header.indexOf('</th>'))
	body = body.replace(/td><embedded-app-example/g,'td class="example"><embedded-app-example')

	let out = <table data-title=title>
		<thead> '$HEADER$'
		<tbody> '$BODY$'

	return out.toString().replace('$HEADER$',header).replace('$BODY$',body)

export def render content, o = {}
	var object = {toString: (do this.body), toc: [],meta: {}}

	content = content.replace(/^---\n([^]+)\n---/m) do(m,inside)
		inside.split('\n').map do |line|
			var [k,v] = line.split(/\s*\:\s*/)
			object.meta[k] = (/^\d+$/).test(v) ? parseFloat(v) : v
		return ''

	var opts = {
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
	var tokens = marked.lexer(content)
	var parser = new marked.Parser(opts, renderer)
	renderer.parser = parser
	renderer.toc = object.toc
	opts.parser = parser
	object.body = parser.parse(tokens)

	console.log 'toc',object.toc.map do String($1.title)
	unless object.meta.title
		if let h1 = object.toc[0]
			object.meta.title = h1.title

	renderer.toc = null

	let sections = object.body.split(/<!--:h1:-->/g).slice(1)
	
	if object.meta.multipage or sections.length > 1

		object.sections = object.toc.map do(item,i)
			{
				name: item.slug
				type: 'file'
				html: sections[i]
				title: item.title
				meta: item.meta
			}

		if object.meta.multipage
			# should rather just be a core section for each part?
			object.body = ''

		else
			let intro = object.sections.shift!
			object.body = intro.html

	return object
