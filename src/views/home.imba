def shuffle array
	var counter = array:length, temp, index

	# While there are elements in the array
	while counter > 0
		# Pick a random index
		index = Math.floor(Math.random * counter)
		counter-- # Decrease counter by 1

		# And swap the last element with it
		temp = array[counter]
		array[counter] = array[index]
		array[index] = temp
	
	return array

tag pattern

	def build
		return self if Imba.SERVER

		var parts = {tags: [], keywords: [], methods: []}
		var items = []
		var lines = []

		for own k,v of Imba.Tag:prototype
			items.push("<em>{k}</em>")
			parts:methods.push("<em>{k}</em>")

		for k in HTML_TAGS
			# for own k,v of Imba.TAGS
			# if v and v:prototype isa Imba.Tag
			items.push("<u>&lt;{k}&gt;</u>")
			parts:tags.push("<u>&lt;{k}&gt;</u>")

		var words = "def if else elif while until for in of var let class extend export import tag global"

		for k in words.split(" ")
			items.push("<i>{k}</i>")
			parts:keywords.push("<i>{k}</i>")

		var shuffled = shuffle(items)
		var all = [].concat(shuffled)
		var count = items:length - 1

		for ln in [0 .. 14]
			let chars = 0
			lines[ln] = []
			while chars < 300
				let item = (shuffled.pop or all[Math.floor(count * Math.random)])
				if item
					chars += item:length
					lines[ln].push(item)
				else
					chars = 400

		dom:innerHTML = '<div>' + lines.map(|ln|
			'<div class="line">' + ln.join(" ") + '</div>'
		).join('') + '</div>'
		self

	def awaken
		log 'awakening pattern!!'
		return self

		for el,i in %(.line)
			var z = 20 + i * 10
			# z = parseInt(-z + Math.random * z * 2)
			el.css('transform',"translateZ({z}px)")
		self

tag home < page

	var todos = {demo: yes, autorun: yes}
	var clock = {demo: yes, autorun: yes}
	var reminders = {demo: yes, autorun: yes}
	var hero = {autorun: yes}
	var canvas = {demo: yes, autorun: yes}

	def awaken
		var snippets = document.querySelectorAll('code[data-src]')
		for snippet in snippets
			var src = snippet.getAttribute('data-src')
			# console.log 'fetching snippet for ',src
			DEPS[src] = {html: snippet:innerHTML}

		super

	def nav
		null

	def body
		<@body>
			<div#hero.dark>
				<pattern@pattern.awaken>
				<.gradient>
				<herosnippet.hero.dark src='/home/examples/hero.imba'>

			<@content>
				<marked.section.md.welcome.huge.light> """
					# Ruby, Python and React got together. Nine months later, Imba was born.

					Imba is a new programming language for the web that compiles to highly 
					performant and readable JavaScript. It has language level support for defining, 
					extending, subclassing, instantiating and rendering dom nodes. For a semi-complex 
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

				<example.dark heading="Simple reminders" src='/home/examples/reminders.imba'>

				<marked.section.md> """
					## Reusable components
					
					A custom tag / component can maintain internal state and control how to render itself.
					With the performance of DOM reconciliation in Imba, you can use one-way declarative binding,
					even for animations. Write all your views in a straight-forward linear fashion as if you could
					rerender your whole application on **every single** data/state change.
					"""

				<example.dark heading="World clock" src='/home/examples/clock.imba'>

				<marked.section.md> """
					## Extend native tags
					
					In addition to defining custom tags, you can also extend native tags, or inherit from them.
					Binding to dom events is as simple as defining methods on your tags; all events will be
					efficiently delegated and handled by Imba. Let's define a simple sketchpad...
					"""

				<example.dark heading="Custom canvas" src='/home/examples/canvas.imba'>

				# <footer>
				# 	<nav>
				# 		<a.button.huge.main href='/install'> "Install"
				# 		<a.button.huge href='/guides'> "Learn more"

	# def awaken
	# 	# awaken the snippets
	# 	schedule
	# 	for el in %(snippet)
	# 		el
	# 	self

	# def tick
	# 	log 'home.tick'
	# 	self

	# def assemble
	# 	return self if Imba.isClient
	# 	super
	# 	# flag('scoped',router.scoped(route,self))
	# 	# flag('selected',router.match(route,self))