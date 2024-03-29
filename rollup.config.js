// see https://github.com/rozek/build-configuration-study

import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser'

export default {
  input: './src/reactive-scriptable-components.ts',
  output: [
    {
      file:     './dist/reactive-scriptable-components.js',
      format:    'umd', // builds for both Node.js and Browser
      name:      'RSC', // required for UMD modules
      globals: {
      	'javascript-interface-library':'JIL',
      	'htm':       'htm',
      	'htm/preact':'preact',
      	'hyperactiv':'hyperactiv'
      },
      noConflict:true,
      sourcemap: true,
      plugins: [terser({ format:{ comments:false, safari10:true } })],
    },{
      file:     './dist/reactive-scriptable-components.esm.js',
      format:   'esm',
      sourcemap:true,
    }
  ],
  plugins: [
    typescript(),
  ],
};