# Magento XML Extension for VS Code
VSCode Magento XML Support

If you have a project with Magento subdirectory, for example:

<pre>
project-directory/
├─ _magento/
│  ├─ app/
│  ├─ bin/
│  ├─ ...
│  ├─ var/
│  ├─ vendor/
│  └─ composer.json
├─ .vscode/
│  └─ settings.json
├─ bin/
├─ images/
├─ scripts/
├─ var/
├─ docker-compose.yml
├─ Makefile
└─ README.md
</pre>

Simply add the following line to the '.vscode/settings.json' file:

<pre>
{
  "magento.subdir": "_magento"
}
</pre>

To make the extension work better, you need to run the command before development:

```
composer install --optimize-autoloader
```

This command rebuilds the composer classmap.

# How to install the extension?
1. Install docker desktop & run it
2. Run `make build package`
3. Install the generated `*.vsix` file into VS Code as an extension