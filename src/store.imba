export const root = global['content.json']
export const files = []
export const paths = {}

window.paths = paths

export const fs = {}

const extToLanguage =
	js: 'javascript'
	html: 'html'

class Entry
	def constructor data, parent
		parent = parent		
		data = data
		name = data.name
		path = data.path or (parent ? parent.path + '/' + data.name : '/' + data.name)
		children = []
		paths[path] = self
		paths[path.replace(/\.(\w+)$/,'')] = self
		href = path

		if data.children
			self.children = data.children.map do
				let typ = $1.type == 'file' ? File : Folder
				let item = typ.new($1,self)
				if typ == Folder
					self[item.name] = item
				return item

	get title
		data.title or data.name

	get basename
		data.name.replace(/\.\w+$/,'')

	get folders
		self.children.filter(do $1 isa Folder)
	
	get files
		self.children.filter(do $1 isa File)

	get root
		_root ||= paths[path.split('/').slice(0,2).join('/')]

	def childByName name
		self.children.find(do $1.name == name)

export class File < Entry
	def constructor data, parent
		super
		body = data.body
		ext = data.ext or name.split('.').pop!
		uri = "file://{path}"
		href = path.replace(/\.(\w+)$/,'')
		files.push(self)
	
	get html
		data.html
	
	get sections
		data.sections 

	get model
		if global.monaco and !_model
			_model = global.monaco.editor.createModel(body,extToLanguage[ext] or ext,uri)
			_model.updateOptions(insertSpaces: false, tabSize: 4)
			_model.onDidChangeContent do
				body = _model.getValue!
				clearTimeout($send)
				$send = setTimeout(&,150) do sendToWorker!
		_model
	
	def overwrite body
		if body != self.body
			self.body = body
			if _model
				_model.setValue(body)
			sendToWorker!

	def sendToWorker
		sw.postMessage({event: 'file', path: path, body: body})

export class Folder < Entry
	prop examples

	def constructor data, parent
		super

	get sections
		files

	def ls path
		self

for item in root.children
	fs[item.name] = Folder.new(item)

const hits = {}
export def ls path
	unless hits[path]
		let parts = path.replace(/(^\/|\/$)/,'').split('/')
		let item = fs[parts.shift()]
		
		for part,i in parts
			let child = item.childByName(part)
			if child
				item = child
			else
				break
		hits[path] = item

	return paths[path.replace(/\/$/,'')]
