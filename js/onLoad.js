var convert = require("./convert");
var {
    config,
    defaultTagConfig
} = require("./config");
var beautify = require("js-beautify");
var ParserError = require("./parser_error");

/**
 * Vstupní brána do celé aplikace. Zde se registrují "listenery" pro
 * stisk tlačítka "Konvertovat" a následná konverze z vloženého HTML
 * na uuString.
 */

document.addEventListener("DOMContentLoaded", ev => {
    document.getElementById("convert").addEventListener("click", ev => {

        let output_string = "";
        let input = document.getElementById("input");
        let output = document.getElementById("output");
        try {
            // Převede HTML na uuString tagy
            output_string = convert(input.value, config, defaultTagConfig);

            // Skryju chyby od minule
            document.getElementById("error").style.display = "none";

            // Výstup "formátovaného" uuStringu
            output.value = /*beautify.html(*/ "<uu5string/>" + output_string
            /*, {
                indent_size: "4",
                indent_char: " ",
                max_preserve_newlines: "5",
                preserve_newlines: true,
                keep_array_indentation: false,
                break_chained_methods: false,
                indent_scripts: "normal",
                brace_style: "collapse",
                space_before_conditional: true,
                unescape_strings: false,
                jslint_happy: false,
                end_with_newline: false,
                wrap_line_length: "0",
                indent_inner_html: false,
                comma_first: false,
                e4x: false,
                indent_empty_lines: false
            });*/

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
    });
});