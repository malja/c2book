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
        for (let child of this.children) {
            children_tags.push(child.toString());
        }

        return children_tags.join("");
    }

    getTagName() {
        return "document";
    }

    createElement(originalTagName, replInfo) {
        if (originalTagName == "table") {
            return new TableElement();
        } else {
            return new Element(originalTagName, replInfo.replacements.tag, replInfo.hasEndTag, replInfo.automation);
        }
    }

    getChildrenByTagName(name) {
        return this.children.filter((child) => child.getTagName() == name);
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
            return this.automation.attributes(this);
        }

        for (let key in this.args) {
            if (this.args.hasOwnProperty(key)) {
                args.push(key + '="' + this.args[key] + '"');
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
                children_tags.push(child.toString());
            }

            content = children_tags.join("");
        }

        return content;
    }

    // TODO: GetuuTagName
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
        for (let child of this.children) {
            let found = child.hasArgument("rowSpan") || child.hasArgument("colSpan");
            if (found) {
                isSimpleTable = false;
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

        let output = "<UuContentKit.Tables.Table {$header$} data='<uu5json/>{$data$}'/>";

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
                        // Pro potřeby 
                        data[dataIndex].push(elem.toUUString());
                    } else {
                        data[dataIndex].push(elem.toString());
                    }
                }
            }
        }

        return output.replace("{$header$}", (rowHeader ? " rowHeader " : "") + (columnHeader ? " columnHeader " : "")).replace("{$data$}", JSON.stringify(data));
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
}

module.exports = {
    TextElement,
    Element,
    TableElement,
    Document
};