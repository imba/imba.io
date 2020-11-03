import {ls,types,Section,Doc} from '../store'

import '../repl/preview'

const Sheets = {}

Sheets.operators = [
	{name: 'All',regex: /.*/}
	{name: 'Arithmetic',regex: /op-math/}
	{name: 'Logical',regex: /op-logic/}
	{name: 'Assignment',regex: /op-assign/}
	{name: 'Comparison',regex: /op-compar/}
	{name: 'Bitwise',regex: /op-bitwise/}
	{name: 'Unary',regex: /op-unary/}
	{name: 'Advanced',regex: /op-change/}
]

tag doc-anchor
	css pos:relative top:-14

	def entered e
		yes

	def render
		<self @intersect.silence=entered>

tag app-document-nav

	css .card
		pos:relative d:flex ai:center rd:3 p:3 flex:1 1 50% m:2
		c:teal6 border:gray3
		td@hover:none bg@hover:gray1
		ta.next:left ta.prev:right 
		* pointer-events:none
		.parent c:gray5 fs:xs
		.chapter d:block fw:500
		svg size:4 @md:6 color:gray4
		@hover svg color:gray5
		@not-md p:0 b:none bg@hover:none ta.next:right ta.prev:left
			.chapter is:truncate
			.parent d:none

	def render
		let prev = data.prev
		let next = data.next

		<self[max-width:768px px:4 d:flex jc:space-between fs.top:sm d@md.top:none]>
			if prev
				<a.card.prev href=prev.href hotkey='left'>
					<span> <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="19" y1="12" x2="5" y2="12">
						<polyline points="12 19 5 12 12 5">
					<span[flex:1 px:1]>
						<span.parent[prefix:"(" $shortcut ") "]> " Prev - {prev.parent.title}"
						<span.chapter> prev.title
			if next
				<a.card.next href=next.href hotkey='right'>
					<span[flex:1 px:1]>
						<span.parent[suffix:" (" $shortcut ")"]> "Next - {next.parent.title}"
						<span.chapter> next.title
					<span> <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="5" y1="12" x2="19" y2="12">
						<polyline points="12 5 19 12 12 19">


tag doc-section-link
	css a d:flex fld:column p:2 px:3 rd:md bc:gray3 bw:1 my:2 jc:center ai:flex-start
		bg@hover:gray1

	css .title fs:md fw:500 d:block c:teal6
	css .desc fs:sm c:gray5 m:0 d@empty:none
	<self.{data.flagstr} .l{level}> <a href=data.href>
		<span.title> data.title
		<p.desc innerHTML=data.desc>

tag doc-section-filters

	css button
		mr:2 fw:500 fs:8
		outline@focus:none
		c:gray6 @hover:gray7 .checked:gray9
		bdb:2px solid bc:clear .checked:teal6

	prop filter

	get filters
		Sheets[data.options.sheet]

	def render
		<self>
			for item in filters
				<button bind=selection value=item> item.name

