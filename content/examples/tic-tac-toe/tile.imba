export tag Tile
	prop nr

	css d:flex ja:center bg:blue6 bg@odd:blue5 fs.won:50px

	def render
		let placed = data.moves.indexOf(nr)
		let won = data.winner and data.winner.indexOf(nr) >= 0
		<self .won=won> <span> <slot>
# ~bg@odd|0,51.4,-32.4,40.0~ Style property modifiers