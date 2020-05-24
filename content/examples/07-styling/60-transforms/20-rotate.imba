tag x-app
	css .blue = bg:blue200 color:blue800 bg.hover:blue300
	css .teal = bg:teal200 color:teal800 bg.hover:teal300
	css .yellow = bg:yellow200 color:yellow800 bg.hover:yellow300
	css .red = bg:red200 color:red800 bg.hover:red300
	css .item = p:4 flex:1 radius:3

	def render
		<self .(l:flex wrap space:1)>
			<div.blue.item> "One"
			<div.red.item> "Two"
			<div.teal.item> "Three"
			<div.yellow.item> "Four"

imba.mount <x-app>