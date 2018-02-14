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
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(6);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

/*
Imba is the namespace for all runtime related utilities
@namespace
*/

var Imba = {VERSION: '1.3.0-beta.7'};

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

__webpack_require__(5);
module.exports = __webpack_require__(27);


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;

var App = __webpack_require__(16).App;
var Site = __webpack_require__(18).Site;
document.body.innerHTML = '';
Imba.mount((_1(Site)).setData(App.deserialize(APPCACHE)).end());


/***/ }),
/* 6 */
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
	__webpack_require__(7);
	__webpack_require__(8);
};

if (true && activate) {
	Imba.EventManager.activate();
};

if (false) {};


/***/ }),
/* 7 */
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
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1);

__webpack_require__(9);

Imba.TagManager = new Imba.TagManagerClass();

__webpack_require__(10);
__webpack_require__(11);
__webpack_require__(3);
__webpack_require__(12);
__webpack_require__(13);
__webpack_require__(14);

if (true) {
	__webpack_require__(15);
};

if (false) {};


/***/ }),
/* 9 */
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
/* 10 */
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
	item.static = 5;
	item.cache = this;
	return item;
};

TagMap.prototype.$iter2 = function (){
	let next = this.next$;
	this.next$ = this.curr$;
	next.length = 0;
	return this.curr$ = next;
	// var item = []
	// item.@type = 5
	// item:static = 5
	// item:cache = self
	// return item
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
/* 11 */
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

function DataValue(node,path,mods){
	var self = this;
	self._node = node;
	self._path = path;
	self._mods = mods || {};
	self._setter = Imba.toSetter(self._path);
	let valueFn = node.value;
	node.value = function() { return self.mod(valueFn.call(this)); };
};

DataValue.prototype.context = function (){
	if (this._context) { return this._context };
	// caching can lead to weird behaviour
	let el = this._node;
	while (el){
		if (el.data()) {
			this._context = el;
			break;
		};
		el = el._owner_;
	};
	return this._context;
};

DataValue.prototype.data = function (){
	var ctx = this.context();
	return ctx ? ctx.data() : null;
};

DataValue.prototype.lazy = function (){
	return this._mods.lazy;
};

DataValue.prototype.get = function (){
	let data = this.data();
	if (!(data)) { return null };
	let val = data[this._path];
	return ((val instanceof Function) && data[this._setter]) ? data[this._path]() : val;
};

DataValue.prototype.set = function (value){
	let data = this.data();
	if (!(data)) { return };
	
	let prev = data[this._path];
	if (prev instanceof Function) {
		if (data[this._setter] instanceof Function) {
			data[this._setter](value);
			return this;
		};
	};
	return data[this._path] = value;
};

DataValue.prototype.isArray = function (val){
	if(val === undefined) val = this.get();
	return val && val.splice && val.sort;
};

DataValue.prototype.mod = function (value){
	var self = this;
	if (value instanceof Array) {
		return value.map(function(_0) { return self.mod(_0); });
	};
	if (self._mods.trim && (typeof value=='string'||value instanceof String)) {
		value = value.trim();
	};
	if (self._mods.number) {
		value = parseFloat(value);
	};
	return value;
};

Imba.extendTag('input', function(tag){
	tag.prototype.model = function (){
		return this._model;
	};
	
	tag.prototype.setModel = function (value,mods){
		this._model || (this._model = new DataValue(this,value,mods));
		return this;
	};
	
	tag.prototype.setValue = function (value){
		this.dom().value = this._value = value;
		return this;
	};
	
	tag.prototype.oninput = function (e){
		let val = this._dom.value;
		this._localValue = (this._initialValue != val) ? val : undefined;
		return (this.model() && !this.model().lazy()) ? this.model().set(this.value()) : e.silence();
	};
	
	tag.prototype.onchange = function (e){
		this._modelValue = this._localValue = undefined;
		if (!(this.model())) { return e.silence() };
		
		if (this.type() == 'radio' || this.type() == 'checkbox') {
			let checked = this._dom.checked;
			let mval = this.model().get();
			let dval = (this._value != undefined) ? this._value : this.value();
			// console.log "change",type,checked,dval
			
			if (this.type() == 'radio') {
				return this.model().set(dval,true);
			} else if (this.dom().value == 'on') {
				return this.model().set(!(!(checked)),true);
			} else if (this.model().isArray()) {
				let idx = mval.indexOf(dval);
				if (checked && idx == -1) {
					return mval.push(dval);
				} else if (!(checked) && idx >= 0) {
					return mval.splice(idx,1);
				};
			} else {
				return this.model().set(dval);
			};
		} else {
			return this.model().set(this.value());
		};
	};
	
	// overriding end directly for performance
	tag.prototype.end = function (){
		if (!this._model || this._localValue !== undefined) { return this };
		let mval = this._model.get();
		if (mval == this._modelValue) { return this };
		if (!this.model().isArray()) { this._modelValue = mval };
		
		if (this.type() == 'radio' || this.type() == 'checkbox') {
			let dval = this._value;
			let checked = this.model().isArray() ? (
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
	tag.prototype.model = function (){
		return this._model;
	};
	
	tag.prototype.setModel = function (value,mods){
		this._model || (this._model = new DataValue(this,value,mods));
		return this;
	};
	
	tag.prototype.setValue = function (value){
		if (this._localValue == undefined) { this.dom().value = value };
		return this;
	};
	
	tag.prototype.oninput = function (e){
		let val = this._dom.value;
		this._localValue = (this._initialValue != val) ? val : undefined;
		return (this.model() && !this.model().lazy()) ? this.model().set(this.value()) : e.silence();
	};
	
	tag.prototype.onchange = function (e){
		this._localValue = undefined;
		return this.model() ? this.model().set(this.value()) : e.silence();
	};
	
	tag.prototype.render = function (){
		if (this._localValue != undefined || !(this.model())) { return };
		if (this.model()) {
			this._dom.value = this.model().get();
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
	tag.prototype.model = function (){
		return this._model;
	};
	
	tag.prototype.setModel = function (value,mods){
		this._model || (this._model = new DataValue(this,value,mods));
		return this;
	};
	
	tag.prototype.setValue = function (value){
		if (value != this._value) {
			this._value = value;
			if (typeof value == 'object') {
				for (let i = 0, items = iter$(this.dom().options), len = items.length, opt; i < len; i++) {
					opt = items[i];
					let oval = (opt._tag ? opt._tag.value() : opt.value);
					if (value == oval) {
						this.dom().selectedIndex = i;
						break;
					};
				};
			} else {
				this.dom().value = value;
			};
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
		return this.model() ? this.model().set(this.value()) : e.silence();
	};
	
	tag.prototype.render = function (){
		if (!(this.model())) { return };
		
		let mval = this.model().get();
		// sync dom value
		if (this.multiple()) {
			for (let i = 0, items = iter$(this.dom().options), len = items.length, option; i < len; i++) {
				option = items[i];
				let oval = this.model().mod(option._tag ? option._tag.value() : option.value);
				let sel = mval.indexOf(oval) >= 0;
				option.selected = sel;
			};
		} else {
			this.setValue(mval);
			// what if mval is rich? Would be nice with some mapping
			// dom:value = mval
		};
		return this;
	};
});


/***/ }),
/* 12 */
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
/* 13 */
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
	return this[str];
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
					handler = fn;
					context = el;
				} else {
					el = el.parent();
				};
			};
		};
		
		if (handler instanceof Function) {
			// what if we actually call stop inside function?
			// do we still want to continue the chain?
			let res = handler.apply(context,params || [this]);
			
			// should we take awaits into account?
			// was bubbling before - has not been modified
			if (!(isMod)) {
				bubble = false; // stop propagation by default
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
			if (node[meth] instanceof Function) {
				this._responder || (this._responder = node);
				this._silenced = false;
				result = args ? node[meth].apply(node,args) : node[meth](this,this.data());
			};
			
			if (handlers = node._on_) {
				for (let i = 0, items = iter$(handlers), len = items.length, handler; i < len; i++) {
					handler = items[i];
					if (!(handler)) { continue; };
					let hname = handler[0];
					if (name == handler[0] && this.bubble()) { // and (hname:length == name:length or hname[name:length] == '.')
						this.processHandlers(node,handler);
					};
				};
				if (!(this.bubble())) { break; };
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
/* 14 */
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
/* 15 */
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
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
var Router = __webpack_require__(17).Router;

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
/* 17 */
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
			setId('#gist').open(m[2]);
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
		return this.reroute();
	};
});


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var HomePage = __webpack_require__(19).HomePage;
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
				$[1] || _1('nav',$,1,0).flag('content')
			,2),
			
			_1('main',$,23,this),
			
			_1('footer',$,27,this).setId('footer').setContent([
				_1('hr',$,28,27),
				_1('div',$,29,27).flag('lft').setText("Imba © 2015-2018"),
				_1('div',$,30,27).flag('rgt').setContent([
					_1('a',$,31,30).setHref('http://twitter.com/imbajs').setText('Twitter'),
					_1('a',$,32,30).setHref('http://github.com/somebee/imba').setText('GitHub'),
					_1('a',$,33,30).setHref('http://github.com/somebee/imba/issues').setText('Issues'),
					_1('a',$,34,30).setHref('http://gitter.im/somebee/imba').setText('Chat')
				],2)
			],2)
		],2).synced((
			$[0].end((
				$[1].setContent([
					($[2] || _1('a',$,2,1).flag('tab').flag('logo').setHref('/home').setContent($[3] || _1('i',$,3,2).setText('imba'),2)).end(),
					($[4] || _1('a',$,4,1).flag('tab').flag('home').setHref('/home').setContent($[5] || _1('i',$,5,4).setText('home'),2)).end(),
					($[6] || _1('a',$,6,1).flag('tab').flag('guides').setHref('/guide').setContent($[7] || _1('i',$,7,6).setText('guides'),2)).end(),
					($[8] || _1('a',$,8,1).flag('tab').flag('docs').setHref('/docs').setContent($[9] || _1('i',$,9,8).setText('api'),2)).end(),
					($[10] || _1('a',$,10,1).flag('tab').flag('blog').setHref('/blog').setContent($[11] || _1('i',$,11,10).setText('blog'),2)).end(),
					(this.app().router().segment(0) == 'gists') ? (
						($[12] || _1('a',$,12,1).flag('tab').flag('blog').setHref('/gists').setContent($[13] || _1('i',$,13,12).setText('gists'),2)).end()
					) : void(0),
					
					($[14] || _1('span',$,14,1).flag('greedy')),
					($[15] || _1('a',$,15,1).flag('twitter').setHref('http://twitter.com/imbajs').setContent($[16] || _1('i',$,16,15).setText('twitter'),2)).end(),
					($[17] || _1('a',$,17,1).flag('github').setHref('https://github.com/somebee/imba').setContent($[18] || _1('i',$,18,17).setText('github'),2)).end(),
					($[19] || _1('a',$,19,1).flag('issues').setHref('https://github.com/somebee/imba/issues').setContent($[20] || _1('i',$,20,19).setText('issues'),2)).end(),
					($[21] || _1('a',$,21,1).flag('menu').on$(0,['tap','toggleMenu']).setContent($[22] || _1('b',$,22,21),2)).end()
				],1).end()
			,true)),
			$[23].setContent(
				this.router().scoped('/home') ? (
					($[24] || _1(HomePage,$,24,23)).end()
				) : (this.router().scoped('/guide') ? (
					($[25] || _1(GuidesPage,$,25,23)).end()
				) : (this.router().scoped('/docs') ? (
					($[26] || _1(DocsPage,$,26,23)).end()
				) : void(0)))
			,3).end(),
			$[27].end((
				$[30].end()
			,true))
		,true));
	};
})
exports.Site = Site;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var Page = __webpack_require__(2).Page;

var Example = __webpack_require__(20).Example;
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
				
				_1(Example,$,4,2).flag('dark').setHeading("Simple reminders").setSrc('/home/examples/reminders.imba'),
				
				_1(Marked,$,5,2).flag('section').flag('md').setText("## Reusable components\n\nA custom tag / component can maintain internal state and control how to render itself.\nWith the performance of DOM reconciliation in Imba, you can use one-way declarative bindings,\neven for animations. Write all your views in a straight-forward linear fashion as if you could\nrerender your whole application on **every single** data/state change."),
				
				_1(Example,$,6,2).flag('dark').setHeading("World clock").setSrc('/home/examples/clock.imba'),
				
				_1(Marked,$,7,2).flag('section').flag('md').setText("## Extend native tags\n\nIn addition to defining custom tags, you can also extend native tags, or inherit from them.\nBinding to dom events is as simple as defining methods on your tags; all events will be\nefficiently delegated and handled by Imba. Let's define a simple sketchpad..."),
				
				_1(Example,$,8,2).flag('dark').setHeading("Custom canvas").setSrc('/home/examples/canvas.imba')
			],2)
		],2),2).synced((
			$[0].end((
				$[1].end((
					this._pattern.end()
				,true)),
				$[2].end((
					$[3].end(),
					$[4].end(),
					$[5].end(),
					$[6].end(),
					$[7].end(),
					$[8].end()
				,true))
			,true))
		,true));
	};
})
exports.HomePage = HomePage;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);

var Snippet = Imba.defineTag('Snippet', function(tag){
	tag.prototype.src = function(v){ return this._src; }
	tag.prototype.setSrc = function(v){ this._src = v; return this; };
	tag.prototype.heading = function(v){ return this._heading; }
	tag.prototype.setHeading = function(v){ this._heading = v; return this; };
	
	tag.prototype.render = function (){
		return this.$open(0).synced();
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
var Imba = __webpack_require__(0), _2 = Imba.createTagList, _1 = Imba.createElement;
var Page = __webpack_require__(2).Page;

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
						for (let i = 0, items = iter$(toc.children), len = $0.taglen = items.length; i < len; i++) {
							// <div> "Item"
							($0[i] || _1(GuideTOC,$0,i)).setData(self.data()).setToc(items[i]).end();
						};return $0;
					})($[3] || _2($,3,$[2]))
				,4).end()
			],2,1) : (
				($[4] || _1('a',$,4,self)).setHref(self.route()).setContent(toc.title,3).end()
			)
		,3).synced();
	};
});

var Guide = Imba.defineTag('Guide', function(tag){
	tag.prototype.render = function (){
		var data_;
		if (!(data_ = this.data()) && data_.ready  &&  data_.ready()) { return this };
		// really render without imba?
		return this.$open(0).flag('md').setBody(this.data().body()).synced();
	};
	
	tag.prototype.setBody = function (body){
		if (body != this._body) {
			this._body = body;
			this.dom().innerHTML = body;
		};
		this;
		return this;
	};
});

var GuidesPage = Imba.defineTag('GuidesPage', Page, function(tag){
	
	tag.prototype.mount = function (){
		var self = this;
		console.log("GuidesPage mounted");
		self._onscroll || (self._onscroll = function() { return self.scrolled(); });
		return window.addEventListener('scroll',self._onscroll,{passive: true});
		// Doc.get(router.path,'md')
	};
	
	tag.prototype.unmount = function (){
		return window.removeEventListener('scroll',this._onscroll,{passive: true});
	};
	
	tag.prototype.guide = function (){
		return this.app().doc(this.router().path() + '.md');
	};
	
	tag.prototype.scrolled = function (){
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
			self.render();
			scroll() || setTimeout(scroll,20);
		};
		
		return self;
	};
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).flag('_page').setChildren($.$ = $.$ || [
			this._nav = this._nav||_1('nav',this).flag('nav').setContent(
				$[0] || _1('div',$,0,this._nav).flag('content').setContent(
					$[1] || _1(GuideTOC,$,1,0)
				// <GuideTOC[app.doc('/guides/language.md')]>
				,2)
			,2),
			_1('div',$,2,this).flag('body').flag('light').setContent(
				$[3] || _1(Guide,$,3,2)
			,2)
		],2).synced((
			this._nav.end((
				$[0].end((
					$[1].setData(this.app().doc('/guide.md')).end()
				,true))
			,true)),
			$[2].end((
				$[3].setData(this.guide()).end()
			,true))
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
			$[0].setData(this.data().value).end(),
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
					$[3].setData(self.data().namepath).end()
				,true))
			,true)),
			($[4] || _1(Desc,$,4,self)).setHtml(self.data().html).end(),
			self.data().ctor ? (
				($[5] || _1('div',$,5,self).flag('content').flag('ctor').setContent(
					$[6] || _1(Method,$,6,5)
				,2)).end((
					$[6].setData(self.data().ctor).setPath((self.data().namepath + '.new')).end()
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
					($[3] || _1(Value,$,3,self)).setData(self.data().defaults).end()
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
			this.data().return ? ((t0.$.A || _1(Return,t0.$,'A',t0).setName('returns')).setData(this.data().return).end()) : void(0),
			
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
				$[2].setData(self.path()).end(),
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
			$[0].setData(this.data().namepath).setShort(this.short()).end()
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgY2Y3YTJhNjAzNDkwZDQzZDRjOTQiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvaW1iYS5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2ltYmEuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvUGFnZS5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9wb2ludGVyLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NsaWVudC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2luZGV4LmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvc2NoZWR1bGVyLmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvZG9tL2luZGV4LmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvZG9tL21hbmFnZXIuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vdGFnLmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvZG9tL2h0bWwuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vdG91Y2guaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vZXZlbnQuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vZXZlbnQtbWFuYWdlci5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9yZWNvbmNpbGVyLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC5pbWJhIiwid2VicGFjazovLy8uL3NyYy91dGlsL3JvdXRlci5pbWJhIiwid2VicGFjazovLy8uL3NyYy92aWV3cy9TaXRlLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL0hvbWVQYWdlLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1NuaXBwZXQuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvTWFya2VkLmltYmEiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL21hcmtlZC9saWIvbWFya2VkLmpzIiwid2VicGFjazovLy8od2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1BhdHRlcm4uaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvR3VpZGVzUGFnZS5pbWJhIiwid2VicGFjazovLy8uL3NyYy92aWV3cy9Eb2NzUGFnZS5pbWJhIiwid2VicGFjazovLy8uL2xlc3Mvc2l0ZS5sZXNzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztBQzdEQSxPQUFPLFFBQVE7Ozs7Ozs7Ozs7OztJQ0lYLEtBQUs7Ozs7Ozs7Ozs7QUFTVDtRQUNDO0VBQ0M7U0FDQSxLQUFLO0dBRk87Ozs7Ozs7Ozs7O0FBV2Q7UUFDQyxZQUFZLE1BQU07Ozs7Ozs7QUFLbkI7UUFDQyxjQUFjOzs7Ozs7O0FBS2Y7UUFDQyxhQUFhOzs7O0FBR2Q7Q0FDQzs7YUFDWSxJQUFHLElBQUksZUFBZSxNQUFqQyxJQUFJLEdBQUcsRUFBRTs7O0NBRVYsSUFBSSxVQUFVLEVBQUUsT0FBTyxPQUFPLElBQUk7Q0FDbEMsSUFBSSxVQUFVLEVBQUUsSUFBSSxVQUFVLFVBQVUsRUFBRSxJQUFJO0NBQzlDLElBQUksVUFBVSxXQUFXLEVBQUUsSUFBSSxVQUFVLFlBQVksRUFBRTtRQUNoRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0JSO1FBQ1EsTUFBSyxFQUFFLFVBQVUsRUFBRSxZQUFVOzs7Ozs7Ozs7OztBQVNyQztDQUNDLElBQUcsaUJBQVU7RUFDWixRQUFRO1NBQ1IsUUFBUSxJQUFJO1FBQ2IsSUFBSyxNQUFNLEdBQUksTUFBTTtTQUNwQjs7U0FFQSxRQUFRLFFBQVE7Ozs7SUFFZCxVQUFVO0lBQ1YsWUFBWTs7QUFFaEI7Q0FDQyxJQUFHLElBQUksYUFBYSxHQUFHO1NBQ3RCLElBQUksUUFBUSwrQkFBa0IsRUFBRSxPQUFPLEdBQUc7O1NBRTFDOzs7O0FBRUY7UUFDQyxZQUFZLFNBQVosWUFBWSxPQUFTLEtBQUssbUJBQW1CLEVBQUU7OztBQUVoRDtTQUNTLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxRQUFRLFFBQVEsUUFBUSxLQUFLLEVBQUU7OztBQUU1RDtRQUNRLEVBQUUsS0FBSSxFQUFFLGVBQVEsWUFBVyxFQUFFLElBQUksS0FBSyxLQUFLLEVBQUUsUUFBUSxHQUFHOzs7QUFFaEU7Q0FDQyxJQUFHLE1BQU07U0FDRCxNQUFNLGVBQWUsS0FBSzs7Ozs7QUFHbkM7O0NBQ0MsSUFBRyxNQUFNO1NBQ0QsTUFBTSxnQkFBZ0IsS0FBSzs7O0tBRS9CLFFBQVEsRUFBRSxLQUFLLFlBQVk7S0FDM0IsUUFBUSxFQUFFLEtBQUssbUJBQW1CLEVBQUU7S0FDcEMsTUFBTSxFQUFFLE1BQU07O0NBRWxCLElBQUcsS0FBSztFQUNQLE1BQU0sU0FBUywyQkFBVSxNQUFJO0VBQzdCLE1BQU0sU0FBUztHQUNkLElBQUcsTUFBTSxRQUFRO1NBQ1gsTUFBSSxNQUFNLEVBQUU7Ozs7O0VBR25CLE1BQU0sU0FBUywyQkFBVSxhQUFhO0VBQ3RDLE1BQU0sU0FBUztRQUNULGFBQWEsS0FBSzs7Ozs7OztBQUkxQjtLQUNLLEdBQUcsRUFBRSxTQUFTO0NBQ2xCLElBQUcsY0FBTztFQUNULEdBQUcsS0FBSyxPQUFPLElBQUksS0FBSztRQUN6QixZQUFLLG9DQUFjLEdBQUksT0FBTztFQUM3QixPQUFPLElBQUksSUFBSSxLQUFLOzs7Ozs7O0FBS3RCOztLQUVLLEtBQU0sR0FBSTs7U0FFUCxLQUFLLEVBQUUsTUFBTSxJQUFLLEtBQUssRUFBRSxLQUFLO0VBQ3BDLElBQUcsR0FBRyxFQUFFLEtBQUs7R0FDWixJQUFHLEtBQUssS0FBSyxHQUFJLEdBQUcsS0FBSztJQUN4QixJQUFJLEVBQUUsT0FBTyxHQUFHLEtBQUssTUFBTSxNQUFNLEdBQUcsUUFBUSxHQUFHLEtBQUs7OztJQUdwRCxJQUFJLEVBQUUsT0FBTyxHQUFHLE1BQU0sS0FBTSxRQUFRLEdBQUcsS0FBSzs7OztFQUU5QyxJQUFHLEtBQUssTUFBTSxLQUFLLEtBQUssTUFBTSxHQUFHO0dBQ2hDLEtBQUssS0FBSyxFQUFFLEtBQUs7R0FDakIsS0FBSyxTQUFTLEVBQUU7Ozs7Ozs7QUFJbkI7S0FDSyxJQUFLLEtBQU07Q0FDZixJQUFJLEVBQUUsSUFBSSxrQkFBSixJQUFJO0NBQ1YsS0FBSyxFQUFFLElBQUksV0FBSixJQUFJO0NBQ1gsS0FBSyxFQUFFLEtBQUssS0FBSyxJQUFJLEtBQUssS0FBSyxHQUFHLEtBQUssS0FBSztDQUM1QyxLQUFLLFNBQVMsRUFBRTtDQUNoQixLQUFLLEtBQUssRUFBRTtDQUNaLEtBQUssS0FBSyxFQUFFLEtBQUssS0FBSztRQUNmOzs7O0FBR1I7S0FDSyxLQUFLLEVBQUUsS0FBSyxPQUFPLElBQUksTUFBTTtDQUNqQyxLQUFLLE1BQU0sRUFBRTtRQUNOOzs7O0FBR1I7S0FDSyxLQUFNO0tBQ04sS0FBSyxFQUFFLElBQUk7Q0FDUixNQUFPOztDQUVkLElBQUcsS0FBSyxFQUFFLEtBQUs7VUFDUCxLQUFLLEVBQUUsTUFBTSxJQUFLLEtBQUssRUFBRSxLQUFLO0dBQ3BDLElBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLFNBQVMsR0FBRztJQUNqQyxLQUFLLEtBQUssRUFBRSxLQUFLOztJQUVqQixLQUFLLFNBQVMsRUFBRTs7Ozs7Ozs7O0FBS3BCOztDQUNDLElBQU8sR0FBRyxFQUFFLElBQUk7RUFDZ0IsSUFBRyxHQUFHLFVBQXJDLE9BQU8sTUFBTSxPQUFPLEdBQUc7RUFDYSxJQUFHLEdBQUcsT0FBMUMsT0FBTyxPQUFPLE1BQU0sUUFBUSxHQUFHOzs7OztBQUdqQztDQUNDLElBQUcsS0FBSyxVQUFXLEtBQUs7RUFDdkIsS0FBSyxTQUFTLFdBQVcsU0FBUzs7Q0FDbkMsSUFBRyxPQUFPLFVBQVcsT0FBTztFQUMzQixLQUFLLE9BQU8sYUFBYSxTQUFTOzs7OztBQUdwQyxPQUFPLFFBQVEsRUFBRTs7Ozs7Ozs7V0M5TVY7Ozs7Ozs7O0lDQUgsS0FBSzs7QUFFSCxLQUFLLFVBRVYsU0FGVTtNQUdULFFBQVEsR0FBRztNQUNYLE9BQU8sTUFBTSxLQUFNOzs7O0FBR3BCLEtBUFU7YUFRVDs7O0FBRUQsS0FWVTthQVdUOzs7QUFFRCxLQWJVO01BY1QsT0FBTyxFQUFFO01BQ1QsT0FBTyxFQUFFOzs7OztBQUlWLEtBbkJVO0tBb0JMLEdBQUcsT0FBRTs7Q0FFVCxTQUFHO09BQ0YsV0FBVyxFQUFFO09BQ2IsT0FBTyxFQUFFOzs7RUFHVCxJQUFHLEdBQUcsS0FBSztRQUNWLFFBQVEsRUFBRSxHQUFHOztHQUViLFVBQUksT0FBTyxRQUFJLFFBQVEsR0FBRzs7Ozs7R0FJWixTQUFHLGVBQWpCLE9BQU87UUFDUCxPQUFPLE1BQUUsS0FBSyxNQUFVO1FBQ3hCLE9BQU8sVUFBVSxHQUFHO1NBRXJCLElBQUssR0FBRyxLQUFLO0dBQ1ksU0FBRyxlQUEzQixPQUFPLFVBQVUsR0FBRztTQUVyQixJQUFLLEdBQUcsS0FBSztRQUNaLFFBQVEsR0FBRzs7R0FFWCxTQUFHLE9BQU8sUUFBSSxPQUFPLFNBQU8sR0FBRyxHQUFHO1NBQ2pDLE9BQU8sUUFBUSxHQUFHO1NBQ2xCLE9BQU8sRUFBRTs7OztRQUVaLFNBQUs7T0FDSixPQUFPOzs7OztBQUdULEtBcERVO2FBb0RELE9BQU87O0FBQ2hCLEtBckRVO2FBcURELE9BQU87Ozs7Ozs7Ozs7Ozs7Ozs7OztrQ0N0RFY7bUNBQ0E7QUFDUCxTQUFTLEtBQUssVUFBVTtBQUN4QixLQUFLLHlCQUFZLElBQUksWUFBWTs7Ozs7OztJQ0o3QixLQUFLO0lBQ0wsU0FBUyxFQUFFO0FBQ2YsV0FBVSxPQUFPO0NBQ2hCLElBQUcsT0FBTztFQUNULFFBQVEsa0JBQWEsT0FBTyxLQUFLO0VBQ2pDLEtBQUssRUFBRSxPQUFPOztFQUVkLE9BQU8sS0FBSyxFQUFFO0VBQ2QsU0FBUyxFQUFFO0VBQ1gsSUFBRyxPQUFPLE9BQU8sR0FBSSxPQUFPLE9BQU87R0FDbEMsT0FBTyxxQ0FBNEI7Ozs7O0FBRXRDLE9BQU8sUUFBUSxFQUFFOztBQUVqQjs7Ozs7QUFJQSxTQUFTLEdBQUk7Q0FDWixLQUFLLGFBQWE7OztBQUVuQjs7Ozs7Ozs7SUNyQkksS0FBSzs7SUFFTDtJQUNBOztBQUVKOztBQUlBO0NBQ0MscUJBQXFCLEVBQUUsT0FBTyxxQkFBcUIsR0FBRyxPQUFPLHdCQUF3QixHQUFHLE9BQU87Q0FDL0Ysc0JBQXNCLEVBQUUsT0FBTztDQUMvQixrREFBMEIsT0FBTztDQUNqQyxrREFBMEIsT0FBTztDQUNqQyx5RUFBbUMsV0FBVyxJQUFJLEtBQUssRUFBRTs7O0FBT3pELFNBTEs7O01BTUosT0FBTztNQUNQLE9BQU8sR0FBRztNQUNWLFdBQVcsRUFBRTtNQUNiLFFBQVE7T0FDUCxXQUFXLEVBQUU7Y0FDYixLQUFLOzs7OztBQVhGO0FBQUE7QUFBQTtBQUFBOztBQWNMO0NBQ0MsSUFBRyxNQUFNLFFBQUcsT0FBTyxRQUFRLE1BQU0sSUFBSTtPQUNwQyxPQUFPLEtBQUs7OztDQUVKLFVBQU8scUJBQWhCOzs7QUFFRDtLQUNLLE1BQU0sT0FBRTtDQUNJLFVBQU8sWUFBdkIsSUFBSSxFQUFFO01BQ04sSUFBSSxFQUFFLFVBQVUsT0FBRTtNQUNsQixJQUFJLEVBQUU7TUFDTixPQUFPO01BQ1AsT0FBTyxFQUFFO0NBQ1Q7Q0FDQSxJQUFHLE1BQU07RUFDUiw0QkFBYzs7R0FDYixJQUFHLGdCQUFTO0lBQ1gsVUFBSztVQUNOLElBQUssS0FBSztJQUNULEtBQUssVUFBSzs7OztNQUNiLE9BQU8sRUFBRTtDQUNUO01BQ0EsT0FBTyxPQUFFLGFBQWEsTUFBSzs7OztBQUc1QjtDQUNDLFVBQUk7T0FDSCxXQUFXLEVBQUU7RUFDYixTQUFHLE9BQU8sSUFBSTtRQUNiLE9BQU8sRUFBRTs7RUFDViwyQkFBc0I7Ozs7O0FBR3hCOzs7O0FBR0E7Q0FDQyxJQUFHLEtBQUs7RUFDUCxLQUFLLFdBQVc7Ozs7O0FBR25CLEtBQUssT0FBTyxNQUFFO0FBQ2QsS0FBSyxXQUFXOztBQUVoQjtRQUNDLEtBQUs7OztBQUVOO1FBQ0Msc0JBQXNCOzs7QUFFdkI7UUFDQyxxQkFBcUI7Ozs7OztJQUtsQixZQUFZLEVBQUU7O0FBRWxCO0NBQ0M7O0NBRUEsS0FBSyxLQUFLLGVBQWMsT0FBTyxHQUFHLGNBQWEsVUFBVTtDQUN6RCxNQUFLLFlBQVksR0FBRztFQUNuQixLQUFLLFdBQVcsR0FBSSxLQUFLLFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBY2hDLEtBQUssWUFXVixTQVhVOztNQVlULElBQUksRUFBRTtNQUNOLFFBQVEsRUFBRTtNQUNWLFFBQVEsRUFBRTtNQUNWLFFBQVEsRUFBRTtNQUNWLFFBQVEsc0JBQUs7TUFDYixRQUFRLDRCQUFTLEtBQUs7O01BRXRCLElBQUksRUFBRTtNQUNOLE9BQU87TUFDUCxXQUFXLEVBQUU7TUFDYixXQUFXLEVBQUU7TUFDYixPQUFPLEVBQUU7TUFDVCxTQUFTLEVBQUU7O01BRU4sUUFBUSxPQUFPLFFBQVE7Ozs7SUF4QnpCLFFBQVEsRUFBRTs7QUFFZCxLQUpVO1FBS1QsS0FBSyxLQUFLLGFBQWE7Ozs7Ozs7O0FBTG5CLEtBQUs7QUFBTCxLQUFLO0FBQUwsS0FBSzs7Ozs7O0FBQUwsS0FBSztBQUFMLEtBQUs7QUFBTCxLQUFLOzs7Ozs7QUFBTCxLQUFLO0FBQUwsS0FBSztBQUFMLEtBQUs7Ozs7OztBQUFMLEtBQUs7QUFBTCxLQUFLOztBQWtDVixLQWxDVTtDQW1DRyxJQUFHLEtBQUssUUFBSSxTQUF4Qjs7OztBQUdELEtBdENVO0NBdUNULG1CQUFjO01BQ2QsWUFBWSxFQUFFO0NBQ2QsSUFBRyxLQUFLLFFBQUk7T0FDWCxZQUFZLEVBQUUsaUJBQWlCLFdBQVcsV0FBVzs7Ozs7QUFHdkQsS0E3Q1U7Q0E4Q1QsU0FBRyxRQUFRLEdBQUksS0FBSSxLQUFLO1NBQ3ZCLEtBQUssT0FBTztRQUNiLE1BQU0sTUFBSSxHQUFJO1NBQ2IsS0FBSyxTQUFTOzs7Ozs7Ozs7QUFNaEIsS0F2RFU7YUF3RFQ7Ozs7Ozs7O0FBTUQsS0E5RFU7YUErRFQ7Ozs7Ozs7O0FBTUQsS0FyRVU7OztDQXNFUyxJQUFHLFFBQVEsSUFBSSxHQUFHLG1CQUFwQyxZQUFNLFFBQVE7Q0FDYyxJQUFHLFFBQVEsU0FBUyxHQUFHLG1CQUFuRCxpQkFBVyxRQUFRO0NBQ0ssSUFBRyxRQUFRLE9BQU8sR0FBRyxtQkFBN0MsZUFBUyxRQUFROzs7Ozs7Ozs7O0FBUWxCLEtBaEZVO01BaUZULFFBQVEsRUFBRTtDQUNWLFVBQUk7RUFDSDs7Ozs7Ozs7Ozs7O0FBU0YsS0E1RlU7TUE2RlQ7TUFDQSxRQUFRO01BQ1IsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXFCWCxLQXBIVTtNQXFIVDtNQUNBLElBQUksRUFBRTs7Q0FFTixJQUFHO09BQ0YsV0FBVyxFQUFFOzs7Q0FFZDs7Q0FFQSxTQUFHLEtBQUssUUFBSTtFQUNYOzs7OztBQUdGLEtBaklVO0NBa0lULFVBQU87T0FDTixXQUFXLEVBQUU7RUFDYixLQUFLLE9BQU87Ozs7Ozs7Ozs7Ozs7O0FBV2QsS0EvSVU7eUNBK0llO0NBQ3hCLFVBQU87T0FDTixRQUFRLEVBQUU7T0FDVixRQUFRLE9BQUUsUUFBUTtPQUNsQixRQUFRLE9BQU87T0FDZix3QkFBUyxlQUFULFFBQVM7RUFDVCxLQUFLLFdBQVc7O0VBRWhCLFNBQUc7R0FDRixLQUFLLE9BQU87OztFQUViLFNBQUcsVUFBVSxTQUFLO1FBQ2pCLFlBQVksRUFBRSxpQkFBaUIsV0FBVyxnQkFBVzs7O0VBRXRELElBQUc7UUFDRixLQUFLO1NBQ04sU0FBSztHQUNKOzs7Ozs7Ozs7O0FBTUgsS0F0S1U7Q0F1S1QsU0FBRztPQUNGLFFBQVEsRUFBRTtPQUNWLFFBQVEsT0FBTyxPQUFFO01BQ2IsSUFBSSxFQUFFLEtBQUssV0FBVztFQUMxQixJQUFHLElBQUksR0FBRztHQUNULEtBQUssV0FBVyxPQUFPLElBQUk7OztFQUU1QixTQUFHO0dBQ0YsS0FBSyxTQUFTOzs7RUFFZixTQUFHO0dBQ0YsbUJBQWM7UUFDZCxZQUFZLEVBQUU7OztPQUVmLHdCQUFTLGlCQUFULFFBQVM7Ozs7O0FBR1gsS0F4TFU7YUF5TFQ7OztBQUVELEtBM0xVO0NBNExUO0NBQ0EsS0FBSyxXQUFXOzs7O0FBR2pCLEtBaE1VO0NBaU1HLFVBQUksUUFBUSxRQUFHOztDQUUzQixTQUFHLG1CQUFZO0VBQ1QsU0FBRyxRQUFRLGFBQWhCO1FBQ0QsU0FBSyxtQkFBWTtFQUNoQixTQUFHLFFBQVEsU0FBUyxNQUFNLEdBQUksTUFBTSxNQUFNLEdBQUcsT0FBTyxHQUFHO0dBQ3REOzs7RUFFRDs7Ozs7Ozs7OztJQ3BUQyxLQUFLOzs7O0FBSVQsS0FBSyxXQUFXLE1BQUUsS0FBSzs7Ozs7Ozs7O0FBU3ZCOzs7O0FBR0E7Ozs7Ozs7O0lDaEJJLEtBQUs7O0FBRUgsS0FBSyxrQkFDVixTQURVO01BRVQsU0FBUyxFQUFFO01BQ1gsU0FBUyxFQUFFO01BQ1gsU0FBUztNQUNULGVBQWUsRUFBRTs7OztBQUdsQixLQVJVO2FBU1Q7OztBQUVELEtBWFU7YUFZVDs7O0FBRUQsS0FkVTthQWVUOzs7QUFFRCxLQWpCVTthQWtCVCxTQUFTLE9BQUU7OztBQUVaLEtBcEJVO0NBcUJGO2FBQ1AsZUFBZSxFQUFFOzs7QUFFbEIsS0F4QlU7aUNBd0JVO0NBQ1o7Q0FDQSxNQUFJLE9BQU0sR0FBSSxlQUFRLEdBQUc7O0NBRWhDLFVBQUksU0FBUyxRQUFJLGdCQUFnQixHQUFHO0VBQ25DOzs7Q0FFRCxVQUFJLFNBQVMsR0FBRyxPQUFPLFFBQUksU0FBUztFQUNuQzs7O01BRUQsU0FBUyxFQUFFO01BQ1gsU0FBUyxFQUFFOzs7O0FBR1osS0F0Q1U7Ozs7QUF5Q1YsS0F6Q1U7S0EwQ0wsTUFBTSxFQUFFO0tBQ1IsS0FBSyxFQUFFLFNBQVM7S0FDaEIsTUFBTSxFQUFFLEtBQUs7O0NBRWpCLDRCQUFVOztFQUNULElBQUcsR0FBRyxHQUFJLEdBQUc7R0FDWixTQUFHLFNBQVMsUUFBUSxHQUFHLE1BQU0sSUFBSTtTQUNoQyxVQUFVLEdBQUc7Ozs7Ozs7QUFHakIsS0FwRFU7TUFxRFQsU0FBUyxLQUFLO0NBQ2QsS0FBSyxNQUFNLEdBQUcsS0FBSztDQUNSLElBQUcsS0FBSyxTQUFuQixLQUFLOzs7O0FBR04sS0ExRFU7S0EyREwsTUFBTSxFQUFFO0tBQ1IsS0FBSyxFQUFFLFNBQVM7Q0FDcEIsbUNBQWU7O0VBQ2QsS0FBTyxTQUFTLGdCQUFnQixTQUFTLEtBQUs7R0FDN0MsS0FBSyxNQUFNLEVBQUUsS0FBSyxNQUFNLEVBQUUsQ0FBQyxLQUFLO0dBQ2hDLElBQUcsS0FBSyxRQUFRLEdBQUksS0FBSztJQUN4QixLQUFLO1VBQ04sSUFBSyxLQUFLOztJQUVULEtBQUs7O1FBQ04sU0FBUyxHQUFHLEVBQUU7R0FDZDs7OztDQUVGLElBQUc7T0FDRixTQUFTLE9BQUUsU0FBUywrQkFBaUI7Ozs7Ozs7Ozs7O0lDM0VwQyxLQUFLOztBQUVULEtBQUssVUFBVTs7QUFFZixLQUFLLFVBQVUsRUFBRTtBQUNqQixLQUFLLFVBQVUsRUFBRTtBQUNqQixLQUFLLGFBQWEsRUFBRTtBQUNwQixLQUFLLFlBQVksRUFBRTtBQUNuQixLQUFLLGNBQWMsRUFBRTtBQUNyQixLQUFLLGFBQWEsRUFBRTs7Ozs7O0FBS3BCO0NBQ0M7U0FDQyxPQUFPOzs7Ozs7OztBQU9UOzBCQUNLLEtBQUssV0FBUzs7O0FBRW5CO0NBQ0MsTUFBTSxNQUFNLEVBQUU7Q0FDZCxNQUFNLE9BQU8sRUFBRTtRQUNSOzs7Ozs7O0FBS1I7Q0FDQyxnQkFBUyxLQUFLLFdBQVM7Q0FDdkIsS0FBSyxZQUFZLEtBQUs7Q0FDdEIsS0FBSyxXQUFXLE9BQU8sS0FBSztDQUM1QixLQUFLLFlBQVUsbUJBQWtCLE9BQUssU0FBUztDQUMvQyxLQUFLLFdBQVc7UUFDVDs7OztBQUdSO0NBQ0MsSUFBRyxLQUFLLEdBQUksS0FBSyxTQUFTLEdBQUc7U0FDckI7O1FBQ0QsS0FBSyxXQUFTLGVBQWU7Ozs7Ozs7O0FBTS9CLEtBQUssTUErRVYsU0EvRVU7TUFnRkosT0FBTTtNQUNOLEVBQUUsRUFBRSxTQUFTO01BQ2IsSUFBSSxPQUFFLFFBQVEsRUFBRTtNQUNyQixPQUFPLEVBQUU7TUFDSixNQUFNLEVBQUU7Q0FDYjs7OztBQW5GRCxLQUZVO0tBR0wsSUFBSSxFQUFFLEtBQUssV0FBUyxtQkFBYyxVQUFVO0NBQ2hELFNBQUc7TUFDRSxJQUFJLE9BQUUsU0FBUztFQUNDLElBQUcsT0FBdkIsSUFBSSxVQUFVLEVBQUU7O1FBQ2pCOzs7QUFFRCxLQVRVO0tBVUwsTUFBTSxRQUFHLCtCQUFjO1FBQzNCLE1BQU0sVUFBVTs7O0FBRWpCLEtBYlU7c0JBY0ssYUFBVzs7O0FBRTFCLEtBaEJVO2FBaUJULCtCQUFjOzs7Ozs7O0FBS2YsS0F0QlU7Q0F1QlQsTUFBTSxVQUFVLEVBQUU7O0NBRWxCLFNBQUc7RUFDRixNQUFNLFVBQVUsT0FBRTtFQUNsQixNQUFNLFNBQVMsT0FBRSxTQUFTOztFQUUxQixJQUFHLE1BQU07VUFDUixNQUFNLFNBQVMsS0FBSyxNQUFNOzs7RUFFM0IsTUFBTSxVQUFVLEVBQUUsTUFBTTtFQUN4QixNQUFNLFVBQVUsRUFBRTtTQUNsQixNQUFNLFNBQVM7Ozs7Ozs7Ozs7O0FBUWpCLEtBMUNVO0tBMkNMLEtBQUssRUFBRSxLQUFLLElBQUk7S0FDaEIsU0FBVSxPQUFPLE1BQU8sR0FBRyxLQUFLO0tBQ2hDLFVBQVUsT0FBTyxPQUFPLEdBQUcsS0FBSztLQUNoQyxVQUFVLE9BQU8sT0FBTyxHQUFHLEtBQUs7S0FDaEMsU0FBVSxPQUFPOztLQUVqQixLQUFLLE9BQU87O0NBRWhCLElBQUcsVUFBVSxHQUFHLFVBQVUsR0FBRyxTQUFTLEdBQUc7O09BRW5DLElBQUk7R0FDUixTQUFRLE1BQU0sVUFBVyxNQUFNLEVBQUUsS0FBSzs7SUFFckMsS0FBSyxXQUFXOzs7R0FFakIsV0FBWSxNQUFNLEVBQUUsS0FBSztTQUNuQixNQUFNLEdBQUcsS0FBSztTQUNkOzs7UUFFRDs7Ozs7O0NBSVA7RUFDQyxJQUFHO0dBQ0YsSUFBRyxLQUFLLFNBQVMsR0FBSSxLQUFLLFNBQVMsbUJBQW9CLElBQUk7SUFDMUQsS0FBSyxTQUFTOzs7R0FFZixJQUFHLEtBQUs7SUFDUCxLQUFLLFVBQVUsVUFBVTs7OztFQUUzQjs7R0FDNEIsaUJBQVksVUFBdkMsS0FBSyxPQUFPLFNBQVM7Ozs7Ozs7VUEzRW5CLEtBQUs7VUFBTCxLQUFLO1VBQUwsS0FBSztBQUFMLEtBQUs7QUFBTCxLQUFLOztBQTZGVixLQTdGVTthQThGVDs7O0FBRUQsS0FoR1U7Q0FpR1QsSUFBSSxLQUFLO01BQ1QsS0FBSyxFQUFFOzs7O0FBR1IsS0FyR1U7YUFzR1Q7OztBQUVELEtBeEdVO2FBeUdULGVBQVUsUUFBUTs7Ozs7Ozs7Ozs7O0FBVW5CLEtBbkhVO01Bb0hULFVBQUssS0FBSyxFQUFFOzs7Ozs7Ozs7QUFPYixLQTNIVTtNQTRIVCxNQUFNLEVBQUU7Ozs7Ozs7O0FBS1QsS0FqSVU7YUFrSVQ7Ozs7Ozs7QUFLRCxLQXZJVTtDQXdJVCxTQUFRLE9BQUssR0FBRztPQUNmLEtBQUssVUFBVSxFQUFFOzs7Ozs7Ozs7QUFLbkIsS0E5SVU7YUErSVQsS0FBSzs7O0FBRU4sS0FqSlU7S0FrSkwsU0FBUyxPQUFFO0tBQ1gsS0FBSyxFQUFFLFNBQVM7O0NBRXBCLElBQUcsS0FBSyxFQUFFO0VBQ1QsSUFBRyxLQUFLLEdBQUc7R0FDVixLQUFLLEVBQUUsU0FBUyxNQUFNLEVBQUUsU0FBUzs7R0FFakMsS0FBSyxFQUFFOztFQUNSLEtBQUssRUFBRSxTQUFTOzs7Q0FFakIsU0FBUyxNQUFNLEVBQUU7Q0FDVSxJQUFHLFFBQTlCLFFBQVEsTUFBTSxFQUFFLEtBQUs7Ozs7O0FBSXRCLEtBaktVO0NBa0tULElBQUcsR0FBRyxHQUFHO0VBQ1IsV0FBSSxHQUFHLEVBQUU7Ozs7O0FBRVgsS0FyS1U7UUFzS1QsV0FBSTs7Ozs7Ozs7OztBQVFMLEtBOUtVO0tBK0tMLElBQUksRUFBRSxXQUFJLGFBQWE7O0NBRTNCLElBQUcsSUFBSSxHQUFHO0VBQ1Q7UUFDRCxJQUFLLE1BQU0sR0FBRyxLQUFLLEdBQUcsTUFBTSxJQUFJO0VBQy9CLFdBQUksYUFBYSxLQUFLOztFQUV0QixXQUFJLGdCQUFnQjs7Ozs7QUFHdEIsS0F6TFU7Q0EwTFQsU0FBUSxHQUFFO09BQ0osR0FBRSxrQkFBaUIsS0FBSzs7T0FFN0IsZUFBZSxHQUFJLEtBQUs7Ozs7O0FBRzFCLEtBaE1VO0tBaU1MLElBQUksT0FBRSxlQUFlLEdBQUc7O0NBRTVCLElBQUcsSUFBSSxHQUFHO0VBQ1QsSUFBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLE1BQU0sSUFBSTtHQUM3QixXQUFJLGVBQWUsR0FBRyxLQUFLOztHQUUzQixXQUFJLGtCQUFrQixHQUFHOzs7Ozs7Ozs7OztBQU81QixLQTlNVTtRQStNVCxXQUFJLGdCQUFnQjs7Ozs7Ozs7O0FBT3JCLEtBdE5VO1FBdU5ULFdBQUksYUFBYTs7OztBQUdsQixLQTFOVTtRQTJOVCxXQUFJLGVBQWUsR0FBRzs7OztBQUd2QixLQTlOVTtLQStOTCxPQUFPLEVBQUUsS0FBSyxTQUFTO0NBQzNCLFNBQVEsbUJBQVk7T0FDZCxRQUFRLE1BQU07O09BRW5CLEtBQUssYUFBYSxJQUFJOzs7Ozs7QUFJeEIsS0F2T1U7YUF3T1QsS0FBSyxhQUFhOzs7Ozs7OztBQU1uQixLQTlPVTtNQStPVCxZQUFZLFFBQVM7Ozs7Ozs7Ozs7QUFRdEIsS0F2UFU7O01BeVBULE9BQU8sRUFBRTs7Ozs7Ozs7O0FBT1YsS0FoUVU7Q0FpUVQsVUFBTzs7RUFFTixTQUFRLE9BQU8sR0FBRyxLQUFLLElBQUksVUFBVTtRQUMvQixPQUFPLE9BQU87O09BQ2Y7OztNQUVELFNBQVMsT0FBRSxVQUFVLEVBQUU7Ozs7QUFHN0IsS0ExUVU7UUEyUVQ7Ozs7Ozs7OztBQU9ELEtBbFJVO0tBbVJMLEtBQUssRUFBRTtDQUNPLElBQUcsS0FBSyxnQkFBMUIsWUFBWTs7Ozs7Ozs7OztBQVFiLEtBNVJVO0tBNlJMLElBQUksRUFBRTtLQUNOLEdBQUcsRUFBRSxNQUFNLEtBQUssR0FBRztDQUN2QixJQUFHLEdBQUcsR0FBSSxHQUFHLFdBQVcsR0FBRztFQUMxQixJQUFJLFlBQVk7RUFDaEIsS0FBSyxXQUFXLE9BQU8sR0FBRyxLQUFLLEdBQUc7Ozs7Ozs7OztBQU1wQyxLQXZTVTtDQXdTVCxTQUFHLEtBQUs7Y0FDaUMsS0FBSztRQUE3QyxLQUFLLGlCQUFZLEtBQUs7O0VBQ3RCLEtBQUssV0FBVyxPQUFPOztNQUN4QixPQUFPLE9BQUUsT0FBTyxFQUFFOzs7Ozs7Ozs7OztBQVNuQixLQXBUVTtDQXFUVCxZQUFHO0VBQ0YsV0FBSSxZQUFZLEtBQUssV0FBUyxlQUFlO1FBQzlDLElBQUs7RUFDSixXQUFJLFlBQVksS0FBSyxLQUFLLEdBQUc7RUFDN0IsS0FBSyxXQUFXLE9BQU8sS0FBSyxLQUFLLEdBQUc7Ozs7Ozs7Ozs7O0FBUXRDLEtBalVVO0NBa1VULFlBQUc7RUFDRixLQUFLLEVBQUUsS0FBSyxXQUFTLGVBQWU7OztDQUVyQyxJQUFHLEtBQUssR0FBSTtFQUNYLFdBQUksY0FBZSxLQUFLLEtBQUssR0FBRyxPQUFRLElBQUksS0FBSyxHQUFHO0VBQ3BELEtBQUssV0FBVyxPQUFPLEtBQUssS0FBSyxHQUFHOzs7Ozs7Ozs7Ozs7QUFTdEMsS0FoVlU7O0NBaVZhLElBQU8sSUFBSSxFQUFFLGlCQUFuQyxJQUFJOzs7Ozs7Ozs7O0FBUUwsS0F6VlU7YUEwVlQsS0FBSzs7Ozs7Ozs7QUFNTixLQWhXVTtNQWlXVCxPQUFPLEVBQUU7TUFDVCxLQUFLLFlBQVksR0FBRyxJQUFJLEdBQUcsS0FBSyxHQUFHLFlBQUssSUFBSSxjQUFjOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQjNELEtBcFhVO0NBcVhULElBQUcsZUFBUTtFQUNHOytCQUFiLFFBQVEsRUFBRTs7Ozs7Q0FHWCxjQUFhLE9BQU8sR0FBRztPQUN0Qix3QkFBb0IsS0FBTTs7OztDQUczQixJQUFHO2NBQ0ssd0JBQW9COzs7S0FFeEIsUUFBUSxFQUFFLFdBQUk7O0NBRWxCLE1BQU87RUFDTixRQUFRO0VBQ1IsOEJBQWEsV0FBSTs7R0FDaEIsSUFBRyxJQUFJLEtBQUssT0FBTyxFQUFFLEdBQUc7SUFDdkIsUUFBUSxLQUFLLFlBQVksSUFBSSxLQUFLLE1BQU0sS0FBSyxFQUFFLElBQUk7Ozs7O1FBRS9DOzs7Ozs7Ozs7QUFPUixLQS9ZVTs7Ozs7Ozs7OztBQXVaVixLQXZaVTs7Ozs7Ozs7Ozs7QUFnYVYsS0FoYVU7Ozs7Ozs7Ozs7QUF3YVYsS0F4YVU7Q0F5YVQ7Ozs7Ozs7Ozs7OztBQVVELEtBbmJVO0NBb2JUOzs7Ozs7Ozs7Ozs7Ozs7O0FBY0QsS0FsY1U7Ozs7O0FBc2NWLEtBdGNVO0NBdWNULElBQUcsUUFBUSxRQUFHO09BQ2IsT0FBTyxFQUFFO09BQ1QsVUFBVSxFQUFFOzs7Ozs7Ozs7OztBQVFkLEtBamRVOzs7Ozs7O0FBdWRWLEtBdmRVOzs7Ozs7OztBQTZkVixLQTdkVTthQThkVCxLQUFLOzs7Ozs7Ozs7O0FBUU4sS0F0ZVU7OztDQXllVCxjQUFhLE9BQU8sR0FBRztFQUN0QixTQUFHLEtBQUssVUFBVSxTQUFTLE1BQU0sT0FBSztRQUNyQyxLQUFLLFVBQVUsT0FBTzs7OztFQUdFLFVBQU8sS0FBSyxVQUFVLFNBQVMsY0FBeEQsS0FBSyxVQUFVLElBQUk7Ozs7Ozs7Ozs7QUFPckIsS0FyZlU7TUFzZlQsS0FBSyxVQUFVLE9BQU87Ozs7Ozs7OztBQU92QixLQTdmVTtNQThmVCxLQUFLLFVBQVUsT0FBTzs7Ozs7Ozs7O0FBT3ZCLEtBcmdCVTthQXNnQlQsS0FBSyxVQUFVLFNBQVM7Ozs7QUFHekIsS0F6Z0JVO0tBMGdCTCxFQUFFLE9BQUU7S0FDSixLQUFLLEVBQUUsRUFBRTs7Q0FFYixJQUFHLEtBQUssS0FBSztPQUNaLEtBQUssVUFBVSxJQUFJO0VBQ25CLEVBQUUsTUFBTSxFQUFFO1FBQ1gsSUFBSyxLQUFLLEtBQUs7T0FDZCxLQUFLLFVBQVUsT0FBTztFQUN0QixFQUFFLE1BQU0sRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFjWixLQWhpQlU7S0FpaUJMLE1BQU0sT0FBRTtLQUNSLEtBQUssRUFBRSxNQUFNO0NBQ2pCLElBQUcsS0FBSyxHQUFHO0VBQ0csSUFBRyxhQUFoQixPQUFPO0VBQ0ssSUFBRyxjQUFmLEtBQUs7RUFDTCxNQUFNLE1BQU0sRUFBRTs7Ozs7Ozs7Ozs7OztBQVVoQixLQWhqQlU7Y0FpakJULDZDQUFjLEtBQUssd0JBQW5COzs7Ozs7Ozs7Ozs7QUFVRCxLQTNqQlU7OENBMmpCc0I7Q0FDL0IsaUJBQVUsVUFBVSxTQUFTOzs7Ozs7Ozs7QUFPOUIsS0Fua0JVO0NBb2tCWSxTQUFHLGNBQXhCLGlCQUFVOzs7Ozs7Ozs7O0FBUVgsS0E1a0JVO1FBNmtCVCxLQUFLLGFBQWEsV0FBSTs7Ozs7Ozs7QUFNdkIsS0FubEJVOztDQW9sQlQsbUNBQVksS0FBSzs7V0FDaEIsS0FBSyxLQUFLLEdBQUcsS0FBSyxhQUFhOzs7OztBQUVqQyxLQXZsQlU7UUF3bEJULEtBQUssa0JBQWEsS0FBSyxjQUFjOzs7QUFFdEMsS0ExbEJVO0tBMmxCTCxNQUFNO0NBQ1YsaUNBQVksS0FBSyxpQkFBaUI7RUFDakMsTUFBTSxLQUFNLEtBQUssYUFBYTs7UUFDeEI7Ozs7Ozs7O0FBTVIsS0FwbUJVOztDQXFtQlQsSUFBRyxlQUFRO1NBQ0g7OztDQUVRLElBQUcsSUFBSSxpQkFBVSxZQUFqQyxJQUFJLEVBQUUsSUFBSTtDQUNWLElBQU8sR0FBRyxRQUFHLEtBQUssUUFBUSxRQUFHLEtBQUssZ0JBQWdCLFFBQUcsS0FBSyxzQkFBc0IsUUFBRyxLQUFLLGtCQUFrQixRQUFHLEtBQUs7U0FDMUcsR0FBRyxVQUFLLEtBQUs7Ozs7Ozs7Ozs7QUFPdEIsS0FqbkJVO1FBa25CVCxLQUFLLGtCQUFhLEtBQUssUUFBUTs7Ozs7Ozs7QUFNaEMsS0F4bkJVO1FBeW5CVCxXQUFJLFNBQVMsS0FBSyxLQUFLLEdBQUc7Ozs7Ozs7OztBQU8zQixLQWhvQlU7Ozs7Q0Fpb0JULEtBQUssUUFBUTtDQUNiLFNBQVMsVUFBVSxLQUFLLE1BQU0sUUFBUSxJQUFLOzs7O0FBRzVDLEtBcm9CVTtDQXNvQlQsSUFBRyxlQUFRO0VBQ0Q7K0JBQVQsSUFBSSxFQUFFOzs7OztLQUdILEtBQUssRUFBRSxLQUFLLFVBQVUsS0FBSyxHQUFHOztDQUVsQyxJQUFHLElBQUksR0FBRztFQUNULFdBQUksTUFBTSxlQUFlO1FBQzFCLElBQUssSUFBSSxHQUFHLFVBQVUsYUFBYyxPQUFPLEdBQUc7U0FDdEMsV0FBSSxNQUFNOztFQUVqQixZQUFHLHNDQUFlLEdBQUksS0FBSztHQUMxQixXQUFJLE1BQU0sTUFBTSxFQUFFLElBQUk7O0dBRXRCLFdBQUksTUFBTSxNQUFNLEVBQUU7Ozs7OztBQUdyQixLQXZwQlU7YUF3cEJULHFCQUFxQjs7O0FBRXRCLEtBMXBCVTthQTJwQlQ7Ozs7Ozs7Ozs7QUFRRCxLQW5xQlU7O2dCQW9xQkQsS0FBSyxPQUFPLFFBQVEsaUJBQWdCOzs7Ozs7OztBQU03QyxLQTFxQlU7Q0EycUJULFdBQUk7Ozs7Ozs7OztBQU9MLEtBbHJCVTtDQW1yQlQsV0FBSTs7OztBQUdMLEtBdHJCVTtRQXVyQlQsV0FBSTs7OztBQUdOLEtBQUssSUFBSSxVQUFVLFdBQVcsRUFBRSxLQUFLOztBQUUvQixLQUFLLFNBQVgsU0FBVyxpQkFBUyxLQUFLOztjQUFuQixLQUFLLE9BQVMsS0FBSztBQUV4QixLQUZVOzs7O0FBS1YsS0FMVTtLQU1MLElBQUksRUFBRSxLQUFLLFdBQVMsZ0JBQWdCLHlCQUFhO0tBQ2pELElBQUksT0FBRSxTQUFTO0NBQ1MsSUFBRyxPQUEvQixJQUFJLFVBQVUsUUFBUSxFQUFFO1FBQ3hCOzs7QUFFRCxLQVhVO0NBWVQsTUFBTSxVQUFVLEVBQUU7Q0FDbEIsaUJBQUcsTUFBTSxNQUFTLEtBQUs7RUFDdEIsTUFBTSxVQUFVLEVBQUUsTUFBTTtTQUN4QixNQUFNLFNBQVM7O0VBRWYsTUFBTSxVQUFVLE9BQUU7TUFDZCxVQUFVLE1BQU0sRUFBRSxNQUFNLE1BQU07U0FDbEMsTUFBTSxTQUFTLE9BQUUsU0FBUyxPQUFPOzs7O0FBRXBDLEtBQUssVUFBVSx3a0JBQXdrQjtBQUN2bEIsS0FBSyxpQkFBaUIsaUNBQWlDO0FBQ3ZELEtBQUssU0FBUyx5SEFBeUg7O0FBRXZJLEtBQUssV0FBVzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXFCaEIsS0FBSyxXQUFXOzs7Ozs7Ozs7Ozs7OztBQWFoQjtDQUNDOzBCQUNDLElBQUksZUFBSixJQUFJLEtBQU0sS0FBVixJQUFJOzs7Q0FFTCxJQUFJLFVBQVUsRUFBRSxPQUFPLE9BQU8sSUFBSTtDQUNsQyxJQUFJLFVBQVUsRUFBRSxJQUFJLFVBQVUsVUFBVSxFQUFFLElBQUk7Q0FDOUMsSUFBSSxVQUFVLFlBQVksRUFBRTtDQUNYLElBQUcsSUFBSSxXQUF4QixJQUFJLFFBQVE7UUFDTDs7O0FBRVI7O09BRU8sV0FBVyxJQUFJOzs7OztBQUd0QjtnQ0FDa0IsS0FBSyxNQUFNOzs7O0FBR3ZCLEtBQUssT0FFVixTQUZVOzs7O0FBS1YsS0FMVTtLQU1MLE1BQU0sRUFBRSxPQUFPO0NBQ25CLE1BQU0sUUFBUTtRQUNQOzs7QUFFUixLQVZVO2lCQVdBLEVBQUUsS0FBSyxlQUFhLFFBQUcsZ0JBQWdCOzs7QUFFakQsS0FiVTtLQWNMLE1BQU0sRUFBRSxPQUFPO0NBQ25CLE1BQU0sUUFBUTtDQUNkLE1BQU0sSUFBSSxFQUFFO1VBQ0gsRUFBRSxLQUFLLGVBQWEsRUFBRTtRQUN4Qjs7O0FBRVIsS0FwQlU7c0JBcUJULEtBQVEsS0FBSzs7O0FBRWQsS0F2QlU7OztDQXdCVCxJQUFHLEtBQUssR0FBSSxLQUFLO0VBQ2hCLEtBQUssRUFBRTtFQUNQLEtBQUssRUFBRTs7O0NBRVIsU0FBUTtFQUNQLFFBQVEsMEJBQTBCOzs7O0tBRy9CO0tBQ0EsS0FBSyxFQUFFO0tBQ1AsTUFBTSxFQUFFLEtBQUs7Q0FDakIsSUFBSSxNQUFNLEdBQUc7RUFDWixHQUFHLEVBQUUsU0FBUyxPQUFPLEVBQUU7RUFDdkIsS0FBSyxFQUFFLFNBQVMsT0FBTyxNQUFNLEVBQUU7RUFDL0IsSUFBRyxHQUFHLFNBQVMsS0FBSztHQUNuQixLQUFLOzs7O0NBRVAscUJBQVMsU0FBUzs7S0FFZCxVQUFVLFdBQUUsZ0RBQWtCLFlBQVksUUFBUTtLQUNsRCxRQUFRLEVBQUU7O0NBRWQsUUFBUSxNQUFNLEVBQUU7Q0FDaEIsUUFBUSxVQUFVLEVBQUU7O0NBRXBCLElBQUcsS0FBSyxHQUFHO0VBQ1YsS0FBSyxXQUFXLEtBQUssTUFBTSxJQUFJLEVBQUU7T0FDNUIsTUFBTSxFQUFFO1FBQ2QsSUFBSyxLQUFLLEdBQUcsR0FBRyxLQUFLLEdBQUc7RUFDdkIsUUFBUSxVQUFVLEVBQUU7O0VBRXBCLFFBQVEsVUFBVSxNQUFNLEVBQUUsU0FBUztPQUM5QixVQUFVLEVBQUU7OztDQUVsQixTQUFTLFFBQVE7O0NBRWpCLElBQUc7RUFDRixLQUFLLEtBQUssUUFBUSxRQUFTLFFBQVEsS0FBSztFQUN4QixJQUFHLFFBQVEsV0FBM0IsUUFBUTtPQUNSLFlBQVk7O1FBQ047OztBQUVSLEtBbEVVO2FBbUVULFVBQVUsS0FBSyxLQUFLOzs7QUFFckIsS0FyRVU7OztLQXNFTCxNQUFNLFlBQUcsZ0RBQWtCLFlBQVksUUFBUTs7Q0FFSCxJQUFHLFFBQW5ELEtBQUssR0FBSSxLQUFLLEtBQUssTUFBTSxNQUFNLE1BQU07Q0FDdEIsSUFBRyxNQUFNLFlBQXhCLE1BQU07TUFDTixZQUFZO1FBQ0w7OztBQUVSLEtBN0VVOztzQkE4RVQsUUFBUSx5QkFBVzs7O0FBRXBCLEtBaEZVOztLQWlGTCxNQUFNLE9BQU87Q0FDakIsTUFBTztFQUNOLElBQUcsS0FBSyxPQUFPLEVBQUUsR0FBRztHQUNuQixNQUFNLE9BQUUsVUFBVTtTQUVuQixJQUFLLEtBQUssVUFBVSxRQUFRLE1BQU0sR0FBRztHQUNwQyxNQUFNLE9BQUUsVUFBVTs7R0FFbEIsSUFBTyxNQUFNLEVBQUUsS0FBSyxXQUFXO0lBQzlCLDhCQUFZLE1BQU07S0FDakIsS0FBSyxLQUFLLE1BQU07Ozs7R0FFbEIsSUFBTyxNQUFNLEVBQUUsS0FBSyxXQUFXO0lBQzlCLDhCQUFZLE1BQU07S0FDakIsS0FBSyxLQUFLLE1BQU0sZUFBVTs7Ozs7UUFDdkI7OztBQUVSLEtBbEdVO0tBbUdMO0NBQ0osSUFBRyxnQkFBUztFQUNYLElBQUksRUFBRTs7RUFFTjtHQUNzQyxVQUFPLFlBQVksMkNBQTNCOztFQUM5QixJQUFJLE9BQUUsWUFBWTs7UUFDbkIsSUFBSSxNQUFNOzs7O0FBR1o7S0FDSyxLQUFLLEVBQUU7S0FDUDtDQUNKLElBQUcsZ0JBQVM7RUFDWCxLQUFLLEVBQUU7O0VBRVA7R0FDc0MsS0FBTyxLQUFLLEtBQUssWUFBWSwyQ0FBckM7O0VBQzlCLEtBQUssRUFBRSxLQUFLLEtBQUssWUFBWTs7O0NBRTlCLElBQUcsZUFBUTtFQUNWLE9BQU8sRUFBRSxJQUFJO1FBQ2QsSUFBSyxnQkFBUyxLQUFLO0VBQ2xCLE9BQU8sRUFBRTs7RUFFVCxPQUFPLEdBQUUsSUFBSSxHQUFJLEtBQUssR0FBRyxhQUFZLElBQUksVUFBUyxJQUFJLEdBQUksSUFBSSxLQUFLLEdBQUc7OztLQUVuRSxLQUFLLEVBQUUsS0FBSyxNQUFNOztDQUV0QixJQUFHLGVBQVE7RUFDVixJQUFJO0VBQ0osS0FBSyxLQUFLLEVBQUU7Ozs7O0NBSWIsSUFBRyxJQUFJLEdBQUksSUFBSSxHQUFHO0VBQ2pCLElBQUksS0FBSyxFQUFFOzs7UUFFTDs7O0FBRVI7S0FDSyxLQUFLO0NBQ1QsS0FBSyxLQUFLLEVBQUU7UUFDTDs7S0FFSCxJQUFJLElBQUcsWUFBSyxHQUFHLGFBQVksV0FBSSxlQUFRLFdBQUk7S0FDM0MsS0FBSyxNQUFFLE9BQVcsV0FBSSxXQUFJO0NBQzlCLFdBQUksWUFBSyxFQUFFO1FBQ0o7OztBQUVSO0tBQ0ssSUFBSSxJQUFHLEtBQUssR0FBRyxhQUFZLE9BQU8sSUFBSTtLQUN0QyxLQUFLLE1BQUUsT0FBVyxJQUFJLElBQUk7Q0FDOUIsSUFBSSxLQUFLLEVBQUU7UUFDSjs7O0FBRVI7S0FDSyxLQUFLO0NBQ1QsS0FBSyxNQUFNLEVBQUU7Q0FDYixLQUFLLEtBQUssSUFBRyxLQUFLLEdBQUcsYUFBWSxPQUFPLElBQUk7Q0FDNUMsSUFBSSxLQUFLLEVBQUU7UUFDSjs7OztBQVNQLFNBTks7TUFPQyxLQUFLLEVBQUU7OztBQU5iO0tBQ0ssS0FBSztDQUNULEtBQUssS0FBSyxFQUFFO1FBQ0w7Ozs7O0FBUVIsU0FGSztNQUdDLE9BQU8sRUFBRTtNQUNULEtBQUssRUFBRTtNQUNQLEtBQUssRUFBRTtNQUNQLEdBQUcsRUFBRTs7Ozs7QUFJWDtLQUNLLEtBQUs7Q0FDVCxLQUFLLE1BQU0sRUFBRTtDQUNiLEtBQUssT0FBTyxFQUFFO0NBQ2QsS0FBSyxNQUFNO1FBQ0o7OztBQUVSO0tBQ0ssS0FBSyxPQUFPO01BQ1gsTUFBTSxPQUFPO0NBQ2xCLEtBQUssT0FBTyxFQUFFO2FBQ0YsTUFBTSxFQUFFOzs7Ozs7OztBQU9yQjtLQUNLLE1BQU0sT0FBTztLQUNiLElBQUksT0FBTztLQUNYLE1BQU0sTUFBRSxPQUFXLE1BQU0sU0FBUztDQUN0Qyw0QkFBWTs7RUFDWCxNQUFNLEtBQUssTUFBTSxFQUFFOztDQUNwQixNQUFNLEdBQUcsRUFBRSxNQUFNO1FBQ1YsTUFBTSxLQUFLLEVBQUU7OztBQUV0QixLQUFLLE9BQU8sRUFBRTtBQUNkLEtBQUssU0FBUyxFQUFFO0FBQ2hCLEtBQUssV0FBVztBQUNoQixLQUFLLEtBQUssTUFBRSxLQUFLO0FBQ2pCLEtBQUssYUFBZSxFQUFFLEtBQUssaUJBQW1CLEVBQUUsS0FBSztBQUNyRCxLQUFLLG9CQUFvQixFQUFFLEtBQUs7O0FBRWhDOzs7UUFDUSxLQUFLLEtBQUssVUFBVSxLQUFLLEtBQUs7OztBQUV0Qzs7O1FBQ1EsS0FBSyxLQUFLLFVBQVUsWUFBSyxLQUFLOzs7QUFFdEM7UUFDUSxLQUFLLEtBQUssVUFBVSxLQUFLOzs7QUFFakM7O0tBQ0ssSUFBSzs7Q0FFVCxJQUFPLE1BQU0sRUFBRSxLQUFLLFdBQVc7RUFDUixJQUFHLE1BQU0sR0FBSSxNQUFNLG1CQUFsQyxNQUFNOzs7RUFHYixJQUFHLElBQUksRUFBRSxLQUFLLFdBQVMsZUFBZTs7O0dBR3JDLEtBQUssRUFBRSxNQUFNLFNBQVMsTUFBRSxNQUFVO0dBQ2xDLEtBQUssT0FBTztVQUNMOzs7RUFFUixJQUFJLEVBQUUsTUFBTTtFQUNaLElBQUksR0FBRyxFQUFFO0VBQ1QsS0FBSyxFQUFFLE1BQU0sU0FBUyxNQUFFLE1BQVU7RUFDbEMsS0FBSyxNQUFJLE9BQU87U0FDVDtRQUNSLElBQUssSUFBSSxFQUFFLEtBQUssV0FBUyxlQUFlO1NBQ2hDLEtBQUssYUFBYTs7OztJQUV2QixXQUFXLFNBQVMsV0FBVzs7O0FBR25DO0NBQ2EsTUFBTyxlQUFaO0NBQ0ksSUFBRyxJQUFJLGVBQVg7Q0FDUyxJQUFHLElBQUksZUFBaEIsSUFBSTtDQUNDLEtBQU8sSUFBSSxtQkFBaEI7O0tBRUgsS0FBSyxFQUFFLElBQUksU0FBUztLQUNwQixLQUFLLEVBQUU7S0FDUCxHQUFHLEVBQUUsS0FBSzs7Q0FFZCxJQUFHLElBQUksR0FBRyxHQUFJLEtBQUssV0FBVyxJQUFJO1NBQzFCLEtBQUssZ0JBQWdCLElBQUk7OztDQUVqQyxJQUFHLFdBQVcsSUFBSSxlQUFRO0VBQ3pCLEtBQUssRUFBRSxHQUFHLG1CQUFtQixFQUFFO1FBQ2hDLElBQUssS0FBSyxVQUFVLFFBQVEsTUFBTSxHQUFHO0VBQ3BDLEtBQUssRUFBRSxHQUFHLFlBQVk7O0VBRXRCLEtBQUssRUFBRSxLQUFLOzs7OztZQUlOLEtBQVMsSUFBSSxNQUFNLE9BQU87Ozs7QUFHbEM7S0FDSyxPQUFPLEVBQUUsT0FBTyxpQkFBaUIsU0FBUzs7Q0FFOUMsOEJBQWdCOztNQUNYLFdBQVcsRUFBRSxTQUFTO01BQ3RCLFVBQVUsRUFBRSxXQUFXLHdDQUEyQixFQUFFOzs7RUFHeEQsSUFBRyxTQUFTLEdBQUc7R0FDTCxJQUFHLE9BQU8sZUFBZTs7OztFQUduQyxLQUFLLFVBQVUsWUFBWSxFQUFFLEtBQUssVUFBVSxXQUFXLEVBQUU7Ozs7O0FBRzNEO0NBQzBCLElBQUcsWUFBNUIsS0FBSzs7O0NBR0wsSUFBRyxTQUFTLElBQUssU0FBUyxnQkFBZ0I7RUFDbEM7O0dBRU47ZUFDUSxpQkFBcUIsRUFBRSxJQUFJLGFBQWEsVUFBSyxLQUFLOzs7R0FFMUQ7SUFDYSxTQUFHLFFBQVE7U0FDdkIsS0FBSyxVQUFVLFNBQUksS0FBSyxzQkFBc0IsRUFBRTs7OztHQUdqRDtJQUNhLFVBQU8sUUFBUTtRQUN2QixNQUFNLE1BQUUsa0JBQXNCLEVBQUUsSUFBSTtTQUN4QyxLQUFLLFVBQVUsT0FBRSxLQUFLLFVBQVUsUUFBUTs7OztHQUd6QztnQkFDQyxRQUFRLFlBQU8sT0FBTyxZQUFPLEtBQUs7OztHQUVuQztJQUNDLGNBQWEsT0FBTyxHQUFHLEVBQUUsT0FBTSxPQUFLLElBQUk7aUJBQ2hDLE9BQU87O2dCQUNSLFFBQVE7Ozs7OztBQUVuQixLQUFLOzs7Ozs7OztJQzluQ0QsS0FBSzs7O0FBR1Q7O0NBRUM7U0FDQyxLQUFLLFdBQVM7Ozs7QUFFVDtDQUNOO1NBQ0M7Ozs7O0FBR0s7Q0FDTjs7U0FDQyxXQUFJLFdBQVc7Ozs7QUFJaEIsU0FGSzs7TUFHSixNQUFNLEVBQUU7TUFDUixNQUFNLEVBQUU7TUFDUixNQUFNLEVBQUUsS0FBSztNQUNiLFFBQVEsRUFBRSxLQUFLLGNBQVM7S0FDcEIsUUFBUSxFQUFFLEtBQUs7Q0FDbkIsS0FBSyxNQUFNLDJCQUFLLElBQUksUUFBUTs7O0FBRTdCO0NBQ2lCLFNBQUcsd0JBQVo7O0tBRUgsR0FBRyxPQUFFO1FBQ0g7RUFDTCxJQUFHLEdBQUc7UUFDTCxTQUFTLEVBQUU7OztFQUVaLEdBQUcsRUFBRSxHQUFHOzthQUNGOzs7QUFFUjtLQUNLLElBQUksRUFBRTtRQUNWLE1BQU0sSUFBSSxTQUFPOzs7QUFFbEI7YUFDQyxNQUFNOzs7QUFFUDtLQUNLLEtBQUssT0FBTztDQUNKLE1BQU8sZ0JBQVo7S0FDSCxJQUFJLEVBQUUsVUFBSztVQUNSLGVBQVEsVUFBUyxHQUFJLFVBQUssWUFBVyxVQUFLLFdBQVc7OztBQUU3RDtLQUNLLEtBQUssT0FBTztDQUNULE1BQU87O0tBRVYsS0FBSyxFQUFFLFVBQUs7Q0FDaEIsSUFBRyxnQkFBUztFQUNYLElBQUcsVUFBSyxvQkFBYTtHQUNwQixVQUFLLFNBQVM7Ozs7UUFFaEIsVUFBSyxPQUFPLEVBQUU7OztBQUVmOzZCQUFrQjtRQUNqQixJQUFJLEdBQUksSUFBSSxPQUFPLEdBQUksSUFBSTs7O0FBRTVCOztDQUNDLElBQUcsaUJBQVU7U0FDTCxNQUFNLCtCQUFPOztDQUNyQixTQUFHLE1BQU0sS0FBSyxXQUFJO0VBQ2pCLE1BQU0sRUFBRSxNQUFNOztDQUNmLFNBQUcsTUFBTTtFQUNSLE1BQU0sRUFBRSxXQUFXOztRQUNiOzs7QUFFRjtDQUNOO2NBQ0M7OztDQUVEO09BQ0MsNkJBQVcsZUFBbUIsTUFBTTs7OztDQUdyQztFQUNDLFdBQUksTUFBTSxPQUFFLE9BQU8sRUFBRTs7OztDQUd0QjtNQUNLLElBQUksT0FBRSxLQUFLO09BQ2YsWUFBWSxRQUFFLGNBQWMsR0FBRyxPQUFNLE1BQU07VUFDM0MsYUFBTSxJQUFLLGFBQU0sVUFBTyxhQUFNLElBQUksZ0JBQVMsRUFBRTs7O0NBRTlDO09BQ0MsWUFBWSxPQUFFLFlBQVksRUFBRTtFQUNYLE1BQU8sd0JBQWpCLEVBQUU7O0VBRVQsSUFBRyxZQUFLLFdBQVcsR0FBRyxZQUFLO09BQ3RCLFFBQVEsT0FBRSxLQUFLO09BQ2YsS0FBSyxFQUFFLGFBQU07T0FDYixLQUFLLFFBQUUsT0FBTyxHQUFHLGtCQUFZLFNBQVM7OztHQUcxQyxJQUFHLFlBQUs7V0FDUCxhQUFNLElBQUksS0FBSztVQUNoQixJQUFLLFdBQUksTUFBTTtXQUNkLGFBQU0sUUFBTSxVQUFRO1VBQ3JCLElBQUssYUFBTTtRQUNOLElBQUksRUFBRSxLQUFLLFFBQVE7SUFDdkIsSUFBRyxRQUFRLEdBQUksSUFBSSxJQUFJO1lBQ3RCLEtBQUssS0FBSztXQUNYLE1BQU0sU0FBUSxHQUFJLElBQUksR0FBRztZQUN4QixLQUFLLE9BQU8sSUFBSTs7O1dBRWpCLGFBQU0sSUFBSTs7O1VBRVgsYUFBTSxJQUFJOzs7OztDQUdaO0VBQ2EsVUFBSSxPQUFPLFFBQUcsWUFBWSxJQUFJO01BQ3RDLEtBQUssT0FBRSxPQUFPO0VBQ04sSUFBRyxLQUFLLFFBQUc7RUFDSixLQUFPLGFBQU0sa0JBQWhDLFlBQVksRUFBRTs7RUFFZCxJQUFHLFlBQUssV0FBVyxHQUFHLFlBQUs7T0FDdEIsS0FBSyxPQUFFO09BQ1AsUUFBUSxFQUFLLGFBQU07SUFDdEIsS0FBSyxRQUFRLE1BQU0sR0FBRztTQUNsQixXQUFJLE1BQU07UUFDWjs7SUFFRixLQUFLLFFBQUc7OztRQUVULEtBQUssUUFBUSxFQUFFOztRQUVmLEtBQUssTUFBTSxFQUFFO1FBQ2IsY0FBYyxPQUFFLEtBQUs7Ozs7OztBQUdqQjtDQUNOO2NBQ0M7OztDQUVEO09BQ0MsNkJBQVcsZUFBbUIsTUFBTTs7OztDQUdyQztFQUNtQixTQUFHLFlBQVksR0FBRyxhQUFwQyxXQUFJLE1BQU0sRUFBRTs7OztDQUdiO01BQ0ssSUFBSSxPQUFFLEtBQUs7T0FDZixZQUFZLFFBQUUsY0FBYyxHQUFHLE9BQU0sTUFBTTtVQUMzQyxhQUFNLElBQUssYUFBTSxVQUFPLGFBQU0sSUFBSSxnQkFBUyxFQUFFOzs7Q0FFOUM7T0FDQyxZQUFZLEVBQUU7U0FDZCxlQUFRLGFBQU0sSUFBSSxnQkFBUyxFQUFFOzs7Q0FFOUI7RUFDUSxTQUFHLFlBQVksR0FBRyxVQUFVLEtBQUk7RUFDdkMsSUFBRztRQUNGLEtBQUssTUFBTSxFQUFFLGFBQU07O09BQ3BCLGNBQWMsT0FBRSxLQUFLOzs7OztBQUdoQjtDQUNOO0VBQ0MsSUFBRyxNQUFNLFFBQUc7R0FDWCxXQUFJLE1BQU0sT0FBRSxPQUFPLEVBQUU7Ozs7O0NBR3ZCO2NBQ0MsT0FBTyxHQUFHLFdBQUk7Ozs7QUFFVDtDQUNOO2NBQ0M7OztDQUVEO09BQ0MsNkJBQVcsZUFBbUIsTUFBTTs7OztDQUdyQztFQUNDLElBQUcsTUFBTSxRQUFHO1FBQ1gsT0FBTyxFQUFFO0dBQ1QsV0FBVSxNQUFNO0lBQ2YsOEJBQWEsV0FBSTs7U0FDWixLQUFLLEdBQUcsSUFBSSxPQUFPLElBQUksS0FBSyxVQUFRLElBQUk7S0FDNUMsSUFBRyxNQUFNLEdBQUc7TUFDWCxXQUFJLGNBQWMsRUFBRTs7Ozs7SUFHdEIsV0FBSSxNQUFNLEVBQUU7Ozs7OztDQUdmO0VBQ0MsSUFBRzs7R0FDRiw4QkFBYyxXQUFJOzthQUNqQixPQUFPLE9BQU8sT0FBTyxLQUFLLFVBQVEsT0FBTzs7OztPQUV0QyxJQUFJLEVBQUUsV0FBSSxnQkFBZ0I7VUFDOUIsUUFBTyxJQUFJLE9BQU8sSUFBSSxLQUFLLFVBQVEsSUFBSSxVQUFTOzs7O0NBRWxEO1NBQ0MsZUFBUSxhQUFNLElBQUksZ0JBQVMsRUFBRTs7O0NBRTlCO0VBQ1EsTUFBTzs7TUFFVixLQUFLLEVBQUUsYUFBTTs7RUFFakIsSUFBRztHQUNGLDhCQUFjLFdBQUk7O1FBQ2IsS0FBSyxFQUFFLGFBQU0sSUFBSSxPQUFPLE9BQU8sT0FBTyxLQUFLLFVBQVEsT0FBTztRQUMxRCxJQUFJLEVBQUUsS0FBSyxRQUFRLE1BQU0sR0FBRztJQUNoQyxPQUFPLFNBQVMsRUFBRTs7O1FBRW5CLFNBQVM7Ozs7Ozs7Ozs7Ozs7O0lDMU5SLEtBQUs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQ0gsS0FBSyxRQXNGVixTQXRGVTs7TUF3RkosU0FBUTtNQUNiO01BQ0EsVUFBUztNQUNULFFBQVEsRUFBRSxNQUFNLEdBQUksTUFBTSxPQUFPLEdBQUc7TUFDcEMsVUFBVSxFQUFFO01BQ1osVUFBVSxFQUFFO01BQ1osVUFBUztDQUNULFFBQVEsRUFBRTtNQUNWLFdBQVU7Ozs7QUFoR04sS0FBSyxNQUNMLGNBQWMsRUFBRTtBQURoQixLQUFLLE1BRUwsV0FBVyxFQUFFOzs7O0lBSWQsUUFBUTtJQUNSLE1BQU0sRUFBRTtJQUNSLFlBQVk7O0FBRWhCLEtBVlU7UUFXVDs7O0FBRUQsS0FiVTtRQWNGLEtBQUssSUFBSyxLQUFLLFVBQVUsR0FBRyxZQUFZLEtBQUs7OztBQUVyRCxLQWhCVTs7U0FpQkYsWUFBWSxLQUFLLG9CQUFqQixZQUFZLEtBQUs7U0FDakIsS0FBSyxrQkFBTCxLQUFLOzs7O0FBR2IsS0FyQlU7Q0FzQlQsOEJBQVMsRUFBRTs7RUFDRCxTQUFHLE9BQU87TUFDZixNQUFNLEVBQUUsWUFBWSxFQUFFLFlBQVksV0FBVztFQUNqRCxFQUFFLFVBQVUsRUFBRTtFQUNkLFFBQVEsS0FBSztFQUNiO0VBQ0EsTUFBTSxXQUFXLEVBQUU7Ozs7O0FBR3JCLEtBL0JVOztDQWdDVCw4QkFBUyxFQUFFOztFQUNWLElBQU8sTUFBTSxPQUFFLE9BQU87R0FDckIsTUFBTSxVQUFVLEVBQUU7Ozs7Ozs7QUFJckIsS0F0Q1U7O0NBdUNULDhCQUFTLEVBQUU7O0VBQ1YsSUFBTyxNQUFNLE9BQUUsT0FBTztHQUNyQixNQUFNLFNBQVMsRUFBRTtRQUNqQixRQUFRLEVBQUU7R0FDVjs7Ozs7Ozs7OztBQU9ILEtBbERVOztDQW1EVCw4QkFBUyxFQUFFOztFQUNWLElBQU8sTUFBTSxPQUFFLE9BQU87R0FDckIsTUFBTSxZQUFZLEVBQUU7UUFDcEIsUUFBUSxFQUFFO0dBQ1Y7Ozs7OztBQUdILEtBMURVOzs7O0FBNkRWLEtBN0RVOzs7O0FBZ0VWLEtBaEVVOzs7OztBQUFMLEtBQUs7QUFBTCxLQUFLO0FBQUwsS0FBSztBQUFMLEtBQUs7QUFBTCxLQUFLO0FBQUwsS0FBSztBQUFMLEtBQUs7QUFBTCxLQUFLO0FBQUwsS0FBSztBQUFMLEtBQUs7QUFBTCxLQUFLO0FBQUwsS0FBSztBQUFMLEtBQUs7QUFBTCxLQUFLO0FBQUwsS0FBSztBQUFMLEtBQUs7QUFBTCxLQUFLO0FBQUwsS0FBSztBQUFMLEtBQUssdUNBNkVhO0FBN0VsQixLQUFLO0FBQUwsS0FBSztBQUFMLEtBQUs7QUFBTCxLQUFLOztBQUFMLEtBQUs7QUFBTCxLQUFLOzs7Ozs7O0FBbUdWLEtBbkdVO01Bb0dULFVBQVUsRUFBRTtNQUNaLE9BQU8sUUFBSSxPQUFPO0NBQ2xCLFVBQU87T0FDTixZQUFZLHVCQUFTLEVBQUU7RUFDdkIsS0FBSyxXQUFTLG9DQUErQixZQUFZOzs7OztBQUczRCxLQTNHVTtnQkE0R1A7Ozs7Ozs7Ozs7QUFRSCxLQXBIVTs7TUFzSFQ7TUFDQSxVQUFVLEtBQUs7Ozs7Ozs7Ozs7QUFRaEIsS0EvSFU7TUFnSVQsVUFBVSxFQUFFOzs7Ozs7Ozs7QUFPYixLQXZJVTs7TUF5SVQsUUFBUSxFQUFFOzs7OztBQUlYLEtBN0lVO0NBOElULFFBQVE7TUFDUixTQUFTLEVBQUU7Ozs7O0FBR1osS0FsSlU7TUFtSlQsT0FBTyxFQUFFO01BQ1QsT0FBTyxFQUFFO01BQ1QsUUFBUSxFQUFFO01BQ1YsR0FBRyxFQUFFLEVBQUU7TUFDUCxHQUFHLEVBQUUsRUFBRTtDQUNQO0NBQ0E7Q0FDaUIsSUFBRyxFQUFFLEdBQUkscUJBQTFCLEVBQUU7Ozs7QUFHSCxLQTdKVTtNQThKVCxPQUFPLEVBQUU7TUFDVCxHQUFHLEVBQUUsRUFBRTtNQUNQLEdBQUcsRUFBRSxFQUFFO0NBQ1A7Q0FDaUIsSUFBRyxFQUFFLEdBQUkscUJBQTFCLEVBQUU7Ozs7QUFHSCxLQXJLVTtNQXNLVCxPQUFPLEVBQUU7TUFDVCxHQUFHLEVBQUUsRUFBRTtNQUNQLEdBQUcsRUFBRSxFQUFFO0NBQ1A7O0NBRUEsS0FBSyxNQUFNLGNBQWMsRUFBRSxFQUFFOztDQUU3QixTQUFHLE9BQU8sRUFBRTtNQUNQLElBQUksTUFBRSxLQUFLLE1BQVU7RUFDekIsSUFBSTtFQUNKLElBQUk7RUFDYSxJQUFHLElBQUksY0FBeEIsRUFBRTs7O0NBRUgsSUFBRyxFQUFFLEdBQUk7RUFDUixFQUFFOzs7Ozs7QUFJSixLQXhMVTtRQXlMVDs7O0FBRUQsS0EzTFU7O01BNExULE9BQU8sRUFBRTtNQUNULFFBQVEsRUFBRSxFQUFFO01BQ1osR0FBRyxFQUFFLEVBQUU7TUFDUCxHQUFHLEVBQUUsRUFBRTtDQUNQO0NBQ0E7TUFDQSxXQUFXLDRCQUFPLFVBQVUsRUFBRTtDQUM5QixLQUFLLFdBQVMsa0NBQTZCLFdBQVc7Ozs7QUFHdkQsS0F0TVU7TUF1TVQsR0FBRyxFQUFFLEVBQUU7TUFDUCxHQUFHLEVBQUUsRUFBRTtNQUNQLE9BQU8sRUFBRTtDQUNRLElBQUcscUJBQXBCLEVBQUU7Q0FDRjtDQUNBOzs7O0FBR0QsS0EvTVU7TUFnTlQsR0FBRyxFQUFFLEVBQUU7TUFDUCxHQUFHLEVBQUUsRUFBRTtDQUNQOzs7O0FBR0QsS0FyTlU7UUFzTlQ7OztBQUVELEtBeE5VO01BeU5ULFdBQVcsRUFBRSxLQUFLO01BQ2xCLE9BQU8sT0FBRSxJQUFJLEVBQUU7TUFDZixJQUFJLE9BQUU7TUFDTixJQUFJLE9BQUU7O0tBRUYsSUFBSSxFQUFFLGFBQU07S0FDWixLQUFLLEVBQUU7O01BRVgsY0FBYyxFQUFFLElBQUkscUJBQVE7O1FBRXRCO0VBQ0wsS0FBSyxvQkFBTTtFQUNYLElBQUcsS0FBSyxHQUFHLEtBQUs7UUFDZixRQUFRLEVBQUU7UUFDVixVQUFTO0dBQ1QsY0FBTztHQUNELFVBQU87O0VBQ2QsSUFBSSxFQUFFLElBQUk7OztNQUVYOzs7O0FBR0QsS0EvT1U7O0NBZ1BHLFVBQUksUUFBUSxRQUFHOztLQUV2QixHQUFHLEVBQUUsS0FBSyxLQUFLLFVBQUUsRUFBQyxVQUFHLEVBQUUsVUFBRSxFQUFDO0NBQ2xCLElBQUcsR0FBRyxPQUFFLFlBQXBCLE9BQU8sRUFBRTtNQUNULElBQUksRUFBRTs7O0NBR04sU0FBRztFQUNGLFNBQUcsUUFBUSxRQUFJLFFBQVE7UUFDdEIsUUFBUTs7T0FDVCxlQUFTO09BQ1QsVUFBVSxFQUFFO0VBQ2MsSUFBRyxjQUFPLGdCQUFwQyxjQUFPO0VBQ08sU0FBRyxvQkFBVjs7OztNQUdSO0NBQ0EsU0FBRztFQUNvQixtQ0FBUztHQUEvQixTQUFFOzs7O0NBRUgscUNBQVEsbUJBQVIsUUFBUTtDQUNELFNBQUcsV0FBVjs7OztBQUdELEtBeFFVOztDQXlRRyxVQUFJLFFBQVEsUUFBRzs7Q0FFM0IsU0FBRztFQUNGLG1DQUFTOztHQUNtQixJQUFHLEVBQUUsZUFBaEMsRUFBRSxzQkFBaUI7Ozs7Q0FFckIscUNBQVEsaUJBQVIsUUFBUSxzQkFBaUI7Ozs7QUFHMUIsS0FsUlU7O0NBbVJHLFVBQUksUUFBUSxRQUFHOztNQUUzQjs7Q0FFQSxTQUFHO0VBQ2lCLG1DQUFTO0dBQTVCLFNBQUU7Ozs7Q0FFSCxxQ0FBUSxnQkFBUixRQUFRO0NBQ1I7Ozs7QUFHRCxLQTlSVTtDQStSVCxVQUFPO09BQ04sV0FBVyxFQUFFO0VBQ2I7RUFDQTs7Ozs7QUFHRixLQXJTVTs7Q0FzU0csVUFBTzs7TUFFbkIsV0FBVyxFQUFFO01BQ2I7O0NBRUEsU0FBRztFQUNGLG1DQUFTOztHQUNjLElBQUcsRUFBRSxpQkFBM0IsRUFBRTs7OztDQUVKLHFDQUFRLG1CQUFSLFFBQVE7Ozs7QUFHVCxLQWxUVTtDQW1UVCxTQUFHO0VBQ0YsS0FBSyxXQUFTLHFDQUFnQyxXQUFXO09BQ3pELFdBQVcsRUFBRTs7O0NBRWQsU0FBRztFQUNGLEtBQUssV0FBUyx1Q0FBa0MsWUFBWTtPQUM1RCxZQUFZLEVBQUU7Ozs7Ozs7Ozs7O0FBUWhCLEtBalVVO2FBaVVBOzs7Ozs7OztBQU1WLEtBdlVVO2FBdVVBLEdBQUcsT0FBRTs7Ozs7Ozs7QUFNZixLQTdVVTthQTZVQSxHQUFHLE9BQUU7Ozs7Ozs7O0FBTWYsS0FuVlU7YUFtVkE7Ozs7Ozs7O0FBTVYsS0F6VlU7YUF5VkE7Ozs7Ozs7O0FBTVYsS0EvVlU7YUErVkQ7Ozs7Ozs7O0FBTVQsS0FyV1U7YUFxV0Q7Ozs7Ozs7O0FBTVQsS0EzV1U7TUE0V1Qsc0NBQWUsUUFBUSxNQUFJO2FBQzNCLEdBQUcsT0FBRSxXQUFXOzs7Ozs7OztBQU1qQixLQW5YVTtNQW9YVCxzQ0FBZSxRQUFRLE1BQUk7YUFDM0IsR0FBRyxPQUFFLFdBQVc7Ozs7Ozs7O0FBTWpCLEtBM1hVO2FBMlhJOzs7QUFFZCxLQTdYVTthQThYVDs7O0FBRUQsS0FoWVU7UUFpWVQsS0FBSyxNQUFJLE9BQUU7Ozs7QUFHUCxLQUFLLGVBQVgsU0FBVzs7QUFBTCxLQUFLLDhDQUVXO0FBRmhCLEtBQUs7QUFBTCxLQUFLO0FBQUwsS0FBSyxpQ0FFVzs7QUFFckIsS0FKVTs7OztBQU9WLEtBUFU7Ozs7QUFVVixLQVZVOzs7Ozs7Ozs7OztJQ3JhUCxLQUFLOztJQUVMLFNBQVM7TUFDUDtNQUNBO1FBQ0U7UUFDQTtLQUNIO09BQ0U7OztJQUdILEdBQUcsRUFBRSxLQUFLLElBQUk7QUFDbEI7UUFBeUIsRUFBRSxPQUFLLEdBQUc7O0FBQ25DO1FBQTRCLEVBQUUsVUFBUSxHQUFHOztBQUN6QztRQUE0QixFQUFFLFVBQVEsR0FBRzs7QUFDekM7UUFBMkIsRUFBRSxPQUFPLE1BQUssR0FBRzs7QUFDNUM7UUFBeUIsRUFBRSxRQUFNLFFBQVEsR0FBRzs7QUFDNUM7UUFBd0IsRUFBRSxRQUFNLE9BQU8sR0FBRzs7QUFDMUM7UUFBMEIsRUFBRSxRQUFNLFNBQVMsR0FBRzs7QUFDOUM7UUFBeUIsRUFBRSxRQUFNLFFBQVEsR0FBRzs7QUFDNUM7UUFBNkIsRUFBRSxjQUFXLEVBQUUsVUFBUSxHQUFHLFFBQU87O0FBQzlEO1FBQXdCLEVBQUUsY0FBVyxFQUFFLFVBQVEsR0FBRyxFQUFFLEdBQUcsRUFBRSxVQUFRLEdBQUcsT0FBTTs7QUFDMUU7UUFBeUIsRUFBRSxRQUFNLE9BQU8sUUFBRzs7QUFDM0M7U0FBeUIsRUFBRSxTQUFPLEdBQUcsZUFBYSxFQUFFLFNBQU8sSUFBSSxNQUFLLEdBQUcsWUFBWSxHQUFHOztBQUN0RjtTQUEwQixFQUFFLFNBQU8sR0FBRyxlQUFhLEVBQUUsU0FBTyxJQUFJLE1BQUssR0FBRyxZQUFZLEdBQUc7O0FBQ3ZGO1NBQTJCLEVBQUUsU0FBTyxHQUFHLGVBQWEsRUFBRSxTQUFPLElBQUksTUFBSzs7QUFDdEU7YUFBOEI7Ozs7Ozs7Ozs7Ozs7QUFXeEIsS0FBSyxRQWVWLFNBZlU7TUFnQlQsU0FBUTtNQUNSLFFBQVEsRUFBRTs7Ozs7QUFqQk4sS0FBSztBQUFMLEtBQUs7Ozs7QUFBTCxLQUFLO0FBQUwsS0FBSzs7QUFBTCxLQUFLO0FBQUwsS0FBSzs7QUFBTCxLQUFLO0FBQUwsS0FBSzs7QUFZVixLQVpVO2lCQWFBOzs7QUFNVixLQW5CVTtNQW9CVCxNQUFNLEVBQUU7Ozs7Ozs7OztBQU1ULEtBMUJVO2FBMkJULE1BQU0sR0FBRyxhQUFNOzs7QUFFaEIsS0E3QlU7UUE2QkksYUFBTTs7QUFDcEIsS0E5QlU7UUE4QkssYUFBTTs7O0FBRXJCLEtBaENVO2FBaUNULHVCQUFVLFlBQUssY0FBWTs7OztBQUc1QixLQXBDVTtDQXFDVCxJQUFHLEVBQUUsR0FBRztPQUNGLFVBQVM7OzthQUVSOzs7QUFFUixLQTFDVTtNQTJDVCxRQUFRLEVBQUU7Ozs7Ozs7Ozs7QUFPWCxLQWxEVTtNQW1EVCxVQUFTOzs7O0FBR1YsS0F0RFU7UUFzRGE7O0FBQ3ZCLEtBdkRVO1FBdURFOzs7O0FBR1osS0ExRFU7Q0EyRFQsSUFBRyxhQUFNO0VBQ1IsYUFBTTs7RUFFTixhQUFNLGlCQUFpQixFQUFFOztNQUNyQixpQkFBaUIsRUFBRTs7OztBQUd6QixLQWxFVTtDQW1FVCxRQUFRO1FBQ1I7Ozs7Ozs7OztBQU9ELEtBM0VVO1FBNEVULGFBQU0sR0FBSSxhQUFNLGlCQUFpQixRQUFHOzs7Ozs7Ozs7QUFPckMsS0FuRlU7Q0FvRlQsUUFBUTtRQUNSOzs7QUFFRCxLQXZGVTtNQXdGVCxVQUFVLEVBQUU7Ozs7QUFHYixLQTNGVTtnQkE0RlA7Ozs7Ozs7QUFLSCxLQWpHVTswQkFrR0wsYUFBTSxRQUFRLEdBQUcsYUFBTTs7Ozs7OztBQUs1QixLQXZHVTthQXdHVDs7Ozs7OztBQUtELEtBN0dVO01BOEdULFVBQVUsRUFBRTs7OztBQUdiLEtBakhVO0tBa0hMLEVBQUUsRUFBRTtLQUNKLEVBQUUsRUFBRSxTQUFTO0tBQ2IsT0FBTyxPQUFFO0tBQ1QsTUFBTSxFQUFFLFNBQVMsVUFBVCxTQUFTO0tBQ2pCOztDQUVKLElBQUc7T0FDRixRQUFRLEVBQUU7OztRQUVMLEVBQUUsRUFBRTtNQUNMLE1BQU0sRUFBRTtNQUNSLFFBQVEsRUFBRSxTQUFTO01BQ25CLE9BQVEsRUFBRTtNQUNWLFFBQVEsRUFBRTs7RUFFZCxJQUFHLG1CQUFZO0dBQ2QsT0FBTyxFQUFFLFFBQVEsTUFBTTtHQUN2QixRQUFRLEVBQUUsUUFBUTs7O0VBRW5CLFdBQVUsUUFBUTtHQUNqQixJQUFHLFNBQVM7SUFDWCxPQUFPLEdBQUcsU0FBUztJQUNuQixRQUFROzs7T0FFTCxJQUFJLEVBQUUsUUFBUTs7R0FFbEIsSUFBRyxLQUFLO0lBQ1AsTUFBTSxFQUFFO0lBQ1IsT0FBTyxHQUFHLE9BQU8sT0FBTyxhQUFhO0lBQ3JDLFFBQVEsRUFBRSxLQUFLOzs7Ozs7RUFJakIsV0FBVSxRQUFRO09BQ2IsR0FBRyxFQUFFO09BQ0wsR0FBRyxFQUFFO1VBQ0gsR0FBRyxNQUFNLElBQUcsS0FBSyxjQUFPO0lBQzdCLElBQUcsR0FBRyxFQUFFLEdBQUcsV0FBVztLQUNyQixRQUFRLEVBQUU7S0FDVixRQUFRLEVBQUU7O0tBRVYsR0FBRyxFQUFFLEdBQUc7Ozs7O0VBRVgsSUFBRyxtQkFBWTs7O09BR1YsSUFBSSxFQUFFLFFBQVEsTUFBTSxRQUFRLE9BQU87Ozs7R0FJdkMsTUFBSTtJQUNILE9BQU8sRUFBRTtTQUNULGlDQUFlOzs7R0FFaEIsSUFBRyxJQUFJLEdBQUc7Ozs7O0dBSVYsSUFBRyxJQUFJLFNBQUssVUFBVSxJQUFJLElBQUksZ0JBQVM7SUFDdEMsSUFBSSxLQUFLLEtBQUs7Ozs7OztDQUdqQixTQUFHLFFBQVEsSUFBSTtPQUNkLFFBQVEsRUFBRTs7O1FBRUo7OztBQUVSLEtBckxVO0tBc0xMLEtBQUssT0FBTztLQUNaLEtBQUssZ0JBQU0sUUFBUSxTQUFPO0tBQzFCLEtBQUssRUFBRTtLQUNQLFVBQVUsRUFBRSxhQUFNLFFBQVEsR0FBRyxhQUFNO0tBQ25DLFFBQVEsRUFBRSxVQUFVLFdBQVcsR0FBRzs7S0FFbEM7S0FDQTs7UUFFRTtPQUNMLFVBQVUsRUFBRTtNQUNSLEtBQUssRUFBRSxRQUFRLE9BQU8sVUFBVSxRQUFROztFQUU1QyxJQUFHO0dBQ0YsSUFBRyxLQUFLLGlCQUFVO1NBQ2pCLGlDQUFlO1NBQ2YsVUFBVSxFQUFFO0lBQ1osT0FBTyxFQUFFLE9BQU8sS0FBSyxNQUFNLE1BQU0sS0FBSyxRQUFRLEtBQUssV0FBVzs7O0dBRS9ELElBQUcsU0FBUyxFQUFFLEtBQUs7SUFDbEIsOEJBQWU7O1dBQWM7U0FDeEIsTUFBTSxFQUFFLFFBQVE7S0FDcEIsSUFBRyxLQUFLLEdBQUcsUUFBUSxHQUFHLEdBQUk7V0FDekIsZ0JBQWdCLEtBQUs7OztJQUNqQixNQUFPOzs7R0FFZCxJQUFHLEtBQUs7SUFDUCxLQUFLOzs7OztFQUdQLE1BQU8sY0FBTyxJQUFJLFFBQVEsUUFBRyxVQUFVLElBQUksT0FBTyxLQUFLLFdBQVMsUUFBUTs7Ozs7Q0FHekU7Ozs7Q0FJQSxJQUFHLE9BQU8sSUFBSSxPQUFPLGdCQUFTO0VBQzdCLE9BQU8sVUFBVSxVQUFVOzs7Ozs7QUFJN0IsS0FoT1U7Q0FpT1QsVUFBSSxVQUFVLFFBQUk7RUFDakIsS0FBSyxLQUFLO0VBQ1YsS0FBSyxPQUFPOzs7Ozs7Ozs7O0FBT2QsS0ExT1U7UUEwT0QsYUFBTTs7Ozs7Ozs7QUFNZixLQWhQVTtRQWdQRCxhQUFNOzs7Ozs7Ozs7Ozs7OztBQVlmLEtBNVBVO1FBNFBHLGFBQU07Ozs7Ozs7Ozs7SUNqU2hCLEtBQUs7Ozs7Ozs7Ozs7Ozs7OztBQWNILEtBQUssZUE0RVYsU0E1RVU7Ozs7TUE2RVQsaUJBQWlCLE9BQVEsR0FBRyxPQUFPLFNBQVMsR0FBRyxLQUFLLFVBQVUsSUFBSTtNQUNsRSxRQUFPO01BQ1A7TUFDQTtNQUNBO09BQ0MsU0FBUztTQUNGOzs7Q0FFUiw4QkFBYTtPQUNaLFNBQVM7Ozs7OztBQXRGTixLQUFLO0FBQUwsS0FBSztBQUFMLEtBQUs7QUFBTCxLQUFLO0FBQUwsS0FBSywrQ0FJWTtBQUpqQixLQUFLO0FBQUwsS0FBSzs7Ozs7O0FBQUwsS0FBSyxrQ0FJWTtBQUpqQixLQUFLO0FBQUwsS0FBSztBQUFMLEtBQUs7QUFBTCxLQUFLO0FBQUwsS0FBSztBQUFMLEtBQUs7O0FBU1YsS0FUVTtDQVVULE9BQU8sa0JBQVc7Ozs7QUFHbkIsS0FiVTs7Q0FjVSxJQUFHLEtBQUssaUJBQXBCLEtBQUs7O0NBRVo7RUFDQyxLQUFLLFlBQUwsS0FBSyxjQUFZLEtBQUs7O0VBRXRCLEtBQUssT0FBTyxNQUFFLEtBQUssYUFBaUIsS0FBSzs7Ozs7Ozs7Ozs7O0VBWXpDLEtBQUssT0FBTzs7Ozs7TUFLUixlQUFlLEVBQUUsT0FBTyxHQUFHLE9BQU8sYUFBYSxJQUFJOztFQUV2RCxJQUFHO0dBQ0YsS0FBSyxPQUFPO1dBQ1gsS0FBSyxNQUFNLGFBQWE7OztHQUV6QixLQUFLLE9BQU87V0FDWCxLQUFLLE1BQU0sWUFBWTs7O0dBRXhCLEtBQUssT0FBTztXQUNYLEtBQUssTUFBTSxXQUFXOzs7R0FFdkIsS0FBSyxPQUFPO1dBQ1gsS0FBSyxNQUFNLGNBQWM7Ozs7RUFFM0IsS0FBSyxPQUFPOztHQUVYLEtBQUksRUFBRSxVQUFVLEVBQUUsS0FBSyxNQUFNLGVBQWUsRUFBRSxLQUFLLE1BQU07SUFDeEQsRUFBRSxrQkFBa0IsRUFBRTtRQUNsQixJQUFJLE1BQUUsS0FBSyxNQUFVO0lBQ3pCLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBRyxJQUFJO1lBQ0MsRUFBRTs7OztVQUVYLEtBQUssT0FBTyxTQUFTOzs7RUFFdEIsS0FBSyxPQUFPO0dBQ1gsS0FBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLE1BQU0sZUFBZSxFQUFFLEtBQUssTUFBTTtJQUN6QixJQUFHLEtBQUssa0JBQXZDLEtBQUssUUFBUSxPQUFPLEdBQUc7Ozs7RUFFekIsS0FBSyxPQUFPO0dBQ1gsS0FBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLE1BQU0sZUFBZSxFQUFFLEtBQUssTUFBTTtJQUN6QixJQUFHLEtBQUssa0JBQXZDLEtBQUssUUFBUSxPQUFPLEdBQUc7Ozs7RUFFekIsS0FBSyxPQUFPO0VBQ1osS0FBSyxPQUFPLFdBQVU7U0FDZixLQUFLOzs7Ozs7Ozs7Ozs7OztBQXlCZCxLQWxHVTtxQ0FrR21CO0NBQzVCLElBQUcsZ0JBQVM7RUFDUyw4QkFBUztRQUE3QixTQUFTLFNBQUU7Ozs7O0NBR0EsSUFBRyxrQkFBVzs7S0FFdEIsR0FBRyxFQUFFLGtCQUFXLE1BQU0sR0FBRSxtQkFBWSxZQUFXLFVBQVU7Q0FDMUIsSUFBRyx5QkFBdEMsWUFBSyxpQkFBaUIsS0FBSyxHQUFHOzs7QUFFL0IsS0E1R1U7cUNBNEcwQjtDQUNuQyxpQkFBVSxNQUFNLEtBQUssUUFBUTtDQUNlLElBQUcsa0JBQS9DLFlBQUssaUJBQWlCLEtBQUssUUFBUTs7OztBQUdwQyxLQWpIVTtLQWtITCxNQUFNLEVBQUUsS0FBSyxNQUFNLEtBQUs7Q0FDNUIsTUFBTTtDQUNOLFNBQUc7RUFDRixJQUFHLEVBQUUsS0FBSztHQUNULEtBQUssTUFBTSxLQUFLLEdBQUcsbUJBQW1CO1NBQ3ZDLElBQUssRUFBRSxLQUFLO0dBQ1gsS0FBSyxNQUFNLEtBQUssR0FBRyxvQkFBb0I7Ozs7Ozs7Ozs7OztBQVExQyxLQWhJVTs7a0RBZ0lxQjt3REFBYztLQUN4QyxNQUFNLEVBQUUsS0FBSyxNQUFNLFlBQVcsYUFBYztDQUM5QixJQUFHLFNBQXJCLE1BQU0sUUFBTztDQUNTLElBQUcsV0FBekIsTUFBTSxVQUFTO1FBQ2Y7Ozs7Ozs7OztBQU9ELEtBM0lVO2FBNElULDZCQUFtQjs7O0FBRXBCLEtBOUlVO0NBK0lULGFBQXdCO21DQUN2QixZQUFLLGlCQUFpQixLQUFLLFFBQVE7OztDQUVwQyw4QkFBWTs7RUFDWCxZQUFLLGlCQUFpQixLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUs7OztDQUU1QyxPQUFPLDhCQUE4QixLQUFLOzs7O0FBRzNDLEtBeEpVO0NBeUpULGFBQXdCO21DQUN2QixZQUFLLG9CQUFvQixLQUFLLFFBQVE7OztDQUV2Qyw4QkFBWTs7RUFDWCxZQUFLLG9CQUFvQixLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUs7OztDQUUvQyxPQUFPLGlDQUFpQyxLQUFLOzs7Ozs7Ozs7Ozs7SUMzSzNDLEtBQUs7O0FBRVQ7Ozs7Q0FJQyxJQUFHLGdCQUFTO0VBQ3FCLDhCQUFjO0dBQTlDLGFBQWEsS0FBSyxTQUFPOztRQUMxQixJQUFLLEtBQUssR0FBSSxLQUFLO0VBQ2xCLEtBQUssWUFBWTtRQUNsQixJQUFLLEtBQUssR0FBRzs7O01BR1IsS0FBSyxFQUFFLFFBQVEsTUFBTSxjQUFjLEtBQUssS0FBSztFQUNqRCxLQUFHLGdCQUFTLE1BQUssR0FBSSxLQUFLLFlBQVksR0FBRztHQUN4QyxLQUFLLFlBQVk7Ozs7OztRQUlaOzs7QUFFUjtDQUNDLElBQUcsZ0JBQVM7TUFDUCxFQUFFLEVBQUU7TUFDSixFQUFFLEVBQUUsS0FBSztNQUNULEVBQUUsR0FBRSxFQUFFLEdBQUcsVUFBUSxLQUFLLE9BQU8sRUFBRSxNQUFLLEtBQUs7U0FDVixFQUFFLEVBQUU7R0FBdkMsYUFBYSxLQUFLLEtBQUs7O1FBQ3hCLElBQUssS0FBSyxHQUFJLEtBQUs7RUFDbEIsS0FBSyxZQUFZO1FBQ2xCLElBQUssS0FBSyxHQUFHLEtBQUssR0FBSSxLQUFLLElBQUk7RUFDOUIsS0FBSyxZQUFZLEtBQUssZUFBZTs7Ozs7Ozs7Ozs7QUFTdkM7Q0FDQyxJQUFHLGdCQUFTO01BQ1AsRUFBRSxFQUFFO01BQ0osRUFBRSxFQUFFLEtBQUs7TUFDVCxFQUFFLEdBQUUsRUFBRSxHQUFHLFVBQVEsS0FBSyxPQUFPLEVBQUUsTUFBSyxLQUFLO1NBQ0csRUFBRSxFQUFFO0dBQXBELG1CQUFtQixLQUFLLEtBQUssS0FBSzs7UUFFbkMsSUFBSyxLQUFLLEdBQUksS0FBSztFQUNsQixLQUFLLGFBQWEsS0FBSztRQUN4QixJQUFLLEtBQUssR0FBRyxLQUFLLEdBQUksS0FBSyxJQUFJO0VBQzlCLEtBQUssYUFBYSxLQUFLLGVBQWUsTUFBTTs7O1FBRXRDOzs7O0FBR1I7S0FDSyxPQUFPLEVBQUUsUUFBUSxNQUFNLGNBQWMsS0FBSyxLQUFLOztDQUVuRCxJQUFHO0VBQ0YsbUJBQW1CLEtBQUssS0FBSztTQUN0QixPQUFPOztFQUVkLGFBQWEsS0FBSztTQUNYLEtBQUssS0FBSzs7OztBQUVuQjs7S0FFSyxPQUFPLEVBQUUsS0FBSTtLQUNiLFFBQVEsRUFBRSxLQUFJLE9BQU8sRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBa0J2QixZQUFZOzs7S0FHWixVQUFVOztLQUVWLFlBQVk7OztLQUdaLGVBQWUsRUFBRTtLQUNqQixZQUFZLEVBQUU7O0tBRWQsYUFBYSxFQUFFO0tBQ2Y7O0NBRUosZ0NBQWlCOzs7RUFFaEIsSUFBRyxLQUFLLEdBQUksS0FBSyxTQUFTLEdBQUc7R0FDNUIsT0FBTyxFQUFFLEtBQUksUUFBUSxLQUFLO0dBQ1AsSUFBRyxPQUFPLEdBQUcsS0FBaEMsS0FBSSxRQUFRLEVBQUU7R0FDZCxhQUFhLEVBQUU7O0dBRWYsT0FBTyxFQUFFLEtBQUksUUFBUTs7O0VBRXRCLFlBQVksS0FBSzs7RUFFakIsSUFBRyxPQUFPLElBQUk7R0FDYixLQUFLLFlBQVk7R0FDakIsVUFBVSxNQUFNO0dBQ2hCLFlBQVksTUFBTTs7OztNQUdmLFFBQVEsRUFBRSxZQUFZLE9BQU8sRUFBRTs7O1NBRzdCLFFBQVEsR0FBRztHQUNoQixJQUFHLFlBQVksU0FBUyxJQUFJO0lBQzNCO1VBQ0QsSUFBSyxPQUFPLEVBQUUsWUFBWTs7Ozs7SUFLekIsUUFBUSxFQUFFLFVBQVU7Ozs7RUFFdEIsVUFBVSxLQUFLOztNQUVYLFdBQVcsR0FBRyxRQUFRLElBQUksS0FBSyxLQUFJLFlBQVksU0FBUSxFQUFDOztFQUU1RCxJQUFHLFdBQVcsRUFBRTtHQUNmLGVBQWUsRUFBRTtHQUNqQixZQUFZLEVBQUU7OztFQUVmLFlBQVksS0FBSzs7O0tBRWQsWUFBWTs7OztLQUlaLE9BQU8sRUFBRSxZQUFZLE9BQU8sRUFBRTtRQUM1QixPQUFPLEdBQUc7RUFDZixJQUFHLE9BQU8sR0FBRyxZQUFZLEdBQUksWUFBWSxRQUFRLElBQUk7R0FDcEQsWUFBWSxZQUFZLFNBQVMsRUFBRTtHQUNuQyxZQUFZLEVBQUUsVUFBVTs7O0VBRXpCLE9BQU8sR0FBRzs7OztDQUdYLGdDQUFpQjs7RUFDaEIsS0FBSSxZQUFZOztHQUVmLE1BQU8sS0FBSyxHQUFJLEtBQUs7SUFDcEIsS0FBSyxFQUFFLEtBQUksS0FBSyxFQUFFLEtBQUssZUFBZTs7O09BRW5DLE1BQU0sRUFBRSxLQUFJLElBQUksRUFBRTtHQUN0QixrQkFBa0IsS0FBTSxNQUFPLE1BQU0sR0FBSSxNQUFNLEtBQUssR0FBRyxNQUFNLEdBQUc7OztFQUVqRSxNQUFNLEVBQUUsS0FBSyxLQUFLLElBQUksTUFBTSxHQUFJLE1BQU0sWUFBWSxHQUFHLEtBQUssS0FBSzs7OztRQUd6RCxRQUFRLEdBQUksUUFBUSxLQUFLLEdBQUc7Ozs7O0FBSXBDO0tBQ0ssRUFBRSxFQUFFLEtBQUk7S0FDUixFQUFFLEVBQUU7S0FDSixLQUFLLEVBQUUsS0FBSSxFQUFFLEVBQUU7OztDQUduQixJQUFHLEVBQUUsR0FBRyxJQUFJLE9BQU8sR0FBSSxLQUFJLEdBQUcsSUFBSSxJQUFJOztTQUUvQjtHQUNDLElBQUcsS0FBSSxHQUFHLElBQUksSUFBSTs7OztDQUUxQixJQUFHLEVBQUUsSUFBSTtTQUNELEtBQUssR0FBSSxLQUFLLEtBQUssR0FBRyxLQUFLLEdBQUc7O1NBRTlCLDJCQUEyQixLQUFLLEtBQUksSUFBSTs7Ozs7O0FBSWpEO0tBQ0ssR0FBRyxFQUFFLEtBQUk7S0FDVCxHQUFHLEVBQUUsSUFBSTtLQUNULEdBQUcsRUFBRSxLQUFJLE1BQU07S0FDZixFQUFFLEVBQUUsRUFBRyxFQUFFLEVBQUUsR0FBRyxFQUFFOzs7UUFHVixFQUFFLEVBQUUsR0FBRyxHQUFJLEVBQUUsRUFBRSxHQUFHLEdBQUksS0FBSSxHQUFHLElBQUksSUFBSTtFQUEvQzs7OztDQUdBLElBQUcsR0FBRyxFQUFFLEtBQUssSUFBSyxHQUFHLEVBQUUsSUFBSSxFQUFFO0VBQzVCLEtBQUksTUFBTSxPQUFPOzs7Q0FFbEIsSUFBRyxFQUFFLEVBQUUsRUFBRSxHQUFJLEVBQUUsR0FBRzs7U0FFZ0IsRUFBRSxFQUFFO0dBQXJDLEtBQUssWUFBWSxLQUFJOzs7UUFHdEIsSUFBSyxFQUFFLEVBQUU7TUFDSixHQUFHLEVBQUU7U0FDRSxHQUFHLEVBQUUsRUFBRSxHQUFJLEtBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxJQUFJLEdBQUcsRUFBRSxFQUFFLEVBQUU7R0FBbkQ7OztFQUVBLElBQUcsRUFBRSxJQUFJLEdBQUcsRUFBRTs7T0FFVCxPQUFPLEVBQUUsSUFBSSxHQUFHO1VBQ3FCLEVBQUUsRUFBRTtJQUE3QyxLQUFLLGFBQWEsS0FBSSxLQUFLOzs7O1FBRzdCLElBQUssRUFBRSxFQUFFLEVBQUUsR0FBSSxFQUFFLEdBQUc7O1NBRWMsRUFBRSxFQUFFO0dBQXJDLEtBQUssWUFBWSxJQUFJOzs7UUFFdEIsSUFBSyxFQUFFLEVBQUU7TUFDSixHQUFHLEVBQUU7U0FDRSxHQUFHLEVBQUUsRUFBRSxHQUFJLEtBQUksR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLElBQUksSUFBSSxHQUFHLEVBQUU7R0FBbkQ7OztFQUVBLElBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtVQUNxQixFQUFFLEVBQUU7SUFBckMsS0FBSyxZQUFZLElBQUk7Ozs7UUFHdkIsSUFBSyxFQUFFLEdBQUc7Ozs7UUFHSCwyQkFBMkIsS0FBSyxLQUFJLElBQUk7Ozs7QUFHaEQ7S0FDSyxPQUFPLEVBQUUsTUFBTTtLQUNmLFFBQVEsRUFBRSxNQUFNLE9BQU8sR0FBRztLQUMxQixLQUFLLEVBQUUsU0FBUyxNQUFNLE9BQU8sRUFBRSxLQUFLOzs7Q0FHeEMsSUFBRyxRQUFRLEVBQUU7U0FDTixRQUFRLEVBQUU7T0FDWCxLQUFLLEVBQUUsUUFBUTtHQUNuQixLQUFLLFlBQVksS0FBSzs7UUFFeEIsSUFBSyxPQUFPLEVBQUU7O01BRVQsU0FBUyxFQUFFLFVBQVUsTUFBTSxRQUFRLEVBQUUsR0FBRyxPQUFPO01BQy9DLE9BQU8sRUFBRSxXQUFXLFNBQVMsY0FBYyxLQUFLLEtBQUs7O1NBRW5ELFFBQVEsRUFBRTtPQUNYLEtBQUssRUFBRSxNQUFNO0dBQ2pCLFNBQVMsS0FBSyxhQUFhLEtBQUssS0FBSyxVQUFVLEtBQUssWUFBWSxLQUFLOzs7O0NBRXZFLE1BQU0sT0FBTyxFQUFFO1FBQ1IsT0FBTyxLQUFLLE9BQU87Ozs7OztBQUszQjs7O0tBR0ssVUFBVSxFQUFFLEtBQUksR0FBRyxLQUFLLEdBQUcsS0FBSSxJQUFJO0tBQ25DLFVBQVUsRUFBRSxJQUFJLEdBQUcsS0FBSyxHQUFHLElBQUksSUFBSTs7O0NBR3ZDLElBQUcsS0FBSSxJQUFJOzs7RUFHVixJQUFHO1VBQ0s7U0FDUixJQUFLLEtBQUk7VUFDRCxLQUFJO1NBQ1osS0FBSyxnQkFBUSxPQUFNLEdBQUksS0FBSSxPQUFPLEdBQUc7VUFDN0Isc0JBQXNCLEtBQUssS0FBSSxJQUFJOztVQUVuQyxRQUFRLE1BQU0sY0FBYyxLQUFLLEtBQUs7O1FBRS9DLElBQUssZ0JBQVE7RUFDWixJQUFHLGVBQVE7O09BRU4sSUFBSSxFQUFFLEtBQUk7R0FDZCxJQUFHLElBQUksR0FBRyxJQUFJOzs7SUFHYixJQUFHLElBQUksR0FBRyxJQUFJO0tBQ2IsOEJBQWM7O01BRWIsTUFBTSxFQUFFLGdCQUFnQixLQUFLLFNBQUssSUFBSSxHQUFHOztZQUNuQzs7S0FFUCxhQUFhLEtBQUssSUFBSTs7Ozs7O1dBS2hCLG9CQUFvQixLQUFLLEtBQUksSUFBSTs7U0FDMUMsTUFBTTtHQUNMLElBQUcsSUFBSTtJQUNOLEtBQUssWUFBWTs7O0lBR2pCLEtBQUssWUFBWSxRQUFRLE1BQU0sY0FBYyxLQUFLLEtBQUs7Ozs7U0FFbEQsa0JBQWtCLEtBQUssS0FBSTs7UUFHbkMsTUFBTSxXQUFVLEdBQUksS0FBSTtFQUNNLE1BQU8sY0FBcEMsYUFBYSxLQUFLLElBQUk7U0FDZixrQkFBa0IsS0FBSyxLQUFJO1FBRW5DLElBQUs7RUFDeUIsTUFBTyxjQUFwQyxhQUFhLEtBQUssSUFBSTtTQUNmOzs7TUFHSDs7RUFFSixJQUFHLGVBQVE7R0FDVixhQUFhLEtBQUssSUFBSTtTQUN2QixJQUFLLElBQUksR0FBSSxJQUFJO0dBQ2hCLEtBQUssWUFBWTtTQUNsQixNQUFNOztHQUVMLFNBQVMsRUFBRSxRQUFRLE1BQU0sY0FBYyxLQUFLLEtBQUs7R0FDakQsS0FBRyxvQkFBYSxNQUFLLEdBQUksU0FBUyxZQUFZLEdBQUc7SUFDaEQsU0FBUyxZQUFZLEVBQUU7V0FDaEI7Ozs7O1NBR0Ysa0JBQWtCLEtBQUssS0FBSTs7Ozs7QUFHN0I7Ozs7Ozs7OztDQVNOOzs7TUFHSyxJQUFJLE9BQUU7O0VBRVYsSUFBRyxLQUFJLElBQUksSUFBSSxHQUFJLEtBQUksR0FBSSxLQUFJLE9BQU8sR0FBRzs7OztFQUd6QyxNQUFJLEtBQUksR0FBSSxJQUFJLEdBQUc7R0FDbEI7R0FDQSxrQkFBa0I7U0FFbkIsSUFBSyxJQUFJLEdBQUc7T0FDUCxNQUFNLEVBQUU7R0FDWiw4QkFBYztJQUNiLE1BQU0sRUFBRSxxQkFBcUIsU0FBSyxJQUFJLEdBQUc7O1NBRTNDLElBQUssSUFBSSxHQUFHOztTQUdaLElBQUssSUFBSSxHQUFHO09BQ1AsS0FBSyxTQUFTOztHQUVsQixJQUFHLEtBQUksR0FBSSxLQUFJO0lBQ2Q7U0FDQSxZQUFZO1VBR2IsSUFBSyxnQkFBUTtJQUNaLElBQUcsS0FBSSxNQUFNLEdBQUcsRUFBRSxHQUFJLElBQUksR0FBSSxJQUFJLE1BQU0sR0FBRztLQUMxQyxtQkFBbUIsS0FBSSxJQUFJO1dBQzVCLElBQUssZUFBUTtLQUNaLHFCQUFxQixLQUFJLElBQUk7O0tBRTdCO0tBQ0Esa0JBQWtCOzs7U0FFbkIsUUFBTzs7O1NBR1QsSUFBSyxJQUFJLEdBQUc7R0FDWCwyQkFBMkIsS0FBSSxJQUFJO1NBRXBDLElBQUssSUFBSSxHQUFHO0dBQ1gsbUJBQW1CLEtBQUksSUFBSTtTQUU1QixLQUFLLGdCQUFRLE9BQU0sSUFBSSxlQUFRO0dBQzlCLHFCQUFxQixLQUFJLElBQUk7OztHQUc3QjtHQUNBLGtCQUFrQjs7O09BRW5CLE9BQU8sRUFBRTs7OztDQUdWO2NBQ0MsU0FBUyxHQUFHLGdCQUFTOzs7Q0FFdEI7RUFDQyxJQUFHLEtBQUssUUFBRztPQUNOLElBQUksR0FBRSxLQUFLLElBQUksS0FBSyxHQUFHLEtBQUssSUFBSSxjQUFhO1NBQ2hELE9BQU8sUUFBRyxNQUFNLFlBQVksRUFBRTtRQUMvQiw4QkFBVyxLQUFLO1FBQ2hCLE9BQU8sRUFBRTs7Ozs7OztJQUlSLE1BQU0sRUFBRSxLQUFLLElBQUk7QUFDckIsTUFBTSxXQUFXLEVBQUUsTUFBTTs7O0lBR3JCLE1BQU0sU0FBUyxVQUFVLGVBQWUsSUFBSyxVQUFVLE9BQU8sT0FBTyxpQkFBaUIsR0FBRztBQUM3RixJQUFHO0NBQ0Y7RUFDQyxJQUFHLEtBQUssUUFBRztRQUNWLEtBQUssWUFBWSxJQUFHLEtBQUssSUFBSSxLQUFLLEdBQUcsS0FBSyxJQUFJLGNBQWE7UUFDM0QsT0FBTyxFQUFFOzs7Ozs7Ozs7Ozs7cUNDcGFMOztBQVdOLFNBVFk7TUFVWCxLQUFLLEVBQUU7TUFDUCxNQUFNLEVBQUUsSUFBSTtNQUNaLEtBQUssRUFBRTtNQUNQLE9BQU8sRUFBRTtDQUNUOzs7O1FBZFc7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBTVo7YUFDQzs7O0FBVUQ7O2FBQ0Msa0NBQWEsS0FBSyxNQUFNLFlBQUs7Y0FDNUIsS0FBSzs7OztBQUVQO01BQ0MsTUFBTSxFQUFFO01BQ1IsTUFBTSxFQUFFLElBQUksS0FBSztNQUNqQixPQUFPLEVBQUU7Q0FDVCxLQUFLOzs7O0FBR047YUFDQyxNQUFNLE1BQU07OztBQUViO2FBQ0MsTUFBTSxRQUFJLE1BQU0sSUFBSTs7O0FBRXJCO2FBQ0MsTUFBTSxRQUFJLE1BQU07Ozs7SUFHUCxNQUFNO0lBQ2IsU0FBUzs7QUFVWixTQVJZOztNQVNYLE9BQU8sRUFBRTtNQUNULE1BQU07Q0FDTjtPQUNDLEtBQUssRUFBRSxTQUFTOzs7OztRQVpOO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUtaOztpQkFDVSxLQUFLLE1BQU0sS0FBSzs7O0FBUzFCO01BQ0M7Ozs7QUFHRDthQUNDLCtCQUFZOzs7QUFFYjtxQkFDUyxLQUFLOzs7QUFFZDtxQkFDUyxLQUFLLEtBQUssT0FBTzs7O0FBRTFCO2FBQ0MsTUFBTSxjQUFOLE1BQU0sV0FBUyxJQUFROzs7QUFFeEI7UUFDUSxLQUFLLFVBQVUsY0FBTzs7O0FBRTlCOztBQStCQTtDQUNDOztFQUNDLElBQUcsYUFBTTtVQUNELFFBQVEsUUFBUSxhQUFNOzs7U0FFOUIsU0FBUyxTQUFULFNBQVMsV0FBUztPQUNiLElBQUksUUFBUSxPQUFPLE1BQU07T0FDekIsS0FBSyxRQUFRLElBQUk7VUFDckIsUUFBUSxhQUFNLEtBQUssRUFBRTs7Ozs7QUFFeEI7O0tBQ0ssSUFBSSxFQUFFLFlBQUs7O0NBRWY7O0VBeUJDLElBQUc7R0FDRixHQUFHLEdBQUksR0FBRztzQ0FDWSxFQUFFOzs7TUFFckIsSUFBSSxNQUFFO0VBQ1YsSUFBSTtHQUNILElBQUksRUFBRSxZQUFLLEtBQUssRUFBRSxLQUFLLE1BQU0sSUFBSTtVQUNqQyxHQUFHLEdBQUksR0FBRzs7RUFDWCxJQUFJLFdBQVk7RUFDaEIsSUFBSTs7Ozs7O0FBSU47YUFDQywyQkFBWSxJQUFJOzs7Ozs7Ozs7Ozs7QUMvSWpCLFNBZlk7O01BZ0JYLEtBQUssRUFBRTs7Q0FFUDtFQUNDLE9BQU8sV0FBVztVQUNqQjs7Ozs7OztRQXBCUztBQUFBO0FBQUE7O0FBSVo7Q0FDQyxJQUFJLEVBQUUsSUFBSSx5QkFBMEI7O0tBRWhDLEtBQUs7S0FDTCxHQUFLO0NBQ1QsSUFBSSxFQUFFLElBQUk7Q0FDVixJQUFJLEVBQUUsSUFBSTtDQUNWLElBQUksRUFBRSxJQUFJOztRQUVIOzs7QUFXUjtDQUNDO0VBQ0MsU0FBUyxLQUFLLCtCQUEwQixRQUFRO0VBQ2hELEtBQUs7Ozs7O0FBR1A7YUFDQyxLQUFLOzs7QUFFTjthQUNDLEtBQUs7OztBQUVOO0tBQ0ssS0FBSyxFQUFFO0tBQ1AsRUFBRSxFQUFFLEtBQUs7UUFDYixFQUFFLEdBQUksRUFBRSxHQUFHOzs7QUFFWjsyQkFBaUI7UUFDaEIsWUFBSyxXQUFXLEdBQUcsRUFBRSxHQUFHOzs7QUFFekI7O3FDQUFtQztDQUNsQyxJQUFHLEtBQUs7O0VBRVAsS0FBSzs7O0NBRU4sSUFBRztFQUNGLFFBQVEsYUFBYSxNQUFNLEtBQUs7RUFDaEM7O0VBRUEsUUFBUSxVQUFVLE1BQU0sS0FBSztFQUM3Qjs7OztDQUdELEtBQUksS0FBSztFQUNSLE9BQU8sU0FBUyxFQUFFOzs7Ozs7QUFJcEI7S0FDSyxLQUFLLEVBQUUsWUFBSyxNQUFNLEVBQUU7Q0FDeEIsWUFBRztNQUNFLElBQUksRUFBRSxLQUFLLElBQUk7U0FDbkIsS0FBSyxPQUFPLEVBQUUsSUFBSSxRQUFRLEdBQUcsSUFBSSxNQUFNLEtBQUksR0FBRyxJQUFJLE9BQU8sR0FBRyxJQUFJLE9BQU8sR0FBRyxJQUFJLE9BQU8sR0FBRyxJQUFJLE9BQU8sR0FBRyxJQUFJO1FBQzNHLElBQUssZUFBUTtNQUNSLEVBQUUsRUFBRSxLQUFLLE1BQU07VUFDbkIsS0FBSyxHQUFHLEtBQUksRUFBRSxRQUFROztTQUV0Qjs7OztBQUVGO0tBQ0ssS0FBSyxFQUFFLFlBQUssTUFBTSxFQUFFOztDQUV4QixZQUFHO1NBQ0YsS0FBSyxHQUFHO1FBQ1QsSUFBSyxlQUFRO01BQ1IsRUFBRSxFQUFFLEtBQUssTUFBTTtVQUNuQixLQUFLLEdBQUcsS0FBSSxFQUFFLFFBQVE7O1NBRXRCOzs7O0FBRUk7Ozs7Q0FHTjtTQUNDLFdBQUk7OztDQUVMO01BQ0ssT0FBTyxFQUFFLGNBQU8sT0FBTztPQUMzQixjQUFjO09BQ2QsZ0JBQWdCLGNBQU8sTUFBTTtFQUM3QixJQUFHLE9BQU8sUUFBRztRQUNaLFFBQVEsRUFBRTtHQUNWLFNBQVMsa0JBQVc7Ozs7O0NBR3RCOzs7O0NBR0E7Ozs7OztBQUlNOztDQUVOO2NBQ0MsT0FBTyxHQUFHOzs7Q0FFWDs7TUFDSyxLQUFLLEVBQUUsWUFBSzs7RUFFaEIsSUFBRyxFQUFFLFFBQU0sUUFBUSxHQUFHLEVBQUUsUUFBTTtHQUM3QixFQUFFLFdBQVcsRUFBRTtVQUNSLEVBQUU7OztFQUVWLElBQU8sRUFBRSxFQUFFLEtBQUs7R0FDZixRQUFRLGFBQWEsRUFBRSxHQUFHLEVBQUU7a0JBQ3RCLEtBQUssRUFBRTtVQUNOLEVBQUUsVUFBUTs7O0VBRWxCLElBQUcsS0FBSyxHQUFHLE9BQU8sR0FBRyxLQUFLLEdBQUc7R0FDNUIsRUFBRSxVQUFRO0dBQ1YsY0FBTyxHQUFHO0dBQ1YsS0FBSyxPQUFPOztHQUVaLEVBQUUsV0FBVyxFQUFFO1VBQ1IsRUFBRTs7Ozs7Q0FHWDtTQUNDOzs7Ozs7Ozs7O3VDQ3ZJSzt5Q0FDQTt1Q0FDQTs7QUFFQTs7Q0FFTjtjQUNDLGVBQVUsUUFBUTs7O0NBRW5CO1NBQ0MsWUFBSzs7Ozs7V0FHQTs7Q0FFTjtTQUNDOzs7Q0FFRDs7OztDQUdBO1NBQ0MsV0FBSTs7O0NBRUw7RUFDQyxRQUFRO2FBQ1I7R0FDQyxRQUFRO1VBQ1IsV0FBVyxRQUFROzs7O0NBRXJCOztFQUNDLFFBQVEsa0JBQWtCLFdBQUk7O3lCQUV0Qjs0QkFDRjs7Ozs7MEJBdUJFOztzQkFFTDtzQkFDQTtxQkFDRztxQkFDQTtxQkFDQTtxQkFDQTs7Ozs7OzRCQTdCRCxZQUFJLGFBQU07NEJBQ1YsWUFBSSxhQUFNOzRCQUNWLFlBQUksZUFBUTs0QkFDWixZQUFJLGFBQU07OEJBQ1YsWUFBSSxhQUFNO01BQ1QsV0FBSSxTQUFPLFFBQVEsR0FBRzsrQkFDdEIsWUFBSSxhQUFNOzs7aUNBRVI7OEJBQ0gsZ0JBQVM7OEJBQ1QsZUFBUTs4QkFDUixlQUFROzhCQUNSLGFBQU07Ozs7SUFHTixjQUFPOztTQUVMLGNBQU87O1NBRVAsY0FBTzs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tDQ3REVDs7c0NBRUE7cUNBQ0E7c0NBQ0E7OztlQUdBOztDQUVOOzs4REFDUzs2QkFDSCxjQUFLO1NBQ0E7OzttQkFFUjtxQkFDTyxnQkFBUSxXQUFHLGdCQUFRLGFBQUs7O3NCQXVCdkIsYUFBTSwrQkFBMkI7O3FCQUVsQyxnQkFBUTs7c0JBU1AsYUFBTSwwQkFBc0I7O3FCQUU3QixnQkFBUTs7c0JBUVAsYUFBTSw0QkFBd0I7Ozs7O1VBL0M5Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Y0NYTDs7Ozs7O0NBSU47Ozs7OztjQUdNOztDQUVOOzs7Ozs7Ozs7Ozs7O0lDVEcsT0FBTztJQUNQLElBQUksT0FBRSxPQUFPOztBQUVqQjtnQkFDSyxZQUFNLGVBQVM7OzthQUViO0NBQ047Ozs7Q0FHQTtFQUNDLElBQUcsS0FBSyxRQUFHO1FBQ1YsTUFBTSxFQUFFO0dBQ1IsV0FBSSxVQUFVLEVBQUUsT0FBTyxnQkFBZ0I7Ozs7O0NBR3pDO09BQ0MsUUFBUSxJQUFJOzs7Ozs7Ozs7Ozs7QUNsQmQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxDQUFDO0FBQ0Q7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhLEVBQUU7QUFDZjtBQUNBLGtCQUFrQixHQUFHO0FBQ3JCLGtCQUFrQixJQUFJO0FBQ3RCO0FBQ0EsZ0NBQWdDLEdBQUc7QUFDbkM7QUFDQSwwQ0FBMEMsR0FBRztBQUM3QyxrREFBa0QsR0FBRyxzQkFBc0IsR0FBRztBQUM5RTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGlDQUFpQyxHQUFHO0FBQ3BDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSx1QkFBdUI7O0FBRXZCO0FBQ0E7QUFDQTs7QUFFQSxvQkFBb0I7QUFDcEIsaUJBQWlCLEdBQUcsR0FBRyxHQUFHO0FBQzFCO0FBQ0Esa0JBQWtCLElBQUk7QUFDdEIsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSx1QkFBdUI7QUFDdkI7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLEVBQUU7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGlCQUFpQix1QkFBdUI7QUFDeEM7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLFNBQVM7QUFDVDtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUEsaUJBQWlCLHVCQUF1QjtBQUN4QztBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxPQUFPOztBQUVQOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxZQUFZLE9BQU87QUFDbkI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxnQkFBZ0I7QUFDMUQsK0JBQStCLElBQUk7QUFDbkM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsaUJBQWlCLHVCQUF1QjtBQUN4QztBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsU0FBUztBQUNUO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQSxpQkFBaUIsdUJBQXVCO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNCQUFzQjtBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVLEdBQUc7QUFDYjtBQUNBLG1DQUFtQyxHQUFHO0FBQ3RDOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSx3QkFBd0I7O0FBRXhCO0FBQ0E7QUFDQTs7QUFFQSwwQkFBMEI7QUFDMUI7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBOztBQUVBLHFCQUFxQjtBQUNyQjtBQUNBLG1DQUFtQztBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7O0FBRUEsd0JBQXdCO0FBQ3hCLDJCQUEyQixHQUFHO0FBQzlCLG1DQUFtQyxHQUFHO0FBQ3RDLENBQUM7O0FBRUQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QjtBQUM5QjtBQUNBO0FBQ0E7QUFDQSw4QkFBOEI7QUFDOUI7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLEVBQUU7QUFDbkI7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxRQUFRLE9BQU87QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6Qjs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGlCQUFpQiw4QkFBOEI7QUFDL0MsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBOztBQUVBLGlCQUFpQiw2QkFBNkI7QUFDOUM7O0FBRUE7QUFDQSxtQkFBbUIsZ0JBQWdCO0FBQ25DO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esa0NBQWtDLGtCQUFrQjtBQUNwRCx3QkFBd0I7QUFDeEIsd0JBQXdCO0FBQ3hCLDBCQUEwQjtBQUMxQix5QkFBeUI7QUFDekI7O0FBRUE7QUFDQTtBQUNBLDhEQUE4RDtBQUM5RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsUUFBUSxzQkFBc0I7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7O0FBR0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxrQkFBa0IsNEJBQTRCOztBQUU5QztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBLFVBQVUsbUJBQW1CO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxPQUFPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCO0FBQzNCO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFD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UUFYRzs7OztNQUNILDhCQUFZOzswQ0FDTCxZQUFJLGNBQU0sZ0JBQVE7OEJBQ3RCLDBEQUFvQjs4QkFDcEI7Z0NBQ0M7Z0NBR0E7Ozs7d0JBTGM7Ozs7OztXQUdkLDRCQUFZOztrQkFBZSxLQUFLLEtBQUssSUFBSyxLQUFLO3VEQUM3Qyx3REFBb0IsU0FBTTs0QkFBWjs7Ozs7Ozs7V0FFaEIsNEJBQVk7O2tCQUFlLEtBQUssS0FBSyxJQUFLLEtBQUs7dURBQzdDLHdEQUFvQixTQUFNOzRCQUFaOzs7Ozs7Ozs7Ozs7O0tBRXBCLDhCQUFZOytCQUNDLFlBQUksbUJBQVQ7Ozs7Ozs7Ozs7Ozs7O0FDbk9aLHlDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSA0KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBjZjdhMmE2MDM0OTBkNDNkNGM5NCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSBcIi4vc3JjL2ltYmEvaW5kZXguaW1iYVwiXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvaW1iYS5pbWJhIiwiIyMjXG5JbWJhIGlzIHRoZSBuYW1lc3BhY2UgZm9yIGFsbCBydW50aW1lIHJlbGF0ZWQgdXRpbGl0aWVzXG5AbmFtZXNwYWNlXG4jIyNcbnZhciBJbWJhID0ge1ZFUlNJT046ICcxLjMuMC1iZXRhLjcnfVxuXG4jIyNcblxuTGlnaHQgd3JhcHBlciBhcm91bmQgbmF0aXZlIHNldFRpbWVvdXQgdGhhdCBleHBlY3RzIHRoZSBibG9jayAvIGZ1bmN0aW9uXG5hcyBsYXN0IGFyZ3VtZW50IChpbnN0ZWFkIG9mIGZpcnN0KS4gSXQgYWxzbyB0cmlnZ2VycyBhbiBldmVudCB0byBJbWJhXG5hZnRlciB0aGUgdGltZW91dCB0byBsZXQgc2NoZWR1bGVycyB1cGRhdGUgKHRvIHJlcmVuZGVyIGV0YykgYWZ0ZXJ3YXJkcy5cblxuIyMjXG5kZWYgSW1iYS5zZXRUaW1lb3V0IGRlbGF5LCAmYmxvY2tcblx0c2V0VGltZW91dCgmLGRlbGF5KSBkb1xuXHRcdGJsb2NrKClcblx0XHRJbWJhLmNvbW1pdFxuXG4jIyNcblxuTGlnaHQgd3JhcHBlciBhcm91bmQgbmF0aXZlIHNldEludGVydmFsIHRoYXQgZXhwZWN0cyB0aGUgYmxvY2sgLyBmdW5jdGlvblxuYXMgbGFzdCBhcmd1bWVudCAoaW5zdGVhZCBvZiBmaXJzdCkuIEl0IGFsc28gdHJpZ2dlcnMgYW4gZXZlbnQgdG8gSW1iYVxuYWZ0ZXIgZXZlcnkgaW50ZXJ2YWwgdG8gbGV0IHNjaGVkdWxlcnMgdXBkYXRlICh0byByZXJlbmRlciBldGMpIGFmdGVyd2FyZHMuXG5cbiMjI1xuZGVmIEltYmEuc2V0SW50ZXJ2YWwgaW50ZXJ2YWwsICZibG9ja1xuXHRzZXRJbnRlcnZhbChibG9jayxpbnRlcnZhbClcblxuIyMjXG5DbGVhciBpbnRlcnZhbCB3aXRoIHNwZWNpZmllZCBpZFxuIyMjXG5kZWYgSW1iYS5jbGVhckludGVydmFsIGlkXG5cdGNsZWFySW50ZXJ2YWwoaWQpXG5cbiMjI1xuQ2xlYXIgdGltZW91dCB3aXRoIHNwZWNpZmllZCBpZFxuIyMjXG5kZWYgSW1iYS5jbGVhclRpbWVvdXQgaWRcblx0Y2xlYXJUaW1lb3V0KGlkKVxuXG5cbmRlZiBJbWJhLnN1YmNsYXNzIG9iaiwgc3VwXG5cdGZvciBrLHYgb2Ygc3VwXG5cdFx0b2JqW2tdID0gdiBpZiBzdXAuaGFzT3duUHJvcGVydHkoaylcblxuXHRvYmo6cHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXA6cHJvdG90eXBlKVxuXHRvYmo6X19zdXBlcl9fID0gb2JqOnByb3RvdHlwZTpfX3N1cGVyX18gPSBzdXA6cHJvdG90eXBlXG5cdG9iajpwcm90b3R5cGU6aW5pdGlhbGl6ZSA9IG9iajpwcm90b3R5cGU6Y29uc3RydWN0b3IgPSBvYmpcblx0cmV0dXJuIG9ialxuXG4jIyNcbkxpZ2h0d2VpZ2h0IG1ldGhvZCBmb3IgbWFraW5nIGFuIG9iamVjdCBpdGVyYWJsZSBpbiBpbWJhcyBmb3IvaW4gbG9vcHMuXG5JZiB0aGUgY29tcGlsZXIgY2Fubm90IHNheSBmb3IgY2VydGFpbiB0aGF0IGEgdGFyZ2V0IGluIGEgZm9yIGxvb3AgaXMgYW5cbmFycmF5LCBpdCB3aWxsIGNhY2hlIHRoZSBpdGVyYWJsZSB2ZXJzaW9uIGJlZm9yZSBsb29waW5nLlxuXG5gYGBpbWJhXG4jIHRoaXMgaXMgdGhlIHdob2xlIG1ldGhvZFxuZGVmIEltYmEuaXRlcmFibGUgb1xuXHRyZXR1cm4gbyA/IChvOnRvQXJyYXkgPyBvLnRvQXJyYXkgOiBvKSA6IFtdXG5cbmNsYXNzIEN1c3RvbUl0ZXJhYmxlXG5cdGRlZiB0b0FycmF5XG5cdFx0WzEsMiwzXVxuXG4jIHdpbGwgcmV0dXJuIFsyLDQsNl1cbmZvciB4IGluIEN1c3RvbUl0ZXJhYmxlLm5ld1xuXHR4ICogMlxuXG5gYGBcbiMjI1xuZGVmIEltYmEuaXRlcmFibGUgb1xuXHRyZXR1cm4gbyA/IChvOnRvQXJyYXkgPyBvLnRvQXJyYXkgOiBvKSA6IFtdXG5cbiMjI1xuQ29lcmNlcyBhIHZhbHVlIGludG8gYSBwcm9taXNlLiBJZiB2YWx1ZSBpcyBhcnJheSBpdCB3aWxsXG5jYWxsIGBQcm9taXNlLmFsbCh2YWx1ZSlgLCBvciBpZiBpdCBpcyBub3QgYSBwcm9taXNlIGl0IHdpbGxcbndyYXAgdGhlIHZhbHVlIGluIGBQcm9taXNlLnJlc29sdmUodmFsdWUpYC4gVXNlZCBmb3IgZXhwZXJpbWVudGFsXG5hd2FpdCBzeW50YXguXG5AcmV0dXJuIHtQcm9taXNlfVxuIyMjXG5kZWYgSW1iYS5hd2FpdCB2YWx1ZVxuXHRpZiB2YWx1ZSBpc2EgQXJyYXlcblx0XHRjb25zb2xlLndhcm4oXCJhd2FpdCAoQXJyYXkpIGlzIGRlcHJlY2F0ZWQgLSB1c2UgYXdhaXQgUHJvbWlzZS5hbGwoQXJyYXkpXCIpXG5cdFx0UHJvbWlzZS5hbGwodmFsdWUpXG5cdGVsaWYgdmFsdWUgYW5kIHZhbHVlOnRoZW5cblx0XHR2YWx1ZVxuXHRlbHNlXG5cdFx0UHJvbWlzZS5yZXNvbHZlKHZhbHVlKVxuXG52YXIgZGFzaFJlZ2V4ID0gLy0uL2dcbnZhciBzZXR0ZXJDYWNoZSA9IHt9XG5cbmRlZiBJbWJhLnRvQ2FtZWxDYXNlIHN0clxuXHRpZiBzdHIuaW5kZXhPZignLScpID49IDBcblx0XHRzdHIucmVwbGFjZShkYXNoUmVnZXgpIGRvIHxtfCBtLmNoYXJBdCgxKS50b1VwcGVyQ2FzZVxuXHRlbHNlXG5cdFx0c3RyXG5cdFx0XG5kZWYgSW1iYS50b1NldHRlciBzdHJcblx0c2V0dGVyQ2FjaGVbc3RyXSB8fD0gSW1iYS50b0NhbWVsQ2FzZSgnc2V0LScgKyBzdHIpXG5cbmRlZiBJbWJhLmluZGV4T2YgYSxiXG5cdHJldHVybiAoYiAmJiBiOmluZGV4T2YpID8gYi5pbmRleE9mKGEpIDogW106aW5kZXhPZi5jYWxsKGEsYilcblxuZGVmIEltYmEubGVuIGFcblx0cmV0dXJuIGEgJiYgKGE6bGVuIGlzYSBGdW5jdGlvbiA/IGE6bGVuLmNhbGwoYSkgOiBhOmxlbmd0aCkgb3IgMFxuXG5kZWYgSW1iYS5wcm9wIHNjb3BlLCBuYW1lLCBvcHRzXG5cdGlmIHNjb3BlOmRlZmluZVByb3BlcnR5XG5cdFx0cmV0dXJuIHNjb3BlLmRlZmluZVByb3BlcnR5KG5hbWUsb3B0cylcblx0cmV0dXJuXG5cbmRlZiBJbWJhLmF0dHIgc2NvcGUsIG5hbWUsIG9wdHMgPSB7fVxuXHRpZiBzY29wZTpkZWZpbmVBdHRyaWJ1dGVcblx0XHRyZXR1cm4gc2NvcGUuZGVmaW5lQXR0cmlidXRlKG5hbWUsb3B0cylcblxuXHRsZXQgZ2V0TmFtZSA9IEltYmEudG9DYW1lbENhc2UobmFtZSlcblx0bGV0IHNldE5hbWUgPSBJbWJhLnRvQ2FtZWxDYXNlKCdzZXQtJyArIG5hbWUpXG5cdGxldCBwcm90byA9IHNjb3BlOnByb3RvdHlwZVxuXG5cdGlmIG9wdHM6ZG9tXG5cdFx0cHJvdG9bZ2V0TmFtZV0gPSBkbyB0aGlzLmRvbVtuYW1lXVxuXHRcdHByb3RvW3NldE5hbWVdID0gZG8gfHZhbHVlfFxuXHRcdFx0aWYgdmFsdWUgIT0gdGhpc1tuYW1lXSgpXG5cdFx0XHRcdHRoaXMuZG9tW25hbWVdID0gdmFsdWVcblx0XHRcdHJldHVybiB0aGlzXG5cdGVsc2Vcblx0XHRwcm90b1tnZXROYW1lXSA9IGRvIHRoaXMuZ2V0QXR0cmlidXRlKG5hbWUpXG5cdFx0cHJvdG9bc2V0TmFtZV0gPSBkbyB8dmFsdWV8XG5cdFx0XHR0aGlzLnNldEF0dHJpYnV0ZShuYW1lLHZhbHVlKVxuXHRcdFx0cmV0dXJuIHRoaXNcblx0cmV0dXJuXG5cbmRlZiBJbWJhLnByb3BEaWRTZXQgb2JqZWN0LCBwcm9wZXJ0eSwgdmFsLCBwcmV2XG5cdGxldCBmbiA9IHByb3BlcnR5OndhdGNoXG5cdGlmIGZuIGlzYSBGdW5jdGlvblxuXHRcdGZuLmNhbGwob2JqZWN0LHZhbCxwcmV2LHByb3BlcnR5KVxuXHRlbGlmIGZuIGlzYSBTdHJpbmcgYW5kIG9iamVjdFtmbl1cblx0XHRvYmplY3RbZm5dKHZhbCxwcmV2LHByb3BlcnR5KVxuXHRyZXR1cm5cblxuXG4jIEJhc2ljIGV2ZW50c1xuZGVmIGVtaXRfXyBldmVudCwgYXJncywgbm9kZVxuXHQjIHZhciBub2RlID0gY2JzW2V2ZW50XVxuXHR2YXIgcHJldiwgY2IsIHJldFxuXG5cdHdoaWxlIChwcmV2ID0gbm9kZSkgYW5kIChub2RlID0gbm9kZTpuZXh0KVxuXHRcdGlmIGNiID0gbm9kZTpsaXN0ZW5lclxuXHRcdFx0aWYgbm9kZTpwYXRoIGFuZCBjYltub2RlOnBhdGhdXG5cdFx0XHRcdHJldCA9IGFyZ3MgPyBjYltub2RlOnBhdGhdLmFwcGx5KGNiLGFyZ3MpIDogY2Jbbm9kZTpwYXRoXSgpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdCMgY2hlY2sgaWYgaXQgaXMgYSBtZXRob2Q/XG5cdFx0XHRcdHJldCA9IGFyZ3MgPyBjYi5hcHBseShub2RlLCBhcmdzKSA6IGNiLmNhbGwobm9kZSlcblxuXHRcdGlmIG5vZGU6dGltZXMgJiYgLS1ub2RlOnRpbWVzIDw9IDBcblx0XHRcdHByZXY6bmV4dCA9IG5vZGU6bmV4dFxuXHRcdFx0bm9kZTpsaXN0ZW5lciA9IG51bGxcblx0cmV0dXJuXG5cbiMgbWV0aG9kIGZvciByZWdpc3RlcmluZyBhIGxpc3RlbmVyIG9uIG9iamVjdFxuZGVmIEltYmEubGlzdGVuIG9iaiwgZXZlbnQsIGxpc3RlbmVyLCBwYXRoXG5cdHZhciBjYnMsIGxpc3QsIHRhaWxcblx0Y2JzID0gb2JqOl9fbGlzdGVuZXJzX18gfHw9IHt9XG5cdGxpc3QgPSBjYnNbZXZlbnRdIHx8PSB7fVxuXHR0YWlsID0gbGlzdDp0YWlsIHx8IChsaXN0OnRhaWwgPSAobGlzdDpuZXh0ID0ge30pKVxuXHR0YWlsOmxpc3RlbmVyID0gbGlzdGVuZXJcblx0dGFpbDpwYXRoID0gcGF0aFxuXHRsaXN0OnRhaWwgPSB0YWlsOm5leHQgPSB7fVxuXHRyZXR1cm4gdGFpbFxuXG4jIHJlZ2lzdGVyIGEgbGlzdGVuZXIgb25jZVxuZGVmIEltYmEub25jZSBvYmosIGV2ZW50LCBsaXN0ZW5lclxuXHR2YXIgdGFpbCA9IEltYmEubGlzdGVuKG9iaixldmVudCxsaXN0ZW5lcilcblx0dGFpbDp0aW1lcyA9IDFcblx0cmV0dXJuIHRhaWxcblxuIyByZW1vdmUgYSBsaXN0ZW5lclxuZGVmIEltYmEudW5saXN0ZW4gb2JqLCBldmVudCwgY2IsIG1ldGhcblx0dmFyIG5vZGUsIHByZXZcblx0dmFyIG1ldGEgPSBvYmo6X19saXN0ZW5lcnNfX1xuXHRyZXR1cm4gdW5sZXNzIG1ldGFcblxuXHRpZiBub2RlID0gbWV0YVtldmVudF1cblx0XHR3aGlsZSAocHJldiA9IG5vZGUpIGFuZCAobm9kZSA9IG5vZGU6bmV4dClcblx0XHRcdGlmIG5vZGUgPT0gY2IgfHwgbm9kZTpsaXN0ZW5lciA9PSBjYlxuXHRcdFx0XHRwcmV2Om5leHQgPSBub2RlOm5leHRcblx0XHRcdFx0IyBjaGVjayBmb3IgY29ycmVjdCBwYXRoIGFzIHdlbGw/XG5cdFx0XHRcdG5vZGU6bGlzdGVuZXIgPSBudWxsXG5cdFx0XHRcdGJyZWFrXG5cdHJldHVyblxuXG4jIGVtaXQgZXZlbnRcbmRlZiBJbWJhLmVtaXQgb2JqLCBldmVudCwgcGFyYW1zXG5cdGlmIHZhciBjYiA9IG9iajpfX2xpc3RlbmVyc19fXG5cdFx0ZW1pdF9fKGV2ZW50LHBhcmFtcyxjYltldmVudF0pIGlmIGNiW2V2ZW50XVxuXHRcdGVtaXRfXyhldmVudCxbZXZlbnQscGFyYW1zXSxjYjphbGwpIGlmIGNiOmFsbCAjIGFuZCBldmVudCAhPSAnYWxsJ1xuXHRyZXR1cm5cblxuZGVmIEltYmEub2JzZXJ2ZVByb3BlcnR5IG9ic2VydmVyLCBrZXksIHRyaWdnZXIsIHRhcmdldCwgcHJldlxuXHRpZiBwcmV2IGFuZCB0eXBlb2YgcHJldiA9PSAnb2JqZWN0J1xuXHRcdEltYmEudW5saXN0ZW4ocHJldiwnYWxsJyxvYnNlcnZlcix0cmlnZ2VyKVxuXHRpZiB0YXJnZXQgYW5kIHR5cGVvZiB0YXJnZXQgPT0gJ29iamVjdCdcblx0XHRJbWJhLmxpc3Rlbih0YXJnZXQsJ2FsbCcsb2JzZXJ2ZXIsdHJpZ2dlcilcblx0c2VsZlxuXG5tb2R1bGU6ZXhwb3J0cyA9IEltYmFcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2ltYmEuaW1iYSIsImV4cG9ydCB0YWcgUGFnZVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9QYWdlLmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbmNsYXNzIEltYmEuUG9pbnRlclxuXHRcblx0ZGVmIGluaXRpYWxpemVcblx0XHRAYnV0dG9uID0gLTFcblx0XHRAZXZlbnQgPSB7eDogMCwgeTogMCwgdHlwZTogJ3VuaW5pdGlhbGl6ZWQnfVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIGJ1dHRvblxuXHRcdEBidXR0b25cblxuXHRkZWYgdG91Y2hcblx0XHRAdG91Y2hcblxuXHRkZWYgdXBkYXRlIGVcblx0XHRAZXZlbnQgPSBlXG5cdFx0QGRpcnR5ID0geWVzXG5cdFx0c2VsZlxuXG5cdCMgdGhpcyBpcyBqdXN0IGZvciByZWd1bGFyIG1vdXNlIG5vd1xuXHRkZWYgcHJvY2Vzc1xuXHRcdHZhciBlMSA9IEBldmVudFxuXG5cdFx0aWYgQGRpcnR5XG5cdFx0XHRAcHJldkV2ZW50ID0gZTFcblx0XHRcdEBkaXJ0eSA9IG5vXG5cblx0XHRcdCMgYnV0dG9uIHNob3VsZCBvbmx5IGNoYW5nZSBvbiBtb3VzZWRvd24gZXRjXG5cdFx0XHRpZiBlMTp0eXBlID09ICdtb3VzZWRvd24nXG5cdFx0XHRcdEBidXR0b24gPSBlMTpidXR0b25cblxuXHRcdFx0XHRpZiAoQHRvdWNoIGFuZCBAYnV0dG9uICE9IDApXG5cdFx0XHRcdFx0cmV0dXJuXG5cblx0XHRcdFx0IyBjYW5jZWwgdGhlIHByZXZpb3VzIHRvdWNoXG5cdFx0XHRcdEB0b3VjaC5jYW5jZWwgaWYgQHRvdWNoXG5cdFx0XHRcdEB0b3VjaCA9IEltYmEuVG91Y2gubmV3KGUxLHNlbGYpXG5cdFx0XHRcdEB0b3VjaC5tb3VzZWRvd24oZTEsZTEpXG5cblx0XHRcdGVsaWYgZTE6dHlwZSA9PSAnbW91c2Vtb3ZlJ1xuXHRcdFx0XHRAdG91Y2gubW91c2Vtb3ZlKGUxLGUxKSBpZiBAdG91Y2hcblxuXHRcdFx0ZWxpZiBlMTp0eXBlID09ICdtb3VzZXVwJ1xuXHRcdFx0XHRAYnV0dG9uID0gLTFcblxuXHRcdFx0XHRpZiBAdG91Y2ggYW5kIEB0b3VjaC5idXR0b24gPT0gZTE6YnV0dG9uXG5cdFx0XHRcdFx0QHRvdWNoLm1vdXNldXAoZTEsZTEpXG5cdFx0XHRcdFx0QHRvdWNoID0gbnVsbFxuXHRcdFx0XHQjIHRyaWdnZXIgcG9pbnRlcnVwXG5cdFx0ZWxpZiBAdG91Y2hcblx0XHRcdEB0b3VjaC5pZGxlXG5cdFx0c2VsZlxuXG5cdGRlZiB4IGRvIEBldmVudDp4XG5cdGRlZiB5IGRvIEBldmVudDp5XG5cdFxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9wb2ludGVyLmltYmEiLCJcbmltcG9ydCBBcHAgZnJvbSAnLi9hcHAnXG5pbXBvcnQgU2l0ZSBmcm9tICcuL3ZpZXdzL1NpdGUnXG5kb2N1bWVudDpib2R5OmlubmVySFRNTCA9ICcnIFxuSW1iYS5tb3VudCA8U2l0ZVtBcHAuZGVzZXJpYWxpemUoQVBQQ0FDSEUpXT5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvY2xpZW50LmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuL2ltYmFcIilcbnZhciBhY3RpdmF0ZSA9IG5vXG5pZiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuXHRpZiB3aW5kb3cuSW1iYVxuXHRcdGNvbnNvbGUud2FybiBcIkltYmEgdnt3aW5kb3cuSW1iYS5WRVJTSU9OfSBpcyBhbHJlYWR5IGxvYWRlZC5cIlxuXHRcdEltYmEgPSB3aW5kb3cuSW1iYVxuXHRlbHNlXG5cdFx0d2luZG93LkltYmEgPSBJbWJhXG5cdFx0YWN0aXZhdGUgPSB5ZXNcblx0XHRpZiB3aW5kb3c6ZGVmaW5lIGFuZCB3aW5kb3c6ZGVmaW5lOmFtZFxuXHRcdFx0d2luZG93LmRlZmluZShcImltYmFcIixbXSkgZG8gcmV0dXJuIEltYmFcblxubW9kdWxlLmV4cG9ydHMgPSBJbWJhXG5cbnVubGVzcyAkd2Vid29ya2VyJFxuXHRyZXF1aXJlICcuL3NjaGVkdWxlcidcblx0cmVxdWlyZSAnLi9kb20vaW5kZXgnXG5cbmlmICR3ZWIkIGFuZCBhY3RpdmF0ZVxuXHRJbWJhLkV2ZW50TWFuYWdlci5hY3RpdmF0ZVxuXHRcbmlmICRub2RlJFxuXHR1bmxlc3MgJHdlYnBhY2skXG5cdFx0cmVxdWlyZSAnLi4vLi4vcmVnaXN0ZXIuanMnXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9pbmRleC5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi9pbWJhXCIpXG5cbnZhciByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgIyB2ZXJ5IHNpbXBsZSByYWYgcG9seWZpbGxcbnZhciBjYW5jZWxBbmltYXRpb25GcmFtZVxuXG5pZiAkbm9kZSRcblx0Y2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBkbyB8aWR8IGNsZWFyVGltZW91dChpZClcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZG8gfGJsa3wgc2V0VGltZW91dChibGssMTAwMCAvIDYwKVxuXG5pZiAkd2ViJFxuXHRjYW5jZWxBbmltYXRpb25GcmFtZSA9IHdpbmRvdzpjYW5jZWxBbmltYXRpb25GcmFtZSB8fCB3aW5kb3c6bW96Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93OndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3c6cmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSB8fD0gd2luZG93OndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHw9IHdpbmRvdzptb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8PSBkbyB8YmxrfCBzZXRUaW1lb3V0KGJsaywxMDAwIC8gNjApXG5cbmNsYXNzIFRpY2tlclxuXG5cdHByb3Agc3RhZ2Vcblx0cHJvcCBxdWV1ZVxuXG5cdGRlZiBpbml0aWFsaXplXG5cdFx0QHF1ZXVlID0gW11cblx0XHRAc3RhZ2UgPSAtMVxuXHRcdEBzY2hlZHVsZWQgPSBub1xuXHRcdEB0aWNrZXIgPSBkbyB8ZXxcblx0XHRcdEBzY2hlZHVsZWQgPSBub1xuXHRcdFx0dGljayhlKVxuXHRcdHNlbGZcblxuXHRkZWYgYWRkIGl0ZW0sIGZvcmNlXG5cdFx0aWYgZm9yY2Ugb3IgQHF1ZXVlLmluZGV4T2YoaXRlbSkgPT0gLTFcblx0XHRcdEBxdWV1ZS5wdXNoKGl0ZW0pXG5cblx0XHRzY2hlZHVsZSB1bmxlc3MgQHNjaGVkdWxlZFxuXG5cdGRlZiB0aWNrIHRpbWVzdGFtcFxuXHRcdHZhciBpdGVtcyA9IEBxdWV1ZVxuXHRcdEB0cyA9IHRpbWVzdGFtcCB1bmxlc3MgQHRzXG5cdFx0QGR0ID0gdGltZXN0YW1wIC0gQHRzXG5cdFx0QHRzID0gdGltZXN0YW1wXG5cdFx0QHF1ZXVlID0gW11cblx0XHRAc3RhZ2UgPSAxXG5cdFx0YmVmb3JlXG5cdFx0aWYgaXRlbXM6bGVuZ3RoXG5cdFx0XHRmb3IgaXRlbSxpIGluIGl0ZW1zXG5cdFx0XHRcdGlmIGl0ZW0gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdFx0aXRlbShAZHQsc2VsZilcblx0XHRcdFx0ZWxpZiBpdGVtOnRpY2tcblx0XHRcdFx0XHRpdGVtLnRpY2soQGR0LHNlbGYpXG5cdFx0QHN0YWdlID0gMlxuXHRcdGFmdGVyXG5cdFx0QHN0YWdlID0gQHNjaGVkdWxlZCA/IDAgOiAtMVxuXHRcdHNlbGZcblxuXHRkZWYgc2NoZWR1bGVcblx0XHRpZiAhQHNjaGVkdWxlZFxuXHRcdFx0QHNjaGVkdWxlZCA9IHllc1xuXHRcdFx0aWYgQHN0YWdlID09IC0xXG5cdFx0XHRcdEBzdGFnZSA9IDBcblx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZShAdGlja2VyKVxuXHRcdHNlbGZcblxuXHRkZWYgYmVmb3JlXG5cdFx0c2VsZlxuXG5cdGRlZiBhZnRlclxuXHRcdGlmIEltYmEuVGFnTWFuYWdlclxuXHRcdFx0SW1iYS5UYWdNYW5hZ2VyLnJlZnJlc2hcblx0XHRzZWxmXG5cbkltYmEuVElDS0VSID0gVGlja2VyLm5ld1xuSW1iYS5TQ0hFRFVMRVJTID0gW11cblxuZGVmIEltYmEudGlja2VyXG5cdEltYmEuVElDS0VSXG5cbmRlZiBJbWJhLnJlcXVlc3RBbmltYXRpb25GcmFtZSBjYWxsYmFja1xuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2FsbGJhY2spXG5cbmRlZiBJbWJhLmNhbmNlbEFuaW1hdGlvbkZyYW1lIGlkXG5cdGNhbmNlbEFuaW1hdGlvbkZyYW1lKGlkKVxuXG4jIHNob3VsZCBhZGQgYW4gSW1iYS5ydW4gLyBzZXRJbW1lZGlhdGUgdGhhdFxuIyBwdXNoZXMgbGlzdGVuZXIgb250byB0aGUgdGljay1xdWV1ZSB3aXRoIHRpbWVzIC0gb25jZVxuXG52YXIgY29tbWl0UXVldWUgPSAwXG5cbmRlZiBJbWJhLmNvbW1pdCBwYXJhbXNcblx0Y29tbWl0UXVldWUrK1xuXHQjIEltYmEuVGFnTWFuYWdlci5yZWZyZXNoXG5cdEltYmEuZW1pdChJbWJhLCdjb21taXQnLHBhcmFtcyAhPSB1bmRlZmluZWQgPyBbcGFyYW1zXSA6IHVuZGVmaW5lZClcblx0aWYgLS1jb21taXRRdWV1ZSA9PSAwXG5cdFx0SW1iYS5UYWdNYW5hZ2VyIGFuZCBJbWJhLlRhZ01hbmFnZXIucmVmcmVzaFxuXHRyZXR1cm5cblxuIyMjXG5cbkluc3RhbmNlcyBvZiBJbWJhLlNjaGVkdWxlciBtYW5hZ2VzIHdoZW4gdG8gY2FsbCBgdGljaygpYCBvbiB0aGVpciB0YXJnZXQsXG5hdCBhIHNwZWNpZmllZCBmcmFtZXJhdGUgb3Igd2hlbiBjZXJ0YWluIGV2ZW50cyBvY2N1ci4gUm9vdC1ub2RlcyBpbiB5b3VyXG5hcHBsaWNhdGlvbnMgd2lsbCB1c3VhbGx5IGhhdmUgYSBzY2hlZHVsZXIgdG8gbWFrZSBzdXJlIHRoZXkgcmVyZW5kZXIgd2hlblxuc29tZXRoaW5nIGNoYW5nZXMuIEl0IGlzIGFsc28gcG9zc2libGUgdG8gbWFrZSBpbm5lciBjb21wb25lbnRzIHVzZSB0aGVpclxub3duIHNjaGVkdWxlcnMgdG8gY29udHJvbCB3aGVuIHRoZXkgcmVuZGVyLlxuXG5AaW5hbWUgc2NoZWR1bGVyXG5cbiMjI1xuY2xhc3MgSW1iYS5TY2hlZHVsZXJcblx0XG5cdHZhciBjb3VudGVyID0gMFxuXG5cdGRlZiBzZWxmLmV2ZW50IGVcblx0XHRJbWJhLmVtaXQoSW1iYSwnZXZlbnQnLGUpXG5cblx0IyMjXG5cdENyZWF0ZSBhIG5ldyBJbWJhLlNjaGVkdWxlciBmb3Igc3BlY2lmaWVkIHRhcmdldFxuXHRAcmV0dXJuIHtJbWJhLlNjaGVkdWxlcn1cblx0IyMjXG5cdGRlZiBpbml0aWFsaXplIHRhcmdldFxuXHRcdEBpZCA9IGNvdW50ZXIrK1xuXHRcdEB0YXJnZXQgPSB0YXJnZXRcblx0XHRAbWFya2VkID0gbm9cblx0XHRAYWN0aXZlID0gbm9cblx0XHRAbWFya2VyID0gZG8gbWFya1xuXHRcdEB0aWNrZXIgPSBkbyB8ZXwgdGljayhlKVxuXG5cdFx0QGR0ID0gMFxuXHRcdEBmcmFtZSA9IHt9XG5cdFx0QHNjaGVkdWxlZCA9IG5vXG5cdFx0QHRpbWVzdGFtcCA9IDBcblx0XHRAdGlja3MgPSAwXG5cdFx0QGZsdXNoZXMgPSAwXG5cblx0XHRzZWxmOm9uZXZlbnQgPSBzZWxmOm9uZXZlbnQuYmluZChzZWxmKVxuXHRcdHNlbGZcblxuXHRwcm9wIHJhZiB3YXRjaDogeWVzXG5cdHByb3AgaW50ZXJ2YWwgd2F0Y2g6IHllc1xuXHRwcm9wIGV2ZW50cyB3YXRjaDogeWVzXG5cdHByb3AgbWFya2VkXG5cblx0ZGVmIHJhZkRpZFNldCBib29sXG5cdFx0cmVxdWVzdFRpY2sgaWYgYm9vbCBhbmQgQGFjdGl2ZVxuXHRcdHNlbGZcblxuXHRkZWYgaW50ZXJ2YWxEaWRTZXQgdGltZVxuXHRcdGNsZWFySW50ZXJ2YWwoQGludGVydmFsSWQpXG5cdFx0QGludGVydmFsSWQgPSBudWxsXG5cdFx0aWYgdGltZSBhbmQgQGFjdGl2ZVxuXHRcdFx0QGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChzZWxmOm9uaW50ZXJ2YWwuYmluZChzZWxmKSx0aW1lKVxuXHRcdHNlbGZcblxuXHRkZWYgZXZlbnRzRGlkU2V0IG5ldywgcHJldlxuXHRcdGlmIEBhY3RpdmUgYW5kIG5ldyBhbmQgIXByZXZcblx0XHRcdEltYmEubGlzdGVuKEltYmEsJ2NvbW1pdCcsc2VsZiwnb25ldmVudCcpXG5cdFx0ZWxpZiAhbmV3IGFuZCBwcmV2XG5cdFx0XHRJbWJhLnVubGlzdGVuKEltYmEsJ2NvbW1pdCcsc2VsZiwnb25ldmVudCcpXG5cblx0IyMjXG5cdENoZWNrIHdoZXRoZXIgdGhlIGN1cnJlbnQgc2NoZWR1bGVyIGlzIGFjdGl2ZSBvciBub3Rcblx0QHJldHVybiB7Ym9vbH1cblx0IyMjXG5cdGRlZiBhY3RpdmVcblx0XHRAYWN0aXZlXG5cblx0IyMjXG5cdERlbHRhIHRpbWUgYmV0d2VlbiB0aGUgdHdvIGxhc3QgdGlja3Ncblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGR0XG5cdFx0QGR0XG5cblx0IyMjXG5cdENvbmZpZ3VyZSB0aGUgc2NoZWR1bGVyXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgY29uZmlndXJlIG9wdGlvbnMgPSB7fVxuXHRcdHJhZiA9IG9wdGlvbnM6cmFmIGlmIG9wdGlvbnM6cmFmICE9IHVuZGVmaW5lZFxuXHRcdGludGVydmFsID0gb3B0aW9uczppbnRlcnZhbCBpZiBvcHRpb25zOmludGVydmFsICE9IHVuZGVmaW5lZFxuXHRcdGV2ZW50cyA9IG9wdGlvbnM6ZXZlbnRzIGlmIG9wdGlvbnM6ZXZlbnRzICE9IHVuZGVmaW5lZFxuXHRcdHNlbGZcblxuXHQjIyNcblx0TWFyayB0aGUgc2NoZWR1bGVyIGFzIGRpcnR5LiBUaGlzIHdpbGwgbWFrZSBzdXJlIHRoYXRcblx0dGhlIHNjaGVkdWxlciBjYWxscyBgdGFyZ2V0LnRpY2tgIG9uIHRoZSBuZXh0IGZyYW1lXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgbWFya1xuXHRcdEBtYXJrZWQgPSB5ZXNcblx0XHRpZiAhQHNjaGVkdWxlZFxuXHRcdFx0cmVxdWVzdFRpY2tcblx0XHRzZWxmXG5cblx0IyMjXG5cdEluc3RhbnRseSB0cmlnZ2VyIHRhcmdldC50aWNrIGFuZCBtYXJrIHNjaGVkdWxlciBhcyBjbGVhbiAobm90IGRpcnR5L21hcmtlZCkuXG5cdFRoaXMgaXMgY2FsbGVkIGltcGxpY2l0bHkgZnJvbSB0aWNrLCBidXQgY2FuIGFsc28gYmUgY2FsbGVkIG1hbnVhbGx5IGlmIHlvdVxuXHRyZWFsbHkgd2FudCB0byBmb3JjZSBhIHRpY2sgd2l0aG91dCB3YWl0aW5nIGZvciB0aGUgbmV4dCBmcmFtZS5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBmbHVzaFxuXHRcdEBmbHVzaGVzKytcblx0XHRAdGFyZ2V0LnRpY2soc2VsZilcblx0XHRAbWFya2VkID0gbm9cblx0XHRzZWxmXG5cblx0IyMjXG5cdEBmaXhtZSB0aGlzIGV4cGVjdHMgcmFmIHRvIHJ1biBhdCA2MCBmcHMgXG5cblx0Q2FsbGVkIGF1dG9tYXRpY2FsbHkgb24gZXZlcnkgZnJhbWUgd2hpbGUgdGhlIHNjaGVkdWxlciBpcyBhY3RpdmUuXG5cdEl0IHdpbGwgb25seSBjYWxsIGB0YXJnZXQudGlja2AgaWYgdGhlIHNjaGVkdWxlciBpcyBtYXJrZWQgZGlydHksXG5cdG9yIHdoZW4gYWNjb3JkaW5nIHRvIEBmcHMgc2V0dGluZy5cblxuXHRJZiB5b3UgaGF2ZSBzZXQgdXAgYSBzY2hlZHVsZXIgd2l0aCBhbiBmcHMgb2YgMSwgdGljayB3aWxsIHN0aWxsIGJlXG5cdGNhbGxlZCBldmVyeSBmcmFtZSwgYnV0IGB0YXJnZXQudGlja2Agd2lsbCBvbmx5IGJlIGNhbGxlZCBvbmNlIGV2ZXJ5XG5cdHNlY29uZCwgYW5kIGl0IHdpbGwgKm1ha2Ugc3VyZSogZWFjaCBgdGFyZ2V0LnRpY2tgIGhhcHBlbnMgaW4gc2VwYXJhdGVcblx0c2Vjb25kcyBhY2NvcmRpbmcgdG8gRGF0ZS4gU28gaWYgeW91IGhhdmUgYSBub2RlIHRoYXQgcmVuZGVycyBhIGNsb2NrXG5cdGJhc2VkIG9uIERhdGUubm93IChvciBzb21ldGhpbmcgc2ltaWxhciksIHlvdSBjYW4gc2NoZWR1bGUgaXQgd2l0aCAxZnBzLFxuXHRuZXZlciBuZWVkaW5nIHRvIHdvcnJ5IGFib3V0IHR3byB0aWNrcyBoYXBwZW5pbmcgd2l0aGluIHRoZSBzYW1lIHNlY29uZC5cblx0VGhlIHNhbWUgZ29lcyBmb3IgNGZwcywgMTBmcHMgZXRjLlxuXG5cdEBwcm90ZWN0ZWRcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiB0aWNrIGRlbHRhLCB0aWNrZXJcblx0XHRAdGlja3MrK1xuXHRcdEBkdCA9IGRlbHRhXG5cblx0XHRpZiB0aWNrZXJcblx0XHRcdEBzY2hlZHVsZWQgPSBub1xuXG5cdFx0Zmx1c2hcblxuXHRcdGlmIEByYWYgYW5kIEBhY3RpdmVcblx0XHRcdHJlcXVlc3RUaWNrXG5cdFx0c2VsZlxuXG5cdGRlZiByZXF1ZXN0VGlja1xuXHRcdHVubGVzcyBAc2NoZWR1bGVkXG5cdFx0XHRAc2NoZWR1bGVkID0geWVzXG5cdFx0XHRJbWJhLlRJQ0tFUi5hZGQoc2VsZilcblx0XHRzZWxmXG5cblx0IyMjXG5cdFN0YXJ0IHRoZSBzY2hlZHVsZXIgaWYgaXQgaXMgbm90IGFscmVhZHkgYWN0aXZlLlxuXHQqKldoaWxlIGFjdGl2ZSoqLCB0aGUgc2NoZWR1bGVyIHdpbGwgb3ZlcnJpZGUgYHRhcmdldC5jb21taXRgXG5cdHRvIGRvIG5vdGhpbmcuIEJ5IGRlZmF1bHQgSW1iYS50YWcjY29tbWl0IGNhbGxzIHJlbmRlciwgc29cblx0dGhhdCByZW5kZXJpbmcgaXMgY2FzY2FkZWQgdGhyb3VnaCB0byBjaGlsZHJlbiB3aGVuIHJlbmRlcmluZ1xuXHRhIG5vZGUuIFdoZW4gYSBzY2hlZHVsZXIgaXMgYWN0aXZlIChmb3IgYSBub2RlKSwgSW1iYSBkaXNhYmxlc1xuXHR0aGlzIGF1dG9tYXRpYyByZW5kZXJpbmcuXG5cdCMjI1xuXHRkZWYgYWN0aXZhdGUgaW1tZWRpYXRlID0geWVzXG5cdFx0dW5sZXNzIEBhY3RpdmVcblx0XHRcdEBhY3RpdmUgPSB5ZXNcblx0XHRcdEBjb21taXQgPSBAdGFyZ2V0OmNvbW1pdFxuXHRcdFx0QHRhcmdldDpjb21taXQgPSBkbyB0aGlzXG5cdFx0XHRAdGFyZ2V0Py5mbGFnKCdzY2hlZHVsZWRfJylcblx0XHRcdEltYmEuU0NIRURVTEVSUy5wdXNoKHNlbGYpXG5cdFx0XHRcblx0XHRcdGlmIEBldmVudHNcblx0XHRcdFx0SW1iYS5saXN0ZW4oSW1iYSwnY29tbWl0JyxzZWxmLCdvbmV2ZW50Jylcblx0XHRcdFx0XG5cdFx0XHRpZiBAaW50ZXJ2YWwgYW5kICFAaW50ZXJ2YWxJZFxuXHRcdFx0XHRAaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKHNlbGY6b25pbnRlcnZhbC5iaW5kKHNlbGYpLEBpbnRlcnZhbClcblxuXHRcdFx0aWYgaW1tZWRpYXRlXG5cdFx0XHRcdHRpY2soMClcblx0XHRcdGVsaWYgQHJhZlxuXHRcdFx0XHRyZXF1ZXN0VGlja1xuXHRcdHJldHVybiBzZWxmXG5cblx0IyMjXG5cdFN0b3AgdGhlIHNjaGVkdWxlciBpZiBpdCBpcyBhY3RpdmUuXG5cdCMjI1xuXHRkZWYgZGVhY3RpdmF0ZVxuXHRcdGlmIEBhY3RpdmVcblx0XHRcdEBhY3RpdmUgPSBub1xuXHRcdFx0QHRhcmdldDpjb21taXQgPSBAY29tbWl0XG5cdFx0XHRsZXQgaWR4ID0gSW1iYS5TQ0hFRFVMRVJTLmluZGV4T2Yoc2VsZilcblx0XHRcdGlmIGlkeCA+PSAwXG5cdFx0XHRcdEltYmEuU0NIRURVTEVSUy5zcGxpY2UoaWR4LDEpXG5cdFx0XHRcdFxuXHRcdFx0aWYgQGV2ZW50c1xuXHRcdFx0XHRJbWJhLnVubGlzdGVuKEltYmEsJ2NvbW1pdCcsc2VsZiwnb25ldmVudCcpXG5cblx0XHRcdGlmIEBpbnRlcnZhbElkXG5cdFx0XHRcdGNsZWFySW50ZXJ2YWwoQGludGVydmFsSWQpXG5cdFx0XHRcdEBpbnRlcnZhbElkID0gbnVsbFxuXHRcdFx0XG5cdFx0XHRAdGFyZ2V0Py51bmZsYWcoJ3NjaGVkdWxlZF8nKVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIHRyYWNrXG5cdFx0QG1hcmtlclxuXHRcdFxuXHRkZWYgb25pbnRlcnZhbFxuXHRcdHRpY2tcblx0XHRJbWJhLlRhZ01hbmFnZXIucmVmcmVzaFxuXHRcdHNlbGZcblxuXHRkZWYgb25ldmVudCBldmVudFxuXHRcdHJldHVybiBzZWxmIGlmICFAZXZlbnRzIG9yIEBtYXJrZWRcblxuXHRcdGlmIEBldmVudHMgaXNhIEZ1bmN0aW9uXG5cdFx0XHRtYXJrIGlmIEBldmVudHMoZXZlbnQsc2VsZilcblx0XHRlbGlmIEBldmVudHMgaXNhIEFycmF5XG5cdFx0XHRpZiBAZXZlbnRzLmluZGV4T2YoKGV2ZW50IGFuZCBldmVudDp0eXBlKSBvciBldmVudCkgPj0gMFxuXHRcdFx0XHRtYXJrXG5cdFx0ZWxzZVxuXHRcdFx0bWFya1xuXHRcdHNlbGZcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL3NjaGVkdWxlci5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG5yZXF1aXJlICcuL21hbmFnZXInXG5cbkltYmEuVGFnTWFuYWdlciA9IEltYmEuVGFnTWFuYWdlckNsYXNzLm5ld1xuXG5yZXF1aXJlICcuL3RhZydcbnJlcXVpcmUgJy4vaHRtbCdcbnJlcXVpcmUgJy4vcG9pbnRlcidcbnJlcXVpcmUgJy4vdG91Y2gnXG5yZXF1aXJlICcuL2V2ZW50J1xucmVxdWlyZSAnLi9ldmVudC1tYW5hZ2VyJ1xuXG5pZiAkd2ViJFxuXHRyZXF1aXJlICcuL3JlY29uY2lsZXInXG5cbmlmICRub2RlJFxuXHRyZXF1aXJlICcuL3NlcnZlcidcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vaW5kZXguaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuY2xhc3MgSW1iYS5UYWdNYW5hZ2VyQ2xhc3Ncblx0ZGVmIGluaXRpYWxpemVcblx0XHRAaW5zZXJ0cyA9IDBcblx0XHRAcmVtb3ZlcyA9IDBcblx0XHRAbW91bnRlZCA9IFtdXG5cdFx0QGhhc01vdW50YWJsZXMgPSBub1xuXHRcdHNlbGZcblxuXHRkZWYgbW91bnRlZFxuXHRcdEBtb3VudGVkXG5cblx0ZGVmIGluc2VydCBub2RlLCBwYXJlbnRcblx0XHRAaW5zZXJ0cysrXG5cblx0ZGVmIHJlbW92ZSBub2RlLCBwYXJlbnRcblx0XHRAcmVtb3ZlcysrXG5cblx0ZGVmIGNoYW5nZXNcblx0XHRAaW5zZXJ0cyArIEByZW1vdmVzXG5cblx0ZGVmIG1vdW50IG5vZGVcblx0XHRyZXR1cm4gaWYgJG5vZGUkXG5cdFx0QGhhc01vdW50YWJsZXMgPSB5ZXNcblxuXHRkZWYgcmVmcmVzaCBmb3JjZSA9IG5vXG5cdFx0cmV0dXJuIGlmICRub2RlJFxuXHRcdHJldHVybiBpZiAhZm9yY2UgYW5kIGNoYW5nZXMgPT0gMFxuXHRcdCMgY29uc29sZS50aW1lKCdyZXNvbHZlTW91bnRzJylcblx0XHRpZiAoQGluc2VydHMgYW5kIEBoYXNNb3VudGFibGVzKSBvciBmb3JjZVxuXHRcdFx0dHJ5TW91bnRcblxuXHRcdGlmIChAcmVtb3ZlcyBvciBmb3JjZSkgYW5kIEBtb3VudGVkOmxlbmd0aFxuXHRcdFx0dHJ5VW5tb3VudFxuXHRcdCMgY29uc29sZS50aW1lRW5kKCdyZXNvbHZlTW91bnRzJylcblx0XHRAaW5zZXJ0cyA9IDBcblx0XHRAcmVtb3ZlcyA9IDBcblx0XHRzZWxmXG5cblx0ZGVmIHVubW91bnQgbm9kZVxuXHRcdHNlbGZcblxuXHRkZWYgdHJ5TW91bnRcblx0XHR2YXIgY291bnQgPSAwXG5cdFx0dmFyIHJvb3QgPSBkb2N1bWVudDpib2R5XG5cdFx0dmFyIGl0ZW1zID0gcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuX19tb3VudCcpXG5cdFx0IyB3aGF0IGlmIHdlIGVuZCB1cCBjcmVhdGluZyBhZGRpdGlvbmFsIG1vdW50YWJsZXMgYnkgbW91bnRpbmc/XG5cdFx0Zm9yIGVsIGluIGl0ZW1zXG5cdFx0XHRpZiBlbCBhbmQgZWwuQHRhZ1xuXHRcdFx0XHRpZiBAbW91bnRlZC5pbmRleE9mKGVsLkB0YWcpID09IC0xXG5cdFx0XHRcdFx0bW91bnROb2RlKGVsLkB0YWcpXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgbW91bnROb2RlIG5vZGVcblx0XHRAbW91bnRlZC5wdXNoKG5vZGUpXG5cdFx0bm9kZS5GTEFHUyB8PSBJbWJhLlRBR19NT1VOVEVEXG5cdFx0bm9kZS5tb3VudCBpZiBub2RlOm1vdW50XG5cdFx0cmV0dXJuXG5cblx0ZGVmIHRyeVVubW91bnRcblx0XHR2YXIgY291bnQgPSAwXG5cdFx0dmFyIHJvb3QgPSBkb2N1bWVudDpib2R5XG5cdFx0Zm9yIGl0ZW0sIGkgaW4gQG1vdW50ZWRcblx0XHRcdHVubGVzcyBkb2N1bWVudDpkb2N1bWVudEVsZW1lbnQuY29udGFpbnMoaXRlbS5AZG9tKVxuXHRcdFx0XHRpdGVtLkZMQUdTID0gaXRlbS5GTEFHUyAmIH5JbWJhLlRBR19NT1VOVEVEXG5cdFx0XHRcdGlmIGl0ZW06dW5tb3VudCBhbmQgaXRlbS5AZG9tXG5cdFx0XHRcdFx0aXRlbS51bm1vdW50XG5cdFx0XHRcdGVsaWYgaXRlbS5Ac2NoZWR1bGVyXG5cdFx0XHRcdFx0IyBNQVlCRSBGSVggVEhJUz9cblx0XHRcdFx0XHRpdGVtLnVuc2NoZWR1bGVcblx0XHRcdFx0QG1vdW50ZWRbaV0gPSBudWxsXG5cdFx0XHRcdGNvdW50Kytcblx0XHRcblx0XHRpZiBjb3VudFxuXHRcdFx0QG1vdW50ZWQgPSBAbW91bnRlZC5maWx0ZXIgZG8gfGl0ZW18IGl0ZW1cblx0XHRzZWxmXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL21hbmFnZXIuaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuSW1iYS5DU1NLZXlNYXAgPSB7fVxuXG5JbWJhLlRBR19CVUlMVCA9IDFcbkltYmEuVEFHX1NFVFVQID0gMlxuSW1iYS5UQUdfTU9VTlRJTkcgPSA0XG5JbWJhLlRBR19NT1VOVEVEID0gOFxuSW1iYS5UQUdfU0NIRURVTEVEID0gMTZcbkltYmEuVEFHX0FXQUtFTkVEID0gMzJcblxuIyMjXG5HZXQgdGhlIGN1cnJlbnQgZG9jdW1lbnRcbiMjI1xuZGVmIEltYmEuZG9jdW1lbnRcblx0aWYgJHdlYiRcblx0XHR3aW5kb3c6ZG9jdW1lbnRcblx0ZWxzZVxuXHRcdEBkb2N1bWVudCB8fD0gSW1iYVNlcnZlckRvY3VtZW50Lm5ld1xuXG4jIyNcbkdldCB0aGUgYm9keSBlbGVtZW50IHdyYXBwZWQgaW4gYW4gSW1iYS5UYWdcbiMjI1xuZGVmIEltYmEucm9vdFxuXHR0YWcoSW1iYS5kb2N1bWVudDpib2R5KVxuXG5kZWYgSW1iYS5zdGF0aWMgaXRlbXMsIHR5cCwgbnJcblx0aXRlbXMuQHR5cGUgPSB0eXBcblx0aXRlbXM6c3RhdGljID0gbnJcblx0cmV0dXJuIGl0ZW1zXG5cbiMjI1xuXG4jIyNcbmRlZiBJbWJhLm1vdW50IG5vZGUsIGludG9cblx0aW50byB8fD0gSW1iYS5kb2N1bWVudDpib2R5XG5cdGludG8uYXBwZW5kQ2hpbGQobm9kZS5kb20pXG5cdEltYmEuVGFnTWFuYWdlci5pbnNlcnQobm9kZSxpbnRvKVxuXHRub2RlLnNjaGVkdWxlci5jb25maWd1cmUoZXZlbnRzOiB5ZXMpLmFjdGl2YXRlKG5vKVxuXHRJbWJhLlRhZ01hbmFnZXIucmVmcmVzaFxuXHRyZXR1cm4gbm9kZVxuXG5cbmRlZiBJbWJhLmNyZWF0ZVRleHROb2RlIG5vZGVcblx0aWYgbm9kZSBhbmQgbm9kZTpub2RlVHlwZSA9PSAzXG5cdFx0cmV0dXJuIG5vZGVcblx0cmV0dXJuIEltYmEuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZSlcblxuIyMjXG5UaGlzIGlzIHRoZSBiYXNlY2xhc3MgdGhhdCBhbGwgdGFncyBpbiBpbWJhIGluaGVyaXQgZnJvbS5cbkBpbmFtZSBub2RlXG4jIyNcbmNsYXNzIEltYmEuVGFnXG5cblx0ZGVmIHNlbGYuYnVpbGROb2RlXG5cdFx0dmFyIGRvbSA9IEltYmEuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChAbm9kZVR5cGUgb3IgJ2RpdicpXG5cdFx0aWYgQGNsYXNzZXNcblx0XHRcdHZhciBjbHMgPSBAY2xhc3Nlcy5qb2luKFwiIFwiKVxuXHRcdFx0ZG9tOmNsYXNzTmFtZSA9IGNscyBpZiBjbHNcblx0XHRkb21cblxuXHRkZWYgc2VsZi5jcmVhdGVOb2RlXG5cdFx0dmFyIHByb3RvID0gKEBwcm90b0RvbSB8fD0gYnVpbGROb2RlKVxuXHRcdHByb3RvLmNsb25lTm9kZShmYWxzZSlcblxuXHRkZWYgc2VsZi5idWlsZCBjdHhcblx0XHRzZWxmLm5ldyhzZWxmLmNyZWF0ZU5vZGUsY3R4KVxuXG5cdGRlZiBzZWxmLmRvbVxuXHRcdEBwcm90b0RvbSB8fD0gYnVpbGROb2RlXG5cblx0IyMjXG5cdENhbGxlZCB3aGVuIGEgdGFnIHR5cGUgaXMgYmVpbmcgc3ViY2xhc3NlZC5cblx0IyMjXG5cdGRlZiBzZWxmLmluaGVyaXQgY2hpbGRcblx0XHRjaGlsZC5AcHJvdG9Eb20gPSBudWxsXG5cblx0XHRpZiBAbm9kZVR5cGVcblx0XHRcdGNoaWxkLkBub2RlVHlwZSA9IEBub2RlVHlwZVxuXHRcdFx0Y2hpbGQuQGNsYXNzZXMgPSBAY2xhc3Nlcy5zbGljZVxuXG5cdFx0XHRpZiBjaGlsZC5AZmxhZ05hbWVcblx0XHRcdFx0Y2hpbGQuQGNsYXNzZXMucHVzaChjaGlsZC5AZmxhZ05hbWUpXG5cdFx0ZWxzZVxuXHRcdFx0Y2hpbGQuQG5vZGVUeXBlID0gY2hpbGQuQG5hbWVcblx0XHRcdGNoaWxkLkBmbGFnTmFtZSA9IG51bGxcblx0XHRcdGNoaWxkLkBjbGFzc2VzID0gW11cblxuXHQjIyNcblx0SW50ZXJuYWwgbWV0aG9kIGNhbGxlZCBhZnRlciBhIHRhZyBjbGFzcyBoYXNcblx0YmVlbiBkZWNsYXJlZCBvciBleHRlbmRlZC5cblx0XG5cdEBwcml2YXRlXG5cdCMjI1xuXHRkZWYgb3B0aW1pemVUYWdTdHJ1Y3R1cmVcblx0XHR2YXIgYmFzZSA9IEltYmEuVGFnOnByb3RvdHlwZVxuXHRcdHZhciBoYXNTZXR1cCAgPSBzZWxmOnNldHVwICAhPSBiYXNlOnNldHVwXG5cdFx0dmFyIGhhc0NvbW1pdCA9IHNlbGY6Y29tbWl0ICE9IGJhc2U6Y29tbWl0XG5cdFx0dmFyIGhhc1JlbmRlciA9IHNlbGY6cmVuZGVyICE9IGJhc2U6cmVuZGVyXG5cdFx0dmFyIGhhc01vdW50ICA9IHNlbGY6bW91bnRcblxuXHRcdHZhciBjdG9yID0gc2VsZjpjb25zdHJ1Y3RvclxuXG5cdFx0aWYgaGFzQ29tbWl0IG9yIGhhc1JlbmRlciBvciBoYXNNb3VudCBvciBoYXNTZXR1cFxuXG5cdFx0XHRzZWxmOmVuZCA9IGRvXG5cdFx0XHRcdGlmIHRoaXM6bW91bnQgYW5kICEodGhpcy5GTEFHUyAmIEltYmEuVEFHX01PVU5URUQpXG5cdFx0XHRcdFx0IyBqdXN0IGFjdGl2YXRlIFxuXHRcdFx0XHRcdEltYmEuVGFnTWFuYWdlci5tb3VudCh0aGlzKVxuXG5cdFx0XHRcdHVubGVzcyB0aGlzLkZMQUdTICYgSW1iYS5UQUdfU0VUVVBcblx0XHRcdFx0XHR0aGlzLkZMQUdTIHw9IEltYmEuVEFHX1NFVFVQXG5cdFx0XHRcdFx0dGhpcy5zZXR1cFxuXHRcdFx0XHRcblx0XHRcdFx0dGhpcy5jb21taXRcblxuXHRcdFx0XHRyZXR1cm4gdGhpc1xuXG5cdFx0aWYgJHdlYiRcblx0XHRcdGlmIGhhc01vdW50XG5cdFx0XHRcdGlmIGN0b3IuQGNsYXNzZXMgYW5kIGN0b3IuQGNsYXNzZXMuaW5kZXhPZignX19tb3VudCcpICA9PSAtMVxuXHRcdFx0XHRcdGN0b3IuQGNsYXNzZXMucHVzaCgnX19tb3VudCcpXG5cblx0XHRcdFx0aWYgY3Rvci5AcHJvdG9Eb21cblx0XHRcdFx0XHRjdG9yLkBwcm90b0RvbTpjbGFzc0xpc3QuYWRkKCdfX21vdW50JylcblxuXHRcdFx0Zm9yIGl0ZW0gaW4gWzptb3VzZW1vdmUsOm1vdXNlZW50ZXIsOm1vdXNlbGVhdmUsOm1vdXNlb3Zlciw6bW91c2VvdXQsOnNlbGVjdHN0YXJ0XVxuXHRcdFx0XHRJbWJhLkV2ZW50cy5yZWdpc3RlcihpdGVtKSBpZiB0aGlzW1wib257aXRlbX1cIl1cblx0XHRzZWxmXG5cblxuXHRkZWYgaW5pdGlhbGl6ZSBkb20sY3R4XG5cdFx0c2VsZi5kb20gPSBkb21cblx0XHRzZWxmOiQgPSBUYWdDYWNoZS5idWlsZChzZWxmKVxuXHRcdHNlbGY6JHVwID0gQG93bmVyXyA9IGN0eFxuXHRcdEB0cmVlXyA9IG51bGxcblx0XHRzZWxmLkZMQUdTID0gMFxuXHRcdGJ1aWxkXG5cdFx0c2VsZlxuXG5cdGF0dHIgbmFtZSBpbmxpbmU6IG5vXG5cdGF0dHIgcm9sZSBpbmxpbmU6IG5vXG5cdGF0dHIgdGFiaW5kZXggaW5saW5lOiBub1xuXHRhdHRyIHRpdGxlXG5cblx0ZGVmIGRvbVxuXHRcdEBkb21cblx0XHRcblx0ZGVmIHNldERvbSBkb21cblx0XHRkb20uQHRhZyA9IHNlbGZcblx0XHRAZG9tID0gZG9tXG5cdFx0c2VsZlxuXG5cdGRlZiByZWZcblx0XHRAcmVmXG5cdFx0XG5cdGRlZiByb290XG5cdFx0QG93bmVyXyA/IEBvd25lcl8ucm9vdCA6IHNlbGZcblxuXHQjIyNcblx0U2V0dGluZyByZWZlcmVuY2VzIGZvciB0YWdzIGxpa2Vcblx0YDxkaXZAaGVhZGVyPmAgd2lsbCBjb21waWxlIHRvIGB0YWcoJ2RpdicpLnJlZl8oJ2hlYWRlcicsdGhpcykuZW5kKClgXG5cdEJ5IGRlZmF1bHQgaXQgYWRkcyB0aGUgcmVmZXJlbmNlIGFzIGEgY2xhc3NOYW1lIHRvIHRoZSB0YWcuXG5cblx0QHJldHVybiB7c2VsZn1cblx0QHByaXZhdGVcblx0IyMjXG5cdGRlZiByZWZfIHJlZlxuXHRcdGZsYWcoQHJlZiA9IHJlZilcblx0XHRzZWxmXG5cblx0IyMjXG5cdFNldCB0aGUgZGF0YSBvYmplY3QgZm9yIG5vZGVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBkYXRhPSBkYXRhXG5cdFx0QGRhdGEgPSBkYXRhXG5cblx0IyMjXG5cdEdldCB0aGUgZGF0YSBvYmplY3QgZm9yIG5vZGVcblx0IyMjXG5cdGRlZiBkYXRhXG5cdFx0QGRhdGFcblxuXHQjIyNcblx0U2V0IGlubmVyIGh0bWwgb2Ygbm9kZVxuXHQjIyNcblx0ZGVmIGh0bWw9IGh0bWxcblx0XHRpZiBzZWxmLmh0bWwgIT0gaHRtbFxuXHRcdFx0QGRvbTppbm5lckhUTUwgPSBodG1sXG5cblx0IyMjXG5cdEdldCBpbm5lciBodG1sIG9mIG5vZGVcblx0IyMjXG5cdGRlZiBodG1sXG5cdFx0QGRvbTppbm5lckhUTUxcblx0XG5cdGRlZiBvbiQgc2xvdCxoYW5kbGVyXG5cdFx0bGV0IGhhbmRsZXJzID0gQG9uXyB8fD0gW11cblx0XHRsZXQgcHJldiA9IGhhbmRsZXJzW3Nsb3RdXG5cdFx0IyBzZWxmLWJvdW5kIGhhbmRsZXJzXG5cdFx0aWYgc2xvdCA8IDBcblx0XHRcdGlmIHByZXYgPT0gdW5kZWZpbmVkXG5cdFx0XHRcdHNsb3QgPSBoYW5kbGVyc1tzbG90XSA9IGhhbmRsZXJzOmxlbmd0aFxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRzbG90ID0gcHJldlxuXHRcdFx0cHJldiA9IGhhbmRsZXJzW3Nsb3RdXG5cdFx0XG5cdFx0aGFuZGxlcnNbc2xvdF0gPSBoYW5kbGVyXG5cdFx0aGFuZGxlcjpzdGF0ZSA9IHByZXY6c3RhdGUgaWYgcHJldlxuXHRcdHJldHVybiBzZWxmXG5cblxuXHRkZWYgaWQ9IGlkXG5cdFx0aWYgaWQgIT0gbnVsbFxuXHRcdFx0ZG9tOmlkID0gaWRcblxuXHRkZWYgaWRcblx0XHRkb206aWRcblxuXHQjIyNcblx0QWRkcyBhIG5ldyBhdHRyaWJ1dGUgb3IgY2hhbmdlcyB0aGUgdmFsdWUgb2YgYW4gZXhpc3RpbmcgYXR0cmlidXRlXG5cdG9uIHRoZSBzcGVjaWZpZWQgdGFnLiBJZiB0aGUgdmFsdWUgaXMgbnVsbCBvciBmYWxzZSwgdGhlIGF0dHJpYnV0ZVxuXHR3aWxsIGJlIHJlbW92ZWQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0QXR0cmlidXRlIG5hbWUsIHZhbHVlXG5cdFx0dmFyIG9sZCA9IGRvbS5nZXRBdHRyaWJ1dGUobmFtZSlcblxuXHRcdGlmIG9sZCA9PSB2YWx1ZVxuXHRcdFx0dmFsdWVcblx0XHRlbGlmIHZhbHVlICE9IG51bGwgJiYgdmFsdWUgIT09IGZhbHNlXG5cdFx0XHRkb20uc2V0QXR0cmlidXRlKG5hbWUsdmFsdWUpXG5cdFx0ZWxzZVxuXHRcdFx0ZG9tLnJlbW92ZUF0dHJpYnV0ZShuYW1lKVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIHNldE5lc3RlZEF0dHIgbnMsIG5hbWUsIHZhbHVlXG5cdFx0aWYgc2VsZltucysnU2V0QXR0cmlidXRlJ11cblx0XHRcdHNlbGZbbnMrJ1NldEF0dHJpYnV0ZSddKG5hbWUsdmFsdWUpXG5cdFx0ZWxzZVxuXHRcdFx0c2V0QXR0cmlidXRlTlMobnMsIG5hbWUsdmFsdWUpXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgc2V0QXR0cmlidXRlTlMgbnMsIG5hbWUsIHZhbHVlXG5cdFx0dmFyIG9sZCA9IGdldEF0dHJpYnV0ZU5TKG5zLG5hbWUpXG5cblx0XHRpZiBvbGQgIT0gdmFsdWVcblx0XHRcdGlmIHZhbHVlICE9IG51bGwgJiYgdmFsdWUgIT09IGZhbHNlIFxuXHRcdFx0XHRkb20uc2V0QXR0cmlidXRlTlMobnMsbmFtZSx2YWx1ZSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0ZG9tLnJlbW92ZUF0dHJpYnV0ZU5TKG5zLG5hbWUpXG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cdCMjI1xuXHRyZW1vdmVzIGFuIGF0dHJpYnV0ZSBmcm9tIHRoZSBzcGVjaWZpZWQgdGFnXG5cdCMjI1xuXHRkZWYgcmVtb3ZlQXR0cmlidXRlIG5hbWVcblx0XHRkb20ucmVtb3ZlQXR0cmlidXRlKG5hbWUpXG5cblx0IyMjXG5cdHJldHVybnMgdGhlIHZhbHVlIG9mIGFuIGF0dHJpYnV0ZSBvbiB0aGUgdGFnLlxuXHRJZiB0aGUgZ2l2ZW4gYXR0cmlidXRlIGRvZXMgbm90IGV4aXN0LCB0aGUgdmFsdWUgcmV0dXJuZWRcblx0d2lsbCBlaXRoZXIgYmUgbnVsbCBvciBcIlwiICh0aGUgZW1wdHkgc3RyaW5nKVxuXHQjIyNcblx0ZGVmIGdldEF0dHJpYnV0ZSBuYW1lXG5cdFx0ZG9tLmdldEF0dHJpYnV0ZShuYW1lKVxuXG5cblx0ZGVmIGdldEF0dHJpYnV0ZU5TIG5zLCBuYW1lXG5cdFx0ZG9tLmdldEF0dHJpYnV0ZU5TKG5zLG5hbWUpXG5cdFxuXHRcblx0ZGVmIHNldCBrZXksIHZhbHVlLCBtb2RzXG5cdFx0bGV0IHNldHRlciA9IEltYmEudG9TZXR0ZXIoa2V5KVxuXHRcdGlmIHNlbGZbc2V0dGVyXSBpc2EgRnVuY3Rpb25cblx0XHRcdHNlbGZbc2V0dGVyXSh2YWx1ZSxtb2RzKVxuXHRcdGVsc2Vcblx0XHRcdEBkb206c2V0QXR0cmlidXRlKGtleSx2YWx1ZSlcblx0XHRzZWxmXG5cdFxuXHRcblx0ZGVmIGdldCBrZXlcblx0XHRAZG9tOmdldEF0dHJpYnV0ZShrZXkpXG5cblx0IyMjXG5cdE92ZXJyaWRlIHRoaXMgdG8gcHJvdmlkZSBzcGVjaWFsIHdyYXBwaW5nIGV0Yy5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXRDb250ZW50IGNvbnRlbnQsIHR5cGVcblx0XHRzZXRDaGlsZHJlbiBjb250ZW50LCB0eXBlXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTZXQgdGhlIGNoaWxkcmVuIG9mIG5vZGUuIHR5cGUgcGFyYW0gaXMgb3B0aW9uYWwsXG5cdGFuZCBzaG91bGQgb25seSBiZSB1c2VkIGJ5IEltYmEgd2hlbiBjb21waWxpbmcgdGFnIHRyZWVzLiBcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXRDaGlsZHJlbiBub2RlcywgdHlwZVxuXHRcdCMgb3ZlcnJpZGRlbiBvbiBjbGllbnQgYnkgcmVjb25jaWxlclxuXHRcdEB0cmVlXyA9IG5vZGVzXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTZXQgdGhlIHRlbXBsYXRlIHRoYXQgd2lsbCByZW5kZXIgdGhlIGNvbnRlbnQgb2Ygbm9kZS5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXRUZW1wbGF0ZSB0ZW1wbGF0ZVxuXHRcdHVubGVzcyBAdGVtcGxhdGVcblx0XHRcdCMgb3ZlcnJpZGUgdGhlIGJhc2ljXG5cdFx0XHRpZiBzZWxmOnJlbmRlciA9PSBJbWJhLlRhZzpwcm90b3R5cGU6cmVuZGVyXG5cdFx0XHRcdHNlbGY6cmVuZGVyID0gc2VsZjpyZW5kZXJUZW1wbGF0ZSAjIGRvIHNldENoaWxkcmVuKHJlbmRlclRlbXBsYXRlKVxuXHRcdFx0c2VsZi5vcHRpbWl6ZVRhZ1N0cnVjdHVyZVxuXG5cdFx0c2VsZjp0ZW1wbGF0ZSA9IEB0ZW1wbGF0ZSA9IHRlbXBsYXRlXG5cdFx0c2VsZlxuXG5cdGRlZiB0ZW1wbGF0ZVxuXHRcdG51bGxcblxuXHQjIyNcblx0SWYgbm8gY3VzdG9tIHJlbmRlci1tZXRob2QgaXMgZGVmaW5lZCwgYW5kIHRoZSBub2RlXG5cdGhhcyBhIHRlbXBsYXRlLCB0aGlzIG1ldGhvZCB3aWxsIGJlIHVzZWQgdG8gcmVuZGVyXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgcmVuZGVyVGVtcGxhdGVcblx0XHR2YXIgYm9keSA9IHRlbXBsYXRlXG5cdFx0c2V0Q2hpbGRyZW4oYm9keSkgaWYgYm9keSAhPSBzZWxmXG5cdFx0c2VsZlxuXG5cblx0IyMjXG5cdFJlbW92ZSBzcGVjaWZpZWQgY2hpbGQgZnJvbSBjdXJyZW50IG5vZGUuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgcmVtb3ZlQ2hpbGQgY2hpbGRcblx0XHR2YXIgcGFyID0gZG9tXG5cdFx0dmFyIGVsID0gY2hpbGQuQGRvbSBvciBjaGlsZFxuXHRcdGlmIGVsIGFuZCBlbDpwYXJlbnROb2RlID09IHBhclxuXHRcdFx0cGFyLnJlbW92ZUNoaWxkKGVsKVxuXHRcdFx0SW1iYS5UYWdNYW5hZ2VyLnJlbW92ZShlbC5AdGFnIG9yIGVsLHNlbGYpXG5cdFx0c2VsZlxuXHRcblx0IyMjXG5cdFJlbW92ZSBhbGwgY29udGVudCBpbnNpZGUgbm9kZVxuXHQjIyNcblx0ZGVmIHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0aWYgQGRvbTpmaXJzdENoaWxkXG5cdFx0XHRAZG9tLnJlbW92ZUNoaWxkKEBkb206Zmlyc3RDaGlsZCkgd2hpbGUgQGRvbTpmaXJzdENoaWxkXG5cdFx0XHRJbWJhLlRhZ01hbmFnZXIucmVtb3ZlKG51bGwsc2VsZikgIyBzaG91bGQgcmVnaXN0ZXIgZWFjaCBjaGlsZD9cblx0XHRAdHJlZV8gPSBAdGV4dF8gPSBudWxsXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRBcHBlbmQgYSBzaW5nbGUgaXRlbSAobm9kZSBvciBzdHJpbmcpIHRvIHRoZSBjdXJyZW50IG5vZGUuXG5cdElmIHN1cHBsaWVkIGl0ZW0gaXMgYSBzdHJpbmcgaXQgd2lsbCBhdXRvbWF0aWNhbGx5LiBUaGlzIGlzIHVzZWRcblx0YnkgSW1iYSBpbnRlcm5hbGx5LCBidXQgd2lsbCBwcmFjdGljYWxseSBuZXZlciBiZSB1c2VkIGV4cGxpY2l0bHkuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgYXBwZW5kQ2hpbGQgbm9kZVxuXHRcdGlmIG5vZGUgaXNhIFN0cmluZ1xuXHRcdFx0ZG9tLmFwcGVuZENoaWxkKEltYmEuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZSkpXG5cdFx0ZWxpZiBub2RlXG5cdFx0XHRkb20uYXBwZW5kQ2hpbGQobm9kZS5AZG9tIG9yIG5vZGUpXG5cdFx0XHRJbWJhLlRhZ01hbmFnZXIuaW5zZXJ0KG5vZGUuQHRhZyBvciBub2RlLCBzZWxmKVxuXHRcdFx0IyBGSVhNRSBlbnN1cmUgdGhlc2UgYXJlIG5vdCBjYWxsZWQgZm9yIHRleHQgbm9kZXNcblx0XHRzZWxmXG5cblx0IyMjXG5cdEluc2VydCBhIG5vZGUgaW50byB0aGUgY3VycmVudCBub2RlIChzZWxmKSwgYmVmb3JlIGFub3RoZXIuXG5cdFRoZSByZWxhdGl2ZSBub2RlIG11c3QgYmUgYSBjaGlsZCBvZiBjdXJyZW50IG5vZGUuIFxuXHQjIyNcblx0ZGVmIGluc2VydEJlZm9yZSBub2RlLCByZWxcblx0XHRpZiBub2RlIGlzYSBTdHJpbmdcblx0XHRcdG5vZGUgPSBJbWJhLmRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpXG5cblx0XHRpZiBub2RlIGFuZCByZWxcblx0XHRcdGRvbS5pbnNlcnRCZWZvcmUoIChub2RlLkBkb20gb3Igbm9kZSksIChyZWwuQGRvbSBvciByZWwpIClcblx0XHRcdEltYmEuVGFnTWFuYWdlci5pbnNlcnQobm9kZS5AdGFnIG9yIG5vZGUsIHNlbGYpXG5cdFx0XHQjIEZJWE1FIGVuc3VyZSB0aGVzZSBhcmUgbm90IGNhbGxlZCBmb3IgdGV4dCBub2Rlc1xuXHRcdHNlbGZcblxuXG5cdCMjI1xuXHRSZW1vdmUgbm9kZSBmcm9tIHRoZSBkb20gdHJlZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIG9ycGhhbml6ZVxuXHRcdHBhci5yZW1vdmVDaGlsZChzZWxmKSBpZiBsZXQgcGFyID0gcGFyZW50XG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblx0R2V0IHRleHQgb2Ygbm9kZS4gVXNlcyB0ZXh0Q29udGVudCBiZWhpbmQgdGhlIHNjZW5lcyAobm90IGlubmVyVGV4dClcblx0W2h0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Ob2RlL3RleHRDb250ZW50XSgpXG5cdEByZXR1cm4ge3N0cmluZ30gaW5uZXIgdGV4dCBvZiBub2RlXG5cdCMjI1xuXHRkZWYgdGV4dCB2XG5cdFx0QGRvbTp0ZXh0Q29udGVudFxuXG5cdCMjI1xuXHRTZXQgdGV4dCBvZiBub2RlLiBVc2VzIHRleHRDb250ZW50IGJlaGluZCB0aGUgc2NlbmVzIChub3QgaW5uZXJUZXh0KVxuXHRbaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL05vZGUvdGV4dENvbnRlbnRdKClcblx0IyMjXG5cdGRlZiB0ZXh0PSB0eHRcblx0XHRAdHJlZV8gPSB0eHRcblx0XHRAZG9tOnRleHRDb250ZW50ID0gKHR4dCA9PSBudWxsIG9yIHRleHQgPT09IGZhbHNlKSA/ICcnIDogdHh0XG5cdFx0c2VsZlxuXG5cblx0IyMjXG5cdE1ldGhvZCBmb3IgZ2V0dGluZyBhbmQgc2V0dGluZyBkYXRhLWF0dHJpYnV0ZXMuIFdoZW4gY2FsbGVkIHdpdGggemVyb1xuXHRhcmd1bWVudHMgaXQgd2lsbCByZXR1cm4gdGhlIGFjdHVhbCBkYXRhc2V0IGZvciB0aGUgdGFnLlxuXG5cdFx0dmFyIG5vZGUgPSA8ZGl2IGRhdGEtbmFtZT0naGVsbG8nPlxuXHRcdCMgZ2V0IHRoZSB3aG9sZSBkYXRhc2V0XG5cdFx0bm9kZS5kYXRhc2V0ICMge25hbWU6ICdoZWxsbyd9XG5cdFx0IyBnZXQgYSBzaW5nbGUgdmFsdWVcblx0XHRub2RlLmRhdGFzZXQoJ25hbWUnKSAjICdoZWxsbydcblx0XHQjIHNldCBhIHNpbmdsZSB2YWx1ZVxuXHRcdG5vZGUuZGF0YXNldCgnbmFtZScsJ25ld25hbWUnKSAjIHNlbGZcblxuXG5cdCMjI1xuXHRkZWYgZGF0YXNldCBrZXksIHZhbFxuXHRcdGlmIGtleSBpc2EgT2JqZWN0XG5cdFx0XHRkYXRhc2V0KGssdikgZm9yIG93biBrLHYgb2Yga2V5XG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0aWYgYXJndW1lbnRzOmxlbmd0aCA9PSAyXG5cdFx0XHRzZXRBdHRyaWJ1dGUoXCJkYXRhLXtrZXl9XCIsdmFsKVxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdGlmIGtleVxuXHRcdFx0cmV0dXJuIGdldEF0dHJpYnV0ZShcImRhdGEte2tleX1cIilcblxuXHRcdHZhciBkYXRhc2V0ID0gZG9tOmRhdGFzZXRcblxuXHRcdHVubGVzcyBkYXRhc2V0XG5cdFx0XHRkYXRhc2V0ID0ge31cblx0XHRcdGZvciBhdHIsaSBpbiBkb206YXR0cmlidXRlc1xuXHRcdFx0XHRpZiBhdHI6bmFtZS5zdWJzdHIoMCw1KSA9PSAnZGF0YS0nXG5cdFx0XHRcdFx0ZGF0YXNldFtJbWJhLnRvQ2FtZWxDYXNlKGF0cjpuYW1lLnNsaWNlKDUpKV0gPSBhdHI6dmFsdWVcblxuXHRcdHJldHVybiBkYXRhc2V0XG5cblx0IyMjXG5cdEVtcHR5IHBsYWNlaG9sZGVyLiBPdmVycmlkZSB0byBpbXBsZW1lbnQgY3VzdG9tIHJlbmRlciBiZWhhdmlvdXIuXG5cdFdvcmtzIG11Y2ggbGlrZSB0aGUgZmFtaWxpYXIgcmVuZGVyLW1ldGhvZCBpbiBSZWFjdC5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiByZW5kZXJcblx0XHRzZWxmXG5cblx0IyMjXG5cdENhbGxlZCBpbXBsaWNpdGx5IHdoaWxlIHRhZyBpcyBpbml0aWFsaXppbmcuIE5vIGluaXRpYWwgcHJvcHNcblx0d2lsbCBoYXZlIGJlZW4gc2V0IGF0IHRoaXMgcG9pbnQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgYnVpbGRcblx0XHRzZWxmXG5cblx0IyMjXG5cdENhbGxlZCBvbmNlLCBpbXBsaWNpdGx5IHRocm91Z2ggSW1iYS5UYWcjZW5kLiBBbGwgaW5pdGlhbCBwcm9wc1xuXHRhbmQgY2hpbGRyZW4gd2lsbCBoYXZlIGJlZW4gc2V0IGJlZm9yZSBzZXR1cCBpcyBjYWxsZWQuXG5cdHNldENvbnRlbnQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0dXBcblx0XHRzZWxmXG5cblx0IyMjXG5cdENhbGxlZCBpbXBsaWNpdGx5IHRocm91Z2ggSW1iYS5UYWcjZW5kLCBmb3IgdGFncyB0aGF0IGFyZSBwYXJ0IG9mXG5cdGEgdGFnIHRyZWUgKHRoYXQgYXJlIHJlbmRlcmVkIHNldmVyYWwgdGltZXMpLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGNvbW1pdFxuXHRcdHJlbmRlclxuXHRcdHNlbGZcblxuXHQjIyNcblxuXHRDYWxsZWQgYnkgdGhlIHRhZy1zY2hlZHVsZXIgKGlmIHRoaXMgdGFnIGlzIHNjaGVkdWxlZClcblx0QnkgZGVmYXVsdCBpdCB3aWxsIGNhbGwgdGhpcy5yZW5kZXIuIERvIG5vdCBvdmVycmlkZSB1bmxlc3Ncblx0eW91IHJlYWxseSB1bmRlcnN0YW5kIGl0LlxuXG5cdCMjI1xuXHRkZWYgdGlja1xuXHRcdHJlbmRlclxuXHRcdHNlbGZcblxuXHQjIyNcblx0XG5cdEEgdmVyeSBpbXBvcnRhbnQgbWV0aG9kIHRoYXQgeW91IHdpbGwgcHJhY3RpY2FsbHkgbmV2ZXIgbWFudWFsbHkuXG5cdFRoZSB0YWcgc3ludGF4IG9mIEltYmEgY29tcGlsZXMgdG8gYSBjaGFpbiBvZiBzZXR0ZXJzLCB3aGljaCBhbHdheXNcblx0ZW5kcyB3aXRoIC5lbmQuIGA8YS5sYXJnZT5gIGNvbXBpbGVzIHRvIGB0YWcoJ2EnKS5mbGFnKCdsYXJnZScpLmVuZCgpYFxuXHRcblx0WW91IGFyZSBoaWdobHkgYWR2aWNlZCB0byBub3Qgb3ZlcnJpZGUgaXRzIGJlaGF2aW91ci4gVGhlIGZpcnN0IHRpbWVcblx0ZW5kIGlzIGNhbGxlZCBpdCB3aWxsIG1hcmsgdGhlIHRhZyBhcyBpbml0aWFsaXplZCBhbmQgY2FsbCBJbWJhLlRhZyNzZXR1cCxcblx0YW5kIGNhbGwgSW1iYS5UYWcjY29tbWl0IGV2ZXJ5IHRpbWUuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgZW5kXG5cdFx0c2VsZlxuXHRcdFxuXHQjIGNhbGxlZCBvbiA8c2VsZj4gdG8gY2hlY2sgaWYgc2VsZiBpcyBjYWxsZWQgZnJvbSBvdGhlciBwbGFjZXNcblx0ZGVmICRvcGVuIGNvbnRleHRcblx0XHRpZiBjb250ZXh0ICE9IEBjb250ZXh0X1xuXHRcdFx0QHRyZWVfID0gbnVsbFxuXHRcdFx0QGNvbnRleHRfID0gY29udGV4dFxuXHRcdHNlbGZcblxuXHQjIyNcblx0VGhpcyBpcyBjYWxsZWQgaW5zdGVhZCBvZiBJbWJhLlRhZyNlbmQgZm9yIGA8c2VsZj5gIHRhZyBjaGFpbnMuXG5cdERlZmF1bHRzIHRvIG5vb3Bcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzeW5jZWRcblx0XHRzZWxmXG5cblx0IyBjYWxsZWQgd2hlbiB0aGUgbm9kZSBpcyBhd2FrZW5lZCBpbiB0aGUgZG9tIC0gZWl0aGVyIGF1dG9tYXRpY2FsbHlcblx0IyB1cG9uIGF0dGFjaG1lbnQgdG8gdGhlIGRvbS10cmVlLCBvciB0aGUgZmlyc3QgdGltZSBpbWJhIG5lZWRzIHRoZVxuXHQjIHRhZyBmb3IgYSBkb21ub2RlIHRoYXQgaGFzIGJlZW4gcmVuZGVyZWQgb24gdGhlIHNlcnZlclxuXHRkZWYgYXdha2VuXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRMaXN0IG9mIGZsYWdzIGZvciB0aGlzIG5vZGUuIFxuXHQjIyNcblx0ZGVmIGZsYWdzXG5cdFx0QGRvbTpjbGFzc0xpc3RcblxuXHQjIyNcblx0QWRkIHNwZWZpY2llZCBmbGFnIHRvIGN1cnJlbnQgbm9kZS5cblx0SWYgYSBzZWNvbmQgYXJndW1lbnQgaXMgc3VwcGxpZWQsIGl0IHdpbGwgYmUgY29lcmNlZCBpbnRvIGEgQm9vbGVhbixcblx0YW5kIHVzZWQgdG8gaW5kaWNhdGUgd2hldGhlciB3ZSBzaG91bGQgcmVtb3ZlIHRoZSBmbGFnIGluc3RlYWQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgZmxhZyBuYW1lLCB0b2dnbGVyXG5cdFx0IyBpdCBpcyBtb3N0IG5hdHVyYWwgdG8gdHJlYXQgYSBzZWNvbmQgdW5kZWZpbmVkIGFyZ3VtZW50IGFzIGEgbm8tc3dpdGNoXG5cdFx0IyBzbyB3ZSBuZWVkIHRvIGNoZWNrIHRoZSBhcmd1bWVudHMtbGVuZ3RoXG5cdFx0aWYgYXJndW1lbnRzOmxlbmd0aCA9PSAyXG5cdFx0XHRpZiBAZG9tOmNsYXNzTGlzdC5jb250YWlucyhuYW1lKSAhPSAhIXRvZ2dsZXJcblx0XHRcdFx0QGRvbTpjbGFzc0xpc3QudG9nZ2xlKG5hbWUpXG5cdFx0ZWxzZVxuXHRcdFx0IyBmaXJlZm94IHdpbGwgdHJpZ2dlciBhIGNoYW5nZSBpZiBhZGRpbmcgZXhpc3RpbmcgY2xhc3Ncblx0XHRcdEBkb206Y2xhc3NMaXN0LmFkZChuYW1lKSB1bmxlc3MgQGRvbTpjbGFzc0xpc3QuY29udGFpbnMobmFtZSlcblx0XHRyZXR1cm4gc2VsZlxuXG5cdCMjI1xuXHRSZW1vdmUgc3BlY2lmaWVkIGZsYWcgZnJvbSBub2RlXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgdW5mbGFnIG5hbWVcblx0XHRAZG9tOmNsYXNzTGlzdC5yZW1vdmUobmFtZSlcblx0XHRzZWxmXG5cblx0IyMjXG5cdFRvZ2dsZSBzcGVjaWZpZWQgZmxhZyBvbiBub2RlXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgdG9nZ2xlRmxhZyBuYW1lXG5cdFx0QGRvbTpjbGFzc0xpc3QudG9nZ2xlKG5hbWUpXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRDaGVjayB3aGV0aGVyIGN1cnJlbnQgbm9kZSBoYXMgc3BlY2lmaWVkIGZsYWdcblx0QHJldHVybiB7Ym9vbH1cblx0IyMjXG5cdGRlZiBoYXNGbGFnIG5hbWVcblx0XHRAZG9tOmNsYXNzTGlzdC5jb250YWlucyhuYW1lKVxuXG5cdFxuXHRkZWYgZmxhZ0lmIGZsYWcsIGJvb2xcblx0XHR2YXIgZiA9IEBmbGFnc18gfHw9IHt9XG5cdFx0bGV0IHByZXYgPSBmW2ZsYWddXG5cblx0XHRpZiBib29sIGFuZCAhcHJldlxuXHRcdFx0QGRvbTpjbGFzc0xpc3QuYWRkKGZsYWcpXG5cdFx0XHRmW2ZsYWddID0geWVzXG5cdFx0ZWxpZiBwcmV2IGFuZCAhYm9vbFxuXHRcdFx0QGRvbTpjbGFzc0xpc3QucmVtb3ZlKGZsYWcpXG5cdFx0XHRmW2ZsYWddID0gbm9cblxuXHRcdHJldHVybiBzZWxmXG5cdFx0XG5cdCMjI1xuXHRTZXQvdXBkYXRlIGEgbmFtZWQgZmxhZy4gSXQgcmVtZW1iZXJzIHRoZSBwcmV2aW91c1xuXHR2YWx1ZSBvZiB0aGUgZmxhZywgYW5kIHJlbW92ZXMgaXQgYmVmb3JlIHNldHRpbmcgdGhlIG5ldyB2YWx1ZS5cblxuXHRcdG5vZGUuc2V0RmxhZygndHlwZScsJ3RvZG8nKVxuXHRcdG5vZGUuc2V0RmxhZygndHlwZScsJ3Byb2plY3QnKVxuXHRcdCMgdG9kbyBpcyByZW1vdmVkLCBwcm9qZWN0IGlzIGFkZGVkLlxuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0RmxhZyBuYW1lLCB2YWx1ZVxuXHRcdGxldCBmbGFncyA9IEBuYW1lZEZsYWdzXyB8fD0ge31cblx0XHRsZXQgcHJldiA9IGZsYWdzW25hbWVdXG5cdFx0aWYgcHJldiAhPSB2YWx1ZVxuXHRcdFx0dW5mbGFnKHByZXYpIGlmIHByZXZcblx0XHRcdGZsYWcodmFsdWUpIGlmIHZhbHVlXG5cdFx0XHRmbGFnc1tuYW1lXSA9IHZhbHVlXG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cdCMjI1xuXHRHZXQgdGhlIHNjaGVkdWxlciBmb3IgdGhpcyBub2RlLiBBIG5ldyBzY2hlZHVsZXIgd2lsbCBiZSBjcmVhdGVkXG5cdGlmIGl0IGRvZXMgbm90IGFscmVhZHkgZXhpc3QuXG5cblx0QHJldHVybiB7SW1iYS5TY2hlZHVsZXJ9XG5cdCMjI1xuXHRkZWYgc2NoZWR1bGVyXG5cdFx0QHNjaGVkdWxlciA/PSBJbWJhLlNjaGVkdWxlci5uZXcoc2VsZilcblxuXHQjIyNcblxuXHRTaG9ydGhhbmQgdG8gc3RhcnQgc2NoZWR1bGluZyBhIG5vZGUuIFRoZSBtZXRob2Qgd2lsbCBiYXNpY2FsbHlcblx0cHJveHkgdGhlIGFyZ3VtZW50cyB0aHJvdWdoIHRvIHNjaGVkdWxlci5jb25maWd1cmUsIGFuZCB0aGVuXG5cdGFjdGl2YXRlIHRoZSBzY2hlZHVsZXIuXG5cdFxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNjaGVkdWxlIG9wdGlvbnMgPSB7ZXZlbnRzOiB5ZXN9XG5cdFx0c2NoZWR1bGVyLmNvbmZpZ3VyZShvcHRpb25zKS5hY3RpdmF0ZVxuXHRcdHNlbGZcblxuXHQjIyNcblx0U2hvcnRoYW5kIGZvciBkZWFjdGl2YXRpbmcgc2NoZWR1bGVyIChpZiB0YWcgaGFzIG9uZSkuXG5cdEBkZXByZWNhdGVkXG5cdCMjI1xuXHRkZWYgdW5zY2hlZHVsZVxuXHRcdHNjaGVkdWxlci5kZWFjdGl2YXRlIGlmIEBzY2hlZHVsZXJcblx0XHRzZWxmXG5cblxuXHQjIyNcblx0R2V0IHRoZSBwYXJlbnQgb2YgY3VycmVudCBub2RlXG5cdEByZXR1cm4ge0ltYmEuVGFnfSBcblx0IyMjXG5cdGRlZiBwYXJlbnRcblx0XHRJbWJhLmdldFRhZ0ZvckRvbShkb206cGFyZW50Tm9kZSlcblxuXHQjIyNcblx0R2V0IHRoZSBjaGlsZHJlbiBvZiBub2RlXG5cdEByZXR1cm4ge0ltYmEuVGFnW119XG5cdCMjI1xuXHRkZWYgY2hpbGRyZW4gc2VsXG5cdFx0Zm9yIGl0ZW0gaW4gQGRvbTpjaGlsZHJlblxuXHRcdFx0aXRlbS5AdGFnIG9yIEltYmEuZ2V0VGFnRm9yRG9tKGl0ZW0pXG5cdFxuXHRkZWYgcXVlcnlTZWxlY3RvciBxXG5cdFx0SW1iYS5nZXRUYWdGb3JEb20oQGRvbS5xdWVyeVNlbGVjdG9yKHEpKVxuXG5cdGRlZiBxdWVyeVNlbGVjdG9yQWxsIHFcblx0XHR2YXIgaXRlbXMgPSBbXVxuXHRcdGZvciBpdGVtIGluIEBkb20ucXVlcnlTZWxlY3RvckFsbChxKVxuXHRcdFx0aXRlbXMucHVzaCggSW1iYS5nZXRUYWdGb3JEb20oaXRlbSkgKVxuXHRcdHJldHVybiBpdGVtc1xuXG5cdCMjI1xuXHRDaGVjayBpZiB0aGlzIG5vZGUgbWF0Y2hlcyBhIHNlbGVjdG9yXG5cdEByZXR1cm4ge0Jvb2xlYW59XG5cdCMjI1xuXHRkZWYgbWF0Y2hlcyBzZWxcblx0XHRpZiBzZWwgaXNhIEZ1bmN0aW9uXG5cdFx0XHRyZXR1cm4gc2VsKHNlbGYpXG5cblx0XHRzZWwgPSBzZWwucXVlcnkgaWYgc2VsOnF1ZXJ5IGlzYSBGdW5jdGlvblxuXHRcdGlmIHZhciBmbiA9IChAZG9tOm1hdGNoZXMgb3IgQGRvbTptYXRjaGVzU2VsZWN0b3Igb3IgQGRvbTp3ZWJraXRNYXRjaGVzU2VsZWN0b3Igb3IgQGRvbTptc01hdGNoZXNTZWxlY3RvciBvciBAZG9tOm1vek1hdGNoZXNTZWxlY3Rvcilcblx0XHRcdHJldHVybiBmbi5jYWxsKEBkb20sc2VsKVxuXG5cdCMjI1xuXHRHZXQgdGhlIGZpcnN0IGVsZW1lbnQgbWF0Y2hpbmcgc3VwcGxpZWQgc2VsZWN0b3IgLyBmaWx0ZXJcblx0dHJhdmVyc2luZyB1cHdhcmRzLCBidXQgaW5jbHVkaW5nIHRoZSBub2RlIGl0c2VsZi5cblx0QHJldHVybiB7SW1iYS5UYWd9XG5cdCMjI1xuXHRkZWYgY2xvc2VzdCBzZWxcblx0XHRJbWJhLmdldFRhZ0ZvckRvbShAZG9tLmNsb3Nlc3Qoc2VsKSlcblxuXHQjIyNcblx0Q2hlY2sgaWYgbm9kZSBjb250YWlucyBvdGhlciBub2RlXG5cdEByZXR1cm4ge0Jvb2xlYW59IFxuXHQjIyNcblx0ZGVmIGNvbnRhaW5zIG5vZGVcblx0XHRkb20uY29udGFpbnMobm9kZS5AZG9tIG9yIG5vZGUpXG5cblxuXHQjIyNcblx0U2hvcnRoYW5kIGZvciBjb25zb2xlLmxvZyBvbiBlbGVtZW50c1xuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGxvZyAqYXJnc1xuXHRcdGFyZ3MudW5zaGlmdChjb25zb2xlKVxuXHRcdEZ1bmN0aW9uOnByb3RvdHlwZTpjYWxsLmFwcGx5KGNvbnNvbGU6bG9nLCBhcmdzKVxuXHRcdHNlbGZcblxuXHRkZWYgY3NzIGtleSwgdmFsXG5cdFx0aWYga2V5IGlzYSBPYmplY3Rcblx0XHRcdGNzcyhrLHYpIGZvciBvd24gayx2IG9mIGtleVxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdHZhciBuYW1lID0gSW1iYS5DU1NLZXlNYXBba2V5XSBvciBrZXlcblxuXHRcdGlmIHZhbCA9PSBudWxsXG5cdFx0XHRkb206c3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSlcblx0XHRlbGlmIHZhbCA9PSB1bmRlZmluZWQgYW5kIGFyZ3VtZW50czpsZW5ndGggPT0gMVxuXHRcdFx0cmV0dXJuIGRvbTpzdHlsZVtuYW1lXVxuXHRcdGVsc2Vcblx0XHRcdGlmIHZhbCBpc2EgTnVtYmVyIGFuZCBuYW1lLm1hdGNoKC93aWR0aHxoZWlnaHR8bGVmdHxyaWdodHx0b3B8Ym90dG9tLylcblx0XHRcdFx0ZG9tOnN0eWxlW25hbWVdID0gdmFsICsgXCJweFwiXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGRvbTpzdHlsZVtuYW1lXSA9IHZhbFxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIHNldFN0eWxlIHN0eWxlXG5cdFx0c2V0QXR0cmlidXRlKCdzdHlsZScsc3R5bGUpXG5cblx0ZGVmIHN0eWxlXG5cdFx0Z2V0QXR0cmlidXRlKCdzdHlsZScpXG5cblx0IyMjXG5cdFRyaWdnZXIgYW4gZXZlbnQgZnJvbSBjdXJyZW50IG5vZGUuIERpc3BhdGNoZWQgdGhyb3VnaCB0aGUgSW1iYSBldmVudCBtYW5hZ2VyLlxuXHRUbyBkaXNwYXRjaCBhY3R1YWwgZG9tIGV2ZW50cywgdXNlIGRvbS5kaXNwYXRjaEV2ZW50IGluc3RlYWQuXG5cblx0QHJldHVybiB7SW1iYS5FdmVudH1cblx0IyMjXG5cdGRlZiB0cmlnZ2VyIG5hbWUsIGRhdGEgPSB7fVxuXHRcdCR3ZWIkID8gSW1iYS5FdmVudHMudHJpZ2dlcihuYW1lLHNlbGYsZGF0YTogZGF0YSkgOiBudWxsXG5cblx0IyMjXG5cdEZvY3VzIG9uIGN1cnJlbnQgbm9kZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGZvY3VzXG5cdFx0ZG9tLmZvY3VzXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRSZW1vdmUgZm9jdXMgZnJvbSBjdXJyZW50IG5vZGVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBibHVyXG5cdFx0ZG9tLmJsdXJcblx0XHRzZWxmXG5cblx0ZGVmIHRvU3RyaW5nXG5cdFx0ZG9tOm91dGVySFRNTFxuXHRcblxuSW1iYS5UYWc6cHJvdG90eXBlOmluaXRpYWxpemUgPSBJbWJhLlRhZ1xuXG5jbGFzcyBJbWJhLlNWR1RhZyA8IEltYmEuVGFnXG5cblx0ZGVmIHNlbGYubmFtZXNwYWNlVVJJXG5cdFx0XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXG5cblx0ZGVmIHNlbGYuYnVpbGROb2RlXG5cdFx0dmFyIGRvbSA9IEltYmEuZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSxAbm9kZVR5cGUpXG5cdFx0dmFyIGNscyA9IEBjbGFzc2VzLmpvaW4oXCIgXCIpXG5cdFx0ZG9tOmNsYXNzTmFtZTpiYXNlVmFsID0gY2xzIGlmIGNsc1xuXHRcdGRvbVxuXG5cdGRlZiBzZWxmLmluaGVyaXQgY2hpbGRcblx0XHRjaGlsZC5AcHJvdG9Eb20gPSBudWxsXG5cdFx0aWYgY2hpbGQuQG5hbWUgaW4gSW1iYS5TVkdfVEFHU1xuXHRcdFx0Y2hpbGQuQG5vZGVUeXBlID0gY2hpbGQuQG5hbWVcblx0XHRcdGNoaWxkLkBjbGFzc2VzID0gW11cblx0XHRlbHNlXG5cdFx0XHRjaGlsZC5Abm9kZVR5cGUgPSBAbm9kZVR5cGVcblx0XHRcdHZhciBjbGFzc05hbWUgPSBcIl9cIiArIGNoaWxkLkBuYW1lLnJlcGxhY2UoL18vZywgJy0nKVxuXHRcdFx0Y2hpbGQuQGNsYXNzZXMgPSBAY2xhc3Nlcy5jb25jYXQoY2xhc3NOYW1lKVxuXG5JbWJhLkhUTUxfVEFHUyA9IFwiYSBhYmJyIGFkZHJlc3MgYXJlYSBhcnRpY2xlIGFzaWRlIGF1ZGlvIGIgYmFzZSBiZGkgYmRvIGJpZyBibG9ja3F1b3RlIGJvZHkgYnIgYnV0dG9uIGNhbnZhcyBjYXB0aW9uIGNpdGUgY29kZSBjb2wgY29sZ3JvdXAgZGF0YSBkYXRhbGlzdCBkZCBkZWwgZGV0YWlscyBkZm4gZGl2IGRsIGR0IGVtIGVtYmVkIGZpZWxkc2V0IGZpZ2NhcHRpb24gZmlndXJlIGZvb3RlciBmb3JtIGgxIGgyIGgzIGg0IGg1IGg2IGhlYWQgaGVhZGVyIGhyIGh0bWwgaSBpZnJhbWUgaW1nIGlucHV0IGlucyBrYmQga2V5Z2VuIGxhYmVsIGxlZ2VuZCBsaSBsaW5rIG1haW4gbWFwIG1hcmsgbWVudSBtZW51aXRlbSBtZXRhIG1ldGVyIG5hdiBub3NjcmlwdCBvYmplY3Qgb2wgb3B0Z3JvdXAgb3B0aW9uIG91dHB1dCBwIHBhcmFtIHByZSBwcm9ncmVzcyBxIHJwIHJ0IHJ1YnkgcyBzYW1wIHNjcmlwdCBzZWN0aW9uIHNlbGVjdCBzbWFsbCBzb3VyY2Ugc3BhbiBzdHJvbmcgc3R5bGUgc3ViIHN1bW1hcnkgc3VwIHRhYmxlIHRib2R5IHRkIHRleHRhcmVhIHRmb290IHRoIHRoZWFkIHRpbWUgdGl0bGUgdHIgdHJhY2sgdSB1bCB2YXIgdmlkZW8gd2JyXCIuc3BsaXQoXCIgXCIpXG5JbWJhLkhUTUxfVEFHU19VTlNBRkUgPSBcImFydGljbGUgYXNpZGUgaGVhZGVyIHNlY3Rpb25cIi5zcGxpdChcIiBcIilcbkltYmEuU1ZHX1RBR1MgPSBcImNpcmNsZSBkZWZzIGVsbGlwc2UgZyBsaW5lIGxpbmVhckdyYWRpZW50IG1hc2sgcGF0aCBwYXR0ZXJuIHBvbHlnb24gcG9seWxpbmUgcmFkaWFsR3JhZGllbnQgcmVjdCBzdG9wIHN2ZyB0ZXh0IHRzcGFuXCIuc3BsaXQoXCIgXCIpXG5cbkltYmEuSFRNTF9BVFRSUyA9XG5cdGE6IFwiaHJlZiB0YXJnZXQgaHJlZmxhbmcgbWVkaWEgZG93bmxvYWQgcmVsIHR5cGVcIlxuXHRmb3JtOiBcIm1ldGhvZCBhY3Rpb24gZW5jdHlwZSBhdXRvY29tcGxldGUgdGFyZ2V0XCJcblx0YnV0dG9uOiBcImF1dG9mb2N1cyB0eXBlXCJcblx0aW5wdXQ6IFwiYWNjZXB0IGRpc2FibGVkIGZvcm0gbGlzdCBtYXggbWF4bGVuZ3RoIG1pbiBwYXR0ZXJuIHJlcXVpcmVkIHNpemUgc3RlcCB0eXBlXCJcblx0bGFiZWw6IFwiYWNjZXNza2V5IGZvciBmb3JtXCJcblx0aW1nOiBcInNyYyBzcmNzZXRcIlxuXHRsaW5rOiBcInJlbCB0eXBlIGhyZWYgbWVkaWFcIlxuXHRpZnJhbWU6IFwicmVmZXJyZXJwb2xpY3kgc3JjIHNyY2RvYyBzYW5kYm94XCJcblx0bWV0YTogXCJwcm9wZXJ0eSBjb250ZW50IGNoYXJzZXQgZGVzY1wiXG5cdG9wdGdyb3VwOiBcImxhYmVsXCJcblx0b3B0aW9uOiBcImxhYmVsXCJcblx0b3V0cHV0OiBcImZvciBmb3JtXCJcblx0b2JqZWN0OiBcInR5cGUgZGF0YSB3aWR0aCBoZWlnaHRcIlxuXHRwYXJhbTogXCJuYW1lIHZhbHVlXCJcblx0cHJvZ3Jlc3M6IFwibWF4XCJcblx0c2NyaXB0OiBcInNyYyB0eXBlIGFzeW5jIGRlZmVyIGNyb3Nzb3JpZ2luIGludGVncml0eSBub25jZSBsYW5ndWFnZVwiXG5cdHNlbGVjdDogXCJzaXplIGZvcm0gbXVsdGlwbGVcIlxuXHR0ZXh0YXJlYTogXCJyb3dzIGNvbHNcIlxuXG5cbkltYmEuSFRNTF9QUk9QUyA9XG5cdGlucHV0OiBcImF1dG9mb2N1cyBhdXRvY29tcGxldGUgYXV0b2NvcnJlY3QgdmFsdWUgcGxhY2Vob2xkZXIgcmVxdWlyZWQgZGlzYWJsZWQgbXVsdGlwbGUgY2hlY2tlZCByZWFkT25seVwiXG5cdHRleHRhcmVhOiBcImF1dG9mb2N1cyBhdXRvY29tcGxldGUgYXV0b2NvcnJlY3QgdmFsdWUgcGxhY2Vob2xkZXIgcmVxdWlyZWQgZGlzYWJsZWQgbXVsdGlwbGUgY2hlY2tlZCByZWFkT25seVwiXG5cdGZvcm06IFwibm92YWxpZGF0ZVwiXG5cdGZpZWxkc2V0OiBcImRpc2FibGVkXCJcblx0YnV0dG9uOiBcImRpc2FibGVkXCJcblx0c2VsZWN0OiBcImF1dG9mb2N1cyBkaXNhYmxlZCByZXF1aXJlZFwiXG5cdG9wdGlvbjogXCJkaXNhYmxlZCBzZWxlY3RlZCB2YWx1ZVwiXG5cdG9wdGdyb3VwOiBcImRpc2FibGVkXCJcblx0cHJvZ3Jlc3M6IFwidmFsdWVcIlxuXHRmaWVsZHNldDogXCJkaXNhYmxlZFwiXG5cdGNhbnZhczogXCJ3aWR0aCBoZWlnaHRcIlxuXG5kZWYgZXh0ZW5kZXIgb2JqLCBzdXBcblx0Zm9yIG93biBrLHYgb2Ygc3VwXG5cdFx0b2JqW2tdID89IHZcblxuXHRvYmo6cHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXA6cHJvdG90eXBlKVxuXHRvYmo6X19zdXBlcl9fID0gb2JqOnByb3RvdHlwZTpfX3N1cGVyX18gPSBzdXA6cHJvdG90eXBlXG5cdG9iajpwcm90b3R5cGU6Y29uc3RydWN0b3IgPSBvYmpcblx0c3VwLmluaGVyaXQob2JqKSBpZiBzdXA6aW5oZXJpdFxuXHRyZXR1cm4gb2JqXG5cbmRlZiBUYWdcblx0cmV0dXJuIGRvIHxkb20sY3R4fFxuXHRcdHRoaXMuaW5pdGlhbGl6ZShkb20sY3R4KVxuXHRcdHJldHVybiB0aGlzXG5cbmRlZiBUYWdTcGF3bmVyIHR5cGVcblx0cmV0dXJuIGRvIHx6b25lfCB0eXBlLmJ1aWxkKHpvbmUpXG5cblxuY2xhc3MgSW1iYS5UYWdzXG5cblx0ZGVmIGluaXRpYWxpemVcblx0XHRzZWxmXG5cblx0ZGVmIF9fY2xvbmUgbnNcblx0XHR2YXIgY2xvbmUgPSBPYmplY3QuY3JlYXRlKHNlbGYpXG5cdFx0Y2xvbmUuQHBhcmVudCA9IHNlbGZcblx0XHRyZXR1cm4gY2xvbmVcblxuXHRkZWYgbnMgbmFtZVxuXHRcdHNlbGZbJ18nICsgbmFtZS50b1VwcGVyQ2FzZV0gfHwgZGVmaW5lTmFtZXNwYWNlKG5hbWUpXG5cblx0ZGVmIGRlZmluZU5hbWVzcGFjZSBuYW1lXG5cdFx0dmFyIGNsb25lID0gT2JqZWN0LmNyZWF0ZShzZWxmKVxuXHRcdGNsb25lLkBwYXJlbnQgPSBzZWxmXG5cdFx0Y2xvbmUuQG5zID0gbmFtZVxuXHRcdHNlbGZbJ18nICsgbmFtZS50b1VwcGVyQ2FzZV0gPSBjbG9uZVxuXHRcdHJldHVybiBjbG9uZVxuXG5cdGRlZiBiYXNlVHlwZSBuYW1lLCBuc1xuXHRcdG5hbWUgaW4gSW1iYS5IVE1MX1RBR1MgPyAnZWxlbWVudCcgOiAnZGl2J1xuXG5cdGRlZiBkZWZpbmVUYWcgZnVsbE5hbWUsIHN1cHIgPSAnJywgJmJvZHlcblx0XHRpZiBib2R5IGFuZCBib2R5LkBub2RlVHlwZVxuXHRcdFx0c3VwciA9IGJvZHlcblx0XHRcdGJvZHkgPSBudWxsXG5cdFx0XHRcblx0XHRpZiBzZWxmW2Z1bGxOYW1lXVxuXHRcdFx0Y29uc29sZS5sb2cgXCJ0YWcgYWxyZWFkeSBleGlzdHM/XCIsZnVsbE5hbWVcblx0XHRcblx0XHQjIGlmIGl0IGlzIG5hbWVzcGFjZWRcblx0XHR2YXIgbnNcblx0XHR2YXIgbmFtZSA9IGZ1bGxOYW1lXG5cdFx0bGV0IG5zaWR4ID0gbmFtZS5pbmRleE9mKCc6Jylcblx0XHRpZiAgbnNpZHggPj0gMFxuXHRcdFx0bnMgPSBmdWxsTmFtZS5zdWJzdHIoMCxuc2lkeClcblx0XHRcdG5hbWUgPSBmdWxsTmFtZS5zdWJzdHIobnNpZHggKyAxKVxuXHRcdFx0aWYgbnMgPT0gJ3N2ZycgYW5kICFzdXByXG5cdFx0XHRcdHN1cHIgPSAnc3ZnOmVsZW1lbnQnXG5cblx0XHRzdXByIHx8PSBiYXNlVHlwZShmdWxsTmFtZSlcblxuXHRcdGxldCBzdXBlcnR5cGUgPSBzdXByIGlzYSBTdHJpbmcgPyBmaW5kVGFnVHlwZShzdXByKSA6IHN1cHJcblx0XHRsZXQgdGFndHlwZSA9IFRhZygpXG5cblx0XHR0YWd0eXBlLkBuYW1lID0gbmFtZVxuXHRcdHRhZ3R5cGUuQGZsYWdOYW1lID0gbnVsbFxuXG5cdFx0aWYgbmFtZVswXSA9PSAnIydcblx0XHRcdEltYmEuU0lOR0xFVE9OU1tuYW1lLnNsaWNlKDEpXSA9IHRhZ3R5cGVcblx0XHRcdHNlbGZbbmFtZV0gPSB0YWd0eXBlXG5cdFx0ZWxpZiBuYW1lWzBdID09IG5hbWVbMF0udG9VcHBlckNhc2Vcblx0XHRcdHRhZ3R5cGUuQGZsYWdOYW1lID0gbmFtZVxuXHRcdGVsc2Vcblx0XHRcdHRhZ3R5cGUuQGZsYWdOYW1lID0gXCJfXCIgKyBmdWxsTmFtZS5yZXBsYWNlKC9bX1xcOl0vZywgJy0nKVxuXHRcdFx0c2VsZltmdWxsTmFtZV0gPSB0YWd0eXBlXG5cblx0XHRleHRlbmRlcih0YWd0eXBlLHN1cGVydHlwZSlcblxuXHRcdGlmIGJvZHlcblx0XHRcdGJvZHkuY2FsbCh0YWd0eXBlLHRhZ3R5cGUsIHRhZ3R5cGUuVEFHUyBvciBzZWxmKVxuXHRcdFx0dGFndHlwZS5kZWZpbmVkIGlmIHRhZ3R5cGU6ZGVmaW5lZFxuXHRcdFx0b3B0aW1pemVUYWcodGFndHlwZSlcblx0XHRyZXR1cm4gdGFndHlwZVxuXG5cdGRlZiBkZWZpbmVTaW5nbGV0b24gbmFtZSwgc3VwciwgJmJvZHlcblx0XHRkZWZpbmVUYWcobmFtZSxzdXByLGJvZHkpXG5cblx0ZGVmIGV4dGVuZFRhZyBuYW1lLCBzdXByID0gJycsICZib2R5XG5cdFx0dmFyIGtsYXNzID0gKG5hbWUgaXNhIFN0cmluZyA/IGZpbmRUYWdUeXBlKG5hbWUpIDogbmFtZSlcblx0XHQjIGFsbG93IGZvciBwcml2YXRlIHRhZ3MgaGVyZSBhcyB3ZWxsP1xuXHRcdGJvZHkgYW5kIGJvZHkuY2FsbChrbGFzcyxrbGFzcyxrbGFzczpwcm90b3R5cGUpIGlmIGJvZHlcblx0XHRrbGFzcy5leHRlbmRlZCBpZiBrbGFzczpleHRlbmRlZFxuXHRcdG9wdGltaXplVGFnKGtsYXNzKVxuXHRcdHJldHVybiBrbGFzc1xuXG5cdGRlZiBvcHRpbWl6ZVRhZyB0YWd0eXBlXG5cdFx0dGFndHlwZTpwcm90b3R5cGU/Lm9wdGltaXplVGFnU3RydWN0dXJlXG5cdFx0XG5cdGRlZiBmaW5kVGFnVHlwZSB0eXBlXG5cdFx0bGV0IGtsYXNzID0gc2VsZlt0eXBlXVxuXHRcdHVubGVzcyBrbGFzc1xuXHRcdFx0aWYgdHlwZS5zdWJzdHIoMCw0KSA9PSAnc3ZnOidcblx0XHRcdFx0a2xhc3MgPSBkZWZpbmVUYWcodHlwZSwnc3ZnOmVsZW1lbnQnKVxuXG5cdFx0XHRlbGlmIEltYmEuSFRNTF9UQUdTLmluZGV4T2YodHlwZSkgPj0gMFxuXHRcdFx0XHRrbGFzcyA9IGRlZmluZVRhZyh0eXBlLCdlbGVtZW50JylcblxuXHRcdFx0XHRpZiBsZXQgYXR0cnMgPSBJbWJhLkhUTUxfQVRUUlNbdHlwZV1cblx0XHRcdFx0XHRmb3IgbmFtZSBpbiBhdHRycy5zcGxpdChcIiBcIilcblx0XHRcdFx0XHRcdEltYmEuYXR0cihrbGFzcyxuYW1lKVxuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdGlmIGxldCBwcm9wcyA9IEltYmEuSFRNTF9QUk9QU1t0eXBlXVxuXHRcdFx0XHRcdGZvciBuYW1lIGluIHByb3BzLnNwbGl0KFwiIFwiKVxuXHRcdFx0XHRcdFx0SW1iYS5hdHRyKGtsYXNzLG5hbWUsZG9tOiB5ZXMpXG5cdFx0cmV0dXJuIGtsYXNzXG5cdFx0XG5cdGRlZiBjcmVhdGVFbGVtZW50IG5hbWUsIG93bmVyXG5cdFx0dmFyIHR5cFxuXHRcdGlmIG5hbWUgaXNhIEZ1bmN0aW9uXG5cdFx0XHR0eXAgPSBuYW1lXG5cdFx0ZWxzZVx0XHRcdFxuXHRcdFx0aWYgJGRlYnVnJFxuXHRcdFx0XHR0aHJvdyhcImNhbm5vdCBmaW5kIHRhZy10eXBlIHtuYW1lfVwiKSB1bmxlc3MgZmluZFRhZ1R5cGUobmFtZSlcblx0XHRcdHR5cCA9IGZpbmRUYWdUeXBlKG5hbWUpXG5cdFx0dHlwLmJ1aWxkKG93bmVyKVxuXG5cbmRlZiBJbWJhLmNyZWF0ZUVsZW1lbnQgbmFtZSwgY3R4LCByZWYsIHByZWZcblx0dmFyIHR5cGUgPSBuYW1lXG5cdHZhciBwYXJlbnRcblx0aWYgbmFtZSBpc2EgRnVuY3Rpb25cblx0XHR0eXBlID0gbmFtZVxuXHRlbHNlXG5cdFx0aWYgJGRlYnVnJFxuXHRcdFx0dGhyb3coXCJjYW5ub3QgZmluZCB0YWctdHlwZSB7bmFtZX1cIikgdW5sZXNzIEltYmEuVEFHUy5maW5kVGFnVHlwZShuYW1lKVxuXHRcdHR5cGUgPSBJbWJhLlRBR1MuZmluZFRhZ1R5cGUobmFtZSlcblx0XG5cdGlmIGN0eCBpc2EgVGFnTWFwXG5cdFx0cGFyZW50ID0gY3R4OnBhciRcblx0ZWxpZiBwcmVmIGlzYSBJbWJhLlRhZ1xuXHRcdHBhcmVudCA9IHByZWZcblx0ZWxzZVxuXHRcdHBhcmVudCA9IGN0eCBhbmQgcHJlZiAhPSB1bmRlZmluZWQgPyBjdHhbcHJlZl0gOiAoY3R4IGFuZCBjdHguQHRhZyBvciBjdHgpXG5cblx0dmFyIG5vZGUgPSB0eXBlLmJ1aWxkKHBhcmVudClcblx0XG5cdGlmIGN0eCBpc2EgVGFnTWFwXG5cdFx0Y3R4OmkkKytcblx0XHRub2RlOiRrZXkgPSByZWZcblxuXHQjIG5vZGU6JHJlZiA9IHJlZiBpZiByZWZcblx0IyBjb250ZXh0OmkkKysgIyBvbmx5IGlmIGl0IGlzIG5vdCBhbiBhcnJheT9cblx0aWYgY3R4IGFuZCByZWYgIT0gdW5kZWZpbmVkXG5cdFx0Y3R4W3JlZl0gPSBub2RlXG5cblx0cmV0dXJuIG5vZGVcblxuZGVmIEltYmEuY3JlYXRlVGFnQ2FjaGUgb3duZXJcblx0dmFyIGl0ZW0gPSBbXVxuXHRpdGVtLkB0YWcgPSBvd25lclxuXHRyZXR1cm4gaXRlbVxuXG5cdHZhciBwYXIgPSAocHJlZiAhPSB1bmRlZmluZWQgPyBjdHhbcHJlZl0gOiBjdHguQHRhZylcblx0dmFyIG5vZGUgPSBUYWdNYXAubmV3KGN0eCxyZWYscGFyKVxuXHRjdHhbcmVmXSA9IG5vZGVcblx0cmV0dXJuIG5vZGVcblx0XG5kZWYgSW1iYS5jcmVhdGVUYWdNYXAgY3R4LCByZWYsIHByZWZcblx0dmFyIHBhciA9IChwcmVmICE9IHVuZGVmaW5lZCA/IHByZWYgOiBjdHguQHRhZylcblx0dmFyIG5vZGUgPSBUYWdNYXAubmV3KGN0eCxyZWYscGFyKVxuXHRjdHhbcmVmXSA9IG5vZGVcblx0cmV0dXJuIG5vZGVcblxuZGVmIEltYmEuY3JlYXRlVGFnTGlzdCBjdHgsIHJlZiwgcHJlZlxuXHR2YXIgbm9kZSA9IFtdXG5cdG5vZGUuQHR5cGUgPSA0XG5cdG5vZGUuQHRhZyA9IChwcmVmICE9IHVuZGVmaW5lZCA/IHByZWYgOiBjdHguQHRhZylcblx0Y3R4W3JlZl0gPSBub2RlXG5cdHJldHVybiBub2RlXG5cbiMgdXNlIGFycmF5IGluc3RlYWQ/XG5jbGFzcyBUYWdDYWNoZVxuXHRkZWYgc2VsZi5idWlsZCBvd25lclxuXHRcdHZhciBpdGVtID0gW11cblx0XHRpdGVtLkB0YWcgPSBvd25lclxuXHRcdHJldHVybiBpdGVtXG5cblx0ZGVmIGluaXRpYWxpemUgb3duZXJcblx0XHRzZWxmLkB0YWcgPSBvd25lclxuXHRcdHNlbGZcblx0XG5jbGFzcyBUYWdNYXBcblx0XG5cdGRlZiBpbml0aWFsaXplIGNhY2hlLCByZWYsIHBhclxuXHRcdHNlbGY6Y2FjaGUkID0gY2FjaGVcblx0XHRzZWxmOmtleSQgPSByZWZcblx0XHRzZWxmOnBhciQgPSBwYXJcblx0XHRzZWxmOmkkID0gMFxuXHRcdCMgc2VsZjpjdXJyJCA9IHNlbGY6JGl0ZXJuZXcoKVxuXHRcdCMgc2VsZjpuZXh0JCA9IHNlbGY6JGl0ZXJuZXcoKVxuXHRcblx0ZGVmICRpdGVyXG5cdFx0dmFyIGl0ZW0gPSBbXVxuXHRcdGl0ZW0uQHR5cGUgPSA1XG5cdFx0aXRlbTpzdGF0aWMgPSA1XG5cdFx0aXRlbTpjYWNoZSA9IHNlbGZcblx0XHRyZXR1cm4gaXRlbVxuXHRcdFxuXHRkZWYgJGl0ZXIyXG5cdFx0bGV0IG5leHQgPSBzZWxmOm5leHQkXG5cdFx0c2VsZjpuZXh0JCA9IHNlbGY6Y3VyciRcblx0XHRuZXh0Omxlbmd0aCA9IDBcblx0XHRyZXR1cm4gc2VsZjpjdXJyJCA9IG5leHRcblx0XHQjIHZhciBpdGVtID0gW11cblx0XHQjIGl0ZW0uQHR5cGUgPSA1XG5cdFx0IyBpdGVtOnN0YXRpYyA9IDVcblx0XHQjIGl0ZW06Y2FjaGUgPSBzZWxmXG5cdFx0IyByZXR1cm4gaXRlbVxuXHRcdFxuXHRkZWYgJHBydW5lIGl0ZW1zXG5cdFx0bGV0IGNhY2hlID0gc2VsZjpjYWNoZSRcblx0XHRsZXQga2V5ID0gc2VsZjprZXkkXG5cdFx0bGV0IGNsb25lID0gVGFnTWFwLm5ldyhjYWNoZSxrZXksc2VsZjpwYXIkKVxuXHRcdGZvciBpdGVtIGluIGl0ZW1zXG5cdFx0XHRjbG9uZVtpdGVtOmtleSRdID0gaXRlbVxuXHRcdGNsb25lOmkkID0gaXRlbXM6bGVuZ3RoXG5cdFx0cmV0dXJuIGNhY2hlW2tleV0gPSBjbG9uZVxuXG5JbWJhLlRhZ01hcCA9IFRhZ01hcFxuSW1iYS5UYWdDYWNoZSA9IFRhZ0NhY2hlXG5JbWJhLlNJTkdMRVRPTlMgPSB7fVxuSW1iYS5UQUdTID0gSW1iYS5UYWdzLm5ld1xuSW1iYS5UQUdTWzplbGVtZW50XSA9IEltYmEuVEFHU1s6aHRtbGVsZW1lbnRdID0gSW1iYS5UYWdcbkltYmEuVEFHU1snc3ZnOmVsZW1lbnQnXSA9IEltYmEuU1ZHVGFnXG5cbmRlZiBJbWJhLmRlZmluZVRhZyBuYW1lLCBzdXByID0gJycsICZib2R5XG5cdHJldHVybiBJbWJhLlRBR1MuZGVmaW5lVGFnKG5hbWUsc3Vwcixib2R5KVxuXG5kZWYgSW1iYS5kZWZpbmVTaW5nbGV0b25UYWcgaWQsIHN1cHIgPSAnZGl2JywgJmJvZHlcblx0cmV0dXJuIEltYmEuVEFHUy5kZWZpbmVUYWcobmFtZSxzdXByLGJvZHkpXG5cbmRlZiBJbWJhLmV4dGVuZFRhZyBuYW1lLCBib2R5XG5cdHJldHVybiBJbWJhLlRBR1MuZXh0ZW5kVGFnKG5hbWUsYm9keSlcblxuZGVmIEltYmEuZ2V0VGFnU2luZ2xldG9uIGlkXHRcblx0dmFyIGRvbSwgbm9kZVxuXG5cdGlmIHZhciBrbGFzcyA9IEltYmEuU0lOR0xFVE9OU1tpZF1cblx0XHRyZXR1cm4ga2xhc3MuSW5zdGFuY2UgaWYga2xhc3MgYW5kIGtsYXNzLkluc3RhbmNlIFxuXG5cdFx0IyBubyBpbnN0YW5jZSAtIGNoZWNrIGZvciBlbGVtZW50XG5cdFx0aWYgZG9tID0gSW1iYS5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcblx0XHRcdCMgd2UgaGF2ZSBhIGxpdmUgaW5zdGFuY2UgLSB3aGVuIGZpbmRpbmcgaXQgdGhyb3VnaCBhIHNlbGVjdG9yIHdlIHNob3VsZCBhd2FrZSBpdCwgbm8/XG5cdFx0XHQjIGNvbnNvbGUubG9nKCdjcmVhdGluZyB0aGUgc2luZ2xldG9uIGZyb20gZXhpc3Rpbmcgbm9kZSBpbiBkb20/JyxpZCx0eXBlKVxuXHRcdFx0bm9kZSA9IGtsYXNzLkluc3RhbmNlID0ga2xhc3MubmV3KGRvbSlcblx0XHRcdG5vZGUuYXdha2VuKGRvbSkgIyBzaG91bGQgb25seSBhd2FrZW5cblx0XHRcdHJldHVybiBub2RlXG5cblx0XHRkb20gPSBrbGFzcy5jcmVhdGVOb2RlXG5cdFx0ZG9tOmlkID0gaWRcblx0XHRub2RlID0ga2xhc3MuSW5zdGFuY2UgPSBrbGFzcy5uZXcoZG9tKVxuXHRcdG5vZGUuZW5kLmF3YWtlbihkb20pXG5cdFx0cmV0dXJuIG5vZGVcblx0ZWxpZiBkb20gPSBJbWJhLmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxuXHRcdHJldHVybiBJbWJhLmdldFRhZ0ZvckRvbShkb20pXG5cbnZhciBzdmdTdXBwb3J0ID0gdHlwZW9mIFNWR0VsZW1lbnQgIT09ICd1bmRlZmluZWQnXG5cbiMgc2h1b2xkIGJlIHBoYXNlZCBvdXRcbmRlZiBJbWJhLmdldFRhZ0ZvckRvbSBkb21cblx0cmV0dXJuIG51bGwgdW5sZXNzIGRvbVxuXHRyZXR1cm4gZG9tIGlmIGRvbS5AZG9tICMgY291bGQgdXNlIGluaGVyaXRhbmNlIGluc3RlYWRcblx0cmV0dXJuIGRvbS5AdGFnIGlmIGRvbS5AdGFnXG5cdHJldHVybiBudWxsIHVubGVzcyBkb206bm9kZU5hbWVcblxuXHR2YXIgbmFtZSA9IGRvbTpub2RlTmFtZS50b0xvd2VyQ2FzZVxuXHR2YXIgdHlwZSA9IG5hbWVcblx0dmFyIG5zID0gSW1iYS5UQUdTICMgIHN2Z1N1cHBvcnQgYW5kIGRvbSBpc2EgU1ZHRWxlbWVudCA/IEltYmEuVEFHUzpfU1ZHIDogSW1iYS5UQUdTXG5cblx0aWYgZG9tOmlkIGFuZCBJbWJhLlNJTkdMRVRPTlNbZG9tOmlkXVxuXHRcdHJldHVybiBJbWJhLmdldFRhZ1NpbmdsZXRvbihkb206aWQpXG5cdFx0XG5cdGlmIHN2Z1N1cHBvcnQgYW5kIGRvbSBpc2EgU1ZHRWxlbWVudFxuXHRcdHR5cGUgPSBucy5maW5kVGFnVHlwZShcInN2ZzpcIiArIG5hbWUpXG5cdGVsaWYgSW1iYS5IVE1MX1RBR1MuaW5kZXhPZihuYW1lKSA+PSAwXG5cdFx0dHlwZSA9IG5zLmZpbmRUYWdUeXBlKG5hbWUpXG5cdGVsc2Vcblx0XHR0eXBlID0gSW1iYS5UYWdcblx0IyBpZiBucy5Abm9kZU5hbWVzLmluZGV4T2YobmFtZSkgPj0gMFxuXHQjXHR0eXBlID0gbnMuZmluZFRhZ1R5cGUobmFtZSlcblxuXHRyZXR1cm4gdHlwZS5uZXcoZG9tLG51bGwpLmF3YWtlbihkb20pXG5cbiMgZGVwcmVjYXRlXG5kZWYgSW1iYS5nZW5lcmF0ZUNTU1ByZWZpeGVzXG5cdHZhciBzdHlsZXMgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudDpkb2N1bWVudEVsZW1lbnQsICcnKVxuXG5cdGZvciBwcmVmaXhlZCBpbiBzdHlsZXNcblx0XHR2YXIgdW5wcmVmaXhlZCA9IHByZWZpeGVkLnJlcGxhY2UoL14tKHdlYmtpdHxtc3xtb3p8b3xibGluayktLywnJylcblx0XHR2YXIgY2FtZWxDYXNlID0gdW5wcmVmaXhlZC5yZXBsYWNlKC8tKFxcdykvZykgZG8gfG0sYXwgYS50b1VwcGVyQ2FzZVxuXG5cdFx0IyBpZiB0aGVyZSBleGlzdHMgYW4gdW5wcmVmaXhlZCB2ZXJzaW9uIC0tIGFsd2F5cyB1c2UgdGhpc1xuXHRcdGlmIHByZWZpeGVkICE9IHVucHJlZml4ZWRcblx0XHRcdGNvbnRpbnVlIGlmIHN0eWxlcy5oYXNPd25Qcm9wZXJ0eSh1bnByZWZpeGVkKVxuXG5cdFx0IyByZWdpc3RlciB0aGUgcHJlZml4ZXNcblx0XHRJbWJhLkNTU0tleU1hcFt1bnByZWZpeGVkXSA9IEltYmEuQ1NTS2V5TWFwW2NhbWVsQ2FzZV0gPSBwcmVmaXhlZFxuXHRyZXR1cm5cblxuaWYgJHdlYiRcblx0SW1iYS5nZW5lcmF0ZUNTU1ByZWZpeGVzIGlmIGRvY3VtZW50XG5cblx0IyBPdnZlcnJpZGUgY2xhc3NMaXN0XG5cdGlmIGRvY3VtZW50IGFuZCAhZG9jdW1lbnQ6ZG9jdW1lbnRFbGVtZW50OmNsYXNzTGlzdFxuXHRcdGV4dGVuZCB0YWcgZWxlbWVudFxuXG5cdFx0XHRkZWYgaGFzRmxhZyByZWZcblx0XHRcdFx0cmV0dXJuIFJlZ0V4cC5uZXcoJyhefFxcXFxzKScgKyByZWYgKyAnKFxcXFxzfCQpJykudGVzdChAZG9tOmNsYXNzTmFtZSlcblxuXHRcdFx0ZGVmIGFkZEZsYWcgcmVmXG5cdFx0XHRcdHJldHVybiBzZWxmIGlmIGhhc0ZsYWcocmVmKVxuXHRcdFx0XHRAZG9tOmNsYXNzTmFtZSArPSAoQGRvbTpjbGFzc05hbWUgPyAnICcgOiAnJykgKyByZWZcblx0XHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdFx0ZGVmIHVuZmxhZyByZWZcblx0XHRcdFx0cmV0dXJuIHNlbGYgdW5sZXNzIGhhc0ZsYWcocmVmKVxuXHRcdFx0XHR2YXIgcmVnZXggPSBSZWdFeHAubmV3KCcoXnxcXFxccykqJyArIHJlZiArICcoXFxcXHN8JCkqJywgJ2cnKVxuXHRcdFx0XHRAZG9tOmNsYXNzTmFtZSA9IEBkb206Y2xhc3NOYW1lLnJlcGxhY2UocmVnZXgsICcnKVxuXHRcdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0XHRkZWYgdG9nZ2xlRmxhZyByZWZcblx0XHRcdFx0aGFzRmxhZyhyZWYpID8gdW5mbGFnKHJlZikgOiBmbGFnKHJlZilcblxuXHRcdFx0ZGVmIGZsYWcgcmVmLCBib29sXG5cdFx0XHRcdGlmIGFyZ3VtZW50czpsZW5ndGggPT0gMiBhbmQgISFib29sID09PSBub1xuXHRcdFx0XHRcdHJldHVybiB1bmZsYWcocmVmKVxuXHRcdFx0XHRyZXR1cm4gYWRkRmxhZyhyZWYpXG5cbkltYmEuVGFnXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vdGFnLmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbiMgcHJlZGVmaW5lIGFsbCBzdXBwb3J0ZWQgaHRtbCB0YWdzXG50YWcgZnJhZ21lbnQgPCBlbGVtZW50XG5cblx0ZGVmIHNlbGYuY3JlYXRlTm9kZVxuXHRcdEltYmEuZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudFxuXG5leHRlbmQgdGFnIGh0bWxcblx0ZGVmIHBhcmVudFxuXHRcdG51bGxcblxuXG5leHRlbmQgdGFnIGNhbnZhc1xuXHRkZWYgY29udGV4dCB0eXBlID0gJzJkJ1xuXHRcdGRvbS5nZXRDb250ZXh0KHR5cGUpXG5cbmNsYXNzIERhdGFWYWx1ZVxuXHRcblx0ZGVmIGluaXRpYWxpemUgbm9kZSwgcGF0aCwgbW9kc1xuXHRcdEBub2RlID0gbm9kZVxuXHRcdEBwYXRoID0gcGF0aFxuXHRcdEBtb2RzID0gbW9kcyBvciB7fVxuXHRcdEBzZXR0ZXIgPSBJbWJhLnRvU2V0dGVyKEBwYXRoKVxuXHRcdGxldCB2YWx1ZUZuID0gbm9kZTp2YWx1ZVxuXHRcdG5vZGU6dmFsdWUgPSBkbyBtb2QodmFsdWVGbi5jYWxsKHRoaXMpKVxuXHRcblx0ZGVmIGNvbnRleHRcblx0XHRyZXR1cm4gQGNvbnRleHQgaWYgQGNvbnRleHRcblx0XHQjIGNhY2hpbmcgY2FuIGxlYWQgdG8gd2VpcmQgYmVoYXZpb3VyXG5cdFx0bGV0IGVsID0gQG5vZGVcblx0XHR3aGlsZSBlbFxuXHRcdFx0aWYgZWwuZGF0YVxuXHRcdFx0XHRAY29udGV4dCA9IGVsXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRlbCA9IGVsLkBvd25lcl9cblx0XHRyZXR1cm4gQGNvbnRleHRcblx0XHRcblx0ZGVmIGRhdGFcblx0XHR2YXIgY3R4ID0gY29udGV4dFxuXHRcdGN0eCA/IGN0eC5kYXRhIDogbnVsbFxuXHRcdFxuXHRkZWYgbGF6eVxuXHRcdEBtb2RzOmxhenlcblx0XHRcblx0ZGVmIGdldFxuXHRcdGxldCBkYXRhID0gc2VsZi5kYXRhXG5cdFx0cmV0dXJuIG51bGwgdW5sZXNzIGRhdGFcblx0XHRsZXQgdmFsID0gZGF0YVtAcGF0aF1cblx0XHRyZXR1cm4gdmFsIGlzYSBGdW5jdGlvbiBhbmQgZGF0YVtAc2V0dGVyXSA/IGRhdGFbQHBhdGhdKCkgOiB2YWxcblx0XHRcblx0ZGVmIHNldCB2YWx1ZVxuXHRcdGxldCBkYXRhID0gc2VsZi5kYXRhXG5cdFx0cmV0dXJuIHVubGVzcyBkYXRhXG5cblx0XHRsZXQgcHJldiA9IGRhdGFbQHBhdGhdXG5cdFx0aWYgcHJldiBpc2EgRnVuY3Rpb25cblx0XHRcdGlmIGRhdGFbQHNldHRlcl0gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdGRhdGFbQHNldHRlcl0odmFsdWUpXG5cdFx0XHRcdHJldHVybiBzZWxmXG5cdFx0ZGF0YVtAcGF0aF0gPSB2YWx1ZVxuXHRcdFxuXHRkZWYgaXNBcnJheSB2YWwgPSBnZXRcblx0XHR2YWwgYW5kIHZhbDpzcGxpY2UgYW5kIHZhbDpzb3J0XG5cdFxuXHRkZWYgbW9kIHZhbHVlXG5cdFx0aWYgdmFsdWUgaXNhIEFycmF5XG5cdFx0XHRyZXR1cm4gdmFsdWUubWFwIGRvIG1vZCgkMSlcblx0XHRpZiBAbW9kczp0cmltIGFuZCB2YWx1ZSBpc2EgU3RyaW5nXG5cdFx0XHR2YWx1ZSA9IHZhbHVlLnRyaW1cblx0XHRpZiBAbW9kczpudW1iZXJcblx0XHRcdHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSlcblx0XHRyZXR1cm4gdmFsdWVcblxuZXh0ZW5kIHRhZyBpbnB1dFxuXHRkZWYgbW9kZWxcblx0XHRAbW9kZWxcblx0XG5cdGRlZiBzZXRNb2RlbCB2YWx1ZSwgbW9kc1xuXHRcdEBtb2RlbCB8fD0gRGF0YVZhbHVlLm5ldyhzZWxmLHZhbHVlLG1vZHMpXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgc2V0VmFsdWUgdmFsdWVcblx0XHRkb206dmFsdWUgPSBAdmFsdWUgPSB2YWx1ZVxuXHRcdHNlbGZcblxuXHRkZWYgb25pbnB1dCBlXG5cdFx0bGV0IHZhbCA9IEBkb206dmFsdWVcblx0XHRAbG9jYWxWYWx1ZSA9IEBpbml0aWFsVmFsdWUgIT0gdmFsID8gdmFsIDogdW5kZWZpbmVkXG5cdFx0bW9kZWwgYW5kICFtb2RlbC5sYXp5ID8gbW9kZWwuc2V0KHZhbHVlKSA6IGUuc2lsZW5jZVx0XHRcblx0XHRcblx0ZGVmIG9uY2hhbmdlIGVcblx0XHRAbW9kZWxWYWx1ZSA9IEBsb2NhbFZhbHVlID0gdW5kZWZpbmVkXG5cdFx0cmV0dXJuIGUuc2lsZW5jZSB1bmxlc3MgbW9kZWxcblx0XHRcblx0XHRpZiB0eXBlID09ICdyYWRpbycgb3IgdHlwZSA9PSAnY2hlY2tib3gnXG5cdFx0XHRsZXQgY2hlY2tlZCA9IEBkb206Y2hlY2tlZFxuXHRcdFx0bGV0IG12YWwgPSBtb2RlbC5nZXRcblx0XHRcdGxldCBkdmFsID0gQHZhbHVlICE9IHVuZGVmaW5lZCA/IEB2YWx1ZSA6IHZhbHVlXG5cdFx0XHQjIGNvbnNvbGUubG9nIFwiY2hhbmdlXCIsdHlwZSxjaGVja2VkLGR2YWxcblxuXHRcdFx0aWYgdHlwZSA9PSAncmFkaW8nXG5cdFx0XHRcdG1vZGVsLnNldChkdmFsLHRydWUpXG5cdFx0XHRlbGlmIGRvbTp2YWx1ZSA9PSAnb24nXG5cdFx0XHRcdG1vZGVsLnNldCghIWNoZWNrZWQsdHJ1ZSlcblx0XHRcdGVsaWYgbW9kZWwuaXNBcnJheVxuXHRcdFx0XHRsZXQgaWR4ID0gbXZhbC5pbmRleE9mKGR2YWwpXG5cdFx0XHRcdGlmIGNoZWNrZWQgYW5kIGlkeCA9PSAtMVxuXHRcdFx0XHRcdG12YWwucHVzaChkdmFsKVxuXHRcdFx0XHRlbGlmICFjaGVja2VkIGFuZCBpZHggPj0gMFxuXHRcdFx0XHRcdG12YWwuc3BsaWNlKGlkeCwxKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRtb2RlbC5zZXQoZHZhbClcblx0XHRlbHNlXG5cdFx0XHRtb2RlbC5zZXQodmFsdWUpXG5cdFxuXHQjIG92ZXJyaWRpbmcgZW5kIGRpcmVjdGx5IGZvciBwZXJmb3JtYW5jZVxuXHRkZWYgZW5kXG5cdFx0cmV0dXJuIHNlbGYgaWYgIUBtb2RlbCBvciBAbG9jYWxWYWx1ZSAhPT0gdW5kZWZpbmVkXG5cdFx0bGV0IG12YWwgPSBAbW9kZWwuZ2V0XG5cdFx0cmV0dXJuIHNlbGYgaWYgbXZhbCA9PSBAbW9kZWxWYWx1ZVxuXHRcdEBtb2RlbFZhbHVlID0gbXZhbCB1bmxlc3MgbW9kZWwuaXNBcnJheVxuXG5cdFx0aWYgdHlwZSA9PSAncmFkaW8nIG9yIHR5cGUgPT0gJ2NoZWNrYm94J1xuXHRcdFx0bGV0IGR2YWwgPSBAdmFsdWVcblx0XHRcdGxldCBjaGVja2VkID0gaWYgbW9kZWwuaXNBcnJheVxuXHRcdFx0XHRtdmFsLmluZGV4T2YoZHZhbCkgPj0gMFxuXHRcdFx0ZWxpZiBkb206dmFsdWUgPT0gJ29uJ1xuXHRcdFx0XHQhIW12YWxcblx0XHRcdGVsc2Vcblx0XHRcdFx0bXZhbCA9PSBAdmFsdWVcblxuXHRcdFx0QGRvbTpjaGVja2VkID0gY2hlY2tlZFxuXHRcdGVsc2Vcblx0XHRcdEBkb206dmFsdWUgPSBtdmFsXG5cdFx0XHRAaW5pdGlhbFZhbHVlID0gQGRvbTp2YWx1ZVxuXHRcdHNlbGZcblxuZXh0ZW5kIHRhZyB0ZXh0YXJlYVxuXHRkZWYgbW9kZWxcblx0XHRAbW9kZWxcblxuXHRkZWYgc2V0TW9kZWwgdmFsdWUsIG1vZHNcblx0XHRAbW9kZWwgfHw9IERhdGFWYWx1ZS5uZXcoc2VsZix2YWx1ZSxtb2RzKVxuXHRcdHJldHVybiBzZWxmXG5cdFxuXHRkZWYgc2V0VmFsdWUgdmFsdWVcblx0XHRkb206dmFsdWUgPSB2YWx1ZSBpZiBAbG9jYWxWYWx1ZSA9PSB1bmRlZmluZWRcblx0XHRyZXR1cm4gc2VsZlxuXHRcblx0ZGVmIG9uaW5wdXQgZVxuXHRcdGxldCB2YWwgPSBAZG9tOnZhbHVlXG5cdFx0QGxvY2FsVmFsdWUgPSBAaW5pdGlhbFZhbHVlICE9IHZhbCA/IHZhbCA6IHVuZGVmaW5lZFxuXHRcdG1vZGVsIGFuZCAhbW9kZWwubGF6eSA/IG1vZGVsLnNldCh2YWx1ZSkgOiBlLnNpbGVuY2VcblxuXHRkZWYgb25jaGFuZ2UgZVxuXHRcdEBsb2NhbFZhbHVlID0gdW5kZWZpbmVkXG5cdFx0bW9kZWwgPyBtb2RlbC5zZXQodmFsdWUpIDogZS5zaWxlbmNlXG5cdFx0XG5cdGRlZiByZW5kZXJcblx0XHRyZXR1cm4gaWYgQGxvY2FsVmFsdWUgIT0gdW5kZWZpbmVkIG9yICFtb2RlbFxuXHRcdGlmIG1vZGVsXG5cdFx0XHRAZG9tOnZhbHVlID0gbW9kZWwuZ2V0XG5cdFx0QGluaXRpYWxWYWx1ZSA9IEBkb206dmFsdWVcblx0XHRzZWxmXG5cbmV4dGVuZCB0YWcgb3B0aW9uXG5cdGRlZiBzZXRWYWx1ZSB2YWx1ZVxuXHRcdGlmIHZhbHVlICE9IEB2YWx1ZVxuXHRcdFx0ZG9tOnZhbHVlID0gQHZhbHVlID0gdmFsdWVcblx0XHRzZWxmXG5cblx0ZGVmIHZhbHVlXG5cdFx0QHZhbHVlIG9yIGRvbTp2YWx1ZVxuXG5leHRlbmQgdGFnIHNlbGVjdFxuXHRkZWYgbW9kZWxcblx0XHRAbW9kZWxcblxuXHRkZWYgc2V0TW9kZWwgdmFsdWUsIG1vZHNcblx0XHRAbW9kZWwgfHw9IERhdGFWYWx1ZS5uZXcoc2VsZix2YWx1ZSxtb2RzKVxuXHRcdHJldHVybiBzZWxmXG5cdFx0XG5cdGRlZiBzZXRWYWx1ZSB2YWx1ZVxuXHRcdGlmIHZhbHVlICE9IEB2YWx1ZVxuXHRcdFx0QHZhbHVlID0gdmFsdWVcblx0XHRcdGlmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0J1xuXHRcdFx0XHRmb3Igb3B0LGkgaW4gZG9tOm9wdGlvbnNcblx0XHRcdFx0XHRsZXQgb3ZhbCA9IChvcHQuQHRhZyA/IG9wdC5AdGFnLnZhbHVlIDogb3B0OnZhbHVlKVxuXHRcdFx0XHRcdGlmIHZhbHVlID09IG92YWxcblx0XHRcdFx0XHRcdGRvbTpzZWxlY3RlZEluZGV4ID0gaVxuXHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdGVsc2Vcblx0XHRcdFx0ZG9tOnZhbHVlID0gdmFsdWVcblx0XHRyZXR1cm4gc2VsZlxuXHRcdFxuXHRkZWYgdmFsdWVcblx0XHRpZiBtdWx0aXBsZVxuXHRcdFx0Zm9yIG9wdGlvbiBpbiBkb206c2VsZWN0ZWRPcHRpb25zXG5cdFx0XHRcdG9wdGlvbi5AdGFnID8gb3B0aW9uLkB0YWcudmFsdWUgOiBvcHRpb246dmFsdWVcblx0XHRlbHNlXG5cdFx0XHRsZXQgb3B0ID0gZG9tOnNlbGVjdGVkT3B0aW9uc1swXVxuXHRcdFx0b3B0ID8gKG9wdC5AdGFnID8gb3B0LkB0YWcudmFsdWUgOiBvcHQ6dmFsdWUpIDogbnVsbFxuXHRcblx0ZGVmIG9uY2hhbmdlIGVcblx0XHRtb2RlbCA/IG1vZGVsLnNldCh2YWx1ZSkgOiBlLnNpbGVuY2Vcblx0XHRcblx0ZGVmIHJlbmRlclxuXHRcdHJldHVybiB1bmxlc3MgbW9kZWxcblxuXHRcdGxldCBtdmFsID0gbW9kZWwuZ2V0XG5cdFx0IyBzeW5jIGRvbSB2YWx1ZVxuXHRcdGlmIG11bHRpcGxlXG5cdFx0XHRmb3Igb3B0aW9uIGluIGRvbTpvcHRpb25zXG5cdFx0XHRcdGxldCBvdmFsID0gbW9kZWwubW9kKG9wdGlvbi5AdGFnID8gb3B0aW9uLkB0YWcudmFsdWUgOiBvcHRpb246dmFsdWUpXG5cdFx0XHRcdGxldCBzZWwgPSBtdmFsLmluZGV4T2Yob3ZhbCkgPj0gMFxuXHRcdFx0XHRvcHRpb246c2VsZWN0ZWQgPSBzZWxcblx0XHRlbHNlXG5cdFx0XHRzZXRWYWx1ZShtdmFsKVxuXHRcdFx0IyB3aGF0IGlmIG12YWwgaXMgcmljaD8gV291bGQgYmUgbmljZSB3aXRoIHNvbWUgbWFwcGluZ1xuXHRcdFx0IyBkb206dmFsdWUgPSBtdmFsXG5cdFx0c2VsZlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9odG1sLmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbiMgSW1iYS5Ub3VjaFxuIyBCZWdhblx0QSBmaW5nZXIgdG91Y2hlZCB0aGUgc2NyZWVuLlxuIyBNb3ZlZFx0QSBmaW5nZXIgbW92ZWQgb24gdGhlIHNjcmVlbi5cbiMgU3RhdGlvbmFyeVx0QSBmaW5nZXIgaXMgdG91Y2hpbmcgdGhlIHNjcmVlbiBidXQgaGFzbid0IG1vdmVkLlxuIyBFbmRlZFx0QSBmaW5nZXIgd2FzIGxpZnRlZCBmcm9tIHRoZSBzY3JlZW4uIFRoaXMgaXMgdGhlIGZpbmFsIHBoYXNlIG9mIGEgdG91Y2guXG4jIENhbmNlbGVkIFRoZSBzeXN0ZW0gY2FuY2VsbGVkIHRyYWNraW5nIGZvciB0aGUgdG91Y2guXG5cbiMjI1xuQ29uc29saWRhdGVzIG1vdXNlIGFuZCB0b3VjaCBldmVudHMuIFRvdWNoIG9iamVjdHMgcGVyc2lzdCBhY3Jvc3MgYSB0b3VjaCxcbmZyb20gdG91Y2hzdGFydCB1bnRpbCBlbmQvY2FuY2VsLiBXaGVuIGEgdG91Y2ggc3RhcnRzLCBpdCB3aWxsIHRyYXZlcnNlXG5kb3duIGZyb20gdGhlIGlubmVybW9zdCB0YXJnZXQsIHVudGlsIGl0IGZpbmRzIGEgbm9kZSB0aGF0IHJlc3BvbmRzIHRvXG5vbnRvdWNoc3RhcnQuIFVubGVzcyB0aGUgdG91Y2ggaXMgZXhwbGljaXRseSByZWRpcmVjdGVkLCB0aGUgdG91Y2ggd2lsbFxuY2FsbCBvbnRvdWNobW92ZSBhbmQgb250b3VjaGVuZCAvIG9udG91Y2hjYW5jZWwgb24gdGhlIHJlc3BvbmRlciB3aGVuIGFwcHJvcHJpYXRlLlxuXG5cdHRhZyBkcmFnZ2FibGVcblx0XHQjIGNhbGxlZCB3aGVuIGEgdG91Y2ggc3RhcnRzXG5cdFx0ZGVmIG9udG91Y2hzdGFydCB0b3VjaFxuXHRcdFx0ZmxhZyAnZHJhZ2dpbmcnXG5cdFx0XHRzZWxmXG5cdFx0XG5cdFx0IyBjYWxsZWQgd2hlbiB0b3VjaCBtb3ZlcyAtIHNhbWUgdG91Y2ggb2JqZWN0XG5cdFx0ZGVmIG9udG91Y2htb3ZlIHRvdWNoXG5cdFx0XHQjIG1vdmUgdGhlIG5vZGUgd2l0aCB0b3VjaFxuXHRcdFx0Y3NzIHRvcDogdG91Y2guZHksIGxlZnQ6IHRvdWNoLmR4XG5cdFx0XG5cdFx0IyBjYWxsZWQgd2hlbiB0b3VjaCBlbmRzXG5cdFx0ZGVmIG9udG91Y2hlbmQgdG91Y2hcblx0XHRcdHVuZmxhZyAnZHJhZ2dpbmcnXG5cbkBpbmFtZSB0b3VjaFxuIyMjXG5jbGFzcyBJbWJhLlRvdWNoXG5cdHNlbGYuTGFzdFRpbWVzdGFtcCA9IDBcblx0c2VsZi5UYXBUaW1lb3V0ID0gNTBcblxuXHQjIHZhciBsYXN0TmF0aXZlVG91Y2hUaW1lb3V0ID0gNTBcblxuXHR2YXIgdG91Y2hlcyA9IFtdXG5cdHZhciBjb3VudCA9IDBcblx0dmFyIGlkZW50aWZpZXJzID0ge31cblxuXHRkZWYgc2VsZi5jb3VudFxuXHRcdGNvdW50XG5cblx0ZGVmIHNlbGYubG9va3VwIGl0ZW1cblx0XHRyZXR1cm4gaXRlbSBhbmQgKGl0ZW06X190b3VjaF9fIG9yIGlkZW50aWZpZXJzW2l0ZW06aWRlbnRpZmllcl0pXG5cblx0ZGVmIHNlbGYucmVsZWFzZSBpdGVtLHRvdWNoXG5cdFx0ZGVsZXRlIGlkZW50aWZpZXJzW2l0ZW06aWRlbnRpZmllcl1cblx0XHRkZWxldGUgaXRlbTpfX3RvdWNoX19cblx0XHRyZXR1cm5cblxuXHRkZWYgc2VsZi5vbnRvdWNoc3RhcnQgZVxuXHRcdGZvciB0IGluIGU6Y2hhbmdlZFRvdWNoZXNcblx0XHRcdGNvbnRpbnVlIGlmIGxvb2t1cCh0KVxuXHRcdFx0dmFyIHRvdWNoID0gaWRlbnRpZmllcnNbdDppZGVudGlmaWVyXSA9IHNlbGYubmV3KGUpICMgKGUpXG5cdFx0XHR0Ol9fdG91Y2hfXyA9IHRvdWNoXG5cdFx0XHR0b3VjaGVzLnB1c2godG91Y2gpXG5cdFx0XHRjb3VudCsrXG5cdFx0XHR0b3VjaC50b3VjaHN0YXJ0KGUsdClcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub250b3VjaG1vdmUgZVxuXHRcdGZvciB0IGluIGU6Y2hhbmdlZFRvdWNoZXNcblx0XHRcdGlmIHZhciB0b3VjaCA9IGxvb2t1cCh0KVxuXHRcdFx0XHR0b3VjaC50b3VjaG1vdmUoZSx0KVxuXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9udG91Y2hlbmQgZVxuXHRcdGZvciB0IGluIGU6Y2hhbmdlZFRvdWNoZXNcblx0XHRcdGlmIHZhciB0b3VjaCA9IGxvb2t1cCh0KVxuXHRcdFx0XHR0b3VjaC50b3VjaGVuZChlLHQpXG5cdFx0XHRcdHJlbGVhc2UodCx0b3VjaClcblx0XHRcdFx0Y291bnQtLVxuXG5cdFx0IyBlLnByZXZlbnREZWZhdWx0XG5cdFx0IyBub3QgYWx3YXlzIHN1cHBvcnRlZCFcblx0XHQjIHRvdWNoZXMgPSB0b3VjaGVzLmZpbHRlcih8fClcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub250b3VjaGNhbmNlbCBlXG5cdFx0Zm9yIHQgaW4gZTpjaGFuZ2VkVG91Y2hlc1xuXHRcdFx0aWYgdmFyIHRvdWNoID0gbG9va3VwKHQpXG5cdFx0XHRcdHRvdWNoLnRvdWNoY2FuY2VsKGUsdClcblx0XHRcdFx0cmVsZWFzZSh0LHRvdWNoKVxuXHRcdFx0XHRjb3VudC0tXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9ubW91c2Vkb3duIGVcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub25tb3VzZW1vdmUgZVxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5vbm1vdXNldXAgZVxuXHRcdHNlbGZcblxuXG5cdHByb3AgcGhhc2Vcblx0cHJvcCBhY3RpdmVcblx0cHJvcCBldmVudFxuXHRwcm9wIHBvaW50ZXJcblx0cHJvcCB0YXJnZXRcblx0cHJvcCBoYW5kbGVyXG5cdHByb3AgdXBkYXRlc1xuXHRwcm9wIHN1cHByZXNzXG5cdHByb3AgZGF0YVxuXHRwcm9wIGJ1YmJsZSBjaGFpbmFibGU6IHllc1xuXHRwcm9wIHRpbWVzdGFtcFxuXG5cdHByb3AgZ2VzdHVyZXNcblxuXHQjIyNcblx0QGludGVybmFsXG5cdEBjb25zdHJ1Y3RvclxuXHQjIyNcblx0ZGVmIGluaXRpYWxpemUgZXZlbnQsIHBvaW50ZXJcblx0XHQjIEBuYXRpdmUgID0gZmFsc2Vcblx0XHRzZWxmLmV2ZW50ID0gZXZlbnRcblx0XHRkYXRhID0ge31cblx0XHRhY3RpdmUgPSB5ZXNcblx0XHRAYnV0dG9uID0gZXZlbnQgYW5kIGV2ZW50OmJ1dHRvbiBvciAwXG5cdFx0QHN1cHByZXNzID0gbm8gIyBkZXByZWNhdGVkXG5cdFx0QGNhcHR1cmVkID0gbm9cblx0XHRidWJibGUgPSBub1xuXHRcdHBvaW50ZXIgPSBwb2ludGVyXG5cdFx0dXBkYXRlcyA9IDBcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBjYXB0dXJlXG5cdFx0QGNhcHR1cmVkID0geWVzXG5cdFx0QGV2ZW50IGFuZCBAZXZlbnQuc3RvcFByb3BhZ2F0aW9uXG5cdFx0dW5sZXNzIEBzZWxibG9ja2VyXG5cdFx0XHRAc2VsYmxvY2tlciA9IGRvIHxlfCBlLnByZXZlbnREZWZhdWx0XG5cdFx0XHRJbWJhLmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3NlbGVjdHN0YXJ0JyxAc2VsYmxvY2tlcix5ZXMpXG5cdFx0c2VsZlxuXG5cdGRlZiBpc0NhcHR1cmVkXG5cdFx0ISFAY2FwdHVyZWRcblxuXHQjIyNcblx0RXh0ZW5kIHRoZSB0b3VjaCB3aXRoIGEgcGx1Z2luIC8gZ2VzdHVyZS4gXG5cdEFsbCBldmVudHMgKHRvdWNoc3RhcnQsbW92ZSBldGMpIGZvciB0aGUgdG91Y2hcblx0d2lsbCBiZSB0cmlnZ2VyZWQgb24gdGhlIHBsdWdpbnMgaW4gdGhlIG9yZGVyIHRoZXlcblx0YXJlIGFkZGVkLlxuXHQjIyNcblx0ZGVmIGV4dGVuZCBwbHVnaW5cblx0XHQjIGNvbnNvbGUubG9nIFwiYWRkZWQgZ2VzdHVyZSEhIVwiXG5cdFx0QGdlc3R1cmVzIHx8PSBbXVxuXHRcdEBnZXN0dXJlcy5wdXNoKHBsdWdpbilcblx0XHRzZWxmXG5cblx0IyMjXG5cdFJlZGlyZWN0IHRvdWNoIHRvIHNwZWNpZmllZCB0YXJnZXQuIG9udG91Y2hzdGFydCB3aWxsIGFsd2F5cyBiZVxuXHRjYWxsZWQgb24gdGhlIG5ldyB0YXJnZXQuXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiByZWRpcmVjdCB0YXJnZXRcblx0XHRAcmVkaXJlY3QgPSB0YXJnZXRcblx0XHRzZWxmXG5cblx0IyMjXG5cdFN1cHByZXNzIHRoZSBkZWZhdWx0IGJlaGF2aW91ci4gV2lsbCBjYWxsIHByZXZlbnREZWZhdWx0IGZvclxuXHRhbGwgbmF0aXZlIGV2ZW50cyB0aGF0IGFyZSBwYXJ0IG9mIHRoZSB0b3VjaC5cblx0IyMjXG5cdGRlZiBzdXBwcmVzc1xuXHRcdCMgY29sbGlzaW9uIHdpdGggdGhlIHN1cHByZXNzIHByb3BlcnR5XG5cdFx0QGFjdGl2ZSA9IG5vXG5cdFx0XG5cdFx0c2VsZlxuXG5cdGRlZiBzdXBwcmVzcz0gdmFsdWVcblx0XHRjb25zb2xlLndhcm4gJ0ltYmEuVG91Y2gjc3VwcHJlc3M9IGlzIGRlcHJlY2F0ZWQnXG5cdFx0QHN1cHJlc3MgPSB2YWx1ZVxuXHRcdHNlbGZcblxuXHRkZWYgdG91Y2hzdGFydCBlLHRcblx0XHRAZXZlbnQgPSBlXG5cdFx0QHRvdWNoID0gdFxuXHRcdEBidXR0b24gPSAwXG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdGJlZ2FuXG5cdFx0dXBkYXRlXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCBpZiBlIGFuZCBpc0NhcHR1cmVkXG5cdFx0c2VsZlxuXG5cdGRlZiB0b3VjaG1vdmUgZSx0XG5cdFx0QGV2ZW50ID0gZVxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHR1cGRhdGVcblx0XHRlLnByZXZlbnREZWZhdWx0IGlmIGUgYW5kIGlzQ2FwdHVyZWRcblx0XHRzZWxmXG5cblx0ZGVmIHRvdWNoZW5kIGUsdFxuXHRcdEBldmVudCA9IGVcblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0ZW5kZWRcblxuXHRcdEltYmEuVG91Y2guTGFzdFRpbWVzdGFtcCA9IGU6dGltZVN0YW1wXG5cblx0XHRpZiBAbWF4ZHIgPCAyMFxuXHRcdFx0dmFyIHRhcCA9IEltYmEuRXZlbnQubmV3KGUpXG5cdFx0XHR0YXAudHlwZSA9ICd0YXAnXG5cdFx0XHR0YXAucHJvY2Vzc1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCBpZiB0YXAuQHJlc3BvbmRlclx0XG5cblx0XHRpZiBlIGFuZCBpc0NhcHR1cmVkXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0XG5cblx0XHRzZWxmXG5cblx0ZGVmIHRvdWNoY2FuY2VsIGUsdFxuXHRcdGNhbmNlbFxuXG5cdGRlZiBtb3VzZWRvd24gZSx0XG5cdFx0QGV2ZW50ID0gZVxuXHRcdEBidXR0b24gPSBlOmJ1dHRvblxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRiZWdhblxuXHRcdHVwZGF0ZVxuXHRcdEBtb3VzZW1vdmUgPSAofGV8IG1vdXNlbW92ZShlLGUpIClcblx0XHRJbWJhLmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsQG1vdXNlbW92ZSx5ZXMpXG5cdFx0c2VsZlxuXG5cdGRlZiBtb3VzZW1vdmUgZSx0XG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdEBldmVudCA9IGVcblx0XHRlLnByZXZlbnREZWZhdWx0IGlmIGlzQ2FwdHVyZWRcblx0XHR1cGRhdGVcblx0XHRtb3ZlXG5cdFx0c2VsZlxuXG5cdGRlZiBtb3VzZXVwIGUsdFxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRlbmRlZFxuXHRcdHNlbGZcblxuXHRkZWYgaWRsZVxuXHRcdHVwZGF0ZVxuXG5cdGRlZiBiZWdhblxuXHRcdEB0aW1lc3RhbXAgPSBEYXRlLm5vd1xuXHRcdEBtYXhkciA9IEBkciA9IDBcblx0XHRAeDAgPSBAeFxuXHRcdEB5MCA9IEB5XG5cblx0XHR2YXIgZG9tID0gZXZlbnQ6dGFyZ2V0XG5cdFx0dmFyIG5vZGUgPSBudWxsXG5cblx0XHRAc291cmNlVGFyZ2V0ID0gZG9tIGFuZCB0YWcoZG9tKVxuXG5cdFx0d2hpbGUgZG9tXG5cdFx0XHRub2RlID0gdGFnKGRvbSlcblx0XHRcdGlmIG5vZGUgJiYgbm9kZTpvbnRvdWNoc3RhcnRcblx0XHRcdFx0QGJ1YmJsZSA9IG5vXG5cdFx0XHRcdHRhcmdldCA9IG5vZGVcblx0XHRcdFx0dGFyZ2V0Lm9udG91Y2hzdGFydChzZWxmKVxuXHRcdFx0XHRicmVhayB1bmxlc3MgQGJ1YmJsZVxuXHRcdFx0ZG9tID0gZG9tOnBhcmVudE5vZGVcblxuXHRcdEB1cGRhdGVzKytcblx0XHRzZWxmXG5cblx0ZGVmIHVwZGF0ZVxuXHRcdHJldHVybiBzZWxmIGlmICFAYWN0aXZlIG9yIEBjYW5jZWxsZWRcblxuXHRcdHZhciBkciA9IE1hdGguc3FydChkeCpkeCArIGR5KmR5KVxuXHRcdEBtYXhkciA9IGRyIGlmIGRyID4gQGRyXG5cdFx0QGRyID0gZHJcblxuXHRcdCMgY2F0Y2hpbmcgYSB0b3VjaC1yZWRpcmVjdD8hP1xuXHRcdGlmIEByZWRpcmVjdFxuXHRcdFx0aWYgQHRhcmdldCBhbmQgQHRhcmdldDpvbnRvdWNoY2FuY2VsXG5cdFx0XHRcdEB0YXJnZXQub250b3VjaGNhbmNlbChzZWxmKVxuXHRcdFx0dGFyZ2V0ID0gQHJlZGlyZWN0XG5cdFx0XHRAcmVkaXJlY3QgPSBudWxsXG5cdFx0XHR0YXJnZXQub250b3VjaHN0YXJ0KHNlbGYpIGlmIHRhcmdldDpvbnRvdWNoc3RhcnRcblx0XHRcdHJldHVybiB1cGRhdGUgaWYgQHJlZGlyZWN0ICMgcG9zc2libHkgcmVkaXJlY3RpbmcgYWdhaW5cblxuXG5cdFx0QHVwZGF0ZXMrK1xuXHRcdGlmIEBnZXN0dXJlc1xuXHRcdFx0Zy5vbnRvdWNodXBkYXRlKHNlbGYpIGZvciBnIGluIEBnZXN0dXJlc1xuXG5cdFx0dGFyZ2V0Py5vbnRvdWNodXBkYXRlKHNlbGYpXG5cdFx0dXBkYXRlIGlmIEByZWRpcmVjdFxuXHRcdHNlbGZcblxuXHRkZWYgbW92ZVxuXHRcdHJldHVybiBzZWxmIGlmICFAYWN0aXZlIG9yIEBjYW5jZWxsZWRcblxuXHRcdGlmIEBnZXN0dXJlc1xuXHRcdFx0Zm9yIGcgaW4gQGdlc3R1cmVzXG5cdFx0XHRcdGcub250b3VjaG1vdmUoc2VsZixAZXZlbnQpIGlmIGc6b250b3VjaG1vdmVcblxuXHRcdHRhcmdldD8ub250b3VjaG1vdmUoc2VsZixAZXZlbnQpXG5cdFx0c2VsZlxuXG5cdGRlZiBlbmRlZFxuXHRcdHJldHVybiBzZWxmIGlmICFAYWN0aXZlIG9yIEBjYW5jZWxsZWRcblxuXHRcdEB1cGRhdGVzKytcblxuXHRcdGlmIEBnZXN0dXJlc1xuXHRcdFx0Zy5vbnRvdWNoZW5kKHNlbGYpIGZvciBnIGluIEBnZXN0dXJlc1xuXG5cdFx0dGFyZ2V0Py5vbnRvdWNoZW5kKHNlbGYpXG5cdFx0Y2xlYW51cF9cblx0XHRzZWxmXG5cblx0ZGVmIGNhbmNlbFxuXHRcdHVubGVzcyBAY2FuY2VsbGVkXG5cdFx0XHRAY2FuY2VsbGVkID0geWVzXG5cdFx0XHRjYW5jZWxsZWRcblx0XHRcdGNsZWFudXBfXG5cdFx0c2VsZlxuXG5cdGRlZiBjYW5jZWxsZWRcblx0XHRyZXR1cm4gc2VsZiB1bmxlc3MgQGFjdGl2ZVxuXG5cdFx0QGNhbmNlbGxlZCA9IHllc1xuXHRcdEB1cGRhdGVzKytcblxuXHRcdGlmIEBnZXN0dXJlc1xuXHRcdFx0Zm9yIGcgaW4gQGdlc3R1cmVzXG5cdFx0XHRcdGcub250b3VjaGNhbmNlbChzZWxmKSBpZiBnOm9udG91Y2hjYW5jZWxcblxuXHRcdHRhcmdldD8ub250b3VjaGNhbmNlbChzZWxmKVxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIGNsZWFudXBfXG5cdFx0aWYgQG1vdXNlbW92ZVxuXHRcdFx0SW1iYS5kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLEBtb3VzZW1vdmUseWVzKVxuXHRcdFx0QG1vdXNlbW92ZSA9IG51bGxcblx0XHRcblx0XHRpZiBAc2VsYmxvY2tlclxuXHRcdFx0SW1iYS5kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdzZWxlY3RzdGFydCcsQHNlbGJsb2NrZXIseWVzKVxuXHRcdFx0QHNlbGJsb2NrZXIgPSBudWxsXG5cdFx0XG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRUaGUgYWJzb2x1dGUgZGlzdGFuY2UgdGhlIHRvdWNoIGhhcyBtb3ZlZCBmcm9tIHN0YXJ0aW5nIHBvc2l0aW9uIFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgZHIgZG8gQGRyXG5cblx0IyMjXG5cdFRoZSBkaXN0YW5jZSB0aGUgdG91Y2ggaGFzIG1vdmVkIGhvcml6b250YWxseVxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgZHggZG8gQHggLSBAeDBcblxuXHQjIyNcblx0VGhlIGRpc3RhbmNlIHRoZSB0b3VjaCBoYXMgbW92ZWQgdmVydGljYWxseVxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgZHkgZG8gQHkgLSBAeTBcblxuXHQjIyNcblx0SW5pdGlhbCBob3Jpem9udGFsIHBvc2l0aW9uIG9mIHRvdWNoXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB4MCBkbyBAeDBcblxuXHQjIyNcblx0SW5pdGlhbCB2ZXJ0aWNhbCBwb3NpdGlvbiBvZiB0b3VjaFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgeTAgZG8gQHkwXG5cblx0IyMjXG5cdEhvcml6b250YWwgcG9zaXRpb24gb2YgdG91Y2hcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHggZG8gQHhcblxuXHQjIyNcblx0VmVydGljYWwgcG9zaXRpb24gb2YgdG91Y2hcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHkgZG8gQHlcblxuXHQjIyNcblx0SG9yaXpvbnRhbCBwb3NpdGlvbiBvZiB0b3VjaCByZWxhdGl2ZSB0byB0YXJnZXRcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHR4IGRvXG5cdFx0QHRhcmdldEJveCB8fD0gQHRhcmdldC5kb20uZ2V0Qm91bmRpbmdDbGllbnRSZWN0XG5cdFx0QHggLSBAdGFyZ2V0Qm94OmxlZnRcblxuXHQjIyNcblx0VmVydGljYWwgcG9zaXRpb24gb2YgdG91Y2ggcmVsYXRpdmUgdG8gdGFyZ2V0XG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB0eVxuXHRcdEB0YXJnZXRCb3ggfHw9IEB0YXJnZXQuZG9tLmdldEJvdW5kaW5nQ2xpZW50UmVjdFxuXHRcdEB5IC0gQHRhcmdldEJveDp0b3BcblxuXHQjIyNcblx0QnV0dG9uIHByZXNzZWQgaW4gdGhpcyB0b3VjaC4gTmF0aXZlIHRvdWNoZXMgZGVmYXVsdHMgdG8gbGVmdC1jbGljayAoMClcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGJ1dHRvbiBkbyBAYnV0dG9uICMgQHBvaW50ZXIgPyBAcG9pbnRlci5idXR0b24gOiAwXG5cblx0ZGVmIHNvdXJjZVRhcmdldFxuXHRcdEBzb3VyY2VUYXJnZXRcblxuXHRkZWYgZWxhcHNlZFxuXHRcdERhdGUubm93IC0gQHRpbWVzdGFtcFxuXG5cbmNsYXNzIEltYmEuVG91Y2hHZXN0dXJlXG5cblx0cHJvcCBhY3RpdmUgZGVmYXVsdDogbm9cblxuXHRkZWYgb250b3VjaHN0YXJ0IGVcblx0XHRzZWxmXG5cblx0ZGVmIG9udG91Y2h1cGRhdGUgZVxuXHRcdHNlbGZcblxuXHRkZWYgb250b3VjaGVuZCBlXG5cdFx0c2VsZlxuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vdG91Y2guaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxudmFyIGtleUNvZGVzID0ge1xuXHRlc2M6IDI3LFxuXHR0YWI6IDksXG5cdGVudGVyOiAxMyxcblx0c3BhY2U6IDMyLFxuXHR1cDogMzgsXG5cdGRvd246IDQwXG59XG5cbnZhciBlbCA9IEltYmEuVGFnOnByb3RvdHlwZVxuZGVmIGVsLnN0b3BNb2RpZmllciBlIGRvIGUuc3RvcCB8fCB0cnVlXG5kZWYgZWwucHJldmVudE1vZGlmaWVyIGUgZG8gZS5wcmV2ZW50IHx8IHRydWVcbmRlZiBlbC5zaWxlbmNlTW9kaWZpZXIgZSBkbyBlLnNpbGVuY2UgfHwgdHJ1ZVxuZGVmIGVsLmJ1YmJsZU1vZGlmaWVyIGUgZG8gZS5idWJibGUoeWVzKSB8fCB0cnVlXG5kZWYgZWwuY3RybE1vZGlmaWVyIGUgZG8gZS5ldmVudDpjdHJsS2V5ID09IHRydWVcbmRlZiBlbC5hbHRNb2RpZmllciBlIGRvIGUuZXZlbnQ6YWx0S2V5ID09IHRydWVcbmRlZiBlbC5zaGlmdE1vZGlmaWVyIGUgZG8gZS5ldmVudDpzaGlmdEtleSA9PSB0cnVlXG5kZWYgZWwubWV0YU1vZGlmaWVyIGUgZG8gZS5ldmVudDptZXRhS2V5ID09IHRydWVcbmRlZiBlbC5rZXlNb2RpZmllciBrZXksIGUgZG8gZS5rZXlDb2RlID8gKGUua2V5Q29kZSA9PSBrZXkpIDogdHJ1ZVxuZGVmIGVsLmRlbE1vZGlmaWVyIGUgZG8gZS5rZXlDb2RlID8gKGUua2V5Q29kZSA9PSA4IG9yIGUua2V5Q29kZSA9PSA0NikgOiB0cnVlXG5kZWYgZWwuc2VsZk1vZGlmaWVyIGUgZG8gZS5ldmVudDp0YXJnZXQgPT0gQGRvbVxuZGVmIGVsLmxlZnRNb2RpZmllciBlIGRvIGUuYnV0dG9uICE9IHVuZGVmaW5lZCA/IChlLmJ1dHRvbiA9PT0gMCkgOiBlbC5rZXlNb2RpZmllcigzNyxlKVxuZGVmIGVsLnJpZ2h0TW9kaWZpZXIgZSBkbyBlLmJ1dHRvbiAhPSB1bmRlZmluZWQgPyAoZS5idXR0b24gPT09IDIpIDogZWwua2V5TW9kaWZpZXIoMzksZSlcbmRlZiBlbC5taWRkbGVNb2RpZmllciBlIGRvIGUuYnV0dG9uICE9IHVuZGVmaW5lZCA/IChlLmJ1dHRvbiA9PT0gMSkgOiB0cnVlXG5kZWYgZWwuZ2V0SGFuZGxlciBzdHIgZG8gc2VsZltzdHJdXG5cbiMjI1xuSW1iYSBoYW5kbGVzIGFsbCBldmVudHMgaW4gdGhlIGRvbSB0aHJvdWdoIGEgc2luZ2xlIG1hbmFnZXIsXG5saXN0ZW5pbmcgYXQgdGhlIHJvb3Qgb2YgeW91ciBkb2N1bWVudC4gSWYgSW1iYSBmaW5kcyBhIHRhZ1xudGhhdCBsaXN0ZW5zIHRvIGEgY2VydGFpbiBldmVudCwgdGhlIGV2ZW50IHdpbGwgYmUgd3JhcHBlZCBcbmluIGFuIGBJbWJhLkV2ZW50YCwgd2hpY2ggbm9ybWFsaXplcyBzb21lIG9mIHRoZSBxdWlya3MgYW5kIFxuYnJvd3NlciBkaWZmZXJlbmNlcy5cblxuQGluYW1lIGV2ZW50XG4jIyNcbmNsYXNzIEltYmEuRXZlbnRcblxuXHQjIyMgcmVmZXJlbmNlIHRvIHRoZSBuYXRpdmUgZXZlbnQgIyMjXG5cdHByb3AgZXZlbnRcblxuXHQjIyMgcmVmZXJlbmNlIHRvIHRoZSBuYXRpdmUgZXZlbnQgIyMjXG5cdHByb3AgcHJlZml4XG5cblx0cHJvcCBkYXRhXG5cblx0cHJvcCByZXNwb25kZXJcblxuXHRkZWYgc2VsZi53cmFwIGVcblx0XHRzZWxmLm5ldyhlKVxuXHRcblx0ZGVmIGluaXRpYWxpemUgZVxuXHRcdGV2ZW50ID0gZVxuXHRcdEBidWJibGUgPSB5ZXNcblxuXHRkZWYgdHlwZT0gdHlwZVxuXHRcdEB0eXBlID0gdHlwZVxuXHRcdHNlbGZcblxuXHQjIyNcblx0QHJldHVybiB7U3RyaW5nfSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgKGNhc2UtaW5zZW5zaXRpdmUpXG5cdCMjI1xuXHRkZWYgdHlwZVxuXHRcdEB0eXBlIHx8IGV2ZW50OnR5cGVcblx0XG5cdGRlZiBidXR0b24gZG8gZXZlbnQ6YnV0dG9uXG5cdGRlZiBrZXlDb2RlIGRvIGV2ZW50OmtleUNvZGVcblxuXHRkZWYgbmFtZVxuXHRcdEBuYW1lIHx8PSB0eXBlLnRvTG93ZXJDYXNlLnJlcGxhY2UoL1xcOi9nLCcnKVxuXG5cdCMgbWltYyBnZXRzZXRcblx0ZGVmIGJ1YmJsZSB2XG5cdFx0aWYgdiAhPSB1bmRlZmluZWRcblx0XHRcdHNlbGYuYnViYmxlID0gdlxuXHRcdFx0cmV0dXJuIHNlbGZcblx0XHRyZXR1cm4gQGJ1YmJsZVxuXG5cdGRlZiBidWJibGU9IHZcblx0XHRAYnViYmxlID0gdlxuXHRcdHJldHVybiBzZWxmXG5cblx0IyMjXG5cdFByZXZlbnRzIGZ1cnRoZXIgcHJvcGFnYXRpb24gb2YgdGhlIGN1cnJlbnQgZXZlbnQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc3RvcFxuXHRcdGJ1YmJsZSA9IG5vXG5cdFx0c2VsZlxuXG5cdGRlZiBzdG9wUHJvcGFnYXRpb24gZG8gc3RvcFxuXHRkZWYgaGFsdCBkbyBzdG9wXG5cblx0IyBtaWdyYXRlIGZyb20gY2FuY2VsIHRvIHByZXZlbnRcblx0ZGVmIHByZXZlbnRcblx0XHRpZiBldmVudDpwcmV2ZW50RGVmYXVsdFxuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHRcblx0XHRlbHNlXG5cdFx0XHRldmVudDpkZWZhdWx0UHJldmVudGVkID0geWVzXG5cdFx0c2VsZjpkZWZhdWx0UHJldmVudGVkID0geWVzXG5cdFx0c2VsZlxuXG5cdGRlZiBwcmV2ZW50RGVmYXVsdFxuXHRcdGNvbnNvbGUud2FybiBcIkV2ZW50I3ByZXZlbnREZWZhdWx0IGlzIGRlcHJlY2F0ZWQgLSB1c2UgRXZlbnQjcHJldmVudFwiXG5cdFx0cHJldmVudFxuXG5cdCMjI1xuXHRJbmRpY2F0ZXMgd2hldGhlciBvciBub3QgZXZlbnQuY2FuY2VsIGhhcyBiZWVuIGNhbGxlZC5cblxuXHRAcmV0dXJuIHtCb29sZWFufVxuXHQjIyNcblx0ZGVmIGlzUHJldmVudGVkXG5cdFx0ZXZlbnQgYW5kIGV2ZW50OmRlZmF1bHRQcmV2ZW50ZWQgb3IgQGNhbmNlbFxuXG5cdCMjI1xuXHRDYW5jZWwgdGhlIGV2ZW50IChpZiBjYW5jZWxhYmxlKS4gSW4gdGhlIGNhc2Ugb2YgbmF0aXZlIGV2ZW50cyBpdFxuXHR3aWxsIGNhbGwgYHByZXZlbnREZWZhdWx0YCBvbiB0aGUgd3JhcHBlZCBldmVudCBvYmplY3QuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgY2FuY2VsXG5cdFx0Y29uc29sZS53YXJuIFwiRXZlbnQjY2FuY2VsIGlzIGRlcHJlY2F0ZWQgLSB1c2UgRXZlbnQjcHJldmVudFwiXG5cdFx0cHJldmVudFxuXG5cdGRlZiBzaWxlbmNlXG5cdFx0QHNpbGVuY2VkID0geWVzXG5cdFx0c2VsZlxuXG5cdGRlZiBpc1NpbGVuY2VkXG5cdFx0ISFAc2lsZW5jZWRcblxuXHQjIyNcblx0QSByZWZlcmVuY2UgdG8gdGhlIGluaXRpYWwgdGFyZ2V0IG9mIHRoZSBldmVudC5cblx0IyMjXG5cdGRlZiB0YXJnZXRcblx0XHR0YWcoZXZlbnQ6X3RhcmdldCBvciBldmVudDp0YXJnZXQpXG5cblx0IyMjXG5cdEEgcmVmZXJlbmNlIHRvIHRoZSBvYmplY3QgcmVzcG9uZGluZyB0byB0aGUgZXZlbnQuXG5cdCMjI1xuXHRkZWYgcmVzcG9uZGVyXG5cdFx0QHJlc3BvbmRlclxuXG5cdCMjI1xuXHRSZWRpcmVjdCB0aGUgZXZlbnQgdG8gbmV3IHRhcmdldFxuXHQjIyNcblx0ZGVmIHJlZGlyZWN0IG5vZGVcblx0XHRAcmVkaXJlY3QgPSBub2RlXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgcHJvY2Vzc0hhbmRsZXJzIG5vZGUsIGhhbmRsZXJzXG5cdFx0bGV0IGkgPSAxXG5cdFx0bGV0IGwgPSBoYW5kbGVyczpsZW5ndGhcblx0XHRsZXQgYnViYmxlID0gQGJ1YmJsZVxuXHRcdGxldCBzdGF0ZSA9IGhhbmRsZXJzOnN0YXRlIHx8PSB7fVxuXHRcdGxldCByZXN1bHQgXG5cdFx0XG5cdFx0aWYgYnViYmxlXG5cdFx0XHRAYnViYmxlID0gMVxuXG5cdFx0d2hpbGUgaSA8IGxcblx0XHRcdGxldCBpc01vZCA9IGZhbHNlXG5cdFx0XHRsZXQgaGFuZGxlciA9IGhhbmRsZXJzW2krK11cblx0XHRcdGxldCBwYXJhbXMgID0gbnVsbFxuXHRcdFx0bGV0IGNvbnRleHQgPSBub2RlXG5cdFx0XHRcblx0XHRcdGlmIGhhbmRsZXIgaXNhIEFycmF5XG5cdFx0XHRcdHBhcmFtcyA9IGhhbmRsZXIuc2xpY2UoMSlcblx0XHRcdFx0aGFuZGxlciA9IGhhbmRsZXJbMF1cblx0XHRcdFxuXHRcdFx0aWYgdHlwZW9mIGhhbmRsZXIgPT0gJ3N0cmluZydcblx0XHRcdFx0aWYga2V5Q29kZXNbaGFuZGxlcl1cblx0XHRcdFx0XHRwYXJhbXMgPSBba2V5Q29kZXNbaGFuZGxlcl1dXG5cdFx0XHRcdFx0aGFuZGxlciA9ICdrZXknXG5cdFx0XHRcdFx0XG5cdFx0XHRcdGxldCBtb2QgPSBoYW5kbGVyICsgJ01vZGlmaWVyJ1xuXG5cdFx0XHRcdGlmIG5vZGVbbW9kXVxuXHRcdFx0XHRcdGlzTW9kID0geWVzXG5cdFx0XHRcdFx0cGFyYW1zID0gKHBhcmFtcyBvciBbXSkuY29uY2F0KFtzZWxmLHN0YXRlXSlcblx0XHRcdFx0XHRoYW5kbGVyID0gbm9kZVttb2RdXG5cdFx0XHRcblx0XHRcdCMgaWYgaXQgaXMgc3RpbGwgYSBzdHJpbmcgLSBjYWxsIGdldEhhbmRsZXIgb25cblx0XHRcdCMgYW5jZXN0b3Igb2Ygbm9kZSB0byBzZWUgaWYgd2UgZ2V0IGEgaGFuZGxlciBmb3IgdGhpcyBuYW1lXG5cdFx0XHRpZiB0eXBlb2YgaGFuZGxlciA9PSAnc3RyaW5nJ1xuXHRcdFx0XHRsZXQgZWwgPSBub2RlXG5cdFx0XHRcdGxldCBmbiA9IG51bGxcblx0XHRcdFx0d2hpbGUgZWwgYW5kICghZm4gb3IgIShmbiBpc2EgRnVuY3Rpb24pKVxuXHRcdFx0XHRcdGlmIGZuID0gZWwuZ2V0SGFuZGxlcihoYW5kbGVyKVxuXHRcdFx0XHRcdFx0aGFuZGxlciA9IGZuXG5cdFx0XHRcdFx0XHRjb250ZXh0ID0gZWxcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRlbCA9IGVsLnBhcmVudFxuXHRcdFx0XHRcdFxuXHRcdFx0aWYgaGFuZGxlciBpc2EgRnVuY3Rpb25cblx0XHRcdFx0IyB3aGF0IGlmIHdlIGFjdHVhbGx5IGNhbGwgc3RvcCBpbnNpZGUgZnVuY3Rpb24/XG5cdFx0XHRcdCMgZG8gd2Ugc3RpbGwgd2FudCB0byBjb250aW51ZSB0aGUgY2hhaW4/XG5cdFx0XHRcdGxldCByZXMgPSBoYW5kbGVyLmFwcGx5KGNvbnRleHQscGFyYW1zIG9yIFtzZWxmXSlcblx0XHRcdFx0XG5cdFx0XHRcdCMgc2hvdWxkIHdlIHRha2UgYXdhaXRzIGludG8gYWNjb3VudD9cblx0XHRcdFx0IyB3YXMgYnViYmxpbmcgYmVmb3JlIC0gaGFzIG5vdCBiZWVuIG1vZGlmaWVkXG5cdFx0XHRcdGlmICFpc01vZFxuXHRcdFx0XHRcdGJ1YmJsZSA9IG5vICMgc3RvcCBwcm9wYWdhdGlvbiBieSBkZWZhdWx0XG5cdFx0XHRcdFx0QHJlc3BvbmRlciB8fD0gbm9kZVxuXG5cdFx0XHRcdGlmIHJlcyA9PSBmYWxzZVxuXHRcdFx0XHRcdCMgY29uc29sZS5sb2cgXCJyZXR1cm5lZCBmYWxzZSAtIGJyZWFraW5nXCJcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdGlmIHJlcyBhbmQgIUBzaWxlbmNlZCBhbmQgcmVzOnRoZW4gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdFx0cmVzLnRoZW4oSW1iYTpjb21taXQpXG5cdFx0XG5cdFx0IyBpZiB3ZSBoYXZlbnQgc3RvcHBlZCBvciBkZWFsdCB3aXRoIGJ1YmJsZSB3aGlsZSBoYW5kbGluZ1xuXHRcdGlmIEBidWJibGUgPT09IDFcblx0XHRcdEBidWJibGUgPSBidWJibGVcblxuXHRcdHJldHVybiBudWxsXG5cblx0ZGVmIHByb2Nlc3Ncblx0XHR2YXIgbmFtZSA9IHNlbGYubmFtZVxuXHRcdHZhciBtZXRoID0gXCJvbntAcHJlZml4IG9yICcnfXtuYW1lfVwiXG5cdFx0dmFyIGFyZ3MgPSBudWxsXG5cdFx0dmFyIGRvbXRhcmdldCA9IGV2ZW50Ol90YXJnZXQgb3IgZXZlbnQ6dGFyZ2V0XHRcdFxuXHRcdHZhciBkb21ub2RlID0gZG9tdGFyZ2V0Ol9yZXNwb25kZXIgb3IgZG9tdGFyZ2V0XG5cdFx0IyBAdG9kbyBuZWVkIHRvIHN0b3AgaW5maW5pdGUgcmVkaXJlY3QtcnVsZXMgaGVyZVxuXHRcdHZhciByZXN1bHRcblx0XHR2YXIgaGFuZGxlcnNcblxuXHRcdHdoaWxlIGRvbW5vZGVcblx0XHRcdEByZWRpcmVjdCA9IG51bGxcblx0XHRcdGxldCBub2RlID0gZG9tbm9kZS5AZG9tID8gZG9tbm9kZSA6IGRvbW5vZGUuQHRhZ1xuXG5cdFx0XHRpZiBub2RlXG5cdFx0XHRcdGlmIG5vZGVbbWV0aF0gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdFx0QHJlc3BvbmRlciB8fD0gbm9kZVxuXHRcdFx0XHRcdEBzaWxlbmNlZCA9IG5vXG5cdFx0XHRcdFx0cmVzdWx0ID0gYXJncyA/IG5vZGVbbWV0aF0uYXBwbHkobm9kZSxhcmdzKSA6IG5vZGVbbWV0aF0oc2VsZixkYXRhKVxuXG5cdFx0XHRcdGlmIGhhbmRsZXJzID0gbm9kZTpfb25fXG5cdFx0XHRcdFx0Zm9yIGhhbmRsZXIgaW4gaGFuZGxlcnMgd2hlbiBoYW5kbGVyXG5cdFx0XHRcdFx0XHRsZXQgaG5hbWUgPSBoYW5kbGVyWzBdXG5cdFx0XHRcdFx0XHRpZiBuYW1lID09IGhhbmRsZXJbMF0gYW5kIGJ1YmJsZSAjIGFuZCAoaG5hbWU6bGVuZ3RoID09IG5hbWU6bGVuZ3RoIG9yIGhuYW1lW25hbWU6bGVuZ3RoXSA9PSAnLicpXG5cdFx0XHRcdFx0XHRcdHByb2Nlc3NIYW5kbGVycyhub2RlLGhhbmRsZXIpXG5cdFx0XHRcdFx0YnJlYWsgdW5sZXNzIGJ1YmJsZVxuXG5cdFx0XHRcdGlmIG5vZGU6b25ldmVudFxuXHRcdFx0XHRcdG5vZGUub25ldmVudChzZWxmKVxuXG5cdFx0XHQjIGFkZCBub2RlLm5leHRFdmVudFJlc3BvbmRlciBhcyBhIHNlcGFyYXRlIG1ldGhvZCBoZXJlP1xuXHRcdFx0dW5sZXNzIGJ1YmJsZSBhbmQgZG9tbm9kZSA9IChAcmVkaXJlY3Qgb3IgKG5vZGUgPyBub2RlLnBhcmVudCA6IGRvbW5vZGU6cGFyZW50Tm9kZSkpXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRwcm9jZXNzZWRcblxuXHRcdCMgaWYgYSBoYW5kbGVyIHJldHVybnMgYSBwcm9taXNlLCBub3RpZnkgc2NoZWR1bGVyc1xuXHRcdCMgYWJvdXQgdGhpcyBhZnRlciBwcm9taXNlIGhhcyBmaW5pc2hlZCBwcm9jZXNzaW5nXG5cdFx0aWYgcmVzdWx0IGFuZCByZXN1bHQ6dGhlbiBpc2EgRnVuY3Rpb25cblx0XHRcdHJlc3VsdC50aGVuKHNlbGY6cHJvY2Vzc2VkLmJpbmQoc2VsZikpXG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cdGRlZiBwcm9jZXNzZWRcblx0XHRpZiAhQHNpbGVuY2VkIGFuZCBAcmVzcG9uZGVyXG5cdFx0XHRJbWJhLmVtaXQoSW1iYSwnZXZlbnQnLFtzZWxmXSlcblx0XHRcdEltYmEuY29tbWl0KGV2ZW50KVxuXHRcdHNlbGZcblxuXHQjIyNcblx0UmV0dXJuIHRoZSB4L2xlZnQgY29vcmRpbmF0ZSBvZiB0aGUgbW91c2UgLyBwb2ludGVyIGZvciB0aGlzIGV2ZW50XG5cdEByZXR1cm4ge051bWJlcn0geCBjb29yZGluYXRlIG9mIG1vdXNlIC8gcG9pbnRlciBmb3IgZXZlbnRcblx0IyMjXG5cdGRlZiB4IGRvIGV2ZW50OnhcblxuXHQjIyNcblx0UmV0dXJuIHRoZSB5L3RvcCBjb29yZGluYXRlIG9mIHRoZSBtb3VzZSAvIHBvaW50ZXIgZm9yIHRoaXMgZXZlbnRcblx0QHJldHVybiB7TnVtYmVyfSB5IGNvb3JkaW5hdGUgb2YgbW91c2UgLyBwb2ludGVyIGZvciBldmVudFxuXHQjIyNcblx0ZGVmIHkgZG8gZXZlbnQ6eVxuXG5cdCMjI1xuXHRSZXR1cm5zIGEgTnVtYmVyIHJlcHJlc2VudGluZyBhIHN5c3RlbSBhbmQgaW1wbGVtZW50YXRpb25cblx0ZGVwZW5kZW50IG51bWVyaWMgY29kZSBpZGVudGlmeWluZyB0aGUgdW5tb2RpZmllZCB2YWx1ZSBvZiB0aGVcblx0cHJlc3NlZCBrZXk7IHRoaXMgaXMgdXN1YWxseSB0aGUgc2FtZSBhcyBrZXlDb2RlLlxuXG5cdEZvciBtb3VzZS1ldmVudHMsIHRoZSByZXR1cm5lZCB2YWx1ZSBpbmRpY2F0ZXMgd2hpY2ggYnV0dG9uIHdhc1xuXHRwcmVzc2VkIG9uIHRoZSBtb3VzZSB0byB0cmlnZ2VyIHRoZSBldmVudC5cblxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgd2hpY2ggZG8gZXZlbnQ6d2hpY2hcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL2V2ZW50LmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5yZXF1aXJlKFwiLi9wb2ludGVyXCIpXG5cbiMjI1xuXG5NYW5hZ2VyIGZvciBsaXN0ZW5pbmcgdG8gYW5kIGRlbGVnYXRpbmcgZXZlbnRzIGluIEltYmEuIEEgc2luZ2xlIGluc3RhbmNlXG5pcyBhbHdheXMgY3JlYXRlZCBieSBJbWJhIChhcyBgSW1iYS5FdmVudHNgKSwgd2hpY2ggaGFuZGxlcyBhbmQgZGVsZWdhdGVzIGFsbFxuZXZlbnRzIGF0IHRoZSB2ZXJ5IHJvb3Qgb2YgdGhlIGRvY3VtZW50LiBJbWJhIGRvZXMgbm90IGNhcHR1cmUgYWxsIGV2ZW50c1xuYnkgZGVmYXVsdCwgc28gaWYgeW91IHdhbnQgdG8gbWFrZSBzdXJlIGV4b3RpYyBvciBjdXN0b20gRE9NRXZlbnRzIGFyZSBkZWxlZ2F0ZWRcbmluIEltYmEgeW91IHdpbGwgbmVlZCB0byByZWdpc3RlciB0aGVtIGluIGBJbWJhLkV2ZW50cy5yZWdpc3RlcihteUN1c3RvbUV2ZW50TmFtZSlgXG5cbkBpbmFtZSBtYW5hZ2VyXG5cbiMjI1xuY2xhc3MgSW1iYS5FdmVudE1hbmFnZXJcblxuXHRwcm9wIHJvb3Rcblx0cHJvcCBjb3VudFxuXHRwcm9wIGVuYWJsZWQgZGVmYXVsdDogbm8sIHdhdGNoOiB5ZXNcblx0cHJvcCBsaXN0ZW5lcnNcblx0cHJvcCBkZWxlZ2F0b3JzXG5cdHByb3AgZGVsZWdhdG9yXG5cblx0ZGVmIGVuYWJsZWQtZGlkLXNldCBib29sXG5cdFx0Ym9vbCA/IG9uZW5hYmxlIDogb25kaXNhYmxlXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLmFjdGl2YXRlXG5cdFx0cmV0dXJuIEltYmEuRXZlbnRzIGlmIEltYmEuRXZlbnRzXG5cblx0XHRpZiAkd2ViJFxuXHRcdFx0SW1iYS5QT0lOVEVSIHx8PSBJbWJhLlBvaW50ZXIubmV3XG5cblx0XHRcdEltYmEuRXZlbnRzID0gSW1iYS5FdmVudE1hbmFnZXIubmV3KEltYmEuZG9jdW1lbnQsIGV2ZW50czogW1xuXHRcdFx0XHQ6a2V5ZG93biwgOmtleXVwLCA6a2V5cHJlc3MsXG5cdFx0XHRcdDp0ZXh0SW5wdXQsIDppbnB1dCwgOmNoYW5nZSwgOnN1Ym1pdCxcblx0XHRcdFx0OmZvY3VzaW4sIDpmb2N1c291dCwgOmZvY3VzLCA6Ymx1cixcblx0XHRcdFx0OmNvbnRleHRtZW51LCA6ZGJsY2xpY2ssXG5cdFx0XHRcdDptb3VzZXdoZWVsLCA6d2hlZWwsIDpzY3JvbGwsXG5cdFx0XHRcdDpiZWZvcmVjb3B5LCA6Y29weSxcblx0XHRcdFx0OmJlZm9yZXBhc3RlLCA6cGFzdGUsXG5cdFx0XHRcdDpiZWZvcmVjdXQsIDpjdXRcblx0XHRcdF0pXG5cblx0XHRcdCMgc2hvdWxkIGxpc3RlbiB0byBkcmFnZHJvcCBldmVudHMgYnkgZGVmYXVsdFxuXHRcdFx0SW1iYS5FdmVudHMucmVnaXN0ZXIoW1xuXHRcdFx0XHQ6ZHJhZ3N0YXJ0LDpkcmFnLDpkcmFnZW5kLFxuXHRcdFx0XHQ6ZHJhZ2VudGVyLDpkcmFnb3Zlciw6ZHJhZ2xlYXZlLDpkcmFnZXhpdCw6ZHJvcFxuXHRcdFx0XSlcblxuXHRcdFx0dmFyIGhhc1RvdWNoRXZlbnRzID0gd2luZG93ICYmIHdpbmRvdzpvbnRvdWNoc3RhcnQgIT09IHVuZGVmaW5lZFxuXG5cdFx0XHRpZiBoYXNUb3VjaEV2ZW50c1xuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoc3RhcnQpIGRvIHxlfFxuXHRcdFx0XHRcdEltYmEuVG91Y2gub250b3VjaHN0YXJ0KGUpXG5cblx0XHRcdFx0SW1iYS5FdmVudHMubGlzdGVuKDp0b3VjaG1vdmUpIGRvIHxlfFxuXHRcdFx0XHRcdEltYmEuVG91Y2gub250b3VjaG1vdmUoZSlcblxuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoZW5kKSBkbyB8ZXxcblx0XHRcdFx0XHRJbWJhLlRvdWNoLm9udG91Y2hlbmQoZSlcblxuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoY2FuY2VsKSBkbyB8ZXxcblx0XHRcdFx0XHRJbWJhLlRvdWNoLm9udG91Y2hjYW5jZWwoZSlcblxuXHRcdFx0SW1iYS5FdmVudHMucmVnaXN0ZXIoOmNsaWNrKSBkbyB8ZXxcblx0XHRcdFx0IyBPbmx5IGZvciBtYWluIG1vdXNlYnV0dG9uLCBubz9cblx0XHRcdFx0aWYgKGU6dGltZVN0YW1wIC0gSW1iYS5Ub3VjaC5MYXN0VGltZXN0YW1wKSA+IEltYmEuVG91Y2guVGFwVGltZW91dFxuXHRcdFx0XHRcdGUuQGltYmFTaW11bGF0ZWRUYXAgPSB5ZXNcblx0XHRcdFx0XHR2YXIgdGFwID0gSW1iYS5FdmVudC5uZXcoZSlcblx0XHRcdFx0XHR0YXAudHlwZSA9ICd0YXAnXG5cdFx0XHRcdFx0dGFwLnByb2Nlc3Ncblx0XHRcdFx0XHRpZiB0YXAuQHJlc3BvbmRlclxuXHRcdFx0XHRcdFx0cmV0dXJuIGUucHJldmVudERlZmF1bHRcblx0XHRcdFx0IyBkZWxlZ2F0ZSB0aGUgcmVhbCBjbGljayBldmVudFxuXHRcdFx0XHRJbWJhLkV2ZW50cy5kZWxlZ2F0ZShlKVxuXG5cdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOm1vdXNlZG93bikgZG8gfGV8XG5cdFx0XHRcdGlmIChlOnRpbWVTdGFtcCAtIEltYmEuVG91Y2guTGFzdFRpbWVzdGFtcCkgPiBJbWJhLlRvdWNoLlRhcFRpbWVvdXRcblx0XHRcdFx0XHRJbWJhLlBPSU5URVIudXBkYXRlKGUpLnByb2Nlc3MgaWYgSW1iYS5QT0lOVEVSXG5cblx0XHRcdEltYmEuRXZlbnRzLmxpc3Rlbig6bW91c2V1cCkgZG8gfGV8XG5cdFx0XHRcdGlmIChlOnRpbWVTdGFtcCAtIEltYmEuVG91Y2guTGFzdFRpbWVzdGFtcCkgPiBJbWJhLlRvdWNoLlRhcFRpbWVvdXRcblx0XHRcdFx0XHRJbWJhLlBPSU5URVIudXBkYXRlKGUpLnByb2Nlc3MgaWYgSW1iYS5QT0lOVEVSXG5cblx0XHRcdEltYmEuRXZlbnRzLnJlZ2lzdGVyKFs6bW91c2Vkb3duLDptb3VzZXVwXSlcblx0XHRcdEltYmEuRXZlbnRzLmVuYWJsZWQgPSB5ZXNcblx0XHRcdHJldHVybiBJbWJhLkV2ZW50c1xuXG5cblx0ZGVmIGluaXRpYWxpemUgbm9kZSwgZXZlbnRzOiBbXVxuXHRcdEBzaGltRm9jdXNFdmVudHMgPSAkd2ViJCAmJiB3aW5kb3c6bmV0c2NhcGUgJiYgbm9kZTpvbmZvY3VzaW4gPT09IHVuZGVmaW5lZFxuXHRcdHJvb3QgPSBub2RlXG5cdFx0bGlzdGVuZXJzID0gW11cblx0XHRkZWxlZ2F0b3JzID0ge31cblx0XHRkZWxlZ2F0b3IgPSBkbyB8ZXwgXG5cdFx0XHRkZWxlZ2F0ZShlKVxuXHRcdFx0cmV0dXJuIHRydWVcblxuXHRcdGZvciBldmVudCBpbiBldmVudHNcblx0XHRcdHJlZ2lzdGVyKGV2ZW50KVxuXG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblxuXHRUZWxsIHRoZSBjdXJyZW50IEV2ZW50TWFuYWdlciB0byBpbnRlcmNlcHQgYW5kIGhhbmRsZSBldmVudCBvZiBhIGNlcnRhaW4gbmFtZS5cblx0QnkgZGVmYXVsdCwgSW1iYS5FdmVudHMgd2lsbCByZWdpc3RlciBpbnRlcmNlcHRvcnMgZm9yOiAqa2V5ZG93biosICprZXl1cCosIFxuXHQqa2V5cHJlc3MqLCAqdGV4dElucHV0KiwgKmlucHV0KiwgKmNoYW5nZSosICpzdWJtaXQqLCAqZm9jdXNpbiosICpmb2N1c291dCosIFxuXHQqYmx1ciosICpjb250ZXh0bWVudSosICpkYmxjbGljayosICptb3VzZXdoZWVsKiwgKndoZWVsKlxuXG5cdCMjI1xuXHRkZWYgcmVnaXN0ZXIgbmFtZSwgaGFuZGxlciA9IHRydWVcblx0XHRpZiBuYW1lIGlzYSBBcnJheVxuXHRcdFx0cmVnaXN0ZXIodixoYW5kbGVyKSBmb3IgdiBpbiBuYW1lXG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0cmV0dXJuIHNlbGYgaWYgZGVsZWdhdG9yc1tuYW1lXVxuXHRcdCMgY29uc29sZS5sb2coXCJyZWdpc3RlciBmb3IgZXZlbnQge25hbWV9XCIpXG5cdFx0dmFyIGZuID0gZGVsZWdhdG9yc1tuYW1lXSA9IGhhbmRsZXIgaXNhIEZ1bmN0aW9uID8gaGFuZGxlciA6IGRlbGVnYXRvclxuXHRcdHJvb3QuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLGZuLHllcykgaWYgZW5hYmxlZFxuXG5cdGRlZiBsaXN0ZW4gbmFtZSwgaGFuZGxlciwgY2FwdHVyZSA9IHllc1xuXHRcdGxpc3RlbmVycy5wdXNoKFtuYW1lLGhhbmRsZXIsY2FwdHVyZV0pXG5cdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKG5hbWUsaGFuZGxlcixjYXB0dXJlKSBpZiBlbmFibGVkXG5cdFx0c2VsZlxuXG5cdGRlZiBkZWxlZ2F0ZSBlXG5cdFx0dmFyIGV2ZW50ID0gSW1iYS5FdmVudC53cmFwKGUpXG5cdFx0ZXZlbnQucHJvY2Vzc1xuXHRcdGlmIEBzaGltRm9jdXNFdmVudHNcblx0XHRcdGlmIGU6dHlwZSA9PSAnZm9jdXMnXG5cdFx0XHRcdEltYmEuRXZlbnQud3JhcChlKS5zZXRUeXBlKCdmb2N1c2luJykucHJvY2Vzc1xuXHRcdFx0ZWxpZiBlOnR5cGUgPT0gJ2JsdXInXG5cdFx0XHRcdEltYmEuRXZlbnQud3JhcChlKS5zZXRUeXBlKCdmb2N1c291dCcpLnByb2Nlc3Ncblx0XHRzZWxmXG5cblx0IyMjXG5cblx0Q3JlYXRlIGEgbmV3IEltYmEuRXZlbnRcblxuXHQjIyNcblx0ZGVmIGNyZWF0ZSB0eXBlLCB0YXJnZXQsIGRhdGE6IG51bGwsIHNvdXJjZTogbnVsbFxuXHRcdHZhciBldmVudCA9IEltYmEuRXZlbnQud3JhcCB0eXBlOiB0eXBlLCB0YXJnZXQ6IHRhcmdldFxuXHRcdGV2ZW50LmRhdGEgPSBkYXRhIGlmIGRhdGFcblx0XHRldmVudC5zb3VyY2UgPSBzb3VyY2UgaWYgc291cmNlXG5cdFx0ZXZlbnRcblxuXHQjIyNcblxuXHRUcmlnZ2VyIC8gcHJvY2VzcyBhbiBJbWJhLkV2ZW50LlxuXG5cdCMjI1xuXHRkZWYgdHJpZ2dlclxuXHRcdGNyZWF0ZSgqYXJndW1lbnRzKS5wcm9jZXNzXG5cblx0ZGVmIG9uZW5hYmxlXG5cdFx0Zm9yIG93biBuYW1lLGhhbmRsZXIgb2YgZGVsZWdhdG9yc1xuXHRcdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKG5hbWUsaGFuZGxlcix5ZXMpXG5cblx0XHRmb3IgaXRlbSBpbiBsaXN0ZW5lcnNcblx0XHRcdHJvb3QuYWRkRXZlbnRMaXN0ZW5lcihpdGVtWzBdLGl0ZW1bMV0saXRlbVsyXSlcblx0XHRcdFxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJyxJbWJhOmNvbW1pdClcblx0XHRzZWxmXG5cblx0ZGVmIG9uZGlzYWJsZVxuXHRcdGZvciBvd24gbmFtZSxoYW5kbGVyIG9mIGRlbGVnYXRvcnNcblx0XHRcdHJvb3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLGhhbmRsZXIseWVzKVxuXG5cdFx0Zm9yIGl0ZW0gaW4gbGlzdGVuZXJzXG5cdFx0XHRyb290LnJlbW92ZUV2ZW50TGlzdGVuZXIoaXRlbVswXSxpdGVtWzFdLGl0ZW1bMl0pXG5cblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsSW1iYTpjb21taXQpXG5cdFx0c2VsZlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC1tYW5hZ2VyLmltYmEiLCJleHRlcm4gbmF2aWdhdG9yXG5cbnZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuZGVmIHJlbW92ZU5lc3RlZCByb290LCBub2RlLCBjYXJldFxuXHQjIGlmIG5vZGUvbm9kZXMgaXNhIFN0cmluZ1xuXHQjIFx0d2UgbmVlZCB0byB1c2UgdGhlIGNhcmV0IHRvIHJlbW92ZSBlbGVtZW50c1xuXHQjIFx0Zm9yIG5vdyB3ZSB3aWxsIHNpbXBseSBub3Qgc3VwcG9ydCB0aGlzXG5cdGlmIG5vZGUgaXNhIEFycmF5XG5cdFx0cmVtb3ZlTmVzdGVkKHJvb3QsbWVtYmVyLGNhcmV0KSBmb3IgbWVtYmVyIGluIG5vZGVcblx0ZWxpZiBub2RlIGFuZCBub2RlLkBkb21cblx0XHRyb290LnJlbW92ZUNoaWxkKG5vZGUpXG5cdGVsaWYgbm9kZSAhPSBudWxsXG5cdFx0IyB3aGF0IGlmIHRoaXMgaXMgbm90IG51bGw/IT8hP1xuXHRcdCMgdGFrZSBhIGNoYW5jZSBhbmQgcmVtb3ZlIGEgdGV4dC1lbGVtZW50bmdcblx0XHRsZXQgbmV4dCA9IGNhcmV0ID8gY2FyZXQ6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZFxuXHRcdGlmIG5leHQgaXNhIFRleHQgYW5kIG5leHQ6dGV4dENvbnRlbnQgPT0gbm9kZVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChuZXh0KVxuXHRcdGVsc2Vcblx0XHRcdHRocm93ICdjYW5ub3QgcmVtb3ZlIHN0cmluZydcblxuXHRyZXR1cm4gY2FyZXRcblxuZGVmIGFwcGVuZE5lc3RlZCByb290LCBub2RlXG5cdGlmIG5vZGUgaXNhIEFycmF5XG5cdFx0bGV0IGkgPSAwXG5cdFx0bGV0IGMgPSBub2RlOnRhZ2xlblxuXHRcdGxldCBrID0gYyAhPSBudWxsID8gKG5vZGU6ZG9tbGVuID0gYykgOiBub2RlOmxlbmd0aFxuXHRcdGFwcGVuZE5lc3RlZChyb290LG5vZGVbaSsrXSkgd2hpbGUgaSA8IGtcblx0ZWxpZiBub2RlIGFuZCBub2RlLkBkb21cblx0XHRyb290LmFwcGVuZENoaWxkKG5vZGUpXG5cdGVsaWYgbm9kZSAhPSBudWxsIGFuZCBub2RlICE9PSBmYWxzZVxuXHRcdHJvb3QuYXBwZW5kQ2hpbGQgSW1iYS5jcmVhdGVUZXh0Tm9kZShub2RlKVxuXG5cdHJldHVyblxuXG5cbiMgaW5zZXJ0IG5vZGVzIGJlZm9yZSBhIGNlcnRhaW4gbm9kZVxuIyBkb2VzIG5vdCBuZWVkIHRvIHJldHVybiBhbnkgdGFpbCwgYXMgYmVmb3JlXG4jIHdpbGwgc3RpbGwgYmUgY29ycmVjdCB0aGVyZVxuIyBiZWZvcmUgbXVzdCBiZSBhbiBhY3R1YWwgZG9tbm9kZVxuZGVmIGluc2VydE5lc3RlZEJlZm9yZSByb290LCBub2RlLCBiZWZvcmVcblx0aWYgbm9kZSBpc2EgQXJyYXlcblx0XHRsZXQgaSA9IDBcblx0XHRsZXQgYyA9IG5vZGU6dGFnbGVuXG5cdFx0bGV0IGsgPSBjICE9IG51bGwgPyAobm9kZTpkb21sZW4gPSBjKSA6IG5vZGU6bGVuZ3RoXG5cdFx0aW5zZXJ0TmVzdGVkQmVmb3JlKHJvb3Qsbm9kZVtpKytdLGJlZm9yZSkgd2hpbGUgaSA8IGtcblxuXHRlbGlmIG5vZGUgYW5kIG5vZGUuQGRvbVxuXHRcdHJvb3QuaW5zZXJ0QmVmb3JlKG5vZGUsYmVmb3JlKVxuXHRlbGlmIG5vZGUgIT0gbnVsbCBhbmQgbm9kZSAhPT0gZmFsc2Vcblx0XHRyb290Lmluc2VydEJlZm9yZShJbWJhLmNyZWF0ZVRleHROb2RlKG5vZGUpLGJlZm9yZSlcblxuXHRyZXR1cm4gYmVmb3JlXG5cbiMgYWZ0ZXIgbXVzdCBiZSBhbiBhY3R1YWwgZG9tbm9kZVxuZGVmIGluc2VydE5lc3RlZEFmdGVyIHJvb3QsIG5vZGUsIGFmdGVyXG5cdHZhciBiZWZvcmUgPSBhZnRlciA/IGFmdGVyOm5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblxuXHRpZiBiZWZvcmVcblx0XHRpbnNlcnROZXN0ZWRCZWZvcmUocm9vdCxub2RlLGJlZm9yZSlcblx0XHRyZXR1cm4gYmVmb3JlOnByZXZpb3VzU2libGluZ1xuXHRlbHNlXG5cdFx0YXBwZW5kTmVzdGVkKHJvb3Qsbm9kZSlcblx0XHRyZXR1cm4gcm9vdC5AZG9tOmxhc3RDaGlsZFxuXG5kZWYgcmVjb25jaWxlQ29sbGVjdGlvbkNoYW5nZXMgcm9vdCwgbmV3LCBvbGQsIGNhcmV0XG5cblx0dmFyIG5ld0xlbiA9IG5ldzpsZW5ndGhcblx0dmFyIGxhc3ROZXcgPSBuZXdbbmV3TGVuIC0gMV1cblxuXHQjIFRoaXMgcmUtb3JkZXIgYWxnb3JpdGhtIGlzIGJhc2VkIG9uIHRoZSBmb2xsb3dpbmcgcHJpbmNpcGxlOlxuXHQjIFxuXHQjIFdlIGJ1aWxkIGEgXCJjaGFpblwiIHdoaWNoIHNob3dzIHdoaWNoIGl0ZW1zIGFyZSBhbHJlYWR5IHNvcnRlZC5cblx0IyBJZiB3ZSdyZSBnb2luZyBmcm9tIFsxLCAyLCAzXSAtPiBbMiwgMSwgM10sIHRoZSB0cmVlIGxvb2tzIGxpa2U6XG5cdCNcblx0IyBcdDMgLT4gIDAgKGlkeClcblx0IyBcdDIgLT4gLTEgKGlkeClcblx0IyBcdDEgLT4gLTEgKGlkeClcblx0I1xuXHQjIFRoaXMgdGVsbHMgdXMgdGhhdCB3ZSBoYXZlIHR3byBjaGFpbnMgb2Ygb3JkZXJlZCBpdGVtczpcblx0IyBcblx0IyBcdCgxLCAzKSBhbmQgKDIpXG5cdCMgXG5cdCMgVGhlIG9wdGltYWwgcmUtb3JkZXJpbmcgdGhlbiBiZWNvbWVzIHRvIGtlZXAgdGhlIGxvbmdlc3QgY2hhaW4gaW50YWN0LFxuXHQjIGFuZCBtb3ZlIGFsbCB0aGUgb3RoZXIgaXRlbXMuXG5cblx0dmFyIG5ld1Bvc2l0aW9uID0gW11cblxuXHQjIFRoZSB0cmVlL2dyYXBoIGl0c2VsZlxuXHR2YXIgcHJldkNoYWluID0gW11cblx0IyBUaGUgbGVuZ3RoIG9mIHRoZSBjaGFpblxuXHR2YXIgbGVuZ3RoQ2hhaW4gPSBbXVxuXG5cdCMgS2VlcCB0cmFjayBvZiB0aGUgbG9uZ2VzdCBjaGFpblxuXHR2YXIgbWF4Q2hhaW5MZW5ndGggPSAwXG5cdHZhciBtYXhDaGFpbkVuZCA9IDBcblxuXHR2YXIgaGFzVGV4dE5vZGVzID0gbm9cblx0dmFyIG5ld1Bvc1xuXG5cdGZvciBub2RlLCBpZHggaW4gb2xkXG5cdFx0IyBzcGVjaWFsIGNhc2UgZm9yIFRleHQgbm9kZXNcblx0XHRpZiBub2RlIGFuZCBub2RlOm5vZGVUeXBlID09IDNcblx0XHRcdG5ld1BvcyA9IG5ldy5pbmRleE9mKG5vZGU6dGV4dENvbnRlbnQpXG5cdFx0XHRuZXdbbmV3UG9zXSA9IG5vZGUgaWYgbmV3UG9zID49IDBcblx0XHRcdGhhc1RleHROb2RlcyA9IHllc1xuXHRcdGVsc2Vcblx0XHRcdG5ld1BvcyA9IG5ldy5pbmRleE9mKG5vZGUpXG5cblx0XHRuZXdQb3NpdGlvbi5wdXNoKG5ld1BvcylcblxuXHRcdGlmIG5ld1BvcyA9PSAtMVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChub2RlKVxuXHRcdFx0cHJldkNoYWluLnB1c2goLTEpXG5cdFx0XHRsZW5ndGhDaGFpbi5wdXNoKC0xKVxuXHRcdFx0Y29udGludWVcblxuXHRcdHZhciBwcmV2SWR4ID0gbmV3UG9zaXRpb246bGVuZ3RoIC0gMlxuXG5cdFx0IyBCdWlsZCB0aGUgY2hhaW46XG5cdFx0d2hpbGUgcHJldklkeCA+PSAwXG5cdFx0XHRpZiBuZXdQb3NpdGlvbltwcmV2SWR4XSA9PSAtMVxuXHRcdFx0XHRwcmV2SWR4LS1cblx0XHRcdGVsaWYgbmV3UG9zID4gbmV3UG9zaXRpb25bcHJldklkeF1cblx0XHRcdFx0IyBZYXksIHdlJ3JlIGJpZ2dlciB0aGFuIHRoZSBwcmV2aW91cyFcblx0XHRcdFx0YnJlYWtcblx0XHRcdGVsc2Vcblx0XHRcdFx0IyBOb3BlLCBsZXQncyB3YWxrIGJhY2sgdGhlIGNoYWluXG5cdFx0XHRcdHByZXZJZHggPSBwcmV2Q2hhaW5bcHJldklkeF1cblxuXHRcdHByZXZDaGFpbi5wdXNoKHByZXZJZHgpXG5cblx0XHR2YXIgY3Vyckxlbmd0aCA9IChwcmV2SWR4ID09IC0xKSA/IDAgOiBsZW5ndGhDaGFpbltwcmV2SWR4XSsxXG5cblx0XHRpZiBjdXJyTGVuZ3RoID4gbWF4Q2hhaW5MZW5ndGhcblx0XHRcdG1heENoYWluTGVuZ3RoID0gY3Vyckxlbmd0aFxuXHRcdFx0bWF4Q2hhaW5FbmQgPSBpZHhcblxuXHRcdGxlbmd0aENoYWluLnB1c2goY3Vyckxlbmd0aClcblxuXHR2YXIgc3RpY2t5Tm9kZXMgPSBbXVxuXG5cdCMgTm93IHdlIGNhbiB3YWxrIHRoZSBsb25nZXN0IGNoYWluIGJhY2t3YXJkcyBhbmQgbWFyayB0aGVtIGFzIFwic3RpY2t5XCIsXG5cdCMgd2hpY2ggaW1wbGllcyB0aGF0IHRoZXkgc2hvdWxkIG5vdCBiZSBtb3ZlZFxuXHR2YXIgY3Vyc29yID0gbmV3UG9zaXRpb246bGVuZ3RoIC0gMVxuXHR3aGlsZSBjdXJzb3IgPj0gMFxuXHRcdGlmIGN1cnNvciA9PSBtYXhDaGFpbkVuZCBhbmQgbmV3UG9zaXRpb25bY3Vyc29yXSAhPSAtMVxuXHRcdFx0c3RpY2t5Tm9kZXNbbmV3UG9zaXRpb25bY3Vyc29yXV0gPSB0cnVlXG5cdFx0XHRtYXhDaGFpbkVuZCA9IHByZXZDaGFpblttYXhDaGFpbkVuZF1cblxuXHRcdGN1cnNvciAtPSAxXG5cblx0IyBwb3NzaWJsZSB0byBkbyB0aGlzIGluIHJldmVyc2VkIG9yZGVyIGluc3RlYWQ/XG5cdGZvciBub2RlLCBpZHggaW4gbmV3XG5cdFx0aWYgIXN0aWNreU5vZGVzW2lkeF1cblx0XHRcdCMgY3JlYXRlIHRleHRub2RlIGZvciBzdHJpbmcsIGFuZCB1cGRhdGUgdGhlIGFycmF5XG5cdFx0XHR1bmxlc3Mgbm9kZSBhbmQgbm9kZS5AZG9tXG5cdFx0XHRcdG5vZGUgPSBuZXdbaWR4XSA9IEltYmEuY3JlYXRlVGV4dE5vZGUobm9kZSlcblxuXHRcdFx0dmFyIGFmdGVyID0gbmV3W2lkeCAtIDFdXG5cdFx0XHRpbnNlcnROZXN0ZWRBZnRlcihyb290LCBub2RlLCAoYWZ0ZXIgYW5kIGFmdGVyLkBkb20gb3IgYWZ0ZXIgb3IgY2FyZXQpKVxuXG5cdFx0Y2FyZXQgPSBub2RlLkBkb20gb3IgKGNhcmV0IGFuZCBjYXJldDpuZXh0U2libGluZyBvciByb290LkBkb206Zmlyc3RDaGlsZClcblxuXHQjIHNob3VsZCB0cnVzdCB0aGF0IHRoZSBsYXN0IGl0ZW0gaW4gbmV3IGxpc3QgaXMgdGhlIGNhcmV0XG5cdHJldHVybiBsYXN0TmV3IGFuZCBsYXN0TmV3LkBkb20gb3IgY2FyZXRcblxuXG4jIGV4cGVjdHMgYSBmbGF0IG5vbi1zcGFyc2UgYXJyYXkgb2Ygbm9kZXMgaW4gYm90aCBuZXcgYW5kIG9sZCwgYWx3YXlzXG5kZWYgcmVjb25jaWxlQ29sbGVjdGlvbiByb290LCBuZXcsIG9sZCwgY2FyZXRcblx0dmFyIGsgPSBuZXc6bGVuZ3RoXG5cdHZhciBpID0ga1xuXHR2YXIgbGFzdCA9IG5ld1trIC0gMV1cblxuXG5cdGlmIGsgPT0gb2xkOmxlbmd0aCBhbmQgbmV3WzBdID09PSBvbGRbMF1cblx0XHQjIHJ1bm5pbmcgdGhyb3VnaCB0byBjb21wYXJlXG5cdFx0d2hpbGUgaS0tXG5cdFx0XHRicmVhayBpZiBuZXdbaV0gIT09IG9sZFtpXVxuXG5cdGlmIGkgPT0gLTFcblx0XHRyZXR1cm4gbGFzdCBhbmQgbGFzdC5AZG9tIG9yIGxhc3Qgb3IgY2FyZXRcblx0ZWxzZVxuXHRcdHJldHVybiByZWNvbmNpbGVDb2xsZWN0aW9uQ2hhbmdlcyhyb290LG5ldyxvbGQsY2FyZXQpXG5cbiMgVFlQRSA1IC0gd2Uga25vdyB0aGF0IHdlIGFyZSBkZWFsaW5nIHdpdGggYSBzaW5nbGUgYXJyYXkgb2ZcbiMga2V5ZWQgdGFncyAtIGFuZCByb290IGhhcyBubyBvdGhlciBjaGlsZHJlblxuZGVmIHJlY29uY2lsZUxvb3Agcm9vdCwgbmV3LCBvbGQsIGNhcmV0XG5cdHZhciBubCA9IG5ldzpsZW5ndGhcblx0dmFyIG9sID0gb2xkOmxlbmd0aFxuXHR2YXIgY2wgPSBuZXc6Y2FjaGU6aSQgIyBjYWNoZS1sZW5ndGhcblx0dmFyIGkgPSAwLCBkID0gbmwgLSBvbFxuXG5cdCMgZmluZCB0aGUgZmlyc3QgaW5kZXggdGhhdCBpcyBkaWZmZXJlbnRcblx0aSsrIHdoaWxlIGkgPCBvbCBhbmQgaSA8IG5sIGFuZCBuZXdbaV0gPT09IG9sZFtpXVxuXHRcblx0IyBjb25kaXRpb25hbGx5IHBydW5lIGNhY2hlXG5cdGlmIGNsID4gMTAwMCBhbmQgKGNsIC0gbmwpID4gNTAwXG5cdFx0bmV3OmNhY2hlOiRwcnVuZShuZXcpXG5cdFxuXHRpZiBkID4gMCBhbmQgaSA9PSBvbFxuXHRcdCMgYWRkZWQgYXQgZW5kXG5cdFx0cm9vdC5hcHBlbmRDaGlsZChuZXdbaSsrXSkgd2hpbGUgaSA8IG5sXG5cdFx0cmV0dXJuXG5cdFxuXHRlbGlmIGQgPiAwXG5cdFx0bGV0IGkxID0gbmxcblx0XHRpMS0tIHdoaWxlIGkxID4gaSBhbmQgbmV3W2kxIC0gMV0gPT09IG9sZFtpMSAtIDEgLSBkXVxuXG5cdFx0aWYgZCA9PSAoaTEgLSBpKVxuXHRcdFx0IyBjb25zb2xlLmxvZyBcImFkZGVkIGluIGNodW5rXCIsaSxpMVxuXHRcdFx0bGV0IGJlZm9yZSA9IG9sZFtpXS5AZG9tXG5cdFx0XHRyb290Lmluc2VydEJlZm9yZShuZXdbaSsrXSxiZWZvcmUpIHdoaWxlIGkgPCBpMVxuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0ZWxpZiBkIDwgMCBhbmQgaSA9PSBubFxuXHRcdCMgcmVtb3ZlZCBhdCBlbmRcblx0XHRyb290LnJlbW92ZUNoaWxkKG9sZFtpKytdKSB3aGlsZSBpIDwgb2xcblx0XHRyZXR1cm5cblx0ZWxpZiBkIDwgMFxuXHRcdGxldCBpMSA9IG9sXG5cdFx0aTEtLSB3aGlsZSBpMSA+IGkgYW5kIG5ld1tpMSAtIDEgKyBkXSA9PT0gb2xkW2kxIC0gMV1cblxuXHRcdGlmIGQgPT0gKGkgLSBpMSlcblx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQob2xkW2krK10pIHdoaWxlIGkgPCBpMVxuXHRcdFx0cmV0dXJuXG5cblx0ZWxpZiBpID09IG5sXG5cdFx0cmV0dXJuXG5cblx0cmV0dXJuIHJlY29uY2lsZUNvbGxlY3Rpb25DaGFuZ2VzKHJvb3QsbmV3LG9sZCxjYXJldClcblxuIyBleHBlY3RzIGEgZmxhdCBub24tc3BhcnNlIGFycmF5IG9mIG5vZGVzIGluIGJvdGggbmV3IGFuZCBvbGQsIGFsd2F5c1xuZGVmIHJlY29uY2lsZUluZGV4ZWRBcnJheSByb290LCBhcnJheSwgb2xkLCBjYXJldFxuXHR2YXIgbmV3TGVuID0gYXJyYXk6dGFnbGVuXG5cdHZhciBwcmV2TGVuID0gYXJyYXk6ZG9tbGVuIG9yIDBcblx0dmFyIGxhc3QgPSBuZXdMZW4gPyBhcnJheVtuZXdMZW4gLSAxXSA6IG51bGxcblx0IyBjb25zb2xlLmxvZyBcInJlY29uY2lsZSBvcHRpbWl6ZWQgYXJyYXkoISlcIixjYXJldCxuZXdMZW4scHJldkxlbixhcnJheVxuXG5cdGlmIHByZXZMZW4gPiBuZXdMZW5cblx0XHR3aGlsZSBwcmV2TGVuID4gbmV3TGVuXG5cdFx0XHR2YXIgaXRlbSA9IGFycmF5Wy0tcHJldkxlbl1cblx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQoaXRlbS5AZG9tKVxuXG5cdGVsaWYgbmV3TGVuID4gcHJldkxlblxuXHRcdCMgZmluZCB0aGUgaXRlbSB0byBpbnNlcnQgYmVmb3JlXG5cdFx0bGV0IHByZXZMYXN0ID0gcHJldkxlbiA/IGFycmF5W3ByZXZMZW4gLSAxXS5AZG9tIDogY2FyZXRcblx0XHRsZXQgYmVmb3JlID0gcHJldkxhc3QgPyBwcmV2TGFzdDpuZXh0U2libGluZyA6IHJvb3QuQGRvbTpmaXJzdENoaWxkXG5cdFx0XG5cdFx0d2hpbGUgcHJldkxlbiA8IG5ld0xlblxuXHRcdFx0bGV0IG5vZGUgPSBhcnJheVtwcmV2TGVuKytdXG5cdFx0XHRiZWZvcmUgPyByb290Lmluc2VydEJlZm9yZShub2RlLkBkb20sYmVmb3JlKSA6IHJvb3QuYXBwZW5kQ2hpbGQobm9kZS5AZG9tKVxuXHRcdFx0XG5cdGFycmF5OmRvbWxlbiA9IG5ld0xlblxuXHRyZXR1cm4gbGFzdCA/IGxhc3QuQGRvbSA6IGNhcmV0XG5cblxuIyB0aGUgZ2VuZXJhbCByZWNvbmNpbGVyIHRoYXQgcmVzcGVjdHMgY29uZGl0aW9ucyBldGNcbiMgY2FyZXQgaXMgdGhlIGN1cnJlbnQgbm9kZSB3ZSB3YW50IHRvIGluc2VydCB0aGluZ3MgYWZ0ZXJcbmRlZiByZWNvbmNpbGVOZXN0ZWQgcm9vdCwgbmV3LCBvbGQsIGNhcmV0XG5cblx0IyB2YXIgc2tpcG5ldyA9IG5ldyA9PSBudWxsIG9yIG5ldyA9PT0gZmFsc2Ugb3IgbmV3ID09PSB0cnVlXG5cdHZhciBuZXdJc051bGwgPSBuZXcgPT0gbnVsbCBvciBuZXcgPT09IGZhbHNlXG5cdHZhciBvbGRJc051bGwgPSBvbGQgPT0gbnVsbCBvciBvbGQgPT09IGZhbHNlXG5cblxuXHRpZiBuZXcgPT09IG9sZFxuXHRcdCMgcmVtZW1iZXIgdGhhdCB0aGUgY2FyZXQgbXVzdCBiZSBhbiBhY3R1YWwgZG9tIGVsZW1lbnRcblx0XHQjIHdlIHNob3VsZCBpbnN0ZWFkIG1vdmUgdGhlIGFjdHVhbCBjYXJldD8gLSB0cnVzdFxuXHRcdGlmIG5ld0lzTnVsbFxuXHRcdFx0cmV0dXJuIGNhcmV0XG5cdFx0ZWxpZiBuZXcuQGRvbVxuXHRcdFx0cmV0dXJuIG5ldy5AZG9tXG5cdFx0ZWxpZiBuZXcgaXNhIEFycmF5IGFuZCBuZXc6dGFnbGVuICE9IG51bGxcblx0XHRcdHJldHVybiByZWNvbmNpbGVJbmRleGVkQXJyYXkocm9vdCxuZXcsb2xkLGNhcmV0KVxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBjYXJldCA/IGNhcmV0Om5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblxuXHRlbGlmIG5ldyBpc2EgQXJyYXlcblx0XHRpZiBvbGQgaXNhIEFycmF5XG5cdFx0XHQjIGxvb2sgZm9yIHNsb3QgaW5zdGVhZD9cblx0XHRcdGxldCB0eXAgPSBuZXc6c3RhdGljXG5cdFx0XHRpZiB0eXAgb3Igb2xkOnN0YXRpY1xuXHRcdFx0XHQjIGlmIHRoZSBzdGF0aWMgaXMgbm90IG5lc3RlZCAtIHdlIGNvdWxkIGdldCBhIGhpbnQgZnJvbSBjb21waWxlclxuXHRcdFx0XHQjIGFuZCBqdXN0IHNraXAgaXRcblx0XHRcdFx0aWYgdHlwID09IG9sZDpzdGF0aWMgIyBzaG91bGQgYWxzbyBpbmNsdWRlIGEgcmVmZXJlbmNlP1xuXHRcdFx0XHRcdGZvciBpdGVtLGkgaW4gbmV3XG5cdFx0XHRcdFx0XHQjIHRoaXMgaXMgd2hlcmUgd2UgY291bGQgZG8gdGhlIHRyaXBsZSBlcXVhbCBkaXJlY3RseVxuXHRcdFx0XHRcdFx0Y2FyZXQgPSByZWNvbmNpbGVOZXN0ZWQocm9vdCxpdGVtLG9sZFtpXSxjYXJldClcblx0XHRcdFx0XHRyZXR1cm4gY2FyZXRcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHJlbW92ZU5lc3RlZChyb290LG9sZCxjYXJldClcblx0XHRcdFx0XHRcblx0XHRcdFx0IyBpZiB0aGV5IGFyZSBub3QgdGhlIHNhbWUgd2UgY29udGludWUgdGhyb3VnaCB0byB0aGUgZGVmYXVsdFxuXHRcdFx0ZWxzZVxuXHRcdFx0XHQjIENvdWxkIHVzZSBvcHRpbWl6ZWQgbG9vcCBpZiB3ZSBrbm93IHRoYXQgaXQgb25seSBjb25zaXN0cyBvZiBub2Rlc1xuXHRcdFx0XHRyZXR1cm4gcmVjb25jaWxlQ29sbGVjdGlvbihyb290LG5ldyxvbGQsY2FyZXQpXG5cdFx0ZWxpZiAhb2xkSXNOdWxsXG5cdFx0XHRpZiBvbGQuQGRvbVxuXHRcdFx0XHRyb290LnJlbW92ZUNoaWxkKG9sZClcblx0XHRcdGVsc2Vcblx0XHRcdFx0IyBvbGQgd2FzIGEgc3RyaW5nLWxpa2Ugb2JqZWN0P1xuXHRcdFx0XHRyb290LnJlbW92ZUNoaWxkKGNhcmV0ID8gY2FyZXQ6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZClcblxuXHRcdHJldHVybiBpbnNlcnROZXN0ZWRBZnRlcihyb290LG5ldyxjYXJldClcblx0XHQjIHJlbW92ZSBvbGRcblxuXHRlbGlmICFuZXdJc051bGwgYW5kIG5ldy5AZG9tXG5cdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KSB1bmxlc3Mgb2xkSXNOdWxsXG5cdFx0cmV0dXJuIGluc2VydE5lc3RlZEFmdGVyKHJvb3QsbmV3LGNhcmV0KVxuXG5cdGVsaWYgbmV3SXNOdWxsXG5cdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KSB1bmxlc3Mgb2xkSXNOdWxsXG5cdFx0cmV0dXJuIGNhcmV0XG5cdGVsc2Vcblx0XHQjIGlmIG9sZCBkaWQgbm90IGV4aXN0IHdlIG5lZWQgdG8gYWRkIGEgbmV3IGRpcmVjdGx5XG5cdFx0bGV0IG5leHROb2RlXG5cdFx0IyBpZiBvbGQgd2FzIGFycmF5IG9yIGltYmF0YWcgd2UgbmVlZCB0byByZW1vdmUgaXQgYW5kIHRoZW4gYWRkXG5cdFx0aWYgb2xkIGlzYSBBcnJheVxuXHRcdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KVxuXHRcdGVsaWYgb2xkIGFuZCBvbGQuQGRvbVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChvbGQpXG5cdFx0ZWxpZiAhb2xkSXNOdWxsXG5cdFx0XHQjIC4uLlxuXHRcdFx0bmV4dE5vZGUgPSBjYXJldCA/IGNhcmV0Om5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblx0XHRcdGlmIG5leHROb2RlIGlzYSBUZXh0IGFuZCBuZXh0Tm9kZTp0ZXh0Q29udGVudCAhPSBuZXdcblx0XHRcdFx0bmV4dE5vZGU6dGV4dENvbnRlbnQgPSBuZXdcblx0XHRcdFx0cmV0dXJuIG5leHROb2RlXG5cblx0XHQjIG5vdyBhZGQgdGhlIHRleHRub2RlXG5cdFx0cmV0dXJuIGluc2VydE5lc3RlZEFmdGVyKHJvb3QsbmV3LGNhcmV0KVxuXG5cbmV4dGVuZCB0YWcgZWxlbWVudFxuXHRcblx0IyAxIC0gc3RhdGljIHNoYXBlIC0gdW5rbm93biBjb250ZW50XG5cdCMgMiAtIHN0YXRpYyBzaGFwZSBhbmQgc3RhdGljIGNoaWxkcmVuXG5cdCMgMyAtIHNpbmdsZSBpdGVtXG5cdCMgNCAtIG9wdGltaXplZCBhcnJheSAtIG9ubHkgbGVuZ3RoIHdpbGwgY2hhbmdlXG5cdCMgNSAtIG9wdGltaXplZCBjb2xsZWN0aW9uXG5cdCMgNiAtIHRleHQgb25seVxuXG5cdGRlZiBzZXRDaGlsZHJlbiBuZXcsIHR5cFxuXHRcdCMgaWYgdHlwZW9mIG5ldyA9PSAnc3RyaW5nJ1xuXHRcdCMgXHRyZXR1cm4gc2VsZi50ZXh0ID0gbmV3XG5cdFx0dmFyIG9sZCA9IEB0cmVlX1xuXG5cdFx0aWYgbmV3ID09PSBvbGQgYW5kIG5ldyBhbmQgbmV3OnRhZ2xlbiA9PSB1bmRlZmluZWRcblx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRpZiAhb2xkIGFuZCB0eXAgIT0gM1xuXHRcdFx0cmVtb3ZlQWxsQ2hpbGRyZW5cblx0XHRcdGFwcGVuZE5lc3RlZChzZWxmLG5ldylcblxuXHRcdGVsaWYgdHlwID09IDFcblx0XHRcdGxldCBjYXJldCA9IG51bGxcblx0XHRcdGZvciBpdGVtLGkgaW4gbmV3XG5cdFx0XHRcdGNhcmV0ID0gcmVjb25jaWxlTmVzdGVkKHNlbGYsaXRlbSxvbGRbaV0sY2FyZXQpXG5cdFx0XG5cdFx0ZWxpZiB0eXAgPT0gMlxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdGVsaWYgdHlwID09IDNcblx0XHRcdGxldCBudHlwID0gdHlwZW9mIG5ld1xuXG5cdFx0XHRpZiBuZXcgYW5kIG5ldy5AZG9tXG5cdFx0XHRcdHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0XHRcdGFwcGVuZENoaWxkKG5ldylcblxuXHRcdFx0IyBjaGVjayBpZiBvbGQgYW5kIG5ldyBpc2EgYXJyYXlcblx0XHRcdGVsaWYgbmV3IGlzYSBBcnJheVxuXHRcdFx0XHRpZiBuZXcuQHR5cGUgPT0gNSBhbmQgb2xkIGFuZCBvbGQuQHR5cGUgPT0gNVxuXHRcdFx0XHRcdHJlY29uY2lsZUxvb3Aoc2VsZixuZXcsb2xkLG51bGwpXG5cdFx0XHRcdGVsaWYgb2xkIGlzYSBBcnJheVxuXHRcdFx0XHRcdHJlY29uY2lsZU5lc3RlZChzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0XHRcdFx0YXBwZW5kTmVzdGVkKHNlbGYsbmV3KVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHR0ZXh0ID0gbmV3XG5cdFx0XHRcdHJldHVybiBzZWxmXG5cdFx0XHRcdFxuXHRcdGVsaWYgdHlwID09IDRcblx0XHRcdHJlY29uY2lsZUluZGV4ZWRBcnJheShzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRcdFxuXHRcdGVsaWYgdHlwID09IDVcblx0XHRcdHJlY29uY2lsZUxvb3Aoc2VsZixuZXcsb2xkLG51bGwpXG5cblx0XHRlbGlmIG5ldyBpc2EgQXJyYXkgYW5kIG9sZCBpc2EgQXJyYXlcblx0XHRcdHJlY29uY2lsZU5lc3RlZChzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRlbHNlXG5cdFx0XHQjIHdoYXQgaWYgdGV4dD9cblx0XHRcdHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0XHRhcHBlbmROZXN0ZWQoc2VsZixuZXcpXG5cblx0XHRAdHJlZV8gPSBuZXdcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBjb250ZW50XG5cdFx0QGNvbnRlbnQgb3IgY2hpbGRyZW4udG9BcnJheVxuXHRcblx0ZGVmIHNldFRleHQgdGV4dFxuXHRcdGlmIHRleHQgIT0gQHRyZWVfXG5cdFx0XHR2YXIgdmFsID0gdGV4dCA9PT0gbnVsbCBvciB0ZXh0ID09PSBmYWxzZSA/ICcnIDogdGV4dFxuXHRcdFx0KEB0ZXh0XyBvciBAZG9tKTp0ZXh0Q29udGVudCA9IHZhbFxuXHRcdFx0QHRleHRfIHx8PSBAZG9tOmZpcnN0Q2hpbGRcblx0XHRcdEB0cmVlXyA9IHRleHRcblx0XHRzZWxmXG5cbiMgYWxpYXMgc2V0Q29udGVudCB0byBzZXRDaGlsZHJlblxudmFyIHByb3RvID0gSW1iYS5UYWc6cHJvdG90eXBlXG5wcm90bzpzZXRDb250ZW50ID0gcHJvdG86c2V0Q2hpbGRyZW5cblxuIyBvcHRpbWl6YXRpb24gZm9yIHNldFRleHRcbnZhciBhcHBsZSA9IHR5cGVvZiBuYXZpZ2F0b3IgIT0gJ3VuZGVmaW5lZCcgYW5kIChuYXZpZ2F0b3I6dmVuZG9yIG9yICcnKS5pbmRleE9mKCdBcHBsZScpID09IDBcbmlmIGFwcGxlXG5cdGRlZiBwcm90by5zZXRUZXh0IHRleHRcblx0XHRpZiB0ZXh0ICE9IEB0cmVlX1xuXHRcdFx0QGRvbTp0ZXh0Q29udGVudCA9ICh0ZXh0ID09PSBudWxsIG9yIHRleHQgPT09IGZhbHNlID8gJycgOiB0ZXh0KVxuXHRcdFx0QHRyZWVfID0gdGV4dFxuXHRcdHJldHVybiBzZWxmXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vcmVjb25jaWxlci5pbWJhIiwiaW1wb3J0IFJvdXRlciBmcm9tICcuL3V0aWwvcm91dGVyJ1xuXG5leHBvcnQgY2xhc3MgRG9jXG5cblx0cHJvcCBwYXRoXG5cdHByb3Agc3JjXG5cdHByb3AgZGF0YVxuXG5cdGRlZiByZWFkeVxuXHRcdEByZWFkeVxuXG5cdGRlZiBpbml0aWFsaXplIHNyYywgYXBwXG5cdFx0QHNyYyA9IHNyY1xuXHRcdEBwYXRoID0gc3JjLnJlcGxhY2UoL1xcLm1kJC8sJycpXG5cdFx0QGFwcCA9IGFwcFxuXHRcdEByZWFkeSA9IG5vXG5cdFx0ZmV0Y2hcblx0XHRzZWxmXG5cblx0ZGVmIGZldGNoXG5cdFx0QHByb21pc2UgfHw9IEBhcHAuZmV0Y2goc3JjKS50aGVuIGRvIHxyZXN8XG5cdFx0XHRsb2FkKHJlcylcblxuXHRkZWYgbG9hZCBkb2Ncblx0XHRAZGF0YSA9IGRvY1xuXHRcdEBtZXRhID0gZG9jOm1ldGEgb3Ige31cblx0XHRAcmVhZHkgPSB5ZXNcblx0XHRJbWJhLmNvbW1pdFxuXHRcdHNlbGZcblxuXHRkZWYgdGl0bGVcblx0XHRAZGF0YTp0aXRsZSBvciAncGF0aCdcblxuXHRkZWYgdG9jXG5cdFx0QGRhdGEgYW5kIEBkYXRhOnRvY1swXVxuXG5cdGRlZiBib2R5XG5cdFx0QGRhdGEgYW5kIEBkYXRhOmJvZHlcblxuXG5leHBvcnQgdmFyIENhY2hlID0ge31cbnZhciByZXF1ZXN0cyA9IHt9XG5cbmV4cG9ydCBjbGFzcyBBcHBcblx0cHJvcCByZXFcblx0cHJvcCBjYWNoZVxuXHRwcm9wIGlzc3Vlc1xuXHRcblx0ZGVmIHNlbGYuZGVzZXJpYWxpemUgZGF0YSA9ICd7fSdcblx0XHRzZWxmLm5ldyBKU09OLnBhcnNlKGRhdGEucmVwbGFjZSgvwqfCp1NDUklQVMKnwqcvZyxcInNjcmlwdFwiKSlcblxuXHRkZWYgaW5pdGlhbGl6ZSBjYWNoZSA9IHt9XG5cdFx0QGNhY2hlID0gY2FjaGVcblx0XHRAZG9jcyA9IHt9XG5cdFx0aWYgJHdlYiRcblx0XHRcdEBsb2MgPSBkb2N1bWVudDpsb2NhdGlvblxuXHRcdHNlbGZcblxuXHRkZWYgcmVzZXRcblx0XHRjYWNoZSA9IHt9XG5cdFx0c2VsZlxuXG5cdGRlZiByb3V0ZXJcblx0XHRAcm91dGVyIHx8PSBSb3V0ZXIubmV3KHNlbGYpXG5cblx0ZGVmIHBhdGhcblx0XHQkd2ViJCA/IEBsb2M6cGF0aG5hbWUgOiByZXE6cGF0aFxuXG5cdGRlZiBoYXNoXG5cdFx0JHdlYiQgPyBAbG9jOmhhc2guc3Vic3RyKDEpIDogJydcblxuXHRkZWYgZG9jIHNyY1xuXHRcdEBkb2NzW3NyY10gfHw9IERvYy5uZXcoc3JjLHNlbGYpXG5cdFx0XG5cdGRlZiBzZXJpYWxpemVcblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoY2FjaGUpLnJlcGxhY2UoL1xcYnNjcmlwdC9nLFwiwqfCp1NDUklQVMKnwqdcIilcblxuXHRpZiAkbm9kZSRcblx0XHRkZWYgZmV0Y2ggc3JjXG5cdFx0XHRsZXQgcmVzID0gY2FjaGVbc3JjXSA9IENhY2hlW3NyY11cblx0XHRcdGxldCBwcm9taXNlID0ge3RoZW46ICh8Y2J8IGNiKENhY2hlW3NyY10pKSB9XG5cdFx0XHRcblx0XHRcdHJldHVybiBwcm9taXNlIGlmIHJlc1xuXHRcdFx0XG5cdFx0XHRjb25zb2xlLmxvZyBcInRyeSB0byBmZXRjaCB7c3JjfVwiXG5cdFx0XHRcblx0XHRcdHZhciBmcyA9IHJlcXVpcmUgJ2ZzJ1xuXHRcdFx0dmFyIHBhdGggPSByZXF1aXJlICdwYXRoJ1xuXHRcdFx0dmFyIG1kID0gcmVxdWlyZSAnLi91dGlsL21hcmtkb3duJ1xuXHRcdFx0dmFyIGhsID0gcmVxdWlyZSAnLi9zY3JpbWJsYS9jb3JlL2hpZ2hsaWdodGVyJ1xuXHRcdFx0dmFyIGZpbGVwYXRoID0gXCJ7X19kaXJuYW1lfS8uLi9kb2NzL3tzcmN9XCIucmVwbGFjZSgvXFwvXFwvL2csJy8nKVxuXG5cdFx0XHRsZXQgYm9keSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlcGF0aCwndXRmLTgnKVxuXG5cdFx0XHRpZiBzcmMubWF0Y2goL1xcLm1kJC8pXG5cdFx0XHRcdHJlcyA9IG1kLnJlbmRlcihib2R5KVxuXG5cdFx0XHRlbGlmIHNyYy5tYXRjaCgvXFwuanNvbiQvKVxuXHRcdFx0XHQjIHNob3VsZCBhbHNvIGluY2x1ZGUgbWQ/XG5cdFx0XHRcdHJlcyA9IEpTT04ucGFyc2UoYm9keSlcblxuXHRcdFx0ZWxpZiBzcmMubWF0Y2goL1xcLmltYmEkLylcblx0XHRcdFx0bGV0IGh0bWwgPSBobC5IaWdobGlnaHRlci5oaWdobGlnaHQoYm9keSx7bW9kZTogJ2Z1bGwnfSlcblx0XHRcdFx0cmVzID0ge2JvZHk6IGJvZHksIGh0bWw6IGh0bWx9XG5cblx0XHRcdGNhY2hlW3NyY10gPSBDYWNoZVtzcmNdID0gcmVzXG5cdFx0XHRyZXR1cm4gcHJvbWlzZVxuXHRcblx0aWYgJHdlYiRcblx0XHRkZWYgZmV0Y2ggc3JjXG5cdFx0XHRpZiBjYWNoZVtzcmNdXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoY2FjaGVbc3JjXSlcblx0XHRcdFxuXHRcdFx0cmVxdWVzdHNbc3JjXSB8fD0gUHJvbWlzZS5uZXcgZG8gfHJlc29sdmV8XG5cdFx0XHRcdHZhciByZXEgPSBhd2FpdCB3aW5kb3cuZmV0Y2goc3JjKVxuXHRcdFx0XHR2YXIgcmVzcCA9IGF3YWl0IHJlcS5qc29uXG5cdFx0XHRcdHJlc29sdmUoY2FjaGVbc3JjXSA9IHJlc3ApXG5cdFx0XHRcblx0ZGVmIGZldGNoRG9jdW1lbnQgc3JjLCAmY2Jcblx0XHR2YXIgcmVzID0gZGVwc1tzcmNdXG5cblx0XHRpZiAkbm9kZSRcblx0XHRcdHZhciBmcyA9IHJlcXVpcmUgJ2ZzJ1xuXHRcdFx0dmFyIHBhdGggPSByZXF1aXJlICdwYXRoJ1xuXHRcdFx0dmFyIG1kID0gcmVxdWlyZSAnLi91dGlsL21hcmtkb3duJ1xuXHRcdFx0dmFyIGhsID0gcmVxdWlyZSAnLi9zY3JpbWJsYS9jb3JlL2hpZ2hsaWdodGVyJ1xuXHRcdFx0dmFyIGZpbGVwYXRoID0gXCJ7X19kaXJuYW1lfS8uLi9kb2NzL3tzcmN9XCIucmVwbGFjZSgvXFwvXFwvL2csJy8nKVxuXG5cdFx0XHRpZiAhcmVzXG5cdFx0XHRcdGxldCBib2R5ID0gZnMucmVhZEZpbGVTeW5jKGZpbGVwYXRoLCd1dGYtOCcpXG5cblx0XHRcdFx0aWYgc3JjLm1hdGNoKC9cXC5tZCQvKVxuXHRcdFx0XHRcdHJlcyA9IG1kLnJlbmRlcihib2R5KVxuXG5cdFx0XHRcdGVsaWYgc3JjLm1hdGNoKC9cXC5qc29uJC8pXG5cdFx0XHRcdFx0IyBzaG91bGQgYWxzbyBpbmNsdWRlIG1kP1xuXHRcdFx0XHRcdHJlcyA9IEpTT04ucGFyc2UoYm9keSlcblxuXHRcdFx0XHRlbGlmIHNyYy5tYXRjaCgvXFwuaW1iYSQvKVxuXHRcdFx0XHRcdGxldCBodG1sID0gaGwuSGlnaGxpZ2h0ZXIuaGlnaGxpZ2h0KGJvZHkse21vZGU6ICdmdWxsJ30pXG5cdFx0XHRcdFx0cmVzID0ge2JvZHk6IGJvZHksIGh0bWw6IGh0bWx9XG5cdFx0XHRcblx0XHRcdGRlcHNbc3JjXSB8fD0gcmVzXG5cdFx0XHRjYiBhbmQgY2IocmVzKVxuXHRcdGVsc2Vcblx0XHRcdCMgc2hvdWxkIGd1YXJkIGFnYWluc3QgbXVsdGlwbGUgbG9hZHNcblx0XHRcdGlmIHJlc1xuXHRcdFx0XHRjYiBhbmQgY2IocmVzKVxuXHRcdFx0XHRyZXR1cm4ge3RoZW46IChkbyB8dnwgdihyZXMpKX0gIyBmYWtlIHByb21pc2UgaGFja1xuXG5cdFx0XHR2YXIgeGhyID0gWE1MSHR0cFJlcXVlc3QubmV3XG5cdFx0XHR4aHIuYWRkRXZlbnRMaXN0ZW5lciAnbG9hZCcgZG8gfHJlc3xcblx0XHRcdFx0cmVzID0gZGVwc1tzcmNdID0gSlNPTi5wYXJzZSh4aHI6cmVzcG9uc2VUZXh0KVxuXHRcdFx0XHRjYiBhbmQgY2IocmVzKVxuXHRcdFx0eGhyLm9wZW4oXCJHRVRcIiwgc3JjKVxuXHRcdFx0eGhyLnNlbmRcblxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIGlzc3Vlc1xuXHRcdEBpc3N1ZXMgfHw9IERvYy5nZXQoJy9pc3N1ZXMvYWxsJywnanNvbicpXG5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9hcHAuaW1iYSIsImV4dGVybiBoaXN0b3J5LCBnYVxuXG5leHBvcnQgY2xhc3MgUm91dGVyXG5cblx0cHJvcCBwYXRoXG5cblx0ZGVmIHNlbGYuc2x1ZyBzdHJcblx0XHRzdHIgPSBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpLnRvTG93ZXJDYXNlICMgdHJpbVxuXG5cdFx0dmFyIGZyb20gPSBcIsOgw6HDpMOiw6XDqMOpw6vDqsOsw63Dr8Ouw7LDs8O2w7TDucO6w7zDu8Oxw6fCty9fLDo7XCJcblx0XHR2YXIgdG8gICA9IFwiYWFhYWFlZWVlaWlpaW9vb291dXV1bmMtLS0tLS1cIlxuXHRcdHN0ciA9IHN0ci5yZXBsYWNlKC9bXmEtejAtOSAtXS9nLCAnJykgIyByZW1vdmUgaW52YWxpZCBjaGFyc1xuXHRcdHN0ciA9IHN0ci5yZXBsYWNlKC9cXHMrL2csICctJykgIyBjb2xsYXBzZSB3aGl0ZXNwYWNlIGFuZCByZXBsYWNlIGJ5IC1cblx0XHRzdHIgPSBzdHIucmVwbGFjZSgvLSsvZywgJy0nKSAjIGNvbGxhcHNlIGRhc2hlc1xuXG5cdFx0cmV0dXJuIHN0clxuXG5cdGRlZiBpbml0aWFsaXplIGFwcFxuXHRcdEBhcHAgPSBhcHBcblxuXHRcdGlmICR3ZWIkXG5cdFx0XHR3aW5kb3c6b25wb3BzdGF0ZSA9IGRvIHxlfFxuXHRcdFx0XHRyZWZyZXNoXG5cblx0XHRzZWxmXG5cblx0ZGVmIHJlZnJlc2hcblx0XHRpZiAkd2ViJFxuXHRcdFx0ZG9jdW1lbnQ6Ym9keS5zZXRBdHRyaWJ1dGUoJ2RhdGEtcm91dGUnLHNlZ21lbnQoMCkpXG5cdFx0XHRJbWJhLmNvbW1pdFxuXHRcdHNlbGZcblxuXHRkZWYgcGF0aFxuXHRcdEBhcHAucGF0aFxuXG5cdGRlZiBoYXNoXG5cdFx0QGFwcC5oYXNoXG5cblx0ZGVmIGV4dFxuXHRcdHZhciBwYXRoID0gcGF0aFxuXHRcdHZhciBtID0gcGF0aC5tYXRjaCgvXFwuKFteXFwvXSspJC8pXG5cdFx0bSBhbmQgbVsxXSBvciAnJ1xuXG5cdGRlZiBzZWdtZW50IG5yID0gMFxuXHRcdHBhdGguc3BsaXQoJy8nKVtuciArIDFdIG9yICcnXG5cblx0ZGVmIGdvIGhyZWYsIHN0YXRlID0ge30sIHJlcGxhY2UgPSBub1xuXHRcdGlmIGhyZWYgPT0gJy9pbnN0YWxsJ1xuXHRcdFx0IyByZWRpcmVjdHMgaGVyZVxuXHRcdFx0aHJlZiA9ICcvZ3VpZGVzI3RvYy1pbnN0YWxsYXRpb24nXG5cdFx0XHRcblx0XHRpZiByZXBsYWNlXG5cdFx0XHRoaXN0b3J5LnJlcGxhY2VTdGF0ZShzdGF0ZSxudWxsLGhyZWYpXG5cdFx0XHRyZWZyZXNoXG5cdFx0ZWxzZVxuXHRcdFx0aGlzdG9yeS5wdXNoU3RhdGUoc3RhdGUsbnVsbCxocmVmKVxuXHRcdFx0cmVmcmVzaFxuXHRcdFx0IyBnYSgnc2VuZCcsICdwYWdldmlldycsIGhyZWYpXG5cblx0XHRpZiAhaHJlZi5tYXRjaCgvXFwjLylcblx0XHRcdHdpbmRvdy5zY3JvbGxUbygwLDApXG5cdFxuXHRcdHNlbGZcblxuXHRkZWYgc2NvcGVkIHJlZywgcGFydFxuXHRcdHZhciBwYXRoID0gcGF0aCArICcjJyArIGhhc2hcblx0XHRpZiByZWcgaXNhIFN0cmluZ1xuXHRcdFx0dmFyIG54dCA9IHBhdGhbcmVnOmxlbmd0aF1cblx0XHRcdHBhdGguc3Vic3RyKDAscmVnOmxlbmd0aCkgPT0gcmVnIGFuZCAoIW54dCBvciBueHQgPT0gJy0nIG9yIG54dCA9PSAnLycgb3Igbnh0ID09ICcjJyBvciBueHQgPT0gJz8nIG9yIG54dCA9PSAnXycpXG5cdFx0ZWxpZiByZWcgaXNhIFJlZ0V4cFxuXHRcdFx0dmFyIG0gPSBwYXRoLm1hdGNoKHJlZylcblx0XHRcdHBhcnQgJiYgbSA/IG1bcGFydF0gOiBtXG5cdFx0ZWxzZVxuXHRcdFx0bm9cblxuXHRkZWYgbWF0Y2ggcmVnLCBwYXJ0XG5cdFx0dmFyIHBhdGggPSBwYXRoICsgJyMnICsgaGFzaFxuXG5cdFx0aWYgcmVnIGlzYSBTdHJpbmdcblx0XHRcdHBhdGggPT0gcmVnXG5cdFx0ZWxpZiByZWcgaXNhIFJlZ0V4cFxuXHRcdFx0dmFyIG0gPSBwYXRoLm1hdGNoKHJlZylcblx0XHRcdHBhcnQgJiYgbSA/IG1bcGFydF0gOiBtXG5cdFx0ZWxzZVxuXHRcdFx0bm9cblxuZXh0ZW5kIHRhZyBlbGVtZW50XG5cdGF0dHIgcm91dGVcblxuXHRkZWYgcm91dGVyXG5cdFx0YXBwLnJvdXRlclxuXG5cdGRlZiByZXJvdXRlXG5cdFx0dmFyIHNjb3BlZCA9IHJvdXRlci5zY29wZWQocm91dGUsc2VsZilcblx0XHRmbGFnKCdzY29wZWQnLHNjb3BlZClcblx0XHRmbGFnKCdzZWxlY3RlZCcscm91dGVyLm1hdGNoKHJvdXRlLHNlbGYpKVxuXHRcdGlmIHNjb3BlZCAhPSBAc2NvcGVkXG5cdFx0XHRAc2NvcGVkID0gc2NvcGVkXG5cdFx0XHRzY29wZWQgPyBkaWRzY29wZSA6IGRpZHVuc2NvcGVcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBkaWRzY29wZVxuXHRcdHNlbGZcblxuXHRkZWYgZGlkdW5zY29wZVxuXHRcdHNlbGZcblxuIyBleHRlbmQgbGlua3NcbmV4dGVuZCB0YWcgYVxuXHRcblx0ZGVmIHJvdXRlXG5cdFx0QHJvdXRlIG9yIGhyZWZcblxuXHRkZWYgb250YXAgZVxuXHRcdHZhciBocmVmID0gaHJlZi5yZXBsYWNlKC9eaHR0cFxcOlxcL1xcL2ltYmFcXC5pby8sJycpXG5cblx0XHRpZiBlLmV2ZW50Om1ldGFLZXkgb3IgZS5ldmVudDphbHRLZXlcblx0XHRcdGUuQHJlc3BvbmRlciA9IG51bGxcblx0XHRcdHJldHVybiBlLnN0b3BcblxuXHRcdGlmIGxldCBtID0gaHJlZi5tYXRjaCgvZ2lzdFxcLmdpdGh1YlxcLmNvbVxcLyhbXlxcL10rKVxcLyhbQS1aYS16XFxkXSspLylcblx0XHRcdGNvbnNvbGUubG9nICdnaXN0ISEnLG1bMV0sbVsyXVxuXHRcdFx0I2dpc3Qub3BlbihtWzJdKVxuXHRcdFx0cmV0dXJuIGUucHJldmVudC5zdG9wXG5cblx0XHRpZiBocmVmWzBdID09ICcjJyBvciBocmVmWzBdID09ICcvJ1xuXHRcdFx0ZS5wcmV2ZW50LnN0b3Bcblx0XHRcdHJvdXRlci5nbyhocmVmLHt9KVxuXHRcdFx0SW1iYS5FdmVudHMudHJpZ2dlcigncm91dGUnLHNlbGYpXG5cdFx0ZWxzZVxuXHRcdFx0ZS5AcmVzcG9uZGVyID0gbnVsbFxuXHRcdFx0cmV0dXJuIGUuc3RvcFx0XHRcblx0XHRzZWxmXG5cblx0ZGVmIHJlbmRlclxuXHRcdHJlcm91dGVcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy91dGlsL3JvdXRlci5pbWJhIiwiaW1wb3J0IEhvbWVQYWdlIGZyb20gJy4vSG9tZVBhZ2UnXG5pbXBvcnQgR3VpZGVzUGFnZSBmcm9tICcuL0d1aWRlc1BhZ2UnXG5pbXBvcnQgRG9jc1BhZ2UgZnJvbSAnLi9Eb2NzUGFnZSdcblxuZXh0ZW5kIHRhZyBlbGVtZW50XG5cblx0ZGVmIHJvb3Rcblx0XHRAb3duZXJfID8gQG93bmVyXy5yb290IDogc2VsZlxuXG5cdGRlZiBhcHBcblx0XHRyb290LmFwcFxuXG5cbmV4cG9ydCB0YWcgU2l0ZVxuXHRcblx0ZGVmIGFwcFxuXHRcdGRhdGFcblx0XHRcblx0ZGVmIHJvb3Rcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiByb3V0ZXJcblx0XHRhcHAucm91dGVyXG5cdFx0XG5cdGRlZiBsb2FkXG5cdFx0Y29uc29sZS5sb2cgXCJsb2FkaW5nIGFwcC5yb3V0ZXJcIlxuXHRcdFByb21pc2UubmV3IGRvIHxyZXNvbHZlfFxuXHRcdFx0Y29uc29sZS5sb2cgXCJTaXRlI2xvYWRcIlxuXHRcdFx0c2V0VGltZW91dChyZXNvbHZlLDIwMClcblx0XHRcblx0ZGVmIHJlbmRlclxuXHRcdGNvbnNvbGUubG9nIFwicmVuZGVyIHNpdGVcIixhcHAucGF0aFxuXHRcdDxzZWxmPlxuXHRcdFx0PGhlYWRlciNoZWFkZXI+XG5cdFx0XHRcdDxuYXYuY29udGVudD5cblx0XHRcdFx0XHQ8YS50YWIubG9nbyBocmVmPScvaG9tZSc+IDxpPiAnaW1iYSdcblx0XHRcdFx0XHQ8YS50YWIuaG9tZSBocmVmPScvaG9tZSc+IDxpPiAnaG9tZSdcblx0XHRcdFx0XHQ8YS50YWIuZ3VpZGVzIGhyZWY9Jy9ndWlkZSc+IDxpPiAnZ3VpZGVzJ1xuXHRcdFx0XHRcdDxhLnRhYi5kb2NzIGhyZWY9Jy9kb2NzJz4gPGk+ICdhcGknXG5cdFx0XHRcdFx0PGEudGFiLmJsb2cgaHJlZj0nL2Jsb2cnPiA8aT4gJ2Jsb2cnXG5cdFx0XHRcdFx0aWYgYXBwLnJvdXRlci5zZWdtZW50KDApID09ICdnaXN0cydcblx0XHRcdFx0XHRcdDxhLnRhYi5ibG9nIGhyZWY9Jy9naXN0cyc+IDxpPiAnZ2lzdHMnXG5cblx0XHRcdFx0XHQ8c3Bhbi5ncmVlZHk+XG5cdFx0XHRcdFx0PGEudHdpdHRlciBocmVmPSdodHRwOi8vdHdpdHRlci5jb20vaW1iYWpzJz4gPGk+ICd0d2l0dGVyJ1xuXHRcdFx0XHRcdDxhLmdpdGh1YiBocmVmPSdodHRwczovL2dpdGh1Yi5jb20vc29tZWJlZS9pbWJhJz4gPGk+ICdnaXRodWInXG5cdFx0XHRcdFx0PGEuaXNzdWVzIGhyZWY9J2h0dHBzOi8vZ2l0aHViLmNvbS9zb21lYmVlL2ltYmEvaXNzdWVzJz4gPGk+ICdpc3N1ZXMnXG5cdFx0XHRcdFx0PGEubWVudSA6dGFwPSd0b2dnbGVNZW51Jz4gPGI+XG5cdFx0XHRcblx0XHRcdDxtYWluPlxuXHRcdFx0XHRpZiByb3V0ZXIuc2NvcGVkKCcvaG9tZScpXG5cdFx0XHRcdFx0PEhvbWVQYWdlPlxuXHRcdFx0XHRlbGlmIHJvdXRlci5zY29wZWQoJy9ndWlkZScpXG5cdFx0XHRcdFx0PEd1aWRlc1BhZ2U+XG5cdFx0XHRcdGVsaWYgcm91dGVyLnNjb3BlZCgnL2RvY3MnKVxuXHRcdFx0XHRcdDxEb2NzUGFnZT5cblxuXHRcdFx0PGZvb3RlciNmb290ZXI+IFxuXHRcdFx0XHQ8aHI+XG5cdFx0XHRcdDwubGZ0PiBcIkltYmEgwqkgMjAxNS0yMDE4XCJcblx0XHRcdFx0PC5yZ3Q+XG5cdFx0XHRcdFx0PGEgaHJlZj0naHR0cDovL3R3aXR0ZXIuY29tL2ltYmFqcyc+ICdUd2l0dGVyJ1xuXHRcdFx0XHRcdDxhIGhyZWY9J2h0dHA6Ly9naXRodWIuY29tL3NvbWViZWUvaW1iYSc+ICdHaXRIdWInXG5cdFx0XHRcdFx0PGEgaHJlZj0naHR0cDovL2dpdGh1Yi5jb20vc29tZWJlZS9pbWJhL2lzc3Vlcyc+ICdJc3N1ZXMnXG5cdFx0XHRcdFx0PGEgaHJlZj0naHR0cDovL2dpdHRlci5pbS9zb21lYmVlL2ltYmEnPiAnQ2hhdCdcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9TaXRlLmltYmEiLCJpbXBvcnQgUGFnZSBmcm9tICcuL1BhZ2UnXG5cbmltcG9ydCBFeGFtcGxlIGZyb20gJy4vU25pcHBldCdcbmltcG9ydCBNYXJrZWQgZnJvbSAnLi9NYXJrZWQnXG5pbXBvcnQgUGF0dGVybiBmcm9tICcuL1BhdHRlcm4nXG5cblxuZXhwb3J0IHRhZyBIb21lUGFnZSA8IFBhZ2VcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGY+IDwuYm9keT5cblx0XHRcdDxkaXYjaGVyby5kYXJrPlxuXHRcdFx0XHQ8UGF0dGVybkBwYXR0ZXJuPlxuXHRcdFx0XHQjIDxoZXJvc25pcHBldC5oZXJvLmRhcmsgc3JjPScvaG9tZS9leGFtcGxlcy9oZXJvLmltYmEnPlxuXHRcdFx0PC5jb250ZW50PlxuXHRcdFx0XHQ8TWFya2VkLnNlY3Rpb24ubWQud2VsY29tZS5odWdlLmxpZ2h0PiBcIlwiXCJcblx0XHRcdFx0XHQjIENyZWF0ZSBjb21wbGV4IHdlYiBhcHBzIHdpdGggZWFzZSFcblxuXHRcdFx0XHRcdEltYmEgaXMgYSBuZXcgcHJvZ3JhbW1pbmcgbGFuZ3VhZ2UgZm9yIHRoZSB3ZWIgdGhhdCBjb21waWxlcyB0byBoaWdobHkgXG5cdFx0XHRcdFx0cGVyZm9ybWFudCBhbmQgcmVhZGFibGUgSmF2YVNjcmlwdC4gSXQgaGFzIGxhbmd1YWdlIGxldmVsIHN1cHBvcnQgZm9yIGRlZmluaW5nLCBcblx0XHRcdFx0XHRleHRlbmRpbmcsIHN1YmNsYXNzaW5nLCBpbnN0YW50aWF0aW5nIGFuZCByZW5kZXJpbmcgZG9tIG5vZGVzLiBGb3IgYSBzaW1wbGUgXG5cdFx0XHRcdFx0YXBwbGljYXRpb24gbGlrZSBUb2RvTVZDLCBpdCBpcyBtb3JlIHRoYW4gXG5cdFx0XHRcdFx0WzEwIHRpbWVzIGZhc3RlciB0aGFuIFJlYWN0XShodHRwOi8vc29tZWJlZS5naXRodWIuaW8vdG9kb212Yy1yZW5kZXItYmVuY2htYXJrL2luZGV4Lmh0bWwpIFxuXHRcdFx0XHRcdHdpdGggbGVzcyBjb2RlLCBhbmQgYSBtdWNoIHNtYWxsZXIgbGlicmFyeS5cblxuXHRcdFx0XHRcdC0tLVxuXG5cdFx0XHRcdFx0LSAjIyBJbWJhLmluc3BpcmF0aW9uXG5cdFx0XHRcdFx0ICBJbWJhIGJyaW5ncyB0aGUgYmVzdCBmcm9tIFJ1YnksIFB5dGhvbiwgYW5kIFJlYWN0ICgrIEpTWCkgdG9nZXRoZXIgaW4gYSBjbGVhbiBsYW5ndWFnZSBhbmQgcnVudGltZS5cblxuXHRcdFx0XHRcdC0gIyMgSW1iYS5pbnRlcm9wZXJhYmlsaXR5XG5cdFx0XHRcdFx0ICBJbWJhIGNvbXBpbGVzIGRvd24gdG8gY2xlYW4gYW5kIHJlYWRhYmxlIEphdmFTY3JpcHQuIFVzZSBhbnkgSlMgbGlicmFyeSBpbiBJbWJhIGFuZCB2aWNhLXZlcnNhLlxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC0gIyMgSW1iYS5wZXJmb3JtYW5jZVxuXHRcdFx0XHRcdCAgQnVpbGQgeW91ciBhcHBsaWNhdGlvbiB2aWV3cyB1c2luZyBJbWJhJ3MgbmF0aXZlIHRhZ3MgZm9yIHVucHJlY2VkZW50ZWQgcGVyZm9ybWFuY2UuXG5cblx0XHRcdFx0XHRcIlwiXCJcblxuXHRcdFx0XHQ8RXhhbXBsZS5kYXJrIGhlYWRpbmc9XCJTaW1wbGUgcmVtaW5kZXJzXCIgc3JjPScvaG9tZS9leGFtcGxlcy9yZW1pbmRlcnMuaW1iYSc+XG5cblx0XHRcdFx0PE1hcmtlZC5zZWN0aW9uLm1kPiBcIlwiXCJcblx0XHRcdFx0XHQjIyBSZXVzYWJsZSBjb21wb25lbnRzXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0QSBjdXN0b20gdGFnIC8gY29tcG9uZW50IGNhbiBtYWludGFpbiBpbnRlcm5hbCBzdGF0ZSBhbmQgY29udHJvbCBob3cgdG8gcmVuZGVyIGl0c2VsZi5cblx0XHRcdFx0XHRXaXRoIHRoZSBwZXJmb3JtYW5jZSBvZiBET00gcmVjb25jaWxpYXRpb24gaW4gSW1iYSwgeW91IGNhbiB1c2Ugb25lLXdheSBkZWNsYXJhdGl2ZSBiaW5kaW5ncyxcblx0XHRcdFx0XHRldmVuIGZvciBhbmltYXRpb25zLiBXcml0ZSBhbGwgeW91ciB2aWV3cyBpbiBhIHN0cmFpZ2h0LWZvcndhcmQgbGluZWFyIGZhc2hpb24gYXMgaWYgeW91IGNvdWxkXG5cdFx0XHRcdFx0cmVyZW5kZXIgeW91ciB3aG9sZSBhcHBsaWNhdGlvbiBvbiAqKmV2ZXJ5IHNpbmdsZSoqIGRhdGEvc3RhdGUgY2hhbmdlLlxuXHRcdFx0XHRcdFwiXCJcIlxuXG5cdFx0XHRcdDxFeGFtcGxlLmRhcmsgaGVhZGluZz1cIldvcmxkIGNsb2NrXCIgc3JjPScvaG9tZS9leGFtcGxlcy9jbG9jay5pbWJhJz5cblxuXHRcdFx0XHQ8TWFya2VkLnNlY3Rpb24ubWQ+IFwiXCJcIlxuXHRcdFx0XHRcdCMjIEV4dGVuZCBuYXRpdmUgdGFnc1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdEluIGFkZGl0aW9uIHRvIGRlZmluaW5nIGN1c3RvbSB0YWdzLCB5b3UgY2FuIGFsc28gZXh0ZW5kIG5hdGl2ZSB0YWdzLCBvciBpbmhlcml0IGZyb20gdGhlbS5cblx0XHRcdFx0XHRCaW5kaW5nIHRvIGRvbSBldmVudHMgaXMgYXMgc2ltcGxlIGFzIGRlZmluaW5nIG1ldGhvZHMgb24geW91ciB0YWdzOyBhbGwgZXZlbnRzIHdpbGwgYmVcblx0XHRcdFx0XHRlZmZpY2llbnRseSBkZWxlZ2F0ZWQgYW5kIGhhbmRsZWQgYnkgSW1iYS4gTGV0J3MgZGVmaW5lIGEgc2ltcGxlIHNrZXRjaHBhZC4uLlxuXHRcdFx0XHRcdFwiXCJcIlxuXG5cdFx0XHRcdDxFeGFtcGxlLmRhcmsgaGVhZGluZz1cIkN1c3RvbSBjYW52YXNcIiBzcmM9Jy9ob21lL2V4YW1wbGVzL2NhbnZhcy5pbWJhJz5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvSG9tZVBhZ2UuaW1iYSIsIlxuZXhwb3J0IHRhZyBTbmlwcGV0XG5cdHByb3Agc3JjXG5cdHByb3AgaGVhZGluZ1xuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj5cblx0XHRcbmV4cG9ydCB0YWcgRXhhbXBsZSA8IFNuaXBwZXRcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGY+IFwiRXhhbXBsZVwiXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL1NuaXBwZXQuaW1iYSIsIiMgZGVmaW5lIHJlbmRlcmVyXG52YXIgbWFya2VkID0gcmVxdWlyZSAnbWFya2VkJ1xudmFyIG1kciA9IG1hcmtlZC5SZW5kZXJlci5uZXdcblxuZGVmIG1kci5oZWFkaW5nIHRleHQsIGx2bFxuXHRcIjxoe2x2bH0+e3RleHR9PC9oe2x2bH0+XCJcblx0XHRcbmV4cG9ydCB0YWcgTWFya2VkXG5cdGRlZiByZW5kZXJlclxuXHRcdHNlbGZcblxuXHRkZWYgc2V0VGV4dCB0ZXh0XG5cdFx0aWYgdGV4dCAhPSBAdGV4dFxuXHRcdFx0QHRleHQgPSB0ZXh0XG5cdFx0XHRkb206aW5uZXJIVE1MID0gbWFya2VkKHRleHQsIHJlbmRlcmVyOiBtZHIpXG5cdFx0c2VsZlxuXG5cdGRlZiBzZXRDb250ZW50IHZhbCx0eXBcblx0XHRzZXRUZXh0KHZhbCwwKVxuXHRcdHJldHVybiBzZWxmXG5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9NYXJrZWQuaW1iYSIsIi8qKlxuICogbWFya2VkIC0gYSBtYXJrZG93biBwYXJzZXJcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDE0LCBDaHJpc3RvcGhlciBKZWZmcmV5LiAoTUlUIExpY2Vuc2VkKVxuICogaHR0cHM6Ly9naXRodWIuY29tL2NoamovbWFya2VkXG4gKi9cblxuOyhmdW5jdGlvbigpIHtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBCbG9jay1MZXZlbCBHcmFtbWFyXG4gKi9cblxudmFyIGJsb2NrID0ge1xuICBuZXdsaW5lOiAvXlxcbisvLFxuICBjb2RlOiAvXiggezR9W15cXG5dK1xcbiopKy8sXG4gIGZlbmNlczogbm9vcCxcbiAgaHI6IC9eKCAqWy0qX10pezMsfSAqKD86XFxuK3wkKS8sXG4gIGhlYWRpbmc6IC9eICooI3sxLDZ9KSAqKFteXFxuXSs/KSAqIyogKig/Olxcbit8JCkvLFxuICBucHRhYmxlOiBub29wLFxuICBsaGVhZGluZzogL14oW15cXG5dKylcXG4gKig9fC0pezIsfSAqKD86XFxuK3wkKS8sXG4gIGJsb2NrcXVvdGU6IC9eKCAqPlteXFxuXSsoXFxuKD8hZGVmKVteXFxuXSspKlxcbiopKy8sXG4gIGxpc3Q6IC9eKCAqKShidWxsKSBbXFxzXFxTXSs/KD86aHJ8ZGVmfFxcbnsyLH0oPyEgKSg/IVxcMWJ1bGwgKVxcbip8XFxzKiQpLyxcbiAgaHRtbDogL14gKig/OmNvbW1lbnQgKig/OlxcbnxcXHMqJCl8Y2xvc2VkICooPzpcXG57Mix9fFxccyokKXxjbG9zaW5nICooPzpcXG57Mix9fFxccyokKSkvLFxuICBkZWY6IC9eICpcXFsoW15cXF1dKylcXF06ICo8PyhbXlxccz5dKyk+Pyg/OiArW1wiKF0oW15cXG5dKylbXCIpXSk/ICooPzpcXG4rfCQpLyxcbiAgdGFibGU6IG5vb3AsXG4gIHBhcmFncmFwaDogL14oKD86W15cXG5dK1xcbj8oPyFocnxoZWFkaW5nfGxoZWFkaW5nfGJsb2NrcXVvdGV8dGFnfGRlZikpKylcXG4qLyxcbiAgdGV4dDogL15bXlxcbl0rL1xufTtcblxuYmxvY2suYnVsbGV0ID0gLyg/OlsqKy1dfFxcZCtcXC4pLztcbmJsb2NrLml0ZW0gPSAvXiggKikoYnVsbCkgW15cXG5dKig/Olxcbig/IVxcMWJ1bGwgKVteXFxuXSopKi87XG5ibG9jay5pdGVtID0gcmVwbGFjZShibG9jay5pdGVtLCAnZ20nKVxuICAoL2J1bGwvZywgYmxvY2suYnVsbGV0KVxuICAoKTtcblxuYmxvY2subGlzdCA9IHJlcGxhY2UoYmxvY2subGlzdClcbiAgKC9idWxsL2csIGJsb2NrLmJ1bGxldClcbiAgKCdocicsICdcXFxcbisoPz1cXFxcMT8oPzpbLSpfXSAqKXszLH0oPzpcXFxcbit8JCkpJylcbiAgKCdkZWYnLCAnXFxcXG4rKD89JyArIGJsb2NrLmRlZi5zb3VyY2UgKyAnKScpXG4gICgpO1xuXG5ibG9jay5ibG9ja3F1b3RlID0gcmVwbGFjZShibG9jay5ibG9ja3F1b3RlKVxuICAoJ2RlZicsIGJsb2NrLmRlZilcbiAgKCk7XG5cbmJsb2NrLl90YWcgPSAnKD8hKD86J1xuICArICdhfGVtfHN0cm9uZ3xzbWFsbHxzfGNpdGV8cXxkZm58YWJicnxkYXRhfHRpbWV8Y29kZSdcbiAgKyAnfHZhcnxzYW1wfGtiZHxzdWJ8c3VwfGl8Ynx1fG1hcmt8cnVieXxydHxycHxiZGl8YmRvJ1xuICArICd8c3Bhbnxicnx3YnJ8aW5zfGRlbHxpbWcpXFxcXGIpXFxcXHcrKD8hOi98W15cXFxcd1xcXFxzQF0qQClcXFxcYic7XG5cbmJsb2NrLmh0bWwgPSByZXBsYWNlKGJsb2NrLmh0bWwpXG4gICgnY29tbWVudCcsIC88IS0tW1xcc1xcU10qPy0tPi8pXG4gICgnY2xvc2VkJywgLzwodGFnKVtcXHNcXFNdKz88XFwvXFwxPi8pXG4gICgnY2xvc2luZycsIC88dGFnKD86XCJbXlwiXSpcInwnW14nXSonfFteJ1wiPl0pKj8+LylcbiAgKC90YWcvZywgYmxvY2suX3RhZylcbiAgKCk7XG5cbmJsb2NrLnBhcmFncmFwaCA9IHJlcGxhY2UoYmxvY2sucGFyYWdyYXBoKVxuICAoJ2hyJywgYmxvY2suaHIpXG4gICgnaGVhZGluZycsIGJsb2NrLmhlYWRpbmcpXG4gICgnbGhlYWRpbmcnLCBibG9jay5saGVhZGluZylcbiAgKCdibG9ja3F1b3RlJywgYmxvY2suYmxvY2txdW90ZSlcbiAgKCd0YWcnLCAnPCcgKyBibG9jay5fdGFnKVxuICAoJ2RlZicsIGJsb2NrLmRlZilcbiAgKCk7XG5cbi8qKlxuICogTm9ybWFsIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay5ub3JtYWwgPSBtZXJnZSh7fSwgYmxvY2spO1xuXG4vKipcbiAqIEdGTSBCbG9jayBHcmFtbWFyXG4gKi9cblxuYmxvY2suZ2ZtID0gbWVyZ2Uoe30sIGJsb2NrLm5vcm1hbCwge1xuICBmZW5jZXM6IC9eICooYHszLH18fnszLH0pWyBcXC5dKihcXFMrKT8gKlxcbihbXFxzXFxTXSo/KVxccypcXDEgKig/Olxcbit8JCkvLFxuICBwYXJhZ3JhcGg6IC9eLyxcbiAgaGVhZGluZzogL14gKigjezEsNn0pICsoW15cXG5dKz8pICojKiAqKD86XFxuK3wkKS9cbn0pO1xuXG5ibG9jay5nZm0ucGFyYWdyYXBoID0gcmVwbGFjZShibG9jay5wYXJhZ3JhcGgpXG4gICgnKD8hJywgJyg/ISdcbiAgICArIGJsb2NrLmdmbS5mZW5jZXMuc291cmNlLnJlcGxhY2UoJ1xcXFwxJywgJ1xcXFwyJykgKyAnfCdcbiAgICArIGJsb2NrLmxpc3Quc291cmNlLnJlcGxhY2UoJ1xcXFwxJywgJ1xcXFwzJykgKyAnfCcpXG4gICgpO1xuXG4vKipcbiAqIEdGTSArIFRhYmxlcyBCbG9jayBHcmFtbWFyXG4gKi9cblxuYmxvY2sudGFibGVzID0gbWVyZ2Uoe30sIGJsb2NrLmdmbSwge1xuICBucHRhYmxlOiAvXiAqKFxcUy4qXFx8LiopXFxuICooWy06XSsgKlxcfFstfCA6XSopXFxuKCg/Oi4qXFx8LiooPzpcXG58JCkpKilcXG4qLyxcbiAgdGFibGU6IC9eICpcXHwoLispXFxuICpcXHwoICpbLTpdK1stfCA6XSopXFxuKCg/OiAqXFx8LiooPzpcXG58JCkpKilcXG4qL1xufSk7XG5cbi8qKlxuICogQmxvY2sgTGV4ZXJcbiAqL1xuXG5mdW5jdGlvbiBMZXhlcihvcHRpb25zKSB7XG4gIHRoaXMudG9rZW5zID0gW107XG4gIHRoaXMudG9rZW5zLmxpbmtzID0ge307XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgbWFya2VkLmRlZmF1bHRzO1xuICB0aGlzLnJ1bGVzID0gYmxvY2subm9ybWFsO1xuXG4gIGlmICh0aGlzLm9wdGlvbnMuZ2ZtKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy50YWJsZXMpIHtcbiAgICAgIHRoaXMucnVsZXMgPSBibG9jay50YWJsZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucnVsZXMgPSBibG9jay5nZm07XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRXhwb3NlIEJsb2NrIFJ1bGVzXG4gKi9cblxuTGV4ZXIucnVsZXMgPSBibG9jaztcblxuLyoqXG4gKiBTdGF0aWMgTGV4IE1ldGhvZFxuICovXG5cbkxleGVyLmxleCA9IGZ1bmN0aW9uKHNyYywgb3B0aW9ucykge1xuICB2YXIgbGV4ZXIgPSBuZXcgTGV4ZXIob3B0aW9ucyk7XG4gIHJldHVybiBsZXhlci5sZXgoc3JjKTtcbn07XG5cbi8qKlxuICogUHJlcHJvY2Vzc2luZ1xuICovXG5cbkxleGVyLnByb3RvdHlwZS5sZXggPSBmdW5jdGlvbihzcmMpIHtcbiAgc3JjID0gc3JjXG4gICAgLnJlcGxhY2UoL1xcclxcbnxcXHIvZywgJ1xcbicpXG4gICAgLnJlcGxhY2UoL1xcdC9nLCAnICAgICcpXG4gICAgLnJlcGxhY2UoL1xcdTAwYTAvZywgJyAnKVxuICAgIC5yZXBsYWNlKC9cXHUyNDI0L2csICdcXG4nKTtcblxuICByZXR1cm4gdGhpcy50b2tlbihzcmMsIHRydWUpO1xufTtcblxuLyoqXG4gKiBMZXhpbmdcbiAqL1xuXG5MZXhlci5wcm90b3R5cGUudG9rZW4gPSBmdW5jdGlvbihzcmMsIHRvcCwgYnEpIHtcbiAgdmFyIHNyYyA9IHNyYy5yZXBsYWNlKC9eICskL2dtLCAnJylcbiAgICAsIG5leHRcbiAgICAsIGxvb3NlXG4gICAgLCBjYXBcbiAgICAsIGJ1bGxcbiAgICAsIGJcbiAgICAsIGl0ZW1cbiAgICAsIHNwYWNlXG4gICAgLCBpXG4gICAgLCBsO1xuXG4gIHdoaWxlIChzcmMpIHtcbiAgICAvLyBuZXdsaW5lXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubmV3bGluZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBpZiAoY2FwWzBdLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgICAgdHlwZTogJ3NwYWNlJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjb2RlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuY29kZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBjYXAgPSBjYXBbMF0ucmVwbGFjZSgvXiB7NH0vZ20sICcnKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnY29kZScsXG4gICAgICAgIHRleHQ6ICF0aGlzLm9wdGlvbnMucGVkYW50aWNcbiAgICAgICAgICA/IGNhcC5yZXBsYWNlKC9cXG4rJC8sICcnKVxuICAgICAgICAgIDogY2FwXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGZlbmNlcyAoZ2ZtKVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmZlbmNlcy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2NvZGUnLFxuICAgICAgICBsYW5nOiBjYXBbMl0sXG4gICAgICAgIHRleHQ6IGNhcFszXSB8fCAnJ1xuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBoZWFkaW5nXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuaGVhZGluZy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2hlYWRpbmcnLFxuICAgICAgICBkZXB0aDogY2FwWzFdLmxlbmd0aCxcbiAgICAgICAgdGV4dDogY2FwWzJdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRhYmxlIG5vIGxlYWRpbmcgcGlwZSAoZ2ZtKVxuICAgIGlmICh0b3AgJiYgKGNhcCA9IHRoaXMucnVsZXMubnB0YWJsZS5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuXG4gICAgICBpdGVtID0ge1xuICAgICAgICB0eXBlOiAndGFibGUnLFxuICAgICAgICBoZWFkZXI6IGNhcFsxXS5yZXBsYWNlKC9eICp8ICpcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGFsaWduOiBjYXBbMl0ucmVwbGFjZSgvXiAqfFxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgY2VsbHM6IGNhcFszXS5yZXBsYWNlKC9cXG4kLywgJycpLnNwbGl0KCdcXG4nKVxuICAgICAgfTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uYWxpZ24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKC9eICotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ3JpZ2h0JztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnY2VudGVyJztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdsZWZ0JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5jZWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVtLmNlbGxzW2ldID0gaXRlbS5jZWxsc1tpXS5zcGxpdCgvICpcXHwgKi8pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKGl0ZW0pO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsaGVhZGluZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmxoZWFkaW5nLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaGVhZGluZycsXG4gICAgICAgIGRlcHRoOiBjYXBbMl0gPT09ICc9JyA/IDEgOiAyLFxuICAgICAgICB0ZXh0OiBjYXBbMV1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gaHJcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5oci5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2hyJ1xuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBibG9ja3F1b3RlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuYmxvY2txdW90ZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnYmxvY2txdW90ZV9zdGFydCdcbiAgICAgIH0pO1xuXG4gICAgICBjYXAgPSBjYXBbMF0ucmVwbGFjZSgvXiAqPiA/L2dtLCAnJyk7XG5cbiAgICAgIC8vIFBhc3MgYHRvcGAgdG8ga2VlcCB0aGUgY3VycmVudFxuICAgICAgLy8gXCJ0b3BsZXZlbFwiIHN0YXRlLiBUaGlzIGlzIGV4YWN0bHlcbiAgICAgIC8vIGhvdyBtYXJrZG93bi5wbCB3b3Jrcy5cbiAgICAgIHRoaXMudG9rZW4oY2FwLCB0b3AsIHRydWUpO1xuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2Jsb2NrcXVvdGVfZW5kJ1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxpc3RcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5saXN0LmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGJ1bGwgPSBjYXBbMl07XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnbGlzdF9zdGFydCcsXG4gICAgICAgIG9yZGVyZWQ6IGJ1bGwubGVuZ3RoID4gMVxuICAgICAgfSk7XG5cbiAgICAgIC8vIEdldCBlYWNoIHRvcC1sZXZlbCBpdGVtLlxuICAgICAgY2FwID0gY2FwWzBdLm1hdGNoKHRoaXMucnVsZXMuaXRlbSk7XG5cbiAgICAgIG5leHQgPSBmYWxzZTtcbiAgICAgIGwgPSBjYXAubGVuZ3RoO1xuICAgICAgaSA9IDA7XG5cbiAgICAgIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGl0ZW0gPSBjYXBbaV07XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBsaXN0IGl0ZW0ncyBidWxsZXRcbiAgICAgICAgLy8gc28gaXQgaXMgc2VlbiBhcyB0aGUgbmV4dCB0b2tlbi5cbiAgICAgICAgc3BhY2UgPSBpdGVtLmxlbmd0aDtcbiAgICAgICAgaXRlbSA9IGl0ZW0ucmVwbGFjZSgvXiAqKFsqKy1dfFxcZCtcXC4pICsvLCAnJyk7XG5cbiAgICAgICAgLy8gT3V0ZGVudCB3aGF0ZXZlciB0aGVcbiAgICAgICAgLy8gbGlzdCBpdGVtIGNvbnRhaW5zLiBIYWNreS5cbiAgICAgICAgaWYgKH5pdGVtLmluZGV4T2YoJ1xcbiAnKSkge1xuICAgICAgICAgIHNwYWNlIC09IGl0ZW0ubGVuZ3RoO1xuICAgICAgICAgIGl0ZW0gPSAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgICAgICA/IGl0ZW0ucmVwbGFjZShuZXcgUmVnRXhwKCdeIHsxLCcgKyBzcGFjZSArICd9JywgJ2dtJyksICcnKVxuICAgICAgICAgICAgOiBpdGVtLnJlcGxhY2UoL14gezEsNH0vZ20sICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERldGVybWluZSB3aGV0aGVyIHRoZSBuZXh0IGxpc3QgaXRlbSBiZWxvbmdzIGhlcmUuXG4gICAgICAgIC8vIEJhY2twZWRhbCBpZiBpdCBkb2VzIG5vdCBiZWxvbmcgaW4gdGhpcyBsaXN0LlxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNtYXJ0TGlzdHMgJiYgaSAhPT0gbCAtIDEpIHtcbiAgICAgICAgICBiID0gYmxvY2suYnVsbGV0LmV4ZWMoY2FwW2kgKyAxXSlbMF07XG4gICAgICAgICAgaWYgKGJ1bGwgIT09IGIgJiYgIShidWxsLmxlbmd0aCA+IDEgJiYgYi5sZW5ndGggPiAxKSkge1xuICAgICAgICAgICAgc3JjID0gY2FwLnNsaWNlKGkgKyAxKS5qb2luKCdcXG4nKSArIHNyYztcbiAgICAgICAgICAgIGkgPSBsIC0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZXRlcm1pbmUgd2hldGhlciBpdGVtIGlzIGxvb3NlIG9yIG5vdC5cbiAgICAgICAgLy8gVXNlOiAvKF58XFxuKSg/ISApW15cXG5dK1xcblxcbig/IVxccyokKS9cbiAgICAgICAgLy8gZm9yIGRpc2NvdW50IGJlaGF2aW9yLlxuICAgICAgICBsb29zZSA9IG5leHQgfHwgL1xcblxcbig/IVxccyokKS8udGVzdChpdGVtKTtcbiAgICAgICAgaWYgKGkgIT09IGwgLSAxKSB7XG4gICAgICAgICAgbmV4dCA9IGl0ZW0uY2hhckF0KGl0ZW0ubGVuZ3RoIC0gMSkgPT09ICdcXG4nO1xuICAgICAgICAgIGlmICghbG9vc2UpIGxvb3NlID0gbmV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICAgIHR5cGU6IGxvb3NlXG4gICAgICAgICAgICA/ICdsb29zZV9pdGVtX3N0YXJ0J1xuICAgICAgICAgICAgOiAnbGlzdF9pdGVtX3N0YXJ0J1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSZWN1cnNlLlxuICAgICAgICB0aGlzLnRva2VuKGl0ZW0sIGZhbHNlLCBicSk7XG5cbiAgICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgICAgdHlwZTogJ2xpc3RfaXRlbV9lbmQnXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2xpc3RfZW5kJ1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGh0bWxcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5odG1sLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiB0aGlzLm9wdGlvbnMuc2FuaXRpemVcbiAgICAgICAgICA/ICdwYXJhZ3JhcGgnXG4gICAgICAgICAgOiAnaHRtbCcsXG4gICAgICAgIHByZTogIXRoaXMub3B0aW9ucy5zYW5pdGl6ZXJcbiAgICAgICAgICAmJiAoY2FwWzFdID09PSAncHJlJyB8fCBjYXBbMV0gPT09ICdzY3JpcHQnIHx8IGNhcFsxXSA9PT0gJ3N0eWxlJyksXG4gICAgICAgIHRleHQ6IGNhcFswXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBkZWZcbiAgICBpZiAoKCFicSAmJiB0b3ApICYmIChjYXAgPSB0aGlzLnJ1bGVzLmRlZi5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMubGlua3NbY2FwWzFdLnRvTG93ZXJDYXNlKCldID0ge1xuICAgICAgICBocmVmOiBjYXBbMl0sXG4gICAgICAgIHRpdGxlOiBjYXBbM11cbiAgICAgIH07XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0YWJsZSAoZ2ZtKVxuICAgIGlmICh0b3AgJiYgKGNhcCA9IHRoaXMucnVsZXMudGFibGUuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcblxuICAgICAgaXRlbSA9IHtcbiAgICAgICAgdHlwZTogJ3RhYmxlJyxcbiAgICAgICAgaGVhZGVyOiBjYXBbMV0ucmVwbGFjZSgvXiAqfCAqXFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBhbGlnbjogY2FwWzJdLnJlcGxhY2UoL14gKnxcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGNlbGxzOiBjYXBbM10ucmVwbGFjZSgvKD86ICpcXHwgKik/XFxuJC8sICcnKS5zcGxpdCgnXFxuJylcbiAgICAgIH07XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmFsaWduLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICgvXiAqLSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdyaWdodCc7XG4gICAgICAgIH0gZWxzZSBpZiAoL14gKjotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2NlbnRlcic7XG4gICAgICAgIH0gZWxzZSBpZiAoL14gKjotKyAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnbGVmdCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlbS5jZWxsc1tpXSA9IGl0ZW0uY2VsbHNbaV1cbiAgICAgICAgICAucmVwbGFjZSgvXiAqXFx8ICp8ICpcXHwgKiQvZywgJycpXG4gICAgICAgICAgLnNwbGl0KC8gKlxcfCAqLyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goaXRlbSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRvcC1sZXZlbCBwYXJhZ3JhcGhcbiAgICBpZiAodG9wICYmIChjYXAgPSB0aGlzLnJ1bGVzLnBhcmFncmFwaC5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdwYXJhZ3JhcGgnLFxuICAgICAgICB0ZXh0OiBjYXBbMV0uY2hhckF0KGNhcFsxXS5sZW5ndGggLSAxKSA9PT0gJ1xcbidcbiAgICAgICAgICA/IGNhcFsxXS5zbGljZSgwLCAtMSlcbiAgICAgICAgICA6IGNhcFsxXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0ZXh0XG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMudGV4dC5leGVjKHNyYykpIHtcbiAgICAgIC8vIFRvcC1sZXZlbCBzaG91bGQgbmV2ZXIgcmVhY2ggaGVyZS5cbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICB0ZXh0OiBjYXBbMF1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHNyYykge1xuICAgICAgdGhyb3cgbmV3XG4gICAgICAgIEVycm9yKCdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXMudG9rZW5zO1xufTtcblxuLyoqXG4gKiBJbmxpbmUtTGV2ZWwgR3JhbW1hclxuICovXG5cbnZhciBpbmxpbmUgPSB7XG4gIGVzY2FwZTogL15cXFxcKFtcXFxcYCp7fVxcW1xcXSgpIytcXC0uIV8+XSkvLFxuICBhdXRvbGluazogL148KFteIDw+XSsoQHw6XFwvKVteIDw+XSspPi8sXG4gIHVybDogbm9vcCxcbiAgdGFnOiAvXjwhLS1bXFxzXFxTXSo/LS0+fF48XFwvP1xcdysoPzpcIlteXCJdKlwifCdbXiddKid8W148J1wiPl0pKj8+LyxcbiAgbGluazogL14hP1xcWyhpbnNpZGUpXFxdXFwoaHJlZlxcKS8sXG4gIHJlZmxpbms6IC9eIT9cXFsoaW5zaWRlKVxcXVxccypcXFsoW15cXF1dKilcXF0vLFxuICBub2xpbms6IC9eIT9cXFsoKD86XFxbW15cXF1dKlxcXXxbXlxcW1xcXV0pKilcXF0vLFxuICBzdHJvbmc6IC9eX18oW1xcc1xcU10rPylfXyg/IV8pfF5cXCpcXCooW1xcc1xcU10rPylcXCpcXCooPyFcXCopLyxcbiAgZW06IC9eXFxiXygoPzpbXl9dfF9fKSs/KV9cXGJ8XlxcKigoPzpcXCpcXCp8W1xcc1xcU10pKz8pXFwqKD8hXFwqKS8sXG4gIGNvZGU6IC9eKGArKShbXFxzXFxTXSo/W15gXSlcXDEoPyFgKS8sXG4gIGJyOiAvXiB7Mix9XFxuKD8hXFxzKiQpLyxcbiAgZGVsOiBub29wLFxuICB0ZXh0OiAvXltcXHNcXFNdKz8oPz1bXFxcXDwhXFxbXypgXXwgezIsfVxcbnwkKS9cbn07XG5cbmlubGluZS5faW5zaWRlID0gLyg/OlxcW1teXFxdXSpcXF18XFxcXFtcXFtcXF1dfFteXFxbXFxdXXxcXF0oPz1bXlxcW10qXFxdKSkqLztcbmlubGluZS5faHJlZiA9IC9cXHMqPD8oW1xcc1xcU10qPyk+Pyg/OlxccytbJ1wiXShbXFxzXFxTXSo/KVsnXCJdKT9cXHMqLztcblxuaW5saW5lLmxpbmsgPSByZXBsYWNlKGlubGluZS5saW5rKVxuICAoJ2luc2lkZScsIGlubGluZS5faW5zaWRlKVxuICAoJ2hyZWYnLCBpbmxpbmUuX2hyZWYpXG4gICgpO1xuXG5pbmxpbmUucmVmbGluayA9IHJlcGxhY2UoaW5saW5lLnJlZmxpbmspXG4gICgnaW5zaWRlJywgaW5saW5lLl9pbnNpZGUpXG4gICgpO1xuXG4vKipcbiAqIE5vcm1hbCBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5ub3JtYWwgPSBtZXJnZSh7fSwgaW5saW5lKTtcblxuLyoqXG4gKiBQZWRhbnRpYyBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5wZWRhbnRpYyA9IG1lcmdlKHt9LCBpbmxpbmUubm9ybWFsLCB7XG4gIHN0cm9uZzogL15fXyg/PVxcUykoW1xcc1xcU10qP1xcUylfXyg/IV8pfF5cXCpcXCooPz1cXFMpKFtcXHNcXFNdKj9cXFMpXFwqXFwqKD8hXFwqKS8sXG4gIGVtOiAvXl8oPz1cXFMpKFtcXHNcXFNdKj9cXFMpXyg/IV8pfF5cXCooPz1cXFMpKFtcXHNcXFNdKj9cXFMpXFwqKD8hXFwqKS9cbn0pO1xuXG4vKipcbiAqIEdGTSBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5nZm0gPSBtZXJnZSh7fSwgaW5saW5lLm5vcm1hbCwge1xuICBlc2NhcGU6IHJlcGxhY2UoaW5saW5lLmVzY2FwZSkoJ10pJywgJ358XSknKSgpLFxuICB1cmw6IC9eKGh0dHBzPzpcXC9cXC9bXlxcczxdK1tePC4sOjtcIicpXFxdXFxzXSkvLFxuICBkZWw6IC9efn4oPz1cXFMpKFtcXHNcXFNdKj9cXFMpfn4vLFxuICB0ZXh0OiByZXBsYWNlKGlubGluZS50ZXh0KVxuICAgICgnXXwnLCAnfl18JylcbiAgICAoJ3wnLCAnfGh0dHBzPzovL3wnKVxuICAgICgpXG59KTtcblxuLyoqXG4gKiBHRk0gKyBMaW5lIEJyZWFrcyBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5icmVha3MgPSBtZXJnZSh7fSwgaW5saW5lLmdmbSwge1xuICBicjogcmVwbGFjZShpbmxpbmUuYnIpKCd7Mix9JywgJyonKSgpLFxuICB0ZXh0OiByZXBsYWNlKGlubGluZS5nZm0udGV4dCkoJ3syLH0nLCAnKicpKClcbn0pO1xuXG4vKipcbiAqIElubGluZSBMZXhlciAmIENvbXBpbGVyXG4gKi9cblxuZnVuY3Rpb24gSW5saW5lTGV4ZXIobGlua3MsIG9wdGlvbnMpIHtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBtYXJrZWQuZGVmYXVsdHM7XG4gIHRoaXMubGlua3MgPSBsaW5rcztcbiAgdGhpcy5ydWxlcyA9IGlubGluZS5ub3JtYWw7XG4gIHRoaXMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXIgfHwgbmV3IFJlbmRlcmVyO1xuICB0aGlzLnJlbmRlcmVyLm9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgaWYgKCF0aGlzLmxpbmtzKSB7XG4gICAgdGhyb3cgbmV3XG4gICAgICBFcnJvcignVG9rZW5zIGFycmF5IHJlcXVpcmVzIGEgYGxpbmtzYCBwcm9wZXJ0eS4nKTtcbiAgfVxuXG4gIGlmICh0aGlzLm9wdGlvbnMuZ2ZtKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5icmVha3MpIHtcbiAgICAgIHRoaXMucnVsZXMgPSBpbmxpbmUuYnJlYWtzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJ1bGVzID0gaW5saW5lLmdmbTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgdGhpcy5ydWxlcyA9IGlubGluZS5wZWRhbnRpYztcbiAgfVxufVxuXG4vKipcbiAqIEV4cG9zZSBJbmxpbmUgUnVsZXNcbiAqL1xuXG5JbmxpbmVMZXhlci5ydWxlcyA9IGlubGluZTtcblxuLyoqXG4gKiBTdGF0aWMgTGV4aW5nL0NvbXBpbGluZyBNZXRob2RcbiAqL1xuXG5JbmxpbmVMZXhlci5vdXRwdXQgPSBmdW5jdGlvbihzcmMsIGxpbmtzLCBvcHRpb25zKSB7XG4gIHZhciBpbmxpbmUgPSBuZXcgSW5saW5lTGV4ZXIobGlua3MsIG9wdGlvbnMpO1xuICByZXR1cm4gaW5saW5lLm91dHB1dChzcmMpO1xufTtcblxuLyoqXG4gKiBMZXhpbmcvQ29tcGlsaW5nXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLm91dHB1dCA9IGZ1bmN0aW9uKHNyYykge1xuICB2YXIgb3V0ID0gJydcbiAgICAsIGxpbmtcbiAgICAsIHRleHRcbiAgICAsIGhyZWZcbiAgICAsIGNhcDtcblxuICB3aGlsZSAoc3JjKSB7XG4gICAgLy8gZXNjYXBlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZXNjYXBlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSBjYXBbMV07XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBhdXRvbGlua1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmF1dG9saW5rLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGlmIChjYXBbMl0gPT09ICdAJykge1xuICAgICAgICB0ZXh0ID0gZXNjYXBlKFxuICAgICAgICAgIGNhcFsxXS5jaGFyQXQoNikgPT09ICc6J1xuICAgICAgICAgID8gdGhpcy5tYW5nbGUoY2FwWzFdLnN1YnN0cmluZyg3KSlcbiAgICAgICAgICA6IHRoaXMubWFuZ2xlKGNhcFsxXSlcbiAgICAgICAgKTtcbiAgICAgICAgaHJlZiA9IHRoaXMubWFuZ2xlKCdtYWlsdG86JykgKyB0ZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMV0pO1xuICAgICAgICBocmVmID0gdGV4dDtcbiAgICAgIH1cbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmxpbmsoaHJlZiwgbnVsbCwgdGV4dCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB1cmwgKGdmbSlcbiAgICBpZiAoIXRoaXMuaW5MaW5rICYmIChjYXAgPSB0aGlzLnJ1bGVzLnVybC5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMV0pO1xuICAgICAgaHJlZiA9IHRleHQ7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5saW5rKGhyZWYsIG51bGwsIHRleHQpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGFnXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMudGFnLmV4ZWMoc3JjKSkge1xuICAgICAgaWYgKCF0aGlzLmluTGluayAmJiAvXjxhIC9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICB0aGlzLmluTGluayA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaW5MaW5rICYmIC9ePFxcL2E+L2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMuaW5MaW5rID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICA/IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXJcbiAgICAgICAgICA/IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXIoY2FwWzBdKVxuICAgICAgICAgIDogZXNjYXBlKGNhcFswXSlcbiAgICAgICAgOiBjYXBbMF1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxpbmtcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5saW5rLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMuaW5MaW5rID0gdHJ1ZTtcbiAgICAgIG91dCArPSB0aGlzLm91dHB1dExpbmsoY2FwLCB7XG4gICAgICAgIGhyZWY6IGNhcFsyXSxcbiAgICAgICAgdGl0bGU6IGNhcFszXVxuICAgICAgfSk7XG4gICAgICB0aGlzLmluTGluayA9IGZhbHNlO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gcmVmbGluaywgbm9saW5rXG4gICAgaWYgKChjYXAgPSB0aGlzLnJ1bGVzLnJlZmxpbmsuZXhlYyhzcmMpKVxuICAgICAgICB8fCAoY2FwID0gdGhpcy5ydWxlcy5ub2xpbmsuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGxpbmsgPSAoY2FwWzJdIHx8IGNhcFsxXSkucmVwbGFjZSgvXFxzKy9nLCAnICcpO1xuICAgICAgbGluayA9IHRoaXMubGlua3NbbGluay50b0xvd2VyQ2FzZSgpXTtcbiAgICAgIGlmICghbGluayB8fCAhbGluay5ocmVmKSB7XG4gICAgICAgIG91dCArPSBjYXBbMF0uY2hhckF0KDApO1xuICAgICAgICBzcmMgPSBjYXBbMF0uc3Vic3RyaW5nKDEpICsgc3JjO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaW5MaW5rID0gdHJ1ZTtcbiAgICAgIG91dCArPSB0aGlzLm91dHB1dExpbmsoY2FwLCBsaW5rKTtcbiAgICAgIHRoaXMuaW5MaW5rID0gZmFsc2U7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBzdHJvbmdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5zdHJvbmcuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuc3Ryb25nKHRoaXMub3V0cHV0KGNhcFsyXSB8fCBjYXBbMV0pKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGVtXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZW0uZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuZW0odGhpcy5vdXRwdXQoY2FwWzJdIHx8IGNhcFsxXSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gY29kZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmNvZGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuY29kZXNwYW4oZXNjYXBlKGNhcFsyXS50cmltKCksIHRydWUpKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGJyXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuYnIuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuYnIoKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGRlbCAoZ2ZtKVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmRlbC5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5kZWwodGhpcy5vdXRwdXQoY2FwWzFdKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0ZXh0XG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMudGV4dC5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci50ZXh0KGVzY2FwZSh0aGlzLnNtYXJ0eXBhbnRzKGNhcFswXSkpKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChzcmMpIHtcbiAgICAgIHRocm93IG5ld1xuICAgICAgICBFcnJvcignSW5maW5pdGUgbG9vcCBvbiBieXRlOiAnICsgc3JjLmNoYXJDb2RlQXQoMCkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvbXBpbGUgTGlua1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5vdXRwdXRMaW5rID0gZnVuY3Rpb24oY2FwLCBsaW5rKSB7XG4gIHZhciBocmVmID0gZXNjYXBlKGxpbmsuaHJlZilcbiAgICAsIHRpdGxlID0gbGluay50aXRsZSA/IGVzY2FwZShsaW5rLnRpdGxlKSA6IG51bGw7XG5cbiAgcmV0dXJuIGNhcFswXS5jaGFyQXQoMCkgIT09ICchJ1xuICAgID8gdGhpcy5yZW5kZXJlci5saW5rKGhyZWYsIHRpdGxlLCB0aGlzLm91dHB1dChjYXBbMV0pKVxuICAgIDogdGhpcy5yZW5kZXJlci5pbWFnZShocmVmLCB0aXRsZSwgZXNjYXBlKGNhcFsxXSkpO1xufTtcblxuLyoqXG4gKiBTbWFydHlwYW50cyBUcmFuc2Zvcm1hdGlvbnNcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUuc21hcnR5cGFudHMgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIGlmICghdGhpcy5vcHRpb25zLnNtYXJ0eXBhbnRzKSByZXR1cm4gdGV4dDtcbiAgcmV0dXJuIHRleHRcbiAgICAvLyBlbS1kYXNoZXNcbiAgICAucmVwbGFjZSgvLS0tL2csICdcXHUyMDE0JylcbiAgICAvLyBlbi1kYXNoZXNcbiAgICAucmVwbGFjZSgvLS0vZywgJ1xcdTIwMTMnKVxuICAgIC8vIG9wZW5pbmcgc2luZ2xlc1xuICAgIC5yZXBsYWNlKC8oXnxbLVxcdTIwMTQvKFxcW3tcIlxcc10pJy9nLCAnJDFcXHUyMDE4JylcbiAgICAvLyBjbG9zaW5nIHNpbmdsZXMgJiBhcG9zdHJvcGhlc1xuICAgIC5yZXBsYWNlKC8nL2csICdcXHUyMDE5JylcbiAgICAvLyBvcGVuaW5nIGRvdWJsZXNcbiAgICAucmVwbGFjZSgvKF58Wy1cXHUyMDE0LyhcXFt7XFx1MjAxOFxcc10pXCIvZywgJyQxXFx1MjAxYycpXG4gICAgLy8gY2xvc2luZyBkb3VibGVzXG4gICAgLnJlcGxhY2UoL1wiL2csICdcXHUyMDFkJylcbiAgICAvLyBlbGxpcHNlc1xuICAgIC5yZXBsYWNlKC9cXC57M30vZywgJ1xcdTIwMjYnKTtcbn07XG5cbi8qKlxuICogTWFuZ2xlIExpbmtzXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLm1hbmdsZSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgaWYgKCF0aGlzLm9wdGlvbnMubWFuZ2xlKSByZXR1cm4gdGV4dDtcbiAgdmFyIG91dCA9ICcnXG4gICAgLCBsID0gdGV4dC5sZW5ndGhcbiAgICAsIGkgPSAwXG4gICAgLCBjaDtcblxuICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgIGNoID0gdGV4dC5jaGFyQ29kZUF0KGkpO1xuICAgIGlmIChNYXRoLnJhbmRvbSgpID4gMC41KSB7XG4gICAgICBjaCA9ICd4JyArIGNoLnRvU3RyaW5nKDE2KTtcbiAgICB9XG4gICAgb3V0ICs9ICcmIycgKyBjaCArICc7JztcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJlbmRlcmVyXG4gKi9cblxuZnVuY3Rpb24gUmVuZGVyZXIob3B0aW9ucykge1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xufVxuXG5SZW5kZXJlci5wcm90b3R5cGUuY29kZSA9IGZ1bmN0aW9uKGNvZGUsIGxhbmcsIGVzY2FwZWQpIHtcbiAgaWYgKHRoaXMub3B0aW9ucy5oaWdobGlnaHQpIHtcbiAgICB2YXIgb3V0ID0gdGhpcy5vcHRpb25zLmhpZ2hsaWdodChjb2RlLCBsYW5nKTtcbiAgICBpZiAob3V0ICE9IG51bGwgJiYgb3V0ICE9PSBjb2RlKSB7XG4gICAgICBlc2NhcGVkID0gdHJ1ZTtcbiAgICAgIGNvZGUgPSBvdXQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFsYW5nKSB7XG4gICAgcmV0dXJuICc8cHJlPjxjb2RlPidcbiAgICAgICsgKGVzY2FwZWQgPyBjb2RlIDogZXNjYXBlKGNvZGUsIHRydWUpKVxuICAgICAgKyAnXFxuPC9jb2RlPjwvcHJlPic7XG4gIH1cblxuICByZXR1cm4gJzxwcmU+PGNvZGUgY2xhc3M9XCInXG4gICAgKyB0aGlzLm9wdGlvbnMubGFuZ1ByZWZpeFxuICAgICsgZXNjYXBlKGxhbmcsIHRydWUpXG4gICAgKyAnXCI+J1xuICAgICsgKGVzY2FwZWQgPyBjb2RlIDogZXNjYXBlKGNvZGUsIHRydWUpKVxuICAgICsgJ1xcbjwvY29kZT48L3ByZT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmJsb2NrcXVvdGUgPSBmdW5jdGlvbihxdW90ZSkge1xuICByZXR1cm4gJzxibG9ja3F1b3RlPlxcbicgKyBxdW90ZSArICc8L2Jsb2NrcXVvdGU+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5odG1sID0gZnVuY3Rpb24oaHRtbCkge1xuICByZXR1cm4gaHRtbDtcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5oZWFkaW5nID0gZnVuY3Rpb24odGV4dCwgbGV2ZWwsIHJhdykge1xuICByZXR1cm4gJzxoJ1xuICAgICsgbGV2ZWxcbiAgICArICcgaWQ9XCInXG4gICAgKyB0aGlzLm9wdGlvbnMuaGVhZGVyUHJlZml4XG4gICAgKyByYXcudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXlxcd10rL2csICctJylcbiAgICArICdcIj4nXG4gICAgKyB0ZXh0XG4gICAgKyAnPC9oJ1xuICAgICsgbGV2ZWxcbiAgICArICc+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5ociA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5vcHRpb25zLnhodG1sID8gJzxoci8+XFxuJyA6ICc8aHI+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5saXN0ID0gZnVuY3Rpb24oYm9keSwgb3JkZXJlZCkge1xuICB2YXIgdHlwZSA9IG9yZGVyZWQgPyAnb2wnIDogJ3VsJztcbiAgcmV0dXJuICc8JyArIHR5cGUgKyAnPlxcbicgKyBib2R5ICsgJzwvJyArIHR5cGUgKyAnPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUubGlzdGl0ZW0gPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGxpPicgKyB0ZXh0ICsgJzwvbGk+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5wYXJhZ3JhcGggPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPHA+JyArIHRleHQgKyAnPC9wPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGFibGUgPSBmdW5jdGlvbihoZWFkZXIsIGJvZHkpIHtcbiAgcmV0dXJuICc8dGFibGU+XFxuJ1xuICAgICsgJzx0aGVhZD5cXG4nXG4gICAgKyBoZWFkZXJcbiAgICArICc8L3RoZWFkPlxcbidcbiAgICArICc8dGJvZHk+XFxuJ1xuICAgICsgYm9keVxuICAgICsgJzwvdGJvZHk+XFxuJ1xuICAgICsgJzwvdGFibGU+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50YWJsZXJvdyA9IGZ1bmN0aW9uKGNvbnRlbnQpIHtcbiAgcmV0dXJuICc8dHI+XFxuJyArIGNvbnRlbnQgKyAnPC90cj5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRhYmxlY2VsbCA9IGZ1bmN0aW9uKGNvbnRlbnQsIGZsYWdzKSB7XG4gIHZhciB0eXBlID0gZmxhZ3MuaGVhZGVyID8gJ3RoJyA6ICd0ZCc7XG4gIHZhciB0YWcgPSBmbGFncy5hbGlnblxuICAgID8gJzwnICsgdHlwZSArICcgc3R5bGU9XCJ0ZXh0LWFsaWduOicgKyBmbGFncy5hbGlnbiArICdcIj4nXG4gICAgOiAnPCcgKyB0eXBlICsgJz4nO1xuICByZXR1cm4gdGFnICsgY29udGVudCArICc8LycgKyB0eXBlICsgJz5cXG4nO1xufTtcblxuLy8gc3BhbiBsZXZlbCByZW5kZXJlclxuUmVuZGVyZXIucHJvdG90eXBlLnN0cm9uZyA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8c3Ryb25nPicgKyB0ZXh0ICsgJzwvc3Ryb25nPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuZW0gPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGVtPicgKyB0ZXh0ICsgJzwvZW0+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5jb2Rlc3BhbiA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8Y29kZT4nICsgdGV4dCArICc8L2NvZGU+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5iciA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5vcHRpb25zLnhodG1sID8gJzxici8+JyA6ICc8YnI+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5kZWwgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGRlbD4nICsgdGV4dCArICc8L2RlbD4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmxpbmsgPSBmdW5jdGlvbihocmVmLCB0aXRsZSwgdGV4dCkge1xuICBpZiAodGhpcy5vcHRpb25zLnNhbml0aXplKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBwcm90ID0gZGVjb2RlVVJJQ29tcG9uZW50KHVuZXNjYXBlKGhyZWYpKVxuICAgICAgICAucmVwbGFjZSgvW15cXHc6XS9nLCAnJylcbiAgICAgICAgLnRvTG93ZXJDYXNlKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIGlmIChwcm90LmluZGV4T2YoJ2phdmFzY3JpcHQ6JykgPT09IDAgfHwgcHJvdC5pbmRleE9mKCd2YnNjcmlwdDonKSA9PT0gMCB8fCBwcm90LmluZGV4T2YoJ2RhdGE6JykgPT09IDApIHtcbiAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgfVxuICBpZiAodGhpcy5vcHRpb25zLmJhc2VVcmwgJiYgIW9yaWdpbkluZGVwZW5kZW50VXJsLnRlc3QoaHJlZikpIHtcbiAgICBocmVmID0gcmVzb2x2ZVVybCh0aGlzLm9wdGlvbnMuYmFzZVVybCwgaHJlZik7XG4gIH1cbiAgdmFyIG91dCA9ICc8YSBocmVmPVwiJyArIGhyZWYgKyAnXCInO1xuICBpZiAodGl0bGUpIHtcbiAgICBvdXQgKz0gJyB0aXRsZT1cIicgKyB0aXRsZSArICdcIic7XG4gIH1cbiAgb3V0ICs9ICc+JyArIHRleHQgKyAnPC9hPic7XG4gIHJldHVybiBvdXQ7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaW1hZ2UgPSBmdW5jdGlvbihocmVmLCB0aXRsZSwgdGV4dCkge1xuICBpZiAodGhpcy5vcHRpb25zLmJhc2VVcmwgJiYgIW9yaWdpbkluZGVwZW5kZW50VXJsLnRlc3QoaHJlZikpIHtcbiAgICBocmVmID0gcmVzb2x2ZVVybCh0aGlzLm9wdGlvbnMuYmFzZVVybCwgaHJlZik7XG4gIH1cbiAgdmFyIG91dCA9ICc8aW1nIHNyYz1cIicgKyBocmVmICsgJ1wiIGFsdD1cIicgKyB0ZXh0ICsgJ1wiJztcbiAgaWYgKHRpdGxlKSB7XG4gICAgb3V0ICs9ICcgdGl0bGU9XCInICsgdGl0bGUgKyAnXCInO1xuICB9XG4gIG91dCArPSB0aGlzLm9wdGlvbnMueGh0bWwgPyAnLz4nIDogJz4nO1xuICByZXR1cm4gb3V0O1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRleHQgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiB0ZXh0O1xufTtcblxuLyoqXG4gKiBQYXJzaW5nICYgQ29tcGlsaW5nXG4gKi9cblxuZnVuY3Rpb24gUGFyc2VyKG9wdGlvbnMpIHtcbiAgdGhpcy50b2tlbnMgPSBbXTtcbiAgdGhpcy50b2tlbiA9IG51bGw7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgbWFya2VkLmRlZmF1bHRzO1xuICB0aGlzLm9wdGlvbnMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXIgfHwgbmV3IFJlbmRlcmVyO1xuICB0aGlzLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyO1xuICB0aGlzLnJlbmRlcmVyLm9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG59XG5cbi8qKlxuICogU3RhdGljIFBhcnNlIE1ldGhvZFxuICovXG5cblBhcnNlci5wYXJzZSA9IGZ1bmN0aW9uKHNyYywgb3B0aW9ucywgcmVuZGVyZXIpIHtcbiAgdmFyIHBhcnNlciA9IG5ldyBQYXJzZXIob3B0aW9ucywgcmVuZGVyZXIpO1xuICByZXR1cm4gcGFyc2VyLnBhcnNlKHNyYyk7XG59O1xuXG4vKipcbiAqIFBhcnNlIExvb3BcbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oc3JjKSB7XG4gIHRoaXMuaW5saW5lID0gbmV3IElubGluZUxleGVyKHNyYy5saW5rcywgdGhpcy5vcHRpb25zLCB0aGlzLnJlbmRlcmVyKTtcbiAgdGhpcy50b2tlbnMgPSBzcmMucmV2ZXJzZSgpO1xuXG4gIHZhciBvdXQgPSAnJztcbiAgd2hpbGUgKHRoaXMubmV4dCgpKSB7XG4gICAgb3V0ICs9IHRoaXMudG9rKCk7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBOZXh0IFRva2VuXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnRva2VuID0gdGhpcy50b2tlbnMucG9wKCk7XG59O1xuXG4vKipcbiAqIFByZXZpZXcgTmV4dCBUb2tlblxuICovXG5cblBhcnNlci5wcm90b3R5cGUucGVlayA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy50b2tlbnNbdGhpcy50b2tlbnMubGVuZ3RoIC0gMV0gfHwgMDtcbn07XG5cbi8qKlxuICogUGFyc2UgVGV4dCBUb2tlbnNcbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnBhcnNlVGV4dCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgYm9keSA9IHRoaXMudG9rZW4udGV4dDtcblxuICB3aGlsZSAodGhpcy5wZWVrKCkudHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgYm9keSArPSAnXFxuJyArIHRoaXMubmV4dCgpLnRleHQ7XG4gIH1cblxuICByZXR1cm4gdGhpcy5pbmxpbmUub3V0cHV0KGJvZHkpO1xufTtcblxuLyoqXG4gKiBQYXJzZSBDdXJyZW50IFRva2VuXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS50b2sgPSBmdW5jdGlvbigpIHtcbiAgc3dpdGNoICh0aGlzLnRva2VuLnR5cGUpIHtcbiAgICBjYXNlICdzcGFjZSc6IHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgY2FzZSAnaHInOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5ocigpO1xuICAgIH1cbiAgICBjYXNlICdoZWFkaW5nJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuaGVhZGluZyhcbiAgICAgICAgdGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4udGV4dCksXG4gICAgICAgIHRoaXMudG9rZW4uZGVwdGgsXG4gICAgICAgIHRoaXMudG9rZW4udGV4dCk7XG4gICAgfVxuICAgIGNhc2UgJ2NvZGUnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5jb2RlKHRoaXMudG9rZW4udGV4dCxcbiAgICAgICAgdGhpcy50b2tlbi5sYW5nLFxuICAgICAgICB0aGlzLnRva2VuLmVzY2FwZWQpO1xuICAgIH1cbiAgICBjYXNlICd0YWJsZSc6IHtcbiAgICAgIHZhciBoZWFkZXIgPSAnJ1xuICAgICAgICAsIGJvZHkgPSAnJ1xuICAgICAgICAsIGlcbiAgICAgICAgLCByb3dcbiAgICAgICAgLCBjZWxsXG4gICAgICAgICwgZmxhZ3NcbiAgICAgICAgLCBqO1xuXG4gICAgICAvLyBoZWFkZXJcbiAgICAgIGNlbGwgPSAnJztcbiAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnRva2VuLmhlYWRlci5sZW5ndGg7IGkrKykge1xuICAgICAgICBmbGFncyA9IHsgaGVhZGVyOiB0cnVlLCBhbGlnbjogdGhpcy50b2tlbi5hbGlnbltpXSB9O1xuICAgICAgICBjZWxsICs9IHRoaXMucmVuZGVyZXIudGFibGVjZWxsKFxuICAgICAgICAgIHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLmhlYWRlcltpXSksXG4gICAgICAgICAgeyBoZWFkZXI6IHRydWUsIGFsaWduOiB0aGlzLnRva2VuLmFsaWduW2ldIH1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGhlYWRlciArPSB0aGlzLnJlbmRlcmVyLnRhYmxlcm93KGNlbGwpO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy50b2tlbi5jZWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgICByb3cgPSB0aGlzLnRva2VuLmNlbGxzW2ldO1xuXG4gICAgICAgIGNlbGwgPSAnJztcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IHJvdy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGNlbGwgKz0gdGhpcy5yZW5kZXJlci50YWJsZWNlbGwoXG4gICAgICAgICAgICB0aGlzLmlubGluZS5vdXRwdXQocm93W2pdKSxcbiAgICAgICAgICAgIHsgaGVhZGVyOiBmYWxzZSwgYWxpZ246IHRoaXMudG9rZW4uYWxpZ25bal0gfVxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBib2R5ICs9IHRoaXMucmVuZGVyZXIudGFibGVyb3coY2VsbCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci50YWJsZShoZWFkZXIsIGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdibG9ja3F1b3RlX3N0YXJ0Jzoge1xuICAgICAgdmFyIGJvZHkgPSAnJztcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdibG9ja3F1b3RlX2VuZCcpIHtcbiAgICAgICAgYm9keSArPSB0aGlzLnRvaygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5ibG9ja3F1b3RlKGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdsaXN0X3N0YXJ0Jzoge1xuICAgICAgdmFyIGJvZHkgPSAnJ1xuICAgICAgICAsIG9yZGVyZWQgPSB0aGlzLnRva2VuLm9yZGVyZWQ7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnbGlzdF9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIubGlzdChib2R5LCBvcmRlcmVkKTtcbiAgICB9XG4gICAgY2FzZSAnbGlzdF9pdGVtX3N0YXJ0Jzoge1xuICAgICAgdmFyIGJvZHkgPSAnJztcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdsaXN0X2l0ZW1fZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rZW4udHlwZSA9PT0gJ3RleHQnXG4gICAgICAgICAgPyB0aGlzLnBhcnNlVGV4dCgpXG4gICAgICAgICAgOiB0aGlzLnRvaygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5saXN0aXRlbShib2R5KTtcbiAgICB9XG4gICAgY2FzZSAnbG9vc2VfaXRlbV9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJyc7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnbGlzdF9pdGVtX2VuZCcpIHtcbiAgICAgICAgYm9keSArPSB0aGlzLnRvaygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5saXN0aXRlbShib2R5KTtcbiAgICB9XG4gICAgY2FzZSAnaHRtbCc6IHtcbiAgICAgIHZhciBodG1sID0gIXRoaXMudG9rZW4ucHJlICYmICF0aGlzLm9wdGlvbnMucGVkYW50aWNcbiAgICAgICAgPyB0aGlzLmlubGluZS5vdXRwdXQodGhpcy50b2tlbi50ZXh0KVxuICAgICAgICA6IHRoaXMudG9rZW4udGV4dDtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmh0bWwoaHRtbCk7XG4gICAgfVxuICAgIGNhc2UgJ3BhcmFncmFwaCc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnBhcmFncmFwaCh0aGlzLmlubGluZS5vdXRwdXQodGhpcy50b2tlbi50ZXh0KSk7XG4gICAgfVxuICAgIGNhc2UgJ3RleHQnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5wYXJhZ3JhcGgodGhpcy5wYXJzZVRleHQoKSk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEhlbHBlcnNcbiAqL1xuXG5mdW5jdGlvbiBlc2NhcGUoaHRtbCwgZW5jb2RlKSB7XG4gIHJldHVybiBodG1sXG4gICAgLnJlcGxhY2UoIWVuY29kZSA/IC8mKD8hIz9cXHcrOykvZyA6IC8mL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgLnJlcGxhY2UoLycvZywgJyYjMzk7Jyk7XG59XG5cbmZ1bmN0aW9uIHVuZXNjYXBlKGh0bWwpIHtcblx0Ly8gZXhwbGljaXRseSBtYXRjaCBkZWNpbWFsLCBoZXgsIGFuZCBuYW1lZCBIVE1MIGVudGl0aWVzXG4gIHJldHVybiBodG1sLnJlcGxhY2UoLyYoIyg/OlxcZCspfCg/OiN4WzAtOUEtRmEtZl0rKXwoPzpcXHcrKSk7Py9pZywgZnVuY3Rpb24oXywgbikge1xuICAgIG4gPSBuLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKG4gPT09ICdjb2xvbicpIHJldHVybiAnOic7XG4gICAgaWYgKG4uY2hhckF0KDApID09PSAnIycpIHtcbiAgICAgIHJldHVybiBuLmNoYXJBdCgxKSA9PT0gJ3gnXG4gICAgICAgID8gU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChuLnN1YnN0cmluZygyKSwgMTYpKVxuICAgICAgICA6IFN0cmluZy5mcm9tQ2hhckNvZGUoK24uc3Vic3RyaW5nKDEpKTtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZShyZWdleCwgb3B0KSB7XG4gIHJlZ2V4ID0gcmVnZXguc291cmNlO1xuICBvcHQgPSBvcHQgfHwgJyc7XG4gIHJldHVybiBmdW5jdGlvbiBzZWxmKG5hbWUsIHZhbCkge1xuICAgIGlmICghbmFtZSkgcmV0dXJuIG5ldyBSZWdFeHAocmVnZXgsIG9wdCk7XG4gICAgdmFsID0gdmFsLnNvdXJjZSB8fCB2YWw7XG4gICAgdmFsID0gdmFsLnJlcGxhY2UoLyhefFteXFxbXSlcXF4vZywgJyQxJyk7XG4gICAgcmVnZXggPSByZWdleC5yZXBsYWNlKG5hbWUsIHZhbCk7XG4gICAgcmV0dXJuIHNlbGY7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVVcmwoYmFzZSwgaHJlZikge1xuICBpZiAoIWJhc2VVcmxzWycgJyArIGJhc2VdKSB7XG4gICAgLy8gd2UgY2FuIGlnbm9yZSBldmVyeXRoaW5nIGluIGJhc2UgYWZ0ZXIgdGhlIGxhc3Qgc2xhc2ggb2YgaXRzIHBhdGggY29tcG9uZW50LFxuICAgIC8vIGJ1dCB3ZSBtaWdodCBuZWVkIHRvIGFkZCBfdGhhdF9cbiAgICAvLyBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NiNzZWN0aW9uLTNcbiAgICBpZiAoL15bXjpdKzpcXC8qW14vXSokLy50ZXN0KGJhc2UpKSB7XG4gICAgICBiYXNlVXJsc1snICcgKyBiYXNlXSA9IGJhc2UgKyAnLyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJhc2VVcmxzWycgJyArIGJhc2VdID0gYmFzZS5yZXBsYWNlKC9bXi9dKiQvLCAnJyk7XG4gICAgfVxuICB9XG4gIGJhc2UgPSBiYXNlVXJsc1snICcgKyBiYXNlXTtcblxuICBpZiAoaHJlZi5zbGljZSgwLCAyKSA9PT0gJy8vJykge1xuICAgIHJldHVybiBiYXNlLnJlcGxhY2UoLzpbXFxzXFxTXSovLCAnOicpICsgaHJlZjtcbiAgfSBlbHNlIGlmIChocmVmLmNoYXJBdCgwKSA9PT0gJy8nKSB7XG4gICAgcmV0dXJuIGJhc2UucmVwbGFjZSgvKDpcXC8qW14vXSopW1xcc1xcU10qLywgJyQxJykgKyBocmVmO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlICsgaHJlZjtcbiAgfVxufVxudmFyIGJhc2VVcmxzID0ge307XG52YXIgb3JpZ2luSW5kZXBlbmRlbnRVcmwgPSAvXiR8XlthLXpdW2EtejAtOSsuLV0qOnxeWz8jXS9pO1xuXG5mdW5jdGlvbiBub29wKCkge31cbm5vb3AuZXhlYyA9IG5vb3A7XG5cbmZ1bmN0aW9uIG1lcmdlKG9iaikge1xuICB2YXIgaSA9IDFcbiAgICAsIHRhcmdldFxuICAgICwga2V5O1xuXG4gIGZvciAoOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdGFyZ2V0ID0gYXJndW1lbnRzW2ldO1xuICAgIGZvciAoa2V5IGluIHRhcmdldCkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0YXJnZXQsIGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSB0YXJnZXRba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG5cbi8qKlxuICogTWFya2VkXG4gKi9cblxuZnVuY3Rpb24gbWFya2VkKHNyYywgb3B0LCBjYWxsYmFjaykge1xuICBpZiAoY2FsbGJhY2sgfHwgdHlwZW9mIG9wdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrID0gb3B0O1xuICAgICAgb3B0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBvcHQgPSBtZXJnZSh7fSwgbWFya2VkLmRlZmF1bHRzLCBvcHQgfHwge30pO1xuXG4gICAgdmFyIGhpZ2hsaWdodCA9IG9wdC5oaWdobGlnaHRcbiAgICAgICwgdG9rZW5zXG4gICAgICAsIHBlbmRpbmdcbiAgICAgICwgaSA9IDA7XG5cbiAgICB0cnkge1xuICAgICAgdG9rZW5zID0gTGV4ZXIubGV4KHNyYywgb3B0KVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlKTtcbiAgICB9XG5cbiAgICBwZW5kaW5nID0gdG9rZW5zLmxlbmd0aDtcblxuICAgIHZhciBkb25lID0gZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIG9wdC5oaWdobGlnaHQgPSBoaWdobGlnaHQ7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgfVxuXG4gICAgICB2YXIgb3V0O1xuXG4gICAgICB0cnkge1xuICAgICAgICBvdXQgPSBQYXJzZXIucGFyc2UodG9rZW5zLCBvcHQpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBlcnIgPSBlO1xuICAgICAgfVxuXG4gICAgICBvcHQuaGlnaGxpZ2h0ID0gaGlnaGxpZ2h0O1xuXG4gICAgICByZXR1cm4gZXJyXG4gICAgICAgID8gY2FsbGJhY2soZXJyKVxuICAgICAgICA6IGNhbGxiYWNrKG51bGwsIG91dCk7XG4gICAgfTtcblxuICAgIGlmICghaGlnaGxpZ2h0IHx8IGhpZ2hsaWdodC5sZW5ndGggPCAzKSB7XG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH1cblxuICAgIGRlbGV0ZSBvcHQuaGlnaGxpZ2h0O1xuXG4gICAgaWYgKCFwZW5kaW5nKSByZXR1cm4gZG9uZSgpO1xuXG4gICAgZm9yICg7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIChmdW5jdGlvbih0b2tlbikge1xuICAgICAgICBpZiAodG9rZW4udHlwZSAhPT0gJ2NvZGUnKSB7XG4gICAgICAgICAgcmV0dXJuIC0tcGVuZGluZyB8fCBkb25lKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhpZ2hsaWdodCh0b2tlbi50ZXh0LCB0b2tlbi5sYW5nLCBmdW5jdGlvbihlcnIsIGNvZGUpIHtcbiAgICAgICAgICBpZiAoZXJyKSByZXR1cm4gZG9uZShlcnIpO1xuICAgICAgICAgIGlmIChjb2RlID09IG51bGwgfHwgY29kZSA9PT0gdG9rZW4udGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIC0tcGVuZGluZyB8fCBkb25lKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRva2VuLnRleHQgPSBjb2RlO1xuICAgICAgICAgIHRva2VuLmVzY2FwZWQgPSB0cnVlO1xuICAgICAgICAgIC0tcGVuZGluZyB8fCBkb25lKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSkodG9rZW5zW2ldKTtcbiAgICB9XG5cbiAgICByZXR1cm47XG4gIH1cbiAgdHJ5IHtcbiAgICBpZiAob3B0KSBvcHQgPSBtZXJnZSh7fSwgbWFya2VkLmRlZmF1bHRzLCBvcHQpO1xuICAgIHJldHVybiBQYXJzZXIucGFyc2UoTGV4ZXIubGV4KHNyYywgb3B0KSwgb3B0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGUubWVzc2FnZSArPSAnXFxuUGxlYXNlIHJlcG9ydCB0aGlzIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9jaGpqL21hcmtlZC4nO1xuICAgIGlmICgob3B0IHx8IG1hcmtlZC5kZWZhdWx0cykuc2lsZW50KSB7XG4gICAgICByZXR1cm4gJzxwPkFuIGVycm9yIG9jY3VycmVkOjwvcD48cHJlPidcbiAgICAgICAgKyBlc2NhcGUoZS5tZXNzYWdlICsgJycsIHRydWUpXG4gICAgICAgICsgJzwvcHJlPic7XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH1cbn1cblxuLyoqXG4gKiBPcHRpb25zXG4gKi9cblxubWFya2VkLm9wdGlvbnMgPVxubWFya2VkLnNldE9wdGlvbnMgPSBmdW5jdGlvbihvcHQpIHtcbiAgbWVyZ2UobWFya2VkLmRlZmF1bHRzLCBvcHQpO1xuICByZXR1cm4gbWFya2VkO1xufTtcblxubWFya2VkLmRlZmF1bHRzID0ge1xuICBnZm06IHRydWUsXG4gIHRhYmxlczogdHJ1ZSxcbiAgYnJlYWtzOiBmYWxzZSxcbiAgcGVkYW50aWM6IGZhbHNlLFxuICBzYW5pdGl6ZTogZmFsc2UsXG4gIHNhbml0aXplcjogbnVsbCxcbiAgbWFuZ2xlOiB0cnVlLFxuICBzbWFydExpc3RzOiBmYWxzZSxcbiAgc2lsZW50OiBmYWxzZSxcbiAgaGlnaGxpZ2h0OiBudWxsLFxuICBsYW5nUHJlZml4OiAnbGFuZy0nLFxuICBzbWFydHlwYW50czogZmFsc2UsXG4gIGhlYWRlclByZWZpeDogJycsXG4gIHJlbmRlcmVyOiBuZXcgUmVuZGVyZXIsXG4gIHhodG1sOiBmYWxzZSxcbiAgYmFzZVVybDogbnVsbFxufTtcblxuLyoqXG4gKiBFeHBvc2VcbiAqL1xuXG5tYXJrZWQuUGFyc2VyID0gUGFyc2VyO1xubWFya2VkLnBhcnNlciA9IFBhcnNlci5wYXJzZTtcblxubWFya2VkLlJlbmRlcmVyID0gUmVuZGVyZXI7XG5cbm1hcmtlZC5MZXhlciA9IExleGVyO1xubWFya2VkLmxleGVyID0gTGV4ZXIubGV4O1xuXG5tYXJrZWQuSW5saW5lTGV4ZXIgPSBJbmxpbmVMZXhlcjtcbm1hcmtlZC5pbmxpbmVMZXhlciA9IElubGluZUxleGVyLm91dHB1dDtcblxubWFya2VkLnBhcnNlID0gbWFya2VkO1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gbWFya2VkO1xufSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gbWFya2VkOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMubWFya2VkID0gbWFya2VkO1xufVxuXG59KS5jYWxsKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcyB8fCAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBnbG9iYWwpO1xufSgpKTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL21hcmtlZC9saWIvbWFya2VkLmpzXG4vLyBtb2R1bGUgaWQgPSAyMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZztcclxuXHJcbi8vIFRoaXMgd29ya3MgaW4gbm9uLXN0cmljdCBtb2RlXHJcbmcgPSAoZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIHRoaXM7XHJcbn0pKCk7XHJcblxyXG50cnkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgZXZhbCBpcyBhbGxvd2VkIChzZWUgQ1NQKVxyXG5cdGcgPSBnIHx8IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSB8fCAoMSxldmFsKShcInRoaXNcIik7XHJcbn0gY2F0Y2goZSkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgdGhlIHdpbmRvdyByZWZlcmVuY2UgaXMgYXZhaWxhYmxlXHJcblx0aWYodHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIilcclxuXHRcdGcgPSB3aW5kb3c7XHJcbn1cclxuXHJcbi8vIGcgY2FuIHN0aWxsIGJlIHVuZGVmaW5lZCwgYnV0IG5vdGhpbmcgdG8gZG8gYWJvdXQgaXQuLi5cclxuLy8gV2UgcmV0dXJuIHVuZGVmaW5lZCwgaW5zdGVhZCBvZiBub3RoaW5nIGhlcmUsIHNvIGl0J3NcclxuLy8gZWFzaWVyIHRvIGhhbmRsZSB0aGlzIGNhc2UuIGlmKCFnbG9iYWwpIHsgLi4ufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBnO1xyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAod2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanNcbi8vIG1vZHVsZSBpZCA9IDIzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImRlZiBzaHVmZmxlIGFycmF5XG5cdHZhciBjb3VudGVyID0gYXJyYXk6bGVuZ3RoLCB0ZW1wLCBpbmRleFxuXG5cdCMgV2hpbGUgdGhlcmUgYXJlIGVsZW1lbnRzIGluIHRoZSBhcnJheVxuXHR3aGlsZSBjb3VudGVyID4gMFxuXHRcdCMgUGljayBhIHJhbmRvbSBpbmRleFxuXHRcdGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSAqIGNvdW50ZXIpXG5cdFx0Y291bnRlci0tICMgRGVjcmVhc2UgY291bnRlciBieSAxXG5cdFx0IyBBbmQgc3dhcCB0aGUgbGFzdCBlbGVtZW50IHdpdGggaXRcblx0XHR0ZW1wID0gYXJyYXlbY291bnRlcl1cblx0XHRhcnJheVtjb3VudGVyXSA9IGFycmF5W2luZGV4XVxuXHRcdGFycmF5W2luZGV4XSA9IHRlbXBcblx0XG5cdHJldHVybiBhcnJheVxuXG5leHBvcnQgdGFnIFBhdHRlcm5cblxuXHRkZWYgc2V0dXBcblx0XHRyZXR1cm4gc2VsZiBpZiAkbm9kZSRcblx0XHR2YXIgcGFydHMgPSB7dGFnczogW10sIGtleXdvcmRzOiBbXSwgbWV0aG9kczogW119XG5cdFx0dmFyIGl0ZW1zID0gW11cblx0XHR2YXIgbGluZXMgPSBbXVxuXG5cdFx0Zm9yIG93biBrLHYgb2YgSW1iYS5UYWc6cHJvdG90eXBlXG5cdFx0XHRpdGVtcy5wdXNoKFwiPGVtPntrfTwvZW0+XCIpXG5cdFx0XHRwYXJ0czptZXRob2RzLnB1c2goXCI8ZW0+e2t9PC9lbT5cIilcblxuXHRcdGZvciBrIGluIEltYmEuSFRNTF9UQUdTIG9yIEhUTUxfVEFHU1xuXHRcdFx0aXRlbXMucHVzaChcIjx1PiZsdDt7a30mZ3Q7PC91PlwiKVxuXHRcdFx0cGFydHM6dGFncy5wdXNoKFwiPHU+Jmx0O3trfSZndDs8L3U+XCIpXG5cblx0XHR2YXIgd29yZHMgPSBcImRlZiBpZiBlbHNlIGVsaWYgd2hpbGUgdW50aWwgZm9yIGluIG9mIHZhciBsZXQgY2xhc3MgZXh0ZW5kIGV4cG9ydCBpbXBvcnQgdGFnIGdsb2JhbFwiXG5cblx0XHRmb3IgayBpbiB3b3Jkcy5zcGxpdChcIiBcIilcblx0XHRcdGl0ZW1zLnB1c2goXCI8aT57a308L2k+XCIpXG5cdFx0XHRwYXJ0czprZXl3b3Jkcy5wdXNoKFwiPGk+e2t9PC9pPlwiKVxuXG5cdFx0dmFyIHNodWZmbGVkID0gc2h1ZmZsZShpdGVtcylcblx0XHR2YXIgYWxsID0gW10uY29uY2F0KHNodWZmbGVkKVxuXHRcdHZhciBjb3VudCA9IGl0ZW1zOmxlbmd0aCAtIDFcblxuXHRcdGZvciBsbiBpbiBbMCAuLiAxNF1cblx0XHRcdGxldCBjaGFycyA9IDBcblx0XHRcdGxpbmVzW2xuXSA9IFtdXG5cdFx0XHR3aGlsZSBjaGFycyA8IDMwMFxuXHRcdFx0XHRsZXQgaXRlbSA9IChzaHVmZmxlZC5wb3Agb3IgYWxsW01hdGguZmxvb3IoY291bnQgKiBNYXRoLnJhbmRvbSldKVxuXHRcdFx0XHRpZiBpdGVtXG5cdFx0XHRcdFx0Y2hhcnMgKz0gaXRlbTpsZW5ndGhcblx0XHRcdFx0XHRsaW5lc1tsbl0ucHVzaChpdGVtKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0Y2hhcnMgPSA0MDBcblxuXHRcdGRvbTppbm5lckhUTUwgPSAnPGRpdj4nICsgbGluZXMubWFwKHxsbixpfFxuXHRcdFx0bGV0IG8gPSBNYXRoLm1heCgwLCgoaSAtIDIpICogMC4zIC8gMTQpKS50b0ZpeGVkKDIpXG5cdFx0XHRcIjxkaXYgY2xhc3M9J2xpbmUnIHN0eWxlPSdvcGFjaXR5OiB7b307Jz5cIiArIGxuLmpvaW4oXCIgXCIpICsgJzwvZGl2Pidcblx0XHQpLmpvaW4oJycpICsgJzwvZGl2Pidcblx0XHRzZWxmXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL1BhdHRlcm4uaW1iYSIsImltcG9ydCBQYWdlIGZyb20gJy4vUGFnZSdcblxudGFnIEd1aWRlVE9DXG5cdHByb3AgdG9jXG5cdGF0dHIgbGV2ZWxcblxuXHRkZWYgdG9nZ2xlXG5cdFx0dG9nZ2xlRmxhZygnY29sbGFwc2VkJylcblx0XHRcblx0ZGVmIHRvY1xuXHRcdEB0b2Mgb3IgZGF0YS50b2Ncblx0XHRcblx0ZGVmIHJvdXRlXG5cdFx0XCJ7ZGF0YS5wYXRofSN7dG9jOnNsdWd9XCJcdFx0XG5cdFx0XG5cdGRlZiByZW5kZXJcblx0XHRyZXR1cm4gc2VsZiB1bmxlc3MgZGF0YS5yZWFkeVxuXG5cdFx0bGV0IHRvYyA9IHRvY1xuXHRcdHJlcm91dGVcblx0XG5cdFx0PHNlbGYudG9jLmVudHJ5IGxldmVsPSh0b2M6bGV2ZWwpPlxuXHRcdFx0aWYgdG9jOmNoaWxkcmVuOmxlbmd0aCBhbmQgdG9jOmxldmVsIDwgM1xuXHRcdFx0XHQ8LmhlYWRlcj5cblx0XHRcdFx0XHQ8YSBocmVmPXJvdXRlPiB0b2M6dGl0bGVcblx0XHRcdFx0PC5jb250ZW50PlxuXHRcdFx0XHRcdGZvciBjaGlsZCBpbiB0b2M6Y2hpbGRyZW5cblx0XHRcdFx0XHRcdCMgPGRpdj4gXCJJdGVtXCJcblx0XHRcdFx0XHRcdDxHdWlkZVRPQ1tkYXRhXSB0b2M9Y2hpbGQ+XG5cdFx0XHRlbHNlXG5cdFx0XHRcdDxhIGhyZWY9cm91dGU+IHRvYzp0aXRsZVxuXG50YWcgR3VpZGVcblx0ZGVmIHJlbmRlclxuXHRcdHJldHVybiBzZWxmIHVubGVzcyBkYXRhPy5yZWFkeVxuXHRcdCMgcmVhbGx5IHJlbmRlciB3aXRob3V0IGltYmE/XG5cdFx0PHNlbGYubWQgYm9keT1kYXRhLmJvZHk+XG5cblx0ZGVmIGJvZHk9IGJvZHlcblx0XHRpZiBib2R5ICE9IEBib2R5XG5cdFx0XHRAYm9keSA9IGJvZHlcblx0XHRcdGRvbTppbm5lckhUTUwgPSBib2R5XG5cdFx0c2VsZlxuXG5leHBvcnQgdGFnIEd1aWRlc1BhZ2UgPCBQYWdlXG5cdFxuXHRkZWYgbW91bnRcblx0XHRjb25zb2xlLmxvZyBcIkd1aWRlc1BhZ2UgbW91bnRlZFwiXG5cdFx0QG9uc2Nyb2xsIHx8PSBkbyBzY3JvbGxlZFxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLEBvbnNjcm9sbCxwYXNzaXZlOiB0cnVlKVxuXHRcdCMgRG9jLmdldChyb3V0ZXIucGF0aCwnbWQnKVxuXHRcdFxuXHRkZWYgdW5tb3VudFxuXHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLEBvbnNjcm9sbCxwYXNzaXZlOiB0cnVlKVxuXHRcdFxuXHRkZWYgZ3VpZGVcblx0XHRhcHAuZG9jKHJvdXRlci5wYXRoICsgJy5tZCcpXG5cdFx0XG5cdGRlZiBzY3JvbGxlZFxuXHRcdHZhciBpdGVtcyA9IGRvbS5xdWVyeVNlbGVjdG9yQWxsKCdbaWRdJylcblx0XHR2YXIgbWF0Y2hcblxuXHRcdHZhciBzY3JvbGxUb3AgPSB3aW5kb3c6cGFnZVlPZmZzZXRcblx0XHR2YXIgd2ggPSB3aW5kb3c6aW5uZXJIZWlnaHRcblx0XHR2YXIgZGggPSBkb2N1bWVudDpib2R5OnNjcm9sbEhlaWdodFxuXG5cdFx0aWYgQHNjcm9sbEZyZWV6ZSA+PSAwXG5cdFx0XHR2YXIgZGlmZiA9IE1hdGguYWJzKHNjcm9sbFRvcCAtIEBzY3JvbGxGcmVlemUpXG5cdFx0XHRyZXR1cm4gc2VsZiBpZiBkaWZmIDwgNTBcblx0XHRcdEBzY3JvbGxGcmVlemUgPSAtMVxuXG5cdFx0dmFyIHNjcm9sbEJvdHRvbSA9IGRoIC0gKHNjcm9sbFRvcCArIHdoKVxuXG5cdFx0aWYgc2Nyb2xsQm90dG9tID09IDBcblx0XHRcdG1hdGNoID0gaXRlbXNbaXRlbXMubGVuIC0gMV1cblxuXHRcdGVsc2Vcblx0XHRcdGZvciBpdGVtIGluIGl0ZW1zXG5cdFx0XHRcdHZhciB0ID0gKGl0ZW06b2Zmc2V0VG9wICsgMzAgKyA2MCkgIyBoYWNrXG5cdFx0XHRcdHZhciBkaXN0ID0gc2Nyb2xsVG9wIC0gdFxuXG5cdFx0XHRcdGlmIGRpc3QgPCAwXG5cdFx0XHRcdFx0YnJlYWsgbWF0Y2ggPSBpdGVtXG5cdFx0XG5cdFx0aWYgbWF0Y2hcblx0XHRcdGlmIEBoYXNoICE9IG1hdGNoOmlkXG5cdFx0XHRcdEBoYXNoID0gbWF0Y2g6aWRcblx0XHRcdFx0cm91dGVyLmdvKCcjJyArIEBoYXNoLHt9LHllcylcblx0XHRcdFx0cmVuZGVyXG5cblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBvbnJvdXRlIGVcblx0XHRlLnN0b3Bcblx0XHRsb2cgJ2d1aWRlcyByb3V0ZWQnXG5cdFx0dmFyIHNjcm9sbCA9IGRvXG5cdFx0XHRpZiBsZXQgZWwgPSBkb20ucXVlcnlTZWxlY3RvcignIycgKyByb3V0ZXIuaGFzaClcblx0XHRcdFx0ZWwuc2Nyb2xsSW50b1ZpZXcodHJ1ZSlcblx0XHRcdFx0QHNjcm9sbEZyZWV6ZSA9IHdpbmRvdzpwYWdlWU9mZnNldFxuXHRcdFx0XHRyZXR1cm4gZWxcblx0XHRcdHJldHVybiBub1xuXG5cdFx0aWYgcm91dGVyLmhhc2hcblx0XHRcdHJlbmRlclxuXHRcdFx0c2Nyb2xsKCkgb3Igc2V0VGltZW91dChzY3JvbGwsMjApXG5cblx0XHRzZWxmXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmLl9wYWdlPlxuXHRcdFx0PG5hdkBuYXY+XG5cdFx0XHRcdDwuY29udGVudD5cblx0XHRcdFx0XHQ8R3VpZGVUT0NbYXBwLmRvYygnL2d1aWRlLm1kJyldPlxuXHRcdFx0XHRcdCMgPEd1aWRlVE9DW2FwcC5kb2MoJy9ndWlkZXMvbGFuZ3VhZ2UubWQnKV0+XG5cdFx0XHQ8LmJvZHkubGlnaHQ+XG5cdFx0XHRcdDxHdWlkZVtndWlkZV0+XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL0d1aWRlc1BhZ2UuaW1iYSIsImltcG9ydCBQYWdlIGZyb20gJy4vUGFnZSdcblxuZGVmIHBhdGhUb0FuY2hvciBwYXRoXG5cdCdhcGktJyArIHBhdGgucmVwbGFjZSgvXFwuL2csJ18nKS5yZXBsYWNlKC9cXCMvZywnX18nKS5yZXBsYWNlKC9cXD0vZywnX3NldCcpXG5cbnRhZyBEZXNjXG5cblx0ZGVmIGh0bWw9IGh0bWxcblx0XHRpZiBodG1sICE9IEBodG1sXG5cdFx0XHRkb206aW5uZXJIVE1MID0gQGh0bWwgPSBodG1sXG5cdFx0c2VsZlxuXG50YWcgUmVmXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmPlxuXG50YWcgSXRlbVxuXG50YWcgUGF0aCA8IHNwYW5cblx0cHJvcCBzaG9ydFxuXG5cdGRlZiBzZXR1cFxuXHRcdHZhciBpdGVtcyA9IFtdXG5cdFx0dmFyIHN0ciA9IGRhdGFcblx0XHRpZiBzdHIgaXNhIFN0cmluZ1xuXHRcdFx0aWYgc2hvcnRcblx0XHRcdFx0c3RyID0gc3RyLnJlcGxhY2UoLyhbQS1aXVxcdypcXC4pKig/PVtBLVpdKS9nLCcnKVxuXG5cdFx0XHRodG1sID0gc3RyLnJlcGxhY2UoL1xcYihbXFx3XSt8XFwufFxcIylcXGIvZykgZG8gfG0saXxcblx0XHRcdFx0aWYgaSA9PSAnLicgb3IgaSA9PSAnIydcblx0XHRcdFx0XHRcIjxpPntpfTwvaT5cIlxuXHRcdFx0XHRlbGlmIGlbMF0gPT0gaVswXS50b1VwcGVyQ2FzZVxuXHRcdFx0XHRcdFwiPGIgY2xhc3M9J2NvbnN0Jz57aX08L2I+XCJcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFwiPGIgY2xhc3M9J2lkJz57aX08L2I+XCJcblx0XHRzZWxmXG5cblxudGFnIFJldHVyblxuXHRhdHRyIG5hbWVcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGY+XG5cdFx0XHQ8UGF0aFtkYXRhOnZhbHVlXS52YWx1ZT5cblx0XHRcdDxzcGFuLmRlc2M+IGRhdGE6ZGVzY1xuXG50YWcgQ2xhc3MgPCBJdGVtXG5cblx0cHJvcCBkYXRhIHdhdGNoOiA6cGFyc2VcblxuXHRkZWYgcGFyc2Vcblx0XHRAc3RhdGljcyA9IChtIGZvciBtIGluIGRhdGFbJy4nXSB3aGVuIG06ZGVzYylcblx0XHRAbWV0aG9kcyA9IChtIGZvciBtIGluIGRhdGFbJyMnXSB3aGVuIG06ZGVzYylcblx0XHRAcHJvcGVydGllcyA9IFtdXG5cdFx0c2VsZlxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj5cblx0XHRcdDxzcGFuLnRvYy1hbmNob3IgaWQ9cGF0aFRvQW5jaG9yKGRhdGE6bmFtZXBhdGgpPlxuXHRcdFx0PC5oZWFkZXI+IDwudGl0bGU+IDxQYXRoW2RhdGE6bmFtZXBhdGhdPlxuXHRcdFx0PERlc2MgaHRtbD1kYXRhOmh0bWw+XG5cdFx0XHRpZiBkYXRhOmN0b3Jcblx0XHRcdFx0PC5jb250ZW50LmN0b3I+XG5cdFx0XHRcdFx0PE1ldGhvZFtkYXRhOmN0b3JdIHBhdGg9KGRhdGE6bmFtZXBhdGggKyAnLm5ldycpPlxuXG5cdFx0XHQ8LmNvbnRlbnQ+XG5cdFx0XHRcdGlmIEBzdGF0aWNzOmxlbmd0aCA+IDBcblx0XHRcdFx0XHQ8LnNlY3Rpb24+XG5cdFx0XHRcdFx0XHQ8aDIuaGVhZGVyPiAnU3RhdGljIE1ldGhvZHMnXG5cdFx0XHRcdFx0XHQ8LmNvbnRlbnQubGlzdD4gZm9yIGl0ZW0gaW4gQHN0YXRpY3Ncblx0XHRcdFx0XHRcdFx0PE1ldGhvZFtpdGVtXS5kb2MgaW5hbWU9ZGF0YTpuYW1lcGF0aD5cblxuXHRcdFx0XHRpZiBAbWV0aG9kczpsZW5ndGggPiAwXG5cdFx0XHRcdFx0PC5zZWN0aW9uPlxuXHRcdFx0XHRcdFx0PGgyLmhlYWRlcj4gJ0luc3RhbmNlIE1ldGhvZHMnXG5cdFx0XHRcdFx0XHQ8LmNvbnRlbnQubGlzdD4gZm9yIGl0ZW0gaW4gQG1ldGhvZHNcblx0XHRcdFx0XHRcdFx0PE1ldGhvZFtpdGVtXS5kb2MgaW5hbWU9ZGF0YTppbmFtZT5cblxudGFnIFZhbHVlXG5cblx0ZGVmIHJlbmRlclxuXHRcdGlmIGRhdGE6dHlwZVxuXHRcdFx0PHNlbGYgLntkYXRhOnR5cGV9PlxuXHRcdFx0XHRkYXRhOnZhbHVlXG5cdFx0ZWxpZiBkYXRhIGlzYSBTdHJpbmdcblx0XHRcdDxzZWxmLnN0ciB0ZXh0PWRhdGE+XG5cdFx0ZWxpZiBkYXRhIGlzYSBOdW1iZXJcblx0XHRcdDxzZWxmLm51bSB0ZXh0PWRhdGE+XG5cdFx0c2VsZlxuXHRcdFxuXG50YWcgUGFyYW1cblxuXHRkZWYgdHlwZVxuXHRcdGRhdGE6dHlwZVxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZiAue3R5cGV9PlxuXHRcdFx0aWYgdHlwZSA9PSAnTmFtZWRQYXJhbXMnXG5cdFx0XHRcdGZvciBwYXJhbSBpbiBkYXRhOm5vZGVzXG5cdFx0XHRcdFx0PFBhcmFtW3BhcmFtXT5cblx0XHRcdGVsc2Vcblx0XHRcdFx0PC5uYW1lPiBkYXRhOm5hbWVcblx0XHRcdFx0aWYgZGF0YTpkZWZhdWx0c1xuXHRcdFx0XHRcdDxpPiB0eXBlID09ICdOYW1lZFBhcmFtJyA/ICc6ICcgOiAnID0gJ1xuXHRcdFx0XHRcdDxWYWx1ZVtkYXRhOmRlZmF1bHRzXT5cblxudGFnIE1ldGhvZCA8IEl0ZW1cblxuXHRwcm9wIGluYW1lXG5cdHByb3AgcGF0aFxuXG5cdGRlZiB0YWdzXG5cdFx0PGRpdkB0YWdzPlxuXHRcdFx0PFJldHVybltkYXRhOnJldHVybl0gbmFtZT0ncmV0dXJucyc+IGlmIGRhdGE6cmV0dXJuXG5cblx0XHRcdGlmIGRhdGE6ZGVwcmVjYXRlZFxuXHRcdFx0XHQ8LmRlcHJlY2F0ZWQucmVkPiAnTWV0aG9kIGlzIGRlcHJlY2F0ZWQnXG5cdFx0XHRpZiBkYXRhOnByaXZhdGVcblx0XHRcdFx0PC5wcml2YXRlLnJlZD4gJ01ldGhvZCBpcyBwcml2YXRlJ1xuXG5cblx0ZGVmIHBhdGhcblx0XHRAcGF0aCBvciAoaW5hbWUgKyAnLicgKyBkYXRhOm5hbWUpXG5cblx0ZGVmIHNsdWdcblx0XHRwYXRoVG9BbmNob3IoZGF0YTpuYW1lcGF0aClcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGYgLmRlcHJlY2F0ZWQ9KGRhdGE6ZGVwcmVjYXRlZCkgPlxuXHRcdFx0PHNwYW4udG9jLWFuY2hvciBpZD1zbHVnPlxuXHRcdFx0PC5oZWFkZXI+XG5cdFx0XHRcdDxQYXRoW3BhdGhdPlxuXHRcdFx0XHQ8LnBhcmFtcz4gZm9yIHBhcmFtIGluIGRhdGE6cGFyYW1zXG5cdFx0XHRcdFx0PFBhcmFtW3BhcmFtXT5cblx0XHRcdFx0PC5ncm93PlxuXHRcdFx0PERlc2MubWQgaHRtbD1kYXRhOmh0bWw+XG5cdFx0XHR0YWdzXG5cbnRhZyBMaW5rIDwgYVxuXHRwcm9wIHNob3J0XG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmIGhyZWY9XCIvZG9jcyN7cGF0aFRvQW5jaG9yKGRhdGE6bmFtZXBhdGgpfVwiPiA8UGF0aFtkYXRhOm5hbWVwYXRoXSBzaG9ydD1zaG9ydD5cblx0XHRzdXBlclxuXG5cdGRlZiBvbnRhcFxuXHRcdHN1cGVyXG5cdFx0dHJpZ2dlcigncmVmb2N1cycpXG5cbnRhZyBHcm91cFxuXG5cdGRlZiBvbnRhcFxuXHRcdHRvZ2dsZUZsYWcoJ2NvbGxhcHNlZCcpXG5cblxuZXhwb3J0IHRhZyBEb2NzUGFnZSA8IFBhZ2VcblxuXHRwcm9wIHZlcnNpb24gZGVmYXVsdDogJ2N1cnJlbnQnXG5cdHByb3Agcm9vdHNcblxuXHRkZWYgc3JjXG5cdFx0XCIvYXBpL3t2ZXJzaW9ufS5qc29uXCJcblxuXHRkZWYgZG9jc1xuXHRcdEBkb2NzXG5cblx0ZGVmIHNldHVwXG5cdFx0bG9hZFxuXHRcdHN1cGVyXG5cblx0ZGVmIGxvYWRcblx0XHR2YXIgZG9jcyA9IGF3YWl0IGFwcC5mZXRjaChzcmMpXG5cdFx0RE9DUyA9IEBkb2NzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkb2NzKSlcblx0XHRET0NNQVAgPSBAZG9jczplbnRpdGllc1xuXHRcdGdlbmVyYXRlXG5cdFx0aWYgJHdlYiRcblx0XHRcdGxvYWRlZFxuXG5cdGRlZiBsb2FkZWRcblx0XHRyZW5kZXJcblx0XHRpZiBkb2N1bWVudDpsb2NhdGlvbjpoYXNoXG5cdFx0XHRpZiB2YXIgZWwgPSBkb20ucXVlcnlTZWxlY3Rvcihkb2N1bWVudDpsb2NhdGlvbjpoYXNoKVxuXHRcdFx0XHRlbC5zY3JvbGxJbnRvVmlld1xuXHRcdHNlbGZcblx0XHRcblx0ZGVmIG9ucmVmb2N1cyBlXG5cdFx0cmVmb2N1c1xuXG5cdGRlZiByZWZvY3VzXG5cdFx0aWYgdmFyIGVsID0gZG9tLnF1ZXJ5U2VsZWN0b3IoZG9jdW1lbnQ6bG9jYXRpb246aGFzaClcblx0XHRcdGVsLnNjcm9sbEludG9WaWV3XG5cdFx0c2VsZlxuXG5cdGRlZiBsb29rdXAgcGF0aFxuXHRcdGRvY3M6ZW50aXRpZXNbcGF0aF1cblxuXHRkZWYgZ2VuZXJhdGVcblx0XHRAcm9vdHMgPSBbXVxuXHRcdHZhciBlbnRzID0gQGRvY3M6ZW50aXRpZXNcblxuXHRcdGZvciBvd24gcGF0aCxpdGVtIG9mIGRvY3M6ZW50aXRpZXNcblx0XHRcdGlmIGl0ZW06dHlwZSA9PSAnY2xhc3MnIG9yIHBhdGggPT0gJ0ltYmEnXG5cdFx0XHRcdGl0ZW1bJy4nXSA9IChpdGVtWycuJ10gfHwgW10pLnNvcnQubWFwKHxwYXRofCBlbnRzW3BhdGhdICkuZmlsdGVyKHx2fCB2OnR5cGUgPT0gJ21ldGhvZCcgYW5kIHY6ZGVzYyApXG5cdFx0XHRcdGl0ZW1bJyMnXSA9IChpdGVtWycjJ10gfHwgW10pLnNvcnQubWFwKHxwYXRofCBlbnRzW3BhdGhdICkuZmlsdGVyKHx2fCB2OnR5cGUgPT0gJ21ldGhvZCcgYW5kIHY6ZGVzYyApXG5cblx0XHRcdFx0QHJvb3RzLnB1c2goaXRlbSkgaWYgaXRlbTpkZXNjXG5cdFx0c2VsZlxuXG5cdGRlZiByZW5kZXJcblx0XHRyZXR1cm4gc2VsZiB1bmxlc3MgZG9jc1xuXHRcdFxuXHRcdDxzZWxmPlxuXHRcdFx0PG5hdkBuYXY+IDwuY29udGVudD5cblx0XHRcdFx0Zm9yIHJvb3QgaW4gcm9vdHNcblx0XHRcdFx0XHQ8R3JvdXAudG9jLmNsYXNzLnNlY3Rpb24uY29tcGFjdD5cblx0XHRcdFx0XHRcdDwuaGVhZGVyPiA8TGlua1tyb290XS5jbGFzcz5cblx0XHRcdFx0XHRcdDwuY29udGVudD5cblx0XHRcdFx0XHRcdFx0PC5zdGF0aWM+XG5cdFx0XHRcdFx0XHRcdFx0Zm9yIG1ldGggaW4gcm9vdFsnLiddwqB3aGVuIG1ldGg6ZGVzYyBhbmQgIW1ldGg6cHJpdmF0ZVxuXHRcdFx0XHRcdFx0XHRcdFx0PC5lbnRyeT4gPExpbmtbbWV0aF0gc2hvcnQ9eWVzPlxuXHRcdFx0XHRcdFx0XHQ8Lmluc3RhbmNlPlxuXHRcdFx0XHRcdFx0XHRcdGZvciBtZXRoIGluIHJvb3RbJyMnXcKgd2hlbiBtZXRoOmRlc2MgYW5kICFtZXRoOnByaXZhdGVcblx0XHRcdFx0XHRcdFx0XHRcdDwuZW50cnk+IDxMaW5rW21ldGhdIHNob3J0PXllcz5cblx0XHRcdDwuYm9keT5cblx0XHRcdFx0Zm9yIHJvb3QgaW4gcm9vdHNcblx0XHRcdFx0XHQ8Q2xhc3Nbcm9vdF0uZG9jLmw+XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvRG9jc1BhZ2UuaW1iYSIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9sZXNzL3NpdGUubGVzc1xuLy8gbW9kdWxlIGlkID0gMjdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==