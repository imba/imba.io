import {fs,files,ls} from '../store'

tag app-menu-item
	css tween:all 150ms cubic
		$height:26px .l1:30px

	css .item
		p:1 2 d:block radius:1
		c:gray6 @hover:gray9 .active:teal6
		tween:all 150ms cubic tt.folder:capitalize
		of:hidden text-overflow:ellipsis ws:nowrap
		fs:sm/1.2 fw:400
		# &.l1 fw:500 py:1.5
		&.doc.l2 fw:400
		&.active fw:500 c:gray9
		&.section pl:4
		# &.l3 fs:4/1.2 fw:400
		
	css .children pl:3
	css .children > * mt:calc($height * -1) o:0 pointer-events:none
	css .active + .children > * o:1 my:0 pointer-events:auto

	prop level = 0

	def jumpTo section, ev
		console.log 'jump to',ev,section
		self

	<self[d:block].l{level}>
		<a.item .l{level} .{data.type} data=data .wip=data.meta.wip route-to=data.href> data.title
		if data.children.length # and !data.options.tabbed and data.type != 'section'
			<div.children[d@empty:none]>
				# for sub in data.sections when !sub.hidden
				#	<a.segment.item.l{level + 1} data=sub .wip=sub.meta.wip href="{data.href}#{sub.slug}" @click.stop=jumpTo(sub,e)> sub.title
				for sub in data.children
					continue if sub.level >= 40
					<app-menu-item.sub data=sub level=(level + 1)>
	
tag app-menu-section

	# css .content d:none
	css a cursor:pointer
	css .section.active + .content d:block

	<self>
		<a.l0.section[d:block p:1 2 fs:xs c:teal5 tt:uppercase cursor:default] route-to=data.href> data.title
		<div[pb:4].content.{data.slug}> for item in data.children
			<app-menu-item data=item level=1>

tag app-menu

	css 
		@after content:' ' bg:linear-gradient(white/0,white/100) l:vflex abs w:90% h:80px bottom:0

		.item
			p:1 2 d:block radius:1
			c:gray6 @hover:gray9 .active:teal6
			bg:clear .active:teal2/25
			tween:all 150ms cubic tt.folder:capitalize
			&.wip @after
				pos:relative d:inline-flex ai:center bg:yellow2 content:'wip'
				c:yellow6 fs:1/1 tt:uppercase p:1 radius:1 ml:1 va:top

	def render
		console.log 'app-menu for data',data
		let root = data.root
		let docs = ls('/docs')
		let guides = ls('/guides')
		<self tabIndex=-1>
			<div.scroller[pos:absolute ofy:auto inset:0 top:$header-height p:5 pr:0 flex:1]>
				# <app-menu-section data=ls('/manual')>
				# for item in docs.children
				<app-menu-section data=ls('/intro')>
				# <app-menu-section data=ls('/manual')>
				<app-menu-section data=ls('/essentials')>
				<app-menu-section data=guides>
				<app-menu-section data=ls('/reference')>
				# <app-menu-section data=ls('/tags')>
				# <app-menu-section data=ls('/views')>
				# <app-menu-section data=ls('/events')>
				# <app-menu-section data=ls('/styling')>
				# <app-menu-section data=guides>
				# for child in guides.children
				#	<app-menu-section data=child>