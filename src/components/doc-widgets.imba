tag doc-colors

	css .gray1 = bg:gray1 t:gray6
	css .gray2 = bg:gray2 t:gray6
	css .gray3 = bg:gray3 t:gray6
	css .gray4 = bg:gray4 t:gray7
	css .gray5 = bg:gray5 t:gray8
	css .gray6 = bg:gray6 t:gray1
	css .gray7 = bg:gray7 t:gray1
	css .gray8 = bg:gray8 t:gray1
	css .gray9 = bg:gray9 t:gray1

	css .blue1 = bg:blue1 t:blue6
	css .blue2 = bg:blue2 t:blue6
	css .blue3 = bg:blue3 t:blue6
	css .blue4 = bg:blue4 t:blue7
	css .blue5 = bg:blue5 t:blue8
	css .blue6 = bg:blue6 t:blue1
	css .blue7 = bg:blue7 t:blue1
	css .blue8 = bg:blue8 t:blue1
	css .blue9 = bg:blue9 t:blue1

	css .teal1 = bg:teal1 t:teal6
	css .teal2 = bg:teal2 t:teal6
	css .teal3 = bg:teal3 t:teal6
	css .teal4 = bg:teal4 t:teal7
	css .teal5 = bg:teal5 t:teal8
	css .teal6 = bg:teal6 t:teal1
	css .teal7 = bg:teal7 t:teal1
	css .teal8 = bg:teal8 t:teal1
	css .teal9 = bg:teal9 t:teal1

	css .red1 = bg:red1 t:red6
	css .red2 = bg:red2 t:red6
	css .red3 = bg:red3 t:red6
	css .red4 = bg:red4 t:red7
	css .red5 = bg:red5 t:red8
	css .red6 = bg:red6 t:red1
	css .red7 = bg:red7 t:red1
	css .red8 = bg:red8 t:red1
	css .red9 = bg:red9 t:red1

	css .orange1 = bg:orange1 t:orange6
	css .orange2 = bg:orange2 t:orange6
	css .orange3 = bg:orange3 t:orange6
	css .orange4 = bg:orange4 t:orange7
	css .orange5 = bg:orange5 t:orange8
	css .orange6 = bg:orange6 t:orange1
	css .orange7 = bg:orange7 t:orange1
	css .orange8 = bg:orange8 t:orange1
	css .orange9 = bg:orange9 t:orange1

	css .yellow1 = bg:yellow1 t:yellow6
	css .yellow2 = bg:yellow2 t:yellow6
	css .yellow3 = bg:yellow3 t:yellow6
	css .yellow4 = bg:yellow4 t:yellow7
	css .yellow5 = bg:yellow5 t:yellow8
	css .yellow6 = bg:yellow6 t:yellow1
	css .yellow7 = bg:yellow7 t:yellow1
	css .yellow8 = bg:yellow8 t:yellow1
	css .yellow9 = bg:yellow9 t:yellow1

	css .green1 = bg:green1 t:green6
	css .green2 = bg:green2 t:green6
	css .green3 = bg:green3 t:green6
	css .green4 = bg:green4 t:green7
	css .green5 = bg:green5 t:green8
	css .green6 = bg:green6 t:green1
	css .green7 = bg:green7 t:green1
	css .green8 = bg:green8 t:green1
	css .green9 = bg:green9 t:green1

	css .indigo1 = bg:indigo1 t:indigo6
	css .indigo2 = bg:indigo2 t:indigo6
	css .indigo3 = bg:indigo3 t:indigo6
	css .indigo4 = bg:indigo4 t:indigo7
	css .indigo5 = bg:indigo5 t:indigo8
	css .indigo6 = bg:indigo6 t:indigo1
	css .indigo7 = bg:indigo7 t:indigo1
	css .indigo8 = bg:indigo8 t:indigo1
	css .indigo9 = bg:indigo9 t:indigo1

	css .purple1 = bg:purple1 t:purple6
	css .purple2 = bg:purple2 t:purple6
	css .purple3 = bg:purple3 t:purple6
	css .purple4 = bg:purple4 t:purple7
	css .purple5 = bg:purple5 t:purple8
	css .purple6 = bg:purple6 t:purple1
	css .purple7 = bg:purple7 t:purple1
	css .purple8 = bg:purple8 t:purple1
	css .purple9 = bg:purple9 t:purple1

	css .pink1 = bg:pink1 t:pink6
	css .pink2 = bg:pink2 t:pink6
	css .pink3 = bg:pink3 t:pink6
	css .pink4 = bg:pink4 t:pink7
	css .pink5 = bg:pink5 t:pink8
	css .pink6 = bg:pink6 t:pink1
	css .pink7 = bg:pink7 t:pink1
	css .pink8 = bg:pink8 t:pink1
	css .pink9 = bg:pink9 t:pink1

	css .palette = my:2 t:sm bold cursor:default radius:2 l:clip flex
	css .color = radius:0 fg:1 p:1 h:12 d:flex ai:center jc:center w:5 
	css .color span = opacity:0 transition: 30ms ease-in-out 
	css .color:first-child span = opacity:0.3
	# css .color:last-child span = opacity:0.1
	css .color:hover span = opacity:1

	def render
		<self> <div>
			for color in ['gray','red','orange','yellow','green','teal','blue','indigo','purple','pink']
				<div.palette.{color}>
					for tint in [1,2,3,4,5,6,7,8,9]
						<div.color.{color + tint}.t{tint}> <span> "{color}{tint}"