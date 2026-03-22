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

## Tokenization

- Before parsing, split the input into tokens
- The order of the token types is relevant, as they are concatenated into a regular expression.

Each token holds the following fields:

- an identifier
- the source text
- the line number in the source text
- the column of the start within the line

## Whitespace

For a language, like JSON that allows whitespace between any two tokens, it's a good idea to skip whitespace whenever the next token is requested. You won't need to check the whitespace everywhere.

## Error reporting

Each parse function returns a `newPos`, which holds the index of the last token that was tried, whether successfully or not. When multiple language structures are tried in the same function, return the highest `newPos` that was found. This is needed to provide a proper error message.

Each parse function returns `ok` to signal that the parse of the structure succeeded. In a language

When the parse is finished, `newPos` should be the same as the number of tokens.

- Write unit tests before and while developing the parser, to ensure it keeps working as expected
- Use early returns

## Todo

- describe the main way of doing things, and stick to it
- full JSON coverage
