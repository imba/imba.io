tag site < html

	prop deps

	let analytics = """
	window.ga=window.ga||function()\{(ga.q=ga.q||[]).push(arguments)\};ga.l=+new Date;
	ga('create', 'UA-65877753-1', 'auto');
	ga('send', 'pageview');
	"""

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
			<script> analytics
			<script async='async' src="//www.google-analytics.com/analytics.js">

	def body
		<body#site data-route=(router.segment(0))>
			<site-nav#header.awaken>
			<home route='/home'>
			<guides route='/guides'>
			<docs route='/docs'>
			<blog route='/blog'>
			<footer> 
				<hr>
				<.lft> "Imba © 2015-2016"
				<.rgt>
					<a href='http://twitter.com/imbajs'> 'Twitter'
					<a href='http://github.com/sombee/imba'> 'GitHub'
					<a href='http://github.com/sombee/imba/issues'> 'Issues'
					<a href='http://gitter.im/sombee/imba'> 'Chat'
			<gist#gist.awaken>

	def scripts
		<.scripts>
			for own k,v of deps
				<script type="text/javascript" src=(k + '.dep')>
			<script src="/vendor/hl.js">
			<script src="/client.js">

	def render
		# dirty workarounds
		APP.site = self
		deps = {
			"/issues/all.json": yes
			"/gists/all.json": yes
		}

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
				<a.tab.logo href='/home'> <i> 'imba'
				<a.tab.home href='/home'> <i> 'home'
				<a.tab.guides href='/guides'> <i> 'guides'
				<a.tab.docs href='/docs'> <i> 'api'
				<a.tab.blog href='/blog'> <i> 'blog'
				if router.segment(0) == 'gists'
					<a.tab.blog href='/gists'> <i> 'gists'

				<span.greedy>
				<a.twitter href='http://twitter.com/imbajs'> <i> 'twitter'
				<a.github href='https://github.com/somebee/imba'> <i> 'github'
				<a.issues href='https://github.com/somebee/imba/issues'> <i> 'issues'
				<a.menu :tap='toggleMenu'> <b>

	def awaken
		schedule(fps: 0)
