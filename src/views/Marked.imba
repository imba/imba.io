# define renderer
var marked = require 'marked'
var mdr = marked.Renderer.new

def mdr.heading text, lvl
	"<h{lvl}>{text}</h{lvl}>"
		
export tag Marked
	def renderer
		self

	def setText text
		if text != @text
			@text = text
			dom:innerHTML = marked(text, renderer: mdr)
		self

	def setContent val,typ
		setText(val,0)
		return self

