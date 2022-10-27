# Global CSS applies to your entire app
global css @root ff:Arial c:white/87 bg:black/85
global css a c:indigo5 c@hover:indigo6
global css body inset:0 d:box

# Tags are compiled to actual DOM nodes using custom elements
tag app-counter
	# Use plain variables for state -- no need for state management libraries
	count = 0
	# Event listeners are defined with @
	<self @click=count++>
		# String interpolation with {}
		"count is {count}"
		# CSS block without a selector applies to the enclosing element
		css user-select:none fs:6 bg:gray9 p:2.5 5 m:6 bd:1px solid transparent rd:4
			tween:border-color 250ms bc@hover:indigo5

tag app
	glow = no
	# Inline styles with square brackets
	<self[d:vflex ja:center]>
		# This css applies to nested `img` elements and not parents
		css img h:35 p:1.5em tween:transform 250ms, filter 250ms
		# This css applies to nested elements with the `.glow` class
		css .glow transform:scale(1.1) filter:drop-shadow(0 0 4em red4)
		# Conditionally apply classes with booleans
		<img.wing .glow=glow src="https://raw.githubusercontent.com/imba/branding-imba/master/yellow-wing-logo/imba.svg">
		css @lt-lg d:none
		<h1[c:yellow4 fs:3.2em]> "Imba"
		# Imba automatically re-renders after every handled event
		<app-counter @pointerover=(glow=yes) @pointerleave=(glow=no)>
		
# Mount any element to the document with `imba.mount`
imba.mount <app>
