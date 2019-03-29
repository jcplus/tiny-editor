'use strict';

/**
 * TinyUtil provides utilities that can help in tiny requirements
 *
 * @author James Chen <jcplus@gmail.com>
 * @version 0.0.1
 */

/**
 * Lazy load image
 *
 * @param  {String}  url Image URL
 * @return {Promise}     Promise object
 */
var loadImg = function (url) {
    if (typeof url !== 'string' || url.trim() === '') {
        throw 'Url is required and cannot be empty!';
    }

    return new Promise(function (resolve, reject) {
        var imgObj = new Image;
        imgObj.onload = resolve;
        imgObj.onerror = reject;
        imgObj.src = url;
    });
};

/**
 * Generate a random hex string
 *
 * @return {String} Generated string
 */
var randHex = function () {
    var args = Array.prototype.slice.call(arguments),
        chars = 'abcdef0123456789',
        length = 16,
        str = '';

    // Get the input length if available and the length can only be integer
    if (args.length && typeof args[0] === 'number' && args[0] > 0) {
        length = parseInt(Math.ceil(args[0]));
    }

    for (var i = 0; i < length; i ++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
};

/**
 * Generate a random string with or without prefix
 *
 * @return {String} Generated string
 */
var randStr = function () {
    var args = Array.prototype.slice.call(arguments),
        hex = '',
        length = 16,
        prefix = '',
        str = '';

    if (args.length) {
        // Get the input length if available and the length can only be integer
        if (typeof args[0] === 'number' && args[0] > 0) {
            length = parseInt(Math.ceil(args[0]));
        }

        // Get the input prefix. String in position 0 has higher priority
        if (typeof args[0] === 'string' && args[0].trim() !== '') {
            prefix = args[0].trim();
        } else if (typeof args[1] === 'string' && args[1].trim() !== '') {
            prefix = args[1].trim();
        }
    }

    // Get the random hex string first
    hex = randHex(length);
    return prefix + hex;
};

/**
 * Alternative of document.querySelector
 *
 * @param  {String}           selector
 * @return {HTMLElement|NULL}
 */
var qs = function (selector) {
    if (typeof selector !== 'string' || selector.trim() === '') {
        return null;
    }

    return document.querySelector(selector);
};

/**
 * Alternative of document.querySelectorAll
 *
 * @param  {String}   selector
 * @return {NodeList}
 */
var qsa = function (selector) {
    if (typeof selector !== 'string' || selector.trim() === '') {
        return document.querySelectorAll(randStr(256, 'z'));
    }

    return document.querySelectorAll(selector);
};

/**
 * Interval timer
 * The interval requires a stop() to stop itself
 * Usage:
 * repeat(1000, function (intervalId) {
 *     // Repeat callback function
 *     // Stop interval when needed
 *     clearInterval(intervalId);
 * })
 *
 * @param  {Number}   ms       Milliseconds
 * @param  {Function} callback Function to execute every interval
 * @return {Promise}           Promise object
 */
var repeat = function (ms, callback) {
    var intervalId = 0;

    if (typeof ms !== 'number' || parseInt(ms) < 1) {
        throw 'Milliseconds must be defined and greater than 1!';
    }

    if (typeof callback !== 'function') {
        throw 'Callback must be a function!';
    }

    return new Promise(function (resolve) {
        intervalId = setInterval(function () {
            callback(intervalId);
        }, parseInt(ms));
        resolve(intervalId);
    });
};

/**
 * A timeout feature using Promise
 * Internet Explorer is not supported
 * Usage:
 * wait(1000).then(// Callback after timeout)
 *
 * @param  {Number} ms Milliseconds must be positive, float will be parsed
 * @return {Promise}   Promise object
 */
var wait = function (ms) {
    var timeoutId = 0;

    if (typeof ms !== 'number' || parseInt(ms) < 1) {
        throw 'Milliseconds must be defined and greater than 1!';
    }

    return new Promise(function (resolve) {
        timeoutId = setTimeout(function () {
            resolve();
            clearTimeout(timeoutId);
        }, parseInt(ms));
    });
};

/**
 * Alternative of jQuery addClass method
 *
 * @param  {Array|String} classes Array or string of class
 * @return {void}
 */
Element.prototype.addClass = function (classes) {
    if (typeof classes === 'string') {
        if (classes.trim().indexOf(' ') > -1) {
            classes = classes.trim().split(/\s+/g);
        } else {
            classes = [classes.trim()];
        }
    }

    for (var i = 0; i < classes.length; i ++) {
        this.classList.add(classes[i].trim());
    }
    return this;
};

Element.prototype.appendChildren = function (elements) {
    if (elements.length) {
        for (var i = 0; i < elements.length; i ++) {
            this.appendChild(elements[i]);
        }
    }
};

Element.prototype.append = function (elements) {
    if (typeof elements !== 'undefined') {
        if (elements instanceof HTMLElement) {
            this.appendChild(elements);
        }

        if (elements instanceof NodeList) {
            for (var i = 0; i < elements.length; i ++) {
                this.appendChild(elements[i]);
            }
        }
    }
    return this;
};

/**
 * Alternative of jQuery attr method
 *
 * @return {Element}
 */
Element.prototype.attr = function () {
    var args = Array.prototype.slice.call(arguments),
        key = null,
        value = null;

    if (
        typeof args[0] === 'string'
        && args[0].trim() !== ''
    ) {
        key = args[0].trim();
        value = typeof args[1] !== 'undefined' ? args[1] : '';
        this.setAttribute(key, value);
    }
    return this;
};

/**
 * Alternative of jQuery css method
 *
 * @return {void}
 */
Element.prototype.css = function () {
    var args = Array.prototype.slice.call(arguments),
        styles = {};

    if (
        args.length === 1
        && typeof args[0] === 'object'
        && args[0].constructor === Object
    ) {
        styles = args[0];
    }

    if (
        args.length === 2
        && typeof args[0] === 'string'
        && args[0].trim() !== ''
        && (
            (
                typeof args[1] === 'string'
                && args[1].trim() !== ''
            )
            || typeof args[1] === 'number'
        )
    ) {
        styles[args[0].trim()] = typeof args[1] === 'string' ? args[1].trim() : args[1];
    }

    for (var key in styles) {
        this.style[key] = styles[key];
    }
};

/**
 * Alternative of jQuery hasClass method
 *
 * @param  {String} str
 * @return {void}
 */
Element.prototype.hasClass = function (str) {
    if (typeof str === 'string') {
        return this.classList.contains(str.trim());
    }
    return false;
};

/**
 * Lazy load image to the element
 *
 * @param  {String} url
 * @return {void}
 */
Element.prototype.loadImg = function (url) {
    var element = this;

    if (typeof url !== 'string' || url.trim() === '') {
        throw 'URL is required and cannot be empty!';
    }

    loadImg(url)
    .then(function () {
        element.setAttribute('src', url);
    })
    .catch(function (err) {
        console.warn(`Failed to load "${url}"!`);
    })
};

/**
 * Alternative of jQuery on method
 *
 * @return {void}
 */
Element.prototype.on = function () {
    var args = Array.prototype.slice.call(arguments),
        // element = this,
        elements = [this],
        eventName = null,
        childSelector = null,
        callback = null;

    if (args.length < 2) {
        throw 'At least two aruguments are requied.';
    }

    // Event name is always the first one
    eventName = args[0];

    if (typeof args[2] !== 'undefined') {
        callback = args[2];
        childSelector = args[1];
    } else {
        callback = args[1];
    }

    // Validate
    if (typeof eventName !== 'string' || eventName.trim() === '') {
        throw 'Selector must be a valid string!';
    }

    if (childSelector !== null && (typeof childSelector !== 'string' || childSelector.trim() === '')) {
        throw 'Child selector must be a valid string if applicable!';
    }

    if (typeof callback !== 'function') {
        throw 'Callback must be a function!';
    }

    if (childSelector !== null) {
        elements = this.querySelectorAll(childSelector);
        if (!elements.length) {
            console.warn(`Cannot find any child elements under parent.`);
            return;
        }
    }

    for (var i = 0; i < elements.length; i ++) {
        elements[i].addEventListener(eventName, function (e) {
            callback(e);
        });
    }
};

/**
 * Alternative of document.querySelector
 *
 * @param  {String}           selector
 * @return {HTMLElement|NULL}
 */
Element.prototype.qs = function (selector) {
    if (typeof selector !== 'string' || selector.trim() === '') {
        return null;
    }

    return this.querySelector(selector);
};

/**
 * Alternative of document.querySelectorAll
 *
 * @param  {String}   selector
 * @return {NodeList}
 */
Element.prototype.qsa = function (selector) {
    if (typeof selector !== 'string' || selector.trim() === '') {
        return document.querySelectorAll(randStr(256, 'z'));
    }

    return this.querySelectorAll(selector);
};

/**
 * Alternative of jQuery removeClass method
 *
 * @param  {Array|String} classes Array or string of class
 * @return {void}
 */
Element.prototype.removeClass = function (classes) {
    if (typeof classes === 'string') {
        if (classes.trim().indexOf(' ') > -1) {
            classes = classes.trim().split(/\s+/g);
        } else {
            classes = [classes.trim()];
        }
    }

    for (var i = 0; i < classes.length; i ++) {
        this.classList.remove(classes[i].trim());
    }
    return this;
};

/**
 * Alternative of jQuery attr method
 *
 * @return {NodeList}
 */
NodeList.prototype.attr = function () {
    var args = Array.prototype.slice.call(arguments),
        key = null,
        value = null;

    if (
        typeof args[0] === 'string'
        && args[0].trim() !== ''
    ) {
        key = args[0].trim();
        value = typeof args[1] !== 'undefined' ? args[1] : '';

        for (var i = 0; i < this.length; i ++) {
            this[i].setAttribute(key, value);
        }
    }
    return this;
};

/**
 * Alternative of jQuery css method
 *
 * @return {void}
 */
NodeList.prototype.css = function () {
    var args = Array.prototype.slice.call(arguments),
        styles = {};

    if (
        args.length === 1
        && typeof args[0] === 'object'
        && args[0].constructor === Object
    ) {
        styles = args[0];
    }

    if (
        args.length === 2
        && typeof args[0] === 'string'
        && args[0].trim() !== ''
        && (
            (
                typeof args[1] === 'string'
                && args[1].trim() !== ''
            )
            || typeof args[1] === 'number'
        )
    ) {
        styles[args[0].trim()] = typeof args[1] === 'string' ? args[1].trim() : args[1];
    }

    for (var i = 0; i < this.length; i ++) {
        this[i].css(styles);
    }
};

/**
 * Lazy load image to the element
 *
 * @param  {String} url
 * @return {void}
 */
NodeList.prototype.loadImg = function (url) {
    var elements = this;

    if (typeof url === 'string' && url.trim() === '') {
        throw 'URL is required and cannot be empty!';
    }

    for (var i = 0; i < elements.length; i ++) {
        var element = elements[i];
        loadImg(url)
        .then(function () {
            element.setAttribute('src', url);
        })
        .catch(function (err) {
            console.warn(`Failed to load "${url}"!`);
        })
    }
};

/**
 * Alternative of jQuery on method
 *
 * @return {void}
 */
NodeList.prototype.on = function () {
    var args = Array.prototype.slice.call(arguments),
        // element = this,
        elements = this,
        eventName = null,
        childSelector = null,
        callback = null;

    if (args.length < 2) {
        throw 'At least two aruguments are requied.';
    }

    // Event name is always the first one
    eventName = args[0];

    if (typeof args[2] !== 'undefined') {
        callback = args[2];
        childSelector = args[1];
    } else {
        callback = args[1];
    }

    // Validate
    if (typeof eventName !== 'string' || eventName.trim() === '') {
        throw 'Selector must be a valid string!';
    }

    if (childSelector !== null && (typeof childSelector !== 'string' || childSelector.trim() === '')) {
        throw 'Child selector must be a valid string if applicable!';
    }

    if (typeof callback !== 'function') {
        throw 'Callback must be a function!';
    }

    if (childSelector !== null) {
        for (var i = 0; i < elements.length; i ++) {
            elements[i].on(eventName, childSelector, callback);
        }
        return;
    }

    for (var i = 0; i < elements.length; i ++) {
        elements[i].on(eventName, childSelector, callback);
    }
};

/**
 * Check if an object is empty
 *
 * @return {Boolean}
 */
Object.prototype.empty = function () {
    for(var key in this) {
        if(this.hasOwnProperty(key))
            return false;
    }
    return true;
};

/**
 * Escape HTML special characters
 *
 * @return {String} HTML safe string
 */
String.prototype.escapeHtml = function () {
    return this
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
};

/**
 * A quick way to convert string to HTML element
 *
 * @return {HTMLElement}
 */
String.prototype.toElement = function () {
    var args = Array.prototype.slice.call(arguments),
        classes = null,
        container = document.createElement('div'),
        result = null,
        str = this,
        textOnly = false;

    if (typeof args[0] === 'boolean') {
        textOnly = args[0];
        if (typeof args[1] === 'string') {
            classes = args[1];
        }
    }

    if (typeof args[0] === 'string') {
        classes = args[0];
        if (typeof args[1] === 'boolean') {
            textOnly = args[1];
        }
    }

    // Generate tag directly from the string
    // if textOnly is FALSe and the string is not HTML
    if (
        !textOnly
        && str.indexOf('<') === -1
        && str.indexOf('>') === -1
        && str.indexOf('/') === -1
    ) {
        str = `<${str}></${str}>`;
    } else if (textOnly) {
        str = str.escapeHtml();
    }

    container.innerHTML = str;
    switch (container.childElementCount) {
        case 0:
            result = container;
            break;
        case 1:
            result = container.firstElementChild;
            break;
        default:
            result = container.childNodes;
            break;
    }

    if (classes) {
        if (result.constructor === NodeList) {
            for (var i = 0; i < result.length; i ++) {
                result[i].addClass(classes);
            }
        } else {
            result.addClass(classes);
        }
    }
    return result;
};
