document.addEventListener("DOMContentLoaded", function(event) { 
    onload()
});

function ondownloadclick() {
}

function onload() {

    var elts = document.querySelectorAll('.js-download')
    for (var i=0; i<elts.length; i++) {
        elts.addEventListener('click', function(evt) {
            var _this = this
            ga('send','event','Clicks','Download', {
                'hitCallback': function() {
                    console.log('sent clicks download event',this)
                    debugger
                }
            });
            evt.preventDefault()
            return false
        });
    }
}