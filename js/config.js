var {
    generateId,
    stringify
} = require("./tools");

// TODO: Zkontrolovat že zakázané tagy nejsou v richtextu

// TODO: V tabulkách vkládat <uuString hned na začátek, ne do prostřed



/**
 * Toto je defaultní nastavení, které je použito v případě, že u tagu nějaké nastavení chybí.
 */
let defaultTagConfig = {
    "hasEndTag": true, // Určuje, zda má uuTag, kterým bude tento tag nahrazen ukončovací uuTag, či nikoliv
    "skip": false, // Pokud je true, bude tento tag ve výpisu vynechán. Potomci jsou připsáni rodičovi.
    "ignore": false, // Tento tag, včetně potomků bude ve výpisu ignorován
    "replacements": {}, // Definuje nahrazení tagu za uuTag a atributů za uuAtributy
    "allowed": { // Seznam povolených atributů tagu
        "attributes": []
    },
    "automation": null // Funkce spouštěné během různých fází parsování.
    // postparse - Těsně po dokončení parsování HTML. Jedině v této automatizaci je umožněno pracovat s DOM!!!
    // preoutput - Před výpisem uuStringů. Také je možné editovat DOM.
    // attributes - Před vypsáním atributů uuTagu do výstupu. Zásadně neměnit DOM!!!
    // content - Před vypsáním obsahu uuTagu do výstupu. Zásadně neměnit DOM!!!
}

