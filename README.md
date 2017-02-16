# repla

## Usage

    repla [option] [file / directory]...
        -f --recipe <file>
        -s --search <regexp> 
        -r --replacement <text>
        -i --ignore-case
        -m --multiline-mode
        -l --literal-match
        -n --file-name-pattern
        -v --verbose

repla replaces text in a file according to the ``recipe`` you wrote.
repla overwrites original file with replaced text.
When you didn't specify either --recipe file or (--search and --replacement), repla launches editor
(uses $EDITOR or $VISUAL enviromental variable) and opens new recipe template.
If you pass a directory, repla recursively follows the directory, and processes all files it contains.

There is another command **repla-pipe**, which is useful for replacing text within command pipeline.

    repla-pipe [options] <text >replaced
        -f --recipe <file> required
        -s --search <regexp> 
        -r --replacement <text>
        -i --ignore-case
        -m --multiline-mode
        -l --literal-match

Unlike repla, repla-pipe never opens editor, so you must always specify the --recipe or (--search and --replacement).

## Recipe

    comment
    ####
    searching pattern
    ####
    replacement text
    ####
    options

## Regular Expression

repla uses JavaScript's regular expression.


### How to match any character including new line
Use ```[^]```. It works like period (.) in single line mode in many other regexp implementations.
