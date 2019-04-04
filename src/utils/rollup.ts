import { rollup, RollupOptions, OutputOptions, Plugin } from 'rollup';
import { terser } from 'rollup-plugin-terser';
import * as jetpack from 'fs-jetpack';
import { join } from 'path';

import { ImportMap } from './importmaps';
import { AirdropOptions } from './airdrop';

export async function genererateBundle(packagePath: string, importmap: ImportMap, options: AirdropOptions): Promise<string> {
    const outputOptions: OutputOptions = {
      format: 'esm' as 'esm',
      sourcemap: true,
      exports: 'named' as 'named',
      chunkFileNames: 'common/[name]-[hash].js'
    };
  
    const inputOptions: RollupOptions = {
      input: [packagePath],
      plugins: [
        airdropResolverPlugin(importmap, options),
        options.optimize && terser()
      ]
    };
  
    const packageBundle = await rollup(inputOptions);
    const out = await packageBundle.generate(outputOptions);
    return out.output[0].code;
  }
  
  // TODO: check if file exists?
  function airdropResolverPlugin(importmap: ImportMap, options: AirdropOptions): Plugin {
    return {
      name: 'airdrop-resolve',
      resolveId(importee: string, importer: string) {
        if ( /\0/.test( importee ) ) return null;
        if ( !importer ) return null;
  
        const basedir = jetpack.path(options.package_path);
        importer = importer.replace(basedir, '');
  
        const firstIndex = importer.indexOf('/');
        const secondIndex = importer.indexOf('/', firstIndex + 1);
        const scope = importer.slice(firstIndex + 1, secondIndex);
  
        if (!importmap.scopes[scope]) return;
    
        const scopes = importmap.scopes[scope];
  
        // Sort by length to get more specific path first
        const paths = Object.keys(scopes).sort((a, b) => b.length - a.length);
  
        for (const s of paths) {
          if (importee.startsWith(s)) {
            const im = importee.replace(s, scopes[s]).replace(options.package_root, '');
            return join(basedir, im);
          }
        }
        
        return;
      }
    }
  }