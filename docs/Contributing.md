---
title: Contributing
---
# Contributing to Maintainerr

All help is welcome and greatly appreciated! If you would like to contribute to the project, the following instructions should get you started... (The below is specific to a Windows Development environment.)

## Development

### Tools Required

- HTML/Typescript/Javascript editor
  - [VSCode](https://code.visualstudio.com/) is recommended. Upon opening the project, a few extensions will be automatically recommended for install.
- [NodeJS](https://nodejs.org/en/download/) (Node 20.x or higher)
- [Git](https://git-scm.com/downloads)

### Getting Started

1. [Fork](https://help.github.com/articles/fork-a-repo/) the repository to your own GitHub account and [clone](https://help.github.com/articles/cloning-a-repository/) the fork to your local device:

   ```bash
   git clone https://github.com/YOUR_USERNAME/Maintainerr.git
   cd Maintainerr/
   ```

2. Add the remote `upstream`:

   ```bash
   git remote add upstream https://github.com/jorenn92/Maintainerr.git
   ```

3. Create a new branch:

   ```bash
   git checkout -b <YOUR_NEW_BRANCH_NAME> main
   ```

   - It is recommended to give your branch a meaningful name, relevant to the feature or fix you are working on.
     - Good examples:
       - `docs-docker-setup`
       - `feat-new-system`
       - `fix-title-cards`
       - `ci-improve-build`
     - Bad examples:
       - `bug`
       - `docs`
       - `feature`
       - `fix`
       - `patch`  

4. Activate the correct Yarn version. (*Note: In order to run `corepack enable`, you will need to be running cmd or Powershell as an Administrator.*)

   ```bash
   corepack install
   corepack enable
   ```

5. Install dependencies

   ```bash
   yarn
   ```

6. As of Maintainerr v2.0, the project looks to ensure you have read/write permissions on the `data` directory. This `data` directory does not exist when you first clone your fork. Before running the below commands, create a folder inside of your main Maintainerr directory named `data`, and ensure it has full permissions to the `Everyone` user.

   ```bash
   example ->  C:\Users\You\Documents\GitRepos\Maintainerr\data
   ```

7. Run the development commands (you will need two different cmd/Powershell terminals. One for each command.)

   ```bash
   yarn dev:server
   yarn dev:ui
   ```

   - If the build fails with Powershell, try to use cmd instead.

8. Make your code changes/improvements and test that they work as intended.

   - Be sure to follow both the [code](#contributing-code) and [UI text](#ui-text-style) guidelines.
   - Should you need to update your fork (from any recent ORIGIN changes), you can do so by rebasing from `upstream`:

     ```bash
     git fetch upstream
     git rebase upstream/develop
     git push origin BRANCH_NAME -f
     ```

### Contributing Code

- If you are taking on an existing bug or feature ticket, please comment on the [issue](https://github.com/jorenn92/Maintainerr/issues) to avoid multiple people working on the same thing.
- All commits **must** follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
  - Pull requests with commits not following this standard will **not** be merged.
- Please make meaningful commits, or squash them prior to opening a pull request.
  - Do not squash commits once people have begun reviewing your changes.
- Always rebase your commit to the latest `main` branch. Do **not** merge `main` into your branch.
- It is your responsibility to keep your branch up-to-date. Your work will **not** be merged unless it is rebased off the latest `main` branch.
- You can create a "draft" pull request early to get feedback on your work.
- Your code **must** be formatted correctly, or the tests will fail.
  - We use Prettier to format our code base. It should automatically run with a Git hook, but it is recommended to have the Prettier extension installed in your editor and format on save.
- If you have questions or need help, you can reach out via [Discussions](https://github.com/jorenn92/Maintainerr/discussions) or our [Discord server](https://discord.gg/WP4ZW2QYwk).

### UI Text Style

When adding new UI text, please try to adhere to the following guidelines:

1. Be concise and clear, and use as few words as possible to make your point.
2. Use the Oxford comma where appropriate.
3. Use the appropriate Unicode characters for ellipses, arrows, and other special characters/symbols.
4. Capitalize proper nouns, such as Plex, Radarr, Sonarr, Telegram, Slack, Pushover, etc. Be sure to also use the official capitalization for any abbreviations; e.g., IMDb has a lowercase 'b', whereas TMDB and TheTVDB have a capital 'B'.
5. Title case headings, button text, and form labels. Note that verbs such as "is" should be capitalized, whereas prepositions like "from" should be lowercase (unless as the first or last word of the string, in which case they are also capitalized).
6. Capitalize the first word in validation error messages, dropdowns, and form "tips." These strings should not end in punctuation.
7. Ensure that toast notification strings are complete sentences ending in punctuation.
8. If an additional description or "tip" is required for a form field, it should be styled using the global CSS class `label-tip`.
9. In full sentences, abbreviations like "info" or "auto" should not be used in place of full words, unless referencing the name/label of a specific setting or option which has an abbreviation in its name.
10. Do your best to check for spelling errors and grammatical mistakes.
11. Do not misspell "Maintainerr."

## Attribution

This contribution guide was inspired by the [Overseerr](https://github.com/sct/overseerr) contribution guide.

:material-clock-edit: Last Updated: 10/10/24

