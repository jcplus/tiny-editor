'use strict';
/**
 * @author James Chen <jcplus@gmail.com>
 * @version 0.0.1
 */

/**
 * TinyEditor is a tiny JavaScript text editor that can be applied quickly
 * to any web application and it's mobile friendly.
 *
 * @param  {String} contatinerSelector Selector of the container
 * @param  {Object} userConfig         JSON object of custom configuration
 * @return {void}
 */

var TinyEditor = function (contatinerSelector, userConfig) {
    // Initialise TinyLingual engine
    this.TL = new TinyLingual(navigator.language);

    if (typeof contatinerSelector === 'undefined') {
        throw this.TL.convert('Container selector of the editor is required!');
    }

    if (typeof contatinerSelector !== 'string' || contatinerSelector.trim() === '') {
        throw this.TL.convert('Container selector of the editor must be a valid string!');
    }

    this.container = document.querySelector(contatinerSelector);
    if (!this.container) {
        throw this.TL.convert('Cannot locate editor element by "%s"!', contatinerSelector);
    }

    // Merge config
    this.mergeConfig(userConfig);

    // Initialise
    this.init();
};

/**
 * Bind event to the toolbar buttons and build value list if applicable
 *
 * @param  {HTMLElement} button Toolbar button
 * @param  {Array}       values
 * @return {void}
 */
TinyEditor.prototype.bindButtonEvent = function (button, values) {
    var command = button.getAttribute('command'),
        that = this;
    if (values) {
        var ul = '<ul></ul>'.toElement('te-editor-button-multiple-values');
        for (var i = 0; i < values.length; i ++) {
            var value = values[i],
                li = '<li command="'.concat(command, '" value="').concat(values[i], '">').concat(values[i], '</li>').toElement('te-editor-button-value');

            li.on('mousedown', function (e) {
                e.preventDefault();
                button.removeClass('show-values');
                that.exec(e.target.getAttribute('command'), e.target.getAttribute('value'));
            });
            ul.append(li);
            button.append(ul);
        }
    }

    button.addEventListener('mousedown', function (e) {
        e.preventDefault();
        that.clickedButton = button;

        if (values) {
            button.addClass('show-values');
        } else {
            that.exec(command, '');
        }
    });
};

/**
 * Create an image upload dialog
 *
 * @return {void}
 */
TinyEditor.prototype.createImageFrom = function () {
    // Save selection
    this.getSelection();

    if (!this.toolbar.qs('.te-image-form')) {
        // Render form
        var form = '<div class="te-image-form web-mode">' +
                        '<div class="te-row">' +
                            '<div class="te-tab web">' + this.TL.convert('Web Image') + '</div>' +
                            '<div class="te-tab upload">' + this.TL.convert('Upload') + '</div>' +
                        '</div>' +
                        '<div class="te-row">' +
                            '<div class="te-col">' +
                                '<div class="te-preview">' +
                                    '<span class="te-preview-label">' + this.TL.convert('Drop Here') + '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="te-col">' +
                                '<div class="te-choose-file">' + this.TL.convert('Choose File') + '</div>' +
                                '<div class="te-row">' +
                                    '<button class="te-button upload">' + this.TL.convert('Upload') + '</button>' +
                                    '<button class="te-button cancel">' + this.TL.convert('Cancel') + '</button>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>'.toElement(),
            that = this;

        that.toolbar.append(form);
        repeat(10, function (repeatId) {
            if (that.toolbar.qs('.te-image-form')) {
                // Set width and position
                form.css({
                    top: that.toolbar.getBoundingClientRect().height + 'px',
                    width: (that.toolbar.getBoundingClientRect().width * 0.5) + 'px'
                });

                // Show form
                that.toolbar.addClass('show-image-form');

                // Switch to web image tab
                form.qs('.te-tab.web').on('click', function (e) {
                    e.preventDefault();
                    form.removeClass('upload-mode').addClass('web-mode');
                });

                // Switch to upload tab
                form.qs('.te-tab.upload').on('click', function (e) {
                    e.preventDefault();
                    form.removeClass('web-mode').addClass('upload-mode');
                });

                // Choose local files
                form.qs('.te-choose-file').on('click', function (e) {
                    e.preventDefault();
                    that.fileInput.attribute('upload-type', 'image');
                    that.fileInput.click();
                });

                // Upload to server
                form.qs('.te-button.upload').on('click', function (e) {
                    e.preventDefault();
                    that.restoreSelection();
                    that.exec('imsertImage', that.fileList);
                    that.toolbar.removeClass('show-image-form');
                });

                // Cancel
                form.qs('.te-button.cancel').on('click', function (e) {
                    e.preventDefault();
                    that.toolbar.removeClass('show-image-form');
                });

                clearInterval(repeatId);
            }
        });
    } else {
        // Show the form
        this.toolbar.addClass('show-image-form');
        this.toolbar.querySelector('.te-image-form .te-input').value = '';
        this.toolbar.querySelector('.te-image-form .te-input').focus();
    }
};

