import { parseJson } from "./json_parser";

const json =
    '{"name": "Patrick", "addresses": [{"type": "billing", "street": "Callapad", "number": 4}, {"type": "shipping", "street": "Callapad", "number": 4}]}';

console.log(parseJson(json));
