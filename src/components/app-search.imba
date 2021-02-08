import {ls,fs,File,Dir,find} from '../store'

tag Item
	css cursor:pointer d:hflex px:4 a:center
	

	<self @mousedown.stop.prevent.emit-go(data) @pointerover.emit-hover(index)>
		<.path>
			css d:hflex c:gray6
			for parent in data.parents
				<.item>
					css ws:nowrap d:hflex a:center
					<span.title innerHTML=(parent.head or parent.title)>
					<svg[size:14px o:0.7 mt:2px mx:1] src='../assets/icons/chevron-right.svg'>
		<span.html.title innerHTML=data.head>
			css c:gray9 fw:500
		if data.legend
			<.legend[c:gray5 ml:1 fs:sm]> data.legend


tag app-search
	query = ''
	hits = []
	#focus = 0 # number representing the index of match

	def refresh
		if #matchQuery =? query
			let o = {
				query: query
				roots: [ls('/language'),ls('/tags'),ls('/events'),ls('/css')]
			}
			let matcher = query.toLowerCase!.replace(/\-/g,'')
			hits = find(matcher,o)
			#focus = 0 # Math.max(0,Math.min(matches.length - 1,#focus))
			#pointing = no

	def mount
		refresh!

	def moveUp
		#focus = Math.max(#focus - 1,0)

	def moveDown
		#focus = (#focus + 1) % hits.length
	
	def goToFocus
		go(hits[#focus])
	
	def go item
		log 'go!!'
		router.go(item.href)
		blur!

	def show
		focus!
		$input.setSelectionRange(0,query.length)

	def hide
		blur!

	def focus
		$input.focus!

	def blur
		$input.blur!
	
	def render
		<self
			@go=go(e.detail)
			@keydown.up.prevent=moveUp
			@keydown.down.prevent=moveDown
			@keydown.enter.prevent=goToFocus
			@keydown.esc=blur
			@hover.if(#pointing)=(#focus = e.detail)
			.empty=!hits.length
			>
			css inset:0 pos:fixed pe:none d:vflex ja:center zi:1000 j:flex-start
				1rh:40px $selIndex:{#focus} $matches:{matches.length}
				bg:blue6/0
				main y:-5px scale:0.95 o:0 pe:none
				
				&.empty o:1

				@focus-within bg:blue6/10
					main y:0px scale:1 o:1 pe:auto

			css &.sezarch bg:blue6/10
				main y:0px scale:1 o:1 pe:auto

			<main tabindex=-1>
				css w:600px bg:white bxs:xxl px:4 ofy:auto rd:md
					mt:20vh h:auto max-height:400px tween:styles 0.2s cubic-in-out
				<header[pos:sticky t:0 bg:white/85 zi:10 pt:4]>
					
					<div[d:hflex ja:center]>
						<input$input type='text' bind=query 
							@input.debounce(50ms)=refresh
							placeholder="Search docs">
							css p:2 w:100% bg:white rd:md bd:gray2 bxs:xs
								@focus bxs:outline,xs bd:blue4
						<div hotkey='esc' @click=hide>
							css pos:relative w:0 h:6
							css @after d:block h:14px content:"esc" pos:absolute r:2
								rd:md bd:gray2 fs:xs h:100% px:1.5 c:gray5 d:hflex ja:center 
					# <.keycap[pos:abs r:4 t:2 ] hotkey='esc' @click=hide> 'esc'

				<div$items[pos:rel mt:2 pb:4] @mousemove.silent=(#pointing = yes)>
					<div$selection>
						css h:1rh rd:md pos:abs bg:blue4/40 w:100% zi:0 y:calc($selIndex * 100%)
							tween:all 0.1s cubic-in-out
							o..empty:0
					<div[zi:1 pos:rel]>
						for match,i in hits when i < 16
							<Item[h:1rh] index=i $key=match.id data=match>