# use imba-router
require 'imba-router'

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
	
	def setup
		router.@redirects['/guides'] = '/guides/essentials/introduction'
		
		if $web$
			router.on 'hashchange' do |hash|
				return unless router.hash
				let el = dom.querySelector(router.hash)
				el.scrollIntoView(true) if el
		self
		
	def app
		data
		
	def root
		self

	# def router
	# 	app.router
		
	def load
		self

	###
        If you have some CSS skills, try updating the hamburger menu item to
        change into an X so it's clear that pressing the hamburger menu item
        closes the sidebar.
	###
	def onselectedtoc
		toggleMenu()
			
	def toggleMenu
		document:body:classList.toggle('menu')
		
	def render
		<self>
			<header#header>
				<nav.content>
					<a.tab.logo route-to.exact='/'><Logo>
					<span.greedy>
					<a.tab.home route-to.exact='/'> <i> 'home'
					<a.tab.guides route-to='/guides'> <i> 'learn'
					<a.tab.guides route-to='/docs'> <i> 'docs'
					<a.tab.gitter href='http://spectrum.chat/imba' target="_blank"> <i> 'community'
					<a.github href='https://github.com/imba/imba' target="_blank"> <i> 'github'
					<a.menu :tap='toggleMenu'> <b>
			
			<HomePage route.exact='/'>
			<GuidesPage[app.guide] route='/guides'>
			<DocsPage route='/docs'>

			<footer#footer> 
				<hr>
				<.lft> "Imba © 2015-2019"
				<.rgt>
					<a href='http://twitter.com/imbajs' target="_blank"> 'Twitter'
					<a href='http://github.com/imba/imba' target="_blank"> 'GitHub'
					<a href='http://github.com/imba/imba/issues' target="_blank"> 'Issues'
					<a href='http://spectrum.chat/imba' target="_blank"> 'Chat'
