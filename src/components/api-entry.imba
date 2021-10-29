import {api,ls} from '../store'

def template str
	str = str.trim!
	let cache = new Map
	return do(item,...objs)
		if cache.has(item)
			return cache.get(item)
			
		let out = str
		out = out.replace(/%%([\w\-]+)/g) do
			for obj in objs
				return obj[$2] if obj[$2]
			return item[$2]
		cache.set(item,out)
		return out

# class Tpl
# 	cache = new Map
# 	def constructor str
# 		template = str
# 		
# 	def render item
# 		if cache.has(item)
# 			return cache.get(item)
# 		let str = template
# 		str = str.replace(/%%([\w\-]+)/g) do
# 			let val = item[$1]
# 			val
# 		cache.set(item,str)
# 		return str

const snippets = {}

snippets.cssprop = template `
# in declaration
css div
	%%name:value
# inline style
<section>
	<div[%%name:value]> ...
`

snippets.stylemod = template `
# in declaration
css div
	%%name display:block color:indigo5
	opacity:0.5 %%name:1
# inline style
<section>
	<div[display%%name:block]> ...
`

snippets.cssaliased = template `
# in declaration
css div
	%%name:value
# inline style
<section>
	<div[%%name:value]> ...
# using alias
css div %%alias:value
<div[%%alias:value]>
`

snippets.cssaliased = template `
# in declaration
css div
	%%name:value
# inline style
<section>
	<div[%%name:value]> ...
# using alias
css div %%alias:value
<div[%%alias:value]>
`

snippets.eventmodifier = template `
<div %%qualifier%%displayName=handler>
`


css
	h1 fs:34px/1.4 fw:600 pb:2
		span @before c:gray4/40
		span @after c:gray4/40
	h2 fs:26px/1.2 fw:600 pb:3 bwb:0px mb:0
	h3 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid hue7 
	h4 fs:16px/1.2 fw:500 pb:2 bwb:0px mb:0
	a c:blue6
	b fw:700
	a em fw:500 font-style:normal
	
	a.h3 @force
		fs:18px/1.2 fw:500 pb:1 bwb:0px mb:3 bdb:1px solid hue7 
		c:hue7 d:block w:max-content
		@hover td:none c:hue6

	.link hue:blue
	.interface hue:blue
	.eventinterface hue:blue
	.eventmodifier,.modifiers hue:amber
	.event,.events hue:violet
	.property,.properties hue:cooler
	.method hue:violet
	.style,.styleprop hue:purple
	.stylemod hue:purple
	.property hue:blue
	a.link c:hue7
	
	app-code-inline d:inline-block
	
	.breadcrumb
		fw:400 mt:-4px fs:sm
		& > span
			c:gray5
			suffix: " » "
			suffix@last: ""
			@after c:gray4 fw:normal
			a fw:500
		
	.pill
		px:4px py:3px rd:md bg:hue1 c:hue7 d:inline-block fs:sm- lh:14px
	
	api-link
		d:inline-block
		&.event,&.eventmodifier,&.pill,&.styleprop,&.stylemod
			p:0 bg:clear
			a@force px:4px py:3px rd:md bg:hue1 c:hue7 d:inline-block fs:sm- lh:14px
				@before c:hue9 fw:normal
				@hover bg:hue2
		# &.inherited bg:hue0
		
		a[data-qualifier] @before
			content: '.'
	
	.compact api-link a @before d:none
	
	
	
	dt api-link a fw:500
		px:4px py:3px rd:md bg:hue1 c:hue7 d:inline-block fs:sm- lh:14px
	
	dt,dd bdb:1px solid gray2/70 py:2
	dt fw:600 pr:2
	dd c:gray6
	dl
		mb:2 @empty:0 fs:sm
		d:grid gtc: max-content auto
		bdt:1px solid gray2/70
	h3 + dl bdt:0px
	
	.markdown@force >>>
		h1 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid hue7 mt:6
		h3 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid hue7 mt:6
		h4 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid hue7 mt:6
		p my:4 @only:0
		a c:blue6
		app-code-inline d:inline-block

tag api-el
	set data value
		if typeof value == 'string'
			value = api.lookup(value)
		#data = value
		
	get data
		#data

