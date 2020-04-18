tag app-document

	def awaken
		self
		
	def render
		# console.log 'render app document',data.html
		<self.markdown>
			<div.content.px-6 innerHTML=data.html>
