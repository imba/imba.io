require './page'

import Doc from '../app'

tag guide-toc < toc

	prop toc

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
				<guide-toc[Doc.get('/guides','md')]>
				<guide-toc[Doc.get('/guides/language','md')]>

	def body
		<@body.light>
			<guide[guide]> if guide

	def onroute e
		e.halt

		var scroll = do
			if let el = first('#' + router.hash)
				el.dom.scrollIntoView(true)
				@scrollFreeze = window:pageYOffset
				return el
			return no

		if router.hash
			render
			scroll() or setTimeout(scroll,20) do

		self

	def guide
		if router.scoped('/guides')
			Doc.get(router.path,'md')


	def awaken
		if Imba.CLIENT
			schedule(fps: 1)
			window.addEventListener('scroll') do scrolled
		self

	def scrolled
		return unless hasFlag('scoped')

		var items = %([id])
		var match

		# should probably cache these periodically
		var scrollTop = window:pageYOffset
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