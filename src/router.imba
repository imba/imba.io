extern history

export class Router

	prop path

	def self.slug str
		str = str.replace(/^\s+|\s+$/g, '').toLowerCase # trim
		# remove accents, swap ñ for n, etc
		var from = "àáäâåèéëêìíïîòóöôùúüûñç·/_,:;"
		var to   = "aaaaaeeeeiiiioooouuuunc------"

		# for (var i=0, l=from.length ; i<l ; i++)
		# 	str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))

		str = str.replace(/[^a-z0-9 -]/g, '') # remove invalid chars
		str = str.replace(/\s+/g, '-') # collapse whitespace and replace by -
		str = str.replace(/-+/g, '-') # collapse dashes

		return str

	def initialize app
		@app = app

		if Imba.isClient
			window:onpopstate = do |e|
				refresh
				Imba.setTimeout(0) do yes
		self

	def refresh
		self

	def path
		@app.path

	def hash
		@app.hash

	def ext
		var path = path
		var m = path.match(/\.([^\/]+)$/)
		m and m[1] or ''

	def go href, state = {}, replace = no
		if href == '/install'
			# redirects here
			href = '/guides#toc-getting-started-installation'
			
		if replace
			history.replaceState(state,null,href)
		else
			history.pushState(state,null,href)

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
		
