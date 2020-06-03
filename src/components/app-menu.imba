tag app-menu

	css &:after
		content: ' '
		bg: linear-gradient(white-0,white-100)
		l: vflex abs
		width: 90%
		height: 80px
		bottom: 0

	css .scroller
		-webkit-overflow-scrolling: touch
		l: rel scroll-y inset:0 p:5 flex:1

	css .handle
		l:abs flex center size:12 left:100% top:18 ml:-14 x:100vw
		radius:2 bg:white shadow:sm opacity:0.9 color:teal5
		t:lg l.md: hidden border:gray2

	css .tabs = l:flex radius:2 bg:teal1 cursor:pointer mb:4 l.not-md:hidden
	css .tab = l:flex center py:2 radius:2 flex:1 t:teal5 bg.hover:teal2-20
	css .tab.active = bg:teal2 t:teal7

	css .item =
		p:1 2 l:block t:gray6 radius:1 t.hover:gray9
		t.is-active:teal6 bg.is-active:teal2-25
		&.folder = t:capitalize
	
	css .item.sub =
		t:14px/1.2 400 ml:1 prefix: '–' pr.before:2 opacity.before:0.3 mt:-26px opacity:0
		transition:all 150ms cubic
		pointer-events:none
	
	css .item.active + .children > .item.sub = opacity:1 my:0 pointer-events:auto

	css .wip::after
		l:rel inline-flex center bg:yellow2 content: 'wip'
		t:yellow6 10px/1 uppercase p:1 radius:1 ml:1 top:-1px
	
	css $logo = opacity.not-md:0

	css div.children = l.empty:hidden

	css div.keywords
		px:2

		& .item
			l:inline-block t:12px/1.2 lowercase mr:1 mb:1 p:1
			radius:2 bg:gray2
			& .children = l:hidden

	def render
		<self tabIndex=-1>
			# <div.handle> "☰"
			<div.scroller>
				# <app-logo$logo.(l:rel block h:14 mb:4 t:teal4 l:flex center) route-to='/'>
				# <div.tabs>
				#	<a.tab.active hotkey='g' route-to.sticky='/guides'> "Guides"
				#	<a.tab hotkey='m' route-to.sticky='/manual'> "Manual"
				#	<a.tab hotkey='c' @click.emit('showide')> "Code"

				for child in data.root.children
					<h5.(p:1 2 t:xs gray5 uppercase)> child.title
					<div.(pb:8).{child.slug}> for item in child.children
						<a.item .{item.type} data=item .wip=item.meta.wip route-to=item.href> item.title
						<div.children> for sub in item.children
							<a.item.sub data=sub .wip=sub.meta.wip route-to=sub.href> sub.title