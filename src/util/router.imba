extern history, ga

export class Router

	prop path

	def self.slug str
		str = str.replace(/^\s+|\s+$/g, '').toLowerCase # trim

		var from = "àáäâåèéëêìíïîòóöôùúüûñç·/_,:;"
		var to   = "aaaaaeeeeiiiioooouuuunc------"
		str = str.replace(/[^a-z0-9 -]/g, '') # remove invalid chars
		str = str.replace(/\s+/g, '-') # collapse whitespace and replace by -
		str = str.replace(/-+/g, '-') # collapse dashes

		return str

	def initialize app
		@app = app

		if $web$
			window:onpopstate = do |e|
				refresh

		self

	def refresh
		if $web$
			document:body.setAttribute('data-route',segment(0))
			Imba.commit
		self

	def path
		@app.path

	def hash
		@app.hash

	def ext
		var path = path
		var m = path.match(/\.([^\/]+)$/)
		m and m[1] or ''

	def segment nr = 0
		path.split('/')[nr + 1] or ''

	def go href, state = {}, replace = no
		if href == '/install'
			# redirects here
			href = '/guides#toc-installation'
			
		if replace
			history.replaceState(state,null,href)
			refresh
		else
			history.pushState(state,null,href)
			refresh
			# ga('send', 'pageview', href)

		if !href.match(/\#/)
			window.scrollTo(0,0)
	
		self

	def scoped reg, part
		var path = path + '#' + hash
		if reg isa String
			var nxt = path[reg:length]
			path.substr(0,reg:length) == reg and (!nxt or nxt == '-' or nxt == '/' or nxt == '#' or nxt == '?' or nxt == '_')
		elif reg isa RegExp
			var m = path.match(reg)
			part && m ? m[part] : m
		else
			no

	def match reg, part
		var path = path + '#' + hash

		if reg isa String
			path == reg
		elif reg isa RegExp
			var m = path.match(reg)
			part && m ? m[part] : m
		else
			no

extend tag element
	attr route

	def router
		app.router

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

# extend links
extend tag a
	
	def route
		@route or href

	def ontap e
		var href = href.replace(/^http\:\/\/imba\.io/,'')

		if e.event:metaKey or e.event:altKey
			e.@responder = null
			return e.stop

		if let m = href.match(/gist\.github\.com\/([^\/]+)\/([A-Za-z\d]+)/)
			console.log 'gist!!',m[1],m[2]
			#gist.open(m[2])
			return e.prevent.stop

		if href[0] == '#' or href[0] == '/'
			e.prevent.stop
			router.go(href,{})
			Imba.Events.trigger('route',self)
		else
			e.@responder = null
			return e.stop		
		self

	def render
		reroute
