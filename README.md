# JavaScript Lexical Analyzer

## Overview

This repository contains a simple Lexical Analyzer implemented in JavaScript for JavaScript code. The purpose of this tool is to break down the input JavaScript code into individual tokens, providing a foundational step in the process of building a compiler or interpreter.

Additionally, the project includes HTML and CSS components for a user-friendly interface to visualize the output of the Lexical Analyzer.

## Features

- **Lexical Tokenization**: The analyzer breaks down the input JavaScript code into tokens, such as keywords, identifiers, literals, and operators.

- **Configurable**: Easily configure the analyzer to include or exclude specific types of tokens based on your needs.

- **Output Formatting**: The tool produces a structured output, making it easier to understand and work with the generated tokens.

- **User Interface**: The project includes HTML and CSS components for a table-based interface to display the token information.

## Getting Started

Follow these steps to use the JavaScript Lexical Analyzer in your project:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/pardis-mdd/lexical-analyzer.git
   ```

2. **Include the Analyzer and UI files:**
   - Copy the `lexicalAnalyzer.js`, `index.html`, and `styles.css` files into your project.
   - Include the files in your HTML file.
     ```html
     <script src="path/to/lexicalAnalyzer.js"></script>
     <link rel="stylesheet" type="text/css" href="path/to/styles.css">
     ```


## Token Types

The Lexical Analyzer recognizes the following token types:

- `Keyword`
- `Identifier`
- `Literal`
- `Operator`
- `Punctuation`

## output columns

The output table is designed to present the analyzed tokens in a clear and organized manner. It includes the following columns:

1. `Type`
2. `Value`
3. `Line`
4. `Index`
5. `Block`

