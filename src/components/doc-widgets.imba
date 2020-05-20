tag doc-colors

	css .gray100 = bg:gray100 t:gray600
	css .gray200 = bg:gray200 t:gray600
	css .gray300 = bg:gray300 t:gray600
	css .gray400 = bg:gray400 t:gray700
	css .gray500 = bg:gray500 t:gray800
	css .gray600 = bg:gray600 t:gray100
	css .gray700 = bg:gray700 t:gray100
	css .gray800 = bg:gray800 t:gray100
	css .gray900 = bg:gray900 t:gray100

	css .blue100 = bg:blue100 t:blue600
	css .blue200 = bg:blue200 t:blue600
	css .blue300 = bg:blue300 t:blue600
	css .blue400 = bg:blue400 t:blue700
	css .blue500 = bg:blue500 t:blue800
	css .blue600 = bg:blue600 t:blue100
	css .blue700 = bg:blue700 t:blue100
	css .blue800 = bg:blue800 t:blue100
	css .blue900 = bg:blue900 t:blue100

	css .teal100 = bg:teal100 t:teal600
	css .teal200 = bg:teal200 t:teal600
	css .teal300 = bg:teal300 t:teal600
	css .teal400 = bg:teal400 t:teal700
	css .teal500 = bg:teal500 t:teal800
	css .teal600 = bg:teal600 t:teal100
	css .teal700 = bg:teal700 t:teal100
	css .teal800 = bg:teal800 t:teal100
	css .teal900 = bg:teal900 t:teal100

	css .red100 = bg:red100 t:red600
	css .red200 = bg:red200 t:red600
	css .red300 = bg:red300 t:red600
	css .red400 = bg:red400 t:red700
	css .red500 = bg:red500 t:red800
	css .red600 = bg:red600 t:red100
	css .red700 = bg:red700 t:red100
	css .red800 = bg:red800 t:red100
	css .red900 = bg:red900 t:red100

	css .orange100 = bg:orange100 t:orange600
	css .orange200 = bg:orange200 t:orange600
	css .orange300 = bg:orange300 t:orange600
	css .orange400 = bg:orange400 t:orange700
	css .orange500 = bg:orange500 t:orange800
	css .orange600 = bg:orange600 t:orange100
	css .orange700 = bg:orange700 t:orange100
	css .orange800 = bg:orange800 t:orange100
	css .orange900 = bg:orange900 t:orange100

	css .yellow100 = bg:yellow100 t:yellow600
	css .yellow200 = bg:yellow200 t:yellow600
	css .yellow300 = bg:yellow300 t:yellow600
	css .yellow400 = bg:yellow400 t:yellow700
	css .yellow500 = bg:yellow500 t:yellow800
	css .yellow600 = bg:yellow600 t:yellow100
	css .yellow700 = bg:yellow700 t:yellow100
	css .yellow800 = bg:yellow800 t:yellow100
	css .yellow900 = bg:yellow900 t:yellow100

	css .green100 = bg:green100 t:green600
	css .green200 = bg:green200 t:green600
	css .green300 = bg:green300 t:green600
	css .green400 = bg:green400 t:green700
	css .green500 = bg:green500 t:green800
	css .green600 = bg:green600 t:green100
	css .green700 = bg:green700 t:green100
	css .green800 = bg:green800 t:green100
	css .green900 = bg:green900 t:green100

	css .indigo100 = bg:indigo100 t:indigo600
	css .indigo200 = bg:indigo200 t:indigo600
	css .indigo300 = bg:indigo300 t:indigo600
	css .indigo400 = bg:indigo400 t:indigo700
	css .indigo500 = bg:indigo500 t:indigo800
	css .indigo600 = bg:indigo600 t:indigo100
	css .indigo700 = bg:indigo700 t:indigo100
	css .indigo800 = bg:indigo800 t:indigo100
	css .indigo900 = bg:indigo900 t:indigo100

	css .purple100 = bg:purple100 t:purple600
	css .purple200 = bg:purple200 t:purple600
	css .purple300 = bg:purple300 t:purple600
	css .purple400 = bg:purple400 t:purple700
	css .purple500 = bg:purple500 t:purple800
	css .purple600 = bg:purple600 t:purple100
	css .purple700 = bg:purple700 t:purple100
	css .purple800 = bg:purple800 t:purple100
	css .purple900 = bg:purple900 t:purple100

	css .pink100 = bg:pink100 t:pink600
	css .pink200 = bg:pink200 t:pink600
	css .pink300 = bg:pink300 t:pink600
	css .pink400 = bg:pink400 t:pink700
	css .pink500 = bg:pink500 t:pink800
	css .pink600 = bg:pink600 t:pink100
	css .pink700 = bg:pink700 t:pink100
	css .pink800 = bg:pink800 t:pink100
	css .pink900 = bg:pink900 t:pink100

	css .palette = my:2 t:sm cursor:default radius:2 l:clip flex
	css .color = radius:0 fg:1 p:1 h:12 l:flex ai:center jc:center w:10
	css .color span = opacity:0 transition: 30ms ease-in-out 
	css .color:hover span = opacity:1

	def render
		<self> <div>
			for color in ['gray','red','orange','yellow','green','teal','blue','indigo','purple','pink']
				<div.palette.{color}>
					for tint in [100,200,300,400,500,600,700,800,900]
						<div.color.{color + tint}.t{tint}> <span> "{color+tint}"