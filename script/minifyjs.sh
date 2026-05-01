#! /bin/bash

for f in public/assets/js/main/*.js; do
  npx terser "$f" -o "public/assets/js/main-minify/$(basename "$f" .js).min.js" -c -m
done
