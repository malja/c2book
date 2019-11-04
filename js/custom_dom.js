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