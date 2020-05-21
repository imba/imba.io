import 'imba/src/imba/router/router.imba'

import './components/app-logo'
import './components/app-document'
import './components/app-header'
import './components/app-menu'
import './components/app-code'
import './components/doc-widgets'

import './repl/index'

import {fs,files,ls} from './store'

def main
	const sw = window.navigator.serviceWorker
	var reg = await sw.getRegistration('/')

	if reg
		console.log 'update service worker'
		await reg.update!
	else
		reg = await sw.register('/sw.js')

	global.fetch('/style.css') # just to register this client with the worker
	for file in files
		file.sw = sw.controller
		file.sendToWorker!

tag app-root

	def mount
		main!
	
	get page
		ls(document.location.pathname) or ls('/guides')

	def runCodeBlock data
		if data.example
			$repl.project = data.example
		elif data.code	
			let file = ls('/examples/playground/app.imba')
			let code = data.code.replace(/^(?=\<\w)/gm,'imba.mount do ')
			code = code.replace(/^# ---\n/gm,'')
			file.overwrite code
			$repl.currentFile = file
		$repl.show!

	css &
		$menu-width: 80vw
		$menu-width.md: 240px

	css app-menu
		h:100vh t:sm 500 l:fixed pt:16 top:0 bg:white
		width: $menu-width
		z-index: 150
		x:-100% x.md:0 x.focus-within:0
		br:gray300 br.md:none
		transition: 250ms cubic

	def render
		<self.(l:contents) @run=runCodeBlock(e.detail)>
			<app-repl$repl id='repl' fs=fs>
			<app-header$header.(l:sticky top:0 height:16)>
			<app-menu$menu data=page>
			<app-document$doc.(ml.md:$menu-width) data=page>
			# <.page-wrapper.(l:flex mx:auto max-width: 1400px)>
			#	<div.(flex: 1 1 auto)>
			#		<app-document data=page>

# Should add the colors etc to the root css here
css :root
	font-family: Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji
	-webkit-font-smoothing: antialiased
	-moz-osx-font-smoothing: grayscale

css *
	outline:none

css html,body
	padding:0px margin:0px
