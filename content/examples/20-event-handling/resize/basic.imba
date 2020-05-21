tag app-root
	prop box = {}

	def render
		<self.(d:block p:5)>
			<div> "Resize the textarea"
			<div.(bg:blue200 p:4 d:inline-block) @resize=(box = e.rect)>
				<textarea.(resize:both)>
			<div> "Size of div is {box.width} - {box.height}"

imba.mount <app-root>