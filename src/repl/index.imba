import './monaco'
import { @watch } from '../decorators'
import {ls} from '../store'

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
	lineNumbers: false
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
	prop fs
	@watch prop project
	@watch prop currentFile
	@watch prop url

	get monaco
		return $monaco if !global.monaco or $monaco or !$editor
		$monaco = global.monaco.editor.create($editor,editorOptions)
		$monaco.updateOptions(editorOptions)
		$monaco.setModel(currentFile.model) if currentFile
		$monaco
	
	def build
		showing = no
		logs = []
		$iframe = <iframe.inset-0.absolute>
		$iframe.replify = do(win)
			logs = []
			let orig = win.console.log
			win.console.log = do(...params)
				logs.push(params)
				render!

	def run
		let index = project.childByName('index.html')
		url = `{project.path}/{index ? index.name : currentFile.basename + '.html'}`
		self

	def serialize
		global.sessionStorage.setItem('repl',currentFile and currentFile.path)

	def restore
		let path = global.sessionStorage.getItem('repl')
		if let file = (path && ls(path))
			currentFile = file
			show!

	def project-did-set project
		if project
			currentFile = project.files[0]
			run!

	def currentFile-did-set file
		if monaco and file
			monaco.setModel(file.model)
		project = file.parent
		serialize!

	def url-did-set url
		$iframe.src = `/repl{url}`

	def relayout
		if $monaco
			$monaco.layout(height: $editor.offsetHeight, width: $editor.offsetWidth)

	def awaken
		await yes
		restore!

	def hide
		showing = no
		global.sessionStorage.removeItem('repl')

	def show
		showing = yes

	def render
		<self.repl .hidden=!showing>
			<div.underlay.inset-0 :click.hide>
			<div.dark.editor-pane.pane :resize.relayout>
				<header>
					<.select.inline-flex.relative>
						<select[project]> for item in fs.examples.folders
							<option value=item> item.name
						
						<div.tab.folder> project and "{project.name} :" or "Browse..."
					<div.tabs.contents> for file in project..children
						<div.tab :click.{currentFile = file} .active=(currentFile == file)> <span> file.name
				<div$editor.editor>
			<div.result.pane.light>
				<div.pane.output.m-2>
					<header> <.tab> "Preview"
					<div.flex-1.relative> $iframe
				<div.divider>
				<div$console.pane.console>
					<header>
						<.tab> "Console"
						<button @click=(logs = [])> 'Clear'
					<.content> for item in logs
						<div.log-item> item.join(", ")
	
	def rendered
		monaco


### css scoped

.repl {
	display: flex;
	flex-direction: row;
	z-index: 300;
	position: fixed;
	bottom: 0px;
	left: 40px;
	right: 40px;
	top: auto;
	height: 80vh;
	box-shadow: 0px 0px 100px 10px rgba(29, 29, 29, 0.29);
	padding: 0px;
	background: var(--code-bg-lighter);
	border-radius: 3px;
	padding-left: 3px;
	overflow: hidden;
}

select {
	-webkit-appearance: none;
	font-family: inherit;
	font-weight: inherit;
	font-size: inherit;
	color: inherit;
	background: transparent;
	position: absolute;	
	top: 0px;
	left: 0px;
	width: 100%;
	height: 100%;
	opacity: 0;
}

.dark {
	--bg: var(--code-bg-lighter);
	--tab-color: var(--gray-600);
	--tab-hover-color: var(--gray-400);
	--tab-active-color: var(--blue-300);
	--header-bg: transparent;
}

.light {
	--bg: white;
	--tab-color: var(--gray-600);
	--header-bg: rgba(14, 14, 14, 0.05);
	--header-bg: transparent;
}

.log-item {
	padding-left: 1rem;
}

.divider {
	display: block;
	height: 1px;
	background: rgba(0,0,0,0.2);
	margin: 0px 0px;
}

header {
	padding: 0px 0.5rem;
	flex: 0 0 36px;
	color: var(--tab-color);
	font-size: 14px;
	align-items: center;
	background-color: var(--header-bg);
	display: flex;
	flex-direction: row;
	font-weight: 500;
}

iframe {
	width: 100%;
	height: 100%;
}

.tab {
	border-color: transparent;
	cursor: default;
	color: var(--tab-color);
	font-weight: 500;
	transition: all 0.1s ease-in-out;
	padding: 0.25rem 0.5rem;
}
.tab:hover {
	color: var(--tab-hover-color);
}

.tab.active {
	color: var(--tab-active-color);
	border-color: currentColor;
}

.tab span {
	border-bottom: 1px solid;
	border-bottom-color: inherit;
}

.folder {
	color: white;
}

.underlay {
	position: fixed;
	z-index: -1;
	background: white;
	opacity: 0;
}

.editor-pane {
	background: var(--code-bg-lighter);
}

.hidden {
	display: none;
}

.empty {
	display: none;
}

.pane {
	flex: 1 1 50%;
	display: flex;
	flex-direction: column;
	background: var(--bg);
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

.console {
	flex: 0 0 30%;
}

.output {
	flex: 0 0 70%;
}

###