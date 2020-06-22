import {ls} from '../store'
import { @watch } from '../decorators'

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
		let prev = data.prev # and data.prev.last
		let next = data.next # and data.next.first

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

tag app-document
	@watch prop data

	css color: #4a5568 lh: 1.625 pt:4

	css a c:blue7 t@hover:underline

	css h1
		color: #297198
		margin: 20px 0px 12px
		font-size: 28px
		line-height: 1.4em
		color: #3a4652
		font-weight: 600

	css h2
		font-size: 22px
		margin-top: 30px
		padding: 10px 0px
		border-bottom: 1px solid #F3F5F7
		font-weight: 600
		margin: 1.5em 0em 0.5em
		line-height: 1.2em
		color: #3A4652

	css h3
		font-size: 18px
		padding: 10px 0px
		border-bottom: 1px solid #F3F5F7
		font-weight: 500
		line-height: 1.2em
		margin: 1.5em 0em 0.5em
		color: #3A4652

	css h4
		font-size: 1rem
		font-weight: 500
		border-bottom: 1px solid #edeff1
		margin: 1.33em 0 1em
		color: #3A4652
		line-height: 1.7em
		padding: 6px 0px

	css h5
		position: relative
		background: teal4
		color: teal9
		fs: 14px
		fw: bold
		radius: 3px
		p: 2px 8px
		mt: 1rem
		ls: 0.02em
		d: inline-block
		top: 8px
		left: 8px
		zi: 30

		app-code-inline
			bg:teal3
			color: teal8
			pos:relative
			top:-1px
			mr@last:-4px

	css p
		fw: 400
		fs: 16px
		m: 1em 0

	css li
		font-size: 16px;
		line-height: 1.3em;
		padding-top: 0.2em;
		padding-bottom: 0.2em;
		padding-left: 24px;
		position: relative;
		@before
			content: ""
			bg:gray4
			size:8px
			display:block
			radius:full
			text-align: center
			position: absolute
			left: 6px
			top:9px
			font-size: inherit
			line-height: inherit
			font-style: normal
			color: #52AF78

		> p > code
			display: table
			margin-bottom: 4px
			font-weight: 600

		> * mt@first:0 mb@last:0

	css blockquote
		background: #F7F2E3
		margin: 12px 0px
		padding: 10px 12px
		color: #6f6850
		fs: 15px
		p fs: 15px
		> * mt@first:0 mb@last:0
	
	css app-code-block + app-code-block
		mt: 1rem

	css app-code-block + blockquote
		pt:4 pb:3 px:5 mt:-1 bw:1 bc:gray3 bg:white radius:2
		box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.05) color:gray6

	# table stlff
	css table
		width: 100%;
		border-bottom: 1px solid gray200;
		color: #4a5568;
		fs: 16px
		lh: inherit

		&[data-title='table'] thead d: none
		&[data-title='Aliases'] thead d: none

		th
			color: gray7
			fw: 500
			py: 0.5rem
			fs:md ta:left
			ws@first: nowrap
			width@first: 30px

		td
			fs: sm
			p: 0.5rem
			border-top: 1px solid gray2
			width.first: 30px

		.code-inline@only-child
			fs:xs/1.4
			px:1 py:0
			m: 0px
			va: top
		
		td.example
			width: 50px
			ws: nowrap
			px: 0px

	def render
		<self.markdown[d:block pb:24]>
			<app-document-nav.top data=data>
			<div$content[max-width:768px px:6] innerHTML=data.html>
			<app-document-nav.bottom data=data>

	def dataDidSet data
		document.body.scrollTop = 0
		setTimeout(&,200) do document.body.focus!

	
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
