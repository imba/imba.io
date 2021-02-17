import Game from './state.imba'
import {Tile} from './tile.imba'

tag App
	css .tiles
		d:grid grid: 1fr 1fr 1fr / 1fr 1fr 1fr
		fl:1 w:100% h:100% c:white fs:30px
	
	css .tile
		d:flex ja:center bg:blue6 bg@odd:blue5 fs.won:50px

	def setup
		game = new Game

	<self[d:vflex pos:abs inset:0 rd:md of:hidden]>
		<div.tiles> for tile,i in game.tiles
			<Tile.tile data=game nr=i @click=game.place(i)> tile

document.body.appendChild <App autorender=yes>
# ~.tiles|0,78.2,-26.4,50.0~ Component-scoped styles
# ~bg@odd|0,51.4,-32.4,40.0~ Style property modifiers
# ~@click|0,54.8,7.9,80.0~ powerful event handling
# ~inset:0|0,99.3,-37.7,70.0~ Inline styles
# ~App auto|0,42.9,30.2,20.0~ Tags are real dom elements