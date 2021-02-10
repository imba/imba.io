import Game from './state.imba'
import {Tile} from './tile.imba'

tag App
	css .tiles
		d:grid grid: 1fr 1fr 1fr / 1fr 1fr 1fr
		fl:1 w:100% h:100% c:white fs:30px
		
	css .tile
		d:flex ja:center
		bg:blue6 bg@odd:blue5
		fs:30px fs.won:50px

	def setup
		game = new Game

	<self[d:vflex pos:absolute inset:0 rd:md of:hidden]>
		<div.tiles> for tile,i in game.tiles
			<Tile.tile data=game nr=i @click=game.place(i)> tile

imba.mount <App>