import {fs,files,ls} from '../store'

tag app-menu-section

	# css .content d:none
	css a cursor:pointer
	css .section.active + .content d:block
	css .item.sub of:hidden text-overflow:ellipsis ws:nowrap

	def jumpTo section, ev
		console.log 'jump to',ev,section
		self

	<self>
		<a.section[d:block p:1 2 fs:xs c:gray5 tt:uppercase cursor:default] route-to=data.href> data.title
		<div[pb:4].content.{data.slug}> for item in data.children
			<a.item .{item.type} data=item .wip=item.meta.wip route-to=item.href> item.title
			<div.children[d@empty:none]> for sub in item.sections
				<a.item.sub data=sub .wip=sub.meta.wip href="#{sub.slug}" @click.stop=jumpTo(sub,e)> sub.title


tag app-menu

	css 
		@after content:' ' bg:linear-gradient(white/0,white/100) l:vflex abs w:90% h:80px bottom:0

		.item
			p:1 2 d:block radius:1
			c:gray6 @hover:gray9 .active:teal6
			bg:clear .active:teal2/25
			tween:all 150ms cubic tt.folder:capitalize
			&.sub fs:4/1.2 fw:400 ml:1 mt:-26px o:0 pointer-events:none
				@before content:'-' pr:2 o:0.4
			&.active + .children > .sub o:1 my:0 pointer-events:auto
			&.wip @after
				pos:relative d:inline-flex ai:center bg:yellow2 content:'wip'
				c:yellow6 fs:1/1 tt:uppercase p:1 radius:1 ml:1 va:top

	def render
		let root = data.root
		let docs = ls('/docs')
		let guides = ls('/guides')
		<self tabIndex=-1>
			<div.scroller[pos:absolute ofy:auto inset:0 top:$header-height p:5 flex:1]>
				# <app-menu-section data=ls('/manual')>
				for item in docs.children
					<app-menu-section data=item>
				# <app-menu-section data=ls('/tags')>
				# <app-menu-section data=ls('/views')>
				# <app-menu-section data=ls('/events')>
				# <app-menu-section data=ls('/styling')>
				<app-menu-section data=guides>
				# for child in guides.children
				#	<app-menu-section data=child>