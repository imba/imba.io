export class Stylesheet
		
	prop options
	prop view
	prop dom
	prop doc watch: yes

	def self.forFile file
		file

	def initialize view
		@options = {}
		@view = view
		@dom = document.createElement('style')
		@dom:innerHTML = '.item { }'
		refresh
		self

	def attachTo doc, options = {}
		self.doc = doc
		self.options = options
		refresh
		self

	def docDidSet new
		if new
			doc.adoptNode(dom)
			doc:head.appendChild(dom)

	def refresh
		var css = view.buffer.toString
		if options:fakePseudoStates
			css = css.replace(/:(hover|focus|active)/g) do |m,state| ".__{state}"
		dom:innerHTML = css