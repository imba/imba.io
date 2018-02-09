'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function arrayToHash(array) {
    const result = {};
    for (let i = 0; i < array.length; ++i) {
        result[array[i]] = true;
    }
    return result;
}
function createKeywordMatcher(arr, caseInsensitive = false) {
    if (caseInsensitive) {
        arr = arr.map(function (x) { return x.toLowerCase(); });
    }
    const hash = arrayToHash(arr);
    if (caseInsensitive) {
        return function (word) {
            return hash[word.toLowerCase()] !== undefined && hash.hasOwnProperty(word.toLowerCase());
        };
    }
    else {
        return function (word) {
            return hash[word] !== undefined && hash.hasOwnProperty(word);
        };
    }
}

function isFuzzyActionArr(what) {
    return (Array.isArray(what));
}
function isFuzzyAction(what) {
    return !isFuzzyActionArr(what);
}
function isString$1(what) {
    return (typeof what === 'string');
}
function isIAction(what) {
    return !isString$1(what);
}
function empty(s) {
    return (s ? false : true);
}
function fixCase(lexer, str) {
    return (lexer.ignoreCase && str ? str.toLowerCase() : str);
}
function sanitize(s) {
    return s.replace(/[&<>'"_]/g, '-');
}
function log(lexer, msg) {
    console.log(`${lexer.languageId}: ${msg}`);
}
function throwError(lexer, msg) {
    throw new Error(`${lexer.languageId}: ${msg}`);
}
function substituteMatches(lexer, str, id, matches, state) {
    var re = /\$((\$)|(#)|(\d\d?)|[sS](\d\d?)|@(\w+))/g;
    var stateMatches = null;
    return str.replace(re, function (full, sub, dollar, hash, n, s, attr, ofs, total) {
        if (!empty(dollar)) {
            return '$';
        }
        if (!empty(hash)) {
            return fixCase(lexer, id);
        }
        if (!empty(n) && n < matches.length) {
            return fixCase(lexer, matches[n]);
        }
        if (!empty(attr) && lexer && typeof (lexer[attr]) === 'string') {
            return lexer[attr];
        }
        if (stateMatches === null) {
            stateMatches = state.split('.');
            stateMatches.unshift(state);
        }
        if (!empty(s) && s < stateMatches.length) {
            return fixCase(lexer, stateMatches[s]);
        }
        return '';
    });
}
function findRules(lexer, state) {
    while (state && state.length > 0) {
        var rules = lexer.tokenizer[state];
        if (rules) {
            return rules;
        }
        var idx = state.lastIndexOf('.');
        if (idx < 0) {
            state = null;
        }
        else {
            state = state.substr(0, idx);
        }
    }
    return null;
}
function stateExists(lexer, state) {
    while (state && state.length > 0) {
        var exist = lexer.stateNames[state];
        if (exist) {
            return true;
        }
        var idx = state.lastIndexOf('.');
        if (idx < 0) {
            state = null;
        }
        else {
            state = state.substr(0, idx);
        }
    }
    return false;
}

function isArrayOf(elemType, obj) {
    if (!obj) {
        return false;
    }
    if (!(Array.isArray(obj))) {
        return false;
    }
    var idx;
    for (idx in obj) {
        if (obj.hasOwnProperty(idx)) {
            if (!(elemType(obj[idx]))) {
                return false;
            }
        }
    }
    return true;
}
function bool(prop, def, onerr) {
    if (typeof (prop) === 'boolean') {
        return prop;
    }
    if (onerr && (prop || def === undefined)) {
        onerr();
    }
    return (def === undefined ? null : def);
}
function string(prop, def, onerr) {
    if (typeof (prop) === 'string') {
        return prop;
    }
    if (onerr && (prop || def === undefined)) {
        onerr();
    }
    return (def === undefined ? null : def);
}
function compileRegExp(lexer, str) {
    if (typeof (str) !== 'string') {
        return null;
    }
    var n = 0;
    while (str.indexOf('@') >= 0 && n < 5) {
        n++;
        str = str.replace(/@(\w+)/g, function (s, attr) {
            var sub = '';
            if (typeof (lexer[attr]) === 'string') {
                sub = lexer[attr];
            }
            else if (lexer[attr] && lexer[attr] instanceof RegExp) {
                sub = lexer[attr].source;
            }
            else {
                if (lexer[attr] === undefined) {
                    throwError(lexer, 'language definition does not contain attribute \'' + attr + '\', used at: ' + str);
                }
                else {
                    throwError(lexer, 'attribute reference \'' + attr + '\' must be a string, used at: ' + str);
                }
            }
            return (empty(sub) ? '' : '(?:' + sub + ')');
        });
    }
    return new RegExp(str, (lexer.ignoreCase ? 'i' : ''));
}
function selectScrutinee(id, matches, state, num) {
    if (num < 0) {
        return id;
    }
    if (num < matches.length) {
        return matches[num];
    }
    if (num >= 100) {
        num = num - 100;
        var parts = state.split('.');
        parts.unshift(state);
        if (num < parts.length) {
            return parts[num];
        }
    }
    return null;
}
function createGuard(lexer, ruleName, tkey, val) {
    var scrut = -1;
    var oppat = tkey;
    var matches = tkey.match(/^\$(([sS]?)(\d\d?)|#)(.*)$/);
    if (matches) {
        if (matches[3]) {
            scrut = parseInt(matches[3]);
            if (matches[2]) {
                scrut = scrut + 100;
            }
        }
        oppat = matches[4];
    }
    var op = '~';
    var pat = oppat;
    if (!oppat || oppat.length === 0) {
        op = '!=';
        pat = '';
    }
    else if (/^\w*$/.test(pat)) {
        op = '==';
    }
    else {
        matches = oppat.match(/^(@|!@|~|!~|==|!=)(.*)$/);
        if (matches) {
            op = matches[1];
            pat = matches[2];
        }
    }
    var tester;
    if ((op === '~' || op === '!~') && /^(\w|\|)*$/.test(pat)) {
        var inWords = createKeywordMatcher(pat.split('|'), lexer.ignoreCase);
        tester = function (s) { return (op === '~' ? inWords(s) : !inWords(s)); };
    }
    else if (op === '@' || op === '!@') {
        var words = lexer[pat];
        if (!words) {
            throwError(lexer, 'the @ match target \'' + pat + '\' is not defined, in rule: ' + ruleName);
        }
        if (!(isArrayOf(function (elem) { return (typeof (elem) === 'string'); }, words))) {
            throwError(lexer, 'the @ match target \'' + pat + '\' must be an array of strings, in rule: ' + ruleName);
        }
        var inWords = createKeywordMatcher(words, lexer.ignoreCase);
        tester = function (s) { return (op === '@' ? inWords(s) : !inWords(s)); };
    }
    else if (op === '~' || op === '!~') {
        if (pat.indexOf('$') < 0) {
            var re = compileRegExp(lexer, '^' + pat + '$');
            tester = function (s) { return (op === '~' ? re.test(s) : !re.test(s)); };
        }
        else {
            tester = function (s, id, matches, state) {
                var re = compileRegExp(lexer, '^' + substituteMatches(lexer, pat, id, matches, state) + '$');
                return re.test(s);
            };
        }
    }
    else {
        if (pat.indexOf('$') < 0) {
            var patx = fixCase(lexer, pat);
            tester = function (s) { return (op === '==' ? s === patx : s !== patx); };
        }
        else {
            var patx = fixCase(lexer, pat);
            tester = function (s, id, matches, state, eos) {
                var patexp = substituteMatches(lexer, patx, id, matches, state);
                return (op === '==' ? s === patexp : s !== patexp);
            };
        }
    }
    if (scrut === -1) {
        return {
            name: tkey, value: val, test: function (id, matches, state, eos) {
                return tester(id, id, matches, state, eos);
            }
        };
    }
    else {
        return {
            name: tkey, value: val, test: function (id, matches, state, eos) {
                var scrutinee = selectScrutinee(id, matches, state, scrut);
                return tester(!scrutinee ? '' : scrutinee, id, matches, state, eos);
            }
        };
    }
}
function compileAction(lexer, ruleName, action) {
    if (!action) {
        return { token: '' };
    }
    else if (typeof (action) === 'string') {
        return action;
    }
    else if (action.token || action.token === '') {
        if (typeof (action.token) !== 'string') {
            throwError(lexer, 'a \'token\' attribute must be of type string, in rule: ' + ruleName);
            return { token: '' };
        }
        else {
            var newAction = { token: action.token };
            if (action.token.indexOf('$') >= 0) {
                newAction.tokenSubst = true;
            }
            if (typeof (action.bracket) === 'string') {
                if (action.bracket === '@open') {
                    newAction.bracket = 1;
                }
                else if (action.bracket === '@close') {
                    newAction.bracket = -1;
                }
                else {
                    throwError(lexer, 'a \'bracket\' attribute must be either \'@open\' or \'@close\', in rule: ' + ruleName);
                }
            }
            if (action.next) {
                if (typeof (action.next) !== 'string') {
                    throwError(lexer, 'the next state must be a string value in rule: ' + ruleName);
                }
                else {
                    var next = action.next;
                    if (!/^(@pop|@push|@popall)$/.test(next)) {
                        if (next[0] === '@') {
                            next = next.substr(1);
                        }
                        if (next.indexOf('$') < 0) {
                            if (!stateExists(lexer, substituteMatches(lexer, next, '', [], ''))) {
                                throwError(lexer, 'the next state \'' + action.next + '\' is not defined in rule: ' + ruleName);
                            }
                        }
                    }
                    newAction.next = next;
                }
            }
            if (typeof (action.goBack) === 'number') {
                newAction.goBack = action.goBack;
            }
            if (typeof (action.switchTo) === 'string') {
                newAction.switchTo = action.switchTo;
            }
            if (typeof (action.log) === 'string') {
                newAction.log = action.log;
            }
            if (typeof (action.nextEmbedded) === 'string') {
                newAction.nextEmbedded = action.nextEmbedded;
                lexer.usesEmbedded = true;
            }
            return newAction;
        }
    }
    else if (Array.isArray(action)) {
        var results = [];
        var idx;
        for (idx in action) {
            if (action.hasOwnProperty(idx)) {
                results[idx] = compileAction(lexer, ruleName, action[idx]);
            }
        }
        return { group: results };
    }
    else if (action.cases) {
        var cases = [];
        var tkey;
        for (tkey in action.cases) {
            if (action.cases.hasOwnProperty(tkey)) {
                var val = compileAction(lexer, ruleName, action.cases[tkey]);
                if (tkey === '@default' || tkey === '@' || tkey === '') {
                    cases.push({ test: null, value: val, name: tkey });
                }
                else if (tkey === '@eos') {
                    cases.push({ test: function (id, matches, state, eos) { return eos; }, value: val, name: tkey });
                }
                else {
                    cases.push(createGuard(lexer, ruleName, tkey, val));
                }
            }
        }
        var def = lexer.defaultToken;
        return {
            test: function (id, matches, state, eos) {
                var idx;
                for (idx in cases) {
                    if (cases.hasOwnProperty(idx)) {
                        var didmatch = (!cases[idx].test || cases[idx].test(id, matches, state, eos));
                        if (didmatch) {
                            return cases[idx].value;
                        }
                    }
                }
                return def;
            }
        };
    }
    else {
        throwError(lexer, 'an action must be a string, an object with a \'token\' or \'cases\' attribute, or an array of actions; in rule: ' + ruleName);
        return '';
    }
}
class Rule {
    constructor(name) {
        this.regex = new RegExp('');
        this.action = { token: '' };
        this.matchOnlyAtLineStart = false;
        this.name = '';
        this.name = name;
    }
    setRegex(lexer, re) {
        var sregex;
        if (typeof (re) === 'string') {
            sregex = re;
        }
        else if (re instanceof RegExp) {
            sregex = re.source;
        }
        else {
            throwError(lexer, 'rules must start with a match string or regular expression: ' + this.name);
        }
        this.matchOnlyAtLineStart = (sregex.length > 0 && sregex[0] === '^');
        this.name = this.name + ': ' + sregex;
        this.regex = compileRegExp(lexer, '^(?:' + (this.matchOnlyAtLineStart ? sregex.substr(1) : sregex) + ')');
    }
    setAction(lexer, act) {
        this.action = compileAction(lexer, this.name, act);
    }
}
function compile(languageId, json) {
    if (!json || typeof (json) !== 'object') {
        throw new Error('Monarch: expecting a language definition object');
    }
    var lexer = {};
    lexer.languageId = languageId;
    lexer.noThrow = false;
    lexer.maxStack = 100;
    lexer.start = string(json.start);
    lexer.ignoreCase = bool(json.ignoreCase, false);
    lexer.tokenPostfix = string(json.tokenPostfix, '.' + lexer.languageId);
    lexer.defaultToken = string(json.defaultToken, 'source', function () { throwError(lexer, 'the \'defaultToken\' must be a string'); });
    lexer.usesEmbedded = false;
    var lexerMin = json;
    lexerMin.languageId = languageId;
    lexerMin.ignoreCase = lexer.ignoreCase;
    lexerMin.noThrow = lexer.noThrow;
    lexerMin.usesEmbedded = lexer.usesEmbedded;
    lexerMin.stateNames = json.tokenizer;
    lexerMin.defaultToken = lexer.defaultToken;
    function addRules(state, newrules, rules) {
        var idx;
        for (idx in rules) {
            if (rules.hasOwnProperty(idx)) {
                var rule = rules[idx];
                var include = rule.include;
                if (include) {
                    if (typeof (include) !== 'string') {
                        throwError(lexer, 'an \'include\' attribute must be a string at: ' + state);
                    }
                    if (include[0] === '@') {
                        include = include.substr(1);
                    }
                    if (!json.tokenizer[include]) {
                        throwError(lexer, 'include target \'' + include + '\' is not defined at: ' + state);
                    }
                    addRules(state + '.' + include, newrules, json.tokenizer[include]);
                }
                else {
                    var newrule = new Rule(state);
                    if (Array.isArray(rule) && rule.length >= 1 && rule.length <= 3) {
                        newrule.setRegex(lexerMin, rule[0]);
                        if (rule.length >= 3) {
                            if (typeof (rule[1]) === 'string') {
                                newrule.setAction(lexerMin, { token: rule[1], next: rule[2] });
                            }
                            else if (typeof (rule[1]) === 'object') {
                                var rule1 = rule[1];
                                rule1.next = rule[2];
                                newrule.setAction(lexerMin, rule1);
                            }
                            else {
                                throwError(lexer, 'a next state as the last element of a rule can only be given if the action is either an object or a string, at: ' + state);
                            }
                        }
                        else {
                            newrule.setAction(lexerMin, rule[1]);
                        }
                    }
                    else {
                        if (!rule.regex) {
                            throwError(lexer, 'a rule must either be an array, or an object with a \'regex\' or \'include\' field at: ' + state);
                        }
                        if (rule.name) {
                            newrule.name = string(rule.name);
                        }
                        if (rule.matchOnlyAtStart) {
                            newrule.matchOnlyAtLineStart = bool(rule.matchOnlyAtLineStart);
                        }
                        newrule.setRegex(lexerMin, rule.regex);
                        newrule.setAction(lexerMin, rule.action);
                    }
                    newrules.push(newrule);
                }
            }
        }
    }
    if (!json.tokenizer || typeof (json.tokenizer) !== 'object') {
        throwError(lexer, 'a language definition must define the \'tokenizer\' attribute as an object');
    }
    lexer.tokenizer = [];
    var key;
    for (key in json.tokenizer) {
        if (json.tokenizer.hasOwnProperty(key)) {
            if (!lexer.start) {
                lexer.start = key;
            }
            var rules = json.tokenizer[key];
            lexer.tokenizer[key] = new Array();
            addRules('tokenizer.' + key, lexer.tokenizer[key], rules);
        }
    }
    lexer.usesEmbedded = lexerMin.usesEmbedded;
    if (json.brackets) {
        if (!(Array.isArray(json.brackets))) {
            throwError(lexer, 'the \'brackets\' attribute must be defined as an array');
        }
    }
    else {
        json.brackets = [
            { open: '{', close: '}', token: 'delimiter.curly' },
            { open: '[', close: ']', token: 'delimiter.square' },
            { open: '(', close: ')', token: 'delimiter.parenthesis' },
            { open: '<', close: '>', token: 'delimiter.angle' }
        ];
    }
    var brackets = [];
    for (var bracketIdx in json.brackets) {
        if (json.brackets.hasOwnProperty(bracketIdx)) {
            var desc = json.brackets[bracketIdx];
            if (desc && Array.isArray(desc) && desc.length === 3) {
                desc = { token: desc[2], open: desc[0], close: desc[1] };
            }
            if (desc.open === desc.close) {
                throwError(lexer, 'open and close brackets in a \'brackets\' attribute must be different: ' + desc.open +
                    '\n hint: use the \'bracket\' attribute if matching on equal brackets is required.');
            }
            if (typeof (desc.open) === 'string' && typeof (desc.token) === 'string') {
                brackets.push({
                    token: string(desc.token) + lexer.tokenPostfix,
                    open: fixCase(lexer, string(desc.open)),
                    close: fixCase(lexer, string(desc.close))
                });
            }
            else {
                throwError(lexer, 'every element in the \'brackets\' array must be a \'{open,close,token}\' object or array');
            }
        }
    }
    lexer.brackets = brackets;
    lexer.noThrow = true;
    return lexer;
}

const empty$1 = Object.freeze({
    dispose() { }
});

let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;
let _isRootUser = false;
let _isNative = false;
let _locale = undefined;

if (typeof process === 'object') {
    _isWindows = (process.platform === 'win32');
    _isMacintosh = (process.platform === 'darwin');
    _isLinux = (process.platform === 'linux');
    _isRootUser = !_isWindows && (process.getuid() === 0);
    let rawNlsConfig = process.env['VSCODE_NLS_CONFIG'];
    if (rawNlsConfig) {
        try {
            let nlsConfig = JSON.parse(rawNlsConfig);
            let resolved = nlsConfig.availableLanguages['*'];
            _locale = nlsConfig.locale;
            
        }
        catch (e) {
        }
    }
    _isNative = true;
}
else if (typeof navigator === 'object') {
    let userAgent = navigator.userAgent;
    _isWindows = userAgent.indexOf('Windows') >= 0;
    _isMacintosh = userAgent.indexOf('Macintosh') >= 0;
    _isLinux = userAgent.indexOf('Linux') >= 0;
    _locale = navigator.language;
    
}
var Platform;
(function (Platform) {
    Platform[Platform["Web"] = 0] = "Web";
    Platform[Platform["Mac"] = 1] = "Mac";
    Platform[Platform["Linux"] = 2] = "Linux";
    Platform[Platform["Windows"] = 3] = "Windows";
})(Platform || (Platform = {}));
let _platform = Platform.Web;
if (_isNative) {
    if (_isMacintosh) {
        _platform = Platform.Mac;
    }
    else if (_isWindows) {
        _platform = Platform.Windows;
    }
    else if (_isLinux) {
        _platform = Platform.Linux;
    }
}









const _globals = (typeof self === 'object' ? self : global);


const setTimeout$1 = _globals.setTimeout.bind(_globals);
const clearTimeout$1 = _globals.clearTimeout.bind(_globals);
const setInterval = _globals.setInterval.bind(_globals);
const clearInterval = _globals.clearInterval.bind(_globals);

/**
 * Extracted from https://github.com/winjs/winjs
 * Version: 4.4.0(ec3258a9f3a36805a187848984e3bb938044178d)
 * Copyright (c) Microsoft Corporation.
 * All Rights Reserved.
 * Licensed under the MIT License.
 */
var win = (function() {

	var _modules = {};
	_modules["WinJS/Core/_WinJS"] = {};

	var _winjs = function(moduleId, deps, factory) {
		var exports = {};
		var exportsPassedIn = false;

		var depsValues = deps.map(function(dep) {
			if (dep === 'exports') {
				exportsPassedIn = true;
				return exports;
			}
			return _modules[dep];
		});

		var result = factory.apply({}, depsValues);

		_modules[moduleId] = exportsPassedIn ? exports : result;
	};


	_winjs("WinJS/Core/_Global", [], function () {
		var globalObject =
			typeof window !== 'undefined' ? window :
			typeof self !== 'undefined' ? self :
			typeof global !== 'undefined' ? global :
			{};
		return globalObject;
	});

	_winjs("WinJS/Core/_BaseCoreUtils", ["WinJS/Core/_Global"], function baseCoreUtilsInit(_Global) {
		var hasWinRT = !!_Global.Windows;

		function markSupportedForProcessing(func) {
			/// <signature helpKeyword="WinJS.Utilities.markSupportedForProcessing">
			/// <summary locid="WinJS.Utilities.markSupportedForProcessing">
			/// Marks a function as being compatible with declarative processing, such as WinJS.UI.processAll
			/// or WinJS.Binding.processAll.
			/// </summary>
			/// <param name="func" type="Function" locid="WinJS.Utilities.markSupportedForProcessing_p:func">
			/// The function to be marked as compatible with declarative processing.
			/// </param>
			/// <returns type="Function" locid="WinJS.Utilities.markSupportedForProcessing_returnValue">
			/// The input function.
			/// </returns>
			/// </signature>
			func.supportedForProcessing = true;
			return func;
		}

		return {
			hasWinRT: hasWinRT,
			markSupportedForProcessing: markSupportedForProcessing,
			_setImmediate: _Global.setImmediate ? _Global.setImmediate.bind(_Global) : function (handler) {
				_Global.setTimeout(handler, 0);
			}
		};
	});
	_winjs("WinJS/Core/_WriteProfilerMark", ["WinJS/Core/_Global"], function profilerInit(_Global) {
		return _Global.msWriteProfilerMark || function () { };
	});
	_winjs("WinJS/Core/_Base", ["WinJS/Core/_WinJS","WinJS/Core/_Global","WinJS/Core/_BaseCoreUtils","WinJS/Core/_WriteProfilerMark"], function baseInit(_WinJS, _Global, _BaseCoreUtils, _WriteProfilerMark) {
		function initializeProperties(target, members, prefix) {
			var keys = Object.keys(members);
			var isArray = Array.isArray(target);
			var properties;
			var i, len;
			for (i = 0, len = keys.length; i < len; i++) {
				var key = keys[i];
				var enumerable = key.charCodeAt(0) !== /*_*/95;
				var member = members[key];
				if (member && typeof member === 'object') {
					if (member.value !== undefined || typeof member.get === 'function' || typeof member.set === 'function') {
						if (member.enumerable === undefined) {
							member.enumerable = enumerable;
						}
						if (prefix && member.setName && typeof member.setName === 'function') {
							member.setName(prefix + "." + key);
						}
						properties = properties || {};
						properties[key] = member;
						continue;
					}
				}
				if (!enumerable) {
					properties = properties || {};
					properties[key] = { value: member, enumerable: enumerable, configurable: true, writable: true };
					continue;
				}
				if (isArray) {
					target.forEach(function (target) {
						target[key] = member;
					});
				} else {
					target[key] = member;
				}
			}
			if (properties) {
				if (isArray) {
					target.forEach(function (target) {
						Object.defineProperties(target, properties);
					});
				} else {
					Object.defineProperties(target, properties);
				}
			}
		}

		(function () {

			var _rootNamespace = _WinJS;
			if (!_rootNamespace.Namespace) {
				_rootNamespace.Namespace = Object.create(Object.prototype);
			}

			function createNamespace(parentNamespace, name) {
				var currentNamespace = parentNamespace || {};
				if (name) {
					var namespaceFragments = name.split(".");
					if (currentNamespace === _Global && namespaceFragments[0] === "WinJS") {
						currentNamespace = _WinJS;
						namespaceFragments.splice(0, 1);
					}
					for (var i = 0, len = namespaceFragments.length; i < len; i++) {
						var namespaceName = namespaceFragments[i];
						if (!currentNamespace[namespaceName]) {
							Object.defineProperty(currentNamespace, namespaceName,
								{ value: {}, writable: false, enumerable: true, configurable: true }
							);
						}
						currentNamespace = currentNamespace[namespaceName];
					}
				}
				return currentNamespace;
			}

			function defineWithParent(parentNamespace, name, members) {
				/// <signature helpKeyword="WinJS.Namespace.defineWithParent">
				/// <summary locid="WinJS.Namespace.defineWithParent">
				/// Defines a new namespace with the specified name under the specified parent namespace.
				/// </summary>
				/// <param name="parentNamespace" type="Object" locid="WinJS.Namespace.defineWithParent_p:parentNamespace">
				/// The parent namespace.
				/// </param>
				/// <param name="name" type="String" locid="WinJS.Namespace.defineWithParent_p:name">
				/// The name of the new namespace.
				/// </param>
				/// <param name="members" type="Object" locid="WinJS.Namespace.defineWithParent_p:members">
				/// The members of the new namespace.
				/// </param>
				/// <returns type="Object" locid="WinJS.Namespace.defineWithParent_returnValue">
				/// The newly-defined namespace.
				/// </returns>
				/// </signature>
				var currentNamespace = createNamespace(parentNamespace, name);

				if (members) {
					initializeProperties(currentNamespace, members, name || "<ANONYMOUS>");
				}

				return currentNamespace;
			}

			function define(name, members) {
				/// <signature helpKeyword="WinJS.Namespace.define">
				/// <summary locid="WinJS.Namespace.define">
				/// Defines a new namespace with the specified name.
				/// </summary>
				/// <param name="name" type="String" locid="WinJS.Namespace.define_p:name">
				/// The name of the namespace. This could be a dot-separated name for nested namespaces.
				/// </param>
				/// <param name="members" type="Object" locid="WinJS.Namespace.define_p:members">
				/// The members of the new namespace.
				/// </param>
				/// <returns type="Object" locid="WinJS.Namespace.define_returnValue">
				/// The newly-defined namespace.
				/// </returns>
				/// </signature>
				return defineWithParent(_Global, name, members);
			}

			var LazyStates = {
				uninitialized: 1,
				working: 2,
				initialized: 3,
			};

			function lazy(f) {
				var name;
				var state = LazyStates.uninitialized;
				var result;
				return {
					setName: function (value) {
						name = value;
					},
					get: function () {
						switch (state) {
							case LazyStates.initialized:
								return result;

							case LazyStates.uninitialized:
								state = LazyStates.working;
								try {
									_WriteProfilerMark("WinJS.Namespace._lazy:" + name + ",StartTM");
									result = f();
								} finally {
									_WriteProfilerMark("WinJS.Namespace._lazy:" + name + ",StopTM");
									state = LazyStates.uninitialized;
								}
								f = null;
								state = LazyStates.initialized;
								return result;

							case LazyStates.working:
								throw "Illegal: reentrancy on initialization";

							default:
								throw "Illegal";
						}
					},
					set: function (value) {
						switch (state) {
							case LazyStates.working:
								throw "Illegal: reentrancy on initialization";

							default:
								state = LazyStates.initialized;
								result = value;
								break;
						}
					},
					enumerable: true,
					configurable: true,
				};
			}

			// helper for defining AMD module members
			function moduleDefine(exports, name, members) {
				var target = [exports];
				var publicNS = null;
				if (name) {
					publicNS = createNamespace(_Global, name);
					target.push(publicNS);
				}
				initializeProperties(target, members, name || "<ANONYMOUS>");
				return publicNS;
			}

			// Establish members of the "WinJS.Namespace" namespace
			Object.defineProperties(_rootNamespace.Namespace, {

				defineWithParent: { value: defineWithParent, writable: true, enumerable: true, configurable: true },

				define: { value: define, writable: true, enumerable: true, configurable: true },

				_lazy: { value: lazy, writable: true, enumerable: true, configurable: true },

				_moduleDefine: { value: moduleDefine, writable: true, enumerable: true, configurable: true }

			});

		})();

		(function () {

			function define(constructor, instanceMembers, staticMembers) {
				/// <signature helpKeyword="WinJS.Class.define">
				/// <summary locid="WinJS.Class.define">
				/// Defines a class using the given constructor and the specified instance members.
				/// </summary>
				/// <param name="constructor" type="Function" locid="WinJS.Class.define_p:constructor">
				/// A constructor function that is used to instantiate this class.
				/// </param>
				/// <param name="instanceMembers" type="Object" locid="WinJS.Class.define_p:instanceMembers">
				/// The set of instance fields, properties, and methods made available on the class.
				/// </param>
				/// <param name="staticMembers" type="Object" locid="WinJS.Class.define_p:staticMembers">
				/// The set of static fields, properties, and methods made available on the class.
				/// </param>
				/// <returns type="Function" locid="WinJS.Class.define_returnValue">
				/// The newly-defined class.
				/// </returns>
				/// </signature>
				constructor = constructor || function () { };
				_BaseCoreUtils.markSupportedForProcessing(constructor);
				if (instanceMembers) {
					initializeProperties(constructor.prototype, instanceMembers);
				}
				if (staticMembers) {
					initializeProperties(constructor, staticMembers);
				}
				return constructor;
			}

			function derive(baseClass, constructor, instanceMembers, staticMembers) {
				/// <signature helpKeyword="WinJS.Class.derive">
				/// <summary locid="WinJS.Class.derive">
				/// Creates a sub-class based on the supplied baseClass parameter, using prototypal inheritance.
				/// </summary>
				/// <param name="baseClass" type="Function" locid="WinJS.Class.derive_p:baseClass">
				/// The class to inherit from.
				/// </param>
				/// <param name="constructor" type="Function" locid="WinJS.Class.derive_p:constructor">
				/// A constructor function that is used to instantiate this class.
				/// </param>
				/// <param name="instanceMembers" type="Object" locid="WinJS.Class.derive_p:instanceMembers">
				/// The set of instance fields, properties, and methods to be made available on the class.
				/// </param>
				/// <param name="staticMembers" type="Object" locid="WinJS.Class.derive_p:staticMembers">
				/// The set of static fields, properties, and methods to be made available on the class.
				/// </param>
				/// <returns type="Function" locid="WinJS.Class.derive_returnValue">
				/// The newly-defined class.
				/// </returns>
				/// </signature>
				if (baseClass) {
					constructor = constructor || function () { };
					var basePrototype = baseClass.prototype;
					constructor.prototype = Object.create(basePrototype);
					_BaseCoreUtils.markSupportedForProcessing(constructor);
					Object.defineProperty(constructor.prototype, "constructor", { value: constructor, writable: true, configurable: true, enumerable: true });
					if (instanceMembers) {
						initializeProperties(constructor.prototype, instanceMembers);
					}
					if (staticMembers) {
						initializeProperties(constructor, staticMembers);
					}
					return constructor;
				} else {
					return define(constructor, instanceMembers, staticMembers);
				}
			}

			function mix(constructor) {
				/// <signature helpKeyword="WinJS.Class.mix">
				/// <summary locid="WinJS.Class.mix">
				/// Defines a class using the given constructor and the union of the set of instance members
				/// specified by all the mixin objects. The mixin parameter list is of variable length.
				/// </summary>
				/// <param name="constructor" locid="WinJS.Class.mix_p:constructor">
				/// A constructor function that is used to instantiate this class.
				/// </param>
				/// <returns type="Function" locid="WinJS.Class.mix_returnValue">
				/// The newly-defined class.
				/// </returns>
				/// </signature>
				constructor = constructor || function () { };
				var i, len;
				for (i = 1, len = arguments.length; i < len; i++) {
					initializeProperties(constructor.prototype, arguments[i]);
				}
				return constructor;
			}

			// Establish members of "WinJS.Class" namespace
			_WinJS.Namespace.define("WinJS.Class", {
				define: define,
				derive: derive,
				mix: mix
			});

		})();

		return {
			Namespace: _WinJS.Namespace,
			Class: _WinJS.Class
		};

	});
	_winjs("WinJS/Core/_ErrorFromName", ["WinJS/Core/_Base"], function errorsInit(_Base) {
		var ErrorFromName = _Base.Class.derive(Error, function (name, message) {
			/// <signature helpKeyword="WinJS.ErrorFromName">
			/// <summary locid="WinJS.ErrorFromName">
			/// Creates an Error object with the specified name and message properties.
			/// </summary>
			/// <param name="name" type="String" locid="WinJS.ErrorFromName_p:name">The name of this error. The name is meant to be consumed programmatically and should not be localized.</param>
			/// <param name="message" type="String" optional="true" locid="WinJS.ErrorFromName_p:message">The message for this error. The message is meant to be consumed by humans and should be localized.</param>
			/// <returns type="Error" locid="WinJS.ErrorFromName_returnValue">Error instance with .name and .message properties populated</returns>
			/// </signature>
			this.name = name;
			this.message = message || name;
		}, {
			/* empty */
		}, {
			supportedForProcessing: false,
		});

		_Base.Namespace.define("WinJS", {
			// ErrorFromName establishes a simple pattern for returning error codes.
			//
			ErrorFromName: ErrorFromName
		});

		return ErrorFromName;

	});


	_winjs("WinJS/Core/_Events", ["exports","WinJS/Core/_Base"], function eventsInit(exports, _Base) {
		function createEventProperty(name) {
			var eventPropStateName = "_on" + name + "state";

			return {
				get: function () {
					var state = this[eventPropStateName];
					return state && state.userHandler;
				},
				set: function (handler) {
					var state = this[eventPropStateName];
					if (handler) {
						if (!state) {
							state = { wrapper: function (evt) { return state.userHandler(evt); }, userHandler: handler };
							Object.defineProperty(this, eventPropStateName, { value: state, enumerable: false, writable:true, configurable: true });
							this.addEventListener(name, state.wrapper, false);
						}
						state.userHandler = handler;
					} else if (state) {
						this.removeEventListener(name, state.wrapper, false);
						this[eventPropStateName] = null;
					}
				},
				enumerable: true
			};
		}

		function createEventProperties() {
			/// <signature helpKeyword="WinJS.Utilities.createEventProperties">
			/// <summary locid="WinJS.Utilities.createEventProperties">
			/// Creates an object that has one property for each name passed to the function.
			/// </summary>
			/// <param name="events" locid="WinJS.Utilities.createEventProperties_p:events">
			/// A variable list of property names.
			/// </param>
			/// <returns type="Object" locid="WinJS.Utilities.createEventProperties_returnValue">
			/// The object with the specified properties. The names of the properties are prefixed with 'on'.
			/// </returns>
			/// </signature>
			var props = {};
			for (var i = 0, len = arguments.length; i < len; i++) {
				var name = arguments[i];
				props["on" + name] = createEventProperty(name);
			}
			return props;
		}

		var EventMixinEvent = _Base.Class.define(
			function EventMixinEvent_ctor(type, detail, target) {
				this.detail = detail;
				this.target = target;
				this.timeStamp = Date.now();
				this.type = type;
			},
			{
				bubbles: { value: false, writable: false },
				cancelable: { value: false, writable: false },
				currentTarget: {
					get: function () { return this.target; }
				},
				defaultPrevented: {
					get: function () { return this._preventDefaultCalled; }
				},
				trusted: { value: false, writable: false },
				eventPhase: { value: 0, writable: false },
				target: null,
				timeStamp: null,
				type: null,

				preventDefault: function () {
					this._preventDefaultCalled = true;
				},
				stopImmediatePropagation: function () {
					this._stopImmediatePropagationCalled = true;
				},
				stopPropagation: function () {
				}
			}, {
				supportedForProcessing: false,
			}
		);

		var eventMixin = {
			_listeners: null,

			addEventListener: function (type, listener, useCapture) {
				/// <signature helpKeyword="WinJS.Utilities.eventMixin.addEventListener">
				/// <summary locid="WinJS.Utilities.eventMixin.addEventListener">
				/// Adds an event listener to the control.
				/// </summary>
				/// <param name="type" locid="WinJS.Utilities.eventMixin.addEventListener_p:type">
				/// The type (name) of the event.
				/// </param>
				/// <param name="listener" locid="WinJS.Utilities.eventMixin.addEventListener_p:listener">
				/// The listener to invoke when the event is raised.
				/// </param>
				/// <param name="useCapture" locid="WinJS.Utilities.eventMixin.addEventListener_p:useCapture">
				/// if true initiates capture, otherwise false.
				/// </param>
				/// </signature>
				useCapture = useCapture || false;
				this._listeners = this._listeners || {};
				var eventListeners = (this._listeners[type] = this._listeners[type] || []);
				for (var i = 0, len = eventListeners.length; i < len; i++) {
					var l = eventListeners[i];
					if (l.useCapture === useCapture && l.listener === listener) {
						return;
					}
				}
				eventListeners.push({ listener: listener, useCapture: useCapture });
			},
			dispatchEvent: function (type, details) {
				/// <signature helpKeyword="WinJS.Utilities.eventMixin.dispatchEvent">
				/// <summary locid="WinJS.Utilities.eventMixin.dispatchEvent">
				/// Raises an event of the specified type and with the specified additional properties.
				/// </summary>
				/// <param name="type" locid="WinJS.Utilities.eventMixin.dispatchEvent_p:type">
				/// The type (name) of the event.
				/// </param>
				/// <param name="details" locid="WinJS.Utilities.eventMixin.dispatchEvent_p:details">
				/// The set of additional properties to be attached to the event object when the event is raised.
				/// </param>
				/// <returns type="Boolean" locid="WinJS.Utilities.eventMixin.dispatchEvent_returnValue">
				/// true if preventDefault was called on the event.
				/// </returns>
				/// </signature>
				var listeners = this._listeners && this._listeners[type];
				if (listeners) {
					var eventValue = new EventMixinEvent(type, details, this);
					// Need to copy the array to protect against people unregistering while we are dispatching
					listeners = listeners.slice(0, listeners.length);
					for (var i = 0, len = listeners.length; i < len && !eventValue._stopImmediatePropagationCalled; i++) {
						listeners[i].listener(eventValue);
					}
					return eventValue.defaultPrevented || false;
				}
				return false;
			},
			removeEventListener: function (type, listener, useCapture) {
				/// <signature helpKeyword="WinJS.Utilities.eventMixin.removeEventListener">
				/// <summary locid="WinJS.Utilities.eventMixin.removeEventListener">
				/// Removes an event listener from the control.
				/// </summary>
				/// <param name="type" locid="WinJS.Utilities.eventMixin.removeEventListener_p:type">
				/// The type (name) of the event.
				/// </param>
				/// <param name="listener" locid="WinJS.Utilities.eventMixin.removeEventListener_p:listener">
				/// The listener to remove.
				/// </param>
				/// <param name="useCapture" locid="WinJS.Utilities.eventMixin.removeEventListener_p:useCapture">
				/// Specifies whether to initiate capture.
				/// </param>
				/// </signature>
				useCapture = useCapture || false;
				var listeners = this._listeners && this._listeners[type];
				if (listeners) {
					for (var i = 0, len = listeners.length; i < len; i++) {
						var l = listeners[i];
						if (l.listener === listener && l.useCapture === useCapture) {
							listeners.splice(i, 1);
							if (listeners.length === 0) {
								delete this._listeners[type];
							}
							// Only want to remove one element for each call to removeEventListener
							break;
						}
					}
				}
			}
		};

		_Base.Namespace._moduleDefine(exports, "WinJS.Utilities", {
			_createEventProperty: createEventProperty,
			createEventProperties: createEventProperties,
			eventMixin: eventMixin
		});

	});


	_winjs("WinJS/Core/_Trace", ["WinJS/Core/_Global"], function traceInit(_Global) {
		function nop(v) {
			return v;
		}

		return {
			_traceAsyncOperationStarting: (_Global.Debug && _Global.Debug.msTraceAsyncOperationStarting && _Global.Debug.msTraceAsyncOperationStarting.bind(_Global.Debug)) || nop,
			_traceAsyncOperationCompleted: (_Global.Debug && _Global.Debug.msTraceAsyncOperationCompleted && _Global.Debug.msTraceAsyncOperationCompleted.bind(_Global.Debug)) || nop,
			_traceAsyncCallbackStarting: (_Global.Debug && _Global.Debug.msTraceAsyncCallbackStarting && _Global.Debug.msTraceAsyncCallbackStarting.bind(_Global.Debug)) || nop,
			_traceAsyncCallbackCompleted: (_Global.Debug && _Global.Debug.msTraceAsyncCallbackCompleted && _Global.Debug.msTraceAsyncCallbackCompleted.bind(_Global.Debug)) || nop
		};
	});
	_winjs("WinJS/Promise/_StateMachine", ["WinJS/Core/_Global","WinJS/Core/_BaseCoreUtils","WinJS/Core/_Base","WinJS/Core/_ErrorFromName","WinJS/Core/_Events","WinJS/Core/_Trace"], function promiseStateMachineInit(_Global, _BaseCoreUtils, _Base, _ErrorFromName, _Events, _Trace) {
		_Global.Debug && (_Global.Debug.setNonUserCodeExceptions = true);

		var ListenerType = _Base.Class.mix(_Base.Class.define(null, { /*empty*/ }, { supportedForProcessing: false }), _Events.eventMixin);
		var promiseEventListeners = new ListenerType();
		// make sure there is a listeners collection so that we can do a more trivial check below
		promiseEventListeners._listeners = {};
		var errorET = "error";
		var canceledName = "Canceled";
		var tagWithStack = false;
		var tag = {
			promise: 0x01,
			thenPromise: 0x02,
			errorPromise: 0x04,
			exceptionPromise: 0x08,
			completePromise: 0x10,
		};
		tag.all = tag.promise | tag.thenPromise | tag.errorPromise | tag.exceptionPromise | tag.completePromise;

		//
		// Global error counter, for each error which enters the system we increment this once and then
		// the error number travels with the error as it traverses the tree of potential handlers.
		//
		// When someone has registered to be told about errors (WinJS.Promise.callonerror) promises
		// which are in error will get tagged with a ._errorId field. This tagged field is the
		// contract by which nested promises with errors will be identified as chaining for the
		// purposes of the callonerror semantics. If a nested promise in error is encountered without
		// a ._errorId it will be assumed to be foreign and treated as an interop boundary and
		// a new error id will be minted.
		//
		var error_number = 1;

		//
		// The state machine has a interesting hiccup in it with regards to notification, in order
		// to flatten out notification and avoid recursion for synchronous completion we have an
		// explicit set of *_notify states which are responsible for notifying their entire tree
		// of children. They can do this because they know that immediate children are always
		// ThenPromise instances and we can therefore reach into their state to access the
		// _listeners collection.
		//
		// So, what happens is that a Promise will be fulfilled through the _completed or _error
		// messages at which point it will enter a *_notify state and be responsible for to move
		// its children into an (as appropriate) success or error state and also notify that child's
		// listeners of the state transition, until leaf notes are reached.
		//

		var state_created,              // -> working
			state_working,              // -> error | error_notify | success | success_notify | canceled | waiting
			state_waiting,              // -> error | error_notify | success | success_notify | waiting_canceled
			state_waiting_canceled,     // -> error | error_notify | success | success_notify | canceling
			state_canceled,             // -> error | error_notify | success | success_notify | canceling
			state_canceling,            // -> error_notify
			state_success_notify,       // -> success
			state_success,              // -> .
			state_error_notify,         // -> error
			state_error;                // -> .

		// Noop function, used in the various states to indicate that they don't support a given
		// message. Named with the somewhat cute name '_' because it reads really well in the states.

		function _() { }

		// Initial state
		//
		state_created = {
			name: "created",
			enter: function (promise) {
				promise._setState(state_working);
			},
			cancel: _,
			done: _,
			then: _,
			_completed: _,
			_error: _,
			_notify: _,
			_progress: _,
			_setCompleteValue: _,
			_setErrorValue: _
		};

		// Ready state, waiting for a message (completed/error/progress), able to be canceled
		//
		state_working = {
			name: "working",
			enter: _,
			cancel: function (promise) {
				promise._setState(state_canceled);
			},
			done: done,
			then: then,
			_completed: completed,
			_error: error,
			_notify: _,
			_progress: progress,
			_setCompleteValue: setCompleteValue,
			_setErrorValue: setErrorValue
		};

		// Waiting state, if a promise is completed with a value which is itself a promise
		// (has a then() method) it signs up to be informed when that child promise is
		// fulfilled at which point it will be fulfilled with that value.
		//
		state_waiting = {
			name: "waiting",
			enter: function (promise) {
				var waitedUpon = promise._value;
				// We can special case our own intermediate promises which are not in a
				//  terminal state by just pushing this promise as a listener without
				//  having to create new indirection functions
				if (waitedUpon instanceof ThenPromise &&
					waitedUpon._state !== state_error &&
					waitedUpon._state !== state_success) {
					pushListener(waitedUpon, { promise: promise });
				} else {
					var error = function (value) {
						if (waitedUpon._errorId) {
							promise._chainedError(value, waitedUpon);
						} else {
							// Because this is an interop boundary we want to indicate that this
							//  error has been handled by the promise infrastructure before we
							//  begin a new handling chain.
							//
							callonerror(promise, value, detailsForHandledError, waitedUpon, error);
							promise._error(value);
						}
					};
					error.handlesOnError = true;
					waitedUpon.then(
						promise._completed.bind(promise),
						error,
						promise._progress.bind(promise)
					);
				}
			},
			cancel: function (promise) {
				promise._setState(state_waiting_canceled);
			},
			done: done,
			then: then,
			_completed: completed,
			_error: error,
			_notify: _,
			_progress: progress,
			_setCompleteValue: setCompleteValue,
			_setErrorValue: setErrorValue
		};

		// Waiting canceled state, when a promise has been in a waiting state and receives a
		// request to cancel its pending work it will forward that request to the child promise
		// and then waits to be informed of the result. This promise moves itself into the
		// canceling state but understands that the child promise may instead push it to a
		// different state.
		//
		state_waiting_canceled = {
			name: "waiting_canceled",
			enter: function (promise) {
				// Initiate a transition to canceling. Triggering a cancel on the promise
				// that we are waiting upon may result in a different state transition
				// before the state machine pump runs again.
				promise._setState(state_canceling);
				var waitedUpon = promise._value;
				if (waitedUpon.cancel) {
					waitedUpon.cancel();
				}
			},
			cancel: _,
			done: done,
			then: then,
			_completed: completed,
			_error: error,
			_notify: _,
			_progress: progress,
			_setCompleteValue: setCompleteValue,
			_setErrorValue: setErrorValue
		};

		// Canceled state, moves to the canceling state and then tells the promise to do
		// whatever it might need to do on cancelation.
		//
		state_canceled = {
			name: "canceled",
			enter: function (promise) {
				// Initiate a transition to canceling. The _cancelAction may change the state
				// before the state machine pump runs again.
				promise._setState(state_canceling);
				promise._cancelAction();
			},
			cancel: _,
			done: done,
			then: then,
			_completed: completed,
			_error: error,
			_notify: _,
			_progress: progress,
			_setCompleteValue: setCompleteValue,
			_setErrorValue: setErrorValue
		};

		// Canceling state, commits to the promise moving to an error state with an error
		// object whose 'name' and 'message' properties contain the string "Canceled"
		//
		state_canceling = {
			name: "canceling",
			enter: function (promise) {
				var error = new Error(canceledName);
				error.name = error.message;
				promise._value = error;
				promise._setState(state_error_notify);
			},
			cancel: _,
			done: _,
			then: _,
			_completed: _,
			_error: _,
			_notify: _,
			_progress: _,
			_setCompleteValue: _,
			_setErrorValue: _
		};

		// Success notify state, moves a promise to the success state and notifies all children
		//
		state_success_notify = {
			name: "complete_notify",
			enter: function (promise) {
				promise.done = CompletePromise.prototype.done;
				promise.then = CompletePromise.prototype.then;
				if (promise._listeners) {
					var queue = [promise];
					var p;
					while (queue.length) {
						p = queue.shift();
						p._state._notify(p, queue);
					}
				}
				promise._setState(state_success);
			},
			cancel: _,
			done: null, /*error to get here */
			then: null, /*error to get here */
			_completed: _,
			_error: _,
			_notify: notifySuccess,
			_progress: _,
			_setCompleteValue: _,
			_setErrorValue: _
		};

		// Success state, moves a promise to the success state and does NOT notify any children.
		// Some upstream promise is owning the notification pass.
		//
		state_success = {
			name: "success",
			enter: function (promise) {
				promise.done = CompletePromise.prototype.done;
				promise.then = CompletePromise.prototype.then;
				promise._cleanupAction();
			},
			cancel: _,
			done: null, /*error to get here */
			then: null, /*error to get here */
			_completed: _,
			_error: _,
			_notify: notifySuccess,
			_progress: _,
			_setCompleteValue: _,
			_setErrorValue: _
		};

		// Error notify state, moves a promise to the error state and notifies all children
		//
		state_error_notify = {
			name: "error_notify",
			enter: function (promise) {
				promise.done = ErrorPromise.prototype.done;
				promise.then = ErrorPromise.prototype.then;
				if (promise._listeners) {
					var queue = [promise];
					var p;
					while (queue.length) {
						p = queue.shift();
						p._state._notify(p, queue);
					}
				}
				promise._setState(state_error);
			},
			cancel: _,
			done: null, /*error to get here*/
			then: null, /*error to get here*/
			_completed: _,
			_error: _,
			_notify: notifyError,
			_progress: _,
			_setCompleteValue: _,
			_setErrorValue: _
		};

		// Error state, moves a promise to the error state and does NOT notify any children.
		// Some upstream promise is owning the notification pass.
		//
		state_error = {
			name: "error",
			enter: function (promise) {
				promise.done = ErrorPromise.prototype.done;
				promise.then = ErrorPromise.prototype.then;
				promise._cleanupAction();
			},
			cancel: _,
			done: null, /*error to get here*/
			then: null, /*error to get here*/
			_completed: _,
			_error: _,
			_notify: notifyError,
			_progress: _,
			_setCompleteValue: _,
			_setErrorValue: _
		};

		//
		// The statemachine implementation follows a very particular pattern, the states are specified
		// as static stateless bags of functions which are then indirected through the state machine
		// instance (a Promise). As such all of the functions on each state have the promise instance
		// passed to them explicitly as a parameter and the Promise instance members do a little
		// dance where they indirect through the state and insert themselves in the argument list.
		//
		// We could instead call directly through the promise states however then every caller
		// would have to remember to do things like pumping the state machine to catch state transitions.
		//

		var PromiseStateMachine = _Base.Class.define(null, {
			_listeners: null,
			_nextState: null,
			_state: null,
			_value: null,

			cancel: function () {
				/// <signature helpKeyword="WinJS.PromiseStateMachine.cancel">
				/// <summary locid="WinJS.PromiseStateMachine.cancel">
				/// Attempts to cancel the fulfillment of a promised value. If the promise hasn't
				/// already been fulfilled and cancellation is supported, the promise enters
				/// the error state with a value of Error("Canceled").
				/// </summary>
				/// </signature>
				this._state.cancel(this);
				this._run();
			},
			done: function Promise_done(onComplete, onError, onProgress) {
				/// <signature helpKeyword="WinJS.PromiseStateMachine.done">
				/// <summary locid="WinJS.PromiseStateMachine.done">
				/// Allows you to specify the work to be done on the fulfillment of the promised value,
				/// the error handling to be performed if the promise fails to fulfill
				/// a value, and the handling of progress notifications along the way.
				///
				/// After the handlers have finished executing, this function throws any error that would have been returned
				/// from then() as a promise in the error state.
				/// </summary>
				/// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.done_p:onComplete">
				/// The function to be called if the promise is fulfilled successfully with a value.
				/// The fulfilled value is passed as the single argument. If the value is null,
				/// the fulfilled value is returned. The value returned
				/// from the function becomes the fulfilled value of the promise returned by
				/// then(). If an exception is thrown while executing the function, the promise returned
				/// by then() moves into the error state.
				/// </param>
				/// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onError">
				/// The function to be called if the promise is fulfilled with an error. The error
				/// is passed as the single argument. If it is null, the error is forwarded.
				/// The value returned from the function is the fulfilled value of the promise returned by then().
				/// </param>
				/// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onProgress">
				/// the function to be called if the promise reports progress. Data about the progress
				/// is passed as the single argument. Promises are not required to support
				/// progress.
				/// </param>
				/// </signature>
				this._state.done(this, onComplete, onError, onProgress);
			},
			then: function Promise_then(onComplete, onError, onProgress) {
				/// <signature helpKeyword="WinJS.PromiseStateMachine.then">
				/// <summary locid="WinJS.PromiseStateMachine.then">
				/// Allows you to specify the work to be done on the fulfillment of the promised value,
				/// the error handling to be performed if the promise fails to fulfill
				/// a value, and the handling of progress notifications along the way.
				/// </summary>
				/// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.then_p:onComplete">
				/// The function to be called if the promise is fulfilled successfully with a value.
				/// The value is passed as the single argument. If the value is null, the value is returned.
				/// The value returned from the function becomes the fulfilled value of the promise returned by
				/// then(). If an exception is thrown while this function is being executed, the promise returned
				/// by then() moves into the error state.
				/// </param>
				/// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onError">
				/// The function to be called if the promise is fulfilled with an error. The error
				/// is passed as the single argument. If it is null, the error is forwarded.
				/// The value returned from the function becomes the fulfilled value of the promise returned by then().
				/// </param>
				/// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onProgress">
				/// The function to be called if the promise reports progress. Data about the progress
				/// is passed as the single argument. Promises are not required to support
				/// progress.
				/// </param>
				/// <returns type="WinJS.Promise" locid="WinJS.PromiseStateMachine.then_returnValue">
				/// The promise whose value is the result of executing the complete or
				/// error function.
				/// </returns>
				/// </signature>
				return this._state.then(this, onComplete, onError, onProgress);
			},

			_chainedError: function (value, context) {
				var result = this._state._error(this, value, detailsForChainedError, context);
				this._run();
				return result;
			},
			_completed: function (value) {
				var result = this._state._completed(this, value);
				this._run();
				return result;
			},
			_error: function (value) {
				var result = this._state._error(this, value, detailsForError);
				this._run();
				return result;
			},
			_progress: function (value) {
				this._state._progress(this, value);
			},
			_setState: function (state) {
				this._nextState = state;
			},
			_setCompleteValue: function (value) {
				this._state._setCompleteValue(this, value);
				this._run();
			},
			_setChainedErrorValue: function (value, context) {
				var result = this._state._setErrorValue(this, value, detailsForChainedError, context);
				this._run();
				return result;
			},
			_setExceptionValue: function (value) {
				var result = this._state._setErrorValue(this, value, detailsForException);
				this._run();
				return result;
			},
			_run: function () {
				while (this._nextState) {
					this._state = this._nextState;
					this._nextState = null;
					this._state.enter(this);
				}
			}
		}, {
			supportedForProcessing: false
		});

		//
		// Implementations of shared state machine code.
		//

		function completed(promise, value) {
			var targetState;
			if (value && typeof value === "object" && typeof value.then === "function") {
				targetState = state_waiting;
			} else {
				targetState = state_success_notify;
			}
			promise._value = value;
			promise._setState(targetState);
		}
		function createErrorDetails(exception, error, promise, id, parent, handler) {
			return {
				exception: exception,
				error: error,
				promise: promise,
				handler: handler,
				id: id,
				parent: parent
			};
		}
		function detailsForHandledError(promise, errorValue, context, handler) {
			var exception = context._isException;
			var errorId = context._errorId;
			return createErrorDetails(
				exception ? errorValue : null,
				exception ? null : errorValue,
				promise,
				errorId,
				context,
				handler
			);
		}
		function detailsForChainedError(promise, errorValue, context) {
			var exception = context._isException;
			var errorId = context._errorId;
			setErrorInfo(promise, errorId, exception);
			return createErrorDetails(
				exception ? errorValue : null,
				exception ? null : errorValue,
				promise,
				errorId,
				context
			);
		}
		function detailsForError(promise, errorValue) {
			var errorId = ++error_number;
			setErrorInfo(promise, errorId);
			return createErrorDetails(
				null,
				errorValue,
				promise,
				errorId
			);
		}
		function detailsForException(promise, exceptionValue) {
			var errorId = ++error_number;
			setErrorInfo(promise, errorId, true);
			return createErrorDetails(
				exceptionValue,
				null,
				promise,
				errorId
			);
		}
		function done(promise, onComplete, onError, onProgress) {
			var asyncOpID = _Trace._traceAsyncOperationStarting("WinJS.Promise.done");
			pushListener(promise, { c: onComplete, e: onError, p: onProgress, asyncOpID: asyncOpID });
		}
		function error(promise, value, onerrorDetails, context) {
			promise._value = value;
			callonerror(promise, value, onerrorDetails, context);
			promise._setState(state_error_notify);
		}
		function notifySuccess(promise, queue) {
			var value = promise._value;
			var listeners = promise._listeners;
			if (!listeners) {
				return;
			}
			promise._listeners = null;
			var i, len;
			for (i = 0, len = Array.isArray(listeners) ? listeners.length : 1; i < len; i++) {
				var listener = len === 1 ? listeners : listeners[i];
				var onComplete = listener.c;
				var target = listener.promise;

				_Trace._traceAsyncOperationCompleted(listener.asyncOpID, _Global.Debug && _Global.Debug.MS_ASYNC_OP_STATUS_SUCCESS);

				if (target) {
					_Trace._traceAsyncCallbackStarting(listener.asyncOpID);
					try {
						target._setCompleteValue(onComplete ? onComplete(value) : value);
					} catch (ex) {
						target._setExceptionValue(ex);
					} finally {
						_Trace._traceAsyncCallbackCompleted();
					}
					if (target._state !== state_waiting && target._listeners) {
						queue.push(target);
					}
				} else {
					CompletePromise.prototype.done.call(promise, onComplete);
				}
			}
		}
		function notifyError(promise, queue) {
			var value = promise._value;
			var listeners = promise._listeners;
			if (!listeners) {
				return;
			}
			promise._listeners = null;
			var i, len;
			for (i = 0, len = Array.isArray(listeners) ? listeners.length : 1; i < len; i++) {
				var listener = len === 1 ? listeners : listeners[i];
				var onError = listener.e;
				var target = listener.promise;

				var errorID = _Global.Debug && (value && value.name === canceledName ? _Global.Debug.MS_ASYNC_OP_STATUS_CANCELED : _Global.Debug.MS_ASYNC_OP_STATUS_ERROR);
				_Trace._traceAsyncOperationCompleted(listener.asyncOpID, errorID);

				if (target) {
					var asyncCallbackStarted = false;
					try {
						if (onError) {
							_Trace._traceAsyncCallbackStarting(listener.asyncOpID);
							asyncCallbackStarted = true;
							if (!onError.handlesOnError) {
								callonerror(target, value, detailsForHandledError, promise, onError);
							}
							target._setCompleteValue(onError(value));
						} else {
							target._setChainedErrorValue(value, promise);
						}
					} catch (ex) {
						target._setExceptionValue(ex);
					} finally {
						if (asyncCallbackStarted) {
							_Trace._traceAsyncCallbackCompleted();
						}
					}
					if (target._state !== state_waiting && target._listeners) {
						queue.push(target);
					}
				} else {
					ErrorPromise.prototype.done.call(promise, null, onError);
				}
			}
		}
		function callonerror(promise, value, onerrorDetailsGenerator, context, handler) {
			if (promiseEventListeners._listeners[errorET]) {
				if (value instanceof Error && value.message === canceledName) {
					return;
				}
				promiseEventListeners.dispatchEvent(errorET, onerrorDetailsGenerator(promise, value, context, handler));
			}
		}
		function progress(promise, value) {
			var listeners = promise._listeners;
			if (listeners) {
				var i, len;
				for (i = 0, len = Array.isArray(listeners) ? listeners.length : 1; i < len; i++) {
					var listener = len === 1 ? listeners : listeners[i];
					var onProgress = listener.p;
					if (onProgress) {
						try { onProgress(value); } catch (ex) { }
					}
					if (!(listener.c || listener.e) && listener.promise) {
						listener.promise._progress(value);
					}
				}
			}
		}
		function pushListener(promise, listener) {
			var listeners = promise._listeners;
			if (listeners) {
				// We may have either a single listener (which will never be wrapped in an array)
				// or 2+ listeners (which will be wrapped). Since we are now adding one more listener
				// we may have to wrap the single listener before adding the second.
				listeners = Array.isArray(listeners) ? listeners : [listeners];
				listeners.push(listener);
			} else {
				listeners = listener;
			}
			promise._listeners = listeners;
		}
		// The difference beween setCompleteValue()/setErrorValue() and complete()/error() is that setXXXValue() moves
		// a promise directly to the success/error state without starting another notification pass (because one
		// is already ongoing).
		function setErrorInfo(promise, errorId, isException) {
			promise._isException = isException || false;
			promise._errorId = errorId;
		}
		function setErrorValue(promise, value, onerrorDetails, context) {
			promise._value = value;
			callonerror(promise, value, onerrorDetails, context);
			promise._setState(state_error);
		}
		function setCompleteValue(promise, value) {
			var targetState;
			if (value && typeof value === "object" && typeof value.then === "function") {
				targetState = state_waiting;
			} else {
				targetState = state_success;
			}
			promise._value = value;
			promise._setState(targetState);
		}
		function then(promise, onComplete, onError, onProgress) {
			var result = new ThenPromise(promise);
			var asyncOpID = _Trace._traceAsyncOperationStarting("WinJS.Promise.then");
			pushListener(promise, { promise: result, c: onComplete, e: onError, p: onProgress, asyncOpID: asyncOpID });
			return result;
		}

		//
		// Internal implementation detail promise, ThenPromise is created when a promise needs
		// to be returned from a then() method.
		//
		var ThenPromise = _Base.Class.derive(PromiseStateMachine,
			function (creator) {

				if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.thenPromise))) {
					this._stack = Promise._getStack();
				}

				this._creator = creator;
				this._setState(state_created);
				this._run();
			}, {
				_creator: null,

				_cancelAction: function () { if (this._creator) { this._creator.cancel(); } },
				_cleanupAction: function () { this._creator = null; }
			}, {
				supportedForProcessing: false
			}
		);

		//
		// Slim promise implementations for already completed promises, these are created
		// under the hood on synchronous completion paths as well as by WinJS.Promise.wrap
		// and WinJS.Promise.wrapError.
		//

		var ErrorPromise = _Base.Class.define(
			function ErrorPromise_ctor(value) {

				if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.errorPromise))) {
					this._stack = Promise._getStack();
				}

				this._value = value;
				callonerror(this, value, detailsForError);
			}, {
				cancel: function () {
					/// <signature helpKeyword="WinJS.PromiseStateMachine.cancel">
					/// <summary locid="WinJS.PromiseStateMachine.cancel">
					/// Attempts to cancel the fulfillment of a promised value. If the promise hasn't
					/// already been fulfilled and cancellation is supported, the promise enters
					/// the error state with a value of Error("Canceled").
					/// </summary>
					/// </signature>
				},
				done: function ErrorPromise_done(unused, onError) {
					/// <signature helpKeyword="WinJS.PromiseStateMachine.done">
					/// <summary locid="WinJS.PromiseStateMachine.done">
					/// Allows you to specify the work to be done on the fulfillment of the promised value,
					/// the error handling to be performed if the promise fails to fulfill
					/// a value, and the handling of progress notifications along the way.
					///
					/// After the handlers have finished executing, this function throws any error that would have been returned
					/// from then() as a promise in the error state.
					/// </summary>
					/// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.done_p:onComplete">
					/// The function to be called if the promise is fulfilled successfully with a value.
					/// The fulfilled value is passed as the single argument. If the value is null,
					/// the fulfilled value is returned. The value returned
					/// from the function becomes the fulfilled value of the promise returned by
					/// then(). If an exception is thrown while executing the function, the promise returned
					/// by then() moves into the error state.
					/// </param>
					/// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onError">
					/// The function to be called if the promise is fulfilled with an error. The error
					/// is passed as the single argument. If it is null, the error is forwarded.
					/// The value returned from the function is the fulfilled value of the promise returned by then().
					/// </param>
					/// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onProgress">
					/// the function to be called if the promise reports progress. Data about the progress
					/// is passed as the single argument. Promises are not required to support
					/// progress.
					/// </param>
					/// </signature>
					var value = this._value;
					if (onError) {
						try {
							if (!onError.handlesOnError) {
								callonerror(null, value, detailsForHandledError, this, onError);
							}
							var result = onError(value);
							if (result && typeof result === "object" && typeof result.done === "function") {
								// If a promise is returned we need to wait on it.
								result.done();
							}
							return;
						} catch (ex) {
							value = ex;
						}
					}
					if (value instanceof Error && value.message === canceledName) {
						// suppress cancel
						return;
					}
					// force the exception to be thrown asyncronously to avoid any try/catch blocks
					//
					Promise._doneHandler(value);
				},
				then: function ErrorPromise_then(unused, onError) {
					/// <signature helpKeyword="WinJS.PromiseStateMachine.then">
					/// <summary locid="WinJS.PromiseStateMachine.then">
					/// Allows you to specify the work to be done on the fulfillment of the promised value,
					/// the error handling to be performed if the promise fails to fulfill
					/// a value, and the handling of progress notifications along the way.
					/// </summary>
					/// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.then_p:onComplete">
					/// The function to be called if the promise is fulfilled successfully with a value.
					/// The value is passed as the single argument. If the value is null, the value is returned.
					/// The value returned from the function becomes the fulfilled value of the promise returned by
					/// then(). If an exception is thrown while this function is being executed, the promise returned
					/// by then() moves into the error state.
					/// </param>
					/// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onError">
					/// The function to be called if the promise is fulfilled with an error. The error
					/// is passed as the single argument. If it is null, the error is forwarded.
					/// The value returned from the function becomes the fulfilled value of the promise returned by then().
					/// </param>
					/// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onProgress">
					/// The function to be called if the promise reports progress. Data about the progress
					/// is passed as the single argument. Promises are not required to support
					/// progress.
					/// </param>
					/// <returns type="WinJS.Promise" locid="WinJS.PromiseStateMachine.then_returnValue">
					/// The promise whose value is the result of executing the complete or
					/// error function.
					/// </returns>
					/// </signature>

					// If the promise is already in a error state and no error handler is provided
					// we optimize by simply returning the promise instead of creating a new one.
					//
					if (!onError) { return this; }
					var result;
					var value = this._value;
					try {
						if (!onError.handlesOnError) {
							callonerror(null, value, detailsForHandledError, this, onError);
						}
						result = new CompletePromise(onError(value));
					} catch (ex) {
						// If the value throw from the error handler is the same as the value
						// provided to the error handler then there is no need for a new promise.
						//
						if (ex === value) {
							result = this;
						} else {
							result = new ExceptionPromise(ex);
						}
					}
					return result;
				}
			}, {
				supportedForProcessing: false
			}
		);

		var ExceptionPromise = _Base.Class.derive(ErrorPromise,
			function ExceptionPromise_ctor(value) {

				if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.exceptionPromise))) {
					this._stack = Promise._getStack();
				}

				this._value = value;
				callonerror(this, value, detailsForException);
			}, {
				/* empty */
			}, {
				supportedForProcessing: false
			}
		);

		var CompletePromise = _Base.Class.define(
			function CompletePromise_ctor(value) {

				if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.completePromise))) {
					this._stack = Promise._getStack();
				}

				if (value && typeof value === "object" && typeof value.then === "function") {
					var result = new ThenPromise(null);
					result._setCompleteValue(value);
					return result;
				}
				this._value = value;
			}, {
				cancel: function () {
					/// <signature helpKeyword="WinJS.PromiseStateMachine.cancel">
					/// <summary locid="WinJS.PromiseStateMachine.cancel">
					/// Attempts to cancel the fulfillment of a promised value. If the promise hasn't
					/// already been fulfilled and cancellation is supported, the promise enters
					/// the error state with a value of Error("Canceled").
					/// </summary>
					/// </signature>
				},
				done: function CompletePromise_done(onComplete) {
					/// <signature helpKeyword="WinJS.PromiseStateMachine.done">
					/// <summary locid="WinJS.PromiseStateMachine.done">
					/// Allows you to specify the work to be done on the fulfillment of the promised value,
					/// the error handling to be performed if the promise fails to fulfill
					/// a value, and the handling of progress notifications along the way.
					///
					/// After the handlers have finished executing, this function throws any error that would have been returned
					/// from then() as a promise in the error state.
					/// </summary>
					/// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.done_p:onComplete">
					/// The function to be called if the promise is fulfilled successfully with a value.
					/// The fulfilled value is passed as the single argument. If the value is null,
					/// the fulfilled value is returned. The value returned
					/// from the function becomes the fulfilled value of the promise returned by
					/// then(). If an exception is thrown while executing the function, the promise returned
					/// by then() moves into the error state.
					/// </param>
					/// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onError">
					/// The function to be called if the promise is fulfilled with an error. The error
					/// is passed as the single argument. If it is null, the error is forwarded.
					/// The value returned from the function is the fulfilled value of the promise returned by then().
					/// </param>
					/// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onProgress">
					/// the function to be called if the promise reports progress. Data about the progress
					/// is passed as the single argument. Promises are not required to support
					/// progress.
					/// </param>
					/// </signature>
					if (!onComplete) { return; }
					try {
						var result = onComplete(this._value);
						if (result && typeof result === "object" && typeof result.done === "function") {
							result.done();
						}
					} catch (ex) {
						// force the exception to be thrown asynchronously to avoid any try/catch blocks
						Promise._doneHandler(ex);
					}
				},
				then: function CompletePromise_then(onComplete) {
					/// <signature helpKeyword="WinJS.PromiseStateMachine.then">
					/// <summary locid="WinJS.PromiseStateMachine.then">
					/// Allows you to specify the work to be done on the fulfillment of the promised value,
					/// the error handling to be performed if the promise fails to fulfill
					/// a value, and the handling of progress notifications along the way.
					/// </summary>
					/// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.then_p:onComplete">
					/// The function to be called if the promise is fulfilled successfully with a value.
					/// The value is passed as the single argument. If the value is null, the value is returned.
					/// The value returned from the function becomes the fulfilled value of the promise returned by
					/// then(). If an exception is thrown while this function is being executed, the promise returned
					/// by then() moves into the error state.
					/// </param>
					/// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onError">
					/// The function to be called if the promise is fulfilled with an error. The error
					/// is passed as the single argument. If it is null, the error is forwarded.
					/// The value returned from the function becomes the fulfilled value of the promise returned by then().
					/// </param>
					/// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onProgress">
					/// The function to be called if the promise reports progress. Data about the progress
					/// is passed as the single argument. Promises are not required to support
					/// progress.
					/// </param>
					/// <returns type="WinJS.Promise" locid="WinJS.PromiseStateMachine.then_returnValue">
					/// The promise whose value is the result of executing the complete or
					/// error function.
					/// </returns>
					/// </signature>
					try {
						// If the value returned from the completion handler is the same as the value
						// provided to the completion handler then there is no need for a new promise.
						//
						var newValue = onComplete ? onComplete(this._value) : this._value;
						return newValue === this._value ? this : new CompletePromise(newValue);
					} catch (ex) {
						return new ExceptionPromise(ex);
					}
				}
			}, {
				supportedForProcessing: false
			}
		);

		//
		// Promise is the user-creatable WinJS.Promise object.
		//

		function timeout(timeoutMS) {
			var id;
			return new Promise(
				function (c) {
					if (timeoutMS) {
						id = _Global.setTimeout(c, timeoutMS);
					} else {
						_BaseCoreUtils._setImmediate(c);
					}
				},
				function () {
					if (id) {
						_Global.clearTimeout(id);
					}
				}
			);
		}

		function timeoutWithPromise(timeout, promise) {
			var cancelPromise = function () { promise.cancel(); };
			var cancelTimeout = function () { timeout.cancel(); };
			timeout.then(cancelPromise);
			promise.then(cancelTimeout, cancelTimeout);
			return promise;
		}

		var staticCanceledPromise;

		var Promise = _Base.Class.derive(PromiseStateMachine,
			function Promise_ctor(init, oncancel) {
				/// <signature helpKeyword="WinJS.Promise">
				/// <summary locid="WinJS.Promise">
				/// A promise provides a mechanism to schedule work to be done on a value that
				/// has not yet been computed. It is a convenient abstraction for managing
				/// interactions with asynchronous APIs.
				/// </summary>
				/// <param name="init" type="Function" locid="WinJS.Promise_p:init">
				/// The function that is called during construction of the  promise. The function
				/// is given three arguments (complete, error, progress). Inside this function
				/// you should add event listeners for the notifications supported by this value.
				/// </param>
				/// <param name="oncancel" optional="true" locid="WinJS.Promise_p:oncancel">
				/// The function to call if a consumer of this promise wants
				/// to cancel its undone work. Promises are not required to
				/// support cancellation.
				/// </param>
				/// </signature>

				if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.promise))) {
					this._stack = Promise._getStack();
				}

				this._oncancel = oncancel;
				this._setState(state_created);
				this._run();

				try {
					var complete = this._completed.bind(this);
					var error = this._error.bind(this);
					var progress = this._progress.bind(this);
					init(complete, error, progress);
				} catch (ex) {
					this._setExceptionValue(ex);
				}
			}, {
				_oncancel: null,

				_cancelAction: function () {
					// BEGIN monaco change
					try {
						if (this._oncancel) {
							this._oncancel();
						} else {
							throw new Error('Promise did not implement oncancel');
						}
					} catch (ex) {
						// Access fields to get them created
						var msg = ex.message;
						var stack = ex.stack;
						promiseEventListeners.dispatchEvent('error', ex);
					}
					// END monaco change
				},
				_cleanupAction: function () { this._oncancel = null; }
			}, {

				addEventListener: function Promise_addEventListener(eventType, listener, capture) {
					/// <signature helpKeyword="WinJS.Promise.addEventListener">
					/// <summary locid="WinJS.Promise.addEventListener">
					/// Adds an event listener to the control.
					/// </summary>
					/// <param name="eventType" locid="WinJS.Promise.addEventListener_p:eventType">
					/// The type (name) of the event.
					/// </param>
					/// <param name="listener" locid="WinJS.Promise.addEventListener_p:listener">
					/// The listener to invoke when the event is raised.
					/// </param>
					/// <param name="capture" locid="WinJS.Promise.addEventListener_p:capture">
					/// Specifies whether or not to initiate capture.
					/// </param>
					/// </signature>
					promiseEventListeners.addEventListener(eventType, listener, capture);
				},
				any: function Promise_any(values) {
					/// <signature helpKeyword="WinJS.Promise.any">
					/// <summary locid="WinJS.Promise.any">
					/// Returns a promise that is fulfilled when one of the input promises
					/// has been fulfilled.
					/// </summary>
					/// <param name="values" type="Array" locid="WinJS.Promise.any_p:values">
					/// An array that contains promise objects or objects whose property
					/// values include promise objects.
					/// </param>
					/// <returns type="WinJS.Promise" locid="WinJS.Promise.any_returnValue">
					/// A promise that on fulfillment yields the value of the input (complete or error).
					/// </returns>
					/// </signature>
					return new Promise(
						function (complete, error) {
							var keys = Object.keys(values);
							if (keys.length === 0) {
								complete();
							}
							var canceled = 0;
							keys.forEach(function (key) {
								Promise.as(values[key]).then(
									function () { complete({ key: key, value: values[key] }); },
									function (e) {
										if (e instanceof Error && e.name === canceledName) {
											if ((++canceled) === keys.length) {
												complete(Promise.cancel);
											}
											return;
										}
										error({ key: key, value: values[key] });
									}
								);
							});
						},
						function () {
							var keys = Object.keys(values);
							keys.forEach(function (key) {
								var promise = Promise.as(values[key]);
								if (typeof promise.cancel === "function") {
									promise.cancel();
								}
							});
						}
					);
				},
				as: function Promise_as(value) {
					/// <signature helpKeyword="WinJS.Promise.as">
					/// <summary locid="WinJS.Promise.as">
					/// Returns a promise. If the object is already a promise it is returned;
					/// otherwise the object is wrapped in a promise.
					/// </summary>
					/// <param name="value" locid="WinJS.Promise.as_p:value">
					/// The value to be treated as a promise.
					/// </param>
					/// <returns type="WinJS.Promise" locid="WinJS.Promise.as_returnValue">
					/// A promise.
					/// </returns>
					/// </signature>
					if (value && typeof value === "object" && typeof value.then === "function") {
						return value;
					}
					return new CompletePromise(value);
				},
				/// <field type="WinJS.Promise" helpKeyword="WinJS.Promise.cancel" locid="WinJS.Promise.cancel">
				/// Canceled promise value, can be returned from a promise completion handler
				/// to indicate cancelation of the promise chain.
				/// </field>
				cancel: {
					get: function () {
						return (staticCanceledPromise = staticCanceledPromise || new ErrorPromise(new _ErrorFromName(canceledName)));
					}
				},
				dispatchEvent: function Promise_dispatchEvent(eventType, details) {
					/// <signature helpKeyword="WinJS.Promise.dispatchEvent">
					/// <summary locid="WinJS.Promise.dispatchEvent">
					/// Raises an event of the specified type and properties.
					/// </summary>
					/// <param name="eventType" locid="WinJS.Promise.dispatchEvent_p:eventType">
					/// The type (name) of the event.
					/// </param>
					/// <param name="details" locid="WinJS.Promise.dispatchEvent_p:details">
					/// The set of additional properties to be attached to the event object.
					/// </param>
					/// <returns type="Boolean" locid="WinJS.Promise.dispatchEvent_returnValue">
					/// Specifies whether preventDefault was called on the event.
					/// </returns>
					/// </signature>
					return promiseEventListeners.dispatchEvent(eventType, details);
				},
				is: function Promise_is(value) {
					/// <signature helpKeyword="WinJS.Promise.is">
					/// <summary locid="WinJS.Promise.is">
					/// Determines whether a value fulfills the promise contract.
					/// </summary>
					/// <param name="value" locid="WinJS.Promise.is_p:value">
					/// A value that may be a promise.
					/// </param>
					/// <returns type="Boolean" locid="WinJS.Promise.is_returnValue">
					/// true if the specified value is a promise, otherwise false.
					/// </returns>
					/// </signature>
					return value && typeof value === "object" && typeof value.then === "function";
				},
				join: function Promise_join(values) {
					/// <signature helpKeyword="WinJS.Promise.join">
					/// <summary locid="WinJS.Promise.join">
					/// Creates a promise that is fulfilled when all the values are fulfilled.
					/// </summary>
					/// <param name="values" type="Object" locid="WinJS.Promise.join_p:values">
					/// An object whose fields contain values, some of which may be promises.
					/// </param>
					/// <returns type="WinJS.Promise" locid="WinJS.Promise.join_returnValue">
					/// A promise whose value is an object with the same field names as those of the object in the values parameter, where
					/// each field value is the fulfilled value of a promise.
					/// </returns>
					/// </signature>
					return new Promise(
						function (complete, error, progress) {
							var keys = Object.keys(values);
							var errors = Array.isArray(values) ? [] : {};
							var results = Array.isArray(values) ? [] : {};
							var undefineds = 0;
							var pending = keys.length;
							var argDone = function (key) {
								if ((--pending) === 0) {
									var errorCount = Object.keys(errors).length;
									if (errorCount === 0) {
										complete(results);
									} else {
										var canceledCount = 0;
										keys.forEach(function (key) {
											var e = errors[key];
											if (e instanceof Error && e.name === canceledName) {
												canceledCount++;
											}
										});
										if (canceledCount === errorCount) {
											complete(Promise.cancel);
										} else {
											error(errors);
										}
									}
								} else {
									progress({ Key: key, Done: true });
								}
							};
							keys.forEach(function (key) {
								var value = values[key];
								if (value === undefined) {
									undefineds++;
								} else {
									Promise.then(value,
										function (value) { results[key] = value; argDone(key); },
										function (value) { errors[key] = value; argDone(key); }
									);
								}
							});
							pending -= undefineds;
							if (pending === 0) {
								complete(results);
								return;
							}
						},
						function () {
							Object.keys(values).forEach(function (key) {
								var promise = Promise.as(values[key]);
								if (typeof promise.cancel === "function") {
									promise.cancel();
								}
							});
						}
					);
				},
				removeEventListener: function Promise_removeEventListener(eventType, listener, capture) {
					/// <signature helpKeyword="WinJS.Promise.removeEventListener">
					/// <summary locid="WinJS.Promise.removeEventListener">
					/// Removes an event listener from the control.
					/// </summary>
					/// <param name='eventType' locid="WinJS.Promise.removeEventListener_eventType">
					/// The type (name) of the event.
					/// </param>
					/// <param name='listener' locid="WinJS.Promise.removeEventListener_listener">
					/// The listener to remove.
					/// </param>
					/// <param name='capture' locid="WinJS.Promise.removeEventListener_capture">
					/// Specifies whether or not to initiate capture.
					/// </param>
					/// </signature>
					promiseEventListeners.removeEventListener(eventType, listener, capture);
				},
				supportedForProcessing: false,
				then: function Promise_then(value, onComplete, onError, onProgress) {
					/// <signature helpKeyword="WinJS.Promise.then">
					/// <summary locid="WinJS.Promise.then">
					/// A static version of the promise instance method then().
					/// </summary>
					/// <param name="value" locid="WinJS.Promise.then_p:value">
					/// the value to be treated as a promise.
					/// </param>
					/// <param name="onComplete" type="Function" locid="WinJS.Promise.then_p:complete">
					/// The function to be called if the promise is fulfilled with a value.
					/// If it is null, the promise simply
					/// returns the value. The value is passed as the single argument.
					/// </param>
					/// <param name="onError" type="Function" optional="true" locid="WinJS.Promise.then_p:error">
					/// The function to be called if the promise is fulfilled with an error. The error
					/// is passed as the single argument.
					/// </param>
					/// <param name="onProgress" type="Function" optional="true" locid="WinJS.Promise.then_p:progress">
					/// The function to be called if the promise reports progress. Data about the progress
					/// is passed as the single argument. Promises are not required to support
					/// progress.
					/// </param>
					/// <returns type="WinJS.Promise" locid="WinJS.Promise.then_returnValue">
					/// A promise whose value is the result of executing the provided complete function.
					/// </returns>
					/// </signature>
					return Promise.as(value).then(onComplete, onError, onProgress);
				},
				thenEach: function Promise_thenEach(values, onComplete, onError, onProgress) {
					/// <signature helpKeyword="WinJS.Promise.thenEach">
					/// <summary locid="WinJS.Promise.thenEach">
					/// Performs an operation on all the input promises and returns a promise
					/// that has the shape of the input and contains the result of the operation
					/// that has been performed on each input.
					/// </summary>
					/// <param name="values" locid="WinJS.Promise.thenEach_p:values">
					/// A set of values (which could be either an array or an object) of which some or all are promises.
					/// </param>
					/// <param name="onComplete" type="Function" locid="WinJS.Promise.thenEach_p:complete">
					/// The function to be called if the promise is fulfilled with a value.
					/// If the value is null, the promise returns the value.
					/// The value is passed as the single argument.
					/// </param>
					/// <param name="onError" type="Function" optional="true" locid="WinJS.Promise.thenEach_p:error">
					/// The function to be called if the promise is fulfilled with an error. The error
					/// is passed as the single argument.
					/// </param>
					/// <param name="onProgress" type="Function" optional="true" locid="WinJS.Promise.thenEach_p:progress">
					/// The function to be called if the promise reports progress. Data about the progress
					/// is passed as the single argument. Promises are not required to support
					/// progress.
					/// </param>
					/// <returns type="WinJS.Promise" locid="WinJS.Promise.thenEach_returnValue">
					/// A promise that is the result of calling Promise.join on the values parameter.
					/// </returns>
					/// </signature>
					var result = Array.isArray(values) ? [] : {};
					Object.keys(values).forEach(function (key) {
						result[key] = Promise.as(values[key]).then(onComplete, onError, onProgress);
					});
					return Promise.join(result);
				},
				timeout: function Promise_timeout(time, promise) {
					/// <signature helpKeyword="WinJS.Promise.timeout">
					/// <summary locid="WinJS.Promise.timeout">
					/// Creates a promise that is fulfilled after a timeout.
					/// </summary>
					/// <param name="timeout" type="Number" optional="true" locid="WinJS.Promise.timeout_p:timeout">
					/// The timeout period in milliseconds. If this value is zero or not specified
					/// setImmediate is called, otherwise setTimeout is called.
					/// </param>
					/// <param name="promise" type="Promise" optional="true" locid="WinJS.Promise.timeout_p:promise">
					/// A promise that will be canceled if it doesn't complete before the
					/// timeout has expired.
					/// </param>
					/// <returns type="WinJS.Promise" locid="WinJS.Promise.timeout_returnValue">
					/// A promise that is completed asynchronously after the specified timeout.
					/// </returns>
					/// </signature>
					var to = timeout(time);
					return promise ? timeoutWithPromise(to, promise) : to;
				},
				wrap: function Promise_wrap(value) {
					/// <signature helpKeyword="WinJS.Promise.wrap">
					/// <summary locid="WinJS.Promise.wrap">
					/// Wraps a non-promise value in a promise. You can use this function if you need
					/// to pass a value to a function that requires a promise.
					/// </summary>
					/// <param name="value" locid="WinJS.Promise.wrap_p:value">
					/// Some non-promise value to be wrapped in a promise.
					/// </param>
					/// <returns type="WinJS.Promise" locid="WinJS.Promise.wrap_returnValue">
					/// A promise that is successfully fulfilled with the specified value
					/// </returns>
					/// </signature>
					return new CompletePromise(value);
				},
				wrapError: function Promise_wrapError(error) {
					/// <signature helpKeyword="WinJS.Promise.wrapError">
					/// <summary locid="WinJS.Promise.wrapError">
					/// Wraps a non-promise error value in a promise. You can use this function if you need
					/// to pass an error to a function that requires a promise.
					/// </summary>
					/// <param name="error" locid="WinJS.Promise.wrapError_p:error">
					/// A non-promise error value to be wrapped in a promise.
					/// </param>
					/// <returns type="WinJS.Promise" locid="WinJS.Promise.wrapError_returnValue">
					/// A promise that is in an error state with the specified value.
					/// </returns>
					/// </signature>
					return new ErrorPromise(error);
				},

				_veryExpensiveTagWithStack: {
					get: function () { return tagWithStack; },
					set: function (value) { tagWithStack = value; }
				},
				_veryExpensiveTagWithStack_tag: tag,
				_getStack: function () {
					if (_Global.Debug && _Global.Debug.debuggerEnabled) {
						try { throw new Error(); } catch (e) { return e.stack; }
					}
				},

				_cancelBlocker: function Promise__cancelBlocker(input, oncancel) {
					//
					// Returns a promise which on cancelation will still result in downstream cancelation while
					//  protecting the promise 'input' from being  canceled which has the effect of allowing
					//  'input' to be shared amoung various consumers.
					//
					if (!Promise.is(input)) {
						return Promise.wrap(input);
					}
					var complete;
					var error;
					var output = new Promise(
						function (c, e) {
							complete = c;
							error = e;
						},
						function () {
							complete = null;
							error = null;
							oncancel && oncancel();
						}
					);
					input.then(
						function (v) { complete && complete(v); },
						function (e) { error && error(e); }
					);
					return output;
				},

			}
		);
		Object.defineProperties(Promise, _Events.createEventProperties(errorET));

		Promise._doneHandler = function (value) {
			_BaseCoreUtils._setImmediate(function Promise_done_rethrow() {
				throw value;
			});
		};

		return {
			PromiseStateMachine: PromiseStateMachine,
			Promise: Promise,
			state_created: state_created
		};
	});

	_winjs("WinJS/Promise", ["WinJS/Core/_Base","WinJS/Promise/_StateMachine"], function promiseInit( _Base, _StateMachine) {
		_Base.Namespace.define("WinJS", {
			Promise: _StateMachine.Promise
		});

		return _StateMachine.Promise;
	});

	var exported = _modules["WinJS/Core/_WinJS"];
	return exported;
})();

