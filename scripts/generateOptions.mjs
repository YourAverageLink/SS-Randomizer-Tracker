// @ts-check

import { load } from 'js-yaml';
import fs from 'node:fs';

const baseFileUrl = (file) =>
    `https://raw.githubusercontent.com/ssrando/ssrando/main/${file}.yaml`;

const loadFileFromUrl = async (url) => {
    const response = await fetch(url);
    return response.text();
};

const loadFile = async (file) => {
    const fileUrl = baseFileUrl(file);
    const data = await loadFileFromUrl(fileUrl);
    return load(data);
};

/**
 * @typedef {import('../src/permalink/SettingsTypes').OptionDefs} OptionDefs 
 */

const data = /** @type OptionDefs */ (await loadFile('options'));
let output =
    '/**\n' +
    ' * DO NOT MANUALLY EDIT!\n' +
    ' * Automatically generated option types based on ssrando options.yaml\n' +
    ' * Run `npm run generate:options` to regenerate.\n' +
    ' */\n';
output += 'export interface GeneratedOptions {\n';
for (const option of data) {
    if (option.permalink === false) {
        continue;
    }
    let type;
    switch (option.type) {
        case 'boolean':
            type = 'boolean';
            break;
        case 'int':
            type = 'number';
            break;
        case 'singlechoice':
            if (option.choices?.length) {
                type = option.choices.map((s) => `'${s}'`).join(' | ');
            } else {
                type = 'string';
            }
            break;
        case 'multichoice':
            type = 'string[]';
            break;
        default:
            throw new Error('unknown option type');
    }
    output += `    /** ${option.name} */\n`;
    output += `    '${option.command}': ${type};\n`;
}
output += '}\n';
await fs.promises.writeFile('./src/permalink/GeneratedOptions.ts', output);
