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
		let file = ls('/examples/playground/app.imba')
		file.overwrite data.code
		$repl.currentFile = file
		$repl.show!

	def render
		<self.antialiased :run.{runCodeBlock(e.detail)}>
			$repl = <app-repl.floating fs=fs>
			<app-header.sticky.top-0>
			<.page-wrapper.flex.flex-row>
				<.sidebar-wrapper>
					<app-menu[page].sidebar>
				<.content-wrapper>
					<app-document[page]>

# Should add the colors etc to the root css here

### css
:root {
	--light-bg: #ffffff;
	--dark-bg: #282f33;
	--link-color: #447A98;
	--page-max-width: 2400px;

	font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;
	font-family: Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;

	--header-bg: rgba(255,255,255,0.95);
	--logo-color: #5997ff;
}

a {
	color: var(--link-color);
}

.content-wrapper {
	flex: 1 1 auto;
}

.page-wrapper {
	margin: 0 auto;
	max-width: var(--page-max-width);
}

html,body {
	padding: 0px;
	margin: 0px;
}

body {
	background-color: var(--light-bg);
}

app-header {
	background-color: var(--header-bg);
}

app-header a.active {
	color: white;
}

app-repl {
	margin: 70px;
}

app-header .tab {
	padding: 10px;
}

###

### css scoped
app-root {
	display: contents;
}

.sidebar-wrapper {
	flex: 0 0 250px;
	display: block;
	overflow-y: visible;
	position: static;
}

.sidebar {
	display: block;
	padding: 20px;
	position: sticky;
	top: 64px;
	height: auto;
	overflow-y: auto;
	height: calc(100vh - 64px);
}

app-document >>> .content {
	max-width: 768px;
}

###