var Promise$1 = win.Promise;
var TPromise = win.Promise;
var PPromise = win.Promise;

let outstandingPromiseErrors = {};
function promiseErrorHandler(e) {
    const details = e.detail;
    const id = details.id;
    if (details.parent) {
        if (details.handler && outstandingPromiseErrors) {
            delete outstandingPromiseErrors[id];
        }
        return;
    }
    outstandingPromiseErrors[id] = details;
    if (Object.keys(outstandingPromiseErrors).length === 1) {
        setTimeout(function () {
            const errors = outstandingPromiseErrors;
            outstandingPromiseErrors = {};
            Object.keys(errors).forEach(function (errorId) {
                const error = errors[errorId];
                if (error.exception) {
                    onUnexpectedError(error.exception);
                }
                else if (error.error) {
                    onUnexpectedError(error.error);
                }
                console.log('WARNING: Promise with no error callback:' + error.id);
                console.log(error);
                if (error.exception) {
                    console.log(error.exception.stack);
                }
            });
        }, 0);
    }
}
TPromise.addEventListener('error', promiseErrorHandler);
class ErrorHandler {
    constructor() {
        this.listeners = [];
        this.unexpectedErrorHandler = function (e) {
            setTimeout$1(() => {
                if (e.stack) {
                    throw new Error(e.message + '\n\n' + e.stack);
                }
                throw e;
            }, 0);
        };
    }
    addListener(listener) {
        this.listeners.push(listener);
        return () => {
            this._removeListener(listener);
        };
    }
    emit(e) {
        this.listeners.forEach((listener) => {
            listener(e);
        });
    }
    _removeListener(listener) {
        this.listeners.splice(this.listeners.indexOf(listener), 1);
    }
    setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
        this.unexpectedErrorHandler = newUnexpectedErrorHandler;
    }
    getUnexpectedErrorHandler() {
        return this.unexpectedErrorHandler;
    }
    onUnexpectedError(e) {
        this.unexpectedErrorHandler(e);
        this.emit(e);
    }
    onUnexpectedExternalError(e) {
        this.unexpectedErrorHandler(e);
    }
}
const errorHandler = new ErrorHandler();

