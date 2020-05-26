import {movies} from '../../data.imba'

tag App
	prop query

	def render
		<self.(l:block p:5)>
			<input[query].(b:gray3 p:2 d:block w:100%) placeholder="Search">
			<ul> for movie in movies
				continue if query and movie.title.toLowerCase!.indexOf(query) == -1
				<li.(p:2 bb:gray2)> movie.title

imba.mount <App>