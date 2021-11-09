import {fs,files,ls,api} from '../store'

const triangleSVG =	`
	<svg width="5" height="6" viewBox="0 0 5 6" xmlns="http://www.w3.org/2000/svg">
		<path d="M5 3L0.5 5.59808L0.5 0.401924L5 3Z" fill="currentColor" />
	</svg>
`

css
	
	.item d:block c:gray5 fw:normal pos:relative d:block fw:500 py:1
	.item.active fw:500 c:gray9
	.item span
		of:hidden text-overflow:ellipsis ws:nowrap
		@hover c:gray9

	.triangle c:gray5 pos:absolute t:calc(50% - 3px) l:-10px tween:transform 150ms ease-in-out
	.active .triangle rotate:90deg
	.children pl:15px of:hidden tween:height 200ms ease-out
	&.wip > .item @after
		pos:relative d:inline ai:center bg:yellow3 content:'wip' rd:sm
		c:yellow7 fs:xxs/12px tt:uppercase px:1 py:0.5 rd:1 ml:1 va:middle fw:bold

tag app-menu-item

	prop data
	prop level = 0
	prop levelCutoff = 40

	get hasChildren?
		return false if data.api?
		return data.docs.length > 0
		# only children below level cutoff are shown as child sections in the menu
		const result = data.children.filter(do(c) c.level < levelCutoff)
		result.length > 0
	
	get renderChildren?
		hasChildren? && !data.reference? # and level < 1
	
	get active?
		# this is a hacky way to find out if this is the active section
		# but I don't know how the imba router works 
		$item.className.split(/\b/).includes('active')
	
	# children's natural height is calculated
	# and stored upon mount so that it can be animated to
	# could height change after mount?

	###
	childrenHeightValue = 0
	def mount
		if $children
			const oldHeightStyle = $children.style.height
			$children.style.height = 'auto'
			childrenHeightValue = $children.offsetHeight
			$children.style.height = oldHeightStyle
	
	get childrenHeight
		if active?
			if childrenHeightValue == null
				'auto'
			else
				childrenHeightValue
		else
			0
	
	def handleExpandSection
		childrenHeightValue = null
	###

	css
		.item d:block c:gray5 fw:normal pos:relative d:block fw:500 py:1
		.item.active fw:500 c:gray9
		.item span
			of:hidden text-overflow:ellipsis ws:nowrap
			@hover c:gray9

		.triangle c:gray5 pos:absolute t:calc(50% - 3px) l:-10px tween:transform 150ms ease-in-out
		.active .triangle rotate:90deg
		.children pl:15px of:hidden tween:height 200ms ease-out
			h:0px
		a.active + .children h:auto
		&.wip > .item @after
			pos:relative d:inline ai:center bg:yellow3 content:'wip' rd:sm
			c:yellow7 fs:xxs/12px tt:uppercase px:1 py:0.5 rd:1 ml:1 va:middle fw:bold
	

	def render
		<self[d:block] .{data.flagstr}>
			<a$item.item route-to=data.href>
				# <div.triangle innerHTML=triangleSVG> if hasChildren?
				<span> data.title

			if renderChildren? 
				<div$children.children[$count:{data.docs.length}]>
					css pl:15px of:hidden tween:height 200ms ease-out
					for child in data.docs
						continue if child.level >= levelCutoff
						<app-menu-item.child data=child>


	
tag app-menu-section

	css a cursor:pointer
	css .section.active + .content d:block

	prop bodyheight = 'auto'
	prop members

	def toggle
		data.locals.collapsed = !data.locals.collapsed

	def resized e
		try
			let height = e.entry.borderBoxSize[0].blockSize
			# log 'resized',e.rect,height
			bodyheight = (height)px

	<self .collapsed=data.locals.collapsed>
		css d:block
			$bodyheight:{bodyheight}
			$count:{data.children.length}
			> a c:blue6 us:none py:2 fs:sm fw:bold
			> a .chevron tween:all 0.2s # o:0 ml:-4 mr:0 
			> .content h:$bodyheight o:1 tween:all 0.2s mt:-1
			
		css &.collapsed
			> a c:blue5
			> a .chevron rotate:-90deg o:1 ml:-1
			> .content of:hidden h:0px o:0.4
			
		<a.l0.section.menu-heading @click=toggle>
			css d:hflex a:center
			<span[c:tint6]> data.title
			<svg[size:4 ml:0.5 c:tint6].chevron src='../assets/icons/chevron-down.svg'>
		<div.content.{data.slug}>
			<.children[pb:4 pl:2] @resize=resized> for item in (members or data.children)
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
		const kinds = [
			{locals: {}, children: api.kinds.interface, title: "Interfaces"}
			{locals: {}, children: api.kinds.eventinterface, title: "Events"}
			
		]
		<self tabIndex=-1>
			<div.scroller[pos:absolute ofy:auto inset:0 top:$header-height p:5 pr:0 flex:1]>
				# <.search hotkey='s' @hotkey.log('clicked s').prevent.wait(50ms).emit-showsearch>
				# 	css p:1 mx:2 px:0.25 h:8 d:hflex c:cool4 bdb:gray2 a:center
				# 	# <span[rd:md bd:gray2 fs:xs h:5 px:1 c:gray5 d:hflex ja:center]> 'S'
				# 	<span[fl:1 font-style:italic]> "Search docs..."
				# 	<span[rd:md bd:gray2 fs:xs h:5 px:1 c:gray5 d:hflex ja:center]> 'S'
				# <app-menu-section[c:pink6] data=ls('/intro')>
				if router.match('/api')
					<div>
						let base = ls('/api/menu')
						for item in base.children
							<app-menu-section[hue:blue] data=item>
							
						for item in kinds
							<app-menu-section[hue:blue] data=item>
						# <app-menu-section[hue:blue] data=ls('/css')>
						# let ev = {locals: {}, children: api.kinds.eventinterface, title: "Events"}
						# let styles = {locals: {}, children: api.kinds.eventinterface, title: "Styles"}
						# <app-menu-section[hue:cyan] data=ev>
						# <app-menu-section[hue:indigo] data=styles>
						# <div.menu-heading> "Events"
						# for item in api.kinds.eventinterface
						#	<app-menu-item data=item>
				# <div.triangle innerHTML=triangleSVG> if hasChildren?
				# <span> data.title
						
				else
					<div>
						<app-menu-section[hue:blue] data=ls('/language')>
						<app-menu-section[hue:blue] data=ls('/tags')>
						# <app-menu-section[hue:blue] data=ls('/events')>
						# <app-menu-section[c:indigo6] data=ls('/styling')>
						<app-menu-section[hue:blue] data=ls('/css')>
						<app-menu-section[hue:blue] data=ls('/advanced')>