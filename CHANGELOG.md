# Changelog

## [1.0.1](https://github.com/leviat-tech/draft3d/compare/v1.0.0...v1.0.1) (2023-06-30)


### Bug Fixes

* dimensions update bug ([426281a](https://github.com/leviat-tech/draft3d/commit/426281a8a8a5c6d6993de6823d3288b12c97fba3))

## [1.0.0](https://github.com/leviat-tech/draft3d/compare/v0.6.0...v1.0.0) (2023-06-21)


### ⚠ BREAKING CHANGES

* features must now be defined by calling `defineFeature`

### Features

* refactor entities to use defineEntity ([d93f560](https://github.com/leviat-tech/draft3d/commit/d93f56024eee59fc5d032a65630e12b9fb09f093))
* update dimension font to monospace and add crosshairs to dimension lines ([c677c1d](https://github.com/leviat-tech/draft3d/commit/c677c1d3d84d7e9fb8f2f8f1795290104f68fc96))

## [0.6.0](https://github.com/leviat-tech/draft3d/compare/v0.5.2...v0.6.0) (2023-05-25)


### Features

* axis indicator ([aa40322](https://github.com/leviat-tech/draft3d/commit/aa4032246a9d896faee5bdfb8f3669244a3573ee))

## [0.5.2](https://github.com/leviat-tech/draft3d/compare/v0.5.1...v0.5.2) (2023-05-17)


### Bug Fixes

* poly curve creation ([#103](https://github.com/leviat-tech/draft3d/issues/103)) ([e2792f9](https://github.com/leviat-tech/draft3d/commit/e2792f92a284817a64c63acf5260e98f7d80efa6))

## [0.5.1](https://github.com/leviat-tech/draft3d/compare/v0.5.0...v0.5.1) (2023-05-12)


### Bug Fixes

* add text size to cylindrical arrow ([d00fed8](https://github.com/leviat-tech/draft3d/commit/d00fed896ac80ed7b22d5f346781cdc75e763a76))
* added center styles to canvas ([e80aa78](https://github.com/leviat-tech/draft3d/commit/e80aa78a0eb8c6a9c20078525083666c4f10a2e3))

## [0.5.0](https://github.com/leviat-tech/draft3d/compare/v0.4.0...v0.5.0) (2023-04-28)


### Features

* add renderToImage method to scene ([b3a659c](https://github.com/leviat-tech/draft3d/commit/b3a659c9039653b8ca085517f5d38295cbf26aeb))
* add size and color params to axes ([1a46313](https://github.com/leviat-tech/draft3d/commit/1a46313812ecdfc3f25cda45295dd8093c769cdd))
* enable multiple LayerSet instances ([10615b2](https://github.com/leviat-tech/draft3d/commit/10615b2550f31374805b5885a664683cde684802))

## [0.4.0](https://github.com/leviat-tech/draft3d/compare/v0.3.4...v0.4.0) (2023-04-24)


### Features

* add setVisibility method to Entity ([75cb177](https://github.com/leviat-tech/draft3d/commit/75cb1773b7d91340c0aac117fa5362d12f3172d1))
* change cursor when hovering interactive entities ([1c750df](https://github.com/leviat-tech/draft3d/commit/1c750df1f6a929e72e640de4e270e79ca51f0684))


### Bug Fixes

* alignedDim - ensure correct text size and position on initial render ([ecbea28](https://github.com/leviat-tech/draft3d/commit/ecbea28973ece42642b14ed2eeb8a588a6a00f6c))
* ensure all params are included in render ([75cb177](https://github.com/leviat-tech/draft3d/commit/75cb1773b7d91340c0aac117fa5362d12f3172d1))
* ensure cylinder renders correctly when radius is 0 ([368a429](https://github.com/leviat-tech/draft3d/commit/368a4291e035f47164d0fc5daa2af180a03e3aaa))
* ensure dimensions and axes render correctly ([e38e1ba](https://github.com/leviat-tech/draft3d/commit/e38e1baf9e0cd2ecd4d3a00f76a91d6409c3b50a))
* ensure scene renders with correct camera target ([cec9039](https://github.com/leviat-tech/draft3d/commit/cec9039314304697b08a6e57127bf0dd67d55902))
* set visibility of entity from params ([5e3cbf0](https://github.com/leviat-tech/draft3d/commit/5e3cbf073e7758b5ab0b4991c8f76123b8ec3599))

## [0.3.4](https://github.com/leviat-tech/draft3d/compare/v0.3.3...v0.3.4) (2023-03-31)


### Bug Fixes

* check for changes before updating entity ([7761339](https://github.com/leviat-tech/draft3d/commit/77613394e4bec4a97366280990ef2d12a9d64165))
* update cylindricalPath to use TubeGeometry ([7aa37e1](https://github.com/leviat-tech/draft3d/commit/7aa37e19342ba6cfe2f00a7de5209276668ddb8c))

## [0.3.3](https://github.com/leviat-tech/draft3d/compare/v0.3.2...v0.3.3) (2023-03-28)


### Bug Fixes

* cylinder radius update ([#91](https://github.com/leviat-tech/draft3d/issues/91)) ([1509b17](https://github.com/leviat-tech/draft3d/commit/1509b174f42c17d1fcd8855d53b35be70c6142fd))

## [0.3.2](https://github.com/leviat-tech/draft3d/compare/v0.3.1...v0.3.2) (2023-03-28)


### Bug Fixes

* performance issues with cylinders ([dd85ead](https://github.com/leviat-tech/draft3d/commit/dd85eadf657aeb78cdb2a866a6f49ec6697c2cf6))

## [0.3.1](https://github.com/leviat-tech/draft3d/compare/v0.3.0...v0.3.1) (2023-03-23)


### Bug Fixes

* add default value to params ([#87](https://github.com/leviat-tech/draft3d/issues/87)) ([6793054](https://github.com/leviat-tech/draft3d/commit/6793054e37de7522597bb3d8ad7ef58ed9f4719b))

## [0.3.0](https://github.com/leviat-tech/draft3d/compare/v0.2.0...v0.3.0) (2023-03-20)


### Features

* add line entity ([#85](https://github.com/leviat-tech/draft3d/issues/85)) ([e1ebea5](https://github.com/leviat-tech/draft3d/commit/e1ebea5441f61c11be947fd7bedbaf41e4dcaf82))

## [0.2.0](https://github.com/leviat-tech/draft3d/compare/v0.1.2...v0.2.0) (2023-03-14)


### Features

* allow user to specify camera, lights and controls config ([d807442](https://github.com/leviat-tech/draft3d/commit/d807442279e4eb60844fd032e6f7858bca3b5f0b))


### Bug Fixes

* improve quality of cylinder and cylindrical path ([21a1bb3](https://github.com/leviat-tech/draft3d/commit/21a1bb33811d64cde46f5ec28731ad5111269862))

## [0.1.2](https://github.com/leviat-tech/draft3d/compare/v0.1.1...v0.1.2) (2023-02-28)


### Bug Fixes

* make cylindricalArrowWithClickableText interactive by default ([45c29fe](https://github.com/leviat-tech/draft3d/commit/45c29fee296ccc02a43e413e4e97afdc9fdf044f))

## [0.1.1](https://github.com/leviat-tech/draft3d/compare/v0.1.0...v0.1.1) (2023-02-27)


### Bug Fixes

* add husky ([#78](https://github.com/leviat-tech/draft3d/issues/78)) ([ba6377e](https://github.com/leviat-tech/draft3d/commit/ba6377e4e883f679297627dcbca023f26bdbb31c))

## [0.1.0](https://github.com/leviat-tech/draft3d/compare/v0.0.13...v0.1.0) (2023-02-24)


### Features

* Add roundedRect entity ([#76](https://github.com/leviat-tech/draft3d/issues/76)) ([5163e6b](https://github.com/leviat-tech/draft3d/commit/5163e6b7abee96dd4b13757de47f29c286553c1c))

## [0.0.13](https://github.com/leviat-tech/draft3d/compare/v0.0.12...v0.0.13) (2023-02-14)


### Bug Fixes

* Test CI ([#74](https://github.com/leviat-tech/draft3d/issues/74)) ([bedeab5](https://github.com/leviat-tech/draft3d/commit/bedeab52402a9ecd19b7a9cb5969ff5990bc117f))

## [0.0.12](https://github.com/leviat-tech/draft3d/compare/v1.0.0...v0.0.12) (2023-02-14)


### Features

* add cylinder entity ([df368eb](https://github.com/leviat-tech/draft3d/commit/df368ebed1892f52f596b58e49c32a34ae7ac549))
* add cylindrical path and required helpers ([cae3ef9](https://github.com/leviat-tech/draft3d/commit/cae3ef9f2902d55c69a19814e3dd4a7fb26ba4a0))
* added extensions to dimensions ([d6df751](https://github.com/leviat-tech/draft3d/commit/d6df751433eae1d70a928872602576070d47862b))
* added layerset ([af5b4ff](https://github.com/leviat-tech/draft3d/commit/af5b4ffb46ee85f4c5d5315e14d7a61a221d14bd))
* added ortho camera and tools to manage views ([eed4f29](https://github.com/leviat-tech/draft3d/commit/eed4f29a601447462a3f81d8f9d6fc7ded310481))
* added polycurve asset and added scrollbar to parameters list ([c22f392](https://github.com/leviat-tech/draft3d/commit/c22f3929fe5048de5feb18524175522d4fa7a1bd))
* added support for features ([34d16a2](https://github.com/leviat-tech/draft3d/commit/34d16a2260f4ab6b7865945a543129b7efb97e0e))
* **entities:** add box, alignedDim and polygon3d entities ([55749ce](https://github.com/leviat-tech/draft3d/commit/55749cecdcc7ca929e5535b76faf11278dc93f5e))


### Bug Fixes

* Add CI/CD ([#72](https://github.com/leviat-tech/draft3d/issues/72)) ([cb446ca](https://github.com/leviat-tech/draft3d/commit/cb446ca3ae354b490ce00e6b461787cca2d523ac))
* Add formatter to alignedDim ([fd27c56](https://github.com/leviat-tech/draft3d/commit/fd27c56ebd5113b4ef2653c321773ee524bf4c92))
* add interactivity to alignedDim ([145a4ae](https://github.com/leviat-tech/draft3d/commit/145a4aecc8238a5838f8dce3ba52b1119b524cd4))
* Add layerName prop to entities ([a11023f](https://github.com/leviat-tech/draft3d/commit/a11023f4a482279d005185aca64fb5c9a0fb0c4d))
* Add offset to dimension text ([e32fa70](https://github.com/leviat-tech/draft3d/commit/e32fa700fb7bc897ab27b6cceebfe45963172029))
* Change cylindrical arrows material ([#24](https://github.com/leviat-tech/draft3d/issues/24)) ([5608846](https://github.com/leviat-tech/draft3d/commit/56088460f9b7a6a8672f8d085ee51ca129d0c092))
* change elements interactivity ([e56b761](https://github.com/leviat-tech/draft3d/commit/e56b761455576e87bf303188e7c42194036a763b))
* Change formatter prop ([f4489aa](https://github.com/leviat-tech/draft3d/commit/f4489aaeaabaf72f5ba4903a31354111e80b5e9b))
* change variables name ([7da0db9](https://github.com/leviat-tech/draft3d/commit/7da0db91ba299c548fc178772c6ed7282dd0f2f3))
* ensure updated params replace previous params ([cdb0769](https://github.com/leviat-tech/draft3d/commit/cdb0769542c10e0d76b5919087a9f148beeeada2))
* fix typo ([#23](https://github.com/leviat-tech/draft3d/issues/23)) ([90fd23c](https://github.com/leviat-tech/draft3d/commit/90fd23c759e2b46a14620beeddb72479b0e4a814))
* move layer configuration to Entity ([44fde18](https://github.com/leviat-tech/draft3d/commit/44fde1854ba8cb88c87ce007fd959aea6d2d9e3e))
* Switch X and Y axes ([#25](https://github.com/leviat-tech/draft3d/issues/25)) ([fa4cb3f](https://github.com/leviat-tech/draft3d/commit/fa4cb3fc9a7abb4df77fb8b2d972bf3503cef2dc))