/**
 * Create or show the link input
 *
 * @return {void}
 */
TinyEditor.prototype.createLinkForm = function () {
    // Save selection
    this.getSelection();

    if (!this.toolbar.querySelector('.te-link-value-form')) {
        // Render form
        var buttonRow = 'div'.toElement('te-row'),
            buttonYes = '<button>OK</button>'.toElement('te-button'),
            buttonNo = '<button>Cancel</button>'.toElement('te-button'),
            form = 'div'.toElement('te-link-value-form'),
            input = 'input'.toElement('te-input'),
            that = this;

        input.setAttribute('placeholder', 'Enter URL');

        // Apply link to selection
        buttonYes.on('mousedown', function (e) {
            e.preventDefault();
            that.restoreSelection();
            that.exec('createLink', input.value.trim());
            that.toolbar.removeClass('show-link-form');
        });

        // Hide the form
        buttonNo.on('mousedown', function (e) {
            e.preventDefault();
            that.toolbar.removeClass('show-link-form');
        });

        // Append buttons to the row
        buttonRow.append(buttonNo).append(buttonYes);

        // Append child elements to the form
        form.append(input).append(buttonRow);

        // Append to toolbar
        that.toolbar.append(form);

        repeat(1, function (repeatId) {
            if (that.toolbar.qs('.te-link-value-form')) {
                form.css({
                    top: that.toolbar.getBoundingClientRect().height + 'px',
                    width: (that.toolbar.getBoundingClientRect().width * 0.5) + 'px'
                });
                that.toolbar.addClass('show-link-form');
                input.focus();
                clearInterval(repeatId);
            }
        });
    } else {
        // Show the form
        this.toolbar.addClass('show-link-form');
        this.toolbar.querySelector('.te-link-value-form .te-input').value = '';
        this.toolbar.querySelector('.te-link-value-form .te-input').focus();
    }
};

/**
 * [description]
 * @param  {String} command
 * @param  {String} value
 * @return {void}
 */
TinyEditor.prototype.exec = function (command, value) {
    console.log(command, value);
    switch (command) {
        case 'createLinkForm':
            this.createLinkForm();
            break;
        case 'heading':
            this.heading(value);
            break;
        case 'insertImageFrom':
            this.createImageFrom();
            break;
        case 'removeFormat':
            this.removeFormat();
            break;
        default:
            document.execCommand(command, false, (value || ''));
            break;
    }
};

/**
 * Get selection and store in
 *
 * @return {Boolean|Range}
 */
TinyEditor.prototype.getSelection = function () {
    var selection = window.getSelection();
    if (selection.rangeCount === 0) {
        return false;
    }
    this.selection = selection.getRangeAt(0);
    return this.selection;
};

/**
 * [description]
 * @param  {String}      command
 * @param  {String}      icon
 * @param  {Array}       values
 * @return {HTMLElement}
 */
TinyEditor.prototype.getToolButton = function (command, icon, values) {
    var button = ('<div class="te-tool-btn" command="' + command + '">' +
                    '<i class="' + icon + '"></i>'+
                '</div>').toElement();
    this.commandButtonEvent(btn, cmd, values);
    return btn;
};

/**
 * Event to hide button values
 *
 * @return {void}
 */
