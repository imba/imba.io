export tag Tile
	prop nr

	def render
		let placed = data.moves.indexOf(nr)
		let won = data.winner and data.winner.indexOf(nr) >= 0
		<self .won=won> <span> <slot>