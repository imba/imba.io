import {highlight,clean} from '../util/highlight'
import * as sw from '../sw/controller'
import {ls,fs,File,Dir} from '../store'
import { getArrow,getBoxToBoxArrow } from "perfect-arrows"

import './app-arrow'

def getVisibleLineCount code
	let parts = code.replace(/# [\[\~].+(\n|$)/g,'').replace(/\n+$/,'').split('# ---\n')
	(parts[1] or parts[0]).split('\n').length

tag app-code
	def awaken
		self

tag app-code-comment
	get body
		dataset.body
	
	def mount
		snippet = closest('.snippet')
		target = parentNode
		snippet.brim.add(self)

tag app-code-block < app-code

	css main
		pos:relative rd:inherit c:$code-color

	css .code pos:relative d:block
		>>> .code-head d:none
		>>> .code-foot d:none
		>>> span.region.hl pos:relative

		&.has-focus >> span@not(.focus)@not(._style) opacity: 0.6
		&.has-hide >>> span.hide d:none
		&.has-hl@hover >> span@not(.hl)@not(._style) opacity: 0.7

	# what should this style?
	css label bg:gray7 rd:md pos:absolute d:flex ai:center p:1

	css .btn px:1 mx:1 c:gray6 fw:500 rd:md bg@hover:gray7/10 outline@focus:none
		@not-md mx:0 ml:1 bg:gray7/90 bg@hover:gray7/100 c:gray4
		@is-active bg:blue6 c:white

	css $editor
		bg:$bg rd:inherit

	css	$header pos:relative zi:2 bg:#3d4253
		d:hflex @empty:none
		rdt:inherit
		c:gray6 fs:sm fw:500 
		.tabs d:hflex px:2 py:1
		.actions ml:auto px:2 py:1 zi:2
		.item d:block c:gray6 c.on:blue3 py:0.25 mx:1 td:none
		&.collapsed
			.tabs d:none
			.actions pos:absolute t:0 r:0
			
		

	css $preview
		min-height:$preview-size
		mt:0 r:inherit
		color:gray6
		pos:absolute
		t:0 l:100%
		w:calc(min(100vw,1340px) - 980px - 40px)
		max-width:500px
		h:100%
		w:$doc-margin
		pl:4
		zi:4
		>>> .frame rd:inherit
		>>> .controls d:none

		pos:relative
		l:0
		h:$preview-size
		m:0
		mt:2
		w:100%
		p:0
		max-width:initial
		rd:sm
		content: "hello"
		>>> $console $header d:none

	css &.console
		$preview h:auto min-height:initial
		$preview >> .body d:none
		$preview >>> $console bxs:xs rd:sm border:1px solid gray3 bg:white
			$header d@force:none
			$scroller max-height@force:140px p:1 fs:sm
		

	prop lang
	prop options = {}
	prop dir
	prop files
	prop file
	prop size
	prop hlvar
	prop editorHeight = 0

	def hydrate
		files = []
		file = null
		demo = {}
		# manual style fixing
		flags.add(_ns_)
		flags.add(_ns_ + "_")

		let lineCounts = []
		let meta = JSON.parse(dataset.meta or '{}')
		let path = "/examples{dataset.path}"

		example = null

		if dataset.href
			let url = new URL(dataset.href,global.location.origin)
			for [key,value] of url.searchParams
				options[key] = value

			example = ls(url.pathname)
			

		Object.assign(options,meta)

		if example isa File
			files = [example]
		else
			let parts = getElementsByTagName('code')
			for part,i in parts
				let data = {
					name: part.dataset.name or "index.{part.dataset.lang}"
					lang: part.dataset.lang
					body: clean(part.textContent)
				}
				let file = fs.register(path + '/' + data.name,data)
				files.push(file)

		for file in files
			lineCounts.push(getVisibleLineCount(file.body))

		file = files[0]

		if file.name == 'main.imba'
			options.preview ||= 'md'

		mainLines = lineCounts[0]
		maxLines = Math.max(...lineCounts)
		minLines = Math.min(...lineCounts)

		render!

	def mount
		schedule!
		render!
	
	def unmount
		unschedule!

	def run
		let source = ""
		for item in parentNode.querySelectorAll('app-code-block.shared')
			source += item.code.plain + '\n'

		source += code.plain

		let lines = source.split('\n')
		let last = lines.reverse!.find do !$1.match(/^[\t\s]*$/) and $1[0] != '\t'
		if let m = (last and last.match(/^tag ([\w\-]+)/))
			source += "\n\nimba.mount <{m[1]}>"

		emit('run',{code: source})

	def openFile file
		self.file = file
		render!

	def openInEditor
		router.go("/try{file.path}")
		self

	def bindExports exports
		console.log 'bind exports',exports
		example = exports

	def pointerover e
		let vref = null
		if let el = e.target.closest('.__ref')
			vref = el.className.split(/\s+/g).find do (/symbol--\d+/).test($1)
		
		if vref != hlvar
			if hlvar
				el.classList.remove('highlight') for el in getElementsByClassName(hlvar)
			if vref
				el.classList.add('highlight') for el in getElementsByClassName(vref)
			hlvar = vref

		
		let rule = e.target.closest('.scope-rule')
		if #hoveredRule =? rule
			focusStyleRule(e) if rule and !#clickedRules
	
	def setStateFlag e
		let value = e.target.textContent.slice(1)
		if demo.vars..flag
			demo.vars.flag = value
			demo.commit!
	

	# the selectable items in a css preview

	def focusStyleRule e
		let rule = e.target.closest('.scope-rule')
		let sel = rule.firstElementChild.textContent.trim!

		if e.type == 'click'
			#clickedRules = yes

		# console.log 'clicked selector',sel
		if sel.match(/^\.demo-/)
			focusedRule = rule
			if demo.vars..flag
				demo.vars.flag = sel.slice(1)
				demo.commit!

	prop focusedRule @set
		if e.oldValue
			e.oldValue.flags.remove('_selected_')
		if e.value
			e.value.flags.add('_selected_')


	def demoLoaded e
		# console.log 'demo loaded',e
		demo = e.detail

	get brim
		return #brim if #brim
		appendChild #brim = <app-code-brim.brim>

	def render
		return unless code or file
		let name = (files[0] && files[0].name or '')
		let fflags = name.replace(/\.+/g,' ')
		let hl = file and file.highlighted

		<self.snippet.{options.preview}.{fflags} .preview-{options.preview} .multi=(files.length > 1)
			tabindex=-1
			@click.sel('.scope-rule *,.scope-rule')=focusStyleRule
			@keydown.esc.stop=(#clickedRules = no)

			@pointerover.silence=pointerover>

			css pos:relative rd:sm d:block .shared:none
				fs:13px/1.5 @md:15px/1.4
				ls:-0.1px
				$bg:$code-bg-lighter
				$preview-size:72px .md:120px .lg:180px .xl:240px
				$mainLines: {mainLines}
				$minLines: {Math.min(maxLines,14)}
				>>> $code
					box-sizing:content-box
					h:calc($mainLines * 1lh)
					d:block of:auto ff:mono ws:pre px:5 py:0.75lh
					pre w:100px
					&.ind1 .t0 d:none
					&.ind2 .t1 d:none

			css &.inline-preview >>> $frame bd:none bg:clear

			css &.preview-inline
				main d:hflex bg:$bg p:0
				$editor fl:1
				$preview
					w:260px as:stretch m:0 h:auto bg:black/15
					>>> $frame bd:none bg:clear rdr:inherit


			css &.preview-styles
				main d:hflex bg:$bg p:0
				$code d:contents
				$editor d:block fl:1 1 65% m:2
				$preview
					h:auto m:0
					fl:0 0 auto # fl:1 1 35% 
					w:280px @!900:35%
					>>> .frame bg:clear bd:none
				.actions d:none

				@!580
					main d:vflex
					$preview h:100px w:auto

				# p:1lh of:visible h:auto pr:40%
				>>> $code
					pre ws:pre-line
					pre,b d:contents
					span d:none
					.keyword.css d:none
					.tab d:none
					.scope-rule my:1px d:block rd:sm p:0.5 px:2
						bg:blue4/0 @hover:blue4/15
						span,b d:inline
						.tab d:none
						.group-sel d:none
						&._selected_ bg:blue4/25
						.comment fs:11px ff:sans
						.group-props
							prefix: "css"
							# suffix: "]>"
							ws:nowrap
							@before,@after c:var(--code-keyword)
							> .white@last d:none

			<main.snippet-body @exports=bindExports(e.detail)>
				<div$editor.code .tabbed=(files.length >= 2)>
					css .actions o:0
					css @hover .actions o:1
					<div$tabbar .collapsed=(files.length < 2)>
						css pos:relative zi:2 bg:#3d4253
							c:gray6 fs:sm fw:500 rdt:inherit d:hflex j:space-between
							.item d:block c:cooler4/90 c.on:blue3 py:0.25 px:1.5 td:none fw:600 rd:lg mx:0
								tween:styles 0.1s ease-in-out
								c@hover:blue4
								&.on bg:#354153
						<div[d:hflex ..collapsed:none px:1 py:1].tabs> for item in files
							<a.tab.item .on=(file==item) @click.stop.silence=openFile(item)> item.name
						<div[px:2 py:1 zi:2].actions>
							<div.item @click=openInEditor> "open"
						css	&.collapsed .actions pos:abs t:0 r:0
					if file
						<app-code-file $key=file.id file=file data=hl>
				if options.preview
					<app-repl-preview$preview
						file=files[0]
						dir=dir
						options=options
						mode=options.preview
						@loaded=demoLoaded
					>

css app-arrow c:green5
	>>>
		path stroke:currentColor stroke-linecap:round stroke-dasharray:3px 3px
		polygon fill:currentColor stroke-linejoin:round
		$end d:none
		$start stroke:currentColor stroke-width:2px

tag app-code-highlight
	prop x = 0
	prop y = 0

	css .anchor pos:abs inset:0 pe:none
	
	css &.line .anchor l:100% b:60% t:10%

	css app-arrow >>>
		path stroke:currentColor stroke-linecap:round
		polygon fill:currentColor stroke-linejoin:round
		$end d:none
		$start stroke:currentColor stroke-width:2px

	def setup
		from = frame.querySelector(data.sel)
	
	def mount
		unless $arrow
			$arrow = <app-arrow frame=frame from=from to=$anchor>
			frame.appendChild($arrow)
		self

	def refresh
		$arrow..render!
		render!

	def render
		<self[d:block c:green6 x:{x}px y:{y}px]>
			<div$anchor>
			<div$box @touchstart.prevent @touch.prevent.silent.sync(self)=refresh> data.text

global css app-code-file

	.item mx:2 pos:relative pe:auto
		ff:notes fw:400 c:green6 ta:center
		min-width:60px @md:100px
		fs:sm/0.9 @md:lg/0.9 
		.box tween:styles 0.2s ease-in-out pe:auto
	.item@even t:-10px

	.highlights pos:abs p:6 b:100% l:0 zi:5 pe:none d:hflex ai:center ta:center
	.left-highlights pos:abs t:0 r:100% w:200px zi:5 pe:none d:vflex ai:flex-end jc:center
	.bottom-highlights pos:abs t:100% l:0 w:100% zi:5 pe:none d:hflex ai:flex-start jc:center

	app-arrow
		tween:opacity 0.2s ease-in-out
		svg tween:transform 0.2s ease-in-out		

	&.leaving
		.item .box y:10px o:0
		app-arrow $scale:0.85 o:0

tag app-code-file

	def draw
		redraw!

	def intersect e
		redraw!
	
	def redraw
		for item in $hl.children
			item.$arrow..render!
		self

	def toggleHighlights
		flags.toggle('leaving')

	def setup
		self

	css &.debug @hover
		$hl outline:1px dashed red4
		.item outline:1px dashed blue4

	<self[d:block pos:relative] @resize.silent=draw @intersect.in.once.silent=intersect>
		<code$code.{data.flags}>
			<pre$pre[w:100px].code innerHTML=data.html>

		<div$hl.highlights @resize.silent=redraw>
			for hl in data.highlights when hl.j == 'top'
				<app-code-highlight[$col:{hl.col}].item frame=self data=hl>

tag app-demo < app-code-block

	def setup
		files = []
		file = null
		example = null
		demo = {}

		let lineCounts = []
		let meta = {}

		if href
			let url = new URL(href,global.location.origin)
			for [key,value] of url.searchParams
				options[key] = value

			example = ls(url.pathname)
			
		Object.assign(options,meta)

		if example isa File
			files = [example]
		elif example isa Dir
			files = example.files

		for file in files
			lineCounts.push(getVisibleLineCount(file.body))

		file = files[0]
		mainLines = lineCounts[0]
		maxLines = Math.max(...lineCounts)
		minLines = Math.min(...lineCounts)
		render!


tag app-code-inline < app-code
