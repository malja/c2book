var stringify = require("./tools").stringify;

class Document {
    constructor() {
        this.children = [];
        this.storage = {};
    }

    addChild(child) {
        this.children.push(child);
        child.parent = this;
    }

    getOutput() {
        console.log(this.children);
        let children_tags = [];

        for (let child of this.children) {
            children_tags.push(child.getOutput());
        }

        return children_tags.join("");
    }

    toString() {
        return this.getTagName();
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
        return this.children.map(c => c.getText()).join("");
    }

    getChildren() {
        return this.children;
    }

    runAutomation(which) {
        // Nutný tento for, protože je možné, že automatizace smaže některé potomky
        for (let childId = this.children.length - 1; childId >= 0; childId--) {
            this.children[childId].runAutomation(which);
        }

        // Pro každého potomka, který není tabulka, přidám všechny pod UU5.RichText
        for (let child of this.children) {
            if (!child.getTagName() in ["table", "h1", "h2", "h3", "h4", "h5", "h6", "ac:structured-macro"]) {
                child.setAsRichText();
            }
        }
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

        this.isRichText = false;
    }

    setAsRichText() {
        this.isRichText = true;
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
            normal_string = this.getOutput();
        }

        // Před první výskyt jakéhokoliv tagu vloží uustring
        return normal_string.replace("<", "<uu5string/><");
    }

    getOutput() {
        let tag_arguments = this.getArgumentsAsString();

        // Obsah tagu
        let tag_content = this.getContentAsString();

        let tag_opening = "<" + this.getUUTagName() + tag_arguments;

        let tag_end = this.hasEndTag ? ">" + tag_content + "</" + this.getUUTagName() + ">" : " />";

        let result = tag_opening + tag_end;

        if (this.isRichText) {
            let finalResult = `<UU5.RichText.Block uu5string="${stringify(result)}" />`;
            result = finalResult;
        }

        return result;
    }

    toString() {
        return this.getTagName();
    }

    getArgumentsAsString() {
        let args = [];

        // Argumenty
        if (this.automation && this.automation.attributes) {
            this.args = this.automation.attributes(this);
        }

        for (let key of Object.keys(this.args)) {
            if (this.args.hasOwnProperty(key)) {
                args.push(`${key}="${ stringify(this.args[key]) }"`);
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

            for (let child of this.children) {
                children_tags.push(child.getOutput());
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

    runAutomation(which) {
        if (this.automation && which in this.automation) {
            this.automation[which](this);
        }

        // Je třeba použít tento for, protože je možné, že během automatizace budou některé tagy smazány
        for (let childId = this.children.length - 1; childId >= 0; childId--) {
            this.children[childId].runAutomation(which);
        }
    }

    getText() {
        return this.children.map(c => c.getText()).join("");
    }
}

class TableElement extends Element {

    getOutput() {
        let isSimpleTable = true;

        // Pro tabulku bez row a col span jde použít bookkit tabulku, jinak uu5 tabulku
        for (let x in this.children) {
            let row = this.children[x];

            for (let y in row.children) {
                let cell = row.children[y];

                // Už je po záměně argumentů, takže musím kontrolovat uu-atributy.
                let found = cell.hasArgument("rowSpan") || cell.hasArgument("colSpan");
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
        return super.getOutput();
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
                        data[dataIndex].push(elem.getOutput());
                    }
                }
            }
        }

        let output = `<UuContentKit.Tables.Table ${(rowHeader ? "rowHeader " : "") + (columnHeader ? "columnHeader " : "")} data="${ stringify("<uu5json/>" + stringify(data)) }"/>`;
        return output;
    }
}

class TextElement {
    constructor(text) {
        this.text = text;
        this.parent = null;

        this.isRichText = false;
    }

    setAsRichText() {
        this.isRichText = true;
    }

    hasArgument(arg) {
        return false;
    }

    getOutput() {
        let indexInParent = this.parent.children.findIndex(c => c == this);
        // Pokud není první potomek předka, vloží před text mezeru
        // Pokud není poslední potomek předka, vloží za text mezeru

        let result = (indexInParent == 0 ? "" : " ") + this.text + (indexInParent == this.parent.children.length - 1 ? "" : " ");

        if (this.isRichText) {
            let finalResult = `<UU5.RichText.Block uu5string="${stringify(result)}" />`;
            result = finalResult;
        }

        return result;
    }

    toString() {
        let tmp = this.isRichText;
        this.isRichText = false;
        let text = this.getOutput();
        this.isRichText = tmp;
        return text;
    }

    getTagName() {
        return "text";
    }

    getChildren() {
        return [];
    }

    getText() {
        return this.text;
    }

    runAutomation(which) {
        return;
    }
}

module.exports = {
    TextElement,
    Element,
    TableElement,
    Document
};