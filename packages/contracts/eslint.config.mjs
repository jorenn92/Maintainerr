<<<<<<< HEAD
import pluginJs from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'
=======
import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
>>>>>>> 6546365 (Merge remote-tracking branch 'origin/main' into rule-creation-UI)

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
<<<<<<< HEAD
  {
    ignores: ['**/eslint.config.mjs'],
  },
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: '.' },
      globals: { ...globals.browser, ...globals.node },
    },
  },
=======
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
>>>>>>> 6546365 (Merge remote-tracking branch 'origin/main' into rule-creation-UI)
  pluginJs.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  eslintConfigPrettier,
]
