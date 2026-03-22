import { parseJson } from "./json_parser";

export function expect(actual: any, expected: any): void {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        console.log("Expected: ", expected);
        console.log("Actual:   ", actual);
        console.log();
    }
}

export function expectError(actual: any, expected: any): void {
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
