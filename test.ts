import { parseJson } from "./json_parser";

function expect(actual: any, expected: any): void {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        console.log("Expected: ", expected);
        console.log("Actual:   ", actual);
        console.log();
    }
}

function expectError(actual: any, expected: any): void {
    let exc;
    try {
        parseJson(actual);
    } catch (e) {
        if (e instanceof Error) {
            exc = e.message;
        }
    }
    expect(exc, expected);
}

expect(parseJson("null"), null);
expect(parseJson("false"), false);
expect(parseJson("true"), true);
expect(parseJson("12.5"), 12.5);
expect(parseJson('"Title"'), "Title");
expect(parseJson('"Patrick\'s \\"overwinning\\""'), 'Patrick\'s "overwinning"');
expect(parseJson("[]"), []);
expect(parseJson("{}"), {});

const compound1 =
    '{\n"name": "Patrick",\n"addresses":\n[\n{"type": "billing", "street": "Kerkstraat", "number": 1},\n{"type": "shipping", "street": "Muntweg", "number"; 8}]}';

const compound2 =
    '{\n"name": "Patrick",\n"addresses":\n[\n{"type": "billing", "street": "Kerkstraat", "number": 1},\n{"type": "shipping", "street": "Muntweg", "number": 8}]}';

const compound3 =
    '{\n"name": "Patrick",\n"addresses":\n[\n{"type": "billing", "street": "Kerkstraat", "number": 1},\n{"type", "street": "Muntweg", "number": 8}]}';

const compound4 = '{\n"name": "Patrick",\n"addresses":\n[\n{"type": "billing"';

expect(parseJson(compound2), {
    name: "Patrick",
    addresses: [
        { type: "billing", street: "Kerkstraat", number: 1 },
        { type: "shipping", street: "Muntweg", number: 8 },
    ],
});

expectError(compound1, "Unexpected character ';' at 6:51");
expectError(compound3, "Syntax error at 6:8");