TinyEditor.prototype.globallyCloseTool = function () {
    document.addEventListener('click', function (e) {
        let allButtons = document.querySelectorAll('.te-tool-btn'),
            activeButton = null,
            currentValue = null,
            paths = e.path.splice(0, e.path.length - 4);

        if (paths.length) {
            for (var i = 0; i < paths.length; i ++) {
                // Current tool button is clicked and values are not shown yet
                if (paths[i].hasClass('te-tool-btn') && !paths[i].hasClass('show-values')) {
                    activeButton = paths[i];
                }

                // Current tool button value is clicked
                if (paths[i].hasClass('te-editor-button-value')) {
                    currentValue = paths[i];
                }
            }
        }

        if (allButtons.length) {
            for (var i = 0; i < allButtons.length; i ++) {
                if (activeButton !== allButtons[i]) {
                    allButtons[i].removeClass('show-values');
                }
            }
        }

        if (activeButton && !currentValue) {
            activeButton.addClass('show-values');
        }
    });
};

/**
 * Customise heading
 *
 * @param  {String} value
 * @return {void}
 */
TinyEditor.prototype.heading = function (value) {
    if (this.isSelectionOneLine()) {
        document.execCommand('formatBlock', false, (value || ''));
    }
};

/**
 * Get HTML string
 *
 * @return {String}
 */
TinyEditor.prototype.html = function () {
    var html = '',
        node = null;

    if (!this.textarea.childNodes.length) {
        return html;
    }

    for (var i = 0; i < this.textarea.childNodes.length; i ++) {
        node = this.textarea.childNodes[i];
        if (node.constructor === Text) {
            html += '<div>'.concat(node.textContent, '</div>');
        } else if (node.outerHTML.toLowerCase() === '<br>') {
            html += '<div></div>';
        } else {
            html += node.outerHTML;
        }
    }

    return html;
};

/**
 * Initialise the editor
 *
 * @return {void}
 */
TinyEditor.prototype.init = function () {
    this.id = randStr(this.config.idPrefix);
    this.editor = '<div id="'.concat(this.id, '">').toElement('te-editor');
    this.fileInput = '<input type="file" multiple style="display: none;">'.toElement('te-file-input');
    this.fileList = null;
    this.toolbar = '<div></div>'.toElement('te-toolbar');
    this.textarea = '<div></div>'.toElement('te-textarea');
    this.textarea.setAttribute('contenteditable', true);
    this.editor.append(this.toolbar).append(this.textarea).append(this.fileInput);
    this.container.append(this.editor);
    this.clickedButton = null;
    this.selection = null;
    this.renderToolbar();
    this.globallyCloseTool();
    this.fileInput.on('change', function (e) {
        console.log(e.target.files);
    });

    if (this.config.draggable) {
        this.editor.attr('draggable', true);
        this.toolbar.attr('draggable', true);
    }
};

/**
 * Return TRUE if the selection range is in one line
 *
 * @return {Boolean}
 */
TinyEditor.prototype.isSelectionOneLine = function (userConfig) {
    var selection = this.getSelection()
    if (
        !selection
        || !selection.startContainer.isSameNode(selection.endContainer)
    ) {
        return false;
    }
    return true;
};

/**
 * Merge default config and user config
 *
 * @return {void}
 */
