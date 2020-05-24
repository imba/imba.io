var sections = ['Hero','About','Features','Resources']

# Play around
tag page-section
	prop revealed = 0

	def render
		<self.(d:flex rel center m:8 h:200px bg:blue1)
			# only trigger when we start intersecting
			@intersect.in=showing
			# only trigger when we end intersecting
			@intersect.out=hiding
			# trigger on multiple thresholds
			@intersect(0,0.5,1)=(revealed = e.detail.ratio)

			.(bg:green3)=(revealed == 1)
		> <h1> name

	def showing e
		console.log 'showing',name
	
	def hiding e
		console.log 'hiding',name

imba.mount do
	<div.app.(d:block p:0)>
		for section,i in sections
			<page-section name=section>