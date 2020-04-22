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
	hideCursorInOverviewRuler: true,
	lineNumbersMinChars: 3,
	fontSize: 13
	minimap: {enabled: false}
	renderLineHighlight: 'none'
	renderIndentGuides: false
	cursorBlinking: 'smooth'
	matchBrackets: 'never'
	codeLens: false
	detectIndentation: true,
	selectionHighlight: false,
	occurrencesHighlight: false,
	links: false,
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
		showing = no
		$iframe = <iframe>

	def run
		$iframe.src = `/repl{project.path}/index.html`
		self

	def project-did-set project
		if project
			currentFile = project.files[0]
			run!

	def current-file-did-set file
		if monaco and file
			monaco.setModel(file.model)

	def relayout
		if $monaco
			$monaco.layout(height: $editor.offsetHeight, width: $editor.offsetWidth)

	def hide
		showing = no

	def show
		showing = yes

	def render
		<self.repl .hidden=!showing>
			<div.underlay.inset-0 :click.hide>
			<div.editor-pane.pane :resize.relayout>
				<div.tabs.flex.flex-row.px-2.pb-1> for file in project..children
					<div.tab.px-2.py-1 :click.{currentFile = file} .active=(currentFile == file)> <span> file.name
				$editor = <div.editor>
			<div.result.pane>
				<div.output.m-2> $iframe
		monaco

### css scoped

.underlay {
	position: fixed;
	z-index: -1;
	background: white;
	opacity: 0;
}

.editor-pane {
	background: var(--code-bg-lighter);
}

.repl {
	display: flex;
	flex-direction: row;
	z-index: 100;
	position: fixed;
	bottom: 0px;
	left: 40px;
	right: 40px;
	top: auto;
	height: 80vh;
	max-height: 600px;
	box-shadow: 0px 0px 200px 0px #1d1d1d;
	padding: 6px;
	background: var(--code-bg-lighter);
	border-radius: 3px;
}

.hidden {
	display: none;
}

.empty {
	display: none;
}

.tabs {
	flex: 0;
	color: white;
	font-size: 14px;
}
.tab {
	border-color: transparent;
	cursor: default;
	color: var(--gray-600);
	font-weight: 500;
	transition: all 0.1s ease-in-out;
}
.tab:hover {
	color: var(--gray-400);
}

.tab.active {
	color: var(--blue-300);
	border-color: var(--blue-300);
}
.tab span {
	border-bottom: 1px solid;
	border-bottom-color: inherit;
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