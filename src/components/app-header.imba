tag app-header

	def render
		const tab = .{p:2 c:teal500 c.hover:teal600}
		<self.(l:flex center height:16 fw:500 border-bottom: 1px solid rgba(0,0,0,0.1) bg:white-80 z-index:200)>
			<.header-wrapper.(l:flex ai:center flex:1 px:4)>
				<app-logo.logo.(l:rel h:8 color:yellow500) route-to='/'>
				<.(flex: 1)>
				<a.{tab} route-to='/guides'> "Learn"
				<a.{tab} route-to='/examples'> "Examples"
				# <a.tab href='https://discord.gg/mkcbkRw' target='_blank'> "Chat"
				# <a.tab href='https://github.com/imba/imba' target='_blank'> "Repo"