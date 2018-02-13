import Page from './Page'

tag GuideTOC
	prop toc
	attr level

	def toggle
		toggleFlag('collapsed')
		
	def toc
		@toc or data.toc
		
	def route
		"{data.path}#{toc:slug}"		
		
	def render
		return self unless data.ready

		let toc = toc
		reroute
	
		<self.toc.entry level=(toc:level)>
			if toc:children:length and toc:level < 3
				<.header>
					<a href=route> toc:title
				<.content>
					for child in toc:children
						# <div> "Item"
						<GuideTOC[data] toc=child>
			else
				<a href=route> toc:title

tag Guide
	def render
		return self unless data?.ready
		# really render without imba?
		<self.md body=data.body>

	def body= body
		if body != @body
			@body = body
			dom:innerHTML = body
		self

export tag GuidesPage < Page
	
	def mount
		console.log "GuidesPage mounted"
		@onscroll ||= do scrolled
		window.addEventListener('scroll',@onscroll,passive: true)
		# Doc.get(router.path,'md')
		
	def unmount
		window.removeEventListener('scroll',@onscroll,passive: true)
		
	def guide
		app.doc(router.path + '.md')
		
	def scrolled
		var items = dom.querySelectorAll('[id]')
		var match

		var scrollTop = window:pageYOffset
		var wh = window:innerHeight
		var dh = document:body:scrollHeight

		if @scrollFreeze >= 0
			var diff = Math.abs(scrollTop - @scrollFreeze)
			return self if diff < 50
			@scrollFreeze = -1

		var scrollBottom = dh - (scrollTop + wh)

		if scrollBottom == 0
			match = items[items.len - 1]

		else
			for item in items
				var t = (item:offsetTop + 30 + 60) # hack
				var dist = scrollTop - t

				if dist < 0
					break match = item
		
		if match
			if @hash != match:id
				@hash = match:id
				router.go('#' + @hash,{},yes)
				render

		self
		
	def onroute e
		e.stop
		log 'guides routed'
		var scroll = do
			if let el = dom.querySelector('#' + router.hash)
				el.scrollIntoView(true)
				@scrollFreeze = window:pageYOffset
				return el
			return no

		if router.hash
			render
			scroll() or setTimeout(scroll,20)

		self

	def render
		<self._page>
			<nav@nav>
				<.content>
					<GuideTOC[app.doc('/guide.md')]>
					# <GuideTOC[app.doc('/guides/language.md')]>
			<.body.light>
				<Guide[guide]>