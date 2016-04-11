
function fillinrange(canvas, range, total, opt_color, animate) {
    // make it fancy pantsy
    if (opt_color === undefined) { opt_color = [0,170,0,255] }
    var ctx = canvas.getContext('2d');
    var w = canvas.width
    var h = canvas.height
    var x1 = w * range[0] / total
    var x2 = w * (range[1] + 1) / total

    if (animate && false) {
        var steps = 50
        var it = 1
        while (it < steps) {
            setTimeout( _.bind(function(i) {
                ctx.fillStyle = '#000';
                ctx.fillRect(x1, 0, x2 - x1, h);
                var alph = i / steps
                var fillstr = 'rgba(' + opt_color.slice(0,3).join(',') + ',' + alph + ')'
                ctx.fillStyle = fillstr
                ctx.fillRect(x1, 0, x2 - x1, h);
            }, this, it), it * 12)
            it++
        }
    } else {
        ctx.fillStyle = 'rgba(' + opt_color.join(',') + ')'
        ctx.fillRect(x1, 0, x2 - x1, h);
    }
}
function clearcanvas(canvas) {
    var ctx = canvas.getContext('2d');
    var w = canvas.width
    var h = canvas.height
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
}

function showranges(canvas, vid) {
    // from http://jsfiddle.net/AbdiasSoftware/Drw6M/
    var ctx = canvas.getContext('2d');

    canvas.onclick = function (e) {
        var vl = vid.duration,
        w = canvas.width,
        x = e.clientX - 5;

        vid.currentTime = x / w * vl;
    }
    loop();

    function loop() {

        var b = vid.buffered,
        i = b.length,
        w = canvas.width,
        h = canvas.height,
        vl = vid.duration,
        x1, x2;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#d00';

        while (i--) {
            x1 = b.start(i) / vl * w;
            x2 = b.end(i) / vl * w;
            ctx.fillRect(x1, 0, x2 - x1, h);
        }
        ctx.fillStyle = '#fff';

        x1 = vid.currentTime / vl * w;
        //ctx.textBaseline = 'top';
        //ctx.textAlign = 'left';

        //ctx.fillText(vid.currentTime.toFixed(1), 4, 4);

        //ctx.textAlign = 'right';
        //ctx.fillText(vl.toFixed(1), w - 4, 4);

        ctx.beginPath();
        ctx.arc(x1, h * 0.5, 7, 0, 2 * Math.PI);
        ctx.fill();

        setTimeout(loop, 29);
    }
    document.getElementById('play').addEventListener('click', function () {
        vid.play()
    }, false);
    document.getElementById('pause').addEventListener('click', function () {
        vid.pause()
    }, false);
}


function decode_arguments_hash() {
    var hash = window.location.hash.slice(1,window.location.hash.length)
    if (hash.length == 0) {
        return {}
    }
    var parts = hash.split('&')
    var args = {}

    for (var i=0; i<parts.length; i++) {
        var kv = parts[i].split('=')
        args[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1])
    }
    console.log('location hash args',args)
    return args
}

function decode_arguments_qp() {
    if (window.location.search) {
        var s = window.location.search.slice(1,window.location.search.length)
        var parts = s.split('&')
        var d = {}
        for (var i=0; i<parts.length; i++) {
            var sp = parts[i].split('=')
            d[decodeURIComponent(sp[0])] = decodeURIComponent(sp[1])
        }
    }
    return d
}

function onload() {
    console.log('loaded')

    var args = decode_arguments_hash()
    var appid = args.id
    var message = { command:'getStatus' }
    
    chrome.runtime.sendMessage(appid, message, function(response) {
        if (response === undefined) {
            console.log('app not installed?',appid)
        } else {
            console.log('got response',response)
            if (response.webapp) {
                var baseUrl = response.webapp.urls[0].url
                loadVideoUrl(baseUrl, args)
            } else {
                showerror2('JSTorrent window is not open or web server not enabled.  Check settings and reload')
            }
        }
    })
    
}

