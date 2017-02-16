#!/bin/env node

"use strict";
const fs = require("fs");
const tmp = require("tmp");
const child_process = require("child_process");

const main = () => {
    tmp.setGracefulCleanup();
    
    if (process.argv.length < 3) {
        console.log("specify input file(s)");
        return 1;
    }
    
    const recipe_file = tmp.fileSync({
        prefix: "repla-",
        postfix: ".txt",
    });
    
    fs.writeFileSync(
        recipe_file.fd,
        "#### search (regular expression) ####\n\n######## replace ########\n\n################\n",
        {encoding: "utf8"}
    );
    
    child_process.spawnSync("vim", [recipe_file.name], {stdio: "inherit"});
    
    const recipe = fs.readFileSync(recipe_file.fd, {encoding: "utf8"});
    const recipe_split = recipe.trim().split(/^#{4,}.*\n?/m);
    
    if (recipe_split.length != 4) {
        console.log("error");
        return 1;
    }
    
    const search = recipe_split[1].slice(0, -1);
    const replace = recipe_split[2].slice(0, -1);
    
    const search_re = new RegExp(search, "g");
    
    process.argv.slice(2).forEach((path) => {
        const fd = fs.openSync(path, "r+");
        const text = fs.readFileSync(fd, {encoding: "utf8"});
        const replaced = text.replace(search_re, replace);
        fs.ftruncateSync(fd);
        fs.writeFileSync(fd, replaced, {encoding: "utf8"});
    });
    return 0;
};

process.exit(main());