function onUnexpectedError(e) {
    if (!isPromiseCanceledError(e)) {
        errorHandler.onUnexpectedError(e);
    }
    return undefined;
}



const canceledName = 'Canceled';
function isPromiseCanceledError(error) {
    return error instanceof Error && error.name === canceledName && error.message === canceledName;
}

class Node {
    constructor(element) {
        this.element = element;
    }
}
class LinkedList {
    isEmpty() {
        return !this._first;
    }
    unshift(element) {
        return this.insert(element, false);
    }
    push(element) {
        return this.insert(element, true);
    }
    insert(element, atTheEnd) {
        const newNode = new Node(element);
        if (!this._first) {
            this._first = newNode;
            this._last = newNode;
        }
        else if (atTheEnd) {
            const oldLast = this._last;
            this._last = newNode;
            newNode.prev = oldLast;
            oldLast.next = newNode;
        }
        else {
            const oldFirst = this._first;
            this._first = newNode;
            newNode.next = oldFirst;
            oldFirst.prev = newNode;
        }
        return () => {
            for (let candidate = this._first; candidate instanceof Node; candidate = candidate.next) {
                if (candidate !== newNode) {
                    continue;
                }
                if (candidate.prev && candidate.next) {
                    let anchor = candidate.prev;
                    anchor.next = candidate.next;
                    candidate.next.prev = anchor;
                }
                else if (!candidate.prev && !candidate.next) {
                    this._first = undefined;
                    this._last = undefined;
                }
                else if (!candidate.next) {
                    this._last = this._last.prev;
                    this._last.next = undefined;
                }
                else if (!candidate.prev) {
                    this._first = this._first.next;
                    this._first.prev = undefined;
                }
                break;
            }
        };
    }
    iterator() {
        let _done;
        let _value;
        let element = {
            get done() { return _done; },
            get value() { return _value; }
        };
        let node = this._first;
        return {
            next() {
                if (!node) {
                    _done = true;
                    _value = undefined;
                }
                else {
                    _done = false;
                    _value = node.element;
                    node = node.next;
                }
                return element;
            }
        };
    }
    toArray() {
        let result = [];
        for (let node = this._first; node instanceof Node; node = node.next) {
            result.push(node.element);
        }
        return result;
    }
}

