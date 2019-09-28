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
						<a.button.start href='/guides'> "Get started"
						# <a.button.start href='/examples'> "Examples"
						<a.button.github href='https://github.com/somebee/imba'> "Github"
			<.content>
				<Marked.section.md.welcome.huge.light[app.guide['welcome']]>
				<ScrimbaEmbed cid="cGZB2f7">
				<p.center> <Marked[app.guide['scrimba']]>
