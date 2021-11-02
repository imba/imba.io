const json = globalThis['api.json']
let counter = 0

const root = new class
	paths = []
	entities = []
	kinds = {}
	lookups = {}
	
	def childByName name
		console.log 'api child by name',name
		return self[name]
		
	def entryForPath path
		paths[path]
		
	def lookup path
		if paths[path]
			return paths[path]
			
		if let m = path.match(/^(\@\w+)(?:\.([\w\-]+))?$/)
			let path = "/api/Element/{m[1]}"
			if m[1] == '@event'
				path = "/api/Event"

			if let ev = paths[path]
				if m[2]
					return ev.modifiers.get("@{m[2]}")
				return ev
		return null
		
	get descendants
		entities
		
	def getEvent name
		let ref = "/api/Element/@{name.replace('@','')}"
		if name == 'event'
			ref = "/api/Event"
		lookup(ref)
		
	def getEventModifier evname,modname
		let ev = getEvent(evname)
		if ev
			ev.modifiers.find(do $1.displayName == modname)
		
	def getStyleProperty name
		lookup("/css/properties/{name}")
		
	def getEntityForToken token
		let entity
		if token.type == 'tag.event.name'
			entity = getEvent(token.value)
		elif token.type == 'tag.event-modifier.name'
			let evname = token.context.name
			let modname = token.value
			entity = getEventModifier(evname,modname)
		elif token.type == 'style.property.name'
			entity = lookup("/css/properties/{token.value}")
			
		elif token.type == 'style.property.modifier' or token.type == 'style.selector.modifier'
			entity = lookup("/css/modifiers/{token.value}")
		
		return entity
		
		

