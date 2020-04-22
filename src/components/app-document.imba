tag app-document

	def awaken
		self
		
	def render
		<self.markdown.block.pb-24>
			<div.content.px-6 innerHTML=data.html>
