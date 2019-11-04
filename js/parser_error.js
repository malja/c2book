class ParserError {
    constructor(message, position_start, position_end) {
        this.message = message;
        this.position_start = position_start;
        this.position_end = position_end;
    }
}

module.exports = ParserError;