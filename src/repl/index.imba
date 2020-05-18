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
		$iframe = <iframe.inset-0.absolute .(position:absolute width:100% height:100%)>
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

	css header = p:3 height:12 color:gray600 d:flex ai:center fs:sm fw:500
	css .tab = py:1 px:2 color.hover:gray500 color.is-active:blue300 text-decoration.is-active:underline
	css .underlay = l:fixed inset:0 z-index:-1 bg:hsla(214,35%,83%,0.6)

	def render
		<self.repl .(l:fixed flex clip inset:20 z-index:2000 radius:2 shadow:xl) .(d:none)=!showing>
			<div.underlay @click=hide @wheel.stop.prevent>
			<div.(l:vflex rel flex:70% bg:#29313f) @resize=relayout>
				<header.(color:gray600)>
					<div.(d:contents cursor:default)> for file in project..children
						<div.tab @click=(currentFile = file) .active=(currentFile == file)> <span> file.name

				<div$editor.(l:abs inset:12 0 0)>

			<div.(l:vflex flex:1 1 30% bg:white)>
				<div.(l:vflex flex:1)>
					<header.(bg:gray200)> <.title> "Preview"
					<div.(l:rel flex:1)> $iframe
				<div.divider>
				<div$console.(flex-basis:40% l:vflex)>
					<header.(bg:gray200)>
						<.title.(grow:1)> "Console"
						<button @click=(logs = [])> 'Clear'
					<.content.(flex:1)> for item in logs
						<div.log-item> item.join(", ")
	
	def rendered
		monaco