import { parseJson } from "./json_parser";

const json =
    '{"name": "Patrick", "addresses": [{"type": "billing", "street": "Callapad", "number": 4}, {"type": "shipping", "street": "Callapad", "number": 4}]}';

const json2 = '1 "abc"';
console.log(parseJson(json2));