class CallbackList {
    add(callback, context = null, bucket) {
        if (!this._callbacks) {
            this._callbacks = new LinkedList();
        }
        const remove = this._callbacks.push([callback, context]);
        if (Array.isArray(bucket)) {
            bucket.push({ dispose: remove });
        }
        return remove;
    }
    invoke(...args) {
        if (!this._callbacks) {
            return undefined;
        }
        const ret = [];
        const elements = this._callbacks.toArray();
        for (const [callback, context] of elements) {
            try {
                ret.push(callback.apply(context, args));
            }
            catch (e) {
                onUnexpectedError(e);
            }
        }
        return ret;
    }
    entries() {
        if (!this._callbacks) {
            return [];
        }
        return this._callbacks
            ? this._callbacks.toArray()
            : [];
    }
    isEmpty() {
        return !this._callbacks || this._callbacks.isEmpty();
    }
    dispose() {
        this._callbacks = undefined;
    }
}

var Event;
(function (Event) {
    const _disposable = { dispose() { } };
    Event.None = function () { return _disposable; };
})(Event || (Event = {}));
class Emitter {
    constructor(_options) {
        this._options = _options;
    }
    get event() {
        if (!this._event) {
            this._event = (listener, thisArgs, disposables) => {
                if (!this._callbacks) {
                    this._callbacks = new CallbackList();
                }
                const firstListener = this._callbacks.isEmpty();
                if (firstListener && this._options && this._options.onFirstListenerAdd) {
                    this._options.onFirstListenerAdd(this);
                }
                const remove = this._callbacks.add(listener, thisArgs);
                if (firstListener && this._options && this._options.onFirstListenerDidAdd) {
                    this._options.onFirstListenerDidAdd(this);
                }
                if (this._options && this._options.onListenerDidAdd) {
                    this._options.onListenerDidAdd(this, listener, thisArgs);
                }
                let result;
                result = {
                    dispose: () => {
                        result.dispose = Emitter._noop;
                        if (!this._disposed) {
                            remove();
                            if (this._options && this._options.onLastListenerRemove && this._callbacks.isEmpty()) {
                                this._options.onLastListenerRemove(this);
                            }
                        }
                    }
                };
                if (Array.isArray(disposables)) {
                    disposables.push(result);
                }
                return result;
            };
        }
        return this._event;
    }
    fire(event) {
        if (this._callbacks) {
            this._callbacks.invoke.call(this._callbacks, event);
        }
    }
    dispose() {
        if (this._callbacks) {
            this._callbacks.dispose();
            this._callbacks = undefined;
            this._disposed = true;
        }
    }
}
Emitter._noop = function () { };

