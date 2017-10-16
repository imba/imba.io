
export class Lang
	
	def self.register name
		IM.LANGUAGES[name] = self

	def self.parserForView view
		var lang = IM.LANGUAGES[view.lang] or IM.LANGUAGES:plaintext
		return view.@parser ||= lang.new(view)

	register 'plaintext'

	prop view

	def initialize view
		@view = view

	def log *pars
		console.log(*pars)
		self

	def annotate view
		self

	def analyze view
		self

	def rawToHTML code
		return "<div class='_imraw'>{code}</div>"

	def reparse chunk
		return chunk

	def onmodified
		self