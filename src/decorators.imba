export def @watch target,key,desc

	let meth = this[0] or (key + 'DidSet')
	let setter = desc.set

	if setter isa Function
		desc.set = do |value|
			let prev = this[key]
			if value != prev
				setter.call(this,value)
				this[meth] and this[meth](value,prev,key)

	return desc