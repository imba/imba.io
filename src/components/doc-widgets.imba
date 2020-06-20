import {aliases} from 'imba/src/compiler/styler'
import {fonts,modifiers,variants} from 'imba/src/compiler/theme'
import * as selparser from 'imba/src/compiler/selparse'

const selparseCache = {}

def parseSel str
	if selparseCache[str]
		return selparseCache[str]
	let sel = selparser.parse(str,{})
	return selparseCache[str] = selparser.render(sel,'...')

const groups = [
	'all'
	'padding'
	'grid'
	'flexbox'
	'margin'
	'text'
	'alignment'
]

const transforms = 
	x: 'translateX'
	y: 'translateY'
	z: 'translateZ'
	rotate: 'rotate'
	scale: 'scale'
	'scale-x': 'scaleX'
	'scale-y': 'scaleY'
	'skew': 'skewX'
	'skew-y': 'skewY'

css h2 + p > .deftable @first > header mt:-6 bg:white
	
css .defs
	d:grid gtc:max-content auto pc:start
	is:mono fs:4
	.pair d:contents
	.dt c:purple7 pr:4
	.dd c:gray6

	[cols=2] & gtc@lg: max-content 1fr max-content 1fr

	@lg [cols='3-transposed'] &
		gtc: 1fr 1fr 1fr
		.pair d:block
		> @nth-child(3n+1) order:0
		> @nth-child(3n+2) order:1
		> @nth-child(3n+3) order:2

	@lg [cols=3] &
		gtc: max-content 1fr max-content 1fr max-content 1fr

css .defbar 
	border-bottom:1px solid gray3 pb:2
	button mr:2 fw:500 fs:8 c:gray6 c@hover:gray7 c.checked:gray9 outline@focus:none
		bbw:2px bc:clear bc.checked:teal6
	# input@checked ~ .tab c:gray9

tag doc-css-property < a

	def render
		<self href="https://developer.mozilla.org/en-US/docs/Web/CSS/{data}"> data

tag doc-style-aliases
	def mount
		rule = new RegExp(dataset.regex or '---')
		negrule = new RegExp(dataset.neg or '---')
		inc = (dataset.include or '').split(',')
		exc = (dataset.exclude or '').split(',')
		console.log 'dehydrate!',rule
		items = for own k,v of aliases
			continue if exc.indexOf(k) >= 0
			unless inc.indexOf(k) >= 0
				if v isa Array
					continue unless v.some(do rule.test($1) and !negrule.test($1) )
				elif !rule.test(v) or negrule.test(v)
					continue
			[k,v isa Array ? v : [v]]
		
		# items = items.sort(do $1[0] > $2[0] ? 1 : -1)
		console.log 'dehydrated',rule,items

	<self[is:block mt:2]>
		<div.defs> for [alias,name] in items
			<div.pair>
				<span.dt> alias
				<span.dd> for v in name
					<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/{v}"> v
					# name.join(' & ')

tag doc-style-spacings
	<self>
		<doc-style-aliases data-regex='^margin'>
		<doc-style-aliases data-regex='^padding'>
		<doc-style-aliases data-regex='^spacing'>


tag doc-style-transform-aliases
	def hydrate
		yes

	<self[is:block mt:2]>
		<div.defs> for own alias,val of transforms
			<div.pair>
				<span.dt> alias
				<span.dd> "transform: {<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/{val}"> val}(...)"

tag doc-style-utils
	<self[is:block mono mt:2 fs:4]>
		<div.defs> for own name,mod of variants.layout
			# <div.pair[is:grid mono gtc:max-content  pc:start fs:4]>
			continue if name.match(/table|inline|center/)
			<div.pair>
				<span.dt[prefix:'is:' o@before:0.5]> name
				<span.dd> <doc-util-output name=name data=mod>

tag doc-style-val
	def render
		let val = data isa Array ? data : [data]
		

