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
					<a.tab.gitter href='https://gitter.im/somebee/imba'> <i> 'community'
					<a.github href='https://github.com/somebee/imba'> <i> 'github'
					<a.menu :tap='toggleMenu'> <b>
			
			<HomePage route.exact='/'>
			<GuidesPage[app.guide] route='/guides'>

			<footer#footer> 
				<hr>
				<.lft> "Imba © 2015-2018"
				<.rgt>
					<a href='http://twitter.com/imbajs'> 'Twitter'
					<a href='http://github.com/somebee/imba'> 'GitHub'
					<a href='http://github.com/somebee/imba/issues'> 'Issues'
					<a href='http://gitter.im/somebee/imba'> 'Chat'
