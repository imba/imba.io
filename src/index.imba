
class ResizeEvent < CustomEvent

var resizeObserver = null

def getResizeObserver
	resizeObserver ||= ResizeObserver.new do |entries|
		for entry in entries
			let e = ResizeEvent.new('resize', bubbles: false, detail: entry)
			entry.target.dispatchEvent(e)
		return

extend class Element

	def on$resize(chain, context)
		getResizeObserver!.observe(this)


import './repl/index'
import {fs,files} from './store'

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

	def render
		<self>
			<.full>
				<aside>
					<h2> "Examples"
					<ul> for dir in fs.examples.folders
						<li>
							<h2> dir.name
							<ul> for item in dir.folders
								<li :click.{example = item}> item.name
				<repl-root project=example>
	

### css
html,body {
	padding: 0px;
	margin: 0px;
}
body {
	display: flex;
	flex-direction: row;
}
###

### css scoped
app-root {
	display: contents;
}
.full {
	display: flex;
	flex-direction: row;
	position: absolute;
	top: 0px;
	left: 0px;
	right: 0px;
	bottom: 0px;
}
aside {
	flex: 0 0 250px;
}
repl-root {
	flex: 1 1 auto;
}
###