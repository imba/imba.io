export class List
	
	def initialize
		@array = []
		self

	def add item
		unless @array.indexOf(item) >= 0
			will-add(item)
			@array.push(item)
			did-add(item)
		return self

	def remove item
		if @array.indexOf(item) >= 0
			will-remove(item)
			@array.splice(@array.indexOf(item),1)
			did-remove(item)
		self

	def len
		@array:length

	def map cb
		@array.map(cb)

	def toArray
		@array

	def clear
		will-clear
		while @array:length
			remove(@array[@array:length - 1])
		did-clear
		self


	def will-add item do self
	def did-add item do self
	def will-remove item do self
	def did-remove item do self
	def will-clear do self
	def did-clear do self