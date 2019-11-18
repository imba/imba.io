import Marked from './Marked'
import Page from './Page'

export tag CommunityPage < Page

	def render
		<self> <.body>
			<.content>
				<Marked.section.md.welcome.huge.light[app.guide['community']]>
