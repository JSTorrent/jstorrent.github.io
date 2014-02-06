document.addEventListener("DOMContentLoaded", function(event) { 
    onload()
});

function ondownloadclick() {
}

function onload() {

    var elts = document.querySelectorAll('.js-download')
    if (elts) {
        for (var i=0; i<elts.length; i++) {
            elts[i].addEventListener('click', function(evt) {
                var _this = this
                ga('send','event','Clicks','Download', {
                    'hitCallback': function() {
                        console.log('sent clicks download event',evt,_this)
                        debugger
                    }
                });
                evt.preventDefault()
                return false
            });
        }
    }
}