class BoundedMap {
    constructor(limit = Number.MAX_VALUE, ratio = 1, value) {
        this.limit = limit;
        this.map = new Map();
        this.ratio = limit * ratio;
        if (value) {
            value.entries.forEach(entry => {
                this.set(entry.key, entry.value);
            });
        }
    }
    setLimit(limit) {
        if (limit < 0) {
            return;
        }
        this.limit = limit;
        while (this.map.size > this.limit) {
            this.trim();
        }
    }
    serialize() {
        const serialized = { entries: [] };
        this.map.forEach(entry => {
            serialized.entries.push({ key: entry.key, value: entry.value });
        });
        return serialized;
    }
    get size() {
        return this.map.size;
    }
    set(key, value) {
        if (this.map.has(key)) {
            return false;
        }
        const entry = { key, value };
        this.push(entry);
        if (this.size > this.limit) {
            this.trim();
        }
        return true;
    }
    get(key) {
        const entry = this.map.get(key);
        return entry ? entry.value : null;
    }
    getOrSet(k, t) {
        const res = this.get(k);
        if (res) {
            return res;
        }
        this.set(k, t);
        return t;
    }
    delete(key) {
        const entry = this.map.get(key);
        if (entry) {
            this.map.delete(key);
            if (entry.next) {
                entry.next.prev = entry.prev;
            }
            else {
                this.head = entry.prev;
            }
            if (entry.prev) {
                entry.prev.next = entry.next;
            }
            else {
                this.tail = entry.next;
            }
            return entry.value;
        }
        return null;
    }
    has(key) {
        return this.map.has(key);
    }
    clear() {
        this.map.clear();
        this.head = null;
        this.tail = null;
    }
    push(entry) {
        if (this.head) {
            entry.prev = this.head;
            this.head.next = entry;
        }
        if (!this.tail) {
            this.tail = entry;
        }
        this.head = entry;
        this.map.set(entry.key, entry);
    }
    trim() {
        if (this.tail) {
            if (this.ratio < this.limit) {
                let index = 0;
                let current = this.tail;
                while (current.next) {
                    this.map.delete(current.key);
                    if (index === this.ratio) {
                        this.tail = current.next;
                        this.tail.prev = null;
                        break;
                    }
                    current = current.next;
                    index++;
                }
            }
            else {
                this.map.delete(this.tail.key);
                this.tail = this.tail.next;
                if (this.tail) {
                    this.tail.prev = null;
                }
            }
        }
    }
}

