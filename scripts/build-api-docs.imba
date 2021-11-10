import np from 'path'
import nfs from 'fs'

import * as ts from 'typescript/lib/tsserverlibrary'
import imba-plugin from 'typescript-imba-plugin'
import {SymbolFlags} from '../src/util/flags'

import marked from 'marked'

const mdrenderer = new marked.Renderer
let codeblocknr = 0
let mdstate = {}

def mdrenderer.code code, lang, opts = {}
	
	let escaped = code.replace(/\</g,'&lt;').replace(/\>/g,'&gt;')
	let nr = ++codeblocknr
	return String(<app-code-block data-path="/docs"> <code data-name="{nr}.imba" data-lang=lang> escaped)

def mdrenderer.codespan code
	let m
	let o = {}
	
	if m = code.match(/^(\@\w+)$/)
		o.kind = 'event'
	elif m = code.match(/^(\@\w+)\.([\w\-]+)$/)
		o.kind = 'eventmodifier'
		
	if o.kind
		return String(<api-link name=code> code)

	let escaped = code.replace(/\</g,'&lt;').replace(/\>/g,'&gt;')
	return String(<app-code-inline data-lang='unknown'> escaped)

def mdrenderer.heading text, level
	mdstate[text] = yes
	return "<h{level}>{text}</h{level}>"
	
def toMarkdown str, meta
	mdstate = meta or {}
	marked(str,{renderer: mdrenderer})


###
export interface Logger {
        close(): void;
        hasLevel(level: LogLevel): boolean;
        loggingEnabled(): boolean;
        perftrc(s: string): void;
        info(s: string): void;
        startGroup(): void;
        endGroup(): void;
        msg(s: string, type?: Msg): void;
        getLogFileName(): string | undefined;
    }
###
class Logger
	def close
		yes
		
	def hasLevel lebel
		yes
		
	def loggingEnabled
		yes
		
	def perftrc
		yes
		
	def info str
		console.log str
	
	def startGroup
		console.group()
	
	def endGroup
		console.groupEnd()
		
	def msg str, type = null
		console.log str
	
	def getLogFileName
		undefined

let old = ts.sys.require
ts.sys.require = do(initialPath\string, moduleName\string)

	if moduleName == 'typescript-imba-plugin'
		return {module: imba-plugin}
	
	old.apply(ts.sys,arguments)

# use the local imba version?
global.IMBA_TYPINGS_DIR = np.resolve(__dirname,'..','node_modules','imba','typings')
# global.IMBA_TYPINGS_DIR = np.resolve(__dirname,'..','..','typings')

let options = {
	host: ts.sys
	logger: new Logger
	globalPlugins: ['typescript-imba-plugin']
	LanguageServiceMode: ts.LanguageServiceMode.Semantic
}

console.log options.pluginProbeLocations

let project = new ts.server.ProjectService(options)
let root = np.resolve(__dirname)
let abs = do(...parts) np.resolve(__dirname,'docs',...parts)
	
console.log root
project.openClientFile(abs('index.imba'))
console.log !!global.ils

# now go through and generate stuff?
let script = global.ils.getImbaScript('index.imba')
let checker = script.getTypeChecker!

def getFileName node
	return '' unless node
	if node.fileName
		return node.fileName
	if node.parent
		return getFileName(node.parent)
		
def write name, data
	# let dest = np.resolve(__dirname,'..','..','imba.io','public',name + '.json')
	let tpl = 'globalThis.$api$ = function(_){\nCONTENT\n}'

	let dest = np.resolve(__dirname,'..','public',name + '.json')
	let body = JSON.stringify(data,null,2)
	nfs.writeFileSync(dest,body,'utf8')

def getDocs item,meta
	let raw = item.getDocumentationComment(checker.checker)
	let md = ''
	let docs = raw.map do(item)
		let text = item.text
		md += item.text
		return item
	
	# remove mdn reference for css props
	md = md.replace(/\[MDN Reference\].*\)/,'').trim!

	if md == ''
		return ''
	
	return toMarkdown(md,meta)


def getMeta sym
	let tags = sym.imbaTags
	tags.desc = getDocs(sym)
	return tags
	


let globalSym = checker.resolve('globalThis')

let counter = 0
const allEntries = []

def log sym
	for own k,v of sym
		console.log k,v

const extras = {
	"CSSStyleDeclaration": {shallow: yes}
	DocumentAndElementEventHandlers: {shallow: yes}
	GlobalEventHandlers: {shallow: yes}
}


