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
				for issue in APP.issues.object
					<issue-entry.entry[issue]>

	def body
		<@body.light>
			if doc
				<issue[doc]>

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
