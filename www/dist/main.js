/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(7);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

/*
Imba is the namespace for all runtime related utilities
@namespace
*/

var Imba = {VERSION: '1.3.0-beta.11'};

/*

Light wrapper around native setTimeout that expects the block / function
as last argument (instead of first). It also triggers an event to Imba
after the timeout to let schedulers update (to rerender etc) afterwards.

*/

Imba.setTimeout = function (delay,block){
	return setTimeout(function() {
		block();
		return Imba.commit();
	},delay);
};

/*

Light wrapper around native setInterval that expects the block / function
as last argument (instead of first). It also triggers an event to Imba
after every interval to let schedulers update (to rerender etc) afterwards.

*/

Imba.setInterval = function (interval,block){
	return setInterval(block,interval);
};

/*
Clear interval with specified id
*/

Imba.clearInterval = function (id){
	return clearInterval(id);
};

/*
Clear timeout with specified id
*/

Imba.clearTimeout = function (id){
	return clearTimeout(id);
};


Imba.subclass = function (obj,sup){
	for (let k in sup){
		let v;
		v = sup[k];if (sup.hasOwnProperty(k)) { obj[k] = v };
	};
	
	obj.prototype = Object.create(sup.prototype);
	obj.__super__ = obj.prototype.__super__ = sup.prototype;
	obj.prototype.initialize = obj.prototype.constructor = obj;
	return obj;
};

/*
Lightweight method for making an object iterable in imbas for/in loops.
If the compiler cannot say for certain that a target in a for loop is an
array, it will cache the iterable version before looping.

```imba
# this is the whole method
def Imba.iterable o
	return o ? (o:toArray ? o.toArray : o) : []

class CustomIterable
	def toArray
		[1,2,3]

# will return [2,4,6]
for x in CustomIterable.new
	x * 2

```
*/

Imba.iterable = function (o){
	return o ? ((o.toArray ? o.toArray() : o)) : [];
};

/*
Coerces a value into a promise. If value is array it will
call `Promise.all(value)`, or if it is not a promise it will
wrap the value in `Promise.resolve(value)`. Used for experimental
await syntax.
@return {Promise}
*/

Imba.await = function (value){
	if (value instanceof Array) {
		console.warn("await (Array) is deprecated - use await Promise.all(Array)");
		return Promise.all(value);
	} else if (value && value.then) {
		return value;
	} else {
		return Promise.resolve(value);
	};
};

var dashRegex = /-./g;
var setterCache = {};

Imba.toCamelCase = function (str){
	if (str.indexOf('-') >= 0) {
		return str.replace(dashRegex,function(m) { return m.charAt(1).toUpperCase(); });
	} else {
		return str;
	};
};

Imba.toSetter = function (str){
	return setterCache[str] || (setterCache[str] = Imba.toCamelCase('set-' + str));
};

Imba.indexOf = function (a,b){
	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
};

Imba.len = function (a){
	return a && ((a.len instanceof Function) ? a.len.call(a) : a.length) || 0;
};

Imba.prop = function (scope,name,opts){
	if (scope.defineProperty) {
		return scope.defineProperty(name,opts);
	};
	return;
};

Imba.attr = function (scope,name,opts){
	if(opts === undefined) opts = {};
	if (scope.defineAttribute) {
		return scope.defineAttribute(name,opts);
	};
	
	let getName = Imba.toCamelCase(name);
	let setName = Imba.toCamelCase('set-' + name);
	let proto = scope.prototype;
	
	if (opts.dom) {
		proto[getName] = function() { return this.dom()[name]; };
		proto[setName] = function(value) {
			if (value != this[name]()) {
				this.dom()[name] = value;
			};
			return this;
		};
	} else {
		proto[getName] = function() { return this.getAttribute(name); };
		proto[setName] = function(value) {
			this.setAttribute(name,value);
			return this;
		};
	};
	return;
};

Imba.propDidSet = function (object,property,val,prev){
	let fn = property.watch;
	if (fn instanceof Function) {
		fn.call(object,val,prev,property);
	} else if ((typeof fn=='string'||fn instanceof String) && object[fn]) {
		object[fn](val,prev,property);
	};
	return;
};


// Basic events
function emit__(event,args,node){
	// var node = cbs[event]
	var prev,cb,ret;
	
	while ((prev = node) && (node = node.next)){
		if (cb = node.listener) {
			if (node.path && cb[node.path]) {
				ret = args ? cb[node.path].apply(cb,args) : cb[node.path]();
			} else {
				// check if it is a method?
				ret = args ? cb.apply(node,args) : cb.call(node);
			};
		};
		
		if (node.times && --node.times <= 0) {
			prev.next = node.next;
			node.listener = null;
		};
	};
	return;
};

// method for registering a listener on object
Imba.listen = function (obj,event,listener,path){
	var cbs,list,tail;
	cbs = obj.__listeners__ || (obj.__listeners__ = {});
	list = cbs[event] || (cbs[event] = {});
	tail = list.tail || (list.tail = (list.next = {}));
	tail.listener = listener;
	tail.path = path;
	list.tail = tail.next = {};
	return tail;
};

// register a listener once
Imba.once = function (obj,event,listener){
	var tail = Imba.listen(obj,event,listener);
	tail.times = 1;
	return tail;
};

// remove a listener
Imba.unlisten = function (obj,event,cb,meth){
	var node,prev;
	var meta = obj.__listeners__;
	if (!(meta)) { return };
	
	if (node = meta[event]) {
		while ((prev = node) && (node = node.next)){
			if (node == cb || node.listener == cb) {
				prev.next = node.next;
				// check for correct path as well?
				node.listener = null;
				break;
			};
		};
	};
	return;
};

// emit event
Imba.emit = function (obj,event,params){
	var cb;
	if (cb = obj.__listeners__) {
		if (cb[event]) { emit__(event,params,cb[event]) };
		if (cb.all) { emit__(event,[event,params],cb.all) }; // and event != 'all'
	};
	return;
};

Imba.observeProperty = function (observer,key,trigger,target,prev){
	if (prev && typeof prev == 'object') {
		Imba.unlisten(prev,'all',observer,trigger);
	};
	if (target && typeof target == 'object') {
		Imba.listen(target,'all',observer,trigger);
	};
	return this;
};

module.exports = Imba;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
var Page = Imba.defineTag('Page')
exports.Page = Page;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1);

Imba.Pointer = function Pointer(){
	this._button = -1;
	this._event = {x: 0,y: 0,type: 'uninitialized'};
	return this;
};

Imba.Pointer.prototype.button = function (){
	return this._button;
};

Imba.Pointer.prototype.touch = function (){
	return this._touch;
};

Imba.Pointer.prototype.update = function (e){
	this._event = e;
	this._dirty = true;
	return this;
};

// this is just for regular mouse now
Imba.Pointer.prototype.process = function (){
	var e1 = this._event;
	
	if (this._dirty) {
		this._prevEvent = e1;
		this._dirty = false;
		
		// button should only change on mousedown etc
		if (e1.type == 'mousedown') {
			this._button = e1.button;
			
			if ((this._touch && this._button != 0)) {
				return;
			};
			
			// cancel the previous touch
			if (this._touch) { this._touch.cancel() };
			this._touch = new Imba.Touch(e1,this);
			this._touch.mousedown(e1,e1);
		} else if (e1.type == 'mousemove') {
			if (this._touch) { this._touch.mousemove(e1,e1) };
		} else if (e1.type == 'mouseup') {
			this._button = -1;
			
			if (this._touch && this._touch.button() == e1.button) {
				this._touch.mouseup(e1,e1);
				this._touch = null;
			};
			// trigger pointerup
		};
	} else if (this._touch) {
		this._touch.idle();
	};
	return this;
};

Imba.Pointer.prototype.x = function (){
	return this._event.x;
};
Imba.Pointer.prototype.y = function (){
	return this._event.y;
};


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
// externs;

var Snippet = Imba.defineTag('Snippet', function(tag){
	tag.prototype.src = function(v){ return this._src; }
	tag.prototype.setSrc = function(v){ this._src = v; return this; };
	tag.prototype.heading = function(v){ return this._heading; }
	tag.prototype.setHeading = function(v){ this._heading = v; return this; };
	tag.prototype.hl = function(v){ return this._hl; }
	tag.prototype.setHl = function(v){ this._hl = v; return this; };
	
	tag.replace = function (dom){
		let imba = dom.firstChild;
		let js = imba.nextSibling;
		let highlighted = imba.innerHTML;
		let raw = dom.textContent;
		let data = {
			code: raw,
			html: highlighted,
			js: {
				code: js.textContent,
				html: js.innerHTML
			}
		};
		
		let snippet = (_1(Snippet)).setData(data).end();
		dom.parentNode.replaceChild(snippet.dom(),dom);
		return snippet;
	};
	
	tag.prototype.setup = function (){
		this.render();
		this._code.dom().innerHTML = this.data().html;
		this.run();
		return this;
	};
	
	tag.prototype.run = function (){
		var self = this;
		var orig = Imba.mount;
		
		// var js = 'var require = function(){ return Imba };\n' + data:js:code
		var js = self.data().js.code;
		console.log(Imba);
		js = js.replace("require('imba')",'window.Imba');
		try {
			Imba.mount = function(item) { return orig.call(Imba,item,self._result.dom()); };
			console.log("run code",js);
			eval(js);
		} catch (e) { };
		
		Imba.mount = orig;
		return self;
	};
	
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).flag('snippet').setChildren($.$ = $.$ || [
			this._code = this._code||_1('code',this).flag('code'),
			this._result = this._result||_1('div',this).flag('result').flag('styled-example')
		],2).synced();
	};
})
exports.Snippet = Snippet;

var Example = Imba.defineTag('Example', Snippet, function(tag){
	
	tag.prototype.render = function (){
		return this.$open(0).setText("Example").synced();
	};
})
exports.Example = Example;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(6);
module.exports = __webpack_require__(27);


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;

var App = __webpack_require__(17).App;
var Site = __webpack_require__(19).Site;
document.body.innerHTML = '';
Imba.mount((_1(Site)).setData(APP = App.deserialize(APPCACHE)).end());


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1);
var activate = false;
if (typeof window !== 'undefined') {
	if (window.Imba) {
		console.warn(("Imba v" + (window.Imba.VERSION) + " is already loaded."));
		Imba = window.Imba;
	} else {
		window.Imba = Imba;
		activate = true;
		if (window.define && window.define.amd) {
			window.define("imba",[],function() { return Imba; });
		};
	};
};

module.exports = Imba;

if (true) {
	__webpack_require__(8);
	__webpack_require__(9);
};

if (true && activate) {
	Imba.EventManager.activate();
};

if (false) {};


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

var requestAnimationFrame; // very simple raf polyfill
var cancelAnimationFrame;

if (false) {};

if (true) {
	cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitRequestAnimationFrame;
	requestAnimationFrame = window.requestAnimationFrame;
	requestAnimationFrame || (requestAnimationFrame = window.webkitRequestAnimationFrame);
	requestAnimationFrame || (requestAnimationFrame = window.mozRequestAnimationFrame);
	requestAnimationFrame || (requestAnimationFrame = function(blk) { return setTimeout(blk,1000 / 60); });
};

function Ticker(){
	var self = this;
	self._queue = [];
	self._stage = -1;
	self._scheduled = false;
	self._ticker = function(e) {
		self._scheduled = false;
		return self.tick(e);
	};
	self;
};

Ticker.prototype.stage = function(v){ return this._stage; }
Ticker.prototype.setStage = function(v){ this._stage = v; return this; };
Ticker.prototype.queue = function(v){ return this._queue; }
Ticker.prototype.setQueue = function(v){ this._queue = v; return this; };

Ticker.prototype.add = function (item,force){
	if (force || this._queue.indexOf(item) == -1) {
		this._queue.push(item);
	};
	
	if (!this._scheduled) { return this.schedule() };
};

Ticker.prototype.tick = function (timestamp){
	var items = this._queue;
	if (!this._ts) { this._ts = timestamp };
	this._dt = timestamp - this._ts;
	this._ts = timestamp;
	this._queue = [];
	this._stage = 1;
	this.before();
	if (items.length) {
		for (let i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
			item = ary[i];
			if (item instanceof Function) {
				item(this._dt,this);
			} else if (item.tick) {
				item.tick(this._dt,this);
			};
		};
	};
	this._stage = 2;
	this.after();
	this._stage = this._scheduled ? 0 : (-1);
	return this;
};

Ticker.prototype.schedule = function (){
	if (!this._scheduled) {
		this._scheduled = true;
		if (this._stage == -1) {
			this._stage = 0;
		};
		requestAnimationFrame(this._ticker);
	};
	return this;
};

Ticker.prototype.before = function (){
	return this;
};

Ticker.prototype.after = function (){
	if (Imba.TagManager) {
		Imba.TagManager.refresh();
	};
	return this;
};

Imba.TICKER = new Ticker();
Imba.SCHEDULERS = [];

Imba.ticker = function (){
	return Imba.TICKER;
};

Imba.requestAnimationFrame = function (callback){
	return requestAnimationFrame(callback);
};

Imba.cancelAnimationFrame = function (id){
	return cancelAnimationFrame(id);
};

// should add an Imba.run / setImmediate that
// pushes listener onto the tick-queue with times - once

var commitQueue = 0;

Imba.commit = function (params){
	commitQueue++;
	// Imba.TagManager.refresh
	Imba.emit(Imba,'commit',(params != undefined) ? [params] : undefined);
	if (--commitQueue == 0) {
		Imba.TagManager && Imba.TagManager.refresh();
	};
	return;
};

/*

Instances of Imba.Scheduler manages when to call `tick()` on their target,
at a specified framerate or when certain events occur. Root-nodes in your
applications will usually have a scheduler to make sure they rerender when
something changes. It is also possible to make inner components use their
own schedulers to control when they render.

@iname scheduler

*/

Imba.Scheduler = function Scheduler(target){
	var self = this;
	self._id = counter++;
	self._target = target;
	self._marked = false;
	self._active = false;
	self._marker = function() { return self.mark(); };
	self._ticker = function(e) { return self.tick(e); };
	
	self._dt = 0;
	self._frame = {};
	self._scheduled = false;
	self._timestamp = 0;
	self._ticks = 0;
	self._flushes = 0;
	
	self.onevent = self.onevent.bind(self);
	self;
};

var counter = 0;

Imba.Scheduler.event = function (e){
	return Imba.emit(Imba,'event',e);
};

/*
	Create a new Imba.Scheduler for specified target
	@return {Imba.Scheduler}
	*/

Imba.Scheduler.prototype.__raf = {watch: 'rafDidSet',name: 'raf'};
Imba.Scheduler.prototype.raf = function(v){ return this._raf; }
Imba.Scheduler.prototype.setRaf = function(v){
	var a = this.raf();
	if(v != a) { this._raf = v; }
	if(v != a) { this.rafDidSet && this.rafDidSet(v,a,this.__raf) }
	return this;
};
Imba.Scheduler.prototype.__interval = {watch: 'intervalDidSet',name: 'interval'};
Imba.Scheduler.prototype.interval = function(v){ return this._interval; }
Imba.Scheduler.prototype.setInterval = function(v){
	var a = this.interval();
	if(v != a) { this._interval = v; }
	if(v != a) { this.intervalDidSet && this.intervalDidSet(v,a,this.__interval) }
	return this;
};
Imba.Scheduler.prototype.__events = {watch: 'eventsDidSet',name: 'events'};
Imba.Scheduler.prototype.events = function(v){ return this._events; }
Imba.Scheduler.prototype.setEvents = function(v){
	var a = this.events();
	if(v != a) { this._events = v; }
	if(v != a) { this.eventsDidSet && this.eventsDidSet(v,a,this.__events) }
	return this;
};
Imba.Scheduler.prototype.marked = function(v){ return this._marked; }
Imba.Scheduler.prototype.setMarked = function(v){ this._marked = v; return this; };

Imba.Scheduler.prototype.rafDidSet = function (bool){
	if (bool && this._active) this.requestTick();
	return this;
};

Imba.Scheduler.prototype.intervalDidSet = function (time){
	clearInterval(this._intervalId);
	this._intervalId = null;
	if (time && this._active) {
		this._intervalId = setInterval(this.oninterval.bind(this),time);
	};
	return this;
};

Imba.Scheduler.prototype.eventsDidSet = function (new$,prev){
	if (this._active && new$ && !(prev)) {
		return Imba.listen(Imba,'commit',this,'onevent');
	} else if (!(new$) && prev) {
		return Imba.unlisten(Imba,'commit',this,'onevent');
	};
};

/*
	Check whether the current scheduler is active or not
	@return {bool}
	*/

Imba.Scheduler.prototype.active = function (){
	return this._active;
};

/*
	Delta time between the two last ticks
	@return {Number}
	*/

Imba.Scheduler.prototype.dt = function (){
	return this._dt;
};

/*
	Configure the scheduler
	@return {self}
	*/

Imba.Scheduler.prototype.configure = function (options){
	var v_;
	if(options === undefined) options = {};
	if (options.raf != undefined) { (this.setRaf(v_ = options.raf),v_) };
	if (options.interval != undefined) { (this.setInterval(v_ = options.interval),v_) };
	if (options.events != undefined) { (this.setEvents(v_ = options.events),v_) };
	return this;
};

/*
	Mark the scheduler as dirty. This will make sure that
	the scheduler calls `target.tick` on the next frame
	@return {self}
	*/

Imba.Scheduler.prototype.mark = function (){
	this._marked = true;
	if (!this._scheduled) {
		this.requestTick();
	};
	return this;
};

/*
	Instantly trigger target.tick and mark scheduler as clean (not dirty/marked).
	This is called implicitly from tick, but can also be called manually if you
	really want to force a tick without waiting for the next frame.
	@return {self}
	*/

Imba.Scheduler.prototype.flush = function (){
	this._flushes++;
	this._target.tick(this);
	this._marked = false;
	return this;
};

/*
	@fixme this expects raf to run at 60 fps 

	Called automatically on every frame while the scheduler is active.
	It will only call `target.tick` if the scheduler is marked dirty,
	or when according to @fps setting.

	If you have set up a scheduler with an fps of 1, tick will still be
	called every frame, but `target.tick` will only be called once every
	second, and it will *make sure* each `target.tick` happens in separate
	seconds according to Date. So if you have a node that renders a clock
	based on Date.now (or something similar), you can schedule it with 1fps,
	never needing to worry about two ticks happening within the same second.
	The same goes for 4fps, 10fps etc.

	@protected
	@return {self}
	*/

Imba.Scheduler.prototype.tick = function (delta,ticker){
	this._ticks++;
	this._dt = delta;
	
	if (ticker) {
		this._scheduled = false;
	};
	
	this.flush();
	
	if (this._raf && this._active) {
		this.requestTick();
	};
	return this;
};

Imba.Scheduler.prototype.requestTick = function (){
	if (!this._scheduled) {
		this._scheduled = true;
		Imba.TICKER.add(this);
	};
	return this;
};

/*
	Start the scheduler if it is not already active.
	**While active**, the scheduler will override `target.commit`
	to do nothing. By default Imba.tag#commit calls render, so
	that rendering is cascaded through to children when rendering
	a node. When a scheduler is active (for a node), Imba disables
	this automatic rendering.
	*/

Imba.Scheduler.prototype.activate = function (immediate){
	if(immediate === undefined) immediate = true;
	if (!this._active) {
		this._active = true;
		this._commit = this._target.commit;
		this._target.commit = function() { return this; };
		this._target && this._target.flag  &&  this._target.flag('scheduled_');
		Imba.SCHEDULERS.push(this);
		
		if (this._events) {
			Imba.listen(Imba,'commit',this,'onevent');
		};
		
		if (this._interval && !this._intervalId) {
			this._intervalId = setInterval(this.oninterval.bind(this),this._interval);
		};
		
		if (immediate) {
			this.tick(0);
		} else if (this._raf) {
			this.requestTick();
		};
	};
	return this;
};

/*
	Stop the scheduler if it is active.
	*/

Imba.Scheduler.prototype.deactivate = function (){
	if (this._active) {
		this._active = false;
		this._target.commit = this._commit;
		let idx = Imba.SCHEDULERS.indexOf(this);
		if (idx >= 0) {
			Imba.SCHEDULERS.splice(idx,1);
		};
		
		if (this._events) {
			Imba.unlisten(Imba,'commit',this,'onevent');
		};
		
		if (this._intervalId) {
			clearInterval(this._intervalId);
			this._intervalId = null;
		};
		
		this._target && this._target.unflag  &&  this._target.unflag('scheduled_');
	};
	return this;
};

Imba.Scheduler.prototype.track = function (){
	return this._marker;
};

Imba.Scheduler.prototype.oninterval = function (){
	this.tick();
	Imba.TagManager.refresh();
	return this;
};

Imba.Scheduler.prototype.onevent = function (event){
	if (!this._events || this._marked) { return this };
	
	if (this._events instanceof Function) {
		if (this._events(event,this)) this.mark();
	} else if (this._events instanceof Array) {
		if (this._events.indexOf((event && event.type) || event) >= 0) {
			this.mark();
		};
	} else {
		this.mark();
	};
	return this;
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1);

__webpack_require__(10);

Imba.TagManager = new Imba.TagManagerClass();

__webpack_require__(11);
__webpack_require__(12);
__webpack_require__(3);
__webpack_require__(13);
__webpack_require__(14);
__webpack_require__(15);

if (true) {
	__webpack_require__(16);
};

if (false) {};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

Imba.TagManagerClass = function TagManagerClass(){
	this._inserts = 0;
	this._removes = 0;
	this._mounted = [];
	this._hasMountables = false;
	this;
};

Imba.TagManagerClass.prototype.mounted = function (){
	return this._mounted;
};

Imba.TagManagerClass.prototype.insert = function (node,parent){
	return this._inserts++;
};

Imba.TagManagerClass.prototype.remove = function (node,parent){
	return this._removes++;
};

Imba.TagManagerClass.prototype.changes = function (){
	return this._inserts + this._removes;
};

Imba.TagManagerClass.prototype.mount = function (node){
	if (false) {};
	return this._hasMountables = true;
};

Imba.TagManagerClass.prototype.refresh = function (force){
	if(force === undefined) force = false;
	if (false) {};
	if (!(force) && this.changes() == 0) { return };
	// console.time('resolveMounts')
	if ((this._inserts && this._hasMountables) || force) {
		this.tryMount();
	};
	
	if ((this._removes || force) && this._mounted.length) {
		this.tryUnmount();
	};
	// console.timeEnd('resolveMounts')
	this._inserts = 0;
	this._removes = 0;
	return this;
};

Imba.TagManagerClass.prototype.unmount = function (node){
	return this;
};

Imba.TagManagerClass.prototype.tryMount = function (){
	var count = 0;
	var root = document.body;
	var items = root.querySelectorAll('.__mount');
	// what if we end up creating additional mountables by mounting?
	for (let i = 0, ary = iter$(items), len = ary.length, el; i < len; i++) {
		el = ary[i];
		if (el && el._tag) {
			if (this._mounted.indexOf(el._tag) == -1) {
				this.mountNode(el._tag);
			};
		};
	};
	return this;
};

Imba.TagManagerClass.prototype.mountNode = function (node){
	this._mounted.push(node);
	node.FLAGS |= Imba.TAG_MOUNTED;
	if (node.mount) { node.mount() };
	return;
};

Imba.TagManagerClass.prototype.tryUnmount = function (){
	var count = 0;
	var root = document.body;
	for (let i = 0, items = iter$(this._mounted), len = items.length, item; i < len; i++) {
		item = items[i];
		if (!document.documentElement.contains(item._dom)) {
			item.FLAGS = item.FLAGS & ~Imba.TAG_MOUNTED;
			if (item.unmount && item._dom) {
				item.unmount();
			} else if (item._scheduler) {
				// MAYBE FIX THIS?
				item.unschedule();
			};
			this._mounted[i] = null;
			count++;
		};
	};
	
	if (count) {
		this._mounted = this._mounted.filter(function(item) { return item; });
	};
	return this;
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

Imba.CSSKeyMap = {};

Imba.TAG_BUILT = 1;
Imba.TAG_SETUP = 2;
Imba.TAG_MOUNTING = 4;
Imba.TAG_MOUNTED = 8;
Imba.TAG_SCHEDULED = 16;
Imba.TAG_AWAKENED = 32;

/*
Get the current document
*/

Imba.document = function (){
	if (true) {
		return window.document;
	};
};

/*
Get the body element wrapped in an Imba.Tag
*/

Imba.root = function (){
	return Imba.getTagForDom(Imba.document().body);
};

Imba.static = function (items,typ,nr){
	items._type = typ;
	items.static = nr;
	return items;
};

/*

*/

Imba.mount = function (node,into){
	into || (into = Imba.document().body);
	into.appendChild(node.dom());
	Imba.TagManager.insert(node,into);
	node.scheduler().configure({events: true}).activate(false);
	Imba.TagManager.refresh();
	return node;
};


Imba.createTextNode = function (node){
	if (node && node.nodeType == 3) {
		return node;
	};
	return Imba.document().createTextNode(node);
};

/*
This is the baseclass that all tags in imba inherit from.
@iname node
*/

Imba.Tag = function Tag(dom,ctx){
	this.setDom(dom);
	this.$ = TagCache.build(this);
	this.$up = this._owner_ = ctx;
	this._tree_ = null;
	this.FLAGS = 0;
	this.build();
	this;
};

Imba.Tag.buildNode = function (){
	var dom = Imba.document().createElement(this._nodeType || 'div');
	if (this._classes) {
		var cls = this._classes.join(" ");
		if (cls) { dom.className = cls };
	};
	return dom;
};

Imba.Tag.createNode = function (){
	var proto = (this._protoDom || (this._protoDom = this.buildNode()));
	return proto.cloneNode(false);
};

Imba.Tag.build = function (ctx){
	return new this(this.createNode(),ctx);
};

Imba.Tag.dom = function (){
	return this._protoDom || (this._protoDom = this.buildNode());
};

/*
	Called when a tag type is being subclassed.
	*/

Imba.Tag.inherit = function (child){
	child._protoDom = null;
	
	if (this._nodeType) {
		child._nodeType = this._nodeType;
		child._classes = this._classes.slice();
		
		if (child._flagName) {
			return child._classes.push(child._flagName);
		};
	} else {
		child._nodeType = child._name;
		child._flagName = null;
		return child._classes = [];
	};
};

/*
	Internal method called after a tag class has
	been declared or extended.
	
	@private
	*/

Imba.Tag.prototype.optimizeTagStructure = function (){
	var base = Imba.Tag.prototype;
	var hasSetup = this.setup != base.setup;
	var hasCommit = this.commit != base.commit;
	var hasRender = this.render != base.render;
	var hasMount = this.mount;
	
	var ctor = this.constructor;
	
	if (hasCommit || hasRender || hasMount || hasSetup) {
		
		this.end = function() {
			if (this.mount && !(this.FLAGS & Imba.TAG_MOUNTED)) {
				// just activate 
				Imba.TagManager.mount(this);
			};
			
			if (!(this.FLAGS & Imba.TAG_SETUP)) {
				this.FLAGS |= Imba.TAG_SETUP;
				this.setup();
			};
			
			this.commit();
			
			return this;
		};
	};
	
	if (true) {
		if (hasMount) {
			if (ctor._classes && ctor._classes.indexOf('__mount') == -1) {
				ctor._classes.push('__mount');
			};
			
			if (ctor._protoDom) {
				ctor._protoDom.classList.add('__mount');
			};
		};
		
		for (let i = 0, items = ['mousemove','mouseenter','mouseleave','mouseover','mouseout','selectstart'], len = items.length, item; i < len; i++) {
			item = items[i];
			if (this[("on" + item)]) { Imba.Events.register(item) };
		};
	};
	return this;
};


Imba.attr(Imba.Tag,'name');
Imba.attr(Imba.Tag,'role');
Imba.attr(Imba.Tag,'tabindex');
Imba.Tag.prototype.title = function(v){ return this.getAttribute('title'); }
Imba.Tag.prototype.setTitle = function(v){ this.setAttribute('title',v); return this; };

Imba.Tag.prototype.dom = function (){
	return this._dom;
};

Imba.Tag.prototype.setDom = function (dom){
	dom._tag = this;
	this._dom = dom;
	return this;
};

Imba.Tag.prototype.ref = function (){
	return this._ref;
};

Imba.Tag.prototype.root = function (){
	return this._owner_ ? this._owner_.root() : this;
};

/*
	Setting references for tags like
	`<div@header>` will compile to `tag('div').ref_('header',this).end()`
	By default it adds the reference as a className to the tag.

	@return {self}
	@private
	*/

Imba.Tag.prototype.ref_ = function (ref){
	this.flag(this._ref = ref);
	return this;
};

/*
	Set the data object for node
	@return {self}
	*/

Imba.Tag.prototype.setData = function (data){
	this._data = data;
	return this;
};

/*
	Get the data object for node
	*/

Imba.Tag.prototype.data = function (){
	return this._data;
};


Imba.Tag.prototype.bindData = function (target,path,args){
	return this.setData(args ? target[path].apply(target,args) : target[path]);
};

/*
	Set inner html of node
	*/

Imba.Tag.prototype.setHtml = function (html){
	if (this.html() != html) {
		this._dom.innerHTML = html;
	};
	return this;
};

/*
	Get inner html of node
	*/

Imba.Tag.prototype.html = function (){
	return this._dom.innerHTML;
};

Imba.Tag.prototype.on$ = function (slot,handler){
	let handlers = this._on_ || (this._on_ = []);
	let prev = handlers[slot];
	// self-bound handlers
	if (slot < 0) {
		if (prev == undefined) {
			slot = handlers[slot] = handlers.length;
		} else {
			slot = prev;
		};
		prev = handlers[slot];
	};
	
	handlers[slot] = handler;
	if (prev) { handler.state = prev.state };
	return this;
};


Imba.Tag.prototype.setId = function (id){
	if (id != null) {
		this.dom().id = id;
	};
	return this;
};

Imba.Tag.prototype.id = function (){
	return this.dom().id;
};

/*
	Adds a new attribute or changes the value of an existing attribute
	on the specified tag. If the value is null or false, the attribute
	will be removed.
	@return {self}
	*/

Imba.Tag.prototype.setAttribute = function (name,value){
	var old = this.dom().getAttribute(name);
	
	if (old == value) {
		value;
	} else if (value != null && value !== false) {
		this.dom().setAttribute(name,value);
	} else {
		this.dom().removeAttribute(name);
	};
	return this;
};

Imba.Tag.prototype.setNestedAttr = function (ns,name,value){
	if (this[ns + 'SetAttribute']) {
		this[ns + 'SetAttribute'](name,value);
	} else {
		this.setAttributeNS(ns,name,value);
	};
	return this;
};

Imba.Tag.prototype.setAttributeNS = function (ns,name,value){
	var old = this.getAttributeNS(ns,name);
	
	if (old != value) {
		if (value != null && value !== false) {
			this.dom().setAttributeNS(ns,name,value);
		} else {
			this.dom().removeAttributeNS(ns,name);
		};
	};
	return this;
};


/*
	removes an attribute from the specified tag
	*/

Imba.Tag.prototype.removeAttribute = function (name){
	return this.dom().removeAttribute(name);
};

/*
	returns the value of an attribute on the tag.
	If the given attribute does not exist, the value returned
	will either be null or "" (the empty string)
	*/

Imba.Tag.prototype.getAttribute = function (name){
	return this.dom().getAttribute(name);
};


Imba.Tag.prototype.getAttributeNS = function (ns,name){
	return this.dom().getAttributeNS(ns,name);
};


Imba.Tag.prototype.set = function (key,value,mods){
	let setter = Imba.toSetter(key);
	if (this[setter] instanceof Function) {
		this[setter](value,mods);
	} else {
		this._dom.setAttribute(key,value);
	};
	return this;
};


Imba.Tag.prototype.get = function (key){
	return this._dom.getAttribute(key);
};

/*
	Override this to provide special wrapping etc.
	@return {self}
	*/

Imba.Tag.prototype.setContent = function (content,type){
	this.setChildren(content,type);
	return this;
};

/*
	Set the children of node. type param is optional,
	and should only be used by Imba when compiling tag trees. 
	@return {self}
	*/

Imba.Tag.prototype.setChildren = function (nodes,type){
	// overridden on client by reconciler
	this._tree_ = nodes;
	return this;
};

/*
	Set the template that will render the content of node.
	@return {self}
	*/

Imba.Tag.prototype.setTemplate = function (template){
	if (!this._template) {
		// override the basic
		if (this.render == Imba.Tag.prototype.render) {
			this.render = this.renderTemplate; // do setChildren(renderTemplate)
		};
		this.optimizeTagStructure();
	};
	
	this.template = this._template = template;
	return this;
};

Imba.Tag.prototype.template = function (){
	return null;
};

/*
	If no custom render-method is defined, and the node
	has a template, this method will be used to render
	@return {self}
	*/

Imba.Tag.prototype.renderTemplate = function (){
	var body = this.template();
	if (body != this) { this.setChildren(body) };
	return this;
};


/*
	Remove specified child from current node.
	@return {self}
	*/

Imba.Tag.prototype.removeChild = function (child){
	var par = this.dom();
	var el = child._dom || child;
	if (el && el.parentNode == par) {
		par.removeChild(el);
		Imba.TagManager.remove(el._tag || el,this);
	};
	return this;
};

/*
	Remove all content inside node
	*/

Imba.Tag.prototype.removeAllChildren = function (){
	if (this._dom.firstChild) {
		while (this._dom.firstChild){
			this._dom.removeChild(this._dom.firstChild);
		};
		Imba.TagManager.remove(null,this); // should register each child?
	};
	this._tree_ = this._text_ = null;
	return this;
};

/*
	Append a single item (node or string) to the current node.
	If supplied item is a string it will automatically. This is used
	by Imba internally, but will practically never be used explicitly.
	@return {self}
	*/

Imba.Tag.prototype.appendChild = function (node){
	if ((typeof node=='string'||node instanceof String)) {
		this.dom().appendChild(Imba.document().createTextNode(node));
	} else if (node) {
		this.dom().appendChild(node._dom || node);
		Imba.TagManager.insert(node._tag || node,this);
		// FIXME ensure these are not called for text nodes
	};
	return this;
};

/*
	Insert a node into the current node (self), before another.
	The relative node must be a child of current node. 
	*/

Imba.Tag.prototype.insertBefore = function (node,rel){
	if ((typeof node=='string'||node instanceof String)) {
		node = Imba.document().createTextNode(node);
	};
	
	if (node && rel) {
		this.dom().insertBefore((node._dom || node),(rel._dom || rel));
		Imba.TagManager.insert(node._tag || node,this);
		// FIXME ensure these are not called for text nodes
	};
	return this;
};


/*
	Remove node from the dom tree
	@return {self}
	*/

Imba.Tag.prototype.orphanize = function (){
	var par;
	if (par = this.parent()) { par.removeChild(this) };
	return this;
};

/*
	Get text of node. Uses textContent behind the scenes (not innerText)
	[https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent]()
	@return {string} inner text of node
	*/

Imba.Tag.prototype.text = function (v){
	return this._dom.textContent;
};

/*
	Set text of node. Uses textContent behind the scenes (not innerText)
	[https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent]()
	*/

Imba.Tag.prototype.setText = function (txt){
	this._tree_ = txt;
	this._dom.textContent = (txt == null || this.text() === false) ? '' : txt;
	this;
	return this;
};


/*
	Method for getting and setting data-attributes. When called with zero
	arguments it will return the actual dataset for the tag.

		var node = <div data-name='hello'>
		# get the whole dataset
		node.dataset # {name: 'hello'}
		# get a single value
		node.dataset('name') # 'hello'
		# set a single value
		node.dataset('name','newname') # self


	*/

Imba.Tag.prototype.dataset = function (key,val){
	if (key instanceof Object) {
		for (let v, i = 0, keys = Object.keys(key), l = keys.length, k; i < l; i++){
			k = keys[i];v = key[k];this.dataset(k,v);
		};
		return this;
	};
	
	if (arguments.length == 2) {
		this.setAttribute(("data-" + key),val);
		return this;
	};
	
	if (key) {
		return this.getAttribute(("data-" + key));
	};
	
	var dataset = this.dom().dataset;
	
	if (!(dataset)) {
		dataset = {};
		for (let i = 0, items = iter$(this.dom().attributes), len = items.length, atr; i < len; i++) {
			atr = items[i];
			if (atr.name.substr(0,5) == 'data-') {
				dataset[Imba.toCamelCase(atr.name.slice(5))] = atr.value;
			};
		};
	};
	
	return dataset;
};

/*
	Empty placeholder. Override to implement custom render behaviour.
	Works much like the familiar render-method in React.
	@return {self}
	*/

Imba.Tag.prototype.render = function (){
	return this;
};

/*
	Called implicitly while tag is initializing. No initial props
	will have been set at this point.
	@return {self}
	*/

Imba.Tag.prototype.build = function (){
	return this;
};

/*
	Called once, implicitly through Imba.Tag#end. All initial props
	and children will have been set before setup is called.
	setContent.
	@return {self}
	*/

Imba.Tag.prototype.setup = function (){
	return this;
};

/*
	Called implicitly through Imba.Tag#end, for tags that are part of
	a tag tree (that are rendered several times).
	@return {self}
	*/

Imba.Tag.prototype.commit = function (){
	this.render();
	return this;
};

/*

	Called by the tag-scheduler (if this tag is scheduled)
	By default it will call this.render. Do not override unless
	you really understand it.

	*/

Imba.Tag.prototype.tick = function (){
	this.render();
	return this;
};

/*
	
	A very important method that you will practically never manually.
	The tag syntax of Imba compiles to a chain of setters, which always
	ends with .end. `<a.large>` compiles to `tag('a').flag('large').end()`
	
	You are highly adviced to not override its behaviour. The first time
	end is called it will mark the tag as initialized and call Imba.Tag#setup,
	and call Imba.Tag#commit every time.
	@return {self}
	*/

Imba.Tag.prototype.end = function (){
	return this;
};

// called on <self> to check if self is called from other places
Imba.Tag.prototype.$open = function (context){
	if (context != this._context_) {
		this._tree_ = null;
		this._context_ = context;
	};
	return this;
};

/*
	This is called instead of Imba.Tag#end for `<self>` tag chains.
	Defaults to noop
	@return {self}
	*/

Imba.Tag.prototype.synced = function (){
	return this;
};

// called when the node is awakened in the dom - either automatically
// upon attachment to the dom-tree, or the first time imba needs the
// tag for a domnode that has been rendered on the server
Imba.Tag.prototype.awaken = function (){
	return this;
};

/*
	List of flags for this node. 
	*/

Imba.Tag.prototype.flags = function (){
	return this._dom.classList;
};

/*
	Add speficied flag to current node.
	If a second argument is supplied, it will be coerced into a Boolean,
	and used to indicate whether we should remove the flag instead.
	@return {self}
	*/

Imba.Tag.prototype.flag = function (name,toggler){
	// it is most natural to treat a second undefined argument as a no-switch
	// so we need to check the arguments-length
	if (arguments.length == 2) {
		if (this._dom.classList.contains(name) != !(!(toggler))) {
			this._dom.classList.toggle(name);
		};
	} else {
		// firefox will trigger a change if adding existing class
		if (!this._dom.classList.contains(name)) { this._dom.classList.add(name) };
	};
	return this;
};

/*
	Remove specified flag from node
	@return {self}
	*/

Imba.Tag.prototype.unflag = function (name){
	this._dom.classList.remove(name);
	return this;
};

/*
	Toggle specified flag on node
	@return {self}
	*/

Imba.Tag.prototype.toggleFlag = function (name){
	this._dom.classList.toggle(name);
	return this;
};

/*
	Check whether current node has specified flag
	@return {bool}
	*/

Imba.Tag.prototype.hasFlag = function (name){
	return this._dom.classList.contains(name);
};


Imba.Tag.prototype.flagIf = function (flag,bool){
	var f = this._flags_ || (this._flags_ = {});
	let prev = f[flag];
	
	if (bool && !(prev)) {
		this._dom.classList.add(flag);
		f[flag] = true;
	} else if (prev && !(bool)) {
		this._dom.classList.remove(flag);
		f[flag] = false;
	};
	
	return this;
};

/*
	Set/update a named flag. It remembers the previous
	value of the flag, and removes it before setting the new value.

		node.setFlag('type','todo')
		node.setFlag('type','project')
		# todo is removed, project is added.

	@return {self}
	*/

Imba.Tag.prototype.setFlag = function (name,value){
	let flags = this._namedFlags_ || (this._namedFlags_ = {});
	let prev = flags[name];
	if (prev != value) {
		if (prev) { this.unflag(prev) };
		if (value) { this.flag(value) };
		flags[name] = value;
	};
	return this;
};


/*
	Get the scheduler for this node. A new scheduler will be created
	if it does not already exist.

	@return {Imba.Scheduler}
	*/

Imba.Tag.prototype.scheduler = function (){
	return (this._scheduler == null) ? (this._scheduler = new Imba.Scheduler(this)) : this._scheduler;
};

/*

	Shorthand to start scheduling a node. The method will basically
	proxy the arguments through to scheduler.configure, and then
	activate the scheduler.
	
	@return {self}
	*/

Imba.Tag.prototype.schedule = function (options){
	if(options === undefined) options = {events: true};
	this.scheduler().configure(options).activate();
	return this;
};

/*
	Shorthand for deactivating scheduler (if tag has one).
	@deprecated
	*/

Imba.Tag.prototype.unschedule = function (){
	if (this._scheduler) { this.scheduler().deactivate() };
	return this;
};


/*
	Get the parent of current node
	@return {Imba.Tag} 
	*/

Imba.Tag.prototype.parent = function (){
	return Imba.getTagForDom(this.dom().parentNode);
};

/*
	Get the children of node
	@return {Imba.Tag[]}
	*/

Imba.Tag.prototype.children = function (sel){
	let res = [];
	for (let i = 0, items = iter$(this._dom.children), len = items.length, item; i < len; i++) {
		item = items[i];
		res.push(item._tag || Imba.getTagForDom(item));
	};
	return res;
};

Imba.Tag.prototype.querySelector = function (q){
	return Imba.getTagForDom(this._dom.querySelector(q));
};

Imba.Tag.prototype.querySelectorAll = function (q){
	var items = [];
	for (let i = 0, ary = iter$(this._dom.querySelectorAll(q)), len = ary.length; i < len; i++) {
		items.push(Imba.getTagForDom(ary[i]));
	};
	return items;
};

/*
	Check if this node matches a selector
	@return {Boolean}
	*/

Imba.Tag.prototype.matches = function (sel){
	var fn;
	if (sel instanceof Function) {
		return sel(this);
	};
	
	if (sel.query instanceof Function) { sel = sel.query() };
	if (fn = (this._dom.matches || this._dom.matchesSelector || this._dom.webkitMatchesSelector || this._dom.msMatchesSelector || this._dom.mozMatchesSelector)) {
		return fn.call(this._dom,sel);
	};
};

/*
	Get the first element matching supplied selector / filter
	traversing upwards, but including the node itself.
	@return {Imba.Tag}
	*/

Imba.Tag.prototype.closest = function (sel){
	return Imba.getTagForDom(this._dom.closest(sel));
};

/*
	Check if node contains other node
	@return {Boolean} 
	*/

Imba.Tag.prototype.contains = function (node){
	return this.dom().contains(node._dom || node);
};


/*
	Shorthand for console.log on elements
	@return {self}
	*/

Imba.Tag.prototype.log = function (){
	var $0 = arguments, i = $0.length;
	var args = new Array(i>0 ? i : 0);
	while(i>0) args[i-1] = $0[--i];
	args.unshift(console);
	Function.prototype.call.apply(console.log,args);
	return this;
};

Imba.Tag.prototype.css = function (key,val){
	if (key instanceof Object) {
		for (let v, i = 0, keys = Object.keys(key), l = keys.length, k; i < l; i++){
			k = keys[i];v = key[k];this.css(k,v);
		};
		return this;
	};
	
	var name = Imba.CSSKeyMap[key] || key;
	
	if (val == null) {
		this.dom().style.removeProperty(name);
	} else if (val == undefined && arguments.length == 1) {
		return this.dom().style[name];
	} else {
		if ((typeof val=='number'||val instanceof Number) && name.match(/width|height|left|right|top|bottom/)) {
			this.dom().style[name] = val + "px";
		} else {
			this.dom().style[name] = val;
		};
	};
	return this;
};

Imba.Tag.prototype.setStyle = function (style){
	return this.setAttribute('style',style);
};

Imba.Tag.prototype.style = function (){
	return this.getAttribute('style');
};

/*
	Trigger an event from current node. Dispatched through the Imba event manager.
	To dispatch actual dom events, use dom.dispatchEvent instead.

	@return {Imba.Event}
	*/

Imba.Tag.prototype.trigger = function (name,data){
	if(data === undefined) data = {};
	return true && Imba.Events.trigger(name,this,{data: data});
};

/*
	Focus on current node
	@return {self}
	*/

Imba.Tag.prototype.focus = function (){
	this.dom().focus();
	return this;
};

/*
	Remove focus from current node
	@return {self}
	*/

Imba.Tag.prototype.blur = function (){
	this.dom().blur();
	return this;
};

Imba.Tag.prototype.toString = function (){
	return this.dom().outerHTML;
};


Imba.Tag.prototype.initialize = Imba.Tag;

Imba.SVGTag = function SVGTag(){ return Imba.Tag.apply(this,arguments) };

Imba.subclass(Imba.SVGTag,Imba.Tag);
Imba.SVGTag.namespaceURI = function (){
	return "http://www.w3.org/2000/svg";
};

Imba.SVGTag.buildNode = function (){
	var dom = Imba.document().createElementNS(this.namespaceURI(),this._nodeType);
	var cls = this._classes.join(" ");
	if (cls) { dom.className.baseVal = cls };
	return dom;
};

Imba.SVGTag.inherit = function (child){
	child._protoDom = null;
	if (Imba.indexOf(child._name,Imba.SVG_TAGS) >= 0) {
		child._nodeType = child._name;
		return child._classes = [];
	} else {
		child._nodeType = this._nodeType;
		var className = "_" + child._name.replace(/_/g,'-');
		return child._classes = this._classes.concat(className);
	};
};

Imba.HTML_TAGS = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
Imba.HTML_TAGS_UNSAFE = "article aside header section".split(" ");
Imba.SVG_TAGS = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");

Imba.HTML_ATTRS = {
	a: "href target hreflang media download rel type",
	form: "method action enctype autocomplete target",
	button: "autofocus type",
	input: "accept disabled form list max maxlength min pattern required size step type",
	label: "accesskey for form",
	img: "src srcset",
	link: "rel type href media",
	iframe: "referrerpolicy src srcdoc sandbox",
	meta: "property content charset desc",
	optgroup: "label",
	option: "label",
	output: "for form",
	object: "type data width height",
	param: "name value",
	progress: "max",
	script: "src type async defer crossorigin integrity nonce language",
	select: "size form multiple",
	textarea: "rows cols"
};


Imba.HTML_PROPS = {
	input: "autofocus autocomplete autocorrect value placeholder required disabled multiple checked readOnly",
	textarea: "autofocus autocomplete autocorrect value placeholder required disabled multiple checked readOnly",
	form: "novalidate",
	fieldset: "disabled",
	button: "disabled",
	select: "autofocus disabled required",
	option: "disabled selected value",
	optgroup: "disabled",
	progress: "value",
	fieldset: "disabled",
	canvas: "width height"
};

function extender(obj,sup){
	for (let v, i = 0, keys = Object.keys(sup), l = keys.length, k; i < l; i++){
		k = keys[i];v = sup[k];(obj[k] == null) ? (obj[k] = v) : obj[k];
	};
	
	obj.prototype = Object.create(sup.prototype);
	obj.__super__ = obj.prototype.__super__ = sup.prototype;
	obj.prototype.constructor = obj;
	if (sup.inherit) { sup.inherit(obj) };
	return obj;
};

function Tag(){
	return function(dom,ctx) {
		this.initialize(dom,ctx);
		return this;
	};
};

function TagSpawner(type){
	return function(zone) { return type.build(zone); };
};


Imba.Tags = function Tags(){
	this;
};

Imba.Tags.prototype.__clone = function (ns){
	var clone = Object.create(this);
	clone._parent = this;
	return clone;
};

Imba.Tags.prototype.ns = function (name){
	return this['_' + name.toUpperCase()] || this.defineNamespace(name);
};

Imba.Tags.prototype.defineNamespace = function (name){
	var clone = Object.create(this);
	clone._parent = this;
	clone._ns = name;
	this['_' + name.toUpperCase()] = clone;
	return clone;
};

Imba.Tags.prototype.baseType = function (name,ns){
	return (Imba.indexOf(name,Imba.HTML_TAGS) >= 0) ? 'element' : 'div';
};

Imba.Tags.prototype.defineTag = function (fullName,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	if (body && body._nodeType) {
		supr = body;
		body = null;
	};
	
	if (this[fullName]) {
		console.log("tag already exists?",fullName);
	};
	
	// if it is namespaced
	var ns;
	var name = fullName;
	let nsidx = name.indexOf(':');
	if (nsidx >= 0) {
		ns = fullName.substr(0,nsidx);
		name = fullName.substr(nsidx + 1);
		if (ns == 'svg' && !(supr)) {
			supr = 'svg:element';
		};
	};
	
	supr || (supr = this.baseType(fullName));
	
	let supertype = ((typeof supr=='string'||supr instanceof String)) ? this.findTagType(supr) : supr;
	let tagtype = Tag();
	
	tagtype._name = name;
	tagtype._flagName = null;
	
	if (name[0] == '#') {
		Imba.SINGLETONS[name.slice(1)] = tagtype;
		this[name] = tagtype;
	} else if (name[0] == name[0].toUpperCase()) {
		tagtype._flagName = name;
	} else {
		tagtype._flagName = "_" + fullName.replace(/[_\:]/g,'-');
		this[fullName] = tagtype;
	};
	
	extender(tagtype,supertype);
	
	if (body) {
		body.call(tagtype,tagtype,tagtype.TAGS || this);
		if (tagtype.defined) { tagtype.defined() };
		this.optimizeTag(tagtype);
	};
	return tagtype;
};

Imba.Tags.prototype.defineSingleton = function (name,supr,body){
	return this.defineTag(name,supr,body);
};

Imba.Tags.prototype.extendTag = function (name,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	var klass = (((typeof name=='string'||name instanceof String)) ? this.findTagType(name) : name);
	// allow for private tags here as well?
	if (body) { body && body.call(klass,klass,klass.prototype) };
	if (klass.extended) { klass.extended() };
	this.optimizeTag(klass);
	return klass;
};

Imba.Tags.prototype.optimizeTag = function (tagtype){
	var prototype_;
	return (prototype_ = tagtype.prototype) && prototype_.optimizeTagStructure  &&  prototype_.optimizeTagStructure();
};

Imba.Tags.prototype.findTagType = function (type){
	var attrs, props;
	let klass = this[type];
	if (!(klass)) {
		if (type.substr(0,4) == 'svg:') {
			klass = this.defineTag(type,'svg:element');
		} else if (Imba.HTML_TAGS.indexOf(type) >= 0) {
			klass = this.defineTag(type,'element');
			
			if (attrs = Imba.HTML_ATTRS[type]) {
				for (let i = 0, items = iter$(attrs.split(" ")), len = items.length; i < len; i++) {
					Imba.attr(klass,items[i]);
				};
			};
			
			if (props = Imba.HTML_PROPS[type]) {
				for (let i = 0, items = iter$(props.split(" ")), len = items.length; i < len; i++) {
					Imba.attr(klass,items[i],{dom: true});
				};
			};
		};
	};
	return klass;
};

Imba.Tags.prototype.createElement = function (name,owner){
	var typ;
	if (name instanceof Function) {
		typ = name;
	} else {
		if (true) {
			if (!this.findTagType(name)) { throw (("cannot find tag-type " + name)) };
		};
		typ = this.findTagType(name);
	};
	return typ.build(owner);
};


Imba.createElement = function (name,ctx,ref,pref){
	var type = name;
	var parent;
	if (name instanceof Function) {
		type = name;
	} else {
		if (true) {
			if (!Imba.TAGS.findTagType(name)) { throw (("cannot find tag-type " + name)) };
		};
		type = Imba.TAGS.findTagType(name);
	};
	
	if (ctx instanceof TagMap) {
		parent = ctx.par$;
	} else if (pref instanceof Imba.Tag) {
		parent = pref;
	} else {
		parent = (ctx && pref != undefined) ? ctx[pref] : ((ctx && ctx._tag || ctx));
	};
	
	var node = type.build(parent);
	
	if (ctx instanceof TagMap) {
		ctx.i$++;
		node.$key = ref;
	};
	
	// node:$ref = ref if ref
	// context:i$++ # only if it is not an array?
	if (ctx && ref != undefined) {
		ctx[ref] = node;
	};
	
	return node;
};

Imba.createTagCache = function (owner){
	var item = [];
	item._tag = owner;
	return item;
	
	var par = ((this.pref() != undefined) ? this.ctx()[this.pref()] : this.ctx()._tag);
	var node = new TagMap(this.ctx(),this.ref(),par);
	this.ctx()[this.ref()] = node;
	return node;
};

Imba.createTagMap = function (ctx,ref,pref){
	var par = ((pref != undefined) ? pref : ctx._tag);
	var node = new TagMap(ctx,ref,par);
	ctx[ref] = node;
	return node;
};

Imba.createTagList = function (ctx,ref,pref){
	var node = [];
	node._type = 4;
	node._tag = ((pref != undefined) ? pref : ctx._tag);
	ctx[ref] = node;
	return node;
};

Imba.createTagLoopResult = function (ctx,ref,pref){
	var node = [];
	node._type = 5;
	node.cache = {i$: 0};
	return node;
};

// use array instead?
function TagCache(owner){
	this._tag = owner;
	this;
};
TagCache.build = function (owner){
	var item = [];
	item._tag = owner;
	return item;
};



function TagMap(cache,ref,par){
	this.cache$ = cache;
	this.key$ = ref;
	this.par$ = par;
	this.i$ = 0;
	// self:curr$ = self:$iternew()
	// self:next$ = self:$iternew()
};

TagMap.prototype.$iter = function (){
	var item = [];
	item._type = 5;
	item.static = 5; // wrong(!)
	item.cache = this;
	return item;
};

TagMap.prototype.$prune = function (items){
	let cache = this.cache$;
	let key = this.key$;
	let clone = new TagMap(cache,key,this.par$);
	for (let i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
		item = ary[i];
		clone[item.key$] = item;
	};
	clone.i$ = items.length;
	return cache[key] = clone;
};

Imba.TagMap = TagMap;
Imba.TagCache = TagCache;
Imba.SINGLETONS = {};
Imba.TAGS = new Imba.Tags();
Imba.TAGS.element = Imba.TAGS.htmlelement = Imba.Tag;
Imba.TAGS['svg:element'] = Imba.SVGTag;

Imba.defineTag = function (name,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	return Imba.TAGS.defineTag(name,supr,body);
};

Imba.defineSingletonTag = function (id,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = 'div';
	if(supr==undefined) supr = 'div';
	return Imba.TAGS.defineTag(this.name(),supr,body);
};

Imba.extendTag = function (name,body){
	return Imba.TAGS.extendTag(name,body);
};

Imba.getTagSingleton = function (id){
	var klass;
	var dom,node;
	
	if (klass = Imba.SINGLETONS[id]) {
		if (klass && klass.Instance) { return klass.Instance };
		
		// no instance - check for element
		if (dom = Imba.document().getElementById(id)) {
			// we have a live instance - when finding it through a selector we should awake it, no?
			// console.log('creating the singleton from existing node in dom?',id,type)
			node = klass.Instance = new klass(dom);
			node.awaken(dom); // should only awaken
			return node;
		};
		
		dom = klass.createNode();
		dom.id = id;
		node = klass.Instance = new klass(dom);
		node.end().awaken(dom);
		return node;
	} else if (dom = Imba.document().getElementById(id)) {
		return Imba.getTagForDom(dom);
	};
};

var svgSupport = typeof SVGElement !== 'undefined';

// shuold be phased out
Imba.getTagForDom = function (dom){
	if (!(dom)) { return null };
	if (dom._dom) { return dom }; // could use inheritance instead
	if (dom._tag) { return dom._tag };
	if (!dom.nodeName) { return null };
	
	var name = dom.nodeName.toLowerCase();
	var type = name;
	var ns = Imba.TAGS; //  svgSupport and dom isa SVGElement ? Imba.TAGS:_SVG : Imba.TAGS
	
	if (dom.id && Imba.SINGLETONS[dom.id]) {
		return Imba.getTagSingleton(dom.id);
	};
	
	if (svgSupport && (dom instanceof SVGElement)) {
		type = ns.findTagType("svg:" + name);
	} else if (Imba.HTML_TAGS.indexOf(name) >= 0) {
		type = ns.findTagType(name);
	} else {
		type = Imba.Tag;
	};
	// if ns.@nodeNames.indexOf(name) >= 0
	//	type = ns.findTagType(name)
	
	return new type(dom,null).awaken(dom);
};

// deprecate
Imba.generateCSSPrefixes = function (){
	var styles = window.getComputedStyle(document.documentElement,'');
	
	for (let i = 0, items = iter$(styles), len = items.length, prefixed; i < len; i++) {
		prefixed = items[i];
		var unprefixed = prefixed.replace(/^-(webkit|ms|moz|o|blink)-/,'');
		var camelCase = unprefixed.replace(/-(\w)/g,function(m,a) { return a.toUpperCase(); });
		
		// if there exists an unprefixed version -- always use this
		if (prefixed != unprefixed) {
			if (styles.hasOwnProperty(unprefixed)) { continue; };
		};
		
		// register the prefixes
		Imba.CSSKeyMap[unprefixed] = Imba.CSSKeyMap[camelCase] = prefixed;
	};
	return;
};

if (true) {
	if (document) { Imba.generateCSSPrefixes() };
	
	// Ovverride classList
	if (document && !document.documentElement.classList) {
		Imba.extendTag('element', function(tag){
			
			tag.prototype.hasFlag = function (ref){
				return new RegExp('(^|\\s)' + ref + '(\\s|$)').test(this._dom.className);
			};
			
			tag.prototype.addFlag = function (ref){
				if (this.hasFlag(ref)) { return this };
				this._dom.className += (this._dom.className ? ' ' : '') + ref;
				return this;
			};
			
			tag.prototype.unflag = function (ref){
				if (!this.hasFlag(ref)) { return this };
				var regex = new RegExp('(^|\\s)*' + ref + '(\\s|$)*','g');
				this._dom.className = this._dom.className.replace(regex,'');
				return this;
			};
			
			tag.prototype.toggleFlag = function (ref){
				return this.hasFlag(ref) ? this.unflag(ref) : this.flag(ref);
			};
			
			tag.prototype.flag = function (ref,bool){
				if (arguments.length == 2 && !(!(bool)) === false) {
					return this.unflag(ref);
				};
				return this.addFlag(ref);
			};
		});
	};
};

Imba.Tag;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

// predefine all supported html tags
Imba.defineTag('fragment', 'element', function(tag){
	
	tag.createNode = function (){
		return Imba.document().createDocumentFragment();
	};
});

Imba.extendTag('html', function(tag){
	tag.prototype.parent = function (){
		return null;
	};
});


Imba.extendTag('canvas', function(tag){
	tag.prototype.context = function (type){
		if(type === undefined) type = '2d';
		return this.dom().getContext(type);
	};
});

function DataProxy(node,path,args){
	this._node = node;
	this._path = path;
	this._args = args;
	if (this._args) { this._setter = Imba.toSetter(this._path) };
};

DataProxy.bind = function (receiver,data,path,args){
	let proxy = receiver._data || (receiver._data = new this(receiver,path,args));
	proxy.bind(data,path,args);
	return receiver;
};

DataProxy.prototype.bind = function (data,key,args){
	if (data != this._data) {
		this._data = data;
	};
	return this;
};

DataProxy.prototype.getFormValue = function (){
	return this._setter ? this._data[this._path]() : this._data[this._path];
};

DataProxy.prototype.setFormValue = function (value){
	return this._setter ? this._data[this._setter](value) : ((this._data[this._path] = value));
};


var isArray = function(val) {
	return val && val.splice && val.sort;
};

var isSimilarArray = function(a,b) {
	let l = a.length,i = 0;
	if (l != b.length) { return false };
	while (i++ < l){
		if (a[i] != b[i]) { return false };
	};
	return true;
};

Imba.extendTag('input', function(tag){
	tag.prototype.lazy = function(v){ return this._lazy; }
	tag.prototype.setLazy = function(v){ this._lazy = v; return this; };
	
	tag.prototype.setModel = function (){
		console.warn("setModel removed. Use <input[data:path]>");
		return this;
	};
	
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	tag.prototype.setValue = function (value){
		this.dom().value = this._value = value;
		return this;
	};
	
	tag.prototype.oninput = function (e){
		let val = this._dom.value;
		this._localValue = (this._initialValue != val) ? val : undefined;
		return (this._data && !(this.lazy())) ? this._data.setFormValue(this.value(),this) : e.silence();
	};
	
	tag.prototype.onchange = function (e){
		this._modelValue = this._localValue = undefined;
		if (!(this.data())) { return e.silence() };
		
		if (this.type() == 'radio' || this.type() == 'checkbox') {
			let checked = this._dom.checked;
			let mval = this._data.getFormValue(this);
			let dval = (this._value != undefined) ? this._value : this.value();
			
			if (this.type() == 'radio') {
				return this._data.setFormValue(dval,this);
			} else if (this.dom().value == 'on') {
				return this._data.setFormValue(!(!(checked)),this);
			} else if (isArray(mval)) {
				let idx = mval.indexOf(dval);
				if (checked && idx == -1) {
					return mval.push(dval);
				} else if (!(checked) && idx >= 0) {
					return mval.splice(idx,1);
				};
			} else {
				return this._data.setFormValue(dval,this);
			};
		} else {
			return this._data.setFormValue(this.value());
		};
	};
	
	// overriding end directly for performance
	tag.prototype.end = function (){
		if (!this._data || this._localValue !== undefined) { return this };
		let mval = this._data.getFormValue(this);
		if (mval == this._modelValue) { return this };
		if (!isArray(mval)) { this._modelValue = mval };
		
		if (this.type() == 'radio' || this.type() == 'checkbox') {
			let dval = this._value;
			let checked = isArray(mval) ? (
				mval.indexOf(dval) >= 0
			) : ((this.dom().value == 'on') ? (
				!(!(mval))
			) : (
				mval == this._value
			));
			
			this._dom.checked = checked;
		} else {
			this._dom.value = mval;
			this._initialValue = this._dom.value;
		};
		return this;
	};
});

Imba.extendTag('textarea', function(tag){
	tag.prototype.lazy = function(v){ return this._lazy; }
	tag.prototype.setLazy = function(v){ this._lazy = v; return this; };
	
	tag.prototype.setModel = function (value,mods){
		console.warn("setModel removed. Use <textarea[data:path]>");
		return this;
	};
	
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	tag.prototype.setValue = function (value){
		if (this._localValue == undefined) { this.dom().value = value };
		return this;
	};
	
	tag.prototype.oninput = function (e){
		let val = this._dom.value;
		this._localValue = (this._initialValue != val) ? val : undefined;
		return (this._data && !(this.lazy())) ? this._data.setFormValue(this.value(),this) : e.silence();
	};
	
	tag.prototype.onchange = function (e){
		this._localValue = undefined;
		return this._data ? this._data.setFormValue(this.value(),this) : e.silence();
	};
	
	tag.prototype.render = function (){
		if (this._localValue != undefined || !this._data) { return };
		if (this._data) {
			let dval = this._data.getFormValue(this);
			this._dom.value = (dval != undefined) ? dval : '';
		};
		this._initialValue = this._dom.value;
		return this;
	};
});

Imba.extendTag('option', function(tag){
	tag.prototype.setValue = function (value){
		if (value != this._value) {
			this.dom().value = this._value = value;
		};
		return this;
	};
	
	tag.prototype.value = function (){
		return this._value || this.dom().value;
	};
});

Imba.extendTag('select', function(tag){
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	tag.prototype.setModel = function (value,mods){
		console.warn("setModel removed. Use <select[data:path]>");
		return this;
	};
	
	tag.prototype.setValue = function (value,syncing){
		let prev = this._value;
		this._value = value;
		if (!(syncing)) { this.syncValue(value) };
		return this;
	};
	
	tag.prototype.syncValue = function (value){
		let prev = this._syncValue;
		// check if value has changed
		if (this.multiple() && (value instanceof Array)) {
			if ((prev instanceof Array) && isSimilarArray(prev,value)) {
				return this;
			};
			// create a copy for syncValue
			value = value.slice();
		};
		
		this._syncValue = value;
		// support array for multiple?
		if (typeof value == 'object') {
			let mult = this.multiple() && (value instanceof Array);
			
			for (let i = 0, items = iter$(this.dom().options), len = items.length, opt; i < len; i++) {
				opt = items[i];
				let oval = (opt._tag ? opt._tag.value() : opt.value);
				if (mult) {
					opt.selected = value.indexOf(oval) >= 0;
				} else if (value == oval) {
					this.dom().selectedIndex = i;
					break;
				};
			};
		} else {
			this.dom().value = value;
		};
		return this;
	};
	
	tag.prototype.value = function (){
		if (this.multiple()) {
			let res = [];
			for (let i = 0, items = iter$(this.dom().selectedOptions), len = items.length, option; i < len; i++) {
				option = items[i];
				res.push(option._tag ? option._tag.value() : option.value);
			};
			return res;
		} else {
			let opt = this.dom().selectedOptions[0];
			return opt ? ((opt._tag ? opt._tag.value() : opt.value)) : null;
		};
	};
	
	tag.prototype.onchange = function (e){
		return this._data ? this._data.setFormValue(this.value(),this) : e.silence();
	};
	
	tag.prototype.end = function (){
		if (this._data) {
			this.setValue(this._data.getFormValue(this),1);
		};
		
		if (this._value != this._syncValue) {
			this.syncValue(this._value);
		};
		return this;
	};
});


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

// Imba.Touch
// Began	A finger touched the screen.
// Moved	A finger moved on the screen.
// Stationary	A finger is touching the screen but hasn't moved.
// Ended	A finger was lifted from the screen. This is the final phase of a touch.
// Canceled The system cancelled tracking for the touch.

/*
Consolidates mouse and touch events. Touch objects persist across a touch,
from touchstart until end/cancel. When a touch starts, it will traverse
down from the innermost target, until it finds a node that responds to
ontouchstart. Unless the touch is explicitly redirected, the touch will
call ontouchmove and ontouchend / ontouchcancel on the responder when appropriate.

	tag draggable
		# called when a touch starts
		def ontouchstart touch
			flag 'dragging'
			self
		
		# called when touch moves - same touch object
		def ontouchmove touch
			# move the node with touch
			css top: touch.dy, left: touch.dx
		
		# called when touch ends
		def ontouchend touch
			unflag 'dragging'

@iname touch
*/

Imba.Touch = function Touch(event,pointer){
	// @native  = false
	this.setEvent(event);
	this.setData({});
	this.setActive(true);
	this._button = event && event.button || 0;
	this._suppress = false; // deprecated
	this._captured = false;
	this.setBubble(false);
	pointer = pointer;
	this.setUpdates(0);
	return this;
};

Imba.Touch.LastTimestamp = 0;
Imba.Touch.TapTimeout = 50;

// var lastNativeTouchTimeout = 50

var touches = [];
var count = 0;
var identifiers = {};

Imba.Touch.count = function (){
	return count;
};

Imba.Touch.lookup = function (item){
	return item && (item.__touch__ || identifiers[item.identifier]);
};

Imba.Touch.release = function (item,touch){
	var v_, $1;
	(((v_ = identifiers[item.identifier]),delete identifiers[item.identifier], v_));
	((($1 = item.__touch__),delete item.__touch__, $1));
	return;
};

Imba.Touch.ontouchstart = function (e){
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
		if (this.lookup(t)) { continue; };
		var touch = identifiers[t.identifier] = new this(e); // (e)
		t.__touch__ = touch;
		touches.push(touch);
		count++;
		touch.touchstart(e,t);
	};
	return this;
};

Imba.Touch.ontouchmove = function (e){
	var touch;
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
		if (touch = this.lookup(t)) {
			touch.touchmove(e,t);
		};
	};
	
	return this;
};

Imba.Touch.ontouchend = function (e){
	var touch;
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
		if (touch = this.lookup(t)) {
			touch.touchend(e,t);
			this.release(t,touch);
			count--;
		};
	};
	
	// e.preventDefault
	// not always supported!
	// touches = touches.filter(||)
	return this;
};

Imba.Touch.ontouchcancel = function (e){
	var touch;
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
		if (touch = this.lookup(t)) {
			touch.touchcancel(e,t);
			this.release(t,touch);
			count--;
		};
	};
	return this;
};

Imba.Touch.onmousedown = function (e){
	return this;
};

Imba.Touch.onmousemove = function (e){
	return this;
};

Imba.Touch.onmouseup = function (e){
	return this;
};


Imba.Touch.prototype.phase = function(v){ return this._phase; }
Imba.Touch.prototype.setPhase = function(v){ this._phase = v; return this; };
Imba.Touch.prototype.active = function(v){ return this._active; }
Imba.Touch.prototype.setActive = function(v){ this._active = v; return this; };
Imba.Touch.prototype.event = function(v){ return this._event; }
Imba.Touch.prototype.setEvent = function(v){ this._event = v; return this; };
Imba.Touch.prototype.pointer = function(v){ return this._pointer; }
Imba.Touch.prototype.setPointer = function(v){ this._pointer = v; return this; };
Imba.Touch.prototype.target = function(v){ return this._target; }
Imba.Touch.prototype.setTarget = function(v){ this._target = v; return this; };
Imba.Touch.prototype.handler = function(v){ return this._handler; }
Imba.Touch.prototype.setHandler = function(v){ this._handler = v; return this; };
Imba.Touch.prototype.updates = function(v){ return this._updates; }
Imba.Touch.prototype.setUpdates = function(v){ this._updates = v; return this; };
Imba.Touch.prototype.suppress = function(v){ return this._suppress; }
Imba.Touch.prototype.setSuppress = function(v){ this._suppress = v; return this; };
Imba.Touch.prototype.data = function(v){ return this._data; }
Imba.Touch.prototype.setData = function(v){ this._data = v; return this; };
Imba.Touch.prototype.__bubble = {chainable: true,name: 'bubble'};
Imba.Touch.prototype.bubble = function(v){ return v !== undefined ? (this.setBubble(v),this) : this._bubble; }
Imba.Touch.prototype.setBubble = function(v){ this._bubble = v; return this; };
Imba.Touch.prototype.timestamp = function(v){ return this._timestamp; }
Imba.Touch.prototype.setTimestamp = function(v){ this._timestamp = v; return this; };

Imba.Touch.prototype.gestures = function(v){ return this._gestures; }
Imba.Touch.prototype.setGestures = function(v){ this._gestures = v; return this; };

/*
	@internal
	@constructor
	*/

Imba.Touch.prototype.capture = function (){
	this._captured = true;
	this._event && this._event.stopPropagation();
	if (!this._selblocker) {
		this._selblocker = function(e) { return e.preventDefault(); };
		Imba.document().addEventListener('selectstart',this._selblocker,true);
	};
	return this;
};

Imba.Touch.prototype.isCaptured = function (){
	return !(!this._captured);
};

/*
	Extend the touch with a plugin / gesture. 
	All events (touchstart,move etc) for the touch
	will be triggered on the plugins in the order they
	are added.
	*/

Imba.Touch.prototype.extend = function (plugin){
	// console.log "added gesture!!!"
	this._gestures || (this._gestures = []);
	this._gestures.push(plugin);
	return this;
};

/*
	Redirect touch to specified target. ontouchstart will always be
	called on the new target.
	@return {Number}
	*/

Imba.Touch.prototype.redirect = function (target){
	this._redirect = target;
	return this;
};

/*
	Suppress the default behaviour. Will call preventDefault for
	all native events that are part of the touch.
	*/

Imba.Touch.prototype.suppress = function (){
	// collision with the suppress property
	this._active = false;
	
	return this;
};

Imba.Touch.prototype.setSuppress = function (value){
	console.warn('Imba.Touch#suppress= is deprecated');
	this._supress = value;
	this;
	return this;
};

Imba.Touch.prototype.touchstart = function (e,t){
	this._event = e;
	this._touch = t;
	this._button = 0;
	this._x = t.clientX;
	this._y = t.clientY;
	this.began();
	this.update();
	if (e && this.isCaptured()) { e.preventDefault() };
	return this;
};

Imba.Touch.prototype.touchmove = function (e,t){
	this._event = e;
	this._x = t.clientX;
	this._y = t.clientY;
	this.update();
	if (e && this.isCaptured()) { e.preventDefault() };
	return this;
};

Imba.Touch.prototype.touchend = function (e,t){
	this._event = e;
	this._x = t.clientX;
	this._y = t.clientY;
	this.ended();
	
	Imba.Touch.LastTimestamp = e.timeStamp;
	
	if (this._maxdr < 20) {
		var tap = new Imba.Event(e);
		tap.setType('tap');
		tap.process();
		if (tap._responder) { e.preventDefault() };
	};
	
	if (e && this.isCaptured()) {
		e.preventDefault();
	};
	
	return this;
};

Imba.Touch.prototype.touchcancel = function (e,t){
	return this.cancel();
};

Imba.Touch.prototype.mousedown = function (e,t){
	var self = this;
	self._event = e;
	self._button = e.button;
	self._x = t.clientX;
	self._y = t.clientY;
	self.began();
	self.update();
	self._mousemove = function(e) { return self.mousemove(e,e); };
	Imba.document().addEventListener('mousemove',self._mousemove,true);
	return self;
};

Imba.Touch.prototype.mousemove = function (e,t){
	this._x = t.clientX;
	this._y = t.clientY;
	this._event = e;
	if (this.isCaptured()) { e.preventDefault() };
	this.update();
	this.move();
	return this;
};

Imba.Touch.prototype.mouseup = function (e,t){
	this._x = t.clientX;
	this._y = t.clientY;
	this.ended();
	return this;
};

Imba.Touch.prototype.idle = function (){
	return this.update();
};

Imba.Touch.prototype.began = function (){
	this._timestamp = Date.now();
	this._maxdr = this._dr = 0;
	this._x0 = this._x;
	this._y0 = this._y;
	
	var dom = this.event().target;
	var node = null;
	
	this._sourceTarget = dom && Imba.getTagForDom(dom);
	
	while (dom){
		node = Imba.getTagForDom(dom);
		if (node && node.ontouchstart) {
			this._bubble = false;
			this.setTarget(node);
			this.target().ontouchstart(this);
			if (!this._bubble) { break; };
		};
		dom = dom.parentNode;
	};
	
	this._updates++;
	return this;
};

Imba.Touch.prototype.update = function (){
	var target_;
	if (!this._active || this._cancelled) { return this };
	
	var dr = Math.sqrt(this.dx() * this.dx() + this.dy() * this.dy());
	if (dr > this._dr) { this._maxdr = dr };
	this._dr = dr;
	
	// catching a touch-redirect?!?
	if (this._redirect) {
		if (this._target && this._target.ontouchcancel) {
			this._target.ontouchcancel(this);
		};
		this.setTarget(this._redirect);
		this._redirect = null;
		if (this.target().ontouchstart) { this.target().ontouchstart(this) };
		if (this._redirect) { return this.update() }; // possibly redirecting again
	};
	
	
	this._updates++;
	if (this._gestures) {
		for (let i = 0, items = iter$(this._gestures), len = items.length; i < len; i++) {
			items[i].ontouchupdate(this);
		};
	};
	
	(target_ = this.target()) && target_.ontouchupdate  &&  target_.ontouchupdate(this);
	if (this._redirect) this.update();
	return this;
};

Imba.Touch.prototype.move = function (){
	var target_;
	if (!this._active || this._cancelled) { return this };
	
	if (this._gestures) {
		for (let i = 0, items = iter$(this._gestures), len = items.length, g; i < len; i++) {
			g = items[i];
			if (g.ontouchmove) { g.ontouchmove(this,this._event) };
		};
	};
	
	(target_ = this.target()) && target_.ontouchmove  &&  target_.ontouchmove(this,this._event);
	return this;
};

Imba.Touch.prototype.ended = function (){
	var target_;
	if (!this._active || this._cancelled) { return this };
	
	this._updates++;
	
	if (this._gestures) {
		for (let i = 0, items = iter$(this._gestures), len = items.length; i < len; i++) {
			items[i].ontouchend(this);
		};
	};
	
	(target_ = this.target()) && target_.ontouchend  &&  target_.ontouchend(this);
	this.cleanup_();
	return this;
};

Imba.Touch.prototype.cancel = function (){
	if (!this._cancelled) {
		this._cancelled = true;
		this.cancelled();
		this.cleanup_();
	};
	return this;
};

Imba.Touch.prototype.cancelled = function (){
	var target_;
	if (!this._active) { return this };
	
	this._cancelled = true;
	this._updates++;
	
	if (this._gestures) {
		for (let i = 0, items = iter$(this._gestures), len = items.length, g; i < len; i++) {
			g = items[i];
			if (g.ontouchcancel) { g.ontouchcancel(this) };
		};
	};
	
	(target_ = this.target()) && target_.ontouchcancel  &&  target_.ontouchcancel(this);
	return this;
};

Imba.Touch.prototype.cleanup_ = function (){
	if (this._mousemove) {
		Imba.document().removeEventListener('mousemove',this._mousemove,true);
		this._mousemove = null;
	};
	
	if (this._selblocker) {
		Imba.document().removeEventListener('selectstart',this._selblocker,true);
		this._selblocker = null;
	};
	
	return this;
};

/*
	The absolute distance the touch has moved from starting position 
	@return {Number}
	*/

Imba.Touch.prototype.dr = function (){
	return this._dr;
};

/*
	The distance the touch has moved horizontally
	@return {Number}
	*/

Imba.Touch.prototype.dx = function (){
	return this._x - this._x0;
};

/*
	The distance the touch has moved vertically
	@return {Number}
	*/

Imba.Touch.prototype.dy = function (){
	return this._y - this._y0;
};

/*
	Initial horizontal position of touch
	@return {Number}
	*/

Imba.Touch.prototype.x0 = function (){
	return this._x0;
};

/*
	Initial vertical position of touch
	@return {Number}
	*/

Imba.Touch.prototype.y0 = function (){
	return this._y0;
};

/*
	Horizontal position of touch
	@return {Number}
	*/

Imba.Touch.prototype.x = function (){
	return this._x;
};

/*
	Vertical position of touch
	@return {Number}
	*/

Imba.Touch.prototype.y = function (){
	return this._y;
};

/*
	Horizontal position of touch relative to target
	@return {Number}
	*/

Imba.Touch.prototype.tx = function (){
	this._targetBox || (this._targetBox = this._target.dom().getBoundingClientRect());
	return this._x - this._targetBox.left;
};

/*
	Vertical position of touch relative to target
	@return {Number}
	*/

Imba.Touch.prototype.ty = function (){
	this._targetBox || (this._targetBox = this._target.dom().getBoundingClientRect());
	return this._y - this._targetBox.top;
};

/*
	Button pressed in this touch. Native touches defaults to left-click (0)
	@return {Number}
	*/

Imba.Touch.prototype.button = function (){
	return this._button;
}; // @pointer ? @pointer.button : 0

Imba.Touch.prototype.sourceTarget = function (){
	return this._sourceTarget;
};

Imba.Touch.prototype.elapsed = function (){
	return Date.now() - this._timestamp;
};


Imba.TouchGesture = function TouchGesture(){ };

Imba.TouchGesture.prototype.__active = {'default': false,name: 'active'};
Imba.TouchGesture.prototype.active = function(v){ return this._active; }
Imba.TouchGesture.prototype.setActive = function(v){ this._active = v; return this; }
Imba.TouchGesture.prototype._active = false;

Imba.TouchGesture.prototype.ontouchstart = function (e){
	return this;
};

Imba.TouchGesture.prototype.ontouchupdate = function (e){
	return this;
};

Imba.TouchGesture.prototype.ontouchend = function (e){
	return this;
};



/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

var keyCodes = {
	esc: 27,
	tab: 9,
	enter: 13,
	space: 32,
	up: 38,
	down: 40
};

var el = Imba.Tag.prototype;
el.stopModifier = function (e){
	return e.stop() || true;
};
el.preventModifier = function (e){
	return e.prevent() || true;
};
el.silenceModifier = function (e){
	return e.silence() || true;
};
el.bubbleModifier = function (e){
	return e.bubble(true) || true;
};
el.ctrlModifier = function (e){
	return e.event().ctrlKey == true;
};
el.altModifier = function (e){
	return e.event().altKey == true;
};
el.shiftModifier = function (e){
	return e.event().shiftKey == true;
};
el.metaModifier = function (e){
	return e.event().metaKey == true;
};
el.keyModifier = function (key,e){
	return e.keyCode() ? ((e.keyCode() == key)) : true;
};
el.delModifier = function (e){
	return e.keyCode() ? ((e.keyCode() == 8 || e.keyCode() == 46)) : true;
};
el.selfModifier = function (e){
	return e.event().target == this._dom;
};
el.leftModifier = function (e){
	return (e.button() != undefined) ? ((e.button() === 0)) : el.keyModifier(37,e);
};
el.rightModifier = function (e){
	return (e.button() != undefined) ? ((e.button() === 2)) : el.keyModifier(39,e);
};
el.middleModifier = function (e){
	return (e.button() != undefined) ? ((e.button() === 1)) : true;
};
el.getHandler = function (str){
	if (this[str]) {
		return this;
	} else if (this._data && (this._data[str] instanceof Function)) {
		return this._data;
	};
};

/*
Imba handles all events in the dom through a single manager,
listening at the root of your document. If Imba finds a tag
that listens to a certain event, the event will be wrapped 
in an `Imba.Event`, which normalizes some of the quirks and 
browser differences.

@iname event
*/

Imba.Event = function Event(e){
	this.setEvent(e);
	this._bubble = true;
};

/* reference to the native event */

Imba.Event.prototype.event = function(v){ return this._event; }
Imba.Event.prototype.setEvent = function(v){ this._event = v; return this; };

/* reference to the native event */

Imba.Event.prototype.prefix = function(v){ return this._prefix; }
Imba.Event.prototype.setPrefix = function(v){ this._prefix = v; return this; };

Imba.Event.prototype.data = function(v){ return this._data; }
Imba.Event.prototype.setData = function(v){ this._data = v; return this; };

Imba.Event.prototype.responder = function(v){ return this._responder; }
Imba.Event.prototype.setResponder = function(v){ this._responder = v; return this; };

Imba.Event.wrap = function (e){
	return new this(e);
};

Imba.Event.prototype.setType = function (type){
	this._type = type;
	this;
	return this;
};

/*
	@return {String} The name of the event (case-insensitive)
	*/

Imba.Event.prototype.type = function (){
	return this._type || this.event().type;
};

Imba.Event.prototype.button = function (){
	return this.event().button;
};
Imba.Event.prototype.keyCode = function (){
	return this.event().keyCode;
};

Imba.Event.prototype.name = function (){
	return this._name || (this._name = this.type().toLowerCase().replace(/\:/g,''));
};

// mimc getset
Imba.Event.prototype.bubble = function (v){
	if (v != undefined) {
		this.setBubble(v);
		return this;
	};
	return this._bubble;
};

Imba.Event.prototype.setBubble = function (v){
	this._bubble = v;
	return this;
	return this;
};

/*
	Prevents further propagation of the current event.
	@return {self}
	*/

Imba.Event.prototype.stop = function (){
	this.setBubble(false);
	return this;
};

Imba.Event.prototype.stopPropagation = function (){
	return this.stop();
};
Imba.Event.prototype.halt = function (){
	return this.stop();
};

// migrate from cancel to prevent
Imba.Event.prototype.prevent = function (){
	if (this.event().preventDefault) {
		this.event().preventDefault();
	} else {
		this.event().defaultPrevented = true;
	};
	this.defaultPrevented = true;
	return this;
};

Imba.Event.prototype.preventDefault = function (){
	console.warn("Event#preventDefault is deprecated - use Event#prevent");
	return this.prevent();
};

/*
	Indicates whether or not event.cancel has been called.

	@return {Boolean}
	*/

Imba.Event.prototype.isPrevented = function (){
	return this.event() && this.event().defaultPrevented || this._cancel;
};

/*
	Cancel the event (if cancelable). In the case of native events it
	will call `preventDefault` on the wrapped event object.
	@return {self}
	*/

Imba.Event.prototype.cancel = function (){
	console.warn("Event#cancel is deprecated - use Event#prevent");
	return this.prevent();
};

Imba.Event.prototype.silence = function (){
	this._silenced = true;
	return this;
};

Imba.Event.prototype.isSilenced = function (){
	return !(!this._silenced);
};

/*
	A reference to the initial target of the event.
	*/

Imba.Event.prototype.target = function (){
	return Imba.getTagForDom(this.event()._target || this.event().target);
};

/*
	A reference to the object responding to the event.
	*/

Imba.Event.prototype.responder = function (){
	return this._responder;
};

/*
	Redirect the event to new target
	*/

Imba.Event.prototype.redirect = function (node){
	this._redirect = node;
	return this;
};

Imba.Event.prototype.processHandlers = function (node,handlers){
	let i = 1;
	let l = handlers.length;
	let bubble = this._bubble;
	let state = handlers.state || (handlers.state = {});
	let result;
	
	if (bubble) {
		this._bubble = 1;
	};
	
	while (i < l){
		let isMod = false;
		let handler = handlers[i++];
		let params = null;
		let context = node;
		
		if (handler instanceof Array) {
			params = handler.slice(1);
			handler = handler[0];
		};
		
		if (typeof handler == 'string') {
			if (keyCodes[handler]) {
				params = [keyCodes[handler]];
				handler = 'key';
			};
			
			let mod = handler + 'Modifier';
			
			if (node[mod]) {
				isMod = true;
				params = (params || []).concat([this,state]);
				handler = node[mod];
			};
		};
		
		// if it is still a string - call getHandler on
		// ancestor of node to see if we get a handler for this name
		if (typeof handler == 'string') {
			let el = node;
			let fn = null;
			while (el && (!(fn) || !(fn instanceof Function))){
				if (fn = el.getHandler(handler)) {
					if (fn[handler] instanceof Function) {
						handler = fn[handler];
						context = fn;
					} else if (fn instanceof Function) {
						handler = fn;
						context = el;
					};
				} else {
					el = el.parent();
				};
			};
		};
		
		if (handler instanceof Function) {
			// what if we actually call stop inside function?
			// do we still want to continue the chain?
			let res = handler.apply(context,params || [this]);
			
			if (!(isMod)) {
				this._responder || (this._responder = node);
			};
			
			if (res == false) {
				// console.log "returned false - breaking"
				break;
			};
			
			if (res && !this._silenced && (res.then instanceof Function)) {
				res.then(Imba.commit);
			};
		};
	};
	
	// if we havent stopped or dealt with bubble while handling
	if (this._bubble === 1) {
		this._bubble = bubble;
	};
	
	return null;
};

Imba.Event.prototype.process = function (){
	var name = this.name();
	var meth = ("on" + (this._prefix || '') + name);
	var args = null;
	var domtarget = this.event()._target || this.event().target;
	var domnode = domtarget._responder || domtarget;
	// @todo need to stop infinite redirect-rules here
	var result;
	var handlers;
	
	while (domnode){
		this._redirect = null;
		let node = domnode._dom ? domnode : domnode._tag;
		
		if (node) {
			if (handlers = node._on_) {
				for (let i = 0, items = iter$(handlers), len = items.length, handler; i < len; i++) {
					handler = items[i];
					if (!(handler)) { continue; };
					let hname = handler[0];
					if (name == handler[0] && this.bubble()) {
						this.processHandlers(node,handler);
					};
				};
				if (!(this.bubble())) { break; };
			};
			
			if (this.bubble() && (node[meth] instanceof Function)) {
				this._responder || (this._responder = node);
				this._silenced = false;
				result = args ? node[meth].apply(node,args) : node[meth](this,this.data());
			};
			
			if (node.onevent) {
				node.onevent(this);
			};
		};
		
		// add node.nextEventResponder as a separate method here?
		if (!(this.bubble() && (domnode = (this._redirect || (node ? node.parent() : domnode.parentNode))))) {
			break;
		};
	};
	
	this.processed();
	
	// if a handler returns a promise, notify schedulers
	// about this after promise has finished processing
	if (result && (result.then instanceof Function)) {
		result.then(this.processed.bind(this));
	};
	return this;
};


Imba.Event.prototype.processed = function (){
	if (!this._silenced && this._responder) {
		Imba.emit(Imba,'event',[this]);
		Imba.commit(this.event());
	};
	return this;
};

/*
	Return the x/left coordinate of the mouse / pointer for this event
	@return {Number} x coordinate of mouse / pointer for event
	*/

Imba.Event.prototype.x = function (){
	return this.event().x;
};

/*
	Return the y/top coordinate of the mouse / pointer for this event
	@return {Number} y coordinate of mouse / pointer for event
	*/

Imba.Event.prototype.y = function (){
	return this.event().y;
};

/*
	Returns a Number representing a system and implementation
	dependent numeric code identifying the unmodified value of the
	pressed key; this is usually the same as keyCode.

	For mouse-events, the returned value indicates which button was
	pressed on the mouse to trigger the event.

	@return {Number}
	*/

Imba.Event.prototype.which = function (){
	return this.event().which;
};



/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);
__webpack_require__(3);

/*

Manager for listening to and delegating events in Imba. A single instance
is always created by Imba (as `Imba.Events`), which handles and delegates all
events at the very root of the document. Imba does not capture all events
by default, so if you want to make sure exotic or custom DOMEvents are delegated
in Imba you will need to register them in `Imba.Events.register(myCustomEventName)`

@iname manager

*/

Imba.EventManager = function EventManager(node,pars){
	var self = this;
	if(!pars||pars.constructor !== Object) pars = {};
	var events = pars.events !== undefined ? pars.events : [];
	self._shimFocusEvents = true && window.netscape && node.onfocusin === undefined;
	self.setRoot(node);
	self.setListeners([]);
	self.setDelegators({});
	self.setDelegator(function(e) {
		self.delegate(e);
		return true;
	});
	
	for (let i = 0, items = iter$(events), len = items.length; i < len; i++) {
		self.register(items[i]);
	};
	
	return self;
};

Imba.EventManager.prototype.root = function(v){ return this._root; }
Imba.EventManager.prototype.setRoot = function(v){ this._root = v; return this; };
Imba.EventManager.prototype.count = function(v){ return this._count; }
Imba.EventManager.prototype.setCount = function(v){ this._count = v; return this; };
Imba.EventManager.prototype.__enabled = {'default': false,watch: 'enabledDidSet',name: 'enabled'};
Imba.EventManager.prototype.enabled = function(v){ return this._enabled; }
Imba.EventManager.prototype.setEnabled = function(v){
	var a = this.enabled();
	if(v != a) { this._enabled = v; }
	if(v != a) { this.enabledDidSet && this.enabledDidSet(v,a,this.__enabled) }
	return this;
}
Imba.EventManager.prototype._enabled = false;
Imba.EventManager.prototype.listeners = function(v){ return this._listeners; }
Imba.EventManager.prototype.setListeners = function(v){ this._listeners = v; return this; };
Imba.EventManager.prototype.delegators = function(v){ return this._delegators; }
Imba.EventManager.prototype.setDelegators = function(v){ this._delegators = v; return this; };
Imba.EventManager.prototype.delegator = function(v){ return this._delegator; }
Imba.EventManager.prototype.setDelegator = function(v){ this._delegator = v; return this; };

Imba.EventManager.prototype.enabledDidSet = function (bool){
	bool ? this.onenable() : this.ondisable();
	return this;
};

Imba.EventManager.activate = function (){
	var Imba_;
	if (Imba.Events) { return Imba.Events };
	
	if (true) {
		Imba.POINTER || (Imba.POINTER = new Imba.Pointer());
		
		Imba.Events = new Imba.EventManager(Imba.document(),{events: [
			'keydown','keyup','keypress',
			'textInput','input','change','submit',
			'focusin','focusout','focus','blur',
			'contextmenu','dblclick',
			'mousewheel','wheel','scroll',
			'beforecopy','copy',
			'beforepaste','paste',
			'beforecut','cut'
		]});
		
		// should listen to dragdrop events by default
		Imba.Events.register([
			'dragstart','drag','dragend',
			'dragenter','dragover','dragleave','dragexit','drop'
		]);
		
		var hasTouchEvents = window && window.ontouchstart !== undefined;
		
		if (hasTouchEvents) {
			Imba.Events.listen('touchstart',function(e) {
				return Imba.Touch.ontouchstart(e);
			});
			
			Imba.Events.listen('touchmove',function(e) {
				return Imba.Touch.ontouchmove(e);
			});
			
			Imba.Events.listen('touchend',function(e) {
				return Imba.Touch.ontouchend(e);
			});
			
			Imba.Events.listen('touchcancel',function(e) {
				return Imba.Touch.ontouchcancel(e);
			});
		};
		
		Imba.Events.register('click',function(e) {
			// Only for main mousebutton, no?
			if ((e.timeStamp - Imba.Touch.LastTimestamp) > Imba.Touch.TapTimeout) {
				e._imbaSimulatedTap = true;
				var tap = new Imba.Event(e);
				tap.setType('tap');
				tap.process();
				if (tap._responder) {
					return e.preventDefault();
				};
			};
			// delegate the real click event
			return Imba.Events.delegate(e);
		});
		
		Imba.Events.listen('mousedown',function(e) {
			if ((e.timeStamp - Imba.Touch.LastTimestamp) > Imba.Touch.TapTimeout) {
				if (Imba.POINTER) { return Imba.POINTER.update(e).process() };
			};
		});
		
		Imba.Events.listen('mouseup',function(e) {
			if ((e.timeStamp - Imba.Touch.LastTimestamp) > Imba.Touch.TapTimeout) {
				if (Imba.POINTER) { return Imba.POINTER.update(e).process() };
			};
		});
		
		Imba.Events.register(['mousedown','mouseup']);
		Imba.Events.setEnabled(true);
		return Imba.Events;
	};
};


/*

	Tell the current EventManager to intercept and handle event of a certain name.
	By default, Imba.Events will register interceptors for: *keydown*, *keyup*, 
	*keypress*, *textInput*, *input*, *change*, *submit*, *focusin*, *focusout*, 
	*blur*, *contextmenu*, *dblclick*, *mousewheel*, *wheel*

	*/

Imba.EventManager.prototype.register = function (name,handler){
	if(handler === undefined) handler = true;
	if (name instanceof Array) {
		for (let i = 0, items = iter$(name), len = items.length; i < len; i++) {
			this.register(items[i],handler);
		};
		return this;
	};
	
	if (this.delegators()[name]) { return this };
	// console.log("register for event {name}")
	var fn = this.delegators()[name] = (handler instanceof Function) ? handler : this.delegator();
	if (this.enabled()) { return this.root().addEventListener(name,fn,true) };
};

Imba.EventManager.prototype.listen = function (name,handler,capture){
	if(capture === undefined) capture = true;
	this.listeners().push([name,handler,capture]);
	if (this.enabled()) { this.root().addEventListener(name,handler,capture) };
	return this;
};

Imba.EventManager.prototype.delegate = function (e){
	var event = Imba.Event.wrap(e);
	event.process();
	if (this._shimFocusEvents) {
		if (e.type == 'focus') {
			Imba.Event.wrap(e).setType('focusin').process();
		} else if (e.type == 'blur') {
			Imba.Event.wrap(e).setType('focusout').process();
		};
	};
	return this;
};

/*

	Create a new Imba.Event

	*/

Imba.EventManager.prototype.create = function (type,target,pars){
	if(!pars||pars.constructor !== Object) pars = {};
	var data = pars.data !== undefined ? pars.data : null;
	var source = pars.source !== undefined ? pars.source : null;
	var event = Imba.Event.wrap({type: type,target: target});
	if (data) { (event.setData(data),data) };
	if (source) { (event.setSource(source),source) };
	return event;
};

/*

	Trigger / process an Imba.Event.

	*/

Imba.EventManager.prototype.trigger = function (){
	return this.create.apply(this,arguments).process();
};

Imba.EventManager.prototype.onenable = function (){
	for (let o = this.delegators(), handler, i = 0, keys = Object.keys(o), l = keys.length, name; i < l; i++){
		name = keys[i];handler = o[name];this.root().addEventListener(name,handler,true);
	};
	
	for (let i = 0, items = iter$(this.listeners()), len = items.length, item; i < len; i++) {
		item = items[i];
		this.root().addEventListener(item[0],item[1],item[2]);
	};
	
	window.addEventListener('hashchange',Imba.commit);
	return this;
};

Imba.EventManager.prototype.ondisable = function (){
	for (let o = this.delegators(), handler, i = 0, keys = Object.keys(o), l = keys.length, name; i < l; i++){
		name = keys[i];handler = o[name];this.root().removeEventListener(name,handler,true);
	};
	
	for (let i = 0, items = iter$(this.listeners()), len = items.length, item; i < len; i++) {
		item = items[i];
		this.root().removeEventListener(item[0],item[1],item[2]);
	};
	
	window.removeEventListener('hashchange',Imba.commit);
	return this;
};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
// externs;

var Imba = __webpack_require__(1);

function removeNested(root,node,caret){
	// if node/nodes isa String
	// 	we need to use the caret to remove elements
	// 	for now we will simply not support this
	if (node instanceof Array) {
		for (let i = 0, items = iter$(node), len = items.length; i < len; i++) {
			removeNested(root,items[i],caret);
		};
	} else if (node && node._dom) {
		root.removeChild(node);
	} else if (node != null) {
		// what if this is not null?!?!?
		// take a chance and remove a text-elementng
		let next = caret ? caret.nextSibling : root._dom.firstChild;
		if ((next instanceof Text) && next.textContent == node) {
			root.removeChild(next);
		} else {
			throw 'cannot remove string';
		};
	};
	
	return caret;
};

function appendNested(root,node){
	if (node instanceof Array) {
		let i = 0;
		let c = node.taglen;
		let k = (c != null) ? ((node.domlen = c)) : node.length;
		while (i < k){
			appendNested(root,node[i++]);
		};
	} else if (node && node._dom) {
		root.appendChild(node);
	} else if (node != null && node !== false) {
		root.appendChild(Imba.createTextNode(node));
	};
	
	return;
};


// insert nodes before a certain node
// does not need to return any tail, as before
// will still be correct there
// before must be an actual domnode
function insertNestedBefore(root,node,before){
	if (node instanceof Array) {
		let i = 0;
		let c = node.taglen;
		let k = (c != null) ? ((node.domlen = c)) : node.length;
		while (i < k){
			insertNestedBefore(root,node[i++],before);
		};
	} else if (node && node._dom) {
		root.insertBefore(node,before);
	} else if (node != null && node !== false) {
		root.insertBefore(Imba.createTextNode(node),before);
	};
	
	return before;
};

// after must be an actual domnode
function insertNestedAfter(root,node,after){
	var before = after ? after.nextSibling : root._dom.firstChild;
	
	if (before) {
		insertNestedBefore(root,node,before);
		return before.previousSibling;
	} else {
		appendNested(root,node);
		return root._dom.lastChild;
	};
};

function reconcileCollectionChanges(root,new$,old,caret){
	
	var newLen = new$.length;
	var lastNew = new$[newLen - 1];
	
	// This re-order algorithm is based on the following principle:
	// 
	// We build a "chain" which shows which items are already sorted.
	// If we're going from [1, 2, 3] -> [2, 1, 3], the tree looks like:
	//
	// 	3 ->  0 (idx)
	// 	2 -> -1 (idx)
	// 	1 -> -1 (idx)
	//
	// This tells us that we have two chains of ordered items:
	// 
	// 	(1, 3) and (2)
	// 
	// The optimal re-ordering then becomes to keep the longest chain intact,
	// and move all the other items.
	
	var newPosition = [];
	
	// The tree/graph itself
	var prevChain = [];
	// The length of the chain
	var lengthChain = [];
	
	// Keep track of the longest chain
	var maxChainLength = 0;
	var maxChainEnd = 0;
	
	var hasTextNodes = false;
	var newPos;
	
	for (let idx = 0, items = iter$(old), len = items.length, node; idx < len; idx++) {
		// special case for Text nodes
		node = items[idx];
		if (node && node.nodeType == 3) {
			newPos = new$.indexOf(node.textContent);
			if (newPos >= 0) { new$[newPos] = node };
			hasTextNodes = true;
		} else {
			newPos = new$.indexOf(node);
		};
		
		newPosition.push(newPos);
		
		if (newPos == -1) {
			root.removeChild(node);
			prevChain.push(-1);
			lengthChain.push(-1);
			continue;
		};
		
		var prevIdx = newPosition.length - 2;
		
		// Build the chain:
		while (prevIdx >= 0){
			if (newPosition[prevIdx] == -1) {
				prevIdx--;
			} else if (newPos > newPosition[prevIdx]) {
				// Yay, we're bigger than the previous!
				break;
			} else {
				// Nope, let's walk back the chain
				prevIdx = prevChain[prevIdx];
			};
		};
		
		prevChain.push(prevIdx);
		
		var currLength = (prevIdx == -1) ? 0 : (lengthChain[prevIdx] + 1);
		
		if (currLength > maxChainLength) {
			maxChainLength = currLength;
			maxChainEnd = idx;
		};
		
		lengthChain.push(currLength);
	};
	
	var stickyNodes = [];
	
	// Now we can walk the longest chain backwards and mark them as "sticky",
	// which implies that they should not be moved
	var cursor = newPosition.length - 1;
	while (cursor >= 0){
		if (cursor == maxChainEnd && newPosition[cursor] != -1) {
			stickyNodes[newPosition[cursor]] = true;
			maxChainEnd = prevChain[maxChainEnd];
		};
		
		cursor -= 1;
	};
	
	// possible to do this in reversed order instead?
	for (let idx = 0, items = iter$(new$), len = items.length, node; idx < len; idx++) {
		node = items[idx];
		if (!stickyNodes[idx]) {
			// create textnode for string, and update the array
			if (!(node && node._dom)) {
				node = new$[idx] = Imba.createTextNode(node);
			};
			
			var after = new$[idx - 1];
			insertNestedAfter(root,node,(after && after._dom || after || caret));
		};
		
		caret = node._dom || (caret && caret.nextSibling || root._dom.firstChild);
	};
	
	// should trust that the last item in new list is the caret
	return lastNew && lastNew._dom || caret;
};


// expects a flat non-sparse array of nodes in both new and old, always
function reconcileCollection(root,new$,old,caret){
	var k = new$.length;
	var i = k;
	var last = new$[k - 1];
	
	
	if (k == old.length && new$[0] === old[0]) {
		// running through to compare
		while (i--){
			if (new$[i] !== old[i]) { break; };
		};
	};
	
	if (i == -1) {
		return last && last._dom || last || caret;
	} else {
		return reconcileCollectionChanges(root,new$,old,caret);
	};
};

// TYPE 5 - we know that we are dealing with a single array of
// keyed tags - and root has no other children
function reconcileLoop(root,new$,old,caret){
	var nl = new$.length;
	var ol = old.length;
	var cl = new$.cache.i$; // cache-length
	var i = 0,d = nl - ol;
	
	// find the first index that is different
	while (i < ol && i < nl && new$[i] === old[i]){
		i++;
	};
	
	// conditionally prune cache
	if (cl > 1000 && (cl - nl) > 500) {
		new$.cache.$prune(new$);
	};
	
	if (d > 0 && i == ol) {
		// added at end
		while (i < nl){
			root.appendChild(new$[i++]);
		};
		return;
	} else if (d > 0) {
		let i1 = nl;
		while (i1 > i && new$[i1 - 1] === old[i1 - 1 - d]){
			i1--;
		};
		
		if (d == (i1 - i)) {
			// console.log "added in chunk",i,i1
			let before = old[i]._dom;
			while (i < i1){
				root.insertBefore(new$[i++],before);
			};
			return;
		};
	} else if (d < 0 && i == nl) {
		// removed at end
		while (i < ol){
			root.removeChild(old[i++]);
		};
		return;
	} else if (d < 0) {
		let i1 = ol;
		while (i1 > i && new$[i1 - 1 + d] === old[i1 - 1]){
			i1--;
		};
		
		if (d == (i - i1)) {
			while (i < i1){
				root.removeChild(old[i++]);
			};
			return;
		};
	} else if (i == nl) {
		return;
	};
	
	return reconcileCollectionChanges(root,new$,old,caret);
};

// expects a flat non-sparse array of nodes in both new and old, always
function reconcileIndexedArray(root,array,old,caret){
	var newLen = array.taglen;
	var prevLen = array.domlen || 0;
	var last = newLen ? array[newLen - 1] : null;
	// console.log "reconcile optimized array(!)",caret,newLen,prevLen,array
	
	if (prevLen > newLen) {
		while (prevLen > newLen){
			var item = array[--prevLen];
			root.removeChild(item._dom);
		};
	} else if (newLen > prevLen) {
		// find the item to insert before
		let prevLast = prevLen ? array[prevLen - 1]._dom : caret;
		let before = prevLast ? prevLast.nextSibling : root._dom.firstChild;
		
		while (prevLen < newLen){
			let node = array[prevLen++];
			before ? root.insertBefore(node._dom,before) : root.appendChild(node._dom);
		};
	};
	
	array.domlen = newLen;
	return last ? last._dom : caret;
};


// the general reconciler that respects conditions etc
// caret is the current node we want to insert things after
function reconcileNested(root,new$,old,caret){
	
	// var skipnew = new == null or new === false or new === true
	var newIsNull = new$ == null || new$ === false;
	var oldIsNull = old == null || old === false;
	
	
	if (new$ === old) {
		// remember that the caret must be an actual dom element
		// we should instead move the actual caret? - trust
		if (newIsNull) {
			return caret;
		} else if (new$._dom) {
			return new$._dom;
		} else if ((new$ instanceof Array) && new$.taglen != null) {
			return reconcileIndexedArray(root,new$,old,caret);
		} else {
			return caret ? caret.nextSibling : root._dom.firstChild;
		};
	} else if (new$ instanceof Array) {
		if (old instanceof Array) {
			// look for slot instead?
			let typ = new$.static;
			if (typ || old.static) {
				// if the static is not nested - we could get a hint from compiler
				// and just skip it
				if (typ == old.static) { // should also include a reference?
					for (let i = 0, items = iter$(new$), len = items.length; i < len; i++) {
						// this is where we could do the triple equal directly
						caret = reconcileNested(root,items[i],old[i],caret);
					};
					return caret;
				} else {
					removeNested(root,old,caret);
				};
				
				// if they are not the same we continue through to the default
			} else {
				// Could use optimized loop if we know that it only consists of nodes
				return reconcileCollection(root,new$,old,caret);
			};
		} else if (!(oldIsNull)) {
			if (old._dom) {
				root.removeChild(old);
			} else {
				// old was a string-like object?
				root.removeChild(caret ? caret.nextSibling : root._dom.firstChild);
			};
		};
		
		return insertNestedAfter(root,new$,caret);
		// remove old
	} else if (!(newIsNull) && new$._dom) {
		if (!(oldIsNull)) { removeNested(root,old,caret) };
		return insertNestedAfter(root,new$,caret);
	} else if (newIsNull) {
		if (!(oldIsNull)) { removeNested(root,old,caret) };
		return caret;
	} else {
		// if old did not exist we need to add a new directly
		let nextNode;
		// if old was array or imbatag we need to remove it and then add
		if (old instanceof Array) {
			removeNested(root,old,caret);
		} else if (old && old._dom) {
			root.removeChild(old);
		} else if (!(oldIsNull)) {
			// ...
			nextNode = caret ? caret.nextSibling : root._dom.firstChild;
			if ((nextNode instanceof Text) && nextNode.textContent != new$) {
				nextNode.textContent = new$;
				return nextNode;
			};
		};
		
		// now add the textnode
		return insertNestedAfter(root,new$,caret);
	};
};


Imba.extendTag('element', function(tag){
	
	// 1 - static shape - unknown content
	// 2 - static shape and static children
	// 3 - single item
	// 4 - optimized array - only length will change
	// 5 - optimized collection
	// 6 - text only
	
	tag.prototype.setChildren = function (new$,typ){
		// if typeof new == 'string'
		// 	return self.text = new
		var old = this._tree_;
		
		if (new$ === old && new$ && new$.taglen == undefined) {
			return this;
		};
		
		if (!(old) && typ != 3) {
			this.removeAllChildren();
			appendNested(this,new$);
		} else if (typ == 1) {
			let caret = null;
			for (let i = 0, items = iter$(new$), len = items.length; i < len; i++) {
				caret = reconcileNested(this,items[i],old[i],caret);
			};
		} else if (typ == 2) {
			return this;
		} else if (typ == 3) {
			let ntyp = typeof new$;
			
			if (new$ && new$._dom) {
				this.removeAllChildren();
				this.appendChild(new$);
			} else if (new$ instanceof Array) {
				if (new$._type == 5 && old && old._type == 5) {
					reconcileLoop(this,new$,old,null);
				} else if (old instanceof Array) {
					reconcileNested(this,new$,old,null);
				} else {
					this.removeAllChildren();
					appendNested(this,new$);
				};
			} else {
				this.setText(new$);
				return this;
			};
		} else if (typ == 4) {
			reconcileIndexedArray(this,new$,old,null);
		} else if (typ == 5) {
			reconcileLoop(this,new$,old,null);
		} else if ((new$ instanceof Array) && (old instanceof Array)) {
			reconcileNested(this,new$,old,null);
		} else {
			// what if text?
			this.removeAllChildren();
			appendNested(this,new$);
		};
		
		this._tree_ = new$;
		return this;
	};
	
	tag.prototype.content = function (){
		return this._content || this.children().toArray();
	};
	
	tag.prototype.setText = function (text){
		if (text != this._tree_) {
			var val = (text === null || text === false) ? '' : text;
			(this._text_ || this._dom).textContent = val;
			this._text_ || (this._text_ = this._dom.firstChild);
			this._tree_ = text;
		};
		return this;
	};
});

// alias setContent to setChildren
var proto = Imba.Tag.prototype;
proto.setContent = proto.setChildren;

// optimization for setText
var apple = typeof navigator != 'undefined' && (navigator.vendor || '').indexOf('Apple') == 0;
if (apple) {
	proto.setText = function (text){
		if (text != this._tree_) {
			this._dom.textContent = ((text === null || text === false) ? '' : text);
			this._tree_ = text;
		};
		return this;
	};
};


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
var Router = __webpack_require__(18).Router;

function Doc(src,app){
	this._src = src;
	this._path = src.replace(/\.md$/,'');
	this._app = app;
	this._ready = false;
	this.fetch();
	this;
};

exports.Doc = Doc; // export class 
Doc.prototype.path = function(v){ return this._path; }
Doc.prototype.setPath = function(v){ this._path = v; return this; };
Doc.prototype.src = function(v){ return this._src; }
Doc.prototype.setSrc = function(v){ this._src = v; return this; };
Doc.prototype.data = function(v){ return this._data; }
Doc.prototype.setData = function(v){ this._data = v; return this; };

Doc.prototype.ready = function (){
	return this._ready;
};

Doc.prototype.fetch = function (){
	var self = this;
	return self._promise || (self._promise = self._app.fetch(self.src()).then(function(res) {
		return self.load(res);
	}));
};

Doc.prototype.load = function (doc){
	this._data = doc;
	this._meta = doc.meta || {};
	this._ready = true;
	Imba.commit();
	return this;
};

Doc.prototype.title = function (){
	return this._data.title || 'path';
};

Doc.prototype.toc = function (){
	return this._data && this._data.toc[0];
};

Doc.prototype.body = function (){
	return this._data && this._data.body;
};


var Cache = exports.Cache = {};
var requests = {};

function App(cache){
	if(cache === undefined) cache = {};
	this._cache = cache;
	this._docs = {};
	if (true) {
		this._loc = document.location;
	};
	
	if (this._cache.guide) {
		this._guide = JSON.parse(JSON.stringify(this._cache.guide));
		// for item,i in @guide
		// 	@guide[item:id] = item
		// 	item:next = @guide[i + 1]
		// 	item:prev = @guide[i - 1]
	};
	this;
};

exports.App = App; // export class 
App.prototype.req = function(v){ return this._req; }
App.prototype.setReq = function(v){ this._req = v; return this; };
App.prototype.cache = function(v){ return this._cache; }
App.prototype.setCache = function(v){ this._cache = v; return this; };
App.prototype.issues = function(v){ return this._issues; }
App.prototype.setIssues = function(v){ this._issues = v; return this; };

App.deserialize = function (data){
	if(data === undefined) data = '{}';
	return new this(JSON.parse(data.replace(/§§SCRIPT§§/g,"script")));
};

App.prototype.reset = function (){
	this.setCache({});
	return this;
};

App.prototype.router = function (){
	return this._router || (this._router = new Router(this));
};

App.prototype.path = function (){
	return true && this._loc.pathname;
};

App.prototype.hash = function (){
	return true && this._loc.hash.substr(1);
};

App.prototype.doc = function (src){
	return this._docs[src] || (this._docs[src] = new Doc(src,this));
};

App.prototype.guide = function (){
	return this._guide || (this._guide = this._cache.guide); // .map do ||
};

App.prototype.serialize = function (){
	return JSON.stringify(this.cache()).replace(/\bscript/g,"§§SCRIPT§§");
};

if (false) {};

if (true) {
	App.prototype.fetch = function (src){
		var self = this;
		if (self.cache()[src]) {
			return Promise.resolve(self.cache()[src]);
		};
		
		return requests[src] || (requests[src] = new Promise(async function(resolve) {
			var req = await window.fetch(src);
			var resp = await req.json();
			return resolve(self.cache()[src] = resp);
		}));
	};
};

App.prototype.fetchDocument = function (src,cb){
	var self = this;
	var res = self.deps()[src];
	console.log("no longer?");
	
	if (false) {} else {
		// should guard against multiple loads
		if (res) {
			cb && cb(res);
			return {then: function(v) { return v(res); }}; // fake promise hack
		};
		
		var xhr = new XMLHttpRequest();
		xhr.addEventListener('load',function(res) {
			res = self.deps()[src] = JSON.parse(xhr.responseText);
			return cb && cb(res);
		});
		xhr.open("GET",src);
		xhr.send();
	};
	
	return self;
};

App.prototype.issues = function (){
	return this._issues || (this._issues = Doc.get('/issues/all','json'));
};



/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
// externs;

function Router(app){
	var self = this;
	self._app = app;
	
	if (true) {
		window.onpopstate = function(e) {
			return self.refresh();
		};
	};
	
	self;
};

exports.Router = Router; // export class 
Router.prototype.path = function(v){ return this._path; }
Router.prototype.setPath = function(v){ this._path = v; return this; };

Router.slug = function (str){
	str = str.replace(/^\s+|\s+$/g,'').toLowerCase(); // trim
	
	var from = "àáäâåèéëêìíïîòóöôùúüûñç·/_,:;";
	var to = "aaaaaeeeeiiiioooouuuunc------";
	str = str.replace(/[^a-z0-9 -]/g,''); // remove invalid chars
	str = str.replace(/\s+/g,'-'); // collapse whitespace and replace by -
	str = str.replace(/-+/g,'-'); // collapse dashes
	
	return str;
};

Router.prototype.refresh = function (){
	if (true) {
		document.body.setAttribute('data-route',this.segment(0));
		Imba.commit();
	};
	return this;
};

Router.prototype.path = function (){
	return this._app.path();
};

Router.prototype.hash = function (){
	return this._app.hash();
};

Router.prototype.ext = function (){
	var path = this.path();
	var m = path.match(/\.([^\/]+)$/);
	return m && m[1] || '';
};

Router.prototype.segment = function (nr){
	if(nr === undefined) nr = 0;
	return this.path().split('/')[nr + 1] || '';
};

Router.prototype.go = function (href,state,replace){
	if(state === undefined) state = {};
	if(replace === undefined) replace = false;
	if (href == '/install') {
		// redirects here
		href = '/guides#toc-installation';
	};
	
	if (replace) {
		history.replaceState(state,null,href);
		this.refresh();
	} else {
		history.pushState(state,null,href);
		this.refresh();
		// ga('send', 'pageview', href)
	};
	
	if (!href.match(/\#/)) {
		window.scrollTo(0,0);
	};
	
	return this;
};

Router.prototype.scoped = function (reg,part){
	var path = this.path() + '#' + this.hash();
	if ((typeof reg=='string'||reg instanceof String)) {
		var nxt = path[reg.length];
		return path.substr(0,reg.length) == reg && (!(nxt) || nxt == '-' || nxt == '/' || nxt == '#' || nxt == '?' || nxt == '_');
	} else if (reg instanceof RegExp) {
		var m = path.match(reg);
		return (part && m) ? m[part] : m;
	} else {
		return false;
	};
};

Router.prototype.match = function (reg,part){
	var path = this.path() + '#' + this.hash();
	
	if ((typeof reg=='string'||reg instanceof String)) {
		return path == reg;
	} else if (reg instanceof RegExp) {
		var m = path.match(reg);
		return (part && m) ? m[part] : m;
	} else {
		return false;
	};
};

Imba.extendTag('element', function(tag){
	tag.prototype.route = function(v){ return this.getAttribute('route'); }
	tag.prototype.setRoute = function(v){ this.setAttribute('route',v); return this; };
	
	tag.prototype.router = function (){
		return this.app().router();
	};
	
	tag.prototype.reroute = function (){
		var scoped = this.router().scoped(this.route(),this);
		this.flag('scoped',scoped);
		this.flag('selected',this.router().match(this.route(),this));
		if (scoped != this._scoped) {
			this._scoped = scoped;
			scoped ? this.didscope() : this.didunscope();
		};
		return this;
	};
	
	tag.prototype.didscope = function (){
		return this;
	};
	
	tag.prototype.didunscope = function (){
		return this;
	};
});

// extend links
Imba.extendTag('a', function(tag){
	
	tag.prototype.route = function (){
		return this._route || this.href();
	};
	
	tag.prototype.ontap = function (e){
		var m;
		var href = this.href().replace(/^http\:\/\/imba\.io/,'');
		
		if (e.event().metaKey || e.event().altKey) {
			e._responder = null;
			return e.stop();
		};
		
		if (m = href.match(/gist\.github\.com\/([^\/]+)\/([A-Za-z\d]+)/)) {
			console.log('gist!!',m[1],m[2]);
			Imba.getTagSingleton('gist').open(m[2]);
			return e.prevent().stop();
		};
		
		if (href[0] == '#' || href[0] == '/') {
			e.prevent().stop();
			this.router().go(href,{});
			Imba.Events.trigger('route',this);
		} else {
			e._responder = null;
			return e.stop();
		};
		return this;
	};
	
	tag.prototype.render = function (){
		if (true) this.reroute();
		return this;
	};
});


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var HomePage = __webpack_require__(20).HomePage;
var GuidesPage = __webpack_require__(25).GuidesPage;
var DocsPage = __webpack_require__(26).DocsPage;

Imba.extendTag('element', function(tag){
	
	tag.prototype.root = function (){
		return this._owner_ ? this._owner_.root() : this;
	};
	
	tag.prototype.app = function (){
		return this.root().app();
	};
});


var Site = Imba.defineTag('Site', function(tag){
	
	tag.prototype.app = function (){
		return this.data();
	};
	
	tag.prototype.root = function (){
		return this;
	};
	
	tag.prototype.router = function (){
		return this.app().router();
	};
	
	tag.prototype.load = function (){
		console.log("loading app.router");
		return new Promise(function(resolve) {
			console.log("Site#load");
			return setTimeout(resolve,200);
		});
	};
	
	tag.prototype.render = function (){
		var $ = this.$;
		console.log("render site",this.app().path());
		return this.$open(0).setChildren($.$ = $.$ || [
			_1('header',$,0,this).setId('header').setContent(
				$[1] || _1('nav',$,1,0).flag('content').setContent([
					_1('a',$,2,1).flag('tab').flag('logo').setHref('/home').setContent($[3] || _1('i',$,3,2).setText('imba'),2),
					_1('span',$,4,1).flag('greedy'),
					_1('a',$,5,1).flag('tab').flag('home').setHref('/home').setContent($[6] || _1('i',$,6,5).setText('home'),2),
					_1('a',$,7,1).flag('tab').flag('guides').setHref('/guide').setContent($[8] || _1('i',$,8,7).setText('learn'),2),
					_1('a',$,9,1).flag('tab').flag('docs').setHref('/docs').setContent($[10] || _1('i',$,10,9).setText('api'),2),
					_1('a',$,11,1).flag('twitter').setHref('http://twitter.com/imbajs').setContent($[12] || _1('i',$,12,11).setText('twitter'),2),
					_1('a',$,13,1).flag('github').setHref('https://github.com/somebee/imba').setContent($[14] || _1('i',$,14,13).setText('github'),2),
					_1('a',$,15,1).flag('issues').setHref('https://github.com/somebee/imba/issues').setContent($[16] || _1('i',$,16,15).setText('issues'),2),
					_1('a',$,17,1).flag('menu').on$(0,['tap','toggleMenu']).setContent($[18] || _1('b',$,18,17),2)
				],2)
			,2),
			
			_1('main',$,19,this),
			
			_1('footer',$,23,this).setId('footer').setContent([
				_1('hr',$,24,23),
				_1('div',$,25,23).flag('lft').setText("Imba © 2015-2018"),
				_1('div',$,26,23).flag('rgt').setContent([
					_1('a',$,27,26).setHref('http://twitter.com/imbajs').setText('Twitter'),
					_1('a',$,28,26).setHref('http://github.com/somebee/imba').setText('GitHub'),
					_1('a',$,29,26).setHref('http://github.com/somebee/imba/issues').setText('Issues'),
					_1('a',$,30,26).setHref('http://gitter.im/somebee/imba').setText('Chat')
				],2)
			],2)
		],2).synced((
			$[0].end((
				$[1].end((
					$[2].end(),
					$[5].end(),
					$[7].end(),
					$[9].end(),
					$[11].end(),
					$[13].end(),
					$[15].end(),
					$[17].end()
				,true))
			,true)),
			$[19].setContent(
				this.router().scoped('/home') ? (
					($[20] || _1(HomePage,$,20,19)).end()
				) : (this.router().scoped('/guide') ? (
					($[21] || _1(GuidesPage,$,21,19)).bindData(this.app(),'guide',[]).end()
				) : (this.router().scoped('/docs') ? (
					($[22] || _1(DocsPage,$,22,19)).end()
				) : void(0)))
			,3).end(),
			$[23].end((
				$[26].end()
			,true))
		,true));
	};
})
exports.Site = Site;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var Page = __webpack_require__(2).Page;

var Example = __webpack_require__(4).Example;
var Marked = __webpack_require__(21).Marked;
var Pattern = __webpack_require__(24).Pattern;


var HomePage = Imba.defineTag('HomePage', Page, function(tag){
	
	tag.prototype.render = function (){
		var $ = this.$, t0;
		return this.$open(0).setChildren($[0] || _1('div',$,0,this).flag('body').setContent([
			t0 = (t0=_1('div',$,1,0)).setId('hero').flag('dark').setContent(
				this._pattern = this._pattern||_1(Pattern,t0).flag('pattern')
			// <herosnippet.hero.dark src='/home/examples/hero.imba'>
			,2),
			_1('div',$,2,0).flag('content').setContent([
				_1(Marked,$,3,2).flag('section').flag('md').flag('welcome').flag('huge').flag('light').setText("# Create complex web apps with ease!\n\nImba is a new programming language for the web that compiles to highly \nperformant and readable JavaScript. It has language level support for defining, \nextending, subclassing, instantiating and rendering dom nodes. For a simple \napplication like TodoMVC, it is more than \n[10 times faster than React](http://somebee.github.io/todomvc-render-benchmark/index.html) \nwith less code, and a much smaller library.\n\n---\n\n- ## Imba.inspiration\n  Imba brings the best from Ruby, Python, and React (+ JSX) together in a clean language and runtime.\n\n- ## Imba.interoperability\n  Imba compiles down to clean and readable JavaScript. Use any JS library in Imba and vica-versa.\n\n- ## Imba.performance\n  Build your application views using Imba's native tags for unprecedented performance.\n"),
				
				// <Example.dark heading="Simple reminders" src='/home/examples/reminders.imba'>
				
				_1(Marked,$,4,2).flag('section').flag('md').setText("## Reusable components\n\nA custom tag / component can maintain internal state and control how to render itself.\nWith the performance of DOM reconciliation in Imba, you can use one-way declarative bindings,\neven for animations. Write all your views in a straight-forward linear fashion as if you could\nrerender your whole application on **every single** data/state change."),
				
				// <Example.dark heading="World clock" src='/home/examples/clock.imba'>
				
				_1(Marked,$,5,2).flag('section').flag('md').setText("## Extend native tags\n\nIn addition to defining custom tags, you can also extend native tags, or inherit from them.\nBinding to dom events is as simple as defining methods on your tags; all events will be\nefficiently delegated and handled by Imba. Let's define a simple sketchpad...")
			
			// <Example.dark heading="Custom canvas" src='/home/examples/canvas.imba'>
			],2)
		],2),2).synced((
			$[0].end((
				$[1].end((
					this._pattern.end()
				,true)),
				$[2].end((
					$[3].end(),
					$[4].end(),
					$[5].end()
				,true))
			,true))
		,true));
	};
})
exports.HomePage = HomePage;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
// define renderer
var marked = __webpack_require__(22);
var mdr = new (marked.Renderer)();

mdr.heading = function (text,lvl){
	return ("<h" + lvl + ">" + text + "</h" + lvl + ">");
};

var Marked = Imba.defineTag('Marked', function(tag){
	tag.prototype.renderer = function (){
		return this;
	};
	
	tag.prototype.setText = function (text){
		if (text != this._text) {
			this._text = text;
			this.dom().innerHTML = marked(text,{renderer: mdr});
		};
		return this;
	};
	
	tag.prototype.setContent = function (val,typ){
		this.setText(val,0);
		return this;
	};
})
exports.Marked = Marked;



/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {
'use strict';

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
  ('def', '\\n+(?=' + block.def.source + ')')
  ();

block.blockquote = replace(block.blockquote)
  ('def', block.def)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/,
  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top, bq) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3] || ''
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top, true);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false, bq);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: !this.options.sanitizer
          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
        text: cap[0]
      });
      continue;
    }

    // def
    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ <>]+(@|:\/)[^ <>]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^<'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)([\s\S]*?[^`])\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|\\[\[\]]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = escape(
          cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1])
        );
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this.inLink && (cap = this.rules.url.exec(src))) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      if (!this.inLink && /^<a /i.test(cap[0])) {
        this.inLink = true;
      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
        this.inLink = false;
      }
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? this.options.sanitizer
          ? this.options.sanitizer(cap[0])
          : escape(cap[0])
        : cap[0]
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this.inLink = true;
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out += this.outputLink(cap, link);
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2].trim(), true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.text(escape(this.smartypants(cap[0])));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/---/g, '\u2014')
    // en-dashes
    .replace(/--/g, '\u2013')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  if (!this.options.mangle) return text;
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return text;
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
      return text;
    }
  }
  if (this.options.baseUrl && !originIndependentUrl.test(href)) {
    href = resolveUrl(this.options.baseUrl, href);
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  if (this.options.baseUrl && !originIndependentUrl.test(href)) {
    href = resolveUrl(this.options.baseUrl, href);
  }
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

Renderer.prototype.text = function(text) {
  return text;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescape(html) {
	// explicitly match decimal, hex, and named HTML entities
  return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function resolveUrl(base, href) {
  if (!baseUrls[' ' + base]) {
    // we can ignore everything in base after the last slash of its path component,
    // but we might need to add _that_
    // https://tools.ietf.org/html/rfc3986#section-3
    if (/^[^:]+:\/*[^/]*$/.test(base)) {
      baseUrls[' ' + base] = base + '/';
    } else {
      baseUrls[' ' + base] = base.replace(/[^/]*$/, '');
    }
  }
  base = baseUrls[' ' + base];

  if (href.slice(0, 2) === '//') {
    return base.replace(/:[\s\S]*/, ':') + href;
  } else if (href.charAt(0) === '/') {
    return base.replace(/(:\/*[^/]*)[\s\S]*/, '$1') + href;
  } else {
    return base + href;
  }
}
var baseUrls = {};
var originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      var out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) return done(err);
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occurred:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  sanitizer: null,
  mangle: true,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer,
  xhtml: false,
  baseUrl: null
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (true) {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(23)))

/***/ }),
/* 23 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);
function shuffle(array){
	var counter = array.length,temp,index;
	
	// While there are elements in the array
	while (counter > 0){
		// Pick a random index
		index = Math.floor(Math.random() * counter);
		counter--; // Decrease counter by 1
		// And swap the last element with it
		temp = array[counter];
		array[counter] = array[index];
		array[index] = temp;
	};
	
	return array;
};

var Pattern = Imba.defineTag('Pattern', function(tag){
	
	tag.prototype.setup = function (){
		if (false) {};
		var parts = {tags: [],keywords: [],methods: []};
		var items = [];
		var lines = [];
		
		for (let o = Imba.Tag.prototype, v, i = 0, keys = Object.keys(o), l = keys.length, k; i < l; i++){
			k = keys[i];v = o[k];items.push(("<em>" + k + "</em>"));
			parts.methods.push(("<em>" + k + "</em>"));
		};
		
		for (let i = 0, ary = iter$(Imba.HTML_TAGS || HTML_TAGS), len = ary.length, k; i < len; i++) {
			k = ary[i];
			items.push(("<u>&lt;" + k + "&gt;</u>"));
			parts.tags.push(("<u>&lt;" + k + "&gt;</u>"));
		};
		
		var words = "def if else elif while until for in of var let class extend export import tag global";
		
		for (let i = 0, ary = iter$(words.split(" ")), len = ary.length, k; i < len; i++) {
			k = ary[i];
			items.push(("<i>" + k + "</i>"));
			parts.keywords.push(("<i>" + k + "</i>"));
		};
		
		var shuffled = shuffle(items);
		var all = [].concat(shuffled);
		var count = items.length - 1;
		
		for (let ln = 0; ln <= 14; ln++) {
			let chars = 0;
			lines[ln] = [];
			while (chars < 300){
				let item = (shuffled.pop() || all[Math.floor(count * Math.random())]);
				if (item) {
					chars += item.length;
					lines[ln].push(item);
				} else {
					chars = 400;
				};
			};
		};
		
		this.dom().innerHTML = '<div>' + lines.map(function(ln,i) {
			let o = Math.max(0,((i - 2) * 0.3 / 14)).toFixed(2);
			return ("<div class='line' style='opacity: " + o + ";'>") + ln.join(" ") + '</div>';
		}).join('') + '</div>';
		return this;
	};
})
exports.Pattern = Pattern;


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

function len$(a){
	return a && (a.len instanceof Function ? a.len() : a.length) || 0;
};
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0), _3 = Imba.createTagList, _2 = Imba.createTagMap, _4 = Imba.createTagLoopResult, _1 = Imba.createElement;
var Page = __webpack_require__(2).Page;
var Snippet = __webpack_require__(4).Snippet;

var GuideTOC = Imba.defineTag('GuideTOC', function(tag){
	tag.prototype.toc = function(v){ return this._toc; }
	tag.prototype.setToc = function(v){ this._toc = v; return this; };
	tag.prototype.level = function(v){ return this.getAttribute('level'); }
	tag.prototype.setLevel = function(v){ this.setAttribute('level',v); return this; };
	
	tag.prototype.toggle = function (){
		return this.toggleFlag('collapsed');
	};
	
	tag.prototype.toc = function (){
		return this._toc || this.data().toc();
	};
	
	tag.prototype.route = function (){
		return ("" + (this.data().path()) + "#" + (this.toc().slug));
	};
	
	tag.prototype.render = function (){
		var $ = this.$, self = this;
		if (!self.data().ready()) { return self };
		
		let toc = self.toc();
		self.reroute();
		
		return self.$open(0).flag('toc').flag('entry').setLevel((toc.level)).setChildren(
			(toc.children.length && toc.level < 3) ? Imba.static([
				($[0] || _1('div',$,0,self).flag('header').setContent(
					$[1] || _1('a',$,1,0)
				,2)).end((
					$[1].setHref(self.route()).setContent(toc.title,3).end()
				,true)),
				($[2] || _1('div',$,2,self).flag('content')).setContent(
					(function($0) {
						var $$ = $0.$iter();
						for (let i = 0, items = iter$(toc.children), len = items.length, child; i < len; i++) {
							child = items[i];
							if (child.level >= 3) { continue; };
							$$.push(($0[i] || _1(GuideTOC,$0,i)).bindData(self,'data',[]).setToc(child).end());
						};return $$;
					})($[3] || _2($,3,$[2]))
				,5).end()
			],2,1) : (
				($[4] || _1('a',$,4,self)).setHref(self.route()).setContent(toc.title,3).end()
			)
		,3).synced();
	};
});

var Guide = Imba.defineTag('Guide', function(tag){
	
	tag.prototype.setup = function (){
		this.render();
		this._body.dom().innerHTML = this.data().body;
		if (true) {
			this.awakenSnippets();
		};
		return this;
	};
	
	tag.prototype.render = function (){
		var $ = this.$, ref, ref1;
		return this.$open(0).flag('md').setChildren($.$ = $.$ || [
			this._body = this._body||_1('div',this).flag('body'),
			_1('footer',$,0,this)
		],2).synced((
			$[0].setContent([
				(ref = this.app().guide()[this.data().prev]) ? (
					($[1] || _1('a',$,1,0).flag('prev')).setHref(("/guide/" + (ref.id))).setText("← " + ref.title).end()
				) : void(0),
				(ref1 = this.app().guide()[this.data().next]) ? (
					($[2] || _1('a',$,2,0).flag('next')).setHref(("/guide/" + (ref1.id))).setContent(ref1.title + " →",3).end()
				) : void(0)
			],1).end()
		,true));
	};
	
	tag.prototype.awakenSnippets = function (){
		for (let i = 0, items = iter$(this.dom().querySelectorAll('.snippet')), len = items.length, item; i < len; i++) {
			item = items[i];
			let code = item.textContent;
			if (code.indexOf('Imba.mount') >= 0) {
				Snippet.replace(item);
			};
		};
		return this;
	};
});

var TOC = Imba.defineTag('TOC', 'li', function(tag){
	tag.prototype.toc = function(v){ return this._toc; }
	tag.prototype.setToc = function(v){ this._toc = v; return this; };
	tag.prototype.__expanded = {'default': true,name: 'expanded'};
	tag.prototype.expanded = function(v){ return this._expanded; }
	tag.prototype.setExpanded = function(v){ this._expanded = v; return this; }
	tag.prototype._expanded = true;
	tag.prototype.level = function(v){ return this.getAttribute('level'); }
	tag.prototype.setLevel = function(v){ this.setAttribute('level',v); return this; };
	
	tag.prototype.route = function (){
		return ("/guide/" + (this.data().route) + "#" + (this.toc().slug));
	};
	
	tag.prototype.toc = function (){
		return this._toc || this.data().toc[0];
	};
	
	tag.prototype.render = function (){
		var $ = this.$, self = this;
		return self.$open(0).flag('toc').flag('entry').setLevel((self.toc().level)).setChildren([
			($[0] || _1('a',$,0,self)).setHref(self.route()).setContent(self.toc().title,3).end(),
			(self.toc().children.length && self.toc().level < 2 && self.expanded()) ? (
				($[1] || _1('ul',$,1,self)).setContent((function($0) {
					var $$ = $0.$iter();
					for (let i = 0, items = iter$(self.toc().children), len = items.length, child; i < len; i++) {
						child = items[i];
						if (child.level >= 3) { continue; };
						$$.push(($0[i] || _1(TOC,$0,i)).bindData(self,'data',[]).setToc(child).end());
					};return $$;
				})($[2] || _2($,2,$[1])),5).end()
			) : void(0)
		],1).synced();
	};
});

var GuidesPage = Imba.defineTag('GuidesPage', Page, function(tag){
	
	tag.prototype.mount = function (){
		var self = this;
		self._onscroll || (self._onscroll = function() { return self.scrolled(); });
		return window.addEventListener('scroll',self._onscroll,{passive: true});
	};
	
	tag.prototype.unmount = function (){
		return window.removeEventListener('scroll',this._onscroll,{passive: true});
	};
	
	tag.prototype.guide = function (){
		return this.data()[this.router().path().replace('/guide/','')] || this.data()['essentials/introduction'];
	};
	
	tag.prototype.scrolled = function (){
		return this;
		
		var items = this.dom().querySelectorAll('[id]');
		var match;
		
		var scrollTop = window.pageYOffset;
		var wh = window.innerHeight;
		var dh = document.body.scrollHeight;
		
		if (this._scrollFreeze >= 0) {
			var diff = Math.abs(scrollTop - this._scrollFreeze);
			if (diff < 50) { return this };
			this._scrollFreeze = -1;
		};
		
		var scrollBottom = dh - (scrollTop + wh);
		
		if (scrollBottom == 0) {
			match = items[len$(items) - 1];
		} else {
			for (let i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
				item = ary[i];
				var t = (item.offsetTop + 30 + 60); // hack
				var dist = scrollTop - t;
				
				if (dist < 0) {
					match = item;break;
				};
			};
		};
		
		if (match) {
			if (this._hash != match.id) {
				this._hash = match.id;
				this.router().go('#' + this._hash,{},true);
				this.render();
			};
		};
		
		return this;
	};
	
	tag.prototype.onroute = function (e){
		var self = this;
		e.stop();
		self.log('guides routed');
		var scroll = function() {
			var el;
			if (el = self.dom().querySelector('#' + self.router().hash())) {
				el.scrollIntoView(true);
				self._scrollFreeze = window.pageYOffset;
				return el;
			};
			return false;
		};
		
		if (self.router().hash()) {
			// render
			scroll() || setTimeout(scroll,20);
		};
		
		return self;
	};
	// prop guide
	
	tag.prototype.render = function (){
		var $ = this.$, self = this, $1;
		let curr = self.guide();
		
		return self.$open(0).flag('_page').setChildren($.$ = $.$ || [
			self._nav = self._nav||_1('nav',self).flag('nav').setContent(
				$[0] || _1('div',$,0,self._nav).flag('content')
			,2),
			_1('div',$,3,self).flag('body').flag('light')
		],2).synced((
			self._nav.end((
				$[0].setContent(
					(function($0,$1,$$) {
						var t0;
						for (let i = 0, items = iter$(self.data().toc), len = items.length, item; i < len; i++) {
							item = items[i];
							$$.push(($0[i] || _1('h1',$0,i)).setContent(item.title || item.id,3).end());
							$$.push((t0 = $1[i] || (t0=_1('ul',$1,i))).setContent(
								(function($0) {
									for (let j = 0, ary = iter$(item.sections), len = $0.taglen = ary.length, section; j < len; j++) {
										section = ary[j];
										($0[j] || _1(TOC,$0,j)).bindData(self.data(),section).setExpanded((self.data()[section] == curr)).end();
									};return $0;
								})(t0.$['A'] || _3(t0.$,'A',$1[i]))
							,4).end());
						};return $$;
					})($[1] || _3($,1,$[0]),$[2] || _3($,2,$[0]),_4())
				// for guide in data
				//	<TOC[guide] toc=guide:toc[0] expanded=(guide == curr)>
				,5).end()
			,true)),
			$[3].setContent(
				self.guide() ? (
					($[($1 = '4$' + self.guide().id)] || _1(Guide,$,$1,3)).bindData(self,'guide',[]).end()
				) : void(0)
			,3).end()
		,true));
	};
})
exports.GuidesPage = GuidesPage;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0), _2 = Imba.createTagList, _3 = Imba.createTagMap, _1 = Imba.createElement;
var Page = __webpack_require__(2).Page;

function pathToAnchor(path){
	return 'api-' + path.replace(/\./g,'_').replace(/\#/g,'__').replace(/\=/g,'_set');
};

var Desc = Imba.defineTag('Desc', function(tag){
	
	tag.prototype.setHtml = function (html){
		if (html != this._html) {
			this.dom().innerHTML = this._html = html;
		};
		this;
		return this;
	};
});

var Ref = Imba.defineTag('Ref', function(tag){
	
	tag.prototype.render = function (){
		return this.$open(0).synced();
	};
});

var Item = Imba.defineTag('Item');

var Path = Imba.defineTag('Path', 'span', function(tag){
	tag.prototype.short = function(v){ return this._short; }
	tag.prototype.setShort = function(v){ this._short = v; return this; };
	
	tag.prototype.setup = function (){
		var items = [];
		var str = this.data();
		if ((typeof str=='string'||str instanceof String)) {
			if (this.short()) {
				str = str.replace(/([A-Z]\w*\.)*(?=[A-Z])/g,'');
			};
			
			this.setHtml(str.replace(/\b([\w]+|\.|\#)\b/g,function(m,i) {
				if (i == '.' || i == '#') {
					return ("<i>" + i + "</i>");
				} else if (i[0] == i[0].toUpperCase()) {
					return ("<b class='const'>" + i + "</b>");
				} else {
					return ("<b class='id'>" + i + "</b>");
				};
			}));
		};
		return this;
	};
});


var Return = Imba.defineTag('Return', function(tag){
	tag.prototype.name = function(v){ return this.getAttribute('name'); }
	tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren($.$ = $.$ || [
			_1(Path,$,0,this).flag('value'),
			_1('span',$,1,this).flag('desc')
		],2).synced((
			$[0].bindData(this.data(),'value').end(),
			$[1].setContent(this.data().desc,3).end()
		,true));
	};
});

var Class = Imba.defineTag('Class', Item, function(tag){
	
	tag.prototype.__data = {watch: 'parse',name: 'data'};
	tag.prototype.data = function(v){ return this._data; }
	tag.prototype.setData = function(v){
		var a = this.data();
		if(v != a) { this._data = v; }
		if(v != a) { this.parse && this.parse(v,a,this.__data) }
		return this;
	};
	
	tag.prototype.parse = function (){
		let res = [];
		for (let i = 0, items = iter$(this.data()['.']), len = items.length, m; i < len; i++) {
			m = items[i];
			if (!m.desc) { continue; };
			res.push(m);
		};
		this._statics = res;
		let res1 = [];
		for (let i = 0, items = iter$(this.data()['#']), len = items.length, m; i < len; i++) {
			m = items[i];
			if (!m.desc) { continue; };
			res1.push(m);
		};
		this._methods = res1;
		this._properties = [];
		return this;
	};
	
	tag.prototype.render = function (){
		var $ = this.$, self = this;
		return self.$open(0).setChildren([
			($[0] || _1('span',$,0,self).flag('toc-anchor')).setId(pathToAnchor(self.data().namepath)).end(),
			($[1] || _1('div',$,1,self).flag('header').setContent($[2] || _1('div',$,2,1).flag('title').setContent($[3] || _1(Path,$,3,2),2),2)).end((
				$[2].end((
					$[3].bindData(self.data(),'namepath').end()
				,true))
			,true)),
			($[4] || _1(Desc,$,4,self)).setHtml(self.data().html).end(),
			self.data().ctor ? (
				($[5] || _1('div',$,5,self).flag('content').flag('ctor').setContent(
					$[6] || _1(Method,$,6,5)
				,2)).end((
					$[6].bindData(self.data(),'ctor').setPath((self.data().namepath + '.new')).end()
				,true))
			) : void(0),
			
			($[7] || _1('div',$,7,self).flag('content')).setContent([
				(self._statics.length > 0) ? (
					($[8] || _1('div',$,8,7).flag('section').setContent([
						_1('h2',$,9,8).flag('header').setText('Static Methods'),
						_1('div',$,10,8).flag('content').flag('list')
					],2)).end((
						$[10].setContent((function($0) {
							for (let i = 0, items = iter$(self._statics), len = $0.taglen = items.length; i < len; i++) {
								($0[i] || _1(Method,$0,i).flag('doc')).setData(items[i]).setIname(self.data().namepath).end();
							};return $0;
						})($[11] || _2($,11,$[10])),4).end()
					,true))
				) : void(0),
				
				(self._methods.length > 0) ? (
					($[12] || _1('div',$,12,7).flag('section').setContent([
						_1('h2',$,13,12).flag('header').setText('Instance Methods'),
						_1('div',$,14,12).flag('content').flag('list')
					],2)).end((
						$[14].setContent((function($0) {
							for (let i = 0, items = iter$(self._methods), len = $0.taglen = items.length; i < len; i++) {
								($0[i] || _1(Method,$0,i).flag('doc')).setData(items[i]).setIname(self.data().iname).end();
							};return $0;
						})($[15] || _2($,15,$[14])),4).end()
					,true))
				) : void(0)
			],1).end()
		],1).synced();
	};
});

var Value = Imba.defineTag('Value', function(tag){
	
	tag.prototype.render = function (){
		var data_, $1;
		if (this.data().type) {
			this.$open(0).setFlag(-1,this.data().type).setChildren(
				this.data().value
			,3).synced();
		} else if ((typeof (data_ = this.data())=='string'||data_ instanceof String)) {
			this.$open(1).flag('str').setText(this.data()).synced();
		} else if ((typeof ($1 = this.data())=='number'||$1 instanceof Number)) {
			this.$open(2).flag('num').setText(this.data()).synced();
		};
		return this;
	};
});


var Param = Imba.defineTag('Param', function(tag){
	
	tag.prototype.type = function (){
		return this.data().type;
	};
	
	tag.prototype.render = function (){
		var self = this, $ = this.$;
		return self.$open(0).setFlag(-1,self.type()).setChildren(
			(self.type() == 'NamedParams') ? (
				(function($0) {
					for (let i = 0, items = iter$(self.data().nodes), len = $0.taglen = items.length; i < len; i++) {
						($0[i] || _1(Param,$0,i)).setData(items[i]).end();
					};return $0;
				})($[0] || _2($,0))
			) : Imba.static([
				($[1] || _1('div',$,1,self).flag('name')).setContent(self.data().name,3).end(),
				self.data().defaults ? Imba.static([
					($[2] || _1('i',$,2,self)).setContent((self.type() == 'NamedParam') ? ': ' : ' = ',3).end(),
					($[3] || _1(Value,$,3,self)).bindData(self.data(),'defaults').end()
				],2,1) : void(0)
			],1,2)
		,3).synced();
	};
});

var Method = Imba.defineTag('Method', Item, function(tag){
	
	tag.prototype.iname = function(v){ return this._iname; }
	tag.prototype.setIname = function(v){ this._iname = v; return this; };
	tag.prototype.path = function(v){ return this._path; }
	tag.prototype.setPath = function(v){ this._path = v; return this; };
	
	tag.prototype.tags = function (){
		let $ = this.$$ || (this.$$ = {}), t0;
		return (t0 = this._tags = this._tags||(t0=_1('div',this)).flag('tags')).setContent([
			this.data().return ? ((t0.$.A || _1(Return,t0.$,'A',t0).setName('returns')).bindData(this.data(),'return').end()) : void(0),
			
			this.data().deprecated ? (
				(t0.$.B || _1('div',t0.$,'B',t0).flag('deprecated').flag('red').setText('Method is deprecated'))
			) : void(0),
			this.data().private ? (
				(t0.$.C || _1('div',t0.$,'C',t0).flag('private').flag('red').setText('Method is private'))
			) : void(0)
		],1).end();
	};
	
	
	tag.prototype.path = function (){
		return this._path || (this.iname() + '.' + this.data().name);
	};
	
	tag.prototype.slug = function (){
		return pathToAnchor(this.data().namepath);
	};
	
	tag.prototype.render = function (){
		var $ = this.$, self = this;
		return self.$open(0).flagIf('deprecated',(self.data().deprecated)).setChildren([
			$[0] || _1('span',$,0,self).flag('toc-anchor'),
			$[1] || _1('div',$,1,self).flag('header').setContent([
				_1(Path,$,2,1),
				_1('div',$,3,1).flag('params'),
				_1('div',$,5,1).flag('grow')
			],2),
			$[6] || _1(Desc,$,6,self).flag('md'),
			self.tags()
		],1).synced((
			$[0].setId(self.slug()).end(),
			$[1].end((
				$[2].bindData(self,'path',[]).end(),
				$[3].setContent((function($0) {
					for (let i = 0, items = iter$(self.data().params), len = $0.taglen = items.length; i < len; i++) {
						($0[i] || _1(Param,$0,i)).setData(items[i]).end();
					};return $0;
				})($[4] || _2($,4,$[3])),4).end()
			,true)),
			$[6].setHtml(self.data().html).end()
		,true));
	};
});

var Link = Imba.defineTag('Link', 'a', function(tag){
	tag.prototype.short = function(v){ return this._short; }
	tag.prototype.setShort = function(v){ this._short = v; return this; };
	
	tag.prototype.render = function (){
		var $ = this.$;
		this.$open(0).setHref(("/docs#" + pathToAnchor(this.data().namepath))).setChildren($[0] || _1(Path,$,0,this),2).synced((
			$[0].bindData(this.data(),'namepath').setShort(this.short()).end()
		,true));
		return tag.__super__.render.apply(this,arguments);
	};
	
	tag.prototype.ontap = function (){
		tag.__super__.ontap.apply(this,arguments);
		return this.trigger('refocus');
	};
});

var Group = Imba.defineTag('Group', function(tag){
	
	tag.prototype.ontap = function (){
		return this.toggleFlag('collapsed');
	};
});


var DocsPage = Imba.defineTag('DocsPage', Page, function(tag){
	
	tag.prototype.__version = {'default': 'current',name: 'version'};
	tag.prototype.version = function(v){ return this._version; }
	tag.prototype.setVersion = function(v){ this._version = v; return this; }
	tag.prototype._version = 'current';
	tag.prototype.roots = function(v){ return this._roots; }
	tag.prototype.setRoots = function(v){ this._roots = v; return this; };
	
	tag.prototype.src = function (){
		return ("/api/" + this.version() + ".json");
	};
	
	tag.prototype.docs = function (){
		return this._docs;
	};
	
	tag.prototype.setup = function (){
		this.load();
		return tag.__super__.setup.apply(this,arguments);
	};
	
	tag.prototype.load = async function (){
		var docs = await this.app().fetch(this.src());
		DOCS = this._docs = JSON.parse(JSON.stringify(docs));
		DOCMAP = this._docs.entities;
		this.generate();
		if (true) {
			return this.loaded();
		};
	};
	
	tag.prototype.loaded = function (){
		var el;
		this.render();
		if (document.location.hash) {
			if (el = this.dom().querySelector(document.location.hash)) {
				el.scrollIntoView();
			};
		};
		return this;
	};
	
	tag.prototype.onrefocus = function (e){
		return this.refocus();
	};
	
	tag.prototype.refocus = function (){
		var el;
		if (el = this.dom().querySelector(document.location.hash)) {
			el.scrollIntoView();
		};
		return this;
	};
	
	tag.prototype.lookup = function (path){
		return this.docs().entities[path];
	};
	
	tag.prototype.generate = function (){
		this._roots = [];
		var ents = this._docs.entities;
		
		for (let o = this.docs().entities, item, i = 0, keys = Object.keys(o), l = keys.length, path; i < l; i++){
			path = keys[i];item = o[path];if (item.type == 'class' || path == 'Imba') {
				item['.'] = (item['.'] || []).sort().map(function(path) { return ents[path]; }).filter(function(v) { return v.type == 'method' && v.desc; });
				item['#'] = (item['#'] || []).sort().map(function(path) { return ents[path]; }).filter(function(v) { return v.type == 'method' && v.desc; });
				
				if (item.desc) { this._roots.push(item) };
			};
		};
		return this;
	};
	
	tag.prototype.render = function (){
		var $ = this.$, self = this;
		if (!(self.docs())) { return self };
		
		return self.$open(0).setChildren($.$ = $.$ || [
			self._nav = self._nav||_1('nav',self).flag('nav').setContent($[0] || _1('div',$,0,self._nav).flag('content'),2),
			_1('div',$,2,self).flag('body')
		],2).synced((
			self._nav.end((
				$[0].setContent(
					(function($0) {
						var t0;
						for (let i = 0, items = iter$(self.roots()), len = $0.taglen = items.length, root; i < len; i++) {
							root = items[i];
							(t0 = $0[i] || (t0=_1(Group,$0,i)).flag('toc').flag('class').flag('section').flag('compact').setContent([
								_1('div',t0.$,'A',t0).flag('header').setContent(t0.$.B || _1(Link,t0.$,'B','A').flag('class'),2),
								_1('div',t0.$,'C',t0).flag('content').setContent([
									_1('div',t0.$,'D','C').flag('static'),
									_1('div',t0.$,'F','C').flag('instance')
								],2)
							],2)).end((
								t0.$.A.end((
									t0.$.B.setData(root).end()
								,true)),
								t0.$.C.end((
									t0.$.D.setContent(
										(function($0) {
											var t1, $$ = $0.$iter();
											for (let j = 0, ary = iter$(root['.']), len = ary.length, meth; j < len; j++) {
												meth = ary[j];
												if (!(meth.desc && !meth.private)) { continue; };
												$$.push((t1 = $0[j] || (t1=_1('div',$0,j)).flag('entry').setContent(t1.$.A || _1(Link,t1.$,'A',t1).setShort(true),2)).end((
													t1.$.A.setData(meth).end()
												,true)));
											};return $$;
										})(t0.$['E'] || _3(t0.$,'E',t0.$.D))
									,5).end(),
									t0.$.F.setContent(
										(function($0) {
											var t1, $$ = $0.$iter();
											for (let j = 0, ary = iter$(root['#']), len = ary.length, meth; j < len; j++) {
												meth = ary[j];
												if (!(meth.desc && !meth.private)) { continue; };
												$$.push((t1 = $0[j] || (t1=_1('div',$0,j)).flag('entry').setContent(t1.$.A || _1(Link,t1.$,'A',t1).setShort(true),2)).end((
													t1.$.A.setData(meth).end()
												,true)));
											};return $$;
										})(t0.$['G'] || _3(t0.$,'G',t0.$.F))
									,5).end()
								,true))
							,true));
						};return $0;
					})($[1] || _2($,1,$[0]))
				,4).end()
			,true)),
			$[2].setContent(
				(function($0) {
					for (let i = 0, items = iter$(self.roots()), len = $0.taglen = items.length; i < len; i++) {
						($0[i] || _1(Class,$0,i).flag('doc').flag('l')).setData(items[i]).end();
					};return $0;
				})($[3] || _2($,3,$[2]))
			,4).end()
		,true));
	};
})
exports.DocsPage = DocsPage;


/***/ }),
/* 27 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgM2FkZjk2NjA3Njc3ODdkY2E2ZjQiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvaW1iYS5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2ltYmEuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvUGFnZS5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9wb2ludGVyLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1NuaXBwZXQuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvY2xpZW50LmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvaW5kZXguaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9zY2hlZHVsZXIuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vaW5kZXguaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vbWFuYWdlci5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS90YWcuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vaHRtbC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS90b3VjaC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC1tYW5hZ2VyLmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvZG9tL3JlY29uY2lsZXIuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvcm91dGVyLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1NpdGUuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvSG9tZVBhZ2UuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvTWFya2VkLmltYmEiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL21hcmtlZC9saWIvbWFya2VkLmpzIiwid2VicGFjazovLy8od2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1BhdHRlcm4uaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvR3VpZGVzUGFnZS5pbWJhIiwid2VicGFjazovLy8uL3NyYy92aWV3cy9Eb2NzUGFnZS5pbWJhIiwid2VicGFjazovLy8uL2xlc3Mvc2l0ZS5sZXNzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztBQzdEQSxPQUFPLFFBQVE7Ozs7Ozs7Ozs7OztJQ0lYLEtBQUs7Ozs7Ozs7Ozs7QUFTVDtRQUNDO0VBQ0M7U0FDQSxLQUFLO0dBRk87Ozs7Ozs7Ozs7O0FBV2Q7UUFDQyxZQUFZLE1BQU07Ozs7Ozs7QUFLbkI7UUFDQyxjQUFjOzs7Ozs7O0FBS2Y7UUFDQyxhQUFhOzs7O0FBR2Q7Q0FDQzs7YUFDWSxJQUFHLElBQUksZUFBZSxNQUFqQyxJQUFJLEdBQUcsRUFBRTs7O0NBRVYsSUFBSSxVQUFVLEVBQUUsT0FBTyxPQUFPLElBQUk7Q0FDbEMsSUFBSSxVQUFVLEVBQUUsSUFBSSxVQUFVLFVBQVUsRUFBRSxJQUFJO0NB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QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QjtBQUM5QjtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsRUFBRTtBQUNuQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFFBQVEsT0FBTztBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsaUJBQWlCLDhCQUE4QjtBQUMvQyxpQkFBaUI7QUFDakI7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S0FBSyxZQUFZLEdBQUksRUFBRTtJQUMvRixVQUFVLEdBQUcsVUFBVSxPQUFPLE9BQUssNEJBQVcsS0FBSyxVQUFRLDRCQUFXLEVBQUUsS0FBSyxZQUFZLEdBQUksRUFBRTs7SUFFN0UsSUFBRyxLQUFLLGFBQTFCLE9BQU8sS0FBSzs7Ozs7O0NBR2Y7O0VBQ2EsTUFBTzs7O1FBR2Qsd0ZBQU87c0JBV1Y7O1FBWEc7Ozs7TUFDSCw4QkFBWTs7MENBQ0wsWUFBSSxjQUFNLGdCQUFROzhCQUN0QiwwREFBb0I7OEJBQ3BCO2dDQUNDO2dDQUdBOzs7Ozs7Ozs7O1dBRkEsNEJBQVk7O2tCQUFlLEtBQUssS0FBSyxJQUFLLEtBQUs7dURBQzdDLHdEQUFvQixTQUFNOzs7Ozs7Ozs7V0FFNUIsNEJBQVk7O2tCQUFlLEtBQUssS0FBSyxJQUFLLEtBQUs7dURBQzdDLHdEQUFvQixTQUFNOzs7Ozs7Ozs7Ozs7OztLQUVoQyw4QkFBWTsrQkFDQyxZQUFJOzs7Ozs7Ozs7Ozs7OztBQ25PckIseUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDUpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDNhZGY5NjYwNzY3Nzg3ZGNhNmY0IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlIFwiLi9zcmMvaW1iYS9pbmRleC5pbWJhXCJcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9pbWJhLmltYmEiLCIjIyNcbkltYmEgaXMgdGhlIG5hbWVzcGFjZSBmb3IgYWxsIHJ1bnRpbWUgcmVsYXRlZCB1dGlsaXRpZXNcbkBuYW1lc3BhY2VcbiMjI1xudmFyIEltYmEgPSB7VkVSU0lPTjogJzEuMy4wLWJldGEuMTEnfVxuXG4jIyNcblxuTGlnaHQgd3JhcHBlciBhcm91bmQgbmF0aXZlIHNldFRpbWVvdXQgdGhhdCBleHBlY3RzIHRoZSBibG9jayAvIGZ1bmN0aW9uXG5hcyBsYXN0IGFyZ3VtZW50IChpbnN0ZWFkIG9mIGZpcnN0KS4gSXQgYWxzbyB0cmlnZ2VycyBhbiBldmVudCB0byBJbWJhXG5hZnRlciB0aGUgdGltZW91dCB0byBsZXQgc2NoZWR1bGVycyB1cGRhdGUgKHRvIHJlcmVuZGVyIGV0YykgYWZ0ZXJ3YXJkcy5cblxuIyMjXG5kZWYgSW1iYS5zZXRUaW1lb3V0IGRlbGF5LCAmYmxvY2tcblx0c2V0VGltZW91dCgmLGRlbGF5KSBkb1xuXHRcdGJsb2NrKClcblx0XHRJbWJhLmNvbW1pdFxuXG4jIyNcblxuTGlnaHQgd3JhcHBlciBhcm91bmQgbmF0aXZlIHNldEludGVydmFsIHRoYXQgZXhwZWN0cyB0aGUgYmxvY2sgLyBmdW5jdGlvblxuYXMgbGFzdCBhcmd1bWVudCAoaW5zdGVhZCBvZiBmaXJzdCkuIEl0IGFsc28gdHJpZ2dlcnMgYW4gZXZlbnQgdG8gSW1iYVxuYWZ0ZXIgZXZlcnkgaW50ZXJ2YWwgdG8gbGV0IHNjaGVkdWxlcnMgdXBkYXRlICh0byByZXJlbmRlciBldGMpIGFmdGVyd2FyZHMuXG5cbiMjI1xuZGVmIEltYmEuc2V0SW50ZXJ2YWwgaW50ZXJ2YWwsICZibG9ja1xuXHRzZXRJbnRlcnZhbChibG9jayxpbnRlcnZhbClcblxuIyMjXG5DbGVhciBpbnRlcnZhbCB3aXRoIHNwZWNpZmllZCBpZFxuIyMjXG5kZWYgSW1iYS5jbGVhckludGVydmFsIGlkXG5cdGNsZWFySW50ZXJ2YWwoaWQpXG5cbiMjI1xuQ2xlYXIgdGltZW91dCB3aXRoIHNwZWNpZmllZCBpZFxuIyMjXG5kZWYgSW1iYS5jbGVhclRpbWVvdXQgaWRcblx0Y2xlYXJUaW1lb3V0KGlkKVxuXG5cbmRlZiBJbWJhLnN1YmNsYXNzIG9iaiwgc3VwXG5cdGZvciBrLHYgb2Ygc3VwXG5cdFx0b2JqW2tdID0gdiBpZiBzdXAuaGFzT3duUHJvcGVydHkoaylcblxuXHRvYmo6cHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXA6cHJvdG90eXBlKVxuXHRvYmo6X19zdXBlcl9fID0gb2JqOnByb3RvdHlwZTpfX3N1cGVyX18gPSBzdXA6cHJvdG90eXBlXG5cdG9iajpwcm90b3R5cGU6aW5pdGlhbGl6ZSA9IG9iajpwcm90b3R5cGU6Y29uc3RydWN0b3IgPSBvYmpcblx0cmV0dXJuIG9ialxuXG4jIyNcbkxpZ2h0d2VpZ2h0IG1ldGhvZCBmb3IgbWFraW5nIGFuIG9iamVjdCBpdGVyYWJsZSBpbiBpbWJhcyBmb3IvaW4gbG9vcHMuXG5JZiB0aGUgY29tcGlsZXIgY2Fubm90IHNheSBmb3IgY2VydGFpbiB0aGF0IGEgdGFyZ2V0IGluIGEgZm9yIGxvb3AgaXMgYW5cbmFycmF5LCBpdCB3aWxsIGNhY2hlIHRoZSBpdGVyYWJsZSB2ZXJzaW9uIGJlZm9yZSBsb29waW5nLlxuXG5gYGBpbWJhXG4jIHRoaXMgaXMgdGhlIHdob2xlIG1ldGhvZFxuZGVmIEltYmEuaXRlcmFibGUgb1xuXHRyZXR1cm4gbyA/IChvOnRvQXJyYXkgPyBvLnRvQXJyYXkgOiBvKSA6IFtdXG5cbmNsYXNzIEN1c3RvbUl0ZXJhYmxlXG5cdGRlZiB0b0FycmF5XG5cdFx0WzEsMiwzXVxuXG4jIHdpbGwgcmV0dXJuIFsyLDQsNl1cbmZvciB4IGluIEN1c3RvbUl0ZXJhYmxlLm5ld1xuXHR4ICogMlxuXG5gYGBcbiMjI1xuZGVmIEltYmEuaXRlcmFibGUgb1xuXHRyZXR1cm4gbyA/IChvOnRvQXJyYXkgPyBvLnRvQXJyYXkgOiBvKSA6IFtdXG5cbiMjI1xuQ29lcmNlcyBhIHZhbHVlIGludG8gYSBwcm9taXNlLiBJZiB2YWx1ZSBpcyBhcnJheSBpdCB3aWxsXG5jYWxsIGBQcm9taXNlLmFsbCh2YWx1ZSlgLCBvciBpZiBpdCBpcyBub3QgYSBwcm9taXNlIGl0IHdpbGxcbndyYXAgdGhlIHZhbHVlIGluIGBQcm9taXNlLnJlc29sdmUodmFsdWUpYC4gVXNlZCBmb3IgZXhwZXJpbWVudGFsXG5hd2FpdCBzeW50YXguXG5AcmV0dXJuIHtQcm9taXNlfVxuIyMjXG5kZWYgSW1iYS5hd2FpdCB2YWx1ZVxuXHRpZiB2YWx1ZSBpc2EgQXJyYXlcblx0XHRjb25zb2xlLndhcm4oXCJhd2FpdCAoQXJyYXkpIGlzIGRlcHJlY2F0ZWQgLSB1c2UgYXdhaXQgUHJvbWlzZS5hbGwoQXJyYXkpXCIpXG5cdFx0UHJvbWlzZS5hbGwodmFsdWUpXG5cdGVsaWYgdmFsdWUgYW5kIHZhbHVlOnRoZW5cblx0XHR2YWx1ZVxuXHRlbHNlXG5cdFx0UHJvbWlzZS5yZXNvbHZlKHZhbHVlKVxuXG52YXIgZGFzaFJlZ2V4ID0gLy0uL2dcbnZhciBzZXR0ZXJDYWNoZSA9IHt9XG5cbmRlZiBJbWJhLnRvQ2FtZWxDYXNlIHN0clxuXHRpZiBzdHIuaW5kZXhPZignLScpID49IDBcblx0XHRzdHIucmVwbGFjZShkYXNoUmVnZXgpIGRvIHxtfCBtLmNoYXJBdCgxKS50b1VwcGVyQ2FzZVxuXHRlbHNlXG5cdFx0c3RyXG5cdFx0XG5kZWYgSW1iYS50b1NldHRlciBzdHJcblx0c2V0dGVyQ2FjaGVbc3RyXSB8fD0gSW1iYS50b0NhbWVsQ2FzZSgnc2V0LScgKyBzdHIpXG5cbmRlZiBJbWJhLmluZGV4T2YgYSxiXG5cdHJldHVybiAoYiAmJiBiOmluZGV4T2YpID8gYi5pbmRleE9mKGEpIDogW106aW5kZXhPZi5jYWxsKGEsYilcblxuZGVmIEltYmEubGVuIGFcblx0cmV0dXJuIGEgJiYgKGE6bGVuIGlzYSBGdW5jdGlvbiA/IGE6bGVuLmNhbGwoYSkgOiBhOmxlbmd0aCkgb3IgMFxuXG5kZWYgSW1iYS5wcm9wIHNjb3BlLCBuYW1lLCBvcHRzXG5cdGlmIHNjb3BlOmRlZmluZVByb3BlcnR5XG5cdFx0cmV0dXJuIHNjb3BlLmRlZmluZVByb3BlcnR5KG5hbWUsb3B0cylcblx0cmV0dXJuXG5cbmRlZiBJbWJhLmF0dHIgc2NvcGUsIG5hbWUsIG9wdHMgPSB7fVxuXHRpZiBzY29wZTpkZWZpbmVBdHRyaWJ1dGVcblx0XHRyZXR1cm4gc2NvcGUuZGVmaW5lQXR0cmlidXRlKG5hbWUsb3B0cylcblxuXHRsZXQgZ2V0TmFtZSA9IEltYmEudG9DYW1lbENhc2UobmFtZSlcblx0bGV0IHNldE5hbWUgPSBJbWJhLnRvQ2FtZWxDYXNlKCdzZXQtJyArIG5hbWUpXG5cdGxldCBwcm90byA9IHNjb3BlOnByb3RvdHlwZVxuXG5cdGlmIG9wdHM6ZG9tXG5cdFx0cHJvdG9bZ2V0TmFtZV0gPSBkbyB0aGlzLmRvbVtuYW1lXVxuXHRcdHByb3RvW3NldE5hbWVdID0gZG8gfHZhbHVlfFxuXHRcdFx0aWYgdmFsdWUgIT0gdGhpc1tuYW1lXSgpXG5cdFx0XHRcdHRoaXMuZG9tW25hbWVdID0gdmFsdWVcblx0XHRcdHJldHVybiB0aGlzXG5cdGVsc2Vcblx0XHRwcm90b1tnZXROYW1lXSA9IGRvIHRoaXMuZ2V0QXR0cmlidXRlKG5hbWUpXG5cdFx0cHJvdG9bc2V0TmFtZV0gPSBkbyB8dmFsdWV8XG5cdFx0XHR0aGlzLnNldEF0dHJpYnV0ZShuYW1lLHZhbHVlKVxuXHRcdFx0cmV0dXJuIHRoaXNcblx0cmV0dXJuXG5cbmRlZiBJbWJhLnByb3BEaWRTZXQgb2JqZWN0LCBwcm9wZXJ0eSwgdmFsLCBwcmV2XG5cdGxldCBmbiA9IHByb3BlcnR5OndhdGNoXG5cdGlmIGZuIGlzYSBGdW5jdGlvblxuXHRcdGZuLmNhbGwob2JqZWN0LHZhbCxwcmV2LHByb3BlcnR5KVxuXHRlbGlmIGZuIGlzYSBTdHJpbmcgYW5kIG9iamVjdFtmbl1cblx0XHRvYmplY3RbZm5dKHZhbCxwcmV2LHByb3BlcnR5KVxuXHRyZXR1cm5cblxuXG4jIEJhc2ljIGV2ZW50c1xuZGVmIGVtaXRfXyBldmVudCwgYXJncywgbm9kZVxuXHQjIHZhciBub2RlID0gY2JzW2V2ZW50XVxuXHR2YXIgcHJldiwgY2IsIHJldFxuXG5cdHdoaWxlIChwcmV2ID0gbm9kZSkgYW5kIChub2RlID0gbm9kZTpuZXh0KVxuXHRcdGlmIGNiID0gbm9kZTpsaXN0ZW5lclxuXHRcdFx0aWYgbm9kZTpwYXRoIGFuZCBjYltub2RlOnBhdGhdXG5cdFx0XHRcdHJldCA9IGFyZ3MgPyBjYltub2RlOnBhdGhdLmFwcGx5KGNiLGFyZ3MpIDogY2Jbbm9kZTpwYXRoXSgpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdCMgY2hlY2sgaWYgaXQgaXMgYSBtZXRob2Q/XG5cdFx0XHRcdHJldCA9IGFyZ3MgPyBjYi5hcHBseShub2RlLCBhcmdzKSA6IGNiLmNhbGwobm9kZSlcblxuXHRcdGlmIG5vZGU6dGltZXMgJiYgLS1ub2RlOnRpbWVzIDw9IDBcblx0XHRcdHByZXY6bmV4dCA9IG5vZGU6bmV4dFxuXHRcdFx0bm9kZTpsaXN0ZW5lciA9IG51bGxcblx0cmV0dXJuXG5cbiMgbWV0aG9kIGZvciByZWdpc3RlcmluZyBhIGxpc3RlbmVyIG9uIG9iamVjdFxuZGVmIEltYmEubGlzdGVuIG9iaiwgZXZlbnQsIGxpc3RlbmVyLCBwYXRoXG5cdHZhciBjYnMsIGxpc3QsIHRhaWxcblx0Y2JzID0gb2JqOl9fbGlzdGVuZXJzX18gfHw9IHt9XG5cdGxpc3QgPSBjYnNbZXZlbnRdIHx8PSB7fVxuXHR0YWlsID0gbGlzdDp0YWlsIHx8IChsaXN0OnRhaWwgPSAobGlzdDpuZXh0ID0ge30pKVxuXHR0YWlsOmxpc3RlbmVyID0gbGlzdGVuZXJcblx0dGFpbDpwYXRoID0gcGF0aFxuXHRsaXN0OnRhaWwgPSB0YWlsOm5leHQgPSB7fVxuXHRyZXR1cm4gdGFpbFxuXG4jIHJlZ2lzdGVyIGEgbGlzdGVuZXIgb25jZVxuZGVmIEltYmEub25jZSBvYmosIGV2ZW50LCBsaXN0ZW5lclxuXHR2YXIgdGFpbCA9IEltYmEubGlzdGVuKG9iaixldmVudCxsaXN0ZW5lcilcblx0dGFpbDp0aW1lcyA9IDFcblx0cmV0dXJuIHRhaWxcblxuIyByZW1vdmUgYSBsaXN0ZW5lclxuZGVmIEltYmEudW5saXN0ZW4gb2JqLCBldmVudCwgY2IsIG1ldGhcblx0dmFyIG5vZGUsIHByZXZcblx0dmFyIG1ldGEgPSBvYmo6X19saXN0ZW5lcnNfX1xuXHRyZXR1cm4gdW5sZXNzIG1ldGFcblxuXHRpZiBub2RlID0gbWV0YVtldmVudF1cblx0XHR3aGlsZSAocHJldiA9IG5vZGUpIGFuZCAobm9kZSA9IG5vZGU6bmV4dClcblx0XHRcdGlmIG5vZGUgPT0gY2IgfHwgbm9kZTpsaXN0ZW5lciA9PSBjYlxuXHRcdFx0XHRwcmV2Om5leHQgPSBub2RlOm5leHRcblx0XHRcdFx0IyBjaGVjayBmb3IgY29ycmVjdCBwYXRoIGFzIHdlbGw/XG5cdFx0XHRcdG5vZGU6bGlzdGVuZXIgPSBudWxsXG5cdFx0XHRcdGJyZWFrXG5cdHJldHVyblxuXG4jIGVtaXQgZXZlbnRcbmRlZiBJbWJhLmVtaXQgb2JqLCBldmVudCwgcGFyYW1zXG5cdGlmIHZhciBjYiA9IG9iajpfX2xpc3RlbmVyc19fXG5cdFx0ZW1pdF9fKGV2ZW50LHBhcmFtcyxjYltldmVudF0pIGlmIGNiW2V2ZW50XVxuXHRcdGVtaXRfXyhldmVudCxbZXZlbnQscGFyYW1zXSxjYjphbGwpIGlmIGNiOmFsbCAjIGFuZCBldmVudCAhPSAnYWxsJ1xuXHRyZXR1cm5cblxuZGVmIEltYmEub2JzZXJ2ZVByb3BlcnR5IG9ic2VydmVyLCBrZXksIHRyaWdnZXIsIHRhcmdldCwgcHJldlxuXHRpZiBwcmV2IGFuZCB0eXBlb2YgcHJldiA9PSAnb2JqZWN0J1xuXHRcdEltYmEudW5saXN0ZW4ocHJldiwnYWxsJyxvYnNlcnZlcix0cmlnZ2VyKVxuXHRpZiB0YXJnZXQgYW5kIHR5cGVvZiB0YXJnZXQgPT0gJ29iamVjdCdcblx0XHRJbWJhLmxpc3Rlbih0YXJnZXQsJ2FsbCcsb2JzZXJ2ZXIsdHJpZ2dlcilcblx0c2VsZlxuXG5tb2R1bGU6ZXhwb3J0cyA9IEltYmFcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2ltYmEuaW1iYSIsImV4cG9ydCB0YWcgUGFnZVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9QYWdlLmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbmNsYXNzIEltYmEuUG9pbnRlclxuXHRcblx0ZGVmIGluaXRpYWxpemVcblx0XHRAYnV0dG9uID0gLTFcblx0XHRAZXZlbnQgPSB7eDogMCwgeTogMCwgdHlwZTogJ3VuaW5pdGlhbGl6ZWQnfVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIGJ1dHRvblxuXHRcdEBidXR0b25cblxuXHRkZWYgdG91Y2hcblx0XHRAdG91Y2hcblxuXHRkZWYgdXBkYXRlIGVcblx0XHRAZXZlbnQgPSBlXG5cdFx0QGRpcnR5ID0geWVzXG5cdFx0c2VsZlxuXG5cdCMgdGhpcyBpcyBqdXN0IGZvciByZWd1bGFyIG1vdXNlIG5vd1xuXHRkZWYgcHJvY2Vzc1xuXHRcdHZhciBlMSA9IEBldmVudFxuXG5cdFx0aWYgQGRpcnR5XG5cdFx0XHRAcHJldkV2ZW50ID0gZTFcblx0XHRcdEBkaXJ0eSA9IG5vXG5cblx0XHRcdCMgYnV0dG9uIHNob3VsZCBvbmx5IGNoYW5nZSBvbiBtb3VzZWRvd24gZXRjXG5cdFx0XHRpZiBlMTp0eXBlID09ICdtb3VzZWRvd24nXG5cdFx0XHRcdEBidXR0b24gPSBlMTpidXR0b25cblxuXHRcdFx0XHRpZiAoQHRvdWNoIGFuZCBAYnV0dG9uICE9IDApXG5cdFx0XHRcdFx0cmV0dXJuXG5cblx0XHRcdFx0IyBjYW5jZWwgdGhlIHByZXZpb3VzIHRvdWNoXG5cdFx0XHRcdEB0b3VjaC5jYW5jZWwgaWYgQHRvdWNoXG5cdFx0XHRcdEB0b3VjaCA9IEltYmEuVG91Y2gubmV3KGUxLHNlbGYpXG5cdFx0XHRcdEB0b3VjaC5tb3VzZWRvd24oZTEsZTEpXG5cblx0XHRcdGVsaWYgZTE6dHlwZSA9PSAnbW91c2Vtb3ZlJ1xuXHRcdFx0XHRAdG91Y2gubW91c2Vtb3ZlKGUxLGUxKSBpZiBAdG91Y2hcblxuXHRcdFx0ZWxpZiBlMTp0eXBlID09ICdtb3VzZXVwJ1xuXHRcdFx0XHRAYnV0dG9uID0gLTFcblxuXHRcdFx0XHRpZiBAdG91Y2ggYW5kIEB0b3VjaC5idXR0b24gPT0gZTE6YnV0dG9uXG5cdFx0XHRcdFx0QHRvdWNoLm1vdXNldXAoZTEsZTEpXG5cdFx0XHRcdFx0QHRvdWNoID0gbnVsbFxuXHRcdFx0XHQjIHRyaWdnZXIgcG9pbnRlcnVwXG5cdFx0ZWxpZiBAdG91Y2hcblx0XHRcdEB0b3VjaC5pZGxlXG5cdFx0c2VsZlxuXG5cdGRlZiB4IGRvIEBldmVudDp4XG5cdGRlZiB5IGRvIEBldmVudDp5XG5cdFxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9wb2ludGVyLmltYmEiLCJleHRlcm4gZXZhbFxuXG5leHBvcnQgdGFnIFNuaXBwZXRcblx0cHJvcCBzcmNcblx0cHJvcCBoZWFkaW5nXG5cdHByb3AgaGxcblx0XG5cdGRlZiBzZWxmLnJlcGxhY2UgZG9tXG5cdFx0bGV0IGltYmEgPSBkb206Zmlyc3RDaGlsZFxuXHRcdGxldCBqcyA9IGltYmE6bmV4dFNpYmxpbmdcblx0XHRsZXQgaGlnaGxpZ2h0ZWQgPSBpbWJhOmlubmVySFRNTFxuXHRcdGxldCByYXcgPSBkb206dGV4dENvbnRlbnRcblx0XHRsZXQgZGF0YSA9XG5cdFx0XHRjb2RlOiByYXdcblx0XHRcdGh0bWw6IGhpZ2hsaWdodGVkXG5cdFx0XHRqczoge1xuXHRcdFx0XHRjb2RlOiBqczp0ZXh0Q29udGVudFxuXHRcdFx0XHRodG1sOiBqczppbm5lckhUTUxcblx0XHRcdH1cblxuXHRcdGxldCBzbmlwcGV0ID0gPFNuaXBwZXRbZGF0YV0+XG5cdFx0ZG9tOnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHNuaXBwZXQuZG9tLGRvbSlcblx0XHRyZXR1cm4gc25pcHBldFxuXHRcdFxuXHRkZWYgc2V0dXBcblx0XHRyZW5kZXJcblx0XHRAY29kZS5kb206aW5uZXJIVE1MID0gZGF0YTpodG1sXG5cdFx0cnVuXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgcnVuXG5cdFx0dmFyIG9yaWcgPSBJbWJhOm1vdW50XG5cdFx0XG5cdFx0IyB2YXIganMgPSAndmFyIHJlcXVpcmUgPSBmdW5jdGlvbigpeyByZXR1cm4gSW1iYSB9O1xcbicgKyBkYXRhOmpzOmNvZGVcblx0XHR2YXIganMgPSBkYXRhOmpzOmNvZGVcblx0XHRjb25zb2xlLmxvZyBJbWJhXG5cdFx0anMgPSBqcy5yZXBsYWNlKFwicmVxdWlyZSgnaW1iYScpXCIsJ3dpbmRvdy5JbWJhJylcblx0XHR0cnlcblx0XHRcdEltYmE6bW91bnQgPSBkbyB8aXRlbXwgb3JpZy5jYWxsKEltYmEsaXRlbSxAcmVzdWx0LmRvbSlcblx0XHRcdGNvbnNvbGUubG9nIFwicnVuIGNvZGVcIiwganNcblx0XHRcdGV2YWwoanMpXG5cdFx0XG5cdFx0SW1iYTptb3VudCA9IG9yaWdcblx0XHRzZWxmXG5cblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGYuc25pcHBldD5cblx0XHRcdDxjb2RlQGNvZGU+XG5cdFx0XHQ8ZGl2QHJlc3VsdC5zdHlsZWQtZXhhbXBsZT5cblx0XHRcbmV4cG9ydCB0YWcgRXhhbXBsZSA8IFNuaXBwZXRcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGY+IFwiRXhhbXBsZVwiXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL1NuaXBwZXQuaW1iYSIsIlxuaW1wb3J0IEFwcCBmcm9tICcuL2FwcCdcbmltcG9ydCBTaXRlIGZyb20gJy4vdmlld3MvU2l0ZSdcbmRvY3VtZW50OmJvZHk6aW5uZXJIVE1MID0gJycgXG5JbWJhLm1vdW50IDxTaXRlW0FQUCA9IEFwcC5kZXNlcmlhbGl6ZShBUFBDQUNIRSldPlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jbGllbnQuaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4vaW1iYVwiKVxudmFyIGFjdGl2YXRlID0gbm9cbmlmIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG5cdGlmIHdpbmRvdy5JbWJhXG5cdFx0Y29uc29sZS53YXJuIFwiSW1iYSB2e3dpbmRvdy5JbWJhLlZFUlNJT059IGlzIGFscmVhZHkgbG9hZGVkLlwiXG5cdFx0SW1iYSA9IHdpbmRvdy5JbWJhXG5cdGVsc2Vcblx0XHR3aW5kb3cuSW1iYSA9IEltYmFcblx0XHRhY3RpdmF0ZSA9IHllc1xuXHRcdGlmIHdpbmRvdzpkZWZpbmUgYW5kIHdpbmRvdzpkZWZpbmU6YW1kXG5cdFx0XHR3aW5kb3cuZGVmaW5lKFwiaW1iYVwiLFtdKSBkbyByZXR1cm4gSW1iYVxuXG5tb2R1bGUuZXhwb3J0cyA9IEltYmFcblxudW5sZXNzICR3ZWJ3b3JrZXIkXG5cdHJlcXVpcmUgJy4vc2NoZWR1bGVyJ1xuXHRyZXF1aXJlICcuL2RvbS9pbmRleCdcblxuaWYgJHdlYiQgYW5kIGFjdGl2YXRlXG5cdEltYmEuRXZlbnRNYW5hZ2VyLmFjdGl2YXRlXG5cdFxuaWYgJG5vZGUkXG5cdHVubGVzcyAkd2VicGFjayRcblx0XHRyZXF1aXJlICcuLi8uLi9yZWdpc3Rlci5qcydcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2luZGV4LmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuL2ltYmFcIilcblxudmFyIHJlcXVlc3RBbmltYXRpb25GcmFtZSAjIHZlcnkgc2ltcGxlIHJhZiBwb2x5ZmlsbFxudmFyIGNhbmNlbEFuaW1hdGlvbkZyYW1lXG5cbmlmICRub2RlJFxuXHRjYW5jZWxBbmltYXRpb25GcmFtZSA9IGRvIHxpZHwgY2xlYXJUaW1lb3V0KGlkKVxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBkbyB8YmxrfCBzZXRUaW1lb3V0KGJsaywxMDAwIC8gNjApXG5cbmlmICR3ZWIkXG5cdGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93OmNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdzptb3pDYW5jZWxBbmltYXRpb25GcmFtZSB8fCB3aW5kb3c6d2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdzpyZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8PSB3aW5kb3c6d2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSB8fD0gd2luZG93Om1velJlcXVlc3RBbmltYXRpb25GcmFtZVxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHw9IGRvIHxibGt8IHNldFRpbWVvdXQoYmxrLDEwMDAgLyA2MClcblxuY2xhc3MgVGlja2VyXG5cblx0cHJvcCBzdGFnZVxuXHRwcm9wIHF1ZXVlXG5cblx0ZGVmIGluaXRpYWxpemVcblx0XHRAcXVldWUgPSBbXVxuXHRcdEBzdGFnZSA9IC0xXG5cdFx0QHNjaGVkdWxlZCA9IG5vXG5cdFx0QHRpY2tlciA9IGRvIHxlfFxuXHRcdFx0QHNjaGVkdWxlZCA9IG5vXG5cdFx0XHR0aWNrKGUpXG5cdFx0c2VsZlxuXG5cdGRlZiBhZGQgaXRlbSwgZm9yY2Vcblx0XHRpZiBmb3JjZSBvciBAcXVldWUuaW5kZXhPZihpdGVtKSA9PSAtMVxuXHRcdFx0QHF1ZXVlLnB1c2goaXRlbSlcblxuXHRcdHNjaGVkdWxlIHVubGVzcyBAc2NoZWR1bGVkXG5cblx0ZGVmIHRpY2sgdGltZXN0YW1wXG5cdFx0dmFyIGl0ZW1zID0gQHF1ZXVlXG5cdFx0QHRzID0gdGltZXN0YW1wIHVubGVzcyBAdHNcblx0XHRAZHQgPSB0aW1lc3RhbXAgLSBAdHNcblx0XHRAdHMgPSB0aW1lc3RhbXBcblx0XHRAcXVldWUgPSBbXVxuXHRcdEBzdGFnZSA9IDFcblx0XHRiZWZvcmVcblx0XHRpZiBpdGVtczpsZW5ndGhcblx0XHRcdGZvciBpdGVtLGkgaW4gaXRlbXNcblx0XHRcdFx0aWYgaXRlbSBpc2EgRnVuY3Rpb25cblx0XHRcdFx0XHRpdGVtKEBkdCxzZWxmKVxuXHRcdFx0XHRlbGlmIGl0ZW06dGlja1xuXHRcdFx0XHRcdGl0ZW0udGljayhAZHQsc2VsZilcblx0XHRAc3RhZ2UgPSAyXG5cdFx0YWZ0ZXJcblx0XHRAc3RhZ2UgPSBAc2NoZWR1bGVkID8gMCA6IC0xXG5cdFx0c2VsZlxuXG5cdGRlZiBzY2hlZHVsZVxuXHRcdGlmICFAc2NoZWR1bGVkXG5cdFx0XHRAc2NoZWR1bGVkID0geWVzXG5cdFx0XHRpZiBAc3RhZ2UgPT0gLTFcblx0XHRcdFx0QHN0YWdlID0gMFxuXHRcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKEB0aWNrZXIpXG5cdFx0c2VsZlxuXG5cdGRlZiBiZWZvcmVcblx0XHRzZWxmXG5cblx0ZGVmIGFmdGVyXG5cdFx0aWYgSW1iYS5UYWdNYW5hZ2VyXG5cdFx0XHRJbWJhLlRhZ01hbmFnZXIucmVmcmVzaFxuXHRcdHNlbGZcblxuSW1iYS5USUNLRVIgPSBUaWNrZXIubmV3XG5JbWJhLlNDSEVEVUxFUlMgPSBbXVxuXG5kZWYgSW1iYS50aWNrZXJcblx0SW1iYS5USUNLRVJcblxuZGVmIEltYmEucmVxdWVzdEFuaW1hdGlvbkZyYW1lIGNhbGxiYWNrXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjaylcblxuZGVmIEltYmEuY2FuY2VsQW5pbWF0aW9uRnJhbWUgaWRcblx0Y2FuY2VsQW5pbWF0aW9uRnJhbWUoaWQpXG5cbiMgc2hvdWxkIGFkZCBhbiBJbWJhLnJ1biAvIHNldEltbWVkaWF0ZSB0aGF0XG4jIHB1c2hlcyBsaXN0ZW5lciBvbnRvIHRoZSB0aWNrLXF1ZXVlIHdpdGggdGltZXMgLSBvbmNlXG5cbnZhciBjb21taXRRdWV1ZSA9IDBcblxuZGVmIEltYmEuY29tbWl0IHBhcmFtc1xuXHRjb21taXRRdWV1ZSsrXG5cdCMgSW1iYS5UYWdNYW5hZ2VyLnJlZnJlc2hcblx0SW1iYS5lbWl0KEltYmEsJ2NvbW1pdCcscGFyYW1zICE9IHVuZGVmaW5lZCA/IFtwYXJhbXNdIDogdW5kZWZpbmVkKVxuXHRpZiAtLWNvbW1pdFF1ZXVlID09IDBcblx0XHRJbWJhLlRhZ01hbmFnZXIgYW5kIEltYmEuVGFnTWFuYWdlci5yZWZyZXNoXG5cdHJldHVyblxuXG4jIyNcblxuSW5zdGFuY2VzIG9mIEltYmEuU2NoZWR1bGVyIG1hbmFnZXMgd2hlbiB0byBjYWxsIGB0aWNrKClgIG9uIHRoZWlyIHRhcmdldCxcbmF0IGEgc3BlY2lmaWVkIGZyYW1lcmF0ZSBvciB3aGVuIGNlcnRhaW4gZXZlbnRzIG9jY3VyLiBSb290LW5vZGVzIGluIHlvdXJcbmFwcGxpY2F0aW9ucyB3aWxsIHVzdWFsbHkgaGF2ZSBhIHNjaGVkdWxlciB0byBtYWtlIHN1cmUgdGhleSByZXJlbmRlciB3aGVuXG5zb21ldGhpbmcgY2hhbmdlcy4gSXQgaXMgYWxzbyBwb3NzaWJsZSB0byBtYWtlIGlubmVyIGNvbXBvbmVudHMgdXNlIHRoZWlyXG5vd24gc2NoZWR1bGVycyB0byBjb250cm9sIHdoZW4gdGhleSByZW5kZXIuXG5cbkBpbmFtZSBzY2hlZHVsZXJcblxuIyMjXG5jbGFzcyBJbWJhLlNjaGVkdWxlclxuXHRcblx0dmFyIGNvdW50ZXIgPSAwXG5cblx0ZGVmIHNlbGYuZXZlbnQgZVxuXHRcdEltYmEuZW1pdChJbWJhLCdldmVudCcsZSlcblxuXHQjIyNcblx0Q3JlYXRlIGEgbmV3IEltYmEuU2NoZWR1bGVyIGZvciBzcGVjaWZpZWQgdGFyZ2V0XG5cdEByZXR1cm4ge0ltYmEuU2NoZWR1bGVyfVxuXHQjIyNcblx0ZGVmIGluaXRpYWxpemUgdGFyZ2V0XG5cdFx0QGlkID0gY291bnRlcisrXG5cdFx0QHRhcmdldCA9IHRhcmdldFxuXHRcdEBtYXJrZWQgPSBub1xuXHRcdEBhY3RpdmUgPSBub1xuXHRcdEBtYXJrZXIgPSBkbyBtYXJrXG5cdFx0QHRpY2tlciA9IGRvIHxlfCB0aWNrKGUpXG5cblx0XHRAZHQgPSAwXG5cdFx0QGZyYW1lID0ge31cblx0XHRAc2NoZWR1bGVkID0gbm9cblx0XHRAdGltZXN0YW1wID0gMFxuXHRcdEB0aWNrcyA9IDBcblx0XHRAZmx1c2hlcyA9IDBcblxuXHRcdHNlbGY6b25ldmVudCA9IHNlbGY6b25ldmVudC5iaW5kKHNlbGYpXG5cdFx0c2VsZlxuXG5cdHByb3AgcmFmIHdhdGNoOiB5ZXNcblx0cHJvcCBpbnRlcnZhbCB3YXRjaDogeWVzXG5cdHByb3AgZXZlbnRzIHdhdGNoOiB5ZXNcblx0cHJvcCBtYXJrZWRcblxuXHRkZWYgcmFmRGlkU2V0IGJvb2xcblx0XHRyZXF1ZXN0VGljayBpZiBib29sIGFuZCBAYWN0aXZlXG5cdFx0c2VsZlxuXG5cdGRlZiBpbnRlcnZhbERpZFNldCB0aW1lXG5cdFx0Y2xlYXJJbnRlcnZhbChAaW50ZXJ2YWxJZClcblx0XHRAaW50ZXJ2YWxJZCA9IG51bGxcblx0XHRpZiB0aW1lIGFuZCBAYWN0aXZlXG5cdFx0XHRAaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKHNlbGY6b25pbnRlcnZhbC5iaW5kKHNlbGYpLHRpbWUpXG5cdFx0c2VsZlxuXG5cdGRlZiBldmVudHNEaWRTZXQgbmV3LCBwcmV2XG5cdFx0aWYgQGFjdGl2ZSBhbmQgbmV3IGFuZCAhcHJldlxuXHRcdFx0SW1iYS5saXN0ZW4oSW1iYSwnY29tbWl0JyxzZWxmLCdvbmV2ZW50Jylcblx0XHRlbGlmICFuZXcgYW5kIHByZXZcblx0XHRcdEltYmEudW5saXN0ZW4oSW1iYSwnY29tbWl0JyxzZWxmLCdvbmV2ZW50JylcblxuXHQjIyNcblx0Q2hlY2sgd2hldGhlciB0aGUgY3VycmVudCBzY2hlZHVsZXIgaXMgYWN0aXZlIG9yIG5vdFxuXHRAcmV0dXJuIHtib29sfVxuXHQjIyNcblx0ZGVmIGFjdGl2ZVxuXHRcdEBhY3RpdmVcblxuXHQjIyNcblx0RGVsdGEgdGltZSBiZXR3ZWVuIHRoZSB0d28gbGFzdCB0aWNrc1xuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgZHRcblx0XHRAZHRcblxuXHQjIyNcblx0Q29uZmlndXJlIHRoZSBzY2hlZHVsZXJcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBjb25maWd1cmUgb3B0aW9ucyA9IHt9XG5cdFx0cmFmID0gb3B0aW9uczpyYWYgaWYgb3B0aW9uczpyYWYgIT0gdW5kZWZpbmVkXG5cdFx0aW50ZXJ2YWwgPSBvcHRpb25zOmludGVydmFsIGlmIG9wdGlvbnM6aW50ZXJ2YWwgIT0gdW5kZWZpbmVkXG5cdFx0ZXZlbnRzID0gb3B0aW9uczpldmVudHMgaWYgb3B0aW9uczpldmVudHMgIT0gdW5kZWZpbmVkXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRNYXJrIHRoZSBzY2hlZHVsZXIgYXMgZGlydHkuIFRoaXMgd2lsbCBtYWtlIHN1cmUgdGhhdFxuXHR0aGUgc2NoZWR1bGVyIGNhbGxzIGB0YXJnZXQudGlja2Agb24gdGhlIG5leHQgZnJhbWVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBtYXJrXG5cdFx0QG1hcmtlZCA9IHllc1xuXHRcdGlmICFAc2NoZWR1bGVkXG5cdFx0XHRyZXF1ZXN0VGlja1xuXHRcdHNlbGZcblxuXHQjIyNcblx0SW5zdGFudGx5IHRyaWdnZXIgdGFyZ2V0LnRpY2sgYW5kIG1hcmsgc2NoZWR1bGVyIGFzIGNsZWFuIChub3QgZGlydHkvbWFya2VkKS5cblx0VGhpcyBpcyBjYWxsZWQgaW1wbGljaXRseSBmcm9tIHRpY2ssIGJ1dCBjYW4gYWxzbyBiZSBjYWxsZWQgbWFudWFsbHkgaWYgeW91XG5cdHJlYWxseSB3YW50IHRvIGZvcmNlIGEgdGljayB3aXRob3V0IHdhaXRpbmcgZm9yIHRoZSBuZXh0IGZyYW1lLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGZsdXNoXG5cdFx0QGZsdXNoZXMrK1xuXHRcdEB0YXJnZXQudGljayhzZWxmKVxuXHRcdEBtYXJrZWQgPSBub1xuXHRcdHNlbGZcblxuXHQjIyNcblx0QGZpeG1lIHRoaXMgZXhwZWN0cyByYWYgdG8gcnVuIGF0IDYwIGZwcyBcblxuXHRDYWxsZWQgYXV0b21hdGljYWxseSBvbiBldmVyeSBmcmFtZSB3aGlsZSB0aGUgc2NoZWR1bGVyIGlzIGFjdGl2ZS5cblx0SXQgd2lsbCBvbmx5IGNhbGwgYHRhcmdldC50aWNrYCBpZiB0aGUgc2NoZWR1bGVyIGlzIG1hcmtlZCBkaXJ0eSxcblx0b3Igd2hlbiBhY2NvcmRpbmcgdG8gQGZwcyBzZXR0aW5nLlxuXG5cdElmIHlvdSBoYXZlIHNldCB1cCBhIHNjaGVkdWxlciB3aXRoIGFuIGZwcyBvZiAxLCB0aWNrIHdpbGwgc3RpbGwgYmVcblx0Y2FsbGVkIGV2ZXJ5IGZyYW1lLCBidXQgYHRhcmdldC50aWNrYCB3aWxsIG9ubHkgYmUgY2FsbGVkIG9uY2UgZXZlcnlcblx0c2Vjb25kLCBhbmQgaXQgd2lsbCAqbWFrZSBzdXJlKiBlYWNoIGB0YXJnZXQudGlja2AgaGFwcGVucyBpbiBzZXBhcmF0ZVxuXHRzZWNvbmRzIGFjY29yZGluZyB0byBEYXRlLiBTbyBpZiB5b3UgaGF2ZSBhIG5vZGUgdGhhdCByZW5kZXJzIGEgY2xvY2tcblx0YmFzZWQgb24gRGF0ZS5ub3cgKG9yIHNvbWV0aGluZyBzaW1pbGFyKSwgeW91IGNhbiBzY2hlZHVsZSBpdCB3aXRoIDFmcHMsXG5cdG5ldmVyIG5lZWRpbmcgdG8gd29ycnkgYWJvdXQgdHdvIHRpY2tzIGhhcHBlbmluZyB3aXRoaW4gdGhlIHNhbWUgc2Vjb25kLlxuXHRUaGUgc2FtZSBnb2VzIGZvciA0ZnBzLCAxMGZwcyBldGMuXG5cblx0QHByb3RlY3RlZFxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHRpY2sgZGVsdGEsIHRpY2tlclxuXHRcdEB0aWNrcysrXG5cdFx0QGR0ID0gZGVsdGFcblxuXHRcdGlmIHRpY2tlclxuXHRcdFx0QHNjaGVkdWxlZCA9IG5vXG5cblx0XHRmbHVzaFxuXG5cdFx0aWYgQHJhZiBhbmQgQGFjdGl2ZVxuXHRcdFx0cmVxdWVzdFRpY2tcblx0XHRzZWxmXG5cblx0ZGVmIHJlcXVlc3RUaWNrXG5cdFx0dW5sZXNzIEBzY2hlZHVsZWRcblx0XHRcdEBzY2hlZHVsZWQgPSB5ZXNcblx0XHRcdEltYmEuVElDS0VSLmFkZChzZWxmKVxuXHRcdHNlbGZcblxuXHQjIyNcblx0U3RhcnQgdGhlIHNjaGVkdWxlciBpZiBpdCBpcyBub3QgYWxyZWFkeSBhY3RpdmUuXG5cdCoqV2hpbGUgYWN0aXZlKiosIHRoZSBzY2hlZHVsZXIgd2lsbCBvdmVycmlkZSBgdGFyZ2V0LmNvbW1pdGBcblx0dG8gZG8gbm90aGluZy4gQnkgZGVmYXVsdCBJbWJhLnRhZyNjb21taXQgY2FsbHMgcmVuZGVyLCBzb1xuXHR0aGF0IHJlbmRlcmluZyBpcyBjYXNjYWRlZCB0aHJvdWdoIHRvIGNoaWxkcmVuIHdoZW4gcmVuZGVyaW5nXG5cdGEgbm9kZS4gV2hlbiBhIHNjaGVkdWxlciBpcyBhY3RpdmUgKGZvciBhIG5vZGUpLCBJbWJhIGRpc2FibGVzXG5cdHRoaXMgYXV0b21hdGljIHJlbmRlcmluZy5cblx0IyMjXG5cdGRlZiBhY3RpdmF0ZSBpbW1lZGlhdGUgPSB5ZXNcblx0XHR1bmxlc3MgQGFjdGl2ZVxuXHRcdFx0QGFjdGl2ZSA9IHllc1xuXHRcdFx0QGNvbW1pdCA9IEB0YXJnZXQ6Y29tbWl0XG5cdFx0XHRAdGFyZ2V0OmNvbW1pdCA9IGRvIHRoaXNcblx0XHRcdEB0YXJnZXQ/LmZsYWcoJ3NjaGVkdWxlZF8nKVxuXHRcdFx0SW1iYS5TQ0hFRFVMRVJTLnB1c2goc2VsZilcblx0XHRcdFxuXHRcdFx0aWYgQGV2ZW50c1xuXHRcdFx0XHRJbWJhLmxpc3RlbihJbWJhLCdjb21taXQnLHNlbGYsJ29uZXZlbnQnKVxuXHRcdFx0XHRcblx0XHRcdGlmIEBpbnRlcnZhbCBhbmQgIUBpbnRlcnZhbElkXG5cdFx0XHRcdEBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoc2VsZjpvbmludGVydmFsLmJpbmQoc2VsZiksQGludGVydmFsKVxuXG5cdFx0XHRpZiBpbW1lZGlhdGVcblx0XHRcdFx0dGljaygwKVxuXHRcdFx0ZWxpZiBAcmFmXG5cdFx0XHRcdHJlcXVlc3RUaWNrXG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblx0U3RvcCB0aGUgc2NoZWR1bGVyIGlmIGl0IGlzIGFjdGl2ZS5cblx0IyMjXG5cdGRlZiBkZWFjdGl2YXRlXG5cdFx0aWYgQGFjdGl2ZVxuXHRcdFx0QGFjdGl2ZSA9IG5vXG5cdFx0XHRAdGFyZ2V0OmNvbW1pdCA9IEBjb21taXRcblx0XHRcdGxldCBpZHggPSBJbWJhLlNDSEVEVUxFUlMuaW5kZXhPZihzZWxmKVxuXHRcdFx0aWYgaWR4ID49IDBcblx0XHRcdFx0SW1iYS5TQ0hFRFVMRVJTLnNwbGljZShpZHgsMSlcblx0XHRcdFx0XG5cdFx0XHRpZiBAZXZlbnRzXG5cdFx0XHRcdEltYmEudW5saXN0ZW4oSW1iYSwnY29tbWl0JyxzZWxmLCdvbmV2ZW50JylcblxuXHRcdFx0aWYgQGludGVydmFsSWRcblx0XHRcdFx0Y2xlYXJJbnRlcnZhbChAaW50ZXJ2YWxJZClcblx0XHRcdFx0QGludGVydmFsSWQgPSBudWxsXG5cdFx0XHRcblx0XHRcdEB0YXJnZXQ/LnVuZmxhZygnc2NoZWR1bGVkXycpXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgdHJhY2tcblx0XHRAbWFya2VyXG5cdFx0XG5cdGRlZiBvbmludGVydmFsXG5cdFx0dGlja1xuXHRcdEltYmEuVGFnTWFuYWdlci5yZWZyZXNoXG5cdFx0c2VsZlxuXG5cdGRlZiBvbmV2ZW50IGV2ZW50XG5cdFx0cmV0dXJuIHNlbGYgaWYgIUBldmVudHMgb3IgQG1hcmtlZFxuXG5cdFx0aWYgQGV2ZW50cyBpc2EgRnVuY3Rpb25cblx0XHRcdG1hcmsgaWYgQGV2ZW50cyhldmVudCxzZWxmKVxuXHRcdGVsaWYgQGV2ZW50cyBpc2EgQXJyYXlcblx0XHRcdGlmIEBldmVudHMuaW5kZXhPZigoZXZlbnQgYW5kIGV2ZW50OnR5cGUpIG9yIGV2ZW50KSA+PSAwXG5cdFx0XHRcdG1hcmtcblx0XHRlbHNlXG5cdFx0XHRtYXJrXG5cdFx0c2VsZlxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvc2NoZWR1bGVyLmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbnJlcXVpcmUgJy4vbWFuYWdlcidcblxuSW1iYS5UYWdNYW5hZ2VyID0gSW1iYS5UYWdNYW5hZ2VyQ2xhc3MubmV3XG5cbnJlcXVpcmUgJy4vdGFnJ1xucmVxdWlyZSAnLi9odG1sJ1xucmVxdWlyZSAnLi9wb2ludGVyJ1xucmVxdWlyZSAnLi90b3VjaCdcbnJlcXVpcmUgJy4vZXZlbnQnXG5yZXF1aXJlICcuL2V2ZW50LW1hbmFnZXInXG5cbmlmICR3ZWIkXG5cdHJlcXVpcmUgJy4vcmVjb25jaWxlcidcblxuaWYgJG5vZGUkXG5cdHJlcXVpcmUgJy4vc2VydmVyJ1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9pbmRleC5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG5jbGFzcyBJbWJhLlRhZ01hbmFnZXJDbGFzc1xuXHRkZWYgaW5pdGlhbGl6ZVxuXHRcdEBpbnNlcnRzID0gMFxuXHRcdEByZW1vdmVzID0gMFxuXHRcdEBtb3VudGVkID0gW11cblx0XHRAaGFzTW91bnRhYmxlcyA9IG5vXG5cdFx0c2VsZlxuXG5cdGRlZiBtb3VudGVkXG5cdFx0QG1vdW50ZWRcblxuXHRkZWYgaW5zZXJ0IG5vZGUsIHBhcmVudFxuXHRcdEBpbnNlcnRzKytcblxuXHRkZWYgcmVtb3ZlIG5vZGUsIHBhcmVudFxuXHRcdEByZW1vdmVzKytcblxuXHRkZWYgY2hhbmdlc1xuXHRcdEBpbnNlcnRzICsgQHJlbW92ZXNcblxuXHRkZWYgbW91bnQgbm9kZVxuXHRcdHJldHVybiBpZiAkbm9kZSRcblx0XHRAaGFzTW91bnRhYmxlcyA9IHllc1xuXG5cdGRlZiByZWZyZXNoIGZvcmNlID0gbm9cblx0XHRyZXR1cm4gaWYgJG5vZGUkXG5cdFx0cmV0dXJuIGlmICFmb3JjZSBhbmQgY2hhbmdlcyA9PSAwXG5cdFx0IyBjb25zb2xlLnRpbWUoJ3Jlc29sdmVNb3VudHMnKVxuXHRcdGlmIChAaW5zZXJ0cyBhbmQgQGhhc01vdW50YWJsZXMpIG9yIGZvcmNlXG5cdFx0XHR0cnlNb3VudFxuXG5cdFx0aWYgKEByZW1vdmVzIG9yIGZvcmNlKSBhbmQgQG1vdW50ZWQ6bGVuZ3RoXG5cdFx0XHR0cnlVbm1vdW50XG5cdFx0IyBjb25zb2xlLnRpbWVFbmQoJ3Jlc29sdmVNb3VudHMnKVxuXHRcdEBpbnNlcnRzID0gMFxuXHRcdEByZW1vdmVzID0gMFxuXHRcdHNlbGZcblxuXHRkZWYgdW5tb3VudCBub2RlXG5cdFx0c2VsZlxuXG5cdGRlZiB0cnlNb3VudFxuXHRcdHZhciBjb3VudCA9IDBcblx0XHR2YXIgcm9vdCA9IGRvY3VtZW50OmJvZHlcblx0XHR2YXIgaXRlbXMgPSByb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy5fX21vdW50Jylcblx0XHQjIHdoYXQgaWYgd2UgZW5kIHVwIGNyZWF0aW5nIGFkZGl0aW9uYWwgbW91bnRhYmxlcyBieSBtb3VudGluZz9cblx0XHRmb3IgZWwgaW4gaXRlbXNcblx0XHRcdGlmIGVsIGFuZCBlbC5AdGFnXG5cdFx0XHRcdGlmIEBtb3VudGVkLmluZGV4T2YoZWwuQHRhZykgPT0gLTFcblx0XHRcdFx0XHRtb3VudE5vZGUoZWwuQHRhZylcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBtb3VudE5vZGUgbm9kZVxuXHRcdEBtb3VudGVkLnB1c2gobm9kZSlcblx0XHRub2RlLkZMQUdTIHw9IEltYmEuVEFHX01PVU5URURcblx0XHRub2RlLm1vdW50IGlmIG5vZGU6bW91bnRcblx0XHRyZXR1cm5cblxuXHRkZWYgdHJ5VW5tb3VudFxuXHRcdHZhciBjb3VudCA9IDBcblx0XHR2YXIgcm9vdCA9IGRvY3VtZW50OmJvZHlcblx0XHRmb3IgaXRlbSwgaSBpbiBAbW91bnRlZFxuXHRcdFx0dW5sZXNzIGRvY3VtZW50OmRvY3VtZW50RWxlbWVudC5jb250YWlucyhpdGVtLkBkb20pXG5cdFx0XHRcdGl0ZW0uRkxBR1MgPSBpdGVtLkZMQUdTICYgfkltYmEuVEFHX01PVU5URURcblx0XHRcdFx0aWYgaXRlbTp1bm1vdW50IGFuZCBpdGVtLkBkb21cblx0XHRcdFx0XHRpdGVtLnVubW91bnRcblx0XHRcdFx0ZWxpZiBpdGVtLkBzY2hlZHVsZXJcblx0XHRcdFx0XHQjIE1BWUJFIEZJWCBUSElTP1xuXHRcdFx0XHRcdGl0ZW0udW5zY2hlZHVsZVxuXHRcdFx0XHRAbW91bnRlZFtpXSA9IG51bGxcblx0XHRcdFx0Y291bnQrK1xuXHRcdFxuXHRcdGlmIGNvdW50XG5cdFx0XHRAbW91bnRlZCA9IEBtb3VudGVkLmZpbHRlciBkbyB8aXRlbXwgaXRlbVxuXHRcdHNlbGZcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vbWFuYWdlci5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG5JbWJhLkNTU0tleU1hcCA9IHt9XG5cbkltYmEuVEFHX0JVSUxUID0gMVxuSW1iYS5UQUdfU0VUVVAgPSAyXG5JbWJhLlRBR19NT1VOVElORyA9IDRcbkltYmEuVEFHX01PVU5URUQgPSA4XG5JbWJhLlRBR19TQ0hFRFVMRUQgPSAxNlxuSW1iYS5UQUdfQVdBS0VORUQgPSAzMlxuXG4jIyNcbkdldCB0aGUgY3VycmVudCBkb2N1bWVudFxuIyMjXG5kZWYgSW1iYS5kb2N1bWVudFxuXHRpZiAkd2ViJFxuXHRcdHdpbmRvdzpkb2N1bWVudFxuXHRlbHNlXG5cdFx0QGRvY3VtZW50IHx8PSBJbWJhU2VydmVyRG9jdW1lbnQubmV3XG5cbiMjI1xuR2V0IHRoZSBib2R5IGVsZW1lbnQgd3JhcHBlZCBpbiBhbiBJbWJhLlRhZ1xuIyMjXG5kZWYgSW1iYS5yb290XG5cdHRhZyhJbWJhLmRvY3VtZW50OmJvZHkpXG5cbmRlZiBJbWJhLnN0YXRpYyBpdGVtcywgdHlwLCBuclxuXHRpdGVtcy5AdHlwZSA9IHR5cFxuXHRpdGVtczpzdGF0aWMgPSBuclxuXHRyZXR1cm4gaXRlbXNcblxuIyMjXG5cbiMjI1xuZGVmIEltYmEubW91bnQgbm9kZSwgaW50b1xuXHRpbnRvIHx8PSBJbWJhLmRvY3VtZW50OmJvZHlcblx0aW50by5hcHBlbmRDaGlsZChub2RlLmRvbSlcblx0SW1iYS5UYWdNYW5hZ2VyLmluc2VydChub2RlLGludG8pXG5cdG5vZGUuc2NoZWR1bGVyLmNvbmZpZ3VyZShldmVudHM6IHllcykuYWN0aXZhdGUobm8pXG5cdEltYmEuVGFnTWFuYWdlci5yZWZyZXNoXG5cdHJldHVybiBub2RlXG5cblxuZGVmIEltYmEuY3JlYXRlVGV4dE5vZGUgbm9kZVxuXHRpZiBub2RlIGFuZCBub2RlOm5vZGVUeXBlID09IDNcblx0XHRyZXR1cm4gbm9kZVxuXHRyZXR1cm4gSW1iYS5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShub2RlKVxuXG4jIyNcblRoaXMgaXMgdGhlIGJhc2VjbGFzcyB0aGF0IGFsbCB0YWdzIGluIGltYmEgaW5oZXJpdCBmcm9tLlxuQGluYW1lIG5vZGVcbiMjI1xuY2xhc3MgSW1iYS5UYWdcblxuXHRkZWYgc2VsZi5idWlsZE5vZGVcblx0XHR2YXIgZG9tID0gSW1iYS5kb2N1bWVudC5jcmVhdGVFbGVtZW50KEBub2RlVHlwZSBvciAnZGl2Jylcblx0XHRpZiBAY2xhc3Nlc1xuXHRcdFx0dmFyIGNscyA9IEBjbGFzc2VzLmpvaW4oXCIgXCIpXG5cdFx0XHRkb206Y2xhc3NOYW1lID0gY2xzIGlmIGNsc1xuXHRcdGRvbVxuXG5cdGRlZiBzZWxmLmNyZWF0ZU5vZGVcblx0XHR2YXIgcHJvdG8gPSAoQHByb3RvRG9tIHx8PSBidWlsZE5vZGUpXG5cdFx0cHJvdG8uY2xvbmVOb2RlKGZhbHNlKVxuXG5cdGRlZiBzZWxmLmJ1aWxkIGN0eFxuXHRcdHNlbGYubmV3KHNlbGYuY3JlYXRlTm9kZSxjdHgpXG5cblx0ZGVmIHNlbGYuZG9tXG5cdFx0QHByb3RvRG9tIHx8PSBidWlsZE5vZGVcblxuXHQjIyNcblx0Q2FsbGVkIHdoZW4gYSB0YWcgdHlwZSBpcyBiZWluZyBzdWJjbGFzc2VkLlxuXHQjIyNcblx0ZGVmIHNlbGYuaW5oZXJpdCBjaGlsZFxuXHRcdGNoaWxkLkBwcm90b0RvbSA9IG51bGxcblxuXHRcdGlmIEBub2RlVHlwZVxuXHRcdFx0Y2hpbGQuQG5vZGVUeXBlID0gQG5vZGVUeXBlXG5cdFx0XHRjaGlsZC5AY2xhc3NlcyA9IEBjbGFzc2VzLnNsaWNlXG5cblx0XHRcdGlmIGNoaWxkLkBmbGFnTmFtZVxuXHRcdFx0XHRjaGlsZC5AY2xhc3Nlcy5wdXNoKGNoaWxkLkBmbGFnTmFtZSlcblx0XHRlbHNlXG5cdFx0XHRjaGlsZC5Abm9kZVR5cGUgPSBjaGlsZC5AbmFtZVxuXHRcdFx0Y2hpbGQuQGZsYWdOYW1lID0gbnVsbFxuXHRcdFx0Y2hpbGQuQGNsYXNzZXMgPSBbXVxuXG5cdCMjI1xuXHRJbnRlcm5hbCBtZXRob2QgY2FsbGVkIGFmdGVyIGEgdGFnIGNsYXNzIGhhc1xuXHRiZWVuIGRlY2xhcmVkIG9yIGV4dGVuZGVkLlxuXHRcblx0QHByaXZhdGVcblx0IyMjXG5cdGRlZiBvcHRpbWl6ZVRhZ1N0cnVjdHVyZVxuXHRcdHZhciBiYXNlID0gSW1iYS5UYWc6cHJvdG90eXBlXG5cdFx0dmFyIGhhc1NldHVwICA9IHNlbGY6c2V0dXAgICE9IGJhc2U6c2V0dXBcblx0XHR2YXIgaGFzQ29tbWl0ID0gc2VsZjpjb21taXQgIT0gYmFzZTpjb21taXRcblx0XHR2YXIgaGFzUmVuZGVyID0gc2VsZjpyZW5kZXIgIT0gYmFzZTpyZW5kZXJcblx0XHR2YXIgaGFzTW91bnQgID0gc2VsZjptb3VudFxuXG5cdFx0dmFyIGN0b3IgPSBzZWxmOmNvbnN0cnVjdG9yXG5cblx0XHRpZiBoYXNDb21taXQgb3IgaGFzUmVuZGVyIG9yIGhhc01vdW50IG9yIGhhc1NldHVwXG5cblx0XHRcdHNlbGY6ZW5kID0gZG9cblx0XHRcdFx0aWYgdGhpczptb3VudCBhbmQgISh0aGlzLkZMQUdTICYgSW1iYS5UQUdfTU9VTlRFRClcblx0XHRcdFx0XHQjIGp1c3QgYWN0aXZhdGUgXG5cdFx0XHRcdFx0SW1iYS5UYWdNYW5hZ2VyLm1vdW50KHRoaXMpXG5cblx0XHRcdFx0dW5sZXNzIHRoaXMuRkxBR1MgJiBJbWJhLlRBR19TRVRVUFxuXHRcdFx0XHRcdHRoaXMuRkxBR1MgfD0gSW1iYS5UQUdfU0VUVVBcblx0XHRcdFx0XHR0aGlzLnNldHVwXG5cdFx0XHRcdFxuXHRcdFx0XHR0aGlzLmNvbW1pdFxuXG5cdFx0XHRcdHJldHVybiB0aGlzXG5cblx0XHRpZiAkd2ViJFxuXHRcdFx0aWYgaGFzTW91bnRcblx0XHRcdFx0aWYgY3Rvci5AY2xhc3NlcyBhbmQgY3Rvci5AY2xhc3Nlcy5pbmRleE9mKCdfX21vdW50JykgID09IC0xXG5cdFx0XHRcdFx0Y3Rvci5AY2xhc3Nlcy5wdXNoKCdfX21vdW50JylcblxuXHRcdFx0XHRpZiBjdG9yLkBwcm90b0RvbVxuXHRcdFx0XHRcdGN0b3IuQHByb3RvRG9tOmNsYXNzTGlzdC5hZGQoJ19fbW91bnQnKVxuXG5cdFx0XHRmb3IgaXRlbSBpbiBbOm1vdXNlbW92ZSw6bW91c2VlbnRlciw6bW91c2VsZWF2ZSw6bW91c2VvdmVyLDptb3VzZW91dCw6c2VsZWN0c3RhcnRdXG5cdFx0XHRcdEltYmEuRXZlbnRzLnJlZ2lzdGVyKGl0ZW0pIGlmIHRoaXNbXCJvbntpdGVtfVwiXVxuXHRcdHNlbGZcblxuXG5cdGRlZiBpbml0aWFsaXplIGRvbSxjdHhcblx0XHRzZWxmLmRvbSA9IGRvbVxuXHRcdHNlbGY6JCA9IFRhZ0NhY2hlLmJ1aWxkKHNlbGYpXG5cdFx0c2VsZjokdXAgPSBAb3duZXJfID0gY3R4XG5cdFx0QHRyZWVfID0gbnVsbFxuXHRcdHNlbGYuRkxBR1MgPSAwXG5cdFx0YnVpbGRcblx0XHRzZWxmXG5cblx0YXR0ciBuYW1lIGlubGluZTogbm9cblx0YXR0ciByb2xlIGlubGluZTogbm9cblx0YXR0ciB0YWJpbmRleCBpbmxpbmU6IG5vXG5cdGF0dHIgdGl0bGVcblxuXHRkZWYgZG9tXG5cdFx0QGRvbVxuXHRcdFxuXHRkZWYgc2V0RG9tIGRvbVxuXHRcdGRvbS5AdGFnID0gc2VsZlxuXHRcdEBkb20gPSBkb21cblx0XHRzZWxmXG5cblx0ZGVmIHJlZlxuXHRcdEByZWZcblx0XHRcblx0ZGVmIHJvb3Rcblx0XHRAb3duZXJfID8gQG93bmVyXy5yb290IDogc2VsZlxuXG5cdCMjI1xuXHRTZXR0aW5nIHJlZmVyZW5jZXMgZm9yIHRhZ3MgbGlrZVxuXHRgPGRpdkBoZWFkZXI+YCB3aWxsIGNvbXBpbGUgdG8gYHRhZygnZGl2JykucmVmXygnaGVhZGVyJyx0aGlzKS5lbmQoKWBcblx0QnkgZGVmYXVsdCBpdCBhZGRzIHRoZSByZWZlcmVuY2UgYXMgYSBjbGFzc05hbWUgdG8gdGhlIHRhZy5cblxuXHRAcmV0dXJuIHtzZWxmfVxuXHRAcHJpdmF0ZVxuXHQjIyNcblx0ZGVmIHJlZl8gcmVmXG5cdFx0ZmxhZyhAcmVmID0gcmVmKVxuXHRcdHNlbGZcblxuXHQjIyNcblx0U2V0IHRoZSBkYXRhIG9iamVjdCBmb3Igbm9kZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGRhdGE9IGRhdGFcblx0XHRAZGF0YSA9IGRhdGFcblxuXHQjIyNcblx0R2V0IHRoZSBkYXRhIG9iamVjdCBmb3Igbm9kZVxuXHQjIyNcblx0ZGVmIGRhdGFcblx0XHRAZGF0YVxuXHRcdFxuXHRcdFxuXHRkZWYgYmluZERhdGEgdGFyZ2V0LCBwYXRoLCBhcmdzXG5cdFx0c2V0RGF0YShhcmdzID8gdGFyZ2V0W3BhdGhdLmFwcGx5KHRhcmdldCxhcmdzKSA6IHRhcmdldFtwYXRoXSlcblxuXHQjIyNcblx0U2V0IGlubmVyIGh0bWwgb2Ygbm9kZVxuXHQjIyNcblx0ZGVmIGh0bWw9IGh0bWxcblx0XHRpZiBzZWxmLmh0bWwgIT0gaHRtbFxuXHRcdFx0QGRvbTppbm5lckhUTUwgPSBodG1sXG5cblx0IyMjXG5cdEdldCBpbm5lciBodG1sIG9mIG5vZGVcblx0IyMjXG5cdGRlZiBodG1sXG5cdFx0QGRvbTppbm5lckhUTUxcblx0XG5cdGRlZiBvbiQgc2xvdCxoYW5kbGVyXG5cdFx0bGV0IGhhbmRsZXJzID0gQG9uXyB8fD0gW11cblx0XHRsZXQgcHJldiA9IGhhbmRsZXJzW3Nsb3RdXG5cdFx0IyBzZWxmLWJvdW5kIGhhbmRsZXJzXG5cdFx0aWYgc2xvdCA8IDBcblx0XHRcdGlmIHByZXYgPT0gdW5kZWZpbmVkXG5cdFx0XHRcdHNsb3QgPSBoYW5kbGVyc1tzbG90XSA9IGhhbmRsZXJzOmxlbmd0aFxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRzbG90ID0gcHJldlxuXHRcdFx0cHJldiA9IGhhbmRsZXJzW3Nsb3RdXG5cdFx0XG5cdFx0aGFuZGxlcnNbc2xvdF0gPSBoYW5kbGVyXG5cdFx0aGFuZGxlcjpzdGF0ZSA9IHByZXY6c3RhdGUgaWYgcHJldlxuXHRcdHJldHVybiBzZWxmXG5cblxuXHRkZWYgaWQ9IGlkXG5cdFx0aWYgaWQgIT0gbnVsbFxuXHRcdFx0ZG9tOmlkID0gaWRcblxuXHRkZWYgaWRcblx0XHRkb206aWRcblxuXHQjIyNcblx0QWRkcyBhIG5ldyBhdHRyaWJ1dGUgb3IgY2hhbmdlcyB0aGUgdmFsdWUgb2YgYW4gZXhpc3RpbmcgYXR0cmlidXRlXG5cdG9uIHRoZSBzcGVjaWZpZWQgdGFnLiBJZiB0aGUgdmFsdWUgaXMgbnVsbCBvciBmYWxzZSwgdGhlIGF0dHJpYnV0ZVxuXHR3aWxsIGJlIHJlbW92ZWQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0QXR0cmlidXRlIG5hbWUsIHZhbHVlXG5cdFx0dmFyIG9sZCA9IGRvbS5nZXRBdHRyaWJ1dGUobmFtZSlcblxuXHRcdGlmIG9sZCA9PSB2YWx1ZVxuXHRcdFx0dmFsdWVcblx0XHRlbGlmIHZhbHVlICE9IG51bGwgJiYgdmFsdWUgIT09IGZhbHNlXG5cdFx0XHRkb20uc2V0QXR0cmlidXRlKG5hbWUsdmFsdWUpXG5cdFx0ZWxzZVxuXHRcdFx0ZG9tLnJlbW92ZUF0dHJpYnV0ZShuYW1lKVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIHNldE5lc3RlZEF0dHIgbnMsIG5hbWUsIHZhbHVlXG5cdFx0aWYgc2VsZltucysnU2V0QXR0cmlidXRlJ11cblx0XHRcdHNlbGZbbnMrJ1NldEF0dHJpYnV0ZSddKG5hbWUsdmFsdWUpXG5cdFx0ZWxzZVxuXHRcdFx0c2V0QXR0cmlidXRlTlMobnMsIG5hbWUsdmFsdWUpXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgc2V0QXR0cmlidXRlTlMgbnMsIG5hbWUsIHZhbHVlXG5cdFx0dmFyIG9sZCA9IGdldEF0dHJpYnV0ZU5TKG5zLG5hbWUpXG5cblx0XHRpZiBvbGQgIT0gdmFsdWVcblx0XHRcdGlmIHZhbHVlICE9IG51bGwgJiYgdmFsdWUgIT09IGZhbHNlIFxuXHRcdFx0XHRkb20uc2V0QXR0cmlidXRlTlMobnMsbmFtZSx2YWx1ZSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0ZG9tLnJlbW92ZUF0dHJpYnV0ZU5TKG5zLG5hbWUpXG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cdCMjI1xuXHRyZW1vdmVzIGFuIGF0dHJpYnV0ZSBmcm9tIHRoZSBzcGVjaWZpZWQgdGFnXG5cdCMjI1xuXHRkZWYgcmVtb3ZlQXR0cmlidXRlIG5hbWVcblx0XHRkb20ucmVtb3ZlQXR0cmlidXRlKG5hbWUpXG5cblx0IyMjXG5cdHJldHVybnMgdGhlIHZhbHVlIG9mIGFuIGF0dHJpYnV0ZSBvbiB0aGUgdGFnLlxuXHRJZiB0aGUgZ2l2ZW4gYXR0cmlidXRlIGRvZXMgbm90IGV4aXN0LCB0aGUgdmFsdWUgcmV0dXJuZWRcblx0d2lsbCBlaXRoZXIgYmUgbnVsbCBvciBcIlwiICh0aGUgZW1wdHkgc3RyaW5nKVxuXHQjIyNcblx0ZGVmIGdldEF0dHJpYnV0ZSBuYW1lXG5cdFx0ZG9tLmdldEF0dHJpYnV0ZShuYW1lKVxuXG5cblx0ZGVmIGdldEF0dHJpYnV0ZU5TIG5zLCBuYW1lXG5cdFx0ZG9tLmdldEF0dHJpYnV0ZU5TKG5zLG5hbWUpXG5cdFxuXHRcblx0ZGVmIHNldCBrZXksIHZhbHVlLCBtb2RzXG5cdFx0bGV0IHNldHRlciA9IEltYmEudG9TZXR0ZXIoa2V5KVxuXHRcdGlmIHNlbGZbc2V0dGVyXSBpc2EgRnVuY3Rpb25cblx0XHRcdHNlbGZbc2V0dGVyXSh2YWx1ZSxtb2RzKVxuXHRcdGVsc2Vcblx0XHRcdEBkb206c2V0QXR0cmlidXRlKGtleSx2YWx1ZSlcblx0XHRzZWxmXG5cdFxuXHRcblx0ZGVmIGdldCBrZXlcblx0XHRAZG9tOmdldEF0dHJpYnV0ZShrZXkpXG5cblx0IyMjXG5cdE92ZXJyaWRlIHRoaXMgdG8gcHJvdmlkZSBzcGVjaWFsIHdyYXBwaW5nIGV0Yy5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXRDb250ZW50IGNvbnRlbnQsIHR5cGVcblx0XHRzZXRDaGlsZHJlbiBjb250ZW50LCB0eXBlXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTZXQgdGhlIGNoaWxkcmVuIG9mIG5vZGUuIHR5cGUgcGFyYW0gaXMgb3B0aW9uYWwsXG5cdGFuZCBzaG91bGQgb25seSBiZSB1c2VkIGJ5IEltYmEgd2hlbiBjb21waWxpbmcgdGFnIHRyZWVzLiBcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXRDaGlsZHJlbiBub2RlcywgdHlwZVxuXHRcdCMgb3ZlcnJpZGRlbiBvbiBjbGllbnQgYnkgcmVjb25jaWxlclxuXHRcdEB0cmVlXyA9IG5vZGVzXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTZXQgdGhlIHRlbXBsYXRlIHRoYXQgd2lsbCByZW5kZXIgdGhlIGNvbnRlbnQgb2Ygbm9kZS5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXRUZW1wbGF0ZSB0ZW1wbGF0ZVxuXHRcdHVubGVzcyBAdGVtcGxhdGVcblx0XHRcdCMgb3ZlcnJpZGUgdGhlIGJhc2ljXG5cdFx0XHRpZiBzZWxmOnJlbmRlciA9PSBJbWJhLlRhZzpwcm90b3R5cGU6cmVuZGVyXG5cdFx0XHRcdHNlbGY6cmVuZGVyID0gc2VsZjpyZW5kZXJUZW1wbGF0ZSAjIGRvIHNldENoaWxkcmVuKHJlbmRlclRlbXBsYXRlKVxuXHRcdFx0c2VsZi5vcHRpbWl6ZVRhZ1N0cnVjdHVyZVxuXG5cdFx0c2VsZjp0ZW1wbGF0ZSA9IEB0ZW1wbGF0ZSA9IHRlbXBsYXRlXG5cdFx0c2VsZlxuXG5cdGRlZiB0ZW1wbGF0ZVxuXHRcdG51bGxcblxuXHQjIyNcblx0SWYgbm8gY3VzdG9tIHJlbmRlci1tZXRob2QgaXMgZGVmaW5lZCwgYW5kIHRoZSBub2RlXG5cdGhhcyBhIHRlbXBsYXRlLCB0aGlzIG1ldGhvZCB3aWxsIGJlIHVzZWQgdG8gcmVuZGVyXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgcmVuZGVyVGVtcGxhdGVcblx0XHR2YXIgYm9keSA9IHRlbXBsYXRlXG5cdFx0c2V0Q2hpbGRyZW4oYm9keSkgaWYgYm9keSAhPSBzZWxmXG5cdFx0c2VsZlxuXG5cblx0IyMjXG5cdFJlbW92ZSBzcGVjaWZpZWQgY2hpbGQgZnJvbSBjdXJyZW50IG5vZGUuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgcmVtb3ZlQ2hpbGQgY2hpbGRcblx0XHR2YXIgcGFyID0gZG9tXG5cdFx0dmFyIGVsID0gY2hpbGQuQGRvbSBvciBjaGlsZFxuXHRcdGlmIGVsIGFuZCBlbDpwYXJlbnROb2RlID09IHBhclxuXHRcdFx0cGFyLnJlbW92ZUNoaWxkKGVsKVxuXHRcdFx0SW1iYS5UYWdNYW5hZ2VyLnJlbW92ZShlbC5AdGFnIG9yIGVsLHNlbGYpXG5cdFx0c2VsZlxuXHRcblx0IyMjXG5cdFJlbW92ZSBhbGwgY29udGVudCBpbnNpZGUgbm9kZVxuXHQjIyNcblx0ZGVmIHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0aWYgQGRvbTpmaXJzdENoaWxkXG5cdFx0XHRAZG9tLnJlbW92ZUNoaWxkKEBkb206Zmlyc3RDaGlsZCkgd2hpbGUgQGRvbTpmaXJzdENoaWxkXG5cdFx0XHRJbWJhLlRhZ01hbmFnZXIucmVtb3ZlKG51bGwsc2VsZikgIyBzaG91bGQgcmVnaXN0ZXIgZWFjaCBjaGlsZD9cblx0XHRAdHJlZV8gPSBAdGV4dF8gPSBudWxsXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRBcHBlbmQgYSBzaW5nbGUgaXRlbSAobm9kZSBvciBzdHJpbmcpIHRvIHRoZSBjdXJyZW50IG5vZGUuXG5cdElmIHN1cHBsaWVkIGl0ZW0gaXMgYSBzdHJpbmcgaXQgd2lsbCBhdXRvbWF0aWNhbGx5LiBUaGlzIGlzIHVzZWRcblx0YnkgSW1iYSBpbnRlcm5hbGx5LCBidXQgd2lsbCBwcmFjdGljYWxseSBuZXZlciBiZSB1c2VkIGV4cGxpY2l0bHkuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgYXBwZW5kQ2hpbGQgbm9kZVxuXHRcdGlmIG5vZGUgaXNhIFN0cmluZ1xuXHRcdFx0ZG9tLmFwcGVuZENoaWxkKEltYmEuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZSkpXG5cdFx0ZWxpZiBub2RlXG5cdFx0XHRkb20uYXBwZW5kQ2hpbGQobm9kZS5AZG9tIG9yIG5vZGUpXG5cdFx0XHRJbWJhLlRhZ01hbmFnZXIuaW5zZXJ0KG5vZGUuQHRhZyBvciBub2RlLCBzZWxmKVxuXHRcdFx0IyBGSVhNRSBlbnN1cmUgdGhlc2UgYXJlIG5vdCBjYWxsZWQgZm9yIHRleHQgbm9kZXNcblx0XHRzZWxmXG5cblx0IyMjXG5cdEluc2VydCBhIG5vZGUgaW50byB0aGUgY3VycmVudCBub2RlIChzZWxmKSwgYmVmb3JlIGFub3RoZXIuXG5cdFRoZSByZWxhdGl2ZSBub2RlIG11c3QgYmUgYSBjaGlsZCBvZiBjdXJyZW50IG5vZGUuIFxuXHQjIyNcblx0ZGVmIGluc2VydEJlZm9yZSBub2RlLCByZWxcblx0XHRpZiBub2RlIGlzYSBTdHJpbmdcblx0XHRcdG5vZGUgPSBJbWJhLmRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpXG5cblx0XHRpZiBub2RlIGFuZCByZWxcblx0XHRcdGRvbS5pbnNlcnRCZWZvcmUoIChub2RlLkBkb20gb3Igbm9kZSksIChyZWwuQGRvbSBvciByZWwpIClcblx0XHRcdEltYmEuVGFnTWFuYWdlci5pbnNlcnQobm9kZS5AdGFnIG9yIG5vZGUsIHNlbGYpXG5cdFx0XHQjIEZJWE1FIGVuc3VyZSB0aGVzZSBhcmUgbm90IGNhbGxlZCBmb3IgdGV4dCBub2Rlc1xuXHRcdHNlbGZcblxuXG5cdCMjI1xuXHRSZW1vdmUgbm9kZSBmcm9tIHRoZSBkb20gdHJlZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIG9ycGhhbml6ZVxuXHRcdHBhci5yZW1vdmVDaGlsZChzZWxmKSBpZiBsZXQgcGFyID0gcGFyZW50XG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblx0R2V0IHRleHQgb2Ygbm9kZS4gVXNlcyB0ZXh0Q29udGVudCBiZWhpbmQgdGhlIHNjZW5lcyAobm90IGlubmVyVGV4dClcblx0W2h0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Ob2RlL3RleHRDb250ZW50XSgpXG5cdEByZXR1cm4ge3N0cmluZ30gaW5uZXIgdGV4dCBvZiBub2RlXG5cdCMjI1xuXHRkZWYgdGV4dCB2XG5cdFx0QGRvbTp0ZXh0Q29udGVudFxuXG5cdCMjI1xuXHRTZXQgdGV4dCBvZiBub2RlLiBVc2VzIHRleHRDb250ZW50IGJlaGluZCB0aGUgc2NlbmVzIChub3QgaW5uZXJUZXh0KVxuXHRbaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL05vZGUvdGV4dENvbnRlbnRdKClcblx0IyMjXG5cdGRlZiB0ZXh0PSB0eHRcblx0XHRAdHJlZV8gPSB0eHRcblx0XHRAZG9tOnRleHRDb250ZW50ID0gKHR4dCA9PSBudWxsIG9yIHRleHQgPT09IGZhbHNlKSA/ICcnIDogdHh0XG5cdFx0c2VsZlxuXG5cblx0IyMjXG5cdE1ldGhvZCBmb3IgZ2V0dGluZyBhbmQgc2V0dGluZyBkYXRhLWF0dHJpYnV0ZXMuIFdoZW4gY2FsbGVkIHdpdGggemVyb1xuXHRhcmd1bWVudHMgaXQgd2lsbCByZXR1cm4gdGhlIGFjdHVhbCBkYXRhc2V0IGZvciB0aGUgdGFnLlxuXG5cdFx0dmFyIG5vZGUgPSA8ZGl2IGRhdGEtbmFtZT0naGVsbG8nPlxuXHRcdCMgZ2V0IHRoZSB3aG9sZSBkYXRhc2V0XG5cdFx0bm9kZS5kYXRhc2V0ICMge25hbWU6ICdoZWxsbyd9XG5cdFx0IyBnZXQgYSBzaW5nbGUgdmFsdWVcblx0XHRub2RlLmRhdGFzZXQoJ25hbWUnKSAjICdoZWxsbydcblx0XHQjIHNldCBhIHNpbmdsZSB2YWx1ZVxuXHRcdG5vZGUuZGF0YXNldCgnbmFtZScsJ25ld25hbWUnKSAjIHNlbGZcblxuXG5cdCMjI1xuXHRkZWYgZGF0YXNldCBrZXksIHZhbFxuXHRcdGlmIGtleSBpc2EgT2JqZWN0XG5cdFx0XHRkYXRhc2V0KGssdikgZm9yIG93biBrLHYgb2Yga2V5XG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0aWYgYXJndW1lbnRzOmxlbmd0aCA9PSAyXG5cdFx0XHRzZXRBdHRyaWJ1dGUoXCJkYXRhLXtrZXl9XCIsdmFsKVxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdGlmIGtleVxuXHRcdFx0cmV0dXJuIGdldEF0dHJpYnV0ZShcImRhdGEte2tleX1cIilcblxuXHRcdHZhciBkYXRhc2V0ID0gZG9tOmRhdGFzZXRcblxuXHRcdHVubGVzcyBkYXRhc2V0XG5cdFx0XHRkYXRhc2V0ID0ge31cblx0XHRcdGZvciBhdHIsaSBpbiBkb206YXR0cmlidXRlc1xuXHRcdFx0XHRpZiBhdHI6bmFtZS5zdWJzdHIoMCw1KSA9PSAnZGF0YS0nXG5cdFx0XHRcdFx0ZGF0YXNldFtJbWJhLnRvQ2FtZWxDYXNlKGF0cjpuYW1lLnNsaWNlKDUpKV0gPSBhdHI6dmFsdWVcblxuXHRcdHJldHVybiBkYXRhc2V0XG5cblx0IyMjXG5cdEVtcHR5IHBsYWNlaG9sZGVyLiBPdmVycmlkZSB0byBpbXBsZW1lbnQgY3VzdG9tIHJlbmRlciBiZWhhdmlvdXIuXG5cdFdvcmtzIG11Y2ggbGlrZSB0aGUgZmFtaWxpYXIgcmVuZGVyLW1ldGhvZCBpbiBSZWFjdC5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiByZW5kZXJcblx0XHRzZWxmXG5cblx0IyMjXG5cdENhbGxlZCBpbXBsaWNpdGx5IHdoaWxlIHRhZyBpcyBpbml0aWFsaXppbmcuIE5vIGluaXRpYWwgcHJvcHNcblx0d2lsbCBoYXZlIGJlZW4gc2V0IGF0IHRoaXMgcG9pbnQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgYnVpbGRcblx0XHRzZWxmXG5cblx0IyMjXG5cdENhbGxlZCBvbmNlLCBpbXBsaWNpdGx5IHRocm91Z2ggSW1iYS5UYWcjZW5kLiBBbGwgaW5pdGlhbCBwcm9wc1xuXHRhbmQgY2hpbGRyZW4gd2lsbCBoYXZlIGJlZW4gc2V0IGJlZm9yZSBzZXR1cCBpcyBjYWxsZWQuXG5cdHNldENvbnRlbnQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0dXBcblx0XHRzZWxmXG5cblx0IyMjXG5cdENhbGxlZCBpbXBsaWNpdGx5IHRocm91Z2ggSW1iYS5UYWcjZW5kLCBmb3IgdGFncyB0aGF0IGFyZSBwYXJ0IG9mXG5cdGEgdGFnIHRyZWUgKHRoYXQgYXJlIHJlbmRlcmVkIHNldmVyYWwgdGltZXMpLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGNvbW1pdFxuXHRcdHJlbmRlclxuXHRcdHNlbGZcblxuXHQjIyNcblxuXHRDYWxsZWQgYnkgdGhlIHRhZy1zY2hlZHVsZXIgKGlmIHRoaXMgdGFnIGlzIHNjaGVkdWxlZClcblx0QnkgZGVmYXVsdCBpdCB3aWxsIGNhbGwgdGhpcy5yZW5kZXIuIERvIG5vdCBvdmVycmlkZSB1bmxlc3Ncblx0eW91IHJlYWxseSB1bmRlcnN0YW5kIGl0LlxuXG5cdCMjI1xuXHRkZWYgdGlja1xuXHRcdHJlbmRlclxuXHRcdHNlbGZcblxuXHQjIyNcblx0XG5cdEEgdmVyeSBpbXBvcnRhbnQgbWV0aG9kIHRoYXQgeW91IHdpbGwgcHJhY3RpY2FsbHkgbmV2ZXIgbWFudWFsbHkuXG5cdFRoZSB0YWcgc3ludGF4IG9mIEltYmEgY29tcGlsZXMgdG8gYSBjaGFpbiBvZiBzZXR0ZXJzLCB3aGljaCBhbHdheXNcblx0ZW5kcyB3aXRoIC5lbmQuIGA8YS5sYXJnZT5gIGNvbXBpbGVzIHRvIGB0YWcoJ2EnKS5mbGFnKCdsYXJnZScpLmVuZCgpYFxuXHRcblx0WW91IGFyZSBoaWdobHkgYWR2aWNlZCB0byBub3Qgb3ZlcnJpZGUgaXRzIGJlaGF2aW91ci4gVGhlIGZpcnN0IHRpbWVcblx0ZW5kIGlzIGNhbGxlZCBpdCB3aWxsIG1hcmsgdGhlIHRhZyBhcyBpbml0aWFsaXplZCBhbmQgY2FsbCBJbWJhLlRhZyNzZXR1cCxcblx0YW5kIGNhbGwgSW1iYS5UYWcjY29tbWl0IGV2ZXJ5IHRpbWUuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgZW5kXG5cdFx0c2VsZlxuXHRcdFxuXHQjIGNhbGxlZCBvbiA8c2VsZj4gdG8gY2hlY2sgaWYgc2VsZiBpcyBjYWxsZWQgZnJvbSBvdGhlciBwbGFjZXNcblx0ZGVmICRvcGVuIGNvbnRleHRcblx0XHRpZiBjb250ZXh0ICE9IEBjb250ZXh0X1xuXHRcdFx0QHRyZWVfID0gbnVsbFxuXHRcdFx0QGNvbnRleHRfID0gY29udGV4dFxuXHRcdHNlbGZcblxuXHQjIyNcblx0VGhpcyBpcyBjYWxsZWQgaW5zdGVhZCBvZiBJbWJhLlRhZyNlbmQgZm9yIGA8c2VsZj5gIHRhZyBjaGFpbnMuXG5cdERlZmF1bHRzIHRvIG5vb3Bcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzeW5jZWRcblx0XHRzZWxmXG5cblx0IyBjYWxsZWQgd2hlbiB0aGUgbm9kZSBpcyBhd2FrZW5lZCBpbiB0aGUgZG9tIC0gZWl0aGVyIGF1dG9tYXRpY2FsbHlcblx0IyB1cG9uIGF0dGFjaG1lbnQgdG8gdGhlIGRvbS10cmVlLCBvciB0aGUgZmlyc3QgdGltZSBpbWJhIG5lZWRzIHRoZVxuXHQjIHRhZyBmb3IgYSBkb21ub2RlIHRoYXQgaGFzIGJlZW4gcmVuZGVyZWQgb24gdGhlIHNlcnZlclxuXHRkZWYgYXdha2VuXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRMaXN0IG9mIGZsYWdzIGZvciB0aGlzIG5vZGUuIFxuXHQjIyNcblx0ZGVmIGZsYWdzXG5cdFx0QGRvbTpjbGFzc0xpc3RcblxuXHQjIyNcblx0QWRkIHNwZWZpY2llZCBmbGFnIHRvIGN1cnJlbnQgbm9kZS5cblx0SWYgYSBzZWNvbmQgYXJndW1lbnQgaXMgc3VwcGxpZWQsIGl0IHdpbGwgYmUgY29lcmNlZCBpbnRvIGEgQm9vbGVhbixcblx0YW5kIHVzZWQgdG8gaW5kaWNhdGUgd2hldGhlciB3ZSBzaG91bGQgcmVtb3ZlIHRoZSBmbGFnIGluc3RlYWQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgZmxhZyBuYW1lLCB0b2dnbGVyXG5cdFx0IyBpdCBpcyBtb3N0IG5hdHVyYWwgdG8gdHJlYXQgYSBzZWNvbmQgdW5kZWZpbmVkIGFyZ3VtZW50IGFzIGEgbm8tc3dpdGNoXG5cdFx0IyBzbyB3ZSBuZWVkIHRvIGNoZWNrIHRoZSBhcmd1bWVudHMtbGVuZ3RoXG5cdFx0aWYgYXJndW1lbnRzOmxlbmd0aCA9PSAyXG5cdFx0XHRpZiBAZG9tOmNsYXNzTGlzdC5jb250YWlucyhuYW1lKSAhPSAhIXRvZ2dsZXJcblx0XHRcdFx0QGRvbTpjbGFzc0xpc3QudG9nZ2xlKG5hbWUpXG5cdFx0ZWxzZVxuXHRcdFx0IyBmaXJlZm94IHdpbGwgdHJpZ2dlciBhIGNoYW5nZSBpZiBhZGRpbmcgZXhpc3RpbmcgY2xhc3Ncblx0XHRcdEBkb206Y2xhc3NMaXN0LmFkZChuYW1lKSB1bmxlc3MgQGRvbTpjbGFzc0xpc3QuY29udGFpbnMobmFtZSlcblx0XHRyZXR1cm4gc2VsZlxuXG5cdCMjI1xuXHRSZW1vdmUgc3BlY2lmaWVkIGZsYWcgZnJvbSBub2RlXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgdW5mbGFnIG5hbWVcblx0XHRAZG9tOmNsYXNzTGlzdC5yZW1vdmUobmFtZSlcblx0XHRzZWxmXG5cblx0IyMjXG5cdFRvZ2dsZSBzcGVjaWZpZWQgZmxhZyBvbiBub2RlXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgdG9nZ2xlRmxhZyBuYW1lXG5cdFx0QGRvbTpjbGFzc0xpc3QudG9nZ2xlKG5hbWUpXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRDaGVjayB3aGV0aGVyIGN1cnJlbnQgbm9kZSBoYXMgc3BlY2lmaWVkIGZsYWdcblx0QHJldHVybiB7Ym9vbH1cblx0IyMjXG5cdGRlZiBoYXNGbGFnIG5hbWVcblx0XHRAZG9tOmNsYXNzTGlzdC5jb250YWlucyhuYW1lKVxuXG5cdFxuXHRkZWYgZmxhZ0lmIGZsYWcsIGJvb2xcblx0XHR2YXIgZiA9IEBmbGFnc18gfHw9IHt9XG5cdFx0bGV0IHByZXYgPSBmW2ZsYWddXG5cblx0XHRpZiBib29sIGFuZCAhcHJldlxuXHRcdFx0QGRvbTpjbGFzc0xpc3QuYWRkKGZsYWcpXG5cdFx0XHRmW2ZsYWddID0geWVzXG5cdFx0ZWxpZiBwcmV2IGFuZCAhYm9vbFxuXHRcdFx0QGRvbTpjbGFzc0xpc3QucmVtb3ZlKGZsYWcpXG5cdFx0XHRmW2ZsYWddID0gbm9cblxuXHRcdHJldHVybiBzZWxmXG5cdFx0XG5cdCMjI1xuXHRTZXQvdXBkYXRlIGEgbmFtZWQgZmxhZy4gSXQgcmVtZW1iZXJzIHRoZSBwcmV2aW91c1xuXHR2YWx1ZSBvZiB0aGUgZmxhZywgYW5kIHJlbW92ZXMgaXQgYmVmb3JlIHNldHRpbmcgdGhlIG5ldyB2YWx1ZS5cblxuXHRcdG5vZGUuc2V0RmxhZygndHlwZScsJ3RvZG8nKVxuXHRcdG5vZGUuc2V0RmxhZygndHlwZScsJ3Byb2plY3QnKVxuXHRcdCMgdG9kbyBpcyByZW1vdmVkLCBwcm9qZWN0IGlzIGFkZGVkLlxuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0RmxhZyBuYW1lLCB2YWx1ZVxuXHRcdGxldCBmbGFncyA9IEBuYW1lZEZsYWdzXyB8fD0ge31cblx0XHRsZXQgcHJldiA9IGZsYWdzW25hbWVdXG5cdFx0aWYgcHJldiAhPSB2YWx1ZVxuXHRcdFx0dW5mbGFnKHByZXYpIGlmIHByZXZcblx0XHRcdGZsYWcodmFsdWUpIGlmIHZhbHVlXG5cdFx0XHRmbGFnc1tuYW1lXSA9IHZhbHVlXG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cdCMjI1xuXHRHZXQgdGhlIHNjaGVkdWxlciBmb3IgdGhpcyBub2RlLiBBIG5ldyBzY2hlZHVsZXIgd2lsbCBiZSBjcmVhdGVkXG5cdGlmIGl0IGRvZXMgbm90IGFscmVhZHkgZXhpc3QuXG5cblx0QHJldHVybiB7SW1iYS5TY2hlZHVsZXJ9XG5cdCMjI1xuXHRkZWYgc2NoZWR1bGVyXG5cdFx0QHNjaGVkdWxlciA/PSBJbWJhLlNjaGVkdWxlci5uZXcoc2VsZilcblxuXHQjIyNcblxuXHRTaG9ydGhhbmQgdG8gc3RhcnQgc2NoZWR1bGluZyBhIG5vZGUuIFRoZSBtZXRob2Qgd2lsbCBiYXNpY2FsbHlcblx0cHJveHkgdGhlIGFyZ3VtZW50cyB0aHJvdWdoIHRvIHNjaGVkdWxlci5jb25maWd1cmUsIGFuZCB0aGVuXG5cdGFjdGl2YXRlIHRoZSBzY2hlZHVsZXIuXG5cdFxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNjaGVkdWxlIG9wdGlvbnMgPSB7ZXZlbnRzOiB5ZXN9XG5cdFx0c2NoZWR1bGVyLmNvbmZpZ3VyZShvcHRpb25zKS5hY3RpdmF0ZVxuXHRcdHNlbGZcblxuXHQjIyNcblx0U2hvcnRoYW5kIGZvciBkZWFjdGl2YXRpbmcgc2NoZWR1bGVyIChpZiB0YWcgaGFzIG9uZSkuXG5cdEBkZXByZWNhdGVkXG5cdCMjI1xuXHRkZWYgdW5zY2hlZHVsZVxuXHRcdHNjaGVkdWxlci5kZWFjdGl2YXRlIGlmIEBzY2hlZHVsZXJcblx0XHRzZWxmXG5cblxuXHQjIyNcblx0R2V0IHRoZSBwYXJlbnQgb2YgY3VycmVudCBub2RlXG5cdEByZXR1cm4ge0ltYmEuVGFnfSBcblx0IyMjXG5cdGRlZiBwYXJlbnRcblx0XHRJbWJhLmdldFRhZ0ZvckRvbShkb206cGFyZW50Tm9kZSlcblxuXHQjIyNcblx0R2V0IHRoZSBjaGlsZHJlbiBvZiBub2RlXG5cdEByZXR1cm4ge0ltYmEuVGFnW119XG5cdCMjI1xuXHRkZWYgY2hpbGRyZW4gc2VsXG5cdFx0Zm9yIGl0ZW0gaW4gQGRvbTpjaGlsZHJlblxuXHRcdFx0aXRlbS5AdGFnIG9yIEltYmEuZ2V0VGFnRm9yRG9tKGl0ZW0pXG5cdFxuXHRkZWYgcXVlcnlTZWxlY3RvciBxXG5cdFx0SW1iYS5nZXRUYWdGb3JEb20oQGRvbS5xdWVyeVNlbGVjdG9yKHEpKVxuXG5cdGRlZiBxdWVyeVNlbGVjdG9yQWxsIHFcblx0XHR2YXIgaXRlbXMgPSBbXVxuXHRcdGZvciBpdGVtIGluIEBkb20ucXVlcnlTZWxlY3RvckFsbChxKVxuXHRcdFx0aXRlbXMucHVzaCggSW1iYS5nZXRUYWdGb3JEb20oaXRlbSkgKVxuXHRcdHJldHVybiBpdGVtc1xuXG5cdCMjI1xuXHRDaGVjayBpZiB0aGlzIG5vZGUgbWF0Y2hlcyBhIHNlbGVjdG9yXG5cdEByZXR1cm4ge0Jvb2xlYW59XG5cdCMjI1xuXHRkZWYgbWF0Y2hlcyBzZWxcblx0XHRpZiBzZWwgaXNhIEZ1bmN0aW9uXG5cdFx0XHRyZXR1cm4gc2VsKHNlbGYpXG5cblx0XHRzZWwgPSBzZWwucXVlcnkgaWYgc2VsOnF1ZXJ5IGlzYSBGdW5jdGlvblxuXHRcdGlmIHZhciBmbiA9IChAZG9tOm1hdGNoZXMgb3IgQGRvbTptYXRjaGVzU2VsZWN0b3Igb3IgQGRvbTp3ZWJraXRNYXRjaGVzU2VsZWN0b3Igb3IgQGRvbTptc01hdGNoZXNTZWxlY3RvciBvciBAZG9tOm1vek1hdGNoZXNTZWxlY3Rvcilcblx0XHRcdHJldHVybiBmbi5jYWxsKEBkb20sc2VsKVxuXG5cdCMjI1xuXHRHZXQgdGhlIGZpcnN0IGVsZW1lbnQgbWF0Y2hpbmcgc3VwcGxpZWQgc2VsZWN0b3IgLyBmaWx0ZXJcblx0dHJhdmVyc2luZyB1cHdhcmRzLCBidXQgaW5jbHVkaW5nIHRoZSBub2RlIGl0c2VsZi5cblx0QHJldHVybiB7SW1iYS5UYWd9XG5cdCMjI1xuXHRkZWYgY2xvc2VzdCBzZWxcblx0XHRJbWJhLmdldFRhZ0ZvckRvbShAZG9tLmNsb3Nlc3Qoc2VsKSlcblxuXHQjIyNcblx0Q2hlY2sgaWYgbm9kZSBjb250YWlucyBvdGhlciBub2RlXG5cdEByZXR1cm4ge0Jvb2xlYW59IFxuXHQjIyNcblx0ZGVmIGNvbnRhaW5zIG5vZGVcblx0XHRkb20uY29udGFpbnMobm9kZS5AZG9tIG9yIG5vZGUpXG5cblxuXHQjIyNcblx0U2hvcnRoYW5kIGZvciBjb25zb2xlLmxvZyBvbiBlbGVtZW50c1xuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGxvZyAqYXJnc1xuXHRcdGFyZ3MudW5zaGlmdChjb25zb2xlKVxuXHRcdEZ1bmN0aW9uOnByb3RvdHlwZTpjYWxsLmFwcGx5KGNvbnNvbGU6bG9nLCBhcmdzKVxuXHRcdHNlbGZcblxuXHRkZWYgY3NzIGtleSwgdmFsXG5cdFx0aWYga2V5IGlzYSBPYmplY3Rcblx0XHRcdGNzcyhrLHYpIGZvciBvd24gayx2IG9mIGtleVxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdHZhciBuYW1lID0gSW1iYS5DU1NLZXlNYXBba2V5XSBvciBrZXlcblxuXHRcdGlmIHZhbCA9PSBudWxsXG5cdFx0XHRkb206c3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSlcblx0XHRlbGlmIHZhbCA9PSB1bmRlZmluZWQgYW5kIGFyZ3VtZW50czpsZW5ndGggPT0gMVxuXHRcdFx0cmV0dXJuIGRvbTpzdHlsZVtuYW1lXVxuXHRcdGVsc2Vcblx0XHRcdGlmIHZhbCBpc2EgTnVtYmVyIGFuZCBuYW1lLm1hdGNoKC93aWR0aHxoZWlnaHR8bGVmdHxyaWdodHx0b3B8Ym90dG9tLylcblx0XHRcdFx0ZG9tOnN0eWxlW25hbWVdID0gdmFsICsgXCJweFwiXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGRvbTpzdHlsZVtuYW1lXSA9IHZhbFxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIHNldFN0eWxlIHN0eWxlXG5cdFx0c2V0QXR0cmlidXRlKCdzdHlsZScsc3R5bGUpXG5cblx0ZGVmIHN0eWxlXG5cdFx0Z2V0QXR0cmlidXRlKCdzdHlsZScpXG5cblx0IyMjXG5cdFRyaWdnZXIgYW4gZXZlbnQgZnJvbSBjdXJyZW50IG5vZGUuIERpc3BhdGNoZWQgdGhyb3VnaCB0aGUgSW1iYSBldmVudCBtYW5hZ2VyLlxuXHRUbyBkaXNwYXRjaCBhY3R1YWwgZG9tIGV2ZW50cywgdXNlIGRvbS5kaXNwYXRjaEV2ZW50IGluc3RlYWQuXG5cblx0QHJldHVybiB7SW1iYS5FdmVudH1cblx0IyMjXG5cdGRlZiB0cmlnZ2VyIG5hbWUsIGRhdGEgPSB7fVxuXHRcdCR3ZWIkID8gSW1iYS5FdmVudHMudHJpZ2dlcihuYW1lLHNlbGYsZGF0YTogZGF0YSkgOiBudWxsXG5cblx0IyMjXG5cdEZvY3VzIG9uIGN1cnJlbnQgbm9kZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGZvY3VzXG5cdFx0ZG9tLmZvY3VzXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRSZW1vdmUgZm9jdXMgZnJvbSBjdXJyZW50IG5vZGVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBibHVyXG5cdFx0ZG9tLmJsdXJcblx0XHRzZWxmXG5cblx0ZGVmIHRvU3RyaW5nXG5cdFx0ZG9tOm91dGVySFRNTFxuXHRcblxuSW1iYS5UYWc6cHJvdG90eXBlOmluaXRpYWxpemUgPSBJbWJhLlRhZ1xuXG5jbGFzcyBJbWJhLlNWR1RhZyA8IEltYmEuVGFnXG5cblx0ZGVmIHNlbGYubmFtZXNwYWNlVVJJXG5cdFx0XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXG5cblx0ZGVmIHNlbGYuYnVpbGROb2RlXG5cdFx0dmFyIGRvbSA9IEltYmEuZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSxAbm9kZVR5cGUpXG5cdFx0dmFyIGNscyA9IEBjbGFzc2VzLmpvaW4oXCIgXCIpXG5cdFx0ZG9tOmNsYXNzTmFtZTpiYXNlVmFsID0gY2xzIGlmIGNsc1xuXHRcdGRvbVxuXG5cdGRlZiBzZWxmLmluaGVyaXQgY2hpbGRcblx0XHRjaGlsZC5AcHJvdG9Eb20gPSBudWxsXG5cdFx0aWYgY2hpbGQuQG5hbWUgaW4gSW1iYS5TVkdfVEFHU1xuXHRcdFx0Y2hpbGQuQG5vZGVUeXBlID0gY2hpbGQuQG5hbWVcblx0XHRcdGNoaWxkLkBjbGFzc2VzID0gW11cblx0XHRlbHNlXG5cdFx0XHRjaGlsZC5Abm9kZVR5cGUgPSBAbm9kZVR5cGVcblx0XHRcdHZhciBjbGFzc05hbWUgPSBcIl9cIiArIGNoaWxkLkBuYW1lLnJlcGxhY2UoL18vZywgJy0nKVxuXHRcdFx0Y2hpbGQuQGNsYXNzZXMgPSBAY2xhc3Nlcy5jb25jYXQoY2xhc3NOYW1lKVxuXG5JbWJhLkhUTUxfVEFHUyA9IFwiYSBhYmJyIGFkZHJlc3MgYXJlYSBhcnRpY2xlIGFzaWRlIGF1ZGlvIGIgYmFzZSBiZGkgYmRvIGJpZyBibG9ja3F1b3RlIGJvZHkgYnIgYnV0dG9uIGNhbnZhcyBjYXB0aW9uIGNpdGUgY29kZSBjb2wgY29sZ3JvdXAgZGF0YSBkYXRhbGlzdCBkZCBkZWwgZGV0YWlscyBkZm4gZGl2IGRsIGR0IGVtIGVtYmVkIGZpZWxkc2V0IGZpZ2NhcHRpb24gZmlndXJlIGZvb3RlciBmb3JtIGgxIGgyIGgzIGg0IGg1IGg2IGhlYWQgaGVhZGVyIGhyIGh0bWwgaSBpZnJhbWUgaW1nIGlucHV0IGlucyBrYmQga2V5Z2VuIGxhYmVsIGxlZ2VuZCBsaSBsaW5rIG1haW4gbWFwIG1hcmsgbWVudSBtZW51aXRlbSBtZXRhIG1ldGVyIG5hdiBub3NjcmlwdCBvYmplY3Qgb2wgb3B0Z3JvdXAgb3B0aW9uIG91dHB1dCBwIHBhcmFtIHByZSBwcm9ncmVzcyBxIHJwIHJ0IHJ1YnkgcyBzYW1wIHNjcmlwdCBzZWN0aW9uIHNlbGVjdCBzbWFsbCBzb3VyY2Ugc3BhbiBzdHJvbmcgc3R5bGUgc3ViIHN1bW1hcnkgc3VwIHRhYmxlIHRib2R5IHRkIHRleHRhcmVhIHRmb290IHRoIHRoZWFkIHRpbWUgdGl0bGUgdHIgdHJhY2sgdSB1bCB2YXIgdmlkZW8gd2JyXCIuc3BsaXQoXCIgXCIpXG5JbWJhLkhUTUxfVEFHU19VTlNBRkUgPSBcImFydGljbGUgYXNpZGUgaGVhZGVyIHNlY3Rpb25cIi5zcGxpdChcIiBcIilcbkltYmEuU1ZHX1RBR1MgPSBcImNpcmNsZSBkZWZzIGVsbGlwc2UgZyBsaW5lIGxpbmVhckdyYWRpZW50IG1hc2sgcGF0aCBwYXR0ZXJuIHBvbHlnb24gcG9seWxpbmUgcmFkaWFsR3JhZGllbnQgcmVjdCBzdG9wIHN2ZyB0ZXh0IHRzcGFuXCIuc3BsaXQoXCIgXCIpXG5cbkltYmEuSFRNTF9BVFRSUyA9XG5cdGE6IFwiaHJlZiB0YXJnZXQgaHJlZmxhbmcgbWVkaWEgZG93bmxvYWQgcmVsIHR5cGVcIlxuXHRmb3JtOiBcIm1ldGhvZCBhY3Rpb24gZW5jdHlwZSBhdXRvY29tcGxldGUgdGFyZ2V0XCJcblx0YnV0dG9uOiBcImF1dG9mb2N1cyB0eXBlXCJcblx0aW5wdXQ6IFwiYWNjZXB0IGRpc2FibGVkIGZvcm0gbGlzdCBtYXggbWF4bGVuZ3RoIG1pbiBwYXR0ZXJuIHJlcXVpcmVkIHNpemUgc3RlcCB0eXBlXCJcblx0bGFiZWw6IFwiYWNjZXNza2V5IGZvciBmb3JtXCJcblx0aW1nOiBcInNyYyBzcmNzZXRcIlxuXHRsaW5rOiBcInJlbCB0eXBlIGhyZWYgbWVkaWFcIlxuXHRpZnJhbWU6IFwicmVmZXJyZXJwb2xpY3kgc3JjIHNyY2RvYyBzYW5kYm94XCJcblx0bWV0YTogXCJwcm9wZXJ0eSBjb250ZW50IGNoYXJzZXQgZGVzY1wiXG5cdG9wdGdyb3VwOiBcImxhYmVsXCJcblx0b3B0aW9uOiBcImxhYmVsXCJcblx0b3V0cHV0OiBcImZvciBmb3JtXCJcblx0b2JqZWN0OiBcInR5cGUgZGF0YSB3aWR0aCBoZWlnaHRcIlxuXHRwYXJhbTogXCJuYW1lIHZhbHVlXCJcblx0cHJvZ3Jlc3M6IFwibWF4XCJcblx0c2NyaXB0OiBcInNyYyB0eXBlIGFzeW5jIGRlZmVyIGNyb3Nzb3JpZ2luIGludGVncml0eSBub25jZSBsYW5ndWFnZVwiXG5cdHNlbGVjdDogXCJzaXplIGZvcm0gbXVsdGlwbGVcIlxuXHR0ZXh0YXJlYTogXCJyb3dzIGNvbHNcIlxuXG5cbkltYmEuSFRNTF9QUk9QUyA9XG5cdGlucHV0OiBcImF1dG9mb2N1cyBhdXRvY29tcGxldGUgYXV0b2NvcnJlY3QgdmFsdWUgcGxhY2Vob2xkZXIgcmVxdWlyZWQgZGlzYWJsZWQgbXVsdGlwbGUgY2hlY2tlZCByZWFkT25seVwiXG5cdHRleHRhcmVhOiBcImF1dG9mb2N1cyBhdXRvY29tcGxldGUgYXV0b2NvcnJlY3QgdmFsdWUgcGxhY2Vob2xkZXIgcmVxdWlyZWQgZGlzYWJsZWQgbXVsdGlwbGUgY2hlY2tlZCByZWFkT25seVwiXG5cdGZvcm06IFwibm92YWxpZGF0ZVwiXG5cdGZpZWxkc2V0OiBcImRpc2FibGVkXCJcblx0YnV0dG9uOiBcImRpc2FibGVkXCJcblx0c2VsZWN0OiBcImF1dG9mb2N1cyBkaXNhYmxlZCByZXF1aXJlZFwiXG5cdG9wdGlvbjogXCJkaXNhYmxlZCBzZWxlY3RlZCB2YWx1ZVwiXG5cdG9wdGdyb3VwOiBcImRpc2FibGVkXCJcblx0cHJvZ3Jlc3M6IFwidmFsdWVcIlxuXHRmaWVsZHNldDogXCJkaXNhYmxlZFwiXG5cdGNhbnZhczogXCJ3aWR0aCBoZWlnaHRcIlxuXG5kZWYgZXh0ZW5kZXIgb2JqLCBzdXBcblx0Zm9yIG93biBrLHYgb2Ygc3VwXG5cdFx0b2JqW2tdID89IHZcblxuXHRvYmo6cHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXA6cHJvdG90eXBlKVxuXHRvYmo6X19zdXBlcl9fID0gb2JqOnByb3RvdHlwZTpfX3N1cGVyX18gPSBzdXA6cHJvdG90eXBlXG5cdG9iajpwcm90b3R5cGU6Y29uc3RydWN0b3IgPSBvYmpcblx0c3VwLmluaGVyaXQob2JqKSBpZiBzdXA6aW5oZXJpdFxuXHRyZXR1cm4gb2JqXG5cbmRlZiBUYWdcblx0cmV0dXJuIGRvIHxkb20sY3R4fFxuXHRcdHRoaXMuaW5pdGlhbGl6ZShkb20sY3R4KVxuXHRcdHJldHVybiB0aGlzXG5cbmRlZiBUYWdTcGF3bmVyIHR5cGVcblx0cmV0dXJuIGRvIHx6b25lfCB0eXBlLmJ1aWxkKHpvbmUpXG5cblxuY2xhc3MgSW1iYS5UYWdzXG5cblx0ZGVmIGluaXRpYWxpemVcblx0XHRzZWxmXG5cblx0ZGVmIF9fY2xvbmUgbnNcblx0XHR2YXIgY2xvbmUgPSBPYmplY3QuY3JlYXRlKHNlbGYpXG5cdFx0Y2xvbmUuQHBhcmVudCA9IHNlbGZcblx0XHRyZXR1cm4gY2xvbmVcblxuXHRkZWYgbnMgbmFtZVxuXHRcdHNlbGZbJ18nICsgbmFtZS50b1VwcGVyQ2FzZV0gfHwgZGVmaW5lTmFtZXNwYWNlKG5hbWUpXG5cblx0ZGVmIGRlZmluZU5hbWVzcGFjZSBuYW1lXG5cdFx0dmFyIGNsb25lID0gT2JqZWN0LmNyZWF0ZShzZWxmKVxuXHRcdGNsb25lLkBwYXJlbnQgPSBzZWxmXG5cdFx0Y2xvbmUuQG5zID0gbmFtZVxuXHRcdHNlbGZbJ18nICsgbmFtZS50b1VwcGVyQ2FzZV0gPSBjbG9uZVxuXHRcdHJldHVybiBjbG9uZVxuXG5cdGRlZiBiYXNlVHlwZSBuYW1lLCBuc1xuXHRcdG5hbWUgaW4gSW1iYS5IVE1MX1RBR1MgPyAnZWxlbWVudCcgOiAnZGl2J1xuXG5cdGRlZiBkZWZpbmVUYWcgZnVsbE5hbWUsIHN1cHIgPSAnJywgJmJvZHlcblx0XHRpZiBib2R5IGFuZCBib2R5LkBub2RlVHlwZVxuXHRcdFx0c3VwciA9IGJvZHlcblx0XHRcdGJvZHkgPSBudWxsXG5cdFx0XHRcblx0XHRpZiBzZWxmW2Z1bGxOYW1lXVxuXHRcdFx0Y29uc29sZS5sb2cgXCJ0YWcgYWxyZWFkeSBleGlzdHM/XCIsZnVsbE5hbWVcblx0XHRcblx0XHQjIGlmIGl0IGlzIG5hbWVzcGFjZWRcblx0XHR2YXIgbnNcblx0XHR2YXIgbmFtZSA9IGZ1bGxOYW1lXG5cdFx0bGV0IG5zaWR4ID0gbmFtZS5pbmRleE9mKCc6Jylcblx0XHRpZiAgbnNpZHggPj0gMFxuXHRcdFx0bnMgPSBmdWxsTmFtZS5zdWJzdHIoMCxuc2lkeClcblx0XHRcdG5hbWUgPSBmdWxsTmFtZS5zdWJzdHIobnNpZHggKyAxKVxuXHRcdFx0aWYgbnMgPT0gJ3N2ZycgYW5kICFzdXByXG5cdFx0XHRcdHN1cHIgPSAnc3ZnOmVsZW1lbnQnXG5cblx0XHRzdXByIHx8PSBiYXNlVHlwZShmdWxsTmFtZSlcblxuXHRcdGxldCBzdXBlcnR5cGUgPSBzdXByIGlzYSBTdHJpbmcgPyBmaW5kVGFnVHlwZShzdXByKSA6IHN1cHJcblx0XHRsZXQgdGFndHlwZSA9IFRhZygpXG5cblx0XHR0YWd0eXBlLkBuYW1lID0gbmFtZVxuXHRcdHRhZ3R5cGUuQGZsYWdOYW1lID0gbnVsbFxuXG5cdFx0aWYgbmFtZVswXSA9PSAnIydcblx0XHRcdEltYmEuU0lOR0xFVE9OU1tuYW1lLnNsaWNlKDEpXSA9IHRhZ3R5cGVcblx0XHRcdHNlbGZbbmFtZV0gPSB0YWd0eXBlXG5cdFx0ZWxpZiBuYW1lWzBdID09IG5hbWVbMF0udG9VcHBlckNhc2Vcblx0XHRcdHRhZ3R5cGUuQGZsYWdOYW1lID0gbmFtZVxuXHRcdGVsc2Vcblx0XHRcdHRhZ3R5cGUuQGZsYWdOYW1lID0gXCJfXCIgKyBmdWxsTmFtZS5yZXBsYWNlKC9bX1xcOl0vZywgJy0nKVxuXHRcdFx0c2VsZltmdWxsTmFtZV0gPSB0YWd0eXBlXG5cblx0XHRleHRlbmRlcih0YWd0eXBlLHN1cGVydHlwZSlcblxuXHRcdGlmIGJvZHlcblx0XHRcdGJvZHkuY2FsbCh0YWd0eXBlLHRhZ3R5cGUsIHRhZ3R5cGUuVEFHUyBvciBzZWxmKVxuXHRcdFx0dGFndHlwZS5kZWZpbmVkIGlmIHRhZ3R5cGU6ZGVmaW5lZFxuXHRcdFx0b3B0aW1pemVUYWcodGFndHlwZSlcblx0XHRyZXR1cm4gdGFndHlwZVxuXG5cdGRlZiBkZWZpbmVTaW5nbGV0b24gbmFtZSwgc3VwciwgJmJvZHlcblx0XHRkZWZpbmVUYWcobmFtZSxzdXByLGJvZHkpXG5cblx0ZGVmIGV4dGVuZFRhZyBuYW1lLCBzdXByID0gJycsICZib2R5XG5cdFx0dmFyIGtsYXNzID0gKG5hbWUgaXNhIFN0cmluZyA/IGZpbmRUYWdUeXBlKG5hbWUpIDogbmFtZSlcblx0XHQjIGFsbG93IGZvciBwcml2YXRlIHRhZ3MgaGVyZSBhcyB3ZWxsP1xuXHRcdGJvZHkgYW5kIGJvZHkuY2FsbChrbGFzcyxrbGFzcyxrbGFzczpwcm90b3R5cGUpIGlmIGJvZHlcblx0XHRrbGFzcy5leHRlbmRlZCBpZiBrbGFzczpleHRlbmRlZFxuXHRcdG9wdGltaXplVGFnKGtsYXNzKVxuXHRcdHJldHVybiBrbGFzc1xuXG5cdGRlZiBvcHRpbWl6ZVRhZyB0YWd0eXBlXG5cdFx0dGFndHlwZTpwcm90b3R5cGU/Lm9wdGltaXplVGFnU3RydWN0dXJlXG5cdFx0XG5cdGRlZiBmaW5kVGFnVHlwZSB0eXBlXG5cdFx0bGV0IGtsYXNzID0gc2VsZlt0eXBlXVxuXHRcdHVubGVzcyBrbGFzc1xuXHRcdFx0aWYgdHlwZS5zdWJzdHIoMCw0KSA9PSAnc3ZnOidcblx0XHRcdFx0a2xhc3MgPSBkZWZpbmVUYWcodHlwZSwnc3ZnOmVsZW1lbnQnKVxuXG5cdFx0XHRlbGlmIEltYmEuSFRNTF9UQUdTLmluZGV4T2YodHlwZSkgPj0gMFxuXHRcdFx0XHRrbGFzcyA9IGRlZmluZVRhZyh0eXBlLCdlbGVtZW50JylcblxuXHRcdFx0XHRpZiBsZXQgYXR0cnMgPSBJbWJhLkhUTUxfQVRUUlNbdHlwZV1cblx0XHRcdFx0XHRmb3IgbmFtZSBpbiBhdHRycy5zcGxpdChcIiBcIilcblx0XHRcdFx0XHRcdEltYmEuYXR0cihrbGFzcyxuYW1lKVxuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdGlmIGxldCBwcm9wcyA9IEltYmEuSFRNTF9QUk9QU1t0eXBlXVxuXHRcdFx0XHRcdGZvciBuYW1lIGluIHByb3BzLnNwbGl0KFwiIFwiKVxuXHRcdFx0XHRcdFx0SW1iYS5hdHRyKGtsYXNzLG5hbWUsZG9tOiB5ZXMpXG5cdFx0cmV0dXJuIGtsYXNzXG5cdFx0XG5cdGRlZiBjcmVhdGVFbGVtZW50IG5hbWUsIG93bmVyXG5cdFx0dmFyIHR5cFxuXHRcdGlmIG5hbWUgaXNhIEZ1bmN0aW9uXG5cdFx0XHR0eXAgPSBuYW1lXG5cdFx0ZWxzZVx0XHRcdFxuXHRcdFx0aWYgJGRlYnVnJFxuXHRcdFx0XHR0aHJvdyhcImNhbm5vdCBmaW5kIHRhZy10eXBlIHtuYW1lfVwiKSB1bmxlc3MgZmluZFRhZ1R5cGUobmFtZSlcblx0XHRcdHR5cCA9IGZpbmRUYWdUeXBlKG5hbWUpXG5cdFx0dHlwLmJ1aWxkKG93bmVyKVxuXG5cbmRlZiBJbWJhLmNyZWF0ZUVsZW1lbnQgbmFtZSwgY3R4LCByZWYsIHByZWZcblx0dmFyIHR5cGUgPSBuYW1lXG5cdHZhciBwYXJlbnRcblx0aWYgbmFtZSBpc2EgRnVuY3Rpb25cblx0XHR0eXBlID0gbmFtZVxuXHRlbHNlXG5cdFx0aWYgJGRlYnVnJFxuXHRcdFx0dGhyb3coXCJjYW5ub3QgZmluZCB0YWctdHlwZSB7bmFtZX1cIikgdW5sZXNzIEltYmEuVEFHUy5maW5kVGFnVHlwZShuYW1lKVxuXHRcdHR5cGUgPSBJbWJhLlRBR1MuZmluZFRhZ1R5cGUobmFtZSlcblx0XG5cdGlmIGN0eCBpc2EgVGFnTWFwXG5cdFx0cGFyZW50ID0gY3R4OnBhciRcblx0ZWxpZiBwcmVmIGlzYSBJbWJhLlRhZ1xuXHRcdHBhcmVudCA9IHByZWZcblx0ZWxzZVxuXHRcdHBhcmVudCA9IGN0eCBhbmQgcHJlZiAhPSB1bmRlZmluZWQgPyBjdHhbcHJlZl0gOiAoY3R4IGFuZCBjdHguQHRhZyBvciBjdHgpXG5cblx0dmFyIG5vZGUgPSB0eXBlLmJ1aWxkKHBhcmVudClcblx0XG5cdGlmIGN0eCBpc2EgVGFnTWFwXG5cdFx0Y3R4OmkkKytcblx0XHRub2RlOiRrZXkgPSByZWZcblxuXHQjIG5vZGU6JHJlZiA9IHJlZiBpZiByZWZcblx0IyBjb250ZXh0OmkkKysgIyBvbmx5IGlmIGl0IGlzIG5vdCBhbiBhcnJheT9cblx0aWYgY3R4IGFuZCByZWYgIT0gdW5kZWZpbmVkXG5cdFx0Y3R4W3JlZl0gPSBub2RlXG5cblx0cmV0dXJuIG5vZGVcblxuZGVmIEltYmEuY3JlYXRlVGFnQ2FjaGUgb3duZXJcblx0dmFyIGl0ZW0gPSBbXVxuXHRpdGVtLkB0YWcgPSBvd25lclxuXHRyZXR1cm4gaXRlbVxuXG5cdHZhciBwYXIgPSAocHJlZiAhPSB1bmRlZmluZWQgPyBjdHhbcHJlZl0gOiBjdHguQHRhZylcblx0dmFyIG5vZGUgPSBUYWdNYXAubmV3KGN0eCxyZWYscGFyKVxuXHRjdHhbcmVmXSA9IG5vZGVcblx0cmV0dXJuIG5vZGVcblx0XG5kZWYgSW1iYS5jcmVhdGVUYWdNYXAgY3R4LCByZWYsIHByZWZcblx0dmFyIHBhciA9IChwcmVmICE9IHVuZGVmaW5lZCA/IHByZWYgOiBjdHguQHRhZylcblx0dmFyIG5vZGUgPSBUYWdNYXAubmV3KGN0eCxyZWYscGFyKVxuXHRjdHhbcmVmXSA9IG5vZGVcblx0cmV0dXJuIG5vZGVcblxuZGVmIEltYmEuY3JlYXRlVGFnTGlzdCBjdHgsIHJlZiwgcHJlZlxuXHR2YXIgbm9kZSA9IFtdXG5cdG5vZGUuQHR5cGUgPSA0XG5cdG5vZGUuQHRhZyA9IChwcmVmICE9IHVuZGVmaW5lZCA/IHByZWYgOiBjdHguQHRhZylcblx0Y3R4W3JlZl0gPSBub2RlXG5cdHJldHVybiBub2RlXG5cbmRlZiBJbWJhLmNyZWF0ZVRhZ0xvb3BSZXN1bHQgY3R4LCByZWYsIHByZWZcblx0dmFyIG5vZGUgPSBbXVxuXHRub2RlLkB0eXBlID0gNVxuXHRub2RlOmNhY2hlID0ge2kkOiAwfVxuXHRyZXR1cm4gbm9kZVxuXG4jIHVzZSBhcnJheSBpbnN0ZWFkP1xuY2xhc3MgVGFnQ2FjaGVcblx0ZGVmIHNlbGYuYnVpbGQgb3duZXJcblx0XHR2YXIgaXRlbSA9IFtdXG5cdFx0aXRlbS5AdGFnID0gb3duZXJcblx0XHRyZXR1cm4gaXRlbVxuXG5cdGRlZiBpbml0aWFsaXplIG93bmVyXG5cdFx0c2VsZi5AdGFnID0gb3duZXJcblx0XHRzZWxmXG5cdFxuY2xhc3MgVGFnTWFwXG5cdFxuXHRkZWYgaW5pdGlhbGl6ZSBjYWNoZSwgcmVmLCBwYXJcblx0XHRzZWxmOmNhY2hlJCA9IGNhY2hlXG5cdFx0c2VsZjprZXkkID0gcmVmXG5cdFx0c2VsZjpwYXIkID0gcGFyXG5cdFx0c2VsZjppJCA9IDBcblx0XHQjIHNlbGY6Y3VyciQgPSBzZWxmOiRpdGVybmV3KClcblx0XHQjIHNlbGY6bmV4dCQgPSBzZWxmOiRpdGVybmV3KClcblx0XG5cdGRlZiAkaXRlclxuXHRcdHZhciBpdGVtID0gW11cblx0XHRpdGVtLkB0eXBlID0gNVxuXHRcdGl0ZW06c3RhdGljID0gNSAjIHdyb25nKCEpXG5cdFx0aXRlbTpjYWNoZSA9IHNlbGZcblx0XHRyZXR1cm4gaXRlbVxuXHRcdFxuXHRkZWYgJHBydW5lIGl0ZW1zXG5cdFx0bGV0IGNhY2hlID0gc2VsZjpjYWNoZSRcblx0XHRsZXQga2V5ID0gc2VsZjprZXkkXG5cdFx0bGV0IGNsb25lID0gVGFnTWFwLm5ldyhjYWNoZSxrZXksc2VsZjpwYXIkKVxuXHRcdGZvciBpdGVtIGluIGl0ZW1zXG5cdFx0XHRjbG9uZVtpdGVtOmtleSRdID0gaXRlbVxuXHRcdGNsb25lOmkkID0gaXRlbXM6bGVuZ3RoXG5cdFx0cmV0dXJuIGNhY2hlW2tleV0gPSBjbG9uZVxuXG5JbWJhLlRhZ01hcCA9IFRhZ01hcFxuSW1iYS5UYWdDYWNoZSA9IFRhZ0NhY2hlXG5JbWJhLlNJTkdMRVRPTlMgPSB7fVxuSW1iYS5UQUdTID0gSW1iYS5UYWdzLm5ld1xuSW1iYS5UQUdTWzplbGVtZW50XSA9IEltYmEuVEFHU1s6aHRtbGVsZW1lbnRdID0gSW1iYS5UYWdcbkltYmEuVEFHU1snc3ZnOmVsZW1lbnQnXSA9IEltYmEuU1ZHVGFnXG5cbmRlZiBJbWJhLmRlZmluZVRhZyBuYW1lLCBzdXByID0gJycsICZib2R5XG5cdHJldHVybiBJbWJhLlRBR1MuZGVmaW5lVGFnKG5hbWUsc3Vwcixib2R5KVxuXG5kZWYgSW1iYS5kZWZpbmVTaW5nbGV0b25UYWcgaWQsIHN1cHIgPSAnZGl2JywgJmJvZHlcblx0cmV0dXJuIEltYmEuVEFHUy5kZWZpbmVUYWcobmFtZSxzdXByLGJvZHkpXG5cbmRlZiBJbWJhLmV4dGVuZFRhZyBuYW1lLCBib2R5XG5cdHJldHVybiBJbWJhLlRBR1MuZXh0ZW5kVGFnKG5hbWUsYm9keSlcblxuZGVmIEltYmEuZ2V0VGFnU2luZ2xldG9uIGlkXHRcblx0dmFyIGRvbSwgbm9kZVxuXG5cdGlmIHZhciBrbGFzcyA9IEltYmEuU0lOR0xFVE9OU1tpZF1cblx0XHRyZXR1cm4ga2xhc3MuSW5zdGFuY2UgaWYga2xhc3MgYW5kIGtsYXNzLkluc3RhbmNlIFxuXG5cdFx0IyBubyBpbnN0YW5jZSAtIGNoZWNrIGZvciBlbGVtZW50XG5cdFx0aWYgZG9tID0gSW1iYS5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcblx0XHRcdCMgd2UgaGF2ZSBhIGxpdmUgaW5zdGFuY2UgLSB3aGVuIGZpbmRpbmcgaXQgdGhyb3VnaCBhIHNlbGVjdG9yIHdlIHNob3VsZCBhd2FrZSBpdCwgbm8/XG5cdFx0XHQjIGNvbnNvbGUubG9nKCdjcmVhdGluZyB0aGUgc2luZ2xldG9uIGZyb20gZXhpc3Rpbmcgbm9kZSBpbiBkb20/JyxpZCx0eXBlKVxuXHRcdFx0bm9kZSA9IGtsYXNzLkluc3RhbmNlID0ga2xhc3MubmV3KGRvbSlcblx0XHRcdG5vZGUuYXdha2VuKGRvbSkgIyBzaG91bGQgb25seSBhd2FrZW5cblx0XHRcdHJldHVybiBub2RlXG5cblx0XHRkb20gPSBrbGFzcy5jcmVhdGVOb2RlXG5cdFx0ZG9tOmlkID0gaWRcblx0XHRub2RlID0ga2xhc3MuSW5zdGFuY2UgPSBrbGFzcy5uZXcoZG9tKVxuXHRcdG5vZGUuZW5kLmF3YWtlbihkb20pXG5cdFx0cmV0dXJuIG5vZGVcblx0ZWxpZiBkb20gPSBJbWJhLmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxuXHRcdHJldHVybiBJbWJhLmdldFRhZ0ZvckRvbShkb20pXG5cbnZhciBzdmdTdXBwb3J0ID0gdHlwZW9mIFNWR0VsZW1lbnQgIT09ICd1bmRlZmluZWQnXG5cbiMgc2h1b2xkIGJlIHBoYXNlZCBvdXRcbmRlZiBJbWJhLmdldFRhZ0ZvckRvbSBkb21cblx0cmV0dXJuIG51bGwgdW5sZXNzIGRvbVxuXHRyZXR1cm4gZG9tIGlmIGRvbS5AZG9tICMgY291bGQgdXNlIGluaGVyaXRhbmNlIGluc3RlYWRcblx0cmV0dXJuIGRvbS5AdGFnIGlmIGRvbS5AdGFnXG5cdHJldHVybiBudWxsIHVubGVzcyBkb206bm9kZU5hbWVcblxuXHR2YXIgbmFtZSA9IGRvbTpub2RlTmFtZS50b0xvd2VyQ2FzZVxuXHR2YXIgdHlwZSA9IG5hbWVcblx0dmFyIG5zID0gSW1iYS5UQUdTICMgIHN2Z1N1cHBvcnQgYW5kIGRvbSBpc2EgU1ZHRWxlbWVudCA/IEltYmEuVEFHUzpfU1ZHIDogSW1iYS5UQUdTXG5cblx0aWYgZG9tOmlkIGFuZCBJbWJhLlNJTkdMRVRPTlNbZG9tOmlkXVxuXHRcdHJldHVybiBJbWJhLmdldFRhZ1NpbmdsZXRvbihkb206aWQpXG5cdFx0XG5cdGlmIHN2Z1N1cHBvcnQgYW5kIGRvbSBpc2EgU1ZHRWxlbWVudFxuXHRcdHR5cGUgPSBucy5maW5kVGFnVHlwZShcInN2ZzpcIiArIG5hbWUpXG5cdGVsaWYgSW1iYS5IVE1MX1RBR1MuaW5kZXhPZihuYW1lKSA+PSAwXG5cdFx0dHlwZSA9IG5zLmZpbmRUYWdUeXBlKG5hbWUpXG5cdGVsc2Vcblx0XHR0eXBlID0gSW1iYS5UYWdcblx0IyBpZiBucy5Abm9kZU5hbWVzLmluZGV4T2YobmFtZSkgPj0gMFxuXHQjXHR0eXBlID0gbnMuZmluZFRhZ1R5cGUobmFtZSlcblxuXHRyZXR1cm4gdHlwZS5uZXcoZG9tLG51bGwpLmF3YWtlbihkb20pXG5cbiMgZGVwcmVjYXRlXG5kZWYgSW1iYS5nZW5lcmF0ZUNTU1ByZWZpeGVzXG5cdHZhciBzdHlsZXMgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudDpkb2N1bWVudEVsZW1lbnQsICcnKVxuXG5cdGZvciBwcmVmaXhlZCBpbiBzdHlsZXNcblx0XHR2YXIgdW5wcmVmaXhlZCA9IHByZWZpeGVkLnJlcGxhY2UoL14tKHdlYmtpdHxtc3xtb3p8b3xibGluayktLywnJylcblx0XHR2YXIgY2FtZWxDYXNlID0gdW5wcmVmaXhlZC5yZXBsYWNlKC8tKFxcdykvZykgZG8gfG0sYXwgYS50b1VwcGVyQ2FzZVxuXG5cdFx0IyBpZiB0aGVyZSBleGlzdHMgYW4gdW5wcmVmaXhlZCB2ZXJzaW9uIC0tIGFsd2F5cyB1c2UgdGhpc1xuXHRcdGlmIHByZWZpeGVkICE9IHVucHJlZml4ZWRcblx0XHRcdGNvbnRpbnVlIGlmIHN0eWxlcy5oYXNPd25Qcm9wZXJ0eSh1bnByZWZpeGVkKVxuXG5cdFx0IyByZWdpc3RlciB0aGUgcHJlZml4ZXNcblx0XHRJbWJhLkNTU0tleU1hcFt1bnByZWZpeGVkXSA9IEltYmEuQ1NTS2V5TWFwW2NhbWVsQ2FzZV0gPSBwcmVmaXhlZFxuXHRyZXR1cm5cblxuaWYgJHdlYiRcblx0SW1iYS5nZW5lcmF0ZUNTU1ByZWZpeGVzIGlmIGRvY3VtZW50XG5cblx0IyBPdnZlcnJpZGUgY2xhc3NMaXN0XG5cdGlmIGRvY3VtZW50IGFuZCAhZG9jdW1lbnQ6ZG9jdW1lbnRFbGVtZW50OmNsYXNzTGlzdFxuXHRcdGV4dGVuZCB0YWcgZWxlbWVudFxuXG5cdFx0XHRkZWYgaGFzRmxhZyByZWZcblx0XHRcdFx0cmV0dXJuIFJlZ0V4cC5uZXcoJyhefFxcXFxzKScgKyByZWYgKyAnKFxcXFxzfCQpJykudGVzdChAZG9tOmNsYXNzTmFtZSlcblxuXHRcdFx0ZGVmIGFkZEZsYWcgcmVmXG5cdFx0XHRcdHJldHVybiBzZWxmIGlmIGhhc0ZsYWcocmVmKVxuXHRcdFx0XHRAZG9tOmNsYXNzTmFtZSArPSAoQGRvbTpjbGFzc05hbWUgPyAnICcgOiAnJykgKyByZWZcblx0XHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdFx0ZGVmIHVuZmxhZyByZWZcblx0XHRcdFx0cmV0dXJuIHNlbGYgdW5sZXNzIGhhc0ZsYWcocmVmKVxuXHRcdFx0XHR2YXIgcmVnZXggPSBSZWdFeHAubmV3KCcoXnxcXFxccykqJyArIHJlZiArICcoXFxcXHN8JCkqJywgJ2cnKVxuXHRcdFx0XHRAZG9tOmNsYXNzTmFtZSA9IEBkb206Y2xhc3NOYW1lLnJlcGxhY2UocmVnZXgsICcnKVxuXHRcdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0XHRkZWYgdG9nZ2xlRmxhZyByZWZcblx0XHRcdFx0aGFzRmxhZyhyZWYpID8gdW5mbGFnKHJlZikgOiBmbGFnKHJlZilcblxuXHRcdFx0ZGVmIGZsYWcgcmVmLCBib29sXG5cdFx0XHRcdGlmIGFyZ3VtZW50czpsZW5ndGggPT0gMiBhbmQgISFib29sID09PSBub1xuXHRcdFx0XHRcdHJldHVybiB1bmZsYWcocmVmKVxuXHRcdFx0XHRyZXR1cm4gYWRkRmxhZyhyZWYpXG5cbkltYmEuVGFnXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vdGFnLmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbiMgcHJlZGVmaW5lIGFsbCBzdXBwb3J0ZWQgaHRtbCB0YWdzXG50YWcgZnJhZ21lbnQgPCBlbGVtZW50XG5cblx0ZGVmIHNlbGYuY3JlYXRlTm9kZVxuXHRcdEltYmEuZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudFxuXG5leHRlbmQgdGFnIGh0bWxcblx0ZGVmIHBhcmVudFxuXHRcdG51bGxcblxuXG5leHRlbmQgdGFnIGNhbnZhc1xuXHRkZWYgY29udGV4dCB0eXBlID0gJzJkJ1xuXHRcdGRvbS5nZXRDb250ZXh0KHR5cGUpXG5cbmNsYXNzIERhdGFQcm94eVx0XG5cdGRlZiBzZWxmLmJpbmQgcmVjZWl2ZXIsIGRhdGEsIHBhdGgsIGFyZ3Ncblx0XHRsZXQgcHJveHkgPSByZWNlaXZlci5AZGF0YSB8fD0gc2VsZi5uZXcocmVjZWl2ZXIscGF0aCxhcmdzKVxuXHRcdHByb3h5LmJpbmQoZGF0YSxwYXRoLGFyZ3MpXG5cdFx0cmV0dXJuIHJlY2VpdmVyXG5cblx0ZGVmIGluaXRpYWxpemUgbm9kZSwgcGF0aCwgYXJnc1xuXHRcdEBub2RlID0gbm9kZVxuXHRcdEBwYXRoID0gcGF0aFxuXHRcdEBhcmdzID0gYXJnc1xuXHRcdEBzZXR0ZXIgPSBJbWJhLnRvU2V0dGVyKEBwYXRoKSBpZiBAYXJnc1xuXHRcdFxuXHRkZWYgYmluZCBkYXRhLCBrZXksIGFyZ3Ncblx0XHRpZiBkYXRhICE9IEBkYXRhXG5cdFx0XHRAZGF0YSA9IGRhdGFcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBnZXRGb3JtVmFsdWVcblx0XHRAc2V0dGVyID8gQGRhdGFbQHBhdGhdKCkgOiBAZGF0YVtAcGF0aF1cblxuXHRkZWYgc2V0Rm9ybVZhbHVlIHZhbHVlXG5cdFx0QHNldHRlciA/IEBkYXRhW0BzZXR0ZXJdKHZhbHVlKSA6IChAZGF0YVtAcGF0aF0gPSB2YWx1ZSlcblxuXG52YXIgaXNBcnJheSA9IGRvIHx2YWx8XG5cdHZhbCBhbmQgdmFsOnNwbGljZSBhbmQgdmFsOnNvcnRcblxudmFyIGlzU2ltaWxhckFycmF5ID0gZG8gfGEsYnxcblx0bGV0IGwgPSBhOmxlbmd0aCwgaSA9IDBcblx0cmV0dXJuIG5vIHVubGVzcyBsID09IGI6bGVuZ3RoXG5cdHdoaWxlIGkrKyA8IGxcblx0XHRyZXR1cm4gbm8gaWYgYVtpXSAhPSBiW2ldXG5cdHJldHVybiB5ZXNcblxuZXh0ZW5kIHRhZyBpbnB1dFxuXHRwcm9wIGxhenlcblxuXHRkZWYgc2V0TW9kZWxcblx0XHRjb25zb2xlLndhcm4gXCJzZXRNb2RlbCByZW1vdmVkLiBVc2UgPGlucHV0W2RhdGE6cGF0aF0+XCJcblx0XHRyZXR1cm4gc2VsZlxuXHRcblx0ZGVmIGJpbmREYXRhIHRhcmdldCwgcGF0aCwgYXJnc1xuXHRcdERhdGFQcm94eS5iaW5kKHNlbGYsdGFyZ2V0LHBhdGgsYXJncylcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBzZXRWYWx1ZSB2YWx1ZVxuXHRcdGRvbTp2YWx1ZSA9IEB2YWx1ZSA9IHZhbHVlXG5cdFx0c2VsZlxuXG5cdGRlZiBvbmlucHV0IGVcblx0XHRsZXQgdmFsID0gQGRvbTp2YWx1ZVxuXHRcdEBsb2NhbFZhbHVlID0gQGluaXRpYWxWYWx1ZSAhPSB2YWwgPyB2YWwgOiB1bmRlZmluZWRcblx0XHRAZGF0YSBhbmQgIWxhenkgPyBAZGF0YS5zZXRGb3JtVmFsdWUodmFsdWUsc2VsZikgOiBlLnNpbGVuY2Vcblx0XHRcblx0ZGVmIG9uY2hhbmdlIGVcblx0XHRAbW9kZWxWYWx1ZSA9IEBsb2NhbFZhbHVlID0gdW5kZWZpbmVkXG5cdFx0cmV0dXJuIGUuc2lsZW5jZSB1bmxlc3MgZGF0YVxuXHRcdFxuXHRcdGlmIHR5cGUgPT0gJ3JhZGlvJyBvciB0eXBlID09ICdjaGVja2JveCdcblx0XHRcdGxldCBjaGVja2VkID0gQGRvbTpjaGVja2VkXG5cdFx0XHRsZXQgbXZhbCA9IEBkYXRhLmdldEZvcm1WYWx1ZShzZWxmKVxuXHRcdFx0bGV0IGR2YWwgPSBAdmFsdWUgIT0gdW5kZWZpbmVkID8gQHZhbHVlIDogdmFsdWVcblxuXHRcdFx0aWYgdHlwZSA9PSAncmFkaW8nXG5cdFx0XHRcdEBkYXRhLnNldEZvcm1WYWx1ZShkdmFsLHNlbGYpXG5cdFx0XHRlbGlmIGRvbTp2YWx1ZSA9PSAnb24nXG5cdFx0XHRcdEBkYXRhLnNldEZvcm1WYWx1ZSghIWNoZWNrZWQsc2VsZilcblx0XHRcdGVsaWYgaXNBcnJheShtdmFsKVxuXHRcdFx0XHRsZXQgaWR4ID0gbXZhbC5pbmRleE9mKGR2YWwpXG5cdFx0XHRcdGlmIGNoZWNrZWQgYW5kIGlkeCA9PSAtMVxuXHRcdFx0XHRcdG12YWwucHVzaChkdmFsKVxuXHRcdFx0XHRlbGlmICFjaGVja2VkIGFuZCBpZHggPj0gMFxuXHRcdFx0XHRcdG12YWwuc3BsaWNlKGlkeCwxKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRAZGF0YS5zZXRGb3JtVmFsdWUoZHZhbCxzZWxmKVxuXHRcdGVsc2Vcblx0XHRcdEBkYXRhLnNldEZvcm1WYWx1ZSh2YWx1ZSlcblx0XG5cdCMgb3ZlcnJpZGluZyBlbmQgZGlyZWN0bHkgZm9yIHBlcmZvcm1hbmNlXG5cdGRlZiBlbmRcblx0XHRyZXR1cm4gc2VsZiBpZiAhQGRhdGEgb3IgQGxvY2FsVmFsdWUgIT09IHVuZGVmaW5lZFxuXHRcdGxldCBtdmFsID0gQGRhdGEuZ2V0Rm9ybVZhbHVlKHNlbGYpXG5cdFx0cmV0dXJuIHNlbGYgaWYgbXZhbCA9PSBAbW9kZWxWYWx1ZVxuXHRcdEBtb2RlbFZhbHVlID0gbXZhbCB1bmxlc3MgaXNBcnJheShtdmFsKVxuXG5cdFx0aWYgdHlwZSA9PSAncmFkaW8nIG9yIHR5cGUgPT0gJ2NoZWNrYm94J1xuXHRcdFx0bGV0IGR2YWwgPSBAdmFsdWVcblx0XHRcdGxldCBjaGVja2VkID0gaWYgaXNBcnJheShtdmFsKVxuXHRcdFx0XHRtdmFsLmluZGV4T2YoZHZhbCkgPj0gMFxuXHRcdFx0ZWxpZiBkb206dmFsdWUgPT0gJ29uJ1xuXHRcdFx0XHQhIW12YWxcblx0XHRcdGVsc2Vcblx0XHRcdFx0bXZhbCA9PSBAdmFsdWVcblxuXHRcdFx0QGRvbTpjaGVja2VkID0gY2hlY2tlZFxuXHRcdGVsc2Vcblx0XHRcdEBkb206dmFsdWUgPSBtdmFsXG5cdFx0XHRAaW5pdGlhbFZhbHVlID0gQGRvbTp2YWx1ZVxuXHRcdHNlbGZcblxuZXh0ZW5kIHRhZyB0ZXh0YXJlYVxuXHRwcm9wIGxhenlcblxuXHRkZWYgc2V0TW9kZWwgdmFsdWUsIG1vZHNcblx0XHRjb25zb2xlLndhcm4gXCJzZXRNb2RlbCByZW1vdmVkLiBVc2UgPHRleHRhcmVhW2RhdGE6cGF0aF0+XCJcblx0XHRyZXR1cm4gc2VsZlxuXHRcdFxuXHRkZWYgYmluZERhdGEgdGFyZ2V0LCBwYXRoLCBhcmdzXG5cdFx0RGF0YVByb3h5LmJpbmQoc2VsZix0YXJnZXQscGF0aCxhcmdzKVxuXHRcdHNlbGZcblx0XG5cdGRlZiBzZXRWYWx1ZSB2YWx1ZVxuXHRcdGRvbTp2YWx1ZSA9IHZhbHVlIGlmIEBsb2NhbFZhbHVlID09IHVuZGVmaW5lZFxuXHRcdHJldHVybiBzZWxmXG5cdFxuXHRkZWYgb25pbnB1dCBlXG5cdFx0bGV0IHZhbCA9IEBkb206dmFsdWVcblx0XHRAbG9jYWxWYWx1ZSA9IEBpbml0aWFsVmFsdWUgIT0gdmFsID8gdmFsIDogdW5kZWZpbmVkXG5cdFx0QGRhdGEgYW5kICFsYXp5ID8gQGRhdGEuc2V0Rm9ybVZhbHVlKHZhbHVlLHNlbGYpIDogZS5zaWxlbmNlXG5cblx0ZGVmIG9uY2hhbmdlIGVcblx0XHRAbG9jYWxWYWx1ZSA9IHVuZGVmaW5lZFxuXHRcdEBkYXRhID8gQGRhdGEuc2V0Rm9ybVZhbHVlKHZhbHVlLHNlbGYpIDogZS5zaWxlbmNlXG5cdFx0XG5cdGRlZiByZW5kZXJcblx0XHRyZXR1cm4gaWYgQGxvY2FsVmFsdWUgIT0gdW5kZWZpbmVkIG9yICFAZGF0YVxuXHRcdGlmIEBkYXRhXG5cdFx0XHRsZXQgZHZhbCA9IEBkYXRhLmdldEZvcm1WYWx1ZShzZWxmKVxuXHRcdFx0QGRvbTp2YWx1ZSA9IGR2YWwgIT0gdW5kZWZpbmVkID8gZHZhbCA6ICcnXG5cdFx0QGluaXRpYWxWYWx1ZSA9IEBkb206dmFsdWVcblx0XHRzZWxmXG5cbmV4dGVuZCB0YWcgb3B0aW9uXG5cdGRlZiBzZXRWYWx1ZSB2YWx1ZVxuXHRcdGlmIHZhbHVlICE9IEB2YWx1ZVxuXHRcdFx0ZG9tOnZhbHVlID0gQHZhbHVlID0gdmFsdWVcblx0XHRzZWxmXG5cblx0ZGVmIHZhbHVlXG5cdFx0QHZhbHVlIG9yIGRvbTp2YWx1ZVxuXG5leHRlbmQgdGFnIHNlbGVjdFxuXHRkZWYgYmluZERhdGEgdGFyZ2V0LCBwYXRoLCBhcmdzXG5cdFx0RGF0YVByb3h5LmJpbmQoc2VsZix0YXJnZXQscGF0aCxhcmdzKVxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIHNldE1vZGVsIHZhbHVlLCBtb2RzXG5cdFx0Y29uc29sZS53YXJuIFwic2V0TW9kZWwgcmVtb3ZlZC4gVXNlIDxzZWxlY3RbZGF0YTpwYXRoXT5cIlxuXHRcdHJldHVybiBzZWxmXG5cdFx0XG5cdGRlZiBzZXRWYWx1ZSB2YWx1ZSwgc3luY2luZ1xuXHRcdGxldCBwcmV2ID0gQHZhbHVlXG5cdFx0QHZhbHVlID0gdmFsdWVcblx0XHRzeW5jVmFsdWUodmFsdWUpIHVubGVzcyBzeW5jaW5nXG5cdFx0cmV0dXJuIHNlbGZcblx0XHRcblx0ZGVmIHN5bmNWYWx1ZSB2YWx1ZVxuXHRcdGxldCBwcmV2ID0gQHN5bmNWYWx1ZVxuXHRcdCMgY2hlY2sgaWYgdmFsdWUgaGFzIGNoYW5nZWRcblx0XHRpZiBtdWx0aXBsZSBhbmQgdmFsdWUgaXNhIEFycmF5XG5cdFx0XHRpZiBwcmV2IGlzYSBBcnJheSBhbmQgaXNTaW1pbGFyQXJyYXkocHJldix2YWx1ZSlcblx0XHRcdFx0cmV0dXJuIHNlbGZcblx0XHRcdCMgY3JlYXRlIGEgY29weSBmb3Igc3luY1ZhbHVlXG5cdFx0XHR2YWx1ZSA9IHZhbHVlLnNsaWNlXG5cblx0XHRAc3luY1ZhbHVlID0gdmFsdWVcblx0XHQjIHN1cHBvcnQgYXJyYXkgZm9yIG11bHRpcGxlP1xuXHRcdGlmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0J1xuXHRcdFx0bGV0IG11bHQgPSBtdWx0aXBsZSBhbmQgdmFsdWUgaXNhIEFycmF5XG5cdFx0XHRcblx0XHRcdGZvciBvcHQsaSBpbiBkb206b3B0aW9uc1xuXHRcdFx0XHRsZXQgb3ZhbCA9IChvcHQuQHRhZyA/IG9wdC5AdGFnLnZhbHVlIDogb3B0OnZhbHVlKVxuXHRcdFx0XHRpZiBtdWx0XG5cdFx0XHRcdFx0b3B0OnNlbGVjdGVkID0gdmFsdWUuaW5kZXhPZihvdmFsKSA+PSAwXG5cdFx0XHRcdGVsaWYgdmFsdWUgPT0gb3ZhbFxuXHRcdFx0XHRcdGRvbTpzZWxlY3RlZEluZGV4ID0gaVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0ZWxzZVxuXHRcdFx0ZG9tOnZhbHVlID0gdmFsdWVcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiB2YWx1ZVxuXHRcdGlmIG11bHRpcGxlXG5cdFx0XHRmb3Igb3B0aW9uIGluIGRvbTpzZWxlY3RlZE9wdGlvbnNcblx0XHRcdFx0b3B0aW9uLkB0YWcgPyBvcHRpb24uQHRhZy52YWx1ZSA6IG9wdGlvbjp2YWx1ZVxuXHRcdGVsc2Vcblx0XHRcdGxldCBvcHQgPSBkb206c2VsZWN0ZWRPcHRpb25zWzBdXG5cdFx0XHRvcHQgPyAob3B0LkB0YWcgPyBvcHQuQHRhZy52YWx1ZSA6IG9wdDp2YWx1ZSkgOiBudWxsXG5cdFxuXHRkZWYgb25jaGFuZ2UgZVxuXHRcdEBkYXRhID8gQGRhdGEuc2V0Rm9ybVZhbHVlKHZhbHVlLHNlbGYpIDogZS5zaWxlbmNlXG5cdFx0XG5cdGRlZiBlbmRcblx0XHRpZiBAZGF0YVxuXHRcdFx0c2V0VmFsdWUoQGRhdGEuZ2V0Rm9ybVZhbHVlKHNlbGYpLDEpXG5cblx0XHRpZiBAdmFsdWUgIT0gQHN5bmNWYWx1ZVxuXHRcdFx0c3luY1ZhbHVlKEB2YWx1ZSlcblx0XHRzZWxmXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL2h0bWwuaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuIyBJbWJhLlRvdWNoXG4jIEJlZ2FuXHRBIGZpbmdlciB0b3VjaGVkIHRoZSBzY3JlZW4uXG4jIE1vdmVkXHRBIGZpbmdlciBtb3ZlZCBvbiB0aGUgc2NyZWVuLlxuIyBTdGF0aW9uYXJ5XHRBIGZpbmdlciBpcyB0b3VjaGluZyB0aGUgc2NyZWVuIGJ1dCBoYXNuJ3QgbW92ZWQuXG4jIEVuZGVkXHRBIGZpbmdlciB3YXMgbGlmdGVkIGZyb20gdGhlIHNjcmVlbi4gVGhpcyBpcyB0aGUgZmluYWwgcGhhc2Ugb2YgYSB0b3VjaC5cbiMgQ2FuY2VsZWQgVGhlIHN5c3RlbSBjYW5jZWxsZWQgdHJhY2tpbmcgZm9yIHRoZSB0b3VjaC5cblxuIyMjXG5Db25zb2xpZGF0ZXMgbW91c2UgYW5kIHRvdWNoIGV2ZW50cy4gVG91Y2ggb2JqZWN0cyBwZXJzaXN0IGFjcm9zcyBhIHRvdWNoLFxuZnJvbSB0b3VjaHN0YXJ0IHVudGlsIGVuZC9jYW5jZWwuIFdoZW4gYSB0b3VjaCBzdGFydHMsIGl0IHdpbGwgdHJhdmVyc2VcbmRvd24gZnJvbSB0aGUgaW5uZXJtb3N0IHRhcmdldCwgdW50aWwgaXQgZmluZHMgYSBub2RlIHRoYXQgcmVzcG9uZHMgdG9cbm9udG91Y2hzdGFydC4gVW5sZXNzIHRoZSB0b3VjaCBpcyBleHBsaWNpdGx5IHJlZGlyZWN0ZWQsIHRoZSB0b3VjaCB3aWxsXG5jYWxsIG9udG91Y2htb3ZlIGFuZCBvbnRvdWNoZW5kIC8gb250b3VjaGNhbmNlbCBvbiB0aGUgcmVzcG9uZGVyIHdoZW4gYXBwcm9wcmlhdGUuXG5cblx0dGFnIGRyYWdnYWJsZVxuXHRcdCMgY2FsbGVkIHdoZW4gYSB0b3VjaCBzdGFydHNcblx0XHRkZWYgb250b3VjaHN0YXJ0IHRvdWNoXG5cdFx0XHRmbGFnICdkcmFnZ2luZydcblx0XHRcdHNlbGZcblx0XHRcblx0XHQjIGNhbGxlZCB3aGVuIHRvdWNoIG1vdmVzIC0gc2FtZSB0b3VjaCBvYmplY3Rcblx0XHRkZWYgb250b3VjaG1vdmUgdG91Y2hcblx0XHRcdCMgbW92ZSB0aGUgbm9kZSB3aXRoIHRvdWNoXG5cdFx0XHRjc3MgdG9wOiB0b3VjaC5keSwgbGVmdDogdG91Y2guZHhcblx0XHRcblx0XHQjIGNhbGxlZCB3aGVuIHRvdWNoIGVuZHNcblx0XHRkZWYgb250b3VjaGVuZCB0b3VjaFxuXHRcdFx0dW5mbGFnICdkcmFnZ2luZydcblxuQGluYW1lIHRvdWNoXG4jIyNcbmNsYXNzIEltYmEuVG91Y2hcblx0c2VsZi5MYXN0VGltZXN0YW1wID0gMFxuXHRzZWxmLlRhcFRpbWVvdXQgPSA1MFxuXG5cdCMgdmFyIGxhc3ROYXRpdmVUb3VjaFRpbWVvdXQgPSA1MFxuXG5cdHZhciB0b3VjaGVzID0gW11cblx0dmFyIGNvdW50ID0gMFxuXHR2YXIgaWRlbnRpZmllcnMgPSB7fVxuXG5cdGRlZiBzZWxmLmNvdW50XG5cdFx0Y291bnRcblxuXHRkZWYgc2VsZi5sb29rdXAgaXRlbVxuXHRcdHJldHVybiBpdGVtIGFuZCAoaXRlbTpfX3RvdWNoX18gb3IgaWRlbnRpZmllcnNbaXRlbTppZGVudGlmaWVyXSlcblxuXHRkZWYgc2VsZi5yZWxlYXNlIGl0ZW0sdG91Y2hcblx0XHRkZWxldGUgaWRlbnRpZmllcnNbaXRlbTppZGVudGlmaWVyXVxuXHRcdGRlbGV0ZSBpdGVtOl9fdG91Y2hfX1xuXHRcdHJldHVyblxuXG5cdGRlZiBzZWxmLm9udG91Y2hzdGFydCBlXG5cdFx0Zm9yIHQgaW4gZTpjaGFuZ2VkVG91Y2hlc1xuXHRcdFx0Y29udGludWUgaWYgbG9va3VwKHQpXG5cdFx0XHR2YXIgdG91Y2ggPSBpZGVudGlmaWVyc1t0OmlkZW50aWZpZXJdID0gc2VsZi5uZXcoZSkgIyAoZSlcblx0XHRcdHQ6X190b3VjaF9fID0gdG91Y2hcblx0XHRcdHRvdWNoZXMucHVzaCh0b3VjaClcblx0XHRcdGNvdW50Kytcblx0XHRcdHRvdWNoLnRvdWNoc3RhcnQoZSx0KVxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5vbnRvdWNobW92ZSBlXG5cdFx0Zm9yIHQgaW4gZTpjaGFuZ2VkVG91Y2hlc1xuXHRcdFx0aWYgdmFyIHRvdWNoID0gbG9va3VwKHQpXG5cdFx0XHRcdHRvdWNoLnRvdWNobW92ZShlLHQpXG5cblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub250b3VjaGVuZCBlXG5cdFx0Zm9yIHQgaW4gZTpjaGFuZ2VkVG91Y2hlc1xuXHRcdFx0aWYgdmFyIHRvdWNoID0gbG9va3VwKHQpXG5cdFx0XHRcdHRvdWNoLnRvdWNoZW5kKGUsdClcblx0XHRcdFx0cmVsZWFzZSh0LHRvdWNoKVxuXHRcdFx0XHRjb3VudC0tXG5cblx0XHQjIGUucHJldmVudERlZmF1bHRcblx0XHQjIG5vdCBhbHdheXMgc3VwcG9ydGVkIVxuXHRcdCMgdG91Y2hlcyA9IHRvdWNoZXMuZmlsdGVyKHx8KVxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5vbnRvdWNoY2FuY2VsIGVcblx0XHRmb3IgdCBpbiBlOmNoYW5nZWRUb3VjaGVzXG5cdFx0XHRpZiB2YXIgdG91Y2ggPSBsb29rdXAodClcblx0XHRcdFx0dG91Y2gudG91Y2hjYW5jZWwoZSx0KVxuXHRcdFx0XHRyZWxlYXNlKHQsdG91Y2gpXG5cdFx0XHRcdGNvdW50LS1cblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub25tb3VzZWRvd24gZVxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5vbm1vdXNlbW92ZSBlXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9ubW91c2V1cCBlXG5cdFx0c2VsZlxuXG5cblx0cHJvcCBwaGFzZVxuXHRwcm9wIGFjdGl2ZVxuXHRwcm9wIGV2ZW50XG5cdHByb3AgcG9pbnRlclxuXHRwcm9wIHRhcmdldFxuXHRwcm9wIGhhbmRsZXJcblx0cHJvcCB1cGRhdGVzXG5cdHByb3Agc3VwcHJlc3Ncblx0cHJvcCBkYXRhXG5cdHByb3AgYnViYmxlIGNoYWluYWJsZTogeWVzXG5cdHByb3AgdGltZXN0YW1wXG5cblx0cHJvcCBnZXN0dXJlc1xuXG5cdCMjI1xuXHRAaW50ZXJuYWxcblx0QGNvbnN0cnVjdG9yXG5cdCMjI1xuXHRkZWYgaW5pdGlhbGl6ZSBldmVudCwgcG9pbnRlclxuXHRcdCMgQG5hdGl2ZSAgPSBmYWxzZVxuXHRcdHNlbGYuZXZlbnQgPSBldmVudFxuXHRcdGRhdGEgPSB7fVxuXHRcdGFjdGl2ZSA9IHllc1xuXHRcdEBidXR0b24gPSBldmVudCBhbmQgZXZlbnQ6YnV0dG9uIG9yIDBcblx0XHRAc3VwcHJlc3MgPSBubyAjIGRlcHJlY2F0ZWRcblx0XHRAY2FwdHVyZWQgPSBub1xuXHRcdGJ1YmJsZSA9IG5vXG5cdFx0cG9pbnRlciA9IHBvaW50ZXJcblx0XHR1cGRhdGVzID0gMFxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIGNhcHR1cmVcblx0XHRAY2FwdHVyZWQgPSB5ZXNcblx0XHRAZXZlbnQgYW5kIEBldmVudC5zdG9wUHJvcGFnYXRpb25cblx0XHR1bmxlc3MgQHNlbGJsb2NrZXJcblx0XHRcdEBzZWxibG9ja2VyID0gZG8gfGV8IGUucHJldmVudERlZmF1bHRcblx0XHRcdEltYmEuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc2VsZWN0c3RhcnQnLEBzZWxibG9ja2VyLHllcylcblx0XHRzZWxmXG5cblx0ZGVmIGlzQ2FwdHVyZWRcblx0XHQhIUBjYXB0dXJlZFxuXG5cdCMjI1xuXHRFeHRlbmQgdGhlIHRvdWNoIHdpdGggYSBwbHVnaW4gLyBnZXN0dXJlLiBcblx0QWxsIGV2ZW50cyAodG91Y2hzdGFydCxtb3ZlIGV0YykgZm9yIHRoZSB0b3VjaFxuXHR3aWxsIGJlIHRyaWdnZXJlZCBvbiB0aGUgcGx1Z2lucyBpbiB0aGUgb3JkZXIgdGhleVxuXHRhcmUgYWRkZWQuXG5cdCMjI1xuXHRkZWYgZXh0ZW5kIHBsdWdpblxuXHRcdCMgY29uc29sZS5sb2cgXCJhZGRlZCBnZXN0dXJlISEhXCJcblx0XHRAZ2VzdHVyZXMgfHw9IFtdXG5cdFx0QGdlc3R1cmVzLnB1c2gocGx1Z2luKVxuXHRcdHNlbGZcblxuXHQjIyNcblx0UmVkaXJlY3QgdG91Y2ggdG8gc3BlY2lmaWVkIHRhcmdldC4gb250b3VjaHN0YXJ0IHdpbGwgYWx3YXlzIGJlXG5cdGNhbGxlZCBvbiB0aGUgbmV3IHRhcmdldC5cblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHJlZGlyZWN0IHRhcmdldFxuXHRcdEByZWRpcmVjdCA9IHRhcmdldFxuXHRcdHNlbGZcblxuXHQjIyNcblx0U3VwcHJlc3MgdGhlIGRlZmF1bHQgYmVoYXZpb3VyLiBXaWxsIGNhbGwgcHJldmVudERlZmF1bHQgZm9yXG5cdGFsbCBuYXRpdmUgZXZlbnRzIHRoYXQgYXJlIHBhcnQgb2YgdGhlIHRvdWNoLlxuXHQjIyNcblx0ZGVmIHN1cHByZXNzXG5cdFx0IyBjb2xsaXNpb24gd2l0aCB0aGUgc3VwcHJlc3MgcHJvcGVydHlcblx0XHRAYWN0aXZlID0gbm9cblx0XHRcblx0XHRzZWxmXG5cblx0ZGVmIHN1cHByZXNzPSB2YWx1ZVxuXHRcdGNvbnNvbGUud2FybiAnSW1iYS5Ub3VjaCNzdXBwcmVzcz0gaXMgZGVwcmVjYXRlZCdcblx0XHRAc3VwcmVzcyA9IHZhbHVlXG5cdFx0c2VsZlxuXG5cdGRlZiB0b3VjaHN0YXJ0IGUsdFxuXHRcdEBldmVudCA9IGVcblx0XHRAdG91Y2ggPSB0XG5cdFx0QGJ1dHRvbiA9IDBcblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0YmVnYW5cblx0XHR1cGRhdGVcblx0XHRlLnByZXZlbnREZWZhdWx0IGlmIGUgYW5kIGlzQ2FwdHVyZWRcblx0XHRzZWxmXG5cblx0ZGVmIHRvdWNobW92ZSBlLHRcblx0XHRAZXZlbnQgPSBlXG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdHVwZGF0ZVxuXHRcdGUucHJldmVudERlZmF1bHQgaWYgZSBhbmQgaXNDYXB0dXJlZFxuXHRcdHNlbGZcblxuXHRkZWYgdG91Y2hlbmQgZSx0XG5cdFx0QGV2ZW50ID0gZVxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRlbmRlZFxuXG5cdFx0SW1iYS5Ub3VjaC5MYXN0VGltZXN0YW1wID0gZTp0aW1lU3RhbXBcblxuXHRcdGlmIEBtYXhkciA8IDIwXG5cdFx0XHR2YXIgdGFwID0gSW1iYS5FdmVudC5uZXcoZSlcblx0XHRcdHRhcC50eXBlID0gJ3RhcCdcblx0XHRcdHRhcC5wcm9jZXNzXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0IGlmIHRhcC5AcmVzcG9uZGVyXHRcblxuXHRcdGlmIGUgYW5kIGlzQ2FwdHVyZWRcblx0XHRcdGUucHJldmVudERlZmF1bHRcblxuXHRcdHNlbGZcblxuXHRkZWYgdG91Y2hjYW5jZWwgZSx0XG5cdFx0Y2FuY2VsXG5cblx0ZGVmIG1vdXNlZG93biBlLHRcblx0XHRAZXZlbnQgPSBlXG5cdFx0QGJ1dHRvbiA9IGU6YnV0dG9uXG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdGJlZ2FuXG5cdFx0dXBkYXRlXG5cdFx0QG1vdXNlbW92ZSA9ICh8ZXwgbW91c2Vtb3ZlKGUsZSkgKVxuXHRcdEltYmEuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJyxAbW91c2Vtb3ZlLHllcylcblx0XHRzZWxmXG5cblx0ZGVmIG1vdXNlbW92ZSBlLHRcblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0QGV2ZW50ID0gZVxuXHRcdGUucHJldmVudERlZmF1bHQgaWYgaXNDYXB0dXJlZFxuXHRcdHVwZGF0ZVxuXHRcdG1vdmVcblx0XHRzZWxmXG5cblx0ZGVmIG1vdXNldXAgZSx0XG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdGVuZGVkXG5cdFx0c2VsZlxuXG5cdGRlZiBpZGxlXG5cdFx0dXBkYXRlXG5cblx0ZGVmIGJlZ2FuXG5cdFx0QHRpbWVzdGFtcCA9IERhdGUubm93XG5cdFx0QG1heGRyID0gQGRyID0gMFxuXHRcdEB4MCA9IEB4XG5cdFx0QHkwID0gQHlcblxuXHRcdHZhciBkb20gPSBldmVudDp0YXJnZXRcblx0XHR2YXIgbm9kZSA9IG51bGxcblxuXHRcdEBzb3VyY2VUYXJnZXQgPSBkb20gYW5kIHRhZyhkb20pXG5cblx0XHR3aGlsZSBkb21cblx0XHRcdG5vZGUgPSB0YWcoZG9tKVxuXHRcdFx0aWYgbm9kZSAmJiBub2RlOm9udG91Y2hzdGFydFxuXHRcdFx0XHRAYnViYmxlID0gbm9cblx0XHRcdFx0dGFyZ2V0ID0gbm9kZVxuXHRcdFx0XHR0YXJnZXQub250b3VjaHN0YXJ0KHNlbGYpXG5cdFx0XHRcdGJyZWFrIHVubGVzcyBAYnViYmxlXG5cdFx0XHRkb20gPSBkb206cGFyZW50Tm9kZVxuXG5cdFx0QHVwZGF0ZXMrK1xuXHRcdHNlbGZcblxuXHRkZWYgdXBkYXRlXG5cdFx0cmV0dXJuIHNlbGYgaWYgIUBhY3RpdmUgb3IgQGNhbmNlbGxlZFxuXG5cdFx0dmFyIGRyID0gTWF0aC5zcXJ0KGR4KmR4ICsgZHkqZHkpXG5cdFx0QG1heGRyID0gZHIgaWYgZHIgPiBAZHJcblx0XHRAZHIgPSBkclxuXG5cdFx0IyBjYXRjaGluZyBhIHRvdWNoLXJlZGlyZWN0PyE/XG5cdFx0aWYgQHJlZGlyZWN0XG5cdFx0XHRpZiBAdGFyZ2V0IGFuZCBAdGFyZ2V0Om9udG91Y2hjYW5jZWxcblx0XHRcdFx0QHRhcmdldC5vbnRvdWNoY2FuY2VsKHNlbGYpXG5cdFx0XHR0YXJnZXQgPSBAcmVkaXJlY3Rcblx0XHRcdEByZWRpcmVjdCA9IG51bGxcblx0XHRcdHRhcmdldC5vbnRvdWNoc3RhcnQoc2VsZikgaWYgdGFyZ2V0Om9udG91Y2hzdGFydFxuXHRcdFx0cmV0dXJuIHVwZGF0ZSBpZiBAcmVkaXJlY3QgIyBwb3NzaWJseSByZWRpcmVjdGluZyBhZ2FpblxuXG5cblx0XHRAdXBkYXRlcysrXG5cdFx0aWYgQGdlc3R1cmVzXG5cdFx0XHRnLm9udG91Y2h1cGRhdGUoc2VsZikgZm9yIGcgaW4gQGdlc3R1cmVzXG5cblx0XHR0YXJnZXQ/Lm9udG91Y2h1cGRhdGUoc2VsZilcblx0XHR1cGRhdGUgaWYgQHJlZGlyZWN0XG5cdFx0c2VsZlxuXG5cdGRlZiBtb3ZlXG5cdFx0cmV0dXJuIHNlbGYgaWYgIUBhY3RpdmUgb3IgQGNhbmNlbGxlZFxuXG5cdFx0aWYgQGdlc3R1cmVzXG5cdFx0XHRmb3IgZyBpbiBAZ2VzdHVyZXNcblx0XHRcdFx0Zy5vbnRvdWNobW92ZShzZWxmLEBldmVudCkgaWYgZzpvbnRvdWNobW92ZVxuXG5cdFx0dGFyZ2V0Py5vbnRvdWNobW92ZShzZWxmLEBldmVudClcblx0XHRzZWxmXG5cblx0ZGVmIGVuZGVkXG5cdFx0cmV0dXJuIHNlbGYgaWYgIUBhY3RpdmUgb3IgQGNhbmNlbGxlZFxuXG5cdFx0QHVwZGF0ZXMrK1xuXG5cdFx0aWYgQGdlc3R1cmVzXG5cdFx0XHRnLm9udG91Y2hlbmQoc2VsZikgZm9yIGcgaW4gQGdlc3R1cmVzXG5cblx0XHR0YXJnZXQ/Lm9udG91Y2hlbmQoc2VsZilcblx0XHRjbGVhbnVwX1xuXHRcdHNlbGZcblxuXHRkZWYgY2FuY2VsXG5cdFx0dW5sZXNzIEBjYW5jZWxsZWRcblx0XHRcdEBjYW5jZWxsZWQgPSB5ZXNcblx0XHRcdGNhbmNlbGxlZFxuXHRcdFx0Y2xlYW51cF9cblx0XHRzZWxmXG5cblx0ZGVmIGNhbmNlbGxlZFxuXHRcdHJldHVybiBzZWxmIHVubGVzcyBAYWN0aXZlXG5cblx0XHRAY2FuY2VsbGVkID0geWVzXG5cdFx0QHVwZGF0ZXMrK1xuXG5cdFx0aWYgQGdlc3R1cmVzXG5cdFx0XHRmb3IgZyBpbiBAZ2VzdHVyZXNcblx0XHRcdFx0Zy5vbnRvdWNoY2FuY2VsKHNlbGYpIGlmIGc6b250b3VjaGNhbmNlbFxuXG5cdFx0dGFyZ2V0Py5vbnRvdWNoY2FuY2VsKHNlbGYpXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgY2xlYW51cF9cblx0XHRpZiBAbW91c2Vtb3ZlXG5cdFx0XHRJbWJhLmRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsQG1vdXNlbW92ZSx5ZXMpXG5cdFx0XHRAbW91c2Vtb3ZlID0gbnVsbFxuXHRcdFxuXHRcdGlmIEBzZWxibG9ja2VyXG5cdFx0XHRJbWJhLmRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3NlbGVjdHN0YXJ0JyxAc2VsYmxvY2tlcix5ZXMpXG5cdFx0XHRAc2VsYmxvY2tlciA9IG51bGxcblx0XHRcblx0XHRzZWxmXG5cblx0IyMjXG5cdFRoZSBhYnNvbHV0ZSBkaXN0YW5jZSB0aGUgdG91Y2ggaGFzIG1vdmVkIGZyb20gc3RhcnRpbmcgcG9zaXRpb24gXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiBkciBkbyBAZHJcblxuXHQjIyNcblx0VGhlIGRpc3RhbmNlIHRoZSB0b3VjaCBoYXMgbW92ZWQgaG9yaXpvbnRhbGx5XG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiBkeCBkbyBAeCAtIEB4MFxuXG5cdCMjI1xuXHRUaGUgZGlzdGFuY2UgdGhlIHRvdWNoIGhhcyBtb3ZlZCB2ZXJ0aWNhbGx5XG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiBkeSBkbyBAeSAtIEB5MFxuXG5cdCMjI1xuXHRJbml0aWFsIGhvcml6b250YWwgcG9zaXRpb24gb2YgdG91Y2hcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHgwIGRvIEB4MFxuXG5cdCMjI1xuXHRJbml0aWFsIHZlcnRpY2FsIHBvc2l0aW9uIG9mIHRvdWNoXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB5MCBkbyBAeTBcblxuXHQjIyNcblx0SG9yaXpvbnRhbCBwb3NpdGlvbiBvZiB0b3VjaFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgeCBkbyBAeFxuXG5cdCMjI1xuXHRWZXJ0aWNhbCBwb3NpdGlvbiBvZiB0b3VjaFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgeSBkbyBAeVxuXG5cdCMjI1xuXHRIb3Jpem9udGFsIHBvc2l0aW9uIG9mIHRvdWNoIHJlbGF0aXZlIHRvIHRhcmdldFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgdHggZG9cblx0XHRAdGFyZ2V0Qm94IHx8PSBAdGFyZ2V0LmRvbS5nZXRCb3VuZGluZ0NsaWVudFJlY3Rcblx0XHRAeCAtIEB0YXJnZXRCb3g6bGVmdFxuXG5cdCMjI1xuXHRWZXJ0aWNhbCBwb3NpdGlvbiBvZiB0b3VjaCByZWxhdGl2ZSB0byB0YXJnZXRcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHR5XG5cdFx0QHRhcmdldEJveCB8fD0gQHRhcmdldC5kb20uZ2V0Qm91bmRpbmdDbGllbnRSZWN0XG5cdFx0QHkgLSBAdGFyZ2V0Qm94OnRvcFxuXG5cdCMjI1xuXHRCdXR0b24gcHJlc3NlZCBpbiB0aGlzIHRvdWNoLiBOYXRpdmUgdG91Y2hlcyBkZWZhdWx0cyB0byBsZWZ0LWNsaWNrICgwKVxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgYnV0dG9uIGRvIEBidXR0b24gIyBAcG9pbnRlciA/IEBwb2ludGVyLmJ1dHRvbiA6IDBcblxuXHRkZWYgc291cmNlVGFyZ2V0XG5cdFx0QHNvdXJjZVRhcmdldFxuXG5cdGRlZiBlbGFwc2VkXG5cdFx0RGF0ZS5ub3cgLSBAdGltZXN0YW1wXG5cblxuY2xhc3MgSW1iYS5Ub3VjaEdlc3R1cmVcblxuXHRwcm9wIGFjdGl2ZSBkZWZhdWx0OiBub1xuXG5cdGRlZiBvbnRvdWNoc3RhcnQgZVxuXHRcdHNlbGZcblxuXHRkZWYgb250b3VjaHVwZGF0ZSBlXG5cdFx0c2VsZlxuXG5cdGRlZiBvbnRvdWNoZW5kIGVcblx0XHRzZWxmXG5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS90b3VjaC5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG52YXIga2V5Q29kZXMgPSB7XG5cdGVzYzogMjcsXG5cdHRhYjogOSxcblx0ZW50ZXI6IDEzLFxuXHRzcGFjZTogMzIsXG5cdHVwOiAzOCxcblx0ZG93bjogNDBcbn1cblxudmFyIGVsID0gSW1iYS5UYWc6cHJvdG90eXBlXG5kZWYgZWwuc3RvcE1vZGlmaWVyIGUgZG8gZS5zdG9wIHx8IHRydWVcbmRlZiBlbC5wcmV2ZW50TW9kaWZpZXIgZSBkbyBlLnByZXZlbnQgfHwgdHJ1ZVxuZGVmIGVsLnNpbGVuY2VNb2RpZmllciBlIGRvIGUuc2lsZW5jZSB8fCB0cnVlXG5kZWYgZWwuYnViYmxlTW9kaWZpZXIgZSBkbyBlLmJ1YmJsZSh5ZXMpIHx8IHRydWVcbmRlZiBlbC5jdHJsTW9kaWZpZXIgZSBkbyBlLmV2ZW50OmN0cmxLZXkgPT0gdHJ1ZVxuZGVmIGVsLmFsdE1vZGlmaWVyIGUgZG8gZS5ldmVudDphbHRLZXkgPT0gdHJ1ZVxuZGVmIGVsLnNoaWZ0TW9kaWZpZXIgZSBkbyBlLmV2ZW50OnNoaWZ0S2V5ID09IHRydWVcbmRlZiBlbC5tZXRhTW9kaWZpZXIgZSBkbyBlLmV2ZW50Om1ldGFLZXkgPT0gdHJ1ZVxuZGVmIGVsLmtleU1vZGlmaWVyIGtleSwgZSBkbyBlLmtleUNvZGUgPyAoZS5rZXlDb2RlID09IGtleSkgOiB0cnVlXG5kZWYgZWwuZGVsTW9kaWZpZXIgZSBkbyBlLmtleUNvZGUgPyAoZS5rZXlDb2RlID09IDggb3IgZS5rZXlDb2RlID09IDQ2KSA6IHRydWVcbmRlZiBlbC5zZWxmTW9kaWZpZXIgZSBkbyBlLmV2ZW50OnRhcmdldCA9PSBAZG9tXG5kZWYgZWwubGVmdE1vZGlmaWVyIGUgZG8gZS5idXR0b24gIT0gdW5kZWZpbmVkID8gKGUuYnV0dG9uID09PSAwKSA6IGVsLmtleU1vZGlmaWVyKDM3LGUpXG5kZWYgZWwucmlnaHRNb2RpZmllciBlIGRvIGUuYnV0dG9uICE9IHVuZGVmaW5lZCA/IChlLmJ1dHRvbiA9PT0gMikgOiBlbC5rZXlNb2RpZmllcigzOSxlKVxuZGVmIGVsLm1pZGRsZU1vZGlmaWVyIGUgZG8gZS5idXR0b24gIT0gdW5kZWZpbmVkID8gKGUuYnV0dG9uID09PSAxKSA6IHRydWVcbmRlZiBlbC5nZXRIYW5kbGVyIHN0ciBkb1xuXHRpZiBzZWxmW3N0cl1cblx0XHRyZXR1cm4gc2VsZlxuXHRlbGlmIEBkYXRhIGFuZCBAZGF0YVtzdHJdIGlzYSBGdW5jdGlvblxuXHRcdHJldHVybiBAZGF0YVxuXG4jIyNcbkltYmEgaGFuZGxlcyBhbGwgZXZlbnRzIGluIHRoZSBkb20gdGhyb3VnaCBhIHNpbmdsZSBtYW5hZ2VyLFxubGlzdGVuaW5nIGF0IHRoZSByb290IG9mIHlvdXIgZG9jdW1lbnQuIElmIEltYmEgZmluZHMgYSB0YWdcbnRoYXQgbGlzdGVucyB0byBhIGNlcnRhaW4gZXZlbnQsIHRoZSBldmVudCB3aWxsIGJlIHdyYXBwZWQgXG5pbiBhbiBgSW1iYS5FdmVudGAsIHdoaWNoIG5vcm1hbGl6ZXMgc29tZSBvZiB0aGUgcXVpcmtzIGFuZCBcbmJyb3dzZXIgZGlmZmVyZW5jZXMuXG5cbkBpbmFtZSBldmVudFxuIyMjXG5jbGFzcyBJbWJhLkV2ZW50XG5cblx0IyMjIHJlZmVyZW5jZSB0byB0aGUgbmF0aXZlIGV2ZW50ICMjI1xuXHRwcm9wIGV2ZW50XG5cblx0IyMjIHJlZmVyZW5jZSB0byB0aGUgbmF0aXZlIGV2ZW50ICMjI1xuXHRwcm9wIHByZWZpeFxuXG5cdHByb3AgZGF0YVxuXG5cdHByb3AgcmVzcG9uZGVyXG5cblx0ZGVmIHNlbGYud3JhcCBlXG5cdFx0c2VsZi5uZXcoZSlcblx0XG5cdGRlZiBpbml0aWFsaXplIGVcblx0XHRldmVudCA9IGVcblx0XHRAYnViYmxlID0geWVzXG5cblx0ZGVmIHR5cGU9IHR5cGVcblx0XHRAdHlwZSA9IHR5cGVcblx0XHRzZWxmXG5cblx0IyMjXG5cdEByZXR1cm4ge1N0cmluZ30gVGhlIG5hbWUgb2YgdGhlIGV2ZW50IChjYXNlLWluc2Vuc2l0aXZlKVxuXHQjIyNcblx0ZGVmIHR5cGVcblx0XHRAdHlwZSB8fCBldmVudDp0eXBlXG5cdFxuXHRkZWYgYnV0dG9uIGRvIGV2ZW50OmJ1dHRvblxuXHRkZWYga2V5Q29kZSBkbyBldmVudDprZXlDb2RlXG5cblx0ZGVmIG5hbWVcblx0XHRAbmFtZSB8fD0gdHlwZS50b0xvd2VyQ2FzZS5yZXBsYWNlKC9cXDovZywnJylcblxuXHQjIG1pbWMgZ2V0c2V0XG5cdGRlZiBidWJibGUgdlxuXHRcdGlmIHYgIT0gdW5kZWZpbmVkXG5cdFx0XHRzZWxmLmJ1YmJsZSA9IHZcblx0XHRcdHJldHVybiBzZWxmXG5cdFx0cmV0dXJuIEBidWJibGVcblxuXHRkZWYgYnViYmxlPSB2XG5cdFx0QGJ1YmJsZSA9IHZcblx0XHRyZXR1cm4gc2VsZlxuXG5cdCMjI1xuXHRQcmV2ZW50cyBmdXJ0aGVyIHByb3BhZ2F0aW9uIG9mIHRoZSBjdXJyZW50IGV2ZW50LlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHN0b3Bcblx0XHRidWJibGUgPSBub1xuXHRcdHNlbGZcblxuXHRkZWYgc3RvcFByb3BhZ2F0aW9uIGRvIHN0b3Bcblx0ZGVmIGhhbHQgZG8gc3RvcFxuXG5cdCMgbWlncmF0ZSBmcm9tIGNhbmNlbCB0byBwcmV2ZW50XG5cdGRlZiBwcmV2ZW50XG5cdFx0aWYgZXZlbnQ6cHJldmVudERlZmF1bHRcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0XG5cdFx0ZWxzZVxuXHRcdFx0ZXZlbnQ6ZGVmYXVsdFByZXZlbnRlZCA9IHllc1xuXHRcdHNlbGY6ZGVmYXVsdFByZXZlbnRlZCA9IHllc1xuXHRcdHNlbGZcblxuXHRkZWYgcHJldmVudERlZmF1bHRcblx0XHRjb25zb2xlLndhcm4gXCJFdmVudCNwcmV2ZW50RGVmYXVsdCBpcyBkZXByZWNhdGVkIC0gdXNlIEV2ZW50I3ByZXZlbnRcIlxuXHRcdHByZXZlbnRcblxuXHQjIyNcblx0SW5kaWNhdGVzIHdoZXRoZXIgb3Igbm90IGV2ZW50LmNhbmNlbCBoYXMgYmVlbiBjYWxsZWQuXG5cblx0QHJldHVybiB7Qm9vbGVhbn1cblx0IyMjXG5cdGRlZiBpc1ByZXZlbnRlZFxuXHRcdGV2ZW50IGFuZCBldmVudDpkZWZhdWx0UHJldmVudGVkIG9yIEBjYW5jZWxcblxuXHQjIyNcblx0Q2FuY2VsIHRoZSBldmVudCAoaWYgY2FuY2VsYWJsZSkuIEluIHRoZSBjYXNlIG9mIG5hdGl2ZSBldmVudHMgaXRcblx0d2lsbCBjYWxsIGBwcmV2ZW50RGVmYXVsdGAgb24gdGhlIHdyYXBwZWQgZXZlbnQgb2JqZWN0LlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGNhbmNlbFxuXHRcdGNvbnNvbGUud2FybiBcIkV2ZW50I2NhbmNlbCBpcyBkZXByZWNhdGVkIC0gdXNlIEV2ZW50I3ByZXZlbnRcIlxuXHRcdHByZXZlbnRcblxuXHRkZWYgc2lsZW5jZVxuXHRcdEBzaWxlbmNlZCA9IHllc1xuXHRcdHNlbGZcblxuXHRkZWYgaXNTaWxlbmNlZFxuXHRcdCEhQHNpbGVuY2VkXG5cblx0IyMjXG5cdEEgcmVmZXJlbmNlIHRvIHRoZSBpbml0aWFsIHRhcmdldCBvZiB0aGUgZXZlbnQuXG5cdCMjI1xuXHRkZWYgdGFyZ2V0XG5cdFx0dGFnKGV2ZW50Ol90YXJnZXQgb3IgZXZlbnQ6dGFyZ2V0KVxuXG5cdCMjI1xuXHRBIHJlZmVyZW5jZSB0byB0aGUgb2JqZWN0IHJlc3BvbmRpbmcgdG8gdGhlIGV2ZW50LlxuXHQjIyNcblx0ZGVmIHJlc3BvbmRlclxuXHRcdEByZXNwb25kZXJcblxuXHQjIyNcblx0UmVkaXJlY3QgdGhlIGV2ZW50IHRvIG5ldyB0YXJnZXRcblx0IyMjXG5cdGRlZiByZWRpcmVjdCBub2RlXG5cdFx0QHJlZGlyZWN0ID0gbm9kZVxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIHByb2Nlc3NIYW5kbGVycyBub2RlLCBoYW5kbGVyc1xuXHRcdGxldCBpID0gMVxuXHRcdGxldCBsID0gaGFuZGxlcnM6bGVuZ3RoXG5cdFx0bGV0IGJ1YmJsZSA9IEBidWJibGVcblx0XHRsZXQgc3RhdGUgPSBoYW5kbGVyczpzdGF0ZSB8fD0ge31cblx0XHRsZXQgcmVzdWx0IFxuXHRcdFxuXHRcdGlmIGJ1YmJsZVxuXHRcdFx0QGJ1YmJsZSA9IDFcblxuXHRcdHdoaWxlIGkgPCBsXG5cdFx0XHRsZXQgaXNNb2QgPSBmYWxzZVxuXHRcdFx0bGV0IGhhbmRsZXIgPSBoYW5kbGVyc1tpKytdXG5cdFx0XHRsZXQgcGFyYW1zICA9IG51bGxcblx0XHRcdGxldCBjb250ZXh0ID0gbm9kZVxuXHRcdFx0XG5cdFx0XHRpZiBoYW5kbGVyIGlzYSBBcnJheVxuXHRcdFx0XHRwYXJhbXMgPSBoYW5kbGVyLnNsaWNlKDEpXG5cdFx0XHRcdGhhbmRsZXIgPSBoYW5kbGVyWzBdXG5cdFx0XHRcblx0XHRcdGlmIHR5cGVvZiBoYW5kbGVyID09ICdzdHJpbmcnXG5cdFx0XHRcdGlmIGtleUNvZGVzW2hhbmRsZXJdXG5cdFx0XHRcdFx0cGFyYW1zID0gW2tleUNvZGVzW2hhbmRsZXJdXVxuXHRcdFx0XHRcdGhhbmRsZXIgPSAna2V5J1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRsZXQgbW9kID0gaGFuZGxlciArICdNb2RpZmllcidcblxuXHRcdFx0XHRpZiBub2RlW21vZF1cblx0XHRcdFx0XHRpc01vZCA9IHllc1xuXHRcdFx0XHRcdHBhcmFtcyA9IChwYXJhbXMgb3IgW10pLmNvbmNhdChbc2VsZixzdGF0ZV0pXG5cdFx0XHRcdFx0aGFuZGxlciA9IG5vZGVbbW9kXVxuXHRcdFx0XG5cdFx0XHQjIGlmIGl0IGlzIHN0aWxsIGEgc3RyaW5nIC0gY2FsbCBnZXRIYW5kbGVyIG9uXG5cdFx0XHQjIGFuY2VzdG9yIG9mIG5vZGUgdG8gc2VlIGlmIHdlIGdldCBhIGhhbmRsZXIgZm9yIHRoaXMgbmFtZVxuXHRcdFx0aWYgdHlwZW9mIGhhbmRsZXIgPT0gJ3N0cmluZydcblx0XHRcdFx0bGV0IGVsID0gbm9kZVxuXHRcdFx0XHRsZXQgZm4gPSBudWxsXG5cdFx0XHRcdHdoaWxlIGVsIGFuZCAoIWZuIG9yICEoZm4gaXNhIEZ1bmN0aW9uKSlcblx0XHRcdFx0XHRpZiBmbiA9IGVsLmdldEhhbmRsZXIoaGFuZGxlcilcblx0XHRcdFx0XHRcdGlmIGZuW2hhbmRsZXJdIGlzYSBGdW5jdGlvblxuXHRcdFx0XHRcdFx0XHRoYW5kbGVyID0gZm5baGFuZGxlcl1cblx0XHRcdFx0XHRcdFx0Y29udGV4dCA9IGZuXG5cdFx0XHRcdFx0XHRlbGlmIGZuIGlzYSBGdW5jdGlvblxuXHRcdFx0XHRcdFx0XHRoYW5kbGVyID0gZm5cblx0XHRcdFx0XHRcdFx0Y29udGV4dCA9IGVsXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0ZWwgPSBlbC5wYXJlbnRcblx0XHRcdFx0XHRcblx0XHRcdGlmIGhhbmRsZXIgaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdCMgd2hhdCBpZiB3ZSBhY3R1YWxseSBjYWxsIHN0b3AgaW5zaWRlIGZ1bmN0aW9uP1xuXHRcdFx0XHQjIGRvIHdlIHN0aWxsIHdhbnQgdG8gY29udGludWUgdGhlIGNoYWluP1xuXHRcdFx0XHRsZXQgcmVzID0gaGFuZGxlci5hcHBseShjb250ZXh0LHBhcmFtcyBvciBbc2VsZl0pXG5cblx0XHRcdFx0aWYgIWlzTW9kXG5cdFx0XHRcdFx0QHJlc3BvbmRlciB8fD0gbm9kZVxuXG5cdFx0XHRcdGlmIHJlcyA9PSBmYWxzZVxuXHRcdFx0XHRcdCMgY29uc29sZS5sb2cgXCJyZXR1cm5lZCBmYWxzZSAtIGJyZWFraW5nXCJcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdGlmIHJlcyBhbmQgIUBzaWxlbmNlZCBhbmQgcmVzOnRoZW4gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdFx0cmVzLnRoZW4oSW1iYTpjb21taXQpXG5cdFx0XG5cdFx0IyBpZiB3ZSBoYXZlbnQgc3RvcHBlZCBvciBkZWFsdCB3aXRoIGJ1YmJsZSB3aGlsZSBoYW5kbGluZ1xuXHRcdGlmIEBidWJibGUgPT09IDFcblx0XHRcdEBidWJibGUgPSBidWJibGVcblxuXHRcdHJldHVybiBudWxsXG5cblx0ZGVmIHByb2Nlc3Ncblx0XHR2YXIgbmFtZSA9IHNlbGYubmFtZVxuXHRcdHZhciBtZXRoID0gXCJvbntAcHJlZml4IG9yICcnfXtuYW1lfVwiXG5cdFx0dmFyIGFyZ3MgPSBudWxsXG5cdFx0dmFyIGRvbXRhcmdldCA9IGV2ZW50Ol90YXJnZXQgb3IgZXZlbnQ6dGFyZ2V0XHRcdFxuXHRcdHZhciBkb21ub2RlID0gZG9tdGFyZ2V0Ol9yZXNwb25kZXIgb3IgZG9tdGFyZ2V0XG5cdFx0IyBAdG9kbyBuZWVkIHRvIHN0b3AgaW5maW5pdGUgcmVkaXJlY3QtcnVsZXMgaGVyZVxuXHRcdHZhciByZXN1bHRcblx0XHR2YXIgaGFuZGxlcnNcblxuXHRcdHdoaWxlIGRvbW5vZGVcblx0XHRcdEByZWRpcmVjdCA9IG51bGxcblx0XHRcdGxldCBub2RlID0gZG9tbm9kZS5AZG9tID8gZG9tbm9kZSA6IGRvbW5vZGUuQHRhZ1xuXG5cdFx0XHRpZiBub2RlXG5cdFx0XHRcdGlmIGhhbmRsZXJzID0gbm9kZTpfb25fXG5cdFx0XHRcdFx0Zm9yIGhhbmRsZXIgaW4gaGFuZGxlcnMgd2hlbiBoYW5kbGVyXG5cdFx0XHRcdFx0XHRsZXQgaG5hbWUgPSBoYW5kbGVyWzBdXG5cdFx0XHRcdFx0XHRpZiBuYW1lID09IGhhbmRsZXJbMF0gYW5kIGJ1YmJsZVxuXHRcdFx0XHRcdFx0XHRwcm9jZXNzSGFuZGxlcnMobm9kZSxoYW5kbGVyKVxuXHRcdFx0XHRcdGJyZWFrIHVubGVzcyBidWJibGVcblxuXHRcdFx0XHRpZiBidWJibGUgYW5kIG5vZGVbbWV0aF0gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdFx0QHJlc3BvbmRlciB8fD0gbm9kZVxuXHRcdFx0XHRcdEBzaWxlbmNlZCA9IG5vXG5cdFx0XHRcdFx0cmVzdWx0ID0gYXJncyA/IG5vZGVbbWV0aF0uYXBwbHkobm9kZSxhcmdzKSA6IG5vZGVbbWV0aF0oc2VsZixkYXRhKVxuXG5cdFx0XHRcdGlmIG5vZGU6b25ldmVudFxuXHRcdFx0XHRcdG5vZGUub25ldmVudChzZWxmKVxuXG5cdFx0XHQjIGFkZCBub2RlLm5leHRFdmVudFJlc3BvbmRlciBhcyBhIHNlcGFyYXRlIG1ldGhvZCBoZXJlP1xuXHRcdFx0dW5sZXNzIGJ1YmJsZSBhbmQgZG9tbm9kZSA9IChAcmVkaXJlY3Qgb3IgKG5vZGUgPyBub2RlLnBhcmVudCA6IGRvbW5vZGU6cGFyZW50Tm9kZSkpXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRwcm9jZXNzZWRcblxuXHRcdCMgaWYgYSBoYW5kbGVyIHJldHVybnMgYSBwcm9taXNlLCBub3RpZnkgc2NoZWR1bGVyc1xuXHRcdCMgYWJvdXQgdGhpcyBhZnRlciBwcm9taXNlIGhhcyBmaW5pc2hlZCBwcm9jZXNzaW5nXG5cdFx0aWYgcmVzdWx0IGFuZCByZXN1bHQ6dGhlbiBpc2EgRnVuY3Rpb25cblx0XHRcdHJlc3VsdC50aGVuKHNlbGY6cHJvY2Vzc2VkLmJpbmQoc2VsZikpXG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cdGRlZiBwcm9jZXNzZWRcblx0XHRpZiAhQHNpbGVuY2VkIGFuZCBAcmVzcG9uZGVyXG5cdFx0XHRJbWJhLmVtaXQoSW1iYSwnZXZlbnQnLFtzZWxmXSlcblx0XHRcdEltYmEuY29tbWl0KGV2ZW50KVxuXHRcdHNlbGZcblxuXHQjIyNcblx0UmV0dXJuIHRoZSB4L2xlZnQgY29vcmRpbmF0ZSBvZiB0aGUgbW91c2UgLyBwb2ludGVyIGZvciB0aGlzIGV2ZW50XG5cdEByZXR1cm4ge051bWJlcn0geCBjb29yZGluYXRlIG9mIG1vdXNlIC8gcG9pbnRlciBmb3IgZXZlbnRcblx0IyMjXG5cdGRlZiB4IGRvIGV2ZW50OnhcblxuXHQjIyNcblx0UmV0dXJuIHRoZSB5L3RvcCBjb29yZGluYXRlIG9mIHRoZSBtb3VzZSAvIHBvaW50ZXIgZm9yIHRoaXMgZXZlbnRcblx0QHJldHVybiB7TnVtYmVyfSB5IGNvb3JkaW5hdGUgb2YgbW91c2UgLyBwb2ludGVyIGZvciBldmVudFxuXHQjIyNcblx0ZGVmIHkgZG8gZXZlbnQ6eVxuXG5cdCMjI1xuXHRSZXR1cm5zIGEgTnVtYmVyIHJlcHJlc2VudGluZyBhIHN5c3RlbSBhbmQgaW1wbGVtZW50YXRpb25cblx0ZGVwZW5kZW50IG51bWVyaWMgY29kZSBpZGVudGlmeWluZyB0aGUgdW5tb2RpZmllZCB2YWx1ZSBvZiB0aGVcblx0cHJlc3NlZCBrZXk7IHRoaXMgaXMgdXN1YWxseSB0aGUgc2FtZSBhcyBrZXlDb2RlLlxuXG5cdEZvciBtb3VzZS1ldmVudHMsIHRoZSByZXR1cm5lZCB2YWx1ZSBpbmRpY2F0ZXMgd2hpY2ggYnV0dG9uIHdhc1xuXHRwcmVzc2VkIG9uIHRoZSBtb3VzZSB0byB0cmlnZ2VyIHRoZSBldmVudC5cblxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgd2hpY2ggZG8gZXZlbnQ6d2hpY2hcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL2V2ZW50LmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5yZXF1aXJlKFwiLi9wb2ludGVyXCIpXG5cbiMjI1xuXG5NYW5hZ2VyIGZvciBsaXN0ZW5pbmcgdG8gYW5kIGRlbGVnYXRpbmcgZXZlbnRzIGluIEltYmEuIEEgc2luZ2xlIGluc3RhbmNlXG5pcyBhbHdheXMgY3JlYXRlZCBieSBJbWJhIChhcyBgSW1iYS5FdmVudHNgKSwgd2hpY2ggaGFuZGxlcyBhbmQgZGVsZWdhdGVzIGFsbFxuZXZlbnRzIGF0IHRoZSB2ZXJ5IHJvb3Qgb2YgdGhlIGRvY3VtZW50LiBJbWJhIGRvZXMgbm90IGNhcHR1cmUgYWxsIGV2ZW50c1xuYnkgZGVmYXVsdCwgc28gaWYgeW91IHdhbnQgdG8gbWFrZSBzdXJlIGV4b3RpYyBvciBjdXN0b20gRE9NRXZlbnRzIGFyZSBkZWxlZ2F0ZWRcbmluIEltYmEgeW91IHdpbGwgbmVlZCB0byByZWdpc3RlciB0aGVtIGluIGBJbWJhLkV2ZW50cy5yZWdpc3RlcihteUN1c3RvbUV2ZW50TmFtZSlgXG5cbkBpbmFtZSBtYW5hZ2VyXG5cbiMjI1xuY2xhc3MgSW1iYS5FdmVudE1hbmFnZXJcblxuXHRwcm9wIHJvb3Rcblx0cHJvcCBjb3VudFxuXHRwcm9wIGVuYWJsZWQgZGVmYXVsdDogbm8sIHdhdGNoOiB5ZXNcblx0cHJvcCBsaXN0ZW5lcnNcblx0cHJvcCBkZWxlZ2F0b3JzXG5cdHByb3AgZGVsZWdhdG9yXG5cblx0ZGVmIGVuYWJsZWQtZGlkLXNldCBib29sXG5cdFx0Ym9vbCA/IG9uZW5hYmxlIDogb25kaXNhYmxlXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLmFjdGl2YXRlXG5cdFx0cmV0dXJuIEltYmEuRXZlbnRzIGlmIEltYmEuRXZlbnRzXG5cblx0XHRpZiAkd2ViJFxuXHRcdFx0SW1iYS5QT0lOVEVSIHx8PSBJbWJhLlBvaW50ZXIubmV3XG5cblx0XHRcdEltYmEuRXZlbnRzID0gSW1iYS5FdmVudE1hbmFnZXIubmV3KEltYmEuZG9jdW1lbnQsIGV2ZW50czogW1xuXHRcdFx0XHQ6a2V5ZG93biwgOmtleXVwLCA6a2V5cHJlc3MsXG5cdFx0XHRcdDp0ZXh0SW5wdXQsIDppbnB1dCwgOmNoYW5nZSwgOnN1Ym1pdCxcblx0XHRcdFx0OmZvY3VzaW4sIDpmb2N1c291dCwgOmZvY3VzLCA6Ymx1cixcblx0XHRcdFx0OmNvbnRleHRtZW51LCA6ZGJsY2xpY2ssXG5cdFx0XHRcdDptb3VzZXdoZWVsLCA6d2hlZWwsIDpzY3JvbGwsXG5cdFx0XHRcdDpiZWZvcmVjb3B5LCA6Y29weSxcblx0XHRcdFx0OmJlZm9yZXBhc3RlLCA6cGFzdGUsXG5cdFx0XHRcdDpiZWZvcmVjdXQsIDpjdXRcblx0XHRcdF0pXG5cblx0XHRcdCMgc2hvdWxkIGxpc3RlbiB0byBkcmFnZHJvcCBldmVudHMgYnkgZGVmYXVsdFxuXHRcdFx0SW1iYS5FdmVudHMucmVnaXN0ZXIoW1xuXHRcdFx0XHQ6ZHJhZ3N0YXJ0LDpkcmFnLDpkcmFnZW5kLFxuXHRcdFx0XHQ6ZHJhZ2VudGVyLDpkcmFnb3Zlciw6ZHJhZ2xlYXZlLDpkcmFnZXhpdCw6ZHJvcFxuXHRcdFx0XSlcblxuXHRcdFx0dmFyIGhhc1RvdWNoRXZlbnRzID0gd2luZG93ICYmIHdpbmRvdzpvbnRvdWNoc3RhcnQgIT09IHVuZGVmaW5lZFxuXG5cdFx0XHRpZiBoYXNUb3VjaEV2ZW50c1xuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoc3RhcnQpIGRvIHxlfFxuXHRcdFx0XHRcdEltYmEuVG91Y2gub250b3VjaHN0YXJ0KGUpXG5cblx0XHRcdFx0SW1iYS5FdmVudHMubGlzdGVuKDp0b3VjaG1vdmUpIGRvIHxlfFxuXHRcdFx0XHRcdEltYmEuVG91Y2gub250b3VjaG1vdmUoZSlcblxuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoZW5kKSBkbyB8ZXxcblx0XHRcdFx0XHRJbWJhLlRvdWNoLm9udG91Y2hlbmQoZSlcblxuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoY2FuY2VsKSBkbyB8ZXxcblx0XHRcdFx0XHRJbWJhLlRvdWNoLm9udG91Y2hjYW5jZWwoZSlcblxuXHRcdFx0SW1iYS5FdmVudHMucmVnaXN0ZXIoOmNsaWNrKSBkbyB8ZXxcblx0XHRcdFx0IyBPbmx5IGZvciBtYWluIG1vdXNlYnV0dG9uLCBubz9cblx0XHRcdFx0aWYgKGU6dGltZVN0YW1wIC0gSW1iYS5Ub3VjaC5MYXN0VGltZXN0YW1wKSA+IEltYmEuVG91Y2guVGFwVGltZW91dFxuXHRcdFx0XHRcdGUuQGltYmFTaW11bGF0ZWRUYXAgPSB5ZXNcblx0XHRcdFx0XHR2YXIgdGFwID0gSW1iYS5FdmVudC5uZXcoZSlcblx0XHRcdFx0XHR0YXAudHlwZSA9ICd0YXAnXG5cdFx0XHRcdFx0dGFwLnByb2Nlc3Ncblx0XHRcdFx0XHRpZiB0YXAuQHJlc3BvbmRlclxuXHRcdFx0XHRcdFx0cmV0dXJuIGUucHJldmVudERlZmF1bHRcblx0XHRcdFx0IyBkZWxlZ2F0ZSB0aGUgcmVhbCBjbGljayBldmVudFxuXHRcdFx0XHRJbWJhLkV2ZW50cy5kZWxlZ2F0ZShlKVxuXG5cdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOm1vdXNlZG93bikgZG8gfGV8XG5cdFx0XHRcdGlmIChlOnRpbWVTdGFtcCAtIEltYmEuVG91Y2guTGFzdFRpbWVzdGFtcCkgPiBJbWJhLlRvdWNoLlRhcFRpbWVvdXRcblx0XHRcdFx0XHRJbWJhLlBPSU5URVIudXBkYXRlKGUpLnByb2Nlc3MgaWYgSW1iYS5QT0lOVEVSXG5cblx0XHRcdEltYmEuRXZlbnRzLmxpc3Rlbig6bW91c2V1cCkgZG8gfGV8XG5cdFx0XHRcdGlmIChlOnRpbWVTdGFtcCAtIEltYmEuVG91Y2guTGFzdFRpbWVzdGFtcCkgPiBJbWJhLlRvdWNoLlRhcFRpbWVvdXRcblx0XHRcdFx0XHRJbWJhLlBPSU5URVIudXBkYXRlKGUpLnByb2Nlc3MgaWYgSW1iYS5QT0lOVEVSXG5cblx0XHRcdEltYmEuRXZlbnRzLnJlZ2lzdGVyKFs6bW91c2Vkb3duLDptb3VzZXVwXSlcblx0XHRcdEltYmEuRXZlbnRzLmVuYWJsZWQgPSB5ZXNcblx0XHRcdHJldHVybiBJbWJhLkV2ZW50c1xuXG5cblx0ZGVmIGluaXRpYWxpemUgbm9kZSwgZXZlbnRzOiBbXVxuXHRcdEBzaGltRm9jdXNFdmVudHMgPSAkd2ViJCAmJiB3aW5kb3c6bmV0c2NhcGUgJiYgbm9kZTpvbmZvY3VzaW4gPT09IHVuZGVmaW5lZFxuXHRcdHJvb3QgPSBub2RlXG5cdFx0bGlzdGVuZXJzID0gW11cblx0XHRkZWxlZ2F0b3JzID0ge31cblx0XHRkZWxlZ2F0b3IgPSBkbyB8ZXwgXG5cdFx0XHRkZWxlZ2F0ZShlKVxuXHRcdFx0cmV0dXJuIHRydWVcblxuXHRcdGZvciBldmVudCBpbiBldmVudHNcblx0XHRcdHJlZ2lzdGVyKGV2ZW50KVxuXG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblxuXHRUZWxsIHRoZSBjdXJyZW50IEV2ZW50TWFuYWdlciB0byBpbnRlcmNlcHQgYW5kIGhhbmRsZSBldmVudCBvZiBhIGNlcnRhaW4gbmFtZS5cblx0QnkgZGVmYXVsdCwgSW1iYS5FdmVudHMgd2lsbCByZWdpc3RlciBpbnRlcmNlcHRvcnMgZm9yOiAqa2V5ZG93biosICprZXl1cCosIFxuXHQqa2V5cHJlc3MqLCAqdGV4dElucHV0KiwgKmlucHV0KiwgKmNoYW5nZSosICpzdWJtaXQqLCAqZm9jdXNpbiosICpmb2N1c291dCosIFxuXHQqYmx1ciosICpjb250ZXh0bWVudSosICpkYmxjbGljayosICptb3VzZXdoZWVsKiwgKndoZWVsKlxuXG5cdCMjI1xuXHRkZWYgcmVnaXN0ZXIgbmFtZSwgaGFuZGxlciA9IHRydWVcblx0XHRpZiBuYW1lIGlzYSBBcnJheVxuXHRcdFx0cmVnaXN0ZXIodixoYW5kbGVyKSBmb3IgdiBpbiBuYW1lXG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0cmV0dXJuIHNlbGYgaWYgZGVsZWdhdG9yc1tuYW1lXVxuXHRcdCMgY29uc29sZS5sb2coXCJyZWdpc3RlciBmb3IgZXZlbnQge25hbWV9XCIpXG5cdFx0dmFyIGZuID0gZGVsZWdhdG9yc1tuYW1lXSA9IGhhbmRsZXIgaXNhIEZ1bmN0aW9uID8gaGFuZGxlciA6IGRlbGVnYXRvclxuXHRcdHJvb3QuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLGZuLHllcykgaWYgZW5hYmxlZFxuXG5cdGRlZiBsaXN0ZW4gbmFtZSwgaGFuZGxlciwgY2FwdHVyZSA9IHllc1xuXHRcdGxpc3RlbmVycy5wdXNoKFtuYW1lLGhhbmRsZXIsY2FwdHVyZV0pXG5cdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKG5hbWUsaGFuZGxlcixjYXB0dXJlKSBpZiBlbmFibGVkXG5cdFx0c2VsZlxuXG5cdGRlZiBkZWxlZ2F0ZSBlXG5cdFx0dmFyIGV2ZW50ID0gSW1iYS5FdmVudC53cmFwKGUpXG5cdFx0ZXZlbnQucHJvY2Vzc1xuXHRcdGlmIEBzaGltRm9jdXNFdmVudHNcblx0XHRcdGlmIGU6dHlwZSA9PSAnZm9jdXMnXG5cdFx0XHRcdEltYmEuRXZlbnQud3JhcChlKS5zZXRUeXBlKCdmb2N1c2luJykucHJvY2Vzc1xuXHRcdFx0ZWxpZiBlOnR5cGUgPT0gJ2JsdXInXG5cdFx0XHRcdEltYmEuRXZlbnQud3JhcChlKS5zZXRUeXBlKCdmb2N1c291dCcpLnByb2Nlc3Ncblx0XHRzZWxmXG5cblx0IyMjXG5cblx0Q3JlYXRlIGEgbmV3IEltYmEuRXZlbnRcblxuXHQjIyNcblx0ZGVmIGNyZWF0ZSB0eXBlLCB0YXJnZXQsIGRhdGE6IG51bGwsIHNvdXJjZTogbnVsbFxuXHRcdHZhciBldmVudCA9IEltYmEuRXZlbnQud3JhcCB0eXBlOiB0eXBlLCB0YXJnZXQ6IHRhcmdldFxuXHRcdGV2ZW50LmRhdGEgPSBkYXRhIGlmIGRhdGFcblx0XHRldmVudC5zb3VyY2UgPSBzb3VyY2UgaWYgc291cmNlXG5cdFx0ZXZlbnRcblxuXHQjIyNcblxuXHRUcmlnZ2VyIC8gcHJvY2VzcyBhbiBJbWJhLkV2ZW50LlxuXG5cdCMjI1xuXHRkZWYgdHJpZ2dlclxuXHRcdGNyZWF0ZSgqYXJndW1lbnRzKS5wcm9jZXNzXG5cblx0ZGVmIG9uZW5hYmxlXG5cdFx0Zm9yIG93biBuYW1lLGhhbmRsZXIgb2YgZGVsZWdhdG9yc1xuXHRcdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKG5hbWUsaGFuZGxlcix5ZXMpXG5cblx0XHRmb3IgaXRlbSBpbiBsaXN0ZW5lcnNcblx0XHRcdHJvb3QuYWRkRXZlbnRMaXN0ZW5lcihpdGVtWzBdLGl0ZW1bMV0saXRlbVsyXSlcblx0XHRcdFxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJyxJbWJhOmNvbW1pdClcblx0XHRzZWxmXG5cblx0ZGVmIG9uZGlzYWJsZVxuXHRcdGZvciBvd24gbmFtZSxoYW5kbGVyIG9mIGRlbGVnYXRvcnNcblx0XHRcdHJvb3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLGhhbmRsZXIseWVzKVxuXG5cdFx0Zm9yIGl0ZW0gaW4gbGlzdGVuZXJzXG5cdFx0XHRyb290LnJlbW92ZUV2ZW50TGlzdGVuZXIoaXRlbVswXSxpdGVtWzFdLGl0ZW1bMl0pXG5cblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsSW1iYTpjb21taXQpXG5cdFx0c2VsZlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC1tYW5hZ2VyLmltYmEiLCJleHRlcm4gbmF2aWdhdG9yXG5cbnZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuZGVmIHJlbW92ZU5lc3RlZCByb290LCBub2RlLCBjYXJldFxuXHQjIGlmIG5vZGUvbm9kZXMgaXNhIFN0cmluZ1xuXHQjIFx0d2UgbmVlZCB0byB1c2UgdGhlIGNhcmV0IHRvIHJlbW92ZSBlbGVtZW50c1xuXHQjIFx0Zm9yIG5vdyB3ZSB3aWxsIHNpbXBseSBub3Qgc3VwcG9ydCB0aGlzXG5cdGlmIG5vZGUgaXNhIEFycmF5XG5cdFx0cmVtb3ZlTmVzdGVkKHJvb3QsbWVtYmVyLGNhcmV0KSBmb3IgbWVtYmVyIGluIG5vZGVcblx0ZWxpZiBub2RlIGFuZCBub2RlLkBkb21cblx0XHRyb290LnJlbW92ZUNoaWxkKG5vZGUpXG5cdGVsaWYgbm9kZSAhPSBudWxsXG5cdFx0IyB3aGF0IGlmIHRoaXMgaXMgbm90IG51bGw/IT8hP1xuXHRcdCMgdGFrZSBhIGNoYW5jZSBhbmQgcmVtb3ZlIGEgdGV4dC1lbGVtZW50bmdcblx0XHRsZXQgbmV4dCA9IGNhcmV0ID8gY2FyZXQ6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZFxuXHRcdGlmIG5leHQgaXNhIFRleHQgYW5kIG5leHQ6dGV4dENvbnRlbnQgPT0gbm9kZVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChuZXh0KVxuXHRcdGVsc2Vcblx0XHRcdHRocm93ICdjYW5ub3QgcmVtb3ZlIHN0cmluZydcblxuXHRyZXR1cm4gY2FyZXRcblxuZGVmIGFwcGVuZE5lc3RlZCByb290LCBub2RlXG5cdGlmIG5vZGUgaXNhIEFycmF5XG5cdFx0bGV0IGkgPSAwXG5cdFx0bGV0IGMgPSBub2RlOnRhZ2xlblxuXHRcdGxldCBrID0gYyAhPSBudWxsID8gKG5vZGU6ZG9tbGVuID0gYykgOiBub2RlOmxlbmd0aFxuXHRcdGFwcGVuZE5lc3RlZChyb290LG5vZGVbaSsrXSkgd2hpbGUgaSA8IGtcblx0ZWxpZiBub2RlIGFuZCBub2RlLkBkb21cblx0XHRyb290LmFwcGVuZENoaWxkKG5vZGUpXG5cdGVsaWYgbm9kZSAhPSBudWxsIGFuZCBub2RlICE9PSBmYWxzZVxuXHRcdHJvb3QuYXBwZW5kQ2hpbGQgSW1iYS5jcmVhdGVUZXh0Tm9kZShub2RlKVxuXG5cdHJldHVyblxuXG5cbiMgaW5zZXJ0IG5vZGVzIGJlZm9yZSBhIGNlcnRhaW4gbm9kZVxuIyBkb2VzIG5vdCBuZWVkIHRvIHJldHVybiBhbnkgdGFpbCwgYXMgYmVmb3JlXG4jIHdpbGwgc3RpbGwgYmUgY29ycmVjdCB0aGVyZVxuIyBiZWZvcmUgbXVzdCBiZSBhbiBhY3R1YWwgZG9tbm9kZVxuZGVmIGluc2VydE5lc3RlZEJlZm9yZSByb290LCBub2RlLCBiZWZvcmVcblx0aWYgbm9kZSBpc2EgQXJyYXlcblx0XHRsZXQgaSA9IDBcblx0XHRsZXQgYyA9IG5vZGU6dGFnbGVuXG5cdFx0bGV0IGsgPSBjICE9IG51bGwgPyAobm9kZTpkb21sZW4gPSBjKSA6IG5vZGU6bGVuZ3RoXG5cdFx0aW5zZXJ0TmVzdGVkQmVmb3JlKHJvb3Qsbm9kZVtpKytdLGJlZm9yZSkgd2hpbGUgaSA8IGtcblxuXHRlbGlmIG5vZGUgYW5kIG5vZGUuQGRvbVxuXHRcdHJvb3QuaW5zZXJ0QmVmb3JlKG5vZGUsYmVmb3JlKVxuXHRlbGlmIG5vZGUgIT0gbnVsbCBhbmQgbm9kZSAhPT0gZmFsc2Vcblx0XHRyb290Lmluc2VydEJlZm9yZShJbWJhLmNyZWF0ZVRleHROb2RlKG5vZGUpLGJlZm9yZSlcblxuXHRyZXR1cm4gYmVmb3JlXG5cbiMgYWZ0ZXIgbXVzdCBiZSBhbiBhY3R1YWwgZG9tbm9kZVxuZGVmIGluc2VydE5lc3RlZEFmdGVyIHJvb3QsIG5vZGUsIGFmdGVyXG5cdHZhciBiZWZvcmUgPSBhZnRlciA/IGFmdGVyOm5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblxuXHRpZiBiZWZvcmVcblx0XHRpbnNlcnROZXN0ZWRCZWZvcmUocm9vdCxub2RlLGJlZm9yZSlcblx0XHRyZXR1cm4gYmVmb3JlOnByZXZpb3VzU2libGluZ1xuXHRlbHNlXG5cdFx0YXBwZW5kTmVzdGVkKHJvb3Qsbm9kZSlcblx0XHRyZXR1cm4gcm9vdC5AZG9tOmxhc3RDaGlsZFxuXG5kZWYgcmVjb25jaWxlQ29sbGVjdGlvbkNoYW5nZXMgcm9vdCwgbmV3LCBvbGQsIGNhcmV0XG5cblx0dmFyIG5ld0xlbiA9IG5ldzpsZW5ndGhcblx0dmFyIGxhc3ROZXcgPSBuZXdbbmV3TGVuIC0gMV1cblxuXHQjIFRoaXMgcmUtb3JkZXIgYWxnb3JpdGhtIGlzIGJhc2VkIG9uIHRoZSBmb2xsb3dpbmcgcHJpbmNpcGxlOlxuXHQjIFxuXHQjIFdlIGJ1aWxkIGEgXCJjaGFpblwiIHdoaWNoIHNob3dzIHdoaWNoIGl0ZW1zIGFyZSBhbHJlYWR5IHNvcnRlZC5cblx0IyBJZiB3ZSdyZSBnb2luZyBmcm9tIFsxLCAyLCAzXSAtPiBbMiwgMSwgM10sIHRoZSB0cmVlIGxvb2tzIGxpa2U6XG5cdCNcblx0IyBcdDMgLT4gIDAgKGlkeClcblx0IyBcdDIgLT4gLTEgKGlkeClcblx0IyBcdDEgLT4gLTEgKGlkeClcblx0I1xuXHQjIFRoaXMgdGVsbHMgdXMgdGhhdCB3ZSBoYXZlIHR3byBjaGFpbnMgb2Ygb3JkZXJlZCBpdGVtczpcblx0IyBcblx0IyBcdCgxLCAzKSBhbmQgKDIpXG5cdCMgXG5cdCMgVGhlIG9wdGltYWwgcmUtb3JkZXJpbmcgdGhlbiBiZWNvbWVzIHRvIGtlZXAgdGhlIGxvbmdlc3QgY2hhaW4gaW50YWN0LFxuXHQjIGFuZCBtb3ZlIGFsbCB0aGUgb3RoZXIgaXRlbXMuXG5cblx0dmFyIG5ld1Bvc2l0aW9uID0gW11cblxuXHQjIFRoZSB0cmVlL2dyYXBoIGl0c2VsZlxuXHR2YXIgcHJldkNoYWluID0gW11cblx0IyBUaGUgbGVuZ3RoIG9mIHRoZSBjaGFpblxuXHR2YXIgbGVuZ3RoQ2hhaW4gPSBbXVxuXG5cdCMgS2VlcCB0cmFjayBvZiB0aGUgbG9uZ2VzdCBjaGFpblxuXHR2YXIgbWF4Q2hhaW5MZW5ndGggPSAwXG5cdHZhciBtYXhDaGFpbkVuZCA9IDBcblxuXHR2YXIgaGFzVGV4dE5vZGVzID0gbm9cblx0dmFyIG5ld1Bvc1xuXG5cdGZvciBub2RlLCBpZHggaW4gb2xkXG5cdFx0IyBzcGVjaWFsIGNhc2UgZm9yIFRleHQgbm9kZXNcblx0XHRpZiBub2RlIGFuZCBub2RlOm5vZGVUeXBlID09IDNcblx0XHRcdG5ld1BvcyA9IG5ldy5pbmRleE9mKG5vZGU6dGV4dENvbnRlbnQpXG5cdFx0XHRuZXdbbmV3UG9zXSA9IG5vZGUgaWYgbmV3UG9zID49IDBcblx0XHRcdGhhc1RleHROb2RlcyA9IHllc1xuXHRcdGVsc2Vcblx0XHRcdG5ld1BvcyA9IG5ldy5pbmRleE9mKG5vZGUpXG5cblx0XHRuZXdQb3NpdGlvbi5wdXNoKG5ld1BvcylcblxuXHRcdGlmIG5ld1BvcyA9PSAtMVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChub2RlKVxuXHRcdFx0cHJldkNoYWluLnB1c2goLTEpXG5cdFx0XHRsZW5ndGhDaGFpbi5wdXNoKC0xKVxuXHRcdFx0Y29udGludWVcblxuXHRcdHZhciBwcmV2SWR4ID0gbmV3UG9zaXRpb246bGVuZ3RoIC0gMlxuXG5cdFx0IyBCdWlsZCB0aGUgY2hhaW46XG5cdFx0d2hpbGUgcHJldklkeCA+PSAwXG5cdFx0XHRpZiBuZXdQb3NpdGlvbltwcmV2SWR4XSA9PSAtMVxuXHRcdFx0XHRwcmV2SWR4LS1cblx0XHRcdGVsaWYgbmV3UG9zID4gbmV3UG9zaXRpb25bcHJldklkeF1cblx0XHRcdFx0IyBZYXksIHdlJ3JlIGJpZ2dlciB0aGFuIHRoZSBwcmV2aW91cyFcblx0XHRcdFx0YnJlYWtcblx0XHRcdGVsc2Vcblx0XHRcdFx0IyBOb3BlLCBsZXQncyB3YWxrIGJhY2sgdGhlIGNoYWluXG5cdFx0XHRcdHByZXZJZHggPSBwcmV2Q2hhaW5bcHJldklkeF1cblxuXHRcdHByZXZDaGFpbi5wdXNoKHByZXZJZHgpXG5cblx0XHR2YXIgY3Vyckxlbmd0aCA9IChwcmV2SWR4ID09IC0xKSA/IDAgOiBsZW5ndGhDaGFpbltwcmV2SWR4XSsxXG5cblx0XHRpZiBjdXJyTGVuZ3RoID4gbWF4Q2hhaW5MZW5ndGhcblx0XHRcdG1heENoYWluTGVuZ3RoID0gY3Vyckxlbmd0aFxuXHRcdFx0bWF4Q2hhaW5FbmQgPSBpZHhcblxuXHRcdGxlbmd0aENoYWluLnB1c2goY3Vyckxlbmd0aClcblxuXHR2YXIgc3RpY2t5Tm9kZXMgPSBbXVxuXG5cdCMgTm93IHdlIGNhbiB3YWxrIHRoZSBsb25nZXN0IGNoYWluIGJhY2t3YXJkcyBhbmQgbWFyayB0aGVtIGFzIFwic3RpY2t5XCIsXG5cdCMgd2hpY2ggaW1wbGllcyB0aGF0IHRoZXkgc2hvdWxkIG5vdCBiZSBtb3ZlZFxuXHR2YXIgY3Vyc29yID0gbmV3UG9zaXRpb246bGVuZ3RoIC0gMVxuXHR3aGlsZSBjdXJzb3IgPj0gMFxuXHRcdGlmIGN1cnNvciA9PSBtYXhDaGFpbkVuZCBhbmQgbmV3UG9zaXRpb25bY3Vyc29yXSAhPSAtMVxuXHRcdFx0c3RpY2t5Tm9kZXNbbmV3UG9zaXRpb25bY3Vyc29yXV0gPSB0cnVlXG5cdFx0XHRtYXhDaGFpbkVuZCA9IHByZXZDaGFpblttYXhDaGFpbkVuZF1cblxuXHRcdGN1cnNvciAtPSAxXG5cblx0IyBwb3NzaWJsZSB0byBkbyB0aGlzIGluIHJldmVyc2VkIG9yZGVyIGluc3RlYWQ/XG5cdGZvciBub2RlLCBpZHggaW4gbmV3XG5cdFx0aWYgIXN0aWNreU5vZGVzW2lkeF1cblx0XHRcdCMgY3JlYXRlIHRleHRub2RlIGZvciBzdHJpbmcsIGFuZCB1cGRhdGUgdGhlIGFycmF5XG5cdFx0XHR1bmxlc3Mgbm9kZSBhbmQgbm9kZS5AZG9tXG5cdFx0XHRcdG5vZGUgPSBuZXdbaWR4XSA9IEltYmEuY3JlYXRlVGV4dE5vZGUobm9kZSlcblxuXHRcdFx0dmFyIGFmdGVyID0gbmV3W2lkeCAtIDFdXG5cdFx0XHRpbnNlcnROZXN0ZWRBZnRlcihyb290LCBub2RlLCAoYWZ0ZXIgYW5kIGFmdGVyLkBkb20gb3IgYWZ0ZXIgb3IgY2FyZXQpKVxuXG5cdFx0Y2FyZXQgPSBub2RlLkBkb20gb3IgKGNhcmV0IGFuZCBjYXJldDpuZXh0U2libGluZyBvciByb290LkBkb206Zmlyc3RDaGlsZClcblxuXHQjIHNob3VsZCB0cnVzdCB0aGF0IHRoZSBsYXN0IGl0ZW0gaW4gbmV3IGxpc3QgaXMgdGhlIGNhcmV0XG5cdHJldHVybiBsYXN0TmV3IGFuZCBsYXN0TmV3LkBkb20gb3IgY2FyZXRcblxuXG4jIGV4cGVjdHMgYSBmbGF0IG5vbi1zcGFyc2UgYXJyYXkgb2Ygbm9kZXMgaW4gYm90aCBuZXcgYW5kIG9sZCwgYWx3YXlzXG5kZWYgcmVjb25jaWxlQ29sbGVjdGlvbiByb290LCBuZXcsIG9sZCwgY2FyZXRcblx0dmFyIGsgPSBuZXc6bGVuZ3RoXG5cdHZhciBpID0ga1xuXHR2YXIgbGFzdCA9IG5ld1trIC0gMV1cblxuXG5cdGlmIGsgPT0gb2xkOmxlbmd0aCBhbmQgbmV3WzBdID09PSBvbGRbMF1cblx0XHQjIHJ1bm5pbmcgdGhyb3VnaCB0byBjb21wYXJlXG5cdFx0d2hpbGUgaS0tXG5cdFx0XHRicmVhayBpZiBuZXdbaV0gIT09IG9sZFtpXVxuXG5cdGlmIGkgPT0gLTFcblx0XHRyZXR1cm4gbGFzdCBhbmQgbGFzdC5AZG9tIG9yIGxhc3Qgb3IgY2FyZXRcblx0ZWxzZVxuXHRcdHJldHVybiByZWNvbmNpbGVDb2xsZWN0aW9uQ2hhbmdlcyhyb290LG5ldyxvbGQsY2FyZXQpXG5cbiMgVFlQRSA1IC0gd2Uga25vdyB0aGF0IHdlIGFyZSBkZWFsaW5nIHdpdGggYSBzaW5nbGUgYXJyYXkgb2ZcbiMga2V5ZWQgdGFncyAtIGFuZCByb290IGhhcyBubyBvdGhlciBjaGlsZHJlblxuZGVmIHJlY29uY2lsZUxvb3Agcm9vdCwgbmV3LCBvbGQsIGNhcmV0XG5cdHZhciBubCA9IG5ldzpsZW5ndGhcblx0dmFyIG9sID0gb2xkOmxlbmd0aFxuXHR2YXIgY2wgPSBuZXc6Y2FjaGU6aSQgIyBjYWNoZS1sZW5ndGhcblx0dmFyIGkgPSAwLCBkID0gbmwgLSBvbFxuXG5cdCMgZmluZCB0aGUgZmlyc3QgaW5kZXggdGhhdCBpcyBkaWZmZXJlbnRcblx0aSsrIHdoaWxlIGkgPCBvbCBhbmQgaSA8IG5sIGFuZCBuZXdbaV0gPT09IG9sZFtpXVxuXHRcblx0IyBjb25kaXRpb25hbGx5IHBydW5lIGNhY2hlXG5cdGlmIGNsID4gMTAwMCBhbmQgKGNsIC0gbmwpID4gNTAwXG5cdFx0bmV3OmNhY2hlOiRwcnVuZShuZXcpXG5cdFxuXHRpZiBkID4gMCBhbmQgaSA9PSBvbFxuXHRcdCMgYWRkZWQgYXQgZW5kXG5cdFx0cm9vdC5hcHBlbmRDaGlsZChuZXdbaSsrXSkgd2hpbGUgaSA8IG5sXG5cdFx0cmV0dXJuXG5cdFxuXHRlbGlmIGQgPiAwXG5cdFx0bGV0IGkxID0gbmxcblx0XHRpMS0tIHdoaWxlIGkxID4gaSBhbmQgbmV3W2kxIC0gMV0gPT09IG9sZFtpMSAtIDEgLSBkXVxuXG5cdFx0aWYgZCA9PSAoaTEgLSBpKVxuXHRcdFx0IyBjb25zb2xlLmxvZyBcImFkZGVkIGluIGNodW5rXCIsaSxpMVxuXHRcdFx0bGV0IGJlZm9yZSA9IG9sZFtpXS5AZG9tXG5cdFx0XHRyb290Lmluc2VydEJlZm9yZShuZXdbaSsrXSxiZWZvcmUpIHdoaWxlIGkgPCBpMVxuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0ZWxpZiBkIDwgMCBhbmQgaSA9PSBubFxuXHRcdCMgcmVtb3ZlZCBhdCBlbmRcblx0XHRyb290LnJlbW92ZUNoaWxkKG9sZFtpKytdKSB3aGlsZSBpIDwgb2xcblx0XHRyZXR1cm5cblx0ZWxpZiBkIDwgMFxuXHRcdGxldCBpMSA9IG9sXG5cdFx0aTEtLSB3aGlsZSBpMSA+IGkgYW5kIG5ld1tpMSAtIDEgKyBkXSA9PT0gb2xkW2kxIC0gMV1cblxuXHRcdGlmIGQgPT0gKGkgLSBpMSlcblx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQob2xkW2krK10pIHdoaWxlIGkgPCBpMVxuXHRcdFx0cmV0dXJuXG5cblx0ZWxpZiBpID09IG5sXG5cdFx0cmV0dXJuXG5cblx0cmV0dXJuIHJlY29uY2lsZUNvbGxlY3Rpb25DaGFuZ2VzKHJvb3QsbmV3LG9sZCxjYXJldClcblxuIyBleHBlY3RzIGEgZmxhdCBub24tc3BhcnNlIGFycmF5IG9mIG5vZGVzIGluIGJvdGggbmV3IGFuZCBvbGQsIGFsd2F5c1xuZGVmIHJlY29uY2lsZUluZGV4ZWRBcnJheSByb290LCBhcnJheSwgb2xkLCBjYXJldFxuXHR2YXIgbmV3TGVuID0gYXJyYXk6dGFnbGVuXG5cdHZhciBwcmV2TGVuID0gYXJyYXk6ZG9tbGVuIG9yIDBcblx0dmFyIGxhc3QgPSBuZXdMZW4gPyBhcnJheVtuZXdMZW4gLSAxXSA6IG51bGxcblx0IyBjb25zb2xlLmxvZyBcInJlY29uY2lsZSBvcHRpbWl6ZWQgYXJyYXkoISlcIixjYXJldCxuZXdMZW4scHJldkxlbixhcnJheVxuXG5cdGlmIHByZXZMZW4gPiBuZXdMZW5cblx0XHR3aGlsZSBwcmV2TGVuID4gbmV3TGVuXG5cdFx0XHR2YXIgaXRlbSA9IGFycmF5Wy0tcHJldkxlbl1cblx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQoaXRlbS5AZG9tKVxuXG5cdGVsaWYgbmV3TGVuID4gcHJldkxlblxuXHRcdCMgZmluZCB0aGUgaXRlbSB0byBpbnNlcnQgYmVmb3JlXG5cdFx0bGV0IHByZXZMYXN0ID0gcHJldkxlbiA/IGFycmF5W3ByZXZMZW4gLSAxXS5AZG9tIDogY2FyZXRcblx0XHRsZXQgYmVmb3JlID0gcHJldkxhc3QgPyBwcmV2TGFzdDpuZXh0U2libGluZyA6IHJvb3QuQGRvbTpmaXJzdENoaWxkXG5cdFx0XG5cdFx0d2hpbGUgcHJldkxlbiA8IG5ld0xlblxuXHRcdFx0bGV0IG5vZGUgPSBhcnJheVtwcmV2TGVuKytdXG5cdFx0XHRiZWZvcmUgPyByb290Lmluc2VydEJlZm9yZShub2RlLkBkb20sYmVmb3JlKSA6IHJvb3QuYXBwZW5kQ2hpbGQobm9kZS5AZG9tKVxuXHRcdFx0XG5cdGFycmF5OmRvbWxlbiA9IG5ld0xlblxuXHRyZXR1cm4gbGFzdCA/IGxhc3QuQGRvbSA6IGNhcmV0XG5cblxuIyB0aGUgZ2VuZXJhbCByZWNvbmNpbGVyIHRoYXQgcmVzcGVjdHMgY29uZGl0aW9ucyBldGNcbiMgY2FyZXQgaXMgdGhlIGN1cnJlbnQgbm9kZSB3ZSB3YW50IHRvIGluc2VydCB0aGluZ3MgYWZ0ZXJcbmRlZiByZWNvbmNpbGVOZXN0ZWQgcm9vdCwgbmV3LCBvbGQsIGNhcmV0XG5cblx0IyB2YXIgc2tpcG5ldyA9IG5ldyA9PSBudWxsIG9yIG5ldyA9PT0gZmFsc2Ugb3IgbmV3ID09PSB0cnVlXG5cdHZhciBuZXdJc051bGwgPSBuZXcgPT0gbnVsbCBvciBuZXcgPT09IGZhbHNlXG5cdHZhciBvbGRJc051bGwgPSBvbGQgPT0gbnVsbCBvciBvbGQgPT09IGZhbHNlXG5cblxuXHRpZiBuZXcgPT09IG9sZFxuXHRcdCMgcmVtZW1iZXIgdGhhdCB0aGUgY2FyZXQgbXVzdCBiZSBhbiBhY3R1YWwgZG9tIGVsZW1lbnRcblx0XHQjIHdlIHNob3VsZCBpbnN0ZWFkIG1vdmUgdGhlIGFjdHVhbCBjYXJldD8gLSB0cnVzdFxuXHRcdGlmIG5ld0lzTnVsbFxuXHRcdFx0cmV0dXJuIGNhcmV0XG5cdFx0ZWxpZiBuZXcuQGRvbVxuXHRcdFx0cmV0dXJuIG5ldy5AZG9tXG5cdFx0ZWxpZiBuZXcgaXNhIEFycmF5IGFuZCBuZXc6dGFnbGVuICE9IG51bGxcblx0XHRcdHJldHVybiByZWNvbmNpbGVJbmRleGVkQXJyYXkocm9vdCxuZXcsb2xkLGNhcmV0KVxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBjYXJldCA/IGNhcmV0Om5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblxuXHRlbGlmIG5ldyBpc2EgQXJyYXlcblx0XHRpZiBvbGQgaXNhIEFycmF5XG5cdFx0XHQjIGxvb2sgZm9yIHNsb3QgaW5zdGVhZD9cblx0XHRcdGxldCB0eXAgPSBuZXc6c3RhdGljXG5cdFx0XHRpZiB0eXAgb3Igb2xkOnN0YXRpY1xuXHRcdFx0XHQjIGlmIHRoZSBzdGF0aWMgaXMgbm90IG5lc3RlZCAtIHdlIGNvdWxkIGdldCBhIGhpbnQgZnJvbSBjb21waWxlclxuXHRcdFx0XHQjIGFuZCBqdXN0IHNraXAgaXRcblx0XHRcdFx0aWYgdHlwID09IG9sZDpzdGF0aWMgIyBzaG91bGQgYWxzbyBpbmNsdWRlIGEgcmVmZXJlbmNlP1xuXHRcdFx0XHRcdGZvciBpdGVtLGkgaW4gbmV3XG5cdFx0XHRcdFx0XHQjIHRoaXMgaXMgd2hlcmUgd2UgY291bGQgZG8gdGhlIHRyaXBsZSBlcXVhbCBkaXJlY3RseVxuXHRcdFx0XHRcdFx0Y2FyZXQgPSByZWNvbmNpbGVOZXN0ZWQocm9vdCxpdGVtLG9sZFtpXSxjYXJldClcblx0XHRcdFx0XHRyZXR1cm4gY2FyZXRcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHJlbW92ZU5lc3RlZChyb290LG9sZCxjYXJldClcblx0XHRcdFx0XHRcblx0XHRcdFx0IyBpZiB0aGV5IGFyZSBub3QgdGhlIHNhbWUgd2UgY29udGludWUgdGhyb3VnaCB0byB0aGUgZGVmYXVsdFxuXHRcdFx0ZWxzZVxuXHRcdFx0XHQjIENvdWxkIHVzZSBvcHRpbWl6ZWQgbG9vcCBpZiB3ZSBrbm93IHRoYXQgaXQgb25seSBjb25zaXN0cyBvZiBub2Rlc1xuXHRcdFx0XHRyZXR1cm4gcmVjb25jaWxlQ29sbGVjdGlvbihyb290LG5ldyxvbGQsY2FyZXQpXG5cdFx0ZWxpZiAhb2xkSXNOdWxsXG5cdFx0XHRpZiBvbGQuQGRvbVxuXHRcdFx0XHRyb290LnJlbW92ZUNoaWxkKG9sZClcblx0XHRcdGVsc2Vcblx0XHRcdFx0IyBvbGQgd2FzIGEgc3RyaW5nLWxpa2Ugb2JqZWN0P1xuXHRcdFx0XHRyb290LnJlbW92ZUNoaWxkKGNhcmV0ID8gY2FyZXQ6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZClcblxuXHRcdHJldHVybiBpbnNlcnROZXN0ZWRBZnRlcihyb290LG5ldyxjYXJldClcblx0XHQjIHJlbW92ZSBvbGRcblxuXHRlbGlmICFuZXdJc051bGwgYW5kIG5ldy5AZG9tXG5cdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KSB1bmxlc3Mgb2xkSXNOdWxsXG5cdFx0cmV0dXJuIGluc2VydE5lc3RlZEFmdGVyKHJvb3QsbmV3LGNhcmV0KVxuXG5cdGVsaWYgbmV3SXNOdWxsXG5cdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KSB1bmxlc3Mgb2xkSXNOdWxsXG5cdFx0cmV0dXJuIGNhcmV0XG5cdGVsc2Vcblx0XHQjIGlmIG9sZCBkaWQgbm90IGV4aXN0IHdlIG5lZWQgdG8gYWRkIGEgbmV3IGRpcmVjdGx5XG5cdFx0bGV0IG5leHROb2RlXG5cdFx0IyBpZiBvbGQgd2FzIGFycmF5IG9yIGltYmF0YWcgd2UgbmVlZCB0byByZW1vdmUgaXQgYW5kIHRoZW4gYWRkXG5cdFx0aWYgb2xkIGlzYSBBcnJheVxuXHRcdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KVxuXHRcdGVsaWYgb2xkIGFuZCBvbGQuQGRvbVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChvbGQpXG5cdFx0ZWxpZiAhb2xkSXNOdWxsXG5cdFx0XHQjIC4uLlxuXHRcdFx0bmV4dE5vZGUgPSBjYXJldCA/IGNhcmV0Om5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblx0XHRcdGlmIG5leHROb2RlIGlzYSBUZXh0IGFuZCBuZXh0Tm9kZTp0ZXh0Q29udGVudCAhPSBuZXdcblx0XHRcdFx0bmV4dE5vZGU6dGV4dENvbnRlbnQgPSBuZXdcblx0XHRcdFx0cmV0dXJuIG5leHROb2RlXG5cblx0XHQjIG5vdyBhZGQgdGhlIHRleHRub2RlXG5cdFx0cmV0dXJuIGluc2VydE5lc3RlZEFmdGVyKHJvb3QsbmV3LGNhcmV0KVxuXG5cbmV4dGVuZCB0YWcgZWxlbWVudFxuXHRcblx0IyAxIC0gc3RhdGljIHNoYXBlIC0gdW5rbm93biBjb250ZW50XG5cdCMgMiAtIHN0YXRpYyBzaGFwZSBhbmQgc3RhdGljIGNoaWxkcmVuXG5cdCMgMyAtIHNpbmdsZSBpdGVtXG5cdCMgNCAtIG9wdGltaXplZCBhcnJheSAtIG9ubHkgbGVuZ3RoIHdpbGwgY2hhbmdlXG5cdCMgNSAtIG9wdGltaXplZCBjb2xsZWN0aW9uXG5cdCMgNiAtIHRleHQgb25seVxuXG5cdGRlZiBzZXRDaGlsZHJlbiBuZXcsIHR5cFxuXHRcdCMgaWYgdHlwZW9mIG5ldyA9PSAnc3RyaW5nJ1xuXHRcdCMgXHRyZXR1cm4gc2VsZi50ZXh0ID0gbmV3XG5cdFx0dmFyIG9sZCA9IEB0cmVlX1xuXG5cdFx0aWYgbmV3ID09PSBvbGQgYW5kIG5ldyBhbmQgbmV3OnRhZ2xlbiA9PSB1bmRlZmluZWRcblx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRpZiAhb2xkIGFuZCB0eXAgIT0gM1xuXHRcdFx0cmVtb3ZlQWxsQ2hpbGRyZW5cblx0XHRcdGFwcGVuZE5lc3RlZChzZWxmLG5ldylcblxuXHRcdGVsaWYgdHlwID09IDFcblx0XHRcdGxldCBjYXJldCA9IG51bGxcblx0XHRcdGZvciBpdGVtLGkgaW4gbmV3XG5cdFx0XHRcdGNhcmV0ID0gcmVjb25jaWxlTmVzdGVkKHNlbGYsaXRlbSxvbGRbaV0sY2FyZXQpXG5cdFx0XG5cdFx0ZWxpZiB0eXAgPT0gMlxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdGVsaWYgdHlwID09IDNcblx0XHRcdGxldCBudHlwID0gdHlwZW9mIG5ld1xuXG5cdFx0XHRpZiBuZXcgYW5kIG5ldy5AZG9tXG5cdFx0XHRcdHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0XHRcdGFwcGVuZENoaWxkKG5ldylcblxuXHRcdFx0IyBjaGVjayBpZiBvbGQgYW5kIG5ldyBpc2EgYXJyYXlcblx0XHRcdGVsaWYgbmV3IGlzYSBBcnJheVxuXHRcdFx0XHRpZiBuZXcuQHR5cGUgPT0gNSBhbmQgb2xkIGFuZCBvbGQuQHR5cGUgPT0gNVxuXHRcdFx0XHRcdHJlY29uY2lsZUxvb3Aoc2VsZixuZXcsb2xkLG51bGwpXG5cdFx0XHRcdGVsaWYgb2xkIGlzYSBBcnJheVxuXHRcdFx0XHRcdHJlY29uY2lsZU5lc3RlZChzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0XHRcdFx0YXBwZW5kTmVzdGVkKHNlbGYsbmV3KVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHR0ZXh0ID0gbmV3XG5cdFx0XHRcdHJldHVybiBzZWxmXG5cdFx0XHRcdFxuXHRcdGVsaWYgdHlwID09IDRcblx0XHRcdHJlY29uY2lsZUluZGV4ZWRBcnJheShzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRcdFxuXHRcdGVsaWYgdHlwID09IDVcblx0XHRcdHJlY29uY2lsZUxvb3Aoc2VsZixuZXcsb2xkLG51bGwpXG5cblx0XHRlbGlmIG5ldyBpc2EgQXJyYXkgYW5kIG9sZCBpc2EgQXJyYXlcblx0XHRcdHJlY29uY2lsZU5lc3RlZChzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRlbHNlXG5cdFx0XHQjIHdoYXQgaWYgdGV4dD9cblx0XHRcdHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0XHRhcHBlbmROZXN0ZWQoc2VsZixuZXcpXG5cblx0XHRAdHJlZV8gPSBuZXdcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBjb250ZW50XG5cdFx0QGNvbnRlbnQgb3IgY2hpbGRyZW4udG9BcnJheVxuXHRcblx0ZGVmIHNldFRleHQgdGV4dFxuXHRcdGlmIHRleHQgIT0gQHRyZWVfXG5cdFx0XHR2YXIgdmFsID0gdGV4dCA9PT0gbnVsbCBvciB0ZXh0ID09PSBmYWxzZSA/ICcnIDogdGV4dFxuXHRcdFx0KEB0ZXh0XyBvciBAZG9tKTp0ZXh0Q29udGVudCA9IHZhbFxuXHRcdFx0QHRleHRfIHx8PSBAZG9tOmZpcnN0Q2hpbGRcblx0XHRcdEB0cmVlXyA9IHRleHRcblx0XHRzZWxmXG5cbiMgYWxpYXMgc2V0Q29udGVudCB0byBzZXRDaGlsZHJlblxudmFyIHByb3RvID0gSW1iYS5UYWc6cHJvdG90eXBlXG5wcm90bzpzZXRDb250ZW50ID0gcHJvdG86c2V0Q2hpbGRyZW5cblxuIyBvcHRpbWl6YXRpb24gZm9yIHNldFRleHRcbnZhciBhcHBsZSA9IHR5cGVvZiBuYXZpZ2F0b3IgIT0gJ3VuZGVmaW5lZCcgYW5kIChuYXZpZ2F0b3I6dmVuZG9yIG9yICcnKS5pbmRleE9mKCdBcHBsZScpID09IDBcbmlmIGFwcGxlXG5cdGRlZiBwcm90by5zZXRUZXh0IHRleHRcblx0XHRpZiB0ZXh0ICE9IEB0cmVlX1xuXHRcdFx0QGRvbTp0ZXh0Q29udGVudCA9ICh0ZXh0ID09PSBudWxsIG9yIHRleHQgPT09IGZhbHNlID8gJycgOiB0ZXh0KVxuXHRcdFx0QHRyZWVfID0gdGV4dFxuXHRcdHJldHVybiBzZWxmXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vcmVjb25jaWxlci5pbWJhIiwiaW1wb3J0IFJvdXRlciBmcm9tICcuL3V0aWwvcm91dGVyJ1xuXG5leHBvcnQgY2xhc3MgRG9jXG5cblx0cHJvcCBwYXRoXG5cdHByb3Agc3JjXG5cdHByb3AgZGF0YVxuXG5cdGRlZiByZWFkeVxuXHRcdEByZWFkeVxuXG5cdGRlZiBpbml0aWFsaXplIHNyYywgYXBwXG5cdFx0QHNyYyA9IHNyY1xuXHRcdEBwYXRoID0gc3JjLnJlcGxhY2UoL1xcLm1kJC8sJycpXG5cdFx0QGFwcCA9IGFwcFxuXHRcdEByZWFkeSA9IG5vXG5cdFx0ZmV0Y2hcblx0XHRzZWxmXG5cblx0ZGVmIGZldGNoXG5cdFx0QHByb21pc2UgfHw9IEBhcHAuZmV0Y2goc3JjKS50aGVuIGRvIHxyZXN8XG5cdFx0XHRsb2FkKHJlcylcblxuXHRkZWYgbG9hZCBkb2Ncblx0XHRAZGF0YSA9IGRvY1xuXHRcdEBtZXRhID0gZG9jOm1ldGEgb3Ige31cblx0XHRAcmVhZHkgPSB5ZXNcblx0XHRJbWJhLmNvbW1pdFxuXHRcdHNlbGZcblxuXHRkZWYgdGl0bGVcblx0XHRAZGF0YTp0aXRsZSBvciAncGF0aCdcblxuXHRkZWYgdG9jXG5cdFx0QGRhdGEgYW5kIEBkYXRhOnRvY1swXVxuXG5cdGRlZiBib2R5XG5cdFx0QGRhdGEgYW5kIEBkYXRhOmJvZHlcblxuXG5leHBvcnQgdmFyIENhY2hlID0ge31cbnZhciByZXF1ZXN0cyA9IHt9XG5cbmV4cG9ydCBjbGFzcyBBcHBcblx0cHJvcCByZXFcblx0cHJvcCBjYWNoZVxuXHRwcm9wIGlzc3Vlc1xuXHRcblx0ZGVmIHNlbGYuZGVzZXJpYWxpemUgZGF0YSA9ICd7fSdcblx0XHRzZWxmLm5ldyBKU09OLnBhcnNlKGRhdGEucmVwbGFjZSgvwqfCp1NDUklQVMKnwqcvZyxcInNjcmlwdFwiKSlcblxuXHRkZWYgaW5pdGlhbGl6ZSBjYWNoZSA9IHt9XG5cdFx0QGNhY2hlID0gY2FjaGVcblx0XHRAZG9jcyA9IHt9XG5cdFx0aWYgJHdlYiRcblx0XHRcdEBsb2MgPSBkb2N1bWVudDpsb2NhdGlvblxuXHRcdFx0XG5cdFx0aWYgQGNhY2hlOmd1aWRlXG5cdFx0XHRAZ3VpZGUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KEBjYWNoZTpndWlkZSkpXG5cdFx0XHQjIGZvciBpdGVtLGkgaW4gQGd1aWRlXG5cdFx0XHQjIFx0QGd1aWRlW2l0ZW06aWRdID0gaXRlbVxuXHRcdFx0IyBcdGl0ZW06bmV4dCA9IEBndWlkZVtpICsgMV1cblx0XHRcdCMgXHRpdGVtOnByZXYgPSBAZ3VpZGVbaSAtIDFdXG5cdFx0c2VsZlxuXG5cdGRlZiByZXNldFxuXHRcdGNhY2hlID0ge31cblx0XHRzZWxmXG5cblx0ZGVmIHJvdXRlclxuXHRcdEByb3V0ZXIgfHw9IFJvdXRlci5uZXcoc2VsZilcblxuXHRkZWYgcGF0aFxuXHRcdCR3ZWIkID8gQGxvYzpwYXRobmFtZSA6IHJlcTpwYXRoXG5cblx0ZGVmIGhhc2hcblx0XHQkd2ViJCA/IEBsb2M6aGFzaC5zdWJzdHIoMSkgOiAnJ1xuXG5cdGRlZiBkb2Mgc3JjXG5cdFx0QGRvY3Nbc3JjXSB8fD0gRG9jLm5ldyhzcmMsc2VsZilcblx0XHRcblx0ZGVmIGd1aWRlXG5cdFx0QGd1aWRlIHx8PSBAY2FjaGU6Z3VpZGUgIyAubWFwIGRvIHx8XG5cdFx0XG5cdGRlZiBzZXJpYWxpemVcblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoY2FjaGUpLnJlcGxhY2UoL1xcYnNjcmlwdC9nLFwiwqfCp1NDUklQVMKnwqdcIilcblxuXHRpZiAkbm9kZSRcblx0XHRkZWYgZmV0Y2ggc3JjXG5cdFx0XHRsZXQgcmVzID0gY2FjaGVbc3JjXSA9IENhY2hlW3NyY11cblx0XHRcdGxldCBwcm9taXNlID0ge3RoZW46ICh8Y2J8IGNiKENhY2hlW3NyY10pKSB9XG5cdFx0XHRcblx0XHRcdHJldHVybiBwcm9taXNlIGlmIHJlc1xuXHRcdFx0XG5cdFx0XHRjb25zb2xlLmxvZyBcInRyeSB0byBmZXRjaCB7c3JjfVwiXG5cdFx0XHRcblx0XHRcdHZhciBmcyA9IHJlcXVpcmUgJ2ZzJ1xuXHRcdFx0dmFyIHBhdGggPSByZXF1aXJlICdwYXRoJ1xuXHRcdFx0dmFyIG1kID0gcmVxdWlyZSAnLi91dGlsL21hcmtkb3duJ1xuXHRcdFx0dmFyIGhsID0gcmVxdWlyZSAnLi9zY3JpbWJsYS9jb3JlL2hpZ2hsaWdodGVyJ1xuXHRcdFx0dmFyIGZpbGVwYXRoID0gXCJ7X19kaXJuYW1lfS8uLi9kb2NzL3tzcmN9XCIucmVwbGFjZSgvXFwvXFwvL2csJy8nKVxuXG5cdFx0XHRsZXQgYm9keSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlcGF0aCwndXRmLTgnKVxuXG5cdFx0XHRpZiBzcmMubWF0Y2goL1xcLm1kJC8pXG5cdFx0XHRcdHJlcyA9IG1kLnJlbmRlcihib2R5KVxuXG5cdFx0XHRlbGlmIHNyYy5tYXRjaCgvXFwuanNvbiQvKVxuXHRcdFx0XHQjIHNob3VsZCBhbHNvIGluY2x1ZGUgbWQ/XG5cdFx0XHRcdHJlcyA9IEpTT04ucGFyc2UoYm9keSlcblxuXHRcdFx0ZWxpZiBzcmMubWF0Y2goL1xcLmltYmEkLylcblx0XHRcdFx0bGV0IGh0bWwgPSBobC5IaWdobGlnaHRlci5oaWdobGlnaHQoYm9keSx7bW9kZTogJ2Z1bGwnfSlcblx0XHRcdFx0cmVzID0ge2JvZHk6IGJvZHksIGh0bWw6IGh0bWx9XG5cblx0XHRcdGNhY2hlW3NyY10gPSBDYWNoZVtzcmNdID0gcmVzXG5cdFx0XHRyZXR1cm4gcHJvbWlzZVxuXHRcblx0aWYgJHdlYiRcblx0XHRkZWYgZmV0Y2ggc3JjXG5cdFx0XHRpZiBjYWNoZVtzcmNdXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoY2FjaGVbc3JjXSlcblx0XHRcdFxuXHRcdFx0cmVxdWVzdHNbc3JjXSB8fD0gUHJvbWlzZS5uZXcgZG8gfHJlc29sdmV8XG5cdFx0XHRcdHZhciByZXEgPSBhd2FpdCB3aW5kb3cuZmV0Y2goc3JjKVxuXHRcdFx0XHR2YXIgcmVzcCA9IGF3YWl0IHJlcS5qc29uXG5cdFx0XHRcdHJlc29sdmUoY2FjaGVbc3JjXSA9IHJlc3ApXG5cdFx0XHRcblx0ZGVmIGZldGNoRG9jdW1lbnQgc3JjLCAmY2Jcblx0XHR2YXIgcmVzID0gZGVwc1tzcmNdXG5cdFx0Y29uc29sZS5sb2cgXCJubyBsb25nZXI/XCJcblxuXHRcdGlmICRub2RlJFxuXHRcdFx0dmFyIGZzID0gcmVxdWlyZSAnZnMnXG5cdFx0XHR2YXIgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cdFx0XHR2YXIgbWQgPSByZXF1aXJlICcuL3V0aWwvbWFya2Rvd24nXG5cdFx0XHR2YXIgaGwgPSByZXF1aXJlICcuL3NjcmltYmxhL2NvcmUvaGlnaGxpZ2h0ZXInXG5cdFx0XHR2YXIgZmlsZXBhdGggPSBcIntfX2Rpcm5hbWV9Ly4uL2RvY3Mve3NyY31cIi5yZXBsYWNlKC9cXC9cXC8vZywnLycpXG5cblx0XHRcdGlmICFyZXNcblx0XHRcdFx0bGV0IGJvZHkgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZXBhdGgsJ3V0Zi04JylcblxuXHRcdFx0XHRpZiBzcmMubWF0Y2goL1xcLm1kJC8pXG5cdFx0XHRcdFx0cmVzID0gbWQucmVuZGVyKGJvZHkpXG5cblx0XHRcdFx0ZWxpZiBzcmMubWF0Y2goL1xcLmpzb24kLylcblx0XHRcdFx0XHQjIHNob3VsZCBhbHNvIGluY2x1ZGUgbWQ/XG5cdFx0XHRcdFx0cmVzID0gSlNPTi5wYXJzZShib2R5KVxuXG5cdFx0XHRcdGVsaWYgc3JjLm1hdGNoKC9cXC5pbWJhJC8pXG5cdFx0XHRcdFx0bGV0IGh0bWwgPSBobC5IaWdobGlnaHRlci5oaWdobGlnaHQoYm9keSx7bW9kZTogJ2Z1bGwnfSlcblx0XHRcdFx0XHRyZXMgPSB7Ym9keTogYm9keSwgaHRtbDogaHRtbH1cblx0XHRcdFxuXHRcdFx0ZGVwc1tzcmNdIHx8PSByZXNcblx0XHRcdGNiIGFuZCBjYihyZXMpXG5cdFx0ZWxzZVxuXHRcdFx0IyBzaG91bGQgZ3VhcmQgYWdhaW5zdCBtdWx0aXBsZSBsb2Fkc1xuXHRcdFx0aWYgcmVzXG5cdFx0XHRcdGNiIGFuZCBjYihyZXMpXG5cdFx0XHRcdHJldHVybiB7dGhlbjogKGRvIHx2fCB2KHJlcykpfSAjIGZha2UgcHJvbWlzZSBoYWNrXG5cblx0XHRcdHZhciB4aHIgPSBYTUxIdHRwUmVxdWVzdC5uZXdcblx0XHRcdHhoci5hZGRFdmVudExpc3RlbmVyICdsb2FkJyBkbyB8cmVzfFxuXHRcdFx0XHRyZXMgPSBkZXBzW3NyY10gPSBKU09OLnBhcnNlKHhocjpyZXNwb25zZVRleHQpXG5cdFx0XHRcdGNiIGFuZCBjYihyZXMpXG5cdFx0XHR4aHIub3BlbihcIkdFVFwiLCBzcmMpXG5cdFx0XHR4aHIuc2VuZFxuXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgaXNzdWVzXG5cdFx0QGlzc3VlcyB8fD0gRG9jLmdldCgnL2lzc3Vlcy9hbGwnLCdqc29uJylcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2FwcC5pbWJhIiwiZXh0ZXJuIGhpc3RvcnksIGdhXG5cbmV4cG9ydCBjbGFzcyBSb3V0ZXJcblxuXHRwcm9wIHBhdGhcblxuXHRkZWYgc2VsZi5zbHVnIHN0clxuXHRcdHN0ciA9IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJykudG9Mb3dlckNhc2UgIyB0cmltXG5cblx0XHR2YXIgZnJvbSA9IFwiw6DDocOkw6LDpcOow6nDq8Oqw6zDrcOvw67DssOzw7bDtMO5w7rDvMO7w7HDp8K3L18sOjtcIlxuXHRcdHZhciB0byAgID0gXCJhYWFhYWVlZWVpaWlpb29vb3V1dXVuYy0tLS0tLVwiXG5cdFx0c3RyID0gc3RyLnJlcGxhY2UoL1teYS16MC05IC1dL2csICcnKSAjIHJlbW92ZSBpbnZhbGlkIGNoYXJzXG5cdFx0c3RyID0gc3RyLnJlcGxhY2UoL1xccysvZywgJy0nKSAjIGNvbGxhcHNlIHdoaXRlc3BhY2UgYW5kIHJlcGxhY2UgYnkgLVxuXHRcdHN0ciA9IHN0ci5yZXBsYWNlKC8tKy9nLCAnLScpICMgY29sbGFwc2UgZGFzaGVzXG5cblx0XHRyZXR1cm4gc3RyXG5cblx0ZGVmIGluaXRpYWxpemUgYXBwXG5cdFx0QGFwcCA9IGFwcFxuXG5cdFx0aWYgJHdlYiRcblx0XHRcdHdpbmRvdzpvbnBvcHN0YXRlID0gZG8gfGV8XG5cdFx0XHRcdHJlZnJlc2hcblxuXHRcdHNlbGZcblxuXHRkZWYgcmVmcmVzaFxuXHRcdGlmICR3ZWIkXG5cdFx0XHRkb2N1bWVudDpib2R5LnNldEF0dHJpYnV0ZSgnZGF0YS1yb3V0ZScsc2VnbWVudCgwKSlcblx0XHRcdEltYmEuY29tbWl0XG5cdFx0c2VsZlxuXG5cdGRlZiBwYXRoXG5cdFx0QGFwcC5wYXRoXG5cblx0ZGVmIGhhc2hcblx0XHRAYXBwLmhhc2hcblxuXHRkZWYgZXh0XG5cdFx0dmFyIHBhdGggPSBwYXRoXG5cdFx0dmFyIG0gPSBwYXRoLm1hdGNoKC9cXC4oW15cXC9dKykkLylcblx0XHRtIGFuZCBtWzFdIG9yICcnXG5cblx0ZGVmIHNlZ21lbnQgbnIgPSAwXG5cdFx0cGF0aC5zcGxpdCgnLycpW25yICsgMV0gb3IgJydcblxuXHRkZWYgZ28gaHJlZiwgc3RhdGUgPSB7fSwgcmVwbGFjZSA9IG5vXG5cdFx0aWYgaHJlZiA9PSAnL2luc3RhbGwnXG5cdFx0XHQjIHJlZGlyZWN0cyBoZXJlXG5cdFx0XHRocmVmID0gJy9ndWlkZXMjdG9jLWluc3RhbGxhdGlvbidcblx0XHRcdFxuXHRcdGlmIHJlcGxhY2Vcblx0XHRcdGhpc3RvcnkucmVwbGFjZVN0YXRlKHN0YXRlLG51bGwsaHJlZilcblx0XHRcdHJlZnJlc2hcblx0XHRlbHNlXG5cdFx0XHRoaXN0b3J5LnB1c2hTdGF0ZShzdGF0ZSxudWxsLGhyZWYpXG5cdFx0XHRyZWZyZXNoXG5cdFx0XHQjIGdhKCdzZW5kJywgJ3BhZ2V2aWV3JywgaHJlZilcblxuXHRcdGlmICFocmVmLm1hdGNoKC9cXCMvKVxuXHRcdFx0d2luZG93LnNjcm9sbFRvKDAsMClcblx0XG5cdFx0c2VsZlxuXG5cdGRlZiBzY29wZWQgcmVnLCBwYXJ0XG5cdFx0dmFyIHBhdGggPSBwYXRoICsgJyMnICsgaGFzaFxuXHRcdGlmIHJlZyBpc2EgU3RyaW5nXG5cdFx0XHR2YXIgbnh0ID0gcGF0aFtyZWc6bGVuZ3RoXVxuXHRcdFx0cGF0aC5zdWJzdHIoMCxyZWc6bGVuZ3RoKSA9PSByZWcgYW5kICghbnh0IG9yIG54dCA9PSAnLScgb3Igbnh0ID09ICcvJyBvciBueHQgPT0gJyMnIG9yIG54dCA9PSAnPycgb3Igbnh0ID09ICdfJylcblx0XHRlbGlmIHJlZyBpc2EgUmVnRXhwXG5cdFx0XHR2YXIgbSA9IHBhdGgubWF0Y2gocmVnKVxuXHRcdFx0cGFydCAmJiBtID8gbVtwYXJ0XSA6IG1cblx0XHRlbHNlXG5cdFx0XHRub1xuXG5cdGRlZiBtYXRjaCByZWcsIHBhcnRcblx0XHR2YXIgcGF0aCA9IHBhdGggKyAnIycgKyBoYXNoXG5cblx0XHRpZiByZWcgaXNhIFN0cmluZ1xuXHRcdFx0cGF0aCA9PSByZWdcblx0XHRlbGlmIHJlZyBpc2EgUmVnRXhwXG5cdFx0XHR2YXIgbSA9IHBhdGgubWF0Y2gocmVnKVxuXHRcdFx0cGFydCAmJiBtID8gbVtwYXJ0XSA6IG1cblx0XHRlbHNlXG5cdFx0XHRub1xuXG5leHRlbmQgdGFnIGVsZW1lbnRcblx0YXR0ciByb3V0ZVxuXG5cdGRlZiByb3V0ZXJcblx0XHRhcHAucm91dGVyXG5cblx0ZGVmIHJlcm91dGVcblx0XHR2YXIgc2NvcGVkID0gcm91dGVyLnNjb3BlZChyb3V0ZSxzZWxmKVxuXHRcdGZsYWcoJ3Njb3BlZCcsc2NvcGVkKVxuXHRcdGZsYWcoJ3NlbGVjdGVkJyxyb3V0ZXIubWF0Y2gocm91dGUsc2VsZikpXG5cdFx0aWYgc2NvcGVkICE9IEBzY29wZWRcblx0XHRcdEBzY29wZWQgPSBzY29wZWRcblx0XHRcdHNjb3BlZCA/IGRpZHNjb3BlIDogZGlkdW5zY29wZVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIGRpZHNjb3BlXG5cdFx0c2VsZlxuXG5cdGRlZiBkaWR1bnNjb3BlXG5cdFx0c2VsZlxuXG4jIGV4dGVuZCBsaW5rc1xuZXh0ZW5kIHRhZyBhXG5cdFxuXHRkZWYgcm91dGVcblx0XHRAcm91dGUgb3IgaHJlZlxuXG5cdGRlZiBvbnRhcCBlXG5cdFx0dmFyIGhyZWYgPSBocmVmLnJlcGxhY2UoL15odHRwXFw6XFwvXFwvaW1iYVxcLmlvLywnJylcblxuXHRcdGlmIGUuZXZlbnQ6bWV0YUtleSBvciBlLmV2ZW50OmFsdEtleVxuXHRcdFx0ZS5AcmVzcG9uZGVyID0gbnVsbFxuXHRcdFx0cmV0dXJuIGUuc3RvcFxuXG5cdFx0aWYgbGV0IG0gPSBocmVmLm1hdGNoKC9naXN0XFwuZ2l0aHViXFwuY29tXFwvKFteXFwvXSspXFwvKFtBLVphLXpcXGRdKykvKVxuXHRcdFx0Y29uc29sZS5sb2cgJ2dpc3QhIScsbVsxXSxtWzJdXG5cdFx0XHQjZ2lzdC5vcGVuKG1bMl0pXG5cdFx0XHRyZXR1cm4gZS5wcmV2ZW50LnN0b3BcblxuXHRcdGlmIGhyZWZbMF0gPT0gJyMnIG9yIGhyZWZbMF0gPT0gJy8nXG5cdFx0XHRlLnByZXZlbnQuc3RvcFxuXHRcdFx0cm91dGVyLmdvKGhyZWYse30pXG5cdFx0XHRJbWJhLkV2ZW50cy50cmlnZ2VyKCdyb3V0ZScsc2VsZilcblx0XHRlbHNlXG5cdFx0XHRlLkByZXNwb25kZXIgPSBudWxsXG5cdFx0XHRyZXR1cm4gZS5zdG9wXHRcdFxuXHRcdHNlbGZcblxuXHRkZWYgcmVuZGVyXG5cdFx0cmVyb3V0ZSBpZiAkd2ViJFxuXHRcdHNlbGZcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy91dGlsL3JvdXRlci5pbWJhIiwiaW1wb3J0IEhvbWVQYWdlIGZyb20gJy4vSG9tZVBhZ2UnXG5pbXBvcnQgR3VpZGVzUGFnZSBmcm9tICcuL0d1aWRlc1BhZ2UnXG5pbXBvcnQgRG9jc1BhZ2UgZnJvbSAnLi9Eb2NzUGFnZSdcblxuZXh0ZW5kIHRhZyBlbGVtZW50XG5cblx0ZGVmIHJvb3Rcblx0XHRAb3duZXJfID8gQG93bmVyXy5yb290IDogc2VsZlxuXG5cdGRlZiBhcHBcblx0XHRyb290LmFwcFxuXG5cbmV4cG9ydCB0YWcgU2l0ZVxuXHRcblx0ZGVmIGFwcFxuXHRcdGRhdGFcblx0XHRcblx0ZGVmIHJvb3Rcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiByb3V0ZXJcblx0XHRhcHAucm91dGVyXG5cdFx0XG5cdGRlZiBsb2FkXG5cdFx0Y29uc29sZS5sb2cgXCJsb2FkaW5nIGFwcC5yb3V0ZXJcIlxuXHRcdFByb21pc2UubmV3IGRvIHxyZXNvbHZlfFxuXHRcdFx0Y29uc29sZS5sb2cgXCJTaXRlI2xvYWRcIlxuXHRcdFx0c2V0VGltZW91dChyZXNvbHZlLDIwMClcblx0XHRcblx0ZGVmIHJlbmRlclxuXHRcdGNvbnNvbGUubG9nIFwicmVuZGVyIHNpdGVcIixhcHAucGF0aFxuXHRcdDxzZWxmPlxuXHRcdFx0PGhlYWRlciNoZWFkZXI+XG5cdFx0XHRcdDxuYXYuY29udGVudD5cblx0XHRcdFx0XHQ8YS50YWIubG9nbyBocmVmPScvaG9tZSc+IDxpPiAnaW1iYSdcblx0XHRcdFx0XHQ8c3Bhbi5ncmVlZHk+XG5cdFx0XHRcdFx0PGEudGFiLmhvbWUgaHJlZj0nL2hvbWUnPiA8aT4gJ2hvbWUnXG5cdFx0XHRcdFx0PGEudGFiLmd1aWRlcyBocmVmPScvZ3VpZGUnPiA8aT4gJ2xlYXJuJ1xuXHRcdFx0XHRcdDxhLnRhYi5kb2NzIGhyZWY9Jy9kb2NzJz4gPGk+ICdhcGknXG5cdFx0XHRcdFx0PGEudHdpdHRlciBocmVmPSdodHRwOi8vdHdpdHRlci5jb20vaW1iYWpzJz4gPGk+ICd0d2l0dGVyJ1xuXHRcdFx0XHRcdDxhLmdpdGh1YiBocmVmPSdodHRwczovL2dpdGh1Yi5jb20vc29tZWJlZS9pbWJhJz4gPGk+ICdnaXRodWInXG5cdFx0XHRcdFx0PGEuaXNzdWVzIGhyZWY9J2h0dHBzOi8vZ2l0aHViLmNvbS9zb21lYmVlL2ltYmEvaXNzdWVzJz4gPGk+ICdpc3N1ZXMnXG5cdFx0XHRcdFx0PGEubWVudSA6dGFwPSd0b2dnbGVNZW51Jz4gPGI+XG5cdFx0XHRcblx0XHRcdDxtYWluPlxuXHRcdFx0XHRpZiByb3V0ZXIuc2NvcGVkKCcvaG9tZScpXG5cdFx0XHRcdFx0PEhvbWVQYWdlPlxuXHRcdFx0XHRlbGlmIHJvdXRlci5zY29wZWQoJy9ndWlkZScpXG5cdFx0XHRcdFx0PEd1aWRlc1BhZ2VbYXBwLmd1aWRlXT5cblx0XHRcdFx0ZWxpZiByb3V0ZXIuc2NvcGVkKCcvZG9jcycpXG5cdFx0XHRcdFx0PERvY3NQYWdlPlxuXG5cdFx0XHQ8Zm9vdGVyI2Zvb3Rlcj4gXG5cdFx0XHRcdDxocj5cblx0XHRcdFx0PC5sZnQ+IFwiSW1iYSDCqSAyMDE1LTIwMThcIlxuXHRcdFx0XHQ8LnJndD5cblx0XHRcdFx0XHQ8YSBocmVmPSdodHRwOi8vdHdpdHRlci5jb20vaW1iYWpzJz4gJ1R3aXR0ZXInXG5cdFx0XHRcdFx0PGEgaHJlZj0naHR0cDovL2dpdGh1Yi5jb20vc29tZWJlZS9pbWJhJz4gJ0dpdEh1Yidcblx0XHRcdFx0XHQ8YSBocmVmPSdodHRwOi8vZ2l0aHViLmNvbS9zb21lYmVlL2ltYmEvaXNzdWVzJz4gJ0lzc3Vlcydcblx0XHRcdFx0XHQ8YSBocmVmPSdodHRwOi8vZ2l0dGVyLmltL3NvbWViZWUvaW1iYSc+ICdDaGF0J1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL1NpdGUuaW1iYSIsImltcG9ydCBQYWdlIGZyb20gJy4vUGFnZSdcblxuaW1wb3J0IEV4YW1wbGUgZnJvbSAnLi9TbmlwcGV0J1xuaW1wb3J0IE1hcmtlZCBmcm9tICcuL01hcmtlZCdcbmltcG9ydCBQYXR0ZXJuIGZyb20gJy4vUGF0dGVybidcblxuXG5leHBvcnQgdGFnIEhvbWVQYWdlIDwgUGFnZVxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj4gPC5ib2R5PlxuXHRcdFx0PGRpdiNoZXJvLmRhcms+XG5cdFx0XHRcdDxQYXR0ZXJuQHBhdHRlcm4+XG5cdFx0XHRcdCMgPGhlcm9zbmlwcGV0Lmhlcm8uZGFyayBzcmM9Jy9ob21lL2V4YW1wbGVzL2hlcm8uaW1iYSc+XG5cdFx0XHQ8LmNvbnRlbnQ+XG5cdFx0XHRcdDxNYXJrZWQuc2VjdGlvbi5tZC53ZWxjb21lLmh1Z2UubGlnaHQ+IFwiXCJcIlxuXHRcdFx0XHRcdCMgQ3JlYXRlIGNvbXBsZXggd2ViIGFwcHMgd2l0aCBlYXNlIVxuXG5cdFx0XHRcdFx0SW1iYSBpcyBhIG5ldyBwcm9ncmFtbWluZyBsYW5ndWFnZSBmb3IgdGhlIHdlYiB0aGF0IGNvbXBpbGVzIHRvIGhpZ2hseSBcblx0XHRcdFx0XHRwZXJmb3JtYW50IGFuZCByZWFkYWJsZSBKYXZhU2NyaXB0LiBJdCBoYXMgbGFuZ3VhZ2UgbGV2ZWwgc3VwcG9ydCBmb3IgZGVmaW5pbmcsIFxuXHRcdFx0XHRcdGV4dGVuZGluZywgc3ViY2xhc3NpbmcsIGluc3RhbnRpYXRpbmcgYW5kIHJlbmRlcmluZyBkb20gbm9kZXMuIEZvciBhIHNpbXBsZSBcblx0XHRcdFx0XHRhcHBsaWNhdGlvbiBsaWtlIFRvZG9NVkMsIGl0IGlzIG1vcmUgdGhhbiBcblx0XHRcdFx0XHRbMTAgdGltZXMgZmFzdGVyIHRoYW4gUmVhY3RdKGh0dHA6Ly9zb21lYmVlLmdpdGh1Yi5pby90b2RvbXZjLXJlbmRlci1iZW5jaG1hcmsvaW5kZXguaHRtbCkgXG5cdFx0XHRcdFx0d2l0aCBsZXNzIGNvZGUsIGFuZCBhIG11Y2ggc21hbGxlciBsaWJyYXJ5LlxuXG5cdFx0XHRcdFx0LS0tXG5cblx0XHRcdFx0XHQtICMjIEltYmEuaW5zcGlyYXRpb25cblx0XHRcdFx0XHQgIEltYmEgYnJpbmdzIHRoZSBiZXN0IGZyb20gUnVieSwgUHl0aG9uLCBhbmQgUmVhY3QgKCsgSlNYKSB0b2dldGhlciBpbiBhIGNsZWFuIGxhbmd1YWdlIGFuZCBydW50aW1lLlxuXG5cdFx0XHRcdFx0LSAjIyBJbWJhLmludGVyb3BlcmFiaWxpdHlcblx0XHRcdFx0XHQgIEltYmEgY29tcGlsZXMgZG93biB0byBjbGVhbiBhbmQgcmVhZGFibGUgSmF2YVNjcmlwdC4gVXNlIGFueSBKUyBsaWJyYXJ5IGluIEltYmEgYW5kIHZpY2EtdmVyc2EuXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0LSAjIyBJbWJhLnBlcmZvcm1hbmNlXG5cdFx0XHRcdFx0ICBCdWlsZCB5b3VyIGFwcGxpY2F0aW9uIHZpZXdzIHVzaW5nIEltYmEncyBuYXRpdmUgdGFncyBmb3IgdW5wcmVjZWRlbnRlZCBwZXJmb3JtYW5jZS5cblxuXHRcdFx0XHRcdFwiXCJcIlxuXG5cdFx0XHRcdCMgPEV4YW1wbGUuZGFyayBoZWFkaW5nPVwiU2ltcGxlIHJlbWluZGVyc1wiIHNyYz0nL2hvbWUvZXhhbXBsZXMvcmVtaW5kZXJzLmltYmEnPlxuXG5cdFx0XHRcdDxNYXJrZWQuc2VjdGlvbi5tZD4gXCJcIlwiXG5cdFx0XHRcdFx0IyMgUmV1c2FibGUgY29tcG9uZW50c1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdEEgY3VzdG9tIHRhZyAvIGNvbXBvbmVudCBjYW4gbWFpbnRhaW4gaW50ZXJuYWwgc3RhdGUgYW5kIGNvbnRyb2wgaG93IHRvIHJlbmRlciBpdHNlbGYuXG5cdFx0XHRcdFx0V2l0aCB0aGUgcGVyZm9ybWFuY2Ugb2YgRE9NIHJlY29uY2lsaWF0aW9uIGluIEltYmEsIHlvdSBjYW4gdXNlIG9uZS13YXkgZGVjbGFyYXRpdmUgYmluZGluZ3MsXG5cdFx0XHRcdFx0ZXZlbiBmb3IgYW5pbWF0aW9ucy4gV3JpdGUgYWxsIHlvdXIgdmlld3MgaW4gYSBzdHJhaWdodC1mb3J3YXJkIGxpbmVhciBmYXNoaW9uIGFzIGlmIHlvdSBjb3VsZFxuXHRcdFx0XHRcdHJlcmVuZGVyIHlvdXIgd2hvbGUgYXBwbGljYXRpb24gb24gKipldmVyeSBzaW5nbGUqKiBkYXRhL3N0YXRlIGNoYW5nZS5cblx0XHRcdFx0XHRcIlwiXCJcblxuXHRcdFx0XHQjIDxFeGFtcGxlLmRhcmsgaGVhZGluZz1cIldvcmxkIGNsb2NrXCIgc3JjPScvaG9tZS9leGFtcGxlcy9jbG9jay5pbWJhJz5cblxuXHRcdFx0XHQ8TWFya2VkLnNlY3Rpb24ubWQ+IFwiXCJcIlxuXHRcdFx0XHRcdCMjIEV4dGVuZCBuYXRpdmUgdGFnc1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdEluIGFkZGl0aW9uIHRvIGRlZmluaW5nIGN1c3RvbSB0YWdzLCB5b3UgY2FuIGFsc28gZXh0ZW5kIG5hdGl2ZSB0YWdzLCBvciBpbmhlcml0IGZyb20gdGhlbS5cblx0XHRcdFx0XHRCaW5kaW5nIHRvIGRvbSBldmVudHMgaXMgYXMgc2ltcGxlIGFzIGRlZmluaW5nIG1ldGhvZHMgb24geW91ciB0YWdzOyBhbGwgZXZlbnRzIHdpbGwgYmVcblx0XHRcdFx0XHRlZmZpY2llbnRseSBkZWxlZ2F0ZWQgYW5kIGhhbmRsZWQgYnkgSW1iYS4gTGV0J3MgZGVmaW5lIGEgc2ltcGxlIHNrZXRjaHBhZC4uLlxuXHRcdFx0XHRcdFwiXCJcIlxuXG5cdFx0XHRcdCMgPEV4YW1wbGUuZGFyayBoZWFkaW5nPVwiQ3VzdG9tIGNhbnZhc1wiIHNyYz0nL2hvbWUvZXhhbXBsZXMvY2FudmFzLmltYmEnPlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9Ib21lUGFnZS5pbWJhIiwiIyBkZWZpbmUgcmVuZGVyZXJcbnZhciBtYXJrZWQgPSByZXF1aXJlICdtYXJrZWQnXG52YXIgbWRyID0gbWFya2VkLlJlbmRlcmVyLm5ld1xuXG5kZWYgbWRyLmhlYWRpbmcgdGV4dCwgbHZsXG5cdFwiPGh7bHZsfT57dGV4dH08L2h7bHZsfT5cIlxuXHRcdFxuZXhwb3J0IHRhZyBNYXJrZWRcblx0ZGVmIHJlbmRlcmVyXG5cdFx0c2VsZlxuXG5cdGRlZiBzZXRUZXh0IHRleHRcblx0XHRpZiB0ZXh0ICE9IEB0ZXh0XG5cdFx0XHRAdGV4dCA9IHRleHRcblx0XHRcdGRvbTppbm5lckhUTUwgPSBtYXJrZWQodGV4dCwgcmVuZGVyZXI6IG1kcilcblx0XHRzZWxmXG5cblx0ZGVmIHNldENvbnRlbnQgdmFsLHR5cFxuXHRcdHNldFRleHQodmFsLDApXG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL01hcmtlZC5pbWJhIiwiLyoqXG4gKiBtYXJrZWQgLSBhIG1hcmtkb3duIHBhcnNlclxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTQsIENocmlzdG9waGVyIEplZmZyZXkuIChNSVQgTGljZW5zZWQpXG4gKiBodHRwczovL2dpdGh1Yi5jb20vY2hqai9tYXJrZWRcbiAqL1xuXG47KGZ1bmN0aW9uKCkge1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEJsb2NrLUxldmVsIEdyYW1tYXJcbiAqL1xuXG52YXIgYmxvY2sgPSB7XG4gIG5ld2xpbmU6IC9eXFxuKy8sXG4gIGNvZGU6IC9eKCB7NH1bXlxcbl0rXFxuKikrLyxcbiAgZmVuY2VzOiBub29wLFxuICBocjogL14oICpbLSpfXSl7Myx9ICooPzpcXG4rfCQpLyxcbiAgaGVhZGluZzogL14gKigjezEsNn0pICooW15cXG5dKz8pICojKiAqKD86XFxuK3wkKS8sXG4gIG5wdGFibGU6IG5vb3AsXG4gIGxoZWFkaW5nOiAvXihbXlxcbl0rKVxcbiAqKD18LSl7Mix9ICooPzpcXG4rfCQpLyxcbiAgYmxvY2txdW90ZTogL14oICo+W15cXG5dKyhcXG4oPyFkZWYpW15cXG5dKykqXFxuKikrLyxcbiAgbGlzdDogL14oICopKGJ1bGwpIFtcXHNcXFNdKz8oPzpocnxkZWZ8XFxuezIsfSg/ISApKD8hXFwxYnVsbCApXFxuKnxcXHMqJCkvLFxuICBodG1sOiAvXiAqKD86Y29tbWVudCAqKD86XFxufFxccyokKXxjbG9zZWQgKig/OlxcbnsyLH18XFxzKiQpfGNsb3NpbmcgKig/OlxcbnsyLH18XFxzKiQpKS8sXG4gIGRlZjogL14gKlxcWyhbXlxcXV0rKVxcXTogKjw/KFteXFxzPl0rKT4/KD86ICtbXCIoXShbXlxcbl0rKVtcIildKT8gKig/Olxcbit8JCkvLFxuICB0YWJsZTogbm9vcCxcbiAgcGFyYWdyYXBoOiAvXigoPzpbXlxcbl0rXFxuPyg/IWhyfGhlYWRpbmd8bGhlYWRpbmd8YmxvY2txdW90ZXx0YWd8ZGVmKSkrKVxcbiovLFxuICB0ZXh0OiAvXlteXFxuXSsvXG59O1xuXG5ibG9jay5idWxsZXQgPSAvKD86WyorLV18XFxkK1xcLikvO1xuYmxvY2suaXRlbSA9IC9eKCAqKShidWxsKSBbXlxcbl0qKD86XFxuKD8hXFwxYnVsbCApW15cXG5dKikqLztcbmJsb2NrLml0ZW0gPSByZXBsYWNlKGJsb2NrLml0ZW0sICdnbScpXG4gICgvYnVsbC9nLCBibG9jay5idWxsZXQpXG4gICgpO1xuXG5ibG9jay5saXN0ID0gcmVwbGFjZShibG9jay5saXN0KVxuICAoL2J1bGwvZywgYmxvY2suYnVsbGV0KVxuICAoJ2hyJywgJ1xcXFxuKyg/PVxcXFwxPyg/OlstKl9dICopezMsfSg/OlxcXFxuK3wkKSknKVxuICAoJ2RlZicsICdcXFxcbisoPz0nICsgYmxvY2suZGVmLnNvdXJjZSArICcpJylcbiAgKCk7XG5cbmJsb2NrLmJsb2NrcXVvdGUgPSByZXBsYWNlKGJsb2NrLmJsb2NrcXVvdGUpXG4gICgnZGVmJywgYmxvY2suZGVmKVxuICAoKTtcblxuYmxvY2suX3RhZyA9ICcoPyEoPzonXG4gICsgJ2F8ZW18c3Ryb25nfHNtYWxsfHN8Y2l0ZXxxfGRmbnxhYmJyfGRhdGF8dGltZXxjb2RlJ1xuICArICd8dmFyfHNhbXB8a2JkfHN1YnxzdXB8aXxifHV8bWFya3xydWJ5fHJ0fHJwfGJkaXxiZG8nXG4gICsgJ3xzcGFufGJyfHdicnxpbnN8ZGVsfGltZylcXFxcYilcXFxcdysoPyE6L3xbXlxcXFx3XFxcXHNAXSpAKVxcXFxiJztcblxuYmxvY2suaHRtbCA9IHJlcGxhY2UoYmxvY2suaHRtbClcbiAgKCdjb21tZW50JywgLzwhLS1bXFxzXFxTXSo/LS0+LylcbiAgKCdjbG9zZWQnLCAvPCh0YWcpW1xcc1xcU10rPzxcXC9cXDE+LylcbiAgKCdjbG9zaW5nJywgLzx0YWcoPzpcIlteXCJdKlwifCdbXiddKid8W14nXCI+XSkqPz4vKVxuICAoL3RhZy9nLCBibG9jay5fdGFnKVxuICAoKTtcblxuYmxvY2sucGFyYWdyYXBoID0gcmVwbGFjZShibG9jay5wYXJhZ3JhcGgpXG4gICgnaHInLCBibG9jay5ocilcbiAgKCdoZWFkaW5nJywgYmxvY2suaGVhZGluZylcbiAgKCdsaGVhZGluZycsIGJsb2NrLmxoZWFkaW5nKVxuICAoJ2Jsb2NrcXVvdGUnLCBibG9jay5ibG9ja3F1b3RlKVxuICAoJ3RhZycsICc8JyArIGJsb2NrLl90YWcpXG4gICgnZGVmJywgYmxvY2suZGVmKVxuICAoKTtcblxuLyoqXG4gKiBOb3JtYWwgQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLm5vcm1hbCA9IG1lcmdlKHt9LCBibG9jayk7XG5cbi8qKlxuICogR0ZNIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay5nZm0gPSBtZXJnZSh7fSwgYmxvY2subm9ybWFsLCB7XG4gIGZlbmNlczogL14gKihgezMsfXx+ezMsfSlbIFxcLl0qKFxcUyspPyAqXFxuKFtcXHNcXFNdKj8pXFxzKlxcMSAqKD86XFxuK3wkKS8sXG4gIHBhcmFncmFwaDogL14vLFxuICBoZWFkaW5nOiAvXiAqKCN7MSw2fSkgKyhbXlxcbl0rPykgKiMqICooPzpcXG4rfCQpL1xufSk7XG5cbmJsb2NrLmdmbS5wYXJhZ3JhcGggPSByZXBsYWNlKGJsb2NrLnBhcmFncmFwaClcbiAgKCcoPyEnLCAnKD8hJ1xuICAgICsgYmxvY2suZ2ZtLmZlbmNlcy5zb3VyY2UucmVwbGFjZSgnXFxcXDEnLCAnXFxcXDInKSArICd8J1xuICAgICsgYmxvY2subGlzdC5zb3VyY2UucmVwbGFjZSgnXFxcXDEnLCAnXFxcXDMnKSArICd8JylcbiAgKCk7XG5cbi8qKlxuICogR0ZNICsgVGFibGVzIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay50YWJsZXMgPSBtZXJnZSh7fSwgYmxvY2suZ2ZtLCB7XG4gIG5wdGFibGU6IC9eICooXFxTLipcXHwuKilcXG4gKihbLTpdKyAqXFx8Wy18IDpdKilcXG4oKD86LipcXHwuKig/OlxcbnwkKSkqKVxcbiovLFxuICB0YWJsZTogL14gKlxcfCguKylcXG4gKlxcfCggKlstOl0rWy18IDpdKilcXG4oKD86ICpcXHwuKig/OlxcbnwkKSkqKVxcbiovXG59KTtcblxuLyoqXG4gKiBCbG9jayBMZXhlclxuICovXG5cbmZ1bmN0aW9uIExleGVyKG9wdGlvbnMpIHtcbiAgdGhpcy50b2tlbnMgPSBbXTtcbiAgdGhpcy50b2tlbnMubGlua3MgPSB7fTtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBtYXJrZWQuZGVmYXVsdHM7XG4gIHRoaXMucnVsZXMgPSBibG9jay5ub3JtYWw7XG5cbiAgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnRhYmxlcykge1xuICAgICAgdGhpcy5ydWxlcyA9IGJsb2NrLnRhYmxlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ydWxlcyA9IGJsb2NrLmdmbTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvc2UgQmxvY2sgUnVsZXNcbiAqL1xuXG5MZXhlci5ydWxlcyA9IGJsb2NrO1xuXG4vKipcbiAqIFN0YXRpYyBMZXggTWV0aG9kXG4gKi9cblxuTGV4ZXIubGV4ID0gZnVuY3Rpb24oc3JjLCBvcHRpb25zKSB7XG4gIHZhciBsZXhlciA9IG5ldyBMZXhlcihvcHRpb25zKTtcbiAgcmV0dXJuIGxleGVyLmxleChzcmMpO1xufTtcblxuLyoqXG4gKiBQcmVwcm9jZXNzaW5nXG4gKi9cblxuTGV4ZXIucHJvdG90eXBlLmxleCA9IGZ1bmN0aW9uKHNyYykge1xuICBzcmMgPSBzcmNcbiAgICAucmVwbGFjZSgvXFxyXFxufFxcci9nLCAnXFxuJylcbiAgICAucmVwbGFjZSgvXFx0L2csICcgICAgJylcbiAgICAucmVwbGFjZSgvXFx1MDBhMC9nLCAnICcpXG4gICAgLnJlcGxhY2UoL1xcdTI0MjQvZywgJ1xcbicpO1xuXG4gIHJldHVybiB0aGlzLnRva2VuKHNyYywgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIExleGluZ1xuICovXG5cbkxleGVyLnByb3RvdHlwZS50b2tlbiA9IGZ1bmN0aW9uKHNyYywgdG9wLCBicSkge1xuICB2YXIgc3JjID0gc3JjLnJlcGxhY2UoL14gKyQvZ20sICcnKVxuICAgICwgbmV4dFxuICAgICwgbG9vc2VcbiAgICAsIGNhcFxuICAgICwgYnVsbFxuICAgICwgYlxuICAgICwgaXRlbVxuICAgICwgc3BhY2VcbiAgICAsIGlcbiAgICAsIGw7XG5cbiAgd2hpbGUgKHNyYykge1xuICAgIC8vIG5ld2xpbmVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5uZXdsaW5lLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGlmIChjYXBbMF0ubGVuZ3RoID4gMSkge1xuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnc3BhY2UnXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNvZGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5jb2RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGNhcCA9IGNhcFswXS5yZXBsYWNlKC9eIHs0fS9nbSwgJycpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdjb2RlJyxcbiAgICAgICAgdGV4dDogIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICAgID8gY2FwLnJlcGxhY2UoL1xcbiskLywgJycpXG4gICAgICAgICAgOiBjYXBcbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZmVuY2VzIChnZm0pXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZmVuY2VzLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnY29kZScsXG4gICAgICAgIGxhbmc6IGNhcFsyXSxcbiAgICAgICAgdGV4dDogY2FwWzNdIHx8ICcnXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGhlYWRpbmdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5oZWFkaW5nLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaGVhZGluZycsXG4gICAgICAgIGRlcHRoOiBjYXBbMV0ubGVuZ3RoLFxuICAgICAgICB0ZXh0OiBjYXBbMl1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGFibGUgbm8gbGVhZGluZyBwaXBlIChnZm0pXG4gICAgaWYgKHRvcCAmJiAoY2FwID0gdGhpcy5ydWxlcy5ucHRhYmxlLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG5cbiAgICAgIGl0ZW0gPSB7XG4gICAgICAgIHR5cGU6ICd0YWJsZScsXG4gICAgICAgIGhlYWRlcjogY2FwWzFdLnJlcGxhY2UoL14gKnwgKlxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgYWxpZ246IGNhcFsyXS5yZXBsYWNlKC9eICp8XFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBjZWxsczogY2FwWzNdLnJlcGxhY2UoL1xcbiQvLCAnJykuc3BsaXQoJ1xcbicpXG4gICAgICB9O1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5hbGlnbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAncmlnaHQnO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdjZW50ZXInO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSsgKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2xlZnQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZW0uY2VsbHNbaV0gPSBpdGVtLmNlbGxzW2ldLnNwbGl0KC8gKlxcfCAqLyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goaXRlbSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxoZWFkaW5nXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubGhlYWRpbmcuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgZGVwdGg6IGNhcFsyXSA9PT0gJz0nID8gMSA6IDIsXG4gICAgICAgIHRleHQ6IGNhcFsxXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBoclxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmhyLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaHInXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGJsb2NrcXVvdGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5ibG9ja3F1b3RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdibG9ja3F1b3RlX3N0YXJ0J1xuICAgICAgfSk7XG5cbiAgICAgIGNhcCA9IGNhcFswXS5yZXBsYWNlKC9eICo+ID8vZ20sICcnKTtcblxuICAgICAgLy8gUGFzcyBgdG9wYCB0byBrZWVwIHRoZSBjdXJyZW50XG4gICAgICAvLyBcInRvcGxldmVsXCIgc3RhdGUuIFRoaXMgaXMgZXhhY3RseVxuICAgICAgLy8gaG93IG1hcmtkb3duLnBsIHdvcmtzLlxuICAgICAgdGhpcy50b2tlbihjYXAsIHRvcCwgdHJ1ZSk7XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnYmxvY2txdW90ZV9lbmQnXG4gICAgICB9KTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGlzdFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmxpc3QuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgYnVsbCA9IGNhcFsyXTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdsaXN0X3N0YXJ0JyxcbiAgICAgICAgb3JkZXJlZDogYnVsbC5sZW5ndGggPiAxXG4gICAgICB9KTtcblxuICAgICAgLy8gR2V0IGVhY2ggdG9wLWxldmVsIGl0ZW0uXG4gICAgICBjYXAgPSBjYXBbMF0ubWF0Y2godGhpcy5ydWxlcy5pdGVtKTtcblxuICAgICAgbmV4dCA9IGZhbHNlO1xuICAgICAgbCA9IGNhcC5sZW5ndGg7XG4gICAgICBpID0gMDtcblxuICAgICAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaXRlbSA9IGNhcFtpXTtcblxuICAgICAgICAvLyBSZW1vdmUgdGhlIGxpc3QgaXRlbSdzIGJ1bGxldFxuICAgICAgICAvLyBzbyBpdCBpcyBzZWVuIGFzIHRoZSBuZXh0IHRva2VuLlxuICAgICAgICBzcGFjZSA9IGl0ZW0ubGVuZ3RoO1xuICAgICAgICBpdGVtID0gaXRlbS5yZXBsYWNlKC9eICooWyorLV18XFxkK1xcLikgKy8sICcnKTtcblxuICAgICAgICAvLyBPdXRkZW50IHdoYXRldmVyIHRoZVxuICAgICAgICAvLyBsaXN0IGl0ZW0gY29udGFpbnMuIEhhY2t5LlxuICAgICAgICBpZiAofml0ZW0uaW5kZXhPZignXFxuICcpKSB7XG4gICAgICAgICAgc3BhY2UgLT0gaXRlbS5sZW5ndGg7XG4gICAgICAgICAgaXRlbSA9ICF0aGlzLm9wdGlvbnMucGVkYW50aWNcbiAgICAgICAgICAgID8gaXRlbS5yZXBsYWNlKG5ldyBSZWdFeHAoJ14gezEsJyArIHNwYWNlICsgJ30nLCAnZ20nKSwgJycpXG4gICAgICAgICAgICA6IGl0ZW0ucmVwbGFjZSgvXiB7MSw0fS9nbSwgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIG5leHQgbGlzdCBpdGVtIGJlbG9uZ3MgaGVyZS5cbiAgICAgICAgLy8gQmFja3BlZGFsIGlmIGl0IGRvZXMgbm90IGJlbG9uZyBpbiB0aGlzIGxpc3QuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc21hcnRMaXN0cyAmJiBpICE9PSBsIC0gMSkge1xuICAgICAgICAgIGIgPSBibG9jay5idWxsZXQuZXhlYyhjYXBbaSArIDFdKVswXTtcbiAgICAgICAgICBpZiAoYnVsbCAhPT0gYiAmJiAhKGJ1bGwubGVuZ3RoID4gMSAmJiBiLmxlbmd0aCA+IDEpKSB7XG4gICAgICAgICAgICBzcmMgPSBjYXAuc2xpY2UoaSArIDEpLmpvaW4oJ1xcbicpICsgc3JjO1xuICAgICAgICAgICAgaSA9IGwgLSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERldGVybWluZSB3aGV0aGVyIGl0ZW0gaXMgbG9vc2Ugb3Igbm90LlxuICAgICAgICAvLyBVc2U6IC8oXnxcXG4pKD8hIClbXlxcbl0rXFxuXFxuKD8hXFxzKiQpL1xuICAgICAgICAvLyBmb3IgZGlzY291bnQgYmVoYXZpb3IuXG4gICAgICAgIGxvb3NlID0gbmV4dCB8fCAvXFxuXFxuKD8hXFxzKiQpLy50ZXN0KGl0ZW0pO1xuICAgICAgICBpZiAoaSAhPT0gbCAtIDEpIHtcbiAgICAgICAgICBuZXh0ID0gaXRlbS5jaGFyQXQoaXRlbS5sZW5ndGggLSAxKSA9PT0gJ1xcbic7XG4gICAgICAgICAgaWYgKCFsb29zZSkgbG9vc2UgPSBuZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgICAgdHlwZTogbG9vc2VcbiAgICAgICAgICAgID8gJ2xvb3NlX2l0ZW1fc3RhcnQnXG4gICAgICAgICAgICA6ICdsaXN0X2l0ZW1fc3RhcnQnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJlY3Vyc2UuXG4gICAgICAgIHRoaXMudG9rZW4oaXRlbSwgZmFsc2UsIGJxKTtcblxuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnbGlzdF9pdGVtX2VuZCdcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnbGlzdF9lbmQnXG4gICAgICB9KTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gaHRtbFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmh0bWwuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICAgID8gJ3BhcmFncmFwaCdcbiAgICAgICAgICA6ICdodG1sJyxcbiAgICAgICAgcHJlOiAhdGhpcy5vcHRpb25zLnNhbml0aXplclxuICAgICAgICAgICYmIChjYXBbMV0gPT09ICdwcmUnIHx8IGNhcFsxXSA9PT0gJ3NjcmlwdCcgfHwgY2FwWzFdID09PSAnc3R5bGUnKSxcbiAgICAgICAgdGV4dDogY2FwWzBdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGRlZlxuICAgIGlmICgoIWJxICYmIHRvcCkgJiYgKGNhcCA9IHRoaXMucnVsZXMuZGVmLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5saW5rc1tjYXBbMV0udG9Mb3dlckNhc2UoKV0gPSB7XG4gICAgICAgIGhyZWY6IGNhcFsyXSxcbiAgICAgICAgdGl0bGU6IGNhcFszXVxuICAgICAgfTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRhYmxlIChnZm0pXG4gICAgaWYgKHRvcCAmJiAoY2FwID0gdGhpcy5ydWxlcy50YWJsZS5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuXG4gICAgICBpdGVtID0ge1xuICAgICAgICB0eXBlOiAndGFibGUnLFxuICAgICAgICBoZWFkZXI6IGNhcFsxXS5yZXBsYWNlKC9eICp8ICpcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGFsaWduOiBjYXBbMl0ucmVwbGFjZSgvXiAqfFxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgY2VsbHM6IGNhcFszXS5yZXBsYWNlKC8oPzogKlxcfCAqKT9cXG4kLywgJycpLnNwbGl0KCdcXG4nKVxuICAgICAgfTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uYWxpZ24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKC9eICotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ3JpZ2h0JztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnY2VudGVyJztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdsZWZ0JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5jZWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVtLmNlbGxzW2ldID0gaXRlbS5jZWxsc1tpXVxuICAgICAgICAgIC5yZXBsYWNlKC9eICpcXHwgKnwgKlxcfCAqJC9nLCAnJylcbiAgICAgICAgICAuc3BsaXQoLyAqXFx8ICovKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b2tlbnMucHVzaChpdGVtKTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdG9wLWxldmVsIHBhcmFncmFwaFxuICAgIGlmICh0b3AgJiYgKGNhcCA9IHRoaXMucnVsZXMucGFyYWdyYXBoLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ3BhcmFncmFwaCcsXG4gICAgICAgIHRleHQ6IGNhcFsxXS5jaGFyQXQoY2FwWzFdLmxlbmd0aCAtIDEpID09PSAnXFxuJ1xuICAgICAgICAgID8gY2FwWzFdLnNsaWNlKDAsIC0xKVxuICAgICAgICAgIDogY2FwWzFdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRleHRcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy50ZXh0LmV4ZWMoc3JjKSkge1xuICAgICAgLy8gVG9wLWxldmVsIHNob3VsZCBuZXZlciByZWFjaCBoZXJlLlxuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIHRleHQ6IGNhcFswXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoc3JjKSB7XG4gICAgICB0aHJvdyBuZXdcbiAgICAgICAgRXJyb3IoJ0luZmluaXRlIGxvb3Agb24gYnl0ZTogJyArIHNyYy5jaGFyQ29kZUF0KDApKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcy50b2tlbnM7XG59O1xuXG4vKipcbiAqIElubGluZS1MZXZlbCBHcmFtbWFyXG4gKi9cblxudmFyIGlubGluZSA9IHtcbiAgZXNjYXBlOiAvXlxcXFwoW1xcXFxgKnt9XFxbXFxdKCkjK1xcLS4hXz5dKS8sXG4gIGF1dG9saW5rOiAvXjwoW14gPD5dKyhAfDpcXC8pW14gPD5dKyk+LyxcbiAgdXJsOiBub29wLFxuICB0YWc6IC9ePCEtLVtcXHNcXFNdKj8tLT58XjxcXC8/XFx3Kyg/OlwiW15cIl0qXCJ8J1teJ10qJ3xbXjwnXCI+XSkqPz4vLFxuICBsaW5rOiAvXiE/XFxbKGluc2lkZSlcXF1cXChocmVmXFwpLyxcbiAgcmVmbGluazogL14hP1xcWyhpbnNpZGUpXFxdXFxzKlxcWyhbXlxcXV0qKVxcXS8sXG4gIG5vbGluazogL14hP1xcWygoPzpcXFtbXlxcXV0qXFxdfFteXFxbXFxdXSkqKVxcXS8sXG4gIHN0cm9uZzogL15fXyhbXFxzXFxTXSs/KV9fKD8hXyl8XlxcKlxcKihbXFxzXFxTXSs/KVxcKlxcKig/IVxcKikvLFxuICBlbTogL15cXGJfKCg/OlteX118X18pKz8pX1xcYnxeXFwqKCg/OlxcKlxcKnxbXFxzXFxTXSkrPylcXCooPyFcXCopLyxcbiAgY29kZTogL14oYCspKFtcXHNcXFNdKj9bXmBdKVxcMSg/IWApLyxcbiAgYnI6IC9eIHsyLH1cXG4oPyFcXHMqJCkvLFxuICBkZWw6IG5vb3AsXG4gIHRleHQ6IC9eW1xcc1xcU10rPyg/PVtcXFxcPCFcXFtfKmBdfCB7Mix9XFxufCQpL1xufTtcblxuaW5saW5lLl9pbnNpZGUgPSAvKD86XFxbW15cXF1dKlxcXXxcXFxcW1xcW1xcXV18W15cXFtcXF1dfFxcXSg/PVteXFxbXSpcXF0pKSovO1xuaW5saW5lLl9ocmVmID0gL1xccyo8PyhbXFxzXFxTXSo/KT4/KD86XFxzK1snXCJdKFtcXHNcXFNdKj8pWydcIl0pP1xccyovO1xuXG5pbmxpbmUubGluayA9IHJlcGxhY2UoaW5saW5lLmxpbmspXG4gICgnaW5zaWRlJywgaW5saW5lLl9pbnNpZGUpXG4gICgnaHJlZicsIGlubGluZS5faHJlZilcbiAgKCk7XG5cbmlubGluZS5yZWZsaW5rID0gcmVwbGFjZShpbmxpbmUucmVmbGluaylcbiAgKCdpbnNpZGUnLCBpbmxpbmUuX2luc2lkZSlcbiAgKCk7XG5cbi8qKlxuICogTm9ybWFsIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLm5vcm1hbCA9IG1lcmdlKHt9LCBpbmxpbmUpO1xuXG4vKipcbiAqIFBlZGFudGljIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLnBlZGFudGljID0gbWVyZ2Uoe30sIGlubGluZS5ub3JtYWwsIHtcbiAgc3Ryb25nOiAvXl9fKD89XFxTKShbXFxzXFxTXSo/XFxTKV9fKD8hXyl8XlxcKlxcKig/PVxcUykoW1xcc1xcU10qP1xcUylcXCpcXCooPyFcXCopLyxcbiAgZW06IC9eXyg/PVxcUykoW1xcc1xcU10qP1xcUylfKD8hXyl8XlxcKig/PVxcUykoW1xcc1xcU10qP1xcUylcXCooPyFcXCopL1xufSk7XG5cbi8qKlxuICogR0ZNIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLmdmbSA9IG1lcmdlKHt9LCBpbmxpbmUubm9ybWFsLCB7XG4gIGVzY2FwZTogcmVwbGFjZShpbmxpbmUuZXNjYXBlKSgnXSknLCAnfnxdKScpKCksXG4gIHVybDogL14oaHR0cHM/OlxcL1xcL1teXFxzPF0rW148Liw6O1wiJylcXF1cXHNdKS8sXG4gIGRlbDogL15+fig/PVxcUykoW1xcc1xcU10qP1xcUyl+fi8sXG4gIHRleHQ6IHJlcGxhY2UoaW5saW5lLnRleHQpXG4gICAgKCddfCcsICd+XXwnKVxuICAgICgnfCcsICd8aHR0cHM/Oi8vfCcpXG4gICAgKClcbn0pO1xuXG4vKipcbiAqIEdGTSArIExpbmUgQnJlYWtzIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLmJyZWFrcyA9IG1lcmdlKHt9LCBpbmxpbmUuZ2ZtLCB7XG4gIGJyOiByZXBsYWNlKGlubGluZS5icikoJ3syLH0nLCAnKicpKCksXG4gIHRleHQ6IHJlcGxhY2UoaW5saW5lLmdmbS50ZXh0KSgnezIsfScsICcqJykoKVxufSk7XG5cbi8qKlxuICogSW5saW5lIExleGVyICYgQ29tcGlsZXJcbiAqL1xuXG5mdW5jdGlvbiBJbmxpbmVMZXhlcihsaW5rcywgb3B0aW9ucykge1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IG1hcmtlZC5kZWZhdWx0cztcbiAgdGhpcy5saW5rcyA9IGxpbmtzO1xuICB0aGlzLnJ1bGVzID0gaW5saW5lLm5vcm1hbDtcbiAgdGhpcy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlciB8fCBuZXcgUmVuZGVyZXI7XG4gIHRoaXMucmVuZGVyZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICBpZiAoIXRoaXMubGlua3MpIHtcbiAgICB0aHJvdyBuZXdcbiAgICAgIEVycm9yKCdUb2tlbnMgYXJyYXkgcmVxdWlyZXMgYSBgbGlua3NgIHByb3BlcnR5LicpO1xuICB9XG5cbiAgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmJyZWFrcykge1xuICAgICAgdGhpcy5ydWxlcyA9IGlubGluZS5icmVha3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucnVsZXMgPSBpbmxpbmUuZ2ZtO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICB0aGlzLnJ1bGVzID0gaW5saW5lLnBlZGFudGljO1xuICB9XG59XG5cbi8qKlxuICogRXhwb3NlIElubGluZSBSdWxlc1xuICovXG5cbklubGluZUxleGVyLnJ1bGVzID0gaW5saW5lO1xuXG4vKipcbiAqIFN0YXRpYyBMZXhpbmcvQ29tcGlsaW5nIE1ldGhvZFxuICovXG5cbklubGluZUxleGVyLm91dHB1dCA9IGZ1bmN0aW9uKHNyYywgbGlua3MsIG9wdGlvbnMpIHtcbiAgdmFyIGlubGluZSA9IG5ldyBJbmxpbmVMZXhlcihsaW5rcywgb3B0aW9ucyk7XG4gIHJldHVybiBpbmxpbmUub3V0cHV0KHNyYyk7XG59O1xuXG4vKipcbiAqIExleGluZy9Db21waWxpbmdcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUub3V0cHV0ID0gZnVuY3Rpb24oc3JjKSB7XG4gIHZhciBvdXQgPSAnJ1xuICAgICwgbGlua1xuICAgICwgdGV4dFxuICAgICwgaHJlZlxuICAgICwgY2FwO1xuXG4gIHdoaWxlIChzcmMpIHtcbiAgICAvLyBlc2NhcGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5lc2NhcGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IGNhcFsxXTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGF1dG9saW5rXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuYXV0b2xpbmsuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgaWYgKGNhcFsyXSA9PT0gJ0AnKSB7XG4gICAgICAgIHRleHQgPSBlc2NhcGUoXG4gICAgICAgICAgY2FwWzFdLmNoYXJBdCg2KSA9PT0gJzonXG4gICAgICAgICAgPyB0aGlzLm1hbmdsZShjYXBbMV0uc3Vic3RyaW5nKDcpKVxuICAgICAgICAgIDogdGhpcy5tYW5nbGUoY2FwWzFdKVxuICAgICAgICApO1xuICAgICAgICBocmVmID0gdGhpcy5tYW5nbGUoJ21haWx0bzonKSArIHRleHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0ID0gZXNjYXBlKGNhcFsxXSk7XG4gICAgICAgIGhyZWYgPSB0ZXh0O1xuICAgICAgfVxuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIubGluayhocmVmLCBudWxsLCB0ZXh0KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHVybCAoZ2ZtKVxuICAgIGlmICghdGhpcy5pbkxpbmsgJiYgKGNhcCA9IHRoaXMucnVsZXMudXJsLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0ZXh0ID0gZXNjYXBlKGNhcFsxXSk7XG4gICAgICBocmVmID0gdGV4dDtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmxpbmsoaHJlZiwgbnVsbCwgdGV4dCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0YWdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy50YWcuZXhlYyhzcmMpKSB7XG4gICAgICBpZiAoIXRoaXMuaW5MaW5rICYmIC9ePGEgL2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMuaW5MaW5rID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pbkxpbmsgJiYgL148XFwvYT4vaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5vcHRpb25zLnNhbml0aXplXG4gICAgICAgID8gdGhpcy5vcHRpb25zLnNhbml0aXplclxuICAgICAgICAgID8gdGhpcy5vcHRpb25zLnNhbml0aXplcihjYXBbMF0pXG4gICAgICAgICAgOiBlc2NhcGUoY2FwWzBdKVxuICAgICAgICA6IGNhcFswXVxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGlua1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmxpbmsuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgb3V0ICs9IHRoaXMub3V0cHV0TGluayhjYXAsIHtcbiAgICAgICAgaHJlZjogY2FwWzJdLFxuICAgICAgICB0aXRsZTogY2FwWzNdXG4gICAgICB9KTtcbiAgICAgIHRoaXMuaW5MaW5rID0gZmFsc2U7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyByZWZsaW5rLCBub2xpbmtcbiAgICBpZiAoKGNhcCA9IHRoaXMucnVsZXMucmVmbGluay5leGVjKHNyYykpXG4gICAgICAgIHx8IChjYXAgPSB0aGlzLnJ1bGVzLm5vbGluay5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgbGluayA9IChjYXBbMl0gfHwgY2FwWzFdKS5yZXBsYWNlKC9cXHMrL2csICcgJyk7XG4gICAgICBsaW5rID0gdGhpcy5saW5rc1tsaW5rLnRvTG93ZXJDYXNlKCldO1xuICAgICAgaWYgKCFsaW5rIHx8ICFsaW5rLmhyZWYpIHtcbiAgICAgICAgb3V0ICs9IGNhcFswXS5jaGFyQXQoMCk7XG4gICAgICAgIHNyYyA9IGNhcFswXS5zdWJzdHJpbmcoMSkgKyBzcmM7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgb3V0ICs9IHRoaXMub3V0cHV0TGluayhjYXAsIGxpbmspO1xuICAgICAgdGhpcy5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHN0cm9uZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnN0cm9uZy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5zdHJvbmcodGhpcy5vdXRwdXQoY2FwWzJdIHx8IGNhcFsxXSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZW1cbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5lbS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5lbSh0aGlzLm91dHB1dChjYXBbMl0gfHwgY2FwWzFdKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBjb2RlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuY29kZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5jb2Rlc3Bhbihlc2NhcGUoY2FwWzJdLnRyaW0oKSwgdHJ1ZSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gYnJcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5ici5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5icigpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZGVsIChnZm0pXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZGVsLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmRlbCh0aGlzLm91dHB1dChjYXBbMV0pKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRleHRcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy50ZXh0LmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnRleHQoZXNjYXBlKHRoaXMuc21hcnR5cGFudHMoY2FwWzBdKSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHNyYykge1xuICAgICAgdGhyb3cgbmV3XG4gICAgICAgIEVycm9yKCdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29tcGlsZSBMaW5rXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLm91dHB1dExpbmsgPSBmdW5jdGlvbihjYXAsIGxpbmspIHtcbiAgdmFyIGhyZWYgPSBlc2NhcGUobGluay5ocmVmKVxuICAgICwgdGl0bGUgPSBsaW5rLnRpdGxlID8gZXNjYXBlKGxpbmsudGl0bGUpIDogbnVsbDtcblxuICByZXR1cm4gY2FwWzBdLmNoYXJBdCgwKSAhPT0gJyEnXG4gICAgPyB0aGlzLnJlbmRlcmVyLmxpbmsoaHJlZiwgdGl0bGUsIHRoaXMub3V0cHV0KGNhcFsxXSkpXG4gICAgOiB0aGlzLnJlbmRlcmVyLmltYWdlKGhyZWYsIHRpdGxlLCBlc2NhcGUoY2FwWzFdKSk7XG59O1xuXG4vKipcbiAqIFNtYXJ0eXBhbnRzIFRyYW5zZm9ybWF0aW9uc1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5zbWFydHlwYW50cyA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgaWYgKCF0aGlzLm9wdGlvbnMuc21hcnR5cGFudHMpIHJldHVybiB0ZXh0O1xuICByZXR1cm4gdGV4dFxuICAgIC8vIGVtLWRhc2hlc1xuICAgIC5yZXBsYWNlKC8tLS0vZywgJ1xcdTIwMTQnKVxuICAgIC8vIGVuLWRhc2hlc1xuICAgIC5yZXBsYWNlKC8tLS9nLCAnXFx1MjAxMycpXG4gICAgLy8gb3BlbmluZyBzaW5nbGVzXG4gICAgLnJlcGxhY2UoLyhefFstXFx1MjAxNC8oXFxbe1wiXFxzXSknL2csICckMVxcdTIwMTgnKVxuICAgIC8vIGNsb3Npbmcgc2luZ2xlcyAmIGFwb3N0cm9waGVzXG4gICAgLnJlcGxhY2UoLycvZywgJ1xcdTIwMTknKVxuICAgIC8vIG9wZW5pbmcgZG91Ymxlc1xuICAgIC5yZXBsYWNlKC8oXnxbLVxcdTIwMTQvKFxcW3tcXHUyMDE4XFxzXSlcIi9nLCAnJDFcXHUyMDFjJylcbiAgICAvLyBjbG9zaW5nIGRvdWJsZXNcbiAgICAucmVwbGFjZSgvXCIvZywgJ1xcdTIwMWQnKVxuICAgIC8vIGVsbGlwc2VzXG4gICAgLnJlcGxhY2UoL1xcLnszfS9nLCAnXFx1MjAyNicpO1xufTtcblxuLyoqXG4gKiBNYW5nbGUgTGlua3NcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUubWFuZ2xlID0gZnVuY3Rpb24odGV4dCkge1xuICBpZiAoIXRoaXMub3B0aW9ucy5tYW5nbGUpIHJldHVybiB0ZXh0O1xuICB2YXIgb3V0ID0gJydcbiAgICAsIGwgPSB0ZXh0Lmxlbmd0aFxuICAgICwgaSA9IDBcbiAgICAsIGNoO1xuXG4gIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgY2ggPSB0ZXh0LmNoYXJDb2RlQXQoaSk7XG4gICAgaWYgKE1hdGgucmFuZG9tKCkgPiAwLjUpIHtcbiAgICAgIGNoID0gJ3gnICsgY2gudG9TdHJpbmcoMTYpO1xuICAgIH1cbiAgICBvdXQgKz0gJyYjJyArIGNoICsgJzsnO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmVuZGVyZXJcbiAqL1xuXG5mdW5jdGlvbiBSZW5kZXJlcihvcHRpb25zKSB7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG59XG5cblJlbmRlcmVyLnByb3RvdHlwZS5jb2RlID0gZnVuY3Rpb24oY29kZSwgbGFuZywgZXNjYXBlZCkge1xuICBpZiAodGhpcy5vcHRpb25zLmhpZ2hsaWdodCkge1xuICAgIHZhciBvdXQgPSB0aGlzLm9wdGlvbnMuaGlnaGxpZ2h0KGNvZGUsIGxhbmcpO1xuICAgIGlmIChvdXQgIT0gbnVsbCAmJiBvdXQgIT09IGNvZGUpIHtcbiAgICAgIGVzY2FwZWQgPSB0cnVlO1xuICAgICAgY29kZSA9IG91dDtcbiAgICB9XG4gIH1cblxuICBpZiAoIWxhbmcpIHtcbiAgICByZXR1cm4gJzxwcmU+PGNvZGU+J1xuICAgICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUoY29kZSwgdHJ1ZSkpXG4gICAgICArICdcXG48L2NvZGU+PC9wcmU+JztcbiAgfVxuXG4gIHJldHVybiAnPHByZT48Y29kZSBjbGFzcz1cIidcbiAgICArIHRoaXMub3B0aW9ucy5sYW5nUHJlZml4XG4gICAgKyBlc2NhcGUobGFuZywgdHJ1ZSlcbiAgICArICdcIj4nXG4gICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUoY29kZSwgdHJ1ZSkpXG4gICAgKyAnXFxuPC9jb2RlPjwvcHJlPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuYmxvY2txdW90ZSA9IGZ1bmN0aW9uKHF1b3RlKSB7XG4gIHJldHVybiAnPGJsb2NrcXVvdGU+XFxuJyArIHF1b3RlICsgJzwvYmxvY2txdW90ZT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmh0bWwgPSBmdW5jdGlvbihodG1sKSB7XG4gIHJldHVybiBodG1sO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmhlYWRpbmcgPSBmdW5jdGlvbih0ZXh0LCBsZXZlbCwgcmF3KSB7XG4gIHJldHVybiAnPGgnXG4gICAgKyBsZXZlbFxuICAgICsgJyBpZD1cIidcbiAgICArIHRoaXMub3B0aW9ucy5oZWFkZXJQcmVmaXhcbiAgICArIHJhdy50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teXFx3XSsvZywgJy0nKVxuICAgICsgJ1wiPidcbiAgICArIHRleHRcbiAgICArICc8L2gnXG4gICAgKyBsZXZlbFxuICAgICsgJz5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmhyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm9wdGlvbnMueGh0bWwgPyAnPGhyLz5cXG4nIDogJzxocj5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmxpc3QgPSBmdW5jdGlvbihib2R5LCBvcmRlcmVkKSB7XG4gIHZhciB0eXBlID0gb3JkZXJlZCA/ICdvbCcgOiAndWwnO1xuICByZXR1cm4gJzwnICsgdHlwZSArICc+XFxuJyArIGJvZHkgKyAnPC8nICsgdHlwZSArICc+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5saXN0aXRlbSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8bGk+JyArIHRleHQgKyAnPC9saT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnBhcmFncmFwaCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8cD4nICsgdGV4dCArICc8L3A+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50YWJsZSA9IGZ1bmN0aW9uKGhlYWRlciwgYm9keSkge1xuICByZXR1cm4gJzx0YWJsZT5cXG4nXG4gICAgKyAnPHRoZWFkPlxcbidcbiAgICArIGhlYWRlclxuICAgICsgJzwvdGhlYWQ+XFxuJ1xuICAgICsgJzx0Ym9keT5cXG4nXG4gICAgKyBib2R5XG4gICAgKyAnPC90Ym9keT5cXG4nXG4gICAgKyAnPC90YWJsZT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRhYmxlcm93ID0gZnVuY3Rpb24oY29udGVudCkge1xuICByZXR1cm4gJzx0cj5cXG4nICsgY29udGVudCArICc8L3RyPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGFibGVjZWxsID0gZnVuY3Rpb24oY29udGVudCwgZmxhZ3MpIHtcbiAgdmFyIHR5cGUgPSBmbGFncy5oZWFkZXIgPyAndGgnIDogJ3RkJztcbiAgdmFyIHRhZyA9IGZsYWdzLmFsaWduXG4gICAgPyAnPCcgKyB0eXBlICsgJyBzdHlsZT1cInRleHQtYWxpZ246JyArIGZsYWdzLmFsaWduICsgJ1wiPidcbiAgICA6ICc8JyArIHR5cGUgKyAnPic7XG4gIHJldHVybiB0YWcgKyBjb250ZW50ICsgJzwvJyArIHR5cGUgKyAnPlxcbic7XG59O1xuXG4vLyBzcGFuIGxldmVsIHJlbmRlcmVyXG5SZW5kZXJlci5wcm90b3R5cGUuc3Ryb25nID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxzdHJvbmc+JyArIHRleHQgKyAnPC9zdHJvbmc+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5lbSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8ZW0+JyArIHRleHQgKyAnPC9lbT4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmNvZGVzcGFuID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxjb2RlPicgKyB0ZXh0ICsgJzwvY29kZT4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmJyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm9wdGlvbnMueGh0bWwgPyAnPGJyLz4nIDogJzxicj4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmRlbCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8ZGVsPicgKyB0ZXh0ICsgJzwvZGVsPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUubGluayA9IGZ1bmN0aW9uKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gIGlmICh0aGlzLm9wdGlvbnMuc2FuaXRpemUpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHByb3QgPSBkZWNvZGVVUklDb21wb25lbnQodW5lc2NhcGUoaHJlZikpXG4gICAgICAgIC5yZXBsYWNlKC9bXlxcdzpdL2csICcnKVxuICAgICAgICAudG9Mb3dlckNhc2UoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgaWYgKHByb3QuaW5kZXhPZignamF2YXNjcmlwdDonKSA9PT0gMCB8fCBwcm90LmluZGV4T2YoJ3Zic2NyaXB0OicpID09PSAwIHx8IHByb3QuaW5kZXhPZignZGF0YTonKSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICB9XG4gIGlmICh0aGlzLm9wdGlvbnMuYmFzZVVybCAmJiAhb3JpZ2luSW5kZXBlbmRlbnRVcmwudGVzdChocmVmKSkge1xuICAgIGhyZWYgPSByZXNvbHZlVXJsKHRoaXMub3B0aW9ucy5iYXNlVXJsLCBocmVmKTtcbiAgfVxuICB2YXIgb3V0ID0gJzxhIGhyZWY9XCInICsgaHJlZiArICdcIic7XG4gIGlmICh0aXRsZSkge1xuICAgIG91dCArPSAnIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiJztcbiAgfVxuICBvdXQgKz0gJz4nICsgdGV4dCArICc8L2E+JztcbiAgcmV0dXJuIG91dDtcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5pbWFnZSA9IGZ1bmN0aW9uKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gIGlmICh0aGlzLm9wdGlvbnMuYmFzZVVybCAmJiAhb3JpZ2luSW5kZXBlbmRlbnRVcmwudGVzdChocmVmKSkge1xuICAgIGhyZWYgPSByZXNvbHZlVXJsKHRoaXMub3B0aW9ucy5iYXNlVXJsLCBocmVmKTtcbiAgfVxuICB2YXIgb3V0ID0gJzxpbWcgc3JjPVwiJyArIGhyZWYgKyAnXCIgYWx0PVwiJyArIHRleHQgKyAnXCInO1xuICBpZiAodGl0bGUpIHtcbiAgICBvdXQgKz0gJyB0aXRsZT1cIicgKyB0aXRsZSArICdcIic7XG4gIH1cbiAgb3V0ICs9IHRoaXMub3B0aW9ucy54aHRtbCA/ICcvPicgOiAnPic7XG4gIHJldHVybiBvdXQ7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGV4dCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuIHRleHQ7XG59O1xuXG4vKipcbiAqIFBhcnNpbmcgJiBDb21waWxpbmdcbiAqL1xuXG5mdW5jdGlvbiBQYXJzZXIob3B0aW9ucykge1xuICB0aGlzLnRva2VucyA9IFtdO1xuICB0aGlzLnRva2VuID0gbnVsbDtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBtYXJrZWQuZGVmYXVsdHM7XG4gIHRoaXMub3B0aW9ucy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlciB8fCBuZXcgUmVuZGVyZXI7XG4gIHRoaXMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXI7XG4gIHRoaXMucmVuZGVyZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbn1cblxuLyoqXG4gKiBTdGF0aWMgUGFyc2UgTWV0aG9kXG4gKi9cblxuUGFyc2VyLnBhcnNlID0gZnVuY3Rpb24oc3JjLCBvcHRpb25zLCByZW5kZXJlcikge1xuICB2YXIgcGFyc2VyID0gbmV3IFBhcnNlcihvcHRpb25zLCByZW5kZXJlcik7XG4gIHJldHVybiBwYXJzZXIucGFyc2Uoc3JjKTtcbn07XG5cbi8qKlxuICogUGFyc2UgTG9vcFxuICovXG5cblBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihzcmMpIHtcbiAgdGhpcy5pbmxpbmUgPSBuZXcgSW5saW5lTGV4ZXIoc3JjLmxpbmtzLCB0aGlzLm9wdGlvbnMsIHRoaXMucmVuZGVyZXIpO1xuICB0aGlzLnRva2VucyA9IHNyYy5yZXZlcnNlKCk7XG5cbiAgdmFyIG91dCA9ICcnO1xuICB3aGlsZSAodGhpcy5uZXh0KCkpIHtcbiAgICBvdXQgKz0gdGhpcy50b2soKTtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIE5leHQgVG9rZW5cbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudG9rZW4gPSB0aGlzLnRva2Vucy5wb3AoKTtcbn07XG5cbi8qKlxuICogUHJldmlldyBOZXh0IFRva2VuXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnRva2Vuc1t0aGlzLnRva2Vucy5sZW5ndGggLSAxXSB8fCAwO1xufTtcblxuLyoqXG4gKiBQYXJzZSBUZXh0IFRva2Vuc1xuICovXG5cblBhcnNlci5wcm90b3R5cGUucGFyc2VUZXh0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBib2R5ID0gdGhpcy50b2tlbi50ZXh0O1xuXG4gIHdoaWxlICh0aGlzLnBlZWsoKS50eXBlID09PSAndGV4dCcpIHtcbiAgICBib2R5ICs9ICdcXG4nICsgdGhpcy5uZXh0KCkudGV4dDtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmlubGluZS5vdXRwdXQoYm9keSk7XG59O1xuXG4vKipcbiAqIFBhcnNlIEN1cnJlbnQgVG9rZW5cbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnRvayA9IGZ1bmN0aW9uKCkge1xuICBzd2l0Y2ggKHRoaXMudG9rZW4udHlwZSkge1xuICAgIGNhc2UgJ3NwYWNlJzoge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBjYXNlICdocic6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmhyKCk7XG4gICAgfVxuICAgIGNhc2UgJ2hlYWRpbmcnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5oZWFkaW5nKFxuICAgICAgICB0aGlzLmlubGluZS5vdXRwdXQodGhpcy50b2tlbi50ZXh0KSxcbiAgICAgICAgdGhpcy50b2tlbi5kZXB0aCxcbiAgICAgICAgdGhpcy50b2tlbi50ZXh0KTtcbiAgICB9XG4gICAgY2FzZSAnY29kZSc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmNvZGUodGhpcy50b2tlbi50ZXh0LFxuICAgICAgICB0aGlzLnRva2VuLmxhbmcsXG4gICAgICAgIHRoaXMudG9rZW4uZXNjYXBlZCk7XG4gICAgfVxuICAgIGNhc2UgJ3RhYmxlJzoge1xuICAgICAgdmFyIGhlYWRlciA9ICcnXG4gICAgICAgICwgYm9keSA9ICcnXG4gICAgICAgICwgaVxuICAgICAgICAsIHJvd1xuICAgICAgICAsIGNlbGxcbiAgICAgICAgLCBmbGFnc1xuICAgICAgICAsIGo7XG5cbiAgICAgIC8vIGhlYWRlclxuICAgICAgY2VsbCA9ICcnO1xuICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMudG9rZW4uaGVhZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZsYWdzID0geyBoZWFkZXI6IHRydWUsIGFsaWduOiB0aGlzLnRva2VuLmFsaWduW2ldIH07XG4gICAgICAgIGNlbGwgKz0gdGhpcy5yZW5kZXJlci50YWJsZWNlbGwoXG4gICAgICAgICAgdGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4uaGVhZGVyW2ldKSxcbiAgICAgICAgICB7IGhlYWRlcjogdHJ1ZSwgYWxpZ246IHRoaXMudG9rZW4uYWxpZ25baV0gfVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaGVhZGVyICs9IHRoaXMucmVuZGVyZXIudGFibGVyb3coY2VsbCk7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnRva2VuLmNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJvdyA9IHRoaXMudG9rZW4uY2VsbHNbaV07XG5cbiAgICAgICAgY2VsbCA9ICcnO1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgcm93Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgY2VsbCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlY2VsbChcbiAgICAgICAgICAgIHRoaXMuaW5saW5lLm91dHB1dChyb3dbal0pLFxuICAgICAgICAgICAgeyBoZWFkZXI6IGZhbHNlLCBhbGlnbjogdGhpcy50b2tlbi5hbGlnbltqXSB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJvZHkgKz0gdGhpcy5yZW5kZXJlci50YWJsZXJvdyhjZWxsKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnRhYmxlKGhlYWRlciwgYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2Jsb2NrcXVvdGVfc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2Jsb2NrcXVvdGVfZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmJsb2NrcXVvdGUoYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2xpc3Rfc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnXG4gICAgICAgICwgb3JkZXJlZCA9IHRoaXMudG9rZW4ub3JkZXJlZDtcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdsaXN0X2VuZCcpIHtcbiAgICAgICAgYm9keSArPSB0aGlzLnRvaygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5saXN0KGJvZHksIG9yZGVyZWQpO1xuICAgIH1cbiAgICBjYXNlICdsaXN0X2l0ZW1fc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2xpc3RfaXRlbV9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2tlbi50eXBlID09PSAndGV4dCdcbiAgICAgICAgICA/IHRoaXMucGFyc2VUZXh0KClcbiAgICAgICAgICA6IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3RpdGVtKGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdsb29zZV9pdGVtX3N0YXJ0Jzoge1xuICAgICAgdmFyIGJvZHkgPSAnJztcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdsaXN0X2l0ZW1fZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3RpdGVtKGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdodG1sJzoge1xuICAgICAgdmFyIGh0bWwgPSAhdGhpcy50b2tlbi5wcmUgJiYgIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICA/IHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLnRleHQpXG4gICAgICAgIDogdGhpcy50b2tlbi50ZXh0O1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuaHRtbChodG1sKTtcbiAgICB9XG4gICAgY2FzZSAncGFyYWdyYXBoJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLnRleHQpKTtcbiAgICB9XG4gICAgY2FzZSAndGV4dCc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnBhcmFncmFwaCh0aGlzLnBhcnNlVGV4dCgpKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogSGVscGVyc1xuICovXG5cbmZ1bmN0aW9uIGVzY2FwZShodG1sLCBlbmNvZGUpIHtcbiAgcmV0dXJuIGh0bWxcbiAgICAucmVwbGFjZSghZW5jb2RlID8gLyYoPyEjP1xcdys7KS9nIDogLyYvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAucmVwbGFjZSgvJy9nLCAnJiMzOTsnKTtcbn1cblxuZnVuY3Rpb24gdW5lc2NhcGUoaHRtbCkge1xuXHQvLyBleHBsaWNpdGx5IG1hdGNoIGRlY2ltYWwsIGhleCwgYW5kIG5hbWVkIEhUTUwgZW50aXRpZXNcbiAgcmV0dXJuIGh0bWwucmVwbGFjZSgvJigjKD86XFxkKyl8KD86I3hbMC05QS1GYS1mXSspfCg/OlxcdyspKTs/L2lnLCBmdW5jdGlvbihfLCBuKSB7XG4gICAgbiA9IG4udG9Mb3dlckNhc2UoKTtcbiAgICBpZiAobiA9PT0gJ2NvbG9uJykgcmV0dXJuICc6JztcbiAgICBpZiAobi5jaGFyQXQoMCkgPT09ICcjJykge1xuICAgICAgcmV0dXJuIG4uY2hhckF0KDEpID09PSAneCdcbiAgICAgICAgPyBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KG4uc3Vic3RyaW5nKDIpLCAxNikpXG4gICAgICAgIDogU3RyaW5nLmZyb21DaGFyQ29kZSgrbi5zdWJzdHJpbmcoMSkpO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlKHJlZ2V4LCBvcHQpIHtcbiAgcmVnZXggPSByZWdleC5zb3VyY2U7XG4gIG9wdCA9IG9wdCB8fCAnJztcbiAgcmV0dXJuIGZ1bmN0aW9uIHNlbGYobmFtZSwgdmFsKSB7XG4gICAgaWYgKCFuYW1lKSByZXR1cm4gbmV3IFJlZ0V4cChyZWdleCwgb3B0KTtcbiAgICB2YWwgPSB2YWwuc291cmNlIHx8IHZhbDtcbiAgICB2YWwgPSB2YWwucmVwbGFjZSgvKF58W15cXFtdKVxcXi9nLCAnJDEnKTtcbiAgICByZWdleCA9IHJlZ2V4LnJlcGxhY2UobmFtZSwgdmFsKTtcbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVVybChiYXNlLCBocmVmKSB7XG4gIGlmICghYmFzZVVybHNbJyAnICsgYmFzZV0pIHtcbiAgICAvLyB3ZSBjYW4gaWdub3JlIGV2ZXJ5dGhpbmcgaW4gYmFzZSBhZnRlciB0aGUgbGFzdCBzbGFzaCBvZiBpdHMgcGF0aCBjb21wb25lbnQsXG4gICAgLy8gYnV0IHdlIG1pZ2h0IG5lZWQgdG8gYWRkIF90aGF0X1xuICAgIC8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2I3NlY3Rpb24tM1xuICAgIGlmICgvXlteOl0rOlxcLypbXi9dKiQvLnRlc3QoYmFzZSkpIHtcbiAgICAgIGJhc2VVcmxzWycgJyArIGJhc2VdID0gYmFzZSArICcvJztcbiAgICB9IGVsc2Uge1xuICAgICAgYmFzZVVybHNbJyAnICsgYmFzZV0gPSBiYXNlLnJlcGxhY2UoL1teL10qJC8sICcnKTtcbiAgICB9XG4gIH1cbiAgYmFzZSA9IGJhc2VVcmxzWycgJyArIGJhc2VdO1xuXG4gIGlmIChocmVmLnNsaWNlKDAsIDIpID09PSAnLy8nKSB7XG4gICAgcmV0dXJuIGJhc2UucmVwbGFjZSgvOltcXHNcXFNdKi8sICc6JykgKyBocmVmO1xuICB9IGVsc2UgaWYgKGhyZWYuY2hhckF0KDApID09PSAnLycpIHtcbiAgICByZXR1cm4gYmFzZS5yZXBsYWNlKC8oOlxcLypbXi9dKilbXFxzXFxTXSovLCAnJDEnKSArIGhyZWY7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2UgKyBocmVmO1xuICB9XG59XG52YXIgYmFzZVVybHMgPSB7fTtcbnZhciBvcmlnaW5JbmRlcGVuZGVudFVybCA9IC9eJHxeW2Etel1bYS16MC05Ky4tXSo6fF5bPyNdL2k7XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxubm9vcC5leGVjID0gbm9vcDtcblxuZnVuY3Rpb24gbWVyZ2Uob2JqKSB7XG4gIHZhciBpID0gMVxuICAgICwgdGFyZ2V0XG4gICAgLCBrZXk7XG5cbiAgZm9yICg7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICB0YXJnZXQgPSBhcmd1bWVudHNbaV07XG4gICAgZm9yIChrZXkgaW4gdGFyZ2V0KSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRhcmdldCwga2V5KSkge1xuICAgICAgICBvYmpba2V5XSA9IHRhcmdldFtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cblxuLyoqXG4gKiBNYXJrZWRcbiAqL1xuXG5mdW5jdGlvbiBtYXJrZWQoc3JjLCBvcHQsIGNhbGxiYWNrKSB7XG4gIGlmIChjYWxsYmFjayB8fCB0eXBlb2Ygb3B0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2sgPSBvcHQ7XG4gICAgICBvcHQgPSBudWxsO1xuICAgIH1cblxuICAgIG9wdCA9IG1lcmdlKHt9LCBtYXJrZWQuZGVmYXVsdHMsIG9wdCB8fCB7fSk7XG5cbiAgICB2YXIgaGlnaGxpZ2h0ID0gb3B0LmhpZ2hsaWdodFxuICAgICAgLCB0b2tlbnNcbiAgICAgICwgcGVuZGluZ1xuICAgICAgLCBpID0gMDtcblxuICAgIHRyeSB7XG4gICAgICB0b2tlbnMgPSBMZXhlci5sZXgoc3JjLCBvcHQpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGUpO1xuICAgIH1cblxuICAgIHBlbmRpbmcgPSB0b2tlbnMubGVuZ3RoO1xuXG4gICAgdmFyIGRvbmUgPSBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgb3B0LmhpZ2hsaWdodCA9IGhpZ2hsaWdodDtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICB9XG5cbiAgICAgIHZhciBvdXQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIG91dCA9IFBhcnNlci5wYXJzZSh0b2tlbnMsIG9wdCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGVyciA9IGU7XG4gICAgICB9XG5cbiAgICAgIG9wdC5oaWdobGlnaHQgPSBoaWdobGlnaHQ7XG5cbiAgICAgIHJldHVybiBlcnJcbiAgICAgICAgPyBjYWxsYmFjayhlcnIpXG4gICAgICAgIDogY2FsbGJhY2sobnVsbCwgb3V0KTtcbiAgICB9O1xuXG4gICAgaWYgKCFoaWdobGlnaHQgfHwgaGlnaGxpZ2h0Lmxlbmd0aCA8IDMpIHtcbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfVxuXG4gICAgZGVsZXRlIG9wdC5oaWdobGlnaHQ7XG5cbiAgICBpZiAoIXBlbmRpbmcpIHJldHVybiBkb25lKCk7XG5cbiAgICBmb3IgKDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgKGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgIGlmICh0b2tlbi50eXBlICE9PSAnY29kZScpIHtcbiAgICAgICAgICByZXR1cm4gLS1wZW5kaW5nIHx8IGRvbmUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGlnaGxpZ2h0KHRva2VuLnRleHQsIHRva2VuLmxhbmcsIGZ1bmN0aW9uKGVyciwgY29kZSkge1xuICAgICAgICAgIGlmIChlcnIpIHJldHVybiBkb25lKGVycik7XG4gICAgICAgICAgaWYgKGNvZGUgPT0gbnVsbCB8fCBjb2RlID09PSB0b2tlbi50ZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gLS1wZW5kaW5nIHx8IGRvbmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdG9rZW4udGV4dCA9IGNvZGU7XG4gICAgICAgICAgdG9rZW4uZXNjYXBlZCA9IHRydWU7XG4gICAgICAgICAgLS1wZW5kaW5nIHx8IGRvbmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KSh0b2tlbnNbaV0pO1xuICAgIH1cblxuICAgIHJldHVybjtcbiAgfVxuICB0cnkge1xuICAgIGlmIChvcHQpIG9wdCA9IG1lcmdlKHt9LCBtYXJrZWQuZGVmYXVsdHMsIG9wdCk7XG4gICAgcmV0dXJuIFBhcnNlci5wYXJzZShMZXhlci5sZXgoc3JjLCBvcHQpLCBvcHQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZS5tZXNzYWdlICs9ICdcXG5QbGVhc2UgcmVwb3J0IHRoaXMgdG8gaHR0cHM6Ly9naXRodWIuY29tL2NoamovbWFya2VkLic7XG4gICAgaWYgKChvcHQgfHwgbWFya2VkLmRlZmF1bHRzKS5zaWxlbnQpIHtcbiAgICAgIHJldHVybiAnPHA+QW4gZXJyb3Igb2NjdXJyZWQ6PC9wPjxwcmU+J1xuICAgICAgICArIGVzY2FwZShlLm1lc3NhZ2UgKyAnJywgdHJ1ZSlcbiAgICAgICAgKyAnPC9wcmU+JztcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuXG4vKipcbiAqIE9wdGlvbnNcbiAqL1xuXG5tYXJrZWQub3B0aW9ucyA9XG5tYXJrZWQuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdCkge1xuICBtZXJnZShtYXJrZWQuZGVmYXVsdHMsIG9wdCk7XG4gIHJldHVybiBtYXJrZWQ7XG59O1xuXG5tYXJrZWQuZGVmYXVsdHMgPSB7XG4gIGdmbTogdHJ1ZSxcbiAgdGFibGVzOiB0cnVlLFxuICBicmVha3M6IGZhbHNlLFxuICBwZWRhbnRpYzogZmFsc2UsXG4gIHNhbml0aXplOiBmYWxzZSxcbiAgc2FuaXRpemVyOiBudWxsLFxuICBtYW5nbGU6IHRydWUsXG4gIHNtYXJ0TGlzdHM6IGZhbHNlLFxuICBzaWxlbnQ6IGZhbHNlLFxuICBoaWdobGlnaHQ6IG51bGwsXG4gIGxhbmdQcmVmaXg6ICdsYW5nLScsXG4gIHNtYXJ0eXBhbnRzOiBmYWxzZSxcbiAgaGVhZGVyUHJlZml4OiAnJyxcbiAgcmVuZGVyZXI6IG5ldyBSZW5kZXJlcixcbiAgeGh0bWw6IGZhbHNlLFxuICBiYXNlVXJsOiBudWxsXG59O1xuXG4vKipcbiAqIEV4cG9zZVxuICovXG5cbm1hcmtlZC5QYXJzZXIgPSBQYXJzZXI7XG5tYXJrZWQucGFyc2VyID0gUGFyc2VyLnBhcnNlO1xuXG5tYXJrZWQuUmVuZGVyZXIgPSBSZW5kZXJlcjtcblxubWFya2VkLkxleGVyID0gTGV4ZXI7XG5tYXJrZWQubGV4ZXIgPSBMZXhlci5sZXg7XG5cbm1hcmtlZC5JbmxpbmVMZXhlciA9IElubGluZUxleGVyO1xubWFya2VkLmlubGluZUxleGVyID0gSW5saW5lTGV4ZXIub3V0cHV0O1xuXG5tYXJrZWQucGFyc2UgPSBtYXJrZWQ7XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBtYXJrZWQ7XG59IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBtYXJrZWQ7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy5tYXJrZWQgPSBtYXJrZWQ7XG59XG5cbn0pLmNhbGwoZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzIHx8ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbCk7XG59KCkpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvbWFya2VkL2xpYi9tYXJrZWQuanNcbi8vIG1vZHVsZSBpZCA9IDIyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBnO1xyXG5cclxuLy8gVGhpcyB3b3JrcyBpbiBub24tc3RyaWN0IG1vZGVcclxuZyA9IChmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gdGhpcztcclxufSkoKTtcclxuXHJcbnRyeSB7XHJcblx0Ly8gVGhpcyB3b3JrcyBpZiBldmFsIGlzIGFsbG93ZWQgKHNlZSBDU1ApXHJcblx0ZyA9IGcgfHwgRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpIHx8ICgxLGV2YWwpKFwidGhpc1wiKTtcclxufSBjYXRjaChlKSB7XHJcblx0Ly8gVGhpcyB3b3JrcyBpZiB0aGUgd2luZG93IHJlZmVyZW5jZSBpcyBhdmFpbGFibGVcclxuXHRpZih0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiKVxyXG5cdFx0ZyA9IHdpbmRvdztcclxufVxyXG5cclxuLy8gZyBjYW4gc3RpbGwgYmUgdW5kZWZpbmVkLCBidXQgbm90aGluZyB0byBkbyBhYm91dCBpdC4uLlxyXG4vLyBXZSByZXR1cm4gdW5kZWZpbmVkLCBpbnN0ZWFkIG9mIG5vdGhpbmcgaGVyZSwgc28gaXQnc1xyXG4vLyBlYXNpZXIgdG8gaGFuZGxlIHRoaXMgY2FzZS4gaWYoIWdsb2JhbCkgeyAuLi59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGc7XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vICh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qc1xuLy8gbW9kdWxlIGlkID0gMjNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZGVmIHNodWZmbGUgYXJyYXlcblx0dmFyIGNvdW50ZXIgPSBhcnJheTpsZW5ndGgsIHRlbXAsIGluZGV4XG5cblx0IyBXaGlsZSB0aGVyZSBhcmUgZWxlbWVudHMgaW4gdGhlIGFycmF5XG5cdHdoaWxlIGNvdW50ZXIgPiAwXG5cdFx0IyBQaWNrIGEgcmFuZG9tIGluZGV4XG5cdFx0aW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tICogY291bnRlcilcblx0XHRjb3VudGVyLS0gIyBEZWNyZWFzZSBjb3VudGVyIGJ5IDFcblx0XHQjIEFuZCBzd2FwIHRoZSBsYXN0IGVsZW1lbnQgd2l0aCBpdFxuXHRcdHRlbXAgPSBhcnJheVtjb3VudGVyXVxuXHRcdGFycmF5W2NvdW50ZXJdID0gYXJyYXlbaW5kZXhdXG5cdFx0YXJyYXlbaW5kZXhdID0gdGVtcFxuXHRcblx0cmV0dXJuIGFycmF5XG5cbmV4cG9ydCB0YWcgUGF0dGVyblxuXG5cdGRlZiBzZXR1cFxuXHRcdHJldHVybiBzZWxmIGlmICRub2RlJFxuXHRcdHZhciBwYXJ0cyA9IHt0YWdzOiBbXSwga2V5d29yZHM6IFtdLCBtZXRob2RzOiBbXX1cblx0XHR2YXIgaXRlbXMgPSBbXVxuXHRcdHZhciBsaW5lcyA9IFtdXG5cblx0XHRmb3Igb3duIGssdiBvZiBJbWJhLlRhZzpwcm90b3R5cGVcblx0XHRcdGl0ZW1zLnB1c2goXCI8ZW0+e2t9PC9lbT5cIilcblx0XHRcdHBhcnRzOm1ldGhvZHMucHVzaChcIjxlbT57a308L2VtPlwiKVxuXG5cdFx0Zm9yIGsgaW4gSW1iYS5IVE1MX1RBR1Mgb3IgSFRNTF9UQUdTXG5cdFx0XHRpdGVtcy5wdXNoKFwiPHU+Jmx0O3trfSZndDs8L3U+XCIpXG5cdFx0XHRwYXJ0czp0YWdzLnB1c2goXCI8dT4mbHQ7e2t9Jmd0OzwvdT5cIilcblxuXHRcdHZhciB3b3JkcyA9IFwiZGVmIGlmIGVsc2UgZWxpZiB3aGlsZSB1bnRpbCBmb3IgaW4gb2YgdmFyIGxldCBjbGFzcyBleHRlbmQgZXhwb3J0IGltcG9ydCB0YWcgZ2xvYmFsXCJcblxuXHRcdGZvciBrIGluIHdvcmRzLnNwbGl0KFwiIFwiKVxuXHRcdFx0aXRlbXMucHVzaChcIjxpPntrfTwvaT5cIilcblx0XHRcdHBhcnRzOmtleXdvcmRzLnB1c2goXCI8aT57a308L2k+XCIpXG5cblx0XHR2YXIgc2h1ZmZsZWQgPSBzaHVmZmxlKGl0ZW1zKVxuXHRcdHZhciBhbGwgPSBbXS5jb25jYXQoc2h1ZmZsZWQpXG5cdFx0dmFyIGNvdW50ID0gaXRlbXM6bGVuZ3RoIC0gMVxuXG5cdFx0Zm9yIGxuIGluIFswIC4uIDE0XVxuXHRcdFx0bGV0IGNoYXJzID0gMFxuXHRcdFx0bGluZXNbbG5dID0gW11cblx0XHRcdHdoaWxlIGNoYXJzIDwgMzAwXG5cdFx0XHRcdGxldCBpdGVtID0gKHNodWZmbGVkLnBvcCBvciBhbGxbTWF0aC5mbG9vcihjb3VudCAqIE1hdGgucmFuZG9tKV0pXG5cdFx0XHRcdGlmIGl0ZW1cblx0XHRcdFx0XHRjaGFycyArPSBpdGVtOmxlbmd0aFxuXHRcdFx0XHRcdGxpbmVzW2xuXS5wdXNoKGl0ZW0pXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRjaGFycyA9IDQwMFxuXG5cdFx0ZG9tOmlubmVySFRNTCA9ICc8ZGl2PicgKyBsaW5lcy5tYXAofGxuLGl8XG5cdFx0XHRsZXQgbyA9IE1hdGgubWF4KDAsKChpIC0gMikgKiAwLjMgLyAxNCkpLnRvRml4ZWQoMilcblx0XHRcdFwiPGRpdiBjbGFzcz0nbGluZScgc3R5bGU9J29wYWNpdHk6IHtvfTsnPlwiICsgbG4uam9pbihcIiBcIikgKyAnPC9kaXY+J1xuXHRcdCkuam9pbignJykgKyAnPC9kaXY+J1xuXHRcdHNlbGZcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvUGF0dGVybi5pbWJhIiwiaW1wb3J0IFBhZ2UgZnJvbSAnLi9QYWdlJ1xuaW1wb3J0IFNuaXBwZXQgZnJvbSAnLi9TbmlwcGV0J1xuXG50YWcgR3VpZGVUT0Ncblx0cHJvcCB0b2Ncblx0YXR0ciBsZXZlbFxuXG5cdGRlZiB0b2dnbGVcblx0XHR0b2dnbGVGbGFnKCdjb2xsYXBzZWQnKVxuXHRcdFxuXHRkZWYgdG9jXG5cdFx0QHRvYyBvciBkYXRhLnRvY1xuXHRcdFxuXHRkZWYgcm91dGVcblx0XHRcIntkYXRhLnBhdGh9I3t0b2M6c2x1Z31cIlx0XHRcblx0XHRcblx0ZGVmIHJlbmRlclxuXHRcdHJldHVybiBzZWxmIHVubGVzcyBkYXRhLnJlYWR5XG5cblx0XHRsZXQgdG9jID0gdG9jXG5cdFx0cmVyb3V0ZVxuXHRcblx0XHQ8c2VsZi50b2MuZW50cnkgbGV2ZWw9KHRvYzpsZXZlbCk+XG5cdFx0XHRpZiB0b2M6Y2hpbGRyZW46bGVuZ3RoIGFuZCB0b2M6bGV2ZWwgPCAzXG5cdFx0XHRcdDwuaGVhZGVyPlxuXHRcdFx0XHRcdDxhIGhyZWY9cm91dGU+IHRvYzp0aXRsZVxuXHRcdFx0XHQ8LmNvbnRlbnQ+XG5cdFx0XHRcdFx0Zm9yIGNoaWxkIGluIHRvYzpjaGlsZHJlbiB3aGVuIGNoaWxkOmxldmVsIDwgM1xuXHRcdFx0XHRcdFx0PEd1aWRlVE9DW2RhdGFdIHRvYz1jaGlsZD5cblx0XHRcdGVsc2Vcblx0XHRcdFx0PGEgaHJlZj1yb3V0ZT4gdG9jOnRpdGxlXG5cbnRhZyBHdWlkZVxuXHRcblx0ZGVmIHNldHVwXG5cdFx0cmVuZGVyXG5cdFx0QGJvZHkuZG9tOmlubmVySFRNTCA9IGRhdGE6Ym9keVxuXHRcdGlmICR3ZWIkXG5cdFx0XHRhd2FrZW5TbmlwcGV0c1xuXHRcdHNlbGZcblx0XHRcblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmLm1kPlxuXHRcdFx0PGRpdkBib2R5PlxuXHRcdFx0PGZvb3Rlcj5cblx0XHRcdFx0aWYgbGV0IHJlZiA9IGFwcC5ndWlkZVtkYXRhOnByZXZdXG5cdFx0XHRcdFx0PGEucHJldiBocmVmPVwiL2d1aWRlL3tyZWY6aWR9XCI+IFwi4oaQIFwiICsgcmVmOnRpdGxlXG5cdFx0XHRcdGlmIGxldCByZWYgPSBhcHAuZ3VpZGVbZGF0YTpuZXh0XVxuXHRcdFx0XHRcdDxhLm5leHQgaHJlZj1cIi9ndWlkZS97cmVmOmlkfVwiPiByZWY6dGl0bGUgKyBcIiDihpJcIlxuXG5cdGRlZiBhd2FrZW5TbmlwcGV0c1xuXHRcdGZvciBpdGVtIGluIGRvbS5xdWVyeVNlbGVjdG9yQWxsKCcuc25pcHBldCcpXG5cdFx0XHRsZXQgY29kZSA9IGl0ZW06dGV4dENvbnRlbnRcblx0XHRcdGlmIGNvZGUuaW5kZXhPZignSW1iYS5tb3VudCcpID49IDBcblx0XHRcdFx0U25pcHBldC5yZXBsYWNlKGl0ZW0pXG5cdFx0c2VsZlxuXG50YWcgVE9DIDwgbGlcblx0cHJvcCB0b2Ncblx0cHJvcCBleHBhbmRlZCBkZWZhdWx0OiB0cnVlXG5cdGF0dHIgbGV2ZWxcblx0XG5cdGRlZiByb3V0ZVxuXHRcdFwiL2d1aWRlL3tkYXRhOnJvdXRlfSN7dG9jOnNsdWd9XCJcblx0XHRcblx0ZGVmIHRvY1xuXHRcdEB0b2Mgb3IgZGF0YTp0b2NbMF1cblx0XHRcblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmLnRvYy5lbnRyeSBsZXZlbD0odG9jOmxldmVsKT5cblx0XHRcdDxhIGhyZWY9cm91dGU+IHRvYzp0aXRsZVxuXHRcdFx0aWYgdG9jOmNoaWxkcmVuOmxlbmd0aCBhbmQgdG9jOmxldmVsIDwgMiBhbmQgZXhwYW5kZWRcblx0XHRcdFx0PHVsPiBmb3IgY2hpbGQgaW4gdG9jOmNoaWxkcmVuIHdoZW4gY2hpbGQ6bGV2ZWwgPCAzXG5cdFx0XHRcdFx0PFRPQ1tkYXRhXSB0b2M9Y2hpbGQ+XG5cbmV4cG9ydCB0YWcgR3VpZGVzUGFnZSA8IFBhZ2Vcblx0XG5cdGRlZiBtb3VudFxuXHRcdEBvbnNjcm9sbCB8fD0gZG8gc2Nyb2xsZWRcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJyxAb25zY3JvbGwscGFzc2l2ZTogdHJ1ZSlcblxuXHRkZWYgdW5tb3VudFxuXHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLEBvbnNjcm9sbCxwYXNzaXZlOiB0cnVlKVxuXHRcdFxuXHRkZWYgZ3VpZGVcblx0XHRkYXRhW3JvdXRlci5wYXRoLnJlcGxhY2UoJy9ndWlkZS8nLCcnKV0gb3IgZGF0YVsnZXNzZW50aWFscy9pbnRyb2R1Y3Rpb24nXVxuXHRcdFxuXHRkZWYgc2Nyb2xsZWRcblx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0dmFyIGl0ZW1zID0gZG9tLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tpZF0nKVxuXHRcdHZhciBtYXRjaFxuXG5cdFx0dmFyIHNjcm9sbFRvcCA9IHdpbmRvdzpwYWdlWU9mZnNldFxuXHRcdHZhciB3aCA9IHdpbmRvdzppbm5lckhlaWdodFxuXHRcdHZhciBkaCA9IGRvY3VtZW50OmJvZHk6c2Nyb2xsSGVpZ2h0XG5cblx0XHRpZiBAc2Nyb2xsRnJlZXplID49IDBcblx0XHRcdHZhciBkaWZmID0gTWF0aC5hYnMoc2Nyb2xsVG9wIC0gQHNjcm9sbEZyZWV6ZSlcblx0XHRcdHJldHVybiBzZWxmIGlmIGRpZmYgPCA1MFxuXHRcdFx0QHNjcm9sbEZyZWV6ZSA9IC0xXG5cblx0XHR2YXIgc2Nyb2xsQm90dG9tID0gZGggLSAoc2Nyb2xsVG9wICsgd2gpXG5cblx0XHRpZiBzY3JvbGxCb3R0b20gPT0gMFxuXHRcdFx0bWF0Y2ggPSBpdGVtc1tpdGVtcy5sZW4gLSAxXVxuXHRcdGVsc2Vcblx0XHRcdGZvciBpdGVtIGluIGl0ZW1zXG5cdFx0XHRcdHZhciB0ID0gKGl0ZW06b2Zmc2V0VG9wICsgMzAgKyA2MCkgIyBoYWNrXG5cdFx0XHRcdHZhciBkaXN0ID0gc2Nyb2xsVG9wIC0gdFxuXG5cdFx0XHRcdGlmIGRpc3QgPCAwXG5cdFx0XHRcdFx0YnJlYWsgbWF0Y2ggPSBpdGVtXG5cdFx0XG5cdFx0aWYgbWF0Y2hcblx0XHRcdGlmIEBoYXNoICE9IG1hdGNoOmlkXG5cdFx0XHRcdEBoYXNoID0gbWF0Y2g6aWRcblx0XHRcdFx0cm91dGVyLmdvKCcjJyArIEBoYXNoLHt9LHllcylcblx0XHRcdFx0cmVuZGVyXG5cblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBvbnJvdXRlIGVcblx0XHRlLnN0b3Bcblx0XHRsb2cgJ2d1aWRlcyByb3V0ZWQnXG5cdFx0dmFyIHNjcm9sbCA9IGRvXG5cdFx0XHRpZiBsZXQgZWwgPSBkb20ucXVlcnlTZWxlY3RvcignIycgKyByb3V0ZXIuaGFzaClcblx0XHRcdFx0ZWwuc2Nyb2xsSW50b1ZpZXcodHJ1ZSlcblx0XHRcdFx0QHNjcm9sbEZyZWV6ZSA9IHdpbmRvdzpwYWdlWU9mZnNldFxuXHRcdFx0XHRyZXR1cm4gZWxcblx0XHRcdHJldHVybiBub1xuXG5cdFx0aWYgcm91dGVyLmhhc2hcblx0XHRcdCMgcmVuZGVyXG5cdFx0XHRzY3JvbGwoKSBvciBzZXRUaW1lb3V0KHNjcm9sbCwyMClcblxuXHRcdHNlbGZcblx0IyBwcm9wIGd1aWRlXG5cblx0ZGVmIHJlbmRlclxuXHRcdGxldCBjdXJyID0gZ3VpZGVcblxuXHRcdDxzZWxmLl9wYWdlPlxuXHRcdFx0PG5hdkBuYXY+XG5cdFx0XHRcdDwuY29udGVudD5cblx0XHRcdFx0XHRmb3IgaXRlbSBpbiBkYXRhOnRvY1xuXHRcdFx0XHRcdFx0PGgxPiBpdGVtOnRpdGxlIG9yIGl0ZW06aWRcblx0XHRcdFx0XHRcdDx1bD5cblx0XHRcdFx0XHRcdFx0Zm9yIHNlY3Rpb24gaW4gaXRlbTpzZWN0aW9uc1xuXHRcdFx0XHRcdFx0XHRcdDxUT0NbZGF0YVtzZWN0aW9uXV0gZXhwYW5kZWQ9KGRhdGFbc2VjdGlvbl0gPT0gY3Vycik+XG5cdFx0XHRcdFx0IyBmb3IgZ3VpZGUgaW4gZGF0YVxuXHRcdFx0XHRcdCNcdDxUT0NbZ3VpZGVdIHRvYz1ndWlkZTp0b2NbMF0gZXhwYW5kZWQ9KGd1aWRlID09IGN1cnIpPlxuXHRcdFx0PC5ib2R5LmxpZ2h0PlxuXHRcdFx0XHRpZiBndWlkZVxuXHRcdFx0XHRcdDxHdWlkZUB7Z3VpZGU6aWR9W2d1aWRlXT5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvR3VpZGVzUGFnZS5pbWJhIiwiaW1wb3J0IFBhZ2UgZnJvbSAnLi9QYWdlJ1xuXG5kZWYgcGF0aFRvQW5jaG9yIHBhdGhcblx0J2FwaS0nICsgcGF0aC5yZXBsYWNlKC9cXC4vZywnXycpLnJlcGxhY2UoL1xcIy9nLCdfXycpLnJlcGxhY2UoL1xcPS9nLCdfc2V0JylcblxudGFnIERlc2NcblxuXHRkZWYgaHRtbD0gaHRtbFxuXHRcdGlmIGh0bWwgIT0gQGh0bWxcblx0XHRcdGRvbTppbm5lckhUTUwgPSBAaHRtbCA9IGh0bWxcblx0XHRzZWxmXG5cbnRhZyBSZWZcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGY+XG5cbnRhZyBJdGVtXG5cbnRhZyBQYXRoIDwgc3BhblxuXHRwcm9wIHNob3J0XG5cblx0ZGVmIHNldHVwXG5cdFx0dmFyIGl0ZW1zID0gW11cblx0XHR2YXIgc3RyID0gZGF0YVxuXHRcdGlmIHN0ciBpc2EgU3RyaW5nXG5cdFx0XHRpZiBzaG9ydFxuXHRcdFx0XHRzdHIgPSBzdHIucmVwbGFjZSgvKFtBLVpdXFx3KlxcLikqKD89W0EtWl0pL2csJycpXG5cblx0XHRcdGh0bWwgPSBzdHIucmVwbGFjZSgvXFxiKFtcXHddK3xcXC58XFwjKVxcYi9nKSBkbyB8bSxpfFxuXHRcdFx0XHRpZiBpID09ICcuJyBvciBpID09ICcjJ1xuXHRcdFx0XHRcdFwiPGk+e2l9PC9pPlwiXG5cdFx0XHRcdGVsaWYgaVswXSA9PSBpWzBdLnRvVXBwZXJDYXNlXG5cdFx0XHRcdFx0XCI8YiBjbGFzcz0nY29uc3QnPntpfTwvYj5cIlxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XCI8YiBjbGFzcz0naWQnPntpfTwvYj5cIlxuXHRcdHNlbGZcblxuXG50YWcgUmV0dXJuXG5cdGF0dHIgbmFtZVxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj5cblx0XHRcdDxQYXRoW2RhdGE6dmFsdWVdLnZhbHVlPlxuXHRcdFx0PHNwYW4uZGVzYz4gZGF0YTpkZXNjXG5cbnRhZyBDbGFzcyA8IEl0ZW1cblxuXHRwcm9wIGRhdGEgd2F0Y2g6IDpwYXJzZVxuXG5cdGRlZiBwYXJzZVxuXHRcdEBzdGF0aWNzID0gKG0gZm9yIG0gaW4gZGF0YVsnLiddIHdoZW4gbTpkZXNjKVxuXHRcdEBtZXRob2RzID0gKG0gZm9yIG0gaW4gZGF0YVsnIyddIHdoZW4gbTpkZXNjKVxuXHRcdEBwcm9wZXJ0aWVzID0gW11cblx0XHRzZWxmXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmPlxuXHRcdFx0PHNwYW4udG9jLWFuY2hvciBpZD1wYXRoVG9BbmNob3IoZGF0YTpuYW1lcGF0aCk+XG5cdFx0XHQ8LmhlYWRlcj4gPC50aXRsZT4gPFBhdGhbZGF0YTpuYW1lcGF0aF0+XG5cdFx0XHQ8RGVzYyBodG1sPWRhdGE6aHRtbD5cblx0XHRcdGlmIGRhdGE6Y3RvclxuXHRcdFx0XHQ8LmNvbnRlbnQuY3Rvcj5cblx0XHRcdFx0XHQ8TWV0aG9kW2RhdGE6Y3Rvcl0gcGF0aD0oZGF0YTpuYW1lcGF0aCArICcubmV3Jyk+XG5cblx0XHRcdDwuY29udGVudD5cblx0XHRcdFx0aWYgQHN0YXRpY3M6bGVuZ3RoID4gMFxuXHRcdFx0XHRcdDwuc2VjdGlvbj5cblx0XHRcdFx0XHRcdDxoMi5oZWFkZXI+ICdTdGF0aWMgTWV0aG9kcydcblx0XHRcdFx0XHRcdDwuY29udGVudC5saXN0PiBmb3IgaXRlbSBpbiBAc3RhdGljc1xuXHRcdFx0XHRcdFx0XHQ8TWV0aG9kW2l0ZW1dLmRvYyBpbmFtZT1kYXRhOm5hbWVwYXRoPlxuXG5cdFx0XHRcdGlmIEBtZXRob2RzOmxlbmd0aCA+IDBcblx0XHRcdFx0XHQ8LnNlY3Rpb24+XG5cdFx0XHRcdFx0XHQ8aDIuaGVhZGVyPiAnSW5zdGFuY2UgTWV0aG9kcydcblx0XHRcdFx0XHRcdDwuY29udGVudC5saXN0PiBmb3IgaXRlbSBpbiBAbWV0aG9kc1xuXHRcdFx0XHRcdFx0XHQ8TWV0aG9kW2l0ZW1dLmRvYyBpbmFtZT1kYXRhOmluYW1lPlxuXG50YWcgVmFsdWVcblxuXHRkZWYgcmVuZGVyXG5cdFx0aWYgZGF0YTp0eXBlXG5cdFx0XHQ8c2VsZiAue2RhdGE6dHlwZX0+XG5cdFx0XHRcdGRhdGE6dmFsdWVcblx0XHRlbGlmIGRhdGEgaXNhIFN0cmluZ1xuXHRcdFx0PHNlbGYuc3RyIHRleHQ9ZGF0YT5cblx0XHRlbGlmIGRhdGEgaXNhIE51bWJlclxuXHRcdFx0PHNlbGYubnVtIHRleHQ9ZGF0YT5cblx0XHRzZWxmXG5cdFx0XG5cbnRhZyBQYXJhbVxuXG5cdGRlZiB0eXBlXG5cdFx0ZGF0YTp0eXBlXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmIC57dHlwZX0+XG5cdFx0XHRpZiB0eXBlID09ICdOYW1lZFBhcmFtcydcblx0XHRcdFx0Zm9yIHBhcmFtIGluIGRhdGE6bm9kZXNcblx0XHRcdFx0XHQ8UGFyYW1bcGFyYW1dPlxuXHRcdFx0ZWxzZVxuXHRcdFx0XHQ8Lm5hbWU+IGRhdGE6bmFtZVxuXHRcdFx0XHRpZiBkYXRhOmRlZmF1bHRzXG5cdFx0XHRcdFx0PGk+IHR5cGUgPT0gJ05hbWVkUGFyYW0nID8gJzogJyA6ICcgPSAnXG5cdFx0XHRcdFx0PFZhbHVlW2RhdGE6ZGVmYXVsdHNdPlxuXG50YWcgTWV0aG9kIDwgSXRlbVxuXG5cdHByb3AgaW5hbWVcblx0cHJvcCBwYXRoXG5cblx0ZGVmIHRhZ3Ncblx0XHQ8ZGl2QHRhZ3M+XG5cdFx0XHQ8UmV0dXJuW2RhdGE6cmV0dXJuXSBuYW1lPSdyZXR1cm5zJz4gaWYgZGF0YTpyZXR1cm5cblxuXHRcdFx0aWYgZGF0YTpkZXByZWNhdGVkXG5cdFx0XHRcdDwuZGVwcmVjYXRlZC5yZWQ+ICdNZXRob2QgaXMgZGVwcmVjYXRlZCdcblx0XHRcdGlmIGRhdGE6cHJpdmF0ZVxuXHRcdFx0XHQ8LnByaXZhdGUucmVkPiAnTWV0aG9kIGlzIHByaXZhdGUnXG5cblxuXHRkZWYgcGF0aFxuXHRcdEBwYXRoIG9yIChpbmFtZSArICcuJyArIGRhdGE6bmFtZSlcblxuXHRkZWYgc2x1Z1xuXHRcdHBhdGhUb0FuY2hvcihkYXRhOm5hbWVwYXRoKVxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZiAuZGVwcmVjYXRlZD0oZGF0YTpkZXByZWNhdGVkKSA+XG5cdFx0XHQ8c3Bhbi50b2MtYW5jaG9yIGlkPXNsdWc+XG5cdFx0XHQ8LmhlYWRlcj5cblx0XHRcdFx0PFBhdGhbcGF0aF0+XG5cdFx0XHRcdDwucGFyYW1zPiBmb3IgcGFyYW0gaW4gZGF0YTpwYXJhbXNcblx0XHRcdFx0XHQ8UGFyYW1bcGFyYW1dPlxuXHRcdFx0XHQ8Lmdyb3c+XG5cdFx0XHQ8RGVzYy5tZCBodG1sPWRhdGE6aHRtbD5cblx0XHRcdHRhZ3NcblxudGFnIExpbmsgPCBhXG5cdHByb3Agc2hvcnRcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGYgaHJlZj1cIi9kb2NzI3twYXRoVG9BbmNob3IoZGF0YTpuYW1lcGF0aCl9XCI+IDxQYXRoW2RhdGE6bmFtZXBhdGhdIHNob3J0PXNob3J0PlxuXHRcdHN1cGVyXG5cblx0ZGVmIG9udGFwXG5cdFx0c3VwZXJcblx0XHR0cmlnZ2VyKCdyZWZvY3VzJylcblxudGFnIEdyb3VwXG5cblx0ZGVmIG9udGFwXG5cdFx0dG9nZ2xlRmxhZygnY29sbGFwc2VkJylcblxuXG5leHBvcnQgdGFnIERvY3NQYWdlIDwgUGFnZVxuXG5cdHByb3AgdmVyc2lvbiBkZWZhdWx0OiAnY3VycmVudCdcblx0cHJvcCByb290c1xuXG5cdGRlZiBzcmNcblx0XHRcIi9hcGkve3ZlcnNpb259Lmpzb25cIlxuXG5cdGRlZiBkb2NzXG5cdFx0QGRvY3NcblxuXHRkZWYgc2V0dXBcblx0XHRsb2FkXG5cdFx0c3VwZXJcblxuXHRkZWYgbG9hZFxuXHRcdHZhciBkb2NzID0gYXdhaXQgYXBwLmZldGNoKHNyYylcblx0XHRET0NTID0gQGRvY3MgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRvY3MpKVxuXHRcdERPQ01BUCA9IEBkb2NzOmVudGl0aWVzXG5cdFx0Z2VuZXJhdGVcblx0XHRpZiAkd2ViJFxuXHRcdFx0bG9hZGVkXG5cblx0ZGVmIGxvYWRlZFxuXHRcdHJlbmRlclxuXHRcdGlmIGRvY3VtZW50OmxvY2F0aW9uOmhhc2hcblx0XHRcdGlmIHZhciBlbCA9IGRvbS5xdWVyeVNlbGVjdG9yKGRvY3VtZW50OmxvY2F0aW9uOmhhc2gpXG5cdFx0XHRcdGVsLnNjcm9sbEludG9WaWV3XG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgb25yZWZvY3VzIGVcblx0XHRyZWZvY3VzXG5cblx0ZGVmIHJlZm9jdXNcblx0XHRpZiB2YXIgZWwgPSBkb20ucXVlcnlTZWxlY3Rvcihkb2N1bWVudDpsb2NhdGlvbjpoYXNoKVxuXHRcdFx0ZWwuc2Nyb2xsSW50b1ZpZXdcblx0XHRzZWxmXG5cblx0ZGVmIGxvb2t1cCBwYXRoXG5cdFx0ZG9jczplbnRpdGllc1twYXRoXVxuXG5cdGRlZiBnZW5lcmF0ZVxuXHRcdEByb290cyA9IFtdXG5cdFx0dmFyIGVudHMgPSBAZG9jczplbnRpdGllc1xuXG5cdFx0Zm9yIG93biBwYXRoLGl0ZW0gb2YgZG9jczplbnRpdGllc1xuXHRcdFx0aWYgaXRlbTp0eXBlID09ICdjbGFzcycgb3IgcGF0aCA9PSAnSW1iYSdcblx0XHRcdFx0aXRlbVsnLiddID0gKGl0ZW1bJy4nXSB8fCBbXSkuc29ydC5tYXAofHBhdGh8IGVudHNbcGF0aF0gKS5maWx0ZXIofHZ8IHY6dHlwZSA9PSAnbWV0aG9kJyBhbmQgdjpkZXNjIClcblx0XHRcdFx0aXRlbVsnIyddID0gKGl0ZW1bJyMnXSB8fCBbXSkuc29ydC5tYXAofHBhdGh8IGVudHNbcGF0aF0gKS5maWx0ZXIofHZ8IHY6dHlwZSA9PSAnbWV0aG9kJyBhbmQgdjpkZXNjIClcblxuXHRcdFx0XHRAcm9vdHMucHVzaChpdGVtKSBpZiBpdGVtOmRlc2Ncblx0XHRzZWxmXG5cblx0ZGVmIHJlbmRlclxuXHRcdHJldHVybiBzZWxmIHVubGVzcyBkb2NzXG5cdFx0XG5cdFx0PHNlbGY+XG5cdFx0XHQ8bmF2QG5hdj4gPC5jb250ZW50PlxuXHRcdFx0XHRmb3Igcm9vdCBpbiByb290c1xuXHRcdFx0XHRcdDxHcm91cC50b2MuY2xhc3Muc2VjdGlvbi5jb21wYWN0PlxuXHRcdFx0XHRcdFx0PC5oZWFkZXI+IDxMaW5rW3Jvb3RdLmNsYXNzPlxuXHRcdFx0XHRcdFx0PC5jb250ZW50PlxuXHRcdFx0XHRcdFx0XHQ8LnN0YXRpYz5cblx0XHRcdFx0XHRcdFx0XHRmb3IgbWV0aCBpbiByb290WycuJ13CoHdoZW4gbWV0aDpkZXNjIGFuZCAhbWV0aDpwcml2YXRlXG5cdFx0XHRcdFx0XHRcdFx0XHQ8LmVudHJ5PiA8TGlua1ttZXRoXSBzaG9ydD15ZXM+XG5cdFx0XHRcdFx0XHRcdDwuaW5zdGFuY2U+XG5cdFx0XHRcdFx0XHRcdFx0Zm9yIG1ldGggaW4gcm9vdFsnIyddwqB3aGVuIG1ldGg6ZGVzYyBhbmQgIW1ldGg6cHJpdmF0ZVxuXHRcdFx0XHRcdFx0XHRcdFx0PC5lbnRyeT4gPExpbmtbbWV0aF0gc2hvcnQ9eWVzPlxuXHRcdFx0PC5ib2R5PlxuXHRcdFx0XHRmb3Igcm9vdCBpbiByb290c1xuXHRcdFx0XHRcdDxDbGFzc1tyb290XS5kb2MubD5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9Eb2NzUGFnZS5pbWJhIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2xlc3Mvc2l0ZS5sZXNzXG4vLyBtb2R1bGUgaWQgPSAyN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9