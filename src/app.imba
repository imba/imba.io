import Doc from './data/doc'
import Router from './router'

export class App

	prop req
	prop res
	prop deps
	prop site
	prop cache
	prop issues

	def initialize
		cache = {}
		deps = {}
		reset
		tick

		if $web$
			@loc = document:location
		self

	def reset
		cache = {}
		self

	def router
		@router ||= Router.new(self)

	def path
		$web$ ? @loc:pathname : req:path

	def hash
		$web$ ? @loc:hash.substr(1) : ''

	def tick
		self

	def schedule
		Imba.schedule(self)
		self

	def unschedule
		Imba.unschedule(self)
		self

	def fetchDocument src, &cb

		if $node$
			var fs = require 'fs'
			var path = require 'path'

			var filepath = "{__dirname}/../docs/{src}".replace(/\/\//g,'/')

			var res = deps[src]

			if !res
				let body = fs.readFileSync(filepath,'utf-8')

				if src.match(/\.md$/)
					res = self.Markdown.render(body)

				elif src.match(/\.json$/)
					res = JSON.parse(body)

				elif src.match(/\.imba$/)
					let html = self.Highlighter.highlight(body,{mode: 'full'})
					res = {body: body, html: html}
			
			deps[src] ||= res

			if site
				site.deps[src] ||= res
			cb and cb(res)

		else
			if DEPS[src]
				cb and cb(DEPS[src])
				return {then: (do |v| v(res))} # fake promise hack

			var xhr = XMLHttpRequest.new
			xhr.addEventListener 'load' do |res|
				DEPS[src] = JSON.parse(xhr:responseText)
				cb and cb(DEPS[src])
				# XHR = xhr
				# console.log 'response here',xhr:responseText
			xhr.open("GET", src)
			xhr.send

		return self

	def issues
		@issues ||= Doc.get('/issues/all','json')