let headerReplacement = {
    "hasEndTag": true,
    "replacements": {
        "tag": "UU5.Bricks.Section",
        "attributes": {}
    },
    "automation": {
        "attributes": (self) => {
            let args = self.args;
            // Vezme obsah tagu h<1-6> a vloží ho do argumentu header.
            // Pokud jde jen o text, vloží se text jako takový.
            // Pokud jde o více tagu, přihodí se ještě <uu5string/> před samotný kód
            args["id"] = generateId();
            args["level"] = parseInt(self.getTagName().substr(-1));
            return args;
        },
        "postparse": (self) => {

            // Aktuální děti jsou pouze obsahem nadpisu
            self.args["header"] = self.getText();
            self.children = []; // Všechny děti jsou v argumentu header
        },
        "preoutput": (self) => {
            // Najde sourozence zapsané za tímto tagem
            let siblings = self.parent.children.slice(self.parent.children.findIndex(e => e == self) + 1);

            for (let sibling of siblings) {

                console.log(sibling);
                // Jde taky o nadpis
                if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(sibling.getTagName())) {

                    console.log("taky nadpis")

                    let sibling_level = parseInt(sibling.getTagName().substr(-1));
                    let my_level = parseInt(self.getTagName().substr(-1));

                    console.log("level: " + sibling_level);
                    console.log("my level: " + my_level);

                    // Je nižší nebo stejný level?
                    if (sibling_level <= my_level) {
                        console.log("nižší nebo stejný");
                        break;
                    }
                }

                console.log("přidávám " + sibling + " jako potomka " + self);

                // Odstraní sourozence z rodiče a přidá jako rodiče tuto sekci
                self.parent.children = self.parent.children.filter(e => e != sibling);
                self.children.push(sibling);
                sibling.parent = self;
            }
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
                    "colspan": "colSpan",
                    "rowspan": "rowSpan"
                }
            },
            "allowed": {
                "attributes": ["colspan", "rowspan"]
            },
            "automation": {
                "postparse": (self) => {
                    let newArgs = {};

                    // Projde aktuální atributy
                    for (let argName in self.args) {
                        // Pokud je mezi nimi row- či colSpan
                        if (argName == "rowSpan" || argName == "colSpan") {
                            // S hodnotou 1 či menší (spíš pro jistotu)
                            if (self.args[argName] <= 1) {
                                // Bude se ignorovat
                                continue;
                            }
                        }

                        // Zbytek (rowSpany a colSpan s rozumnými hodnotami) si uložím
                        newArgs[argName] = self.args[argName];
                    }

                    self.args = newArgs;
                }
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
            },
            "automation": {
                "postparse": (self) => {
                    let newArgs = {};

                    // Projde aktuální atributy
                    for (let argName in self.args) {
                        // Pokud je mezi nimi row- či colSpan
                        if (argName == "rowSpan" || argName == "colSpan") {
                            // S hodnotou 1 či menší (spíš pro jistotu)
                            if (self.args[argName] <= 1) {
                                // Bude se ignorovat
                                continue;
                            }
                        }

                        // Zbytek (rowSpany a colSpan s rozumnými hodnotami) si uložím
                        newArgs[argName] = self.args[argName];
                    }

                    self.args = newArgs;
                }
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
                "postparse": (self) => {

                    // Z nějakého důvodu nelze, aby obrázek byl v tagu P. Pokud se to stane,
                    // odebere se tag P a místo něj se vloží samotný obrázek.
                    if (self.children.length == 1 && self.children[0].getTagName() == "ac:image") {
                        // Najdu sám sebe v rodičovi
                        let myIndex = self.parent.children.findIndex(c => c == self);

                        if (self.parent.tag in ["h1", "h2", "h3", "h4", "h5", "h6"]) {
                            throw "tu!!!";
                        }

                        // Nastavím obrázek jako potomka rodiče místo paragrafu
                        self.parent.children[myIndex] = self.children[0];
                        self.children[0].parent = self.parent;
                    }
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
                "attributes": (self) => {
                    // uu používá místo pomlčkou oddělených slov camelCase pro zápis
                    // jednotlivých CSS vlastností
                    let style_string = "style" in self.args ? self.args.style : "";

                    if (style_string.length == 0) {
                        return self.args;
                    }

                    self.args.style = style_string.replace(/-([a-z])/g, g => {
                        return g[1].toUpperCase();
                    });

                    return self.args;
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
        "br": {
            "automation": {
                "postparse": (self) => {
                    // Obsahuje rodič jen samé br tagy?
                    let onlyBreakTags = self.parent.children.every(c => c.getTagName() == "br");
                    if (onlyBreakTags) {
                        let parentOfParent = self.parent.parent;

                        if (self.parent.parent.tag in ["h1", "h2", "h3", "h4", "h5", "h6"]) {
                            throw "tu!!!";
                        }

                        // Odstraní rodiče <br/> tagů z jeho rodiče.
                        let indexInParent = parentOfParent.children.findIndex(c => c == self.parent);
                        if (indexInParent >= 0) {
                            parentOfParent.children.splice(indexInParent, 1);
                        }
                    }
                }
            }
        },
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
                "postparse": (self) => {
                    if ("name" in self.args) {
                        if (self.args.name == "code") {
                            let children = self.children.filter(c => c.getTagName() == "text");
                            self.children = [];

                            self.args["uu5string"] = stringify(`<uu5string/><UU5.Bricks.Code content="${children.map(c=>c.getOutput()).join('')}"/>`);
                            delete self.args.name;
                            return;
                        }

                        if (self.args.name == "details") {
                            // Najde v obsahu děti tagu <ac:rich-text-body>
                            let new_content = self.children.filter(c => c.getTagName() == "ac:rich-text-body")[0].children;

                            // Najde samo sebe v rodičovi
                            let indexInParent = self.parent.children.findIndex(c => c == self);

                            if (self.parent.tag in ["h1", "h2", "h3", "h4", "h5", "h6"]) {
                                throw "tu!!!";
                            }

                            // Rozdělím potomky rodiče na dvě. Před a po tomto tagu
                            let beforeMe = self.parent.children.slice(0, indexInParent);
                            let afterMe = self.parent.children.slice(indexInParent + 1);

                            // Přidám new_content do potomků rodiče tohoto tagu
                            self.parent.children = beforeMe.concat(new_content).concat(afterMe);
                            new_content.map(c => c.parent = self.parent);
                            return;
                        }
                    }

                    // Pokud jsme se dostal až sem, jen odstranim makro, jde na něco, co neznám.
                    let indexInParent = self.parent.children.findIndex(c => c == self);
                    self.parent.children.slice(indexInParent, 1);
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
                "attributes": (self) => {
                    let uu5string = self.children.map(c => c.getOutput()).join("");
                    self.args["uu5string"] = `<uu5string/>${uu5string}`;
                    return self.args;
                },
                "content": (self) => {
                    return "";
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
                "attributes": (self) => {
                    let title = "";

                    let page_link = self.children.filter(c => c.getTagName() == "ri:page");
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

                    self.args["page"] = page ? page : "PLACEHOLDER";

                    if (label) {
                        self.args["label"] = label;
                    }

                    if (fragment) {
                        self.args["fragment"] = fragment;
                    }

                    if (title.length) {
                        self.children = [];
                    }

                    return self.args;
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
                "tag": "UU5.Bricks.Span",
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
                "content": (self) => {
                    let uu5string = stringify(`<uu5string/><UU5.Bricks.Span style="backgroundColor: gray;">${self.args.id}</UU5.Bricks.Span>`);
                    console.log(uu5string);
                    return `Odkaz na uživatele s ID: <UU5.RichText.Block uu5string="${uu5string}" />`;
                },
                "postparse": (self) => {
                    // Kontrolováno
                    let parentOfParent = self.parent.parent;

                    if (self.parent.parent.tag in ["h1", "h2", "h3", "h4", "h5", "h6"]) {
                        throw "tu!!!";
                    }

                    let indexInParent = parentOfParent.children.findIndex(c => c == self.parent);
                    parentOfParent.children[indexInParent] = self;
                    self.parent = parentOfParent;
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
                "content": (self) => {
                    return self.args["datetime"];
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
                "attributes": (self) => {
                    let first_child = self.children.length != 0 ? self.children[0] : null;
                    let src = "";

                    if (first_child) {
                        src = "src" in first_child.args ? first_child.args["src"] : "";
                    }

                    let code = prompt(`Dialog: \u2776/\u2776\n\nV kódu byl nalezen odkaz na obrázek \u27A4${src}\u2B9C.\n\nZadejte kód v uuBook`);

                    self.args["code"] = code ? code : "PLACEHOLDER";
                    self.children = [];

                    return self.args;
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
            "hasEndTag": true,
            "replacements": {
                "tag": "UU5.Bricks.Link",
                "attributes": {}
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