class PathIterator {
    reset(key) {
        this._value = key.replace(/\\$|\/$/, '');
        this._from = 0;
        this._to = 0;
        return this.next();
    }
    hasNext() {
        return this._to < this._value.length;
    }
    join(parts) {
        return parts.join('/');
    }
    next() {
        this._from = this._to;
        let justSeps = true;
        for (; this._to < this._value.length; this._to++) {
            const ch = this._value.charCodeAt(this._to);
            if (ch === PathIterator._fwd || ch === PathIterator._bwd) {
                if (justSeps) {
                    this._from++;
                }
                else {
                    break;
                }
            }
            else {
                justSeps = false;
            }
        }
        return this;
    }
    cmp(a) {
        let aPos = 0;
        let aLen = a.length;
        let thisPos = this._from;
        while (aPos < aLen && thisPos < this._to) {
            let cmp = a.charCodeAt(aPos) - this._value.charCodeAt(thisPos);
            if (cmp !== 0) {
                return cmp;
            }
            aPos += 1;
            thisPos += 1;
        }
        if (aLen === this._to - this._from) {
            return 0;
        }
        else if (aPos < aLen) {
            return -1;
        }
        else {
            return 1;
        }
    }
    value() {
        return this._value.substring(this._from, this._to);
    }
}
PathIterator._fwd = '/'.charCodeAt(0);
PathIterator._bwd = '\\'.charCodeAt(0);



var Touch;
(function (Touch) {
    Touch.None = 0;
    Touch.First = 1;
    Touch.Last = 2;
})(Touch || (Touch = {}));

const nfcCache = new BoundedMap(10000);

const nfdCache = new BoundedMap(10000);

const CACHE = new BoundedMap(10000);

class TokenizationRegistryImpl {
    constructor() {
        this._onDidChange = new Emitter();
        this.onDidChange = this._onDidChange.event;
        this._map = Object.create(null);
        this._colorMap = null;
    }
    fire(languages) {
        this._onDidChange.fire({
            changedLanguages: languages,
            changedColorMap: false
        });
    }
    register(language, support) {
        this._map[language] = support;
        this.fire([language]);
        return {
            dispose: () => {
                if (this._map[language] !== support) {
                    return;
                }
                delete this._map[language];
                this.fire([language]);
            }
        };
    }
    get(language) {
        return (this._map[language] || null);
    }
    setColorMap(colorMap) {
        this._colorMap = colorMap;
        this._onDidChange.fire({
            changedLanguages: Object.keys(this._map),
            changedColorMap: true
        });
    }
    getColorMap() {
        return this._colorMap;
    }
    getDefaultForeground() {
        return this._colorMap[1];
    }
    getDefaultBackground() {
        return this._colorMap[2];
    }
}

var SuggestTriggerKind;
(function (SuggestTriggerKind) {
    SuggestTriggerKind[SuggestTriggerKind["Invoke"] = 0] = "Invoke";
    SuggestTriggerKind[SuggestTriggerKind["TriggerCharacter"] = 1] = "TriggerCharacter";
})(SuggestTriggerKind || (SuggestTriggerKind = {}));
var DocumentHighlightKind;
(function (DocumentHighlightKind) {
    DocumentHighlightKind[DocumentHighlightKind["Text"] = 0] = "Text";
    DocumentHighlightKind[DocumentHighlightKind["Read"] = 1] = "Read";
    DocumentHighlightKind[DocumentHighlightKind["Write"] = 2] = "Write";
})(DocumentHighlightKind || (DocumentHighlightKind = {}));
var SymbolKind;
(function (SymbolKind) {
    SymbolKind[SymbolKind["File"] = 0] = "File";
    SymbolKind[SymbolKind["Module"] = 1] = "Module";
    SymbolKind[SymbolKind["Namespace"] = 2] = "Namespace";
    SymbolKind[SymbolKind["Package"] = 3] = "Package";
    SymbolKind[SymbolKind["Class"] = 4] = "Class";
    SymbolKind[SymbolKind["Method"] = 5] = "Method";
    SymbolKind[SymbolKind["Property"] = 6] = "Property";
    SymbolKind[SymbolKind["Field"] = 7] = "Field";
    SymbolKind[SymbolKind["Constructor"] = 8] = "Constructor";
    SymbolKind[SymbolKind["Enum"] = 9] = "Enum";
    SymbolKind[SymbolKind["Interface"] = 10] = "Interface";
    SymbolKind[SymbolKind["Function"] = 11] = "Function";
    SymbolKind[SymbolKind["Variable"] = 12] = "Variable";
    SymbolKind[SymbolKind["Constant"] = 13] = "Constant";
    SymbolKind[SymbolKind["String"] = 14] = "String";
    SymbolKind[SymbolKind["Number"] = 15] = "Number";
    SymbolKind[SymbolKind["Boolean"] = 16] = "Boolean";
    SymbolKind[SymbolKind["Array"] = 17] = "Array";
    SymbolKind[SymbolKind["Object"] = 18] = "Object";
    SymbolKind[SymbolKind["Key"] = 19] = "Key";
    SymbolKind[SymbolKind["Null"] = 20] = "Null";
    SymbolKind[SymbolKind["EnumMember"] = 21] = "EnumMember";
    SymbolKind[SymbolKind["Struct"] = 22] = "Struct";
    SymbolKind[SymbolKind["Event"] = 23] = "Event";
    SymbolKind[SymbolKind["Operator"] = 24] = "Operator";
    SymbolKind[SymbolKind["TypeParameter"] = 25] = "TypeParameter";
})(SymbolKind || (SymbolKind = {}));
const symbolKindToCssClass = (function () {
    const _fromMapping = Object.create(null);
    _fromMapping[SymbolKind.File] = 'file';
    _fromMapping[SymbolKind.Module] = 'module';
    _fromMapping[SymbolKind.Namespace] = 'namespace';
    _fromMapping[SymbolKind.Package] = 'package';
    _fromMapping[SymbolKind.Class] = 'class';
    _fromMapping[SymbolKind.Method] = 'method';
    _fromMapping[SymbolKind.Property] = 'property';
    _fromMapping[SymbolKind.Field] = 'field';
    _fromMapping[SymbolKind.Constructor] = 'constructor';
    _fromMapping[SymbolKind.Enum] = 'enum';
    _fromMapping[SymbolKind.Interface] = 'interface';
    _fromMapping[SymbolKind.Function] = 'function';
    _fromMapping[SymbolKind.Variable] = 'variable';
    _fromMapping[SymbolKind.Constant] = 'constant';
    _fromMapping[SymbolKind.String] = 'string';
    _fromMapping[SymbolKind.Number] = 'number';
    _fromMapping[SymbolKind.Boolean] = 'boolean';
    _fromMapping[SymbolKind.Array] = 'array';
    _fromMapping[SymbolKind.Object] = 'object';
    _fromMapping[SymbolKind.Key] = 'key';
    _fromMapping[SymbolKind.Null] = 'null';
    _fromMapping[SymbolKind.EnumMember] = 'enum-member';
    _fromMapping[SymbolKind.Struct] = 'struct';
    _fromMapping[SymbolKind.Event] = 'event';
    _fromMapping[SymbolKind.Operator] = 'operator';
    _fromMapping[SymbolKind.TypeParameter] = 'type-parameter';
    return function toCssClassName(kind) {
        return _fromMapping[kind] || 'property';
    };
})();

















const TokenizationRegistry = new TokenizationRegistryImpl();

class Token {
    constructor(offset, type, language) {
        this.offset = offset | 0;
        this.type = type;
        this.language = language;
    }
    toString() {
        return '(' + this.offset + ', ' + this.type + ')';
    }
}
class TokenizationResult {
    constructor(tokens, endState) {
        this.tokens = tokens;
        this.endState = endState;
    }
}
class TokenizationResult2 {
    constructor(tokens, endState) {
        this.tokens = tokens;
        this.endState = endState;
    }
}

class NullStateImpl {
    clone() {
        return this;
    }
    equals(other) {
        return (this === other);
    }
}
const NULL_STATE = new NullStateImpl();
const NULL_MODE_ID = 'vs.editor.nullMode';

