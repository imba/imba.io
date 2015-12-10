tag site < html

	prop deps

	def head
		<head>
			<title> "imba"
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1,minimum-scale=1">
			<meta name="Description" content="Imba is a rich programming language for the web.">
			<meta name="keywords" content="imba javascript language js">
			<link href='http://fonts.googleapis.com/css?family=Source+Code+Pro:400,500,600' rel='stylesheet' type='text/css'>
			<link rel="stylesheet" href="/css/site.css" media="screen">
			<script> 'DEPS = {};'
			<script src="/vendor/ga.js">

	def body
		<body#site>
			<site-nav#header.awaken>
			<home route='/home'>
			<guides route='/guides'>
			<docs route='/docs'>
			<blog route='/blog'>

	def scripts
		<.scripts>
			for own k,v of deps
				<script type="text/javascript" src=(k + '.dep')>
			<script src="/vendor/hl.js">
			<script src="/client.js">

	def render
		# dirty workarounds
		APP.site = self
		deps = {}
		APP.fetchDocument('/guides.md')
		var body = body
		body.append(scripts)

		<self.light>
			head
			body
		APP.site = null
		return self


tag site-nav

	def toggleMenu
		$$(body).toggleFlag('menu')

	def render
		<self>
			<nav.content>
				<a.menu :tap='toggleMenu'> <b>
				<a.tab.logo href='/home'> <i> 'imba'
				<span.greedy>
				<a.tab.home href='/home'> <i> 'home'
				<a.tab.guides href='/guides'> <i> 'guides'
				<a.tab.docs href='/docs'> <i> 'docs'
				<a.tab.blog href='/blog'> <i> 'blog'

				<a.github href='https://github.com/somebee/imba'> <i> 'github'

	def awaken
		schedule(fps: 0)
