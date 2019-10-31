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
            "skip": true
        },
        "span": {
            "hasEndTag": true,
            "skip": true
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
            }
        }
    }
};

module.exports = {
    config
};