def shuffle array
	var counter = array:length, temp, index

	# While there are elements in the array
	while counter > 0
		# Pick a random index
		index = Math.floor(Math.random * counter)
		counter-- # Decrease counter by 1
		# And swap the last element with it
		temp = array[counter]
		array[counter] = array[index]
		array[index] = temp
	
	return array

export tag Pattern

	def setup
		return self if $node$
		var parts = {tags: [], keywords: [], methods: []}
		var items = []
		var lines = []

		for own k,v of Imba.Tag:prototype
			items.push("<em>{k}</em>")
			parts:methods.push("<em>{k}</em>")

		for k in Imba.HTML_TAGS or HTML_TAGS
			items.push("<u>&lt;{k}&gt;</u>")
			parts:tags.push("<u>&lt;{k}&gt;</u>")

		var words = "def if else elif while until for in of var let class extend export import tag global"

		for k in words.split(" ")
			items.push("<i>{k}</i>")
			parts:keywords.push("<i>{k}</i>")

		var shuffled = shuffle(items)
		var all = [].concat(shuffled)
		var count = items:length - 1

		for ln in [0 .. 14]
			let chars = 0
			lines[ln] = []
			while chars < 300
				let item = (shuffled.pop or all[Math.floor(count * Math.random)])
				if item
					chars += item:length
					lines[ln].push(item)
				else
					chars = 400

		dom:innerHTML = '<div>' + lines.map(|ln,i|
			let o = Math.max(0,((i - 2) * 0.3 / 14)).toFixed(2)
			"<div class='line' style='opacity: {o};'>" + ln.join(" ") + '</div>'
		).join('') + '</div>'
		self