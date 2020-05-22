const array = [1,2,3]
const object = {a: 'one', b: 'two', c: 'three'}

# basic for in @log
for num in array
	num * 2

# for in ranges - exclusive @log
for item in [0...5]
	item

# iterate through keys of object @log
for own key,value of object
	[key,value]

# for: native iterator @log
for str of 'string'
	str