import Lang from '../base/lang'
import Stylesheet from './stylesheet'

export class CSSLang < Lang
	register 'css'

	def annotate view
		self

	def analyze view
		self

	def output
		@output ||= Stylesheet.new(view,self)

	def onmodified
		# updates should be async
		@output?.refresh # updating the stylesheet live
		self

	def rawToHTML code
		return "<div class='_imraw'>{code}</div>"