## How to run the file

Install `tsx`

    npm install -g tsx

Compile and run the file

    tsx json_parser.ts

## Considerations

- Keep track of the last token that could be processed, because this tells you where the syntax error occurred
- Check for extra whitespace at a single location. Checking it everywhere it can occur makes is easy to forget a spot
