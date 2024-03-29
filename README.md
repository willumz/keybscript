---
---

# keybscript
A scripting language for keyboard input which aims to build some complexity upon the simplicity of DuckyScript.


## Contents
- [Usage](#usage)
- [Syntax](#syntax)
    - [Variables](#variables)
    - [If Statements](#if-statements)
    - [While Loops](#while-loops)
    - [For Loops](#for-loops)
    - [Write a String with the Keyboard](#write-a-string-with-the-keyboard)
    - [Sending a Single Keystroke](#sending-a-single-keystroke)
    - [Sending Key Combinations](#sending-key-combinations)
    - [Adding a Delay](#adding-a-delay)
- [Types](#types)
- [Special Keys](#special-keys)

## Usage
Visit [the live version](https://willumz.github.io/keybscript) to use translate scripts to standard Arduino code for use with the `Keyboard.h` library.

## Syntax
It is important to note that every expression (including '`}`' when ending sections) must end with a `;`.

### Variables
Variables can be defined using the assignment operator `=`.

For example:
```
a = 1;
b = 2;
c = "Hello World";
```

Please note that each variable can only hold one type. This type is implicitly inferred using the value which is first assigned to it. You cannot assign a value of a different type later on. See [types](#types) for a list of supported types.

### If Statements
If statements are written using the `#if` statement.

For example:
```
#if a == 1
{
    b = 2;
};
```
Else if statements can also be used in a similar fashion:
```
#if a == 1
{
    b = 2;
};
#elseif a == 2
{
    b = 1;
};
```
No else statement exists, but it can be replicated with:
```
#elseif 1 == 1 {};
```

### While Loops
While loops are defined with a condition, like if statements, and also have a body, like if statements.
```
#while a == 2
{
    b = b + 1;
};
```

### For Loops
Unlike other languages, for loops are written with only one argument, the loop length.

To define a for loop which runs 15 times:
```
#for 15
{
    x = y + z;
};
```
These make it easy to repeat a single command so many times.

### Write a String with the Keyboard
The `#print` statement is used to send print a string with the keyboard. It takes a single string which should be to its right.
```
#print "Hello World!";
```

### Sending a Single Keystroke
The `#press` statement can be used to send a single keystroke. A string to its right should contain said keystroke.

The following will send the '`r`' character:
```
#press "r";
```

### Sending Key Combinations
The syntax for sending key combinations is the exact same as for sending single keystrokes, except the string argument should contain the keys separated by spaces.

The following will send the `CTRL+ALT+DELETE` key combination:
```
#press "CTRL ALT DELETE";
```
And to open the run dialog (`WIN+r`):
```
#press "GUI r";
```
Some keys (like `CTRL` and `SHIFT`) have special names to use. Read about them in [key names](#special-keys).

### Adding a Delay
`#delay` is used to add a delay to your script, and it merely accepts a number, which is how many milliseconds to wait.

This example shows how to delay the program by 200ms:
```
#delay 200;
```
Note that, as with any statement or expression, variables can also be used. The following produces the same result as above:
```
d = 100;
#delay d * 2;
```

## Types

- number:
    - holds an integer value
- string:
    - holds a string

## Special Keys
For use with the `#press` statement, some keys have special names (as they cannot otherwise be expressed in text).

- Control Key - `CTRL`
- Shift Key - `SHIFT`
- Alt Key - `ALT`
- Delete Key - `DELETE`
- Enter (Return) Key - `ENTER`
- Up Arrow Key - `UPARROW`
- Down Arrow Key - `DOWNARROW`
- Left Arrow Key - `LEFTARROW`
- Right Arrow Key - `RIGHTARROW`
- Windows (Command on Mac) Key - `GUI`

See [Sending Key Combinations](#sending-key-combinations) for more information on usage.