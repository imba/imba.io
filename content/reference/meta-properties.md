# Meta Properties

Upcoming versions of JavaScript has support for private fields using the `#` prefix for properties. Imba has a similar concept, except the prefixed properties are not strictly private.

```imba
# use #identifiers just like other keys
const object = {one: 1, #two: 2}
# these properties can be accessed just like others
object.#two # 2
# and set like any others
object.#three = 3
# but do not show up in Object.keys
Object.keys(object) # ['one']
# nor in iterators
for [key,value] of Object
    console.log key
# nor in JSON.stringify etc
JSON.stringify(object) # '{"one": 1}'
```

## Difference from regular properties

Meta properties do not show up on an Object using `for in`, `for of` or `Object.getOwnPropertyNames`. This makes them perfect for sprinkling your objects with metadata and custom behaviour without running the risk of interferring with existing plain keys on the objects, or native methods from other libraries etc.

## Storing values for getters and setters

You may often find yourself defining setters because you want to do something when a property is set. If you need to do that, usign meta properties with the same name is often a good pattern:

```imba
class Todo
    set title value
        # do something here
        #title = value
    
    get title
        #title
```
Or maybe you want a getter to create something the first time it is called.

```imba
class Socket
    get handler
        #handler ||= new Handler(self,...)
```

## Extending native types

You can also use them for methods and class fields. Since they are not enumerable, and won't collide with native methods from JavaScript it is great if you want to extend native prototypes. Imba adds a bunch of methods to the native Node / Element classes in your browser, but to be sure that it does not interact with other libraries, these methods are implemented using meta properties.

```imba
extend class Element
    def #append node
        # setup some listeners etc
        appendChild(node)
```

In your own projects you could even add functionality to _all_ objects without worry, by using meta properties.
```imba
const map = new WeakMap

extend class Object
    get #ref
        map.set(self,Symbol()) unless map.has(self)
        return map.get(self)

# Now you will be able to access `.#ref` on _all_ objects,
# and get a unique symbol back every time.
const object = {}
object.#ref # Symbol()
```

## Implementation

Internal properties are essentially just shorthands for global native symbols. 

```imba
object = {#one: 1, #two: 2}
# {[Symbol.for('#one')]: 1, [Symbol.for('#two')]: 2}
object.#one
# object[Symbol.for('#one')]
```
Here is a real snippet from the Imba runtime before meta properties:
```imba
extend class Node
	get $context
		$context_ ||= new Proxy(self,proxyHandler)
```
We extended all DOM nodes with a `node.$context` property that creates and returns a proxy that can get and set properties for the ascendants of a node. There are a few problems with it.

1. First, the `$context` getter will be publicly accessible for any library when doing `Object.keys(node)` or when iterating over their properties.

2. It might collide with other scripts using `$context` on DOM nodes.

3. Since we want to cache the proxy upon first access, we memoize it in `$context_`. Why not `$_context`, `$context__` or `$cached_context`? With meta properties we have a clear and consistent convention for this; _always_ prepend the identifier with an additional `#` for the deeper level of indirectness.

The new version is slightly different and looks like this:
```imba
extend class Node
	get #context
		##context ||= new Proxy(self,proxyHandler)
```
