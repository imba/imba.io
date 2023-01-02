let query = ""
let words = ["apple", "orange", "strawberry", "banana"]

tag app

	get filtered-words
		words.filter do $1.toLowerCase!.includes(query)

	<self>
		css d:vflex w:max-content p:5 g:1

		<input bind=query>
			css bg:blue0 rd:2 outline:none p:1 3 bd:1px solid blue3

		for word in filtered-words
			<div> word
				css bg:gray1 rd:2 p:1 3 bdb:1px solid gray2 c:gray6 mb:1 bxs:xs

imba.mount <app>
