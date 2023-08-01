## [1.4.1](https://github.com/jorenn92/Maintainerr/compare/v1.4.0...v1.4.1) (2023-08-01)


### Bug Fixes

* **plex-api:** fixed a problem where the initial creation of a Plex collection would fail ([a06f261](https://github.com/jorenn92/Maintainerr/commit/a06f26191d8313826103447372200726feec46f6))
* **rules:** fix a problem where "all available episodes seen by" not returned correctly when episode 1 of season 1 is not present ([2d890cc](https://github.com/jorenn92/Maintainerr/commit/2d890cc81b16d19dfe33e833cd0d130d5d18872b))
* **rules:** Fix a problem where booleans would always default to 'true' when editing rules ([bd6a68e](https://github.com/jorenn92/Maintainerr/commit/bd6a68e03b463fed24b3c94e6db8fd9c3d54b29b))
* **rules:** Fix a problem where the sonarr action would always default to the first option when editing rules ([811ef66](https://github.com/jorenn92/Maintainerr/commit/811ef6693016947f96536d536bd42dfa272ee243))
* **ui:** fixed an issue where the collection's library picker would behave wrong ([b6c5f83](https://github.com/jorenn92/Maintainerr/commit/b6c5f83786c1084034af5322b0f7a6376a4fd2a6))

# [1.4.0](https://github.com/jorenn92/Maintainerr/compare/v1.3.2...v1.4.0) (2023-02-21)


### Bug Fixes

* **docs:** fixed some documentation typo's ([331261f](https://github.com/jorenn92/Maintainerr/commit/331261f7e6b83f470586e57ac893a3c2aeebe581))
* **rules & collections:** improve error handling ([9746045](https://github.com/jorenn92/Maintainerr/commit/9746045579a1de884f0297bec3cf517b9cdb9f1c))
* **rules:** fix a problem where media couldn't get added anymore when something unexpected had happened to the Plex collection ([f0dcea7](https://github.com/jorenn92/Maintainerr/commit/f0dcea7e444505f2e953624ea439782b5b3cceeb))


### Features

* **rules & collections:** Manual Plex collections now auto sync with Maintainerr ([2a52436](https://github.com/jorenn92/Maintainerr/commit/2a52436ab000f31bd5d736617b6e3ad6669a17ab))
* **rules:** add the possibility to bypass Maintainerr's rule system. ([b037d11](https://github.com/jorenn92/Maintainerr/commit/b037d11aa176a285da6b911eb60179f48bbba5fa))

## [1.3.2](https://github.com/jorenn92/Maintainerr/compare/v1.3.1...v1.3.2) (2023-01-21)


### Bug Fixes

* app doesn't crash anymore on some raddar/sonnarr api errors ([f1a25e1](https://github.com/jorenn92/Maintainerr/commit/f1a25e1de59976bcee6ffc8ec40e69d8d8f01580))
* **collections:** Add extra add / removal logs in case of failure ([1d2a6e2](https://github.com/jorenn92/Maintainerr/commit/1d2a6e2eb0316e0c64eae3ceec6159f028979391))
* **collection:** Set machineId when needed if it wasn't set during boot (e.g. Plex wasn't available) ([0189670](https://github.com/jorenn92/Maintainerr/commit/01896707427b44802c63380a04e4877cb5d489bd))
* **docs:** added the need to disable Overseer's 'Enable CSRF Protection'  setting to the docs ([256bd48](https://github.com/jorenn92/Maintainerr/commit/256bd4811e1d1df8f21e4b8ccee90079fe8489d5))
* **modal:** fix a problem where a missing image symbol could be shown in some modals ([4738732](https://github.com/jorenn92/Maintainerr/commit/4738732bc98b0cd1316c3373d1e653fc25a56b01))
* **overseerr:** fix a problem where Overseerr media would only be cleared if a request exists ([b31e68d](https://github.com/jorenn92/Maintainerr/commit/b31e68d3f7aa9c8024409813a344b94deb1155b0))
* **ui:** collection background images are now correctly shown again ([5b5e182](https://github.com/jorenn92/Maintainerr/commit/5b5e182eb0887ddecac8f5dfcb27e859cf93f7e2))

## [1.3.1](https://github.com/jorenn92/Maintainerr/compare/v1.3.0...v1.3.1) (2022-11-19)


### Bug Fixes

* **collections:** Fix an issue where collections might not be deleted when empty. This results in a failure to add new media ([e3c6e1f](https://github.com/jorenn92/Maintainerr/commit/e3c6e1f93d20d413977caa730dd9f48441ff06bc))
* **collections:** fix log errors when trying to remove media from an already empty collection ([b7f89f2](https://github.com/jorenn92/Maintainerr/commit/b7f89f27fe99203e9932615ec43e93971993a04a))

# [1.3.0](https://github.com/jorenn92/Maintainerr/compare/v1.2.3...v1.3.0) (2022-09-30)


### Bug Fixes

* **community rules:** Close modal after upload ([473e732](https://github.com/jorenn92/Maintainerr/commit/473e732c217a792cbe064d393299fe97fa93c100))
* **community rules:** Improve spacing on community upload modal ([9cf575a](https://github.com/jorenn92/Maintainerr/commit/9cf575af54006598d59b42eb2d025e8cfde87803))
* **community rules:** Only show rules matching the selected library type ([c485a98](https://github.com/jorenn92/Maintainerr/commit/c485a98804d4efa7cd59a25257af10e9e35786ce))
* **docs:** docker compose yml spaces ([5b18322](https://github.com/jorenn92/Maintainerr/commit/5b18322b8c87204948527d5fdc36593237998055))


### Features

* **community rules:** Add the possibility to load & upload rules made by the community ([6eebeac](https://github.com/jorenn92/Maintainerr/commit/6eebeac4177772a457c58cc9a178b08aae4150d1))

## [1.2.3](https://github.com/jorenn92/Maintainerr/compare/v1.2.2...v1.2.3) (2022-06-29)


### Bug Fixes

* **build:** fix armv7 build issues ([073378c](https://github.com/jorenn92/Maintainerr/commit/073378cecc9341ec7cd35838395407f242f1b145))

## [1.2.2](https://github.com/jorenn92/Maintainerr/compare/v1.2.1...v1.2.2) (2022-06-10)


### Bug Fixes

* **ui:** searchbar too wide after latest tailwind update ([db0cd88](https://github.com/jorenn92/Maintainerr/commit/db0cd883f7729617151434208e3cdbdfc460a85b))

## [1.2.1](https://github.com/jorenn92/Maintainerr/compare/v1.2.0...v1.2.1) (2022-05-09)


### Bug Fixes

* **rules:** selecting boolean now auto sets value to 'true' ([39b90f0](https://github.com/jorenn92/Maintainerr/commit/39b90f0393e33a959aeb32865b274b16aacf907f))
* **settings:** obfuscate api keys ([1ad9b0a](https://github.com/jorenn92/Maintainerr/commit/1ad9b0a4972705474b33cbd38b86bcf2a08b133e))
* **ui:** hide navbar on initial load ([1c551a2](https://github.com/jorenn92/Maintainerr/commit/1c551a269614deffc47fbb65ebd588a463ba93ad))

# [1.2.0](https://github.com/jorenn92/Maintainerr/compare/v1.1.2...v1.2.0) (2022-05-06)


### Bug Fixes

* **settings:** fix missing plex auth key when saved after authentication ([d64fa8c](https://github.com/jorenn92/Maintainerr/commit/d64fa8cbcc14154d503792f6abe9767f28ac24e6))
* **ui:** docs button on each setting page ([a58cc85](https://github.com/jorenn92/Maintainerr/commit/a58cc855c561954405cce949afd5141bf647b091))
* **ui:** white background on input fields after tailwind upgrade ([3c27c24](https://github.com/jorenn92/Maintainerr/commit/3c27c24f92da85fdfe24e1101d9cfb4924c78d2f))


### Features

* **rules:** add 'is requested in overseerr' option ([2c3d469](https://github.com/jorenn92/Maintainerr/commit/2c3d469967533e7aab61d1a1ff3f86a21c4504cd))
* **rules:** new boolean custom type ([5a08fae](https://github.com/jorenn92/Maintainerr/commit/5a08fae75bb06821afd0191bb1fa5d0e9323fd71))

## [1.1.2](https://github.com/jorenn92/Maintainerr/compare/v1.1.1...v1.1.2) (2022-05-04)


### Bug Fixes

* **migration:** remove logic to move db from old location ([1da6474](https://github.com/jorenn92/Maintainerr/commit/1da6474555dc73cf9c221df33da60100a5fac438))
* **overview:** suppress image not found error ([7390a50](https://github.com/jorenn92/Maintainerr/commit/7390a50748de79aacb06b7642963f37086ad2f05))

## [1.1.1](https://github.com/jorenn92/Maintainerr/compare/v1.1.0...v1.1.1) (2022-05-04)


### Bug Fixes

* **docker:** add ormconfig during build step ([97d4411](https://github.com/jorenn92/Maintainerr/commit/97d4411c24205574852b983d8a4233fa0b5f348d))
* **docker:** add sharp during build step ([7887612](https://github.com/jorenn92/Maintainerr/commit/78876124c1eb3ed827983fc6ab795908c4e58424))
* **docker:** fix sharp install during docker build ([f54cb2a](https://github.com/jorenn92/Maintainerr/commit/f54cb2af2f2112ada8b52a7d620a494b5d20a84e))
* **docker:** set timeout during yarn install to unlimited ([71a61f8](https://github.com/jorenn92/Maintainerr/commit/71a61f84a9d01eeb28ac53574684cf0b0cc2cda6))

# [1.1.0](https://github.com/jorenn92/Maintainerr/compare/v1.0.0...v1.1.0) (2022-05-03)


### Bug Fixes

* **babel:** inconsistency in .babelrc ([f92fb5a](https://github.com/jorenn92/Maintainerr/commit/f92fb5a60a1710e3d94e7edc051c6de82e079d39))
* **deps:** remove semantic-release-docker-buildx dep ([b97e13c](https://github.com/jorenn92/Maintainerr/commit/b97e13ce436a6c97485886661e5321fd14947e32))
* **release:** Remove buildx build steps from release ([6c19466](https://github.com/jorenn92/Maintainerr/commit/6c19466a272ef70cc6411aa7a8f4f05cd061ae7b))
* Use force on npm install of UI ([bf5f933](https://github.com/jorenn92/Maintainerr/commit/bf5f9339195315a8011f6900d87b8b7dbe1a11e8))


### Features

* **release:** add multibranch build step ([b993dd2](https://github.com/jorenn92/Maintainerr/commit/b993dd24eefde6de4f17bae0f24a9983a67024cb))
