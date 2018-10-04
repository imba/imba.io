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
					
					Imba was born to make developing web applications fun again.
					It features a clean and readable syntax inspired by ruby,
					compiles to readable and performant JavaScript, and works inside the existing ecosystem.
					
					Imba treats DOM elements as a first-class citizens. Your declarative views are compiled to a [memoized dom](/guides/advanced/performance),
					which is an [order of magnitude faster](https://somebee.github.io/dom-reconciler-bench/index.html) than todays virtual 
					dom implementations. We truly believe that it opens up for a new way of developing web applications.
				"""
				<ScrimbaEmbed cid="cGZB2f7">
				<p.center> "The interactive screencasting platform Scrimba.com is written in Imba, both frontend and backend"
				# <ScrimbaEmbed cid="cwQBZH9">