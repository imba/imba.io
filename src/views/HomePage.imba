import Page from './Page'

import Example from './Snippet'
import Marked from './Marked'
import Pattern from './Pattern'
import Logo from './Logo'
import ScrimbaEmbed from './ScrimbaEmbed'


export tag HomePage < Page

	def render
		<self> <.body>
			<div#hero.dark>
				<Pattern@pattern>
				<.content>
					<Marked[app.guide['hero']]>
					<nav.buttons>
						# <a.button.try href='#'> "Try online"
						<a.button.start href='/guides'> "Get started"
						# <a.button.start href='/examples'> "Examples"
						<a.button.github href='https://github.com/somebee/imba'> "Github"

				# <herosnippet.hero.dark src='/home/examples/hero.imba'>
			<.content>
				<Marked.section.md.welcome.huge.light> """
					# Create complex web apps with ease!

					Imba is a programming language for the web that compiles to highly 
					performant and readable JavaScript. It has language level support for defining, 
					extending, subclassing, instantiating and rendering dom nodes. For a simple 
					application like TodoMVC, it is more than 
					[10 times faster than React](http://somebee.github.io/todomvc-render-benchmark/index.html) 
					with less code, and a much smaller library.
				"""
				<ScrimbaEmbed cid="cJV2aT9">
				<p.center> "The interactive screencasting platform Scrimba.com is written in Imba, both frontend and backend"
