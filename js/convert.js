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