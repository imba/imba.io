import './monaco'
import { @watch } from '../decorators'
import {ls, File, Folder} from '../store'
import * as sw from '../sw/controller'

import './console'

const editorOptions = {
	scrollBeyondLastLine: false
	readOnly: false
	theme: 'scrimba-dark'
	wordWrapColumn: 100
	wordWrap: 'wordWrapColumn'
	wrappingIndent: "same"
	fontIsMonospace: true
	hideCursorInOverviewRuler: true,
	lineNumbersMinChars: 5,
	lineNumbers: true
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

tag app-repl-preview
	@watch prop url

	def build
		$iframe = <iframe.(position:absolute width:100% height:100%)>
		$iframe.replify = do(win)
			$win = win # $iframe.contentWindow
			$doc = $win.document

			let {log,info} = win.console.log
			if $console
				$console.context = win
				$console.native = win.console
				win.console.log = $console.log.bind($console)
				win.console.info = $console.info.bind($console)

		$iframe.onload = do
			try
				let element = $doc.querySelector('body :not(script)')
				flags.toggle('empty-preview',!element)

		if src
			$iframe.src = src

	def render
		<self>
			<header.(bg:gray2)> <.tab.active> "Preview"
			<div.(l:rel flex:1)> <div$frame.(l:abs inset:0)> $iframe
		
	set file data
		console.log 'did set file!',data
		sw.request(event: 'file', path: data.path, body: data.body).then do
			console.log 'returned from sw',data.path
			url = data.path.replace('.imba','.html')
		self

	def urlDidSet url, prev
		try
			$iframe.contentWindow.location.replace(`/repl{url}`)
		catch e
			sw.load!.then do $iframe.src = `/repl{url}`


tag app-repl
	prop fs
	@watch prop project
	@watch prop currentFile
	@watch prop url

	get monaco
		return $monaco if !global.monaco or $monaco or !$editor
		$monaco = global.monaco.editor.create($editor,Object.assign({},editorOptions,$options))
		$monaco.updateOptions(editorOptions)
		$monaco.setModel(currentFile.model) if currentFile
		relayout!
		$monaco
	
	def build
		examples = ls('/examples')
		$placeholder = self # for the router
		$options = {lineNumbers: true}

		$iframe = <iframe.(position:absolute width:100% height:100%)>
		$iframe.replify = do(win)
			$win = win # $iframe.contentWindow
			$doc = $win.document

			let {log,info} = win.console.log
			if $console
				$console.context = win
				$console.native = win.console
				win.console.log = $console.log.bind($console)
				win.console.info = $console.info.bind($console)

		$iframe.onload = do
			try
				let element = $doc.querySelector('body :not(script)')
				flags.toggle('empty-preview',!element)

		sw.on 'reload' do reload!
		self

	def reload
		$console.clear! if $console
		try $iframe.contentWindow.location.reload!

	def run
		let index = project.childByName('index.html')
		let app = project.childByName('app.imba') or currentFile
		$console.clear! if $console
		url = `{project.path}/{index ? index.name : app.basename + '.html'}`
		self

	def project-did-set project
		if project
			if (!currentFile or currentFile.parent != project)
				currentFile = project.files[0]
			run!

	def currentFile-did-set file
		if monaco and file
			monaco.setModel(file.model)

		project = file.parent
		if !project.childByName('index.html') and !project.childByName('app.imba')
			run!

	def url-did-set url
		try
			$iframe.contentWindow.location.replace(`/repl{url}`)
		catch e
			sw.load!.then do $iframe.src = `/repl{url}`

	def relayout
		let h = $editor.offsetHeight
		let w = $editor.offsetWidth
		let sln = w > 700

		if $monaco
			$monaco.layout(height: h, width: w)
			if sln != $options.lineNumbers
				$monaco.updateOptions(lineNumbers:sln )
			$options.lineNumbers = sln


	def leave
		document.body.focus!
		router.go($parent.doc.href)

	def routeDidResolve match, prev,last
		let item = ls(match.url)
		if item isa File
			currentFile = item
		elif item isa Folder
			if item.files[0]
				router.go(item.files[0].path)
				render!

	def show
		router.go(currentFile ? currentFile.path : '/examples/essentials/playground/app.imba')

	css bg:#29313f overscroll-behavior: contain l:flex clip
		$sidebar-width:200px pl:$sidebar-width
		header p:2 3 d:flex ai:center t:sm 500 gray6

	css .tab
		l:rel radius:2 py:1 px:2 t@hover:gray5 t@is-active:blue4
		.circ l:abs block radius:2 w:8px h:2px bg:transparent opacity:0.6 top:0
		&.active .circ bg:blue4 opacity:1
		&.dirty .circ bg:yellow4
		&.active.dirty color:yellow4
		&.errors .circ bg:red5
		&.active.errors color:red5

	css .dark .tab bg@is-active:gray8 shadow@is-active:sm bg@is-active@is-dirty:yellow4/5
	css .light .tab c@hover:gray6 c@is-active:gray6 td@is-active:none
	css .underlay l:fixed inset:0 zi:-1 bg:hsla(214,35%,83%,0.6) d@in-hidden:none

	css &.empty-preview
		$console flex-grow:1
		$preview display:none

	css $sidebar
		bg:gray8 w:$sidebar-width cursor:default l:abs block c:gray5
		top:0 left:0 height:100% zi:100
		transition: 250ms cubic

		@after
			content: ' '
			bg: linear-gradient(gray8/0,gray8)
			l:block abs width:90% height:80px bottom: 0

		.scroller
			-webkit-overflow-scrolling: touch
			l: abs scroll-y inset:0 pb:5

		.item
			fs:sm/1.3 fw:500 tt:capitalize c:gray6/70 c@hover:gray5
			p:1 7 l:block bg@hover:gray9/10
			&.active bg:gray9/20 t:white bold

	css @not-md pl:0
		$sidebar bg:gray8/95 x:-100% x@focus-within:0px

	css @not-lg l:vflex
		$preview pb:46px
		$preview header d:none
		$console l:abs inset:0 y:calc(100% - 46px) y@is-expanded:0px transition: 250ms cubic
		&.empty-preview $console y:0

	css @lg l:hflex
	
	# markdown stuff
	css span.variable.variable
		color: var(--code-variable)

	css .monaco-editor
		.error-line + .line-numbers c:red5 fw:bold

	def save
		currentFile.save!
		self

	def goPrev
		if currentFile and currentFile.prev
			router.replace(currentFile.prev.last.path)
	
	def goNext
		if currentFile and currentFile.next
			router.replace(currentFile.next.first.path)

	def render
		<self>
			<div$sidebar tabIndex=-1>
				<.scroller.(pt:3 l:abs scroll-y inset:0 pb:5)>
					<div$back.(l:hidden @lg:block px:5 pb:3 fs:sm fw:500 c:blue4 td@hover:underline) @click=leave> "⇦ back to site"
					<div.items> for child in examples.folders
						<h5.(p:1 7 fs:xs c:gray6 fw:bold tt:uppercase)> child.title
						<div.(pb:5)> for item in child.folders
							<a.item route-to.sticky=item.path> item.title

			<div.dark.(l:vflex rel flex:70% bg:#29313f) @resize=relayout>
				<header.(color:gray6)>
					<button.(l@md:hidden fw:bold fs:lg c@hover:blue5 px:1 mr:2 mt:-2px) @click.stop.prevent=$sidebar.focus!> "☰"
					<span hotkey='left' @click=goPrev>
					<span hotkey='right' @click=goNext>
					<span hotkey='esc' @click=leave>
					<div.(l:flex wrap cursor:default)> for file in project..children
						<a.tab route-to.replace=file.path .dirty=file.dirty .errors=file.hasErrors>
							<span.circ>
							<span.name> file.basename
							<span.ext.{file.ext}.(d@is-imba:none)> "." + file.ext
				
					<div.(flex:1)>
					
					<span.(opacity:0 fw:bold fs:lg/1 cursor:default) hotkey='command+s' @click.stop=save> ""
					<button.(l@lg:hidden fw:bold fs:lg/1 c@hover:blue5) @click=leave> "✕"

				<div$editor-wrapper.(l:rel flex:1)> <div$editor.(l:abs inset:0)>

			<div$drawer.light.(l:vflex rel flex:1 1 40% bg:white)>
				<div$preview.(l:vflex flex:1 bg:white)>
					<header.(bg:gray2)> <.tab.active> "Preview"
					<div.(l:rel flex:1)> <div$browserframe.(l:abs inset:0)> $iframe
				<div.divider>
				<repl-console$console.(flex-basis:20% l:vflex)>

	def rendered
		monaco