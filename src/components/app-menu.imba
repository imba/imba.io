import {fs,files,ls} from '../store'

const triangleSVG =	`
	<svg width="5" height="6" viewBox="0 0 5 6" xmlns="http://www.w3.org/2000/svg">
		<path d="M5 3L0.5 5.59808L0.5 0.401924L5 3Z" fill="currentColor" />
	</svg>
`


tag app-menu-item

	levelCutoff = 40

	get hasChildren?
		# only children below level cutoff are shown as child sections in the menu
		const result = data.children.filter(do |c| c.level < levelCutoff)
		result.length > 0
	
	get renderChildren?
		hasChildren? && !data.reference?
	
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
		.item c:gray6 fw:normal pos:relative d:block
		.item	.item-title
			py:2px of:hidden text-overflow:ellipsis ws:nowrap
			@hover c:gray9
		item.active fw:500 c:gray9
		.triangle c:gray5 pos:absolute t:calc(50% - 3px) l:-10px tween:transform 150ms ease-in-out
		.active .triangle rotate:90deg
		.children pl:15px of:hidden tween:height 200ms ease-out
		&.wip .item-title @after
			pos:relative d:inline ai:center bg:yellow3 content:'wip' rd:sm
			c:yellow7 fs:xxs/12px tt:uppercase px:1 py:0.5 rd:1 ml:1 va:middle fw:bold
	

	def render
		<self .{data.flagstr}>

			<a$item.item route-to=data.href>
				<div.triangle innerHTML=triangleSVG> if hasChildren?
				<div.item-title> data.title

			if renderChildren?
				<div$children.children [h:{active? ? 'auto' : 0}px]>
					for child in data.children
						continue if child.level >= levelCutoff
						<app-menu-item.child data=child>


	
tag app-menu-section

	# css .content d:none
	css a cursor:pointer
	css .section.active + .content d:block

	<self>
		<a.l0.section[d:block p:1 2 fs:sm- fw:600 tt:uppercase cursor:default c:teal6] route-to=data.href> data.title
		<div[pb:4 pl:2].content.{data.slug}> for item in data.children
			<app-menu-item data=item level=1>

tag app-menu

	css 
		@after content:' ' bg:linear-gradient(white/0,white/100) l:vflex abs w:90% h:80px bottom:0

	def render
		# console.log 'app-menu for data',data
		let root = data.root
		let guides = ls('/guides')
		let ref = ls('/reference')
		let main = data.path.indexOf('essentials') >= 0 ? ls('/essentials') : ls('/manual')
		<self tabIndex=-1>
			<div.scroller[pos:absolute ofy:auto inset:0 top:$header-height p:5 pr:0 flex:1]>
				# for item in docs.children
				<app-menu-section[c:pink6] data=ls('/intro')>
				<app-menu-section[c:blue6] data=ls('/language')>
				<app-menu-section[c:purple6] data=ls('/tags')>
				<app-menu-section[c:indigo6] data=ls('/styling')>
				# <app-menu-section data=main>
				# <app-menu-section data=ls('/tags')>
				# <app-menu-section data=ls('/styling')>
				# <app-menu-section data=guides>
				# <app-menu-section data=ref>
				# <app-menu-section data=ls('/reference')>
				# <app-menu-section data=ls('/tags')>
				# <app-menu-section data=ls('/views')>
				# <app-menu-section data=ls('/events')>
				# <app-menu-section data=ls('/styling')>
				# <app-menu-section data=guides>
				# for child in guides.children
				#	<app-menu-section data=child>