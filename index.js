#!/bin/env node

"use strict";
const fs = require("fs");
const tmp = require("tmp");
const child_process = require("child_process");

const main = (argv) => {
    tmp.setGracefulCleanup();
    let options;
    
    const parser = require("dashdash").createParser({
        options: [
            {
                names: ["literal-match", "l"],
                type: "bool",
                help: "Match the pattern literally; disable regular expression match",
            },
        ]
    });
    try {
        options = parser.parse(argv);
    }
    catch (e) {
        console.error('error: %s', e.message);
        return 1;
    }
    
    if (options._args.length < 1) {
        console.error("error: specify input file(s)");
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
    
    let search = recipe_split[1].slice(0, -1);
    let replace = recipe_split[2].slice(0, -1);
    if (options.literal_match) {
        search = search.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
        replace = replace.replace(/\$/g, "$$$$");
    }
    
    const search_re = new RegExp(search, "g");
    
    options._args.forEach((path) => {
        const fd = fs.openSync(path, "r+");
        const text = fs.readFileSync(fd, {encoding: "utf8"});
        const replaced = text.replace(search_re, replace);
        fs.ftruncateSync(fd);
        fs.writeFileSync(fd, replaced, {encoding: "utf8"});
    });
    return 0;
};

process.exit(main(process.argv));