tag doc-section
	def toggle
		# flags.toggle('collapsed')
		self

	css >>> a c:blue7 td@hover:underline

	css >>> li
		fs:md/1.3 py:3px pl:6 pos:relative
		@before content: "•" w:6 ta:center l:0 pos:absolute d:block c:teal5
		> p > code d:table mb:1 fw:600
		> mt@first:0 mb@last:0

	css my:1em d:block
		mt:4 .h1:8 .h2:8 .h3:8

	css &.hide d:none
	css &.collapsed > .body d:none

	# css &.tip border:1px solid gray3/50 rd:md p:4 bg:orange2

	css .html
		>> * mt@first:0 mb@last:0

		>>> app-code-inline
			d:inline-block fs:0.75em ff:mono lh:1.25em
			bg: gray3/35 rd:sm va:middle p:0.1em 5px
			-webkit-box-decoration-break: clone

	css .snippet,.h5 $bg:orange2 $hbg:teal4 $hc:teal9
	css .op $hbg:teal4 $hc:teal9
	css .tip $bg:orange2 $hbg:orange4 $hc:orange8
	css .orange $bg:orange2 $hbg:orange4 $hc:orange8
	css .yellow $bg:yellow2 $hbg:yellow4 $hc:yellow8
	css .red $bg:red2 $hbg:red4  $hc:red9
	css .green $bg:green2 $hbg:green4 $hc:green8
	css .neutral $bg:gray2 $hbg:gray4 $hc:gray8

	css .head pos:relative c:#3A4652 bc:gray3/75
		&.l0 fs:28px/1.4 fw:600 pb:2
		&.l1 fs:22px/1.2 fw:600 pb:3 bwb:0px mb:3 bdb:2px solid currentColor
		&.h2.l2 fs:22px/1.2 fw:600 pb:3 bwb:0px mb:3
		&.l2 fs:20px/1.2 fw:500 pb:3 bwb:1px mb:3
		&.l3 fs:18px/1.2 fw:500 pb:3 bwb:1px mb:3
		&.tip fs:16px/1.2 fw:500 pb:3 bwb:0 mb:0

		&.tip,&.h5,&.op c:$hc fs:14px/1.2 fw:500 zi:2 pb:0 mb:-1 bwb:0 mb.tip:-3 mb.op:-3
			.title px:2 py:1 rd:md pos:relative bg:$hbg d:inline-block ml:-1.5
			app-code-inline fs:12px va:baseline bg:clear p:0 fw:bold c:inherit

		&.op pb:0
			.title bg:#364765 fs:13px ff:mono fw:700 prefix: "a " suffix: " b" c:$code-keyword
				@before,@after fw:400 c:$code-variable
			
			.title bg:blue5 fs:13px ff:mono fw:700 prefix: "a " suffix: " b" c:blue9
				@before,@after fw:400 c:white

			&.op-unary .title prefix:"" suffix:"a"
			&.op-post .title prefix:"a" suffix:""
			&.op-unary.op-keyword .title suffix:" a"

		.tab mr:3 fw:500 td:none @hover:none
			outline@focus:none
			c:blue6 @hover:gray7 .active:gray9
			# bdb:2px solid
			bdb:2px solid blue6
			bc:clear @hover:gray7 .active:teal6
			c:gray6 @hover:gray7 .active:gray9
			mb:-2px pb:1
			# bdc.active:clear
			# td:underline .active:none
			

		&.tabs d:hflex flw:wrap pb:0 mb:3
			bdb:none @md:2px solid gray2
			fs:16px .l1:18px
			.tab mr:2 pb:0 @md:1
			&.l1 .tab mr:3


	css .body
		# &.snippet,&.h5,&.op pl:4 mt:-2 pb:1
		#	>>> p my:3
		
		&.tip mt:-2 pb:1 ml:0 rd:md p:4 bg:$bg
			>>> p fs:md- c:gray9/70

		>>> p my:3

		>>> blockquote
			bg:gray2 my:3 p:2 px:3
			color:gray8 fs:md-
			p fs:md-
			> mt@first:0 mb@last:0
		
		>>> app-code-block + app-code-block
			mt:4

		>>> app-code-block + blockquote
			bdl:3px solid gray2 mx:3 p:0 pl:3 c:gray6 bg:clear

		>>> table
			w:100% bdb:1px solid gray2
			color: #4a5568
			fs: 16px
			lh: inherit

			&[data-title='table'] thead d:none
			&[data-title='Aliases'] thead d:none

			th c:gray7 fw:500 py:2 fs:md ta:left
				@first ws:nowrap w:30px

			td fs:sm p:2 bdt:1px solid gray2 w@first:30px

			.code-inline@only fs:xs/1.4 px:1 py:0 m:0 va:top

		&.tabbed > .content@not(@empty) ~ .head.tabs mt:6
		&.tabbed mb:6

	css .more d@empty:none my:8
		@before
			content: "Table of Contents" d:block
			c:#3A4652 bc:gray3
			fs:18px/1.2 fw:500 pb:3
	
	css .marktext
		bg:yellow3 d:inline px:0.5
		-webkit-box-decoration-break: clone

	prop query

	set filters value
		console.log 'setting filters',value
		$filters = value

	get filters
		$filters

	def render
		return unless data

		# let filter = data.filtering..regex
		let par = data.parent
		let filter = query or $filters..regex
		let tabbed = data.options.tabbed
		let level = level

		<self .{data.flagstr} .hide=(query and !data.match(query))>
			if data.head and !data.tab?
				<.head.html .{data.flagstr} .l{level} @click=toggle>
					<.title innerHTML=data.head>
			
			if level == 0
				<.wip.l{level} [mb:3 c:gray8/80 fs:lg max-width:650px]>
					<span.marktext> "The documentation is a work-in-progress and will gradually improve as we move towards beta. We are actively looking for contributors. If you have any questions, suggestions or general feedback please reach out on {<a href="https://discord.gg/mkcbkRw"> "discord"}."
			elif data.options.wip
				# <.wip[bg:yellow3 rd:md px:4 py:2 c:yellow9 fs:sm mb:4 bdb:yellow4]>
				<.wip [mb:6 c:gray8/80 bg:yellow3 d:inline]>
					"Help document this topic? Reach out on {<a href="https://discord.gg/mkcbkRw"> "discord"}"

			if data.options.sheet
				<doc-section-filters data=data bind:selection=filters>

			if (data isa Section or level == 0 or par.options.tabbed)
				<.body.{data.flagstr}>
					<.content.html innerHTML=(data.html or '')>
					<.sections>
						for item in data.parts
							<doc-section query=filter data=item level=(level+1)>
					if tabbed
						<.head.tabs .l{level+1}> for item in data.docs
							<a.tab.title .active=(data.currentTab == item) href=item.href> item.title
						<.section.html>
							<doc-section data=data.currentTab level=(level+1)>

tag app-document
	prop data

	css color: #4a5568 lh: 1.625 pt:4
	css $content > mb@last:0 mt@first:0

	css .embed w:100% bd:0px h:500px

	def render
		let doc = data
		while doc && doc.parent.options.tabbed
			doc.parent.$currentTab = doc
			doc = doc.parent			

		<self.markdown[d:block pb:24]>
			<div$content[max-width:768px px:6]>
				<doc-section $key=doc.id data=doc level=0>
				unless doc.options.tabbed
					<.toc> for item in doc.docs

			<app-document-nav data=doc>
	
tag embedded-app-document
	def hydrate
		let data = ls(dataset.path)
		innerHTML = data.html if data

tag embedded-app-example
	css a
		d:flex ai:center cursor:pointer rd:2 min-height:12 bg:blue2/50 fw:500 fs:xs p:0.5
		@before content:"☶ " fs:14px pr:1
		@hover bg:blue2 t:undecorated

	def hydrate
		data = ls(dataset.path)
		name = textContent
		innerHTML = ''
		self

	def render
		<self[d:contents] @click.run> <a href=dataset.path> "TRY"
