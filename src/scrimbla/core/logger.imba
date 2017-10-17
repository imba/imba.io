
export class Logger
	
	prop enabled
	prop view

	def initialize view
		@enabled = $debug$
		@view = view
		self

	def log
		console.log(*arguments) if @enabled
		self

	def warn
		console.log(*arguments) if @enabled
		self

	def group name
		console.group(*arguments) if @enabled
		self

	def groupCollapsed
		console.groupCollapsed(*arguments) if @enabled
		self

	def groupEnd
		console.groupEnd if @enabled
		self

	def time name
		console.time(name) if @enabled
		self

	def timeEnd name
		console.timeEnd(name) if @enabled
		self


