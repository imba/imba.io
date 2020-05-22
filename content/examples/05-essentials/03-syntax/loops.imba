const array = [1,2,3]
const object = {a: 'one', b: 'two', c: 'three'}

# basic for in @run
for num in array
	num * 2

# for in ranges - exclusive @run
for item in [0...5]
	item

# iterate through keys of object @run
for own key,value of object
	[key,value]