# Play around
tag page-section

	def render
		<self.block> <slot>

imba.mount do
	<div.app>
		<page-section css:height=200> "One section"
		<page-section> "Another section"
		<page-section> "Third section"
