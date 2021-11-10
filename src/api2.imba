import {SymbolFlags} from './util/flags'

export const MAP = {}
let t = Date.now!
global.apimap = MAP

class Members < Array
	
	def constructor owner, items = []
		super(...items)
		#owner = owner
		self
		
	get owner
		#owner
		
	get modifiers do filter do $1.modifier?
	get properties do filter do $1.property?
	get methods do filter do $1.method?
	get accessors do filter do $1.accessor?
	get custom do filter do $1.custom?
	get domprops do filter do $1.tags.idl
	get interfaces do filter do $1.interface?
	get namespaces do filter do $1.ns?
	get idl do filter do $1.tags.idl
		
	get resources
		[]
		
	get own
		filter do $1.owner == #owner
		
	get inherited
		filter do $1.owner != #owner and get($1.name) == $1
	
	get unique
		filter do self.get($1.name) == $1

	def filter cb
		new Members(#owner,super)
		
	def get name
		find do $1.name == name
	
	get grouped
		let all = unique
		[all.own,all.inherited]

class Entity
	name
	meta = {}
	flags = 0
	parent\Entity = null
	basetype\Entity = null
	implements\Entity[] = []
	examples = new Set
	members = []

	def constructor raw
		super(raw)

		if parent
			parent.members.push(self)
		MAP[qualifiedName] = self


	get ns? do flags & SymbolFlags.Namespace
	get global? do !parent or !parent.parent
	get interface? do flags & SymbolFlags.Interface | SymbolFlags.Class
	get method? do (flags & SymbolFlags.Method) != 0
	get property? do (flags & SymbolFlags.Property) != 0
	get modifier? do (flags & SymbolFlags.Modifier) != 0
	get accessor? do (flags & SymbolFlags.PropertyOrAccessor) != 0
	get member? do method? or property?

	get owner
		parent

	def get key
		members.find do $1.name == key
	
	def lookup key
		let parts = key.split('.')
		let source = self
		while source and parts[0]
			let key = parts.shift!
			source = source.all.find do $1.name == key

		return source
		# properties.find do $1.name == key

	get qualifiedName
		global? ? name : parent.qualifiedName + ".{name}"

	get own
		#own ||= new Members(self,members)

	get all
		#all ||= if true
			let arr = []
			if basetype
				arr.push(...basetype.all)
			arr.push(...members)
			for mixin in implements
				arr.push(...mixin.members)
			new Members(self,arr)
			

class InterfaceEntity < Entity

# class EventEntity < Entity

class EventEntity < Entity

def build raw
	let cls = Entity
	if raw.flags & (SymbolFlags.Interface | SymbolFlags.Class)
		cls = InterfaceEntity
	
	
	return new cls(raw)

const all = global.$api({},build)
console.log "api took",Date.now! - t
global.api2 = all
global.ag = all[0]
global.im = all[0].lookup('imba')
global.ie = all[0].lookup('ImbaIntersectEvent')