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
        //document.getElementById('info').innerText = JSON.stringify( args )
    } else {
        //document.getElementById('info').innerText = 'Need Chrome to use JSTorrent';
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

function notify(msg) {
    console.log('notify:',msg)
    var p = document.createElement('p')
    var s = document.getElementById('status')
    p.innerText = msg
    s.insertBefore( p, s.firstChild )
}

function navigateBackMaybe() {
    var delay = 1
    notify('navigating back in ' + delay + ' s')
    setTimeout( function() {
        notify('navigating back...')
        //history.back()
    }, delay * 1000 )
}

function oninstallsuccess(result) {
    clearInterval(window.checkInstalledInterval)
    console.log('oninstallsuccess',result)
}
function oninstallfail(result) {
    clearInterval(window.checkInstalledInterval)
    console.log('oninstallfail',result)
}

function showInstallButton() {
    notify('showInstallButton')
    document.getElementById('install-div').style.display = 'block'

}

function onaddresponse(result) {
    notify('onaddresponse')
    console.log('onaddresponse',result)
    if (result.handled) {
        navigateBackMaybe()
    }
}

function doadd(result) {
    var msg = {
        command: 'add-url',
        url: parsed.magnet_uri,
        pageUrl: window.location.href
    }

    if (result.full) {
        notify('have jstorrent full')
        // simply add to full i guess...
        // and then navigate back?
        chrome.runtime.sendMessage( jstorrent_id, msg, onaddresponse )
    } else if (result.lite) {
        notify('have jstorrent lite')
        chrome.runtime.sendMessage( jstorrent_lite_id, msg, onaddresponse )
        // simply add to lite i guess
    } else {
        notify('error?')
    }
}

function installChecked(result) {
    if (! result.full && ! result.lite) {
        notify('jstorrent not installed! show install button')
        // possibly just old version, because we only get here if sendMessage was present...
        showInstallButton()
    } else {
        notify('sending message to jstorrent!')
        var delay = 2
        setTimeout( doadd.bind(this,result), delay * 1000 )
    }

}

function showmag() {
    var mag = document.getElementById('magnet-link')
    var magdiv = document.getElementById('magnet-div')
    mag.href = parsed.magnet_uri
    magdiv.style.display = 'inline'

}

function checkInstalled() {
    console.log('installed ?', chrome.runtime.sendMessage)
    // check if installed from another tab...
}

function dothings() {


    if (window.chrome && chrome.webstore && chrome.webstore.onInstallStageChanged) {
        chrome.webstore.onInstallStageChanged.addListener(function(evt) {
            console.log('onInstallStageChanged',evt)
        })
    }
    if (window.chrome && chrome.webstore && chrome.webstore.onDownloadProgress) {
        chrome.webstore.onDownloadProgress.addListener(function(evt) {
            console.log('onDownloadProgress',evt)
        })
    }


    document.getElementById('click-install').addEventListener('click',function(evt) {
        var url = "https://chrome.google.com/webstore/detail/" + jstorrent_lite_id
        console.log('webstore url', url)
        chrome.webstore.install(url,
                                oninstallsuccess,
                                oninstallfail)
        // start polling to see if they installed in the other tab ...
        window.checkInstalledInterval = setInterval( checkInstalled, 200 )
    })



    if (! window.chrome) {
        // not chrome, no chance of working
        notify('You need the chrome browser for this to work. But here is the magnet link anyway')
        showmag()
    } else if (chrome.runtime && chrome.runtime.sendMessage) {
        notify("sendMessage present (an app is installed)")

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
}


dothings()