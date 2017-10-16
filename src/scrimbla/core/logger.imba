
export class Logger
	
	prop enabled
	prop view

	def initialize view
		@enabled = $debug$
		@view = view
		self

	def log
		console.log(*arguments) if @enabled or DEBUG
		self

	def warn
		console.log(*arguments) if @enabled or DEBUG
		self

	def group name
		console.group(*arguments) if @enabled or DEBUG
		self

	def groupCollapsed
		console.groupCollapsed(*arguments) if @enabled or DEBUG
		self

	def groupEnd
		console.groupEnd if @enabled or DEBUG
		self

	def time name
		console.time(name) if @enabled or DEBUG
		self

	def timeEnd name
		console.timeEnd(name) if @enabled or DEBUG
		self


