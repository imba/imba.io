import {ls} from '../store'

tag app-menu-item

	prop data
	prop level = 0
	get active?
		$item.className.split(/\b/).includes('active')

	css
		.item fw:normal pos:relative d:block fw:500 py:0.5
			c:gray5/90 @hover:gray9 .active:gray9
			span of:hidden text-overflow:ellipsis ws:nowrap
			h:1rh o:0 pe:none mb:-1rh
			tween:all 200ms quint-out

		.children pl:15px
		a.active + .children > .child > .item o:1 pe:auto mb:0
		a.l1 o:1 pe:auto mb:0

	def render
		<self[d:contents] .{data.flagstr}>
			<a$item.item .l{level} route-to=data.href>
				<span> data.title

			if data.docs.length
				<div$children.children[$count:{data.docs.length}]>
					for child in data.docs
						<app-menu-item.child data=child level=(level + 1)>


	
tag app-menu-section

	css a cursor:pointer
	css .section.active + .content d:block

	prop bodyheight = 'auto'
	prop members

	<self>
		css d:block
			$bodyheight:{bodyheight}
			$count:{data.children.length}
			> a c:blue6 us:none py:2 fs:sm fw:500

		<a.l0.section.menu-heading href=data.href>
			css d:hflex a:center
			<span[c:hue6]> data.title
		<div.content.{data.slug}>
			<.children[pb:4 pl:2]> for item in (members or data.children)
				<app-menu-item data=item level=1>

tag app-menu
	current = null
	
	css 
		@after content:' ' bg:linear-gradient(white/0,white/100) l:vflex abs w:90% h:80px bottom:0
	
	get focused?
		document.activeElement == self

	def toggle
		if focused? then document.body.focus! else focus!

	def render
		<self tabIndex=-1>
			
			<div.scroller[pos:absolute ofy:auto inset:0 top:$header-height p:5 pr:0 pt:24px flex:1 d:vflex]>
				css 1rh:26px
				<div>
					
					for item,i in ls('/nav').children
						# if i == 1
						#	<app-search-field[bg:warmer1 p:2 rd:lg w:180px order:-1]>
						<app-menu-section[hue:blue] data=item members=item.children>
				
				<div.icons[d:hflex ja:center ai:center cg:10px c:blue5 order:0 px:2]>
					css 1icon:24px
						svg size:1icon c:hue5 @hover:hue7 stroke-width:1.5px
					css span d:none
					<a.indigo target='_blank' href='https://discord.gg/mkcbkRw'>
						<svg src='../assets/icons/message-circle.svg'>
						<span> "Chat"
					<a.blue target='_blank' href='https://github.com/imba/imba'>
						<svg src='../assets/icons/github.svg'>
					<a.sky target='_blank' href='https://twitter.com/imbajs'>
						<svg src='../assets/icons/twitter.svg'>
					<div[fl:1]>
				# <app-search-field[bg:warmer1 p:2 rd:lg w:180px order:-1]>
			<div[pos:absolute b:0 h:100px w:100% bg:linear-gradient(to bottom,white/0,white) l:0 pe:none]>