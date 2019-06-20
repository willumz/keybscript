function evaluate(parsed)
{
    var evaluator = new Evaluator(new NextVisibleIterator(parsed, true));
    evaluator.skw.cursor.endWriting();
    return evaluator.skw.cursor.read();

}


class Evaluator
{
    constructor(tree)
    {
        this.tree = tree;
        this.skw = new SketchWriter();

        while (this.tree.next != null)
        {
            var next = this.tree.getNext();
            this.getItem(next);
        }

    }

    getItem(item, specialArgs={})
    {

        var type = item[0];

        if (type === "symbol")
        { return item; }
        else if (type === "number")
        { return item; }
        else if (type === "string")
        { return item; }
        else if (type === "assignment")
        {
            var symbol = item[1][1];
            var newVal = this.getItem(item[2]);
            console.log(item[2]);
            this.skw.assignVar(symbol, newVal[1], newVal[0]);
        }
        else if (type === "operation")
        {
            var op = item[1];
            var val1 = this.getItem(item[2]);
            var val2 = this.getItem(item[3]);
            var val1type = "";
            var val2type = "";
            var valType = "";
            if (val1[0] === "symbol")
            {
                if (!this.skw.checkVarExists(val1[1]) && val1[2] !== "checked") ErrorHandler.RaiseException(`Variable ${val1[1]} has not been defined`);
                val1type = this.skw.getVarType(val1[1]);
            }
            else val1type = val1[0];
            if (val2[0] === "symbol")
            {
                console.log(`check_2: ${val2[2]}`);
                if (!this.skw.checkVarExists(val2[1]) && val2[2] !== "checked") ErrorHandler.RaiseException(`Variable ${val2[1]} has not been defined`);
                val2type = this.skw.getVarType(val2[1]);
            }
            else val2type = val2[0];
            if (! val1type === val2type) ErrorHandler.RaiseException(`Variables ${val1[1]} and ${val2[1]} are of differnet types`);
            else valType = val1type;
            if (valType === "number")
            {
                return this.getItem([valType, `${val1[1]}${op}${val2[1]}`, "checked"]); // Add 'checked' in case another operation parses the value and wants to check the existance of the variable
            }
            else if (valType === "string")
            {
                if (op === "+" || op === "==") return [valType, `${val1[0] == "symbol" ? val1[1] : `"${val1[1]}"`}${op}${val2[0] == "symbol" ? val2[1] : `"${val2[1]}"`}`, "checked"];
                else ErrorHandler.RaiseException("Strings can only be added (concatenated) together and compared (==)");
            }
            return null;
        }
        else if (type === "#if")
        {
            var condition = this.getItem(item[1])[1];
            this.skw.startIfStatement(condition);
            for (var i of item[2].splice(1))
            {
                this.getItem(i);
            }
            this.skw.endStatement();
        }
        else if (type === "#elseif")
        {
            var condition = this.getItem(item[1])[1];
            this.skw.startElseIfStatement(condition);
            for (var i of item[2].splice(1))
            {
                this.getItem(i);
            }
            this.skw.endStatement();
        }
        else if (type === "#function")
        {
            var name = item[1][1];
            if (item[2][0] !== "symbol") ErrorHandler.RaiseException("The return type of a function must be a symbol type");
            var returnType = item[2][1];
            var args = item[3];
            console.log(item);
            console.log(args);
            var argsArr = [];
            for (var i in args) argsArr.push([args[i], i]);
            for (var i = 0; i < argsArr.length; i++)
            {
                switch(argsArr[i][0])
                {
                    case "number":
                        argsArr[i][0] = "int";
                        break;
                    case "string":
                        argsArr[i][0] = "String";
                        break;
                }
            }
            switch(returnType)
            {
                case "number":
                    returnType = "int";
                    break;
                case "string":
                    returnType = "String";
                    break;
                //case "void":              // Unncecessary
                //    returnType = "void";
                //    break;
            }
            this.skw.cursor.ypos = 1;
            this.skw.startFunction(name, argsArr, returnType);
            console.log(item);
            for (var i of item[4].splice(1))
            {
                this.getItem(i, {"args": args});
            }
            this.skw.endStatement();
            this.skw.cursor.ypos = -1;
        }
        else if (type === "#while")
        {
            var condition = this.getItem(item[1])[1];
            this.skw.startWhileLoop(condition);
            for (var i of item[2].splice(1))
            {
                this.getItem(i);
            }
            this.skw.endStatement();
        }
        else if (type === "#for")
        {
            var number = item[1][1];
            if (item[1][0] !== "number" && item[1][0] !== "symbol") ErrorHandler.RaiseException("A for loop's count must be a number");
            if (item[1][0] === "symbol") {if (this.skw.getVarType(item[1][1]) !== "number") ErrorHandler.RaiseException("A for loop's count must be a number");}
            this.skw.startForLoop(number);
            for (var i of item[2].splice(1))
            {
                this.getItem(i);
            }
            this.skw.endStatement();
        }
        else if (type === "#print")
        {
            var string = this.getItem(item[1]);
            if (string[0] !== "string" && string[0] !== "symbol") ErrorHandler.RaiseException("#print must be given a string");
            if (string[0] === "symbol" && this.skw.getVarType(string[1]) !== "string") ErrorHandler.RaiseException(`'${string[1]}' is not a string`);
            console.log(string);
            this.skw.typeString(string);
        }
        else if (type === "#press")
        {
            var keys = this.getItem(item[1]);
            if (keys[0] !== "string") ErrorHandler.RaiseException("#press must be given a string");
            this.skw.pressKey(keys);
        }
        else if (type === "#delay")
        {
            var delay = this.getItem(item[1]);
            if (delay[0] !== "number") ErrorHandler.RaiseException(`#delay accepts a number, not a ${delay[0]}`);
            this.skw.addDelay(delay[1]);
        }
        else if (type === "call")
        {}

    }

}




