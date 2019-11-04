var customDom = require("./custom_dom");

class Menu {
    constructor() {
        this.parent = null;
        this.children = [];
        this.current_item = null;
        this.level = -1;
    }

    addItem(text, link, level) {
        let item = new MenuItem(text, link, level);

        // První prvek
        if (this.current_item == null) {
            this.current_item = item;
            item.parent = this;
            this.children.push(item);

            return;
        }

        // Už existuje prvek a má nižší level, než ten aktuální
        if (this.current_item.level < item.level) {
            this.current_item.children.push(item);
            item.parent = this.current_item;
            this.current_item = item;

            return;
        }

        // Už existuje prvek, který ale má vyšší level, než ten aktuální
        let right_position = this.current_item;
        while (right_position.level >= item.level) {
            // Má rodiče, přejdu o úroveň výš
            if (right_position.parent) {
                right_position = right_position.parent;
                continue;
            } else {
                break;
            }
        }

        item.parent = right_position;
        right_position.children.push(item);
        this.current_item = item;

    }

    toString() {
        let data = this.children.map(child => child.toString()).join("");
        let output = `<UU5.Bricks.Section header=\"Obsah\" level=\"1\"><UU5.RichText.Block uu5string=\"<uu5string/><UU5.Bricks.Ul>${data}</UU5.Bricks.Ul>\"/></UU5.Bricks.Section>`;
        return output;
    }
}

class MenuItem {
    constructor(text, link, level) {
        this.parent = null;
        this.children = [];
        this.text = text;
        this.link = link;
        this.level = level;
    }

    toString() {
        let data = this.children.map(child => child.toString());
        let output = `<UU5.Bricks.Li><UuBookKit.Bricks.GoToPageLink label=\'${this.text}\' fragment=\'${this.link}\'/> ${ data.length != 0 ? "<UU5.Bricks.Ul>" + data.join("") + "</UU5.Bricks.Ul>" : ""}</UU5.Bricks.Li>`;
        return output;
    }
}

function findTitles(element) {
    let titles = [];

    for (let child of element.getChildren()) {
        if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(child.getTagName())) {
            titles.push(child);
        }

        titles = titles.concat(findTitles(child));
    }

    return titles;
}

/**
 * Rozšíření standardní funkce, které z nadpisů v HTML kódu vytvoří obsah
 * dané stránky.
 * Poznámka: Bere v potaz jen h<1-6> tagy v kořenu HTML, nikoliv ty vnořené.
 */
function menuBuilder(dom, config) {
    // Vybere všechny nadpisy
    let title_elements = findTitles(dom);

    let menu = new Menu();

    for (let title of title_elements) {

        menu.addItem(
            title.args.header,
            title.args.id,
            title.args.level
        );
    }

    if (menu.children.length == 0) {
        return "";
    }

    return menu.toString();
}

module.exports = menuBuilder;