class Members < Array
	
	def constructor owner, items = []
		super(...items)
		#owner = owner
		self
		
	get owner
		#owner
		
	get modifiers
		filter do $1.modifier?
		
	get properties
		filter do $1.property?
		
	get methods
		filter do $1 isa MethodEntity
		
	get own
		filter do $1.owner == #owner
		
	get inherited
		filter do $1.owner != #owner and get($1.name) == $1

	def filter cb
		new Members(#owner,super)
		
	def get name
		find do $1.name == name
	
const kindToClass = {}

export class Entity
	static def build desc, owner
		let cls = kindToClass[desc.kind] or Entity
		new cls(desc,owner)

	def constructor desc, owner
		id = "api{counter++}"
		name = desc.name
		desc = desc
		owner = owner
		kind = desc.kind
		
		meta = desc.meta or {}
		events = new Members(self)
		members = new Members(self)
		examples = new Set
		
		unless owner
			root[name] = self
		
		if desc.extends
			up = root[desc.extends]
			
		if desc.type
			type = root[desc.type]
		
		if desc.members
			for item in desc.members
				members.push(Entity.build(item,self))
		
		root.entities.unshift(self)
		root.paths[href] = self
		(root.kinds[kind] ||= []).push(self)
		register!
		
	get tags
		desc.tags
	
	get docs
		desc.docs or ''
		
	get searchTitle
		displayName
		
	get searchText
		#searchText ||= (displayName).replace(/\-/g,'').toLowerCase!
		
	def match query, options
		searchText.indexOf(query) >= 0
		
	get guide
		global.FS.find(href)
		
	def register
		self
		
	get props
		let res = (up ? (members.concat(up.props)) : members)
		res.#owner = self
		res
		
	get modifiers
		#modifiers ||= props.filter do $1.modifier?
		
	get properties
		#properties ||= props.properties
		
	get methods
		#methods ||= props.filter do $1 isa MethodEntity
		
	get siblings
		root.kinds[kind].filter do $1 != self
	
	get parents
		[]
		
	get breadcrumb
		[self]
		
	get summary
		desc.tags and desc.tags.summary or (docs and docs.length < 200 ? docs : '')
		
	# get events
	# 	members.events
	
	get head
		displayName

	get modifier?
		kind == 'eventmodifier'
		
	get property?
		kind == 'property'
		
	get api?
		yes
		
	get displayName
		name
		
	get title
		displayName
		
	get fullName
		owner ? "{owner.fullName}.{displayName}" : displayName
		
	get href
		"/api/{name}"
		
	get related
		#related ||= if true
			let all = []
			let meta = desc.meta
			for item in root.kinds[kind]
				continue if item == self
				for own k,v of item.tags
					if v == 1 and meta[k] == 1
						all.push(item)
			all

class InterfaceEntity < Entity
	descendants = []
	
	get interface?
		yes
	
	get icon
		import('codicons/symbol-class.svg')

	def register
		up.descendants.push(self) if up
		root[name] = self
		yes
		
	get parents
		#parents ||= up ? [up].concat(up.parents) : []
	
	get breadcrumb
		[self]

class EventInterfaceEntity < InterfaceEntity
	
	get modifierPrefix
		events.length == 1 ? events[0].displayName : "@{name.toLowerCase!.replace(/(\w)event/,'$1')}"
	
class EventEntity < Entity
	
	get icon
		import('codicons/symbol-event.svg')

	def register
		root.paths["Element.@{name}"] = self
		type.events.push(self)
		
	get displayName
		"@{name}"
		
	get searchTitle
		name
		
	get href
		"/api/Element/{displayName}"
		
	get siblings
		type.events.filter do $1 != self
		
	get properties
		type.properties
		
	get modifiers
		type.modifiers
		
	get parents
		typechain
		
	get typechain
		#typechain ||= [type]
		
	get breadcrumb
		[type,self]
		
	get docs
		siblings.length == 0 and !desc.docs ? type.docs : desc.docs
		
	# get examples
	#	#examples ||= global.FS.findExamplesFor(new RegExp("({displayName})(?=\\(|\\.|=)",'g'))
		
class EventModifierEntity < Entity
	
	get icon
		import('codicons/symbol-method.svg')
	
	get displayName
		"{name.slice(1)}"
		
	get qualifier
		owner.modifierPrefix + "."
		
	get searchTitle
		"@event.{displayName} modifier"
		
	get siblings
		#siblings ||= owner.modifiers.own.filter do $1 != self
	
	get parents
		#parents ||= [owner]
		
	get href
		owner.href + '/' + name
		
	get eventNames
		owner.events.map do $1.name
	
	get breadcrumb
		[owner,self]
		
	# get examples
	# 	#examples ||= global.FS.findExamplesFor(new RegExp("({eventNames.join('|')})\\.{displayName}(?=\\(|\\.|=)",'g'))
	
class PropertyEntity < Entity
	
	get icon
		import('codicons/symbol-field.svg')
		
	get searchTitle
		"{owner.name}.{name}"
	
	get siblings
		owner.properties.filter do $1 != self
		
	get parents
		#parents ||= [owner].concat(owner.parents)
		
	get breadcrumb
		[owner,self]
	
	get href
		owner.href + '/' + name	

class MethodEntity < PropertyEntity
	
	get icon
		import('codicons/symbol-method.svg')
		
	get siblings
		owner.methods.filter do $1 != self

class StyleEntity < Entity
	
	
	
class StyleProperty < StyleEntity
	
	def register
		if alias
			root.paths["/css/properties/{alias}"] = self
		super
	
	get icon
		import('codicons/symbol-enum.svg')
	
	get custom?
		desc.tags.custom
	
	get alias
		desc.alias
	
	get shortName
		alias or name
	
	get aliasFor
		custom? ? tags.detail : name
		
	get href
		"/css/properties/{name}"
		
	get guide
		global.FS.find("/api/css.properties.{name}")
	
	get searchText
		#searchText ||= [alias,name].filter(do $1).join('').replace(/\-/g,'').toLowerCase!
		
	get mdn
		return null if custom?
		return "https://developer.mozilla.org/en-US/docs/Web/CSS/{name}"
		
class StyleModifier < StyleEntity
	
	get icon
		import('codicons/symbol-enum.svg')
		
	get searchTitle
		name.slice(1)
	
	get custom?
		desc.tags.custom or desc.group == 'custom'
	
	get href
		"/css/modifiers/{name}"
	
class StyleValue < StyleEntity
	
kindToClass.interface = InterfaceEntity
kindToClass.eventinterface = EventInterfaceEntity
kindToClass.event = EventEntity
kindToClass.property = PropertyEntity
kindToClass.method = MethodEntity
kindToClass.eventmodifier = EventModifierEntity

kindToClass.styleprop = StyleProperty
kindToClass.stylemod = StyleModifier


for entry in json.entries
	Entity.build(entry)

global.API = root
export const api = root