import {highlight} from './util/highlight'

export const raw = global['content.json']
export const files = []
export const paths = {}
export const groups = {}
export const types = {}
import {api} from './api'

global.paths = paths
global.files = files

let root = null
let counter = 1

const extToLanguage =
	js: 'javascript'
	html: 'html'

class LocalsProxy
	static def for key, storage = global.localStorage
		new Proxy({},new self(key,storage)) 

	constructor key, storage
		ns = key
		storage = storage
		cache = {}

	def serialize val, key
		JSON.stringify(val)

	def deserialize val, key
		JSON.parse(val)

	def pathify key
		ns + ':' + key

	def get target, key
		if cache.hasOwnProperty(key)
			return cache[key]

		let path = pathify(key)
		let raw = storage.getItem(path)

		if raw != undefined
			return cache[key] = deserialize(raw,key)
		return undefined

	def set target, key, value
		let cached = cache[key]
		let path = pathify(key)
		let raw = storage.getItem(path)

		if cached != value
			if value == undefined
				storage.removeItem(path)
				delete cache[key]
			else
				storage.setItem(path,serialize(value,key))
			cache[key] = value
			# global.imba..commit!
		return yes

class Entry
	prop dirty @set imba.commit!
	prop hasErrors @set imba.commit!

	static def create data, parent
		let typ = types[data.type] or Entry
		let item = new typ($1,parent)
		if parent and parent.children
			parent.children.push(item)
		return item

	constructor data, parent
		id = counter++
		dirty = no
		parent = parent
		data = data
		body = ''
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
		flags = (data.flags || []).concat("entry-{id}")
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

	get locals
		#locals ||= LocalsProxy.for(path)

	get legend
		data.legend

	get elements
		document.getElementsByClassName("entry-{id}")
	
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

	get parts
		children.filter(do $1 isa Doc or $1 isa Section)

	get categories
		children.filter(do $1 isa Category)

	get descendants
		#descendants ||= children.reduce(&,[]) do
			$1.concat([$2]).concat($2.descendants)

	get parents
		#parents ||= parent.parents.concat(parent)
		
	get breadcrumb
		parents

	get prev
		return null unless parent
		prevSibling or parent.prev
		# parent.children[parent.children.indexOf(self) - 1] or (parent.html ? parent : (parent.prev and parent.prev.last))

	get next
		return null unless parent
		nextSibling or parent.next

	get tocTitle
		#tocTitle ||= data.title.replace(/\s*\(.*\)/g,'')
		
	get toc?
		options.toc or options["toc-pills"]
		
	get reference?
		parent and parent.name == 'reference'
		
	get pill?
		options.keyword or options.op or options['event-modifier'] or options.cssprop or options.cssvalue

	get prevSibling
		parent ? parent.children[parent.children.indexOf(self) - 1] : null

	get nextSibling
		parent ? parent.children[parent.children.indexOf(self) + 1] : null

	def childByName name
		children.find(do $1.name == name) #  and !($1 isa Section)

export class File < Entry
	
	static def temporary code,lang = 'imba'
		let data = {
			body: code
			name: "{counter++}.{lang}"
			children: []
			meta: {}
		}
		return new self(data,null)
		
	constructor data, parent
		super
		$send = null
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

	get replUrl
		if ext == 'imba'
			`{path}.html`
		else
			`{path}`

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
		
	get complexity
		body.length

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

export class Guide < Entry

	get parents
		#parents ||= []

	get next
		null

	get prev
		null

export class Markdown < Entry

	get searchText
		#searchText ||= if true
			(title + ' ' + legend or '').replace(/\-/g,'').toLowerCase!
		

	def match query
		if searchText.indexOf(query) >= 0
			return yes
		return no

export class Doc < Markdown

export class Section < Markdown
	
	get href
		#href ||= parent isa Section ? "{parent.href}-{name}" : "{parent.href}#{name}"

	get hash
		#hash ||= href.split('#')[1]

	# get href
	#	"{parent.href}#{name}"

export class Category < Entry

export class Dir < Entry
	prop examples

	constructor data, parent
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
		let app = childByName('app.imba') or self.files[0]

		if app and app.body
			if let m = app.body.match(/\.listen\((\d+)\)/)
				let src = new URL(global.location.href)
				src.port = m[1]
				src.pathname = '/'
				src.hash = ''
				return String(src)
		if !index and app
			return app.replUrl

		return `{path}/{index ? index.name : app.basename + '.html'}`

export class Root < Dir
	service = null
	
	get parents
		#parents ||= []

	def connectToWorker sw
		service = sw
		await service.ready
		service.addEventListener('message') do(e)
			if e.data.length
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
		
	def findExamplesFor query
		let cache = (#examples ||= {})
		let key = String(query)
		return cache[key] if cache[key]

		let items = []
		let dir = find('/examples/api')
		for item in dir.children
			if query isa RegExp
				continue unless item.body.match(query)
			else
				continue if item.body.indexOf(query) == -1
			items.push(item)

		return cache[key] = items
	
	def crawlExamples
		let dir = find('/examples/api')
		let items = dir.children.sort do(a,b) a.complexity > b.complexity ? 1 : -1
		for item in items
			for ref in item.meta.see
				let m
				if m = ref.match(/^(\@\w+)(?:\.([\w\-]+))?$/)
					if let ev = api.paths["/api/Element/{m[1]}"]
						ev.examples.add(item)
						ev.type.examples.add(item)
						
						if let mod = m[2] and ev and ev.modifiers.get("@{m[2]}")
							mod.examples.add(item)
			yes

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
export {api}

root.crawlExamples!

global.FS = fs
global.gr = groups

const hits = {}

export def find query, options = {}
	let matches = []
	let roots = options.roots or groups.guide
	for guide in roots
		for item in guide.descendants
			# continue unless item isa Doc or item isa Section
			if item.match(query,options)
				matches.push(item)
	return matches

export def ls path
	if api.paths[path]
		return api.paths[path]

	unless hits[path]
		let parts = path.replace(/(^\/|\/$)/g,'').split('/')
		let item = fs # fs[parts.shift()]
		return null unless item
		
		
		if parts[0] == 'api'
			let apidoc = api.entryForPath(path)
			if apidoc
				return apidoc

		for part,i in parts
			let child = item.childByName(part)
			if child
				item = child
			else
				return null
		hits[path] = item
	
	return hits[path]

	return paths[path.replace(/\/$/,'')]
