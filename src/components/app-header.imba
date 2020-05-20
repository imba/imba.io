tag app-header

	css .tab = p:2 t:blue500 t.hover:blue600

	<self.(l:flex center t:500 bb:rgba(0,0,0,0.1) bg:white-80 z-index:200)>
		<div.(l:flex ai:center flex:1 px:4)>
			<app-logo.logo.(l:rel h:8 t:yellow500) route-to='/'>
			<span.(flex: 1)>
			<a.tab route-to='/guides'> "Learn"
			# <a.tab route-to='/reference'> "Manual"
			<a.tab route-to='/repl'> "Playground"
			<a.tab route-to='/examples'> "Examples"
			# <a.tab href='https://discord.gg/mkcbkRw' target='_blank'> "Chat"
			# <a.tab href='https://github.com/imba/imba' target='_blank'> "Repo"