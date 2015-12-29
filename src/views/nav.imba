

tag navmenu

	def onroute e
		document:body:classList.remove('menu')
		self

tag nav-list

tag nav-link

	attr href

	def render
		<self> <a href=href> @content

tag toc

	attr level

	def toggle
		toggleFlag('collapsed')