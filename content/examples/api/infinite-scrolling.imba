# [preview=lg]

tag todo
	def render
		<self>
			css .todo
				ta:center bg:teal3 m:20px bxs:md rd:md
				d:flex fld:row ai:center c:gray9/70

			css .count
				border-right:1px solid teal4
				h:100% p:20px flex:1

			css .text
				flex:10

			<.todo>
				<.count> count
				<.text> text

# ---
const todos = []
for count in [0 ... 1000]
	let text = 'I have so many things to do!'
	todos.push { text, count }

tag App
	show-items = 10

	def render
		<self>
			<div>
				for item, i in todos when i < show-items
					<todo text=item.text count=item.count>
				<div[h:10px] @intersect.in=(show-items += 10)>
# ---

imba.mount <App>
