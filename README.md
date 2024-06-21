# h5-check-update

H5 page checks for updates and alerts; The implementation detects changes in the hash of the index.js file introduced by the source server.

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

### 1. `init`

1. import `h5-check-update`
2. add `check_update.worker.js`.

example:

```shell
h5-check-update init
```
