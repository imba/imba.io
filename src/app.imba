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
		self

	def reset
		cache = {}
		self

	def router
		@router ||= Router.new(self)

	def path
		Imba.SERVER ? req:path : @path

	def hash
		Imba.SERVER ? '' : document:location:hash.substr(1)

	def tick
		unless Imba.SERVER
			# path and hash should be moved into router
			@path = document:location:pathname

		self

	def schedule
		Imba.schedule(self)
		self

	def unschedule
		Imba.unschedule(self)
		self

	def fetchDocument src, &cb

		if Imba.SERVER
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
		@issues ||= Doc.get('/issues/all.json')

export class Doc

	var cache = {}

	def self.get path
		var cache = APP.cache
		cache['doc-' + path] ||= self.new(path)

	prop path
	prop object

	def ready
		@ready

	def initialize path
		@path = path
		@ready = no
		fetch
		self

	def fetch
		if Imba.SERVER
			# console.log 'fetch Guide on server',path
			return APP.fetchDocument(@path) do |res|
				# console.log 'fetch Guide on server done',path
				load(res)

		@promise ||= APP.fetchDocument(@path) do |res|
			load(res)

	def load doc
		@object = doc
		@meta = doc:meta or {}
		@ready = yes
		Imba.emit(self,'ready')
		Imba.Scheduler.markDirty
		self

	def title
		@object:title or 'path'

	def toc
		@object and @object:toc[0]

	def body
		@object and @object:body
