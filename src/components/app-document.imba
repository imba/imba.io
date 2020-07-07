import {ls,types,Section,Doc} from '../store'
import { @watch } from '../decorators'

import '../repl/preview'

tag doc-anchor
	css pos:relative top:-14

	def entered e
		yes
		# console.log 'entered anchor',self,e.ratio
		# if e.ratio > 0
		#	document.location.hash = '#' + id

	def render
		<self @intersect.silence=entered>

tag app-document-nav

	css .card
		pos:relative d:flex ai:center radius:3 p:3 flex:1 1 50% m:2
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

		console.log 'prev and next',prev,next

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
	css a d:flex fld:column p:2 px:3 radius:md bc:gray3 bw:1 my:2 jc:center ai:flex-start
		bg@hover:gray1

	css .title fs:md fw:500 d:block c:teal6
	css .desc fs:sm c:gray5 m:0 d@empty:none
	<self.{data.flagstr} .l{level}> <a href=data.href>
		<span.title> data.title
		<p.desc innerHTML=data.desc>

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

	css &.collapsed > .body d:none

	css my:1em d:block
		mt:4 .h1:8 .h2:8 .h3:8

	# css &.tip border:1px solid gray3/50 radius:md p:4 bg:orange2

	css .html
		> mt@first:0 mb@last:0

		>>> app-code-inline
			d:inline-block fs:0.75em ff:mono lh:1.25em
			bg: gray3/35 br:sm va:middle p:0.1em 5px
			-webkit-box-decoration-break: clone

	css .head pos:relative c:#3A4652 bc:gray3/50
		&.l0 fs:28px/1.4 fw:600 pb:2
		&.l1 fs:22px/1.2 fw:600 pb:3 bbw:1px mb:3
		&.l2 fs:18px/1.2 fw:500 pb:3 bbw:1px mb:3
		&.tip fs:16px/1.2 fw:500 pb:3 bbw:0 mb:0
		&.snippet,&.tip,&.h5 c:teal9 fs:14px/1.2 fw:500 zi:2 pb:0 mb:0 bbw:0
			.title px:2 py:1 radius:md pos:relative bg:teal4 d:inline-block
			app-code-inline fs:12px va:baseline bg:clear p:0 fw:bold c:inherit
		&.tip.tip c:orange9
			.title bg:orange4
	
	css .body
		&.snippet,&.h5 pl:4 mt:-2 pb:1
			p my:3 ml:3
		
		&.tip
			mt:-2 pb:1 ml:3 radius:md p:6 bg:orange2
			# max-height:80px of:auto
			p c:gray9/70

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

	def render
		<self .{data.flagstr}>
			if data.head
				<.head.html .{data.flagstr} .l{level} @click=toggle>
					<.title innerHTML=data.head>
			if (data isa Section or level == 0)
				<.body.{data.flagstr}>
					<.content.html innerHTML=(data.html or '')>
					<.sections>
						for item in data.sections
							<doc-section data=item level=(level+1)>

tag app-document
	@watch prop data

	css color: #4a5568 lh: 1.625 pt:4
	css $content > mb@last:0 mt@first:0

	def render
		<self.markdown[d:block pb:24]>
			<div$content[max-width:768px px:6]>
				<doc-section data=data level=0>
				<.toc> for item in data.docs
					<doc-section-link data=item level=(level+1)>
			<app-document-nav data=data>

	def dataDidSet data
		yes
	
tag embedded-app-document
	def hydrate
		let data = ls(dataset.path)
		innerHTML = data.html if data

tag embedded-app-example
	css a
		d:flex ai:center cursor:pointer radius:2 min-height:12 bg:blue2/50 fw:500 fs:xs p:0.5
		@before content:"☶ " fs:14px pr:1
		@hover bg:blue2 t:undecorated

	def hydrate
		data = ls(dataset.path)
		name = textContent
		innerHTML = ''
		self

	def render
		<self[d:contents] @click.run> <a href=dataset.path> "TRY"
