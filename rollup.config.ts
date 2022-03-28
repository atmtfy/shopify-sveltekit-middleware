import typescript from "@rollup/plugin-typescript";
import {nodeResolve} from "@rollup/plugin-node-resolve"
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: ["src/main.ts", "src/node.ts"],
  // preserveSymlinks: true,
  output: [
  {
    dir: "dist",
    exports: 'auto',
    entryFileNames: '[name].cjs',
    format: 'cjs',
    sourcemap: true
  },
    {
    dir: "dist/",
    format: 'es',
    sourcemap: true,
  },
],
  plugins: [
    json({include: /node_modules/}),
    typescript({
      outputToFilesystem: true,
    }),
    nodeResolve({ preferBuiltins:true, browser: false}),
    commonjs({
      include: /node_modules/,
      // include: ['tr46'],
    }
    ),
  ]

}