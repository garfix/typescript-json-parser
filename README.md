## Introduction

A JSON parser, written in Typescript. Meant as an example of how to write a parser for a formal language.

## How to run the file

Install `tsx`

    npm install -g tsx

Compile and run the test file

    tsx test.ts

## Considerations

For a visual display of the structure of JSON see Douglas Crockford's [website on JSON](https://www.json.org/)

Tokenization

- The order of the token types is relevant, as they are concatenated into a regular expression.

Parsing

- Keep track of the last token that could be processed, because this tells you where the syntax error occurred
- Check for extra whitespace at a single location. Checking it everywhere it can occur makes is easy to forget a spot
- Consider trailing whitespace
- Write unit tests before and while developing the parser, to ensure it keeps working as expected
- Use early returns

## Todo

- create good error messages
- describe the main way of doing things, and stick to it
