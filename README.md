## Introduction

A JSON parser, written in Typescript. Meant as an example of how to write a parser for a formal language.

## How to run the file

Install `tsx`

    npm install -g tsx

Compile and run the demo file

    tsx demo.ts

## Considerations

For a visual display of the structure of JSON see Douglas Crockford's [website on JSON](https://www.json.org/)

Tokenization

- The order of the token types is relevant, as they are concatenated into a regular expression.

Parsing

- Keep track of the last token that could be processed, because this tells you where the syntax error occurred
- Check for extra whitespace at a single location. Checking it everywhere it can occur makes is easy to forget a spot
- consider trailing whitespace