tag api-link < api-el
	def hydrate
		let text = textContent
		data = api.lookup(text) or {displayName: text}
		# console.warn "hydrating!!!",text,data
		
	<self.link.{data.kind}>
		<a href=data.href data-qualifier=data.qualifier>
			<span> <slot> data.displayName 

tag api-links
	pills = no
	
	<self>
		let up = data
		if up.length
			<slot>
			for item,i in data
				if i > 0
					<span> (i == data.length - 1) ? " and " : ", "
				<api-link .pill=pills data=item>
			
tag api-parents
	prop members = []

	<self>
		let up = data.parents
		if up.length
			<p>
				<slot> "This interface also inherits properties of its parents, "
				for item,i in up
					if i > 0
						<span> (i == up.length - 1) ? " and " : ", "
					<api-link data=item>
				if members.length
					<span> ": "
					for item in members
						<api-link[mr:4px].inherited .pill data=item>

tag api-section
	css mt:10
		
	set data value
		if typeof value == 'string'
			value = api.lookup(value)
		#data = value
		
	get data
		#data
		
	<self> <slot>

tag api-props < api-section

	name = 'Properties'
	
		
	<self .{name.toLowerCase!} [d:none]=(data.length == 0)>
		<h3> <slot name='head'> name
		<slot>
		<dl> for item in data.own
			<dt> <api-link.pill data=item> # item.displayName
			<dd.markdown innerHTML=item.summary>
		<slot name='foot'>
		let inherited = data.inherited
		if inherited.length
			<api-parents data=data.owner members=inherited> "This interface inherits {name.toLowerCase!} of "

tag api-entry-properties < api-props
	<self>
		<api-props name='Properties' data=data.properties>
			
tag api-entry-methods < api-props
	
tag api-entry-events < api-section
	<self.events>
		<h3> <slot name='head'> 'Events'
		<dl> for item in data.events
			<dt> <api-link.pill data=item> # <.pill> item.displayName
			<dd.markdown innerHTML=item.summary>
			
tag api-entry-modifiers
	
	<self>
		<api-props name='Modifiers' data=data.modifiers>


tag api-docs
	<self.markdown[d@empty:none]>
		if data.docs
			<div innerHTML=data.docs>

	
tag api-entry-examples < api-section
	<self[hue:blue d@empty:none]>
		if data.examples.size > 0
			<h3> "Examples"
			<div> for item of data.examples
				<div[mb:10 @last:4]> <app-code-block href=item.path>

tag api-entry
	css hue:blue
	<self>

		if data.kind == 'interface'
			<h1> data.name
			<api-docs data=data>
			<api-entry-events[hue:orange] data=data>
			<api-entry-properties[hue:cooler] data=data.properties>
			<api-entry-modifiers[hue:purple] data=data>
		
		elif data.kind == 'eventinterface'
			<h1> data.name
			<api-docs data=data>
			<api-entry-modifiers data=data>
			<api-entry-events data=data>
			<api-props name='Properties' data=data.properties>
			<api-props name='Methods' data=data.methods>
			<api-entry-examples data=data>
		
		elif data.kind == 'event'
			<h1>
				<span[fw:normal suffix: " › "]> <api-link data=data.type>
				<span> data.name
				
			<api-docs data=data>
			
			unless data.meta.Syntax
				<api-section>
					# only if there is no syntax from the other
					<h3> "Syntax"
					<app-code-block raw="<div {data.displayName}=handler>">
					
			<api-section>
				<h3> "Modifiers"
				
				<div>
					<span> "The {data.displayName} event supports the following modifiers: "
					for item in data.modifiers
						<api-link[mr:4px].inherited .pill data=item>

			<api-props name='Properties' data=data.properties>
				<p slot='head'> <api-link data=data.type>

			<api-entry-examples data=data>
		
		elif data.kind == 'eventmodifier'
			<h1>
				<span[fw:normal suffix: " › "]> <api-link data=data.owner>
				<span> "." + data.displayName
			<api-docs data=data>
			
			unless data.meta.Syntax
				<api-section>
					# only if there is no syntax from the other
					<h3> "Syntax"
					<app-code-block raw="<div @event.{data.displayName}=handler>">
			
			<api-entry-examples data=data>
			
			<api-section>
				<h3> "See also"
				<p> for item in data.siblings
					<api-link[mr:4px].inherited .pill data=item>
			
		elif data.kind == 'method'
			<h1>
				<span[fw:normal]> <api-link data=data.owner>
				<span> "." + data.displayName
			<api-docs data=data>
			<div> "Other methods on {<api-link data=data.owner>} include "
				for item in data.siblings
					<api-link[mr:4px].inherited .pill data=item>

		elif data.kind == 'property'
			<h1>
				<span[fw:normal]> <api-link data=data.owner>
				<span> "." + data.displayName
			<api-docs data=data>
			<div[my:4]> "Other properties on {<api-link data=data.owner>} include "
				for item in data.siblings
					<api-link[mr:4px].inherited .pill data=item>

