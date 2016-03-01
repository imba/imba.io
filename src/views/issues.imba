import Router from '../router'

tag issue-entry

	def render
		<self>
			<.header>
				<a.title href="/blog/{object:number}-{Router.slug(object:title)}"> object:title
			<.legend>
				"by "
				<gh-user[object:user]>

			<.labels>
				for label in object:labels
					<gh-label[label]>

tag gh-label

	def render
		<self title=(object:name)> object:name
		if $web$
			css(background-color: '#' + object:color)
		self

tag gh-user < span

	def render
		<self>
			<a href="http://github.com/{object:login}"> object:login

tag issue

	def doc
		object.object

	def build
		commit

	def commit
		if object and object.ready
			unflag('loading')
			render
		else
			flag('loading')
		

	def render
		<self>
			<.header>
				<h1.title> doc:title
				<.legend>
					"Written by "
					<gh-user[doc:user]>
					" at {doc:created_at}"
			<.content.md html=(doc:md)>