const CACHE_STACK_DEPTH = 5;
class MonarchStackElementFactory {
    constructor(maxCacheDepth) {
        this._maxCacheDepth = maxCacheDepth;
        this._entries = Object.create(null);
    }
    static create(parent, state) {
        return this._INSTANCE.create(parent, state);
    }
    create(parent, state) {
        if (parent !== null && parent.depth >= this._maxCacheDepth) {
            return new MonarchStackElement(parent, state);
        }
        let stackElementId = MonarchStackElement.getStackElementId(parent);
        if (stackElementId.length > 0) {
            stackElementId += '|';
        }
        stackElementId += state;
        let result = this._entries[stackElementId];
        if (result) {
            return result;
        }
        result = new MonarchStackElement(parent, state);
        this._entries[stackElementId] = result;
        return result;
    }
}
MonarchStackElementFactory._INSTANCE = new MonarchStackElementFactory(CACHE_STACK_DEPTH);
class MonarchStackElement {
    constructor(parent, state) {
        this.parent = parent;
        this.state = state;
        this.depth = (this.parent ? this.parent.depth : 0) + 1;
    }
    static getStackElementId(element) {
        let result = '';
        while (element !== null) {
            if (result.length > 0) {
                result += '|';
            }
            result += element.state;
            element = element.parent;
        }
        return result;
    }
    static _equals(a, b) {
        while (a !== null && b !== null) {
            if (a === b) {
                return true;
            }
            if (a.state !== b.state) {
                return false;
            }
            a = a.parent;
            b = b.parent;
        }
        if (a === null && b === null) {
            return true;
        }
        return false;
    }
    equals(other) {
        return MonarchStackElement._equals(this, other);
    }
    push(state) {
        return MonarchStackElementFactory.create(this, state);
    }
    pop() {
        return this.parent;
    }
    popall() {
        let result = this;
        while (result.parent) {
            result = result.parent;
        }
        return result;
    }
    switchTo(state) {
        return MonarchStackElementFactory.create(this.parent, state);
    }
}
class EmbeddedModeData {
    constructor(modeId, state) {
        this.modeId = modeId;
        this.state = state;
    }
    equals(other) {
        return (this.modeId === other.modeId
            && this.state.equals(other.state));
    }
    clone() {
        let stateClone = this.state.clone();
        if (stateClone === this.state) {
            return this;
        }
        return new EmbeddedModeData(this.modeId, this.state);
    }
}
class MonarchLineStateFactory {
    constructor(maxCacheDepth) {
        this._maxCacheDepth = maxCacheDepth;
        this._entries = Object.create(null);
    }
    static create(stack, embeddedModeData) {
        return this._INSTANCE.create(stack, embeddedModeData);
    }
    create(stack, embeddedModeData) {
        if (embeddedModeData !== null) {
            return new MonarchLineState(stack, embeddedModeData);
        }
        if (stack !== null && stack.depth >= this._maxCacheDepth) {
            return new MonarchLineState(stack, embeddedModeData);
        }
        let stackElementId = MonarchStackElement.getStackElementId(stack);
        let result = this._entries[stackElementId];
        if (result) {
            return result;
        }
        result = new MonarchLineState(stack, null);
        this._entries[stackElementId] = result;
        return result;
    }
}
MonarchLineStateFactory._INSTANCE = new MonarchLineStateFactory(CACHE_STACK_DEPTH);
class MonarchLineState {
    constructor(stack, embeddedModeData) {
        this.stack = stack;
        this.embeddedModeData = embeddedModeData;
    }
    clone() {
        let embeddedModeDataClone = this.embeddedModeData ? this.embeddedModeData.clone() : null;
        if (embeddedModeDataClone === this.embeddedModeData) {
            return this;
        }
        return MonarchLineStateFactory.create(this.stack, this.embeddedModeData);
    }
    equals(other) {
        if (!(other instanceof MonarchLineState)) {
            return false;
        }
        if (!this.stack.equals(other.stack)) {
            return false;
        }
        if (this.embeddedModeData === null && other.embeddedModeData === null) {
            return true;
        }
        if (this.embeddedModeData === null || other.embeddedModeData === null) {
            return false;
        }
        return this.embeddedModeData.equals(other.embeddedModeData);
    }
}
const hasOwnProperty$2 = Object.hasOwnProperty;
class MonarchClassicTokensCollector {
    constructor() {
        this._tokens = [];
        this._language = null;
        this._lastTokenType = null;
        this._lastTokenLanguage = null;
    }
    enterMode(startOffset, modeId) {
        this._language = modeId;
    }
    emit(startOffset, type) {
        if (this._lastTokenType === type && this._lastTokenLanguage === this._language) {
            return;
        }
        this._lastTokenType = type;
        this._lastTokenLanguage = this._language;
        this._tokens.push(new Token(startOffset, type, this._language));
    }
    nestedModeTokenize(embeddedModeLine, embeddedModeData, offsetDelta) {
        const nestedModeId = embeddedModeData.modeId;
        const embeddedModeState = embeddedModeData.state;
        const nestedModeTokenizationSupport = TokenizationRegistry.get(nestedModeId);
        if (!nestedModeTokenizationSupport) {
            this.enterMode(offsetDelta, nestedModeId);
            this.emit(offsetDelta, '');
            return embeddedModeState;
        }
        let nestedResult = nestedModeTokenizationSupport.tokenize(embeddedModeLine, embeddedModeState, offsetDelta);
        this._tokens = this._tokens.concat(nestedResult.tokens);
        this._lastTokenType = null;
        this._lastTokenLanguage = null;
        this._language = null;
        return nestedResult.endState;
    }
    finalize(endState) {
        return new TokenizationResult(this._tokens, endState);
    }
}
class MonarchModernTokensCollector {
    constructor(modeService, theme) {
        this._modeService = modeService;
        this._theme = theme;
        this._prependTokens = null;
        this._tokens = [];
        this._currentLanguageId = 0;
        this._lastTokenMetadata = 0;
    }
    enterMode(startOffset, modeId) {
        this._currentLanguageId = this._modeService.getLanguageIdentifier(modeId).id;
    }
    emit(startOffset, type) {
        let metadata = this._theme.match(this._currentLanguageId, type);
        if (this._lastTokenMetadata === metadata) {
            return;
        }
        this._lastTokenMetadata = metadata;
        this._tokens.push(startOffset);
        this._tokens.push(metadata);
    }
    static _merge(a, b, c) {
        let aLen = (a !== null ? a.length : 0);
        let bLen = b.length;
        let cLen = (c !== null ? c.length : 0);
        if (aLen === 0 && bLen === 0 && cLen === 0) {
            return new Uint32Array(0);
        }
        if (aLen === 0 && bLen === 0) {
            return c;
        }
        if (bLen === 0 && cLen === 0) {
            return a;
        }
        let result = new Uint32Array(aLen + bLen + cLen);
        if (a !== null) {
            result.set(a);
        }
        for (let i = 0; i < bLen; i++) {
            result[aLen + i] = b[i];
        }
        if (c !== null) {
            result.set(c, aLen + bLen);
        }
        return result;
    }
    nestedModeTokenize(embeddedModeLine, embeddedModeData, offsetDelta) {
        const nestedModeId = embeddedModeData.modeId;
        const embeddedModeState = embeddedModeData.state;
        const nestedModeTokenizationSupport = TokenizationRegistry.get(nestedModeId);
        if (!nestedModeTokenizationSupport) {
            this.enterMode(offsetDelta, nestedModeId);
            this.emit(offsetDelta, '');
            return embeddedModeState;
        }
        let nestedResult = nestedModeTokenizationSupport.tokenize2(embeddedModeLine, embeddedModeState, offsetDelta);
        this._prependTokens = MonarchModernTokensCollector._merge(this._prependTokens, this._tokens, nestedResult.tokens);
        this._tokens = [];
        this._currentLanguageId = 0;
        this._lastTokenMetadata = 0;
        return nestedResult.endState;
    }
    finalize(endState) {
        return new TokenizationResult2(MonarchModernTokensCollector._merge(this._prependTokens, this._tokens, null), endState);
    }
}
class MonarchTokenizer {
    constructor(modeService, standaloneThemeService, modeId, lexer) {
        this._modeService = modeService;
        this._standaloneThemeService = standaloneThemeService;
        this._modeId = modeId;
        this._lexer = lexer;
        this._embeddedModes = Object.create(null);
        let emitting = false;
        this._tokenizationRegistryListener = TokenizationRegistry.onDidChange((e) => {
            if (emitting) {
                return;
            }
            let isOneOfMyEmbeddedModes = false;
            for (let i = 0, len = e.changedLanguages.length; i < len; i++) {
                let language = e.changedLanguages[i];
                if (this._embeddedModes[language]) {
                    isOneOfMyEmbeddedModes = true;
                    break;
                }
            }
            if (isOneOfMyEmbeddedModes) {
                emitting = true;
                TokenizationRegistry.fire([this._modeId]);
                emitting = false;
            }
        });
    }
    dispose() {
        this._tokenizationRegistryListener.dispose();
    }
    getInitialState() {
        let rootState = MonarchStackElementFactory.create(null, this._lexer.start);
        return MonarchLineStateFactory.create(rootState, null);
    }
    tokenize(line, lineState, offsetDelta) {
        let tokensCollector = new MonarchClassicTokensCollector();
        let endLineState = this._tokenize(line, lineState, offsetDelta, tokensCollector);
        return tokensCollector.finalize(endLineState);
    }
    tokenize2(line, lineState, offsetDelta) {
        let tokensCollector = new MonarchModernTokensCollector(this._modeService, this._standaloneThemeService.getTheme().tokenTheme);
        let endLineState = this._tokenize(line, lineState, offsetDelta, tokensCollector);
        return tokensCollector.finalize(endLineState);
    }
    _tokenize(line, lineState, offsetDelta, collector) {
        if (lineState.embeddedModeData) {
            return this._nestedTokenize(line, lineState, offsetDelta, collector);
        }
        else {
            return this._myTokenize(line, lineState, offsetDelta, collector);
        }
    }
    _findLeavingNestedModeOffset(line, state) {
        let rules = this._lexer.tokenizer[state.stack.state];
        if (!rules) {
            rules = findRules(this._lexer, state.stack.state);
            if (!rules) {
                throwError(this._lexer, 'tokenizer state is not defined: ' + state.stack.state);
            }
        }
        let popOffset = -1;
        let hasEmbeddedPopRule = false;
        for (let idx in rules) {
            if (!hasOwnProperty$2.call(rules, idx)) {
                continue;
            }
            let rule = rules[idx];
            if (isIAction(rule.action) && rule.action.nextEmbedded !== '@pop') {
                continue;
            }
            hasEmbeddedPopRule = true;
            let regex = rule.regex;
            let regexSource = rule.regex.source;
            if (regexSource.substr(0, 4) === '^(?:' && regexSource.substr(regexSource.length - 1, 1) === ')') {
                regex = new RegExp(regexSource.substr(4, regexSource.length - 5), regex.ignoreCase ? 'i' : '');
            }
            let result = line.search(regex);
            if (result === -1) {
                continue;
            }
            if (popOffset === -1 || result < popOffset) {
                popOffset = result;
            }
        }
        if (!hasEmbeddedPopRule) {
            throwError(this._lexer, 'no rule containing nextEmbedded: "@pop" in tokenizer embedded state: ' + state.stack.state);
        }
        return popOffset;
    }
    _nestedTokenize(line, lineState, offsetDelta, tokensCollector) {
        let popOffset = this._findLeavingNestedModeOffset(line, lineState);
        if (popOffset === -1) {
            let nestedEndState = tokensCollector.nestedModeTokenize(line, lineState.embeddedModeData, offsetDelta);
            return MonarchLineStateFactory.create(lineState.stack, new EmbeddedModeData(lineState.embeddedModeData.modeId, nestedEndState));
        }
        let nestedModeLine = line.substring(0, popOffset);
        if (nestedModeLine.length > 0) {
            tokensCollector.nestedModeTokenize(nestedModeLine, lineState.embeddedModeData, offsetDelta);
        }
        let restOfTheLine = line.substring(popOffset);
        return this._myTokenize(restOfTheLine, lineState, offsetDelta + popOffset, tokensCollector);
    }
    _myTokenize(line, lineState, offsetDelta, tokensCollector) {
        tokensCollector.enterMode(offsetDelta, this._modeId);
        const lineLength = line.length;
        let embeddedModeData = lineState.embeddedModeData;
        let stack = lineState.stack;
        let pos = 0;
        let groupActions = null;
        let groupMatches = null;
        let groupMatched = null;
        let groupRule = null;
        while (pos < lineLength) {
            const pos0 = pos;
            const stackLen0 = stack.depth;
            const groupLen0 = groupActions ? groupActions.length : 0;
            const state = stack.state;
            let matches = null;
            let matched = null;
            let action = null;
            let rule = null;
            let enteringEmbeddedMode = null;
            if (groupActions) {
                matches = groupMatches;
                matched = groupMatched.shift();
                action = groupActions.shift();
                rule = groupRule;
                if (groupActions.length === 0) {
                    groupActions = null;
                    groupMatches = null;
                    groupMatched = null;
                    groupRule = null;
                }
            }
            else {
                if (pos >= lineLength) {
                    break;
                }
                let rules = this._lexer.tokenizer[state];
                if (!rules) {
                    rules = findRules(this._lexer, state);
                    if (!rules) {
                        throwError(this._lexer, 'tokenizer state is not defined: ' + state);
                    }
                }
                let restOfLine = line.substr(pos);
                for (let idx in rules) {
                    if (hasOwnProperty$2.call(rules, idx)) {
                        let rule = rules[idx];
                        if (pos === 0 || !rule.matchOnlyAtLineStart) {
                            matches = restOfLine.match(rule.regex);
                            if (matches) {
                                matched = matches[0];
                                action = rule.action;
                                break;
                            }
                        }
                    }
                }
            }
            if (!matches) {
                matches = [''];
                matched = '';
            }
            if (!action) {
                if (pos < lineLength) {
                    matches = [line.charAt(pos)];
                    matched = matches[0];
                }
                action = this._lexer.defaultToken;
            }
            pos += matched.length;
            while (isFuzzyAction(action) && isIAction(action) && action.test) {
                action = action.test(matched, matches, state, pos === lineLength);
            }
            let result = null;
            if (typeof action === 'string' || Array.isArray(action)) {
                result = action;
            }
            else if (action.group) {
                result = action.group;
            }
            else if (action.token !== null && action.token !== undefined) {
                if (action.tokenSubst) {
                    result = substituteMatches(this._lexer, action.token, matched, matches, state);
                }
                else {
                    result = action.token;
                }
                if (action.nextEmbedded) {
                    if (action.nextEmbedded === '@pop') {
                        if (!embeddedModeData) {
                            throwError(this._lexer, 'cannot pop embedded mode if not inside one');
                        }
                        embeddedModeData = null;
                    }
                    else if (embeddedModeData) {
                        throwError(this._lexer, 'cannot enter embedded mode from within an embedded mode');
                    }
                    else {
                        enteringEmbeddedMode = substituteMatches(this._lexer, action.nextEmbedded, matched, matches, state);
                    }
                }
                if (action.goBack) {
                    pos = Math.max(0, pos - action.goBack);
                }
                if (action.switchTo && typeof action.switchTo === 'string') {
                    let nextState = substituteMatches(this._lexer, action.switchTo, matched, matches, state);
                    if (nextState[0] === '@') {
                        nextState = nextState.substr(1);
                    }
                    if (!findRules(this._lexer, nextState)) {
                        throwError(this._lexer, 'trying to switch to a state \'' + nextState + '\' that is undefined in rule: ' + rule.name);
                    }
                    else {
                        stack = stack.switchTo(nextState);
                    }
                }
                else if (action.transform && typeof action.transform === 'function') {
                    throwError(this._lexer, 'action.transform not supported');
                }
                else if (action.next) {
                    if (action.next === '@push') {
                        if (stack.depth >= this._lexer.maxStack) {
                            throwError(this._lexer, 'maximum tokenizer stack size reached: [' +
                                stack.state + ',' + stack.parent.state + ',...]');
                        }
                        else {
                            stack = stack.push(state);
                        }
                    }
                    else if (action.next === '@pop') {
                        if (stack.depth <= 1) {
                            throwError(this._lexer, 'trying to pop an empty stack in rule: ' + rule.name);
                        }
                        else {
                            stack = stack.pop();
                        }
                    }
                    else if (action.next === '@popall') {
                        stack = stack.popall();
                    }
                    else {
                        let nextState = substituteMatches(this._lexer, action.next, matched, matches, state);
                        if (nextState[0] === '@') {
                            nextState = nextState.substr(1);
                        }
                        if (!findRules(this._lexer, nextState)) {
                            throwError(this._lexer, 'trying to set a next state \'' + nextState + '\' that is undefined in rule: ' + rule.name);
                        }
                        else {
                            stack = stack.push(nextState);
                        }
                    }
                }
                if (action.log && typeof (action.log) === 'string') {
                    log(this._lexer, this._lexer.languageId + ': ' + substituteMatches(this._lexer, action.log, matched, matches, state));
                }
            }
            if (result === null) {
                throwError(this._lexer, 'lexer rule has no well-defined action in rule: ' + rule.name);
            }
            if (Array.isArray(result)) {
                if (groupActions && groupActions.length > 0) {
                    throwError(this._lexer, 'groups cannot be nested: ' + rule.name);
                }
                if (matches.length !== result.length + 1) {
                    throwError(this._lexer, 'matched number of groups does not match the number of actions in rule: ' + rule.name);
                }
                let totalLen = 0;
                for (let i = 1; i < matches.length; i++) {
                    totalLen += matches[i].length;
                }
                if (totalLen !== matched.length) {
                    throwError(this._lexer, 'with groups, all characters should be matched in consecutive groups in rule: ' + rule.name);
                }
                groupMatches = matches;
                groupMatched = matches.slice(1);
                groupActions = result.slice(0);
                groupRule = rule;
                pos -= matched.length;
                continue;
            }
            else {
                if (result === '@rematch') {
                    pos -= matched.length;
                    matched = '';
                    matches = null;
                    result = '';
                }
                if (matched.length === 0) {
                    if (stackLen0 !== stack.depth || state !== stack.state || (!groupActions ? 0 : groupActions.length) !== groupLen0) {
                        continue;
                    }
                    else {
                        throwError(this._lexer, 'no progress in tokenizer in rule: ' + rule.name);
                        pos = lineLength;
                    }
                }
                let tokenType = null;
                if (isString$1(result) && result.indexOf('@brackets') === 0) {
                    let rest = result.substr('@brackets'.length);
                    let bracket = findBracket(this._lexer, matched);
                    if (!bracket) {
                        throwError(this._lexer, '@brackets token returned but no bracket defined as: ' + matched);
                        bracket = { token: '', bracketType: 0 };
                    }
                    tokenType = sanitize(bracket.token + rest);
                }
                else {
                    let token = (result === '' ? '' : result + this._lexer.tokenPostfix);
                    tokenType = sanitize(token);
                }
                tokensCollector.emit(pos0 + offsetDelta, tokenType);
            }
            if (enteringEmbeddedMode !== null) {
                let enteringEmbeddedModeId = this._modeService.getModeIdForLanguageName(enteringEmbeddedMode);
                if (enteringEmbeddedModeId) {
                    enteringEmbeddedMode = enteringEmbeddedModeId;
                }
                let embeddedModeData = this._getNestedEmbeddedModeData(enteringEmbeddedMode);
                if (pos < lineLength) {
                    let restOfLine = line.substr(pos);
                    return this._nestedTokenize(restOfLine, MonarchLineStateFactory.create(stack, embeddedModeData), offsetDelta + pos, tokensCollector);
                }
                else {
                    return MonarchLineStateFactory.create(stack, embeddedModeData);
                }
            }
        }
        return MonarchLineStateFactory.create(stack, embeddedModeData);
    }
    _getNestedEmbeddedModeData(mimetypeOrModeId) {
        let nestedMode = this._locateMode(mimetypeOrModeId);
        if (nestedMode) {
            let tokenizationSupport = TokenizationRegistry.get(nestedMode.getId());
            if (tokenizationSupport) {
                return new EmbeddedModeData(nestedMode.getId(), tokenizationSupport.getInitialState());
            }
        }
        let nestedModeId = nestedMode ? nestedMode.getId() : NULL_MODE_ID;
        return new EmbeddedModeData(nestedModeId, NULL_STATE);
    }
    _locateMode(mimetypeOrModeId) {
        if (!mimetypeOrModeId || !this._modeService.isRegisteredMode(mimetypeOrModeId)) {
            return null;
        }
        let modeId = this._modeService.getModeId(mimetypeOrModeId);
        this._modeService.getOrCreateMode(modeId);
        let mode = this._modeService.getMode(modeId);
        if (mode) {
            this._embeddedModes[modeId] = true;
            return mode;
        }
        this._embeddedModes[modeId] = true;
        return null;
    }
}
function findBracket(lexer, matched) {
    if (!matched) {
        return null;
    }
    matched = fixCase(lexer, matched);
    var brackets = lexer.brackets;
    for (var i = 0; i < brackets.length; i++) {
        var bracket = brackets[i];
        if (bracket.open === matched) {
            return { token: bracket.token, bracketType: 1 };
        }
        else if (bracket.close === matched) {
            return { token: bracket.token, bracketType: -1 };
        }
    }
    return null;
}
function createTokenizationSupport(modeService, standaloneThemeService, modeId, lexer) {
    return new MonarchTokenizer(modeService, standaloneThemeService, modeId, lexer);
}

