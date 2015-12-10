tag json-value

	def render
		<self>
			if object isa Array
				<json-array[object]>
			elif object isa Object
				<json-object[object]>
			elif object isa String
				<json-string> object
			elif object isa Number
				<json-number> object
			else
				<div.plain> "" + object

tag json-string

tag json-number

tag json-bool

tag json-array

	def render
		<self> for item in object
			<json-value[item]>

tag json-object

	def keys
		Object.keys(object)

	def render
		<self> for key in keys
			<div.pair>
				<div.key> key
				<json-value[object[key]].value>

tag json

	prop object watch: yes

	def objectDidSet new
		# log "SHOULD SET JSON"
		# var node = JsonHuman.format(input)
		empty.append <json-value[new]>
		self
		# dom:textContent = "SOME JSON {new}"
