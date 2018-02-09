import Page from './Page'

import Example from './Snippet'
import Marked from './Marked'
import Pattern from './Pattern'


export tag HomePage < Page

	def render
		<self> <.body>
			<div#hero.dark>
				<Pattern@pattern>
				# <herosnippet.hero.dark src='/home/examples/hero.imba'>
			<.content>
				<Marked.section.md.welcome.huge.light> """
					# Create complex web apps with ease!

					Imba is a new programming language for the web that compiles to highly 
					performant and readable JavaScript. It has language level support for defining, 
					extending, subclassing, instantiating and rendering dom nodes. For a simple 
					application like TodoMVC, it is more than 
					[10 times faster than React](http://somebee.github.io/todomvc-render-benchmark/index.html) 
					with less code, and a much smaller library.

					---

					- ## Imba.inspiration
					  Imba brings the best from Ruby, Python, and React (+ JSX) together in a clean language and runtime.

					- ## Imba.interoperability
					  Imba compiles down to clean and readable JavaScript. Use any JS library in Imba and vica-versa.
					
					- ## Imba.performance
					  Build your application views using Imba's native tags for unprecedented performance.

					"""

				<Example.dark heading="Simple reminders" src='/home/examples/reminders.imba'>

				<Marked.section.md> """
					## Reusable components
					
					A custom tag / component can maintain internal state and control how to render itself.
					With the performance of DOM reconciliation in Imba, you can use one-way declarative bindings,
					even for animations. Write all your views in a straight-forward linear fashion as if you could
					rerender your whole application on **every single** data/state change.
					"""

				<Example.dark heading="World clock" src='/home/examples/clock.imba'>

				<Marked.section.md> """
					## Extend native tags
					
					In addition to defining custom tags, you can also extend native tags, or inherit from them.
					Binding to dom events is as simple as defining methods on your tags; all events will be
					efficiently delegated and handled by Imba. Let's define a simple sketchpad...
					"""

				<Example.dark heading="Custom canvas" src='/home/examples/canvas.imba'>