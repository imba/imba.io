import 'imba/src/imba/router/router.imba'

import './util/shortcuts'

import './components/app-logo'
import './components/app-document'
import './components/app-header'
import './components/app-menu'
import './components/app-code'
import './components/doc-widgets'

import './repl/index'

import {fs,files,ls} from './store'
import * as sw from './sw/controller'

tag app-root
	prop doc

	def mount
		let controller = await sw.load!
		return
	
	get page
		ls(document.location.pathname) or ls('/guides/introduction/overview')

	def runCodeBlock data
		if data.example
			router.go(data.example.path)
		elif data.code	
			let file = ls('/examples/essentials/playground/app.imba')
			let code = data.code.replace(/^(?=\<\w)/gm,'imba.mount do ')
			code = code.replace(/^# ---\n/gm,'')
			file.overwrite code
			router.go(file.path)

	css $menu
		pt:$header-height
		h:100vh
		w:$menu-width
		l:fixed
		fs:sm fw:500
		top:0
		bg:white
		zi:150
		x:-100% @md:0 @focin:0
		border-right:gray3 @md:none
		tween:250ms cubic
	
	css $repl
		l:fixed clip inset:0 top:0 zi:2000 radius:0 shadow:xl
		tween:transform 250ms quint-out
		y:110% .routed:0

	css $open-ide-button
		bottom:0 right:0 m:5 b:gray2 py:3 px:4 radius:3
		cursor:pointer bg:teal3/90 c:teal8 fw:bold border:teal4/20 shadow:md
		tween:100ms cubic-out
		l:fixed block @not-md:hidden
		@hover y:-2px shadow:lg bg:teal3
		@after o:0.7 text:xs content: " " $shortcut

	css $header
		l:fixed control
		p:3 w:100% h:$header-height
		border-bottom:gray2 bg:white
		zi:300 fs:15px top:0px

		.handle l:control @md:hidden size:9 radius:2 bg:white o:0.9 c:teal5 fs:2xl
		.tab l:flex mx:2 py:1 c:teal5 fw:500 bb:2px solid teal6/0
			&.active c:teal7 bbc:teal6
		

	def go path
		self.path = path
		doc ||= ls('/guides')

		let parts = path.replace(/(^\/|\/$)/,'').split('/')
		# redirect home somehow?
		if path.indexOf('/guides') == 0 or path == '/' or path == '/index.html' or path.indexOf('/manual') == 0
			doc = ls(path) or doc

		try document.documentElement.classList.toggle('noscroll',path.indexOf('/examples/') == 0)
		self
		# data = ls(path) or ls('/guides/introduction/overview')

	def render
		if path != router.url.pathname
			go(router.url.pathname)

		let repl = router.match('/examples')

		<self.(l:contents) @run=runCodeBlock(e.detail) @showide=$repl.show!>
			<div$header>
				<app-logo.(l:rel control h:8 c:teal4) route-to='/'>
				<div.(flex: 1)>
				<div.(l:flex cursor:pointer)>
					<a.tab route-to.sticky='/guides'> "Docs"
					<a.tab @click.emit('showide')> "Examples"
					<a.tab href='https://github.com/imba/imba'> "Repo"
					<a.tab href='https://discord.gg/mkcbkRw'> "Chat"
				<div.handle @click=($menu.focus!)> "☰"

			<app-repl$repl id='repl' fs=fs route='/examples' .nokeys=!repl>
			<app-menu$menu data=doc>
			<app-document$doc.(ml@md:$menu-width) data=doc.first .nokeys=repl>
			<div$open-ide-button @click=$repl.show! hotkey='enter'> 'OPEN IDE'
			

# Should add the colors etc to the root css here
css :root
	font-family: Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji
	-webkit-font-smoothing: antialiased
	-moz-osx-font-smoothing: grayscale
	$header-height: 56px @md:64px
	$menu-width: 80vw @md:240px

css html.noscroll body
	overflow: hidden

css html,body
	p:0px m:0px

css body
	pt: $header-height

css *
	outline:none	