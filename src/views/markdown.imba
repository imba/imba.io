# for markdown rendering
tag md

	attr src watch: :reload
	prop html watch: yes
	prop doc

	def body
		self

	def setup
		self

	def ghsrc
		"https://github.com/somebee/imba.io/blob/master/docs{src}"

	def htmlDidSet html
		body.dom:innerHTML = html
		setup
		self

	def render
		if $node$
			APP.fetchDocument(src + '.md') do |doc|
				assemble(doc)
			
		elif @snippets
			for snippet in @snippets
				snippet.end # simulate real rendering here?
		self

	# not on frontpage?!
	def assemble doc
		<self.md html=doc:body>

	def setup
		super
		reload if Imba.isClient and src

	def awaken
		# log "awakened md from client(!)"
		@snippets = %(snippet).toArray
		self

	def preload html
		@dom:innerHTML = html
		@snippets = %(snippet).toArray
		self

	def reload
		if Imba.isClient
			# console.log 'reloading markdown'
			@snippets = []
			APP.fetchDocument(src+'.md') do |res|
				# console.log 'returned from markdown here?!',res
				assemble(doc = res)
				@snippets = %(snippet).toArray
				parent.dom:scrollTop = 0
				return self
		self

# define renderer
var marked = require 'marked'
var mdr = marked.Renderer.new

def mdr.heading text, lvl
	"<h{lvl}>{text}</h{lvl}>"

tag marked

	def renderer
		self

	def setText text
		setContent(text,0)

	def setContent val,typ
		if val != @content
			@content = val
			dom:innerHTML = marked(val, renderer: mdr)
		self
