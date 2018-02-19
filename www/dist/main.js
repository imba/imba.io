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
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(8);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

/*
Imba is the namespace for all runtime related utilities
@namespace
*/

var Imba = {VERSION: '1.3.0'};

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
		var js = self.data().js.code;
		js = js.replace("require('imba')",'window.Imba');
		// add console?
		try {
			Imba.mount = function(item) { return orig.call(Imba,item,self._result.dom()); };
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
/* 4 */
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
/* 5 */
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


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(7);
module.exports = __webpack_require__(29);


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;

var App = __webpack_require__(18).App;
var Site = __webpack_require__(34).Site;
document.body.innerHTML = '';
Imba.mount((_1(Site)).setData(APP = App.deserialize(APPCACHE)).end());


/***/ }),
/* 8 */
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
	__webpack_require__(9);
	__webpack_require__(10);
};

if (true && activate) {
	Imba.EventManager.activate();
};

if (false) {};


/***/ }),
/* 9 */
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
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1);

__webpack_require__(11);

Imba.TagManager = new Imba.TagManagerClass();

__webpack_require__(12);
__webpack_require__(13);
__webpack_require__(4);
__webpack_require__(14);
__webpack_require__(15);
__webpack_require__(16);

if (true) {
	__webpack_require__(17);
};

if (false) {};


/***/ }),
/* 11 */
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
/* 12 */
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
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

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
/* 14 */
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
/* 15 */
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
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);
__webpack_require__(4);

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
/* 17 */
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
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
var Router = __webpack_require__(19).Router;

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
/* 19 */
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
		if (!(this.href())) { return };
		
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
/* 20 */,
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var Page = __webpack_require__(2).Page;

var Example = __webpack_require__(3).Example;
var Marked = __webpack_require__(22).Marked;
var Pattern = __webpack_require__(25).Pattern;
var Logo = __webpack_require__(5).Logo;
var ScrimbaEmbed = __webpack_require__(26).ScrimbaEmbed;


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
						// <a.button.start href='/examples'> "Examples"
						_1('a',$,6,4).flag('button').flag('github').setHref('https://github.com/somebee/imba').setText("Github")
					],2)
				],2)
			
			// <herosnippet.hero.dark src='/home/examples/hero.imba'>
			],2),
			_1('div',$,7,0).flag('content').setContent([
				_1(Marked,$,8,7).flag('section').flag('md').flag('welcome').flag('huge').flag('light').setText("# Create complex web apps with ease!\n\nImba is a programming language for the web that compiles to highly \nperformant and readable JavaScript. It has language level support for defining, \nextending, subclassing, instantiating and rendering dom nodes. For a simple \napplication like TodoMVC, it is more than \n[10 times faster than React](http://somebee.github.io/todomvc-render-benchmark/index.html) \nwith less code, and a much smaller library."),
				_1(ScrimbaEmbed,$,9,7).setCid("cJV2aT9"),
				_1('p',$,10,7).flag('center').setText("The interactive screencasting platform Scrimba.com is written in Imba, both frontend and backend")
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
				$[7].end((
					$[8].end(),
					$[9].end()
				,true))
			,true))
		,true));
	};
})
exports.HomePage = HomePage;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);
// define renderer
var marked = __webpack_require__(23);
var mdr = new (marked.Renderer)();

mdr.heading = function (text,lvl){
	return ("<h" + lvl + ">" + text + "</h" + lvl + ">");
};

var Snippet = __webpack_require__(3).Snippet;

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
/* 23 */
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

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(24)))

/***/ }),
/* 24 */
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
/* 25 */
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
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;

var ScrimbaEmbed = Imba.defineTag('ScrimbaEmbed', function(tag){
	tag.prototype.cid = function(v){ return this._cid; }
	tag.prototype.setCid = function(v){ this._cid = v; return this; };
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren(
			$[0] || _1('iframe',$,0,this)
		,2).synced((
			$[0].setSrc(("https://scrimba.com/c/" + this.cid() + ".embed?minimal")).end()
		,true));
	};
})
exports.ScrimbaEmbed = ScrimbaEmbed;


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

function len$(a){
	return a && (a.len instanceof Function ? a.len() : a.length) || 0;
};
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0), _3 = Imba.createTagList, _2 = Imba.createTagMap, _4 = Imba.createTagLoopResult, _1 = Imba.createElement;
var Page = __webpack_require__(2).Page;
var Snippet = __webpack_require__(3).Snippet;

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
/* 28 */
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
/* 29 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var HomePage = __webpack_require__(21).HomePage;
var GuidesPage = __webpack_require__(27).GuidesPage;
var DocsPage = __webpack_require__(28).DocsPage;
var Logo = __webpack_require__(5).Logo;

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
		return this;
	};
	
	tag.prototype.toggleMenu = function (){
		return document.body.classList.toggle('menu');
	};
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren([
			($[0] || _1('header',$,0,this).setId('header').setContent(
				$[1] || _1('nav',$,1,0).flag('content').setContent([
					_1(Logo,$,2,1),
					_1('a',$,3,1).flag('tab').flag('logo').setHref('/home').setContent($[4] || _1('i',$,4,3).setText('imba'),2),
					_1('span',$,5,1).flag('greedy'),
					_1('a',$,6,1).flag('tab').flag('home').setHref('/home').setContent($[7] || _1('i',$,7,6).setText('home'),2),
					_1('a',$,8,1).flag('tab').flag('guides').setHref('/guide').setContent($[9] || _1('i',$,9,8).setText('learn'),2),
					_1('a',$,10,1).flag('tab').flag('gitter').setHref('https://gitter.im/somebee/imba').setContent($[11] || _1('i',$,11,10).setText('community'),2),
					_1('a',$,12,1).flag('github').setHref('https://github.com/somebee/imba').setContent($[13] || _1('i',$,13,12).setText('github'),2),
					// <a.issues href='https://github.com/somebee/imba/issues'> <i> 'issues'
					_1('a',$,14,1).flag('menu').on$(0,['tap','toggleMenu'],this).setContent($[15] || _1('b',$,15,14),2)
				],2)
			,2)).end((
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
			
			this.router().scoped('/home') ? (
				($[16] || _1(HomePage,$,16,this)).end()
			) : (this.router().scoped('/guide') ? (
				($[17] || _1(GuidesPage,$,17,this)).bindData(this.app(),'guide',[]).end()
			) : (this.router().scoped('/docs') ? (
				($[18] || _1(DocsPage,$,18,this)).end()
			) : void(0))),
			
			($[19] || _1('footer',$,19,this).setId('footer').setContent([
				_1('hr',$,20,19),
				_1('div',$,21,19).flag('lft').setText("Imba © 2015-2018"),
				_1('div',$,22,19).flag('rgt').setContent([
					_1('a',$,23,22).setHref('http://twitter.com/imbajs').setText('Twitter'),
					_1('a',$,24,22).setHref('http://github.com/somebee/imba').setText('GitHub'),
					_1('a',$,25,22).setHref('http://github.com/somebee/imba/issues').setText('Issues'),
					_1('a',$,26,22).setHref('http://gitter.im/somebee/imba').setText('Chat')
				],2)
			],2)).end((
				$[22].end()
			,true))
		],1).synced();
	};
})
exports.Site = Site;


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNjdkZTc1NmQwZjI4N2RiYWY2ZmQiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvaW1iYS5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2ltYmEuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvUGFnZS5pbWJhIiwid2VicGFjazovLy8uL3NyYy92aWV3cy9TbmlwcGV0LmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvZG9tL3BvaW50ZXIuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvTG9nby5pbWJhIiwid2VicGFjazovLy8uL3NyYy9jbGllbnQuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9pbmRleC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL3NjaGVkdWxlci5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9pbmRleC5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9tYW5hZ2VyLmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvZG9tL3RhZy5pbWJhIiwid2VicGFjazovLy8uLi9pbWJhL3NyYy9pbWJhL2RvbS9odG1sLmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvZG9tL3RvdWNoLmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvZG9tL2V2ZW50LmltYmEiLCJ3ZWJwYWNrOi8vLy4uL2ltYmEvc3JjL2ltYmEvZG9tL2V2ZW50LW1hbmFnZXIuaW1iYSIsIndlYnBhY2s6Ly8vLi4vaW1iYS9zcmMvaW1iYS9kb20vcmVjb25jaWxlci5pbWJhIiwid2VicGFjazovLy8uL3NyYy9hcHAuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC9yb3V0ZXIuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvSG9tZVBhZ2UuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvTWFya2VkLmltYmEiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL21hcmtlZC9saWIvbWFya2VkLmpzIiwid2VicGFjazovLy8od2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL1BhdHRlcm4uaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvU2NyaW1iYUVtYmVkLmltYmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZXdzL0d1aWRlc1BhZ2UuaW1iYSIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3MvRG9jc1BhZ2UuaW1iYSIsIndlYnBhY2s6Ly8vLi9sZXNzL3NpdGUubGVzcyIsIndlYnBhY2s6Ly8vLi9zcmMvdmlld3Mvc2l0ZS5pbWJhIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztBQzdEQSxPQUFPLFFBQVE7Ozs7Ozs7Ozs7OztJQ0lYLEtBQUs7Ozs7Ozs7Ozs7QUFTVDtRQUNDO0VBQ0M7U0FDQSxLQUFLO0dBRk87Ozs7Ozs7Ozs7O0FBV2Q7UUFDQyxZQUFZLE1BQU07Ozs7Ozs7QUFLbkI7UUFDQyxjQUFjOzs7Ozs7O0FBS2Y7UUFDQyxhQUFhOzs7O0FBR2Q7Q0FDQzs7YUFDWSxJQUFHLElBQUksZUFBZSxNQUFqQyxJQUFJLEdBQUcsRUFBRTs7O0NBRVYs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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEI7QUFDOUI7QUFDQTtBQUNBO0FBQ0EsOEJBQThCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixFQUFFO0FBQ25COztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsUUFBUSxPQUFPO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gNik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNjdkZTc1NmQwZjI4N2RiYWY2ZmQiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUgXCIuL3NyYy9pbWJhL2luZGV4LmltYmFcIlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL2ltYmEuaW1iYSIsIiMjI1xuSW1iYSBpcyB0aGUgbmFtZXNwYWNlIGZvciBhbGwgcnVudGltZSByZWxhdGVkIHV0aWxpdGllc1xuQG5hbWVzcGFjZVxuIyMjXG52YXIgSW1iYSA9IHtWRVJTSU9OOiAnMS4zLjAnfVxuXG4jIyNcblxuTGlnaHQgd3JhcHBlciBhcm91bmQgbmF0aXZlIHNldFRpbWVvdXQgdGhhdCBleHBlY3RzIHRoZSBibG9jayAvIGZ1bmN0aW9uXG5hcyBsYXN0IGFyZ3VtZW50IChpbnN0ZWFkIG9mIGZpcnN0KS4gSXQgYWxzbyB0cmlnZ2VycyBhbiBldmVudCB0byBJbWJhXG5hZnRlciB0aGUgdGltZW91dCB0byBsZXQgc2NoZWR1bGVycyB1cGRhdGUgKHRvIHJlcmVuZGVyIGV0YykgYWZ0ZXJ3YXJkcy5cblxuIyMjXG5kZWYgSW1iYS5zZXRUaW1lb3V0IGRlbGF5LCAmYmxvY2tcblx0c2V0VGltZW91dCgmLGRlbGF5KSBkb1xuXHRcdGJsb2NrKClcblx0XHRJbWJhLmNvbW1pdFxuXG4jIyNcblxuTGlnaHQgd3JhcHBlciBhcm91bmQgbmF0aXZlIHNldEludGVydmFsIHRoYXQgZXhwZWN0cyB0aGUgYmxvY2sgLyBmdW5jdGlvblxuYXMgbGFzdCBhcmd1bWVudCAoaW5zdGVhZCBvZiBmaXJzdCkuIEl0IGFsc28gdHJpZ2dlcnMgYW4gZXZlbnQgdG8gSW1iYVxuYWZ0ZXIgZXZlcnkgaW50ZXJ2YWwgdG8gbGV0IHNjaGVkdWxlcnMgdXBkYXRlICh0byByZXJlbmRlciBldGMpIGFmdGVyd2FyZHMuXG5cbiMjI1xuZGVmIEltYmEuc2V0SW50ZXJ2YWwgaW50ZXJ2YWwsICZibG9ja1xuXHRzZXRJbnRlcnZhbChibG9jayxpbnRlcnZhbClcblxuIyMjXG5DbGVhciBpbnRlcnZhbCB3aXRoIHNwZWNpZmllZCBpZFxuIyMjXG5kZWYgSW1iYS5jbGVhckludGVydmFsIGlkXG5cdGNsZWFySW50ZXJ2YWwoaWQpXG5cbiMjI1xuQ2xlYXIgdGltZW91dCB3aXRoIHNwZWNpZmllZCBpZFxuIyMjXG5kZWYgSW1iYS5jbGVhclRpbWVvdXQgaWRcblx0Y2xlYXJUaW1lb3V0KGlkKVxuXG5cbmRlZiBJbWJhLnN1YmNsYXNzIG9iaiwgc3VwXG5cdGZvciBrLHYgb2Ygc3VwXG5cdFx0b2JqW2tdID0gdiBpZiBzdXAuaGFzT3duUHJvcGVydHkoaylcblxuXHRvYmo6cHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXA6cHJvdG90eXBlKVxuXHRvYmo6X19zdXBlcl9fID0gb2JqOnByb3RvdHlwZTpfX3N1cGVyX18gPSBzdXA6cHJvdG90eXBlXG5cdG9iajpwcm90b3R5cGU6aW5pdGlhbGl6ZSA9IG9iajpwcm90b3R5cGU6Y29uc3RydWN0b3IgPSBvYmpcblx0cmV0dXJuIG9ialxuXG4jIyNcbkxpZ2h0d2VpZ2h0IG1ldGhvZCBmb3IgbWFraW5nIGFuIG9iamVjdCBpdGVyYWJsZSBpbiBpbWJhcyBmb3IvaW4gbG9vcHMuXG5JZiB0aGUgY29tcGlsZXIgY2Fubm90IHNheSBmb3IgY2VydGFpbiB0aGF0IGEgdGFyZ2V0IGluIGEgZm9yIGxvb3AgaXMgYW5cbmFycmF5LCBpdCB3aWxsIGNhY2hlIHRoZSBpdGVyYWJsZSB2ZXJzaW9uIGJlZm9yZSBsb29waW5nLlxuXG5gYGBpbWJhXG4jIHRoaXMgaXMgdGhlIHdob2xlIG1ldGhvZFxuZGVmIEltYmEuaXRlcmFibGUgb1xuXHRyZXR1cm4gbyA/IChvOnRvQXJyYXkgPyBvLnRvQXJyYXkgOiBvKSA6IFtdXG5cbmNsYXNzIEN1c3RvbUl0ZXJhYmxlXG5cdGRlZiB0b0FycmF5XG5cdFx0WzEsMiwzXVxuXG4jIHdpbGwgcmV0dXJuIFsyLDQsNl1cbmZvciB4IGluIEN1c3RvbUl0ZXJhYmxlLm5ld1xuXHR4ICogMlxuXG5gYGBcbiMjI1xuZGVmIEltYmEuaXRlcmFibGUgb1xuXHRyZXR1cm4gbyA/IChvOnRvQXJyYXkgPyBvLnRvQXJyYXkgOiBvKSA6IFtdXG5cbiMjI1xuQ29lcmNlcyBhIHZhbHVlIGludG8gYSBwcm9taXNlLiBJZiB2YWx1ZSBpcyBhcnJheSBpdCB3aWxsXG5jYWxsIGBQcm9taXNlLmFsbCh2YWx1ZSlgLCBvciBpZiBpdCBpcyBub3QgYSBwcm9taXNlIGl0IHdpbGxcbndyYXAgdGhlIHZhbHVlIGluIGBQcm9taXNlLnJlc29sdmUodmFsdWUpYC4gVXNlZCBmb3IgZXhwZXJpbWVudGFsXG5hd2FpdCBzeW50YXguXG5AcmV0dXJuIHtQcm9taXNlfVxuIyMjXG5kZWYgSW1iYS5hd2FpdCB2YWx1ZVxuXHRpZiB2YWx1ZSBpc2EgQXJyYXlcblx0XHRjb25zb2xlLndhcm4oXCJhd2FpdCAoQXJyYXkpIGlzIGRlcHJlY2F0ZWQgLSB1c2UgYXdhaXQgUHJvbWlzZS5hbGwoQXJyYXkpXCIpXG5cdFx0UHJvbWlzZS5hbGwodmFsdWUpXG5cdGVsaWYgdmFsdWUgYW5kIHZhbHVlOnRoZW5cblx0XHR2YWx1ZVxuXHRlbHNlXG5cdFx0UHJvbWlzZS5yZXNvbHZlKHZhbHVlKVxuXG52YXIgZGFzaFJlZ2V4ID0gLy0uL2dcbnZhciBzZXR0ZXJDYWNoZSA9IHt9XG5cbmRlZiBJbWJhLnRvQ2FtZWxDYXNlIHN0clxuXHRpZiBzdHIuaW5kZXhPZignLScpID49IDBcblx0XHRzdHIucmVwbGFjZShkYXNoUmVnZXgpIGRvIHxtfCBtLmNoYXJBdCgxKS50b1VwcGVyQ2FzZVxuXHRlbHNlXG5cdFx0c3RyXG5cdFx0XG5kZWYgSW1iYS50b1NldHRlciBzdHJcblx0c2V0dGVyQ2FjaGVbc3RyXSB8fD0gSW1iYS50b0NhbWVsQ2FzZSgnc2V0LScgKyBzdHIpXG5cbmRlZiBJbWJhLmluZGV4T2YgYSxiXG5cdHJldHVybiAoYiAmJiBiOmluZGV4T2YpID8gYi5pbmRleE9mKGEpIDogW106aW5kZXhPZi5jYWxsKGEsYilcblxuZGVmIEltYmEubGVuIGFcblx0cmV0dXJuIGEgJiYgKGE6bGVuIGlzYSBGdW5jdGlvbiA/IGE6bGVuLmNhbGwoYSkgOiBhOmxlbmd0aCkgb3IgMFxuXG5kZWYgSW1iYS5wcm9wIHNjb3BlLCBuYW1lLCBvcHRzXG5cdGlmIHNjb3BlOmRlZmluZVByb3BlcnR5XG5cdFx0cmV0dXJuIHNjb3BlLmRlZmluZVByb3BlcnR5KG5hbWUsb3B0cylcblx0cmV0dXJuXG5cbmRlZiBJbWJhLmF0dHIgc2NvcGUsIG5hbWUsIG9wdHMgPSB7fVxuXHRpZiBzY29wZTpkZWZpbmVBdHRyaWJ1dGVcblx0XHRyZXR1cm4gc2NvcGUuZGVmaW5lQXR0cmlidXRlKG5hbWUsb3B0cylcblxuXHRsZXQgZ2V0TmFtZSA9IEltYmEudG9DYW1lbENhc2UobmFtZSlcblx0bGV0IHNldE5hbWUgPSBJbWJhLnRvQ2FtZWxDYXNlKCdzZXQtJyArIG5hbWUpXG5cdGxldCBwcm90byA9IHNjb3BlOnByb3RvdHlwZVxuXG5cdGlmIG9wdHM6ZG9tXG5cdFx0cHJvdG9bZ2V0TmFtZV0gPSBkbyB0aGlzLmRvbVtuYW1lXVxuXHRcdHByb3RvW3NldE5hbWVdID0gZG8gfHZhbHVlfFxuXHRcdFx0aWYgdmFsdWUgIT0gdGhpc1tuYW1lXSgpXG5cdFx0XHRcdHRoaXMuZG9tW25hbWVdID0gdmFsdWVcblx0XHRcdHJldHVybiB0aGlzXG5cdGVsc2Vcblx0XHRwcm90b1tnZXROYW1lXSA9IGRvIHRoaXMuZ2V0QXR0cmlidXRlKG5hbWUpXG5cdFx0cHJvdG9bc2V0TmFtZV0gPSBkbyB8dmFsdWV8XG5cdFx0XHR0aGlzLnNldEF0dHJpYnV0ZShuYW1lLHZhbHVlKVxuXHRcdFx0cmV0dXJuIHRoaXNcblx0cmV0dXJuXG5cbmRlZiBJbWJhLnByb3BEaWRTZXQgb2JqZWN0LCBwcm9wZXJ0eSwgdmFsLCBwcmV2XG5cdGxldCBmbiA9IHByb3BlcnR5OndhdGNoXG5cdGlmIGZuIGlzYSBGdW5jdGlvblxuXHRcdGZuLmNhbGwob2JqZWN0LHZhbCxwcmV2LHByb3BlcnR5KVxuXHRlbGlmIGZuIGlzYSBTdHJpbmcgYW5kIG9iamVjdFtmbl1cblx0XHRvYmplY3RbZm5dKHZhbCxwcmV2LHByb3BlcnR5KVxuXHRyZXR1cm5cblxuXG4jIEJhc2ljIGV2ZW50c1xuZGVmIGVtaXRfXyBldmVudCwgYXJncywgbm9kZVxuXHQjIHZhciBub2RlID0gY2JzW2V2ZW50XVxuXHR2YXIgcHJldiwgY2IsIHJldFxuXG5cdHdoaWxlIChwcmV2ID0gbm9kZSkgYW5kIChub2RlID0gbm9kZTpuZXh0KVxuXHRcdGlmIGNiID0gbm9kZTpsaXN0ZW5lclxuXHRcdFx0aWYgbm9kZTpwYXRoIGFuZCBjYltub2RlOnBhdGhdXG5cdFx0XHRcdHJldCA9IGFyZ3MgPyBjYltub2RlOnBhdGhdLmFwcGx5KGNiLGFyZ3MpIDogY2Jbbm9kZTpwYXRoXSgpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdCMgY2hlY2sgaWYgaXQgaXMgYSBtZXRob2Q/XG5cdFx0XHRcdHJldCA9IGFyZ3MgPyBjYi5hcHBseShub2RlLCBhcmdzKSA6IGNiLmNhbGwobm9kZSlcblxuXHRcdGlmIG5vZGU6dGltZXMgJiYgLS1ub2RlOnRpbWVzIDw9IDBcblx0XHRcdHByZXY6bmV4dCA9IG5vZGU6bmV4dFxuXHRcdFx0bm9kZTpsaXN0ZW5lciA9IG51bGxcblx0cmV0dXJuXG5cbiMgbWV0aG9kIGZvciByZWdpc3RlcmluZyBhIGxpc3RlbmVyIG9uIG9iamVjdFxuZGVmIEltYmEubGlzdGVuIG9iaiwgZXZlbnQsIGxpc3RlbmVyLCBwYXRoXG5cdHZhciBjYnMsIGxpc3QsIHRhaWxcblx0Y2JzID0gb2JqOl9fbGlzdGVuZXJzX18gfHw9IHt9XG5cdGxpc3QgPSBjYnNbZXZlbnRdIHx8PSB7fVxuXHR0YWlsID0gbGlzdDp0YWlsIHx8IChsaXN0OnRhaWwgPSAobGlzdDpuZXh0ID0ge30pKVxuXHR0YWlsOmxpc3RlbmVyID0gbGlzdGVuZXJcblx0dGFpbDpwYXRoID0gcGF0aFxuXHRsaXN0OnRhaWwgPSB0YWlsOm5leHQgPSB7fVxuXHRyZXR1cm4gdGFpbFxuXG4jIHJlZ2lzdGVyIGEgbGlzdGVuZXIgb25jZVxuZGVmIEltYmEub25jZSBvYmosIGV2ZW50LCBsaXN0ZW5lclxuXHR2YXIgdGFpbCA9IEltYmEubGlzdGVuKG9iaixldmVudCxsaXN0ZW5lcilcblx0dGFpbDp0aW1lcyA9IDFcblx0cmV0dXJuIHRhaWxcblxuIyByZW1vdmUgYSBsaXN0ZW5lclxuZGVmIEltYmEudW5saXN0ZW4gb2JqLCBldmVudCwgY2IsIG1ldGhcblx0dmFyIG5vZGUsIHByZXZcblx0dmFyIG1ldGEgPSBvYmo6X19saXN0ZW5lcnNfX1xuXHRyZXR1cm4gdW5sZXNzIG1ldGFcblxuXHRpZiBub2RlID0gbWV0YVtldmVudF1cblx0XHR3aGlsZSAocHJldiA9IG5vZGUpIGFuZCAobm9kZSA9IG5vZGU6bmV4dClcblx0XHRcdGlmIG5vZGUgPT0gY2IgfHwgbm9kZTpsaXN0ZW5lciA9PSBjYlxuXHRcdFx0XHRwcmV2Om5leHQgPSBub2RlOm5leHRcblx0XHRcdFx0IyBjaGVjayBmb3IgY29ycmVjdCBwYXRoIGFzIHdlbGw/XG5cdFx0XHRcdG5vZGU6bGlzdGVuZXIgPSBudWxsXG5cdFx0XHRcdGJyZWFrXG5cdHJldHVyblxuXG4jIGVtaXQgZXZlbnRcbmRlZiBJbWJhLmVtaXQgb2JqLCBldmVudCwgcGFyYW1zXG5cdGlmIHZhciBjYiA9IG9iajpfX2xpc3RlbmVyc19fXG5cdFx0ZW1pdF9fKGV2ZW50LHBhcmFtcyxjYltldmVudF0pIGlmIGNiW2V2ZW50XVxuXHRcdGVtaXRfXyhldmVudCxbZXZlbnQscGFyYW1zXSxjYjphbGwpIGlmIGNiOmFsbCAjIGFuZCBldmVudCAhPSAnYWxsJ1xuXHRyZXR1cm5cblxuZGVmIEltYmEub2JzZXJ2ZVByb3BlcnR5IG9ic2VydmVyLCBrZXksIHRyaWdnZXIsIHRhcmdldCwgcHJldlxuXHRpZiBwcmV2IGFuZCB0eXBlb2YgcHJldiA9PSAnb2JqZWN0J1xuXHRcdEltYmEudW5saXN0ZW4ocHJldiwnYWxsJyxvYnNlcnZlcix0cmlnZ2VyKVxuXHRpZiB0YXJnZXQgYW5kIHR5cGVvZiB0YXJnZXQgPT0gJ29iamVjdCdcblx0XHRJbWJhLmxpc3Rlbih0YXJnZXQsJ2FsbCcsb2JzZXJ2ZXIsdHJpZ2dlcilcblx0c2VsZlxuXG5tb2R1bGU6ZXhwb3J0cyA9IEltYmFcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2ltYmEuaW1iYSIsImV4cG9ydCB0YWcgUGFnZVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9QYWdlLmltYmEiLCJleHRlcm4gZXZhbFxuXG5leHBvcnQgdGFnIFNuaXBwZXRcblx0cHJvcCBzcmNcblx0cHJvcCBoZWFkaW5nXG5cdHByb3AgaGxcblx0XG5cdGRlZiBzZWxmLnJlcGxhY2UgZG9tXG5cdFx0bGV0IGltYmEgPSBkb206Zmlyc3RDaGlsZFxuXHRcdGxldCBqcyA9IGltYmE6bmV4dFNpYmxpbmdcblx0XHRsZXQgaGlnaGxpZ2h0ZWQgPSBpbWJhOmlubmVySFRNTFxuXHRcdGxldCByYXcgPSBkb206dGV4dENvbnRlbnRcblx0XHRsZXQgZGF0YSA9XG5cdFx0XHRjb2RlOiByYXdcblx0XHRcdGh0bWw6IGhpZ2hsaWdodGVkXG5cdFx0XHRqczoge1xuXHRcdFx0XHRjb2RlOiBqczp0ZXh0Q29udGVudFxuXHRcdFx0XHRodG1sOiBqczppbm5lckhUTUxcblx0XHRcdH1cblxuXHRcdGxldCBzbmlwcGV0ID0gPFNuaXBwZXRbZGF0YV0+XG5cdFx0ZG9tOnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHNuaXBwZXQuZG9tLGRvbSlcblx0XHRyZXR1cm4gc25pcHBldFxuXHRcdFxuXHRkZWYgc2V0dXBcblx0XHRyZW5kZXJcblx0XHRAY29kZS5kb206aW5uZXJIVE1MID0gZGF0YTpodG1sXG5cdFx0cnVuXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgcnVuXG5cdFx0dmFyIG9yaWcgPSBJbWJhOm1vdW50XG5cdFx0dmFyIGpzID0gZGF0YTpqczpjb2RlXG5cdFx0anMgPSBqcy5yZXBsYWNlKFwicmVxdWlyZSgnaW1iYScpXCIsJ3dpbmRvdy5JbWJhJylcblx0XHQjIGFkZCBjb25zb2xlP1xuXHRcdHRyeVxuXHRcdFx0SW1iYTptb3VudCA9IGRvIHxpdGVtfCBvcmlnLmNhbGwoSW1iYSxpdGVtLEByZXN1bHQuZG9tKVxuXHRcdFx0ZXZhbChqcylcblx0XHRcblx0XHRJbWJhOm1vdW50ID0gb3JpZ1xuXHRcdHNlbGZcblxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZi5zbmlwcGV0PlxuXHRcdFx0PGNvZGVAY29kZT5cblx0XHRcdDxkaXZAcmVzdWx0LnN0eWxlZC1leGFtcGxlPlxuXHRcdFxuZXhwb3J0IHRhZyBFeGFtcGxlIDwgU25pcHBldFxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj4gXCJFeGFtcGxlXCJcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvU25pcHBldC5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG5jbGFzcyBJbWJhLlBvaW50ZXJcblx0XG5cdGRlZiBpbml0aWFsaXplXG5cdFx0QGJ1dHRvbiA9IC0xXG5cdFx0QGV2ZW50ID0ge3g6IDAsIHk6IDAsIHR5cGU6ICd1bmluaXRpYWxpemVkJ31cblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBidXR0b25cblx0XHRAYnV0dG9uXG5cblx0ZGVmIHRvdWNoXG5cdFx0QHRvdWNoXG5cblx0ZGVmIHVwZGF0ZSBlXG5cdFx0QGV2ZW50ID0gZVxuXHRcdEBkaXJ0eSA9IHllc1xuXHRcdHNlbGZcblxuXHQjIHRoaXMgaXMganVzdCBmb3IgcmVndWxhciBtb3VzZSBub3dcblx0ZGVmIHByb2Nlc3Ncblx0XHR2YXIgZTEgPSBAZXZlbnRcblxuXHRcdGlmIEBkaXJ0eVxuXHRcdFx0QHByZXZFdmVudCA9IGUxXG5cdFx0XHRAZGlydHkgPSBub1xuXG5cdFx0XHQjIGJ1dHRvbiBzaG91bGQgb25seSBjaGFuZ2Ugb24gbW91c2Vkb3duIGV0Y1xuXHRcdFx0aWYgZTE6dHlwZSA9PSAnbW91c2Vkb3duJ1xuXHRcdFx0XHRAYnV0dG9uID0gZTE6YnV0dG9uXG5cblx0XHRcdFx0aWYgKEB0b3VjaCBhbmQgQGJ1dHRvbiAhPSAwKVxuXHRcdFx0XHRcdHJldHVyblxuXG5cdFx0XHRcdCMgY2FuY2VsIHRoZSBwcmV2aW91cyB0b3VjaFxuXHRcdFx0XHRAdG91Y2guY2FuY2VsIGlmIEB0b3VjaFxuXHRcdFx0XHRAdG91Y2ggPSBJbWJhLlRvdWNoLm5ldyhlMSxzZWxmKVxuXHRcdFx0XHRAdG91Y2gubW91c2Vkb3duKGUxLGUxKVxuXG5cdFx0XHRlbGlmIGUxOnR5cGUgPT0gJ21vdXNlbW92ZSdcblx0XHRcdFx0QHRvdWNoLm1vdXNlbW92ZShlMSxlMSkgaWYgQHRvdWNoXG5cblx0XHRcdGVsaWYgZTE6dHlwZSA9PSAnbW91c2V1cCdcblx0XHRcdFx0QGJ1dHRvbiA9IC0xXG5cblx0XHRcdFx0aWYgQHRvdWNoIGFuZCBAdG91Y2guYnV0dG9uID09IGUxOmJ1dHRvblxuXHRcdFx0XHRcdEB0b3VjaC5tb3VzZXVwKGUxLGUxKVxuXHRcdFx0XHRcdEB0b3VjaCA9IG51bGxcblx0XHRcdFx0IyB0cmlnZ2VyIHBvaW50ZXJ1cFxuXHRcdGVsaWYgQHRvdWNoXG5cdFx0XHRAdG91Y2guaWRsZVxuXHRcdHNlbGZcblxuXHRkZWYgeCBkbyBAZXZlbnQ6eFxuXHRkZWYgeSBkbyBAZXZlbnQ6eVxuXHRcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vcG9pbnRlci5pbWJhIiwiXG5leHBvcnQgdGFnIExvZ29cblx0XG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj5cblx0XHRcdDxzdmc6c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjExNlwiIGhlaWdodD1cIjEwOFwiIHZpZXdCb3g9XCIwIDAgMTE2IDEwOFwiPlxuXHRcdFx0XHQ8c3ZnOmcgZmlsbD1cIiMzRTkxRkZcIiBmaWxsLXJ1bGU9XCJldmVub2RkXCI+XG5cdFx0XHRcdFx0PHN2ZzpwYXRoIGQ9XCJNMzguODYzODg2OSA2OC4xMzUxNDI0QzM5LjUwNzM0NzYgNjkuNTcyNzEgMzkuNjg5MDA1NyA3MC45NTQ3ODI1IDM5LjQwODg2NjYgNzIuMjgxNDAxNCAzOS4xMjg3Mjc2IDczLjYwODAyMDQgMzguNDQzNzAyMiA3NC42MDk2ODA1IDM3LjM1Mzc2OTkgNzUuMjg2NDExOCAzNi4yNjM4Mzc1IDc1Ljk2MzE0MzIgMzUuMDE4NzI4OCA3Ni4xNTE3MDMzIDMzLjYxODQwNjIgNzUuODUyMDk3OSAzMi43MTIzMTUyIDc1LjY1ODIzNTYgMzEuNzM1MjA3IDc1LjE4OTIwMzUgMzAuNjg3MDUyMyA3NC40NDQ5ODc1IDI4Ljk0MjkxMDkgNzIuNTExOTQ1IDI2Ljk5NTQ1NDcgNzAuMzE4Nzc5NyAyNC44NDQ2MjUyIDY3Ljg2NTQyNTcgMjIuNjkzNzk1OCA2NS40MTIwNzE4IDIwLjUxMDU2NzQgNjIuOTA4NDg2NiAxOC4yOTQ4NzQ4IDYwLjM1NDU5NTEgMTYuMDc5MTgyMSA1Ny44MDA3MDM1IDEzLjkwMDMzMDkgNTUuMjc2MzkwMiAxMS43NTgyNTU4IDUyLjc4MTU3OTQgOS42MTYxODA2NiA1MC4yODY3Njg2IDcuNjMxOTE2MiA0OC4wNjQwNjM0IDUuODA1NDAyODYgNDYuMTEzMzk3IDQuNzY3NTkxMjggNDQuNTA0Nzk2NSA0LjM5NzUxNDkyIDQyLjk5NTc1MjYgNC42OTUxNjI2NiA0MS41ODYyMiA1LjA0NTMzNjQ4IDM5LjkyNzk0NjQgNi4xMzQyNTU0MyAzOC42NDQ0MDI3IDcuOTYxOTUyMTYgMzcuNzM1NTUwNkwxMS4yMTQ3MjI3IDM2LjA5MTY5NDJDMTIuOTAxMzUyOCAzNS4yMzkzMiAxNC45NDA2MTg4IDM0LjI0NTc2NTggMTcuMzMyNTgxOCAzMy4xMTEwMDIxIDE5LjcyNDU0NDggMzEuOTc2MjM4MyAyMi4yNDU2OTc5IDMwLjczOTE1MjMgMjQuODk2MTE2NyAyOS4zOTk3MDcxIDI3LjU0NjUzNTYgMjguMDYwMjYxOSAzMC4wNjc2ODg3IDI2LjgyMzE3NTkgMzIuNDU5NjUxNyAyNS42ODg0MTIxIDM0Ljg1MTYxNDcgMjQuNTUzNjQ4MyAzNi45MTU4NTA0IDIzLjU0Mzc3MiAzOC42NTI0MjA5IDIyLjY1ODc1MjggNDAuMzg4OTkxNCAyMS43NzM3MzM3IDQxLjQ0ODI2NzYgMjEuMjQyMTA5MyA0MS44MzAyODEzIDIxLjA2Mzg2MzYgNDMuNTkzNTA1OSAyMC4yMjg1MTU2IDUzLjYxNjIxMDkgMTguNzkyMjM2MyA1Mi40MjE3MzkxIDIyLjczMjU0OTFMNDcuOTExNTU1NiAzOS44MDA4MzA5QzQ3LjgwNzc4MDUgNDAuMTkzNTU2MSA0Ny40NzY3NTIgNDAuNDg0NDg2MyA0Ny4wNzM5NTI0IDQwLjUzNjk3M0wxOC4wNjU2MDkgNDQuMzE2ODk5MUMxOS40NTA0MTY5IDQ1LjkxMzA4MTMgMjEuMDYzNTE0OCA0Ny43NTMwNjkyIDIyLjkwNDk1MTEgNDkuODM2OTE4IDI0Ljc0NjM4NzMgNTEuOTIwNzY2OCAyNi41OTk2MzQ0IDU0LjA1MDQ0NjQgMjguNDY0NzQ3OSA1Ni4yMjYwMjA4IDMwLjMyOTg2MTUgNTguNDAxNTk1MiAzMi4xODMxMDg2IDYwLjUzMTI3NDggMzQuMDI0NTQ0OCA2Mi42MTUxMjM2IDM1Ljg2NTk4MTEgNjQuNjk4OTcyMyAzNy40NzkwNzkgNjYuNTM4OTYwMiAzOC44NjM4ODY5IDY4LjEzNTE0MjR6TTY3LjIwOTAzNTMgNzYuMjIyMTc3M0M2NS45MTk5Mjg1IDc3LjEwODY3NiA2NS4wNTU3MTQ3IDc4LjE4NDQyMjUgNjQuNjE2MzY4IDc5LjQ0OTQ0OTEgNjQuMTc3MDIxMyA4MC43MTQ0NzU2IDY0LjI1MTc5NTkgODEuOTExNzg5NyA2NC44NDA2OTQgODMuMDQxNDI3MSA2NS40Mjk1OTIxIDg0LjE3MTA2NDQgNjYuNDAxODc3OCA4NC45NjcyNzUgNjcuNzU3NTgwNCA4NS40MzAwODI1IDY4LjYzNDc5OTggODUuNzI5NTQ2MiA2OS43MTQwMDEyIDg1LjgzMjY1MTkgNzAuOTk1MjE3MiA4NS43Mzk0MDI1IDczLjQ4MzE2MjUgODQuOTk2ODQ3IDc2LjI3ODk1NTQgODQuMTM4MzE1OSA3OS4zODI2Nzk5IDgzLjE2Mzc4MzQgODIuNDg2NDA0MyA4Mi4xODkyNTA4IDg1LjY0MzY4NDUgODEuMTg4ODEzMyA4OC44NTQ2MTUzIDgwLjE2MjQ0MDYgOTIuMDY1NTQ2MSA3OS4xMzYwNjc5IDk1LjIyOTY5MTEgNzguMTE1ODY0NSA5OC4zNDcxNDUxIDc3LjEwMTggMTAxLjQ2NDU5OSA3Ni4wODc3MzU0IDEwNC4zMDcxMyA3NS4yMjMwNTAzIDEwNi44NzQ4MjIgNzQuNTA3NzE4NyAxMDguNTkwMTI0IDczLjY3ODI3NTcgMTA5LjY4MTE2MiA3Mi41OTE1MjUyIDExMC4xNDc5NjggNzEuMjQ3NDM0NCAxMTAuNjk3MTUxIDY5LjY2NjE1MTIgMTEwLjQyMDA5MiA2OC4wMjM5MjUzIDEwOS4zMTY3ODMgNjYuMzIwNzA3NEwxMDcuMzY2NzIxIDYzLjI2NzE4MTNDMTA2LjM1NTU3NCA2MS42ODM4NjM1IDEwNS4xMTQwNCA1OS44MDA4MjM2IDEwMy42NDIwODQgNTcuNjE4MDA1MyAxMDIuMTcwMTI4IDU1LjQzNTE4NjkgMTAwLjYzOTcgNTMuMDk5Nzc3MyA5OS4wNTA3NTI5IDUwLjYxMTcwNjUgOTcuNDYxODA2MiA0OC4xMjM2MzU3IDk1LjkzMTM3NzggNDUuNzg4MjI2MiA5NC40NTk0MjE3IDQzLjYwNTQwNzggOTIuOTg3NDY1NiA0MS40MjI1ODk0IDkxLjczMjg2MDQgMzkuNTEyOTc3OSA5MC42OTU1Njg1IDM3Ljg3NjUxNjEgODkuNjU4Mjc2NiAzNi4yNDAwNTQyIDg5LjAyMTMzNDUgMzUuMjQ4Nzk0IDg4Ljc4NDcyMzIgMzQuOTAyNzA1NiA4Ny4zNDU3MDMxIDMyLjc5MTk5MjIgODAuMzAxMDI1NCAyNi4yMDgwMDc4IDc4LjgzNjkwMDUgMzAuODk3MDY5Mkw3My45NjU0Nzg5IDQ3LjYyNDIwNTZDNzMuODUxMzE4NCA0OC4wMTYyMDE0IDczLjk4NjkyNDkgNDguNDM4MjMxNiA3NC4zMDgwNTUxIDQ4LjY5MDM2MDFMOTcuMjcwMTcyNSA2Ni43MTg1NzcxQzk1LjI2MzM0MDggNjcuMzYwMDYwMSA5Mi45MzU1ODI0IDY4LjA5MDk0ODUgOTAuMjg2ODI3NSA2OC45MTEyNjQzIDg3LjYzODA3MjYgNjkuNzMxNTgwMSA4NC45NTU2OTE2IDcwLjU4NDYwOTIgODIuMjM5NjAzOSA3MS40NzAzNzcyIDc5LjUyMzUxNjMgNzIuMzU2MTQ1MiA3Ni44NDExMzUyIDczLjIwOTE3NDMgNzQuMTkyMzgwMyA3NC4wMjk0OTAyIDcxLjU0MzYyNTUgNzQuODQ5ODA2IDY5LjIxNTg2NzEgNzUuNTgwNjk0NCA2Ny4yMDkwMzUzIDc2LjIyMjE3NzN6TTY1LjQ1MDE0MDEgOC4wMTEzMTExOEM2Ni4zMTA3OTM1IDYuNDg2MDgxMjkgNjcuMzA5MzcwNiA1LjQzNTI1NTIzIDY4LjQ0NTkwMTIgNC44NTg4MDE0NyA2OS41ODI0MzE4IDQuMjgyMzQ3NzEgNzAuNzMyMjU5NSA0LjE0NzQzMjA2IDcxLjg5NTQxODggNC40NTQwNTA0OCA3Mi45NzU0OTUzIDQuNzM4NzY3NTkgNzMuODkzMDY3MSA1LjM3NDg2NDg3IDc0LjY0ODE2MTYgNi4zNjIzNjE0MSA3NS40MDMyNTYyIDcuMzQ5ODU3OTUgNzUuNzc3MDE2MSA4LjY3NDgzOTQ2IDc1Ljc2OTQ1MjcgMTAuMzM3MzQ1N0w1MS4zOTI3MTYgOTkuODM4NzE5N0M1MC43OTc2MDc5IDEwMS42OTY3NjUgNDkuODUyNzk0MSAxMDIuOTU4ODczIDQ4LjU1ODI0NjMgMTAzLjYyNTA4IDQ3LjI2MzY5ODYgMTA0LjI5MTI4NyA0NS45OTMzMjI3IDEwNC40NjAxMjggNDQuNzQ3MDgwNiAxMDQuMTMxNjA4IDQzLjU4MzkyMTIgMTAzLjgyNDk5IDQyLjYyMDczNDUgMTAzLjExMTE2NSA0MS44NTc0OTE1IDEwMS45OTAxMTMgNDEuMDk0MjQ4NSAxMDAuODY5MDYgNDAuODMyODg4NCA5OS4zNzY1OTkzIDQxLjA3MzQwMzQgOTcuNTEyNjg1Mkw2NS40NTAxNDAxIDguMDExMzExMTh6XCI+XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL0xvZ28uaW1iYSIsIlxuaW1wb3J0IEFwcCBmcm9tICcuL2FwcCdcbmltcG9ydCBTaXRlIGZyb20gJy4vdmlld3Mvc2l0ZSdcbmRvY3VtZW50OmJvZHk6aW5uZXJIVE1MID0gJycgXG5JbWJhLm1vdW50IDxTaXRlW0FQUCA9IEFwcC5kZXNlcmlhbGl6ZShBUFBDQUNIRSldPlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jbGllbnQuaW1iYSIsInZhciBJbWJhID0gcmVxdWlyZShcIi4vaW1iYVwiKVxudmFyIGFjdGl2YXRlID0gbm9cbmlmIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG5cdGlmIHdpbmRvdy5JbWJhXG5cdFx0Y29uc29sZS53YXJuIFwiSW1iYSB2e3dpbmRvdy5JbWJhLlZFUlNJT059IGlzIGFscmVhZHkgbG9hZGVkLlwiXG5cdFx0SW1iYSA9IHdpbmRvdy5JbWJhXG5cdGVsc2Vcblx0XHR3aW5kb3cuSW1iYSA9IEltYmFcblx0XHRhY3RpdmF0ZSA9IHllc1xuXHRcdGlmIHdpbmRvdzpkZWZpbmUgYW5kIHdpbmRvdzpkZWZpbmU6YW1kXG5cdFx0XHR3aW5kb3cuZGVmaW5lKFwiaW1iYVwiLFtdKSBkbyByZXR1cm4gSW1iYVxuXG5tb2R1bGUuZXhwb3J0cyA9IEltYmFcblxudW5sZXNzICR3ZWJ3b3JrZXIkXG5cdHJlcXVpcmUgJy4vc2NoZWR1bGVyJ1xuXHRyZXF1aXJlICcuL2RvbS9pbmRleCdcblxuaWYgJHdlYiQgYW5kIGFjdGl2YXRlXG5cdEltYmEuRXZlbnRNYW5hZ2VyLmFjdGl2YXRlXG5cdFxuaWYgJG5vZGUkXG5cdHVubGVzcyAkd2VicGFjayRcblx0XHRyZXF1aXJlICcuLi8uLi9yZWdpc3Rlci5qcydcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2luZGV4LmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuL2ltYmFcIilcblxudmFyIHJlcXVlc3RBbmltYXRpb25GcmFtZSAjIHZlcnkgc2ltcGxlIHJhZiBwb2x5ZmlsbFxudmFyIGNhbmNlbEFuaW1hdGlvbkZyYW1lXG5cbmlmICRub2RlJFxuXHRjYW5jZWxBbmltYXRpb25GcmFtZSA9IGRvIHxpZHwgY2xlYXJUaW1lb3V0KGlkKVxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBkbyB8YmxrfCBzZXRUaW1lb3V0KGJsaywxMDAwIC8gNjApXG5cbmlmICR3ZWIkXG5cdGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93OmNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdzptb3pDYW5jZWxBbmltYXRpb25GcmFtZSB8fCB3aW5kb3c6d2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdzpyZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8PSB3aW5kb3c6d2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSB8fD0gd2luZG93Om1velJlcXVlc3RBbmltYXRpb25GcmFtZVxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHw9IGRvIHxibGt8IHNldFRpbWVvdXQoYmxrLDEwMDAgLyA2MClcblxuY2xhc3MgVGlja2VyXG5cblx0cHJvcCBzdGFnZVxuXHRwcm9wIHF1ZXVlXG5cblx0ZGVmIGluaXRpYWxpemVcblx0XHRAcXVldWUgPSBbXVxuXHRcdEBzdGFnZSA9IC0xXG5cdFx0QHNjaGVkdWxlZCA9IG5vXG5cdFx0QHRpY2tlciA9IGRvIHxlfFxuXHRcdFx0QHNjaGVkdWxlZCA9IG5vXG5cdFx0XHR0aWNrKGUpXG5cdFx0c2VsZlxuXG5cdGRlZiBhZGQgaXRlbSwgZm9yY2Vcblx0XHRpZiBmb3JjZSBvciBAcXVldWUuaW5kZXhPZihpdGVtKSA9PSAtMVxuXHRcdFx0QHF1ZXVlLnB1c2goaXRlbSlcblxuXHRcdHNjaGVkdWxlIHVubGVzcyBAc2NoZWR1bGVkXG5cblx0ZGVmIHRpY2sgdGltZXN0YW1wXG5cdFx0dmFyIGl0ZW1zID0gQHF1ZXVlXG5cdFx0QHRzID0gdGltZXN0YW1wIHVubGVzcyBAdHNcblx0XHRAZHQgPSB0aW1lc3RhbXAgLSBAdHNcblx0XHRAdHMgPSB0aW1lc3RhbXBcblx0XHRAcXVldWUgPSBbXVxuXHRcdEBzdGFnZSA9IDFcblx0XHRiZWZvcmVcblx0XHRpZiBpdGVtczpsZW5ndGhcblx0XHRcdGZvciBpdGVtLGkgaW4gaXRlbXNcblx0XHRcdFx0aWYgaXRlbSBpc2EgRnVuY3Rpb25cblx0XHRcdFx0XHRpdGVtKEBkdCxzZWxmKVxuXHRcdFx0XHRlbGlmIGl0ZW06dGlja1xuXHRcdFx0XHRcdGl0ZW0udGljayhAZHQsc2VsZilcblx0XHRAc3RhZ2UgPSAyXG5cdFx0YWZ0ZXJcblx0XHRAc3RhZ2UgPSBAc2NoZWR1bGVkID8gMCA6IC0xXG5cdFx0c2VsZlxuXG5cdGRlZiBzY2hlZHVsZVxuXHRcdGlmICFAc2NoZWR1bGVkXG5cdFx0XHRAc2NoZWR1bGVkID0geWVzXG5cdFx0XHRpZiBAc3RhZ2UgPT0gLTFcblx0XHRcdFx0QHN0YWdlID0gMFxuXHRcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKEB0aWNrZXIpXG5cdFx0c2VsZlxuXG5cdGRlZiBiZWZvcmVcblx0XHRzZWxmXG5cblx0ZGVmIGFmdGVyXG5cdFx0aWYgSW1iYS5UYWdNYW5hZ2VyXG5cdFx0XHRJbWJhLlRhZ01hbmFnZXIucmVmcmVzaFxuXHRcdHNlbGZcblxuSW1iYS5USUNLRVIgPSBUaWNrZXIubmV3XG5JbWJhLlNDSEVEVUxFUlMgPSBbXVxuXG5kZWYgSW1iYS50aWNrZXJcblx0SW1iYS5USUNLRVJcblxuZGVmIEltYmEucmVxdWVzdEFuaW1hdGlvbkZyYW1lIGNhbGxiYWNrXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjaylcblxuZGVmIEltYmEuY2FuY2VsQW5pbWF0aW9uRnJhbWUgaWRcblx0Y2FuY2VsQW5pbWF0aW9uRnJhbWUoaWQpXG5cbiMgc2hvdWxkIGFkZCBhbiBJbWJhLnJ1biAvIHNldEltbWVkaWF0ZSB0aGF0XG4jIHB1c2hlcyBsaXN0ZW5lciBvbnRvIHRoZSB0aWNrLXF1ZXVlIHdpdGggdGltZXMgLSBvbmNlXG5cbnZhciBjb21taXRRdWV1ZSA9IDBcblxuZGVmIEltYmEuY29tbWl0IHBhcmFtc1xuXHRjb21taXRRdWV1ZSsrXG5cdCMgSW1iYS5UYWdNYW5hZ2VyLnJlZnJlc2hcblx0SW1iYS5lbWl0KEltYmEsJ2NvbW1pdCcscGFyYW1zICE9IHVuZGVmaW5lZCA/IFtwYXJhbXNdIDogdW5kZWZpbmVkKVxuXHRpZiAtLWNvbW1pdFF1ZXVlID09IDBcblx0XHRJbWJhLlRhZ01hbmFnZXIgYW5kIEltYmEuVGFnTWFuYWdlci5yZWZyZXNoXG5cdHJldHVyblxuXG4jIyNcblxuSW5zdGFuY2VzIG9mIEltYmEuU2NoZWR1bGVyIG1hbmFnZXMgd2hlbiB0byBjYWxsIGB0aWNrKClgIG9uIHRoZWlyIHRhcmdldCxcbmF0IGEgc3BlY2lmaWVkIGZyYW1lcmF0ZSBvciB3aGVuIGNlcnRhaW4gZXZlbnRzIG9jY3VyLiBSb290LW5vZGVzIGluIHlvdXJcbmFwcGxpY2F0aW9ucyB3aWxsIHVzdWFsbHkgaGF2ZSBhIHNjaGVkdWxlciB0byBtYWtlIHN1cmUgdGhleSByZXJlbmRlciB3aGVuXG5zb21ldGhpbmcgY2hhbmdlcy4gSXQgaXMgYWxzbyBwb3NzaWJsZSB0byBtYWtlIGlubmVyIGNvbXBvbmVudHMgdXNlIHRoZWlyXG5vd24gc2NoZWR1bGVycyB0byBjb250cm9sIHdoZW4gdGhleSByZW5kZXIuXG5cbkBpbmFtZSBzY2hlZHVsZXJcblxuIyMjXG5jbGFzcyBJbWJhLlNjaGVkdWxlclxuXHRcblx0dmFyIGNvdW50ZXIgPSAwXG5cblx0ZGVmIHNlbGYuZXZlbnQgZVxuXHRcdEltYmEuZW1pdChJbWJhLCdldmVudCcsZSlcblxuXHQjIyNcblx0Q3JlYXRlIGEgbmV3IEltYmEuU2NoZWR1bGVyIGZvciBzcGVjaWZpZWQgdGFyZ2V0XG5cdEByZXR1cm4ge0ltYmEuU2NoZWR1bGVyfVxuXHQjIyNcblx0ZGVmIGluaXRpYWxpemUgdGFyZ2V0XG5cdFx0QGlkID0gY291bnRlcisrXG5cdFx0QHRhcmdldCA9IHRhcmdldFxuXHRcdEBtYXJrZWQgPSBub1xuXHRcdEBhY3RpdmUgPSBub1xuXHRcdEBtYXJrZXIgPSBkbyBtYXJrXG5cdFx0QHRpY2tlciA9IGRvIHxlfCB0aWNrKGUpXG5cblx0XHRAZHQgPSAwXG5cdFx0QGZyYW1lID0ge31cblx0XHRAc2NoZWR1bGVkID0gbm9cblx0XHRAdGltZXN0YW1wID0gMFxuXHRcdEB0aWNrcyA9IDBcblx0XHRAZmx1c2hlcyA9IDBcblxuXHRcdHNlbGY6b25ldmVudCA9IHNlbGY6b25ldmVudC5iaW5kKHNlbGYpXG5cdFx0c2VsZlxuXG5cdHByb3AgcmFmIHdhdGNoOiB5ZXNcblx0cHJvcCBpbnRlcnZhbCB3YXRjaDogeWVzXG5cdHByb3AgZXZlbnRzIHdhdGNoOiB5ZXNcblx0cHJvcCBtYXJrZWRcblxuXHRkZWYgcmFmRGlkU2V0IGJvb2xcblx0XHRyZXF1ZXN0VGljayBpZiBib29sIGFuZCBAYWN0aXZlXG5cdFx0c2VsZlxuXG5cdGRlZiBpbnRlcnZhbERpZFNldCB0aW1lXG5cdFx0Y2xlYXJJbnRlcnZhbChAaW50ZXJ2YWxJZClcblx0XHRAaW50ZXJ2YWxJZCA9IG51bGxcblx0XHRpZiB0aW1lIGFuZCBAYWN0aXZlXG5cdFx0XHRAaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKHNlbGY6b25pbnRlcnZhbC5iaW5kKHNlbGYpLHRpbWUpXG5cdFx0c2VsZlxuXG5cdGRlZiBldmVudHNEaWRTZXQgbmV3LCBwcmV2XG5cdFx0aWYgQGFjdGl2ZSBhbmQgbmV3IGFuZCAhcHJldlxuXHRcdFx0SW1iYS5saXN0ZW4oSW1iYSwnY29tbWl0JyxzZWxmLCdvbmV2ZW50Jylcblx0XHRlbGlmICFuZXcgYW5kIHByZXZcblx0XHRcdEltYmEudW5saXN0ZW4oSW1iYSwnY29tbWl0JyxzZWxmLCdvbmV2ZW50JylcblxuXHQjIyNcblx0Q2hlY2sgd2hldGhlciB0aGUgY3VycmVudCBzY2hlZHVsZXIgaXMgYWN0aXZlIG9yIG5vdFxuXHRAcmV0dXJuIHtib29sfVxuXHQjIyNcblx0ZGVmIGFjdGl2ZVxuXHRcdEBhY3RpdmVcblxuXHQjIyNcblx0RGVsdGEgdGltZSBiZXR3ZWVuIHRoZSB0d28gbGFzdCB0aWNrc1xuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgZHRcblx0XHRAZHRcblxuXHQjIyNcblx0Q29uZmlndXJlIHRoZSBzY2hlZHVsZXJcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBjb25maWd1cmUgb3B0aW9ucyA9IHt9XG5cdFx0cmFmID0gb3B0aW9uczpyYWYgaWYgb3B0aW9uczpyYWYgIT0gdW5kZWZpbmVkXG5cdFx0aW50ZXJ2YWwgPSBvcHRpb25zOmludGVydmFsIGlmIG9wdGlvbnM6aW50ZXJ2YWwgIT0gdW5kZWZpbmVkXG5cdFx0ZXZlbnRzID0gb3B0aW9uczpldmVudHMgaWYgb3B0aW9uczpldmVudHMgIT0gdW5kZWZpbmVkXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRNYXJrIHRoZSBzY2hlZHVsZXIgYXMgZGlydHkuIFRoaXMgd2lsbCBtYWtlIHN1cmUgdGhhdFxuXHR0aGUgc2NoZWR1bGVyIGNhbGxzIGB0YXJnZXQudGlja2Agb24gdGhlIG5leHQgZnJhbWVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBtYXJrXG5cdFx0QG1hcmtlZCA9IHllc1xuXHRcdGlmICFAc2NoZWR1bGVkXG5cdFx0XHRyZXF1ZXN0VGlja1xuXHRcdHNlbGZcblxuXHQjIyNcblx0SW5zdGFudGx5IHRyaWdnZXIgdGFyZ2V0LnRpY2sgYW5kIG1hcmsgc2NoZWR1bGVyIGFzIGNsZWFuIChub3QgZGlydHkvbWFya2VkKS5cblx0VGhpcyBpcyBjYWxsZWQgaW1wbGljaXRseSBmcm9tIHRpY2ssIGJ1dCBjYW4gYWxzbyBiZSBjYWxsZWQgbWFudWFsbHkgaWYgeW91XG5cdHJlYWxseSB3YW50IHRvIGZvcmNlIGEgdGljayB3aXRob3V0IHdhaXRpbmcgZm9yIHRoZSBuZXh0IGZyYW1lLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGZsdXNoXG5cdFx0QGZsdXNoZXMrK1xuXHRcdEB0YXJnZXQudGljayhzZWxmKVxuXHRcdEBtYXJrZWQgPSBub1xuXHRcdHNlbGZcblxuXHQjIyNcblx0QGZpeG1lIHRoaXMgZXhwZWN0cyByYWYgdG8gcnVuIGF0IDYwIGZwcyBcblxuXHRDYWxsZWQgYXV0b21hdGljYWxseSBvbiBldmVyeSBmcmFtZSB3aGlsZSB0aGUgc2NoZWR1bGVyIGlzIGFjdGl2ZS5cblx0SXQgd2lsbCBvbmx5IGNhbGwgYHRhcmdldC50aWNrYCBpZiB0aGUgc2NoZWR1bGVyIGlzIG1hcmtlZCBkaXJ0eSxcblx0b3Igd2hlbiBhY2NvcmRpbmcgdG8gQGZwcyBzZXR0aW5nLlxuXG5cdElmIHlvdSBoYXZlIHNldCB1cCBhIHNjaGVkdWxlciB3aXRoIGFuIGZwcyBvZiAxLCB0aWNrIHdpbGwgc3RpbGwgYmVcblx0Y2FsbGVkIGV2ZXJ5IGZyYW1lLCBidXQgYHRhcmdldC50aWNrYCB3aWxsIG9ubHkgYmUgY2FsbGVkIG9uY2UgZXZlcnlcblx0c2Vjb25kLCBhbmQgaXQgd2lsbCAqbWFrZSBzdXJlKiBlYWNoIGB0YXJnZXQudGlja2AgaGFwcGVucyBpbiBzZXBhcmF0ZVxuXHRzZWNvbmRzIGFjY29yZGluZyB0byBEYXRlLiBTbyBpZiB5b3UgaGF2ZSBhIG5vZGUgdGhhdCByZW5kZXJzIGEgY2xvY2tcblx0YmFzZWQgb24gRGF0ZS5ub3cgKG9yIHNvbWV0aGluZyBzaW1pbGFyKSwgeW91IGNhbiBzY2hlZHVsZSBpdCB3aXRoIDFmcHMsXG5cdG5ldmVyIG5lZWRpbmcgdG8gd29ycnkgYWJvdXQgdHdvIHRpY2tzIGhhcHBlbmluZyB3aXRoaW4gdGhlIHNhbWUgc2Vjb25kLlxuXHRUaGUgc2FtZSBnb2VzIGZvciA0ZnBzLCAxMGZwcyBldGMuXG5cblx0QHByb3RlY3RlZFxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHRpY2sgZGVsdGEsIHRpY2tlclxuXHRcdEB0aWNrcysrXG5cdFx0QGR0ID0gZGVsdGFcblxuXHRcdGlmIHRpY2tlclxuXHRcdFx0QHNjaGVkdWxlZCA9IG5vXG5cblx0XHRmbHVzaFxuXG5cdFx0aWYgQHJhZiBhbmQgQGFjdGl2ZVxuXHRcdFx0cmVxdWVzdFRpY2tcblx0XHRzZWxmXG5cblx0ZGVmIHJlcXVlc3RUaWNrXG5cdFx0dW5sZXNzIEBzY2hlZHVsZWRcblx0XHRcdEBzY2hlZHVsZWQgPSB5ZXNcblx0XHRcdEltYmEuVElDS0VSLmFkZChzZWxmKVxuXHRcdHNlbGZcblxuXHQjIyNcblx0U3RhcnQgdGhlIHNjaGVkdWxlciBpZiBpdCBpcyBub3QgYWxyZWFkeSBhY3RpdmUuXG5cdCoqV2hpbGUgYWN0aXZlKiosIHRoZSBzY2hlZHVsZXIgd2lsbCBvdmVycmlkZSBgdGFyZ2V0LmNvbW1pdGBcblx0dG8gZG8gbm90aGluZy4gQnkgZGVmYXVsdCBJbWJhLnRhZyNjb21taXQgY2FsbHMgcmVuZGVyLCBzb1xuXHR0aGF0IHJlbmRlcmluZyBpcyBjYXNjYWRlZCB0aHJvdWdoIHRvIGNoaWxkcmVuIHdoZW4gcmVuZGVyaW5nXG5cdGEgbm9kZS4gV2hlbiBhIHNjaGVkdWxlciBpcyBhY3RpdmUgKGZvciBhIG5vZGUpLCBJbWJhIGRpc2FibGVzXG5cdHRoaXMgYXV0b21hdGljIHJlbmRlcmluZy5cblx0IyMjXG5cdGRlZiBhY3RpdmF0ZSBpbW1lZGlhdGUgPSB5ZXNcblx0XHR1bmxlc3MgQGFjdGl2ZVxuXHRcdFx0QGFjdGl2ZSA9IHllc1xuXHRcdFx0QGNvbW1pdCA9IEB0YXJnZXQ6Y29tbWl0XG5cdFx0XHRAdGFyZ2V0OmNvbW1pdCA9IGRvIHRoaXNcblx0XHRcdEB0YXJnZXQ/LmZsYWcoJ3NjaGVkdWxlZF8nKVxuXHRcdFx0SW1iYS5TQ0hFRFVMRVJTLnB1c2goc2VsZilcblx0XHRcdFxuXHRcdFx0aWYgQGV2ZW50c1xuXHRcdFx0XHRJbWJhLmxpc3RlbihJbWJhLCdjb21taXQnLHNlbGYsJ29uZXZlbnQnKVxuXHRcdFx0XHRcblx0XHRcdGlmIEBpbnRlcnZhbCBhbmQgIUBpbnRlcnZhbElkXG5cdFx0XHRcdEBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoc2VsZjpvbmludGVydmFsLmJpbmQoc2VsZiksQGludGVydmFsKVxuXG5cdFx0XHRpZiBpbW1lZGlhdGVcblx0XHRcdFx0dGljaygwKVxuXHRcdFx0ZWxpZiBAcmFmXG5cdFx0XHRcdHJlcXVlc3RUaWNrXG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblx0U3RvcCB0aGUgc2NoZWR1bGVyIGlmIGl0IGlzIGFjdGl2ZS5cblx0IyMjXG5cdGRlZiBkZWFjdGl2YXRlXG5cdFx0aWYgQGFjdGl2ZVxuXHRcdFx0QGFjdGl2ZSA9IG5vXG5cdFx0XHRAdGFyZ2V0OmNvbW1pdCA9IEBjb21taXRcblx0XHRcdGxldCBpZHggPSBJbWJhLlNDSEVEVUxFUlMuaW5kZXhPZihzZWxmKVxuXHRcdFx0aWYgaWR4ID49IDBcblx0XHRcdFx0SW1iYS5TQ0hFRFVMRVJTLnNwbGljZShpZHgsMSlcblx0XHRcdFx0XG5cdFx0XHRpZiBAZXZlbnRzXG5cdFx0XHRcdEltYmEudW5saXN0ZW4oSW1iYSwnY29tbWl0JyxzZWxmLCdvbmV2ZW50JylcblxuXHRcdFx0aWYgQGludGVydmFsSWRcblx0XHRcdFx0Y2xlYXJJbnRlcnZhbChAaW50ZXJ2YWxJZClcblx0XHRcdFx0QGludGVydmFsSWQgPSBudWxsXG5cdFx0XHRcblx0XHRcdEB0YXJnZXQ/LnVuZmxhZygnc2NoZWR1bGVkXycpXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgdHJhY2tcblx0XHRAbWFya2VyXG5cdFx0XG5cdGRlZiBvbmludGVydmFsXG5cdFx0dGlja1xuXHRcdEltYmEuVGFnTWFuYWdlci5yZWZyZXNoXG5cdFx0c2VsZlxuXG5cdGRlZiBvbmV2ZW50IGV2ZW50XG5cdFx0cmV0dXJuIHNlbGYgaWYgIUBldmVudHMgb3IgQG1hcmtlZFxuXG5cdFx0aWYgQGV2ZW50cyBpc2EgRnVuY3Rpb25cblx0XHRcdG1hcmsgaWYgQGV2ZW50cyhldmVudCxzZWxmKVxuXHRcdGVsaWYgQGV2ZW50cyBpc2EgQXJyYXlcblx0XHRcdGlmIEBldmVudHMuaW5kZXhPZigoZXZlbnQgYW5kIGV2ZW50OnR5cGUpIG9yIGV2ZW50KSA+PSAwXG5cdFx0XHRcdG1hcmtcblx0XHRlbHNlXG5cdFx0XHRtYXJrXG5cdFx0c2VsZlxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvc2NoZWR1bGVyLmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbnJlcXVpcmUgJy4vbWFuYWdlcidcblxuSW1iYS5UYWdNYW5hZ2VyID0gSW1iYS5UYWdNYW5hZ2VyQ2xhc3MubmV3XG5cbnJlcXVpcmUgJy4vdGFnJ1xucmVxdWlyZSAnLi9odG1sJ1xucmVxdWlyZSAnLi9wb2ludGVyJ1xucmVxdWlyZSAnLi90b3VjaCdcbnJlcXVpcmUgJy4vZXZlbnQnXG5yZXF1aXJlICcuL2V2ZW50LW1hbmFnZXInXG5cbmlmICR3ZWIkXG5cdHJlcXVpcmUgJy4vcmVjb25jaWxlcidcblxuaWYgJG5vZGUkXG5cdHJlcXVpcmUgJy4vc2VydmVyJ1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9pbmRleC5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG5jbGFzcyBJbWJhLlRhZ01hbmFnZXJDbGFzc1xuXHRkZWYgaW5pdGlhbGl6ZVxuXHRcdEBpbnNlcnRzID0gMFxuXHRcdEByZW1vdmVzID0gMFxuXHRcdEBtb3VudGVkID0gW11cblx0XHRAaGFzTW91bnRhYmxlcyA9IG5vXG5cdFx0c2VsZlxuXG5cdGRlZiBtb3VudGVkXG5cdFx0QG1vdW50ZWRcblxuXHRkZWYgaW5zZXJ0IG5vZGUsIHBhcmVudFxuXHRcdEBpbnNlcnRzKytcblxuXHRkZWYgcmVtb3ZlIG5vZGUsIHBhcmVudFxuXHRcdEByZW1vdmVzKytcblxuXHRkZWYgY2hhbmdlc1xuXHRcdEBpbnNlcnRzICsgQHJlbW92ZXNcblxuXHRkZWYgbW91bnQgbm9kZVxuXHRcdHJldHVybiBpZiAkbm9kZSRcblx0XHRAaGFzTW91bnRhYmxlcyA9IHllc1xuXG5cdGRlZiByZWZyZXNoIGZvcmNlID0gbm9cblx0XHRyZXR1cm4gaWYgJG5vZGUkXG5cdFx0cmV0dXJuIGlmICFmb3JjZSBhbmQgY2hhbmdlcyA9PSAwXG5cdFx0IyBjb25zb2xlLnRpbWUoJ3Jlc29sdmVNb3VudHMnKVxuXHRcdGlmIChAaW5zZXJ0cyBhbmQgQGhhc01vdW50YWJsZXMpIG9yIGZvcmNlXG5cdFx0XHR0cnlNb3VudFxuXG5cdFx0aWYgKEByZW1vdmVzIG9yIGZvcmNlKSBhbmQgQG1vdW50ZWQ6bGVuZ3RoXG5cdFx0XHR0cnlVbm1vdW50XG5cdFx0IyBjb25zb2xlLnRpbWVFbmQoJ3Jlc29sdmVNb3VudHMnKVxuXHRcdEBpbnNlcnRzID0gMFxuXHRcdEByZW1vdmVzID0gMFxuXHRcdHNlbGZcblxuXHRkZWYgdW5tb3VudCBub2RlXG5cdFx0c2VsZlxuXG5cdGRlZiB0cnlNb3VudFxuXHRcdHZhciBjb3VudCA9IDBcblx0XHR2YXIgcm9vdCA9IGRvY3VtZW50OmJvZHlcblx0XHR2YXIgaXRlbXMgPSByb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy5fX21vdW50Jylcblx0XHQjIHdoYXQgaWYgd2UgZW5kIHVwIGNyZWF0aW5nIGFkZGl0aW9uYWwgbW91bnRhYmxlcyBieSBtb3VudGluZz9cblx0XHRmb3IgZWwgaW4gaXRlbXNcblx0XHRcdGlmIGVsIGFuZCBlbC5AdGFnXG5cdFx0XHRcdGlmIEBtb3VudGVkLmluZGV4T2YoZWwuQHRhZykgPT0gLTFcblx0XHRcdFx0XHRtb3VudE5vZGUoZWwuQHRhZylcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBtb3VudE5vZGUgbm9kZVxuXHRcdEBtb3VudGVkLnB1c2gobm9kZSlcblx0XHRub2RlLkZMQUdTIHw9IEltYmEuVEFHX01PVU5URURcblx0XHRub2RlLm1vdW50IGlmIG5vZGU6bW91bnRcblx0XHRyZXR1cm5cblxuXHRkZWYgdHJ5VW5tb3VudFxuXHRcdHZhciBjb3VudCA9IDBcblx0XHR2YXIgcm9vdCA9IGRvY3VtZW50OmJvZHlcblx0XHRmb3IgaXRlbSwgaSBpbiBAbW91bnRlZFxuXHRcdFx0dW5sZXNzIGRvY3VtZW50OmRvY3VtZW50RWxlbWVudC5jb250YWlucyhpdGVtLkBkb20pXG5cdFx0XHRcdGl0ZW0uRkxBR1MgPSBpdGVtLkZMQUdTICYgfkltYmEuVEFHX01PVU5URURcblx0XHRcdFx0aWYgaXRlbTp1bm1vdW50IGFuZCBpdGVtLkBkb21cblx0XHRcdFx0XHRpdGVtLnVubW91bnRcblx0XHRcdFx0ZWxpZiBpdGVtLkBzY2hlZHVsZXJcblx0XHRcdFx0XHQjIE1BWUJFIEZJWCBUSElTP1xuXHRcdFx0XHRcdGl0ZW0udW5zY2hlZHVsZVxuXHRcdFx0XHRAbW91bnRlZFtpXSA9IG51bGxcblx0XHRcdFx0Y291bnQrK1xuXHRcdFxuXHRcdGlmIGNvdW50XG5cdFx0XHRAbW91bnRlZCA9IEBtb3VudGVkLmZpbHRlciBkbyB8aXRlbXwgaXRlbVxuXHRcdHNlbGZcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vbWFuYWdlci5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG5JbWJhLkNTU0tleU1hcCA9IHt9XG5cbkltYmEuVEFHX0JVSUxUID0gMVxuSW1iYS5UQUdfU0VUVVAgPSAyXG5JbWJhLlRBR19NT1VOVElORyA9IDRcbkltYmEuVEFHX01PVU5URUQgPSA4XG5JbWJhLlRBR19TQ0hFRFVMRUQgPSAxNlxuSW1iYS5UQUdfQVdBS0VORUQgPSAzMlxuXG4jIyNcbkdldCB0aGUgY3VycmVudCBkb2N1bWVudFxuIyMjXG5kZWYgSW1iYS5kb2N1bWVudFxuXHRpZiAkd2ViJFxuXHRcdHdpbmRvdzpkb2N1bWVudFxuXHRlbHNlXG5cdFx0QGRvY3VtZW50IHx8PSBJbWJhU2VydmVyRG9jdW1lbnQubmV3XG5cbiMjI1xuR2V0IHRoZSBib2R5IGVsZW1lbnQgd3JhcHBlZCBpbiBhbiBJbWJhLlRhZ1xuIyMjXG5kZWYgSW1iYS5yb290XG5cdHRhZyhJbWJhLmRvY3VtZW50OmJvZHkpXG5cbmRlZiBJbWJhLnN0YXRpYyBpdGVtcywgdHlwLCBuclxuXHRpdGVtcy5AdHlwZSA9IHR5cFxuXHRpdGVtczpzdGF0aWMgPSBuclxuXHRyZXR1cm4gaXRlbXNcblxuIyMjXG5cbiMjI1xuZGVmIEltYmEubW91bnQgbm9kZSwgaW50b1xuXHRpbnRvIHx8PSBJbWJhLmRvY3VtZW50OmJvZHlcblx0aW50by5hcHBlbmRDaGlsZChub2RlLmRvbSlcblx0SW1iYS5UYWdNYW5hZ2VyLmluc2VydChub2RlLGludG8pXG5cdG5vZGUuc2NoZWR1bGVyLmNvbmZpZ3VyZShldmVudHM6IHllcykuYWN0aXZhdGUobm8pXG5cdEltYmEuVGFnTWFuYWdlci5yZWZyZXNoXG5cdHJldHVybiBub2RlXG5cblxuZGVmIEltYmEuY3JlYXRlVGV4dE5vZGUgbm9kZVxuXHRpZiBub2RlIGFuZCBub2RlOm5vZGVUeXBlID09IDNcblx0XHRyZXR1cm4gbm9kZVxuXHRyZXR1cm4gSW1iYS5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShub2RlKVxuXG4jIyNcblRoaXMgaXMgdGhlIGJhc2VjbGFzcyB0aGF0IGFsbCB0YWdzIGluIGltYmEgaW5oZXJpdCBmcm9tLlxuQGluYW1lIG5vZGVcbiMjI1xuY2xhc3MgSW1iYS5UYWdcblxuXHRkZWYgc2VsZi5idWlsZE5vZGVcblx0XHR2YXIgZG9tID0gSW1iYS5kb2N1bWVudC5jcmVhdGVFbGVtZW50KEBub2RlVHlwZSBvciAnZGl2Jylcblx0XHRpZiBAY2xhc3Nlc1xuXHRcdFx0dmFyIGNscyA9IEBjbGFzc2VzLmpvaW4oXCIgXCIpXG5cdFx0XHRkb206Y2xhc3NOYW1lID0gY2xzIGlmIGNsc1xuXHRcdGRvbVxuXG5cdGRlZiBzZWxmLmNyZWF0ZU5vZGVcblx0XHR2YXIgcHJvdG8gPSAoQHByb3RvRG9tIHx8PSBidWlsZE5vZGUpXG5cdFx0cHJvdG8uY2xvbmVOb2RlKGZhbHNlKVxuXG5cdGRlZiBzZWxmLmJ1aWxkIGN0eFxuXHRcdHNlbGYubmV3KHNlbGYuY3JlYXRlTm9kZSxjdHgpXG5cblx0ZGVmIHNlbGYuZG9tXG5cdFx0QHByb3RvRG9tIHx8PSBidWlsZE5vZGVcblxuXHQjIyNcblx0Q2FsbGVkIHdoZW4gYSB0YWcgdHlwZSBpcyBiZWluZyBzdWJjbGFzc2VkLlxuXHQjIyNcblx0ZGVmIHNlbGYuaW5oZXJpdCBjaGlsZFxuXHRcdGNoaWxkLkBwcm90b0RvbSA9IG51bGxcblxuXHRcdGlmIEBub2RlVHlwZVxuXHRcdFx0Y2hpbGQuQG5vZGVUeXBlID0gQG5vZGVUeXBlXG5cdFx0XHRjaGlsZC5AY2xhc3NlcyA9IEBjbGFzc2VzLnNsaWNlXG5cblx0XHRcdGlmIGNoaWxkLkBmbGFnTmFtZVxuXHRcdFx0XHRjaGlsZC5AY2xhc3Nlcy5wdXNoKGNoaWxkLkBmbGFnTmFtZSlcblx0XHRlbHNlXG5cdFx0XHRjaGlsZC5Abm9kZVR5cGUgPSBjaGlsZC5AbmFtZVxuXHRcdFx0Y2hpbGQuQGZsYWdOYW1lID0gbnVsbFxuXHRcdFx0Y2hpbGQuQGNsYXNzZXMgPSBbXVxuXG5cdCMjI1xuXHRJbnRlcm5hbCBtZXRob2QgY2FsbGVkIGFmdGVyIGEgdGFnIGNsYXNzIGhhc1xuXHRiZWVuIGRlY2xhcmVkIG9yIGV4dGVuZGVkLlxuXHRcblx0QHByaXZhdGVcblx0IyMjXG5cdGRlZiBvcHRpbWl6ZVRhZ1N0cnVjdHVyZVxuXHRcdHZhciBiYXNlID0gSW1iYS5UYWc6cHJvdG90eXBlXG5cdFx0dmFyIGhhc1NldHVwICA9IHNlbGY6c2V0dXAgICE9IGJhc2U6c2V0dXBcblx0XHR2YXIgaGFzQ29tbWl0ID0gc2VsZjpjb21taXQgIT0gYmFzZTpjb21taXRcblx0XHR2YXIgaGFzUmVuZGVyID0gc2VsZjpyZW5kZXIgIT0gYmFzZTpyZW5kZXJcblx0XHR2YXIgaGFzTW91bnQgID0gc2VsZjptb3VudFxuXG5cdFx0dmFyIGN0b3IgPSBzZWxmOmNvbnN0cnVjdG9yXG5cblx0XHRpZiBoYXNDb21taXQgb3IgaGFzUmVuZGVyIG9yIGhhc01vdW50IG9yIGhhc1NldHVwXG5cblx0XHRcdHNlbGY6ZW5kID0gZG9cblx0XHRcdFx0aWYgdGhpczptb3VudCBhbmQgISh0aGlzLkZMQUdTICYgSW1iYS5UQUdfTU9VTlRFRClcblx0XHRcdFx0XHQjIGp1c3QgYWN0aXZhdGUgXG5cdFx0XHRcdFx0SW1iYS5UYWdNYW5hZ2VyLm1vdW50KHRoaXMpXG5cblx0XHRcdFx0dW5sZXNzIHRoaXMuRkxBR1MgJiBJbWJhLlRBR19TRVRVUFxuXHRcdFx0XHRcdHRoaXMuRkxBR1MgfD0gSW1iYS5UQUdfU0VUVVBcblx0XHRcdFx0XHR0aGlzLnNldHVwXG5cdFx0XHRcdFxuXHRcdFx0XHR0aGlzLmNvbW1pdFxuXG5cdFx0XHRcdHJldHVybiB0aGlzXG5cblx0XHRpZiAkd2ViJFxuXHRcdFx0aWYgaGFzTW91bnRcblx0XHRcdFx0aWYgY3Rvci5AY2xhc3NlcyBhbmQgY3Rvci5AY2xhc3Nlcy5pbmRleE9mKCdfX21vdW50JykgID09IC0xXG5cdFx0XHRcdFx0Y3Rvci5AY2xhc3Nlcy5wdXNoKCdfX21vdW50JylcblxuXHRcdFx0XHRpZiBjdG9yLkBwcm90b0RvbVxuXHRcdFx0XHRcdGN0b3IuQHByb3RvRG9tOmNsYXNzTGlzdC5hZGQoJ19fbW91bnQnKVxuXG5cdFx0XHRmb3IgaXRlbSBpbiBbOm1vdXNlbW92ZSw6bW91c2VlbnRlciw6bW91c2VsZWF2ZSw6bW91c2VvdmVyLDptb3VzZW91dCw6c2VsZWN0c3RhcnRdXG5cdFx0XHRcdEltYmEuRXZlbnRzLnJlZ2lzdGVyKGl0ZW0pIGlmIHRoaXNbXCJvbntpdGVtfVwiXVxuXHRcdHNlbGZcblxuXG5cdGRlZiBpbml0aWFsaXplIGRvbSxjdHhcblx0XHRzZWxmLmRvbSA9IGRvbVxuXHRcdHNlbGY6JCA9IFRhZ0NhY2hlLmJ1aWxkKHNlbGYpXG5cdFx0c2VsZjokdXAgPSBAb3duZXJfID0gY3R4XG5cdFx0QHRyZWVfID0gbnVsbFxuXHRcdHNlbGYuRkxBR1MgPSAwXG5cdFx0YnVpbGRcblx0XHRzZWxmXG5cblx0YXR0ciBuYW1lIGlubGluZTogbm9cblx0YXR0ciByb2xlIGlubGluZTogbm9cblx0YXR0ciB0YWJpbmRleCBpbmxpbmU6IG5vXG5cdGF0dHIgdGl0bGVcblxuXHRkZWYgZG9tXG5cdFx0QGRvbVxuXHRcdFxuXHRkZWYgc2V0RG9tIGRvbVxuXHRcdGRvbS5AdGFnID0gc2VsZlxuXHRcdEBkb20gPSBkb21cblx0XHRzZWxmXG5cblx0ZGVmIHJlZlxuXHRcdEByZWZcblx0XHRcblx0ZGVmIHJvb3Rcblx0XHRAb3duZXJfID8gQG93bmVyXy5yb290IDogc2VsZlxuXG5cdCMjI1xuXHRTZXR0aW5nIHJlZmVyZW5jZXMgZm9yIHRhZ3MgbGlrZVxuXHRgPGRpdkBoZWFkZXI+YCB3aWxsIGNvbXBpbGUgdG8gYHRhZygnZGl2JykucmVmXygnaGVhZGVyJyx0aGlzKS5lbmQoKWBcblx0QnkgZGVmYXVsdCBpdCBhZGRzIHRoZSByZWZlcmVuY2UgYXMgYSBjbGFzc05hbWUgdG8gdGhlIHRhZy5cblxuXHRAcmV0dXJuIHtzZWxmfVxuXHRAcHJpdmF0ZVxuXHQjIyNcblx0ZGVmIHJlZl8gcmVmXG5cdFx0ZmxhZyhAcmVmID0gcmVmKVxuXHRcdHNlbGZcblxuXHQjIyNcblx0U2V0IHRoZSBkYXRhIG9iamVjdCBmb3Igbm9kZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGRhdGE9IGRhdGFcblx0XHRAZGF0YSA9IGRhdGFcblxuXHQjIyNcblx0R2V0IHRoZSBkYXRhIG9iamVjdCBmb3Igbm9kZVxuXHQjIyNcblx0ZGVmIGRhdGFcblx0XHRAZGF0YVxuXHRcdFxuXHRcdFxuXHRkZWYgYmluZERhdGEgdGFyZ2V0LCBwYXRoLCBhcmdzXG5cdFx0c2V0RGF0YShhcmdzID8gdGFyZ2V0W3BhdGhdLmFwcGx5KHRhcmdldCxhcmdzKSA6IHRhcmdldFtwYXRoXSlcblxuXHQjIyNcblx0U2V0IGlubmVyIGh0bWwgb2Ygbm9kZVxuXHQjIyNcblx0ZGVmIGh0bWw9IGh0bWxcblx0XHRpZiBzZWxmLmh0bWwgIT0gaHRtbFxuXHRcdFx0QGRvbTppbm5lckhUTUwgPSBodG1sXG5cblx0IyMjXG5cdEdldCBpbm5lciBodG1sIG9mIG5vZGVcblx0IyMjXG5cdGRlZiBodG1sXG5cdFx0QGRvbTppbm5lckhUTUxcblx0XG5cdGRlZiBvbiQgc2xvdCxoYW5kbGVyLGNvbnRleHRcblx0XHRsZXQgaGFuZGxlcnMgPSBAb25fIHx8PSBbXVxuXHRcdGxldCBwcmV2ID0gaGFuZGxlcnNbc2xvdF1cblx0XHQjIHNlbGYtYm91bmQgaGFuZGxlcnNcblx0XHRpZiBzbG90IDwgMFxuXHRcdFx0aWYgcHJldiA9PSB1bmRlZmluZWRcblx0XHRcdFx0c2xvdCA9IGhhbmRsZXJzW3Nsb3RdID0gaGFuZGxlcnM6bGVuZ3RoXG5cdFx0XHRlbHNlXG5cdFx0XHRcdHNsb3QgPSBwcmV2XG5cdFx0XHRwcmV2ID0gaGFuZGxlcnNbc2xvdF1cblx0XHRcblx0XHRoYW5kbGVyc1tzbG90XSA9IGhhbmRsZXJcblx0XHRpZiBwcmV2XG5cdFx0XHRoYW5kbGVyOnN0YXRlID0gcHJldjpzdGF0ZVxuXHRcdGVsc2Vcblx0XHRcdGhhbmRsZXI6c3RhdGUgPSB7Y29udGV4dDogY29udGV4dH1cblx0XHRyZXR1cm4gc2VsZlxuXG5cblx0ZGVmIGlkPSBpZFxuXHRcdGlmIGlkICE9IG51bGxcblx0XHRcdGRvbTppZCA9IGlkXG5cblx0ZGVmIGlkXG5cdFx0ZG9tOmlkXG5cblx0IyMjXG5cdEFkZHMgYSBuZXcgYXR0cmlidXRlIG9yIGNoYW5nZXMgdGhlIHZhbHVlIG9mIGFuIGV4aXN0aW5nIGF0dHJpYnV0ZVxuXHRvbiB0aGUgc3BlY2lmaWVkIHRhZy4gSWYgdGhlIHZhbHVlIGlzIG51bGwgb3IgZmFsc2UsIHRoZSBhdHRyaWJ1dGVcblx0d2lsbCBiZSByZW1vdmVkLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNldEF0dHJpYnV0ZSBuYW1lLCB2YWx1ZVxuXHRcdHZhciBvbGQgPSBkb20uZ2V0QXR0cmlidXRlKG5hbWUpXG5cblx0XHRpZiBvbGQgPT0gdmFsdWVcblx0XHRcdHZhbHVlXG5cdFx0ZWxpZiB2YWx1ZSAhPSBudWxsICYmIHZhbHVlICE9PSBmYWxzZVxuXHRcdFx0ZG9tLnNldEF0dHJpYnV0ZShuYW1lLHZhbHVlKVxuXHRcdGVsc2Vcblx0XHRcdGRvbS5yZW1vdmVBdHRyaWJ1dGUobmFtZSlcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBzZXROZXN0ZWRBdHRyIG5zLCBuYW1lLCB2YWx1ZVxuXHRcdGlmIHNlbGZbbnMrJ1NldEF0dHJpYnV0ZSddXG5cdFx0XHRzZWxmW25zKydTZXRBdHRyaWJ1dGUnXShuYW1lLHZhbHVlKVxuXHRcdGVsc2Vcblx0XHRcdHNldEF0dHJpYnV0ZU5TKG5zLCBuYW1lLHZhbHVlKVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIHNldEF0dHJpYnV0ZU5TIG5zLCBuYW1lLCB2YWx1ZVxuXHRcdHZhciBvbGQgPSBnZXRBdHRyaWJ1dGVOUyhucyxuYW1lKVxuXG5cdFx0aWYgb2xkICE9IHZhbHVlXG5cdFx0XHRpZiB2YWx1ZSAhPSBudWxsICYmIHZhbHVlICE9PSBmYWxzZSBcblx0XHRcdFx0ZG9tLnNldEF0dHJpYnV0ZU5TKG5zLG5hbWUsdmFsdWUpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGRvbS5yZW1vdmVBdHRyaWJ1dGVOUyhucyxuYW1lKVxuXHRcdHJldHVybiBzZWxmXG5cblxuXHQjIyNcblx0cmVtb3ZlcyBhbiBhdHRyaWJ1dGUgZnJvbSB0aGUgc3BlY2lmaWVkIHRhZ1xuXHQjIyNcblx0ZGVmIHJlbW92ZUF0dHJpYnV0ZSBuYW1lXG5cdFx0ZG9tLnJlbW92ZUF0dHJpYnV0ZShuYW1lKVxuXG5cdCMjI1xuXHRyZXR1cm5zIHRoZSB2YWx1ZSBvZiBhbiBhdHRyaWJ1dGUgb24gdGhlIHRhZy5cblx0SWYgdGhlIGdpdmVuIGF0dHJpYnV0ZSBkb2VzIG5vdCBleGlzdCwgdGhlIHZhbHVlIHJldHVybmVkXG5cdHdpbGwgZWl0aGVyIGJlIG51bGwgb3IgXCJcIiAodGhlIGVtcHR5IHN0cmluZylcblx0IyMjXG5cdGRlZiBnZXRBdHRyaWJ1dGUgbmFtZVxuXHRcdGRvbS5nZXRBdHRyaWJ1dGUobmFtZSlcblxuXG5cdGRlZiBnZXRBdHRyaWJ1dGVOUyBucywgbmFtZVxuXHRcdGRvbS5nZXRBdHRyaWJ1dGVOUyhucyxuYW1lKVxuXHRcblx0XG5cdGRlZiBzZXQga2V5LCB2YWx1ZSwgbW9kc1xuXHRcdGxldCBzZXR0ZXIgPSBJbWJhLnRvU2V0dGVyKGtleSlcblx0XHRpZiBzZWxmW3NldHRlcl0gaXNhIEZ1bmN0aW9uXG5cdFx0XHRzZWxmW3NldHRlcl0odmFsdWUsbW9kcylcblx0XHRlbHNlXG5cdFx0XHRAZG9tOnNldEF0dHJpYnV0ZShrZXksdmFsdWUpXG5cdFx0c2VsZlxuXHRcblx0XG5cdGRlZiBnZXQga2V5XG5cdFx0QGRvbTpnZXRBdHRyaWJ1dGUoa2V5KVxuXG5cdCMjI1xuXHRPdmVycmlkZSB0aGlzIHRvIHByb3ZpZGUgc3BlY2lhbCB3cmFwcGluZyBldGMuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0Q29udGVudCBjb250ZW50LCB0eXBlXG5cdFx0c2V0Q2hpbGRyZW4gY29udGVudCwgdHlwZVxuXHRcdHNlbGZcblxuXHQjIyNcblx0U2V0IHRoZSBjaGlsZHJlbiBvZiBub2RlLiB0eXBlIHBhcmFtIGlzIG9wdGlvbmFsLFxuXHRhbmQgc2hvdWxkIG9ubHkgYmUgdXNlZCBieSBJbWJhIHdoZW4gY29tcGlsaW5nIHRhZyB0cmVlcy4gXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0Q2hpbGRyZW4gbm9kZXMsIHR5cGVcblx0XHQjIG92ZXJyaWRkZW4gb24gY2xpZW50IGJ5IHJlY29uY2lsZXJcblx0XHRAdHJlZV8gPSBub2Rlc1xuXHRcdHNlbGZcblxuXHQjIyNcblx0U2V0IHRoZSB0ZW1wbGF0ZSB0aGF0IHdpbGwgcmVuZGVyIHRoZSBjb250ZW50IG9mIG5vZGUuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc2V0VGVtcGxhdGUgdGVtcGxhdGVcblx0XHR1bmxlc3MgQHRlbXBsYXRlXG5cdFx0XHQjIG92ZXJyaWRlIHRoZSBiYXNpY1xuXHRcdFx0aWYgc2VsZjpyZW5kZXIgPT0gSW1iYS5UYWc6cHJvdG90eXBlOnJlbmRlclxuXHRcdFx0XHRzZWxmOnJlbmRlciA9IHNlbGY6cmVuZGVyVGVtcGxhdGUgIyBkbyBzZXRDaGlsZHJlbihyZW5kZXJUZW1wbGF0ZSlcblx0XHRcdHNlbGYub3B0aW1pemVUYWdTdHJ1Y3R1cmVcblxuXHRcdHNlbGY6dGVtcGxhdGUgPSBAdGVtcGxhdGUgPSB0ZW1wbGF0ZVxuXHRcdHNlbGZcblxuXHRkZWYgdGVtcGxhdGVcblx0XHRudWxsXG5cblx0IyMjXG5cdElmIG5vIGN1c3RvbSByZW5kZXItbWV0aG9kIGlzIGRlZmluZWQsIGFuZCB0aGUgbm9kZVxuXHRoYXMgYSB0ZW1wbGF0ZSwgdGhpcyBtZXRob2Qgd2lsbCBiZSB1c2VkIHRvIHJlbmRlclxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHJlbmRlclRlbXBsYXRlXG5cdFx0dmFyIGJvZHkgPSB0ZW1wbGF0ZVxuXHRcdHNldENoaWxkcmVuKGJvZHkpIGlmIGJvZHkgIT0gc2VsZlxuXHRcdHNlbGZcblxuXG5cdCMjI1xuXHRSZW1vdmUgc3BlY2lmaWVkIGNoaWxkIGZyb20gY3VycmVudCBub2RlLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHJlbW92ZUNoaWxkIGNoaWxkXG5cdFx0dmFyIHBhciA9IGRvbVxuXHRcdHZhciBlbCA9IGNoaWxkLkBkb20gb3IgY2hpbGRcblx0XHRpZiBlbCBhbmQgZWw6cGFyZW50Tm9kZSA9PSBwYXJcblx0XHRcdHBhci5yZW1vdmVDaGlsZChlbClcblx0XHRcdEltYmEuVGFnTWFuYWdlci5yZW1vdmUoZWwuQHRhZyBvciBlbCxzZWxmKVxuXHRcdHNlbGZcblx0XG5cdCMjI1xuXHRSZW1vdmUgYWxsIGNvbnRlbnQgaW5zaWRlIG5vZGVcblx0IyMjXG5cdGRlZiByZW1vdmVBbGxDaGlsZHJlblxuXHRcdGlmIEBkb206Zmlyc3RDaGlsZFxuXHRcdFx0QGRvbS5yZW1vdmVDaGlsZChAZG9tOmZpcnN0Q2hpbGQpIHdoaWxlIEBkb206Zmlyc3RDaGlsZFxuXHRcdFx0SW1iYS5UYWdNYW5hZ2VyLnJlbW92ZShudWxsLHNlbGYpICMgc2hvdWxkIHJlZ2lzdGVyIGVhY2ggY2hpbGQ/XG5cdFx0QHRyZWVfID0gQHRleHRfID0gbnVsbFxuXHRcdHNlbGZcblxuXHQjIyNcblx0QXBwZW5kIGEgc2luZ2xlIGl0ZW0gKG5vZGUgb3Igc3RyaW5nKSB0byB0aGUgY3VycmVudCBub2RlLlxuXHRJZiBzdXBwbGllZCBpdGVtIGlzIGEgc3RyaW5nIGl0IHdpbGwgYXV0b21hdGljYWxseS4gVGhpcyBpcyB1c2VkXG5cdGJ5IEltYmEgaW50ZXJuYWxseSwgYnV0IHdpbGwgcHJhY3RpY2FsbHkgbmV2ZXIgYmUgdXNlZCBleHBsaWNpdGx5LlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGFwcGVuZENoaWxkIG5vZGVcblx0XHRpZiBub2RlIGlzYSBTdHJpbmdcblx0XHRcdGRvbS5hcHBlbmRDaGlsZChJbWJhLmRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpKVxuXHRcdGVsaWYgbm9kZVxuXHRcdFx0ZG9tLmFwcGVuZENoaWxkKG5vZGUuQGRvbSBvciBub2RlKVxuXHRcdFx0SW1iYS5UYWdNYW5hZ2VyLmluc2VydChub2RlLkB0YWcgb3Igbm9kZSwgc2VsZilcblx0XHRcdCMgRklYTUUgZW5zdXJlIHRoZXNlIGFyZSBub3QgY2FsbGVkIGZvciB0ZXh0IG5vZGVzXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRJbnNlcnQgYSBub2RlIGludG8gdGhlIGN1cnJlbnQgbm9kZSAoc2VsZiksIGJlZm9yZSBhbm90aGVyLlxuXHRUaGUgcmVsYXRpdmUgbm9kZSBtdXN0IGJlIGEgY2hpbGQgb2YgY3VycmVudCBub2RlLiBcblx0IyMjXG5cdGRlZiBpbnNlcnRCZWZvcmUgbm9kZSwgcmVsXG5cdFx0aWYgbm9kZSBpc2EgU3RyaW5nXG5cdFx0XHRub2RlID0gSW1iYS5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShub2RlKVxuXG5cdFx0aWYgbm9kZSBhbmQgcmVsXG5cdFx0XHRkb20uaW5zZXJ0QmVmb3JlKCAobm9kZS5AZG9tIG9yIG5vZGUpLCAocmVsLkBkb20gb3IgcmVsKSApXG5cdFx0XHRJbWJhLlRhZ01hbmFnZXIuaW5zZXJ0KG5vZGUuQHRhZyBvciBub2RlLCBzZWxmKVxuXHRcdFx0IyBGSVhNRSBlbnN1cmUgdGhlc2UgYXJlIG5vdCBjYWxsZWQgZm9yIHRleHQgbm9kZXNcblx0XHRzZWxmXG5cblxuXHQjIyNcblx0UmVtb3ZlIG5vZGUgZnJvbSB0aGUgZG9tIHRyZWVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBvcnBoYW5pemVcblx0XHRwYXIucmVtb3ZlQ2hpbGQoc2VsZikgaWYgbGV0IHBhciA9IHBhcmVudFxuXHRcdHJldHVybiBzZWxmXG5cblx0IyMjXG5cdEdldCB0ZXh0IG9mIG5vZGUuIFVzZXMgdGV4dENvbnRlbnQgYmVoaW5kIHRoZSBzY2VuZXMgKG5vdCBpbm5lclRleHQpXG5cdFtodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTm9kZS90ZXh0Q29udGVudF0oKVxuXHRAcmV0dXJuIHtzdHJpbmd9IGlubmVyIHRleHQgb2Ygbm9kZVxuXHQjIyNcblx0ZGVmIHRleHQgdlxuXHRcdEBkb206dGV4dENvbnRlbnRcblxuXHQjIyNcblx0U2V0IHRleHQgb2Ygbm9kZS4gVXNlcyB0ZXh0Q29udGVudCBiZWhpbmQgdGhlIHNjZW5lcyAobm90IGlubmVyVGV4dClcblx0W2h0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Ob2RlL3RleHRDb250ZW50XSgpXG5cdCMjI1xuXHRkZWYgdGV4dD0gdHh0XG5cdFx0QHRyZWVfID0gdHh0XG5cdFx0QGRvbTp0ZXh0Q29udGVudCA9ICh0eHQgPT0gbnVsbCBvciB0ZXh0ID09PSBmYWxzZSkgPyAnJyA6IHR4dFxuXHRcdHNlbGZcblxuXG5cdCMjI1xuXHRNZXRob2QgZm9yIGdldHRpbmcgYW5kIHNldHRpbmcgZGF0YS1hdHRyaWJ1dGVzLiBXaGVuIGNhbGxlZCB3aXRoIHplcm9cblx0YXJndW1lbnRzIGl0IHdpbGwgcmV0dXJuIHRoZSBhY3R1YWwgZGF0YXNldCBmb3IgdGhlIHRhZy5cblxuXHRcdHZhciBub2RlID0gPGRpdiBkYXRhLW5hbWU9J2hlbGxvJz5cblx0XHQjIGdldCB0aGUgd2hvbGUgZGF0YXNldFxuXHRcdG5vZGUuZGF0YXNldCAjIHtuYW1lOiAnaGVsbG8nfVxuXHRcdCMgZ2V0IGEgc2luZ2xlIHZhbHVlXG5cdFx0bm9kZS5kYXRhc2V0KCduYW1lJykgIyAnaGVsbG8nXG5cdFx0IyBzZXQgYSBzaW5nbGUgdmFsdWVcblx0XHRub2RlLmRhdGFzZXQoJ25hbWUnLCduZXduYW1lJykgIyBzZWxmXG5cblxuXHQjIyNcblx0ZGVmIGRhdGFzZXQga2V5LCB2YWxcblx0XHRpZiBrZXkgaXNhIE9iamVjdFxuXHRcdFx0ZGF0YXNldChrLHYpIGZvciBvd24gayx2IG9mIGtleVxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdGlmIGFyZ3VtZW50czpsZW5ndGggPT0gMlxuXHRcdFx0c2V0QXR0cmlidXRlKFwiZGF0YS17a2V5fVwiLHZhbClcblx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRpZiBrZXlcblx0XHRcdHJldHVybiBnZXRBdHRyaWJ1dGUoXCJkYXRhLXtrZXl9XCIpXG5cblx0XHR2YXIgZGF0YXNldCA9IGRvbTpkYXRhc2V0XG5cblx0XHR1bmxlc3MgZGF0YXNldFxuXHRcdFx0ZGF0YXNldCA9IHt9XG5cdFx0XHRmb3IgYXRyLGkgaW4gZG9tOmF0dHJpYnV0ZXNcblx0XHRcdFx0aWYgYXRyOm5hbWUuc3Vic3RyKDAsNSkgPT0gJ2RhdGEtJ1xuXHRcdFx0XHRcdGRhdGFzZXRbSW1iYS50b0NhbWVsQ2FzZShhdHI6bmFtZS5zbGljZSg1KSldID0gYXRyOnZhbHVlXG5cblx0XHRyZXR1cm4gZGF0YXNldFxuXG5cdCMjI1xuXHRFbXB0eSBwbGFjZWhvbGRlci4gT3ZlcnJpZGUgdG8gaW1wbGVtZW50IGN1c3RvbSByZW5kZXIgYmVoYXZpb3VyLlxuXHRXb3JrcyBtdWNoIGxpa2UgdGhlIGZhbWlsaWFyIHJlbmRlci1tZXRob2QgaW4gUmVhY3QuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgcmVuZGVyXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRDYWxsZWQgaW1wbGljaXRseSB3aGlsZSB0YWcgaXMgaW5pdGlhbGl6aW5nLiBObyBpbml0aWFsIHByb3BzXG5cdHdpbGwgaGF2ZSBiZWVuIHNldCBhdCB0aGlzIHBvaW50LlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGJ1aWxkXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRDYWxsZWQgb25jZSwgaW1wbGljaXRseSB0aHJvdWdoIEltYmEuVGFnI2VuZC4gQWxsIGluaXRpYWwgcHJvcHNcblx0YW5kIGNoaWxkcmVuIHdpbGwgaGF2ZSBiZWVuIHNldCBiZWZvcmUgc2V0dXAgaXMgY2FsbGVkLlxuXHRzZXRDb250ZW50LlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNldHVwXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRDYWxsZWQgaW1wbGljaXRseSB0aHJvdWdoIEltYmEuVGFnI2VuZCwgZm9yIHRhZ3MgdGhhdCBhcmUgcGFydCBvZlxuXHRhIHRhZyB0cmVlICh0aGF0IGFyZSByZW5kZXJlZCBzZXZlcmFsIHRpbWVzKS5cblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBjb21taXRcblx0XHRyZW5kZXJcblx0XHRzZWxmXG5cblx0IyMjXG5cblx0Q2FsbGVkIGJ5IHRoZSB0YWctc2NoZWR1bGVyIChpZiB0aGlzIHRhZyBpcyBzY2hlZHVsZWQpXG5cdEJ5IGRlZmF1bHQgaXQgd2lsbCBjYWxsIHRoaXMucmVuZGVyLiBEbyBub3Qgb3ZlcnJpZGUgdW5sZXNzXG5cdHlvdSByZWFsbHkgdW5kZXJzdGFuZCBpdC5cblxuXHQjIyNcblx0ZGVmIHRpY2tcblx0XHRyZW5kZXJcblx0XHRzZWxmXG5cblx0IyMjXG5cdFxuXHRBIHZlcnkgaW1wb3J0YW50IG1ldGhvZCB0aGF0IHlvdSB3aWxsIHByYWN0aWNhbGx5IG5ldmVyIG1hbnVhbGx5LlxuXHRUaGUgdGFnIHN5bnRheCBvZiBJbWJhIGNvbXBpbGVzIHRvIGEgY2hhaW4gb2Ygc2V0dGVycywgd2hpY2ggYWx3YXlzXG5cdGVuZHMgd2l0aCAuZW5kLiBgPGEubGFyZ2U+YCBjb21waWxlcyB0byBgdGFnKCdhJykuZmxhZygnbGFyZ2UnKS5lbmQoKWBcblx0XG5cdFlvdSBhcmUgaGlnaGx5IGFkdmljZWQgdG8gbm90IG92ZXJyaWRlIGl0cyBiZWhhdmlvdXIuIFRoZSBmaXJzdCB0aW1lXG5cdGVuZCBpcyBjYWxsZWQgaXQgd2lsbCBtYXJrIHRoZSB0YWcgYXMgaW5pdGlhbGl6ZWQgYW5kIGNhbGwgSW1iYS5UYWcjc2V0dXAsXG5cdGFuZCBjYWxsIEltYmEuVGFnI2NvbW1pdCBldmVyeSB0aW1lLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGVuZFxuXHRcdHNlbGZcblx0XHRcblx0IyBjYWxsZWQgb24gPHNlbGY+IHRvIGNoZWNrIGlmIHNlbGYgaXMgY2FsbGVkIGZyb20gb3RoZXIgcGxhY2VzXG5cdGRlZiAkb3BlbiBjb250ZXh0XG5cdFx0aWYgY29udGV4dCAhPSBAY29udGV4dF9cblx0XHRcdEB0cmVlXyA9IG51bGxcblx0XHRcdEBjb250ZXh0XyA9IGNvbnRleHRcblx0XHRzZWxmXG5cblx0IyMjXG5cdFRoaXMgaXMgY2FsbGVkIGluc3RlYWQgb2YgSW1iYS5UYWcjZW5kIGZvciBgPHNlbGY+YCB0YWcgY2hhaW5zLlxuXHREZWZhdWx0cyB0byBub29wXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc3luY2VkXG5cdFx0c2VsZlxuXG5cdCMgY2FsbGVkIHdoZW4gdGhlIG5vZGUgaXMgYXdha2VuZWQgaW4gdGhlIGRvbSAtIGVpdGhlciBhdXRvbWF0aWNhbGx5XG5cdCMgdXBvbiBhdHRhY2htZW50IHRvIHRoZSBkb20tdHJlZSwgb3IgdGhlIGZpcnN0IHRpbWUgaW1iYSBuZWVkcyB0aGVcblx0IyB0YWcgZm9yIGEgZG9tbm9kZSB0aGF0IGhhcyBiZWVuIHJlbmRlcmVkIG9uIHRoZSBzZXJ2ZXJcblx0ZGVmIGF3YWtlblxuXHRcdHNlbGZcblxuXHQjIyNcblx0TGlzdCBvZiBmbGFncyBmb3IgdGhpcyBub2RlLiBcblx0IyMjXG5cdGRlZiBmbGFnc1xuXHRcdEBkb206Y2xhc3NMaXN0XG5cblx0IyMjXG5cdEFkZCBzcGVmaWNpZWQgZmxhZyB0byBjdXJyZW50IG5vZGUuXG5cdElmIGEgc2Vjb25kIGFyZ3VtZW50IGlzIHN1cHBsaWVkLCBpdCB3aWxsIGJlIGNvZXJjZWQgaW50byBhIEJvb2xlYW4sXG5cdGFuZCB1c2VkIHRvIGluZGljYXRlIHdoZXRoZXIgd2Ugc2hvdWxkIHJlbW92ZSB0aGUgZmxhZyBpbnN0ZWFkLlxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIGZsYWcgbmFtZSwgdG9nZ2xlclxuXHRcdCMgaXQgaXMgbW9zdCBuYXR1cmFsIHRvIHRyZWF0IGEgc2Vjb25kIHVuZGVmaW5lZCBhcmd1bWVudCBhcyBhIG5vLXN3aXRjaFxuXHRcdCMgc28gd2UgbmVlZCB0byBjaGVjayB0aGUgYXJndW1lbnRzLWxlbmd0aFxuXHRcdGlmIGFyZ3VtZW50czpsZW5ndGggPT0gMlxuXHRcdFx0aWYgQGRvbTpjbGFzc0xpc3QuY29udGFpbnMobmFtZSkgIT0gISF0b2dnbGVyXG5cdFx0XHRcdEBkb206Y2xhc3NMaXN0LnRvZ2dsZShuYW1lKVxuXHRcdGVsc2Vcblx0XHRcdCMgZmlyZWZveCB3aWxsIHRyaWdnZXIgYSBjaGFuZ2UgaWYgYWRkaW5nIGV4aXN0aW5nIGNsYXNzXG5cdFx0XHRAZG9tOmNsYXNzTGlzdC5hZGQobmFtZSkgdW5sZXNzIEBkb206Y2xhc3NMaXN0LmNvbnRhaW5zKG5hbWUpXG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblx0UmVtb3ZlIHNwZWNpZmllZCBmbGFnIGZyb20gbm9kZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHVuZmxhZyBuYW1lXG5cdFx0QGRvbTpjbGFzc0xpc3QucmVtb3ZlKG5hbWUpXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRUb2dnbGUgc3BlY2lmaWVkIGZsYWcgb24gbm9kZVxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHRvZ2dsZUZsYWcgbmFtZVxuXHRcdEBkb206Y2xhc3NMaXN0LnRvZ2dsZShuYW1lKVxuXHRcdHNlbGZcblxuXHQjIyNcblx0Q2hlY2sgd2hldGhlciBjdXJyZW50IG5vZGUgaGFzIHNwZWNpZmllZCBmbGFnXG5cdEByZXR1cm4ge2Jvb2x9XG5cdCMjI1xuXHRkZWYgaGFzRmxhZyBuYW1lXG5cdFx0QGRvbTpjbGFzc0xpc3QuY29udGFpbnMobmFtZSlcblxuXHRcblx0ZGVmIGZsYWdJZiBmbGFnLCBib29sXG5cdFx0dmFyIGYgPSBAZmxhZ3NfIHx8PSB7fVxuXHRcdGxldCBwcmV2ID0gZltmbGFnXVxuXG5cdFx0aWYgYm9vbCBhbmQgIXByZXZcblx0XHRcdEBkb206Y2xhc3NMaXN0LmFkZChmbGFnKVxuXHRcdFx0ZltmbGFnXSA9IHllc1xuXHRcdGVsaWYgcHJldiBhbmQgIWJvb2xcblx0XHRcdEBkb206Y2xhc3NMaXN0LnJlbW92ZShmbGFnKVxuXHRcdFx0ZltmbGFnXSA9IG5vXG5cblx0XHRyZXR1cm4gc2VsZlxuXHRcdFxuXHQjIyNcblx0U2V0L3VwZGF0ZSBhIG5hbWVkIGZsYWcuIEl0IHJlbWVtYmVycyB0aGUgcHJldmlvdXNcblx0dmFsdWUgb2YgdGhlIGZsYWcsIGFuZCByZW1vdmVzIGl0IGJlZm9yZSBzZXR0aW5nIHRoZSBuZXcgdmFsdWUuXG5cblx0XHRub2RlLnNldEZsYWcoJ3R5cGUnLCd0b2RvJylcblx0XHRub2RlLnNldEZsYWcoJ3R5cGUnLCdwcm9qZWN0Jylcblx0XHQjIHRvZG8gaXMgcmVtb3ZlZCwgcHJvamVjdCBpcyBhZGRlZC5cblxuXHRAcmV0dXJuIHtzZWxmfVxuXHQjIyNcblx0ZGVmIHNldEZsYWcgbmFtZSwgdmFsdWVcblx0XHRsZXQgZmxhZ3MgPSBAbmFtZWRGbGFnc18gfHw9IHt9XG5cdFx0bGV0IHByZXYgPSBmbGFnc1tuYW1lXVxuXHRcdGlmIHByZXYgIT0gdmFsdWVcblx0XHRcdHVuZmxhZyhwcmV2KSBpZiBwcmV2XG5cdFx0XHRmbGFnKHZhbHVlKSBpZiB2YWx1ZVxuXHRcdFx0ZmxhZ3NbbmFtZV0gPSB2YWx1ZVxuXHRcdHJldHVybiBzZWxmXG5cblxuXHQjIyNcblx0R2V0IHRoZSBzY2hlZHVsZXIgZm9yIHRoaXMgbm9kZS4gQSBuZXcgc2NoZWR1bGVyIHdpbGwgYmUgY3JlYXRlZFxuXHRpZiBpdCBkb2VzIG5vdCBhbHJlYWR5IGV4aXN0LlxuXG5cdEByZXR1cm4ge0ltYmEuU2NoZWR1bGVyfVxuXHQjIyNcblx0ZGVmIHNjaGVkdWxlclxuXHRcdEBzY2hlZHVsZXIgPz0gSW1iYS5TY2hlZHVsZXIubmV3KHNlbGYpXG5cblx0IyMjXG5cblx0U2hvcnRoYW5kIHRvIHN0YXJ0IHNjaGVkdWxpbmcgYSBub2RlLiBUaGUgbWV0aG9kIHdpbGwgYmFzaWNhbGx5XG5cdHByb3h5IHRoZSBhcmd1bWVudHMgdGhyb3VnaCB0byBzY2hlZHVsZXIuY29uZmlndXJlLCBhbmQgdGhlblxuXHRhY3RpdmF0ZSB0aGUgc2NoZWR1bGVyLlxuXHRcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBzY2hlZHVsZSBvcHRpb25zID0ge2V2ZW50czogeWVzfVxuXHRcdHNjaGVkdWxlci5jb25maWd1cmUob3B0aW9ucykuYWN0aXZhdGVcblx0XHRzZWxmXG5cblx0IyMjXG5cdFNob3J0aGFuZCBmb3IgZGVhY3RpdmF0aW5nIHNjaGVkdWxlciAoaWYgdGFnIGhhcyBvbmUpLlxuXHRAZGVwcmVjYXRlZFxuXHQjIyNcblx0ZGVmIHVuc2NoZWR1bGVcblx0XHRzY2hlZHVsZXIuZGVhY3RpdmF0ZSBpZiBAc2NoZWR1bGVyXG5cdFx0c2VsZlxuXG5cblx0IyMjXG5cdEdldCB0aGUgcGFyZW50IG9mIGN1cnJlbnQgbm9kZVxuXHRAcmV0dXJuIHtJbWJhLlRhZ30gXG5cdCMjI1xuXHRkZWYgcGFyZW50XG5cdFx0SW1iYS5nZXRUYWdGb3JEb20oZG9tOnBhcmVudE5vZGUpXG5cblx0IyMjXG5cdEdldCB0aGUgY2hpbGRyZW4gb2Ygbm9kZVxuXHRAcmV0dXJuIHtJbWJhLlRhZ1tdfVxuXHQjIyNcblx0ZGVmIGNoaWxkcmVuIHNlbFxuXHRcdGZvciBpdGVtIGluIEBkb206Y2hpbGRyZW5cblx0XHRcdGl0ZW0uQHRhZyBvciBJbWJhLmdldFRhZ0ZvckRvbShpdGVtKVxuXHRcblx0ZGVmIHF1ZXJ5U2VsZWN0b3IgcVxuXHRcdEltYmEuZ2V0VGFnRm9yRG9tKEBkb20ucXVlcnlTZWxlY3RvcihxKSlcblxuXHRkZWYgcXVlcnlTZWxlY3RvckFsbCBxXG5cdFx0dmFyIGl0ZW1zID0gW11cblx0XHRmb3IgaXRlbSBpbiBAZG9tLnF1ZXJ5U2VsZWN0b3JBbGwocSlcblx0XHRcdGl0ZW1zLnB1c2goIEltYmEuZ2V0VGFnRm9yRG9tKGl0ZW0pIClcblx0XHRyZXR1cm4gaXRlbXNcblxuXHQjIyNcblx0Q2hlY2sgaWYgdGhpcyBub2RlIG1hdGNoZXMgYSBzZWxlY3RvclxuXHRAcmV0dXJuIHtCb29sZWFufVxuXHQjIyNcblx0ZGVmIG1hdGNoZXMgc2VsXG5cdFx0aWYgc2VsIGlzYSBGdW5jdGlvblxuXHRcdFx0cmV0dXJuIHNlbChzZWxmKVxuXG5cdFx0c2VsID0gc2VsLnF1ZXJ5IGlmIHNlbDpxdWVyeSBpc2EgRnVuY3Rpb25cblx0XHRpZiB2YXIgZm4gPSAoQGRvbTptYXRjaGVzIG9yIEBkb206bWF0Y2hlc1NlbGVjdG9yIG9yIEBkb206d2Via2l0TWF0Y2hlc1NlbGVjdG9yIG9yIEBkb206bXNNYXRjaGVzU2VsZWN0b3Igb3IgQGRvbTptb3pNYXRjaGVzU2VsZWN0b3IpXG5cdFx0XHRyZXR1cm4gZm4uY2FsbChAZG9tLHNlbClcblxuXHQjIyNcblx0R2V0IHRoZSBmaXJzdCBlbGVtZW50IG1hdGNoaW5nIHN1cHBsaWVkIHNlbGVjdG9yIC8gZmlsdGVyXG5cdHRyYXZlcnNpbmcgdXB3YXJkcywgYnV0IGluY2x1ZGluZyB0aGUgbm9kZSBpdHNlbGYuXG5cdEByZXR1cm4ge0ltYmEuVGFnfVxuXHQjIyNcblx0ZGVmIGNsb3Nlc3Qgc2VsXG5cdFx0SW1iYS5nZXRUYWdGb3JEb20oQGRvbS5jbG9zZXN0KHNlbCkpXG5cblx0IyMjXG5cdENoZWNrIGlmIG5vZGUgY29udGFpbnMgb3RoZXIgbm9kZVxuXHRAcmV0dXJuIHtCb29sZWFufSBcblx0IyMjXG5cdGRlZiBjb250YWlucyBub2RlXG5cdFx0ZG9tLmNvbnRhaW5zKG5vZGUuQGRvbSBvciBub2RlKVxuXG5cblx0IyMjXG5cdFNob3J0aGFuZCBmb3IgY29uc29sZS5sb2cgb24gZWxlbWVudHNcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBsb2cgKmFyZ3Ncblx0XHRhcmdzLnVuc2hpZnQoY29uc29sZSlcblx0XHRGdW5jdGlvbjpwcm90b3R5cGU6Y2FsbC5hcHBseShjb25zb2xlOmxvZywgYXJncylcblx0XHRzZWxmXG5cblx0ZGVmIGNzcyBrZXksIHZhbFxuXHRcdGlmIGtleSBpc2EgT2JqZWN0XG5cdFx0XHRjc3Moayx2KSBmb3Igb3duIGssdiBvZiBrZXlcblx0XHRcdHJldHVybiBzZWxmXG5cblx0XHR2YXIgbmFtZSA9IEltYmEuQ1NTS2V5TWFwW2tleV0gb3Iga2V5XG5cblx0XHRpZiB2YWwgPT0gbnVsbFxuXHRcdFx0ZG9tOnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpXG5cdFx0ZWxpZiB2YWwgPT0gdW5kZWZpbmVkIGFuZCBhcmd1bWVudHM6bGVuZ3RoID09IDFcblx0XHRcdHJldHVybiBkb206c3R5bGVbbmFtZV1cblx0XHRlbHNlXG5cdFx0XHRpZiB2YWwgaXNhIE51bWJlciBhbmQgbmFtZS5tYXRjaCgvd2lkdGh8aGVpZ2h0fGxlZnR8cmlnaHR8dG9wfGJvdHRvbS8pXG5cdFx0XHRcdGRvbTpzdHlsZVtuYW1lXSA9IHZhbCArIFwicHhcIlxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRkb206c3R5bGVbbmFtZV0gPSB2YWxcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBzZXRTdHlsZSBzdHlsZVxuXHRcdHNldEF0dHJpYnV0ZSgnc3R5bGUnLHN0eWxlKVxuXG5cdGRlZiBzdHlsZVxuXHRcdGdldEF0dHJpYnV0ZSgnc3R5bGUnKVxuXG5cdCMjI1xuXHRUcmlnZ2VyIGFuIGV2ZW50IGZyb20gY3VycmVudCBub2RlLiBEaXNwYXRjaGVkIHRocm91Z2ggdGhlIEltYmEgZXZlbnQgbWFuYWdlci5cblx0VG8gZGlzcGF0Y2ggYWN0dWFsIGRvbSBldmVudHMsIHVzZSBkb20uZGlzcGF0Y2hFdmVudCBpbnN0ZWFkLlxuXG5cdEByZXR1cm4ge0ltYmEuRXZlbnR9XG5cdCMjI1xuXHRkZWYgdHJpZ2dlciBuYW1lLCBkYXRhID0ge31cblx0XHQkd2ViJCA/IEltYmEuRXZlbnRzLnRyaWdnZXIobmFtZSxzZWxmLGRhdGE6IGRhdGEpIDogbnVsbFxuXG5cdCMjI1xuXHRGb2N1cyBvbiBjdXJyZW50IG5vZGVcblx0QHJldHVybiB7c2VsZn1cblx0IyMjXG5cdGRlZiBmb2N1c1xuXHRcdGRvbS5mb2N1c1xuXHRcdHNlbGZcblxuXHQjIyNcblx0UmVtb3ZlIGZvY3VzIGZyb20gY3VycmVudCBub2RlXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgYmx1clxuXHRcdGRvbS5ibHVyXG5cdFx0c2VsZlxuXG5cdGRlZiB0b1N0cmluZ1xuXHRcdGRvbTpvdXRlckhUTUxcblx0XG5cbkltYmEuVGFnOnByb3RvdHlwZTppbml0aWFsaXplID0gSW1iYS5UYWdcblxuY2xhc3MgSW1iYS5TVkdUYWcgPCBJbWJhLlRhZ1xuXG5cdGRlZiBzZWxmLm5hbWVzcGFjZVVSSVxuXHRcdFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuXG5cdGRlZiBzZWxmLmJ1aWxkTm9kZVxuXHRcdHZhciBkb20gPSBJbWJhLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2VVUkksQG5vZGVUeXBlKVxuXHRcdHZhciBjbHMgPSBAY2xhc3Nlcy5qb2luKFwiIFwiKVxuXHRcdGRvbTpjbGFzc05hbWU6YmFzZVZhbCA9IGNscyBpZiBjbHNcblx0XHRkb21cblxuXHRkZWYgc2VsZi5pbmhlcml0IGNoaWxkXG5cdFx0Y2hpbGQuQHByb3RvRG9tID0gbnVsbFxuXHRcdGlmIGNoaWxkLkBuYW1lIGluIEltYmEuU1ZHX1RBR1Ncblx0XHRcdGNoaWxkLkBub2RlVHlwZSA9IGNoaWxkLkBuYW1lXG5cdFx0XHRjaGlsZC5AY2xhc3NlcyA9IFtdXG5cdFx0ZWxzZVxuXHRcdFx0Y2hpbGQuQG5vZGVUeXBlID0gQG5vZGVUeXBlXG5cdFx0XHR2YXIgY2xhc3NOYW1lID0gXCJfXCIgKyBjaGlsZC5AbmFtZS5yZXBsYWNlKC9fL2csICctJylcblx0XHRcdGNoaWxkLkBjbGFzc2VzID0gQGNsYXNzZXMuY29uY2F0KGNsYXNzTmFtZSlcblxuSW1iYS5IVE1MX1RBR1MgPSBcImEgYWJiciBhZGRyZXNzIGFyZWEgYXJ0aWNsZSBhc2lkZSBhdWRpbyBiIGJhc2UgYmRpIGJkbyBiaWcgYmxvY2txdW90ZSBib2R5IGJyIGJ1dHRvbiBjYW52YXMgY2FwdGlvbiBjaXRlIGNvZGUgY29sIGNvbGdyb3VwIGRhdGEgZGF0YWxpc3QgZGQgZGVsIGRldGFpbHMgZGZuIGRpdiBkbCBkdCBlbSBlbWJlZCBmaWVsZHNldCBmaWdjYXB0aW9uIGZpZ3VyZSBmb290ZXIgZm9ybSBoMSBoMiBoMyBoNCBoNSBoNiBoZWFkIGhlYWRlciBociBodG1sIGkgaWZyYW1lIGltZyBpbnB1dCBpbnMga2JkIGtleWdlbiBsYWJlbCBsZWdlbmQgbGkgbGluayBtYWluIG1hcCBtYXJrIG1lbnUgbWVudWl0ZW0gbWV0YSBtZXRlciBuYXYgbm9zY3JpcHQgb2JqZWN0IG9sIG9wdGdyb3VwIG9wdGlvbiBvdXRwdXQgcCBwYXJhbSBwcmUgcHJvZ3Jlc3MgcSBycCBydCBydWJ5IHMgc2FtcCBzY3JpcHQgc2VjdGlvbiBzZWxlY3Qgc21hbGwgc291cmNlIHNwYW4gc3Ryb25nIHN0eWxlIHN1YiBzdW1tYXJ5IHN1cCB0YWJsZSB0Ym9keSB0ZCB0ZXh0YXJlYSB0Zm9vdCB0aCB0aGVhZCB0aW1lIHRpdGxlIHRyIHRyYWNrIHUgdWwgdmFyIHZpZGVvIHdiclwiLnNwbGl0KFwiIFwiKVxuSW1iYS5IVE1MX1RBR1NfVU5TQUZFID0gXCJhcnRpY2xlIGFzaWRlIGhlYWRlciBzZWN0aW9uXCIuc3BsaXQoXCIgXCIpXG5JbWJhLlNWR19UQUdTID0gXCJjaXJjbGUgZGVmcyBlbGxpcHNlIGcgbGluZSBsaW5lYXJHcmFkaWVudCBtYXNrIHBhdGggcGF0dGVybiBwb2x5Z29uIHBvbHlsaW5lIHJhZGlhbEdyYWRpZW50IHJlY3Qgc3RvcCBzdmcgdGV4dCB0c3BhblwiLnNwbGl0KFwiIFwiKVxuXG5JbWJhLkhUTUxfQVRUUlMgPVxuXHRhOiBcImhyZWYgdGFyZ2V0IGhyZWZsYW5nIG1lZGlhIGRvd25sb2FkIHJlbCB0eXBlXCJcblx0Zm9ybTogXCJtZXRob2QgYWN0aW9uIGVuY3R5cGUgYXV0b2NvbXBsZXRlIHRhcmdldFwiXG5cdGJ1dHRvbjogXCJhdXRvZm9jdXMgdHlwZVwiXG5cdGlucHV0OiBcImFjY2VwdCBkaXNhYmxlZCBmb3JtIGxpc3QgbWF4IG1heGxlbmd0aCBtaW4gcGF0dGVybiByZXF1aXJlZCBzaXplIHN0ZXAgdHlwZVwiXG5cdGxhYmVsOiBcImFjY2Vzc2tleSBmb3IgZm9ybVwiXG5cdGltZzogXCJzcmMgc3Jjc2V0XCJcblx0bGluazogXCJyZWwgdHlwZSBocmVmIG1lZGlhXCJcblx0aWZyYW1lOiBcInJlZmVycmVycG9saWN5IHNyYyBzcmNkb2Mgc2FuZGJveFwiXG5cdG1ldGE6IFwicHJvcGVydHkgY29udGVudCBjaGFyc2V0IGRlc2NcIlxuXHRvcHRncm91cDogXCJsYWJlbFwiXG5cdG9wdGlvbjogXCJsYWJlbFwiXG5cdG91dHB1dDogXCJmb3IgZm9ybVwiXG5cdG9iamVjdDogXCJ0eXBlIGRhdGEgd2lkdGggaGVpZ2h0XCJcblx0cGFyYW06IFwibmFtZSB2YWx1ZVwiXG5cdHByb2dyZXNzOiBcIm1heFwiXG5cdHNjcmlwdDogXCJzcmMgdHlwZSBhc3luYyBkZWZlciBjcm9zc29yaWdpbiBpbnRlZ3JpdHkgbm9uY2UgbGFuZ3VhZ2VcIlxuXHRzZWxlY3Q6IFwic2l6ZSBmb3JtIG11bHRpcGxlXCJcblx0dGV4dGFyZWE6IFwicm93cyBjb2xzXCJcblxuXG5JbWJhLkhUTUxfUFJPUFMgPVxuXHRpbnB1dDogXCJhdXRvZm9jdXMgYXV0b2NvbXBsZXRlIGF1dG9jb3JyZWN0IHZhbHVlIHBsYWNlaG9sZGVyIHJlcXVpcmVkIGRpc2FibGVkIG11bHRpcGxlIGNoZWNrZWQgcmVhZE9ubHlcIlxuXHR0ZXh0YXJlYTogXCJhdXRvZm9jdXMgYXV0b2NvbXBsZXRlIGF1dG9jb3JyZWN0IHZhbHVlIHBsYWNlaG9sZGVyIHJlcXVpcmVkIGRpc2FibGVkIG11bHRpcGxlIGNoZWNrZWQgcmVhZE9ubHlcIlxuXHRmb3JtOiBcIm5vdmFsaWRhdGVcIlxuXHRmaWVsZHNldDogXCJkaXNhYmxlZFwiXG5cdGJ1dHRvbjogXCJkaXNhYmxlZFwiXG5cdHNlbGVjdDogXCJhdXRvZm9jdXMgZGlzYWJsZWQgcmVxdWlyZWRcIlxuXHRvcHRpb246IFwiZGlzYWJsZWQgc2VsZWN0ZWQgdmFsdWVcIlxuXHRvcHRncm91cDogXCJkaXNhYmxlZFwiXG5cdHByb2dyZXNzOiBcInZhbHVlXCJcblx0ZmllbGRzZXQ6IFwiZGlzYWJsZWRcIlxuXHRjYW52YXM6IFwid2lkdGggaGVpZ2h0XCJcblxuZGVmIGV4dGVuZGVyIG9iaiwgc3VwXG5cdGZvciBvd24gayx2IG9mIHN1cFxuXHRcdG9ialtrXSA/PSB2XG5cblx0b2JqOnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwOnByb3RvdHlwZSlcblx0b2JqOl9fc3VwZXJfXyA9IG9iajpwcm90b3R5cGU6X19zdXBlcl9fID0gc3VwOnByb3RvdHlwZVxuXHRvYmo6cHJvdG90eXBlOmNvbnN0cnVjdG9yID0gb2JqXG5cdHN1cC5pbmhlcml0KG9iaikgaWYgc3VwOmluaGVyaXRcblx0cmV0dXJuIG9ialxuXG5kZWYgVGFnXG5cdHJldHVybiBkbyB8ZG9tLGN0eHxcblx0XHR0aGlzLmluaXRpYWxpemUoZG9tLGN0eClcblx0XHRyZXR1cm4gdGhpc1xuXG5kZWYgVGFnU3Bhd25lciB0eXBlXG5cdHJldHVybiBkbyB8em9uZXwgdHlwZS5idWlsZCh6b25lKVxuXG5cbmNsYXNzIEltYmEuVGFnc1xuXG5cdGRlZiBpbml0aWFsaXplXG5cdFx0c2VsZlxuXG5cdGRlZiBfX2Nsb25lIG5zXG5cdFx0dmFyIGNsb25lID0gT2JqZWN0LmNyZWF0ZShzZWxmKVxuXHRcdGNsb25lLkBwYXJlbnQgPSBzZWxmXG5cdFx0cmV0dXJuIGNsb25lXG5cblx0ZGVmIG5zIG5hbWVcblx0XHRzZWxmWydfJyArIG5hbWUudG9VcHBlckNhc2VdIHx8IGRlZmluZU5hbWVzcGFjZShuYW1lKVxuXG5cdGRlZiBkZWZpbmVOYW1lc3BhY2UgbmFtZVxuXHRcdHZhciBjbG9uZSA9IE9iamVjdC5jcmVhdGUoc2VsZilcblx0XHRjbG9uZS5AcGFyZW50ID0gc2VsZlxuXHRcdGNsb25lLkBucyA9IG5hbWVcblx0XHRzZWxmWydfJyArIG5hbWUudG9VcHBlckNhc2VdID0gY2xvbmVcblx0XHRyZXR1cm4gY2xvbmVcblxuXHRkZWYgYmFzZVR5cGUgbmFtZSwgbnNcblx0XHRuYW1lIGluIEltYmEuSFRNTF9UQUdTID8gJ2VsZW1lbnQnIDogJ2RpdidcblxuXHRkZWYgZGVmaW5lVGFnIGZ1bGxOYW1lLCBzdXByID0gJycsICZib2R5XG5cdFx0aWYgYm9keSBhbmQgYm9keS5Abm9kZVR5cGVcblx0XHRcdHN1cHIgPSBib2R5XG5cdFx0XHRib2R5ID0gbnVsbFxuXHRcdFx0XG5cdFx0aWYgc2VsZltmdWxsTmFtZV1cblx0XHRcdGNvbnNvbGUubG9nIFwidGFnIGFscmVhZHkgZXhpc3RzP1wiLGZ1bGxOYW1lXG5cdFx0XG5cdFx0IyBpZiBpdCBpcyBuYW1lc3BhY2VkXG5cdFx0dmFyIG5zXG5cdFx0dmFyIG5hbWUgPSBmdWxsTmFtZVxuXHRcdGxldCBuc2lkeCA9IG5hbWUuaW5kZXhPZignOicpXG5cdFx0aWYgIG5zaWR4ID49IDBcblx0XHRcdG5zID0gZnVsbE5hbWUuc3Vic3RyKDAsbnNpZHgpXG5cdFx0XHRuYW1lID0gZnVsbE5hbWUuc3Vic3RyKG5zaWR4ICsgMSlcblx0XHRcdGlmIG5zID09ICdzdmcnIGFuZCAhc3VwclxuXHRcdFx0XHRzdXByID0gJ3N2ZzplbGVtZW50J1xuXG5cdFx0c3VwciB8fD0gYmFzZVR5cGUoZnVsbE5hbWUpXG5cblx0XHRsZXQgc3VwZXJ0eXBlID0gc3VwciBpc2EgU3RyaW5nID8gZmluZFRhZ1R5cGUoc3VwcikgOiBzdXByXG5cdFx0bGV0IHRhZ3R5cGUgPSBUYWcoKVxuXG5cdFx0dGFndHlwZS5AbmFtZSA9IG5hbWVcblx0XHR0YWd0eXBlLkBmbGFnTmFtZSA9IG51bGxcblxuXHRcdGlmIG5hbWVbMF0gPT0gJyMnXG5cdFx0XHRJbWJhLlNJTkdMRVRPTlNbbmFtZS5zbGljZSgxKV0gPSB0YWd0eXBlXG5cdFx0XHRzZWxmW25hbWVdID0gdGFndHlwZVxuXHRcdGVsaWYgbmFtZVswXSA9PSBuYW1lWzBdLnRvVXBwZXJDYXNlXG5cdFx0XHR0YWd0eXBlLkBmbGFnTmFtZSA9IG5hbWVcblx0XHRlbHNlXG5cdFx0XHR0YWd0eXBlLkBmbGFnTmFtZSA9IFwiX1wiICsgZnVsbE5hbWUucmVwbGFjZSgvW19cXDpdL2csICctJylcblx0XHRcdHNlbGZbZnVsbE5hbWVdID0gdGFndHlwZVxuXG5cdFx0ZXh0ZW5kZXIodGFndHlwZSxzdXBlcnR5cGUpXG5cblx0XHRpZiBib2R5XG5cdFx0XHRib2R5LmNhbGwodGFndHlwZSx0YWd0eXBlLCB0YWd0eXBlLlRBR1Mgb3Igc2VsZilcblx0XHRcdHRhZ3R5cGUuZGVmaW5lZCBpZiB0YWd0eXBlOmRlZmluZWRcblx0XHRcdG9wdGltaXplVGFnKHRhZ3R5cGUpXG5cdFx0cmV0dXJuIHRhZ3R5cGVcblxuXHRkZWYgZGVmaW5lU2luZ2xldG9uIG5hbWUsIHN1cHIsICZib2R5XG5cdFx0ZGVmaW5lVGFnKG5hbWUsc3Vwcixib2R5KVxuXG5cdGRlZiBleHRlbmRUYWcgbmFtZSwgc3VwciA9ICcnLCAmYm9keVxuXHRcdHZhciBrbGFzcyA9IChuYW1lIGlzYSBTdHJpbmcgPyBmaW5kVGFnVHlwZShuYW1lKSA6IG5hbWUpXG5cdFx0IyBhbGxvdyBmb3IgcHJpdmF0ZSB0YWdzIGhlcmUgYXMgd2VsbD9cblx0XHRib2R5IGFuZCBib2R5LmNhbGwoa2xhc3Msa2xhc3Msa2xhc3M6cHJvdG90eXBlKSBpZiBib2R5XG5cdFx0a2xhc3MuZXh0ZW5kZWQgaWYga2xhc3M6ZXh0ZW5kZWRcblx0XHRvcHRpbWl6ZVRhZyhrbGFzcylcblx0XHRyZXR1cm4ga2xhc3NcblxuXHRkZWYgb3B0aW1pemVUYWcgdGFndHlwZVxuXHRcdHRhZ3R5cGU6cHJvdG90eXBlPy5vcHRpbWl6ZVRhZ1N0cnVjdHVyZVxuXHRcdFxuXHRkZWYgZmluZFRhZ1R5cGUgdHlwZVxuXHRcdGxldCBrbGFzcyA9IHNlbGZbdHlwZV1cblx0XHR1bmxlc3Mga2xhc3Ncblx0XHRcdGlmIHR5cGUuc3Vic3RyKDAsNCkgPT0gJ3N2ZzonXG5cdFx0XHRcdGtsYXNzID0gZGVmaW5lVGFnKHR5cGUsJ3N2ZzplbGVtZW50JylcblxuXHRcdFx0ZWxpZiBJbWJhLkhUTUxfVEFHUy5pbmRleE9mKHR5cGUpID49IDBcblx0XHRcdFx0a2xhc3MgPSBkZWZpbmVUYWcodHlwZSwnZWxlbWVudCcpXG5cblx0XHRcdFx0aWYgbGV0IGF0dHJzID0gSW1iYS5IVE1MX0FUVFJTW3R5cGVdXG5cdFx0XHRcdFx0Zm9yIG5hbWUgaW4gYXR0cnMuc3BsaXQoXCIgXCIpXG5cdFx0XHRcdFx0XHRJbWJhLmF0dHIoa2xhc3MsbmFtZSlcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRpZiBsZXQgcHJvcHMgPSBJbWJhLkhUTUxfUFJPUFNbdHlwZV1cblx0XHRcdFx0XHRmb3IgbmFtZSBpbiBwcm9wcy5zcGxpdChcIiBcIilcblx0XHRcdFx0XHRcdEltYmEuYXR0cihrbGFzcyxuYW1lLGRvbTogeWVzKVxuXHRcdHJldHVybiBrbGFzc1xuXHRcdFxuXHRkZWYgY3JlYXRlRWxlbWVudCBuYW1lLCBvd25lclxuXHRcdHZhciB0eXBcblx0XHRpZiBuYW1lIGlzYSBGdW5jdGlvblxuXHRcdFx0dHlwID0gbmFtZVxuXHRcdGVsc2VcdFx0XHRcblx0XHRcdGlmICRkZWJ1ZyRcblx0XHRcdFx0dGhyb3coXCJjYW5ub3QgZmluZCB0YWctdHlwZSB7bmFtZX1cIikgdW5sZXNzIGZpbmRUYWdUeXBlKG5hbWUpXG5cdFx0XHR0eXAgPSBmaW5kVGFnVHlwZShuYW1lKVxuXHRcdHR5cC5idWlsZChvd25lcilcblxuXG5kZWYgSW1iYS5jcmVhdGVFbGVtZW50IG5hbWUsIGN0eCwgcmVmLCBwcmVmXG5cdHZhciB0eXBlID0gbmFtZVxuXHR2YXIgcGFyZW50XG5cdGlmIG5hbWUgaXNhIEZ1bmN0aW9uXG5cdFx0dHlwZSA9IG5hbWVcblx0ZWxzZVxuXHRcdGlmICRkZWJ1ZyRcblx0XHRcdHRocm93KFwiY2Fubm90IGZpbmQgdGFnLXR5cGUge25hbWV9XCIpIHVubGVzcyBJbWJhLlRBR1MuZmluZFRhZ1R5cGUobmFtZSlcblx0XHR0eXBlID0gSW1iYS5UQUdTLmZpbmRUYWdUeXBlKG5hbWUpXG5cdFxuXHRpZiBjdHggaXNhIFRhZ01hcFxuXHRcdHBhcmVudCA9IGN0eDpwYXIkXG5cdGVsaWYgcHJlZiBpc2EgSW1iYS5UYWdcblx0XHRwYXJlbnQgPSBwcmVmXG5cdGVsc2Vcblx0XHRwYXJlbnQgPSBjdHggYW5kIHByZWYgIT0gdW5kZWZpbmVkID8gY3R4W3ByZWZdIDogKGN0eCBhbmQgY3R4LkB0YWcgb3IgY3R4KVxuXG5cdHZhciBub2RlID0gdHlwZS5idWlsZChwYXJlbnQpXG5cdFxuXHRpZiBjdHggaXNhIFRhZ01hcFxuXHRcdGN0eDppJCsrXG5cdFx0bm9kZToka2V5ID0gcmVmXG5cblx0IyBub2RlOiRyZWYgPSByZWYgaWYgcmVmXG5cdCMgY29udGV4dDppJCsrICMgb25seSBpZiBpdCBpcyBub3QgYW4gYXJyYXk/XG5cdGlmIGN0eCBhbmQgcmVmICE9IHVuZGVmaW5lZFxuXHRcdGN0eFtyZWZdID0gbm9kZVxuXG5cdHJldHVybiBub2RlXG5cbmRlZiBJbWJhLmNyZWF0ZVRhZ0NhY2hlIG93bmVyXG5cdHZhciBpdGVtID0gW11cblx0aXRlbS5AdGFnID0gb3duZXJcblx0cmV0dXJuIGl0ZW1cblxuXHR2YXIgcGFyID0gKHByZWYgIT0gdW5kZWZpbmVkID8gY3R4W3ByZWZdIDogY3R4LkB0YWcpXG5cdHZhciBub2RlID0gVGFnTWFwLm5ldyhjdHgscmVmLHBhcilcblx0Y3R4W3JlZl0gPSBub2RlXG5cdHJldHVybiBub2RlXG5cdFxuZGVmIEltYmEuY3JlYXRlVGFnTWFwIGN0eCwgcmVmLCBwcmVmXG5cdHZhciBwYXIgPSAocHJlZiAhPSB1bmRlZmluZWQgPyBwcmVmIDogY3R4LkB0YWcpXG5cdHZhciBub2RlID0gVGFnTWFwLm5ldyhjdHgscmVmLHBhcilcblx0Y3R4W3JlZl0gPSBub2RlXG5cdHJldHVybiBub2RlXG5cbmRlZiBJbWJhLmNyZWF0ZVRhZ0xpc3QgY3R4LCByZWYsIHByZWZcblx0dmFyIG5vZGUgPSBbXVxuXHRub2RlLkB0eXBlID0gNFxuXHRub2RlLkB0YWcgPSAocHJlZiAhPSB1bmRlZmluZWQgPyBwcmVmIDogY3R4LkB0YWcpXG5cdGN0eFtyZWZdID0gbm9kZVxuXHRyZXR1cm4gbm9kZVxuXG5kZWYgSW1iYS5jcmVhdGVUYWdMb29wUmVzdWx0IGN0eCwgcmVmLCBwcmVmXG5cdHZhciBub2RlID0gW11cblx0bm9kZS5AdHlwZSA9IDVcblx0bm9kZTpjYWNoZSA9IHtpJDogMH1cblx0cmV0dXJuIG5vZGVcblxuIyB1c2UgYXJyYXkgaW5zdGVhZD9cbmNsYXNzIFRhZ0NhY2hlXG5cdGRlZiBzZWxmLmJ1aWxkIG93bmVyXG5cdFx0dmFyIGl0ZW0gPSBbXVxuXHRcdGl0ZW0uQHRhZyA9IG93bmVyXG5cdFx0cmV0dXJuIGl0ZW1cblxuXHRkZWYgaW5pdGlhbGl6ZSBvd25lclxuXHRcdHNlbGYuQHRhZyA9IG93bmVyXG5cdFx0c2VsZlxuXHRcbmNsYXNzIFRhZ01hcFxuXHRcblx0ZGVmIGluaXRpYWxpemUgY2FjaGUsIHJlZiwgcGFyXG5cdFx0c2VsZjpjYWNoZSQgPSBjYWNoZVxuXHRcdHNlbGY6a2V5JCA9IHJlZlxuXHRcdHNlbGY6cGFyJCA9IHBhclxuXHRcdHNlbGY6aSQgPSAwXG5cdFx0IyBzZWxmOmN1cnIkID0gc2VsZjokaXRlcm5ldygpXG5cdFx0IyBzZWxmOm5leHQkID0gc2VsZjokaXRlcm5ldygpXG5cdFxuXHRkZWYgJGl0ZXJcblx0XHR2YXIgaXRlbSA9IFtdXG5cdFx0aXRlbS5AdHlwZSA9IDVcblx0XHRpdGVtOnN0YXRpYyA9IDUgIyB3cm9uZyghKVxuXHRcdGl0ZW06Y2FjaGUgPSBzZWxmXG5cdFx0cmV0dXJuIGl0ZW1cblx0XHRcblx0ZGVmICRwcnVuZSBpdGVtc1xuXHRcdGxldCBjYWNoZSA9IHNlbGY6Y2FjaGUkXG5cdFx0bGV0IGtleSA9IHNlbGY6a2V5JFxuXHRcdGxldCBjbG9uZSA9IFRhZ01hcC5uZXcoY2FjaGUsa2V5LHNlbGY6cGFyJClcblx0XHRmb3IgaXRlbSBpbiBpdGVtc1xuXHRcdFx0Y2xvbmVbaXRlbTprZXkkXSA9IGl0ZW1cblx0XHRjbG9uZTppJCA9IGl0ZW1zOmxlbmd0aFxuXHRcdHJldHVybiBjYWNoZVtrZXldID0gY2xvbmVcblxuSW1iYS5UYWdNYXAgPSBUYWdNYXBcbkltYmEuVGFnQ2FjaGUgPSBUYWdDYWNoZVxuSW1iYS5TSU5HTEVUT05TID0ge31cbkltYmEuVEFHUyA9IEltYmEuVGFncy5uZXdcbkltYmEuVEFHU1s6ZWxlbWVudF0gPSBJbWJhLlRBR1NbOmh0bWxlbGVtZW50XSA9IEltYmEuVGFnXG5JbWJhLlRBR1NbJ3N2ZzplbGVtZW50J10gPSBJbWJhLlNWR1RhZ1xuXG5kZWYgSW1iYS5kZWZpbmVUYWcgbmFtZSwgc3VwciA9ICcnLCAmYm9keVxuXHRyZXR1cm4gSW1iYS5UQUdTLmRlZmluZVRhZyhuYW1lLHN1cHIsYm9keSlcblxuZGVmIEltYmEuZGVmaW5lU2luZ2xldG9uVGFnIGlkLCBzdXByID0gJ2RpdicsICZib2R5XG5cdHJldHVybiBJbWJhLlRBR1MuZGVmaW5lVGFnKG5hbWUsc3Vwcixib2R5KVxuXG5kZWYgSW1iYS5leHRlbmRUYWcgbmFtZSwgYm9keVxuXHRyZXR1cm4gSW1iYS5UQUdTLmV4dGVuZFRhZyhuYW1lLGJvZHkpXG5cbmRlZiBJbWJhLmdldFRhZ1NpbmdsZXRvbiBpZFx0XG5cdHZhciBkb20sIG5vZGVcblxuXHRpZiB2YXIga2xhc3MgPSBJbWJhLlNJTkdMRVRPTlNbaWRdXG5cdFx0cmV0dXJuIGtsYXNzLkluc3RhbmNlIGlmIGtsYXNzIGFuZCBrbGFzcy5JbnN0YW5jZSBcblxuXHRcdCMgbm8gaW5zdGFuY2UgLSBjaGVjayBmb3IgZWxlbWVudFxuXHRcdGlmIGRvbSA9IEltYmEuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXG5cdFx0XHQjIHdlIGhhdmUgYSBsaXZlIGluc3RhbmNlIC0gd2hlbiBmaW5kaW5nIGl0IHRocm91Z2ggYSBzZWxlY3RvciB3ZSBzaG91bGQgYXdha2UgaXQsIG5vP1xuXHRcdFx0IyBjb25zb2xlLmxvZygnY3JlYXRpbmcgdGhlIHNpbmdsZXRvbiBmcm9tIGV4aXN0aW5nIG5vZGUgaW4gZG9tPycsaWQsdHlwZSlcblx0XHRcdG5vZGUgPSBrbGFzcy5JbnN0YW5jZSA9IGtsYXNzLm5ldyhkb20pXG5cdFx0XHRub2RlLmF3YWtlbihkb20pICMgc2hvdWxkIG9ubHkgYXdha2VuXG5cdFx0XHRyZXR1cm4gbm9kZVxuXG5cdFx0ZG9tID0ga2xhc3MuY3JlYXRlTm9kZVxuXHRcdGRvbTppZCA9IGlkXG5cdFx0bm9kZSA9IGtsYXNzLkluc3RhbmNlID0ga2xhc3MubmV3KGRvbSlcblx0XHRub2RlLmVuZC5hd2FrZW4oZG9tKVxuXHRcdHJldHVybiBub2RlXG5cdGVsaWYgZG9tID0gSW1iYS5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcblx0XHRyZXR1cm4gSW1iYS5nZXRUYWdGb3JEb20oZG9tKVxuXG52YXIgc3ZnU3VwcG9ydCA9IHR5cGVvZiBTVkdFbGVtZW50ICE9PSAndW5kZWZpbmVkJ1xuXG4jIHNodW9sZCBiZSBwaGFzZWQgb3V0XG5kZWYgSW1iYS5nZXRUYWdGb3JEb20gZG9tXG5cdHJldHVybiBudWxsIHVubGVzcyBkb21cblx0cmV0dXJuIGRvbSBpZiBkb20uQGRvbSAjIGNvdWxkIHVzZSBpbmhlcml0YW5jZSBpbnN0ZWFkXG5cdHJldHVybiBkb20uQHRhZyBpZiBkb20uQHRhZ1xuXHRyZXR1cm4gbnVsbCB1bmxlc3MgZG9tOm5vZGVOYW1lXG5cblx0dmFyIG5hbWUgPSBkb206bm9kZU5hbWUudG9Mb3dlckNhc2Vcblx0dmFyIHR5cGUgPSBuYW1lXG5cdHZhciBucyA9IEltYmEuVEFHUyAjICBzdmdTdXBwb3J0IGFuZCBkb20gaXNhIFNWR0VsZW1lbnQgPyBJbWJhLlRBR1M6X1NWRyA6IEltYmEuVEFHU1xuXG5cdGlmIGRvbTppZCBhbmQgSW1iYS5TSU5HTEVUT05TW2RvbTppZF1cblx0XHRyZXR1cm4gSW1iYS5nZXRUYWdTaW5nbGV0b24oZG9tOmlkKVxuXHRcdFxuXHRpZiBzdmdTdXBwb3J0IGFuZCBkb20gaXNhIFNWR0VsZW1lbnRcblx0XHR0eXBlID0gbnMuZmluZFRhZ1R5cGUoXCJzdmc6XCIgKyBuYW1lKVxuXHRlbGlmIEltYmEuSFRNTF9UQUdTLmluZGV4T2YobmFtZSkgPj0gMFxuXHRcdHR5cGUgPSBucy5maW5kVGFnVHlwZShuYW1lKVxuXHRlbHNlXG5cdFx0dHlwZSA9IEltYmEuVGFnXG5cdCMgaWYgbnMuQG5vZGVOYW1lcy5pbmRleE9mKG5hbWUpID49IDBcblx0I1x0dHlwZSA9IG5zLmZpbmRUYWdUeXBlKG5hbWUpXG5cblx0cmV0dXJuIHR5cGUubmV3KGRvbSxudWxsKS5hd2FrZW4oZG9tKVxuXG4jIGRlcHJlY2F0ZVxuZGVmIEltYmEuZ2VuZXJhdGVDU1NQcmVmaXhlc1xuXHR2YXIgc3R5bGVzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQ6ZG9jdW1lbnRFbGVtZW50LCAnJylcblxuXHRmb3IgcHJlZml4ZWQgaW4gc3R5bGVzXG5cdFx0dmFyIHVucHJlZml4ZWQgPSBwcmVmaXhlZC5yZXBsYWNlKC9eLSh3ZWJraXR8bXN8bW96fG98YmxpbmspLS8sJycpXG5cdFx0dmFyIGNhbWVsQ2FzZSA9IHVucHJlZml4ZWQucmVwbGFjZSgvLShcXHcpL2cpIGRvIHxtLGF8IGEudG9VcHBlckNhc2VcblxuXHRcdCMgaWYgdGhlcmUgZXhpc3RzIGFuIHVucHJlZml4ZWQgdmVyc2lvbiAtLSBhbHdheXMgdXNlIHRoaXNcblx0XHRpZiBwcmVmaXhlZCAhPSB1bnByZWZpeGVkXG5cdFx0XHRjb250aW51ZSBpZiBzdHlsZXMuaGFzT3duUHJvcGVydHkodW5wcmVmaXhlZClcblxuXHRcdCMgcmVnaXN0ZXIgdGhlIHByZWZpeGVzXG5cdFx0SW1iYS5DU1NLZXlNYXBbdW5wcmVmaXhlZF0gPSBJbWJhLkNTU0tleU1hcFtjYW1lbENhc2VdID0gcHJlZml4ZWRcblx0cmV0dXJuXG5cbmlmICR3ZWIkXG5cdEltYmEuZ2VuZXJhdGVDU1NQcmVmaXhlcyBpZiBkb2N1bWVudFxuXG5cdCMgT3Z2ZXJyaWRlIGNsYXNzTGlzdFxuXHRpZiBkb2N1bWVudCBhbmQgIWRvY3VtZW50OmRvY3VtZW50RWxlbWVudDpjbGFzc0xpc3Rcblx0XHRleHRlbmQgdGFnIGVsZW1lbnRcblxuXHRcdFx0ZGVmIGhhc0ZsYWcgcmVmXG5cdFx0XHRcdHJldHVybiBSZWdFeHAubmV3KCcoXnxcXFxccyknICsgcmVmICsgJyhcXFxcc3wkKScpLnRlc3QoQGRvbTpjbGFzc05hbWUpXG5cblx0XHRcdGRlZiBhZGRGbGFnIHJlZlxuXHRcdFx0XHRyZXR1cm4gc2VsZiBpZiBoYXNGbGFnKHJlZilcblx0XHRcdFx0QGRvbTpjbGFzc05hbWUgKz0gKEBkb206Y2xhc3NOYW1lID8gJyAnIDogJycpICsgcmVmXG5cdFx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRcdGRlZiB1bmZsYWcgcmVmXG5cdFx0XHRcdHJldHVybiBzZWxmIHVubGVzcyBoYXNGbGFnKHJlZilcblx0XHRcdFx0dmFyIHJlZ2V4ID0gUmVnRXhwLm5ldygnKF58XFxcXHMpKicgKyByZWYgKyAnKFxcXFxzfCQpKicsICdnJylcblx0XHRcdFx0QGRvbTpjbGFzc05hbWUgPSBAZG9tOmNsYXNzTmFtZS5yZXBsYWNlKHJlZ2V4LCAnJylcblx0XHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdFx0ZGVmIHRvZ2dsZUZsYWcgcmVmXG5cdFx0XHRcdGhhc0ZsYWcocmVmKSA/IHVuZmxhZyhyZWYpIDogZmxhZyhyZWYpXG5cblx0XHRcdGRlZiBmbGFnIHJlZiwgYm9vbFxuXHRcdFx0XHRpZiBhcmd1bWVudHM6bGVuZ3RoID09IDIgYW5kICEhYm9vbCA9PT0gbm9cblx0XHRcdFx0XHRyZXR1cm4gdW5mbGFnKHJlZilcblx0XHRcdFx0cmV0dXJuIGFkZEZsYWcocmVmKVxuXG5JbWJhLlRhZ1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL3RhZy5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG50YWcgZnJhZ21lbnQgPCBlbGVtZW50XG5cdGRlZiBzZWxmLmNyZWF0ZU5vZGVcblx0XHRJbWJhLmRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnRcblxuZXh0ZW5kIHRhZyBodG1sXG5cdGRlZiBwYXJlbnRcblx0XHRudWxsXG5cbmV4dGVuZCB0YWcgY2FudmFzXG5cdGRlZiBjb250ZXh0IHR5cGUgPSAnMmQnXG5cdFx0ZG9tLmdldENvbnRleHQodHlwZSlcblxuY2xhc3MgRGF0YVByb3h5XHRcblx0ZGVmIHNlbGYuYmluZCByZWNlaXZlciwgZGF0YSwgcGF0aCwgYXJnc1xuXHRcdGxldCBwcm94eSA9IHJlY2VpdmVyLkBkYXRhIHx8PSBzZWxmLm5ldyhyZWNlaXZlcixwYXRoLGFyZ3MpXG5cdFx0cHJveHkuYmluZChkYXRhLHBhdGgsYXJncylcblx0XHRyZXR1cm4gcmVjZWl2ZXJcblxuXHRkZWYgaW5pdGlhbGl6ZSBub2RlLCBwYXRoLCBhcmdzXG5cdFx0QG5vZGUgPSBub2RlXG5cdFx0QHBhdGggPSBwYXRoXG5cdFx0QGFyZ3MgPSBhcmdzXG5cdFx0QHNldHRlciA9IEltYmEudG9TZXR0ZXIoQHBhdGgpIGlmIEBhcmdzXG5cdFx0XG5cdGRlZiBiaW5kIGRhdGEsIGtleSwgYXJnc1xuXHRcdGlmIGRhdGEgIT0gQGRhdGFcblx0XHRcdEBkYXRhID0gZGF0YVxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIGdldEZvcm1WYWx1ZVxuXHRcdEBzZXR0ZXIgPyBAZGF0YVtAcGF0aF0oKSA6IEBkYXRhW0BwYXRoXVxuXG5cdGRlZiBzZXRGb3JtVmFsdWUgdmFsdWVcblx0XHRAc2V0dGVyID8gQGRhdGFbQHNldHRlcl0odmFsdWUpIDogKEBkYXRhW0BwYXRoXSA9IHZhbHVlKVxuXG5cbnZhciBpc0FycmF5ID0gZG8gfHZhbHxcblx0dmFsIGFuZCB2YWw6c3BsaWNlIGFuZCB2YWw6c29ydFxuXG52YXIgaXNTaW1pbGFyQXJyYXkgPSBkbyB8YSxifFxuXHRsZXQgbCA9IGE6bGVuZ3RoLCBpID0gMFxuXHRyZXR1cm4gbm8gdW5sZXNzIGwgPT0gYjpsZW5ndGhcblx0d2hpbGUgaSsrIDwgbFxuXHRcdHJldHVybiBubyBpZiBhW2ldICE9IGJbaV1cblx0cmV0dXJuIHllc1xuXG5leHRlbmQgdGFnIGlucHV0XG5cdHByb3AgbGF6eVxuXG5cdGRlZiBiaW5kRGF0YSB0YXJnZXQsIHBhdGgsIGFyZ3Ncblx0XHREYXRhUHJveHkuYmluZChzZWxmLHRhcmdldCxwYXRoLGFyZ3MpXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgc2V0VmFsdWUgdmFsdWVcblx0XHRkb206dmFsdWUgPSBAdmFsdWUgPSB2YWx1ZVxuXHRcdHNlbGZcblxuXHRkZWYgb25pbnB1dCBlXG5cdFx0bGV0IHZhbCA9IEBkb206dmFsdWVcblx0XHRAbG9jYWxWYWx1ZSA9IEBpbml0aWFsVmFsdWUgIT0gdmFsID8gdmFsIDogdW5kZWZpbmVkXG5cdFx0QGRhdGEgYW5kICFsYXp5ID8gQGRhdGEuc2V0Rm9ybVZhbHVlKHZhbHVlLHNlbGYpIDogZS5zaWxlbmNlXG5cdFx0XG5cdGRlZiBvbmNoYW5nZSBlXG5cdFx0QG1vZGVsVmFsdWUgPSBAbG9jYWxWYWx1ZSA9IHVuZGVmaW5lZFxuXHRcdHJldHVybiBlLnNpbGVuY2UgdW5sZXNzIGRhdGFcblx0XHRcblx0XHRpZiB0eXBlID09ICdyYWRpbycgb3IgdHlwZSA9PSAnY2hlY2tib3gnXG5cdFx0XHRsZXQgY2hlY2tlZCA9IEBkb206Y2hlY2tlZFxuXHRcdFx0bGV0IG12YWwgPSBAZGF0YS5nZXRGb3JtVmFsdWUoc2VsZilcblx0XHRcdGxldCBkdmFsID0gQHZhbHVlICE9IHVuZGVmaW5lZCA/IEB2YWx1ZSA6IHZhbHVlXG5cblx0XHRcdGlmIHR5cGUgPT0gJ3JhZGlvJ1xuXHRcdFx0XHRAZGF0YS5zZXRGb3JtVmFsdWUoZHZhbCxzZWxmKVxuXHRcdFx0ZWxpZiBkb206dmFsdWUgPT0gJ29uJ1xuXHRcdFx0XHRAZGF0YS5zZXRGb3JtVmFsdWUoISFjaGVja2VkLHNlbGYpXG5cdFx0XHRlbGlmIGlzQXJyYXkobXZhbClcblx0XHRcdFx0bGV0IGlkeCA9IG12YWwuaW5kZXhPZihkdmFsKVxuXHRcdFx0XHRpZiBjaGVja2VkIGFuZCBpZHggPT0gLTFcblx0XHRcdFx0XHRtdmFsLnB1c2goZHZhbClcblx0XHRcdFx0ZWxpZiAhY2hlY2tlZCBhbmQgaWR4ID49IDBcblx0XHRcdFx0XHRtdmFsLnNwbGljZShpZHgsMSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0QGRhdGEuc2V0Rm9ybVZhbHVlKGR2YWwsc2VsZilcblx0XHRlbHNlXG5cdFx0XHRAZGF0YS5zZXRGb3JtVmFsdWUodmFsdWUpXG5cdFxuXHQjIG92ZXJyaWRpbmcgZW5kIGRpcmVjdGx5IGZvciBwZXJmb3JtYW5jZVxuXHRkZWYgZW5kXG5cdFx0cmV0dXJuIHNlbGYgaWYgIUBkYXRhIG9yIEBsb2NhbFZhbHVlICE9PSB1bmRlZmluZWRcblx0XHRsZXQgbXZhbCA9IEBkYXRhLmdldEZvcm1WYWx1ZShzZWxmKVxuXHRcdHJldHVybiBzZWxmIGlmIG12YWwgPT0gQG1vZGVsVmFsdWVcblx0XHRAbW9kZWxWYWx1ZSA9IG12YWwgdW5sZXNzIGlzQXJyYXkobXZhbClcblxuXHRcdGlmIHR5cGUgPT0gJ3JhZGlvJyBvciB0eXBlID09ICdjaGVja2JveCdcblx0XHRcdGxldCBkdmFsID0gQHZhbHVlXG5cdFx0XHRsZXQgY2hlY2tlZCA9IGlmIGlzQXJyYXkobXZhbClcblx0XHRcdFx0bXZhbC5pbmRleE9mKGR2YWwpID49IDBcblx0XHRcdGVsaWYgZG9tOnZhbHVlID09ICdvbidcblx0XHRcdFx0ISFtdmFsXG5cdFx0XHRlbHNlXG5cdFx0XHRcdG12YWwgPT0gQHZhbHVlXG5cblx0XHRcdEBkb206Y2hlY2tlZCA9IGNoZWNrZWRcblx0XHRlbHNlXG5cdFx0XHRAZG9tOnZhbHVlID0gbXZhbFxuXHRcdFx0QGluaXRpYWxWYWx1ZSA9IEBkb206dmFsdWVcblx0XHRzZWxmXG5cbmV4dGVuZCB0YWcgdGV4dGFyZWFcblx0cHJvcCBsYXp5XG5cblx0ZGVmIGJpbmREYXRhIHRhcmdldCwgcGF0aCwgYXJnc1xuXHRcdERhdGFQcm94eS5iaW5kKHNlbGYsdGFyZ2V0LHBhdGgsYXJncylcblx0XHRzZWxmXG5cdFxuXHRkZWYgc2V0VmFsdWUgdmFsdWVcblx0XHRkb206dmFsdWUgPSB2YWx1ZSBpZiBAbG9jYWxWYWx1ZSA9PSB1bmRlZmluZWRcblx0XHRyZXR1cm4gc2VsZlxuXHRcblx0ZGVmIG9uaW5wdXQgZVxuXHRcdGxldCB2YWwgPSBAZG9tOnZhbHVlXG5cdFx0QGxvY2FsVmFsdWUgPSBAaW5pdGlhbFZhbHVlICE9IHZhbCA/IHZhbCA6IHVuZGVmaW5lZFxuXHRcdEBkYXRhIGFuZCAhbGF6eSA/IEBkYXRhLnNldEZvcm1WYWx1ZSh2YWx1ZSxzZWxmKSA6IGUuc2lsZW5jZVxuXG5cdGRlZiBvbmNoYW5nZSBlXG5cdFx0QGxvY2FsVmFsdWUgPSB1bmRlZmluZWRcblx0XHRAZGF0YSA/IEBkYXRhLnNldEZvcm1WYWx1ZSh2YWx1ZSxzZWxmKSA6IGUuc2lsZW5jZVxuXHRcdFxuXHRkZWYgcmVuZGVyXG5cdFx0cmV0dXJuIGlmIEBsb2NhbFZhbHVlICE9IHVuZGVmaW5lZCBvciAhQGRhdGFcblx0XHRpZiBAZGF0YVxuXHRcdFx0bGV0IGR2YWwgPSBAZGF0YS5nZXRGb3JtVmFsdWUoc2VsZilcblx0XHRcdEBkb206dmFsdWUgPSBkdmFsICE9IHVuZGVmaW5lZCA/IGR2YWwgOiAnJ1xuXHRcdEBpbml0aWFsVmFsdWUgPSBAZG9tOnZhbHVlXG5cdFx0c2VsZlxuXG5leHRlbmQgdGFnIG9wdGlvblxuXHRkZWYgc2V0VmFsdWUgdmFsdWVcblx0XHRpZiB2YWx1ZSAhPSBAdmFsdWVcblx0XHRcdGRvbTp2YWx1ZSA9IEB2YWx1ZSA9IHZhbHVlXG5cdFx0c2VsZlxuXG5cdGRlZiB2YWx1ZVxuXHRcdEB2YWx1ZSBvciBkb206dmFsdWVcblxuZXh0ZW5kIHRhZyBzZWxlY3Rcblx0ZGVmIGJpbmREYXRhIHRhcmdldCwgcGF0aCwgYXJnc1xuXHRcdERhdGFQcm94eS5iaW5kKHNlbGYsdGFyZ2V0LHBhdGgsYXJncylcblx0XHRzZWxmXG5cblx0ZGVmIHNldFZhbHVlIHZhbHVlLCBzeW5jaW5nXG5cdFx0bGV0IHByZXYgPSBAdmFsdWVcblx0XHRAdmFsdWUgPSB2YWx1ZVxuXHRcdHN5bmNWYWx1ZSh2YWx1ZSkgdW5sZXNzIHN5bmNpbmdcblx0XHRyZXR1cm4gc2VsZlxuXHRcdFxuXHRkZWYgc3luY1ZhbHVlIHZhbHVlXG5cdFx0bGV0IHByZXYgPSBAc3luY1ZhbHVlXG5cdFx0IyBjaGVjayBpZiB2YWx1ZSBoYXMgY2hhbmdlZFxuXHRcdGlmIG11bHRpcGxlIGFuZCB2YWx1ZSBpc2EgQXJyYXlcblx0XHRcdGlmIHByZXYgaXNhIEFycmF5IGFuZCBpc1NpbWlsYXJBcnJheShwcmV2LHZhbHVlKVxuXHRcdFx0XHRyZXR1cm4gc2VsZlxuXHRcdFx0IyBjcmVhdGUgYSBjb3B5IGZvciBzeW5jVmFsdWVcblx0XHRcdHZhbHVlID0gdmFsdWUuc2xpY2VcblxuXHRcdEBzeW5jVmFsdWUgPSB2YWx1ZVxuXHRcdCMgc3VwcG9ydCBhcnJheSBmb3IgbXVsdGlwbGU/XG5cdFx0aWYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnXG5cdFx0XHRsZXQgbXVsdCA9IG11bHRpcGxlIGFuZCB2YWx1ZSBpc2EgQXJyYXlcblx0XHRcdFxuXHRcdFx0Zm9yIG9wdCxpIGluIGRvbTpvcHRpb25zXG5cdFx0XHRcdGxldCBvdmFsID0gKG9wdC5AdGFnID8gb3B0LkB0YWcudmFsdWUgOiBvcHQ6dmFsdWUpXG5cdFx0XHRcdGlmIG11bHRcblx0XHRcdFx0XHRvcHQ6c2VsZWN0ZWQgPSB2YWx1ZS5pbmRleE9mKG92YWwpID49IDBcblx0XHRcdFx0ZWxpZiB2YWx1ZSA9PSBvdmFsXG5cdFx0XHRcdFx0ZG9tOnNlbGVjdGVkSW5kZXggPSBpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRlbHNlXG5cdFx0XHRkb206dmFsdWUgPSB2YWx1ZVxuXHRcdHNlbGZcblx0XHRcblx0ZGVmIHZhbHVlXG5cdFx0aWYgbXVsdGlwbGVcblx0XHRcdGZvciBvcHRpb24gaW4gZG9tOnNlbGVjdGVkT3B0aW9uc1xuXHRcdFx0XHRvcHRpb24uQHRhZyA/IG9wdGlvbi5AdGFnLnZhbHVlIDogb3B0aW9uOnZhbHVlXG5cdFx0ZWxzZVxuXHRcdFx0bGV0IG9wdCA9IGRvbTpzZWxlY3RlZE9wdGlvbnNbMF1cblx0XHRcdG9wdCA/IChvcHQuQHRhZyA/IG9wdC5AdGFnLnZhbHVlIDogb3B0OnZhbHVlKSA6IG51bGxcblx0XG5cdGRlZiBvbmNoYW5nZSBlXG5cdFx0QGRhdGEgPyBAZGF0YS5zZXRGb3JtVmFsdWUodmFsdWUsc2VsZikgOiBlLnNpbGVuY2Vcblx0XHRcblx0ZGVmIGVuZFxuXHRcdGlmIEBkYXRhXG5cdFx0XHRzZXRWYWx1ZShAZGF0YS5nZXRGb3JtVmFsdWUoc2VsZiksMSlcblxuXHRcdGlmIEB2YWx1ZSAhPSBAc3luY1ZhbHVlXG5cdFx0XHRzeW5jVmFsdWUoQHZhbHVlKVxuXHRcdHNlbGZcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vaHRtbC5pbWJhIiwidmFyIEltYmEgPSByZXF1aXJlKFwiLi4vaW1iYVwiKVxuXG4jIEltYmEuVG91Y2hcbiMgQmVnYW5cdEEgZmluZ2VyIHRvdWNoZWQgdGhlIHNjcmVlbi5cbiMgTW92ZWRcdEEgZmluZ2VyIG1vdmVkIG9uIHRoZSBzY3JlZW4uXG4jIFN0YXRpb25hcnlcdEEgZmluZ2VyIGlzIHRvdWNoaW5nIHRoZSBzY3JlZW4gYnV0IGhhc24ndCBtb3ZlZC5cbiMgRW5kZWRcdEEgZmluZ2VyIHdhcyBsaWZ0ZWQgZnJvbSB0aGUgc2NyZWVuLiBUaGlzIGlzIHRoZSBmaW5hbCBwaGFzZSBvZiBhIHRvdWNoLlxuIyBDYW5jZWxlZCBUaGUgc3lzdGVtIGNhbmNlbGxlZCB0cmFja2luZyBmb3IgdGhlIHRvdWNoLlxuXG4jIyNcbkNvbnNvbGlkYXRlcyBtb3VzZSBhbmQgdG91Y2ggZXZlbnRzLiBUb3VjaCBvYmplY3RzIHBlcnNpc3QgYWNyb3NzIGEgdG91Y2gsXG5mcm9tIHRvdWNoc3RhcnQgdW50aWwgZW5kL2NhbmNlbC4gV2hlbiBhIHRvdWNoIHN0YXJ0cywgaXQgd2lsbCB0cmF2ZXJzZVxuZG93biBmcm9tIHRoZSBpbm5lcm1vc3QgdGFyZ2V0LCB1bnRpbCBpdCBmaW5kcyBhIG5vZGUgdGhhdCByZXNwb25kcyB0b1xub250b3VjaHN0YXJ0LiBVbmxlc3MgdGhlIHRvdWNoIGlzIGV4cGxpY2l0bHkgcmVkaXJlY3RlZCwgdGhlIHRvdWNoIHdpbGxcbmNhbGwgb250b3VjaG1vdmUgYW5kIG9udG91Y2hlbmQgLyBvbnRvdWNoY2FuY2VsIG9uIHRoZSByZXNwb25kZXIgd2hlbiBhcHByb3ByaWF0ZS5cblxuXHR0YWcgZHJhZ2dhYmxlXG5cdFx0IyBjYWxsZWQgd2hlbiBhIHRvdWNoIHN0YXJ0c1xuXHRcdGRlZiBvbnRvdWNoc3RhcnQgdG91Y2hcblx0XHRcdGZsYWcgJ2RyYWdnaW5nJ1xuXHRcdFx0c2VsZlxuXHRcdFxuXHRcdCMgY2FsbGVkIHdoZW4gdG91Y2ggbW92ZXMgLSBzYW1lIHRvdWNoIG9iamVjdFxuXHRcdGRlZiBvbnRvdWNobW92ZSB0b3VjaFxuXHRcdFx0IyBtb3ZlIHRoZSBub2RlIHdpdGggdG91Y2hcblx0XHRcdGNzcyB0b3A6IHRvdWNoLmR5LCBsZWZ0OiB0b3VjaC5keFxuXHRcdFxuXHRcdCMgY2FsbGVkIHdoZW4gdG91Y2ggZW5kc1xuXHRcdGRlZiBvbnRvdWNoZW5kIHRvdWNoXG5cdFx0XHR1bmZsYWcgJ2RyYWdnaW5nJ1xuXG5AaW5hbWUgdG91Y2hcbiMjI1xuY2xhc3MgSW1iYS5Ub3VjaFxuXHRzZWxmLkxhc3RUaW1lc3RhbXAgPSAwXG5cdHNlbGYuVGFwVGltZW91dCA9IDUwXG5cblx0IyB2YXIgbGFzdE5hdGl2ZVRvdWNoVGltZW91dCA9IDUwXG5cblx0dmFyIHRvdWNoZXMgPSBbXVxuXHR2YXIgY291bnQgPSAwXG5cdHZhciBpZGVudGlmaWVycyA9IHt9XG5cblx0ZGVmIHNlbGYuY291bnRcblx0XHRjb3VudFxuXG5cdGRlZiBzZWxmLmxvb2t1cCBpdGVtXG5cdFx0cmV0dXJuIGl0ZW0gYW5kIChpdGVtOl9fdG91Y2hfXyBvciBpZGVudGlmaWVyc1tpdGVtOmlkZW50aWZpZXJdKVxuXG5cdGRlZiBzZWxmLnJlbGVhc2UgaXRlbSx0b3VjaFxuXHRcdGRlbGV0ZSBpZGVudGlmaWVyc1tpdGVtOmlkZW50aWZpZXJdXG5cdFx0ZGVsZXRlIGl0ZW06X190b3VjaF9fXG5cdFx0cmV0dXJuXG5cblx0ZGVmIHNlbGYub250b3VjaHN0YXJ0IGVcblx0XHRmb3IgdCBpbiBlOmNoYW5nZWRUb3VjaGVzXG5cdFx0XHRjb250aW51ZSBpZiBsb29rdXAodClcblx0XHRcdHZhciB0b3VjaCA9IGlkZW50aWZpZXJzW3Q6aWRlbnRpZmllcl0gPSBzZWxmLm5ldyhlKSAjIChlKVxuXHRcdFx0dDpfX3RvdWNoX18gPSB0b3VjaFxuXHRcdFx0dG91Y2hlcy5wdXNoKHRvdWNoKVxuXHRcdFx0Y291bnQrK1xuXHRcdFx0dG91Y2gudG91Y2hzdGFydChlLHQpXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9udG91Y2htb3ZlIGVcblx0XHRmb3IgdCBpbiBlOmNoYW5nZWRUb3VjaGVzXG5cdFx0XHRpZiB2YXIgdG91Y2ggPSBsb29rdXAodClcblx0XHRcdFx0dG91Y2gudG91Y2htb3ZlKGUsdClcblxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5vbnRvdWNoZW5kIGVcblx0XHRmb3IgdCBpbiBlOmNoYW5nZWRUb3VjaGVzXG5cdFx0XHRpZiB2YXIgdG91Y2ggPSBsb29rdXAodClcblx0XHRcdFx0dG91Y2gudG91Y2hlbmQoZSx0KVxuXHRcdFx0XHRyZWxlYXNlKHQsdG91Y2gpXG5cdFx0XHRcdGNvdW50LS1cblxuXHRcdCMgZS5wcmV2ZW50RGVmYXVsdFxuXHRcdCMgbm90IGFsd2F5cyBzdXBwb3J0ZWQhXG5cdFx0IyB0b3VjaGVzID0gdG91Y2hlcy5maWx0ZXIofHwpXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9udG91Y2hjYW5jZWwgZVxuXHRcdGZvciB0IGluIGU6Y2hhbmdlZFRvdWNoZXNcblx0XHRcdGlmIHZhciB0b3VjaCA9IGxvb2t1cCh0KVxuXHRcdFx0XHR0b3VjaC50b3VjaGNhbmNlbChlLHQpXG5cdFx0XHRcdHJlbGVhc2UodCx0b3VjaClcblx0XHRcdFx0Y291bnQtLVxuXHRcdHNlbGZcblxuXHRkZWYgc2VsZi5vbm1vdXNlZG93biBlXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLm9ubW91c2Vtb3ZlIGVcblx0XHRzZWxmXG5cblx0ZGVmIHNlbGYub25tb3VzZXVwIGVcblx0XHRzZWxmXG5cblxuXHRwcm9wIHBoYXNlXG5cdHByb3AgYWN0aXZlXG5cdHByb3AgZXZlbnRcblx0cHJvcCBwb2ludGVyXG5cdHByb3AgdGFyZ2V0XG5cdHByb3AgaGFuZGxlclxuXHRwcm9wIHVwZGF0ZXNcblx0cHJvcCBzdXBwcmVzc1xuXHRwcm9wIGRhdGFcblx0cHJvcCBidWJibGUgY2hhaW5hYmxlOiB5ZXNcblx0cHJvcCB0aW1lc3RhbXBcblxuXHRwcm9wIGdlc3R1cmVzXG5cblx0IyMjXG5cdEBpbnRlcm5hbFxuXHRAY29uc3RydWN0b3Jcblx0IyMjXG5cdGRlZiBpbml0aWFsaXplIGV2ZW50LCBwb2ludGVyXG5cdFx0IyBAbmF0aXZlICA9IGZhbHNlXG5cdFx0c2VsZi5ldmVudCA9IGV2ZW50XG5cdFx0ZGF0YSA9IHt9XG5cdFx0YWN0aXZlID0geWVzXG5cdFx0QGJ1dHRvbiA9IGV2ZW50IGFuZCBldmVudDpidXR0b24gb3IgMFxuXHRcdEBzdXBwcmVzcyA9IG5vICMgZGVwcmVjYXRlZFxuXHRcdEBjYXB0dXJlZCA9IG5vXG5cdFx0YnViYmxlID0gbm9cblx0XHRwb2ludGVyID0gcG9pbnRlclxuXHRcdHVwZGF0ZXMgPSAwXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgY2FwdHVyZVxuXHRcdEBjYXB0dXJlZCA9IHllc1xuXHRcdEBldmVudCBhbmQgQGV2ZW50LnN0b3BQcm9wYWdhdGlvblxuXHRcdHVubGVzcyBAc2VsYmxvY2tlclxuXHRcdFx0QHNlbGJsb2NrZXIgPSBkbyB8ZXwgZS5wcmV2ZW50RGVmYXVsdFxuXHRcdFx0SW1iYS5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3RzdGFydCcsQHNlbGJsb2NrZXIseWVzKVxuXHRcdHNlbGZcblxuXHRkZWYgaXNDYXB0dXJlZFxuXHRcdCEhQGNhcHR1cmVkXG5cblx0IyMjXG5cdEV4dGVuZCB0aGUgdG91Y2ggd2l0aCBhIHBsdWdpbiAvIGdlc3R1cmUuIFxuXHRBbGwgZXZlbnRzICh0b3VjaHN0YXJ0LG1vdmUgZXRjKSBmb3IgdGhlIHRvdWNoXG5cdHdpbGwgYmUgdHJpZ2dlcmVkIG9uIHRoZSBwbHVnaW5zIGluIHRoZSBvcmRlciB0aGV5XG5cdGFyZSBhZGRlZC5cblx0IyMjXG5cdGRlZiBleHRlbmQgcGx1Z2luXG5cdFx0IyBjb25zb2xlLmxvZyBcImFkZGVkIGdlc3R1cmUhISFcIlxuXHRcdEBnZXN0dXJlcyB8fD0gW11cblx0XHRAZ2VzdHVyZXMucHVzaChwbHVnaW4pXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRSZWRpcmVjdCB0b3VjaCB0byBzcGVjaWZpZWQgdGFyZ2V0LiBvbnRvdWNoc3RhcnQgd2lsbCBhbHdheXMgYmVcblx0Y2FsbGVkIG9uIHRoZSBuZXcgdGFyZ2V0LlxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgcmVkaXJlY3QgdGFyZ2V0XG5cdFx0QHJlZGlyZWN0ID0gdGFyZ2V0XG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRTdXBwcmVzcyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIuIFdpbGwgY2FsbCBwcmV2ZW50RGVmYXVsdCBmb3Jcblx0YWxsIG5hdGl2ZSBldmVudHMgdGhhdCBhcmUgcGFydCBvZiB0aGUgdG91Y2guXG5cdCMjI1xuXHRkZWYgc3VwcHJlc3Ncblx0XHQjIGNvbGxpc2lvbiB3aXRoIHRoZSBzdXBwcmVzcyBwcm9wZXJ0eVxuXHRcdEBhY3RpdmUgPSBub1xuXHRcdFxuXHRcdHNlbGZcblxuXHRkZWYgc3VwcHJlc3M9IHZhbHVlXG5cdFx0Y29uc29sZS53YXJuICdJbWJhLlRvdWNoI3N1cHByZXNzPSBpcyBkZXByZWNhdGVkJ1xuXHRcdEBzdXByZXNzID0gdmFsdWVcblx0XHRzZWxmXG5cblx0ZGVmIHRvdWNoc3RhcnQgZSx0XG5cdFx0QGV2ZW50ID0gZVxuXHRcdEB0b3VjaCA9IHRcblx0XHRAYnV0dG9uID0gMFxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRiZWdhblxuXHRcdHVwZGF0ZVxuXHRcdGUucHJldmVudERlZmF1bHQgaWYgZSBhbmQgaXNDYXB0dXJlZFxuXHRcdHNlbGZcblxuXHRkZWYgdG91Y2htb3ZlIGUsdFxuXHRcdEBldmVudCA9IGVcblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0dXBkYXRlXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCBpZiBlIGFuZCBpc0NhcHR1cmVkXG5cdFx0c2VsZlxuXG5cdGRlZiB0b3VjaGVuZCBlLHRcblx0XHRAZXZlbnQgPSBlXG5cdFx0QHggPSB0OmNsaWVudFhcblx0XHRAeSA9IHQ6Y2xpZW50WVxuXHRcdGVuZGVkXG5cblx0XHRJbWJhLlRvdWNoLkxhc3RUaW1lc3RhbXAgPSBlOnRpbWVTdGFtcFxuXG5cdFx0aWYgQG1heGRyIDwgMjBcblx0XHRcdHZhciB0YXAgPSBJbWJhLkV2ZW50Lm5ldyhlKVxuXHRcdFx0dGFwLnR5cGUgPSAndGFwJ1xuXHRcdFx0dGFwLnByb2Nlc3Ncblx0XHRcdGUucHJldmVudERlZmF1bHQgaWYgdGFwLkByZXNwb25kZXJcdFxuXG5cdFx0aWYgZSBhbmQgaXNDYXB0dXJlZFxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdFxuXG5cdFx0c2VsZlxuXG5cdGRlZiB0b3VjaGNhbmNlbCBlLHRcblx0XHRjYW5jZWxcblxuXHRkZWYgbW91c2Vkb3duIGUsdFxuXHRcdEBldmVudCA9IGVcblx0XHRAYnV0dG9uID0gZTpidXR0b25cblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0YmVnYW5cblx0XHR1cGRhdGVcblx0XHRAbW91c2Vtb3ZlID0gKHxlfCBtb3VzZW1vdmUoZSxlKSApXG5cdFx0SW1iYS5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLEBtb3VzZW1vdmUseWVzKVxuXHRcdHNlbGZcblxuXHRkZWYgbW91c2Vtb3ZlIGUsdFxuXHRcdEB4ID0gdDpjbGllbnRYXG5cdFx0QHkgPSB0OmNsaWVudFlcblx0XHRAZXZlbnQgPSBlXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCBpZiBpc0NhcHR1cmVkXG5cdFx0dXBkYXRlXG5cdFx0bW92ZVxuXHRcdHNlbGZcblxuXHRkZWYgbW91c2V1cCBlLHRcblx0XHRAeCA9IHQ6Y2xpZW50WFxuXHRcdEB5ID0gdDpjbGllbnRZXG5cdFx0ZW5kZWRcblx0XHRzZWxmXG5cblx0ZGVmIGlkbGVcblx0XHR1cGRhdGVcblxuXHRkZWYgYmVnYW5cblx0XHRAdGltZXN0YW1wID0gRGF0ZS5ub3dcblx0XHRAbWF4ZHIgPSBAZHIgPSAwXG5cdFx0QHgwID0gQHhcblx0XHRAeTAgPSBAeVxuXG5cdFx0dmFyIGRvbSA9IGV2ZW50OnRhcmdldFxuXHRcdHZhciBub2RlID0gbnVsbFxuXG5cdFx0QHNvdXJjZVRhcmdldCA9IGRvbSBhbmQgdGFnKGRvbSlcblxuXHRcdHdoaWxlIGRvbVxuXHRcdFx0bm9kZSA9IHRhZyhkb20pXG5cdFx0XHRpZiBub2RlICYmIG5vZGU6b250b3VjaHN0YXJ0XG5cdFx0XHRcdEBidWJibGUgPSBub1xuXHRcdFx0XHR0YXJnZXQgPSBub2RlXG5cdFx0XHRcdHRhcmdldC5vbnRvdWNoc3RhcnQoc2VsZilcblx0XHRcdFx0YnJlYWsgdW5sZXNzIEBidWJibGVcblx0XHRcdGRvbSA9IGRvbTpwYXJlbnROb2RlXG5cblx0XHRAdXBkYXRlcysrXG5cdFx0c2VsZlxuXG5cdGRlZiB1cGRhdGVcblx0XHRyZXR1cm4gc2VsZiBpZiAhQGFjdGl2ZSBvciBAY2FuY2VsbGVkXG5cblx0XHR2YXIgZHIgPSBNYXRoLnNxcnQoZHgqZHggKyBkeSpkeSlcblx0XHRAbWF4ZHIgPSBkciBpZiBkciA+IEBkclxuXHRcdEBkciA9IGRyXG5cblx0XHQjIGNhdGNoaW5nIGEgdG91Y2gtcmVkaXJlY3Q/IT9cblx0XHRpZiBAcmVkaXJlY3Rcblx0XHRcdGlmIEB0YXJnZXQgYW5kIEB0YXJnZXQ6b250b3VjaGNhbmNlbFxuXHRcdFx0XHRAdGFyZ2V0Lm9udG91Y2hjYW5jZWwoc2VsZilcblx0XHRcdHRhcmdldCA9IEByZWRpcmVjdFxuXHRcdFx0QHJlZGlyZWN0ID0gbnVsbFxuXHRcdFx0dGFyZ2V0Lm9udG91Y2hzdGFydChzZWxmKSBpZiB0YXJnZXQ6b250b3VjaHN0YXJ0XG5cdFx0XHRyZXR1cm4gdXBkYXRlIGlmIEByZWRpcmVjdCAjIHBvc3NpYmx5IHJlZGlyZWN0aW5nIGFnYWluXG5cblxuXHRcdEB1cGRhdGVzKytcblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGcub250b3VjaHVwZGF0ZShzZWxmKSBmb3IgZyBpbiBAZ2VzdHVyZXNcblxuXHRcdHRhcmdldD8ub250b3VjaHVwZGF0ZShzZWxmKVxuXHRcdHVwZGF0ZSBpZiBAcmVkaXJlY3Rcblx0XHRzZWxmXG5cblx0ZGVmIG1vdmVcblx0XHRyZXR1cm4gc2VsZiBpZiAhQGFjdGl2ZSBvciBAY2FuY2VsbGVkXG5cblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGZvciBnIGluIEBnZXN0dXJlc1xuXHRcdFx0XHRnLm9udG91Y2htb3ZlKHNlbGYsQGV2ZW50KSBpZiBnOm9udG91Y2htb3ZlXG5cblx0XHR0YXJnZXQ/Lm9udG91Y2htb3ZlKHNlbGYsQGV2ZW50KVxuXHRcdHNlbGZcblxuXHRkZWYgZW5kZWRcblx0XHRyZXR1cm4gc2VsZiBpZiAhQGFjdGl2ZSBvciBAY2FuY2VsbGVkXG5cblx0XHRAdXBkYXRlcysrXG5cblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGcub250b3VjaGVuZChzZWxmKSBmb3IgZyBpbiBAZ2VzdHVyZXNcblxuXHRcdHRhcmdldD8ub250b3VjaGVuZChzZWxmKVxuXHRcdGNsZWFudXBfXG5cdFx0c2VsZlxuXG5cdGRlZiBjYW5jZWxcblx0XHR1bmxlc3MgQGNhbmNlbGxlZFxuXHRcdFx0QGNhbmNlbGxlZCA9IHllc1xuXHRcdFx0Y2FuY2VsbGVkXG5cdFx0XHRjbGVhbnVwX1xuXHRcdHNlbGZcblxuXHRkZWYgY2FuY2VsbGVkXG5cdFx0cmV0dXJuIHNlbGYgdW5sZXNzIEBhY3RpdmVcblxuXHRcdEBjYW5jZWxsZWQgPSB5ZXNcblx0XHRAdXBkYXRlcysrXG5cblx0XHRpZiBAZ2VzdHVyZXNcblx0XHRcdGZvciBnIGluIEBnZXN0dXJlc1xuXHRcdFx0XHRnLm9udG91Y2hjYW5jZWwoc2VsZikgaWYgZzpvbnRvdWNoY2FuY2VsXG5cblx0XHR0YXJnZXQ/Lm9udG91Y2hjYW5jZWwoc2VsZilcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiBjbGVhbnVwX1xuXHRcdGlmIEBtb3VzZW1vdmVcblx0XHRcdEltYmEuZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJyxAbW91c2Vtb3ZlLHllcylcblx0XHRcdEBtb3VzZW1vdmUgPSBudWxsXG5cdFx0XG5cdFx0aWYgQHNlbGJsb2NrZXJcblx0XHRcdEltYmEuZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2VsZWN0c3RhcnQnLEBzZWxibG9ja2VyLHllcylcblx0XHRcdEBzZWxibG9ja2VyID0gbnVsbFxuXHRcdFxuXHRcdHNlbGZcblxuXHQjIyNcblx0VGhlIGFic29sdXRlIGRpc3RhbmNlIHRoZSB0b3VjaCBoYXMgbW92ZWQgZnJvbSBzdGFydGluZyBwb3NpdGlvbiBcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGRyIGRvIEBkclxuXG5cdCMjI1xuXHRUaGUgZGlzdGFuY2UgdGhlIHRvdWNoIGhhcyBtb3ZlZCBob3Jpem9udGFsbHlcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGR4IGRvIEB4IC0gQHgwXG5cblx0IyMjXG5cdFRoZSBkaXN0YW5jZSB0aGUgdG91Y2ggaGFzIG1vdmVkIHZlcnRpY2FsbHlcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIGR5IGRvIEB5IC0gQHkwXG5cblx0IyMjXG5cdEluaXRpYWwgaG9yaXpvbnRhbCBwb3NpdGlvbiBvZiB0b3VjaFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgeDAgZG8gQHgwXG5cblx0IyMjXG5cdEluaXRpYWwgdmVydGljYWwgcG9zaXRpb24gb2YgdG91Y2hcblx0QHJldHVybiB7TnVtYmVyfVxuXHQjIyNcblx0ZGVmIHkwIGRvIEB5MFxuXG5cdCMjI1xuXHRIb3Jpem9udGFsIHBvc2l0aW9uIG9mIHRvdWNoXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB4IGRvIEB4XG5cblx0IyMjXG5cdFZlcnRpY2FsIHBvc2l0aW9uIG9mIHRvdWNoXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB5IGRvIEB5XG5cblx0IyMjXG5cdEhvcml6b250YWwgcG9zaXRpb24gb2YgdG91Y2ggcmVsYXRpdmUgdG8gdGFyZ2V0XG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiB0eCBkb1xuXHRcdEB0YXJnZXRCb3ggfHw9IEB0YXJnZXQuZG9tLmdldEJvdW5kaW5nQ2xpZW50UmVjdFxuXHRcdEB4IC0gQHRhcmdldEJveDpsZWZ0XG5cblx0IyMjXG5cdFZlcnRpY2FsIHBvc2l0aW9uIG9mIHRvdWNoIHJlbGF0aXZlIHRvIHRhcmdldFxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgdHlcblx0XHRAdGFyZ2V0Qm94IHx8PSBAdGFyZ2V0LmRvbS5nZXRCb3VuZGluZ0NsaWVudFJlY3Rcblx0XHRAeSAtIEB0YXJnZXRCb3g6dG9wXG5cblx0IyMjXG5cdEJ1dHRvbiBwcmVzc2VkIGluIHRoaXMgdG91Y2guIE5hdGl2ZSB0b3VjaGVzIGRlZmF1bHRzIHRvIGxlZnQtY2xpY2sgKDApXG5cdEByZXR1cm4ge051bWJlcn1cblx0IyMjXG5cdGRlZiBidXR0b24gZG8gQGJ1dHRvbiAjIEBwb2ludGVyID8gQHBvaW50ZXIuYnV0dG9uIDogMFxuXG5cdGRlZiBzb3VyY2VUYXJnZXRcblx0XHRAc291cmNlVGFyZ2V0XG5cblx0ZGVmIGVsYXBzZWRcblx0XHREYXRlLm5vdyAtIEB0aW1lc3RhbXBcblxuXG5jbGFzcyBJbWJhLlRvdWNoR2VzdHVyZVxuXG5cdHByb3AgYWN0aXZlIGRlZmF1bHQ6IG5vXG5cblx0ZGVmIG9udG91Y2hzdGFydCBlXG5cdFx0c2VsZlxuXG5cdGRlZiBvbnRvdWNodXBkYXRlIGVcblx0XHRzZWxmXG5cblx0ZGVmIG9udG91Y2hlbmQgZVxuXHRcdHNlbGZcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL3RvdWNoLmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5cbnZhciBrZXlDb2RlcyA9IHtcblx0ZXNjOiAyNyxcblx0dGFiOiA5LFxuXHRlbnRlcjogMTMsXG5cdHNwYWNlOiAzMixcblx0dXA6IDM4LFxuXHRkb3duOiA0MFxufVxuXG52YXIgZWwgPSBJbWJhLlRhZzpwcm90b3R5cGVcbmRlZiBlbC5zdG9wTW9kaWZpZXIgZSBkbyBlLnN0b3AgfHwgdHJ1ZVxuZGVmIGVsLnByZXZlbnRNb2RpZmllciBlIGRvIGUucHJldmVudCB8fCB0cnVlXG5kZWYgZWwuc2lsZW5jZU1vZGlmaWVyIGUgZG8gZS5zaWxlbmNlIHx8IHRydWVcbmRlZiBlbC5idWJibGVNb2RpZmllciBlIGRvIGUuYnViYmxlKHllcykgfHwgdHJ1ZVxuZGVmIGVsLmN0cmxNb2RpZmllciBlIGRvIGUuZXZlbnQ6Y3RybEtleSA9PSB0cnVlXG5kZWYgZWwuYWx0TW9kaWZpZXIgZSBkbyBlLmV2ZW50OmFsdEtleSA9PSB0cnVlXG5kZWYgZWwuc2hpZnRNb2RpZmllciBlIGRvIGUuZXZlbnQ6c2hpZnRLZXkgPT0gdHJ1ZVxuZGVmIGVsLm1ldGFNb2RpZmllciBlIGRvIGUuZXZlbnQ6bWV0YUtleSA9PSB0cnVlXG5kZWYgZWwua2V5TW9kaWZpZXIga2V5LCBlIGRvIGUua2V5Q29kZSA/IChlLmtleUNvZGUgPT0ga2V5KSA6IHRydWVcbmRlZiBlbC5kZWxNb2RpZmllciBlIGRvIGUua2V5Q29kZSA/IChlLmtleUNvZGUgPT0gOCBvciBlLmtleUNvZGUgPT0gNDYpIDogdHJ1ZVxuZGVmIGVsLnNlbGZNb2RpZmllciBlIGRvIGUuZXZlbnQ6dGFyZ2V0ID09IEBkb21cbmRlZiBlbC5sZWZ0TW9kaWZpZXIgZSBkbyBlLmJ1dHRvbiAhPSB1bmRlZmluZWQgPyAoZS5idXR0b24gPT09IDApIDogZWwua2V5TW9kaWZpZXIoMzcsZSlcbmRlZiBlbC5yaWdodE1vZGlmaWVyIGUgZG8gZS5idXR0b24gIT0gdW5kZWZpbmVkID8gKGUuYnV0dG9uID09PSAyKSA6IGVsLmtleU1vZGlmaWVyKDM5LGUpXG5kZWYgZWwubWlkZGxlTW9kaWZpZXIgZSBkbyBlLmJ1dHRvbiAhPSB1bmRlZmluZWQgPyAoZS5idXR0b24gPT09IDEpIDogdHJ1ZVxuXHRcbmRlZiBlbC5nZXRIYW5kbGVyIHN0ciwgZXZlbnRcblx0cmV0dXJuIHNlbGYgaWYgc2VsZltzdHJdXG5cbiMjI1xuSW1iYSBoYW5kbGVzIGFsbCBldmVudHMgaW4gdGhlIGRvbSB0aHJvdWdoIGEgc2luZ2xlIG1hbmFnZXIsXG5saXN0ZW5pbmcgYXQgdGhlIHJvb3Qgb2YgeW91ciBkb2N1bWVudC4gSWYgSW1iYSBmaW5kcyBhIHRhZ1xudGhhdCBsaXN0ZW5zIHRvIGEgY2VydGFpbiBldmVudCwgdGhlIGV2ZW50IHdpbGwgYmUgd3JhcHBlZCBcbmluIGFuIGBJbWJhLkV2ZW50YCwgd2hpY2ggbm9ybWFsaXplcyBzb21lIG9mIHRoZSBxdWlya3MgYW5kIFxuYnJvd3NlciBkaWZmZXJlbmNlcy5cblxuQGluYW1lIGV2ZW50XG4jIyNcbmNsYXNzIEltYmEuRXZlbnRcblxuXHQjIyMgcmVmZXJlbmNlIHRvIHRoZSBuYXRpdmUgZXZlbnQgIyMjXG5cdHByb3AgZXZlbnRcblxuXHRwcm9wIHByZWZpeFxuXHRcblx0cHJvcCBzb3VyY2VcblxuXHRwcm9wIGRhdGFcblxuXHRwcm9wIHJlc3BvbmRlclxuXG5cdGRlZiBzZWxmLndyYXAgZVxuXHRcdHNlbGYubmV3KGUpXG5cdFxuXHRkZWYgaW5pdGlhbGl6ZSBlXG5cdFx0ZXZlbnQgPSBlXG5cdFx0QGJ1YmJsZSA9IHllc1xuXG5cdGRlZiB0eXBlPSB0eXBlXG5cdFx0QHR5cGUgPSB0eXBlXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRAcmV0dXJuIHtTdHJpbmd9IFRoZSBuYW1lIG9mIHRoZSBldmVudCAoY2FzZS1pbnNlbnNpdGl2ZSlcblx0IyMjXG5cdGRlZiB0eXBlIGRvIEB0eXBlIHx8IGV2ZW50OnR5cGVcblx0ZGVmIG5hdGl2ZSBkbyBAZXZlbnRcblxuXHRkZWYgbmFtZVxuXHRcdEBuYW1lIHx8PSB0eXBlLnRvTG93ZXJDYXNlLnJlcGxhY2UoL1xcOi9nLCcnKVxuXG5cdCMgbWltYyBnZXRzZXRcblx0ZGVmIGJ1YmJsZSB2XG5cdFx0aWYgdiAhPSB1bmRlZmluZWRcblx0XHRcdHNlbGYuYnViYmxlID0gdlxuXHRcdFx0cmV0dXJuIHNlbGZcblx0XHRyZXR1cm4gQGJ1YmJsZVxuXG5cdGRlZiBidWJibGU9IHZcblx0XHRAYnViYmxlID0gdlxuXHRcdHJldHVybiBzZWxmXG5cblx0IyMjXG5cdFByZXZlbnRzIGZ1cnRoZXIgcHJvcGFnYXRpb24gb2YgdGhlIGN1cnJlbnQgZXZlbnQuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgc3RvcFxuXHRcdGJ1YmJsZSA9IG5vXG5cdFx0c2VsZlxuXG5cdGRlZiBzdG9wUHJvcGFnYXRpb24gZG8gc3RvcFxuXHRkZWYgaGFsdCBkbyBzdG9wXG5cblx0IyBtaWdyYXRlIGZyb20gY2FuY2VsIHRvIHByZXZlbnRcblx0ZGVmIHByZXZlbnRcblx0XHRpZiBldmVudDpwcmV2ZW50RGVmYXVsdFxuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHRcblx0XHRlbHNlXG5cdFx0XHRldmVudDpkZWZhdWx0UHJldmVudGVkID0geWVzXG5cdFx0c2VsZjpkZWZhdWx0UHJldmVudGVkID0geWVzXG5cdFx0c2VsZlxuXG5cdGRlZiBwcmV2ZW50RGVmYXVsdFxuXHRcdGNvbnNvbGUud2FybiBcIkV2ZW50I3ByZXZlbnREZWZhdWx0IGlzIGRlcHJlY2F0ZWQgLSB1c2UgRXZlbnQjcHJldmVudFwiXG5cdFx0cHJldmVudFxuXG5cdCMjI1xuXHRJbmRpY2F0ZXMgd2hldGhlciBvciBub3QgZXZlbnQuY2FuY2VsIGhhcyBiZWVuIGNhbGxlZC5cblxuXHRAcmV0dXJuIHtCb29sZWFufVxuXHQjIyNcblx0ZGVmIGlzUHJldmVudGVkXG5cdFx0ZXZlbnQgYW5kIGV2ZW50OmRlZmF1bHRQcmV2ZW50ZWQgb3IgQGNhbmNlbFxuXG5cdCMjI1xuXHRDYW5jZWwgdGhlIGV2ZW50IChpZiBjYW5jZWxhYmxlKS4gSW4gdGhlIGNhc2Ugb2YgbmF0aXZlIGV2ZW50cyBpdFxuXHR3aWxsIGNhbGwgYHByZXZlbnREZWZhdWx0YCBvbiB0aGUgd3JhcHBlZCBldmVudCBvYmplY3QuXG5cdEByZXR1cm4ge3NlbGZ9XG5cdCMjI1xuXHRkZWYgY2FuY2VsXG5cdFx0Y29uc29sZS53YXJuIFwiRXZlbnQjY2FuY2VsIGlzIGRlcHJlY2F0ZWQgLSB1c2UgRXZlbnQjcHJldmVudFwiXG5cdFx0cHJldmVudFxuXG5cdGRlZiBzaWxlbmNlXG5cdFx0QHNpbGVuY2VkID0geWVzXG5cdFx0c2VsZlxuXG5cdGRlZiBpc1NpbGVuY2VkXG5cdFx0ISFAc2lsZW5jZWRcblxuXHQjIyNcblx0QSByZWZlcmVuY2UgdG8gdGhlIGluaXRpYWwgdGFyZ2V0IG9mIHRoZSBldmVudC5cblx0IyMjXG5cdGRlZiB0YXJnZXRcblx0XHR0YWcoZXZlbnQ6X3RhcmdldCBvciBldmVudDp0YXJnZXQpXG5cblx0IyMjXG5cdEEgcmVmZXJlbmNlIHRvIHRoZSBvYmplY3QgcmVzcG9uZGluZyB0byB0aGUgZXZlbnQuXG5cdCMjI1xuXHRkZWYgcmVzcG9uZGVyXG5cdFx0QHJlc3BvbmRlclxuXG5cdCMjI1xuXHRSZWRpcmVjdCB0aGUgZXZlbnQgdG8gbmV3IHRhcmdldFxuXHQjIyNcblx0ZGVmIHJlZGlyZWN0IG5vZGVcblx0XHRAcmVkaXJlY3QgPSBub2RlXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgcHJvY2Vzc0hhbmRsZXJzIG5vZGUsIGhhbmRsZXJzXG5cdFx0bGV0IGkgPSAxXG5cdFx0bGV0IGwgPSBoYW5kbGVyczpsZW5ndGhcblx0XHRsZXQgYnViYmxlID0gQGJ1YmJsZVxuXHRcdGxldCBzdGF0ZSA9IGhhbmRsZXJzOnN0YXRlIHx8PSB7fVxuXHRcdGxldCByZXN1bHQgXG5cdFx0XG5cdFx0aWYgYnViYmxlXG5cdFx0XHRAYnViYmxlID0gMVxuXG5cdFx0d2hpbGUgaSA8IGxcblx0XHRcdGxldCBpc01vZCA9IGZhbHNlXG5cdFx0XHRsZXQgaGFuZGxlciA9IGhhbmRsZXJzW2krK11cblx0XHRcdGxldCBwYXJhbXMgID0gbnVsbFxuXHRcdFx0bGV0IGNvbnRleHQgPSBub2RlXG5cdFx0XHRcblx0XHRcdGlmIGhhbmRsZXIgaXNhIEFycmF5XG5cdFx0XHRcdHBhcmFtcyA9IGhhbmRsZXIuc2xpY2UoMSlcblx0XHRcdFx0aGFuZGxlciA9IGhhbmRsZXJbMF1cblx0XHRcdFxuXHRcdFx0aWYgdHlwZW9mIGhhbmRsZXIgPT0gJ3N0cmluZydcblx0XHRcdFx0aWYga2V5Q29kZXNbaGFuZGxlcl1cblx0XHRcdFx0XHRwYXJhbXMgPSBba2V5Q29kZXNbaGFuZGxlcl1dXG5cdFx0XHRcdFx0aGFuZGxlciA9ICdrZXknXG5cdFx0XHRcdFx0XG5cdFx0XHRcdGxldCBtb2QgPSBoYW5kbGVyICsgJ01vZGlmaWVyJ1xuXG5cdFx0XHRcdGlmIG5vZGVbbW9kXVxuXHRcdFx0XHRcdGlzTW9kID0geWVzXG5cdFx0XHRcdFx0cGFyYW1zID0gKHBhcmFtcyBvciBbXSkuY29uY2F0KFtzZWxmLHN0YXRlXSlcblx0XHRcdFx0XHRoYW5kbGVyID0gbm9kZVttb2RdXG5cdFx0XHRcblx0XHRcdCMgaWYgaXQgaXMgc3RpbGwgYSBzdHJpbmcgLSBjYWxsIGdldEhhbmRsZXIgb25cblx0XHRcdCMgYW5jZXN0b3Igb2Ygbm9kZSB0byBzZWUgaWYgd2UgZ2V0IGEgaGFuZGxlciBmb3IgdGhpcyBuYW1lXG5cdFx0XHRpZiB0eXBlb2YgaGFuZGxlciA9PSAnc3RyaW5nJ1xuXHRcdFx0XHRsZXQgZWwgPSBub2RlXG5cdFx0XHRcdGxldCBmbiA9IG51bGxcblx0XHRcdFx0bGV0IGN0eCA9IHN0YXRlOmNvbnRleHRcblx0XG5cdFx0XHRcdGlmIGN0eFxuXHRcdFx0XHRcdGlmIGN0eDpnZXRIYW5kbGVyIGlzYSBGdW5jdGlvblxuXHRcdFx0XHRcdFx0Y3R4ID0gY3R4LmdldEhhbmRsZXIoaGFuZGxlcixzZWxmKVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGlmIGN0eFtoYW5kbGVyXSBpc2EgRnVuY3Rpb25cblx0XHRcdFx0XHRcdGhhbmRsZXIgPSBmbiA9IGN0eFtoYW5kbGVyXVxuXHRcdFx0XHRcdFx0Y29udGV4dCA9IGN0eFxuXG5cdFx0XHRcdHVubGVzcyBmblxuXHRcdFx0XHRcdGNvbnNvbGUud2FybiBcImV2ZW50IHt0eXBlfTogY291bGQgbm90IGZpbmQgJ3toYW5kbGVyfScgaW4gY29udGV4dFwiLGN0eFxuXG5cdFx0XHRcdCMgd2hpbGUgZWwgYW5kICghZm4gb3IgIShmbiBpc2EgRnVuY3Rpb24pKVxuXHRcdFx0XHQjIFx0aWYgZm4gPSBlbC5nZXRIYW5kbGVyKGhhbmRsZXIpXG5cdFx0XHRcdCMgXHRcdGlmIGZuW2hhbmRsZXJdIGlzYSBGdW5jdGlvblxuXHRcdFx0XHQjIFx0XHRcdGhhbmRsZXIgPSBmbltoYW5kbGVyXVxuXHRcdFx0XHQjIFx0XHRcdGNvbnRleHQgPSBmblxuXHRcdFx0XHQjIFx0XHRlbGlmIGZuIGlzYSBGdW5jdGlvblxuXHRcdFx0XHQjIFx0XHRcdGhhbmRsZXIgPSBmblxuXHRcdFx0XHQjIFx0XHRcdGNvbnRleHQgPSBlbFxuXHRcdFx0XHQjIFx0ZWxzZVxuXHRcdFx0XHQjIFx0XHRlbCA9IGVsLnBhcmVudFxuXHRcdFx0XHRcdFxuXHRcdFx0aWYgaGFuZGxlciBpc2EgRnVuY3Rpb25cblx0XHRcdFx0IyB3aGF0IGlmIHdlIGFjdHVhbGx5IGNhbGwgc3RvcCBpbnNpZGUgZnVuY3Rpb24/XG5cdFx0XHRcdCMgZG8gd2Ugc3RpbGwgd2FudCB0byBjb250aW51ZSB0aGUgY2hhaW4/XG5cdFx0XHRcdGxldCByZXMgPSBoYW5kbGVyLmFwcGx5KGNvbnRleHQscGFyYW1zIG9yIFtzZWxmXSlcblxuXHRcdFx0XHRpZiAhaXNNb2Rcblx0XHRcdFx0XHRAcmVzcG9uZGVyIHx8PSBub2RlXG5cblx0XHRcdFx0aWYgcmVzID09IGZhbHNlXG5cdFx0XHRcdFx0IyBjb25zb2xlLmxvZyBcInJldHVybmVkIGZhbHNlIC0gYnJlYWtpbmdcIlxuXHRcdFx0XHRcdGJyZWFrXG5cblx0XHRcdFx0aWYgcmVzIGFuZCAhQHNpbGVuY2VkIGFuZCByZXM6dGhlbiBpc2EgRnVuY3Rpb25cblx0XHRcdFx0XHRyZXMudGhlbihJbWJhOmNvbW1pdClcblx0XHRcblx0XHQjIGlmIHdlIGhhdmVudCBzdG9wcGVkIG9yIGRlYWx0IHdpdGggYnViYmxlIHdoaWxlIGhhbmRsaW5nXG5cdFx0aWYgQGJ1YmJsZSA9PT0gMVxuXHRcdFx0QGJ1YmJsZSA9IGJ1YmJsZVxuXG5cdFx0cmV0dXJuIG51bGxcblxuXHRkZWYgcHJvY2Vzc1xuXHRcdHZhciBuYW1lID0gc2VsZi5uYW1lXG5cdFx0dmFyIG1ldGggPSBcIm9ue0BwcmVmaXggb3IgJyd9e25hbWV9XCJcblx0XHR2YXIgYXJncyA9IG51bGxcblx0XHR2YXIgZG9tdGFyZ2V0ID0gZXZlbnQ6X3RhcmdldCBvciBldmVudDp0YXJnZXRcdFx0XG5cdFx0dmFyIGRvbW5vZGUgPSBkb210YXJnZXQ6X3Jlc3BvbmRlciBvciBkb210YXJnZXRcblx0XHQjIEB0b2RvIG5lZWQgdG8gc3RvcCBpbmZpbml0ZSByZWRpcmVjdC1ydWxlcyBoZXJlXG5cdFx0dmFyIHJlc3VsdFxuXHRcdHZhciBoYW5kbGVyc1xuXG5cdFx0d2hpbGUgZG9tbm9kZVxuXHRcdFx0QHJlZGlyZWN0ID0gbnVsbFxuXHRcdFx0bGV0IG5vZGUgPSBkb21ub2RlLkBkb20gPyBkb21ub2RlIDogZG9tbm9kZS5AdGFnXG5cblx0XHRcdGlmIG5vZGVcblx0XHRcdFx0aWYgaGFuZGxlcnMgPSBub2RlOl9vbl9cblx0XHRcdFx0XHRmb3IgaGFuZGxlciBpbiBoYW5kbGVycyB3aGVuIGhhbmRsZXJcblx0XHRcdFx0XHRcdGxldCBobmFtZSA9IGhhbmRsZXJbMF1cblx0XHRcdFx0XHRcdGlmIG5hbWUgPT0gaGFuZGxlclswXSBhbmQgYnViYmxlXG5cdFx0XHRcdFx0XHRcdHByb2Nlc3NIYW5kbGVycyhub2RlLGhhbmRsZXIpXG5cdFx0XHRcdFx0YnJlYWsgdW5sZXNzIGJ1YmJsZVxuXG5cdFx0XHRcdGlmIGJ1YmJsZSBhbmQgbm9kZVttZXRoXSBpc2EgRnVuY3Rpb25cblx0XHRcdFx0XHRAcmVzcG9uZGVyIHx8PSBub2RlXG5cdFx0XHRcdFx0QHNpbGVuY2VkID0gbm9cblx0XHRcdFx0XHRyZXN1bHQgPSBhcmdzID8gbm9kZVttZXRoXS5hcHBseShub2RlLGFyZ3MpIDogbm9kZVttZXRoXShzZWxmLGRhdGEpXG5cblx0XHRcdFx0aWYgbm9kZTpvbmV2ZW50XG5cdFx0XHRcdFx0bm9kZS5vbmV2ZW50KHNlbGYpXG5cblx0XHRcdCMgYWRkIG5vZGUubmV4dEV2ZW50UmVzcG9uZGVyIGFzIGEgc2VwYXJhdGUgbWV0aG9kIGhlcmU/XG5cdFx0XHR1bmxlc3MgYnViYmxlIGFuZCBkb21ub2RlID0gKEByZWRpcmVjdCBvciAobm9kZSA/IG5vZGUucGFyZW50IDogZG9tbm9kZTpwYXJlbnROb2RlKSlcblx0XHRcdFx0YnJlYWtcblxuXHRcdHByb2Nlc3NlZFxuXG5cdFx0IyBpZiBhIGhhbmRsZXIgcmV0dXJucyBhIHByb21pc2UsIG5vdGlmeSBzY2hlZHVsZXJzXG5cdFx0IyBhYm91dCB0aGlzIGFmdGVyIHByb21pc2UgaGFzIGZpbmlzaGVkIHByb2Nlc3Npbmdcblx0XHRpZiByZXN1bHQgYW5kIHJlc3VsdDp0aGVuIGlzYSBGdW5jdGlvblxuXHRcdFx0cmVzdWx0LnRoZW4oc2VsZjpwcm9jZXNzZWQuYmluZChzZWxmKSlcblx0XHRyZXR1cm4gc2VsZlxuXG5cblx0ZGVmIHByb2Nlc3NlZFxuXHRcdGlmICFAc2lsZW5jZWQgYW5kIEByZXNwb25kZXJcblx0XHRcdEltYmEuZW1pdChJbWJhLCdldmVudCcsW3NlbGZdKVxuXHRcdFx0SW1iYS5jb21taXQoZXZlbnQpXG5cdFx0c2VsZlxuXG5cdCMjI1xuXHRSZXR1cm4gdGhlIHgvbGVmdCBjb29yZGluYXRlIG9mIHRoZSBtb3VzZSAvIHBvaW50ZXIgZm9yIHRoaXMgZXZlbnRcblx0QHJldHVybiB7TnVtYmVyfSB4IGNvb3JkaW5hdGUgb2YgbW91c2UgLyBwb2ludGVyIGZvciBldmVudFxuXHQjIyNcblx0ZGVmIHggZG8gbmF0aXZlOnhcblxuXHQjIyNcblx0UmV0dXJuIHRoZSB5L3RvcCBjb29yZGluYXRlIG9mIHRoZSBtb3VzZSAvIHBvaW50ZXIgZm9yIHRoaXMgZXZlbnRcblx0QHJldHVybiB7TnVtYmVyfSB5IGNvb3JkaW5hdGUgb2YgbW91c2UgLyBwb2ludGVyIGZvciBldmVudFxuXHQjIyNcblx0ZGVmIHkgZG8gbmF0aXZlOnlcblx0XHRcblx0ZGVmIGJ1dHRvbiBkbyBuYXRpdmU6YnV0dG9uXG5cdGRlZiBrZXlDb2RlIGRvIG5hdGl2ZTprZXlDb2RlXG5cdGRlZiBjdHJsIGRvIG5hdGl2ZTpjdHJsS2V5XG5cdGRlZiBhbHQgZG8gbmF0aXZlOmFsdEtleVxuXHRkZWYgc2hpZnQgZG8gbmF0aXZlOnNoaWZ0S2V5XG5cdGRlZiBtZXRhIGRvIG5hdGl2ZTptZXRhS2V5XG5cdGRlZiBrZXkgZG8gbmF0aXZlOmtleVxuXG5cdCMjI1xuXHRSZXR1cm5zIGEgTnVtYmVyIHJlcHJlc2VudGluZyBhIHN5c3RlbSBhbmQgaW1wbGVtZW50YXRpb25cblx0ZGVwZW5kZW50IG51bWVyaWMgY29kZSBpZGVudGlmeWluZyB0aGUgdW5tb2RpZmllZCB2YWx1ZSBvZiB0aGVcblx0cHJlc3NlZCBrZXk7IHRoaXMgaXMgdXN1YWxseSB0aGUgc2FtZSBhcyBrZXlDb2RlLlxuXG5cdEZvciBtb3VzZS1ldmVudHMsIHRoZSByZXR1cm5lZCB2YWx1ZSBpbmRpY2F0ZXMgd2hpY2ggYnV0dG9uIHdhc1xuXHRwcmVzc2VkIG9uIHRoZSBtb3VzZSB0byB0cmlnZ2VyIHRoZSBldmVudC5cblxuXHRAcmV0dXJuIHtOdW1iZXJ9XG5cdCMjI1xuXHRkZWYgd2hpY2ggZG8gZXZlbnQ6d2hpY2hcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uL2ltYmEvc3JjL2ltYmEvZG9tL2V2ZW50LmltYmEiLCJ2YXIgSW1iYSA9IHJlcXVpcmUoXCIuLi9pbWJhXCIpXG5yZXF1aXJlKFwiLi9wb2ludGVyXCIpXG5cbiMjI1xuXG5NYW5hZ2VyIGZvciBsaXN0ZW5pbmcgdG8gYW5kIGRlbGVnYXRpbmcgZXZlbnRzIGluIEltYmEuIEEgc2luZ2xlIGluc3RhbmNlXG5pcyBhbHdheXMgY3JlYXRlZCBieSBJbWJhIChhcyBgSW1iYS5FdmVudHNgKSwgd2hpY2ggaGFuZGxlcyBhbmQgZGVsZWdhdGVzIGFsbFxuZXZlbnRzIGF0IHRoZSB2ZXJ5IHJvb3Qgb2YgdGhlIGRvY3VtZW50LiBJbWJhIGRvZXMgbm90IGNhcHR1cmUgYWxsIGV2ZW50c1xuYnkgZGVmYXVsdCwgc28gaWYgeW91IHdhbnQgdG8gbWFrZSBzdXJlIGV4b3RpYyBvciBjdXN0b20gRE9NRXZlbnRzIGFyZSBkZWxlZ2F0ZWRcbmluIEltYmEgeW91IHdpbGwgbmVlZCB0byByZWdpc3RlciB0aGVtIGluIGBJbWJhLkV2ZW50cy5yZWdpc3RlcihteUN1c3RvbUV2ZW50TmFtZSlgXG5cbkBpbmFtZSBtYW5hZ2VyXG5cbiMjI1xuY2xhc3MgSW1iYS5FdmVudE1hbmFnZXJcblxuXHRwcm9wIHJvb3Rcblx0cHJvcCBjb3VudFxuXHRwcm9wIGVuYWJsZWQgZGVmYXVsdDogbm8sIHdhdGNoOiB5ZXNcblx0cHJvcCBsaXN0ZW5lcnNcblx0cHJvcCBkZWxlZ2F0b3JzXG5cdHByb3AgZGVsZWdhdG9yXG5cblx0ZGVmIGVuYWJsZWQtZGlkLXNldCBib29sXG5cdFx0Ym9vbCA/IG9uZW5hYmxlIDogb25kaXNhYmxlXG5cdFx0c2VsZlxuXG5cdGRlZiBzZWxmLmFjdGl2YXRlXG5cdFx0cmV0dXJuIEltYmEuRXZlbnRzIGlmIEltYmEuRXZlbnRzXG5cblx0XHRpZiAkd2ViJFxuXHRcdFx0SW1iYS5QT0lOVEVSIHx8PSBJbWJhLlBvaW50ZXIubmV3XG5cblx0XHRcdEltYmEuRXZlbnRzID0gSW1iYS5FdmVudE1hbmFnZXIubmV3KEltYmEuZG9jdW1lbnQsIGV2ZW50czogW1xuXHRcdFx0XHQ6a2V5ZG93biwgOmtleXVwLCA6a2V5cHJlc3MsXG5cdFx0XHRcdDp0ZXh0SW5wdXQsIDppbnB1dCwgOmNoYW5nZSwgOnN1Ym1pdCxcblx0XHRcdFx0OmZvY3VzaW4sIDpmb2N1c291dCwgOmZvY3VzLCA6Ymx1cixcblx0XHRcdFx0OmNvbnRleHRtZW51LCA6ZGJsY2xpY2ssXG5cdFx0XHRcdDptb3VzZXdoZWVsLCA6d2hlZWwsIDpzY3JvbGwsXG5cdFx0XHRcdDpiZWZvcmVjb3B5LCA6Y29weSxcblx0XHRcdFx0OmJlZm9yZXBhc3RlLCA6cGFzdGUsXG5cdFx0XHRcdDpiZWZvcmVjdXQsIDpjdXRcblx0XHRcdF0pXG5cblx0XHRcdCMgc2hvdWxkIGxpc3RlbiB0byBkcmFnZHJvcCBldmVudHMgYnkgZGVmYXVsdFxuXHRcdFx0SW1iYS5FdmVudHMucmVnaXN0ZXIoW1xuXHRcdFx0XHQ6ZHJhZ3N0YXJ0LDpkcmFnLDpkcmFnZW5kLFxuXHRcdFx0XHQ6ZHJhZ2VudGVyLDpkcmFnb3Zlciw6ZHJhZ2xlYXZlLDpkcmFnZXhpdCw6ZHJvcFxuXHRcdFx0XSlcblxuXHRcdFx0dmFyIGhhc1RvdWNoRXZlbnRzID0gd2luZG93ICYmIHdpbmRvdzpvbnRvdWNoc3RhcnQgIT09IHVuZGVmaW5lZFxuXG5cdFx0XHRpZiBoYXNUb3VjaEV2ZW50c1xuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoc3RhcnQpIGRvIHxlfFxuXHRcdFx0XHRcdEltYmEuVG91Y2gub250b3VjaHN0YXJ0KGUpXG5cblx0XHRcdFx0SW1iYS5FdmVudHMubGlzdGVuKDp0b3VjaG1vdmUpIGRvIHxlfFxuXHRcdFx0XHRcdEltYmEuVG91Y2gub250b3VjaG1vdmUoZSlcblxuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoZW5kKSBkbyB8ZXxcblx0XHRcdFx0XHRJbWJhLlRvdWNoLm9udG91Y2hlbmQoZSlcblxuXHRcdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOnRvdWNoY2FuY2VsKSBkbyB8ZXxcblx0XHRcdFx0XHRJbWJhLlRvdWNoLm9udG91Y2hjYW5jZWwoZSlcblxuXHRcdFx0SW1iYS5FdmVudHMucmVnaXN0ZXIoOmNsaWNrKSBkbyB8ZXxcblx0XHRcdFx0IyBPbmx5IGZvciBtYWluIG1vdXNlYnV0dG9uLCBubz9cblx0XHRcdFx0aWYgKGU6dGltZVN0YW1wIC0gSW1iYS5Ub3VjaC5MYXN0VGltZXN0YW1wKSA+IEltYmEuVG91Y2guVGFwVGltZW91dFxuXHRcdFx0XHRcdGUuQGltYmFTaW11bGF0ZWRUYXAgPSB5ZXNcblx0XHRcdFx0XHR2YXIgdGFwID0gSW1iYS5FdmVudC5uZXcoZSlcblx0XHRcdFx0XHR0YXAudHlwZSA9ICd0YXAnXG5cdFx0XHRcdFx0dGFwLnByb2Nlc3Ncblx0XHRcdFx0XHRpZiB0YXAuQHJlc3BvbmRlclxuXHRcdFx0XHRcdFx0cmV0dXJuIGUucHJldmVudERlZmF1bHRcblx0XHRcdFx0IyBkZWxlZ2F0ZSB0aGUgcmVhbCBjbGljayBldmVudFxuXHRcdFx0XHRJbWJhLkV2ZW50cy5kZWxlZ2F0ZShlKVxuXG5cdFx0XHRJbWJhLkV2ZW50cy5saXN0ZW4oOm1vdXNlZG93bikgZG8gfGV8XG5cdFx0XHRcdGlmIChlOnRpbWVTdGFtcCAtIEltYmEuVG91Y2guTGFzdFRpbWVzdGFtcCkgPiBJbWJhLlRvdWNoLlRhcFRpbWVvdXRcblx0XHRcdFx0XHRJbWJhLlBPSU5URVIudXBkYXRlKGUpLnByb2Nlc3MgaWYgSW1iYS5QT0lOVEVSXG5cblx0XHRcdEltYmEuRXZlbnRzLmxpc3Rlbig6bW91c2V1cCkgZG8gfGV8XG5cdFx0XHRcdGlmIChlOnRpbWVTdGFtcCAtIEltYmEuVG91Y2guTGFzdFRpbWVzdGFtcCkgPiBJbWJhLlRvdWNoLlRhcFRpbWVvdXRcblx0XHRcdFx0XHRJbWJhLlBPSU5URVIudXBkYXRlKGUpLnByb2Nlc3MgaWYgSW1iYS5QT0lOVEVSXG5cblx0XHRcdEltYmEuRXZlbnRzLnJlZ2lzdGVyKFs6bW91c2Vkb3duLDptb3VzZXVwXSlcblx0XHRcdEltYmEuRXZlbnRzLmVuYWJsZWQgPSB5ZXNcblx0XHRcdHJldHVybiBJbWJhLkV2ZW50c1xuXG5cblx0ZGVmIGluaXRpYWxpemUgbm9kZSwgZXZlbnRzOiBbXVxuXHRcdEBzaGltRm9jdXNFdmVudHMgPSAkd2ViJCAmJiB3aW5kb3c6bmV0c2NhcGUgJiYgbm9kZTpvbmZvY3VzaW4gPT09IHVuZGVmaW5lZFxuXHRcdHJvb3QgPSBub2RlXG5cdFx0bGlzdGVuZXJzID0gW11cblx0XHRkZWxlZ2F0b3JzID0ge31cblx0XHRkZWxlZ2F0b3IgPSBkbyB8ZXwgXG5cdFx0XHRkZWxlZ2F0ZShlKVxuXHRcdFx0cmV0dXJuIHRydWVcblxuXHRcdGZvciBldmVudCBpbiBldmVudHNcblx0XHRcdHJlZ2lzdGVyKGV2ZW50KVxuXG5cdFx0cmV0dXJuIHNlbGZcblxuXHQjIyNcblxuXHRUZWxsIHRoZSBjdXJyZW50IEV2ZW50TWFuYWdlciB0byBpbnRlcmNlcHQgYW5kIGhhbmRsZSBldmVudCBvZiBhIGNlcnRhaW4gbmFtZS5cblx0QnkgZGVmYXVsdCwgSW1iYS5FdmVudHMgd2lsbCByZWdpc3RlciBpbnRlcmNlcHRvcnMgZm9yOiAqa2V5ZG93biosICprZXl1cCosIFxuXHQqa2V5cHJlc3MqLCAqdGV4dElucHV0KiwgKmlucHV0KiwgKmNoYW5nZSosICpzdWJtaXQqLCAqZm9jdXNpbiosICpmb2N1c291dCosIFxuXHQqYmx1ciosICpjb250ZXh0bWVudSosICpkYmxjbGljayosICptb3VzZXdoZWVsKiwgKndoZWVsKlxuXG5cdCMjI1xuXHRkZWYgcmVnaXN0ZXIgbmFtZSwgaGFuZGxlciA9IHRydWVcblx0XHRpZiBuYW1lIGlzYSBBcnJheVxuXHRcdFx0cmVnaXN0ZXIodixoYW5kbGVyKSBmb3IgdiBpbiBuYW1lXG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0cmV0dXJuIHNlbGYgaWYgZGVsZWdhdG9yc1tuYW1lXVxuXHRcdCMgY29uc29sZS5sb2coXCJyZWdpc3RlciBmb3IgZXZlbnQge25hbWV9XCIpXG5cdFx0dmFyIGZuID0gZGVsZWdhdG9yc1tuYW1lXSA9IGhhbmRsZXIgaXNhIEZ1bmN0aW9uID8gaGFuZGxlciA6IGRlbGVnYXRvclxuXHRcdHJvb3QuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLGZuLHllcykgaWYgZW5hYmxlZFxuXG5cdGRlZiBsaXN0ZW4gbmFtZSwgaGFuZGxlciwgY2FwdHVyZSA9IHllc1xuXHRcdGxpc3RlbmVycy5wdXNoKFtuYW1lLGhhbmRsZXIsY2FwdHVyZV0pXG5cdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKG5hbWUsaGFuZGxlcixjYXB0dXJlKSBpZiBlbmFibGVkXG5cdFx0c2VsZlxuXG5cdGRlZiBkZWxlZ2F0ZSBlXG5cdFx0dmFyIGV2ZW50ID0gSW1iYS5FdmVudC53cmFwKGUpXG5cdFx0ZXZlbnQucHJvY2Vzc1xuXHRcdGlmIEBzaGltRm9jdXNFdmVudHNcblx0XHRcdGlmIGU6dHlwZSA9PSAnZm9jdXMnXG5cdFx0XHRcdEltYmEuRXZlbnQud3JhcChlKS5zZXRUeXBlKCdmb2N1c2luJykucHJvY2Vzc1xuXHRcdFx0ZWxpZiBlOnR5cGUgPT0gJ2JsdXInXG5cdFx0XHRcdEltYmEuRXZlbnQud3JhcChlKS5zZXRUeXBlKCdmb2N1c291dCcpLnByb2Nlc3Ncblx0XHRzZWxmXG5cblx0IyMjXG5cblx0Q3JlYXRlIGEgbmV3IEltYmEuRXZlbnRcblxuXHQjIyNcblx0ZGVmIGNyZWF0ZSB0eXBlLCB0YXJnZXQsIGRhdGE6IG51bGwsIHNvdXJjZTogbnVsbFxuXHRcdHZhciBldmVudCA9IEltYmEuRXZlbnQud3JhcCB0eXBlOiB0eXBlLCB0YXJnZXQ6IHRhcmdldFxuXHRcdGV2ZW50LmRhdGEgPSBkYXRhIGlmIGRhdGFcblx0XHRldmVudC5zb3VyY2UgPSBzb3VyY2UgaWYgc291cmNlXG5cdFx0ZXZlbnRcblxuXHQjIyNcblxuXHRUcmlnZ2VyIC8gcHJvY2VzcyBhbiBJbWJhLkV2ZW50LlxuXG5cdCMjI1xuXHRkZWYgdHJpZ2dlclxuXHRcdGNyZWF0ZSgqYXJndW1lbnRzKS5wcm9jZXNzXG5cblx0ZGVmIG9uZW5hYmxlXG5cdFx0Zm9yIG93biBuYW1lLGhhbmRsZXIgb2YgZGVsZWdhdG9yc1xuXHRcdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKG5hbWUsaGFuZGxlcix5ZXMpXG5cblx0XHRmb3IgaXRlbSBpbiBsaXN0ZW5lcnNcblx0XHRcdHJvb3QuYWRkRXZlbnRMaXN0ZW5lcihpdGVtWzBdLGl0ZW1bMV0saXRlbVsyXSlcblx0XHRcdFxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJyxJbWJhOmNvbW1pdClcblx0XHRzZWxmXG5cblx0ZGVmIG9uZGlzYWJsZVxuXHRcdGZvciBvd24gbmFtZSxoYW5kbGVyIG9mIGRlbGVnYXRvcnNcblx0XHRcdHJvb3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLGhhbmRsZXIseWVzKVxuXG5cdFx0Zm9yIGl0ZW0gaW4gbGlzdGVuZXJzXG5cdFx0XHRyb290LnJlbW92ZUV2ZW50TGlzdGVuZXIoaXRlbVswXSxpdGVtWzFdLGl0ZW1bMl0pXG5cblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsSW1iYTpjb21taXQpXG5cdFx0c2VsZlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi9pbWJhL3NyYy9pbWJhL2RvbS9ldmVudC1tYW5hZ2VyLmltYmEiLCJleHRlcm4gbmF2aWdhdG9yXG5cbnZhciBJbWJhID0gcmVxdWlyZShcIi4uL2ltYmFcIilcblxuZGVmIHJlbW92ZU5lc3RlZCByb290LCBub2RlLCBjYXJldFxuXHQjIGlmIG5vZGUvbm9kZXMgaXNhIFN0cmluZ1xuXHQjIFx0d2UgbmVlZCB0byB1c2UgdGhlIGNhcmV0IHRvIHJlbW92ZSBlbGVtZW50c1xuXHQjIFx0Zm9yIG5vdyB3ZSB3aWxsIHNpbXBseSBub3Qgc3VwcG9ydCB0aGlzXG5cdGlmIG5vZGUgaXNhIEFycmF5XG5cdFx0cmVtb3ZlTmVzdGVkKHJvb3QsbWVtYmVyLGNhcmV0KSBmb3IgbWVtYmVyIGluIG5vZGVcblx0ZWxpZiBub2RlIGFuZCBub2RlLkBkb21cblx0XHRyb290LnJlbW92ZUNoaWxkKG5vZGUpXG5cdGVsaWYgbm9kZSAhPSBudWxsXG5cdFx0IyB3aGF0IGlmIHRoaXMgaXMgbm90IG51bGw/IT8hP1xuXHRcdCMgdGFrZSBhIGNoYW5jZSBhbmQgcmVtb3ZlIGEgdGV4dC1lbGVtZW50bmdcblx0XHRsZXQgbmV4dCA9IGNhcmV0ID8gY2FyZXQ6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZFxuXHRcdGlmIG5leHQgaXNhIFRleHQgYW5kIG5leHQ6dGV4dENvbnRlbnQgPT0gbm9kZVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChuZXh0KVxuXHRcdGVsc2Vcblx0XHRcdHRocm93ICdjYW5ub3QgcmVtb3ZlIHN0cmluZydcblxuXHRyZXR1cm4gY2FyZXRcblxuZGVmIGFwcGVuZE5lc3RlZCByb290LCBub2RlXG5cdGlmIG5vZGUgaXNhIEFycmF5XG5cdFx0bGV0IGkgPSAwXG5cdFx0bGV0IGMgPSBub2RlOnRhZ2xlblxuXHRcdGxldCBrID0gYyAhPSBudWxsID8gKG5vZGU6ZG9tbGVuID0gYykgOiBub2RlOmxlbmd0aFxuXHRcdGFwcGVuZE5lc3RlZChyb290LG5vZGVbaSsrXSkgd2hpbGUgaSA8IGtcblx0ZWxpZiBub2RlIGFuZCBub2RlLkBkb21cblx0XHRyb290LmFwcGVuZENoaWxkKG5vZGUpXG5cdGVsaWYgbm9kZSAhPSBudWxsIGFuZCBub2RlICE9PSBmYWxzZVxuXHRcdHJvb3QuYXBwZW5kQ2hpbGQgSW1iYS5jcmVhdGVUZXh0Tm9kZShub2RlKVxuXG5cdHJldHVyblxuXG5cbiMgaW5zZXJ0IG5vZGVzIGJlZm9yZSBhIGNlcnRhaW4gbm9kZVxuIyBkb2VzIG5vdCBuZWVkIHRvIHJldHVybiBhbnkgdGFpbCwgYXMgYmVmb3JlXG4jIHdpbGwgc3RpbGwgYmUgY29ycmVjdCB0aGVyZVxuIyBiZWZvcmUgbXVzdCBiZSBhbiBhY3R1YWwgZG9tbm9kZVxuZGVmIGluc2VydE5lc3RlZEJlZm9yZSByb290LCBub2RlLCBiZWZvcmVcblx0aWYgbm9kZSBpc2EgQXJyYXlcblx0XHRsZXQgaSA9IDBcblx0XHRsZXQgYyA9IG5vZGU6dGFnbGVuXG5cdFx0bGV0IGsgPSBjICE9IG51bGwgPyAobm9kZTpkb21sZW4gPSBjKSA6IG5vZGU6bGVuZ3RoXG5cdFx0aW5zZXJ0TmVzdGVkQmVmb3JlKHJvb3Qsbm9kZVtpKytdLGJlZm9yZSkgd2hpbGUgaSA8IGtcblxuXHRlbGlmIG5vZGUgYW5kIG5vZGUuQGRvbVxuXHRcdHJvb3QuaW5zZXJ0QmVmb3JlKG5vZGUsYmVmb3JlKVxuXHRlbGlmIG5vZGUgIT0gbnVsbCBhbmQgbm9kZSAhPT0gZmFsc2Vcblx0XHRyb290Lmluc2VydEJlZm9yZShJbWJhLmNyZWF0ZVRleHROb2RlKG5vZGUpLGJlZm9yZSlcblxuXHRyZXR1cm4gYmVmb3JlXG5cbiMgYWZ0ZXIgbXVzdCBiZSBhbiBhY3R1YWwgZG9tbm9kZVxuZGVmIGluc2VydE5lc3RlZEFmdGVyIHJvb3QsIG5vZGUsIGFmdGVyXG5cdHZhciBiZWZvcmUgPSBhZnRlciA/IGFmdGVyOm5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblxuXHRpZiBiZWZvcmVcblx0XHRpbnNlcnROZXN0ZWRCZWZvcmUocm9vdCxub2RlLGJlZm9yZSlcblx0XHRyZXR1cm4gYmVmb3JlOnByZXZpb3VzU2libGluZ1xuXHRlbHNlXG5cdFx0YXBwZW5kTmVzdGVkKHJvb3Qsbm9kZSlcblx0XHRyZXR1cm4gcm9vdC5AZG9tOmxhc3RDaGlsZFxuXG5kZWYgcmVjb25jaWxlQ29sbGVjdGlvbkNoYW5nZXMgcm9vdCwgbmV3LCBvbGQsIGNhcmV0XG5cblx0dmFyIG5ld0xlbiA9IG5ldzpsZW5ndGhcblx0dmFyIGxhc3ROZXcgPSBuZXdbbmV3TGVuIC0gMV1cblxuXHQjIFRoaXMgcmUtb3JkZXIgYWxnb3JpdGhtIGlzIGJhc2VkIG9uIHRoZSBmb2xsb3dpbmcgcHJpbmNpcGxlOlxuXHQjIFxuXHQjIFdlIGJ1aWxkIGEgXCJjaGFpblwiIHdoaWNoIHNob3dzIHdoaWNoIGl0ZW1zIGFyZSBhbHJlYWR5IHNvcnRlZC5cblx0IyBJZiB3ZSdyZSBnb2luZyBmcm9tIFsxLCAyLCAzXSAtPiBbMiwgMSwgM10sIHRoZSB0cmVlIGxvb2tzIGxpa2U6XG5cdCNcblx0IyBcdDMgLT4gIDAgKGlkeClcblx0IyBcdDIgLT4gLTEgKGlkeClcblx0IyBcdDEgLT4gLTEgKGlkeClcblx0I1xuXHQjIFRoaXMgdGVsbHMgdXMgdGhhdCB3ZSBoYXZlIHR3byBjaGFpbnMgb2Ygb3JkZXJlZCBpdGVtczpcblx0IyBcblx0IyBcdCgxLCAzKSBhbmQgKDIpXG5cdCMgXG5cdCMgVGhlIG9wdGltYWwgcmUtb3JkZXJpbmcgdGhlbiBiZWNvbWVzIHRvIGtlZXAgdGhlIGxvbmdlc3QgY2hhaW4gaW50YWN0LFxuXHQjIGFuZCBtb3ZlIGFsbCB0aGUgb3RoZXIgaXRlbXMuXG5cblx0dmFyIG5ld1Bvc2l0aW9uID0gW11cblxuXHQjIFRoZSB0cmVlL2dyYXBoIGl0c2VsZlxuXHR2YXIgcHJldkNoYWluID0gW11cblx0IyBUaGUgbGVuZ3RoIG9mIHRoZSBjaGFpblxuXHR2YXIgbGVuZ3RoQ2hhaW4gPSBbXVxuXG5cdCMgS2VlcCB0cmFjayBvZiB0aGUgbG9uZ2VzdCBjaGFpblxuXHR2YXIgbWF4Q2hhaW5MZW5ndGggPSAwXG5cdHZhciBtYXhDaGFpbkVuZCA9IDBcblxuXHR2YXIgaGFzVGV4dE5vZGVzID0gbm9cblx0dmFyIG5ld1Bvc1xuXG5cdGZvciBub2RlLCBpZHggaW4gb2xkXG5cdFx0IyBzcGVjaWFsIGNhc2UgZm9yIFRleHQgbm9kZXNcblx0XHRpZiBub2RlIGFuZCBub2RlOm5vZGVUeXBlID09IDNcblx0XHRcdG5ld1BvcyA9IG5ldy5pbmRleE9mKG5vZGU6dGV4dENvbnRlbnQpXG5cdFx0XHRuZXdbbmV3UG9zXSA9IG5vZGUgaWYgbmV3UG9zID49IDBcblx0XHRcdGhhc1RleHROb2RlcyA9IHllc1xuXHRcdGVsc2Vcblx0XHRcdG5ld1BvcyA9IG5ldy5pbmRleE9mKG5vZGUpXG5cblx0XHRuZXdQb3NpdGlvbi5wdXNoKG5ld1BvcylcblxuXHRcdGlmIG5ld1BvcyA9PSAtMVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChub2RlKVxuXHRcdFx0cHJldkNoYWluLnB1c2goLTEpXG5cdFx0XHRsZW5ndGhDaGFpbi5wdXNoKC0xKVxuXHRcdFx0Y29udGludWVcblxuXHRcdHZhciBwcmV2SWR4ID0gbmV3UG9zaXRpb246bGVuZ3RoIC0gMlxuXG5cdFx0IyBCdWlsZCB0aGUgY2hhaW46XG5cdFx0d2hpbGUgcHJldklkeCA+PSAwXG5cdFx0XHRpZiBuZXdQb3NpdGlvbltwcmV2SWR4XSA9PSAtMVxuXHRcdFx0XHRwcmV2SWR4LS1cblx0XHRcdGVsaWYgbmV3UG9zID4gbmV3UG9zaXRpb25bcHJldklkeF1cblx0XHRcdFx0IyBZYXksIHdlJ3JlIGJpZ2dlciB0aGFuIHRoZSBwcmV2aW91cyFcblx0XHRcdFx0YnJlYWtcblx0XHRcdGVsc2Vcblx0XHRcdFx0IyBOb3BlLCBsZXQncyB3YWxrIGJhY2sgdGhlIGNoYWluXG5cdFx0XHRcdHByZXZJZHggPSBwcmV2Q2hhaW5bcHJldklkeF1cblxuXHRcdHByZXZDaGFpbi5wdXNoKHByZXZJZHgpXG5cblx0XHR2YXIgY3Vyckxlbmd0aCA9IChwcmV2SWR4ID09IC0xKSA/IDAgOiBsZW5ndGhDaGFpbltwcmV2SWR4XSsxXG5cblx0XHRpZiBjdXJyTGVuZ3RoID4gbWF4Q2hhaW5MZW5ndGhcblx0XHRcdG1heENoYWluTGVuZ3RoID0gY3Vyckxlbmd0aFxuXHRcdFx0bWF4Q2hhaW5FbmQgPSBpZHhcblxuXHRcdGxlbmd0aENoYWluLnB1c2goY3Vyckxlbmd0aClcblxuXHR2YXIgc3RpY2t5Tm9kZXMgPSBbXVxuXG5cdCMgTm93IHdlIGNhbiB3YWxrIHRoZSBsb25nZXN0IGNoYWluIGJhY2t3YXJkcyBhbmQgbWFyayB0aGVtIGFzIFwic3RpY2t5XCIsXG5cdCMgd2hpY2ggaW1wbGllcyB0aGF0IHRoZXkgc2hvdWxkIG5vdCBiZSBtb3ZlZFxuXHR2YXIgY3Vyc29yID0gbmV3UG9zaXRpb246bGVuZ3RoIC0gMVxuXHR3aGlsZSBjdXJzb3IgPj0gMFxuXHRcdGlmIGN1cnNvciA9PSBtYXhDaGFpbkVuZCBhbmQgbmV3UG9zaXRpb25bY3Vyc29yXSAhPSAtMVxuXHRcdFx0c3RpY2t5Tm9kZXNbbmV3UG9zaXRpb25bY3Vyc29yXV0gPSB0cnVlXG5cdFx0XHRtYXhDaGFpbkVuZCA9IHByZXZDaGFpblttYXhDaGFpbkVuZF1cblxuXHRcdGN1cnNvciAtPSAxXG5cblx0IyBwb3NzaWJsZSB0byBkbyB0aGlzIGluIHJldmVyc2VkIG9yZGVyIGluc3RlYWQ/XG5cdGZvciBub2RlLCBpZHggaW4gbmV3XG5cdFx0aWYgIXN0aWNreU5vZGVzW2lkeF1cblx0XHRcdCMgY3JlYXRlIHRleHRub2RlIGZvciBzdHJpbmcsIGFuZCB1cGRhdGUgdGhlIGFycmF5XG5cdFx0XHR1bmxlc3Mgbm9kZSBhbmQgbm9kZS5AZG9tXG5cdFx0XHRcdG5vZGUgPSBuZXdbaWR4XSA9IEltYmEuY3JlYXRlVGV4dE5vZGUobm9kZSlcblxuXHRcdFx0dmFyIGFmdGVyID0gbmV3W2lkeCAtIDFdXG5cdFx0XHRpbnNlcnROZXN0ZWRBZnRlcihyb290LCBub2RlLCAoYWZ0ZXIgYW5kIGFmdGVyLkBkb20gb3IgYWZ0ZXIgb3IgY2FyZXQpKVxuXG5cdFx0Y2FyZXQgPSBub2RlLkBkb20gb3IgKGNhcmV0IGFuZCBjYXJldDpuZXh0U2libGluZyBvciByb290LkBkb206Zmlyc3RDaGlsZClcblxuXHQjIHNob3VsZCB0cnVzdCB0aGF0IHRoZSBsYXN0IGl0ZW0gaW4gbmV3IGxpc3QgaXMgdGhlIGNhcmV0XG5cdHJldHVybiBsYXN0TmV3IGFuZCBsYXN0TmV3LkBkb20gb3IgY2FyZXRcblxuXG4jIGV4cGVjdHMgYSBmbGF0IG5vbi1zcGFyc2UgYXJyYXkgb2Ygbm9kZXMgaW4gYm90aCBuZXcgYW5kIG9sZCwgYWx3YXlzXG5kZWYgcmVjb25jaWxlQ29sbGVjdGlvbiByb290LCBuZXcsIG9sZCwgY2FyZXRcblx0dmFyIGsgPSBuZXc6bGVuZ3RoXG5cdHZhciBpID0ga1xuXHR2YXIgbGFzdCA9IG5ld1trIC0gMV1cblxuXG5cdGlmIGsgPT0gb2xkOmxlbmd0aCBhbmQgbmV3WzBdID09PSBvbGRbMF1cblx0XHQjIHJ1bm5pbmcgdGhyb3VnaCB0byBjb21wYXJlXG5cdFx0d2hpbGUgaS0tXG5cdFx0XHRicmVhayBpZiBuZXdbaV0gIT09IG9sZFtpXVxuXG5cdGlmIGkgPT0gLTFcblx0XHRyZXR1cm4gbGFzdCBhbmQgbGFzdC5AZG9tIG9yIGxhc3Qgb3IgY2FyZXRcblx0ZWxzZVxuXHRcdHJldHVybiByZWNvbmNpbGVDb2xsZWN0aW9uQ2hhbmdlcyhyb290LG5ldyxvbGQsY2FyZXQpXG5cbiMgVFlQRSA1IC0gd2Uga25vdyB0aGF0IHdlIGFyZSBkZWFsaW5nIHdpdGggYSBzaW5nbGUgYXJyYXkgb2ZcbiMga2V5ZWQgdGFncyAtIGFuZCByb290IGhhcyBubyBvdGhlciBjaGlsZHJlblxuZGVmIHJlY29uY2lsZUxvb3Agcm9vdCwgbmV3LCBvbGQsIGNhcmV0XG5cdHZhciBubCA9IG5ldzpsZW5ndGhcblx0dmFyIG9sID0gb2xkOmxlbmd0aFxuXHR2YXIgY2wgPSBuZXc6Y2FjaGU6aSQgIyBjYWNoZS1sZW5ndGhcblx0dmFyIGkgPSAwLCBkID0gbmwgLSBvbFxuXG5cdCMgZmluZCB0aGUgZmlyc3QgaW5kZXggdGhhdCBpcyBkaWZmZXJlbnRcblx0aSsrIHdoaWxlIGkgPCBvbCBhbmQgaSA8IG5sIGFuZCBuZXdbaV0gPT09IG9sZFtpXVxuXHRcblx0IyBjb25kaXRpb25hbGx5IHBydW5lIGNhY2hlXG5cdGlmIGNsID4gMTAwMCBhbmQgKGNsIC0gbmwpID4gNTAwXG5cdFx0bmV3OmNhY2hlOiRwcnVuZShuZXcpXG5cdFxuXHRpZiBkID4gMCBhbmQgaSA9PSBvbFxuXHRcdCMgYWRkZWQgYXQgZW5kXG5cdFx0cm9vdC5hcHBlbmRDaGlsZChuZXdbaSsrXSkgd2hpbGUgaSA8IG5sXG5cdFx0cmV0dXJuXG5cdFxuXHRlbGlmIGQgPiAwXG5cdFx0bGV0IGkxID0gbmxcblx0XHRpMS0tIHdoaWxlIGkxID4gaSBhbmQgbmV3W2kxIC0gMV0gPT09IG9sZFtpMSAtIDEgLSBkXVxuXG5cdFx0aWYgZCA9PSAoaTEgLSBpKVxuXHRcdFx0IyBjb25zb2xlLmxvZyBcImFkZGVkIGluIGNodW5rXCIsaSxpMVxuXHRcdFx0bGV0IGJlZm9yZSA9IG9sZFtpXS5AZG9tXG5cdFx0XHRyb290Lmluc2VydEJlZm9yZShuZXdbaSsrXSxiZWZvcmUpIHdoaWxlIGkgPCBpMVxuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0ZWxpZiBkIDwgMCBhbmQgaSA9PSBubFxuXHRcdCMgcmVtb3ZlZCBhdCBlbmRcblx0XHRyb290LnJlbW92ZUNoaWxkKG9sZFtpKytdKSB3aGlsZSBpIDwgb2xcblx0XHRyZXR1cm5cblx0ZWxpZiBkIDwgMFxuXHRcdGxldCBpMSA9IG9sXG5cdFx0aTEtLSB3aGlsZSBpMSA+IGkgYW5kIG5ld1tpMSAtIDEgKyBkXSA9PT0gb2xkW2kxIC0gMV1cblxuXHRcdGlmIGQgPT0gKGkgLSBpMSlcblx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQob2xkW2krK10pIHdoaWxlIGkgPCBpMVxuXHRcdFx0cmV0dXJuXG5cblx0ZWxpZiBpID09IG5sXG5cdFx0cmV0dXJuXG5cblx0cmV0dXJuIHJlY29uY2lsZUNvbGxlY3Rpb25DaGFuZ2VzKHJvb3QsbmV3LG9sZCxjYXJldClcblxuIyBleHBlY3RzIGEgZmxhdCBub24tc3BhcnNlIGFycmF5IG9mIG5vZGVzIGluIGJvdGggbmV3IGFuZCBvbGQsIGFsd2F5c1xuZGVmIHJlY29uY2lsZUluZGV4ZWRBcnJheSByb290LCBhcnJheSwgb2xkLCBjYXJldFxuXHR2YXIgbmV3TGVuID0gYXJyYXk6dGFnbGVuXG5cdHZhciBwcmV2TGVuID0gYXJyYXk6ZG9tbGVuIG9yIDBcblx0dmFyIGxhc3QgPSBuZXdMZW4gPyBhcnJheVtuZXdMZW4gLSAxXSA6IG51bGxcblx0IyBjb25zb2xlLmxvZyBcInJlY29uY2lsZSBvcHRpbWl6ZWQgYXJyYXkoISlcIixjYXJldCxuZXdMZW4scHJldkxlbixhcnJheVxuXG5cdGlmIHByZXZMZW4gPiBuZXdMZW5cblx0XHR3aGlsZSBwcmV2TGVuID4gbmV3TGVuXG5cdFx0XHR2YXIgaXRlbSA9IGFycmF5Wy0tcHJldkxlbl1cblx0XHRcdHJvb3QucmVtb3ZlQ2hpbGQoaXRlbS5AZG9tKVxuXG5cdGVsaWYgbmV3TGVuID4gcHJldkxlblxuXHRcdCMgZmluZCB0aGUgaXRlbSB0byBpbnNlcnQgYmVmb3JlXG5cdFx0bGV0IHByZXZMYXN0ID0gcHJldkxlbiA/IGFycmF5W3ByZXZMZW4gLSAxXS5AZG9tIDogY2FyZXRcblx0XHRsZXQgYmVmb3JlID0gcHJldkxhc3QgPyBwcmV2TGFzdDpuZXh0U2libGluZyA6IHJvb3QuQGRvbTpmaXJzdENoaWxkXG5cdFx0XG5cdFx0d2hpbGUgcHJldkxlbiA8IG5ld0xlblxuXHRcdFx0bGV0IG5vZGUgPSBhcnJheVtwcmV2TGVuKytdXG5cdFx0XHRiZWZvcmUgPyByb290Lmluc2VydEJlZm9yZShub2RlLkBkb20sYmVmb3JlKSA6IHJvb3QuYXBwZW5kQ2hpbGQobm9kZS5AZG9tKVxuXHRcdFx0XG5cdGFycmF5OmRvbWxlbiA9IG5ld0xlblxuXHRyZXR1cm4gbGFzdCA/IGxhc3QuQGRvbSA6IGNhcmV0XG5cblxuIyB0aGUgZ2VuZXJhbCByZWNvbmNpbGVyIHRoYXQgcmVzcGVjdHMgY29uZGl0aW9ucyBldGNcbiMgY2FyZXQgaXMgdGhlIGN1cnJlbnQgbm9kZSB3ZSB3YW50IHRvIGluc2VydCB0aGluZ3MgYWZ0ZXJcbmRlZiByZWNvbmNpbGVOZXN0ZWQgcm9vdCwgbmV3LCBvbGQsIGNhcmV0XG5cblx0IyB2YXIgc2tpcG5ldyA9IG5ldyA9PSBudWxsIG9yIG5ldyA9PT0gZmFsc2Ugb3IgbmV3ID09PSB0cnVlXG5cdHZhciBuZXdJc051bGwgPSBuZXcgPT0gbnVsbCBvciBuZXcgPT09IGZhbHNlXG5cdHZhciBvbGRJc051bGwgPSBvbGQgPT0gbnVsbCBvciBvbGQgPT09IGZhbHNlXG5cblxuXHRpZiBuZXcgPT09IG9sZFxuXHRcdCMgcmVtZW1iZXIgdGhhdCB0aGUgY2FyZXQgbXVzdCBiZSBhbiBhY3R1YWwgZG9tIGVsZW1lbnRcblx0XHQjIHdlIHNob3VsZCBpbnN0ZWFkIG1vdmUgdGhlIGFjdHVhbCBjYXJldD8gLSB0cnVzdFxuXHRcdGlmIG5ld0lzTnVsbFxuXHRcdFx0cmV0dXJuIGNhcmV0XG5cdFx0ZWxpZiBuZXcuQGRvbVxuXHRcdFx0cmV0dXJuIG5ldy5AZG9tXG5cdFx0ZWxpZiBuZXcgaXNhIEFycmF5IGFuZCBuZXc6dGFnbGVuICE9IG51bGxcblx0XHRcdHJldHVybiByZWNvbmNpbGVJbmRleGVkQXJyYXkocm9vdCxuZXcsb2xkLGNhcmV0KVxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBjYXJldCA/IGNhcmV0Om5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblxuXHRlbGlmIG5ldyBpc2EgQXJyYXlcblx0XHRpZiBvbGQgaXNhIEFycmF5XG5cdFx0XHQjIGxvb2sgZm9yIHNsb3QgaW5zdGVhZD9cblx0XHRcdGxldCB0eXAgPSBuZXc6c3RhdGljXG5cdFx0XHRpZiB0eXAgb3Igb2xkOnN0YXRpY1xuXHRcdFx0XHQjIGlmIHRoZSBzdGF0aWMgaXMgbm90IG5lc3RlZCAtIHdlIGNvdWxkIGdldCBhIGhpbnQgZnJvbSBjb21waWxlclxuXHRcdFx0XHQjIGFuZCBqdXN0IHNraXAgaXRcblx0XHRcdFx0aWYgdHlwID09IG9sZDpzdGF0aWMgIyBzaG91bGQgYWxzbyBpbmNsdWRlIGEgcmVmZXJlbmNlP1xuXHRcdFx0XHRcdGZvciBpdGVtLGkgaW4gbmV3XG5cdFx0XHRcdFx0XHQjIHRoaXMgaXMgd2hlcmUgd2UgY291bGQgZG8gdGhlIHRyaXBsZSBlcXVhbCBkaXJlY3RseVxuXHRcdFx0XHRcdFx0Y2FyZXQgPSByZWNvbmNpbGVOZXN0ZWQocm9vdCxpdGVtLG9sZFtpXSxjYXJldClcblx0XHRcdFx0XHRyZXR1cm4gY2FyZXRcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHJlbW92ZU5lc3RlZChyb290LG9sZCxjYXJldClcblx0XHRcdFx0XHRcblx0XHRcdFx0IyBpZiB0aGV5IGFyZSBub3QgdGhlIHNhbWUgd2UgY29udGludWUgdGhyb3VnaCB0byB0aGUgZGVmYXVsdFxuXHRcdFx0ZWxzZVxuXHRcdFx0XHQjIENvdWxkIHVzZSBvcHRpbWl6ZWQgbG9vcCBpZiB3ZSBrbm93IHRoYXQgaXQgb25seSBjb25zaXN0cyBvZiBub2Rlc1xuXHRcdFx0XHRyZXR1cm4gcmVjb25jaWxlQ29sbGVjdGlvbihyb290LG5ldyxvbGQsY2FyZXQpXG5cdFx0ZWxpZiAhb2xkSXNOdWxsXG5cdFx0XHRpZiBvbGQuQGRvbVxuXHRcdFx0XHRyb290LnJlbW92ZUNoaWxkKG9sZClcblx0XHRcdGVsc2Vcblx0XHRcdFx0IyBvbGQgd2FzIGEgc3RyaW5nLWxpa2Ugb2JqZWN0P1xuXHRcdFx0XHRyb290LnJlbW92ZUNoaWxkKGNhcmV0ID8gY2FyZXQ6bmV4dFNpYmxpbmcgOiByb290LkBkb206Zmlyc3RDaGlsZClcblxuXHRcdHJldHVybiBpbnNlcnROZXN0ZWRBZnRlcihyb290LG5ldyxjYXJldClcblx0XHQjIHJlbW92ZSBvbGRcblxuXHRlbGlmICFuZXdJc051bGwgYW5kIG5ldy5AZG9tXG5cdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KSB1bmxlc3Mgb2xkSXNOdWxsXG5cdFx0cmV0dXJuIGluc2VydE5lc3RlZEFmdGVyKHJvb3QsbmV3LGNhcmV0KVxuXG5cdGVsaWYgbmV3SXNOdWxsXG5cdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KSB1bmxlc3Mgb2xkSXNOdWxsXG5cdFx0cmV0dXJuIGNhcmV0XG5cdGVsc2Vcblx0XHQjIGlmIG9sZCBkaWQgbm90IGV4aXN0IHdlIG5lZWQgdG8gYWRkIGEgbmV3IGRpcmVjdGx5XG5cdFx0bGV0IG5leHROb2RlXG5cdFx0IyBpZiBvbGQgd2FzIGFycmF5IG9yIGltYmF0YWcgd2UgbmVlZCB0byByZW1vdmUgaXQgYW5kIHRoZW4gYWRkXG5cdFx0aWYgb2xkIGlzYSBBcnJheVxuXHRcdFx0cmVtb3ZlTmVzdGVkKHJvb3Qsb2xkLGNhcmV0KVxuXHRcdGVsaWYgb2xkIGFuZCBvbGQuQGRvbVxuXHRcdFx0cm9vdC5yZW1vdmVDaGlsZChvbGQpXG5cdFx0ZWxpZiAhb2xkSXNOdWxsXG5cdFx0XHQjIC4uLlxuXHRcdFx0bmV4dE5vZGUgPSBjYXJldCA/IGNhcmV0Om5leHRTaWJsaW5nIDogcm9vdC5AZG9tOmZpcnN0Q2hpbGRcblx0XHRcdGlmIG5leHROb2RlIGlzYSBUZXh0IGFuZCBuZXh0Tm9kZTp0ZXh0Q29udGVudCAhPSBuZXdcblx0XHRcdFx0bmV4dE5vZGU6dGV4dENvbnRlbnQgPSBuZXdcblx0XHRcdFx0cmV0dXJuIG5leHROb2RlXG5cblx0XHQjIG5vdyBhZGQgdGhlIHRleHRub2RlXG5cdFx0cmV0dXJuIGluc2VydE5lc3RlZEFmdGVyKHJvb3QsbmV3LGNhcmV0KVxuXG5cbmV4dGVuZCB0YWcgZWxlbWVudFxuXHRcblx0IyAxIC0gc3RhdGljIHNoYXBlIC0gdW5rbm93biBjb250ZW50XG5cdCMgMiAtIHN0YXRpYyBzaGFwZSBhbmQgc3RhdGljIGNoaWxkcmVuXG5cdCMgMyAtIHNpbmdsZSBpdGVtXG5cdCMgNCAtIG9wdGltaXplZCBhcnJheSAtIG9ubHkgbGVuZ3RoIHdpbGwgY2hhbmdlXG5cdCMgNSAtIG9wdGltaXplZCBjb2xsZWN0aW9uXG5cdCMgNiAtIHRleHQgb25seVxuXG5cdGRlZiBzZXRDaGlsZHJlbiBuZXcsIHR5cFxuXHRcdCMgaWYgdHlwZW9mIG5ldyA9PSAnc3RyaW5nJ1xuXHRcdCMgXHRyZXR1cm4gc2VsZi50ZXh0ID0gbmV3XG5cdFx0dmFyIG9sZCA9IEB0cmVlX1xuXG5cdFx0aWYgbmV3ID09PSBvbGQgYW5kIG5ldyBhbmQgbmV3OnRhZ2xlbiA9PSB1bmRlZmluZWRcblx0XHRcdHJldHVybiBzZWxmXG5cblx0XHRpZiAhb2xkIGFuZCB0eXAgIT0gM1xuXHRcdFx0cmVtb3ZlQWxsQ2hpbGRyZW5cblx0XHRcdGFwcGVuZE5lc3RlZChzZWxmLG5ldylcblxuXHRcdGVsaWYgdHlwID09IDFcblx0XHRcdGxldCBjYXJldCA9IG51bGxcblx0XHRcdGZvciBpdGVtLGkgaW4gbmV3XG5cdFx0XHRcdGNhcmV0ID0gcmVjb25jaWxlTmVzdGVkKHNlbGYsaXRlbSxvbGRbaV0sY2FyZXQpXG5cdFx0XG5cdFx0ZWxpZiB0eXAgPT0gMlxuXHRcdFx0cmV0dXJuIHNlbGZcblxuXHRcdGVsaWYgdHlwID09IDNcblx0XHRcdGxldCBudHlwID0gdHlwZW9mIG5ld1xuXG5cdFx0XHRpZiBuZXcgYW5kIG5ldy5AZG9tXG5cdFx0XHRcdHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0XHRcdGFwcGVuZENoaWxkKG5ldylcblxuXHRcdFx0IyBjaGVjayBpZiBvbGQgYW5kIG5ldyBpc2EgYXJyYXlcblx0XHRcdGVsaWYgbmV3IGlzYSBBcnJheVxuXHRcdFx0XHRpZiBuZXcuQHR5cGUgPT0gNSBhbmQgb2xkIGFuZCBvbGQuQHR5cGUgPT0gNVxuXHRcdFx0XHRcdHJlY29uY2lsZUxvb3Aoc2VsZixuZXcsb2xkLG51bGwpXG5cdFx0XHRcdGVsaWYgb2xkIGlzYSBBcnJheVxuXHRcdFx0XHRcdHJlY29uY2lsZU5lc3RlZChzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0XHRcdFx0YXBwZW5kTmVzdGVkKHNlbGYsbmV3KVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHR0ZXh0ID0gbmV3XG5cdFx0XHRcdHJldHVybiBzZWxmXG5cdFx0XHRcdFxuXHRcdGVsaWYgdHlwID09IDRcblx0XHRcdHJlY29uY2lsZUluZGV4ZWRBcnJheShzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRcdFxuXHRcdGVsaWYgdHlwID09IDVcblx0XHRcdHJlY29uY2lsZUxvb3Aoc2VsZixuZXcsb2xkLG51bGwpXG5cblx0XHRlbGlmIG5ldyBpc2EgQXJyYXkgYW5kIG9sZCBpc2EgQXJyYXlcblx0XHRcdHJlY29uY2lsZU5lc3RlZChzZWxmLG5ldyxvbGQsbnVsbClcblx0XHRlbHNlXG5cdFx0XHQjIHdoYXQgaWYgdGV4dD9cblx0XHRcdHJlbW92ZUFsbENoaWxkcmVuXG5cdFx0XHRhcHBlbmROZXN0ZWQoc2VsZixuZXcpXG5cblx0XHRAdHJlZV8gPSBuZXdcblx0XHRyZXR1cm4gc2VsZlxuXG5cdGRlZiBjb250ZW50XG5cdFx0QGNvbnRlbnQgb3IgY2hpbGRyZW4udG9BcnJheVxuXHRcblx0ZGVmIHNldFRleHQgdGV4dFxuXHRcdGlmIHRleHQgIT0gQHRyZWVfXG5cdFx0XHR2YXIgdmFsID0gdGV4dCA9PT0gbnVsbCBvciB0ZXh0ID09PSBmYWxzZSA/ICcnIDogdGV4dFxuXHRcdFx0KEB0ZXh0XyBvciBAZG9tKTp0ZXh0Q29udGVudCA9IHZhbFxuXHRcdFx0QHRleHRfIHx8PSBAZG9tOmZpcnN0Q2hpbGRcblx0XHRcdEB0cmVlXyA9IHRleHRcblx0XHRzZWxmXG5cbiMgYWxpYXMgc2V0Q29udGVudCB0byBzZXRDaGlsZHJlblxudmFyIHByb3RvID0gSW1iYS5UYWc6cHJvdG90eXBlXG5wcm90bzpzZXRDb250ZW50ID0gcHJvdG86c2V0Q2hpbGRyZW5cblxuIyBvcHRpbWl6YXRpb24gZm9yIHNldFRleHRcbnZhciBhcHBsZSA9IHR5cGVvZiBuYXZpZ2F0b3IgIT0gJ3VuZGVmaW5lZCcgYW5kIChuYXZpZ2F0b3I6dmVuZG9yIG9yICcnKS5pbmRleE9mKCdBcHBsZScpID09IDBcbmlmIGFwcGxlXG5cdGRlZiBwcm90by5zZXRUZXh0IHRleHRcblx0XHRpZiB0ZXh0ICE9IEB0cmVlX1xuXHRcdFx0QGRvbTp0ZXh0Q29udGVudCA9ICh0ZXh0ID09PSBudWxsIG9yIHRleHQgPT09IGZhbHNlID8gJycgOiB0ZXh0KVxuXHRcdFx0QHRyZWVfID0gdGV4dFxuXHRcdHJldHVybiBzZWxmXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi4vaW1iYS9zcmMvaW1iYS9kb20vcmVjb25jaWxlci5pbWJhIiwiaW1wb3J0IFJvdXRlciBmcm9tICcuL3V0aWwvcm91dGVyJ1xuXG5leHBvcnQgY2xhc3MgRG9jXG5cblx0cHJvcCBwYXRoXG5cdHByb3Agc3JjXG5cdHByb3AgZGF0YVxuXG5cdGRlZiByZWFkeVxuXHRcdEByZWFkeVxuXG5cdGRlZiBpbml0aWFsaXplIHNyYywgYXBwXG5cdFx0QHNyYyA9IHNyY1xuXHRcdEBwYXRoID0gc3JjLnJlcGxhY2UoL1xcLm1kJC8sJycpXG5cdFx0QGFwcCA9IGFwcFxuXHRcdEByZWFkeSA9IG5vXG5cdFx0ZmV0Y2hcblx0XHRzZWxmXG5cblx0ZGVmIGZldGNoXG5cdFx0QHByb21pc2UgfHw9IEBhcHAuZmV0Y2goc3JjKS50aGVuIGRvIHxyZXN8XG5cdFx0XHRsb2FkKHJlcylcblxuXHRkZWYgbG9hZCBkb2Ncblx0XHRAZGF0YSA9IGRvY1xuXHRcdEBtZXRhID0gZG9jOm1ldGEgb3Ige31cblx0XHRAcmVhZHkgPSB5ZXNcblx0XHRJbWJhLmNvbW1pdFxuXHRcdHNlbGZcblxuXHRkZWYgdGl0bGVcblx0XHRAZGF0YTp0aXRsZSBvciAncGF0aCdcblxuXHRkZWYgdG9jXG5cdFx0QGRhdGEgYW5kIEBkYXRhOnRvY1swXVxuXG5cdGRlZiBib2R5XG5cdFx0QGRhdGEgYW5kIEBkYXRhOmJvZHlcblxuXG5leHBvcnQgdmFyIENhY2hlID0ge31cbnZhciByZXF1ZXN0cyA9IHt9XG5cbmV4cG9ydCBjbGFzcyBBcHBcblx0cHJvcCByZXFcblx0cHJvcCBjYWNoZVxuXHRwcm9wIGlzc3Vlc1xuXHRcblx0ZGVmIHNlbGYuZGVzZXJpYWxpemUgZGF0YSA9ICd7fSdcblx0XHRzZWxmLm5ldyBKU09OLnBhcnNlKGRhdGEucmVwbGFjZSgvwqfCp1NDUklQVMKnwqcvZyxcInNjcmlwdFwiKSlcblxuXHRkZWYgaW5pdGlhbGl6ZSBjYWNoZSA9IHt9XG5cdFx0QGNhY2hlID0gY2FjaGVcblx0XHRAZG9jcyA9IHt9XG5cdFx0aWYgJHdlYiRcblx0XHRcdEBsb2MgPSBkb2N1bWVudDpsb2NhdGlvblxuXHRcdFx0XG5cdFx0aWYgQGNhY2hlOmd1aWRlXG5cdFx0XHRAZ3VpZGUgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KEBjYWNoZTpndWlkZSkpXG5cdFx0XHQjIGZvciBpdGVtLGkgaW4gQGd1aWRlXG5cdFx0XHQjIFx0QGd1aWRlW2l0ZW06aWRdID0gaXRlbVxuXHRcdFx0IyBcdGl0ZW06bmV4dCA9IEBndWlkZVtpICsgMV1cblx0XHRcdCMgXHRpdGVtOnByZXYgPSBAZ3VpZGVbaSAtIDFdXG5cdFx0c2VsZlxuXG5cdGRlZiByZXNldFxuXHRcdGNhY2hlID0ge31cblx0XHRzZWxmXG5cblx0ZGVmIHJvdXRlclxuXHRcdEByb3V0ZXIgfHw9IFJvdXRlci5uZXcoc2VsZilcblxuXHRkZWYgcGF0aFxuXHRcdCR3ZWIkID8gQGxvYzpwYXRobmFtZSA6IHJlcTpwYXRoXG5cblx0ZGVmIGhhc2hcblx0XHQkd2ViJCA/IEBsb2M6aGFzaC5zdWJzdHIoMSkgOiAnJ1xuXG5cdGRlZiBkb2Mgc3JjXG5cdFx0QGRvY3Nbc3JjXSB8fD0gRG9jLm5ldyhzcmMsc2VsZilcblx0XHRcblx0ZGVmIGd1aWRlXG5cdFx0QGd1aWRlIHx8PSBAY2FjaGU6Z3VpZGUgIyAubWFwIGRvIHx8XG5cdFx0XG5cdGRlZiBzZXJpYWxpemVcblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoY2FjaGUpLnJlcGxhY2UoL1xcYnNjcmlwdC9nLFwiwqfCp1NDUklQVMKnwqdcIilcblxuXHRpZiAkbm9kZSRcblx0XHRkZWYgZmV0Y2ggc3JjXG5cdFx0XHRsZXQgcmVzID0gY2FjaGVbc3JjXSA9IENhY2hlW3NyY11cblx0XHRcdGxldCBwcm9taXNlID0ge3RoZW46ICh8Y2J8IGNiKENhY2hlW3NyY10pKSB9XG5cdFx0XHRcblx0XHRcdHJldHVybiBwcm9taXNlIGlmIHJlc1xuXHRcdFx0XG5cdFx0XHRjb25zb2xlLmxvZyBcInRyeSB0byBmZXRjaCB7c3JjfVwiXG5cdFx0XHRcblx0XHRcdHZhciBmcyA9IHJlcXVpcmUgJ2ZzJ1xuXHRcdFx0dmFyIHBhdGggPSByZXF1aXJlICdwYXRoJ1xuXHRcdFx0dmFyIG1kID0gcmVxdWlyZSAnLi91dGlsL21hcmtkb3duJ1xuXHRcdFx0dmFyIGhsID0gcmVxdWlyZSAnLi9zY3JpbWJsYS9jb3JlL2hpZ2hsaWdodGVyJ1xuXHRcdFx0dmFyIGZpbGVwYXRoID0gXCJ7X19kaXJuYW1lfS8uLi9kb2NzL3tzcmN9XCIucmVwbGFjZSgvXFwvXFwvL2csJy8nKVxuXG5cdFx0XHRsZXQgYm9keSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlcGF0aCwndXRmLTgnKVxuXG5cdFx0XHRpZiBzcmMubWF0Y2goL1xcLm1kJC8pXG5cdFx0XHRcdHJlcyA9IG1kLnJlbmRlcihib2R5KVxuXG5cdFx0XHRlbGlmIHNyYy5tYXRjaCgvXFwuanNvbiQvKVxuXHRcdFx0XHQjIHNob3VsZCBhbHNvIGluY2x1ZGUgbWQ/XG5cdFx0XHRcdHJlcyA9IEpTT04ucGFyc2UoYm9keSlcblxuXHRcdFx0ZWxpZiBzcmMubWF0Y2goL1xcLmltYmEkLylcblx0XHRcdFx0bGV0IGh0bWwgPSBobC5IaWdobGlnaHRlci5oaWdobGlnaHQoYm9keSx7bW9kZTogJ2Z1bGwnfSlcblx0XHRcdFx0cmVzID0ge2JvZHk6IGJvZHksIGh0bWw6IGh0bWx9XG5cblx0XHRcdGNhY2hlW3NyY10gPSBDYWNoZVtzcmNdID0gcmVzXG5cdFx0XHRyZXR1cm4gcHJvbWlzZVxuXHRcblx0aWYgJHdlYiRcblx0XHRkZWYgZmV0Y2ggc3JjXG5cdFx0XHRpZiBjYWNoZVtzcmNdXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoY2FjaGVbc3JjXSlcblx0XHRcdFxuXHRcdFx0cmVxdWVzdHNbc3JjXSB8fD0gUHJvbWlzZS5uZXcgZG8gfHJlc29sdmV8XG5cdFx0XHRcdHZhciByZXEgPSBhd2FpdCB3aW5kb3cuZmV0Y2goc3JjKVxuXHRcdFx0XHR2YXIgcmVzcCA9IGF3YWl0IHJlcS5qc29uXG5cdFx0XHRcdHJlc29sdmUoY2FjaGVbc3JjXSA9IHJlc3ApXG5cdFx0XHRcblx0ZGVmIGZldGNoRG9jdW1lbnQgc3JjLCAmY2Jcblx0XHR2YXIgcmVzID0gZGVwc1tzcmNdXG5cdFx0Y29uc29sZS5sb2cgXCJubyBsb25nZXI/XCJcblxuXHRcdGlmICRub2RlJFxuXHRcdFx0dmFyIGZzID0gcmVxdWlyZSAnZnMnXG5cdFx0XHR2YXIgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cdFx0XHR2YXIgbWQgPSByZXF1aXJlICcuL3V0aWwvbWFya2Rvd24nXG5cdFx0XHR2YXIgaGwgPSByZXF1aXJlICcuL3NjcmltYmxhL2NvcmUvaGlnaGxpZ2h0ZXInXG5cdFx0XHR2YXIgZmlsZXBhdGggPSBcIntfX2Rpcm5hbWV9Ly4uL2RvY3Mve3NyY31cIi5yZXBsYWNlKC9cXC9cXC8vZywnLycpXG5cblx0XHRcdGlmICFyZXNcblx0XHRcdFx0bGV0IGJvZHkgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZXBhdGgsJ3V0Zi04JylcblxuXHRcdFx0XHRpZiBzcmMubWF0Y2goL1xcLm1kJC8pXG5cdFx0XHRcdFx0cmVzID0gbWQucmVuZGVyKGJvZHkpXG5cblx0XHRcdFx0ZWxpZiBzcmMubWF0Y2goL1xcLmpzb24kLylcblx0XHRcdFx0XHQjIHNob3VsZCBhbHNvIGluY2x1ZGUgbWQ/XG5cdFx0XHRcdFx0cmVzID0gSlNPTi5wYXJzZShib2R5KVxuXG5cdFx0XHRcdGVsaWYgc3JjLm1hdGNoKC9cXC5pbWJhJC8pXG5cdFx0XHRcdFx0bGV0IGh0bWwgPSBobC5IaWdobGlnaHRlci5oaWdobGlnaHQoYm9keSx7bW9kZTogJ2Z1bGwnfSlcblx0XHRcdFx0XHRyZXMgPSB7Ym9keTogYm9keSwgaHRtbDogaHRtbH1cblx0XHRcdFxuXHRcdFx0ZGVwc1tzcmNdIHx8PSByZXNcblx0XHRcdGNiIGFuZCBjYihyZXMpXG5cdFx0ZWxzZVxuXHRcdFx0IyBzaG91bGQgZ3VhcmQgYWdhaW5zdCBtdWx0aXBsZSBsb2Fkc1xuXHRcdFx0aWYgcmVzXG5cdFx0XHRcdGNiIGFuZCBjYihyZXMpXG5cdFx0XHRcdHJldHVybiB7dGhlbjogKGRvIHx2fCB2KHJlcykpfSAjIGZha2UgcHJvbWlzZSBoYWNrXG5cblx0XHRcdHZhciB4aHIgPSBYTUxIdHRwUmVxdWVzdC5uZXdcblx0XHRcdHhoci5hZGRFdmVudExpc3RlbmVyICdsb2FkJyBkbyB8cmVzfFxuXHRcdFx0XHRyZXMgPSBkZXBzW3NyY10gPSBKU09OLnBhcnNlKHhocjpyZXNwb25zZVRleHQpXG5cdFx0XHRcdGNiIGFuZCBjYihyZXMpXG5cdFx0XHR4aHIub3BlbihcIkdFVFwiLCBzcmMpXG5cdFx0XHR4aHIuc2VuZFxuXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRkZWYgaXNzdWVzXG5cdFx0QGlzc3VlcyB8fD0gRG9jLmdldCgnL2lzc3Vlcy9hbGwnLCdqc29uJylcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2FwcC5pbWJhIiwiZXh0ZXJuIGhpc3RvcnksIGdhXG5cbmV4cG9ydCBjbGFzcyBSb3V0ZXJcblxuXHRwcm9wIHBhdGhcblxuXHRkZWYgc2VsZi5zbHVnIHN0clxuXHRcdHN0ciA9IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJykudG9Mb3dlckNhc2UgIyB0cmltXG5cblx0XHR2YXIgZnJvbSA9IFwiw6DDocOkw6LDpcOow6nDq8Oqw6zDrcOvw67DssOzw7bDtMO5w7rDvMO7w7HDp8K3L18sOjtcIlxuXHRcdHZhciB0byAgID0gXCJhYWFhYWVlZWVpaWlpb29vb3V1dXVuYy0tLS0tLVwiXG5cdFx0c3RyID0gc3RyLnJlcGxhY2UoL1teYS16MC05IC1dL2csICcnKSAjIHJlbW92ZSBpbnZhbGlkIGNoYXJzXG5cdFx0c3RyID0gc3RyLnJlcGxhY2UoL1xccysvZywgJy0nKSAjIGNvbGxhcHNlIHdoaXRlc3BhY2UgYW5kIHJlcGxhY2UgYnkgLVxuXHRcdHN0ciA9IHN0ci5yZXBsYWNlKC8tKy9nLCAnLScpICMgY29sbGFwc2UgZGFzaGVzXG5cblx0XHRyZXR1cm4gc3RyXG5cblx0ZGVmIGluaXRpYWxpemUgYXBwXG5cdFx0QGFwcCA9IGFwcFxuXG5cdFx0aWYgJHdlYiRcblx0XHRcdHdpbmRvdzpvbnBvcHN0YXRlID0gZG8gfGV8XG5cdFx0XHRcdHJlZnJlc2hcblxuXHRcdHNlbGZcblxuXHRkZWYgcmVmcmVzaFxuXHRcdGlmICR3ZWIkXG5cdFx0XHRkb2N1bWVudDpib2R5LnNldEF0dHJpYnV0ZSgnZGF0YS1yb3V0ZScsc2VnbWVudCgwKSlcblx0XHRcdEltYmEuY29tbWl0XG5cdFx0c2VsZlxuXG5cdGRlZiBwYXRoXG5cdFx0QGFwcC5wYXRoXG5cblx0ZGVmIGhhc2hcblx0XHRAYXBwLmhhc2hcblxuXHRkZWYgZXh0XG5cdFx0dmFyIHBhdGggPSBwYXRoXG5cdFx0dmFyIG0gPSBwYXRoLm1hdGNoKC9cXC4oW15cXC9dKykkLylcblx0XHRtIGFuZCBtWzFdIG9yICcnXG5cblx0ZGVmIHNlZ21lbnQgbnIgPSAwXG5cdFx0cGF0aC5zcGxpdCgnLycpW25yICsgMV0gb3IgJydcblxuXHRkZWYgZ28gaHJlZiwgc3RhdGUgPSB7fSwgcmVwbGFjZSA9IG5vXG5cdFx0aWYgaHJlZiA9PSAnL2luc3RhbGwnXG5cdFx0XHQjIHJlZGlyZWN0cyBoZXJlXG5cdFx0XHRocmVmID0gJy9ndWlkZXMjdG9jLWluc3RhbGxhdGlvbidcblx0XHRcdFxuXHRcdGlmIHJlcGxhY2Vcblx0XHRcdGhpc3RvcnkucmVwbGFjZVN0YXRlKHN0YXRlLG51bGwsaHJlZilcblx0XHRcdHJlZnJlc2hcblx0XHRlbHNlXG5cdFx0XHRoaXN0b3J5LnB1c2hTdGF0ZShzdGF0ZSxudWxsLGhyZWYpXG5cdFx0XHRyZWZyZXNoXG5cdFx0XHQjIGdhKCdzZW5kJywgJ3BhZ2V2aWV3JywgaHJlZilcblxuXHRcdGlmICFocmVmLm1hdGNoKC9cXCMvKVxuXHRcdFx0d2luZG93LnNjcm9sbFRvKDAsMClcblx0XG5cdFx0c2VsZlxuXG5cdGRlZiBzY29wZWQgcmVnLCBwYXJ0XG5cdFx0dmFyIHBhdGggPSBwYXRoICsgJyMnICsgaGFzaFxuXHRcdGlmIHJlZyBpc2EgU3RyaW5nXG5cdFx0XHR2YXIgbnh0ID0gcGF0aFtyZWc6bGVuZ3RoXVxuXHRcdFx0cGF0aC5zdWJzdHIoMCxyZWc6bGVuZ3RoKSA9PSByZWcgYW5kICghbnh0IG9yIG54dCA9PSAnLScgb3Igbnh0ID09ICcvJyBvciBueHQgPT0gJyMnIG9yIG54dCA9PSAnPycgb3Igbnh0ID09ICdfJylcblx0XHRlbGlmIHJlZyBpc2EgUmVnRXhwXG5cdFx0XHR2YXIgbSA9IHBhdGgubWF0Y2gocmVnKVxuXHRcdFx0cGFydCAmJiBtID8gbVtwYXJ0XSA6IG1cblx0XHRlbHNlXG5cdFx0XHRub1xuXG5cdGRlZiBtYXRjaCByZWcsIHBhcnRcblx0XHR2YXIgcGF0aCA9IHBhdGggKyAnIycgKyBoYXNoXG5cblx0XHRpZiByZWcgaXNhIFN0cmluZ1xuXHRcdFx0cGF0aCA9PSByZWdcblx0XHRlbGlmIHJlZyBpc2EgUmVnRXhwXG5cdFx0XHR2YXIgbSA9IHBhdGgubWF0Y2gocmVnKVxuXHRcdFx0cGFydCAmJiBtID8gbVtwYXJ0XSA6IG1cblx0XHRlbHNlXG5cdFx0XHRub1xuXG5leHRlbmQgdGFnIGVsZW1lbnRcblx0YXR0ciByb3V0ZVxuXG5cdGRlZiByb3V0ZXJcblx0XHRhcHAucm91dGVyXG5cblx0ZGVmIHJlcm91dGVcblx0XHR2YXIgc2NvcGVkID0gcm91dGVyLnNjb3BlZChyb3V0ZSxzZWxmKVxuXHRcdGZsYWcoJ3Njb3BlZCcsc2NvcGVkKVxuXHRcdGZsYWcoJ3NlbGVjdGVkJyxyb3V0ZXIubWF0Y2gocm91dGUsc2VsZikpXG5cdFx0aWYgc2NvcGVkICE9IEBzY29wZWRcblx0XHRcdEBzY29wZWQgPSBzY29wZWRcblx0XHRcdHNjb3BlZCA/IGRpZHNjb3BlIDogZGlkdW5zY29wZVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIGRpZHNjb3BlXG5cdFx0c2VsZlxuXG5cdGRlZiBkaWR1bnNjb3BlXG5cdFx0c2VsZlxuXG4jIGV4dGVuZCBsaW5rc1xuZXh0ZW5kIHRhZyBhXG5cdFxuXHRkZWYgcm91dGVcblx0XHRAcm91dGUgb3IgaHJlZlxuXG5cdGRlZiBvbnRhcCBlXG5cdFx0cmV0dXJuIHVubGVzcyBocmVmXG5cblx0XHR2YXIgaHJlZiA9IGhyZWYucmVwbGFjZSgvXmh0dHBcXDpcXC9cXC9pbWJhXFwuaW8vLCcnKVxuXG5cdFx0aWYgZS5ldmVudDptZXRhS2V5IG9yIGUuZXZlbnQ6YWx0S2V5XG5cdFx0XHRlLkByZXNwb25kZXIgPSBudWxsXG5cdFx0XHRyZXR1cm4gZS5zdG9wXG5cblx0XHRpZiBsZXQgbSA9IGhyZWYubWF0Y2goL2dpc3RcXC5naXRodWJcXC5jb21cXC8oW15cXC9dKylcXC8oW0EtWmEtelxcZF0rKS8pXG5cdFx0XHRjb25zb2xlLmxvZyAnZ2lzdCEhJyxtWzFdLG1bMl1cblx0XHRcdCNnaXN0Lm9wZW4obVsyXSlcblx0XHRcdHJldHVybiBlLnByZXZlbnQuc3RvcFxuXG5cdFx0aWYgaHJlZlswXSA9PSAnIycgb3IgaHJlZlswXSA9PSAnLydcblx0XHRcdGUucHJldmVudC5zdG9wXG5cdFx0XHRyb3V0ZXIuZ28oaHJlZix7fSlcblx0XHRcdEltYmEuRXZlbnRzLnRyaWdnZXIoJ3JvdXRlJyxzZWxmKVxuXHRcdGVsc2Vcblx0XHRcdGUuQHJlc3BvbmRlciA9IG51bGxcblx0XHRcdHJldHVybiBlLnN0b3BcdFx0XG5cdFx0c2VsZlxuXG5cdGRlZiByZW5kZXJcblx0XHRyZXJvdXRlIGlmICR3ZWIkXG5cdFx0c2VsZlxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3V0aWwvcm91dGVyLmltYmEiLCJpbXBvcnQgUGFnZSBmcm9tICcuL1BhZ2UnXG5cbmltcG9ydCBFeGFtcGxlIGZyb20gJy4vU25pcHBldCdcbmltcG9ydCBNYXJrZWQgZnJvbSAnLi9NYXJrZWQnXG5pbXBvcnQgUGF0dGVybiBmcm9tICcuL1BhdHRlcm4nXG5pbXBvcnQgTG9nbyBmcm9tICcuL0xvZ28nXG5pbXBvcnQgU2NyaW1iYUVtYmVkIGZyb20gJy4vU2NyaW1iYUVtYmVkJ1xuXG5cbmV4cG9ydCB0YWcgSG9tZVBhZ2UgPCBQYWdlXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmPiA8LmJvZHk+XG5cdFx0XHQ8ZGl2I2hlcm8uZGFyaz5cblx0XHRcdFx0PFBhdHRlcm5AcGF0dGVybj5cblx0XHRcdFx0PC5jb250ZW50PlxuXHRcdFx0XHRcdDxNYXJrZWRbYXBwLmd1aWRlWydoZXJvJ11dPlxuXHRcdFx0XHRcdDxuYXYuYnV0dG9ucz5cblx0XHRcdFx0XHRcdCMgPGEuYnV0dG9uLnRyeSBocmVmPScjJz4gXCJUcnkgb25saW5lXCJcblx0XHRcdFx0XHRcdDxhLmJ1dHRvbi5zdGFydCBocmVmPScvZ3VpZGUnPiBcIkdldCBzdGFydGVkXCJcblx0XHRcdFx0XHRcdCMgPGEuYnV0dG9uLnN0YXJ0IGhyZWY9Jy9leGFtcGxlcyc+IFwiRXhhbXBsZXNcIlxuXHRcdFx0XHRcdFx0PGEuYnV0dG9uLmdpdGh1YiBocmVmPSdodHRwczovL2dpdGh1Yi5jb20vc29tZWJlZS9pbWJhJz4gXCJHaXRodWJcIlxuXG5cdFx0XHRcdCMgPGhlcm9zbmlwcGV0Lmhlcm8uZGFyayBzcmM9Jy9ob21lL2V4YW1wbGVzL2hlcm8uaW1iYSc+XG5cdFx0XHQ8LmNvbnRlbnQ+XG5cdFx0XHRcdDxNYXJrZWQuc2VjdGlvbi5tZC53ZWxjb21lLmh1Z2UubGlnaHQ+IFwiXCJcIlxuXHRcdFx0XHRcdCMgQ3JlYXRlIGNvbXBsZXggd2ViIGFwcHMgd2l0aCBlYXNlIVxuXG5cdFx0XHRcdFx0SW1iYSBpcyBhIHByb2dyYW1taW5nIGxhbmd1YWdlIGZvciB0aGUgd2ViIHRoYXQgY29tcGlsZXMgdG8gaGlnaGx5IFxuXHRcdFx0XHRcdHBlcmZvcm1hbnQgYW5kIHJlYWRhYmxlIEphdmFTY3JpcHQuIEl0IGhhcyBsYW5ndWFnZSBsZXZlbCBzdXBwb3J0IGZvciBkZWZpbmluZywgXG5cdFx0XHRcdFx0ZXh0ZW5kaW5nLCBzdWJjbGFzc2luZywgaW5zdGFudGlhdGluZyBhbmQgcmVuZGVyaW5nIGRvbSBub2Rlcy4gRm9yIGEgc2ltcGxlIFxuXHRcdFx0XHRcdGFwcGxpY2F0aW9uIGxpa2UgVG9kb01WQywgaXQgaXMgbW9yZSB0aGFuIFxuXHRcdFx0XHRcdFsxMCB0aW1lcyBmYXN0ZXIgdGhhbiBSZWFjdF0oaHR0cDovL3NvbWViZWUuZ2l0aHViLmlvL3RvZG9tdmMtcmVuZGVyLWJlbmNobWFyay9pbmRleC5odG1sKSBcblx0XHRcdFx0XHR3aXRoIGxlc3MgY29kZSwgYW5kIGEgbXVjaCBzbWFsbGVyIGxpYnJhcnkuXG5cdFx0XHRcdFwiXCJcIlxuXHRcdFx0XHQ8U2NyaW1iYUVtYmVkIGNpZD1cImNKVjJhVDlcIj5cblx0XHRcdFx0PHAuY2VudGVyPiBcIlRoZSBpbnRlcmFjdGl2ZSBzY3JlZW5jYXN0aW5nIHBsYXRmb3JtIFNjcmltYmEuY29tIGlzIHdyaXR0ZW4gaW4gSW1iYSwgYm90aCBmcm9udGVuZCBhbmQgYmFja2VuZFwiXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvSG9tZVBhZ2UuaW1iYSIsIiMgZGVmaW5lIHJlbmRlcmVyXG52YXIgbWFya2VkID0gcmVxdWlyZSAnbWFya2VkJ1xudmFyIG1kciA9IG1hcmtlZC5SZW5kZXJlci5uZXdcblxuZGVmIG1kci5oZWFkaW5nIHRleHQsIGx2bFxuXHRcIjxoe2x2bH0+e3RleHR9PC9oe2x2bH0+XCJcblx0XG5pbXBvcnQgU25pcHBldCBmcm9tICcuL1NuaXBwZXQnXG5cdFx0XG5leHBvcnQgdGFnIE1hcmtlZFxuXHRkZWYgcmVuZGVyZXJcblx0XHRzZWxmXG5cblx0ZGVmIHNldFRleHQgdGV4dFxuXHRcdGlmIHRleHQgIT0gQHRleHRcblx0XHRcdEB0ZXh0ID0gdGV4dFxuXHRcdFx0ZG9tOmlubmVySFRNTCA9IG1hcmtlZCh0ZXh0LCByZW5kZXJlcjogbWRyKVxuXHRcdHNlbGZcblxuXHRkZWYgc2V0Q29udGVudCB2YWwsdHlwXG5cdFx0c2V0VGV4dCh2YWwsMClcblx0XHRyZXR1cm4gc2VsZlxuXHRcdFxuXHRkZWYgc2V0RGF0YSBkYXRhXG5cdFx0aWYgZGF0YSBhbmQgZGF0YSAhPSBAZGF0YVxuXHRcdFx0QGRhdGEgPSBkYXRhXG5cdFx0XHRkb206aW5uZXJIVE1MID0gZGF0YTpib2R5XG5cdFx0XHRhd2FrZW5TbmlwcGV0cyBpZiAkd2ViJFxuXHRcdHNlbGZcblx0XHRcdFxuXHRkZWYgYXdha2VuU25pcHBldHNcblx0XHRmb3IgaXRlbSBpbiBkb20ucXVlcnlTZWxlY3RvckFsbCgnLnNuaXBwZXQnKVxuXHRcdFx0bGV0IGNvZGUgPSBpdGVtOnRleHRDb250ZW50XG5cdFx0XHRpZiBjb2RlLmluZGV4T2YoJ0ltYmEubW91bnQnKSA+PSAwXG5cdFx0XHRcdFNuaXBwZXQucmVwbGFjZShpdGVtKVxuXHRcdHNlbGZcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvTWFya2VkLmltYmEiLCIvKipcbiAqIG1hcmtlZCAtIGEgbWFya2Rvd24gcGFyc2VyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxNCwgQ2hyaXN0b3BoZXIgSmVmZnJleS4gKE1JVCBMaWNlbnNlZClcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9jaGpqL21hcmtlZFxuICovXG5cbjsoZnVuY3Rpb24oKSB7XG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQmxvY2stTGV2ZWwgR3JhbW1hclxuICovXG5cbnZhciBibG9jayA9IHtcbiAgbmV3bGluZTogL15cXG4rLyxcbiAgY29kZTogL14oIHs0fVteXFxuXStcXG4qKSsvLFxuICBmZW5jZXM6IG5vb3AsXG4gIGhyOiAvXiggKlstKl9dKXszLH0gKig/Olxcbit8JCkvLFxuICBoZWFkaW5nOiAvXiAqKCN7MSw2fSkgKihbXlxcbl0rPykgKiMqICooPzpcXG4rfCQpLyxcbiAgbnB0YWJsZTogbm9vcCxcbiAgbGhlYWRpbmc6IC9eKFteXFxuXSspXFxuICooPXwtKXsyLH0gKig/Olxcbit8JCkvLFxuICBibG9ja3F1b3RlOiAvXiggKj5bXlxcbl0rKFxcbig/IWRlZilbXlxcbl0rKSpcXG4qKSsvLFxuICBsaXN0OiAvXiggKikoYnVsbCkgW1xcc1xcU10rPyg/OmhyfGRlZnxcXG57Mix9KD8hICkoPyFcXDFidWxsIClcXG4qfFxccyokKS8sXG4gIGh0bWw6IC9eICooPzpjb21tZW50ICooPzpcXG58XFxzKiQpfGNsb3NlZCAqKD86XFxuezIsfXxcXHMqJCl8Y2xvc2luZyAqKD86XFxuezIsfXxcXHMqJCkpLyxcbiAgZGVmOiAvXiAqXFxbKFteXFxdXSspXFxdOiAqPD8oW15cXHM+XSspPj8oPzogK1tcIihdKFteXFxuXSspW1wiKV0pPyAqKD86XFxuK3wkKS8sXG4gIHRhYmxlOiBub29wLFxuICBwYXJhZ3JhcGg6IC9eKCg/OlteXFxuXStcXG4/KD8haHJ8aGVhZGluZ3xsaGVhZGluZ3xibG9ja3F1b3RlfHRhZ3xkZWYpKSspXFxuKi8sXG4gIHRleHQ6IC9eW15cXG5dKy9cbn07XG5cbmJsb2NrLmJ1bGxldCA9IC8oPzpbKistXXxcXGQrXFwuKS87XG5ibG9jay5pdGVtID0gL14oICopKGJ1bGwpIFteXFxuXSooPzpcXG4oPyFcXDFidWxsIClbXlxcbl0qKSovO1xuYmxvY2suaXRlbSA9IHJlcGxhY2UoYmxvY2suaXRlbSwgJ2dtJylcbiAgKC9idWxsL2csIGJsb2NrLmJ1bGxldClcbiAgKCk7XG5cbmJsb2NrLmxpc3QgPSByZXBsYWNlKGJsb2NrLmxpc3QpXG4gICgvYnVsbC9nLCBibG9jay5idWxsZXQpXG4gICgnaHInLCAnXFxcXG4rKD89XFxcXDE/KD86Wy0qX10gKil7Myx9KD86XFxcXG4rfCQpKScpXG4gICgnZGVmJywgJ1xcXFxuKyg/PScgKyBibG9jay5kZWYuc291cmNlICsgJyknKVxuICAoKTtcblxuYmxvY2suYmxvY2txdW90ZSA9IHJlcGxhY2UoYmxvY2suYmxvY2txdW90ZSlcbiAgKCdkZWYnLCBibG9jay5kZWYpXG4gICgpO1xuXG5ibG9jay5fdGFnID0gJyg/ISg/OidcbiAgKyAnYXxlbXxzdHJvbmd8c21hbGx8c3xjaXRlfHF8ZGZufGFiYnJ8ZGF0YXx0aW1lfGNvZGUnXG4gICsgJ3x2YXJ8c2FtcHxrYmR8c3VifHN1cHxpfGJ8dXxtYXJrfHJ1Ynl8cnR8cnB8YmRpfGJkbydcbiAgKyAnfHNwYW58YnJ8d2JyfGluc3xkZWx8aW1nKVxcXFxiKVxcXFx3Kyg/ITovfFteXFxcXHdcXFxcc0BdKkApXFxcXGInO1xuXG5ibG9jay5odG1sID0gcmVwbGFjZShibG9jay5odG1sKVxuICAoJ2NvbW1lbnQnLCAvPCEtLVtcXHNcXFNdKj8tLT4vKVxuICAoJ2Nsb3NlZCcsIC88KHRhZylbXFxzXFxTXSs/PFxcL1xcMT4vKVxuICAoJ2Nsb3NpbmcnLCAvPHRhZyg/OlwiW15cIl0qXCJ8J1teJ10qJ3xbXidcIj5dKSo/Pi8pXG4gICgvdGFnL2csIGJsb2NrLl90YWcpXG4gICgpO1xuXG5ibG9jay5wYXJhZ3JhcGggPSByZXBsYWNlKGJsb2NrLnBhcmFncmFwaClcbiAgKCdocicsIGJsb2NrLmhyKVxuICAoJ2hlYWRpbmcnLCBibG9jay5oZWFkaW5nKVxuICAoJ2xoZWFkaW5nJywgYmxvY2subGhlYWRpbmcpXG4gICgnYmxvY2txdW90ZScsIGJsb2NrLmJsb2NrcXVvdGUpXG4gICgndGFnJywgJzwnICsgYmxvY2suX3RhZylcbiAgKCdkZWYnLCBibG9jay5kZWYpXG4gICgpO1xuXG4vKipcbiAqIE5vcm1hbCBCbG9jayBHcmFtbWFyXG4gKi9cblxuYmxvY2subm9ybWFsID0gbWVyZ2Uoe30sIGJsb2NrKTtcblxuLyoqXG4gKiBHRk0gQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLmdmbSA9IG1lcmdlKHt9LCBibG9jay5ub3JtYWwsIHtcbiAgZmVuY2VzOiAvXiAqKGB7Myx9fH57Myx9KVsgXFwuXSooXFxTKyk/ICpcXG4oW1xcc1xcU10qPylcXHMqXFwxICooPzpcXG4rfCQpLyxcbiAgcGFyYWdyYXBoOiAvXi8sXG4gIGhlYWRpbmc6IC9eICooI3sxLDZ9KSArKFteXFxuXSs/KSAqIyogKig/Olxcbit8JCkvXG59KTtcblxuYmxvY2suZ2ZtLnBhcmFncmFwaCA9IHJlcGxhY2UoYmxvY2sucGFyYWdyYXBoKVxuICAoJyg/IScsICcoPyEnXG4gICAgKyBibG9jay5nZm0uZmVuY2VzLnNvdXJjZS5yZXBsYWNlKCdcXFxcMScsICdcXFxcMicpICsgJ3wnXG4gICAgKyBibG9jay5saXN0LnNvdXJjZS5yZXBsYWNlKCdcXFxcMScsICdcXFxcMycpICsgJ3wnKVxuICAoKTtcblxuLyoqXG4gKiBHRk0gKyBUYWJsZXMgQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLnRhYmxlcyA9IG1lcmdlKHt9LCBibG9jay5nZm0sIHtcbiAgbnB0YWJsZTogL14gKihcXFMuKlxcfC4qKVxcbiAqKFstOl0rICpcXHxbLXwgOl0qKVxcbigoPzouKlxcfC4qKD86XFxufCQpKSopXFxuKi8sXG4gIHRhYmxlOiAvXiAqXFx8KC4rKVxcbiAqXFx8KCAqWy06XStbLXwgOl0qKVxcbigoPzogKlxcfC4qKD86XFxufCQpKSopXFxuKi9cbn0pO1xuXG4vKipcbiAqIEJsb2NrIExleGVyXG4gKi9cblxuZnVuY3Rpb24gTGV4ZXIob3B0aW9ucykge1xuICB0aGlzLnRva2VucyA9IFtdO1xuICB0aGlzLnRva2Vucy5saW5rcyA9IHt9O1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IG1hcmtlZC5kZWZhdWx0cztcbiAgdGhpcy5ydWxlcyA9IGJsb2NrLm5vcm1hbDtcblxuICBpZiAodGhpcy5vcHRpb25zLmdmbSkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMudGFibGVzKSB7XG4gICAgICB0aGlzLnJ1bGVzID0gYmxvY2sudGFibGVzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJ1bGVzID0gYmxvY2suZ2ZtO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEV4cG9zZSBCbG9jayBSdWxlc1xuICovXG5cbkxleGVyLnJ1bGVzID0gYmxvY2s7XG5cbi8qKlxuICogU3RhdGljIExleCBNZXRob2RcbiAqL1xuXG5MZXhlci5sZXggPSBmdW5jdGlvbihzcmMsIG9wdGlvbnMpIHtcbiAgdmFyIGxleGVyID0gbmV3IExleGVyKG9wdGlvbnMpO1xuICByZXR1cm4gbGV4ZXIubGV4KHNyYyk7XG59O1xuXG4vKipcbiAqIFByZXByb2Nlc3NpbmdcbiAqL1xuXG5MZXhlci5wcm90b3R5cGUubGV4ID0gZnVuY3Rpb24oc3JjKSB7XG4gIHNyYyA9IHNyY1xuICAgIC5yZXBsYWNlKC9cXHJcXG58XFxyL2csICdcXG4nKVxuICAgIC5yZXBsYWNlKC9cXHQvZywgJyAgICAnKVxuICAgIC5yZXBsYWNlKC9cXHUwMGEwL2csICcgJylcbiAgICAucmVwbGFjZSgvXFx1MjQyNC9nLCAnXFxuJyk7XG5cbiAgcmV0dXJuIHRoaXMudG9rZW4oc3JjLCB0cnVlKTtcbn07XG5cbi8qKlxuICogTGV4aW5nXG4gKi9cblxuTGV4ZXIucHJvdG90eXBlLnRva2VuID0gZnVuY3Rpb24oc3JjLCB0b3AsIGJxKSB7XG4gIHZhciBzcmMgPSBzcmMucmVwbGFjZSgvXiArJC9nbSwgJycpXG4gICAgLCBuZXh0XG4gICAgLCBsb29zZVxuICAgICwgY2FwXG4gICAgLCBidWxsXG4gICAgLCBiXG4gICAgLCBpdGVtXG4gICAgLCBzcGFjZVxuICAgICwgaVxuICAgICwgbDtcblxuICB3aGlsZSAoc3JjKSB7XG4gICAgLy8gbmV3bGluZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLm5ld2xpbmUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgaWYgKGNhcFswXS5sZW5ndGggPiAxKSB7XG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdzcGFjZSdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gY29kZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmNvZGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgY2FwID0gY2FwWzBdLnJlcGxhY2UoL14gezR9L2dtLCAnJyk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2NvZGUnLFxuICAgICAgICB0ZXh0OiAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgICAgPyBjYXAucmVwbGFjZSgvXFxuKyQvLCAnJylcbiAgICAgICAgICA6IGNhcFxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBmZW5jZXMgKGdmbSlcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5mZW5jZXMuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdjb2RlJyxcbiAgICAgICAgbGFuZzogY2FwWzJdLFxuICAgICAgICB0ZXh0OiBjYXBbM10gfHwgJydcbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gaGVhZGluZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmhlYWRpbmcuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgZGVwdGg6IGNhcFsxXS5sZW5ndGgsXG4gICAgICAgIHRleHQ6IGNhcFsyXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0YWJsZSBubyBsZWFkaW5nIHBpcGUgKGdmbSlcbiAgICBpZiAodG9wICYmIChjYXAgPSB0aGlzLnJ1bGVzLm5wdGFibGUuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcblxuICAgICAgaXRlbSA9IHtcbiAgICAgICAgdHlwZTogJ3RhYmxlJyxcbiAgICAgICAgaGVhZGVyOiBjYXBbMV0ucmVwbGFjZSgvXiAqfCAqXFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBhbGlnbjogY2FwWzJdLnJlcGxhY2UoL14gKnxcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGNlbGxzOiBjYXBbM10ucmVwbGFjZSgvXFxuJC8sICcnKS5zcGxpdCgnXFxuJylcbiAgICAgIH07XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmFsaWduLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICgvXiAqLSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdyaWdodCc7XG4gICAgICAgIH0gZWxzZSBpZiAoL14gKjotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2NlbnRlcic7XG4gICAgICAgIH0gZWxzZSBpZiAoL14gKjotKyAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnbGVmdCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlbS5jZWxsc1tpXSA9IGl0ZW0uY2VsbHNbaV0uc3BsaXQoLyAqXFx8ICovKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b2tlbnMucHVzaChpdGVtKTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGhlYWRpbmdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5saGVhZGluZy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2hlYWRpbmcnLFxuICAgICAgICBkZXB0aDogY2FwWzJdID09PSAnPScgPyAxIDogMixcbiAgICAgICAgdGV4dDogY2FwWzFdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGhyXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuaHIuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdocidcbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gYmxvY2txdW90ZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrcXVvdGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2Jsb2NrcXVvdGVfc3RhcnQnXG4gICAgICB9KTtcblxuICAgICAgY2FwID0gY2FwWzBdLnJlcGxhY2UoL14gKj4gPy9nbSwgJycpO1xuXG4gICAgICAvLyBQYXNzIGB0b3BgIHRvIGtlZXAgdGhlIGN1cnJlbnRcbiAgICAgIC8vIFwidG9wbGV2ZWxcIiBzdGF0ZS4gVGhpcyBpcyBleGFjdGx5XG4gICAgICAvLyBob3cgbWFya2Rvd24ucGwgd29ya3MuXG4gICAgICB0aGlzLnRva2VuKGNhcCwgdG9wLCB0cnVlKTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdibG9ja3F1b3RlX2VuZCdcbiAgICAgIH0pO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsaXN0XG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubGlzdC5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBidWxsID0gY2FwWzJdO1xuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2xpc3Rfc3RhcnQnLFxuICAgICAgICBvcmRlcmVkOiBidWxsLmxlbmd0aCA+IDFcbiAgICAgIH0pO1xuXG4gICAgICAvLyBHZXQgZWFjaCB0b3AtbGV2ZWwgaXRlbS5cbiAgICAgIGNhcCA9IGNhcFswXS5tYXRjaCh0aGlzLnJ1bGVzLml0ZW0pO1xuXG4gICAgICBuZXh0ID0gZmFsc2U7XG4gICAgICBsID0gY2FwLmxlbmd0aDtcbiAgICAgIGkgPSAwO1xuXG4gICAgICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpdGVtID0gY2FwW2ldO1xuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgbGlzdCBpdGVtJ3MgYnVsbGV0XG4gICAgICAgIC8vIHNvIGl0IGlzIHNlZW4gYXMgdGhlIG5leHQgdG9rZW4uXG4gICAgICAgIHNwYWNlID0gaXRlbS5sZW5ndGg7XG4gICAgICAgIGl0ZW0gPSBpdGVtLnJlcGxhY2UoL14gKihbKistXXxcXGQrXFwuKSArLywgJycpO1xuXG4gICAgICAgIC8vIE91dGRlbnQgd2hhdGV2ZXIgdGhlXG4gICAgICAgIC8vIGxpc3QgaXRlbSBjb250YWlucy4gSGFja3kuXG4gICAgICAgIGlmICh+aXRlbS5pbmRleE9mKCdcXG4gJykpIHtcbiAgICAgICAgICBzcGFjZSAtPSBpdGVtLmxlbmd0aDtcbiAgICAgICAgICBpdGVtID0gIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICAgICAgPyBpdGVtLnJlcGxhY2UobmV3IFJlZ0V4cCgnXiB7MSwnICsgc3BhY2UgKyAnfScsICdnbScpLCAnJylcbiAgICAgICAgICAgIDogaXRlbS5yZXBsYWNlKC9eIHsxLDR9L2dtLCAnJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZXRlcm1pbmUgd2hldGhlciB0aGUgbmV4dCBsaXN0IGl0ZW0gYmVsb25ncyBoZXJlLlxuICAgICAgICAvLyBCYWNrcGVkYWwgaWYgaXQgZG9lcyBub3QgYmVsb25nIGluIHRoaXMgbGlzdC5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zbWFydExpc3RzICYmIGkgIT09IGwgLSAxKSB7XG4gICAgICAgICAgYiA9IGJsb2NrLmJ1bGxldC5leGVjKGNhcFtpICsgMV0pWzBdO1xuICAgICAgICAgIGlmIChidWxsICE9PSBiICYmICEoYnVsbC5sZW5ndGggPiAxICYmIGIubGVuZ3RoID4gMSkpIHtcbiAgICAgICAgICAgIHNyYyA9IGNhcC5zbGljZShpICsgMSkuam9pbignXFxuJykgKyBzcmM7XG4gICAgICAgICAgICBpID0gbCAtIDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgaXRlbSBpcyBsb29zZSBvciBub3QuXG4gICAgICAgIC8vIFVzZTogLyhefFxcbikoPyEgKVteXFxuXStcXG5cXG4oPyFcXHMqJCkvXG4gICAgICAgIC8vIGZvciBkaXNjb3VudCBiZWhhdmlvci5cbiAgICAgICAgbG9vc2UgPSBuZXh0IHx8IC9cXG5cXG4oPyFcXHMqJCkvLnRlc3QoaXRlbSk7XG4gICAgICAgIGlmIChpICE9PSBsIC0gMSkge1xuICAgICAgICAgIG5leHQgPSBpdGVtLmNoYXJBdChpdGVtLmxlbmd0aCAtIDEpID09PSAnXFxuJztcbiAgICAgICAgICBpZiAoIWxvb3NlKSBsb29zZSA9IG5leHQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBsb29zZVxuICAgICAgICAgICAgPyAnbG9vc2VfaXRlbV9zdGFydCdcbiAgICAgICAgICAgIDogJ2xpc3RfaXRlbV9zdGFydCdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUmVjdXJzZS5cbiAgICAgICAgdGhpcy50b2tlbihpdGVtLCBmYWxzZSwgYnEpO1xuXG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdsaXN0X2l0ZW1fZW5kJ1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdsaXN0X2VuZCdcbiAgICAgIH0pO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBodG1sXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuaHRtbC5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogdGhpcy5vcHRpb25zLnNhbml0aXplXG4gICAgICAgICAgPyAncGFyYWdyYXBoJ1xuICAgICAgICAgIDogJ2h0bWwnLFxuICAgICAgICBwcmU6ICF0aGlzLm9wdGlvbnMuc2FuaXRpemVyXG4gICAgICAgICAgJiYgKGNhcFsxXSA9PT0gJ3ByZScgfHwgY2FwWzFdID09PSAnc2NyaXB0JyB8fCBjYXBbMV0gPT09ICdzdHlsZScpLFxuICAgICAgICB0ZXh0OiBjYXBbMF1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZGVmXG4gICAgaWYgKCghYnEgJiYgdG9wKSAmJiAoY2FwID0gdGhpcy5ydWxlcy5kZWYuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLmxpbmtzW2NhcFsxXS50b0xvd2VyQ2FzZSgpXSA9IHtcbiAgICAgICAgaHJlZjogY2FwWzJdLFxuICAgICAgICB0aXRsZTogY2FwWzNdXG4gICAgICB9O1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGFibGUgKGdmbSlcbiAgICBpZiAodG9wICYmIChjYXAgPSB0aGlzLnJ1bGVzLnRhYmxlLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG5cbiAgICAgIGl0ZW0gPSB7XG4gICAgICAgIHR5cGU6ICd0YWJsZScsXG4gICAgICAgIGhlYWRlcjogY2FwWzFdLnJlcGxhY2UoL14gKnwgKlxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgYWxpZ246IGNhcFsyXS5yZXBsYWNlKC9eICp8XFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBjZWxsczogY2FwWzNdLnJlcGxhY2UoLyg/OiAqXFx8ICopP1xcbiQvLCAnJykuc3BsaXQoJ1xcbicpXG4gICAgICB9O1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5hbGlnbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAncmlnaHQnO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdjZW50ZXInO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSsgKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2xlZnQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZW0uY2VsbHNbaV0gPSBpdGVtLmNlbGxzW2ldXG4gICAgICAgICAgLnJlcGxhY2UoL14gKlxcfCAqfCAqXFx8ICokL2csICcnKVxuICAgICAgICAgIC5zcGxpdCgvICpcXHwgKi8pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKGl0ZW0pO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0b3AtbGV2ZWwgcGFyYWdyYXBoXG4gICAgaWYgKHRvcCAmJiAoY2FwID0gdGhpcy5ydWxlcy5wYXJhZ3JhcGguZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAncGFyYWdyYXBoJyxcbiAgICAgICAgdGV4dDogY2FwWzFdLmNoYXJBdChjYXBbMV0ubGVuZ3RoIC0gMSkgPT09ICdcXG4nXG4gICAgICAgICAgPyBjYXBbMV0uc2xpY2UoMCwgLTEpXG4gICAgICAgICAgOiBjYXBbMV1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGV4dFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnRleHQuZXhlYyhzcmMpKSB7XG4gICAgICAvLyBUb3AtbGV2ZWwgc2hvdWxkIG5ldmVyIHJlYWNoIGhlcmUuXG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgdGV4dDogY2FwWzBdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChzcmMpIHtcbiAgICAgIHRocm93IG5ld1xuICAgICAgICBFcnJvcignSW5maW5pdGUgbG9vcCBvbiBieXRlOiAnICsgc3JjLmNoYXJDb2RlQXQoMCkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzLnRva2Vucztcbn07XG5cbi8qKlxuICogSW5saW5lLUxldmVsIEdyYW1tYXJcbiAqL1xuXG52YXIgaW5saW5lID0ge1xuICBlc2NhcGU6IC9eXFxcXChbXFxcXGAqe31cXFtcXF0oKSMrXFwtLiFfPl0pLyxcbiAgYXV0b2xpbms6IC9ePChbXiA8Pl0rKEB8OlxcLylbXiA8Pl0rKT4vLFxuICB1cmw6IG5vb3AsXG4gIHRhZzogL148IS0tW1xcc1xcU10qPy0tPnxePFxcLz9cXHcrKD86XCJbXlwiXSpcInwnW14nXSonfFtePCdcIj5dKSo/Pi8sXG4gIGxpbms6IC9eIT9cXFsoaW5zaWRlKVxcXVxcKGhyZWZcXCkvLFxuICByZWZsaW5rOiAvXiE/XFxbKGluc2lkZSlcXF1cXHMqXFxbKFteXFxdXSopXFxdLyxcbiAgbm9saW5rOiAvXiE/XFxbKCg/OlxcW1teXFxdXSpcXF18W15cXFtcXF1dKSopXFxdLyxcbiAgc3Ryb25nOiAvXl9fKFtcXHNcXFNdKz8pX18oPyFfKXxeXFwqXFwqKFtcXHNcXFNdKz8pXFwqXFwqKD8hXFwqKS8sXG4gIGVtOiAvXlxcYl8oKD86W15fXXxfXykrPylfXFxifF5cXCooKD86XFwqXFwqfFtcXHNcXFNdKSs/KVxcKig/IVxcKikvLFxuICBjb2RlOiAvXihgKykoW1xcc1xcU10qP1teYF0pXFwxKD8hYCkvLFxuICBicjogL14gezIsfVxcbig/IVxccyokKS8sXG4gIGRlbDogbm9vcCxcbiAgdGV4dDogL15bXFxzXFxTXSs/KD89W1xcXFw8IVxcW18qYF18IHsyLH1cXG58JCkvXG59O1xuXG5pbmxpbmUuX2luc2lkZSA9IC8oPzpcXFtbXlxcXV0qXFxdfFxcXFxbXFxbXFxdXXxbXlxcW1xcXV18XFxdKD89W15cXFtdKlxcXSkpKi87XG5pbmxpbmUuX2hyZWYgPSAvXFxzKjw/KFtcXHNcXFNdKj8pPj8oPzpcXHMrWydcIl0oW1xcc1xcU10qPylbJ1wiXSk/XFxzKi87XG5cbmlubGluZS5saW5rID0gcmVwbGFjZShpbmxpbmUubGluaylcbiAgKCdpbnNpZGUnLCBpbmxpbmUuX2luc2lkZSlcbiAgKCdocmVmJywgaW5saW5lLl9ocmVmKVxuICAoKTtcblxuaW5saW5lLnJlZmxpbmsgPSByZXBsYWNlKGlubGluZS5yZWZsaW5rKVxuICAoJ2luc2lkZScsIGlubGluZS5faW5zaWRlKVxuICAoKTtcblxuLyoqXG4gKiBOb3JtYWwgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUubm9ybWFsID0gbWVyZ2Uoe30sIGlubGluZSk7XG5cbi8qKlxuICogUGVkYW50aWMgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUucGVkYW50aWMgPSBtZXJnZSh7fSwgaW5saW5lLm5vcm1hbCwge1xuICBzdHJvbmc6IC9eX18oPz1cXFMpKFtcXHNcXFNdKj9cXFMpX18oPyFfKXxeXFwqXFwqKD89XFxTKShbXFxzXFxTXSo/XFxTKVxcKlxcKig/IVxcKikvLFxuICBlbTogL15fKD89XFxTKShbXFxzXFxTXSo/XFxTKV8oPyFfKXxeXFwqKD89XFxTKShbXFxzXFxTXSo/XFxTKVxcKig/IVxcKikvXG59KTtcblxuLyoqXG4gKiBHRk0gSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUuZ2ZtID0gbWVyZ2Uoe30sIGlubGluZS5ub3JtYWwsIHtcbiAgZXNjYXBlOiByZXBsYWNlKGlubGluZS5lc2NhcGUpKCddKScsICd+fF0pJykoKSxcbiAgdXJsOiAvXihodHRwcz86XFwvXFwvW15cXHM8XStbXjwuLDo7XCInKVxcXVxcc10pLyxcbiAgZGVsOiAvXn5+KD89XFxTKShbXFxzXFxTXSo/XFxTKX5+LyxcbiAgdGV4dDogcmVwbGFjZShpbmxpbmUudGV4dClcbiAgICAoJ118JywgJ35dfCcpXG4gICAgKCd8JywgJ3xodHRwcz86Ly98JylcbiAgICAoKVxufSk7XG5cbi8qKlxuICogR0ZNICsgTGluZSBCcmVha3MgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUuYnJlYWtzID0gbWVyZ2Uoe30sIGlubGluZS5nZm0sIHtcbiAgYnI6IHJlcGxhY2UoaW5saW5lLmJyKSgnezIsfScsICcqJykoKSxcbiAgdGV4dDogcmVwbGFjZShpbmxpbmUuZ2ZtLnRleHQpKCd7Mix9JywgJyonKSgpXG59KTtcblxuLyoqXG4gKiBJbmxpbmUgTGV4ZXIgJiBDb21waWxlclxuICovXG5cbmZ1bmN0aW9uIElubGluZUxleGVyKGxpbmtzLCBvcHRpb25zKSB7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgbWFya2VkLmRlZmF1bHRzO1xuICB0aGlzLmxpbmtzID0gbGlua3M7XG4gIHRoaXMucnVsZXMgPSBpbmxpbmUubm9ybWFsO1xuICB0aGlzLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyIHx8IG5ldyBSZW5kZXJlcjtcbiAgdGhpcy5yZW5kZXJlci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gIGlmICghdGhpcy5saW5rcykge1xuICAgIHRocm93IG5ld1xuICAgICAgRXJyb3IoJ1Rva2VucyBhcnJheSByZXF1aXJlcyBhIGBsaW5rc2AgcHJvcGVydHkuJyk7XG4gIH1cblxuICBpZiAodGhpcy5vcHRpb25zLmdmbSkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuYnJlYWtzKSB7XG4gICAgICB0aGlzLnJ1bGVzID0gaW5saW5lLmJyZWFrcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ydWxlcyA9IGlubGluZS5nZm07XG4gICAgfVxuICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgIHRoaXMucnVsZXMgPSBpbmxpbmUucGVkYW50aWM7XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvc2UgSW5saW5lIFJ1bGVzXG4gKi9cblxuSW5saW5lTGV4ZXIucnVsZXMgPSBpbmxpbmU7XG5cbi8qKlxuICogU3RhdGljIExleGluZy9Db21waWxpbmcgTWV0aG9kXG4gKi9cblxuSW5saW5lTGV4ZXIub3V0cHV0ID0gZnVuY3Rpb24oc3JjLCBsaW5rcywgb3B0aW9ucykge1xuICB2YXIgaW5saW5lID0gbmV3IElubGluZUxleGVyKGxpbmtzLCBvcHRpb25zKTtcbiAgcmV0dXJuIGlubGluZS5vdXRwdXQoc3JjKTtcbn07XG5cbi8qKlxuICogTGV4aW5nL0NvbXBpbGluZ1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5vdXRwdXQgPSBmdW5jdGlvbihzcmMpIHtcbiAgdmFyIG91dCA9ICcnXG4gICAgLCBsaW5rXG4gICAgLCB0ZXh0XG4gICAgLCBocmVmXG4gICAgLCBjYXA7XG5cbiAgd2hpbGUgKHNyYykge1xuICAgIC8vIGVzY2FwZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmVzY2FwZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gY2FwWzFdO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gYXV0b2xpbmtcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5hdXRvbGluay5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBpZiAoY2FwWzJdID09PSAnQCcpIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZShcbiAgICAgICAgICBjYXBbMV0uY2hhckF0KDYpID09PSAnOidcbiAgICAgICAgICA/IHRoaXMubWFuZ2xlKGNhcFsxXS5zdWJzdHJpbmcoNykpXG4gICAgICAgICAgOiB0aGlzLm1hbmdsZShjYXBbMV0pXG4gICAgICAgICk7XG4gICAgICAgIGhyZWYgPSB0aGlzLm1hbmdsZSgnbWFpbHRvOicpICsgdGV4dDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRleHQgPSBlc2NhcGUoY2FwWzFdKTtcbiAgICAgICAgaHJlZiA9IHRleHQ7XG4gICAgICB9XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5saW5rKGhyZWYsIG51bGwsIHRleHQpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdXJsIChnZm0pXG4gICAgaWYgKCF0aGlzLmluTGluayAmJiAoY2FwID0gdGhpcy5ydWxlcy51cmwuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRleHQgPSBlc2NhcGUoY2FwWzFdKTtcbiAgICAgIGhyZWYgPSB0ZXh0O1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIubGluayhocmVmLCBudWxsLCB0ZXh0KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRhZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnRhZy5leGVjKHNyYykpIHtcbiAgICAgIGlmICghdGhpcy5pbkxpbmsgJiYgL148YSAvaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmluTGluayAmJiAvXjxcXC9hPi9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICB0aGlzLmluTGluayA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLm9wdGlvbnMuc2FuaXRpemVcbiAgICAgICAgPyB0aGlzLm9wdGlvbnMuc2FuaXRpemVyXG4gICAgICAgICAgPyB0aGlzLm9wdGlvbnMuc2FuaXRpemVyKGNhcFswXSlcbiAgICAgICAgICA6IGVzY2FwZShjYXBbMF0pXG4gICAgICAgIDogY2FwWzBdXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsaW5rXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubGluay5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLmluTGluayA9IHRydWU7XG4gICAgICBvdXQgKz0gdGhpcy5vdXRwdXRMaW5rKGNhcCwge1xuICAgICAgICBocmVmOiBjYXBbMl0sXG4gICAgICAgIHRpdGxlOiBjYXBbM11cbiAgICAgIH0pO1xuICAgICAgdGhpcy5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHJlZmxpbmssIG5vbGlua1xuICAgIGlmICgoY2FwID0gdGhpcy5ydWxlcy5yZWZsaW5rLmV4ZWMoc3JjKSlcbiAgICAgICAgfHwgKGNhcCA9IHRoaXMucnVsZXMubm9saW5rLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBsaW5rID0gKGNhcFsyXSB8fCBjYXBbMV0pLnJlcGxhY2UoL1xccysvZywgJyAnKTtcbiAgICAgIGxpbmsgPSB0aGlzLmxpbmtzW2xpbmsudG9Mb3dlckNhc2UoKV07XG4gICAgICBpZiAoIWxpbmsgfHwgIWxpbmsuaHJlZikge1xuICAgICAgICBvdXQgKz0gY2FwWzBdLmNoYXJBdCgwKTtcbiAgICAgICAgc3JjID0gY2FwWzBdLnN1YnN0cmluZygxKSArIHNyYztcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICB0aGlzLmluTGluayA9IHRydWU7XG4gICAgICBvdXQgKz0gdGhpcy5vdXRwdXRMaW5rKGNhcCwgbGluayk7XG4gICAgICB0aGlzLmluTGluayA9IGZhbHNlO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gc3Ryb25nXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuc3Ryb25nLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnN0cm9uZyh0aGlzLm91dHB1dChjYXBbMl0gfHwgY2FwWzFdKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBlbVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmVtLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmVtKHRoaXMub3V0cHV0KGNhcFsyXSB8fCBjYXBbMV0pKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGNvZGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5jb2RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmNvZGVzcGFuKGVzY2FwZShjYXBbMl0udHJpbSgpLCB0cnVlKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBiclxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmJyLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmJyKCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBkZWwgKGdmbSlcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5kZWwuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuZGVsKHRoaXMub3V0cHV0KGNhcFsxXSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGV4dFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnRleHQuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIudGV4dChlc2NhcGUodGhpcy5zbWFydHlwYW50cyhjYXBbMF0pKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoc3JjKSB7XG4gICAgICB0aHJvdyBuZXdcbiAgICAgICAgRXJyb3IoJ0luZmluaXRlIGxvb3Agb24gYnl0ZTogJyArIHNyYy5jaGFyQ29kZUF0KDApKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb21waWxlIExpbmtcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUub3V0cHV0TGluayA9IGZ1bmN0aW9uKGNhcCwgbGluaykge1xuICB2YXIgaHJlZiA9IGVzY2FwZShsaW5rLmhyZWYpXG4gICAgLCB0aXRsZSA9IGxpbmsudGl0bGUgPyBlc2NhcGUobGluay50aXRsZSkgOiBudWxsO1xuXG4gIHJldHVybiBjYXBbMF0uY2hhckF0KDApICE9PSAnISdcbiAgICA/IHRoaXMucmVuZGVyZXIubGluayhocmVmLCB0aXRsZSwgdGhpcy5vdXRwdXQoY2FwWzFdKSlcbiAgICA6IHRoaXMucmVuZGVyZXIuaW1hZ2UoaHJlZiwgdGl0bGUsIGVzY2FwZShjYXBbMV0pKTtcbn07XG5cbi8qKlxuICogU21hcnR5cGFudHMgVHJhbnNmb3JtYXRpb25zXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLnNtYXJ0eXBhbnRzID0gZnVuY3Rpb24odGV4dCkge1xuICBpZiAoIXRoaXMub3B0aW9ucy5zbWFydHlwYW50cykgcmV0dXJuIHRleHQ7XG4gIHJldHVybiB0ZXh0XG4gICAgLy8gZW0tZGFzaGVzXG4gICAgLnJlcGxhY2UoLy0tLS9nLCAnXFx1MjAxNCcpXG4gICAgLy8gZW4tZGFzaGVzXG4gICAgLnJlcGxhY2UoLy0tL2csICdcXHUyMDEzJylcbiAgICAvLyBvcGVuaW5nIHNpbmdsZXNcbiAgICAucmVwbGFjZSgvKF58Wy1cXHUyMDE0LyhcXFt7XCJcXHNdKScvZywgJyQxXFx1MjAxOCcpXG4gICAgLy8gY2xvc2luZyBzaW5nbGVzICYgYXBvc3Ryb3BoZXNcbiAgICAucmVwbGFjZSgvJy9nLCAnXFx1MjAxOScpXG4gICAgLy8gb3BlbmluZyBkb3VibGVzXG4gICAgLnJlcGxhY2UoLyhefFstXFx1MjAxNC8oXFxbe1xcdTIwMThcXHNdKVwiL2csICckMVxcdTIwMWMnKVxuICAgIC8vIGNsb3NpbmcgZG91Ymxlc1xuICAgIC5yZXBsYWNlKC9cIi9nLCAnXFx1MjAxZCcpXG4gICAgLy8gZWxsaXBzZXNcbiAgICAucmVwbGFjZSgvXFwuezN9L2csICdcXHUyMDI2Jyk7XG59O1xuXG4vKipcbiAqIE1hbmdsZSBMaW5rc1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5tYW5nbGUgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIGlmICghdGhpcy5vcHRpb25zLm1hbmdsZSkgcmV0dXJuIHRleHQ7XG4gIHZhciBvdXQgPSAnJ1xuICAgICwgbCA9IHRleHQubGVuZ3RoXG4gICAgLCBpID0gMFxuICAgICwgY2g7XG5cbiAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICBjaCA9IHRleHQuY2hhckNvZGVBdChpKTtcbiAgICBpZiAoTWF0aC5yYW5kb20oKSA+IDAuNSkge1xuICAgICAgY2ggPSAneCcgKyBjaC50b1N0cmluZygxNik7XG4gICAgfVxuICAgIG91dCArPSAnJiMnICsgY2ggKyAnOyc7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZW5kZXJlclxuICovXG5cbmZ1bmN0aW9uIFJlbmRlcmVyKG9wdGlvbnMpIHtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbn1cblxuUmVuZGVyZXIucHJvdG90eXBlLmNvZGUgPSBmdW5jdGlvbihjb2RlLCBsYW5nLCBlc2NhcGVkKSB7XG4gIGlmICh0aGlzLm9wdGlvbnMuaGlnaGxpZ2h0KSB7XG4gICAgdmFyIG91dCA9IHRoaXMub3B0aW9ucy5oaWdobGlnaHQoY29kZSwgbGFuZyk7XG4gICAgaWYgKG91dCAhPSBudWxsICYmIG91dCAhPT0gY29kZSkge1xuICAgICAgZXNjYXBlZCA9IHRydWU7XG4gICAgICBjb2RlID0gb3V0O1xuICAgIH1cbiAgfVxuXG4gIGlmICghbGFuZykge1xuICAgIHJldHVybiAnPHByZT48Y29kZT4nXG4gICAgICArIChlc2NhcGVkID8gY29kZSA6IGVzY2FwZShjb2RlLCB0cnVlKSlcbiAgICAgICsgJ1xcbjwvY29kZT48L3ByZT4nO1xuICB9XG5cbiAgcmV0dXJuICc8cHJlPjxjb2RlIGNsYXNzPVwiJ1xuICAgICsgdGhpcy5vcHRpb25zLmxhbmdQcmVmaXhcbiAgICArIGVzY2FwZShsYW5nLCB0cnVlKVxuICAgICsgJ1wiPidcbiAgICArIChlc2NhcGVkID8gY29kZSA6IGVzY2FwZShjb2RlLCB0cnVlKSlcbiAgICArICdcXG48L2NvZGU+PC9wcmU+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5ibG9ja3F1b3RlID0gZnVuY3Rpb24ocXVvdGUpIHtcbiAgcmV0dXJuICc8YmxvY2txdW90ZT5cXG4nICsgcXVvdGUgKyAnPC9ibG9ja3F1b3RlPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaHRtbCA9IGZ1bmN0aW9uKGh0bWwpIHtcbiAgcmV0dXJuIGh0bWw7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaGVhZGluZyA9IGZ1bmN0aW9uKHRleHQsIGxldmVsLCByYXcpIHtcbiAgcmV0dXJuICc8aCdcbiAgICArIGxldmVsXG4gICAgKyAnIGlkPVwiJ1xuICAgICsgdGhpcy5vcHRpb25zLmhlYWRlclByZWZpeFxuICAgICsgcmF3LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15cXHddKy9nLCAnLScpXG4gICAgKyAnXCI+J1xuICAgICsgdGV4dFxuICAgICsgJzwvaCdcbiAgICArIGxldmVsXG4gICAgKyAnPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaHIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMub3B0aW9ucy54aHRtbCA/ICc8aHIvPlxcbicgOiAnPGhyPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUubGlzdCA9IGZ1bmN0aW9uKGJvZHksIG9yZGVyZWQpIHtcbiAgdmFyIHR5cGUgPSBvcmRlcmVkID8gJ29sJyA6ICd1bCc7XG4gIHJldHVybiAnPCcgKyB0eXBlICsgJz5cXG4nICsgYm9keSArICc8LycgKyB0eXBlICsgJz5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmxpc3RpdGVtID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxsaT4nICsgdGV4dCArICc8L2xpPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUucGFyYWdyYXBoID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxwPicgKyB0ZXh0ICsgJzwvcD5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRhYmxlID0gZnVuY3Rpb24oaGVhZGVyLCBib2R5KSB7XG4gIHJldHVybiAnPHRhYmxlPlxcbidcbiAgICArICc8dGhlYWQ+XFxuJ1xuICAgICsgaGVhZGVyXG4gICAgKyAnPC90aGVhZD5cXG4nXG4gICAgKyAnPHRib2R5PlxcbidcbiAgICArIGJvZHlcbiAgICArICc8L3Rib2R5PlxcbidcbiAgICArICc8L3RhYmxlPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGFibGVyb3cgPSBmdW5jdGlvbihjb250ZW50KSB7XG4gIHJldHVybiAnPHRyPlxcbicgKyBjb250ZW50ICsgJzwvdHI+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50YWJsZWNlbGwgPSBmdW5jdGlvbihjb250ZW50LCBmbGFncykge1xuICB2YXIgdHlwZSA9IGZsYWdzLmhlYWRlciA/ICd0aCcgOiAndGQnO1xuICB2YXIgdGFnID0gZmxhZ3MuYWxpZ25cbiAgICA/ICc8JyArIHR5cGUgKyAnIHN0eWxlPVwidGV4dC1hbGlnbjonICsgZmxhZ3MuYWxpZ24gKyAnXCI+J1xuICAgIDogJzwnICsgdHlwZSArICc+JztcbiAgcmV0dXJuIHRhZyArIGNvbnRlbnQgKyAnPC8nICsgdHlwZSArICc+XFxuJztcbn07XG5cbi8vIHNwYW4gbGV2ZWwgcmVuZGVyZXJcblJlbmRlcmVyLnByb3RvdHlwZS5zdHJvbmcgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPHN0cm9uZz4nICsgdGV4dCArICc8L3N0cm9uZz4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmVtID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxlbT4nICsgdGV4dCArICc8L2VtPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuY29kZXNwYW4gPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGNvZGU+JyArIHRleHQgKyAnPC9jb2RlPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuYnIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMub3B0aW9ucy54aHRtbCA/ICc8YnIvPicgOiAnPGJyPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuZGVsID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxkZWw+JyArIHRleHQgKyAnPC9kZWw+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5saW5rID0gZnVuY3Rpb24oaHJlZiwgdGl0bGUsIHRleHQpIHtcbiAgaWYgKHRoaXMub3B0aW9ucy5zYW5pdGl6ZSkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgcHJvdCA9IGRlY29kZVVSSUNvbXBvbmVudCh1bmVzY2FwZShocmVmKSlcbiAgICAgICAgLnJlcGxhY2UoL1teXFx3Ol0vZywgJycpXG4gICAgICAgIC50b0xvd2VyQ2FzZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICBpZiAocHJvdC5pbmRleE9mKCdqYXZhc2NyaXB0OicpID09PSAwIHx8IHByb3QuaW5kZXhPZigndmJzY3JpcHQ6JykgPT09IDAgfHwgcHJvdC5pbmRleE9mKCdkYXRhOicpID09PSAwKSB7XG4gICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gIH1cbiAgaWYgKHRoaXMub3B0aW9ucy5iYXNlVXJsICYmICFvcmlnaW5JbmRlcGVuZGVudFVybC50ZXN0KGhyZWYpKSB7XG4gICAgaHJlZiA9IHJlc29sdmVVcmwodGhpcy5vcHRpb25zLmJhc2VVcmwsIGhyZWYpO1xuICB9XG4gIHZhciBvdXQgPSAnPGEgaHJlZj1cIicgKyBocmVmICsgJ1wiJztcbiAgaWYgKHRpdGxlKSB7XG4gICAgb3V0ICs9ICcgdGl0bGU9XCInICsgdGl0bGUgKyAnXCInO1xuICB9XG4gIG91dCArPSAnPicgKyB0ZXh0ICsgJzwvYT4nO1xuICByZXR1cm4gb3V0O1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmltYWdlID0gZnVuY3Rpb24oaHJlZiwgdGl0bGUsIHRleHQpIHtcbiAgaWYgKHRoaXMub3B0aW9ucy5iYXNlVXJsICYmICFvcmlnaW5JbmRlcGVuZGVudFVybC50ZXN0KGhyZWYpKSB7XG4gICAgaHJlZiA9IHJlc29sdmVVcmwodGhpcy5vcHRpb25zLmJhc2VVcmwsIGhyZWYpO1xuICB9XG4gIHZhciBvdXQgPSAnPGltZyBzcmM9XCInICsgaHJlZiArICdcIiBhbHQ9XCInICsgdGV4dCArICdcIic7XG4gIGlmICh0aXRsZSkge1xuICAgIG91dCArPSAnIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiJztcbiAgfVxuICBvdXQgKz0gdGhpcy5vcHRpb25zLnhodG1sID8gJy8+JyA6ICc+JztcbiAgcmV0dXJuIG91dDtcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50ZXh0ID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gdGV4dDtcbn07XG5cbi8qKlxuICogUGFyc2luZyAmIENvbXBpbGluZ1xuICovXG5cbmZ1bmN0aW9uIFBhcnNlcihvcHRpb25zKSB7XG4gIHRoaXMudG9rZW5zID0gW107XG4gIHRoaXMudG9rZW4gPSBudWxsO1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IG1hcmtlZC5kZWZhdWx0cztcbiAgdGhpcy5vcHRpb25zLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyIHx8IG5ldyBSZW5kZXJlcjtcbiAgdGhpcy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlcjtcbiAgdGhpcy5yZW5kZXJlci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xufVxuXG4vKipcbiAqIFN0YXRpYyBQYXJzZSBNZXRob2RcbiAqL1xuXG5QYXJzZXIucGFyc2UgPSBmdW5jdGlvbihzcmMsIG9wdGlvbnMsIHJlbmRlcmVyKSB7XG4gIHZhciBwYXJzZXIgPSBuZXcgUGFyc2VyKG9wdGlvbnMsIHJlbmRlcmVyKTtcbiAgcmV0dXJuIHBhcnNlci5wYXJzZShzcmMpO1xufTtcblxuLyoqXG4gKiBQYXJzZSBMb29wXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKHNyYykge1xuICB0aGlzLmlubGluZSA9IG5ldyBJbmxpbmVMZXhlcihzcmMubGlua3MsIHRoaXMub3B0aW9ucywgdGhpcy5yZW5kZXJlcik7XG4gIHRoaXMudG9rZW5zID0gc3JjLnJldmVyc2UoKTtcblxuICB2YXIgb3V0ID0gJyc7XG4gIHdoaWxlICh0aGlzLm5leHQoKSkge1xuICAgIG91dCArPSB0aGlzLnRvaygpO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogTmV4dCBUb2tlblxuICovXG5cblBhcnNlci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy50b2tlbiA9IHRoaXMudG9rZW5zLnBvcCgpO1xufTtcblxuLyoqXG4gKiBQcmV2aWV3IE5leHQgVG9rZW5cbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudG9rZW5zW3RoaXMudG9rZW5zLmxlbmd0aCAtIDFdIHx8IDA7XG59O1xuXG4vKipcbiAqIFBhcnNlIFRleHQgVG9rZW5zXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5wYXJzZVRleHQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGJvZHkgPSB0aGlzLnRva2VuLnRleHQ7XG5cbiAgd2hpbGUgKHRoaXMucGVlaygpLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgIGJvZHkgKz0gJ1xcbicgKyB0aGlzLm5leHQoKS50ZXh0O1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuaW5saW5lLm91dHB1dChib2R5KTtcbn07XG5cbi8qKlxuICogUGFyc2UgQ3VycmVudCBUb2tlblxuICovXG5cblBhcnNlci5wcm90b3R5cGUudG9rID0gZnVuY3Rpb24oKSB7XG4gIHN3aXRjaCAodGhpcy50b2tlbi50eXBlKSB7XG4gICAgY2FzZSAnc3BhY2UnOiB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGNhc2UgJ2hyJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuaHIoKTtcbiAgICB9XG4gICAgY2FzZSAnaGVhZGluZyc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmhlYWRpbmcoXG4gICAgICAgIHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLnRleHQpLFxuICAgICAgICB0aGlzLnRva2VuLmRlcHRoLFxuICAgICAgICB0aGlzLnRva2VuLnRleHQpO1xuICAgIH1cbiAgICBjYXNlICdjb2RlJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuY29kZSh0aGlzLnRva2VuLnRleHQsXG4gICAgICAgIHRoaXMudG9rZW4ubGFuZyxcbiAgICAgICAgdGhpcy50b2tlbi5lc2NhcGVkKTtcbiAgICB9XG4gICAgY2FzZSAndGFibGUnOiB7XG4gICAgICB2YXIgaGVhZGVyID0gJydcbiAgICAgICAgLCBib2R5ID0gJydcbiAgICAgICAgLCBpXG4gICAgICAgICwgcm93XG4gICAgICAgICwgY2VsbFxuICAgICAgICAsIGZsYWdzXG4gICAgICAgICwgajtcblxuICAgICAgLy8gaGVhZGVyXG4gICAgICBjZWxsID0gJyc7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy50b2tlbi5oZWFkZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZmxhZ3MgPSB7IGhlYWRlcjogdHJ1ZSwgYWxpZ246IHRoaXMudG9rZW4uYWxpZ25baV0gfTtcbiAgICAgICAgY2VsbCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlY2VsbChcbiAgICAgICAgICB0aGlzLmlubGluZS5vdXRwdXQodGhpcy50b2tlbi5oZWFkZXJbaV0pLFxuICAgICAgICAgIHsgaGVhZGVyOiB0cnVlLCBhbGlnbjogdGhpcy50b2tlbi5hbGlnbltpXSB9XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBoZWFkZXIgKz0gdGhpcy5yZW5kZXJlci50YWJsZXJvdyhjZWxsKTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMudG9rZW4uY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcm93ID0gdGhpcy50b2tlbi5jZWxsc1tpXTtcblxuICAgICAgICBjZWxsID0gJyc7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCByb3cubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBjZWxsICs9IHRoaXMucmVuZGVyZXIudGFibGVjZWxsKFxuICAgICAgICAgICAgdGhpcy5pbmxpbmUub3V0cHV0KHJvd1tqXSksXG4gICAgICAgICAgICB7IGhlYWRlcjogZmFsc2UsIGFsaWduOiB0aGlzLnRva2VuLmFsaWduW2pdIH1cbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgYm9keSArPSB0aGlzLnJlbmRlcmVyLnRhYmxlcm93KGNlbGwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIudGFibGUoaGVhZGVyLCBib2R5KTtcbiAgICB9XG4gICAgY2FzZSAnYmxvY2txdW90ZV9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJyc7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnYmxvY2txdW90ZV9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuYmxvY2txdW90ZShib2R5KTtcbiAgICB9XG4gICAgY2FzZSAnbGlzdF9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJydcbiAgICAgICAgLCBvcmRlcmVkID0gdGhpcy50b2tlbi5vcmRlcmVkO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2xpc3RfZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3QoYm9keSwgb3JkZXJlZCk7XG4gICAgfVxuICAgIGNhc2UgJ2xpc3RfaXRlbV9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJyc7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnbGlzdF9pdGVtX2VuZCcpIHtcbiAgICAgICAgYm9keSArPSB0aGlzLnRva2VuLnR5cGUgPT09ICd0ZXh0J1xuICAgICAgICAgID8gdGhpcy5wYXJzZVRleHQoKVxuICAgICAgICAgIDogdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIubGlzdGl0ZW0oYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2xvb3NlX2l0ZW1fc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2xpc3RfaXRlbV9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIubGlzdGl0ZW0oYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2h0bWwnOiB7XG4gICAgICB2YXIgaHRtbCA9ICF0aGlzLnRva2VuLnByZSAmJiAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgID8gdGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4udGV4dClcbiAgICAgICAgOiB0aGlzLnRva2VuLnRleHQ7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5odG1sKGh0bWwpO1xuICAgIH1cbiAgICBjYXNlICdwYXJhZ3JhcGgnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5wYXJhZ3JhcGgodGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4udGV4dCkpO1xuICAgIH1cbiAgICBjYXNlICd0ZXh0Jzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHRoaXMucGFyc2VUZXh0KCkpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBIZWxwZXJzXG4gKi9cblxuZnVuY3Rpb24gZXNjYXBlKGh0bWwsIGVuY29kZSkge1xuICByZXR1cm4gaHRtbFxuICAgIC5yZXBsYWNlKCFlbmNvZGUgPyAvJig/ISM/XFx3KzspL2cgOiAvJi9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgIC5yZXBsYWNlKC8nL2csICcmIzM5OycpO1xufVxuXG5mdW5jdGlvbiB1bmVzY2FwZShodG1sKSB7XG5cdC8vIGV4cGxpY2l0bHkgbWF0Y2ggZGVjaW1hbCwgaGV4LCBhbmQgbmFtZWQgSFRNTCBlbnRpdGllc1xuICByZXR1cm4gaHRtbC5yZXBsYWNlKC8mKCMoPzpcXGQrKXwoPzojeFswLTlBLUZhLWZdKyl8KD86XFx3KykpOz8vaWcsIGZ1bmN0aW9uKF8sIG4pIHtcbiAgICBuID0gbi50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChuID09PSAnY29sb24nKSByZXR1cm4gJzonO1xuICAgIGlmIChuLmNoYXJBdCgwKSA9PT0gJyMnKSB7XG4gICAgICByZXR1cm4gbi5jaGFyQXQoMSkgPT09ICd4J1xuICAgICAgICA/IFN0cmluZy5mcm9tQ2hhckNvZGUocGFyc2VJbnQobi5zdWJzdHJpbmcoMiksIDE2KSlcbiAgICAgICAgOiBTdHJpbmcuZnJvbUNoYXJDb2RlKCtuLnN1YnN0cmluZygxKSk7XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2UocmVnZXgsIG9wdCkge1xuICByZWdleCA9IHJlZ2V4LnNvdXJjZTtcbiAgb3B0ID0gb3B0IHx8ICcnO1xuICByZXR1cm4gZnVuY3Rpb24gc2VsZihuYW1lLCB2YWwpIHtcbiAgICBpZiAoIW5hbWUpIHJldHVybiBuZXcgUmVnRXhwKHJlZ2V4LCBvcHQpO1xuICAgIHZhbCA9IHZhbC5zb3VyY2UgfHwgdmFsO1xuICAgIHZhbCA9IHZhbC5yZXBsYWNlKC8oXnxbXlxcW10pXFxeL2csICckMScpO1xuICAgIHJlZ2V4ID0gcmVnZXgucmVwbGFjZShuYW1lLCB2YWwpO1xuICAgIHJldHVybiBzZWxmO1xuICB9O1xufVxuXG5mdW5jdGlvbiByZXNvbHZlVXJsKGJhc2UsIGhyZWYpIHtcbiAgaWYgKCFiYXNlVXJsc1snICcgKyBiYXNlXSkge1xuICAgIC8vIHdlIGNhbiBpZ25vcmUgZXZlcnl0aGluZyBpbiBiYXNlIGFmdGVyIHRoZSBsYXN0IHNsYXNoIG9mIGl0cyBwYXRoIGNvbXBvbmVudCxcbiAgICAvLyBidXQgd2UgbWlnaHQgbmVlZCB0byBhZGQgX3RoYXRfXG4gICAgLy8gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODYjc2VjdGlvbi0zXG4gICAgaWYgKC9eW146XSs6XFwvKlteL10qJC8udGVzdChiYXNlKSkge1xuICAgICAgYmFzZVVybHNbJyAnICsgYmFzZV0gPSBiYXNlICsgJy8nO1xuICAgIH0gZWxzZSB7XG4gICAgICBiYXNlVXJsc1snICcgKyBiYXNlXSA9IGJhc2UucmVwbGFjZSgvW14vXSokLywgJycpO1xuICAgIH1cbiAgfVxuICBiYXNlID0gYmFzZVVybHNbJyAnICsgYmFzZV07XG5cbiAgaWYgKGhyZWYuc2xpY2UoMCwgMikgPT09ICcvLycpIHtcbiAgICByZXR1cm4gYmFzZS5yZXBsYWNlKC86W1xcc1xcU10qLywgJzonKSArIGhyZWY7XG4gIH0gZWxzZSBpZiAoaHJlZi5jaGFyQXQoMCkgPT09ICcvJykge1xuICAgIHJldHVybiBiYXNlLnJlcGxhY2UoLyg6XFwvKlteL10qKVtcXHNcXFNdKi8sICckMScpICsgaHJlZjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZSArIGhyZWY7XG4gIH1cbn1cbnZhciBiYXNlVXJscyA9IHt9O1xudmFyIG9yaWdpbkluZGVwZW5kZW50VXJsID0gL14kfF5bYS16XVthLXowLTkrLi1dKjp8Xls/I10vaTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5ub29wLmV4ZWMgPSBub29wO1xuXG5mdW5jdGlvbiBtZXJnZShvYmopIHtcbiAgdmFyIGkgPSAxXG4gICAgLCB0YXJnZXRcbiAgICAsIGtleTtcblxuICBmb3IgKDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHRhcmdldCA9IGFyZ3VtZW50c1tpXTtcbiAgICBmb3IgKGtleSBpbiB0YXJnZXQpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGFyZ2V0LCBrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gdGFyZ2V0W2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxuXG4vKipcbiAqIE1hcmtlZFxuICovXG5cbmZ1bmN0aW9uIG1hcmtlZChzcmMsIG9wdCwgY2FsbGJhY2spIHtcbiAgaWYgKGNhbGxiYWNrIHx8IHR5cGVvZiBvcHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFjayA9IG9wdDtcbiAgICAgIG9wdCA9IG51bGw7XG4gICAgfVxuXG4gICAgb3B0ID0gbWVyZ2Uoe30sIG1hcmtlZC5kZWZhdWx0cywgb3B0IHx8IHt9KTtcblxuICAgIHZhciBoaWdobGlnaHQgPSBvcHQuaGlnaGxpZ2h0XG4gICAgICAsIHRva2Vuc1xuICAgICAgLCBwZW5kaW5nXG4gICAgICAsIGkgPSAwO1xuXG4gICAgdHJ5IHtcbiAgICAgIHRva2VucyA9IExleGVyLmxleChzcmMsIG9wdClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZSk7XG4gICAgfVxuXG4gICAgcGVuZGluZyA9IHRva2Vucy5sZW5ndGg7XG5cbiAgICB2YXIgZG9uZSA9IGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBvcHQuaGlnaGxpZ2h0ID0gaGlnaGxpZ2h0O1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgIH1cblxuICAgICAgdmFyIG91dDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgb3V0ID0gUGFyc2VyLnBhcnNlKHRva2Vucywgb3B0KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZXJyID0gZTtcbiAgICAgIH1cblxuICAgICAgb3B0LmhpZ2hsaWdodCA9IGhpZ2hsaWdodDtcblxuICAgICAgcmV0dXJuIGVyclxuICAgICAgICA/IGNhbGxiYWNrKGVycilcbiAgICAgICAgOiBjYWxsYmFjayhudWxsLCBvdXQpO1xuICAgIH07XG5cbiAgICBpZiAoIWhpZ2hsaWdodCB8fCBoaWdobGlnaHQubGVuZ3RoIDwgMykge1xuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9XG5cbiAgICBkZWxldGUgb3B0LmhpZ2hsaWdodDtcblxuICAgIGlmICghcGVuZGluZykgcmV0dXJuIGRvbmUoKTtcblxuICAgIGZvciAoOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAoZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgaWYgKHRva2VuLnR5cGUgIT09ICdjb2RlJykge1xuICAgICAgICAgIHJldHVybiAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoaWdobGlnaHQodG9rZW4udGV4dCwgdG9rZW4ubGFuZywgZnVuY3Rpb24oZXJyLCBjb2RlKSB7XG4gICAgICAgICAgaWYgKGVycikgcmV0dXJuIGRvbmUoZXJyKTtcbiAgICAgICAgICBpZiAoY29kZSA9PSBudWxsIHx8IGNvZGUgPT09IHRva2VuLnRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0b2tlbi50ZXh0ID0gY29kZTtcbiAgICAgICAgICB0b2tlbi5lc2NhcGVkID0gdHJ1ZTtcbiAgICAgICAgICAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pKHRva2Vuc1tpXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuO1xuICB9XG4gIHRyeSB7XG4gICAgaWYgKG9wdCkgb3B0ID0gbWVyZ2Uoe30sIG1hcmtlZC5kZWZhdWx0cywgb3B0KTtcbiAgICByZXR1cm4gUGFyc2VyLnBhcnNlKExleGVyLmxleChzcmMsIG9wdCksIG9wdCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlLm1lc3NhZ2UgKz0gJ1xcblBsZWFzZSByZXBvcnQgdGhpcyB0byBodHRwczovL2dpdGh1Yi5jb20vY2hqai9tYXJrZWQuJztcbiAgICBpZiAoKG9wdCB8fCBtYXJrZWQuZGVmYXVsdHMpLnNpbGVudCkge1xuICAgICAgcmV0dXJuICc8cD5BbiBlcnJvciBvY2N1cnJlZDo8L3A+PHByZT4nXG4gICAgICAgICsgZXNjYXBlKGUubWVzc2FnZSArICcnLCB0cnVlKVxuICAgICAgICArICc8L3ByZT4nO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9XG59XG5cbi8qKlxuICogT3B0aW9uc1xuICovXG5cbm1hcmtlZC5vcHRpb25zID1cbm1hcmtlZC5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0KSB7XG4gIG1lcmdlKG1hcmtlZC5kZWZhdWx0cywgb3B0KTtcbiAgcmV0dXJuIG1hcmtlZDtcbn07XG5cbm1hcmtlZC5kZWZhdWx0cyA9IHtcbiAgZ2ZtOiB0cnVlLFxuICB0YWJsZXM6IHRydWUsXG4gIGJyZWFrczogZmFsc2UsXG4gIHBlZGFudGljOiBmYWxzZSxcbiAgc2FuaXRpemU6IGZhbHNlLFxuICBzYW5pdGl6ZXI6IG51bGwsXG4gIG1hbmdsZTogdHJ1ZSxcbiAgc21hcnRMaXN0czogZmFsc2UsXG4gIHNpbGVudDogZmFsc2UsXG4gIGhpZ2hsaWdodDogbnVsbCxcbiAgbGFuZ1ByZWZpeDogJ2xhbmctJyxcbiAgc21hcnR5cGFudHM6IGZhbHNlLFxuICBoZWFkZXJQcmVmaXg6ICcnLFxuICByZW5kZXJlcjogbmV3IFJlbmRlcmVyLFxuICB4aHRtbDogZmFsc2UsXG4gIGJhc2VVcmw6IG51bGxcbn07XG5cbi8qKlxuICogRXhwb3NlXG4gKi9cblxubWFya2VkLlBhcnNlciA9IFBhcnNlcjtcbm1hcmtlZC5wYXJzZXIgPSBQYXJzZXIucGFyc2U7XG5cbm1hcmtlZC5SZW5kZXJlciA9IFJlbmRlcmVyO1xuXG5tYXJrZWQuTGV4ZXIgPSBMZXhlcjtcbm1hcmtlZC5sZXhlciA9IExleGVyLmxleDtcblxubWFya2VkLklubGluZUxleGVyID0gSW5saW5lTGV4ZXI7XG5tYXJrZWQuaW5saW5lTGV4ZXIgPSBJbmxpbmVMZXhlci5vdXRwdXQ7XG5cbm1hcmtlZC5wYXJzZSA9IG1hcmtlZDtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICBtb2R1bGUuZXhwb3J0cyA9IG1hcmtlZDtcbn0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIG1hcmtlZDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLm1hcmtlZCA9IG1hcmtlZDtcbn1cblxufSkuY2FsbChmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMgfHwgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogZ2xvYmFsKTtcbn0oKSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9tYXJrZWQvbGliL21hcmtlZC5qc1xuLy8gbW9kdWxlIGlkID0gMjNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGc7XHJcblxyXG4vLyBUaGlzIHdvcmtzIGluIG5vbi1zdHJpY3QgbW9kZVxyXG5nID0gKGZ1bmN0aW9uKCkge1xyXG5cdHJldHVybiB0aGlzO1xyXG59KSgpO1xyXG5cclxudHJ5IHtcclxuXHQvLyBUaGlzIHdvcmtzIGlmIGV2YWwgaXMgYWxsb3dlZCAoc2VlIENTUClcclxuXHRnID0gZyB8fCBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCkgfHwgKDEsZXZhbCkoXCJ0aGlzXCIpO1xyXG59IGNhdGNoKGUpIHtcclxuXHQvLyBUaGlzIHdvcmtzIGlmIHRoZSB3aW5kb3cgcmVmZXJlbmNlIGlzIGF2YWlsYWJsZVxyXG5cdGlmKHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIpXHJcblx0XHRnID0gd2luZG93O1xyXG59XHJcblxyXG4vLyBnIGNhbiBzdGlsbCBiZSB1bmRlZmluZWQsIGJ1dCBub3RoaW5nIHRvIGRvIGFib3V0IGl0Li4uXHJcbi8vIFdlIHJldHVybiB1bmRlZmluZWQsIGluc3RlYWQgb2Ygbm90aGluZyBoZXJlLCBzbyBpdCdzXHJcbi8vIGVhc2llciB0byBoYW5kbGUgdGhpcyBjYXNlLiBpZighZ2xvYmFsKSB7IC4uLn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZztcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gKHdlYnBhY2spL2J1aWxkaW4vZ2xvYmFsLmpzXG4vLyBtb2R1bGUgaWQgPSAyNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJkZWYgc2h1ZmZsZSBhcnJheVxuXHR2YXIgY291bnRlciA9IGFycmF5Omxlbmd0aCwgdGVtcCwgaW5kZXhcblxuXHQjIFdoaWxlIHRoZXJlIGFyZSBlbGVtZW50cyBpbiB0aGUgYXJyYXlcblx0d2hpbGUgY291bnRlciA+IDBcblx0XHQjIFBpY2sgYSByYW5kb20gaW5kZXhcblx0XHRpbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20gKiBjb3VudGVyKVxuXHRcdGNvdW50ZXItLSAjIERlY3JlYXNlIGNvdW50ZXIgYnkgMVxuXHRcdCMgQW5kIHN3YXAgdGhlIGxhc3QgZWxlbWVudCB3aXRoIGl0XG5cdFx0dGVtcCA9IGFycmF5W2NvdW50ZXJdXG5cdFx0YXJyYXlbY291bnRlcl0gPSBhcnJheVtpbmRleF1cblx0XHRhcnJheVtpbmRleF0gPSB0ZW1wXG5cdFxuXHRyZXR1cm4gYXJyYXlcblxuZXhwb3J0IHRhZyBQYXR0ZXJuXG5cblx0ZGVmIHNldHVwXG5cdFx0cmV0dXJuIHNlbGYgaWYgJG5vZGUkXG5cdFx0dmFyIHBhcnRzID0ge3RhZ3M6IFtdLCBrZXl3b3JkczogW10sIG1ldGhvZHM6IFtdfVxuXHRcdHZhciBpdGVtcyA9IFtdXG5cdFx0dmFyIGxpbmVzID0gW11cblxuXHRcdGZvciBvd24gayx2IG9mIEltYmEuVGFnOnByb3RvdHlwZVxuXHRcdFx0aXRlbXMucHVzaChcIjxlbT57a308L2VtPlwiKVxuXHRcdFx0cGFydHM6bWV0aG9kcy5wdXNoKFwiPGVtPntrfTwvZW0+XCIpXG5cblx0XHRmb3IgayBpbiBJbWJhLkhUTUxfVEFHUyBvciBIVE1MX1RBR1Ncblx0XHRcdGl0ZW1zLnB1c2goXCI8dT4mbHQ7e2t9Jmd0OzwvdT5cIilcblx0XHRcdHBhcnRzOnRhZ3MucHVzaChcIjx1PiZsdDt7a30mZ3Q7PC91PlwiKVxuXG5cdFx0dmFyIHdvcmRzID0gXCJkZWYgaWYgZWxzZSBlbGlmIHdoaWxlIHVudGlsIGZvciBpbiBvZiB2YXIgbGV0IGNsYXNzIGV4dGVuZCBleHBvcnQgaW1wb3J0IHRhZyBnbG9iYWxcIlxuXG5cdFx0Zm9yIGsgaW4gd29yZHMuc3BsaXQoXCIgXCIpXG5cdFx0XHRpdGVtcy5wdXNoKFwiPGk+e2t9PC9pPlwiKVxuXHRcdFx0cGFydHM6a2V5d29yZHMucHVzaChcIjxpPntrfTwvaT5cIilcblxuXHRcdHZhciBzaHVmZmxlZCA9IHNodWZmbGUoaXRlbXMpXG5cdFx0dmFyIGFsbCA9IFtdLmNvbmNhdChzaHVmZmxlZClcblx0XHR2YXIgY291bnQgPSBpdGVtczpsZW5ndGggLSAxXG5cblx0XHRmb3IgbG4gaW4gWzAgLi4gMTRdXG5cdFx0XHRsZXQgY2hhcnMgPSAwXG5cdFx0XHRsaW5lc1tsbl0gPSBbXVxuXHRcdFx0d2hpbGUgY2hhcnMgPCAzMDBcblx0XHRcdFx0bGV0IGl0ZW0gPSAoc2h1ZmZsZWQucG9wIG9yIGFsbFtNYXRoLmZsb29yKGNvdW50ICogTWF0aC5yYW5kb20pXSlcblx0XHRcdFx0aWYgaXRlbVxuXHRcdFx0XHRcdGNoYXJzICs9IGl0ZW06bGVuZ3RoXG5cdFx0XHRcdFx0bGluZXNbbG5dLnB1c2goaXRlbSlcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGNoYXJzID0gNDAwXG5cblx0XHRkb206aW5uZXJIVE1MID0gJzxkaXY+JyArIGxpbmVzLm1hcCh8bG4saXxcblx0XHRcdGxldCBvID0gTWF0aC5tYXgoMCwoKGkgLSAyKSAqIDAuMyAvIDE0KSkudG9GaXhlZCgyKVxuXHRcdFx0XCI8ZGl2IGNsYXNzPSdsaW5lJyBzdHlsZT0nb3BhY2l0eToge299Oyc+XCIgKyBsbi5qb2luKFwiIFwiKSArICc8L2Rpdj4nXG5cdFx0KS5qb2luKCcnKSArICc8L2Rpdj4nXG5cdFx0c2VsZlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9QYXR0ZXJuLmltYmEiLCJcbmV4cG9ydCB0YWcgU2NyaW1iYUVtYmVkXG5cdHByb3AgY2lkXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmPlxuXHRcdFx0PGlmcmFtZSBzcmM9XCJodHRwczovL3NjcmltYmEuY29tL2Mve2NpZH0uZW1iZWQ/bWluaW1hbFwiPlxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy92aWV3cy9TY3JpbWJhRW1iZWQuaW1iYSIsImltcG9ydCBQYWdlIGZyb20gJy4vUGFnZSdcbmltcG9ydCBTbmlwcGV0IGZyb20gJy4vU25pcHBldCdcblxudGFnIEd1aWRlVE9DXG5cdHByb3AgdG9jXG5cdGF0dHIgbGV2ZWxcblxuXHRkZWYgdG9nZ2xlXG5cdFx0dG9nZ2xlRmxhZygnY29sbGFwc2VkJylcblx0XHRcblx0ZGVmIHRvY1xuXHRcdEB0b2Mgb3IgZGF0YS50b2Ncblx0XHRcblx0ZGVmIHJvdXRlXG5cdFx0XCJ7ZGF0YS5wYXRofSN7dG9jOnNsdWd9XCJcdFx0XG5cdFx0XG5cdGRlZiByZW5kZXJcblx0XHRyZXR1cm4gc2VsZiB1bmxlc3MgZGF0YS5yZWFkeVxuXG5cdFx0bGV0IHRvYyA9IHRvY1xuXHRcdHJlcm91dGVcblx0XG5cdFx0PHNlbGYudG9jLmVudHJ5IGxldmVsPSh0b2M6bGV2ZWwpPlxuXHRcdFx0aWYgdG9jOmNoaWxkcmVuOmxlbmd0aCBhbmQgdG9jOmxldmVsIDwgM1xuXHRcdFx0XHQ8LmhlYWRlcj5cblx0XHRcdFx0XHQ8YSBocmVmPXJvdXRlPiB0b2M6dGl0bGVcblx0XHRcdFx0PC5jb250ZW50PlxuXHRcdFx0XHRcdGZvciBjaGlsZCBpbiB0b2M6Y2hpbGRyZW4gd2hlbiBjaGlsZDpsZXZlbCA8IDNcblx0XHRcdFx0XHRcdDxHdWlkZVRPQ1tkYXRhXSB0b2M9Y2hpbGQ+XG5cdFx0XHRlbHNlXG5cdFx0XHRcdDxhIGhyZWY9cm91dGU+IHRvYzp0aXRsZVxuXG50YWcgR3VpZGVcblx0XG5cdGRlZiBzZXR1cFxuXHRcdHJlbmRlclxuXHRcdEBib2R5LmRvbTppbm5lckhUTUwgPSBkYXRhOmJvZHlcblx0XHRpZiAkd2ViJFxuXHRcdFx0YXdha2VuU25pcHBldHNcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZi5tZD5cblx0XHRcdDxkaXZAYm9keT5cblx0XHRcdDxmb290ZXI+XG5cdFx0XHRcdGlmIGxldCByZWYgPSBhcHAuZ3VpZGVbZGF0YTpwcmV2XVxuXHRcdFx0XHRcdDxhLnByZXYgaHJlZj1cIi9ndWlkZS97cmVmOmlkfVwiPiBcIuKGkCBcIiArIHJlZjp0aXRsZVxuXHRcdFx0XHRpZiBsZXQgcmVmID0gYXBwLmd1aWRlW2RhdGE6bmV4dF1cblx0XHRcdFx0XHQ8YS5uZXh0IGhyZWY9XCIvZ3VpZGUve3JlZjppZH1cIj4gcmVmOnRpdGxlICsgXCIg4oaSXCJcblxuXHRkZWYgYXdha2VuU25pcHBldHNcblx0XHRmb3IgaXRlbSBpbiBkb20ucXVlcnlTZWxlY3RvckFsbCgnLnNuaXBwZXQnKVxuXHRcdFx0bGV0IGNvZGUgPSBpdGVtOnRleHRDb250ZW50XG5cdFx0XHRpZiBjb2RlLmluZGV4T2YoJ0ltYmEubW91bnQnKSA+PSAwXG5cdFx0XHRcdFNuaXBwZXQucmVwbGFjZShpdGVtKVxuXHRcdHNlbGZcblxudGFnIFRPQyA8IGxpXG5cdHByb3AgdG9jXG5cdHByb3AgZXhwYW5kZWQgZGVmYXVsdDogdHJ1ZVxuXHRhdHRyIGxldmVsXG5cdFxuXHRkZWYgcm91dGVcblx0XHRcIi9ndWlkZS97ZGF0YTpyb3V0ZX0je3RvYzpzbHVnfVwiXG5cdFx0XG5cdGRlZiB0b2Ncblx0XHRAdG9jIG9yIGRhdGE6dG9jWzBdXG5cdFx0XG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZi50b2MuZW50cnkgbGV2ZWw9KHRvYzpsZXZlbCk+XG5cdFx0XHQ8YSBocmVmPXJvdXRlPiB0b2M6dGl0bGVcblx0XHRcdGlmIHRvYzpjaGlsZHJlbjpsZW5ndGggYW5kIHRvYzpsZXZlbCA8IDIgYW5kIGV4cGFuZGVkXG5cdFx0XHRcdDx1bD4gZm9yIGNoaWxkIGluIHRvYzpjaGlsZHJlbiB3aGVuIGNoaWxkOmxldmVsIDwgM1xuXHRcdFx0XHRcdDxUT0NbZGF0YV0gdG9jPWNoaWxkPlxuXG5leHBvcnQgdGFnIEd1aWRlc1BhZ2UgPCBQYWdlXG5cdFxuXHRkZWYgbW91bnRcblx0XHRAb25zY3JvbGwgfHw9IGRvIHNjcm9sbGVkXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsQG9uc2Nyb2xsLHBhc3NpdmU6IHRydWUpXG5cblx0ZGVmIHVubW91bnRcblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJyxAb25zY3JvbGwscGFzc2l2ZTogdHJ1ZSlcblx0XHRcblx0ZGVmIGd1aWRlXG5cdFx0ZGF0YVtyb3V0ZXIucGF0aC5yZXBsYWNlKCcvZ3VpZGUvJywnJyldIG9yIGRhdGFbJ2Vzc2VudGlhbHMvaW50cm9kdWN0aW9uJ11cblx0XHRcblx0ZGVmIHNjcm9sbGVkXG5cdFx0cmV0dXJuIHNlbGZcblxuXHRcdHZhciBpdGVtcyA9IGRvbS5xdWVyeVNlbGVjdG9yQWxsKCdbaWRdJylcblx0XHR2YXIgbWF0Y2hcblxuXHRcdHZhciBzY3JvbGxUb3AgPSB3aW5kb3c6cGFnZVlPZmZzZXRcblx0XHR2YXIgd2ggPSB3aW5kb3c6aW5uZXJIZWlnaHRcblx0XHR2YXIgZGggPSBkb2N1bWVudDpib2R5OnNjcm9sbEhlaWdodFxuXG5cdFx0aWYgQHNjcm9sbEZyZWV6ZSA+PSAwXG5cdFx0XHR2YXIgZGlmZiA9IE1hdGguYWJzKHNjcm9sbFRvcCAtIEBzY3JvbGxGcmVlemUpXG5cdFx0XHRyZXR1cm4gc2VsZiBpZiBkaWZmIDwgNTBcblx0XHRcdEBzY3JvbGxGcmVlemUgPSAtMVxuXG5cdFx0dmFyIHNjcm9sbEJvdHRvbSA9IGRoIC0gKHNjcm9sbFRvcCArIHdoKVxuXG5cdFx0aWYgc2Nyb2xsQm90dG9tID09IDBcblx0XHRcdG1hdGNoID0gaXRlbXNbaXRlbXMubGVuIC0gMV1cblx0XHRlbHNlXG5cdFx0XHRmb3IgaXRlbSBpbiBpdGVtc1xuXHRcdFx0XHR2YXIgdCA9IChpdGVtOm9mZnNldFRvcCArIDMwICsgNjApICMgaGFja1xuXHRcdFx0XHR2YXIgZGlzdCA9IHNjcm9sbFRvcCAtIHRcblxuXHRcdFx0XHRpZiBkaXN0IDwgMFxuXHRcdFx0XHRcdGJyZWFrIG1hdGNoID0gaXRlbVxuXHRcdFxuXHRcdGlmIG1hdGNoXG5cdFx0XHRpZiBAaGFzaCAhPSBtYXRjaDppZFxuXHRcdFx0XHRAaGFzaCA9IG1hdGNoOmlkXG5cdFx0XHRcdHJvdXRlci5nbygnIycgKyBAaGFzaCx7fSx5ZXMpXG5cdFx0XHRcdHJlbmRlclxuXG5cdFx0c2VsZlxuXHRcdFxuXHRkZWYgb25yb3V0ZSBlXG5cdFx0ZS5zdG9wXG5cdFx0bG9nICdndWlkZXMgcm91dGVkJ1xuXHRcdHZhciBzY3JvbGwgPSBkb1xuXHRcdFx0aWYgbGV0IGVsID0gZG9tLnF1ZXJ5U2VsZWN0b3IoJyMnICsgcm91dGVyLmhhc2gpXG5cdFx0XHRcdGVsLnNjcm9sbEludG9WaWV3KHRydWUpXG5cdFx0XHRcdEBzY3JvbGxGcmVlemUgPSB3aW5kb3c6cGFnZVlPZmZzZXRcblx0XHRcdFx0cmV0dXJuIGVsXG5cdFx0XHRyZXR1cm4gbm9cblxuXHRcdGlmIHJvdXRlci5oYXNoXG5cdFx0XHQjIHJlbmRlclxuXHRcdFx0c2Nyb2xsKCkgb3Igc2V0VGltZW91dChzY3JvbGwsMjApXG5cblx0XHRzZWxmXG5cdCMgcHJvcCBndWlkZVxuXG5cdGRlZiByZW5kZXJcblx0XHRsZXQgY3VyciA9IGd1aWRlXG5cblx0XHQ8c2VsZi5fcGFnZT5cblx0XHRcdDxuYXZAbmF2PlxuXHRcdFx0XHQ8LmNvbnRlbnQ+XG5cdFx0XHRcdFx0Zm9yIGl0ZW0gaW4gZGF0YTp0b2Ncblx0XHRcdFx0XHRcdDxoMT4gaXRlbTp0aXRsZSBvciBpdGVtOmlkXG5cdFx0XHRcdFx0XHQ8dWw+XG5cdFx0XHRcdFx0XHRcdGZvciBzZWN0aW9uIGluIGl0ZW06c2VjdGlvbnNcblx0XHRcdFx0XHRcdFx0XHQ8VE9DW2RhdGFbc2VjdGlvbl1dIGV4cGFuZGVkPShkYXRhW3NlY3Rpb25dID09IGN1cnIpPlxuXHRcdFx0XHRcdCMgZm9yIGd1aWRlIGluIGRhdGFcblx0XHRcdFx0XHQjXHQ8VE9DW2d1aWRlXSB0b2M9Z3VpZGU6dG9jWzBdIGV4cGFuZGVkPShndWlkZSA9PSBjdXJyKT5cblx0XHRcdDwuYm9keS5saWdodD5cblx0XHRcdFx0aWYgZ3VpZGVcblx0XHRcdFx0XHQ8R3VpZGVAe2d1aWRlOmlkfVtndWlkZV0+XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3ZpZXdzL0d1aWRlc1BhZ2UuaW1iYSIsImltcG9ydCBQYWdlIGZyb20gJy4vUGFnZSdcblxuZGVmIHBhdGhUb0FuY2hvciBwYXRoXG5cdCdhcGktJyArIHBhdGgucmVwbGFjZSgvXFwuL2csJ18nKS5yZXBsYWNlKC9cXCMvZywnX18nKS5yZXBsYWNlKC9cXD0vZywnX3NldCcpXG5cbnRhZyBEZXNjXG5cblx0ZGVmIGh0bWw9IGh0bWxcblx0XHRpZiBodG1sICE9IEBodG1sXG5cdFx0XHRkb206aW5uZXJIVE1MID0gQGh0bWwgPSBodG1sXG5cdFx0c2VsZlxuXG50YWcgUmVmXG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmPlxuXG50YWcgSXRlbVxuXG50YWcgUGF0aCA8IHNwYW5cblx0cHJvcCBzaG9ydFxuXG5cdGRlZiBzZXR1cFxuXHRcdHZhciBpdGVtcyA9IFtdXG5cdFx0dmFyIHN0ciA9IGRhdGFcblx0XHRpZiBzdHIgaXNhIFN0cmluZ1xuXHRcdFx0aWYgc2hvcnRcblx0XHRcdFx0c3RyID0gc3RyLnJlcGxhY2UoLyhbQS1aXVxcdypcXC4pKig/PVtBLVpdKS9nLCcnKVxuXG5cdFx0XHRodG1sID0gc3RyLnJlcGxhY2UoL1xcYihbXFx3XSt8XFwufFxcIylcXGIvZykgZG8gfG0saXxcblx0XHRcdFx0aWYgaSA9PSAnLicgb3IgaSA9PSAnIydcblx0XHRcdFx0XHRcIjxpPntpfTwvaT5cIlxuXHRcdFx0XHRlbGlmIGlbMF0gPT0gaVswXS50b1VwcGVyQ2FzZVxuXHRcdFx0XHRcdFwiPGIgY2xhc3M9J2NvbnN0Jz57aX08L2I+XCJcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFwiPGIgY2xhc3M9J2lkJz57aX08L2I+XCJcblx0XHRzZWxmXG5cblxudGFnIFJldHVyblxuXHRhdHRyIG5hbWVcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGY+XG5cdFx0XHQ8UGF0aFtkYXRhOnZhbHVlXS52YWx1ZT5cblx0XHRcdDxzcGFuLmRlc2M+IGRhdGE6ZGVzY1xuXG50YWcgQ2xhc3MgPCBJdGVtXG5cblx0cHJvcCBkYXRhIHdhdGNoOiA6cGFyc2VcblxuXHRkZWYgcGFyc2Vcblx0XHRAc3RhdGljcyA9IChtIGZvciBtIGluIGRhdGFbJy4nXSB3aGVuIG06ZGVzYylcblx0XHRAbWV0aG9kcyA9IChtIGZvciBtIGluIGRhdGFbJyMnXSB3aGVuIG06ZGVzYylcblx0XHRAcHJvcGVydGllcyA9IFtdXG5cdFx0c2VsZlxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZj5cblx0XHRcdDxzcGFuLnRvYy1hbmNob3IgaWQ9cGF0aFRvQW5jaG9yKGRhdGE6bmFtZXBhdGgpPlxuXHRcdFx0PC5oZWFkZXI+IDwudGl0bGU+IDxQYXRoW2RhdGE6bmFtZXBhdGhdPlxuXHRcdFx0PERlc2MgaHRtbD1kYXRhOmh0bWw+XG5cdFx0XHRpZiBkYXRhOmN0b3Jcblx0XHRcdFx0PC5jb250ZW50LmN0b3I+XG5cdFx0XHRcdFx0PE1ldGhvZFtkYXRhOmN0b3JdIHBhdGg9KGRhdGE6bmFtZXBhdGggKyAnLm5ldycpPlxuXG5cdFx0XHQ8LmNvbnRlbnQ+XG5cdFx0XHRcdGlmIEBzdGF0aWNzOmxlbmd0aCA+IDBcblx0XHRcdFx0XHQ8LnNlY3Rpb24+XG5cdFx0XHRcdFx0XHQ8aDIuaGVhZGVyPiAnU3RhdGljIE1ldGhvZHMnXG5cdFx0XHRcdFx0XHQ8LmNvbnRlbnQubGlzdD4gZm9yIGl0ZW0gaW4gQHN0YXRpY3Ncblx0XHRcdFx0XHRcdFx0PE1ldGhvZFtpdGVtXS5kb2MgaW5hbWU9ZGF0YTpuYW1lcGF0aD5cblxuXHRcdFx0XHRpZiBAbWV0aG9kczpsZW5ndGggPiAwXG5cdFx0XHRcdFx0PC5zZWN0aW9uPlxuXHRcdFx0XHRcdFx0PGgyLmhlYWRlcj4gJ0luc3RhbmNlIE1ldGhvZHMnXG5cdFx0XHRcdFx0XHQ8LmNvbnRlbnQubGlzdD4gZm9yIGl0ZW0gaW4gQG1ldGhvZHNcblx0XHRcdFx0XHRcdFx0PE1ldGhvZFtpdGVtXS5kb2MgaW5hbWU9ZGF0YTppbmFtZT5cblxudGFnIFZhbHVlXG5cblx0ZGVmIHJlbmRlclxuXHRcdGlmIGRhdGE6dHlwZVxuXHRcdFx0PHNlbGYgLntkYXRhOnR5cGV9PlxuXHRcdFx0XHRkYXRhOnZhbHVlXG5cdFx0ZWxpZiBkYXRhIGlzYSBTdHJpbmdcblx0XHRcdDxzZWxmLnN0ciB0ZXh0PWRhdGE+XG5cdFx0ZWxpZiBkYXRhIGlzYSBOdW1iZXJcblx0XHRcdDxzZWxmLm51bSB0ZXh0PWRhdGE+XG5cdFx0c2VsZlxuXHRcdFxuXG50YWcgUGFyYW1cblxuXHRkZWYgdHlwZVxuXHRcdGRhdGE6dHlwZVxuXG5cdGRlZiByZW5kZXJcblx0XHQ8c2VsZiAue3R5cGV9PlxuXHRcdFx0aWYgdHlwZSA9PSAnTmFtZWRQYXJhbXMnXG5cdFx0XHRcdGZvciBwYXJhbSBpbiBkYXRhOm5vZGVzXG5cdFx0XHRcdFx0PFBhcmFtW3BhcmFtXT5cblx0XHRcdGVsc2Vcblx0XHRcdFx0PC5uYW1lPiBkYXRhOm5hbWVcblx0XHRcdFx0aWYgZGF0YTpkZWZhdWx0c1xuXHRcdFx0XHRcdDxpPiB0eXBlID09ICdOYW1lZFBhcmFtJyA/ICc6ICcgOiAnID0gJ1xuXHRcdFx0XHRcdDxWYWx1ZVtkYXRhOmRlZmF1bHRzXT5cblxudGFnIE1ldGhvZCA8IEl0ZW1cblxuXHRwcm9wIGluYW1lXG5cdHByb3AgcGF0aFxuXG5cdGRlZiB0YWdzXG5cdFx0PGRpdkB0YWdzPlxuXHRcdFx0PFJldHVybltkYXRhOnJldHVybl0gbmFtZT0ncmV0dXJucyc+IGlmIGRhdGE6cmV0dXJuXG5cblx0XHRcdGlmIGRhdGE6ZGVwcmVjYXRlZFxuXHRcdFx0XHQ8LmRlcHJlY2F0ZWQucmVkPiAnTWV0aG9kIGlzIGRlcHJlY2F0ZWQnXG5cdFx0XHRpZiBkYXRhOnByaXZhdGVcblx0XHRcdFx0PC5wcml2YXRlLnJlZD4gJ01ldGhvZCBpcyBwcml2YXRlJ1xuXG5cblx0ZGVmIHBhdGhcblx0XHRAcGF0aCBvciAoaW5hbWUgKyAnLicgKyBkYXRhOm5hbWUpXG5cblx0ZGVmIHNsdWdcblx0XHRwYXRoVG9BbmNob3IoZGF0YTpuYW1lcGF0aClcblxuXHRkZWYgcmVuZGVyXG5cdFx0PHNlbGYgLmRlcHJlY2F0ZWQ9KGRhdGE6ZGVwcmVjYXRlZCkgPlxuXHRcdFx0PHNwYW4udG9jLWFuY2hvciBpZD1zbHVnPlxuXHRcdFx0PC5oZWFkZXI+XG5cdFx0XHRcdDxQYXRoW3BhdGhdPlxuXHRcdFx0XHQ8LnBhcmFtcz4gZm9yIHBhcmFtIGluIGRhdGE6cGFyYW1zXG5cdFx0XHRcdFx0PFBhcmFtW3BhcmFtXT5cblx0XHRcdFx0PC5ncm93PlxuXHRcdFx0PERlc2MubWQgaHRtbD1kYXRhOmh0bWw+XG5cdFx0XHR0YWdzXG5cbnRhZyBMaW5rIDwgYVxuXHRwcm9wIHNob3J0XG5cblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmIGhyZWY9XCIvZG9jcyN7cGF0aFRvQW5jaG9yKGRhdGE6bmFtZXBhdGgpfVwiPiA8UGF0aFtkYXRhOm5hbWVwYXRoXSBzaG9ydD1zaG9ydD5cblx0XHRzdXBlclxuXG5cdGRlZiBvbnRhcFxuXHRcdHN1cGVyXG5cdFx0dHJpZ2dlcigncmVmb2N1cycpXG5cbnRhZyBHcm91cFxuXG5cdGRlZiBvbnRhcFxuXHRcdHRvZ2dsZUZsYWcoJ2NvbGxhcHNlZCcpXG5cblxuZXhwb3J0IHRhZyBEb2NzUGFnZSA8IFBhZ2VcblxuXHRwcm9wIHZlcnNpb24gZGVmYXVsdDogJ2N1cnJlbnQnXG5cdHByb3Agcm9vdHNcblxuXHRkZWYgc3JjXG5cdFx0XCIvYXBpL3t2ZXJzaW9ufS5qc29uXCJcblxuXHRkZWYgZG9jc1xuXHRcdEBkb2NzXG5cblx0ZGVmIHNldHVwXG5cdFx0bG9hZFxuXHRcdHN1cGVyXG5cblx0ZGVmIGxvYWRcblx0XHR2YXIgZG9jcyA9IGF3YWl0IGFwcC5mZXRjaChzcmMpXG5cdFx0RE9DUyA9IEBkb2NzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkb2NzKSlcblx0XHRET0NNQVAgPSBAZG9jczplbnRpdGllc1xuXHRcdGdlbmVyYXRlXG5cdFx0aWYgJHdlYiRcblx0XHRcdGxvYWRlZFxuXG5cdGRlZiBsb2FkZWRcblx0XHRyZW5kZXJcblx0XHRpZiBkb2N1bWVudDpsb2NhdGlvbjpoYXNoXG5cdFx0XHRpZiB2YXIgZWwgPSBkb20ucXVlcnlTZWxlY3Rvcihkb2N1bWVudDpsb2NhdGlvbjpoYXNoKVxuXHRcdFx0XHRlbC5zY3JvbGxJbnRvVmlld1xuXHRcdHNlbGZcblx0XHRcblx0ZGVmIG9ucmVmb2N1cyBlXG5cdFx0cmVmb2N1c1xuXG5cdGRlZiByZWZvY3VzXG5cdFx0aWYgdmFyIGVsID0gZG9tLnF1ZXJ5U2VsZWN0b3IoZG9jdW1lbnQ6bG9jYXRpb246aGFzaClcblx0XHRcdGVsLnNjcm9sbEludG9WaWV3XG5cdFx0c2VsZlxuXG5cdGRlZiBsb29rdXAgcGF0aFxuXHRcdGRvY3M6ZW50aXRpZXNbcGF0aF1cblxuXHRkZWYgZ2VuZXJhdGVcblx0XHRAcm9vdHMgPSBbXVxuXHRcdHZhciBlbnRzID0gQGRvY3M6ZW50aXRpZXNcblxuXHRcdGZvciBvd24gcGF0aCxpdGVtIG9mIGRvY3M6ZW50aXRpZXNcblx0XHRcdGlmIGl0ZW06dHlwZSA9PSAnY2xhc3MnIG9yIHBhdGggPT0gJ0ltYmEnXG5cdFx0XHRcdGl0ZW1bJy4nXSA9IChpdGVtWycuJ10gfHwgW10pLnNvcnQubWFwKHxwYXRofCBlbnRzW3BhdGhdICkuZmlsdGVyKHx2fCB2OnR5cGUgPT0gJ21ldGhvZCcgYW5kIHY6ZGVzYyApXG5cdFx0XHRcdGl0ZW1bJyMnXSA9IChpdGVtWycjJ10gfHwgW10pLnNvcnQubWFwKHxwYXRofCBlbnRzW3BhdGhdICkuZmlsdGVyKHx2fCB2OnR5cGUgPT0gJ21ldGhvZCcgYW5kIHY6ZGVzYyApXG5cblx0XHRcdFx0QHJvb3RzLnB1c2goaXRlbSkgaWYgaXRlbTpkZXNjXG5cdFx0c2VsZlxuXG5cdGRlZiByZW5kZXJcblx0XHRyZXR1cm4gc2VsZiB1bmxlc3MgZG9jc1xuXHRcdFxuXHRcdDxzZWxmPlxuXHRcdFx0PG5hdkBuYXY+IDwuY29udGVudD5cblx0XHRcdFx0Zm9yIHJvb3QgaW4gcm9vdHNcblx0XHRcdFx0XHQ8R3JvdXAudG9jLmNsYXNzLnNlY3Rpb24uY29tcGFjdD5cblx0XHRcdFx0XHRcdDwuaGVhZGVyPiA8TGlua1tyb290XS5jbGFzcz5cblx0XHRcdFx0XHRcdDwuY29udGVudD5cblx0XHRcdFx0XHRcdFx0PC5zdGF0aWM+XG5cdFx0XHRcdFx0XHRcdFx0Zm9yIG1ldGggaW4gcm9vdFsnLiddwqB3aGVuIG1ldGg6ZGVzYyBhbmQgIW1ldGg6cHJpdmF0ZVxuXHRcdFx0XHRcdFx0XHRcdFx0PC5lbnRyeT4gPExpbmtbbWV0aF0gc2hvcnQ9eWVzPlxuXHRcdFx0XHRcdFx0XHQ8Lmluc3RhbmNlPlxuXHRcdFx0XHRcdFx0XHRcdGZvciBtZXRoIGluIHJvb3RbJyMnXcKgd2hlbiBtZXRoOmRlc2MgYW5kICFtZXRoOnByaXZhdGVcblx0XHRcdFx0XHRcdFx0XHRcdDwuZW50cnk+IDxMaW5rW21ldGhdIHNob3J0PXllcz5cblx0XHRcdDwuYm9keT5cblx0XHRcdFx0Zm9yIHJvb3QgaW4gcm9vdHNcblx0XHRcdFx0XHQ8Q2xhc3Nbcm9vdF0uZG9jLmw+XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3MvRG9jc1BhZ2UuaW1iYSIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9sZXNzL3NpdGUubGVzc1xuLy8gbW9kdWxlIGlkID0gMjlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IEhvbWVQYWdlIGZyb20gJy4vSG9tZVBhZ2UnXG5pbXBvcnQgR3VpZGVzUGFnZSBmcm9tICcuL0d1aWRlc1BhZ2UnXG5pbXBvcnQgRG9jc1BhZ2UgZnJvbSAnLi9Eb2NzUGFnZSdcbmltcG9ydCBMb2dvIGZyb20gJy4vTG9nbydcblxuZXh0ZW5kIHRhZyBlbGVtZW50XG5cblx0ZGVmIHJvb3Rcblx0XHRAb3duZXJfID8gQG93bmVyXy5yb290IDogc2VsZlxuXG5cdGRlZiBhcHBcblx0XHRyb290LmFwcFxuXG5cbmV4cG9ydCB0YWcgU2l0ZVxuXHRcblx0ZGVmIGFwcFxuXHRcdGRhdGFcblx0XHRcblx0ZGVmIHJvb3Rcblx0XHRzZWxmXG5cdFx0XG5cdGRlZiByb3V0ZXJcblx0XHRhcHAucm91dGVyXG5cdFx0XG5cdGRlZiBsb2FkXG5cdFx0c2VsZlxuXHRcdFx0XG5cdGRlZiB0b2dnbGVNZW51XG5cdFx0ZG9jdW1lbnQ6Ym9keTpjbGFzc0xpc3QudG9nZ2xlKCdtZW51Jylcblx0XHRcblx0ZGVmIHJlbmRlclxuXHRcdDxzZWxmPlxuXHRcdFx0PGhlYWRlciNoZWFkZXI+XG5cdFx0XHRcdDxuYXYuY29udGVudD5cblx0XHRcdFx0XHQ8TG9nbz5cblx0XHRcdFx0XHQ8YS50YWIubG9nbyBocmVmPScvaG9tZSc+IDxpPiAnaW1iYSdcblx0XHRcdFx0XHQ8c3Bhbi5ncmVlZHk+XG5cdFx0XHRcdFx0PGEudGFiLmhvbWUgaHJlZj0nL2hvbWUnPiA8aT4gJ2hvbWUnXG5cdFx0XHRcdFx0PGEudGFiLmd1aWRlcyBocmVmPScvZ3VpZGUnPiA8aT4gJ2xlYXJuJ1xuXHRcdFx0XHRcdDxhLnRhYi5naXR0ZXIgaHJlZj0naHR0cHM6Ly9naXR0ZXIuaW0vc29tZWJlZS9pbWJhJz4gPGk+ICdjb21tdW5pdHknXG5cdFx0XHRcdFx0PGEuZ2l0aHViIGhyZWY9J2h0dHBzOi8vZ2l0aHViLmNvbS9zb21lYmVlL2ltYmEnPiA8aT4gJ2dpdGh1Yidcblx0XHRcdFx0XHQjIDxhLmlzc3VlcyBocmVmPSdodHRwczovL2dpdGh1Yi5jb20vc29tZWJlZS9pbWJhL2lzc3Vlcyc+IDxpPiAnaXNzdWVzJ1xuXHRcdFx0XHRcdDxhLm1lbnUgOnRhcD0ndG9nZ2xlTWVudSc+IDxiPlxuXG5cdFx0XHRpZiByb3V0ZXIuc2NvcGVkKCcvaG9tZScpXG5cdFx0XHRcdDxIb21lUGFnZT5cblx0XHRcdGVsaWYgcm91dGVyLnNjb3BlZCgnL2d1aWRlJylcblx0XHRcdFx0PEd1aWRlc1BhZ2VbYXBwLmd1aWRlXT5cblx0XHRcdGVsaWYgcm91dGVyLnNjb3BlZCgnL2RvY3MnKVxuXHRcdFx0XHQ8RG9jc1BhZ2U+XG5cblx0XHRcdDxmb290ZXIjZm9vdGVyPiBcblx0XHRcdFx0PGhyPlxuXHRcdFx0XHQ8LmxmdD4gXCJJbWJhIMKpIDIwMTUtMjAxOFwiXG5cdFx0XHRcdDwucmd0PlxuXHRcdFx0XHRcdDxhIGhyZWY9J2h0dHA6Ly90d2l0dGVyLmNvbS9pbWJhanMnPiAnVHdpdHRlcidcblx0XHRcdFx0XHQ8YSBocmVmPSdodHRwOi8vZ2l0aHViLmNvbS9zb21lYmVlL2ltYmEnPiAnR2l0SHViJ1xuXHRcdFx0XHRcdDxhIGhyZWY9J2h0dHA6Ly9naXRodWIuY29tL3NvbWViZWUvaW1iYS9pc3N1ZXMnPiAnSXNzdWVzJ1xuXHRcdFx0XHRcdDxhIGhyZWY9J2h0dHA6Ly9naXR0ZXIuaW0vc29tZWJlZS9pbWJhJz4gJ0NoYXQnXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlld3Mvc2l0ZS5pbWJhIl0sInNvdXJjZVJvb3QiOiIifQ==