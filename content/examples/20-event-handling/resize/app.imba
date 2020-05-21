tag app-root
	prop box = {}

	def render
		<self.block>
			<div> "Resize the textarea"
			<div.bg-blue-200.p-4.inline-block @resize=(box = e.detail)>
				<textarea.resize>
			<div> "Size of div is {box.width} - {box.height}"

imba.mount <app-root>