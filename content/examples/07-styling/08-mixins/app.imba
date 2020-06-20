import {%button} from './shared.imba'

tag Item
	css %button bg:green2 color:green7

	<self>
		<h1> "Item"
		<%button> "Item Button"
		<%button.blue> "Blue Item Button"
tag App
	# overriding some button styling - only for app
	css d:block bw:1 bc:gray4 p:4
	css %button fw:bold bg.blue:blue3

	<self>
		<%button> "App Button"
		<%button.blue> "Blue App Button"
		<Item>

imba.mount <App>