tag doc-style-ff

	<self>
		<div.defs> for own name,val of fonts
			<div.pair>
				<.dt> name
				<.dd> val

tag doc-style-fs

	<self>
		<div.defs[gtc:max-content max-content auto ai:center]> for own name,val of variants.fontSize
			continue if !name.match(/[a-z]/)
			<div.pair>
				<.dt> name
				<.dd[pr:3]>
					val[0]
					# <span[prefix:' / ']> val[1]
				<span[lh:1.2em ws:nowrap overflow:hidden text-overflow:ellipsis] css:fontSize=val[0]> "Quick brown fox"

tag doc-style-easings
	<self>
		<div.defs> for own name,val of variants.easings
			<div[d:contents]>
				<.dt> name
				<.dd> val

tag doc-util-output

	<self>
		for own k,v of data
			<span.pair[suffix:';']>
				<span.key[suffix:': ']> k
				<span.val> JSON.stringify(v)

for own k,v of modifiers
	v.example = "@{k}{v.type == 'selector' and '(sel)' or ''}"
	v.parsed = parseSel("sel {v.example}")
	v.custom = (v.name and v.name != k) or v.media or v.ua
	v.kind = v.media ? 'media' : (v.ua ? 'user-agent' : ('pseudo-class'))
	v.title = v.name

tag doc-style-modifiers

	prop preview = 'plain'

	def mount
		data = Object.values(modifiers)
		filters = [
			{name: 'all',regex: /.*/}
			{name: 'media',regex: /\@media/}
			{name: 'user-agent',regex: /ua-/}
			{name: 'pseudo-class',regex: /[^\:]\:[^\:]/}
			{name: 'pseudo-element',regex: /\:\:/}
			{name: 'custom',regex: /NO/,prop:'custom'}
		]
		filter = filters[0]
	
	css cursor:default
	css .prop d:none d..inprop:inline
	css .sel d:none d..insel:inline
	css .chk pos:absolute visibility:hidden

	def render
		# console.log 'render with filter',filter
		<self.deftable .{preview}>
			<header.defbar>
				for item in filters
					<button bind=filter value=item> item.name

			<div[fs:5]> for mod in data
				continue unless !filter or filter.regex.test(mod.parsed) or mod[filter.prop]
				<div.pair[bc:gray3 bbw:1px py:1 bg@hover:gray1] .custom=mod.custom>
					<span.query>
						<span.sel> "sel"
						<span.prop> "display"
						<span[c:purple7 fw:500 fs:6]> mod.example
						<span.prop> ": value"
					<span[c:gray5 ff:mono fs:3].out>
						<span> ' # -> '
						<span[pr:3]> mod.parsed
					

