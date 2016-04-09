function getel(id) {return document.getElementById(id)}
function ondom() {
    console.log('dom loaded')
    Array.prototype.forEach.call(document.querySelectorAll('a.magnet'), function(elt) {
        elt.addEventListener('click',function(evt) {
            setTimeout( checkClickDidAnything, 1 )
        })
    })

    if (window.name == 'tml') {
        console.log('it looks setup.')
        window.name = ''
        //getel('setup').classList.add('fadeOut')
        getel('setup').style.visibility = 'hidden'
        getel('allgood').style.display='block'
        //getel('allgood').classList.add('fadeIn')
    }
    
}
registerHandler()

function checkClickDidAnything() {
    console.log('check if it did anything...')
    setTimeout( registerHandler, 1)
}

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