tag api-interface-entry < api-entry
	
	<self>
		<h1> data.name
		<api-docs data=data>
		<api-props name='Properties' data=data.properties>
		<api-props name='Methods' data=data.methods>

tag api-eventinterface-entry < api-interface-entry
	<self>
		<h1> data.name
		<api-docs data=data>
		<api-entry-modifiers data=data>
		<api-entry-events data=data>
		<api-props name='Properties' data=data.properties>
		<api-props name='Methods' data=data.methods>
		<api-entry-examples data=data>
		

tag api-property-entry < api-entry
	
	<self>
		<h1>
			<span[fw:normal]> <api-link data=data.owner>
			<span> "." + data.displayName
		<api-docs data=data>
		<div[my:4]> "Other properties on {<api-link data=data.owner>} include "
			for item in data.siblings
				<api-link[mr:4px].inherited .pill data=item>
	
tag api-method-entry < api-entry
	
	<self>
		<h1>
			<span[fw:normal]> <api-link data=data.owner>
			<span> "." + data.displayName
		<api-docs data=data>
		<div> "Other methods on {<api-link data=data.owner>} include "
			for item in data.siblings
				<api-link[mr:4px].inherited .pill data=item>
	
tag api-event-entry < api-entry
	<self>
		<.breadcrumb>
			<span> <a href='/api'> "API"
			<span> <api-link data="/api/Element">
			<span> "Events"
		<h1>
			# <span[fw:normal suffix: " / " ]> <api-link data="/api/Element">
			<span> "{data.name}"
			# <span[fw:normal c:gray5]> " event"
			
		<p> "The object passed into the event handler for {data.name} is a {<api-link data=data.type>}"
			
		<api-docs data=data>
		
		unless data.meta.Syntax
			<api-section>
				# only if there is no syntax from the other
				<h3> "Syntax"
				<app-code-block raw="<div {data.displayName}=handler>">
		
		<api-entry-modifiers data=data.type>

		<api-props name='Properties' data=data.properties>
			<p slot='head'>
				<api-link data=data.type>
				<span> " interface"
			
		if data.type != api.Event and data.type.events.length > 1
			<api-section>
				<h3> "Related Events"
				<dl> for item in data.type.events when item != data
					<dt> <api-link.pill data=item> # <.pill> item.displayName
					<dd.markdown innerHTML=item.summary>

		<api-entry-examples data=data>

tag api-eventmodifier-entry < api-entry
	<self>
		<.breadcrumb>
			<span> <a href='/api'> "API"
			<span> <a href=data.owner.href> data.owner.displayName
			<span> "Modifiers"
		<h1>
			# <span[fw:normal suffix: " › "]> <api-link data=data.owner>
			# <span[fw:normal suffix: " › "]> <api-link data=data.owner>
			<a href=data.owner.href> data.owner.modifierPrefix
			<span> "." + data.displayName
		<api-docs data=data>
		
		unless data.meta.Syntax
			<api-section>
				# only if there is no syntax from the other
				<h3> "Syntax"
				<app-code-block raw=snippets.eventmodifier(data)>
				# <app-code-block raw="<div @event.{data.displayName}=handler>">
		
		# if data.guide
		# 	<doc-section data=data.guide level=0 body-only=yes>
		
		<api-entry-examples data=data>
		
		<api-section>
			<h3> "See also"
			<p> for item in data.siblings
				<api-link[mr:4px].inherited .pill data=item>

tag api-entry-toc
	
	<self>
	# <h3> "See also"
	# <div> for item in data.siblings
	# 	<api-link[d:block] data=item>
	
	# <h4> "Interfaces"
	# <div>
	# 	for item in api.kinds.interface
	# 		<api-link[d:block] data=item>
	# 	for item in api.kinds.eventinterface
	# 		<api-link[d:block] data=item>
	# <api-entry-list items=api.kinds.interface.concat(api.kinds.eventinterface)>
			

