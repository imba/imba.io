
tag page
	def body
		<@body> "Content here"

	def nav
		<@nav> "Navigation here"

	def assemble
		<self>
			nav
			body

	def ready
		yes

	def render
		# log 'render page',route
		var scoped = router.scoped(route,self)
		flag('scoped',scoped)
		flag('selected',router.match(route,self))

		return self unless scoped and ready
		assemble

	def awaken
		schedule(fps: 1, events: yes)