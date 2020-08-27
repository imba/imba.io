# for...in

For in is the basic syntax for looping through arrays and any other object that has a `length` property and allows accessing their members through `object[index]`. This includes `Array`, `NodeList`, `DOMTokenList`, `String` and more. It was created before `for of` iterables became standard in ES2015, but is still a practical alternative to using `for of` in many cases. Imba `for in` is not to be confused with `for in` [in javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in).

## Examples

##### for in [snippet]
```imba
for num in [1,2,3]
    num * 2
```

##### with optional index parameter [snippet] [preview=console]
```imba
for num,index in [1,2,3]
    num * index
# [1,4,9]
```

##### specifying increment with `by` [snippet]
```imba
# go through every other element
for num in [1,2,3] by 2
    num * 2
```

##### inclusive range `..` [snippet] [preview]
```imba
# from 0 up to (including) 3
for num in [0 .. 3]
    num
# [0,1,2,3]
```

##### exclusive range `...` [snippet]
```imba
# from 0 up to (excluding) 3
for num in [0 ... 3]
    num
# [0,1,2]
```
Ranges **must include spaces** around `..` and `...`

##### toIterable [snippet]
```imba
class LabelString
    def constructor label
        label = label

    def toIterable
        console.log 'called toIterable'
        label.split(',')

let labels = new LabelString 'idea,proposal,duplicate'

for label in labels
    console.log label.toUpperCase!
```
> When Imba cannot infer that an object is an array during compilation it will behind the scenes look for a `toIterable` method on the object before looping. This way one can make any type of object easily support being iterated using a `for in` loop.