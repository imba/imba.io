import { @commit } from './decorators'
import {highlight} from './util/highlight'

export const raw = global['content.json']
export const files = []
export const paths = {}
export const groups = {}
export const types = {}

window.paths = paths

const extToLanguage =
	js: 'javascript'
	html: 'html'

class Entry
	
	@commit prop dirty
	@commit prop hasErrors

	def constructor data, parent
		dirty = no
		parent = parent
		data = data
		# Object.assign(self,data)
		name = data.name
		type = data.type
		kind = data.kind
		level = data.level
		meta = data.meta || {}
		html = data.html
		head = data.head
		desc = data.desc
		options = data.options or {}
		flags = data.flags || []
		flagstr = flags.join(' ')

		groups[type] ||= []
		groups[type].push(this)

		if data.children
			self.children = data.children.map do
				let typ = types[$1.type] or Entry
				let item = new typ($1,self)
				return item
	
	get path
		parent ? (parent.path + '/' + name) : ''

	get href
		path

	get title
		data.title or basename.replace(/\-/g,' ')

	get basename
		data.name.replace(/\.\w+$/,'')

	get folders
		self.children.filter(do $1 isa Dir)
	
	get files
		self.children.filter(do $1 isa File)
	
	get docs
		self.children.filter(do $1 isa Doc)

	get sections
		self.children.filter(do $1 isa Section)

	get prev
		return null unless parent
		prevSibling or parent.prev
		# parent.children[parent.children.indexOf(self) - 1] or (parent.html ? parent : (parent.prev and parent.prev.last))

	get next
		return null unless parent
		nextSibling or parent.next

	get prevSibling
		parent ? parent.children[parent.children.indexOf(self) - 1] : null

	get nextSibling
		parent ? parent.children[parent.children.indexOf(self) + 1] : null

	def childByName name
		self.children.find(do $1.name == name and !($1 isa Section))

export class File < Entry
	def constructor data, parent
		super
		body = originalBody = savedBody = data.body
		ext = data.ext or name.split('.').pop!
		uri = "file://{path}"
		# href = path.replace(/\.(\w+)$/,'')
		files.push(self)
	
	get highlighted
		hl ||= highlight(body,ext)

	get first
		children[0] and !html ? children[0].first : self

	get last
		children[children.length - 1] ? children[children.length - 1].last : self

	get model
		if global.monaco and !_model
			_model = global.monaco.editor.createModel(body,extToLanguage[ext] or ext,uri)
			_model.$file = self
			_model.updateOptions(insertSpaces: false, tabSize: 4)
			_model.onDidChangeContent do
				body = _model.getValue!
				dirty = body != savedBody
				clearTimeout($send)
				$send = setTimeout(&,150) do sendToWorker!
		_model

	def overwrite body
		if body != self.body
			self.body = body
			dirty = self.body != savedBody

			if _model
				_model.setValue(body)
			sendToWorker!

	def sendToWorker
		if sw and ext != 'md'
			# console.log 'sending file info to worker',path
			sw.postMessage({event: 'file', path: path, body: body})

	def save
		# try to save directly to filesystem
		if window.location.hostname == 'localhost'
			let payload = {path: data.fullPath,body:body}
			let headers = {'Accept': 'application/json','Content-Type': 'application/json'}
			let req = global.fetch('/save',method:'post',headers:headers, body: JSON.stringify(payload))
			let res = await req
			savedBody = body
	
		dirty = no

export class Doc < Entry

export class Guide < Entry

	get next
		null

	get prev
		null

export class Section < Entry

	get href
		"{parent.href}#{name}"

export class Dir < Entry
	prop examples

	def constructor data, parent
		super

	get sections
		files

	get first
		children[0] ? children[0].first : self

	get last
		children[children.length - 1] ? children[children.length - 1].last : self

	def ls path
		self

	get replUrl
		let index = childByName('index.html')
		let app = childByName('app.imba') or files[0]
		return `{path}/{index ? index.name : app.basename + '.html'}`

export class Root < Entry

		get path
			''

types.file = File
types.dir = Dir
types.doc = Doc
types.section = Section
types.guide = Guide

raw.name = ''

export const fs = new Root(raw)

window.FS = fs

const hits = {}

export def ls path
	unless hits[path]
		let parts = path.replace(/(^\/|\/$)/,'').split('/')
		let item = fs # fs[parts.shift()]
		return null unless item

		for part,i in parts
			let child = item.childByName(part)
			if child
				item = child
			else
				break
		hits[path] = item
	
	return hits[path]

	return paths[path.replace(/\/$/,'')]
