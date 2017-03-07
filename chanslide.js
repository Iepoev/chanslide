javascript:(function() {
if (document.getElementById("slidemaindiv")) {
    alert("ChanSlide is already running!");
} else {
    var cursor = 0;
    var isPlaying = -1;
    var ishidden = -1;
    var slideFeed = [];
    var preloader = [];
    var slideInterval = 3000;
    var slideTimeOut;
    var speeddiv;
    var cursordiv;
    var baseURL = window.location.href.substring(0, window.location.href.indexOf('#'));

    // stylesheet
    var sheet = document.createElement("style");
    sheet.innerHTML = "                      " +
        "#slidemaindiv {                     " +
        "    position: fixed;                " +
        "    height: 100vh;                  " +
        "    left: 0;                        " +
        "    right: 0;                       " +
        "    top: 0;                         " +
        "    overflow: hidden;               " +
        "    z-index: 100;                   " +
        "    background: rgba(0, 0, 0, .7);  " +
        "}                                   " +
        "                                    " +
        "#imgnode {                          " +
        "    display: block;                 " +
        "    position: fixed;                " +
        "    margin: auto;                   " +
        "    top: 0;                         " +
        "    bottom: 0;                      " +
        "    left: 0;                        " +
        "    right: 0;                       " +
        "    max-height: 100%;               " +
        "    max-width: 100%;                " +
        "}                                   " +
        "                                    " +
        "#videonode {                        " +
        "    position: absolute;             " +
        "    left: 0;                        " +
        "    right: 0;                       " +
        "    bottom: 0;                      " +
        "    top: 0;                         " +
        "    margin: auto;                   " +
        "}                                   " +
        "                                    " +
        "#backclick, #nextclick {            " +
        "    position: absolute;             " +
        "    top: 0px;                       " +
        "    height: 100%;                   " +
        "    width: 50%;                     " +
        "    opacity: 0.5;                   " +
        "    z-index: 101;                   " +
        "}                                   " +
        "                                    " +
        "#nextclick {                        " +
        "    left: 50%;                      " +
        "}                                   " +
        "#backclick {                        " +
        "    left: 0;                        " +
        "}                                   " +
        "                                    " +
        "#buttonWrapper {                    " +
        "    position: fixed;                " +
        "    top: 0;                         " +
        "    left: 0;                        " +
        "    width: 100%;                    " +
        "    z-index: 102;                   " +
        "    background-color: white;        " +
        "    text-align: center;             " +
        "}                                   " +
        "                                    " +
        "#playpause, #hideshow, #speedup,    " +
        " #speeddown, #speeddiv, #cursordiv, " +
        " #gotopost, #linkimage {            " +
        "    width: 12.5%;                   " +
        "    float: left;                    " +
        "    cursor: pointer;                " +
        "    color: #000000;                 " +
        "}                                   " +
        "                                    " +
        "#playpause:hover, #hideshow:hover, #speedup:hover,    " +
        " #speeddown:hover, #speeddiv:hover, #cursordiv:hover, " +
        " #gotopost:hover, #linkimage:hover {            " +
        "    color: red;                 " +
        "}";
    document.body.appendChild(sheet);

    function init() {
        // the node in which images are placed
        var imgnode = new Image();
        imgnode.setAttribute("id", "imgnode");

        // the node in which webms are placed
        var videonode = document.createElement("video");
        videonode.setAttribute("id", "videonode");
        videonode.setAttribute("autoplay", "");
        videonode.setAttribute("loop", "");
        videonode.setAttribute("src", "");

        // button for playing/pausing the slideshow
        var playpause = document.createElement("div");
        playpause.setAttribute("id", "playpause");
        playpause.innerHTML = "play";
        playpause.onclick = function () { playPauseFunction(playpause); };

        // shows the amount of milliseconds a slide will be visible
        // clicking it will reset the timer to 6 seconds
        speeddiv = document.createElement("div");
        speeddiv.setAttribute("id", "speeddiv");
        speeddiv.onclick = function () {
            slideInterval = parseInt(prompt("Enter desired slide interval", "3000"), 10); 
            updateInterval();
        };

        //button that shows the current slide and shows a prompt to go to a specific slide when clicked
        cursordiv = document.createElement("div");
        cursordiv.setAttribute("id", "cursordiv");
        cursordiv.onclick = function () {
            var selected = prompt("Enter desired image number", "1");
            move(selected - cursor - 1);
            preload(10);
        };

        // button for hiding/showing the slideshow
        var hideshow = document.createElement("div");
        hideshow.setAttribute("id", "hideshow");
        hideshow.innerHTML = "hide";
        hideshow.onclick = function () { hideShowFunction(hideshow, node, playpause); }; // http://stackoverflow.com/a/24091927

        // button for speeding up the slideshow
        var speedup = document.createElement("div");
        speedup.setAttribute("id", "speedup");
        speedup.innerHTML = "speed up";
        speedup.onclick = function () { changeSlideInterval(-1); }; // http://stackoverflow.com/a/24091927

        // button for speeding down the slideshow
        var speeddown = document.createElement("div");
        speeddown.setAttribute("id", "speeddown");
        speeddown.innerHTML = "speed down";
        speeddown.onclick = function () { changeSlideInterval(+1); }; // http://stackoverflow.com/a/24091927

        // button that opens the current slide in a new tab
        var linkimage = document.createElement("a");
        linkimage.setAttribute("id", "linkimage");
        linkimage.setAttribute("href", baseURL);
        linkimage.setAttribute("target", "_blank");
        linkimage.innerHTML = "Open Image";

        // button that saves the current slide to the hard drive
        var gotopost = document.createElement("div");
        gotopost.setAttribute("id", "gotopost");
        gotopost.onclick = function () { 
            if (ishidden < 0) {
                hideShowFunction(hideshow, node, playpause);
            }
            location.hash = "#" + slideFeed[cursor][1];
            window.scrollBy(0, -30);
        };

        // div that shows the previous picture when clicked
        var backnode = document.createElement("div");
        backnode.setAttribute("id", "backclick");
        backnode.onclick = function () { move(-1); }; // http://stackoverflow.com/a/24091927

        // div that shows the next picture when clicked
        var nextnode = document.createElement("div");
        nextnode.setAttribute("id", "nextclick");
        nextnode.onclick = function () { move(1); }; // http://stackoverflow.com/a/24091927

        // wrapper for buttons
        var buttonWrapper = document.createElement("div");
        buttonWrapper.setAttribute("id", "buttonWrapper");
        buttonWrapper.appendChild(hideshow);
        buttonWrapper.appendChild(playpause);
        buttonWrapper.appendChild(cursordiv);
        buttonWrapper.appendChild(speeddown);
        buttonWrapper.appendChild(speeddiv);
        buttonWrapper.appendChild(speedup);
        buttonWrapper.appendChild(linkimage);
        buttonWrapper.appendChild(gotopost);

        // wrapper for entire slideshow
        var node = document.createElement("div");
        node.setAttribute("id", "slidemaindiv");
        node.appendChild(imgnode);
        node.appendChild(videonode);
        node.appendChild(backnode);
        node.appendChild(nextnode);
        document.body.appendChild(node);
        document.body.appendChild(buttonWrapper);

        // keyboard controls
        window.onkeyup = function(e) {
            var key = e.keyCode ? e.keyCode : e.which;

            if ([37,100,72].includes(key)) {
                move(-1);
            } else if ([39,102,76].includes(key)) {
                move(1);
            } else if ([27,8].includes(key)) {
                hideShowFunction(hideshow, node, playpause);
            } else if ([32,13,83,101].includes(key)) {
                playPauseFunction(playpause);
            } else if ([107,83,104,75].includes(key)) {
                changeSlideInterval(-1);
            } else if ([109,40,98,74].includes(key)) {
                changeSlideInterval(1);
            }
        };

        initSlides(gotopost, linkimage, imgnode, videonode);
    }

    function initSlides(gotopost, linkimage, imgnode, videonode) {
        var posts = document.getElementsByClassName("post");
        var url, postid, replies;

        for (var i = 0; i < posts.length; i += 1) {
            if (posts.item(i).getElementsByClassName("file")[0]){
                url = posts.item(i).getElementsByClassName("fileThumb")[0].href;
                if (typeof url !== "undefined") {
                    postid = posts.item(i).id;
                    if (posts.item(i).getElementsByClassName("backlink")[0]) {
                        replies = posts.item(i).getElementsByClassName("backlink")[0].getElementsByClassName("quotelink").length;
                    } else {
                        replies = 0;
                    }
                    slideFeed.push([url,postid,replies]);
                }
            }
        }

        console.log(slideFeed);

        if (slideFeed[cursor][2] === 1) {
            gotopost.innerHTML = "1 reply";
        } else {
            gotopost.innerHTML = slideFeed[cursor][2] + " replies";
        }
        
        linkimage.setAttribute("href", slideFeed[cursor][0]);

        slideFeed[cursor][0].endsWith("webm") ? videonode.src = slideFeed[cursor][0] : imgnode.src = slideFeed[cursor][0]; //http://stackoverflow.com/a/6260001

        preload(10);
        updateCursor();
        updateInterval();
    }

    // preload the next $amount images/video
    function preload(amount) {
        var i = cursor;
        while (i < slideFeed.length && i < (cursor + amount) ) {
            if (!preloader[i]) {
                if (!slideFeed[i][0].endsWith("webm")) {
                    preloader[i] = new Image();
                } else {
                    preloader[i] = document.createElement("video");
                }
                console.log("preloading " + slideFeed[i][0]);
                preloader[i].src = slideFeed[i][0];
           }
           i += 1;
        }
    }

    // update the interval display in the controlbar
    function updateInterval() {
        speeddiv.innerHTML = slideInterval + "ms";
    }

    // update the cursor display in the controlbar
    function updateCursor() {
        cursordiv.innerHTML = "img " + (cursor+1) + " of " + slideFeed.length;
    }

    // change the amount of time every slide stays on the screen
    function changeSlideInterval(s, speeddiv) {
        if (slideInterval > 100 || s > 0) {
            if (slideInterval <= 1000) {
                slideInterval += (s * 100);
            } else {
                slideInterval += (s * 1000);
            }
        }
        updateInterval();
    }

    // hide or show the slideshow
    function hideShowFunction(hideshow, node, playpause) {
        if (ishidden > 0) {
            hideshow.innerHTML = "hide";
            hideshow.style.backgroundColor = "white";
            node.style.display = "";
        } else {
            isPlaying = -1;
            hideshow.innerHTML = "show";
            hideshow.style.backgroundColor = "crimson";
            playpause.style.backgroundColor = "white";
            node.style.display = "none";
        }
        ishidden *= -1;
    }

    // play or pause the slideshow
    function playPauseFunction(playpause) {
        isPlaying *= -1;
        if (isPlaying > 0) {
            playpause.innerHTML = "pause";
            playpause.style.backgroundColor = "palegreen";
        } else {
            playpause.innerHTML = "play";
            playpause.style.backgroundColor = "white";
        }
       clearTimeout(slideTimeOut);
       slideTimeOut = setTimeout(slide, slideInterval);
    }

    // go to the slide that is $direction steps from the current one
    function move(direction) {
        var videonode = document.getElementById("videonode");
        var imgnode = document.getElementById("imgnode");
        var linkimage = document.getElementById("linkimage");
        var gotopost = document.getElementById("gotopost");
        var url = "";

        if (videonode.src) { videonode.src = ""; }
        if (imgnode.src) { imgnode.src = ""; }

        len = slideFeed.length;
        cursor = (((cursor + direction) % len ) + len ) % len; // http://stackoverflow.com/a/4467559

        url = slideFeed[cursor][0]
        if ( url.endsWith("webm") ) {
            videonode.setAttribute("controls", "");
            videonode.style.zIndex = "103";
            videonode.src = url
        } else {
            videonode.removeAttribute("controls", "");
            videonode.style.zIndex = "0";
            imgnode.src = url;
       }

        linkimage.setAttribute("href", url);
        gotopost.setAttribute("href", baseURL + "#" + slideFeed[cursor][1]);
        gotopost.style.backgroundColor = "white";
        if (slideFeed[cursor][2] === 1) {
            gotopost.innerHTML = "1 reply";
        } else {
            gotopost.innerHTML = slideFeed[cursor][2] + " replies";
            if (slideFeed[cursor][2] > 4) {
                gotopost.style.backgroundColor = "yellow";
            }
        }

        updateCursor();

        if ( cursor % 5 === 0) { preload(10); }
    }

    // got to the next slide in the slideshow
    function slide() {
        if (isPlaying > 0) {
            slideTimeOut = setTimeout(slide, slideInterval);
            move(1);
        }
    }

    init();
}
})();