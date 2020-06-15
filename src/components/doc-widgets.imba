import {aliases} from 'imba/src/compiler/styler'

tag doc-style-aliases

	<self>
		<div> for own k,v of aliases
			<span.alias> k
			<span.full> JSON.stringify(v)

tag doc-style-is

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

	css .palette my:2 fs:sm fw:bold cursor:default radius:2 l:clip flex
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