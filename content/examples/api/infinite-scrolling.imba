# [preview=lg]

# ---
const todos = []
for count in [0 .. 1000]
	todos.push { count }

tag App
	show_items = 10
	<self[w:100% p:5 gap:5 d:flex fld:column ai:center jc:start]>
		for item, i in todos when i < show_items
			<[min-width:30 p:2 bg:teal3 c:gray7 bxs:sm rd:md ta:center]>
				"#{item.count}"
		<div[h:10px] @intersect.in=(show_items += 10)>
# ---

imba.mount <App>
