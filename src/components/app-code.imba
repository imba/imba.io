import {highlight,clean} from '../util/highlight'
import * as sw from '../sw/controller'
import {ls,fs,File,Dir} from '../store'

def getVisibleLineCount code
	let parts = code.split('# ---\n')
	# console.log 'get visible lines',parts
	(parts[1] or parts[0]).split('\n').length

global css @root
	
	--code-color: #e3e3e3;
	--code-identifier: #9dcbeb;
	--code-constant: #8ab9ff # #d7bbeb;
	--code-bg: #202732;
	--code-background: #282c34;
	--code-bg-lighter: #29313f;
	--code-bracket: #92a3b1;
	--code-comment: #718096;
	--code-keyword: #ff9a8d; # #e88376;
	--code-operator: #ff9a8d;
	--code-delimiter-operator:#6d829b;
	--code-numeric: #63b3ed;
	--code-boolean: #4299e1;
	--code-null: #4299e1;
	--code-entity: #8ab9ff;
	--code-string: #77b3d1;
	--code-entity: #8ab9ff;
	--code-regexp: #e9e19b;
	--code-mixin:#ffc87c;
	--code-mixin:#e9e19b;
	--code-this: #63b3ed;
	--code-tag: #e9e19b;
	--code-tag-event: #fff9c3;
	--code-tag-reference: #ffae86;
	--code-tag-angle: #9d9755;
	--code-type: #8097b2; # #839fc7;
	--code-type-delimiter:#5e6c7d;
	--code-property: #F7FAFC;
	--code-decorator: #63b3ed;
	--code-variable: #e8e6cb;
	--code-global-variable: #faffb2; # #ecd5f1; # #dcb9e4 # #ffc3c3;
	--code-root-variable: #d7bbeb;
	--code-import-variable: #e0ade3;

	--code-font: "Source Code Pro", Consolas, Menlo, Monaco, Courier, monospace;
	--code-rule-mixin: #ff9292;
	--code-rule: #ffb8b8;
	--code-style: #c8c9b6;
	--code-style-scope: #fad8bf;
	--code-style: #e0ade3;
	--code-style-bracket:#e9e19b;
	--code-style-unit: #ff9191;
	--code-style-scope: #eb9fe5;
	--code-style-delimiter: #8c7590;
	--code-style-value: #a49feb;
	--code-style-value-scope: #eec49d;
	--code-style-value-size: #ff8c8c;
	--code-style-property: #e0ade3;
	--code-style-property-scope: #df8de4; # #e9e19b;
	--code-css-property-modifier: #df8de4;

	--code-style-var: #ff93d0;
	--code-keyword-css: #fff7b6;
	--code-selector: #e9e19b;
	--code-selector-pseudostate: var(--code-selector);
	--code-selector-context: #eec49d;
	--code-selector-operator: #ff9a8d;
	--code-selector-placeholder:hsl(321, 100%, 79%) # hsl(36, 100%, 72%);
	--code-key: #9dcbeb;
	--code-delimiter: #e3e3e3
	--code-delimiter-operator:#889cd6
	--code-special: #fffab4

