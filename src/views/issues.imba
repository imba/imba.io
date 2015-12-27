
tag issue-li

	def render
		<self>
			<.header>
				<a.title href="/blog/{object:number}"> object:title
			<.labels>
				for label in object:labels
					<.label> label:name

tag issue

	def render
		<self>
			<.header>
				<.title> object.title
			<.content.md html=(object.object:md)>