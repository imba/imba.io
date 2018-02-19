extern eval

export tag Snippet
	prop src
	prop heading
	prop hl
	
	def self.replace dom
		let imba = dom:firstChild
		let js = imba:nextSibling
		let highlighted = imba:innerHTML
		let raw = dom:textContent
		let data =
			code: raw
			html: highlighted
			js: {
				code: js:textContent
				html: js:innerHTML
			}

		let snippet = <Snippet[data]>
		dom:parentNode.replaceChild(snippet.dom,dom)
		return snippet
		
	def setup
		render
		@code.dom:innerHTML = data:html
		run
		self
		
	def run
		var orig = Imba:mount
		var js = data:js:code
		js = js.replace("require('imba')",'window.Imba')
		# add console?
		try
			Imba:mount = do |item| orig.call(Imba,item,@result.dom)
			eval(js)
		
		Imba:mount = orig
		self


	def render
		<self.snippet>
			<code@code>
			<div@result.styled-example>
		
export tag Example < Snippet

	def render
		<self> "Example"