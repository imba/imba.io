var marked = require 'marked'
var hljs = require 'highlight.js'

# import Router from './router'
var highlighter = require './highlighter'

var compiler = require 'imba/compiler'

hljs.configure
	classPrefix: ''
	
def slugify str
	str = str.replace(/^\s+|\s+$/g, '').toLowerCase # trim

	var from = "àáäâåèéëêìíïîòóöôùúüûñç·/_,:;"
	var to   = "aaaaaeeeeiiiioooouuuunc------"
	str = str.replace(/[^a-z0-9 -]/g, '') # remove invalid chars
	str = str.replace(/\s+/g, '-') # collapse whitespace and replace by -
	str = str.replace(/-+/g, '-') # collapse dashes

	return str

def unescape code
	code = code.replace(/\&#39;/g,"'")
	code = code.replace(/\&quot;/g,'"')
	code = code.replace(/\&lt;/g,"<")
	code = code.replace(/\&gt;/g,">")
	code = code.replace(/\&amp;/g,"&")
	return code

var renderer = marked.Renderer.new

def renderer.heading text, level
	var next = this:parser.peek || {}
	var flags = []
	var meta = {flags: flags, level: level, children: []}
	var m 

	while m = text.match(/^\.(\w+)/)
		flags.push(m[1])
		text = text.slice(m[0][:length])

	var plain = text.replace(/\<[^\>]+\>/g,'')
	var slug = slugify(plain)
	meta:title = unescape(text)

	if next:type == 'code' and level == 4
		next:meta = meta
		return ''

	if text.indexOf('<code') == 0
		# should add code-flag?
		text = text.replace(/^\<code/,'<h'+level)
		text = text.replace('</code>','</h'+level+'>')
		return text

	var stack = this:toc:stack

	while stack:length and stack[stack:length - 1][:level] >= level
		var prev = stack.pop

	var par = stack[stack:length - 1]
	
	while stack[slug]
		slug = slug + '-'
	
	stack[slug] = meta:slug = slug

	if level < 3
		if par
			par:children.push(meta)
		else
			this:toc.push(meta)

	stack.push(meta)

	var node = if level == 1
		<h1> <span html=text>
	elif level == 2
		<h2> <span html=text>
	elif level == 3
		<h3> <span html=text>
	elif level == 4
		<h4> <span html=text>
	elif level == 5
		<h5> <span html=text>


	node.dom:className = flags.join(' ')
	node

	if level < 3
		var anchor = <div.toc-anchor .{"l{level}"} id=(meta:slug)>
		anchor.toString + node.toString
	else
		node.toString

def renderer.codespan code
	code = unescape(code)

	let lang = 'imba'
	if let m = code.match(/^(\w+)\$\s*/)
		lang = m[1]
		code = code.slice(m[0]:length)
	elif code[0] == '>'
		lang = 'cli'
	elif code.indexOf('</') >= 0
		lang = 'html'

	self.code(code,lang, inline: yes)

def renderer.code code, lang, opts = {}
	# console.log 'renderer',lang,opts
	var tok = this:parser:token
	var conf = tok:meta or {}

	var lines = code.split('\n')

	if !lang
		if code[0] == '>'
			lang = 'cli'
		else
			lang = 'imba'

	var o = this:options

	if opts isa Object
		for own opt,val of opts
			conf[opt] = val

	if lang == 'imba'
		code = code.replace(/[ ]{4}/gm,'\t')
		let mode = lines:length > 1 ? 'full' : 'inline'

		var imba
		var js
		var analysis
		
		try
			js = compiler.compile(code,{target: 'web'})
			analysis = compiler.analyze(code,{target: 'web'})
		catch e
			console.log "error?!",e

		try
			if opts:inline
				imba = highlighter.highlight('imba',code,theme: false)
			else
				imba = highlighter.highlight('imba',code,decorate: yes)
			# also compile code to js
		catch e
			imba = code
			imba = imba.replace(/\</g,'&lt;').replace(/\>/g,'&gt;')

		if opts:inline
			return (<code.code.md.imba.inline html=imba>).toString
		elif tok:plain
			return (<code.plain.imba html=imba>).toString
			
		let dom = <div.snippet data-title=conf:title>
			<code.imba data-lang='imba' html=imba>
			<code.js data-lang='js' html=js.toString.replace(/\</g,'&lt;').replace(/\>/g,'&gt;')>

		return dom.toString

	if lang == 'js' or lang == 'javascript'
		try
			if opts:inline
				code = highlighter.highlight('js',code,theme: false)
			else
				code = highlighter.highlight('js',code,decorate: yes)
		catch e
			console.log "error",e
		# code = hljs.highlightAuto(code,['javascript'])[:value]
		
		return <div.snippet data-title=conf:title>
			<code.js data-lang='js' html=code>
	else
		code = code.replace(/\</g,'&lt;')
		code = code.replace(/\>/g,'&gt;')
		
	

	return (<code.code.md .{lang} .inline=(opts:inline)  html=code> code).toString

marked.setOptions
	gfm: true
	tables: true
	breaks: false
	pedantic: false
	sanitize: false
	smartLists: false
	smartypants: false
	# renderer: renderer

export def render content
	var object = {toString: (|v| this:body), toc: []}

	content = content.replace(/^---\n([^]+)\n---/m) do |m,inside|
		inside.split('\n').map do |line|
			var [k,v] = line.split(/\s*\:\s*/)
			object[k] = (/^\d+$/).test(v) ? parseFloat(v) : v
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

	object:toc:stack = []

	# if object:title
	var toc = {level: 0, title: (object:title or "Doc"), children: [], slug: 'toc'}
	# object:toc.push(toc)
	# object:toc:stack.push(toc)

	var tokens = marked.lexer(content)
	var parser = marked.Parser.new(opts, renderer)
	renderer:parser = parser
	renderer:toc = object:toc
	opts:parser = parser
	object:body = parser.parse(tokens)
	renderer:toc = null
	# renderer:parser = null
	return object
