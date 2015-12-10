require './page'

class Guide

	var cache = {}

	def self.get path
		var cache = APP.cache
		cache['guide-' + path] ||= self.new(path)

	prop path

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
			return APP.fetchDocument(@path + '.md') do |res|
				# console.log 'fetch Guide on server done',path
				load(res)

		@promise ||= APP.fetchDocument(@path + '.md') do |res|
			load(res)

	def load doc
		@object = doc
		@meta = doc:meta or {}
		@ready = yes
		self

	def title
		@object:title or 'path'

	def toc
		@object and @object:toc[0]

	def body
		@object and @object:body


tag guide-toc < toc

	prop toc
	attr level
	attr route

	def toc
		@toc or object.toc

	def route
		"{object.path}#{toc:slug}"

	def toggle
		toggleFlag('collapsed')

	def render
		return self unless object.ready

		reroute

		<self.entry level=(toc:level)>
			if toc:children:length and toc:level < 2
				<.header :tap='toggle'>
					<a href=route> toc:title
				<.content>
					for child in toc:children
						<guide-toc[object] toc=child>
			else
				<a href=route> toc:title


tag guide

	def render
		return self unless object?.ready
		<self.md body=(object.body)>

	def body= body
		if body != @body
			@body = body
			dom:innerHTML = body
			reawaken if Imba.isClient
		self

	def reawaken
		for snippet in %(snippet)
			snippet
		self


tag guides < page

	def nav
		<navmenu@nav>
			<.content>
				<guide-toc[Guide.get('/guides')]>
				<guide-toc[Guide.get('/guides/language')]>
				# <guide-toc[Guide.get('/guides/tips')]>

	def body
		<@body.light>
			<guide[guide]> if guide
			# <guide@doc.md.l src="{router.path}">

	def onroute e
		log 'onroute guides',router.hash
		e.halt

		if router.hash
			setTimeout(&,0) do
				if let el = first('#' + router.hash)
					log 'found element?!?',el
					el.dom.scrollIntoView(true)
					@scrollFreeze = window:scrollY
		self

	def guide
		if router.scoped('/guides')
			Guide.get(router.path)


	def awaken
		if Imba.isClient
			# @doc = %%(guide)
			schedule(fps: 1)
			window.addEventListener('scroll') do
				# console.log 'check scrolling'
				scrolled
		self

	def scrolled
		return unless hasFlag('scoped')

		var items = %([id])
		var match

		# should probably cache these periodically
		var scrollTop = window:scrollY
		var wh = window:innerHeight
		var dh = document:body:scrollHeight

		if @scrollFreeze >= 0
			var diff = Math.abs(scrollTop - @scrollFreeze)
			return self if diff < 50
			@scrollFreeze = -1

		var scrollBottom = dh - (scrollTop + wh)

		# console.log scrollTop,wh,dh,scrollBottom

		if scrollBottom == 0
			match = items.last

		else
			for item in items
				var t = (item.dom:offsetTop + 30 + 60) # hack
				var dist = scrollTop - t
				# console.log "{item.id} {t} {dist}"

				if dist < 0
					break match = item
		
		if match
			# console.log "match is {match.id}"
			if @hash != match.id
				@hash = match.id
				router.go('#' + @hash,{},yes)
				render
		self

	def tick
		render
		self