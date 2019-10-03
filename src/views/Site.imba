# use imba-router
require 'imba-router'

import HomePage from './HomePage'
import GuidesPage from './GuidesPage'
import DocsPage from './DocsPage'
import Logo from './Logo'

import Languages from '../util/languages.imba'

extend tag element

	def root
		@owner_ ? @owner_.root : self

	def app
		root.app


export tag Site

	# The language for the site, defaults to English
	prop language default: "en", watch: yes

	# Reload the guides contents based on the selected language
	def languageDidSet
		await app.refetchGuide(language)
		# Make sure we get a redraw of the screen
		Imba.commit
	
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
					<Logo>
					<a.tab.logo route-to.exact='/'> <i> 'imba'
					<span.greedy>
					<a.tab.home route-to.exact='/'> <i> 'home'
					<a.tab.guides route-to='/guides'> <i> 'learn'
					<a.tab.guides route-to='/docs'> <i> 'docs'
					<a.tab.gitter href='https://gitter.im/somebee/imba'> <i> 'community'
					# GitHub and Twitter icons are from https://simpleicons.org
					<a.github href='https://github.com/somebee/imba'> <i>
						<img src="/images/github.svg">
					<a.twitter href='https://twitter.com/imbajs'> <i>
						<img src="/images/twitter.svg">
					<a.menu :tap='toggleMenu'> <b>
			
			<HomePage route.exact='/'>
			<GuidesPage[app.guide] route='/guides'>
			<DocsPage route='/docs'>

			<footer#footer> 
				<hr>
				<.lft> "Imba © 2015-2019"
				<.rgt>
					<a href='http://twitter.com/imbajs'> 'Twitter'
					<a href='http://github.com/somebee/imba'> 'GitHub'
					<a href='http://github.com/somebee/imba/issues'> 'Issues'
					<a href='http://gitter.im/somebee/imba'> 'Chat'
				<span>
					"Languages: "
					<select[language]> for lang in Languages
						<option value=lang:value> lang:name
					" ?lang={language}"
