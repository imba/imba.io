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

var Imba = {VERSION: '1.3.0-beta.8'};

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
					($[21] || _1(GuidesPage,$,21,19)).setData(this.app().guide()).end()
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
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
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
        text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
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
      out += this.renderer.codespan(escape(cap[2], true));
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
      return '';
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
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
  return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/g, function(_, n) {
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
      return '<p>An error occured:</p><pre>'
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
  xhtml: false
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
							$$.push(($0[i] || _1(GuideTOC,$0,i)).setData(self.data()).setToc(child).end());
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
						$$.push(($0[i] || _1(TOC,$0,i)).setData(self.data()).setToc(child).end());
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
										($0[j] || _1(TOC,$0,j)).setData(self.data()[section]).setExpanded((self.data()[section] == curr)).end();
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
					($[($1 = '4$' + self.guide().id)] || _1(Guide,$,$1,3)).setData(self.guide()).end()
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMjc2ZWVmNWJhNGRlMDRiNGM1NDUiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvaW1iYS5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2ltYmEuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvUGFnZS5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9wb2ludGVyLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1NuaXBwZXQuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvY2xpZW50LmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvaW5kZXguaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9zY2hlZHVsZXIuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vaW5kZXguaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vbWFuYWdlci5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS90YWcuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vaHRtbC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS90b3VjaC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC1tYW5hZ2VyLmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvZG9tL3JlY29uY2lsZXIuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWwvcm91dGVyLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1NpdGUuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvSG9tZVBhZ2UuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvTWFya2VkLmltYmEiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL21hcmtlZC9saWIvbWFya2VkLmpzIiwid2VicGFjazovLy8od2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1BhdHRlcm4uaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvR3VpZGVzUGFnZS5pbWJhIiwid2VicGFjazovLy8uL3NyYy92aWV3cy9Eb2NzUGFnZS5pbWJhIiwid2VicGFjazovLy8uL2xlc3Mvc2l0ZS5sZXNzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztBQzdEQSxPQUFPLFFBQVE7Ozs7Ozs7Ozs7OztJQ0lYLEtBQUs7Ozs7Ozs7Ozs7QUFTVDtRQUNDO0VBQ0M7U0FDQSxLQUFLO0dBRk87Ozs7Ozs7Ozs7O0FBV2Q7UUFDQyxZQUFZLE1BQU07Ozs7Ozs7QUFLbkI7UUFDQyxjQUFjOzs7Ozs7O0FBS2Y7UUFDQyxhQUFhOzs7O0FBR2Q7Q0FDQzs7YUFDWSxJQUFHLElBQUksZUFBZSxNQUFqQyxJQUFJLEdBQUcsRUFBRTs7O0NBRVYsSUFBSSxVQUFVLEVBQUUsT0FBTyxPQUFPLElBQUk7Q0FDbEMsSUFBSSxVQUFVLEVBQUUsSUFBSSxVQUFVLFVBQVUsRUFBRSxJQUFJO0NB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QjtBQUM5QjtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsRUFBRTtBQUNuQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFFBQVEsT0FBTztBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsaUJBQWlCLDhCQUE4QjtBQUMvQyxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNB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WSxHQUFJLEVBQUU7O0lBRTdFLElBQUcsS0FBSyxhQUExQixPQUFPLEtBQUs7Ozs7OztDQUdmOztFQUNhLE1BQU87OztRQUdkLHdGQUFPO3NCQVdWOztRQVhHOzs7O01BQ0gsOEJBQVk7OzBDQUNMLFlBQUksY0FBTSxnQkFBUTs4QkFDdEIsMERBQW9COzhCQUNwQjtnQ0FDQztnQ0FHQTs7Ozt3QkFMYzs7Ozs7O1dBR2QsNEJBQVk7O2tCQUFlLEtBQUssS0FBSyxJQUFLLEtBQUs7dURBQzdDLHdEQUFvQixTQUFNOzRCQUFaOzs7Ozs7OztXQUVoQiw0QkFBWTs7a0JBQWUsS0FBSyxLQUFLLElBQUssS0FBSzt1REFDN0Msd0RBQW9CLFNBQU07NEJBQVo7Ozs7Ozs7Ozs7Ozs7S0FFcEIsOEJBQVk7K0JBQ0MsWUFBSSxtQkFBVDs7Ozs7Ozs7Ozs7Ozs7QUNuT1oseUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDUpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDI3NmVlZjViYTRkZTA0YjRjNTQ1IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlIFwiLi9zcmMvaW1iYS9pbmRleC5pbWJhXCJcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9pbWJhLmltYmEiLCIjIyNcbkltYmEgaXMgdGhlIG5hbWVzcGFjZSBmb3IgYWxsIHJ1bnRpbWUgcmVsYXRlZCB1dGlsaXRpZXNcbkBuYW1lc3BhY2VcbiMjI1xudmFyIEltYmEgPSB7VkVSU0lPTjogJzEuMy4wLWJldGEuOCd9XG5cbiMjI1xuXG5MaWdodCB3cmFwcGVyIGFyb3VuZCBuYXRpdmUgc2V0VGltZW91dCB0aGF0IGV4cGVjdHMgdGhlIGJsb2NrIC8gZnVuY3Rpb25cbmFzIGxhc3QgYXJndW1lbnQgKGluc3RlYWQgb2YgZmlyc3QpLiBJdCBhbHNvIHRyaWdnZXJzIGFuIGV2ZW50IHRvIEltYmFcbmFmdGVyIHRoZSB0aW1lb3V0IHRvIGxldCBzY2hlZHVsZXJzIHVwZGF0ZSAodG8gcmVyZW5kZXIgZXRjKSBhZnRlcndhcmRzLlxuXG4jIyNcbmRlZiBJbWJhLnNldFRpbWVvdXQgZGVsYXksICZibG9ja1xuXHRzZXRUaW1lb3V0KCYsZGVsYXkpIGRvXG5cdFx0YmxvY2soKVxuXHRcdEltYmEuY29tbWl0XG5cbiMjI1xuXG5MaWdodCB3cmFwcGVyIGFyb3VuZCBuYXRpdmUgc2V0SW50ZXJ2YWwgdGhhdCBleHBlY3RzIHRoZSBibG9jayAvIGZ1bmN0aW9uXG5hcyBsYXN0IGFyZ3VtZW50IChpbnN0ZWFkIG9mIGZpcnN0KS4gSXQgYWxzbyB0cmlnZ2VycyBhbiBldmVudCB0byBJbWJhXG5hZnRlciBldmVyeSBpbnRlcnZhbCB0byBsZXQgc2NoZWR1bGVycyB1cGRhdGUgKHRvIHJlcmVuZGVyIGV0YykgYWZ0ZXJ3YXJkcy5cblxuIyMjXG5kZWYgSW1iYS5zZXRJbnRlcnZhbCBpbnRlcnZhbCwgJmJsb2NrXG5cdHNldEludGVydmFsKGJsb2NrLGludGVydmFsKVxuXG4jIyNcbkNsZWFyIGludGVydmFsIHdpdGggc3BlY2lmaWVkIGlkXG4jIyNcbmRlZiBJbWJhLmNsZWFySW50ZXJ2YWwgaWRcblx0Y2xlYXJJbnRlcnZhbChpZClcblxuIyMjXG5DbGVhciB0aW1lb3V0IHdpdGggc3BlY2lmaWVkIGlkXG4jIyNcbmRlZiBJbWJhLmNsZWFyVGltZW91dCBpZFxuXHRjbGVhclRpbWVvdXQoaWQpXG5cblxuZGVmIEltYmEuc3ViY2xhc3Mgb2JqLCBzdXBcblx0Zm9yIGssdiBvZiBzdXBcblx0XHRvYmpba10gPSB2IGlmIHN1cC5oYXNPd25Qcm9wZXJ0eShrKVxuXG5cdG9iajpwcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cDpwcm90b3R5cGUpXG5cdG9iajpfX3N1cGVyX18gPSBvYmo6cHJvdG90eXBlOl9fc3VwZXJfXyA9IHN1cDpwcm90b3R5cGVcblx0b2JqOnByb3RvdHlwZTppbml0aWFsaXplID0gb2JqOnByb3RvdHlwZTpjb25zdHJ1Y3RvciA9IG9ialxuXHRyZXR1cm4gb2JqXG5cbiMjI1xuTGlnaHR3ZWlnaHQgbWV0aG9kIGZvciBtYWtpbmcgYW4gb2JqZWN0IGl0ZXJhYmxlIGluIGltYmFzIGZvci9pbiBsb29wcy5cbklmIHRoZSBjb21waWxlciBjYW5ub3Qgc2F5IGZvciBjZXJ0YWluIHRoYXQgYSB0YXJnZXQgaW4gYSBmb3IgbG9vcCBpcyBhblxuYXJyYXksIGl0IHdpbGwgY2FjaGUgdGhlIGl0ZXJhYmxlIHZlcnNpb24gYmVmb3JlIGxvb3BpbmcuXG5cbmBgYGltYmFcbiMgdGhpcyBpcyB0aGUgd2hvbGUgbWV0aG9kXG5kZWYgSW1iYS5pdGVyYWJsZSBvXG5cdHJldHVybiBvID8gKG86dG9BcnJheSA/IG8udG9BcnJheSA6IG8pIDogW11cblxuY2xhc3MgQ3VzdG9tSXRlcmFibGVcblx0ZGVmIHRvQXJyYXlcblx0XHRbMSwyLDNdXG5cbiMgd2lsbCByZXR1cm4gWzIsNCw2XVxuZm9yIHggaW4gQ3VzdG9tSXRlcmFibGUubmV3XG5cdHggKiAyXG5cbmBgYFxuIyMjXG5kZWYgSW1iYS5pdGVyYWJsZSBvXG5cdHJldHVybiBvID8gKG86dG9BcnJheSA/IG8udG9BcnJheSA6IG8pIDogW11cblxuIyMjXG5Db2VyY2VzIGEgdmFsdWUgaW50byBhIHByb21pc2UuIElmIHZhbHVlIGlzIGFycmF5IGl0IHdpbGxcbmNhbGwgYFByb21pc2UuYWxsKHZhbHVlKWAsIG9yIGlmIGl0IGlzIG5vdCBhIHByb21pc2UgaXQgd2lsbFxud3JhcCB0aGUgdmFsdWUgaW4gYFByb21pc2UucmVzb2x2ZSh2YWx1ZSlgLiBVc2VkIGZvciBleHBlcmltZW50YWxcbmF3YWl0IHN5bnRheC5cbkByZXR1cm4ge1Byb21pc2V9XG4jIyNcbmRlZiBJbWJhLmF3YWl0IHZhbHVlXG5cdGlmIHZhbHVlIGlzYSBBcnJheVxuXHRcdGNvbnNvbGUud2FybihcImF3YWl0IChBcnJheSkgaXMgZGVwcmVjYXRlZCAtIHVzZSBhd2FpdCBQcm9taXNlLmFsbChBcnJheSlcIilcblx0XHRQcm9taXNlLmFsbCh2YWx1ZSlcblx0ZWxpZiB2YWx1ZSBhbmQgdmFsdWU6dGhlblxuXHRcdHZhbHVlXG5cdGVsc2Vcblx0XHRQcm9taXNlLnJlc29sdmUodmFsdWUpXG5cbnZhciBkYXNoUmVnZXggPSAvLS4vZ1xudmFyIHNldHRlckNhY2hlID0ge31cblxuZGVmIEltYmEudG9DYW1lbENhc2Ugc3RyXG5cdGlmIHN0ci5pbmRleE9mKCctJykgPj0gMFxuXHRcdHN0ci5yZXBsYWNlKGRhc2hSZWdleCkgZG8gfG18IG0uY2hhckF0KDEpLnRvVXBwZXJDYXNlXG5cdGVsc2Vcblx0XHRzdHJcblx0XHRcbmRlZiBJbWJhLnRvU2V0dGVyIHN0clxuXHRzZXR0ZXJDYWNoZVtzdHJdIHx8PSBJbWJhLnRvQ2FtZWxDYXNlKCdzZXQtJyArIHN0cilcblxuZGVmIEltYmEuaW5kZXhPZiBhLGJcblx0cmV0dXJuIChiICYmIGI6aW5kZXhPZikgPyBiLmluZGV4T2YoYSkgOiBbXTppbmRleE9mLmNhbGwoYSxiKVxuXG5kZWYgSW1iYS5sZW4gYVxuXHRyZXR1cm4gYSAmJiAoYTpsZW4gaXNhIEZ1bmN0aW9uID8gYTpsZW4uY2FsbChhKSA6IGE6bGVuZ3RoKSBvciAwXG5cbmRlZiBJbWJhLnByb3Agc2NvcGUsIG5hbWUsIG9wdHNcblx0aWYgc2NvcGU6ZGVmaW5lUHJvcGVydHlcblx0XHRyZXR1cm4gc2NvcGUuZGVmaW5lUHJvcGVydHkobmFtZSxvcHRzKVxuXHRyZXR1cm5cblxuZGVmIEltYmEuYXR0ciBzY29wZSwgbmFtZSwgb3B0cyA9IHt9XG5cdGlmIHNjb3BlOmRlZmluZUF0dHJpYnV0ZVxuXHRcdHJldHVybiBzY29wZS5kZWZpbmVBdHRyaWJ1dGUobmFtZSxvcHRzKVxuXG5cdGxldCBnZXROYW1lID0gSW1iYS50b0NhbWVsQ2FzZShuYW1lKVxuXHRsZXQgc2V0TmFtZSA9IEltYmEudG9DYW1lbENhc2UoJ3NldC0nICsgbmFtZSlcblx0bGV0IHByb3RvID0gc2NvcGU6cHJvdG90eXBlXG5cblx0aWYgb3B0czpkb21cblx0XHRwcm90b1tnZXROYW1lXSA9IGRvIHRoaXMuZG9tW25hbWVdXG5cdFx0cHJvdG9bc2V0TmFtZV0gPSBkbyB8dmFsdWV8XG5cdFx0XHRpZiB2YWx1ZSAhPSB0aGlzW25hbWVdKClcblx0XHRcdFx0dGhpcy5kb21bbmFtZV0gPSB2YWx1ZVxuXHRcdFx0cmV0dXJuIHRoaXNcblx0ZWxzZVxuXHRcdHByb3RvW2dldE5hbWVdID0gZG8gdGhpcy5nZXRBdHRyaWJ1dGUobmFtZSlcblx0XHRwcm90b1tzZXROYW1lXSA9IGRvIHx2YWx1ZXxcblx0XHRcdHRoaXMuc2V0QXR0cmlidXRlKG5hbWUsdmFsdWUpXG5cdFx0XHRyZXR1cm4gdGhpc1xuXHRyZXR1cm5cblxuZGVmIEltYmEucHJvcERpZFNldCBvYmplY3QsIHByb3BlcnR5LCB2YWwsIHByZXZcblx0bGV0IGZuID0gcHJvcGVydHk6d2F0Y2hcblx0aWYgZm4gaXNhIEZ1bmN0aW9uXG5cdFx0Zm4uY2FsbChvYmplY3QsdmFsLHByZXYscHJvcGVydHkpXG5cdGVsaWYgZm4gaXNhIFN0cmluZyBhbmQgb2JqZWN0W2ZuXVxuXHRcdG9iamVjdFtmbl0odmFsLHByZXYscHJvcGVydHkpXG5cdHJldHVyblxuXG5cbiMgQmFzaWMgZXZlbnRzXG5kZWYgZW1pdF9fIGV2ZW50LCBhcmdzLCBub2RlXG5cdCMgdmFyIG5vZGUgPSBjYnNbZXZlbnRdXG5cdHZhciBwcmV2LCBjYiwgcmV0XG5cblx0d2hpbGUgKHByZXYgPSBub2RlKSBhbmQgKG5vZGUgPSBub2RlOm5leHQpXG5cdFx0aWYgY2IgPSBub2RlOmxpc3RlbmVyXG5cdFx0XHRpZiBub2RlOnBhdGggYW5kIGNiW25vZGU6cGF0aF1cblx0XHRcdFx0cmV0ID0gYXJncyA/IGNiW25vZGU6cGF0aF0uYXBwbHkoY2IsYXJncykgOiBjYltub2RlOnBhdGhdKClcblx0XHRcdGVsc2Vcblx0XHRcdFx0IyBjaGVjayBpZiBpdCBpcyBhIG1ldGhvZD9cblx0XHRcdFx0cmV0ID0gYXJncyA/IGNiLmFwcGx5KG5vZGUsIGFyZ3MpIDogY2IuY2FsbChub2RlKVxuXG5cdFx0aWYgbm9kZTp0aW1lcyAmJiAtLW5vZGU6dGltZXMgPD0gMFxuXHRcdFx0cHJldjpuZXh0ID0gbm9kZTpuZXh0XG5cdFx0XHRub2RlOmxpc3RlbmVyID0gbnVsbFxuXHRyZXR1cm5cblxuIyBtZXRob2QgZm9yIHJlZ2lzdGVyaW5nIGEgbGlzdGVuZXIgb24gb2JqZWN0XG5kZWYgSW1iYS5saXN0ZW4gb2JqLCBldmVudCwgbGlzdGVuZXIsIHBhdGhcblx0dmFyIGNicywgbGlzdCwgdGFpbFxuXHRjYnMgPSBvYmo6X19saXN0ZW5lcnNfXyB8fD0ge31cblx0bGlzdCA9IGNic1tldmVudF0gfHw9IHt9XG5cdHRhaWwgPSBsaXN0OnRhaWwgfHwgKGxpc3Q6dGFpbCA9IChsaXN0Om5leHQgPSB7fSkpXG5cdHRhaWw6bGlzdGVuZXIgPSBsaXN0ZW5lclxuXHR0YWlsOnBhdGggPSBwYXRoXG5cdGxpc3Q6dGFpbCA9IHRhaWw6bmV4dCA9IHt9XG5cdHJldHVybiB0YWlsXG5cbiMgcmVnaXN0ZXIgYSBsaXN0ZW5lciBvbmNlXG5kZWYgSW1iYS5vbmNlIG9iaiwgZXZlbnQsIGxpc3RlbmVyXG5cdHZhciB0YWlsID0gSW1iYS5saXN0ZW4ob2JqLGV2ZW50LGxpc3RlbmVyKVxuXHR0YWlsOnRpbWVzID0gMVxuXHRyZXR1cm4gdGFpbFxuXG4jIHJlbW92ZSBhIGxpc3RlbmVyXG5kZWYgSW1iYS51bmxpc3RlbiBvYmosIGV2ZW50LCBjYiwgbWV0aFxuXHR2YXIgbm9kZSwgcHJldlxuXHR2YXIgbWV0YSA9IG9iajpfX2xpc3RlbmVyc19fXG5cdHJldHVybiB1bmxlc3MgbWV0YVxuXG5cdGlmIG5vZGUgPSBtZXRhW2V2ZW50XVxuXHRcdHdoaWxlIChwcmV2ID0gbm9kZSkgYW5kIChub2RlID0gbm9kZTpuZXh0KVxuXHRcdFx0aWYgbm9kZSA9PSBjYiB8fCBub2RlOmxpc3RlbmVyID09IGNiXG5cdFx0XHRcdHByZXY6bmV4dCA9IG5vZGU6bmV4dFxuXHRcdFx0XHQjIGNoZWNrIGZvciBjb3JyZWN0IHBhdGggYXMgd2VsbD9cblx0XHRcdFx0bm9kZTpsaXN0ZW5lciA9IG51bGxcblx0XHRcdFx0YnJlYWtcblx0cmV0dXJuXG5cbiMgZW1pdCBldmVudFxuZGVmIEltYmEuZW1pdCBvYmosIGV2ZW50LCBwYXJhbXNcblx0aWYgdmFyIGNiID0gb2JqOl9fbGlzdGVuZXJzX19cblx0XHRlbWl0X18oZXZlbnQscGFyYW1zLGNiW2V2ZW50XSkgaWYgY2JbZXZlbnRdXG5cdFx0ZW1pdF9fKGV2ZW50LFtldmVudCxwYXJhbXNdLGNiOmFsbCkgaWYgY2I6YWxsICMgYW5kIGV2ZW50ICE9ICdhbGwnXG5cdHJldHVyblxuXG5kZWYgSW1iYS5vYnNlcnZlUHJvcGVydHkgb2JzZXJ2ZXIsIGtleSwgdHJpZ2dlciwgdGFyZ2V0LCBwcmV2XG5cdGlmIHByZXYgYW5kIHR5cGVvZiBwcmV2ID09ICdvYmplY3QnXG5cdFx0SW1iYS51bmxpc3RlbihwcmV2LCdhbGwnLG9ic2VydmVyLHRyaWdnZXIpXG5cdGlmIHRhcmdldCBhbmQgdHlwZW9mIHRhcmdldCA9PSAnb2JqZWN0J1xuXHRcdEltYmEubGlzdGVuKHRhcmdldCwnYWxsJyxvYnNlcnZlcix0cmlnZ2VyKVxuXHRzZWxmXG5cbm1vZHVsZTpleHBvcnRzID0gSW1iYVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvaW1iYS5pbWJhIiwiZXhwb3J0IHRhZyBQYWdlXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL1BhZ2UuaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuY2xhc3MgSW1iYS5Qb2ludGVyXG5cdFxuXHRkZWYgaW5pdGlhbGl6ZVxuXHRcdEBidXR0b24gPSAtMVxuXHRcdEBldmVudCA9IHt4OiAwLCB5OiAwLCB0eXBlOiAndW5pbml0aWFsaXplZCd9XG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgYnV0dG9uXG5cdFx0QGJ1dHRvblxuXG5cdGRlZiB0b3VjaFxuXHRcdEB0b3VjaFxuXG5cdGRlZiB1cGRhdGUgZVxuXHRcdEBldmVudCA9IGVcblx0XHRAZGlydHkgPSB5ZXNcblx0XHRzZWxmXG5cblx0IyB0aGlzIGlzIGp1c3QgZm9yIHJlZ3VsYXIgbW91c2Ugbm93XG5cdGRlZiBwcm9jZXNzXG5cdFx0dmFyIGUxID0gQGV2ZW50XG5cblx0XHRpZiBAZGlydHlcblx0XHRcdEBwcmV2RXZlbnQgPSBlMVxuXHRcdFx0QGRpcnR5ID0gbm9cblxuXHRcdFx0IyBidXR0b24gc2hvdWxkIG9ubHkgY2hhbmdlIG9uIG1vdXNlZG93biBldGNcblx0XHRcdGlmIGUxOnR5cGUgPT0gJ21vdXNlZG93bidcblx0XHRcdFx0QGJ1dHRvbiA9IGUxOmJ1dHRvblxuXG5cdFx0XHRcdGlmIChAdG91Y2ggYW5kIEBidXR0b24gIT0gMClcblx0XHRcdFx0XHRyZXR1cm5cblxuXHRcdFx0XHQjIGNhbmNlbCB0aGUgcHJldmlvdXMgdG91Y2hcblx0XHRcdFx0QHRvdWNoLmNhbmNlbCBpZiBAdG91Y2hcblx0XHRcdFx0QHRvdWNoID0gSW1iYS5Ub3VjaC5uZXcoZTEsc2VsZilcblx0XHRcdFx0QHRvdWNoLm1vdXNlZG93bihlMSxlMSlcblxuXHRcdFx0ZWxpZiBlMTp0eXBlID09ICdtb3VzZW1vdmUnXG5cdFx0XHRcdEB0b3VjaC5tb3VzZW1vdmUoZTEsZTEpIGlmIEB0b3VjaFxuXG5cdFx0XHRlbGlmIGUxOnR5cGUgPT0gJ21vdXNldXAnXG5cdFx0XHRcdEBidXR0b24gPSAtMVxuXG5cdFx0XHRcdGlmIEB0b3VjaCBhbmQgQHRvdWNoLmJ1dHRvbiA9PSBlMTpidXR0b25cblx0XHRcdFx0XHRAdG91Y2gubW91c2V1cChlMSxlMSlcblx0XHRcdFx0XHRAdG91Y2ggPSBudWxsXG5cdFx0XHRcdCMgdHJpZ2dlciBwb2ludGVydXBcblx0XHRlbGlmIEB0b3VjaFxuXHRcdFx0QHRvdWNoLmlkbGVcblx0XHRzZWxmXG5cblx0ZGVmIHggZG8gQGV2ZW50Onhcblx0ZGVmIHkgZG8gQGV2ZW50Onlcblx0XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL3BvaW50ZXIuaW1iYSIsImV4dGVybiBldmFsXG5cbmV4cG9ydCB0YWcgU25pcHBldFxuXHRwcm9wIHNyY1xuXHRwcm9wIGhlYWRpbmdcblx0cHJvcCBobFxuXHRcblx0ZGVmIHNlbGYucmVwbGFjZSBkb21cblx0XHRsZXQgaW1iYSA9IGRvbTpmaXJzdENoaWxkXG5cdFx0bGV0IGpzID0gaW1iYTpuZXh0U2libGluZ1xuXHRcdGxldCBoaWdobGlnaHRlZCA9IGltYmE6aW5uZXJIVE1MXG5cdFx0bGV0IHJhdyA9IGRvbTp0ZXh0Q29udGVudFxuXHRcdGxldCBkYXRhID1cblx0XHRcdGNvZGU6IHJhd1xuXHRcdFx0aHRtbDogaGlnaGxpZ2h0ZWRcblx0XHRcdGpzOiB7XG5cdFx0XHRcdGNvZGU6IGpzOnRleHRDb250ZW50XG5cdFx0XHRcdGh0bWw6IGpzOmlubmVySFRNTFxuXHRcdFx0fVxuXG5cdFx0bGV0IHNuaXBwZXQgPSA8U25pcHBldFtkYXRhXT5cblx0XHRkb206cGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoc25pcHBldC5kb20sZG9tKVxuXHRcdHJldHVybiBzbmlwcGV0XG5cdFx0XG5cdGRlZiBzZXR1cFxuXHRcdHJlbmRlclxuXHRcdEBjb2RlLmRvbTppbm5lckhUTUwgPSBkYXRhOmh0bWxcblx0XHRydW5cblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBydW5cblx0XHR2YXIgb3JpZyA9IEltYmE6bW91bnRcblx0XHRcblx0XHQjIHZhciBqcyA9ICd2YXIgcmVxdWlyZSA9IGZ1bmN0aW9uKCl7IHJldHVybiBJbWJhIH07XFxuJyArIGRhdGE6anM6Y29kZVxuXHRcdHZhciBqcyA9IGRhdGE6anM6Y29kZVxuXHRcdGNvbnNvbGUubG9nIEltYmFcblx0XHRqcyA9IGpzLnJlcGxhY2UoXCJyZXF1aXJlKCdpbWJhJylcIiwnd2luZG93LkltYmEnKVxuXHRcdHRyeVxuXHRcdFx0SW1iYTptb3VudCA9IGRvIHxpdGVtfCBvcmlnLmNhbGwoSW1iYSxpdGVtLEByZXN1bHQuZG9tKVxuXHRcdFx0Y29uc29sZS5sb2cgXCJydW4gY29kZVwiLCBqc1xuXHRcdFx0ZXZhbChqcylcblx0XHRcblx0XHRJbWJhOm1vdW50ID0gb3JpZ1xuXHRcdHNlbGZcblxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZi5zbmlwcGV0PlxuXHRcdFx0PGNvZGVAY29kZT5cblx0XHRcdDxkaXZAcmVzdWx0LnN0eWxlZC1leGFtcGxlPlxuXHRcdFxuZXhwb3J0IHRhZyBFeGFtcGxlIDwgU25pcHBldFxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj4gXCJFeGFtcGxlXCJcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvU25pcHBldC5pbWJhIiwiXG5pbXBvcnQgQXBwIGZyb20gJy4vYXBwJ1xuaW1wb3J0IFNpdGUgZnJvbSAnLi92aWV3cy9TaXRlJ1xuZG9jdW1lbnQ6Ym9keTppbm5lckhUTUwgPSAnJyBcbkltYmEubW91bnQgPFNpdGVbQVBQID0gQXBwLmRlc2VyaWFsaXplKEFQUENBQ0hFKV0+XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2NsaWVudC5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi9pbWJhXCIpXG52YXIgYWN0aXZhdGUgPSBub1xuaWYgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcblx0aWYgd2luZG93LkltYmFcblx0XHRjb25zb2xlLndhcm4gXCJJbWJhIHZ7d2luZG93LkltYmEuVkVSU0lPTn0gaXMgYWxyZWFkeSBsb2FkZWQuXCJcblx0XHRJbWJhID0gd2luZG93LkltYmFcblx0ZWxzZVxuXHRcdHdpbmRvdy5JbWJhID0gSW1iYVxuXHRcdGFjdGl2YXRlID0geWVzXG5cdFx0aWYgd2luZG93OmRlZmluZSBhbmQgd2luZG93OmRlZmluZTphbWRcblx0XHRcdHdpbmRvdy5kZWZpbmUoXCJpbWJhXCIsW10pIGRvIHJldHVybiBJbWJhXG5cbm1vZHVsZS5leHBvcnRzID0gSW1iYVxuXG51bmxlc3MgJHdlYndvcmtlciRcblx0cmVxdWlyZSAnLi9zY2hlZHVsZXInXG5cdHJlcXVpcmUgJy4vZG9tL2luZGV4J1xuXG5pZiAkd2ViJCBhbmQgYWN0aXZhdGVcblx0SW1iYS5FdmVudE1hbmFnZXIuYWN0aXZhdGVcblx0XG5pZiAkbm9kZSRcblx0dW5sZXNzICR3ZWJwYWNrJFxuXHRcdHJlcXVpcmUgJy4uLy4uL3JlZ2lzdGVyLmpzJ1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvaW5kZXguaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4vaW1iYVwiKVxuXG52YXIgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICMgdmVyeSBzaW1wbGUgcmFmIHBvbHlmaWxsXG52YXIgY2FuY2VsQW5pbWF0aW9uRnJhbWVcblxuaWYgJG5vZGUkXG5cdGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZG8gfGlkfCBjbGVhclRpbWVvdXQoaWQpXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGRvIHxibGt8IHNldFRpbWVvdXQoYmxrLDEwMDAgLyA2MClcblxuaWYgJHdlYiRcblx0Y2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3c6Y2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Om1vekNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdzp3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93OnJlcXVlc3RBbmltYXRpb25GcmFtZVxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHw9IHdpbmRvdzp3ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8PSB3aW5kb3c6bW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSB8fD0gZG8gfGJsa3wgc2V0VGltZW91dChibGssMTAwMCAvIDYwKVxuXG5jbGFzcyBUaWNrZXJcblxuXHRwcm9wIHN0YWdlXG5cdHByb3AgcXVldWVcblxuXHRkZWYgaW5pdGlhbGl6ZVxuXHRcdEBxdWV1ZSA9IFtdXG5cdFx0QHN0YWdlID0gLTFcblx0XHRAc2NoZWR1bGVkID0gbm9cblx0XHRAdGlja2VyID0gZG8gfGV8XG5cdFx0XHRAc2NoZWR1bGVkID0gbm9cblx0XHRcdHRpY2soZSlcblx0XHRzZWxmXG5cblx0ZGVmIGFkZCBpdGVtLCBmb3JjZVxuXHRcdGlmIGZvcmNlIG9yIEBxdWV1ZS5pbmRleE9mKGl0ZW0pID09IC0xXG5cdFx0XHRAcXVldWUucHVzaChpdGVtKVxuXG5cdFx0c2NoZWR1bGUgdW5sZXNzIEBzY2hlZHVsZWRcblxuXHRkZWYgdGljayB0aW1lc3RhbXBcblx0XHR2YXIgaXRlbXMgPSBAcXVldWVcblx0XHRAdHMgPSB0aW1lc3RhbXAgdW5sZXNzIEB0c1xuXHRcdEBkdCA9IHRpbWVzdGFtcCAtIEB0c1xuXHRcdEB0cyA9IHRpbWVzdGFtcFxuXHRcdEBxdWV1ZSA9IFtdXG5cdFx0QHN0YWdlID0gMVxuXHRcdGJlZm9yZVxuXHRcdGlmIGl0ZW1zOmxlbmd0aFxuXHRcdFx0Zm9yIGl0ZW0saSBpbiBpdGVtc1xuXHRcdFx0XHRpZiBpdGVtIGlzYSBGdW5jdGlvblxuXHRcdFx0XHRcdGl0ZW0oQGR0LHNlbGYpXG5cdFx0XHRcdGVsaWYgaXRlbTp0aWNrXG5cdFx0XHRcdFx0aXRlbS50aWNrKEBkdCxzZWxmKVxuXHRcdEBzdGFnZSA9IDJcblx0XHRhZnRlclxuXHRcdEBzdGFnZSA9IEBzY2hlZHVsZWQgPyAwIDogLTFcblx0XHRzZWxmXG5cblx0ZGVmIHNjaGVkdWxlXG5cdFx0aWYgIUBzY2hlZHVsZWRcblx0XHRcdEBzY2hlZHVsZWQgPSB5ZXNcblx0XHRcdGlmIEBzdGFnZSA9PSAtMVxuXHRcdFx0XHRAc3RhZ2UgPSAwXG5cdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoQHRpY2tlcilcblx0XHRzZWxmXG5cblx0ZGVmIGJlZm9yZVxuXHRcdHNlbGZcblxuXHRkZWYgYWZ0ZXJcblx0XHRpZiBJbWJhLlRhZ01hbmFnZXJcblx0XHRcdEltYmEuVGFnTWFuYWdlci5yZWZyZXNoXG5cdFx0c2VsZlxuXG5JbWJhLlRJQ0tFUiA9IFRpY2tlci5uZXdcbkltYmEuU0NIRURVTEVSUyA9IFtdXG5cbmRlZiBJbWJhLnRpY2tlclxuXHRJbWJhLlRJQ0tFUlxuXG5kZWYgSW1iYS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgY2FsbGJhY2tcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNhbGxiYWNrKVxuXG5kZWYgSW1iYS5jYW5jZWxBbmltYXRpb25GcmFtZSBpZFxuXHRjYW5jZWxBbmltYXRpb25GcmFtZShpZClcblxuIyBzaG91bGQgYWRkIGFuIEltYmEucnVuIC8gc2V0SW1tZWRpYXRlIHRoYXRcbiMgcHVzaGVzIGxpc3RlbmVyIG9udG8gdGhlIHRpY2stcXVldWUgd2l0aCB0aW1lcyAtIG9uY2VcblxudmFyIGNvbW1pdFF1ZXVlID0gMFxuXG5kZWYgSW1iYS5jb21taXQgcGFyYW1zXG5cdGNvbW1pdFF1ZXVlKytcblx0IyBJbWJhLlRhZ01hbmFnZXIucmVmcmVzaFxuXHRJbWJhLmVtaXQoSW1iYSwnY29tbWl0JyxwYXJhbXMgIT0gdW5kZWZpbmVkID8gW3BhcmFtc10gOiB1bmRlZmluZWQpXG5cdGlmIC0tY29tbWl0UXVldWUgPT0gMFxuXHRcdEltYmEuVGFnTWFuYWdlciBhbmQgSW1iYS5UYWdNYW5hZ2VyLnJlZnJlc2hcblx0cmV0dXJuXG5cbiMjI1xuXG5JbnN0YW5jZXMgb2YgSW1iYS5TY2hlZHVsZXIgbWFuYWdlcyB3aGVuIHRvIGNhbGwgYHRpY2soKWAgb24gdGhlaXIgdGFyZ2V0LFxuYXQgYSBzcGVjaWZpZWQgZnJhbWVyYXRlIG9yIHdoZW4gY2VydGFpbiBldmVudHMgb2NjdXIuIFJvb3Qtbm9kZXMgaW4geW91clxuYXBwbGljYXRpb25zIHdpbGwgdXN1YWxseSBoYXZlIGEgc2NoZWR1bGVyIHRvIG1ha2Ugc3VyZSB0aGV5IHJlcmVuZGVyIHdoZW5cbnNvbWV0aGluZyBjaGFuZ2VzLiBJdCBpcyBhbHNvIHBvc3NpYmxlIHRvIG1ha2UgaW5uZXIgY29tcG9uZW50cyB1c2UgdGhlaXJcbm93biBzY2hlZHVsZXJzIHRvIGNvbnRyb2wgd2hlbiB0aGV5IHJlbmRlci5cblxuQGluYW1lIHNjaGVkdWxlclxuXG4jIyNcbmNsYXNzIEltYmEuU2NoZWR1bGVyXG5cdFxuXHR2YXIgY291bnRlciA9IDBcblxuXHRkZWYgc2VsZi5ldmVudCBlXG5cdFx0SW1iYS5lbWl0KEltYmEsJ2V2ZW50JyxlKVxuXG5cdCMjI1xuXHRDcmVhdGUgYSBuZXcgSW1iYS5TY2hlZHVsZXIgZm9yIHNwZWNpZmllZCB0YXJnZXRcblx0QHJldHVybiB7SW1iYS5TY2hlZHVsZXJ9XG5cdCMjI1xuXHRkZWYgaW5pdGlhbGl6ZSB0YXJnZXRcblx0XHRAaWQgPSBjb3VudGVyKytcblx0XHRAdGFyZ2V0ID0gdGFyZ2V0XG5cdFx0QG1hcmtlZCA9IG5vXG5cdFx0QGFjdGl2ZSA9IG5vXG5cdFx0QG1hcmtlciA9IGRvIG1hcmtcblx0XHRAdGlja2VyID0gZG8gfGV8IHRpY2soZSlcblxuXHRcdEBkdCA9IDBcblx0XHRAZnJhbWUgPSB7fVxuXHRcdEBzY2hlZHVsZWQgPSBub1xuXHRcdEB0aW1lc3RhbXAgPSAwXG5cdFx0QHRpY2tzID0gMFxuXHRcdEBmbHVzaGVzID0gMFxuXG5cdFx0c2VsZjpvbmV2ZW50ID0gc2VsZjpvbmV2ZW50LmJpbmQoc2VsZilcblx0XHRzZWxmXG5cblx0cHJvcCByYWYgd2F0Y2g6IHllc1xuXHRwcm9wIGludGVydmFsIHdhdGNoOiB5ZXNcblx0cHJvcCBldmVudHMgd2F0Y2g6IHllc1xuXHRwcm9wIG1hcmtlZFxuXG5cdGRlZiByYWZEaWRTZXQgYm9vbFxuXHRcdHJlcXVlc3RUaWNrIGlmIGJvb2wgYW5kIEBhY3RpdmVcblx0XHRzZWxmXG5cblx0ZGVmIGludGVydmFsRGlkU2V0IHRpbWVcblx0XHRjbGVhckludGVydmFsKEBpbnRlcnZhbElkKVxuXHRcdEBpbnRlcnZhbElkID0gbnVsbFxuXHRcdGlmIHRpbWUgYW5kIEBhY3RpdmVcblx0XHRcdEBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoc2VsZjpvbmludGVydmFsLmJpbmQoc2VsZiksdGltZSlcblx0XHRzZWxmXG5cblx0ZGVmIGV2ZW50c0RpZFNldCBuZXcsIHByZXZcblx0XHRpZiBAYWN0aXZlIGFuZCBuZXcgYW5kICFwcmV2XG5cdFx0XHRJbWJhLmxpc3RlbihJbWJhLCdjb21taXQnLHNlbGYsJ29uZXZlbnQnKVxuXHRcdGVsaWYgIW5ldyBhbmQgcHJldlxuXHRcdFx0SW1iYS51bmxpc3RlbihJbWJhLCdjb21taXQnLHNlbGYsJ29uZXZlbnQnKVxuXG5cdCMjI1xuXHRDaGVjayB3aGV0aGVyIHRoZSBjdXJyZW50IHNjaGVkdWxlciBpcyBhY3RpdmUgb3Igbm90XG5cdEByZXR1cm4ge2Jvb2x9XG5cdCMjI1xuXHRkZWYgYWN0aXZlXG5cdFx0QGFjdGl2ZVxuXG5cdCMjI1xuXHREZWx0YSB0aW1lIGJldHdlZW4gdGhlIHR3byBsYXN0IHRpY2tzXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiBkdFxuXHRcdEBkdFxuXG5cdCMjI1xuXHRDb25maWd1cmUgdGhlIHNjaGVkdWxlclxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGNvbmZpZ3VyZSBvcHRpb25zID0ge31cblx0XHRyYWYgPSBvcHRpb25zOnJhZiBpZiBvcHRpb25zOnJhZiAhPSB1bmRlZmluZWRcblx0XHRpbnRlcnZhbCA9IG9wdGlvbnM6aW50ZXJ2YWwgaWYgb3B0aW9uczppbnRlcnZhbCAhPSB1bmRlZmluZWRcblx0XHRldmVudHMgPSBvcHRpb25zOmV2ZW50cyBpZiBvcHRpb25zOmV2ZW50cyAhPSB1bmRlZmluZWRcblx0XHRzZWxmXG5cblx0IyMjXG5cdE1hcmsgdGhlIHNjaGVkdWxlciBhcyBkaXJ0eS4gVGhpcyB3aWxsIG1ha2Ugc3VyZSB0aGF0XG5cdHRoZSBzY2hlZHVsZXIgY2FsbHMgYHRhcmdldC50aWNrYCBvbiB0aGUgbmV4dCBmcmFtZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIG1hcmtcblx0XHRAbWFya2VkID0geWVzXG5cdFx0aWYgIUBzY2hlZHVsZWRcblx0XHRcdHJlcXVlc3RUaWNrXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRJbnN0YW50bHkgdHJpZ2dlciB0YXJnZXQudGljayBhbmQgbWFyayBzY2hlZHVsZXIgYXMgY2xlYW4gKG5vdCBkaXJ0eS9tYXJrZWQpLlxuXHRUaGlzIGlzIGNhbGxlZCBpbXBsaWNpdGx5IGZyb20gdGljaywgYnV0IGNhbiBhbHNvIGJlIGNhbGxlZCBtYW51YWxseSBpZiB5b3Vcblx0cmVhbGx5IHdhbnQgdG8gZm9yY2UgYSB0aWNrIHdpdGhvdXQgd2FpdGluZyBmb3IgdGhlIG5leHQgZnJhbWUuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgZmx1c2hcblx0XHRAZmx1c2hlcysrXG5cdFx0QHRhcmdldC50aWNrKHNlbGYpXG5cdFx0QG1hcmtlZCA9IG5vXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRAZml4bWUgdGhpcyBleHBlY3RzIHJhZiB0byBydW4gYXQgNjAgZnBzIFxuXG5cdENhbGxlZCBhdXRvbWF0aWNhbGx5IG9uIGV2ZXJ5IGZyYW1lIHdoaWxlIHRoZSBzY2hlZHVsZXIgaXMgYWN0aXZlLlxuXHRJdCB3aWxsIG9ubHkgY2FsbCBgdGFyZ2V0LnRpY2tgIGlmIHRoZSBzY2hlZHVsZXIgaXMgbWFya2VkIGRpcnR5LFxuXHRvciB3aGVuIGFjY29yZGluZyB0byBAZnBzIHNldHRpbmcuXG5cblx0SWYgeW91IGhhdmUgc2V0IHVwIGEgc2NoZWR1bGVyIHdpdGggYW4gZnBzIG9mIDEsIHRpY2sgd2lsbCBzdGlsbCBiZVxuXHRjYWxsZWQgZXZlcnkgZnJhbWUsIGJ1dCBgdGFyZ2V0LnRpY2tgIHdpbGwgb25seSBiZSBjYWxsZWQgb25jZSBldmVyeVxuXHRzZWNvbmQsIGFuZCBpdCB3aWxsICptYWtlIHN1cmUqIGVhY2ggYHRhcmdldC50aWNrYCBoYXBwZW5zIGluIHNlcGFyYXRlXG5cdHNlY29uZHMgYWNjb3JkaW5nIHRvIERhdGUuIFNvIGlmIHlvdSBoYXZlIGEgbm9kZSB0aGF0IHJlbmRlcnMgYSBjbG9ja1xuXHRiYXNlZCBvbiBEYXRlLm5vdyAob3Igc29tZXRoaW5nIHNpbWlsYXIpLCB5b3UgY2FuIHNjaGVkdWxlIGl0IHdpdGggMWZwcyxcblx0bmV2ZXIgbmVlZGluZyB0byB3b3JyeSBhYm91dCB0d28gdGlja3MgaGFwcGVuaW5nIHdpdGhpbiB0aGUgc2FtZSBzZWNvbmQuXG5cdFRoZSBzYW1lIGdvZXMgZm9yIDRmcHMsIDEwZnBzIGV0Yy5cblxuXHRAcHJvdGVjdGVkXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgdGljayBkZWx0YSwgdGlja2VyXG5cdFx0QHRpY2tzKytcblx0XHRAZHQgPSBkZWx0YVxuXG5cdFx0aWYgdGlja2VyXG5cdFx0XHRAc2NoZWR1bGVkID0gbm9cblxuXHRcdGZsdXNoXG5cblx0XHRpZiBAcmFmIGFuZCBAYWN0aXZlXG5cdFx0XHRyZXF1ZXN0VGlja1xuXHRcdHNlbGZcblxuXHRkZWYgcmVxdWVzdFRpY2tcblx0XHR1bmxlc3MgQHNjaGVkdWxlZFxuXHRcdFx0QHNjaGVkdWxlZCA9IHllc1xuXHRcdFx0SW1iYS5USUNLRVIuYWRkKHNlbGYpXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTdGFydCB0aGUgc2NoZWR1bGVyIGlmIGl0IGlzIG5vdCBhbHJlYWR5IGFjdGl2ZS5cblx0KipXaGlsZSBhY3RpdmUqKiwgdGhlIHNjaGVkdWxlciB3aWxsIG92ZXJyaWRlIGB0YXJnZXQuY29tbWl0YFxuXHR0byBkbyBub3RoaW5nLiBCeSBkZWZhdWx0IEltYmEudGFnI2NvbW1pdCBjYWxscyByZW5kZXIsIHNvXG5cdHRoYXQgcmVuZGVyaW5nIGlzIGNhc2NhZGVkIHRocm91Z2ggdG8gY2hpbGRyZW4gd2hlbiByZW5kZXJpbmdcblx0YSBub2RlLiBXaGVuIGEgc2NoZWR1bGVyIGlzIGFjdGl2ZSAoZm9yIGEgbm9kZSksIEltYmEgZGlzYWJsZXNcblx0dGhpcyBhdXRvbWF0aWMgcmVuZGVyaW5nLlxuXHQjIyNcblx0ZGVmIGFjdGl2YXRlIGltbWVkaWF0ZSA9IHllc1xuXHRcdHVubGVzcyBAYWN0aXZlXG5cdFx0XHRAYWN0aXZlID0geWVzXG5cdFx0XHRAY29tbWl0ID0gQHRhcmdldDpjb21taXRcblx0XHRcdEB0YXJnZXQ6Y29tbWl0ID0gZG8gdGhpc1xuXHRcdFx0QHRhcmdldD8uZmxhZygnc2NoZWR1bGVkXycpXG5cdFx0XHRJbWJhLlNDSEVEVUxFUlMucHVzaChzZWxmKVxuXHRcdFx0XG5cdFx0XHRpZiBAZXZlbnRzXG5cdFx0XHRcdEltYmEubGlzdGVuKEltYmEsJ2NvbW1pdCcsc2VsZiwnb25ldmVudCcpXG5cdFx0XHRcdFxuXHRcdFx0aWYgQGludGVydmFsIGFuZCAhQGludGVydmFsSWRcblx0XHRcdFx0QGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChzZWxmOm9uaW50ZXJ2YWwuYmluZChzZWxmKSxAaW50ZXJ2YWwpXG5cblx0XHRcdGlmIGltbWVkaWF0ZVxuXHRcdFx0XHR0aWNrKDApXG5cdFx0XHRlbGlmIEByYWZcblx0XHRcdFx0cmVxdWVzdFRpY2tcblx0XHRyZXR1cm4gc2VsZlxuXG5cdCMjI1xuXHRTdG9wIHRoZSBzY2hlZHVsZXIgaWYgaXQgaXMgYWN0aXZlLlxuXHQjIyNcblx0ZGVmIGRlYWN0aXZhdGVcblx0XHRpZiBAYWN0aXZlXG5cdFx0XHRAYWN0aXZlID0gbm9cblx0XHRcdEB0YXJnZXQ6Y29tbWl0ID0gQGNvbW1pdFxuXHRcdFx0bGV0IGlkeCA9IEltYmEuU0NIRURVTEVSUy5pbmRleE9mKHNlbGYpXG5cdFx0XHRpZiBpZHggPj0gMFxuXHRcdFx0XHRJbWJhLlNDSEVEVUxFUlMuc3BsaWNlKGlkeCwxKVxuXHRcdFx0XHRcblx0XHRcdGlmIEBldmVudHNcblx0XHRcdFx0SW1iYS51bmxpc3RlbihJbWJhLCdjb21taXQnLHNlbGYsJ29uZXZlbnQnKVxuXG5cdFx0XHRpZiBAaW50ZXJ2YWxJZFxuXHRcdFx0XHRjbGVhckludGVydmFsKEBpbnRlcnZhbElkKVxuXHRcdFx0XHRAaW50ZXJ2YWxJZCA9IG51bGxcblx0XHRcdFxuXHRcdFx0QHRhcmdldD8udW5mbGFnKCdzY2hlZHVsZWRfJylcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiB0cmFja1xuXHRcdEBtYXJrZXJcblx0XHRcblx0ZGVmIG9uaW50ZXJ2YWxcblx0XHR0aWNrXG5cdFx0SW1iYS5UYWdNYW5hZ2VyLnJlZnJlc2hcblx0XHRzZWxmXG5cblx0ZGVmIG9uZXZlbnQgZXZlbnRcblx0XHRyZXR1cm4gc2VsZiBpZiAhQGV2ZW50cyBvciBAbWFya2VkXG5cblx0XHRpZiBAZXZlbnRzIGlzYSBGdW5jdGlvblxuXHRcdFx0bWFyayBpZiBAZXZlbnRzKGV2ZW50LHNlbGYpXG5cdFx0ZWxpZiBAZXZlbnRzIGlzYSBBcnJheVxuXHRcdFx0aWYgQGV2ZW50cy5pbmRleE9mKChldmVudCBhbmQgZXZlbnQ6dHlwZSkgb3IgZXZlbnQpID49IDBcblx0XHRcdFx0bWFya1xuXHRcdGVsc2Vcblx0XHRcdG1hcmtcblx0XHRzZWxmXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9zY2hlZHVsZXIuaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxucmVxdWlyZSAnLi9tYW5hZ2VyJ1xuXG5JbWJhLlRhZ01hbmFnZXIgPSBJbWJhLlRhZ01hbmFnZXJDbGFzcy5uZXdcblxucmVxdWlyZSAnLi90YWcnXG5yZXF1aXJlICcuL2h0bWwnXG5yZXF1aXJlICcuL3BvaW50ZXInXG5yZXF1aXJlICcuL3RvdWNoJ1xucmVxdWlyZSAnLi9ldmVudCdcbnJlcXVpcmUgJy4vZXZlbnQtbWFuYWdlcidcblxuaWYgJHdlYiRcblx0cmVxdWlyZSAnLi9yZWNvbmNpbGVyJ1xuXG5pZiAkbm9kZSRcblx0cmVxdWlyZSAnLi9zZXJ2ZXInXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL2luZGV4LmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbmNsYXNzIEltYmEuVGFnTWFuYWdlckNsYXNzXG5cdGRlZiBpbml0aWFsaXplXG5cdFx0QGluc2VydHMgPSAwXG5cdFx0QHJlbW92ZXMgPSAwXG5cdFx0QG1vdW50ZWQgPSBbXVxuXHRcdEBoYXNNb3VudGFibGVzID0gbm9cblx0XHRzZWxmXG5cblx0ZGVmIG1vdW50ZWRcblx0XHRAbW91bnRlZFxuXG5cdGRlZiBpbnNlcnQgbm9kZSwgcGFyZW50XG5cdFx0QGluc2VydHMrK1xuXG5cdGRlZiByZW1vdmUgbm9kZSwgcGFyZW50XG5cdFx0QHJlbW92ZXMrK1xuXG5cdGRlZiBjaGFuZ2VzXG5cdFx0QGluc2VydHMgKyBAcmVtb3Zlc1xuXG5cdGRlZiBtb3VudCBub2RlXG5cdFx0cmV0dXJuIGlmICRub2RlJFxuXHRcdEBoYXNNb3VudGFibGVzID0geWVzXG5cblx0ZGVmIHJlZnJlc2ggZm9yY2UgPSBub1xuXHRcdHJldHVybiBpZiAkbm9kZSRcblx0XHRyZXR1cm4gaWYgIWZvcmNlIGFuZCBjaGFuZ2VzID09IDBcblx0XHQjIGNvbnNvbGUudGltZSgncmVzb2x2ZU1vdW50cycpXG5cdFx0aWYgKEBpbnNlcnRzIGFuZCBAaGFzTW91bnRhYmxlcykgb3IgZm9yY2Vcblx0XHRcdHRyeU1vdW50XG5cblx0XHRpZiAoQHJlbW92ZXMgb3IgZm9yY2UpIGFuZCBAbW91bnRlZDpsZW5ndGhcblx0XHRcdHRyeVVubW91bnRcblx0XHQjIGNvbnNvbGUudGltZUVuZCgncmVzb2x2ZU1vdW50cycpXG5cdFx0QGluc2VydHMgPSAwXG5cdFx0QHJlbW92ZXMgPSAwXG5cdFx0c2VsZlxuXG5cdGRlZiB1bm1vdW50IG5vZGVcblx0XHRzZWxmXG5cblx0ZGVmIHRyeU1vdW50XG5cdFx0dmFyIGNvdW50ID0gMFxuXHRcdHZhciByb290ID0gZG9jdW1lbnQ6Ym9keVxuXHRcdHZhciBpdGVtcyA9IHJvb3QucXVlcnlTZWxlY3RvckFsbCgnLl9fbW91bnQnKVxuXHRcdCMgd2hhdCBpZiB3ZSBlbmQgdXAgY3JlYXRpbmcgYWRkaXRpb25hbCBtb3VudGFibGVzIGJ5IG1vdW50aW5nP1xuXHRcdGZvciBlbCBpbiBpdGVtc1xuXHRcdFx0aWYgZWwgYW5kIGVsLkB0YWdcblx0XHRcdFx0aWYgQG1vdW50ZWQuaW5kZXhPZihlbC5AdGFnKSA9PSAtMVxuXHRcdFx0XHRcdG1vdW50Tm9kZShlbC5AdGFnKVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIG1vdW50Tm9kZSBub2RlXG5cdFx0QG1vdW50ZWQucHVzaChub2RlKVxuXHRcdG5vZGUuRkxBR1MgfD0gSW1iYS5UQUdfTU9VTlRFRFxuXHRcdG5vZGUubW91bnQgaWYgbm9kZTptb3VudFxuXHRcdHJldHVyblxuXG5cdGRlZiB0cnlVbm1vdW50XG5cdFx0dmFyIGNvdW50ID0gMFxuXHRcdHZhciByb290ID0gZG9jdW1lbnQ6Ym9keVxuXHRcdGZvciBpdGVtLCBpIGluIEBtb3VudGVkXG5cdFx0XHR1bmxlc3MgZG9jdW1lbnQ6ZG9jdW1lbnRFbGVtZW50LmNvbnRhaW5zKGl0ZW0uQGRvbSlcblx0XHRcdFx0aXRlbS5GTEFHUyA9IGl0ZW0uRkxBR1MgJiB+SW1iYS5UQUdfTU9VTlRFRFxuXHRcdFx0XHRpZiBpdGVtOnVubW91bnQgYW5kIGl0ZW0uQGRvbVxuXHRcdFx0XHRcdGl0ZW0udW5tb3VudFxuXHRcdFx0XHRlbGlmIGl0ZW0uQHNjaGVkdWxlclxuXHRcdFx0XHRcdCMgTUFZQkUgRklYIFRISVM/XG5cdFx0XHRcdFx0aXRlbS51bnNjaGVkdWxlXG5cdFx0XHRcdEBtb3VudGVkW2ldID0gbnVsbFxuXHRcdFx0XHRjb3VudCsrXG5cdFx0XG5cdFx0aWYgY291bnRcblx0XHRcdEBtb3VudGVkID0gQG1vdW50ZWQuZmlsdGVyIGRvIHxpdGVtfCBpdGVtXG5cdFx0c2VsZlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9tYW5hZ2VyLmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbkltYmEuQ1NTS2V5TWFwID0ge31cblxuSW1iYS5UQUdfQlVJTFQgPSAxXG5JbWJhLlRBR19TRVRVUCA9IDJcbkltYmEuVEFHX01PVU5USU5HID0gNFxuSW1iYS5UQUdfTU9VTlRFRCA9IDhcbkltYmEuVEFHX1NDSEVEVUxFRCA9IDE2XG5JbWJhLlRBR19BV0FLRU5FRCA9IDMyXG5cbiMjI1xuR2V0IHRoZSBjdXJyZW50IGRvY3VtZW50XG4jIyNcbmRlZiBJbWJhLmRvY3VtZW50XG5cdGlmICR3ZWIkXG5cdFx0d2luZG93OmRvY3VtZW50XG5cdGVsc2Vcblx0XHRAZG9jdW1lbnQgfHw9IEltYmFTZXJ2ZXJEb2N1bWVudC5uZXdcblxuIyMjXG5HZXQgdGhlIGJvZHkgZWxlbWVudCB3cmFwcGVkIGluIGFuIEltYmEuVGFnXG4jIyNcbmRlZiBJbWJhLnJvb3Rcblx0dGFnKEltYmEuZG9jdW1lbnQ6Ym9keSlcblxuZGVmIEltYmEuc3RhdGljIGl0ZW1zLCB0eXAsIG5yXG5cdGl0ZW1zLkB0eXBlID0gdHlwXG5cdGl0ZW1zOnN0YXRpYyA9IG5yXG5cdHJldHVybiBpdGVtc1xuXG4jIyNcblxuIyMjXG5kZWYgSW1iYS5tb3VudCBub2RlLCBpbnRvXG5cdGludG8gfHw9IEltYmEuZG9jdW1lbnQ6Ym9keVxuXHRpbnRvLmFwcGVuZENoaWxkKG5vZGUuZG9tKVxuXHRJbWJhLlRhZ01hbmFnZXIuaW5zZXJ0KG5vZGUsaW50bylcblx0bm9kZS5zY2hlZHVsZXIuY29uZmlndXJlKGV2ZW50czogeWVzKS5hY3RpdmF0ZShubylcblx0SW1iYS5UYWdNYW5hZ2VyLnJlZnJlc2hcblx0cmV0dXJuIG5vZGVcblxuXG5kZWYgSW1iYS5jcmVhdGVUZXh0Tm9kZSBub2RlXG5cdGlmIG5vZGUgYW5kIG5vZGU6bm9kZVR5cGUgPT0gM1xuXHRcdHJldHVybiBub2RlXG5cdHJldHVybiBJbWJhLmRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpXG5cbiMjI1xuVGhpcyBpcyB0aGUgYmFzZWNsYXNzIHRoYXQgYWxsIHRhZ3MgaW4gaW1iYSBpbmhlcml0IGZyb20uXG5AaW5hbWUgbm9kZVxuIyMjXG5jbGFzcyBJbWJhLlRhZ1xuXG5cdGRlZiBzZWxmLmJ1aWxkTm9kZVxuXHRcdHZhciBkb20gPSBJbWJhLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoQG5vZGVUeXBlIG9yICdkaXYnKVxuXHRcdGlmIEBjbGFzc2VzXG5cdFx0XHR2YXIgY2xzID0gQGNsYXNzZXMuam9pbihcIiBcIilcblx0XHRcdGRvbTpjbGFzc05hbWUgPSBjbHMgaWYgY2xzXG5cdFx0ZG9tXG5cblx0ZGVmIHNlbGYuY3JlYXRlTm9kZVxuXHRcdHZhciBwcm90byA9IChAcHJvdG9Eb20gfHw9IGJ1aWxkTm9kZSlcblx0XHRwcm90by5jbG9uZU5vZGUoZmFsc2UpXG5cblx0ZGVmIHNlbGYuYnVpbGQgY3R4XG5cdFx0c2VsZi5uZXcoc2VsZi5jcmVhdGVOb2RlLGN0eClcblxuXHRkZWYgc2VsZi5kb21cblx0XHRAcHJvdG9Eb20gfHw9IGJ1aWxkTm9kZVxuXG5cdCMjI1xuXHRDYWxsZWQgd2hlbiBhIHRhZyB0eXBlIGlzIGJlaW5nIHN1YmNsYXNzZWQuXG5cdCMjI1xuXHRkZWYgc2VsZi5pbmhlcml0IGNoaWxkXG5cdFx0Y2hpbGQuQHByb3RvRG9tID0gbnVsbFxuXG5cdFx0aWYgQG5vZGVUeXBlXG5cdFx0XHRjaGlsZC5Abm9kZVR5cGUgPSBAbm9kZVR5cGVcblx0XHRcdGNoaWxkLkBjbGFzc2VzID0gQGNsYXNzZXMuc2xpY2VcblxuXHRcdFx0aWYgY2hpbGQuQGZsYWdOYW1lXG5cdFx0XHRcdGNoaWxkLkBjbGFzc2VzLnB1c2goY2hpbGQuQGZsYWdOYW1lKVxuXHRcdGVsc2Vcblx0XHRcdGNoaWxkLkBub2RlVHlwZSA9IGNoaWxkLkBuYW1lXG5cdFx0XHRjaGlsZC5AZmxhZ05hbWUgPSBudWxsXG5cdFx0XHRjaGlsZC5AY2xhc3NlcyA9IFtdXG5cblx0IyMjXG5cdEludGVybmFsIG1ldGhvZCBjYWxsZWQgYWZ0ZXIgYSB0YWcgY2xhc3MgaGFzXG5cdGJlZW4gZGVjbGFyZWQgb3IgZXh0ZW5kZWQuXG5cdFxuXHRAcHJpdmF0ZVxuXHQjIyNcblx0ZGVmIG9wdGltaXplVGFnU3RydWN0dXJlXG5cdFx0dmFyIGJhc2UgPSBJbWJhLlRhZzpwcm90b3R5cGVcblx0XHR2YXIgaGFzU2V0dXAgID0gc2VsZjpzZXR1cCAgIT0gYmFzZTpzZXR1cFxuXHRcdHZhciBoYXNDb21taXQgPSBzZWxmOmNvbW1pdCAhPSBiYXNlOmNvbW1pdFxuXHRcdHZhciBoYXNSZW5kZXIgPSBzZWxmOnJlbmRlciAhPSBiYXNlOnJlbmRlclxuXHRcdHZhciBoYXNNb3VudCAgPSBzZWxmOm1vdW50XG5cblx0XHR2YXIgY3RvciA9IHNlbGY6Y29uc3RydWN0b3JcblxuXHRcdGlmIGhhc0NvbW1pdCBvciBoYXNSZW5kZXIgb3IgaGFzTW91bnQgb3IgaGFzU2V0dXBcblxuXHRcdFx0c2VsZjplbmQgPSBkb1xuXHRcdFx0XHRpZiB0aGlzOm1vdW50IGFuZCAhKHRoaXMuRkxBR1MgJiBJbWJhLlRBR19NT1VOVEVEKVxuXHRcdFx0XHRcdCMganVzdCBhY3RpdmF0ZSBcblx0XHRcdFx0XHRJbWJhLlRhZ01hbmFnZXIubW91bnQodGhpcylcblxuXHRcdFx0XHR1bmxlc3MgdGhpcy5GTEFHUyAmIEltYmEuVEFHX1NFVFVQXG5cdFx0XHRcdFx0dGhpcy5GTEFHUyB8PSBJbWJhLlRBR19TRVRVUFxuXHRcdFx0XHRcdHRoaXMuc2V0dXBcblx0XHRcdFx0XG5cdFx0XHRcdHRoaXMuY29tbWl0XG5cblx0XHRcdFx0cmV0dXJuIHRoaXNcblxuXHRcdGlmICR3ZWIkXG5cdFx0XHRpZiBoYXNNb3VudFxuXHRcdFx0XHRpZiBjdG9yLkBjbGFzc2VzIGFuZCBjdG9yLkBjbGFzc2VzLmluZGV4T2YoJ19fbW91bnQnKSAgPT0gLTFcblx0XHRcdFx0XHRjdG9yLkBjbGFzc2VzLnB1c2goJ19fbW91bnQnKVxuXG5cdFx0XHRcdGlmIGN0b3IuQHByb3RvRG9tXG5cdFx0XHRcdFx0Y3Rvci5AcHJvdG9Eb206Y2xhc3NMaXN0LmFkZCgnX19tb3VudCcpXG5cblx0XHRcdGZvciBpdGVtIGluIFs6bW91c2Vtb3ZlLDptb3VzZWVudGVyLDptb3VzZWxlYXZlLDptb3VzZW92ZXIsOm1vdXNlb3V0LDpzZWxlY3RzdGFydF1cblx0XHRcdFx0SW1iYS5FdmVudHMucmVnaXN0ZXIoaXRlbSkgaWYgdGhpc1tcIm9ue2l0ZW19XCJdXG5cdFx0c2VsZlxuXG5cblx0ZGVmIGluaXRpYWxpemUgZG9tLGN0eFxuXHRcdHNlbGYuZG9tID0gZG9tXG5cdFx0c2VsZjokID0gVGFnQ2FjaGUuYnVpbGQoc2VsZilcblx0XHRzZWxmOiR1cCA9IEBvd25lcl8gPSBjdHhcblx0XHRAdHJlZV8gPSBudWxsXG5cdFx0c2VsZi5GTEFHUyA9IDBcblx0XHRidWlsZFxuXHRcdHNlbGZcblxuXHRhdHRyIG5hbWUgaW5saW5lOiBub1xuXHRhdHRyIHJvbGUgaW5saW5lOiBub1xuXHRhdHRyIHRhYmluZGV4IGlubGluZTogbm9cblx0YXR0ciB0aXRsZVxuXG5cdGRlZiBkb21cblx0XHRAZG9tXG5cdFx0XG5cdGRlZiBzZXREb20gZG9tXG5cdFx0ZG9tLkB0YWcgPSBzZWxmXG5cdFx0QGRvbSA9IGRvbVxuXHRcdHNlbGZcblxuXHRkZWYgcmVmXG5cdFx0QHJlZlxuXHRcdFxuXHRkZWYgcm9vdFxuXHRcdEBvd25lcl8gPyBAb3duZXJfLnJvb3QgOiBzZWxmXG5cblx0IyMjXG5cdFNldHRpbmcgcmVmZXJlbmNlcyBmb3IgdGFncyBsaWtlXG5cdGA8ZGl2QGhlYWRlcj5gIHdpbGwgY29tcGlsZSB0byBgdGFnKCdkaXYnKS5yZWZfKCdoZWFkZXInLHRoaXMpLmVuZCgpYFxuXHRCeSBkZWZhdWx0IGl0IGFkZHMgdGhlIHJlZmVyZW5jZSBhcyBhIGNsYXNzTmFtZSB0byB0aGUgdGFnLlxuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdEBwcml2YXRlXG5cdCMjI1xuXHRkZWYgcmVmXyByZWZcblx0XHRmbGFnKEByZWYgPSByZWYpXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTZXQgdGhlIGRhdGEgb2JqZWN0IGZvciBub2RlXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgZGF0YT0gZGF0YVxuXHRcdEBkYXRhID0gZGF0YVxuXG5cdCMjI1xuXHRHZXQgdGhlIGRhdGEgb2JqZWN0IGZvciBub2RlXG5cdCMjI1xuXHRkZWYgZGF0YVxuXHRcdEBkYXRhXG5cblx0IyMjXG5cdFNldCBpbm5lciBodG1sIG9mIG5vZGVcblx0IyMjXG5cdGRlZiBodG1sPSBodG1sXG5cdFx0aWYgc2VsZi5odG1sICE9IGh0bWxcblx0XHRcdEBkb206aW5uZXJIVE1MID0gaHRtbFxuXG5cdCMjI1xuXHRHZXQgaW5uZXIgaHRtbCBvZiBub2RlXG5cdCMjI1xuXHRkZWYgaHRtbFxuXHRcdEBkb206aW5uZXJIVE1MXG5cdFxuXHRkZWYgb24kIHNsb3QsaGFuZGxlclxuXHRcdGxldCBoYW5kbGVycyA9IEBvbl8gfHw9IFtdXG5cdFx0bGV0IHByZXYgPSBoYW5kbGVyc1tzbG90XVxuXHRcdCMgc2VsZi1ib3VuZCBoYW5kbGVyc1xuXHRcdGlmIHNsb3QgPCAwXG5cdFx0XHRpZiBwcmV2ID09IHVuZGVmaW5lZFxuXHRcdFx0XHRzbG90ID0gaGFuZGxlcnNbc2xvdF0gPSBoYW5kbGVyczpsZW5ndGhcblx0XHRcdGVsc2Vcblx0XHRcdFx0c2xvdCA9IHByZXZcblx0XHRcdHByZXYgPSBoYW5kbGVyc1tzbG90XVxuXHRcdFxuXHRcdGhhbmRsZXJzW3Nsb3RdID0gaGFuZGxlclxuXHRcdGhhbmRsZXI6c3RhdGUgPSBwcmV2OnN0YXRlIGlmIHByZXZcblx0XHRyZXR1cm4gc2VsZlxuXG5cblx0ZGVmIGlkPSBpZFxuXHRcdGlmIGlkICE9IG51bGxcblx0XHRcdGRvbTppZCA9IGlkXG5cblx0ZGVmIGlkXG5cdFx0ZG9tOmlkXG5cblx0IyMjXG5cdEFkZHMgYSBuZXcgYXR0cmlidXRlIG9yIGNoYW5nZXMgdGhlIHZhbHVlIG9mIGFuIGV4aXN0aW5nIGF0dHJpYnV0ZVxuXHRvbiB0aGUgc3BlY2lmaWVkIHRhZy4gSWYgdGhlIHZhbHVlIGlzIG51bGwgb3IgZmFsc2UsIHRoZSBhdHRyaWJ1dGVcblx0d2lsbCBiZSByZW1vdmVkLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNldEF0dHJpYnV0ZSBuYW1lLCB2YWx1ZVxuXHRcdHZhciBvbGQgPSBkb20uZ2V0QXR0cmlidXRlKG5hbWUpXG5cblx0XHRpZiBvbGQgPT0gdmFsdWVcblx0XHRcdHZhbHVlXG5cdFx0ZWxpZiB2YWx1ZSAhPSBudWxsICYmIHZhbHVlICE9PSBmYWxzZVxuXHRcdFx0ZG9tLnNldEF0dHJpYnV0ZShuYW1lLHZhbHVlKVxuXHRcdGVsc2Vcblx0XHRcdGRvbS5yZW1vdmVBdHRyaWJ1dGUobmFtZSlcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBzZXROZXN0ZWRBdHRyIG5zLCBuYW1lLCB2YWx1ZVxuXHRcdGlmIHNlbGZbbnMrJ1NldEF0dHJpYnV0ZSddXG5cdFx0XHRzZWxmW25zKydTZXRBdHRyaWJ1dGUnXShuYW1lLHZhbHVlKVxuXHRcdGVsc2Vcblx0XHRcdHNldEF0dHJpYnV0ZU5TKG5zLCBuYW1lLHZhbHVlKVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIHNldEF0dHJpYnV0ZU5TIG5zLCBuYW1lLCB2YWx1ZVxuXHRcdHZhciBvbGQgPSBnZXRBdHRyaWJ1dGVOUyhucyxuYW1lKVxuXG5cdFx0aWYgb2xkICE9IHZhbHVlXG5cdFx0XHRpZiB2YWx1ZSAhPSBudWxsICYmIHZhbHVlICE9PSBmYWxzZSBcblx0XHRcdFx0ZG9tLnNldEF0dHJpYnV0ZU5TKG5zLG5hbWUsdmFsdWUpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGRvbS5yZW1vdmVBdHRyaWJ1dGVOUyhucyxuYW1lKVxuXHRcdHJldHVybiBzZWxmXG5cblxuXHQjIyNcblx0cmVtb3ZlcyBhbiBhdHRyaWJ1dGUgZnJvbSB0aGUgc3BlY2lmaWVkIHRhZ1xuXHQjIyNcblx0ZGVmIHJlbW92ZUF0dHJpYnV0ZSBuYW1lXG5cdFx0ZG9tLnJlbW92ZUF0dHJpYnV0ZShuYW1lKVxuXG5cdCMjI1xuXHRyZXR1cm5zIHRoZSB2YWx1ZSBvZiBhbiBhdHRyaWJ1dGUgb24gdGhlIHRhZy5cblx0SWYgdGhlIGdpdmVuIGF0dHJpYnV0ZSBkb2VzIG5vdCBleGlzdCwgdGhlIHZhbHVlIHJldHVybmVkXG5cdHdpbGwgZWl0aGVyIGJlIG51bGwgb3IgXCJcIiAodGhlIGVtcHR5IHN0cmluZylcblx0IyMjXG5cdGRlZiBnZXRBdHRyaWJ1dGUgbmFtZVxuXHRcdGRvbS5nZXRBdHRyaWJ1dGUobmFtZSlcblxuXG5cdGRlZiBnZXRBdHRyaWJ1dGVOUyBucywgbmFtZVxuXHRcdGRvbS5nZXRBdHRyaWJ1dGVOUyhucyxuYW1lKVxuXHRcblx0XG5cdGRlZiBzZXQga2V5LCB2YWx1ZSwgbW9kc1xuXHRcdGxldCBzZXR0ZXIgPSBJbWJhLnRvU2V0dGVyKGtleSlcblx0XHRpZiBzZWxmW3NldHRlcl0gaXNhIEZ1bmN0aW9uXG5cdFx0XHRzZWxmW3NldHRlcl0odmFsdWUsbW9kcylcblx0XHRlbHNlXG5cdFx0XHRAZG9tOnNldEF0dHJpYnV0ZShrZXksdmFsdWUpXG5cdFx0c2VsZlxuXHRcblx0XG5cdGRlZiBnZXQga2V5XG5cdFx0QGRvbTpnZXRBdHRyaWJ1dGUoa2V5KVxuXG5cdCMjI1xuXHRPdmVycmlkZSB0aGlzIHRvIHByb3ZpZGUgc3BlY2lhbCB3cmFwcGluZyBldGMuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0Q29udGVudCBjb250ZW50LCB0eXBlXG5cdFx0c2V0Q2hpbGRyZW4gY29udGVudCwgdHlwZVxuXHRcdHNlbGZcblxuXHQjIyNcblx0U2V0IHRoZSBjaGlsZHJlbiBvZiBub2RlLiB0eXBlIHBhcmFtIGlzIG9wdGlvbmFsLFxuXHRhbmQgc2hvdWxkIG9ubHkgYmUgdXNlZCBieSBJbWJhIHdoZW4gY29tcGlsaW5nIHRhZyB0cmVlcy4gXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0Q2hpbGRyZW4gbm9kZXMsIHR5cGVcblx0XHQjIG92ZXJyaWRkZW4gb24gY2xpZW50IGJ5IHJlY29uY2lsZXJcblx0XHRAdHJlZV8gPSBub2Rlc1xuXHRcdHNlbGZcblxuXHQjIyNcblx0U2V0IHRoZSB0ZW1wbGF0ZSB0aGF0IHdpbGwgcmVuZGVyIHRoZSBjb250ZW50IG9mIG5vZGUuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0VGVtcGxhdGUgdGVtcGxhdGVcblx0XHR1bmxlc3MgQHRlbXBsYXRlXG5cdFx0XHQjIG92ZXJyaWRlIHRoZSBiYXNpY1xuXHRcdFx0aWYgc2VsZjpyZW5kZXIgPT0gSW1iYS5UYWc6cHJvdG90eXBlOnJlbmRlclxuXHRcdFx0XHRzZWxmOnJlbmRlciA9IHNlbGY6cmVuZGVyVGVtcGxhdGUgIyBkbyBzZXRDaGlsZHJlbihyZW5kZXJUZW1wbGF0ZSlcblx0XHRcdHNlbGYub3B0aW1pemVUYWdTdHJ1Y3R1cmVcblxuXHRcdHNlbGY6dGVtcGxhdGUgPSBAdGVtcGxhdGUgPSB0ZW1wbGF0ZVxuXHRcdHNlbGZcblxuXHRkZWYgdGVtcGxhdGVcblx0XHRudWxsXG5cblx0IyMjXG5cdElmIG5vIGN1c3RvbSByZW5kZXItbWV0aG9kIGlzIGRlZmluZWQsIGFuZCB0aGUgbm9kZVxuXHRoYXMgYSB0ZW1wbGF0ZSwgdGhpcyBtZXRob2Qgd2lsbCBiZSB1c2VkIHRvIHJlbmRlclxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHJlbmRlclRlbXBsYXRlXG5cdFx0dmFyIGJvZHkgPSB0ZW1wbGF0ZVxuXHRcdHNldENoaWxkcmVuKGJvZHkpIGlmIGJvZHkgIT0gc2VsZlxuXHRcdHNlbGZcblxuXG5cdCMjI1xuXHRSZW1vdmUgc3BlY2lmaWVkIGNoaWxkIGZyb20gY3VycmVudCBub2RlLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHJlbW92ZUNoaWxkIGNoaWxkXG5cdFx0dmFyIHBhciA9IGRvbVxuXHRcdHZhciBlbCA9IGNoaWxkLkBkb20gb3IgY2hpbGRcblx0XHRpZiBlbCBhbmQgZWw6cGFyZW50Tm9kZSA9PSBwYXJcblx0XHRcdHBhci5yZW1vdmVDaGlsZChlbClcblx0XHRcdEltYmEuVGFnTWFuYWdlci5yZW1vdmUoZWwuQHRhZyBvciBlbCxzZWxmKVxuXHRcdHNlbGZcblx0XG5cdCMjI1xuXHRSZW1vdmUgYWxsIGNvbnRlbnQgaW5zaWRlIG5vZGVcblx0IyMjXG5cdGRlZiByZW1vdmVBbGxDaGlsZHJlblxuXHRcdGlmIEBkb206Zmlyc3RDaGlsZFxuXHRcdFx0QGRvbS5yZW1vdmVDaGlsZChAZG9tOmZpcnN0Q2hpbGQpIHdoaWxlIEBkb206Zmlyc3RDaGlsZFxuXHRcdFx0SW1iYS5UYWdNYW5hZ2VyLnJlbW92ZShudWxsLHNlbGYpICMgc2hvdWxkIHJlZ2lzdGVyIGVhY2ggY2hpbGQ/XG5cdFx0QHRyZWVfID0gQHRleHRfID0gbnVsbFxuXHRcdHNlbGZcblxuXHQjIyNcblx0QXBwZW5kIGEgc2luZ2xlIGl0ZW0gKG5vZGUgb3Igc3RyaW5nKSB0byB0aGUgY3VycmVudCBub2RlLlxuXHRJZiBzdXBwbGllZCBpdGVtIGlzIGEgc3RyaW5nIGl0IHdpbGwgYXV0b21hdGljYWxseS4gVGhpcyBpcyB1c2VkXG5cdGJ5IEltYmEgaW50ZXJuYWxseSwgYnV0IHdpbGwgcHJhY3RpY2FsbHkgbmV2ZXIgYmUgdXNlZCBleHBsaWNpdGx5LlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGFwcGVuZENoaWxkIG5vZGVcblx0XHRpZiBub2RlIGlzYSBTdHJpbmdcblx0XHRcdGRvbS5hcHBlbmRDaGlsZChJbWJhLmRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpKVxuXHRcdGVsaWYgbm9kZVxuXHRcdFx0ZG9tLmFwcGVuZENoaWxkKG5vZGUuQGRvbSBvciBub2RlKVxuXHRcdFx0SW1iYS5UYWdNYW5hZ2VyLmluc2VydChub2RlLkB0YWcgb3Igbm9kZSwgc2VsZilcblx0XHRcdCMgRklYTUUgZW5zdXJlIHRoZXNlIGFyZSBub3QgY2FsbGVkIGZvciB0ZXh0IG5vZGVzXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRJbnNlcnQgYSBub2RlIGludG8gdGhlIGN1cnJlbnQgbm9kZSAoc2VsZiksIGJlZm9yZSBhbm90aGVyLlxuXHRUaGUgcmVsYXRpdmUgbm9kZSBtdXN0IGJlIGEgY2hpbGQgb2YgY3VycmVudCBub2RlLiBcblx0IyMjXG5cdGRlZiBpbnNlcnRCZWZvcmUgbm9kZSwgcmVsXG5cdFx0aWYgbm9kZSBpc2EgU3RyaW5nXG5cdFx0XHRub2RlID0gSW1iYS5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShub2RlKVxuXG5cdFx0aWYgbm9kZSBhbmQgcmVsXG5cdFx0XHRkb20uaW5zZXJ0QmVmb3JlKCAobm9kZS5AZG9tIG9yIG5vZGUpLCAocmVsLkBkb20gb3IgcmVsKSApXG5cdFx0XHRJbWJhLlRhZ01hbmFnZXIuaW5zZXJ0KG5vZGUuQHRhZyBvciBub2RlLCBzZWxmKVxuXHRcdFx0IyBGSVhNRSBlbnN1cmUgdGhlc2UgYXJlIG5vdCBjYWxsZWQgZm9yIHRleHQgbm9kZXNcblx0XHRzZWxmXG5cblxuXHQjIyNcblx0UmVtb3ZlIG5vZGUgZnJvbSB0aGUgZG9tIHRyZWVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBvcnBoYW5pemVcblx0XHRwYXIucmVtb3ZlQ2hpbGQoc2VsZikgaWYgbGV0IHBhciA9IHBhcmVudFxuXHRcdHJldHVybiBzZWxmXG5cblx0IyMjXG5cdEdldCB0ZXh0IG9mIG5vZGUuIFVzZXMgdGV4dENvbnRlbnQgYmVoaW5kIHRoZSBzY2VuZXMgKG5vdCBpbm5lclRleHQpXG5cdFtodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTm9kZS90ZXh0Q29udGVudF0oKVxuXHRAcmV0dXJuIHtzdHJpbmd9IGlubmVyIHRleHQgb2Ygbm9kZVxuXHQjIyNcblx0ZGVmIHRleHQgdlxuXHRcdEBkb206dGV4dENvbnRlbnRcblxuXHQjIyNcblx0U2V0IHRleHQgb2Ygbm9kZS4gVXNlcyB0ZXh0Q29udGVudCBiZWhpbmQgdGhlIHNjZW5lcyAobm90IGlubmVyVGV4dClcblx0W2h0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Ob2RlL3RleHRDb250ZW50XSgpXG5cdCMjI1xuXHRkZWYgdGV4dD0gdHh0XG5cdFx0QHRyZWVfID0gdHh0XG5cdFx0QGRvbTp0ZXh0Q29udGVudCA9ICh0eHQgPT0gbnVsbCBvciB0ZXh0ID09PSBmYWxzZSkgPyAnJyA6IHR4dFxuXHRcdHNlbGZcblxuXG5cdCMjI1xuXHRNZXRob2QgZm9yIGdldHRpbmcgYW5kIHNldHRpbmcgZGF0YS1hdHRyaWJ1dGVzLiBXaGVuIGNhbGxlZCB3aXRoIHplcm9cblx0YXJndW1lbnRzIGl0IHdpbGwgcmV0dXJuIHRoZSBhY3R1YWwgZGF0YXNldCBmb3IgdGhlIHRhZy5cblxuXHRcdHZhciBub2RlID0gPGRpdiBkYXRhLW5hbWU9J2hlbGxvJz5cblx0XHQjIGdldCB0aGUgd2hvbGUgZGF0YXNldFxuXHRcdG5vZGUuZGF0YXNldCAjIHtuYW1lOiAnaGVsbG8nfVxuXHRcdCMgZ2V0IGEgc2luZ2xlIHZhbHVlXG5cdFx0bm9kZS5kYXRhc2V0KCduYW1lJykgIyAnaGVsbG8nXG5cdFx0IyBzZXQgYSBzaW5nbGUgdmFsdWVcblx0XHRub2RlLmRhdGFzZXQoJ25hbWUnLCduZXduYW1lJykgIyBzZWxmXG5cblxuXHQjIyNcblx0ZGVmIGRhdGFzZXQga2V5LCB2YWxcblx0XHRpZiBrZXkgaXNhIE9iamVjdFxuXHRcdFx0ZGF0YXNldChrLHYpIGZvciBvd24gayx2IG9mIGtleVxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdGlmIGFyZ3VtZW50czpsZW5ndGggPT0gMlxuXHRcdFx0c2V0QXR0cmlidXRlKFwiZGF0YS17a2V5fVwiLHZhbClcblx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRpZiBrZXlcblx0XHRcdHJldHVybiBnZXRBdHRyaWJ1dGUoXCJkYXRhLXtrZXl9XCIpXG5cblx0XHR2YXIgZGF0YXNldCA9IGRvbTpkYXRhc2V0XG5cblx0XHR1bmxlc3MgZGF0YXNldFxuXHRcdFx0ZGF0YXNldCA9IHt9XG5cdFx0XHRmb3IgYXRyLGkgaW4gZG9tOmF0dHJpYnV0ZXNcblx0XHRcdFx0aWYgYXRyOm5hbWUuc3Vic3RyKDAsNSkgPT0gJ2RhdGEtJ1xuXHRcdFx0XHRcdGRhdGFzZXRbSW1iYS50b0NhbWVsQ2FzZShhdHI6bmFtZS5zbGljZSg1KSldID0gYXRyOnZhbHVlXG5cblx0XHRyZXR1cm4gZGF0YXNldFxuXG5cdCMjI1xuXHRFbXB0eSBwbGFjZWhvbGRlci4gT3ZlcnJpZGUgdG8gaW1wbGVtZW50IGN1c3RvbSByZW5kZXIgYmVoYXZpb3VyLlxuXHRXb3JrcyBtdWNoIGxpa2UgdGhlIGZhbWlsaWFyIHJlbmRlci1tZXRob2QgaW4gUmVhY3QuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgcmVuZGVyXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRDYWxsZWQgaW1wbGljaXRseSB3aGlsZSB0YWcgaXMgaW5pdGlhbGl6aW5nLiBObyBpbml0aWFsIHByb3BzXG5cdHdpbGwgaGF2ZSBiZWVuIHNldCBhdCB0aGlzIHBvaW50LlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGJ1aWxkXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRDYWxsZWQgb25jZSwgaW1wbGljaXRseSB0aHJvdWdoIEltYmEuVGFnI2VuZC4gQWxsIGluaXRpYWwgcHJvcHNcblx0YW5kIGNoaWxkcmVuIHdpbGwgaGF2ZSBiZWVuIHNldCBiZWZvcmUgc2V0dXAgaXMgY2FsbGVkLlxuXHRzZXRDb250ZW50LlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNldHVwXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRDYWxsZWQgaW1wbGljaXRseSB0aHJvdWdoIEltYmEuVGFnI2VuZCwgZm9yIHRhZ3MgdGhhdCBhcmUgcGFydCBvZlxuXHRhIHRhZyB0cmVlICh0aGF0IGFyZSByZW5kZXJlZCBzZXZlcmFsIHRpbWVzKS5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBjb21taXRcblx0XHRyZW5kZXJcblx0XHRzZWxmXG5cblx0IyMjXG5cblx0Q2FsbGVkIGJ5IHRoZSB0YWctc2NoZWR1bGVyIChpZiB0aGlzIHRhZyBpcyBzY2hlZHVsZWQpXG5cdEJ5IGRlZmF1bHQgaXQgd2lsbCBjYWxsIHRoaXMucmVuZGVyLiBEbyBub3Qgb3ZlcnJpZGUgdW5sZXNzXG5cdHlvdSByZWFsbHkgdW5kZXJzdGFuZCBpdC5cblxuXHQjIyNcblx0ZGVmIHRpY2tcblx0XHRyZW5kZXJcblx0XHRzZWxmXG5cblx0IyMjXG5cdFxuXHRBIHZlcnkgaW1wb3J0YW50IG1ldGhvZCB0aGF0IHlvdSB3aWxsIHByYWN0aWNhbGx5IG5ldmVyIG1hbnVhbGx5LlxuXHRUaGUgdGFnIHN5bnRheCBvZiBJbWJhIGNvbXBpbGVzIHRvIGEgY2hhaW4gb2Ygc2V0dGVycywgd2hpY2ggYWx3YXlzXG5cdGVuZHMgd2l0aCAuZW5kLiBgPGEubGFyZ2U+YCBjb21waWxlcyB0byBgdGFnKCdhJykuZmxhZygnbGFyZ2UnKS5lbmQoKWBcblx0XG5cdFlvdSBhcmUgaGlnaGx5IGFkdmljZWQgdG8gbm90IG92ZXJyaWRlIGl0cyBiZWhhdmlvdXIuIFRoZSBmaXJzdCB0aW1lXG5cdGVuZCBpcyBjYWxsZWQgaXQgd2lsbCBtYXJrIHRoZSB0YWcgYXMgaW5pdGlhbGl6ZWQgYW5kIGNhbGwgSW1iYS5UYWcjc2V0dXAsXG5cdGFuZCBjYWxsIEltYmEuVGFnI2NvbW1pdCBldmVyeSB0aW1lLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGVuZFxuXHRcdHNlbGZcblx0XHRcblx0IyBjYWxsZWQgb24gPHNlbGY+IHRvIGNoZWNrIGlmIHNlbGYgaXMgY2FsbGVkIGZyb20gb3RoZXIgcGxhY2VzXG5cdGRlZiAkb3BlbiBjb250ZXh0XG5cdFx0aWYgY29udGV4dCAhPSBAY29udGV4dF9cblx0XHRcdEB0cmVlXyA9IG51bGxcblx0XHRcdEBjb250ZXh0XyA9IGNvbnRleHRcblx0XHRzZWxmXG5cblx0IyMjXG5cdFRoaXMgaXMgY2FsbGVkIGluc3RlYWQgb2YgSW1iYS5UYWcjZW5kIGZvciBgPHNlbGY+YCB0YWcgY2hhaW5zLlxuXHREZWZhdWx0cyB0byBub29wXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc3luY2VkXG5cdFx0c2VsZlxuXG5cdCMgY2FsbGVkIHdoZW4gdGhlIG5vZGUgaXMgYXdha2VuZWQgaW4gdGhlIGRvbSAtIGVpdGhlciBhdXRvbWF0aWNhbGx5XG5cdCMgdXBvbiBhdHRhY2htZW50IHRvIHRoZSBkb20tdHJlZSwgb3IgdGhlIGZpcnN0IHRpbWUgaW1iYSBuZWVkcyB0aGVcblx0IyB0YWcgZm9yIGEgZG9tbm9kZSB0aGF0IGhhcyBiZWVuIHJlbmRlcmVkIG9uIHRoZSBzZXJ2ZXJcblx0ZGVmIGF3YWtlblxuXHRcdHNlbGZcblxuXHQjIyNcblx0TGlzdCBvZiBmbGFncyBmb3IgdGhpcyBub2RlLiBcblx0IyMjXG5cdGRlZiBmbGFnc1xuXHRcdEBkb206Y2xhc3NMaXN0XG5cblx0IyMjXG5cdEFkZCBzcGVmaWNpZWQgZmxhZyB0byBjdXJyZW50IG5vZGUuXG5cdElmIGEgc2Vjb25kIGFyZ3VtZW50IGlzIHN1cHBsaWVkLCBpdCB3aWxsIGJlIGNvZXJjZWQgaW50byBhIEJvb2xlYW4sXG5cdGFuZCB1c2VkIHRvIGluZGljYXRlIHdoZXRoZXIgd2Ugc2hvdWxkIHJlbW92ZSB0aGUgZmxhZyBpbnN0ZWFkLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGZsYWcgbmFtZSwgdG9nZ2xlclxuXHRcdCMgaXQgaXMgbW9zdCBuYXR1cmFsIHRvIHRyZWF0IGEgc2Vjb25kIHVuZGVmaW5lZCBhcmd1bWVudCBhcyBhIG5vLXN3aXRjaFxuXHRcdCMgc28gd2UgbmVlZCB0byBjaGVjayB0aGUgYXJndW1lbnRzLWxlbmd0aFxuXHRcdGlmIGFyZ3VtZW50czpsZW5ndGggPT0gMlxuXHRcdFx0aWYgQGRvbTpjbGFzc0xpc3QuY29udGFpbnMobmFtZSkgIT0gISF0b2dnbGVyXG5cdFx0XHRcdEBkb206Y2xhc3NMaXN0LnRvZ2dsZShuYW1lKVxuXHRcdGVsc2Vcblx0XHRcdCMgZmlyZWZveCB3aWxsIHRyaWdnZXIgYSBjaGFuZ2UgaWYgYWRkaW5nIGV4aXN0aW5nIGNsYXNzXG5cdFx0XHRAZG9tOmNsYXNzTGlzdC5hZGQobmFtZSkgdW5sZXNzIEBkb206Y2xhc3NMaXN0LmNvbnRhaW5zKG5hbWUpXG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblx0UmVtb3ZlIHNwZWNpZmllZCBmbGFnIGZyb20gbm9kZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHVuZmxhZyBuYW1lXG5cdFx0QGRvbTpjbGFzc0xpc3QucmVtb3ZlKG5hbWUpXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRUb2dnbGUgc3BlY2lmaWVkIGZsYWcgb24gbm9kZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHRvZ2dsZUZsYWcgbmFtZVxuXHRcdEBkb206Y2xhc3NMaXN0LnRvZ2dsZShuYW1lKVxuXHRcdHNlbGZcblxuXHQjIyNcblx0Q2hlY2sgd2hldGhlciBjdXJyZW50IG5vZGUgaGFzIHNwZWNpZmllZCBmbGFnXG5cdEByZXR1cm4ge2Jvb2x9XG5cdCMjI1xuXHRkZWYgaGFzRmxhZyBuYW1lXG5cdFx0QGRvbTpjbGFzc0xpc3QuY29udGFpbnMobmFtZSlcblxuXHRcblx0ZGVmIGZsYWdJZiBmbGFnLCBib29sXG5cdFx0dmFyIGYgPSBAZmxhZ3NfIHx8PSB7fVxuXHRcdGxldCBwcmV2ID0gZltmbGFnXVxuXG5cdFx0aWYgYm9vbCBhbmQgIXByZXZcblx0XHRcdEBkb206Y2xhc3NMaXN0LmFkZChmbGFnKVxuXHRcdFx0ZltmbGFnXSA9IHllc1xuXHRcdGVsaWYgcHJldiBhbmQgIWJvb2xcblx0XHRcdEBkb206Y2xhc3NMaXN0LnJlbW92ZShmbGFnKVxuXHRcdFx0ZltmbGFnXSA9IG5vXG5cblx0XHRyZXR1cm4gc2VsZlxuXHRcdFxuXHQjIyNcblx0U2V0L3VwZGF0ZSBhIG5hbWVkIGZsYWcuIEl0IHJlbWVtYmVycyB0aGUgcHJldmlvdXNcblx0dmFsdWUgb2YgdGhlIGZsYWcsIGFuZCByZW1vdmVzIGl0IGJlZm9yZSBzZXR0aW5nIHRoZSBuZXcgdmFsdWUuXG5cblx0XHRub2RlLnNldEZsYWcoJ3R5cGUnLCd0b2RvJylcblx0XHRub2RlLnNldEZsYWcoJ3R5cGUnLCdwcm9qZWN0Jylcblx0XHQjIHRvZG8gaXMgcmVtb3ZlZCwgcHJvamVjdCBpcyBhZGRlZC5cblxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNldEZsYWcgbmFtZSwgdmFsdWVcblx0XHRsZXQgZmxhZ3MgPSBAbmFtZWRGbGFnc18gfHw9IHt9XG5cdFx0bGV0IHByZXYgPSBmbGFnc1tuYW1lXVxuXHRcdGlmIHByZXYgIT0gdmFsdWVcblx0XHRcdHVuZmxhZyhwcmV2KSBpZiBwcmV2XG5cdFx0XHRmbGFnKHZhbHVlKSBpZiB2YWx1ZVxuXHRcdFx0ZmxhZ3NbbmFtZV0gPSB2YWx1ZVxuXHRcdHJldHVybiBzZWxmXG5cblxuXHQjIyNcblx0R2V0IHRoZSBzY2hlZHVsZXIgZm9yIHRoaXMgbm9kZS4gQSBuZXcgc2NoZWR1bGVyIHdpbGwgYmUgY3JlYXRlZFxuXHRpZiBpdCBkb2VzIG5vdCBhbHJlYWR5IGV4aXN0LlxuXG5cdEByZXR1cm4ge0ltYmEuU2NoZWR1bGVyfVxuXHQjIyNcblx0ZGVmIHNjaGVkdWxlclxuXHRcdEBzY2hlZHVsZXIgPz0gSW1iYS5TY2hlZHVsZXIubmV3KHNlbGYpXG5cblx0IyMjXG5cblx0U2hvcnRoYW5kIHRvIHN0YXJ0IHNjaGVkdWxpbmcgYSBub2RlLiBUaGUgbWV0aG9kIHdpbGwgYmFzaWNhbGx5XG5cdHByb3h5IHRoZSBhcmd1bWVudHMgdGhyb3VnaCB0byBzY2hlZHVsZXIuY29uZmlndXJlLCBhbmQgdGhlblxuXHRhY3RpdmF0ZSB0aGUgc2NoZWR1bGVyLlxuXHRcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzY2hlZHVsZSBvcHRpb25zID0ge2V2ZW50czogeWVzfVxuXHRcdHNjaGVkdWxlci5jb25maWd1cmUob3B0aW9ucykuYWN0aXZhdGVcblx0XHRzZWxmXG5cblx0IyMjXG5cdFNob3J0aGFuZCBmb3IgZGVhY3RpdmF0aW5nIHNjaGVkdWxlciAoaWYgdGFnIGhhcyBvbmUpLlxuXHRAZGVwcmVjYXRlZFxuXHQjIyNcblx0ZGVmIHVuc2NoZWR1bGVcblx0XHRzY2hlZHVsZXIuZGVhY3RpdmF0ZSBpZiBAc2NoZWR1bGVyXG5cdFx0c2VsZlxuXG5cblx0IyMjXG5cdEdldCB0aGUgcGFyZW50IG9mIGN1cnJlbnQgbm9kZVxuXHRAcmV0dXJuIHtJbWJhLlRhZ30gXG5cdCMjI1xuXHRkZWYgcGFyZW50XG5cdFx0SW1iYS5nZXRUYWdGb3JEb20oZG9tOnBhcmVudE5vZGUpXG5cblx0IyMjXG5cdEdldCB0aGUgY2hpbGRyZW4gb2Ygbm9kZVxuXHRAcmV0dXJuIHtJbWJhLlRhZ1tdfVxuXHQjIyNcblx0ZGVmIGNoaWxkcmVuIHNlbFxuXHRcdGZvciBpdGVtIGluIEBkb206Y2hpbGRyZW5cblx0XHRcdGl0ZW0uQHRhZyBvciBJbWJhLmdldFRhZ0ZvckRvbShpdGVtKVxuXHRcblx0ZGVmIHF1ZXJ5U2VsZWN0b3IgcVxuXHRcdEltYmEuZ2V0VGFnRm9yRG9tKEBkb20ucXVlcnlTZWxlY3RvcihxKSlcblxuXHRkZWYgcXVlcnlTZWxlY3RvckFsbCBxXG5cdFx0dmFyIGl0ZW1zID0gW11cblx0XHRmb3IgaXRlbSBpbiBAZG9tLnF1ZXJ5U2VsZWN0b3JBbGwocSlcblx0XHRcdGl0ZW1zLnB1c2goIEltYmEuZ2V0VGFnRm9yRG9tKGl0ZW0pIClcblx0XHRyZXR1cm4gaXRlbXNcblxuXHQjIyNcblx0Q2hlY2sgaWYgdGhpcyBub2RlIG1hdGNoZXMgYSBzZWxlY3RvclxuXHRAcmV0dXJuIHtCb29sZWFufVxuXHQjIyNcblx0ZGVmIG1hdGNoZXMgc2VsXG5cdFx0aWYgc2VsIGlzYSBGdW5jdGlvblxuXHRcdFx0cmV0dXJuIHNlbChzZWxmKVxuXG5cdFx0c2VsID0gc2VsLnF1ZXJ5IGlmIHNlbDpxdWVyeSBpc2EgRnVuY3Rpb25cblx0XHRpZiB2YXIgZm4gPSAoQGRvbTptYXRjaGVzIG9yIEBkb206bWF0Y2hlc1NlbGVjdG9yIG9yIEBkb206d2Via2l0TWF0Y2hlc1NlbGVjdG9yIG9yIEBkb206bXNNYXRjaGVzU2VsZWN0b3Igb3IgQGRvbTptb3pNYXRjaGVzU2VsZWN0b3IpXG5cdFx0XHRyZXR1cm4gZm4uY2FsbChAZG9tLHNlbClcblxuXHQjIyNcblx0R2V0IHRoZSBmaXJzdCBlbGVtZW50IG1hdGNoaW5nIHN1cHBsaWVkIHNlbGVjdG9yIC8gZmlsdGVyXG5cdHRyYXZlcnNpbmcgdXB3YXJkcywgYnV0IGluY2x1ZGluZyB0aGUgbm9kZSBpdHNlbGYuXG5cdEByZXR1cm4ge0ltYmEuVGFnfVxuXHQjIyNcblx0ZGVmIGNsb3Nlc3Qgc2VsXG5cdFx0SW1iYS5nZXRUYWdGb3JEb20oQGRvbS5jbG9zZXN0KHNlbCkpXG5cblx0IyMjXG5cdENoZWNrIGlmIG5vZGUgY29udGFpbnMgb3RoZXIgbm9kZVxuXHRAcmV0dXJuIHtCb29sZWFufSBcblx0IyMjXG5cdGRlZiBjb250YWlucyBub2RlXG5cdFx0ZG9tLmNvbnRhaW5zKG5vZGUuQGRvbSBvciBub2RlKVxuXG5cblx0IyMjXG5cdFNob3J0aGFuZCBmb3IgY29uc29sZS5sb2cgb24gZWxlbWVudHNcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBsb2cgKmFyZ3Ncblx0XHRhcmdzLnVuc2hpZnQoY29uc29sZSlcblx0XHRGdW5jdGlvbjpwcm90b3R5cGU6Y2FsbC5hcHBseShjb25zb2xlOmxvZywgYXJncylcblx0XHRzZWxmXG5cblx0ZGVmIGNzcyBrZXksIHZhbFxuXHRcdGlmIGtleSBpc2EgT2JqZWN0XG5cdFx0XHRjc3Moayx2KSBmb3Igb3duIGssdiBvZiBrZXlcblx0XHRcdHJldHVybiBzZWxmXG5cblx0XHR2YXIgbmFtZSA9IEltYmEuQ1NTS2V5TWFwW2tleV0gb3Iga2V5XG5cblx0XHRpZiB2YWwgPT0gbnVsbFxuXHRcdFx0ZG9tOnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpXG5cdFx0ZWxpZiB2YWwgPT0gdW5kZWZpbmVkIGFuZCBhcmd1bWVudHM6bGVuZ3RoID09IDFcblx0XHRcdHJldHVybiBkb206c3R5bGVbbmFtZV1cblx0XHRlbHNlXG5cdFx0XHRpZiB2YWwgaXNhIE51bWJlciBhbmQgbmFtZS5tYXRjaCgvd2lkdGh8aGVpZ2h0fGxlZnR8cmlnaHR8dG9wfGJvdHRvbS8pXG5cdFx0XHRcdGRvbTpzdHlsZVtuYW1lXSA9IHZhbCArIFwicHhcIlxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRkb206c3R5bGVbbmFtZV0gPSB2YWxcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBzZXRTdHlsZSBzdHlsZVxuXHRcdHNldEF0dHJpYnV0ZSgnc3R5bGUnLHN0eWxlKVxuXG5cdGRlZiBzdHlsZVxuXHRcdGdldEF0dHJpYnV0ZSgnc3R5bGUnKVxuXG5cdCMjI1xuXHRUcmlnZ2VyIGFuIGV2ZW50IGZyb20gY3VycmVudCBub2RlLiBEaXNwYXRjaGVkIHRocm91Z2ggdGhlIEltYmEgZXZlbnQgbWFuYWdlci5cblx0VG8gZGlzcGF0Y2ggYWN0dWFsIGRvbSBldmVudHMsIHVzZSBkb20uZGlzcGF0Y2hFdmVudCBpbnN0ZWFkLlxuXG5cdEByZXR1cm4ge0ltYmEuRXZlbnR9XG5cdCMjI1xuXHRkZWYgdHJpZ2dlciBuYW1lLCBkYXRhID0ge31cblx0XHQkd2ViJCA/IEltYmEuRXZlbnRzLnRyaWdnZXIobmFtZSxzZWxmLGRhdGE6IGRhdGEpIDogbnVsbFxuXG5cdCMjI1xuXHRGb2N1cyBvbiBjdXJyZW50IG5vZGVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBmb2N1c1xuXHRcdGRvbS5mb2N1c1xuXHRcdHNlbGZcblxuXHQjIyNcblx0UmVtb3ZlIGZvY3VzIGZyb20gY3VycmVudCBub2RlXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgYmx1clxuXHRcdGRvbS5ibHVyXG5cdFx0c2VsZlxuXG5cdGRlZiB0b1N0cmluZ1xuXHRcdGRvbTpvdXRlckhUTUxcblx0XG5cbkltYmEuVGFnOnByb3RvdHlwZTppbml0aWFsaXplID0gSW1iYS5UYWdcblxuY2xhc3MgSW1iYS5TVkdUYWcgPCBJbWJhLlRhZ1xuXG5cdGRlZiBzZWxmLm5hbWVzcGFjZVVSSVxuXHRcdFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuXG5cdGRlZiBzZWxmLmJ1aWxkTm9kZVxuXHRcdHZhciBkb20gPSBJbWJhLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2VVUkksQG5vZGVUeXBlKVxuXHRcdHZhciBjbHMgPSBAY2xhc3Nlcy5qb2luKFwiIFwiKVxuXHRcdGRvbTpjbGFzc05hbWU6YmFzZVZhbCA9IGNscyBpZiBjbHNcblx0XHRkb21cblxuXHRkZWYgc2VsZi5pbmhlcml0IGNoaWxkXG5cdFx0Y2hpbGQuQHByb3RvRG9tID0gbnVsbFxuXHRcdGlmIGNoaWxkLkBuYW1lIGluIEltYmEuU1ZHX1RBR1Ncblx0XHRcdGNoaWxkLkBub2RlVHlwZSA9IGNoaWxkLkBuYW1lXG5cdFx0XHRjaGlsZC5AY2xhc3NlcyA9IFtdXG5cdFx0ZWxzZVxuXHRcdFx0Y2hpbGQuQG5vZGVUeXBlID0gQG5vZGVUeXBlXG5cdFx0XHR2YXIgY2xhc3NOYW1lID0gXCJfXCIgKyBjaGlsZC5AbmFtZS5yZXBsYWNlKC9fL2csICctJylcblx0XHRcdGNoaWxkLkBjbGFzc2VzID0gQGNsYXNzZXMuY29uY2F0KGNsYXNzTmFtZSlcblxuSW1iYS5IVE1MX1RBR1MgPSBcImEgYWJiciBhZGRyZXNzIGFyZWEgYXJ0aWNsZSBhc2lkZSBhdWRpbyBiIGJhc2UgYmRpIGJkbyBiaWcgYmxvY2txdW90ZSBib2R5IGJyIGJ1dHRvbiBjYW52YXMgY2FwdGlvbiBjaXRlIGNvZGUgY29sIGNvbGdyb3VwIGRhdGEgZGF0YWxpc3QgZGQgZGVsIGRldGFpbHMgZGZuIGRpdiBkbCBkdCBlbSBlbWJlZCBmaWVsZHNldCBmaWdjYXB0aW9uIGZpZ3VyZSBmb290ZXIgZm9ybSBoMSBoMiBoMyBoNCBoNSBoNiBoZWFkIGhlYWRlciBociBodG1sIGkgaWZyYW1lIGltZyBpbnB1dCBpbnMga2JkIGtleWdlbiBsYWJlbCBsZWdlbmQgbGkgbGluayBtYWluIG1hcCBtYXJrIG1lbnUgbWVudWl0ZW0gbWV0YSBtZXRlciBuYXYgbm9zY3JpcHQgb2JqZWN0IG9sIG9wdGdyb3VwIG9wdGlvbiBvdXRwdXQgcCBwYXJhbSBwcmUgcHJvZ3Jlc3MgcSBycCBydCBydWJ5IHMgc2FtcCBzY3JpcHQgc2VjdGlvbiBzZWxlY3Qgc21hbGwgc291cmNlIHNwYW4gc3Ryb25nIHN0eWxlIHN1YiBzdW1tYXJ5IHN1cCB0YWJsZSB0Ym9keSB0ZCB0ZXh0YXJlYSB0Zm9vdCB0aCB0aGVhZCB0aW1lIHRpdGxlIHRyIHRyYWNrIHUgdWwgdmFyIHZpZGVvIHdiclwiLnNwbGl0KFwiIFwiKVxuSW1iYS5IVE1MX1RBR1NfVU5TQUZFID0gXCJhcnRpY2xlIGFzaWRlIGhlYWRlciBzZWN0aW9uXCIuc3BsaXQoXCIgXCIpXG5JbWJhLlNWR19UQUdTID0gXCJjaXJjbGUgZGVmcyBlbGxpcHNlIGcgbGluZSBsaW5lYXJHcmFkaWVudCBtYXNrIHBhdGggcGF0dGVybiBwb2x5Z29uIHBvbHlsaW5lIHJhZGlhbEdyYWRpZW50IHJlY3Qgc3RvcCBzdmcgdGV4dCB0c3BhblwiLnNwbGl0KFwiIFwiKVxuXG5JbWJhLkhUTUxfQVRUUlMgPVxuXHRhOiBcImhyZWYgdGFyZ2V0IGhyZWZsYW5nIG1lZGlhIGRvd25sb2FkIHJlbCB0eXBlXCJcblx0Zm9ybTogXCJtZXRob2QgYWN0aW9uIGVuY3R5cGUgYXV0b2NvbXBsZXRlIHRhcmdldFwiXG5cdGJ1dHRvbjogXCJhdXRvZm9jdXMgdHlwZVwiXG5cdGlucHV0OiBcImFjY2VwdCBkaXNhYmxlZCBmb3JtIGxpc3QgbWF4IG1heGxlbmd0aCBtaW4gcGF0dGVybiByZXF1aXJlZCBzaXplIHN0ZXAgdHlwZVwiXG5cdGxhYmVsOiBcImFjY2Vzc2tleSBmb3IgZm9ybVwiXG5cdGltZzogXCJzcmMgc3Jjc2V0XCJcblx0bGluazogXCJyZWwgdHlwZSBocmVmIG1lZGlhXCJcblx0aWZyYW1lOiBcInJlZmVycmVycG9saWN5IHNyYyBzcmNkb2Mgc2FuZGJveFwiXG5cdG1ldGE6IFwicHJvcGVydHkgY29udGVudCBjaGFyc2V0IGRlc2NcIlxuXHRvcHRncm91cDogXCJsYWJlbFwiXG5cdG9wdGlvbjogXCJsYWJlbFwiXG5cdG91dHB1dDogXCJmb3IgZm9ybVwiXG5cdG9iamVjdDogXCJ0eXBlIGRhdGEgd2lkdGggaGVpZ2h0XCJcblx0cGFyYW06IFwibmFtZSB2YWx1ZVwiXG5cdHByb2dyZXNzOiBcIm1heFwiXG5cdHNjcmlwdDogXCJzcmMgdHlwZSBhc3luYyBkZWZlciBjcm9zc29yaWdpbiBpbnRlZ3JpdHkgbm9uY2UgbGFuZ3VhZ2VcIlxuXHRzZWxlY3Q6IFwic2l6ZSBmb3JtIG11bHRpcGxlXCJcblx0dGV4dGFyZWE6IFwicm93cyBjb2xzXCJcblxuXG5JbWJhLkhUTUxfUFJPUFMgPVxuXHRpbnB1dDogXCJhdXRvZm9jdXMgYXV0b2NvbXBsZXRlIGF1dG9jb3JyZWN0IHZhbHVlIHBsYWNlaG9sZGVyIHJlcXVpcmVkIGRpc2FibGVkIG11bHRpcGxlIGNoZWNrZWQgcmVhZE9ubHlcIlxuXHR0ZXh0YXJlYTogXCJhdXRvZm9jdXMgYXV0b2NvbXBsZXRlIGF1dG9jb3JyZWN0IHZhbHVlIHBsYWNlaG9sZGVyIHJlcXVpcmVkIGRpc2FibGVkIG11bHRpcGxlIGNoZWNrZWQgcmVhZE9ubHlcIlxuXHRmb3JtOiBcIm5vdmFsaWRhdGVcIlxuXHRmaWVsZHNldDogXCJkaXNhYmxlZFwiXG5cdGJ1dHRvbjogXCJkaXNhYmxlZFwiXG5cdHNlbGVjdDogXCJhdXRvZm9jdXMgZGlzYWJsZWQgcmVxdWlyZWRcIlxuXHRvcHRpb246IFwiZGlzYWJsZWQgc2VsZWN0ZWQgdmFsdWVcIlxuXHRvcHRncm91cDogXCJkaXNhYmxlZFwiXG5cdHByb2dyZXNzOiBcInZhbHVlXCJcblx0ZmllbGRzZXQ6IFwiZGlzYWJsZWRcIlxuXHRjYW52YXM6IFwid2lkdGggaGVpZ2h0XCJcblxuZGVmIGV4dGVuZGVyIG9iaiwgc3VwXG5cdGZvciBvd24gayx2IG9mIHN1cFxuXHRcdG9ialtrXSA/PSB2XG5cblx0b2JqOnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwOnByb3RvdHlwZSlcblx0b2JqOl9fc3VwZXJfXyA9IG9iajpwcm90b3R5cGU6X19zdXBlcl9fID0gc3VwOnByb3RvdHlwZVxuXHRvYmo6cHJvdG90eXBlOmNvbnN0cnVjdG9yID0gb2JqXG5cdHN1cC5pbmhlcml0KG9iaikgaWYgc3VwOmluaGVyaXRcblx0cmV0dXJuIG9ialxuXG5kZWYgVGFnXG5cdHJldHVybiBkbyB8ZG9tLGN0eHxcblx0XHR0aGlzLmluaXRpYWxpemUoZG9tLGN0eClcblx0XHRyZXR1cm4gdGhpc1xuXG5kZWYgVGFnU3Bhd25lciB0eXBlXG5cdHJldHVybiBkbyB8em9uZXwgdHlwZS5idWlsZCh6b25lKVxuXG5cbmNsYXNzIEltYmEuVGFnc1xuXG5cdGRlZiBpbml0aWFsaXplXG5cdFx0c2VsZlxuXG5cdGRlZiBfX2Nsb25lIG5zXG5cdFx0dmFyIGNsb25lID0gT2JqZWN0LmNyZWF0ZShzZWxmKVxuXHRcdGNsb25lLkBwYXJlbnQgPSBzZWxmXG5cdFx0cmV0dXJuIGNsb25lXG5cblx0ZGVmIG5zIG5hbWVcblx0XHRzZWxmWydfJyArIG5hbWUudG9VcHBlckNhc2VdIHx8IGRlZmluZU5hbWVzcGFjZShuYW1lKVxuXG5cdGRlZiBkZWZpbmVOYW1lc3BhY2UgbmFtZVxuXHRcdHZhciBjbG9uZSA9IE9iamVjdC5jcmVhdGUoc2VsZilcblx0XHRjbG9uZS5AcGFyZW50ID0gc2VsZlxuXHRcdGNsb25lLkBucyA9IG5hbWVcblx0XHRzZWxmWydfJyArIG5hbWUudG9VcHBlckNhc2VdID0gY2xvbmVcblx0XHRyZXR1cm4gY2xvbmVcblxuXHRkZWYgYmFzZVR5cGUgbmFtZSwgbnNcblx0XHRuYW1lIGluIEltYmEuSFRNTF9UQUdTID8gJ2VsZW1lbnQnIDogJ2RpdidcblxuXHRkZWYgZGVmaW5lVGFnIGZ1bGxOYW1lLCBzdXByID0gJycsICZib2R5XG5cdFx0aWYgYm9keSBhbmQgYm9keS5Abm9kZVR5cGVcblx0XHRcdHN1cHIgPSBib2R5XG5cdFx0XHRib2R5ID0gbnVsbFxuXHRcdFx0XG5cdFx0aWYgc2VsZltmdWxsTmFtZV1cblx0XHRcdGNvbnNvbGUubG9nIFwidGFnIGFscmVhZHkgZXhpc3RzP1wiLGZ1bGxOYW1lXG5cdFx0XG5cdFx0IyBpZiBpdCBpcyBuYW1lc3BhY2VkXG5cdFx0dmFyIG5zXG5cdFx0dmFyIG5hbWUgPSBmdWxsTmFtZVxuXHRcdGxldCBuc2lkeCA9IG5hbWUuaW5kZXhPZignOicpXG5cdFx0aWYgIG5zaWR4ID49IDBcblx0XHRcdG5zID0gZnVsbE5hbWUuc3Vic3RyKDAsbnNpZHgpXG5cdFx0XHRuYW1lID0gZnVsbE5hbWUuc3Vic3RyKG5zaWR4ICsgMSlcblx0XHRcdGlmIG5zID09ICdzdmcnIGFuZCAhc3VwclxuXHRcdFx0XHRzdXByID0gJ3N2ZzplbGVtZW50J1xuXG5cdFx0c3VwciB8fD0gYmFzZVR5cGUoZnVsbE5hbWUpXG5cblx0XHRsZXQgc3VwZXJ0eXBlID0gc3VwciBpc2EgU3RyaW5nID8gZmluZFRhZ1R5cGUoc3VwcikgOiBzdXByXG5cdFx0bGV0IHRhZ3R5cGUgPSBUYWcoKVxuXG5cdFx0dGFndHlwZS5AbmFtZSA9IG5hbWVcblx0XHR0YWd0eXBlLkBmbGFnTmFtZSA9IG51bGxcblxuXHRcdGlmIG5hbWVbMF0gPT0gJyMnXG5cdFx0XHRJbWJhLlNJTkdMRVRPTlNbbmFtZS5zbGljZSgxKV0gPSB0YWd0eXBlXG5cdFx0XHRzZWxmW25hbWVdID0gdGFndHlwZVxuXHRcdGVsaWYgbmFtZVswXSA9PSBuYW1lWzBdLnRvVXBwZXJDYXNlXG5cdFx0XHR0YWd0eXBlLkBmbGFnTmFtZSA9IG5hbWVcblx0XHRlbHNlXG5cdFx0XHR0YWd0eXBlLkBmbGFnTmFtZSA9IFwiX1wiICsgZnVsbE5hbWUucmVwbGFjZSgvW19cXDpdL2csICctJylcblx0XHRcdHNlbGZbZnVsbE5hbWVdID0gdGFndHlwZVxuXG5cdFx0ZXh0ZW5kZXIodGFndHlwZSxzdXBlcnR5cGUpXG5cblx0XHRpZiBib2R5XG5cdFx0XHRib2R5LmNhbGwodGFndHlwZSx0YWd0eXBlLCB0YWd0eXBlLlRBR1Mgb3Igc2VsZilcblx0XHRcdHRhZ3R5cGUuZGVmaW5lZCBpZiB0YWd0eXBlOmRlZmluZWRcblx0XHRcdG9wdGltaXplVGFnKHRhZ3R5cGUpXG5cdFx0cmV0dXJuIHRhZ3R5cGVcblxuXHRkZWYgZGVmaW5lU2luZ2xldG9uIG5hbWUsIHN1cHIsICZib2R5XG5cdFx0ZGVmaW5lVGFnKG5hbWUsc3Vwcixib2R5KVxuXG5cdGRlZiBleHRlbmRUYWcgbmFtZSwgc3VwciA9ICcnLCAmYm9keVxuXHRcdHZhciBrbGFzcyA9IChuYW1lIGlzYSBTdHJpbmcgPyBmaW5kVGFnVHlwZShuYW1lKSA6IG5hbWUpXG5cdFx0IyBhbGxvdyBmb3IgcHJpdmF0ZSB0YWdzIGhlcmUgYXMgd2VsbD9cblx0XHRib2R5IGFuZCBib2R5LmNhbGwoa2xhc3Msa2xhc3Msa2xhc3M6cHJvdG90eXBlKSBpZiBib2R5XG5cdFx0a2xhc3MuZXh0ZW5kZWQgaWYga2xhc3M6ZXh0ZW5kZWRcblx0XHRvcHRpbWl6ZVRhZyhrbGFzcylcblx0XHRyZXR1cm4ga2xhc3NcblxuXHRkZWYgb3B0aW1pemVUYWcgdGFndHlwZVxuXHRcdHRhZ3R5cGU6cHJvdG90eXBlPy5vcHRpbWl6ZVRhZ1N0cnVjdHVyZVxuXHRcdFxuXHRkZWYgZmluZFRhZ1R5cGUgdHlwZVxuXHRcdGxldCBrbGFzcyA9IHNlbGZbdHlwZV1cblx0XHR1bmxlc3Mga2xhc3Ncblx0XHRcdGlmIHR5cGUuc3Vic3RyKDAsNCkgPT0gJ3N2ZzonXG5cdFx0XHRcdGtsYXNzID0gZGVmaW5lVGFnKHR5cGUsJ3N2ZzplbGVtZW50JylcblxuXHRcdFx0ZWxpZiBJbWJhLkhUTUxfVEFHUy5pbmRleE9mKHR5cGUpID49IDBcblx0XHRcdFx0a2xhc3MgPSBkZWZpbmVUYWcodHlwZSwnZWxlbWVudCcpXG5cblx0XHRcdFx0aWYgbGV0IGF0dHJzID0gSW1iYS5IVE1MX0FUVFJTW3R5cGVdXG5cdFx0XHRcdFx0Zm9yIG5hbWUgaW4gYXR0cnMuc3BsaXQoXCIgXCIpXG5cdFx0XHRcdFx0XHRJbWJhLmF0dHIoa2xhc3MsbmFtZSlcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRpZiBsZXQgcHJvcHMgPSBJbWJhLkhUTUxfUFJPUFNbdHlwZV1cblx0XHRcdFx0XHRmb3IgbmFtZSBpbiBwcm9wcy5zcGxpdChcIiBcIilcblx0XHRcdFx0XHRcdEltYmEuYXR0cihrbGFzcyxuYW1lLGRvbTogeWVzKVxuXHRcdHJldHVybiBrbGFzc1xuXHRcdFxuXHRkZWYgY3JlYXRlRWxlbWVudCBuYW1lLCBvd25lclxuXHRcdHZhciB0eXBcblx0XHRpZiBuYW1lIGlzYSBGdW5jdGlvblxuXHRcdFx0dHlwID0gbmFtZVxuXHRcdGVsc2VcdFx0XHRcblx0XHRcdGlmICRkZWJ1ZyRcblx0XHRcdFx0dGhyb3coXCJjYW5ub3QgZmluZCB0YWctdHlwZSB7bmFtZX1cIikgdW5sZXNzIGZpbmRUYWdUeXBlKG5hbWUpXG5cdFx0XHR0eXAgPSBmaW5kVGFnVHlwZShuYW1lKVxuXHRcdHR5cC5idWlsZChvd25lcilcblxuXG5kZWYgSW1iYS5jcmVhdGVFbGVtZW50IG5hbWUsIGN0eCwgcmVmLCBwcmVmXG5cdHZhciB0eXBlID0gbmFtZVxuXHR2YXIgcGFyZW50XG5cdGlmIG5hbWUgaXNhIEZ1bmN0aW9uXG5cdFx0dHlwZSA9IG5hbWVcblx0ZWxzZVxuXHRcdGlmICRkZWJ1ZyRcblx0XHRcdHRocm93KFwiY2Fubm90IGZpbmQgdGFnLXR5cGUge25hbWV9XCIpIHVubGVzcyBJbWJhLlRBR1MuZmluZFRhZ1R5cGUobmFtZSlcblx0XHR0eXBlID0gSW1iYS5UQUdTLmZpbmRUYWdUeXBlKG5hbWUpXG5cdFxuXHRpZiBjdHggaXNhIFRhZ01hcFxuXHRcdHBhcmVudCA9IGN0eDpwYXIkXG5cdGVsaWYgcHJlZiBpc2EgSW1iYS5UYWdcblx0XHRwYXJlbnQgPSBwcmVmXG5cdGVsc2Vcblx0XHRwYXJlbnQgPSBjdHggYW5kIHByZWYgIT0gdW5kZWZpbmVkID8gY3R4W3ByZWZdIDogKGN0eCBhbmQgY3R4LkB0YWcgb3IgY3R4KVxuXG5cdHZhciBub2RlID0gdHlwZS5idWlsZChwYXJlbnQpXG5cdFxuXHRpZiBjdHggaXNhIFRhZ01hcFxuXHRcdGN0eDppJCsrXG5cdFx0bm9kZToka2V5ID0gcmVmXG5cblx0IyBub2RlOiRyZWYgPSByZWYgaWYgcmVmXG5cdCMgY29udGV4dDppJCsrICMgb25seSBpZiBpdCBpcyBub3QgYW4gYXJyYXk/XG5cdGlmIGN0eCBhbmQgcmVmICE9IHVuZGVmaW5lZFxuXHRcdGN0eFtyZWZdID0gbm9kZVxuXG5cdHJldHVybiBub2RlXG5cbmRlZiBJbWJhLmNyZWF0ZVRhZ0NhY2hlIG93bmVyXG5cdHZhciBpdGVtID0gW11cblx0aXRlbS5AdGFnID0gb3duZXJcblx0cmV0dXJuIGl0ZW1cblxuXHR2YXIgcGFyID0gKHByZWYgIT0gdW5kZWZpbmVkID8gY3R4W3ByZWZdIDogY3R4LkB0YWcpXG5cdHZhciBub2RlID0gVGFnTWFwLm5ldyhjdHgscmVmLHBhcilcblx0Y3R4W3JlZl0gPSBub2RlXG5cdHJldHVybiBub2RlXG5cdFxuZGVmIEltYmEuY3JlYXRlVGFnTWFwIGN0eCwgcmVmLCBwcmVmXG5cdHZhciBwYXIgPSAocHJlZiAhPSB1bmRlZmluZWQgPyBwcmVmIDogY3R4LkB0YWcpXG5cdHZhciBub2RlID0gVGFnTWFwLm5ldyhjdHgscmVmLHBhcilcblx0Y3R4W3JlZl0gPSBub2RlXG5cdHJldHVybiBub2RlXG5cbmRlZiBJbWJhLmNyZWF0ZVRhZ0xpc3QgY3R4LCByZWYsIHByZWZcblx0dmFyIG5vZGUgPSBbXVxuXHRub2RlLkB0eXBlID0gNFxuXHRub2RlLkB0YWcgPSAocHJlZiAhPSB1bmRlZmluZWQgPyBwcmVmIDogY3R4LkB0YWcpXG5cdGN0eFtyZWZdID0gbm9kZVxuXHRyZXR1cm4gbm9kZVxuXG5kZWYgSW1iYS5jcmVhdGVUYWdMb29wUmVzdWx0IGN0eCwgcmVmLCBwcmVmXG5cdHZhciBub2RlID0gW11cblx0bm9kZS5AdHlwZSA9IDVcblx0bm9kZTpjYWNoZSA9IHtpJDogMH1cblx0cmV0dXJuIG5vZGVcblxuIyB1c2UgYXJyYXkgaW5zdGVhZD9cbmNsYXNzIFRhZ0NhY2hlXG5cdGRlZiBzZWxmLmJ1aWxkIG93bmVyXG5cdFx0dmFyIGl0ZW0gPSBbXVxuXHRcdGl0ZW0uQHRhZyA9IG93bmVyXG5cdFx0cmV0dXJuIGl0ZW1cblxuXHRkZWYgaW5pdGlhbGl6ZSBvd25lclxuXHRcdHNlbGYuQHRhZyA9IG93bmVyXG5cdFx0c2VsZlxuXHRcbmNsYXNzIFRhZ01hcFxuXHRcblx0ZGVmIGluaXRpYWxpemUgY2FjaGUsIHJlZiwgcGFyXG5cdFx0c2VsZjpjYWNoZSQgPSBjYWNoZVxuXHRcdHNlbGY6a2V5JCA9IHJlZlxuXHRcdHNlbGY6cGFyJCA9IHBhclxuXHRcdHNlbGY6aSQgPSAwXG5cdFx0IyBzZWxmOmN1cnIkID0gc2VsZjokaXRlcm5ldygpXG5cdFx0IyBzZWxmOm5leHQkID0gc2VsZjokaXRlcm5ldygpXG5cdFxuXHRkZWYgJGl0ZXJcblx0XHR2YXIgaXRlbSA9IFtdXG5cdFx0aXRlbS5AdHlwZSA9IDVcblx0XHRpdGVtOnN0YXRpYyA9IDUgIyB3cm9uZyghKVxuXHRcdGl0ZW06Y2FjaGUgPSBzZWxmXG5cdFx0cmV0dXJuIGl0ZW1cblx0XHRcblx0ZGVmICRwcnVuZSBpdGVtc1xuXHRcdGxldCBjYWNoZSA9IHNlbGY6Y2FjaGUkXG5cdFx0bGV0IGtleSA9IHNlbGY6a2V5JFxuXHRcdGxldCBjbG9uZSA9IFRhZ01hcC5uZXcoY2FjaGUsa2V5LHNlbGY6cGFyJClcblx0XHRmb3IgaXRlbSBpbiBpdGVtc1xuXHRcdFx0Y2xvbmVbaXRlbTprZXkkXSA9IGl0ZW1cblx0XHRjbG9uZTppJCA9IGl0ZW1zOmxlbmd0aFxuXHRcdHJldHVybiBjYWNoZVtrZXldID0gY2xvbmVcblxuSW1iYS5UYWdNYXAgPSBUYWdNYXBcbkltYmEuVGFnQ2FjaGUgPSBUYWdDYWNoZVxuSW1iYS5TSU5HTEVUT05TID0ge31cbkltYmEuVEFHUyA9IEltYmEuVGFncy5uZXdcbkltYmEuVEFHU1s6ZWxlbWVudF0gPSBJbWJhLlRBR1NbOmh0bWxlbGVtZW50XSA9IEltYmEuVGFnXG5JbWJhLlRBR1NbJ3N2ZzplbGVtZW50J10gPSBJbWJhLlNWR1RhZ1xuXG5kZWYgSW1iYS5kZWZpbmVUYWcgbmFtZSwgc3VwciA9ICcnLCAmYm9keVxuXHRyZXR1cm4gSW1iYS5UQUdTLmRlZmluZVRhZyhuYW1lLHN1cHIsYm9keSlcblxuZGVmIEltYmEuZGVmaW5lU2luZ2xldG9uVGFnIGlkLCBzdXByID0gJ2RpdicsICZib2R5XG5cdHJldHVybiBJbWJhLlRBR1MuZGVmaW5lVGFnKG5hbWUsc3Vwcixib2R5KVxuXG5kZWYgSW1iYS5leHRlbmRUYWcgbmFtZSwgYm9keVxuXHRyZXR1cm4gSW1iYS5UQUdTLmV4dGVuZFRhZyhuYW1lLGJvZHkpXG5cbmRlZiBJbWJhLmdldFRhZ1NpbmdsZXRvbiBpZFx0XG5cdHZhciBkb20sIG5vZGVcblxuXHRpZiB2YXIga2xhc3MgPSBJbWJhLlNJTkdMRVRPTlNbaWRdXG5cdFx0cmV0dXJuIGtsYXNzLkluc3RhbmNlIGlmIGtsYXNzIGFuZCBrbGFzcy5JbnN0YW5jZSBcblxuXHRcdCMgbm8gaW5zdGFuY2UgLSBjaGVjayBmb3IgZWxlbWVudFxuXHRcdGlmIGRvbSA9IEltYmEuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXG5cdFx0XHQjIHdlIGhhdmUgYSBsaXZlIGluc3RhbmNlIC0gd2hlbiBmaW5kaW5nIGl0IHRocm91Z2ggYSBzZWxlY3RvciB3ZSBzaG91bGQgYXdha2UgaXQsIG5vP1xuXHRcdFx0IyBjb25zb2xlLmxvZygnY3JlYXRpbmcgdGhlIHNpbmdsZXRvbiBmcm9tIGV4aXN0aW5nIG5vZGUgaW4gZG9tPycsaWQsdHlwZSlcblx0XHRcdG5vZGUgPSBrbGFzcy5JbnN0YW5jZSA9IGtsYXNzLm5ldyhkb20pXG5cdFx0XHRub2RlLmF3YWtlbihkb20pICMgc2hvdWxkIG9ubHkgYXdha2VuXG5cdFx0XHRyZXR1cm4gbm9kZVxuXG5cdFx0ZG9tID0ga2xhc3MuY3JlYXRlTm9kZVxuXHRcdGRvbTppZCA9IGlkXG5cdFx0bm9kZSA9IGtsYXNzLkluc3RhbmNlID0ga2xhc3MubmV3KGRvbSlcblx0XHRub2RlLmVuZC5hd2FrZW4oZG9tKVxuXHRcdHJldHVybiBub2RlXG5cdGVsaWYgZG9tID0gSW1iYS5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcblx0XHRyZXR1cm4gSW1iYS5nZXRUYWdGb3JEb20oZG9tKVxuXG52YXIgc3ZnU3VwcG9ydCA9IHR5cGVvZiBTVkdFbGVtZW50ICE9PSAndW5kZWZpbmVkJ1xuXG4jIHNodW9sZCBiZSBwaGFzZWQgb3V0XG5kZWYgSW1iYS5nZXRUYWdGb3JEb20gZG9tXG5cdHJldHVybiBudWxsIHVubGVzcyBkb21cblx0cmV0dXJuIGRvbSBpZiBkb20uQGRvbSAjIGNvdWxkIHVzZSBpbmhlcml0YW5jZSBpbnN0ZWFkXG5cdHJldHVybiBkb20uQHRhZyBpZiBkb20uQHRhZ1xuXHRyZXR1cm4gbnVsbCB1bmxlc3MgZG9tOm5vZGVOYW1lXG5cblx0dmFyIG5hbWUgPSBkb206bm9kZU5hbWUudG9Mb3dlckNhc2Vcblx0dmFyIHR5cGUgPSBuYW1lXG5cdHZhciBucyA9IEltYmEuVEFHUyAjICBzdmdTdXBwb3J0IGFuZCBkb20gaXNhIFNWR0VsZW1lbnQgPyBJbWJhLlRBR1M6X1NWRyA6IEltYmEuVEFHU1xuXG5cdGlmIGRvbTppZCBhbmQgSW1iYS5TSU5HTEVUT05TW2RvbTppZF1cblx0XHRyZXR1cm4gSW1iYS5nZXRUYWdTaW5nbGV0b24oZG9tOmlkKVxuXHRcdFxuXHRpZiBzdmdTdXBwb3J0IGFuZCBkb20gaXNhIFNWR0VsZW1lbnRcblx0XHR0eXBlID0gbnMuZmluZFRhZ1R5cGUoXCJzdmc6XCIgKyBuYW1lKVxuXHRlbGlmIEltYmEuSFRNTF9UQUdTLmluZGV4T2YobmFtZSkgPj0gMFxuXHRcdHR5cGUgPSBucy5maW5kVGFnVHlwZShuYW1lKVxuXHRlbHNlXG5cdFx0dHlwZSA9IEltYmEuVGFnXG5cdCMgaWYgbnMuQG5vZGVOYW1lcy5pbmRleE9mKG5hbWUpID49IDBcblx0I1x0dHlwZSA9IG5zLmZpbmRUYWdUeXBlKG5hbWUpXG5cblx0cmV0dXJuIHR5cGUubmV3KGRvbSxudWxsKS5hd2FrZW4oZG9tKVxuXG4jIGRlcHJlY2F0ZVxuZGVmIEltYmEuZ2VuZXJhdGVDU1NQcmVmaXhlc1xuXHR2YXIgc3R5bGVzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQ6ZG9jdW1lbnRFbGVtZW50LCAnJylcblxuXHRmb3IgcHJlZml4ZWQgaW4gc3R5bGVzXG5cdFx0dmFyIHVucHJlZml4ZWQgPSBwcmVmaXhlZC5yZXBsYWNlKC9eLSh3ZWJraXR8bXN8bW96fG98YmxpbmspLS8sJycpXG5cdFx0dmFyIGNhbWVsQ2FzZSA9IHVucHJlZml4ZWQucmVwbGFjZSgvLShcXHcpL2cpIGRvIHxtLGF8IGEudG9VcHBlckNhc2VcblxuXHRcdCMgaWYgdGhlcmUgZXhpc3RzIGFuIHVucHJlZml4ZWQgdmVyc2lvbiAtLSBhbHdheXMgdXNlIHRoaXNcblx0XHRpZiBwcmVmaXhlZCAhPSB1bnByZWZpeGVkXG5cdFx0XHRjb250aW51ZSBpZiBzdHlsZXMuaGFzT3duUHJvcGVydHkodW5wcmVmaXhlZClcblxuXHRcdCMgcmVnaXN0ZXIgdGhlIHByZWZpeGVzXG5cdFx0SW1iYS5DU1NLZXlNYXBbdW5wcmVmaXhlZF0gPSBJbWJhLkNTU0tleU1hcFtjYW1lbENhc2VdID0gcHJlZml4ZWRcblx0cmV0dXJuXG5cbmlmICR3ZWIkXG5cdEltYmEuZ2VuZXJhdGVDU1NQcmVmaXhlcyBpZiBkb2N1bWVudFxuXG5cdCMgT3Z2ZXJyaWRlIGNsYXNzTGlzdFxuXHRpZiBkb2N1bWVudCBhbmQgIWRvY3VtZW50OmRvY3VtZW50RWxlbWVudDpjbGFzc0xpc3Rcblx0XHRleHRlbmQgdGFnIGVsZW1lbnRcblxuXHRcdFx0ZGVmIGhhc0ZsYWcgcmVmXG5cdFx0XHRcdHJldHVybiBSZWdFeHAubmV3KCcoXnxcXFxccyknICsgcmVmICsgJyhcXFxcc3wkKScpLnRlc3QoQGRvbTpjbGFzc05hbWUpXG5cblx0XHRcdGRlZiBhZGRGbGFnIHJlZlxuXHRcdFx0XHRyZXR1cm4gc2VsZiBpZiBoYXNGbGFnKHJlZilcblx0XHRcdFx0QGRvbTpjbGFzc05hbWUgKz0gKEBkb206Y2xhc3NOYW1lID8gJyAnIDogJycpICsgcmVmXG5cdFx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRcdGRlZiB1bmZsYWcgcmVmXG5cdFx0XHRcdHJldHVybiBzZWxmIHVubGVzcyBoYXNGbGFnKHJlZilcblx0XHRcdFx0dmFyIHJlZ2V4ID0gUmVnRXhwLm5ldygnKF58XFxcXHMpKicgKyByZWYgKyAnKFxcXFxzfCQpKicsICdnJylcblx0XHRcdFx0QGRvbTpjbGFzc05hbWUgPSBAZG9tOmNsYXNzTmFtZS5yZXBsYWNlKHJlZ2V4LCAnJylcblx0XHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdFx0ZGVmIHRvZ2dsZUZsYWcgcmVmXG5cdFx0XHRcdGhhc0ZsYWcocmVmKSA/IHVuZmxhZyhyZWYpIDogZmxhZyhyZWYpXG5cblx0XHRcdGRlZiBmbGFnIHJlZiwgYm9vbFxuXHRcdFx0XHRpZiBhcmd1bWVudHM6bGVuZ3RoID09IDIgYW5kICEhYm9vbCA9PT0gbm9cblx0XHRcdFx0XHRyZXR1cm4gdW5mbGFnKHJlZilcblx0XHRcdFx0cmV0dXJuIGFkZEZsYWcocmVmKVxuXG5JbWJhLlRhZ1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL3RhZy5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG4jIHByZWRlZmluZSBhbGwgc3VwcG9ydGVkIGh0bWwgdGFnc1xudGFnIGZyYWdtZW50IDwgZWxlbWVudFxuXG5cdGRlZiBzZWxmLmNyZWF0ZU5vZGVcblx0XHRJbWJhLmRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnRcblxuZXh0ZW5kIHRhZyBodG1sXG5cdGRlZiBwYXJlbnRcblx0XHRudWxsXG5cblxuZXh0ZW5kIHRhZyBjYW52YXNcblx0ZGVmIGNvbnRleHQgdHlwZSA9ICcyZCdcblx0XHRkb20uZ2V0Q29udGV4dCh0eXBlKVxuXG5jbGFzcyBEYXRhVmFsdWVcblx0XG5cdGRlZiBpbml0aWFsaXplIG5vZGUsIHBhdGgsIG1vZHNcblx0XHRAbm9kZSA9IG5vZGVcblx0XHRAcGF0aCA9IHBhdGhcblx0XHRAbW9kcyA9IG1vZHMgb3Ige31cblx0XHRAc2V0dGVyID0gSW1iYS50b1NldHRlcihAcGF0aClcblx0XHRsZXQgdmFsdWVGbiA9IG5vZGU6dmFsdWVcblx0XHRub2RlOnZhbHVlID0gZG8gbW9kKHZhbHVlRm4uY2FsbCh0aGlzKSlcblx0XG5cdGRlZiBjb250ZXh0XG5cdFx0cmV0dXJuIEBjb250ZXh0IGlmIEBjb250ZXh0XG5cdFx0IyBjYWNoaW5nIGNhbiBsZWFkIHRvIHdlaXJkIGJlaGF2aW91clxuXHRcdGxldCBlbCA9IEBub2RlXG5cdFx0d2hpbGUgZWxcblx0XHRcdGlmIGVsLmRhdGFcblx0XHRcdFx0QGNvbnRleHQgPSBlbFxuXHRcdFx0XHRicmVha1xuXHRcdFx0ZWwgPSBlbC5Ab3duZXJfXG5cdFx0cmV0dXJuIEBjb250ZXh0XG5cdFx0XG5cdGRlZiBkYXRhXG5cdFx0dmFyIGN0eCA9IGNvbnRleHRcblx0XHRjdHggPyBjdHguZGF0YSA6IG51bGxcblx0XHRcblx0ZGVmIGxhenlcblx0XHRAbW9kczpsYXp5XG5cdFx0XG5cdGRlZiBnZXRcblx0XHRsZXQgZGF0YSA9IHNlbGYuZGF0YVxuXHRcdHJldHVybiBudWxsIHVubGVzcyBkYXRhXG5cdFx0bGV0IHZhbCA9IGRhdGFbQHBhdGhdXG5cdFx0cmV0dXJuIHZhbCBpc2EgRnVuY3Rpb24gYW5kIGRhdGFbQHNldHRlcl0gPyBkYXRhW0BwYXRoXSgpIDogdmFsXG5cdFx0XG5cdGRlZiBzZXQgdmFsdWVcblx0XHRsZXQgZGF0YSA9IHNlbGYuZGF0YVxuXHRcdHJldHVybiB1bmxlc3MgZGF0YVxuXG5cdFx0bGV0IHByZXYgPSBkYXRhW0BwYXRoXVxuXHRcdGlmIHByZXYgaXNhIEZ1bmN0aW9uXG5cdFx0XHRpZiBkYXRhW0BzZXR0ZXJdIGlzYSBGdW5jdGlvblxuXHRcdFx0XHRkYXRhW0BzZXR0ZXJdKHZhbHVlKVxuXHRcdFx0XHRyZXR1cm4gc2VsZlxuXHRcdGRhdGFbQHBhdGhdID0gdmFsdWVcblx0XHRcblx0ZGVmIGlzQXJyYXkgdmFsID0gZ2V0XG5cdFx0dmFsIGFuZCB2YWw6c3BsaWNlIGFuZCB2YWw6c29ydFxuXHRcblx0ZGVmIG1vZCB2YWx1ZVxuXHRcdGlmIHZhbHVlIGlzYSBBcnJheVxuXHRcdFx0cmV0dXJuIHZhbHVlLm1hcCBkbyBtb2QoJDEpXG5cdFx0aWYgQG1vZHM6dHJpbSBhbmQgdmFsdWUgaXNhIFN0cmluZ1xuXHRcdFx0dmFsdWUgPSB2YWx1ZS50cmltXG5cdFx0aWYgQG1vZHM6bnVtYmVyXG5cdFx0XHR2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUpXG5cdFx0cmV0dXJuIHZhbHVlXG5cbmV4dGVuZCB0YWcgaW5wdXRcblx0ZGVmIG1vZGVsXG5cdFx0QG1vZGVsXG5cdFxuXHRkZWYgc2V0TW9kZWwgdmFsdWUsIG1vZHNcblx0XHRAbW9kZWwgfHw9IERhdGFWYWx1ZS5uZXcoc2VsZix2YWx1ZSxtb2RzKVxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIHNldFZhbHVlIHZhbHVlXG5cdFx0ZG9tOnZhbHVlID0gQHZhbHVlID0gdmFsdWVcblx0XHRzZWxmXG5cblx0ZGVmIG9uaW5wdXQgZVxuXHRcdGxldCB2YWwgPSBAZG9tOnZhbHVlXG5cdFx0QGxvY2FsVmFsdWUgPSBAaW5pdGlhbFZhbHVlICE9IHZhbCA/IHZhbCA6IHVuZGVmaW5lZFxuXHRcdG1vZGVsIGFuZCAhbW9kZWwubGF6eSA/IG1vZGVsLnNldCh2YWx1ZSkgOiBlLnNpbGVuY2VcdFx0XG5cdFx0XG5cdGRlZiBvbmNoYW5nZSBlXG5cdFx0QG1vZGVsVmFsdWUgPSBAbG9jYWxWYWx1ZSA9IHVuZGVmaW5lZFxuXHRcdHJldHVybiBlLnNpbGVuY2UgdW5sZXNzIG1vZGVsXG5cdFx0XG5cdFx0aWYgdHlwZSA9PSAncmFkaW8nIG9yIHR5cGUgPT0gJ2NoZWNrYm94J1xuXHRcdFx0bGV0IGNoZWNrZWQgPSBAZG9tOmNoZWNrZWRcblx0XHRcdGxldCBtdmFsID0gbW9kZWwuZ2V0XG5cdFx0XHRsZXQgZHZhbCA9IEB2YWx1ZSAhPSB1bmRlZmluZWQgPyBAdmFsdWUgOiB2YWx1ZVxuXHRcdFx0IyBjb25zb2xlLmxvZyBcImNoYW5nZVwiLHR5cGUsY2hlY2tlZCxkdmFsXG5cblx0XHRcdGlmIHR5cGUgPT0gJ3JhZGlvJ1xuXHRcdFx0XHRtb2RlbC5zZXQoZHZhbCx0cnVlKVxuXHRcdFx0ZWxpZiBkb206dmFsdWUgPT0gJ29uJ1xuXHRcdFx0XHRtb2RlbC5zZXQoISFjaGVja2VkLHRydWUpXG5cdFx0XHRlbGlmIG1vZGVsLmlzQXJyYXlcblx0XHRcdFx0bGV0IGlkeCA9IG12YWwuaW5kZXhPZihkdmFsKVxuXHRcdFx0XHRpZiBjaGVja2VkIGFuZCBpZHggPT0gLTFcblx0XHRcdFx0XHRtdmFsLnB1c2goZHZhbClcblx0XHRcdFx0ZWxpZiAhY2hlY2tlZCBhbmQgaWR4ID49IDBcblx0XHRcdFx0XHRtdmFsLnNwbGljZShpZHgsMSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0bW9kZWwuc2V0KGR2YWwpXG5cdFx0ZWxzZVxuXHRcdFx0bW9kZWwuc2V0KHZhbHVlKVxuXHRcblx0IyBvdmVycmlkaW5nIGVuZCBkaXJlY3RseSBmb3IgcGVyZm9ybWFuY2Vcblx0ZGVmIGVuZFxuXHRcdHJldHVybiBzZWxmIGlmICFAbW9kZWwgb3IgQGxvY2FsVmFsdWUgIT09IHVuZGVmaW5lZFxuXHRcdGxldCBtdmFsID0gQG1vZGVsLmdldFxuXHRcdHJldHVybiBzZWxmIGlmIG12YWwgPT0gQG1vZGVsVmFsdWVcblx0XHRAbW9kZWxWYWx1ZSA9IG12YWwgdW5sZXNzIG1vZGVsLmlzQXJyYXlcblxuXHRcdGlmIHR5cGUgPT0gJ3JhZGlvJyBvciB0eXBlID09ICdjaGVja2JveCdcblx0XHRcdGxldCBkdmFsID0gQHZhbHVlXG5cdFx0XHRsZXQgY2hlY2tlZCA9IGlmIG1vZGVsLmlzQXJyYXlcblx0XHRcdFx0bXZhbC5pbmRleE9mKGR2YWwpID49IDBcblx0XHRcdGVsaWYgZG9tOnZhbHVlID09ICdvbidcblx0XHRcdFx0ISFtdmFsXG5cdFx0XHRlbHNlXG5cdFx0XHRcdG12YWwgPT0gQHZhbHVlXG5cblx0XHRcdEBkb206Y2hlY2tlZCA9IGNoZWNrZWRcblx0XHRlbHNlXG5cdFx0XHRAZG9tOnZhbHVlID0gbXZhbFxuXHRcdFx0QGluaXRpYWxWYWx1ZSA9IEBkb206dmFsdWVcblx0XHRzZWxmXG5cbmV4dGVuZCB0YWcgdGV4dGFyZWFcblx0ZGVmIG1vZGVsXG5cdFx0QG1vZGVsXG5cblx0ZGVmIHNldE1vZGVsIHZhbHVlLCBtb2RzXG5cdFx0QG1vZGVsIHx8PSBEYXRhVmFsdWUubmV3KHNlbGYsdmFsdWUsbW9kcylcblx0XHRyZXR1cm4gc2VsZlxuXHRcblx0ZGVmIHNldFZhbHVlIHZhbHVlXG5cdFx0ZG9tOnZhbHVlID0gdmFsdWUgaWYgQGxvY2FsVmFsdWUgPT0gdW5kZWZpbmVkXG5cdFx0cmV0dXJuIHNlbGZcblx0XG5cdGRlZiBvbmlucHV0IGVcblx0XHRsZXQgdmFsID0gQGRvbTp2YWx1ZVxuXHRcdEBsb2NhbFZhbHVlID0gQGluaXRpYWxWYWx1ZSAhPSB2YWwgPyB2YWwgOiB1bmRlZmluZWRcblx0XHRtb2RlbCBhbmQgIW1vZGVsLmxhenkgPyBtb2RlbC5zZXQodmFsdWUpIDogZS5zaWxlbmNlXG5cblx0ZGVmIG9uY2hhbmdlIGVcblx0XHRAbG9jYWxWYWx1ZSA9IHVuZGVmaW5lZFxuXHRcdG1vZGVsID8gbW9kZWwuc2V0KHZhbHVlKSA6IGUuc2lsZW5jZVxuXHRcdFxuXHRkZWYgcmVuZGVyXG5cdFx0cmV0dXJuIGlmIEBsb2NhbFZhbHVlICE9IHVuZGVmaW5lZCBvciAhbW9kZWxcblx0XHRpZiBtb2RlbFxuXHRcdFx0QGRvbTp2YWx1ZSA9IG1vZGVsLmdldFxuXHRcdEBpbml0aWFsVmFsdWUgPSBAZG9tOnZhbHVlXG5cdFx0c2VsZlxuXG5leHRlbmQgdGFnIG9wdGlvblxuXHRkZWYgc2V0VmFsdWUgdmFsdWVcblx0XHRpZiB2YWx1ZSAhPSBAdmFsdWVcblx0XHRcdGRvbTp2YWx1ZSA9IEB2YWx1ZSA9IHZhbHVlXG5cdFx0c2VsZlxuXG5cdGRlZiB2YWx1ZVxuXHRcdEB2YWx1ZSBvciBkb206dmFsdWVcblxuZXh0ZW5kIHRhZyBzZWxlY3Rcblx0ZGVmIG1vZGVsXG5cdFx0QG1vZGVsXG5cblx0ZGVmIHNldE1vZGVsIHZhbHVlLCBtb2RzXG5cdFx0QG1vZGVsIHx8PSBEYXRhVmFsdWUubmV3KHNlbGYsdmFsdWUsbW9kcylcblx0XHRyZXR1cm4gc2VsZlxuXHRcdFxuXHRkZWYgc2V0VmFsdWUgdmFsdWVcblx0XHRpZiB2YWx1ZSAhPSBAdmFsdWVcblx0XHRcdEB2YWx1ZSA9IHZhbHVlXG5cdFx0XHRpZiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCdcblx0XHRcdFx0Zm9yIG9wdCxpIGluIGRvbTpvcHRpb25zXG5cdFx0XHRcdFx0bGV0IG92YWwgPSAob3B0LkB0YWcgPyBvcHQuQHRhZy52YWx1ZSA6IG9wdDp2YWx1ZSlcblx0XHRcdFx0XHRpZiB2YWx1ZSA9PSBvdmFsXG5cdFx0XHRcdFx0XHRkb206c2VsZWN0ZWRJbmRleCA9IGlcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGRvbTp2YWx1ZSA9IHZhbHVlXG5cdFx0cmV0dXJuIHNlbGZcblx0XHRcblx0ZGVmIHZhbHVlXG5cdFx0aWYgbXVsdGlwbGVcblx0XHRcdGZvciBvcHRpb24gaW4gZG9tOnNlbGVjdGVkT3B0aW9uc1xuXHRcdFx0XHRvcHRpb24uQHRhZyA/IG9wdGlvbi5AdGFnLnZhbHVlIDogb3B0aW9uOnZhbHVlXG5cdFx0ZWxzZVxuXHRcdFx0bGV0IG9wdCA9IGRvbTpzZWxlY3RlZE9wdGlvbnNbMF1cblx0XHRcdG9wdCA/IChvcHQuQHRhZyA/IG9wdC5AdGFnLnZhbHVlIDogb3B0OnZhbHVlKSA6IG51bGxcblx0XG5cdGRlZiBvbmNoYW5nZSBlXG5cdFx0bW9kZWwgPyBtb2RlbC5zZXQodmFsdWUpIDogZS5zaWxlbmNlXG5cdFx0XG5cdGRlZiByZW5kZXJcblx0XHRyZXR1cm4gdW5sZXNzIG1vZGVsXG5cblx0XHRsZXQgbXZhbCA9IG1vZGVsLmdldFxuXHRcdCMgc3luYyBkb20gdmFsdWVcblx0XHRpZiBtdWx0aXBsZVxuXHRcdFx0Zm9yIG9wdGlvbiBpbiBkb206b3B0aW9uc1xuXHRcdFx0XHRsZXQgb3ZhbCA9IG1vZGVsLm1vZChvcHRpb24uQHRhZyA/IG9wdGlvbi5AdGFnLnZhbHVlIDogb3B0aW9uOnZhbHVlKVxuXHRcdFx0XHRsZXQgc2VsID0gbXZhbC5pbmRleE9mKG92YWwpID49IDBcblx0XHRcdFx0b3B0aW9uOnNlbGVjdGVkID0gc2VsXG5cdFx0ZWxzZVxuXHRcdFx0c2V0VmFsdWUobXZhbClcblx0XHRcdCMgd2hhdCBpZiBtdmFsIGlzIHJpY2g/IFdvdWxkIGJlIG5pY2Ugd2l0aCBzb21lIG1hcHBpbmdcblx0XHRcdCMgZG9tOnZhbHVlID0gbXZhbFxuXHRcdHNlbGZcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vaHRtbC5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG4jIEltYmEuVG91Y2hcbiMgQmVnYW5cdEEgZmluZ2VyIHRvdWNoZWQgdGhlIHNjcmVlbi5cbiMgTW92ZWRcdEEgZmluZ2VyIG1vdmVkIG9uIHRoZSBzY3JlZW4uXG4jIFN0YXRpb25hcnlcdEEgZmluZ2VyIGlzIHRvdWNoaW5nIHRoZSBzY3JlZW4gYnV0IGhhc24ndCBtb3ZlZC5cbiMgRW5kZWRcdEEgZmluZ2VyIHdhcyBsaWZ0ZWQgZnJvbSB0aGUgc2NyZWVuLiBUaGlzIGlzIHRoZSBmaW5hbCBwaGFzZSBvZiBhIHRvdWNoLlxuIyBDYW5jZWxlZCBUaGUgc3lzdGVtIGNhbmNlbGxlZCB0cmFja2luZyBmb3IgdGhlIHRvdWNoLlxuXG4jIyNcbkNvbnNvbGlkYXRlcyBtb3VzZSBhbmQgdG91Y2ggZXZlbnRzLiBUb3VjaCBvYmplY3RzIHBlcnNpc3QgYWNyb3NzIGEgdG91Y2gsXG5mcm9tIHRvdWNoc3RhcnQgdW50aWwgZW5kL2NhbmNlbC4gV2hlbiBhIHRvdWNoIHN0YXJ0cywgaXQgd2lsbCB0cmF2ZXJzZVxuZG93biBmcm9tIHRoZSBpbm5lcm1vc3QgdGFyZ2V0LCB1bnRpbCBpdCBmaW5kcyBhIG5vZGUgdGhhdCByZXNwb25kcyB0b1xub250b3VjaHN0YXJ0LiBVbmxlc3MgdGhlIHRvdWNoIGlzIGV4cGxpY2l0bHkgcmVkaXJlY3RlZCwgdGhlIHRvdWNoIHdpbGxcbmNhbGwgb250b3VjaG1vdmUgYW5kIG9udG91Y2hlbmQgLyBvbnRvdWNoY2FuY2VsIG9uIHRoZSByZXNwb25kZXIgd2hlbiBhcHByb3ByaWF0ZS5cblxuXHR0YWcgZHJhZ2dhYmxlXG5cdFx0IyBjYWxsZWQgd2hlbiBhIHRvdWNoIHN0YXJ0c1xuXHRcdGRlZiBvbnRvdWNoc3RhcnQgdG91Y2hcblx0XHRcdGZsYWcgJ2RyYWdnaW5nJ1xuXHRcdFx0c2VsZlxuXHRcdFxuXHRcdCMgY2FsbGVkIHdoZW4gdG91Y2ggbW92ZXMgLSBzYW1lIHRvdWNoIG9iamVjdFxuXHRcdGRlZiBvbnRvdWNobW92ZSB0b3VjaFxuXHRcdFx0IyBtb3ZlIHRoZSBub2RlIHdpdGggdG91Y2hcblx0XHRcdGNzcyB0b3A6IHRvdWNoLmR5LCBsZWZ0OiB0b3VjaC5keFxuXHRcdFxuXHRcdCMgY2FsbGVkIHdoZW4gdG91Y2ggZW5kc1xuXHRcdGRlZiBvbnRvdWNoZW5kIHRvdWNoXG5cdFx0XHR1bmZsYWcgJ2RyYWdnaW5nJ1xuXG5AaW5hbWUgdG91Y2hcbiMjI1xuY2xhc3MgSW1iYS5Ub3VjaFxuXHRzZWxmLkxhc3RUaW1lc3RhbXAgPSAwXG5cdHNlbGYuVGFwVGltZW91dCA9IDUwXG5cblx0IyB2YXIgbGFzdE5hdGl2ZVRvdWNoVGltZW91dCA9IDUwXG5cblx0dmFyIHRvdWNoZXMgPSBbXVxuXHR2YXIgY291bnQgPSAwXG5cdHZhciBpZGVudGlmaWVycyA9IHt9XG5cblx0ZGVmIHNlbGYuY291bnRcblx0XHRjb3VudFxuXG5cdGRlZiBzZWxmLmxvb2t1cCBpdGVtXG5cdFx0cmV0dXJuIGl0ZW0gYW5kIChpdGVtOl9fdG91Y2hfXyBvciBpZGVudGlmaWVyc1tpdGVtOmlkZW50aWZpZXJdKVxuXG5cdGRlZiBzZWxmLnJlbGVhc2UgaXRlbSx0b3VjaFxuXHRcdGRlbGV0ZSBpZGVudGlmaWVyc1tpdGVtOmlkZW50aWZpZXJdXG5cdFx0ZGVsZXRlIGl0ZW06X190b3VjaF9fXG5cdFx0cmV0dXJuXG5cblx0ZGVmIHNlbGYub250b3VjaHN0YXJ0IGVcblx0XHRmb3IgdCBpbiBlOmNoYW5nZWRUb3VjaGVzXG5cdFx0XHRjb250aW51ZSBpZiBsb29rdXAodClcblx0XHRcdHZhciB0b3VjaCA9IGlkZW50aWZpZXJzW3Q6aWRlbnRpZmllcl0gPSBzZWxmLm5ldyhlKSAjIChlKVxuXHRcdFx0dDpfX3RvdWNoX18gPSB0b3VjaFxuXHRcdFx0dG91Y2hlcy5wdXNoKHRvdWNoKVxuXHRcdFx0Y291bnQrK1xuXHRcdFx0dG91Y2gudG91Y2hzdGFydChlLHQpXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9udG91Y2htb3ZlIGVcblx0XHRmb3IgdCBpbiBlOmNoYW5nZWRUb3VjaGVzXG5cdFx0XHRpZiB2YXIgdG91Y2ggPSBsb29rdXAodClcblx0XHRcdFx0dG91Y2gudG91Y2htb3ZlKGUsdClcblxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5vbnRvdWNoZW5kIGVcblx0XHRmb3IgdCBpbiBlOmNoYW5nZWRUb3VjaGVzXG5cdFx0XHRpZiB2YXIgdG91Y2ggPSBsb29rdXAodClcblx0XHRcdFx0dG91Y2gudG91Y2hlbmQoZSx0KVxuXHRcdFx0XHRyZWxlYXNlKHQsdG91Y2gpXG5cdFx0XHRcdGNvdW50LS1cblxuXHRcdCMgZS5wcmV2ZW50RGVmYXVsdFxuXHRcdCMgbm90IGFsd2F5cyBzdXBwb3J0ZWQhXG5cdFx0IyB0b3VjaGVzID0gdG91Y2hlcy5maWx0ZXIofHwpXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9udG91Y2hjYW5jZWwgZVxuXHRcdGZvciB0IGluIGU6Y2hhbmdlZFRvdWNoZXNcblx0XHRcdGlmIHZhciB0b3VjaCA9IGxvb2t1cCh0KVxuXHRcdFx0XHR0b3VjaC50b3VjaGNhbmNlbChlLHQpXG5cdFx0XHRcdHJlbGVhc2UodCx0b3VjaClcblx0XHRcdFx0Y291bnQtLVxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5vbm1vdXNlZG93biBlXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9ubW91c2Vtb3ZlIGVcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub25tb3VzZXVwIGVcblx0XHRzZWxmXG5cblxuXHRwcm9wIHBoYXNlXG5cdHByb3AgYWN0aXZlXG5cdHByb3AgZXZlbnRcblx0cHJvcCBwb2ludGVyXG5cdHByb3AgdGFyZ2V0XG5cdHByb3AgaGFuZGxlclxuXHRwcm9wIHVwZGF0ZXNcblx0cHJvcCBzdXBwcmVzc1xuXHRwcm9wIGRhdGFcblx0cHJvcCBidWJibGUgY2hhaW5hYmxlOiB5ZXNcblx0cHJvcCB0aW1lc3RhbXBcblxuXHRwcm9wIGdlc3R1cmVzXG5cblx0IyMjXG5cdEBpbnRlcm5hbFxuXHRAY29uc3RydWN0b3Jcblx0IyMjXG5cdGRlZiBpbml0aWFsaXplIGV2ZW50LCBwb2ludGVyXG5cdFx0IyBAbmF0aXZlICA9IGZhbHNlXG5cdFx0c2VsZi5ldmVudCA9IGV2ZW50XG5cdFx0ZGF0YSA9IHt9XG5cdFx0YWN0aXZlID0geWVzXG5cdFx0QGJ1dHRvbiA9IGV2ZW50IGFuZCBldmVudDpidXR0b24gb3IgMFxuXHRcdEBzdXBwcmVzcyA9IG5vICMgZGVwcmVjYXRlZFxuXHRcdEBjYXB0dXJlZCA9IG5vXG5cdFx0YnViYmxlID0gbm9cblx0XHRwb2ludGVyID0gcG9pbnRlclxuXHRcdHVwZGF0ZXMgPSAwXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgY2FwdHVyZVxuXHRcdEBjYXB0dXJlZCA9IHllc1xuXHRcdEBldmVudCBhbmQgQGV2ZW50LnN0b3BQcm9wYWdhdGlvblxuXHRcdHVubGVzcyBAc2VsYmxvY2tlclxuXHRcdFx0QHNlbGJsb2NrZXIgPSBkbyB8ZXwgZS5wcmV2ZW50RGVmYXVsdFxuXHRcdFx0SW1iYS5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3RzdGFydCcsQHNlbGJsb2NrZXIseWVzKVxuXHRcdHNlbGZcblxuXHRkZWYgaXNDYXB0dXJlZFxuXHRcdCEhQGNhcHR1cmVkXG5cblx0IyMjXG5cdEV4dGVuZCB0aGUgdG91Y2ggd2l0aCBhIHBsdWdpbiAvIGdlc3R1cmUuIFxuXHRBbGwgZXZlbnRzICh0b3VjaHN0YXJ0LG1vdmUgZXRjKSBmb3IgdGhlIHRvdWNoXG5cdHdpbGwgYmUgdHJpZ2dlcmVkIG9uIHRoZSBwbHVnaW5zIGluIHRoZSBvcmRlciB0aGV5XG5cdGFyZSBhZGRlZC5cblx0IyMjXG5cdGRlZiBleHRlbmQgcGx1Z2luXG5cdFx0IyBjb25zb2xlLmxvZyBcImFkZGVkIGdlc3R1cmUhISFcIlxuXHRcdEBnZXN0dXJlcyB8fD0gW11cblx0XHRAZ2VzdHVyZXMucHVzaChwbHVnaW4pXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRSZWRpcmVjdCB0b3VjaCB0byBzcGVjaWZpZWQgdGFyZ2V0LiBvbnRvdWNoc3RhcnQgd2lsbCBhbHdheXMgYmVcblx0Y2FsbGVkIG9uIHRoZSBuZXcgdGFyZ2V0LlxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgcmVkaXJlY3QgdGFyZ2V0XG5cdFx0QHJlZGlyZWN0ID0gdGFyZ2V0XG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTdXBwcmVzcyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIuIFdpbGwgY2FsbCBwcmV2ZW50RGVmYXVsdCBmb3Jcblx0YWxsIG5hdGl2ZSBldmVudHMgdGhhdCBhcmUgcGFydCBvZiB0aGUgdG91Y2guXG5cdCMjI1xuXHRkZWYgc3VwcHJlc3Ncblx0XHQjIGNvbGxpc2lvbiB3aXRoIHRoZSBzdXBwcmVzcyBwcm9wZXJ0eVxuXHRcdEBhY3RpdmUgPSBub1xuXHRcdFxuXHRcdHNlbGZcblxuXHRkZWYgc3VwcHJlc3M9IHZhbHVlXG5cdFx0Y29uc29sZS53YXJuICdJbWJhLlRvdWNoI3N1cHByZXNzPSBpcyBkZXByZWNhdGVkJ1xuXHRcdEBzdXByZXNzID0gdmFsdWVcblx0XHRzZWxmXG5cblx0ZGVmIHRvdWNoc3RhcnQgZSx0XG5cdFx0QGV2ZW50ID0gZVxuXHRcdEB0b3VjaCA9IHRcblx0XHRAYnV0dG9uID0gMFxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRiZWdhblxuXHRcdHVwZGF0ZVxuXHRcdGUucHJldmVudERlZmF1bHQgaWYgZSBhbmQgaXNDYXB0dXJlZFxuXHRcdHNlbGZcblxuXHRkZWYgdG91Y2htb3ZlIGUsdFxuXHRcdEBldmVudCA9IGVcblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0dXBkYXRlXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCBpZiBlIGFuZCBpc0NhcHR1cmVkXG5cdFx0c2VsZlxuXG5cdGRlZiB0b3VjaGVuZCBlLHRcblx0XHRAZXZlbnQgPSBlXG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdGVuZGVkXG5cblx0XHRJbWJhLlRvdWNoLkxhc3RUaW1lc3RhbXAgPSBlOnRpbWVTdGFtcFxuXG5cdFx0aWYgQG1heGRyIDwgMjBcblx0XHRcdHZhciB0YXAgPSBJbWJhLkV2ZW50Lm5ldyhlKVxuXHRcdFx0dGFwLnR5cGUgPSAndGFwJ1xuXHRcdFx0dGFwLnByb2Nlc3Ncblx0XHRcdGUucHJldmVudERlZmF1bHQgaWYgdGFwLkByZXNwb25kZXJcdFxuXG5cdFx0aWYgZSBhbmQgaXNDYXB0dXJlZFxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdFxuXG5cdFx0c2VsZlxuXG5cdGRlZiB0b3VjaGNhbmNlbCBlLHRcblx0XHRjYW5jZWxcblxuXHRkZWYgbW91c2Vkb3duIGUsdFxuXHRcdEBldmVudCA9IGVcblx0XHRAYnV0dG9uID0gZTpidXR0b25cblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0YmVnYW5cblx0XHR1cGRhdGVcblx0XHRAbW91c2Vtb3ZlID0gKHxlfCBtb3VzZW1vdmUoZSxlKSApXG5cdFx0SW1iYS5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLEBtb3VzZW1vdmUseWVzKVxuXHRcdHNlbGZcblxuXHRkZWYgbW91c2Vtb3ZlIGUsdFxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRAZXZlbnQgPSBlXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCBpZiBpc0NhcHR1cmVkXG5cdFx0dXBkYXRlXG5cdFx0bW92ZVxuXHRcdHNlbGZcblxuXHRkZWYgbW91c2V1cCBlLHRcblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0ZW5kZWRcblx0XHRzZWxmXG5cblx0ZGVmIGlkbGVcblx0XHR1cGRhdGVcblxuXHRkZWYgYmVnYW5cblx0XHRAdGltZXN0YW1wID0gRGF0ZS5ub3dcblx0XHRAbWF4ZHIgPSBAZHIgPSAwXG5cdFx0QHgwID0gQHhcblx0XHRAeTAgPSBAeVxuXG5cdFx0dmFyIGRvbSA9IGV2ZW50OnRhcmdldFxuXHRcdHZhciBub2RlID0gbnVsbFxuXG5cdFx0QHNvdXJjZVRhcmdldCA9IGRvbSBhbmQgdGFnKGRvbSlcblxuXHRcdHdoaWxlIGRvbVxuXHRcdFx0bm9kZSA9IHRhZyhkb20pXG5cdFx0XHRpZiBub2RlICYmIG5vZGU6b250b3VjaHN0YXJ0XG5cdFx0XHRcdEBidWJibGUgPSBub1xuXHRcdFx0XHR0YXJnZXQgPSBub2RlXG5cdFx0XHRcdHRhcmdldC5vbnRvdWNoc3RhcnQoc2VsZilcblx0XHRcdFx0YnJlYWsgdW5sZXNzIEBidWJibGVcblx0XHRcdGRvbSA9IGRvbTpwYXJlbnROb2RlXG5cblx0XHRAdXBkYXRlcysrXG5cdFx0c2VsZlxuXG5cdGRlZiB1cGRhdGVcblx0XHRyZXR1cm4gc2VsZiBpZiAhQGFjdGl2ZSBvciBAY2FuY2VsbGVkXG5cblx0XHR2YXIgZHIgPSBNYXRoLnNxcnQoZHgqZHggKyBkeSpkeSlcblx0XHRAbWF4ZHIgPSBkciBpZiBkciA+IEBkclxuXHRcdEBkciA9IGRyXG5cblx0XHQjIGNhdGNoaW5nIGEgdG91Y2gtcmVkaXJlY3Q/IT9cblx0XHRpZiBAcmVkaXJlY3Rcblx0XHRcdGlmIEB0YXJnZXQgYW5kIEB0YXJnZXQ6b250b3VjaGNhbmNlbFxuXHRcdFx0XHRAdGFyZ2V0Lm9udG91Y2hjYW5jZWwoc2VsZilcblx0XHRcdHRhcmdldCA9IEByZWRpcmVjdFxuXHRcdFx0QHJlZGlyZWN0ID0gbnVsbFxuXHRcdFx0dGFyZ2V0Lm9udG91Y2hzdGFydChzZWxmKSBpZiB0YXJnZXQ6b250b3VjaHN0YXJ0XG5cdFx0XHRyZXR1cm4gdXBkYXRlIGlmIEByZWRpcmVjdCAjIHBvc3NpYmx5IHJlZGlyZWN0aW5nIGFnYWluXG5cblxuXHRcdEB1cGRhdGVzKytcblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGcub250b3VjaHVwZGF0ZShzZWxmKSBmb3IgZyBpbiBAZ2VzdHVyZXNcblxuXHRcdHRhcmdldD8ub250b3VjaHVwZGF0ZShzZWxmKVxuXHRcdHVwZGF0ZSBpZiBAcmVkaXJlY3Rcblx0XHRzZWxmXG5cblx0ZGVmIG1vdmVcblx0XHRyZXR1cm4gc2VsZiBpZiAhQGFjdGl2ZSBvciBAY2FuY2VsbGVkXG5cblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGZvciBnIGluIEBnZXN0dXJlc1xuXHRcdFx0XHRnLm9udG91Y2htb3ZlKHNlbGYsQGV2ZW50KSBpZiBnOm9udG91Y2htb3ZlXG5cblx0XHR0YXJnZXQ/Lm9udG91Y2htb3ZlKHNlbGYsQGV2ZW50KVxuXHRcdHNlbGZcblxuXHRkZWYgZW5kZWRcblx0XHRyZXR1cm4gc2VsZiBpZiAhQGFjdGl2ZSBvciBAY2FuY2VsbGVkXG5cblx0XHRAdXBkYXRlcysrXG5cblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGcub250b3VjaGVuZChzZWxmKSBmb3IgZyBpbiBAZ2VzdHVyZXNcblxuXHRcdHRhcmdldD8ub250b3VjaGVuZChzZWxmKVxuXHRcdGNsZWFudXBfXG5cdFx0c2VsZlxuXG5cdGRlZiBjYW5jZWxcblx0XHR1bmxlc3MgQGNhbmNlbGxlZFxuXHRcdFx0QGNhbmNlbGxlZCA9IHllc1xuXHRcdFx0Y2FuY2VsbGVkXG5cdFx0XHRjbGVhbnVwX1xuXHRcdHNlbGZcblxuXHRkZWYgY2FuY2VsbGVkXG5cdFx0cmV0dXJuIHNlbGYgdW5sZXNzIEBhY3RpdmVcblxuXHRcdEBjYW5jZWxsZWQgPSB5ZXNcblx0XHRAdXBkYXRlcysrXG5cblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGZvciBnIGluIEBnZXN0dXJlc1xuXHRcdFx0XHRnLm9udG91Y2hjYW5jZWwoc2VsZikgaWYgZzpvbnRvdWNoY2FuY2VsXG5cblx0XHR0YXJnZXQ/Lm9udG91Y2hjYW5jZWwoc2VsZilcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBjbGVhbnVwX1xuXHRcdGlmIEBtb3VzZW1vdmVcblx0XHRcdEltYmEuZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJyxAbW91c2Vtb3ZlLHllcylcblx0XHRcdEBtb3VzZW1vdmUgPSBudWxsXG5cdFx0XG5cdFx0aWYgQHNlbGJsb2NrZXJcblx0XHRcdEltYmEuZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2VsZWN0c3RhcnQnLEBzZWxibG9ja2VyLHllcylcblx0XHRcdEBzZWxibG9ja2VyID0gbnVsbFxuXHRcdFxuXHRcdHNlbGZcblxuXHQjIyNcblx0VGhlIGFic29sdXRlIGRpc3RhbmNlIHRoZSB0b3VjaCBoYXMgbW92ZWQgZnJvbSBzdGFydGluZyBwb3NpdGlvbiBcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGRyIGRvIEBkclxuXG5cdCMjI1xuXHRUaGUgZGlzdGFuY2UgdGhlIHRvdWNoIGhhcyBtb3ZlZCBob3Jpem9udGFsbHlcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGR4IGRvIEB4IC0gQHgwXG5cblx0IyMjXG5cdFRoZSBkaXN0YW5jZSB0aGUgdG91Y2ggaGFzIG1vdmVkIHZlcnRpY2FsbHlcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGR5IGRvIEB5IC0gQHkwXG5cblx0IyMjXG5cdEluaXRpYWwgaG9yaXpvbnRhbCBwb3NpdGlvbiBvZiB0b3VjaFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgeDAgZG8gQHgwXG5cblx0IyMjXG5cdEluaXRpYWwgdmVydGljYWwgcG9zaXRpb24gb2YgdG91Y2hcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHkwIGRvIEB5MFxuXG5cdCMjI1xuXHRIb3Jpem9udGFsIHBvc2l0aW9uIG9mIHRvdWNoXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB4IGRvIEB4XG5cblx0IyMjXG5cdFZlcnRpY2FsIHBvc2l0aW9uIG9mIHRvdWNoXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB5IGRvIEB5XG5cblx0IyMjXG5cdEhvcml6b250YWwgcG9zaXRpb24gb2YgdG91Y2ggcmVsYXRpdmUgdG8gdGFyZ2V0XG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB0eCBkb1xuXHRcdEB0YXJnZXRCb3ggfHw9IEB0YXJnZXQuZG9tLmdldEJvdW5kaW5nQ2xpZW50UmVjdFxuXHRcdEB4IC0gQHRhcmdldEJveDpsZWZ0XG5cblx0IyMjXG5cdFZlcnRpY2FsIHBvc2l0aW9uIG9mIHRvdWNoIHJlbGF0aXZlIHRvIHRhcmdldFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgdHlcblx0XHRAdGFyZ2V0Qm94IHx8PSBAdGFyZ2V0LmRvbS5nZXRCb3VuZGluZ0NsaWVudFJlY3Rcblx0XHRAeSAtIEB0YXJnZXRCb3g6dG9wXG5cblx0IyMjXG5cdEJ1dHRvbiBwcmVzc2VkIGluIHRoaXMgdG91Y2guIE5hdGl2ZSB0b3VjaGVzIGRlZmF1bHRzIHRvIGxlZnQtY2xpY2sgKDApXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiBidXR0b24gZG8gQGJ1dHRvbiAjIEBwb2ludGVyID8gQHBvaW50ZXIuYnV0dG9uIDogMFxuXG5cdGRlZiBzb3VyY2VUYXJnZXRcblx0XHRAc291cmNlVGFyZ2V0XG5cblx0ZGVmIGVsYXBzZWRcblx0XHREYXRlLm5vdyAtIEB0aW1lc3RhbXBcblxuXG5jbGFzcyBJbWJhLlRvdWNoR2VzdHVyZVxuXG5cdHByb3AgYWN0aXZlIGRlZmF1bHQ6IG5vXG5cblx0ZGVmIG9udG91Y2hzdGFydCBlXG5cdFx0c2VsZlxuXG5cdGRlZiBvbnRvdWNodXBkYXRlIGVcblx0XHRzZWxmXG5cblx0ZGVmIG9udG91Y2hlbmQgZVxuXHRcdHNlbGZcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL3RvdWNoLmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbnZhciBrZXlDb2RlcyA9IHtcblx0ZXNjOiAyNyxcblx0dGFiOiA5LFxuXHRlbnRlcjogMTMsXG5cdHNwYWNlOiAzMixcblx0dXA6IDM4LFxuXHRkb3duOiA0MFxufVxuXG52YXIgZWwgPSBJbWJhLlRhZzpwcm90b3R5cGVcbmRlZiBlbC5zdG9wTW9kaWZpZXIgZSBkbyBlLnN0b3AgfHwgdHJ1ZVxuZGVmIGVsLnByZXZlbnRNb2RpZmllciBlIGRvIGUucHJldmVudCB8fCB0cnVlXG5kZWYgZWwuc2lsZW5jZU1vZGlmaWVyIGUgZG8gZS5zaWxlbmNlIHx8IHRydWVcbmRlZiBlbC5idWJibGVNb2RpZmllciBlIGRvIGUuYnViYmxlKHllcykgfHwgdHJ1ZVxuZGVmIGVsLmN0cmxNb2RpZmllciBlIGRvIGUuZXZlbnQ6Y3RybEtleSA9PSB0cnVlXG5kZWYgZWwuYWx0TW9kaWZpZXIgZSBkbyBlLmV2ZW50OmFsdEtleSA9PSB0cnVlXG5kZWYgZWwuc2hpZnRNb2RpZmllciBlIGRvIGUuZXZlbnQ6c2hpZnRLZXkgPT0gdHJ1ZVxuZGVmIGVsLm1ldGFNb2RpZmllciBlIGRvIGUuZXZlbnQ6bWV0YUtleSA9PSB0cnVlXG5kZWYgZWwua2V5TW9kaWZpZXIga2V5LCBlIGRvIGUua2V5Q29kZSA/IChlLmtleUNvZGUgPT0ga2V5KSA6IHRydWVcbmRlZiBlbC5kZWxNb2RpZmllciBlIGRvIGUua2V5Q29kZSA/IChlLmtleUNvZGUgPT0gOCBvciBlLmtleUNvZGUgPT0gNDYpIDogdHJ1ZVxuZGVmIGVsLnNlbGZNb2RpZmllciBlIGRvIGUuZXZlbnQ6dGFyZ2V0ID09IEBkb21cbmRlZiBlbC5sZWZ0TW9kaWZpZXIgZSBkbyBlLmJ1dHRvbiAhPSB1bmRlZmluZWQgPyAoZS5idXR0b24gPT09IDApIDogZWwua2V5TW9kaWZpZXIoMzcsZSlcbmRlZiBlbC5yaWdodE1vZGlmaWVyIGUgZG8gZS5idXR0b24gIT0gdW5kZWZpbmVkID8gKGUuYnV0dG9uID09PSAyKSA6IGVsLmtleU1vZGlmaWVyKDM5LGUpXG5kZWYgZWwubWlkZGxlTW9kaWZpZXIgZSBkbyBlLmJ1dHRvbiAhPSB1bmRlZmluZWQgPyAoZS5idXR0b24gPT09IDEpIDogdHJ1ZVxuZGVmIGVsLmdldEhhbmRsZXIgc3RyIGRvXG5cdGlmIHNlbGZbc3RyXVxuXHRcdHJldHVybiBzZWxmXG5cdGVsaWYgQGRhdGEgYW5kIEBkYXRhW3N0cl0gaXNhIEZ1bmN0aW9uXG5cdFx0cmV0dXJuIEBkYXRhXG5cbiMjI1xuSW1iYSBoYW5kbGVzIGFsbCBldmVudHMgaW4gdGhlIGRvbSB0aHJvdWdoIGEgc2luZ2xlIG1hbmFnZXIsXG5saXN0ZW5pbmcgYXQgdGhlIHJvb3Qgb2YgeW91ciBkb2N1bWVudC4gSWYgSW1iYSBmaW5kcyBhIHRhZ1xudGhhdCBsaXN0ZW5zIHRvIGEgY2VydGFpbiBldmVudCwgdGhlIGV2ZW50IHdpbGwgYmUgd3JhcHBlZCBcbmluIGFuIGBJbWJhLkV2ZW50YCwgd2hpY2ggbm9ybWFsaXplcyBzb21lIG9mIHRoZSBxdWlya3MgYW5kIFxuYnJvd3NlciBkaWZmZXJlbmNlcy5cblxuQGluYW1lIGV2ZW50XG4jIyNcbmNsYXNzIEltYmEuRXZlbnRcblxuXHQjIyMgcmVmZXJlbmNlIHRvIHRoZSBuYXRpdmUgZXZlbnQgIyMjXG5cdHByb3AgZXZlbnRcblxuXHQjIyMgcmVmZXJlbmNlIHRvIHRoZSBuYXRpdmUgZXZlbnQgIyMjXG5cdHByb3AgcHJlZml4XG5cblx0cHJvcCBkYXRhXG5cblx0cHJvcCByZXNwb25kZXJcblxuXHRkZWYgc2VsZi53cmFwIGVcblx0XHRzZWxmLm5ldyhlKVxuXHRcblx0ZGVmIGluaXRpYWxpemUgZVxuXHRcdGV2ZW50ID0gZVxuXHRcdEBidWJibGUgPSB5ZXNcblxuXHRkZWYgdHlwZT0gdHlwZVxuXHRcdEB0eXBlID0gdHlwZVxuXHRcdHNlbGZcblxuXHQjIyNcblx0QHJldHVybiB7U3RyaW5nfSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgKGNhc2UtaW5zZW5zaXRpdmUpXG5cdCMjI1xuXHRkZWYgdHlwZVxuXHRcdEB0eXBlIHx8IGV2ZW50OnR5cGVcblx0XG5cdGRlZiBidXR0b24gZG8gZXZlbnQ6YnV0dG9uXG5cdGRlZiBrZXlDb2RlIGRvIGV2ZW50OmtleUNvZGVcblxuXHRkZWYgbmFtZVxuXHRcdEBuYW1lIHx8PSB0eXBlLnRvTG93ZXJDYXNlLnJlcGxhY2UoL1xcOi9nLCcnKVxuXG5cdCMgbWltYyBnZXRzZXRcblx0ZGVmIGJ1YmJsZSB2XG5cdFx0aWYgdiAhPSB1bmRlZmluZWRcblx0XHRcdHNlbGYuYnViYmxlID0gdlxuXHRcdFx0cmV0dXJuIHNlbGZcblx0XHRyZXR1cm4gQGJ1YmJsZVxuXG5cdGRlZiBidWJibGU9IHZcblx0XHRAYnViYmxlID0gdlxuXHRcdHJldHVybiBzZWxmXG5cblx0IyMjXG5cdFByZXZlbnRzIGZ1cnRoZXIgcHJvcGFnYXRpb24gb2YgdGhlIGN1cnJlbnQgZXZlbnQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc3RvcFxuXHRcdGJ1YmJsZSA9IG5vXG5cdFx0c2VsZlxuXG5cdGRlZiBzdG9wUHJvcGFnYXRpb24gZG8gc3RvcFxuXHRkZWYgaGFsdCBkbyBzdG9wXG5cblx0IyBtaWdyYXRlIGZyb20gY2FuY2VsIHRvIHByZXZlbnRcblx0ZGVmIHByZXZlbnRcblx0XHRpZiBldmVudDpwcmV2ZW50RGVmYXVsdFxuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHRcblx0XHRlbHNlXG5cdFx0XHRldmVudDpkZWZhdWx0UHJldmVudGVkID0geWVzXG5cdFx0c2VsZjpkZWZhdWx0UHJldmVudGVkID0geWVzXG5cdFx0c2VsZlxuXG5cdGRlZiBwcmV2ZW50RGVmYXVsdFxuXHRcdGNvbnNvbGUud2FybiBcIkV2ZW50I3ByZXZlbnREZWZhdWx0IGlzIGRlcHJlY2F0ZWQgLSB1c2UgRXZlbnQjcHJldmVudFwiXG5cdFx0cHJldmVudFxuXG5cdCMjI1xuXHRJbmRpY2F0ZXMgd2hldGhlciBvciBub3QgZXZlbnQuY2FuY2VsIGhhcyBiZWVuIGNhbGxlZC5cblxuXHRAcmV0dXJuIHtCb29sZWFufVxuXHQjIyNcblx0ZGVmIGlzUHJldmVudGVkXG5cdFx0ZXZlbnQgYW5kIGV2ZW50OmRlZmF1bHRQcmV2ZW50ZWQgb3IgQGNhbmNlbFxuXG5cdCMjI1xuXHRDYW5jZWwgdGhlIGV2ZW50IChpZiBjYW5jZWxhYmxlKS4gSW4gdGhlIGNhc2Ugb2YgbmF0aXZlIGV2ZW50cyBpdFxuXHR3aWxsIGNhbGwgYHByZXZlbnREZWZhdWx0YCBvbiB0aGUgd3JhcHBlZCBldmVudCBvYmplY3QuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgY2FuY2VsXG5cdFx0Y29uc29sZS53YXJuIFwiRXZlbnQjY2FuY2VsIGlzIGRlcHJlY2F0ZWQgLSB1c2UgRXZlbnQjcHJldmVudFwiXG5cdFx0cHJldmVudFxuXG5cdGRlZiBzaWxlbmNlXG5cdFx0QHNpbGVuY2VkID0geWVzXG5cdFx0c2VsZlxuXG5cdGRlZiBpc1NpbGVuY2VkXG5cdFx0ISFAc2lsZW5jZWRcblxuXHQjIyNcblx0QSByZWZlcmVuY2UgdG8gdGhlIGluaXRpYWwgdGFyZ2V0IG9mIHRoZSBldmVudC5cblx0IyMjXG5cdGRlZiB0YXJnZXRcblx0XHR0YWcoZXZlbnQ6X3RhcmdldCBvciBldmVudDp0YXJnZXQpXG5cblx0IyMjXG5cdEEgcmVmZXJlbmNlIHRvIHRoZSBvYmplY3QgcmVzcG9uZGluZyB0byB0aGUgZXZlbnQuXG5cdCMjI1xuXHRkZWYgcmVzcG9uZGVyXG5cdFx0QHJlc3BvbmRlclxuXG5cdCMjI1xuXHRSZWRpcmVjdCB0aGUgZXZlbnQgdG8gbmV3IHRhcmdldFxuXHQjIyNcblx0ZGVmIHJlZGlyZWN0IG5vZGVcblx0XHRAcmVkaXJlY3QgPSBub2RlXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgcHJvY2Vzc0hhbmRsZXJzIG5vZGUsIGhhbmRsZXJzXG5cdFx0bGV0IGkgPSAxXG5cdFx0bGV0IGwgPSBoYW5kbGVyczpsZW5ndGhcblx0XHRsZXQgYnViYmxlID0gQGJ1YmJsZVxuXHRcdGxldCBzdGF0ZSA9IGhhbmRsZXJzOnN0YXRlIHx8PSB7fVxuXHRcdGxldCByZXN1bHQgXG5cdFx0XG5cdFx0aWYgYnViYmxlXG5cdFx0XHRAYnViYmxlID0gMVxuXG5cdFx0d2hpbGUgaSA8IGxcblx0XHRcdGxldCBpc01vZCA9IGZhbHNlXG5cdFx0XHRsZXQgaGFuZGxlciA9IGhhbmRsZXJzW2krK11cblx0XHRcdGxldCBwYXJhbXMgID0gbnVsbFxuXHRcdFx0bGV0IGNvbnRleHQgPSBub2RlXG5cdFx0XHRcblx0XHRcdGlmIGhhbmRsZXIgaXNhIEFycmF5XG5cdFx0XHRcdHBhcmFtcyA9IGhhbmRsZXIuc2xpY2UoMSlcblx0XHRcdFx0aGFuZGxlciA9IGhhbmRsZXJbMF1cblx0XHRcdFxuXHRcdFx0aWYgdHlwZW9mIGhhbmRsZXIgPT0gJ3N0cmluZydcblx0XHRcdFx0aWYga2V5Q29kZXNbaGFuZGxlcl1cblx0XHRcdFx0XHRwYXJhbXMgPSBba2V5Q29kZXNbaGFuZGxlcl1dXG5cdFx0XHRcdFx0aGFuZGxlciA9ICdrZXknXG5cdFx0XHRcdFx0XG5cdFx0XHRcdGxldCBtb2QgPSBoYW5kbGVyICsgJ01vZGlmaWVyJ1xuXG5cdFx0XHRcdGlmIG5vZGVbbW9kXVxuXHRcdFx0XHRcdGlzTW9kID0geWVzXG5cdFx0XHRcdFx0cGFyYW1zID0gKHBhcmFtcyBvciBbXSkuY29uY2F0KFtzZWxmLHN0YXRlXSlcblx0XHRcdFx0XHRoYW5kbGVyID0gbm9kZVttb2RdXG5cdFx0XHRcblx0XHRcdCMgaWYgaXQgaXMgc3RpbGwgYSBzdHJpbmcgLSBjYWxsIGdldEhhbmRsZXIgb25cblx0XHRcdCMgYW5jZXN0b3Igb2Ygbm9kZSB0byBzZWUgaWYgd2UgZ2V0IGEgaGFuZGxlciBmb3IgdGhpcyBuYW1lXG5cdFx0XHRpZiB0eXBlb2YgaGFuZGxlciA9PSAnc3RyaW5nJ1xuXHRcdFx0XHRsZXQgZWwgPSBub2RlXG5cdFx0XHRcdGxldCBmbiA9IG51bGxcblx0XHRcdFx0d2hpbGUgZWwgYW5kICghZm4gb3IgIShmbiBpc2EgRnVuY3Rpb24pKVxuXHRcdFx0XHRcdGlmIGZuID0gZWwuZ2V0SGFuZGxlcihoYW5kbGVyKVxuXHRcdFx0XHRcdFx0aWYgZm5baGFuZGxlcl0gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdFx0XHRcdGhhbmRsZXIgPSBmbltoYW5kbGVyXVxuXHRcdFx0XHRcdFx0XHRjb250ZXh0ID0gZm5cblx0XHRcdFx0XHRcdGVsaWYgZm4gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdFx0XHRcdGhhbmRsZXIgPSBmblxuXHRcdFx0XHRcdFx0XHRjb250ZXh0ID0gZWxcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRlbCA9IGVsLnBhcmVudFxuXHRcdFx0XHRcdFxuXHRcdFx0aWYgaGFuZGxlciBpc2EgRnVuY3Rpb25cblx0XHRcdFx0IyB3aGF0IGlmIHdlIGFjdHVhbGx5IGNhbGwgc3RvcCBpbnNpZGUgZnVuY3Rpb24/XG5cdFx0XHRcdCMgZG8gd2Ugc3RpbGwgd2FudCB0byBjb250aW51ZSB0aGUgY2hhaW4/XG5cdFx0XHRcdGxldCByZXMgPSBoYW5kbGVyLmFwcGx5KGNvbnRleHQscGFyYW1zIG9yIFtzZWxmXSlcblx0XHRcdFx0XG5cdFx0XHRcdCMgc2hvdWxkIHdlIHRha2UgYXdhaXRzIGludG8gYWNjb3VudD9cblx0XHRcdFx0IyB3YXMgYnViYmxpbmcgYmVmb3JlIC0gaGFzIG5vdCBiZWVuIG1vZGlmaWVkXG5cdFx0XHRcdGlmICFpc01vZFxuXHRcdFx0XHRcdGJ1YmJsZSA9IG5vICMgc3RvcCBwcm9wYWdhdGlvbiBieSBkZWZhdWx0XG5cdFx0XHRcdFx0QHJlc3BvbmRlciB8fD0gbm9kZVxuXG5cdFx0XHRcdGlmIHJlcyA9PSBmYWxzZVxuXHRcdFx0XHRcdCMgY29uc29sZS5sb2cgXCJyZXR1cm5lZCBmYWxzZSAtIGJyZWFraW5nXCJcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdGlmIHJlcyBhbmQgIUBzaWxlbmNlZCBhbmQgcmVzOnRoZW4gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdFx0cmVzLnRoZW4oSW1iYTpjb21taXQpXG5cdFx0XG5cdFx0IyBpZiB3ZSBoYXZlbnQgc3RvcHBlZCBvciBkZWFsdCB3aXRoIGJ1YmJsZSB3aGlsZSBoYW5kbGluZ1xuXHRcdGlmIEBidWJibGUgPT09IDFcblx0XHRcdEBidWJibGUgPSBidWJibGVcblxuXHRcdHJldHVybiBudWxsXG5cblx0ZGVmIHByb2Nlc3Ncblx0XHR2YXIgbmFtZSA9IHNlbGYubmFtZVxuXHRcdHZhciBtZXRoID0gXCJvbntAcHJlZml4IG9yICcnfXtuYW1lfVwiXG5cdFx0dmFyIGFyZ3MgPSBudWxsXG5cdFx0dmFyIGRvbXRhcmdldCA9IGV2ZW50Ol90YXJnZXQgb3IgZXZlbnQ6dGFyZ2V0XHRcdFxuXHRcdHZhciBkb21ub2RlID0gZG9tdGFyZ2V0Ol9yZXNwb25kZXIgb3IgZG9tdGFyZ2V0XG5cdFx0IyBAdG9kbyBuZWVkIHRvIHN0b3AgaW5maW5pdGUgcmVkaXJlY3QtcnVsZXMgaGVyZVxuXHRcdHZhciByZXN1bHRcblx0XHR2YXIgaGFuZGxlcnNcblxuXHRcdHdoaWxlIGRvbW5vZGVcblx0XHRcdEByZWRpcmVjdCA9IG51bGxcblx0XHRcdGxldCBub2RlID0gZG9tbm9kZS5AZG9tID8gZG9tbm9kZSA6IGRvbW5vZGUuQHRhZ1xuXG5cdFx0XHRpZiBub2RlXG5cdFx0XHRcdGlmIG5vZGVbbWV0aF0gaXNhIEZ1bmN0aW9uXG5cdFx0XHRcdFx0QHJlc3BvbmRlciB8fD0gbm9kZVxuXHRcdFx0XHRcdEBzaWxlbmNlZCA9IG5vXG5cdFx0XHRcdFx0cmVzdWx0ID0gYXJncyA/IG5vZGVbbWV0aF0uYXBwbHkobm9kZSxhcmdzKSA6IG5vZGVbbWV0aF0oc2VsZixkYXRhKVxuXG5cdFx0XHRcdGlmIGhhbmRsZXJzID0gbm9kZTpfb25fXG5cdFx0XHRcdFx0Zm9yIGhhbmRsZXIgaW4gaGFuZGxlcnMgd2hlbiBoYW5kbGVyXG5cdFx0XHRcdFx0XHRsZXQgaG5hbWUgPSBoYW5kbGVyWzBdXG5cdFx0XHRcdFx0XHRpZiBuYW1lID09IGhhbmRsZXJbMF0gYW5kIGJ1YmJsZSAjIGFuZCAoaG5hbWU6bGVuZ3RoID09IG5hbWU6bGVuZ3RoIG9yIGhuYW1lW25hbWU6bGVuZ3RoXSA9PSAnLicpXG5cdFx0XHRcdFx0XHRcdHByb2Nlc3NIYW5kbGVycyhub2RlLGhhbmRsZXIpXG5cdFx0XHRcdFx0YnJlYWsgdW5sZXNzIGJ1YmJsZVxuXG5cdFx0XHRcdGlmIG5vZGU6b25ldmVudFxuXHRcdFx0XHRcdG5vZGUub25ldmVudChzZWxmKVxuXG5cdFx0XHQjIGFkZCBub2RlLm5leHRFdmVudFJlc3BvbmRlciBhcyBhIHNlcGFyYXRlIG1ldGhvZCBoZXJlP1xuXHRcdFx0dW5sZXNzIGJ1YmJsZSBhbmQgZG9tbm9kZSA9IChAcmVkaXJlY3Qgb3IgKG5vZGUgPyBub2RlLnBhcmVudCA6IGRvbW5vZGU6cGFyZW50Tm9kZSkpXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRwcm9jZXNzZWRcblxuXHRcdCMgaWYgYSBoYW5kbGVyIHJldHVybnMgYSBwcm9taXNlLCBub3RpZnkgc2NoZWR1bGVyc1xuXHRcdCMgYWJvdXQgdGhpcyBhZnRlciBwcm9taXNlIGhhcyBmaW5pc2hlZCBwcm9jZXNzaW5nXG5cdFx0aWYgcmVzdWx0IGFuZCByZXN1bHQ6dGhlbiBpc2EgRnVuY3Rpb25cblx0XHRcdHJlc3VsdC50aGVuKHNlbGY6cHJvY2Vzc2VkLmJpbmQoc2VsZikpXG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cdGRlZiBwcm9jZXNzZWRcblx0XHRpZiAhQHNpbGVuY2VkIGFuZCBAcmVzcG9uZGVyXG5cdFx0XHRJbWJhLmVtaXQoSW1iYSwnZXZlbnQnLFtzZWxmXSlcblx0XHRcdEltYmEuY29tbWl0KGV2ZW50KVxuXHRcdHNlbGZcblxuXHQjIyNcblx0UmV0dXJuIHRoZSB4L2xlZnQgY29vcmRpbmF0ZSBvZiB0aGUgbW91c2UgLyBwb2ludGVyIGZvciB0aGlzIGV2ZW50XG5cdEByZXR1cm4ge051bWJlcn0geCBjb29yZGluYXRlIG9mIG1vdXNlIC8gcG9pbnRlciBmb3IgZXZlbnRcblx0IyMjXG5cdGRlZiB4IGRvIGV2ZW50OnhcblxuXHQjIyNcblx0UmV0dXJuIHRoZSB5L3RvcCBjb29yZGluYXRlIG9mIHRoZSBtb3VzZSAvIHBvaW50ZXIgZm9yIHRoaXMgZXZlbnRcblx0QHJldHVybiB7TnVtYmVyfSB5IGNvb3JkaW5hdGUgb2YgbW91c2UgLyBwb2ludGVyIGZvciBldmVudFxuXHQjIyNcblx0ZGVmIHkgZG8gZXZlbnQ6eVxuXG5cdCMjI1xuXHRSZXR1cm5zIGEgTnVtYmVyIHJlcHJlc2VudGluZyBhIHN5c3RlbSBhbmQgaW1wbGVtZW50YXRpb25cblx0ZGVwZW5kZW50IG51bWVyaWMgY29kZSBpZGVudGlmeWluZyB0aGUgdW5tb2RpZmllZCB2YWx1ZSBvZiB0aGVcblx0cHJlc3NlZCBrZXk7IHRoaXMgaXMgdXN1YWxseSB0aGUgc2FtZSBhcyBrZXlDb2RlLlxuXG5cdEZvciBtb3VzZS1ldmVudHMsIHRoZSByZXR1cm5lZCB2YWx1ZSBpbmRpY2F0ZXMgd2hpY2ggYnV0dG9uIHdhc1xuXHRwcmVzc2VkIG9uIHRoZSBtb3VzZSB0byB0cmlnZ2VyIHRoZSBldmVudC5cblxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgd2hpY2ggZG8gZXZlbnQ6d2hpY2hcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL2V2ZW50LmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5yZXF1aXJlKFwiLi9wb2ludGVyXCIpXG5cbiMjI1xuXG5NYW5hZ2VyIGZvciBsaXN0ZW5pbmcgdG8gYW5kIGRlbGVnYXRpbmcgZXZlbnRzIGluIEltYmEuIEEgc2luZ2xlIGluc3RhbmNlXG5pcyBhbHdheXMgY3JlYXRlZCBieSBJbWJhIChhcyBgSW1iYS5FdmVudHNgKSwgd2hpY2ggaGFuZGxlcyBhbmQgZGVsZWdhdGVzIGFsbFxuZXZlbnRzIGF0IHRoZSB2ZXJ5IHJvb3Qgb2YgdGhlIGRvY3VtZW50LiBJbWJhIGRvZXMgbm90IGNhcHR1cmUgYWxsIGV2ZW50c1xuYnkgZGVmYXVsdCwgc28gaWYgeW91IHdhbnQgdG8gbWFrZSBzdXJlIGV4b3RpYyBvciBjdXN0b20gRE9NRXZlbnRzIGFyZSBkZWxlZ2F0ZWRcbmluIEltYmEgeW91IHdpbGwgbmVlZCB0byByZWdpc3RlciB0aGVtIGluIGBJbWJhLkV2ZW50cy5yZWdpc3RlcihteUN1c3RvbUV2ZW50TmFtZSlgXG5cbkBpbmFtZSBtYW5hZ2VyXG5cbiMjI1xuY2xhc3MgSW1iYS5FdmVudE1hbmFnZXJcblxuXHRwcm9wIHJvb3Rcblx0cHJvcCBjb3VudFxuXHRwcm9wIGVuYWJsZWQgZGVmYXVsdDogbm8sIHdhdGNoOiB5ZXNcblx0cHJvcCBsaXN0ZW5lcnNcblx0cHJvcCBkZWxlZ2F0b3JzXG5cdHByb3AgZGVsZWdhdG9yXG5cblx0ZGVmIGVuYWJsZWQtZGlkLXNldCBib29sXG5cdFx0Ym9vbCA/IG9uZW5hYmxlIDogb25kaXNhYmxlXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLmFjdGl2YXRlXG5cdFx0cmV0dXJuIEltYmEuRXZlbnRzIGlmIEltYmEuRXZlbnRzXG5cblx0XHRpZiAkd2ViJFxuXHRcdFx0SW1iYS5QT0lOVEVSIHx8PSBJbWJhLlBvaW50ZXIubmV3XG5cblx0XHRcdEltYmEuRXZlbnRzID0gSW1iYS5FdmVudE1hbmFnZXIubmV3KEltYmEuZG9jdW1lbnQsIGV2ZW50czogW1xuXHRcdFx0XHQ6a2V5ZG93biwgOmtleXVwLCA6a2V5cHJlc3MsXG5cdFx0XHRcdDp0ZXh0SW5wdXQsIDppbnB1dCwgOmNoYW5nZSwgOnN1Ym1pdCxcblx0XHRcdFx0OmZvY3VzaW4sIDpmb2N1c291dCwgOmZvY3VzLCA6Ymx1cixcblx0XHRcdFx0OmNvbnRleHRtZW51LCA6ZGJsY2xpY2ssXG5cdFx0XHRcdDptb3VzZXdoZWVsLCA6d2hlZWwsIDpzY3JvbGwsXG5cdFx0XHRcdDpiZWZvcmVjb3B5LCA6Y29weSxcblx0XHRcdFx0OmJlZm9yZXBhc3RlLCA6cGFzdGUsXG5cdFx0XHRcdDpiZWZvcmVjdXQsIDpjdXRcblx0XHRcdF0pXG5cblx0XHRcdCMgc2hvdWxkIGxpc3RlbiB0byBkcmFnZHJvcCBldmVudHMgYnkgZGVmYXVsdFxuXHRcdFx0SW1iYS5FdmVudHMucmVnaXN0ZXIoW1xuXHRcdFx0XHQ6ZHJhZ3N0YXJ0LDpkcmFnLDpkcmFnZW5kLFxuXHRcdFx0XHQ6ZHJhZ2VudGVyLDpkcmFnb3Zlciw6ZHJhZ2xlYXZlLDpkcmFnZXhpdCw6ZHJvcFxuXHRcdFx0XSlcblxuXHRcdFx0dmFyIGhhc1RvdWNoRXZlbnRzID0gd2luZG93ICYmIHdpbmRvdzpvbnRvdWNoc3RhcnQgIT09IHVuZGVmaW5lZFxuXG5cdFx0XHRpZiBoYXNUb3VjaEV2ZW50c1xuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoc3RhcnQpIGRvIHxlfFxuXHRcdFx0XHRcdEltYmEuVG91Y2gub250b3VjaHN0YXJ0KGUpXG5cblx0XHRcdFx0SW1iYS5FdmVudHMubGlzdGVuKDp0b3VjaG1vdmUpIGRvIHxlfFxuXHRcdFx0XHRcdEltYmEuVG91Y2gub250b3VjaG1vdmUoZSlcblxuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoZW5kKSBkbyB8ZXxcblx0XHRcdFx0XHRJbWJhLlRvdWNoLm9udG91Y2hlbmQoZSlcblxuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoY2FuY2VsKSBkbyB8ZXxcblx0XHRcdFx0XHRJbWJhLlRvdWNoLm9udG91Y2hjYW5jZWwoZSlcblxuXHRcdFx0SW1iYS5FdmVudHMucmVnaXN0ZXIoOmNsaWNrKSBkbyB8ZXxcblx0XHRcdFx0IyBPbmx5IGZvciBtYWluIG1vdXNlYnV0dG9uLCBubz9cblx0XHRcdFx0aWYgKGU6dGltZVN0YW1wIC0gSW1iYS5Ub3VjaC5MYXN0VGltZXN0YW1wKSA+IEltYmEuVG91Y2guVGFwVGltZW91dFxuXHRcdFx0XHRcdGUuQGltYmFTaW11bGF0ZWRUYXAgPSB5ZXNcblx0XHRcdFx0XHR2YXIgdGFwID0gSW1iYS5FdmVudC5uZXcoZSlcblx0XHRcdFx0XHR0YXAudHlwZSA9ICd0YXAnXG5cdFx0XHRcdFx0dGFwLnByb2Nlc3Ncblx0XHRcdFx0XHRpZiB0YXAuQHJlc3BvbmRlclxuXHRcdFx0XHRcdFx0cmV0dXJuIGUucHJldmVudERlZmF1bHRcblx0XHRcdFx0IyBkZWxlZ2F0ZSB0aGUgcmVhbCBjbGljayBldmVudFxuXHRcdFx0XHRJbWJhLkV2ZW50cy5kZWxlZ2F0ZShlKVxuXG5cdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOm1vdXNlZG93bikgZG8gfGV8XG5cdFx0XHRcdGlmIChlOnRpbWVTdGFtcCAtIEltYmEuVG91Y2guTGFzdFRpbWVzdGFtcCkgPiBJbWJhLlRvdWNoLlRhcFRpbWVvdXRcblx0XHRcdFx0XHRJbWJhLlBPSU5URVIudXBkYXRlKGUpLnByb2Nlc3MgaWYgSW1iYS5QT0lOVEVSXG5cblx0XHRcdEltYmEuRXZlbnRzLmxpc3Rlbig6bW91c2V1cCkgZG8gfGV8XG5cdFx0XHRcdGlmIChlOnRpbWVTdGFtcCAtIEltYmEuVG91Y2guTGFzdFRpbWVzdGFtcCkgPiBJbWJhLlRvdWNoLlRhcFRpbWVvdXRcblx0XHRcdFx0XHRJbWJhLlBPSU5URVIudXBkYXRlKGUpLnByb2Nlc3MgaWYgSW1iYS5QT0lOVEVSXG5cblx0XHRcdEltYmEuRXZlbnRzLnJlZ2lzdGVyKFs6bW91c2Vkb3duLDptb3VzZXVwXSlcblx0XHRcdEltYmEuRXZlbnRzLmVuYWJsZWQgPSB5ZXNcblx0XHRcdHJldHVybiBJbWJhLkV2ZW50c1xuXG5cblx0ZGVmIGluaXRpYWxpemUgbm9kZSwgZXZlbnRzOiBbXVxuXHRcdEBzaGltRm9jdXNFdmVudHMgPSAkd2ViJCAmJiB3aW5kb3c6bmV0c2NhcGUgJiYgbm9kZTpvbmZvY3VzaW4gPT09IHVuZGVmaW5lZFxuXHRcdHJvb3QgPSBub2RlXG5cdFx0bGlzdGVuZXJzID0gW11cblx0XHRkZWxlZ2F0b3JzID0ge31cblx0XHRkZWxlZ2F0b3IgPSBkbyB8ZXwgXG5cdFx0XHRkZWxlZ2F0ZShlKVxuXHRcdFx0cmV0dXJuIHRydWVcblxuXHRcdGZvciBldmVudCBpbiBldmVudHNcblx0XHRcdHJlZ2lzdGVyKGV2ZW50KVxuXG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblxuXHRUZWxsIHRoZSBjdXJyZW50IEV2ZW50TWFuYWdlciB0byBpbnRlcmNlcHQgYW5kIGhhbmRsZSBldmVudCBvZiBhIGNlcnRhaW4gbmFtZS5cblx0QnkgZGVmYXVsdCwgSW1iYS5FdmVudHMgd2lsbCByZWdpc3RlciBpbnRlcmNlcHRvcnMgZm9yOiAqa2V5ZG93biosICprZXl1cCosIFxuXHQqa2V5cHJlc3MqLCAqdGV4dElucHV0KiwgKmlucHV0KiwgKmNoYW5nZSosICpzdWJtaXQqLCAqZm9jdXNpbiosICpmb2N1c291dCosIFxuXHQqYmx1ciosICpjb250ZXh0bWVudSosICpkYmxjbGljayosICptb3VzZXdoZWVsKiwgKndoZWVsKlxuXG5cdCMjI1xuXHRkZWYgcmVnaXN0ZXIgbmFtZSwgaGFuZGxlciA9IHRydWVcblx0XHRpZiBuYW1lIGlzYSBBcnJheVxuXHRcdFx0cmVnaXN0ZXIodixoYW5kbGVyKSBmb3IgdiBpbiBuYW1lXG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0cmV0dXJuIHNlbGYgaWYgZGVsZWdhdG9yc1tuYW1lXVxuXHRcdCMgY29uc29sZS5sb2coXCJyZWdpc3RlciBmb3IgZXZlbnQge25hbWV9XCIpXG5cdFx0dmFyIGZuID0gZGVsZWdhdG9yc1tuYW1lXSA9IGhhbmRsZXIgaXNhIEZ1bmN0aW9uID8gaGFuZGxlciA6IGRlbGVnYXRvclxuXHRcdHJvb3QuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLGZuLHllcykgaWYgZW5hYmxlZFxuXG5cdGRlZiBsaXN0ZW4gbmFtZSwgaGFuZGxlciwgY2FwdHVyZSA9IHllc1xuXHRcdGxpc3RlbmVycy5wdXNoKFtuYW1lLGhhbmRsZXIsY2FwdHVyZV0pXG5cdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKG5hbWUsaGFuZGxlcixjYXB0dXJlKSBpZiBlbmFibGVkXG5cdFx0c2VsZlxuXG5cdGRlZiBkZWxlZ2F0ZSBlXG5cdFx0dmFyIGV2ZW50ID0gSW1iYS5FdmVudC53cmFwKGUpXG5cdFx0ZXZlbnQucHJvY2Vzc1xuXHRcdGlmIEBzaGltRm9jdXNFdmVudHNcblx0XHRcdGlmIGU6dHlwZSA9PSAnZm9jdXMnXG5cdFx0XHRcdEltYmEuRXZlbnQud3JhcChlKS5zZXRUeXBlKCdmb2N1c2luJykucHJvY2Vzc1xuXHRcdFx0ZWxpZiBlOnR5cGUgPT0gJ2JsdXInXG5cdFx0XHRcdEltYmEuRXZlbnQud3JhcChlKS5zZXRUeXBlKCdmb2N1c291dCcpLnByb2Nlc3Ncblx0XHRzZWxmXG5cblx0IyMjXG5cblx0Q3JlYXRlIGEgbmV3IEltYmEuRXZlbnRcblxuXHQjIyNcblx0ZGVmIGNyZWF0ZSB0eXBlLCB0YXJnZXQsIGRhdGE6IG51bGwsIHNvdXJjZTogbnVsbFxuXHRcdHZhciBldmVudCA9IEltYmEuRXZlbnQud3JhcCB0eXBlOiB0eXBlLCB0YXJnZXQ6IHRhcmdldFxuXHRcdGV2ZW50LmRhdGEgPSBkYXRhIGlmIGRhdGFcblx0XHRldmVudC5zb3VyY2UgPSBzb3VyY2UgaWYgc291cmNlXG5cdFx0ZXZlbnRcblxuXHQjIyNcblxuXHRUcmlnZ2VyIC8gcHJvY2VzcyBhbiBJbWJhLkV2ZW50LlxuXG5cdCMjI1xuXHRkZWYgdHJpZ2dlclxuXHRcdGNyZWF0ZSgqYXJndW1lbnRzKS5wcm9jZXNzXG5cblx0ZGVmIG9uZW5hYmxlXG5cdFx0Zm9yIG93biBuYW1lLGhhbmRsZXIgb2YgZGVsZWdhdG9yc1xuXHRcdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKG5hbWUsaGFuZGxlcix5ZXMpXG5cblx0XHRmb3IgaXRlbSBpbiBsaXN0ZW5lcnNcblx0XHRcdHJvb3QuYWRkRXZlbnRMaXN0ZW5lcihpdGVtWzBdLGl0ZW1bMV0saXRlbVsyXSlcblx0XHRcdFxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJyxJbWJhOmNvbW1pdClcblx0XHRzZWxmXG5cblx0ZGVmIG9uZGlzYWJsZVxuXHRcdGZvciBvd24gbmFtZSxoYW5kbGVyIG9mIGRlbGVnYXRvcnNcblx0XHRcdHJvb3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLGhhbmRsZXIseWVzKVxuXG5cdFx0Zm9yIGl0ZW0gaW4gbGlzdGVuZXJzXG5cdFx0XHRyb290LnJlbW92ZUV2ZW50TGlzdGVuZXIoaXRlbVswXSxpdGVtWzFdLGl0ZW1bMl0pXG5cblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsSW1iYTpjb21taXQpXG5cdFx0c2VsZlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC1tYW5hZ2VyLmltYmEiLCJleHRlcm4gbmF2aWdhdG9yXG5cbnZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuZGVmIHJlbW92ZU5lc3RlZCByb290LCBub2RlLCBjYXJldFxuXHQjIGlmIG5vZGUvbm9kZXMgaXNhIFN0cmluZ1xuXHQjIFx0d2UgbmVlZCB0byB1c2UgdGhlIGNhcmV0IHRvIHJlbW92ZSBlbGVtZW50c1xuXHQjIFx0Zm9yIG5vdyB3ZSB3aWxsIHNpbXBseSBub3Qgc3VwcG9ydCB0aGlzXG5cdGlmIG5vZGUgaXNhIEFycmF5XG5cdFx0cmVtb3ZlTmVzdGVkKHJvb3QsbWVtYmVyLGNhcmV0KSBmb3IgbWVtYmVyIGluIG5vZGVcblx0ZWxpZiBub2RlIGFuZCBub2RlLkBkb21cblx0XHRyb290LnJlbW92ZUNoaWxkKG5vZGUpXG5cdGVsaWYgbm9kZSAhPSBudWxsXG5cdFx0IyB3aGF0IGlmIHRoaXMgaXMgbm90IG51bGw/IT8hP1xuXHRcdCMgdGFrZSBhIGNoYW5jZSBhbmQgcmVtb3ZlIGEgdGV4dC1lbGVtZW50bmdcblx0XHRsZXQgbmV4dCA9IGNhcmV0ID8gY2FyZXQ6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZFxuXHRcdGlmIG5leHQgaXNhIFRleHQgYW5kIG5leHQ6dGV4dENvbnRlbnQgPT0gbm9kZVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChuZXh0KVxuXHRcdGVsc2Vcblx0XHRcdHRocm93ICdjYW5ub3QgcmVtb3ZlIHN0cmluZydcblxuXHRyZXR1cm4gY2FyZXRcblxuZGVmIGFwcGVuZE5lc3RlZCByb290LCBub2RlXG5cdGlmIG5vZGUgaXNhIEFycmF5XG5cdFx0bGV0IGkgPSAwXG5cdFx0bGV0IGMgPSBub2RlOnRhZ2xlblxuXHRcdGxldCBrID0gYyAhPSBudWxsID8gKG5vZGU6ZG9tbGVuID0gYykgOiBub2RlOmxlbmd0aFxuXHRcdGFwcGVuZE5lc3RlZChyb290LG5vZGVbaSsrXSkgd2hpbGUgaSA8IGtcblx0ZWxpZiBub2RlIGFuZCBub2RlLkBkb21cblx0XHRyb290LmFwcGVuZENoaWxkKG5vZGUpXG5cdGVsaWYgbm9kZSAhPSBudWxsIGFuZCBub2RlICE9PSBmYWxzZVxuXHRcdHJvb3QuYXBwZW5kQ2hpbGQgSW1iYS5jcmVhdGVUZXh0Tm9kZShub2RlKVxuXG5cdHJldHVyblxuXG5cbiMgaW5zZXJ0IG5vZGVzIGJlZm9yZSBhIGNlcnRhaW4gbm9kZVxuIyBkb2VzIG5vdCBuZWVkIHRvIHJldHVybiBhbnkgdGFpbCwgYXMgYmVmb3JlXG4jIHdpbGwgc3RpbGwgYmUgY29ycmVjdCB0aGVyZVxuIyBiZWZvcmUgbXVzdCBiZSBhbiBhY3R1YWwgZG9tbm9kZVxuZGVmIGluc2VydE5lc3RlZEJlZm9yZSByb290LCBub2RlLCBiZWZvcmVcblx0aWYgbm9kZSBpc2EgQXJyYXlcblx0XHRsZXQgaSA9IDBcblx0XHRsZXQgYyA9IG5vZGU6dGFnbGVuXG5cdFx0bGV0IGsgPSBjICE9IG51bGwgPyAobm9kZTpkb21sZW4gPSBjKSA6IG5vZGU6bGVuZ3RoXG5cdFx0aW5zZXJ0TmVzdGVkQmVmb3JlKHJvb3Qsbm9kZVtpKytdLGJlZm9yZSkgd2hpbGUgaSA8IGtcblxuXHRlbGlmIG5vZGUgYW5kIG5vZGUuQGRvbVxuXHRcdHJvb3QuaW5zZXJ0QmVmb3JlKG5vZGUsYmVmb3JlKVxuXHRlbGlmIG5vZGUgIT0gbnVsbCBhbmQgbm9kZSAhPT0gZmFsc2Vcblx0XHRyb290Lmluc2VydEJlZm9yZShJbWJhLmNyZWF0ZVRleHROb2RlKG5vZGUpLGJlZm9yZSlcblxuXHRyZXR1cm4gYmVmb3JlXG5cbiMgYWZ0ZXIgbXVzdCBiZSBhbiBhY3R1YWwgZG9tbm9kZVxuZGVmIGluc2VydE5lc3RlZEFmdGVyIHJvb3QsIG5vZGUsIGFmdGVyXG5cdHZhciBiZWZvcmUgPSBhZnRlciA/IGFmdGVyOm5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblxuXHRpZiBiZWZvcmVcblx0XHRpbnNlcnROZXN0ZWRCZWZvcmUocm9vdCxub2RlLGJlZm9yZSlcblx0XHRyZXR1cm4gYmVmb3JlOnByZXZpb3VzU2libGluZ1xuXHRlbHNlXG5cdFx0YXBwZW5kTmVzdGVkKHJvb3Qsbm9kZSlcblx0XHRyZXR1cm4gcm9vdC5AZG9tOmxhc3RDaGlsZFxuXG5kZWYgcmVjb25jaWxlQ29sbGVjdGlvbkNoYW5nZXMgcm9vdCwgbmV3LCBvbGQsIGNhcmV0XG5cblx0dmFyIG5ld0xlbiA9IG5ldzpsZW5ndGhcblx0dmFyIGxhc3ROZXcgPSBuZXdbbmV3TGVuIC0gMV1cblxuXHQjIFRoaXMgcmUtb3JkZXIgYWxnb3JpdGhtIGlzIGJhc2VkIG9uIHRoZSBmb2xsb3dpbmcgcHJpbmNpcGxlOlxuXHQjIFxuXHQjIFdlIGJ1aWxkIGEgXCJjaGFpblwiIHdoaWNoIHNob3dzIHdoaWNoIGl0ZW1zIGFyZSBhbHJlYWR5IHNvcnRlZC5cblx0IyBJZiB3ZSdyZSBnb2luZyBmcm9tIFsxLCAyLCAzXSAtPiBbMiwgMSwgM10sIHRoZSB0cmVlIGxvb2tzIGxpa2U6XG5cdCNcblx0IyBcdDMgLT4gIDAgKGlkeClcblx0IyBcdDIgLT4gLTEgKGlkeClcblx0IyBcdDEgLT4gLTEgKGlkeClcblx0I1xuXHQjIFRoaXMgdGVsbHMgdXMgdGhhdCB3ZSBoYXZlIHR3byBjaGFpbnMgb2Ygb3JkZXJlZCBpdGVtczpcblx0IyBcblx0IyBcdCgxLCAzKSBhbmQgKDIpXG5cdCMgXG5cdCMgVGhlIG9wdGltYWwgcmUtb3JkZXJpbmcgdGhlbiBiZWNvbWVzIHRvIGtlZXAgdGhlIGxvbmdlc3QgY2hhaW4gaW50YWN0LFxuXHQjIGFuZCBtb3ZlIGFsbCB0aGUgb3RoZXIgaXRlbXMuXG5cblx0dmFyIG5ld1Bvc2l0aW9uID0gW11cblxuXHQjIFRoZSB0cmVlL2dyYXBoIGl0c2VsZlxuXHR2YXIgcHJldkNoYWluID0gW11cblx0IyBUaGUgbGVuZ3RoIG9mIHRoZSBjaGFpblxuXHR2YXIgbGVuZ3RoQ2hhaW4gPSBbXVxuXG5cdCMgS2VlcCB0cmFjayBvZiB0aGUgbG9uZ2VzdCBjaGFpblxuXHR2YXIgbWF4Q2hhaW5MZW5ndGggPSAwXG5cdHZhciBtYXhDaGFpbkVuZCA9IDBcblxuXHR2YXIgaGFzVGV4dE5vZGVzID0gbm9cblx0dmFyIG5ld1Bvc1xuXG5cdGZvciBub2RlLCBpZHggaW4gb2xkXG5cdFx0IyBzcGVjaWFsIGNhc2UgZm9yIFRleHQgbm9kZXNcblx0XHRpZiBub2RlIGFuZCBub2RlOm5vZGVUeXBlID09IDNcblx0XHRcdG5ld1BvcyA9IG5ldy5pbmRleE9mKG5vZGU6dGV4dENvbnRlbnQpXG5cdFx0XHRuZXdbbmV3UG9zXSA9IG5vZGUgaWYgbmV3UG9zID49IDBcblx0XHRcdGhhc1RleHROb2RlcyA9IHllc1xuXHRcdGVsc2Vcblx0XHRcdG5ld1BvcyA9IG5ldy5pbmRleE9mKG5vZGUpXG5cblx0XHRuZXdQb3NpdGlvbi5wdXNoKG5ld1BvcylcblxuXHRcdGlmIG5ld1BvcyA9PSAtMVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChub2RlKVxuXHRcdFx0cHJldkNoYWluLnB1c2goLTEpXG5cdFx0XHRsZW5ndGhDaGFpbi5wdXNoKC0xKVxuXHRcdFx0Y29udGludWVcblxuXHRcdHZhciBwcmV2SWR4ID0gbmV3UG9zaXRpb246bGVuZ3RoIC0gMlxuXG5cdFx0IyBCdWlsZCB0aGUgY2hhaW46XG5cdFx0d2hpbGUgcHJldklkeCA+PSAwXG5cdFx0XHRpZiBuZXdQb3NpdGlvbltwcmV2SWR4XSA9PSAtMVxuXHRcdFx0XHRwcmV2SWR4LS1cblx0XHRcdGVsaWYgbmV3UG9zID4gbmV3UG9zaXRpb25bcHJldklkeF1cblx0XHRcdFx0IyBZYXksIHdlJ3JlIGJpZ2dlciB0aGFuIHRoZSBwcmV2aW91cyFcblx0XHRcdFx0YnJlYWtcblx0XHRcdGVsc2Vcblx0XHRcdFx0IyBOb3BlLCBsZXQncyB3YWxrIGJhY2sgdGhlIGNoYWluXG5cdFx0XHRcdHByZXZJZHggPSBwcmV2Q2hhaW5bcHJldklkeF1cblxuXHRcdHByZXZDaGFpbi5wdXNoKHByZXZJZHgpXG5cblx0XHR2YXIgY3Vyckxlbmd0aCA9IChwcmV2SWR4ID09IC0xKSA/IDAgOiBsZW5ndGhDaGFpbltwcmV2SWR4XSsxXG5cblx0XHRpZiBjdXJyTGVuZ3RoID4gbWF4Q2hhaW5MZW5ndGhcblx0XHRcdG1heENoYWluTGVuZ3RoID0gY3Vyckxlbmd0aFxuXHRcdFx0bWF4Q2hhaW5FbmQgPSBpZHhcblxuXHRcdGxlbmd0aENoYWluLnB1c2goY3Vyckxlbmd0aClcblxuXHR2YXIgc3RpY2t5Tm9kZXMgPSBbXVxuXG5cdCMgTm93IHdlIGNhbiB3YWxrIHRoZSBsb25nZXN0IGNoYWluIGJhY2t3YXJkcyBhbmQgbWFyayB0aGVtIGFzIFwic3RpY2t5XCIsXG5cdCMgd2hpY2ggaW1wbGllcyB0aGF0IHRoZXkgc2hvdWxkIG5vdCBiZSBtb3ZlZFxuXHR2YXIgY3Vyc29yID0gbmV3UG9zaXRpb246bGVuZ3RoIC0gMVxuXHR3aGlsZSBjdXJzb3IgPj0gMFxuXHRcdGlmIGN1cnNvciA9PSBtYXhDaGFpbkVuZCBhbmQgbmV3UG9zaXRpb25bY3Vyc29yXSAhPSAtMVxuXHRcdFx0c3RpY2t5Tm9kZXNbbmV3UG9zaXRpb25bY3Vyc29yXV0gPSB0cnVlXG5cdFx0XHRtYXhDaGFpbkVuZCA9IHByZXZDaGFpblttYXhDaGFpbkVuZF1cblxuXHRcdGN1cnNvciAtPSAxXG5cblx0IyBwb3NzaWJsZSB0byBkbyB0aGlzIGluIHJldmVyc2VkIG9yZGVyIGluc3RlYWQ/XG5cdGZvciBub2RlLCBpZHggaW4gbmV3XG5cdFx0aWYgIXN0aWNreU5vZGVzW2lkeF1cblx0XHRcdCMgY3JlYXRlIHRleHRub2RlIGZvciBzdHJpbmcsIGFuZCB1cGRhdGUgdGhlIGFycmF5XG5cdFx0XHR1bmxlc3Mgbm9kZSBhbmQgbm9kZS5AZG9tXG5cdFx0XHRcdG5vZGUgPSBuZXdbaWR4XSA9IEltYmEuY3JlYXRlVGV4dE5vZGUobm9kZSlcblxuXHRcdFx0dmFyIGFmdGVyID0gbmV3W2lkeCAtIDFdXG5cdFx0XHRpbnNlcnROZXN0ZWRBZnRlcihyb290LCBub2RlLCAoYWZ0ZXIgYW5kIGFmdGVyLkBkb20gb3IgYWZ0ZXIgb3IgY2FyZXQpKVxuXG5cdFx0Y2FyZXQgPSBub2RlLkBkb20gb3IgKGNhcmV0IGFuZCBjYXJldDpuZXh0U2libGluZyBvciByb290LkBkb206Zmlyc3RDaGlsZClcblxuXHQjIHNob3VsZCB0cnVzdCB0aGF0IHRoZSBsYXN0IGl0ZW0gaW4gbmV3IGxpc3QgaXMgdGhlIGNhcmV0XG5cdHJldHVybiBsYXN0TmV3IGFuZCBsYXN0TmV3LkBkb20gb3IgY2FyZXRcblxuXG4jIGV4cGVjdHMgYSBmbGF0IG5vbi1zcGFyc2UgYXJyYXkgb2Ygbm9kZXMgaW4gYm90aCBuZXcgYW5kIG9sZCwgYWx3YXlzXG5kZWYgcmVjb25jaWxlQ29sbGVjdGlvbiByb290LCBuZXcsIG9sZCwgY2FyZXRcblx0dmFyIGsgPSBuZXc6bGVuZ3RoXG5cdHZhciBpID0ga1xuXHR2YXIgbGFzdCA9IG5ld1trIC0gMV1cblxuXG5cdGlmIGsgPT0gb2xkOmxlbmd0aCBhbmQgbmV3WzBdID09PSBvbGRbMF1cblx0XHQjIHJ1bm5pbmcgdGhyb3VnaCB0byBjb21wYXJlXG5cdFx0d2hpbGUgaS0tXG5cdFx0XHRicmVhayBpZiBuZXdbaV0gIT09IG9sZFtpXVxuXG5cdGlmIGkgPT0gLTFcblx0XHRyZXR1cm4gbGFzdCBhbmQgbGFzdC5AZG9tIG9yIGxhc3Qgb3IgY2FyZXRcblx0ZWxzZVxuXHRcdHJldHVybiByZWNvbmNpbGVDb2xsZWN0aW9uQ2hhbmdlcyhyb290LG5ldyxvbGQsY2FyZXQpXG5cbiMgVFlQRSA1IC0gd2Uga25vdyB0aGF0IHdlIGFyZSBkZWFsaW5nIHdpdGggYSBzaW5nbGUgYXJyYXkgb2ZcbiMga2V5ZWQgdGFncyAtIGFuZCByb290IGhhcyBubyBvdGhlciBjaGlsZHJlblxuZGVmIHJlY29uY2lsZUxvb3Agcm9vdCwgbmV3LCBvbGQsIGNhcmV0XG5cdHZhciBubCA9IG5ldzpsZW5ndGhcblx0dmFyIG9sID0gb2xkOmxlbmd0aFxuXHR2YXIgY2wgPSBuZXc6Y2FjaGU6aSQgIyBjYWNoZS1sZW5ndGhcblx0dmFyIGkgPSAwLCBkID0gbmwgLSBvbFxuXG5cdCMgZmluZCB0aGUgZmlyc3QgaW5kZXggdGhhdCBpcyBkaWZmZXJlbnRcblx0aSsrIHdoaWxlIGkgPCBvbCBhbmQgaSA8IG5sIGFuZCBuZXdbaV0gPT09IG9sZFtpXVxuXHRcblx0IyBjb25kaXRpb25hbGx5IHBydW5lIGNhY2hlXG5cdGlmIGNsID4gMTAwMCBhbmQgKGNsIC0gbmwpID4gNTAwXG5cdFx0bmV3OmNhY2hlOiRwcnVuZShuZXcpXG5cdFxuXHRpZiBkID4gMCBhbmQgaSA9PSBvbFxuXHRcdCMgYWRkZWQgYXQgZW5kXG5cdFx0cm9vdC5hcHBlbmRDaGlsZChuZXdbaSsrXSkgd2hpbGUgaSA8IG5sXG5cdFx0cmV0dXJuXG5cdFxuXHRlbGlmIGQgPiAwXG5cdFx0bGV0IGkxID0gbmxcblx0XHRpMS0tIHdoaWxlIGkxID4gaSBhbmQgbmV3W2kxIC0gMV0gPT09IG9sZFtpMSAtIDEgLSBkXVxuXG5cdFx0aWYgZCA9PSAoaTEgLSBpKVxuXHRcdFx0IyBjb25zb2xlLmxvZyBcImFkZGVkIGluIGNodW5rXCIsaSxpMVxuXHRcdFx0bGV0IGJlZm9yZSA9IG9sZFtpXS5AZG9tXG5cdFx0XHRyb290Lmluc2VydEJlZm9yZShuZXdbaSsrXSxiZWZvcmUpIHdoaWxlIGkgPCBpMVxuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0ZWxpZiBkIDwgMCBhbmQgaSA9PSBubFxuXHRcdCMgcmVtb3ZlZCBhdCBlbmRcblx0XHRyb290LnJlbW92ZUNoaWxkKG9sZFtpKytdKSB3aGlsZSBpIDwgb2xcblx0XHRyZXR1cm5cblx0ZWxpZiBkIDwgMFxuXHRcdGxldCBpMSA9IG9sXG5cdFx0aTEtLSB3aGlsZSBpMSA+IGkgYW5kIG5ld1tpMSAtIDEgKyBkXSA9PT0gb2xkW2kxIC0gMV1cblxuXHRcdGlmIGQgPT0gKGkgLSBpMSlcblx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQob2xkW2krK10pIHdoaWxlIGkgPCBpMVxuXHRcdFx0cmV0dXJuXG5cblx0ZWxpZiBpID09IG5sXG5cdFx0cmV0dXJuXG5cblx0cmV0dXJuIHJlY29uY2lsZUNvbGxlY3Rpb25DaGFuZ2VzKHJvb3QsbmV3LG9sZCxjYXJldClcblxuIyBleHBlY3RzIGEgZmxhdCBub24tc3BhcnNlIGFycmF5IG9mIG5vZGVzIGluIGJvdGggbmV3IGFuZCBvbGQsIGFsd2F5c1xuZGVmIHJlY29uY2lsZUluZGV4ZWRBcnJheSByb290LCBhcnJheSwgb2xkLCBjYXJldFxuXHR2YXIgbmV3TGVuID0gYXJyYXk6dGFnbGVuXG5cdHZhciBwcmV2TGVuID0gYXJyYXk6ZG9tbGVuIG9yIDBcblx0dmFyIGxhc3QgPSBuZXdMZW4gPyBhcnJheVtuZXdMZW4gLSAxXSA6IG51bGxcblx0IyBjb25zb2xlLmxvZyBcInJlY29uY2lsZSBvcHRpbWl6ZWQgYXJyYXkoISlcIixjYXJldCxuZXdMZW4scHJldkxlbixhcnJheVxuXG5cdGlmIHByZXZMZW4gPiBuZXdMZW5cblx0XHR3aGlsZSBwcmV2TGVuID4gbmV3TGVuXG5cdFx0XHR2YXIgaXRlbSA9IGFycmF5Wy0tcHJldkxlbl1cblx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQoaXRlbS5AZG9tKVxuXG5cdGVsaWYgbmV3TGVuID4gcHJldkxlblxuXHRcdCMgZmluZCB0aGUgaXRlbSB0byBpbnNlcnQgYmVmb3JlXG5cdFx0bGV0IHByZXZMYXN0ID0gcHJldkxlbiA/IGFycmF5W3ByZXZMZW4gLSAxXS5AZG9tIDogY2FyZXRcblx0XHRsZXQgYmVmb3JlID0gcHJldkxhc3QgPyBwcmV2TGFzdDpuZXh0U2libGluZyA6IHJvb3QuQGRvbTpmaXJzdENoaWxkXG5cdFx0XG5cdFx0d2hpbGUgcHJldkxlbiA8IG5ld0xlblxuXHRcdFx0bGV0IG5vZGUgPSBhcnJheVtwcmV2TGVuKytdXG5cdFx0XHRiZWZvcmUgPyByb290Lmluc2VydEJlZm9yZShub2RlLkBkb20sYmVmb3JlKSA6IHJvb3QuYXBwZW5kQ2hpbGQobm9kZS5AZG9tKVxuXHRcdFx0XG5cdGFycmF5OmRvbWxlbiA9IG5ld0xlblxuXHRyZXR1cm4gbGFzdCA/IGxhc3QuQGRvbSA6IGNhcmV0XG5cblxuIyB0aGUgZ2VuZXJhbCByZWNvbmNpbGVyIHRoYXQgcmVzcGVjdHMgY29uZGl0aW9ucyBldGNcbiMgY2FyZXQgaXMgdGhlIGN1cnJlbnQgbm9kZSB3ZSB3YW50IHRvIGluc2VydCB0aGluZ3MgYWZ0ZXJcbmRlZiByZWNvbmNpbGVOZXN0ZWQgcm9vdCwgbmV3LCBvbGQsIGNhcmV0XG5cblx0IyB2YXIgc2tpcG5ldyA9IG5ldyA9PSBudWxsIG9yIG5ldyA9PT0gZmFsc2Ugb3IgbmV3ID09PSB0cnVlXG5cdHZhciBuZXdJc051bGwgPSBuZXcgPT0gbnVsbCBvciBuZXcgPT09IGZhbHNlXG5cdHZhciBvbGRJc051bGwgPSBvbGQgPT0gbnVsbCBvciBvbGQgPT09IGZhbHNlXG5cblxuXHRpZiBuZXcgPT09IG9sZFxuXHRcdCMgcmVtZW1iZXIgdGhhdCB0aGUgY2FyZXQgbXVzdCBiZSBhbiBhY3R1YWwgZG9tIGVsZW1lbnRcblx0XHQjIHdlIHNob3VsZCBpbnN0ZWFkIG1vdmUgdGhlIGFjdHVhbCBjYXJldD8gLSB0cnVzdFxuXHRcdGlmIG5ld0lzTnVsbFxuXHRcdFx0cmV0dXJuIGNhcmV0XG5cdFx0ZWxpZiBuZXcuQGRvbVxuXHRcdFx0cmV0dXJuIG5ldy5AZG9tXG5cdFx0ZWxpZiBuZXcgaXNhIEFycmF5IGFuZCBuZXc6dGFnbGVuICE9IG51bGxcblx0XHRcdHJldHVybiByZWNvbmNpbGVJbmRleGVkQXJyYXkocm9vdCxuZXcsb2xkLGNhcmV0KVxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBjYXJldCA/IGNhcmV0Om5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblxuXHRlbGlmIG5ldyBpc2EgQXJyYXlcblx0XHRpZiBvbGQgaXNhIEFycmF5XG5cdFx0XHQjIGxvb2sgZm9yIHNsb3QgaW5zdGVhZD9cblx0XHRcdGxldCB0eXAgPSBuZXc6c3RhdGljXG5cdFx0XHRpZiB0eXAgb3Igb2xkOnN0YXRpY1xuXHRcdFx0XHQjIGlmIHRoZSBzdGF0aWMgaXMgbm90IG5lc3RlZCAtIHdlIGNvdWxkIGdldCBhIGhpbnQgZnJvbSBjb21waWxlclxuXHRcdFx0XHQjIGFuZCBqdXN0IHNraXAgaXRcblx0XHRcdFx0aWYgdHlwID09IG9sZDpzdGF0aWMgIyBzaG91bGQgYWxzbyBpbmNsdWRlIGEgcmVmZXJlbmNlP1xuXHRcdFx0XHRcdGZvciBpdGVtLGkgaW4gbmV3XG5cdFx0XHRcdFx0XHQjIHRoaXMgaXMgd2hlcmUgd2UgY291bGQgZG8gdGhlIHRyaXBsZSBlcXVhbCBkaXJlY3RseVxuXHRcdFx0XHRcdFx0Y2FyZXQgPSByZWNvbmNpbGVOZXN0ZWQocm9vdCxpdGVtLG9sZFtpXSxjYXJldClcblx0XHRcdFx0XHRyZXR1cm4gY2FyZXRcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHJlbW92ZU5lc3RlZChyb290LG9sZCxjYXJldClcblx0XHRcdFx0XHRcblx0XHRcdFx0IyBpZiB0aGV5IGFyZSBub3QgdGhlIHNhbWUgd2UgY29udGludWUgdGhyb3VnaCB0byB0aGUgZGVmYXVsdFxuXHRcdFx0ZWxzZVxuXHRcdFx0XHQjIENvdWxkIHVzZSBvcHRpbWl6ZWQgbG9vcCBpZiB3ZSBrbm93IHRoYXQgaXQgb25seSBjb25zaXN0cyBvZiBub2Rlc1xuXHRcdFx0XHRyZXR1cm4gcmVjb25jaWxlQ29sbGVjdGlvbihyb290LG5ldyxvbGQsY2FyZXQpXG5cdFx0ZWxpZiAhb2xkSXNOdWxsXG5cdFx0XHRpZiBvbGQuQGRvbVxuXHRcdFx0XHRyb290LnJlbW92ZUNoaWxkKG9sZClcblx0XHRcdGVsc2Vcblx0XHRcdFx0IyBvbGQgd2FzIGEgc3RyaW5nLWxpa2Ugb2JqZWN0P1xuXHRcdFx0XHRyb290LnJlbW92ZUNoaWxkKGNhcmV0ID8gY2FyZXQ6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZClcblxuXHRcdHJldHVybiBpbnNlcnROZXN0ZWRBZnRlcihyb290LG5ldyxjYXJldClcblx0XHQjIHJlbW92ZSBvbGRcblxuXHRlbGlmICFuZXdJc051bGwgYW5kIG5ldy5AZG9tXG5cdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KSB1bmxlc3Mgb2xkSXNOdWxsXG5cdFx0cmV0dXJuIGluc2VydE5lc3RlZEFmdGVyKHJvb3QsbmV3LGNhcmV0KVxuXG5cdGVsaWYgbmV3SXNOdWxsXG5cdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KSB1bmxlc3Mgb2xkSXNOdWxsXG5cdFx0cmV0dXJuIGNhcmV0XG5cdGVsc2Vcblx0XHQjIGlmIG9sZCBkaWQgbm90IGV4aXN0IHdlIG5lZWQgdG8gYWRkIGEgbmV3IGRpcmVjdGx5XG5cdFx0bGV0IG5leHROb2RlXG5cdFx0IyBpZiBvbGQgd2FzIGFycmF5IG9yIGltYmF0YWcgd2UgbmVlZCB0byByZW1vdmUgaXQgYW5kIHRoZW4gYWRkXG5cdFx0aWYgb2xkIGlzYSBBcnJheVxuXHRcdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KVxuXHRcdGVsaWYgb2xkIGFuZCBvbGQuQGRvbVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChvbGQpXG5cdFx0ZWxpZiAhb2xkSXNOdWxsXG5cdFx0XHQjIC4uLlxuXHRcdFx0bmV4dE5vZGUgPSBjYXJldCA/IGNhcmV0Om5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblx0XHRcdGlmIG5leHROb2RlIGlzYSBUZXh0IGFuZCBuZXh0Tm9kZTp0ZXh0Q29udGVudCAhPSBuZXdcblx0XHRcdFx0bmV4dE5vZGU6dGV4dENvbnRlbnQgPSBuZXdcblx0XHRcdFx0cmV0dXJuIG5leHROb2RlXG5cblx0XHQjIG5vdyBhZGQgdGhlIHRleHRub2RlXG5cdFx0cmV0dXJuIGluc2VydE5lc3RlZEFmdGVyKHJvb3QsbmV3LGNhcmV0KVxuXG5cbmV4dGVuZCB0YWcgZWxlbWVudFxuXHRcblx0IyAxIC0gc3RhdGljIHNoYXBlIC0gdW5rbm93biBjb250ZW50XG5cdCMgMiAtIHN0YXRpYyBzaGFwZSBhbmQgc3RhdGljIGNoaWxkcmVuXG5cdCMgMyAtIHNpbmdsZSBpdGVtXG5cdCMgNCAtIG9wdGltaXplZCBhcnJheSAtIG9ubHkgbGVuZ3RoIHdpbGwgY2hhbmdlXG5cdCMgNSAtIG9wdGltaXplZCBjb2xsZWN0aW9uXG5cdCMgNiAtIHRleHQgb25seVxuXG5cdGRlZiBzZXRDaGlsZHJlbiBuZXcsIHR5cFxuXHRcdCMgaWYgdHlwZW9mIG5ldyA9PSAnc3RyaW5nJ1xuXHRcdCMgXHRyZXR1cm4gc2VsZi50ZXh0ID0gbmV3XG5cdFx0dmFyIG9sZCA9IEB0cmVlX1xuXG5cdFx0aWYgbmV3ID09PSBvbGQgYW5kIG5ldyBhbmQgbmV3OnRhZ2xlbiA9PSB1bmRlZmluZWRcblx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRpZiAhb2xkIGFuZCB0eXAgIT0gM1xuXHRcdFx0cmVtb3ZlQWxsQ2hpbGRyZW5cblx0XHRcdGFwcGVuZE5lc3RlZChzZWxmLG5ldylcblxuXHRcdGVsaWYgdHlwID09IDFcblx0XHRcdGxldCBjYXJldCA9IG51bGxcblx0XHRcdGZvciBpdGVtLGkgaW4gbmV3XG5cdFx0XHRcdGNhcmV0ID0gcmVjb25jaWxlTmVzdGVkKHNlbGYsaXRlbSxvbGRbaV0sY2FyZXQpXG5cdFx0XG5cdFx0ZWxpZiB0eXAgPT0gMlxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdGVsaWYgdHlwID09IDNcblx0XHRcdGxldCBudHlwID0gdHlwZW9mIG5ld1xuXG5cdFx0XHRpZiBuZXcgYW5kIG5ldy5AZG9tXG5cdFx0XHRcdHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0XHRcdGFwcGVuZENoaWxkKG5ldylcblxuXHRcdFx0IyBjaGVjayBpZiBvbGQgYW5kIG5ldyBpc2EgYXJyYXlcblx0XHRcdGVsaWYgbmV3IGlzYSBBcnJheVxuXHRcdFx0XHRpZiBuZXcuQHR5cGUgPT0gNSBhbmQgb2xkIGFuZCBvbGQuQHR5cGUgPT0gNVxuXHRcdFx0XHRcdHJlY29uY2lsZUxvb3Aoc2VsZixuZXcsb2xkLG51bGwpXG5cdFx0XHRcdGVsaWYgb2xkIGlzYSBBcnJheVxuXHRcdFx0XHRcdHJlY29uY2lsZU5lc3RlZChzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0XHRcdFx0YXBwZW5kTmVzdGVkKHNlbGYsbmV3KVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHR0ZXh0ID0gbmV3XG5cdFx0XHRcdHJldHVybiBzZWxmXG5cdFx0XHRcdFxuXHRcdGVsaWYgdHlwID09IDRcblx0XHRcdHJlY29uY2lsZUluZGV4ZWRBcnJheShzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRcdFxuXHRcdGVsaWYgdHlwID09IDVcblx0XHRcdHJlY29uY2lsZUxvb3Aoc2VsZixuZXcsb2xkLG51bGwpXG5cblx0XHRlbGlmIG5ldyBpc2EgQXJyYXkgYW5kIG9sZCBpc2EgQXJyYXlcblx0XHRcdHJlY29uY2lsZU5lc3RlZChzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRlbHNlXG5cdFx0XHQjIHdoYXQgaWYgdGV4dD9cblx0XHRcdHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0XHRhcHBlbmROZXN0ZWQoc2VsZixuZXcpXG5cblx0XHRAdHJlZV8gPSBuZXdcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBjb250ZW50XG5cdFx0QGNvbnRlbnQgb3IgY2hpbGRyZW4udG9BcnJheVxuXHRcblx0ZGVmIHNldFRleHQgdGV4dFxuXHRcdGlmIHRleHQgIT0gQHRyZWVfXG5cdFx0XHR2YXIgdmFsID0gdGV4dCA9PT0gbnVsbCBvciB0ZXh0ID09PSBmYWxzZSA/ICcnIDogdGV4dFxuXHRcdFx0KEB0ZXh0XyBvciBAZG9tKTp0ZXh0Q29udGVudCA9IHZhbFxuXHRcdFx0QHRleHRfIHx8PSBAZG9tOmZpcnN0Q2hpbGRcblx0XHRcdEB0cmVlXyA9IHRleHRcblx0XHRzZWxmXG5cbiMgYWxpYXMgc2V0Q29udGVudCB0byBzZXRDaGlsZHJlblxudmFyIHByb3RvID0gSW1iYS5UYWc6cHJvdG90eXBlXG5wcm90bzpzZXRDb250ZW50ID0gcHJvdG86c2V0Q2hpbGRyZW5cblxuIyBvcHRpbWl6YXRpb24gZm9yIHNldFRleHRcbnZhciBhcHBsZSA9IHR5cGVvZiBuYXZpZ2F0b3IgIT0gJ3VuZGVmaW5lZCcgYW5kIChuYXZpZ2F0b3I6dmVuZG9yIG9yICcnKS5pbmRleE9mKCdBcHBsZScpID09IDBcbmlmIGFwcGxlXG5cdGRlZiBwcm90by5zZXRUZXh0IHRleHRcblx0XHRpZiB0ZXh0ICE9IEB0cmVlX1xuXHRcdFx0QGRvbTp0ZXh0Q29udGVudCA9ICh0ZXh0ID09PSBudWxsIG9yIHRleHQgPT09IGZhbHNlID8gJycgOiB0ZXh0KVxuXHRcdFx0QHRyZWVfID0gdGV4dFxuXHRcdHJldHVybiBzZWxmXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vcmVjb25jaWxlci5pbWJhIiwiaW1wb3J0IFJvdXRlciBmcm9tICcuL3V0aWwvcm91dGVyJ1xuXG5leHBvcnQgY2xhc3MgRG9jXG5cblx0cHJvcCBwYXRoXG5cdHByb3Agc3JjXG5cdHByb3AgZGF0YVxuXG5cdGRlZiByZWFkeVxuXHRcdEByZWFkeVxuXG5cdGRlZiBpbml0aWFsaXplIHNyYywgYXBwXG5cdFx0QHNyYyA9IHNyY1xuXHRcdEBwYXRoID0gc3JjLnJlcGxhY2UoL1xcLm1kJC8sJycpXG5cdFx0QGFwcCA9IGFwcFxuXHRcdEByZWFkeSA9IG5vXG5cdFx0ZmV0Y2hcblx0XHRzZWxmXG5cblx0ZGVmIGZldGNoXG5cdFx0QHByb21pc2UgfHw9IEBhcHAuZmV0Y2goc3JjKS50aGVuIGRvIHxyZXN8XG5cdFx0XHRsb2FkKHJlcylcblxuXHRkZWYgbG9hZCBkb2Ncblx0XHRAZGF0YSA9IGRvY1xuXHRcdEBtZXRhID0gZG9jOm1ldGEgb3Ige31cblx0XHRAcmVhZHkgPSB5ZXNcblx0XHRJbWJhLmNvbW1pdFxuXHRcdHNlbGZcblxuXHRkZWYgdGl0bGVcblx0XHRAZGF0YTp0aXRsZSBvciAncGF0aCdcblxuXHRkZWYgdG9jXG5cdFx0QGRhdGEgYW5kIEBkYXRhOnRvY1swXVxuXG5cdGRlZiBib2R5XG5cdFx0QGRhdGEgYW5kIEBkYXRhOmJvZHlcblxuXG5leHBvcnQgdmFyIENhY2hlID0ge31cbnZhciByZXF1ZXN0cyA9IHt9XG5cbmV4cG9ydCBjbGFzcyBBcHBcblx0cHJvcCByZXFcblx0cHJvcCBjYWNoZVxuXHRwcm9wIGlzc3Vlc1xuXHRcblx0ZGVmIHNlbGYuZGVzZXJpYWxpemUgZGF0YSA9ICd7fSdcblx0XHRzZWxmLm5ldyBKU09OLnBhcnNlKGRhdGEucmVwbGFjZSgvwqfCp1NDUklQVMKnwqcvZyxcInNjcmlwdFwiKSlcblxuXHRkZWYgaW5pdGlhbGl6ZSBjYWNoZSA9IHt9XG5cdFx0QGNhY2hlID0gY2FjaGVcblx0XHRAZG9jcyA9IHt9XG5cdFx0aWYgJHdlYiRcblx0XHRcdEBsb2MgPSBkb2N1bWVudDpsb2NhdGlvblxuXHRcdFx0XG5cdFx0aWYgQGNhY2hlOmd1aWRlXG5cdFx0XHRAZ3VpZGUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KEBjYWNoZTpndWlkZSkpXG5cdFx0XHQjIGZvciBpdGVtLGkgaW4gQGd1aWRlXG5cdFx0XHQjIFx0QGd1aWRlW2l0ZW06aWRdID0gaXRlbVxuXHRcdFx0IyBcdGl0ZW06bmV4dCA9IEBndWlkZVtpICsgMV1cblx0XHRcdCMgXHRpdGVtOnByZXYgPSBAZ3VpZGVbaSAtIDFdXG5cdFx0c2VsZlxuXG5cdGRlZiByZXNldFxuXHRcdGNhY2hlID0ge31cblx0XHRzZWxmXG5cblx0ZGVmIHJvdXRlclxuXHRcdEByb3V0ZXIgfHw9IFJvdXRlci5uZXcoc2VsZilcblxuXHRkZWYgcGF0aFxuXHRcdCR3ZWIkID8gQGxvYzpwYXRobmFtZSA6IHJlcTpwYXRoXG5cblx0ZGVmIGhhc2hcblx0XHQkd2ViJCA/IEBsb2M6aGFzaC5zdWJzdHIoMSkgOiAnJ1xuXG5cdGRlZiBkb2Mgc3JjXG5cdFx0QGRvY3Nbc3JjXSB8fD0gRG9jLm5ldyhzcmMsc2VsZilcblx0XHRcblx0ZGVmIGd1aWRlXG5cdFx0QGd1aWRlIHx8PSBAY2FjaGU6Z3VpZGUgIyAubWFwIGRvIHx8XG5cdFx0XG5cdGRlZiBzZXJpYWxpemVcblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoY2FjaGUpLnJlcGxhY2UoL1xcYnNjcmlwdC9nLFwiwqfCp1NDUklQVMKnwqdcIilcblxuXHRpZiAkbm9kZSRcblx0XHRkZWYgZmV0Y2ggc3JjXG5cdFx0XHRsZXQgcmVzID0gY2FjaGVbc3JjXSA9IENhY2hlW3NyY11cblx0XHRcdGxldCBwcm9taXNlID0ge3RoZW46ICh8Y2J8IGNiKENhY2hlW3NyY10pKSB9XG5cdFx0XHRcblx0XHRcdHJldHVybiBwcm9taXNlIGlmIHJlc1xuXHRcdFx0XG5cdFx0XHRjb25zb2xlLmxvZyBcInRyeSB0byBmZXRjaCB7c3JjfVwiXG5cdFx0XHRcblx0XHRcdHZhciBmcyA9IHJlcXVpcmUgJ2ZzJ1xuXHRcdFx0dmFyIHBhdGggPSByZXF1aXJlICdwYXRoJ1xuXHRcdFx0dmFyIG1kID0gcmVxdWlyZSAnLi91dGlsL21hcmtkb3duJ1xuXHRcdFx0dmFyIGhsID0gcmVxdWlyZSAnLi9zY3JpbWJsYS9jb3JlL2hpZ2hsaWdodGVyJ1xuXHRcdFx0dmFyIGZpbGVwYXRoID0gXCJ7X19kaXJuYW1lfS8uLi9kb2NzL3tzcmN9XCIucmVwbGFjZSgvXFwvXFwvL2csJy8nKVxuXG5cdFx0XHRsZXQgYm9keSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlcGF0aCwndXRmLTgnKVxuXG5cdFx0XHRpZiBzcmMubWF0Y2goL1xcLm1kJC8pXG5cdFx0XHRcdHJlcyA9IG1kLnJlbmRlcihib2R5KVxuXG5cdFx0XHRlbGlmIHNyYy5tYXRjaCgvXFwuanNvbiQvKVxuXHRcdFx0XHQjIHNob3VsZCBhbHNvIGluY2x1ZGUgbWQ/XG5cdFx0XHRcdHJlcyA9IEpTT04ucGFyc2UoYm9keSlcblxuXHRcdFx0ZWxpZiBzcmMubWF0Y2goL1xcLmltYmEkLylcblx0XHRcdFx0bGV0IGh0bWwgPSBobC5IaWdobGlnaHRlci5oaWdobGlnaHQoYm9keSx7bW9kZTogJ2Z1bGwnfSlcblx0XHRcdFx0cmVzID0ge2JvZHk6IGJvZHksIGh0bWw6IGh0bWx9XG5cblx0XHRcdGNhY2hlW3NyY10gPSBDYWNoZVtzcmNdID0gcmVzXG5cdFx0XHRyZXR1cm4gcHJvbWlzZVxuXHRcblx0aWYgJHdlYiRcblx0XHRkZWYgZmV0Y2ggc3JjXG5cdFx0XHRpZiBjYWNoZVtzcmNdXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoY2FjaGVbc3JjXSlcblx0XHRcdFxuXHRcdFx0cmVxdWVzdHNbc3JjXSB8fD0gUHJvbWlzZS5uZXcgZG8gfHJlc29sdmV8XG5cdFx0XHRcdHZhciByZXEgPSBhd2FpdCB3aW5kb3cuZmV0Y2goc3JjKVxuXHRcdFx0XHR2YXIgcmVzcCA9IGF3YWl0IHJlcS5qc29uXG5cdFx0XHRcdHJlc29sdmUoY2FjaGVbc3JjXSA9IHJlc3ApXG5cdFx0XHRcblx0ZGVmIGZldGNoRG9jdW1lbnQgc3JjLCAmY2Jcblx0XHR2YXIgcmVzID0gZGVwc1tzcmNdXG5cdFx0Y29uc29sZS5sb2cgXCJubyBsb25nZXI/XCJcblxuXHRcdGlmICRub2RlJFxuXHRcdFx0dmFyIGZzID0gcmVxdWlyZSAnZnMnXG5cdFx0XHR2YXIgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cdFx0XHR2YXIgbWQgPSByZXF1aXJlICcuL3V0aWwvbWFya2Rvd24nXG5cdFx0XHR2YXIgaGwgPSByZXF1aXJlICcuL3NjcmltYmxhL2NvcmUvaGlnaGxpZ2h0ZXInXG5cdFx0XHR2YXIgZmlsZXBhdGggPSBcIntfX2Rpcm5hbWV9Ly4uL2RvY3Mve3NyY31cIi5yZXBsYWNlKC9cXC9cXC8vZywnLycpXG5cblx0XHRcdGlmICFyZXNcblx0XHRcdFx0bGV0IGJvZHkgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZXBhdGgsJ3V0Zi04JylcblxuXHRcdFx0XHRpZiBzcmMubWF0Y2goL1xcLm1kJC8pXG5cdFx0XHRcdFx0cmVzID0gbWQucmVuZGVyKGJvZHkpXG5cblx0XHRcdFx0ZWxpZiBzcmMubWF0Y2goL1xcLmpzb24kLylcblx0XHRcdFx0XHQjIHNob3VsZCBhbHNvIGluY2x1ZGUgbWQ/XG5cdFx0XHRcdFx0cmVzID0gSlNPTi5wYXJzZShib2R5KVxuXG5cdFx0XHRcdGVsaWYgc3JjLm1hdGNoKC9cXC5pbWJhJC8pXG5cdFx0XHRcdFx0bGV0IGh0bWwgPSBobC5IaWdobGlnaHRlci5oaWdobGlnaHQoYm9keSx7bW9kZTogJ2Z1bGwnfSlcblx0XHRcdFx0XHRyZXMgPSB7Ym9keTogYm9keSwgaHRtbDogaHRtbH1cblx0XHRcdFxuXHRcdFx0ZGVwc1tzcmNdIHx8PSByZXNcblx0XHRcdGNiIGFuZCBjYihyZXMpXG5cdFx0ZWxzZVxuXHRcdFx0IyBzaG91bGQgZ3VhcmQgYWdhaW5zdCBtdWx0aXBsZSBsb2Fkc1xuXHRcdFx0aWYgcmVzXG5cdFx0XHRcdGNiIGFuZCBjYihyZXMpXG5cdFx0XHRcdHJldHVybiB7dGhlbjogKGRvIHx2fCB2KHJlcykpfSAjIGZha2UgcHJvbWlzZSBoYWNrXG5cblx0XHRcdHZhciB4aHIgPSBYTUxIdHRwUmVxdWVzdC5uZXdcblx0XHRcdHhoci5hZGRFdmVudExpc3RlbmVyICdsb2FkJyBkbyB8cmVzfFxuXHRcdFx0XHRyZXMgPSBkZXBzW3NyY10gPSBKU09OLnBhcnNlKHhocjpyZXNwb25zZVRleHQpXG5cdFx0XHRcdGNiIGFuZCBjYihyZXMpXG5cdFx0XHR4aHIub3BlbihcIkdFVFwiLCBzcmMpXG5cdFx0XHR4aHIuc2VuZFxuXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgaXNzdWVzXG5cdFx0QGlzc3VlcyB8fD0gRG9jLmdldCgnL2lzc3Vlcy9hbGwnLCdqc29uJylcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2FwcC5pbWJhIiwiZXh0ZXJuIGhpc3RvcnksIGdhXG5cbmV4cG9ydCBjbGFzcyBSb3V0ZXJcblxuXHRwcm9wIHBhdGhcblxuXHRkZWYgc2VsZi5zbHVnIHN0clxuXHRcdHN0ciA9IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJykudG9Mb3dlckNhc2UgIyB0cmltXG5cblx0XHR2YXIgZnJvbSA9IFwiw6DDocOkw6LDpcOow6nDq8Oqw6zDrcOvw67DssOzw7bDtMO5w7rDvMO7w7HDp8K3L18sOjtcIlxuXHRcdHZhciB0byAgID0gXCJhYWFhYWVlZWVpaWlpb29vb3V1dXVuYy0tLS0tLVwiXG5cdFx0c3RyID0gc3RyLnJlcGxhY2UoL1teYS16MC05IC1dL2csICcnKSAjIHJlbW92ZSBpbnZhbGlkIGNoYXJzXG5cdFx0c3RyID0gc3RyLnJlcGxhY2UoL1xccysvZywgJy0nKSAjIGNvbGxhcHNlIHdoaXRlc3BhY2UgYW5kIHJlcGxhY2UgYnkgLVxuXHRcdHN0ciA9IHN0ci5yZXBsYWNlKC8tKy9nLCAnLScpICMgY29sbGFwc2UgZGFzaGVzXG5cblx0XHRyZXR1cm4gc3RyXG5cblx0ZGVmIGluaXRpYWxpemUgYXBwXG5cdFx0QGFwcCA9IGFwcFxuXG5cdFx0aWYgJHdlYiRcblx0XHRcdHdpbmRvdzpvbnBvcHN0YXRlID0gZG8gfGV8XG5cdFx0XHRcdHJlZnJlc2hcblxuXHRcdHNlbGZcblxuXHRkZWYgcmVmcmVzaFxuXHRcdGlmICR3ZWIkXG5cdFx0XHRkb2N1bWVudDpib2R5LnNldEF0dHJpYnV0ZSgnZGF0YS1yb3V0ZScsc2VnbWVudCgwKSlcblx0XHRcdEltYmEuY29tbWl0XG5cdFx0c2VsZlxuXG5cdGRlZiBwYXRoXG5cdFx0QGFwcC5wYXRoXG5cblx0ZGVmIGhhc2hcblx0XHRAYXBwLmhhc2hcblxuXHRkZWYgZXh0XG5cdFx0dmFyIHBhdGggPSBwYXRoXG5cdFx0dmFyIG0gPSBwYXRoLm1hdGNoKC9cXC4oW15cXC9dKykkLylcblx0XHRtIGFuZCBtWzFdIG9yICcnXG5cblx0ZGVmIHNlZ21lbnQgbnIgPSAwXG5cdFx0cGF0aC5zcGxpdCgnLycpW25yICsgMV0gb3IgJydcblxuXHRkZWYgZ28gaHJlZiwgc3RhdGUgPSB7fSwgcmVwbGFjZSA9IG5vXG5cdFx0aWYgaHJlZiA9PSAnL2luc3RhbGwnXG5cdFx0XHQjIHJlZGlyZWN0cyBoZXJlXG5cdFx0XHRocmVmID0gJy9ndWlkZXMjdG9jLWluc3RhbGxhdGlvbidcblx0XHRcdFxuXHRcdGlmIHJlcGxhY2Vcblx0XHRcdGhpc3RvcnkucmVwbGFjZVN0YXRlKHN0YXRlLG51bGwsaHJlZilcblx0XHRcdHJlZnJlc2hcblx0XHRlbHNlXG5cdFx0XHRoaXN0b3J5LnB1c2hTdGF0ZShzdGF0ZSxudWxsLGhyZWYpXG5cdFx0XHRyZWZyZXNoXG5cdFx0XHQjIGdhKCdzZW5kJywgJ3BhZ2V2aWV3JywgaHJlZilcblxuXHRcdGlmICFocmVmLm1hdGNoKC9cXCMvKVxuXHRcdFx0d2luZG93LnNjcm9sbFRvKDAsMClcblx0XG5cdFx0c2VsZlxuXG5cdGRlZiBzY29wZWQgcmVnLCBwYXJ0XG5cdFx0dmFyIHBhdGggPSBwYXRoICsgJyMnICsgaGFzaFxuXHRcdGlmIHJlZyBpc2EgU3RyaW5nXG5cdFx0XHR2YXIgbnh0ID0gcGF0aFtyZWc6bGVuZ3RoXVxuXHRcdFx0cGF0aC5zdWJzdHIoMCxyZWc6bGVuZ3RoKSA9PSByZWcgYW5kICghbnh0IG9yIG54dCA9PSAnLScgb3Igbnh0ID09ICcvJyBvciBueHQgPT0gJyMnIG9yIG54dCA9PSAnPycgb3Igbnh0ID09ICdfJylcblx0XHRlbGlmIHJlZyBpc2EgUmVnRXhwXG5cdFx0XHR2YXIgbSA9IHBhdGgubWF0Y2gocmVnKVxuXHRcdFx0cGFydCAmJiBtID8gbVtwYXJ0XSA6IG1cblx0XHRlbHNlXG5cdFx0XHRub1xuXG5cdGRlZiBtYXRjaCByZWcsIHBhcnRcblx0XHR2YXIgcGF0aCA9IHBhdGggKyAnIycgKyBoYXNoXG5cblx0XHRpZiByZWcgaXNhIFN0cmluZ1xuXHRcdFx0cGF0aCA9PSByZWdcblx0XHRlbGlmIHJlZyBpc2EgUmVnRXhwXG5cdFx0XHR2YXIgbSA9IHBhdGgubWF0Y2gocmVnKVxuXHRcdFx0cGFydCAmJiBtID8gbVtwYXJ0XSA6IG1cblx0XHRlbHNlXG5cdFx0XHRub1xuXG5leHRlbmQgdGFnIGVsZW1lbnRcblx0YXR0ciByb3V0ZVxuXG5cdGRlZiByb3V0ZXJcblx0XHRhcHAucm91dGVyXG5cblx0ZGVmIHJlcm91dGVcblx0XHR2YXIgc2NvcGVkID0gcm91dGVyLnNjb3BlZChyb3V0ZSxzZWxmKVxuXHRcdGZsYWcoJ3Njb3BlZCcsc2NvcGVkKVxuXHRcdGZsYWcoJ3NlbGVjdGVkJyxyb3V0ZXIubWF0Y2gocm91dGUsc2VsZikpXG5cdFx0aWYgc2NvcGVkICE9IEBzY29wZWRcblx0XHRcdEBzY29wZWQgPSBzY29wZWRcblx0XHRcdHNjb3BlZCA/IGRpZHNjb3BlIDogZGlkdW5zY29wZVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIGRpZHNjb3BlXG5cdFx0c2VsZlxuXG5cdGRlZiBkaWR1bnNjb3BlXG5cdFx0c2VsZlxuXG4jIGV4dGVuZCBsaW5rc1xuZXh0ZW5kIHRhZyBhXG5cdFxuXHRkZWYgcm91dGVcblx0XHRAcm91dGUgb3IgaHJlZlxuXG5cdGRlZiBvbnRhcCBlXG5cdFx0dmFyIGhyZWYgPSBocmVmLnJlcGxhY2UoL15odHRwXFw6XFwvXFwvaW1iYVxcLmlvLywnJylcblxuXHRcdGlmIGUuZXZlbnQ6bWV0YUtleSBvciBlLmV2ZW50OmFsdEtleVxuXHRcdFx0ZS5AcmVzcG9uZGVyID0gbnVsbFxuXHRcdFx0cmV0dXJuIGUuc3RvcFxuXG5cdFx0aWYgbGV0IG0gPSBocmVmLm1hdGNoKC9naXN0XFwuZ2l0aHViXFwuY29tXFwvKFteXFwvXSspXFwvKFtBLVphLXpcXGRdKykvKVxuXHRcdFx0Y29uc29sZS5sb2cgJ2dpc3QhIScsbVsxXSxtWzJdXG5cdFx0XHQjZ2lzdC5vcGVuKG1bMl0pXG5cdFx0XHRyZXR1cm4gZS5wcmV2ZW50LnN0b3BcblxuXHRcdGlmIGhyZWZbMF0gPT0gJyMnIG9yIGhyZWZbMF0gPT0gJy8nXG5cdFx0XHRlLnByZXZlbnQuc3RvcFxuXHRcdFx0cm91dGVyLmdvKGhyZWYse30pXG5cdFx0XHRJbWJhLkV2ZW50cy50cmlnZ2VyKCdyb3V0ZScsc2VsZilcblx0XHRlbHNlXG5cdFx0XHRlLkByZXNwb25kZXIgPSBudWxsXG5cdFx0XHRyZXR1cm4gZS5zdG9wXHRcdFxuXHRcdHNlbGZcblxuXHRkZWYgcmVuZGVyXG5cdFx0cmVyb3V0ZSBpZiAkd2ViJFxuXHRcdHNlbGZcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy91dGlsL3JvdXRlci5pbWJhIiwiaW1wb3J0IEhvbWVQYWdlIGZyb20gJy4vSG9tZVBhZ2UnXG5pbXBvcnQgR3VpZGVzUGFnZSBmcm9tICcuL0d1aWRlc1BhZ2UnXG5pbXBvcnQgRG9jc1BhZ2UgZnJvbSAnLi9Eb2NzUGFnZSdcblxuZXh0ZW5kIHRhZyBlbGVtZW50XG5cblx0ZGVmIHJvb3Rcblx0XHRAb3duZXJfID8gQG93bmVyXy5yb290IDogc2VsZlxuXG5cdGRlZiBhcHBcblx0XHRyb290LmFwcFxuXG5cbmV4cG9ydCB0YWcgU2l0ZVxuXHRcblx0ZGVmIGFwcFxuXHRcdGRhdGFcblx0XHRcblx0ZGVmIHJvb3Rcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiByb3V0ZXJcblx0XHRhcHAucm91dGVyXG5cdFx0XG5cdGRlZiBsb2FkXG5cdFx0Y29uc29sZS5sb2cgXCJsb2FkaW5nIGFwcC5yb3V0ZXJcIlxuXHRcdFByb21pc2UubmV3IGRvIHxyZXNvbHZlfFxuXHRcdFx0Y29uc29sZS5sb2cgXCJTaXRlI2xvYWRcIlxuXHRcdFx0c2V0VGltZW91dChyZXNvbHZlLDIwMClcblx0XHRcblx0ZGVmIHJlbmRlclxuXHRcdGNvbnNvbGUubG9nIFwicmVuZGVyIHNpdGVcIixhcHAucGF0aFxuXHRcdDxzZWxmPlxuXHRcdFx0PGhlYWRlciNoZWFkZXI+XG5cdFx0XHRcdDxuYXYuY29udGVudD5cblx0XHRcdFx0XHQ8YS50YWIubG9nbyBocmVmPScvaG9tZSc+IDxpPiAnaW1iYSdcblx0XHRcdFx0XHQ8c3Bhbi5ncmVlZHk+XG5cdFx0XHRcdFx0PGEudGFiLmhvbWUgaHJlZj0nL2hvbWUnPiA8aT4gJ2hvbWUnXG5cdFx0XHRcdFx0PGEudGFiLmd1aWRlcyBocmVmPScvZ3VpZGUnPiA8aT4gJ2xlYXJuJ1xuXHRcdFx0XHRcdDxhLnRhYi5kb2NzIGhyZWY9Jy9kb2NzJz4gPGk+ICdhcGknXG5cdFx0XHRcdFx0PGEudHdpdHRlciBocmVmPSdodHRwOi8vdHdpdHRlci5jb20vaW1iYWpzJz4gPGk+ICd0d2l0dGVyJ1xuXHRcdFx0XHRcdDxhLmdpdGh1YiBocmVmPSdodHRwczovL2dpdGh1Yi5jb20vc29tZWJlZS9pbWJhJz4gPGk+ICdnaXRodWInXG5cdFx0XHRcdFx0PGEuaXNzdWVzIGhyZWY9J2h0dHBzOi8vZ2l0aHViLmNvbS9zb21lYmVlL2ltYmEvaXNzdWVzJz4gPGk+ICdpc3N1ZXMnXG5cdFx0XHRcdFx0PGEubWVudSA6dGFwPSd0b2dnbGVNZW51Jz4gPGI+XG5cdFx0XHRcblx0XHRcdDxtYWluPlxuXHRcdFx0XHRpZiByb3V0ZXIuc2NvcGVkKCcvaG9tZScpXG5cdFx0XHRcdFx0PEhvbWVQYWdlPlxuXHRcdFx0XHRlbGlmIHJvdXRlci5zY29wZWQoJy9ndWlkZScpXG5cdFx0XHRcdFx0PEd1aWRlc1BhZ2VbYXBwLmd1aWRlXT5cblx0XHRcdFx0ZWxpZiByb3V0ZXIuc2NvcGVkKCcvZG9jcycpXG5cdFx0XHRcdFx0PERvY3NQYWdlPlxuXG5cdFx0XHQ8Zm9vdGVyI2Zvb3Rlcj4gXG5cdFx0XHRcdDxocj5cblx0XHRcdFx0PC5sZnQ+IFwiSW1iYSDCqSAyMDE1LTIwMThcIlxuXHRcdFx0XHQ8LnJndD5cblx0XHRcdFx0XHQ8YSBocmVmPSdodHRwOi8vdHdpdHRlci5jb20vaW1iYWpzJz4gJ1R3aXR0ZXInXG5cdFx0XHRcdFx0PGEgaHJlZj0naHR0cDovL2dpdGh1Yi5jb20vc29tZWJlZS9pbWJhJz4gJ0dpdEh1Yidcblx0XHRcdFx0XHQ8YSBocmVmPSdodHRwOi8vZ2l0aHViLmNvbS9zb21lYmVlL2ltYmEvaXNzdWVzJz4gJ0lzc3Vlcydcblx0XHRcdFx0XHQ8YSBocmVmPSdodHRwOi8vZ2l0dGVyLmltL3NvbWViZWUvaW1iYSc+ICdDaGF0J1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL1NpdGUuaW1iYSIsImltcG9ydCBQYWdlIGZyb20gJy4vUGFnZSdcblxuaW1wb3J0IEV4YW1wbGUgZnJvbSAnLi9TbmlwcGV0J1xuaW1wb3J0IE1hcmtlZCBmcm9tICcuL01hcmtlZCdcbmltcG9ydCBQYXR0ZXJuIGZyb20gJy4vUGF0dGVybidcblxuXG5leHBvcnQgdGFnIEhvbWVQYWdlIDwgUGFnZVxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj4gPC5ib2R5PlxuXHRcdFx0PGRpdiNoZXJvLmRhcms+XG5cdFx0XHRcdDxQYXR0ZXJuQHBhdHRlcm4+XG5cdFx0XHRcdCMgPGhlcm9zbmlwcGV0Lmhlcm8uZGFyayBzcmM9Jy9ob21lL2V4YW1wbGVzL2hlcm8uaW1iYSc+XG5cdFx0XHQ8LmNvbnRlbnQ+XG5cdFx0XHRcdDxNYXJrZWQuc2VjdGlvbi5tZC53ZWxjb21lLmh1Z2UubGlnaHQ+IFwiXCJcIlxuXHRcdFx0XHRcdCMgQ3JlYXRlIGNvbXBsZXggd2ViIGFwcHMgd2l0aCBlYXNlIVxuXG5cdFx0XHRcdFx0SW1iYSBpcyBhIG5ldyBwcm9ncmFtbWluZyBsYW5ndWFnZSBmb3IgdGhlIHdlYiB0aGF0IGNvbXBpbGVzIHRvIGhpZ2hseSBcblx0XHRcdFx0XHRwZXJmb3JtYW50IGFuZCByZWFkYWJsZSBKYXZhU2NyaXB0LiBJdCBoYXMgbGFuZ3VhZ2UgbGV2ZWwgc3VwcG9ydCBmb3IgZGVmaW5pbmcsIFxuXHRcdFx0XHRcdGV4dGVuZGluZywgc3ViY2xhc3NpbmcsIGluc3RhbnRpYXRpbmcgYW5kIHJlbmRlcmluZyBkb20gbm9kZXMuIEZvciBhIHNpbXBsZSBcblx0XHRcdFx0XHRhcHBsaWNhdGlvbiBsaWtlIFRvZG9NVkMsIGl0IGlzIG1vcmUgdGhhbiBcblx0XHRcdFx0XHRbMTAgdGltZXMgZmFzdGVyIHRoYW4gUmVhY3RdKGh0dHA6Ly9zb21lYmVlLmdpdGh1Yi5pby90b2RvbXZjLXJlbmRlci1iZW5jaG1hcmsvaW5kZXguaHRtbCkgXG5cdFx0XHRcdFx0d2l0aCBsZXNzIGNvZGUsIGFuZCBhIG11Y2ggc21hbGxlciBsaWJyYXJ5LlxuXG5cdFx0XHRcdFx0LS0tXG5cblx0XHRcdFx0XHQtICMjIEltYmEuaW5zcGlyYXRpb25cblx0XHRcdFx0XHQgIEltYmEgYnJpbmdzIHRoZSBiZXN0IGZyb20gUnVieSwgUHl0aG9uLCBhbmQgUmVhY3QgKCsgSlNYKSB0b2dldGhlciBpbiBhIGNsZWFuIGxhbmd1YWdlIGFuZCBydW50aW1lLlxuXG5cdFx0XHRcdFx0LSAjIyBJbWJhLmludGVyb3BlcmFiaWxpdHlcblx0XHRcdFx0XHQgIEltYmEgY29tcGlsZXMgZG93biB0byBjbGVhbiBhbmQgcmVhZGFibGUgSmF2YVNjcmlwdC4gVXNlIGFueSBKUyBsaWJyYXJ5IGluIEltYmEgYW5kIHZpY2EtdmVyc2EuXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0LSAjIyBJbWJhLnBlcmZvcm1hbmNlXG5cdFx0XHRcdFx0ICBCdWlsZCB5b3VyIGFwcGxpY2F0aW9uIHZpZXdzIHVzaW5nIEltYmEncyBuYXRpdmUgdGFncyBmb3IgdW5wcmVjZWRlbnRlZCBwZXJmb3JtYW5jZS5cblxuXHRcdFx0XHRcdFwiXCJcIlxuXG5cdFx0XHRcdCMgPEV4YW1wbGUuZGFyayBoZWFkaW5nPVwiU2ltcGxlIHJlbWluZGVyc1wiIHNyYz0nL2hvbWUvZXhhbXBsZXMvcmVtaW5kZXJzLmltYmEnPlxuXG5cdFx0XHRcdDxNYXJrZWQuc2VjdGlvbi5tZD4gXCJcIlwiXG5cdFx0XHRcdFx0IyMgUmV1c2FibGUgY29tcG9uZW50c1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdEEgY3VzdG9tIHRhZyAvIGNvbXBvbmVudCBjYW4gbWFpbnRhaW4gaW50ZXJuYWwgc3RhdGUgYW5kIGNvbnRyb2wgaG93IHRvIHJlbmRlciBpdHNlbGYuXG5cdFx0XHRcdFx0V2l0aCB0aGUgcGVyZm9ybWFuY2Ugb2YgRE9NIHJlY29uY2lsaWF0aW9uIGluIEltYmEsIHlvdSBjYW4gdXNlIG9uZS13YXkgZGVjbGFyYXRpdmUgYmluZGluZ3MsXG5cdFx0XHRcdFx0ZXZlbiBmb3IgYW5pbWF0aW9ucy4gV3JpdGUgYWxsIHlvdXIgdmlld3MgaW4gYSBzdHJhaWdodC1mb3J3YXJkIGxpbmVhciBmYXNoaW9uIGFzIGlmIHlvdSBjb3VsZFxuXHRcdFx0XHRcdHJlcmVuZGVyIHlvdXIgd2hvbGUgYXBwbGljYXRpb24gb24gKipldmVyeSBzaW5nbGUqKiBkYXRhL3N0YXRlIGNoYW5nZS5cblx0XHRcdFx0XHRcIlwiXCJcblxuXHRcdFx0XHQjIDxFeGFtcGxlLmRhcmsgaGVhZGluZz1cIldvcmxkIGNsb2NrXCIgc3JjPScvaG9tZS9leGFtcGxlcy9jbG9jay5pbWJhJz5cblxuXHRcdFx0XHQ8TWFya2VkLnNlY3Rpb24ubWQ+IFwiXCJcIlxuXHRcdFx0XHRcdCMjIEV4dGVuZCBuYXRpdmUgdGFnc1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdEluIGFkZGl0aW9uIHRvIGRlZmluaW5nIGN1c3RvbSB0YWdzLCB5b3UgY2FuIGFsc28gZXh0ZW5kIG5hdGl2ZSB0YWdzLCBvciBpbmhlcml0IGZyb20gdGhlbS5cblx0XHRcdFx0XHRCaW5kaW5nIHRvIGRvbSBldmVudHMgaXMgYXMgc2ltcGxlIGFzIGRlZmluaW5nIG1ldGhvZHMgb24geW91ciB0YWdzOyBhbGwgZXZlbnRzIHdpbGwgYmVcblx0XHRcdFx0XHRlZmZpY2llbnRseSBkZWxlZ2F0ZWQgYW5kIGhhbmRsZWQgYnkgSW1iYS4gTGV0J3MgZGVmaW5lIGEgc2ltcGxlIHNrZXRjaHBhZC4uLlxuXHRcdFx0XHRcdFwiXCJcIlxuXG5cdFx0XHRcdCMgPEV4YW1wbGUuZGFyayBoZWFkaW5nPVwiQ3VzdG9tIGNhbnZhc1wiIHNyYz0nL2hvbWUvZXhhbXBsZXMvY2FudmFzLmltYmEnPlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9Ib21lUGFnZS5pbWJhIiwiIyBkZWZpbmUgcmVuZGVyZXJcbnZhciBtYXJrZWQgPSByZXF1aXJlICdtYXJrZWQnXG52YXIgbWRyID0gbWFya2VkLlJlbmRlcmVyLm5ld1xuXG5kZWYgbWRyLmhlYWRpbmcgdGV4dCwgbHZsXG5cdFwiPGh7bHZsfT57dGV4dH08L2h7bHZsfT5cIlxuXHRcdFxuZXhwb3J0IHRhZyBNYXJrZWRcblx0ZGVmIHJlbmRlcmVyXG5cdFx0c2VsZlxuXG5cdGRlZiBzZXRUZXh0IHRleHRcblx0XHRpZiB0ZXh0ICE9IEB0ZXh0XG5cdFx0XHRAdGV4dCA9IHRleHRcblx0XHRcdGRvbTppbm5lckhUTUwgPSBtYXJrZWQodGV4dCwgcmVuZGVyZXI6IG1kcilcblx0XHRzZWxmXG5cblx0ZGVmIHNldENvbnRlbnQgdmFsLHR5cFxuXHRcdHNldFRleHQodmFsLDApXG5cdFx0cmV0dXJuIHNlbGZcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL01hcmtlZC5pbWJhIiwiLyoqXG4gKiBtYXJrZWQgLSBhIG1hcmtkb3duIHBhcnNlclxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTQsIENocmlzdG9waGVyIEplZmZyZXkuIChNSVQgTGljZW5zZWQpXG4gKiBodHRwczovL2dpdGh1Yi5jb20vY2hqai9tYXJrZWRcbiAqL1xuXG47KGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIEJsb2NrLUxldmVsIEdyYW1tYXJcbiAqL1xuXG52YXIgYmxvY2sgPSB7XG4gIG5ld2xpbmU6IC9eXFxuKy8sXG4gIGNvZGU6IC9eKCB7NH1bXlxcbl0rXFxuKikrLyxcbiAgZmVuY2VzOiBub29wLFxuICBocjogL14oICpbLSpfXSl7Myx9ICooPzpcXG4rfCQpLyxcbiAgaGVhZGluZzogL14gKigjezEsNn0pICooW15cXG5dKz8pICojKiAqKD86XFxuK3wkKS8sXG4gIG5wdGFibGU6IG5vb3AsXG4gIGxoZWFkaW5nOiAvXihbXlxcbl0rKVxcbiAqKD18LSl7Mix9ICooPzpcXG4rfCQpLyxcbiAgYmxvY2txdW90ZTogL14oICo+W15cXG5dKyhcXG4oPyFkZWYpW15cXG5dKykqXFxuKikrLyxcbiAgbGlzdDogL14oICopKGJ1bGwpIFtcXHNcXFNdKz8oPzpocnxkZWZ8XFxuezIsfSg/ISApKD8hXFwxYnVsbCApXFxuKnxcXHMqJCkvLFxuICBodG1sOiAvXiAqKD86Y29tbWVudCAqKD86XFxufFxccyokKXxjbG9zZWQgKig/OlxcbnsyLH18XFxzKiQpfGNsb3NpbmcgKig/OlxcbnsyLH18XFxzKiQpKS8sXG4gIGRlZjogL14gKlxcWyhbXlxcXV0rKVxcXTogKjw/KFteXFxzPl0rKT4/KD86ICtbXCIoXShbXlxcbl0rKVtcIildKT8gKig/Olxcbit8JCkvLFxuICB0YWJsZTogbm9vcCxcbiAgcGFyYWdyYXBoOiAvXigoPzpbXlxcbl0rXFxuPyg/IWhyfGhlYWRpbmd8bGhlYWRpbmd8YmxvY2txdW90ZXx0YWd8ZGVmKSkrKVxcbiovLFxuICB0ZXh0OiAvXlteXFxuXSsvXG59O1xuXG5ibG9jay5idWxsZXQgPSAvKD86WyorLV18XFxkK1xcLikvO1xuYmxvY2suaXRlbSA9IC9eKCAqKShidWxsKSBbXlxcbl0qKD86XFxuKD8hXFwxYnVsbCApW15cXG5dKikqLztcbmJsb2NrLml0ZW0gPSByZXBsYWNlKGJsb2NrLml0ZW0sICdnbScpXG4gICgvYnVsbC9nLCBibG9jay5idWxsZXQpXG4gICgpO1xuXG5ibG9jay5saXN0ID0gcmVwbGFjZShibG9jay5saXN0KVxuICAoL2J1bGwvZywgYmxvY2suYnVsbGV0KVxuICAoJ2hyJywgJ1xcXFxuKyg/PVxcXFwxPyg/OlstKl9dICopezMsfSg/OlxcXFxuK3wkKSknKVxuICAoJ2RlZicsICdcXFxcbisoPz0nICsgYmxvY2suZGVmLnNvdXJjZSArICcpJylcbiAgKCk7XG5cbmJsb2NrLmJsb2NrcXVvdGUgPSByZXBsYWNlKGJsb2NrLmJsb2NrcXVvdGUpXG4gICgnZGVmJywgYmxvY2suZGVmKVxuICAoKTtcblxuYmxvY2suX3RhZyA9ICcoPyEoPzonXG4gICsgJ2F8ZW18c3Ryb25nfHNtYWxsfHN8Y2l0ZXxxfGRmbnxhYmJyfGRhdGF8dGltZXxjb2RlJ1xuICArICd8dmFyfHNhbXB8a2JkfHN1YnxzdXB8aXxifHV8bWFya3xydWJ5fHJ0fHJwfGJkaXxiZG8nXG4gICsgJ3xzcGFufGJyfHdicnxpbnN8ZGVsfGltZylcXFxcYilcXFxcdysoPyE6L3xbXlxcXFx3XFxcXHNAXSpAKVxcXFxiJztcblxuYmxvY2suaHRtbCA9IHJlcGxhY2UoYmxvY2suaHRtbClcbiAgKCdjb21tZW50JywgLzwhLS1bXFxzXFxTXSo/LS0+LylcbiAgKCdjbG9zZWQnLCAvPCh0YWcpW1xcc1xcU10rPzxcXC9cXDE+LylcbiAgKCdjbG9zaW5nJywgLzx0YWcoPzpcIlteXCJdKlwifCdbXiddKid8W14nXCI+XSkqPz4vKVxuICAoL3RhZy9nLCBibG9jay5fdGFnKVxuICAoKTtcblxuYmxvY2sucGFyYWdyYXBoID0gcmVwbGFjZShibG9jay5wYXJhZ3JhcGgpXG4gICgnaHInLCBibG9jay5ocilcbiAgKCdoZWFkaW5nJywgYmxvY2suaGVhZGluZylcbiAgKCdsaGVhZGluZycsIGJsb2NrLmxoZWFkaW5nKVxuICAoJ2Jsb2NrcXVvdGUnLCBibG9jay5ibG9ja3F1b3RlKVxuICAoJ3RhZycsICc8JyArIGJsb2NrLl90YWcpXG4gICgnZGVmJywgYmxvY2suZGVmKVxuICAoKTtcblxuLyoqXG4gKiBOb3JtYWwgQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLm5vcm1hbCA9IG1lcmdlKHt9LCBibG9jayk7XG5cbi8qKlxuICogR0ZNIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay5nZm0gPSBtZXJnZSh7fSwgYmxvY2subm9ybWFsLCB7XG4gIGZlbmNlczogL14gKihgezMsfXx+ezMsfSlbIFxcLl0qKFxcUyspPyAqXFxuKFtcXHNcXFNdKj8pXFxzKlxcMSAqKD86XFxuK3wkKS8sXG4gIHBhcmFncmFwaDogL14vLFxuICBoZWFkaW5nOiAvXiAqKCN7MSw2fSkgKyhbXlxcbl0rPykgKiMqICooPzpcXG4rfCQpL1xufSk7XG5cbmJsb2NrLmdmbS5wYXJhZ3JhcGggPSByZXBsYWNlKGJsb2NrLnBhcmFncmFwaClcbiAgKCcoPyEnLCAnKD8hJ1xuICAgICsgYmxvY2suZ2ZtLmZlbmNlcy5zb3VyY2UucmVwbGFjZSgnXFxcXDEnLCAnXFxcXDInKSArICd8J1xuICAgICsgYmxvY2subGlzdC5zb3VyY2UucmVwbGFjZSgnXFxcXDEnLCAnXFxcXDMnKSArICd8JylcbiAgKCk7XG5cbi8qKlxuICogR0ZNICsgVGFibGVzIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay50YWJsZXMgPSBtZXJnZSh7fSwgYmxvY2suZ2ZtLCB7XG4gIG5wdGFibGU6IC9eICooXFxTLipcXHwuKilcXG4gKihbLTpdKyAqXFx8Wy18IDpdKilcXG4oKD86LipcXHwuKig/OlxcbnwkKSkqKVxcbiovLFxuICB0YWJsZTogL14gKlxcfCguKylcXG4gKlxcfCggKlstOl0rWy18IDpdKilcXG4oKD86ICpcXHwuKig/OlxcbnwkKSkqKVxcbiovXG59KTtcblxuLyoqXG4gKiBCbG9jayBMZXhlclxuICovXG5cbmZ1bmN0aW9uIExleGVyKG9wdGlvbnMpIHtcbiAgdGhpcy50b2tlbnMgPSBbXTtcbiAgdGhpcy50b2tlbnMubGlua3MgPSB7fTtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBtYXJrZWQuZGVmYXVsdHM7XG4gIHRoaXMucnVsZXMgPSBibG9jay5ub3JtYWw7XG5cbiAgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnRhYmxlcykge1xuICAgICAgdGhpcy5ydWxlcyA9IGJsb2NrLnRhYmxlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ydWxlcyA9IGJsb2NrLmdmbTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvc2UgQmxvY2sgUnVsZXNcbiAqL1xuXG5MZXhlci5ydWxlcyA9IGJsb2NrO1xuXG4vKipcbiAqIFN0YXRpYyBMZXggTWV0aG9kXG4gKi9cblxuTGV4ZXIubGV4ID0gZnVuY3Rpb24oc3JjLCBvcHRpb25zKSB7XG4gIHZhciBsZXhlciA9IG5ldyBMZXhlcihvcHRpb25zKTtcbiAgcmV0dXJuIGxleGVyLmxleChzcmMpO1xufTtcblxuLyoqXG4gKiBQcmVwcm9jZXNzaW5nXG4gKi9cblxuTGV4ZXIucHJvdG90eXBlLmxleCA9IGZ1bmN0aW9uKHNyYykge1xuICBzcmMgPSBzcmNcbiAgICAucmVwbGFjZSgvXFxyXFxufFxcci9nLCAnXFxuJylcbiAgICAucmVwbGFjZSgvXFx0L2csICcgICAgJylcbiAgICAucmVwbGFjZSgvXFx1MDBhMC9nLCAnICcpXG4gICAgLnJlcGxhY2UoL1xcdTI0MjQvZywgJ1xcbicpO1xuXG4gIHJldHVybiB0aGlzLnRva2VuKHNyYywgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIExleGluZ1xuICovXG5cbkxleGVyLnByb3RvdHlwZS50b2tlbiA9IGZ1bmN0aW9uKHNyYywgdG9wLCBicSkge1xuICB2YXIgc3JjID0gc3JjLnJlcGxhY2UoL14gKyQvZ20sICcnKVxuICAgICwgbmV4dFxuICAgICwgbG9vc2VcbiAgICAsIGNhcFxuICAgICwgYnVsbFxuICAgICwgYlxuICAgICwgaXRlbVxuICAgICwgc3BhY2VcbiAgICAsIGlcbiAgICAsIGw7XG5cbiAgd2hpbGUgKHNyYykge1xuICAgIC8vIG5ld2xpbmVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5uZXdsaW5lLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGlmIChjYXBbMF0ubGVuZ3RoID4gMSkge1xuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnc3BhY2UnXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNvZGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5jb2RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGNhcCA9IGNhcFswXS5yZXBsYWNlKC9eIHs0fS9nbSwgJycpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdjb2RlJyxcbiAgICAgICAgdGV4dDogIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICAgID8gY2FwLnJlcGxhY2UoL1xcbiskLywgJycpXG4gICAgICAgICAgOiBjYXBcbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZmVuY2VzIChnZm0pXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZmVuY2VzLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnY29kZScsXG4gICAgICAgIGxhbmc6IGNhcFsyXSxcbiAgICAgICAgdGV4dDogY2FwWzNdIHx8ICcnXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGhlYWRpbmdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5oZWFkaW5nLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaGVhZGluZycsXG4gICAgICAgIGRlcHRoOiBjYXBbMV0ubGVuZ3RoLFxuICAgICAgICB0ZXh0OiBjYXBbMl1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGFibGUgbm8gbGVhZGluZyBwaXBlIChnZm0pXG4gICAgaWYgKHRvcCAmJiAoY2FwID0gdGhpcy5ydWxlcy5ucHRhYmxlLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG5cbiAgICAgIGl0ZW0gPSB7XG4gICAgICAgIHR5cGU6ICd0YWJsZScsXG4gICAgICAgIGhlYWRlcjogY2FwWzFdLnJlcGxhY2UoL14gKnwgKlxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgYWxpZ246IGNhcFsyXS5yZXBsYWNlKC9eICp8XFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBjZWxsczogY2FwWzNdLnJlcGxhY2UoL1xcbiQvLCAnJykuc3BsaXQoJ1xcbicpXG4gICAgICB9O1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5hbGlnbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAncmlnaHQnO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdjZW50ZXInO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSsgKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2xlZnQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZW0uY2VsbHNbaV0gPSBpdGVtLmNlbGxzW2ldLnNwbGl0KC8gKlxcfCAqLyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goaXRlbSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxoZWFkaW5nXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubGhlYWRpbmcuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgZGVwdGg6IGNhcFsyXSA9PT0gJz0nID8gMSA6IDIsXG4gICAgICAgIHRleHQ6IGNhcFsxXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBoclxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmhyLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaHInXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGJsb2NrcXVvdGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5ibG9ja3F1b3RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdibG9ja3F1b3RlX3N0YXJ0J1xuICAgICAgfSk7XG5cbiAgICAgIGNhcCA9IGNhcFswXS5yZXBsYWNlKC9eICo+ID8vZ20sICcnKTtcblxuICAgICAgLy8gUGFzcyBgdG9wYCB0byBrZWVwIHRoZSBjdXJyZW50XG4gICAgICAvLyBcInRvcGxldmVsXCIgc3RhdGUuIFRoaXMgaXMgZXhhY3RseVxuICAgICAgLy8gaG93IG1hcmtkb3duLnBsIHdvcmtzLlxuICAgICAgdGhpcy50b2tlbihjYXAsIHRvcCwgdHJ1ZSk7XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnYmxvY2txdW90ZV9lbmQnXG4gICAgICB9KTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGlzdFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmxpc3QuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgYnVsbCA9IGNhcFsyXTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdsaXN0X3N0YXJ0JyxcbiAgICAgICAgb3JkZXJlZDogYnVsbC5sZW5ndGggPiAxXG4gICAgICB9KTtcblxuICAgICAgLy8gR2V0IGVhY2ggdG9wLWxldmVsIGl0ZW0uXG4gICAgICBjYXAgPSBjYXBbMF0ubWF0Y2godGhpcy5ydWxlcy5pdGVtKTtcblxuICAgICAgbmV4dCA9IGZhbHNlO1xuICAgICAgbCA9IGNhcC5sZW5ndGg7XG4gICAgICBpID0gMDtcblxuICAgICAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaXRlbSA9IGNhcFtpXTtcblxuICAgICAgICAvLyBSZW1vdmUgdGhlIGxpc3QgaXRlbSdzIGJ1bGxldFxuICAgICAgICAvLyBzbyBpdCBpcyBzZWVuIGFzIHRoZSBuZXh0IHRva2VuLlxuICAgICAgICBzcGFjZSA9IGl0ZW0ubGVuZ3RoO1xuICAgICAgICBpdGVtID0gaXRlbS5yZXBsYWNlKC9eICooWyorLV18XFxkK1xcLikgKy8sICcnKTtcblxuICAgICAgICAvLyBPdXRkZW50IHdoYXRldmVyIHRoZVxuICAgICAgICAvLyBsaXN0IGl0ZW0gY29udGFpbnMuIEhhY2t5LlxuICAgICAgICBpZiAofml0ZW0uaW5kZXhPZignXFxuICcpKSB7XG4gICAgICAgICAgc3BhY2UgLT0gaXRlbS5sZW5ndGg7XG4gICAgICAgICAgaXRlbSA9ICF0aGlzLm9wdGlvbnMucGVkYW50aWNcbiAgICAgICAgICAgID8gaXRlbS5yZXBsYWNlKG5ldyBSZWdFeHAoJ14gezEsJyArIHNwYWNlICsgJ30nLCAnZ20nKSwgJycpXG4gICAgICAgICAgICA6IGl0ZW0ucmVwbGFjZSgvXiB7MSw0fS9nbSwgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIG5leHQgbGlzdCBpdGVtIGJlbG9uZ3MgaGVyZS5cbiAgICAgICAgLy8gQmFja3BlZGFsIGlmIGl0IGRvZXMgbm90IGJlbG9uZyBpbiB0aGlzIGxpc3QuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc21hcnRMaXN0cyAmJiBpICE9PSBsIC0gMSkge1xuICAgICAgICAgIGIgPSBibG9jay5idWxsZXQuZXhlYyhjYXBbaSArIDFdKVswXTtcbiAgICAgICAgICBpZiAoYnVsbCAhPT0gYiAmJiAhKGJ1bGwubGVuZ3RoID4gMSAmJiBiLmxlbmd0aCA+IDEpKSB7XG4gICAgICAgICAgICBzcmMgPSBjYXAuc2xpY2UoaSArIDEpLmpvaW4oJ1xcbicpICsgc3JjO1xuICAgICAgICAgICAgaSA9IGwgLSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERldGVybWluZSB3aGV0aGVyIGl0ZW0gaXMgbG9vc2Ugb3Igbm90LlxuICAgICAgICAvLyBVc2U6IC8oXnxcXG4pKD8hIClbXlxcbl0rXFxuXFxuKD8hXFxzKiQpL1xuICAgICAgICAvLyBmb3IgZGlzY291bnQgYmVoYXZpb3IuXG4gICAgICAgIGxvb3NlID0gbmV4dCB8fCAvXFxuXFxuKD8hXFxzKiQpLy50ZXN0KGl0ZW0pO1xuICAgICAgICBpZiAoaSAhPT0gbCAtIDEpIHtcbiAgICAgICAgICBuZXh0ID0gaXRlbS5jaGFyQXQoaXRlbS5sZW5ndGggLSAxKSA9PT0gJ1xcbic7XG4gICAgICAgICAgaWYgKCFsb29zZSkgbG9vc2UgPSBuZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgICAgdHlwZTogbG9vc2VcbiAgICAgICAgICAgID8gJ2xvb3NlX2l0ZW1fc3RhcnQnXG4gICAgICAgICAgICA6ICdsaXN0X2l0ZW1fc3RhcnQnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJlY3Vyc2UuXG4gICAgICAgIHRoaXMudG9rZW4oaXRlbSwgZmFsc2UsIGJxKTtcblxuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnbGlzdF9pdGVtX2VuZCdcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnbGlzdF9lbmQnXG4gICAgICB9KTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gaHRtbFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmh0bWwuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICAgID8gJ3BhcmFncmFwaCdcbiAgICAgICAgICA6ICdodG1sJyxcbiAgICAgICAgcHJlOiAhdGhpcy5vcHRpb25zLnNhbml0aXplclxuICAgICAgICAgICYmIChjYXBbMV0gPT09ICdwcmUnIHx8IGNhcFsxXSA9PT0gJ3NjcmlwdCcgfHwgY2FwWzFdID09PSAnc3R5bGUnKSxcbiAgICAgICAgdGV4dDogY2FwWzBdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGRlZlxuICAgIGlmICgoIWJxICYmIHRvcCkgJiYgKGNhcCA9IHRoaXMucnVsZXMuZGVmLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5saW5rc1tjYXBbMV0udG9Mb3dlckNhc2UoKV0gPSB7XG4gICAgICAgIGhyZWY6IGNhcFsyXSxcbiAgICAgICAgdGl0bGU6IGNhcFszXVxuICAgICAgfTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRhYmxlIChnZm0pXG4gICAgaWYgKHRvcCAmJiAoY2FwID0gdGhpcy5ydWxlcy50YWJsZS5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuXG4gICAgICBpdGVtID0ge1xuICAgICAgICB0eXBlOiAndGFibGUnLFxuICAgICAgICBoZWFkZXI6IGNhcFsxXS5yZXBsYWNlKC9eICp8ICpcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGFsaWduOiBjYXBbMl0ucmVwbGFjZSgvXiAqfFxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgY2VsbHM6IGNhcFszXS5yZXBsYWNlKC8oPzogKlxcfCAqKT9cXG4kLywgJycpLnNwbGl0KCdcXG4nKVxuICAgICAgfTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uYWxpZ24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKC9eICotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ3JpZ2h0JztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnY2VudGVyJztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdsZWZ0JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5jZWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVtLmNlbGxzW2ldID0gaXRlbS5jZWxsc1tpXVxuICAgICAgICAgIC5yZXBsYWNlKC9eICpcXHwgKnwgKlxcfCAqJC9nLCAnJylcbiAgICAgICAgICAuc3BsaXQoLyAqXFx8ICovKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b2tlbnMucHVzaChpdGVtKTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdG9wLWxldmVsIHBhcmFncmFwaFxuICAgIGlmICh0b3AgJiYgKGNhcCA9IHRoaXMucnVsZXMucGFyYWdyYXBoLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ3BhcmFncmFwaCcsXG4gICAgICAgIHRleHQ6IGNhcFsxXS5jaGFyQXQoY2FwWzFdLmxlbmd0aCAtIDEpID09PSAnXFxuJ1xuICAgICAgICAgID8gY2FwWzFdLnNsaWNlKDAsIC0xKVxuICAgICAgICAgIDogY2FwWzFdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRleHRcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy50ZXh0LmV4ZWMoc3JjKSkge1xuICAgICAgLy8gVG9wLWxldmVsIHNob3VsZCBuZXZlciByZWFjaCBoZXJlLlxuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIHRleHQ6IGNhcFswXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoc3JjKSB7XG4gICAgICB0aHJvdyBuZXdcbiAgICAgICAgRXJyb3IoJ0luZmluaXRlIGxvb3Agb24gYnl0ZTogJyArIHNyYy5jaGFyQ29kZUF0KDApKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcy50b2tlbnM7XG59O1xuXG4vKipcbiAqIElubGluZS1MZXZlbCBHcmFtbWFyXG4gKi9cblxudmFyIGlubGluZSA9IHtcbiAgZXNjYXBlOiAvXlxcXFwoW1xcXFxgKnt9XFxbXFxdKCkjK1xcLS4hXz5dKS8sXG4gIGF1dG9saW5rOiAvXjwoW14gPl0rKEB8OlxcLylbXiA+XSspPi8sXG4gIHVybDogbm9vcCxcbiAgdGFnOiAvXjwhLS1bXFxzXFxTXSo/LS0+fF48XFwvP1xcdysoPzpcIlteXCJdKlwifCdbXiddKid8W14nXCI+XSkqPz4vLFxuICBsaW5rOiAvXiE/XFxbKGluc2lkZSlcXF1cXChocmVmXFwpLyxcbiAgcmVmbGluazogL14hP1xcWyhpbnNpZGUpXFxdXFxzKlxcWyhbXlxcXV0qKVxcXS8sXG4gIG5vbGluazogL14hP1xcWygoPzpcXFtbXlxcXV0qXFxdfFteXFxbXFxdXSkqKVxcXS8sXG4gIHN0cm9uZzogL15fXyhbXFxzXFxTXSs/KV9fKD8hXyl8XlxcKlxcKihbXFxzXFxTXSs/KVxcKlxcKig/IVxcKikvLFxuICBlbTogL15cXGJfKCg/OlteX118X18pKz8pX1xcYnxeXFwqKCg/OlxcKlxcKnxbXFxzXFxTXSkrPylcXCooPyFcXCopLyxcbiAgY29kZTogL14oYCspXFxzKihbXFxzXFxTXSo/W15gXSlcXHMqXFwxKD8hYCkvLFxuICBicjogL14gezIsfVxcbig/IVxccyokKS8sXG4gIGRlbDogbm9vcCxcbiAgdGV4dDogL15bXFxzXFxTXSs/KD89W1xcXFw8IVxcW18qYF18IHsyLH1cXG58JCkvXG59O1xuXG5pbmxpbmUuX2luc2lkZSA9IC8oPzpcXFtbXlxcXV0qXFxdfFteXFxbXFxdXXxcXF0oPz1bXlxcW10qXFxdKSkqLztcbmlubGluZS5faHJlZiA9IC9cXHMqPD8oW1xcc1xcU10qPyk+Pyg/OlxccytbJ1wiXShbXFxzXFxTXSo/KVsnXCJdKT9cXHMqLztcblxuaW5saW5lLmxpbmsgPSByZXBsYWNlKGlubGluZS5saW5rKVxuICAoJ2luc2lkZScsIGlubGluZS5faW5zaWRlKVxuICAoJ2hyZWYnLCBpbmxpbmUuX2hyZWYpXG4gICgpO1xuXG5pbmxpbmUucmVmbGluayA9IHJlcGxhY2UoaW5saW5lLnJlZmxpbmspXG4gICgnaW5zaWRlJywgaW5saW5lLl9pbnNpZGUpXG4gICgpO1xuXG4vKipcbiAqIE5vcm1hbCBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5ub3JtYWwgPSBtZXJnZSh7fSwgaW5saW5lKTtcblxuLyoqXG4gKiBQZWRhbnRpYyBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5wZWRhbnRpYyA9IG1lcmdlKHt9LCBpbmxpbmUubm9ybWFsLCB7XG4gIHN0cm9uZzogL15fXyg/PVxcUykoW1xcc1xcU10qP1xcUylfXyg/IV8pfF5cXCpcXCooPz1cXFMpKFtcXHNcXFNdKj9cXFMpXFwqXFwqKD8hXFwqKS8sXG4gIGVtOiAvXl8oPz1cXFMpKFtcXHNcXFNdKj9cXFMpXyg/IV8pfF5cXCooPz1cXFMpKFtcXHNcXFNdKj9cXFMpXFwqKD8hXFwqKS9cbn0pO1xuXG4vKipcbiAqIEdGTSBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5nZm0gPSBtZXJnZSh7fSwgaW5saW5lLm5vcm1hbCwge1xuICBlc2NhcGU6IHJlcGxhY2UoaW5saW5lLmVzY2FwZSkoJ10pJywgJ358XSknKSgpLFxuICB1cmw6IC9eKGh0dHBzPzpcXC9cXC9bXlxcczxdK1tePC4sOjtcIicpXFxdXFxzXSkvLFxuICBkZWw6IC9efn4oPz1cXFMpKFtcXHNcXFNdKj9cXFMpfn4vLFxuICB0ZXh0OiByZXBsYWNlKGlubGluZS50ZXh0KVxuICAgICgnXXwnLCAnfl18JylcbiAgICAoJ3wnLCAnfGh0dHBzPzovL3wnKVxuICAgICgpXG59KTtcblxuLyoqXG4gKiBHRk0gKyBMaW5lIEJyZWFrcyBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5icmVha3MgPSBtZXJnZSh7fSwgaW5saW5lLmdmbSwge1xuICBicjogcmVwbGFjZShpbmxpbmUuYnIpKCd7Mix9JywgJyonKSgpLFxuICB0ZXh0OiByZXBsYWNlKGlubGluZS5nZm0udGV4dCkoJ3syLH0nLCAnKicpKClcbn0pO1xuXG4vKipcbiAqIElubGluZSBMZXhlciAmIENvbXBpbGVyXG4gKi9cblxuZnVuY3Rpb24gSW5saW5lTGV4ZXIobGlua3MsIG9wdGlvbnMpIHtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBtYXJrZWQuZGVmYXVsdHM7XG4gIHRoaXMubGlua3MgPSBsaW5rcztcbiAgdGhpcy5ydWxlcyA9IGlubGluZS5ub3JtYWw7XG4gIHRoaXMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXIgfHwgbmV3IFJlbmRlcmVyO1xuICB0aGlzLnJlbmRlcmVyLm9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgaWYgKCF0aGlzLmxpbmtzKSB7XG4gICAgdGhyb3cgbmV3XG4gICAgICBFcnJvcignVG9rZW5zIGFycmF5IHJlcXVpcmVzIGEgYGxpbmtzYCBwcm9wZXJ0eS4nKTtcbiAgfVxuXG4gIGlmICh0aGlzLm9wdGlvbnMuZ2ZtKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5icmVha3MpIHtcbiAgICAgIHRoaXMucnVsZXMgPSBpbmxpbmUuYnJlYWtzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJ1bGVzID0gaW5saW5lLmdmbTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgdGhpcy5ydWxlcyA9IGlubGluZS5wZWRhbnRpYztcbiAgfVxufVxuXG4vKipcbiAqIEV4cG9zZSBJbmxpbmUgUnVsZXNcbiAqL1xuXG5JbmxpbmVMZXhlci5ydWxlcyA9IGlubGluZTtcblxuLyoqXG4gKiBTdGF0aWMgTGV4aW5nL0NvbXBpbGluZyBNZXRob2RcbiAqL1xuXG5JbmxpbmVMZXhlci5vdXRwdXQgPSBmdW5jdGlvbihzcmMsIGxpbmtzLCBvcHRpb25zKSB7XG4gIHZhciBpbmxpbmUgPSBuZXcgSW5saW5lTGV4ZXIobGlua3MsIG9wdGlvbnMpO1xuICByZXR1cm4gaW5saW5lLm91dHB1dChzcmMpO1xufTtcblxuLyoqXG4gKiBMZXhpbmcvQ29tcGlsaW5nXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLm91dHB1dCA9IGZ1bmN0aW9uKHNyYykge1xuICB2YXIgb3V0ID0gJydcbiAgICAsIGxpbmtcbiAgICAsIHRleHRcbiAgICAsIGhyZWZcbiAgICAsIGNhcDtcblxuICB3aGlsZSAoc3JjKSB7XG4gICAgLy8gZXNjYXBlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZXNjYXBlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSBjYXBbMV07XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBhdXRvbGlua1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmF1dG9saW5rLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGlmIChjYXBbMl0gPT09ICdAJykge1xuICAgICAgICB0ZXh0ID0gY2FwWzFdLmNoYXJBdCg2KSA9PT0gJzonXG4gICAgICAgICAgPyB0aGlzLm1hbmdsZShjYXBbMV0uc3Vic3RyaW5nKDcpKVxuICAgICAgICAgIDogdGhpcy5tYW5nbGUoY2FwWzFdKTtcbiAgICAgICAgaHJlZiA9IHRoaXMubWFuZ2xlKCdtYWlsdG86JykgKyB0ZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMV0pO1xuICAgICAgICBocmVmID0gdGV4dDtcbiAgICAgIH1cbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmxpbmsoaHJlZiwgbnVsbCwgdGV4dCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB1cmwgKGdmbSlcbiAgICBpZiAoIXRoaXMuaW5MaW5rICYmIChjYXAgPSB0aGlzLnJ1bGVzLnVybC5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMV0pO1xuICAgICAgaHJlZiA9IHRleHQ7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5saW5rKGhyZWYsIG51bGwsIHRleHQpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGFnXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMudGFnLmV4ZWMoc3JjKSkge1xuICAgICAgaWYgKCF0aGlzLmluTGluayAmJiAvXjxhIC9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICB0aGlzLmluTGluayA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaW5MaW5rICYmIC9ePFxcL2E+L2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMuaW5MaW5rID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICA/IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXJcbiAgICAgICAgICA/IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXIoY2FwWzBdKVxuICAgICAgICAgIDogZXNjYXBlKGNhcFswXSlcbiAgICAgICAgOiBjYXBbMF1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxpbmtcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5saW5rLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMuaW5MaW5rID0gdHJ1ZTtcbiAgICAgIG91dCArPSB0aGlzLm91dHB1dExpbmsoY2FwLCB7XG4gICAgICAgIGhyZWY6IGNhcFsyXSxcbiAgICAgICAgdGl0bGU6IGNhcFszXVxuICAgICAgfSk7XG4gICAgICB0aGlzLmluTGluayA9IGZhbHNlO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gcmVmbGluaywgbm9saW5rXG4gICAgaWYgKChjYXAgPSB0aGlzLnJ1bGVzLnJlZmxpbmsuZXhlYyhzcmMpKVxuICAgICAgICB8fCAoY2FwID0gdGhpcy5ydWxlcy5ub2xpbmsuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGxpbmsgPSAoY2FwWzJdIHx8IGNhcFsxXSkucmVwbGFjZSgvXFxzKy9nLCAnICcpO1xuICAgICAgbGluayA9IHRoaXMubGlua3NbbGluay50b0xvd2VyQ2FzZSgpXTtcbiAgICAgIGlmICghbGluayB8fCAhbGluay5ocmVmKSB7XG4gICAgICAgIG91dCArPSBjYXBbMF0uY2hhckF0KDApO1xuICAgICAgICBzcmMgPSBjYXBbMF0uc3Vic3RyaW5nKDEpICsgc3JjO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaW5MaW5rID0gdHJ1ZTtcbiAgICAgIG91dCArPSB0aGlzLm91dHB1dExpbmsoY2FwLCBsaW5rKTtcbiAgICAgIHRoaXMuaW5MaW5rID0gZmFsc2U7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBzdHJvbmdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5zdHJvbmcuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuc3Ryb25nKHRoaXMub3V0cHV0KGNhcFsyXSB8fCBjYXBbMV0pKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGVtXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZW0uZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuZW0odGhpcy5vdXRwdXQoY2FwWzJdIHx8IGNhcFsxXSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gY29kZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmNvZGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuY29kZXNwYW4oZXNjYXBlKGNhcFsyXSwgdHJ1ZSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gYnJcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5ici5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5icigpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZGVsIChnZm0pXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZGVsLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmRlbCh0aGlzLm91dHB1dChjYXBbMV0pKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRleHRcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy50ZXh0LmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnRleHQoZXNjYXBlKHRoaXMuc21hcnR5cGFudHMoY2FwWzBdKSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHNyYykge1xuICAgICAgdGhyb3cgbmV3XG4gICAgICAgIEVycm9yKCdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29tcGlsZSBMaW5rXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLm91dHB1dExpbmsgPSBmdW5jdGlvbihjYXAsIGxpbmspIHtcbiAgdmFyIGhyZWYgPSBlc2NhcGUobGluay5ocmVmKVxuICAgICwgdGl0bGUgPSBsaW5rLnRpdGxlID8gZXNjYXBlKGxpbmsudGl0bGUpIDogbnVsbDtcblxuICByZXR1cm4gY2FwWzBdLmNoYXJBdCgwKSAhPT0gJyEnXG4gICAgPyB0aGlzLnJlbmRlcmVyLmxpbmsoaHJlZiwgdGl0bGUsIHRoaXMub3V0cHV0KGNhcFsxXSkpXG4gICAgOiB0aGlzLnJlbmRlcmVyLmltYWdlKGhyZWYsIHRpdGxlLCBlc2NhcGUoY2FwWzFdKSk7XG59O1xuXG4vKipcbiAqIFNtYXJ0eXBhbnRzIFRyYW5zZm9ybWF0aW9uc1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5zbWFydHlwYW50cyA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgaWYgKCF0aGlzLm9wdGlvbnMuc21hcnR5cGFudHMpIHJldHVybiB0ZXh0O1xuICByZXR1cm4gdGV4dFxuICAgIC8vIGVtLWRhc2hlc1xuICAgIC5yZXBsYWNlKC8tLS0vZywgJ1xcdTIwMTQnKVxuICAgIC8vIGVuLWRhc2hlc1xuICAgIC5yZXBsYWNlKC8tLS9nLCAnXFx1MjAxMycpXG4gICAgLy8gb3BlbmluZyBzaW5nbGVzXG4gICAgLnJlcGxhY2UoLyhefFstXFx1MjAxNC8oXFxbe1wiXFxzXSknL2csICckMVxcdTIwMTgnKVxuICAgIC8vIGNsb3Npbmcgc2luZ2xlcyAmIGFwb3N0cm9waGVzXG4gICAgLnJlcGxhY2UoLycvZywgJ1xcdTIwMTknKVxuICAgIC8vIG9wZW5pbmcgZG91Ymxlc1xuICAgIC5yZXBsYWNlKC8oXnxbLVxcdTIwMTQvKFxcW3tcXHUyMDE4XFxzXSlcIi9nLCAnJDFcXHUyMDFjJylcbiAgICAvLyBjbG9zaW5nIGRvdWJsZXNcbiAgICAucmVwbGFjZSgvXCIvZywgJ1xcdTIwMWQnKVxuICAgIC8vIGVsbGlwc2VzXG4gICAgLnJlcGxhY2UoL1xcLnszfS9nLCAnXFx1MjAyNicpO1xufTtcblxuLyoqXG4gKiBNYW5nbGUgTGlua3NcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUubWFuZ2xlID0gZnVuY3Rpb24odGV4dCkge1xuICBpZiAoIXRoaXMub3B0aW9ucy5tYW5nbGUpIHJldHVybiB0ZXh0O1xuICB2YXIgb3V0ID0gJydcbiAgICAsIGwgPSB0ZXh0Lmxlbmd0aFxuICAgICwgaSA9IDBcbiAgICAsIGNoO1xuXG4gIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgY2ggPSB0ZXh0LmNoYXJDb2RlQXQoaSk7XG4gICAgaWYgKE1hdGgucmFuZG9tKCkgPiAwLjUpIHtcbiAgICAgIGNoID0gJ3gnICsgY2gudG9TdHJpbmcoMTYpO1xuICAgIH1cbiAgICBvdXQgKz0gJyYjJyArIGNoICsgJzsnO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmVuZGVyZXJcbiAqL1xuXG5mdW5jdGlvbiBSZW5kZXJlcihvcHRpb25zKSB7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG59XG5cblJlbmRlcmVyLnByb3RvdHlwZS5jb2RlID0gZnVuY3Rpb24oY29kZSwgbGFuZywgZXNjYXBlZCkge1xuICBpZiAodGhpcy5vcHRpb25zLmhpZ2hsaWdodCkge1xuICAgIHZhciBvdXQgPSB0aGlzLm9wdGlvbnMuaGlnaGxpZ2h0KGNvZGUsIGxhbmcpO1xuICAgIGlmIChvdXQgIT0gbnVsbCAmJiBvdXQgIT09IGNvZGUpIHtcbiAgICAgIGVzY2FwZWQgPSB0cnVlO1xuICAgICAgY29kZSA9IG91dDtcbiAgICB9XG4gIH1cblxuICBpZiAoIWxhbmcpIHtcbiAgICByZXR1cm4gJzxwcmU+PGNvZGU+J1xuICAgICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUoY29kZSwgdHJ1ZSkpXG4gICAgICArICdcXG48L2NvZGU+PC9wcmU+JztcbiAgfVxuXG4gIHJldHVybiAnPHByZT48Y29kZSBjbGFzcz1cIidcbiAgICArIHRoaXMub3B0aW9ucy5sYW5nUHJlZml4XG4gICAgKyBlc2NhcGUobGFuZywgdHJ1ZSlcbiAgICArICdcIj4nXG4gICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUoY29kZSwgdHJ1ZSkpXG4gICAgKyAnXFxuPC9jb2RlPjwvcHJlPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuYmxvY2txdW90ZSA9IGZ1bmN0aW9uKHF1b3RlKSB7XG4gIHJldHVybiAnPGJsb2NrcXVvdGU+XFxuJyArIHF1b3RlICsgJzwvYmxvY2txdW90ZT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmh0bWwgPSBmdW5jdGlvbihodG1sKSB7XG4gIHJldHVybiBodG1sO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmhlYWRpbmcgPSBmdW5jdGlvbih0ZXh0LCBsZXZlbCwgcmF3KSB7XG4gIHJldHVybiAnPGgnXG4gICAgKyBsZXZlbFxuICAgICsgJyBpZD1cIidcbiAgICArIHRoaXMub3B0aW9ucy5oZWFkZXJQcmVmaXhcbiAgICArIHJhdy50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teXFx3XSsvZywgJy0nKVxuICAgICsgJ1wiPidcbiAgICArIHRleHRcbiAgICArICc8L2gnXG4gICAgKyBsZXZlbFxuICAgICsgJz5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmhyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm9wdGlvbnMueGh0bWwgPyAnPGhyLz5cXG4nIDogJzxocj5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmxpc3QgPSBmdW5jdGlvbihib2R5LCBvcmRlcmVkKSB7XG4gIHZhciB0eXBlID0gb3JkZXJlZCA/ICdvbCcgOiAndWwnO1xuICByZXR1cm4gJzwnICsgdHlwZSArICc+XFxuJyArIGJvZHkgKyAnPC8nICsgdHlwZSArICc+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5saXN0aXRlbSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8bGk+JyArIHRleHQgKyAnPC9saT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnBhcmFncmFwaCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8cD4nICsgdGV4dCArICc8L3A+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50YWJsZSA9IGZ1bmN0aW9uKGhlYWRlciwgYm9keSkge1xuICByZXR1cm4gJzx0YWJsZT5cXG4nXG4gICAgKyAnPHRoZWFkPlxcbidcbiAgICArIGhlYWRlclxuICAgICsgJzwvdGhlYWQ+XFxuJ1xuICAgICsgJzx0Ym9keT5cXG4nXG4gICAgKyBib2R5XG4gICAgKyAnPC90Ym9keT5cXG4nXG4gICAgKyAnPC90YWJsZT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRhYmxlcm93ID0gZnVuY3Rpb24oY29udGVudCkge1xuICByZXR1cm4gJzx0cj5cXG4nICsgY29udGVudCArICc8L3RyPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGFibGVjZWxsID0gZnVuY3Rpb24oY29udGVudCwgZmxhZ3MpIHtcbiAgdmFyIHR5cGUgPSBmbGFncy5oZWFkZXIgPyAndGgnIDogJ3RkJztcbiAgdmFyIHRhZyA9IGZsYWdzLmFsaWduXG4gICAgPyAnPCcgKyB0eXBlICsgJyBzdHlsZT1cInRleHQtYWxpZ246JyArIGZsYWdzLmFsaWduICsgJ1wiPidcbiAgICA6ICc8JyArIHR5cGUgKyAnPic7XG4gIHJldHVybiB0YWcgKyBjb250ZW50ICsgJzwvJyArIHR5cGUgKyAnPlxcbic7XG59O1xuXG4vLyBzcGFuIGxldmVsIHJlbmRlcmVyXG5SZW5kZXJlci5wcm90b3R5cGUuc3Ryb25nID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxzdHJvbmc+JyArIHRleHQgKyAnPC9zdHJvbmc+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5lbSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8ZW0+JyArIHRleHQgKyAnPC9lbT4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmNvZGVzcGFuID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxjb2RlPicgKyB0ZXh0ICsgJzwvY29kZT4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmJyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm9wdGlvbnMueGh0bWwgPyAnPGJyLz4nIDogJzxicj4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmRlbCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8ZGVsPicgKyB0ZXh0ICsgJzwvZGVsPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUubGluayA9IGZ1bmN0aW9uKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gIGlmICh0aGlzLm9wdGlvbnMuc2FuaXRpemUpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHByb3QgPSBkZWNvZGVVUklDb21wb25lbnQodW5lc2NhcGUoaHJlZikpXG4gICAgICAgIC5yZXBsYWNlKC9bXlxcdzpdL2csICcnKVxuICAgICAgICAudG9Mb3dlckNhc2UoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGlmIChwcm90LmluZGV4T2YoJ2phdmFzY3JpcHQ6JykgPT09IDAgfHwgcHJvdC5pbmRleE9mKCd2YnNjcmlwdDonKSA9PT0gMCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgfVxuICB2YXIgb3V0ID0gJzxhIGhyZWY9XCInICsgaHJlZiArICdcIic7XG4gIGlmICh0aXRsZSkge1xuICAgIG91dCArPSAnIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiJztcbiAgfVxuICBvdXQgKz0gJz4nICsgdGV4dCArICc8L2E+JztcbiAgcmV0dXJuIG91dDtcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5pbWFnZSA9IGZ1bmN0aW9uKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gIHZhciBvdXQgPSAnPGltZyBzcmM9XCInICsgaHJlZiArICdcIiBhbHQ9XCInICsgdGV4dCArICdcIic7XG4gIGlmICh0aXRsZSkge1xuICAgIG91dCArPSAnIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiJztcbiAgfVxuICBvdXQgKz0gdGhpcy5vcHRpb25zLnhodG1sID8gJy8+JyA6ICc+JztcbiAgcmV0dXJuIG91dDtcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50ZXh0ID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gdGV4dDtcbn07XG5cbi8qKlxuICogUGFyc2luZyAmIENvbXBpbGluZ1xuICovXG5cbmZ1bmN0aW9uIFBhcnNlcihvcHRpb25zKSB7XG4gIHRoaXMudG9rZW5zID0gW107XG4gIHRoaXMudG9rZW4gPSBudWxsO1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IG1hcmtlZC5kZWZhdWx0cztcbiAgdGhpcy5vcHRpb25zLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyIHx8IG5ldyBSZW5kZXJlcjtcbiAgdGhpcy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlcjtcbiAgdGhpcy5yZW5kZXJlci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xufVxuXG4vKipcbiAqIFN0YXRpYyBQYXJzZSBNZXRob2RcbiAqL1xuXG5QYXJzZXIucGFyc2UgPSBmdW5jdGlvbihzcmMsIG9wdGlvbnMsIHJlbmRlcmVyKSB7XG4gIHZhciBwYXJzZXIgPSBuZXcgUGFyc2VyKG9wdGlvbnMsIHJlbmRlcmVyKTtcbiAgcmV0dXJuIHBhcnNlci5wYXJzZShzcmMpO1xufTtcblxuLyoqXG4gKiBQYXJzZSBMb29wXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKHNyYykge1xuICB0aGlzLmlubGluZSA9IG5ldyBJbmxpbmVMZXhlcihzcmMubGlua3MsIHRoaXMub3B0aW9ucywgdGhpcy5yZW5kZXJlcik7XG4gIHRoaXMudG9rZW5zID0gc3JjLnJldmVyc2UoKTtcblxuICB2YXIgb3V0ID0gJyc7XG4gIHdoaWxlICh0aGlzLm5leHQoKSkge1xuICAgIG91dCArPSB0aGlzLnRvaygpO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogTmV4dCBUb2tlblxuICovXG5cblBhcnNlci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy50b2tlbiA9IHRoaXMudG9rZW5zLnBvcCgpO1xufTtcblxuLyoqXG4gKiBQcmV2aWV3IE5leHQgVG9rZW5cbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudG9rZW5zW3RoaXMudG9rZW5zLmxlbmd0aCAtIDFdIHx8IDA7XG59O1xuXG4vKipcbiAqIFBhcnNlIFRleHQgVG9rZW5zXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5wYXJzZVRleHQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGJvZHkgPSB0aGlzLnRva2VuLnRleHQ7XG5cbiAgd2hpbGUgKHRoaXMucGVlaygpLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgIGJvZHkgKz0gJ1xcbicgKyB0aGlzLm5leHQoKS50ZXh0O1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuaW5saW5lLm91dHB1dChib2R5KTtcbn07XG5cbi8qKlxuICogUGFyc2UgQ3VycmVudCBUb2tlblxuICovXG5cblBhcnNlci5wcm90b3R5cGUudG9rID0gZnVuY3Rpb24oKSB7XG4gIHN3aXRjaCAodGhpcy50b2tlbi50eXBlKSB7XG4gICAgY2FzZSAnc3BhY2UnOiB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGNhc2UgJ2hyJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuaHIoKTtcbiAgICB9XG4gICAgY2FzZSAnaGVhZGluZyc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmhlYWRpbmcoXG4gICAgICAgIHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLnRleHQpLFxuICAgICAgICB0aGlzLnRva2VuLmRlcHRoLFxuICAgICAgICB0aGlzLnRva2VuLnRleHQpO1xuICAgIH1cbiAgICBjYXNlICdjb2RlJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuY29kZSh0aGlzLnRva2VuLnRleHQsXG4gICAgICAgIHRoaXMudG9rZW4ubGFuZyxcbiAgICAgICAgdGhpcy50b2tlbi5lc2NhcGVkKTtcbiAgICB9XG4gICAgY2FzZSAndGFibGUnOiB7XG4gICAgICB2YXIgaGVhZGVyID0gJydcbiAgICAgICAgLCBib2R5ID0gJydcbiAgICAgICAgLCBpXG4gICAgICAgICwgcm93XG4gICAgICAgICwgY2VsbFxuICAgICAgICAsIGZsYWdzXG4gICAgICAgICwgajtcblxuICAgICAgLy8gaGVhZGVyXG4gICAgICBjZWxsID0gJyc7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy50b2tlbi5oZWFkZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZmxhZ3MgPSB7IGhlYWRlcjogdHJ1ZSwgYWxpZ246IHRoaXMudG9rZW4uYWxpZ25baV0gfTtcbiAgICAgICAgY2VsbCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlY2VsbChcbiAgICAgICAgICB0aGlzLmlubGluZS5vdXRwdXQodGhpcy50b2tlbi5oZWFkZXJbaV0pLFxuICAgICAgICAgIHsgaGVhZGVyOiB0cnVlLCBhbGlnbjogdGhpcy50b2tlbi5hbGlnbltpXSB9XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBoZWFkZXIgKz0gdGhpcy5yZW5kZXJlci50YWJsZXJvdyhjZWxsKTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMudG9rZW4uY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcm93ID0gdGhpcy50b2tlbi5jZWxsc1tpXTtcblxuICAgICAgICBjZWxsID0gJyc7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCByb3cubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBjZWxsICs9IHRoaXMucmVuZGVyZXIudGFibGVjZWxsKFxuICAgICAgICAgICAgdGhpcy5pbmxpbmUub3V0cHV0KHJvd1tqXSksXG4gICAgICAgICAgICB7IGhlYWRlcjogZmFsc2UsIGFsaWduOiB0aGlzLnRva2VuLmFsaWduW2pdIH1cbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgYm9keSArPSB0aGlzLnJlbmRlcmVyLnRhYmxlcm93KGNlbGwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIudGFibGUoaGVhZGVyLCBib2R5KTtcbiAgICB9XG4gICAgY2FzZSAnYmxvY2txdW90ZV9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJyc7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnYmxvY2txdW90ZV9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuYmxvY2txdW90ZShib2R5KTtcbiAgICB9XG4gICAgY2FzZSAnbGlzdF9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJydcbiAgICAgICAgLCBvcmRlcmVkID0gdGhpcy50b2tlbi5vcmRlcmVkO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2xpc3RfZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3QoYm9keSwgb3JkZXJlZCk7XG4gICAgfVxuICAgIGNhc2UgJ2xpc3RfaXRlbV9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJyc7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnbGlzdF9pdGVtX2VuZCcpIHtcbiAgICAgICAgYm9keSArPSB0aGlzLnRva2VuLnR5cGUgPT09ICd0ZXh0J1xuICAgICAgICAgID8gdGhpcy5wYXJzZVRleHQoKVxuICAgICAgICAgIDogdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIubGlzdGl0ZW0oYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2xvb3NlX2l0ZW1fc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2xpc3RfaXRlbV9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIubGlzdGl0ZW0oYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2h0bWwnOiB7XG4gICAgICB2YXIgaHRtbCA9ICF0aGlzLnRva2VuLnByZSAmJiAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgID8gdGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4udGV4dClcbiAgICAgICAgOiB0aGlzLnRva2VuLnRleHQ7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5odG1sKGh0bWwpO1xuICAgIH1cbiAgICBjYXNlICdwYXJhZ3JhcGgnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5wYXJhZ3JhcGgodGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4udGV4dCkpO1xuICAgIH1cbiAgICBjYXNlICd0ZXh0Jzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHRoaXMucGFyc2VUZXh0KCkpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBIZWxwZXJzXG4gKi9cblxuZnVuY3Rpb24gZXNjYXBlKGh0bWwsIGVuY29kZSkge1xuICByZXR1cm4gaHRtbFxuICAgIC5yZXBsYWNlKCFlbmNvZGUgPyAvJig/ISM/XFx3KzspL2cgOiAvJi9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgIC5yZXBsYWNlKC8nL2csICcmIzM5OycpO1xufVxuXG5mdW5jdGlvbiB1bmVzY2FwZShodG1sKSB7XG5cdC8vIGV4cGxpY2l0bHkgbWF0Y2ggZGVjaW1hbCwgaGV4LCBhbmQgbmFtZWQgSFRNTCBlbnRpdGllcyBcbiAgcmV0dXJuIGh0bWwucmVwbGFjZSgvJigjKD86XFxkKyl8KD86I3hbMC05QS1GYS1mXSspfCg/OlxcdyspKTs/L2csIGZ1bmN0aW9uKF8sIG4pIHtcbiAgICBuID0gbi50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChuID09PSAnY29sb24nKSByZXR1cm4gJzonO1xuICAgIGlmIChuLmNoYXJBdCgwKSA9PT0gJyMnKSB7XG4gICAgICByZXR1cm4gbi5jaGFyQXQoMSkgPT09ICd4J1xuICAgICAgICA/IFN0cmluZy5mcm9tQ2hhckNvZGUocGFyc2VJbnQobi5zdWJzdHJpbmcoMiksIDE2KSlcbiAgICAgICAgOiBTdHJpbmcuZnJvbUNoYXJDb2RlKCtuLnN1YnN0cmluZygxKSk7XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2UocmVnZXgsIG9wdCkge1xuICByZWdleCA9IHJlZ2V4LnNvdXJjZTtcbiAgb3B0ID0gb3B0IHx8ICcnO1xuICByZXR1cm4gZnVuY3Rpb24gc2VsZihuYW1lLCB2YWwpIHtcbiAgICBpZiAoIW5hbWUpIHJldHVybiBuZXcgUmVnRXhwKHJlZ2V4LCBvcHQpO1xuICAgIHZhbCA9IHZhbC5zb3VyY2UgfHwgdmFsO1xuICAgIHZhbCA9IHZhbC5yZXBsYWNlKC8oXnxbXlxcW10pXFxeL2csICckMScpO1xuICAgIHJlZ2V4ID0gcmVnZXgucmVwbGFjZShuYW1lLCB2YWwpO1xuICAgIHJldHVybiBzZWxmO1xuICB9O1xufVxuXG5mdW5jdGlvbiBub29wKCkge31cbm5vb3AuZXhlYyA9IG5vb3A7XG5cbmZ1bmN0aW9uIG1lcmdlKG9iaikge1xuICB2YXIgaSA9IDFcbiAgICAsIHRhcmdldFxuICAgICwga2V5O1xuXG4gIGZvciAoOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdGFyZ2V0ID0gYXJndW1lbnRzW2ldO1xuICAgIGZvciAoa2V5IGluIHRhcmdldCkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0YXJnZXQsIGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSB0YXJnZXRba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG5cbi8qKlxuICogTWFya2VkXG4gKi9cblxuZnVuY3Rpb24gbWFya2VkKHNyYywgb3B0LCBjYWxsYmFjaykge1xuICBpZiAoY2FsbGJhY2sgfHwgdHlwZW9mIG9wdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrID0gb3B0O1xuICAgICAgb3B0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBvcHQgPSBtZXJnZSh7fSwgbWFya2VkLmRlZmF1bHRzLCBvcHQgfHwge30pO1xuXG4gICAgdmFyIGhpZ2hsaWdodCA9IG9wdC5oaWdobGlnaHRcbiAgICAgICwgdG9rZW5zXG4gICAgICAsIHBlbmRpbmdcbiAgICAgICwgaSA9IDA7XG5cbiAgICB0cnkge1xuICAgICAgdG9rZW5zID0gTGV4ZXIubGV4KHNyYywgb3B0KVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlKTtcbiAgICB9XG5cbiAgICBwZW5kaW5nID0gdG9rZW5zLmxlbmd0aDtcblxuICAgIHZhciBkb25lID0gZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIG9wdC5oaWdobGlnaHQgPSBoaWdobGlnaHQ7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgfVxuXG4gICAgICB2YXIgb3V0O1xuXG4gICAgICB0cnkge1xuICAgICAgICBvdXQgPSBQYXJzZXIucGFyc2UodG9rZW5zLCBvcHQpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBlcnIgPSBlO1xuICAgICAgfVxuXG4gICAgICBvcHQuaGlnaGxpZ2h0ID0gaGlnaGxpZ2h0O1xuXG4gICAgICByZXR1cm4gZXJyXG4gICAgICAgID8gY2FsbGJhY2soZXJyKVxuICAgICAgICA6IGNhbGxiYWNrKG51bGwsIG91dCk7XG4gICAgfTtcblxuICAgIGlmICghaGlnaGxpZ2h0IHx8IGhpZ2hsaWdodC5sZW5ndGggPCAzKSB7XG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH1cblxuICAgIGRlbGV0ZSBvcHQuaGlnaGxpZ2h0O1xuXG4gICAgaWYgKCFwZW5kaW5nKSByZXR1cm4gZG9uZSgpO1xuXG4gICAgZm9yICg7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIChmdW5jdGlvbih0b2tlbikge1xuICAgICAgICBpZiAodG9rZW4udHlwZSAhPT0gJ2NvZGUnKSB7XG4gICAgICAgICAgcmV0dXJuIC0tcGVuZGluZyB8fCBkb25lKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhpZ2hsaWdodCh0b2tlbi50ZXh0LCB0b2tlbi5sYW5nLCBmdW5jdGlvbihlcnIsIGNvZGUpIHtcbiAgICAgICAgICBpZiAoZXJyKSByZXR1cm4gZG9uZShlcnIpO1xuICAgICAgICAgIGlmIChjb2RlID09IG51bGwgfHwgY29kZSA9PT0gdG9rZW4udGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIC0tcGVuZGluZyB8fCBkb25lKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRva2VuLnRleHQgPSBjb2RlO1xuICAgICAgICAgIHRva2VuLmVzY2FwZWQgPSB0cnVlO1xuICAgICAgICAgIC0tcGVuZGluZyB8fCBkb25lKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSkodG9rZW5zW2ldKTtcbiAgICB9XG5cbiAgICByZXR1cm47XG4gIH1cbiAgdHJ5IHtcbiAgICBpZiAob3B0KSBvcHQgPSBtZXJnZSh7fSwgbWFya2VkLmRlZmF1bHRzLCBvcHQpO1xuICAgIHJldHVybiBQYXJzZXIucGFyc2UoTGV4ZXIubGV4KHNyYywgb3B0KSwgb3B0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGUubWVzc2FnZSArPSAnXFxuUGxlYXNlIHJlcG9ydCB0aGlzIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9jaGpqL21hcmtlZC4nO1xuICAgIGlmICgob3B0IHx8IG1hcmtlZC5kZWZhdWx0cykuc2lsZW50KSB7XG4gICAgICByZXR1cm4gJzxwPkFuIGVycm9yIG9jY3VyZWQ6PC9wPjxwcmU+J1xuICAgICAgICArIGVzY2FwZShlLm1lc3NhZ2UgKyAnJywgdHJ1ZSlcbiAgICAgICAgKyAnPC9wcmU+JztcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuXG4vKipcbiAqIE9wdGlvbnNcbiAqL1xuXG5tYXJrZWQub3B0aW9ucyA9XG5tYXJrZWQuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdCkge1xuICBtZXJnZShtYXJrZWQuZGVmYXVsdHMsIG9wdCk7XG4gIHJldHVybiBtYXJrZWQ7XG59O1xuXG5tYXJrZWQuZGVmYXVsdHMgPSB7XG4gIGdmbTogdHJ1ZSxcbiAgdGFibGVzOiB0cnVlLFxuICBicmVha3M6IGZhbHNlLFxuICBwZWRhbnRpYzogZmFsc2UsXG4gIHNhbml0aXplOiBmYWxzZSxcbiAgc2FuaXRpemVyOiBudWxsLFxuICBtYW5nbGU6IHRydWUsXG4gIHNtYXJ0TGlzdHM6IGZhbHNlLFxuICBzaWxlbnQ6IGZhbHNlLFxuICBoaWdobGlnaHQ6IG51bGwsXG4gIGxhbmdQcmVmaXg6ICdsYW5nLScsXG4gIHNtYXJ0eXBhbnRzOiBmYWxzZSxcbiAgaGVhZGVyUHJlZml4OiAnJyxcbiAgcmVuZGVyZXI6IG5ldyBSZW5kZXJlcixcbiAgeGh0bWw6IGZhbHNlXG59O1xuXG4vKipcbiAqIEV4cG9zZVxuICovXG5cbm1hcmtlZC5QYXJzZXIgPSBQYXJzZXI7XG5tYXJrZWQucGFyc2VyID0gUGFyc2VyLnBhcnNlO1xuXG5tYXJrZWQuUmVuZGVyZXIgPSBSZW5kZXJlcjtcblxubWFya2VkLkxleGVyID0gTGV4ZXI7XG5tYXJrZWQubGV4ZXIgPSBMZXhlci5sZXg7XG5cbm1hcmtlZC5JbmxpbmVMZXhlciA9IElubGluZUxleGVyO1xubWFya2VkLmlubGluZUxleGVyID0gSW5saW5lTGV4ZXIub3V0cHV0O1xuXG5tYXJrZWQucGFyc2UgPSBtYXJrZWQ7XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBtYXJrZWQ7XG59IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBtYXJrZWQ7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy5tYXJrZWQgPSBtYXJrZWQ7XG59XG5cbn0pLmNhbGwoZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzIHx8ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbCk7XG59KCkpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvbWFya2VkL2xpYi9tYXJrZWQuanNcbi8vIG1vZHVsZSBpZCA9IDIyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBnO1xyXG5cclxuLy8gVGhpcyB3b3JrcyBpbiBub24tc3RyaWN0IG1vZGVcclxuZyA9IChmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gdGhpcztcclxufSkoKTtcclxuXHJcbnRyeSB7XHJcblx0Ly8gVGhpcyB3b3JrcyBpZiBldmFsIGlzIGFsbG93ZWQgKHNlZSBDU1ApXHJcblx0ZyA9IGcgfHwgRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpIHx8ICgxLGV2YWwpKFwidGhpc1wiKTtcclxufSBjYXRjaChlKSB7XHJcblx0Ly8gVGhpcyB3b3JrcyBpZiB0aGUgd2luZG93IHJlZmVyZW5jZSBpcyBhdmFpbGFibGVcclxuXHRpZih0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiKVxyXG5cdFx0ZyA9IHdpbmRvdztcclxufVxyXG5cclxuLy8gZyBjYW4gc3RpbGwgYmUgdW5kZWZpbmVkLCBidXQgbm90aGluZyB0byBkbyBhYm91dCBpdC4uLlxyXG4vLyBXZSByZXR1cm4gdW5kZWZpbmVkLCBpbnN0ZWFkIG9mIG5vdGhpbmcgaGVyZSwgc28gaXQnc1xyXG4vLyBlYXNpZXIgdG8gaGFuZGxlIHRoaXMgY2FzZS4gaWYoIWdsb2JhbCkgeyAuLi59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGc7XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vICh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qc1xuLy8gbW9kdWxlIGlkID0gMjNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZGVmIHNodWZmbGUgYXJyYXlcblx0dmFyIGNvdW50ZXIgPSBhcnJheTpsZW5ndGgsIHRlbXAsIGluZGV4XG5cblx0IyBXaGlsZSB0aGVyZSBhcmUgZWxlbWVudHMgaW4gdGhlIGFycmF5XG5cdHdoaWxlIGNvdW50ZXIgPiAwXG5cdFx0IyBQaWNrIGEgcmFuZG9tIGluZGV4XG5cdFx0aW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tICogY291bnRlcilcblx0XHRjb3VudGVyLS0gIyBEZWNyZWFzZSBjb3VudGVyIGJ5IDFcblx0XHQjIEFuZCBzd2FwIHRoZSBsYXN0IGVsZW1lbnQgd2l0aCBpdFxuXHRcdHRlbXAgPSBhcnJheVtjb3VudGVyXVxuXHRcdGFycmF5W2NvdW50ZXJdID0gYXJyYXlbaW5kZXhdXG5cdFx0YXJyYXlbaW5kZXhdID0gdGVtcFxuXHRcblx0cmV0dXJuIGFycmF5XG5cbmV4cG9ydCB0YWcgUGF0dGVyblxuXG5cdGRlZiBzZXR1cFxuXHRcdHJldHVybiBzZWxmIGlmICRub2RlJFxuXHRcdHZhciBwYXJ0cyA9IHt0YWdzOiBbXSwga2V5d29yZHM6IFtdLCBtZXRob2RzOiBbXX1cblx0XHR2YXIgaXRlbXMgPSBbXVxuXHRcdHZhciBsaW5lcyA9IFtdXG5cblx0XHRmb3Igb3duIGssdiBvZiBJbWJhLlRhZzpwcm90b3R5cGVcblx0XHRcdGl0ZW1zLnB1c2goXCI8ZW0+e2t9PC9lbT5cIilcblx0XHRcdHBhcnRzOm1ldGhvZHMucHVzaChcIjxlbT57a308L2VtPlwiKVxuXG5cdFx0Zm9yIGsgaW4gSW1iYS5IVE1MX1RBR1Mgb3IgSFRNTF9UQUdTXG5cdFx0XHRpdGVtcy5wdXNoKFwiPHU+Jmx0O3trfSZndDs8L3U+XCIpXG5cdFx0XHRwYXJ0czp0YWdzLnB1c2goXCI8dT4mbHQ7e2t9Jmd0OzwvdT5cIilcblxuXHRcdHZhciB3b3JkcyA9IFwiZGVmIGlmIGVsc2UgZWxpZiB3aGlsZSB1bnRpbCBmb3IgaW4gb2YgdmFyIGxldCBjbGFzcyBleHRlbmQgZXhwb3J0IGltcG9ydCB0YWcgZ2xvYmFsXCJcblxuXHRcdGZvciBrIGluIHdvcmRzLnNwbGl0KFwiIFwiKVxuXHRcdFx0aXRlbXMucHVzaChcIjxpPntrfTwvaT5cIilcblx0XHRcdHBhcnRzOmtleXdvcmRzLnB1c2goXCI8aT57a308L2k+XCIpXG5cblx0XHR2YXIgc2h1ZmZsZWQgPSBzaHVmZmxlKGl0ZW1zKVxuXHRcdHZhciBhbGwgPSBbXS5jb25jYXQoc2h1ZmZsZWQpXG5cdFx0dmFyIGNvdW50ID0gaXRlbXM6bGVuZ3RoIC0gMVxuXG5cdFx0Zm9yIGxuIGluIFswIC4uIDE0XVxuXHRcdFx0bGV0IGNoYXJzID0gMFxuXHRcdFx0bGluZXNbbG5dID0gW11cblx0XHRcdHdoaWxlIGNoYXJzIDwgMzAwXG5cdFx0XHRcdGxldCBpdGVtID0gKHNodWZmbGVkLnBvcCBvciBhbGxbTWF0aC5mbG9vcihjb3VudCAqIE1hdGgucmFuZG9tKV0pXG5cdFx0XHRcdGlmIGl0ZW1cblx0XHRcdFx0XHRjaGFycyArPSBpdGVtOmxlbmd0aFxuXHRcdFx0XHRcdGxpbmVzW2xuXS5wdXNoKGl0ZW0pXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRjaGFycyA9IDQwMFxuXG5cdFx0ZG9tOmlubmVySFRNTCA9ICc8ZGl2PicgKyBsaW5lcy5tYXAofGxuLGl8XG5cdFx0XHRsZXQgbyA9IE1hdGgubWF4KDAsKChpIC0gMikgKiAwLjMgLyAxNCkpLnRvRml4ZWQoMilcblx0XHRcdFwiPGRpdiBjbGFzcz0nbGluZScgc3R5bGU9J29wYWNpdHk6IHtvfTsnPlwiICsgbG4uam9pbihcIiBcIikgKyAnPC9kaXY+J1xuXHRcdCkuam9pbignJykgKyAnPC9kaXY+J1xuXHRcdHNlbGZcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvUGF0dGVybi5pbWJhIiwiaW1wb3J0IFBhZ2UgZnJvbSAnLi9QYWdlJ1xuaW1wb3J0IFNuaXBwZXQgZnJvbSAnLi9TbmlwcGV0J1xuXG50YWcgR3VpZGVUT0Ncblx0cHJvcCB0b2Ncblx0YXR0ciBsZXZlbFxuXG5cdGRlZiB0b2dnbGVcblx0XHR0b2dnbGVGbGFnKCdjb2xsYXBzZWQnKVxuXHRcdFxuXHRkZWYgdG9jXG5cdFx0QHRvYyBvciBkYXRhLnRvY1xuXHRcdFxuXHRkZWYgcm91dGVcblx0XHRcIntkYXRhLnBhdGh9I3t0b2M6c2x1Z31cIlx0XHRcblx0XHRcblx0ZGVmIHJlbmRlclxuXHRcdHJldHVybiBzZWxmIHVubGVzcyBkYXRhLnJlYWR5XG5cblx0XHRsZXQgdG9jID0gdG9jXG5cdFx0cmVyb3V0ZVxuXHRcblx0XHQ8c2VsZi50b2MuZW50cnkgbGV2ZWw9KHRvYzpsZXZlbCk+XG5cdFx0XHRpZiB0b2M6Y2hpbGRyZW46bGVuZ3RoIGFuZCB0b2M6bGV2ZWwgPCAzXG5cdFx0XHRcdDwuaGVhZGVyPlxuXHRcdFx0XHRcdDxhIGhyZWY9cm91dGU+IHRvYzp0aXRsZVxuXHRcdFx0XHQ8LmNvbnRlbnQ+XG5cdFx0XHRcdFx0Zm9yIGNoaWxkIGluIHRvYzpjaGlsZHJlbiB3aGVuIGNoaWxkOmxldmVsIDwgM1xuXHRcdFx0XHRcdFx0PEd1aWRlVE9DW2RhdGFdIHRvYz1jaGlsZD5cblx0XHRcdGVsc2Vcblx0XHRcdFx0PGEgaHJlZj1yb3V0ZT4gdG9jOnRpdGxlXG5cbnRhZyBHdWlkZVxuXHRcblx0ZGVmIHNldHVwXG5cdFx0cmVuZGVyXG5cdFx0QGJvZHkuZG9tOmlubmVySFRNTCA9IGRhdGE6Ym9keVxuXHRcdGlmICR3ZWIkXG5cdFx0XHRhd2FrZW5TbmlwcGV0c1xuXHRcdHNlbGZcblx0XHRcblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmLm1kPlxuXHRcdFx0PGRpdkBib2R5PlxuXHRcdFx0PGZvb3Rlcj5cblx0XHRcdFx0aWYgbGV0IHJlZiA9IGFwcC5ndWlkZVtkYXRhOnByZXZdXG5cdFx0XHRcdFx0PGEucHJldiBocmVmPVwiL2d1aWRlL3tyZWY6aWR9XCI+IFwi4oaQIFwiICsgcmVmOnRpdGxlXG5cdFx0XHRcdGlmIGxldCByZWYgPSBhcHAuZ3VpZGVbZGF0YTpuZXh0XVxuXHRcdFx0XHRcdDxhLm5leHQgaHJlZj1cIi9ndWlkZS97cmVmOmlkfVwiPiByZWY6dGl0bGUgKyBcIiDihpJcIlxuXG5cdGRlZiBhd2FrZW5TbmlwcGV0c1xuXHRcdGZvciBpdGVtIGluIGRvbS5xdWVyeVNlbGVjdG9yQWxsKCcuc25pcHBldCcpXG5cdFx0XHRsZXQgY29kZSA9IGl0ZW06dGV4dENvbnRlbnRcblx0XHRcdGlmIGNvZGUuaW5kZXhPZignSW1iYS5tb3VudCcpID49IDBcblx0XHRcdFx0U25pcHBldC5yZXBsYWNlKGl0ZW0pXG5cdFx0c2VsZlxuXG50YWcgVE9DIDwgbGlcblx0cHJvcCB0b2Ncblx0cHJvcCBleHBhbmRlZCBkZWZhdWx0OiB0cnVlXG5cdGF0dHIgbGV2ZWxcblx0XG5cdGRlZiByb3V0ZVxuXHRcdFwiL2d1aWRlL3tkYXRhOnJvdXRlfSN7dG9jOnNsdWd9XCJcblx0XHRcblx0ZGVmIHRvY1xuXHRcdEB0b2Mgb3IgZGF0YTp0b2NbMF1cblx0XHRcblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmLnRvYy5lbnRyeSBsZXZlbD0odG9jOmxldmVsKT5cblx0XHRcdDxhIGhyZWY9cm91dGU+IHRvYzp0aXRsZVxuXHRcdFx0aWYgdG9jOmNoaWxkcmVuOmxlbmd0aCBhbmQgdG9jOmxldmVsIDwgMiBhbmQgZXhwYW5kZWRcblx0XHRcdFx0PHVsPiBmb3IgY2hpbGQgaW4gdG9jOmNoaWxkcmVuIHdoZW4gY2hpbGQ6bGV2ZWwgPCAzXG5cdFx0XHRcdFx0PFRPQ1tkYXRhXSB0b2M9Y2hpbGQ+XG5cbmV4cG9ydCB0YWcgR3VpZGVzUGFnZSA8IFBhZ2Vcblx0XG5cdGRlZiBtb3VudFxuXHRcdEBvbnNjcm9sbCB8fD0gZG8gc2Nyb2xsZWRcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJyxAb25zY3JvbGwscGFzc2l2ZTogdHJ1ZSlcblxuXHRkZWYgdW5tb3VudFxuXHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLEBvbnNjcm9sbCxwYXNzaXZlOiB0cnVlKVxuXHRcdFxuXHRkZWYgZ3VpZGVcblx0XHRkYXRhW3JvdXRlci5wYXRoLnJlcGxhY2UoJy9ndWlkZS8nLCcnKV0gb3IgZGF0YVsnZXNzZW50aWFscy9pbnRyb2R1Y3Rpb24nXVxuXHRcdFxuXHRkZWYgc2Nyb2xsZWRcblx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0dmFyIGl0ZW1zID0gZG9tLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tpZF0nKVxuXHRcdHZhciBtYXRjaFxuXG5cdFx0dmFyIHNjcm9sbFRvcCA9IHdpbmRvdzpwYWdlWU9mZnNldFxuXHRcdHZhciB3aCA9IHdpbmRvdzppbm5lckhlaWdodFxuXHRcdHZhciBkaCA9IGRvY3VtZW50OmJvZHk6c2Nyb2xsSGVpZ2h0XG5cblx0XHRpZiBAc2Nyb2xsRnJlZXplID49IDBcblx0XHRcdHZhciBkaWZmID0gTWF0aC5hYnMoc2Nyb2xsVG9wIC0gQHNjcm9sbEZyZWV6ZSlcblx0XHRcdHJldHVybiBzZWxmIGlmIGRpZmYgPCA1MFxuXHRcdFx0QHNjcm9sbEZyZWV6ZSA9IC0xXG5cblx0XHR2YXIgc2Nyb2xsQm90dG9tID0gZGggLSAoc2Nyb2xsVG9wICsgd2gpXG5cblx0XHRpZiBzY3JvbGxCb3R0b20gPT0gMFxuXHRcdFx0bWF0Y2ggPSBpdGVtc1tpdGVtcy5sZW4gLSAxXVxuXHRcdGVsc2Vcblx0XHRcdGZvciBpdGVtIGluIGl0ZW1zXG5cdFx0XHRcdHZhciB0ID0gKGl0ZW06b2Zmc2V0VG9wICsgMzAgKyA2MCkgIyBoYWNrXG5cdFx0XHRcdHZhciBkaXN0ID0gc2Nyb2xsVG9wIC0gdFxuXG5cdFx0XHRcdGlmIGRpc3QgPCAwXG5cdFx0XHRcdFx0YnJlYWsgbWF0Y2ggPSBpdGVtXG5cdFx0XG5cdFx0aWYgbWF0Y2hcblx0XHRcdGlmIEBoYXNoICE9IG1hdGNoOmlkXG5cdFx0XHRcdEBoYXNoID0gbWF0Y2g6aWRcblx0XHRcdFx0cm91dGVyLmdvKCcjJyArIEBoYXNoLHt9LHllcylcblx0XHRcdFx0cmVuZGVyXG5cblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBvbnJvdXRlIGVcblx0XHRlLnN0b3Bcblx0XHRsb2cgJ2d1aWRlcyByb3V0ZWQnXG5cdFx0dmFyIHNjcm9sbCA9IGRvXG5cdFx0XHRpZiBsZXQgZWwgPSBkb20ucXVlcnlTZWxlY3RvcignIycgKyByb3V0ZXIuaGFzaClcblx0XHRcdFx0ZWwuc2Nyb2xsSW50b1ZpZXcodHJ1ZSlcblx0XHRcdFx0QHNjcm9sbEZyZWV6ZSA9IHdpbmRvdzpwYWdlWU9mZnNldFxuXHRcdFx0XHRyZXR1cm4gZWxcblx0XHRcdHJldHVybiBub1xuXG5cdFx0aWYgcm91dGVyLmhhc2hcblx0XHRcdCMgcmVuZGVyXG5cdFx0XHRzY3JvbGwoKSBvciBzZXRUaW1lb3V0KHNjcm9sbCwyMClcblxuXHRcdHNlbGZcblx0IyBwcm9wIGd1aWRlXG5cblx0ZGVmIHJlbmRlclxuXHRcdGxldCBjdXJyID0gZ3VpZGVcblxuXHRcdDxzZWxmLl9wYWdlPlxuXHRcdFx0PG5hdkBuYXY+XG5cdFx0XHRcdDwuY29udGVudD5cblx0XHRcdFx0XHRmb3IgaXRlbSBpbiBkYXRhOnRvY1xuXHRcdFx0XHRcdFx0PGgxPiBpdGVtOnRpdGxlIG9yIGl0ZW06aWRcblx0XHRcdFx0XHRcdDx1bD5cblx0XHRcdFx0XHRcdFx0Zm9yIHNlY3Rpb24gaW4gaXRlbTpzZWN0aW9uc1xuXHRcdFx0XHRcdFx0XHRcdDxUT0NbZGF0YVtzZWN0aW9uXV0gZXhwYW5kZWQ9KGRhdGFbc2VjdGlvbl0gPT0gY3Vycik+XG5cdFx0XHRcdFx0IyBmb3IgZ3VpZGUgaW4gZGF0YVxuXHRcdFx0XHRcdCNcdDxUT0NbZ3VpZGVdIHRvYz1ndWlkZTp0b2NbMF0gZXhwYW5kZWQ9KGd1aWRlID09IGN1cnIpPlxuXHRcdFx0PC5ib2R5LmxpZ2h0PlxuXHRcdFx0XHRpZiBndWlkZVxuXHRcdFx0XHRcdDxHdWlkZUB7Z3VpZGU6aWR9W2d1aWRlXT5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvR3VpZGVzUGFnZS5pbWJhIiwiaW1wb3J0IFBhZ2UgZnJvbSAnLi9QYWdlJ1xuXG5kZWYgcGF0aFRvQW5jaG9yIHBhdGhcblx0J2FwaS0nICsgcGF0aC5yZXBsYWNlKC9cXC4vZywnXycpLnJlcGxhY2UoL1xcIy9nLCdfXycpLnJlcGxhY2UoL1xcPS9nLCdfc2V0JylcblxudGFnIERlc2NcblxuXHRkZWYgaHRtbD0gaHRtbFxuXHRcdGlmIGh0bWwgIT0gQGh0bWxcblx0XHRcdGRvbTppbm5lckhUTUwgPSBAaHRtbCA9IGh0bWxcblx0XHRzZWxmXG5cbnRhZyBSZWZcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGY+XG5cbnRhZyBJdGVtXG5cbnRhZyBQYXRoIDwgc3BhblxuXHRwcm9wIHNob3J0XG5cblx0ZGVmIHNldHVwXG5cdFx0dmFyIGl0ZW1zID0gW11cblx0XHR2YXIgc3RyID0gZGF0YVxuXHRcdGlmIHN0ciBpc2EgU3RyaW5nXG5cdFx0XHRpZiBzaG9ydFxuXHRcdFx0XHRzdHIgPSBzdHIucmVwbGFjZSgvKFtBLVpdXFx3KlxcLikqKD89W0EtWl0pL2csJycpXG5cblx0XHRcdGh0bWwgPSBzdHIucmVwbGFjZSgvXFxiKFtcXHddK3xcXC58XFwjKVxcYi9nKSBkbyB8bSxpfFxuXHRcdFx0XHRpZiBpID09ICcuJyBvciBpID09ICcjJ1xuXHRcdFx0XHRcdFwiPGk+e2l9PC9pPlwiXG5cdFx0XHRcdGVsaWYgaVswXSA9PSBpWzBdLnRvVXBwZXJDYXNlXG5cdFx0XHRcdFx0XCI8YiBjbGFzcz0nY29uc3QnPntpfTwvYj5cIlxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XCI8YiBjbGFzcz0naWQnPntpfTwvYj5cIlxuXHRcdHNlbGZcblxuXG50YWcgUmV0dXJuXG5cdGF0dHIgbmFtZVxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj5cblx0XHRcdDxQYXRoW2RhdGE6dmFsdWVdLnZhbHVlPlxuXHRcdFx0PHNwYW4uZGVzYz4gZGF0YTpkZXNjXG5cbnRhZyBDbGFzcyA8IEl0ZW1cblxuXHRwcm9wIGRhdGEgd2F0Y2g6IDpwYXJzZVxuXG5cdGRlZiBwYXJzZVxuXHRcdEBzdGF0aWNzID0gKG0gZm9yIG0gaW4gZGF0YVsnLiddIHdoZW4gbTpkZXNjKVxuXHRcdEBtZXRob2RzID0gKG0gZm9yIG0gaW4gZGF0YVsnIyddIHdoZW4gbTpkZXNjKVxuXHRcdEBwcm9wZXJ0aWVzID0gW11cblx0XHRzZWxmXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmPlxuXHRcdFx0PHNwYW4udG9jLWFuY2hvciBpZD1wYXRoVG9BbmNob3IoZGF0YTpuYW1lcGF0aCk+XG5cdFx0XHQ8LmhlYWRlcj4gPC50aXRsZT4gPFBhdGhbZGF0YTpuYW1lcGF0aF0+XG5cdFx0XHQ8RGVzYyBodG1sPWRhdGE6aHRtbD5cblx0XHRcdGlmIGRhdGE6Y3RvclxuXHRcdFx0XHQ8LmNvbnRlbnQuY3Rvcj5cblx0XHRcdFx0XHQ8TWV0aG9kW2RhdGE6Y3Rvcl0gcGF0aD0oZGF0YTpuYW1lcGF0aCArICcubmV3Jyk+XG5cblx0XHRcdDwuY29udGVudD5cblx0XHRcdFx0aWYgQHN0YXRpY3M6bGVuZ3RoID4gMFxuXHRcdFx0XHRcdDwuc2VjdGlvbj5cblx0XHRcdFx0XHRcdDxoMi5oZWFkZXI+ICdTdGF0aWMgTWV0aG9kcydcblx0XHRcdFx0XHRcdDwuY29udGVudC5saXN0PiBmb3IgaXRlbSBpbiBAc3RhdGljc1xuXHRcdFx0XHRcdFx0XHQ8TWV0aG9kW2l0ZW1dLmRvYyBpbmFtZT1kYXRhOm5hbWVwYXRoPlxuXG5cdFx0XHRcdGlmIEBtZXRob2RzOmxlbmd0aCA+IDBcblx0XHRcdFx0XHQ8LnNlY3Rpb24+XG5cdFx0XHRcdFx0XHQ8aDIuaGVhZGVyPiAnSW5zdGFuY2UgTWV0aG9kcydcblx0XHRcdFx0XHRcdDwuY29udGVudC5saXN0PiBmb3IgaXRlbSBpbiBAbWV0aG9kc1xuXHRcdFx0XHRcdFx0XHQ8TWV0aG9kW2l0ZW1dLmRvYyBpbmFtZT1kYXRhOmluYW1lPlxuXG50YWcgVmFsdWVcblxuXHRkZWYgcmVuZGVyXG5cdFx0aWYgZGF0YTp0eXBlXG5cdFx0XHQ8c2VsZiAue2RhdGE6dHlwZX0+XG5cdFx0XHRcdGRhdGE6dmFsdWVcblx0XHRlbGlmIGRhdGEgaXNhIFN0cmluZ1xuXHRcdFx0PHNlbGYuc3RyIHRleHQ9ZGF0YT5cblx0XHRlbGlmIGRhdGEgaXNhIE51bWJlclxuXHRcdFx0PHNlbGYubnVtIHRleHQ9ZGF0YT5cblx0XHRzZWxmXG5cdFx0XG5cbnRhZyBQYXJhbVxuXG5cdGRlZiB0eXBlXG5cdFx0ZGF0YTp0eXBlXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmIC57dHlwZX0+XG5cdFx0XHRpZiB0eXBlID09ICdOYW1lZFBhcmFtcydcblx0XHRcdFx0Zm9yIHBhcmFtIGluIGRhdGE6bm9kZXNcblx0XHRcdFx0XHQ8UGFyYW1bcGFyYW1dPlxuXHRcdFx0ZWxzZVxuXHRcdFx0XHQ8Lm5hbWU+IGRhdGE6bmFtZVxuXHRcdFx0XHRpZiBkYXRhOmRlZmF1bHRzXG5cdFx0XHRcdFx0PGk+IHR5cGUgPT0gJ05hbWVkUGFyYW0nID8gJzogJyA6ICcgPSAnXG5cdFx0XHRcdFx0PFZhbHVlW2RhdGE6ZGVmYXVsdHNdPlxuXG50YWcgTWV0aG9kIDwgSXRlbVxuXG5cdHByb3AgaW5hbWVcblx0cHJvcCBwYXRoXG5cblx0ZGVmIHRhZ3Ncblx0XHQ8ZGl2QHRhZ3M+XG5cdFx0XHQ8UmV0dXJuW2RhdGE6cmV0dXJuXSBuYW1lPSdyZXR1cm5zJz4gaWYgZGF0YTpyZXR1cm5cblxuXHRcdFx0aWYgZGF0YTpkZXByZWNhdGVkXG5cdFx0XHRcdDwuZGVwcmVjYXRlZC5yZWQ+ICdNZXRob2QgaXMgZGVwcmVjYXRlZCdcblx0XHRcdGlmIGRhdGE6cHJpdmF0ZVxuXHRcdFx0XHQ8LnByaXZhdGUucmVkPiAnTWV0aG9kIGlzIHByaXZhdGUnXG5cblxuXHRkZWYgcGF0aFxuXHRcdEBwYXRoIG9yIChpbmFtZSArICcuJyArIGRhdGE6bmFtZSlcblxuXHRkZWYgc2x1Z1xuXHRcdHBhdGhUb0FuY2hvcihkYXRhOm5hbWVwYXRoKVxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZiAuZGVwcmVjYXRlZD0oZGF0YTpkZXByZWNhdGVkKSA+XG5cdFx0XHQ8c3Bhbi50b2MtYW5jaG9yIGlkPXNsdWc+XG5cdFx0XHQ8LmhlYWRlcj5cblx0XHRcdFx0PFBhdGhbcGF0aF0+XG5cdFx0XHRcdDwucGFyYW1zPiBmb3IgcGFyYW0gaW4gZGF0YTpwYXJhbXNcblx0XHRcdFx0XHQ8UGFyYW1bcGFyYW1dPlxuXHRcdFx0XHQ8Lmdyb3c+XG5cdFx0XHQ8RGVzYy5tZCBodG1sPWRhdGE6aHRtbD5cblx0XHRcdHRhZ3NcblxudGFnIExpbmsgPCBhXG5cdHByb3Agc2hvcnRcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGYgaHJlZj1cIi9kb2NzI3twYXRoVG9BbmNob3IoZGF0YTpuYW1lcGF0aCl9XCI+IDxQYXRoW2RhdGE6bmFtZXBhdGhdIHNob3J0PXNob3J0PlxuXHRcdHN1cGVyXG5cblx0ZGVmIG9udGFwXG5cdFx0c3VwZXJcblx0XHR0cmlnZ2VyKCdyZWZvY3VzJylcblxudGFnIEdyb3VwXG5cblx0ZGVmIG9udGFwXG5cdFx0dG9nZ2xlRmxhZygnY29sbGFwc2VkJylcblxuXG5leHBvcnQgdGFnIERvY3NQYWdlIDwgUGFnZVxuXG5cdHByb3AgdmVyc2lvbiBkZWZhdWx0OiAnY3VycmVudCdcblx0cHJvcCByb290c1xuXG5cdGRlZiBzcmNcblx0XHRcIi9hcGkve3ZlcnNpb259Lmpzb25cIlxuXG5cdGRlZiBkb2NzXG5cdFx0QGRvY3NcblxuXHRkZWYgc2V0dXBcblx0XHRsb2FkXG5cdFx0c3VwZXJcblxuXHRkZWYgbG9hZFxuXHRcdHZhciBkb2NzID0gYXdhaXQgYXBwLmZldGNoKHNyYylcblx0XHRET0NTID0gQGRvY3MgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRvY3MpKVxuXHRcdERPQ01BUCA9IEBkb2NzOmVudGl0aWVzXG5cdFx0Z2VuZXJhdGVcblx0XHRpZiAkd2ViJFxuXHRcdFx0bG9hZGVkXG5cblx0ZGVmIGxvYWRlZFxuXHRcdHJlbmRlclxuXHRcdGlmIGRvY3VtZW50OmxvY2F0aW9uOmhhc2hcblx0XHRcdGlmIHZhciBlbCA9IGRvbS5xdWVyeVNlbGVjdG9yKGRvY3VtZW50OmxvY2F0aW9uOmhhc2gpXG5cdFx0XHRcdGVsLnNjcm9sbEludG9WaWV3XG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgb25yZWZvY3VzIGVcblx0XHRyZWZvY3VzXG5cblx0ZGVmIHJlZm9jdXNcblx0XHRpZiB2YXIgZWwgPSBkb20ucXVlcnlTZWxlY3Rvcihkb2N1bWVudDpsb2NhdGlvbjpoYXNoKVxuXHRcdFx0ZWwuc2Nyb2xsSW50b1ZpZXdcblx0XHRzZWxmXG5cblx0ZGVmIGxvb2t1cCBwYXRoXG5cdFx0ZG9jczplbnRpdGllc1twYXRoXVxuXG5cdGRlZiBnZW5lcmF0ZVxuXHRcdEByb290cyA9IFtdXG5cdFx0dmFyIGVudHMgPSBAZG9jczplbnRpdGllc1xuXG5cdFx0Zm9yIG93biBwYXRoLGl0ZW0gb2YgZG9jczplbnRpdGllc1xuXHRcdFx0aWYgaXRlbTp0eXBlID09ICdjbGFzcycgb3IgcGF0aCA9PSAnSW1iYSdcblx0XHRcdFx0aXRlbVsnLiddID0gKGl0ZW1bJy4nXSB8fCBbXSkuc29ydC5tYXAofHBhdGh8IGVudHNbcGF0aF0gKS5maWx0ZXIofHZ8IHY6dHlwZSA9PSAnbWV0aG9kJyBhbmQgdjpkZXNjIClcblx0XHRcdFx0aXRlbVsnIyddID0gKGl0ZW1bJyMnXSB8fCBbXSkuc29ydC5tYXAofHBhdGh8IGVudHNbcGF0aF0gKS5maWx0ZXIofHZ8IHY6dHlwZSA9PSAnbWV0aG9kJyBhbmQgdjpkZXNjIClcblxuXHRcdFx0XHRAcm9vdHMucHVzaChpdGVtKSBpZiBpdGVtOmRlc2Ncblx0XHRzZWxmXG5cblx0ZGVmIHJlbmRlclxuXHRcdHJldHVybiBzZWxmIHVubGVzcyBkb2NzXG5cdFx0XG5cdFx0PHNlbGY+XG5cdFx0XHQ8bmF2QG5hdj4gPC5jb250ZW50PlxuXHRcdFx0XHRmb3Igcm9vdCBpbiByb290c1xuXHRcdFx0XHRcdDxHcm91cC50b2MuY2xhc3Muc2VjdGlvbi5jb21wYWN0PlxuXHRcdFx0XHRcdFx0PC5oZWFkZXI+IDxMaW5rW3Jvb3RdLmNsYXNzPlxuXHRcdFx0XHRcdFx0PC5jb250ZW50PlxuXHRcdFx0XHRcdFx0XHQ8LnN0YXRpYz5cblx0XHRcdFx0XHRcdFx0XHRmb3IgbWV0aCBpbiByb290WycuJ13CoHdoZW4gbWV0aDpkZXNjIGFuZCAhbWV0aDpwcml2YXRlXG5cdFx0XHRcdFx0XHRcdFx0XHQ8LmVudHJ5PiA8TGlua1ttZXRoXSBzaG9ydD15ZXM+XG5cdFx0XHRcdFx0XHRcdDwuaW5zdGFuY2U+XG5cdFx0XHRcdFx0XHRcdFx0Zm9yIG1ldGggaW4gcm9vdFsnIyddwqB3aGVuIG1ldGg6ZGVzYyBhbmQgIW1ldGg6cHJpdmF0ZVxuXHRcdFx0XHRcdFx0XHRcdFx0PC5lbnRyeT4gPExpbmtbbWV0aF0gc2hvcnQ9eWVzPlxuXHRcdFx0PC5ib2R5PlxuXHRcdFx0XHRmb3Igcm9vdCBpbiByb290c1xuXHRcdFx0XHRcdDxDbGFzc1tyb290XS5kb2MubD5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9Eb2NzUGFnZS5pbWJhIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2xlc3Mvc2l0ZS5sZXNzXG4vLyBtb2R1bGUgaWQgPSAyN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9