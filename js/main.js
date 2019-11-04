(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
var generateId = require("./generateId");

/**
 * Toto je defaultní nastavení, které je použito v případě, že u tagu nějaké nastavení chybí.
 */
let defaultTagConfig = {
    "hasEndTag": true,
    "skip": false,
    "ignore": false,
    "replacements": {},
    "allowed": {
        "attributes": []
    },
    "automation": null
}

let headerReplacement = {
    "hasEndTag": true,
    "replacements": {
        "tag": "UU5.Bricks.Section",
        "attributes": {}
    },
    "automation": {
        "attributes": (me) => {
            let args = me.args;
            // Vezme obsah tagu h<1-6> a vloží ho do argumentu header.
            // Pokud jde jen o text, vloží se text jako takový.
            // Pokud jde o více tagu, přihodí se ještě <uu5string/> před samotný kód
            args["header"] = (me.children.length == 1 && me.children[0].getTagName() == "text" ? "" : "<uu5string/>") + me.children.map(c => c.toString()).join("");
            args["id"] = generateId();
            args["level"] = parseInt(me.getTagName().substr(-1));
            return args;
        },
        "content": (me) => {
            me.children = []; // Všechny děti jsou v argumentu header

            let siblings = me.parent.children.slice(me.parent.children.findIndex(e => e == me) + 1);

            for (let sibling of siblings) {
                // Jde taky o nadpis
                if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(sibling.getTagName())) {

                    let sibling_level = parseInt(sibling.getTagName().substr(-1));

                    // Je nižší nebo stejný level?
                    if (sibling_level <= me.args.level) {
                        break;
                    }
                }

                // Odstraní sourozence z rodiče a přidá jako rodiče tuto sekci
                me.parent.children = me.parent.children.filter(e => e != sibling);
                me.children.push(sibling);
                sibling.parent = me;
            }

            // Nejde jednoduše zavolat me.toString(), protože to by vyvolalo
            // další automatizaci a tím by vznikla nekonečná smyčka.
            let children_tags = [];

            for (let i = 0; i < me.children.length; i++) {
                children_tags.push(me.children[i].toString());
            }

            return `${children_tags.join("")}`;
        }
    },
    "allowed": {
        "attributes": []
    }
};

let config = {
    "strictMode": true,
    "addContentIndex": true,
    "replacements": {
        "colgroup": {
            "skip": true
        },
        "col": {
            "skip": true
        },
        "table": {
            "hasEndTag": true,
            "replacements": {
                "tag": "UU5.Bricks.Table",
                "attributes": {}
            },
            "allowed": {
                "attributes": []
            }
        },
        "tbody": {
            "skip": true
        },
        "tr": {
            "hasEndTag": true,
            "replacements": {
                "tag": "UU5.Bricks.Table.Tr",
                "argument": {}
            },
            "allowed": {
                "attributes": []
            }
        },
        "th": {
            "hasEndTag": true,
            "replacements": {
                "tag": "UU5.Bricks.Table.Th",
                "attributes": {
                    "colspan": "colSpan"
                }
            },
            "allowed": {
                "attributes": ["colspan", "rowspan"]
            }
        },
        "td": {
            "hasEndTag": true,
            "replacements": {
                "tag": "UU5.Bricks.Table.Td",
                "attributes": {
                    "colspan": "colSpan",
                    "rowspan": "rowSpan"
                }
            },
            "allowed": {
                "attributes": ["colspan", "rowspan"]
            }
        },
        "code": {
            "hasEndTag": true,
            "replacements": {
                "tag": "UU5.Bricks.Code",
                "attributes": {}
            },
            "allowed": {
                "attributes": []
            }
        },
        "p": {
            "hasEndTag": true,
            "replacements": {
                "tag": "UU5.Bricks.P",
                "attributes": {}
            },
            "allowed": {
                "attributes": []
            },
            "automation": {
                "content": (me) => {
                    // Z nějakého důvodu nelze, aby obrázek byl v tagu P. Pokud se to stane,
                    // odebere se tag P a místo něj se vloží samotný obrázek.
                    if (me.children.length == 1 && me.children[0].getTagName() == "ac:image") {
                        console.log("Je to obrázek");

                        // Najdu sám sebe v rodičovi
                        let myIndex = me.parent.children.find(c => c == me);
                        console.log("Můj index: " + myIndex);
                        // Nastavím obrázek jako potomka rodiče hned za tímto paragrafem
                        me.parent.children = me.parent.children.splice(myIndex, 0, me.children[0]);
                        me.children[0].parent = me.parent;

                        me.children = [];
                        return "";
                    }

                    console.log("Není img");
                    return me.children.map(c => c.toString()).join("");
                }
            }
        },
        "span": {
            "hasEndTag": true,
            "replacements": {
                "tag": "UU5.Bricks.Span",
                "attributes": {}
            },
            "allowed": {
                "attributes": [
                    "style"
                ]
            },
            "automation": {
                "attributes": (me) => {
                    // uu používá místo pomlčkou oddělených slov camelCase pro zápis
                    // jednotlivých CSS vlastností
                    let style_string = "style" in me.args ? me.args.style : "";

                    if (style_string.length == 0) {
                        return me.args;
                    }

                    me.args.style = style_string.replace(/-([a-z])/g, g => {
                        return g[1].toUpperCase();
                    });

                    return me.args;
                }
            }
        },
        "div": {
            "hasEndTag": true,
            "replacements": {
                "tag": "UU5.Bricks.Div",
                "attributes": {}
            },
            "allowed": {
                "attributes": []
            }
        },
        "strong": {
            "hasEndTag": true,
            "replacements": {
                "tag": "strong",
                "attributes": {}
            },
            "allowed": {
                "attributes": []
            }
        },
        "i": {
            "hasEndTag": true,
            "replacements": {
                "tag": "i",
                "attributes": {}
            },
            "allowed": {
                "attributes": []
            }
        },
        "u": {
            "hasEndTag": true,
            "replacements": {
                "tag": "u",
                "attributes": {}
            },
            "allowed": {
                "attributes": []
            }
        },
        "h1": headerReplacement,
        "h2": headerReplacement,
        "h3": headerReplacement,
        "h4": headerReplacement,
        "h5": headerReplacement,
        "h6": headerReplacement,
        "br": {},
        "ol": {
            "hasEndTag": true,
            "replacements": {
                "tag": "UU5.Bricks.Ol"
            },
            "allowed": {
                "attributes": []
            }
        },
        "ul": {
            "hasEndTag": true,
            "replacements": {
                "tag": "UU5.Bricks.Ul"
            },
            "allowed": {
                "attributes": []
            }
        },
        "li": {
            "hasEndTag": true,
            "replacements": {
                "tag": "UU5.Bricks.Li"
            },
            "allowed": {
                "attributes": []
            }
        },
        "ac:structured-macro": {
            "hasEndTag": false,
            "replacements": {
                "tag": "UU5.RichText.Block",
                "attributes": {
                    "ac:name": "name"
                }
            },
            "allowed": {
                "attributes": [
                    "ac:name"
                ]
            },
            "automation": {
                "attributes": (me) => {
                    if ("name" in me.args) {
                        if (me.args.name == "code") {
                            let children = me.children.filter(c => c.getTagName() == "text");
                            me.children = [];

                            me.args["uu5string"] = JSON.stringify(`<uu5string/><UU5.Bricks.Code content="${children.map(c=>c.toString()).join('')}"/>`).replace(/^("\\")/, "").replace(/(\\"")$/g, "").replace(/^"+/, "").replace(/"+$/, "");
                            delete me.args.name;

                            return me.args;
                        }

                        if (me.args.name == "details") {
                            // Najde v obsahu tag <ac:rich-text-body> a jako obsah nastaví jeho 
                            let new_children = me.children.filter(c => c.getTagName() == "ac:rich-text-body")[0].children;
                            me.children = [];
                            new_children.map(c => me.addChild(c));
                            delete me.args.name;

                            // Nemohu volat me.toString, protože to by způsobilo zacyklení
                            let uu = JSON.stringify(`<uu5string/>${new_children.map(c=>c.toString()).join('')}`).replace(/^("\\")/, "").replace(/(\\"")$/g, "").replace(/^"+/, "").replace(/"+$/, "");
                            me.args["uu5string"] = uu;
                            return me.args;
                        }
                    }

                    me.children.map(c => delete c);
                    me.children = [];
                    return "";
                }
            }
        },
        "ac:rich-text-body": {
            "hasEndTag": false,
            "replacements": {
                "tag": "UU5.RichText.Block",
                "attributes": {}
            },
            "allowed": {
                "attributes": []
            },
            "automation": {
                "attributes": (me) => {
                    me.args["uu5string"] = me.children.map(c => c.toString()).join("");

                    me.children.map(c => delete c);
                    me.children = [];
                    return me.args;
                }
            }
        },
        "ac:parameter": {
            "hasEndTag": true,
            "replacements": {
                "tag": "UU5.Bricks.Span",
                "attributes": {
                    "ac:name": "name"
                }
            },
            "allowed": {
                "attributes": [
                    "ac:name"
                ]
            },
            "automation": {
                "content": (me) => {
                    return "";
                }
            }
        },
        "ac:placeholder": {
            "ignore": true
        },
        "ac:link": {
            "hasEndTag": false,
            "replacements": {
                "tag": "UuBookKit.Bricks.GoToPageLink",
                "attributes": {}
            },
            "allowed": {
                "attributes": []
            },
            "automation": {
                "attributes": (me) => {
                    let title = "";

                    let page_link = me.children.filter(c => c.getTagName() == "ri:page");
                    if (page_link.length == 1) {
                        title = page_link[0].args["ri:content-title"];
                    }

                    let page = null;
                    let label = null;
                    let fragment = null;

                    if (title.length != 0) {
                        page = prompt(`Dialog: \u2776/\u2778\n\nV kódu byl nalezen odkaz na stránku \u27A4${title}\u2B9C.\n\nZadejte kód stránky v uuBook`);
                        label = prompt(`Dialog: \u2777/\u2778\n\nV kódu byl nalezen odkaz na stránku \u27A4${title}\u2B9C.\n\nZadejte text odkazu (pro jméno stránky nechte prázdné)`);
                        fragment = prompt(`Dialog: \u2778/\u2778\n\nV kódu byl nalezen odkaz na stránku \u27A4${title}\u2B9C.\n\nZadejte ID sekce (nebo nechte prázdné)`);
                    }

                    me.args["page"] = page ? page : "PLACEHOLDER";

                    if (label) {
                        me.args["label"] = label;
                    }

                    if (fragment) {
                        me.args["fragment"] = fragment;
                    }

                    if (title.length) {
                        me.children.map(c => delete c);
                        me.children = [];
                    }

                    return me.args;
                },
            }
        },
        "ri:page": {
            "hasEndTag": true,
            "replacements": {
                "tag": "UU5.Bricks.Span",
                "attributes": {}
            },
            "allowed": {
                "attributes": [
                    "ri:content-title"
                ]
            }
        },
        "ri:user": {
            "hasEndTag": true,
            "replacements": {
                "tag": "UU5.Bricks.Div",
                "attributes": {
                    "ri:userkey": "id"
                }
            },
            "allowed": {
                "attributes": [
                    "ri:userkey"
                ]
            },
            "automation": {
                "content": (me) => {
                    return `Odkaz na uživatele s ID: <UU5.RichText.Block uu5string="<UU5.Bricks.Span style="backgroundColor: gray;">${me.args.id}</UU5.Bricks.Span" />`;
                }
            }
        },
        "ac:plain-text-link-body": {
            "hasEndTag": true,
            "replacements": {
                "tag": "UU5.Bricks.Span",
                "attributes": {}
            },
            "allowed": {
                "attributes": []
            }
        },
        "time": {
            "hasEndTag": true,
            "replacements": {
                "tag": "UU5.Bricks.Span",
                "attributes": {}
            },
            "allowed": {
                "attributes": ["datetime"]
            },
            "automation": {
                "content": (me) => {
                    return me.args["datetime"];
                }
            }
        },
        "ac:plain-text-body": {
            "ignore": true
        },
        "ac:image": {
            "hasEndTag": false,
            "replacements": {
                "tag": "UuBookKit.Imaging.RichImage",
                "attributes": {
                    "ac:height": "height",
                    "ac:width": "width"
                }
            },
            "allowed": {
                "attributes": ["ac:height", "ac:width"]
            },
            "automation": {
                "attributes": (me) => {
                    let first_child = me.children.length != 0 ? me.children[0] : null;
                    let src = "";

                    if (first_child) {
                        src = "src" in first_child.args ? first_child.args["src"] : "";
                    }

                    let code = prompt(`Dialog: \u2776/\u2776\n\nV kódu byl nalezen odkaz na obrázek \u27A4${src}\u2B9C.\n\nZadejte kód v uuBook`);

                    me.args["code"] = code ? code : "PLACEHOLDER";
                    me.children = [];

                    return me.args;
                }
            }
        },
        "ri:attachment": {
            "hasEndTag": false,
            "replacements": {
                "tag": "UU5.Bricks.Span",
                "attributes": {
                    "ri:filename": "src"
                }
            },
            "allowed": {
                "attributes": ["ri:filename"]
            },
        },
        "a": {
            "hasEndTag": false,
            "replacements": {
                "tag": "UU5.Bricks.Link",
                "attributes": {

                }
            },
            "allowed": {
                "attributes": [
                    "href"
                ]
            }
        },
        "ac:layout": {
            "skip": true
        },
        "ac:layout-cell": {
            "skip": true
        },
        "ac:layout-section": {
            "skip": true
        }
    }
};

module.exports = {
    config,
    defaultTagConfig
};
},{"./generateId":5}],3:[function(require,module,exports){
var customDom = require("./custom_dom");
var htmljs_parser = require("htmljs-parser");
var menuBuilder = require("./menu_builder");
var ParserError = require("./parser_error");

/**
 * Převede HTMl z confluence do uuString-ů.
 * @param {string} html Řetězec s HTML kódem z confluence.
 * @param {object} config Konfigurační objekt.
 */
function convert(html, config, defaultTagConfig) {
    let dom = parseHtmlToCustomDom(html, config, defaultTagConfig);

    // Tím že volám toString zajistím, že se provedou automatizace před tím, než budu dělat menu
    let content = dom.toString();

    // Mám přidat menu?
    if (config.addContentIndex) {
        content = menuBuilder(dom, config) + content;
    }

    return content;
}

function parseHtmlToCustomDom(html, config, defaultTagConfig) {
    let doc = new customDom.Document();
    let currentTag = doc;
    let replacements = config.replacements;
    let ignoring_until_tag = null;

    let parser = htmljs_parser.createParser({
        onOpenTag: (event) => {
            let originalTagName = event.tagName; // Jméno tagu
            let originalAttributes = event.attributes; // Argumenty

            if (ignoring_until_tag != null) {
                return;
            }

            if (originalTagName in replacements) {
                let replInfo = Object.assign({}, defaultTagConfig, replacements[originalTagName]);

                if (replInfo.skip) {
                    return;
                }

                // Na rozdíl od skip, ignore nebude započítávat ani potomky
                // tohoto tagu. Prostě čekám do té doby, než se najde ukončující
                // tag a pak pokračuju v parsování.
                if (replInfo.ignore) {
                    ignoring_until_tag = originalTagName;
                    return;
                }

                let newElement = doc.createElement(originalTagName, replInfo);

                // Projde všechny argumenty
                for (let attribute of originalAttributes) {

                    let attrName = attribute.name;
                    let attrValue = attribute.literalValue;

                    // Je argument podporován
                    if (replInfo.allowed.attributes.includes(attrName)) {
                        // A má se nahradit?
                        if (!("attributes" in replInfo.replacements)) {
                            throw `Pro tag ${originalTagName} není nastaven seznam nahrazení atributů`;
                        }
                        if (attrName in replInfo.replacements.attributes) {
                            newElement.addArgument(
                                replInfo.replacements.attributes[attrName],
                                attrValue
                            );
                        } else {
                            newElement.addArgument(
                                attrName,
                                attrValue
                            );
                        }
                    }
                }

                currentTag.addChild(newElement);
                currentTag = newElement;

            } else {
                console.error("Unknown tag: " + originalTagName);

                if (config.strictMode) {
                    throw new ParserError("Tag: <strong>" + originalTagName + "</strong> není v konfiguraci povolen.", event.pos, event.endPos);
                }
            }

        },

        onCloseTag: (event) => {

            // Jsem v průběhu ignorování tagů?
            if (ignoring_until_tag != null) {
                // Narazil jsem na konec ignorovaného tagu
                if (event.tagName == ignoring_until_tag) {
                    ignoring_until_tag = null;
                }

                return;
            }

            if (event.tagName in replacements) {
                let replInfo = Object.assign({}, defaultTagConfig, replacements[event.tagName]);
                if (!replInfo.skip) {

                    if (currentTag.getTagName() == "document") {
                        console.error("Leaving document!");
                        throw new ParserError("Interní chyba při sestavování DOM", event.pos, event.endPos);
                    }

                    currentTag = currentTag.getParent();
                }
            }
        },
        onText: (event) => {
            let text = event.value.trim();

            if (text.length == 0) {
                return;
            }

            let textElement = new customDom.TextElement(text);

            currentTag.addChild(
                textElement
            );
        },
        onCDATA: (event) => {
            let text = event.value.trim();
            if (text.length == 0) {
                return;
            }

            let textElement = new customDom.TextElement(text);
            currentTag.addChild(textElement);
        },
        onError: (event) => {
            throw new ParserError(event.message, event.pos, event.endPos);
        }
    });

    parser.parse(html);

    return doc
}

module.exports = convert;
},{"./custom_dom":4,"./menu_builder":6,"./parser_error":8,"htmljs-parser":15}],4:[function(require,module,exports){
class Document {
    constructor() {
        this.children = [];
    }

    addChild(child) {
        this.children.push(child);
        child.parent = this;
    }

    toString() {
        let children_tags = [];

        for (let i = 0; i < this.children.length; i++) {
            children_tags.push(this.children[i].toString());
        }

        return children_tags.join("");
    }

    getTagName() {
        return "document";
    }

    createElement(originalTagName, replInfo) {
        let newTagName = replInfo.replacements.tag ? replInfo.replacements.tag : originalTagName;
        let hasEndTag = replInfo.hasEndTag;
        let automation = replInfo.automation;

        if (originalTagName == "table") {
            return new TableElement(originalTagName, newTagName, hasEndTag, automation);
        } else {
            return new Element(originalTagName, newTagName, hasEndTag, automation);
        }
    }

    getText() {
        return this.children.filter(e => e.getTagName() == "text").join("");
    }

    getChildren() {
        return this.children;
    }
}

class Element {
    constructor(originalTagName, uuTagName, hasEndTag = true, automation = null) {
        this.children = [];

        this.tag = originalTagName;
        this.uuTagName = uuTagName;

        this.hasEndTag = hasEndTag;
        this.args = {};

        this.parent = null;
        this.automation = automation;
    }

    hasArgument(arg) {
        return arg in this.args;
    }

    addChild(child) {
        this.children.push(child);
        child.parent = this;
    }

    addArgument(name, value) {
        this.args[name] = value;
    }

    getParent() {
        return this.parent;
    }

    getChildren() {
        return this.children;
    }

    toUUString(preserveItself = false) {
        let normal_string = this.getContentAsString();

        if (preserveItself) {
            normal_string = this.toString();
        }

        // Před první výskyt jakéhokoliv tagu vloží uustring
        return normal_string.replace("<", "<uu5string/><");
    }

    toString() {
        let tag_arguments = this.getArgumentsAsString();

        // Obsah tagu
        let tag_content = this.getContentAsString();

        let tag_opening = "<" + this.getUUTagName() + tag_arguments;

        let tag_end = this.hasEndTag ? ">" + tag_content + "</" + this.getUUTagName() + ">" : " />";

        let result = tag_opening + tag_end;
        return result;
    }

    getArgumentsAsString() {
        let args = [];

        // Argumenty
        if (this.automation && this.automation.attributes) {
            this.args = this.automation.attributes(this);
        }

        for (let i = 0; i < Object.keys(this.args).length; i++) {
            let key = Object.keys(this.args)[i];

            if (this.args.hasOwnProperty(key)) {
                args.push(`${key}="${this.args[key]}"`);
            }
        }

        return args.length != 0 ? " " + args.join(" ") : "";
    }

    getContentAsString() {
        let content = "";


        if (this.automation && this.automation.content) {
            content = this.automation.content(this);
        } else {
            let children_tags = [];

            for (let i = 0; i < this.children.length; i++) {
                children_tags.push(this.children[i].toString());
            }

            content = children_tags.join("");
        }

        return content;
    }

    getTagName() {
        return this.tag
    }

    getUUTagName() {
        if (this.automation && this.automation.tag) {
            return this.automation.tag(this);
        }

        return this.uuTagName;
    }
}

class TableElement extends Element {

    toString() {
        let isSimpleTable = true;

        // Pro tabulku bez row a col span jde použít bookkit tabulku, jinak uu5 tabulku
        for (let x = 0; x < this.children.length; x++) {
            // Je ještě před náhradou za nové argumenty rowSpan a colSpan
            // Proto kontroluju standardní html argumenty

            let row = this.children[x];

            for (let y = 0; y < row.children.length; y++) {
                let cell = row.children[y];
                let found = cell.hasArgument("rowspan") || cell.hasArgument("colspan");
                if (found) {
                    isSimpleTable = false;
                    break;
                }
            }

            if (!isSimpleTable) {
                break;
            }
        }

        if (isSimpleTable) {
            return this.toSimpleTableString();
        }

        return this.toTableString()

    }

    toTableString() {
        return super.toString();
    }

    toSimpleTableString() {
        let data = [
            []
        ];
        let dataIndex = 0;
        let rowHeader = false;
        let columnHeader = false;

        for (let rowId in this.children) {
            let child = this.children[rowId];

            if (child.getTagName() == "tr") {

                if (data[dataIndex].length != 0) {
                    data.push([]);
                    dataIndex += 1;
                }

                for (let cellId in child.children) {
                    let elem = child.children[cellId];

                    // Je to součást titulku
                    if (elem.getTagName() == "th") {
                        // není v prvním sloupci, takže je to řádkový titulek
                        if (cellId != 0) {
                            rowHeader = true;
                        } else if (rowId != 0 && cellId == 0) {
                            columnHeader = true;
                        }
                    }

                    // Uložíme data
                    if (elem.getTagName() == "td" || elem.getTagName() == "th") {
                        data[dataIndex].push(elem.toUUString());
                    } else {
                        data[dataIndex].push(elem.toString());
                    }
                }
            }
        }

        let output = `<UuContentKit.Tables.Table ${(rowHeader ? "rowHeader " : "") + (columnHeader ? "columnHeader " : "")} data=${ JSON.stringify("<uu5json/>" + JSON.stringify(data)).replace(/^("\\")/, "").replace(/(\\"")$/, "").replace(/(")$/, "") }"/>`;
        return output;
    }
}

class TextElement {
    constructor(text) {
        this.text = text;
        this.parent = null;
    }

    hasArgument(arg) {
        return false;
    }

    toString() {
        return this.text;
    }

    getTagName() {
        return "text";
    }

    getChildren() {
        return [];
    }
}

module.exports = {
    TextElement,
    Element,
    TableElement,
    Document
};
},{}],5:[function(require,module,exports){
function dec2hex (dec) {
    return ('0' + dec.toString(16)).substr(-2)
}

function generateId (len) {
    var arr = new Uint8Array((len || 32) / 2)
    window.crypto.getRandomValues(arr)
    return Array.from(arr, dec2hex).join('')
}

module.exports = generateId;
},{}],6:[function(require,module,exports){
var customDom = require("./custom_dom");

class Menu {
    constructor() {
        this.parent = null;
        this.children = [];
        this.current_item = null;
        this.level = -1;
    }

    addItem(text, link, level) {
        let item = new MenuItem(text, link, level);

        // První prvek
        if (this.current_item == null) {
            this.current_item = item;
            item.parent = this;
            this.children.push(item);

            return;
        }

        // Už existuje prvek a má nižší level, než ten aktuální
        if (this.current_item.level < item.level) {
            this.current_item.children.push(item);
            item.parent = this.current_item;
            this.current_item = item;

            return;
        }

        // Už existuje prvek, který ale má vyšší level, než ten aktuální
        let right_position = this.current_item;
        while (right_position.level >= item.level) {
            // Má rodiče, přejdu o úroveň výš
            if (right_position.parent) {
                right_position = right_position.parent;
                continue;
            } else {
                break;
            }
        }

        item.parent = right_position;
        right_position.children.push(item);
        this.current_item = item;

    }

    toString() {
        let data = this.children.map(child => child.toString()).join("");
        let output = `<UU5.Bricks.Section header=\"Obsah\" level=\"1\"><UU5.RichText.Block uu5string=\"<uu5string/><UU5.Bricks.Ul>${data}</UU5.Bricks.Ul>\"/></UU5.Bricks.Section>`;
        return output;
    }
}

class MenuItem {
    constructor(text, link, level) {
        this.parent = null;
        this.children = [];
        this.text = text;
        this.link = link;
        this.level = level;
    }

    toString() {
        let data = this.children.map(child => child.toString());
        let output = `<UU5.Bricks.Li><UuBookKit.Bricks.GoToPageLink label=\'${this.text}\' fragment=\'${this.link}\'/> ${ data.length != 0 ? "<UU5.Bricks.Ul>" + data.join("") + "</UU5.Bricks.Ul>" : ""}</UU5.Bricks.Li>`;
        return output;
    }
}

function findTitles(element) {
    let titles = [];

    for (let child of element.getChildren()) {
        if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(child.getTagName())) {
            titles.push(child);
        }

        titles = titles.concat(findTitles(child));
    }

    return titles;
}

/**
 * Rozšíření standardní funkce, které z nadpisů v HTML kódu vytvoří obsah
 * dané stránky.
 * Poznámka: Bere v potaz jen h<1-6> tagy v kořenu HTML, nikoliv ty vnořené.
 */
function menuBuilder(dom, config) {
    // Vybere všechny nadpisy
    let title_elements = findTitles(dom);

    let menu = new Menu();

    for (let title of title_elements) {

        menu.addItem(
            title.args.header,
            title.args.id,
            title.args.level
        );
    }

    if (menu.children.length == 0) {
        return "";
    }

    return menu.toString();
}

module.exports = menuBuilder;
},{"./custom_dom":4}],7:[function(require,module,exports){
var convert = require("./convert");
var {
    config,
    defaultTagConfig
} = require("./config");
var beautify = require("js-beautify");
var ParserError = require("./parser_error");

/**
 * Vstupní brána do celé aplikace. Zde se registrují "listenery" pro
 * stisk tlačítka "Konvertovat" a následná konverze z vloženého HTML
 * na uuString.
 */

document.addEventListener("DOMContentLoaded", ev => {
    document.getElementById("convert").addEventListener("click", ev => {

        let output_string = "";
        let input = document.getElementById("input");
        let output = document.getElementById("output");
        try {
            // Převede HTML na uuString tagy
            output_string = convert(input.value, config, defaultTagConfig);

            // Skryju chyby od minule
            document.getElementById("error").style.display = "none";

            // Výstup "formátovaného" uuStringu
            output.value = /*beautify.html(*/ "<uu5string/>" + output_string
            /*, {
                indent_size: "4",
                indent_char: " ",
                max_preserve_newlines: "5",
                preserve_newlines: true,
                keep_array_indentation: false,
                break_chained_methods: false,
                indent_scripts: "normal",
                brace_style: "collapse",
                space_before_conditional: true,
                unescape_strings: false,
                jslint_happy: false,
                end_with_newline: false,
                wrap_line_length: "0",
                indent_inner_html: false,
                comma_first: false,
                e4x: false,
                indent_empty_lines: false
            });*/

            output.focus();
            output.select();
            document.execCommand('copy');
        } catch (e) {
            if (e instanceof ParserError) {

                input.focus();
                input.setSelectionRange(e.position_start, e.position_end);

                document.getElementById("error_message").innerHTML = e.message;
                document.getElementById("error").style.display = "block";
            } else {
                document.getElementById("error_message").innerHTML = e;
                document.getElementById("error").style.display = "block";
                throw e;
            }
        }
    });
});
},{"./config":2,"./convert":3,"./parser_error":8,"js-beautify":18}],8:[function(require,module,exports){
class ParserError {
    constructor(message, position_start, position_end) {
        this.message = message;
        this.position_start = position_start;
        this.position_end = position_end;
    }
}

module.exports = ParserError;
},{}],9:[function(require,module,exports){
/**
 * Indexer constructor (takes index and performs pre-emptive caching)
 * @constructor
 * @param {String} input Content to index
 */
function Indexer(input) {
  this.input = input;

  // Break up lines by line breaks
  var lines = input.split('\n');

  // Iterate over the lines until we reach the end or we hit our index
  var i = 0,
      len = lines.length,
      line,
      lineStart = 0,
      lineEnd,
      lineMap = {'length': len};
  for (; i < len; i++) {
    // Grab the line
    line = lines[i];

    // Calculate the line end (includes \n we removed)
    lineEnd = lineStart + line.length + 1;

    // Save the line to its map
    lineMap[i] = {'start': lineStart, 'end': lineEnd};

    // Overwrite lineStart with lineEnd
    lineStart = lineEnd;
  }

  // Save the lineMap to this
  this.lineMap = lineMap;
}
Indexer.prototype = {
  /**
   * Get the line of the character at a certain index
   * @param {Number} index Index of character to retrieve line of
   * @param {Object} [options] Options to use for search
   * @param {Number} [options.minLine=0] Minimum line for us to search on
   * TODO: The following still have to be built/implemented
   * @param {Number} [options.maxLine=lines.length] Maximum line for us to search on
   * @param {String} [options.guess="average"] Affects searching pattern -- can be "high", "low", or "average" (linear top-down, linear bottom-up, or binary)
   * @returns {Number} Line number of character
   */
  'lineAt': function (index, options) {
    // Fallback options
    options = options || {};

    // TODO: We can binary search here
    // Grab the line map and iterate over it
    var lineMap = this.lineMap,
        i = options.minLine || 0,
        len = lineMap.length,
        lineItem;

    for (; i < len; i++) {
      // TODO: If binary searching, this requires both above and below
      // If the index is under end of the lineItem, stop
      lineItem = lineMap[i];

      if (index < lineItem.end) {
        break;
      }
    }

    // Return the line we stopped on
    return i;
  },
  /**
   * Get the column of the character at a certain index
   * @param {Number} index Index of character to retrieve column of
   * @returns {Number} Column number of character
   */
  'columnAt': function (index) {
    // Start at the index - 1
    var input = this.input,
        char,
        i = index - 1;

    // If the index is negative, return now
    if (index < 0) {
      return 0;
    }

    // Continue left until index < 0 or we hit a line break
    for (; i >= 0; i--) {
      char = input.charAt(i);
      if (char === '\n') {
        break;
      }
    }

    // Return the col of our index - 1 (line break is not in the column count)
    var col = index - i - 1;
    return col;
  },
  /**
   * Get the index of the character at a line and column
   * @param {Object} params Object containing line and column
   * @param {Number} params.line Line of character
   * @param {Number} params.column Column of character
   * @returns {Number} Index of character
   */
  'indexAt': function (params) {
    // Grab the parameters and lineMap
    var line = params.line,
        column = params.column,
        lineMap = this.lineMap;

    // Go to the nth line and get the start
    var retLine = lineMap[line],
        lineStart = retLine.start;

    // Add on the column to the line start and return
    var retVal = lineStart + column;
    return retVal;
  },
  /**
   * Get the character at a line and column
   * @param {Object} params Object containing line and column
   * @param {Number} params.line Line of character
   * @param {Number} params.column Column of character
   * @returns {String} Character at specified location
   */
  'charAt': function (params) {
    // Get the index of the character, look it up, and return
    var index = this.indexAt(params),
        input = this.input,
        retVal = input.charAt(index);
    return retVal;
  }
};

function charProps(input) {
  // Create and return a new Indexer with the content
  var indexer = new Indexer(input);
  return indexer;
}

// Expose Indexer to charProps
charProps.Indexer = Indexer;

// Export charProps
module.exports = charProps;
},{}],10:[function(require,module,exports){
(function (process){
'use strict';

var StackParser = require('error-stack-parser');
var env = typeof process !== 'undefined' && process.env.NODE_ENV;
var isDevelopment = !env || env === 'dev' || env === 'development';
var showModuleComplains = typeof process !== 'undefined' && Boolean(process.env.SHOW_MODULE_COMPLAINS);
var showNestedComplains = typeof process !== 'undefined' && Boolean(process.env.SHOW_NESTED_COMPLAINS);
var logger = typeof console !== 'undefined' && console.warn && console;
var cwd = typeof process !== 'undefined' && process.cwd() + '/' || '';
var linebreak = typeof process !== 'undefined' && 'win32' === process.platform ? '\r\n' : '\n';
var newline = /(\r\n|\r|\n)/g;
var slice = [].slice;
var ignoredLocation = "[ignore]";
var hits = {};

complain = isDevelopment ? complain : noop;
complain.method = isDevelopment ? method : noop;
complain.fn = isDevelopment ? fn : noopReturn;
complain.log = log;
complain.stream = typeof process !== 'undefined' && process.stderr;
complain.silence = false;
complain.color = complain.stream && complain.stream.isTTY;
complain.colors = { warning:'\x1b[31;1m', notice:'\x1b[33;1m', message:false, location:'\u001b[90m' };
complain.getModuleName = getModuleName;

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = complain;
} else if(typeof window !== 'undefined') {
  window.complain = complain;
}

function complain() {
  var options;
  var location;
  var locationIndex;
  var headingColor;
  var heading;
  var level;
  var args = arguments;

  if(complain.silence) return;

  if(typeof args[args.length-1] === 'object') {
    options = args[args.length-1];
    args = slice.call(args, 0, -1);
  } else {
    options = {};
  }

  level = options.level || 2;
  heading = options.heading || (level == 2 ? "WARNING!!" : "NOTICE");
  headingColor = options.headingColor || (level == 2 ? complain.colors.warning : complain.colors.notice);

  // Default to the location of the call to the deprecated function
  locationIndex = options.locationIndex == null ? 1 : options.locationIndex;

  // When the user sets location to false,
  // We will use the location of the call to complain()
  // To limit the log to only occurring once
  if(options.location === false) {
    locationIndex = 0;
  }

  location = options.location || getLocation(locationIndex);
  
  var moduleName = complain.getModuleName(location);

  if (moduleName && !showModuleComplains) {
    if (!hits[moduleName]) {
      var output = format("NOTICE", complain.colors.notice);
      output += linebreak + format('The module ['+moduleName+'] is using deprecated features.', complain.colors.message);
      output += linebreak + format('Run with process.env.SHOW_MODULE_COMPLAINS=1 to see all warnings.', complain.colors.message);
      complain.log(linebreak + output + linebreak);
      hits[moduleName] = true;
    }
    return;
  }

  /* istanbul ignore next */
  // Location is only missing in older browsers.
  if(location) {
    if(hits[location] || location === ignoredLocation) return;
    else hits[location] = true;
  }

  var output = format(heading, headingColor);

  for(var i = 0; i < args.length; i++) {
    output += linebreak + format(args[i], complain.colors.message);
  }

  if(options.location !== false && location) {
    output += linebreak + format('  at '+location.replace(cwd, ''), complain.colors.location);
  }

  complain.log(linebreak + output + linebreak);
};

function method(object, methodName) {
    var originalMethod = object[methodName];
    var args = slice.call(arguments, 2);

    object[methodName] = function() {
        complain.apply(null, args);
        return originalMethod.apply(this, arguments);
    };
}

function fn(original) {
  var args = slice.call(arguments, 1);

  return function() {
    complain.apply(null, args);
    return original.apply(this, arguments);
  }
}

function log(message, color) {
  var formatted = format(message, color);
  if(complain.stream) {
    complain.stream.write(formatted+linebreak);
  } else if(logger) {
    logger.warn(formatted);
  }
}

function format(message, color) {
  return color && complain.color ? color + message + '\x1b[0m' : message;
}

function getLocation(locationIndex) {
  var location = '';
  var targetIndex = locationIndex + 2;

  /**
   * Stack index descriptions.
   * 
   * 0: In getLocation(), the call to new Error()
   * 1: In complain(), the call to getLocation()
   * 2: In the deprecated function, the call to complain()
   * 3: The call to the deprecated function (THIS IS THE DEFAULT)
   */

  try {
    var locations = StackParser.parse(new Error()).map(function(frame) {
      return frame.fileName+':'+frame.lineNumber+':'+frame.columnNumber;
    });
    if (!showNestedComplains) {
      for (var i = locations.length-1; i > targetIndex; i--) {
        if (hits[locations[i]]) {
          return ignoredLocation;
        }
      }
    }
    location = locations[targetIndex];
  } catch(e) {}

  return location;
}

function getModuleName(location) {
  var locationParts = location.replace(cwd, '').split(/\/|\\/g);
  for(var i = locationParts.length-1; i >= 0; i--) {
    if (locationParts[i] === 'node_modules') {
      var moduleName = locationParts[i+1];
      return (moduleName[0] === '@') ? moduleName+'/'+locationParts[i+2] : moduleName;
    }
  }
}

function noop(){};
function noopReturn(r) { return r; };

}).call(this,require('_process'))
},{"_process":1,"error-stack-parser":11}],11:[function(require,module,exports){
(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define('error-stack-parser', ['stackframe'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('stackframe'));
    } else {
        root.ErrorStackParser = factory(root.StackFrame);
    }
}(this, function ErrorStackParser(StackFrame) {
    'use strict';

    var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+\:\d+/;
    var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+\:\d+|\(native\))/m;
    var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code\])?$/;

    return {
        /**
         * Given an Error object, extract the most information from it.
         *
         * @param {Error} error object
         * @return {Array} of StackFrames
         */
        parse: function ErrorStackParser$$parse(error) {
            if (typeof error.stacktrace !== 'undefined' || typeof error['opera#sourceloc'] !== 'undefined') {
                return this.parseOpera(error);
            } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
                return this.parseV8OrIE(error);
            } else if (error.stack) {
                return this.parseFFOrSafari(error);
            } else {
                throw new Error('Cannot parse given Error object');
            }
        },

        // Separate line and column numbers from a string of the form: (URI:Line:Column)
        extractLocation: function ErrorStackParser$$extractLocation(urlLike) {
            // Fail-fast but return locations like "(native)"
            if (urlLike.indexOf(':') === -1) {
                return [urlLike];
            }

            var regExp = /(.+?)(?:\:(\d+))?(?:\:(\d+))?$/;
            var parts = regExp.exec(urlLike.replace(/[\(\)]/g, ''));
            return [parts[1], parts[2] || undefined, parts[3] || undefined];
        },

        parseV8OrIE: function ErrorStackParser$$parseV8OrIE(error) {
            var filtered = error.stack.split('\n').filter(function(line) {
                return !!line.match(CHROME_IE_STACK_REGEXP);
            }, this);

            return filtered.map(function(line) {
                if (line.indexOf('(eval ') > -1) {
                    // Throw away eval information until we implement stacktrace.js/stackframe#8
                    line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^\()]*)|(\)\,.*$)/g, '');
                }
                var sanitizedLine = line.replace(/^\s+/, '').replace(/\(eval code/g, '(');

                // capture and preseve the parenthesized location "(/foo/my bar.js:12:87)" in
                // case it has spaces in it, as the string is split on \s+ later on
                var location = sanitizedLine.match(/ (\((.+):(\d+):(\d+)\)$)/);

                // remove the parenthesized location from the line, if it was matched
                sanitizedLine = location ? sanitizedLine.replace(location[0], '') : sanitizedLine;

                var tokens = sanitizedLine.split(/\s+/).slice(1);
                // if a location was matched, pass it to extractLocation() otherwise pop the last token
                var locationParts = this.extractLocation(location ? location[1] : tokens.pop());
                var functionName = tokens.join(' ') || undefined;
                var fileName = ['eval', '<anonymous>'].indexOf(locationParts[0]) > -1 ? undefined : locationParts[0];

                return new StackFrame({
                    functionName: functionName,
                    fileName: fileName,
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                    source: line
                });
            }, this);
        },

        parseFFOrSafari: function ErrorStackParser$$parseFFOrSafari(error) {
            var filtered = error.stack.split('\n').filter(function(line) {
                return !line.match(SAFARI_NATIVE_CODE_REGEXP);
            }, this);

            return filtered.map(function(line) {
                // Throw away eval information until we implement stacktrace.js/stackframe#8
                if (line.indexOf(' > eval') > -1) {
                    line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval\:\d+\:\d+/g, ':$1');
                }

                if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
                    // Safari eval frames only have function names and nothing else
                    return new StackFrame({
                        functionName: line
                    });
                } else {
                    var functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
                    var matches = line.match(functionNameRegex);
                    var functionName = matches && matches[1] ? matches[1] : undefined;
                    var locationParts = this.extractLocation(line.replace(functionNameRegex, ''));

                    return new StackFrame({
                        functionName: functionName,
                        fileName: locationParts[0],
                        lineNumber: locationParts[1],
                        columnNumber: locationParts[2],
                        source: line
                    });
                }
            }, this);
        },

        parseOpera: function ErrorStackParser$$parseOpera(e) {
            if (!e.stacktrace || (e.message.indexOf('\n') > -1 &&
                e.message.split('\n').length > e.stacktrace.split('\n').length)) {
                return this.parseOpera9(e);
            } else if (!e.stack) {
                return this.parseOpera10(e);
            } else {
                return this.parseOpera11(e);
            }
        },

        parseOpera9: function ErrorStackParser$$parseOpera9(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            var lines = e.message.split('\n');
            var result = [];

            for (var i = 2, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(new StackFrame({
                        fileName: match[2],
                        lineNumber: match[1],
                        source: lines[i]
                    }));
                }
            }

            return result;
        },

        parseOpera10: function ErrorStackParser$$parseOpera10(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            var lines = e.stacktrace.split('\n');
            var result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(
                        new StackFrame({
                            functionName: match[3] || undefined,
                            fileName: match[2],
                            lineNumber: match[1],
                            source: lines[i]
                        })
                    );
                }
            }

            return result;
        },

        // Opera 10.65+ Error.stack very similar to FF/Safari
        parseOpera11: function ErrorStackParser$$parseOpera11(error) {
            var filtered = error.stack.split('\n').filter(function(line) {
                return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
            }, this);

            return filtered.map(function(line) {
                var tokens = line.split('@');
                var locationParts = this.extractLocation(tokens.pop());
                var functionCall = (tokens.shift() || '');
                var functionName = functionCall
                        .replace(/<anonymous function(: (\w+))?>/, '$2')
                        .replace(/\([^\)]*\)/g, '') || undefined;
                var argsRaw;
                if (functionCall.match(/\(([^\)]*)\)/)) {
                    argsRaw = functionCall.replace(/^[^\(]+\(([^\)]*)\)$/, '$1');
                }
                var args = (argsRaw === undefined || argsRaw === '[arguments not available]') ?
                    undefined : argsRaw.split(',');

                return new StackFrame({
                    functionName: functionName,
                    args: args,
                    fileName: locationParts[0],
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                    source: line
                });
            }, this);
        }
    };
}));

},{"stackframe":42}],12:[function(require,module,exports){
'use strict';

var CODE_NEWLINE = 10;
var CODE_CARRIAGE_RETURN = 13;

class Parser {
    static createState(mixins) {
        return mixins;
    }

    constructor(options) {
        this.reset();
    }

    reset() {
        // current absolute character position
        this.pos = -1;

        // The maxPos property is the last absolute character position that is
        // readable based on the currently received chunks
        this.maxPos = -1;

        // the current parser state
        this.state = null;

        // The raw string that we are parsing
        this.data = this.src = null;

        this.filename = null;
    }

    setInitialState(initialState) {
        this.initialState = initialState;
    }

    enterState(state) {
        if (this.state === state) {
            // Re-entering the same state can lead to unexpected behavior
            // so we should throw error to catch these types of mistakes
            throw new Error('Re-entering the current state is illegal - ' + state.name);
        }

        var oldState;
        if ((oldState = this.state) && oldState.leave) {
            // console.log('Leaving state ' + oldState.name);
            oldState.leave.call(this, state);
        }

        // console.log('Entering state ' + state.name);

        this.state = state;

        if (state.enter) {
            state.enter.call(this, oldState);
        }
    }

    /**
     * Look ahead to see if the given str matches the substring sequence
     * beyond
     */
    lookAheadFor(str, startPos) {
        // Have we read enough chunks to read the string that we need?
        if (startPos == null) {
            startPos = this.pos + 1;
        }
        var len = str.length;
        var endPos = startPos + len;

        if (endPos > this.maxPos + 1) {
            return undefined;
        }

        var found = this.data.substring(startPos, endPos);
        return (found === str) ? str : undefined;
    }

    /**
     * Look ahead to a character at a specific offset.
     * The callback will be invoked with the character
     * at the given position.
     */
    lookAtCharAhead(offset, startPos) {
        if (startPos == null) {
            startPos = this.pos;
        }
        return this.data.charAt(startPos + offset);
    }

    lookAtCharCodeAhead(offset, startPos) {
        if (startPos == null) {
            startPos = this.pos;
        }
        return this.data.charCodeAt(startPos + offset);
    }

    rewind(offset) {
        this.pos -= offset;
    }

    skip(offset) {
        // console.log('-- ' + JSON.stringify(this.data.substring(this.pos, this.pos + offset)) + ' --  ' + 'SKIPPED'.gray);
        this.pos += offset;
    }

    end() {
        this.pos = this.maxPos + 1;
    }

    substring(pos, endPos) {
        return this.data.substring(pos, endPos);
    }

    parse(data, filename) {
        if (data == null) {
            return;
        }

        // call the constructor function again because we have a contract that
        // it will fully reset the parser
        this.reset();

        if (Array.isArray(data)) {
            data = data.join('');
        }

        this.src = data; // This is the unmodified data used for reporting warnings
        this.filename = filename;
        this.data = data;
        this.maxPos = data.length - 1;

        // Enter initial state
        if (this.initialState) {
            this.enterState(this.initialState);
        }

        // Move to first position
        // Skip the byte order mark (BOM) sequence
        // at the beginning of the file if there is one:
        // - https://en.wikipedia.org/wiki/Byte_order_mark
        // > The Unicode Standard permits the BOM in UTF-8, but does not require or recommend its use.
        this.pos = data.charCodeAt(0) === 0xFEFF ? 1 : 0;

        if (!this.state) {
            // Cannot resume when parser has no state
            return;
        }

        var pos;
        while ((pos = this.pos) <= this.maxPos) {
            let ch = data[pos];
            let code = ch.charCodeAt(0);
            let state = this.state;

            if (code === CODE_NEWLINE) {
                if (state.eol) {
                    state.eol.call(this, ch);
                }
                this.pos++;
                continue;
            } else if (code === CODE_CARRIAGE_RETURN) {
                let nextPos = pos + 1;
                if (nextPos < data.length && data.charCodeAt(nextPos) === CODE_NEWLINE) {
                    if (state.eol) {
                        state.eol.call(this, '\r\n');
                    }
                    this.pos+=2;
                    continue;
                }
            }

            // console.log('-- ' + JSON.stringify(ch) + ' --  ' + this.state.name.gray);

            // We assume that every state will have "char" function
            state.char.call(this, ch, code);

            // move to next position
            this.pos++;
        }

        let state = this.state;
        if (state && state.eof) {
            state.eof.call(this);
        }
    }
}

module.exports = Parser;

},{}],13:[function(require,module,exports){
'use strict';
var BaseParser = require('./BaseParser');
var operators = require('./operators');
var notifyUtil = require('./notify-util');
var complain = require('complain');
var charProps = require('char-props');

function isWhitespaceCode(code) {
    // For all practical purposes, the space character (32) and all the
    // control characters below it are whitespace. We simplify this
    // condition for performance reasons.
    // NOTE: This might be slightly non-conforming.
    return (code <= 32);
}

var NUMBER_REGEX = /^[\-\+]?\d*(?:\.\d+)?(?:e[\-\+]?\d+)?$/;

/**
 * Takes a string expression such as `"foo"` or `'foo "bar"'`
 * and returns the literal String value.
 */
function evaluateStringExpression(expression, pos, notifyError) {
    // We could just use eval(expression) to get the literal String value,
    // but there is a small chance we could be introducing a security threat
    // by accidently running malicous code. Instead, we will use
    // JSON.parse(expression). JSON.parse() only allows strings
    // that use double quotes so we have to do extra processing if
    // we detect that the String uses single quotes

    if (expression.charAt(0) === "'") {
        expression = expression.substring(1, expression.length - 1);

        // Make sure there are no unescaped double quotes in the string expression...
        expression = expression.replace(/\\\\|\\[']|\\["]|["]/g, function(match) {
            if (match === "\\'"){
                // Don't escape single quotes since we are using double quotes
                return "'";
            } else if (match === '"'){
                // Return an escaped double quote if we encounter an
                // unescaped double quote
                return '\\"';
            } else {
                // Return the escape sequence
                return match;
            }
        });

        expression = '"' + expression + '"';
    }

    try {
        return JSON.parse(expression);
    } catch(e) {
        notifyError(pos,
            'INVALID_STRING',
            'Invalid string (' + expression + '): ' + e);
    }
}


function peek(array) {
    var len = array.length;
    if (!len) {
        return undefined;
    }
    return array[len - 1];
}

const MODE_HTML = 1;
const MODE_CONCISE = 2;

const CODE_BACK_SLASH = 92;
const CODE_FORWARD_SLASH = 47;
const CODE_OPEN_ANGLE_BRACKET = 60;
const CODE_CLOSE_ANGLE_BRACKET = 62;
const CODE_EXCLAMATION = 33;
const CODE_QUESTION = 63;
const CODE_OPEN_SQUARE_BRACKET = 91;
const CODE_CLOSE_SQUARE_BRACKET = 93;
const CODE_EQUAL = 61;
const CODE_SINGLE_QUOTE = 39;
const CODE_DOUBLE_QUOTE = 34;
const CODE_BACKTICK = 96;
const CODE_OPEN_PAREN = 40;
const CODE_CLOSE_PAREN = 41;
const CODE_OPEN_CURLY_BRACE = 123;
const CODE_CLOSE_CURLY_BRACE = 125;
const CODE_ASTERISK = 42;
const CODE_HYPHEN = 45;
const CODE_HTML_BLOCK_DELIMITER = CODE_HYPHEN;
const CODE_DOLLAR = 36;
const CODE_PERCENT = 37;
const CODE_PERIOD = 46;
const CODE_COMMA = 44;
const CODE_SEMICOLON = 59;
const CODE_NUMBER_SIGN = 35;
const CODE_PIPE = 124;

const BODY_PARSED_TEXT = 1; // Body of a tag is treated as text, but placeholders will be parsed
const BODY_STATIC_TEXT = 2;// Body of a tag is treated as text and placeholders will *not* be parsed

const EMPTY_ATTRIBUTES = [];
const htmlTags = require('./html-tags');

class Parser extends BaseParser {
    constructor(listeners, options) {
        super(options);

        var parser = this;

        function outputDeprecationWarning(message) {
            var srcCharProps = charProps(parser.src);
            var line = srcCharProps.lineAt(parser.pos);
            var column = srcCharProps.columnAt(parser.pos);
            var filename = parser.filename;
            var location = (filename || '(unknown file)') + ':' + line + ':' + column;
            complain(message, { location: location });
        }

        var notifiers = notifyUtil.createNotifiers(parser, listeners);
        this.notifiers = notifiers;

        var defaultMode = options && options.concise === false ? MODE_HTML : MODE_CONCISE;
        var userIsOpenTagOnly = options && options.isOpenTagOnly;
        var ignorePlaceholders = options && options.ignorePlaceholders;
        var ignoreNonstandardStringPlaceholders = options && options.ignoreNonstandardStringPlaceholders;
        var legacyCompatibility = options.legacyCompatibility === true;
        var reflectiveAttributes = options.reflectiveAttributes === true;

        var currentOpenTag; // Used to reference the current open tag that is being parsed
        var currentAttribute; // Used to reference the current attribute that is being parsed
        var closeTagName; // Used to keep track of the current close tag name as it is being parsed
        var closeTagPos; // Used to keep track of the position of the current closing tag
        var expectedCloseTagName; // Used to figure out when a text block has been ended (HTML tags are ignored)
        var text; // Used to buffer text that is found within the body of a tag
        var withinOpenTag;// Set to true if the parser is within the open tag
        var blockStack; // Used to keep track of HTML tags and HTML blocks
        var partStack; // Used to keep track of parts such as CDATA, expressions, declarations, etc.
        var currentPart; // The current part at the top of the part stack
        var indent; // Used to build the indent for the current concise line
        var isConcise; // Set to true if parser is currently in concise mode
        var isWithinSingleLineHtmlBlock; // Set to true if the current block is for a single line HTML block
        var htmlBlockDelimiter; // Current delimiter for multiline HTML blocks nested within a concise tag. e.g. "--"
        var htmlBlockIndent; // Used to hold the indentation for a delimited, multiline HTML block
        var beginMixedMode; // Used as a flag to mark that the next HTML block should enter the parser into HTML mode
        var endingMixedModeAtEOL; // Used as a flag to record that the next EOL to exit HTML mode and go back to concise
        var placeholderDepth; // Used as an easy way to know if an exptression is within a placeholder
        var textParseMode = 'html';

        this.reset = function() {
            BaseParser.prototype.reset.call(this);
            text = '';
            currentOpenTag = undefined;
            currentAttribute = undefined;
            closeTagName = undefined;
            closeTagPos = undefined;
            expectedCloseTagName = undefined;
            withinOpenTag = false;
            blockStack = [];
            partStack = [];
            currentPart = undefined;
            indent = '';
            isConcise = defaultMode === MODE_CONCISE;
            isWithinSingleLineHtmlBlock = false;
            htmlBlockDelimiter = null;
            htmlBlockIndent = null;
            beginMixedMode = false;
            endingMixedModeAtEOL = false;
            placeholderDepth = 0;
        };

        this.reset();

        /**
         * This function is called to determine if a tag is an "open only tag". Open only tags such as <img>
         * are immediately closed.
         * @param  {String}  tagName The name of the tag (e.g. "img")
         */
        function isOpenTagOnly(tagName) {
            if (!tagName) {
                return false;
            }

            tagName = tagName.toLowerCase();

            var openTagOnly = userIsOpenTagOnly && userIsOpenTagOnly(tagName);
            if (openTagOnly == null) {
                openTagOnly = htmlTags.isOpenTagOnly(tagName);
            }

            return openTagOnly;
        }

        /**
         * Clear out any buffered body text and notify any listeners
         */
        function endText(txt) {
            if (arguments.length === 0) {
                txt = text;
            }

            notifiers.notifyText(txt, textParseMode);

            // always clear text buffer...
            text =  '';
        }


        function openTagEOL() {
            if (isConcise && !currentOpenTag.withinAttrGroup) {
                // In concise mode we always end the open tag
                finishOpenTag();
            }
        }

        /**
         * This function is used to enter into "HTML" parsing mode instead
         * of concise HTML. We push a block on to the stack so that we know when
         * return back to the previous parsing mode and to ensure that all
         * tags within a block are properly closed.
         */
        function beginHtmlBlock(delimiter) {
            htmlBlockIndent = indent;
            htmlBlockDelimiter = delimiter;

            var parent = peek(blockStack);
            blockStack.push({
                type: 'html',
                delimiter: delimiter,
                indent: indent
            });

            if (parent && parent.body) {
                if (parent.body === BODY_PARSED_TEXT) {
                    parser.enterState(STATE_PARSED_TEXT_CONTENT);
                } else if (parent.body === BODY_STATIC_TEXT) {
                    parser.enterState(STATE_STATIC_TEXT_CONTENT);
                } else {
                    throw new Error('Illegal value for parent.body: ' + parent.body);
                }
            } else {
                return parser.enterState(STATE_HTML_CONTENT);
            }
        }

        /**
         * This method gets called when we are in non-concise mode
         * and we are exiting out of non-concise mode.
         */
        function endHtmlBlock() {
            if (text && (isWithinSingleLineHtmlBlock || htmlBlockDelimiter)) {
                // Remove the new line that was required to end a single line
                // HTML block or a delimited block
                text = text.replace(/(\r\n|\n)$/, '');
            }

            // End any text
            endText();

            // Make sure all tags in this HTML block are closed
            for (let i=blockStack.length-1; i>=0; i--) {
                var curBlock = blockStack[i];
                if (curBlock.type === 'html') {
                    // Remove the HTML block from the stack since it has ended
                    blockStack.pop();
                    // We have reached the point where the HTML block started
                    // so we can stop
                    break;
                } else {
                    // The current block is for an HTML tag and it still open. When a tag is tag is closed
                    // it is removed from the stack
                    notifyError(curBlock.pos,
                        'MISSING_END_TAG',
                        'Missing ending "' + curBlock.tagName + '" tag');
                    return;
                }
            }

            // Resert variables associated with parsing an HTML block
            htmlBlockIndent = null;
            htmlBlockDelimiter = null;
            isWithinSingleLineHtmlBlock = false;

            if (parser.state !== STATE_CONCISE_HTML_CONTENT) {
                parser.enterState(STATE_CONCISE_HTML_CONTENT);
            }
        }

        /**
         * This function gets called when we reach EOF outside of a tag.
         */
        function htmlEOF() {
            endText();

            while(blockStack.length) {
                var curBlock = peek(blockStack);
                if (curBlock.type === 'tag') {
                    if (curBlock.concise) {
                        closeTag(curBlock.expectedCloseTagName);
                    } else {
                        // We found an unclosed tag on the stack that is not for a concise tag. That means
                        // there is a problem with the template because all open tags should have a closing
                        // tag
                        //
                        // NOTE: We have already closed tags that are open tag only or self-closed
                        notifyError(curBlock.pos,
                            'MISSING_END_TAG',
                            'Missing ending "' + curBlock.tagName + '" tag');
                        return;
                    }
                } else if (curBlock.type === 'html') {
                    // We reached the end of file while still within a single line HTML block. That's okay
                    // though since we know the line is completely. We'll continue ending all open concise tags.
                    blockStack.pop();
                } else {
                    // There is a bug in our parser...
                    throw new Error('Illegal state. There should not be any non-concise tags on the stack when in concise mode');
                }
            }
        }

        function openTagEOF() {
            if (isConcise) {
                if (currentOpenTag.withinAttrGroup) {
                    notifyError(currentOpenTag.pos,
                        'MALFORMED_OPEN_TAG',
                        'EOF reached while within an attribute group (e.g. "[ ... ]").');
                    return;
                }

                // If we reach EOF inside an open tag when in concise-mode
                // then we just end the tag and all other open tags on the stack
                finishOpenTag();
                htmlEOF();
            } else {
                // Otherwise, in non-concise mode we consider this malformed input
                // since the end '>' was not found.
                notifyError(currentOpenTag.pos,
                    'MALFORMED_OPEN_TAG',
                    'EOF reached while parsing open tag');
            }
        }

        var notifyCDATA = notifiers.notifyCDATA;
        var notifyComment = notifiers.notifyComment;
        var notifyOpenTag = notifiers.notifyOpenTag;
        var notifyOpenTagName = notifiers.notifyOpenTagName;
        var notifyCloseTag = notifiers.notifyCloseTag;
        var notifyDocumentType = notifiers.notifyDocumentType;
        var notifyDeclaration = notifiers.notifyDeclaration;
        var notifyPlaceholder = notifiers.notifyPlaceholder;
        var notifyScriptlet = notifiers.notifyScriptlet;

        function notifyError(pos, errorCode, message) {
            parser.end();
            notifiers.notifyError(pos, errorCode, message);
        }

        function beginAttribute() {
            currentAttribute = {};
            if (currentOpenTag.attributes === EMPTY_ATTRIBUTES) {
                currentOpenTag.attributes = [currentAttribute];
            } else {
                currentOpenTag.attributes.push(currentAttribute);
            }
            parser.enterState(STATE_ATTRIBUTE_NAME);
            return currentAttribute;
        }

        function endAttribute() {
            currentAttribute = null;
            if (parser.state !== STATE_WITHIN_OPEN_TAG) {
                parser.enterState(STATE_WITHIN_OPEN_TAG);
            }
        }

        function beginOpenTag() {
            endText();

            var tagInfo = {
                type: 'tag',
                tagName: '',
                tagNameParts: null,
                attributes: [],
                argument: undefined,
                params: undefined,
                pos: parser.pos,
                indent: indent,
                nestedIndent: null, // This will get set when we know what hte nested indent is
                concise: isConcise
            };

            withinOpenTag = true;

            if (beginMixedMode) {
                tagInfo.beginMixedMode = true;
                beginMixedMode = false;
            }

            blockStack.push(tagInfo);

            currentOpenTag = tagInfo;

            parser.enterState(STATE_TAG_NAME);

            return currentOpenTag;
        }

        function finishOpenTag(selfClosed) {
            var tagName = currentOpenTag.tagName;
            var attributes = currentOpenTag.attributes;
            var parseOptions = currentOpenTag.parseOptions;

            var ignoreAttributes = parseOptions && parseOptions.ignoreAttributes === true;

            if (ignoreAttributes) {
                attributes.length = 0;
            } else {
                if (currentOpenTag.requiresCommas && attributes.length > 1) {
                    for(let i = 0; i < attributes.length-1; i++) {
                        if(!attributes[i].endedWithComma) {


                            if (!parseOptions || parseOptions.relaxRequireCommas !== true) {
                                notifyError(attributes[i].pos,
                                    'COMMAS_REQUIRED',
                                    'if commas are used, they must be used to separate all attributes for a tag');
                            }
                        }
                    }
                }

                if (currentOpenTag.hasUnenclosedWhitespace && attributes.length > 1) {
                    for(let i = 0; i < attributes.length-1; i++) {
                        if(!attributes[i].endedWithComma) {
                            notifyError(attributes[i].pos,
                                'COMMAS_REQUIRED',
                                'commas are required to separate all attributes when using complex attribute values with un-enclosed whitespace');
                        }
                    }
                }
            }


            currentOpenTag.expectedCloseTagName = expectedCloseTagName =
                parser.substring(currentOpenTag.tagNameStart, currentOpenTag.tagNameEnd);

            var openTagOnly = currentOpenTag.openTagOnly = isOpenTagOnly(tagName);
            var endPos = parser.pos;

            if (!isConcise) {
                if (selfClosed) {
                    endPos += 2; // Skip past '/>'
                } else {
                    endPos += 1;
                }
            }

            if (currentOpenTag.tagNameParts) {
                currentOpenTag.tagNameExpression = currentOpenTag.tagNameParts.join('+');
            }

            currentOpenTag.endPos = endPos;
            currentOpenTag.selfClosed = selfClosed === true;

            if (!currentOpenTag.tagName && !currentOpenTag.emptyTagName) {
                tagName = currentOpenTag.tagName = 'div';
            }

            var origState = parser.state;
            notifyOpenTag(currentOpenTag);

            var shouldClose = false;

            if (selfClosed) {
                shouldClose = true;
            } else if (openTagOnly) {
                if (!isConcise) {
                    // Only close the tag if we are not in concise mode. In concise mode
                    // we want to keep the tag on the stack to make sure nothing is nested below it
                    shouldClose = true;
                }
            }

            if (shouldClose) {
                closeTag(expectedCloseTagName);
            }

            withinOpenTag = false;

            if (shouldClose) {
                if (isConcise) {
                    parser.enterConciseHtmlContentState();
                } else {
                    parser.enterHtmlContentState();
                }
            } else {
                // Did the parser stay in the same state after
                // notifying listeners about openTag?
                if (parser.state === origState) {
                    // The listener didn't transition the parser to a new state
                    // so we use some simple rules to find the appropriate state.
                    if (tagName === 'script') {
                        parser.enterJsContentState();
                    } else if (tagName === 'style') {
                        parser.enterCssContentState();
                    } else {
                        if (isConcise) {
                            parser.enterConciseHtmlContentState();
                        } else {
                            parser.enterHtmlContentState();
                        }

                    }
                }
            }

            // We need to record the "expected close tag name" if we transition into
            // either STATE_STATIC_TEXT_CONTENT or STATE_PARSED_TEXT_CONTENT
            currentOpenTag = undefined;
        }

        function closeTag(tagName, pos, endPos) {
            if (!tagName) {
                throw new Error('Illegal state. Invalid tag name');
            }
            var lastTag = blockStack.length ? blockStack.pop() : undefined;

            if (pos == null && closeTagPos != null) {
                pos = closeTagPos;
                endPos = parser.pos + 1;
            }

            if (!lastTag || lastTag.type !== 'tag') {
                return notifyError(pos,
                    'EXTRA_CLOSING_TAG',
                    'The closing "' + tagName + '" tag was not expected');
            }

            if (!lastTag || (lastTag.expectedCloseTagName !== tagName && lastTag.tagName !== tagName)) {
                return notifyError(pos,
                    'MISMATCHED_CLOSING_TAG',
                    'The closing "' + tagName + '" tag does not match the corresponding opening "' + lastTag.expectedCloseTagName + '" tag');
            }

            tagName = lastTag.tagName;

            notifyCloseTag(tagName, pos, endPos);

            if (lastTag.beginMixedMode) {
                endingMixedModeAtEOL = true;
            }

            closeTagName = null;
            closeTagPos = null;

            lastTag = peek(blockStack);
            expectedCloseTagName = lastTag && lastTag.expectedCloseTagName;
        }

        function beginPart() {
            currentPart = {
                pos: parser.pos,
                parentState: parser.state
            };

            partStack.push(currentPart);

            return currentPart;
        }

        function endPart() {
            var last = partStack.pop();
            parser.endPos = parser.pos;
            parser.enterState(last.parentState);
            currentPart = partStack.length ? peek(partStack) : undefined;
            return last;
        }

        // Expression

        function beginExpression(endAfterGroup) {
            var expression = beginPart();
            expression.value = '';
            expression.groupStack = [];
            expression.endAfterGroup = endAfterGroup === true;
            expression.isStringLiteral = null;
            parser.enterState(STATE_EXPRESSION);
            return expression;
        }

        function endExpression() {
            var expression = endPart();
            // Probably shouldn't do this, but it makes it easier to test!
            if(expression.parentState === STATE_ATTRIBUTE_VALUE && expression.hasUnenclosedWhitespace) {
                expression.value = '('+expression.value+')';
            }
            expression.parentState.expression(expression);
        }

        // --------------------------

        // String

        function beginString(quoteChar, quoteCharCode) {
            var string = beginPart();
            string.stringParts = [];
            string.currentText = '';
            string.quoteChar = quoteChar;
            string.quoteCharCode = quoteCharCode;
            string.isStringLiteral = true;
            parser.enterState(STATE_STRING);
            return string;
        }

        function endString() {
            var string = endPart();
            string.value = notifiers.notifyString(string);
            string.parentState.string(string);
        }

        // --------------------------

        // Template String

        function beginTemplateString() {
            var templateString = beginPart();
            templateString.value = '`';
            parser.enterState(STATE_TEMPLATE_STRING);
            return templateString;
        }

        function endTemplateString() {
            var templateString = endPart();
            templateString.parentState.templateString(templateString);
        }

        // --------------------------

        // Regular Expression

        function beginRegularExpression() {
            var regularExpression = beginPart();
            regularExpression.value = '/';
            parser.enterState(STATE_REGULAR_EXPRESSION);
            return regularExpression;
        }

        function endRegularExpression() {
            var regularExpression = endPart();
            regularExpression.parentState.regularExpression(regularExpression);
        }

        // --------------------------


        // Scriptlet

        function beginScriptlet() {
            endText();

            var scriptlet = beginPart();
            scriptlet.tag = true;
            scriptlet.value = '';
            scriptlet.quoteCharCode = null;
            parser.enterState(STATE_SCRIPTLET);
            return scriptlet;
        }

        function endScriptlet(endPos) {
            var scriptlet = endPart();
            scriptlet.endPos = endPos;
            notifyScriptlet(scriptlet);
        }

        // InlineScript

        function beginInlineScript() {
            endText();

            var inlineScript = beginPart();
            inlineScript.value = '';
            inlineScript.endMatches = [];
            parser.enterState(STATE_INLINE_SCRIPT);
            return inlineScript;
        }

        function endInlineScript(endPos) {
            var inlineScript = endPart();
            var value = inlineScript.value;
            inlineScript.endPos = endPos;

            if (value[0] === '{' && value[value.length-1] === '}') {
                inlineScript.value = value.slice(1, -1);
                inlineScript.block = true;
            } else {
                inlineScript.line = true;
            }

            notifyScriptlet(inlineScript);
        }

        // --------------------------


        // DTD

        function beginDocumentType() {
            endText();

            var documentType = beginPart();
            documentType.value = '';

            parser.enterState(STATE_DTD);
            return documentType;
        }

        function endDocumentType() {
            var documentType = endPart();
            notifyDocumentType(documentType);
        }

        // --------------------------

        // Declaration
        function beginDeclaration() {
            endText();

            var declaration = beginPart();
            declaration.value = '';
            parser.enterState(STATE_DECLARATION);
            return declaration;
        }

        function endDeclaration() {
            var declaration = endPart();
            notifyDeclaration(declaration);
        }

        // --------------------------

        // CDATA

        function beginCDATA() {
            endText();

            var cdata = beginPart();
            cdata.value = '';
            parser.enterState(STATE_CDATA);
            return cdata;
        }

        function endCDATA() {
            var cdata = endPart();
            notifyCDATA(cdata.value, cdata.pos, parser.pos + 3);
        }

        // --------------------------

        // JavaScript Comments
        function beginLineComment() {
            var comment = beginPart();
            comment.value = '';
            comment.type = 'line';
            parser.enterState(STATE_JS_COMMENT_LINE);
            return comment;
        }

        function beginBlockComment() {
            var comment = beginPart();
            comment.value = '';
            comment.type = 'block';
            parser.enterState(STATE_JS_COMMENT_BLOCK);
            return comment;
        }

        function endJavaScriptComment() {
            var comment = endPart();
            comment.rawValue = comment.type === 'line' ?
                '//' + comment.value :
                '/*' + comment.value + '*/';
            comment.parentState.comment(comment);
        }
        // --------------------------

        // HTML Comment

        function beginHtmlComment() {
            endText();
            var comment = beginPart();
            comment.value = '';
            parser.enterState(STATE_HTML_COMMENT);
            return comment;
        }

        function endHtmlComment() {
            var comment = endPart();
            comment.endPos = parser.pos + 3;
            notifyComment(comment);
        }

        // --------------------------

        // Trailing whitespace

        function beginCheckTrailingWhitespace(handler) {
            var part = beginPart();
            part.handler = handler;
            if (typeof handler !== 'function') {
                throw new Error('Invalid handler');
            }
            parser.enterState(STATE_CHECK_TRAILING_WHITESPACE);
        }

        function endCheckTrailingWhitespace(err, eof) {
            var part = endPart();
            part.handler(err, eof);
        }

        function handleTrailingWhitespaceJavaScriptComment(err) {
            if (err) {
                // This is a non-whitespace! We don't allow non-whitespace
                // after matching two or more hyphens. This is user error...
                notifyError(parser.pos,
                    'INVALID_CHARACTER',
                    'A non-whitespace of "' + err.ch + '" was found after a JavaScript block comment.');
            }

            return;
        }

        function handleTrailingWhitespaceMultilineHtmlBlock(err, eof) {
            if (err) {
                // This is a non-whitespace! We don't allow non-whitespace
                // after matching two or more hyphens. This is user error...
                notifyError(parser.pos,
                    'INVALID_CHARACTER',
                    'A non-whitespace of "' + err.ch + '" was found on the same line as the ending delimiter ("' + htmlBlockDelimiter + '") for a multiline HTML block');
                return;
            }

            endHtmlBlock();

            if (eof) {
                htmlEOF();
            }

            return;
        }

        // --------------------------

        // Placeholder

        function beginPlaceholder(escape, withinTagName) {
            var placeholder = beginPart();
            placeholder.value = '';
            placeholder.escape = escape !== false;
            placeholder.type = 'placeholder';
            placeholder.withinBody = withinOpenTag !== true;
            placeholder.withinAttribute = currentAttribute != null;
            placeholder.withinString = placeholder.parentState === STATE_STRING;
            placeholder.withinTemplateString = placeholder.parentState === STATE_TEMPLATE_STRING;
            placeholder.withinOpenTag = withinOpenTag === true && currentAttribute == null;
            placeholder.withinTagName = withinTagName;
            placeholderDepth++;
            parser.enterState(STATE_PLACEHOLDER);
            return placeholder;
        }

        function endPlaceholder() {
            var placeholder = endPart();
            placeholderDepth--;
            if (!placeholder.withinTemplateString) {
                var newExpression = notifyPlaceholder(placeholder);
                placeholder.value = newExpression;
            }
            placeholder.parentState.placeholder(placeholder);
        }

        // --------------------------

        // Placeholder

        function beginTagNameShorthand(escape, withinTagName) {
            var shorthand = beginPart();
            shorthand.currentPart = null;
            shorthand.hasId = false;
            shorthand.beginPart = function(type) {
                shorthand.currentPart = {
                    type: type,
                    stringParts: [],
                    rawParts: [],
                    text: '',
                    _endText() {
                        var text = this.text;

                        if (text) {
                            this.stringParts.push(JSON.stringify(text));
                            this.rawParts.push({
                                text: text,
                                pos: parser.pos - text.length,
                                endPos: parser.pos
                            });
                        }

                        this.text = '';
                    },
                    addPlaceholder(placeholder) {
                        var startPos = placeholder.pos + (placeholder.escape ? 2 : 3);
                        var endPos = placeholder.endPos - 1;
                        this._endText();
                        this.stringParts.push('(' + placeholder.value + ')');
                        this.rawParts.push({
                            expression: parser.src.slice(startPos, endPos),
                            pos: startPos,
                            endPos: endPos
                        });
                    },
                    end() {
                        this._endText();

                        var expression = this.stringParts.join('+');

                        if (type === 'id') {
                            currentOpenTag.shorthandId = {
                                value: expression,
                                rawParts: this.rawParts
                            };
                        } else if (type === 'class') {
                            if (!currentOpenTag.shorthandClassNames) {
                                currentOpenTag.shorthandClassNames = [];
                            }

                            currentOpenTag.shorthandClassNames.push({
                                value: expression,
                                rawParts: this.rawParts
                            });
                        }
                    }
                };
            };
            parser.enterState(STATE_TAG_NAME_SHORTHAND);
            return shorthand;
        }

        function endTagNameShorthand() {
            var shorthand = endPart();
            if (shorthand.currentPart) {
                shorthand.currentPart.end();
            }
            parser.enterState(STATE_WITHIN_OPEN_TAG);
        }

        // --------------------------

        function getAndRemoveArgument(expression) {
            let start = expression.lastLeftParenPos;
            if (start != null) {
                // The tag has an argument that we need to slice off
                let end = expression.lastRightParenPos;
                if (end === expression.value.length - 1) {
                    var argument = {
                        value: expression.value.substring(start+1, end),
                        pos: expression.pos + start,
                        endPos: expression.pos + end + 1
                    };

                    // Chop off the argument from the expression
                    expression.value = expression.value.substring(0, start);
                    // Fix the end position for the expression
                    expression.endPos = expression.pos + expression.value.length;

                    return argument;
                }
            }

            return undefined;
        }

        // --------------------------

        function checkForPlaceholder(ch, code) {
            if (code === CODE_DOLLAR) {
                var nextCode = parser.lookAtCharCodeAhead(1);
                if (nextCode === CODE_OPEN_CURLY_BRACE) {
                    // We expect to start a placeholder at the first curly brace (the next character)
                    beginPlaceholder(true);
                    return true;
                } else if (nextCode === CODE_EXCLAMATION) {
                    var afterExclamationCode = parser.lookAtCharCodeAhead(2);
                    if (afterExclamationCode === CODE_OPEN_CURLY_BRACE) {
                        // We expect to start a placeholder at the first curly brace so skip
                        // past the exclamation point
                        beginPlaceholder(false);
                        parser.skip(1);
                        return true;
                    }
                }
            }

            return false;
        }

        function checkForEscapedPlaceholder(ch, code) {
            // Look for \${ and \$!{
            if (code === CODE_BACK_SLASH) {
                if (parser.lookAtCharCodeAhead(1) === CODE_DOLLAR) {
                    if (parser.lookAtCharCodeAhead(2) === CODE_OPEN_CURLY_BRACE) {
                        return true;
                    } else if (parser.lookAtCharCodeAhead(2) === CODE_EXCLAMATION) {
                        if (parser.lookAtCharCodeAhead(3) === CODE_OPEN_CURLY_BRACE) {
                            return true;
                        }
                    }
                }
            }

            return false;
        }

        function checkForEscapedEscapedPlaceholder(ch, code) {
            // Look for \\${ and \\$!{
            if (code === CODE_BACK_SLASH) {
                if (parser.lookAtCharCodeAhead(1) === CODE_BACK_SLASH) {
                    if (parser.lookAtCharCodeAhead(2) === CODE_DOLLAR) {
                        if (parser.lookAtCharCodeAhead(3) === CODE_OPEN_CURLY_BRACE) {
                            return true;
                        } else if (parser.lookAtCharCodeAhead(3) === CODE_EXCLAMATION) {
                            if (parser.lookAtCharCodeAhead(4) === CODE_OPEN_CURLY_BRACE) {
                                return true;
                            }
                        }
                    }
                }
            }

            return false;
        }

        function lookPastWhitespaceFor(str, start) {
            var ahead = start == null ? 1 : start;
            while(isWhitespaceCode(parser.lookAtCharCodeAhead(ahead))) ahead++;
            return !!parser.lookAheadFor(str, parser.pos+ahead);
        }

        function getPreviousNonWhitespaceChar(start) {
            var behind = start == null ? -1 : start;
            while(isWhitespaceCode(parser.lookAtCharCodeAhead(behind))) behind--;
            return parser.lookAtCharAhead(behind);
        }

        function getNextIndent() {
            var match = /[^\n]*\n(\s+)/.exec(parser.substring(parser.pos));
            if(match) {
                var whitespace = match[1].split(/\n/g);
                return whitespace[whitespace.length-1];
            }
        }

        function onlyWhitespaceRemainsOnLine(offset) {
            offset = offset == null ? 1 : offset;
            return /^\s*\n/.test(parser.substring(parser.pos+offset));
        }

        function consumeWhitespace() {
            var ahead = 1;
            var whitespace = '';
            while(isWhitespaceCode(parser.lookAtCharCodeAhead(ahead))) {
                whitespace += parser.lookAtCharAhead(ahead++);
            }
            parser.skip(whitespace.length);
            return whitespace;
        }

        function isBeginningOfLine() {
            var before = parser.substring(0, parser.pos);
            var lines = before.split('\n');
            var lastLine = lines[lines.length-1];
            return /^\s*$/.test(lastLine);
        }

        function checkForClosingTag() {
            // Look ahead to see if we found the closing tag that will
            // take us out of the EXPRESSION state...
            var lookAhead = '/' + expectedCloseTagName + '>';
            var match = parser.lookAheadFor(lookAhead);
            if (match) {
                if (parser.state === STATE_JS_COMMENT_LINE) {
                    endJavaScriptComment();
                }
                endText();

                closeTag(expectedCloseTagName, parser.pos, parser.pos + 1 + lookAhead.length);
                parser.skip(match.length);
                parser.enterState(STATE_HTML_CONTENT);
                return true;
            }

            return false;
        }

        function checkForCDATA() {
            if (parser.lookAheadFor('![CDATA[')) {
                beginCDATA();
                parser.skip(8);
                return true;
            }

            return false;
        }

        function checkForOperator() {
            var remaining = parser.data.substring(parser.pos);
            var matches = operators.patternNext.exec(remaining);

            if (matches) {
                var match = matches[0];
                var operator = matches[1];

                if (legacyCompatibility && operator === '-') {
                    return false;
                }

                var isIgnoredOperator = isConcise ? match.includes('[') : match.includes('>');
                if (!isIgnoredOperator) {
                    parser.skip(match.length-1);
                    return match;
                }
            } else {
                var previous = parser.substring(parser.pos-operators.longest, parser.pos);
                var match2 = operators.patternPrev.exec(previous);
                if(match2) {
                    parser.rewind(1);
                    var whitespace = consumeWhitespace();
                    return whitespace;
                }
            }

            return false;
        }

        function checkForTypeofOperator() {
            var remaining = parser.data.substring(parser.pos);
            var matches =  /^\s+typeof\s+/.exec(remaining);

            if (matches) {
                return matches[0];
            }

            return false;
        }

        function checkForTypeofOperatorAtStart() {
            var remaining = parser.data.substring(parser.pos);
            var matches =  /^typeof\s+/.exec(remaining);

            if (matches) {
                return matches[0];
            }

            return false;
        }

        function handleDelimitedBlockEOL(newLine) {
            // If we are within a delimited HTML block then we want to check if the next line is the end
            // delimiter. Since we are currently positioned at the start of the new line character our lookahead
            // will need to include the new line character, followed by the expected indentation, followed by
            // the delimiter.
            let endHtmlBlockLookahead = htmlBlockIndent + htmlBlockDelimiter;

            if (parser.lookAheadFor(endHtmlBlockLookahead, parser.pos + newLine.length)) {
                parser.skip(htmlBlockIndent.length);
                parser.skip(htmlBlockDelimiter.length);

                parser.enterState(STATE_CONCISE_HTML_CONTENT);

                beginCheckTrailingWhitespace(handleTrailingWhitespaceMultilineHtmlBlock);
                return;
            } else if (parser.lookAheadFor(htmlBlockIndent, parser.pos + newLine.length)) {
                // We know the next line does not end the multiline HTML block, but we need to check if there
                // is any indentation that we need to skip over as we continue parsing the HTML in this
                // multiline HTML block

                parser.skip(htmlBlockIndent.length);
                // We stay in the same state since we are still parsing a multiline, delimited HTML block
            } else if(htmlBlockIndent && !onlyWhitespaceRemainsOnLine()) {
                // the next line does not have enough indentation
                // so unless it is black (whitespace only),
                // we will end the block
                endHtmlBlock();
            }
        }

        // In STATE_HTML_CONTENT we are looking for tags and placeholders but
        // everything in between is treated as text.
        var STATE_HTML_CONTENT = Parser.createState({
            name: 'STATE_HTML_CONTENT',

            placeholder(placeholder) {
                // We found a placeholder while parsing the HTML content. This function is called
                // from endPlaceholder(). We have already notified the listener of the placeholder so there is
                // nothing to do here
            },

            eol(newLine) {
                text += newLine;

                if (beginMixedMode) {
                    beginMixedMode = false;
                    endHtmlBlock();
                } else if (endingMixedModeAtEOL) {
                    endingMixedModeAtEOL = false;
                    endHtmlBlock();
                } else if (isWithinSingleLineHtmlBlock) {
                    // We are parsing "HTML" and we reached the end of the line. If we are within a single
                    // line HTML block then we should return back to the state to parse concise HTML.
                    // A single line HTML block can be at the end of the tag or on its own line:
                    //
                    // span class="hello" - This is an HTML block at the end of a tag
                    //     - This is an HTML block on its own line
                    //
                    endHtmlBlock();
                } else if (htmlBlockDelimiter) {
                    handleDelimitedBlockEOL(newLine);
                }
            },

            eof: htmlEOF,

            enter() {
                textParseMode = 'html';
                isConcise = false; // Back into non-concise HTML parsing
            },

            char(ch, code) {
                if (code === CODE_OPEN_ANGLE_BRACKET) {
                    if (checkForCDATA()) {
                        return;
                    }

                    var nextCode = parser.lookAtCharCodeAhead(1);

                    if (nextCode === CODE_PERCENT) {
                        beginScriptlet();
                        parser.skip(1);
                    } else if (parser.lookAheadFor('!--')) {
                        beginHtmlComment();
                        parser.skip(3);
                    } else if (nextCode === CODE_EXCLAMATION) {
                        // something like:
                        // <!DOCTYPE html>
                        // NOTE: We already checked for CDATA earlier and <!--
                        beginDocumentType();
                        parser.skip(1);
                    } else if (nextCode === CODE_QUESTION) {
                        // something like:
                        // <?xml version="1.0"?>
                        beginDeclaration();
                        parser.skip(1);
                    } else if (nextCode === CODE_FORWARD_SLASH) {
                        closeTagPos = parser.pos;
                        closeTagName = null;

                        parser.skip(1);
                        // something like:
                        // </html>
                        endText();

                        parser.enterState(STATE_CLOSE_TAG);
                    } else if (nextCode === CODE_CLOSE_ANGLE_BRACKET ||
                               nextCode === CODE_OPEN_ANGLE_BRACKET ||
                               isWhitespaceCode(nextCode)) {
                        // something like:
                        // "<>"
                        // "<<"
                        // "< "
                        // We'll treat this left angle brakect as text
                        text += '<';
                    } else {
                        beginOpenTag();
                        currentOpenTag.tagNameStart = parser.pos+1;
                    }
                } else if (!ignorePlaceholders && checkForEscapedEscapedPlaceholder(ch, code)) {
                    text += '\\';
                    parser.skip(1);
                }  else if (!ignorePlaceholders && checkForEscapedPlaceholder(ch, code)) {
                    text += '$';
                    parser.skip(1);
                } else if (!ignorePlaceholders && checkForPlaceholder(ch, code)) {
                    // We went into placeholder state...
                    endText();
                } else if (!legacyCompatibility && code === CODE_DOLLAR && isWhitespaceCode(parser.lookAtCharCodeAhead(1)) && isBeginningOfLine()) {
                    parser.skip(1);
                    beginInlineScript();
                } else {
                    text += ch;
                }
            }
        });

        // In STATE_CONCISE_HTML_CONTENT we are looking for concise tags and text blocks based on indent
        var STATE_CONCISE_HTML_CONTENT = Parser.createState({
            name: 'STATE_CONCISE_HTML_CONTENT',

            eol(newLine) {
                text += newLine;
                indent = '';
            },

            eof: htmlEOF,

            enter() {
                isConcise = true;
                indent = '';
            },

            comment(comment) {
                var value = comment.value;

                value = value.trim();

                notifyComment({
                    value: value,
                    pos: comment.pos,
                    endPos: comment.endPos
                });

                if (comment.type === 'block') {
                    // Make sure there is only whitespace on the line
                    // after the ending "*/" sequence
                    beginCheckTrailingWhitespace(handleTrailingWhitespaceJavaScriptComment);
                }
            },

            endTrailingWhitespace(eof) {
                endHtmlBlock();

                if (eof) {
                    htmlEOF();
                }
            },

            char(ch, code) {
                if (isWhitespaceCode(code)) {
                    indent += ch;
                } else  {
                    while(true) {
                        let len = blockStack.length;
                        if (len) {
                            let curBlock = blockStack[len - 1];
                            if (curBlock.indent.length >= indent.length) {
                                closeTag(curBlock.expectedCloseTagName);
                            } else {
                                // Indentation is greater than the last tag so we are starting a
                                // nested tag and there are no more tags to end
                                break;
                            }
                        } else {
                            if (indent) {
                                notifyError(parser.pos,
                                    'BAD_INDENTATION',
                                    'Line has extra indentation at the beginning');
                                return;
                            }
                            break;
                        }
                    }

                    var parent = blockStack.length && blockStack[blockStack.length - 1];
                    var body;

                    if (parent) {
                        body = parent.body;
                        if (parent.openTagOnly) {
                            notifyError(parser.pos,
                                'INVALID_BODY',
                                'The "' + parent.tagName + '" tag does not allow nested body content');
                            return;
                        }

                        if (parent.nestedIndent) {
                            if (parent.nestedIndent.length !== indent.length) {
                                notifyError(parser.pos,
                                    'BAD_INDENTATION',
                                    'Line indentation does match indentation of previous line');
                                return;
                            }
                        } else {
                            parent.nestedIndent = indent;
                        }
                    }

                    if (body && code !== CODE_HTML_BLOCK_DELIMITER) {
                        notifyError(parser.pos,
                            'ILLEGAL_LINE_START',
                            'A line within a tag that only allows text content must begin with a "-" character');
                        return;
                    }

                    if (code === CODE_OPEN_ANGLE_BRACKET || (legacyCompatibility && code === CODE_DOLLAR)) {
                        if (code === CODE_DOLLAR) {
                            outputDeprecationWarning('Handling of a placeholder (i.e. "${...}") at the start of a concise line will be changing.\nA placeholder at the start of a concise line will now be handled as a tag name placeholder instead of a body text placeholder.\nSwitch to using "-- ${...}" to avoid breakage.\nSee: https://github.com/marko-js/htmljs-parser/issues/48');
                        }
                        beginMixedMode = true;
                        parser.rewind(1);
                        beginHtmlBlock();
                        return;
                    }

                    if (!legacyCompatibility && code === CODE_DOLLAR && isWhitespaceCode(parser.lookAtCharCodeAhead(1))) {
                        parser.skip(1);
                        beginInlineScript();
                        return;
                    }

                    if (code === CODE_HTML_BLOCK_DELIMITER) {
                        if (parser.lookAtCharCodeAhead(1) !== CODE_HTML_BLOCK_DELIMITER) {
                            if (legacyCompatibility) {
                                outputDeprecationWarning('The usage of a single hyphen at the start of a concise line is now deprecated. Use "--" instead.\nSee: https://github.com/marko-js/htmljs-parser/issues/43');
                            } else {
                                notifyError(parser.pos,
                                    'ILLEGAL_LINE_START',
                                    'A line in concise mode cannot start with a single hyphen. Use "--" instead. See: https://github.com/marko-js/htmljs-parser/issues/43');
                                return;
                            }
                        }

                        htmlBlockDelimiter = ch;
                        return parser.enterState(STATE_BEGIN_DELIMITED_HTML_BLOCK);
                    } else if (code === CODE_FORWARD_SLASH) {
                        // Check next character to see if we are in a comment
                        var nextCode = parser.lookAtCharCodeAhead(1);
                        if (nextCode === CODE_FORWARD_SLASH) {
                            beginLineComment();
                            parser.skip(1);
                            return;
                        } else if (nextCode === CODE_ASTERISK) {
                            beginBlockComment();
                            parser.skip(1);
                            return;
                        } else {
                            notifyError(parser.pos,
                                'ILLEGAL_LINE_START',
                                'A line in concise mode cannot start with "/" unless it starts a "//" or "/*" comment');
                            return;
                        }
                    } else {
                        beginOpenTag();
                        currentOpenTag.tagNameStart = parser.pos;
                        parser.rewind(1); // START_TAG_NAME expects to start at the first character
                    }

                }
            }
        });

        // In STATE_BEGIN_DELIMITED_HTML_BLOCK we have already found two consecutive hyphens. We expect
        // to reach the end of the line with only whitespace characters
        var STATE_BEGIN_DELIMITED_HTML_BLOCK = Parser.createState({
            name: 'STATE_BEGIN_DELIMITED_HTML_BLOCK',

            eol: function(newLine) {
                // We have reached the end of the first delimiter... we need to skip over any indentation on the next
                // line and we might also find that the multi-line, delimited block is immediately ended
                beginHtmlBlock(htmlBlockDelimiter);
                handleDelimitedBlockEOL(newLine);
            },

            eof: htmlEOF,

            char(ch, code) {
                if (code === CODE_HTML_BLOCK_DELIMITER) {
                    htmlBlockDelimiter += ch;
                } else if(!onlyWhitespaceRemainsOnLine()) {
                    isWithinSingleLineHtmlBlock = true;
                    beginHtmlBlock();
                }
            }
        });

        var STATE_CHECK_TRAILING_WHITESPACE = Parser.createState({
            name: 'STATE_CHECK_TRAILING_WHITESPACE',

            eol: function() {
                endCheckTrailingWhitespace(null /* no error */, false /* not EOF */);
            },

            eof: function() {
                endCheckTrailingWhitespace(null /* no error */, true /* EOF */);
            },

            char(ch, code) {
                if (isWhitespaceCode(code)) {
                    // Just whitespace... we are still good
                } else {
                    endCheckTrailingWhitespace({
                        ch: ch
                    });
                }
            }
        });

        // We enter STATE_STATIC_TEXT_CONTENT when a listener manually chooses
        // to enter this state after seeing an openTag event for a tag
        // whose content should not be parsed at all (except for the purpose
        // of looking for the end tag).
        var STATE_STATIC_TEXT_CONTENT = Parser.createState({
            name: 'STATE_STATIC_TEXT_CONTENT',

            enter() {
                textParseMode = 'static-text';
            },

            eol(newLine) {
                text += newLine;

                if (isWithinSingleLineHtmlBlock) {
                    // We are parsing "HTML" and we reached the end of the line. If we are within a single
                    // line HTML block then we should return back to the state to parse concise HTML.
                    // A single line HTML block can be at the end of the tag or on its own line:
                    //
                    // span class="hello" - This is an HTML block at the end of a tag
                    //     - This is an HTML block on its own line
                    //
                    endHtmlBlock();
                } else if (htmlBlockDelimiter) {
                    handleDelimitedBlockEOL(newLine);
                }
            },

            eof: htmlEOF,

            char(ch, code) {
                // See if we need to see if we reached the closing tag...
                if (!isConcise && code === CODE_OPEN_ANGLE_BRACKET) {
                    if (checkForClosingTag()) {
                        return;
                    }
                }

                text += ch;
            }
        });

        // We enter STATE_PARSED_TEXT_CONTENT when we are parsing
        // the body of a tag does not contain HTML tags but may contains
        // placeholders
        var STATE_PARSED_TEXT_CONTENT = Parser.createState({
            name: 'STATE_PARSED_TEXT_CONTENT',

            enter() {
                textParseMode = 'parsed-text';
            },

            placeholder: STATE_HTML_CONTENT.placeholder,

            comment(comment) {
                text += comment.rawValue;

                if (htmlBlockDelimiter && comment.eol) {
                    handleDelimitedBlockEOL(comment.eol);
                }
            },

            templateString(templateString) {
                text += templateString.value;
            },

            eol(newLine) {
                text += newLine;

                if (isWithinSingleLineHtmlBlock) {
                    // We are parsing "HTML" and we reached the end of the line. If we are within a single
                    // line HTML block then we should return back to the state to parse concise HTML.
                    // A single line HTML block can be at the end of the tag or on its own line:
                    //
                    // span class="hello" - This is an HTML block at the end of a tag
                    //     - This is an HTML block on its own line
                    //
                    endHtmlBlock();
                } else if (htmlBlockDelimiter) {
                    handleDelimitedBlockEOL(newLine);
                }
            },

            eof: htmlEOF,

            char(ch, code) {
                if (!isConcise && code === CODE_OPEN_ANGLE_BRACKET) {
                    // First, see if we need to see if we reached the closing tag
                    // and then check if we encountered CDATA
                    if (checkForClosingTag()) {
                        return;
                    } else if (checkForCDATA()) {
                        return;
                    } else if (parser.lookAtCharCodeAhead(1) === CODE_PERCENT) {
                        beginScriptlet();
                        parser.skip(1);
                        return;
                    }
                }


                if (code === CODE_FORWARD_SLASH) {
                    if (parser.lookAtCharCodeAhead(1) === CODE_ASTERISK) {
                        // Skip over code inside a JavaScript block comment
                        beginBlockComment();
                        parser.skip(1);
                        return;
                    } else if (parser.lookAtCharCodeAhead(1) === CODE_FORWARD_SLASH) {
                        beginLineComment();
                        parser.skip(1);
                        return;
                    }
                }

                if (code === CODE_BACKTICK) {
                    beginTemplateString();
                    return;

                }

                if (!ignorePlaceholders && checkForEscapedEscapedPlaceholder(ch, code)) {
                    parser.skip(1);
                }  else if (!ignorePlaceholders && checkForEscapedPlaceholder(ch, code)) {
                    text += '$';
                    parser.skip(1);
                    return;
                } else if (!ignorePlaceholders && checkForPlaceholder(ch, code)) {
                    // We went into placeholder state...
                    endText();
                    return;
                }

                text += ch;
            }
        });

        // We enter STATE_TAG_NAME after we encounter a "<"
        // followed by a non-special character
        var STATE_TAG_NAME = Parser.createState({
            name: 'STATE_TAG_NAME',

            eol: openTagEOL,

            eof: openTagEOF,
            
            expression(expression) {
                currentOpenTag.tagNameEnd = expression.endPos;

                if (expression.value) {
                    currentOpenTag.tagName += expression.value;

                    if (currentOpenTag.tagNameParts) {
                        currentOpenTag.tagNameParts.push(JSON.stringify(expression.value));
                    }
                }
            },

            placeholder(placeholder) {
                if (!currentOpenTag.tagNameParts) {
                    currentOpenTag.tagNameParts = [];

                    if (currentOpenTag.tagName) {
                        currentOpenTag.tagNameParts.push(JSON.stringify(currentOpenTag.tagName));
                    }
                }

                currentOpenTag.tagName += parser.substring(placeholder.pos, placeholder.endPos);
                currentOpenTag.tagNameParts.push('(' + placeholder.value + ')');
                currentOpenTag.tagNameEnd = placeholder.endPos;
                var nextCode = parser.lookAtCharCodeAhead(1);
                if (nextCode === CODE_OPEN_PAREN) {
                    endExpression();
                    parser.enterState(STATE_TAG_ARGS);
                }
            },

            enter(oldState) {
                if (oldState !== STATE_EXPRESSION) {
                    beginExpression();
                }
            },

            char(ch, code) {
                throw new Error('Illegal state');
            }
        });

        var STATE_TAG_ARGS = Parser.createState({
            name: 'STATE_TAG_ARGS',

            eol: openTagEOL,

            eof: openTagEOF,

            expression(expression) {
                var value = expression.value;
                if (value.charCodeAt(value.length-1) !== CODE_CLOSE_PAREN) {
                    throw new Error('Invalid argument');
                }
                expression.value = value.slice(1, value.length-1);
                expression.pos += 1;
                expression.endPos -= 1;
                currentOpenTag.argument = expression;

                if (parser.lookAtCharCodeAhead(1) === CODE_PIPE) {
                    parser.enterState(STATE_TAG_PARAMS);
                } else {
                    parser.enterState(STATE_WITHIN_OPEN_TAG);
                }
            },

            enter(oldState) {
                if (oldState !== STATE_EXPRESSION) {
                    beginExpression();
                }
            },

            char(ch, code) {
                throw new Error('Illegal state');
            }
        });

        var STATE_TAG_PARAMS = Parser.createState({
            name: 'STATE_TAG_PARAMS',

            eol: openTagEOL,

            eof: openTagEOF,

            expression(expression) {
                var value = expression.value;
                expression.value = value.slice(1);
                expression.pos += 1;
                currentOpenTag.params = expression;
                parser.enterState(STATE_WITHIN_OPEN_TAG);
            },

            enter(oldState) {
                if (oldState !== STATE_EXPRESSION) {
                    beginExpression();
                }
            },

            char(ch, code) {
                throw new Error('Illegal state');
            }
        });



        // We enter STATE_CDATA after we see "<![CDATA["
        var STATE_CDATA = Parser.createState({
            name: 'STATE_CDATA',

            enter() {
                textParseMode = 'cdata';
            },

            eof() {
                notifyError(currentPart.pos,
                    'MALFORMED_CDATA',
                    'EOF reached while parsing CDATA');
            },

            char(ch, code) {
                if (code === CODE_CLOSE_SQUARE_BRACKET) {
                    var match = parser.lookAheadFor(']>');
                    if (match) {
                        endCDATA();
                        parser.skip(match.length);
                        return;
                    }
                }

                currentPart.value += ch;
            }
        });

        // We enter STATE_CLOSE_TAG after we see "</"
        var STATE_CLOSE_TAG = Parser.createState({
            name: 'STATE_CLOSE_TAG',
            eof() {
                notifyError(closeTag.pos,
                    'MALFORMED_CLOSE_TAG',
                    'EOF reached while parsing closing tag');
            },

            enter() {
                closeTagName = '';
            },

            char(ch, code) {
                if (code === CODE_CLOSE_ANGLE_BRACKET) {
                    if (closeTagName.length > 0) {
                        closeTag(closeTagName, closeTagPos, parser.pos + 1);
                    } else {
                        closeTag(expectedCloseTagName, closeTagPos, parser.pos + 1);
                    }

                    parser.enterState(STATE_HTML_CONTENT);
                } else {
                    closeTagName += ch;
                }
            }
        });

        // We enter STATE_WITHIN_OPEN_TAG after we have fully
        // read in the tag name and encountered a whitespace character
        var STATE_WITHIN_OPEN_TAG = Parser.createState({
            name: 'STATE_WITHIN_OPEN_TAG',

            eol: openTagEOL,

            eof: openTagEOF,

            enter() {
                if (!currentOpenTag.notifiedOpenTagName) {
                    currentOpenTag.notifiedOpenTagName = true;
                    currentOpenTag.tagNameEndPos = parser.pos;
                    notifyOpenTagName(currentOpenTag);
                }
            },

            expression(expression) {
                var argument = getAndRemoveArgument(expression);

                if (argument) {
                    // We found an argument... the argument could be for an attribute or the tag
                    if (currentOpenTag.attributes.length === 0) {
                        if (currentOpenTag.argument != null) {
                            notifyError(expression.endPos,
                                'ILLEGAL_TAG_ARGUMENT',
                                'A tag can only have one argument');
                            return;
                        }
                        currentOpenTag.argument = argument;
                    } else {
                        let targetAttribute = currentAttribute || peek(currentOpenTag.attributes);

                        if (targetAttribute.argument != null) {
                            notifyError(expression.endPos,
                                'ILLEGAL_ATTRIBUTE_ARGUMENT',
                                'An attribute can only have one argument');
                            return;
                        }
                        targetAttribute.argument = argument;
                    }
                }
            },

            placeholder(placeholder) {
                var attr = beginAttribute();
                attr.value = placeholder.value;
                endAttribute();

                parser.enterState(STATE_AFTER_PLACEHOLDER_WITHIN_TAG);
            },

            comment(comment) {
                /* Ignore comments within an open tag */
            },

            char(ch, code) {
                if (isConcise) {
                    if (code === CODE_HTML_BLOCK_DELIMITER) {
                        if (parser.lookAtCharCodeAhead(1) !== CODE_HTML_BLOCK_DELIMITER) {
                            if (legacyCompatibility) {
                                outputDeprecationWarning('The usage of a single hyphen in a concise line is now deprecated. Use "--" instead.\nSee: https://github.com/marko-js/htmljs-parser/issues/43');
                            } else {
                                notifyError(currentOpenTag.pos,
                                    'MALFORMED_OPEN_TAG',
                                    '"-" not allowed as first character of attribute name');
                                return;
                            }
                        }

                        if (currentOpenTag.withinAttrGroup) {
                            notifyError(parser.pos,
                                'MALFORMED_OPEN_TAG',
                                'Attribute group was not properly ended');
                            return;
                        }

                        // The open tag is complete
                        finishOpenTag();

                        htmlBlockDelimiter = ch;
                        var nextIndent = getNextIndent();
                        if(nextIndent > indent) {
                            indent = nextIndent;
                        }
                        parser.enterState(STATE_BEGIN_DELIMITED_HTML_BLOCK);
                        return;
                    } else if (code === CODE_OPEN_SQUARE_BRACKET) {
                        if (currentOpenTag.withinAttrGroup) {
                            notifyError(parser.pos,
                                'MALFORMED_OPEN_TAG',
                                'Unexpected "[" character within open tag.');
                            return;
                        }

                        currentOpenTag.withinAttrGroup = true;
                        return;
                    } else if (code === CODE_CLOSE_SQUARE_BRACKET) {
                        if (!currentOpenTag.withinAttrGroup) {
                            notifyError(parser.pos,
                                'MALFORMED_OPEN_TAG',
                                'Unexpected "]" character within open tag.');
                            return;
                        }

                        currentOpenTag.withinAttrGroup = false;
                        return;
                    }
                } else {
                    if (code === CODE_CLOSE_ANGLE_BRACKET) {
                        finishOpenTag();
                        return;
                    } else if (code === CODE_FORWARD_SLASH) {
                        let nextCode = parser.lookAtCharCodeAhead(1);
                        if (nextCode === CODE_CLOSE_ANGLE_BRACKET) {
                            finishOpenTag(true /* self closed */);
                            parser.skip(1);
                            return;
                        }
                    }
                }

                if (checkForEscapedEscapedPlaceholder(ch, code)) {
                    let attr = beginAttribute();
                    attr.name = '\\';
                    parser.skip(1);
                    return;
                }  else if (checkForEscapedPlaceholder(ch, code)) {
                    let attr = beginAttribute();
                    attr.name = '$';
                    parser.skip(1);
                    return;
                } else if (checkForPlaceholder(ch, code)) {
                    return;
                }

                if (code === CODE_OPEN_ANGLE_BRACKET) {
                    return notifyError(parser.pos,
                        'ILLEGAL_ATTRIBUTE_NAME',
                        'Invalid attribute name. Attribute name cannot begin with the "<" character.');
                }

                if (code === CODE_FORWARD_SLASH && parser.lookAtCharCodeAhead(1) === CODE_ASTERISK) {
                    // Skip over code inside a JavaScript block comment
                    beginBlockComment();
                    parser.skip(1);
                    return;
                }

                if (isWhitespaceCode(code)) {
                    // ignore whitespace within element...
                } else if (code === CODE_OPEN_PAREN) {
                    parser.rewind(1);
                    beginExpression();
                    // encountered something like:
                    // <for (var i = 0; i < len; i++)>
                } else {
                    parser.rewind(1);
                    // attribute name is initially the first non-whitespace
                    // character that we found
                    beginAttribute();
                }
            }
        });

        // We enter STATE_ATTRIBUTE_NAME when we see a non-whitespace
        // character after reading the tag name
        var STATE_ATTRIBUTE_NAME = Parser.createState({
            name: 'STATE_ATTRIBUTE_NAME',

            eol: openTagEOL,

            eof: openTagEOF,

            expression(expression) {
                var argument = getAndRemoveArgument(expression);
                if (argument) {
                    // The tag has an argument that we need to slice off
                    currentAttribute.argument = argument;
                }

                if(expression.endedWithComma) {
                    // consume all following whitespace,
                    // including new lines (which allows attributes to
                    // span multiple lines in concise mode)
                    consumeWhitespace();
                    currentOpenTag.requiresCommas = true;
                    currentAttribute.endedWithComma = true;
                } else if(!lookPastWhitespaceFor('=', 0)){
                    currentOpenTag.lastAttrNoComma = true;
                }

                currentAttribute.name = currentAttribute.name ? currentAttribute.name + expression.value : expression.value;
                currentAttribute.pos = expression.pos;
                currentAttribute.endPos = expression.endPos;
            },

            enter(oldState) {
                if (currentOpenTag.requiresCommas && currentOpenTag.lastAttrNoComma) {
                    var parseOptions = currentOpenTag.parseOptions;

                    if (!parseOptions || parseOptions.relaxRequireCommas !== true) {
                        return notifyError(parser.pos,
                            'COMMAS_REQUIRED',
                            'if commas are used, they must be used to separate all attributes for a tag');
                    }
                }

                if (oldState !== STATE_EXPRESSION) {
                    beginExpression();
                }
            },

            char(ch, code) {
                throw new Error('Illegal state');
            }
        });

        // We enter STATE_ATTRIBUTE_VALUE when we see a "=" while in
        // the ATTRIBUTE_NAME state.
        var STATE_ATTRIBUTE_VALUE = Parser.createState({
            name: 'STATE_ATTRIBUTE_VALUE',

            expression(expression) {
                var value = expression.value;

                if (value === '') {

                    return notifyError(expression.pos,
                        'ILLEGAL_ATTRIBUTE_VALUE',
                        'No attribute value found after "="');
                }

                if(expression.endedWithComma) {
                    // consume all following whitespace,
                    // including new lines (which allows attributes to
                    // span multiple lines in concise mode)
                    consumeWhitespace();
                    currentOpenTag.requiresCommas = true;
                    currentAttribute.endedWithComma = true;
                } else {
                    currentOpenTag.lastAttrNoComma = true;
                }

                if(expression.hasUnenclosedWhitespace) {
                    currentOpenTag.hasUnenclosedWhitespace = true;
                }

                currentAttribute.value = value;
                currentAttribute.pos = expression.pos;
                currentAttribute.endPos = expression.endPos;

                // If the expression evaluates to a literal value then add the
                // `literalValue` property to the attribute
                if (expression.isStringLiteral) {
                    currentAttribute.literalValue = evaluateStringExpression(value, expression.pos, notifyError);
                } else if (value === 'true') {
                    currentAttribute.literalValue = true;
                } else if (value === 'false') {
                    currentAttribute.literalValue = false;
                } else if (value === 'null') {
                    currentAttribute.literalValue = null;
                } else if (value === 'undefined') {
                    currentAttribute.literalValue = undefined;
                } else if (NUMBER_REGEX.test(value)) {
                    currentAttribute.literalValue = Number(value);
                }

                // We encountered a whitespace character while parsing the attribute name. That
                // means the attribute name has ended and we should continue parsing within the
                // open tag
                endAttribute();
            },

            eol: openTagEOL,

            eof: openTagEOF,

            enter(oldState) {
                if (oldState !== STATE_EXPRESSION) {
                    beginExpression();
                }
            },

            char(ch, code) {
                throw new Error('Illegal state');
            }
        });

        var STATE_EXPRESSION = Parser.createState({
            name: 'STATE_EXPRESSION',

            eol(str) {
                let depth = currentPart.groupStack.length;

                if (depth === 0) {
                    if (currentPart.parentState === STATE_ATTRIBUTE_NAME || currentPart.parentState === STATE_ATTRIBUTE_VALUE) {
                        currentPart.endPos = parser.pos;
                        endExpression();
                        // We encountered a whitespace character while parsing the attribute name. That
                        // means the attribute name has ended and we should continue parsing within the
                        // open tag
                        endAttribute();

                        if (isConcise) {
                            openTagEOL();
                        }
                        return;
                    } else if (currentPart.parentState === STATE_TAG_NAME) {
                        currentPart.endPos = parser.pos;
                        endExpression();

                        // We encountered a whitespace character while parsing the attribute name. That
                        // means the attribute name has ended and we should continue parsing within the
                        // open tag
                        if (parser.state !== STATE_WITHIN_OPEN_TAG) {
                            // Make sure we transition into parsing within the open tag
                            parser.enterState(STATE_WITHIN_OPEN_TAG);
                        }

                        if (isConcise) {
                            openTagEOL();
                        }

                        return;
                    }
                }

                currentPart.value += str;
            },

            eof() {
                if (isConcise && currentPart.groupStack.length === 0) {
                    currentPart.endPos = parser.pos;
                    endExpression();
                    openTagEOF();
                } else {
                    let parentState = currentPart.parentState;

                    if (parentState === STATE_ATTRIBUTE_NAME) {
                        return notifyError(currentPart.pos,
                            'MALFORMED_OPEN_TAG',
                            'EOF reached while parsing attribute name for the "' + currentOpenTag.tagName + '" tag');
                    } else if (parentState === STATE_ATTRIBUTE_VALUE) {
                        return notifyError(currentPart.pos,
                            'MALFORMED_OPEN_TAG',
                            'EOF reached while parsing attribute value for the "' + currentAttribute.name + '" attribute');
                    } else if (parentState === STATE_TAG_NAME) {
                        return notifyError(currentPart.pos,
                            'MALFORMED_OPEN_TAG',
                            'EOF reached while parsing tag name');
                    } else if (parentState === STATE_PLACEHOLDER) {
                        return notifyError(currentPart.pos,
                            'MALFORMED_PLACEHOLDER',
                            'EOF reached while parsing placeholder');
                    }

                    return notifyError(currentPart.pos,
                        'INVALID_EXPRESSION',
                        'EOF reached while parsing expression');
                }
            },

            string(string) {
                if (currentPart.value === '') {
                    currentPart.isStringLiteral = string.isStringLiteral === true;
                } else {
                    // More than one strings means it is for sure not a string literal...
                    currentPart.isStringLiteral = false;
                }

                currentPart.value += string.value;
            },

            comment(comment) {
                currentPart.isStringLiteral = false;
                currentPart.value += comment.rawValue;
            },

            templateString(templateString) {
                currentPart.isStringLiteral = false;
                currentPart.value += templateString.value;
            },

            regularExpression(regularExpression) {
                currentPart.isStringLiteral = false;
                currentPart.value += regularExpression.value;
            },

            char(ch, code) {
                let depth = currentPart.groupStack.length;
                let parentState = currentPart.parentState;

                if (code === CODE_SINGLE_QUOTE) {
                    return beginString("'", CODE_SINGLE_QUOTE);
                } else if (code === CODE_DOUBLE_QUOTE) {
                    return beginString('"', CODE_DOUBLE_QUOTE);
                } else if (code === CODE_BACKTICK) {
                    return beginTemplateString();
                } else if (code === CODE_FORWARD_SLASH) {
                    // Check next character to see if we are in a comment
                    var nextCode = parser.lookAtCharCodeAhead(1);
                    if (nextCode === CODE_FORWARD_SLASH) {
                        beginLineComment();
                        parser.skip(1);
                        return;
                    } else if (nextCode === CODE_ASTERISK) {
                        beginBlockComment();
                        parser.skip(1);
                        return;
                    } else if (depth === 0 && !isConcise && nextCode === CODE_CLOSE_ANGLE_BRACKET) {
                        // Let the STATE_WITHIN_OPEN_TAG state deal with the ending tag sequence
                        currentPart.endPos = parser.pos;
                        endExpression();
                        parser.rewind(1);

                        if (parser.state !== STATE_WITHIN_OPEN_TAG) {
                            // Make sure we transition into parsing within the open tag
                            parser.enterState(STATE_WITHIN_OPEN_TAG);
                        }
                        return;
                    } else if (!/[\]})A-Z0-9.<%]/i.test(getPreviousNonWhitespaceChar())) {
                        beginRegularExpression();
                        return;
                    } 
                } else if (code === CODE_PIPE && parentState === STATE_TAG_PARAMS) {
                    if (depth === 0) {
                        currentPart.groupStack.push(code);
                        currentPart.isStringLiteral = false;
                        currentPart.value += ch;
                        return;
                    } else if (depth === 1) {
                        endExpression();
                        return;
                    }
                } else if (code === CODE_OPEN_PAREN ||
                           code === CODE_OPEN_SQUARE_BRACKET ||
                           code === CODE_OPEN_CURLY_BRACE) {

                    if (depth === 0 && code === CODE_OPEN_PAREN) {
                        currentPart.lastLeftParenPos = currentPart.value.length;
                    }

                    currentPart.groupStack.push(code);
                    currentPart.isStringLiteral = false;
                    currentPart.value += ch;
                    return;
                } else if (code === CODE_CLOSE_PAREN ||
                           code === CODE_CLOSE_SQUARE_BRACKET ||
                           code === CODE_CLOSE_CURLY_BRACE) {

                    if (depth === 0) {
                        if (code === CODE_CLOSE_SQUARE_BRACKET) {
                            // We are ending the attribute group so end this expression and let the
                            // STATE_WITHIN_OPEN_TAG state deal with the ending attribute group
                            if (currentOpenTag.withinAttrGroup) {
                                currentPart.endPos = parser.pos + 1;
                                endExpression();
                                // Let the STATE_WITHIN_OPEN_TAG state deal with the ending tag sequence
                                parser.rewind(1);
                                if (parser.state !== STATE_WITHIN_OPEN_TAG) {
                                    // Make sure we transition into parsing within the open tag
                                    parser.enterState(STATE_WITHIN_OPEN_TAG);
                                }
                                return;
                            }
                        } else {
                            return notifyError(currentPart.pos,
                                'INVALID_EXPRESSION',
                                'Mismatched group. A closing "' + ch + '" character was found but it is not matched with a corresponding opening character.');
                        }
                    }


                    let matchingGroupCharCode = currentPart.groupStack.pop();

                    if ((code === CODE_CLOSE_PAREN && matchingGroupCharCode !== CODE_OPEN_PAREN) ||
                        (code === CODE_CLOSE_SQUARE_BRACKET && matchingGroupCharCode !== CODE_OPEN_SQUARE_BRACKET) ||
                        (code === CODE_CLOSE_CURLY_BRACE && matchingGroupCharCode !== CODE_OPEN_CURLY_BRACE)) {
                            return notifyError(currentPart.pos,
                                'INVALID_EXPRESSION',
                                'Mismatched group. A "' + ch + '" character was found when "' + String.fromCharCode(matchingGroupCharCode) + '" was expected.');
                    }

                    currentPart.value += ch;

                    if (currentPart.groupStack.length === 0) {
                        if (code === CODE_CLOSE_PAREN) {
                            currentPart.lastRightParenPos = currentPart.value.length - 1;
                        } 
                        var endPlaceholder = code === CODE_CLOSE_CURLY_BRACE && parentState === STATE_PLACEHOLDER;
                        var endTagArgs = code === CODE_CLOSE_PAREN && parentState === STATE_TAG_ARGS;
                        if (endPlaceholder || endTagArgs) {
                            currentPart.endPos = parser.pos + 1;
                            endExpression();
                            return;
                        }
                    }

                    return;
                } else if (depth === 0) {

                    if (!isConcise) {
                        if (code === CODE_CLOSE_ANGLE_BRACKET &&
                            (parentState === STATE_TAG_NAME ||
                             parentState === STATE_ATTRIBUTE_NAME ||
                             parentState === STATE_ATTRIBUTE_VALUE ||
                             parentState === STATE_WITHIN_OPEN_TAG)) {
                            currentPart.endPos = parser.pos;
                            endExpression();
                            endAttribute();
                            // Let the STATE_WITHIN_OPEN_TAG state deal with the ending tag sequence
                            parser.rewind(1);
                            if (parser.state !== STATE_WITHIN_OPEN_TAG) {
                                // Make sure we transition into parsing within the open tag
                                parser.enterState(STATE_WITHIN_OPEN_TAG);
                            }
                            return;
                        }
                    }

                    if (code === CODE_SEMICOLON) {
                        endExpression();
                        endAttribute();
                        if(isConcise) {
                            finishOpenTag();
                            beginCheckTrailingWhitespace(function(hasChar) {
                                if(hasChar) {
                                    var code = hasChar.ch.charCodeAt(0);

                                    if(code === CODE_FORWARD_SLASH) {
                                        if(parser.lookAheadFor('/')) {
                                            beginLineComment();
                                            parser.skip(1);
                                            return;
                                        } else if(parser.lookAheadFor('*')) {
                                            beginBlockComment();
                                            parser.skip(1);
                                            return;
                                        }
                                    } else if (code === CODE_OPEN_ANGLE_BRACKET && parser.lookAheadFor('!--')) {
                                        // html comment
                                        beginHtmlComment();
                                        parser.skip(3);
                                        return;
                                    }

                                    notifyError(parser.pos,
                                        'INVALID_CODE_AFTER_SEMICOLON',
                                        'A semicolon indicates the end of a line.  Only comments may follow it.');
                                }
                            });
                        }
                        return;
                    }

                    if (currentPart.parentState === STATE_TAG_NAME) {
                        if (code === CODE_EQUAL || isWhitespaceCode(code)) {
                            // Handle the case where are only attributes and no tagname:
                            // <a=1 b=2/>
                            var remaining = parser.data.substring(parser.pos);
                            var equalMatches = /^\s*=\s*/.exec(remaining);

                            if (equalMatches) {
                                let attrName = currentPart.value;
                                let parserPos = parser.pos;
                                
                                if (!reflectiveAttributes) {
                                    currentPart.value = ''; // Reset the expression value to '' for the tag name
                                    // Backtrack to the beginning of the tag before firing the open tag name event:
                                    parser.pos = currentPart.pos;
                                    currentOpenTag.emptyTagName = true; // Set a flag to mark this as an empty tag name
                                }

                                endExpression();

                                // Start the attributes section with the first attribute name being what we thought
                                // was the tag name
                                currentAttribute = {
                                    name: attrName,
                                    pos: currentOpenTag.pos
                                };

                                currentOpenTag.attributes = [currentAttribute];
                                let equalMatch = equalMatches[0];
                                // Advance past the equal sign and whitespace to start parsing the attribute value
                                parser.pos = parserPos + equalMatch.length - 1;
                                parser.enterState(STATE_ATTRIBUTE_VALUE);
                                return;
                            }
                        }
                    }

                    if (code === CODE_COMMA || isWhitespaceCode(code)) {
                        if (code === CODE_COMMA || lookPastWhitespaceFor(',')) {
                            if(code !== CODE_COMMA) {
                                consumeWhitespace();
                                parser.skip(1);
                            }

                            currentPart.endedWithComma = true;
                        } else if (currentPart.parentState === STATE_ATTRIBUTE_NAME && lookPastWhitespaceFor('=')) {
                            consumeWhitespace();
                            return;
                        } else if (parentState === STATE_ATTRIBUTE_VALUE) {
                            var typeofExpression = checkForTypeofOperator();
                            if (typeofExpression) {
                                currentPart.value += typeofExpression;
                                currentPart.isStringLiteral = false;
                                currentPart.hasUnenclosedWhitespace = true;
                                parser.skip(typeofExpression.length-1);
                                return;
                            }

                            var operator = checkForOperator();

                            if (operator) {
                                currentPart.isStringLiteral = false;
                                currentPart.hasUnenclosedWhitespace = true;
                                currentPart.value += operator;
                                return;
                            }
                        }

                        currentPart.endPos = parser.pos;
                        endExpression();
                        endAttribute();
                        if (parser.state !== STATE_WITHIN_OPEN_TAG) {
                            // Make sure we transition into parsing within the open tag
                            parser.enterState(STATE_WITHIN_OPEN_TAG);
                        }
                        return;
                    } else if (code === CODE_EQUAL && parentState === STATE_ATTRIBUTE_NAME) {
                        currentPart.endPos = parser.pos;
                        endExpression();
                        // We encountered "=" which means we need to start reading
                        // the attribute value.
                        parser.enterState(STATE_ATTRIBUTE_VALUE);
                        consumeWhitespace();
                        return;
                    }

                    if (currentPart.value === '') {
                        let typeofExpression = checkForTypeofOperatorAtStart();
                        if (typeofExpression) {
                            currentPart.value += typeofExpression;
                            currentPart.isStringLiteral = false;
                            currentPart.hasUnenclosedWhitespace = true;
                            parser.skip(typeofExpression.length-1);
                            return;
                        }
                    }

                    if (currentPart.parentState === STATE_TAG_PARAMS) {
                        if (code === CODE_PIPE) {
                            endExpression();
                            parser.rewind(1);
                            parser.enterState(STATE_TAG_PARAMS);
                            return;
                        }
                    }

                    if (currentPart.parentState === STATE_TAG_NAME) {
                        if (checkForEscapedEscapedPlaceholder(ch, code)) {
                            currentPart.value += '\\';
                            parser.skip(1);
                            return;
                        }  else if (checkForEscapedPlaceholder(ch, code)) {
                            currentPart.value += '$';
                            parser.skip(1);
                            return;
                        } else if (code === CODE_DOLLAR && parser.lookAtCharCodeAhead(1) === CODE_OPEN_CURLY_BRACE) {
                            currentPart.endPos = parser.pos;
                            endExpression();
                            // We expect to start a placeholder at the first curly brace (the next character)
                            beginPlaceholder(true, true /* tag name */);
                            return;
                        } else if (code === CODE_PERIOD || code === CODE_NUMBER_SIGN) {
                            endExpression();
                            parser.rewind(1);
                            beginTagNameShorthand();
                            return;
                        } else if (parser.lookAtCharCodeAhead(1) === CODE_OPEN_PAREN) {
                            currentPart.value += ch;
                            endExpression();
                            parser.enterState(STATE_TAG_ARGS);
                            return;
                        } else if (code === CODE_PIPE) {
                            endExpression();
                            parser.rewind(1);
                            parser.enterState(STATE_TAG_PARAMS);
                            return;
                        }
                    }
                }

                // If we got here then we didn't find a string part so we know
                // the current expression is not a string literal
                currentPart.isStringLiteral = false;
                currentPart.value += ch;
            }
        });

        var STATE_TAG_NAME_SHORTHAND = Parser.createState({
            name: 'STATE_TAG_NAME_SHORTHAND',

            placeholder(placeholder) {
                var shorthand = currentPart;
                shorthand.currentPart.addPlaceholder(placeholder);
            },

            eol(str) {
                currentOpenTag.tagNameEnd = parser.pos;
                endTagNameShorthand();

                if (parser.state !== STATE_WITHIN_OPEN_TAG) {
                    // Make sure we transition into parsing within the open tag
                    parser.enterState(STATE_WITHIN_OPEN_TAG);
                }

                if (isConcise) {
                    openTagEOL();
                }
            },

            eof() {
                endTagNameShorthand();

                if (isConcise) {
                    openTagEOF();
                } else {
                    return notifyError(currentPart.pos,
                        'INVALID_TAG_SHORTHAND',
                        'EOF reached will parsing id/class shorthand in tag name');
                }
            },

            char(ch, code) {
                var shorthand = currentPart;
                if (!isConcise) {
                    if (code === CODE_CLOSE_ANGLE_BRACKET || code === CODE_FORWARD_SLASH) {
                        currentOpenTag.tagNameEnd = parser.pos;
                        endTagNameShorthand();
                        parser.rewind(1);
                        return;
                    }
                }

                if (isWhitespaceCode(code)) {
                    endTagNameShorthand();
                    currentOpenTag.tagNameEnd = parser.pos;
                    if (parser.state !== STATE_WITHIN_OPEN_TAG) {
                        parser.enterState(STATE_WITHIN_OPEN_TAG);
                    }
                    return;
                }

                if (code === CODE_PERIOD) {
                    if (shorthand.currentPart) {
                        shorthand.currentPart.end();
                    }

                    shorthand.beginPart('class');
                } else if (code === CODE_NUMBER_SIGN) {
                    if (shorthand.hasId) {
                        return notifyError(currentPart.pos,
                            'INVALID_TAG_SHORTHAND',
                            'Multiple shorthand ID parts are not allowed on the same tag');
                    }

                    shorthand.hasId = true;

                    if (shorthand.currentPart) {
                        shorthand.currentPart.end();
                    }

                    shorthand.beginPart('id');
                }

                else if (!ignorePlaceholders && checkForEscapedEscapedPlaceholder(ch, code)) {
                    shorthand.currentPart.text += '\\';
                    parser.skip(1);
                }  else if (!ignorePlaceholders && checkForEscapedPlaceholder(ch, code)) {
                    shorthand.currentPart.text += '$';
                    parser.skip(1);
                } else if (!ignorePlaceholders && checkForPlaceholder(ch, code)) {
                    // We went into placeholder state...
                } else if (code === CODE_OPEN_PAREN) {
                    endTagNameShorthand();
                    parser.rewind(1);
                    parser.enterState(STATE_TAG_ARGS);
                } else if (code === CODE_PIPE) {
                    endTagNameShorthand();
                    parser.rewind(1);
                    parser.enterState(STATE_TAG_PARAMS);
                } else {
                    shorthand.currentPart.text += ch;
                }
            }
        });

        // We enter STATE_WITHIN_OPEN_TAG after we have fully
        // read in the tag name and encountered a whitespace character
        var STATE_AFTER_PLACEHOLDER_WITHIN_TAG = Parser.createState({
            name: 'STATE_AFTER_PLACEHOLDER_WITHIN_TAG',

            eol: openTagEOL,

            eof: openTagEOF,

            char(ch, code) {

                if (!isConcise) {
                    if (code === CODE_CLOSE_ANGLE_BRACKET) {
                        finishOpenTag();
                        return;
                    } else if (code === CODE_FORWARD_SLASH) {
                        let nextCode = parser.lookAtCharCodeAhead(1);
                        if (nextCode === CODE_CLOSE_ANGLE_BRACKET) {
                            finishOpenTag(true /* self closed */);
                            parser.skip(1);
                            return;
                        }
                    }
                }

                if (isWhitespaceCode(code)) {
                    parser.enterState(STATE_WITHIN_OPEN_TAG);
                } else {
                    notifyError(parser.pos,
                        'UNEXPECTED_TEXT_AFTER_PLACEHOLDER_IN_TAG',
                        `An unexpected "${ch}" character was found after a placeoholder within the open tag.`);
                    return;
                }
            }
        });

        var STATE_PLACEHOLDER = Parser.createState({
            name: 'STATE_PLACEHOLDER',

            expression(expression) {
                currentPart.value = expression.value.slice(1, -1); // Chop off the curly braces
                currentPart.endPos = expression.endPos;
                endPlaceholder();
            },

            eol(str) {
                throw new Error('Illegal state. EOL not expected');
            },

            eof() {
                throw new Error('Illegal state. EOF not expected');
            },

            enter(oldState) {
                if (oldState !== STATE_EXPRESSION) {
                    beginExpression();
                }
            }
        });

        var STATE_STRING = Parser.createState({
            name: 'STATE_STRING',

            placeholder(placeholder) {
                if (currentPart.currentText) {
                    currentPart.stringParts.push(currentPart.currentText);
                    currentPart.currentText = '';
                }
                currentPart.isStringLiteral = false;
                currentPart.stringParts.push(placeholder);
            },

            eol(str) {
                // New line characters are not allowed in JavaScript string expressions. We need to use
                // a different character sequence, but we don't want to through off positions so we need
                // to use a replacement sequence with the same number of characters.
                if (str.length === 2) {
                    currentPart.currentText += '\\r\\n';
                } else {
                    currentPart.currentText += '\\n';
                }

            },

            eof() {
                if (placeholderDepth > 0) {
                    notifyError(parser.pos,
                        'INVALID_STRING',
                        'EOF reached while parsing string expression found inside placeholder');
                    return;
                }
                notifyError(parser.pos,
                    'INVALID_STRING',
                    'EOF reached while parsing string expression');
            },

            char(ch, code) {
                var stringParts = currentPart.stringParts;

                var nextCh;
                var quoteCharCode = currentPart.quoteCharCode;

                if (code === CODE_BACK_SLASH) {
                    if (checkForEscapedEscapedPlaceholder(ch, code)) {
                        if (ignorePlaceholders) {
                            // We are actually adding two escaped backslashes here...
                            currentPart.currentText += '\\\\\\\\';
                        } else {
                            currentPart.currentText += '\\';
                        }
                    } else if (checkForEscapedPlaceholder(ch, code)) {
                        if (ignorePlaceholders) {
                            // We are actually adding one escaped backslashes here...
                            currentPart.currentText += '\\\\$';
                        } else {
                            currentPart.currentText += '$';
                        }
                    } else {
                        // Handle string escape sequence
                        nextCh = parser.lookAtCharAhead(1);
                        currentPart.currentText += ch + nextCh;
                    }

                    parser.skip(1);
                } else if (code === quoteCharCode) {
                    // We encountered the end delimiter
                    if (currentPart.currentText) {
                        stringParts.push(currentPart.currentText);
                    }

                    let stringExpr = '';
                    let quoteChar =  currentPart.quoteChar;

                    if (stringParts.length) {
                        for (let i=0; i<stringParts.length; i++) {
                            let part = stringParts[i];
                            if (i !== 0) {
                                stringExpr += '+';
                            }

                            if (typeof part === 'string') {
                                stringExpr += quoteChar + part + quoteChar;
                            } else {
                                stringExpr += '(' + part.value + ')';
                            }
                        }
                    } else {
                        // Just an empty string...
                        stringExpr = quoteChar + quoteChar;
                    }

                    if (stringParts.length > 1) {
                        stringExpr = '(' + stringExpr + ')';
                    }

                    currentPart.value = stringExpr;
                    endString();
                } else if (!ignorePlaceholders && !ignoreNonstandardStringPlaceholders && checkForPlaceholder(ch, code)) {
                    if (currentPart.currentText) {
                        stringParts.push(currentPart.currentText);
                    }

                    currentPart.currentText = '';
                    // We encountered nested placeholder...
                    currentPart.isStringLiteral = false;
                } else {
                    currentPart.currentText += ch;
                }
            }
        });

        var STATE_TEMPLATE_STRING = Parser.createState({
            name: 'STATE_TEMPLATE_STRING',

            placeholder: function(placeholder) {
                currentPart.value += '${' + placeholder.value + '}';
            },

            eol(str) {
                currentPart.value += str;
            },

            eof() {
                notifyError(parser.pos,
                    'INVALID_TEMPLATE_STRING',
                    'EOF reached while parsing template string expression');
            },

            char(ch, code) {
                var nextCh;
                if (code === CODE_DOLLAR && parser.lookAtCharCodeAhead(1) === CODE_OPEN_CURLY_BRACE) {
                    beginPlaceholder(false);
                } else {
                    currentPart.value += ch;
                    if (code === CODE_BACK_SLASH) {
                        // Handle string escape sequence
                        nextCh = parser.lookAtCharAhead(1);
                        parser.skip(1);

                        currentPart.value += nextCh;
                    } else if (code === CODE_BACKTICK) {
                        endTemplateString();
                    }
                }
            }
        });

        var STATE_REGULAR_EXPRESSION = Parser.createState({
            name: 'STATE_REGULAR_EXPRESSION',

            eol() {
                notifyError(parser.pos,
                    'INVALID_REGULAR_EXPRESSION',
                    'EOL reached while parsing regular expression');
            },

            eof() {
                notifyError(parser.pos,
                    'INVALID_REGULAR_EXPRESSION',
                    'EOF reached while parsing regular expression');
            },

            char(ch, code) {
                var nextCh;
                currentPart.value += ch;
                if (code === CODE_BACK_SLASH) {
                    // Handle escape sequence
                    nextCh = parser.lookAtCharAhead(1);
                    parser.skip(1);
                    currentPart.value += nextCh;
                } else if (code === CODE_OPEN_SQUARE_BRACKET && currentPart.inCharacterSet) {
                    currentPart.inCharacterSet = true;
                } else if (code === CODE_CLOSE_SQUARE_BRACKET && currentPart.inCharacterSet) {
                    currentPart.inCharacterSet = false;
                } else if (code === CODE_FORWARD_SLASH && !currentPart.inCharacterSet) {
                    endRegularExpression();
                }
            }
        });

        // We enter STATE_JS_COMMENT_BLOCK after we encounter a "/*" sequence
        // while in STATE_ATTRIBUTE_VALUE or STATE_DELIMITED_EXPRESSION.
        // We leave STATE_JS_COMMENT_BLOCK when we see a "*/" sequence.
        var STATE_JS_COMMENT_BLOCK = Parser.createState({
            name: 'STATE_JS_COMMENT_BLOCK',

            eol(str) {
                currentPart.value += str;
            },

            eof() {
                notifyError(currentPart.pos,
                    'MALFORMED_COMMENT',
                    'EOF reached while parsing multi-line JavaScript comment');
            },

            char(ch, code) {
                if (code === CODE_ASTERISK) {
                    var nextCode = parser.lookAtCharCodeAhead(1);
                    if (nextCode === CODE_FORWARD_SLASH) {
                        currentPart.endPos = parser.pos + 2;
                        endJavaScriptComment();
                        parser.skip(1);
                        return;
                    }
                }

                currentPart.value += ch;
            }
        });

        // We enter STATE_JS_COMMENT_LINE after we encounter a "//" sequence
        // when parsing JavaScript code.
        // We leave STATE_JS_COMMENT_LINE when we see a newline character.
        var STATE_JS_COMMENT_LINE = Parser.createState({
            name: 'STATE_JS_COMMENT_LINE',

            eol(str) {
                parser.rewind(str.length);
                currentPart.endPos = parser.pos;
                endJavaScriptComment();
            },

            eof() {
                currentPart.endPos = parser.pos;
                endJavaScriptComment();
            },

            char(ch, code) {
                if (currentPart.parentState === STATE_PARSED_TEXT_CONTENT) {
                    if (!isConcise && code === CODE_OPEN_ANGLE_BRACKET) {
                        // First, see if we need to see if we reached the closing tag
                        // and then check if we encountered CDATA
                        if (checkForClosingTag()) {
                            return;
                        }
                    }
                }

                currentPart.value += ch;
            }
        });

        // We enter STATE_DTD after we encounter a "<!" while in the STATE_HTML_CONTENT.
        // We leave STATE_DTD if we see a ">".
        var STATE_DTD = Parser.createState({
            name: 'STATE_DTD',

            eol(str) {
                currentPart.value += str;
            },

            eof() {
                notifyError(currentPart.pos,
                    'MALFORMED_DOCUMENT_TYPE',
                    'EOF reached while parsing document type');
            },

            char(ch, code) {
                if (code === CODE_CLOSE_ANGLE_BRACKET) {
                    currentPart.endPos = parser.pos + 1;
                    endDocumentType();
                } else {
                    currentPart.value += ch;
                }
            }
        });

        // We enter STATE_DECLARATION after we encounter a "<?"
        // while in the STATE_HTML_CONTENT.
        // We leave STATE_DECLARATION if we see a "?>" or ">".
        var STATE_DECLARATION = Parser.createState({
            name: 'STATE_DECLARATION',

            eol(str) {
                currentPart.value += str;
            },

            eof() {
                notifyError(currentPart.pos,
                    'MALFORMED_DECLARATION',
                    'EOF reached while parsing declaration');
            },

            char(ch, code) {
                if (code === CODE_QUESTION) {
                    var nextCode = parser.lookAtCharCodeAhead(1);
                    if (nextCode === CODE_CLOSE_ANGLE_BRACKET) {
                        currentPart.endPos = parser.pos + 2;
                        endDeclaration();
                        parser.skip(1);
                    }
                } else if (code === CODE_CLOSE_ANGLE_BRACKET) {
                    currentPart.endPos = parser.pos + 1;
                    endDeclaration();
                } else {
                    currentPart.value += ch;
                }
            }
        });

        // We enter STATE_HTML_COMMENT after we encounter a "<--"
        // while in the STATE_HTML_CONTENT.
        // We leave STATE_HTML_COMMENT when we see a "-->".
        var STATE_HTML_COMMENT = Parser.createState({
            name: 'STATE_HTML_COMMENT',

            eol(newLineChars) {
                currentPart.value += newLineChars;
            },

            eof() {
                notifyError(currentPart.pos,
                    'MALFORMED_COMMENT',
                    'EOF reached while parsing comment');
            },

            char(ch, code) {
                if (code === CODE_HYPHEN) {
                    var match = parser.lookAheadFor('->');
                    if (match) {
                        currentPart.endPos = parser.pos + 3;
                        endHtmlComment();
                        parser.skip(match.length);
                    } else {
                        currentPart.value += ch;
                    }
                } else {
                    currentPart.value += ch;
                }
            }
        });

        // We enter STATE_SCRIPTLET after we encounter a "<%" while in STATE_HTML_CONTENT.
        // We leave STATE_SCRIPTLET if we see a "%>".
        var STATE_SCRIPTLET = Parser.createState({
            name: 'STATE_SCRIPTLET',

            eol(str) {
                currentPart.value += str;
            },

            eof() {
                notifyError(currentPart.pos,
                    'MALFORMED_SCRIPTLET',
                    'EOF reached while parsing scriptlet');
            },

            comment(comment) {
                currentPart.value += comment.rawValue;
            },

            char(ch, code) {
                if (currentPart.quoteCharCode) {
                    currentPart.value += ch;

                    // We are within a string... only look for ending string code
                    if (code === CODE_BACK_SLASH) {
                        // Handle string escape sequence
                        currentPart.value += parser.lookAtCharAhead(1);
                        parser.skip(1);
                    } else if (code === currentPart.quoteCharCode) {
                        currentPart.quoteCharCode = null;
                    }
                    return;
                } else if (code === CODE_FORWARD_SLASH) {
                    if (parser.lookAtCharCodeAhead(1) === CODE_ASTERISK) {
                        // Skip over code inside a JavaScript block comment
                        beginBlockComment();
                        parser.skip(1);
                        return;
                    }
                } else if (code === CODE_SINGLE_QUOTE || code === CODE_DOUBLE_QUOTE) {
                    currentPart.quoteCharCode = code;
                } else if (code === CODE_PERCENT) {
                    if (parser.lookAtCharCodeAhead(1) === CODE_CLOSE_ANGLE_BRACKET) {
                        endScriptlet(parser.pos + 2 /* end pos */);
                        parser.skip(1); // Skip over the closing right angle bracket
                        return;
                    }
                }

                currentPart.value += ch;
            }
        });

        var STATE_INLINE_SCRIPT = Parser.createState({
            name: 'STATE_INLINE_SCRIPT',

            eol(str) {
                if (currentPart.endMatch || currentPart.stringType === CODE_BACKTICK) {
                    currentPart.value += str;
                } else {
                    parser.rewind(str.length);
                    endInlineScript(parser.pos);
                }
            },

            eof() {
                if (currentPart.endMatch || currentPart.stringType) {
                    notifyError(currentPart.pos,
                        'MALFORMED_SCRIPTLET',
                        'EOF reached while parsing scriptet');
                } else {
                    endInlineScript(parser.pos);
                }
            },

            comment(comment) {
                currentPart.value += comment.rawValue;
            },

            char(ch, code) {
                if (code === CODE_BACK_SLASH) {
                    currentPart.value += ch + parser.lookAtCharAhead(1);
                    parser.skip(1);
                    return;
                }

                if (currentPart.stringType) {
                    if (code === currentPart.stringType) {
                        currentPart.stringType = null;
                    }

                    currentPart.value += ch;
                    return;
                }

                if (code === CODE_FORWARD_SLASH) {
                    // Check next character to see if we are in a comment
                    var nextCode = parser.lookAtCharCodeAhead(1);
                    if (nextCode === CODE_FORWARD_SLASH) {
                        beginLineComment();
                        parser.skip(1);
                        return;
                    } else if (nextCode === CODE_ASTERISK) {
                        beginBlockComment();
                        parser.skip(1);
                        return;
                    }
                }

                currentPart.value += ch;

                if (code === currentPart.endMatch) {
                    currentPart.endMatch = currentPart.endMatches.pop();
                    return;
                }

                if (code === CODE_SINGLE_QUOTE || code === CODE_DOUBLE_QUOTE || code === CODE_BACKTICK) {
                    currentPart.stringType = code;
                    return;
                }

                var nextMatch = null;

                if (code === CODE_OPEN_PAREN) {
                    nextMatch = CODE_CLOSE_PAREN;
                } else if (code === CODE_OPEN_CURLY_BRACE) {
                    nextMatch = CODE_CLOSE_CURLY_BRACE;
                } else if (code === CODE_OPEN_SQUARE_BRACKET) {
                    nextMatch = CODE_CLOSE_SQUARE_BRACKET;
                }

                if (nextMatch) {
                    if (currentPart.endMatch) {
                        currentPart.endMatches.push(currentPart.endMatch);
                    }
                    currentPart.endMatch = nextMatch;
                }
            }
        });

        parser.enterHtmlContentState = function() {
            if (parser.state !== STATE_HTML_CONTENT) {
                parser.enterState(STATE_HTML_CONTENT);
            }
        };

        parser.enterConciseHtmlContentState = function() {
            if (parser.state !== STATE_CONCISE_HTML_CONTENT) {
                parser.enterState(STATE_CONCISE_HTML_CONTENT);
            }
        };

        parser.enterParsedTextContentState = function() {
            var last = blockStack.length && blockStack[blockStack.length - 1];

            if (!last || !last.tagName) {
                throw new Error('The "parsed text content" parser state is only allowed within a tag');
            }

            if (isConcise) {
                // We will transition into the STATE_PARSED_TEXT_CONTENT state
                // for each of the nested HTML blocks
                last.body = BODY_PARSED_TEXT;
                parser.enterState(STATE_CONCISE_HTML_CONTENT);
            } else {
                parser.enterState(STATE_PARSED_TEXT_CONTENT);
            }
        };

        parser.enterJsContentState = parser.enterParsedTextContentState;
        parser.enterCssContentState = parser.enterParsedTextContentState;

        parser.enterStaticTextContentState = function() {
            var last = blockStack.length && blockStack[blockStack.length - 1];

            if (!last || !last.tagName) {
                throw new Error('The "static text content" parser state is only allowed within a tag');
            }

            if (isConcise) {
                // We will transition into the STATE_STATIC_TEXT_CONTENT state
                // for each of the nested HTML blocks
                last.body = BODY_STATIC_TEXT;
                parser.enterState(STATE_CONCISE_HTML_CONTENT);
            } else {
                parser.enterState(STATE_STATIC_TEXT_CONTENT);
            }
        };


        if (defaultMode === MODE_CONCISE) {
            parser.setInitialState(STATE_CONCISE_HTML_CONTENT);
            parser.enterDefaultState = function() {
                parser.enterState(STATE_CONCISE_HTML_CONTENT);
            };
        } else {
            parser.setInitialState(STATE_HTML_CONTENT);
            parser.enterDefaultState = function() {
                parser.enterState(STATE_HTML_CONTENT);
            };
        }
    }

    parse(data, filename) {
        super.parse(data, filename);
        this.notifiers.notifyFinish();
    }
}

module.exports = Parser;
},{"./BaseParser":12,"./html-tags":14,"./notify-util":16,"./operators":17,"char-props":9,"complain":10}],14:[function(require,module,exports){
var openTagOnly = {};

[
    'base',
    'br',
    'col',
    'hr',
    'embed',
    'img',
    'input',
    'keygen',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
].forEach(function(tagName) {
    openTagOnly[tagName] = true;
});

// [
//     'a',
//     'abbr',
//     'address',
//     'area',
//     'article',
//     'aside',
//     'audio',
//     'b',
//     'bdi',
//     'bdo',
//     'blockquote',
//     'body',
//     'button',
//     'canvas',
//     'caption',
//     'cite',
//     'code',
//     'colgroup',
//     'command',
//     'datalist',
//     'dd',
//     'del',
//     'details',
//     'dfn',
//     'div',
//     'dl',
//     'dt',
//     'em',
//     'fieldset',
//     'figcaption',
//     'figure',
//     'footer',
//     'form',
//     'h1',
//     'h2',
//     'h3',
//     'h4',
//     'h5',
//     'h6',
//     'head',
//     'header',
//     'hgroup',
//     'html',
//     'i',
//     'iframe',
//     'ins',
//     'kbd',
//     'label',
//     'legend',
//     'li',
//     'map',
//     'mark',
//     'menu',
//     'meter',
//     'nav',
//     'noscript',
//     'object',
//     'ol',
//     'optgroup',
//     'option',
//     'output',
//     'p',
//     'pre',
//     'progress',
//     'q',
//     'rp',
//     'rt',
//     'ruby',
//     's',
//     'samp',
//     'script',
//     'section',
//     'select',
//     'small',
//     'span',
//     'strong',
//     'style',
//     'sub',
//     'summary',
//     'sup',
//     'table',
//     'tbody',
//     'td',
//     'textarea',
//     'tfoot',
//     'th',
//     'thead',
//     'time',
//     'title',
//     'tr',
//     'u',
//     'ul',
//     'var',
//     'video',
//     'wbr'
// ].forEach(function(tagName) {
//     openTagOnly[tagName] = {
//         requireClosingTag: true
//     };
// });

exports.isOpenTagOnly = function(tagName) {
    return openTagOnly.hasOwnProperty(tagName);
};
},{}],15:[function(require,module,exports){
var Parser = require('./Parser');

exports.createParser = function(listeners, options) {
    var parser = new Parser(listeners, options || {});
    return parser;
};

},{"./Parser":13}],16:[function(require,module,exports){
exports.createNotifiers = function(parser, listeners) {
    var hasError = false;

    return {
        notifyText(value, textParseMode) {
            if (hasError) {
                return;
            }

            var eventFunc = listeners.onText;

            if (eventFunc && (value.length > 0)) {
                eventFunc.call(parser, {
                    type: 'text',
                    value: value,
                    parseMode: textParseMode
                }, parser);
            }
        },

        notifyCDATA(value, pos, endPos) {
            if (hasError) {
                return;
            }

            var eventFunc = listeners.onCDATA;

            if (eventFunc && value) {
                eventFunc.call(parser, {
                    type: 'cdata',
                    value: value,
                    pos: pos,
                    endPos: endPos
                }, parser);
            }
        },

        notifyError(pos, errorCode, message) {
            if (hasError) {
                return;
            }

            hasError = true;

            var eventFunc = listeners.onError;

            if (eventFunc) {
                eventFunc.call(parser, {
                    type: 'error',
                    code: errorCode,
                    message: message,
                    pos: pos,
                    endPos: parser.pos
                }, parser);
            }
        },

        notifyOpenTagName(tagInfo) {
            if (hasError) {
                return;
            }

            var eventFunc = listeners.onOpenTagName;

            if (eventFunc) {
                // set the literalValue property for attributes that are simple
                // string simple values or simple literal values

                var event = {
                    type: 'openTagName',
                    tagName: tagInfo.tagName,
                    tagNameExpression: tagInfo.tagNameExpression,
                    emptyTagName: tagInfo.emptyTagName,
                    pos: tagInfo.pos,
                    endPos: tagInfo.tagNameEndPos,
                    concise: tagInfo.concise
                };

                if (tagInfo.shorthandId) {
                    event.shorthandId = tagInfo.shorthandId;
                }

                if (tagInfo.shorthandClassNames) {
                    event.shorthandClassNames = tagInfo.shorthandClassNames;
                }

                event.setParseOptions = function(parseOptions) {
                    if (!parseOptions) {
                        return;
                    }
                    tagInfo.parseOptions = parseOptions;
                };

                eventFunc.call(parser, event, parser);
            }
        },

        notifyOpenTag(tagInfo) {
            if (hasError) {
                return;
            }

            var eventFunc = listeners.onOpenTag;

            if (eventFunc) {
                // set the literalValue property for attributes that are simple
                // string simple values or simple literal values

                var event = {
                    type: 'openTag',
                    tagName: tagInfo.tagName,
                    tagNameExpression: tagInfo.tagNameExpression,
                    emptyTagName: tagInfo.emptyTagName,
                    argument: tagInfo.argument,
                    params: tagInfo.params,
                    pos: tagInfo.pos,
                    endPos: tagInfo.endPos,
                    tagNameEndPos: tagInfo.tagNameEndPos,
                    openTagOnly: tagInfo.openTagOnly,
                    selfClosed: tagInfo.selfClosed,
                    concise: tagInfo.concise
                };

                if (tagInfo.shorthandId) {
                    event.shorthandId = tagInfo.shorthandId;
                }

                if (tagInfo.shorthandClassNames) {
                    event.shorthandClassNames = tagInfo.shorthandClassNames;
                }

                event.attributes = tagInfo.attributes.map((attr) => {
                    var newAttr = {
                        name: attr.name,
                        value: attr.value,
                        pos: attr.pos,
                        endPos: attr.endPos,
                        argument: attr.argument
                    };

                    if (attr.hasOwnProperty('literalValue')) {
                        newAttr.literalValue = attr.literalValue;
                    }

                    return newAttr;
                });

                event.setParseOptions = function(parseOptions) {
                    if (!parseOptions) {
                        return;
                    }
                    var newState = parseOptions.state;

                    if (newState) {
                        if (newState === 'parsed-text') {
                            parser.enterParsedTextContentState();
                        } else if (newState === 'static-text') {
                            parser.enterStaticTextContentState();
                        }
                    }

                    tagInfo.parseOptions = parseOptions;
                };

                eventFunc.call(parser, event, parser);
            }
        },

        notifyCloseTag(tagName, pos, endPos) {
            if (hasError) {
                return;
            }

            var eventFunc = listeners.onCloseTag;

            if (eventFunc) {
                var event = {
                    type: 'closeTag',
                    tagName: tagName,
                    pos: pos,
                    endPos: endPos
                };

                eventFunc.call(parser, event, parser);
            }
        },

        notifyDocumentType(documentType) {
            if (hasError) {
                return;
            }

            var eventFunc = listeners.onDocumentType;

            if (eventFunc) {
                eventFunc.call(this, {
                    type: 'documentType',
                    value: documentType.value,
                    pos: documentType.pos,
                    endPos: documentType.endPos
                }, parser);
            }
        },

        notifyDeclaration(declaration) {
            if (hasError) {
                return;
            }

            var eventFunc = listeners.onDeclaration;

            if (eventFunc) {
                eventFunc.call(parser, {
                    type: 'declaration',
                    value: declaration.value,
                    pos: declaration.pos,
                    endPos: declaration.endPos
                }, parser);
            }
        },

        notifyComment(comment) {
            if (hasError) {
                return;
            }

            var eventFunc = listeners.onComment;

            if (eventFunc && comment.value) {
                eventFunc.call(parser, {
                    type: 'comment',
                    value: comment.value,
                    pos: comment.pos,
                    endPos: comment.endPos
                }, parser);
            }
        },

        notifyScriptlet(scriptlet) {
            if (hasError) {
                return;
            }

            var eventFunc = listeners.onScriptlet;

            if (eventFunc && scriptlet.value) {
                eventFunc.call(parser, {
                    type: 'scriptlet',
                    tag: scriptlet.tag,
                    line: scriptlet.line,
                    block: scriptlet.block,
                    value: scriptlet.value,
                    pos: scriptlet.pos,
                    endPos: scriptlet.endPos
                }, parser);
            }
        },

        notifyPlaceholder(placeholder) {
            if (hasError) {
                return;
            }

            var eventFunc = listeners.onPlaceholder;
            if (eventFunc) {
                var placeholderEvent = {
                    type: 'placeholder',
                    value: placeholder.value,
                    pos: placeholder.pos,
                    endPos: placeholder.endPos,
                    escape: placeholder.escape !== false,
                    withinBody: placeholder.withinBody === true,
                    withinAttribute: placeholder.withinAttribute === true,
                    withinString: placeholder.withinString === true,
                    withinOpenTag: placeholder.withinOpenTag === true,
                    withinTagName: placeholder.withinTagName === true
                };

                eventFunc.call(parser, placeholderEvent, parser);
                return placeholderEvent.value;
            }

            return placeholder.value;
        },

        notifyString(string) {
            if (hasError) {
                return;
            }

            var eventFunc = listeners.onString;
            if (eventFunc) {
                var stringEvent = {
                    type: 'string',
                    value: string.value,
                    pos: string.pos,
                    endPos: string.endPos,
                    stringParts: string.stringParts,
                    isStringLiteral: string.isStringLiteral
                };

                eventFunc.call(parser, stringEvent, parser);
                return stringEvent.value;
            }

            return string.value;
        },

        notifyFinish() {
            if (listeners.onfinish) {
                listeners.onfinish.call(parser, {}, parser);
            }
        }
    };
};
},{}],17:[function(require,module,exports){
var operators = exports.operators = [
    //Multiplicative Operators
    '*', '/', '%',

    //Additive Operators
    '+', '-',

    //Bitwise Shift Operators
    '<<', '>>', '>>>',

    //Relational Operators
    '<', '<=', '>', '>=',

    // Readable Operators
    // NOTE: These become reserved words and cannot be used as attribute names
    'instanceof',
    'in',
    // 'from', -- as in <import x from './file'/>
    // 'typeof', -- would need to look behind, not ahead

    // Equality Operators
    '==', '!=', '===', '!==',

    // Binary Bitwise Operators
    '&', '^', '|',

    // Binary Logical Operators
    '&&', '||',

    // Ternary Operator
    '?', ':',

    // Member
    '['
];

var unary = [
    'typeof',
    'new',
    'void'
];

// Look for longest operators first
operators.sort(function(a, b) {
    return b.length - a.length;
});

exports.longest = operators.sort((a, b) => b.length-a.length)[0].length+1;
exports.patternNext = new RegExp('^\\s*('+operators.map(escapeOperator).join('|')+')\\s*(?!-)');
exports.patternPrev = new RegExp('[^-+](?:'+operators.concat(unary).map(escapeOperator).join('|')+')(\\s*)$');


function escapeOperator(o) {
    if(/^[A-Z]+$/i.test(o)) {
        return '\\b'+escapeNonAlphaNumeric(o)+'\\b';
    }
    if(o === '/') {
        return '\\/(?:\\b|\\s)'; //make sure this isn't a comment
    }
    return escapeNonAlphaNumeric(o);
}

function escapeNonAlphaNumeric(str) {
    return str.replace(/([^\w\d])/g, '\\$1');
}

},{}],18:[function(require,module,exports){
/*jshint node:true */
/* globals define */
/*
  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.

*/

'use strict';

/**
The following batches are equivalent:

var beautify_js = require('js-beautify');
var beautify_js = require('js-beautify').js;
var beautify_js = require('js-beautify').js_beautify;

var beautify_css = require('js-beautify').css;
var beautify_css = require('js-beautify').css_beautify;

var beautify_html = require('js-beautify').html;
var beautify_html = require('js-beautify').html_beautify;

All methods returned accept two arguments, the source string and an options object.
**/

function get_beautify(js_beautify, css_beautify, html_beautify) {
  // the default is js
  var beautify = function(src, config) {
    return js_beautify.js_beautify(src, config);
  };

  // short aliases
  beautify.js = js_beautify.js_beautify;
  beautify.css = css_beautify.css_beautify;
  beautify.html = html_beautify.html_beautify;

  // legacy aliases
  beautify.js_beautify = js_beautify.js_beautify;
  beautify.css_beautify = css_beautify.css_beautify;
  beautify.html_beautify = html_beautify.html_beautify;

  return beautify;
}

if (typeof define === "function" && define.amd) {
  // Add support for AMD ( https://github.com/amdjs/amdjs-api/wiki/AMD#defineamd-property- )
  define([
    "./lib/beautify",
    "./lib/beautify-css",
    "./lib/beautify-html"
  ], function(js_beautify, css_beautify, html_beautify) {
    return get_beautify(js_beautify, css_beautify, html_beautify);
  });
} else {
  (function(mod) {
    var beautifier = require('./src/index');
    beautifier.js_beautify = beautifier.js;
    beautifier.css_beautify = beautifier.css;
    beautifier.html_beautify = beautifier.html;

    mod.exports = get_beautify(beautifier, beautifier, beautifier);

  })(module);
}
},{"./src/index":36}],19:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

function Directives(start_block_pattern, end_block_pattern) {
  start_block_pattern = typeof start_block_pattern === 'string' ? start_block_pattern : start_block_pattern.source;
  end_block_pattern = typeof end_block_pattern === 'string' ? end_block_pattern : end_block_pattern.source;
  this.__directives_block_pattern = new RegExp(start_block_pattern + / beautify( \w+[:]\w+)+ /.source + end_block_pattern, 'g');
  this.__directive_pattern = / (\w+)[:](\w+)/g;

  this.__directives_end_ignore_pattern = new RegExp(start_block_pattern + /\sbeautify\signore:end\s/.source + end_block_pattern, 'g');
}

Directives.prototype.get_directives = function(text) {
  if (!text.match(this.__directives_block_pattern)) {
    return null;
  }

  var directives = {};
  this.__directive_pattern.lastIndex = 0;
  var directive_match = this.__directive_pattern.exec(text);

  while (directive_match) {
    directives[directive_match[1]] = directive_match[2];
    directive_match = this.__directive_pattern.exec(text);
  }

  return directives;
};

Directives.prototype.readIgnored = function(input) {
  return input.readUntilAfter(this.__directives_end_ignore_pattern);
};


module.exports.Directives = Directives;

},{}],20:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var regexp_has_sticky = RegExp.prototype.hasOwnProperty('sticky');

function InputScanner(input_string) {
  this.__input = input_string || '';
  this.__input_length = this.__input.length;
  this.__position = 0;
}

InputScanner.prototype.restart = function() {
  this.__position = 0;
};

InputScanner.prototype.back = function() {
  if (this.__position > 0) {
    this.__position -= 1;
  }
};

InputScanner.prototype.hasNext = function() {
  return this.__position < this.__input_length;
};

InputScanner.prototype.next = function() {
  var val = null;
  if (this.hasNext()) {
    val = this.__input.charAt(this.__position);
    this.__position += 1;
  }
  return val;
};

InputScanner.prototype.peek = function(index) {
  var val = null;
  index = index || 0;
  index += this.__position;
  if (index >= 0 && index < this.__input_length) {
    val = this.__input.charAt(index);
  }
  return val;
};

// This is a JavaScript only helper function (not in python)
// Javascript doesn't have a match method
// and not all implementation support "sticky" flag.
// If they do not support sticky then both this.match() and this.test() method
// must get the match and check the index of the match.
// If sticky is supported and set, this method will use it.
// Otherwise it will check that global is set, and fall back to the slower method.
InputScanner.prototype.__match = function(pattern, index) {
  pattern.lastIndex = index;
  var pattern_match = pattern.exec(this.__input);

  if (pattern_match && !(regexp_has_sticky && pattern.sticky)) {
    if (pattern_match.index !== index) {
      pattern_match = null;
    }
  }

  return pattern_match;
};

InputScanner.prototype.test = function(pattern, index) {
  index = index || 0;
  index += this.__position;

  if (index >= 0 && index < this.__input_length) {
    return !!this.__match(pattern, index);
  } else {
    return false;
  }
};

InputScanner.prototype.testChar = function(pattern, index) {
  // test one character regex match
  var val = this.peek(index);
  pattern.lastIndex = 0;
  return val !== null && pattern.test(val);
};

InputScanner.prototype.match = function(pattern) {
  var pattern_match = this.__match(pattern, this.__position);
  if (pattern_match) {
    this.__position += pattern_match[0].length;
  } else {
    pattern_match = null;
  }
  return pattern_match;
};

InputScanner.prototype.read = function(starting_pattern, until_pattern, until_after) {
  var val = '';
  var match;
  if (starting_pattern) {
    match = this.match(starting_pattern);
    if (match) {
      val += match[0];
    }
  }
  if (until_pattern && (match || !starting_pattern)) {
    val += this.readUntil(until_pattern, until_after);
  }
  return val;
};

InputScanner.prototype.readUntil = function(pattern, until_after) {
  var val = '';
  var match_index = this.__position;
  pattern.lastIndex = this.__position;
  var pattern_match = pattern.exec(this.__input);
  if (pattern_match) {
    match_index = pattern_match.index;
    if (until_after) {
      match_index += pattern_match[0].length;
    }
  } else {
    match_index = this.__input_length;
  }

  val = this.__input.substring(this.__position, match_index);
  this.__position = match_index;
  return val;
};

InputScanner.prototype.readUntilAfter = function(pattern) {
  return this.readUntil(pattern, true);
};

InputScanner.prototype.get_regexp = function(pattern, match_from) {
  var result = null;
  var flags = 'g';
  if (match_from && regexp_has_sticky) {
    flags = 'y';
  }
  // strings are converted to regexp
  if (typeof pattern === "string" && pattern !== '') {
    // result = new RegExp(pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), flags);
    result = new RegExp(pattern, flags);
  } else if (pattern) {
    result = new RegExp(pattern.source, flags);
  }
  return result;
};

InputScanner.prototype.get_literal_regexp = function(literal_string) {
  return RegExp(literal_string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
};

/* css beautifier legacy helpers */
InputScanner.prototype.peekUntilAfter = function(pattern) {
  var start = this.__position;
  var val = this.readUntilAfter(pattern);
  this.__position = start;
  return val;
};

InputScanner.prototype.lookBack = function(testVal) {
  var start = this.__position - 1;
  return start >= testVal.length && this.__input.substring(start - testVal.length, start)
    .toLowerCase() === testVal;
};

module.exports.InputScanner = InputScanner;

},{}],21:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

function Options(options, merge_child_field) {
  this.raw_options = _mergeOpts(options, merge_child_field);

  // Support passing the source text back with no change
  this.disabled = this._get_boolean('disabled');

  this.eol = this._get_characters('eol', 'auto');
  this.end_with_newline = this._get_boolean('end_with_newline');
  this.indent_size = this._get_number('indent_size', 4);
  this.indent_char = this._get_characters('indent_char', ' ');
  this.indent_level = this._get_number('indent_level');

  this.preserve_newlines = this._get_boolean('preserve_newlines', true);
  this.max_preserve_newlines = this._get_number('max_preserve_newlines', 32786);
  if (!this.preserve_newlines) {
    this.max_preserve_newlines = 0;
  }

  this.indent_with_tabs = this._get_boolean('indent_with_tabs', this.indent_char === '\t');
  if (this.indent_with_tabs) {
    this.indent_char = '\t';

    // indent_size behavior changed after 1.8.6
    // It used to be that indent_size would be
    // set to 1 for indent_with_tabs. That is no longer needed and
    // actually doesn't make sense - why not use spaces? Further,
    // that might produce unexpected behavior - tabs being used
    // for single-column alignment. So, when indent_with_tabs is true
    // and indent_size is 1, reset indent_size to 4.
    if (this.indent_size === 1) {
      this.indent_size = 4;
    }
  }

  // Backwards compat with 1.3.x
  this.wrap_line_length = this._get_number('wrap_line_length', this._get_number('max_char'));

  this.indent_empty_lines = this._get_boolean('indent_empty_lines');

  // valid templating languages ['django', 'erb', 'handlebars', 'php']
  // For now, 'auto' = all off for javascript, all on for html (and inline javascript).
  // other values ignored
  this.templating = this._get_selection_list('templating', ['auto', 'none', 'django', 'erb', 'handlebars', 'php'], ['auto']);
}

Options.prototype._get_array = function(name, default_value) {
  var option_value = this.raw_options[name];
  var result = default_value || [];
  if (typeof option_value === 'object') {
    if (option_value !== null && typeof option_value.concat === 'function') {
      result = option_value.concat();
    }
  } else if (typeof option_value === 'string') {
    result = option_value.split(/[^a-zA-Z0-9_\/\-]+/);
  }
  return result;
};

Options.prototype._get_boolean = function(name, default_value) {
  var option_value = this.raw_options[name];
  var result = option_value === undefined ? !!default_value : !!option_value;
  return result;
};

Options.prototype._get_characters = function(name, default_value) {
  var option_value = this.raw_options[name];
  var result = default_value || '';
  if (typeof option_value === 'string') {
    result = option_value.replace(/\\r/, '\r').replace(/\\n/, '\n').replace(/\\t/, '\t');
  }
  return result;
};

Options.prototype._get_number = function(name, default_value) {
  var option_value = this.raw_options[name];
  default_value = parseInt(default_value, 10);
  if (isNaN(default_value)) {
    default_value = 0;
  }
  var result = parseInt(option_value, 10);
  if (isNaN(result)) {
    result = default_value;
  }
  return result;
};

Options.prototype._get_selection = function(name, selection_list, default_value) {
  var result = this._get_selection_list(name, selection_list, default_value);
  if (result.length !== 1) {
    throw new Error(
      "Invalid Option Value: The option '" + name + "' can only be one of the following values:\n" +
      selection_list + "\nYou passed in: '" + this.raw_options[name] + "'");
  }

  return result[0];
};


Options.prototype._get_selection_list = function(name, selection_list, default_value) {
  if (!selection_list || selection_list.length === 0) {
    throw new Error("Selection list cannot be empty.");
  }

  default_value = default_value || [selection_list[0]];
  if (!this._is_valid_selection(default_value, selection_list)) {
    throw new Error("Invalid Default Value!");
  }

  var result = this._get_array(name, default_value);
  if (!this._is_valid_selection(result, selection_list)) {
    throw new Error(
      "Invalid Option Value: The option '" + name + "' can contain only the following values:\n" +
      selection_list + "\nYou passed in: '" + this.raw_options[name] + "'");
  }

  return result;
};

Options.prototype._is_valid_selection = function(result, selection_list) {
  return result.length && selection_list.length &&
    !result.some(function(item) { return selection_list.indexOf(item) === -1; });
};


// merges child options up with the parent options object
// Example: obj = {a: 1, b: {a: 2}}
//          mergeOpts(obj, 'b')
//
//          Returns: {a: 2}
function _mergeOpts(allOptions, childFieldName) {
  var finalOpts = {};
  allOptions = _normalizeOpts(allOptions);
  var name;

  for (name in allOptions) {
    if (name !== childFieldName) {
      finalOpts[name] = allOptions[name];
    }
  }

  //merge in the per type settings for the childFieldName
  if (childFieldName && allOptions[childFieldName]) {
    for (name in allOptions[childFieldName]) {
      finalOpts[name] = allOptions[childFieldName][name];
    }
  }
  return finalOpts;
}

function _normalizeOpts(options) {
  var convertedOpts = {};
  var key;

  for (key in options) {
    var newKey = key.replace(/-/g, "_");
    convertedOpts[newKey] = options[key];
  }
  return convertedOpts;
}

module.exports.Options = Options;
module.exports.normalizeOpts = _normalizeOpts;
module.exports.mergeOpts = _mergeOpts;

},{}],22:[function(require,module,exports){
/*jshint node:true */
/*
  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

function OutputLine(parent) {
  this.__parent = parent;
  this.__character_count = 0;
  // use indent_count as a marker for this.__lines that have preserved indentation
  this.__indent_count = -1;
  this.__alignment_count = 0;
  this.__wrap_point_index = 0;
  this.__wrap_point_character_count = 0;
  this.__wrap_point_indent_count = -1;
  this.__wrap_point_alignment_count = 0;

  this.__items = [];
}

OutputLine.prototype.clone_empty = function() {
  var line = new OutputLine(this.__parent);
  line.set_indent(this.__indent_count, this.__alignment_count);
  return line;
};

OutputLine.prototype.item = function(index) {
  if (index < 0) {
    return this.__items[this.__items.length + index];
  } else {
    return this.__items[index];
  }
};

OutputLine.prototype.has_match = function(pattern) {
  for (var lastCheckedOutput = this.__items.length - 1; lastCheckedOutput >= 0; lastCheckedOutput--) {
    if (this.__items[lastCheckedOutput].match(pattern)) {
      return true;
    }
  }
  return false;
};

OutputLine.prototype.set_indent = function(indent, alignment) {
  if (this.is_empty()) {
    this.__indent_count = indent || 0;
    this.__alignment_count = alignment || 0;
    this.__character_count = this.__parent.get_indent_size(this.__indent_count, this.__alignment_count);
  }
};

OutputLine.prototype._set_wrap_point = function() {
  if (this.__parent.wrap_line_length) {
    this.__wrap_point_index = this.__items.length;
    this.__wrap_point_character_count = this.__character_count;
    this.__wrap_point_indent_count = this.__parent.next_line.__indent_count;
    this.__wrap_point_alignment_count = this.__parent.next_line.__alignment_count;
  }
};

OutputLine.prototype._should_wrap = function() {
  return this.__wrap_point_index &&
    this.__character_count > this.__parent.wrap_line_length &&
    this.__wrap_point_character_count > this.__parent.next_line.__character_count;
};

OutputLine.prototype._allow_wrap = function() {
  if (this._should_wrap()) {
    this.__parent.add_new_line();
    var next = this.__parent.current_line;
    next.set_indent(this.__wrap_point_indent_count, this.__wrap_point_alignment_count);
    next.__items = this.__items.slice(this.__wrap_point_index);
    this.__items = this.__items.slice(0, this.__wrap_point_index);

    next.__character_count += this.__character_count - this.__wrap_point_character_count;
    this.__character_count = this.__wrap_point_character_count;

    if (next.__items[0] === " ") {
      next.__items.splice(0, 1);
      next.__character_count -= 1;
    }
    return true;
  }
  return false;
};

OutputLine.prototype.is_empty = function() {
  return this.__items.length === 0;
};

OutputLine.prototype.last = function() {
  if (!this.is_empty()) {
    return this.__items[this.__items.length - 1];
  } else {
    return null;
  }
};

OutputLine.prototype.push = function(item) {
  this.__items.push(item);
  var last_newline_index = item.lastIndexOf('\n');
  if (last_newline_index !== -1) {
    this.__character_count = item.length - last_newline_index;
  } else {
    this.__character_count += item.length;
  }
};

OutputLine.prototype.pop = function() {
  var item = null;
  if (!this.is_empty()) {
    item = this.__items.pop();
    this.__character_count -= item.length;
  }
  return item;
};


OutputLine.prototype._remove_indent = function() {
  if (this.__indent_count > 0) {
    this.__indent_count -= 1;
    this.__character_count -= this.__parent.indent_size;
  }
};

OutputLine.prototype._remove_wrap_indent = function() {
  if (this.__wrap_point_indent_count > 0) {
    this.__wrap_point_indent_count -= 1;
  }
};
OutputLine.prototype.trim = function() {
  while (this.last() === ' ') {
    this.__items.pop();
    this.__character_count -= 1;
  }
};

OutputLine.prototype.toString = function() {
  var result = '';
  if (this.is_empty()) {
    if (this.__parent.indent_empty_lines) {
      result = this.__parent.get_indent_string(this.__indent_count);
    }
  } else {
    result = this.__parent.get_indent_string(this.__indent_count, this.__alignment_count);
    result += this.__items.join('');
  }
  return result;
};

function IndentStringCache(options, baseIndentString) {
  this.__cache = [''];
  this.__indent_size = options.indent_size;
  this.__indent_string = options.indent_char;
  if (!options.indent_with_tabs) {
    this.__indent_string = new Array(options.indent_size + 1).join(options.indent_char);
  }

  // Set to null to continue support for auto detection of base indent
  baseIndentString = baseIndentString || '';
  if (options.indent_level > 0) {
    baseIndentString = new Array(options.indent_level + 1).join(this.__indent_string);
  }

  this.__base_string = baseIndentString;
  this.__base_string_length = baseIndentString.length;
}

IndentStringCache.prototype.get_indent_size = function(indent, column) {
  var result = this.__base_string_length;
  column = column || 0;
  if (indent < 0) {
    result = 0;
  }
  result += indent * this.__indent_size;
  result += column;
  return result;
};

IndentStringCache.prototype.get_indent_string = function(indent_level, column) {
  var result = this.__base_string;
  column = column || 0;
  if (indent_level < 0) {
    indent_level = 0;
    result = '';
  }
  column += indent_level * this.__indent_size;
  this.__ensure_cache(column);
  result += this.__cache[column];
  return result;
};

IndentStringCache.prototype.__ensure_cache = function(column) {
  while (column >= this.__cache.length) {
    this.__add_column();
  }
};

IndentStringCache.prototype.__add_column = function() {
  var column = this.__cache.length;
  var indent = 0;
  var result = '';
  if (this.__indent_size && column >= this.__indent_size) {
    indent = Math.floor(column / this.__indent_size);
    column -= indent * this.__indent_size;
    result = new Array(indent + 1).join(this.__indent_string);
  }
  if (column) {
    result += new Array(column + 1).join(' ');
  }

  this.__cache.push(result);
};

function Output(options, baseIndentString) {
  this.__indent_cache = new IndentStringCache(options, baseIndentString);
  this.raw = false;
  this._end_with_newline = options.end_with_newline;
  this.indent_size = options.indent_size;
  this.wrap_line_length = options.wrap_line_length;
  this.indent_empty_lines = options.indent_empty_lines;
  this.__lines = [];
  this.previous_line = null;
  this.current_line = null;
  this.next_line = new OutputLine(this);
  this.space_before_token = false;
  this.non_breaking_space = false;
  this.previous_token_wrapped = false;
  // initialize
  this.__add_outputline();
}

Output.prototype.__add_outputline = function() {
  this.previous_line = this.current_line;
  this.current_line = this.next_line.clone_empty();
  this.__lines.push(this.current_line);
};

Output.prototype.get_line_number = function() {
  return this.__lines.length;
};

Output.prototype.get_indent_string = function(indent, column) {
  return this.__indent_cache.get_indent_string(indent, column);
};

Output.prototype.get_indent_size = function(indent, column) {
  return this.__indent_cache.get_indent_size(indent, column);
};

Output.prototype.is_empty = function() {
  return !this.previous_line && this.current_line.is_empty();
};

Output.prototype.add_new_line = function(force_newline) {
  // never newline at the start of file
  // otherwise, newline only if we didn't just add one or we're forced
  if (this.is_empty() ||
    (!force_newline && this.just_added_newline())) {
    return false;
  }

  // if raw output is enabled, don't print additional newlines,
  // but still return True as though you had
  if (!this.raw) {
    this.__add_outputline();
  }
  return true;
};

Output.prototype.get_code = function(eol) {
  this.trim(true);

  // handle some edge cases where the last tokens
  // has text that ends with newline(s)
  var last_item = this.current_line.pop();
  if (last_item) {
    if (last_item[last_item.length - 1] === '\n') {
      last_item = last_item.replace(/\n+$/g, '');
    }
    this.current_line.push(last_item);
  }

  if (this._end_with_newline) {
    this.__add_outputline();
  }

  var sweet_code = this.__lines.join('\n');

  if (eol !== '\n') {
    sweet_code = sweet_code.replace(/[\n]/g, eol);
  }
  return sweet_code;
};

Output.prototype.set_wrap_point = function() {
  this.current_line._set_wrap_point();
};

Output.prototype.set_indent = function(indent, alignment) {
  indent = indent || 0;
  alignment = alignment || 0;

  // Next line stores alignment values
  this.next_line.set_indent(indent, alignment);

  // Never indent your first output indent at the start of the file
  if (this.__lines.length > 1) {
    this.current_line.set_indent(indent, alignment);
    return true;
  }

  this.current_line.set_indent();
  return false;
};

Output.prototype.add_raw_token = function(token) {
  for (var x = 0; x < token.newlines; x++) {
    this.__add_outputline();
  }
  this.current_line.set_indent(-1);
  this.current_line.push(token.whitespace_before);
  this.current_line.push(token.text);
  this.space_before_token = false;
  this.non_breaking_space = false;
  this.previous_token_wrapped = false;
};

Output.prototype.add_token = function(printable_token) {
  this.__add_space_before_token();
  this.current_line.push(printable_token);
  this.space_before_token = false;
  this.non_breaking_space = false;
  this.previous_token_wrapped = this.current_line._allow_wrap();
};

Output.prototype.__add_space_before_token = function() {
  if (this.space_before_token && !this.just_added_newline()) {
    if (!this.non_breaking_space) {
      this.set_wrap_point();
    }
    this.current_line.push(' ');
  }
};

Output.prototype.remove_indent = function(index) {
  var output_length = this.__lines.length;
  while (index < output_length) {
    this.__lines[index]._remove_indent();
    index++;
  }
  this.current_line._remove_wrap_indent();
};

Output.prototype.trim = function(eat_newlines) {
  eat_newlines = (eat_newlines === undefined) ? false : eat_newlines;

  this.current_line.trim();

  while (eat_newlines && this.__lines.length > 1 &&
    this.current_line.is_empty()) {
    this.__lines.pop();
    this.current_line = this.__lines[this.__lines.length - 1];
    this.current_line.trim();
  }

  this.previous_line = this.__lines.length > 1 ?
    this.__lines[this.__lines.length - 2] : null;
};

Output.prototype.just_added_newline = function() {
  return this.current_line.is_empty();
};

Output.prototype.just_added_blankline = function() {
  return this.is_empty() ||
    (this.current_line.is_empty() && this.previous_line.is_empty());
};

Output.prototype.ensure_empty_line_above = function(starts_with, ends_with) {
  var index = this.__lines.length - 2;
  while (index >= 0) {
    var potentialEmptyLine = this.__lines[index];
    if (potentialEmptyLine.is_empty()) {
      break;
    } else if (potentialEmptyLine.item(0).indexOf(starts_with) !== 0 &&
      potentialEmptyLine.item(-1) !== ends_with) {
      this.__lines.splice(index + 1, 0, new OutputLine(this));
      this.previous_line = this.__lines[this.__lines.length - 2];
      break;
    }
    index--;
  }
};

module.exports.Output = Output;

},{}],23:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

function Pattern(input_scanner, parent) {
  this._input = input_scanner;
  this._starting_pattern = null;
  this._match_pattern = null;
  this._until_pattern = null;
  this._until_after = false;

  if (parent) {
    this._starting_pattern = this._input.get_regexp(parent._starting_pattern, true);
    this._match_pattern = this._input.get_regexp(parent._match_pattern, true);
    this._until_pattern = this._input.get_regexp(parent._until_pattern);
    this._until_after = parent._until_after;
  }
}

Pattern.prototype.read = function() {
  var result = this._input.read(this._starting_pattern);
  if (!this._starting_pattern || result) {
    result += this._input.read(this._match_pattern, this._until_pattern, this._until_after);
  }
  return result;
};

Pattern.prototype.read_match = function() {
  return this._input.match(this._match_pattern);
};

Pattern.prototype.until_after = function(pattern) {
  var result = this._create();
  result._until_after = true;
  result._until_pattern = this._input.get_regexp(pattern);
  result._update();
  return result;
};

Pattern.prototype.until = function(pattern) {
  var result = this._create();
  result._until_after = false;
  result._until_pattern = this._input.get_regexp(pattern);
  result._update();
  return result;
};

Pattern.prototype.starting_with = function(pattern) {
  var result = this._create();
  result._starting_pattern = this._input.get_regexp(pattern, true);
  result._update();
  return result;
};

Pattern.prototype.matching = function(pattern) {
  var result = this._create();
  result._match_pattern = this._input.get_regexp(pattern, true);
  result._update();
  return result;
};

Pattern.prototype._create = function() {
  return new Pattern(this._input, this);
};

Pattern.prototype._update = function() {};

module.exports.Pattern = Pattern;

},{}],24:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var Pattern = require('./pattern').Pattern;


var template_names = {
  django: false,
  erb: false,
  handlebars: false,
  php: false
};

// This lets templates appear anywhere we would do a readUntil
// The cost is higher but it is pay to play.
function TemplatablePattern(input_scanner, parent) {
  Pattern.call(this, input_scanner, parent);
  this.__template_pattern = null;
  this._disabled = Object.assign({}, template_names);
  this._excluded = Object.assign({}, template_names);

  if (parent) {
    this.__template_pattern = this._input.get_regexp(parent.__template_pattern);
    this._excluded = Object.assign(this._excluded, parent._excluded);
    this._disabled = Object.assign(this._disabled, parent._disabled);
  }
  var pattern = new Pattern(input_scanner);
  this.__patterns = {
    handlebars_comment: pattern.starting_with(/{{!--/).until_after(/--}}/),
    handlebars_unescaped: pattern.starting_with(/{{{/).until_after(/}}}/),
    handlebars: pattern.starting_with(/{{/).until_after(/}}/),
    php: pattern.starting_with(/<\?(?:[=]|php)/).until_after(/\?>/),
    erb: pattern.starting_with(/<%[^%]/).until_after(/[^%]%>/),
    // django coflicts with handlebars a bit.
    django: pattern.starting_with(/{%/).until_after(/%}/),
    django_value: pattern.starting_with(/{{/).until_after(/}}/),
    django_comment: pattern.starting_with(/{#/).until_after(/#}/)
  };
}
TemplatablePattern.prototype = new Pattern();

TemplatablePattern.prototype._create = function() {
  return new TemplatablePattern(this._input, this);
};

TemplatablePattern.prototype._update = function() {
  this.__set_templated_pattern();
};

TemplatablePattern.prototype.disable = function(language) {
  var result = this._create();
  result._disabled[language] = true;
  result._update();
  return result;
};

TemplatablePattern.prototype.read_options = function(options) {
  var result = this._create();
  for (var language in template_names) {
    result._disabled[language] = options.templating.indexOf(language) === -1;
  }
  result._update();
  return result;
};

TemplatablePattern.prototype.exclude = function(language) {
  var result = this._create();
  result._excluded[language] = true;
  result._update();
  return result;
};

TemplatablePattern.prototype.read = function() {
  var result = '';
  if (this._match_pattern) {
    result = this._input.read(this._starting_pattern);
  } else {
    result = this._input.read(this._starting_pattern, this.__template_pattern);
  }
  var next = this._read_template();
  while (next) {
    if (this._match_pattern) {
      next += this._input.read(this._match_pattern);
    } else {
      next += this._input.readUntil(this.__template_pattern);
    }
    result += next;
    next = this._read_template();
  }

  if (this._until_after) {
    result += this._input.readUntilAfter(this._until_pattern);
  }
  return result;
};

TemplatablePattern.prototype.__set_templated_pattern = function() {
  var items = [];

  if (!this._disabled.php) {
    items.push(this.__patterns.php._starting_pattern.source);
  }
  if (!this._disabled.handlebars) {
    items.push(this.__patterns.handlebars._starting_pattern.source);
  }
  if (!this._disabled.erb) {
    items.push(this.__patterns.erb._starting_pattern.source);
  }
  if (!this._disabled.django) {
    items.push(this.__patterns.django._starting_pattern.source);
    items.push(this.__patterns.django_value._starting_pattern.source);
    items.push(this.__patterns.django_comment._starting_pattern.source);
  }

  if (this._until_pattern) {
    items.push(this._until_pattern.source);
  }
  this.__template_pattern = this._input.get_regexp('(?:' + items.join('|') + ')');
};

TemplatablePattern.prototype._read_template = function() {
  var resulting_string = '';
  var c = this._input.peek();
  if (c === '<') {
    var peek1 = this._input.peek(1);
    //if we're in a comment, do something special
    // We treat all comments as literals, even more than preformatted tags
    // we just look for the appropriate close tag
    if (!this._disabled.php && !this._excluded.php && peek1 === '?') {
      resulting_string = resulting_string ||
        this.__patterns.php.read();
    }
    if (!this._disabled.erb && !this._excluded.erb && peek1 === '%') {
      resulting_string = resulting_string ||
        this.__patterns.erb.read();
    }
  } else if (c === '{') {
    if (!this._disabled.handlebars && !this._excluded.handlebars) {
      resulting_string = resulting_string ||
        this.__patterns.handlebars_comment.read();
      resulting_string = resulting_string ||
        this.__patterns.handlebars_unescaped.read();
      resulting_string = resulting_string ||
        this.__patterns.handlebars.read();
    }
    if (!this._disabled.django) {
      // django coflicts with handlebars a bit.
      if (!this._excluded.django && !this._excluded.handlebars) {
        resulting_string = resulting_string ||
          this.__patterns.django_value.read();
      }
      if (!this._excluded.django) {
        resulting_string = resulting_string ||
          this.__patterns.django_comment.read();
        resulting_string = resulting_string ||
          this.__patterns.django.read();
      }
    }
  }
  return resulting_string;
};


module.exports.TemplatablePattern = TemplatablePattern;

},{"./pattern":23}],25:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

function Token(type, text, newlines, whitespace_before) {
  this.type = type;
  this.text = text;

  // comments_before are
  // comments that have a new line before them
  // and may or may not have a newline after
  // this is a set of comments before
  this.comments_before = null; /* inline comment*/


  // this.comments_after =  new TokenStream(); // no new line before and newline after
  this.newlines = newlines || 0;
  this.whitespace_before = whitespace_before || '';
  this.parent = null;
  this.next = null;
  this.previous = null;
  this.opened = null;
  this.closed = null;
  this.directives = null;
}


module.exports.Token = Token;

},{}],26:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var InputScanner = require('../core/inputscanner').InputScanner;
var Token = require('../core/token').Token;
var TokenStream = require('../core/tokenstream').TokenStream;
var WhitespacePattern = require('./whitespacepattern').WhitespacePattern;

var TOKEN = {
  START: 'TK_START',
  RAW: 'TK_RAW',
  EOF: 'TK_EOF'
};

var Tokenizer = function(input_string, options) {
  this._input = new InputScanner(input_string);
  this._options = options || {};
  this.__tokens = null;

  this._patterns = {};
  this._patterns.whitespace = new WhitespacePattern(this._input);
};

Tokenizer.prototype.tokenize = function() {
  this._input.restart();
  this.__tokens = new TokenStream();

  this._reset();

  var current;
  var previous = new Token(TOKEN.START, '');
  var open_token = null;
  var open_stack = [];
  var comments = new TokenStream();

  while (previous.type !== TOKEN.EOF) {
    current = this._get_next_token(previous, open_token);
    while (this._is_comment(current)) {
      comments.add(current);
      current = this._get_next_token(previous, open_token);
    }

    if (!comments.isEmpty()) {
      current.comments_before = comments;
      comments = new TokenStream();
    }

    current.parent = open_token;

    if (this._is_opening(current)) {
      open_stack.push(open_token);
      open_token = current;
    } else if (open_token && this._is_closing(current, open_token)) {
      current.opened = open_token;
      open_token.closed = current;
      open_token = open_stack.pop();
      current.parent = open_token;
    }

    current.previous = previous;
    previous.next = current;

    this.__tokens.add(current);
    previous = current;
  }

  return this.__tokens;
};


Tokenizer.prototype._is_first_token = function() {
  return this.__tokens.isEmpty();
};

Tokenizer.prototype._reset = function() {};

Tokenizer.prototype._get_next_token = function(previous_token, open_token) { // jshint unused:false
  this._readWhitespace();
  var resulting_string = this._input.read(/.+/g);
  if (resulting_string) {
    return this._create_token(TOKEN.RAW, resulting_string);
  } else {
    return this._create_token(TOKEN.EOF, '');
  }
};

Tokenizer.prototype._is_comment = function(current_token) { // jshint unused:false
  return false;
};

Tokenizer.prototype._is_opening = function(current_token) { // jshint unused:false
  return false;
};

Tokenizer.prototype._is_closing = function(current_token, open_token) { // jshint unused:false
  return false;
};

Tokenizer.prototype._create_token = function(type, text) {
  var token = new Token(type, text,
    this._patterns.whitespace.newline_count,
    this._patterns.whitespace.whitespace_before_token);
  return token;
};

Tokenizer.prototype._readWhitespace = function() {
  return this._patterns.whitespace.read();
};



module.exports.Tokenizer = Tokenizer;
module.exports.TOKEN = TOKEN;

},{"../core/inputscanner":20,"../core/token":25,"../core/tokenstream":27,"./whitespacepattern":28}],27:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

function TokenStream(parent_token) {
  // private
  this.__tokens = [];
  this.__tokens_length = this.__tokens.length;
  this.__position = 0;
  this.__parent_token = parent_token;
}

TokenStream.prototype.restart = function() {
  this.__position = 0;
};

TokenStream.prototype.isEmpty = function() {
  return this.__tokens_length === 0;
};

TokenStream.prototype.hasNext = function() {
  return this.__position < this.__tokens_length;
};

TokenStream.prototype.next = function() {
  var val = null;
  if (this.hasNext()) {
    val = this.__tokens[this.__position];
    this.__position += 1;
  }
  return val;
};

TokenStream.prototype.peek = function(index) {
  var val = null;
  index = index || 0;
  index += this.__position;
  if (index >= 0 && index < this.__tokens_length) {
    val = this.__tokens[index];
  }
  return val;
};

TokenStream.prototype.add = function(token) {
  if (this.__parent_token) {
    token.parent = this.__parent_token;
  }
  this.__tokens.push(token);
  this.__tokens_length += 1;
};

module.exports.TokenStream = TokenStream;

},{}],28:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var Pattern = require('../core/pattern').Pattern;

function WhitespacePattern(input_scanner, parent) {
  Pattern.call(this, input_scanner, parent);
  if (parent) {
    this._line_regexp = this._input.get_regexp(parent._line_regexp);
  } else {
    this.__set_whitespace_patterns('', '');
  }

  this.newline_count = 0;
  this.whitespace_before_token = '';
}
WhitespacePattern.prototype = new Pattern();

WhitespacePattern.prototype.__set_whitespace_patterns = function(whitespace_chars, newline_chars) {
  whitespace_chars += '\\t ';
  newline_chars += '\\n\\r';

  this._match_pattern = this._input.get_regexp(
    '[' + whitespace_chars + newline_chars + ']+', true);
  this._newline_regexp = this._input.get_regexp(
    '\\r\\n|[' + newline_chars + ']');
};

WhitespacePattern.prototype.read = function() {
  this.newline_count = 0;
  this.whitespace_before_token = '';

  var resulting_string = this._input.read(this._match_pattern);
  if (resulting_string === ' ') {
    this.whitespace_before_token = ' ';
  } else if (resulting_string) {
    var matches = this.__split(this._newline_regexp, resulting_string);
    this.newline_count = matches.length - 1;
    this.whitespace_before_token = matches[this.newline_count];
  }

  return resulting_string;
};

WhitespacePattern.prototype.matching = function(whitespace_chars, newline_chars) {
  var result = this._create();
  result.__set_whitespace_patterns(whitespace_chars, newline_chars);
  result._update();
  return result;
};

WhitespacePattern.prototype._create = function() {
  return new WhitespacePattern(this._input, this);
};

WhitespacePattern.prototype.__split = function(regexp, input_string) {
  regexp.lastIndex = 0;
  var start_index = 0;
  var result = [];
  var next_match = regexp.exec(input_string);
  while (next_match) {
    result.push(input_string.substring(start_index, next_match.index));
    start_index = next_match.index + next_match[0].length;
    next_match = regexp.exec(input_string);
  }

  if (start_index < input_string.length) {
    result.push(input_string.substring(start_index, input_string.length));
  } else {
    result.push('');
  }

  return result;
};



module.exports.WhitespacePattern = WhitespacePattern;

},{"../core/pattern":23}],29:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var Options = require('./options').Options;
var Output = require('../core/output').Output;
var InputScanner = require('../core/inputscanner').InputScanner;
var Directives = require('../core/directives').Directives;

var directives_core = new Directives(/\/\*/, /\*\//);

var lineBreak = /\r\n|[\r\n]/;
var allLineBreaks = /\r\n|[\r\n]/g;

// tokenizer
var whitespaceChar = /\s/;
var whitespacePattern = /(?:\s|\n)+/g;
var block_comment_pattern = /\/\*(?:[\s\S]*?)((?:\*\/)|$)/g;
var comment_pattern = /\/\/(?:[^\n\r\u2028\u2029]*)/g;

function Beautifier(source_text, options) {
  this._source_text = source_text || '';
  // Allow the setting of language/file-type specific options
  // with inheritance of overall settings
  this._options = new Options(options);
  this._ch = null;
  this._input = null;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule
  this.NESTED_AT_RULE = {
    "@page": true,
    "@font-face": true,
    "@keyframes": true,
    // also in CONDITIONAL_GROUP_RULE below
    "@media": true,
    "@supports": true,
    "@document": true
  };
  this.CONDITIONAL_GROUP_RULE = {
    "@media": true,
    "@supports": true,
    "@document": true
  };

}

Beautifier.prototype.eatString = function(endChars) {
  var result = '';
  this._ch = this._input.next();
  while (this._ch) {
    result += this._ch;
    if (this._ch === "\\") {
      result += this._input.next();
    } else if (endChars.indexOf(this._ch) !== -1 || this._ch === "\n") {
      break;
    }
    this._ch = this._input.next();
  }
  return result;
};

// Skips any white space in the source text from the current position.
// When allowAtLeastOneNewLine is true, will output new lines for each
// newline character found; if the user has preserve_newlines off, only
// the first newline will be output
Beautifier.prototype.eatWhitespace = function(allowAtLeastOneNewLine) {
  var result = whitespaceChar.test(this._input.peek());
  var isFirstNewLine = true;

  while (whitespaceChar.test(this._input.peek())) {
    this._ch = this._input.next();
    if (allowAtLeastOneNewLine && this._ch === '\n') {
      if (this._options.preserve_newlines || isFirstNewLine) {
        isFirstNewLine = false;
        this._output.add_new_line(true);
      }
    }
  }
  return result;
};

// Nested pseudo-class if we are insideRule
// and the next special character found opens
// a new block
Beautifier.prototype.foundNestedPseudoClass = function() {
  var openParen = 0;
  var i = 1;
  var ch = this._input.peek(i);
  while (ch) {
    if (ch === "{") {
      return true;
    } else if (ch === '(') {
      // pseudoclasses can contain ()
      openParen += 1;
    } else if (ch === ')') {
      if (openParen === 0) {
        return false;
      }
      openParen -= 1;
    } else if (ch === ";" || ch === "}") {
      return false;
    }
    i++;
    ch = this._input.peek(i);
  }
  return false;
};

Beautifier.prototype.print_string = function(output_string) {
  this._output.set_indent(this._indentLevel);
  this._output.non_breaking_space = true;
  this._output.add_token(output_string);
};

Beautifier.prototype.preserveSingleSpace = function(isAfterSpace) {
  if (isAfterSpace) {
    this._output.space_before_token = true;
  }
};

Beautifier.prototype.indent = function() {
  this._indentLevel++;
};

Beautifier.prototype.outdent = function() {
  if (this._indentLevel > 0) {
    this._indentLevel--;
  }
};

/*_____________________--------------------_____________________*/

Beautifier.prototype.beautify = function() {
  if (this._options.disabled) {
    return this._source_text;
  }

  var source_text = this._source_text;
  var eol = this._options.eol;
  if (eol === 'auto') {
    eol = '\n';
    if (source_text && lineBreak.test(source_text || '')) {
      eol = source_text.match(lineBreak)[0];
    }
  }


  // HACK: newline parsing inconsistent. This brute force normalizes the this._input.
  source_text = source_text.replace(allLineBreaks, '\n');

  // reset
  var baseIndentString = source_text.match(/^[\t ]*/)[0];

  this._output = new Output(this._options, baseIndentString);
  this._input = new InputScanner(source_text);
  this._indentLevel = 0;
  this._nestedLevel = 0;

  this._ch = null;
  var parenLevel = 0;

  var insideRule = false;
  // This is the value side of a property value pair (blue in the following ex)
  // label { content: blue }
  var insidePropertyValue = false;
  var enteringConditionalGroup = false;
  var insideAtExtend = false;
  var insideAtImport = false;
  var topCharacter = this._ch;
  var whitespace;
  var isAfterSpace;
  var previous_ch;

  while (true) {
    whitespace = this._input.read(whitespacePattern);
    isAfterSpace = whitespace !== '';
    previous_ch = topCharacter;
    this._ch = this._input.next();
    if (this._ch === '\\' && this._input.hasNext()) {
      this._ch += this._input.next();
    }
    topCharacter = this._ch;

    if (!this._ch) {
      break;
    } else if (this._ch === '/' && this._input.peek() === '*') {
      // /* css comment */
      // Always start block comments on a new line.
      // This handles scenarios where a block comment immediately
      // follows a property definition on the same line or where
      // minified code is being beautified.
      this._output.add_new_line();
      this._input.back();

      var comment = this._input.read(block_comment_pattern);

      // Handle ignore directive
      var directives = directives_core.get_directives(comment);
      if (directives && directives.ignore === 'start') {
        comment += directives_core.readIgnored(this._input);
      }

      this.print_string(comment);

      // Ensures any new lines following the comment are preserved
      this.eatWhitespace(true);

      // Block comments are followed by a new line so they don't
      // share a line with other properties
      this._output.add_new_line();
    } else if (this._ch === '/' && this._input.peek() === '/') {
      // // single line comment
      // Preserves the space before a comment
      // on the same line as a rule
      this._output.space_before_token = true;
      this._input.back();
      this.print_string(this._input.read(comment_pattern));

      // Ensures any new lines following the comment are preserved
      this.eatWhitespace(true);
    } else if (this._ch === '@') {
      this.preserveSingleSpace(isAfterSpace);

      // deal with less propery mixins @{...}
      if (this._input.peek() === '{') {
        this.print_string(this._ch + this.eatString('}'));
      } else {
        this.print_string(this._ch);

        // strip trailing space, if present, for hash property checks
        var variableOrRule = this._input.peekUntilAfter(/[: ,;{}()[\]\/='"]/g);

        if (variableOrRule.match(/[ :]$/)) {
          // we have a variable or pseudo-class, add it and insert one space before continuing
          variableOrRule = this.eatString(": ").replace(/\s$/, '');
          this.print_string(variableOrRule);
          this._output.space_before_token = true;
        }

        variableOrRule = variableOrRule.replace(/\s$/, '');

        if (variableOrRule === 'extend') {
          insideAtExtend = true;
        } else if (variableOrRule === 'import') {
          insideAtImport = true;
        }

        // might be a nesting at-rule
        if (variableOrRule in this.NESTED_AT_RULE) {
          this._nestedLevel += 1;
          if (variableOrRule in this.CONDITIONAL_GROUP_RULE) {
            enteringConditionalGroup = true;
          }
          // might be less variable
        } else if (!insideRule && parenLevel === 0 && variableOrRule.indexOf(':') !== -1) {
          insidePropertyValue = true;
          this.indent();
        }
      }
    } else if (this._ch === '#' && this._input.peek() === '{') {
      this.preserveSingleSpace(isAfterSpace);
      this.print_string(this._ch + this.eatString('}'));
    } else if (this._ch === '{') {
      if (insidePropertyValue) {
        insidePropertyValue = false;
        this.outdent();
      }
      this.indent();
      this._output.space_before_token = true;
      this.print_string(this._ch);

      // when entering conditional groups, only rulesets are allowed
      if (enteringConditionalGroup) {
        enteringConditionalGroup = false;
        insideRule = (this._indentLevel > this._nestedLevel);
      } else {
        // otherwise, declarations are also allowed
        insideRule = (this._indentLevel >= this._nestedLevel);
      }
      if (this._options.newline_between_rules && insideRule) {
        if (this._output.previous_line && this._output.previous_line.item(-1) !== '{') {
          this._output.ensure_empty_line_above('/', ',');
        }
      }
      this.eatWhitespace(true);
      this._output.add_new_line();
    } else if (this._ch === '}') {
      this.outdent();
      this._output.add_new_line();
      if (previous_ch === '{') {
        this._output.trim(true);
      }
      insideAtImport = false;
      insideAtExtend = false;
      if (insidePropertyValue) {
        this.outdent();
        insidePropertyValue = false;
      }
      this.print_string(this._ch);
      insideRule = false;
      if (this._nestedLevel) {
        this._nestedLevel--;
      }

      this.eatWhitespace(true);
      this._output.add_new_line();

      if (this._options.newline_between_rules && !this._output.just_added_blankline()) {
        if (this._input.peek() !== '}') {
          this._output.add_new_line(true);
        }
      }
    } else if (this._ch === ":") {
      if ((insideRule || enteringConditionalGroup) && !(this._input.lookBack("&") || this.foundNestedPseudoClass()) && !this._input.lookBack("(") && !insideAtExtend && parenLevel === 0) {
        // 'property: value' delimiter
        // which could be in a conditional group query
        this.print_string(':');
        if (!insidePropertyValue) {
          insidePropertyValue = true;
          this._output.space_before_token = true;
          this.eatWhitespace(true);
          this.indent();
        }
      } else {
        // sass/less parent reference don't use a space
        // sass nested pseudo-class don't use a space

        // preserve space before pseudoclasses/pseudoelements, as it means "in any child"
        if (this._input.lookBack(" ")) {
          this._output.space_before_token = true;
        }
        if (this._input.peek() === ":") {
          // pseudo-element
          this._ch = this._input.next();
          this.print_string("::");
        } else {
          // pseudo-class
          this.print_string(':');
        }
      }
    } else if (this._ch === '"' || this._ch === '\'') {
      this.preserveSingleSpace(isAfterSpace);
      this.print_string(this._ch + this.eatString(this._ch));
      this.eatWhitespace(true);
    } else if (this._ch === ';') {
      if (parenLevel === 0) {
        if (insidePropertyValue) {
          this.outdent();
          insidePropertyValue = false;
        }
        insideAtExtend = false;
        insideAtImport = false;
        this.print_string(this._ch);
        this.eatWhitespace(true);

        // This maintains single line comments on the same
        // line. Block comments are also affected, but
        // a new line is always output before one inside
        // that section
        if (this._input.peek() !== '/') {
          this._output.add_new_line();
        }
      } else {
        this.print_string(this._ch);
        this.eatWhitespace(true);
        this._output.space_before_token = true;
      }
    } else if (this._ch === '(') { // may be a url
      if (this._input.lookBack("url")) {
        this.print_string(this._ch);
        this.eatWhitespace();
        parenLevel++;
        this.indent();
        this._ch = this._input.next();
        if (this._ch === ')' || this._ch === '"' || this._ch === '\'') {
          this._input.back();
        } else if (this._ch) {
          this.print_string(this._ch + this.eatString(')'));
          if (parenLevel) {
            parenLevel--;
            this.outdent();
          }
        }
      } else {
        this.preserveSingleSpace(isAfterSpace);
        this.print_string(this._ch);
        this.eatWhitespace();
        parenLevel++;
        this.indent();
      }
    } else if (this._ch === ')') {
      if (parenLevel) {
        parenLevel--;
        this.outdent();
      }
      this.print_string(this._ch);
    } else if (this._ch === ',') {
      this.print_string(this._ch);
      this.eatWhitespace(true);
      if (this._options.selector_separator_newline && !insidePropertyValue && parenLevel === 0 && !insideAtImport) {
        this._output.add_new_line();
      } else {
        this._output.space_before_token = true;
      }
    } else if ((this._ch === '>' || this._ch === '+' || this._ch === '~') && !insidePropertyValue && parenLevel === 0) {
      //handle combinator spacing
      if (this._options.space_around_combinator) {
        this._output.space_before_token = true;
        this.print_string(this._ch);
        this._output.space_before_token = true;
      } else {
        this.print_string(this._ch);
        this.eatWhitespace();
        // squash extra whitespace
        if (this._ch && whitespaceChar.test(this._ch)) {
          this._ch = '';
        }
      }
    } else if (this._ch === ']') {
      this.print_string(this._ch);
    } else if (this._ch === '[') {
      this.preserveSingleSpace(isAfterSpace);
      this.print_string(this._ch);
    } else if (this._ch === '=') { // no whitespace before or after
      this.eatWhitespace();
      this.print_string('=');
      if (whitespaceChar.test(this._ch)) {
        this._ch = '';
      }
    } else if (this._ch === '!' && !this._input.lookBack("\\")) { // !important
      this.print_string(' ');
      this.print_string(this._ch);
    } else {
      this.preserveSingleSpace(isAfterSpace);
      this.print_string(this._ch);
    }
  }

  var sweetCode = this._output.get_code(eol);

  return sweetCode;
};

module.exports.Beautifier = Beautifier;

},{"../core/directives":19,"../core/inputscanner":20,"../core/output":22,"./options":31}],30:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var Beautifier = require('./beautifier').Beautifier,
  Options = require('./options').Options;

function css_beautify(source_text, options) {
  var beautifier = new Beautifier(source_text, options);
  return beautifier.beautify();
}

module.exports = css_beautify;
module.exports.defaultOptions = function() {
  return new Options();
};

},{"./beautifier":29,"./options":31}],31:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var BaseOptions = require('../core/options').Options;

function Options(options) {
  BaseOptions.call(this, options, 'css');

  this.selector_separator_newline = this._get_boolean('selector_separator_newline', true);
  this.newline_between_rules = this._get_boolean('newline_between_rules', true);
  var space_around_selector_separator = this._get_boolean('space_around_selector_separator');
  this.space_around_combinator = this._get_boolean('space_around_combinator') || space_around_selector_separator;

}
Options.prototype = new BaseOptions();



module.exports.Options = Options;

},{"../core/options":21}],32:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var Options = require('../html/options').Options;
var Output = require('../core/output').Output;
var Tokenizer = require('../html/tokenizer').Tokenizer;
var TOKEN = require('../html/tokenizer').TOKEN;

var lineBreak = /\r\n|[\r\n]/;
var allLineBreaks = /\r\n|[\r\n]/g;

var Printer = function(options, base_indent_string) { //handles input/output and some other printing functions

  this.indent_level = 0;
  this.alignment_size = 0;
  this.max_preserve_newlines = options.max_preserve_newlines;
  this.preserve_newlines = options.preserve_newlines;

  this._output = new Output(options, base_indent_string);

};

Printer.prototype.current_line_has_match = function(pattern) {
  return this._output.current_line.has_match(pattern);
};

Printer.prototype.set_space_before_token = function(value, non_breaking) {
  this._output.space_before_token = value;
  this._output.non_breaking_space = non_breaking;
};

Printer.prototype.set_wrap_point = function() {
  this._output.set_indent(this.indent_level, this.alignment_size);
  this._output.set_wrap_point();
};


Printer.prototype.add_raw_token = function(token) {
  this._output.add_raw_token(token);
};

Printer.prototype.print_preserved_newlines = function(raw_token) {
  var newlines = 0;
  if (raw_token.type !== TOKEN.TEXT && raw_token.previous.type !== TOKEN.TEXT) {
    newlines = raw_token.newlines ? 1 : 0;
  }

  if (this.preserve_newlines) {
    newlines = raw_token.newlines < this.max_preserve_newlines + 1 ? raw_token.newlines : this.max_preserve_newlines + 1;
  }
  for (var n = 0; n < newlines; n++) {
    this.print_newline(n > 0);
  }

  return newlines !== 0;
};

Printer.prototype.traverse_whitespace = function(raw_token) {
  if (raw_token.whitespace_before || raw_token.newlines) {
    if (!this.print_preserved_newlines(raw_token)) {
      this._output.space_before_token = true;
    }
    return true;
  }
  return false;
};

Printer.prototype.previous_token_wrapped = function() {
  return this._output.previous_token_wrapped;
};

Printer.prototype.print_newline = function(force) {
  this._output.add_new_line(force);
};

Printer.prototype.print_token = function(token) {
  if (token.text) {
    this._output.set_indent(this.indent_level, this.alignment_size);
    this._output.add_token(token.text);
  }
};

Printer.prototype.indent = function() {
  this.indent_level++;
};

Printer.prototype.get_full_indent = function(level) {
  level = this.indent_level + (level || 0);
  if (level < 1) {
    return '';
  }

  return this._output.get_indent_string(level);
};

var get_type_attribute = function(start_token) {
  var result = null;
  var raw_token = start_token.next;

  // Search attributes for a type attribute
  while (raw_token.type !== TOKEN.EOF && start_token.closed !== raw_token) {
    if (raw_token.type === TOKEN.ATTRIBUTE && raw_token.text === 'type') {
      if (raw_token.next && raw_token.next.type === TOKEN.EQUALS &&
        raw_token.next.next && raw_token.next.next.type === TOKEN.VALUE) {
        result = raw_token.next.next.text;
      }
      break;
    }
    raw_token = raw_token.next;
  }

  return result;
};

var get_custom_beautifier_name = function(tag_check, raw_token) {
  var typeAttribute = null;
  var result = null;

  if (!raw_token.closed) {
    return null;
  }

  if (tag_check === 'script') {
    typeAttribute = 'text/javascript';
  } else if (tag_check === 'style') {
    typeAttribute = 'text/css';
  }

  typeAttribute = get_type_attribute(raw_token) || typeAttribute;

  // For script and style tags that have a type attribute, only enable custom beautifiers for matching values
  // For those without a type attribute use default;
  if (typeAttribute.search('text/css') > -1) {
    result = 'css';
  } else if (typeAttribute.search(/(text|application|dojo)\/(x-)?(javascript|ecmascript|jscript|livescript|(ld\+)?json|method|aspect)/) > -1) {
    result = 'javascript';
  } else if (typeAttribute.search(/(text|application|dojo)\/(x-)?(html)/) > -1) {
    result = 'html';
  } else if (typeAttribute.search(/test\/null/) > -1) {
    // Test only mime-type for testing the beautifier when null is passed as beautifing function
    result = 'null';
  }

  return result;
};

function in_array(what, arr) {
  return arr.indexOf(what) !== -1;
}

function TagFrame(parent, parser_token, indent_level) {
  this.parent = parent || null;
  this.tag = parser_token ? parser_token.tag_name : '';
  this.indent_level = indent_level || 0;
  this.parser_token = parser_token || null;
}

function TagStack(printer) {
  this._printer = printer;
  this._current_frame = null;
}

TagStack.prototype.get_parser_token = function() {
  return this._current_frame ? this._current_frame.parser_token : null;
};

TagStack.prototype.record_tag = function(parser_token) { //function to record a tag and its parent in this.tags Object
  var new_frame = new TagFrame(this._current_frame, parser_token, this._printer.indent_level);
  this._current_frame = new_frame;
};

TagStack.prototype._try_pop_frame = function(frame) { //function to retrieve the opening tag to the corresponding closer
  var parser_token = null;

  if (frame) {
    parser_token = frame.parser_token;
    this._printer.indent_level = frame.indent_level;
    this._current_frame = frame.parent;
  }

  return parser_token;
};

TagStack.prototype._get_frame = function(tag_list, stop_list) { //function to retrieve the opening tag to the corresponding closer
  var frame = this._current_frame;

  while (frame) { //till we reach '' (the initial value);
    if (tag_list.indexOf(frame.tag) !== -1) { //if this is it use it
      break;
    } else if (stop_list && stop_list.indexOf(frame.tag) !== -1) {
      frame = null;
      break;
    }
    frame = frame.parent;
  }

  return frame;
};

TagStack.prototype.try_pop = function(tag, stop_list) { //function to retrieve the opening tag to the corresponding closer
  var frame = this._get_frame([tag], stop_list);
  return this._try_pop_frame(frame);
};

TagStack.prototype.indent_to_tag = function(tag_list) {
  var frame = this._get_frame(tag_list);
  if (frame) {
    this._printer.indent_level = frame.indent_level;
  }
};

function Beautifier(source_text, options, js_beautify, css_beautify) {
  //Wrapper function to invoke all the necessary constructors and deal with the output.
  this._source_text = source_text || '';
  options = options || {};
  this._js_beautify = js_beautify;
  this._css_beautify = css_beautify;
  this._tag_stack = null;

  // Allow the setting of language/file-type specific options
  // with inheritance of overall settings
  var optionHtml = new Options(options, 'html');

  this._options = optionHtml;

  this._is_wrap_attributes_force = this._options.wrap_attributes.substr(0, 'force'.length) === 'force';
  this._is_wrap_attributes_force_expand_multiline = (this._options.wrap_attributes === 'force-expand-multiline');
  this._is_wrap_attributes_force_aligned = (this._options.wrap_attributes === 'force-aligned');
  this._is_wrap_attributes_aligned_multiple = (this._options.wrap_attributes === 'aligned-multiple');
  this._is_wrap_attributes_preserve = this._options.wrap_attributes.substr(0, 'preserve'.length) === 'preserve';
  this._is_wrap_attributes_preserve_aligned = (this._options.wrap_attributes === 'preserve-aligned');
}

Beautifier.prototype.beautify = function() {

  // if disabled, return the input unchanged.
  if (this._options.disabled) {
    return this._source_text;
  }

  var source_text = this._source_text;
  var eol = this._options.eol;
  if (this._options.eol === 'auto') {
    eol = '\n';
    if (source_text && lineBreak.test(source_text)) {
      eol = source_text.match(lineBreak)[0];
    }
  }

  // HACK: newline parsing inconsistent. This brute force normalizes the input.
  source_text = source_text.replace(allLineBreaks, '\n');

  var baseIndentString = source_text.match(/^[\t ]*/)[0];

  var last_token = {
    text: '',
    type: ''
  };

  var last_tag_token = new TagOpenParserToken();

  var printer = new Printer(this._options, baseIndentString);
  var tokens = new Tokenizer(source_text, this._options).tokenize();

  this._tag_stack = new TagStack(printer);

  var parser_token = null;
  var raw_token = tokens.next();
  while (raw_token.type !== TOKEN.EOF) {

    if (raw_token.type === TOKEN.TAG_OPEN || raw_token.type === TOKEN.COMMENT) {
      parser_token = this._handle_tag_open(printer, raw_token, last_tag_token, last_token);
      last_tag_token = parser_token;
    } else if ((raw_token.type === TOKEN.ATTRIBUTE || raw_token.type === TOKEN.EQUALS || raw_token.type === TOKEN.VALUE) ||
      (raw_token.type === TOKEN.TEXT && !last_tag_token.tag_complete)) {
      parser_token = this._handle_inside_tag(printer, raw_token, last_tag_token, tokens);
    } else if (raw_token.type === TOKEN.TAG_CLOSE) {
      parser_token = this._handle_tag_close(printer, raw_token, last_tag_token);
    } else if (raw_token.type === TOKEN.TEXT) {
      parser_token = this._handle_text(printer, raw_token, last_tag_token);
    } else {
      // This should never happen, but if it does. Print the raw token
      printer.add_raw_token(raw_token);
    }

    last_token = parser_token;

    raw_token = tokens.next();
  }
  var sweet_code = printer._output.get_code(eol);

  return sweet_code;
};

Beautifier.prototype._handle_tag_close = function(printer, raw_token, last_tag_token) {
  var parser_token = {
    text: raw_token.text,
    type: raw_token.type
  };
  printer.alignment_size = 0;
  last_tag_token.tag_complete = true;

  printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== '', true);
  if (last_tag_token.is_unformatted) {
    printer.add_raw_token(raw_token);
  } else {
    if (last_tag_token.tag_start_char === '<') {
      printer.set_space_before_token(raw_token.text[0] === '/', true); // space before />, no space before >
      if (this._is_wrap_attributes_force_expand_multiline && last_tag_token.has_wrapped_attrs) {
        printer.print_newline(false);
      }
    }
    printer.print_token(raw_token);

  }

  if (last_tag_token.indent_content &&
    !(last_tag_token.is_unformatted || last_tag_token.is_content_unformatted)) {
    printer.indent();

    // only indent once per opened tag
    last_tag_token.indent_content = false;
  }

  if (!last_tag_token.is_inline_element &&
    !(last_tag_token.is_unformatted || last_tag_token.is_content_unformatted)) {
    printer.set_wrap_point();
  }

  return parser_token;
};

Beautifier.prototype._handle_inside_tag = function(printer, raw_token, last_tag_token, tokens) {
  var wrapped = last_tag_token.has_wrapped_attrs;
  var parser_token = {
    text: raw_token.text,
    type: raw_token.type
  };

  printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== '', true);
  if (last_tag_token.is_unformatted) {
    printer.add_raw_token(raw_token);
  } else if (last_tag_token.tag_start_char === '{' && raw_token.type === TOKEN.TEXT) {
    // For the insides of handlebars allow newlines or a single space between open and contents
    if (printer.print_preserved_newlines(raw_token)) {
      raw_token.newlines = 0;
      printer.add_raw_token(raw_token);
    } else {
      printer.print_token(raw_token);
    }
  } else {
    if (raw_token.type === TOKEN.ATTRIBUTE) {
      printer.set_space_before_token(true);
      last_tag_token.attr_count += 1;
    } else if (raw_token.type === TOKEN.EQUALS) { //no space before =
      printer.set_space_before_token(false);
    } else if (raw_token.type === TOKEN.VALUE && raw_token.previous.type === TOKEN.EQUALS) { //no space before value
      printer.set_space_before_token(false);
    }

    if (raw_token.type === TOKEN.ATTRIBUTE && last_tag_token.tag_start_char === '<') {
      if (this._is_wrap_attributes_preserve || this._is_wrap_attributes_preserve_aligned) {
        printer.traverse_whitespace(raw_token);
        wrapped = wrapped || raw_token.newlines !== 0;
      }


      if (this._is_wrap_attributes_force) {
        var force_attr_wrap = last_tag_token.attr_count > 1;
        if (this._is_wrap_attributes_force_expand_multiline && last_tag_token.attr_count === 1) {
          var is_only_attribute = true;
          var peek_index = 0;
          var peek_token;
          do {
            peek_token = tokens.peek(peek_index);
            if (peek_token.type === TOKEN.ATTRIBUTE) {
              is_only_attribute = false;
              break;
            }
            peek_index += 1;
          } while (peek_index < 4 && peek_token.type !== TOKEN.EOF && peek_token.type !== TOKEN.TAG_CLOSE);

          force_attr_wrap = !is_only_attribute;
        }

        if (force_attr_wrap) {
          printer.print_newline(false);
          wrapped = true;
        }
      }
    }
    printer.print_token(raw_token);
    wrapped = wrapped || printer.previous_token_wrapped();
    last_tag_token.has_wrapped_attrs = wrapped;
  }
  return parser_token;
};

Beautifier.prototype._handle_text = function(printer, raw_token, last_tag_token) {
  var parser_token = {
    text: raw_token.text,
    type: 'TK_CONTENT'
  };
  if (last_tag_token.custom_beautifier_name) { //check if we need to format javascript
    this._print_custom_beatifier_text(printer, raw_token, last_tag_token);
  } else if (last_tag_token.is_unformatted || last_tag_token.is_content_unformatted) {
    printer.add_raw_token(raw_token);
  } else {
    printer.traverse_whitespace(raw_token);
    printer.print_token(raw_token);
  }
  return parser_token;
};

Beautifier.prototype._print_custom_beatifier_text = function(printer, raw_token, last_tag_token) {
  var local = this;
  if (raw_token.text !== '') {

    var text = raw_token.text,
      _beautifier,
      script_indent_level = 1,
      pre = '',
      post = '';
    if (last_tag_token.custom_beautifier_name === 'javascript' && typeof this._js_beautify === 'function') {
      _beautifier = this._js_beautify;
    } else if (last_tag_token.custom_beautifier_name === 'css' && typeof this._css_beautify === 'function') {
      _beautifier = this._css_beautify;
    } else if (last_tag_token.custom_beautifier_name === 'html') {
      _beautifier = function(html_source, options) {
        var beautifier = new Beautifier(html_source, options, local._js_beautify, local._css_beautify);
        return beautifier.beautify();
      };
    }

    if (this._options.indent_scripts === "keep") {
      script_indent_level = 0;
    } else if (this._options.indent_scripts === "separate") {
      script_indent_level = -printer.indent_level;
    }

    var indentation = printer.get_full_indent(script_indent_level);

    // if there is at least one empty line at the end of this text, strip it
    // we'll be adding one back after the text but before the containing tag.
    text = text.replace(/\n[ \t]*$/, '');

    // Handle the case where content is wrapped in a comment or cdata.
    if (last_tag_token.custom_beautifier_name !== 'html' &&
      text[0] === '<' && text.match(/^(<!--|<!\[CDATA\[)/)) {
      var matched = /^(<!--[^\n]*|<!\[CDATA\[)(\n?)([ \t\n]*)([\s\S]*)(-->|]]>)$/.exec(text);

      // if we start to wrap but don't finish, print raw
      if (!matched) {
        printer.add_raw_token(raw_token);
        return;
      }

      pre = indentation + matched[1] + '\n';
      text = matched[4];
      if (matched[5]) {
        post = indentation + matched[5];
      }

      // if there is at least one empty line at the end of this text, strip it
      // we'll be adding one back after the text but before the containing tag.
      text = text.replace(/\n[ \t]*$/, '');

      if (matched[2] || matched[3].indexOf('\n') !== -1) {
        // if the first line of the non-comment text has spaces
        // use that as the basis for indenting in null case.
        matched = matched[3].match(/[ \t]+$/);
        if (matched) {
          raw_token.whitespace_before = matched[0];
        }
      }
    }

    if (text) {
      if (_beautifier) {

        // call the Beautifier if avaliable
        var Child_options = function() {
          this.eol = '\n';
        };
        Child_options.prototype = this._options.raw_options;
        var child_options = new Child_options();
        text = _beautifier(indentation + text, child_options);
      } else {
        // simply indent the string otherwise
        var white = raw_token.whitespace_before;
        if (white) {
          text = text.replace(new RegExp('\n(' + white + ')?', 'g'), '\n');
        }

        text = indentation + text.replace(/\n/g, '\n' + indentation);
      }
    }

    if (pre) {
      if (!text) {
        text = pre + post;
      } else {
        text = pre + text + '\n' + post;
      }
    }

    printer.print_newline(false);
    if (text) {
      raw_token.text = text;
      raw_token.whitespace_before = '';
      raw_token.newlines = 0;
      printer.add_raw_token(raw_token);
      printer.print_newline(true);
    }
  }
};

Beautifier.prototype._handle_tag_open = function(printer, raw_token, last_tag_token, last_token) {
  var parser_token = this._get_tag_open_token(raw_token);

  if ((last_tag_token.is_unformatted || last_tag_token.is_content_unformatted) &&
    raw_token.type === TOKEN.TAG_OPEN && raw_token.text.indexOf('</') === 0) {
    // End element tags for unformatted or content_unformatted elements
    // are printed raw to keep any newlines inside them exactly the same.
    printer.add_raw_token(raw_token);
  } else {
    printer.traverse_whitespace(raw_token);
    this._set_tag_position(printer, raw_token, parser_token, last_tag_token, last_token);
    if (!parser_token.is_inline_element) {
      printer.set_wrap_point();
    }
    printer.print_token(raw_token);
  }

  //indent attributes an auto, forced, aligned or forced-align line-wrap
  if (this._is_wrap_attributes_force_aligned || this._is_wrap_attributes_aligned_multiple || this._is_wrap_attributes_preserve_aligned) {
    parser_token.alignment_size = raw_token.text.length + 1;
  }

  if (!parser_token.tag_complete && !parser_token.is_unformatted) {
    printer.alignment_size = parser_token.alignment_size;
  }

  return parser_token;
};

var TagOpenParserToken = function(parent, raw_token) {
  this.parent = parent || null;
  this.text = '';
  this.type = 'TK_TAG_OPEN';
  this.tag_name = '';
  this.is_inline_element = false;
  this.is_unformatted = false;
  this.is_content_unformatted = false;
  this.is_empty_element = false;
  this.is_start_tag = false;
  this.is_end_tag = false;
  this.indent_content = false;
  this.multiline_content = false;
  this.custom_beautifier_name = null;
  this.start_tag_token = null;
  this.attr_count = 0;
  this.has_wrapped_attrs = false;
  this.alignment_size = 0;
  this.tag_complete = false;
  this.tag_start_char = '';
  this.tag_check = '';

  if (!raw_token) {
    this.tag_complete = true;
  } else {
    var tag_check_match;

    this.tag_start_char = raw_token.text[0];
    this.text = raw_token.text;

    if (this.tag_start_char === '<') {
      tag_check_match = raw_token.text.match(/^<([^\s>]*)/);
      this.tag_check = tag_check_match ? tag_check_match[1] : '';
    } else {
      tag_check_match = raw_token.text.match(/^{{[#\^]?([^\s}]+)/);
      this.tag_check = tag_check_match ? tag_check_match[1] : '';
    }
    this.tag_check = this.tag_check.toLowerCase();

    if (raw_token.type === TOKEN.COMMENT) {
      this.tag_complete = true;
    }

    this.is_start_tag = this.tag_check.charAt(0) !== '/';
    this.tag_name = !this.is_start_tag ? this.tag_check.substr(1) : this.tag_check;
    this.is_end_tag = !this.is_start_tag ||
      (raw_token.closed && raw_token.closed.text === '/>');

    // handlebars tags that don't start with # or ^ are single_tags, and so also start and end.
    this.is_end_tag = this.is_end_tag ||
      (this.tag_start_char === '{' && (this.text.length < 3 || (/[^#\^]/.test(this.text.charAt(2)))));
  }
};

Beautifier.prototype._get_tag_open_token = function(raw_token) { //function to get a full tag and parse its type
  var parser_token = new TagOpenParserToken(this._tag_stack.get_parser_token(), raw_token);

  parser_token.alignment_size = this._options.wrap_attributes_indent_size;

  parser_token.is_end_tag = parser_token.is_end_tag ||
    in_array(parser_token.tag_check, this._options.void_elements);

  parser_token.is_empty_element = parser_token.tag_complete ||
    (parser_token.is_start_tag && parser_token.is_end_tag);

  parser_token.is_unformatted = !parser_token.tag_complete && in_array(parser_token.tag_check, this._options.unformatted);
  parser_token.is_content_unformatted = !parser_token.is_empty_element && in_array(parser_token.tag_check, this._options.content_unformatted);
  parser_token.is_inline_element = in_array(parser_token.tag_name, this._options.inline) || parser_token.tag_start_char === '{';

  return parser_token;
};

Beautifier.prototype._set_tag_position = function(printer, raw_token, parser_token, last_tag_token, last_token) {

  if (!parser_token.is_empty_element) {
    if (parser_token.is_end_tag) { //this tag is a double tag so check for tag-ending
      parser_token.start_tag_token = this._tag_stack.try_pop(parser_token.tag_name); //remove it and all ancestors
    } else { // it's a start-tag
      // check if this tag is starting an element that has optional end element
      // and do an ending needed
      if (this._do_optional_end_element(parser_token)) {
        if (!parser_token.is_inline_element) {
          if (parser_token.parent) {
            parser_token.parent.multiline_content = true;
          }
          printer.print_newline(false);
        }

      }

      this._tag_stack.record_tag(parser_token); //push it on the tag stack

      if ((parser_token.tag_name === 'script' || parser_token.tag_name === 'style') &&
        !(parser_token.is_unformatted || parser_token.is_content_unformatted)) {
        parser_token.custom_beautifier_name = get_custom_beautifier_name(parser_token.tag_check, raw_token);
      }
    }
  }

  if (in_array(parser_token.tag_check, this._options.extra_liners)) { //check if this double needs an extra line
    printer.print_newline(false);
    if (!printer._output.just_added_blankline()) {
      printer.print_newline(true);
    }
  }

  if (parser_token.is_empty_element) { //if this tag name is a single tag type (either in the list or has a closing /)

    // if you hit an else case, reset the indent level if you are inside an:
    // 'if', 'unless', or 'each' block.
    if (parser_token.tag_start_char === '{' && parser_token.tag_check === 'else') {
      this._tag_stack.indent_to_tag(['if', 'unless', 'each']);
      parser_token.indent_content = true;
      // Don't add a newline if opening {{#if}} tag is on the current line
      var foundIfOnCurrentLine = printer.current_line_has_match(/{{#if/);
      if (!foundIfOnCurrentLine) {
        printer.print_newline(false);
      }
    }

    // Don't add a newline before elements that should remain where they are.
    if (parser_token.tag_name === '!--' && last_token.type === TOKEN.TAG_CLOSE &&
      last_tag_token.is_end_tag && parser_token.text.indexOf('\n') === -1) {
      //Do nothing. Leave comments on same line.
    } else if (!parser_token.is_inline_element && !parser_token.is_unformatted) {
      printer.print_newline(false);
    }
  } else if (parser_token.is_unformatted || parser_token.is_content_unformatted) {
    if (!parser_token.is_inline_element && !parser_token.is_unformatted) {
      printer.print_newline(false);
    }
  } else if (parser_token.is_end_tag) { //this tag is a double tag so check for tag-ending
    if ((parser_token.start_tag_token && parser_token.start_tag_token.multiline_content) ||
      !(parser_token.is_inline_element ||
        (last_tag_token.is_inline_element) ||
        (last_token.type === TOKEN.TAG_CLOSE &&
          parser_token.start_tag_token === last_tag_token) ||
        (last_token.type === 'TK_CONTENT')
      )) {
      printer.print_newline(false);
    }
  } else { // it's a start-tag
    parser_token.indent_content = !parser_token.custom_beautifier_name;

    if (parser_token.tag_start_char === '<') {
      if (parser_token.tag_name === 'html') {
        parser_token.indent_content = this._options.indent_inner_html;
      } else if (parser_token.tag_name === 'head') {
        parser_token.indent_content = this._options.indent_head_inner_html;
      } else if (parser_token.tag_name === 'body') {
        parser_token.indent_content = this._options.indent_body_inner_html;
      }
    }

    if (!parser_token.is_inline_element && last_token.type !== 'TK_CONTENT') {
      if (parser_token.parent) {
        parser_token.parent.multiline_content = true;
      }
      printer.print_newline(false);
    }
  }
};

//To be used for <p> tag special case:
//var p_closers = ['address', 'article', 'aside', 'blockquote', 'details', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul'];

Beautifier.prototype._do_optional_end_element = function(parser_token) {
  var result = null;
  // NOTE: cases of "if there is no more content in the parent element"
  // are handled automatically by the beautifier.
  // It assumes parent or ancestor close tag closes all children.
  // https://www.w3.org/TR/html5/syntax.html#optional-tags
  if (parser_token.is_empty_element || !parser_token.is_start_tag || !parser_token.parent) {
    return;

  } else if (parser_token.tag_name === 'body') {
    // A head element’s end tag may be omitted if the head element is not immediately followed by a space character or a comment.
    result = result || this._tag_stack.try_pop('head');

    //} else if (parser_token.tag_name === 'body') {
    // DONE: A body element’s end tag may be omitted if the body element is not immediately followed by a comment.

  } else if (parser_token.tag_name === 'li') {
    // An li element’s end tag may be omitted if the li element is immediately followed by another li element or if there is no more content in the parent element.
    result = result || this._tag_stack.try_pop('li', ['ol', 'ul']);

  } else if (parser_token.tag_name === 'dd' || parser_token.tag_name === 'dt') {
    // A dd element’s end tag may be omitted if the dd element is immediately followed by another dd element or a dt element, or if there is no more content in the parent element.
    // A dt element’s end tag may be omitted if the dt element is immediately followed by another dt element or a dd element.
    result = result || this._tag_stack.try_pop('dt', ['dl']);
    result = result || this._tag_stack.try_pop('dd', ['dl']);

    //} else if (p_closers.indexOf(parser_token.tag_name) !== -1) {
    //TODO: THIS IS A BUG FARM. We are not putting this into 1.8.0 as it is likely to blow up.
    //A p element’s end tag may be omitted if the p element is immediately followed by an address, article, aside, blockquote, details, div, dl, fieldset, figcaption, figure, footer, form, h1, h2, h3, h4, h5, h6, header, hr, main, nav, ol, p, pre, section, table, or ul element, or if there is no more content in the parent element and the parent element is an HTML element that is not an a, audio, del, ins, map, noscript, or video element, or an autonomous custom element.
    //result = result || this._tag_stack.try_pop('p', ['body']);

  } else if (parser_token.tag_name === 'rp' || parser_token.tag_name === 'rt') {
    // An rt element’s end tag may be omitted if the rt element is immediately followed by an rt or rp element, or if there is no more content in the parent element.
    // An rp element’s end tag may be omitted if the rp element is immediately followed by an rt or rp element, or if there is no more content in the parent element.
    result = result || this._tag_stack.try_pop('rt', ['ruby', 'rtc']);
    result = result || this._tag_stack.try_pop('rp', ['ruby', 'rtc']);

  } else if (parser_token.tag_name === 'optgroup') {
    // An optgroup element’s end tag may be omitted if the optgroup element is immediately followed by another optgroup element, or if there is no more content in the parent element.
    // An option element’s end tag may be omitted if the option element is immediately followed by another option element, or if it is immediately followed by an optgroup element, or if there is no more content in the parent element.
    result = result || this._tag_stack.try_pop('optgroup', ['select']);
    //result = result || this._tag_stack.try_pop('option', ['select']);

  } else if (parser_token.tag_name === 'option') {
    // An option element’s end tag may be omitted if the option element is immediately followed by another option element, or if it is immediately followed by an optgroup element, or if there is no more content in the parent element.
    result = result || this._tag_stack.try_pop('option', ['select', 'datalist', 'optgroup']);

  } else if (parser_token.tag_name === 'colgroup') {
    // DONE: A colgroup element’s end tag may be omitted if the colgroup element is not immediately followed by a space character or a comment.
    // A caption element's end tag may be ommitted if a colgroup, thead, tfoot, tbody, or tr element is started.
    result = result || this._tag_stack.try_pop('caption', ['table']);

  } else if (parser_token.tag_name === 'thead') {
    // A colgroup element's end tag may be ommitted if a thead, tfoot, tbody, or tr element is started.
    // A caption element's end tag may be ommitted if a colgroup, thead, tfoot, tbody, or tr element is started.
    result = result || this._tag_stack.try_pop('caption', ['table']);
    result = result || this._tag_stack.try_pop('colgroup', ['table']);

    //} else if (parser_token.tag_name === 'caption') {
    // DONE: A caption element’s end tag may be omitted if the caption element is not immediately followed by a space character or a comment.

  } else if (parser_token.tag_name === 'tbody' || parser_token.tag_name === 'tfoot') {
    // A thead element’s end tag may be omitted if the thead element is immediately followed by a tbody or tfoot element.
    // A tbody element’s end tag may be omitted if the tbody element is immediately followed by a tbody or tfoot element, or if there is no more content in the parent element.
    // A colgroup element's end tag may be ommitted if a thead, tfoot, tbody, or tr element is started.
    // A caption element's end tag may be ommitted if a colgroup, thead, tfoot, tbody, or tr element is started.
    result = result || this._tag_stack.try_pop('caption', ['table']);
    result = result || this._tag_stack.try_pop('colgroup', ['table']);
    result = result || this._tag_stack.try_pop('thead', ['table']);
    result = result || this._tag_stack.try_pop('tbody', ['table']);

    //} else if (parser_token.tag_name === 'tfoot') {
    // DONE: A tfoot element’s end tag may be omitted if there is no more content in the parent element.

  } else if (parser_token.tag_name === 'tr') {
    // A tr element’s end tag may be omitted if the tr element is immediately followed by another tr element, or if there is no more content in the parent element.
    // A colgroup element's end tag may be ommitted if a thead, tfoot, tbody, or tr element is started.
    // A caption element's end tag may be ommitted if a colgroup, thead, tfoot, tbody, or tr element is started.
    result = result || this._tag_stack.try_pop('caption', ['table']);
    result = result || this._tag_stack.try_pop('colgroup', ['table']);
    result = result || this._tag_stack.try_pop('tr', ['table', 'thead', 'tbody', 'tfoot']);

  } else if (parser_token.tag_name === 'th' || parser_token.tag_name === 'td') {
    // A td element’s end tag may be omitted if the td element is immediately followed by a td or th element, or if there is no more content in the parent element.
    // A th element’s end tag may be omitted if the th element is immediately followed by a td or th element, or if there is no more content in the parent element.
    result = result || this._tag_stack.try_pop('td', ['table', 'thead', 'tbody', 'tfoot', 'tr']);
    result = result || this._tag_stack.try_pop('th', ['table', 'thead', 'tbody', 'tfoot', 'tr']);
  }

  // Start element omission not handled currently
  // A head element’s start tag may be omitted if the element is empty, or if the first thing inside the head element is an element.
  // A tbody element’s start tag may be omitted if the first thing inside the tbody element is a tr element, and if the element is not immediately preceded by a tbody, thead, or tfoot element whose end tag has been omitted. (It can’t be omitted if the element is empty.)
  // A colgroup element’s start tag may be omitted if the first thing inside the colgroup element is a col element, and if the element is not immediately preceded by another colgroup element whose end tag has been omitted. (It can’t be omitted if the element is empty.)

  // Fix up the parent of the parser token
  parser_token.parent = this._tag_stack.get_parser_token();

  return result;
};

module.exports.Beautifier = Beautifier;

},{"../core/output":22,"../html/options":34,"../html/tokenizer":35}],33:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var Beautifier = require('./beautifier').Beautifier,
  Options = require('./options').Options;

function style_html(html_source, options, js_beautify, css_beautify) {
  var beautifier = new Beautifier(html_source, options, js_beautify, css_beautify);
  return beautifier.beautify();
}

module.exports = style_html;
module.exports.defaultOptions = function() {
  return new Options();
};

},{"./beautifier":32,"./options":34}],34:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var BaseOptions = require('../core/options').Options;

function Options(options) {
  BaseOptions.call(this, options, 'html');
  if (this.templating.length === 1 && this.templating[0] === 'auto') {
    this.templating = ['django', 'erb', 'handlebars', 'php'];
  }

  this.indent_inner_html = this._get_boolean('indent_inner_html');
  this.indent_body_inner_html = this._get_boolean('indent_body_inner_html', true);
  this.indent_head_inner_html = this._get_boolean('indent_head_inner_html', true);

  this.indent_handlebars = this._get_boolean('indent_handlebars', true);
  this.wrap_attributes = this._get_selection('wrap_attributes',
    ['auto', 'force', 'force-aligned', 'force-expand-multiline', 'aligned-multiple', 'preserve', 'preserve-aligned']);
  this.wrap_attributes_indent_size = this._get_number('wrap_attributes_indent_size', this.indent_size);
  this.extra_liners = this._get_array('extra_liners', ['head', 'body', '/html']);

  // Block vs inline elements
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Inline_elements
  // https://www.w3.org/TR/html5/dom.html#phrasing-content
  this.inline = this._get_array('inline', [
    'a', 'abbr', 'area', 'audio', 'b', 'bdi', 'bdo', 'br', 'button', 'canvas', 'cite',
    'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img',
    'input', 'ins', 'kbd', 'keygen', 'label', 'map', 'mark', 'math', 'meter', 'noscript',
    'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', /* 'script', */ 'select', 'small',
    'span', 'strong', 'sub', 'sup', 'svg', 'template', 'textarea', 'time', 'u', 'var',
    'video', 'wbr', 'text',
    // obsolete inline tags
    'acronym', 'big', 'strike', 'tt'
  ]);
  this.void_elements = this._get_array('void_elements', [
    // HTLM void elements - aka self-closing tags - aka singletons
    // https://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen',
    'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr',
    // NOTE: Optional tags are too complex for a simple list
    // they are hard coded in _do_optional_end_element

    // Doctype and xml elements
    '!doctype', '?xml',

    // obsolete tags
    // basefont: https://www.computerhope.com/jargon/h/html-basefont-tag.htm
    // isndex: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/isindex
    'basefont', 'isindex'
  ]);
  this.unformatted = this._get_array('unformatted', []);
  this.content_unformatted = this._get_array('content_unformatted', [
    'pre', 'textarea'
  ]);
  this.unformatted_content_delimiter = this._get_characters('unformatted_content_delimiter');
  this.indent_scripts = this._get_selection('indent_scripts', ['normal', 'keep', 'separate']);

}
Options.prototype = new BaseOptions();



module.exports.Options = Options;

},{"../core/options":21}],35:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var BaseTokenizer = require('../core/tokenizer').Tokenizer;
var BASETOKEN = require('../core/tokenizer').TOKEN;
var Directives = require('../core/directives').Directives;
var TemplatablePattern = require('../core/templatablepattern').TemplatablePattern;
var Pattern = require('../core/pattern').Pattern;

var TOKEN = {
  TAG_OPEN: 'TK_TAG_OPEN',
  TAG_CLOSE: 'TK_TAG_CLOSE',
  ATTRIBUTE: 'TK_ATTRIBUTE',
  EQUALS: 'TK_EQUALS',
  VALUE: 'TK_VALUE',
  COMMENT: 'TK_COMMENT',
  TEXT: 'TK_TEXT',
  UNKNOWN: 'TK_UNKNOWN',
  START: BASETOKEN.START,
  RAW: BASETOKEN.RAW,
  EOF: BASETOKEN.EOF
};

var directives_core = new Directives(/<\!--/, /-->/);

var Tokenizer = function(input_string, options) {
  BaseTokenizer.call(this, input_string, options);
  this._current_tag_name = '';

  // Words end at whitespace or when a tag starts
  // if we are indenting handlebars, they are considered tags
  var templatable_reader = new TemplatablePattern(this._input).read_options(this._options);
  var pattern_reader = new Pattern(this._input);

  this.__patterns = {
    word: templatable_reader.until(/[\n\r\t <]/),
    single_quote: templatable_reader.until_after(/'/),
    double_quote: templatable_reader.until_after(/"/),
    attribute: templatable_reader.until(/[\n\r\t =\/>]/),
    element_name: templatable_reader.until(/[\n\r\t >\/]/),

    handlebars_comment: pattern_reader.starting_with(/{{!--/).until_after(/--}}/),
    handlebars: pattern_reader.starting_with(/{{/).until_after(/}}/),
    handlebars_open: pattern_reader.until(/[\n\r\t }]/),
    handlebars_raw_close: pattern_reader.until(/}}/),
    comment: pattern_reader.starting_with(/<!--/).until_after(/-->/),
    cdata: pattern_reader.starting_with(/<!\[CDATA\[/).until_after(/]]>/),
    // https://en.wikipedia.org/wiki/Conditional_comment
    conditional_comment: pattern_reader.starting_with(/<!\[/).until_after(/]>/),
    processing: pattern_reader.starting_with(/<\?/).until_after(/\?>/)
  };

  if (this._options.indent_handlebars) {
    this.__patterns.word = this.__patterns.word.exclude('handlebars');
  }

  this._unformatted_content_delimiter = null;

  if (this._options.unformatted_content_delimiter) {
    var literal_regexp = this._input.get_literal_regexp(this._options.unformatted_content_delimiter);
    this.__patterns.unformatted_content_delimiter =
      pattern_reader.matching(literal_regexp)
      .until_after(literal_regexp);
  }
};
Tokenizer.prototype = new BaseTokenizer();

Tokenizer.prototype._is_comment = function(current_token) { // jshint unused:false
  return false; //current_token.type === TOKEN.COMMENT || current_token.type === TOKEN.UNKNOWN;
};

Tokenizer.prototype._is_opening = function(current_token) {
  return current_token.type === TOKEN.TAG_OPEN;
};

Tokenizer.prototype._is_closing = function(current_token, open_token) {
  return current_token.type === TOKEN.TAG_CLOSE &&
    (open_token && (
      ((current_token.text === '>' || current_token.text === '/>') && open_token.text[0] === '<') ||
      (current_token.text === '}}' && open_token.text[0] === '{' && open_token.text[1] === '{')));
};

Tokenizer.prototype._reset = function() {
  this._current_tag_name = '';
};

Tokenizer.prototype._get_next_token = function(previous_token, open_token) { // jshint unused:false
  var token = null;
  this._readWhitespace();
  var c = this._input.peek();

  if (c === null) {
    return this._create_token(TOKEN.EOF, '');
  }

  token = token || this._read_open_handlebars(c, open_token);
  token = token || this._read_attribute(c, previous_token, open_token);
  token = token || this._read_raw_content(c, previous_token, open_token);
  token = token || this._read_close(c, open_token);
  token = token || this._read_content_word(c);
  token = token || this._read_comment_or_cdata(c);
  token = token || this._read_processing(c);
  token = token || this._read_open(c, open_token);
  token = token || this._create_token(TOKEN.UNKNOWN, this._input.next());

  return token;
};

Tokenizer.prototype._read_comment_or_cdata = function(c) { // jshint unused:false
  var token = null;
  var resulting_string = null;
  var directives = null;

  if (c === '<') {
    var peek1 = this._input.peek(1);
    // We treat all comments as literals, even more than preformatted tags
    // we only look for the appropriate closing marker
    if (peek1 === '!') {
      resulting_string = this.__patterns.comment.read();

      // only process directive on html comments
      if (resulting_string) {
        directives = directives_core.get_directives(resulting_string);
        if (directives && directives.ignore === 'start') {
          resulting_string += directives_core.readIgnored(this._input);
        }
      } else {
        resulting_string = this.__patterns.cdata.read();
      }
    }

    if (resulting_string) {
      token = this._create_token(TOKEN.COMMENT, resulting_string);
      token.directives = directives;
    }
  }

  return token;
};

Tokenizer.prototype._read_processing = function(c) { // jshint unused:false
  var token = null;
  var resulting_string = null;
  var directives = null;

  if (c === '<') {
    var peek1 = this._input.peek(1);
    if (peek1 === '!' || peek1 === '?') {
      resulting_string = this.__patterns.conditional_comment.read();
      resulting_string = resulting_string || this.__patterns.processing.read();
    }

    if (resulting_string) {
      token = this._create_token(TOKEN.COMMENT, resulting_string);
      token.directives = directives;
    }
  }

  return token;
};

Tokenizer.prototype._read_open = function(c, open_token) {
  var resulting_string = null;
  var token = null;
  if (!open_token) {
    if (c === '<') {

      resulting_string = this._input.next();
      if (this._input.peek() === '/') {
        resulting_string += this._input.next();
      }
      resulting_string += this.__patterns.element_name.read();
      token = this._create_token(TOKEN.TAG_OPEN, resulting_string);
    }
  }
  return token;
};

Tokenizer.prototype._read_open_handlebars = function(c, open_token) {
  var resulting_string = null;
  var token = null;
  if (!open_token) {
    if (this._options.indent_handlebars && c === '{' && this._input.peek(1) === '{') {
      if (this._input.peek(2) === '!') {
        resulting_string = this.__patterns.handlebars_comment.read();
        resulting_string = resulting_string || this.__patterns.handlebars.read();
        token = this._create_token(TOKEN.COMMENT, resulting_string);
      } else {
        resulting_string = this.__patterns.handlebars_open.read();
        token = this._create_token(TOKEN.TAG_OPEN, resulting_string);
      }
    }
  }
  return token;
};


Tokenizer.prototype._read_close = function(c, open_token) {
  var resulting_string = null;
  var token = null;
  if (open_token) {
    if (open_token.text[0] === '<' && (c === '>' || (c === '/' && this._input.peek(1) === '>'))) {
      resulting_string = this._input.next();
      if (c === '/') { //  for close tag "/>"
        resulting_string += this._input.next();
      }
      token = this._create_token(TOKEN.TAG_CLOSE, resulting_string);
    } else if (open_token.text[0] === '{' && c === '}' && this._input.peek(1) === '}') {
      this._input.next();
      this._input.next();
      token = this._create_token(TOKEN.TAG_CLOSE, '}}');
    }
  }

  return token;
};

Tokenizer.prototype._read_attribute = function(c, previous_token, open_token) {
  var token = null;
  var resulting_string = '';
  if (open_token && open_token.text[0] === '<') {

    if (c === '=') {
      token = this._create_token(TOKEN.EQUALS, this._input.next());
    } else if (c === '"' || c === "'") {
      var content = this._input.next();
      if (c === '"') {
        content += this.__patterns.double_quote.read();
      } else {
        content += this.__patterns.single_quote.read();
      }
      token = this._create_token(TOKEN.VALUE, content);
    } else {
      resulting_string = this.__patterns.attribute.read();

      if (resulting_string) {
        if (previous_token.type === TOKEN.EQUALS) {
          token = this._create_token(TOKEN.VALUE, resulting_string);
        } else {
          token = this._create_token(TOKEN.ATTRIBUTE, resulting_string);
        }
      }
    }
  }
  return token;
};

Tokenizer.prototype._is_content_unformatted = function(tag_name) {
  // void_elements have no content and so cannot have unformatted content
  // script and style tags should always be read as unformatted content
  // finally content_unformatted and unformatted element contents are unformatted
  return this._options.void_elements.indexOf(tag_name) === -1 &&
    (this._options.content_unformatted.indexOf(tag_name) !== -1 ||
      this._options.unformatted.indexOf(tag_name) !== -1);
};


Tokenizer.prototype._read_raw_content = function(c, previous_token, open_token) { // jshint unused:false
  var resulting_string = '';
  if (open_token && open_token.text[0] === '{') {
    resulting_string = this.__patterns.handlebars_raw_close.read();
  } else if (previous_token.type === TOKEN.TAG_CLOSE && (previous_token.opened.text[0] === '<')) {
    var tag_name = previous_token.opened.text.substr(1).toLowerCase();
    if (tag_name === 'script' || tag_name === 'style') {
      // Script and style tags are allowed to have comments wrapping their content
      // or just have regular content.
      var token = this._read_comment_or_cdata(c);
      if (token) {
        token.type = TOKEN.TEXT;
        return token;
      }
      resulting_string = this._input.readUntil(new RegExp('</' + tag_name + '[\\n\\r\\t ]*?>', 'ig'));
    } else if (this._is_content_unformatted(tag_name)) {
      resulting_string = this._input.readUntil(new RegExp('</' + tag_name + '[\\n\\r\\t ]*?>', 'ig'));
    }
  }

  if (resulting_string) {
    return this._create_token(TOKEN.TEXT, resulting_string);
  }

  return null;
};

Tokenizer.prototype._read_content_word = function(c) {
  var resulting_string = '';
  if (this._options.unformatted_content_delimiter) {
    if (c === this._options.unformatted_content_delimiter[0]) {
      resulting_string = this.__patterns.unformatted_content_delimiter.read();
    }
  }

  if (!resulting_string) {
    resulting_string = this.__patterns.word.read();
  }
  if (resulting_string) {
    return this._create_token(TOKEN.TEXT, resulting_string);
  }
};

module.exports.Tokenizer = Tokenizer;
module.exports.TOKEN = TOKEN;

},{"../core/directives":19,"../core/pattern":23,"../core/templatablepattern":24,"../core/tokenizer":26}],36:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var js_beautify = require('./javascript/index');
var css_beautify = require('./css/index');
var html_beautify = require('./html/index');

function style_html(html_source, options, js, css) {
  js = js || js_beautify;
  css = css || css_beautify;
  return html_beautify(html_source, options, js, css);
}
style_html.defaultOptions = html_beautify.defaultOptions;

module.exports.js = js_beautify;
module.exports.css = css_beautify;
module.exports.html = style_html;

},{"./css/index":30,"./html/index":33,"./javascript/index":39}],37:[function(require,module,exports){
/* jshint node: true, curly: false */
// Parts of this section of code is taken from acorn.
//
// Acorn was written by Marijn Haverbeke and released under an MIT
// license. The Unicode regexps (for identifiers and whitespace) were
// taken from [Esprima](http://esprima.org) by Ariya Hidayat.
//
// Git repositories for Acorn are available at
//
//     http://marijnhaverbeke.nl/git/acorn
//     https://github.com/marijnh/acorn.git

// ## Character categories


'use strict';

// acorn used char codes to squeeze the last bit of performance out
// Beautifier is okay without that, so we're using regex
// permit $ (36) and @ (64). @ is used in ES7 decorators.
// 65 through 91 are uppercase letters.
// permit _ (95).
// 97 through 123 are lowercase letters.
var baseASCIIidentifierStartChars = "\\x24\\x40\\x41-\\x5a\\x5f\\x61-\\x7a";

// inside an identifier @ is not allowed but 0-9 are.
var baseASCIIidentifierChars = "\\x24\\x30-\\x39\\x41-\\x5a\\x5f\\x61-\\x7a";

// Big ugly regular expressions that match characters in the
// whitespace, identifier, and identifier-start categories. These
// are only applied when a character is found to actually have a
// code point above 128.
var nonASCIIidentifierStartChars = "\\xaa\\xb5\\xba\\xc0-\\xd6\\xd8-\\xf6\\xf8-\\u02c1\\u02c6-\\u02d1\\u02e0-\\u02e4\\u02ec\\u02ee\\u0370-\\u0374\\u0376\\u0377\\u037a-\\u037d\\u0386\\u0388-\\u038a\\u038c\\u038e-\\u03a1\\u03a3-\\u03f5\\u03f7-\\u0481\\u048a-\\u0527\\u0531-\\u0556\\u0559\\u0561-\\u0587\\u05d0-\\u05ea\\u05f0-\\u05f2\\u0620-\\u064a\\u066e\\u066f\\u0671-\\u06d3\\u06d5\\u06e5\\u06e6\\u06ee\\u06ef\\u06fa-\\u06fc\\u06ff\\u0710\\u0712-\\u072f\\u074d-\\u07a5\\u07b1\\u07ca-\\u07ea\\u07f4\\u07f5\\u07fa\\u0800-\\u0815\\u081a\\u0824\\u0828\\u0840-\\u0858\\u08a0\\u08a2-\\u08ac\\u0904-\\u0939\\u093d\\u0950\\u0958-\\u0961\\u0971-\\u0977\\u0979-\\u097f\\u0985-\\u098c\\u098f\\u0990\\u0993-\\u09a8\\u09aa-\\u09b0\\u09b2\\u09b6-\\u09b9\\u09bd\\u09ce\\u09dc\\u09dd\\u09df-\\u09e1\\u09f0\\u09f1\\u0a05-\\u0a0a\\u0a0f\\u0a10\\u0a13-\\u0a28\\u0a2a-\\u0a30\\u0a32\\u0a33\\u0a35\\u0a36\\u0a38\\u0a39\\u0a59-\\u0a5c\\u0a5e\\u0a72-\\u0a74\\u0a85-\\u0a8d\\u0a8f-\\u0a91\\u0a93-\\u0aa8\\u0aaa-\\u0ab0\\u0ab2\\u0ab3\\u0ab5-\\u0ab9\\u0abd\\u0ad0\\u0ae0\\u0ae1\\u0b05-\\u0b0c\\u0b0f\\u0b10\\u0b13-\\u0b28\\u0b2a-\\u0b30\\u0b32\\u0b33\\u0b35-\\u0b39\\u0b3d\\u0b5c\\u0b5d\\u0b5f-\\u0b61\\u0b71\\u0b83\\u0b85-\\u0b8a\\u0b8e-\\u0b90\\u0b92-\\u0b95\\u0b99\\u0b9a\\u0b9c\\u0b9e\\u0b9f\\u0ba3\\u0ba4\\u0ba8-\\u0baa\\u0bae-\\u0bb9\\u0bd0\\u0c05-\\u0c0c\\u0c0e-\\u0c10\\u0c12-\\u0c28\\u0c2a-\\u0c33\\u0c35-\\u0c39\\u0c3d\\u0c58\\u0c59\\u0c60\\u0c61\\u0c85-\\u0c8c\\u0c8e-\\u0c90\\u0c92-\\u0ca8\\u0caa-\\u0cb3\\u0cb5-\\u0cb9\\u0cbd\\u0cde\\u0ce0\\u0ce1\\u0cf1\\u0cf2\\u0d05-\\u0d0c\\u0d0e-\\u0d10\\u0d12-\\u0d3a\\u0d3d\\u0d4e\\u0d60\\u0d61\\u0d7a-\\u0d7f\\u0d85-\\u0d96\\u0d9a-\\u0db1\\u0db3-\\u0dbb\\u0dbd\\u0dc0-\\u0dc6\\u0e01-\\u0e30\\u0e32\\u0e33\\u0e40-\\u0e46\\u0e81\\u0e82\\u0e84\\u0e87\\u0e88\\u0e8a\\u0e8d\\u0e94-\\u0e97\\u0e99-\\u0e9f\\u0ea1-\\u0ea3\\u0ea5\\u0ea7\\u0eaa\\u0eab\\u0ead-\\u0eb0\\u0eb2\\u0eb3\\u0ebd\\u0ec0-\\u0ec4\\u0ec6\\u0edc-\\u0edf\\u0f00\\u0f40-\\u0f47\\u0f49-\\u0f6c\\u0f88-\\u0f8c\\u1000-\\u102a\\u103f\\u1050-\\u1055\\u105a-\\u105d\\u1061\\u1065\\u1066\\u106e-\\u1070\\u1075-\\u1081\\u108e\\u10a0-\\u10c5\\u10c7\\u10cd\\u10d0-\\u10fa\\u10fc-\\u1248\\u124a-\\u124d\\u1250-\\u1256\\u1258\\u125a-\\u125d\\u1260-\\u1288\\u128a-\\u128d\\u1290-\\u12b0\\u12b2-\\u12b5\\u12b8-\\u12be\\u12c0\\u12c2-\\u12c5\\u12c8-\\u12d6\\u12d8-\\u1310\\u1312-\\u1315\\u1318-\\u135a\\u1380-\\u138f\\u13a0-\\u13f4\\u1401-\\u166c\\u166f-\\u167f\\u1681-\\u169a\\u16a0-\\u16ea\\u16ee-\\u16f0\\u1700-\\u170c\\u170e-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176c\\u176e-\\u1770\\u1780-\\u17b3\\u17d7\\u17dc\\u1820-\\u1877\\u1880-\\u18a8\\u18aa\\u18b0-\\u18f5\\u1900-\\u191c\\u1950-\\u196d\\u1970-\\u1974\\u1980-\\u19ab\\u19c1-\\u19c7\\u1a00-\\u1a16\\u1a20-\\u1a54\\u1aa7\\u1b05-\\u1b33\\u1b45-\\u1b4b\\u1b83-\\u1ba0\\u1bae\\u1baf\\u1bba-\\u1be5\\u1c00-\\u1c23\\u1c4d-\\u1c4f\\u1c5a-\\u1c7d\\u1ce9-\\u1cec\\u1cee-\\u1cf1\\u1cf5\\u1cf6\\u1d00-\\u1dbf\\u1e00-\\u1f15\\u1f18-\\u1f1d\\u1f20-\\u1f45\\u1f48-\\u1f4d\\u1f50-\\u1f57\\u1f59\\u1f5b\\u1f5d\\u1f5f-\\u1f7d\\u1f80-\\u1fb4\\u1fb6-\\u1fbc\\u1fbe\\u1fc2-\\u1fc4\\u1fc6-\\u1fcc\\u1fd0-\\u1fd3\\u1fd6-\\u1fdb\\u1fe0-\\u1fec\\u1ff2-\\u1ff4\\u1ff6-\\u1ffc\\u2071\\u207f\\u2090-\\u209c\\u2102\\u2107\\u210a-\\u2113\\u2115\\u2119-\\u211d\\u2124\\u2126\\u2128\\u212a-\\u212d\\u212f-\\u2139\\u213c-\\u213f\\u2145-\\u2149\\u214e\\u2160-\\u2188\\u2c00-\\u2c2e\\u2c30-\\u2c5e\\u2c60-\\u2ce4\\u2ceb-\\u2cee\\u2cf2\\u2cf3\\u2d00-\\u2d25\\u2d27\\u2d2d\\u2d30-\\u2d67\\u2d6f\\u2d80-\\u2d96\\u2da0-\\u2da6\\u2da8-\\u2dae\\u2db0-\\u2db6\\u2db8-\\u2dbe\\u2dc0-\\u2dc6\\u2dc8-\\u2dce\\u2dd0-\\u2dd6\\u2dd8-\\u2dde\\u2e2f\\u3005-\\u3007\\u3021-\\u3029\\u3031-\\u3035\\u3038-\\u303c\\u3041-\\u3096\\u309d-\\u309f\\u30a1-\\u30fa\\u30fc-\\u30ff\\u3105-\\u312d\\u3131-\\u318e\\u31a0-\\u31ba\\u31f0-\\u31ff\\u3400-\\u4db5\\u4e00-\\u9fcc\\ua000-\\ua48c\\ua4d0-\\ua4fd\\ua500-\\ua60c\\ua610-\\ua61f\\ua62a\\ua62b\\ua640-\\ua66e\\ua67f-\\ua697\\ua6a0-\\ua6ef\\ua717-\\ua71f\\ua722-\\ua788\\ua78b-\\ua78e\\ua790-\\ua793\\ua7a0-\\ua7aa\\ua7f8-\\ua801\\ua803-\\ua805\\ua807-\\ua80a\\ua80c-\\ua822\\ua840-\\ua873\\ua882-\\ua8b3\\ua8f2-\\ua8f7\\ua8fb\\ua90a-\\ua925\\ua930-\\ua946\\ua960-\\ua97c\\ua984-\\ua9b2\\ua9cf\\uaa00-\\uaa28\\uaa40-\\uaa42\\uaa44-\\uaa4b\\uaa60-\\uaa76\\uaa7a\\uaa80-\\uaaaf\\uaab1\\uaab5\\uaab6\\uaab9-\\uaabd\\uaac0\\uaac2\\uaadb-\\uaadd\\uaae0-\\uaaea\\uaaf2-\\uaaf4\\uab01-\\uab06\\uab09-\\uab0e\\uab11-\\uab16\\uab20-\\uab26\\uab28-\\uab2e\\uabc0-\\uabe2\\uac00-\\ud7a3\\ud7b0-\\ud7c6\\ud7cb-\\ud7fb\\uf900-\\ufa6d\\ufa70-\\ufad9\\ufb00-\\ufb06\\ufb13-\\ufb17\\ufb1d\\ufb1f-\\ufb28\\ufb2a-\\ufb36\\ufb38-\\ufb3c\\ufb3e\\ufb40\\ufb41\\ufb43\\ufb44\\ufb46-\\ufbb1\\ufbd3-\\ufd3d\\ufd50-\\ufd8f\\ufd92-\\ufdc7\\ufdf0-\\ufdfb\\ufe70-\\ufe74\\ufe76-\\ufefc\\uff21-\\uff3a\\uff41-\\uff5a\\uff66-\\uffbe\\uffc2-\\uffc7\\uffca-\\uffcf\\uffd2-\\uffd7\\uffda-\\uffdc";
var nonASCIIidentifierChars = "\\u0300-\\u036f\\u0483-\\u0487\\u0591-\\u05bd\\u05bf\\u05c1\\u05c2\\u05c4\\u05c5\\u05c7\\u0610-\\u061a\\u0620-\\u0649\\u0672-\\u06d3\\u06e7-\\u06e8\\u06fb-\\u06fc\\u0730-\\u074a\\u0800-\\u0814\\u081b-\\u0823\\u0825-\\u0827\\u0829-\\u082d\\u0840-\\u0857\\u08e4-\\u08fe\\u0900-\\u0903\\u093a-\\u093c\\u093e-\\u094f\\u0951-\\u0957\\u0962-\\u0963\\u0966-\\u096f\\u0981-\\u0983\\u09bc\\u09be-\\u09c4\\u09c7\\u09c8\\u09d7\\u09df-\\u09e0\\u0a01-\\u0a03\\u0a3c\\u0a3e-\\u0a42\\u0a47\\u0a48\\u0a4b-\\u0a4d\\u0a51\\u0a66-\\u0a71\\u0a75\\u0a81-\\u0a83\\u0abc\\u0abe-\\u0ac5\\u0ac7-\\u0ac9\\u0acb-\\u0acd\\u0ae2-\\u0ae3\\u0ae6-\\u0aef\\u0b01-\\u0b03\\u0b3c\\u0b3e-\\u0b44\\u0b47\\u0b48\\u0b4b-\\u0b4d\\u0b56\\u0b57\\u0b5f-\\u0b60\\u0b66-\\u0b6f\\u0b82\\u0bbe-\\u0bc2\\u0bc6-\\u0bc8\\u0bca-\\u0bcd\\u0bd7\\u0be6-\\u0bef\\u0c01-\\u0c03\\u0c46-\\u0c48\\u0c4a-\\u0c4d\\u0c55\\u0c56\\u0c62-\\u0c63\\u0c66-\\u0c6f\\u0c82\\u0c83\\u0cbc\\u0cbe-\\u0cc4\\u0cc6-\\u0cc8\\u0cca-\\u0ccd\\u0cd5\\u0cd6\\u0ce2-\\u0ce3\\u0ce6-\\u0cef\\u0d02\\u0d03\\u0d46-\\u0d48\\u0d57\\u0d62-\\u0d63\\u0d66-\\u0d6f\\u0d82\\u0d83\\u0dca\\u0dcf-\\u0dd4\\u0dd6\\u0dd8-\\u0ddf\\u0df2\\u0df3\\u0e34-\\u0e3a\\u0e40-\\u0e45\\u0e50-\\u0e59\\u0eb4-\\u0eb9\\u0ec8-\\u0ecd\\u0ed0-\\u0ed9\\u0f18\\u0f19\\u0f20-\\u0f29\\u0f35\\u0f37\\u0f39\\u0f41-\\u0f47\\u0f71-\\u0f84\\u0f86-\\u0f87\\u0f8d-\\u0f97\\u0f99-\\u0fbc\\u0fc6\\u1000-\\u1029\\u1040-\\u1049\\u1067-\\u106d\\u1071-\\u1074\\u1082-\\u108d\\u108f-\\u109d\\u135d-\\u135f\\u170e-\\u1710\\u1720-\\u1730\\u1740-\\u1750\\u1772\\u1773\\u1780-\\u17b2\\u17dd\\u17e0-\\u17e9\\u180b-\\u180d\\u1810-\\u1819\\u1920-\\u192b\\u1930-\\u193b\\u1951-\\u196d\\u19b0-\\u19c0\\u19c8-\\u19c9\\u19d0-\\u19d9\\u1a00-\\u1a15\\u1a20-\\u1a53\\u1a60-\\u1a7c\\u1a7f-\\u1a89\\u1a90-\\u1a99\\u1b46-\\u1b4b\\u1b50-\\u1b59\\u1b6b-\\u1b73\\u1bb0-\\u1bb9\\u1be6-\\u1bf3\\u1c00-\\u1c22\\u1c40-\\u1c49\\u1c5b-\\u1c7d\\u1cd0-\\u1cd2\\u1d00-\\u1dbe\\u1e01-\\u1f15\\u200c\\u200d\\u203f\\u2040\\u2054\\u20d0-\\u20dc\\u20e1\\u20e5-\\u20f0\\u2d81-\\u2d96\\u2de0-\\u2dff\\u3021-\\u3028\\u3099\\u309a\\ua640-\\ua66d\\ua674-\\ua67d\\ua69f\\ua6f0-\\ua6f1\\ua7f8-\\ua800\\ua806\\ua80b\\ua823-\\ua827\\ua880-\\ua881\\ua8b4-\\ua8c4\\ua8d0-\\ua8d9\\ua8f3-\\ua8f7\\ua900-\\ua909\\ua926-\\ua92d\\ua930-\\ua945\\ua980-\\ua983\\ua9b3-\\ua9c0\\uaa00-\\uaa27\\uaa40-\\uaa41\\uaa4c-\\uaa4d\\uaa50-\\uaa59\\uaa7b\\uaae0-\\uaae9\\uaaf2-\\uaaf3\\uabc0-\\uabe1\\uabec\\uabed\\uabf0-\\uabf9\\ufb20-\\ufb28\\ufe00-\\ufe0f\\ufe20-\\ufe26\\ufe33\\ufe34\\ufe4d-\\ufe4f\\uff10-\\uff19\\uff3f";
//var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
//var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

var identifierStart = "(?:\\\\u[0-9a-fA-F]{4}|[" + baseASCIIidentifierStartChars + nonASCIIidentifierStartChars + "])";
var identifierChars = "(?:\\\\u[0-9a-fA-F]{4}|[" + baseASCIIidentifierChars + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "])*";

exports.identifier = new RegExp(identifierStart + identifierChars, 'g');
exports.identifierStart = new RegExp(identifierStart);
exports.identifierMatch = new RegExp("(?:\\\\u[0-9a-fA-F]{4}|[" + baseASCIIidentifierChars + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "])+");

var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/; // jshint ignore:line

// Whether a single character denotes a newline.

exports.newline = /[\n\r\u2028\u2029]/;

// Matches a whole line break (where CRLF is considered a single
// line break). Used to count lines.

// in javascript, these two differ
// in python they are the same, different methods are called on them
exports.lineBreak = new RegExp('\r\n|' + exports.newline.source);
exports.allLineBreaks = new RegExp(exports.lineBreak.source, 'g');

},{}],38:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var Output = require('../core/output').Output;
var Token = require('../core/token').Token;
var acorn = require('./acorn');
var Options = require('./options').Options;
var Tokenizer = require('./tokenizer').Tokenizer;
var line_starters = require('./tokenizer').line_starters;
var positionable_operators = require('./tokenizer').positionable_operators;
var TOKEN = require('./tokenizer').TOKEN;


function in_array(what, arr) {
  return arr.indexOf(what) !== -1;
}

function ltrim(s) {
  return s.replace(/^\s+/g, '');
}

function generateMapFromStrings(list) {
  var result = {};
  for (var x = 0; x < list.length; x++) {
    // make the mapped names underscored instead of dash
    result[list[x].replace(/-/g, '_')] = list[x];
  }
  return result;
}

function reserved_word(token, word) {
  return token && token.type === TOKEN.RESERVED && token.text === word;
}

function reserved_array(token, words) {
  return token && token.type === TOKEN.RESERVED && in_array(token.text, words);
}
// Unsure of what they mean, but they work. Worth cleaning up in future.
var special_words = ['case', 'return', 'do', 'if', 'throw', 'else', 'await', 'break', 'continue', 'async'];

var validPositionValues = ['before-newline', 'after-newline', 'preserve-newline'];

// Generate map from array
var OPERATOR_POSITION = generateMapFromStrings(validPositionValues);

var OPERATOR_POSITION_BEFORE_OR_PRESERVE = [OPERATOR_POSITION.before_newline, OPERATOR_POSITION.preserve_newline];

var MODE = {
  BlockStatement: 'BlockStatement', // 'BLOCK'
  Statement: 'Statement', // 'STATEMENT'
  ObjectLiteral: 'ObjectLiteral', // 'OBJECT',
  ArrayLiteral: 'ArrayLiteral', //'[EXPRESSION]',
  ForInitializer: 'ForInitializer', //'(FOR-EXPRESSION)',
  Conditional: 'Conditional', //'(COND-EXPRESSION)',
  Expression: 'Expression' //'(EXPRESSION)'
};

function remove_redundant_indentation(output, frame) {
  // This implementation is effective but has some issues:
  //     - can cause line wrap to happen too soon due to indent removal
  //           after wrap points are calculated
  // These issues are minor compared to ugly indentation.

  if (frame.multiline_frame ||
    frame.mode === MODE.ForInitializer ||
    frame.mode === MODE.Conditional) {
    return;
  }

  // remove one indent from each line inside this section
  output.remove_indent(frame.start_line_index);
}

// we could use just string.split, but
// IE doesn't like returning empty strings
function split_linebreaks(s) {
  //return s.split(/\x0d\x0a|\x0a/);

  s = s.replace(acorn.allLineBreaks, '\n');
  var out = [],
    idx = s.indexOf("\n");
  while (idx !== -1) {
    out.push(s.substring(0, idx));
    s = s.substring(idx + 1);
    idx = s.indexOf("\n");
  }
  if (s.length) {
    out.push(s);
  }
  return out;
}

function is_array(mode) {
  return mode === MODE.ArrayLiteral;
}

function is_expression(mode) {
  return in_array(mode, [MODE.Expression, MODE.ForInitializer, MODE.Conditional]);
}

function all_lines_start_with(lines, c) {
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line.charAt(0) !== c) {
      return false;
    }
  }
  return true;
}

function each_line_matches_indent(lines, indent) {
  var i = 0,
    len = lines.length,
    line;
  for (; i < len; i++) {
    line = lines[i];
    // allow empty lines to pass through
    if (line && line.indexOf(indent) !== 0) {
      return false;
    }
  }
  return true;
}


function Beautifier(source_text, options) {
  options = options || {};
  this._source_text = source_text || '';

  this._output = null;
  this._tokens = null;
  this._last_last_text = null;
  this._flags = null;
  this._previous_flags = null;

  this._flag_store = null;
  this._options = new Options(options);
}

Beautifier.prototype.create_flags = function(flags_base, mode) {
  var next_indent_level = 0;
  if (flags_base) {
    next_indent_level = flags_base.indentation_level;
    if (!this._output.just_added_newline() &&
      flags_base.line_indent_level > next_indent_level) {
      next_indent_level = flags_base.line_indent_level;
    }
  }

  var next_flags = {
    mode: mode,
    parent: flags_base,
    last_token: flags_base ? flags_base.last_token : new Token(TOKEN.START_BLOCK, ''), // last token text
    last_word: flags_base ? flags_base.last_word : '', // last TOKEN.WORD passed
    declaration_statement: false,
    declaration_assignment: false,
    multiline_frame: false,
    inline_frame: false,
    if_block: false,
    else_block: false,
    do_block: false,
    do_while: false,
    import_block: false,
    in_case_statement: false, // switch(..){ INSIDE HERE }
    in_case: false, // we're on the exact line with "case 0:"
    case_body: false, // the indented case-action block
    indentation_level: next_indent_level,
    alignment: 0,
    line_indent_level: flags_base ? flags_base.line_indent_level : next_indent_level,
    start_line_index: this._output.get_line_number(),
    ternary_depth: 0
  };
  return next_flags;
};

Beautifier.prototype._reset = function(source_text) {
  var baseIndentString = source_text.match(/^[\t ]*/)[0];

  this._last_last_text = ''; // pre-last token text
  this._output = new Output(this._options, baseIndentString);

  // If testing the ignore directive, start with output disable set to true
  this._output.raw = this._options.test_output_raw;


  // Stack of parsing/formatting states, including MODE.
  // We tokenize, parse, and output in an almost purely a forward-only stream of token input
  // and formatted output.  This makes the beautifier less accurate than full parsers
  // but also far more tolerant of syntax errors.
  //
  // For example, the default mode is MODE.BlockStatement. If we see a '{' we push a new frame of type
  // MODE.BlockStatement on the the stack, even though it could be object literal.  If we later
  // encounter a ":", we'll switch to to MODE.ObjectLiteral.  If we then see a ";",
  // most full parsers would die, but the beautifier gracefully falls back to
  // MODE.BlockStatement and continues on.
  this._flag_store = [];
  this.set_mode(MODE.BlockStatement);
  var tokenizer = new Tokenizer(source_text, this._options);
  this._tokens = tokenizer.tokenize();
  return source_text;
};

Beautifier.prototype.beautify = function() {
  // if disabled, return the input unchanged.
  if (this._options.disabled) {
    return this._source_text;
  }

  var sweet_code;
  var source_text = this._reset(this._source_text);

  var eol = this._options.eol;
  if (this._options.eol === 'auto') {
    eol = '\n';
    if (source_text && acorn.lineBreak.test(source_text || '')) {
      eol = source_text.match(acorn.lineBreak)[0];
    }
  }

  var current_token = this._tokens.next();
  while (current_token) {
    this.handle_token(current_token);

    this._last_last_text = this._flags.last_token.text;
    this._flags.last_token = current_token;

    current_token = this._tokens.next();
  }

  sweet_code = this._output.get_code(eol);

  return sweet_code;
};

Beautifier.prototype.handle_token = function(current_token, preserve_statement_flags) {
  if (current_token.type === TOKEN.START_EXPR) {
    this.handle_start_expr(current_token);
  } else if (current_token.type === TOKEN.END_EXPR) {
    this.handle_end_expr(current_token);
  } else if (current_token.type === TOKEN.START_BLOCK) {
    this.handle_start_block(current_token);
  } else if (current_token.type === TOKEN.END_BLOCK) {
    this.handle_end_block(current_token);
  } else if (current_token.type === TOKEN.WORD) {
    this.handle_word(current_token);
  } else if (current_token.type === TOKEN.RESERVED) {
    this.handle_word(current_token);
  } else if (current_token.type === TOKEN.SEMICOLON) {
    this.handle_semicolon(current_token);
  } else if (current_token.type === TOKEN.STRING) {
    this.handle_string(current_token);
  } else if (current_token.type === TOKEN.EQUALS) {
    this.handle_equals(current_token);
  } else if (current_token.type === TOKEN.OPERATOR) {
    this.handle_operator(current_token);
  } else if (current_token.type === TOKEN.COMMA) {
    this.handle_comma(current_token);
  } else if (current_token.type === TOKEN.BLOCK_COMMENT) {
    this.handle_block_comment(current_token, preserve_statement_flags);
  } else if (current_token.type === TOKEN.COMMENT) {
    this.handle_comment(current_token, preserve_statement_flags);
  } else if (current_token.type === TOKEN.DOT) {
    this.handle_dot(current_token);
  } else if (current_token.type === TOKEN.EOF) {
    this.handle_eof(current_token);
  } else if (current_token.type === TOKEN.UNKNOWN) {
    this.handle_unknown(current_token, preserve_statement_flags);
  } else {
    this.handle_unknown(current_token, preserve_statement_flags);
  }
};

Beautifier.prototype.handle_whitespace_and_comments = function(current_token, preserve_statement_flags) {
  var newlines = current_token.newlines;
  var keep_whitespace = this._options.keep_array_indentation && is_array(this._flags.mode);

  if (current_token.comments_before) {
    var comment_token = current_token.comments_before.next();
    while (comment_token) {
      // The cleanest handling of inline comments is to treat them as though they aren't there.
      // Just continue formatting and the behavior should be logical.
      // Also ignore unknown tokens.  Again, this should result in better behavior.
      this.handle_whitespace_and_comments(comment_token, preserve_statement_flags);
      this.handle_token(comment_token, preserve_statement_flags);
      comment_token = current_token.comments_before.next();
    }
  }

  if (keep_whitespace) {
    for (var i = 0; i < newlines; i += 1) {
      this.print_newline(i > 0, preserve_statement_flags);
    }
  } else {
    if (this._options.max_preserve_newlines && newlines > this._options.max_preserve_newlines) {
      newlines = this._options.max_preserve_newlines;
    }

    if (this._options.preserve_newlines) {
      if (newlines > 1) {
        this.print_newline(false, preserve_statement_flags);
        for (var j = 1; j < newlines; j += 1) {
          this.print_newline(true, preserve_statement_flags);
        }
      }
    }
  }

};

var newline_restricted_tokens = ['async', 'break', 'continue', 'return', 'throw', 'yield'];

Beautifier.prototype.allow_wrap_or_preserved_newline = function(current_token, force_linewrap) {
  force_linewrap = (force_linewrap === undefined) ? false : force_linewrap;

  // Never wrap the first token on a line
  if (this._output.just_added_newline()) {
    return;
  }

  var shouldPreserveOrForce = (this._options.preserve_newlines && current_token.newlines) || force_linewrap;
  var operatorLogicApplies = in_array(this._flags.last_token.text, positionable_operators) ||
    in_array(current_token.text, positionable_operators);

  if (operatorLogicApplies) {
    var shouldPrintOperatorNewline = (
        in_array(this._flags.last_token.text, positionable_operators) &&
        in_array(this._options.operator_position, OPERATOR_POSITION_BEFORE_OR_PRESERVE)
      ) ||
      in_array(current_token.text, positionable_operators);
    shouldPreserveOrForce = shouldPreserveOrForce && shouldPrintOperatorNewline;
  }

  if (shouldPreserveOrForce) {
    this.print_newline(false, true);
  } else if (this._options.wrap_line_length) {
    if (reserved_array(this._flags.last_token, newline_restricted_tokens)) {
      // These tokens should never have a newline inserted
      // between them and the following expression.
      return;
    }
    this._output.set_wrap_point();
  }
};

Beautifier.prototype.print_newline = function(force_newline, preserve_statement_flags) {
  if (!preserve_statement_flags) {
    if (this._flags.last_token.text !== ';' && this._flags.last_token.text !== ',' && this._flags.last_token.text !== '=' && (this._flags.last_token.type !== TOKEN.OPERATOR || this._flags.last_token.text === '--' || this._flags.last_token.text === '++')) {
      var next_token = this._tokens.peek();
      while (this._flags.mode === MODE.Statement &&
        !(this._flags.if_block && reserved_word(next_token, 'else')) &&
        !this._flags.do_block) {
        this.restore_mode();
      }
    }
  }

  if (this._output.add_new_line(force_newline)) {
    this._flags.multiline_frame = true;
  }
};

Beautifier.prototype.print_token_line_indentation = function(current_token) {
  if (this._output.just_added_newline()) {
    if (this._options.keep_array_indentation &&
      current_token.newlines &&
      (current_token.text === '[' || is_array(this._flags.mode))) {
      this._output.current_line.set_indent(-1);
      this._output.current_line.push(current_token.whitespace_before);
      this._output.space_before_token = false;
    } else if (this._output.set_indent(this._flags.indentation_level, this._flags.alignment)) {
      this._flags.line_indent_level = this._flags.indentation_level;
    }
  }
};

Beautifier.prototype.print_token = function(current_token) {
  if (this._output.raw) {
    this._output.add_raw_token(current_token);
    return;
  }

  if (this._options.comma_first && current_token.previous && current_token.previous.type === TOKEN.COMMA &&
    this._output.just_added_newline()) {
    if (this._output.previous_line.last() === ',') {
      var popped = this._output.previous_line.pop();
      // if the comma was already at the start of the line,
      // pull back onto that line and reprint the indentation
      if (this._output.previous_line.is_empty()) {
        this._output.previous_line.push(popped);
        this._output.trim(true);
        this._output.current_line.pop();
        this._output.trim();
      }

      // add the comma in front of the next token
      this.print_token_line_indentation(current_token);
      this._output.add_token(',');
      this._output.space_before_token = true;
    }
  }

  this.print_token_line_indentation(current_token);
  this._output.non_breaking_space = true;
  this._output.add_token(current_token.text);
  if (this._output.previous_token_wrapped) {
    this._flags.multiline_frame = true;
  }
};

Beautifier.prototype.indent = function() {
  this._flags.indentation_level += 1;
  this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
};

Beautifier.prototype.deindent = function() {
  if (this._flags.indentation_level > 0 &&
    ((!this._flags.parent) || this._flags.indentation_level > this._flags.parent.indentation_level)) {
    this._flags.indentation_level -= 1;
    this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
  }
};

Beautifier.prototype.set_mode = function(mode) {
  if (this._flags) {
    this._flag_store.push(this._flags);
    this._previous_flags = this._flags;
  } else {
    this._previous_flags = this.create_flags(null, mode);
  }

  this._flags = this.create_flags(this._previous_flags, mode);
  this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
};


Beautifier.prototype.restore_mode = function() {
  if (this._flag_store.length > 0) {
    this._previous_flags = this._flags;
    this._flags = this._flag_store.pop();
    if (this._previous_flags.mode === MODE.Statement) {
      remove_redundant_indentation(this._output, this._previous_flags);
    }
    this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
  }
};

Beautifier.prototype.start_of_object_property = function() {
  return this._flags.parent.mode === MODE.ObjectLiteral && this._flags.mode === MODE.Statement && (
    (this._flags.last_token.text === ':' && this._flags.ternary_depth === 0) || (reserved_array(this._flags.last_token, ['get', 'set'])));
};

Beautifier.prototype.start_of_statement = function(current_token) {
  var start = false;
  start = start || reserved_array(this._flags.last_token, ['var', 'let', 'const']) && current_token.type === TOKEN.WORD;
  start = start || reserved_word(this._flags.last_token, 'do');
  start = start || (!(this._flags.parent.mode === MODE.ObjectLiteral && this._flags.mode === MODE.Statement)) && reserved_array(this._flags.last_token, newline_restricted_tokens) && !current_token.newlines;
  start = start || reserved_word(this._flags.last_token, 'else') &&
    !(reserved_word(current_token, 'if') && !current_token.comments_before);
  start = start || (this._flags.last_token.type === TOKEN.END_EXPR && (this._previous_flags.mode === MODE.ForInitializer || this._previous_flags.mode === MODE.Conditional));
  start = start || (this._flags.last_token.type === TOKEN.WORD && this._flags.mode === MODE.BlockStatement &&
    !this._flags.in_case &&
    !(current_token.text === '--' || current_token.text === '++') &&
    this._last_last_text !== 'function' &&
    current_token.type !== TOKEN.WORD && current_token.type !== TOKEN.RESERVED);
  start = start || (this._flags.mode === MODE.ObjectLiteral && (
    (this._flags.last_token.text === ':' && this._flags.ternary_depth === 0) || reserved_array(this._flags.last_token, ['get', 'set'])));

  if (start) {
    this.set_mode(MODE.Statement);
    this.indent();

    this.handle_whitespace_and_comments(current_token, true);

    // Issue #276:
    // If starting a new statement with [if, for, while, do], push to a new line.
    // if (a) if (b) if(c) d(); else e(); else f();
    if (!this.start_of_object_property()) {
      this.allow_wrap_or_preserved_newline(current_token,
        reserved_array(current_token, ['do', 'for', 'if', 'while']));
    }
    return true;
  }
  return false;
};

Beautifier.prototype.handle_start_expr = function(current_token) {
  // The conditional starts the statement if appropriate.
  if (!this.start_of_statement(current_token)) {
    this.handle_whitespace_and_comments(current_token);
  }

  var next_mode = MODE.Expression;
  if (current_token.text === '[') {

    if (this._flags.last_token.type === TOKEN.WORD || this._flags.last_token.text === ')') {
      // this is array index specifier, break immediately
      // a[x], fn()[x]
      if (reserved_array(this._flags.last_token, line_starters)) {
        this._output.space_before_token = true;
      }
      this.print_token(current_token);
      this.set_mode(next_mode);
      this.indent();
      if (this._options.space_in_paren) {
        this._output.space_before_token = true;
      }
      return;
    }

    next_mode = MODE.ArrayLiteral;
    if (is_array(this._flags.mode)) {
      if (this._flags.last_token.text === '[' ||
        (this._flags.last_token.text === ',' && (this._last_last_text === ']' || this._last_last_text === '}'))) {
        // ], [ goes to new line
        // }, [ goes to new line
        if (!this._options.keep_array_indentation) {
          this.print_newline();
        }
      }
    }

    if (!in_array(this._flags.last_token.type, [TOKEN.START_EXPR, TOKEN.END_EXPR, TOKEN.WORD, TOKEN.OPERATOR])) {
      this._output.space_before_token = true;
    }
  } else {
    if (this._flags.last_token.type === TOKEN.RESERVED) {
      if (this._flags.last_token.text === 'for') {
        this._output.space_before_token = this._options.space_before_conditional;
        next_mode = MODE.ForInitializer;
      } else if (in_array(this._flags.last_token.text, ['if', 'while'])) {
        this._output.space_before_token = this._options.space_before_conditional;
        next_mode = MODE.Conditional;
      } else if (in_array(this._flags.last_word, ['await', 'async'])) {
        // Should be a space between await and an IIFE, or async and an arrow function
        this._output.space_before_token = true;
      } else if (this._flags.last_token.text === 'import' && current_token.whitespace_before === '') {
        this._output.space_before_token = false;
      } else if (in_array(this._flags.last_token.text, line_starters) || this._flags.last_token.text === 'catch') {
        this._output.space_before_token = true;
      }
    } else if (this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
      // Support of this kind of newline preservation.
      // a = (b &&
      //     (c || d));
      if (!this.start_of_object_property()) {
        this.allow_wrap_or_preserved_newline(current_token);
      }
    } else if (this._flags.last_token.type === TOKEN.WORD) {
      this._output.space_before_token = false;

      // function name() vs function name ()
      // function* name() vs function* name ()
      // async name() vs async name ()
      // In ES6, you can also define the method properties of an object
      // var obj = {a: function() {}}
      // It can be abbreviated
      // var obj = {a() {}}
      // var obj = { a() {}} vs var obj = { a () {}}
      // var obj = { * a() {}} vs var obj = { * a () {}}
      var peek_back_two = this._tokens.peek(-3);
      if (this._options.space_after_named_function && peek_back_two) {
        // peek starts at next character so -1 is current token
        var peek_back_three = this._tokens.peek(-4);
        if (reserved_array(peek_back_two, ['async', 'function']) ||
          (peek_back_two.text === '*' && reserved_array(peek_back_three, ['async', 'function']))) {
          this._output.space_before_token = true;
        } else if (this._flags.mode === MODE.ObjectLiteral) {
          if ((peek_back_two.text === '{' || peek_back_two.text === ',') ||
            (peek_back_two.text === '*' && (peek_back_three.text === '{' || peek_back_three.text === ','))) {
            this._output.space_before_token = true;
          }
        }
      }
    } else {
      // Support preserving wrapped arrow function expressions
      // a.b('c',
      //     () => d.e
      // )
      this.allow_wrap_or_preserved_newline(current_token);
    }

    // function() vs function ()
    // yield*() vs yield* ()
    // function*() vs function* ()
    if ((this._flags.last_token.type === TOKEN.RESERVED && (this._flags.last_word === 'function' || this._flags.last_word === 'typeof')) ||
      (this._flags.last_token.text === '*' &&
        (in_array(this._last_last_text, ['function', 'yield']) ||
          (this._flags.mode === MODE.ObjectLiteral && in_array(this._last_last_text, ['{', ',']))))) {
      this._output.space_before_token = this._options.space_after_anon_function;
    }
  }

  if (this._flags.last_token.text === ';' || this._flags.last_token.type === TOKEN.START_BLOCK) {
    this.print_newline();
  } else if (this._flags.last_token.type === TOKEN.END_EXPR || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.END_BLOCK || this._flags.last_token.text === '.' || this._flags.last_token.type === TOKEN.COMMA) {
    // do nothing on (( and )( and ][ and ]( and .(
    // TODO: Consider whether forcing this is required.  Review failing tests when removed.
    this.allow_wrap_or_preserved_newline(current_token, current_token.newlines);
  }

  this.print_token(current_token);
  this.set_mode(next_mode);
  if (this._options.space_in_paren) {
    this._output.space_before_token = true;
  }

  // In all cases, if we newline while inside an expression it should be indented.
  this.indent();
};

Beautifier.prototype.handle_end_expr = function(current_token) {
  // statements inside expressions are not valid syntax, but...
  // statements must all be closed when their container closes
  while (this._flags.mode === MODE.Statement) {
    this.restore_mode();
  }

  this.handle_whitespace_and_comments(current_token);

  if (this._flags.multiline_frame) {
    this.allow_wrap_or_preserved_newline(current_token,
      current_token.text === ']' && is_array(this._flags.mode) && !this._options.keep_array_indentation);
  }

  if (this._options.space_in_paren) {
    if (this._flags.last_token.type === TOKEN.START_EXPR && !this._options.space_in_empty_paren) {
      // () [] no inner space in empty parens like these, ever, ref #320
      this._output.trim();
      this._output.space_before_token = false;
    } else {
      this._output.space_before_token = true;
    }
  }
  this.deindent();
  this.print_token(current_token);
  this.restore_mode();

  remove_redundant_indentation(this._output, this._previous_flags);

  // do {} while () // no statement required after
  if (this._flags.do_while && this._previous_flags.mode === MODE.Conditional) {
    this._previous_flags.mode = MODE.Expression;
    this._flags.do_block = false;
    this._flags.do_while = false;

  }
};

Beautifier.prototype.handle_start_block = function(current_token) {
  this.handle_whitespace_and_comments(current_token);

  // Check if this is should be treated as a ObjectLiteral
  var next_token = this._tokens.peek();
  var second_token = this._tokens.peek(1);
  if (this._flags.last_word === 'switch' && this._flags.last_token.type === TOKEN.END_EXPR) {
    this.set_mode(MODE.BlockStatement);
    this._flags.in_case_statement = true;
  } else if (this._flags.case_body) {
    this.set_mode(MODE.BlockStatement);
  } else if (second_token && (
      (in_array(second_token.text, [':', ',']) && in_array(next_token.type, [TOKEN.STRING, TOKEN.WORD, TOKEN.RESERVED])) ||
      (in_array(next_token.text, ['get', 'set', '...']) && in_array(second_token.type, [TOKEN.WORD, TOKEN.RESERVED]))
    )) {
    // We don't support TypeScript,but we didn't break it for a very long time.
    // We'll try to keep not breaking it.
    if (!in_array(this._last_last_text, ['class', 'interface'])) {
      this.set_mode(MODE.ObjectLiteral);
    } else {
      this.set_mode(MODE.BlockStatement);
    }
  } else if (this._flags.last_token.type === TOKEN.OPERATOR && this._flags.last_token.text === '=>') {
    // arrow function: (param1, paramN) => { statements }
    this.set_mode(MODE.BlockStatement);
  } else if (in_array(this._flags.last_token.type, [TOKEN.EQUALS, TOKEN.START_EXPR, TOKEN.COMMA, TOKEN.OPERATOR]) ||
    reserved_array(this._flags.last_token, ['return', 'throw', 'import', 'default'])
  ) {
    // Detecting shorthand function syntax is difficult by scanning forward,
    //     so check the surrounding context.
    // If the block is being returned, imported, export default, passed as arg,
    //     assigned with = or assigned in a nested object, treat as an ObjectLiteral.
    this.set_mode(MODE.ObjectLiteral);
  } else {
    this.set_mode(MODE.BlockStatement);
  }

  var empty_braces = !next_token.comments_before && next_token.text === '}';
  var empty_anonymous_function = empty_braces && this._flags.last_word === 'function' &&
    this._flags.last_token.type === TOKEN.END_EXPR;

  if (this._options.brace_preserve_inline) // check for inline, set inline_frame if so
  {
    // search forward for a newline wanted inside this block
    var index = 0;
    var check_token = null;
    this._flags.inline_frame = true;
    do {
      index += 1;
      check_token = this._tokens.peek(index - 1);
      if (check_token.newlines) {
        this._flags.inline_frame = false;
        break;
      }
    } while (check_token.type !== TOKEN.EOF &&
      !(check_token.type === TOKEN.END_BLOCK && check_token.opened === current_token));
  }

  if ((this._options.brace_style === "expand" ||
      (this._options.brace_style === "none" && current_token.newlines)) &&
    !this._flags.inline_frame) {
    if (this._flags.last_token.type !== TOKEN.OPERATOR &&
      (empty_anonymous_function ||
        this._flags.last_token.type === TOKEN.EQUALS ||
        (reserved_array(this._flags.last_token, special_words) && this._flags.last_token.text !== 'else'))) {
      this._output.space_before_token = true;
    } else {
      this.print_newline(false, true);
    }
  } else { // collapse || inline_frame
    if (is_array(this._previous_flags.mode) && (this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.COMMA)) {
      if (this._flags.last_token.type === TOKEN.COMMA || this._options.space_in_paren) {
        this._output.space_before_token = true;
      }

      if (this._flags.last_token.type === TOKEN.COMMA || (this._flags.last_token.type === TOKEN.START_EXPR && this._flags.inline_frame)) {
        this.allow_wrap_or_preserved_newline(current_token);
        this._previous_flags.multiline_frame = this._previous_flags.multiline_frame || this._flags.multiline_frame;
        this._flags.multiline_frame = false;
      }
    }
    if (this._flags.last_token.type !== TOKEN.OPERATOR && this._flags.last_token.type !== TOKEN.START_EXPR) {
      if (this._flags.last_token.type === TOKEN.START_BLOCK && !this._flags.inline_frame) {
        this.print_newline();
      } else {
        this._output.space_before_token = true;
      }
    }
  }
  this.print_token(current_token);
  this.indent();

  // Except for specific cases, open braces are followed by a new line.
  if (!empty_braces && !(this._options.brace_preserve_inline && this._flags.inline_frame)) {
    this.print_newline();
  }
};

Beautifier.prototype.handle_end_block = function(current_token) {
  // statements must all be closed when their container closes
  this.handle_whitespace_and_comments(current_token);

  while (this._flags.mode === MODE.Statement) {
    this.restore_mode();
  }

  var empty_braces = this._flags.last_token.type === TOKEN.START_BLOCK;

  if (this._flags.inline_frame && !empty_braces) { // try inline_frame (only set if this._options.braces-preserve-inline) first
    this._output.space_before_token = true;
  } else if (this._options.brace_style === "expand") {
    if (!empty_braces) {
      this.print_newline();
    }
  } else {
    // skip {}
    if (!empty_braces) {
      if (is_array(this._flags.mode) && this._options.keep_array_indentation) {
        // we REALLY need a newline here, but newliner would skip that
        this._options.keep_array_indentation = false;
        this.print_newline();
        this._options.keep_array_indentation = true;

      } else {
        this.print_newline();
      }
    }
  }
  this.restore_mode();
  this.print_token(current_token);
};

Beautifier.prototype.handle_word = function(current_token) {
  if (current_token.type === TOKEN.RESERVED) {
    if (in_array(current_token.text, ['set', 'get']) && this._flags.mode !== MODE.ObjectLiteral) {
      current_token.type = TOKEN.WORD;
    } else if (current_token.text === 'import' && this._tokens.peek().text === '(') {
      current_token.type = TOKEN.WORD;
    } else if (in_array(current_token.text, ['as', 'from']) && !this._flags.import_block) {
      current_token.type = TOKEN.WORD;
    } else if (this._flags.mode === MODE.ObjectLiteral) {
      var next_token = this._tokens.peek();
      if (next_token.text === ':') {
        current_token.type = TOKEN.WORD;
      }
    }
  }

  if (this.start_of_statement(current_token)) {
    // The conditional starts the statement if appropriate.
    if (reserved_array(this._flags.last_token, ['var', 'let', 'const']) && current_token.type === TOKEN.WORD) {
      this._flags.declaration_statement = true;
    }
  } else if (current_token.newlines && !is_expression(this._flags.mode) &&
    (this._flags.last_token.type !== TOKEN.OPERATOR || (this._flags.last_token.text === '--' || this._flags.last_token.text === '++')) &&
    this._flags.last_token.type !== TOKEN.EQUALS &&
    (this._options.preserve_newlines || !reserved_array(this._flags.last_token, ['var', 'let', 'const', 'set', 'get']))) {
    this.handle_whitespace_and_comments(current_token);
    this.print_newline();
  } else {
    this.handle_whitespace_and_comments(current_token);
  }

  if (this._flags.do_block && !this._flags.do_while) {
    if (reserved_word(current_token, 'while')) {
      // do {} ## while ()
      this._output.space_before_token = true;
      this.print_token(current_token);
      this._output.space_before_token = true;
      this._flags.do_while = true;
      return;
    } else {
      // do {} should always have while as the next word.
      // if we don't see the expected while, recover
      this.print_newline();
      this._flags.do_block = false;
    }
  }

  // if may be followed by else, or not
  // Bare/inline ifs are tricky
  // Need to unwind the modes correctly: if (a) if (b) c(); else d(); else e();
  if (this._flags.if_block) {
    if (!this._flags.else_block && reserved_word(current_token, 'else')) {
      this._flags.else_block = true;
    } else {
      while (this._flags.mode === MODE.Statement) {
        this.restore_mode();
      }
      this._flags.if_block = false;
      this._flags.else_block = false;
    }
  }

  if (this._flags.in_case_statement && reserved_array(current_token, ['case', 'default'])) {
    this.print_newline();
    if (this._flags.last_token.type !== TOKEN.END_BLOCK && (this._flags.case_body || this._options.jslint_happy)) {
      // switch cases following one another
      this.deindent();
    }
    this._flags.case_body = false;

    this.print_token(current_token);
    this._flags.in_case = true;
    return;
  }

  if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
    if (!this.start_of_object_property()) {
      this.allow_wrap_or_preserved_newline(current_token);
    }
  }

  if (reserved_word(current_token, 'function')) {
    if (in_array(this._flags.last_token.text, ['}', ';']) ||
      (this._output.just_added_newline() && !(in_array(this._flags.last_token.text, ['(', '[', '{', ':', '=', ',']) || this._flags.last_token.type === TOKEN.OPERATOR))) {
      // make sure there is a nice clean space of at least one blank line
      // before a new function definition
      if (!this._output.just_added_blankline() && !current_token.comments_before) {
        this.print_newline();
        this.print_newline(true);
      }
    }
    if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD) {
      if (reserved_array(this._flags.last_token, ['get', 'set', 'new', 'export']) ||
        reserved_array(this._flags.last_token, newline_restricted_tokens)) {
        this._output.space_before_token = true;
      } else if (reserved_word(this._flags.last_token, 'default') && this._last_last_text === 'export') {
        this._output.space_before_token = true;
      } else if (this._flags.last_token.text === 'declare') {
        // accomodates Typescript declare function formatting
        this._output.space_before_token = true;
      } else {
        this.print_newline();
      }
    } else if (this._flags.last_token.type === TOKEN.OPERATOR || this._flags.last_token.text === '=') {
      // foo = function
      this._output.space_before_token = true;
    } else if (!this._flags.multiline_frame && (is_expression(this._flags.mode) || is_array(this._flags.mode))) {
      // (function
    } else {
      this.print_newline();
    }

    this.print_token(current_token);
    this._flags.last_word = current_token.text;
    return;
  }

  var prefix = 'NONE';

  if (this._flags.last_token.type === TOKEN.END_BLOCK) {

    if (this._previous_flags.inline_frame) {
      prefix = 'SPACE';
    } else if (!reserved_array(current_token, ['else', 'catch', 'finally', 'from'])) {
      prefix = 'NEWLINE';
    } else {
      if (this._options.brace_style === "expand" ||
        this._options.brace_style === "end-expand" ||
        (this._options.brace_style === "none" && current_token.newlines)) {
        prefix = 'NEWLINE';
      } else {
        prefix = 'SPACE';
        this._output.space_before_token = true;
      }
    }
  } else if (this._flags.last_token.type === TOKEN.SEMICOLON && this._flags.mode === MODE.BlockStatement) {
    // TODO: Should this be for STATEMENT as well?
    prefix = 'NEWLINE';
  } else if (this._flags.last_token.type === TOKEN.SEMICOLON && is_expression(this._flags.mode)) {
    prefix = 'SPACE';
  } else if (this._flags.last_token.type === TOKEN.STRING) {
    prefix = 'NEWLINE';
  } else if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD ||
    (this._flags.last_token.text === '*' &&
      (in_array(this._last_last_text, ['function', 'yield']) ||
        (this._flags.mode === MODE.ObjectLiteral && in_array(this._last_last_text, ['{', ',']))))) {
    prefix = 'SPACE';
  } else if (this._flags.last_token.type === TOKEN.START_BLOCK) {
    if (this._flags.inline_frame) {
      prefix = 'SPACE';
    } else {
      prefix = 'NEWLINE';
    }
  } else if (this._flags.last_token.type === TOKEN.END_EXPR) {
    this._output.space_before_token = true;
    prefix = 'NEWLINE';
  }

  if (reserved_array(current_token, line_starters) && this._flags.last_token.text !== ')') {
    if (this._flags.inline_frame || this._flags.last_token.text === 'else' || this._flags.last_token.text === 'export') {
      prefix = 'SPACE';
    } else {
      prefix = 'NEWLINE';
    }

  }

  if (reserved_array(current_token, ['else', 'catch', 'finally'])) {
    if ((!(this._flags.last_token.type === TOKEN.END_BLOCK && this._previous_flags.mode === MODE.BlockStatement) ||
        this._options.brace_style === "expand" ||
        this._options.brace_style === "end-expand" ||
        (this._options.brace_style === "none" && current_token.newlines)) &&
      !this._flags.inline_frame) {
      this.print_newline();
    } else {
      this._output.trim(true);
      var line = this._output.current_line;
      // If we trimmed and there's something other than a close block before us
      // put a newline back in.  Handles '} // comment' scenario.
      if (line.last() !== '}') {
        this.print_newline();
      }
      this._output.space_before_token = true;
    }
  } else if (prefix === 'NEWLINE') {
    if (reserved_array(this._flags.last_token, special_words)) {
      // no newline between 'return nnn'
      this._output.space_before_token = true;
    } else if (this._flags.last_token.text === 'declare' && reserved_array(current_token, ['var', 'let', 'const'])) {
      // accomodates Typescript declare formatting
      this._output.space_before_token = true;
    } else if (this._flags.last_token.type !== TOKEN.END_EXPR) {
      if ((this._flags.last_token.type !== TOKEN.START_EXPR || !reserved_array(current_token, ['var', 'let', 'const'])) && this._flags.last_token.text !== ':') {
        // no need to force newline on 'var': for (var x = 0...)
        if (reserved_word(current_token, 'if') && reserved_word(current_token.previous, 'else')) {
          // no newline for } else if {
          this._output.space_before_token = true;
        } else {
          this.print_newline();
        }
      }
    } else if (reserved_array(current_token, line_starters) && this._flags.last_token.text !== ')') {
      this.print_newline();
    }
  } else if (this._flags.multiline_frame && is_array(this._flags.mode) && this._flags.last_token.text === ',' && this._last_last_text === '}') {
    this.print_newline(); // }, in lists get a newline treatment
  } else if (prefix === 'SPACE') {
    this._output.space_before_token = true;
  }
  if (current_token.previous && (current_token.previous.type === TOKEN.WORD || current_token.previous.type === TOKEN.RESERVED)) {
    this._output.space_before_token = true;
  }
  this.print_token(current_token);
  this._flags.last_word = current_token.text;

  if (current_token.type === TOKEN.RESERVED) {
    if (current_token.text === 'do') {
      this._flags.do_block = true;
    } else if (current_token.text === 'if') {
      this._flags.if_block = true;
    } else if (current_token.text === 'import') {
      this._flags.import_block = true;
    } else if (this._flags.import_block && reserved_word(current_token, 'from')) {
      this._flags.import_block = false;
    }
  }
};

Beautifier.prototype.handle_semicolon = function(current_token) {
  if (this.start_of_statement(current_token)) {
    // The conditional starts the statement if appropriate.
    // Semicolon can be the start (and end) of a statement
    this._output.space_before_token = false;
  } else {
    this.handle_whitespace_and_comments(current_token);
  }

  var next_token = this._tokens.peek();
  while (this._flags.mode === MODE.Statement &&
    !(this._flags.if_block && reserved_word(next_token, 'else')) &&
    !this._flags.do_block) {
    this.restore_mode();
  }

  // hacky but effective for the moment
  if (this._flags.import_block) {
    this._flags.import_block = false;
  }
  this.print_token(current_token);
};

Beautifier.prototype.handle_string = function(current_token) {
  if (this.start_of_statement(current_token)) {
    // The conditional starts the statement if appropriate.
    // One difference - strings want at least a space before
    this._output.space_before_token = true;
  } else {
    this.handle_whitespace_and_comments(current_token);
    if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD || this._flags.inline_frame) {
      this._output.space_before_token = true;
    } else if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
      if (!this.start_of_object_property()) {
        this.allow_wrap_or_preserved_newline(current_token);
      }
    } else {
      this.print_newline();
    }
  }
  this.print_token(current_token);
};

Beautifier.prototype.handle_equals = function(current_token) {
  if (this.start_of_statement(current_token)) {
    // The conditional starts the statement if appropriate.
  } else {
    this.handle_whitespace_and_comments(current_token);
  }

  if (this._flags.declaration_statement) {
    // just got an '=' in a var-line, different formatting/line-breaking, etc will now be done
    this._flags.declaration_assignment = true;
  }
  this._output.space_before_token = true;
  this.print_token(current_token);
  this._output.space_before_token = true;
};

Beautifier.prototype.handle_comma = function(current_token) {
  this.handle_whitespace_and_comments(current_token, true);

  this.print_token(current_token);
  this._output.space_before_token = true;
  if (this._flags.declaration_statement) {
    if (is_expression(this._flags.parent.mode)) {
      // do not break on comma, for(var a = 1, b = 2)
      this._flags.declaration_assignment = false;
    }

    if (this._flags.declaration_assignment) {
      this._flags.declaration_assignment = false;
      this.print_newline(false, true);
    } else if (this._options.comma_first) {
      // for comma-first, we want to allow a newline before the comma
      // to turn into a newline after the comma, which we will fixup later
      this.allow_wrap_or_preserved_newline(current_token);
    }
  } else if (this._flags.mode === MODE.ObjectLiteral ||
    (this._flags.mode === MODE.Statement && this._flags.parent.mode === MODE.ObjectLiteral)) {
    if (this._flags.mode === MODE.Statement) {
      this.restore_mode();
    }

    if (!this._flags.inline_frame) {
      this.print_newline();
    }
  } else if (this._options.comma_first) {
    // EXPR or DO_BLOCK
    // for comma-first, we want to allow a newline before the comma
    // to turn into a newline after the comma, which we will fixup later
    this.allow_wrap_or_preserved_newline(current_token);
  }
};

Beautifier.prototype.handle_operator = function(current_token) {
  var isGeneratorAsterisk = current_token.text === '*' &&
    (reserved_array(this._flags.last_token, ['function', 'yield']) ||
      (in_array(this._flags.last_token.type, [TOKEN.START_BLOCK, TOKEN.COMMA, TOKEN.END_BLOCK, TOKEN.SEMICOLON]))
    );
  var isUnary = in_array(current_token.text, ['-', '+']) && (
    in_array(this._flags.last_token.type, [TOKEN.START_BLOCK, TOKEN.START_EXPR, TOKEN.EQUALS, TOKEN.OPERATOR]) ||
    in_array(this._flags.last_token.text, line_starters) ||
    this._flags.last_token.text === ','
  );

  if (this.start_of_statement(current_token)) {
    // The conditional starts the statement if appropriate.
  } else {
    var preserve_statement_flags = !isGeneratorAsterisk;
    this.handle_whitespace_and_comments(current_token, preserve_statement_flags);
  }

  if (reserved_array(this._flags.last_token, special_words)) {
    // "return" had a special handling in TK_WORD. Now we need to return the favor
    this._output.space_before_token = true;
    this.print_token(current_token);
    return;
  }

  // hack for actionscript's import .*;
  if (current_token.text === '*' && this._flags.last_token.type === TOKEN.DOT) {
    this.print_token(current_token);
    return;
  }

  if (current_token.text === '::') {
    // no spaces around exotic namespacing syntax operator
    this.print_token(current_token);
    return;
  }

  // Allow line wrapping between operators when operator_position is
  //   set to before or preserve
  if (this._flags.last_token.type === TOKEN.OPERATOR && in_array(this._options.operator_position, OPERATOR_POSITION_BEFORE_OR_PRESERVE)) {
    this.allow_wrap_or_preserved_newline(current_token);
  }

  if (current_token.text === ':' && this._flags.in_case) {
    this.print_token(current_token);

    this._flags.in_case = false;
    this._flags.case_body = true;
    if (this._tokens.peek().type !== TOKEN.START_BLOCK) {
      this.indent();
      this.print_newline();
    } else {
      this._output.space_before_token = true;
    }
    return;
  }

  var space_before = true;
  var space_after = true;
  var in_ternary = false;
  if (current_token.text === ':') {
    if (this._flags.ternary_depth === 0) {
      // Colon is invalid javascript outside of ternary and object, but do our best to guess what was meant.
      space_before = false;
    } else {
      this._flags.ternary_depth -= 1;
      in_ternary = true;
    }
  } else if (current_token.text === '?') {
    this._flags.ternary_depth += 1;
  }

  // let's handle the operator_position option prior to any conflicting logic
  if (!isUnary && !isGeneratorAsterisk && this._options.preserve_newlines && in_array(current_token.text, positionable_operators)) {
    var isColon = current_token.text === ':';
    var isTernaryColon = (isColon && in_ternary);
    var isOtherColon = (isColon && !in_ternary);

    switch (this._options.operator_position) {
      case OPERATOR_POSITION.before_newline:
        // if the current token is : and it's not a ternary statement then we set space_before to false
        this._output.space_before_token = !isOtherColon;

        this.print_token(current_token);

        if (!isColon || isTernaryColon) {
          this.allow_wrap_or_preserved_newline(current_token);
        }

        this._output.space_before_token = true;
        return;

      case OPERATOR_POSITION.after_newline:
        // if the current token is anything but colon, or (via deduction) it's a colon and in a ternary statement,
        //   then print a newline.

        this._output.space_before_token = true;

        if (!isColon || isTernaryColon) {
          if (this._tokens.peek().newlines) {
            this.print_newline(false, true);
          } else {
            this.allow_wrap_or_preserved_newline(current_token);
          }
        } else {
          this._output.space_before_token = false;
        }

        this.print_token(current_token);

        this._output.space_before_token = true;
        return;

      case OPERATOR_POSITION.preserve_newline:
        if (!isOtherColon) {
          this.allow_wrap_or_preserved_newline(current_token);
        }

        // if we just added a newline, or the current token is : and it's not a ternary statement,
        //   then we set space_before to false
        space_before = !(this._output.just_added_newline() || isOtherColon);

        this._output.space_before_token = space_before;
        this.print_token(current_token);
        this._output.space_before_token = true;
        return;
    }
  }

  if (isGeneratorAsterisk) {
    this.allow_wrap_or_preserved_newline(current_token);
    space_before = false;
    var next_token = this._tokens.peek();
    space_after = next_token && in_array(next_token.type, [TOKEN.WORD, TOKEN.RESERVED]);
  } else if (current_token.text === '...') {
    this.allow_wrap_or_preserved_newline(current_token);
    space_before = this._flags.last_token.type === TOKEN.START_BLOCK;
    space_after = false;
  } else if (in_array(current_token.text, ['--', '++', '!', '~']) || isUnary) {
    // unary operators (and binary +/- pretending to be unary) special cases
    if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR) {
      this.allow_wrap_or_preserved_newline(current_token);
    }

    space_before = false;
    space_after = false;

    // http://www.ecma-international.org/ecma-262/5.1/#sec-7.9.1
    // if there is a newline between -- or ++ and anything else we should preserve it.
    if (current_token.newlines && (current_token.text === '--' || current_token.text === '++')) {
      this.print_newline(false, true);
    }

    if (this._flags.last_token.text === ';' && is_expression(this._flags.mode)) {
      // for (;; ++i)
      //        ^^^
      space_before = true;
    }

    if (this._flags.last_token.type === TOKEN.RESERVED) {
      space_before = true;
    } else if (this._flags.last_token.type === TOKEN.END_EXPR) {
      space_before = !(this._flags.last_token.text === ']' && (current_token.text === '--' || current_token.text === '++'));
    } else if (this._flags.last_token.type === TOKEN.OPERATOR) {
      // a++ + ++b;
      // a - -b
      space_before = in_array(current_token.text, ['--', '-', '++', '+']) && in_array(this._flags.last_token.text, ['--', '-', '++', '+']);
      // + and - are not unary when preceeded by -- or ++ operator
      // a-- + b
      // a * +b
      // a - -b
      if (in_array(current_token.text, ['+', '-']) && in_array(this._flags.last_token.text, ['--', '++'])) {
        space_after = true;
      }
    }


    if (((this._flags.mode === MODE.BlockStatement && !this._flags.inline_frame) || this._flags.mode === MODE.Statement) &&
      (this._flags.last_token.text === '{' || this._flags.last_token.text === ';')) {
      // { foo; --i }
      // foo(); --bar;
      this.print_newline();
    }
  }

  this._output.space_before_token = this._output.space_before_token || space_before;
  this.print_token(current_token);
  this._output.space_before_token = space_after;
};

Beautifier.prototype.handle_block_comment = function(current_token, preserve_statement_flags) {
  if (this._output.raw) {
    this._output.add_raw_token(current_token);
    if (current_token.directives && current_token.directives.preserve === 'end') {
      // If we're testing the raw output behavior, do not allow a directive to turn it off.
      this._output.raw = this._options.test_output_raw;
    }
    return;
  }

  if (current_token.directives) {
    this.print_newline(false, preserve_statement_flags);
    this.print_token(current_token);
    if (current_token.directives.preserve === 'start') {
      this._output.raw = true;
    }
    this.print_newline(false, true);
    return;
  }

  // inline block
  if (!acorn.newline.test(current_token.text) && !current_token.newlines) {
    this._output.space_before_token = true;
    this.print_token(current_token);
    this._output.space_before_token = true;
    return;
  } else {
    this.print_block_commment(current_token, preserve_statement_flags);
  }
};

Beautifier.prototype.print_block_commment = function(current_token, preserve_statement_flags) {
  var lines = split_linebreaks(current_token.text);
  var j; // iterator for this case
  var javadoc = false;
  var starless = false;
  var lastIndent = current_token.whitespace_before;
  var lastIndentLength = lastIndent.length;

  // block comment starts with a new line
  this.print_newline(false, preserve_statement_flags);

  // first line always indented
  this.print_token_line_indentation(current_token);
  this._output.add_token(lines[0]);
  this.print_newline(false, preserve_statement_flags);


  if (lines.length > 1) {
    lines = lines.slice(1);
    javadoc = all_lines_start_with(lines, '*');
    starless = each_line_matches_indent(lines, lastIndent);

    if (javadoc) {
      this._flags.alignment = 1;
    }

    for (j = 0; j < lines.length; j++) {
      if (javadoc) {
        // javadoc: reformat and re-indent
        this.print_token_line_indentation(current_token);
        this._output.add_token(ltrim(lines[j]));
      } else if (starless && lines[j]) {
        // starless: re-indent non-empty content, avoiding trim
        this.print_token_line_indentation(current_token);
        this._output.add_token(lines[j].substring(lastIndentLength));
      } else {
        // normal comments output raw
        this._output.current_line.set_indent(-1);
        this._output.add_token(lines[j]);
      }

      // for comments on their own line or  more than one line, make sure there's a new line after
      this.print_newline(false, preserve_statement_flags);
    }

    this._flags.alignment = 0;
  }
};


Beautifier.prototype.handle_comment = function(current_token, preserve_statement_flags) {
  if (current_token.newlines) {
    this.print_newline(false, preserve_statement_flags);
  } else {
    this._output.trim(true);
  }

  this._output.space_before_token = true;
  this.print_token(current_token);
  this.print_newline(false, preserve_statement_flags);
};

Beautifier.prototype.handle_dot = function(current_token) {
  if (this.start_of_statement(current_token)) {
    // The conditional starts the statement if appropriate.
  } else {
    this.handle_whitespace_and_comments(current_token, true);
  }

  if (reserved_array(this._flags.last_token, special_words)) {
    this._output.space_before_token = false;
  } else {
    // allow preserved newlines before dots in general
    // force newlines on dots after close paren when break_chained - for bar().baz()
    this.allow_wrap_or_preserved_newline(current_token,
      this._flags.last_token.text === ')' && this._options.break_chained_methods);
  }

  // Only unindent chained method dot if this dot starts a new line.
  // Otherwise the automatic extra indentation removal will handle the over indent
  if (this._options.unindent_chained_methods && this._output.just_added_newline()) {
    this.deindent();
  }

  this.print_token(current_token);
};

Beautifier.prototype.handle_unknown = function(current_token, preserve_statement_flags) {
  this.print_token(current_token);

  if (current_token.text[current_token.text.length - 1] === '\n') {
    this.print_newline(false, preserve_statement_flags);
  }
};

Beautifier.prototype.handle_eof = function(current_token) {
  // Unwind any open statements
  while (this._flags.mode === MODE.Statement) {
    this.restore_mode();
  }
  this.handle_whitespace_and_comments(current_token);
};

module.exports.Beautifier = Beautifier;

},{"../core/output":22,"../core/token":25,"./acorn":37,"./options":40,"./tokenizer":41}],39:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var Beautifier = require('./beautifier').Beautifier,
  Options = require('./options').Options;

function js_beautify(js_source_text, options) {
  var beautifier = new Beautifier(js_source_text, options);
  return beautifier.beautify();
}

module.exports = js_beautify;
module.exports.defaultOptions = function() {
  return new Options();
};

},{"./beautifier":38,"./options":40}],40:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var BaseOptions = require('../core/options').Options;

var validPositionValues = ['before-newline', 'after-newline', 'preserve-newline'];

function Options(options) {
  BaseOptions.call(this, options, 'js');

  // compatibility, re
  var raw_brace_style = this.raw_options.brace_style || null;
  if (raw_brace_style === "expand-strict") { //graceful handling of deprecated option
    this.raw_options.brace_style = "expand";
  } else if (raw_brace_style === "collapse-preserve-inline") { //graceful handling of deprecated option
    this.raw_options.brace_style = "collapse,preserve-inline";
  } else if (this.raw_options.braces_on_own_line !== undefined) { //graceful handling of deprecated option
    this.raw_options.brace_style = this.raw_options.braces_on_own_line ? "expand" : "collapse";
    // } else if (!raw_brace_style) { //Nothing exists to set it
    //   raw_brace_style = "collapse";
  }

  //preserve-inline in delimited string will trigger brace_preserve_inline, everything
  //else is considered a brace_style and the last one only will have an effect

  var brace_style_split = this._get_selection_list('brace_style', ['collapse', 'expand', 'end-expand', 'none', 'preserve-inline']);

  this.brace_preserve_inline = false; //Defaults in case one or other was not specified in meta-option
  this.brace_style = "collapse";

  for (var bs = 0; bs < brace_style_split.length; bs++) {
    if (brace_style_split[bs] === "preserve-inline") {
      this.brace_preserve_inline = true;
    } else {
      this.brace_style = brace_style_split[bs];
    }
  }

  this.unindent_chained_methods = this._get_boolean('unindent_chained_methods');
  this.break_chained_methods = this._get_boolean('break_chained_methods');
  this.space_in_paren = this._get_boolean('space_in_paren');
  this.space_in_empty_paren = this._get_boolean('space_in_empty_paren');
  this.jslint_happy = this._get_boolean('jslint_happy');
  this.space_after_anon_function = this._get_boolean('space_after_anon_function');
  this.space_after_named_function = this._get_boolean('space_after_named_function');
  this.keep_array_indentation = this._get_boolean('keep_array_indentation');
  this.space_before_conditional = this._get_boolean('space_before_conditional', true);
  this.unescape_strings = this._get_boolean('unescape_strings');
  this.e4x = this._get_boolean('e4x');
  this.comma_first = this._get_boolean('comma_first');
  this.operator_position = this._get_selection('operator_position', validPositionValues);

  // For testing of beautify preserve:start directive
  this.test_output_raw = this._get_boolean('test_output_raw');

  // force this._options.space_after_anon_function to true if this._options.jslint_happy
  if (this.jslint_happy) {
    this.space_after_anon_function = true;
  }

}
Options.prototype = new BaseOptions();



module.exports.Options = Options;

},{"../core/options":21}],41:[function(require,module,exports){
/*jshint node:true */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2018 Einar Lielmanis, Liam Newman, and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

'use strict';

var InputScanner = require('../core/inputscanner').InputScanner;
var BaseTokenizer = require('../core/tokenizer').Tokenizer;
var BASETOKEN = require('../core/tokenizer').TOKEN;
var Directives = require('../core/directives').Directives;
var acorn = require('./acorn');
var Pattern = require('../core/pattern').Pattern;
var TemplatablePattern = require('../core/templatablepattern').TemplatablePattern;


function in_array(what, arr) {
  return arr.indexOf(what) !== -1;
}


var TOKEN = {
  START_EXPR: 'TK_START_EXPR',
  END_EXPR: 'TK_END_EXPR',
  START_BLOCK: 'TK_START_BLOCK',
  END_BLOCK: 'TK_END_BLOCK',
  WORD: 'TK_WORD',
  RESERVED: 'TK_RESERVED',
  SEMICOLON: 'TK_SEMICOLON',
  STRING: 'TK_STRING',
  EQUALS: 'TK_EQUALS',
  OPERATOR: 'TK_OPERATOR',
  COMMA: 'TK_COMMA',
  BLOCK_COMMENT: 'TK_BLOCK_COMMENT',
  COMMENT: 'TK_COMMENT',
  DOT: 'TK_DOT',
  UNKNOWN: 'TK_UNKNOWN',
  START: BASETOKEN.START,
  RAW: BASETOKEN.RAW,
  EOF: BASETOKEN.EOF
};


var directives_core = new Directives(/\/\*/, /\*\//);

var number_pattern = /0[xX][0123456789abcdefABCDEF]*|0[oO][01234567]*|0[bB][01]*|\d+n|(?:\.\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?/;

var digit = /[0-9]/;

// Dot "." must be distinguished from "..." and decimal
var dot_pattern = /[^\d\.]/;

var positionable_operators = (
  ">>> === !== " +
  "<< && >= ** != == <= >> || " +
  "< / - + > : & % ? ^ | *").split(' ');

// IMPORTANT: this must be sorted longest to shortest or tokenizing many not work.
// Also, you must update possitionable operators separately from punct
var punct =
  ">>>= " +
  "... >>= <<= === >>> !== **= " +
  "=> ^= :: /= << <= == && -= >= >> != -- += ** || ++ %= &= *= |= " +
  "= ! ? > < : / ^ - + * & % ~ |";

punct = punct.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
punct = punct.replace(/ /g, '|');

var punct_pattern = new RegExp(punct);

// words which should always start on new line.
var line_starters = 'continue,try,throw,return,var,let,const,if,switch,case,default,for,while,break,function,import,export'.split(',');
var reserved_words = line_starters.concat(['do', 'in', 'of', 'else', 'get', 'set', 'new', 'catch', 'finally', 'typeof', 'yield', 'async', 'await', 'from', 'as']);
var reserved_word_pattern = new RegExp('^(?:' + reserved_words.join('|') + ')$');

// var template_pattern = /(?:(?:<\?php|<\?=)[\s\S]*?\?>)|(?:<%[\s\S]*?%>)/g;

var in_html_comment;

var Tokenizer = function(input_string, options) {
  BaseTokenizer.call(this, input_string, options);

  this._patterns.whitespace = this._patterns.whitespace.matching(
    /\u00A0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff/.source,
    /\u2028\u2029/.source);

  var pattern_reader = new Pattern(this._input);
  var templatable = new TemplatablePattern(this._input)
    .read_options(this._options);

  this.__patterns = {
    template: templatable,
    identifier: templatable.starting_with(acorn.identifier).matching(acorn.identifierMatch),
    number: pattern_reader.matching(number_pattern),
    punct: pattern_reader.matching(punct_pattern),
    // comment ends just before nearest linefeed or end of file
    comment: pattern_reader.starting_with(/\/\//).until(/[\n\r\u2028\u2029]/),
    //  /* ... */ comment ends with nearest */ or end of file
    block_comment: pattern_reader.starting_with(/\/\*/).until_after(/\*\//),
    html_comment_start: pattern_reader.matching(/<!--/),
    html_comment_end: pattern_reader.matching(/-->/),
    include: pattern_reader.starting_with(/#include/).until_after(acorn.lineBreak),
    shebang: pattern_reader.starting_with(/#!/).until_after(acorn.lineBreak),
    xml: pattern_reader.matching(/[\s\S]*?<(\/?)([-a-zA-Z:0-9_.]+|{[\s\S]+?}|!\[CDATA\[[\s\S]*?\]\])(\s+{[\s\S]+?}|\s+[-a-zA-Z:0-9_.]+|\s+[-a-zA-Z:0-9_.]+\s*=\s*('[^']*'|"[^"]*"|{[\s\S]+?}))*\s*(\/?)\s*>/),
    single_quote: templatable.until(/['\\\n\r\u2028\u2029]/),
    double_quote: templatable.until(/["\\\n\r\u2028\u2029]/),
    template_text: templatable.until(/[`\\$]/),
    template_expression: templatable.until(/[`}\\]/)
  };

};
Tokenizer.prototype = new BaseTokenizer();

Tokenizer.prototype._is_comment = function(current_token) {
  return current_token.type === TOKEN.COMMENT || current_token.type === TOKEN.BLOCK_COMMENT || current_token.type === TOKEN.UNKNOWN;
};

Tokenizer.prototype._is_opening = function(current_token) {
  return current_token.type === TOKEN.START_BLOCK || current_token.type === TOKEN.START_EXPR;
};

Tokenizer.prototype._is_closing = function(current_token, open_token) {
  return (current_token.type === TOKEN.END_BLOCK || current_token.type === TOKEN.END_EXPR) &&
    (open_token && (
      (current_token.text === ']' && open_token.text === '[') ||
      (current_token.text === ')' && open_token.text === '(') ||
      (current_token.text === '}' && open_token.text === '{')));
};

Tokenizer.prototype._reset = function() {
  in_html_comment = false;
};

Tokenizer.prototype._get_next_token = function(previous_token, open_token) { // jshint unused:false
  var token = null;
  this._readWhitespace();
  var c = this._input.peek();

  if (c === null) {
    return this._create_token(TOKEN.EOF, '');
  }

  token = token || this._read_string(c);
  token = token || this._read_word(previous_token);
  token = token || this._read_singles(c);
  token = token || this._read_comment(c);
  token = token || this._read_regexp(c, previous_token);
  token = token || this._read_xml(c, previous_token);
  token = token || this._read_non_javascript(c);
  token = token || this._read_punctuation();
  token = token || this._create_token(TOKEN.UNKNOWN, this._input.next());

  return token;
};

Tokenizer.prototype._read_word = function(previous_token) {
  var resulting_string;
  resulting_string = this.__patterns.identifier.read();
  if (resulting_string !== '') {
    resulting_string = resulting_string.replace(acorn.allLineBreaks, '\n');
    if (!(previous_token.type === TOKEN.DOT ||
        (previous_token.type === TOKEN.RESERVED && (previous_token.text === 'set' || previous_token.text === 'get'))) &&
      reserved_word_pattern.test(resulting_string)) {
      if (resulting_string === 'in' || resulting_string === 'of') { // hack for 'in' and 'of' operators
        return this._create_token(TOKEN.OPERATOR, resulting_string);
      }
      return this._create_token(TOKEN.RESERVED, resulting_string);
    }
    return this._create_token(TOKEN.WORD, resulting_string);
  }

  resulting_string = this.__patterns.number.read();
  if (resulting_string !== '') {
    return this._create_token(TOKEN.WORD, resulting_string);
  }
};

Tokenizer.prototype._read_singles = function(c) {
  var token = null;
  if (c === '(' || c === '[') {
    token = this._create_token(TOKEN.START_EXPR, c);
  } else if (c === ')' || c === ']') {
    token = this._create_token(TOKEN.END_EXPR, c);
  } else if (c === '{') {
    token = this._create_token(TOKEN.START_BLOCK, c);
  } else if (c === '}') {
    token = this._create_token(TOKEN.END_BLOCK, c);
  } else if (c === ';') {
    token = this._create_token(TOKEN.SEMICOLON, c);
  } else if (c === '.' && dot_pattern.test(this._input.peek(1))) {
    token = this._create_token(TOKEN.DOT, c);
  } else if (c === ',') {
    token = this._create_token(TOKEN.COMMA, c);
  }

  if (token) {
    this._input.next();
  }
  return token;
};

Tokenizer.prototype._read_punctuation = function() {
  var resulting_string = this.__patterns.punct.read();

  if (resulting_string !== '') {
    if (resulting_string === '=') {
      return this._create_token(TOKEN.EQUALS, resulting_string);
    } else {
      return this._create_token(TOKEN.OPERATOR, resulting_string);
    }
  }
};

Tokenizer.prototype._read_non_javascript = function(c) {
  var resulting_string = '';

  if (c === '#') {
    if (this._is_first_token()) {
      resulting_string = this.__patterns.shebang.read();

      if (resulting_string) {
        return this._create_token(TOKEN.UNKNOWN, resulting_string.trim() + '\n');
      }
    }

    // handles extendscript #includes
    resulting_string = this.__patterns.include.read();

    if (resulting_string) {
      return this._create_token(TOKEN.UNKNOWN, resulting_string.trim() + '\n');
    }

    c = this._input.next();

    // Spidermonkey-specific sharp variables for circular references. Considered obsolete.
    var sharp = '#';
    if (this._input.hasNext() && this._input.testChar(digit)) {
      do {
        c = this._input.next();
        sharp += c;
      } while (this._input.hasNext() && c !== '#' && c !== '=');
      if (c === '#') {
        //
      } else if (this._input.peek() === '[' && this._input.peek(1) === ']') {
        sharp += '[]';
        this._input.next();
        this._input.next();
      } else if (this._input.peek() === '{' && this._input.peek(1) === '}') {
        sharp += '{}';
        this._input.next();
        this._input.next();
      }
      return this._create_token(TOKEN.WORD, sharp);
    }

    this._input.back();

  } else if (c === '<' && this._is_first_token()) {
    resulting_string = this.__patterns.html_comment_start.read();
    if (resulting_string) {
      while (this._input.hasNext() && !this._input.testChar(acorn.newline)) {
        resulting_string += this._input.next();
      }
      in_html_comment = true;
      return this._create_token(TOKEN.COMMENT, resulting_string);
    }
  } else if (in_html_comment && c === '-') {
    resulting_string = this.__patterns.html_comment_end.read();
    if (resulting_string) {
      in_html_comment = false;
      return this._create_token(TOKEN.COMMENT, resulting_string);
    }
  }

  return null;
};

Tokenizer.prototype._read_comment = function(c) {
  var token = null;
  if (c === '/') {
    var comment = '';
    if (this._input.peek(1) === '*') {
      // peek for comment /* ... */
      comment = this.__patterns.block_comment.read();
      var directives = directives_core.get_directives(comment);
      if (directives && directives.ignore === 'start') {
        comment += directives_core.readIgnored(this._input);
      }
      comment = comment.replace(acorn.allLineBreaks, '\n');
      token = this._create_token(TOKEN.BLOCK_COMMENT, comment);
      token.directives = directives;
    } else if (this._input.peek(1) === '/') {
      // peek for comment // ...
      comment = this.__patterns.comment.read();
      token = this._create_token(TOKEN.COMMENT, comment);
    }
  }
  return token;
};

Tokenizer.prototype._read_string = function(c) {
  if (c === '`' || c === "'" || c === '"') {
    var resulting_string = this._input.next();
    this.has_char_escapes = false;

    if (c === '`') {
      resulting_string += this._read_string_recursive('`', true, '${');
    } else {
      resulting_string += this._read_string_recursive(c);
    }

    if (this.has_char_escapes && this._options.unescape_strings) {
      resulting_string = unescape_string(resulting_string);
    }

    if (this._input.peek() === c) {
      resulting_string += this._input.next();
    }

    resulting_string = resulting_string.replace(acorn.allLineBreaks, '\n');

    return this._create_token(TOKEN.STRING, resulting_string);
  }

  return null;
};

Tokenizer.prototype._allow_regexp_or_xml = function(previous_token) {
  // regex and xml can only appear in specific locations during parsing
  return (previous_token.type === TOKEN.RESERVED && in_array(previous_token.text, ['return', 'case', 'throw', 'else', 'do', 'typeof', 'yield'])) ||
    (previous_token.type === TOKEN.END_EXPR && previous_token.text === ')' &&
      previous_token.opened.previous.type === TOKEN.RESERVED && in_array(previous_token.opened.previous.text, ['if', 'while', 'for'])) ||
    (in_array(previous_token.type, [TOKEN.COMMENT, TOKEN.START_EXPR, TOKEN.START_BLOCK, TOKEN.START,
      TOKEN.END_BLOCK, TOKEN.OPERATOR, TOKEN.EQUALS, TOKEN.EOF, TOKEN.SEMICOLON, TOKEN.COMMA
    ]));
};

Tokenizer.prototype._read_regexp = function(c, previous_token) {

  if (c === '/' && this._allow_regexp_or_xml(previous_token)) {
    // handle regexp
    //
    var resulting_string = this._input.next();
    var esc = false;

    var in_char_class = false;
    while (this._input.hasNext() &&
      ((esc || in_char_class || this._input.peek() !== c) &&
        !this._input.testChar(acorn.newline))) {
      resulting_string += this._input.peek();
      if (!esc) {
        esc = this._input.peek() === '\\';
        if (this._input.peek() === '[') {
          in_char_class = true;
        } else if (this._input.peek() === ']') {
          in_char_class = false;
        }
      } else {
        esc = false;
      }
      this._input.next();
    }

    if (this._input.peek() === c) {
      resulting_string += this._input.next();

      // regexps may have modifiers /regexp/MOD , so fetch those, too
      // Only [gim] are valid, but if the user puts in garbage, do what we can to take it.
      resulting_string += this._input.read(acorn.identifier);
    }
    return this._create_token(TOKEN.STRING, resulting_string);
  }
  return null;
};

Tokenizer.prototype._read_xml = function(c, previous_token) {

  if (this._options.e4x && c === "<" && this._allow_regexp_or_xml(previous_token)) {
    var xmlStr = '';
    var match = this.__patterns.xml.read_match();
    // handle e4x xml literals
    //
    if (match) {
      // Trim root tag to attempt to
      var rootTag = match[2].replace(/^{\s+/, '{').replace(/\s+}$/, '}');
      var isCurlyRoot = rootTag.indexOf('{') === 0;
      var depth = 0;
      while (match) {
        var isEndTag = !!match[1];
        var tagName = match[2];
        var isSingletonTag = (!!match[match.length - 1]) || (tagName.slice(0, 8) === "![CDATA[");
        if (!isSingletonTag &&
          (tagName === rootTag || (isCurlyRoot && tagName.replace(/^{\s+/, '{').replace(/\s+}$/, '}')))) {
          if (isEndTag) {
            --depth;
          } else {
            ++depth;
          }
        }
        xmlStr += match[0];
        if (depth <= 0) {
          break;
        }
        match = this.__patterns.xml.read_match();
      }
      // if we didn't close correctly, keep unformatted.
      if (!match) {
        xmlStr += this._input.match(/[\s\S]*/g)[0];
      }
      xmlStr = xmlStr.replace(acorn.allLineBreaks, '\n');
      return this._create_token(TOKEN.STRING, xmlStr);
    }
  }

  return null;
};

function unescape_string(s) {
  // You think that a regex would work for this
  // return s.replace(/\\x([0-9a-f]{2})/gi, function(match, val) {
  //         return String.fromCharCode(parseInt(val, 16));
  //     })
  // However, dealing with '\xff', '\\xff', '\\\xff' makes this more fun.
  var out = '',
    escaped = 0;

  var input_scan = new InputScanner(s);
  var matched = null;

  while (input_scan.hasNext()) {
    // Keep any whitespace, non-slash characters
    // also keep slash pairs.
    matched = input_scan.match(/([\s]|[^\\]|\\\\)+/g);

    if (matched) {
      out += matched[0];
    }

    if (input_scan.peek() === '\\') {
      input_scan.next();
      if (input_scan.peek() === 'x') {
        matched = input_scan.match(/x([0-9A-Fa-f]{2})/g);
      } else if (input_scan.peek() === 'u') {
        matched = input_scan.match(/u([0-9A-Fa-f]{4})/g);
      } else {
        out += '\\';
        if (input_scan.hasNext()) {
          out += input_scan.next();
        }
        continue;
      }

      // If there's some error decoding, return the original string
      if (!matched) {
        return s;
      }

      escaped = parseInt(matched[1], 16);

      if (escaped > 0x7e && escaped <= 0xff && matched[0].indexOf('x') === 0) {
        // we bail out on \x7f..\xff,
        // leaving whole string escaped,
        // as it's probably completely binary
        return s;
      } else if (escaped >= 0x00 && escaped < 0x20) {
        // leave 0x00...0x1f escaped
        out += '\\' + matched[0];
        continue;
      } else if (escaped === 0x22 || escaped === 0x27 || escaped === 0x5c) {
        // single-quote, apostrophe, backslash - escape these
        out += '\\' + String.fromCharCode(escaped);
      } else {
        out += String.fromCharCode(escaped);
      }
    }
  }

  return out;
}

// handle string
//
Tokenizer.prototype._read_string_recursive = function(delimiter, allow_unescaped_newlines, start_sub) {
  var current_char;
  var pattern;
  if (delimiter === '\'') {
    pattern = this.__patterns.single_quote;
  } else if (delimiter === '"') {
    pattern = this.__patterns.double_quote;
  } else if (delimiter === '`') {
    pattern = this.__patterns.template_text;
  } else if (delimiter === '}') {
    pattern = this.__patterns.template_expression;
  }

  var resulting_string = pattern.read();
  var next = '';
  while (this._input.hasNext()) {
    next = this._input.next();
    if (next === delimiter ||
      (!allow_unescaped_newlines && acorn.newline.test(next))) {
      this._input.back();
      break;
    } else if (next === '\\' && this._input.hasNext()) {
      current_char = this._input.peek();

      if (current_char === 'x' || current_char === 'u') {
        this.has_char_escapes = true;
      } else if (current_char === '\r' && this._input.peek(1) === '\n') {
        this._input.next();
      }
      next += this._input.next();
    } else if (start_sub) {
      if (start_sub === '${' && next === '$' && this._input.peek() === '{') {
        next += this._input.next();
      }

      if (start_sub === next) {
        if (delimiter === '`') {
          next += this._read_string_recursive('}', allow_unescaped_newlines, '`');
        } else {
          next += this._read_string_recursive('`', allow_unescaped_newlines, '${');
        }
        if (this._input.hasNext()) {
          next += this._input.next();
        }
      }
    }
    next += pattern.read();
    resulting_string += next;
  }

  return resulting_string;
};

module.exports.Tokenizer = Tokenizer;
module.exports.TOKEN = TOKEN;
module.exports.positionable_operators = positionable_operators.slice();
module.exports.line_starters = line_starters.slice();

},{"../core/directives":19,"../core/inputscanner":20,"../core/pattern":23,"../core/templatablepattern":24,"../core/tokenizer":26,"./acorn":37}],42:[function(require,module,exports){
(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define('stackframe', [], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.StackFrame = factory();
    }
}(this, function() {
    'use strict';
    function _isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }

    function _getter(p) {
        return function() {
            return this[p];
        };
    }

    var booleanProps = ['isConstructor', 'isEval', 'isNative', 'isToplevel'];
    var numericProps = ['columnNumber', 'lineNumber'];
    var stringProps = ['fileName', 'functionName', 'source'];
    var arrayProps = ['args'];

    var props = booleanProps.concat(numericProps, stringProps, arrayProps);

    function StackFrame(obj) {
        if (obj instanceof Object) {
            for (var i = 0; i < props.length; i++) {
                if (obj.hasOwnProperty(props[i]) && obj[props[i]] !== undefined) {
                    this['set' + _capitalize(props[i])](obj[props[i]]);
                }
            }
        }
    }

    StackFrame.prototype = {
        getArgs: function() {
            return this.args;
        },
        setArgs: function(v) {
            if (Object.prototype.toString.call(v) !== '[object Array]') {
                throw new TypeError('Args must be an Array');
            }
            this.args = v;
        },

        getEvalOrigin: function() {
            return this.evalOrigin;
        },
        setEvalOrigin: function(v) {
            if (v instanceof StackFrame) {
                this.evalOrigin = v;
            } else if (v instanceof Object) {
                this.evalOrigin = new StackFrame(v);
            } else {
                throw new TypeError('Eval Origin must be an Object or StackFrame');
            }
        },

        toString: function() {
            var fileName = this.getFileName() || '';
            var lineNumber = this.getLineNumber() || '';
            var columnNumber = this.getColumnNumber() || '';
            var functionName = this.getFunctionName() || '';
            if (this.getIsEval()) {
                if (fileName) {
                    return '[eval] (' + fileName + ':' + lineNumber + ':' + columnNumber + ')';
                }
                return '[eval]:' + lineNumber + ':' + columnNumber;
            }
            if (functionName) {
                return functionName + ' (' + fileName + ':' + lineNumber + ':' + columnNumber + ')';
            }
            return fileName + ':' + lineNumber + ':' + columnNumber;
        }
    };

    StackFrame.fromString = function StackFrame$$fromString(str) {
        var argsStartIndex = str.indexOf('(');
        var argsEndIndex = str.lastIndexOf(')');

        var functionName = str.substring(0, argsStartIndex);
        var args = str.substring(argsStartIndex + 1, argsEndIndex).split(',');
        var locationString = str.substring(argsEndIndex + 1);

        if (locationString.indexOf('@') === 0) {
            var parts = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(locationString, '');
            var fileName = parts[1];
            var lineNumber = parts[2];
            var columnNumber = parts[3];
        }

        return new StackFrame({
            functionName: functionName,
            args: args || undefined,
            fileName: fileName,
            lineNumber: lineNumber || undefined,
            columnNumber: columnNumber || undefined
        });
    };

    for (var i = 0; i < booleanProps.length; i++) {
        StackFrame.prototype['get' + _capitalize(booleanProps[i])] = _getter(booleanProps[i]);
        StackFrame.prototype['set' + _capitalize(booleanProps[i])] = (function(p) {
            return function(v) {
                this[p] = Boolean(v);
            };
        })(booleanProps[i]);
    }

    for (var j = 0; j < numericProps.length; j++) {
        StackFrame.prototype['get' + _capitalize(numericProps[j])] = _getter(numericProps[j]);
        StackFrame.prototype['set' + _capitalize(numericProps[j])] = (function(p) {
            return function(v) {
                if (!_isNumber(v)) {
                    throw new TypeError(p + ' must be a Number');
                }
                this[p] = Number(v);
            };
        })(numericProps[j]);
    }

    for (var k = 0; k < stringProps.length; k++) {
        StackFrame.prototype['get' + _capitalize(stringProps[k])] = _getter(stringProps[k]);
        StackFrame.prototype['set' + _capitalize(stringProps[k])] = (function(p) {
            return function(v) {
                this[p] = String(v);
            };
        })(stringProps[k]);
    }

    return StackFrame;
}));

},{}]},{},[7]);
