import './monaco'
import { @watch } from '../decorators'
import {ls, File, Folder} from '../store'

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
		examples = ls('/examples')
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

	def open item
		if item isa File
			currentFile = item
		elif item isa Folder
			project = item

	css header = p:2 3 d:flex ai:center t:sm 500 gray600
	css .tab = radius:2 py:1 px:2 t.hover:gray500 t.is-active:blue400
	css .dark .tab = bg.is-active:gray800 shadow.is-active:sm
	css .light .tab = t.hover:gray600 t.is-active:gray600 undecorated
	css .underlay = l:fixed inset:0 z-index:-1 bg:hsla(214,35%,83%,0.6) d.in-hidden:none

	css $sidebar
		bg:gray800 w:240px cursor:default l:rel block t:gray500

		&:after
			content: ' '
			bg: linear-gradient(gray800-0,gray800-100)
			l: block abs width: 90% height: 80px bottom: 0

		& .scroller
			-webkit-overflow-scrolling: touch
			l: abs scroll-y inset:0 pb:5

		& .item
			t:sm/1.3 gray600-70 500 capitalize t.hover:gray500
			p:1 7 l:block bg.hover:gray900-10
			&.active = bg:gray900-20 t:white bold

	css $back = t:blue400

	def render
		<self .hidden=!showing>
			<div.underlay @click=hide @wheel.stop.prevent>
			<div$sidebar>
				<.scroller>
					<div$back.(l:block p:3 5 t:sm 500 blue400 t.hover:underline) @click=hide> "⇦ back to site"
					<div.items> for child in examples.children
						<h5.(p:1 7 t:xs gray600 bold)> child.title.toUpperCase!
						<div.(pb:8)> for item in child.children
							<a.item @click=open(item) .active=(project == item)> item.title

			<div.dark.(l:vflex rel flex:70% bg:#29313f) @resize=relayout>
				<header.(color:gray600)>
					<div.(d:contents cursor:default)> for file in project..children
						<div.tab @click=open(file) .active=(currentFile == file)> <span> file.name

				<div$editor.(l:abs inset:12 0 0)>

			<div.light.(l:vflex flex:1 1 30% bg:white)>
				<div.(l:vflex flex:1)>
					<header.(bg:gray200)> <.tab.active> "Preview"
					<div.(l:rel flex:1)> <div$browserframe.(l:abs inset:0)> $iframe
				<div.divider>
				<div$console.(flex-basis:40% l:vflex)>
					<header.(bg:gray200)>
						<.tab.active.(flex-grow:1)> "Console"
						<button @click=(logs = [])> 'Clear'
					<.content.(flex:1)> for item in logs
						<div.log-item> item.join(", ")
	
	def rendered
		monaco