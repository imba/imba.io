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
		$menu-width: 80vw
		$menu-width.md: 240px

	css app-menu
		h:100vh t:sm 500 l:fixed pt:0 top:0 bg:white
		width: $menu-width
		z-index: 150
		x:-100% x.md:0 x.focus-within:0
		br:gray300 br.md:none
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
		&:after = opacity: 0.7 text:xs content: " " $shortcut

	css $header = l:flex center hidden bg:white p:3 bb:gray2
		& .tabs = l:inline-flex radius:2 bg:teal1-0 cursor:pointer
		& .tab = l:flex center px:3 py:2 radius:2 flex:1 t:teal5 medium bg.hover:teal2-20
		& .tab.active = bg:teal2 t:teal7


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
				<div.(flex: 1)>
				<div.tabs>
					<a.tab route-to.sticky='/guides'> "Guide"
					<a.tab route-to.sticky='/manual'> "Manual"
					<a.tab @click.emit('showide')> "Code"

			<app-repl$repl id='repl' fs=fs route='/examples' .nokeys=!repl>
			<app-menu$menu data=doc>
			<app-document$doc.(ml.md:$menu-width) data=doc.first .nokeys=repl>
			<div$open-ide-button @click=$repl.show! hotkey='enter'> 'OPEN IDE'
			

# Should add the colors etc to the root css here
css :root
	font-family: Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji
	-webkit-font-smoothing: antialiased
	-moz-osx-font-smoothing: grayscale

css html.noscroll body
	overflow: hidden

css *
	outline:none

css html,body
	padding:0px margin:0px
