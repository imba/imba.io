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

var Imba = {VERSION: '1.3.0-beta.12'};

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

Imba.Tag.prototype.on$ = function (slot,handler,context){
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
	if (prev) {
		handler.state = prev.state;
	} else {
		handler.state = {context: context};
	};
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

el.getHandler = function (str,event){
	if (this[str]) { return this };
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

Imba.Event.prototype.source = function(v){ return this._source; }
Imba.Event.prototype.setSource = function(v){ this._source = v; return this; };

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
Imba.Event.prototype.native = function (){
	return this._event;
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
			let ctx = state.context;
			
			if (ctx) {
				if (ctx.getHandler instanceof Function) {
					ctx = ctx.getHandler(handler,this);
				};
				
				if (ctx[handler] instanceof Function) {
					handler = fn = ctx[handler];
					context = ctx;
				};
			};
			
			if (!(fn)) {
				console.warn(("event " + this.type() + ": could not find '" + handler + "' in context"),ctx);
			};
			
			// while el and (!fn or !(fn isa Function))
			// 	if fn = el.getHandler(handler)
			// 		if fn[handler] isa Function
			// 			handler = fn[handler]
			// 			context = fn
			// 		elif fn isa Function
			// 			handler = fn
			// 			context = el
			// 	else
			// 		el = el.parent
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
	return this.native().x;
};

/*
	Return the y/top coordinate of the mouse / pointer for this event
	@return {Number} y coordinate of mouse / pointer for event
	*/

Imba.Event.prototype.y = function (){
	return this.native().y;
};

Imba.Event.prototype.button = function (){
	return this.native().button;
};
Imba.Event.prototype.keyCode = function (){
	return this.native().keyCode;
};
Imba.Event.prototype.ctrl = function (){
	return this.native().ctrlKey;
};
Imba.Event.prototype.alt = function (){
	return this.native().altKey;
};
Imba.Event.prototype.shift = function (){
	return this.native().shiftKey;
};
Imba.Event.prototype.meta = function (){
	return this.native().metaKey;
};
Imba.Event.prototype.key = function (){
	return this.native().key;
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
var Logo = __webpack_require__(32).Logo;

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
					_1(Logo,$,2,1),
					_1('a',$,3,1).flag('tab').flag('logo').setHref('/home').setContent($[4] || _1('i',$,4,3).setText('imba'),2),
					_1('span',$,5,1).flag('greedy'),
					_1('a',$,6,1).flag('tab').flag('home').setHref('/home').setContent($[7] || _1('i',$,7,6).setText('home'),2),
					_1('a',$,8,1).flag('tab').flag('guides').setHref('/guide').setContent($[9] || _1('i',$,9,8).setText('learn'),2),
					// <a.tab.docs href='/docs'> <i> 'api'
					_1('a',$,10,1).flag('tab').flag('docs').setHref('/examples').setContent($[11] || _1('i',$,11,10).setText('examples'),2),
					// <a.twitter href='http://twitter.com/imbajs'> <i> 'twitter'
					_1('a',$,12,1).flag('github').setHref('https://github.com/somebee/imba').setContent($[13] || _1('i',$,13,12).setText('github'),2),
					// <a.issues href='https://github.com/somebee/imba/issues'> <i> 'issues'
					_1('a',$,14,1).flag('menu').on$(0,['tap','toggleMenu'],this).setContent($[15] || _1('b',$,15,14),2)
				],2)
			,2),
			
			_1('main',$,16,this),
			
			_1('footer',$,20,this).setId('footer').setContent([
				_1('hr',$,21,20),
				_1('div',$,22,20).flag('lft').setText("Imba © 2015-2018"),
				_1('div',$,23,20).flag('rgt').setContent([
					_1('a',$,24,23).setHref('http://twitter.com/imbajs').setText('Twitter'),
					_1('a',$,25,23).setHref('http://github.com/somebee/imba').setText('GitHub'),
					_1('a',$,26,23).setHref('http://github.com/somebee/imba/issues').setText('Issues'),
					_1('a',$,27,23).setHref('http://gitter.im/somebee/imba').setText('Chat')
				],2)
			],2)
		],2).synced((
			$[0].end((
				$[1].end((
					$[2].end(),
					$[3].end(),
					$[6].end(),
					$[8].end(),
					$[10].end(),
					$[12].end(),
					$[14].end()
				,true))
			,true)),
			$[16].setContent(
				this.router().scoped('/home') ? (
					($[17] || _1(HomePage,$,17,16)).end()
				) : (this.router().scoped('/guide') ? (
					($[18] || _1(GuidesPage,$,18,16)).bindData(this.app(),'guide',[]).end()
				) : (this.router().scoped('/docs') ? (
					($[19] || _1(DocsPage,$,19,16)).end()
				) : void(0)))
			,3).end(),
			$[20].end((
				$[23].end()
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
var Logo = __webpack_require__(32).Logo;


var HomePage = Imba.defineTag('HomePage', Page, function(tag){
	
	tag.prototype.render = function (){
		var $ = this.$, t0;
		return this.$open(0).setChildren($[0] || _1('div',$,0,this).flag('body').setContent([
			t0 = (t0=_1('div',$,1,0)).setId('hero').flag('dark').setContent([
				this._pattern = this._pattern||_1(Pattern,t0).flag('pattern'),
				_1('div',$,2,t0).flag('content').setContent([
					_1(Marked,$,3,2),
					_1('nav',$,4,2).flag('buttons').setContent([
						// <a.button.try href='#'> "Try online"
						_1('a',$,5,4).flag('button').flag('start').setHref('/guide').setText("Get started"),
						_1('a',$,6,4).flag('button').flag('start').setHref('/examples').setText("Examples"),
						_1('a',$,7,4).flag('button').flag('github').setHref('https://github.com/somebee/imba').setText("Github")
					],2)
				],2)
			
			// <herosnippet.hero.dark src='/home/examples/hero.imba'>
			],2),
			_1('div',$,8,0).flag('content').setContent([
				_1(Marked,$,9,8).flag('section').flag('md').flag('welcome').flag('huge').flag('light').setText("# Create complex web apps with ease!\n\nImba is a new programming language for the web that compiles to highly \nperformant and readable JavaScript. It has language level support for defining, \nextending, subclassing, instantiating and rendering dom nodes. For a simple \napplication like TodoMVC, it is more than \n[10 times faster than React](http://somebee.github.io/todomvc-render-benchmark/index.html) \nwith less code, and a much smaller library.\n\n---\n\n- ## Imba.inspiration\n  Imba brings the best from Ruby, Python, and React (+ JSX) together in a clean language and runtime.\n\n- ## Imba.interoperability\n  Imba compiles down to clean and readable JavaScript. Use any JS library in Imba and vica-versa.\n\n- ## Imba.performance\n  Build your application views using Imba's native tags for unprecedented performance.\n"),
				
				// <Example.dark heading="Simple reminders" src='/home/examples/reminders.imba'>
				
				_1(Marked,$,10,8).flag('section').flag('md').setText("## Reusable components\n\nA custom tag / component can maintain internal state and control how to render itself.\nWith the performance of DOM reconciliation in Imba, you can use one-way declarative bindings,\neven for animations. Write all your views in a straight-forward linear fashion as if you could\nrerender your whole application on **every single** data/state change."),
				
				// <Example.dark heading="World clock" src='/home/examples/clock.imba'>
				
				_1(Marked,$,11,8).flag('section').flag('md').setText("## Extend native tags\n\nIn addition to defining custom tags, you can also extend native tags, or inherit from them.\nBinding to dom events is as simple as defining methods on your tags; all events will be\nefficiently delegated and handled by Imba. Let's define a simple sketchpad...")
			
			// <Example.dark heading="Custom canvas" src='/home/examples/canvas.imba'>
			],2)
		],2),2).synced((
			$[0].end((
				$[1].end((
					this._pattern.end(),
					$[2].end((
						$[3].bindData(this.app().guide(),'hero').end(),
						$[4].end()
					,true))
				,true)),
				$[8].end((
					$[9].end(),
					$[10].end(),
					$[11].end()
				,true))
			,true))
		,true));
	};
})
exports.HomePage = HomePage;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);
// define renderer
var marked = __webpack_require__(22);
var mdr = new (marked.Renderer)();

mdr.heading = function (text,lvl){
	return ("<h" + lvl + ">" + text + "</h" + lvl + ">");
};

var Snippet = __webpack_require__(4).Snippet;

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
	
	tag.prototype.setData = function (data){
		if (data && data != this._data) {
			this._data = data;
			this.dom().innerHTML = data.body;
			if (true) this.awakenSnippets();
		};
		return this;
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

/***/ }),
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;

var Logo = Imba.defineTag('Logo', function(tag){
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren(
			$[0] || _1('svg:svg',$,0,this).set('xmlns',"http://www.w3.org/2000/svg").set('width',"116").set('height',"108").set('viewBox',"0 0 116 108").setContent(
				$[1] || _1('svg:g',$,1,0).set('fill',"#3E91FF").set('fill-rule',"evenodd").setContent(
					$[2] || _1('svg:path',$,2,1).set('d',"M38.8638869 68.1351424C39.5073476 69.57271 39.6890057 70.9547825 39.4088666 72.2814014 39.1287276 73.6080204 38.4437022 74.6096805 37.3537699 75.2864118 36.2638375 75.9631432 35.0187288 76.1517033 33.6184062 75.8520979 32.7123152 75.6582356 31.735207 75.1892035 30.6870523 74.4449875 28.9429109 72.511945 26.9954547 70.3187797 24.8446252 67.8654257 22.6937958 65.4120718 20.5105674 62.9084866 18.2948748 60.3545951 16.0791821 57.8007035 13.9003309 55.2763902 11.7582558 52.7815794 9.61618066 50.2867686 7.6319162 48.0640634 5.80540286 46.113397 4.76759128 44.5047965 4.39751492 42.9957526 4.69516266 41.58622 5.04533648 39.9279464 6.13425543 38.6444027 7.96195216 37.7355506L11.2147227 36.0916942C12.9013528 35.23932 14.9406188 34.2457658 17.3325818 33.1110021 19.7245448 31.9762383 22.2456979 30.7391523 24.8961167 29.3997071 27.5465356 28.0602619 30.0676887 26.8231759 32.4596517 25.6884121 34.8516147 24.5536483 36.9158504 23.543772 38.6524209 22.6587528 40.3889914 21.7737337 41.4482676 21.2421093 41.8302813 21.0638636 43.5935059 20.2285156 53.6162109 18.7922363 52.4217391 22.7325491L47.9115556 39.8008309C47.8077805 40.1935561 47.476752 40.4844863 47.0739524 40.536973L18.065609 44.3168991C19.4504169 45.9130813 21.0635148 47.7530692 22.9049511 49.836918 24.7463873 51.9207668 26.5996344 54.0504464 28.4647479 56.2260208 30.3298615 58.4015952 32.1831086 60.5312748 34.0245448 62.6151236 35.8659811 64.6989723 37.479079 66.5389602 38.8638869 68.1351424zM67.2090353 76.2221773C65.9199285 77.108676 65.0557147 78.1844225 64.616368 79.4494491 64.1770213 80.7144756 64.2517959 81.9117897 64.840694 83.0414271 65.4295921 84.1710644 66.4018778 84.967275 67.7575804 85.4300825 68.6347998 85.7295462 69.7140012 85.8326519 70.9952172 85.7394025 73.4831625 84.996847 76.2789554 84.1383159 79.3826799 83.1637834 82.4864043 82.1892508 85.6436845 81.1888133 88.8546153 80.1624406 92.0655461 79.1360679 95.2296911 78.1158645 98.3471451 77.1018 101.464599 76.0877354 104.30713 75.2230503 106.874822 74.5077187 108.590124 73.6782757 109.681162 72.5915252 110.147968 71.2474344 110.697151 69.6661512 110.420092 68.0239253 109.316783 66.3207074L107.366721 63.2671813C106.355574 61.6838635 105.11404 59.8008236 103.642084 57.6180053 102.170128 55.4351869 100.6397 53.0997773 99.0507529 50.6117065 97.4618062 48.1236357 95.9313778 45.7882262 94.4594217 43.6054078 92.9874656 41.4225894 91.7328604 39.5129779 90.6955685 37.8765161 89.6582766 36.2400542 89.0213345 35.248794 88.7847232 34.9027056 87.3457031 32.7919922 80.3010254 26.2080078 78.8369005 30.8970692L73.9654789 47.6242056C73.8513184 48.0162014 73.9869249 48.4382316 74.3080551 48.6903601L97.2701725 66.7185771C95.2633408 67.3600601 92.9355824 68.0909485 90.2868275 68.9112643 87.6380726 69.7315801 84.9556916 70.5846092 82.2396039 71.4703772 79.5235163 72.3561452 76.8411352 73.2091743 74.1923803 74.0294902 71.5436255 74.849806 69.2158671 75.5806944 67.2090353 76.2221773zM65.4501401 8.01131118C66.3107935 6.48608129 67.3093706 5.43525523 68.4459012 4.85880147 69.5824318 4.28234771 70.7322595 4.14743206 71.8954188 4.45405048 72.9754953 4.73876759 73.8930671 5.37486487 74.6481616 6.36236141 75.4032562 7.34985795 75.7770161 8.67483946 75.7694527 10.3373457L51.392716 99.8387197C50.7976079 101.696765 49.8527941 102.958873 48.5582463 103.62508 47.2636986 104.291287 45.9933227 104.460128 44.7470806 104.131608 43.5839212 103.82499 42.6207345 103.111165 41.8574915 101.990113 41.0942485 100.86906 40.8328884 99.3765993 41.0734034 97.5126852L65.4501401 8.01131118z")
				,2)
			,2)
		,2).synced((
			$[0].end((
				$[1].end((
					$[2].end()
				,true))
			,true))
		,true));
	};
})
exports.Logo = Logo;


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYWI1N2YyMDI5YWM5YzZkMmEwNmIiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvaW1iYS5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2ltYmEuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvUGFnZS5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9wb2ludGVyLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1NuaXBwZXQuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvY2xpZW50LmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvaW5kZXguaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9zY2hlZHVsZXIuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vaW5kZXguaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vbWFuYWdlci5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS90YWcuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vaHRtbC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS90b3VjaC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC1tYW5hZ2VyLmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvZG9tL3JlY29uY2lsZXIuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvcm91dGVyLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1NpdGUuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvSG9tZVBhZ2UuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvTWFya2VkLmltYmEiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL21hcmtlZC9saWIvbWFya2VkLmpzIiwid2VicGFjazovLy8od2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1BhdHRlcm4uaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvR3VpZGVzUGFnZS5pbWJhIiwid2VicGFjazovLy8uL3NyYy92aWV3cy9Eb2NzUGFnZS5pbWJhIiwid2VicGFjazovLy8uL2xlc3Mvc2l0ZS5sZXNzIiwid2VicGFjazovLy8uL3NyYy92aWV3cy9Mb2dvLmltYmEiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7O0FDN0RBLE9BQU8sUUFBUTs7Ozs7Ozs7Ozs7O0lDSVgsS0FBSzs7Ozs7Ozs7OztBQVNUO1FBQ0M7RUFDQztTQUNBLEtBQUs7R0FGTzs7Ozs7Ozs7Ozs7QUFXZDtRQUNDLFlBQVksTUFBTTs7Ozs7OztBQUtuQjtRQUNDLGNBQWM7Ozs7Ozs7QUFLZjtRQUNDLGFBQWE7Ozs7QUFHZDtDQUNDOzthQUNZLElBQUcsSUFBSSxlQUFlLE1BQWpDLElBQUksR0FBRyxFQUFFOzs7Q0FFVixJQUFJLFVBQVUsRUFBRSxPQUFPLE9BQU8sSUFBSTtDQUNsQyxJQUFJLFVB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QUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QjtBQUM5QjtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsRUFBRTtBQUNuQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFFBQVEsT0FBTztBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNB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Ozs7Ozs7Ozs7OztXQ0NPOztDQUVOOzs7a0NBRVcsMENBQW1DLG1CQUFZLG9CQUFhOzhCQUM3RCxzQkFBZTtrQ0FDWCIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gNSk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgYWI1N2YyMDI5YWM5YzZkMmEwNmIiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUgXCIuL3NyYy9pbWJhL2luZGV4LmltYmFcIlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL2ltYmEuaW1iYSIsIiMjI1xuSW1iYSBpcyB0aGUgbmFtZXNwYWNlIGZvciBhbGwgcnVudGltZSByZWxhdGVkIHV0aWxpdGllc1xuQG5hbWVzcGFjZVxuIyMjXG52YXIgSW1iYSA9IHtWRVJTSU9OOiAnMS4zLjAtYmV0YS4xMid9XG5cbiMjI1xuXG5MaWdodCB3cmFwcGVyIGFyb3VuZCBuYXRpdmUgc2V0VGltZW91dCB0aGF0IGV4cGVjdHMgdGhlIGJsb2NrIC8gZnVuY3Rpb25cbmFzIGxhc3QgYXJndW1lbnQgKGluc3RlYWQgb2YgZmlyc3QpLiBJdCBhbHNvIHRyaWdnZXJzIGFuIGV2ZW50IHRvIEltYmFcbmFmdGVyIHRoZSB0aW1lb3V0IHRvIGxldCBzY2hlZHVsZXJzIHVwZGF0ZSAodG8gcmVyZW5kZXIgZXRjKSBhZnRlcndhcmRzLlxuXG4jIyNcbmRlZiBJbWJhLnNldFRpbWVvdXQgZGVsYXksICZibG9ja1xuXHRzZXRUaW1lb3V0KCYsZGVsYXkpIGRvXG5cdFx0YmxvY2soKVxuXHRcdEltYmEuY29tbWl0XG5cbiMjI1xuXG5MaWdodCB3cmFwcGVyIGFyb3VuZCBuYXRpdmUgc2V0SW50ZXJ2YWwgdGhhdCBleHBlY3RzIHRoZSBibG9jayAvIGZ1bmN0aW9uXG5hcyBsYXN0IGFyZ3VtZW50IChpbnN0ZWFkIG9mIGZpcnN0KS4gSXQgYWxzbyB0cmlnZ2VycyBhbiBldmVudCB0byBJbWJhXG5hZnRlciBldmVyeSBpbnRlcnZhbCB0byBsZXQgc2NoZWR1bGVycyB1cGRhdGUgKHRvIHJlcmVuZGVyIGV0YykgYWZ0ZXJ3YXJkcy5cblxuIyMjXG5kZWYgSW1iYS5zZXRJbnRlcnZhbCBpbnRlcnZhbCwgJmJsb2NrXG5cdHNldEludGVydmFsKGJsb2NrLGludGVydmFsKVxuXG4jIyNcbkNsZWFyIGludGVydmFsIHdpdGggc3BlY2lmaWVkIGlkXG4jIyNcbmRlZiBJbWJhLmNsZWFySW50ZXJ2YWwgaWRcblx0Y2xlYXJJbnRlcnZhbChpZClcblxuIyMjXG5DbGVhciB0aW1lb3V0IHdpdGggc3BlY2lmaWVkIGlkXG4jIyNcbmRlZiBJbWJhLmNsZWFyVGltZW91dCBpZFxuXHRjbGVhclRpbWVvdXQoaWQpXG5cblxuZGVmIEltYmEuc3ViY2xhc3Mgb2JqLCBzdXBcblx0Zm9yIGssdiBvZiBzdXBcblx0XHRvYmpba10gPSB2IGlmIHN1cC5oYXNPd25Qcm9wZXJ0eShrKVxuXG5cdG9iajpwcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cDpwcm90b3R5cGUpXG5cdG9iajpfX3N1cGVyX18gPSBvYmo6cHJvdG90eXBlOl9fc3VwZXJfXyA9IHN1cDpwcm90b3R5cGVcblx0b2JqOnByb3RvdHlwZTppbml0aWFsaXplID0gb2JqOnByb3RvdHlwZTpjb25zdHJ1Y3RvciA9IG9ialxuXHRyZXR1cm4gb2JqXG5cbiMjI1xuTGlnaHR3ZWlnaHQgbWV0aG9kIGZvciBtYWtpbmcgYW4gb2JqZWN0IGl0ZXJhYmxlIGluIGltYmFzIGZvci9pbiBsb29wcy5cbklmIHRoZSBjb21waWxlciBjYW5ub3Qgc2F5IGZvciBjZXJ0YWluIHRoYXQgYSB0YXJnZXQgaW4gYSBmb3IgbG9vcCBpcyBhblxuYXJyYXksIGl0IHdpbGwgY2FjaGUgdGhlIGl0ZXJhYmxlIHZlcnNpb24gYmVmb3JlIGxvb3BpbmcuXG5cbmBgYGltYmFcbiMgdGhpcyBpcyB0aGUgd2hvbGUgbWV0aG9kXG5kZWYgSW1iYS5pdGVyYWJsZSBvXG5cdHJldHVybiBvID8gKG86dG9BcnJheSA/IG8udG9BcnJheSA6IG8pIDogW11cblxuY2xhc3MgQ3VzdG9tSXRlcmFibGVcblx0ZGVmIHRvQXJyYXlcblx0XHRbMSwyLDNdXG5cbiMgd2lsbCByZXR1cm4gWzIsNCw2XVxuZm9yIHggaW4gQ3VzdG9tSXRlcmFibGUubmV3XG5cdHggKiAyXG5cbmBgYFxuIyMjXG5kZWYgSW1iYS5pdGVyYWJsZSBvXG5cdHJldHVybiBvID8gKG86dG9BcnJheSA/IG8udG9BcnJheSA6IG8pIDogW11cblxuIyMjXG5Db2VyY2VzIGEgdmFsdWUgaW50byBhIHByb21pc2UuIElmIHZhbHVlIGlzIGFycmF5IGl0IHdpbGxcbmNhbGwgYFByb21pc2UuYWxsKHZhbHVlKWAsIG9yIGlmIGl0IGlzIG5vdCBhIHByb21pc2UgaXQgd2lsbFxud3JhcCB0aGUgdmFsdWUgaW4gYFByb21pc2UucmVzb2x2ZSh2YWx1ZSlgLiBVc2VkIGZvciBleHBlcmltZW50YWxcbmF3YWl0IHN5bnRheC5cbkByZXR1cm4ge1Byb21pc2V9XG4jIyNcbmRlZiBJbWJhLmF3YWl0IHZhbHVlXG5cdGlmIHZhbHVlIGlzYSBBcnJheVxuXHRcdGNvbnNvbGUud2FybihcImF3YWl0IChBcnJheSkgaXMgZGVwcmVjYXRlZCAtIHVzZSBhd2FpdCBQcm9taXNlLmFsbChBcnJheSlcIilcblx0XHRQcm9taXNlLmFsbCh2YWx1ZSlcblx0ZWxpZiB2YWx1ZSBhbmQgdmFsdWU6dGhlblxuXHRcdHZhbHVlXG5cdGVsc2Vcblx0XHRQcm9taXNlLnJlc29sdmUodmFsdWUpXG5cbnZhciBkYXNoUmVnZXggPSAvLS4vZ1xudmFyIHNldHRlckNhY2hlID0ge31cblxuZGVmIEltYmEudG9DYW1lbENhc2Ugc3RyXG5cdGlmIHN0ci5pbmRleE9mKCctJykgPj0gMFxuXHRcdHN0ci5yZXBsYWNlKGRhc2hSZWdleCkgZG8gfG18IG0uY2hhckF0KDEpLnRvVXBwZXJDYXNlXG5cdGVsc2Vcblx0XHRzdHJcblx0XHRcbmRlZiBJbWJhLnRvU2V0dGVyIHN0clxuXHRzZXR0ZXJDYWNoZVtzdHJdIHx8PSBJbWJhLnRvQ2FtZWxDYXNlKCdzZXQtJyArIHN0cilcblxuZGVmIEltYmEuaW5kZXhPZiBhLGJcblx0cmV0dXJuIChiICYmIGI6aW5kZXhPZikgPyBiLmluZGV4T2YoYSkgOiBbXTppbmRleE9mLmNhbGwoYSxiKVxuXG5kZWYgSW1iYS5sZW4gYVxuXHRyZXR1cm4gYSAmJiAoYTpsZW4gaXNhIEZ1bmN0aW9uID8gYTpsZW4uY2FsbChhKSA6IGE6bGVuZ3RoKSBvciAwXG5cbmRlZiBJbWJhLnByb3Agc2NvcGUsIG5hbWUsIG9wdHNcblx0aWYgc2NvcGU6ZGVmaW5lUHJvcGVydHlcblx0XHRyZXR1cm4gc2NvcGUuZGVmaW5lUHJvcGVydHkobmFtZSxvcHRzKVxuXHRyZXR1cm5cblxuZGVmIEltYmEuYXR0ciBzY29wZSwgbmFtZSwgb3B0cyA9IHt9XG5cdGlmIHNjb3BlOmRlZmluZUF0dHJpYnV0ZVxuXHRcdHJldHVybiBzY29wZS5kZWZpbmVBdHRyaWJ1dGUobmFtZSxvcHRzKVxuXG5cdGxldCBnZXROYW1lID0gSW1iYS50b0NhbWVsQ2FzZShuYW1lKVxuXHRsZXQgc2V0TmFtZSA9IEltYmEudG9DYW1lbENhc2UoJ3NldC0nICsgbmFtZSlcblx0bGV0IHByb3RvID0gc2NvcGU6cHJvdG90eXBlXG5cblx0aWYgb3B0czpkb21cblx0XHRwcm90b1tnZXROYW1lXSA9IGRvIHRoaXMuZG9tW25hbWVdXG5cdFx0cHJvdG9bc2V0TmFtZV0gPSBkbyB8dmFsdWV8XG5cdFx0XHRpZiB2YWx1ZSAhPSB0aGlzW25hbWVdKClcblx0XHRcdFx0dGhpcy5kb21bbmFtZV0gPSB2YWx1ZVxuXHRcdFx0cmV0dXJuIHRoaXNcblx0ZWxzZVxuXHRcdHByb3RvW2dldE5hbWVdID0gZG8gdGhpcy5nZXRBdHRyaWJ1dGUobmFtZSlcblx0XHRwcm90b1tzZXROYW1lXSA9IGRvIHx2YWx1ZXxcblx0XHRcdHRoaXMuc2V0QXR0cmlidXRlKG5hbWUsdmFsdWUpXG5cdFx0XHRyZXR1cm4gdGhpc1xuXHRyZXR1cm5cblxuZGVmIEltYmEucHJvcERpZFNldCBvYmplY3QsIHByb3BlcnR5LCB2YWwsIHByZXZcblx0bGV0IGZuID0gcHJvcGVydHk6d2F0Y2hcblx0aWYgZm4gaXNhIEZ1bmN0aW9uXG5cdFx0Zm4uY2FsbChvYmplY3QsdmFsLHByZXYscHJvcGVydHkpXG5cdGVsaWYgZm4gaXNhIFN0cmluZyBhbmQgb2JqZWN0W2ZuXVxuXHRcdG9iamVjdFtmbl0odmFsLHByZXYscHJvcGVydHkpXG5cdHJldHVyblxuXG5cbiMgQmFzaWMgZXZlbnRzXG5kZWYgZW1pdF9fIGV2ZW50LCBhcmdzLCBub2RlXG5cdCMgdmFyIG5vZGUgPSBjYnNbZXZlbnRdXG5cdHZhciBwcmV2LCBjYiwgcmV0XG5cblx0d2hpbGUgKHByZXYgPSBub2RlKSBhbmQgKG5vZGUgPSBub2RlOm5leHQpXG5cdFx0aWYgY2IgPSBub2RlOmxpc3RlbmVyXG5cdFx0XHRpZiBub2RlOnBhdGggYW5kIGNiW25vZGU6cGF0aF1cblx0XHRcdFx0cmV0ID0gYXJncyA/IGNiW25vZGU6cGF0aF0uYXBwbHkoY2IsYXJncykgOiBjYltub2RlOnBhdGhdKClcblx0XHRcdGVsc2Vcblx0XHRcdFx0IyBjaGVjayBpZiBpdCBpcyBhIG1ldGhvZD9cblx0XHRcdFx0cmV0ID0gYXJncyA/IGNiLmFwcGx5KG5vZGUsIGFyZ3MpIDogY2IuY2FsbChub2RlKVxuXG5cdFx0aWYgbm9kZTp0aW1lcyAmJiAtLW5vZGU6dGltZXMgPD0gMFxuXHRcdFx0cHJldjpuZXh0ID0gbm9kZTpuZXh0XG5cdFx0XHRub2RlOmxpc3RlbmVyID0gbnVsbFxuXHRyZXR1cm5cblxuIyBtZXRob2QgZm9yIHJlZ2lzdGVyaW5nIGEgbGlzdGVuZXIgb24gb2JqZWN0XG5kZWYgSW1iYS5saXN0ZW4gb2JqLCBldmVudCwgbGlzdGVuZXIsIHBhdGhcblx0dmFyIGNicywgbGlzdCwgdGFpbFxuXHRjYnMgPSBvYmo6X19saXN0ZW5lcnNfXyB8fD0ge31cblx0bGlzdCA9IGNic1tldmVudF0gfHw9IHt9XG5cdHRhaWwgPSBsaXN0OnRhaWwgfHwgKGxpc3Q6dGFpbCA9IChsaXN0Om5leHQgPSB7fSkpXG5cdHRhaWw6bGlzdGVuZXIgPSBsaXN0ZW5lclxuXHR0YWlsOnBhdGggPSBwYXRoXG5cdGxpc3Q6dGFpbCA9IHRhaWw6bmV4dCA9IHt9XG5cdHJldHVybiB0YWlsXG5cbiMgcmVnaXN0ZXIgYSBsaXN0ZW5lciBvbmNlXG5kZWYgSW1iYS5vbmNlIG9iaiwgZXZlbnQsIGxpc3RlbmVyXG5cdHZhciB0YWlsID0gSW1iYS5saXN0ZW4ob2JqLGV2ZW50LGxpc3RlbmVyKVxuXHR0YWlsOnRpbWVzID0gMVxuXHRyZXR1cm4gdGFpbFxuXG4jIHJlbW92ZSBhIGxpc3RlbmVyXG5kZWYgSW1iYS51bmxpc3RlbiBvYmosIGV2ZW50LCBjYiwgbWV0aFxuXHR2YXIgbm9kZSwgcHJldlxuXHR2YXIgbWV0YSA9IG9iajpfX2xpc3RlbmVyc19fXG5cdHJldHVybiB1bmxlc3MgbWV0YVxuXG5cdGlmIG5vZGUgPSBtZXRhW2V2ZW50XVxuXHRcdHdoaWxlIChwcmV2ID0gbm9kZSkgYW5kIChub2RlID0gbm9kZTpuZXh0KVxuXHRcdFx0aWYgbm9kZSA9PSBjYiB8fCBub2RlOmxpc3RlbmVyID09IGNiXG5cdFx0XHRcdHByZXY6bmV4dCA9IG5vZGU6bmV4dFxuXHRcdFx0XHQjIGNoZWNrIGZvciBjb3JyZWN0IHBhdGggYXMgd2VsbD9cblx0XHRcdFx0bm9kZTpsaXN0ZW5lciA9IG51bGxcblx0XHRcdFx0YnJlYWtcblx0cmV0dXJuXG5cbiMgZW1pdCBldmVudFxuZGVmIEltYmEuZW1pdCBvYmosIGV2ZW50LCBwYXJhbXNcblx0aWYgdmFyIGNiID0gb2JqOl9fbGlzdGVuZXJzX19cblx0XHRlbWl0X18oZXZlbnQscGFyYW1zLGNiW2V2ZW50XSkgaWYgY2JbZXZlbnRdXG5cdFx0ZW1pdF9fKGV2ZW50LFtldmVudCxwYXJhbXNdLGNiOmFsbCkgaWYgY2I6YWxsICMgYW5kIGV2ZW50ICE9ICdhbGwnXG5cdHJldHVyblxuXG5kZWYgSW1iYS5vYnNlcnZlUHJvcGVydHkgb2JzZXJ2ZXIsIGtleSwgdHJpZ2dlciwgdGFyZ2V0LCBwcmV2XG5cdGlmIHByZXYgYW5kIHR5cGVvZiBwcmV2ID09ICdvYmplY3QnXG5cdFx0SW1iYS51bmxpc3RlbihwcmV2LCdhbGwnLG9ic2VydmVyLHRyaWdnZXIpXG5cdGlmIHRhcmdldCBhbmQgdHlwZW9mIHRhcmdldCA9PSAnb2JqZWN0J1xuXHRcdEltYmEubGlzdGVuKHRhcmdldCwnYWxsJyxvYnNlcnZlcix0cmlnZ2VyKVxuXHRzZWxmXG5cbm1vZHVsZTpleHBvcnRzID0gSW1iYVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvaW1iYS5pbWJhIiwiZXhwb3J0IHRhZyBQYWdlXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL1BhZ2UuaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuY2xhc3MgSW1iYS5Qb2ludGVyXG5cdFxuXHRkZWYgaW5pdGlhbGl6ZVxuXHRcdEBidXR0b24gPSAtMVxuXHRcdEBldmVudCA9IHt4OiAwLCB5OiAwLCB0eXBlOiAndW5pbml0aWFsaXplZCd9XG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgYnV0dG9uXG5cdFx0QGJ1dHRvblxuXG5cdGRlZiB0b3VjaFxuXHRcdEB0b3VjaFxuXG5cdGRlZiB1cGRhdGUgZVxuXHRcdEBldmVudCA9IGVcblx0XHRAZGlydHkgPSB5ZXNcblx0XHRzZWxmXG5cblx0IyB0aGlzIGlzIGp1c3QgZm9yIHJlZ3VsYXIgbW91c2Ugbm93XG5cdGRlZiBwcm9jZXNzXG5cdFx0dmFyIGUxID0gQGV2ZW50XG5cblx0XHRpZiBAZGlydHlcblx0XHRcdEBwcmV2RXZlbnQgPSBlMVxuXHRcdFx0QGRpcnR5ID0gbm9cblxuXHRcdFx0IyBidXR0b24gc2hvdWxkIG9ubHkgY2hhbmdlIG9uIG1vdXNlZG93biBldGNcblx0XHRcdGlmIGUxOnR5cGUgPT0gJ21vdXNlZG93bidcblx0XHRcdFx0QGJ1dHRvbiA9IGUxOmJ1dHRvblxuXG5cdFx0XHRcdGlmIChAdG91Y2ggYW5kIEBidXR0b24gIT0gMClcblx0XHRcdFx0XHRyZXR1cm5cblxuXHRcdFx0XHQjIGNhbmNlbCB0aGUgcHJldmlvdXMgdG91Y2hcblx0XHRcdFx0QHRvdWNoLmNhbmNlbCBpZiBAdG91Y2hcblx0XHRcdFx0QHRvdWNoID0gSW1iYS5Ub3VjaC5uZXcoZTEsc2VsZilcblx0XHRcdFx0QHRvdWNoLm1vdXNlZG93bihlMSxlMSlcblxuXHRcdFx0ZWxpZiBlMTp0eXBlID09ICdtb3VzZW1vdmUnXG5cdFx0XHRcdEB0b3VjaC5tb3VzZW1vdmUoZTEsZTEpIGlmIEB0b3VjaFxuXG5cdFx0XHRlbGlmIGUxOnR5cGUgPT0gJ21vdXNldXAnXG5cdFx0XHRcdEBidXR0b24gPSAtMVxuXG5cdFx0XHRcdGlmIEB0b3VjaCBhbmQgQHRvdWNoLmJ1dHRvbiA9PSBlMTpidXR0b25cblx0XHRcdFx0XHRAdG91Y2gubW91c2V1cChlMSxlMSlcblx0XHRcdFx0XHRAdG91Y2ggPSBudWxsXG5cdFx0XHRcdCMgdHJpZ2dlciBwb2ludGVydXBcblx0XHRlbGlmIEB0b3VjaFxuXHRcdFx0QHRvdWNoLmlkbGVcblx0XHRzZWxmXG5cblx0ZGVmIHggZG8gQGV2ZW50Onhcblx0ZGVmIHkgZG8gQGV2ZW50Onlcblx0XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL3BvaW50ZXIuaW1iYSIsImV4dGVybiBldmFsXG5cbmV4cG9ydCB0YWcgU25pcHBldFxuXHRwcm9wIHNyY1xuXHRwcm9wIGhlYWRpbmdcblx0cHJvcCBobFxuXHRcblx0ZGVmIHNlbGYucmVwbGFjZSBkb21cblx0XHRsZXQgaW1iYSA9IGRvbTpmaXJzdENoaWxkXG5cdFx0bGV0IGpzID0gaW1iYTpuZXh0U2libGluZ1xuXHRcdGxldCBoaWdobGlnaHRlZCA9IGltYmE6aW5uZXJIVE1MXG5cdFx0bGV0IHJhdyA9IGRvbTp0ZXh0Q29udGVudFxuXHRcdGxldCBkYXRhID1cblx0XHRcdGNvZGU6IHJhd1xuXHRcdFx0aHRtbDogaGlnaGxpZ2h0ZWRcblx0XHRcdGpzOiB7XG5cdFx0XHRcdGNvZGU6IGpzOnRleHRDb250ZW50XG5cdFx0XHRcdGh0bWw6IGpzOmlubmVySFRNTFxuXHRcdFx0fVxuXG5cdFx0bGV0IHNuaXBwZXQgPSA8U25pcHBldFtkYXRhXT5cblx0XHRkb206cGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoc25pcHBldC5kb20sZG9tKVxuXHRcdHJldHVybiBzbmlwcGV0XG5cdFx0XG5cdGRlZiBzZXR1cFxuXHRcdHJlbmRlclxuXHRcdEBjb2RlLmRvbTppbm5lckhUTUwgPSBkYXRhOmh0bWxcblx0XHRydW5cblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBydW5cblx0XHR2YXIgb3JpZyA9IEltYmE6bW91bnRcblx0XHRcblx0XHQjIHZhciBqcyA9ICd2YXIgcmVxdWlyZSA9IGZ1bmN0aW9uKCl7IHJldHVybiBJbWJhIH07XFxuJyArIGRhdGE6anM6Y29kZVxuXHRcdHZhciBqcyA9IGRhdGE6anM6Y29kZVxuXHRcdGNvbnNvbGUubG9nIEltYmFcblx0XHRqcyA9IGpzLnJlcGxhY2UoXCJyZXF1aXJlKCdpbWJhJylcIiwnd2luZG93LkltYmEnKVxuXHRcdHRyeVxuXHRcdFx0SW1iYTptb3VudCA9IGRvIHxpdGVtfCBvcmlnLmNhbGwoSW1iYSxpdGVtLEByZXN1bHQuZG9tKVxuXHRcdFx0Y29uc29sZS5sb2cgXCJydW4gY29kZVwiLCBqc1xuXHRcdFx0ZXZhbChqcylcblx0XHRcblx0XHRJbWJhOm1vdW50ID0gb3JpZ1xuXHRcdHNlbGZcblxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZi5zbmlwcGV0PlxuXHRcdFx0PGNvZGVAY29kZT5cblx0XHRcdDxkaXZAcmVzdWx0LnN0eWxlZC1leGFtcGxlPlxuXHRcdFxuZXhwb3J0IHRhZyBFeGFtcGxlIDwgU25pcHBldFxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj4gXCJFeGFtcGxlXCJcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvU25pcHBldC5pbWJhIiwiXG5pbXBvcnQgQXBwIGZyb20gJy4vYXBwJ1xuaW1wb3J0IFNpdGUgZnJvbSAnLi92aWV3cy9TaXRlJ1xuZG9jdW1lbnQ6Ym9keTppbm5lckhUTUwgPSAnJyBcbkltYmEubW91bnQgPFNpdGVbQVBQID0gQXBwLmRlc2VyaWFsaXplKEFQUENBQ0hFKV0+XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2NsaWVudC5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi9pbWJhXCIpXG52YXIgYWN0aXZhdGUgPSBub1xuaWYgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcblx0aWYgd2luZG93LkltYmFcblx0XHRjb25zb2xlLndhcm4gXCJJbWJhIHZ7d2luZG93LkltYmEuVkVSU0lPTn0gaXMgYWxyZWFkeSBsb2FkZWQuXCJcblx0XHRJbWJhID0gd2luZG93LkltYmFcblx0ZWxzZVxuXHRcdHdpbmRvdy5JbWJhID0gSW1iYVxuXHRcdGFjdGl2YXRlID0geWVzXG5cdFx0aWYgd2luZG93OmRlZmluZSBhbmQgd2luZG93OmRlZmluZTphbWRcblx0XHRcdHdpbmRvdy5kZWZpbmUoXCJpbWJhXCIsW10pIGRvIHJldHVybiBJbWJhXG5cbm1vZHVsZS5leHBvcnRzID0gSW1iYVxuXG51bmxlc3MgJHdlYndvcmtlciRcblx0cmVxdWlyZSAnLi9zY2hlZHVsZXInXG5cdHJlcXVpcmUgJy4vZG9tL2luZGV4J1xuXG5pZiAkd2ViJCBhbmQgYWN0aXZhdGVcblx0SW1iYS5FdmVudE1hbmFnZXIuYWN0aXZhdGVcblx0XG5pZiAkbm9kZSRcblx0dW5sZXNzICR3ZWJwYWNrJFxuXHRcdHJlcXVpcmUgJy4uLy4uL3JlZ2lzdGVyLmpzJ1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvaW5kZXguaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4vaW1iYVwiKVxuXG52YXIgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICMgdmVyeSBzaW1wbGUgcmFmIHBvbHlmaWxsXG52YXIgY2FuY2VsQW5pbWF0aW9uRnJhbWVcblxuaWYgJG5vZGUkXG5cdGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZG8gfGlkfCBjbGVhclRpbWVvdXQoaWQpXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGRvIHxibGt8IHNldFRpbWVvdXQoYmxrLDEwMDAgLyA2MClcblxuaWYgJHdlYiRcblx0Y2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3c6Y2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Om1vekNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdzp3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93OnJlcXVlc3RBbmltYXRpb25GcmFtZVxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHw9IHdpbmRvdzp3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8PSB3aW5kb3c6bW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSB8fD0gZG8gfGJsa3wgc2V0VGltZW91dChibGssMTAwMCAvIDYwKVxuXG5jbGFzcyBUaWNrZXJcblxuXHRwcm9wIHN0YWdlXG5cdHByb3AgcXVldWVcblxuXHRkZWYgaW5pdGlhbGl6ZVxuXHRcdEBxdWV1ZSA9IFtdXG5cdFx0QHN0YWdlID0gLTFcblx0XHRAc2NoZWR1bGVkID0gbm9cblx0XHRAdGlja2VyID0gZG8gfGV8XG5cdFx0XHRAc2NoZWR1bGVkID0gbm9cblx0XHRcdHRpY2soZSlcblx0XHRzZWxmXG5cblx0ZGVmIGFkZCBpdGVtLCBmb3JjZVxuXHRcdGlmIGZvcmNlIG9yIEBxdWV1ZS5pbmRleE9mKGl0ZW0pID09IC0xXG5cdFx0XHRAcXVldWUucHVzaChpdGVtKVxuXG5cdFx0c2NoZWR1bGUgdW5sZXNzIEBzY2hlZHVsZWRcblxuXHRkZWYgdGljayB0aW1lc3RhbXBcblx0XHR2YXIgaXRlbXMgPSBAcXVldWVcblx0XHRAdHMgPSB0aW1lc3RhbXAgdW5sZXNzIEB0c1xuXHRcdEBkdCA9IHRpbWVzdGFtcCAtIEB0c1xuXHRcdEB0cyA9IHRpbWVzdGFtcFxuXHRcdEBxdWV1ZSA9IFtdXG5cdFx0QHN0YWdlID0gMVxuXHRcdGJlZm9yZVxuXHRcdGlmIGl0ZW1zOmxlbmd0aFxuXHRcdFx0Zm9yIGl0ZW0saSBpbiBpdGVtc1xuXHRcdFx0XHRpZiBpdGVtIGlzYSBGdW5jdGlvblxuXHRcdFx0XHRcdGl0ZW0oQGR0LHNlbGYpXG5cdFx0XHRcdGVsaWYgaXRlbTp0aWNrXG5cdFx0XHRcdFx0aXRlbS50aWNrKEBkdCxzZWxmKVxuXHRcdEBzdGFnZSA9IDJcblx0XHRhZnRlclxuXHRcdEBzdGFnZSA9IEBzY2hlZHVsZWQgPyAwIDogLTFcblx0XHRzZWxmXG5cblx0ZGVmIHNjaGVkdWxlXG5cdFx0aWYgIUBzY2hlZHVsZWRcblx0XHRcdEBzY2hlZHVsZWQgPSB5ZXNcblx0XHRcdGlmIEBzdGFnZSA9PSAtMVxuXHRcdFx0XHRAc3RhZ2UgPSAwXG5cdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoQHRpY2tlcilcblx0XHRzZWxmXG5cblx0ZGVmIGJlZm9yZVxuXHRcdHNlbGZcblxuXHRkZWYgYWZ0ZXJcblx0XHRpZiBJbWJhLlRhZ01hbmFnZXJcblx0XHRcdEltYmEuVGFnTWFuYWdlci5yZWZyZXNoXG5cdFx0c2VsZlxuXG5JbWJhLlRJQ0tFUiA9IFRpY2tlci5uZXdcbkltYmEuU0NIRURVTEVSUyA9IFtdXG5cbmRlZiBJbWJhLnRpY2tlclxuXHRJbWJhLlRJQ0tFUlxuXG5kZWYgSW1iYS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgY2FsbGJhY2tcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNhbGxiYWNrKVxuXG5kZWYgSW1iYS5jYW5jZWxBbmltYXRpb25GcmFtZSBpZFxuXHRjYW5jZWxBbmltYXRpb25GcmFtZShpZClcblxuIyBzaG91bGQgYWRkIGFuIEltYmEucnVuIC8gc2V0SW1tZWRpYXRlIHRoYXRcbiMgcHVzaGVzIGxpc3RlbmVyIG9udG8gdGhlIHRpY2stcXVldWUgd2l0aCB0aW1lcyAtIG9uY2VcblxudmFyIGNvbW1pdFF1ZXVlID0gMFxuXG5kZWYgSW1iYS5jb21taXQgcGFyYW1zXG5cdGNvbW1pdFF1ZXVlKytcblx0IyBJbWJhLlRhZ01hbmFnZXIucmVmcmVzaFxuXHRJbWJhLmVtaXQoSW1iYSwnY29tbWl0JyxwYXJhbXMgIT0gdW5kZWZpbmVkID8gW3BhcmFtc10gOiB1bmRlZmluZWQpXG5cdGlmIC0tY29tbWl0UXVldWUgPT0gMFxuXHRcdEltYmEuVGFnTWFuYWdlciBhbmQgSW1iYS5UYWdNYW5hZ2VyLnJlZnJlc2hcblx0cmV0dXJuXG5cbiMjI1xuXG5JbnN0YW5jZXMgb2YgSW1iYS5TY2hlZHVsZXIgbWFuYWdlcyB3aGVuIHRvIGNhbGwgYHRpY2soKWAgb24gdGhlaXIgdGFyZ2V0LFxuYXQgYSBzcGVjaWZpZWQgZnJhbWVyYXRlIG9yIHdoZW4gY2VydGFpbiBldmVudHMgb2NjdXIuIFJvb3Qtbm9kZXMgaW4geW91clxuYXBwbGljYXRpb25zIHdpbGwgdXN1YWxseSBoYXZlIGEgc2NoZWR1bGVyIHRvIG1ha2Ugc3VyZSB0aGV5IHJlcmVuZGVyIHdoZW5cbnNvbWV0aGluZyBjaGFuZ2VzLiBJdCBpcyBhbHNvIHBvc3NpYmxlIHRvIG1ha2UgaW5uZXIgY29tcG9uZW50cyB1c2UgdGhlaXJcbm93biBzY2hlZHVsZXJzIHRvIGNvbnRyb2wgd2hlbiB0aGV5IHJlbmRlci5cblxuQGluYW1lIHNjaGVkdWxlclxuXG4jIyNcbmNsYXNzIEltYmEuU2NoZWR1bGVyXG5cdFxuXHR2YXIgY291bnRlciA9IDBcblxuXHRkZWYgc2VsZi5ldmVudCBlXG5cdFx0SW1iYS5lbWl0KEltYmEsJ2V2ZW50JyxlKVxuXG5cdCMjI1xuXHRDcmVhdGUgYSBuZXcgSW1iYS5TY2hlZHVsZXIgZm9yIHNwZWNpZmllZCB0YXJnZXRcblx0QHJldHVybiB7SW1iYS5TY2hlZHVsZXJ9XG5cdCMjI1xuXHRkZWYgaW5pdGlhbGl6ZSB0YXJnZXRcblx0XHRAaWQgPSBjb3VudGVyKytcblx0XHRAdGFyZ2V0ID0gdGFyZ2V0XG5cdFx0QG1hcmtlZCA9IG5vXG5cdFx0QGFjdGl2ZSA9IG5vXG5cdFx0QG1hcmtlciA9IGRvIG1hcmtcblx0XHRAdGlja2VyID0gZG8gfGV8IHRpY2soZSlcblxuXHRcdEBkdCA9IDBcblx0XHRAZnJhbWUgPSB7fVxuXHRcdEBzY2hlZHVsZWQgPSBub1xuXHRcdEB0aW1lc3RhbXAgPSAwXG5cdFx0QHRpY2tzID0gMFxuXHRcdEBmbHVzaGVzID0gMFxuXG5cdFx0c2VsZjpvbmV2ZW50ID0gc2VsZjpvbmV2ZW50LmJpbmQoc2VsZilcblx0XHRzZWxmXG5cblx0cHJvcCByYWYgd2F0Y2g6IHllc1xuXHRwcm9wIGludGVydmFsIHdhdGNoOiB5ZXNcblx0cHJvcCBldmVudHMgd2F0Y2g6IHllc1xuXHRwcm9wIG1hcmtlZFxuXG5cdGRlZiByYWZEaWRTZXQgYm9vbFxuXHRcdHJlcXVlc3RUaWNrIGlmIGJvb2wgYW5kIEBhY3RpdmVcblx0XHRzZWxmXG5cblx0ZGVmIGludGVydmFsRGlkU2V0IHRpbWVcblx0XHRjbGVhckludGVydmFsKEBpbnRlcnZhbElkKVxuXHRcdEBpbnRlcnZhbElkID0gbnVsbFxuXHRcdGlmIHRpbWUgYW5kIEBhY3RpdmVcblx0XHRcdEBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoc2VsZjpvbmludGVydmFsLmJpbmQoc2VsZiksdGltZSlcblx0XHRzZWxmXG5cblx0ZGVmIGV2ZW50c0RpZFNldCBuZXcsIHByZXZcblx0XHRpZiBAYWN0aXZlIGFuZCBuZXcgYW5kICFwcmV2XG5cdFx0XHRJbWJhLmxpc3RlbihJbWJhLCdjb21taXQnLHNlbGYsJ29uZXZlbnQnKVxuXHRcdGVsaWYgIW5ldyBhbmQgcHJldlxuXHRcdFx0SW1iYS51bmxpc3RlbihJbWJhLCdjb21taXQnLHNlbGYsJ29uZXZlbnQnKVxuXG5cdCMjI1xuXHRDaGVjayB3aGV0aGVyIHRoZSBjdXJyZW50IHNjaGVkdWxlciBpcyBhY3RpdmUgb3Igbm90XG5cdEByZXR1cm4ge2Jvb2x9XG5cdCMjI1xuXHRkZWYgYWN0aXZlXG5cdFx0QGFjdGl2ZVxuXG5cdCMjI1xuXHREZWx0YSB0aW1lIGJldHdlZW4gdGhlIHR3byBsYXN0IHRpY2tzXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiBkdFxuXHRcdEBkdFxuXG5cdCMjI1xuXHRDb25maWd1cmUgdGhlIHNjaGVkdWxlclxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGNvbmZpZ3VyZSBvcHRpb25zID0ge31cblx0XHRyYWYgPSBvcHRpb25zOnJhZiBpZiBvcHRpb25zOnJhZiAhPSB1bmRlZmluZWRcblx0XHRpbnRlcnZhbCA9IG9wdGlvbnM6aW50ZXJ2YWwgaWYgb3B0aW9uczppbnRlcnZhbCAhPSB1bmRlZmluZWRcblx0XHRldmVudHMgPSBvcHRpb25zOmV2ZW50cyBpZiBvcHRpb25zOmV2ZW50cyAhPSB1bmRlZmluZWRcblx0XHRzZWxmXG5cblx0IyMjXG5cdE1hcmsgdGhlIHNjaGVkdWxlciBhcyBkaXJ0eS4gVGhpcyB3aWxsIG1ha2Ugc3VyZSB0aGF0XG5cdHRoZSBzY2hlZHVsZXIgY2FsbHMgYHRhcmdldC50aWNrYCBvbiB0aGUgbmV4dCBmcmFtZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIG1hcmtcblx0XHRAbWFya2VkID0geWVzXG5cdFx0aWYgIUBzY2hlZHVsZWRcblx0XHRcdHJlcXVlc3RUaWNrXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRJbnN0YW50bHkgdHJpZ2dlciB0YXJnZXQudGljayBhbmQgbWFyayBzY2hlZHVsZXIgYXMgY2xlYW4gKG5vdCBkaXJ0eS9tYXJrZWQpLlxuXHRUaGlzIGlzIGNhbGxlZCBpbXBsaWNpdGx5IGZyb20gdGljaywgYnV0IGNhbiBhbHNvIGJlIGNhbGxlZCBtYW51YWxseSBpZiB5b3Vcblx0cmVhbGx5IHdhbnQgdG8gZm9yY2UgYSB0aWNrIHdpdGhvdXQgd2FpdGluZyBmb3IgdGhlIG5leHQgZnJhbWUuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgZmx1c2hcblx0XHRAZmx1c2hlcysrXG5cdFx0QHRhcmdldC50aWNrKHNlbGYpXG5cdFx0QG1hcmtlZCA9IG5vXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRAZml4bWUgdGhpcyBleHBlY3RzIHJhZiB0byBydW4gYXQgNjAgZnBzIFxuXG5cdENhbGxlZCBhdXRvbWF0aWNhbGx5IG9uIGV2ZXJ5IGZyYW1lIHdoaWxlIHRoZSBzY2hlZHVsZXIgaXMgYWN0aXZlLlxuXHRJdCB3aWxsIG9ubHkgY2FsbCBgdGFyZ2V0LnRpY2tgIGlmIHRoZSBzY2hlZHVsZXIgaXMgbWFya2VkIGRpcnR5LFxuXHRvciB3aGVuIGFjY29yZGluZyB0byBAZnBzIHNldHRpbmcuXG5cblx0SWYgeW91IGhhdmUgc2V0IHVwIGEgc2NoZWR1bGVyIHdpdGggYW4gZnBzIG9mIDEsIHRpY2sgd2lsbCBzdGlsbCBiZVxuXHRjYWxsZWQgZXZlcnkgZnJhbWUsIGJ1dCBgdGFyZ2V0LnRpY2tgIHdpbGwgb25seSBiZSBjYWxsZWQgb25jZSBldmVyeVxuXHRzZWNvbmQsIGFuZCBpdCB3aWxsICptYWtlIHN1cmUqIGVhY2ggYHRhcmdldC50aWNrYCBoYXBwZW5zIGluIHNlcGFyYXRlXG5cdHNlY29uZHMgYWNjb3JkaW5nIHRvIERhdGUuIFNvIGlmIHlvdSBoYXZlIGEgbm9kZSB0aGF0IHJlbmRlcnMgYSBjbG9ja1xuXHRiYXNlZCBvbiBEYXRlLm5vdyAob3Igc29tZXRoaW5nIHNpbWlsYXIpLCB5b3UgY2FuIHNjaGVkdWxlIGl0IHdpdGggMWZwcyxcblx0bmV2ZXIgbmVlZGluZyB0byB3b3JyeSBhYm91dCB0d28gdGlja3MgaGFwcGVuaW5nIHdpdGhpbiB0aGUgc2FtZSBzZWNvbmQuXG5cdFRoZSBzYW1lIGdvZXMgZm9yIDRmcHMsIDEwZnBzIGV0Yy5cblxuXHRAcHJvdGVjdGVkXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgdGljayBkZWx0YSwgdGlja2VyXG5cdFx0QHRpY2tzKytcblx0XHRAZHQgPSBkZWx0YVxuXG5cdFx0aWYgdGlja2VyXG5cdFx0XHRAc2NoZWR1bGVkID0gbm9cblxuXHRcdGZsdXNoXG5cblx0XHRpZiBAcmFmIGFuZCBAYWN0aXZlXG5cdFx0XHRyZXF1ZXN0VGlja1xuXHRcdHNlbGZcblxuXHRkZWYgcmVxdWVzdFRpY2tcblx0XHR1bmxlc3MgQHNjaGVkdWxlZFxuXHRcdFx0QHNjaGVkdWxlZCA9IHllc1xuXHRcdFx0SW1iYS5USUNLRVIuYWRkKHNlbGYpXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTdGFydCB0aGUgc2NoZWR1bGVyIGlmIGl0IGlzIG5vdCBhbHJlYWR5IGFjdGl2ZS5cblx0KipXaGlsZSBhY3RpdmUqKiwgdGhlIHNjaGVkdWxlciB3aWxsIG92ZXJyaWRlIGB0YXJnZXQuY29tbWl0YFxuXHR0byBkbyBub3RoaW5nLiBCeSBkZWZhdWx0IEltYmEudGFnI2NvbW1pdCBjYWxscyByZW5kZXIsIHNvXG5cdHRoYXQgcmVuZGVyaW5nIGlzIGNhc2NhZGVkIHRocm91Z2ggdG8gY2hpbGRyZW4gd2hlbiByZW5kZXJpbmdcblx0YSBub2RlLiBXaGVuIGEgc2NoZWR1bGVyIGlzIGFjdGl2ZSAoZm9yIGEgbm9kZSksIEltYmEgZGlzYWJsZXNcblx0dGhpcyBhdXRvbWF0aWMgcmVuZGVyaW5nLlxuXHQjIyNcblx0ZGVmIGFjdGl2YXRlIGltbWVkaWF0ZSA9IHllc1xuXHRcdHVubGVzcyBAYWN0aXZlXG5cdFx0XHRAYWN0aXZlID0geWVzXG5cdFx0XHRAY29tbWl0ID0gQHRhcmdldDpjb21taXRcblx0XHRcdEB0YXJnZXQ6Y29tbWl0ID0gZG8gdGhpc1xuXHRcdFx0QHRhcmdldD8uZmxhZygnc2NoZWR1bGVkXycpXG5cdFx0XHRJbWJhLlNDSEVEVUxFUlMucHVzaChzZWxmKVxuXHRcdFx0XG5cdFx0XHRpZiBAZXZlbnRzXG5cdFx0XHRcdEltYmEubGlzdGVuKEltYmEsJ2NvbW1pdCcsc2VsZiwnb25ldmVudCcpXG5cdFx0XHRcdFxuXHRcdFx0aWYgQGludGVydmFsIGFuZCAhQGludGVydmFsSWRcblx0XHRcdFx0QGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChzZWxmOm9uaW50ZXJ2YWwuYmluZChzZWxmKSxAaW50ZXJ2YWwpXG5cblx0XHRcdGlmIGltbWVkaWF0ZVxuXHRcdFx0XHR0aWNrKDApXG5cdFx0XHRlbGlmIEByYWZcblx0XHRcdFx0cmVxdWVzdFRpY2tcblx0XHRyZXR1cm4gc2VsZlxuXG5cdCMjI1xuXHRTdG9wIHRoZSBzY2hlZHVsZXIgaWYgaXQgaXMgYWN0aXZlLlxuXHQjIyNcblx0ZGVmIGRlYWN0aXZhdGVcblx0XHRpZiBAYWN0aXZlXG5cdFx0XHRAYWN0aXZlID0gbm9cblx0XHRcdEB0YXJnZXQ6Y29tbWl0ID0gQGNvbW1pdFxuXHRcdFx0bGV0IGlkeCA9IEltYmEuU0NIRURVTEVSUy5pbmRleE9mKHNlbGYpXG5cdFx0XHRpZiBpZHggPj0gMFxuXHRcdFx0XHRJbWJhLlNDSEVEVUxFUlMuc3BsaWNlKGlkeCwxKVxuXHRcdFx0XHRcblx0XHRcdGlmIEBldmVudHNcblx0XHRcdFx0SW1iYS51bmxpc3RlbihJbWJhLCdjb21taXQnLHNlbGYsJ29uZXZlbnQnKVxuXG5cdFx0XHRpZiBAaW50ZXJ2YWxJZFxuXHRcdFx0XHRjbGVhckludGVydmFsKEBpbnRlcnZhbElkKVxuXHRcdFx0XHRAaW50ZXJ2YWxJZCA9IG51bGxcblx0XHRcdFxuXHRcdFx0QHRhcmdldD8udW5mbGFnKCdzY2hlZHVsZWRfJylcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiB0cmFja1xuXHRcdEBtYXJrZXJcblx0XHRcblx0ZGVmIG9uaW50ZXJ2YWxcblx0XHR0aWNrXG5cdFx0SW1iYS5UYWdNYW5hZ2VyLnJlZnJlc2hcblx0XHRzZWxmXG5cblx0ZGVmIG9uZXZlbnQgZXZlbnRcblx0XHRyZXR1cm4gc2VsZiBpZiAhQGV2ZW50cyBvciBAbWFya2VkXG5cblx0XHRpZiBAZXZlbnRzIGlzYSBGdW5jdGlvblxuXHRcdFx0bWFyayBpZiBAZXZlbnRzKGV2ZW50LHNlbGYpXG5cdFx0ZWxpZiBAZXZlbnRzIGlzYSBBcnJheVxuXHRcdFx0aWYgQGV2ZW50cy5pbmRleE9mKChldmVudCBhbmQgZXZlbnQ6dHlwZSkgb3IgZXZlbnQpID49IDBcblx0XHRcdFx0bWFya1xuXHRcdGVsc2Vcblx0XHRcdG1hcmtcblx0XHRzZWxmXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9zY2hlZHVsZXIuaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxucmVxdWlyZSAnLi9tYW5hZ2VyJ1xuXG5JbWJhLlRhZ01hbmFnZXIgPSBJbWJhLlRhZ01hbmFnZXJDbGFzcy5uZXdcblxucmVxdWlyZSAnLi90YWcnXG5yZXF1aXJlICcuL2h0bWwnXG5yZXF1aXJlICcuL3BvaW50ZXInXG5yZXF1aXJlICcuL3RvdWNoJ1xucmVxdWlyZSAnLi9ldmVudCdcbnJlcXVpcmUgJy4vZXZlbnQtbWFuYWdlcidcblxuaWYgJHdlYiRcblx0cmVxdWlyZSAnLi9yZWNvbmNpbGVyJ1xuXG5pZiAkbm9kZSRcblx0cmVxdWlyZSAnLi9zZXJ2ZXInXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL2luZGV4LmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbmNsYXNzIEltYmEuVGFnTWFuYWdlckNsYXNzXG5cdGRlZiBpbml0aWFsaXplXG5cdFx0QGluc2VydHMgPSAwXG5cdFx0QHJlbW92ZXMgPSAwXG5cdFx0QG1vdW50ZWQgPSBbXVxuXHRcdEBoYXNNb3VudGFibGVzID0gbm9cblx0XHRzZWxmXG5cblx0ZGVmIG1vdW50ZWRcblx0XHRAbW91bnRlZFxuXG5cdGRlZiBpbnNlcnQgbm9kZSwgcGFyZW50XG5cdFx0QGluc2VydHMrK1xuXG5cdGRlZiByZW1vdmUgbm9kZSwgcGFyZW50XG5cdFx0QHJlbW92ZXMrK1xuXG5cdGRlZiBjaGFuZ2VzXG5cdFx0QGluc2VydHMgKyBAcmVtb3Zlc1xuXG5cdGRlZiBtb3VudCBub2RlXG5cdFx0cmV0dXJuIGlmICRub2RlJFxuXHRcdEBoYXNNb3VudGFibGVzID0geWVzXG5cblx0ZGVmIHJlZnJlc2ggZm9yY2UgPSBub1xuXHRcdHJldHVybiBpZiAkbm9kZSRcblx0XHRyZXR1cm4gaWYgIWZvcmNlIGFuZCBjaGFuZ2VzID09IDBcblx0XHQjIGNvbnNvbGUudGltZSgncmVzb2x2ZU1vdW50cycpXG5cdFx0aWYgKEBpbnNlcnRzIGFuZCBAaGFzTW91bnRhYmxlcykgb3IgZm9yY2Vcblx0XHRcdHRyeU1vdW50XG5cblx0XHRpZiAoQHJlbW92ZXMgb3IgZm9yY2UpIGFuZCBAbW91bnRlZDpsZW5ndGhcblx0XHRcdHRyeVVubW91bnRcblx0XHQjIGNvbnNvbGUudGltZUVuZCgncmVzb2x2ZU1vdW50cycpXG5cdFx0QGluc2VydHMgPSAwXG5cdFx0QHJlbW92ZXMgPSAwXG5cdFx0c2VsZlxuXG5cdGRlZiB1bm1vdW50IG5vZGVcblx0XHRzZWxmXG5cblx0ZGVmIHRyeU1vdW50XG5cdFx0dmFyIGNvdW50ID0gMFxuXHRcdHZhciByb290ID0gZG9jdW1lbnQ6Ym9keVxuXHRcdHZhciBpdGVtcyA9IHJvb3QucXVlcnlTZWxlY3RvckFsbCgnLl9fbW91bnQnKVxuXHRcdCMgd2hhdCBpZiB3ZSBlbmQgdXAgY3JlYXRpbmcgYWRkaXRpb25hbCBtb3VudGFibGVzIGJ5IG1vdW50aW5nP1xuXHRcdGZvciBlbCBpbiBpdGVtc1xuXHRcdFx0aWYgZWwgYW5kIGVsLkB0YWdcblx0XHRcdFx0aWYgQG1vdW50ZWQuaW5kZXhPZihlbC5AdGFnKSA9PSAtMVxuXHRcdFx0XHRcdG1vdW50Tm9kZShlbC5AdGFnKVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIG1vdW50Tm9kZSBub2RlXG5cdFx0QG1vdW50ZWQucHVzaChub2RlKVxuXHRcdG5vZGUuRkxBR1MgfD0gSW1iYS5UQUdfTU9VTlRFRFxuXHRcdG5vZGUubW91bnQgaWYgbm9kZTptb3VudFxuXHRcdHJldHVyblxuXG5cdGRlZiB0cnlVbm1vdW50XG5cdFx0dmFyIGNvdW50ID0gMFxuXHRcdHZhciByb290ID0gZG9jdW1lbnQ6Ym9keVxuXHRcdGZvciBpdGVtLCBpIGluIEBtb3VudGVkXG5cdFx0XHR1bmxlc3MgZG9jdW1lbnQ6ZG9jdW1lbnRFbGVtZW50LmNvbnRhaW5zKGl0ZW0uQGRvbSlcblx0XHRcdFx0aXRlbS5GTEFHUyA9IGl0ZW0uRkxBR1MgJiB+SW1iYS5UQUdfTU9VTlRFRFxuXHRcdFx0XHRpZiBpdGVtOnVubW91bnQgYW5kIGl0ZW0uQGRvbVxuXHRcdFx0XHRcdGl0ZW0udW5tb3VudFxuXHRcdFx0XHRlbGlmIGl0ZW0uQHNjaGVkdWxlclxuXHRcdFx0XHRcdCMgTUFZQkUgRklYIFRISVM/XG5cdFx0XHRcdFx0aXRlbS51bnNjaGVkdWxlXG5cdFx0XHRcdEBtb3VudGVkW2ldID0gbnVsbFxuXHRcdFx0XHRjb3VudCsrXG5cdFx0XG5cdFx0aWYgY291bnRcblx0XHRcdEBtb3VudGVkID0gQG1vdW50ZWQuZmlsdGVyIGRvIHxpdGVtfCBpdGVtXG5cdFx0c2VsZlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9tYW5hZ2VyLmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbkltYmEuQ1NTS2V5TWFwID0ge31cblxuSW1iYS5UQUdfQlVJTFQgPSAxXG5JbWJhLlRBR19TRVRVUCA9IDJcbkltYmEuVEFHX01PVU5USU5HID0gNFxuSW1iYS5UQUdfTU9VTlRFRCA9IDhcbkltYmEuVEFHX1NDSEVEVUxFRCA9IDE2XG5JbWJhLlRBR19BV0FLRU5FRCA9IDMyXG5cbiMjI1xuR2V0IHRoZSBjdXJyZW50IGRvY3VtZW50XG4jIyNcbmRlZiBJbWJhLmRvY3VtZW50XG5cdGlmICR3ZWIkXG5cdFx0d2luZG93OmRvY3VtZW50XG5cdGVsc2Vcblx0XHRAZG9jdW1lbnQgfHw9IEltYmFTZXJ2ZXJEb2N1bWVudC5uZXdcblxuIyMjXG5HZXQgdGhlIGJvZHkgZWxlbWVudCB3cmFwcGVkIGluIGFuIEltYmEuVGFnXG4jIyNcbmRlZiBJbWJhLnJvb3Rcblx0dGFnKEltYmEuZG9jdW1lbnQ6Ym9keSlcblxuZGVmIEltYmEuc3RhdGljIGl0ZW1zLCB0eXAsIG5yXG5cdGl0ZW1zLkB0eXBlID0gdHlwXG5cdGl0ZW1zOnN0YXRpYyA9IG5yXG5cdHJldHVybiBpdGVtc1xuXG4jIyNcblxuIyMjXG5kZWYgSW1iYS5tb3VudCBub2RlLCBpbnRvXG5cdGludG8gfHw9IEltYmEuZG9jdW1lbnQ6Ym9keVxuXHRpbnRvLmFwcGVuZENoaWxkKG5vZGUuZG9tKVxuXHRJbWJhLlRhZ01hbmFnZXIuaW5zZXJ0KG5vZGUsaW50bylcblx0bm9kZS5zY2hlZHVsZXIuY29uZmlndXJlKGV2ZW50czogeWVzKS5hY3RpdmF0ZShubylcblx0SW1iYS5UYWdNYW5hZ2VyLnJlZnJlc2hcblx0cmV0dXJuIG5vZGVcblxuXG5kZWYgSW1iYS5jcmVhdGVUZXh0Tm9kZSBub2RlXG5cdGlmIG5vZGUgYW5kIG5vZGU6bm9kZVR5cGUgPT0gM1xuXHRcdHJldHVybiBub2RlXG5cdHJldHVybiBJbWJhLmRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpXG5cbiMjI1xuVGhpcyBpcyB0aGUgYmFzZWNsYXNzIHRoYXQgYWxsIHRhZ3MgaW4gaW1iYSBpbmhlcml0IGZyb20uXG5AaW5hbWUgbm9kZVxuIyMjXG5jbGFzcyBJbWJhLlRhZ1xuXG5cdGRlZiBzZWxmLmJ1aWxkTm9kZVxuXHRcdHZhciBkb20gPSBJbWJhLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoQG5vZGVUeXBlIG9yICdkaXYnKVxuXHRcdGlmIEBjbGFzc2VzXG5cdFx0XHR2YXIgY2xzID0gQGNsYXNzZXMuam9pbihcIiBcIilcblx0XHRcdGRvbTpjbGFzc05hbWUgPSBjbHMgaWYgY2xzXG5cdFx0ZG9tXG5cblx0ZGVmIHNlbGYuY3JlYXRlTm9kZVxuXHRcdHZhciBwcm90byA9IChAcHJvdG9Eb20gfHw9IGJ1aWxkTm9kZSlcblx0XHRwcm90by5jbG9uZU5vZGUoZmFsc2UpXG5cblx0ZGVmIHNlbGYuYnVpbGQgY3R4XG5cdFx0c2VsZi5uZXcoc2VsZi5jcmVhdGVOb2RlLGN0eClcblxuXHRkZWYgc2VsZi5kb21cblx0XHRAcHJvdG9Eb20gfHw9IGJ1aWxkTm9kZVxuXG5cdCMjI1xuXHRDYWxsZWQgd2hlbiBhIHRhZyB0eXBlIGlzIGJlaW5nIHN1YmNsYXNzZWQuXG5cdCMjI1xuXHRkZWYgc2VsZi5pbmhlcml0IGNoaWxkXG5cdFx0Y2hpbGQuQHByb3RvRG9tID0gbnVsbFxuXG5cdFx0aWYgQG5vZGVUeXBlXG5cdFx0XHRjaGlsZC5Abm9kZVR5cGUgPSBAbm9kZVR5cGVcblx0XHRcdGNoaWxkLkBjbGFzc2VzID0gQGNsYXNzZXMuc2xpY2VcblxuXHRcdFx0aWYgY2hpbGQuQGZsYWdOYW1lXG5cdFx0XHRcdGNoaWxkLkBjbGFzc2VzLnB1c2goY2hpbGQuQGZsYWdOYW1lKVxuXHRcdGVsc2Vcblx0XHRcdGNoaWxkLkBub2RlVHlwZSA9IGNoaWxkLkBuYW1lXG5cdFx0XHRjaGlsZC5AZmxhZ05hbWUgPSBudWxsXG5cdFx0XHRjaGlsZC5AY2xhc3NlcyA9IFtdXG5cblx0IyMjXG5cdEludGVybmFsIG1ldGhvZCBjYWxsZWQgYWZ0ZXIgYSB0YWcgY2xhc3MgaGFzXG5cdGJlZW4gZGVjbGFyZWQgb3IgZXh0ZW5kZWQuXG5cdFxuXHRAcHJpdmF0ZVxuXHQjIyNcblx0ZGVmIG9wdGltaXplVGFnU3RydWN0dXJlXG5cdFx0dmFyIGJhc2UgPSBJbWJhLlRhZzpwcm90b3R5cGVcblx0XHR2YXIgaGFzU2V0dXAgID0gc2VsZjpzZXR1cCAgIT0gYmFzZTpzZXR1cFxuXHRcdHZhciBoYXNDb21taXQgPSBzZWxmOmNvbW1pdCAhPSBiYXNlOmNvbW1pdFxuXHRcdHZhciBoYXNSZW5kZXIgPSBzZWxmOnJlbmRlciAhPSBiYXNlOnJlbmRlclxuXHRcdHZhciBoYXNNb3VudCAgPSBzZWxmOm1vdW50XG5cblx0XHR2YXIgY3RvciA9IHNlbGY6Y29uc3RydWN0b3JcblxuXHRcdGlmIGhhc0NvbW1pdCBvciBoYXNSZW5kZXIgb3IgaGFzTW91bnQgb3IgaGFzU2V0dXBcblxuXHRcdFx0c2VsZjplbmQgPSBkb1xuXHRcdFx0XHRpZiB0aGlzOm1vdW50IGFuZCAhKHRoaXMuRkxBR1MgJiBJbWJhLlRBR19NT1VOVEVEKVxuXHRcdFx0XHRcdCMganVzdCBhY3RpdmF0ZSBcblx0XHRcdFx0XHRJbWJhLlRhZ01hbmFnZXIubW91bnQodGhpcylcblxuXHRcdFx0XHR1bmxlc3MgdGhpcy5GTEFHUyAmIEltYmEuVEFHX1NFVFVQXG5cdFx0XHRcdFx0dGhpcy5GTEFHUyB8PSBJbWJhLlRBR19TRVRVUFxuXHRcdFx0XHRcdHRoaXMuc2V0dXBcblx0XHRcdFx0XG5cdFx0XHRcdHRoaXMuY29tbWl0XG5cblx0XHRcdFx0cmV0dXJuIHRoaXNcblxuXHRcdGlmICR3ZWIkXG5cdFx0XHRpZiBoYXNNb3VudFxuXHRcdFx0XHRpZiBjdG9yLkBjbGFzc2VzIGFuZCBjdG9yLkBjbGFzc2VzLmluZGV4T2YoJ19fbW91bnQnKSAgPT0gLTFcblx0XHRcdFx0XHRjdG9yLkBjbGFzc2VzLnB1c2goJ19fbW91bnQnKVxuXG5cdFx0XHRcdGlmIGN0b3IuQHByb3RvRG9tXG5cdFx0XHRcdFx0Y3Rvci5AcHJvdG9Eb206Y2xhc3NMaXN0LmFkZCgnX19tb3VudCcpXG5cblx0XHRcdGZvciBpdGVtIGluIFs6bW91c2Vtb3ZlLDptb3VzZWVudGVyLDptb3VzZWxlYXZlLDptb3VzZW92ZXIsOm1vdXNlb3V0LDpzZWxlY3RzdGFydF1cblx0XHRcdFx0SW1iYS5FdmVudHMucmVnaXN0ZXIoaXRlbSkgaWYgdGhpc1tcIm9ue2l0ZW19XCJdXG5cdFx0c2VsZlxuXG5cblx0ZGVmIGluaXRpYWxpemUgZG9tLGN0eFxuXHRcdHNlbGYuZG9tID0gZG9tXG5cdFx0c2VsZjokID0gVGFnQ2FjaGUuYnVpbGQoc2VsZilcblx0XHRzZWxmOiR1cCA9IEBvd25lcl8gPSBjdHhcblx0XHRAdHJlZV8gPSBudWxsXG5cdFx0c2VsZi5GTEFHUyA9IDBcblx0XHRidWlsZFxuXHRcdHNlbGZcblxuXHRhdHRyIG5hbWUgaW5saW5lOiBub1xuXHRhdHRyIHJvbGUgaW5saW5lOiBub1xuXHRhdHRyIHRhYmluZGV4IGlubGluZTogbm9cblx0YXR0ciB0aXRsZVxuXG5cdGRlZiBkb21cblx0XHRAZG9tXG5cdFx0XG5cdGRlZiBzZXREb20gZG9tXG5cdFx0ZG9tLkB0YWcgPSBzZWxmXG5cdFx0QGRvbSA9IGRvbVxuXHRcdHNlbGZcblxuXHRkZWYgcmVmXG5cdFx0QHJlZlxuXHRcdFxuXHRkZWYgcm9vdFxuXHRcdEBvd25lcl8gPyBAb3duZXJfLnJvb3QgOiBzZWxmXG5cblx0IyMjXG5cdFNldHRpbmcgcmVmZXJlbmNlcyBmb3IgdGFncyBsaWtlXG5cdGA8ZGl2QGhlYWRlcj5gIHdpbGwgY29tcGlsZSB0byBgdGFnKCdkaXYnKS5yZWZfKCdoZWFkZXInLHRoaXMpLmVuZCgpYFxuXHRCeSBkZWZhdWx0IGl0IGFkZHMgdGhlIHJlZmVyZW5jZSBhcyBhIGNsYXNzTmFtZSB0byB0aGUgdGFnLlxuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdEBwcml2YXRlXG5cdCMjI1xuXHRkZWYgcmVmXyByZWZcblx0XHRmbGFnKEByZWYgPSByZWYpXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTZXQgdGhlIGRhdGEgb2JqZWN0IGZvciBub2RlXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgZGF0YT0gZGF0YVxuXHRcdEBkYXRhID0gZGF0YVxuXG5cdCMjI1xuXHRHZXQgdGhlIGRhdGEgb2JqZWN0IGZvciBub2RlXG5cdCMjI1xuXHRkZWYgZGF0YVxuXHRcdEBkYXRhXG5cdFx0XG5cdFx0XG5cdGRlZiBiaW5kRGF0YSB0YXJnZXQsIHBhdGgsIGFyZ3Ncblx0XHRzZXREYXRhKGFyZ3MgPyB0YXJnZXRbcGF0aF0uYXBwbHkodGFyZ2V0LGFyZ3MpIDogdGFyZ2V0W3BhdGhdKVxuXG5cdCMjI1xuXHRTZXQgaW5uZXIgaHRtbCBvZiBub2RlXG5cdCMjI1xuXHRkZWYgaHRtbD0gaHRtbFxuXHRcdGlmIHNlbGYuaHRtbCAhPSBodG1sXG5cdFx0XHRAZG9tOmlubmVySFRNTCA9IGh0bWxcblxuXHQjIyNcblx0R2V0IGlubmVyIGh0bWwgb2Ygbm9kZVxuXHQjIyNcblx0ZGVmIGh0bWxcblx0XHRAZG9tOmlubmVySFRNTFxuXHRcblx0ZGVmIG9uJCBzbG90LGhhbmRsZXIsY29udGV4dFxuXHRcdGxldCBoYW5kbGVycyA9IEBvbl8gfHw9IFtdXG5cdFx0bGV0IHByZXYgPSBoYW5kbGVyc1tzbG90XVxuXHRcdCMgc2VsZi1ib3VuZCBoYW5kbGVyc1xuXHRcdGlmIHNsb3QgPCAwXG5cdFx0XHRpZiBwcmV2ID09IHVuZGVmaW5lZFxuXHRcdFx0XHRzbG90ID0gaGFuZGxlcnNbc2xvdF0gPSBoYW5kbGVyczpsZW5ndGhcblx0XHRcdGVsc2Vcblx0XHRcdFx0c2xvdCA9IHByZXZcblx0XHRcdHByZXYgPSBoYW5kbGVyc1tzbG90XVxuXHRcdFxuXHRcdGhhbmRsZXJzW3Nsb3RdID0gaGFuZGxlclxuXHRcdGlmIHByZXZcblx0XHRcdGhhbmRsZXI6c3RhdGUgPSBwcmV2OnN0YXRlXG5cdFx0ZWxzZVxuXHRcdFx0aGFuZGxlcjpzdGF0ZSA9IHtjb250ZXh0OiBjb250ZXh0fVxuXHRcdHJldHVybiBzZWxmXG5cblxuXHRkZWYgaWQ9IGlkXG5cdFx0aWYgaWQgIT0gbnVsbFxuXHRcdFx0ZG9tOmlkID0gaWRcblxuXHRkZWYgaWRcblx0XHRkb206aWRcblxuXHQjIyNcblx0QWRkcyBhIG5ldyBhdHRyaWJ1dGUgb3IgY2hhbmdlcyB0aGUgdmFsdWUgb2YgYW4gZXhpc3RpbmcgYXR0cmlidXRlXG5cdG9uIHRoZSBzcGVjaWZpZWQgdGFnLiBJZiB0aGUgdmFsdWUgaXMgbnVsbCBvciBmYWxzZSwgdGhlIGF0dHJpYnV0ZVxuXHR3aWxsIGJlIHJlbW92ZWQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0QXR0cmlidXRlIG5hbWUsIHZhbHVlXG5cdFx0dmFyIG9sZCA9IGRvbS5nZXRBdHRyaWJ1dGUobmFtZSlcblxuXHRcdGlmIG9sZCA9PSB2YWx1ZVxuXHRcdFx0dmFsdWVcblx0XHRlbGlmIHZhbHVlICE9IG51bGwgJiYgdmFsdWUgIT09IGZhbHNlXG5cdFx0XHRkb20uc2V0QXR0cmlidXRlKG5hbWUsdmFsdWUpXG5cdFx0ZWxzZVxuXHRcdFx0ZG9tLnJlbW92ZUF0dHJpYnV0ZShuYW1lKVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIHNldE5lc3RlZEF0dHIgbnMsIG5hbWUsIHZhbHVlXG5cdFx0aWYgc2VsZltucysnU2V0QXR0cmlidXRlJ11cblx0XHRcdHNlbGZbbnMrJ1NldEF0dHJpYnV0ZSddKG5hbWUsdmFsdWUpXG5cdFx0ZWxzZVxuXHRcdFx0c2V0QXR0cmlidXRlTlMobnMsIG5hbWUsdmFsdWUpXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgc2V0QXR0cmlidXRlTlMgbnMsIG5hbWUsIHZhbHVlXG5cdFx0dmFyIG9sZCA9IGdldEF0dHJpYnV0ZU5TKG5zLG5hbWUpXG5cblx0XHRpZiBvbGQgIT0gdmFsdWVcblx0XHRcdGlmIHZhbHVlICE9IG51bGwgJiYgdmFsdWUgIT09IGZhbHNlIFxuXHRcdFx0XHRkb20uc2V0QXR0cmlidXRlTlMobnMsbmFtZSx2YWx1ZSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0ZG9tLnJlbW92ZUF0dHJpYnV0ZU5TKG5zLG5hbWUpXG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cdCMjI1xuXHRyZW1vdmVzIGFuIGF0dHJpYnV0ZSBmcm9tIHRoZSBzcGVjaWZpZWQgdGFnXG5cdCMjI1xuXHRkZWYgcmVtb3ZlQXR0cmlidXRlIG5hbWVcblx0XHRkb20ucmVtb3ZlQXR0cmlidXRlKG5hbWUpXG5cblx0IyMjXG5cdHJldHVybnMgdGhlIHZhbHVlIG9mIGFuIGF0dHJpYnV0ZSBvbiB0aGUgdGFnLlxuXHRJZiB0aGUgZ2l2ZW4gYXR0cmlidXRlIGRvZXMgbm90IGV4aXN0LCB0aGUgdmFsdWUgcmV0dXJuZWRcblx0d2lsbCBlaXRoZXIgYmUgbnVsbCBvciBcIlwiICh0aGUgZW1wdHkgc3RyaW5nKVxuXHQjIyNcblx0ZGVmIGdldEF0dHJpYnV0ZSBuYW1lXG5cdFx0ZG9tLmdldEF0dHJpYnV0ZShuYW1lKVxuXG5cblx0ZGVmIGdldEF0dHJpYnV0ZU5TIG5zLCBuYW1lXG5cdFx0ZG9tLmdldEF0dHJpYnV0ZU5TKG5zLG5hbWUpXG5cdFxuXHRcblx0ZGVmIHNldCBrZXksIHZhbHVlLCBtb2RzXG5cdFx0bGV0IHNldHRlciA9IEltYmEudG9TZXR0ZXIoa2V5KVxuXHRcdGlmIHNlbGZbc2V0dGVyXSBpc2EgRnVuY3Rpb25cblx0XHRcdHNlbGZbc2V0dGVyXSh2YWx1ZSxtb2RzKVxuXHRcdGVsc2Vcblx0XHRcdEBkb206c2V0QXR0cmlidXRlKGtleSx2YWx1ZSlcblx0XHRzZWxmXG5cdFxuXHRcblx0ZGVmIGdldCBrZXlcblx0XHRAZG9tOmdldEF0dHJpYnV0ZShrZXkpXG5cblx0IyMjXG5cdE92ZXJyaWRlIHRoaXMgdG8gcHJvdmlkZSBzcGVjaWFsIHdyYXBwaW5nIGV0Yy5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXRDb250ZW50IGNvbnRlbnQsIHR5cGVcblx0XHRzZXRDaGlsZHJlbiBjb250ZW50LCB0eXBlXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTZXQgdGhlIGNoaWxkcmVuIG9mIG5vZGUuIHR5cGUgcGFyYW0gaXMgb3B0aW9uYWwsXG5cdGFuZCBzaG91bGQgb25seSBiZSB1c2VkIGJ5IEltYmEgd2hlbiBjb21waWxpbmcgdGFnIHRyZWVzLiBcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXRDaGlsZHJlbiBub2RlcywgdHlwZVxuXHRcdCMgb3ZlcnJpZGRlbiBvbiBjbGllbnQgYnkgcmVjb25jaWxlclxuXHRcdEB0cmVlXyA9IG5vZGVzXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTZXQgdGhlIHRlbXBsYXRlIHRoYXQgd2lsbCByZW5kZXIgdGhlIGNvbnRlbnQgb2Ygbm9kZS5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzZXRUZW1wbGF0ZSB0ZW1wbGF0ZVxuXHRcdHVubGVzcyBAdGVtcGxhdGVcblx0XHRcdCMgb3ZlcnJpZGUgdGhlIGJhc2ljXG5cdFx0XHRpZiBzZWxmOnJlbmRlciA9PSBJbWJhLlRhZzpwcm90b3R5cGU6cmVuZGVyXG5cdFx0XHRcdHNlbGY6cmVuZGVyID0gc2VsZjpyZW5kZXJUZW1wbGF0ZSAjIGRvIHNldENoaWxkcmVuKHJlbmRlclRlbXBsYXRlKVxuXHRcdFx0c2VsZi5vcHRpbWl6ZVRhZ1N0cnVjdHVyZVxuXG5cdFx0c2VsZjp0ZW1wbGF0ZSA9IEB0ZW1wbGF0ZSA9IHRlbXBsYXRlXG5cdFx0c2VsZlxuXG5cdGRlZiB0ZW1wbGF0ZVxuXHRcdG51bGxcblxuXHQjIyNcblx0SWYgbm8gY3VzdG9tIHJlbmRlci1tZXRob2QgaXMgZGVmaW5lZCwgYW5kIHRoZSBub2RlXG5cdGhhcyBhIHRlbXBsYXRlLCB0aGlzIG1ldGhvZCB3aWxsIGJlIHVzZWQgdG8gcmVuZGVyXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgcmVuZGVyVGVtcGxhdGVcblx0XHR2YXIgYm9keSA9IHRlbXBsYXRlXG5cdFx0c2V0Q2hpbGRyZW4oYm9keSkgaWYgYm9keSAhPSBzZWxmXG5cdFx0c2VsZlxuXG5cblx0IyMjXG5cdFJlbW92ZSBzcGVjaWZpZWQgY2hpbGQgZnJvbSBjdXJyZW50IG5vZGUuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgcmVtb3ZlQ2hpbGQgY2hpbGRcblx0XHR2YXIgcGFyID0gZG9tXG5cdFx0dmFyIGVsID0gY2hpbGQuQGRvbSBvciBjaGlsZFxuXHRcdGlmIGVsIGFuZCBlbDpwYXJlbnROb2RlID09IHBhclxuXHRcdFx0cGFyLnJlbW92ZUNoaWxkKGVsKVxuXHRcdFx0SW1iYS5UYWdNYW5hZ2VyLnJlbW92ZShlbC5AdGFnIG9yIGVsLHNlbGYpXG5cdFx0c2VsZlxuXHRcblx0IyMjXG5cdFJlbW92ZSBhbGwgY29udGVudCBpbnNpZGUgbm9kZVxuXHQjIyNcblx0ZGVmIHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0aWYgQGRvbTpmaXJzdENoaWxkXG5cdFx0XHRAZG9tLnJlbW92ZUNoaWxkKEBkb206Zmlyc3RDaGlsZCkgd2hpbGUgQGRvbTpmaXJzdENoaWxkXG5cdFx0XHRJbWJhLlRhZ01hbmFnZXIucmVtb3ZlKG51bGwsc2VsZikgIyBzaG91bGQgcmVnaXN0ZXIgZWFjaCBjaGlsZD9cblx0XHRAdHJlZV8gPSBAdGV4dF8gPSBudWxsXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRBcHBlbmQgYSBzaW5nbGUgaXRlbSAobm9kZSBvciBzdHJpbmcpIHRvIHRoZSBjdXJyZW50IG5vZGUuXG5cdElmIHN1cHBsaWVkIGl0ZW0gaXMgYSBzdHJpbmcgaXQgd2lsbCBhdXRvbWF0aWNhbGx5LiBUaGlzIGlzIHVzZWRcblx0YnkgSW1iYSBpbnRlcm5hbGx5LCBidXQgd2lsbCBwcmFjdGljYWxseSBuZXZlciBiZSB1c2VkIGV4cGxpY2l0bHkuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgYXBwZW5kQ2hpbGQgbm9kZVxuXHRcdGlmIG5vZGUgaXNhIFN0cmluZ1xuXHRcdFx0ZG9tLmFwcGVuZENoaWxkKEltYmEuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZSkpXG5cdFx0ZWxpZiBub2RlXG5cdFx0XHRkb20uYXBwZW5kQ2hpbGQobm9kZS5AZG9tIG9yIG5vZGUpXG5cdFx0XHRJbWJhLlRhZ01hbmFnZXIuaW5zZXJ0KG5vZGUuQHRhZyBvciBub2RlLCBzZWxmKVxuXHRcdFx0IyBGSVhNRSBlbnN1cmUgdGhlc2UgYXJlIG5vdCBjYWxsZWQgZm9yIHRleHQgbm9kZXNcblx0XHRzZWxmXG5cblx0IyMjXG5cdEluc2VydCBhIG5vZGUgaW50byB0aGUgY3VycmVudCBub2RlIChzZWxmKSwgYmVmb3JlIGFub3RoZXIuXG5cdFRoZSByZWxhdGl2ZSBub2RlIG11c3QgYmUgYSBjaGlsZCBvZiBjdXJyZW50IG5vZGUuIFxuXHQjIyNcblx0ZGVmIGluc2VydEJlZm9yZSBub2RlLCByZWxcblx0XHRpZiBub2RlIGlzYSBTdHJpbmdcblx0XHRcdG5vZGUgPSBJbWJhLmRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpXG5cblx0XHRpZiBub2RlIGFuZCByZWxcblx0XHRcdGRvbS5pbnNlcnRCZWZvcmUoIChub2RlLkBkb20gb3Igbm9kZSksIChyZWwuQGRvbSBvciByZWwpIClcblx0XHRcdEltYmEuVGFnTWFuYWdlci5pbnNlcnQobm9kZS5AdGFnIG9yIG5vZGUsIHNlbGYpXG5cdFx0XHQjIEZJWE1FIGVuc3VyZSB0aGVzZSBhcmUgbm90IGNhbGxlZCBmb3IgdGV4dCBub2Rlc1xuXHRcdHNlbGZcblxuXG5cdCMjI1xuXHRSZW1vdmUgbm9kZSBmcm9tIHRoZSBkb20gdHJlZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIG9ycGhhbml6ZVxuXHRcdHBhci5yZW1vdmVDaGlsZChzZWxmKSBpZiBsZXQgcGFyID0gcGFyZW50XG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblx0R2V0IHRleHQgb2Ygbm9kZS4gVXNlcyB0ZXh0Q29udGVudCBiZWhpbmQgdGhlIHNjZW5lcyAobm90IGlubmVyVGV4dClcblx0W2h0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Ob2RlL3RleHRDb250ZW50XSgpXG5cdEByZXR1cm4ge3N0cmluZ30gaW5uZXIgdGV4dCBvZiBub2RlXG5cdCMjI1xuXHRkZWYgdGV4dCB2XG5cdFx0QGRvbTp0ZXh0Q29udGVudFxuXG5cdCMjI1xuXHRTZXQgdGV4dCBvZiBub2RlLiBVc2VzIHRleHRDb250ZW50IGJlaGluZCB0aGUgc2NlbmVzIChub3QgaW5uZXJUZXh0KVxuXHRbaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL05vZGUvdGV4dENvbnRlbnRdKClcblx0IyMjXG5cdGRlZiB0ZXh0PSB0eHRcblx0XHRAdHJlZV8gPSB0eHRcblx0XHRAZG9tOnRleHRDb250ZW50ID0gKHR4dCA9PSBudWxsIG9yIHRleHQgPT09IGZhbHNlKSA/ICcnIDogdHh0XG5cdFx0c2VsZlxuXG5cblx0IyMjXG5cdE1ldGhvZCBmb3IgZ2V0dGluZyBhbmQgc2V0dGluZyBkYXRhLWF0dHJpYnV0ZXMuIFdoZW4gY2FsbGVkIHdpdGggemVyb1xuXHRhcmd1bWVudHMgaXQgd2lsbCByZXR1cm4gdGhlIGFjdHVhbCBkYXRhc2V0IGZvciB0aGUgdGFnLlxuXG5cdFx0dmFyIG5vZGUgPSA8ZGl2IGRhdGEtbmFtZT0naGVsbG8nPlxuXHRcdCMgZ2V0IHRoZSB3aG9sZSBkYXRhc2V0XG5cdFx0bm9kZS5kYXRhc2V0ICMge25hbWU6ICdoZWxsbyd9XG5cdFx0IyBnZXQgYSBzaW5nbGUgdmFsdWVcblx0XHRub2RlLmRhdGFzZXQoJ25hbWUnKSAjICdoZWxsbydcblx0XHQjIHNldCBhIHNpbmdsZSB2YWx1ZVxuXHRcdG5vZGUuZGF0YXNldCgnbmFtZScsJ25ld25hbWUnKSAjIHNlbGZcblxuXG5cdCMjI1xuXHRkZWYgZGF0YXNldCBrZXksIHZhbFxuXHRcdGlmIGtleSBpc2EgT2JqZWN0XG5cdFx0XHRkYXRhc2V0KGssdikgZm9yIG93biBrLHYgb2Yga2V5XG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0aWYgYXJndW1lbnRzOmxlbmd0aCA9PSAyXG5cdFx0XHRzZXRBdHRyaWJ1dGUoXCJkYXRhLXtrZXl9XCIsdmFsKVxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdGlmIGtleVxuXHRcdFx0cmV0dXJuIGdldEF0dHJpYnV0ZShcImRhdGEte2tleX1cIilcblxuXHRcdHZhciBkYXRhc2V0ID0gZG9tOmRhdGFzZXRcblxuXHRcdHVubGVzcyBkYXRhc2V0XG5cdFx0XHRkYXRhc2V0ID0ge31cblx0XHRcdGZvciBhdHIsaSBpbiBkb206YXR0cmlidXRlc1xuXHRcdFx0XHRpZiBhdHI6bmFtZS5zdWJzdHIoMCw1KSA9PSAnZGF0YS0nXG5cdFx0XHRcdFx0ZGF0YXNldFtJbWJhLnRvQ2FtZWxDYXNlKGF0cjpuYW1lLnNsaWNlKDUpKV0gPSBhdHI6dmFsdWVcblxuXHRcdHJldHVybiBkYXRhc2V0XG5cblx0IyMjXG5cdEVtcHR5IHBsYWNlaG9sZGVyLiBPdmVycmlkZSB0byBpbXBsZW1lbnQgY3VzdG9tIHJlbmRlciBiZWhhdmlvdXIuXG5cdFdvcmtzIG11Y2ggbGlrZSB0aGUgZmFtaWxpYXIgcmVuZGVyLW1ldGhvZCBpbiBSZWFjdC5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiByZW5kZXJcblx0XHRzZWxmXG5cblx0IyMjXG5cdENhbGxlZCBpbXBsaWNpdGx5IHdoaWxlIHRhZyBpcyBpbml0aWFsaXppbmcuIE5vIGluaXRpYWwgcHJvcHNcblx0d2lsbCBoYXZlIGJlZW4gc2V0IGF0IHRoaXMgcG9pbnQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgYnVpbGRcblx0XHRzZWxmXG5cblx0IyMjXG5cdENhbGxlZCBvbmNlLCBpbXBsaWNpdGx5IHRocm91Z2ggSW1iYS5UYWcjZW5kLiBBbGwgaW5pdGlhbCBwcm9wc1xuXHRhbmQgY2hpbGRyZW4gd2lsbCBoYXZlIGJlZW4gc2V0IGJlZm9yZSBzZXR1cCBpcyBjYWxsZWQuXG5cdHNldENvbnRlbnQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0dXBcblx0XHRzZWxmXG5cblx0IyMjXG5cdENhbGxlZCBpbXBsaWNpdGx5IHRocm91Z2ggSW1iYS5UYWcjZW5kLCBmb3IgdGFncyB0aGF0IGFyZSBwYXJ0IG9mXG5cdGEgdGFnIHRyZWUgKHRoYXQgYXJlIHJlbmRlcmVkIHNldmVyYWwgdGltZXMpLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGNvbW1pdFxuXHRcdHJlbmRlclxuXHRcdHNlbGZcblxuXHQjIyNcblxuXHRDYWxsZWQgYnkgdGhlIHRhZy1zY2hlZHVsZXIgKGlmIHRoaXMgdGFnIGlzIHNjaGVkdWxlZClcblx0QnkgZGVmYXVsdCBpdCB3aWxsIGNhbGwgdGhpcy5yZW5kZXIuIERvIG5vdCBvdmVycmlkZSB1bmxlc3Ncblx0eW91IHJlYWxseSB1bmRlcnN0YW5kIGl0LlxuXG5cdCMjI1xuXHRkZWYgdGlja1xuXHRcdHJlbmRlclxuXHRcdHNlbGZcblxuXHQjIyNcblx0XG5cdEEgdmVyeSBpbXBvcnRhbnQgbWV0aG9kIHRoYXQgeW91IHdpbGwgcHJhY3RpY2FsbHkgbmV2ZXIgbWFudWFsbHkuXG5cdFRoZSB0YWcgc3ludGF4IG9mIEltYmEgY29tcGlsZXMgdG8gYSBjaGFpbiBvZiBzZXR0ZXJzLCB3aGljaCBhbHdheXNcblx0ZW5kcyB3aXRoIC5lbmQuIGA8YS5sYXJnZT5gIGNvbXBpbGVzIHRvIGB0YWcoJ2EnKS5mbGFnKCdsYXJnZScpLmVuZCgpYFxuXHRcblx0WW91IGFyZSBoaWdobHkgYWR2aWNlZCB0byBub3Qgb3ZlcnJpZGUgaXRzIGJlaGF2aW91ci4gVGhlIGZpcnN0IHRpbWVcblx0ZW5kIGlzIGNhbGxlZCBpdCB3aWxsIG1hcmsgdGhlIHRhZyBhcyBpbml0aWFsaXplZCBhbmQgY2FsbCBJbWJhLlRhZyNzZXR1cCxcblx0YW5kIGNhbGwgSW1iYS5UYWcjY29tbWl0IGV2ZXJ5IHRpbWUuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgZW5kXG5cdFx0c2VsZlxuXHRcdFxuXHQjIGNhbGxlZCBvbiA8c2VsZj4gdG8gY2hlY2sgaWYgc2VsZiBpcyBjYWxsZWQgZnJvbSBvdGhlciBwbGFjZXNcblx0ZGVmICRvcGVuIGNvbnRleHRcblx0XHRpZiBjb250ZXh0ICE9IEBjb250ZXh0X1xuXHRcdFx0QHRyZWVfID0gbnVsbFxuXHRcdFx0QGNvbnRleHRfID0gY29udGV4dFxuXHRcdHNlbGZcblxuXHQjIyNcblx0VGhpcyBpcyBjYWxsZWQgaW5zdGVhZCBvZiBJbWJhLlRhZyNlbmQgZm9yIGA8c2VsZj5gIHRhZyBjaGFpbnMuXG5cdERlZmF1bHRzIHRvIG5vb3Bcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzeW5jZWRcblx0XHRzZWxmXG5cblx0IyBjYWxsZWQgd2hlbiB0aGUgbm9kZSBpcyBhd2FrZW5lZCBpbiB0aGUgZG9tIC0gZWl0aGVyIGF1dG9tYXRpY2FsbHlcblx0IyB1cG9uIGF0dGFjaG1lbnQgdG8gdGhlIGRvbS10cmVlLCBvciB0aGUgZmlyc3QgdGltZSBpbWJhIG5lZWRzIHRoZVxuXHQjIHRhZyBmb3IgYSBkb21ub2RlIHRoYXQgaGFzIGJlZW4gcmVuZGVyZWQgb24gdGhlIHNlcnZlclxuXHRkZWYgYXdha2VuXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRMaXN0IG9mIGZsYWdzIGZvciB0aGlzIG5vZGUuIFxuXHQjIyNcblx0ZGVmIGZsYWdzXG5cdFx0QGRvbTpjbGFzc0xpc3RcblxuXHQjIyNcblx0QWRkIHNwZWZpY2llZCBmbGFnIHRvIGN1cnJlbnQgbm9kZS5cblx0SWYgYSBzZWNvbmQgYXJndW1lbnQgaXMgc3VwcGxpZWQsIGl0IHdpbGwgYmUgY29lcmNlZCBpbnRvIGEgQm9vbGVhbixcblx0YW5kIHVzZWQgdG8gaW5kaWNhdGUgd2hldGhlciB3ZSBzaG91bGQgcmVtb3ZlIHRoZSBmbGFnIGluc3RlYWQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgZmxhZyBuYW1lLCB0b2dnbGVyXG5cdFx0IyBpdCBpcyBtb3N0IG5hdHVyYWwgdG8gdHJlYXQgYSBzZWNvbmQgdW5kZWZpbmVkIGFyZ3VtZW50IGFzIGEgbm8tc3dpdGNoXG5cdFx0IyBzbyB3ZSBuZWVkIHRvIGNoZWNrIHRoZSBhcmd1bWVudHMtbGVuZ3RoXG5cdFx0aWYgYXJndW1lbnRzOmxlbmd0aCA9PSAyXG5cdFx0XHRpZiBAZG9tOmNsYXNzTGlzdC5jb250YWlucyhuYW1lKSAhPSAhIXRvZ2dsZXJcblx0XHRcdFx0QGRvbTpjbGFzc0xpc3QudG9nZ2xlKG5hbWUpXG5cdFx0ZWxzZVxuXHRcdFx0IyBmaXJlZm94IHdpbGwgdHJpZ2dlciBhIGNoYW5nZSBpZiBhZGRpbmcgZXhpc3RpbmcgY2xhc3Ncblx0XHRcdEBkb206Y2xhc3NMaXN0LmFkZChuYW1lKSB1bmxlc3MgQGRvbTpjbGFzc0xpc3QuY29udGFpbnMobmFtZSlcblx0XHRyZXR1cm4gc2VsZlxuXG5cdCMjI1xuXHRSZW1vdmUgc3BlY2lmaWVkIGZsYWcgZnJvbSBub2RlXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgdW5mbGFnIG5hbWVcblx0XHRAZG9tOmNsYXNzTGlzdC5yZW1vdmUobmFtZSlcblx0XHRzZWxmXG5cblx0IyMjXG5cdFRvZ2dsZSBzcGVjaWZpZWQgZmxhZyBvbiBub2RlXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgdG9nZ2xlRmxhZyBuYW1lXG5cdFx0QGRvbTpjbGFzc0xpc3QudG9nZ2xlKG5hbWUpXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRDaGVjayB3aGV0aGVyIGN1cnJlbnQgbm9kZSBoYXMgc3BlY2lmaWVkIGZsYWdcblx0QHJldHVybiB7Ym9vbH1cblx0IyMjXG5cdGRlZiBoYXNGbGFnIG5hbWVcblx0XHRAZG9tOmNsYXNzTGlzdC5jb250YWlucyhuYW1lKVxuXG5cdFxuXHRkZWYgZmxhZ0lmIGZsYWcsIGJvb2xcblx0XHR2YXIgZiA9IEBmbGFnc18gfHw9IHt9XG5cdFx0bGV0IHByZXYgPSBmW2ZsYWddXG5cblx0XHRpZiBib29sIGFuZCAhcHJldlxuXHRcdFx0QGRvbTpjbGFzc0xpc3QuYWRkKGZsYWcpXG5cdFx0XHRmW2ZsYWddID0geWVzXG5cdFx0ZWxpZiBwcmV2IGFuZCAhYm9vbFxuXHRcdFx0QGRvbTpjbGFzc0xpc3QucmVtb3ZlKGZsYWcpXG5cdFx0XHRmW2ZsYWddID0gbm9cblxuXHRcdHJldHVybiBzZWxmXG5cdFx0XG5cdCMjI1xuXHRTZXQvdXBkYXRlIGEgbmFtZWQgZmxhZy4gSXQgcmVtZW1iZXJzIHRoZSBwcmV2aW91c1xuXHR2YWx1ZSBvZiB0aGUgZmxhZywgYW5kIHJlbW92ZXMgaXQgYmVmb3JlIHNldHRpbmcgdGhlIG5ldyB2YWx1ZS5cblxuXHRcdG5vZGUuc2V0RmxhZygndHlwZScsJ3RvZG8nKVxuXHRcdG5vZGUuc2V0RmxhZygndHlwZScsJ3Byb2plY3QnKVxuXHRcdCMgdG9kbyBpcyByZW1vdmVkLCBwcm9qZWN0IGlzIGFkZGVkLlxuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0RmxhZyBuYW1lLCB2YWx1ZVxuXHRcdGxldCBmbGFncyA9IEBuYW1lZEZsYWdzXyB8fD0ge31cblx0XHRsZXQgcHJldiA9IGZsYWdzW25hbWVdXG5cdFx0aWYgcHJldiAhPSB2YWx1ZVxuXHRcdFx0dW5mbGFnKHByZXYpIGlmIHByZXZcblx0XHRcdGZsYWcodmFsdWUpIGlmIHZhbHVlXG5cdFx0XHRmbGFnc1tuYW1lXSA9IHZhbHVlXG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cdCMjI1xuXHRHZXQgdGhlIHNjaGVkdWxlciBmb3IgdGhpcyBub2RlLiBBIG5ldyBzY2hlZHVsZXIgd2lsbCBiZSBjcmVhdGVkXG5cdGlmIGl0IGRvZXMgbm90IGFscmVhZHkgZXhpc3QuXG5cblx0QHJldHVybiB7SW1iYS5TY2hlZHVsZXJ9XG5cdCMjI1xuXHRkZWYgc2NoZWR1bGVyXG5cdFx0QHNjaGVkdWxlciA/PSBJbWJhLlNjaGVkdWxlci5uZXcoc2VsZilcblxuXHQjIyNcblxuXHRTaG9ydGhhbmQgdG8gc3RhcnQgc2NoZWR1bGluZyBhIG5vZGUuIFRoZSBtZXRob2Qgd2lsbCBiYXNpY2FsbHlcblx0cHJveHkgdGhlIGFyZ3VtZW50cyB0aHJvdWdoIHRvIHNjaGVkdWxlci5jb25maWd1cmUsIGFuZCB0aGVuXG5cdGFjdGl2YXRlIHRoZSBzY2hlZHVsZXIuXG5cdFxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNjaGVkdWxlIG9wdGlvbnMgPSB7ZXZlbnRzOiB5ZXN9XG5cdFx0c2NoZWR1bGVyLmNvbmZpZ3VyZShvcHRpb25zKS5hY3RpdmF0ZVxuXHRcdHNlbGZcblxuXHQjIyNcblx0U2hvcnRoYW5kIGZvciBkZWFjdGl2YXRpbmcgc2NoZWR1bGVyIChpZiB0YWcgaGFzIG9uZSkuXG5cdEBkZXByZWNhdGVkXG5cdCMjI1xuXHRkZWYgdW5zY2hlZHVsZVxuXHRcdHNjaGVkdWxlci5kZWFjdGl2YXRlIGlmIEBzY2hlZHVsZXJcblx0XHRzZWxmXG5cblxuXHQjIyNcblx0R2V0IHRoZSBwYXJlbnQgb2YgY3VycmVudCBub2RlXG5cdEByZXR1cm4ge0ltYmEuVGFnfSBcblx0IyMjXG5cdGRlZiBwYXJlbnRcblx0XHRJbWJhLmdldFRhZ0ZvckRvbShkb206cGFyZW50Tm9kZSlcblxuXHQjIyNcblx0R2V0IHRoZSBjaGlsZHJlbiBvZiBub2RlXG5cdEByZXR1cm4ge0ltYmEuVGFnW119XG5cdCMjI1xuXHRkZWYgY2hpbGRyZW4gc2VsXG5cdFx0Zm9yIGl0ZW0gaW4gQGRvbTpjaGlsZHJlblxuXHRcdFx0aXRlbS5AdGFnIG9yIEltYmEuZ2V0VGFnRm9yRG9tKGl0ZW0pXG5cdFxuXHRkZWYgcXVlcnlTZWxlY3RvciBxXG5cdFx0SW1iYS5nZXRUYWdGb3JEb20oQGRvbS5xdWVyeVNlbGVjdG9yKHEpKVxuXG5cdGRlZiBxdWVyeVNlbGVjdG9yQWxsIHFcblx0XHR2YXIgaXRlbXMgPSBbXVxuXHRcdGZvciBpdGVtIGluIEBkb20ucXVlcnlTZWxlY3RvckFsbChxKVxuXHRcdFx0aXRlbXMucHVzaCggSW1iYS5nZXRUYWdGb3JEb20oaXRlbSkgKVxuXHRcdHJldHVybiBpdGVtc1xuXG5cdCMjI1xuXHRDaGVjayBpZiB0aGlzIG5vZGUgbWF0Y2hlcyBhIHNlbGVjdG9yXG5cdEByZXR1cm4ge0Jvb2xlYW59XG5cdCMjI1xuXHRkZWYgbWF0Y2hlcyBzZWxcblx0XHRpZiBzZWwgaXNhIEZ1bmN0aW9uXG5cdFx0XHRyZXR1cm4gc2VsKHNlbGYpXG5cblx0XHRzZWwgPSBzZWwucXVlcnkgaWYgc2VsOnF1ZXJ5IGlzYSBGdW5jdGlvblxuXHRcdGlmIHZhciBmbiA9IChAZG9tOm1hdGNoZXMgb3IgQGRvbTptYXRjaGVzU2VsZWN0b3Igb3IgQGRvbTp3ZWJraXRNYXRjaGVzU2VsZWN0b3Igb3IgQGRvbTptc01hdGNoZXNTZWxlY3RvciBvciBAZG9tOm1vek1hdGNoZXNTZWxlY3Rvcilcblx0XHRcdHJldHVybiBmbi5jYWxsKEBkb20sc2VsKVxuXG5cdCMjI1xuXHRHZXQgdGhlIGZpcnN0IGVsZW1lbnQgbWF0Y2hpbmcgc3VwcGxpZWQgc2VsZWN0b3IgLyBmaWx0ZXJcblx0dHJhdmVyc2luZyB1cHdhcmRzLCBidXQgaW5jbHVkaW5nIHRoZSBub2RlIGl0c2VsZi5cblx0QHJldHVybiB7SW1iYS5UYWd9XG5cdCMjI1xuXHRkZWYgY2xvc2VzdCBzZWxcblx0XHRJbWJhLmdldFRhZ0ZvckRvbShAZG9tLmNsb3Nlc3Qoc2VsKSlcblxuXHQjIyNcblx0Q2hlY2sgaWYgbm9kZSBjb250YWlucyBvdGhlciBub2RlXG5cdEByZXR1cm4ge0Jvb2xlYW59IFxuXHQjIyNcblx0ZGVmIGNvbnRhaW5zIG5vZGVcblx0XHRkb20uY29udGFpbnMobm9kZS5AZG9tIG9yIG5vZGUpXG5cblxuXHQjIyNcblx0U2hvcnRoYW5kIGZvciBjb25zb2xlLmxvZyBvbiBlbGVtZW50c1xuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGxvZyAqYXJnc1xuXHRcdGFyZ3MudW5zaGlmdChjb25zb2xlKVxuXHRcdEZ1bmN0aW9uOnByb3RvdHlwZTpjYWxsLmFwcGx5KGNvbnNvbGU6bG9nLCBhcmdzKVxuXHRcdHNlbGZcblxuXHRkZWYgY3NzIGtleSwgdmFsXG5cdFx0aWYga2V5IGlzYSBPYmplY3Rcblx0XHRcdGNzcyhrLHYpIGZvciBvd24gayx2IG9mIGtleVxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdHZhciBuYW1lID0gSW1iYS5DU1NLZXlNYXBba2V5XSBvciBrZXlcblxuXHRcdGlmIHZhbCA9PSBudWxsXG5cdFx0XHRkb206c3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSlcblx0XHRlbGlmIHZhbCA9PSB1bmRlZmluZWQgYW5kIGFyZ3VtZW50czpsZW5ndGggPT0gMVxuXHRcdFx0cmV0dXJuIGRvbTpzdHlsZVtuYW1lXVxuXHRcdGVsc2Vcblx0XHRcdGlmIHZhbCBpc2EgTnVtYmVyIGFuZCBuYW1lLm1hdGNoKC93aWR0aHxoZWlnaHR8bGVmdHxyaWdodHx0b3B8Ym90dG9tLylcblx0XHRcdFx0ZG9tOnN0eWxlW25hbWVdID0gdmFsICsgXCJweFwiXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGRvbTpzdHlsZVtuYW1lXSA9IHZhbFxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIHNldFN0eWxlIHN0eWxlXG5cdFx0c2V0QXR0cmlidXRlKCdzdHlsZScsc3R5bGUpXG5cblx0ZGVmIHN0eWxlXG5cdFx0Z2V0QXR0cmlidXRlKCdzdHlsZScpXG5cblx0IyMjXG5cdFRyaWdnZXIgYW4gZXZlbnQgZnJvbSBjdXJyZW50IG5vZGUuIERpc3BhdGNoZWQgdGhyb3VnaCB0aGUgSW1iYSBldmVudCBtYW5hZ2VyLlxuXHRUbyBkaXNwYXRjaCBhY3R1YWwgZG9tIGV2ZW50cywgdXNlIGRvbS5kaXNwYXRjaEV2ZW50IGluc3RlYWQuXG5cblx0QHJldHVybiB7SW1iYS5FdmVudH1cblx0IyMjXG5cdGRlZiB0cmlnZ2VyIG5hbWUsIGRhdGEgPSB7fVxuXHRcdCR3ZWIkID8gSW1iYS5FdmVudHMudHJpZ2dlcihuYW1lLHNlbGYsZGF0YTogZGF0YSkgOiBudWxsXG5cblx0IyMjXG5cdEZvY3VzIG9uIGN1cnJlbnQgbm9kZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGZvY3VzXG5cdFx0ZG9tLmZvY3VzXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRSZW1vdmUgZm9jdXMgZnJvbSBjdXJyZW50IG5vZGVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBibHVyXG5cdFx0ZG9tLmJsdXJcblx0XHRzZWxmXG5cblx0ZGVmIHRvU3RyaW5nXG5cdFx0ZG9tOm91dGVySFRNTFxuXHRcblxuSW1iYS5UYWc6cHJvdG90eXBlOmluaXRpYWxpemUgPSBJbWJhLlRhZ1xuXG5jbGFzcyBJbWJhLlNWR1RhZyA8IEltYmEuVGFnXG5cblx0ZGVmIHNlbGYubmFtZXNwYWNlVVJJXG5cdFx0XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXG5cblx0ZGVmIHNlbGYuYnVpbGROb2RlXG5cdFx0dmFyIGRvbSA9IEltYmEuZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSxAbm9kZVR5cGUpXG5cdFx0dmFyIGNscyA9IEBjbGFzc2VzLmpvaW4oXCIgXCIpXG5cdFx0ZG9tOmNsYXNzTmFtZTpiYXNlVmFsID0gY2xzIGlmIGNsc1xuXHRcdGRvbVxuXG5cdGRlZiBzZWxmLmluaGVyaXQgY2hpbGRcblx0XHRjaGlsZC5AcHJvdG9Eb20gPSBudWxsXG5cdFx0aWYgY2hpbGQuQG5hbWUgaW4gSW1iYS5TVkdfVEFHU1xuXHRcdFx0Y2hpbGQuQG5vZGVUeXBlID0gY2hpbGQuQG5hbWVcblx0XHRcdGNoaWxkLkBjbGFzc2VzID0gW11cblx0XHRlbHNlXG5cdFx0XHRjaGlsZC5Abm9kZVR5cGUgPSBAbm9kZVR5cGVcblx0XHRcdHZhciBjbGFzc05hbWUgPSBcIl9cIiArIGNoaWxkLkBuYW1lLnJlcGxhY2UoL18vZywgJy0nKVxuXHRcdFx0Y2hpbGQuQGNsYXNzZXMgPSBAY2xhc3Nlcy5jb25jYXQoY2xhc3NOYW1lKVxuXG5JbWJhLkhUTUxfVEFHUyA9IFwiYSBhYmJyIGFkZHJlc3MgYXJlYSBhcnRpY2xlIGFzaWRlIGF1ZGlvIGIgYmFzZSBiZGkgYmRvIGJpZyBibG9ja3F1b3RlIGJvZHkgYnIgYnV0dG9uIGNhbnZhcyBjYXB0aW9uIGNpdGUgY29kZSBjb2wgY29sZ3JvdXAgZGF0YSBkYXRhbGlzdCBkZCBkZWwgZGV0YWlscyBkZm4gZGl2IGRsIGR0IGVtIGVtYmVkIGZpZWxkc2V0IGZpZ2NhcHRpb24gZmlndXJlIGZvb3RlciBmb3JtIGgxIGgyIGgzIGg0IGg1IGg2IGhlYWQgaGVhZGVyIGhyIGh0bWwgaSBpZnJhbWUgaW1nIGlucHV0IGlucyBrYmQga2V5Z2VuIGxhYmVsIGxlZ2VuZCBsaSBsaW5rIG1haW4gbWFwIG1hcmsgbWVudSBtZW51aXRlbSBtZXRhIG1ldGVyIG5hdiBub3NjcmlwdCBvYmplY3Qgb2wgb3B0Z3JvdXAgb3B0aW9uIG91dHB1dCBwIHBhcmFtIHByZSBwcm9ncmVzcyBxIHJwIHJ0IHJ1YnkgcyBzYW1wIHNjcmlwdCBzZWN0aW9uIHNlbGVjdCBzbWFsbCBzb3VyY2Ugc3BhbiBzdHJvbmcgc3R5bGUgc3ViIHN1bW1hcnkgc3VwIHRhYmxlIHRib2R5IHRkIHRleHRhcmVhIHRmb290IHRoIHRoZWFkIHRpbWUgdGl0bGUgdHIgdHJhY2sgdSB1bCB2YXIgdmlkZW8gd2JyXCIuc3BsaXQoXCIgXCIpXG5JbWJhLkhUTUxfVEFHU19VTlNBRkUgPSBcImFydGljbGUgYXNpZGUgaGVhZGVyIHNlY3Rpb25cIi5zcGxpdChcIiBcIilcbkltYmEuU1ZHX1RBR1MgPSBcImNpcmNsZSBkZWZzIGVsbGlwc2UgZyBsaW5lIGxpbmVhckdyYWRpZW50IG1hc2sgcGF0aCBwYXR0ZXJuIHBvbHlnb24gcG9seWxpbmUgcmFkaWFsR3JhZGllbnQgcmVjdCBzdG9wIHN2ZyB0ZXh0IHRzcGFuXCIuc3BsaXQoXCIgXCIpXG5cbkltYmEuSFRNTF9BVFRSUyA9XG5cdGE6IFwiaHJlZiB0YXJnZXQgaHJlZmxhbmcgbWVkaWEgZG93bmxvYWQgcmVsIHR5cGVcIlxuXHRmb3JtOiBcIm1ldGhvZCBhY3Rpb24gZW5jdHlwZSBhdXRvY29tcGxldGUgdGFyZ2V0XCJcblx0YnV0dG9uOiBcImF1dG9mb2N1cyB0eXBlXCJcblx0aW5wdXQ6IFwiYWNjZXB0IGRpc2FibGVkIGZvcm0gbGlzdCBtYXggbWF4bGVuZ3RoIG1pbiBwYXR0ZXJuIHJlcXVpcmVkIHNpemUgc3RlcCB0eXBlXCJcblx0bGFiZWw6IFwiYWNjZXNza2V5IGZvciBmb3JtXCJcblx0aW1nOiBcInNyYyBzcmNzZXRcIlxuXHRsaW5rOiBcInJlbCB0eXBlIGhyZWYgbWVkaWFcIlxuXHRpZnJhbWU6IFwicmVmZXJyZXJwb2xpY3kgc3JjIHNyY2RvYyBzYW5kYm94XCJcblx0bWV0YTogXCJwcm9wZXJ0eSBjb250ZW50IGNoYXJzZXQgZGVzY1wiXG5cdG9wdGdyb3VwOiBcImxhYmVsXCJcblx0b3B0aW9uOiBcImxhYmVsXCJcblx0b3V0cHV0OiBcImZvciBmb3JtXCJcblx0b2JqZWN0OiBcInR5cGUgZGF0YSB3aWR0aCBoZWlnaHRcIlxuXHRwYXJhbTogXCJuYW1lIHZhbHVlXCJcblx0cHJvZ3Jlc3M6IFwibWF4XCJcblx0c2NyaXB0OiBcInNyYyB0eXBlIGFzeW5jIGRlZmVyIGNyb3Nzb3JpZ2luIGludGVncml0eSBub25jZSBsYW5ndWFnZVwiXG5cdHNlbGVjdDogXCJzaXplIGZvcm0gbXVsdGlwbGVcIlxuXHR0ZXh0YXJlYTogXCJyb3dzIGNvbHNcIlxuXG5cbkltYmEuSFRNTF9QUk9QUyA9XG5cdGlucHV0OiBcImF1dG9mb2N1cyBhdXRvY29tcGxldGUgYXV0b2NvcnJlY3QgdmFsdWUgcGxhY2Vob2xkZXIgcmVxdWlyZWQgZGlzYWJsZWQgbXVsdGlwbGUgY2hlY2tlZCByZWFkT25seVwiXG5cdHRleHRhcmVhOiBcImF1dG9mb2N1cyBhdXRvY29tcGxldGUgYXV0b2NvcnJlY3QgdmFsdWUgcGxhY2Vob2xkZXIgcmVxdWlyZWQgZGlzYWJsZWQgbXVsdGlwbGUgY2hlY2tlZCByZWFkT25seVwiXG5cdGZvcm06IFwibm92YWxpZGF0ZVwiXG5cdGZpZWxkc2V0OiBcImRpc2FibGVkXCJcblx0YnV0dG9uOiBcImRpc2FibGVkXCJcblx0c2VsZWN0OiBcImF1dG9mb2N1cyBkaXNhYmxlZCByZXF1aXJlZFwiXG5cdG9wdGlvbjogXCJkaXNhYmxlZCBzZWxlY3RlZCB2YWx1ZVwiXG5cdG9wdGdyb3VwOiBcImRpc2FibGVkXCJcblx0cHJvZ3Jlc3M6IFwidmFsdWVcIlxuXHRmaWVsZHNldDogXCJkaXNhYmxlZFwiXG5cdGNhbnZhczogXCJ3aWR0aCBoZWlnaHRcIlxuXG5kZWYgZXh0ZW5kZXIgb2JqLCBzdXBcblx0Zm9yIG93biBrLHYgb2Ygc3VwXG5cdFx0b2JqW2tdID89IHZcblxuXHRvYmo6cHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXA6cHJvdG90eXBlKVxuXHRvYmo6X19zdXBlcl9fID0gb2JqOnByb3RvdHlwZTpfX3N1cGVyX18gPSBzdXA6cHJvdG90eXBlXG5cdG9iajpwcm90b3R5cGU6Y29uc3RydWN0b3IgPSBvYmpcblx0c3VwLmluaGVyaXQob2JqKSBpZiBzdXA6aW5oZXJpdFxuXHRyZXR1cm4gb2JqXG5cbmRlZiBUYWdcblx0cmV0dXJuIGRvIHxkb20sY3R4fFxuXHRcdHRoaXMuaW5pdGlhbGl6ZShkb20sY3R4KVxuXHRcdHJldHVybiB0aGlzXG5cbmRlZiBUYWdTcGF3bmVyIHR5cGVcblx0cmV0dXJuIGRvIHx6b25lfCB0eXBlLmJ1aWxkKHpvbmUpXG5cblxuY2xhc3MgSW1iYS5UYWdzXG5cblx0ZGVmIGluaXRpYWxpemVcblx0XHRzZWxmXG5cblx0ZGVmIF9fY2xvbmUgbnNcblx0XHR2YXIgY2xvbmUgPSBPYmplY3QuY3JlYXRlKHNlbGYpXG5cdFx0Y2xvbmUuQHBhcmVudCA9IHNlbGZcblx0XHRyZXR1cm4gY2xvbmVcblxuXHRkZWYgbnMgbmFtZVxuXHRcdHNlbGZbJ18nICsgbmFtZS50b1VwcGVyQ2FzZV0gfHwgZGVmaW5lTmFtZXNwYWNlKG5hbWUpXG5cblx0ZGVmIGRlZmluZU5hbWVzcGFjZSBuYW1lXG5cdFx0dmFyIGNsb25lID0gT2JqZWN0LmNyZWF0ZShzZWxmKVxuXHRcdGNsb25lLkBwYXJlbnQgPSBzZWxmXG5cdFx0Y2xvbmUuQG5zID0gbmFtZVxuXHRcdHNlbGZbJ18nICsgbmFtZS50b1VwcGVyQ2FzZV0gPSBjbG9uZVxuXHRcdHJldHVybiBjbG9uZVxuXG5cdGRlZiBiYXNlVHlwZSBuYW1lLCBuc1xuXHRcdG5hbWUgaW4gSW1iYS5IVE1MX1RBR1MgPyAnZWxlbWVudCcgOiAnZGl2J1xuXG5cdGRlZiBkZWZpbmVUYWcgZnVsbE5hbWUsIHN1cHIgPSAnJywgJmJvZHlcblx0XHRpZiBib2R5IGFuZCBib2R5LkBub2RlVHlwZVxuXHRcdFx0c3VwciA9IGJvZHlcblx0XHRcdGJvZHkgPSBudWxsXG5cdFx0XHRcblx0XHRpZiBzZWxmW2Z1bGxOYW1lXVxuXHRcdFx0Y29uc29sZS5sb2cgXCJ0YWcgYWxyZWFkeSBleGlzdHM/XCIsZnVsbE5hbWVcblx0XHRcblx0XHQjIGlmIGl0IGlzIG5hbWVzcGFjZWRcblx0XHR2YXIgbnNcblx0XHR2YXIgbmFtZSA9IGZ1bGxOYW1lXG5cdFx0bGV0IG5zaWR4ID0gbmFtZS5pbmRleE9mKCc6Jylcblx0XHRpZiAgbnNpZHggPj0gMFxuXHRcdFx0bnMgPSBmdWxsTmFtZS5zdWJzdHIoMCxuc2lkeClcblx0XHRcdG5hbWUgPSBmdWxsTmFtZS5zdWJzdHIobnNpZHggKyAxKVxuXHRcdFx0aWYgbnMgPT0gJ3N2ZycgYW5kICFzdXByXG5cdFx0XHRcdHN1cHIgPSAnc3ZnOmVsZW1lbnQnXG5cblx0XHRzdXByIHx8PSBiYXNlVHlwZShmdWxsTmFtZSlcblxuXHRcdGxldCBzdXBlcnR5cGUgPSBzdXByIGlzYSBTdHJpbmcgPyBmaW5kVGFnVHlwZShzdXByKSA6IHN1cHJcblx0XHRsZXQgdGFndHlwZSA9IFRhZygpXG5cblx0XHR0YWd0eXBlLkBuYW1lID0gbmFtZVxuXHRcdHRhZ3R5cGUuQGZsYWdOYW1lID0gbnVsbFxuXG5cdFx0aWYgbmFtZVswXSA9PSAnIydcblx0XHRcdEltYmEuU0lOR0xFVE9OU1tuYW1lLnNsaWNlKDEpXSA9IHRhZ3R5cGVcblx0XHRcdHNlbGZbbmFtZV0gPSB0YWd0eXBlXG5cdFx0ZWxpZiBuYW1lWzBdID09IG5hbWVbMF0udG9VcHBlckNhc2Vcblx0XHRcdHRhZ3R5cGUuQGZsYWdOYW1lID0gbmFtZVxuXHRcdGVsc2Vcblx0XHRcdHRhZ3R5cGUuQGZsYWdOYW1lID0gXCJfXCIgKyBmdWxsTmFtZS5yZXBsYWNlKC9bX1xcOl0vZywgJy0nKVxuXHRcdFx0c2VsZltmdWxsTmFtZV0gPSB0YWd0eXBlXG5cblx0XHRleHRlbmRlcih0YWd0eXBlLHN1cGVydHlwZSlcblxuXHRcdGlmIGJvZHlcblx0XHRcdGJvZHkuY2FsbCh0YWd0eXBlLHRhZ3R5cGUsIHRhZ3R5cGUuVEFHUyBvciBzZWxmKVxuXHRcdFx0dGFndHlwZS5kZWZpbmVkIGlmIHRhZ3R5cGU6ZGVmaW5lZFxuXHRcdFx0b3B0aW1pemVUYWcodGFndHlwZSlcblx0XHRyZXR1cm4gdGFndHlwZVxuXG5cdGRlZiBkZWZpbmVTaW5nbGV0b24gbmFtZSwgc3VwciwgJmJvZHlcblx0XHRkZWZpbmVUYWcobmFtZSxzdXByLGJvZHkpXG5cblx0ZGVmIGV4dGVuZFRhZyBuYW1lLCBzdXByID0gJycsICZib2R5XG5cdFx0dmFyIGtsYXNzID0gKG5hbWUgaXNhIFN0cmluZyA/IGZpbmRUYWdUeXBlKG5hbWUpIDogbmFtZSlcblx0XHQjIGFsbG93IGZvciBwcml2YXRlIHRhZ3MgaGVyZSBhcyB3ZWxsP1xuXHRcdGJvZHkgYW5kIGJvZHkuY2FsbChrbGFzcyxrbGFzcyxrbGFzczpwcm90b3R5cGUpIGlmIGJvZHlcblx0XHRrbGFzcy5leHRlbmRlZCBpZiBrbGFzczpleHRlbmRlZFxuXHRcdG9wdGltaXplVGFnKGtsYXNzKVxuXHRcdHJldHVybiBrbGFzc1xuXG5cdGRlZiBvcHRpbWl6ZVRhZyB0YWd0eXBlXG5cdFx0dGFndHlwZTpwcm90b3R5cGU/Lm9wdGltaXplVGFnU3RydWN0dXJlXG5cdFx0XG5cdGRlZiBmaW5kVGFnVHlwZSB0eXBlXG5cdFx0bGV0IGtsYXNzID0gc2VsZlt0eXBlXVxuXHRcdHVubGVzcyBrbGFzc1xuXHRcdFx0aWYgdHlwZS5zdWJzdHIoMCw0KSA9PSAnc3ZnOidcblx0XHRcdFx0a2xhc3MgPSBkZWZpbmVUYWcodHlwZSwnc3ZnOmVsZW1lbnQnKVxuXG5cdFx0XHRlbGlmIEltYmEuSFRNTF9UQUdTLmluZGV4T2YodHlwZSkgPj0gMFxuXHRcdFx0XHRrbGFzcyA9IGRlZmluZVRhZyh0eXBlLCdlbGVtZW50JylcblxuXHRcdFx0XHRpZiBsZXQgYXR0cnMgPSBJbWJhLkhUTUxfQVRUUlNbdHlwZV1cblx0XHRcdFx0XHRmb3IgbmFtZSBpbiBhdHRycy5zcGxpdChcIiBcIilcblx0XHRcdFx0XHRcdEltYmEuYXR0cihrbGFzcyxuYW1lKVxuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdGlmIGxldCBwcm9wcyA9IEltYmEuSFRNTF9QUk9QU1t0eXBlXVxuXHRcdFx0XHRcdGZvciBuYW1lIGluIHByb3BzLnNwbGl0KFwiIFwiKVxuXHRcdFx0XHRcdFx0SW1iYS5hdHRyKGtsYXNzLG5hbWUsZG9tOiB5ZXMpXG5cdFx0cmV0dXJuIGtsYXNzXG5cdFx0XG5cdGRlZiBjcmVhdGVFbGVtZW50IG5hbWUsIG93bmVyXG5cdFx0dmFyIHR5cFxuXHRcdGlmIG5hbWUgaXNhIEZ1bmN0aW9uXG5cdFx0XHR0eXAgPSBuYW1lXG5cdFx0ZWxzZVx0XHRcdFxuXHRcdFx0aWYgJGRlYnVnJFxuXHRcdFx0XHR0aHJvdyhcImNhbm5vdCBmaW5kIHRhZy10eXBlIHtuYW1lfVwiKSB1bmxlc3MgZmluZFRhZ1R5cGUobmFtZSlcblx0XHRcdHR5cCA9IGZpbmRUYWdUeXBlKG5hbWUpXG5cdFx0dHlwLmJ1aWxkKG93bmVyKVxuXG5cbmRlZiBJbWJhLmNyZWF0ZUVsZW1lbnQgbmFtZSwgY3R4LCByZWYsIHByZWZcblx0dmFyIHR5cGUgPSBuYW1lXG5cdHZhciBwYXJlbnRcblx0aWYgbmFtZSBpc2EgRnVuY3Rpb25cblx0XHR0eXBlID0gbmFtZVxuXHRlbHNlXG5cdFx0aWYgJGRlYnVnJFxuXHRcdFx0dGhyb3coXCJjYW5ub3QgZmluZCB0YWctdHlwZSB7bmFtZX1cIikgdW5sZXNzIEltYmEuVEFHUy5maW5kVGFnVHlwZShuYW1lKVxuXHRcdHR5cGUgPSBJbWJhLlRBR1MuZmluZFRhZ1R5cGUobmFtZSlcblx0XG5cdGlmIGN0eCBpc2EgVGFnTWFwXG5cdFx0cGFyZW50ID0gY3R4OnBhciRcblx0ZWxpZiBwcmVmIGlzYSBJbWJhLlRhZ1xuXHRcdHBhcmVudCA9IHByZWZcblx0ZWxzZVxuXHRcdHBhcmVudCA9IGN0eCBhbmQgcHJlZiAhPSB1bmRlZmluZWQgPyBjdHhbcHJlZl0gOiAoY3R4IGFuZCBjdHguQHRhZyBvciBjdHgpXG5cblx0dmFyIG5vZGUgPSB0eXBlLmJ1aWxkKHBhcmVudClcblx0XG5cdGlmIGN0eCBpc2EgVGFnTWFwXG5cdFx0Y3R4OmkkKytcblx0XHRub2RlOiRrZXkgPSByZWZcblxuXHQjIG5vZGU6JHJlZiA9IHJlZiBpZiByZWZcblx0IyBjb250ZXh0OmkkKysgIyBvbmx5IGlmIGl0IGlzIG5vdCBhbiBhcnJheT9cblx0aWYgY3R4IGFuZCByZWYgIT0gdW5kZWZpbmVkXG5cdFx0Y3R4W3JlZl0gPSBub2RlXG5cblx0cmV0dXJuIG5vZGVcblxuZGVmIEltYmEuY3JlYXRlVGFnQ2FjaGUgb3duZXJcblx0dmFyIGl0ZW0gPSBbXVxuXHRpdGVtLkB0YWcgPSBvd25lclxuXHRyZXR1cm4gaXRlbVxuXG5cdHZhciBwYXIgPSAocHJlZiAhPSB1bmRlZmluZWQgPyBjdHhbcHJlZl0gOiBjdHguQHRhZylcblx0dmFyIG5vZGUgPSBUYWdNYXAubmV3KGN0eCxyZWYscGFyKVxuXHRjdHhbcmVmXSA9IG5vZGVcblx0cmV0dXJuIG5vZGVcblx0XG5kZWYgSW1iYS5jcmVhdGVUYWdNYXAgY3R4LCByZWYsIHByZWZcblx0dmFyIHBhciA9IChwcmVmICE9IHVuZGVmaW5lZCA/IHByZWYgOiBjdHguQHRhZylcblx0dmFyIG5vZGUgPSBUYWdNYXAubmV3KGN0eCxyZWYscGFyKVxuXHRjdHhbcmVmXSA9IG5vZGVcblx0cmV0dXJuIG5vZGVcblxuZGVmIEltYmEuY3JlYXRlVGFnTGlzdCBjdHgsIHJlZiwgcHJlZlxuXHR2YXIgbm9kZSA9IFtdXG5cdG5vZGUuQHR5cGUgPSA0XG5cdG5vZGUuQHRhZyA9IChwcmVmICE9IHVuZGVmaW5lZCA/IHByZWYgOiBjdHguQHRhZylcblx0Y3R4W3JlZl0gPSBub2RlXG5cdHJldHVybiBub2RlXG5cbmRlZiBJbWJhLmNyZWF0ZVRhZ0xvb3BSZXN1bHQgY3R4LCByZWYsIHByZWZcblx0dmFyIG5vZGUgPSBbXVxuXHRub2RlLkB0eXBlID0gNVxuXHRub2RlOmNhY2hlID0ge2kkOiAwfVxuXHRyZXR1cm4gbm9kZVxuXG4jIHVzZSBhcnJheSBpbnN0ZWFkP1xuY2xhc3MgVGFnQ2FjaGVcblx0ZGVmIHNlbGYuYnVpbGQgb3duZXJcblx0XHR2YXIgaXRlbSA9IFtdXG5cdFx0aXRlbS5AdGFnID0gb3duZXJcblx0XHRyZXR1cm4gaXRlbVxuXG5cdGRlZiBpbml0aWFsaXplIG93bmVyXG5cdFx0c2VsZi5AdGFnID0gb3duZXJcblx0XHRzZWxmXG5cdFxuY2xhc3MgVGFnTWFwXG5cdFxuXHRkZWYgaW5pdGlhbGl6ZSBjYWNoZSwgcmVmLCBwYXJcblx0XHRzZWxmOmNhY2hlJCA9IGNhY2hlXG5cdFx0c2VsZjprZXkkID0gcmVmXG5cdFx0c2VsZjpwYXIkID0gcGFyXG5cdFx0c2VsZjppJCA9IDBcblx0XHQjIHNlbGY6Y3VyciQgPSBzZWxmOiRpdGVybmV3KClcblx0XHQjIHNlbGY6bmV4dCQgPSBzZWxmOiRpdGVybmV3KClcblx0XG5cdGRlZiAkaXRlclxuXHRcdHZhciBpdGVtID0gW11cblx0XHRpdGVtLkB0eXBlID0gNVxuXHRcdGl0ZW06c3RhdGljID0gNSAjIHdyb25nKCEpXG5cdFx0aXRlbTpjYWNoZSA9IHNlbGZcblx0XHRyZXR1cm4gaXRlbVxuXHRcdFxuXHRkZWYgJHBydW5lIGl0ZW1zXG5cdFx0bGV0IGNhY2hlID0gc2VsZjpjYWNoZSRcblx0XHRsZXQga2V5ID0gc2VsZjprZXkkXG5cdFx0bGV0IGNsb25lID0gVGFnTWFwLm5ldyhjYWNoZSxrZXksc2VsZjpwYXIkKVxuXHRcdGZvciBpdGVtIGluIGl0ZW1zXG5cdFx0XHRjbG9uZVtpdGVtOmtleSRdID0gaXRlbVxuXHRcdGNsb25lOmkkID0gaXRlbXM6bGVuZ3RoXG5cdFx0cmV0dXJuIGNhY2hlW2tleV0gPSBjbG9uZVxuXG5JbWJhLlRhZ01hcCA9IFRhZ01hcFxuSW1iYS5UYWdDYWNoZSA9IFRhZ0NhY2hlXG5JbWJhLlNJTkdMRVRPTlMgPSB7fVxuSW1iYS5UQUdTID0gSW1iYS5UYWdzLm5ld1xuSW1iYS5UQUdTWzplbGVtZW50XSA9IEltYmEuVEFHU1s6aHRtbGVsZW1lbnRdID0gSW1iYS5UYWdcbkltYmEuVEFHU1snc3ZnOmVsZW1lbnQnXSA9IEltYmEuU1ZHVGFnXG5cbmRlZiBJbWJhLmRlZmluZVRhZyBuYW1lLCBzdXByID0gJycsICZib2R5XG5cdHJldHVybiBJbWJhLlRBR1MuZGVmaW5lVGFnKG5hbWUsc3Vwcixib2R5KVxuXG5kZWYgSW1iYS5kZWZpbmVTaW5nbGV0b25UYWcgaWQsIHN1cHIgPSAnZGl2JywgJmJvZHlcblx0cmV0dXJuIEltYmEuVEFHUy5kZWZpbmVUYWcobmFtZSxzdXByLGJvZHkpXG5cbmRlZiBJbWJhLmV4dGVuZFRhZyBuYW1lLCBib2R5XG5cdHJldHVybiBJbWJhLlRBR1MuZXh0ZW5kVGFnKG5hbWUsYm9keSlcblxuZGVmIEltYmEuZ2V0VGFnU2luZ2xldG9uIGlkXHRcblx0dmFyIGRvbSwgbm9kZVxuXG5cdGlmIHZhciBrbGFzcyA9IEltYmEuU0lOR0xFVE9OU1tpZF1cblx0XHRyZXR1cm4ga2xhc3MuSW5zdGFuY2UgaWYga2xhc3MgYW5kIGtsYXNzLkluc3RhbmNlIFxuXG5cdFx0IyBubyBpbnN0YW5jZSAtIGNoZWNrIGZvciBlbGVtZW50XG5cdFx0aWYgZG9tID0gSW1iYS5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcblx0XHRcdCMgd2UgaGF2ZSBhIGxpdmUgaW5zdGFuY2UgLSB3aGVuIGZpbmRpbmcgaXQgdGhyb3VnaCBhIHNlbGVjdG9yIHdlIHNob3VsZCBhd2FrZSBpdCwgbm8/XG5cdFx0XHQjIGNvbnNvbGUubG9nKCdjcmVhdGluZyB0aGUgc2luZ2xldG9uIGZyb20gZXhpc3Rpbmcgbm9kZSBpbiBkb20/JyxpZCx0eXBlKVxuXHRcdFx0bm9kZSA9IGtsYXNzLkluc3RhbmNlID0ga2xhc3MubmV3KGRvbSlcblx0XHRcdG5vZGUuYXdha2VuKGRvbSkgIyBzaG91bGQgb25seSBhd2FrZW5cblx0XHRcdHJldHVybiBub2RlXG5cblx0XHRkb20gPSBrbGFzcy5jcmVhdGVOb2RlXG5cdFx0ZG9tOmlkID0gaWRcblx0XHRub2RlID0ga2xhc3MuSW5zdGFuY2UgPSBrbGFzcy5uZXcoZG9tKVxuXHRcdG5vZGUuZW5kLmF3YWtlbihkb20pXG5cdFx0cmV0dXJuIG5vZGVcblx0ZWxpZiBkb20gPSBJbWJhLmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxuXHRcdHJldHVybiBJbWJhLmdldFRhZ0ZvckRvbShkb20pXG5cbnZhciBzdmdTdXBwb3J0ID0gdHlwZW9mIFNWR0VsZW1lbnQgIT09ICd1bmRlZmluZWQnXG5cbiMgc2h1b2xkIGJlIHBoYXNlZCBvdXRcbmRlZiBJbWJhLmdldFRhZ0ZvckRvbSBkb21cblx0cmV0dXJuIG51bGwgdW5sZXNzIGRvbVxuXHRyZXR1cm4gZG9tIGlmIGRvbS5AZG9tICMgY291bGQgdXNlIGluaGVyaXRhbmNlIGluc3RlYWRcblx0cmV0dXJuIGRvbS5AdGFnIGlmIGRvbS5AdGFnXG5cdHJldHVybiBudWxsIHVubGVzcyBkb206bm9kZU5hbWVcblxuXHR2YXIgbmFtZSA9IGRvbTpub2RlTmFtZS50b0xvd2VyQ2FzZVxuXHR2YXIgdHlwZSA9IG5hbWVcblx0dmFyIG5zID0gSW1iYS5UQUdTICMgIHN2Z1N1cHBvcnQgYW5kIGRvbSBpc2EgU1ZHRWxlbWVudCA/IEltYmEuVEFHUzpfU1ZHIDogSW1iYS5UQUdTXG5cblx0aWYgZG9tOmlkIGFuZCBJbWJhLlNJTkdMRVRPTlNbZG9tOmlkXVxuXHRcdHJldHVybiBJbWJhLmdldFRhZ1NpbmdsZXRvbihkb206aWQpXG5cdFx0XG5cdGlmIHN2Z1N1cHBvcnQgYW5kIGRvbSBpc2EgU1ZHRWxlbWVudFxuXHRcdHR5cGUgPSBucy5maW5kVGFnVHlwZShcInN2ZzpcIiArIG5hbWUpXG5cdGVsaWYgSW1iYS5IVE1MX1RBR1MuaW5kZXhPZihuYW1lKSA+PSAwXG5cdFx0dHlwZSA9IG5zLmZpbmRUYWdUeXBlKG5hbWUpXG5cdGVsc2Vcblx0XHR0eXBlID0gSW1iYS5UYWdcblx0IyBpZiBucy5Abm9kZU5hbWVzLmluZGV4T2YobmFtZSkgPj0gMFxuXHQjXHR0eXBlID0gbnMuZmluZFRhZ1R5cGUobmFtZSlcblxuXHRyZXR1cm4gdHlwZS5uZXcoZG9tLG51bGwpLmF3YWtlbihkb20pXG5cbiMgZGVwcmVjYXRlXG5kZWYgSW1iYS5nZW5lcmF0ZUNTU1ByZWZpeGVzXG5cdHZhciBzdHlsZXMgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudDpkb2N1bWVudEVsZW1lbnQsICcnKVxuXG5cdGZvciBwcmVmaXhlZCBpbiBzdHlsZXNcblx0XHR2YXIgdW5wcmVmaXhlZCA9IHByZWZpeGVkLnJlcGxhY2UoL14tKHdlYmtpdHxtc3xtb3p8b3xibGluayktLywnJylcblx0XHR2YXIgY2FtZWxDYXNlID0gdW5wcmVmaXhlZC5yZXBsYWNlKC8tKFxcdykvZykgZG8gfG0sYXwgYS50b1VwcGVyQ2FzZVxuXG5cdFx0IyBpZiB0aGVyZSBleGlzdHMgYW4gdW5wcmVmaXhlZCB2ZXJzaW9uIC0tIGFsd2F5cyB1c2UgdGhpc1xuXHRcdGlmIHByZWZpeGVkICE9IHVucHJlZml4ZWRcblx0XHRcdGNvbnRpbnVlIGlmIHN0eWxlcy5oYXNPd25Qcm9wZXJ0eSh1bnByZWZpeGVkKVxuXG5cdFx0IyByZWdpc3RlciB0aGUgcHJlZml4ZXNcblx0XHRJbWJhLkNTU0tleU1hcFt1bnByZWZpeGVkXSA9IEltYmEuQ1NTS2V5TWFwW2NhbWVsQ2FzZV0gPSBwcmVmaXhlZFxuXHRyZXR1cm5cblxuaWYgJHdlYiRcblx0SW1iYS5nZW5lcmF0ZUNTU1ByZWZpeGVzIGlmIGRvY3VtZW50XG5cblx0IyBPdnZlcnJpZGUgY2xhc3NMaXN0XG5cdGlmIGRvY3VtZW50IGFuZCAhZG9jdW1lbnQ6ZG9jdW1lbnRFbGVtZW50OmNsYXNzTGlzdFxuXHRcdGV4dGVuZCB0YWcgZWxlbWVudFxuXG5cdFx0XHRkZWYgaGFzRmxhZyByZWZcblx0XHRcdFx0cmV0dXJuIFJlZ0V4cC5uZXcoJyhefFxcXFxzKScgKyByZWYgKyAnKFxcXFxzfCQpJykudGVzdChAZG9tOmNsYXNzTmFtZSlcblxuXHRcdFx0ZGVmIGFkZEZsYWcgcmVmXG5cdFx0XHRcdHJldHVybiBzZWxmIGlmIGhhc0ZsYWcocmVmKVxuXHRcdFx0XHRAZG9tOmNsYXNzTmFtZSArPSAoQGRvbTpjbGFzc05hbWUgPyAnICcgOiAnJykgKyByZWZcblx0XHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdFx0ZGVmIHVuZmxhZyByZWZcblx0XHRcdFx0cmV0dXJuIHNlbGYgdW5sZXNzIGhhc0ZsYWcocmVmKVxuXHRcdFx0XHR2YXIgcmVnZXggPSBSZWdFeHAubmV3KCcoXnxcXFxccykqJyArIHJlZiArICcoXFxcXHN8JCkqJywgJ2cnKVxuXHRcdFx0XHRAZG9tOmNsYXNzTmFtZSA9IEBkb206Y2xhc3NOYW1lLnJlcGxhY2UocmVnZXgsICcnKVxuXHRcdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0XHRkZWYgdG9nZ2xlRmxhZyByZWZcblx0XHRcdFx0aGFzRmxhZyhyZWYpID8gdW5mbGFnKHJlZikgOiBmbGFnKHJlZilcblxuXHRcdFx0ZGVmIGZsYWcgcmVmLCBib29sXG5cdFx0XHRcdGlmIGFyZ3VtZW50czpsZW5ndGggPT0gMiBhbmQgISFib29sID09PSBub1xuXHRcdFx0XHRcdHJldHVybiB1bmZsYWcocmVmKVxuXHRcdFx0XHRyZXR1cm4gYWRkRmxhZyhyZWYpXG5cbkltYmEuVGFnXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vdGFnLmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbiMgcHJlZGVmaW5lIGFsbCBzdXBwb3J0ZWQgaHRtbCB0YWdzXG50YWcgZnJhZ21lbnQgPCBlbGVtZW50XG5cblx0ZGVmIHNlbGYuY3JlYXRlTm9kZVxuXHRcdEltYmEuZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudFxuXG5leHRlbmQgdGFnIGh0bWxcblx0ZGVmIHBhcmVudFxuXHRcdG51bGxcblxuXG5leHRlbmQgdGFnIGNhbnZhc1xuXHRkZWYgY29udGV4dCB0eXBlID0gJzJkJ1xuXHRcdGRvbS5nZXRDb250ZXh0KHR5cGUpXG5cbmNsYXNzIERhdGFQcm94eVx0XG5cdGRlZiBzZWxmLmJpbmQgcmVjZWl2ZXIsIGRhdGEsIHBhdGgsIGFyZ3Ncblx0XHRsZXQgcHJveHkgPSByZWNlaXZlci5AZGF0YSB8fD0gc2VsZi5uZXcocmVjZWl2ZXIscGF0aCxhcmdzKVxuXHRcdHByb3h5LmJpbmQoZGF0YSxwYXRoLGFyZ3MpXG5cdFx0cmV0dXJuIHJlY2VpdmVyXG5cblx0ZGVmIGluaXRpYWxpemUgbm9kZSwgcGF0aCwgYXJnc1xuXHRcdEBub2RlID0gbm9kZVxuXHRcdEBwYXRoID0gcGF0aFxuXHRcdEBhcmdzID0gYXJnc1xuXHRcdEBzZXR0ZXIgPSBJbWJhLnRvU2V0dGVyKEBwYXRoKSBpZiBAYXJnc1xuXHRcdFxuXHRkZWYgYmluZCBkYXRhLCBrZXksIGFyZ3Ncblx0XHRpZiBkYXRhICE9IEBkYXRhXG5cdFx0XHRAZGF0YSA9IGRhdGFcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBnZXRGb3JtVmFsdWVcblx0XHRAc2V0dGVyID8gQGRhdGFbQHBhdGhdKCkgOiBAZGF0YVtAcGF0aF1cblxuXHRkZWYgc2V0Rm9ybVZhbHVlIHZhbHVlXG5cdFx0QHNldHRlciA/IEBkYXRhW0BzZXR0ZXJdKHZhbHVlKSA6IChAZGF0YVtAcGF0aF0gPSB2YWx1ZSlcblxuXG52YXIgaXNBcnJheSA9IGRvIHx2YWx8XG5cdHZhbCBhbmQgdmFsOnNwbGljZSBhbmQgdmFsOnNvcnRcblxudmFyIGlzU2ltaWxhckFycmF5ID0gZG8gfGEsYnxcblx0bGV0IGwgPSBhOmxlbmd0aCwgaSA9IDBcblx0cmV0dXJuIG5vIHVubGVzcyBsID09IGI6bGVuZ3RoXG5cdHdoaWxlIGkrKyA8IGxcblx0XHRyZXR1cm4gbm8gaWYgYVtpXSAhPSBiW2ldXG5cdHJldHVybiB5ZXNcblxuZXh0ZW5kIHRhZyBpbnB1dFxuXHRwcm9wIGxhenlcblxuXHRkZWYgc2V0TW9kZWxcblx0XHRjb25zb2xlLndhcm4gXCJzZXRNb2RlbCByZW1vdmVkLiBVc2UgPGlucHV0W2RhdGE6cGF0aF0+XCJcblx0XHRyZXR1cm4gc2VsZlxuXHRcblx0ZGVmIGJpbmREYXRhIHRhcmdldCwgcGF0aCwgYXJnc1xuXHRcdERhdGFQcm94eS5iaW5kKHNlbGYsdGFyZ2V0LHBhdGgsYXJncylcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBzZXRWYWx1ZSB2YWx1ZVxuXHRcdGRvbTp2YWx1ZSA9IEB2YWx1ZSA9IHZhbHVlXG5cdFx0c2VsZlxuXG5cdGRlZiBvbmlucHV0IGVcblx0XHRsZXQgdmFsID0gQGRvbTp2YWx1ZVxuXHRcdEBsb2NhbFZhbHVlID0gQGluaXRpYWxWYWx1ZSAhPSB2YWwgPyB2YWwgOiB1bmRlZmluZWRcblx0XHRAZGF0YSBhbmQgIWxhenkgPyBAZGF0YS5zZXRGb3JtVmFsdWUodmFsdWUsc2VsZikgOiBlLnNpbGVuY2Vcblx0XHRcblx0ZGVmIG9uY2hhbmdlIGVcblx0XHRAbW9kZWxWYWx1ZSA9IEBsb2NhbFZhbHVlID0gdW5kZWZpbmVkXG5cdFx0cmV0dXJuIGUuc2lsZW5jZSB1bmxlc3MgZGF0YVxuXHRcdFxuXHRcdGlmIHR5cGUgPT0gJ3JhZGlvJyBvciB0eXBlID09ICdjaGVja2JveCdcblx0XHRcdGxldCBjaGVja2VkID0gQGRvbTpjaGVja2VkXG5cdFx0XHRsZXQgbXZhbCA9IEBkYXRhLmdldEZvcm1WYWx1ZShzZWxmKVxuXHRcdFx0bGV0IGR2YWwgPSBAdmFsdWUgIT0gdW5kZWZpbmVkID8gQHZhbHVlIDogdmFsdWVcblxuXHRcdFx0aWYgdHlwZSA9PSAncmFkaW8nXG5cdFx0XHRcdEBkYXRhLnNldEZvcm1WYWx1ZShkdmFsLHNlbGYpXG5cdFx0XHRlbGlmIGRvbTp2YWx1ZSA9PSAnb24nXG5cdFx0XHRcdEBkYXRhLnNldEZvcm1WYWx1ZSghIWNoZWNrZWQsc2VsZilcblx0XHRcdGVsaWYgaXNBcnJheShtdmFsKVxuXHRcdFx0XHRsZXQgaWR4ID0gbXZhbC5pbmRleE9mKGR2YWwpXG5cdFx0XHRcdGlmIGNoZWNrZWQgYW5kIGlkeCA9PSAtMVxuXHRcdFx0XHRcdG12YWwucHVzaChkdmFsKVxuXHRcdFx0XHRlbGlmICFjaGVja2VkIGFuZCBpZHggPj0gMFxuXHRcdFx0XHRcdG12YWwuc3BsaWNlKGlkeCwxKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRAZGF0YS5zZXRGb3JtVmFsdWUoZHZhbCxzZWxmKVxuXHRcdGVsc2Vcblx0XHRcdEBkYXRhLnNldEZvcm1WYWx1ZSh2YWx1ZSlcblx0XG5cdCMgb3ZlcnJpZGluZyBlbmQgZGlyZWN0bHkgZm9yIHBlcmZvcm1hbmNlXG5cdGRlZiBlbmRcblx0XHRyZXR1cm4gc2VsZiBpZiAhQGRhdGEgb3IgQGxvY2FsVmFsdWUgIT09IHVuZGVmaW5lZFxuXHRcdGxldCBtdmFsID0gQGRhdGEuZ2V0Rm9ybVZhbHVlKHNlbGYpXG5cdFx0cmV0dXJuIHNlbGYgaWYgbXZhbCA9PSBAbW9kZWxWYWx1ZVxuXHRcdEBtb2RlbFZhbHVlID0gbXZhbCB1bmxlc3MgaXNBcnJheShtdmFsKVxuXG5cdFx0aWYgdHlwZSA9PSAncmFkaW8nIG9yIHR5cGUgPT0gJ2NoZWNrYm94J1xuXHRcdFx0bGV0IGR2YWwgPSBAdmFsdWVcblx0XHRcdGxldCBjaGVja2VkID0gaWYgaXNBcnJheShtdmFsKVxuXHRcdFx0XHRtdmFsLmluZGV4T2YoZHZhbCkgPj0gMFxuXHRcdFx0ZWxpZiBkb206dmFsdWUgPT0gJ29uJ1xuXHRcdFx0XHQhIW12YWxcblx0XHRcdGVsc2Vcblx0XHRcdFx0bXZhbCA9PSBAdmFsdWVcblxuXHRcdFx0QGRvbTpjaGVja2VkID0gY2hlY2tlZFxuXHRcdGVsc2Vcblx0XHRcdEBkb206dmFsdWUgPSBtdmFsXG5cdFx0XHRAaW5pdGlhbFZhbHVlID0gQGRvbTp2YWx1ZVxuXHRcdHNlbGZcblxuZXh0ZW5kIHRhZyB0ZXh0YXJlYVxuXHRwcm9wIGxhenlcblxuXHRkZWYgc2V0TW9kZWwgdmFsdWUsIG1vZHNcblx0XHRjb25zb2xlLndhcm4gXCJzZXRNb2RlbCByZW1vdmVkLiBVc2UgPHRleHRhcmVhW2RhdGE6cGF0aF0+XCJcblx0XHRyZXR1cm4gc2VsZlxuXHRcdFxuXHRkZWYgYmluZERhdGEgdGFyZ2V0LCBwYXRoLCBhcmdzXG5cdFx0RGF0YVByb3h5LmJpbmQoc2VsZix0YXJnZXQscGF0aCxhcmdzKVxuXHRcdHNlbGZcblx0XG5cdGRlZiBzZXRWYWx1ZSB2YWx1ZVxuXHRcdGRvbTp2YWx1ZSA9IHZhbHVlIGlmIEBsb2NhbFZhbHVlID09IHVuZGVmaW5lZFxuXHRcdHJldHVybiBzZWxmXG5cdFxuXHRkZWYgb25pbnB1dCBlXG5cdFx0bGV0IHZhbCA9IEBkb206dmFsdWVcblx0XHRAbG9jYWxWYWx1ZSA9IEBpbml0aWFsVmFsdWUgIT0gdmFsID8gdmFsIDogdW5kZWZpbmVkXG5cdFx0QGRhdGEgYW5kICFsYXp5ID8gQGRhdGEuc2V0Rm9ybVZhbHVlKHZhbHVlLHNlbGYpIDogZS5zaWxlbmNlXG5cblx0ZGVmIG9uY2hhbmdlIGVcblx0XHRAbG9jYWxWYWx1ZSA9IHVuZGVmaW5lZFxuXHRcdEBkYXRhID8gQGRhdGEuc2V0Rm9ybVZhbHVlKHZhbHVlLHNlbGYpIDogZS5zaWxlbmNlXG5cdFx0XG5cdGRlZiByZW5kZXJcblx0XHRyZXR1cm4gaWYgQGxvY2FsVmFsdWUgIT0gdW5kZWZpbmVkIG9yICFAZGF0YVxuXHRcdGlmIEBkYXRhXG5cdFx0XHRsZXQgZHZhbCA9IEBkYXRhLmdldEZvcm1WYWx1ZShzZWxmKVxuXHRcdFx0QGRvbTp2YWx1ZSA9IGR2YWwgIT0gdW5kZWZpbmVkID8gZHZhbCA6ICcnXG5cdFx0QGluaXRpYWxWYWx1ZSA9IEBkb206dmFsdWVcblx0XHRzZWxmXG5cbmV4dGVuZCB0YWcgb3B0aW9uXG5cdGRlZiBzZXRWYWx1ZSB2YWx1ZVxuXHRcdGlmIHZhbHVlICE9IEB2YWx1ZVxuXHRcdFx0ZG9tOnZhbHVlID0gQHZhbHVlID0gdmFsdWVcblx0XHRzZWxmXG5cblx0ZGVmIHZhbHVlXG5cdFx0QHZhbHVlIG9yIGRvbTp2YWx1ZVxuXG5leHRlbmQgdGFnIHNlbGVjdFxuXHRkZWYgYmluZERhdGEgdGFyZ2V0LCBwYXRoLCBhcmdzXG5cdFx0RGF0YVByb3h5LmJpbmQoc2VsZix0YXJnZXQscGF0aCxhcmdzKVxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIHNldE1vZGVsIHZhbHVlLCBtb2RzXG5cdFx0Y29uc29sZS53YXJuIFwic2V0TW9kZWwgcmVtb3ZlZC4gVXNlIDxzZWxlY3RbZGF0YTpwYXRoXT5cIlxuXHRcdHJldHVybiBzZWxmXG5cdFx0XG5cdGRlZiBzZXRWYWx1ZSB2YWx1ZSwgc3luY2luZ1xuXHRcdGxldCBwcmV2ID0gQHZhbHVlXG5cdFx0QHZhbHVlID0gdmFsdWVcblx0XHRzeW5jVmFsdWUodmFsdWUpIHVubGVzcyBzeW5jaW5nXG5cdFx0cmV0dXJuIHNlbGZcblx0XHRcblx0ZGVmIHN5bmNWYWx1ZSB2YWx1ZVxuXHRcdGxldCBwcmV2ID0gQHN5bmNWYWx1ZVxuXHRcdCMgY2hlY2sgaWYgdmFsdWUgaGFzIGNoYW5nZWRcblx0XHRpZiBtdWx0aXBsZSBhbmQgdmFsdWUgaXNhIEFycmF5XG5cdFx0XHRpZiBwcmV2IGlzYSBBcnJheSBhbmQgaXNTaW1pbGFyQXJyYXkocHJldix2YWx1ZSlcblx0XHRcdFx0cmV0dXJuIHNlbGZcblx0XHRcdCMgY3JlYXRlIGEgY29weSBmb3Igc3luY1ZhbHVlXG5cdFx0XHR2YWx1ZSA9IHZhbHVlLnNsaWNlXG5cblx0XHRAc3luY1ZhbHVlID0gdmFsdWVcblx0XHQjIHN1cHBvcnQgYXJyYXkgZm9yIG11bHRpcGxlP1xuXHRcdGlmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0J1xuXHRcdFx0bGV0IG11bHQgPSBtdWx0aXBsZSBhbmQgdmFsdWUgaXNhIEFycmF5XG5cdFx0XHRcblx0XHRcdGZvciBvcHQsaSBpbiBkb206b3B0aW9uc1xuXHRcdFx0XHRsZXQgb3ZhbCA9IChvcHQuQHRhZyA/IG9wdC5AdGFnLnZhbHVlIDogb3B0OnZhbHVlKVxuXHRcdFx0XHRpZiBtdWx0XG5cdFx0XHRcdFx0b3B0OnNlbGVjdGVkID0gdmFsdWUuaW5kZXhPZihvdmFsKSA+PSAwXG5cdFx0XHRcdGVsaWYgdmFsdWUgPT0gb3ZhbFxuXHRcdFx0XHRcdGRvbTpzZWxlY3RlZEluZGV4ID0gaVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0ZWxzZVxuXHRcdFx0ZG9tOnZhbHVlID0gdmFsdWVcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiB2YWx1ZVxuXHRcdGlmIG11bHRpcGxlXG5cdFx0XHRmb3Igb3B0aW9uIGluIGRvbTpzZWxlY3RlZE9wdGlvbnNcblx0XHRcdFx0b3B0aW9uLkB0YWcgPyBvcHRpb24uQHRhZy52YWx1ZSA6IG9wdGlvbjp2YWx1ZVxuXHRcdGVsc2Vcblx0XHRcdGxldCBvcHQgPSBkb206c2VsZWN0ZWRPcHRpb25zWzBdXG5cdFx0XHRvcHQgPyAob3B0LkB0YWcgPyBvcHQuQHRhZy52YWx1ZSA6IG9wdDp2YWx1ZSkgOiBudWxsXG5cdFxuXHRkZWYgb25jaGFuZ2UgZVxuXHRcdEBkYXRhID8gQGRhdGEuc2V0Rm9ybVZhbHVlKHZhbHVlLHNlbGYpIDogZS5zaWxlbmNlXG5cdFx0XG5cdGRlZiBlbmRcblx0XHRpZiBAZGF0YVxuXHRcdFx0c2V0VmFsdWUoQGRhdGEuZ2V0Rm9ybVZhbHVlKHNlbGYpLDEpXG5cblx0XHRpZiBAdmFsdWUgIT0gQHN5bmNWYWx1ZVxuXHRcdFx0c3luY1ZhbHVlKEB2YWx1ZSlcblx0XHRzZWxmXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL2h0bWwuaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuIyBJbWJhLlRvdWNoXG4jIEJlZ2FuXHRBIGZpbmdlciB0b3VjaGVkIHRoZSBzY3JlZW4uXG4jIE1vdmVkXHRBIGZpbmdlciBtb3ZlZCBvbiB0aGUgc2NyZWVuLlxuIyBTdGF0aW9uYXJ5XHRBIGZpbmdlciBpcyB0b3VjaGluZyB0aGUgc2NyZWVuIGJ1dCBoYXNuJ3QgbW92ZWQuXG4jIEVuZGVkXHRBIGZpbmdlciB3YXMgbGlmdGVkIGZyb20gdGhlIHNjcmVlbi4gVGhpcyBpcyB0aGUgZmluYWwgcGhhc2Ugb2YgYSB0b3VjaC5cbiMgQ2FuY2VsZWQgVGhlIHN5c3RlbSBjYW5jZWxsZWQgdHJhY2tpbmcgZm9yIHRoZSB0b3VjaC5cblxuIyMjXG5Db25zb2xpZGF0ZXMgbW91c2UgYW5kIHRvdWNoIGV2ZW50cy4gVG91Y2ggb2JqZWN0cyBwZXJzaXN0IGFjcm9zcyBhIHRvdWNoLFxuZnJvbSB0b3VjaHN0YXJ0IHVudGlsIGVuZC9jYW5jZWwuIFdoZW4gYSB0b3VjaCBzdGFydHMsIGl0IHdpbGwgdHJhdmVyc2VcbmRvd24gZnJvbSB0aGUgaW5uZXJtb3N0IHRhcmdldCwgdW50aWwgaXQgZmluZHMgYSBub2RlIHRoYXQgcmVzcG9uZHMgdG9cbm9udG91Y2hzdGFydC4gVW5sZXNzIHRoZSB0b3VjaCBpcyBleHBsaWNpdGx5IHJlZGlyZWN0ZWQsIHRoZSB0b3VjaCB3aWxsXG5jYWxsIG9udG91Y2htb3ZlIGFuZCBvbnRvdWNoZW5kIC8gb250b3VjaGNhbmNlbCBvbiB0aGUgcmVzcG9uZGVyIHdoZW4gYXBwcm9wcmlhdGUuXG5cblx0dGFnIGRyYWdnYWJsZVxuXHRcdCMgY2FsbGVkIHdoZW4gYSB0b3VjaCBzdGFydHNcblx0XHRkZWYgb250b3VjaHN0YXJ0IHRvdWNoXG5cdFx0XHRmbGFnICdkcmFnZ2luZydcblx0XHRcdHNlbGZcblx0XHRcblx0XHQjIGNhbGxlZCB3aGVuIHRvdWNoIG1vdmVzIC0gc2FtZSB0b3VjaCBvYmplY3Rcblx0XHRkZWYgb250b3VjaG1vdmUgdG91Y2hcblx0XHRcdCMgbW92ZSB0aGUgbm9kZSB3aXRoIHRvdWNoXG5cdFx0XHRjc3MgdG9wOiB0b3VjaC5keSwgbGVmdDogdG91Y2guZHhcblx0XHRcblx0XHQjIGNhbGxlZCB3aGVuIHRvdWNoIGVuZHNcblx0XHRkZWYgb250b3VjaGVuZCB0b3VjaFxuXHRcdFx0dW5mbGFnICdkcmFnZ2luZydcblxuQGluYW1lIHRvdWNoXG4jIyNcbmNsYXNzIEltYmEuVG91Y2hcblx0c2VsZi5MYXN0VGltZXN0YW1wID0gMFxuXHRzZWxmLlRhcFRpbWVvdXQgPSA1MFxuXG5cdCMgdmFyIGxhc3ROYXRpdmVUb3VjaFRpbWVvdXQgPSA1MFxuXG5cdHZhciB0b3VjaGVzID0gW11cblx0dmFyIGNvdW50ID0gMFxuXHR2YXIgaWRlbnRpZmllcnMgPSB7fVxuXG5cdGRlZiBzZWxmLmNvdW50XG5cdFx0Y291bnRcblxuXHRkZWYgc2VsZi5sb29rdXAgaXRlbVxuXHRcdHJldHVybiBpdGVtIGFuZCAoaXRlbTpfX3RvdWNoX18gb3IgaWRlbnRpZmllcnNbaXRlbTppZGVudGlmaWVyXSlcblxuXHRkZWYgc2VsZi5yZWxlYXNlIGl0ZW0sdG91Y2hcblx0XHRkZWxldGUgaWRlbnRpZmllcnNbaXRlbTppZGVudGlmaWVyXVxuXHRcdGRlbGV0ZSBpdGVtOl9fdG91Y2hfX1xuXHRcdHJldHVyblxuXG5cdGRlZiBzZWxmLm9udG91Y2hzdGFydCBlXG5cdFx0Zm9yIHQgaW4gZTpjaGFuZ2VkVG91Y2hlc1xuXHRcdFx0Y29udGludWUgaWYgbG9va3VwKHQpXG5cdFx0XHR2YXIgdG91Y2ggPSBpZGVudGlmaWVyc1t0OmlkZW50aWZpZXJdID0gc2VsZi5uZXcoZSkgIyAoZSlcblx0XHRcdHQ6X190b3VjaF9fID0gdG91Y2hcblx0XHRcdHRvdWNoZXMucHVzaCh0b3VjaClcblx0XHRcdGNvdW50Kytcblx0XHRcdHRvdWNoLnRvdWNoc3RhcnQoZSx0KVxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5vbnRvdWNobW92ZSBlXG5cdFx0Zm9yIHQgaW4gZTpjaGFuZ2VkVG91Y2hlc1xuXHRcdFx0aWYgdmFyIHRvdWNoID0gbG9va3VwKHQpXG5cdFx0XHRcdHRvdWNoLnRvdWNobW92ZShlLHQpXG5cblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub250b3VjaGVuZCBlXG5cdFx0Zm9yIHQgaW4gZTpjaGFuZ2VkVG91Y2hlc1xuXHRcdFx0aWYgdmFyIHRvdWNoID0gbG9va3VwKHQpXG5cdFx0XHRcdHRvdWNoLnRvdWNoZW5kKGUsdClcblx0XHRcdFx0cmVsZWFzZSh0LHRvdWNoKVxuXHRcdFx0XHRjb3VudC0tXG5cblx0XHQjIGUucHJldmVudERlZmF1bHRcblx0XHQjIG5vdCBhbHdheXMgc3VwcG9ydGVkIVxuXHRcdCMgdG91Y2hlcyA9IHRvdWNoZXMuZmlsdGVyKHx8KVxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5vbnRvdWNoY2FuY2VsIGVcblx0XHRmb3IgdCBpbiBlOmNoYW5nZWRUb3VjaGVzXG5cdFx0XHRpZiB2YXIgdG91Y2ggPSBsb29rdXAodClcblx0XHRcdFx0dG91Y2gudG91Y2hjYW5jZWwoZSx0KVxuXHRcdFx0XHRyZWxlYXNlKHQsdG91Y2gpXG5cdFx0XHRcdGNvdW50LS1cblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub25tb3VzZWRvd24gZVxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5vbm1vdXNlbW92ZSBlXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9ubW91c2V1cCBlXG5cdFx0c2VsZlxuXG5cblx0cHJvcCBwaGFzZVxuXHRwcm9wIGFjdGl2ZVxuXHRwcm9wIGV2ZW50XG5cdHByb3AgcG9pbnRlclxuXHRwcm9wIHRhcmdldFxuXHRwcm9wIGhhbmRsZXJcblx0cHJvcCB1cGRhdGVzXG5cdHByb3Agc3VwcHJlc3Ncblx0cHJvcCBkYXRhXG5cdHByb3AgYnViYmxlIGNoYWluYWJsZTogeWVzXG5cdHByb3AgdGltZXN0YW1wXG5cblx0cHJvcCBnZXN0dXJlc1xuXG5cdCMjI1xuXHRAaW50ZXJuYWxcblx0QGNvbnN0cnVjdG9yXG5cdCMjI1xuXHRkZWYgaW5pdGlhbGl6ZSBldmVudCwgcG9pbnRlclxuXHRcdCMgQG5hdGl2ZSAgPSBmYWxzZVxuXHRcdHNlbGYuZXZlbnQgPSBldmVudFxuXHRcdGRhdGEgPSB7fVxuXHRcdGFjdGl2ZSA9IHllc1xuXHRcdEBidXR0b24gPSBldmVudCBhbmQgZXZlbnQ6YnV0dG9uIG9yIDBcblx0XHRAc3VwcHJlc3MgPSBubyAjIGRlcHJlY2F0ZWRcblx0XHRAY2FwdHVyZWQgPSBub1xuXHRcdGJ1YmJsZSA9IG5vXG5cdFx0cG9pbnRlciA9IHBvaW50ZXJcblx0XHR1cGRhdGVzID0gMFxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIGNhcHR1cmVcblx0XHRAY2FwdHVyZWQgPSB5ZXNcblx0XHRAZXZlbnQgYW5kIEBldmVudC5zdG9wUHJvcGFnYXRpb25cblx0XHR1bmxlc3MgQHNlbGJsb2NrZXJcblx0XHRcdEBzZWxibG9ja2VyID0gZG8gfGV8IGUucHJldmVudERlZmF1bHRcblx0XHRcdEltYmEuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc2VsZWN0c3RhcnQnLEBzZWxibG9ja2VyLHllcylcblx0XHRzZWxmXG5cblx0ZGVmIGlzQ2FwdHVyZWRcblx0XHQhIUBjYXB0dXJlZFxuXG5cdCMjI1xuXHRFeHRlbmQgdGhlIHRvdWNoIHdpdGggYSBwbHVnaW4gLyBnZXN0dXJlLiBcblx0QWxsIGV2ZW50cyAodG91Y2hzdGFydCxtb3ZlIGV0YykgZm9yIHRoZSB0b3VjaFxuXHR3aWxsIGJlIHRyaWdnZXJlZCBvbiB0aGUgcGx1Z2lucyBpbiB0aGUgb3JkZXIgdGhleVxuXHRhcmUgYWRkZWQuXG5cdCMjI1xuXHRkZWYgZXh0ZW5kIHBsdWdpblxuXHRcdCMgY29uc29sZS5sb2cgXCJhZGRlZCBnZXN0dXJlISEhXCJcblx0XHRAZ2VzdHVyZXMgfHw9IFtdXG5cdFx0QGdlc3R1cmVzLnB1c2gocGx1Z2luKVxuXHRcdHNlbGZcblxuXHQjIyNcblx0UmVkaXJlY3QgdG91Y2ggdG8gc3BlY2lmaWVkIHRhcmdldC4gb250b3VjaHN0YXJ0IHdpbGwgYWx3YXlzIGJlXG5cdGNhbGxlZCBvbiB0aGUgbmV3IHRhcmdldC5cblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHJlZGlyZWN0IHRhcmdldFxuXHRcdEByZWRpcmVjdCA9IHRhcmdldFxuXHRcdHNlbGZcblxuXHQjIyNcblx0U3VwcHJlc3MgdGhlIGRlZmF1bHQgYmVoYXZpb3VyLiBXaWxsIGNhbGwgcHJldmVudERlZmF1bHQgZm9yXG5cdGFsbCBuYXRpdmUgZXZlbnRzIHRoYXQgYXJlIHBhcnQgb2YgdGhlIHRvdWNoLlxuXHQjIyNcblx0ZGVmIHN1cHByZXNzXG5cdFx0IyBjb2xsaXNpb24gd2l0aCB0aGUgc3VwcHJlc3MgcHJvcGVydHlcblx0XHRAYWN0aXZlID0gbm9cblx0XHRcblx0XHRzZWxmXG5cblx0ZGVmIHN1cHByZXNzPSB2YWx1ZVxuXHRcdGNvbnNvbGUud2FybiAnSW1iYS5Ub3VjaCNzdXBwcmVzcz0gaXMgZGVwcmVjYXRlZCdcblx0XHRAc3VwcmVzcyA9IHZhbHVlXG5cdFx0c2VsZlxuXG5cdGRlZiB0b3VjaHN0YXJ0IGUsdFxuXHRcdEBldmVudCA9IGVcblx0XHRAdG91Y2ggPSB0XG5cdFx0QGJ1dHRvbiA9IDBcblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0YmVnYW5cblx0XHR1cGRhdGVcblx0XHRlLnByZXZlbnREZWZhdWx0IGlmIGUgYW5kIGlzQ2FwdHVyZWRcblx0XHRzZWxmXG5cblx0ZGVmIHRvdWNobW92ZSBlLHRcblx0XHRAZXZlbnQgPSBlXG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdHVwZGF0ZVxuXHRcdGUucHJldmVudERlZmF1bHQgaWYgZSBhbmQgaXNDYXB0dXJlZFxuXHRcdHNlbGZcblxuXHRkZWYgdG91Y2hlbmQgZSx0XG5cdFx0QGV2ZW50ID0gZVxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRlbmRlZFxuXG5cdFx0SW1iYS5Ub3VjaC5MYXN0VGltZXN0YW1wID0gZTp0aW1lU3RhbXBcblxuXHRcdGlmIEBtYXhkciA8IDIwXG5cdFx0XHR2YXIgdGFwID0gSW1iYS5FdmVudC5uZXcoZSlcblx0XHRcdHRhcC50eXBlID0gJ3RhcCdcblx0XHRcdHRhcC5wcm9jZXNzXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0IGlmIHRhcC5AcmVzcG9uZGVyXHRcblxuXHRcdGlmIGUgYW5kIGlzQ2FwdHVyZWRcblx0XHRcdGUucHJldmVudERlZmF1bHRcblxuXHRcdHNlbGZcblxuXHRkZWYgdG91Y2hjYW5jZWwgZSx0XG5cdFx0Y2FuY2VsXG5cblx0ZGVmIG1vdXNlZG93biBlLHRcblx0XHRAZXZlbnQgPSBlXG5cdFx0QGJ1dHRvbiA9IGU6YnV0dG9uXG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdGJlZ2FuXG5cdFx0dXBkYXRlXG5cdFx0QG1vdXNlbW92ZSA9ICh8ZXwgbW91c2Vtb3ZlKGUsZSkgKVxuXHRcdEltYmEuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJyxAbW91c2Vtb3ZlLHllcylcblx0XHRzZWxmXG5cblx0ZGVmIG1vdXNlbW92ZSBlLHRcblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0QGV2ZW50ID0gZVxuXHRcdGUucHJldmVudERlZmF1bHQgaWYgaXNDYXB0dXJlZFxuXHRcdHVwZGF0ZVxuXHRcdG1vdmVcblx0XHRzZWxmXG5cblx0ZGVmIG1vdXNldXAgZSx0XG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdGVuZGVkXG5cdFx0c2VsZlxuXG5cdGRlZiBpZGxlXG5cdFx0dXBkYXRlXG5cblx0ZGVmIGJlZ2FuXG5cdFx0QHRpbWVzdGFtcCA9IERhdGUubm93XG5cdFx0QG1heGRyID0gQGRyID0gMFxuXHRcdEB4MCA9IEB4XG5cdFx0QHkwID0gQHlcblxuXHRcdHZhciBkb20gPSBldmVudDp0YXJnZXRcblx0XHR2YXIgbm9kZSA9IG51bGxcblxuXHRcdEBzb3VyY2VUYXJnZXQgPSBkb20gYW5kIHRhZyhkb20pXG5cblx0XHR3aGlsZSBkb21cblx0XHRcdG5vZGUgPSB0YWcoZG9tKVxuXHRcdFx0aWYgbm9kZSAmJiBub2RlOm9udG91Y2hzdGFydFxuXHRcdFx0XHRAYnViYmxlID0gbm9cblx0XHRcdFx0dGFyZ2V0ID0gbm9kZVxuXHRcdFx0XHR0YXJnZXQub250b3VjaHN0YXJ0KHNlbGYpXG5cdFx0XHRcdGJyZWFrIHVubGVzcyBAYnViYmxlXG5cdFx0XHRkb20gPSBkb206cGFyZW50Tm9kZVxuXG5cdFx0QHVwZGF0ZXMrK1xuXHRcdHNlbGZcblxuXHRkZWYgdXBkYXRlXG5cdFx0cmV0dXJuIHNlbGYgaWYgIUBhY3RpdmUgb3IgQGNhbmNlbGxlZFxuXG5cdFx0dmFyIGRyID0gTWF0aC5zcXJ0KGR4KmR4ICsgZHkqZHkpXG5cdFx0QG1heGRyID0gZHIgaWYgZHIgPiBAZHJcblx0XHRAZHIgPSBkclxuXG5cdFx0IyBjYXRjaGluZyBhIHRvdWNoLXJlZGlyZWN0PyE/XG5cdFx0aWYgQHJlZGlyZWN0XG5cdFx0XHRpZiBAdGFyZ2V0IGFuZCBAdGFyZ2V0Om9udG91Y2hjYW5jZWxcblx0XHRcdFx0QHRhcmdldC5vbnRvdWNoY2FuY2VsKHNlbGYpXG5cdFx0XHR0YXJnZXQgPSBAcmVkaXJlY3Rcblx0XHRcdEByZWRpcmVjdCA9IG51bGxcblx0XHRcdHRhcmdldC5vbnRvdWNoc3RhcnQoc2VsZikgaWYgdGFyZ2V0Om9udG91Y2hzdGFydFxuXHRcdFx0cmV0dXJuIHVwZGF0ZSBpZiBAcmVkaXJlY3QgIyBwb3NzaWJseSByZWRpcmVjdGluZyBhZ2FpblxuXG5cblx0XHRAdXBkYXRlcysrXG5cdFx0aWYgQGdlc3R1cmVzXG5cdFx0XHRnLm9udG91Y2h1cGRhdGUoc2VsZikgZm9yIGcgaW4gQGdlc3R1cmVzXG5cblx0XHR0YXJnZXQ/Lm9udG91Y2h1cGRhdGUoc2VsZilcblx0XHR1cGRhdGUgaWYgQHJlZGlyZWN0XG5cdFx0c2VsZlxuXG5cdGRlZiBtb3ZlXG5cdFx0cmV0dXJuIHNlbGYgaWYgIUBhY3RpdmUgb3IgQGNhbmNlbGxlZFxuXG5cdFx0aWYgQGdlc3R1cmVzXG5cdFx0XHRmb3IgZyBpbiBAZ2VzdHVyZXNcblx0XHRcdFx0Zy5vbnRvdWNobW92ZShzZWxmLEBldmVudCkgaWYgZzpvbnRvdWNobW92ZVxuXG5cdFx0dGFyZ2V0Py5vbnRvdWNobW92ZShzZWxmLEBldmVudClcblx0XHRzZWxmXG5cblx0ZGVmIGVuZGVkXG5cdFx0cmV0dXJuIHNlbGYgaWYgIUBhY3RpdmUgb3IgQGNhbmNlbGxlZFxuXG5cdFx0QHVwZGF0ZXMrK1xuXG5cdFx0aWYgQGdlc3R1cmVzXG5cdFx0XHRnLm9udG91Y2hlbmQoc2VsZikgZm9yIGcgaW4gQGdlc3R1cmVzXG5cblx0XHR0YXJnZXQ/Lm9udG91Y2hlbmQoc2VsZilcblx0XHRjbGVhbnVwX1xuXHRcdHNlbGZcblxuXHRkZWYgY2FuY2VsXG5cdFx0dW5sZXNzIEBjYW5jZWxsZWRcblx0XHRcdEBjYW5jZWxsZWQgPSB5ZXNcblx0XHRcdGNhbmNlbGxlZFxuXHRcdFx0Y2xlYW51cF9cblx0XHRzZWxmXG5cblx0ZGVmIGNhbmNlbGxlZFxuXHRcdHJldHVybiBzZWxmIHVubGVzcyBAYWN0aXZlXG5cblx0XHRAY2FuY2VsbGVkID0geWVzXG5cdFx0QHVwZGF0ZXMrK1xuXG5cdFx0aWYgQGdlc3R1cmVzXG5cdFx0XHRmb3IgZyBpbiBAZ2VzdHVyZXNcblx0XHRcdFx0Zy5vbnRvdWNoY2FuY2VsKHNlbGYpIGlmIGc6b250b3VjaGNhbmNlbFxuXG5cdFx0dGFyZ2V0Py5vbnRvdWNoY2FuY2VsKHNlbGYpXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgY2xlYW51cF9cblx0XHRpZiBAbW91c2Vtb3ZlXG5cdFx0XHRJbWJhLmRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsQG1vdXNlbW92ZSx5ZXMpXG5cdFx0XHRAbW91c2Vtb3ZlID0gbnVsbFxuXHRcdFxuXHRcdGlmIEBzZWxibG9ja2VyXG5cdFx0XHRJbWJhLmRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3NlbGVjdHN0YXJ0JyxAc2VsYmxvY2tlcix5ZXMpXG5cdFx0XHRAc2VsYmxvY2tlciA9IG51bGxcblx0XHRcblx0XHRzZWxmXG5cblx0IyMjXG5cdFRoZSBhYnNvbHV0ZSBkaXN0YW5jZSB0aGUgdG91Y2ggaGFzIG1vdmVkIGZyb20gc3RhcnRpbmcgcG9zaXRpb24gXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiBkciBkbyBAZHJcblxuXHQjIyNcblx0VGhlIGRpc3RhbmNlIHRoZSB0b3VjaCBoYXMgbW92ZWQgaG9yaXpvbnRhbGx5XG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiBkeCBkbyBAeCAtIEB4MFxuXG5cdCMjI1xuXHRUaGUgZGlzdGFuY2UgdGhlIHRvdWNoIGhhcyBtb3ZlZCB2ZXJ0aWNhbGx5XG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiBkeSBkbyBAeSAtIEB5MFxuXG5cdCMjI1xuXHRJbml0aWFsIGhvcml6b250YWwgcG9zaXRpb24gb2YgdG91Y2hcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHgwIGRvIEB4MFxuXG5cdCMjI1xuXHRJbml0aWFsIHZlcnRpY2FsIHBvc2l0aW9uIG9mIHRvdWNoXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB5MCBkbyBAeTBcblxuXHQjIyNcblx0SG9yaXpvbnRhbCBwb3NpdGlvbiBvZiB0b3VjaFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgeCBkbyBAeFxuXG5cdCMjI1xuXHRWZXJ0aWNhbCBwb3NpdGlvbiBvZiB0b3VjaFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgeSBkbyBAeVxuXG5cdCMjI1xuXHRIb3Jpem9udGFsIHBvc2l0aW9uIG9mIHRvdWNoIHJlbGF0aXZlIHRvIHRhcmdldFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgdHggZG9cblx0XHRAdGFyZ2V0Qm94IHx8PSBAdGFyZ2V0LmRvbS5nZXRCb3VuZGluZ0NsaWVudFJlY3Rcblx0XHRAeCAtIEB0YXJnZXRCb3g6bGVmdFxuXG5cdCMjI1xuXHRWZXJ0aWNhbCBwb3NpdGlvbiBvZiB0b3VjaCByZWxhdGl2ZSB0byB0YXJnZXRcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHR5XG5cdFx0QHRhcmdldEJveCB8fD0gQHRhcmdldC5kb20uZ2V0Qm91bmRpbmdDbGllbnRSZWN0XG5cdFx0QHkgLSBAdGFyZ2V0Qm94OnRvcFxuXG5cdCMjI1xuXHRCdXR0b24gcHJlc3NlZCBpbiB0aGlzIHRvdWNoLiBOYXRpdmUgdG91Y2hlcyBkZWZhdWx0cyB0byBsZWZ0LWNsaWNrICgwKVxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgYnV0dG9uIGRvIEBidXR0b24gIyBAcG9pbnRlciA/IEBwb2ludGVyLmJ1dHRvbiA6IDBcblxuXHRkZWYgc291cmNlVGFyZ2V0XG5cdFx0QHNvdXJjZVRhcmdldFxuXG5cdGRlZiBlbGFwc2VkXG5cdFx0RGF0ZS5ub3cgLSBAdGltZXN0YW1wXG5cblxuY2xhc3MgSW1iYS5Ub3VjaEdlc3R1cmVcblxuXHRwcm9wIGFjdGl2ZSBkZWZhdWx0OiBub1xuXG5cdGRlZiBvbnRvdWNoc3RhcnQgZVxuXHRcdHNlbGZcblxuXHRkZWYgb250b3VjaHVwZGF0ZSBlXG5cdFx0c2VsZlxuXG5cdGRlZiBvbnRvdWNoZW5kIGVcblx0XHRzZWxmXG5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS90b3VjaC5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG52YXIga2V5Q29kZXMgPSB7XG5cdGVzYzogMjcsXG5cdHRhYjogOSxcblx0ZW50ZXI6IDEzLFxuXHRzcGFjZTogMzIsXG5cdHVwOiAzOCxcblx0ZG93bjogNDBcbn1cblxudmFyIGVsID0gSW1iYS5UYWc6cHJvdG90eXBlXG5kZWYgZWwuc3RvcE1vZGlmaWVyIGUgZG8gZS5zdG9wIHx8IHRydWVcbmRlZiBlbC5wcmV2ZW50TW9kaWZpZXIgZSBkbyBlLnByZXZlbnQgfHwgdHJ1ZVxuZGVmIGVsLnNpbGVuY2VNb2RpZmllciBlIGRvIGUuc2lsZW5jZSB8fCB0cnVlXG5kZWYgZWwuYnViYmxlTW9kaWZpZXIgZSBkbyBlLmJ1YmJsZSh5ZXMpIHx8IHRydWVcbmRlZiBlbC5jdHJsTW9kaWZpZXIgZSBkbyBlLmV2ZW50OmN0cmxLZXkgPT0gdHJ1ZVxuZGVmIGVsLmFsdE1vZGlmaWVyIGUgZG8gZS5ldmVudDphbHRLZXkgPT0gdHJ1ZVxuZGVmIGVsLnNoaWZ0TW9kaWZpZXIgZSBkbyBlLmV2ZW50OnNoaWZ0S2V5ID09IHRydWVcbmRlZiBlbC5tZXRhTW9kaWZpZXIgZSBkbyBlLmV2ZW50Om1ldGFLZXkgPT0gdHJ1ZVxuZGVmIGVsLmtleU1vZGlmaWVyIGtleSwgZSBkbyBlLmtleUNvZGUgPyAoZS5rZXlDb2RlID09IGtleSkgOiB0cnVlXG5kZWYgZWwuZGVsTW9kaWZpZXIgZSBkbyBlLmtleUNvZGUgPyAoZS5rZXlDb2RlID09IDggb3IgZS5rZXlDb2RlID09IDQ2KSA6IHRydWVcbmRlZiBlbC5zZWxmTW9kaWZpZXIgZSBkbyBlLmV2ZW50OnRhcmdldCA9PSBAZG9tXG5kZWYgZWwubGVmdE1vZGlmaWVyIGUgZG8gZS5idXR0b24gIT0gdW5kZWZpbmVkID8gKGUuYnV0dG9uID09PSAwKSA6IGVsLmtleU1vZGlmaWVyKDM3LGUpXG5kZWYgZWwucmlnaHRNb2RpZmllciBlIGRvIGUuYnV0dG9uICE9IHVuZGVmaW5lZCA/IChlLmJ1dHRvbiA9PT0gMikgOiBlbC5rZXlNb2RpZmllcigzOSxlKVxuZGVmIGVsLm1pZGRsZU1vZGlmaWVyIGUgZG8gZS5idXR0b24gIT0gdW5kZWZpbmVkID8gKGUuYnV0dG9uID09PSAxKSA6IHRydWVcblx0XG5kZWYgZWwuZ2V0SGFuZGxlciBzdHIsIGV2ZW50XG5cdHJldHVybiBzZWxmIGlmIHNlbGZbc3RyXVxuXG4jIyNcbkltYmEgaGFuZGxlcyBhbGwgZXZlbnRzIGluIHRoZSBkb20gdGhyb3VnaCBhIHNpbmdsZSBtYW5hZ2VyLFxubGlzdGVuaW5nIGF0IHRoZSByb290IG9mIHlvdXIgZG9jdW1lbnQuIElmIEltYmEgZmluZHMgYSB0YWdcbnRoYXQgbGlzdGVucyB0byBhIGNlcnRhaW4gZXZlbnQsIHRoZSBldmVudCB3aWxsIGJlIHdyYXBwZWQgXG5pbiBhbiBgSW1iYS5FdmVudGAsIHdoaWNoIG5vcm1hbGl6ZXMgc29tZSBvZiB0aGUgcXVpcmtzIGFuZCBcbmJyb3dzZXIgZGlmZmVyZW5jZXMuXG5cbkBpbmFtZSBldmVudFxuIyMjXG5jbGFzcyBJbWJhLkV2ZW50XG5cblx0IyMjIHJlZmVyZW5jZSB0byB0aGUgbmF0aXZlIGV2ZW50ICMjI1xuXHRwcm9wIGV2ZW50XG5cblx0IyMjIHJlZmVyZW5jZSB0byB0aGUgbmF0aXZlIGV2ZW50ICMjI1xuXHRwcm9wIHByZWZpeFxuXHRcblx0cHJvcCBzb3VyY2VcblxuXHRwcm9wIGRhdGFcblxuXHRwcm9wIHJlc3BvbmRlclxuXG5cdGRlZiBzZWxmLndyYXAgZVxuXHRcdHNlbGYubmV3KGUpXG5cdFxuXHRkZWYgaW5pdGlhbGl6ZSBlXG5cdFx0ZXZlbnQgPSBlXG5cdFx0QGJ1YmJsZSA9IHllc1xuXG5cdGRlZiB0eXBlPSB0eXBlXG5cdFx0QHR5cGUgPSB0eXBlXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRAcmV0dXJuIHtTdHJpbmd9IFRoZSBuYW1lIG9mIHRoZSBldmVudCAoY2FzZS1pbnNlbnNpdGl2ZSlcblx0IyMjXG5cdGRlZiB0eXBlIGRvIEB0eXBlIHx8IGV2ZW50OnR5cGVcblx0ZGVmIG5hdGl2ZSBkbyBAZXZlbnRcblxuXHRkZWYgbmFtZVxuXHRcdEBuYW1lIHx8PSB0eXBlLnRvTG93ZXJDYXNlLnJlcGxhY2UoL1xcOi9nLCcnKVxuXG5cdCMgbWltYyBnZXRzZXRcblx0ZGVmIGJ1YmJsZSB2XG5cdFx0aWYgdiAhPSB1bmRlZmluZWRcblx0XHRcdHNlbGYuYnViYmxlID0gdlxuXHRcdFx0cmV0dXJuIHNlbGZcblx0XHRyZXR1cm4gQGJ1YmJsZVxuXG5cdGRlZiBidWJibGU9IHZcblx0XHRAYnViYmxlID0gdlxuXHRcdHJldHVybiBzZWxmXG5cblx0IyMjXG5cdFByZXZlbnRzIGZ1cnRoZXIgcHJvcGFnYXRpb24gb2YgdGhlIGN1cnJlbnQgZXZlbnQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc3RvcFxuXHRcdGJ1YmJsZSA9IG5vXG5cdFx0c2VsZlxuXG5cdGRlZiBzdG9wUHJvcGFnYXRpb24gZG8gc3RvcFxuXHRkZWYgaGFsdCBkbyBzdG9wXG5cblx0IyBtaWdyYXRlIGZyb20gY2FuY2VsIHRvIHByZXZlbnRcblx0ZGVmIHByZXZlbnRcblx0XHRpZiBldmVudDpwcmV2ZW50RGVmYXVsdFxuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHRcblx0XHRlbHNlXG5cdFx0XHRldmVudDpkZWZhdWx0UHJldmVudGVkID0geWVzXG5cdFx0c2VsZjpkZWZhdWx0UHJldmVudGVkID0geWVzXG5cdFx0c2VsZlxuXG5cdGRlZiBwcmV2ZW50RGVmYXVsdFxuXHRcdGNvbnNvbGUud2FybiBcIkV2ZW50I3ByZXZlbnREZWZhdWx0IGlzIGRlcHJlY2F0ZWQgLSB1c2UgRXZlbnQjcHJldmVudFwiXG5cdFx0cHJldmVudFxuXG5cdCMjI1xuXHRJbmRpY2F0ZXMgd2hldGhlciBvciBub3QgZXZlbnQuY2FuY2VsIGhhcyBiZWVuIGNhbGxlZC5cblxuXHRAcmV0dXJuIHtCb29sZWFufVxuXHQjIyNcblx0ZGVmIGlzUHJldmVudGVkXG5cdFx0ZXZlbnQgYW5kIGV2ZW50OmRlZmF1bHRQcmV2ZW50ZWQgb3IgQGNhbmNlbFxuXG5cdCMjI1xuXHRDYW5jZWwgdGhlIGV2ZW50IChpZiBjYW5jZWxhYmxlKS4gSW4gdGhlIGNhc2Ugb2YgbmF0aXZlIGV2ZW50cyBpdFxuXHR3aWxsIGNhbGwgYHByZXZlbnREZWZhdWx0YCBvbiB0aGUgd3JhcHBlZCBldmVudCBvYmplY3QuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgY2FuY2VsXG5cdFx0Y29uc29sZS53YXJuIFwiRXZlbnQjY2FuY2VsIGlzIGRlcHJlY2F0ZWQgLSB1c2UgRXZlbnQjcHJldmVudFwiXG5cdFx0cHJldmVudFxuXG5cdGRlZiBzaWxlbmNlXG5cdFx0QHNpbGVuY2VkID0geWVzXG5cdFx0c2VsZlxuXG5cdGRlZiBpc1NpbGVuY2VkXG5cdFx0ISFAc2lsZW5jZWRcblxuXHQjIyNcblx0QSByZWZlcmVuY2UgdG8gdGhlIGluaXRpYWwgdGFyZ2V0IG9mIHRoZSBldmVudC5cblx0IyMjXG5cdGRlZiB0YXJnZXRcblx0XHR0YWcoZXZlbnQ6X3RhcmdldCBvciBldmVudDp0YXJnZXQpXG5cblx0IyMjXG5cdEEgcmVmZXJlbmNlIHRvIHRoZSBvYmplY3QgcmVzcG9uZGluZyB0byB0aGUgZXZlbnQuXG5cdCMjI1xuXHRkZWYgcmVzcG9uZGVyXG5cdFx0QHJlc3BvbmRlclxuXG5cdCMjI1xuXHRSZWRpcmVjdCB0aGUgZXZlbnQgdG8gbmV3IHRhcmdldFxuXHQjIyNcblx0ZGVmIHJlZGlyZWN0IG5vZGVcblx0XHRAcmVkaXJlY3QgPSBub2RlXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgcHJvY2Vzc0hhbmRsZXJzIG5vZGUsIGhhbmRsZXJzXG5cdFx0bGV0IGkgPSAxXG5cdFx0bGV0IGwgPSBoYW5kbGVyczpsZW5ndGhcblx0XHRsZXQgYnViYmxlID0gQGJ1YmJsZVxuXHRcdGxldCBzdGF0ZSA9IGhhbmRsZXJzOnN0YXRlIHx8PSB7fVxuXHRcdGxldCByZXN1bHQgXG5cdFx0XG5cdFx0aWYgYnViYmxlXG5cdFx0XHRAYnViYmxlID0gMVxuXG5cdFx0d2hpbGUgaSA8IGxcblx0XHRcdGxldCBpc01vZCA9IGZhbHNlXG5cdFx0XHRsZXQgaGFuZGxlciA9IGhhbmRsZXJzW2krK11cblx0XHRcdGxldCBwYXJhbXMgID0gbnVsbFxuXHRcdFx0bGV0IGNvbnRleHQgPSBub2RlXG5cdFx0XHRcblx0XHRcdGlmIGhhbmRsZXIgaXNhIEFycmF5XG5cdFx0XHRcdHBhcmFtcyA9IGhhbmRsZXIuc2xpY2UoMSlcblx0XHRcdFx0aGFuZGxlciA9IGhhbmRsZXJbMF1cblx0XHRcdFxuXHRcdFx0aWYgdHlwZW9mIGhhbmRsZXIgPT0gJ3N0cmluZydcblx0XHRcdFx0aWYga2V5Q29kZXNbaGFuZGxlcl1cblx0XHRcdFx0XHRwYXJhbXMgPSBba2V5Q29kZXNbaGFuZGxlcl1dXG5cdFx0XHRcdFx0aGFuZGxlciA9ICdrZXknXG5cdFx0XHRcdFx0XG5cdFx0XHRcdGxldCBtb2QgPSBoYW5kbGVyICsgJ01vZGlmaWVyJ1xuXG5cdFx0XHRcdGlmIG5vZGVbbW9kXVxuXHRcdFx0XHRcdGlzTW9kID0geWVzXG5cdFx0XHRcdFx0cGFyYW1zID0gKHBhcmFtcyBvciBbXSkuY29uY2F0KFtzZWxmLHN0YXRlXSlcblx0XHRcdFx0XHRoYW5kbGVyID0gbm9kZVttb2RdXG5cdFx0XHRcblx0XHRcdCMgaWYgaXQgaXMgc3RpbGwgYSBzdHJpbmcgLSBjYWxsIGdldEhhbmRsZXIgb25cblx0XHRcdCMgYW5jZXN0b3Igb2Ygbm9kZSB0byBzZWUgaWYgd2UgZ2V0IGEgaGFuZGxlciBmb3IgdGhpcyBuYW1lXG5cdFx0XHRpZiB0eXBlb2YgaGFuZGxlciA9PSAnc3RyaW5nJ1xuXHRcdFx0XHRsZXQgZWwgPSBub2RlXG5cdFx0XHRcdGxldCBmbiA9IG51bGxcblx0XHRcdFx0bGV0IGN0eCA9IHN0YXRlOmNvbnRleHRcblx0XG5cdFx0XHRcdGlmIGN0eFxuXHRcdFx0XHRcdGlmIGN0eDpnZXRIYW5kbGVyIGlzYSBGdW5jdGlvblxuXHRcdFx0XHRcdFx0Y3R4ID0gY3R4LmdldEhhbmRsZXIoaGFuZGxlcixzZWxmKVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGlmIGN0eFtoYW5kbGVyXSBpc2EgRnVuY3Rpb25cblx0XHRcdFx0XHRcdGhhbmRsZXIgPSBmbiA9IGN0eFtoYW5kbGVyXVxuXHRcdFx0XHRcdFx0Y29udGV4dCA9IGN0eFxuXG5cdFx0XHRcdHVubGVzcyBmblxuXHRcdFx0XHRcdGNvbnNvbGUud2FybiBcImV2ZW50IHt0eXBlfTogY291bGQgbm90IGZpbmQgJ3toYW5kbGVyfScgaW4gY29udGV4dFwiLGN0eFxuXG5cdFx0XHRcdCMgd2hpbGUgZWwgYW5kICghZm4gb3IgIShmbiBpc2EgRnVuY3Rpb24pKVxuXHRcdFx0XHQjIFx0aWYgZm4gPSBlbC5nZXRIYW5kbGVyKGhhbmRsZXIpXG5cdFx0XHRcdCMgXHRcdGlmIGZuW2hhbmRsZXJdIGlzYSBGdW5jdGlvblxuXHRcdFx0XHQjIFx0XHRcdGhhbmRsZXIgPSBmbltoYW5kbGVyXVxuXHRcdFx0XHQjIFx0XHRcdGNvbnRleHQgPSBmblxuXHRcdFx0XHQjIFx0XHRlbGlmIGZuIGlzYSBGdW5jdGlvblxuXHRcdFx0XHQjIFx0XHRcdGhhbmRsZXIgPSBmblxuXHRcdFx0XHQjIFx0XHRcdGNvbnRleHQgPSBlbFxuXHRcdFx0XHQjIFx0ZWxzZVxuXHRcdFx0XHQjIFx0XHRlbCA9IGVsLnBhcmVudFxuXHRcdFx0XHRcdFxuXHRcdFx0aWYgaGFuZGxlciBpc2EgRnVuY3Rpb25cblx0XHRcdFx0IyB3aGF0IGlmIHdlIGFjdHVhbGx5IGNhbGwgc3RvcCBpbnNpZGUgZnVuY3Rpb24/XG5cdFx0XHRcdCMgZG8gd2Ugc3RpbGwgd2FudCB0byBjb250aW51ZSB0aGUgY2hhaW4/XG5cdFx0XHRcdGxldCByZXMgPSBoYW5kbGVyLmFwcGx5KGNvbnRleHQscGFyYW1zIG9yIFtzZWxmXSlcblxuXHRcdFx0XHRpZiAhaXNNb2Rcblx0XHRcdFx0XHRAcmVzcG9uZGVyIHx8PSBub2RlXG5cblx0XHRcdFx0aWYgcmVzID09IGZhbHNlXG5cdFx0XHRcdFx0IyBjb25zb2xlLmxvZyBcInJldHVybmVkIGZhbHNlIC0gYnJlYWtpbmdcIlxuXHRcdFx0XHRcdGJyZWFrXG5cblx0XHRcdFx0aWYgcmVzIGFuZCAhQHNpbGVuY2VkIGFuZCByZXM6dGhlbiBpc2EgRnVuY3Rpb25cblx0XHRcdFx0XHRyZXMudGhlbihJbWJhOmNvbW1pdClcblx0XHRcblx0XHQjIGlmIHdlIGhhdmVudCBzdG9wcGVkIG9yIGRlYWx0IHdpdGggYnViYmxlIHdoaWxlIGhhbmRsaW5nXG5cdFx0aWYgQGJ1YmJsZSA9PT0gMVxuXHRcdFx0QGJ1YmJsZSA9IGJ1YmJsZVxuXG5cdFx0cmV0dXJuIG51bGxcblxuXHRkZWYgcHJvY2Vzc1xuXHRcdHZhciBuYW1lID0gc2VsZi5uYW1lXG5cdFx0dmFyIG1ldGggPSBcIm9ue0BwcmVmaXggb3IgJyd9e25hbWV9XCJcblx0XHR2YXIgYXJncyA9IG51bGxcblx0XHR2YXIgZG9tdGFyZ2V0ID0gZXZlbnQ6X3RhcmdldCBvciBldmVudDp0YXJnZXRcdFx0XG5cdFx0dmFyIGRvbW5vZGUgPSBkb210YXJnZXQ6X3Jlc3BvbmRlciBvciBkb210YXJnZXRcblx0XHQjIEB0b2RvIG5lZWQgdG8gc3RvcCBpbmZpbml0ZSByZWRpcmVjdC1ydWxlcyBoZXJlXG5cdFx0dmFyIHJlc3VsdFxuXHRcdHZhciBoYW5kbGVyc1xuXG5cdFx0d2hpbGUgZG9tbm9kZVxuXHRcdFx0QHJlZGlyZWN0ID0gbnVsbFxuXHRcdFx0bGV0IG5vZGUgPSBkb21ub2RlLkBkb20gPyBkb21ub2RlIDogZG9tbm9kZS5AdGFnXG5cblx0XHRcdGlmIG5vZGVcblx0XHRcdFx0aWYgaGFuZGxlcnMgPSBub2RlOl9vbl9cblx0XHRcdFx0XHRmb3IgaGFuZGxlciBpbiBoYW5kbGVycyB3aGVuIGhhbmRsZXJcblx0XHRcdFx0XHRcdGxldCBobmFtZSA9IGhhbmRsZXJbMF1cblx0XHRcdFx0XHRcdGlmIG5hbWUgPT0gaGFuZGxlclswXSBhbmQgYnViYmxlXG5cdFx0XHRcdFx0XHRcdHByb2Nlc3NIYW5kbGVycyhub2RlLGhhbmRsZXIpXG5cdFx0XHRcdFx0YnJlYWsgdW5sZXNzIGJ1YmJsZVxuXG5cdFx0XHRcdGlmIGJ1YmJsZSBhbmQgbm9kZVttZXRoXSBpc2EgRnVuY3Rpb25cblx0XHRcdFx0XHRAcmVzcG9uZGVyIHx8PSBub2RlXG5cdFx0XHRcdFx0QHNpbGVuY2VkID0gbm9cblx0XHRcdFx0XHRyZXN1bHQgPSBhcmdzID8gbm9kZVttZXRoXS5hcHBseShub2RlLGFyZ3MpIDogbm9kZVttZXRoXShzZWxmLGRhdGEpXG5cblx0XHRcdFx0aWYgbm9kZTpvbmV2ZW50XG5cdFx0XHRcdFx0bm9kZS5vbmV2ZW50KHNlbGYpXG5cblx0XHRcdCMgYWRkIG5vZGUubmV4dEV2ZW50UmVzcG9uZGVyIGFzIGEgc2VwYXJhdGUgbWV0aG9kIGhlcmU/XG5cdFx0XHR1bmxlc3MgYnViYmxlIGFuZCBkb21ub2RlID0gKEByZWRpcmVjdCBvciAobm9kZSA/IG5vZGUucGFyZW50IDogZG9tbm9kZTpwYXJlbnROb2RlKSlcblx0XHRcdFx0YnJlYWtcblxuXHRcdHByb2Nlc3NlZFxuXG5cdFx0IyBpZiBhIGhhbmRsZXIgcmV0dXJucyBhIHByb21pc2UsIG5vdGlmeSBzY2hlZHVsZXJzXG5cdFx0IyBhYm91dCB0aGlzIGFmdGVyIHByb21pc2UgaGFzIGZpbmlzaGVkIHByb2Nlc3Npbmdcblx0XHRpZiByZXN1bHQgYW5kIHJlc3VsdDp0aGVuIGlzYSBGdW5jdGlvblxuXHRcdFx0cmVzdWx0LnRoZW4oc2VsZjpwcm9jZXNzZWQuYmluZChzZWxmKSlcblx0XHRyZXR1cm4gc2VsZlxuXG5cblx0ZGVmIHByb2Nlc3NlZFxuXHRcdGlmICFAc2lsZW5jZWQgYW5kIEByZXNwb25kZXJcblx0XHRcdEltYmEuZW1pdChJbWJhLCdldmVudCcsW3NlbGZdKVxuXHRcdFx0SW1iYS5jb21taXQoZXZlbnQpXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRSZXR1cm4gdGhlIHgvbGVmdCBjb29yZGluYXRlIG9mIHRoZSBtb3VzZSAvIHBvaW50ZXIgZm9yIHRoaXMgZXZlbnRcblx0QHJldHVybiB7TnVtYmVyfSB4IGNvb3JkaW5hdGUgb2YgbW91c2UgLyBwb2ludGVyIGZvciBldmVudFxuXHQjIyNcblx0ZGVmIHggZG8gbmF0aXZlOnhcblxuXHQjIyNcblx0UmV0dXJuIHRoZSB5L3RvcCBjb29yZGluYXRlIG9mIHRoZSBtb3VzZSAvIHBvaW50ZXIgZm9yIHRoaXMgZXZlbnRcblx0QHJldHVybiB7TnVtYmVyfSB5IGNvb3JkaW5hdGUgb2YgbW91c2UgLyBwb2ludGVyIGZvciBldmVudFxuXHQjIyNcblx0ZGVmIHkgZG8gbmF0aXZlOnlcblx0XHRcblx0ZGVmIGJ1dHRvbiBkbyBuYXRpdmU6YnV0dG9uXG5cdGRlZiBrZXlDb2RlIGRvIG5hdGl2ZTprZXlDb2RlXG5cdGRlZiBjdHJsIGRvIG5hdGl2ZTpjdHJsS2V5XG5cdGRlZiBhbHQgZG8gbmF0aXZlOmFsdEtleVxuXHRkZWYgc2hpZnQgZG8gbmF0aXZlOnNoaWZ0S2V5XG5cdGRlZiBtZXRhIGRvIG5hdGl2ZTptZXRhS2V5XG5cdGRlZiBrZXkgZG8gbmF0aXZlOmtleVxuXG5cdCMjI1xuXHRSZXR1cm5zIGEgTnVtYmVyIHJlcHJlc2VudGluZyBhIHN5c3RlbSBhbmQgaW1wbGVtZW50YXRpb25cblx0ZGVwZW5kZW50IG51bWVyaWMgY29kZSBpZGVudGlmeWluZyB0aGUgdW5tb2RpZmllZCB2YWx1ZSBvZiB0aGVcblx0cHJlc3NlZCBrZXk7IHRoaXMgaXMgdXN1YWxseSB0aGUgc2FtZSBhcyBrZXlDb2RlLlxuXG5cdEZvciBtb3VzZS1ldmVudHMsIHRoZSByZXR1cm5lZCB2YWx1ZSBpbmRpY2F0ZXMgd2hpY2ggYnV0dG9uIHdhc1xuXHRwcmVzc2VkIG9uIHRoZSBtb3VzZSB0byB0cmlnZ2VyIHRoZSBldmVudC5cblxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgd2hpY2ggZG8gZXZlbnQ6d2hpY2hcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL2V2ZW50LmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5yZXF1aXJlKFwiLi9wb2ludGVyXCIpXG5cbiMjI1xuXG5NYW5hZ2VyIGZvciBsaXN0ZW5pbmcgdG8gYW5kIGRlbGVnYXRpbmcgZXZlbnRzIGluIEltYmEuIEEgc2luZ2xlIGluc3RhbmNlXG5pcyBhbHdheXMgY3JlYXRlZCBieSBJbWJhIChhcyBgSW1iYS5FdmVudHNgKSwgd2hpY2ggaGFuZGxlcyBhbmQgZGVsZWdhdGVzIGFsbFxuZXZlbnRzIGF0IHRoZSB2ZXJ5IHJvb3Qgb2YgdGhlIGRvY3VtZW50LiBJbWJhIGRvZXMgbm90IGNhcHR1cmUgYWxsIGV2ZW50c1xuYnkgZGVmYXVsdCwgc28gaWYgeW91IHdhbnQgdG8gbWFrZSBzdXJlIGV4b3RpYyBvciBjdXN0b20gRE9NRXZlbnRzIGFyZSBkZWxlZ2F0ZWRcbmluIEltYmEgeW91IHdpbGwgbmVlZCB0byByZWdpc3RlciB0aGVtIGluIGBJbWJhLkV2ZW50cy5yZWdpc3RlcihteUN1c3RvbUV2ZW50TmFtZSlgXG5cbkBpbmFtZSBtYW5hZ2VyXG5cbiMjI1xuY2xhc3MgSW1iYS5FdmVudE1hbmFnZXJcblxuXHRwcm9wIHJvb3Rcblx0cHJvcCBjb3VudFxuXHRwcm9wIGVuYWJsZWQgZGVmYXVsdDogbm8sIHdhdGNoOiB5ZXNcblx0cHJvcCBsaXN0ZW5lcnNcblx0cHJvcCBkZWxlZ2F0b3JzXG5cdHByb3AgZGVsZWdhdG9yXG5cblx0ZGVmIGVuYWJsZWQtZGlkLXNldCBib29sXG5cdFx0Ym9vbCA/IG9uZW5hYmxlIDogb25kaXNhYmxlXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLmFjdGl2YXRlXG5cdFx0cmV0dXJuIEltYmEuRXZlbnRzIGlmIEltYmEuRXZlbnRzXG5cblx0XHRpZiAkd2ViJFxuXHRcdFx0SW1iYS5QT0lOVEVSIHx8PSBJbWJhLlBvaW50ZXIubmV3XG5cblx0XHRcdEltYmEuRXZlbnRzID0gSW1iYS5FdmVudE1hbmFnZXIubmV3KEltYmEuZG9jdW1lbnQsIGV2ZW50czogW1xuXHRcdFx0XHQ6a2V5ZG93biwgOmtleXVwLCA6a2V5cHJlc3MsXG5cdFx0XHRcdDp0ZXh0SW5wdXQsIDppbnB1dCwgOmNoYW5nZSwgOnN1Ym1pdCxcblx0XHRcdFx0OmZvY3VzaW4sIDpmb2N1c291dCwgOmZvY3VzLCA6Ymx1cixcblx0XHRcdFx0OmNvbnRleHRtZW51LCA6ZGJsY2xpY2ssXG5cdFx0XHRcdDptb3VzZXdoZWVsLCA6d2hlZWwsIDpzY3JvbGwsXG5cdFx0XHRcdDpiZWZvcmVjb3B5LCA6Y29weSxcblx0XHRcdFx0OmJlZm9yZXBhc3RlLCA6cGFzdGUsXG5cdFx0XHRcdDpiZWZvcmVjdXQsIDpjdXRcblx0XHRcdF0pXG5cblx0XHRcdCMgc2hvdWxkIGxpc3RlbiB0byBkcmFnZHJvcCBldmVudHMgYnkgZGVmYXVsdFxuXHRcdFx0SW1iYS5FdmVudHMucmVnaXN0ZXIoW1xuXHRcdFx0XHQ6ZHJhZ3N0YXJ0LDpkcmFnLDpkcmFnZW5kLFxuXHRcdFx0XHQ6ZHJhZ2VudGVyLDpkcmFnb3Zlciw6ZHJhZ2xlYXZlLDpkcmFnZXhpdCw6ZHJvcFxuXHRcdFx0XSlcblxuXHRcdFx0dmFyIGhhc1RvdWNoRXZlbnRzID0gd2luZG93ICYmIHdpbmRvdzpvbnRvdWNoc3RhcnQgIT09IHVuZGVmaW5lZFxuXG5cdFx0XHRpZiBoYXNUb3VjaEV2ZW50c1xuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoc3RhcnQpIGRvIHxlfFxuXHRcdFx0XHRcdEltYmEuVG91Y2gub250b3VjaHN0YXJ0KGUpXG5cblx0XHRcdFx0SW1iYS5FdmVudHMubGlzdGVuKDp0b3VjaG1vdmUpIGRvIHxlfFxuXHRcdFx0XHRcdEltYmEuVG91Y2gub250b3VjaG1vdmUoZSlcblxuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoZW5kKSBkbyB8ZXxcblx0XHRcdFx0XHRJbWJhLlRvdWNoLm9udG91Y2hlbmQoZSlcblxuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoY2FuY2VsKSBkbyB8ZXxcblx0XHRcdFx0XHRJbWJhLlRvdWNoLm9udG91Y2hjYW5jZWwoZSlcblxuXHRcdFx0SW1iYS5FdmVudHMucmVnaXN0ZXIoOmNsaWNrKSBkbyB8ZXxcblx0XHRcdFx0IyBPbmx5IGZvciBtYWluIG1vdXNlYnV0dG9uLCBubz9cblx0XHRcdFx0aWYgKGU6dGltZVN0YW1wIC0gSW1iYS5Ub3VjaC5MYXN0VGltZXN0YW1wKSA+IEltYmEuVG91Y2guVGFwVGltZW91dFxuXHRcdFx0XHRcdGUuQGltYmFTaW11bGF0ZWRUYXAgPSB5ZXNcblx0XHRcdFx0XHR2YXIgdGFwID0gSW1iYS5FdmVudC5uZXcoZSlcblx0XHRcdFx0XHR0YXAudHlwZSA9ICd0YXAnXG5cdFx0XHRcdFx0dGFwLnByb2Nlc3Ncblx0XHRcdFx0XHRpZiB0YXAuQHJlc3BvbmRlclxuXHRcdFx0XHRcdFx0cmV0dXJuIGUucHJldmVudERlZmF1bHRcblx0XHRcdFx0IyBkZWxlZ2F0ZSB0aGUgcmVhbCBjbGljayBldmVudFxuXHRcdFx0XHRJbWJhLkV2ZW50cy5kZWxlZ2F0ZShlKVxuXG5cdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOm1vdXNlZG93bikgZG8gfGV8XG5cdFx0XHRcdGlmIChlOnRpbWVTdGFtcCAtIEltYmEuVG91Y2guTGFzdFRpbWVzdGFtcCkgPiBJbWJhLlRvdWNoLlRhcFRpbWVvdXRcblx0XHRcdFx0XHRJbWJhLlBPSU5URVIudXBkYXRlKGUpLnByb2Nlc3MgaWYgSW1iYS5QT0lOVEVSXG5cblx0XHRcdEltYmEuRXZlbnRzLmxpc3Rlbig6bW91c2V1cCkgZG8gfGV8XG5cdFx0XHRcdGlmIChlOnRpbWVTdGFtcCAtIEltYmEuVG91Y2guTGFzdFRpbWVzdGFtcCkgPiBJbWJhLlRvdWNoLlRhcFRpbWVvdXRcblx0XHRcdFx0XHRJbWJhLlBPSU5URVIudXBkYXRlKGUpLnByb2Nlc3MgaWYgSW1iYS5QT0lOVEVSXG5cblx0XHRcdEltYmEuRXZlbnRzLnJlZ2lzdGVyKFs6bW91c2Vkb3duLDptb3VzZXVwXSlcblx0XHRcdEltYmEuRXZlbnRzLmVuYWJsZWQgPSB5ZXNcblx0XHRcdHJldHVybiBJbWJhLkV2ZW50c1xuXG5cblx0ZGVmIGluaXRpYWxpemUgbm9kZSwgZXZlbnRzOiBbXVxuXHRcdEBzaGltRm9jdXNFdmVudHMgPSAkd2ViJCAmJiB3aW5kb3c6bmV0c2NhcGUgJiYgbm9kZTpvbmZvY3VzaW4gPT09IHVuZGVmaW5lZFxuXHRcdHJvb3QgPSBub2RlXG5cdFx0bGlzdGVuZXJzID0gW11cblx0XHRkZWxlZ2F0b3JzID0ge31cblx0XHRkZWxlZ2F0b3IgPSBkbyB8ZXwgXG5cdFx0XHRkZWxlZ2F0ZShlKVxuXHRcdFx0cmV0dXJuIHRydWVcblxuXHRcdGZvciBldmVudCBpbiBldmVudHNcblx0XHRcdHJlZ2lzdGVyKGV2ZW50KVxuXG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblxuXHRUZWxsIHRoZSBjdXJyZW50IEV2ZW50TWFuYWdlciB0byBpbnRlcmNlcHQgYW5kIGhhbmRsZSBldmVudCBvZiBhIGNlcnRhaW4gbmFtZS5cblx0QnkgZGVmYXVsdCwgSW1iYS5FdmVudHMgd2lsbCByZWdpc3RlciBpbnRlcmNlcHRvcnMgZm9yOiAqa2V5ZG93biosICprZXl1cCosIFxuXHQqa2V5cHJlc3MqLCAqdGV4dElucHV0KiwgKmlucHV0KiwgKmNoYW5nZSosICpzdWJtaXQqLCAqZm9jdXNpbiosICpmb2N1c291dCosIFxuXHQqYmx1ciosICpjb250ZXh0bWVudSosICpkYmxjbGljayosICptb3VzZXdoZWVsKiwgKndoZWVsKlxuXG5cdCMjI1xuXHRkZWYgcmVnaXN0ZXIgbmFtZSwgaGFuZGxlciA9IHRydWVcblx0XHRpZiBuYW1lIGlzYSBBcnJheVxuXHRcdFx0cmVnaXN0ZXIodixoYW5kbGVyKSBmb3IgdiBpbiBuYW1lXG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0cmV0dXJuIHNlbGYgaWYgZGVsZWdhdG9yc1tuYW1lXVxuXHRcdCMgY29uc29sZS5sb2coXCJyZWdpc3RlciBmb3IgZXZlbnQge25hbWV9XCIpXG5cdFx0dmFyIGZuID0gZGVsZWdhdG9yc1tuYW1lXSA9IGhhbmRsZXIgaXNhIEZ1bmN0aW9uID8gaGFuZGxlciA6IGRlbGVnYXRvclxuXHRcdHJvb3QuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLGZuLHllcykgaWYgZW5hYmxlZFxuXG5cdGRlZiBsaXN0ZW4gbmFtZSwgaGFuZGxlciwgY2FwdHVyZSA9IHllc1xuXHRcdGxpc3RlbmVycy5wdXNoKFtuYW1lLGhhbmRsZXIsY2FwdHVyZV0pXG5cdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKG5hbWUsaGFuZGxlcixjYXB0dXJlKSBpZiBlbmFibGVkXG5cdFx0c2VsZlxuXG5cdGRlZiBkZWxlZ2F0ZSBlXG5cdFx0dmFyIGV2ZW50ID0gSW1iYS5FdmVudC53cmFwKGUpXG5cdFx0ZXZlbnQucHJvY2Vzc1xuXHRcdGlmIEBzaGltRm9jdXNFdmVudHNcblx0XHRcdGlmIGU6dHlwZSA9PSAnZm9jdXMnXG5cdFx0XHRcdEltYmEuRXZlbnQud3JhcChlKS5zZXRUeXBlKCdmb2N1c2luJykucHJvY2Vzc1xuXHRcdFx0ZWxpZiBlOnR5cGUgPT0gJ2JsdXInXG5cdFx0XHRcdEltYmEuRXZlbnQud3JhcChlKS5zZXRUeXBlKCdmb2N1c291dCcpLnByb2Nlc3Ncblx0XHRzZWxmXG5cblx0IyMjXG5cblx0Q3JlYXRlIGEgbmV3IEltYmEuRXZlbnRcblxuXHQjIyNcblx0ZGVmIGNyZWF0ZSB0eXBlLCB0YXJnZXQsIGRhdGE6IG51bGwsIHNvdXJjZTogbnVsbFxuXHRcdHZhciBldmVudCA9IEltYmEuRXZlbnQud3JhcCB0eXBlOiB0eXBlLCB0YXJnZXQ6IHRhcmdldFxuXHRcdGV2ZW50LmRhdGEgPSBkYXRhIGlmIGRhdGFcblx0XHRldmVudC5zb3VyY2UgPSBzb3VyY2UgaWYgc291cmNlXG5cdFx0ZXZlbnRcblxuXHQjIyNcblxuXHRUcmlnZ2VyIC8gcHJvY2VzcyBhbiBJbWJhLkV2ZW50LlxuXG5cdCMjI1xuXHRkZWYgdHJpZ2dlclxuXHRcdGNyZWF0ZSgqYXJndW1lbnRzKS5wcm9jZXNzXG5cblx0ZGVmIG9uZW5hYmxlXG5cdFx0Zm9yIG93biBuYW1lLGhhbmRsZXIgb2YgZGVsZWdhdG9yc1xuXHRcdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKG5hbWUsaGFuZGxlcix5ZXMpXG5cblx0XHRmb3IgaXRlbSBpbiBsaXN0ZW5lcnNcblx0XHRcdHJvb3QuYWRkRXZlbnRMaXN0ZW5lcihpdGVtWzBdLGl0ZW1bMV0saXRlbVsyXSlcblx0XHRcdFxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJyxJbWJhOmNvbW1pdClcblx0XHRzZWxmXG5cblx0ZGVmIG9uZGlzYWJsZVxuXHRcdGZvciBvd24gbmFtZSxoYW5kbGVyIG9mIGRlbGVnYXRvcnNcblx0XHRcdHJvb3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLGhhbmRsZXIseWVzKVxuXG5cdFx0Zm9yIGl0ZW0gaW4gbGlzdGVuZXJzXG5cdFx0XHRyb290LnJlbW92ZUV2ZW50TGlzdGVuZXIoaXRlbVswXSxpdGVtWzFdLGl0ZW1bMl0pXG5cblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsSW1iYTpjb21taXQpXG5cdFx0c2VsZlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC1tYW5hZ2VyLmltYmEiLCJleHRlcm4gbmF2aWdhdG9yXG5cbnZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuZGVmIHJlbW92ZU5lc3RlZCByb290LCBub2RlLCBjYXJldFxuXHQjIGlmIG5vZGUvbm9kZXMgaXNhIFN0cmluZ1xuXHQjIFx0d2UgbmVlZCB0byB1c2UgdGhlIGNhcmV0IHRvIHJlbW92ZSBlbGVtZW50c1xuXHQjIFx0Zm9yIG5vdyB3ZSB3aWxsIHNpbXBseSBub3Qgc3VwcG9ydCB0aGlzXG5cdGlmIG5vZGUgaXNhIEFycmF5XG5cdFx0cmVtb3ZlTmVzdGVkKHJvb3QsbWVtYmVyLGNhcmV0KSBmb3IgbWVtYmVyIGluIG5vZGVcblx0ZWxpZiBub2RlIGFuZCBub2RlLkBkb21cblx0XHRyb290LnJlbW92ZUNoaWxkKG5vZGUpXG5cdGVsaWYgbm9kZSAhPSBudWxsXG5cdFx0IyB3aGF0IGlmIHRoaXMgaXMgbm90IG51bGw/IT8hP1xuXHRcdCMgdGFrZSBhIGNoYW5jZSBhbmQgcmVtb3ZlIGEgdGV4dC1lbGVtZW50bmdcblx0XHRsZXQgbmV4dCA9IGNhcmV0ID8gY2FyZXQ6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZFxuXHRcdGlmIG5leHQgaXNhIFRleHQgYW5kIG5leHQ6dGV4dENvbnRlbnQgPT0gbm9kZVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChuZXh0KVxuXHRcdGVsc2Vcblx0XHRcdHRocm93ICdjYW5ub3QgcmVtb3ZlIHN0cmluZydcblxuXHRyZXR1cm4gY2FyZXRcblxuZGVmIGFwcGVuZE5lc3RlZCByb290LCBub2RlXG5cdGlmIG5vZGUgaXNhIEFycmF5XG5cdFx0bGV0IGkgPSAwXG5cdFx0bGV0IGMgPSBub2RlOnRhZ2xlblxuXHRcdGxldCBrID0gYyAhPSBudWxsID8gKG5vZGU6ZG9tbGVuID0gYykgOiBub2RlOmxlbmd0aFxuXHRcdGFwcGVuZE5lc3RlZChyb290LG5vZGVbaSsrXSkgd2hpbGUgaSA8IGtcblx0ZWxpZiBub2RlIGFuZCBub2RlLkBkb21cblx0XHRyb290LmFwcGVuZENoaWxkKG5vZGUpXG5cdGVsaWYgbm9kZSAhPSBudWxsIGFuZCBub2RlICE9PSBmYWxzZVxuXHRcdHJvb3QuYXBwZW5kQ2hpbGQgSW1iYS5jcmVhdGVUZXh0Tm9kZShub2RlKVxuXG5cdHJldHVyblxuXG5cbiMgaW5zZXJ0IG5vZGVzIGJlZm9yZSBhIGNlcnRhaW4gbm9kZVxuIyBkb2VzIG5vdCBuZWVkIHRvIHJldHVybiBhbnkgdGFpbCwgYXMgYmVmb3JlXG4jIHdpbGwgc3RpbGwgYmUgY29ycmVjdCB0aGVyZVxuIyBiZWZvcmUgbXVzdCBiZSBhbiBhY3R1YWwgZG9tbm9kZVxuZGVmIGluc2VydE5lc3RlZEJlZm9yZSByb290LCBub2RlLCBiZWZvcmVcblx0aWYgbm9kZSBpc2EgQXJyYXlcblx0XHRsZXQgaSA9IDBcblx0XHRsZXQgYyA9IG5vZGU6dGFnbGVuXG5cdFx0bGV0IGsgPSBjICE9IG51bGwgPyAobm9kZTpkb21sZW4gPSBjKSA6IG5vZGU6bGVuZ3RoXG5cdFx0aW5zZXJ0TmVzdGVkQmVmb3JlKHJvb3Qsbm9kZVtpKytdLGJlZm9yZSkgd2hpbGUgaSA8IGtcblxuXHRlbGlmIG5vZGUgYW5kIG5vZGUuQGRvbVxuXHRcdHJvb3QuaW5zZXJ0QmVmb3JlKG5vZGUsYmVmb3JlKVxuXHRlbGlmIG5vZGUgIT0gbnVsbCBhbmQgbm9kZSAhPT0gZmFsc2Vcblx0XHRyb290Lmluc2VydEJlZm9yZShJbWJhLmNyZWF0ZVRleHROb2RlKG5vZGUpLGJlZm9yZSlcblxuXHRyZXR1cm4gYmVmb3JlXG5cbiMgYWZ0ZXIgbXVzdCBiZSBhbiBhY3R1YWwgZG9tbm9kZVxuZGVmIGluc2VydE5lc3RlZEFmdGVyIHJvb3QsIG5vZGUsIGFmdGVyXG5cdHZhciBiZWZvcmUgPSBhZnRlciA/IGFmdGVyOm5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblxuXHRpZiBiZWZvcmVcblx0XHRpbnNlcnROZXN0ZWRCZWZvcmUocm9vdCxub2RlLGJlZm9yZSlcblx0XHRyZXR1cm4gYmVmb3JlOnByZXZpb3VzU2libGluZ1xuXHRlbHNlXG5cdFx0YXBwZW5kTmVzdGVkKHJvb3Qsbm9kZSlcblx0XHRyZXR1cm4gcm9vdC5AZG9tOmxhc3RDaGlsZFxuXG5kZWYgcmVjb25jaWxlQ29sbGVjdGlvbkNoYW5nZXMgcm9vdCwgbmV3LCBvbGQsIGNhcmV0XG5cblx0dmFyIG5ld0xlbiA9IG5ldzpsZW5ndGhcblx0dmFyIGxhc3ROZXcgPSBuZXdbbmV3TGVuIC0gMV1cblxuXHQjIFRoaXMgcmUtb3JkZXIgYWxnb3JpdGhtIGlzIGJhc2VkIG9uIHRoZSBmb2xsb3dpbmcgcHJpbmNpcGxlOlxuXHQjIFxuXHQjIFdlIGJ1aWxkIGEgXCJjaGFpblwiIHdoaWNoIHNob3dzIHdoaWNoIGl0ZW1zIGFyZSBhbHJlYWR5IHNvcnRlZC5cblx0IyBJZiB3ZSdyZSBnb2luZyBmcm9tIFsxLCAyLCAzXSAtPiBbMiwgMSwgM10sIHRoZSB0cmVlIGxvb2tzIGxpa2U6XG5cdCNcblx0IyBcdDMgLT4gIDAgKGlkeClcblx0IyBcdDIgLT4gLTEgKGlkeClcblx0IyBcdDEgLT4gLTEgKGlkeClcblx0I1xuXHQjIFRoaXMgdGVsbHMgdXMgdGhhdCB3ZSBoYXZlIHR3byBjaGFpbnMgb2Ygb3JkZXJlZCBpdGVtczpcblx0IyBcblx0IyBcdCgxLCAzKSBhbmQgKDIpXG5cdCMgXG5cdCMgVGhlIG9wdGltYWwgcmUtb3JkZXJpbmcgdGhlbiBiZWNvbWVzIHRvIGtlZXAgdGhlIGxvbmdlc3QgY2hhaW4gaW50YWN0LFxuXHQjIGFuZCBtb3ZlIGFsbCB0aGUgb3RoZXIgaXRlbXMuXG5cblx0dmFyIG5ld1Bvc2l0aW9uID0gW11cblxuXHQjIFRoZSB0cmVlL2dyYXBoIGl0c2VsZlxuXHR2YXIgcHJldkNoYWluID0gW11cblx0IyBUaGUgbGVuZ3RoIG9mIHRoZSBjaGFpblxuXHR2YXIgbGVuZ3RoQ2hhaW4gPSBbXVxuXG5cdCMgS2VlcCB0cmFjayBvZiB0aGUgbG9uZ2VzdCBjaGFpblxuXHR2YXIgbWF4Q2hhaW5MZW5ndGggPSAwXG5cdHZhciBtYXhDaGFpbkVuZCA9IDBcblxuXHR2YXIgaGFzVGV4dE5vZGVzID0gbm9cblx0dmFyIG5ld1Bvc1xuXG5cdGZvciBub2RlLCBpZHggaW4gb2xkXG5cdFx0IyBzcGVjaWFsIGNhc2UgZm9yIFRleHQgbm9kZXNcblx0XHRpZiBub2RlIGFuZCBub2RlOm5vZGVUeXBlID09IDNcblx0XHRcdG5ld1BvcyA9IG5ldy5pbmRleE9mKG5vZGU6dGV4dENvbnRlbnQpXG5cdFx0XHRuZXdbbmV3UG9zXSA9IG5vZGUgaWYgbmV3UG9zID49IDBcblx0XHRcdGhhc1RleHROb2RlcyA9IHllc1xuXHRcdGVsc2Vcblx0XHRcdG5ld1BvcyA9IG5ldy5pbmRleE9mKG5vZGUpXG5cblx0XHRuZXdQb3NpdGlvbi5wdXNoKG5ld1BvcylcblxuXHRcdGlmIG5ld1BvcyA9PSAtMVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChub2RlKVxuXHRcdFx0cHJldkNoYWluLnB1c2goLTEpXG5cdFx0XHRsZW5ndGhDaGFpbi5wdXNoKC0xKVxuXHRcdFx0Y29udGludWVcblxuXHRcdHZhciBwcmV2SWR4ID0gbmV3UG9zaXRpb246bGVuZ3RoIC0gMlxuXG5cdFx0IyBCdWlsZCB0aGUgY2hhaW46XG5cdFx0d2hpbGUgcHJldklkeCA+PSAwXG5cdFx0XHRpZiBuZXdQb3NpdGlvbltwcmV2SWR4XSA9PSAtMVxuXHRcdFx0XHRwcmV2SWR4LS1cblx0XHRcdGVsaWYgbmV3UG9zID4gbmV3UG9zaXRpb25bcHJldklkeF1cblx0XHRcdFx0IyBZYXksIHdlJ3JlIGJpZ2dlciB0aGFuIHRoZSBwcmV2aW91cyFcblx0XHRcdFx0YnJlYWtcblx0XHRcdGVsc2Vcblx0XHRcdFx0IyBOb3BlLCBsZXQncyB3YWxrIGJhY2sgdGhlIGNoYWluXG5cdFx0XHRcdHByZXZJZHggPSBwcmV2Q2hhaW5bcHJldklkeF1cblxuXHRcdHByZXZDaGFpbi5wdXNoKHByZXZJZHgpXG5cblx0XHR2YXIgY3Vyckxlbmd0aCA9IChwcmV2SWR4ID09IC0xKSA/IDAgOiBsZW5ndGhDaGFpbltwcmV2SWR4XSsxXG5cblx0XHRpZiBjdXJyTGVuZ3RoID4gbWF4Q2hhaW5MZW5ndGhcblx0XHRcdG1heENoYWluTGVuZ3RoID0gY3Vyckxlbmd0aFxuXHRcdFx0bWF4Q2hhaW5FbmQgPSBpZHhcblxuXHRcdGxlbmd0aENoYWluLnB1c2goY3Vyckxlbmd0aClcblxuXHR2YXIgc3RpY2t5Tm9kZXMgPSBbXVxuXG5cdCMgTm93IHdlIGNhbiB3YWxrIHRoZSBsb25nZXN0IGNoYWluIGJhY2t3YXJkcyBhbmQgbWFyayB0aGVtIGFzIFwic3RpY2t5XCIsXG5cdCMgd2hpY2ggaW1wbGllcyB0aGF0IHRoZXkgc2hvdWxkIG5vdCBiZSBtb3ZlZFxuXHR2YXIgY3Vyc29yID0gbmV3UG9zaXRpb246bGVuZ3RoIC0gMVxuXHR3aGlsZSBjdXJzb3IgPj0gMFxuXHRcdGlmIGN1cnNvciA9PSBtYXhDaGFpbkVuZCBhbmQgbmV3UG9zaXRpb25bY3Vyc29yXSAhPSAtMVxuXHRcdFx0c3RpY2t5Tm9kZXNbbmV3UG9zaXRpb25bY3Vyc29yXV0gPSB0cnVlXG5cdFx0XHRtYXhDaGFpbkVuZCA9IHByZXZDaGFpblttYXhDaGFpbkVuZF1cblxuXHRcdGN1cnNvciAtPSAxXG5cblx0IyBwb3NzaWJsZSB0byBkbyB0aGlzIGluIHJldmVyc2VkIG9yZGVyIGluc3RlYWQ/XG5cdGZvciBub2RlLCBpZHggaW4gbmV3XG5cdFx0aWYgIXN0aWNreU5vZGVzW2lkeF1cblx0XHRcdCMgY3JlYXRlIHRleHRub2RlIGZvciBzdHJpbmcsIGFuZCB1cGRhdGUgdGhlIGFycmF5XG5cdFx0XHR1bmxlc3Mgbm9kZSBhbmQgbm9kZS5AZG9tXG5cdFx0XHRcdG5vZGUgPSBuZXdbaWR4XSA9IEltYmEuY3JlYXRlVGV4dE5vZGUobm9kZSlcblxuXHRcdFx0dmFyIGFmdGVyID0gbmV3W2lkeCAtIDFdXG5cdFx0XHRpbnNlcnROZXN0ZWRBZnRlcihyb290LCBub2RlLCAoYWZ0ZXIgYW5kIGFmdGVyLkBkb20gb3IgYWZ0ZXIgb3IgY2FyZXQpKVxuXG5cdFx0Y2FyZXQgPSBub2RlLkBkb20gb3IgKGNhcmV0IGFuZCBjYXJldDpuZXh0U2libGluZyBvciByb290LkBkb206Zmlyc3RDaGlsZClcblxuXHQjIHNob3VsZCB0cnVzdCB0aGF0IHRoZSBsYXN0IGl0ZW0gaW4gbmV3IGxpc3QgaXMgdGhlIGNhcmV0XG5cdHJldHVybiBsYXN0TmV3IGFuZCBsYXN0TmV3LkBkb20gb3IgY2FyZXRcblxuXG4jIGV4cGVjdHMgYSBmbGF0IG5vbi1zcGFyc2UgYXJyYXkgb2Ygbm9kZXMgaW4gYm90aCBuZXcgYW5kIG9sZCwgYWx3YXlzXG5kZWYgcmVjb25jaWxlQ29sbGVjdGlvbiByb290LCBuZXcsIG9sZCwgY2FyZXRcblx0dmFyIGsgPSBuZXc6bGVuZ3RoXG5cdHZhciBpID0ga1xuXHR2YXIgbGFzdCA9IG5ld1trIC0gMV1cblxuXG5cdGlmIGsgPT0gb2xkOmxlbmd0aCBhbmQgbmV3WzBdID09PSBvbGRbMF1cblx0XHQjIHJ1bm5pbmcgdGhyb3VnaCB0byBjb21wYXJlXG5cdFx0d2hpbGUgaS0tXG5cdFx0XHRicmVhayBpZiBuZXdbaV0gIT09IG9sZFtpXVxuXG5cdGlmIGkgPT0gLTFcblx0XHRyZXR1cm4gbGFzdCBhbmQgbGFzdC5AZG9tIG9yIGxhc3Qgb3IgY2FyZXRcblx0ZWxzZVxuXHRcdHJldHVybiByZWNvbmNpbGVDb2xsZWN0aW9uQ2hhbmdlcyhyb290LG5ldyxvbGQsY2FyZXQpXG5cbiMgVFlQRSA1IC0gd2Uga25vdyB0aGF0IHdlIGFyZSBkZWFsaW5nIHdpdGggYSBzaW5nbGUgYXJyYXkgb2ZcbiMga2V5ZWQgdGFncyAtIGFuZCByb290IGhhcyBubyBvdGhlciBjaGlsZHJlblxuZGVmIHJlY29uY2lsZUxvb3Agcm9vdCwgbmV3LCBvbGQsIGNhcmV0XG5cdHZhciBubCA9IG5ldzpsZW5ndGhcblx0dmFyIG9sID0gb2xkOmxlbmd0aFxuXHR2YXIgY2wgPSBuZXc6Y2FjaGU6aSQgIyBjYWNoZS1sZW5ndGhcblx0dmFyIGkgPSAwLCBkID0gbmwgLSBvbFxuXG5cdCMgZmluZCB0aGUgZmlyc3QgaW5kZXggdGhhdCBpcyBkaWZmZXJlbnRcblx0aSsrIHdoaWxlIGkgPCBvbCBhbmQgaSA8IG5sIGFuZCBuZXdbaV0gPT09IG9sZFtpXVxuXHRcblx0IyBjb25kaXRpb25hbGx5IHBydW5lIGNhY2hlXG5cdGlmIGNsID4gMTAwMCBhbmQgKGNsIC0gbmwpID4gNTAwXG5cdFx0bmV3OmNhY2hlOiRwcnVuZShuZXcpXG5cdFxuXHRpZiBkID4gMCBhbmQgaSA9PSBvbFxuXHRcdCMgYWRkZWQgYXQgZW5kXG5cdFx0cm9vdC5hcHBlbmRDaGlsZChuZXdbaSsrXSkgd2hpbGUgaSA8IG5sXG5cdFx0cmV0dXJuXG5cdFxuXHRlbGlmIGQgPiAwXG5cdFx0bGV0IGkxID0gbmxcblx0XHRpMS0tIHdoaWxlIGkxID4gaSBhbmQgbmV3W2kxIC0gMV0gPT09IG9sZFtpMSAtIDEgLSBkXVxuXG5cdFx0aWYgZCA9PSAoaTEgLSBpKVxuXHRcdFx0IyBjb25zb2xlLmxvZyBcImFkZGVkIGluIGNodW5rXCIsaSxpMVxuXHRcdFx0bGV0IGJlZm9yZSA9IG9sZFtpXS5AZG9tXG5cdFx0XHRyb290Lmluc2VydEJlZm9yZShuZXdbaSsrXSxiZWZvcmUpIHdoaWxlIGkgPCBpMVxuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0ZWxpZiBkIDwgMCBhbmQgaSA9PSBubFxuXHRcdCMgcmVtb3ZlZCBhdCBlbmRcblx0XHRyb290LnJlbW92ZUNoaWxkKG9sZFtpKytdKSB3aGlsZSBpIDwgb2xcblx0XHRyZXR1cm5cblx0ZWxpZiBkIDwgMFxuXHRcdGxldCBpMSA9IG9sXG5cdFx0aTEtLSB3aGlsZSBpMSA+IGkgYW5kIG5ld1tpMSAtIDEgKyBkXSA9PT0gb2xkW2kxIC0gMV1cblxuXHRcdGlmIGQgPT0gKGkgLSBpMSlcblx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQob2xkW2krK10pIHdoaWxlIGkgPCBpMVxuXHRcdFx0cmV0dXJuXG5cblx0ZWxpZiBpID09IG5sXG5cdFx0cmV0dXJuXG5cblx0cmV0dXJuIHJlY29uY2lsZUNvbGxlY3Rpb25DaGFuZ2VzKHJvb3QsbmV3LG9sZCxjYXJldClcblxuIyBleHBlY3RzIGEgZmxhdCBub24tc3BhcnNlIGFycmF5IG9mIG5vZGVzIGluIGJvdGggbmV3IGFuZCBvbGQsIGFsd2F5c1xuZGVmIHJlY29uY2lsZUluZGV4ZWRBcnJheSByb290LCBhcnJheSwgb2xkLCBjYXJldFxuXHR2YXIgbmV3TGVuID0gYXJyYXk6dGFnbGVuXG5cdHZhciBwcmV2TGVuID0gYXJyYXk6ZG9tbGVuIG9yIDBcblx0dmFyIGxhc3QgPSBuZXdMZW4gPyBhcnJheVtuZXdMZW4gLSAxXSA6IG51bGxcblx0IyBjb25zb2xlLmxvZyBcInJlY29uY2lsZSBvcHRpbWl6ZWQgYXJyYXkoISlcIixjYXJldCxuZXdMZW4scHJldkxlbixhcnJheVxuXG5cdGlmIHByZXZMZW4gPiBuZXdMZW5cblx0XHR3aGlsZSBwcmV2TGVuID4gbmV3TGVuXG5cdFx0XHR2YXIgaXRlbSA9IGFycmF5Wy0tcHJldkxlbl1cblx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQoaXRlbS5AZG9tKVxuXG5cdGVsaWYgbmV3TGVuID4gcHJldkxlblxuXHRcdCMgZmluZCB0aGUgaXRlbSB0byBpbnNlcnQgYmVmb3JlXG5cdFx0bGV0IHByZXZMYXN0ID0gcHJldkxlbiA/IGFycmF5W3ByZXZMZW4gLSAxXS5AZG9tIDogY2FyZXRcblx0XHRsZXQgYmVmb3JlID0gcHJldkxhc3QgPyBwcmV2TGFzdDpuZXh0U2libGluZyA6IHJvb3QuQGRvbTpmaXJzdENoaWxkXG5cdFx0XG5cdFx0d2hpbGUgcHJldkxlbiA8IG5ld0xlblxuXHRcdFx0bGV0IG5vZGUgPSBhcnJheVtwcmV2TGVuKytdXG5cdFx0XHRiZWZvcmUgPyByb290Lmluc2VydEJlZm9yZShub2RlLkBkb20sYmVmb3JlKSA6IHJvb3QuYXBwZW5kQ2hpbGQobm9kZS5AZG9tKVxuXHRcdFx0XG5cdGFycmF5OmRvbWxlbiA9IG5ld0xlblxuXHRyZXR1cm4gbGFzdCA/IGxhc3QuQGRvbSA6IGNhcmV0XG5cblxuIyB0aGUgZ2VuZXJhbCByZWNvbmNpbGVyIHRoYXQgcmVzcGVjdHMgY29uZGl0aW9ucyBldGNcbiMgY2FyZXQgaXMgdGhlIGN1cnJlbnQgbm9kZSB3ZSB3YW50IHRvIGluc2VydCB0aGluZ3MgYWZ0ZXJcbmRlZiByZWNvbmNpbGVOZXN0ZWQgcm9vdCwgbmV3LCBvbGQsIGNhcmV0XG5cblx0IyB2YXIgc2tpcG5ldyA9IG5ldyA9PSBudWxsIG9yIG5ldyA9PT0gZmFsc2Ugb3IgbmV3ID09PSB0cnVlXG5cdHZhciBuZXdJc051bGwgPSBuZXcgPT0gbnVsbCBvciBuZXcgPT09IGZhbHNlXG5cdHZhciBvbGRJc051bGwgPSBvbGQgPT0gbnVsbCBvciBvbGQgPT09IGZhbHNlXG5cblxuXHRpZiBuZXcgPT09IG9sZFxuXHRcdCMgcmVtZW1iZXIgdGhhdCB0aGUgY2FyZXQgbXVzdCBiZSBhbiBhY3R1YWwgZG9tIGVsZW1lbnRcblx0XHQjIHdlIHNob3VsZCBpbnN0ZWFkIG1vdmUgdGhlIGFjdHVhbCBjYXJldD8gLSB0cnVzdFxuXHRcdGlmIG5ld0lzTnVsbFxuXHRcdFx0cmV0dXJuIGNhcmV0XG5cdFx0ZWxpZiBuZXcuQGRvbVxuXHRcdFx0cmV0dXJuIG5ldy5AZG9tXG5cdFx0ZWxpZiBuZXcgaXNhIEFycmF5IGFuZCBuZXc6dGFnbGVuICE9IG51bGxcblx0XHRcdHJldHVybiByZWNvbmNpbGVJbmRleGVkQXJyYXkocm9vdCxuZXcsb2xkLGNhcmV0KVxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBjYXJldCA/IGNhcmV0Om5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblxuXHRlbGlmIG5ldyBpc2EgQXJyYXlcblx0XHRpZiBvbGQgaXNhIEFycmF5XG5cdFx0XHQjIGxvb2sgZm9yIHNsb3QgaW5zdGVhZD9cblx0XHRcdGxldCB0eXAgPSBuZXc6c3RhdGljXG5cdFx0XHRpZiB0eXAgb3Igb2xkOnN0YXRpY1xuXHRcdFx0XHQjIGlmIHRoZSBzdGF0aWMgaXMgbm90IG5lc3RlZCAtIHdlIGNvdWxkIGdldCBhIGhpbnQgZnJvbSBjb21waWxlclxuXHRcdFx0XHQjIGFuZCBqdXN0IHNraXAgaXRcblx0XHRcdFx0aWYgdHlwID09IG9sZDpzdGF0aWMgIyBzaG91bGQgYWxzbyBpbmNsdWRlIGEgcmVmZXJlbmNlP1xuXHRcdFx0XHRcdGZvciBpdGVtLGkgaW4gbmV3XG5cdFx0XHRcdFx0XHQjIHRoaXMgaXMgd2hlcmUgd2UgY291bGQgZG8gdGhlIHRyaXBsZSBlcXVhbCBkaXJlY3RseVxuXHRcdFx0XHRcdFx0Y2FyZXQgPSByZWNvbmNpbGVOZXN0ZWQocm9vdCxpdGVtLG9sZFtpXSxjYXJldClcblx0XHRcdFx0XHRyZXR1cm4gY2FyZXRcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHJlbW92ZU5lc3RlZChyb290LG9sZCxjYXJldClcblx0XHRcdFx0XHRcblx0XHRcdFx0IyBpZiB0aGV5IGFyZSBub3QgdGhlIHNhbWUgd2UgY29udGludWUgdGhyb3VnaCB0byB0aGUgZGVmYXVsdFxuXHRcdFx0ZWxzZVxuXHRcdFx0XHQjIENvdWxkIHVzZSBvcHRpbWl6ZWQgbG9vcCBpZiB3ZSBrbm93IHRoYXQgaXQgb25seSBjb25zaXN0cyBvZiBub2Rlc1xuXHRcdFx0XHRyZXR1cm4gcmVjb25jaWxlQ29sbGVjdGlvbihyb290LG5ldyxvbGQsY2FyZXQpXG5cdFx0ZWxpZiAhb2xkSXNOdWxsXG5cdFx0XHRpZiBvbGQuQGRvbVxuXHRcdFx0XHRyb290LnJlbW92ZUNoaWxkKG9sZClcblx0XHRcdGVsc2Vcblx0XHRcdFx0IyBvbGQgd2FzIGEgc3RyaW5nLWxpa2Ugb2JqZWN0P1xuXHRcdFx0XHRyb290LnJlbW92ZUNoaWxkKGNhcmV0ID8gY2FyZXQ6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZClcblxuXHRcdHJldHVybiBpbnNlcnROZXN0ZWRBZnRlcihyb290LG5ldyxjYXJldClcblx0XHQjIHJlbW92ZSBvbGRcblxuXHRlbGlmICFuZXdJc051bGwgYW5kIG5ldy5AZG9tXG5cdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KSB1bmxlc3Mgb2xkSXNOdWxsXG5cdFx0cmV0dXJuIGluc2VydE5lc3RlZEFmdGVyKHJvb3QsbmV3LGNhcmV0KVxuXG5cdGVsaWYgbmV3SXNOdWxsXG5cdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KSB1bmxlc3Mgb2xkSXNOdWxsXG5cdFx0cmV0dXJuIGNhcmV0XG5cdGVsc2Vcblx0XHQjIGlmIG9sZCBkaWQgbm90IGV4aXN0IHdlIG5lZWQgdG8gYWRkIGEgbmV3IGRpcmVjdGx5XG5cdFx0bGV0IG5leHROb2RlXG5cdFx0IyBpZiBvbGQgd2FzIGFycmF5IG9yIGltYmF0YWcgd2UgbmVlZCB0byByZW1vdmUgaXQgYW5kIHRoZW4gYWRkXG5cdFx0aWYgb2xkIGlzYSBBcnJheVxuXHRcdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KVxuXHRcdGVsaWYgb2xkIGFuZCBvbGQuQGRvbVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChvbGQpXG5cdFx0ZWxpZiAhb2xkSXNOdWxsXG5cdFx0XHQjIC4uLlxuXHRcdFx0bmV4dE5vZGUgPSBjYXJldCA/IGNhcmV0Om5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblx0XHRcdGlmIG5leHROb2RlIGlzYSBUZXh0IGFuZCBuZXh0Tm9kZTp0ZXh0Q29udGVudCAhPSBuZXdcblx0XHRcdFx0bmV4dE5vZGU6dGV4dENvbnRlbnQgPSBuZXdcblx0XHRcdFx0cmV0dXJuIG5leHROb2RlXG5cblx0XHQjIG5vdyBhZGQgdGhlIHRleHRub2RlXG5cdFx0cmV0dXJuIGluc2VydE5lc3RlZEFmdGVyKHJvb3QsbmV3LGNhcmV0KVxuXG5cbmV4dGVuZCB0YWcgZWxlbWVudFxuXHRcblx0IyAxIC0gc3RhdGljIHNoYXBlIC0gdW5rbm93biBjb250ZW50XG5cdCMgMiAtIHN0YXRpYyBzaGFwZSBhbmQgc3RhdGljIGNoaWxkcmVuXG5cdCMgMyAtIHNpbmdsZSBpdGVtXG5cdCMgNCAtIG9wdGltaXplZCBhcnJheSAtIG9ubHkgbGVuZ3RoIHdpbGwgY2hhbmdlXG5cdCMgNSAtIG9wdGltaXplZCBjb2xsZWN0aW9uXG5cdCMgNiAtIHRleHQgb25seVxuXG5cdGRlZiBzZXRDaGlsZHJlbiBuZXcsIHR5cFxuXHRcdCMgaWYgdHlwZW9mIG5ldyA9PSAnc3RyaW5nJ1xuXHRcdCMgXHRyZXR1cm4gc2VsZi50ZXh0ID0gbmV3XG5cdFx0dmFyIG9sZCA9IEB0cmVlX1xuXG5cdFx0aWYgbmV3ID09PSBvbGQgYW5kIG5ldyBhbmQgbmV3OnRhZ2xlbiA9PSB1bmRlZmluZWRcblx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRpZiAhb2xkIGFuZCB0eXAgIT0gM1xuXHRcdFx0cmVtb3ZlQWxsQ2hpbGRyZW5cblx0XHRcdGFwcGVuZE5lc3RlZChzZWxmLG5ldylcblxuXHRcdGVsaWYgdHlwID09IDFcblx0XHRcdGxldCBjYXJldCA9IG51bGxcblx0XHRcdGZvciBpdGVtLGkgaW4gbmV3XG5cdFx0XHRcdGNhcmV0ID0gcmVjb25jaWxlTmVzdGVkKHNlbGYsaXRlbSxvbGRbaV0sY2FyZXQpXG5cdFx0XG5cdFx0ZWxpZiB0eXAgPT0gMlxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdGVsaWYgdHlwID09IDNcblx0XHRcdGxldCBudHlwID0gdHlwZW9mIG5ld1xuXG5cdFx0XHRpZiBuZXcgYW5kIG5ldy5AZG9tXG5cdFx0XHRcdHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0XHRcdGFwcGVuZENoaWxkKG5ldylcblxuXHRcdFx0IyBjaGVjayBpZiBvbGQgYW5kIG5ldyBpc2EgYXJyYXlcblx0XHRcdGVsaWYgbmV3IGlzYSBBcnJheVxuXHRcdFx0XHRpZiBuZXcuQHR5cGUgPT0gNSBhbmQgb2xkIGFuZCBvbGQuQHR5cGUgPT0gNVxuXHRcdFx0XHRcdHJlY29uY2lsZUxvb3Aoc2VsZixuZXcsb2xkLG51bGwpXG5cdFx0XHRcdGVsaWYgb2xkIGlzYSBBcnJheVxuXHRcdFx0XHRcdHJlY29uY2lsZU5lc3RlZChzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0XHRcdFx0YXBwZW5kTmVzdGVkKHNlbGYsbmV3KVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHR0ZXh0ID0gbmV3XG5cdFx0XHRcdHJldHVybiBzZWxmXG5cdFx0XHRcdFxuXHRcdGVsaWYgdHlwID09IDRcblx0XHRcdHJlY29uY2lsZUluZGV4ZWRBcnJheShzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRcdFxuXHRcdGVsaWYgdHlwID09IDVcblx0XHRcdHJlY29uY2lsZUxvb3Aoc2VsZixuZXcsb2xkLG51bGwpXG5cblx0XHRlbGlmIG5ldyBpc2EgQXJyYXkgYW5kIG9sZCBpc2EgQXJyYXlcblx0XHRcdHJlY29uY2lsZU5lc3RlZChzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRlbHNlXG5cdFx0XHQjIHdoYXQgaWYgdGV4dD9cblx0XHRcdHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0XHRhcHBlbmROZXN0ZWQoc2VsZixuZXcpXG5cblx0XHRAdHJlZV8gPSBuZXdcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBjb250ZW50XG5cdFx0QGNvbnRlbnQgb3IgY2hpbGRyZW4udG9BcnJheVxuXHRcblx0ZGVmIHNldFRleHQgdGV4dFxuXHRcdGlmIHRleHQgIT0gQHRyZWVfXG5cdFx0XHR2YXIgdmFsID0gdGV4dCA9PT0gbnVsbCBvciB0ZXh0ID09PSBmYWxzZSA/ICcnIDogdGV4dFxuXHRcdFx0KEB0ZXh0XyBvciBAZG9tKTp0ZXh0Q29udGVudCA9IHZhbFxuXHRcdFx0QHRleHRfIHx8PSBAZG9tOmZpcnN0Q2hpbGRcblx0XHRcdEB0cmVlXyA9IHRleHRcblx0XHRzZWxmXG5cbiMgYWxpYXMgc2V0Q29udGVudCB0byBzZXRDaGlsZHJlblxudmFyIHByb3RvID0gSW1iYS5UYWc6cHJvdG90eXBlXG5wcm90bzpzZXRDb250ZW50ID0gcHJvdG86c2V0Q2hpbGRyZW5cblxuIyBvcHRpbWl6YXRpb24gZm9yIHNldFRleHRcbnZhciBhcHBsZSA9IHR5cGVvZiBuYXZpZ2F0b3IgIT0gJ3VuZGVmaW5lZCcgYW5kIChuYXZpZ2F0b3I6dmVuZG9yIG9yICcnKS5pbmRleE9mKCdBcHBsZScpID09IDBcbmlmIGFwcGxlXG5cdGRlZiBwcm90by5zZXRUZXh0IHRleHRcblx0XHRpZiB0ZXh0ICE9IEB0cmVlX1xuXHRcdFx0QGRvbTp0ZXh0Q29udGVudCA9ICh0ZXh0ID09PSBudWxsIG9yIHRleHQgPT09IGZhbHNlID8gJycgOiB0ZXh0KVxuXHRcdFx0QHRyZWVfID0gdGV4dFxuXHRcdHJldHVybiBzZWxmXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vcmVjb25jaWxlci5pbWJhIiwiaW1wb3J0IFJvdXRlciBmcm9tICcuL3V0aWwvcm91dGVyJ1xuXG5leHBvcnQgY2xhc3MgRG9jXG5cblx0cHJvcCBwYXRoXG5cdHByb3Agc3JjXG5cdHByb3AgZGF0YVxuXG5cdGRlZiByZWFkeVxuXHRcdEByZWFkeVxuXG5cdGRlZiBpbml0aWFsaXplIHNyYywgYXBwXG5cdFx0QHNyYyA9IHNyY1xuXHRcdEBwYXRoID0gc3JjLnJlcGxhY2UoL1xcLm1kJC8sJycpXG5cdFx0QGFwcCA9IGFwcFxuXHRcdEByZWFkeSA9IG5vXG5cdFx0ZmV0Y2hcblx0XHRzZWxmXG5cblx0ZGVmIGZldGNoXG5cdFx0QHByb21pc2UgfHw9IEBhcHAuZmV0Y2goc3JjKS50aGVuIGRvIHxyZXN8XG5cdFx0XHRsb2FkKHJlcylcblxuXHRkZWYgbG9hZCBkb2Ncblx0XHRAZGF0YSA9IGRvY1xuXHRcdEBtZXRhID0gZG9jOm1ldGEgb3Ige31cblx0XHRAcmVhZHkgPSB5ZXNcblx0XHRJbWJhLmNvbW1pdFxuXHRcdHNlbGZcblxuXHRkZWYgdGl0bGVcblx0XHRAZGF0YTp0aXRsZSBvciAncGF0aCdcblxuXHRkZWYgdG9jXG5cdFx0QGRhdGEgYW5kIEBkYXRhOnRvY1swXVxuXG5cdGRlZiBib2R5XG5cdFx0QGRhdGEgYW5kIEBkYXRhOmJvZHlcblxuXG5leHBvcnQgdmFyIENhY2hlID0ge31cbnZhciByZXF1ZXN0cyA9IHt9XG5cbmV4cG9ydCBjbGFzcyBBcHBcblx0cHJvcCByZXFcblx0cHJvcCBjYWNoZVxuXHRwcm9wIGlzc3Vlc1xuXHRcblx0ZGVmIHNlbGYuZGVzZXJpYWxpemUgZGF0YSA9ICd7fSdcblx0XHRzZWxmLm5ldyBKU09OLnBhcnNlKGRhdGEucmVwbGFjZSgvwqfCp1NDUklQVMKnwqcvZyxcInNjcmlwdFwiKSlcblxuXHRkZWYgaW5pdGlhbGl6ZSBjYWNoZSA9IHt9XG5cdFx0QGNhY2hlID0gY2FjaGVcblx0XHRAZG9jcyA9IHt9XG5cdFx0aWYgJHdlYiRcblx0XHRcdEBsb2MgPSBkb2N1bWVudDpsb2NhdGlvblxuXHRcdFx0XG5cdFx0aWYgQGNhY2hlOmd1aWRlXG5cdFx0XHRAZ3VpZGUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KEBjYWNoZTpndWlkZSkpXG5cdFx0XHQjIGZvciBpdGVtLGkgaW4gQGd1aWRlXG5cdFx0XHQjIFx0QGd1aWRlW2l0ZW06aWRdID0gaXRlbVxuXHRcdFx0IyBcdGl0ZW06bmV4dCA9IEBndWlkZVtpICsgMV1cblx0XHRcdCMgXHRpdGVtOnByZXYgPSBAZ3VpZGVbaSAtIDFdXG5cdFx0c2VsZlxuXG5cdGRlZiByZXNldFxuXHRcdGNhY2hlID0ge31cblx0XHRzZWxmXG5cblx0ZGVmIHJvdXRlclxuXHRcdEByb3V0ZXIgfHw9IFJvdXRlci5uZXcoc2VsZilcblxuXHRkZWYgcGF0aFxuXHRcdCR3ZWIkID8gQGxvYzpwYXRobmFtZSA6IHJlcTpwYXRoXG5cblx0ZGVmIGhhc2hcblx0XHQkd2ViJCA/IEBsb2M6aGFzaC5zdWJzdHIoMSkgOiAnJ1xuXG5cdGRlZiBkb2Mgc3JjXG5cdFx0QGRvY3Nbc3JjXSB8fD0gRG9jLm5ldyhzcmMsc2VsZilcblx0XHRcblx0ZGVmIGd1aWRlXG5cdFx0QGd1aWRlIHx8PSBAY2FjaGU6Z3VpZGUgIyAubWFwIGRvIHx8XG5cdFx0XG5cdGRlZiBzZXJpYWxpemVcblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoY2FjaGUpLnJlcGxhY2UoL1xcYnNjcmlwdC9nLFwiwqfCp1NDUklQVMKnwqdcIilcblxuXHRpZiAkbm9kZSRcblx0XHRkZWYgZmV0Y2ggc3JjXG5cdFx0XHRsZXQgcmVzID0gY2FjaGVbc3JjXSA9IENhY2hlW3NyY11cblx0XHRcdGxldCBwcm9taXNlID0ge3RoZW46ICh8Y2J8IGNiKENhY2hlW3NyY10pKSB9XG5cdFx0XHRcblx0XHRcdHJldHVybiBwcm9taXNlIGlmIHJlc1xuXHRcdFx0XG5cdFx0XHRjb25zb2xlLmxvZyBcInRyeSB0byBmZXRjaCB7c3JjfVwiXG5cdFx0XHRcblx0XHRcdHZhciBmcyA9IHJlcXVpcmUgJ2ZzJ1xuXHRcdFx0dmFyIHBhdGggPSByZXF1aXJlICdwYXRoJ1xuXHRcdFx0dmFyIG1kID0gcmVxdWlyZSAnLi91dGlsL21hcmtkb3duJ1xuXHRcdFx0dmFyIGhsID0gcmVxdWlyZSAnLi9zY3JpbWJsYS9jb3JlL2hpZ2hsaWdodGVyJ1xuXHRcdFx0dmFyIGZpbGVwYXRoID0gXCJ7X19kaXJuYW1lfS8uLi9kb2NzL3tzcmN9XCIucmVwbGFjZSgvXFwvXFwvL2csJy8nKVxuXG5cdFx0XHRsZXQgYm9keSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlcGF0aCwndXRmLTgnKVxuXG5cdFx0XHRpZiBzcmMubWF0Y2goL1xcLm1kJC8pXG5cdFx0XHRcdHJlcyA9IG1kLnJlbmRlcihib2R5KVxuXG5cdFx0XHRlbGlmIHNyYy5tYXRjaCgvXFwuanNvbiQvKVxuXHRcdFx0XHQjIHNob3VsZCBhbHNvIGluY2x1ZGUgbWQ/XG5cdFx0XHRcdHJlcyA9IEpTT04ucGFyc2UoYm9keSlcblxuXHRcdFx0ZWxpZiBzcmMubWF0Y2goL1xcLmltYmEkLylcblx0XHRcdFx0bGV0IGh0bWwgPSBobC5IaWdobGlnaHRlci5oaWdobGlnaHQoYm9keSx7bW9kZTogJ2Z1bGwnfSlcblx0XHRcdFx0cmVzID0ge2JvZHk6IGJvZHksIGh0bWw6IGh0bWx9XG5cblx0XHRcdGNhY2hlW3NyY10gPSBDYWNoZVtzcmNdID0gcmVzXG5cdFx0XHRyZXR1cm4gcHJvbWlzZVxuXHRcblx0aWYgJHdlYiRcblx0XHRkZWYgZmV0Y2ggc3JjXG5cdFx0XHRpZiBjYWNoZVtzcmNdXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoY2FjaGVbc3JjXSlcblx0XHRcdFxuXHRcdFx0cmVxdWVzdHNbc3JjXSB8fD0gUHJvbWlzZS5uZXcgZG8gfHJlc29sdmV8XG5cdFx0XHRcdHZhciByZXEgPSBhd2FpdCB3aW5kb3cuZmV0Y2goc3JjKVxuXHRcdFx0XHR2YXIgcmVzcCA9IGF3YWl0IHJlcS5qc29uXG5cdFx0XHRcdHJlc29sdmUoY2FjaGVbc3JjXSA9IHJlc3ApXG5cdFx0XHRcblx0ZGVmIGZldGNoRG9jdW1lbnQgc3JjLCAmY2Jcblx0XHR2YXIgcmVzID0gZGVwc1tzcmNdXG5cdFx0Y29uc29sZS5sb2cgXCJubyBsb25nZXI/XCJcblxuXHRcdGlmICRub2RlJFxuXHRcdFx0dmFyIGZzID0gcmVxdWlyZSAnZnMnXG5cdFx0XHR2YXIgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cdFx0XHR2YXIgbWQgPSByZXF1aXJlICcuL3V0aWwvbWFya2Rvd24nXG5cdFx0XHR2YXIgaGwgPSByZXF1aXJlICcuL3NjcmltYmxhL2NvcmUvaGlnaGxpZ2h0ZXInXG5cdFx0XHR2YXIgZmlsZXBhdGggPSBcIntfX2Rpcm5hbWV9Ly4uL2RvY3Mve3NyY31cIi5yZXBsYWNlKC9cXC9cXC8vZywnLycpXG5cblx0XHRcdGlmICFyZXNcblx0XHRcdFx0bGV0IGJvZHkgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZXBhdGgsJ3V0Zi04JylcblxuXHRcdFx0XHRpZiBzcmMubWF0Y2goL1xcLm1kJC8pXG5cdFx0XHRcdFx0cmVzID0gbWQucmVuZGVyKGJvZHkpXG5cblx0XHRcdFx0ZWxpZiBzcmMubWF0Y2goL1xcLmpzb24kLylcblx0XHRcdFx0XHQjIHNob3VsZCBhbHNvIGluY2x1ZGUgbWQ/XG5cdFx0XHRcdFx0cmVzID0gSlNPTi5wYXJzZShib2R5KVxuXG5cdFx0XHRcdGVsaWYgc3JjLm1hdGNoKC9cXC5pbWJhJC8pXG5cdFx0XHRcdFx0bGV0IGh0bWwgPSBobC5IaWdobGlnaHRlci5oaWdobGlnaHQoYm9keSx7bW9kZTogJ2Z1bGwnfSlcblx0XHRcdFx0XHRyZXMgPSB7Ym9keTogYm9keSwgaHRtbDogaHRtbH1cblx0XHRcdFxuXHRcdFx0ZGVwc1tzcmNdIHx8PSByZXNcblx0XHRcdGNiIGFuZCBjYihyZXMpXG5cdFx0ZWxzZVxuXHRcdFx0IyBzaG91bGQgZ3VhcmQgYWdhaW5zdCBtdWx0aXBsZSBsb2Fkc1xuXHRcdFx0aWYgcmVzXG5cdFx0XHRcdGNiIGFuZCBjYihyZXMpXG5cdFx0XHRcdHJldHVybiB7dGhlbjogKGRvIHx2fCB2KHJlcykpfSAjIGZha2UgcHJvbWlzZSBoYWNrXG5cblx0XHRcdHZhciB4aHIgPSBYTUxIdHRwUmVxdWVzdC5uZXdcblx0XHRcdHhoci5hZGRFdmVudExpc3RlbmVyICdsb2FkJyBkbyB8cmVzfFxuXHRcdFx0XHRyZXMgPSBkZXBzW3NyY10gPSBKU09OLnBhcnNlKHhocjpyZXNwb25zZVRleHQpXG5cdFx0XHRcdGNiIGFuZCBjYihyZXMpXG5cdFx0XHR4aHIub3BlbihcIkdFVFwiLCBzcmMpXG5cdFx0XHR4aHIuc2VuZFxuXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgaXNzdWVzXG5cdFx0QGlzc3VlcyB8fD0gRG9jLmdldCgnL2lzc3Vlcy9hbGwnLCdqc29uJylcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2FwcC5pbWJhIiwiZXh0ZXJuIGhpc3RvcnksIGdhXG5cbmV4cG9ydCBjbGFzcyBSb3V0ZXJcblxuXHRwcm9wIHBhdGhcblxuXHRkZWYgc2VsZi5zbHVnIHN0clxuXHRcdHN0ciA9IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJykudG9Mb3dlckNhc2UgIyB0cmltXG5cblx0XHR2YXIgZnJvbSA9IFwiw6DDocOkw6LDpcOow6nDq8Oqw6zDrcOvw67DssOzw7bDtMO5w7rDvMO7w7HDp8K3L18sOjtcIlxuXHRcdHZhciB0byAgID0gXCJhYWFhYWVlZWVpaWlpb29vb3V1dXVuYy0tLS0tLVwiXG5cdFx0c3RyID0gc3RyLnJlcGxhY2UoL1teYS16MC05IC1dL2csICcnKSAjIHJlbW92ZSBpbnZhbGlkIGNoYXJzXG5cdFx0c3RyID0gc3RyLnJlcGxhY2UoL1xccysvZywgJy0nKSAjIGNvbGxhcHNlIHdoaXRlc3BhY2UgYW5kIHJlcGxhY2UgYnkgLVxuXHRcdHN0ciA9IHN0ci5yZXBsYWNlKC8tKy9nLCAnLScpICMgY29sbGFwc2UgZGFzaGVzXG5cblx0XHRyZXR1cm4gc3RyXG5cblx0ZGVmIGluaXRpYWxpemUgYXBwXG5cdFx0QGFwcCA9IGFwcFxuXG5cdFx0aWYgJHdlYiRcblx0XHRcdHdpbmRvdzpvbnBvcHN0YXRlID0gZG8gfGV8XG5cdFx0XHRcdHJlZnJlc2hcblxuXHRcdHNlbGZcblxuXHRkZWYgcmVmcmVzaFxuXHRcdGlmICR3ZWIkXG5cdFx0XHRkb2N1bWVudDpib2R5LnNldEF0dHJpYnV0ZSgnZGF0YS1yb3V0ZScsc2VnbWVudCgwKSlcblx0XHRcdEltYmEuY29tbWl0XG5cdFx0c2VsZlxuXG5cdGRlZiBwYXRoXG5cdFx0QGFwcC5wYXRoXG5cblx0ZGVmIGhhc2hcblx0XHRAYXBwLmhhc2hcblxuXHRkZWYgZXh0XG5cdFx0dmFyIHBhdGggPSBwYXRoXG5cdFx0dmFyIG0gPSBwYXRoLm1hdGNoKC9cXC4oW15cXC9dKykkLylcblx0XHRtIGFuZCBtWzFdIG9yICcnXG5cblx0ZGVmIHNlZ21lbnQgbnIgPSAwXG5cdFx0cGF0aC5zcGxpdCgnLycpW25yICsgMV0gb3IgJydcblxuXHRkZWYgZ28gaHJlZiwgc3RhdGUgPSB7fSwgcmVwbGFjZSA9IG5vXG5cdFx0aWYgaHJlZiA9PSAnL2luc3RhbGwnXG5cdFx0XHQjIHJlZGlyZWN0cyBoZXJlXG5cdFx0XHRocmVmID0gJy9ndWlkZXMjdG9jLWluc3RhbGxhdGlvbidcblx0XHRcdFxuXHRcdGlmIHJlcGxhY2Vcblx0XHRcdGhpc3RvcnkucmVwbGFjZVN0YXRlKHN0YXRlLG51bGwsaHJlZilcblx0XHRcdHJlZnJlc2hcblx0XHRlbHNlXG5cdFx0XHRoaXN0b3J5LnB1c2hTdGF0ZShzdGF0ZSxudWxsLGhyZWYpXG5cdFx0XHRyZWZyZXNoXG5cdFx0XHQjIGdhKCdzZW5kJywgJ3BhZ2V2aWV3JywgaHJlZilcblxuXHRcdGlmICFocmVmLm1hdGNoKC9cXCMvKVxuXHRcdFx0d2luZG93LnNjcm9sbFRvKDAsMClcblx0XG5cdFx0c2VsZlxuXG5cdGRlZiBzY29wZWQgcmVnLCBwYXJ0XG5cdFx0dmFyIHBhdGggPSBwYXRoICsgJyMnICsgaGFzaFxuXHRcdGlmIHJlZyBpc2EgU3RyaW5nXG5cdFx0XHR2YXIgbnh0ID0gcGF0aFtyZWc6bGVuZ3RoXVxuXHRcdFx0cGF0aC5zdWJzdHIoMCxyZWc6bGVuZ3RoKSA9PSByZWcgYW5kICghbnh0IG9yIG54dCA9PSAnLScgb3Igbnh0ID09ICcvJyBvciBueHQgPT0gJyMnIG9yIG54dCA9PSAnPycgb3Igbnh0ID09ICdfJylcblx0XHRlbGlmIHJlZyBpc2EgUmVnRXhwXG5cdFx0XHR2YXIgbSA9IHBhdGgubWF0Y2gocmVnKVxuXHRcdFx0cGFydCAmJiBtID8gbVtwYXJ0XSA6IG1cblx0XHRlbHNlXG5cdFx0XHRub1xuXG5cdGRlZiBtYXRjaCByZWcsIHBhcnRcblx0XHR2YXIgcGF0aCA9IHBhdGggKyAnIycgKyBoYXNoXG5cblx0XHRpZiByZWcgaXNhIFN0cmluZ1xuXHRcdFx0cGF0aCA9PSByZWdcblx0XHRlbGlmIHJlZyBpc2EgUmVnRXhwXG5cdFx0XHR2YXIgbSA9IHBhdGgubWF0Y2gocmVnKVxuXHRcdFx0cGFydCAmJiBtID8gbVtwYXJ0XSA6IG1cblx0XHRlbHNlXG5cdFx0XHRub1xuXG5leHRlbmQgdGFnIGVsZW1lbnRcblx0YXR0ciByb3V0ZVxuXG5cdGRlZiByb3V0ZXJcblx0XHRhcHAucm91dGVyXG5cblx0ZGVmIHJlcm91dGVcblx0XHR2YXIgc2NvcGVkID0gcm91dGVyLnNjb3BlZChyb3V0ZSxzZWxmKVxuXHRcdGZsYWcoJ3Njb3BlZCcsc2NvcGVkKVxuXHRcdGZsYWcoJ3NlbGVjdGVkJyxyb3V0ZXIubWF0Y2gocm91dGUsc2VsZikpXG5cdFx0aWYgc2NvcGVkICE9IEBzY29wZWRcblx0XHRcdEBzY29wZWQgPSBzY29wZWRcblx0XHRcdHNjb3BlZCA/IGRpZHNjb3BlIDogZGlkdW5zY29wZVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIGRpZHNjb3BlXG5cdFx0c2VsZlxuXG5cdGRlZiBkaWR1bnNjb3BlXG5cdFx0c2VsZlxuXG4jIGV4dGVuZCBsaW5rc1xuZXh0ZW5kIHRhZyBhXG5cdFxuXHRkZWYgcm91dGVcblx0XHRAcm91dGUgb3IgaHJlZlxuXG5cdGRlZiBvbnRhcCBlXG5cdFx0dmFyIGhyZWYgPSBocmVmLnJlcGxhY2UoL15odHRwXFw6XFwvXFwvaW1iYVxcLmlvLywnJylcblxuXHRcdGlmIGUuZXZlbnQ6bWV0YUtleSBvciBlLmV2ZW50OmFsdEtleVxuXHRcdFx0ZS5AcmVzcG9uZGVyID0gbnVsbFxuXHRcdFx0cmV0dXJuIGUuc3RvcFxuXG5cdFx0aWYgbGV0IG0gPSBocmVmLm1hdGNoKC9naXN0XFwuZ2l0aHViXFwuY29tXFwvKFteXFwvXSspXFwvKFtBLVphLXpcXGRdKykvKVxuXHRcdFx0Y29uc29sZS5sb2cgJ2dpc3QhIScsbVsxXSxtWzJdXG5cdFx0XHQjZ2lzdC5vcGVuKG1bMl0pXG5cdFx0XHRyZXR1cm4gZS5wcmV2ZW50LnN0b3BcblxuXHRcdGlmIGhyZWZbMF0gPT0gJyMnIG9yIGhyZWZbMF0gPT0gJy8nXG5cdFx0XHRlLnByZXZlbnQuc3RvcFxuXHRcdFx0cm91dGVyLmdvKGhyZWYse30pXG5cdFx0XHRJbWJhLkV2ZW50cy50cmlnZ2VyKCdyb3V0ZScsc2VsZilcblx0XHRlbHNlXG5cdFx0XHRlLkByZXNwb25kZXIgPSBudWxsXG5cdFx0XHRyZXR1cm4gZS5zdG9wXHRcdFxuXHRcdHNlbGZcblxuXHRkZWYgcmVuZGVyXG5cdFx0cmVyb3V0ZSBpZiAkd2ViJFxuXHRcdHNlbGZcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy91dGlsL3JvdXRlci5pbWJhIiwiaW1wb3J0IEhvbWVQYWdlIGZyb20gJy4vSG9tZVBhZ2UnXG5pbXBvcnQgR3VpZGVzUGFnZSBmcm9tICcuL0d1aWRlc1BhZ2UnXG5pbXBvcnQgRG9jc1BhZ2UgZnJvbSAnLi9Eb2NzUGFnZSdcbmltcG9ydCBMb2dvIGZyb20gJy4vTG9nbydcblxuZXh0ZW5kIHRhZyBlbGVtZW50XG5cblx0ZGVmIHJvb3Rcblx0XHRAb3duZXJfID8gQG93bmVyXy5yb290IDogc2VsZlxuXG5cdGRlZiBhcHBcblx0XHRyb290LmFwcFxuXG5cbmV4cG9ydCB0YWcgU2l0ZVxuXHRcblx0ZGVmIGFwcFxuXHRcdGRhdGFcblx0XHRcblx0ZGVmIHJvb3Rcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiByb3V0ZXJcblx0XHRhcHAucm91dGVyXG5cdFx0XG5cdGRlZiBsb2FkXG5cdFx0Y29uc29sZS5sb2cgXCJsb2FkaW5nIGFwcC5yb3V0ZXJcIlxuXHRcdFByb21pc2UubmV3IGRvIHxyZXNvbHZlfFxuXHRcdFx0Y29uc29sZS5sb2cgXCJTaXRlI2xvYWRcIlxuXHRcdFx0c2V0VGltZW91dChyZXNvbHZlLDIwMClcblx0XHRcblx0ZGVmIHJlbmRlclxuXHRcdGNvbnNvbGUubG9nIFwicmVuZGVyIHNpdGVcIixhcHAucGF0aFxuXHRcdDxzZWxmPlxuXHRcdFx0PGhlYWRlciNoZWFkZXI+XG5cdFx0XHRcdDxuYXYuY29udGVudD5cblx0XHRcdFx0XHQ8TG9nbz5cblx0XHRcdFx0XHQ8YS50YWIubG9nbyBocmVmPScvaG9tZSc+IDxpPiAnaW1iYSdcblx0XHRcdFx0XHQ8c3Bhbi5ncmVlZHk+XG5cdFx0XHRcdFx0PGEudGFiLmhvbWUgaHJlZj0nL2hvbWUnPiA8aT4gJ2hvbWUnXG5cdFx0XHRcdFx0PGEudGFiLmd1aWRlcyBocmVmPScvZ3VpZGUnPiA8aT4gJ2xlYXJuJ1xuXHRcdFx0XHRcdCMgPGEudGFiLmRvY3MgaHJlZj0nL2RvY3MnPiA8aT4gJ2FwaSdcblx0XHRcdFx0XHQ8YS50YWIuZG9jcyBocmVmPScvZXhhbXBsZXMnPiA8aT4gJ2V4YW1wbGVzJ1xuXHRcdFx0XHRcdCMgPGEudHdpdHRlciBocmVmPSdodHRwOi8vdHdpdHRlci5jb20vaW1iYWpzJz4gPGk+ICd0d2l0dGVyJ1xuXHRcdFx0XHRcdDxhLmdpdGh1YiBocmVmPSdodHRwczovL2dpdGh1Yi5jb20vc29tZWJlZS9pbWJhJz4gPGk+ICdnaXRodWInXG5cdFx0XHRcdFx0IyA8YS5pc3N1ZXMgaHJlZj0naHR0cHM6Ly9naXRodWIuY29tL3NvbWViZWUvaW1iYS9pc3N1ZXMnPiA8aT4gJ2lzc3Vlcydcblx0XHRcdFx0XHQ8YS5tZW51IDp0YXA9J3RvZ2dsZU1lbnUnPiA8Yj5cblx0XHRcdFxuXHRcdFx0PG1haW4+XG5cdFx0XHRcdGlmIHJvdXRlci5zY29wZWQoJy9ob21lJylcblx0XHRcdFx0XHQ8SG9tZVBhZ2U+XG5cdFx0XHRcdGVsaWYgcm91dGVyLnNjb3BlZCgnL2d1aWRlJylcblx0XHRcdFx0XHQ8R3VpZGVzUGFnZVthcHAuZ3VpZGVdPlxuXHRcdFx0XHRlbGlmIHJvdXRlci5zY29wZWQoJy9kb2NzJylcblx0XHRcdFx0XHQ8RG9jc1BhZ2U+XG5cblx0XHRcdDxmb290ZXIjZm9vdGVyPiBcblx0XHRcdFx0PGhyPlxuXHRcdFx0XHQ8LmxmdD4gXCJJbWJhIMKpIDIwMTUtMjAxOFwiXG5cdFx0XHRcdDwucmd0PlxuXHRcdFx0XHRcdDxhIGhyZWY9J2h0dHA6Ly90d2l0dGVyLmNvbS9pbWJhanMnPiAnVHdpdHRlcidcblx0XHRcdFx0XHQ8YSBocmVmPSdodHRwOi8vZ2l0aHViLmNvbS9zb21lYmVlL2ltYmEnPiAnR2l0SHViJ1xuXHRcdFx0XHRcdDxhIGhyZWY9J2h0dHA6Ly9naXRodWIuY29tL3NvbWViZWUvaW1iYS9pc3N1ZXMnPiAnSXNzdWVzJ1xuXHRcdFx0XHRcdDxhIGhyZWY9J2h0dHA6Ly9naXR0ZXIuaW0vc29tZWJlZS9pbWJhJz4gJ0NoYXQnXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvU2l0ZS5pbWJhIiwiaW1wb3J0IFBhZ2UgZnJvbSAnLi9QYWdlJ1xuXG5pbXBvcnQgRXhhbXBsZSBmcm9tICcuL1NuaXBwZXQnXG5pbXBvcnQgTWFya2VkIGZyb20gJy4vTWFya2VkJ1xuaW1wb3J0IFBhdHRlcm4gZnJvbSAnLi9QYXR0ZXJuJ1xuaW1wb3J0IExvZ28gZnJvbSAnLi9Mb2dvJ1xuXG5cbmV4cG9ydCB0YWcgSG9tZVBhZ2UgPCBQYWdlXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmPiA8LmJvZHk+XG5cdFx0XHQ8ZGl2I2hlcm8uZGFyaz5cblx0XHRcdFx0PFBhdHRlcm5AcGF0dGVybj5cblx0XHRcdFx0PC5jb250ZW50PlxuXHRcdFx0XHRcdDxNYXJrZWRbYXBwLmd1aWRlWydoZXJvJ11dPlxuXHRcdFx0XHRcdDxuYXYuYnV0dG9ucz5cblx0XHRcdFx0XHRcdCMgPGEuYnV0dG9uLnRyeSBocmVmPScjJz4gXCJUcnkgb25saW5lXCJcblx0XHRcdFx0XHRcdDxhLmJ1dHRvbi5zdGFydCBocmVmPScvZ3VpZGUnPiBcIkdldCBzdGFydGVkXCJcblx0XHRcdFx0XHRcdDxhLmJ1dHRvbi5zdGFydCBocmVmPScvZXhhbXBsZXMnPiBcIkV4YW1wbGVzXCJcblx0XHRcdFx0XHRcdDxhLmJ1dHRvbi5naXRodWIgaHJlZj0naHR0cHM6Ly9naXRodWIuY29tL3NvbWViZWUvaW1iYSc+IFwiR2l0aHViXCJcblxuXHRcdFx0XHQjIDxoZXJvc25pcHBldC5oZXJvLmRhcmsgc3JjPScvaG9tZS9leGFtcGxlcy9oZXJvLmltYmEnPlxuXHRcdFx0PC5jb250ZW50PlxuXHRcdFx0XHQ8TWFya2VkLnNlY3Rpb24ubWQud2VsY29tZS5odWdlLmxpZ2h0PiBcIlwiXCJcblx0XHRcdFx0XHQjIENyZWF0ZSBjb21wbGV4IHdlYiBhcHBzIHdpdGggZWFzZSFcblxuXHRcdFx0XHRcdEltYmEgaXMgYSBuZXcgcHJvZ3JhbW1pbmcgbGFuZ3VhZ2UgZm9yIHRoZSB3ZWIgdGhhdCBjb21waWxlcyB0byBoaWdobHkgXG5cdFx0XHRcdFx0cGVyZm9ybWFudCBhbmQgcmVhZGFibGUgSmF2YVNjcmlwdC4gSXQgaGFzIGxhbmd1YWdlIGxldmVsIHN1cHBvcnQgZm9yIGRlZmluaW5nLCBcblx0XHRcdFx0XHRleHRlbmRpbmcsIHN1YmNsYXNzaW5nLCBpbnN0YW50aWF0aW5nIGFuZCByZW5kZXJpbmcgZG9tIG5vZGVzLiBGb3IgYSBzaW1wbGUgXG5cdFx0XHRcdFx0YXBwbGljYXRpb24gbGlrZSBUb2RvTVZDLCBpdCBpcyBtb3JlIHRoYW4gXG5cdFx0XHRcdFx0WzEwIHRpbWVzIGZhc3RlciB0aGFuIFJlYWN0XShodHRwOi8vc29tZWJlZS5naXRodWIuaW8vdG9kb212Yy1yZW5kZXItYmVuY2htYXJrL2luZGV4Lmh0bWwpIFxuXHRcdFx0XHRcdHdpdGggbGVzcyBjb2RlLCBhbmQgYSBtdWNoIHNtYWxsZXIgbGlicmFyeS5cblxuXHRcdFx0XHRcdC0tLVxuXG5cdFx0XHRcdFx0LSAjIyBJbWJhLmluc3BpcmF0aW9uXG5cdFx0XHRcdFx0ICBJbWJhIGJyaW5ncyB0aGUgYmVzdCBmcm9tIFJ1YnksIFB5dGhvbiwgYW5kIFJlYWN0ICgrIEpTWCkgdG9nZXRoZXIgaW4gYSBjbGVhbiBsYW5ndWFnZSBhbmQgcnVudGltZS5cblxuXHRcdFx0XHRcdC0gIyMgSW1iYS5pbnRlcm9wZXJhYmlsaXR5XG5cdFx0XHRcdFx0ICBJbWJhIGNvbXBpbGVzIGRvd24gdG8gY2xlYW4gYW5kIHJlYWRhYmxlIEphdmFTY3JpcHQuIFVzZSBhbnkgSlMgbGlicmFyeSBpbiBJbWJhIGFuZCB2aWNhLXZlcnNhLlxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC0gIyMgSW1iYS5wZXJmb3JtYW5jZVxuXHRcdFx0XHRcdCAgQnVpbGQgeW91ciBhcHBsaWNhdGlvbiB2aWV3cyB1c2luZyBJbWJhJ3MgbmF0aXZlIHRhZ3MgZm9yIHVucHJlY2VkZW50ZWQgcGVyZm9ybWFuY2UuXG5cblx0XHRcdFx0XHRcIlwiXCJcblxuXHRcdFx0XHQjIDxFeGFtcGxlLmRhcmsgaGVhZGluZz1cIlNpbXBsZSByZW1pbmRlcnNcIiBzcmM9Jy9ob21lL2V4YW1wbGVzL3JlbWluZGVycy5pbWJhJz5cblxuXHRcdFx0XHQ8TWFya2VkLnNlY3Rpb24ubWQ+IFwiXCJcIlxuXHRcdFx0XHRcdCMjIFJldXNhYmxlIGNvbXBvbmVudHNcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRBIGN1c3RvbSB0YWcgLyBjb21wb25lbnQgY2FuIG1haW50YWluIGludGVybmFsIHN0YXRlIGFuZCBjb250cm9sIGhvdyB0byByZW5kZXIgaXRzZWxmLlxuXHRcdFx0XHRcdFdpdGggdGhlIHBlcmZvcm1hbmNlIG9mIERPTSByZWNvbmNpbGlhdGlvbiBpbiBJbWJhLCB5b3UgY2FuIHVzZSBvbmUtd2F5IGRlY2xhcmF0aXZlIGJpbmRpbmdzLFxuXHRcdFx0XHRcdGV2ZW4gZm9yIGFuaW1hdGlvbnMuIFdyaXRlIGFsbCB5b3VyIHZpZXdzIGluIGEgc3RyYWlnaHQtZm9yd2FyZCBsaW5lYXIgZmFzaGlvbiBhcyBpZiB5b3UgY291bGRcblx0XHRcdFx0XHRyZXJlbmRlciB5b3VyIHdob2xlIGFwcGxpY2F0aW9uIG9uICoqZXZlcnkgc2luZ2xlKiogZGF0YS9zdGF0ZSBjaGFuZ2UuXG5cdFx0XHRcdFx0XCJcIlwiXG5cblx0XHRcdFx0IyA8RXhhbXBsZS5kYXJrIGhlYWRpbmc9XCJXb3JsZCBjbG9ja1wiIHNyYz0nL2hvbWUvZXhhbXBsZXMvY2xvY2suaW1iYSc+XG5cblx0XHRcdFx0PE1hcmtlZC5zZWN0aW9uLm1kPiBcIlwiXCJcblx0XHRcdFx0XHQjIyBFeHRlbmQgbmF0aXZlIHRhZ3Ncblx0XHRcdFx0XHRcblx0XHRcdFx0XHRJbiBhZGRpdGlvbiB0byBkZWZpbmluZyBjdXN0b20gdGFncywgeW91IGNhbiBhbHNvIGV4dGVuZCBuYXRpdmUgdGFncywgb3IgaW5oZXJpdCBmcm9tIHRoZW0uXG5cdFx0XHRcdFx0QmluZGluZyB0byBkb20gZXZlbnRzIGlzIGFzIHNpbXBsZSBhcyBkZWZpbmluZyBtZXRob2RzIG9uIHlvdXIgdGFnczsgYWxsIGV2ZW50cyB3aWxsIGJlXG5cdFx0XHRcdFx0ZWZmaWNpZW50bHkgZGVsZWdhdGVkIGFuZCBoYW5kbGVkIGJ5IEltYmEuIExldCdzIGRlZmluZSBhIHNpbXBsZSBza2V0Y2hwYWQuLi5cblx0XHRcdFx0XHRcIlwiXCJcblxuXHRcdFx0XHQjIDxFeGFtcGxlLmRhcmsgaGVhZGluZz1cIkN1c3RvbSBjYW52YXNcIiBzcmM9Jy9ob21lL2V4YW1wbGVzL2NhbnZhcy5pbWJhJz5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvSG9tZVBhZ2UuaW1iYSIsIiMgZGVmaW5lIHJlbmRlcmVyXG52YXIgbWFya2VkID0gcmVxdWlyZSAnbWFya2VkJ1xudmFyIG1kciA9IG1hcmtlZC5SZW5kZXJlci5uZXdcblxuZGVmIG1kci5oZWFkaW5nIHRleHQsIGx2bFxuXHRcIjxoe2x2bH0+e3RleHR9PC9oe2x2bH0+XCJcblx0XG5pbXBvcnQgU25pcHBldCBmcm9tICcuL1NuaXBwZXQnXG5cdFx0XG5leHBvcnQgdGFnIE1hcmtlZFxuXHRkZWYgcmVuZGVyZXJcblx0XHRzZWxmXG5cblx0ZGVmIHNldFRleHQgdGV4dFxuXHRcdGlmIHRleHQgIT0gQHRleHRcblx0XHRcdEB0ZXh0ID0gdGV4dFxuXHRcdFx0ZG9tOmlubmVySFRNTCA9IG1hcmtlZCh0ZXh0LCByZW5kZXJlcjogbWRyKVxuXHRcdHNlbGZcblxuXHRkZWYgc2V0Q29udGVudCB2YWwsdHlwXG5cdFx0c2V0VGV4dCh2YWwsMClcblx0XHRyZXR1cm4gc2VsZlxuXHRcdFxuXHRkZWYgc2V0RGF0YSBkYXRhXG5cdFx0aWYgZGF0YSBhbmQgZGF0YSAhPSBAZGF0YVxuXHRcdFx0QGRhdGEgPSBkYXRhXG5cdFx0XHRkb206aW5uZXJIVE1MID0gZGF0YTpib2R5XG5cdFx0XHRhd2FrZW5TbmlwcGV0cyBpZiAkd2ViJFxuXHRcdHNlbGZcblx0XHRcdFxuXHRkZWYgYXdha2VuU25pcHBldHNcblx0XHRmb3IgaXRlbSBpbiBkb20ucXVlcnlTZWxlY3RvckFsbCgnLnNuaXBwZXQnKVxuXHRcdFx0bGV0IGNvZGUgPSBpdGVtOnRleHRDb250ZW50XG5cdFx0XHRpZiBjb2RlLmluZGV4T2YoJ0ltYmEubW91bnQnKSA+PSAwXG5cdFx0XHRcdFNuaXBwZXQucmVwbGFjZShpdGVtKVxuXHRcdHNlbGZcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvTWFya2VkLmltYmEiLCIvKipcbiAqIG1hcmtlZCAtIGEgbWFya2Rvd24gcGFyc2VyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxNCwgQ2hyaXN0b3BoZXIgSmVmZnJleS4gKE1JVCBMaWNlbnNlZClcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9jaGpqL21hcmtlZFxuICovXG5cbjsoZnVuY3Rpb24oKSB7XG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQmxvY2stTGV2ZWwgR3JhbW1hclxuICovXG5cbnZhciBibG9jayA9IHtcbiAgbmV3bGluZTogL15cXG4rLyxcbiAgY29kZTogL14oIHs0fVteXFxuXStcXG4qKSsvLFxuICBmZW5jZXM6IG5vb3AsXG4gIGhyOiAvXiggKlstKl9dKXszLH0gKig/Olxcbit8JCkvLFxuICBoZWFkaW5nOiAvXiAqKCN7MSw2fSkgKihbXlxcbl0rPykgKiMqICooPzpcXG4rfCQpLyxcbiAgbnB0YWJsZTogbm9vcCxcbiAgbGhlYWRpbmc6IC9eKFteXFxuXSspXFxuICooPXwtKXsyLH0gKig/Olxcbit8JCkvLFxuICBibG9ja3F1b3RlOiAvXiggKj5bXlxcbl0rKFxcbig/IWRlZilbXlxcbl0rKSpcXG4qKSsvLFxuICBsaXN0OiAvXiggKikoYnVsbCkgW1xcc1xcU10rPyg/OmhyfGRlZnxcXG57Mix9KD8hICkoPyFcXDFidWxsIClcXG4qfFxccyokKS8sXG4gIGh0bWw6IC9eICooPzpjb21tZW50ICooPzpcXG58XFxzKiQpfGNsb3NlZCAqKD86XFxuezIsfXxcXHMqJCl8Y2xvc2luZyAqKD86XFxuezIsfXxcXHMqJCkpLyxcbiAgZGVmOiAvXiAqXFxbKFteXFxdXSspXFxdOiAqPD8oW15cXHM+XSspPj8oPzogK1tcIihdKFteXFxuXSspW1wiKV0pPyAqKD86XFxuK3wkKS8sXG4gIHRhYmxlOiBub29wLFxuICBwYXJhZ3JhcGg6IC9eKCg/OlteXFxuXStcXG4/KD8haHJ8aGVhZGluZ3xsaGVhZGluZ3xibG9ja3F1b3RlfHRhZ3xkZWYpKSspXFxuKi8sXG4gIHRleHQ6IC9eW15cXG5dKy9cbn07XG5cbmJsb2NrLmJ1bGxldCA9IC8oPzpbKistXXxcXGQrXFwuKS87XG5ibG9jay5pdGVtID0gL14oICopKGJ1bGwpIFteXFxuXSooPzpcXG4oPyFcXDFidWxsIClbXlxcbl0qKSovO1xuYmxvY2suaXRlbSA9IHJlcGxhY2UoYmxvY2suaXRlbSwgJ2dtJylcbiAgKC9idWxsL2csIGJsb2NrLmJ1bGxldClcbiAgKCk7XG5cbmJsb2NrLmxpc3QgPSByZXBsYWNlKGJsb2NrLmxpc3QpXG4gICgvYnVsbC9nLCBibG9jay5idWxsZXQpXG4gICgnaHInLCAnXFxcXG4rKD89XFxcXDE/KD86Wy0qX10gKil7Myx9KD86XFxcXG4rfCQpKScpXG4gICgnZGVmJywgJ1xcXFxuKyg/PScgKyBibG9jay5kZWYuc291cmNlICsgJyknKVxuICAoKTtcblxuYmxvY2suYmxvY2txdW90ZSA9IHJlcGxhY2UoYmxvY2suYmxvY2txdW90ZSlcbiAgKCdkZWYnLCBibG9jay5kZWYpXG4gICgpO1xuXG5ibG9jay5fdGFnID0gJyg/ISg/OidcbiAgKyAnYXxlbXxzdHJvbmd8c21hbGx8c3xjaXRlfHF8ZGZufGFiYnJ8ZGF0YXx0aW1lfGNvZGUnXG4gICsgJ3x2YXJ8c2FtcHxrYmR8c3VifHN1cHxpfGJ8dXxtYXJrfHJ1Ynl8cnR8cnB8YmRpfGJkbydcbiAgKyAnfHNwYW58YnJ8d2JyfGluc3xkZWx8aW1nKVxcXFxiKVxcXFx3Kyg/ITovfFteXFxcXHdcXFxcc0BdKkApXFxcXGInO1xuXG5ibG9jay5odG1sID0gcmVwbGFjZShibG9jay5odG1sKVxuICAoJ2NvbW1lbnQnLCAvPCEtLVtcXHNcXFNdKj8tLT4vKVxuICAoJ2Nsb3NlZCcsIC88KHRhZylbXFxzXFxTXSs/PFxcL1xcMT4vKVxuICAoJ2Nsb3NpbmcnLCAvPHRhZyg/OlwiW15cIl0qXCJ8J1teJ10qJ3xbXidcIj5dKSo/Pi8pXG4gICgvdGFnL2csIGJsb2NrLl90YWcpXG4gICgpO1xuXG5ibG9jay5wYXJhZ3JhcGggPSByZXBsYWNlKGJsb2NrLnBhcmFncmFwaClcbiAgKCdocicsIGJsb2NrLmhyKVxuICAoJ2hlYWRpbmcnLCBibG9jay5oZWFkaW5nKVxuICAoJ2xoZWFkaW5nJywgYmxvY2subGhlYWRpbmcpXG4gICgnYmxvY2txdW90ZScsIGJsb2NrLmJsb2NrcXVvdGUpXG4gICgndGFnJywgJzwnICsgYmxvY2suX3RhZylcbiAgKCdkZWYnLCBibG9jay5kZWYpXG4gICgpO1xuXG4vKipcbiAqIE5vcm1hbCBCbG9jayBHcmFtbWFyXG4gKi9cblxuYmxvY2subm9ybWFsID0gbWVyZ2Uoe30sIGJsb2NrKTtcblxuLyoqXG4gKiBHRk0gQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLmdmbSA9IG1lcmdlKHt9LCBibG9jay5ub3JtYWwsIHtcbiAgZmVuY2VzOiAvXiAqKGB7Myx9fH57Myx9KVsgXFwuXSooXFxTKyk/ICpcXG4oW1xcc1xcU10qPylcXHMqXFwxICooPzpcXG4rfCQpLyxcbiAgcGFyYWdyYXBoOiAvXi8sXG4gIGhlYWRpbmc6IC9eICooI3sxLDZ9KSArKFteXFxuXSs/KSAqIyogKig/Olxcbit8JCkvXG59KTtcblxuYmxvY2suZ2ZtLnBhcmFncmFwaCA9IHJlcGxhY2UoYmxvY2sucGFyYWdyYXBoKVxuICAoJyg/IScsICcoPyEnXG4gICAgKyBibG9jay5nZm0uZmVuY2VzLnNvdXJjZS5yZXBsYWNlKCdcXFxcMScsICdcXFxcMicpICsgJ3wnXG4gICAgKyBibG9jay5saXN0LnNvdXJjZS5yZXBsYWNlKCdcXFxcMScsICdcXFxcMycpICsgJ3wnKVxuICAoKTtcblxuLyoqXG4gKiBHRk0gKyBUYWJsZXMgQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLnRhYmxlcyA9IG1lcmdlKHt9LCBibG9jay5nZm0sIHtcbiAgbnB0YWJsZTogL14gKihcXFMuKlxcfC4qKVxcbiAqKFstOl0rICpcXHxbLXwgOl0qKVxcbigoPzouKlxcfC4qKD86XFxufCQpKSopXFxuKi8sXG4gIHRhYmxlOiAvXiAqXFx8KC4rKVxcbiAqXFx8KCAqWy06XStbLXwgOl0qKVxcbigoPzogKlxcfC4qKD86XFxufCQpKSopXFxuKi9cbn0pO1xuXG4vKipcbiAqIEJsb2NrIExleGVyXG4gKi9cblxuZnVuY3Rpb24gTGV4ZXIob3B0aW9ucykge1xuICB0aGlzLnRva2VucyA9IFtdO1xuICB0aGlzLnRva2Vucy5saW5rcyA9IHt9O1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IG1hcmtlZC5kZWZhdWx0cztcbiAgdGhpcy5ydWxlcyA9IGJsb2NrLm5vcm1hbDtcblxuICBpZiAodGhpcy5vcHRpb25zLmdmbSkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMudGFibGVzKSB7XG4gICAgICB0aGlzLnJ1bGVzID0gYmxvY2sudGFibGVzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJ1bGVzID0gYmxvY2suZ2ZtO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEV4cG9zZSBCbG9jayBSdWxlc1xuICovXG5cbkxleGVyLnJ1bGVzID0gYmxvY2s7XG5cbi8qKlxuICogU3RhdGljIExleCBNZXRob2RcbiAqL1xuXG5MZXhlci5sZXggPSBmdW5jdGlvbihzcmMsIG9wdGlvbnMpIHtcbiAgdmFyIGxleGVyID0gbmV3IExleGVyKG9wdGlvbnMpO1xuICByZXR1cm4gbGV4ZXIubGV4KHNyYyk7XG59O1xuXG4vKipcbiAqIFByZXByb2Nlc3NpbmdcbiAqL1xuXG5MZXhlci5wcm90b3R5cGUubGV4ID0gZnVuY3Rpb24oc3JjKSB7XG4gIHNyYyA9IHNyY1xuICAgIC5yZXBsYWNlKC9cXHJcXG58XFxyL2csICdcXG4nKVxuICAgIC5yZXBsYWNlKC9cXHQvZywgJyAgICAnKVxuICAgIC5yZXBsYWNlKC9cXHUwMGEwL2csICcgJylcbiAgICAucmVwbGFjZSgvXFx1MjQyNC9nLCAnXFxuJyk7XG5cbiAgcmV0dXJuIHRoaXMudG9rZW4oc3JjLCB0cnVlKTtcbn07XG5cbi8qKlxuICogTGV4aW5nXG4gKi9cblxuTGV4ZXIucHJvdG90eXBlLnRva2VuID0gZnVuY3Rpb24oc3JjLCB0b3AsIGJxKSB7XG4gIHZhciBzcmMgPSBzcmMucmVwbGFjZSgvXiArJC9nbSwgJycpXG4gICAgLCBuZXh0XG4gICAgLCBsb29zZVxuICAgICwgY2FwXG4gICAgLCBidWxsXG4gICAgLCBiXG4gICAgLCBpdGVtXG4gICAgLCBzcGFjZVxuICAgICwgaVxuICAgICwgbDtcblxuICB3aGlsZSAoc3JjKSB7XG4gICAgLy8gbmV3bGluZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLm5ld2xpbmUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgaWYgKGNhcFswXS5sZW5ndGggPiAxKSB7XG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdzcGFjZSdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gY29kZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmNvZGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgY2FwID0gY2FwWzBdLnJlcGxhY2UoL14gezR9L2dtLCAnJyk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2NvZGUnLFxuICAgICAgICB0ZXh0OiAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgICAgPyBjYXAucmVwbGFjZSgvXFxuKyQvLCAnJylcbiAgICAgICAgICA6IGNhcFxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBmZW5jZXMgKGdmbSlcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5mZW5jZXMuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdjb2RlJyxcbiAgICAgICAgbGFuZzogY2FwWzJdLFxuICAgICAgICB0ZXh0OiBjYXBbM10gfHwgJydcbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gaGVhZGluZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmhlYWRpbmcuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgZGVwdGg6IGNhcFsxXS5sZW5ndGgsXG4gICAgICAgIHRleHQ6IGNhcFsyXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0YWJsZSBubyBsZWFkaW5nIHBpcGUgKGdmbSlcbiAgICBpZiAodG9wICYmIChjYXAgPSB0aGlzLnJ1bGVzLm5wdGFibGUuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcblxuICAgICAgaXRlbSA9IHtcbiAgICAgICAgdHlwZTogJ3RhYmxlJyxcbiAgICAgICAgaGVhZGVyOiBjYXBbMV0ucmVwbGFjZSgvXiAqfCAqXFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBhbGlnbjogY2FwWzJdLnJlcGxhY2UoL14gKnxcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGNlbGxzOiBjYXBbM10ucmVwbGFjZSgvXFxuJC8sICcnKS5zcGxpdCgnXFxuJylcbiAgICAgIH07XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmFsaWduLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICgvXiAqLSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdyaWdodCc7XG4gICAgICAgIH0gZWxzZSBpZiAoL14gKjotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2NlbnRlcic7XG4gICAgICAgIH0gZWxzZSBpZiAoL14gKjotKyAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnbGVmdCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlbS5jZWxsc1tpXSA9IGl0ZW0uY2VsbHNbaV0uc3BsaXQoLyAqXFx8ICovKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b2tlbnMucHVzaChpdGVtKTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGhlYWRpbmdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5saGVhZGluZy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2hlYWRpbmcnLFxuICAgICAgICBkZXB0aDogY2FwWzJdID09PSAnPScgPyAxIDogMixcbiAgICAgICAgdGV4dDogY2FwWzFdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGhyXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuaHIuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdocidcbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gYmxvY2txdW90ZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrcXVvdGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2Jsb2NrcXVvdGVfc3RhcnQnXG4gICAgICB9KTtcblxuICAgICAgY2FwID0gY2FwWzBdLnJlcGxhY2UoL14gKj4gPy9nbSwgJycpO1xuXG4gICAgICAvLyBQYXNzIGB0b3BgIHRvIGtlZXAgdGhlIGN1cnJlbnRcbiAgICAgIC8vIFwidG9wbGV2ZWxcIiBzdGF0ZS4gVGhpcyBpcyBleGFjdGx5XG4gICAgICAvLyBob3cgbWFya2Rvd24ucGwgd29ya3MuXG4gICAgICB0aGlzLnRva2VuKGNhcCwgdG9wLCB0cnVlKTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdibG9ja3F1b3RlX2VuZCdcbiAgICAgIH0pO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsaXN0XG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubGlzdC5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBidWxsID0gY2FwWzJdO1xuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2xpc3Rfc3RhcnQnLFxuICAgICAgICBvcmRlcmVkOiBidWxsLmxlbmd0aCA+IDFcbiAgICAgIH0pO1xuXG4gICAgICAvLyBHZXQgZWFjaCB0b3AtbGV2ZWwgaXRlbS5cbiAgICAgIGNhcCA9IGNhcFswXS5tYXRjaCh0aGlzLnJ1bGVzLml0ZW0pO1xuXG4gICAgICBuZXh0ID0gZmFsc2U7XG4gICAgICBsID0gY2FwLmxlbmd0aDtcbiAgICAgIGkgPSAwO1xuXG4gICAgICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpdGVtID0gY2FwW2ldO1xuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgbGlzdCBpdGVtJ3MgYnVsbGV0XG4gICAgICAgIC8vIHNvIGl0IGlzIHNlZW4gYXMgdGhlIG5leHQgdG9rZW4uXG4gICAgICAgIHNwYWNlID0gaXRlbS5sZW5ndGg7XG4gICAgICAgIGl0ZW0gPSBpdGVtLnJlcGxhY2UoL14gKihbKistXXxcXGQrXFwuKSArLywgJycpO1xuXG4gICAgICAgIC8vIE91dGRlbnQgd2hhdGV2ZXIgdGhlXG4gICAgICAgIC8vIGxpc3QgaXRlbSBjb250YWlucy4gSGFja3kuXG4gICAgICAgIGlmICh+aXRlbS5pbmRleE9mKCdcXG4gJykpIHtcbiAgICAgICAgICBzcGFjZSAtPSBpdGVtLmxlbmd0aDtcbiAgICAgICAgICBpdGVtID0gIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICAgICAgPyBpdGVtLnJlcGxhY2UobmV3IFJlZ0V4cCgnXiB7MSwnICsgc3BhY2UgKyAnfScsICdnbScpLCAnJylcbiAgICAgICAgICAgIDogaXRlbS5yZXBsYWNlKC9eIHsxLDR9L2dtLCAnJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZXRlcm1pbmUgd2hldGhlciB0aGUgbmV4dCBsaXN0IGl0ZW0gYmVsb25ncyBoZXJlLlxuICAgICAgICAvLyBCYWNrcGVkYWwgaWYgaXQgZG9lcyBub3QgYmVsb25nIGluIHRoaXMgbGlzdC5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zbWFydExpc3RzICYmIGkgIT09IGwgLSAxKSB7XG4gICAgICAgICAgYiA9IGJsb2NrLmJ1bGxldC5leGVjKGNhcFtpICsgMV0pWzBdO1xuICAgICAgICAgIGlmIChidWxsICE9PSBiICYmICEoYnVsbC5sZW5ndGggPiAxICYmIGIubGVuZ3RoID4gMSkpIHtcbiAgICAgICAgICAgIHNyYyA9IGNhcC5zbGljZShpICsgMSkuam9pbignXFxuJykgKyBzcmM7XG4gICAgICAgICAgICBpID0gbCAtIDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgaXRlbSBpcyBsb29zZSBvciBub3QuXG4gICAgICAgIC8vIFVzZTogLyhefFxcbikoPyEgKVteXFxuXStcXG5cXG4oPyFcXHMqJCkvXG4gICAgICAgIC8vIGZvciBkaXNjb3VudCBiZWhhdmlvci5cbiAgICAgICAgbG9vc2UgPSBuZXh0IHx8IC9cXG5cXG4oPyFcXHMqJCkvLnRlc3QoaXRlbSk7XG4gICAgICAgIGlmIChpICE9PSBsIC0gMSkge1xuICAgICAgICAgIG5leHQgPSBpdGVtLmNoYXJBdChpdGVtLmxlbmd0aCAtIDEpID09PSAnXFxuJztcbiAgICAgICAgICBpZiAoIWxvb3NlKSBsb29zZSA9IG5leHQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBsb29zZVxuICAgICAgICAgICAgPyAnbG9vc2VfaXRlbV9zdGFydCdcbiAgICAgICAgICAgIDogJ2xpc3RfaXRlbV9zdGFydCdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUmVjdXJzZS5cbiAgICAgICAgdGhpcy50b2tlbihpdGVtLCBmYWxzZSwgYnEpO1xuXG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdsaXN0X2l0ZW1fZW5kJ1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdsaXN0X2VuZCdcbiAgICAgIH0pO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBodG1sXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuaHRtbC5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogdGhpcy5vcHRpb25zLnNhbml0aXplXG4gICAgICAgICAgPyAncGFyYWdyYXBoJ1xuICAgICAgICAgIDogJ2h0bWwnLFxuICAgICAgICBwcmU6ICF0aGlzLm9wdGlvbnMuc2FuaXRpemVyXG4gICAgICAgICAgJiYgKGNhcFsxXSA9PT0gJ3ByZScgfHwgY2FwWzFdID09PSAnc2NyaXB0JyB8fCBjYXBbMV0gPT09ICdzdHlsZScpLFxuICAgICAgICB0ZXh0OiBjYXBbMF1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZGVmXG4gICAgaWYgKCghYnEgJiYgdG9wKSAmJiAoY2FwID0gdGhpcy5ydWxlcy5kZWYuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLmxpbmtzW2NhcFsxXS50b0xvd2VyQ2FzZSgpXSA9IHtcbiAgICAgICAgaHJlZjogY2FwWzJdLFxuICAgICAgICB0aXRsZTogY2FwWzNdXG4gICAgICB9O1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGFibGUgKGdmbSlcbiAgICBpZiAodG9wICYmIChjYXAgPSB0aGlzLnJ1bGVzLnRhYmxlLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG5cbiAgICAgIGl0ZW0gPSB7XG4gICAgICAgIHR5cGU6ICd0YWJsZScsXG4gICAgICAgIGhlYWRlcjogY2FwWzFdLnJlcGxhY2UoL14gKnwgKlxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgYWxpZ246IGNhcFsyXS5yZXBsYWNlKC9eICp8XFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBjZWxsczogY2FwWzNdLnJlcGxhY2UoLyg/OiAqXFx8ICopP1xcbiQvLCAnJykuc3BsaXQoJ1xcbicpXG4gICAgICB9O1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5hbGlnbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAncmlnaHQnO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdjZW50ZXInO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSsgKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2xlZnQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZW0uY2VsbHNbaV0gPSBpdGVtLmNlbGxzW2ldXG4gICAgICAgICAgLnJlcGxhY2UoL14gKlxcfCAqfCAqXFx8ICokL2csICcnKVxuICAgICAgICAgIC5zcGxpdCgvICpcXHwgKi8pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKGl0ZW0pO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0b3AtbGV2ZWwgcGFyYWdyYXBoXG4gICAgaWYgKHRvcCAmJiAoY2FwID0gdGhpcy5ydWxlcy5wYXJhZ3JhcGguZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAncGFyYWdyYXBoJyxcbiAgICAgICAgdGV4dDogY2FwWzFdLmNoYXJBdChjYXBbMV0ubGVuZ3RoIC0gMSkgPT09ICdcXG4nXG4gICAgICAgICAgPyBjYXBbMV0uc2xpY2UoMCwgLTEpXG4gICAgICAgICAgOiBjYXBbMV1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGV4dFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnRleHQuZXhlYyhzcmMpKSB7XG4gICAgICAvLyBUb3AtbGV2ZWwgc2hvdWxkIG5ldmVyIHJlYWNoIGhlcmUuXG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgdGV4dDogY2FwWzBdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChzcmMpIHtcbiAgICAgIHRocm93IG5ld1xuICAgICAgICBFcnJvcignSW5maW5pdGUgbG9vcCBvbiBieXRlOiAnICsgc3JjLmNoYXJDb2RlQXQoMCkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzLnRva2Vucztcbn07XG5cbi8qKlxuICogSW5saW5lLUxldmVsIEdyYW1tYXJcbiAqL1xuXG52YXIgaW5saW5lID0ge1xuICBlc2NhcGU6IC9eXFxcXChbXFxcXGAqe31cXFtcXF0oKSMrXFwtLiFfPl0pLyxcbiAgYXV0b2xpbms6IC9ePChbXiA8Pl0rKEB8OlxcLylbXiA8Pl0rKT4vLFxuICB1cmw6IG5vb3AsXG4gIHRhZzogL148IS0tW1xcc1xcU10qPy0tPnxePFxcLz9cXHcrKD86XCJbXlwiXSpcInwnW14nXSonfFtePCdcIj5dKSo/Pi8sXG4gIGxpbms6IC9eIT9cXFsoaW5zaWRlKVxcXVxcKGhyZWZcXCkvLFxuICByZWZsaW5rOiAvXiE/XFxbKGluc2lkZSlcXF1cXHMqXFxbKFteXFxdXSopXFxdLyxcbiAgbm9saW5rOiAvXiE/XFxbKCg/OlxcW1teXFxdXSpcXF18W15cXFtcXF1dKSopXFxdLyxcbiAgc3Ryb25nOiAvXl9fKFtcXHNcXFNdKz8pX18oPyFfKXxeXFwqXFwqKFtcXHNcXFNdKz8pXFwqXFwqKD8hXFwqKS8sXG4gIGVtOiAvXlxcYl8oKD86W15fXXxfXykrPylfXFxifF5cXCooKD86XFwqXFwqfFtcXHNcXFNdKSs/KVxcKig/IVxcKikvLFxuICBjb2RlOiAvXihgKykoW1xcc1xcU10qP1teYF0pXFwxKD8hYCkvLFxuICBicjogL14gezIsfVxcbig/IVxccyokKS8sXG4gIGRlbDogbm9vcCxcbiAgdGV4dDogL15bXFxzXFxTXSs/KD89W1xcXFw8IVxcW18qYF18IHsyLH1cXG58JCkvXG59O1xuXG5pbmxpbmUuX2luc2lkZSA9IC8oPzpcXFtbXlxcXV0qXFxdfFxcXFxbXFxbXFxdXXxbXlxcW1xcXV18XFxdKD89W15cXFtdKlxcXSkpKi87XG5pbmxpbmUuX2hyZWYgPSAvXFxzKjw/KFtcXHNcXFNdKj8pPj8oPzpcXHMrWydcIl0oW1xcc1xcU10qPylbJ1wiXSk/XFxzKi87XG5cbmlubGluZS5saW5rID0gcmVwbGFjZShpbmxpbmUubGluaylcbiAgKCdpbnNpZGUnLCBpbmxpbmUuX2luc2lkZSlcbiAgKCdocmVmJywgaW5saW5lLl9ocmVmKVxuICAoKTtcblxuaW5saW5lLnJlZmxpbmsgPSByZXBsYWNlKGlubGluZS5yZWZsaW5rKVxuICAoJ2luc2lkZScsIGlubGluZS5faW5zaWRlKVxuICAoKTtcblxuLyoqXG4gKiBOb3JtYWwgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUubm9ybWFsID0gbWVyZ2Uoe30sIGlubGluZSk7XG5cbi8qKlxuICogUGVkYW50aWMgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUucGVkYW50aWMgPSBtZXJnZSh7fSwgaW5saW5lLm5vcm1hbCwge1xuICBzdHJvbmc6IC9eX18oPz1cXFMpKFtcXHNcXFNdKj9cXFMpX18oPyFfKXxeXFwqXFwqKD89XFxTKShbXFxzXFxTXSo/XFxTKVxcKlxcKig/IVxcKikvLFxuICBlbTogL15fKD89XFxTKShbXFxzXFxTXSo/XFxTKV8oPyFfKXxeXFwqKD89XFxTKShbXFxzXFxTXSo/XFxTKVxcKig/IVxcKikvXG59KTtcblxuLyoqXG4gKiBHRk0gSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUuZ2ZtID0gbWVyZ2Uoe30sIGlubGluZS5ub3JtYWwsIHtcbiAgZXNjYXBlOiByZXBsYWNlKGlubGluZS5lc2NhcGUpKCddKScsICd+fF0pJykoKSxcbiAgdXJsOiAvXihodHRwcz86XFwvXFwvW15cXHM8XStbXjwuLDo7XCInKVxcXVxcc10pLyxcbiAgZGVsOiAvXn5+KD89XFxTKShbXFxzXFxTXSo/XFxTKX5+LyxcbiAgdGV4dDogcmVwbGFjZShpbmxpbmUudGV4dClcbiAgICAoJ118JywgJ35dfCcpXG4gICAgKCd8JywgJ3xodHRwcz86Ly98JylcbiAgICAoKVxufSk7XG5cbi8qKlxuICogR0ZNICsgTGluZSBCcmVha3MgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUuYnJlYWtzID0gbWVyZ2Uoe30sIGlubGluZS5nZm0sIHtcbiAgYnI6IHJlcGxhY2UoaW5saW5lLmJyKSgnezIsfScsICcqJykoKSxcbiAgdGV4dDogcmVwbGFjZShpbmxpbmUuZ2ZtLnRleHQpKCd7Mix9JywgJyonKSgpXG59KTtcblxuLyoqXG4gKiBJbmxpbmUgTGV4ZXIgJiBDb21waWxlclxuICovXG5cbmZ1bmN0aW9uIElubGluZUxleGVyKGxpbmtzLCBvcHRpb25zKSB7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgbWFya2VkLmRlZmF1bHRzO1xuICB0aGlzLmxpbmtzID0gbGlua3M7XG4gIHRoaXMucnVsZXMgPSBpbmxpbmUubm9ybWFsO1xuICB0aGlzLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyIHx8IG5ldyBSZW5kZXJlcjtcbiAgdGhpcy5yZW5kZXJlci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gIGlmICghdGhpcy5saW5rcykge1xuICAgIHRocm93IG5ld1xuICAgICAgRXJyb3IoJ1Rva2VucyBhcnJheSByZXF1aXJlcyBhIGBsaW5rc2AgcHJvcGVydHkuJyk7XG4gIH1cblxuICBpZiAodGhpcy5vcHRpb25zLmdmbSkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuYnJlYWtzKSB7XG4gICAgICB0aGlzLnJ1bGVzID0gaW5saW5lLmJyZWFrcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ydWxlcyA9IGlubGluZS5nZm07XG4gICAgfVxuICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgIHRoaXMucnVsZXMgPSBpbmxpbmUucGVkYW50aWM7XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvc2UgSW5saW5lIFJ1bGVzXG4gKi9cblxuSW5saW5lTGV4ZXIucnVsZXMgPSBpbmxpbmU7XG5cbi8qKlxuICogU3RhdGljIExleGluZy9Db21waWxpbmcgTWV0aG9kXG4gKi9cblxuSW5saW5lTGV4ZXIub3V0cHV0ID0gZnVuY3Rpb24oc3JjLCBsaW5rcywgb3B0aW9ucykge1xuICB2YXIgaW5saW5lID0gbmV3IElubGluZUxleGVyKGxpbmtzLCBvcHRpb25zKTtcbiAgcmV0dXJuIGlubGluZS5vdXRwdXQoc3JjKTtcbn07XG5cbi8qKlxuICogTGV4aW5nL0NvbXBpbGluZ1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5vdXRwdXQgPSBmdW5jdGlvbihzcmMpIHtcbiAgdmFyIG91dCA9ICcnXG4gICAgLCBsaW5rXG4gICAgLCB0ZXh0XG4gICAgLCBocmVmXG4gICAgLCBjYXA7XG5cbiAgd2hpbGUgKHNyYykge1xuICAgIC8vIGVzY2FwZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmVzY2FwZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gY2FwWzFdO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gYXV0b2xpbmtcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5hdXRvbGluay5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBpZiAoY2FwWzJdID09PSAnQCcpIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZShcbiAgICAgICAgICBjYXBbMV0uY2hhckF0KDYpID09PSAnOidcbiAgICAgICAgICA/IHRoaXMubWFuZ2xlKGNhcFsxXS5zdWJzdHJpbmcoNykpXG4gICAgICAgICAgOiB0aGlzLm1hbmdsZShjYXBbMV0pXG4gICAgICAgICk7XG4gICAgICAgIGhyZWYgPSB0aGlzLm1hbmdsZSgnbWFpbHRvOicpICsgdGV4dDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRleHQgPSBlc2NhcGUoY2FwWzFdKTtcbiAgICAgICAgaHJlZiA9IHRleHQ7XG4gICAgICB9XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5saW5rKGhyZWYsIG51bGwsIHRleHQpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdXJsIChnZm0pXG4gICAgaWYgKCF0aGlzLmluTGluayAmJiAoY2FwID0gdGhpcy5ydWxlcy51cmwuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRleHQgPSBlc2NhcGUoY2FwWzFdKTtcbiAgICAgIGhyZWYgPSB0ZXh0O1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIubGluayhocmVmLCBudWxsLCB0ZXh0KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRhZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnRhZy5leGVjKHNyYykpIHtcbiAgICAgIGlmICghdGhpcy5pbkxpbmsgJiYgL148YSAvaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmluTGluayAmJiAvXjxcXC9hPi9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICB0aGlzLmluTGluayA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLm9wdGlvbnMuc2FuaXRpemVcbiAgICAgICAgPyB0aGlzLm9wdGlvbnMuc2FuaXRpemVyXG4gICAgICAgICAgPyB0aGlzLm9wdGlvbnMuc2FuaXRpemVyKGNhcFswXSlcbiAgICAgICAgICA6IGVzY2FwZShjYXBbMF0pXG4gICAgICAgIDogY2FwWzBdXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsaW5rXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubGluay5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLmluTGluayA9IHRydWU7XG4gICAgICBvdXQgKz0gdGhpcy5vdXRwdXRMaW5rKGNhcCwge1xuICAgICAgICBocmVmOiBjYXBbMl0sXG4gICAgICAgIHRpdGxlOiBjYXBbM11cbiAgICAgIH0pO1xuICAgICAgdGhpcy5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHJlZmxpbmssIG5vbGlua1xuICAgIGlmICgoY2FwID0gdGhpcy5ydWxlcy5yZWZsaW5rLmV4ZWMoc3JjKSlcbiAgICAgICAgfHwgKGNhcCA9IHRoaXMucnVsZXMubm9saW5rLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBsaW5rID0gKGNhcFsyXSB8fCBjYXBbMV0pLnJlcGxhY2UoL1xccysvZywgJyAnKTtcbiAgICAgIGxpbmsgPSB0aGlzLmxpbmtzW2xpbmsudG9Mb3dlckNhc2UoKV07XG4gICAgICBpZiAoIWxpbmsgfHwgIWxpbmsuaHJlZikge1xuICAgICAgICBvdXQgKz0gY2FwWzBdLmNoYXJBdCgwKTtcbiAgICAgICAgc3JjID0gY2FwWzBdLnN1YnN0cmluZygxKSArIHNyYztcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICB0aGlzLmluTGluayA9IHRydWU7XG4gICAgICBvdXQgKz0gdGhpcy5vdXRwdXRMaW5rKGNhcCwgbGluayk7XG4gICAgICB0aGlzLmluTGluayA9IGZhbHNlO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gc3Ryb25nXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuc3Ryb25nLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnN0cm9uZyh0aGlzLm91dHB1dChjYXBbMl0gfHwgY2FwWzFdKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBlbVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmVtLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmVtKHRoaXMub3V0cHV0KGNhcFsyXSB8fCBjYXBbMV0pKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGNvZGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5jb2RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmNvZGVzcGFuKGVzY2FwZShjYXBbMl0udHJpbSgpLCB0cnVlKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBiclxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmJyLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmJyKCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBkZWwgKGdmbSlcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5kZWwuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuZGVsKHRoaXMub3V0cHV0KGNhcFsxXSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGV4dFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnRleHQuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIudGV4dChlc2NhcGUodGhpcy5zbWFydHlwYW50cyhjYXBbMF0pKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoc3JjKSB7XG4gICAgICB0aHJvdyBuZXdcbiAgICAgICAgRXJyb3IoJ0luZmluaXRlIGxvb3Agb24gYnl0ZTogJyArIHNyYy5jaGFyQ29kZUF0KDApKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb21waWxlIExpbmtcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUub3V0cHV0TGluayA9IGZ1bmN0aW9uKGNhcCwgbGluaykge1xuICB2YXIgaHJlZiA9IGVzY2FwZShsaW5rLmhyZWYpXG4gICAgLCB0aXRsZSA9IGxpbmsudGl0bGUgPyBlc2NhcGUobGluay50aXRsZSkgOiBudWxsO1xuXG4gIHJldHVybiBjYXBbMF0uY2hhckF0KDApICE9PSAnISdcbiAgICA/IHRoaXMucmVuZGVyZXIubGluayhocmVmLCB0aXRsZSwgdGhpcy5vdXRwdXQoY2FwWzFdKSlcbiAgICA6IHRoaXMucmVuZGVyZXIuaW1hZ2UoaHJlZiwgdGl0bGUsIGVzY2FwZShjYXBbMV0pKTtcbn07XG5cbi8qKlxuICogU21hcnR5cGFudHMgVHJhbnNmb3JtYXRpb25zXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLnNtYXJ0eXBhbnRzID0gZnVuY3Rpb24odGV4dCkge1xuICBpZiAoIXRoaXMub3B0aW9ucy5zbWFydHlwYW50cykgcmV0dXJuIHRleHQ7XG4gIHJldHVybiB0ZXh0XG4gICAgLy8gZW0tZGFzaGVzXG4gICAgLnJlcGxhY2UoLy0tLS9nLCAnXFx1MjAxNCcpXG4gICAgLy8gZW4tZGFzaGVzXG4gICAgLnJlcGxhY2UoLy0tL2csICdcXHUyMDEzJylcbiAgICAvLyBvcGVuaW5nIHNpbmdsZXNcbiAgICAucmVwbGFjZSgvKF58Wy1cXHUyMDE0LyhcXFt7XCJcXHNdKScvZywgJyQxXFx1MjAxOCcpXG4gICAgLy8gY2xvc2luZyBzaW5nbGVzICYgYXBvc3Ryb3BoZXNcbiAgICAucmVwbGFjZSgvJy9nLCAnXFx1MjAxOScpXG4gICAgLy8gb3BlbmluZyBkb3VibGVzXG4gICAgLnJlcGxhY2UoLyhefFstXFx1MjAxNC8oXFxbe1xcdTIwMThcXHNdKVwiL2csICckMVxcdTIwMWMnKVxuICAgIC8vIGNsb3NpbmcgZG91Ymxlc1xuICAgIC5yZXBsYWNlKC9cIi9nLCAnXFx1MjAxZCcpXG4gICAgLy8gZWxsaXBzZXNcbiAgICAucmVwbGFjZSgvXFwuezN9L2csICdcXHUyMDI2Jyk7XG59O1xuXG4vKipcbiAqIE1hbmdsZSBMaW5rc1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5tYW5nbGUgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIGlmICghdGhpcy5vcHRpb25zLm1hbmdsZSkgcmV0dXJuIHRleHQ7XG4gIHZhciBvdXQgPSAnJ1xuICAgICwgbCA9IHRleHQubGVuZ3RoXG4gICAgLCBpID0gMFxuICAgICwgY2g7XG5cbiAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICBjaCA9IHRleHQuY2hhckNvZGVBdChpKTtcbiAgICBpZiAoTWF0aC5yYW5kb20oKSA+IDAuNSkge1xuICAgICAgY2ggPSAneCcgKyBjaC50b1N0cmluZygxNik7XG4gICAgfVxuICAgIG91dCArPSAnJiMnICsgY2ggKyAnOyc7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZW5kZXJlclxuICovXG5cbmZ1bmN0aW9uIFJlbmRlcmVyKG9wdGlvbnMpIHtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbn1cblxuUmVuZGVyZXIucHJvdG90eXBlLmNvZGUgPSBmdW5jdGlvbihjb2RlLCBsYW5nLCBlc2NhcGVkKSB7XG4gIGlmICh0aGlzLm9wdGlvbnMuaGlnaGxpZ2h0KSB7XG4gICAgdmFyIG91dCA9IHRoaXMub3B0aW9ucy5oaWdobGlnaHQoY29kZSwgbGFuZyk7XG4gICAgaWYgKG91dCAhPSBudWxsICYmIG91dCAhPT0gY29kZSkge1xuICAgICAgZXNjYXBlZCA9IHRydWU7XG4gICAgICBjb2RlID0gb3V0O1xuICAgIH1cbiAgfVxuXG4gIGlmICghbGFuZykge1xuICAgIHJldHVybiAnPHByZT48Y29kZT4nXG4gICAgICArIChlc2NhcGVkID8gY29kZSA6IGVzY2FwZShjb2RlLCB0cnVlKSlcbiAgICAgICsgJ1xcbjwvY29kZT48L3ByZT4nO1xuICB9XG5cbiAgcmV0dXJuICc8cHJlPjxjb2RlIGNsYXNzPVwiJ1xuICAgICsgdGhpcy5vcHRpb25zLmxhbmdQcmVmaXhcbiAgICArIGVzY2FwZShsYW5nLCB0cnVlKVxuICAgICsgJ1wiPidcbiAgICArIChlc2NhcGVkID8gY29kZSA6IGVzY2FwZShjb2RlLCB0cnVlKSlcbiAgICArICdcXG48L2NvZGU+PC9wcmU+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5ibG9ja3F1b3RlID0gZnVuY3Rpb24ocXVvdGUpIHtcbiAgcmV0dXJuICc8YmxvY2txdW90ZT5cXG4nICsgcXVvdGUgKyAnPC9ibG9ja3F1b3RlPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaHRtbCA9IGZ1bmN0aW9uKGh0bWwpIHtcbiAgcmV0dXJuIGh0bWw7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaGVhZGluZyA9IGZ1bmN0aW9uKHRleHQsIGxldmVsLCByYXcpIHtcbiAgcmV0dXJuICc8aCdcbiAgICArIGxldmVsXG4gICAgKyAnIGlkPVwiJ1xuICAgICsgdGhpcy5vcHRpb25zLmhlYWRlclByZWZpeFxuICAgICsgcmF3LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15cXHddKy9nLCAnLScpXG4gICAgKyAnXCI+J1xuICAgICsgdGV4dFxuICAgICsgJzwvaCdcbiAgICArIGxldmVsXG4gICAgKyAnPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaHIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMub3B0aW9ucy54aHRtbCA/ICc8aHIvPlxcbicgOiAnPGhyPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUubGlzdCA9IGZ1bmN0aW9uKGJvZHksIG9yZGVyZWQpIHtcbiAgdmFyIHR5cGUgPSBvcmRlcmVkID8gJ29sJyA6ICd1bCc7XG4gIHJldHVybiAnPCcgKyB0eXBlICsgJz5cXG4nICsgYm9keSArICc8LycgKyB0eXBlICsgJz5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmxpc3RpdGVtID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxsaT4nICsgdGV4dCArICc8L2xpPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUucGFyYWdyYXBoID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxwPicgKyB0ZXh0ICsgJzwvcD5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRhYmxlID0gZnVuY3Rpb24oaGVhZGVyLCBib2R5KSB7XG4gIHJldHVybiAnPHRhYmxlPlxcbidcbiAgICArICc8dGhlYWQ+XFxuJ1xuICAgICsgaGVhZGVyXG4gICAgKyAnPC90aGVhZD5cXG4nXG4gICAgKyAnPHRib2R5PlxcbidcbiAgICArIGJvZHlcbiAgICArICc8L3Rib2R5PlxcbidcbiAgICArICc8L3RhYmxlPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGFibGVyb3cgPSBmdW5jdGlvbihjb250ZW50KSB7XG4gIHJldHVybiAnPHRyPlxcbicgKyBjb250ZW50ICsgJzwvdHI+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50YWJsZWNlbGwgPSBmdW5jdGlvbihjb250ZW50LCBmbGFncykge1xuICB2YXIgdHlwZSA9IGZsYWdzLmhlYWRlciA/ICd0aCcgOiAndGQnO1xuICB2YXIgdGFnID0gZmxhZ3MuYWxpZ25cbiAgICA/ICc8JyArIHR5cGUgKyAnIHN0eWxlPVwidGV4dC1hbGlnbjonICsgZmxhZ3MuYWxpZ24gKyAnXCI+J1xuICAgIDogJzwnICsgdHlwZSArICc+JztcbiAgcmV0dXJuIHRhZyArIGNvbnRlbnQgKyAnPC8nICsgdHlwZSArICc+XFxuJztcbn07XG5cbi8vIHNwYW4gbGV2ZWwgcmVuZGVyZXJcblJlbmRlcmVyLnByb3RvdHlwZS5zdHJvbmcgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPHN0cm9uZz4nICsgdGV4dCArICc8L3N0cm9uZz4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmVtID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxlbT4nICsgdGV4dCArICc8L2VtPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuY29kZXNwYW4gPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGNvZGU+JyArIHRleHQgKyAnPC9jb2RlPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuYnIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMub3B0aW9ucy54aHRtbCA/ICc8YnIvPicgOiAnPGJyPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuZGVsID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxkZWw+JyArIHRleHQgKyAnPC9kZWw+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5saW5rID0gZnVuY3Rpb24oaHJlZiwgdGl0bGUsIHRleHQpIHtcbiAgaWYgKHRoaXMub3B0aW9ucy5zYW5pdGl6ZSkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgcHJvdCA9IGRlY29kZVVSSUNvbXBvbmVudCh1bmVzY2FwZShocmVmKSlcbiAgICAgICAgLnJlcGxhY2UoL1teXFx3Ol0vZywgJycpXG4gICAgICAgIC50b0xvd2VyQ2FzZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICBpZiAocHJvdC5pbmRleE9mKCdqYXZhc2NyaXB0OicpID09PSAwIHx8IHByb3QuaW5kZXhPZigndmJzY3JpcHQ6JykgPT09IDAgfHwgcHJvdC5pbmRleE9mKCdkYXRhOicpID09PSAwKSB7XG4gICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gIH1cbiAgaWYgKHRoaXMub3B0aW9ucy5iYXNlVXJsICYmICFvcmlnaW5JbmRlcGVuZGVudFVybC50ZXN0KGhyZWYpKSB7XG4gICAgaHJlZiA9IHJlc29sdmVVcmwodGhpcy5vcHRpb25zLmJhc2VVcmwsIGhyZWYpO1xuICB9XG4gIHZhciBvdXQgPSAnPGEgaHJlZj1cIicgKyBocmVmICsgJ1wiJztcbiAgaWYgKHRpdGxlKSB7XG4gICAgb3V0ICs9ICcgdGl0bGU9XCInICsgdGl0bGUgKyAnXCInO1xuICB9XG4gIG91dCArPSAnPicgKyB0ZXh0ICsgJzwvYT4nO1xuICByZXR1cm4gb3V0O1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmltYWdlID0gZnVuY3Rpb24oaHJlZiwgdGl0bGUsIHRleHQpIHtcbiAgaWYgKHRoaXMub3B0aW9ucy5iYXNlVXJsICYmICFvcmlnaW5JbmRlcGVuZGVudFVybC50ZXN0KGhyZWYpKSB7XG4gICAgaHJlZiA9IHJlc29sdmVVcmwodGhpcy5vcHRpb25zLmJhc2VVcmwsIGhyZWYpO1xuICB9XG4gIHZhciBvdXQgPSAnPGltZyBzcmM9XCInICsgaHJlZiArICdcIiBhbHQ9XCInICsgdGV4dCArICdcIic7XG4gIGlmICh0aXRsZSkge1xuICAgIG91dCArPSAnIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiJztcbiAgfVxuICBvdXQgKz0gdGhpcy5vcHRpb25zLnhodG1sID8gJy8+JyA6ICc+JztcbiAgcmV0dXJuIG91dDtcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50ZXh0ID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gdGV4dDtcbn07XG5cbi8qKlxuICogUGFyc2luZyAmIENvbXBpbGluZ1xuICovXG5cbmZ1bmN0aW9uIFBhcnNlcihvcHRpb25zKSB7XG4gIHRoaXMudG9rZW5zID0gW107XG4gIHRoaXMudG9rZW4gPSBudWxsO1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IG1hcmtlZC5kZWZhdWx0cztcbiAgdGhpcy5vcHRpb25zLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyIHx8IG5ldyBSZW5kZXJlcjtcbiAgdGhpcy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlcjtcbiAgdGhpcy5yZW5kZXJlci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xufVxuXG4vKipcbiAqIFN0YXRpYyBQYXJzZSBNZXRob2RcbiAqL1xuXG5QYXJzZXIucGFyc2UgPSBmdW5jdGlvbihzcmMsIG9wdGlvbnMsIHJlbmRlcmVyKSB7XG4gIHZhciBwYXJzZXIgPSBuZXcgUGFyc2VyKG9wdGlvbnMsIHJlbmRlcmVyKTtcbiAgcmV0dXJuIHBhcnNlci5wYXJzZShzcmMpO1xufTtcblxuLyoqXG4gKiBQYXJzZSBMb29wXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKHNyYykge1xuICB0aGlzLmlubGluZSA9IG5ldyBJbmxpbmVMZXhlcihzcmMubGlua3MsIHRoaXMub3B0aW9ucywgdGhpcy5yZW5kZXJlcik7XG4gIHRoaXMudG9rZW5zID0gc3JjLnJldmVyc2UoKTtcblxuICB2YXIgb3V0ID0gJyc7XG4gIHdoaWxlICh0aGlzLm5leHQoKSkge1xuICAgIG91dCArPSB0aGlzLnRvaygpO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogTmV4dCBUb2tlblxuICovXG5cblBhcnNlci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy50b2tlbiA9IHRoaXMudG9rZW5zLnBvcCgpO1xufTtcblxuLyoqXG4gKiBQcmV2aWV3IE5leHQgVG9rZW5cbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudG9rZW5zW3RoaXMudG9rZW5zLmxlbmd0aCAtIDFdIHx8IDA7XG59O1xuXG4vKipcbiAqIFBhcnNlIFRleHQgVG9rZW5zXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5wYXJzZVRleHQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGJvZHkgPSB0aGlzLnRva2VuLnRleHQ7XG5cbiAgd2hpbGUgKHRoaXMucGVlaygpLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgIGJvZHkgKz0gJ1xcbicgKyB0aGlzLm5leHQoKS50ZXh0O1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuaW5saW5lLm91dHB1dChib2R5KTtcbn07XG5cbi8qKlxuICogUGFyc2UgQ3VycmVudCBUb2tlblxuICovXG5cblBhcnNlci5wcm90b3R5cGUudG9rID0gZnVuY3Rpb24oKSB7XG4gIHN3aXRjaCAodGhpcy50b2tlbi50eXBlKSB7XG4gICAgY2FzZSAnc3BhY2UnOiB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGNhc2UgJ2hyJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuaHIoKTtcbiAgICB9XG4gICAgY2FzZSAnaGVhZGluZyc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmhlYWRpbmcoXG4gICAgICAgIHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLnRleHQpLFxuICAgICAgICB0aGlzLnRva2VuLmRlcHRoLFxuICAgICAgICB0aGlzLnRva2VuLnRleHQpO1xuICAgIH1cbiAgICBjYXNlICdjb2RlJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuY29kZSh0aGlzLnRva2VuLnRleHQsXG4gICAgICAgIHRoaXMudG9rZW4ubGFuZyxcbiAgICAgICAgdGhpcy50b2tlbi5lc2NhcGVkKTtcbiAgICB9XG4gICAgY2FzZSAndGFibGUnOiB7XG4gICAgICB2YXIgaGVhZGVyID0gJydcbiAgICAgICAgLCBib2R5ID0gJydcbiAgICAgICAgLCBpXG4gICAgICAgICwgcm93XG4gICAgICAgICwgY2VsbFxuICAgICAgICAsIGZsYWdzXG4gICAgICAgICwgajtcblxuICAgICAgLy8gaGVhZGVyXG4gICAgICBjZWxsID0gJyc7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy50b2tlbi5oZWFkZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZmxhZ3MgPSB7IGhlYWRlcjogdHJ1ZSwgYWxpZ246IHRoaXMudG9rZW4uYWxpZ25baV0gfTtcbiAgICAgICAgY2VsbCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlY2VsbChcbiAgICAgICAgICB0aGlzLmlubGluZS5vdXRwdXQodGhpcy50b2tlbi5oZWFkZXJbaV0pLFxuICAgICAgICAgIHsgaGVhZGVyOiB0cnVlLCBhbGlnbjogdGhpcy50b2tlbi5hbGlnbltpXSB9XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBoZWFkZXIgKz0gdGhpcy5yZW5kZXJlci50YWJsZXJvdyhjZWxsKTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMudG9rZW4uY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcm93ID0gdGhpcy50b2tlbi5jZWxsc1tpXTtcblxuICAgICAgICBjZWxsID0gJyc7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCByb3cubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBjZWxsICs9IHRoaXMucmVuZGVyZXIudGFibGVjZWxsKFxuICAgICAgICAgICAgdGhpcy5pbmxpbmUub3V0cHV0KHJvd1tqXSksXG4gICAgICAgICAgICB7IGhlYWRlcjogZmFsc2UsIGFsaWduOiB0aGlzLnRva2VuLmFsaWduW2pdIH1cbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgYm9keSArPSB0aGlzLnJlbmRlcmVyLnRhYmxlcm93KGNlbGwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIudGFibGUoaGVhZGVyLCBib2R5KTtcbiAgICB9XG4gICAgY2FzZSAnYmxvY2txdW90ZV9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJyc7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnYmxvY2txdW90ZV9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuYmxvY2txdW90ZShib2R5KTtcbiAgICB9XG4gICAgY2FzZSAnbGlzdF9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJydcbiAgICAgICAgLCBvcmRlcmVkID0gdGhpcy50b2tlbi5vcmRlcmVkO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2xpc3RfZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3QoYm9keSwgb3JkZXJlZCk7XG4gICAgfVxuICAgIGNhc2UgJ2xpc3RfaXRlbV9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJyc7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnbGlzdF9pdGVtX2VuZCcpIHtcbiAgICAgICAgYm9keSArPSB0aGlzLnRva2VuLnR5cGUgPT09ICd0ZXh0J1xuICAgICAgICAgID8gdGhpcy5wYXJzZVRleHQoKVxuICAgICAgICAgIDogdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIubGlzdGl0ZW0oYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2xvb3NlX2l0ZW1fc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2xpc3RfaXRlbV9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIubGlzdGl0ZW0oYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2h0bWwnOiB7XG4gICAgICB2YXIgaHRtbCA9ICF0aGlzLnRva2VuLnByZSAmJiAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgID8gdGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4udGV4dClcbiAgICAgICAgOiB0aGlzLnRva2VuLnRleHQ7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5odG1sKGh0bWwpO1xuICAgIH1cbiAgICBjYXNlICdwYXJhZ3JhcGgnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5wYXJhZ3JhcGgodGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4udGV4dCkpO1xuICAgIH1cbiAgICBjYXNlICd0ZXh0Jzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHRoaXMucGFyc2VUZXh0KCkpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBIZWxwZXJzXG4gKi9cblxuZnVuY3Rpb24gZXNjYXBlKGh0bWwsIGVuY29kZSkge1xuICByZXR1cm4gaHRtbFxuICAgIC5yZXBsYWNlKCFlbmNvZGUgPyAvJig/ISM/XFx3KzspL2cgOiAvJi9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgIC5yZXBsYWNlKC8nL2csICcmIzM5OycpO1xufVxuXG5mdW5jdGlvbiB1bmVzY2FwZShodG1sKSB7XG5cdC8vIGV4cGxpY2l0bHkgbWF0Y2ggZGVjaW1hbCwgaGV4LCBhbmQgbmFtZWQgSFRNTCBlbnRpdGllc1xuICByZXR1cm4gaHRtbC5yZXBsYWNlKC8mKCMoPzpcXGQrKXwoPzojeFswLTlBLUZhLWZdKyl8KD86XFx3KykpOz8vaWcsIGZ1bmN0aW9uKF8sIG4pIHtcbiAgICBuID0gbi50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChuID09PSAnY29sb24nKSByZXR1cm4gJzonO1xuICAgIGlmIChuLmNoYXJBdCgwKSA9PT0gJyMnKSB7XG4gICAgICByZXR1cm4gbi5jaGFyQXQoMSkgPT09ICd4J1xuICAgICAgICA/IFN0cmluZy5mcm9tQ2hhckNvZGUocGFyc2VJbnQobi5zdWJzdHJpbmcoMiksIDE2KSlcbiAgICAgICAgOiBTdHJpbmcuZnJvbUNoYXJDb2RlKCtuLnN1YnN0cmluZygxKSk7XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2UocmVnZXgsIG9wdCkge1xuICByZWdleCA9IHJlZ2V4LnNvdXJjZTtcbiAgb3B0ID0gb3B0IHx8ICcnO1xuICByZXR1cm4gZnVuY3Rpb24gc2VsZihuYW1lLCB2YWwpIHtcbiAgICBpZiAoIW5hbWUpIHJldHVybiBuZXcgUmVnRXhwKHJlZ2V4LCBvcHQpO1xuICAgIHZhbCA9IHZhbC5zb3VyY2UgfHwgdmFsO1xuICAgIHZhbCA9IHZhbC5yZXBsYWNlKC8oXnxbXlxcW10pXFxeL2csICckMScpO1xuICAgIHJlZ2V4ID0gcmVnZXgucmVwbGFjZShuYW1lLCB2YWwpO1xuICAgIHJldHVybiBzZWxmO1xuICB9O1xufVxuXG5mdW5jdGlvbiByZXNvbHZlVXJsKGJhc2UsIGhyZWYpIHtcbiAgaWYgKCFiYXNlVXJsc1snICcgKyBiYXNlXSkge1xuICAgIC8vIHdlIGNhbiBpZ25vcmUgZXZlcnl0aGluZyBpbiBiYXNlIGFmdGVyIHRoZSBsYXN0IHNsYXNoIG9mIGl0cyBwYXRoIGNvbXBvbmVudCxcbiAgICAvLyBidXQgd2UgbWlnaHQgbmVlZCB0byBhZGQgX3RoYXRfXG4gICAgLy8gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODYjc2VjdGlvbi0zXG4gICAgaWYgKC9eW146XSs6XFwvKlteL10qJC8udGVzdChiYXNlKSkge1xuICAgICAgYmFzZVVybHNbJyAnICsgYmFzZV0gPSBiYXNlICsgJy8nO1xuICAgIH0gZWxzZSB7XG4gICAgICBiYXNlVXJsc1snICcgKyBiYXNlXSA9IGJhc2UucmVwbGFjZSgvW14vXSokLywgJycpO1xuICAgIH1cbiAgfVxuICBiYXNlID0gYmFzZVVybHNbJyAnICsgYmFzZV07XG5cbiAgaWYgKGhyZWYuc2xpY2UoMCwgMikgPT09ICcvLycpIHtcbiAgICByZXR1cm4gYmFzZS5yZXBsYWNlKC86W1xcc1xcU10qLywgJzonKSArIGhyZWY7XG4gIH0gZWxzZSBpZiAoaHJlZi5jaGFyQXQoMCkgPT09ICcvJykge1xuICAgIHJldHVybiBiYXNlLnJlcGxhY2UoLyg6XFwvKlteL10qKVtcXHNcXFNdKi8sICckMScpICsgaHJlZjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZSArIGhyZWY7XG4gIH1cbn1cbnZhciBiYXNlVXJscyA9IHt9O1xudmFyIG9yaWdpbkluZGVwZW5kZW50VXJsID0gL14kfF5bYS16XVthLXowLTkrLi1dKjp8Xls/I10vaTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5ub29wLmV4ZWMgPSBub29wO1xuXG5mdW5jdGlvbiBtZXJnZShvYmopIHtcbiAgdmFyIGkgPSAxXG4gICAgLCB0YXJnZXRcbiAgICAsIGtleTtcblxuICBmb3IgKDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHRhcmdldCA9IGFyZ3VtZW50c1tpXTtcbiAgICBmb3IgKGtleSBpbiB0YXJnZXQpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGFyZ2V0LCBrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gdGFyZ2V0W2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxuXG4vKipcbiAqIE1hcmtlZFxuICovXG5cbmZ1bmN0aW9uIG1hcmtlZChzcmMsIG9wdCwgY2FsbGJhY2spIHtcbiAgaWYgKGNhbGxiYWNrIHx8IHR5cGVvZiBvcHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFjayA9IG9wdDtcbiAgICAgIG9wdCA9IG51bGw7XG4gICAgfVxuXG4gICAgb3B0ID0gbWVyZ2Uoe30sIG1hcmtlZC5kZWZhdWx0cywgb3B0IHx8IHt9KTtcblxuICAgIHZhciBoaWdobGlnaHQgPSBvcHQuaGlnaGxpZ2h0XG4gICAgICAsIHRva2Vuc1xuICAgICAgLCBwZW5kaW5nXG4gICAgICAsIGkgPSAwO1xuXG4gICAgdHJ5IHtcbiAgICAgIHRva2VucyA9IExleGVyLmxleChzcmMsIG9wdClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZSk7XG4gICAgfVxuXG4gICAgcGVuZGluZyA9IHRva2Vucy5sZW5ndGg7XG5cbiAgICB2YXIgZG9uZSA9IGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBvcHQuaGlnaGxpZ2h0ID0gaGlnaGxpZ2h0O1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgIH1cblxuICAgICAgdmFyIG91dDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgb3V0ID0gUGFyc2VyLnBhcnNlKHRva2Vucywgb3B0KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZXJyID0gZTtcbiAgICAgIH1cblxuICAgICAgb3B0LmhpZ2hsaWdodCA9IGhpZ2hsaWdodDtcblxuICAgICAgcmV0dXJuIGVyclxuICAgICAgICA/IGNhbGxiYWNrKGVycilcbiAgICAgICAgOiBjYWxsYmFjayhudWxsLCBvdXQpO1xuICAgIH07XG5cbiAgICBpZiAoIWhpZ2hsaWdodCB8fCBoaWdobGlnaHQubGVuZ3RoIDwgMykge1xuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9XG5cbiAgICBkZWxldGUgb3B0LmhpZ2hsaWdodDtcblxuICAgIGlmICghcGVuZGluZykgcmV0dXJuIGRvbmUoKTtcblxuICAgIGZvciAoOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAoZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgaWYgKHRva2VuLnR5cGUgIT09ICdjb2RlJykge1xuICAgICAgICAgIHJldHVybiAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoaWdobGlnaHQodG9rZW4udGV4dCwgdG9rZW4ubGFuZywgZnVuY3Rpb24oZXJyLCBjb2RlKSB7XG4gICAgICAgICAgaWYgKGVycikgcmV0dXJuIGRvbmUoZXJyKTtcbiAgICAgICAgICBpZiAoY29kZSA9PSBudWxsIHx8IGNvZGUgPT09IHRva2VuLnRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0b2tlbi50ZXh0ID0gY29kZTtcbiAgICAgICAgICB0b2tlbi5lc2NhcGVkID0gdHJ1ZTtcbiAgICAgICAgICAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pKHRva2Vuc1tpXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuO1xuICB9XG4gIHRyeSB7XG4gICAgaWYgKG9wdCkgb3B0ID0gbWVyZ2Uoe30sIG1hcmtlZC5kZWZhdWx0cywgb3B0KTtcbiAgICByZXR1cm4gUGFyc2VyLnBhcnNlKExleGVyLmxleChzcmMsIG9wdCksIG9wdCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlLm1lc3NhZ2UgKz0gJ1xcblBsZWFzZSByZXBvcnQgdGhpcyB0byBodHRwczovL2dpdGh1Yi5jb20vY2hqai9tYXJrZWQuJztcbiAgICBpZiAoKG9wdCB8fCBtYXJrZWQuZGVmYXVsdHMpLnNpbGVudCkge1xuICAgICAgcmV0dXJuICc8cD5BbiBlcnJvciBvY2N1cnJlZDo8L3A+PHByZT4nXG4gICAgICAgICsgZXNjYXBlKGUubWVzc2FnZSArICcnLCB0cnVlKVxuICAgICAgICArICc8L3ByZT4nO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9XG59XG5cbi8qKlxuICogT3B0aW9uc1xuICovXG5cbm1hcmtlZC5vcHRpb25zID1cbm1hcmtlZC5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0KSB7XG4gIG1lcmdlKG1hcmtlZC5kZWZhdWx0cywgb3B0KTtcbiAgcmV0dXJuIG1hcmtlZDtcbn07XG5cbm1hcmtlZC5kZWZhdWx0cyA9IHtcbiAgZ2ZtOiB0cnVlLFxuICB0YWJsZXM6IHRydWUsXG4gIGJyZWFrczogZmFsc2UsXG4gIHBlZGFudGljOiBmYWxzZSxcbiAgc2FuaXRpemU6IGZhbHNlLFxuICBzYW5pdGl6ZXI6IG51bGwsXG4gIG1hbmdsZTogdHJ1ZSxcbiAgc21hcnRMaXN0czogZmFsc2UsXG4gIHNpbGVudDogZmFsc2UsXG4gIGhpZ2hsaWdodDogbnVsbCxcbiAgbGFuZ1ByZWZpeDogJ2xhbmctJyxcbiAgc21hcnR5cGFudHM6IGZhbHNlLFxuICBoZWFkZXJQcmVmaXg6ICcnLFxuICByZW5kZXJlcjogbmV3IFJlbmRlcmVyLFxuICB4aHRtbDogZmFsc2UsXG4gIGJhc2VVcmw6IG51bGxcbn07XG5cbi8qKlxuICogRXhwb3NlXG4gKi9cblxubWFya2VkLlBhcnNlciA9IFBhcnNlcjtcbm1hcmtlZC5wYXJzZXIgPSBQYXJzZXIucGFyc2U7XG5cbm1hcmtlZC5SZW5kZXJlciA9IFJlbmRlcmVyO1xuXG5tYXJrZWQuTGV4ZXIgPSBMZXhlcjtcbm1hcmtlZC5sZXhlciA9IExleGVyLmxleDtcblxubWFya2VkLklubGluZUxleGVyID0gSW5saW5lTGV4ZXI7XG5tYXJrZWQuaW5saW5lTGV4ZXIgPSBJbmxpbmVMZXhlci5vdXRwdXQ7XG5cbm1hcmtlZC5wYXJzZSA9IG1hcmtlZDtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICBtb2R1bGUuZXhwb3J0cyA9IG1hcmtlZDtcbn0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIG1hcmtlZDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLm1hcmtlZCA9IG1hcmtlZDtcbn1cblxufSkuY2FsbChmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMgfHwgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogZ2xvYmFsKTtcbn0oKSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9tYXJrZWQvbGliL21hcmtlZC5qc1xuLy8gbW9kdWxlIGlkID0gMjJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGc7XHJcblxyXG4vLyBUaGlzIHdvcmtzIGluIG5vbi1zdHJpY3QgbW9kZVxyXG5nID0gKGZ1bmN0aW9uKCkge1xyXG5cdHJldHVybiB0aGlzO1xyXG59KSgpO1xyXG5cclxudHJ5IHtcclxuXHQvLyBUaGlzIHdvcmtzIGlmIGV2YWwgaXMgYWxsb3dlZCAoc2VlIENTUClcclxuXHRnID0gZyB8fCBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCkgfHwgKDEsZXZhbCkoXCJ0aGlzXCIpO1xyXG59IGNhdGNoKGUpIHtcclxuXHQvLyBUaGlzIHdvcmtzIGlmIHRoZSB3aW5kb3cgcmVmZXJlbmNlIGlzIGF2YWlsYWJsZVxyXG5cdGlmKHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIpXHJcblx0XHRnID0gd2luZG93O1xyXG59XHJcblxyXG4vLyBnIGNhbiBzdGlsbCBiZSB1bmRlZmluZWQsIGJ1dCBub3RoaW5nIHRvIGRvIGFib3V0IGl0Li4uXHJcbi8vIFdlIHJldHVybiB1bmRlZmluZWQsIGluc3RlYWQgb2Ygbm90aGluZyBoZXJlLCBzbyBpdCdzXHJcbi8vIGVhc2llciB0byBoYW5kbGUgdGhpcyBjYXNlLiBpZighZ2xvYmFsKSB7IC4uLn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZztcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gKHdlYnBhY2spL2J1aWxkaW4vZ2xvYmFsLmpzXG4vLyBtb2R1bGUgaWQgPSAyM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJkZWYgc2h1ZmZsZSBhcnJheVxuXHR2YXIgY291bnRlciA9IGFycmF5Omxlbmd0aCwgdGVtcCwgaW5kZXhcblxuXHQjIFdoaWxlIHRoZXJlIGFyZSBlbGVtZW50cyBpbiB0aGUgYXJyYXlcblx0d2hpbGUgY291bnRlciA+IDBcblx0XHQjIFBpY2sgYSByYW5kb20gaW5kZXhcblx0XHRpbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20gKiBjb3VudGVyKVxuXHRcdGNvdW50ZXItLSAjIERlY3JlYXNlIGNvdW50ZXIgYnkgMVxuXHRcdCMgQW5kIHN3YXAgdGhlIGxhc3QgZWxlbWVudCB3aXRoIGl0XG5cdFx0dGVtcCA9IGFycmF5W2NvdW50ZXJdXG5cdFx0YXJyYXlbY291bnRlcl0gPSBhcnJheVtpbmRleF1cblx0XHRhcnJheVtpbmRleF0gPSB0ZW1wXG5cdFxuXHRyZXR1cm4gYXJyYXlcblxuZXhwb3J0IHRhZyBQYXR0ZXJuXG5cblx0ZGVmIHNldHVwXG5cdFx0cmV0dXJuIHNlbGYgaWYgJG5vZGUkXG5cdFx0dmFyIHBhcnRzID0ge3RhZ3M6IFtdLCBrZXl3b3JkczogW10sIG1ldGhvZHM6IFtdfVxuXHRcdHZhciBpdGVtcyA9IFtdXG5cdFx0dmFyIGxpbmVzID0gW11cblxuXHRcdGZvciBvd24gayx2IG9mIEltYmEuVGFnOnByb3RvdHlwZVxuXHRcdFx0aXRlbXMucHVzaChcIjxlbT57a308L2VtPlwiKVxuXHRcdFx0cGFydHM6bWV0aG9kcy5wdXNoKFwiPGVtPntrfTwvZW0+XCIpXG5cblx0XHRmb3IgayBpbiBJbWJhLkhUTUxfVEFHUyBvciBIVE1MX1RBR1Ncblx0XHRcdGl0ZW1zLnB1c2goXCI8dT4mbHQ7e2t9Jmd0OzwvdT5cIilcblx0XHRcdHBhcnRzOnRhZ3MucHVzaChcIjx1PiZsdDt7a30mZ3Q7PC91PlwiKVxuXG5cdFx0dmFyIHdvcmRzID0gXCJkZWYgaWYgZWxzZSBlbGlmIHdoaWxlIHVudGlsIGZvciBpbiBvZiB2YXIgbGV0IGNsYXNzIGV4dGVuZCBleHBvcnQgaW1wb3J0IHRhZyBnbG9iYWxcIlxuXG5cdFx0Zm9yIGsgaW4gd29yZHMuc3BsaXQoXCIgXCIpXG5cdFx0XHRpdGVtcy5wdXNoKFwiPGk+e2t9PC9pPlwiKVxuXHRcdFx0cGFydHM6a2V5d29yZHMucHVzaChcIjxpPntrfTwvaT5cIilcblxuXHRcdHZhciBzaHVmZmxlZCA9IHNodWZmbGUoaXRlbXMpXG5cdFx0dmFyIGFsbCA9IFtdLmNvbmNhdChzaHVmZmxlZClcblx0XHR2YXIgY291bnQgPSBpdGVtczpsZW5ndGggLSAxXG5cblx0XHRmb3IgbG4gaW4gWzAgLi4gMTRdXG5cdFx0XHRsZXQgY2hhcnMgPSAwXG5cdFx0XHRsaW5lc1tsbl0gPSBbXVxuXHRcdFx0d2hpbGUgY2hhcnMgPCAzMDBcblx0XHRcdFx0bGV0IGl0ZW0gPSAoc2h1ZmZsZWQucG9wIG9yIGFsbFtNYXRoLmZsb29yKGNvdW50ICogTWF0aC5yYW5kb20pXSlcblx0XHRcdFx0aWYgaXRlbVxuXHRcdFx0XHRcdGNoYXJzICs9IGl0ZW06bGVuZ3RoXG5cdFx0XHRcdFx0bGluZXNbbG5dLnB1c2goaXRlbSlcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGNoYXJzID0gNDAwXG5cblx0XHRkb206aW5uZXJIVE1MID0gJzxkaXY+JyArIGxpbmVzLm1hcCh8bG4saXxcblx0XHRcdGxldCBvID0gTWF0aC5tYXgoMCwoKGkgLSAyKSAqIDAuMyAvIDE0KSkudG9GaXhlZCgyKVxuXHRcdFx0XCI8ZGl2IGNsYXNzPSdsaW5lJyBzdHlsZT0nb3BhY2l0eToge299Oyc+XCIgKyBsbi5qb2luKFwiIFwiKSArICc8L2Rpdj4nXG5cdFx0KS5qb2luKCcnKSArICc8L2Rpdj4nXG5cdFx0c2VsZlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9QYXR0ZXJuLmltYmEiLCJpbXBvcnQgUGFnZSBmcm9tICcuL1BhZ2UnXG5pbXBvcnQgU25pcHBldCBmcm9tICcuL1NuaXBwZXQnXG5cbnRhZyBHdWlkZVRPQ1xuXHRwcm9wIHRvY1xuXHRhdHRyIGxldmVsXG5cblx0ZGVmIHRvZ2dsZVxuXHRcdHRvZ2dsZUZsYWcoJ2NvbGxhcHNlZCcpXG5cdFx0XG5cdGRlZiB0b2Ncblx0XHRAdG9jIG9yIGRhdGEudG9jXG5cdFx0XG5cdGRlZiByb3V0ZVxuXHRcdFwie2RhdGEucGF0aH0je3RvYzpzbHVnfVwiXHRcdFxuXHRcdFxuXHRkZWYgcmVuZGVyXG5cdFx0cmV0dXJuIHNlbGYgdW5sZXNzIGRhdGEucmVhZHlcblxuXHRcdGxldCB0b2MgPSB0b2Ncblx0XHRyZXJvdXRlXG5cdFxuXHRcdDxzZWxmLnRvYy5lbnRyeSBsZXZlbD0odG9jOmxldmVsKT5cblx0XHRcdGlmIHRvYzpjaGlsZHJlbjpsZW5ndGggYW5kIHRvYzpsZXZlbCA8IDNcblx0XHRcdFx0PC5oZWFkZXI+XG5cdFx0XHRcdFx0PGEgaHJlZj1yb3V0ZT4gdG9jOnRpdGxlXG5cdFx0XHRcdDwuY29udGVudD5cblx0XHRcdFx0XHRmb3IgY2hpbGQgaW4gdG9jOmNoaWxkcmVuIHdoZW4gY2hpbGQ6bGV2ZWwgPCAzXG5cdFx0XHRcdFx0XHQ8R3VpZGVUT0NbZGF0YV0gdG9jPWNoaWxkPlxuXHRcdFx0ZWxzZVxuXHRcdFx0XHQ8YSBocmVmPXJvdXRlPiB0b2M6dGl0bGVcblxudGFnIEd1aWRlXG5cdFxuXHRkZWYgc2V0dXBcblx0XHRyZW5kZXJcblx0XHRAYm9keS5kb206aW5uZXJIVE1MID0gZGF0YTpib2R5XG5cdFx0aWYgJHdlYiRcblx0XHRcdGF3YWtlblNuaXBwZXRzXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGYubWQ+XG5cdFx0XHQ8ZGl2QGJvZHk+XG5cdFx0XHQ8Zm9vdGVyPlxuXHRcdFx0XHRpZiBsZXQgcmVmID0gYXBwLmd1aWRlW2RhdGE6cHJldl1cblx0XHRcdFx0XHQ8YS5wcmV2IGhyZWY9XCIvZ3VpZGUve3JlZjppZH1cIj4gXCLihpAgXCIgKyByZWY6dGl0bGVcblx0XHRcdFx0aWYgbGV0IHJlZiA9IGFwcC5ndWlkZVtkYXRhOm5leHRdXG5cdFx0XHRcdFx0PGEubmV4dCBocmVmPVwiL2d1aWRlL3tyZWY6aWR9XCI+IHJlZjp0aXRsZSArIFwiIOKGklwiXG5cblx0ZGVmIGF3YWtlblNuaXBwZXRzXG5cdFx0Zm9yIGl0ZW0gaW4gZG9tLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zbmlwcGV0Jylcblx0XHRcdGxldCBjb2RlID0gaXRlbTp0ZXh0Q29udGVudFxuXHRcdFx0aWYgY29kZS5pbmRleE9mKCdJbWJhLm1vdW50JykgPj0gMFxuXHRcdFx0XHRTbmlwcGV0LnJlcGxhY2UoaXRlbSlcblx0XHRzZWxmXG5cbnRhZyBUT0MgPCBsaVxuXHRwcm9wIHRvY1xuXHRwcm9wIGV4cGFuZGVkIGRlZmF1bHQ6IHRydWVcblx0YXR0ciBsZXZlbFxuXHRcblx0ZGVmIHJvdXRlXG5cdFx0XCIvZ3VpZGUve2RhdGE6cm91dGV9I3t0b2M6c2x1Z31cIlxuXHRcdFxuXHRkZWYgdG9jXG5cdFx0QHRvYyBvciBkYXRhOnRvY1swXVxuXHRcdFxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGYudG9jLmVudHJ5IGxldmVsPSh0b2M6bGV2ZWwpPlxuXHRcdFx0PGEgaHJlZj1yb3V0ZT4gdG9jOnRpdGxlXG5cdFx0XHRpZiB0b2M6Y2hpbGRyZW46bGVuZ3RoIGFuZCB0b2M6bGV2ZWwgPCAyIGFuZCBleHBhbmRlZFxuXHRcdFx0XHQ8dWw+IGZvciBjaGlsZCBpbiB0b2M6Y2hpbGRyZW4gd2hlbiBjaGlsZDpsZXZlbCA8IDNcblx0XHRcdFx0XHQ8VE9DW2RhdGFdIHRvYz1jaGlsZD5cblxuZXhwb3J0IHRhZyBHdWlkZXNQYWdlIDwgUGFnZVxuXHRcblx0ZGVmIG1vdW50XG5cdFx0QG9uc2Nyb2xsIHx8PSBkbyBzY3JvbGxlZFxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLEBvbnNjcm9sbCxwYXNzaXZlOiB0cnVlKVxuXG5cdGRlZiB1bm1vdW50XG5cdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsQG9uc2Nyb2xsLHBhc3NpdmU6IHRydWUpXG5cdFx0XG5cdGRlZiBndWlkZVxuXHRcdGRhdGFbcm91dGVyLnBhdGgucmVwbGFjZSgnL2d1aWRlLycsJycpXSBvciBkYXRhWydlc3NlbnRpYWxzL2ludHJvZHVjdGlvbiddXG5cdFx0XG5cdGRlZiBzY3JvbGxlZFxuXHRcdHJldHVybiBzZWxmXG5cblx0XHR2YXIgaXRlbXMgPSBkb20ucXVlcnlTZWxlY3RvckFsbCgnW2lkXScpXG5cdFx0dmFyIG1hdGNoXG5cblx0XHR2YXIgc2Nyb2xsVG9wID0gd2luZG93OnBhZ2VZT2Zmc2V0XG5cdFx0dmFyIHdoID0gd2luZG93OmlubmVySGVpZ2h0XG5cdFx0dmFyIGRoID0gZG9jdW1lbnQ6Ym9keTpzY3JvbGxIZWlnaHRcblxuXHRcdGlmIEBzY3JvbGxGcmVlemUgPj0gMFxuXHRcdFx0dmFyIGRpZmYgPSBNYXRoLmFicyhzY3JvbGxUb3AgLSBAc2Nyb2xsRnJlZXplKVxuXHRcdFx0cmV0dXJuIHNlbGYgaWYgZGlmZiA8IDUwXG5cdFx0XHRAc2Nyb2xsRnJlZXplID0gLTFcblxuXHRcdHZhciBzY3JvbGxCb3R0b20gPSBkaCAtIChzY3JvbGxUb3AgKyB3aClcblxuXHRcdGlmIHNjcm9sbEJvdHRvbSA9PSAwXG5cdFx0XHRtYXRjaCA9IGl0ZW1zW2l0ZW1zLmxlbiAtIDFdXG5cdFx0ZWxzZVxuXHRcdFx0Zm9yIGl0ZW0gaW4gaXRlbXNcblx0XHRcdFx0dmFyIHQgPSAoaXRlbTpvZmZzZXRUb3AgKyAzMCArIDYwKSAjIGhhY2tcblx0XHRcdFx0dmFyIGRpc3QgPSBzY3JvbGxUb3AgLSB0XG5cblx0XHRcdFx0aWYgZGlzdCA8IDBcblx0XHRcdFx0XHRicmVhayBtYXRjaCA9IGl0ZW1cblx0XHRcblx0XHRpZiBtYXRjaFxuXHRcdFx0aWYgQGhhc2ggIT0gbWF0Y2g6aWRcblx0XHRcdFx0QGhhc2ggPSBtYXRjaDppZFxuXHRcdFx0XHRyb3V0ZXIuZ28oJyMnICsgQGhhc2gse30seWVzKVxuXHRcdFx0XHRyZW5kZXJcblxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIG9ucm91dGUgZVxuXHRcdGUuc3RvcFxuXHRcdGxvZyAnZ3VpZGVzIHJvdXRlZCdcblx0XHR2YXIgc2Nyb2xsID0gZG9cblx0XHRcdGlmIGxldCBlbCA9IGRvbS5xdWVyeVNlbGVjdG9yKCcjJyArIHJvdXRlci5oYXNoKVxuXHRcdFx0XHRlbC5zY3JvbGxJbnRvVmlldyh0cnVlKVxuXHRcdFx0XHRAc2Nyb2xsRnJlZXplID0gd2luZG93OnBhZ2VZT2Zmc2V0XG5cdFx0XHRcdHJldHVybiBlbFxuXHRcdFx0cmV0dXJuIG5vXG5cblx0XHRpZiByb3V0ZXIuaGFzaFxuXHRcdFx0IyByZW5kZXJcblx0XHRcdHNjcm9sbCgpIG9yIHNldFRpbWVvdXQoc2Nyb2xsLDIwKVxuXG5cdFx0c2VsZlxuXHQjIHByb3AgZ3VpZGVcblxuXHRkZWYgcmVuZGVyXG5cdFx0bGV0IGN1cnIgPSBndWlkZVxuXG5cdFx0PHNlbGYuX3BhZ2U+XG5cdFx0XHQ8bmF2QG5hdj5cblx0XHRcdFx0PC5jb250ZW50PlxuXHRcdFx0XHRcdGZvciBpdGVtIGluIGRhdGE6dG9jXG5cdFx0XHRcdFx0XHQ8aDE+IGl0ZW06dGl0bGUgb3IgaXRlbTppZFxuXHRcdFx0XHRcdFx0PHVsPlxuXHRcdFx0XHRcdFx0XHRmb3Igc2VjdGlvbiBpbiBpdGVtOnNlY3Rpb25zXG5cdFx0XHRcdFx0XHRcdFx0PFRPQ1tkYXRhW3NlY3Rpb25dXSBleHBhbmRlZD0oZGF0YVtzZWN0aW9uXSA9PSBjdXJyKT5cblx0XHRcdFx0XHQjIGZvciBndWlkZSBpbiBkYXRhXG5cdFx0XHRcdFx0I1x0PFRPQ1tndWlkZV0gdG9jPWd1aWRlOnRvY1swXSBleHBhbmRlZD0oZ3VpZGUgPT0gY3Vycik+XG5cdFx0XHQ8LmJvZHkubGlnaHQ+XG5cdFx0XHRcdGlmIGd1aWRlXG5cdFx0XHRcdFx0PEd1aWRlQHtndWlkZTppZH1bZ3VpZGVdPlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9HdWlkZXNQYWdlLmltYmEiLCJpbXBvcnQgUGFnZSBmcm9tICcuL1BhZ2UnXG5cbmRlZiBwYXRoVG9BbmNob3IgcGF0aFxuXHQnYXBpLScgKyBwYXRoLnJlcGxhY2UoL1xcLi9nLCdfJykucmVwbGFjZSgvXFwjL2csJ19fJykucmVwbGFjZSgvXFw9L2csJ19zZXQnKVxuXG50YWcgRGVzY1xuXG5cdGRlZiBodG1sPSBodG1sXG5cdFx0aWYgaHRtbCAhPSBAaHRtbFxuXHRcdFx0ZG9tOmlubmVySFRNTCA9IEBodG1sID0gaHRtbFxuXHRcdHNlbGZcblxudGFnIFJlZlxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj5cblxudGFnIEl0ZW1cblxudGFnIFBhdGggPCBzcGFuXG5cdHByb3Agc2hvcnRcblxuXHRkZWYgc2V0dXBcblx0XHR2YXIgaXRlbXMgPSBbXVxuXHRcdHZhciBzdHIgPSBkYXRhXG5cdFx0aWYgc3RyIGlzYSBTdHJpbmdcblx0XHRcdGlmIHNob3J0XG5cdFx0XHRcdHN0ciA9IHN0ci5yZXBsYWNlKC8oW0EtWl1cXHcqXFwuKSooPz1bQS1aXSkvZywnJylcblxuXHRcdFx0aHRtbCA9IHN0ci5yZXBsYWNlKC9cXGIoW1xcd10rfFxcLnxcXCMpXFxiL2cpIGRvIHxtLGl8XG5cdFx0XHRcdGlmIGkgPT0gJy4nIG9yIGkgPT0gJyMnXG5cdFx0XHRcdFx0XCI8aT57aX08L2k+XCJcblx0XHRcdFx0ZWxpZiBpWzBdID09IGlbMF0udG9VcHBlckNhc2Vcblx0XHRcdFx0XHRcIjxiIGNsYXNzPSdjb25zdCc+e2l9PC9iPlwiXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcIjxiIGNsYXNzPSdpZCc+e2l9PC9iPlwiXG5cdFx0c2VsZlxuXG5cbnRhZyBSZXR1cm5cblx0YXR0ciBuYW1lXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmPlxuXHRcdFx0PFBhdGhbZGF0YTp2YWx1ZV0udmFsdWU+XG5cdFx0XHQ8c3Bhbi5kZXNjPiBkYXRhOmRlc2NcblxudGFnIENsYXNzIDwgSXRlbVxuXG5cdHByb3AgZGF0YSB3YXRjaDogOnBhcnNlXG5cblx0ZGVmIHBhcnNlXG5cdFx0QHN0YXRpY3MgPSAobSBmb3IgbSBpbiBkYXRhWycuJ10gd2hlbiBtOmRlc2MpXG5cdFx0QG1ldGhvZHMgPSAobSBmb3IgbSBpbiBkYXRhWycjJ10gd2hlbiBtOmRlc2MpXG5cdFx0QHByb3BlcnRpZXMgPSBbXVxuXHRcdHNlbGZcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGY+XG5cdFx0XHQ8c3Bhbi50b2MtYW5jaG9yIGlkPXBhdGhUb0FuY2hvcihkYXRhOm5hbWVwYXRoKT5cblx0XHRcdDwuaGVhZGVyPiA8LnRpdGxlPiA8UGF0aFtkYXRhOm5hbWVwYXRoXT5cblx0XHRcdDxEZXNjIGh0bWw9ZGF0YTpodG1sPlxuXHRcdFx0aWYgZGF0YTpjdG9yXG5cdFx0XHRcdDwuY29udGVudC5jdG9yPlxuXHRcdFx0XHRcdDxNZXRob2RbZGF0YTpjdG9yXSBwYXRoPShkYXRhOm5hbWVwYXRoICsgJy5uZXcnKT5cblxuXHRcdFx0PC5jb250ZW50PlxuXHRcdFx0XHRpZiBAc3RhdGljczpsZW5ndGggPiAwXG5cdFx0XHRcdFx0PC5zZWN0aW9uPlxuXHRcdFx0XHRcdFx0PGgyLmhlYWRlcj4gJ1N0YXRpYyBNZXRob2RzJ1xuXHRcdFx0XHRcdFx0PC5jb250ZW50Lmxpc3Q+IGZvciBpdGVtIGluIEBzdGF0aWNzXG5cdFx0XHRcdFx0XHRcdDxNZXRob2RbaXRlbV0uZG9jIGluYW1lPWRhdGE6bmFtZXBhdGg+XG5cblx0XHRcdFx0aWYgQG1ldGhvZHM6bGVuZ3RoID4gMFxuXHRcdFx0XHRcdDwuc2VjdGlvbj5cblx0XHRcdFx0XHRcdDxoMi5oZWFkZXI+ICdJbnN0YW5jZSBNZXRob2RzJ1xuXHRcdFx0XHRcdFx0PC5jb250ZW50Lmxpc3Q+IGZvciBpdGVtIGluIEBtZXRob2RzXG5cdFx0XHRcdFx0XHRcdDxNZXRob2RbaXRlbV0uZG9jIGluYW1lPWRhdGE6aW5hbWU+XG5cbnRhZyBWYWx1ZVxuXG5cdGRlZiByZW5kZXJcblx0XHRpZiBkYXRhOnR5cGVcblx0XHRcdDxzZWxmIC57ZGF0YTp0eXBlfT5cblx0XHRcdFx0ZGF0YTp2YWx1ZVxuXHRcdGVsaWYgZGF0YSBpc2EgU3RyaW5nXG5cdFx0XHQ8c2VsZi5zdHIgdGV4dD1kYXRhPlxuXHRcdGVsaWYgZGF0YSBpc2EgTnVtYmVyXG5cdFx0XHQ8c2VsZi5udW0gdGV4dD1kYXRhPlxuXHRcdHNlbGZcblx0XHRcblxudGFnIFBhcmFtXG5cblx0ZGVmIHR5cGVcblx0XHRkYXRhOnR5cGVcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGYgLnt0eXBlfT5cblx0XHRcdGlmIHR5cGUgPT0gJ05hbWVkUGFyYW1zJ1xuXHRcdFx0XHRmb3IgcGFyYW0gaW4gZGF0YTpub2Rlc1xuXHRcdFx0XHRcdDxQYXJhbVtwYXJhbV0+XG5cdFx0XHRlbHNlXG5cdFx0XHRcdDwubmFtZT4gZGF0YTpuYW1lXG5cdFx0XHRcdGlmIGRhdGE6ZGVmYXVsdHNcblx0XHRcdFx0XHQ8aT4gdHlwZSA9PSAnTmFtZWRQYXJhbScgPyAnOiAnIDogJyA9ICdcblx0XHRcdFx0XHQ8VmFsdWVbZGF0YTpkZWZhdWx0c10+XG5cbnRhZyBNZXRob2QgPCBJdGVtXG5cblx0cHJvcCBpbmFtZVxuXHRwcm9wIHBhdGhcblxuXHRkZWYgdGFnc1xuXHRcdDxkaXZAdGFncz5cblx0XHRcdDxSZXR1cm5bZGF0YTpyZXR1cm5dIG5hbWU9J3JldHVybnMnPiBpZiBkYXRhOnJldHVyblxuXG5cdFx0XHRpZiBkYXRhOmRlcHJlY2F0ZWRcblx0XHRcdFx0PC5kZXByZWNhdGVkLnJlZD4gJ01ldGhvZCBpcyBkZXByZWNhdGVkJ1xuXHRcdFx0aWYgZGF0YTpwcml2YXRlXG5cdFx0XHRcdDwucHJpdmF0ZS5yZWQ+ICdNZXRob2QgaXMgcHJpdmF0ZSdcblxuXG5cdGRlZiBwYXRoXG5cdFx0QHBhdGggb3IgKGluYW1lICsgJy4nICsgZGF0YTpuYW1lKVxuXG5cdGRlZiBzbHVnXG5cdFx0cGF0aFRvQW5jaG9yKGRhdGE6bmFtZXBhdGgpXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmIC5kZXByZWNhdGVkPShkYXRhOmRlcHJlY2F0ZWQpID5cblx0XHRcdDxzcGFuLnRvYy1hbmNob3IgaWQ9c2x1Zz5cblx0XHRcdDwuaGVhZGVyPlxuXHRcdFx0XHQ8UGF0aFtwYXRoXT5cblx0XHRcdFx0PC5wYXJhbXM+IGZvciBwYXJhbSBpbiBkYXRhOnBhcmFtc1xuXHRcdFx0XHRcdDxQYXJhbVtwYXJhbV0+XG5cdFx0XHRcdDwuZ3Jvdz5cblx0XHRcdDxEZXNjLm1kIGh0bWw9ZGF0YTpodG1sPlxuXHRcdFx0dGFnc1xuXG50YWcgTGluayA8IGFcblx0cHJvcCBzaG9ydFxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZiBocmVmPVwiL2RvY3Mje3BhdGhUb0FuY2hvcihkYXRhOm5hbWVwYXRoKX1cIj4gPFBhdGhbZGF0YTpuYW1lcGF0aF0gc2hvcnQ9c2hvcnQ+XG5cdFx0c3VwZXJcblxuXHRkZWYgb250YXBcblx0XHRzdXBlclxuXHRcdHRyaWdnZXIoJ3JlZm9jdXMnKVxuXG50YWcgR3JvdXBcblxuXHRkZWYgb250YXBcblx0XHR0b2dnbGVGbGFnKCdjb2xsYXBzZWQnKVxuXG5cbmV4cG9ydCB0YWcgRG9jc1BhZ2UgPCBQYWdlXG5cblx0cHJvcCB2ZXJzaW9uIGRlZmF1bHQ6ICdjdXJyZW50J1xuXHRwcm9wIHJvb3RzXG5cblx0ZGVmIHNyY1xuXHRcdFwiL2FwaS97dmVyc2lvbn0uanNvblwiXG5cblx0ZGVmIGRvY3Ncblx0XHRAZG9jc1xuXG5cdGRlZiBzZXR1cFxuXHRcdGxvYWRcblx0XHRzdXBlclxuXG5cdGRlZiBsb2FkXG5cdFx0dmFyIGRvY3MgPSBhd2FpdCBhcHAuZmV0Y2goc3JjKVxuXHRcdERPQ1MgPSBAZG9jcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZG9jcykpXG5cdFx0RE9DTUFQID0gQGRvY3M6ZW50aXRpZXNcblx0XHRnZW5lcmF0ZVxuXHRcdGlmICR3ZWIkXG5cdFx0XHRsb2FkZWRcblxuXHRkZWYgbG9hZGVkXG5cdFx0cmVuZGVyXG5cdFx0aWYgZG9jdW1lbnQ6bG9jYXRpb246aGFzaFxuXHRcdFx0aWYgdmFyIGVsID0gZG9tLnF1ZXJ5U2VsZWN0b3IoZG9jdW1lbnQ6bG9jYXRpb246aGFzaClcblx0XHRcdFx0ZWwuc2Nyb2xsSW50b1ZpZXdcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBvbnJlZm9jdXMgZVxuXHRcdHJlZm9jdXNcblxuXHRkZWYgcmVmb2N1c1xuXHRcdGlmIHZhciBlbCA9IGRvbS5xdWVyeVNlbGVjdG9yKGRvY3VtZW50OmxvY2F0aW9uOmhhc2gpXG5cdFx0XHRlbC5zY3JvbGxJbnRvVmlld1xuXHRcdHNlbGZcblxuXHRkZWYgbG9va3VwIHBhdGhcblx0XHRkb2NzOmVudGl0aWVzW3BhdGhdXG5cblx0ZGVmIGdlbmVyYXRlXG5cdFx0QHJvb3RzID0gW11cblx0XHR2YXIgZW50cyA9IEBkb2NzOmVudGl0aWVzXG5cblx0XHRmb3Igb3duIHBhdGgsaXRlbSBvZiBkb2NzOmVudGl0aWVzXG5cdFx0XHRpZiBpdGVtOnR5cGUgPT0gJ2NsYXNzJyBvciBwYXRoID09ICdJbWJhJ1xuXHRcdFx0XHRpdGVtWycuJ10gPSAoaXRlbVsnLiddIHx8IFtdKS5zb3J0Lm1hcCh8cGF0aHwgZW50c1twYXRoXSApLmZpbHRlcih8dnwgdjp0eXBlID09ICdtZXRob2QnIGFuZCB2OmRlc2MgKVxuXHRcdFx0XHRpdGVtWycjJ10gPSAoaXRlbVsnIyddIHx8IFtdKS5zb3J0Lm1hcCh8cGF0aHwgZW50c1twYXRoXSApLmZpbHRlcih8dnwgdjp0eXBlID09ICdtZXRob2QnIGFuZCB2OmRlc2MgKVxuXG5cdFx0XHRcdEByb290cy5wdXNoKGl0ZW0pIGlmIGl0ZW06ZGVzY1xuXHRcdHNlbGZcblxuXHRkZWYgcmVuZGVyXG5cdFx0cmV0dXJuIHNlbGYgdW5sZXNzIGRvY3Ncblx0XHRcblx0XHQ8c2VsZj5cblx0XHRcdDxuYXZAbmF2PiA8LmNvbnRlbnQ+XG5cdFx0XHRcdGZvciByb290IGluIHJvb3RzXG5cdFx0XHRcdFx0PEdyb3VwLnRvYy5jbGFzcy5zZWN0aW9uLmNvbXBhY3Q+XG5cdFx0XHRcdFx0XHQ8LmhlYWRlcj4gPExpbmtbcm9vdF0uY2xhc3M+XG5cdFx0XHRcdFx0XHQ8LmNvbnRlbnQ+XG5cdFx0XHRcdFx0XHRcdDwuc3RhdGljPlxuXHRcdFx0XHRcdFx0XHRcdGZvciBtZXRoIGluIHJvb3RbJy4nXcKgd2hlbiBtZXRoOmRlc2MgYW5kICFtZXRoOnByaXZhdGVcblx0XHRcdFx0XHRcdFx0XHRcdDwuZW50cnk+IDxMaW5rW21ldGhdIHNob3J0PXllcz5cblx0XHRcdFx0XHRcdFx0PC5pbnN0YW5jZT5cblx0XHRcdFx0XHRcdFx0XHRmb3IgbWV0aCBpbiByb290WycjJ13CoHdoZW4gbWV0aDpkZXNjIGFuZCAhbWV0aDpwcml2YXRlXG5cdFx0XHRcdFx0XHRcdFx0XHQ8LmVudHJ5PiA8TGlua1ttZXRoXSBzaG9ydD15ZXM+XG5cdFx0XHQ8LmJvZHk+XG5cdFx0XHRcdGZvciByb290IGluIHJvb3RzXG5cdFx0XHRcdFx0PENsYXNzW3Jvb3RdLmRvYy5sPlxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL0RvY3NQYWdlLmltYmEiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbGVzcy9zaXRlLmxlc3Ncbi8vIG1vZHVsZSBpZCA9IDI3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlxuZXhwb3J0IHRhZyBMb2dvXG5cdFxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGY+XG5cdFx0XHQ8c3ZnOnN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIxMTZcIiBoZWlnaHQ9XCIxMDhcIiB2aWV3Qm94PVwiMCAwIDExNiAxMDhcIj5cblx0XHRcdFx0PHN2ZzpnIGZpbGw9XCIjM0U5MUZGXCIgZmlsbC1ydWxlPVwiZXZlbm9kZFwiPlxuXHRcdFx0XHRcdDxzdmc6cGF0aCBkPVwiTTM4Ljg2Mzg4NjkgNjguMTM1MTQyNEMzOS41MDczNDc2IDY5LjU3MjcxIDM5LjY4OTAwNTcgNzAuOTU0NzgyNSAzOS40MDg4NjY2IDcyLjI4MTQwMTQgMzkuMTI4NzI3NiA3My42MDgwMjA0IDM4LjQ0MzcwMjIgNzQuNjA5NjgwNSAzNy4zNTM3Njk5IDc1LjI4NjQxMTggMzYuMjYzODM3NSA3NS45NjMxNDMyIDM1LjAxODcyODggNzYuMTUxNzAzMyAzMy42MTg0MDYyIDc1Ljg1MjA5NzkgMzIuNzEyMzE1MiA3NS42NTgyMzU2IDMxLjczNTIwNyA3NS4xODkyMDM1IDMwLjY4NzA1MjMgNzQuNDQ0OTg3NSAyOC45NDI5MTA5IDcyLjUxMTk0NSAyNi45OTU0NTQ3IDcwLjMxODc3OTcgMjQuODQ0NjI1MiA2Ny44NjU0MjU3IDIyLjY5Mzc5NTggNjUuNDEyMDcxOCAyMC41MTA1Njc0IDYyLjkwODQ4NjYgMTguMjk0ODc0OCA2MC4zNTQ1OTUxIDE2LjA3OTE4MjEgNTcuODAwNzAzNSAxMy45MDAzMzA5IDU1LjI3NjM5MDIgMTEuNzU4MjU1OCA1Mi43ODE1Nzk0IDkuNjE2MTgwNjYgNTAuMjg2NzY4NiA3LjYzMTkxNjIgNDguMDY0MDYzNCA1LjgwNTQwMjg2IDQ2LjExMzM5NyA0Ljc2NzU5MTI4IDQ0LjUwNDc5NjUgNC4zOTc1MTQ5MiA0Mi45OTU3NTI2IDQuNjk1MTYyNjYgNDEuNTg2MjIgNS4wNDUzMzY0OCAzOS45Mjc5NDY0IDYuMTM0MjU1NDMgMzguNjQ0NDAyNyA3Ljk2MTk1MjE2IDM3LjczNTU1MDZMMTEuMjE0NzIyNyAzNi4wOTE2OTQyQzEyLjkwMTM1MjggMzUuMjM5MzIgMTQuOTQwNjE4OCAzNC4yNDU3NjU4IDE3LjMzMjU4MTggMzMuMTExMDAyMSAxOS43MjQ1NDQ4IDMxLjk3NjIzODMgMjIuMjQ1Njk3OSAzMC43MzkxNTIzIDI0Ljg5NjExNjcgMjkuMzk5NzA3MSAyNy41NDY1MzU2IDI4LjA2MDI2MTkgMzAuMDY3Njg4NyAyNi44MjMxNzU5IDMyLjQ1OTY1MTcgMjUuNjg4NDEyMSAzNC44NTE2MTQ3IDI0LjU1MzY0ODMgMzYuOTE1ODUwNCAyMy41NDM3NzIgMzguNjUyNDIwOSAyMi42NTg3NTI4IDQwLjM4ODk5MTQgMjEuNzczNzMzNyA0MS40NDgyNjc2IDIxLjI0MjEwOTMgNDEuODMwMjgxMyAyMS4wNjM4NjM2IDQzLjU5MzUwNTkgMjAuMjI4NTE1NiA1My42MTYyMTA5IDE4Ljc5MjIzNjMgNTIuNDIxNzM5MSAyMi43MzI1NDkxTDQ3LjkxMTU1NTYgMzkuODAwODMwOUM0Ny44MDc3ODA1IDQwLjE5MzU1NjEgNDcuNDc2NzUyIDQwLjQ4NDQ4NjMgNDcuMDczOTUyNCA0MC41MzY5NzNMMTguMDY1NjA5IDQ0LjMxNjg5OTFDMTkuNDUwNDE2OSA0NS45MTMwODEzIDIxLjA2MzUxNDggNDcuNzUzMDY5MiAyMi45MDQ5NTExIDQ5LjgzNjkxOCAyNC43NDYzODczIDUxLjkyMDc2NjggMjYuNTk5NjM0NCA1NC4wNTA0NDY0IDI4LjQ2NDc0NzkgNTYuMjI2MDIwOCAzMC4zMjk4NjE1IDU4LjQwMTU5NTIgMzIuMTgzMTA4NiA2MC41MzEyNzQ4IDM0LjAyNDU0NDggNjIuNjE1MTIzNiAzNS44NjU5ODExIDY0LjY5ODk3MjMgMzcuNDc5MDc5IDY2LjUzODk2MDIgMzguODYzODg2OSA2OC4xMzUxNDI0ek02Ny4yMDkwMzUzIDc2LjIyMjE3NzNDNjUuOTE5OTI4NSA3Ny4xMDg2NzYgNjUuMDU1NzE0NyA3OC4xODQ0MjI1IDY0LjYxNjM2OCA3OS40NDk0NDkxIDY0LjE3NzAyMTMgODAuNzE0NDc1NiA2NC4yNTE3OTU5IDgxLjkxMTc4OTcgNjQuODQwNjk0IDgzLjA0MTQyNzEgNjUuNDI5NTkyMSA4NC4xNzEwNjQ0IDY2LjQwMTg3NzggODQuOTY3Mjc1IDY3Ljc1NzU4MDQgODUuNDMwMDgyNSA2OC42MzQ3OTk4IDg1LjcyOTU0NjIgNjkuNzE0MDAxMiA4NS44MzI2NTE5IDcwLjk5NTIxNzIgODUuNzM5NDAyNSA3My40ODMxNjI1IDg0Ljk5Njg0NyA3Ni4yNzg5NTU0IDg0LjEzODMxNTkgNzkuMzgyNjc5OSA4My4xNjM3ODM0IDgyLjQ4NjQwNDMgODIuMTg5MjUwOCA4NS42NDM2ODQ1IDgxLjE4ODgxMzMgODguODU0NjE1MyA4MC4xNjI0NDA2IDkyLjA2NTU0NjEgNzkuMTM2MDY3OSA5NS4yMjk2OTExIDc4LjExNTg2NDUgOTguMzQ3MTQ1MSA3Ny4xMDE4IDEwMS40NjQ1OTkgNzYuMDg3NzM1NCAxMDQuMzA3MTMgNzUuMjIzMDUwMyAxMDYuODc0ODIyIDc0LjUwNzcxODcgMTA4LjU5MDEyNCA3My42NzgyNzU3IDEwOS42ODExNjIgNzIuNTkxNTI1MiAxMTAuMTQ3OTY4IDcxLjI0NzQzNDQgMTEwLjY5NzE1MSA2OS42NjYxNTEyIDExMC40MjAwOTIgNjguMDIzOTI1MyAxMDkuMzE2NzgzIDY2LjMyMDcwNzRMMTA3LjM2NjcyMSA2My4yNjcxODEzQzEwNi4zNTU1NzQgNjEuNjgzODYzNSAxMDUuMTE0MDQgNTkuODAwODIzNiAxMDMuNjQyMDg0IDU3LjYxODAwNTMgMTAyLjE3MDEyOCA1NS40MzUxODY5IDEwMC42Mzk3IDUzLjA5OTc3NzMgOTkuMDUwNzUyOSA1MC42MTE3MDY1IDk3LjQ2MTgwNjIgNDguMTIzNjM1NyA5NS45MzEzNzc4IDQ1Ljc4ODIyNjIgOTQuNDU5NDIxNyA0My42MDU0MDc4IDkyLjk4NzQ2NTYgNDEuNDIyNTg5NCA5MS43MzI4NjA0IDM5LjUxMjk3NzkgOTAuNjk1NTY4NSAzNy44NzY1MTYxIDg5LjY1ODI3NjYgMzYuMjQwMDU0MiA4OS4wMjEzMzQ1IDM1LjI0ODc5NCA4OC43ODQ3MjMyIDM0LjkwMjcwNTYgODcuMzQ1NzAzMSAzMi43OTE5OTIyIDgwLjMwMTAyNTQgMjYuMjA4MDA3OCA3OC44MzY5MDA1IDMwLjg5NzA2OTJMNzMuOTY1NDc4OSA0Ny42MjQyMDU2QzczLjg1MTMxODQgNDguMDE2MjAxNCA3My45ODY5MjQ5IDQ4LjQzODIzMTYgNzQuMzA4MDU1MSA0OC42OTAzNjAxTDk3LjI3MDE3MjUgNjYuNzE4NTc3MUM5NS4yNjMzNDA4IDY3LjM2MDA2MDEgOTIuOTM1NTgyNCA2OC4wOTA5NDg1IDkwLjI4NjgyNzUgNjguOTExMjY0MyA4Ny42MzgwNzI2IDY5LjczMTU4MDEgODQuOTU1NjkxNiA3MC41ODQ2MDkyIDgyLjIzOTYwMzkgNzEuNDcwMzc3MiA3OS41MjM1MTYzIDcyLjM1NjE0NTIgNzYuODQxMTM1MiA3My4yMDkxNzQzIDc0LjE5MjM4MDMgNzQuMDI5NDkwMiA3MS41NDM2MjU1IDc0Ljg0OTgwNiA2OS4yMTU4NjcxIDc1LjU4MDY5NDQgNjcuMjA5MDM1MyA3Ni4yMjIxNzczek02NS40NTAxNDAxIDguMDExMzExMThDNjYuMzEwNzkzNSA2LjQ4NjA4MTI5IDY3LjMwOTM3MDYgNS40MzUyNTUyMyA2OC40NDU5MDEyIDQuODU4ODAxNDcgNjkuNTgyNDMxOCA0LjI4MjM0NzcxIDcwLjczMjI1OTUgNC4xNDc0MzIwNiA3MS44OTU0MTg4IDQuNDU0MDUwNDggNzIuOTc1NDk1MyA0LjczODc2NzU5IDczLjg5MzA2NzEgNS4zNzQ4NjQ4NyA3NC42NDgxNjE2IDYuMzYyMzYxNDEgNzUuNDAzMjU2MiA3LjM0OTg1Nzk1IDc1Ljc3NzAxNjEgOC42NzQ4Mzk0NiA3NS43Njk0NTI3IDEwLjMzNzM0NTdMNTEuMzkyNzE2IDk5LjgzODcxOTdDNTAuNzk3NjA3OSAxMDEuNjk2NzY1IDQ5Ljg1Mjc5NDEgMTAyLjk1ODg3MyA0OC41NTgyNDYzIDEwMy42MjUwOCA0Ny4yNjM2OTg2IDEwNC4yOTEyODcgNDUuOTkzMzIyNyAxMDQuNDYwMTI4IDQ0Ljc0NzA4MDYgMTA0LjEzMTYwOCA0My41ODM5MjEyIDEwMy44MjQ5OSA0Mi42MjA3MzQ1IDEwMy4xMTExNjUgNDEuODU3NDkxNSAxMDEuOTkwMTEzIDQxLjA5NDI0ODUgMTAwLjg2OTA2IDQwLjgzMjg4ODQgOTkuMzc2NTk5MyA0MS4wNzM0MDM0IDk3LjUxMjY4NTJMNjUuNDUwMTQwMSA4LjAxMTMxMTE4elwiPlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9Mb2dvLmltYmEiXSwic291cmNlUm9vdCI6IiJ9