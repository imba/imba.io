import Page from './Page'
import Snippet from './Snippet'

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
					for child in toc:children when child:level < 3
						<GuideTOC[data] toc=child>
			else
				<a href=route> toc:title

tag Guide
	
	def setup
		render
		@body.dom:innerHTML = data:body
		if $web$
			awakenSnippets
		self
		
	def render
		<self.md>
			<div@body>
			<footer>
				if let ref = app.guide[data:prev]
					<a.prev href="/guide/{ref:id}"> "← " + ref:title
				if let ref = app.guide[data:next]
					<a.next href="/guide/{ref:id}"> ref:title + " →"

	def awakenSnippets
		for item in dom.querySelectorAll('.snippet')
			let code = item:textContent
			if code.indexOf('Imba.mount') >= 0
				Snippet.replace(item)
		self

tag TOC < li
	prop toc
	prop expanded default: true
	attr level
	
	def route
		"/guide/{data:route}#{toc:slug}"
		
	def toc
		@toc or data:toc[0]
		
	def render
		<self.toc.entry level=(toc:level)>
			<a href=route> toc:title
			if toc:children:length and toc:level < 2 and expanded
				<ul> for child in toc:children when child:level < 3
					<TOC[data] toc=child>

export tag GuidesPage < Page
	
	def mount
		@onscroll ||= do scrolled
		window.addEventListener('scroll',@onscroll,passive: true)

	def unmount
		window.removeEventListener('scroll',@onscroll,passive: true)
		
	def guide
		data[router.path.replace('/guide/','')] or data['essentials/introduction']
		
	def scrolled
		return self

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
			# render
			scroll() or setTimeout(scroll,20)

		self
	# prop guide

	def render
		let curr = guide

		<self._page>
			<nav@nav>
				<.content>
					for item in data:toc
						<h1> item:title or item:id
						<ul>
							for section in item:sections
								<TOC[data[section]] expanded=(data[section] == curr)>
					# for guide in data
					#	<TOC[guide] toc=guide:toc[0] expanded=(guide == curr)>
			<.body.light>
				if guide
					<Guide@{guide:id}[guide]>