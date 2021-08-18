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
		pos:relative d:flex ai:center rd:3 p:3 flex:1 1 50% m:10 2
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

		<self[d:flex jc:space-between fs.top:sm d@md.top:none mx:-2]>
			if prev
				<a.card.prev href=prev.href hotkey='left'>
					<span> <svg src='icons/arrow-left.svg'>
					<span[flex:1 px:1]>
						<span.parent[prefix:"(" $shortcut ") "]> " Prev - {prev.parent.title}"
						<span.chapter> prev.title
			if next
				<a.card.next href=next.href hotkey='right'>
					<span[flex:1 px:1]>
						<span.parent[suffix:" (" $shortcut ")"]> "Next - {next.parent.title}"
						<span.chapter> next.title
					<span> <svg src='icons/arrow-right.svg'>


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

	css >>> li
		fs:md/1.3 py:3px pl:6 pos:relative
		@before content: "•" w:6 ta:center l:0 pos:absolute d:block c:teal5
		> p > code d:table mb:1 fw:600
		> mt@first:0 mb@last:0

	css my:1em d:block
		mt:8 .h1:12 .h2:12 .h3:8 @first:8

	css &.hide d:none
	css &.collapsed > .body d:none

	# css &.tip border:1px solid gray3/50 rd:md p:4 bg:orange2

	css .html
		>> * mt@first:0 mb@last:0
		>>> a c:blue7 td@hover:underline

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

	css .head pos:relative c:#3A4652 bc:gray3/75 d:block
		&.h1 fs:34px/1.4 fw:600 pb:2
		&.h2 fs:26px/1.2 fw:600 pb:3 bwb:0px mb:0
		&.h3 fs:22px/1.2 fw:500 pb:3 bwb:0px mb:0
		&.h4 fs:20px/1.2 fw:500 pb:2 bwb:0px mb:0

		&.zl1 fs:20px/1.2 fw:500 pb:3 bwb:0px mb:3 bdb:2px solid currentColor
		&.zh2.zl2 fs:20px/1.2 fw:500 pb:3 bwb:0px mb:3
		&.zl2 fs:20px/1.2 fw:500 pb:3 bwb:0px mb:3
		&.zl3 fs:18px/1.2 fw:500 pb:3 bwb:0px mb:3
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

		&.event-modifier
			c:blue7 bdb:2px solid currentColor mb:2
			.title prefix: "@event." c:blue7

		&.pointer-modifier
			.title prefix: "@pointerevent."

		&.touch-modifier
			.title prefix: "@touch."
		
		&.intersect-modifier
			.title prefix: "@intersect."

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

	css .more d@empty:none my:8
		@before
			content: "Table of Contents" d:block
			c:#3A4652 bc:gray3
			fs:18px/1.2 fw:500 pb:3
	
	css .marktext
		bg:yellow3 d:block px:0.5 rd:xl p:10px 15px fs:sm c:yellow7 fw:500
		-webkit-box-decoration-break: clone
		& a td: underline

	css &.as-link > .head
		mb:0 # d:inline-block
		c:blue7 @hover:blue6
		cursor:pointer
		.title @before content: "➤ " fw:600

	css &.debug bd:1px solid gray3 rd:sm p:4 .in-focus:green6

	prop query

	set filters value
		console.log 'setting filters',value
		$filters = value

	get filters
		$filters

	def intersecting e
		# if e.entry.isIntersecting
		flags.toggle('in-view',e.entry.isIntersecting)
		emit('refocus')

	def scrollIntoView
		let rect = getBoundingClientRect!
		log 'scroll section into view!',rect
		return rect

	
	def render
		return unless data

		# let filter = data.filtering..regex
		let par = data.parent
		let filter = query or $filters..regex
		let level = level
		let linked = false and level > 0 and data.options.linked

		<self
			.{data.flagstr}
			.as-link=(linked)
			.hide=(query and !data.match(query))
			@intersect("-70px 0% -20% 0%").silent=intersecting
		>

			if data.head
				<div.head[scroll-margin-top:80px] .{data.flagstr} .l{level} id=data.hash>
					css svg d:inline size:5
					css .legend ml:1 c:gray5 fs:md
					<a[pos:absolute l:-20px c:gray5 o:0] href=data.href> '#'
					<span.html.title innerHTML=data.head>
					if data.legend
						<span.legend> data.legend
					if data.options.mdn
						<a[ml:1] target="_blank" href="https://developer.mozilla.org/en-US/docs/Web{data.options.mdn}">
							css o:0.3 @hover:0.8 c@hover:violet4
							<svg src='../assets/mdn.svg'>

			if data.options.wip
				<.wip[my:10px]>
					<span.marktext>
						"This topic is incomplete. Can you help document this topic? Reach out {<a href="https://discord.gg/mkcbkRw"> "on discord"}"

			if (data isa Section or level == 0) and !linked
				<.body.{data.flagstr}>
					<.content.html innerHTML=(data.html or '')>
					<.sections>
						for item in data.sections
							<doc-section query=filter data=item level=(level+1)>
