import {ls,fs,File,Dir,find,api} from '../store'

tag Item
	css cursor:pointer d:hflex px:2 a:center pos:rel hue:warmer
		
	css
		&.link hue:blue
		&.interface hue:blue
		&.eventinterface hue:blue
		&.eventmodifier hue:amber
		&.event hue:amber
		&.property hue:cooler
		&.method hue:violet
		&.style hue:purple
		&.stylemod hue:purple
		&.styleprop hue:purple
		&.property hue:blue
	
	css .icon c:hue5
		
	# css @lt-md pt:2
	css .qualifier
		pos:abs fs:xxs b:0.5 l:9 c:warmer5 ws:pre d:hflex
	
	css .title
		i font-style:normal
		em fw:500 font-style:normal
		mb:10px
	
	
	

	<self @mousedown.stop.prevent.emit('go',data) @pointerover.emit('hover',index) .{data.kind}>
	
		<span.icon[p:1 mr:1]> <svg[c:hue5] src=data.icon>
		if data.kind == 'method' or data.kind == 'property'
			<.title>
				<span> data.owner.displayName
				<span> "."
				<em> data.displayName
			<span.qualifier> "Properties"
		elif data.kind == 'event'
			<.title> <em> data.displayName
			<span.qualifier> "Events"
		elif data.modifier?
			<.title>
				<span> data.owner.modifierPrefix + "."
				<em> data.displayName
			<span.qualifier> "Event Modifiers"
		elif data.kind == 'stylemod'
			<.title>
				<em> data.displayName
				# <span[c:gray4 fw:400]> " d:block"
			<span.qualifier> "Styles > Modifiers"
		elif data.kind == 'styleprop'
			<.title>
				# <span> "css "
				<em> data.displayName
				if data.alias
					<i[c:warmer5]> " / {data.alias}"
			<span.qualifier> "Styles > Properties"
		elif data.interface?
			<.title> <em> data.displayName
			<span.qualifier> "Interfaces"
		elif data.api?
			<.title>
				<em> data.displayName
			<span.qualifier> data.kind
			
		else
			# for parent in data.breadcrumb
			#	<.item innerHTML=(parent.head or parent.title)>
			#		css ws:pre d:hflex a:center suffix: " > " suffix@last: ""
			<.title.html.title[mb:8px] innerHTML=data.head>
				css c:gray9 fw:500
			<.qualifier> data.breadcrumb.map(do $1.title).join( " > ")


tag app-search
	query = ''
	hits = []
	#focus = 0 # number representing the index of match
	show-hits = 16

	def refresh
		if #matchQuery =? query
			let o = {
				query: query
				roots: [ls('/language'),ls('/tags'),ls('/css'),api]
			}
			hits = query ? find(query,o) : (recent or [])
			#focus = 0 # Math.max(0,Math.min(matches.length - 1,#focus))
			#pointing = no
			$main.scrollTop = 0

	def mount
		recent = (fs.locals.recent or []).map(do ls($1)).filter(do $1)
		flags.add('hidden')
		refresh!

	def moveUp
		#focus = Math.max(#focus - 1,0)
		autoScroll!

	def moveDown
		#focus = Math.min((#focus + 1),hits.length - 1,show-hits - 1)
		autoScroll!
		
	def autoScroll
		render!
		let bounds = $main.getBoundingClientRect!
		let el = querySelector(".nr{#focus}")
		let sel = el.getBoundingClientRect!

		let btm = sel.bottom - bounds.bottom + 12
		let top = sel.top - bounds.top - 74
		
		if btm > 0
			$main.scrollBy(0,btm)
			
		elif top < 0
			$main.scrollBy(0,top)
	
		# console.log bounds,sel,sel.bottom - bounds.bottom,btm,top
	
	def goToFocus
		go(hits[#focus])
	
	def go item
		recent.unshift(item)
		recent = recent.filter(do $3.indexOf($1) == $2)
		fs.locals.recent = recent.map(do $1.href)
		router.go(item.href)
		blur!

	def show
		flags.remove('hidden')
		clearTimeout(#hider)
		focus!
		$input.setSelectionRange(0,query.length)

	def hide
		# flags.remove('entered')
		return
		blur!
		#hider = setTimeout(&,1000) do flags.add('hidden')

	def focus
		$input.focus!

	def blur
		$input.blur!

	def focusout
		hide!
	
	def render
		<self
			@go=go(e.detail)
			@keydown.up.prevent=moveUp
			@keydown.down.prevent=moveDown
			@keydown.enter.prevent=goToFocus
			@keydown.esc=blur
			@focusout=focusout
			@hover.if(#pointing)=(#focus = e.detail)
			.empty=!hits.length
			>
			css inset:0 pos:fixed pe:none d:vflex ja:center zi:1000 j:flex-start
				1rh:40px $selIndex:{#focus} $matches:{matches.length}
				bg:cool9/0
				main y:-5px scale:0.95 o:0 pe:none
				&.empty o:1
				&.hidden d:none
				@focus-within bg:cool9/50
					main y:0px scale:1 o:1 pe:auto
					
				# bg:cool9/50
				# main y:0px scale:1 o:1 pe:auto

			css &.search2 bg:cool9/50
				main y:0px scale:1 o:1 pe:auto

			<main$main tabindex=-1>
				css w:600px bg:white bxs:xxl px:4 ofy:auto rd:md
					mt:20vh h:auto max-height:400px tween:styles 0.2s cubic-in-out
					@lt-md w:90% mt:60px l:5%

				<header[pos:sticky t:0 bg:white/85 zi:10 pt:4 pb:4]>
					
					<div[d:hflex ja:center]>
						<input$input type='text' bind=query 
							@input.debounce(50ms)=refresh
							placeholder="Search docs">
							css p:2 w:100% bg:white rd:md bd:gray2 bxs:xs
								@focus bxs:outline,xs bd:blue4
						<div hotkey='esc' @click=blur>
							css pos:relative w:0 h:6
							css @after d:block h:14px content:"esc" pos:absolute r:2
								rd:md bd:gray2 fs:xs h:100% px:1.5 c:gray5 d:hflex ja:center 
					# <.keycap[pos:abs r:4 t:2 ] hotkey='esc' @click=hide> 'esc'
				if hits == recent
					if recent.length == 0
						<div[pb:4]> <span[c:gray4]> "No recent searches."
					else
						<div[pb:4]> <span[c:gray4]> "Recent"
				<div$items[pos:rel pb:4] [d:none]=!hits.length @mousemove.silent=(#pointing = yes)>
					<div$selection>
						css h:1rh rd:md pos:abs bg:blue4/40 w:100% zi:0 y:calc($selIndex * 100%)
							tween:all 0.1s cubic-in-out
							o..empty:0
					<div[zi:1 pos:rel]>
						for match,i in hits when i < show-hits
							<Item[h:1rh] .nr{i} index=i $key=match.id data=match>