function loadVideoUrl(baseUrl, d) {
    if (d.file === undefined) { d.file = 0 }

    if (d.hash) {
        var streamurl = baseUrl + '/stream?hash=' + d.hash + '&file=' + d.file
        console.log('stream url:',streamurl)
        var video = document.createElement('video')
        //video.preload = 'none'
        //video.preload = 'metadata'
        video.autoplay = 'true'
        video.controls = 'true'
        video.id = 'video'
        addevents(video)
        video.src = streamurl
        document.getElementById('container').appendChild(video)

        var canvas = document.getElementById('canvas')
        showranges(canvas, video)

    } else {

        document.getElementById('container').innerText = 'invalid URL'

    }

    var rangecanvas = document.getElementById('rangecanvas')
    window.token = d.token
    window.port = chrome.runtime.connect(d.id)
    console.log('created port to ',d.id)
    port.onMessage.addListener( function(msg) {

        //console.log('onmessage',msg)
        if (msg.type == 'requestfileinfo') {
            var mq = document.getElementById('marquee')
            mq.innerText = 'initialized'

            sendport({type:'playerevent',
                      event:'initialized'})

            //document.getElementById('fileinfo').innerText = JSON.stringify( msg )
            document.getElementById('fileinfo').innerText = msg.file.path + ', ' + msg.file.size + ' bytes.'
            //document.getElementById('ranges').innerText = JSON.stringify(msg.fileranges)

            clearcanvas(rangecanvas)
            for (var i=0; i<msg.fileranges.length; i++) {
                fillinrange(rangecanvas, msg.fileranges[i], msg.file.size)
            }
        } else if (msg.type == 'newfilerange') {
            fillinrange(rangecanvas, msg.newfilerange, msg.file.size, [0,255,16,255], true)
        } else if (msg.error && msg.error == "window closed") {
            showerror2("JSTorrent window was closed. Playback will stop")
        } else {
            console.warn('unknown message',msg)
        }
    })
    port.onDisconnect.addListener( function(msg) {
        showerror2("JSTorrent shut down. Playback will stop.")
        
        console.log('ondisconnect',msg)
        // xxx try to reconnect?
        window.port = null

    })
    port.postMessage({token:token, 
                      command:'requestfileinfo',
                      hash:d.hash,
                      file:d.file
                     })
}


function sendport(msg) {
    if (window.port) { window.port.postMessage(msg) }
}

function handleerror(evt) {
    var errors = {
        1: 'MEDIA_ERR_ABORTED',
        2: 'MEDIA_ERR_NETWORK',
        3: 'MEDIA_ERR_DECODE',
        4: 'MEDIA_ERR_NOT_SUPPORTED'
    }
    var errtxt = errors[evt.target.error.code]
    showerror(errtxt)
    return errtxt
}

function showerror(msg) {
    document.getElementById('error').innerText = msg
    document.getElementById('error').style.display = 'block'
}
function showerror2(msg) {
    document.getElementById('error2').innerText = msg
    document.getElementById('error2').style.display = 'block'
}


function reload() { window.location.reload() }
function addevents(video) {
    var mq = document.getElementById('marquee')
    var state = {}
    state.sentplaying = false
    state.lastrepeated = 0

    function onevent(evt) {
        if (evt.type == state.lastmsg) {
            state.lastrepeated++
        } else {
            state.lastrepeated = 0
        }

        if (evt.type == 'progress') {
            if (state.lastrepeated > 40) {
                mq.innerText = ''
                state.playing = true
                if (! state.sentplaying) {
                    sendport({type:'playerevent',
                              event:'aplayworked'})
                    state.sentplaying = true
                }
            } else {
                mq.innerText = 'progress' + '+++'.slice(0,state.lastrepeated%4)
            }
        } else {
            state.playing = false
            mq.innerText = evt.type
        }

        if (evt.type == 'play') {
            sendport({type:'playerevent',
                      event:'clickplay'})
        } else if (evt.type == 'pause') {
            sendport({type:'playerevent',
                      event:'clickpause'})
        } else if (evt.type == 'seeked') {
            sendport({type:'playerevent',
                      event:'seeked'})
        }
        
        state.lastmsg = evt.type
        console.log(evt.type)

        if (evt.type == 'error') {
            var errtxt = handleerror(evt)
            sendport({type:'playerevent',
                      event:errtxt})

        } else {
            document.getElementById('error').style.display = 'none'
        }
    }

    if (true) {
        video.addEventListener("readystatechange", onevent);
        video.addEventListener("stalled", onevent);
        video.addEventListener("durationchange", onevent);
        video.addEventListener("loadstart", onevent);
        video.addEventListener("abort", onevent);
        video.addEventListener("loadedmetadata", onevent);
        video.addEventListener("error", onevent);
        video.addEventListener("canplay", onevent);
        video.addEventListener("progress", onevent);
        video.addEventListener("seek", onevent);
        video.addEventListener("seeked", onevent);
        video.addEventListener("ended", onevent );
        //video.addEventListener("timeupdate", function(evt) { console.log('timeupdate',evt); } );
        video.addEventListener("pause", onevent);
        video.addEventListener("play", onevent );
        //video.addEventListener("suspend", onevent);
        /*
          window.onkeydown = function(evt) {
          console.log('onkeydown',evt.keyCode)
          }*/

        var keys = {37:'left',
                    39:'right',
                    38:'up',
                    40:'down'}
        document.documentElement.addEventListener('keydown', function(evt) {
            var keystr = keys[evt.keyCode]
            if (keystr == 'right') {
                video.currentTime = video.currentTime + 5
            } else if (keystr == 'left') {
                video.currentTime = video.currentTime - 5
            } else if (keystr == 'up') {
                video.currentTime = video.currentTime + 15
            } else if (keystr == 'down') {
                video.currentTime = video.currentTime - 15
            }
        })

    }


}


document.addEventListener("DOMContentLoaded", function(){
    onload()
})
