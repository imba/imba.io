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

tag app-divider

tag app-repl-preview
	@watch prop url

	prop w = 2000
	prop scale = 1
	prop size = 'auto-auto'

	def build
		$iframe = <iframe[pos:absolute width:100% height:100% min-width:200px]>
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


	def maximize
		flags.add('maximized')
		self

	def minimize
		flags.remove('maximized')

	def maximized?
		flags.contains('maximized')

	def toggle
		maximized? ? minimize! : maximize!
		reflow!
		render!

	def reflow e
		ow = $bounds.offsetWidth
		oh = $bounds.offsetHeight
		console.log 'reflow',ow,oh,iw,ih
		recalc!
		self

	def recalc
		let [w,h] = size.split('-')
		ow ||= ($bounds && $bounds.offsetWidth)
		oh ||= ($bounds && $bounds.offsetHeight)

		let gap = 0
		if ow < 240
			gap = 0
			w = 240
			h = 300

		flags.toggle('pip',ow < 240)

		if w == 'auto'
			scale = sx = sy = 1
			iw = ih = '100%'
		else
			w = parseInt(w)
			sx = scale = Math.min(1,(ow - gap) / w)
			iw = w + 'px'

		if h == 'auto'
			ih = ((oh - gap) / scale) + 'px'
		else
			h = parseInt(h)
			sy = Math.min(1,(oh - gap) / h)
			ih = ((sy < sx) ? Math.floor(h * (sy/sx)) : h) + 'px'
		self

	def intersect e
		console.log 'intersecting',e.rx,e.ry

	def resize e,dir
		let t = e.touch

		if e.type == 'pointerup' and t.dt < 100
			return size = 'auto-auto'

		unless t.sx
			t.pip = !maximized?
			t.sx = sx
			t.sy = sy
			[t.rw,t.rh] = size.split('-')
			t.iw = $frame.offsetWidth
			t.ih = $frame.offsetHeight
			t.bw = $bounds.offsetWidth
			t.bh = $bounds.offsetHeight
			t.vw = window.innerWidth
			t.vh = window.innerHeight
			t.bounds = $bounds.getBoundingClientRect!

		let b = t.bounds
		let w = t.iw
		let h = t.ih

		let halfw = (b.width / 2)
		let halfh = (b.height / 2)

		let relx = (t.x - (b.left + halfw))
		let rely = (t.y - (b.top + halfh))
		let absx = Math.abs(relx)
		let absy = Math.abs(rely)

		let restw = 1440 - b.width
		let resth = 2000 - b.height

		if dir != 'y'
			t.rw = null
			if absx > halfw
				let gap = relx > 0 ? (t.vw - b.right) : b.left
				w = b.width + Math.min((absx - halfw) / gap,1) * restw
			else
				w = Math.max(absx * 2,260)

		if dir != 'x' and !t.pip
			t.rh = null
			if absy > halfh
				let gap = rely > 0 ? (t.vh - b.bottom) : b.top
				h = b.height + Math.min((absy - halfh) / gap,1) * resth
			else
				h = Math.max(absy * 2,260)

		size = "{t.rw == 'auto' ? t.rw : Math.round(w)}-{t.rh == 'auto' ? t.rh : Math.round(h)}"
		console.log 'resize',w,h,dir,size
		# console.log 'yes!!',e.touch,w,h,size,t.bounds,absx,halfw


	css d:flex fld:column pos:relative min-width:40px

	css $body pos:relative
	css $bounds pos:absolute w:100% h:100% r:0 b:0 min-width:120px
	css $frame
		pos:absolute top:0 l:50% bg:white w:100% h:100% x:-50% y:0
		border:1px solid gray3
		transform-origin:50% 0%

	css $cover pos:absolute inset:0 cursor:zoom-in d:none

	css $controls pos:absolute b:100% r:0 my:1 w:100% d:flex jc:center

	css %btn p:2 py:1 fw:500 c:gray4 @hover:gray5 .checked:blue5 outline@focus:none

	css @is-pip @not(.maximized)
		bg:clear
		$bounds max-height:200px
		$frame l:auto t:auto r:20px x:0 b:20px transform-origin:100% 100% y:0
		$cover d:block bg@hover:blue5/20
		$controls d:none

	css &.maximized
		$body pos:fixed zi:350 w:100vw h:100vh t:0 l:0 bg:gray2/85
		$bounds w:auto h:auto inset:14 b:20
		$controls pos:absolute t:auto b:0

	css %resizer
		pos:absolute
		fs:14px
		w:1em .y:100%
		h:1em .x:100%
		b:-1em .x:0
		r:-1em .y:0
		cursor: nwse-resize .x:ew-resize .y:ns-resize
		bg:clear @hover:gray5/10

	def render
		recalc!

		<self @intersect(10)=intersect>
			<div$body[flex:1] @click=toggle>
				
				<div$bounds @resize=reflow>
					<div$frame.frame[scale:{scale} w:{iw} h:{ih}] @click.stop>
						$iframe
						<div%resizer.x @touch=resize(e,'x')>
						<div%resizer.y @touch=resize(e,'y')>
						<div%resizer @touch=resize>
						<div%resizer @touch=resize>
						<div$cover @click=toggle>
				<div$controls.controls @click.stop>
					<button%btn bind=size value='auto-auto'> 'auto'
					<button%btn bind=size value='480-auto'> 'xs'
					<button%btn bind=size value='640-auto'> 'sm'
					<button%btn bind=size value='768-auto'> 'md'
					<button%btn bind=size value='1024-auto'> 'lg'
					<button%btn bind=size value='1280-auto'> 'xl'
					# <button%btn bind=size value='768x1024'> 'tablet'
					# <button%btn bind=size value='1280x1024'> 'desktop'
					<button%btn @click=maximize> '⤢'
		
	set file data
		return unless data
		# console.log 
		sw.request(event: 'file', path: data.path, body: data.body).then do
			console.log 'returned from sw',data.path
			url = data.path.replace('.imba','.html')
		self

	set dir data
		if $dir = data
			let file = $dir.files[0]
			console.log 'start with file',file,$dir.replUrl
			url = $dir.replUrl
			# url = `{$dir.path}/{file.basename + '.html'}`
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


	css bg:#29313f overscroll-behavior: contain
		$sidebar-width:200px
		pl:0 @md:$sidebar-width
		d:flex fld:column @lg:row overflow:hidden
		# l:vflex clip @lg:hflex
		header p:2 3 d:flex ai:center fs:sm fw:500 c:gray6

	css .tab
		pos:relative radius:2 py:1 px:2
		c@hover:gray5 .active:blue4 .active.dirty:yellow4 .active.errors:red5
		.circ
			pos:absolute d:block radius:2 w:8px h:2px top:0
			opacity:0.6 ..active:1
			bg:clear ..active:blue4 ..dirty:yellow4 ..errors:red5

	css .dark .tab bg@is-active:gray8 shadow@is-active:sm bg@is-active@is-dirty:yellow4/5
	css .light .tab c@hover:gray6 c@is-active:gray6 td@is-active:none
	css .underlay pos:fixed inset:0 zi:-1 bg:hsla(214,35%,83%,0.6) d@in-hidden:none

	css $preview
		pb@lt-lg:46px
		d..empty-preview:none
		header d@lt-lg:none

	css $console
		flex-grow..empty-preview:1
		@not-lg pos:absolute inset:0 tween:250ms cubic
			y:calc(100% - 46px) .expanded:0px ..empty-preview:0

	css $sidebar
		w:$sidebar-width cursor:default pos:absolute d:block c:gray5
		top:0 left:0 height:100% zi:100
		transition: 250ms cubic
		bg:gray8/95 @md:gray8
		x:-100% @md:0 @focus-within:0

		@after
			content: ' '
			bg: linear-gradient(gray8/0,gray8)
			d:block pos:absolute width:90% height:80px bottom: 0

		.scroller
			# -webkit-overflow-scrolling: touch
			pos:absolute ofy:auto inset:0 pb:5

		.item
			fs:sm/1.3 fw:500 tt:capitalize c:gray6/70 @hover:gray5
			p:1 7 d:block bg@hover:gray9/10
			&.active bg:gray9/20 c:white fw:bold
	
	css $editor
		span.variable.variable color: var(--code-variable)
		.monaco-editor .error-line + .line-numbers c:red5 fw:bold

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
					<div$back.(d:none @lg:block px:5 pb:3 fs:sm fw:500 c:blue4 td@hover:underline) @click=leave> "⇦ back to site"
					<div.items> for child in examples.folders
						<h5.(p:1 7 fs:xs c:gray6 fw:bold tt:uppercase)> child.title
						<div.(pb:5)> for item in child.folders
							<a.item route-to.sticky=item.path> item.title

			<div.dark.(pos:relative d:flex fld:column flex:70% bg:#29313f) @resize=relayout>
				<header.(color:gray6)>
					<button.(d@md:none fw:bold fs:lg c@hover:blue5 px:1 mr:2 mt:-2px) @click.stop.prevent=$sidebar.focus!> "☰"
					<span hotkey='left' @click=goPrev>
					<span hotkey='right' @click=goNext>
					<span hotkey='esc' @click=leave>
					<div.(d:flex flw:wrap cursor:default)> for file in project..children
						<a.tab route-to.replace=file.path .dirty=file.dirty .errors=file.hasErrors>
							<span.circ>
							<span.name> file.basename
							<span.ext.{file.ext}.(d@is-imba:none)> "." + file.ext
				
					<div.(flex:1)>
					
					<span.(opacity:0 fw:bold fs:lg/1 cursor:default) hotkey='command+s' @click.stop=save> ""
					<button.(d@lg:none fw:bold fs:lg/1 c@hover:blue5) @click=leave> "✕"

				<div$editor-wrapper.(pos:relative flex:1)> <div$editor.(pos:absolute inset:0)>

			<div$drawer.light.(d:flex fld:column pos:relative flex:1 1 40% bg:white)>
				<div$preview.(d:flex fld:column flex:1 bg:white)>
					<header.(bg:gray2)> <.tab.active> "Preview"
					<div.(pos:relative flex:1)> <div$browserframe.(pos:absolute inset:0)> $iframe
				<div.divider>
				<repl-console$console.(flex-basis:20% d:flex fld:column)>

	def rendered
		monaco