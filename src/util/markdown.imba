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

var renderer = marked.Renderer.new
 
def renderer.link href, title, text
	if href.match(/scrimba\.com.*\/c/)
		return (<a.scrimba href=href title=title target='_blank'> <span> text)
	else
		return (<a href=href title=title> <span> text)

def renderer.heading text, level
	var next = this.parser.peek || {}
	var flags = ["md-h{level}"]
	var meta = {flags: flags, level: level, children: []}
	var m 

	while m = text.match(/^\.(\w+)/)
		flags.push(m[1])
		text = text.slice(m[0].length)

	var plain = text.replace(/\<[^\>]+\>/g,'')
	var slug = slugify(plain)

	meta.title = unescape(text)

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
	let node = <{typ} .{flags}> <span> text
	let pre = "<!--:{typ}:-->"
	
	return pre + node.toString()

	if level < 3
		var anchor = <div.toc-anchor .l{level} id=(meta.slug)>
		anchor.toString() + node.toString()
	else
		node.toString()

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
		<app-code-block.code.code-block data-lang=lang> escaped

export def render content
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

	# if object:title
	var toc = {level: 0, title: (object.title or "Doc"), children: [], slug: 'toc'}
	var tokens = marked.lexer(content)
	var parser = marked.Parser.new(opts, renderer)
	renderer.parser = parser
	renderer.toc = object.toc
	opts.parser = parser
	object.body = parser.parse(tokens)
	renderer.toc = null

	if object.meta.multipage
		let parts = object.body.split(/<!--:h1:-->/g)

		object.sections = object.toc.map do(item,i)
			{
				name: item.slug
				type: 'file'
				html: parts[i + 1]
				title: item.title
			}
	return object
