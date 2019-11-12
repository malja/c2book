# c2book

Skript pro konverzi z HTML a speciálních tagů použivaných v systému [Confluence](https://www.atlassian.com/software/confluence) na 
uuTagy používané v interní aplikaci [uuBookKit](https://uuos9.plus4u.net/uu-bookkitg01-main/78462435-e3f5c648e85f4319bd8fc25ea5be6c2c/book).

Motivací byl převod dokumentace z Confluence do uuBook. Šlo o poměrně bolestivý a 
zdlouhavý proces, proto jsem se ho rozhodl alespoň částečně automatizovat.

# Použití

Otevřete soubor `index.html`. Do pole **Vstup** vložte HTML kód zkopírovaný z
Confluence (zde doporučuji editovat stránku, zobrazit její kód a následně
zkopírovat veškerý obsah).

Po kliknutí na tlačítko **Převést** se v poli **Výstup** zobrazi uuKód vhodný
pro vložení do uuBook. Kód je automaticky označen a zkopírován do schránky.

## Problémy s parsováním
Pokud při konverzi vznikne nějaká chyba, uživatel je upozorněn světle červeným
pruhem v horní části stránky. Obsahuje textové odůvodnění chyby. Zároveň by měla
být v poli **Vstup** zvýrazněna ta část, která chybu způsobila.

# Vývoj

Pro sestavení byly použity následující `npm` balíčky:

- [htmljs-parser](https://github.com/marko-js/htmljs-parser) - Pro parsování HTML vstupu do DOM reprezentace.
- [js-beautify](https://github.com/beautify-web/js-beautify) - Formátování výstupu.

Aktuálně je využíván pouze první jmenovaný balíček. Zjistil jsem totiž, že formátování výstupu
může občas způsobit při přenosu do uuBook chybu.

Po provedení změn v javascriptových souborech je nutné sestavit znovu soubor `main.js`
pomocí příkazu:

```
npm run build
```

## Jak to funguje?

1. Pomocí htmljs-parser je vložený HTML kód převeden do vlastní implementace DOM. Ta zajišťuje
potřebné metody pro následný export.
2. Po vytvoření DOM jsou spuštěny "automatizační" procesy. Jejich úkolem je provést dodatečné
"vyčistění" obsahu. 
3. Projde se DOM a sestaví se sekvence uuTagů podporovaných v aplikaci uuBookKit.

## Dokumentace
Pro `c2book` není jiná dokumentace, než komentáře ve zdrojovém kódu.

Pro uuTagy je možné čerpat z následujících zdrojů (je nutné být přihlášen):

- [uu5](https://uuos9.plus4u.net/uu-bookkitg01-main/78462435-ed11ec379073476db0aa295ad6c00178/book/page?code=components)
- [uuContentKit](https://uuos9.plus4u.net/uu-bookkitg01-main/78462435-7d75873f376146ec8b6bc2341009d8df/book/page?code=components)
- [uuBookKit](https://uuos9.plus4u.net/uu-bookkitg01-main/78462435-e3f5c648e85f4319bd8fc25ea5be6c2c/book/page?code=components)

# Aktuální stav
Konverze byla provedena. Exporter má stále určité chyby. Nicméně protože nemám pro skript 
aktuálně využití, nebude v budoucnu rozšiřován či upravován. Zde je k dispozici pouze pro
konzervaci kódu.
