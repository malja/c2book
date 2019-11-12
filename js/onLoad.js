var convert = require("./convert");
var {
    config,
    defaultTagConfig
} = require("./config");
var beautify = require("js-beautify");
var ParserError = require("./parser_error");

function showOutput() {
    let output_string = "";
    let input = document.getElementById("input");
    let output = document.getElementById("output");
    try {
        // Převede HTML na uuString tagy
        output_string = convert(input.value, config, defaultTagConfig);

        // Skryju chyby od minule
        document.getElementById("error").style.display = "none";

        // Výstup "formátovaného" uuStringu
        output.value = "<uu5string/>" + output_string
        output.focus();
        output.select();
        document.execCommand('copy');
    } catch (e) {
        if (e instanceof ParserError) {

            input.focus();
            input.setSelectionRange(e.position_start, e.position_end);

            document.getElementById("error_message").innerHTML = e.message;
            document.getElementById("error").style.display = "block";
        } else {
            document.getElementById("error_message").innerHTML = e;
            document.getElementById("error").style.display = "block";
            throw e;
        }
    }
}

/**
 * Vstupní brána do celé aplikace. Zde se registrují "listenery" pro
 * stisk tlačítka "Konvertovat" a následná konverze z vloženého HTML
 * na uuString.
 */
document.addEventListener("DOMContentLoaded", ev => {
    document.getElementById("convert").addEventListener("click", showOutput);
});