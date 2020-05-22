

def array items
	<span.array> for item in items
		<span> any(item)

def any item,depth = 0
	return null if depth > 2
	
	let typ = typeof item
	if Array.isArray(item)
		<span.array> for child in item
			<span.member> any(child,depth + 1)

	elif typ == 'string'
		<span.string> item
	elif typ == 'number'
		<span.number> item
	elif item == null
		<span.null> 'null'
	elif typ == 'object'
		<span.object> for own k,v of item
			<span.pair>
				<span.key> k
				<span.value> any(v,depth + 1)
	else
		<span.any.{typ}> String(item)

tag repl-console-item

	def render
		<self.item>
			for item in data
				<span.arg> any(item)

tag repl-console
	css span = font-weight:500 color:gray5 t:md/1.2
	
	css .item = d:block p:1 2 mx:1 bb:gray2 t:gray7
	css .heading = d:block p:1 2 0 mx:1 t:gray5 sm 600 mb:-1

	css .string = color:green7
		&:before = content: "'"
		&:after = content: "'"

	css .number = color:blue6
	css .key = color:indigo6
	css .arg = mr:1

	css .array:before = content:'[ '
	css .array:after = content:' ]'
	css .array > * + *:before = content:', '


	css .object
		&:before = content: '{ '
		&:after = content: ' }'
		& .key + .value:before = content: ': '
		& .pair + .pair:before = content: ', '

	prop native

	def clear
		$body.innerHTML = ''

	def log ...params
		$body.appendChild <repl-console-item[params]>

	def info ...params
		# special case
		$body.appendChild <div.heading> params[0]

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