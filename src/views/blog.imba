
tag blog < page

	def nav
		<navmenu@nav>
			<.content>
				<h1> "No items?"
	def body
		<@body>
			"No posts"

tag blogpost < article

	def render
		<self>
			<header> <h1> object:title
			<section.md> object:body