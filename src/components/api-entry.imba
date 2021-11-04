import {api,ls} from '../store'
import type {Entity} from '../api'

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
			return item[$2] or ''
		cache.set(item,out)
		return out

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
<div %%qualifier%%displayName%%detail=handler>
`


css
	h1 fs:34px/1.4 fw:600 pb:2
		span @before c:gray4/40
		span @after c:gray4/40
	h2 fs:26px/1.2 fw:600 pb:3 bwb:0px mb:0 bdb:1px solid hue7
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
	# .property.custom hue:yellow
	# .property.getter hue:sky
	a.link c:hue7
	
	app-code-inline d:inline-block
	
	.table
		# d:table w:100%
		# table-layout:fixed ws:normal max-width:100%
		d:vgrid
		
		> d:contents
	
	.breadcrumb
		fw:400 mt:-4px fs:sm
		& > span
			c:gray5
			@last @after d:none
			@after
				c:gray4
				fw:600
				fs:xs
				content: " > "
			a fw:500
		.self c:gray5
			a c:inherit
		# bdb:1px solid gray3 pb:1 mb:1
			
		
	.pill
		px:4px py:3px rd:md bg:hue1 c:hue7 d:inline-block fs:sm- lh:14px
		@before c:hue9 fw:normal
		@hover bg:hue2

		&.inherited bg:hue0
		&.lg px:6px py:4px
	
	api-link
		d:inline-block pos:relative
		a c:inherit
			td@hover:underline
		&.customz hue:sky
			@after
				pos:absolute
				content:" "
				d:block
				size:6px
				rd:full
				bg:yellow3
				t:-2px
				r:-2px

	.compact api-link a @before d:none

	dt,dd bdb:1px solid gray2/70 py:2
	dt fw:600 pr:2
	dd c:gray6
	dl
		mb:2 @empty:0 fs:sm
		d:grid gtc: max-content auto
		bdt:1px solid gray2/70
	h3 + dl bdt:0px
	
	api-links
		&.list
			d:block
			> span d:none
			api-link mr:1
	
	.markdown@force >>>
		h1 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid hue7 mt:6
		h3 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid hue7 mt:6
		h4 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid hue7 mt:6
		p my:4 @only:0
		a c:blue6
		app-code-inline d:inline-block
		
	.markdown >>>
		.h2 fs:26px/1.2 fw:600 pb:3 bwb:0px mb:0 bdb:1px solid hue7
		.h3 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid hue7 
		.h4 fs:16px/1.2 fw:500 pb:2 bwb:0px mb:0

tag api-el
	
	set namepath value
		data = api.lookup(value)

	set data value
		if typeof value == 'string'
			let str = value
			value = api.lookup(str) or ls(str)
			
		#data = value
		
	get data\Entity
		#data

tag api-link < api-el
	
	def hydrate
		let text = textContent
		data = api.lookup(text) or {displayName: text}
		# console.warn "hydrating!!!",text,data
		
	<self.link.{data.kind} .custom=data.custom?>
		<a href=data.href data-qualifier=data.qualifier>
			<span> <slot> data.displayName 

tag api-pills
	<self>
		if data.tags..abstract
			<div.abstract> "abstract"
		if data.idl?
			<div.idl> "idl"
		if data.custom?
			<div.source> "imba"

tag api-li < api-el
	prop href
	prop mdn = no
	prop name

	css d:hflex ja:center ws:nowrap jc:flex-start min-height:1rh
		a c:inherit d:hflex ai:baseline ws:pre
			i font-style:normal
			c:hue6
			text-underline-offset:2px
			@hover td:underline
		
		.icon
			rd:md p:1 c:hue6

		.name px:1
		.summary c:gray5 px:1 ws:nowrap of:hidden text-overflow:ellipsis w:50px
			>>> p d:contents
		.flex fl:1

		&.mdn hue:blue
		&.short .qf d:none
		.pills ws:nowrap d:hflex ja:center
		
	set icon value
		#icon = value
		
	get icon
		#icon or (mdn ? import('codicons/bookmark.svg') : data.icon)

	<self .{data.kind} .mdn=mdn .custom=data.custom? .idl=data.idl? .getter=data.getter?>
		<span.icon> <svg src=icon>
		<a.name href=(href or (mdn ? data.mdn : data.href)) target=(mdn ? '_blank' : undefined)>
			if name
				<em> name
			elif data.member?
				<span.qf> data.owner.displayName
				<span.qf> "."
				<em> data.displayName
				if data.method?
					<em> "()"
			elif data.event?
				<em> data.displayName
				# <span.kind> "event"
			elif data.eventmod?
				<span.qf> data.owner.modifierPrefix + "."
				<em> data.displayName
				<span.detail> data.detail
				# <span.kind> "event modifier"
			elif data.stylemod?
				<em> data.displayName
				# <span.kind> "style modifier"
			elif data.styleprop?
				<em> data.displayName
				if data.alias
					<i[c:gray4].qf> " / {data.alias}"
				# <span.kind> "css property"
			else
				<em> data.displayName
		<api-pills.pills data=data>
		# <.pills>
		#	if data.custom?
		#		<span.source> 'imba'
		#	if data.idl?
		#		<span.idl> 'idl'
		<.summary.flex innerHTML=data.summary>
		

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
				<slot> "This interface inherits properties of "
				for item,i in up
					if i > 0
						<span> (i == up.length - 1) ? " and " : ", "
					<api-link[c:blue7] data=item>
				# if members.length
				# 	<span> ": "
				# 	for item in members
				# 		<api-link[mr:4px].inherited .pill data=item>

tag api-section
	css mt:10
		
	set data value
		if typeof value == 'string'
			value = api.lookup(value)
		#data = value
		
	get data
		#data
		
	<self> <slot>
	
tag api-dl
	prop items = []
	prop linkflags
	
	<self> <dl>
		for item in items
			<dt> <api-link.pill data=item .{linkflags}>
			<dd.markdown innerHTML=item.summary>

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
		if data.guide
			<api-doc-section[d:contents] data=data.guide body-only=yes>
		elif data.docs
			<div innerHTML=data.docs>	
		elif data.summary
			<div.summary innerHTML=data.summary>

	
tag api-entry-examples < api-section
	<self[hue:blue d@empty:none]>
		if data.examples.size > 0
			<h3> "Examples"
			<div> for item of data.examples
				<div[mb:10 @last:4]> <app-code-block href=item.path>

tag api-entry
	css hue:blue
		1rh:40px
		
		h1
			d:hflex ai:center
			svg size:32px

		api-li
			# & + api-li bdt:1px solid #efefef
			bdb:1px solid #efefef
			>>>
				a fw:500
				.qf d:none
				.icon px:0
				.name fs:15px c:hue7
				.summary fs:13px c:gray5
				.detail c:hue7/80 fw:400 pl :1 d@empty:none
				.pill fs:xxs py:0px hue:gray order:1 ml:1 c:gray5
				.pills order:1 ws:nowrap hue:yellow c:default
					> * fs:11px/1 order:1 ml:1 rd:sm px:4px py:2px bg:hue1 c:hue7/80 fw:500
					.source hue:sky
					.abstract hue:gray c:gray5
					.idl hue:blue
					
		api-li.head
			bdb:none
			>>>
				.icon size:32px c:hue6
					svg size:32px c:hue6
				fs:inherit
				c:gray7
				# a c:gray7 td@hover:none
				a@hover td:none
				.qf d:inline fw:400
				.summary d:none
				.pills d:none
				.detail fw:400
				
			&.eventmodifier >>> .qf d:none
					
				
		.grouping c:gray4 fs:xxs w:max-content
			pos:absolute
			bg:white rd:md px:1
			mt:-8px h:16px ml:1
			# font-style:italic
			# mt:8px ml:2px
			fw:500
			# bdb:1px solid #efefef 
			api-links d:inline
			>>> a c:blue6
		
	def breadcrumbs
		<.breadcrumb>
			<span> <a href='/api'> "API"
			for item in data.breadcrumb
				<span> <api-link data=item .self=(item == data)>
				
				
	def props items, owner = data, ownerText = null
		<div[fs:sm d:vflex]>
			css api-li order:2 .custom:0 .idl:-1

			let all = items.unique
			let mine = items.own
			let inherits = all.length - mine.length

			for item in mine
				# if item.owner != owner
				# 	<div.grouping> "Inherited from {<a> (owner = item.owner).displayName}"
				# 	break 
				<api-li data=item>
			
			if inherits > 0
				<api-parents[order:10 py:2 c:gray5] data=owner> ownerText
			# if all.length <log-tag> mine.length
	<self>

tag api-interface-entry < api-entry
	
	<self>
		<.breadcrumb>
			<span> <a href='/api'> "API"
			for item in data.breadcrumb
				<span> <api-link data=item .self=(item == data)>
			# for item in data.breadcrumb
			#	<span> <api-link data=item>
		<h1>
			<api-li.head data=data>
		<api-docs data=data>
		# <dl> for item in data.props.domprops
		# 	<dt> <api-link.pill data=item> # item.displayName
		# 	<dd.markdown innerHTML=item.summary>
		# <api-props name='Properties' data=data.properties.domprops>
		
		<api-section>
			<h3> "Properties"
			props(data.properties,data,"This interface inherits properties of ")

		<api-section>
			<h3> "Methods"
			props(data.methods,data,"This interface inherits methods of ")
					
		
		# <api-props name='Getters' data=data.getters>
		# <api-props name='Properties' data=data.properties>
		# <api-props name='Methods' data=data.methods>

tag api-eventinterface-entry < api-interface-entry
	<self>
		breadcrumbs!
		<h1> <svg src=data.icon/> data.name
		<api-docs data=data>
		# <api-entry-modifiers data=data>
		
		# props("Modifiers", data.modifiers.own,data.modifiers.inherited)
		
		<api-section>
			<h3> "Modifiers"
			props(data.modifiers,data,"This interface inherits modifiers from ")

		<api-section>
			<h3> "Events"
			<div[fs:sm]> for item in data.events
				<api-li data=item>


			
		<api-section>
			<h3> "Properties"
			props(data.properties)

			# <div[fs:sm]>
			# 	let all = data.modifiers.unique
			# 	let owner = data
			# 	for item in all
			# 		if item.owner != owner
			# 			<div.grouping> "Inherited from {<a> (owner = item.owner).displayName}"
			# 		<api-li data=item>
			# <api-parents[] data=data members=data.modifiers.inherited> "Additional modifiers are #inherited from "
					
		# <api-entry-events data=data>
		# <api-props name='Properties' data=data.properties>
		# <api-props name='Methods' data=data.methods>
		<api-entry-examples data=data>
		

tag api-property-entry < api-entry
	
	<self>
		breadcrumbs!
		<h1>
			<svg src=data.icon>
			<span[fw:normal]> <api-link data=data.owner>
			<span> "." + data.displayName
		<api-docs data=data>
		# <div[my:4]> "Other properties on {<api-link data=data.owner>} include "
		# 	for item in data.siblings
		# 		<api-link[mr:4px].inherited .pill data=item>
	
tag api-method-entry < api-entry
	
	<self>
		breadcrumbs!
		<h1>
			<svg src=data.icon>
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
			<span> <api-link namepath="/api/Element">
			<span> "Events"
		<h1>
			<api-li.head data=data>
			# <span[fw:normal suffix: " / " ]> <api-link data="/api/Element">
			# <span> "{data.displayName}"
			# <span[fw:normal c:gray5]> " event"
			
		# <p> "The object passed into the event handler for {data.name} is a {<api-link data=data.type>}"
		<api-docs data=data>
		
		unless data.meta.Syntax
			<api-section>
				# only if there is no syntax from the other
				<h3> "Syntax"
				<app-code-block raw="<div @{data.displayName}=handler>">
		
		<api-section>
			<h3> "Modifiers"
			props(data.modifiers,data.type,"{data.type.name} inherits modifiers of ")
			
		# <api-entry-modifiers data=data.type>
		
		if data.name == 'touch' or true
			<api-section>
				<h3> "{<api-link data=data.type>} Properties"
				props(data.properties,data.type,"{data.type.name} inherits properties of ")

		# <api-section>
		# 	<h3> "{<api-link data=data.type>} Methods"
		# 	props(data.methods,data.type,"{data.type.name} inherits methods of ")

		# <api-props name='Properties' data=data.properties>
		# 	<p slot='head'>
		# 		<api-link data=data.type>
		# 		<span> " interface"
	
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
			<api-li.head.short data=data>
			# <svg[] src=data.icon>
			# <a href=data.owner.href> data.owner.modifierPrefix
			# <span> "." + data.displayName
			# <span> data.detail
		<api-docs data=data>
		
		unless data.meta.Syntax
			<api-section>
				# only if there is no syntax from the other
				<h3> "Syntax"
				<app-code-block raw=snippets.eventmodifier(data)>

		<api-entry-examples data=data>

tag api-entry-toc < api-el
	
	css
		h3 fs:14px/1.2 fw:500 pb:1 bwb:0px mb:1 bdb:1px solid hue7
		
		api-li fs:14px
			>>>
				.summary d:none
				.pills d:none
			
		section mb:5

	css .pill
		px:6px py:4px rd:md bg:hue2 c:hue8 d:inline-block fs:sm- lh:14px fw:500
		@before c:hue9 fw:normal
		@hover bg:hue3
		
		&.inherited fw:400 bg:hue1 @hover:hue2
	
	
	<self[pt:0px]>
	
		if data.kind == 'event'
			<section.amber>
				<h3> "Supported Modifiers"
				<div> list(data.modifiers,data.type)
			
			<section.violet>
				<h3> "Related Events"
				<div> list(data.related,data.type)
		
		if data.kind == 'eventmodifier'
			<section.amber>
				<h3> "Related Modifiers"
				<div> list(data.related,data.owner)
		
		if data.interface?
			if data.up
				<section.blue>
					<h3> "Inheritance"
					<div>
						for item in data.parents.slice!.reverse!
							<api-li data=item icon=api.icons.down>
						<api-li[hue:gray my:1] data=data>
						<div> for item in data.descendants
							<api-li data=item icon=api.icons.right> # list(data.parents,data.type)
		
		if data.kind == 'interface'
			<section.violet>
				<h3> "Related Interfaces"
				<div> list(data.related,data.type)
			
		# if data.kind == 'eventinterface'
		# 	<section.amber>
		# 		<h3> "Supported Modifiers"
		# 		<div> list(data.modifiers,data.type)
		# 	
		# 	<section.violet>
		# 		<h3> "Related Events"
		# 		<div> list(data.events,data.type)
				
		if data.kind == 'styleprop'
			
			<section.violet>
				<h3> "Related"
				<div> list(data.related)
				
		if data.kind == 'stylemod'
			<section.violet>
				<h3> "Related"
				<div> list(data.related)
		
		<section.blue>
			<h3> "Resources"
			<div>
				if data.mdn
					# <a href=data.mdn target='_blank'> "MDN Documentation"
					<api-li mdn=yes data=data name="MDN Documentation">

				for item in data.resources when item
					<api-li[hue:blue] data=item>
	
	
	def list items, owner = data
		<div> for item,i in items
			<a.pill.lg[mr:1 px:1.5] .{item.kind} .inherited=(item.owner != owner) href=item.href>
				<span> item.displayName
			# <api-link[mr:1] data=item .inherited=(item.owner != data)>
			
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
		
		if !data.meta.Syntax and !data.guide
			<api-section>
				# only if there is no syntax from the other
				<h3> "Syntax"
				# <app-code-block raw=snippets.cssprop(data)>
				if data.alias
					# <p> "For this property you can also use the alias:"
					<app-code-block raw=snippets.cssaliased(data)>
				else
					<app-code-block raw=snippets.cssprop(data)>
		
		<api-section>
			<h3> "Related"
			<div[fs:sm d:vflex]> for item in data.related
				<api-li data=item>
			# props(data.related,data.type,"{data.type.name} inherits properties of ")
					
		if example
			<api-section>
				<h3> "Examples"
				<app-code-block href=(example.href)>
					

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
		
		
