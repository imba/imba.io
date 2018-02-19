import HomePage from './HomePage'
import GuidesPage from './GuidesPage'
import DocsPage from './DocsPage'
import Logo from './Logo'

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
					<Logo>
					<a.tab.logo href='/home'> <i> 'imba'
					<span.greedy>
					<a.tab.home href='/home'> <i> 'home'
					<a.tab.guides href='/guide'> <i> 'learn'
					# <a.tab.docs href='/docs'> <i> 'api'
					<a.tab.docs href='/examples'> <i> 'examples'
					# <a.twitter href='http://twitter.com/imbajs'> <i> 'twitter'
					<a.github href='https://github.com/somebee/imba'> <i> 'github'
					# <a.issues href='https://github.com/somebee/imba/issues'> <i> 'issues'
					<a.menu :tap='toggleMenu'> <b>
			
			<main>
				if router.scoped('/home')
					<HomePage>
				elif router.scoped('/guide')
					<GuidesPage[app.guide]>
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
