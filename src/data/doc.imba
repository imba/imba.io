export class Doc

	var cache = {}

	def self.get path, type
		var cache = APP.cache
		cache['doc-' + path + '.' + type] ||= self.new(path,type)

	prop path
	prop object

	def ready
		@ready

	def initialize path, type, app
		@type = type
		@path = path
		@app = app
		@ready = no
		fetch
		self

	def src
		path + (@type ? ".{@type}" : '')

	def fetch
		if $node$
			# console.log 'fetch Guide on server',path,src
			return @app.fetchDocument(src) do |res|
				# console.log 'fetch Guide on server done',path
				load(res)

		@promise ||= @app.fetchDocument(src) do |res|
			load(res)

	def load doc
		@object = doc
		@meta = doc:meta or {}
		@ready = yes
		Imba.emit(self,'ready')
		Imba.emit(Imba,'event',['doc:load'])
		Imba.commit
		# force mark dirty?
		# Imba.Scheduler.markDirty
		self

	def title
		@object:title or 'path'

	def toc
		@object and @object:toc[0]

	def body
		@object and @object:body