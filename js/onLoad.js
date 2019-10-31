var convert = require("./convert").convert;
var config = require("./config").config;
var beautify = require("js-beautify");

document.addEventListener("DOMContentLoaded", ev => {
    document.getElementById("convert").addEventListener("click", ev => {

        try {
            // Výstup uu string
            document.getElementById("output").value = beautify.html("<uu5string/>" + convert(document.getElementById("input").value, config), {
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
            });
        } catch (e) {
            console.log(e);
            document.getElementById("error_message").innerHTML = e;
            document.getElementById("error").style.display = "block";
        }
    });
});