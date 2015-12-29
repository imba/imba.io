extend tag element
	attr route

	# def html= html
	# 	@dom:innerHTML = html
	# 	self

	def html= html
		if html != @html
			dom:innerHTML = @html = html
		self

	def go route
		self

	def router
		APP.router

	def reroute
		flag('scoped',router.scoped(route,self))
		flag('selected',router.match(route,self))

	def transform= value
		css(:transform, value)
		self

	def transform
		css(:transform)

extend tag htmlelement

	def html= html
		if html != @html
			dom:innerHTML = @html = html
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