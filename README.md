# Fluid simulation base

This is a base for fluid simulations built using the amazing (really, try it!) declarative webgl helper api [regl](https://regl.party).

**Only velocity field helpers and advection functionality is implemented**, but since I really like the look and feel of this almost-but-not-quite-a-fluid effect I will probably build upon this base when creating various **color soups** and more realistic fluid stuff :)

Based heavily on Jamie Wong's article (see further resources below).

![Example](/assets/example.gif?raw=true "Example")
![Example2](/assets/example2.gif?raw=true "Example2")

By Jakob Stasilowicz - kontakt [at] stasilo.se

## Building & running

```sh
$ npm install
$ gulp webserver
```


## Further resources

- Jamie Wong's great [article and code on fluid simulations in webgl](http://jamie-wong.com/2016/08/05/webgl-fluid-simulation/)
- ["Fast Fluid Dynamics Simulation on the GPU"](https://developer.nvidia.com/gpugems/GPUGems/gpugems_ch38.html) in Nvidia's GPU Gems
- [Amanda Ghassaei's webgl fluid simulation implementation](https://github.com/amandaghassaei/FluidSimulation)
