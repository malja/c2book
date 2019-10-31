var customDom = require("./custom_dom");
var htmljs_parser = require("htmljs-parser");

/**
 * Převede HTMl z confluence do uuString-ů.
 * @param {string} html Řetězec s HTML kódem z confluence.
 * @param {object} config Konfigurační objekt.
 */
function convert(html, config) {
    let dom = parseHtmlToCustomDom(html, config);

    // Mám přidat menu?
    if (config.addContentIndex) {
        let menu_doc = new customDom.Document();
        let current_element = menu_doc.createElement("ul", config.replacements.ul);

        let menu_items = ["h1", "h2", "h3", "h4", "h5", "h6"].map(name => dom.getChildrenByTagName(name));

        for (let menu_item of menu_items) {

        }
    }

    return menu + dom.toString();
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
                    throw "Tag: <strong>" + originalTagName + "</strong> není v konfiguraci povolen.";
                }
            }
        },

        onCloseTag: (event) => {

            // console.log("closing tag: " + event.tagName);

            if (currentTag.getTagName() == "document") {
                console.error("Leaving document!");
                throw "Při parsování se vyskytla chyba";
            } else {
                if (event.tagName in replacements) {
                    let replInfo = replacements[event.tagName];
                    if (!replInfo.skip) {
                        currentTag = currentTag.getParent();
                    }
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
        }
    });

    html = html.replace(/(\r\n|\n|\r)/gm, "");
    parser.parse(html);

    return doc;
}

module.exports = {
    convert
};