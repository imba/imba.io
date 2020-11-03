(function () {
	'use strict';

	const $_parent$ = Symbol.for('#parent'), $_state$ = Symbol.for('#state'), $_window$ = Symbol.for('#window'), $_document$ = Symbol.for('#document'), $_imba$ = Symbol.for('#imba');

	class ImbaContext$1 {
		
		
		constructor(parent,state = {}){
			
			this[$_parent$] = parent;
			this[$_state$] = state;
		}
		
		get state(){
			
			return this[$_state$];
		}
		
		get version(){
			
			return '2.0.0-alpha.99';
		}
		
		get window(){
			
			return this[$_window$] || globalThis.window;
		}
		
		get document(){
			
			return this[$_document$] || globalThis.document;
		}
		
		get dom(){
			
			return this.window;
		}
		
		get clearInterval(){
			
			return globalThis.clearInterval;
		}
		
		get clearTimeout(){
			
			return globalThis.clearTimeout;
		}
		
		setTimeout(fn,ms){
			var self = this;
			
			return setTimeout(function() {
				
				fn();
				self.commit();
				return;
			},ms);
		}
		
		setInterval(fn,ms){
			var self = this;
			
			return setInterval(function() {
				
				fn();
				self.commit();
				return;
			},ms);
		}
		
		run(cb){
			
			return cb();
		}
	} globalThis.ImbaContext = ImbaContext$1;


	globalThis.imba = globalThis[$_imba$] = new ImbaContext$1;

	imba.mount = function (mountable,into){
		
		let parent = into || imba.document.body;
		let element = mountable;
		if (mountable instanceof Function) {
			
			let ctx = {_: parent};
			let tick = function() {
				
				imba.ctx = ctx;
				return mountable(ctx);
			};
			element = tick();
			imba.scheduler.listen('render',tick);
		} else {
			
			// automatic scheduling of element - even before
			// element.__schedule = yes
			element.__F |= 64;
		}	
		return parent.appendChild(element);
	};

	// TBD
	imba.unmount = function (node){
		
		throw "Not implemented";
	};

	imba.getElementById = function (id){
		
		return imba.document.getElementById(id);
	};

	imba.q$ = function (query,ctx){
		
		return ((ctx instanceof imba.window.Element) ? ctx : imba.document).querySelector(query);
	};

	imba.q$$ = function (query,ctx){
		
		return ((ctx instanceof imba.window.Element) ? ctx : imba.document).querySelectorAll(query);
	};


	/*
	Imba currently uses top-level functions like imba.createElement 
	and imba.createComponent to build the nodes in a dom tree.

	The plan is to formalize an interface for all methods used by
	the dom builder that creates nodes through parent.createChild('type',...).
	In addition to being slightly faster it will make it really easy
	to create trees that are not backed by real dom elements.


	class NodeInterface

		def #createChild type,key
			let el = document.createElement(type)
			el.#parent = self
			return self[key] = el

		def #insertChild item,itemkey,slotkey
			yes

		def #setContent item
			yes

		def #setText text
			textContent = text
			yes

		def ##setClasses string
			yes
	*/

	const $___listeners__$ = Symbol.for('#__listeners__');

	/*
	Collection of convenience methods.
	*/


	const dashRegex = /-./g;

	imba.toCamelCase = function (str){
		
		if (str.indexOf('-') >= 0) {
			
			return str.replace(dashRegex,function(_0) { return _0.charAt(1).toUpperCase(); });
		} else {
			
			return str;
		}};


	// Basic events - move to separate file?
	const emit__ = function(event,args,node) {
		
		let prev;
		let cb;
		let ret;
		
		while ((prev = node) && (node = node.next)){
			
			if (cb = node.listener) {
				
				if (node.path && cb[node.path]) {
					
					ret = args ? cb[node.path].apply(cb,args) : cb[node.path]();
				} else {
					
					// check if it is a method?
					ret = args ? cb.apply(node,args) : cb.call(node);
				}		}		
			if (node.times && --node.times <= 0) {
				
				prev.next = node.next;
				node.listener = null;
			}	}	return;
	};

	// method for registering a listener on object
	imba.listen = function (obj,event,listener,path){
		
		let cbs;
		let list;
		let tail;
		cbs = obj[$___listeners__$] || (obj[$___listeners__$] = {});
		list = cbs[event] || (cbs[event] = {});
		tail = list.tail || (list.tail = (list.next = {}));
		tail.listener = listener;
		tail.path = path;
		list.tail = tail.next = {};
		return tail;
	};

	// register a listener once
	imba.once = function (obj,event,listener){
		
		let tail = imba.listen(obj,event,listener);
		tail.times = 1;
		return tail;
	};

	// remove a listener
	imba.unlisten = function (obj,event,cb,meth){
		
		let node;
		let prev;
		let meta = obj[$___listeners__$];
		if (!(meta)) { return }	
		if (node = meta[event]) {
			
			while ((prev = node) && (node = node.next)){
				
				if (node == cb || node.listener == cb) {
					
					prev.next = node.next;
					// check for correct path as well?
					node.listener = null;
					break;
				}		}	}	return;
	};

	// emit event
	imba.emit = function (obj,event,params){
		let cb;
		
		if (cb = obj[$___listeners__$]) {
			
			if (cb[event]) { emit__(event,params,cb[event]); }		if (cb.all) { emit__(event,[event,params],cb.all); }	}	return;
	};

	function extend$(target,ext){
		// @ts-ignore
		var descriptors = Object.getOwnPropertyDescriptors(ext);
		// @ts-ignore
		Object.defineProperties(target.prototype,descriptors);
		return target;
	}function iter$(a){ let v; return a ? ((v=a.toIterable) ? v.call(a) : a) : []; }const $_scheduler$ = Symbol.for('#scheduler');

	var raf = (typeof requestAnimationFrame !== 'undefined') ? requestAnimationFrame : (function(blk) { return setTimeout(blk,1000 / 60); });

	// Scheduler
	class ImbaScheduler {
		
		constructor(){
			var self = this;
			
			this.queue = [];
			this.stage = -1;
			this.batch = 0;
			this.scheduled = false;
			this.listeners = {};
			this.commit = function() {
				
				self.add('render');
				return self;
			};
			
			this.$promise = null;
			this.$resolve = null;
			this.$ticker = function(e) {
				
				self.scheduled = false;
				return self.tick(e);
			};
		}
		
		add(item,force){
			
			if (force || this.queue.indexOf(item) == -1) {
				
				this.queue.push(item);
			}		
			if (!(this.scheduled)) { this.schedule(); }		return this;
		}
		
		listen(ns,item){
			var $0;
			
			($0 = this.listeners)[ns] || ($0[ns] = new Set);
			return this.listeners[ns].add(item);
		}
		
		unlisten(ns,item){
			
			return this.listeners[ns] && this.listeners[ns].delete(item);
		}
		
		get promise(){
			var self = this;
			
			return this.$promise || (this.$promise = new Promise(function(resolve) {
				
				return self.$resolve = resolve;
			}));
		}
		
		tick(timestamp){
			var self = this;
			
			var items = this.queue;
			if (!(this.ts)) { this.ts = timestamp; }		this.dt = timestamp - this.ts;
			this.ts = timestamp;
			this.queue = [];
			this.stage = 1;
			this.batch++;
			
			if (items.length) {
				
				for (let i = 0, $items = iter$(items), $len = $items.length; i < $len; i++) {
					let item = $items[i];
					if (typeof item === 'string' && this.listeners[item]) {
						
						this.listeners[item].forEach(function(item) {
							
							if (item.tick instanceof Function) {
								
								return item.tick(self);
							} else if (item instanceof Function) {
								
								return item(self);
							}					});
					} else if (item instanceof Function) {
						
						item(this.dt,this);
					} else if (item.tick) {
						
						item.tick(this.dt,this);
					}			}		}		this.stage = 2;
			this.stage = this.scheduled ? 0 : -1;
			if (this.$promise) {
				
				this.$resolve(this);
				this.$promise = this.$resolve = null;
			}		return this;
		}
		
		schedule(){
			
			if (!(this.scheduled)) {
				
				this.scheduled = true;
				if (this.stage == -1) {
					
					this.stage = 0;
				}			raf(this.$ticker);
			}		return this;
		}
	} globalThis.ImbaScheduler = ImbaScheduler;

	extend$(ImbaContext,{
		
		get scheduler(){
			
			return this[$_scheduler$] || (this[$_scheduler$] = new ImbaScheduler);
		},
		
		commit(){
			
			return this.scheduler.add('render').promise;
		},
	});

	function extend$$1(target,ext){
		// @ts-ignore
		var descriptors = Object.getOwnPropertyDescriptors(ext);
		// @ts-ignore
		Object.defineProperties(target.prototype,descriptors);
		return target;
	}const $_parent$$1 = Symbol.for('#parent'), $__parent$ = Symbol.for('##parent');

	const Node = imba.window.Node;

	extend$$1(Node,{
		
		get [$_parent$$1](){
			
			return this[$__parent$] || this.parentNode;
		},
		
		init$(){
			
			return this;
		},
		
		// replace this with something else
		replaceWith$(other){
			
			if (!((other instanceof Node)) && other.replace$) {
				
				other.replace$(this);
			} else {
				
				this.parentNode.replaceChild(other,this);
			}		return other;
		},
		
		insertInto$(parent){
			
			parent.appendChild$(this);
			return this;
		},
		
		insertBefore$(el,prev){
			
			return this.insertBefore(el,prev);
		},
		
		insertBeforeBegin$(other){
			
			return this.parentNode.insertBefore(other,this);
		},
		
		insertAfterEnd$(other){
			
			if (this.nextSibling) {
				
				return this.nextSibling.insertBeforeBegin$(other);
			} else {
				
				return this.parentNode.appendChild(other);
			}	},
		
		insertAfterBegin$(other){
			
			if (this.childNodes[0]) {
				
				return this.childNodes[0].insertBeforeBegin$(other);
			} else {
				
				return this.appendChild(other);
			}	},
	});

	function extend$$2(target,ext){
		// @ts-ignore
		var descriptors = Object.getOwnPropertyDescriptors(ext);
		// @ts-ignore
		Object.defineProperties(target.prototype,descriptors);
		return target;
	}
	extend$$2(imba.dom.Comment,{
		
		// replace this with something else
		replaceWith$(other){
			
			if (other && other.joinBefore$) {
				
				other.joinBefore$(this);
			} else {
				
				this.parentNode.insertBefore$(other,this);
			}		this.parentNode.removeChild(this);
			return other;
		},
	});

	function extend$$3(target,ext){
		// @ts-ignore
		var descriptors = Object.getOwnPropertyDescriptors(ext);
		// @ts-ignore
		Object.defineProperties(target.prototype,descriptors);
		return target;
	}
	const {Node: Node$1,Element: Element,Comment: Comment,Text: Text} = imba.window;
	const doc = imba.document;// global.#document or global.document
	// what if this is in a webworker?
	extend$$3(Element,{
		
		
		log(...params){
			
			console.log(...params);
			return this;
		},
		
		slot$(name,ctx){
			
			return this;
		},
		
		// inline in files or remove all together?
		text$(item){
			
			this.textContent = item;
			return this;
		},
		
		insert$(item,f,prev){
			
			let type = typeof item;
			
			if (type === 'undefined' || item === null) {
				
				// what if the prev value was the same?
				if (prev && (prev instanceof Comment)) { // check perf
					
					return prev;
				}			
				let el = doc.createComment('');
				prev ? prev.replaceWith$(el) : el.insertInto$(this);
				return el;
			}		
			// dont reinsert again
			if (item === prev) {
				
				return item;
			} else if (type !== 'object') {
				
				let res;
				let txt = item;
				
				if ((f & 128) && (f & 256)) {
					
					// FIXME what if the previous one was not text? Possibly dangerous
					// when we set this on a fragment - it essentially replaces the whole
					// fragment?
					this.textContent = txt;
					return;
				}			
				if (prev) {
					
					if (prev instanceof Text) { // check perf
						
						prev.textContent = txt;
						return prev;
					} else {
						
						res = doc.createTextNode(txt);
						prev.replaceWith$(res,this);
						return res;
					}			} else {
					
					this.appendChild$(res = doc.createTextNode(txt));
					return res;
				}		} else {
				
				prev ? prev.replaceWith$(item,this) : item.insertInto$(this);
				return item;
			}	},
		
		open$(){
			
			return this;
		},
		
		close$(){
			
			return this;
		},
		
		end$(){
			
			if (this.render) { this.render(); }		return;
		},
	});

	Element.prototype.appendChild$ = Element.prototype.appendChild;
	Element.prototype.removeChild$ = Element.prototype.removeChild;
	Element.prototype.insertBefore$ = Element.prototype.insertBefore;
	Element.prototype.replaceChild$ = Element.prototype.replaceChild;

	Element.prototype.set$ = Element.prototype.setAttribute;
	Element.prototype.setns$ = Element.prototype.setAttributeNS;

	imba.createElement = function (name,parent,flags,text){
		
		var el = doc.createElement(name);
		
		if (flags) { el.className = flags; }	
		if (text !== null) {
			
			el.text$(text);
		}	
		if (parent && (parent instanceof Node$1)) {
			
			el.insertInto$(parent);
		}	
		return el;
	};

	function extend$$4(target,ext){
		// @ts-ignore
		var descriptors = Object.getOwnPropertyDescriptors(ext);
		// @ts-ignore
		Object.defineProperties(target.prototype,descriptors);
		return target;
	}const $_parent$$2 = Symbol.for('#parent');

	const {Element: Element$1,ShadowRoot: ShadowRoot} = imba.dom;

	ShadowRoot.prototype.insert$ = Element$1.prototype.insert$;
	ShadowRoot.prototype.appendChild$ = Element$1.prototype.appendChild$;

	extend$$4(ShadowRoot,{
		
		get [$_parent$$2](){
			
			return this.host;
		},
	});

	function extend$$5(target,ext){
		// @ts-ignore
		var descriptors = Object.getOwnPropertyDescriptors(ext);
		// @ts-ignore
		Object.defineProperties(target.prototype,descriptors);
		return target;
	}

	const {Node: Node$2,SVGElement: SVGElement} = imba.dom;

	const descriptorCache = {};
	function getDescriptor(item,key,cache){
		
		if (!(item)) {
			
			return cache[key] = null;
		}	
		if (cache[key] !== undefined) {
			
			return cache[key];
		}	
		let desc = Object.getOwnPropertyDescriptor(item,key);
		
		if (desc !== undefined || item == SVGElement) {
			
			return cache[key] = desc || null;
		}	
		return getDescriptor(Reflect.getPrototypeOf(item),key,cache);
	}
	extend$$5(SVGElement,{
		
		
		set$(key,value){
			var $0;
			
			let cache = descriptorCache[($0 = this.nodeName)] || (descriptorCache[$0] = {});
			let desc = getDescriptor(this,key,cache);
			
			if (!(desc) || !(desc.set)) {
				
				this.setAttribute(key,value);
			} else {
				
				this[key] = value;
			}		return;
		},
	});



	extend$$5(SVGElement,{
		
		flag$(str){
			
			let ns = this.flags$ns;
			this.className.baseVal = ns ? ((ns + (this.flags$ext = str))) : ((this.flags$ext = str));
			return;
		},
		
		flagSelf$(str){
			var self = this;
			
			// if a tag receives flags from inside <self> we need to
			// redefine the flag-methods to later use both
			this.flag$ = function(str) { return self.flagSync$(self.flags$ext = str); };
			this.flagSelf$ = function(str) { return self.flagSync$(self.flags$own = str); };
			return this.flagSelf$(str);
		},
		
		flagSync$(){
			
			return this.className.baseVal = ((this.flags$ns || '') + (this.flags$ext || '') + ' ' + (this.flags$own || '') + ' ' + (this.$flags || ''));
		},
	});


	imba.createSVGElement = function (name,parent,flags,text,ctx){
		
		var el = imba.document.createElementNS("http://www.w3.org/2000/svg",name);
		
		if (flags) {
			
			{
				
				el.className.baseVal = flags;
			}	}	
		if (parent && (parent instanceof Node$2)) {
			
			el.insertInto$(parent);
		}	return el;
	};

	// currently needed for richValue override

	function iter$$1(a){ let v; return a ? ((v=a.toIterable) ? v.call(a) : a) : []; }function extend$$6(target,ext){
		// @ts-ignore
		var descriptors = Object.getOwnPropertyDescriptors(ext);
		// @ts-ignore
		Object.defineProperties(target.prototype,descriptors);
		return target;
	}const $_parent$$3 = Symbol.for('#parent'), $__up$ = Symbol.for('##up'), $__parent$$1 = Symbol.for('##parent');

	// import {DocumentFragment,Element,Text,ShadowRoot,document} from '../dom'

	const {Element: Element$2,Text: Text$1} = imba.dom;

	extend$$6(imba.dom.DocumentFragment,{
		
		
		get [$_parent$$3](){
			
			return this[$__up$] || this[$__parent$$1];
		},
		
		// Called to make a documentFragment become a live fragment
		setup$(flags,options){
			
			this.$start = imba.document.createComment('start');
			this.$end = imba.document.createComment('end');
			
			this.$end.replaceWith$ = function(other) {
				
				this.parentNode.insertBefore(other,this);
				return other;
			};
			
			this.appendChild(this.$start);
			return this.appendChild(this.$end);
		},
		
		// when we for sure know that the only content should be
		// a single text node
		text$(item){
			
			if (!(this.$text)) {
				
				this.$text = this.insert$(item);
			} else {
				
				this.$text.textContent = item;
			}		return;
		},
		
		insert$(item,options,toReplace){
			
			if (this[$__parent$$1]) {
				
				// if the fragment is attached to a parent
				// we can just proxy the call through
				return this[$__parent$$1].insert$(item,options,toReplace || this.$end);
			} else {
				
				return Element$2.prototype.insert$.call(this,item,options,toReplace || this.$end);
			}	},
		
		insertInto$(parent,before){
			
			if (!this[$__parent$$1]) {
				
				this[$__parent$$1] = parent;
				// console.log 'insertFrgment into',parent,Array.from(self.childNodes)
				parent.appendChild$(this);
			}		return this;
		},
		
		replaceWith$(other,parent){
			
			this.$start.insertBeforeBegin$(other);
			var el = this.$start;
			while (el){
				
				let next = el.nextSibling;
				this.appendChild(el);
				if (el == this.$end) { break; }			el = next;
				
			}		return other;
		},
		
		appendChild$(child){
			
			this.$end ? this.$end.insertBeforeBegin$(child) : this.appendChild(child);
			return child;
		},
		
		removeChild$(child){
			
			child.parentNode && child.parentNode.removeChild(child);
			return this;
		},
		
		isEmpty$(){
			
			let el = this.$start;
			let end = this.$end;
			
			while (el = el.nextSibling){
				
				if (el == end) { break; }			if ((el instanceof Element$2) || (el instanceof Text$1)) { return false }		}		return true;
		},
	});

	class VirtualFragment {
		
		constructor(f,parent){
			
			this.__F = f;
			this[$_parent$$3] = parent;
			
			if (!((f & 128)) && (this instanceof KeyedTagFragment)) {
				
				this.$start = imba.document.createComment('start');
				if (parent) { parent.appendChild$(this.$start); }		}		
			if (!(f & 256)) {
				
				this.$end = imba.document.createComment('end');
				if (parent) { parent.appendChild$(this.$end); }		}		
			this.setup();
		}
		
		appendChild$(item,index){
			
			// we know that these items are dom elements
			if (this.$end && this[$_parent$$3]) {
				
				this.$end.insertBeforeBegin$(item);
			} else if (this[$_parent$$3]) {
				
				this[$_parent$$3].appendChild$(item);
			}		return;
		}
		
		replaceWith$(other){
			
			this.detachNodes();
			this.$end.insertBeforeBegin$(other);
			this[$_parent$$3].removeChild$(this.$end);
			this[$_parent$$3] = null;
			return;
		}
		
		joinBefore$(before){
			
			return this.insertInto$(before.parentNode,before);
		}
		
		insertInto$(parent,before){
			
			if (!this[$_parent$$3]) {
				
				this[$_parent$$3] = parent;
				before ? before.insertBeforeBegin$(this.$end) : parent.appendChild$(this.$end);
				this.attachNodes();
			}		return this;
		}
		
		replace$(other){
			
			if (!this[$_parent$$3]) {
				
				this[$_parent$$3] = other.parentNode;
			}		other.replaceWith$(this.$end);
			this.attachNodes();
			return this;
			
		}
		setup(){
			
			return this;
		}
	}
	class KeyedTagFragment extends VirtualFragment {
		
		setup(){
			
			this.array = [];
			this.changes = new Map;
			this.dirty = false;
			return this.$ = {};
		}
		
		push(item,idx){
			
			// on first iteration we can merely run through
			if (!(this.__F & 1)) {
				
				this.array.push(item);
				this.appendChild$(item);
				return;
			}		
			let toReplace = this.array[idx];
			
			if (toReplace === item) ; else {
				
				this.dirty = true;
				// if this is a new item
				let prevIndex = this.array.indexOf(item);
				let changed = this.changes.get(item);
				
				if (prevIndex === -1) {
					
					// should we mark the one currently in slot as removed?
					this.array.splice(idx,0,item);
					this.insertChild(item,idx);
				} else if (prevIndex === idx + 1) {
					
					if (toReplace) {
						
						this.changes.set(toReplace,-1);
					}				this.array.splice(idx,1);
				} else {
					
					if (prevIndex >= 0) { this.array.splice(prevIndex,1); }				this.array.splice(idx,0,item);
					this.insertChild(item,idx);
				}			
				if (changed == -1) {
					
					this.changes.delete(item);
				}		}		return;
		}
		
		insertChild(item,index){
			
			if (index > 0) {
				
				let other = this.array[index - 1];
				// will fail with text nodes
				other.insertAfterEnd$(item);
			} else if (this.$start) {
				
				this.$start.insertAfterEnd$(item);
			} else {
				
				this[$_parent$$3].insertAfterBegin$(item);
			}		return;
		}
		
		removeChild(item,index){
			
			// self.map.delete(item)
			// what if this is a fragment or virtual node?
			if (item.parentNode == this[$_parent$$3]) {
				
				this[$_parent$$3].removeChild(item);
			}		return;
		}
		
		attachNodes(){
			
			for (let i = 0, $items = iter$$1(this.array), $len = $items.length; i < $len; i++) {
				let item = $items[i];
				this.$end.insertBeforeBegin$(item);
			}		return;
		}
		
		detachNodes(){
			
			for (let $i = 0, $items = iter$$1(this.array), $len = $items.length; $i < $len; $i++) {
				let item = $items[$i];
				this[$_parent$$3].removeChild(item);
			}		return;
		}
		
		end$(index){
			var self = this;
			
			if (!(this.__F & 1)) {
				
				this.__F |= 1;
				return;
			}		
			if (this.dirty) {
				
				this.changes.forEach(function(pos,item) {
					
					if (pos == -1) {
						
						return self.removeChild(item);
					}			});
				this.changes.clear();
				this.dirty = false;
			}		
			// there are some items we should remove now
			if (this.array.length > index) {
				
				
				// remove the children below
				while (this.array.length > index){
					
					let item = this.array.pop();
					this.removeChild(item);
				}			// self.array.length = index
			}		return;
		}
	}
	class IndexedTagFragment extends VirtualFragment {
		
		
		setup(){
			
			this.$ = [];
			return this.length = 0;
		}
		
		end$(len){
			
			let from = this.length;
			if (from == len || !this[$_parent$$3]) { return }		let array = this.$;
			let par = this[$_parent$$3];
			
			if (from > len) {
				
				while (from > len){
					
					par.removeChild$(array[--from]);
				}		} else if (len > from) {
				
				while (len > from){
					
					this.appendChild$(array[from++]);
				}		}		this.length = len;
			return;
		}
		
		attachNodes(){
			
			for (let i = 0, $items = iter$$1(this.$), $len = $items.length; i < $len; i++) {
				let item = $items[i];
				if (i == this.length) { break; }			this.$end.insertBeforeBegin$(item);
			}		return;
		}
		
		detachNodes(){
			
			let i = 0;
			while (i < this.length){
				
				let item = this.$[i++];
				this[$_parent$$3].removeChild$(item);
			}		return;
		}
	}
	imba.createLiveFragment = function (bitflags,options,par){
		
		var el = imba.document.createDocumentFragment();
		el.setup$(bitflags,options);
		if (par) { el[$__up$] = par; }	return el;
	};

	imba.createIndexedFragment = function (bitflags,parent){
		
		return new IndexedTagFragment(bitflags,parent);
	};

	imba.createKeyedFragment = function (bitflags,parent){
		
		return new KeyedTagFragment(bitflags,parent);
	};

	function extend$$7(target,ext){
		// @ts-ignore
		var descriptors = Object.getOwnPropertyDescriptors(ext);
		// @ts-ignore
		Object.defineProperties(target.prototype,descriptors);
		return target;
	}const $_context$ = Symbol.for('#context'), $_parent$$4 = Symbol.for('#parent'), $__context$ = Symbol.for('##context');

	const handler = {
		get(target,name){
			
			let ctx = target;
			let val = undefined;
			while (ctx && val == undefined){
				
				if (ctx = ctx[$_parent$$4]) {
					
					val = ctx[name];
				}		}		return val;
		}
	};

	extend$$7(imba.dom.Node,{
		
		
		get $context(){
			
			return console.warn("$context is deprecated - use #context instead");
		},
		
		get [$_context$](){
			
			return this[$__context$] || (this[$__context$] = new Proxy(this,handler));
		},
	});

	const $__parent$$2 = Symbol.for('##parent');

	// import {HTMLElement} from '../dom'

	const DOM = imba.dom;
	const doc$1 = imba.document;// global.#document or global.document

	imba.window.ImbaElement = class ImbaElement extends imba.window.HTMLElement {
		
		constructor(){
			
			super();
			if (this.flags$ns) {
				
				this.flag$ = this.flagExt$;
			}		
			this.setup$();
			this.build();
		}
		
		setup$(){
			
			this.__slots = {};
			return this.__F = 0;
		}
		
		init$(){
			
			this.__F |= (1 | 2);
			return this;
			
		}
		flag$(str){
			
			this.className = this.flags$ext = str;
			return;
		}
		
		// returns the named slot - for context
		slot$(name,ctx){
			var $0;
			
			if (name == '__' && !(this.render)) {
				
				return this;
			}		
			return ($0 = this.__slots)[name] || ($0[name] = imba.createLiveFragment(0,null,this));
		}
		
		// called immediately after construction 
		build(){
			
			return this;
		}
		
		// called before the first mount
		awaken(){
			
			return this;
		}
		
		// called when element is attached to document
		mount(){
			
			return this;
		}
		
		unmount(){
			
			return this;
		}
		
		// called after render
		rendered(){
			
			return this;
		}
		
		// called before element is stringified on server (SSR)
		dehydrate(){
			
			return this;
		}
		
		// called before awaken if element was not initially created via imba - on the client
		hydrate(){
			
			// should only autoschedule if we are not awakening inside a parent context that
			this.autoschedule = true;
			return this;
		}
		
		tick(){
			
			return this.commit();
		}
		
		// called when component is (re-)rendered from its parent
		visit(){
			
			return this.commit();
		}
		
		// Wrapper for rendering. Default implementation
		commit(){
			
			if (!(this.isRender)) { return this }		this.__F |= 256;
			this.render && this.render();
			this.rendered();
			return this.__F = (this.__F | 512) & ~256;
		}
		
		
		
		get autoschedule(){
			
			return (this.__F & 64) != 0;
		}
		
		set autoschedule(value){
			
			value ? ((this.__F |= 64)) : ((this.__F &= ~64));
		}
		
		get isRender(){
			
			return true;
		}
		
		get isMounting(){
			
			return (this.__F & 16) != 0;
		}
		
		get isMounted(){
			
			return (this.__F & 32) != 0;
		}
		
		get isAwakened(){
			
			return (this.__F & 8) != 0;
		}
		
		get isRendered(){
			
			return (this.__F & 512) != 0;
		}
		
		get isRendering(){
			
			return (this.__F & 256) != 0;
		}
		
		get isScheduled(){
			
			return (this.__F & 128) != 0;
		}
		
		get isHydrated(){
			
			return (this.__F & 2) != 0;
		}
		
		schedule(){
			
			imba.scheduler.listen('render',this);
			this.__F |= 128;
			return this;
		}
		
		unschedule(){
			
			imba.scheduler.unlisten('render',this);
			this.__F &= ~128;
			return this;
		}
		
		end$(){
			
			return this.visit();
		}
		
		connectedCallback(){
			
			let flags = this.__F;
			let inited = flags & 1;
			let awakened = flags & 8;
			
			// return if we are already in the process of mounting - or have mounted
			if (flags & (16 | 32)) {
				
				return;
			}		
			this.__F |= 16;
			
			if (!(inited)) {
				
				this.init$();
			}		
			if (!(flags & 2)) {
				
				this.flags$ext = this.className;
				this.hydrate();
				this.__F |= 2;
				this.commit();
			}		
			if (!(awakened)) {
				
				this.awaken();
				this.__F |= 8;
			}		
			let res = this.mount();
			if (res && (res.then instanceof Function)) {
				
				res.then(imba.scheduler.commit);
			}		
			// else
			// if this.render and $EL_RENDERED$
			// 	this.render()
			flags = this.__F = (this.__F | 32) & ~16;
			
			if (flags & 64) {
				
				this.schedule();
			}		
			return this;
		}
		
		disconnectedCallback(){
			
			this.__F = this.__F & (~32 & ~16);
			if (this.__F & 128) { this.unschedule(); }		return this.unmount();
		}
	};


	// Stuff for element registry

	const CustomTagConstructors = {};

	class ImbaElementRegistry {
		
		
		constructor(){
			
			this.types = {};
		}
		
		lookup(name){
			
			return this.types[name];
		}
		
		get(name,klass){
			
			if (!(name) || name == 'component') { return DOM.ImbaElement }		if (this.types[name]) { return this.types[name] }		if (klass && DOM[klass]) { return DOM[klass] }		return DOM.customElements.get(name) || DOM.ImbaElement;
		}
		
		create(name){
			
			if (this.types[name]) {
				
				// TODO refactor
				return this.types[name].create$();
			} else {
				
				return doc$1.createElement(name);
			}	}
		
		define(name,klass,options = {}){
			
			this.types[name] = klass;
			klass.nodeName = name;
			
			let proto = klass.prototype;
			
			// if proto.render && proto.end$ == Element.prototype.end$
			// proto.end$ = proto.render
			let basens = proto._ns_;
			if (options.ns) {
				
				let ns = options.ns;
				let flags = ns + ' ' + ns + '_ ';
				if (basens) {
					
					flags += proto.flags$ns;
					ns += ' ' + basens;
				}			proto._ns_ = ns;
				proto.flags$ns = flags;
			}		
			if (options.extends) {
				
				CustomTagConstructors[name] = klass;
			} else {
				
				DOM.customElements.define(name,klass);
			}		return klass;
		}
	}
	imba.tags = new ImbaElementRegistry;

	const proto = imba.window.ImbaElement.prototype;

	imba.createComponent = function (name,parent,flags,text,ctx){
		
		// the component could have a different web-components name?
		var el;
		
		if (typeof name != 'string') {
			
			if (name && name.nodeName) {
				
				name = name.nodeName;
			}	}	
		if (CustomTagConstructors[name]) {
			
			el = CustomTagConstructors[name].create$(el);
			// extend with mroe stuff
			
			el.slot$ = proto.slot$;
			el.__slots = {};
		} else {
			
			el = doc$1.createElement(name);
		}	
		el[$__parent$$2] = parent;
		el.init$();
		
		if (text !== null) {
			
			el.slot$('__').text$(text);
			
		}	if (flags || el.flags$ns) { // or nsflag
			
			el.flag$(flags || '');
		}	return el;
	};

	function extend$$8(target,ext){
		// @ts-ignore
		var descriptors = Object.getOwnPropertyDescriptors(ext);
		// @ts-ignore
		Object.defineProperties(target.prototype,descriptors);
		return target;
	}
	const {Element: Element$3} = imba.dom;

	class Flags {
		
		
		constructor(dom){
			
			this.dom = dom;
			this.string = "";
		}
		
		contains(ref){
			
			return this.dom.classList.contains(ref);
		}
		
		add(ref){
			
			if (this.contains(ref)) { return this }		this.string += (this.string ? ' ' : '') + ref;
			this.dom.classList.add(ref);
			// sync!
			return this;
		}
		
		remove(ref){
			
			if (!(this.contains(ref))) { return this }		var regex = new RegExp('(^|\\s)*' + ref + '(\\s|$)*','g');
			this.string = this.string.replace(regex,'');
			this.dom.classList.remove(ref);
			// sync!
			return this;
		}
		
		toggle(ref,bool){
			
			if (bool === undefined) { bool = !(this.contains(ref)); }		return bool ? this.add(ref) : this.remove(ref);
			
		}
		incr(ref){
			
			let m = this.stacks || (this.stacks = {});
			let c = m[ref] || 0;
			if (c < 1) { this.add(ref); }		m[ref] = Math.max(c,0) + 1;
			return this;
		}
		
		decr(ref){
			
			let m = this.stacks || (this.stacks = {});
			let c = m[ref] || 0;
			if (c == 1) { this.remove(ref); }		m[ref] = Math.max(c,1) - 1;
			return this;
		}
		
		valueOf(){
			
			return this.string;
		}
		
		toString(){
			
			return this.string;
		}
		
		sync(){
			
			return this.dom.flagSync$();
		}
	}

	extend$$8(Element$3,{
		
		
		get flags(){
			
			if (!(this.$flags)) {
				
				// unless deopted - we want to first cache the extflags
				this.$flags = new Flags(this);
				if (this.flag$ == Element$3.prototype.flag$) {
					
					this.flags$ext = this.className;
				}			this.flagDeopt$();
			}		return this.$flags;
		},
		
		flag$(str){
			
			// Potentially slow
			let ns = this.flags$ns;
			this.className = ns ? ((ns + (this.flags$ext = str))) : ((this.flags$ext = str));
			return;
			
		},
		flagDeopt$(){
			var self = this;
			
			this.flag$ = this.flagExt$;// do(str) self.flagSync$(flags$ext = str)
			this.flagSelf$ = function(str) { return self.flagSync$(self.flags$own = str); };
			return;
			
		},
		flagExt$(str){
			
			return this.flagSync$(this.flags$ext = str);
		},
		
		flagSelf$(str){
			
			// if a tag receives flags from inside <self> we need to
			// redefine the flag-methods to later use both
			this.flagDeopt$();
			return this.flagSelf$(str);
		},
		
		flagSync$(){
			
			return this.className = ((this.flags$ns || '') + (this.flags$ext || '') + ' ' + (this.flags$own || '') + ' ' + (this.$flags || ''));
		},
	});

	function extend$$9(target,ext){
		// @ts-ignore
		var descriptors = Object.getOwnPropertyDescriptors(ext);
		// @ts-ignore
		Object.defineProperties(target.prototype,descriptors);
		return target;
	}

	const VALID_CSS_UNITS = {
		cm: 1,
		mm: 1,
		Q: 1,
		pc: 1,
		pt: 1,
		px: 1,
		em: 1,
		ex: 1,
		ch: 1,
		rem: 1,
		vw: 1,
		vh: 1,
		vmin: 1,
		vmax: 1,
		s: 1,
		ms: 1,
		fr: 1,
		'%': 1,
		in: 1,
		turn: 1,
		grad: 1,
		rad: 1,
		deg: 1,
		Hz: 1,
		kHz: 1
	};

	const CSS_STR_PROPS = {
		prefix: 1,
		suffix: 1,
		content: 1
	};

	const CSS_PX_PROPS = /^([xyz])$/;
	const CSS_DIM_PROPS = /^([tlbr]|size|[whtlbr]|[mps][tlbrxy]?|[rcxy]?[gs])$/;

	const ext = imba.css || (imba.css = {});

	let root;
	let resets = '*,::before,::after {\nbox-sizing: border-box;\nborder-width: 0;\nborder-style: solid;\nborder-color: currentColor;\n}';

	const map = {};

	ext.setup = function (){
		
		if (!(root)) {
			
			if (root = imba.document.documentElement) {
				
				return this.register(resets,'root');
			}	}};

	ext.register = function (styles,id){
		
		if (!(map.root) && id != 'root') {
			
			ext.register(resets,'root');
		}	
		if (id && !(map[id])) {
			
			let entry = map[id] = {raw: styles};
			
			
			entry.node = imba.document.createElement('style');
			entry.node.textContent = entry.raw;
			imba.document.head.appendChild(entry.node);
		}	
		return;
	};

	ext.toValue = function (value,unit,key){
		
		if (CSS_STR_PROPS[key]) {
			
			value = String(value);
		}	
		let typ = typeof value;
		
		if (typ == 'number') {
			
			if (!(unit)) {
				
				if (CSS_PX_PROPS.test(key)) {
					
					unit = 'px';
				} else if (CSS_DIM_PROPS.test(key)) {
					
					unit = 'u';
				} else if (key == 'rotate') {
					
					unit = 'turn';
				}		}		
			if (unit) {
				
				if (VALID_CSS_UNITS[unit]) {
					
					// what if the unit is already set?
					return value + unit;
				} else if (unit == 'u') {
					
					return value * 4 + 'px';
				} else {
					
					return ("calc(var(--u_" + unit + ",1px) * " + value + ")");
				}		}	} else if (typ == 'string' && key) {
			
			if (CSS_STR_PROPS[key] && value[0] != '"' && value[0] != "'") {
				
				if (value.indexOf('"') >= 0) {
					
					if (value.indexOf("'") == -1) {
						
						value = "'" + value + "'";
					}			} else {
					
					value = '"' + value + '"';
				}		}	}	
		return value;
	};

	ext.toStyleSheet = function (){
		
		return Object.values(map).map(function(_0) { return _0.raw; }).join('\n\n');
		
	};
	ext.parseDimension = function (val){
		
		if (typeof val == 'string') {
			
			let [m,num,unit] = val.match(/^([-+]?[\d\.]+)(%|\w+)$/);
			return [parseFloat(num),unit];
		} else if (typeof val == 'number') {
			
			return [val];
		}};

	imba.inlineStyles = ext.register;
	imba.toStyleValue = ext.toValue;
	imba.getAllStyles = ext.toStyleSheet;

	extend$$9(imba.dom.Element,{
		
		css$(key,value,mods){
			
			return this.style[key] = value;
			
		},
		css$var(name,value,unit,key){
			
			let cssval = ext.toValue(value,unit,key);
			this.style.setProperty(name,cssval);
			return;
		},
	});

	function iter$$2(a){ let v; return a ? ((v=a.toIterable) ? v.call(a) : a) : []; }function extend$$a(target,ext){
		// @ts-ignore
		var descriptors = Object.getOwnPropertyDescriptors(ext);
		// @ts-ignore
		Object.defineProperties(target.prototype,descriptors);
		return target;
	}
	/*

	*/


	const toBind = {
		INPUT: true,
		SELECT: true,
		TEXTAREA: true,
		BUTTON: true
	};

	var isGroup = function(obj) {
		
		return (obj instanceof Array) || (obj && (obj.has instanceof Function));
	};

	var bindHas = function(object,value) {
		
		if (object == value) {
			
			return true;
		} else if (object instanceof Array) {
			
			return object.indexOf(value) >= 0;
		} else if (object && (object.has instanceof Function)) {
			
			return object.has(value);
		} else if (object && (object.contains instanceof Function)) {
			
			return object.contains(value);
		} else {
			
			return false;
		}};

	var bindAdd = function(object,value) {
		
		if (object instanceof Array) {
			
			return object.push(value);
		} else if (object && (object.add instanceof Function)) {
			
			return object.add(value);
		}};

	var bindRemove = function(object,value) {
		
		if (object instanceof Array) {
			
			let idx = object.indexOf(value);
			if (idx >= 0) { return object.splice(idx,1) }	} else if (object && (object.delete instanceof Function)) {
			
			return object.delete(value);
		}};

	function createProxyProperty(target){
		
		function getter(){
			
			return target[0] ? target[0][target[1]] : undefined;
		}	
		function setter(v){
			
			return target[0] ? ((target[0][target[1]] = v)) : null;
		}	
		return {
			get: getter,
			set: setter
		};
	}
	/*
	Data binding
	*/

	extend$$a(imba.dom.Element,{
		
		getRichValue(){
			
			return this.value;
		},
		
		setRichValue(value){
			
			return this.value = value;
		},
		
		bind$(key,value){
			
			let o = value || [];
			
			if (key == 'data' && !(this.$$bound) && toBind[this.nodeName]) {
				
				this.$$bound = true;
				if (this.change$) {
					
					this.addEventListener('change',this.change$ = this.change$.bind(this));
				}			if (this.input$) {
					
					this.addEventListener('input',this.input$ = this.input$.bind(this),{capture: true});
				}			if (this.click$) {
					
					this.addEventListener('click',this.click$ = this.click$.bind(this),{capture: true});
				}			// this.on$('change',{_change$: true},this) if this.change$
				// this.on$('input',{capture: true,_input$: true},this) if this.input$
			}		
			Object.defineProperty(this,key,(o instanceof Array) ? createProxyProperty(o) : o);
			return o;
		},
	});

	Object.defineProperty(imba.dom.Element.prototype,'richValue',{
		get: function() { return this.getRichValue(); },
		set: function(v) { return this.setRichValue(v); }
	});

	extend$$a(imba.dom.HTMLSelectElement,{
		
		
		change$(e){
			
			let model = this.data;
			let prev = this.$$value;
			this.$$value = undefined;
			let values = this.getRichValue();
			
			if (this.multiple) {
				
				if (prev) {
					
					for (let $i = 0, $items = iter$$2(prev), $len = $items.length; $i < $len; $i++) {
						let value = $items[$i];
						if (values.indexOf(value) != -1) { continue; }					bindRemove(model,value);
					}			}			
				for (let $i = 0, $items = iter$$2(values), $len = $items.length; $i < $len; $i++) {
					let value = $items[$i];
					if (!(prev) || prev.indexOf(value) == -1) {
						
						bindAdd(model,value);
					}			}		} else {
				
				this.data = values[0];
			}		imba.commit();
			return this;
		},
		
		getRichValue(){
			var $res;
			
			if (this.$$value) {
				
				return this.$$value;
			}		
			$res = [];
			for (let $i = 0, $items = iter$$2(this.selectedOptions), $len = $items.length; $i < $len; $i++) {
				let o = $items[$i];
				$res.push(o.richValue);
			}		return this.$$value = $res;
		},
		
		syncValue(){
			
			let model = this.data;
			
			if (this.multiple) {
				
				let vals = [];
				for (let i = 0, $items = iter$$2(this.options), $len = $items.length; i < $len; i++) {
					let option = $items[i];
					let val = option.richValue;
					let sel = bindHas(model,val);
					option.selected = sel;
					if (sel) { vals.push(val); }			}			this.$$value = vals;
			} else {
				
				for (let i = 0, $items = iter$$2(this.options), $len = $items.length; i < $len; i++) {
					let option = $items[i];
					let val = option.richValue;
					if (val == model) {
						
						this.$$value = [val];
						this.selectedIndex = i;break;
					}			}		}		return;
		},
		
		end$(){
			
			return this.syncValue();
		},
	});

	extend$$a(imba.dom.HTMLOptionElement,{
		
		setRichValue(value){
			
			this.$$value = value;
			return this.value = value;
		},
		
		getRichValue(){
			
			if (this.$$value !== undefined) {
				
				return this.$$value;
			}		return this.value;
		},
	});

	extend$$a(imba.dom.HTMLTextAreaElement,{
		
		setRichValue(value){
			
			this.$$value = value;
			return this.value = value;
		},
		
		getRichValue(){
			
			if (this.$$value !== undefined) {
				
				return this.$$value;
			}		return this.value;
		},
		
		input$(e){
			
			this.data = this.value;
			return imba.commit();
		},
		
		end$(){
			
			if (this.$$bound && this.value != this.data) {
				
				return this.value = this.data;
			}	},
	});


	extend$$a(imba.dom.HTMLInputElement,{
		
		
		input$(e){
			
			let typ = this.type;
			
			if (typ == 'checkbox' || typ == 'radio') {
				
				return;
			}		
			this.$$value = undefined;
			this.data = this.richValue;
			return imba.commit();
		},
		
		change$(e){
			
			let model = this.data;
			let val = this.richValue;
			
			if (this.type == 'checkbox' || this.type == 'radio') {
				
				let checked = this.checked;
				if (isGroup(model)) {
					
					checked ? bindAdd(model,val) : bindRemove(model,val);
				} else {
					
					this.data = checked ? val : false;
				}		}		return imba.commit();
		},
		
		setRichValue(value){
			
			if (this.$$value !== value) {
				
				this.$$value = value;
				
				if (this.value !== value) {
					
					this.value = value;
				}		}		return;
		},
		
		getRichValue(){
			
			if (this.$$value !== undefined) {
				
				return this.$$value;
			}		
			let value = this.value;
			let typ = this.type;
			
			if (typ == 'range' || typ == 'number') {
				
				value = this.valueAsNumber;
				if (Number.isNaN(value)) { value = null; }		} else if (typ == 'checkbox') {
				
				if (value == undefined || value === 'on') { value = true; }		}		
			return value;
		},
		
		end$(){
			
			if (this.$$bound) {
				
				let typ = this.type;
				if (typ == 'checkbox' || typ == 'radio') {
					
					let val = this.data;
					if (val === true || val === false || val == null) {
						
						this.checked = !(!(val));
					} else {
						
						this.checked = bindHas(val,this.richValue);
					}			} else {
					
					this.richValue = this.data;
				}		}		return;
			
		},
	});
	extend$$a(imba.dom.HTMLButtonElement,{
		
		
		get checked(){
			
			return this.$checked;
			
		},
		set checked(val){
			
			if (val != this.$checked) {
				
				this.$checked = val;
				this.flags.toggle('checked',!(!(val)));
			}	},
		
		setRichValue(value){
			
			this.$$value = value;
			return this.value = value;
		},
		
		getRichValue(){
			
			if (this.$$value !== undefined) {
				
				return this.$$value;
			}		return this.value;
			
		},
		click$(e){
			
			let data = this.data;
			let toggled = this.checked;
			let val = this.richValue;
			// if self.type == 'checkbox' or self.type == 'radio'
			if (isGroup(data)) {
				
				toggled ? bindRemove(data,val) : bindAdd(data,val);
			} else {
				
				this.data = toggled ? null : val;
			}		this.end$();
			return imba.commit();
		},
		
		end$(){
			
			if (this.$$bound) {
				
				let val = this.data;
				if (val === true || val === false || val == null) {
					
					this.checked = !(!(val));
				} else {
					
					this.checked = bindHas(val,this.richValue);
				}		}		return;
		},
	});

	function extend$$b(target,ext){
		// @ts-ignore
		var descriptors = Object.getOwnPropertyDescriptors(ext);
		// @ts-ignore
		Object.defineProperties(target.prototype,descriptors);
		return target;
	}function iter$$3(a){ let v; return a ? ((v=a.toIterable) ? v.call(a) : a) : []; }
	const {Event: Event,Element: Element$4} = imba.dom;

	const keyCodes = {
		esc: [27],
		tab: [9],
		enter: [13],
		space: [32],
		up: [38],
		down: [40],
		left: [37],
		right: [39],
		del: [8,46]
	};

	Event.log$mod = function (...params){
		
		console.log(...params);
		return true;
	};

	// Skip unless matching selector
	Event.sel$mod = function (expr){
		
		return !(!(this.event.target.matches(String(expr))));
		
	};
	Event.if$mod = function (expr){
		
		return !(!(expr));
		
	};
	Event.wait$mod = function (num = 250){
		
		return new Promise(function(_0) { return setTimeout(_0,num); });
	};

	Event.self$mod = function (){
		
		return this.event.target == this.element;
		
	};
	Event.throttle$mod = function (ms = 250){
		var self = this;
		
		if (this.handler.throttled) { return false }	this.handler.throttled = true;
		
		this.element.flags.incr('throttled');
		
		imba.once(this.current,'end',function() {
			
			return setTimeout(function() {
				
				self.element.flags.decr('throttled');
				return self.handler.throttled = false;
			},ms);
		});
		return true;
		
	};
	Event.flag$mod = function (name,sel){
		
		// console.warn 'event flag',self,arguments,id,step
		let el = (sel instanceof imba.dom.Element) ? sel : ((sel ? this.element.closest(sel) : this.element));
		if (!(el)) { return true }	let step = this.step;
		this.state[step] = this.id;
		
		el.flags.incr(name);
		
		let ts = Date.now();
		
		imba.once(this.current,'end',function() {
			
			let elapsed = Date.now() - ts;
			let delay = Math.max(250 - elapsed,0);
			return setTimeout(function() { return el.flags.decr(name); },delay);
		});
		return true;
		
	};
	Event.busy$mod = function (sel){
		
		return Event.flag$mod.call(this,'busy',250,sel);
	};

	Event.mod$mod = function (name){
		
		return Event.flag$mod.call(this,("mod-" + name),imba.document.documentElement);
	};


	// could cache similar event handlers with the same parts
	class EventHandler {
		
		constructor(params,closure){
			
			this.params = params;
			this.closure = closure;
		}
		
		getHandlerForMethod(el,name){
			
			if (!(el)) { return null }		return el[name] ? el : this.getHandlerForMethod(el.parentNode,name);
		}
		
		emit(name,...params){
			return imba.emit(this,name,params);
		}
		on(name,...params){
			return imba.listen(this,name,...params);
		}
		once(name,...params){
			return imba.once(this,name,...params);
		}
		un(name,...params){
			return imba.unlisten(this,name,...params);
		}
		
		async handleEvent(event){
			
			var target = event.target;
			var element = event.currentTarget;
			var mods = this.params;
			let commit = true;// self.params.length == 0
			
			this.count || (this.count = 0);
			this.state || (this.state = {});
			
			let state = {
				element: element,
				event: event,
				modifiers: mods,
				handler: this,
				id: ++this.count,
				step: -1,
				state: this.state,
				current: null
			};
			
			state.current = state;
			
			if (event.handle$mod) {
				
				if (event.handle$mod.apply(state,mods.options || []) == false) {
					
					return;
				}		}		
			let guard = Event[this.type + '$handle'] || Event[event.type + '$handle'] || event.handle$mod;
			
			if (guard && guard.apply(state,mods.options || []) == false) {
				
				return;
			}		
			// let object = state.proxy or event 
			
			this.currentEvents || (this.currentEvents = new Set);
			this.currentEvents.add(event);
			
			for (let $i = 0, $keys = Object.keys(mods), $l = $keys.length, handler, val; $i < $l; $i++){
				handler = $keys[$i];val = mods[handler];
				state.step++;
				
				if (handler[0] == '_') {
					
					continue;
				}			
				if (handler.indexOf('~') > 0) {
					
					handler = handler.split('~')[0];
				}			
				let modargs = null;
				let args = [event,state];
				let res = undefined;
				let context = null;
				let m;
				
				if (handler[0] == '$' && handler[1] == '_' && (val[0] instanceof Function)) {
					
					handler = val[0];
					args = [event,state].concat(val.slice(1));
					context = element;
				} else if (val instanceof Array) {
					
					args = val.slice();
					modargs = args;
					
					for (let i = 0, $items = iter$$3(args), $len = $items.length; i < $len; i++) {
						let par = $items[i];
						
						// what about fully nested arrays and objects?
						// ought to redirect this
						if (typeof par == 'string' && par[0] == '~' && par[1] == '$') {
							
							let name = par.slice(2);
							let chain = name.split('.');
							let value = state[chain.shift()] || event;
							
							for (let i = 0, $ary = iter$$3(chain), $len = $ary.length; i < $len; i++) {
								let part = $ary[i];
								value = value ? value[part] : undefined;
							}						
							args[i] = value;
						}				}			}			
				if (typeof handler == 'string' && (m = handler.match(/^(emit|flag|mod|moved|pin|fit|refit|map|remap)-(.+)$/))) {
					
					if (!(modargs)) { modargs = args = []; }				args.unshift(m[2]);
					handler = m[1];
				}			
				// console.log "handle part",i,handler,event.currentTarget
				// check if it is an array?
				if (handler == 'stop') {
					
					event.stopImmediatePropagation();
				} else if (handler == 'prevent') {
					
					event.preventDefault();
				} else if (handler == 'commit') {
					
					commit = true;
				} else if (handler == 'silence' || handler == 'silent') {
					
					commit = false;
				} else if (handler == 'ctrl') {
					
					if (!(event.ctrlKey)) { break; }			} else if (handler == 'alt') {
					
					if (!(event.altKey)) { break; }			} else if (handler == 'shift') {
					
					if (!(event.shiftKey)) { break; }			} else if (handler == 'meta') {
					
					if (!(event.metaKey)) { break; }			} else if (handler == 'once') {
					
					// clean up bound data as well
					element.removeEventListener(event.type,this);
				} else if (handler == 'options') {
					
					continue;
				} else if (keyCodes[handler]) {
					
					if (keyCodes[handler].indexOf(event.keyCode) < 0) {
						
						break;
					}			} else if (handler == 'emit') {
					
					let name = args[0];
					let detail = args[1];// is custom event if not?
					let e = new CustomEvent(name,{bubbles: true,detail: detail});// : new Event(name)
					e.originalEvent = event;
					let customRes = element.dispatchEvent(e);
				} else if (typeof handler == 'string') {
					
					let fn = (this.type && Event[this.type + '$' + handler + '$mod']);
					fn || (fn = event[handler + '$mod'] || Event[event.type + '$' + handler] || Event[handler + '$mod']);
					
					if (fn instanceof Function) {
						
						handler = fn;
						context = state;
						args = modargs || [];
					} else if (handler[0] == '_') {
						
						handler = handler.slice(1);
						context = this.closure;
					} else {
						
						context = this.getHandlerForMethod(element,handler);
					}			}			
				if (handler instanceof Function) {
					
					res = handler.apply(context || element,args);
				} else if (context) {
					
					res = context[handler].apply(context,args);
				}			
				if (res && (res.then instanceof Function) && res != imba.scheduler.$promise) {
					
					if (commit) { imba.scheduler.commit(); }				// TODO what if await fails?
					res = await res;
				}			
				if (res === false) {
					
					break;
					
				}			
				state.value = res;
			}		
			imba.emit(state,'end',state);
			if (commit) { imba.scheduler.commit(); }		
			this.currentEvents.delete(event);
			if (this.currentEvents.size == 0) {
				
				this.emit('idle');
			}		// what if the result is a promise
			return;
		}
	}

	// Add methods to Element
	extend$$b(Element$4,{
		
		
		emit(name,detail,o = {bubbles: true}){
			
			if (detail != undefined) { o.detail = detail; }		let event = new CustomEvent(name,o);
			let res = this.dispatchEvent(event);
			return event;
		},
		
		on$(type,mods,scope){
			
			let check = 'on$' + type;
			let handler;
			
			// check if a custom handler exists for this type?
			if (this[check] instanceof Function) {
				
				handler = this[check](mods,scope);
			}		
			handler = new EventHandler(mods,scope);
			let capture = mods.capture;
			let passive = mods.passive;
			
			let o = capture;
			
			if (passive) {
				
				o = {passive: passive,capture: capture};
			}		
			if ((/^(pointerdrag|touch)$/).test(type)) {
				
				handler.type = type;
				type = 'pointerdown';
				
			}		this.addEventListener(type,handler,o);
			return handler;
		},
	});

	const assets = {};
	const ext$1 = imba.assets || (imba.assets = {});
	const Node$3 = imba.window.Node;

	ext$1.register = function (name,asset){
		
		assets[name] = asset;
		return this;
	};

	ext$1.create = function (name,parent,flags){
		
		let asset = assets[name];
		
		
		
		if (!(asset.node)) {
			
			let el = imba.document.createElementNS("http://www.w3.org/2000/svg",'svg');
			for (let $o = asset.attributes, $i = 0, $keys = Object.keys($o), $l = $keys.length, k, v; $i < $l; $i++){
				k = $keys[$i];v = $o[k];
				el.setAttribute(k,v);
			}		el.innerHTML = asset.content;
			el.className.baseVal = asset.flags.join(' ');
			asset.node = el;
		}	
		let el = asset.node.cloneNode(true);
		let cls = el.flags$ns = el.className.baseVal + ' ';
		el.className.baseVal = cls + flags;
		if (parent && (parent instanceof Node$3)) {
			
			el.insertInto$(parent);
		}	return el;
	};

	ImbaContext.prototype.registerAsset = ext$1.register;
	ImbaContext.prototype.createAssetElement = ext$1.create;

	function extend$$c(target,ext){
		// @ts-ignore
		var descriptors = Object.getOwnPropertyDescriptors(ext);
		// @ts-ignore
		Object.defineProperties(target.prototype,descriptors);
		return target;
	}
	const {Event: Event$1,PointerEvent: PointerEvent,Element: Element$5} = imba.dom;

	function round(val,step = 1){
		
		let inv = 1.0 / step;
		return Math.round(val * inv) / inv;
		
	}function clamp(val,min,max){
		
		if (min > max) {
			
			return Math.max(max,Math.min(min,val));
		} else {
			
			return Math.min(max,Math.max(min,val));
		}}
	function parseDimension(val){
		
		if (typeof val == 'string') {
			
			let [m,num,unit] = val.match(/^([-+]?[\d\.]+)(%|\w+)$/);
			return [parseFloat(num),unit];
		} else if (typeof val == 'number') {
			
			return [val];
		}}
	function scale(a0,a1,b0r,b1r,s = 0.1){
		
		let [b0,b0u] = parseDimension(b0r);
		let [b1,b1u] = parseDimension(b1r);
		let [sv,su] = parseDimension(s);
		
		if (b0u == '%') { b0 = (a1 - a0) * (b0 / 100); }	if (b1u == '%') { b1 = (a1 - a0) * (b1 / 100); }	
		if (su == '%') { sv = (b1 - b0) * (sv / 100); }	
		return function(value,fit) {
			
			let pct = (value - a0) / (a1 - a0);
			let val = b0 + (b1 - b0) * pct;
			// console.log 'scaling',value,[a0,a1],[b0,b1],s,val
			if (s) { val = round(val,sv); }		if (fit) { val = clamp(val,b0,b1); }		return val;
		};
	}

	extend$$c(PointerEvent,{
		
		
		primary$mod(){
			
			return !(!(this.event.isPrimary));
		},
		
		mouse$mod(){
			
			return this.event.pointerType == 'mouse';
		},
		
		pen$mod(){
			
			return this.event.pointerType == 'pen';
		},
		
		touch$mod(){
			
			return this.event.pointerType == 'touch';
		},
		
		pressure$mod(threshold = 0){
			
			return this.event.pressure > threshold;
		},
		
		lock$mod(dr){
			
			return true;
		},
	});

	class Touch {
		
		constructor(e,handler,el){
			
			this.phase = 'init';
			this.events = [];
			this.event = e;
			this.handler = handler;
			this.target = this.currentTarget = el;
		}
		
		set event(value){
			
			this.x = value.clientX;
			this.y = value.clientY;
			this.events.push(value);
		}
		
		get start(){
			
			return this.events[0];
			
		}
		get event(){
			
			return this.events[this.events.length - 1];
		}
		
		get elapsed(){
			
			return this.event.timeStamp - this.events[0].timeStamp;
		}
		
		get pointerId(){
			return this.event.pointerId;
		}
		get clientX(){
			return this.event.clientX;
		}
		get clientY(){
			return this.event.clientY;
		}
		get offsetX(){
			return this.event.offsetX;
		}
		get offsetY(){
			return this.event.offsetY;
		}
		get type(){
			return this.event.type;
		}
		
		emit(name,...params){
			return imba.emit(this,name,params);
		}
		on(name,...params){
			return imba.listen(this,name,...params);
		}
		once(name,...params){
			return imba.once(this,name,...params);
		}
		un(name,...params){
			return imba.unlisten(this,name,...params);
		}
	}
	Event$1.touch$in$mod = function (){
		
		return Event$1.touch$reframe$mod.apply(this,arguments);
		
	};
	Event$1.touch$fit$mod = function (){
		var $1, $0;
		
		let o = (($1 = this.state)[($0 = this.step)] || ($1[$0] = {clamp: true}));
		return Event$1.touch$reframe$mod.apply(this,arguments);
	};

	Event$1.touch$snap$mod = function (sx = 1,sy = sx){
		
		this.event.x = round(this.event.x,sx);
		this.event.y = round(this.event.y,sy);
		return true;
		
	};
	Event$1.touch$moved$mod = function (a,b){
		var self = this, $1, $0;
		
		let o = ($1 = this.state)[($0 = this.step)] || ($1[$0] = {});
		if (!(o.setup)) {
			
			let th = a || 4;
			if (typeof a == 'string' && a.match(/^(up|down|left|right|x|y)$/)) {
				
				o.dir = a;
				th = b || 4;
			}		
			o.setup = true;
			let [tv,tu] = parseDimension(th);
			o.threshold = tv;
			o.sy = tv;
			o.x0 = this.event.x;
			o.y0 = this.event.y;
			if ((tu && tu != 'px')) {
				
				console.warn('only px threshold allowed in @touch.moved');
			}	}	
		if (o.active) {
			
			return true;
		}	
		let th = o.threshold;
		let dx = this.event.x - o.x0;
		let dy = this.event.y - o.y0;
		let hit = false;
		
		if (dx > th && (o.dir == 'right' || o.dir == 'x')) {
			
			hit = true;
			
		}	if (!(hit) && dx < -th && (o.dir == 'left' || o.dir == 'x')) {
			
			hit = true;
			
		}	if (!(hit) && dy > th && (o.dir == 'down' || o.dir == 'y')) {
			
			hit = true;
		}	
		if (!(hit) && dy < -th && (o.dir == 'up' || o.dir == 'y')) {
			
			hit = true;
			
		}	if (!(hit)) {
			
			let dr = Math.sqrt(dx * dx + dy * dy);
			if (dr > th && !(o.dir)) {
				
				hit = true;
			}	}	
		if (hit) {
			
			o.active = true;
			let pinned = this.state.pinTarget;
			this.element.flags.incr('_move_');
			if (pinned) { pinned.flags.incr('_move_'); }		imba.once(this.current,'end',function() {
				
				if (pinned) { pinned.flags.decr('_move_'); }			return self.element.flags.decr('_move_');
			});
		}	
		return !(!(o.active));
		
	};
	Event$1.touch$reframe$mod = function (...params){
		var $1, $0;
		
		let o = (($1 = this.state)[($0 = this.step)] || ($1[$0] = {}));
		
		if (!(o.rect)) {
			
			let el = this.element;
			let len = params.length;
			let box = params[0];
			let min = 0;
			let max = '100%';
			let snap = 1;
			let typ = typeof box;
			
			if (typ == 'number' || (typ == 'string' && (/^([-+]?\d[\d\.]*)(%|\w+)$/).test(box)) || (box instanceof Array)) {
				
				box = null;
			} else if (typ == 'string') {
				
				if (box == 'this' || box == '') {
					
					box = this.element;
				} else if (box == 'up') {
					
					box = this.element.parentNode;
				} else if (box == 'op') {
					
					box = this.element.offsetParent;
				} else {
					
					box = el.closest(box) || el.querySelector(box);
				}		}		
			if (box == null) {
				
				len++;
				params.unshift(box = el);
			}		
			if (len == 2) {
				
				snap = params[1];
			} else if (len > 2) {
				
				[min,max,snap = 1] = params.slice(1);
			}		
			let rect = box.getBoundingClientRect();
			if (!((min instanceof Array))) { min = [min,min]; }		if (!((max instanceof Array))) { max = [max,max]; }		if (!((snap instanceof Array))) { snap = [snap,snap]; }		
			o.rect = rect;
			o.x = scale(rect.left,rect.right,min[0],max[0],snap[0]);
			o.y = scale(rect.top,rect.bottom,min[1],max[1],snap[1]);
			
			this.state.scaleX = o.x;
			this.state.scaleY = o.y;
			this.event.x0 = this.event.x = o.x(this.event.x,o.clamp);
			this.event.y0 = this.event.y = o.y(this.event.y,o.clamp);
		} else {
			
			let x = this.event.x = o.x(this.event.x,o.clamp);
			let y = this.event.y = o.y(this.event.y,o.clamp);
			this.event.dx = x - this.event.x0;
			this.event.dy = y - this.event.y0;
		}	
		return true;
		
	};
	Event$1.touch$pin$mod = function (...params){
		
		let o = this.state[this.step];
		
		if (!(o)) {
			
			let box = params[0];
			if (typeof box == 'string') {
				
				box = this.element.closest(box) || this.element.querySelector(box);
			}		if (!((box instanceof Element$5))) {
				
				params.unshift(box = this.state.target);
			}		
			let ax = params[1] || 0;
			let ay = (params[2] == null) ? (params[2] = ax) : params[2];
			let rect = box.getBoundingClientRect();
			
			o = this.state[this.step] = {
				x: this.state.clientX - (rect.left + rect.width * ax),
				y: this.state.clientY - (rect.top + rect.height * ay)
			};
			
			if (box) {
				
				this.state.pinTarget = box;
				box.flags.incr('_touch_');
				this.state.once('end',function() { return box.flags.decr('_touch_'); });
			}	}	
		this.event.x -= o.x;
		this.event.y -= o.y;
		return true;
	};

	Event$1.touch$lock$mod = function (...params){
		
		let o = this.state[this.step];
		
		if (!(o)) {
			
			o = this.state[this.step] = this.state.target.style;
			let prev = o.touchAction;
			o.touchAction = 'none';
			this.state.once('end',function() { return o.removeProperty('touch-action'); });
		}	return true;
		
	};
	Event$1.touch$sync$mod = function (item,xalias = 'x',yalias = 'y'){
		
		let o = this.state[this.step];
		// how does clamping come into the picture?
		if (!(o)) {
			
			o = this.state[this.step] = {
				x: item[xalias] || 0,
				y: item[yalias] || 0,
				tx: this.state.x,
				ty: this.state.y
			};
		}	
		if (xalias) { item[xalias] = o.x + (this.state.x - o.tx); }	if (yalias) { item[yalias] = o.y + (this.state.y - o.ty); }	return true;
		
	};
	Event$1.touch$handle = function (){
		var self = this;
		
		let e = this.event;
		let el = this.element;
		let id = this.state.pointerId;
		this.current = this.state;
		if (id != undefined) { return id == e.pointerId }	
		let t = this.state = this.handler.state = this.current = new Touch(e,this.handler,el);
		
		let canceller = function(e) {
			
			e.preventDefault();
			return false;
			
		};
		let listener = function(e) {
			
			let typ = e.type;
			t.event = e;
			
			try {
				self.handler.handleEvent(t);
			} catch (e) { }		
			if (typ == 'pointerup' || typ == 'pointercancel') {
				
				return el.releasePointerCapture(e.pointerId);
			}	};
		
		let teardown = function(e) {
			
			el.flags.decr('_touch_');
			t.emit('end');
			self.handler.state = {};
			el.removeEventListener('pointermove',listener);
			el.removeEventListener('pointerup',listener);
			el.removeEventListener('pointercancel',listener);
			return imba.document.removeEventListener('selectstart',canceller);
		};
		
		el.flags.incr('_touch_');
		el.setPointerCapture(e.pointerId);
		el.addEventListener('pointermove',listener);
		el.addEventListener('pointerup',listener);
		el.addEventListener('pointercancel',listener);
		el.addEventListener('lostpointercapture',teardown,{once: true});
		imba.document.addEventListener('selectstart',canceller,{capture: true});
		
		listener(e);
		// handler.once('idle') do console.warn 'is idle!'
		return false;
	};

	function iter$$4(a){ let v; return a ? ((v=a.toIterable) ? v.call(a) : a) : []; }
	// import {CustomEvent,Event,Element} from '../dom'

	const observers = new (globalThis.WeakMap || Map);
	const defaults = {threshold: [0]};
	const rootTarget = {};

	const {Event: Event$2,CustomEvent: CustomEvent$1,Element: Element$6} = imba.dom;

	// const CustomEvent = imba.dom.CustomEvent
	// const Element = imba.dom.Element


	Event$2.intersect$handle = function (){
		
		let obs = this.event.detail.observer;
		return this.modifiers._observer == obs;
	};

	Event$2.intersect$in = function (){
		
		return this.event.delta >= 0 && this.event.entry.isIntersecting;
	};

	Event$2.intersect$out = function (){
		
		return this.event.delta < 0;
	};

	function callback(name,key){
		
		return function(entries,observer) {
			
			let map = observer.prevRatios || (observer.prevRatios = new WeakMap);
			
			for (let $i = 0, $items = iter$$4(entries), $len = $items.length; $i < $len; $i++) {
				let entry = $items[$i];
				let prev = map.get(entry.target) || 0;
				let ratio = entry.intersectionRatio;
				let detail = {entry: entry,ratio: ratio,from: prev,delta: (ratio - prev),observer: observer};
				let e = new CustomEvent$1(name,{bubbles: false,detail: detail});
				e.entry = entry;
				e.isIntersecting = entry.isIntersecting;
				e.delta = detail.delta;
				e.ratio = detail.ratio;
				map.set(entry.target,ratio);
				entry.target.dispatchEvent(e);
			}		return;
		};
	}
	function getIntersectionObserver(opts = defaults){
		
		let key = opts.threshold.join('-') + opts.rootMargin;
		let target = opts.root || rootTarget;
		let map = observers.get(target);
		map || observers.set(target,map = {});
		return map[key] || (map[key] = new IntersectionObserver(callback('intersect'),opts));
	}
	Element$6.prototype.on$intersect = function(mods,context) {
		
		let obs;
		if (mods.options) {
			
			let th = [];
			let opts = {threshold: th};
			
			for (let $i = 0, $items = iter$$4(mods.options), $len = $items.length; $i < $len; $i++) {
				let arg = $items[$i];
				if (arg instanceof Element$6) {
					
					opts.root = arg;
				} else if (typeof arg == 'number') {
					
					th.push(arg);
					
				}		}		if (th.length == 1) {
				
				let num = th[0];
				if (num > 1) {
					
					th[0] = 0;
					while (th.length < num){
						
						th.push(th.length / (num - 1));
					}			}		}		
			if (th.length == 0) { th.push(0); }		obs = getIntersectionObserver(opts);
		} else {
			
			obs = getIntersectionObserver();
		}	
		mods._observer = obs;
		return obs.observe(this);
	};

	function extend$$d(target,ext){
		// @ts-ignore
		var descriptors = Object.getOwnPropertyDescriptors(ext);
		// @ts-ignore
		Object.defineProperties(target.prototype,descriptors);
		return target;
	}function iter$$5(a){ let v; return a ? ((v=a.toIterable) ? v.call(a) : a) : []; }

	const {Event: Event$3,CustomEvent: CustomEvent$2,Element: Element$7} = imba.dom;

	var resizeObserver = null;

	function getResizeObserver(){
		
		if (!(globalThis.ResizeObserver)) {
			
			if (!(resizeObserver)) {
				
				console.warn(':resize not supported in this browser');
				resizeObserver = {observe: function() { return true; }};
			}	}	return resizeObserver || (resizeObserver = new ResizeObserver(function(entries) {
			
			for (let $i = 0, $items = iter$$5(entries), $len = $items.length; $i < $len; $i++) {
				let entry = $items[$i];
				let e = new CustomEvent$2('resize',{bubbles: false,detail: entry});
				e.entry = entry;
				e.rect = entry.contentRect;
				e.width = entry.target.offsetWidth;
				e.height = entry.target.offsetHeight;
				entry.target.dispatchEvent(e);
			}		return;
		}));
	}
	extend$$d(Element$7,{
		
		
		on$resize(chain,context){
			
			return getResizeObserver().observe(this);
		},
	});

	const {Event: Event$4,CustomEvent: CustomEvent$3,Element: Element$8} = imba.dom;

	var selHandler;
	var handledSym = Symbol();

	function activateSelectionHandler(){
		
		if (!(selHandler)) {
			
			selHandler = function(e) {
				
				if (e[handledSym]) { return }			e[handledSym] = true;
				
				let target = imba.document.activeElement;
				if (target && target.matches('input,textarea')) {
					
					let custom = new CustomEvent$3('selection',{
						detail: {
							start: target.selectionStart,
							end: target.selectionEnd
						}
					});
					return target.dispatchEvent(custom);
				}		};
			return imba.document.addEventListener('selectionchange',selHandler);
		}}
	Element$8.prototype.on$selection = function(mods,context) {
		
		return activateSelectionHandler();
	};

}());
