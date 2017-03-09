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
                names: ["file", "f"],
                type: "string",
                help: "Recipe file",
                helpArg: "<recipe file>",
            },
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

    let recipe_file = options.file;
    let recipe;
    try {
        if (recipe_file === undefined) {
            recipe_file = editRecipe();
        }
        recipe = fs.readFileSync(recipe_file, {encoding: "utf8"});
    }
    catch (e) {
        console.error("error: could not read recipe");
        return 2;
    }
    
    const recipe_split = recipe.trim().split(/^#{4,}.*\n?/m);
    
    if (recipe_split.length != 4) {
        console.log("error");
        return 1;
    }
    let modes = {
        "regexp": true,
        "multiline": true,
        "ignore-case": false,
        "ignore-spaces": false,
        "global": true,
    };
    try {
        recipe_split[3].split(/\s+/).forEach((i) => {
            if (i == "") {
                return;
            }
            let mode = i;
            const no = mode.match(/^no-/);
            if (no) {
                mode = mode.replace(/^no-/, "");
            }
            if (modes[mode] === undefined) {
                throw `Unknown match mode '${i}'`;
            }
            modes[mode] = !no;
        });
    }
    catch (e) {
        console.error("error: " + e);
        return 1;
    }
    
    let search = recipe_split[1].slice(0, -1);
    let replace = recipe_split[2].slice(0, -1);
    if (!modes.regexp) {
        search = search.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
        replace = replace.replace(/\$/g, "$$$$");
    }
    
    let flags = "";
    if (modes.global) {
        flags += "g";
    }
    if (modes.multiline) {
        flags += "m";
    }
    if (modes["ignore-case"]) {
        flags += "i";
    }
    
    const search_re = new RegExp(search, flags);
    
    options._args.forEach((path) => {
        const fd = fs.openSync(path, "r+");
        const text = fs.readFileSync(fd, {encoding: "utf8"});
        const replaced = text.replace(search_re, replace);
        fs.ftruncateSync(fd);
        fs.writeFileSync(fd, replaced, {encoding: "utf8"});
    });
    return 0;
};

const editRecipe = () => {
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

    return recipe_file.fd;
};

process.exit(main(process.argv));
