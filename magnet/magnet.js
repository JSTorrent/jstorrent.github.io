function ondom() {
    console.log('dom loaded')
    document.getElementById('setupMagnetHandler').addEventListener('click',setupMagnetHandler)
    document.getElementById('clearMagnetHandler').addEventListener('click',clearMagnetHandler)
}
document.addEventListener('DOMContentLoaded',ondom)

var ARGS = ["magnet",
                     //                                      "http://jstorrent.com/share/#magnet_uri=%s",
                     window.location.origin + "/add/#uri=%s",
                     "JSTorrent"]

function clearMagnetHandler() {
    if (navigator.unregisterProtocolHandler) {
        navigator.unregisterProtocolHandler(ARGS[0],ARGS[1],ARGS[2])
    }
}
function setupMagnetHandler() {
    if (navigator.registerProtocolHandler) {
        navigator.registerProtocolHandler(ARGS[0],ARGS[1],ARGS[2]);
    }
}
