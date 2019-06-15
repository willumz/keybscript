
var chars_pos = 0;

function *lex(chars)
{
    chars_pos = 0;
    var next = chars[chars_pos];
    while (next != null)
    {
        if (" \n\t".includes(next)) {}
        else if ("(){},;:><".includes(next)) { yield [next, ""]; }
        else if (next+chars[chars_pos+1] === "==") { yield ["operation", "=="]; }
        else if (next+chars[chars_pos+1] === "!=") { yield ["operation", "!="]; }
        else if (next === "=" && chars[chars_pos+1] !== "=" && chars[chars_pos-1] !== "=" && chars[chars_pos-1] !== "!") { yield ["=", ""]; }
        else if (["+","-","*","/",">","<"].includes(next)) { yield ["operation", next]; }
        else if ("'\"".includes(next)) { yield ["string", getStr(chars, next)]; }
        else if (".0123456789".includes(next)) { yield ["number", matchRegex(chars, /[.0-9]/g)]; }
        else if (next.match(/[_a-zA-Z]/g)) { yield ["symbol", matchRegex(chars, /[_a-zA-Z0-9]/g)]; }
        else if (next === "#") { yield ["statement", matchRegex(chars, /[_a-zA-Z0-9]/g)]; }
        else if (next === "=") {}
        else { ErrorHandler.RaiseException(`Unexpected character: ${next}`); }
        chars_pos++;
        next = chars[chars_pos];
    }
}

function getStr(chars, endChar)
{
    var toReturn = "";
    chars_pos++;
    var next = chars[chars_pos];
    while (next !== endChar)
    {
        if (next == null) ErrorHandler.RaiseException("A string was not closed before the end of the script");
        toReturn += next;
        chars_pos++;
        next = chars[chars_pos];
    }
    //toReturn = toReturn.replace("\\n", "\n");
    //toReturn = toReturn.replace("\\\"", "\"");
    //toReturn = toReturn.replace("\\t", "\t");
    return toReturn;
}

function matchRegex(chars, regex, add_match = true)
{
    var toReturn = chars[chars_pos];
    chars_pos++;
    var next = chars[chars_pos];
    while (next != null && next.match(regex))
    {
        if (add_match)
        {
            toReturn += next;
            chars_pos++;
            next = chars[chars_pos];
        }
    }
    chars_pos--;
    next = chars[chars_pos];
    return toReturn;
}

class NextVisibleIterator
{
    constructor(iterator, gen = false)
    {
        this.pos = 0;
        this.iter = iterator;
        this.gen = gen;
        this.get_next();
    }
    get_next()
    {
        if (!this.gen)
        {
            if (this.pos <= this.iter.length)
            {
                this.next = this.iter[this.pos];
                this.pos++;
            }
        }
        else
        {
            var temp = this.iter.next()
            if (!temp["done"]) { this.next = temp.value; }
            else { this.next = null; }
        }
    }
    getNext()
    {
        var toReturn = this.next;
        this.get_next();
        return toReturn;
    }
}