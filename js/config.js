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

                        // Najdu sám sebe v rodičovi
                        let myIndex = me.parent.children.find(c => c == me);
                        // Nastavím obrázek jako potomka rodiče hned za tímto paragrafem
                        me.parent.children = me.parent.children.splice(myIndex, 0, me.children[0]);
                        me.children[0].parent = me.parent;

                        me.children = [];
                        return "";
                    }

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