import './monaco'
import { @watch } from '../decorators'

const editorOptions = {
	scrollBeyondLastLine: false
	readOnly: false
	theme: 'scrimba-dark'
	wordWrapColumn: 100
	wordWrap: 'wordWrapColumn'
	wrappingIndent: "same"
	fontIsMonospace: true
	fontSize: 13
	minimap: {enabled: false}
	renderLineHighlight: 'none'
	renderIndentGuides: false
	cursorBlinking: 'smooth'
	codeLens: false
	detectIndentation: true
	scrollbar: {
		useShadows: false
		verticalScrollbarSize: 8
		horizontalScrollbarSize: 8
	}
}

tag app-repl
	@watch prop project
	@watch prop currentFile

	get monaco
		return $monaco if !global.monaco or $monaco or !$editor
		$monaco = global.monaco.editor.create($editor,editorOptions)
		$monaco.updateOptions(editorOptions)
		$monaco.setModel(currentFile.model) if currentFile
		$monaco
	
	def build
		$iframe = <iframe>

	def run
		$iframe.src = `/playground{project.path}/index.html`
		self

	def project-did-set project
		if project
			run!
			currentFile = project.files[0]

	def current-file-did-set file
		if monaco and file
			monaco.setModel(file.model)

	def relayout
		if $monaco
			$monaco.layout(height: $editor.offsetHeight, width: $editor.offsetWidth)

	def render
		<self.repl>
			<div.editor-pane.pane :resize.relayout>
				<div.tabs.flex.flex-row> for file in project..children
					<div.tab.p-2 :click.{currentFile = file}> file.name
				$editor = <div.editor>
			<div.result.pane>
				<div.output.m-2> $iframe
		monaco

### css scoped

.repl {
	display: flex;
	flex-direction: row;
	min-width: 500px;
	min-height: 500px;
	background-color: #2d363b;
}

.tabs {
	flex: 0;
	color: white;
}

.pane {
	flex: 1 1 50%;
	display: flex;
	flex-direction: column;
}

.editor-pane {
	flex-basis: 80%;
	position: relative;
}

.output {
	flex: 1 1 80%;
	background-color: white;
}

.output iframe {
	position: relative;
	width: 100%;
	height: 100%;
	border: none;
}

.floating {
	border-radius: 3px;
}

.editor {
	display: block;
	flex: 1;
	position: relative;
}

.editor >>> .monaco-editor {
	position: absolute;
	top: 0px;
	left: 0px;
	bottom: 0px;
	right: 0px;
}

###