class SketchWriter
{
    constructor()
    {
        this.variables = {};
        this.cursor = new WriteCursor();

    }

    assignVar(name, value, valueType)
    {
        if (this.variables[name] == null)
        {
            this.variables[name] = valueType;
            switch(valueType)
            {
                case "number":
                    this.cursor.write(`\nint ${name} = ${value};`);
                    break;
                case "string":
                    this.cursor.write(`\nString ${name} = "${value}";`);
                    break;
            }
        }
        else
        {
            switch(valueType)
            {
                case "number":
                    this.cursor.write(`\n${name} = ${value}`);
                    break;
                case "string":
                    this.cursor.write(`\n${name} = "${value}"`);
                    break;
            }
        }
    }

    checkVarExists(name)
    {
        console.log(`name res:${this.variables[name]!=null}`);
        return this.variables[name] != null;
    }

    getVarType(name)
    {
        return this.variables[name];
    }

    startIfStatement(condition)
    {
        this.cursor.write(`\nif (${condition}) {`);
    }

    startElseIfStatement(condition)
    {
        this.cursor.write(`\nelse if (${condition}) {`);
    }

    startFunction(name, args, returnType)
    {
        var argsSequence = [];
        for (var i of args)
            argsSequence.push(i[0] + " " + i[1]);
        this.cursor.write(`\n${returnType} ${name}(${argsSequence.join(",")}) {`);
    }

    startWhileLoop(condition)
    {
        this.cursor.write(`\nwhile (${condition}) {`);
    }

    startForLoop(number)
    {
        this.cursor.write(`\nfor (int i = 0; i < ${number}; i++) {`);
    }

    endStatement()
    {
        this.cursor.write("\n}");
    }

    typeString(string)
    {
        this.cursor.write(`\nKeyboard.print(${string[2] === "checked" || string[0] === "symbol" ? string[1] : `"${string[1]}"`});`);
    }

    pressKey(keys)
    {
        var keyPresses = [];
        var specialKeys = {"GUI": "KEY_LEFT_GUI", "SHIFT": "KEY_LEFT_SHIFT", "CTRL": "KEY_LEFT_CTRL", "ALT": "KEY_LEFT_ALT", "UPARROW": "KEY_UP_ARROW", "DOWNARROW": "KEY_DOWN_ARROW", "LEFTARROW": "KEY_LEFT_ARROW", "RIGHTARROW": "KEY_RIGHT_ARROW", "ENTER": "KEY_RETURN", "DELETE": "KEY_DELETE"};
        for (var i of keys[1].split(" "))
        {
            if (specialKeys[i.toUpperCase()] != null) keyPresses.push(specialKeys[i.toUpperCase()]);
            else keyPresses.push(`'${i}'`);
        }
        for (var i of keyPresses)
        {
            this.cursor.write(`\nKeyboard.press(${i});`);
        }
        this.cursor.write(`\ndelay(50);\nKeyboard.releaseAll();`);
    }

    addDelay(delay)
    {
        this.cursor.write(`\ndelay(${delay});`);
    }

}

class WriteCursor
{
    constructor()
    {
        this.ypos = -1;
        this.document = "";
        this.write(`#include "Keyboard.h"\nvoid setup() {\nKeyboard.begin();\ndelay(500);`);
    }

    write(toWrite)
    {
        if (this.ypos  === -1) this.document += toWrite;
        else
        {
            var lines = this.document.split("\n");
            lines.splice(this.ypos, 0, toWrite);
            this.document = lines.join("\n");
            this.ypos += toWrite.split("\n").length;
        }
    }

    read()
    {
        return this.document;
    }

    endWriting()
    {
        this.write(`\n}\nvoid loop() {}`);
    }
}