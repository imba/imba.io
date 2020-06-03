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

	css &
		$header-height: 56px
		$header-height.md: 64px
		$menu-width: 80vw
		$menu-width.md: 240px

	css $menu
		pt:$header-height
		h:100vh
		w:$menu-width
		t:sm 500
		l:fixed
		top:0
		bg:white
		z-index: 150
		x:-100%
		x.md:0
		x.focus-within:0
		br:gray300
		br.md:none
		transition: 250ms cubic
	
	css $repl
		l:fixed clip inset:0 top:0 z-index:2000 radius:0 shadow:xl
		transition: transform 250ms quint-out y:110%
		&.routed = y:0%

	css $open-ide-button
		l:fixed block bottom:0 right:0 m:5 b:gray200 py:3 px:4 radius:3
		cursor:pointer bg:teal300-90 t:teal800 bold b:teal400-20 shadow:md
		y.hover:-2px shadow.hover:lg bg.hover:teal300
		transition: 100ms cubic-out
		l.not-md:hidden
		&:after = opacity: 0.7 text:xs content: " " $shortcut

	css $header = 
		l:fixed flex center
		p:3 w:100% h:$header-height
		bb:gray2 bg:white
		z-index:300
		font-size:15px
		top:0px

		& .tabs = l:inline-flex radius:2 bg:teal1-0 cursor:pointer
		& .tab = l:flex center mx:2 py:1 flex:1 t:teal5 medium
		& .tab.active = t:teal7 bb:2px solid teal7
		& .handle
			l:flex center l.md:hidden size:9
			radius:2 bg:white opacity:0.9 color:teal5
			t:2xl

	def go path
		# console.log 'go to path',path
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
			# <app-header$header.(l:sticky top:0 height:16)>
			<div$header>
				<app-logo.(l:rel flex center h:8 t:teal4) route-to='/'>
				<div.(flex: 1)>
				<div.tabs>
					# <a.tab route-to.exact='/'> "Home"
					<a.tab route-to.sticky='/guides'> "Docs"
					# <a.tab route-to.sticky='/manual'> "Docs"
					<a.tab @click.emit('showide')> "Examples"
					<a.tab href='https://github.com/imba/imba'> "Repo"
					<a.tab href='https://discord.gg/mkcbkRw'> "Chat"
					
				
				<div.handle @click=($menu.focus!)> "☰"

			<app-repl$repl id='repl' fs=fs route='/examples' .nokeys=!repl>
			<app-menu$menu data=doc>
			<app-document$doc.(ml.md:$menu-width) data=doc.first .nokeys=repl>
			<div$open-ide-button @click=$repl.show! hotkey='enter'> 'OPEN IDE'
			

# Should add the colors etc to the root css here
css :root
	font-family: Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji
	-webkit-font-smoothing: antialiased
	-moz-osx-font-smoothing: grayscale
	$header-height: 56px
	$header-height.md: 64px
	$menu-width: 80vw
	$menu-width.md: 240px

css html.noscroll body
	overflow: hidden

css html,body
	padding:0px margin:0px

css body
	padding-top: $header-height

css *
	outline:none	