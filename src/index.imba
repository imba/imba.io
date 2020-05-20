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

	def render
		<self.(l:contents) @run=runCodeBlock(e.detail)>
			<app-repl$repl id='repl' fs=fs>
			<app-header.(l:sticky top:0 height:16)>
			<app-menu.(l:fixed top:16 w:240px bottom:0) data=page>
			<app-document.(ml:240px) data=page>
			# <.page-wrapper.(l:flex mx:auto max-width: 1400px)>
			#	<div.(flex: 1 1 auto)>
			#		<app-document data=page>

# Should add the colors etc to the root css here
css :root
	font-family: Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji
	-webkit-font-smoothing: antialiased
	-moz-osx-font-smoothing: grayscale

css html,body
	padding:0px margin:0px
