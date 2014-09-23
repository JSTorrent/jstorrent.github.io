var jstorrent_id = "anhdpjpojoipgpmfanmedjghaligalgb"
var jstorrent_lite_id = "abmohcnlldaiaodkpacnldcdnjjgldfh"


function parse_location_hash() {
    var hash = window.location.hash.slice(1,window.location.hash.length)
    var parts = hash.split('&')
    var args = {}
    for (var i=0; i<parts.length; i++) {
        var kv = parts[i].split('=')
        args[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1])
    }
    console.log(args)
    if (navigator.userAgent.match(/chrome/i)) {
        document.getElementById('info').innerText = JSON.stringify( args )

    } else {
        document.getElementById('info').innerText = 'Need Chrome to use JSTorrent';
    }

/*
    if (args.magnet_uri) {
        document.write('<h3>Here is the magnet link:</h3>')
        document.write('<a href="'+args.magnet_uri+'">magnet link</a>')
    }
*/
    return args
}

window.parsed = parse_location_hash()

function showInstallButton() {
    console.log('showInstallButton')
}

function onaddresponse(result) {
    console.log('onaddresponse',result)
    if (result.handled) {
        history.back()
    }
}

function installChecked(result) {

    var msg = {
        command: 'add-url',
        url: parsed.magnet_uri,
        pageUrl: window.location.href
    }

    if (result.full) {
        // simply add to full i guess...
        // and then navigate back?
        chrome.runtime.sendMessage( jstorrent_id, msg, onaddresponse )
    } else if (result.lite) {
        chrome.runtime.sendMessage( jstorrent_lite_id, msg, onaddresponse )
        // simply add to lite i guess
    }
}


if (! window.chrome) {
    // not chrome, no chance of working
    console.log('not chrome, no chance!')
} else if (chrome.runtime && chrome.runtime.sendMessage) {
    console.log("sendMessage present (an app is installed)")

    chrome.runtime.sendMessage( jstorrent_id, { command: 'checkInstalled' }, function(response) {
        console.log('checkInstalled result from jstorrent',response)
        if (response === undefined) {
            // not installed
            chrome.runtime.sendMessage( jstorrent_lite_id, { command: 'checkInstalled' }, function(response2) {
                console.log('checkInstalled result from jstorrent lite',response2)
                if (response2 === undefined) {
                    installChecked({lite:false,full:false})
                } else {
                    installChecked({lite:true,full:false})
                }
            })
        } else {
            installChecked({full:true})
        }
    })
    // try to send message to JSTorrent, or JSTorrent Lite 
} else {
    // app is not installed, but could be

    showInstallButton()
}