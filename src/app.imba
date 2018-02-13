import Router from './util/router'

export class Doc

	prop path
	prop src
	prop data

	def ready
		@ready

	def initialize src, app
		@src = src
		@path = src.replace(/\.md$/,'')
		@app = app
		@ready = no
		fetch
		self

	def fetch
		@promise ||= @app.fetch(src).then do |res|
			load(res)

	def load doc
		@data = doc
		@meta = doc:meta or {}
		@ready = yes
		Imba.commit
		self

	def title
		@data:title or 'path'

	def toc
		@data and @data:toc[0]

	def body
		@data and @data:body


export var Cache = {}
var requests = {}

export class App
	prop req
	prop cache
	prop issues
	
	def self.deserialize data = '{}'
		self.new JSON.parse(data.replace(/§§SCRIPT§§/g,"script"))

	def initialize cache = {}
		@cache = cache
		@docs = {}
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

	def doc src
		@docs[src] ||= Doc.new(src,self)
		
	def serialize
		return JSON.stringify(cache).replace(/\bscript/g,"§§SCRIPT§§")

	if $node$
		def fetch src
			let res = cache[src] = Cache[src]
			let promise = {then: (|cb| cb(Cache[src])) }
			
			return promise if res
			
			console.log "try to fetch {src}"
			
			var fs = require 'fs'
			var path = require 'path'
			var md = require './util/markdown'
			var hl = require './scrimbla/core/highlighter'
			var filepath = "{__dirname}/../docs/{src}".replace(/\/\//g,'/')

			let body = fs.readFileSync(filepath,'utf-8')

			if src.match(/\.md$/)
				res = md.render(body)

			elif src.match(/\.json$/)
				# should also include md?
				res = JSON.parse(body)

			elif src.match(/\.imba$/)
				let html = hl.Highlighter.highlight(body,{mode: 'full'})
				res = {body: body, html: html}

			cache[src] = Cache[src] = res
			return promise
	
	if $web$
		def fetch src
			if cache[src]
				return Promise.resolve(cache[src])
			
			requests[src] ||= Promise.new do |resolve|
				var req = await window.fetch(src)
				var resp = await req.json
				resolve(cache[src] = resp)
			
	def fetchDocument src, &cb
		var res = deps[src]

		if $node$
			var fs = require 'fs'
			var path = require 'path'
			var md = require './util/markdown'
			var hl = require './scrimbla/core/highlighter'
			var filepath = "{__dirname}/../docs/{src}".replace(/\/\//g,'/')

			if !res
				let body = fs.readFileSync(filepath,'utf-8')

				if src.match(/\.md$/)
					res = md.render(body)

				elif src.match(/\.json$/)
					# should also include md?
					res = JSON.parse(body)

				elif src.match(/\.imba$/)
					let html = hl.Highlighter.highlight(body,{mode: 'full'})
					res = {body: body, html: html}
			
			deps[src] ||= res
			cb and cb(res)
		else
			# should guard against multiple loads
			if res
				cb and cb(res)
				return {then: (do |v| v(res))} # fake promise hack

			var xhr = XMLHttpRequest.new
			xhr.addEventListener 'load' do |res|
				res = deps[src] = JSON.parse(xhr:responseText)
				cb and cb(res)
			xhr.open("GET", src)
			xhr.send

		return self

	def issues
		@issues ||= Doc.get('/issues/all','json')

