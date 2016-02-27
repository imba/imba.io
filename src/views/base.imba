extend tag element
	attr route

	def html= html
		if html != @html
			dom:innerHTML = @html = html
		self

	def go route
		self

	def router
		APP.router

	def reroute
		var scoped = router.scoped(route,self)
		flag('scoped',scoped)
		flag('selected',router.match(route,self))
		if scoped != @scoped
			@scoped = scoped
			scoped ? didscope : didunscope
		return self

	def didscope
		self

	def didunscope
		self

extend tag script
	
	def children= value
		@children = value
		dom:innerHTML = value
		self

extend tag canvas
	
	def dpr
		@dpr ||= window:devicePixelRatio || 1

	def width= width
		if width != @width
			dom:width = width * dpr
			css width: width
			@width = width
		self

	def height= height
		if height != @height
			dom:height = height * dpr
			css height: height
			@height = height
		self

extend tag a
	
	def route
		@route or href

	def ontap e
		var href = href.replace(/^http\:\/\/imba\.io/,'')

		if e.event:metaKey or e.event:altKey
			e.@responder = null
			return e.halt

		if let m = href.match(/gist\.github\.com\/([^\/]+)\/([A-Za-z\d]+)/)
			console.log 'gist!!',m[1],m[2]
			#gist.open(m[2])
			return e.cancel.halt

		if href[0] == '#' or href[0] == '/'
			e.cancel.halt
			router.go(href,{})
			Imba.Events.trigger('route',self)
		else
			e.@responder = null
			return e.halt		
		self

	def render
		reroute

tag star < a
	attr repo

	def render
		<self href="http://github.com/{repo}"> "★ Star"
		# <a href="http://github.com/{repo}"> "★ Star"