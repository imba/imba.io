
tag app-carousel
	css d:block flw:nowrap ofx:scroll ws:nowrap pos:relative
		ofx:scroll scroll-snap-type:x mandatory ofy:hidden
		fl:0 0 auto
		scrollbar-width: none

		&@-webkit-scrollbar
			w:2px h:2px

		.item d:inline-block w:400px h:260px scroll-snap-align:center

	css $pages
		d:block flw:nowrap ws:nowrap pos:absolute t:0px l:0px
		>> * pos:abs w:100% h:100% t:0 l:0
		.abs-item w:100% h:100% bg:gray8/30 d:inline-block pos:abs bg:pink3 @odd:blue3

	iw = 800
	page = 0

	def mount
		#now = Date.now!
		#scrollAnchor = iw * 3	
		#offset = 0
		scrollLeft = iw * 3
		recenter!

	def scrolldone e
		let prev = #offset
		let moved = scrollLeft - #offset
		let offset = scrollLeft / iw

		# log 'scrolldone',scrollLeft,#scrollAnchor,offset,page,moved,#centering,e.debounced
		# if we ended scroll exactly on a page we can reset the position etc
		if offset % 1 == 0 and offset != 3 and !#centering
			clearTimeout(#timeout)
			#timeout = setTimeout(&,100) do recenter!
			# recenter!
	
	def recenter
		let prev = #offset
		let moved = scrollLeft - #scrollAnchor
		#offset += moved
		let pageOffset = ((#offset / iw) % 9 + 9) % 9
		# log 'offset is now',#offset,pageOffset
		# page is now a reference to the index that was previously offset at 4
		#centering = yes
		scrollLeft = #scrollAnchor
		
		# $pages.style.transform = "translateX({-#offset}px)"
		for item,nr in $pages.children
			let offset = (nr + 9 - pageOffset) % 9
			offset -= 9 if offset > 5
			item.style.transform = "translateX({offset * 100}%)"
			yes

		setTimeout(&,100) do #centering = no

	def render
		# return unless renderer

		<self
			@scroll.passive.silence.debounce(50ms)=scrolldone
			[w: {iw * 3}px]>
			for item in [0...9]
				<div.item style="width:{iw}px">
			<div$pages[l:{iw * 3}px w:{iw}px h:100%]>
				<slot>
				# for item,i in [1,2,3,4,5,6,7,8,9]
				#	<div.abs-item> renderer(item,i)