tag x-app
	css .blue bg:blue2 color:blue8 bg@hover:blue3
	css .teal bg:teal2 color:teal8 bg@hover:teal3
	css .yellow bg:yellow2 color:yellow8 bg@hover:yellow3
	css .red bg:red2 color:red8 bg@hover:red3
	css .item p:4 flex:1 radius:3

	def render
		<self .(l:flex wrap space:10)>
			<div.blue.item> "One"
			<div.red.item> "Two"
			<div.teal.item> "Three"
			<div.yellow.item> "Four"

imba.mount <x-app>