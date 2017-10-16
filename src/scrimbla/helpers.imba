

var KEYWORDS = 'var if elif else for while def in isa while until switch when then return class tag let do and or prop attr in prop'.split(' ')
var OPS = '+ - * / = ++ -- == === != !== > < >= <= & && | || or . : ?'.split(' ')

var WHITESPACE = /^[ \t\n]+$/

IM.HL =
	newline: "<b class='_imnewline'>\n</b>"
	space: do |m| "<b class='_imspace'>{m}</b>"
	tab: do |m| Array.new(m:length + 1).join("<b class='_imtab'>\t</b>")


import Region from './region'
import Highlighter from './core/highlighter'

var MATCHERS =
	keyword: do |v| KEYWORDS.indexOf(v) >= 0
	self: /^(this|self)$/
	const: do |v| (/^[A-Z][\w\_]*$/).test(v)
	ivar: do |v| (/^@[\w\_]+$/).test(v)
	bool: do |v| (/^(true|yes|false|no|null|undefined)$/).test(v)
	identifier: /^[\$a-z_][\w\_\$]*(\-[\$\w\_]+)*$/
	float: /^\d+\.\d+$/
	int: /^\d+$/
	comment: /^\#([ \t][^\n]*)?$/

var MODES = 
	all: Object.keys(MATCHERS)

extend class String

	def repeat num
		return Array.new( num + 1 ).join( this )

	def ins str, region
		var text = self.toString
		if region == 'append'
			return text + str
		elif region == 'prepend'
			return "" + str + text
		elif region isa Region
			text.substr(0,region.start) + str + text.slice(region.end)

export def isWhitespace str
	WHITESPACE.test(str)

def IM.num val
	<imnum.number text=val>

def IM.tab
	<imtab text='\t'>

def IM.newline
	<imnewline text='\n'>

def IM.op val
	<imop.op text=val>


def IM.tok val
	return val if val and val.@dom
	return IM.parseWhitespace(val) if val.match(WHITESPACE)
	return IM.op(val) if OPS.indexOf(val) >= 0 # should use token directly
	# return IM.num(val) if val.match(/^\d+(\.\d+)?$/) # should use token directly
	<imtok text=val>

def IM.raw val, ctx
	return <imraw raw=val>

def IM.isWhitespace val
	WHITESPACE.test(val)

def IM.isOp val
	OPS.indexOf(val) >= 0

def IM.parseWhitespace text, rich = yes
	var hl = IM.HL

	text = text.replace(/(\n|[ ]+|[\t]+)/g) do |m,l|
		if l == '\n'
			hl:newline or '\n'
		elif l[0] == ' '
			hl:space isa Function ? hl.space(l) : l
		elif l[0] == '\t'
			hl:tab isa Function ? hl.tab(l) : l

	if rich and text.indexOf('<') >= 0
		return <imfragment> text

	return text

def IM.identify val, mode = 'all'
	var rules = MODES[mode]
	var res
	for name in rules
		var rule = MATCHERS[name]
		
		if rule isa Function
			res = rule(val,mode)
		elif rule isa RegExp
			res = rule.test(val)

		if res
			return res === yes ? name : res

	return null

def IM.parse code, context
	# decide if full?
	# console.log "parse code {code:length} {code.substr(0,20)}"
	return code unless typeof code == 'string'

	if WHITESPACE.test(code)
		return IM.parseWhitespace(code,no)

	var ws = code.match(/^([ \t]*)([^]*?)([ \t]*)$/) or ['','',code,'']
	var hl

	if ws[1] or ws[3]
		code = ws[2]

	var id = IM.identify(code)

	if id
		var typ = 'span'
		var cls = Highlighter.Mapping[id] or id # this is the issue, no?
		
		if cls isa Array
			typ = cls[0]
			cls = cls[1]

		cls = '_imtok ' + cls unless cls.match(/\b_[\w]/)
		# console.log 'parsed as type',id,cls
		hl = '<' + typ + ' class="'+cls+'">' + code + '</' + typ + '>'

	unless hl
		hl = Highlighter.highlight(code)

	if ws
		hl = IM.parseWhitespace(ws[1],no) + hl + IM.parseWhitespace(ws[3],no)
	if hl
		return hl
	else
		return code


def IM.textNodes root, mark = no
	# console.time('textNodes2')
	root = root.@dom or root
	var el
	var nodes = []
	var pos  = 0
	var walk = document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false)

	while el = walk.nextNode
		if mark
			var len = el:length
			el.@loc = pos
			pos += len
		nodes.push(el)
	return nodes
