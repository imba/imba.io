import {api} from '../store'

css
	h1 fs:34px/1.4 fw:600 pb:2
	h2 fs:26px/1.2 fw:600 pb:3 bwb:0px mb:0
	h3 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid tint7 
	h4 fs:16px/1.2 fw:500 pb:2 bwb:0px mb:0
	a c:blue6
	b fw:700
	a em fw:500 font-style:normal
	.link tint:blue
	.eventmodifier,.modifiers tint:amber
	.event,.events tint:violet
	.property,.properties tint:cooler
	.method tint:cool
	a.link c:tint7
	
	app-code-inline d:inline-block
	
	api-link
		d:inline-block
		&.event,&.eventmodifier,&.pill
			a px:4px py:3px rd:md bg:tint1 c:tint7 d:inline-block fs:sm- lh:14px
				@before c:tint9 fw:normal
				@hover bg:tint2
		# &.inherited bg:tint0
		
		a[data-qualifier] @before
			content: '.'
	
	.compact api-link a @before d:none
	
	dt api-link a fw:500
		px:4px py:3px rd:md bg:tint1 c:tint7 d:inline-block fs:sm- lh:14px
	
	dt,dd bdb:1px solid gray2/70 py:2
	dt fw:600 pr:2
	dd c:gray6
	dl
		mb:2 @empty:0 fs:sm
		d:grid gtc: max-content auto
		bdt:1px solid gray2/70
	h3 + dl bdt:0px
	
	.markdown >>>
		h1 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid tint7 mt:6
		h3 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid tint7 mt:6
		h4 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid tint7 mt:6
		p my:4 @only:0
		a c:blue6
		app-code-inline d:inline-block


tag api-link
	def hydrate
		let text = textContent
		data = api.lookup(text)
		console.warn "hydrating!!!",text,data
		
		
	<self.link.{data.kind}>
		<a href=data.href data-qualifier=data.qualifier>
			<span> <slot> data.displayName 


tag api-event-overview

tag api-eventmodifier-overview

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
		
	<self> <slot>

tag api-props < api-section

	name = 'Properties'
		
	<self .{name.toLowerCase!} [d:none]=(data.length == 0)>
		<h3> <slot name='head'> name
		<slot>
		<dl> for item in data.own
			<dt> <api-link.pill data=item> # item.displayName
			<dd innerHTML=item.summary>
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
		for part in data.docs
			<div innerHTML=part>

	
tag api-entry-examples < api-section
	<self[tint:blue d@empty:none]>
		if data.examples.size > 0
			<h3> "Examples"
			<div[py:4]> for item of data.examples
				<div[mb:10]> <app-code-block href=item.path>

tag api-entry
	css tint:blue
	<self>

		if data.kind == 'interface'
			<h1> data.name
			<api-docs data=data>
			<api-entry-events[tint:orange] data=data>
			<api-entry-properties[tint:cooler] data=data.properties>
			<api-entry-modifiers[tint:purple] data=data>
		
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

tag api-eventinterface-entry < api-interface-entry
	<self>
		<h1>
			data.name
		
		<div.markdown>
			for part in data.docs
				<div innerHTML=part>
				
		# if data.guide
		# 	<div> "YES"
		# 	<doc-section data=data.guide level=0>
		
		
		
		<api-entry-modifiers data=data>
		<api-entry-events data=data>
		<api-props name='Properties' data=data.properties>
		<api-props name='Methods' data=data.methods>
		<api-entry-examples data=data>
		

tag api-property-entry < api-entry
	
tag api-method-entry < api-entry
	
tag api-event-entry < api-entry
	css tint:blue
	<self>
		<h1>
			data.name

		<div.markdown>
			for part in data.docs
				<div innerHTML=part>
		
		# <api-entry-events[tint:orange] data=data>
		<api-section>
			<h3> "Syntax"
		
		<api-props name='Properties' data=data.properties>
			<p slot='head'> <api-link data=data.type>

		<api-entry-modifiers data=data>
		
		<api-entry-examples data=data>

tag api-eventmodifier-entry < api-entry
	<self>
		<h1> "@event.{data.displayName}"

		<div>
			for part in data.docs
				<div innerHTML=part>
		
		unless data.owner.name == 'Event'
			<div> "See also related modifiers: "
				for item in data.siblings
					<api-link[mr:4px].inherited .pill data=item>
		
		<api-entry-examples data=data>

tag api-entry-toc
	
	<self>
		""
		# <h3> "See also"
		# <div> <api-links data=data.siblings>
		# for item in data.siblings
		#	<api-link data=item>

tag api-interface-toc < api-entry-toc
tag api-eventinterface-toc < api-interface-toc
tag api-event-toc < api-entry-toc
tag api-property-toc < api-entry-toc
tag api-method-toc < api-entry-toc
tag api-eventmodifier-toc < api-entry-toc	