class Entry

	static def for symbol\(ts.Symbol)
		symbol = checker.checker.getMergedSymbol(symbol)

		if symbol.#entry
			return symbol.#entry

		if symbol.flags & ts.SymbolFlags.Transient
			let other = checker.type(symbol).symbol
			console.warn "TRANSIENT {symbol.imbaName}"

		symbol.#entry ||= new self(symbol)

	static def member symbol\(ts.Symbol),par
		let item = self.for(symbol)
		item.up = par if par
		return item

	parent = null
	name
	kind = null
	basetype = null
	flags = 0
	tags
	meta = {}
	docs

	constructor symbol
		symbol.#entry = self
		#symbol = symbol
		#key = Symbol!
		setup!

	def setup
		let sym = #symbol
		let typ = checker.type(sym,yes)
		# console.log "setup {sym.imbaName}",!!sym.parent,sym.parent..imbaName,sym.mergeId
		# typid = typ and typ.#typid ||= counter++
		flags = sym.flags
		flags ~= ts.SymbolFlags.Transient
		name = sym.imbaName
		meta = getMeta(sym)

		let extra = extras[name] or {}

		# if name == '__type'
		# 	return
		
		parent = sym == globalSym ? null : Entry.for(sym.parent or globalSym)
		
		let d = getDocs(typ and typ.symbol or sym,meta)

		let iface = flags & (32 | 64)

		let base = iface and typ ? checker.checker.getBaseTypes(typ) : []
		if base[0]
			basetype = Entry.for(base[0].symbol)
			implements = base.slice(1).map do Entry.for($1.symbol)

		if checker.member(typ,'stopImmediatePropagation') or name == 'ImbaTouch'
			kind = 'eventinterface'

		
		if name[0] == '@'
			kind = 'modifier'
			flags = SymbolFlags.Modifier

		if sym.#kind == 'event'
			kind = 'event'
			

		id = allEntries.push(self)

		if typ and typ.symbol and typ.symbol != sym
			# interface or something?
			if typ.symbol.flags & (32 | 64)
				valuetype = Entry.for(typ.symbol)

		if sym == globalSym
			return self

		if extra.shallow
			return self

		# not for the namespaces?
		let props = checker.props(checker.member(sym,'prototype'))

		for set in [sym.members,sym.exports]

			for [mname,member] of set
				# console.log mname
				continue if mname == 'prototype'
			
				let imbalib? = !!getFileName(member.valueDeclaration).match(/typings/)
				let meta = getMeta(member)

				if meta.desc or meta.summary or !imbalib?
					Entry.for(member)

		return self

		console.log "loop over props for {name}"
		for item in props
			if item.imbaName == 'prototype'
				continue
			
			let par = checker.checker.getMergedSymbol(item.parent)


			# add duplicate entries for the different types
			Entry.for(item)

		return self

	def stringify data,ctx = [],root = no

		if data isa Entry and !data.id
			return null

		if data isa Entry and !root
			if ctx[data.#key] =? yes
				ctx.push( stringify(data,ctx,yes) )
			
			return "s[{data.id}]"
			
		if data isa Array
			return "[{data.map(do stringify($1,ctx)).join(',')}]"

		if typeof data == 'object'
			let o = []
			for own k,v of data
				unless v == null
					o.push "{k}:{stringify(v,ctx)}"

			let raw = "\{{o.join(',')}\}"

			return data isa Entry ? "s[{data.id}]=a({raw})" : raw
		
		if typeof data == 'string'
			return JSON.stringify(data)
		
		return data

let globalEntry = Entry.for(globalSym)

def serialize entries = allEntries
	let out = 'globalThis.$api = function(s,a){\n return ['

	let ctx = []

	for item in entries
		item.stringify(item,ctx)

	out += ctx.join(',\n') + ']}'
	console.log out
	return out


if true
	let arr = checker.sym('Array')
	let sch = checker.sym('imba.Scheduler')
	let inc = ['UIEvent','imba.Scheduler','imba.Component','ImbaIntersectEvent','ImbaHotkeyEvent','ImbaResizeEvent','ImbaTouch','ImbaEvents']
	# console.log arr.parent.escapedName
	# inc = ['imba.Component']

	let events = checker.props('ImbaEvents')
	for ev in events
		ev.#kind = 'event'

	for ref in inc
		Entry.for(checker.sym(ref))

	let js = serialize(allEntries)
	let dest = np.resolve(__dirname,'..','public','reference.js')
	nfs.writeFileSync(dest,js,'utf8')

process.exit(0)