TinyEditor.prototype.mergeConfig = function (userConfig) {
    this.config = {
        commands: {
            heading: {
                icon: 'te-icon-header',
                values: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6']
            },
            bold: {
                icon: 'te-icon-bold'
            },
            italic: {
                icon: 'te-icon-italic'
            },
            underline: {
                icon: 'te-icon-underline'
            },
            strikeThrough: {
                icon: 'te-icon-strike'
            },
            fontSize: {
                icon: 'te-icon-text-height',
                values: [1, 2, 3, 4, 5, 6, 7]
            },
            insertImageFrom: {
                icon: 'te-icon-image'
            },
            createLinkForm: {
                icon: 'te-icon-link'
            },
            unlink: {
                icon: 'te-icon-unlink'
            },
            justifyLeft: {
                icon: 'te-icon-align-left'
            },
            justifyCenter: {
                icon: 'te-icon-align-center'
            },
            justifyRight: {
                icon: 'te-icon-align-right'
            },
            justifyFull: {
                icon: 'te-icon-align-justify'
            },
            undo: {
                icon: 'te-icon-undo'
            },
            redo: {
                icon: 'te-icon-redo'
            },
            removeFormat: {
                icon: 'te-icon-trash'
            }
        },
        draggable: false,
        eventList: ['initialised'],
        idPrefix: 'tiny-editor-',
        lineBreakTagNames: ['BR', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P'],
        plugins: [],
        preserveLineBreaks: true,
        upload: {
            maxSize: '15k', // Pure number string means byte, appendix "k" means kilobyte or "m" means megabyte
            types: ['image/jpeg']
        }
    };

    if (typeof userConfig === 'object') {
        for (var key in userConfig) {
            if (
                userConfig.hasOwnProperty(key)
                && this.config.hasOwnProperty(key)
                && typeof userConfig[key] === typeof this.config[key]
            ) {
                // ID prefix must be a valid string
                if (key === 'idPrefix' && userConfig[key].trim() === '') {
                    throw this.TL.convert('"%s" cannot be empty!');
                }
                this.config[key] = userConfig[key];
            }
        }
    }
};

TinyEditor.prototype.on = function () {
    var args = Array.prototype.slice.call(arguments),
        eventName = null,
        callback = null,
        that = this;

    if (args.length < 2) {
        throw `TinyEditor.on requires two aruguments, ${args.length} given.`;
    }

    // Event name is always the first one
    eventName = args[0];
    callback = args[1];

    if (typeof eventName !== 'string' || that.config.eventList.indexOf(eventName.trim()) === -1) {
        throw `TinyEditor.on requires the event name to be a string and one of ${this.config.eventList.join(',')}.`;
    }

    if (typeof eventName !== 'string' || eventName.trim() === '') {
        throw `TinyEditor.on requires the event name to be a string and not empty.`;
    }

    if (typeof callback !== 'function') {
        throw `TinyEditor.on requires the callback to be a function, "${typeof callback}" given.`;
    }

    switch (eventName) {
        case 'initialised':
            callback(that.editor);
            break;
    }
};

/**
 * Render toolbar
 *
 * @return {void}
 */
TinyEditor.prototype.renderToolbar = function () {
    for (var command in this.config.commands) {
        if (this.config.commands.hasOwnProperty(command)) {
            var data = this.config.commands[command],
                icon = data.hasOwnProperty('icon') ? data.icon : '',
                values = data.hasOwnProperty('values') ? data.values : null,
                button = (`<div command="${command}">` +
                                `<i class="${icon}"></i>`+
                            `</div>`).toElement('te-tool-btn');
            this.bindButtonEvent(button, values);

            // Append to the toolbar element
            this.toolbar.append(button);
        }
    }
};

/**
 * Remove all format
 *
 * @return {void}
 */
TinyEditor.prototype.removeFormat = function () {
    var contents = [],
        fonts = this.textarea.querySelectorAll('font');

    // Reset all font size
    if (fonts.length) {
        for (var i = 0; i < fonts.length; i ++) {
            fonts[i].removeAttribute('size');
        }
    }

    // Select all content and remove format
    this.selectAll();
    document.execCommand('removeFormat', false, '');
    if (this.tx.childNodes.length) {
        this.tx.childNodes.forEach(node => {
            contents.push(node.textContent);
        });
    }

    this.tx.innerHTML = '';
    if (contents.length) {
        contents.map(c => {
            if (!c.length) {
                c = '&nbsp;';
            }
            this.tx.innerHTML += `<div>${c}</div>`;
        });
    }
};

/**
 * Restore selection range in the textarea
 *
 * @return {void}
 */
TinyEditor.prototype.restoreSelection = function () {
    console.log(this.selection);
    if (this.selection) {
        if (window.getSelection) {
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(this.selection);
        } else if (document.selection && this.selection.select) {
            this.selection.select();
        }
    }
};

/**
 * Select all
 *
 * @return {void}
 */
TinyEditor.prototype.selectAll = function () {
    var range = document.selection ? document.body.createTextRange() : document.createRange();
    if (document.selection) {
        range.moveToElementText(this.textarea);
        range.select();
    } else if (window.getSelection) {
        range.selectNode(this.textarea);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    }
};

/**
 * Get text of the editor
 *
 * @return {String}
 */
TinyEditor.prototype.text = function () {
    if (!this.textarea.childNodes.length) {
        return '';
    }

    var node = null,
        str = '';
    for (var i = 0; i < this.textarea.childNodes.length; i ++) {
        node = this.textarea.childNodes[i];
        // if (
        //     node.constructor !== Text
        //     && this.config.preserveLineBreaks
        //     && i > 0
        //     && typeof node.tagName !== 'undefined'
        //     && this.lineBreakTagNames.indexOf(node.tagName) > -1
        // ) {
        // }
        str += node.textContent;
        if (i < this.textarea.childNodes.length - 1) {
            str += "\n";
        }
    }
    return str;
};
