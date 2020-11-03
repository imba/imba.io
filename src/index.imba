import 'imba/router'

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
		await sw.load!
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
		h:100vh w:$menu-width t:0 pos:fixed
		fs:sm fw:500
		bg:white
		zi:150
		x:-100% @md:0 @focin:0
		border-right:gray3 @md:none
		transition:all 250ms cubic-in-out
	
	css $repl
		pos:fixed of:hidden inset:0 zi:2000 rd:0 bxs:xl
		transition:transform 250ms quint-out
		y:110% .routed:0

	css .open-ide-button
		bottom:0 right:0 m:5 border:gray2 py:3 px:4 rd:3
		cursor:pointer bg:teal3/90 c:teal8 fw:bold border:teal4/20 bxs:md
		tween:100ms cubic-out
		pos:fixed d:block @not-md:none
		@hover y:-2px bxs:lg bg:teal3
		@after o:0.7 fs:xs content: " " $shortcut

	css .header
		pos:fixed d:flex ai:center
		p:3 w:100% h:$header-height top:0px
		border-bottom:gray2 bg:white
		zi:300 fs:15px 

		.handle d:flex @md:none ai:center size:9 rd:2 bg:white o:0.9 c:teal5 fs:2xl
		.tab l:flex mx:2 py:1 c:teal5 fw:500 bb:2px solid teal6/0
			&.active c:teal7 bbc:teal6
		

	def go path
		self.path = path
		doc ||= ls('/intro/overview')

		let parts = path.replace(/(^\/|\/$)/,'').split('/')
		# redirect home somehow?
		if path == '/' or path == '/index.html'
			doc = ls('/intro/overview')
		elif path.indexOf('/examples') != 0
			doc = ls(path) or ls('/404')

		try
			document.documentElement.classList.toggle('noscroll',path.indexOf('/examples/') == 0)
		self

	def render
		if path != router.url.pathname
			go(router.url.pathname)

		let repl = router.match('/examples')

		<self[d:contents] @run=runCodeBlock(e.detail) @showide=$repl.show!>
			<div.header>
				<app-logo[d:flex h:8 c:teal4] route-to='/'>
				<div[flex: 1]>
				<div[d:flex cursor:pointer]>
					<a.tab @click.emit('showide')> "Examples"
					<a.tab href='https://github.com/imba/imba'> "GitHub"
					<a.tab href='https://discord.gg/mkcbkRw'> "Chat"
				<div.handle @click=($menu.focus!)> "☰"

			<app-repl$repl id='repl' fs=fs route='/examples' .nokeys=!repl>
			<app-menu$menu data=doc>
			<app-document$doc[ml@md:$menu-width] data=doc .nokeys=repl>
			<div.open-ide-button @click=$repl.show! hotkey='enter'> 'OPEN IDE'
			

# Should add the colors etc to the root css here
global css
	@root
		font-family: Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji
		-webkit-font-smoothing: antialiased
		-moz-osx-font-smoothing: grayscale
		$header-height: 56px @md:64px
		$menu-width:80vw @md:240px
		$doc-width: 768px
		$doc-margin: calc(100vw - $doc-width - 20px) @md:calc(100vw - $doc-width - $menu-width - 20px)

	html.noscroll body overflow: hidden
	html,body p:0px m:0px
	body pt: $header-height
	* outline:none	