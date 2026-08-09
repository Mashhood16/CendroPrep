import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function TestPage() {
    const md = `| Characteristic | Organic Chemistry | Inorganic Chemistry |
| :--- | :--- | :--- |
| **Core Definition** | Study of covalent carbon compounds (excluding oxides, carbonates, bicarbonates). | Study of all other elements and their compounds. |
| **Examples** | Alkanes ($CH_4$), alcohols ($C_2H_5OH$), carbohydrates. | Carbonates ($Na_2CO_3$), carbon dioxide ($CO_2$), metal salts. |`;

    return (
        <div>
            <h1>Test React Markdown</h1>
            <div id="test-output">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
            </div>
        </div>
    );
}
