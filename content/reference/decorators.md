# Decorators [wip]

Decorators are used to extend properties and methods with common functionality. Let's say you want to log when calling a method.

```imba

def @log target, key, descriptor
    let fn = descriptor.value
    descriptor.value = do
        console.log("call {key}")
        let res = fn.apply(this,arguments)
        console.log("called {key}")
        return res
    return descriptor

# ---
class Item
    # by adding @log before def we let the @log decorator
    # alter the function definition to inject logging
    @log def setup
        yes

var item = Item.new
item.setup!
```

This can also be useful for properties. Let's say we want to trigger a function whenever a property changes. We can define a `@watch` decorator, and use it like this:

```imba

def @watch target,key,desc
	let meth = this[0] or (key + 'DidSet')
	let setter = desc.set

	if setter isa Function
		desc.set = do(value)
			let prev = this[key]
			if value != prev
				setter.call(this,value)
				this[meth] and this[meth](value,prev,key)

	return desc

# ---
class Item
    @watch prop name

    def nameDidSet to, from
        console.log "name changed from {from} to {to}"

var item = Item.new
item.name = 'john'
item.name = 'jane'
```