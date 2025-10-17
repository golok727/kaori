import { KaoriCompiler } from '../babel-plugin';
import babel from '@babel/core';

export async function compile(jsxCode: string) {
  const result = await babel.transformAsync(jsxCode, {
    plugins: [['@babel/plugin-syntax-jsx'], [KaoriCompiler]],
    parserOpts: {
      plugins: ['jsx', 'typescript'],
    },
  });
  return result?.code || '';
}
