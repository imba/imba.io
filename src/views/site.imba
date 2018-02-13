import HomePage from './HomePage'
import GuidesPage from './GuidesPage'
import DocsPage from './DocsPage'

extend tag element

	def root
		@owner_ ? @owner_.root : self

	def app
		root.app


export tag Site
	
	def app
		data
		
	def root
		self
		
	def router
		app.router
		
	def load
		console.log "loading app.router"
		Promise.new do |resolve|
			console.log "Site#load"
			setTimeout(resolve,200)
		
	def render
		console.log "render site",app.path
		<self>
			<header#header>
				<nav.content>
					<a.tab.logo href='/home'> <i> 'imba'
					<a.tab.home href='/home'> <i> 'home'
					<a.tab.guides href='/guide'> <i> 'guides'
					<a.tab.docs href='/docs'> <i> 'api'
					<a.tab.blog href='/blog'> <i> 'blog'
					if app.router.segment(0) == 'gists'
						<a.tab.blog href='/gists'> <i> 'gists'

					<span.greedy>
					<a.twitter href='http://twitter.com/imbajs'> <i> 'twitter'
					<a.github href='https://github.com/somebee/imba'> <i> 'github'
					<a.issues href='https://github.com/somebee/imba/issues'> <i> 'issues'
					<a.menu :tap='toggleMenu'> <b>
			
			<main>
				if router.scoped('/home')
					<HomePage>
				elif router.scoped('/guide')
					<GuidesPage>
				elif router.scoped('/docs')
					<DocsPage>

			<footer#footer> 
				<hr>
				<.lft> "Imba © 2015-2018"
				<.rgt>
					<a href='http://twitter.com/imbajs'> 'Twitter'
					<a href='http://github.com/somebee/imba'> 'GitHub'
					<a href='http://github.com/somebee/imba/issues'> 'Issues'
					<a href='http://gitter.im/somebee/imba'> 'Chat'
