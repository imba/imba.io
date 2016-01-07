import Doc from './doc'

export class Gist < Doc
	
	prop id

	def initialize id, object
		@id = id
		@object = {}
		@ready = no
		object ? load(object) : fetch
		self

	def src
		"/gists/{id}.json"

	def fetch
		@promise ||= APP.fetchDocument(src) do |res| load(res)

	def then cb
		if @ready
			cb and cb(self)
		else
			Imba.once(self,'ready') do cb(self)
		self

	def files
		@object:files

	def title
		@object and @object:description or 'Loading gist'

class Gist.File

	def initialize data
		@data = data
		self
		