tag api-interface-toc < api-entry-toc
tag api-eventinterface-toc < api-interface-toc
tag api-event-toc < api-entry-toc
tag api-property-toc < api-entry-toc
tag api-method-toc < api-entry-toc
tag api-eventmodifier-toc < api-entry-toc	

tag api-styleprop-entry < api-entry
	
	get example
		ls("/examples/css/{data.name}.imba") or ls("/examples/css/{data.alias}.imba")

	<self>
		<.breadcrumb>
			<span> <a href='/css/syntax'> "CSS"
			<span> <a href='/css/properties'> "Properties"
		<h1>
			<span.name> data.displayName
			if data.alias
				<span.alias[c:gray4 mx:3 fw:400 prefix:'/ ']> data.alias
		<api-docs data=data>
		
		unless data.meta.Syntax
			<api-section>
				# only if there is no syntax from the other
				<h3> "Syntax"
				# <app-code-block raw=snippets.cssprop(data)>
				if data.alias
					# <p> "For this property you can also use the alias:"
					<app-code-block raw=snippets.cssaliased(data)>
				else
					<app-code-block raw=snippets.cssprop(data)>
					
		if data.guide
			<doc-section data=data.guide level=0 body-only=yes>
					
		if example
			<api-section>
				<h3> "Examples"
				<app-code-block href=(example.href)>
		
		if data.related.length
			<api-section>
				<h3> "See also"
				<p> for item in data.related
					<api-link[mr:4px] .pill data=item>
					

tag api-stylemod-entry < api-entry
	
	get example
		ls("/examples/css/{data.name}.imba") or ls("/examples/css/{data.alias}.imba")

	<self.stylemod>
		<.breadcrumb>
			<span> <a href='/css/syntax'> "CSS"
			<span> <a href='/css/modifiers'> "Modifiers"
		<h1>
			<span.name> data.displayName
		<api-docs data=data>
		
		unless data.meta.Syntax
			<api-section>
				# only if there is no syntax from the other
				<h3> "Syntax"
				<app-code-block raw=snippets.stylemod(data)>
					
		if example
			<api-section>
				<h3> "Examples"
				<app-code-block href=(example.href)>
		
		if data.related.length
			<api-section>
				<h3> "See also"
				<p> for item in data.related
					<api-link[mr:4px] .pill data=item>


		
tag api-modifiers-list
	<self>
		for data in api.kinds.eventinterface when data.modifiers.own.length
			<api-section.events>
				<h3> "{<a href=data.href> data.name} Modifiers"
				<dl> for item in data.modifiers.own
					<dt> <api-link.pill data=item> # item.displayName
					<dd.markdown innerHTML=item.summary>

		# 	<slot name='foot'>
		# <api-props name='Modifier reference' data=api.Event.modifiers>
		
		
tag api-styleprop-list
	
	def hydrate
		# not called when hydrated?
		items = api.kinds.styleprop.sort do(a,b) a.shortName > b.shortName ? 1 : -1
		
	<self>
		<api-section.style>
			<h3> "Shorthands and Custom Properties"
			<div>
				css d:grid gtc:1fr 1fr 1fr rg:2 cg:1
				for item in items when (item.alias or item.custom?)
					<a[mr:1 fs:sm ws:nowrap d:hflex ofx:hidden] href=item.href>
						<span.pill[bg:hue1/100 fw:500]> item.shortName
						<span[c:gray5/80 mx:1 ofx:hidden text-overflow:ellipsis fs:xs]> item.aliasFor

		
		<api-section.style>
			<h3> "Style Properties"
			<div>
				css d:grid gtc:1fr 1fr 1fr rg:2 cg:1
				let group = ''
				for item in items
					let chr = item.name[0]
					if group != chr
						<div[w:3col fw:600 d:hflex]>
							<span[tt:uppercase px:0.5]> "{group = chr}"
					<a[mr:1 fs:sm ws:nowrap d:hflex ofx:hidden] href=item.href>
						<span.pill[bg:hue1/50 fw:500]> item.name
						if item.alias
							<span.alias[c:gray5/80 mx:1]> item.alias


