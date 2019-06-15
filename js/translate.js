function translateInput()
{
    ErrorHandler.Reset();
    var input = document.getElementById("text-input").value;
    var lexed = lex(input);
    //var print = lexed.next().value;
    //console.debug(lexed);
    //while (!print["done"])
    //{
    //    console.log(print);
    //    print = lexed.next().value;
    //}
    var parsed = parse(lexed);
    //console.debug(parsed);
    //for (var i = parsed.next(); !i["done"]; i = parsed.next())
    //{
    //    console.log(i.value);
    //}
    var sketch = evaluate(parsed);
    var tabs = 0;
    var temp = [];
    for (var i of sketch.split("\n"))
    {
        var a = false;
        if (i === "}") {a = true;if (tabs > 0) tabs--};
        i = ("    ".repeat(tabs))+i;
        if (i.includes("{")) tabs++;
        if (i.includes("}") && !a) if (tabs > 0) tabs--;
        temp.push(i);
    }
    sketch = temp.join("\n");
    var out_box = document.getElementById("text-compiled");
    out_box.style.color = "black";
    out_box.value = sketch;
}

window.onerror = ErrorHandler.RaiseException;