import {ls} from '../store'
import { @watch } from '../decorators'

tag app-document
	@watch prop data

	css &
		color: #4a5568
		line-height: 1.625
		pt:4

	css a
		t:blue700
		t.hover:underline

	css h1
		color: #297198;
		margin: 20px 0px 12px;
		font-size: 28px;
		line-height: 1.4em;
		color: #3a4652;
		font-weight: 600;

	css h2
		font-size: 22px;
		margin-top: 30px;
		padding: 10px 0px;
		border-bottom: 1px solid #F3F5F7;
		font-weight: 600;
		margin: 1.5em 0em 0.5em;
		line-height: 1.2em;
		color: #3A4652;

	css h3
		font-size: 18px;
		padding: 10px 0px;
		border-bottom: 1px solid #F3F5F7;
		font-weight: 500;
		line-height: 1.2em;
		margin: 1.5em 0em 0.5em;
		color: #3A4652;

	css h4
		font-size: 1rem;
		font-weight: 500;
		border-bottom: 1px solid #edeff1;
		margin: 1.33em 0 1em;
		color: #3A4652;
		line-height: 1.7em;
		padding: 6px 0px;

	css h5
		position: relative;
		background: teal4;
		color: teal9;
		font-size: 14px;
		font-weight: bold;
		border-radius: 3px;
		padding: 2px 8px;
		margin-top: 1rem;
		letter-spacing: 0.02em;
		display: inline-block;
		top: 8px;
		left: 8px;
		z-index: 30;

		& app-code-inline
			bg:teal3
			color: teal8
			l:rel
			top:-1px
			mr.last:-4px

	css p
		font-weight: 400;
		font-size: 16px;
		margin: 1em 0;

	css li
		font-size: 16px;
		line-height: 1.3em;
		padding-top: 0.2em;
		padding-bottom: 0.2em;
		padding-left: 24px;
		position: relative;
		&:before
			content: ""
			bg:gray4
			size:8px
			display:block
			radius:full
			text-align: center;
			position: absolute;
			left: 6px;
			top:9px;
			font-size: inherit;
			line-height: inherit;
			font-style: normal;
			color: #52AF78;

		& > p > code
			display: table;
			margin-bottom: 4px;
			font-weight: 600;

		& > * = mt.first:0 mb.last:0

	css blockquote
		background: #F7F2E3;
		margin: 12px 0px;
		padding: 10px 12px;
		color: #6f6850;
		font-size: 15px;
		& p = font-size: 15px
		& > :first-child = margin-top: 0px
		& > :last-child = margin-bottom: 0px
	
	css app-code-block + app-code-block
		margin-top: 1rem

	css app-code-block + blockquote
		pt:4 pb:3 px:5 mt:-1 b:gray300 bg:white radius:2
		box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.05) color:gray600

	# table stlff
	css table
		width: 100%;
		border-bottom: 1px solid gray200;
		color: #4a5568;
		font-size: 16px;
		line-height: inherit;

		&[data-title='table'] thead = display: none

		& th
			color: gray700
			font-weight: 500
			py: 0.5rem
			text: md left
			white-space.first: nowrap
			width.first: 30px;

		& td
			text: sm
			padding: 0.5rem
			border-top: 1px solid gray200
			width.first: 30px;

		& .code-inline:only-child
			text:xs/1.4
			px:1 py:0
			margin: 0px
			vertical-align: top
		
		& td.example
			width: 50px;
			white-space: nowrap;
			padding-left: 0px;
			padding-right: 0px;

	css .card
		l:flex rel ai:center border:gray3 radius:3 p:3 flex:1 1 50% m:2
		color:teal6
		td.hover:none bg.hover:gray1
		& * = pointer-events:none
		& .arrow = bt:gray4 br:gray4 border-width:3px size:4 l:block abs
		& svg = size:6 color:gray4
		&:hover svg= color:gray5

	def render
		let prev = data.prev # and data.prev.last
		let next = data.next # and data.next.first
		<self.markdown.(l:block pb:24)>
			<div$content.(max-width:768px px:6) innerHTML=data.html>
			<div.(max-width:768px px:4 l:flex jc:space-between)>
				if prev
					<a.card.(ta:right) href=prev.href hotkey='left'>
						<span> <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="19" y1="12" x2="5" y2="12">
							<polyline points="12 19 5 12 12 5">
						<span.(flex:1 px:1)>
							<span.(c:gray5 f:xs prefix:"(" $shortcut ") ")> " Prev - {prev.parent.title}"
							<span.(d:block f:500)> prev.title
				if next
					<a.card.(ta:left) href=next.href hotkey='right'>
						<span.(flex:1 px:1)>
							
							<span.(c:gray5 f:xs suffix:" (" $shortcut ")")> "Next - {next.parent.title}"
							<span.(d:block f:500)> next.title
						<span> <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="5" y1="12" x2="19" y2="12">
							<polyline points="12 5 19 12 12 19">

	def dataDidSet data
		# console.log 'data did set!!',data
		document.body.scrollTop = 0
		setTimeout(&,200) do document.body.focus!

	
tag embedded-app-document
	def hydrate
		let data = ls(dataset.path)
		innerHTML = data.html if data

tag embedded-app-example
	css a =
		l:flex center cursor:pointer radius:2 min-height:12 bg:blue2-50 
		t:500 xs p:0.5
		prefix: "☶ " t.before:14px 400 pr.before:1
		&:hover = bg:blue2 t:undecorated
	def hydrate
		data = ls(dataset.path)
		name = textContent
		innerHTML = ''
		self

	def render
		<self.(d:contents) @click.run> <a href=dataset.path> "TRY"
