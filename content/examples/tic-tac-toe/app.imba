import Game from './state.imba'
import {Tile} from './tile.imba'

css .tiles
	fl:1 w:100% h:100% c:blue1 fs:30px
	d:grid grid: 1fr 1fr 1fr / 1fr 1fr 1fr
	
tag App
	prop game = new Game

	<self[d:vflex pos:abs inset:0 rd:md of:hidden]>
		<div.tiles> for tile,i in game.tiles
			<Tile data=game nr=i @click=game.place(i)> tile

document.body.appendChild <App autorender=yes>
# ~css |2,-21,20,35,15,84,55~ Concise syntax for styling
# ~tag |2,-16,187,81,18,84,62~ Web components as first-class citizens
# ~.tiles|1,78,-26,50,,78,-26~ File-scoped css
# ~inset:0|0,43,-39,70,,4,44~ Inline styles
# ~document|2,-19,321,48,18,86,51~ Tag literals are real dom elements
# ~blue1|0,111,-49,77,18,17,58~ Tailwind-like css shorthands