# importing preflight css directly into the client bundle
import './assets/preflight.css'
import './assets/dankmono.css'

global css
	@root
		--font-brand: 'Work Sans', sans-serif
		--font-notes: Kalam, 'Marker Felt', sans-serif
		--font-mono: dm, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace
		# font-family: Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji
		-webkit-font-smoothing: antialiased
		-moz-osx-font-smoothing: grayscale
		--box-shadow-ring: 0 0 0 3px blue4/30
		scroll-behavior:smooth
		$header-height: 48px @md:48px
		$menu-width:240px @md:220px
		$doc-width: 768px
		$doc-margin: calc(100vw - $doc-width - 20px) @md:calc(100vw - $doc-width - $menu-width - 20px)

	code,pre ff:mono fw:bold

	.p3d transform-style: preserve-3d
	html ofx:hidden
	html.noscroll body overflow: hidden
	html,body p:0px m:0px
	body pt: $header-height ofx:hidden w:100%
	* outline:none

	html.fastscroll scroll-behavior:auto

	.menu-heading d:block p:1 2 fs:sm- fw:500 tt:uppercase cursor:default
	.menu-link d:block p:1 2 fs:sm fw:500

	.keycap rd:md bd:gray2 fs:xs h:5 px:1 c:gray5 d:hflex ja:center


# code
global css @root
	--code-color: #e3e3e3;
	--code-identifier: #9dcbeb;
	--code-constant: #8ab9ff # #d7bbeb;
	--code-bg: #202732;
	--code-background: #282c34;
	--code-bg-lighter: #222b39; # #29313f;
	--code-selection-bg: red;
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
	--code-tag-angle: #9d9755/50; # #9d9755
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
	--code-style-bracket:#e0ade3; # #e9e19b;
	--code-style-unit: #a49feb; # #ff9191;
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
	fw:bold

	b,i fw:inherit font-style:normal

	* @selection bg:blue5/40

	.invalid color: red
	.entity.other.inherited-tag color: var(--code-entity)
	.entity.other.inherited-class color: var(--code-entity)
	.invalid color: red
	.comment color: var(--code-comment) font-style:italic fw:500
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
	.tag.open color: var(--code-tag-angle) o:0.5
	.tag.close color: var(--code-tag-angle) o:0.5
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
	
	.style.open color: var(--code-style-bracket) o:0.5
	.style.close color: var(--code-style-bracket) o:0.5
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
	.variable_.root_ c:var(--code-root-variable)
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

	.keyword.import + .paren > .paren
		c:var(--code-keyword)

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
		bg: url(./assets/arrow.svg)
		background-size: contain
		bottom:100% right:50% mr:-2px mb:-2px

	.css.attribute.name color:var(--code-style-property)
	.css.attribute.value color:var(--code-style-value)