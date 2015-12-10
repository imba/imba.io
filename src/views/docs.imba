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

	def build
		var items = []
		if object isa String
			html = object.replace(/\b([\w]+|\.|\#)\b/g) do |m,i|
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
			<api-path[object:value].value>
			<span.desc> object:desc

tag api-return < api-link

tag api-class < api-item

	prop object watch: :parse

	def parse
		@statics = (m for m in object['.'] when m:desc)
		@methods = (m for m in object['#'] when m:desc)
		@properties = []
		self

	def render
		<self>
			<span.toc-anchor id=pathToAnchor(object:namepath)>
			<.header> <.title> <api-path[object:namepath]>
			<api-desc html=object:html>
			if object:ctor
				<.content.ctor>
					<api-method[object:ctor] path=(object:namepath + '.new')>

			<.content>
				if @statics:length > 0
					<.section>
						<h2.header> 'Static Methods'
						<.content.list> for item in @statics
							<api-method[item].doc iname=object:namepath>

				if @methods:length > 0
					<.section>
						<h2.header> 'Instance Methods'
						<.content.list> for item in @methods
							<api-method[item].doc iname=object:iname>

tag api-value

	def render
		if object:type
			<self .{object:type}>
				object:value
		elif object isa String
			<self.str text=object>
		elif object isa Number
			<self.num text=object>
		self
		

tag api-param

	def type
		object:type

	def render
		<self .{type}>
			if type == 'NamedParams'
				for param in object:nodes
					<api-param[param]>
			else
				<.name> object:name
				if object:defaults
					<i> type == 'NamedParam' ? ': ' : ' = '
					<api-value[object:defaults]>

tag api-method < api-item

	prop iname
	prop path

	def tags
		<div@tags>
			if object:deprecated
				<.deprecated.red> 'Method is deprecated'
			<api-return[object:return] name='returns'> if object:return

	def path
		@path or (iname + '.' + object:name)

	def slug
		pathToAnchor(object:namepath)

	def render
		<self .deprecated=object:deprecated >
			<span.toc-anchor id=slug>
			<.header>
				<api-path[path]>
				<.params> for param in object:params
					<api-param[param]>
				<.grow>
			<api-desc.md html=object:html>
			tags

tag doc-link < a

	def render
		<self href="/docs#{pathToAnchor(object:namepath)}"> <api-path[object:namepath]>
		super

	def ontap
		super
		up(%docs).refocus

tag doc-group < toc

	def ontap
		toggleFlag('collapsed')


tag docs < page

	prop version default: '0.14.1'
	prop roots

	def src
		"/api/{version}.json"

	def docs
		@docs

	def awaken
		load
		schedule
		self

	def build
		load
		super

	def load
		if Imba.SERVER
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


