tag app-header

	def render
		<self>
			<img.logo>
			<a.tab route-to='/'> "Home"
			<a.tab route-to='/guides'> "Learn"
			<a.tab route-to='/examples'> "Examples"
			<a.tab> "Chat"
			<a.tab> "Repo"
			<button :click.reroute> "reroute"

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