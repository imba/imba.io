var sections = ['Hero','About','Features','Resources']

# Play around
tag page-section
	prop revealed = 0

	def render
		<self.block.relative
			# only trigger when we start intersecting
			@intersect.in=showing
			# only trigger when we end intersecting
			@intersect.out=hiding
			# trigger on multiple thresholds
			@intersect(0,0.5,1)=(revealed = e.ratio)
		> <div.absolute.inset-0.p-10 .bg-blue-500=(revealed == 1)> <h1> name

	def showing e
		console.log 'showing',name
	
	def hiding e
		console.log 'hiding',name

imba.mount do
	<div.app>
		for section,i in sections
			<page-section
				css:height=300
				.bg-blue-{i % 2 ? 200 : 300}
				name=section>