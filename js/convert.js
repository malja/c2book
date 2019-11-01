var customDom = require("./custom_dom");
var htmljs_parser = require("htmljs-parser");
var menuBuilder = require("./menu_builder").menuBuilder;
var ParserError = require("./parser_error").ParserError;

/**
 * Převede HTMl z confluence do uuString-ů.
 * @param {string} html Řetězec s HTML kódem z confluence.
 * @param {object} config Konfigurační objekt.
 */
function convert(html, config) {
    let dom = parseHtmlToCustomDom(html, config);

    // Tím že volám toString zajistím, že se provedou automatizace před tím, než budu dělat menu
    let content = dom.toString();
    
    // Mám přidat menu?
    if (config.addContentIndex) {
        content = menuBuilder(dom, config) + content;
    }

    return content;
}

function parseHtmlToCustomDom(html, config) {
    let doc = new customDom.Document();
    let currentTag = doc;
    let replacements = config.replacements;

    let parser = htmljs_parser.createParser({
        onOpenTag: (event) => {
            let originalTagName = event.tagName; // Jméno tagu
            let originalAttributes = event.attributes; // Argumenty

            if (originalTagName in replacements) {
                let replInfo = replacements[originalTagName];

                if (replInfo.skip) {
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

            if (event.tagName in replacements) {
                let replInfo = replacements[event.tagName];
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
        onError: (event) => {
            throw new ParserError(event.message, event.pos, event.endPos);
        }
    });

    parser.parse(html);

    return doc
}

module.exports = {
    convert
};