function roundFloat(number, decimalPoints) {
    const decimal = Math.pow(10, decimalPoints);
    return Math.round(number * decimal) / decimal;
}
class RGBA {
    constructor(r, g, b, a = 1) {
        this.r = Math.min(255, Math.max(0, r)) | 0;
        this.g = Math.min(255, Math.max(0, g)) | 0;
        this.b = Math.min(255, Math.max(0, b)) | 0;
        this.a = roundFloat(Math.max(Math.min(1, a), 0), 3);
    }
    static equals(a, b) {
        return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
    }
}
class HSLA {
    constructor(h, s, l, a) {
        this.h = Math.max(Math.min(360, h), 0) | 0;
        this.s = roundFloat(Math.max(Math.min(1, s), 0), 3);
        this.l = roundFloat(Math.max(Math.min(1, l), 0), 3);
        this.a = roundFloat(Math.max(Math.min(1, a), 0), 3);
    }
    static equals(a, b) {
        return a.h === b.h && a.s === b.s && a.l === b.l && a.a === b.a;
    }
    static fromRGBA(rgba) {
        const r = rgba.r / 255;
        const g = rgba.g / 255;
        const b = rgba.b / 255;
        const a = rgba.a;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (min + max) / 2;
        const chroma = max - min;
        if (chroma > 0) {
            s = Math.min((l <= 0.5 ? chroma / (2 * l) : chroma / (2 - (2 * l))), 1);
            switch (max) {
                case r:
                    h = (g - b) / chroma + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / chroma + 2;
                    break;
                case b:
                    h = (r - g) / chroma + 4;
                    break;
            }
            h *= 60;
            h = Math.round(h);
        }
        return new HSLA(h, s, l, a);
    }
    static _hue2rgb(p, q, t) {
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    }
    static toRGBA(hsla) {
        const h = hsla.h / 360;
        const { s, l, a } = hsla;
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        }
        else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = HSLA._hue2rgb(p, q, h + 1 / 3);
            g = HSLA._hue2rgb(p, q, h);
            b = HSLA._hue2rgb(p, q, h - 1 / 3);
        }
        return new RGBA(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a);
    }
}
class HSVA {
    constructor(h, s, v, a) {
        this.h = Math.max(Math.min(360, h), 0) | 0;
        this.s = roundFloat(Math.max(Math.min(1, s), 0), 3);
        this.v = roundFloat(Math.max(Math.min(1, v), 0), 3);
        this.a = roundFloat(Math.max(Math.min(1, a), 0), 3);
    }
    static equals(a, b) {
        return a.h === b.h && a.s === b.s && a.v === b.v && a.a === b.a;
    }
    static fromRGBA(rgba) {
        const r = rgba.r / 255;
        const g = rgba.g / 255;
        const b = rgba.b / 255;
        const cmax = Math.max(r, g, b);
        const cmin = Math.min(r, g, b);
        const delta = cmax - cmin;
        const s = cmax === 0 ? 0 : (delta / cmax);
        let m;
        if (delta === 0) {
            m = 0;
        }
        else if (cmax === r) {
            m = ((((g - b) / delta) % 6) + 6) % 6;
        }
        else if (cmax === g) {
            m = ((b - r) / delta) + 2;
        }
        else {
            m = ((r - g) / delta) + 4;
        }
        return new HSVA(m * 60, s, cmax, rgba.a);
    }
    static toRGBA(hsva) {
        const { h, s, v, a } = hsva;
        const c = v * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = v - c;
        let [r, g, b] = [0, 0, 0];
        if (h < 60) {
            r = c;
            g = x;
        }
        else if (h < 120) {
            r = x;
            g = c;
        }
        else if (h < 180) {
            g = c;
            b = x;
        }
        else if (h < 240) {
            g = x;
            b = c;
        }
        else if (h < 300) {
            r = x;
            b = c;
        }
        else if (h < 360) {
            r = c;
            b = x;
        }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        return new RGBA(r, g, b, a);
    }
}
class Color {
    constructor(arg) {
        if (!arg) {
            throw new Error('Color needs a value');
        }
        else if (arg instanceof RGBA) {
            this.rgba = arg;
        }
        else if (arg instanceof HSLA) {
            this._hsla = arg;
            this.rgba = HSLA.toRGBA(arg);
        }
        else if (arg instanceof HSVA) {
            this._hsva = arg;
            this.rgba = HSVA.toRGBA(arg);
        }
        else {
            throw new Error('Invalid color ctor argument');
        }
    }
    static fromHex(hex) {
        return Color.Format.CSS.parseHex(hex) || Color.red;
    }
    get hsla() {
        if (this._hsla) {
            return this._hsla;
        }
        else {
            return HSLA.fromRGBA(this.rgba);
        }
    }
    get hsva() {
        if (this._hsva) {
            return this._hsva;
        }
        return HSVA.fromRGBA(this.rgba);
    }
    equals(other) {
        return !!other && RGBA.equals(this.rgba, other.rgba) && HSLA.equals(this.hsla, other.hsla) && HSVA.equals(this.hsva, other.hsva);
    }
    getRelativeLuminance() {
        const R = Color._relativeLuminanceForComponent(this.rgba.r);
        const G = Color._relativeLuminanceForComponent(this.rgba.g);
        const B = Color._relativeLuminanceForComponent(this.rgba.b);
        const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;
        return roundFloat(luminance, 4);
    }
    static _relativeLuminanceForComponent(color) {
        const c = color / 255;
        return (c <= 0.03928) ? c / 12.92 : Math.pow(((c + 0.055) / 1.055), 2.4);
    }
    getContrastRatio(another) {
        const lum1 = this.getRelativeLuminance();
        const lum2 = another.getRelativeLuminance();
        return lum1 > lum2 ? (lum1 + 0.05) / (lum2 + 0.05) : (lum2 + 0.05) / (lum1 + 0.05);
    }
    isDarker() {
        const yiq = (this.rgba.r * 299 + this.rgba.g * 587 + this.rgba.b * 114) / 1000;
        return yiq < 128;
    }
    isLighter() {
        const yiq = (this.rgba.r * 299 + this.rgba.g * 587 + this.rgba.b * 114) / 1000;
        return yiq >= 128;
    }
    isLighterThan(another) {
        const lum1 = this.getRelativeLuminance();
        const lum2 = another.getRelativeLuminance();
        return lum1 > lum2;
    }
    isDarkerThan(another) {
        const lum1 = this.getRelativeLuminance();
        const lum2 = another.getRelativeLuminance();
        return lum1 < lum2;
    }
    lighten(factor) {
        return new Color(new HSLA(this.hsla.h, this.hsla.s, this.hsla.l + this.hsla.l * factor, this.hsla.a));
    }
    darken(factor) {
        return new Color(new HSLA(this.hsla.h, this.hsla.s, this.hsla.l - this.hsla.l * factor, this.hsla.a));
    }
    transparent(factor) {
        const { r, g, b, a } = this.rgba;
        return new Color(new RGBA(r, g, b, a * factor));
    }
    isTransparent() {
        return this.rgba.a === 0;
    }
    isOpaque() {
        return this.rgba.a === 1;
    }
    opposite() {
        return new Color(new RGBA(255 - this.rgba.r, 255 - this.rgba.g, 255 - this.rgba.b, this.rgba.a));
    }
    blend(c) {
        const rgba = c.rgba;
        const thisA = this.rgba.a;
        const colorA = rgba.a;
        let a = thisA + colorA * (1 - thisA);
        if (a < 1.0e-6) {
            return Color.transparent;
        }
        const r = this.rgba.r * thisA / a + rgba.r * colorA * (1 - thisA) / a;
        const g = this.rgba.g * thisA / a + rgba.g * colorA * (1 - thisA) / a;
        const b = this.rgba.b * thisA / a + rgba.b * colorA * (1 - thisA) / a;
        return new Color(new RGBA(r, g, b, a));
    }
    toString() {
        return Color.Format.CSS.format(this);
    }
    static getLighterColor(of, relative, factor) {
        if (of.isLighterThan(relative)) {
            return of;
        }
        factor = factor ? factor : 0.5;
        const lum1 = of.getRelativeLuminance();
        const lum2 = relative.getRelativeLuminance();
        factor = factor * (lum2 - lum1) / lum2;
        return of.lighten(factor);
    }
    static getDarkerColor(of, relative, factor) {
        if (of.isDarkerThan(relative)) {
            return of;
        }
        factor = factor ? factor : 0.5;
        const lum1 = of.getRelativeLuminance();
        const lum2 = relative.getRelativeLuminance();
        factor = factor * (lum1 - lum2) / lum1;
        return of.darken(factor);
    }
}
Color.white = new Color(new RGBA(255, 255, 255, 1));
Color.black = new Color(new RGBA(0, 0, 0, 1));
Color.red = new Color(new RGBA(255, 0, 0, 1));
Color.blue = new Color(new RGBA(0, 0, 255, 1));
Color.green = new Color(new RGBA(0, 255, 0, 1));
Color.cyan = new Color(new RGBA(0, 255, 255, 1));
Color.lightgrey = new Color(new RGBA(211, 211, 211, 1));
Color.transparent = new Color(new RGBA(0, 0, 0, 0));
(function (Color) {
    let Format;
    (function (Format) {
        let CSS;
        (function (CSS) {
            function formatRGB(color) {
                if (color.rgba.a === 1) {
                    return `rgb(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b})`;
                }
                return Color.Format.CSS.formatRGBA(color);
            }
            CSS.formatRGB = formatRGB;
            function formatRGBA(color) {
                return `rgba(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b}, ${+(color.rgba.a).toFixed(2)})`;
            }
            CSS.formatRGBA = formatRGBA;
            function formatHSL(color) {
                if (color.hsla.a === 1) {
                    return `hsl(${color.hsla.h}, ${(color.hsla.s * 100).toFixed(2)}%, ${(color.hsla.l * 100).toFixed(2)}%)`;
                }
                return Color.Format.CSS.formatHSLA(color);
            }
            CSS.formatHSL = formatHSL;
            function formatHSLA(color) {
                return `hsla(${color.hsla.h}, ${(color.hsla.s * 100).toFixed(2)}%, ${(color.hsla.l * 100).toFixed(2)}%, ${color.hsla.a.toFixed(2)})`;
            }
            CSS.formatHSLA = formatHSLA;
            function _toTwoDigitHex(n) {
                const r = n.toString(16);
                return r.length !== 2 ? '0' + r : r;
            }
            function formatHex(color) {
                return `#${_toTwoDigitHex(color.rgba.r)}${_toTwoDigitHex(color.rgba.g)}${_toTwoDigitHex(color.rgba.b)}`;
            }
            CSS.formatHex = formatHex;
            function formatHexA(color, compact = false) {
                if (compact && color.rgba.a === 1) {
                    return Color.Format.CSS.formatHex(color);
                }
                return `#${_toTwoDigitHex(color.rgba.r)}${_toTwoDigitHex(color.rgba.g)}${_toTwoDigitHex(color.rgba.b)}${_toTwoDigitHex(Math.round(color.rgba.a * 255))}`;
            }
            CSS.formatHexA = formatHexA;
            function format(color) {
                if (!color) {
                    return null;
                }
                if (color.isOpaque()) {
                    return Color.Format.CSS.formatHex(color);
                }
                return Color.Format.CSS.formatRGBA(color);
            }
            CSS.format = format;
            function parseHex(hex) {
                if (!hex) {
                    return null;
                }
                const length = hex.length;
                if (length === 0) {
                    return null;
                }
                if (hex.charCodeAt(0) !== 35) {
                    return null;
                }
                if (length === 7) {
                    const r = 16 * _parseHexDigit(hex.charCodeAt(1)) + _parseHexDigit(hex.charCodeAt(2));
                    const g = 16 * _parseHexDigit(hex.charCodeAt(3)) + _parseHexDigit(hex.charCodeAt(4));
                    const b = 16 * _parseHexDigit(hex.charCodeAt(5)) + _parseHexDigit(hex.charCodeAt(6));
                    return new Color(new RGBA(r, g, b, 1));
                }
                if (length === 9) {
                    const r = 16 * _parseHexDigit(hex.charCodeAt(1)) + _parseHexDigit(hex.charCodeAt(2));
                    const g = 16 * _parseHexDigit(hex.charCodeAt(3)) + _parseHexDigit(hex.charCodeAt(4));
                    const b = 16 * _parseHexDigit(hex.charCodeAt(5)) + _parseHexDigit(hex.charCodeAt(6));
                    const a = 16 * _parseHexDigit(hex.charCodeAt(7)) + _parseHexDigit(hex.charCodeAt(8));
                    return new Color(new RGBA(r, g, b, a / 255));
                }
                if (length === 4) {
                    const r = _parseHexDigit(hex.charCodeAt(1));
                    const g = _parseHexDigit(hex.charCodeAt(2));
                    const b = _parseHexDigit(hex.charCodeAt(3));
                    return new Color(new RGBA(16 * r + r, 16 * g + g, 16 * b + b));
                }
                if (length === 5) {
                    const r = _parseHexDigit(hex.charCodeAt(1));
                    const g = _parseHexDigit(hex.charCodeAt(2));
                    const b = _parseHexDigit(hex.charCodeAt(3));
                    const a = _parseHexDigit(hex.charCodeAt(4));
                    return new Color(new RGBA(16 * r + r, 16 * g + g, 16 * b + b, (16 * a + a) / 255));
                }
                return null;
            }
            CSS.parseHex = parseHex;
            function _parseHexDigit(charCode) {
                switch (charCode) {
                    case 48: return 0;
                    case 49: return 1;
                    case 50: return 2;
                    case 51: return 3;
                    case 52: return 4;
                    case 53: return 5;
                    case 54: return 6;
                    case 55: return 7;
                    case 56: return 8;
                    case 57: return 9;
                    case 97: return 10;
                    case 65: return 10;
                    case 98: return 11;
                    case 66: return 11;
                    case 99: return 12;
                    case 67: return 12;
                    case 100: return 13;
                    case 68: return 13;
                    case 101: return 14;
                    case 69: return 14;
                    case 102: return 15;
                    case 70: return 15;
                }
                return 0;
            }
        })(CSS = Format.CSS || (Format.CSS = {}));
    })(Format = Color.Format || (Color.Format = {}));
})(Color || (Color = {}));

class ParsedTokenThemeRule {
    constructor(token, index, fontStyle, foreground, background) {
        this.token = token;
        this.index = index;
        this.fontStyle = fontStyle;
        this.foreground = foreground;
        this.background = background;
    }
}
function parseTokenTheme(source) {
    if (!source || !Array.isArray(source)) {
        return [];
    }
    let result = [], resultLen = 0;
    for (let i = 0, len = source.length; i < len; i++) {
        let entry = source[i];
        let fontStyle = -1;
        if (typeof entry.fontStyle === 'string') {
            fontStyle = 0;
            let segments = entry.fontStyle.split(' ');
            for (let j = 0, lenJ = segments.length; j < lenJ; j++) {
                let segment = segments[j];
                switch (segment) {
                    case 'italic':
                        fontStyle = fontStyle | 1;
                        break;
                    case 'bold':
                        fontStyle = fontStyle | 2;
                        break;
                    case 'underline':
                        fontStyle = fontStyle | 4;
                        break;
                }
            }
        }
        let foreground = null;
        if (typeof entry.foreground === 'string') {
            foreground = entry.foreground;
        }
        let background = null;
        if (typeof entry.background === 'string') {
            background = entry.background;
        }
        result[resultLen++] = new ParsedTokenThemeRule(entry.token || '', i, fontStyle, foreground, background);
    }
    return result;
}
function resolveParsedTokenThemeRules(parsedThemeRules) {
    parsedThemeRules.sort((a, b) => {
        let r = strcmp(a.token, b.token);
        if (r !== 0) {
            return r;
        }
        return a.index - b.index;
    });
    let defaultFontStyle = 0;
    let defaultForeground = '000000';
    let defaultBackground = 'ffffff';
    while (parsedThemeRules.length >= 1 && parsedThemeRules[0].token === '') {
        let incomingDefaults = parsedThemeRules.shift();
        if (incomingDefaults.fontStyle !== -1) {
            defaultFontStyle = incomingDefaults.fontStyle;
        }
        if (incomingDefaults.foreground !== null) {
            defaultForeground = incomingDefaults.foreground;
        }
        if (incomingDefaults.background !== null) {
            defaultBackground = incomingDefaults.background;
        }
    }
    let colorMap = new ColorMap();
    let defaults = new ThemeTrieElementRule(defaultFontStyle, colorMap.getId(defaultForeground), colorMap.getId(defaultBackground));
    let root = new ThemeTrieElement(defaults);
    for (let i = 0, len = parsedThemeRules.length; i < len; i++) {
        let rule = parsedThemeRules[i];
        root.insert(rule.token, rule.fontStyle, colorMap.getId(rule.foreground), colorMap.getId(rule.background));
    }
    return new TokenTheme(colorMap, root);
}
class ColorMap {
    constructor() {
        this._lastColorId = 0;
        this._id2color = [];
        this._color2id = new Map();
    }
    getId(color) {
        if (color === null) {
            return 0;
        }
        color = color.toUpperCase();
        if (!/^[0-9A-F]{6}$/.test(color)) {
            throw new Error('Illegal color name: ' + color);
        }
        let value = this._color2id.get(color);
        if (value) {
            return value;
        }
        value = ++this._lastColorId;
        this._color2id.set(color, value);
        this._id2color[value] = Color.fromHex('#' + color);
        return value;
    }
    getColorMap() {
        return this._id2color.slice(0);
    }
}
class TokenTheme {
    static createFromRawTokenTheme(source) {
        return this.createFromParsedTokenTheme(parseTokenTheme(source));
    }
    static createFromParsedTokenTheme(source) {
        return resolveParsedTokenThemeRules(source);
    }
    constructor(colorMap, root) {
        this._colorMap = colorMap;
        this._root = root;
        this._cache = new Map();
    }
    getColorMap() {
        return this._colorMap.getColorMap();
    }
    getThemeTrieElement() {
        return this._root.toExternalThemeTrieElement();
    }
    _match(token) {
        return this._root.match(token);
    }
    match(languageId, token) {
        let result = this._cache.get(token);
        if (typeof result === 'undefined') {
            let rule = this._match(token);
            let standardToken = toStandardTokenType(token);
            result = (rule.metadata
                | (standardToken << 8)) >>> 0;
            this._cache.set(token, result);
        }
        return (result
            | (languageId << 0)) >>> 0;
    }
}
const STANDARD_TOKEN_TYPE_REGEXP = /\b(comment|string|regex)\b/;
function toStandardTokenType(tokenType) {
    let m = tokenType.match(STANDARD_TOKEN_TYPE_REGEXP);
    if (!m) {
        return 0;
    }
    switch (m[1]) {
        case 'comment':
            return 1;
        case 'string':
            return 2;
        case 'regex':
            return 4;
    }
    throw new Error('Unexpected match for standard token type!');
}
function strcmp(a, b) {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
}
class ThemeTrieElementRule {
    constructor(fontStyle, foreground, background) {
        this._fontStyle = fontStyle;
        this._foreground = foreground;
        this._background = background;
        this.metadata = ((this._fontStyle << 11)
            | (this._foreground << 14)
            | (this._background << 23)) >>> 0;
    }
    clone() {
        return new ThemeTrieElementRule(this._fontStyle, this._foreground, this._background);
    }
    static cloneArr(arr) {
        let r = [];
        for (let i = 0, len = arr.length; i < len; i++) {
            r[i] = arr[i].clone();
        }
        return r;
    }
    acceptOverwrite(fontStyle, foreground, background) {
        if (fontStyle !== -1) {
            this._fontStyle = fontStyle;
        }
        if (foreground !== 0) {
            this._foreground = foreground;
        }
        if (background !== 0) {
            this._background = background;
        }
        this.metadata = ((this._fontStyle << 11)
            | (this._foreground << 14)
            | (this._background << 23)) >>> 0;
    }
}
class ExternalThemeTrieElement {
    constructor(mainRule, children) {
        this.mainRule = mainRule;
        this.children = children || Object.create(null);
    }
}
class ThemeTrieElement {
    constructor(mainRule) {
        this._mainRule = mainRule;
        this._children = new Map();
    }
    toExternalThemeTrieElement() {
        let children = Object.create(null);
        this._children.forEach((element, index) => {
            children[index] = element.toExternalThemeTrieElement();
        });
        return new ExternalThemeTrieElement(this._mainRule, children);
    }
    match(token) {
        if (token === '') {
            return this._mainRule;
        }
        let dotIndex = token.indexOf('.');
        let head;
        let tail;
        if (dotIndex === -1) {
            head = token;
            tail = '';
        }
        else {
            head = token.substring(0, dotIndex);
            tail = token.substring(dotIndex + 1);
        }
        let child = this._children.get(head);
        if (typeof child !== 'undefined') {
            return child.match(tail);
        }
        return this._mainRule;
    }
    insert(token, fontStyle, foreground, background) {
        if (token === '') {
            this._mainRule.acceptOverwrite(fontStyle, foreground, background);
            return;
        }
        let dotIndex = token.indexOf('.');
        let head;
        let tail;
        if (dotIndex === -1) {
            head = token;
            tail = '';
        }
        else {
            head = token.substring(0, dotIndex);
            tail = token.substring(dotIndex + 1);
        }
        let child = this._children.get(head);
        if (typeof child === 'undefined') {
            child = new ThemeTrieElement(this._mainRule.clone());
            this._children.set(head, child);
        }
        child.insert(tail, fontStyle, foreground, background);
    }
}

var languages = {};
var lexers = {};


function register(langId,config){
	languages[langId] =	languages[langId] || compile(langId,config);
	lexers[langId] = lexers[langId] || createTokenizationSupport(null,null,langId,languages[langId]);
	return lexers[langId];
}

function getLexer(langId){
	return lexers[langId];
}

function tokenize(langId,code,state){
	var lexer = lexers[langId];
	var state = state || lexer.getInitialState();
	// var lines = code.split('\n');
	return lexer.tokenize(code,state,0);
}

exports.register = register;
exports.getLexer = getLexer;
exports.tokenize = tokenize;
exports.TokenTheme = TokenTheme;
exports.parseTokenTheme = parseTokenTheme;
