tag app-header

	def render
		<self>
			<img.logo>
			<a.tab route-to='/'> "Home"
			<a.tab route-to='/guides'> "Learn"
			<a.tab route-to='/examples'> "Examples"
			<a.tab href='https://discord.gg/mkcbkRw' target='_blank'> "Chat"
			<a.tab href='https://github.com/imba/imba' target='_blank'> "Repo"

### css scoped
app-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	height: 64px;
	width: 100%;
}

a.active {
	color: var(--teal-600);
}

###