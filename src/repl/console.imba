

def array items
	<span.array> for item in items
		<span> any(item)

def any item
	if Array.isArray(item)
		<span.array> for child in item
			<span.member> any(child)

	elif typeof item == 'string'
		<span.string> item
	elif typeof item == 'number'
		<span.number> item
	else
		<span.any> String(item)

tag repl-console-item

	def render
		<self.(d:block p:1 2 mx:1 bb:gray200 t:gray700)>
			for item in data
				<div> any(item)
				# if Array.isArray(item)
				#	<div> "array!!"
				# <span.item.{typeof item}> String(item)

tag repl-console
	css span = font-weight:500 color:gray500
	
	css .string = color:green7
		&:before = content: '"'
		&:after = content: '"'

	css .number = color:blue6

	css .array:before = content:'[ '
	css .array:after = content:' ]'
	css .array > * + *:before = content:', '

	def clear
		$body.innerHTML = ''

	def log ...params
		$body.appendChild <repl-console-item[params]>

	def relayout e
		$scroller.scrollTop = e.rect.height - $scroller.offsetHeight

	def render
		<self>
			<header.(bg:gray200)>
				<.tab.active.(flex-grow:1)> "Console"
				<button @click=clear> 'Clear'
			<.content.(l:rel flex:1)>
				<div$scroller.(l:abs block scroll-y inset:0)>
					<div$body.(l:block) @resize=relayout>