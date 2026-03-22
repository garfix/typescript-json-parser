## Introduction

A JSON parser, written in Typescript.

The code is meant as an example of how to write a parser for a formal language, including error handling.

## How to run the file

Install `tsx`

    npm install -g tsx

Compile and run the test file

    tsx test.ts

## Language structure

For a visual display of the structure of JSON see Douglas Crockford's [website on JSON](https://www.json.org/)

A formal language can be specified in [Backus-Naur form](https://en.wikipedia.org/wiki/Backus%E2%80%93Naur_form). It's useful, but not necessary to have such a specification when writing a parser by hand.

It's possible to generate a parser for a language using it's Backus-Naur spec, using a [compiler-compiler](https://en.wikipedia.org/wiki/Compiler-compiler), but many major languages use hand-written parsers for their flexibility and speed short-cuts.

## Tokenization

- Before parsing, split the input into tokens - it simplifies and speeds up the parsing process
- The order of the token types is relevant, as they are concatenated into a regular expression.

Each token holds the following fields:

- an identifier
- the source text
- the line number in the source text
- the column of the start within the line

## Whitespace

For a language, like JSON that allows whitespace between any two tokens, it's a good idea to skip whitespace whenever the next token is requested. You won't need to check the whitespace everywhere.

Trailing whitespace can be safely trimmed, as it doesn't hold any information, and it relieves you from checking for whitespace at the end. The last position after the parse is then simply equal to the length of the input.

## Error reporting

When the parser is used in an application, your user doesn't just want to know when a parse failed, but also where it failed.

Each parse function returns a `newPos`, which holds the index of the last token that was tried, whether successfully or not. When multiple language structures are tried in the same function, return the highest `newPos` that was found. The code uses `Math.max(newPos2, newPos3)` for this purpose. This is needed to provide a proper error message.

Each parse function returns `ok` to signal that the parse of the structure succeeded. In a language

## Uniformity

Formulate the canonical form of parsing any structure, and stick to it.

The form chosen here is given with an example:

```ts
// parse the next element
[token, newPos] = parseToken(tokens, pos);
// early return when fail
if (token.type !== "STRING") {
    // make sure to return newPos (not pos)
    return [object, newPos, false];
}
// include the element into the current structure
const key: string = getStringValue(token.value);
// update the current position
pos = newPos;
```

There will be exceptions to the rule, but when implementing a complex language, it's important to create a basic form that can be reused and reused.

## Testing

Write unit tests before and while developing the parser, to ensure it keeps working as expected. Mainly test edge cases. It will allow you to refactor the parser with confidence.
