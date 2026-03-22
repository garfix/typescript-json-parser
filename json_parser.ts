type Token = {
    ["type"]: string;
    ["value"]: string;
    ["line"]: number;
    ["col"]: number;
};

type anyScalarType = string | number | boolean | null;
type anyType = anyScalarType | anyType[] | anyObject;
interface anyObject extends Record<string, anyType> {}

interface TokenRule {
    type: string;
    pattern: RegExp;
}

export function createRegEx(rules: TokenRule[]) {
    return new RegExp(rules.map(({ type, pattern }) => `(?<${type}>${pattern.source})`).join("|"), "y");
}

function tokenize(input: string, regex: RegExp): Token[] {
    const tokens: Token[] = [];
    let line = 1;
    let lineStart = 0;

    regex.lastIndex = 0;
    while (regex.lastIndex < input.length) {
        const pos = regex.lastIndex;
        const match = regex.exec(input);

        if (!match) {
            throw new SyntaxError(`Unexpected character '${input[pos]}' at ${line}:${pos - lineStart + 1}`);
        }

        const type = Object.keys(match.groups!).find((k) => match.groups![k] !== undefined)!;

        tokens.push({ type, value: match[0], line, col: pos - lineStart + 1 });

        for (let i = 0; i < match[0].length; i++) {
            if (match[0][i] === "\n") {
                line++;
                lineStart = pos + i + 1;
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
    { type: "STRING", pattern: /"(?:[^"\\]|\\["\\\/bfnrt]|\\u[0-9a-fA-F]{4})*"/ },
    { type: "NUMBER", pattern: /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/ },
    { type: "TRUE", pattern: /true/ },
    { type: "FALSE", pattern: /false/ },
    { type: "NULL", pattern: /null/ },
]);

export function parseJson(json_string: string) {
    // avoid the need to check for trailing whitespace when the parse is complete
    const endTimmed = json_string.trimEnd();

    const tokens = tokenize(endTimmed, regex);

    const [value, newPos, ok] = parseValue(tokens, 0);
    if (!ok) {
        if (newPos < tokens.length) {
            const token = tokens[newPos];
            throw new SyntaxError(`Syntax error at ${token.line}:${token.col - 1}`);
        } else {
            throw new SyntaxError(`Missing structure at end of input`);
        }
    }
    return value;
}

function parseValue(tokens: Token[], pos: number): [anyType, number, boolean] {
    let value: anyType;
    let ok;

    let [token, newPos1] = parseToken(tokens, pos);
    if (token.type === "TRUE") {
        return [true, newPos1, true];
    } else if (token.type === "FALSE") {
        return [false, newPos1, true];
    } else if (token.type === "NULL") {
        return [null, newPos1, true];
    } else if (token.type === "STRING") {
        return [getStringValue(token.value), newPos1, true];
    } else if (token.type === "NUMBER") {
        return [parseFloat(token.value), newPos1, true];
    } else {
        let newPos2, newPos3;
        [value, newPos2, ok] = parseArray(tokens, pos);
        if (ok) {
            return [value, newPos2, true];
        }
        [value, newPos3, ok] = parseObject(tokens, pos);
        if (ok) {
            return [value, newPos3, true];
        }
        return [null, Math.max(newPos2, newPos3), false];
    }
}

function parseObject(tokens: Token[], pos: number): [Record<string, anyType>, number, boolean] {
    let value: anyType;
    let ok = false;

    const object: Record<string, anyType> = {};

    // {
    let [token, newPos] = parseToken(tokens, pos);
    if (token.type !== "CURLY_OPEN") {
        return [object, newPos, false];
    }
    pos = newPos;

    while (true) {
        // }
        [token, newPos] = parseToken(tokens, pos);
        if (token.type === "CURLY_CLOSE") {
            return [object, newPos, true];
        }

        // comma between entries (uses same token)
        else if (Object.keys(object).length > 0) {
            if (token.type !== "COMMA") {
                return [object, newPos, false];
            }
            pos = newPos;
        }

        // key must be a string
        [token, newPos] = parseToken(tokens, pos);
        if (token.type !== "STRING") {
            return [object, newPos, false];
        }
        const key: string = getStringValue(token.value);
        pos = newPos;

        // colon
        [token, newPos] = parseToken(tokens, pos);
        if (token.type !== "COLON") {
            return [object, newPos, false];
        }
        pos = newPos;

        // value
        [value, newPos, ok] = parseValue(tokens, pos);
        if (!ok) {
            return [object, newPos, false];
        }
        object[key] = value;
        pos = newPos;
    }
}

function parseArray(tokens: Token[], pos: number): [anyType[], number, boolean] {
    const array: anyType[] = [];
    let value: anyType;
    let ok;

    // [
    let [token, newPos] = parseToken(tokens, pos);
    if (token.type !== "SQUARED_OPEN") {
        return [array, newPos, false];
    }
    pos = newPos;

    while (true) {
        // ]
        [token, newPos] = parseToken(tokens, pos);
        if (token.type === "SQUARED_CLOSE") {
            return [array, newPos, true];
        }

        // comma check happens after first element (uses same token)
        if (array.length > 0) {
            if (token.type !== "COMMA") {
                return [array, newPos, false];
            }
            pos = newPos;
        }

        [value, newPos, ok] = parseValue(tokens, pos);
        if (!ok) {
            return [array, newPos, false];
        }
        array.push(value);
        pos = newPos;
    }
}

function getStringValue(raw: string) {
    // strip surrounding quotes
    const s = raw.slice(1, -1);

    return s.replace(/\\(["\\\/bfnrt])|\\u([0-9a-fA-F]{4})/g, (_, esc, hex) => {
        if (hex) return String.fromCharCode(parseInt(hex, 16));
        switch (esc) {
            case '"':
                return '"';
            case "\\":
                return "\\";
            case "/":
                return "/";
            case "b":
                return "\b";
            case "f":
                return "\f";
            case "n":
                return "\n";
            case "r":
                return "\r";
            case "t":
                return "\t";
            default:
                return esc; // unreachable given the regex, but satisfies TS
        }
    });
}

function parseToken(tokens: Token[], pos: number): [Token, number, boolean] {
    const newPos = pos + 1;

    // out of tokens?
    if (pos >= tokens.length) {
        // return a dummy token
        return [{ type: "", value: "", line: 0, col: 0 }, newPos, false];
    }

    // always just skip whitespace
    const token = tokens[pos];
    if (token.type === "WHITESPACE") {
        return parseToken(tokens, newPos);
    }

    return [token, newPos, true];
}
