import '../styling/globals.imba'

tag app-root
	prop box = {}

	def render
		<self.box>
			<div> "Resize the div below"
			<div[h:10 bg:teal3 of:auto resize:both] @resize=(box=e.rect)>
			<div> "Size of div is {box.width} - {box.height}"

imba.mount <app-root>