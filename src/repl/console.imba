def any item,context,depth = 0
	return null if depth > 3
	
	let typ = typeof item
	if Array.isArray(item)
		<span.{depth == 0 ? 'part' : 'array'}> for child in item
			<span.member> any(child,context,depth + 1)

	elif typ == 'string'
		<span.string> item
	elif typ == 'number'
		<span.number> item
	elif item isa context.Element
		<log-tag.element context=context depth=depth data=item>
	elif item isa context.Text
		<span.string.textnode> item.textContent
		# <span.element> <log-tag> "element" + String(item)
	elif item == null
		<span.null> 'null'
	elif typ == 'object'
		<span.object> for own k,v of item
			<span.pair>
				<span.key> k
				<span.value> any(v,context,depth + 1)
	else
		<span.any.{typ}> String(item)

tag log-tag
	# css & = color:blue7-50 prefix:'<' suffix:'>'
	css .tag = color:blue7-50 prefix:'<' suffix:'>'
	css .name = color:blue7
	css .attrname = color:blue6 ml:1
	css .attrvalue = prefix:"="
	css .attrstring = color:indigo6 prefix:'"' suffix:'"'
	css .child = mx:1 d:block
	css .more = color:gray5 px:1 radius:2 bg.hover:gray1 cursor:pointer

	prop context
	prop depth
	prop expanded = undefined

	def toggle
		expanded = !expanded
		render!

	def render
		if expanded == undefined and depth < 2
			expanded = yes

		# collapsed vs not
		let items = data.childNodes
		let text = items.length == 1 and items[0].nodeType == 3
		<self>
			<span.tag @click=toggle>
				<span.name> data.nodeName.toLowerCase!
				<span.attrs> for part in Array.from(data.attributes)
					<span.attr>
						<span.attrname> part.name
						<span.attrvalue> <span.attrstring> part.value
			if expanded and items.length and !text
				<span.children.(d:block ml:3)> for item in data.childNodes
					<span.child> any(item,context,1)
			elif text
				<span.(ml:1)> <span.string.textnode> items[0].textContent
			elif items.length
				<span.more @click=toggle> "..."

tag repl-console-item

	def render
		<self.item>
			for item in data
				<span.arg> any(item)

tag repl-console
	css & = cursor:default
	css .item = d:block p:2 3 mx:1 bb:gray2 t:gray6 md/1.4 500
	css .heading = d:block p:1 3 0 mx:1 t:gray5 sm 600 mb:-2

	css .string = color:green7 prefix:"'" suffix:"'"
	css .number = color:blue6
	css .key = color:indigo6
	css .arg = mr:1
	css .array = prefix:'[ ' suffix:' ]'
	css .array > * + * = prefix:', '
	css .textnode = color:gray6

	css .object
		prefix:'{ ' suffix:' }'
		& .key + .value = prefix: ': '
		& .pair + .pair = prefix: ', '

	prop native
	prop context

	def clear
		$body.innerHTML = ''

	def log ...params
		# $body.appendChild <repl-console-item[params]>
		$body.appendChild <div.item> any(params,context,0)

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