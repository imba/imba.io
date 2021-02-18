tag value-picker
	css w:100px h:40px pos:rel
		d:hgrid ji:center ai:center
		.item h:100% pos:rel tween:styles 0.1s ease-out

	def update e
		value = data[e.x]

	<self @touch.stop.fit(0,data.length - 1,1)=update>
		for item in data
			<div.item[$value:{item}] .sel=(item==value)>

tag stroke-picker < value-picker
	css .item bg:black w:calc($value*1px) h:40% rd:sm
		o:0.3 @hover:0.8 .sel:1

tag color-picker < value-picker
	css .item js:stretch rdt:lg bg:$value mx:2px scale-y.sel:1.5
# ~=(item==|0,65,-15,50,23,15,48~ conditional classes
# ~.fit|0,75,-32,35,14,14,57~ convert touch coordinates
# ~css w|2,-12,78,75,18,80,65~ component-scoped styles
# ~for |2,-20,193,48,18,84,55~ loops & conditionals in tag trees
# ~$value|0,109,38,8,21,28,60~ interpolated css variables
# ~tag stroke-picker|2,-42,275,50,10,86,51~ Extend components
# ~css .item|2,-22,387,50,17,82,68~ Override scoped styles