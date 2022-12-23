let query = ""
let words = ["apple", "orange", "strawberry", "banana"]

tag app

	get filtered-words
		words.filter do(word)
			word.includes(query)

	# inline styles with [brackets]
	<self[d:vflex w:max-content p:5 g:1]>

		<input bind=query>
			css bg:blue0 rd:2 outline:none p:1 3 bd:1px solid blue3
			# ▲ css block with no selector applies to parent ▲

		# ▼ css block with selector applies to nested elements ▼
		css .word bg:gray1 rd:2 p:1 3 bdb:1px solid gray2 c:gray6 mb:1 bxs:xs
		for word in filtered-words
			<.word> word

imba.mount <app>

# see style shorthands: https://imba.io/docs/css/properties
# see color shorthands: https://imba.io/docs/css/values/color
