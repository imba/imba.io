const array = [1,2,3]
const object = {a: 'one', b: 'two', c: 'three'}

# @log basic for in
for num in array
	num * 2

# @log for in ranges - exclusive
for item in [0...5]
	item

# @log iterate through keys of object
for own key,value of object
	[key,value]

# @log for native iterator:
for str of 'string'
	str