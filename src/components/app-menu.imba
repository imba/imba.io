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
				l:rel inline-flex center bg:yellow2 content:'wip'
				c:yellow6 fs:1/1 tt:uppercase p:1 radius:1 ml:1 top:-1px

	def render
		<self tabIndex=-1>
			<div.scroller.(l:abs scroll-y inset:0 top:$header-height p:5 flex:1)>
				for child in data.root.children
					<h5.(p:1 2 fs:xs c:gray5 tt:uppercase)> child.title
					<div.(pb:8).{child.slug}> for item in child.children
						<a.item .{item.type} data=item .wip=item.meta.wip route-to=item.href> item.title
						<div.children.(l@empty:hidden)> for sub in item.children
							<a.item.sub data=sub .wip=sub.meta.wip route-to=sub.href> sub.title