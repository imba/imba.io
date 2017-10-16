
# this should be more advanced than this, no?
tag imsel < imtok
	type 'selector'

	def isAtomic
		yes

	def reparsed code, old
		log "imsel reparsed",code,old
		self

tag imseltag < imtok
	type 'selector_tag'

tag imselclass < imtok
	type 'selector_class'

tag imselcomb < imtok
	type 'selector_combinator'

tag imselattrop < imtok
	type 'selector_attr_op'

tag imselattrop < imtok
	type 'selector_attr_op'