function *parse(tokens)
{
    var parser = new Parser(new NextVisibleIterator(tokens, true), ";");
    while (parser.tokens.next != null)
    {
        var parse = parser.nextExpression(null);
        if (parse != null) { yield parse; }
        parser.tokens.getNext();
    }
}

class Parser
{
    constructor(tokens, stopChar)
    {
        this.tokens = tokens;
        this.stopChar = stopChar;
    }

    nextExpression(prevEx, endChar="", breakOnPrevEx=false)
    {
        if (this.tokens.next == null && prevEx[0] !== this.stopChar) { ErrorHandler.RaiseException("Script should end with a ';'"); return null; }
        else if (this.tokens.next == null) { return null; }
        if (breakOnPrevEx && prevEx != null) { return prevEx; }
        if (this.stopChar.includes(this.tokens.next[0])) { return prevEx; }
        if (this.tokens.next[0] === "{" && !["#function","#if","#elseif","#while","#for"].includes(prevEx)) { return prevEx; }
        if (endChar !== "" &&  endChar === this.tokens.next[0]) { return prevEx; }
        var next = this.tokens.getNext();
        var type = next[0];
        var value = next[1];
        //console.log(`t:${type} v:${value} p:${prevEx}`);
        //alert(next);

        if (["number", "string", "symbol"].includes(type) && prevEx == null) { return this.nextExpression(next, endChar=endChar, breakOnPrevEx=breakOnPrevEx); }
        else if (type === "symbol" && prevEx[0] === "symbol" && ["number", "string"].includes(prevEx[1])) { return [prevEx, next]; } // This is the name of a function argument
        else if (type === "operation") { return this.nextExpression(["operation", value, prevEx, this.nextExpression(null)]); }//return ["operation", value, prevEx, this.nextExpression(null)]; }
        else if (type === "(")
        {
            if (prevEx === "#function")
            {
                return this.getArgs();
            }
            else if (prevEx[0] == "symbol") { return this.nextExpression(["call", prevEx, this.getArgs()]); }
        }
        else if (type === ")")
        {
            return prevEx;
        }
        else if (type === "=")
        {
            if (prevEx[0] !== "symbol") { ErrorHandler.RaiseException("Incorrect use of assignment operator"); }
            return this.nextExpression(["assignment", prevEx, this.nextExpression(null)]);
            //return ["assignment", prevEx, this.nextExpression(null)];
        }
        else if (type === "{")
        {
            //console.log(prevEx);
            //var body = this.multipleExpressions(";", "}");
            var ex = this.nextExpression(null);
            if (ex !== "}") this.tokens.getNext();
            var body = [];
            while (ex !== "}")
            {
                body.push(ex);
                ex = this.nextExpression(null);
                if (ex !== "}") this.tokens.getNext();
            }
            return this.nextExpression(["body"].concat(body));
        }
        else if (type === "}")
        {
            return "}";
        }
        else if (type === "statement")
        {
            if (prevEx != null) ErrorHandler.RaiseException(`Unexpected statement: ${value}`);
            if (value === "#if")
            {
                var condition = this.nextExpression(null);
                var body = this.nextExpression("#if");
                if (!Array.isArray(body[0])) body = ["body", body];
                console.log(`cond:${condition} bod:${body}`);
                return this.nextExpression(["#if", condition, body]);
            }
            else if (value === "#elseif")
            {
                var condition = this.nextExpression(null);
                var body = this.nextExpression("#elseif");
                if (!Array.isArray(body[0])) body = ["body", body];
                console.log(`cond:${condition} bod:${body}`);
                return this.nextExpression(["#elseif", condition, body]);
            }

            else if (value === "#function")
            {
                var returnType = this.nextExpression(null, endChar="", breakOnPrevEx=true);
                var name = this.nextExpression(null, endChar="(");
                var args = this.nextExpression("#function");
                this.tokens.getNext();
                var body = this.nextExpression("#function");
                if (!Array.isArray(body[0])) body = ["body", body];
                //console.log(`n:${name} a:${args}`);
                return this.nextExpression(["#function", name, returnType, args, body]);
            }

            //else if (value === "#return")
            //{
            //
            //}

            else if (value === "#while")
            {
                var condition = this.nextExpression(null);
                var body = this.nextExpression("#while");
                if (!Array.isArray(body[0])) body = ["body", body];
                return this.nextExpression(["#while", condition, body]);
            }

            else if (value === "#for")
            {
                var count = this.nextExpression(null, "", true);
                var body = this.nextExpression("#for");
                if (!Array.isArray(body[0])) body = ["body", body];
                return this.nextExpression(["#for", count, body]);
            }

            else if (value === "#print")
            {
                var toPrint = this.nextExpression(null);
                return this.nextExpression(["#print", toPrint]);
            }

            else if (value === "#press")
            {
                var keys = this.nextExpression(null);
                return this.nextExpression(["#press", keys]);
            }

            else if (value === "#delay")
            {
                var delay = this.nextExpression(null);
                return this.nextExpression(["#delay", delay]);
            }
        }
        else { ErrorHandler.RaiseException(`Unexpected token: ${next} with p: ${prevEx}`); }
    }

    getArgs()
    {
        console.log("starting reading args");
        var args2 = {};
        var ex = this.nextExpression(null, ",");
        console.log(ex);
        args2[ex[1][1]] = ex[0][1];
        while (this.tokens.next[0] === ",")
        {
            this.tokens.getNext();
            var ex = this.nextExpression(null, ",");
            console.log(ex);
            args2[ex[1][1]] = ex[0][1];
        }
        console.debug(args2);
        return args2;
    }
}