var generateId = require("./generateId").generateId;

let headerReplacement = {
    "hasEndTag": true,
    "replacements": {
        "tag": "UU5.Bricks.Section"
    },
    "automation": {
        "attributes": (me) => {
            let args = me.args;
            // Vezme obsah tagu h<1-6> a vloží ho do argumentu header.
            // Pokud jde jen o text, vloží se text jako takový.
            // Pokud jde o více tagu, přihodí se ještě <uu5string/> před samotný kód
            args["header"] = (me.children.length == 1 && me.children[0].getTagName() == "text" ? "" : "<uu5string/>" ) + me.children.map(c => c.toString()).join("");
            args["id"] = generateId();
            args["level"] = parseInt(me.getTagName().substr(-1));
            return args;
        },
        "content": (me) => {
            me.children = [];   // Všechny děti jsou v argumentu header

            let siblings = me.parent.children.slice(me.parent.children.findIndex(e => e == me)+1);

            for(let sibling of siblings) {
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

            return children_tags.join("");
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
                "tag": "UU5.Bricks.Code"
            },
            "allowed": {
                "attributes": []
            }
        },
        "p": {
            "hasEndTag": true,
            "replacements": {
                "tag": "UU5.Bricks.P"
            },
            "allowed": {
                "attributes": []
            }
        },
        "span": {
            "hasEndTag": true,
            "skip": true,
            "allowed": {
                "attributes": []
            }
        },
        "strong": {
            "hasEndTag": true,
            "replacements": {
                "tag": "UU5.Bricks.Div"
            },
            "automation": {
                "content": (me) => {
                    let parts = [];
                    for (let child of me.children) {
                        parts.push(child.toString());
                    }

                    let content = "<strong>{$content$}</strong>".replace("{$content$}", parts.join(""));
                    return content;
                }
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
            "skip": true,
            "allowed": {
                "attributes": []
            }
        }
    }
};

module.exports = {
    config
};