tag doc-colors
	css .gray1 bg:gray1 c:gray6
	css .gray2 bg:gray2 c:gray6
	css .gray3 bg:gray3 c:gray6
	css .gray4 bg:gray4 c:gray7
	css .gray5 bg:gray5 c:gray8
	css .gray6 bg:gray6 c:gray1
	css .gray7 bg:gray7 c:gray1
	css .gray8 bg:gray8 c:gray1
	css .gray9 bg:gray9 c:gray1

	css .blue1 bg:blue1 c:blue6
	css .blue2 bg:blue2 c:blue6
	css .blue3 bg:blue3 c:blue6
	css .blue4 bg:blue4 c:blue7
	css .blue5 bg:blue5 c:blue8
	css .blue6 bg:blue6 c:blue1
	css .blue7 bg:blue7 c:blue1
	css .blue8 bg:blue8 c:blue1
	css .blue9 bg:blue9 c:blue1

	css .teal1 bg:teal1 c:teal6
	css .teal2 bg:teal2 c:teal6
	css .teal3 bg:teal3 c:teal6
	css .teal4 bg:teal4 c:teal7
	css .teal5 bg:teal5 c:teal8
	css .teal6 bg:teal6 c:teal1
	css .teal7 bg:teal7 c:teal1
	css .teal8 bg:teal8 c:teal1
	css .teal9 bg:teal9 c:teal1

	css .red1 bg:red1 c:red6
	css .red2 bg:red2 c:red6
	css .red3 bg:red3 c:red6
	css .red4 bg:red4 c:red7
	css .red5 bg:red5 c:red8
	css .red6 bg:red6 c:red1
	css .red7 bg:red7 c:red1
	css .red8 bg:red8 c:red1
	css .red9 bg:red9 c:red1

	css .orange1 bg:orange1 c:orange6
	css .orange2 bg:orange2 c:orange6
	css .orange3 bg:orange3 c:orange6
	css .orange4 bg:orange4 c:orange7
	css .orange5 bg:orange5 c:orange8
	css .orange6 bg:orange6 c:orange1
	css .orange7 bg:orange7 c:orange1
	css .orange8 bg:orange8 c:orange1
	css .orange9 bg:orange9 c:orange1

	css .yellow1 bg:yellow1 c:yellow6
	css .yellow2 bg:yellow2 c:yellow6
	css .yellow3 bg:yellow3 c:yellow6
	css .yellow4 bg:yellow4 c:yellow7
	css .yellow5 bg:yellow5 c:yellow8
	css .yellow6 bg:yellow6 c:yellow1
	css .yellow7 bg:yellow7 c:yellow1
	css .yellow8 bg:yellow8 c:yellow1
	css .yellow9 bg:yellow9 c:yellow1

	css .green1 bg:green1 c:green6
	css .green2 bg:green2 c:green6
	css .green3 bg:green3 c:green6
	css .green4 bg:green4 c:green7
	css .green5 bg:green5 c:green8
	css .green6 bg:green6 c:green1
	css .green7 bg:green7 c:green1
	css .green8 bg:green8 c:green1
	css .green9 bg:green9 c:green1

	css .indigo1 bg:indigo1 c:indigo6
	css .indigo2 bg:indigo2 c:indigo6
	css .indigo3 bg:indigo3 c:indigo6
	css .indigo4 bg:indigo4 c:indigo7
	css .indigo5 bg:indigo5 c:indigo8
	css .indigo6 bg:indigo6 c:indigo1
	css .indigo7 bg:indigo7 c:indigo1
	css .indigo8 bg:indigo8 c:indigo1
	css .indigo9 bg:indigo9 c:indigo1

	css .purple1 bg:purple1 c:purple6
	css .purple2 bg:purple2 c:purple6
	css .purple3 bg:purple3 c:purple6
	css .purple4 bg:purple4 c:purple7
	css .purple5 bg:purple5 c:purple8
	css .purple6 bg:purple6 c:purple1
	css .purple7 bg:purple7 c:purple1
	css .purple8 bg:purple8 c:purple1
	css .purple9 bg:purple9 c:purple1

	css .pink1 bg:pink1 c:pink6
	css .pink2 bg:pink2 c:pink6
	css .pink3 bg:pink3 c:pink6
	css .pink4 bg:pink4 c:pink7
	css .pink5 bg:pink5 c:pink8
	css .pink6 bg:pink6 c:pink1
	css .pink7 bg:pink7 c:pink1
	css .pink8 bg:pink8 c:pink1
	css .pink9 bg:pink9 c:pink1

	css .palette my:2 fs:sm fw:bold cursor:default radius:2 of:hidden d:flex
	css .color radius:0 flex:1 p:1 h:12 d:flex ai:center jc:center w:5 
		span o:0 tween:30ms ease-in-out 
		@first span o:0.3
		@hover span o:1

	def render
		<self> <div>
			for color in ['gray','red','orange','yellow','green','teal','blue','indigo','purple','pink']
				<div.palette.{color}>
					for tint in [1,2,3,4,5,6,7,8,9]
						<div.color.{color + tint}.t{tint}> <span> "{color}{tint}"