import 'imba/src/imba/router/router.imba'

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
	prop guide

	def mount
		let controller = await sw.setup!

		for file in files
			file.sw = controller
			file.sendToWorker!

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
		transition: transform 250ms quint-out y:100%
		&.routed = y:0%

	css $open-ide-button
		l:fixed block bottom:0 right:0 m:5 b:gray200 py:3 px:4 radius:3
		cursor:pointer bg:teal300-90 t:teal800 bold b:teal400-20 shadow:md
		y.hover:-2px shadow.hover:lg bg.hover:teal300
		transition: 100ms cubic-out

	def go path
		# console.log 'go to path',path
		self.path = path
		guide ||= ls('/guides/introduction/overview')

		let parts = path.replace(/(^\/|\/$)/,'').split('/')

		# redirect home somehow?
		if path.indexOf('/guides/') == 0 or path == '/'
			guide = ls(path) or guide

		self
		# data = ls(path) or ls('/guides/introduction/overview')

	def render
		if path != router.url.pathname
			go(router.url.pathname)

		<self.(l:contents) @run=runCodeBlock(e.detail)>
			<app-repl$repl id='repl' fs=fs route='/examples'>
			# <app-header$header.(l:sticky top:0 height:16)>
			<app-menu$menu data=guide>
			<app-document$doc.(ml.md:$menu-width) data=guide>
			<div$open-ide-button @click=$repl.show!> 'OPEN IDE'

# Should add the colors etc to the root css here
css :root
	font-family: Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji
	-webkit-font-smoothing: antialiased
	-moz-osx-font-smoothing: grayscale

css *
	outline:none

css html,body
	padding:0px margin:0px
