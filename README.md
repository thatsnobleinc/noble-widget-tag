# Noble widget tag

These are files which are embedded with the widget to support different functionalities.

## How it works

To deliver these files to users, we use [JS Deliver CDN](https://www.jsdelivr.com/?docs=gh) with their Github integration.

To load the script, you need to add this source link in the `<script>` tag.

```
https://cdn.jsdelivr.net/gh/thatsnobleinc/noble-widget-tag@main/widget-tag.js
```

For example:

```
<script src="https://cdn.jsdelivr.net/gh/thatsnobleinc/noble-widget-tag@main/widget-tag.js"></script>
```

💡 Tip: The above link targets the `main` branch for production. You can target any other branch by replacing `@main` with any other branch name.

For example, to load the script on `develop` branch, you can target it using:

```
https://cdn.jsdelivr.net/gh/thatsnobleinc/noble-widget-tag@develop/widget-tag.js
```
