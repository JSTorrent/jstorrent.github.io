function getel(id) {return document.getElementById(id)}
function ondom() {
    console.log('dom loaded')

}
    registerHandler()

function registerHandler() {
    var handlerPath = "/add/"
    var handlerArgument = "#magnet_uri="
    var handler
    var handlerFullUrl = window.location.origin + handlerPath + handlerArgument
    var Protocol = "magnet"
    var ARGS = [Protocol,
                handlerFullUrl + "%s",
                "JSTorrent"]
    console.log('request register handler',ARGS)
    navigator.registerProtocolHandler(ARGS[0],ARGS[1],ARGS[2]);
}



document.addEventListener("DOMContentLoaded",ondom)
