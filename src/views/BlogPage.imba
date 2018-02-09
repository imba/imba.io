import Page from './Page'

tag BlogPage < Page

	def doc
		if let nr = router.scoped(/blog\/(\d+)/,1)
			app.doc('/issues/' + nr, 'json')
		else
			app.doc('/issues/' + posts[0][:number],'json')

	def posts
		app.issues.object

	def render
		<self>
			"Nothing here"
			# <nav@nav>
			# 	<.content>
			# 		for issue in posts
			# 			<issue-entry.entry[issue]>
			# <.body.light>
			# 	<issue[doc]>