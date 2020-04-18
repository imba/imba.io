import 'imba/src/imba/router/router.imba'

import './components/app-document'
import './components/app-header'
import './components/app-menu'
import './components/app-code'

import './repl/index'

import {fs,files,ls} from './store'

const sw = window.navigator.serviceWorker

def main
	if sw
		sw.addEventListener('message') do(e)
			console.log 'message from sw',e

		await sw.register('/sw.js')
		global.fetch('/style.css')
		for file in files
			file.sw = sw.controller
			file.sendToWorker!

tag app-root
	prop example

	def mount
		main!

	def reroute
		let url = document.location.pathname
		let target = ls(url)
	
	get page
		ls(document.location.pathname)

	def render
		<self.antialiased>
			<app-header.sticky.top-0>
			<.page-wrapper.flex.flex-row>
				<.sidebar-wrapper>
					<app-menu[page].sidebar>
				<.content-wrapper>
					if page and page.childByName('index.html')
						<app-repl.fixed.inset-0.shadow-lg.floating project=page>
					elif page and page.ext == 'md'
						<app-document[page]>	

# Should add the colors etc to the root css here

### css
:root {
	--light-bg: #ffffff;
	--dark-bg: #282f33;
	--link-color: #447A98;
	font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;
}

a {
	color: var(--link-color);
}

.content-wrapper {
	flex: 1 1 auto;
}

.page-wrapper {
	margin: 0 auto;
	max-width: 1400px;
}

html,body {
	padding: 0px;
	margin: 0px;
}

body {
	background-color: var(--light-bg);
}

app-header {
	background-color: whitesmoke;
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