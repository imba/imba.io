import './monaco'

const extToLanguage =
	js: 'javascript'
	html: 'html'

const editorOptions = {
	scrollBeyondLastLine: false
	readOnly: false
	theme: "vs-dark"
	minimap: {enabled: false}
	renderLineHighlight: 'none'
	renderIndentGuides: false
	scrollbar: {
		useShadows: false
		verticalScrollbarSize: 8
		horizontalScrollbarSize: 8
	}
}

class File

	def constructor data
		data = data
		name = data.name
		body = data.body

	get uri
		"file://{data.path}"

	get ext
		_ext ||= name.split('.').pop!
	
	get model
		global.monaco and (_model ||= global.monaco.editor.createModel(data.body,extToLanguage[ext] or ext,uri) )

tag repl-editor

	def init
		console.log 'initing monaco!'
		let model = {value: '[1,2,3]', language: 'javascript'}
		monaco = global.monaco.editor.create(self,editorOptions)
		monaco.updateOptions(editorOptions)
		monaco.setModel(_model) if _model
	
	def render
		# how is this called twice?!
		if global.monaco and !monaco
			self.render = do yes
			init!

	set model model
		_model = model
		if monaco and model
			monaco.setModel(model)


tag repl-output

tag repl-root
	prop project
	prop files
	prop currentFile
	
	def setup
		iframe = <iframe>

	def run
		console.log 'run',project
		iframe.src = `/playground{project.path}/index.html`
		self

	def render
		<self.repl>
			<div.editor.pane>
				<div.tabs> for file in project..children
					<a.tab :click.{currentFile = file}> file.name
				<repl-editor model=(currentFile and currentFile.model)>
			<div.result.pane>
				<div.output> iframe
				<div.console>
					<button :click.{run!}> "Run"

### css scoped

.repl {
	display: flex;
	flex-direction: row;
	min-width: 500px;
	min-height: 500px;
	border: 1px solid red;
}

.tabs {
	flex: 0;
}

.pane {
	flex: 1 1 50%;
	border: 1px solid red;
	display: flex;
	flex-direction: column;
}

.editor.pane {
	flex-basis: 80%;
}

.output {
	flex: 1 1 80%;
}

.output iframe {
	position: relative;
	width: 100%;
	height: 100%;
	border: none;
}

repl-editor {
	display: block;
	flex: 1;
}

###