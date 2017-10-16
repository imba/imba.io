
tag scrimbla-overlay
	prop view

	def render
		<self> JSON.stringify(object)

tag scrimbla-overlays
	prop view

	def add type, data = {}
		console.log 'add overlay!'
		append <scrimbla-overlay[data] view=view>
		self

	def reposition
		self