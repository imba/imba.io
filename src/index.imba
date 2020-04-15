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
			<section>
				<h2> "Examples"
				<ul> for dir in fs.examples.folders
					<li>
						<h2> dir.name
						<ul> for item in dir.folders
							<li :click.{example = item}> item.name
			<section>
				<repl-root project=example>