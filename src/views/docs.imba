def pathToAnchor path
	'api-' + path.replace(/\./g,'_').replace(/\#/g,'__')

tag api-desc

	def html= html
		if html != @html
			dom:innerHTML = @html = html
		self

tag api-ref

	def render
		<self>

tag api-item

tag api-path < span

	def setup
		var items = []
		if data isa String
			html = data.replace(/\b([\w]+|\.|\#)\b/g) do |m,i|
				if i == '.' or i == '#'
					"<i>{i}</i>"
				elif i[0] == i[0].toUpperCase
					"<b class='const'>{i}</b>"
				else
					"<b class='id'>{i}</b>"
		self


tag api-link
	attr name

	def render
		<self>
			<api-path[data:value].value>
			<span.desc> data:desc

tag api-return < api-link

tag api-class < api-item

	prop data watch: :parse

	def parse
		@statics = (m for m in data['.'] when m:desc)
		@methods = (m for m in data['#'] when m:desc)
		@properties = []
		self

	def render
		<self>
			<span.toc-anchor id=pathToAnchor(data:namepath)>
			<.header> <.title> <api-path[data:namepath]>
			<api-desc html=data:html>
			if data:ctor
				<.content.ctor>
					<api-method[data:ctor] path=(data:namepath + '.new')>

			<.content>
				if @statics:length > 0
					<.section>
						<h2.header> 'Static Methods'
						<.content.list> for item in @statics
							<api-method[item].doc iname=data:namepath>

				if @methods:length > 0
					<.section>
						<h2.header> 'Instance Methods'
						<.content.list> for item in @methods
							<api-method[item].doc iname=data:iname>

tag api-value

	def render
		if data:type
			<self .{data:type}>
				data:value
		elif data isa String
			<self.str text=data>
		elif data isa Number
			<self.num text=data>
		self
		

tag api-param

	def type
		data:type

	def render
		<self .{type}>
			if type == 'NamedParams'
				for param in data:nodes
					<api-param[param]>
			else
				<.name> data:name
				if data:defaults
					<i> type == 'NamedParam' ? ': ' : ' = '
					<api-value[data:defaults]>

tag api-method < api-item

	prop iname
	prop path

	def tags
		<div@tags>
			if data:deprecated
				<.deprecated.red> 'Method is deprecated'
			<api-return[data:return] name='returns'> if data:return

	def path
		@path or (iname + '.' + data:name)

	def slug
		pathToAnchor(data:namepath)

	def render
		<self .deprecated=(data:deprecated) >
			<span.toc-anchor id=slug>
			<.header>
				<api-path[path]>
				<.params> for param in data:params
					<api-param[param]>
				<.grow>
			<api-desc.md html=data:html>
			tags

tag doc-link < a

	def render
		<self href="/docs#{pathToAnchor(data:namepath)}"> <api-path[data:namepath]>
		super

	def ontap
		super
		up(%docs).refocus

tag doc-group < toc

	def ontap
		toggleFlag('collapsed')


tag docs < page

	prop version default: 'current'
	prop roots

	def src
		"/api/{version}.json"

	def docs
		@docs

	def awaken
		load
		schedule
		self

	def setup
		load
		super

	def load
		if $node$
			# return self
			APP.fetchDocument(src) do |res|
				@docs = JSON.parse(JSON.stringify(res))
				generate
			return self

		@request ||= APP.fetchDocument(src) do |res|
			DOCS = @docs = res
			DOCMAP = @docs:entities
			generate
			loaded

	def loaded
		render
		# really?
		if document:location:hash
			if var el = first(document:location:hash)
				# console.log 'should scroll here?!?!?!',el
				el.dom.scrollIntoView
		self

	def refocus
		if var el = first(document:location:hash)
			el.dom.scrollIntoView
		self

	def lookup path
		docs:entities[path]

	def generate
		@roots = []
		var ents = @docs:entities

		for own path,item of docs:entities
			if item:type == 'class' or path == 'Imba'
				item['.'] = (item['.'] || []).sort.map(|path| ents[path] ).filter(|v| v:type == 'method' and v:desc )
				item['#'] = (item['#'] || []).sort.map(|path| ents[path] ).filter(|v| v:type == 'method' and v:desc )

				@roots.push(item) if item:desc
		self

	def render
		return self unless docs
		super

	def body
		<@body.light>
			for root in roots
				<api-class[root].doc.l>
	def nav
		<navmenu@nav>
			<.content>
				for root in roots
					<doc-group.class.section.compact>
						<.header> <doc-link[root].class>
						<.content>
							<.static>
								for meth in root['.'] when meth:desc
									<.entry> <doc-link[meth]>
							<.instance>
								for meth in root['#'] when meth:desc
									<.entry> <doc-link[meth]>


