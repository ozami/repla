# repla

## Usage

    repla [option] [file / directory]...
        -f --file <recipe file>
        -s --search <regexp>
        -r --replacement <text>
        -m --match <matching options> # default 'regexp,multiline,global'
        -n --file-name <pattern>      # default '*' (match all)
        -d --delimiter <text>         # default '####'
        -v --verbose

``repla`` replaces text in a file according to the ``recipe`` you wrote.
repla overwrites original file with replaced text.
When you didn't specify either --file or (--search and --replacement), repla launches editor
(uses $EDITOR or $VISUAL enviromental variable) and opens new recipe template.
After you save the recipe and quit the editor, repla runs with that recipe.
If you pass a directory as argument, repla recursively follows the directory, and processes all files it contains.

## Recipe
Recipe is a text file written in the following format:

    comment
    ####
    searching pattern
    ####
    replacement text
    ####
    matching options

``comment``
  Optional comment text here.

``searching pattern``

``replacement text``
  In regular expression matching mode (= non literal matching mode), you can use $1, $& etc.

``matching options``
  list matching options, one per line.
  
``####``
  You can change delimiter by ``--delimiter`` option.

## Matching options
You can change text matching behaviour by ``--match`` option. Available options are:

| Option        | Default | Effect          |
| ------------- | ------- | --------------- |
| regexp        | on      |                 |
| multiline     | on      |                 |
| ignore-case   | off     |                 |
| ignore-spaces | off     |                 |
| global        | on      | If disabled, replace only the first match. |

Multiple options can be specified separeting by comma, e.g. ``ignore-case,regexp,global``.
Prefixing with ``no-`` negates the meaning of option, e.g. ``no-regexp`` means literal match.
``ignore-spaces`` must be used with ``no-regexp``.

## Examples

### Replace 

    ####
    text
    ####
    

## repla-pipe

There is another command **repla-pipe**, which is useful for replacing text within command pipeline.

    repla-pipe [options] <text >replaced
        -f --file <recipe file> required
        -s --search <regexp> 
        -r --replacement <text>
        -m --match <matching options>

repla-pipe reads text from stdin and write replaced text to stdout.
Unlike repla, repla-pipe never opens editor, so you must always specify the --file or (--search and --replacement).

## Regular Expression

repla uses JavaScript's regular expression.

## Tips

### How to match all characters including new line
Use ```[^]```. It works like period (.) in single line mode in many other regexp implementations.

### Using with xargs command

