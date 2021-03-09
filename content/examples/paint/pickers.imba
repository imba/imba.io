tag value-picker
	css w:100px h:40px pos:rel
		d:hgrid ji:center ai:center
	css .item h:100% pos:rel tween:styles 0.1s ease-out

	def update e
		data = options[e.x]

	<self @touch.stop.fit(0,options.length - 1,1)=update>
		for item in options
			<div.item[$value:{item}] .sel=(item==data)>

tag stroke-picker < value-picker
	css .item bg:black w:calc($value*1px) h:40% rd:sm
		o:0.3 @hover:0.8 .sel:1

tag color-picker < value-picker
	css .item js:stretch rdt:lg bg:$value mx:2px scale-y.sel:1.5
# ~=(item==|16,4.6,-0.6,50,23,15,48,0,-0.3/-~ conditional classes
# ~.fit|16,6.4,-1.8,35,14,14,57,2,0/-~ convert touch coordinates
# ~css w|18,-12.5,1.3,75,18,79,64,-0.5,1/18,1.3,2.5,28,27,24,8,1,1.8~ component-scoped styles
# ~for |18,-14.8,-2.4,48,17,87,48,-0.3,1.3/18,-2.3,0.4,14,17,51,2,-0.3,1.3~ loops & conditionals in tag trees
# ~$value|16,12.9,-3.3,8,15,5,63,7,0.3/-~ interpolated css variables
# ~tag stroke-picker|18,-11.8,-1.4,72,10,91,35,0.3,1/18,6.7,-0.4,72,21,9,45,15.1,0~ Extend components
# ~css .item|18,-14,1.9,40,17,82,68,0.3,0.8/18,2.8,1.6,16,28,13,49,1.1,1.8~ Override scoped styles