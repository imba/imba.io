extern eval

export tag Snippet
	prop src
	prop heading
	prop hl
	
	def self.replace dom
		# figure out languages
		let data = {
			title: dom:dataset:title
		}
		
		let el = dom:firstChild
		
		while el
			if let lang = el:dataset:lang
				data[lang] = {
					code: el:textContent
					html: el:innerHTML
				}
			el = el:nextElementSibling
		
		# let imba = dom:firstChild
		# let js = imba:nextSibling
		# let highlighted = imba:innerHTML
		# let raw = dom:textContent
		# let title = dom:dataset:title
		# let data =
		# 	code: raw
		# 	html: highlighted
		# 	options: dom:dataset
		# 	title: dom:dataset:title
		# 	js: {
		# 		code: js:textContent
		# 		html: js:innerHTML
		# 	}
		# console.log dom:dataset:title
		let snippet = <Snippet[data]>
		dom:parentNode.replaceChild(snippet.dom,dom)
		return snippet
		
	def setup
		let lang = data:imba or data:js
		@runnable = lang and lang:code.indexOf('Imba.mount') >= 0
		render
		@code.dom:innerHTML = lang:html
		run if @runnable
		self
		
	def run
		var orig = Imba:mount
		var js = data:js:code
		js = js.replace("require('imba')",'window.Imba')
		try
			Imba:mount = do |item| orig.call(Imba,item,@result.dom)
			eval(js)

		Imba:mount = orig
		self


	def render
		<self.snippet>
			if data:title
				<h4> data:title
			<code@code>
			if @runnable
				<div@result.styled-example>
		
export tag Example < Snippet

	def render
		<self> "Example"