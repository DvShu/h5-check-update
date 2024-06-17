# h5-check-update

H5 page checks for updates and alerts; Depends on manifest.json.

## Install

```shell
npm install h5-check-update
```

## Usage

### 1. Import

In `src/main.js` or `src/index.js` add the following code

```javascript
import "h5-check-update";
```

### 2. Worker

Save `check_update.worker.js` to the `public` directory

## Methods

```javascript
import { checkUpdate, destroy } from "h5-check-update";
```

### 1. `checkUpdate()`

Check for updates; In general, you don't need to call this function, it is automatically called once when you introduce the file

### 2. `destroy()`

Stop checking for updates, close the worker, and free up resources.

## Command

### 1. `update`

Add the following code to the `scripts` in `package.json`:

```json
"update": "h5-check-update update"
```

Optional parameters: `--publicDir=public`、`--version=1.0.0`

1. `--publicDir=x`: Directory of the generated manifest.json file.
2. `--version=0.0.1`: version; Defaults is the last version number plus 1.

### 2. `init`

Import `h5-check-update`、add `check_update.worker.js`、add `update` scripts.
例如:

```shell
h5-check-update init
```
