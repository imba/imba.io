tag app-menu

	def render
		<self.text-sm>
			for child in data.root.children
				<h5.group.item.text-gray-500> child.name.toUpperCase!
				<.sections> for item in child.children
					<a.item.rounded route-to=item.href> item.title
					#  .selected=(item==data)

### css scoped

	app-menu {
		font-size: 14px;
		font-weight: 500;
		background: white;
		width: 250px;
		flex: 0 0 250px;
		padding: 20px;
	}

	.item {
		padding: 0.25rem 0.5rem;
	}
	.group {
		color: var(--gray-500);
		font-size: .75rem;
	}
	.sections {
		padding-bottom: 2rem;
	}

	a {
		text-decoration: none;
		display: block;
		color: var(--gray-600);
	}

	a:hover {
		color: var(--gray-900);
	}
	a.active {
		color: var(--teal-600);
		background: hsla(var(--teal-200-h),var(--teal-200-s),var(--teal-200-l),25%);
	}

###