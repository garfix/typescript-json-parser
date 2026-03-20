type Token = { ["type"]: string; ["value"]: string; ["line"]: number; ["col"]: number };

type allScalarTypes = string | number | boolean | null;

interface TokenRule {
    type: string;
    pattern: RegExp;
}

export function createRegEx(rules: TokenRule[]) {
    const regex = new RegExp(rules.map(({ type, pattern }) => `(?<${type}>${pattern.source})`).join("|"), "y");

    console.log(rules.map(({ type, pattern }) => `(?<${type}>${pattern.source})`).join("|"));

    return regex;
}

function tokenize(input: string, regex: RegExp): Token[] {
    const tokens: Token[] = [];
    regex.lastIndex = 0;
    let line = 1;
    let lineStart = 0;

    while (regex.lastIndex < input.length) {
        const pos = regex.lastIndex;
        const match = regex.exec(input);

        if (!match) {
            throw new SyntaxError(`Unexpected character '${input[pos]}' at ${line}:${pos - lineStart + 1}`);
        }

        const type = Object.keys(match.groups!).find((k) => match.groups![k] !== undefined)!;

        tokens.push({ type, value: match[0], line, col: pos - lineStart + 1 });

        // advance line/col tracking over the matched value
        for (const ch of match[0]) {
            if (ch === "\n") {
                line++;
                lineStart = regex.lastIndex - (match[0].length - (match[0].indexOf(ch) + 1));
            }
        }
    }

    return tokens;
}

const regex = createRegEx([
    { type: "WHITESPACE", pattern: /\s+/ },
    { type: "CURLY_OPEN", pattern: /\{/ },
    { type: "CURLY_CLOSE", pattern: /\}/ },
    { type: "SQUARED_OPEN", pattern: /\[/ },
    { type: "SQUARED_CLOSE", pattern: /\]/ },
    { type: "COLON", pattern: /:/ },
    { type: "COMMA", pattern: /,/ },
    { type: "STRING", pattern: /"(?:[^"\\]|\\.)*"/ },
    { type: "NUMBER", pattern: /\d+(?:\.\d+)?/ },
    { type: "TRUE", pattern: /true/ },
    { type: "FALSE", pattern: /false/ },
    { type: "NULL", pattern: /null/ },
]);

export function parseJson(json_string: string) {
    const tokens = tokenize(json_string.trim(), regex);

    const [value, newPos] = parseValue(tokens, 0);
    if (newPos < tokens.length) {
        const token = tokens[newPos];
        throw new SyntaxError(`Unexpected character on line ${token.line} on position ${token.col}`);
    }
    return value;
}

function parseValue(tokens: Token[], pos: number): string | number | boolean | null | allScalarTypes[] {
    const [token, newPos] = parseToken(tokens, pos);
    if (token.type === "TRUE") {
        return [true, newPos];
    } else if (token.type === "FALSE") {
        return [false, newPos];
    } else if (token.type === "NULL") {
        return [null, newPos];
    } else if (token.type === "STRING") {
        return [token.value, newPos];
    } else if (token.type === "NUMBER") {
        return [parseFloat(token.value), newPos];
    } else {
        const [array, newPos] = parseArray(tokens, pos);
        if (newPos !== null) {
            return array;
        }
    }

    return [null, pos];
}

function parseArray(tokens: Token[], pos: number): allScalarTypes[] {
    const array = [];
    let value;
    let [token, newPos] = parseToken(tokens, pos);
    if (token.type === "SQUARED_OPEN") {
        pos = newPos;
        while (true) {
            [token, newPos] = parseToken(tokens, pos);
            if (token.type === "SQUARED_CLOSE") {
                pos = newPos;
                break;
            }

            if (array.length > 0) {
                [token, newPos] = parseToken(tokens, pos);
                if (token.type === "COMMA") {
                    pos = newPos;
                } else {
                    return [null, pos];
                }
            }

            [value, newPos] = parseValue(tokens, pos);
            if (value !== null) {
                pos = newPos;
                array.push(value);
            } else {
                return [null, pos];
            }
        }
    }

    return [null, pos];
}

function parseToken(tokens: Token[], pos: number): [Token, number] {
    if (pos >= tokens.length) {
        return [{ type: "NONE", value: "", line: -1, col: -1 }, pos];
    }

    const token = tokens[pos];
    if (token.type === "WHITESPACE") {
        return parseToken(tokens, pos + 1);
    }

    return [token, pos + 1];
}