global css .code
	tab-size: 4
	cursor:default
	b,i fw:500 font-style:normal

	.invalid color: red
	.entity.other.inherited-tag color: var(--code-entity)
	.entity.other.inherited-class color: var(--code-entity)
	.invalid color: red
	.comment color: var(--code-comment)
	.regexp color: var(--code-regexp)
	.tag color: var(--code-tag)
	.type color: var(--code-type)
	.type.start color: var(--code-type-delimiter)
	.delimiter.type color: var(--code-type-delimiter)
	.entity.name.type color: var(--code-entity)
	.keyword color: var(--code-keyword)
	.argparam color: var(--code-keyword)
	.delimiter color: var(--code-delimiter)
	.operator color: var(--code-operator)
	.property color: var(--code-property)
	.numeric color: var(--code-numeric)
	.number color: var(--code-numeric)
	.boolean color: var(--code-boolean)
	.null color: var(--code-null)
	.identifier color: var(--code-identifier)
	.uppercase color: var(--code-constant)
	.accessor color: #f3f3f3
	.key color: var(--code-key)
	.key + .operator color: var(--code-key)
	.variable color: var(--code-variable)
	.string color: var(--code-string)
	.propname color: var(--code-entity)

	span.curly c:var(--code-bracket)
	span.square c:var(--code-bracket)
	span.paren c:var(--code-bracket)
	
	.this color: var(--code-this)
	.self color: var(--code-this)
	.constant color: var(--code-constant)
	
	.tag.reference color: var(--code-tag-reference)
	.tag.open color: var(--code-tag-angle)
	.tag.close color: var(--code-tag-angle)
	.tag.event color: var(--code-tag-event)
	.tag.event-modifier color: var(--code-tag-event)
	.tag.mixin color: var(--code-mixin) fw:bold
	.tag.rule-modifier color: var(--code-rule-mixin)
	.tag.rule-modifier.start opacity: 0.43
	.tag.rule color: var(--code-rule)

	.constant.variable color: var(--code-constant)
	.variable.global color: var(--code-global-variable)
	.variable.imports color: var(--code-global-variable)
	.decorator color: var(--code-decorator)
	
	.style.open color: var(--code-style-bracket)
	.style.close color: var(--code-style-bracket)
	.style.args.open color: var(--code-style)
	.style.args.close color: var(--code-style)
	.style color: var(--code-style)
	.style.scope color: var(--code-style-scope)
	.selector color: var(--code-selector)
	.unit color: var(--code-style-unit)
	.style.delimiter color: var(--code-style-delimiter)
	.style.property color: var(--code-style-property)
	.style.property.modifier color: var(--code-style-property-scope)
	.style.value color: var(--code-style-value)
	.style.value.var color: var(--code-style-var)
	.style.value.size color: var(--code-style-value-size)
	.style.value.scope color: var(--code-style-value-scope)
	.style.modifier color: var(--code-style-value-scope)
	.selector.pseudostate color: var(--code-selector-pseudostate)
	.selector.operator color: var(--code-selector-operator)
	.selector.context color: var(--code-selector-context) 
	.selector.mixin color: var(--code-mixin) fw:bold
	.style.start-operator color: var(--code-delimiter-operator)
	span.operator.dot color:var(--code-identifier)
	span.region.more d:none d@md:contents

	.parameter_ c:var(--code-variable)
	.variable_ c:var(--code-variable)
	.variable_.global_ c:var(--code-global-variable)
	.variable_.import_ c:var(--code-import-variable)
	.special_,.special c:#fffab4
	.entity.name.constructor c:var(--code-keyword)
	
	.blockparam c:var(--code-operator)

	._do > .paren@first >
		c@first:var(--code-keyword)
		c@last:var(--code-keyword)

	.parameter_ + .paren >
		c@first:var(--code-variable)
		c@last:var(--code-variable)
	
	.variable_ + .paren >
		c@first:var(--code-variable)
		c@last:var(--code-variable)

	.global_ + .paren >
		c@first:var(--code-global-variable)
		c@last:var(--code-global-variable)

	


	.path c:var(--code-string)
	.entity,.field c:var(--code-entity)

	.__ref.highlight
		bg:rgba(255, 253, 227, 0.11)
		box-shadow:0px 0px 0px 2px rgba(255, 253, 227, 0.11)
		border-radius:3px
		transition: all 0.15s

	.region.hl2
		bg:rgba(0, 0, 0, 0.11)
		box-shadow:0px 0px 0px 2px rgba(0, 0, 0, 0.11)
		border-radius:3px
		transition: all 0.15s

	.region pos:relative

	& .region.arrow@before
		content: " "
		pos:absolute d:block
		size:16px
		bg: url(../assets/arrow.svg)
		background-size: contain
		bottom:100% right:50% mr:-2px mb:-2px

	.css.attribute.name color:var(--code-style-property)
	.css.attribute.value color:var(--code-style-value)

tag app-code
	def awaken
		self

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
		bg:$bg rd:sm

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
			# console.log 'here???',dataset.href,url
			for [key,value] of url.searchParams
				options[key] = value

			example = ls(url.pathname)
			console.log example,url
			

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

		maxLines = Math.max(...lineCounts)

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
		console.log 'setStateFlag',e,e.target,value
		if demo.vars..flag
			demo.vars.flag = value
			demo.commit!
	

	# the selectable items in a css preview


	def focusStyleRule e
		# console.log 'clicked selector',e.target
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

	def render
		return unless code or file
		let name = (files[0] && files[0].name or '')
		let fflags = name.replace(/\.+/g,' ')

		<self.{options.preview}.{fflags} .preview-{options.preview} .multi=(files.length > 1)
			tabindex=-1
			@click.sel('.scope-rule *,.scope-rule')=focusStyleRule
			@keydown.esc.stop=(#clickedRules = no)

			@pointerover.silence=pointerover>

			css pos:relative rd:sm d:block .shared:none
				fs:12px/1.5 @md:13px/1.5
				$bg:$code-bg-lighter
				$preview-size:72px .md:120px .lg:180px .xl:240px
				$minLines: {Math.min(maxLines + 2,14)}
				code
					h:calc($minLines * 1lh)
					d:block of:auto ff:mono ws:pre px:5
					pre w:100px pt:1lh pb:1lh
					&.ind1 >>> .t0 d:none
					&.ind2 >>> .t1 d:none

			css &.preview-styles
				main d:hflex bg:$bg p:0
				code d:contents
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
				code >>>
					pre,b d:contents
					span d:none
					.keyword.css d:none
					.tab d:none
					ws:pre-line
					.scope-rule my:1px d:block rd:sm p:0.5 px:2
						bg:blue4/0 @hover:blue4/15
						span,b d:inline
						.tab d:none
						.group-sel d:none
						&._selected_ bg:blue4/25
						.comment fs:11px ff:sans

			<main @exports=bindExports(e.detail)>
				<div$editor.code>
					css .actions o:0
					css @hover .actions o:1
					<div .collapsed=(files.length < 2)>
						css pos:relative zi:2 bg:#3d4253
							c:gray6 fs:sm fw:500 rdt:inherit d:hflex
							.item d:block c:gray4 c.on:blue3 py:0.25 mx:1 td:none
						<div[d:hflex ..collapsed:none px:2 py:1].tabs> for item in files
							<a.tab.item .on=(file==item) @click.stop.silence=openFile(item)> item.name
						<div[ml:auto px:2 py:1 zi:2].actions>
							<div.item @click=openInEditor> "open"
						css	&.collapsed .actions pos:abs t:0 r:0
					if file
						<code.code.{file.highlighted.flags}>
							<pre$pre[w:100px pt:1lh pb:1lh] innerHTML=file.highlighted.html>
				if options.preview
					<app-repl-preview$preview
						file=files[0]
						dir=dir
						options=options
						mode=options.preview
						@loaded=demoLoaded
					>
				

tag app-code-inline < app-code
