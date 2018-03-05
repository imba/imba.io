# define renderer
var marked = require 'marked'
var mdr = marked.Renderer.new

def mdr.heading text, lvl
	"<h{lvl}>{text}</h{lvl}>"
	
import Snippet from './Snippet'
		
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
		
	def setData data
		if data and data != @data
			@data = data
			dom:innerHTML = data:body
			awakenSnippets if $web$
		self
			
	def awakenSnippets
		for item in dom.querySelectorAll('.snippet')
			let code = item:textContent
			Snippet.replace(item)
		self