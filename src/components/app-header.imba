tag app-header

	def render
		<self.flex.flex-row.justify-center>
			<.header-wrapper.flex.flex-row.items-center.flex-1>
				<app-logo.logo>
				# <a.tab route-to='/'> "Home"
				<a.tab route-to='/guides'> "Learn"
				<a.tab route-to='/examples'> "Examples"
				<a.tab href='https://discord.gg/mkcbkRw' target='_blank'> "Chat"
				<a.tab href='https://github.com/imba/imba' target='_blank'> "Repo"

### css scoped
app-header {
	height: 64px;
	width: 100%;
	font-weight: 500;
	border-bottom: 1px solid rgba(0,0,0,0.1);
	backdrop-filter: blur(10px);
	background: rgba(255,255,255,0.9);
}

.header-wrapper {
	padding: 0px 1rem;
	max-width: var(--page-max-width);
}

.logo >>> svg {
	height: 32px;
}

a {
	color: #daafff;
	color: var(--gray-600);
}

a:hover {
	color: var(--gray-900);
}

a.active {
	color: var(--teal-600);
}

###