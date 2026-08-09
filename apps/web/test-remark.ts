import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const md = `Some text here
| Characteristic | Organic Chemistry | Inorganic Chemistry |
| :--- | :--- | :--- |
| **Core Definition** | Study of covalent carbon compounds (excluding oxides, carbonates, bicarbonates). | Study of all other elements and their compounds. |
| **Examples** | Alkanes ($CH_4$), alcohols ($C_2H_5OH$), carbohydrates. | Carbonates ($Na_2CO_3$), carbon dioxide ($CO_2$), metal salts. |`;

const html = ReactDOMServer.renderToString(
  React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm], children: md })
);

console.log("HTML:", html);
