## [1.6.9](https://github.com/jorenn92/Maintainerr/compare/v1.6.8...v1.6.9) (2023-11-21)


### Bug Fixes

* **api:** Enhanced the external API caching mechanism to minimize redundant calls to external applications ([478da57](https://github.com/jorenn92/Maintainerr/commit/478da57a9f6d828e34b9f2a5fcf527a61df09529))
* **rules:** Added 2 rules for filtering Plex playlists ([e6f6621](https://github.com/jorenn92/Maintainerr/commit/e6f662174123fc6715ebd701dea0336027606f1c))
* **settings:** Added the ability to configure arr's with base URL ([5a94ac6](https://github.com/jorenn92/Maintainerr/commit/5a94ac6c2d6164aec2fe4c08a248bfa92dd1b8dc))
* **settings:** Added the ability to configure the cron rule & collection handler jobs ([3121cf6](https://github.com/jorenn92/Maintainerr/commit/3121cf6f1b54988e39ad9e356807466fe6ab1765))
* **settings:** Implemented the capability to customize the image caching behavior ([126881b](https://github.com/jorenn92/Maintainerr/commit/126881b2b9f234620272d3d451f7cf124d824606))

## [1.6.8](https://github.com/jorenn92/Maintainerr/compare/v1.6.7...v1.6.8) (2023-11-14)


### Bug Fixes

* **rules:** Added new rule 'Is part of latest aired/airing season' ([2f78a54](https://github.com/jorenn92/Maintainerr/commit/2f78a540c3e2806a5ee24c904136782aba71d040))
* **rules:** Alter the CONTAINS behavior so it now validates for partial matches ([a04fec2](https://github.com/jorenn92/Maintainerr/commit/a04fec238eaa364d428bbeb179d17a0a1c29167f))
* **rules:** Introduced the capability to detect partial text matches within text lists through the newly added 'Contains (Partial list match)' operator. ([5ee4c69](https://github.com/jorenn92/Maintainerr/commit/5ee4c6952a7f6f4ff8a86f57023df381d974a479))
* **rules:** Introduced the capability to include text lists in custom values using JSON notation ([aa0b229](https://github.com/jorenn92/Maintainerr/commit/aa0b229762862f49e6d3aa2b16c696a51d6607c8))

## [1.6.7](https://github.com/jorenn92/Maintainerr/compare/v1.6.6...v1.6.7) (2023-10-29)


### Bug Fixes

* **settings:** Fixed an issue where initial configuration could fail ([3bec671](https://github.com/jorenn92/Maintainerr/commit/3bec6713b38d64ef4d6ee5ba4d614008eef4bfb4))
* **ui:** Collection cards now scale correctly ([829e8a1](https://github.com/jorenn92/Maintainerr/commit/829e8a1ab17dd1c4547998fed86aed1314ab30ac))

## [1.6.6](https://github.com/jorenn92/Maintainerr/compare/v1.6.5...v1.6.6) (2023-10-27)


### Bug Fixes

* **rules:** Added Sonarr rules: 'Has unaired episodes', 'Number of monitored seasons / episodes' & 'Season has unaired episodes' ([71c3b25](https://github.com/jorenn92/Maintainerr/commit/71c3b25de162250f4af551364be4dd8b9d801bc6))
* **ui:** Improve media card spacing on different screen sizes ([8bd6f97](https://github.com/jorenn92/Maintainerr/commit/8bd6f9746772a4cef9ffb08df38fda5bdd9e0416))
* **ui:** The back button & searchbar now have a glass background ([6fcee47](https://github.com/jorenn92/Maintainerr/commit/6fcee47f85b43053d39c8a3ee70a2c1d0f095749))
* **ui:** The header back button is now the global return button. And the temporary collection detail 'rewind' button is gone ([1042de6](https://github.com/jorenn92/Maintainerr/commit/1042de6b9e736cb8e9a2e8174e88799f5793f161))

## [1.6.5](https://github.com/jorenn92/Maintainerr/compare/v1.6.4...v1.6.5) (2023-10-24)


### Bug Fixes

* **docker:** Added all components to a supervisor so component crashes are mitigated ([2ccc73d](https://github.com/jorenn92/Maintainerr/commit/2ccc73d8970541c0ea8e756f1354b02400b3f5b1))
* **rules:** Fixed an issue where 'OR' would not work as expected when used in rules (instead of sections) ([ef191b3](https://github.com/jorenn92/Maintainerr/commit/ef191b3dc03846533b27f714d37f3c2d6ec20428))
* **rules:** Fixed an issue where switching first values of the same type would not keep the previous second value, and could cause a corrupt rule ([e4fe5c1](https://github.com/jorenn92/Maintainerr/commit/e4fe5c108b1bd3e31e70f8f35368a19844892f71))
* **rules:** Fixed an issue where undefined return values during rule execution could crash the server ([a152251](https://github.com/jorenn92/Maintainerr/commit/a152251380897526c1da77915495aa736a33fbcd))
* **rules:** Improved Sonarr log messages ([c944e2d](https://github.com/jorenn92/Maintainerr/commit/c944e2d435c2f51497df0e0e0461ece69e49a760))
* **rules:** Improved the tvdb ID fallback mechanism for Sonarr rule values in case the tvdb ID is missing from Plex ([abd3dc8](https://github.com/jorenn92/Maintainerr/commit/abd3dc8bab4d86c2268220b39dc6fb08d2b7915c))
* **settings:** Fixed an issue where uppercase characters in hostname settings could cause a failure in communication ([a7f6351](https://github.com/jorenn92/Maintainerr/commit/a7f6351bdd05bd5c5980a2f63dd1b0d3a5200f6e))

## [1.6.4](https://github.com/jorenn92/Maintainerr/compare/v1.6.3...v1.6.4) (2023-10-10)


### Bug Fixes

* **rules:** Added clarification to the 'show on home' flag during rule creation ([2d4792d](https://github.com/jorenn92/Maintainerr/commit/2d4792d82524da5919a9a8bd141c31d4c9c772ca))
* **rules:** Fetching the watchHistory could throw an error when using the 'People that view show/season' rule ([9a1a3d6](https://github.com/jorenn92/Maintainerr/commit/9a1a3d6c47aabc4aeb57ac38e1190998652d3445))
* **rules:** Fixed some minor issues with NOT_CONTAINS & NOT_EQUALS ([fa08cbc](https://github.com/jorenn92/Maintainerr/commit/fa08cbc005fbd57fdf97292b13a275a964a03101))

## [1.6.3](https://github.com/jorenn92/Maintainerr/compare/v1.6.2...v1.6.3) (2023-10-05)


### Bug Fixes

* **rules:** Fixed an issue where contains would not work as expected when comparing 2 lists ([fd640e9](https://github.com/jorenn92/Maintainerr/commit/fd640e96019c8a605e228ddc9e4a6efcddec1fe1))

## [1.6.2](https://github.com/jorenn92/Maintainerr/compare/v1.6.1...v1.6.2) (2023-09-22)


### Bug Fixes

* **collections:** Added a 7 second timeout to the availability-sync trigger ([a662eda](https://github.com/jorenn92/Maintainerr/commit/a662eda76002390f5e88d35670767f11fb9d8e35))
* **rules:** Changed the default Overseer behavior to rely more on availability-sync. Added the option to trigger the old behavior (force remove requests) ([39f890c](https://github.com/jorenn92/Maintainerr/commit/39f890ce5cc90859084c3947fe656532c91c9a30))
* **rules:** Fixed an issue where not all rules would be available in the rule dropdown ([5f589e6](https://github.com/jorenn92/Maintainerr/commit/5f589e69d0fa3fb266da59a904c7b2cc6f6734f1))
* **rules:** Improved 'amount of collections'  & added the 'Collections media is present in' rule values ([1ffb69b](https://github.com/jorenn92/Maintainerr/commit/1ffb69b4e98eaa7df06ab2a5aa0a67f62fcb7c3e))

## [1.6.1](https://github.com/jorenn92/Maintainerr/compare/v1.6.0...v1.6.1) (2023-09-19)


### Bug Fixes

* **rules:** Fixed an issue where list exclusions would always be checked ([9280100](https://github.com/jorenn92/Maintainerr/commit/92801004a8efe87dcf93a2919d0e30fa7159c8b3))

# [1.6.0](https://github.com/jorenn92/Maintainerr/compare/v1.5.0...v1.6.0) (2023-09-18)


### Bug Fixes

* **rules & collections:** Fixed rule & collection handling issues when not all apps were configured ([54a25d5](https://github.com/jorenn92/Maintainerr/commit/54a25d5354bc974058ca829fc2098f3ef043a61e))
* **rules:** Fix  a problem where Sonarr's date rules don't work as expected ([d271fb0](https://github.com/jorenn92/Maintainerr/commit/d271fb050e66b787a28fff41b01e7e12bb789e58))
* **rules:** Fixed an issue where rule handling would fail when the Plex collection was manually removed. The collection will now get recreated. ([65f551d](https://github.com/jorenn92/Maintainerr/commit/65f551d412cb6c5c480114ed2d71e196607d803d))
* **settings:** Disabled configuration of apps while Plex is not yet configured ([69def0c](https://github.com/jorenn92/Maintainerr/commit/69def0cef289b5f2dbc3a5a87a408e05ce0be02e))


### Features

* **rules:** Added the possibility to add removed media to *arr's list exclusion ([37b511a](https://github.com/jorenn92/Maintainerr/commit/37b511aed262ac8d6957d6045e0b8932f1634d6f))

# [1.5.0](https://github.com/jorenn92/Maintainerr/compare/v1.4.2...v1.5.0) (2023-09-15)


### Features

* **rules:** Add possibility to unmonitor shows & movies without removing the files ([f41c2e8](https://github.com/jorenn92/Maintainerr/commit/f41c2e87c1c4ab6c0a2f339049f6995684321c11))
* **rules:** added the ability to create rules for seasons & episodes ([#474](https://github.com/jorenn92/Maintainerr/issues/474)) ([b6e8a6c](https://github.com/jorenn92/Maintainerr/commit/b6e8a6ccaf31f2be6ba389db64fbabb0ee40d263))

## [1.4.2](https://github.com/jorenn92/Maintainerr/compare/v1.4.1...v1.4.2) (2023-08-09)


### Bug Fixes

* **rules:** Fixed an issue where 'all episodes seen by' would not always work correctly after PR [#438](https://github.com/jorenn92/Maintainerr/issues/438) ([9862b48](https://github.com/jorenn92/Maintainerr/commit/9862b483128d20ab27119a9550ae61b720a79724))

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
