import { parseJson } from "./json_parser";

function expect(actual: any, expected: any): void {
    if (actual !== expected) {
        console.log("Expected", expected);
        console.log("Actual", actual);
        console.log();
    }
}

expect(parseJson("null"), null);
expect(parseJson("false"), false);
expect(parseJson("true"), true);
expect(parseJson("12.5"), 12.5);
expect(parseJson('"Title"'), "Title");
expect(parseJson('"Patrick\'s \\"overwinning\\""'), 'Patrick\'s "overwinning"');
expect(parseJson("[]"), []);
expect(parseJson("{}"), {});

expect(
    parseJson(
        '{"name": "Patrick", "addresses": [{"type": "billing", "street": "Kerkstraat", "number": 1}, {"type": "shipping", "street": "Muntweg", "number": 8}]}',
    ),
    {
        name: "Patrick",
        addresses: [
            { type: "billing", street: "Kerkstraat", number: 1 },
            { type: "shipping", street: "Muntweg", number: 8 },
        ],
    },
);