tag Stylemods
	<self>
		css d:grid gtc:1fr 1fr 1fr rg:2 cg:1
		for item in data
			<a[mr:1 fs:sm ws:nowrap d:hflex ofx:hidden] href=item.href>
				<span.pill[bg:hue1/50 fw:500]> item.name

tag app-reference-page
	
	<self>
		<api-section>
			<h3> "Interfaces"
			<api-entry-list.collapsed.interface items=api.kinds.interface.concat(api.kinds.eventinterface)>
			# <api-entry-list kind='eventinterface'>
			
		<api-section>
			<h3> "Events"
			<api-entry-list.collapsed.event items=api.kinds.event>
			
		<api-section>
			<h3> "Event Modifiers"
			<api-entry-list.collapsed.event items=api.kinds.eventmodifier qualifier='qualifier'>
			

tag api-entry-list
	kind
	group
	items = null
	qualifier
	
	def hydrate
		kind = dataset.kind
		group = dataset.group
		load!
		
	def load
		return if items
		items = api.kinds[kind]
		items = items.sort do(a,b) a.name > b.name ? 1 : -1
		if group
			items = items.filter do $1.tags[group]
		let names = items.map do $1.name
		items = items.filter do(item,i) names.indexOf(item.name) == i
	
	def setup
		load!
		
	css d:grid gtc:1fr 1fr 1fr rg:2 cg:1
		
		&.collapsed
			d:hflex jc:flex-start flw:wrap
		
	<self .{kind}>
		for item in items
			<a[mr:1 fs:sm ws:nowrap] .{item.kind} href=item.href>
				<span.pill[bg:hue1/50 fw:500]>
					if qualifier
						<span.qf> item[qualifier]
					item.displayName

tag api-stylemod-list
	def hydrate
		items = api.kinds.stylemod.sort do(a,b) a.name > b.name ? 1 : -1
		if dataset.group
			items = items.filter do $1.tags[dataset.group]
		
	<self.stylemod>
		css d:grid gtc:1fr 1fr 1fr rg:2 cg:1
		for item in items
			<a[mr:1 fs:sm ws:nowrap d:hflex ofx:hidden] href=item.href>
				<span.pill[bg:hue1/50 fw:500]> item.name
				
tag api-stylemod-section
	
	def hydrate
		# not called when hydrated?
		items = api.kinds.stylemod.sort do(a,b) a.name > b.name ? 1 : -1
		
	def grouped name
		items.filter do $1.tags[name]
		
	<self>
		# <api-section.style>
		# 	<h3> "Special Modifiers"
		# 	<div>
		# 		css d:grid gtc:1fr 1fr 1fr rg:2 cg:1
		# 		for item in items when item.custom?
		# 			<a[mr:1 fs:sm ws:nowrap d:hflex ofx:hidden] href=item.href>
		# 				<span.pill[bg:hue1/100 fw:500]> item.name

		<api-section.style>
			<h3> "Media Modifiers"
			<Stylemods data=grouped('media')>
			
		<api-section.style>
			<h3> "Pseudo-classes"
			<Stylemods data=grouped('pseudoclass')>
			
		<api-section.style>
			<h3> "Pseudo-elements"
			<Stylemods data=grouped('pseudoelement')>
			
		<api-section.style>
			<h3> "Special Modifiers"
			<Stylemods data=grouped('custom')>
			
		# for group in ['media','pseudoclass','pseudoelement']
		# 	<api-section.style>
		# 		let items = self.items.filter do $1.tags[group]
		# 		<h3> group
		# 		<Stylemods data=items>
		
		
tag api-li
	css d:hflex ja:center ws:nowrap
		a c:inherit mr:1 fl:1
			span@last fw:500
		
		&.event hue:amber
	<self .{data.kind}>
		<span.icon[p:1 mr:1]> <svg[c:hue5] src=data.icon>
		if data.kind == 'method' or data.kind == 'property'
			<a href=data.href>
				<span> data.owner.displayName
				<span> "."
				<span> data.displayName
		elif data.modifier?
			<a href=data.href>
				<span> data.owner.modifierPrefix + "."
				<span> data.displayName
		elif data.kind == 'stylemod'
			<a href=data.href>
				<span> "css "
				<span> data.displayName
		elif data.kind == 'styleprop'
			<a href=data.href>
				<span> "css "
				<span> data.displayName
		else
			<a href=data.href> <span> data.displayName
		