# Play around
tag app-component

	def hydrate
		console.log 'was awakened from html?'

	def render
		<self.block>
			<div> title
			<slot>

imba.mount <app-component title="Mounted from app.imba"> "Some content"
