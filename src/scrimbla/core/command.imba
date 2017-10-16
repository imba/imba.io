
var Types = {}

export class Command
	
	self.Types = Types
	
	def self.sym sym, *pars
		let proto = self:prototype
		proto.@symbol = sym
		proto.@signature = pars
		Types[sym] = self
		Command[sym] = self

		pars.forEach do |name,i|
			proto[name] = do this.params[i]
		self

	def self.load *pars
		if var typ = Types[pars[0]]
			pars.shift
			typ.new(pars)

	prop view

	def initialize params, view
		@params = params
		@view = view
		self

	def params
		@params

	def run
		self

	def toJSON
		[@symbol,@params]

export class TextCommand < Command

export class InsertCommand < TextCommand
	sym 'Insert', 'point','string'

	def run view
		view.insert(point,string,self)

export class EraseCommand < TextCommand
	sym 'Erase', 'region', 'string'

	def run view
		view.erase(region,string,self)

export class ReplaceCommand < TextCommand
	sym 'Replace', 'region', 'string'

	def run view
		view.replace(region,string,self)