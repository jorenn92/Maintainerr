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
