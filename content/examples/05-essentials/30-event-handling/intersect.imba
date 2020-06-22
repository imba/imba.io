import '../styling/globals.imba'

var sections = ['Hero','About','Features','Resources']

tag page-section
	prop o = 0

	def render
		<self[pi:center h:300px bg:blue3 o:{o}].box
			@intersect(11)=(o = e.detail.ratio)
		> <h1> name

imba.mount do
	<div.box> for section,i in sections
		<page-section name=section>