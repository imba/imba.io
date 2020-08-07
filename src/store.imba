import { @commit } from './decorators'
import {highlight} from './util/highlight'

export const raw = global['content.json']
export const files = []
export const paths = {}
export const groups = {}
export const types = {}

window.paths = paths
window.files = files

let root = null
let counter = 1

const extToLanguage =
	js: 'javascript'
	html: 'html'

class Entry
	
	@commit prop dirty
	@commit prop hasErrors

	static def create data, parent
		let typ = types[data.type] or Entry
		let item = new typ($1,parent)
		if parent and parent.children
			parent.children.push(item)
		return item

	def constructor data, parent
		id = counter++
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
		else
			self.children = []
	
	get path
		parent ? (parent.path + '/' + name) : ''

	get href
		path

	get title
		data.title or basename.replace(/\-/g,' ')

	get basename
		data.name.replace(/\.\w+$/,'')

	get folders
		children.filter(do $1 isa Dir)
	
	get files
		children.filter(do $1 isa File)
	
	get docs
		children.filter(do $1 isa Doc)

	get sections
		children.filter(do $1 isa Section)

	get categories
		children.filter(do $1 isa Category)

	get prev
		return null unless parent
		prevSibling or parent.prev
		# parent.children[parent.children.indexOf(self) - 1] or (parent.html ? parent : (parent.prev and parent.prev.last))

	get next
		return null unless parent
		nextSibling or parent.next

	get tab?
		parent and parent.options.tabbed and type == 'doc'

	get prevSibling
		parent ? parent.children[parent.children.indexOf(self) - 1] : null

	get nextSibling
		parent ? parent.children[parent.children.indexOf(self) + 1] : null
	
	get currentTab
		$currentTab or docs[0]

	def childByName name
		children.find(do $1.name == name) #  and !($1 isa Section)

	def match filter
		if filter isa RegExp
			if sections and sections.some(do $1.match(filter) )
				return true

			return filter.test(flagstr)
		return true

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
				$send = setTimeout(&,150) do
					root.updateFile(self)
		_model

	def overwrite body
		if body != self.body
			self.body = body
			dirty = self.body != savedBody

			if _model
				_model.setValue(body)
			root.updateFile(self)

	def sendToWorker
		if ext != 'md'
			# console.log 'sending file info to worker',path
			root.updateFile(self)
			# .postMessage({event: 'file', path: path, body: body})

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
		path

	# get href
	#	"{parent.href}#{name}"

export class Category < Entry

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
		let parts = path.replace(/(^\/|\/$)/,'').split('/')
		let item = self # fs[parts.shift()]

		for part,i in parts
			if let child = item.childByName(part)
				parts[i] = item = child
			else
				break

		return parts
	
	def find path
		let parts = self.ls(path)
		let last = parts[parts.length - 1]
		if last isa Entry
			return last
		return null

	get replUrl
		let index = childByName('index.html')
		let app = childByName('app.imba') or files[0]
		return `{path}/{index ? index.name : app.basename + '.html'}`

export class Root < Dir
	service = null
	def constructor
		super

	def connectToWorker sw
		service = sw
		await service.ready
		service.addEventListener('message') do(e)
			if e.data isa Array
				let [action,params] = e.data
				let result = null
				if self[action]
					result = await self[action](...params)

				e.ports[0].postMessage(result)

	def rpc action, ...params
		new Promise do(resolve,reject)
			const channel = new MessageChannel
			channel.port1.onmessage = do(event) resolve(event.data)
			service.controller.postMessage([action,params], [channel.port2])

	def registerSession id
		console.log 'registerSession',id
		self
	
	def updateFile file
		let raw = {name: file.name, path: file.path, body: file.body}
		let result = await rpc('updateFile',raw)

		for frame of document.getElementsByTagName('iframe')
			try
				let map = frame.contentWindow.ImbaFiles
				if map and map[file.path]
					# console.log 'iframe depends on file!',frame.src
					frame.contentWindow.location.reload!
		return
				

	def resolvePath path
		console.log 'Root.readFile',path
		let alternatives = [path,path + '.imba',path + '/index.imba']
		for alt in alternatives
			let entry = find(alt)
			if entry
				return {name: entry.name, path: entry.path, body: entry.body}
		return null

	def register path, kind
		let entries = ls(path)
		# console.log 'entries!!',entries.slice(0),kind
		let last = entries[entries.length - 1]

		if last isa Entry
			return last

		for entry,i in entries
			let prev = entries[i - 1] or self

			if typeof entry == 'string'
				let data = {type: 'dir', name: entry}
				if i == entries.length - 1
					data.type = 'file'
					Object.assign(data,kind)
					yes
				
				entries[i] = Entry.create(data,prev)
		# console.log 'entries!!',entries
		return entries.pop!

	get path
		''

types.file = File
types.dir = Dir
types.doc = Doc
types.category = Category
types.section = Section
types.guide = Guide

raw.name = ''
root = new Root(raw)
export const fs = root


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
				return null
		hits[path] = item
	
	return hits[path]

	return paths[path.replace(/\/$/,'')]
