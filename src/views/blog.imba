require './page'

import Doc from '../app'

tag blog < page

	def doc
		if let nr = router.scoped(/blog\/(\d+)/,1)
			Doc.get('/issues/' + nr + '.json')

	def meta
		Doc.get('/blog.json')

	def nav
		<navmenu@nav>
			<.content>
				# <h1> "No items?"
				# for item in APP.ISSUES
				#	<h3> item:title
				# <div>
				#	for post in meta.object
				#		<h2> "Post {post:title}"

				for issue in APP.issues.object
					<issue-li[issue]>
					# <h2> "Issue!!! {issue:title}"

	def body
		<@body.light>
			if doc
				<issue[doc]>
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
