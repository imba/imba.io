require './page'

import Doc from '../data/doc'

tag blog < page

	def doc
		if let nr = router.scoped(/blog\/(\d+)/,1)
			Doc.get('/issues/' + nr, 'json')
		else
			Doc.get('/issues/' + posts[0][:number],'json')
		

	def posts
		APP.issues.object

	def nav
		<navmenu@nav>
			<.content>
				for issue in posts
					<issue-entry.entry[issue]>


	def body
		<@body.light>
			if doc
				<issue[doc]>