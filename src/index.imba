import 'imba/src/imba/router/router.imba'

import './components/app-logo'
import './components/app-document'
import './components/app-header'
import './components/app-menu'
import './components/app-code'

import './repl/index'

import {fs,files,ls} from './store'

def main
	const sw = window.navigator.serviceWorker
	await sw.register('/sw.js')
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
		<self.antialiased.(l:contents) @run=runCodeBlock(e.detail)>
			# <app-repl$repl id='repl' fs=fs>
			<app-repl$repl id='repl' fs=fs>
			<app-header.(l:sticky top:0)>
			<.page-wrapper.(l:flex mx:auto max-width: 1400px)>
				<.(l:static noclip-y block)>
					<app-menu.(l:sticky top:12) data=page>
				<div.(flex: 1 1 auto)>
					<app-document data=page>

# Should add the colors etc to the root css here

### css
:root {
	--dark-bg: #282f33;
	--page-max-width: 2400px;

	font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;
	font-family: Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;
	--logo-color: #5997ff;
}

html,body {
	padding: 0px;
	margin: 0px;
}
###
