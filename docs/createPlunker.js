(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["createPlunker"] = factory();
	else
		root["createPlunker"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PLUNKER_FORM_URL", function() { return PLUNKER_FORM_URL; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Plunker", function() { return Plunker; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HtmlFile", function() { return HtmlFile; });
var PLUNKER_FORM_URL = 'https://plnkr.co/edit/?p=preview';
var CDN_BASE = 'https://unpkg.com/';
function isCssFile(filename) {
    return filename.endsWith('.css');
}
function isJsFile(filename) {
    return filename.endsWith('.js');
}
var Plunker = /** @class */ (function () {
    function Plunker(indexFile) {
        this.indexFile = indexFile;
        this.fields = [];
    }
    /**
     * Static factory method to create a new plunker
     * @returns {Plunker}
     */
    Plunker.create = function () {
        return new Plunker(new HtmlFile());
    };
    /**
     * Sets the description of the plunker
     * @param {string} description
     * @returns {Plunker}
     */
    Plunker.prototype.setDescription = function (description) {
        this.fields.push({ name: 'description', value: description });
        return this;
    };
    /**
     * Add a file to the plunker. By default will add a reference to js / css files to the index.html
     * @param {File} file
     * @param {boolean} skipAddToIndex
     * @returns {Plunker}
     */
    Plunker.prototype.addFile = function (file, skipAddToIndex) {
        if (skipAddToIndex === void 0) { skipAddToIndex = false; }
        this.fields.push({ name: "files[" + file.name + "]", value: file.contents });
        if (isCssFile(file.name) && !skipAddToIndex) {
            this.indexFile.addStylesheetFile(file.name);
        }
        else if (isJsFile(file.name) && !skipAddToIndex) {
            this.indexFile.addScriptFile(file.name);
        }
        return this;
    };
    /**
     * Add multiple files to the plunker
     * @param {File[]} files
     * @param {boolean} skipAddToIndex
     * @returns {Plunker}
     */
    Plunker.prototype.addFiles = function (files, skipAddToIndex) {
        var _this = this;
        if (skipAddToIndex === void 0) { skipAddToIndex = false; }
        files.forEach(function (file) { return _this.addFile(file, skipAddToIndex); });
        return this;
    };
    /**
     * Adds an attribute to the html tag of the index.html file
     * @param {string} name
     * @param {string} value
     * @returns {Plunker}
     */
    Plunker.prototype.addIndexHtmlAttribute = function (name, value) {
        this.indexFile.addHtmlAttribute(name, value);
        return this;
    };
    /**
     * Adds an attrbiute to the body tag of the index.html file
     * @param {string} name
     * @param {string} value
     * @returns {Plunker}
     */
    Plunker.prototype.addIndexBodyAttribute = function (name, value) {
        this.indexFile.addBodyAttribute(name, value);
        return this;
    };
    /**
     * Add a line to the head tag of the index.html file
     * @param {string} line
     * @returns {Plunker}
     */
    Plunker.prototype.addIndexHeadLine = function (line) {
        this.indexFile.addHeadLine(line);
        return this;
    };
    /**
     * Add an inline script to the index.html file
     * @param {string} source
     * @returns {Plunker}
     */
    Plunker.prototype.addInlineScript = function (source) {
        this.indexFile.addInlineScript(source);
        return this;
    };
    /**
     * Add an npm package to the plunker. Will be hosted with https://unpkg.com/
     * @param {string} packageName
     * @param {any} version
     * @param {any} filename
     * @returns {Plunker}
     */
    Plunker.prototype.addNpmPackage = function (packageName, _a) {
        var _b = _a === void 0 ? {} : _a, version = _b.version, filename = _b.filename;
        this.indexFile.addNpmPackage(packageName, { version: version, filename: filename });
        return this;
    };
    /**
     * Sets the body of the index.html file
     * @param {string} body
     * @returns {Plunker}
     */
    Plunker.prototype.setIndexBody = function (body) {
        this.indexFile.setBody(body);
        return this;
    };
    /**
     * Generates the plunker and by default opens the url for it in a new tab
     * @param {boolean} openInNewTab
     */
    Plunker.prototype.save = function (openInNewTab) {
        if (openInNewTab === void 0) { openInNewTab = true; }
        var form = document.createElement('form');
        form.style.display = 'none';
        form.setAttribute('method', 'post');
        form.setAttribute('action', PLUNKER_FORM_URL);
        if (openInNewTab) {
            form.setAttribute('target', '_blank');
        }
        var indexFile = { name: 'files[index.html]', value: this.indexFile.getHtml() };
        [indexFile].concat(this.fields).forEach(function (field) {
            var input = document.createElement('input');
            input.setAttribute('type', 'hidden');
            input.setAttribute('name', field.name);
            input.setAttribute('value', field.value);
            form.appendChild(input);
        });
        var submit = document.createElement('input');
        submit.setAttribute('type', 'submit');
        submit.setAttribute('value', 'submit');
        submit.innerHTML = 'Submit';
        form.appendChild(submit);
        document.body.appendChild(form);
        submit.click();
        document.body.removeChild(form);
    };
    return Plunker;
}());

function stringifyAttributes(attributes) {
    var attributesString = attributes.map(function (_a) {
        var name = _a.name, value = _a.value;
        return name + "=\"" + value + "\"";
    }).join(' ');
    if (attributesString) {
        return " " + attributesString;
    }
    return attributesString;
}
var HtmlFile = /** @class */ (function () {
    function HtmlFile() {
        this.htmlAttributes = [];
        this.bodyAttributes = [];
        this.headLines = [];
        this.body = '';
    }
    HtmlFile.prototype.addHtmlAttribute = function (name, value) {
        this.htmlAttributes.push({ name: name, value: value });
        return this;
    };
    HtmlFile.prototype.addBodyAttribute = function (name, value) {
        this.bodyAttributes.push({ name: name, value: value });
        return this;
    };
    HtmlFile.prototype.addHeadLine = function (line) {
        this.headLines.push(line);
        return this;
    };
    HtmlFile.prototype.addScriptFile = function (url) {
        return this.addHeadLine("<script src=\"" + url + "\"></script>");
    };
    HtmlFile.prototype.addStylesheetFile = function (url) {
        return this.addHeadLine("<link href=\"" + url + "\" rel=\"stylesheet\">");
    };
    HtmlFile.prototype.addInlineScript = function (source) {
        return this.addHeadLine("<script>\n    " + source + "\n    </script>");
    };
    HtmlFile.prototype.addNpmPackage = function (packageName, _a) {
        var _b = _a === void 0 ? {} : _a, version = _b.version, filename = _b.filename;
        var url = "" + CDN_BASE + packageName;
        if (version) {
            url += "@" + version;
        }
        if (filename) {
            url += "/" + filename;
        }
        if (filename && isCssFile(filename)) {
            return this.addStylesheetFile(url);
        }
        else {
            return this.addScriptFile(url);
        }
    };
    HtmlFile.prototype.setBody = function (body) {
        this.body = body;
        return this;
    };
    HtmlFile.prototype.getHtml = function () {
        return ("\n    \n<!DOCTYPE html>\n<html" + stringifyAttributes(this.htmlAttributes) + ">\n  <head>\n    " + this.headLines.join('\n    ') + "\n  </head>\n  <body" + stringifyAttributes(this.bodyAttributes) + ">\n    " + this.body + "\n  </body>\n</html>\n\n").trim();
    };
    return HtmlFile;
}());



/***/ })
/******/ ]);
});