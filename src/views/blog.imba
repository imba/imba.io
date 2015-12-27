require './page'

import Doc from '../app'

tag blog < page

	def doc
		if router.scoped('/blog')
			Doc.get(router.path)

	def nav
		<navmenu@nav>
			<.content>
				<h1> "No items?"
	def body
		<@body.light>
			if doc
				<h1> "Blogpost?"
				<blogpost[doc]>
			<h4> "No posts"

tag blogpost

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
