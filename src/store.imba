export const root = global['content.json']
export const files = []

const extToLanguage =
	js: 'javascript'
	html: 'html'

class File
	def constructor data
		name = data.name
		path = data.path
		body = data.body
		ext  = name.split('.').pop!
		uri  = "file://{data.path}"

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

class Dir
	prop examples

	def constructor data
		name = data.name
		path = data.path
		self.files = []
		self.folders = []
		children = data.children.map do
			let typ = $1.type == 'file' ? File : Dir
			let item = typ.new($1)

			if typ == File
				files.push(item)
				self.files.push(item)
			elif typ == Dir
				self[item.name] = item
				self.folders.push(item)

			item

	def ls path
		self

export const fs = Dir.new(root)
