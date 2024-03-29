This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
## Eject
The project was eject `yarn eject` to customize easier

## PUG
The HTML files are generated by PUG
1. Install Dev dependency  
`yarn add --dev pug-cli` 
2. Find the pug CMD path   
`where pug`  
3. Using Watcher (Webstorm) to automatically generate HTML files  

## CSS - Styled Components

## Configuration
1. Do not include PUG into `build`
- add to `config/path.js` `appPug: resolveApp('public/index.pug'),`
- add to `filter` in `scripts/build.js`
```javascript
    const onlyCopyFiles = (file) => !(file === paths.appHtml || file === paths.appPug);
```

## Structure
1. Components - [ARc](https://arc.js.org/) Atomic design
- `atoms` contains very basic (principle) components
- `molecules` contains components comprising from `atoms`
- `organisms` contains components comprising from `atoms`, `molecules`, and `organisms`  

**`Components` contains no-container-components only, there are no containers mapped to `components`.**
Any component which requires logic & data will be located in `containers`.

2. Containers  
Components in `containers` including both UI & its logic  
- `pages` contains pages in routes
- `components` contains components

The relationship between `Components` and `Containers` is Uni-direction.  
- `Containers` --self-refs--> `Containers`.
- `Containers` -------refs--> `Components`.