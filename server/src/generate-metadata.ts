import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator';
import { ReadonlyVisitor } from '@nestjs/swagger/dist/plugin';

const generator = new PluginMetadataGenerator();
generator.generate({
  visitors: [new ReadonlyVisitor({ pathToSource: __dirname })],
  outputDir: __dirname,
  watch: process.argv.includes('--watch'),
  tsconfigPath: 'tsconfig.build.json',
});
