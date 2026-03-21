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
    { type: "STRING", pattern: /"(?:[^"\\]|\\.)*"/ },
    { type: "NUMBER", pattern: /\d+(?:\.\d+)?/ },
    { type: "TRUE", pattern: /true/ },
    { type: "FALSE", pattern: /false/ },
    { type: "NULL", pattern: /null/ },
]);

export function parseJson(json_string: string) {
    const tokens = tokenize(json_string.trimEnd(), regex);

    const [value, newPos] = parseValue(tokens, 0);
    if (newPos < tokens.length) {
        const token = tokens[newPos];
        throw new SyntaxError(`Unexpected character on line ${token.line} on position ${token.col}`);
    }
    return value;
}

function parseValue(tokens: Token[], pos: number): [anyType, number] {
    let [token, newPos] = parseToken(tokens, pos);
    if (token.type === "TRUE") {
        return [true, newPos];
    } else if (token.type === "FALSE") {
        return [false, newPos];
    } else if (token.type === "NULL") {
        return [null, newPos];
    } else if (token.type === "STRING") {
        return [token.value.substring(1, -1).replace('\\"', '"'), newPos];
    } else if (token.type === "NUMBER") {
        return [parseFloat(token.value), newPos];
    } else {
        let array: anyType[] | null;
        [array, newPos] = parseArray(tokens, pos);
        if (array !== null) {
            return [array, newPos];
        }

        let object: Record<string, anyType> | null;
        [object, newPos] = parseObject(tokens, pos);
        if (object !== null) {
            return [object, newPos];
        }
    }

    return [null, pos];
}

function parseObject(tokens: Token[], pos: number): [Record<string, anyType> | null, number] {
    let [token, newPos] = parseToken(tokens, pos);
    if (token.type !== "CURLY_OPEN") {
        return [null, pos];
    }
    pos = newPos;

    const object: Record<string, anyType> = {};

    while (true) {
        [token, newPos] = parseToken(tokens, pos);

        if (token.type === "CURLY_CLOSE") {
            return [object, newPos];
        }

        // comma between entries
        if (Object.keys(object).length > 0) {
            if (token.type !== "COMMA") {
                return [null, pos];
            }
            pos = newPos;
            [token, newPos] = parseToken(tokens, pos);
        }

        // key must be a string
        if (token.type !== "STRING") {
            return [null, pos];
        }
        const key: string = JSON.parse(token.value);
        pos = newPos;

        // colon
        [token, newPos] = parseToken(tokens, pos);
        if (token.type !== "COLON") {
            return [null, pos];
        }
        pos = newPos;

        // value
        let value: anyType;
        [value, newPos] = parseValue(tokens, pos);
        pos = newPos;

        object[key] = value;
    }
}

function parseArray(tokens: Token[], pos: number): [anyType[] | null, number] {
    let [token, newPos] = parseToken(tokens, pos);
    if (token.type !== "SQUARED_OPEN") {
        return [null, pos];
    }
    pos = newPos;

    const array: anyType[] = [];

    while (true) {
        [token, newPos] = parseToken(tokens, pos);

        if (token.type === "SQUARED_CLOSE") {
            // FIX: return the populated array, not null
            return [array, newPos];
        }

        // comma check happens after first element
        if (array.length > 0) {
            if (token.type !== "COMMA") {
                return [null, pos];
            }
            pos = newPos;
        }

        let value: anyType;
        [value, newPos] = parseValue(tokens, pos);
        if (value !== null) {
            pos = newPos;
            array.push(value);
        } else {
            return [null, pos];
        }
    }
}

function parseToken(tokens: Token[], pos: number): [Token, number] {
    // out of tokens?
    if (pos >= tokens.length) {
        // return the NONE token for simpler result checking
        return [{ type: "NONE", value: "", line: -1, col: -1 }, pos];
    }

    // always just skip whitespace
    const token = tokens[pos];
    if (token.type === "WHITESPACE") {
        return parseToken(tokens, pos + 1);
    }

    return [token, pos + 1];
}
