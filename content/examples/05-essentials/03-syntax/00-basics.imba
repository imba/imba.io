tag x-app
	css .blue bg:blue2 @hover:blue3 color:blue8
	css .teal bg:teal2 @hover:teal3 color:teal8
	css .yellow bg:yellow2 @hover:yellow3 color:yellow8
	css .red bg:red2 @hover:red3 color:red8 
	css .item p:4 flex:1 radius:3 m:4

	def render
		<self [d:flex flw:wrap]>
			<div.blue.item> "One"
			<div.red.item> "Two"
			<div.teal.item> "Three"
			<div.yellow.item> "Four"

imba.mount <x-app>