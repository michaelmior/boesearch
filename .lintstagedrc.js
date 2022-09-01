module.exports = {
  "*.yml": [
    "eslint"
  ],
  "src/**/*.js": [
    "eslint --fix",
    "prettier --write"
  ],
  "src/**/*.css": [
    "prettier --write"
  ],
  "package.json": [
    "npmPkgJsonLint -q ."
  ],
  "README.md": [
    "markdownlint -f"
  ]
}
