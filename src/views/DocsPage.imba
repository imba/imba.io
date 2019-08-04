import Page from './Page'

tag Desc

	def html= html
		if html != @html
			dom:innerHTML = @html = html
		self

tag Ref

	def render
		<self>

tag Item	
	def pathToAnchor path
		'api-' + path.replace(/\./g,'_').replace(/\#/g,'__').replace(/\=/g,'_set')

tag Path < span
	prop short

	def setup
		var items = []
		var str = data
		if str isa String
			if short
				str = str.replace(/([A-Z]\w*\.)*(?=[A-Z])/g,'')

			html = str.replace(/\b([\w]+|\.|\#)\b/g) do |m,i|
				if i == '.' or i == '#'
					"<i>{i}</i>"
				elif i[0] == i[0].toUpperCase
					"<b class='const'>{i}</b>"
				else
					"<b class='id'>{i}</b>"
		self


tag Return
	attr name

	def render
		<self>
			<Path[data:value].value>
			<span.desc> data:desc

tag Class < Item

	prop data watch: :parse

	def parse
		@statics = (m for m in data['.'] when m:desc)
		@methods = (m for m in data['#'] when m:desc)
		@properties = []
		self

	def render
		<self>
			<span.toc-anchor id=pathToAnchor(data:namepath)>
			<.header> <.title> <Path[data:namepath]>
			<Desc html=data:html>
			if data:ctor
				<.content.ctor>
					<Method[data:ctor] path=(data:namepath + '.new')>

			<.content>
				if @statics:length > 0
					<.section>
						<h2.header> 'Static Methods'
						<.content.list> for item in @statics
							<Method[item].doc iname=data:namepath>

				if @methods:length > 0
					<.section>
						<h2.header> 'Instance Methods'
						<.content.list> for item in @methods
							<Method[item].doc iname=data:iname>

tag Value

	def render
		if data:type
			<self .{data:type}>
				data:value
		elif data isa String
			<self.str text=data>
		elif data isa Number
			<self.num text=data>
		self
		

tag Param

	def type
		data:type

	def render
		<self .{type}>
			if type == 'NamedParams'
				for param in data:nodes
					<Param[param]>
			else
				<.name> data:name
				if data:defaults
					<i> type == 'NamedParam' ? ': ' : ' = '
					<Value[data:defaults]>

tag Method < Item

	prop iname
	prop path

	def tags
		<div@tags>
			<Return[data:return] name='returns'> if data:return

			if data:deprecated
				<.deprecated.red> 'Method is deprecated'
			if data:private
				<.private.red> 'Method is private'


	def path
		@path or (iname + '.' + data:name)


	def slug
		pathToAnchor(data:namepath)

	def render
		<self .deprecated=(data:deprecated) >
			<span.toc-anchor id=slug>
			<.header>
				<Path[path]>
				<.params> for param in data:params
					<Param[param]>
				<.grow>
			<Desc.md html=data:html>
			tags

tag Link < a
	prop short

	def pathToAnchor path
		'api-' + path.replace(/\./g,'_').replace(/\#/g,'__').replace(/\=/g,'_set')

	def render
		<self href="/docs#{pathToAnchor(data:namepath)}"> <Path[data:namepath] short=short>
		super

	def ontap
		super
		trigger('refocus')

tag Group

	def ontap
		toggleFlag('collapsed')


export tag DocsPage < Page

	prop version default: 'current'
	prop roots

	def src
		"/api/{version}.json"

	def docs
		@docs

	def setup
		load
		super

	def load
		var docs = await app.fetch(src)
		DOCS = @docs = JSON.parse(JSON.stringify(docs))
		DOCMAP = @docs:entities
		generate
		if $web$
			loaded

	def loaded
		render
		if document:location:hash
			if var el = dom.querySelector(document:location:hash)
				el.scrollIntoView
		self
		
	def onrefocus e
		refocus

	def refocus
		if var el = dom.querySelector(document:location:hash)
			el.scrollIntoView
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
		
		<self>
			<nav@nav> <.content>
				for root in roots
					<Group.toc.class.section.compact>
						<.header> <Link[root].class>
						<.content>
							<.static>
								for meth in root['.'] when meth:desc and !meth:private
									<.entry> <Link[meth] short=yes>
							<.instance>
								for meth in root['#'] when meth:desc and !meth:private
									<.entry> <Link[meth] short=yes>
			<.body>
				for root in roots
					<Class[root].doc.l>