tag app-document

	css color: #4a5568 lh: 1.625
	css $content > mb@last:0 mt@first:0

	css .embed w:100% bd:0px h:500px

	get scroller
		document.scrollingElement

	prop hash @set
		let section = getSectionForHash(e.value)
		reveal(section) if section

	def mount
		# document.scrollingElement.scrollTop = 0
		let hash = document.location.hash.slice(1)
		let subsection = getSectionForHash(hash)
		if subsection
			reveal(subsection)
		else
			window.scrollTo({left: 0,top: restoreScrollTop or 0,behavior: 'auto'})
			scroller.scrollTop = restoreScrollTop or 0

	def unmount
		let val = scroller.scrollTop
		restoreScrollTop = val < 200 ? 0 : val

	def getSectionForHash hash
		hash = hash.slice(1) if hash[0] == '#'
		return hash and data and data.descendants.find do $1.hash == hash
				

	def reveal section
		let view = querySelector ".entry-{section.id}.head"
		view..scrollIntoView!
		self

	def refocus
		let inview = querySelectorAll('.in-view')
		let current = Array.from(inview).pop!

		# focalpoint = current.data if current

		let cleanup = new Set(Array.from(getElementsByClassName('in-focus')))
		let map = new Map
		for item in querySelectorAll('.in-view')
			map.set(item.data,true)
		
		for [section,value] of map
			let items = section.elements
			for el in items
				el.flags.toggle('in-focus',value)
				cleanup.delete(el)

		for el of cleanup
			el.flags.remove('in-focus')
		
		return


	def render
		let doc = data
		return unless doc	

		<self.markdown[d:block pb:24 pt:4 d:hflex] @refocus.silent=refocus>
			<.main[max-width:768px w:768px px:6 fl:1 1 auto pt:4]>
				<div$content>
					<doc-section $key=doc.id data=doc level=0>
				<app-document-nav data=doc>
			<.aside[fl:1 0 240px d@!1120:none]>
				<$toc[d:block pos:sticky t:64px h:calc(100vh - 64px) ofy:auto pt:4 pb:10 -webkit-overflow-scrolling:touch]>
					<app-document-toc[d:block max-width:360px] data=doc>


tag TocItem
	level = 1

	css .menu-link tween:colors 0.2s cubic-in-out

	css &.in-focus
		> a c:gray9

	css &.toc-pills > .children
		pl:1.5
		> .child
			d:inline-block m:0.5 ff:mono fs:xs va:top
			> a d:block bg:blue2 c:blue6 rd:sm fw:700 fs:xs va:top
			&.in-focus > a c:blue9 bg:blue3
			&.cssvalue > a bg:sky2 c:sky6
	
	css &.toc-hide d@force:none

	css &.op
		d:inline-block m:0.5 ff:mono fs:xs va:top
		> a d:block bg:blue2 c:blue6 rd:sm fw:700 fs:xs va:top
		&.in-focus > a c:blue9 bg:blue3


	
	css &.event-modifierz
		d:inline-block m:0.5 ff:mono fs:xs va:top
		> a d:block bg:blue2 c:blue6 rd:sm fw:700 fs:xs va:top
		&.in-focus > a c:blue9 bg:blue3

	<self[c:gray6] .{data.flagstr}>
		<a.menu-link[c@hover:gray8] href=data.href data=data innerHTML=data.tocTitle>
		if level < 2
			<.children[pl:2 lh:0]> for item in data.parts when item.level < 45
				<TocItem.child data=item level=(level + 1)>


tag app-document-toc
	<self[pr:10]>
		<div.menu-heading[c:gray5]> "On this page"
		<.children> for item in data.parts
			<TocItem data=item level=1>

		<.wip[mt:4 w: <240px ml:2 fs:sm- c:gray6 bdl:2px solid yellow4 pl:3 py:1]>
			<div[my:-2]> "Documentation is a work-in-progress. We are actively looking for contributors. If you can help, have feedback, or want to ask questions, please reach out {<a href="https://discord.gg/mkcbkRw"> "on discord"}."
	
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
		<self[d:contents] @click.emit-run> <a href=dataset.path> "TRY"
