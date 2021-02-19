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
# ~css |18,-9,-2,35,15,84,55,0.3,1.3/18,7.3,0,35,16,6,47,6.6,-0.2~ Concise syntax for styling
# ~tag |18,-5,0,81,16,84,62,0.5,1.3/18,7.8,-0.3,37,36,4,47,7,1.1~ Web components as first-class citizens
# ~inset:0|16,3.5,-1.5,70,,4,44,2,0/-~ Inline styles
# ~document|18,-6.8,-1.8,48,18,86,51,0,1/18,7.4,0.7,26,31,3,50,23,2.5~ Tag literals are real dom elements
# ~blue1|16,14,-1.8,77,15,10,45,0.8,-0.3/16,13.3,-1.1,23,15,10,45,0.8,-0.3~ Tailwind-like css shorthands