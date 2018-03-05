import Page from './Page'
import Snippet from './Snippet'

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
					<a.prev href="/guides/{ref:id}"> "← " + ref:title
				if let ref = app.guide[data:next]
					<a.next href="/guides/{ref:id}"> ref:title + " →"

	def awakenSnippets
		for item in dom.querySelectorAll('.snippet')
			Snippet.replace(item)
		self

tag TOC < li
	prop toc
	prop expanded default: true
	attr level
	
	def route
		"/guides/{data:route}{@toc ? '#' + toc:slug : ''}"
		
	def toc
		@toc or data:toc[0]
		
	def render
		<self.toc.entry level=(toc:level)>
			<a route-to=route> toc:title
			if toc:children:length and toc:level < 2 and router.match(route)
				<ul> for child in toc:children when child:level < 3
					<TOC[data] toc=child>

tag GuidePage
	
	def load params
		data = app.guide["{params:guide}/{params:section}"]
		window.scrollTo(0,0) if $web$
		return 200
		
	def render
		<self>
			if data
				<Guide@{data:id}[data]>
			

export tag GuidesPage < Page
	prop guide

	def mount
		@onscroll ||= do scrolled
		window.addEventListener('scroll',@onscroll,passive: true)

	def unmount
		window.removeEventListener('scroll',@onscroll,passive: true)
		
	# def load params
	# 	guide = data["{params:guide}/{params:section}"]
	# 	return 200
		
	def guide
		let url = params:url or '/guides/essentials/introduction'
		data[url.replace('/guides/','')]
		
	def scrolled
		# return self
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
				router.replace('#' + @hash)
				render
		self

	def render
		let curr = guide

		<self._page>
			<nav@nav>
				<.content>
					for item in data:toc
						<h1> item:title or item:id
						<ul> for section in item:sections
							<TOC[data[section]]>
		
			<GuidePage.body.light route=':guide/:section'>