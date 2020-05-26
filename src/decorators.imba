export def @watch target,key,desc

	let meth = this[0] or (key + 'DidSet')
	let setter = desc.set

	if setter isa Function
		desc.set = do(value)
			let prev = this[key]
			if value != prev
				setter.call(this,value)
				this[meth] and this[meth](value,prev,key)

	return desc

export def @commit target,key,desc
	let {set,value} = desc

	if set isa Function
		desc.set = do(value)
			let prev = this[key]
			if value != prev
				set.call(this,value)
				imba.commit!
	elif value isa Function
		desc.value = do
			imba.commit!
			value.apply(this,arguments)

	return desc