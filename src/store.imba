export const root = global['content.json']
export const files = []
export const paths = {}

const extToLanguage =
	js: 'javascript'
	html: 'html'

class Entry
	def constructor data
		data = data
		name = data.name
		path = data.path
		children = []
		paths[path] = self
		paths[path.replace(/\.(\w+)$/,'')] = self
		href = path

	get title
		data.title or data.name

	get parent
		_parent ||= paths[path.split('/').slice(0,-1).join('/')]

	get root
		_root ||= paths[path.split('/').slice(0,2).join('/')]

	def childByName filename
		self.children.find(do $1.name == filename)		

export class File < Entry
	def constructor data
		super
		body = data.body
		ext = data.ext or name.split('.').pop!
		uri = "file://{path}"
		href = path.replace(/\.(\w+)$/,'')		
	
	get html
		data.html

	get model
		if global.monaco and !_model
			_model = global.monaco.editor.createModel(body,extToLanguage[ext] or ext,uri)
			_model.onDidChangeContent do
				console.log 'file changed content!!',$1
				body = _model.getValue!
				sendToWorker!
		_model
		# global.monaco and (_model ||= global.monaco.editor.createModel(body,extToLanguage[ext] or ext,uri) )

	def sendToWorker
		sw.postMessage({event: 'file', path: path, body: body})

export class Folder < Entry
	prop examples

	def constructor data
		super
		self.files = []
		self.folders = []		
		self.children = data.children.map do
			let typ = $1.type == 'file' ? File : Folder
			let item = typ.new($1)

			if typ == File
				files.push(item)
				self.files.push(item)
			elif typ == Folder
				self[item.name] = item
				self.folders.push(item)

			item

	def ls path
		self

export const fs = Folder.new(root)

export def ls path
	return paths[path.replace(/\/$/,'')]
