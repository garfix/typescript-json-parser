import { expect, expectError } from "./helper";
import { parseJson } from "./json_parser";

expect(parseJson("null"), null);
expect(parseJson("false"), false);
expect(parseJson("true"), true);
expect(parseJson("12.5"), 12.5);
expect(parseJson("-1.5E-3"), -0.0015);
expect(parseJson('"Title"'), "Title");
expect(parseJson('"Patrick\'s\\n \\"overwinning\\""'), 'Patrick\'s\n "overwinning"');
expect(parseJson("[]"), []);
expect(parseJson("[[[]]]"), [[[]]]);
expect(parseJson("{}"), {});
expect(parseJson('{"a": {"b": {"c": [{"d": true}]}}}'), { a: { b: { c: [{ d: true }] } } });
expect(parseJson('{"name": "Patrick", "age": 56, "married": true, "CoC-code": null}'), {
    name: "Patrick",
    age: 56,
    married: true,
    "CoC-code": null,
});
expect(parseJson('[1, "2", null, false, 3]'), [1, "2", null, false, 3]);

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
expectError(compound4, "Missing structure at end of input");
