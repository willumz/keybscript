
class ErrorHandler
{
    static RaiseException(exception)
    {
        var out_box = document.getElementById("text-compiled");
        out_box.style.color = "red";
        out_box.value += `${exception}\n\n`;

    }
    static Reset()
    {
        var out_box = document.getElementById("text-compiled");
        out_box.value = "";
    }
}