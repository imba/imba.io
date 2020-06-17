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
	css .tag color:blue7/50 content@before:'<' content@after:'>'
	css .name color:blue7
	css .attrname color:blue6 ml:1
	css .attrvalue content@before:"="
	css .attrstring color:indigo6 content@before:'"' content@after:'"'
	css .child mx:1 d:block
	css .more color:gray5 px:1 radius:2 bg.hover:gray1 cursor:pointer

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
	css cursor:default $count: 0

	css .item d:block p:2 3 mx:1 bbw:1px bbc:gray2 c:gray6 fs:md/1.4 fw:500
	css .part > .member mr:1
	css .heading d:block p:1 3 0 mx:1 c:gray6 fs:sm fw:500 mb:-2

	css .string
		white-space: pre-wrap
		color:green7 content@before:"'" content@after:"'"
	css .number color:blue6
	css .key color:indigo6
	css .arg mr:1
	css .array content@before:'[ ' content@after:' ]'
	css .array > * + * content@before:', '
	css .textnode color:gray6

	css .object
		m:0
		content@before:'{s '
		content@after:' }'
		.key + .value content@before: ': '
		.pair + .pair content@before: ', '

	css .counter
		bg:gray3 mx:1 px:1 radius:10 min-width:6 color:gray6/70 d:inline-block fs:xs fw:bold ta:center

	prop native
	prop context
	prop count = 0

	def clear
		$body.innerHTML = ''
		count = 0

	def log ...params
		$body.appendChild <div.item> any(params,context,0)
		count++

	def info ...params
		# special case
		$body.appendChild <div.heading> params[0]
		count++

	def relayout e
		$scroller.scrollTop = e.rect.height - $scroller.offsetHeight

	def render
		<self>
			<header[bg:gray2]>
				<.tab.active[flex-grow:1] @click=flags.toggle('expanded')>
					<span> "Console"
					<span.counter> count
				<button @click=clear [d:none]=(!count)> 'Clear'
			<.content[pos:relative flex:1 bg:white]>
				<div$scroller[pos:absolute d:block ofy:auto inset:0]>
					<div$body[d:block] @resize=relayout>