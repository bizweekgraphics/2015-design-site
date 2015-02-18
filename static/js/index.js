var mouseVelocity;
var intervalCTA;
var timeoutCTA;
var colorInterval;
var enable3D = true;
var currentSectionIndex = 0;
var star_init_speed = 100;
var panelOpacity = 0.25;

$(document).ready(function() {
    if ( navigator.userAgent.match(/Windows/) ) {
        $('body').addClass('msie');
        panelOpacity = 0;
    }

    //hijack links
    if ( isiPad() || isMobile() ) {
        FastClick.attach(document.body);
    }

    //move speakers section
    $('section').first().next().after($('section').last());
    var _array = [];
    var _more = [];
    $('.speaker').each(function(i, obj){
        var _name = $(obj).attr('id').split(" ")[1];
        var _obj = {
            'element':obj,
            'name':_name
        };
        if ( _name != "more" ) {
            _array.push(_obj);
        }
        else {
            _more.push(_obj);
        }
    });
    _array.sortBy(function(o){return o.name});
    $('#speakers div.speaker').remove();
    $(_array).each(function(i, obj){
        $('#speakers').append(obj.element);
    });
    $(_more).each(function(i, obj){
        $(obj.element).find('div.backdrop').remove();
        $(obj.element).find('p').remove();
        $('#speakers').append(obj.element);
    });

    $('#logo').bind('click', function(event){
        $(window).scrollTop(0);
        setTimeout(function(){
            $({_value: star_speed}).animate({_value: -1}, {
                duration: 1000,
                easing:'easeOutQuart',
                step: function() {
                    star_speed = this._value
                }
            });
        }, 500);
    });

    hijackLinks();

    //ajax mailchimp form
    $('form#mailChimp').ajaxChimp({
        url: 'http://bloombergbusinessweekdesign.us3.list-manage.com/subscribe/post?u=f00bc2551187afbf5ff85bf4a&id=313c6fc06d',
        callback: mailChimpCallback
    });

    //format schedule
    $('#schedule li strong').wrap('<div class="scheduleTime">');
    $('#schedule h3').each(function(i,obj){
        var _id = $(obj).attr('id');
        var container = [];
        container.push(obj);
        container.push($(obj).next());
        container.push($(obj).next().next());

        var sessionPane;
        if ( _id.indexOf('oos') > -1 ) {
            sessionPane = $('<div class="session oos"></div>');
        }
        else {
            sessionPane = $('<div class="session" id="'+_id+'"></div>');
        }

        sessionPane.insertBefore(container[0]);

        for (i=0;i<container.length;i++) {
            $(sessionPane).append(container[i]);
        }
    });
    $('#schedule div.session li p strong').parent().addClass('timeframe');
    $('div.timeframe').each(function(i, div){
        $(div).height($(div).parent().height());
    });

    //format location
    $('#location p').each(function(i,obj){
        var container = [];
        container.push(obj);

        var mapLabel = $('<div class="mapLabel"></div>');
        mapLabel.insertBefore(container[0]);

        for (i=0;i<container.length;i++) {
            $(mapLabel).append(container[i]);
        }
    });
    $("#location .mapLabel p").fitText(1.6, {maxFontSize:'24px'});

    //add buffer <p> to bottom of each article
    $('article').append("<p><br/></p>");

    //orientation handler
    window.onorientationchange = function(){
        onOrientation();
    }
    
    onOrientation();

    //window resize handler
    $(window).bind('resize', $.throttle( 150, onResize ));

    setTimeout(function(){
        if ( !isMobile() ) {
            star_speed = star_init_speed;
            showStarfield();
            animateCTA();
            animateIntro();
        }

        if ( enable3D ) {
            setTimeout(function(){
                interfaceAnimateIn();
                scrollHandler();
                mouseHandler();
                $({_value: star_init_speed}).animate({_value: 1}, {
                    duration: 1500,
                    easing:'easeOutQuart',
                    step: function() {
                        star_speed = this._value
                    }
                });
            }, 50);
            setTimeout(function(){
                $(window).scrollTop(0);
            }, 500);
        }
        else {
            interfaceAnimateIn();
        }

        $(window).resize();
    }, 500);
});

function mailChimpCallback(response) {
    $('form input#mce-FNAME').val("");
    $('form input#mce-EMAIL').val("");
}

function hijackLinks() {
    if ( isiPad() || isMobile() ){
        var ua = navigator.userAgent, event = (ua.match(/iPad/i)) ? "touchstart" : "click";
    }

    if ( isMobile() ) {
        $('div.menu a').click(function(event){
            event.preventDefault();
            if ( $('header nav').css('display') == 'block' ) {
                $('header nav').hide();
            }
            else {
                $('header nav').show();
            }
        });
        //header nav
        $('nav a').each(function(i, obj){
            $(this).bind('click', function(event){
                event.preventDefault();
            });

            var _target = $(this).attr('href').split("/")[1];

            $(this).parent().bind('click', function(event){
                $('header nav').hide();
                document.location.hash = _target;
            });
        });
    }
    else {
        //header nav
        $('nav a').each(function(i, obj){
            $(this).bind('click', function(event){
                event.preventDefault();
            });

            var _target = $(this).attr('href').split("/")[1];

            $(this).parent().bind('click', function(event){
                goToSection(_target);
            });
        });
        //speaker links
        $('div.speaker a').each(function(i, link){
            $(link).unbind().bind('click', function(event){
                event.preventDefault();
                var _url = $(this).attr('href');
                $.ajax({
                    url: _url,
                    dataType: "html",
                    success: function(response){
                        var html = $.parseHTML(response);
                        $('#lightbox').html($($(html)[34]));
                        $('div.social a').each(function(i, a){
                            if ( $(a).attr('href') == "" ) {
                                $(a).remove();
                            }
                        });
                        showModal();
                    }
                });
            });
        });
    }

    $('div.speaker a').each(function(i, obj){
        if ( $(obj).attr('href') == "/andmore" ) {
            $(obj).css('cursor', 'default');
            $(obj).unbind().bind('click', function(event){
                event.preventDefault();
            });
        }
    });
}

function goToSection(handle, mobile) {
    var _top;

    if ( mobile ) {
        switch ( handle ) {
            case "about":
                _top = 370;
                break;
            case "speakers":
                _top = 1700;
                break;
            case "schedule":
                _top = 2640;
                break;
            case "location":
                _top = 3175;
                break;
        }
    }

    else {
        $('section').each(function(i,section){
            if ( $(section).find('article').attr('id') == handle ) {
                _top = (i*1500)-500;
                if (_top < 0) _top = 750;
                $(window).scrollTop(_top);
            }
        });
    }

    $(window).scrollTop(_top);
}

function interfaceAnimateIn() {
    if ( enable3D ) {
        $('#container').transition({opacity:1}, 250, 'snap');
        $('#intro').parent().transition({
            'transform': 'translate3d(0px, 0px, 0px)',
            '-webkit-transform': 'translate3d(0px, 0px, 0px)'
        }, 250, 'snap');
    }
    else {
        $('#container').transition({opacity:1}, 250, 'snap');
    }
}

function onResize() {

    var _w = $(window).width();
    var _h = $(window).height();

    var _bW = $('article#speakers div.speaker div.imgContainer').first().width();
    $('article#speakers div.speaker div.imgContainer').height(_bW);

    $('div.speaker').height(Math.ceil($('div.speaker').width()));

    if ( _h < 780 ) {
        $('#intro, #location').removeClass('verticallyCentered');
    } else {
        $('#intro, #location').addClass('verticallyCentered');
    }

    if ( _w < 500 ) {
        enable3D = false;
        $('body').addClass('mobile');
        $("#intro h1").fitText(1.1);
    }
    else {
        enable3D = true;
        $('body').removeClass('mobile');
        $("#intro h1").fitText(0.7);
    }

    if ( enable3D ) {
        //resize height of environment
        $('#environment').height( _h - 400 );

        //scroll sizing
        var viewHeight = _h - 265;
        
        $('article').each(function(i, article){
            if ( $(article).attr('id') == 'intro' || $(article).attr('id') == 'location' ) {
                
            }
            else {
                $(article).css({
                    'height': viewHeight,
                    'overflow-y':'scroll'
                });
            }
        });

        //lightbox sizing
        $('#lightbox').css('height', ( _h - Math.floor(_h*.2) ) );
    }
}

function mouseHandler(evt) {
    // $(window).unbind('mousemove').mousemove(function(e){
    //     var _x;
    //     var _y;

    //     console.log('e.pageX = ' + e.pageX);

    //     if ( e.pageX > $(window).width()/2 ) {
            
    //         // _x = e.pageX - $(window).width()/3;
    //     }
    //     else {
    //         // _x = e.pageX - $(window).width()/3
    //     }
    //     // cursor_x = e.pageX 
    //     // cursor_y = e.pageY-$(window).scrollTop();
    // });


    //mouse velocity
    var previousEvent = false;
    $(document).mousemove(function(evt) {
        evt.time = Date.now();
        var res;
        res = makeVelocityCalculator( evt, previousEvent);
        previousEvent = evt;
        mouseVelocity = res;
    });
    function makeVelocityCalculator(e_init, e) {
        var x = e_init.clientX, new_x,new_y,new_t,
            x_dist, y_dist, interval,velocity,
            y = e_init.clientY,
            t;
    if (e === false) {return 0;}
        t = e.time;
        new_x = e.clientX;
        new_y = e.clientY;
        new_t = Date.now();
        x_dist = new_x - x;
        y_dist = new_y - y;
        interval = new_t - t;
        
        x = new_x;
        y = new_y;
        velocity = Math.sqrt(x_dist*x_dist+y_dist*y_dist)/interval;
        return velocity;
    }

}

function scrollHandler() {

    var lastOffset = $(window).scrollTop();
    var decaySpeed;

    $(window).unbind('scroll').scroll(function(e) {
        if ( enable3D ) {

            lastOffset = $(window).scrollTop();

            /*
             * INTRO SECTION
             */
            if ( lastOffset < 50 ) {

                if ( $('article#intro').parent().css('opacity') == panelOpacity ) {
                    activateSection('intro');

                    star_speed = (0 - currentSectionIndex) * 20;
                    decaySpeed = ( star_speed > 0 ) ? 1 : -1;
                    
                    setTimeout(function(){
                        currentSectionIndex = 0;
                        $({_value: star_speed}).animate({_value: decaySpeed}, {
                            duration: 1000,
                            easing:'easeOutQuart',
                            step: function() {
                                star_speed = this._value
                            }
                        });
                    }, 500);

                    $('article#intro').parent().css({
                        'opacity': 1,
                        'transform': 'translate3d(0px, 0px, 0px)',
                        '-webkit-transform': 'translate3d(0px, 0px, 0px)'
                    });
                    $('article#about').parent().css({
                        'opacity': panelOpacity,
                        'transform': 'translate3d(0px, 0px, -1000px)',
                        '-webkit-transform': 'translate3d(0px, 0px, -1000px)'
                    });
                    $('article#speakers').parent().css({
                        'opacity': panelOpacity,
                        'transform': 'translate3d(0px, 0px, -2000px)',
                        '-webkit-transform': 'translate3d(0px, 0px, -2000px)'
                    });
                    $('article#schedule').parent().css({
                        'opacity': panelOpacity,
                        'transform': 'translate3d(0px, 0px, -3000px)',
                        '-webkit-transform': 'translate3d(0px, 0px, -3000px)'
                    });
                    $('article#location').parent().css({
                        'opacity': panelOpacity,
                        'transform': 'translate3d(0px, 0px, -4000px)',
                        '-webkit-transform': 'translate3d(0px, 0px, 4000px)'
                    });                    
                }

            }
            /*
             * ABOUT SECTION
             */
            else if ( lastOffset < 1500 ) {

                if ( $('article#about').parent().css('opacity') == panelOpacity ) {
                    activateSection('about');

                    star_speed = (1 - currentSectionIndex) * 20;
                    decaySpeed = ( star_speed > 0 ) ? 1 : -1;
                    
                    setTimeout(function(){
                        currentSectionIndex = 1;
                        $({_value: star_speed}).animate({_value: decaySpeed}, {
                            duration: 1000,
                            easing:'easeOutQuart',
                            step: function() {
                                star_speed = this._value
                            }
                        });
                    }, 500);

                    $('article#intro').parent().css({
                        'opacity': panelOpacity,
                        'transform': 'translate3d(0px, 0px, 1000px)',
                        '-webkit-transform': 'translate3d(0px, 0px, 1000px)'
                    });
                    $('article#about').parent().css({
                        'opacity': 1,
                        'transform': 'translate3d(0px, 0px, 0px)',
                        '-webkit-transform': 'translate3d(0px, 0px, 0px)'
                    });
                    $('article#speakers').parent().css({
                        'opacity': panelOpacity,
                        'transform': 'translate3d(0px, 0px, -1000px)',
                        '-webkit-transform': 'translate3d(0px, 0px, -1000px)'
                    });
                    $('article#schedule').parent().css({
                        'opacity': panelOpacity,
                        'transform': 'translate3d(0px, 0px, -2000px)',
                        '-webkit-transform': 'translate3d(0px, 0px, -2000px)'
                    });
                    $('article#location').parent().css({
                        'opacity': panelOpacity,
                        'transform': 'translate3d(0px, 0px, -3000px)',
                        '-webkit-transform': 'translate3d(0px, 0px, 3000px)'
                    });
                }
            }
            /*
             * SPEAKERS SECTION
             */
            else if ( lastOffset < 3000 ) {

                if ( $('article#speakers').parent().css('opacity') == panelOpacity ) {
                    activateSection('speakers');

                    star_speed = (2 - currentSectionIndex) * 20;
                    decaySpeed = ( star_speed > 0 ) ? 1 : -1;
                    
                    setTimeout(function(){
                        currentSectionIndex = 2;
                        $({_value: star_speed}).animate({_value: decaySpeed}, {
                            duration: 1000,
                            easing:'easeOutQuart',
                            step: function() {
                                star_speed = this._value
                            }
                        });
                    }, 500);

                    $('article#intro').parent().css({
                        'opacity': panelOpacity,
                        'transform': 'translate3d(0px, 0px, 2000px)',
                        '-webkit-transform': 'translate3d(0px, 0px, 2000px)'
                    });
                    $('article#about').parent().css({
                        'opacity': panelOpacity,
                        'transform': 'translate3d(0px, 0px, 1000px)',
                        '-webkit-transform': 'translate3d(0px, 0px, 1000px)'
                    });
                    $('article#speakers').parent().css({
                        'opacity': 1,
                        'transform': 'translate3d(0px, 0px, 0px)',
                        '-webkit-transform': 'translate3d(0px, 0px, 0px)'
                    });
                    $('article#schedule').parent().css({
                        'opacity': panelOpacity,
                        'transform': 'translate3d(0px, 0px, -1000px)',
                        '-webkit-transform': 'translate3d(0px, 0px, -1000px)'
                    });
                    $('article#location').parent().css({
                        'opacity': panelOpacity,
                        'transform': 'translate3d(0px, 0px, -2000px)',
                        '-webkit-transform': 'translate3d(0px, 0px, -2000px)'
                    });
                }

            }
            /*
             * SCHEDULE SECTION
             */
            else if ( lastOffset < 4500 ) {

                if ( $('article#schedule').parent().css('opacity') == panelOpacity ) {
                    activateSection('schedule');

                    star_speed = (3 - currentSectionIndex) * 20;
                    decaySpeed = ( star_speed > 0 ) ? 1 : -1;
                    
                    setTimeout(function(){
                        currentSectionIndex = 3;
                        $({_value: star_speed}).animate({_value: decaySpeed}, {
                            duration: 1000,
                            easing:'easeOutQuart',
                            step: function() {
                                star_speed = this._value
                            }
                        });
                    }, 500);

                    $('article#intro').parent().css({
                        'opacity': panelOpacity,
                        'transform': 'translate3d(0px, 0px, 3000px)',
                        '-webkit-transform': 'translate3d(0px, 0px, 3000px)'
                    });
                    $('article#about').parent().css({
                        'opacity': panelOpacity,
                        'transform': 'translate3d(0px, 0px, 2000px)',
                        '-webkit-transform': 'translate3d(0px, 0px, 2000px)'
                    });
                    $('article#speakers').parent().css({
                        'opacity': panelOpacity,
                        'transform': 'translate3d(0px, 0px, 1000px)',
                        '-webkit-transform': 'translate3d(0px, 0px, 1000px)'
                    });
                    $('article#schedule').parent().css({
                        'opacity': 1,
                        'transform': 'translate3d(0px, 0px, 0px)',
                        '-webkit-transform': 'translate3d(0px, 0px, 0px)'
                    });
                    $('article#location').parent().css({
                        'opacity': panelOpacity,
                        'transform': 'translate3d(0px, 0px, -1000px)',
                        '-webkit-transform': 'translate3d(0px, 0px, -1000px)'
                    });
                }
            }
            /*
             * LOCATION SECTION
             */
            else if ( lastOffset < 6000 ) {

                if ( $('article#location').parent().css('opacity') == panelOpacity ) {
                    activateSection('location');

                    star_speed = (4 - currentSectionIndex) * 20;
                    decaySpeed = ( star_speed > 0 ) ? 1 : -1;

                    setTimeout(function(){
                        currentSectionIndex = 4;
                        $({_value: star_speed}).animate({_value: decaySpeed}, {
                            duration: 1000,
                            easing:'easeOutQuart',
                            step: function() {
                                star_speed = this._value
                            }
                        });
                    }, 500);

                    $('article#intro').parent().css({
                        'opacity': panelOpacity,
                        'transform': 'translate3d(0px, 0px, 4000px)',
                        '-webkit-transform': 'translate3d(0px, 0px, 4000px)'
                    });
                    $('article#about').parent().css({
                        'opacity': panelOpacity,
                        'transform': 'translate3d(0px, 0px, 3000px)',
                        '-webkit-transform': 'translate3d(0px, 0px, 3000px)'
                    });
                    $('article#speakers').parent().css({
                        'opacity': panelOpacity,
                        'transform': 'translate3d(0px, 0px, 2000px)',
                        '-webkit-transform': 'translate3d(0px, 0px, 2000px)'
                    });
                    $('article#schedule').parent().css({
                        'opacity': panelOpacity,
                        'transform': 'translate3d(0px, 0px, 1000px)',
                        '-webkit-transform': 'translate3d(0px, 0px, 1000px)'
                    });
                    $('article#location').parent().css({
                        'opacity': 1,
                        'transform': 'translate3d(0px, 0px, 0px)',
                        '-webkit-transform': 'translate3d(0px, 0px, 0px)'
                    });                    
                }
                
            }
        }
    });
}

function activateSection(id) {
    $('header#header nav li a').each(function(i, link) {
        if ( $(link).attr('href').indexOf(id) > -1 ) {
            $(link).parent().addClass('active');
        }
        else {
            $(link).parent().removeClass('active');   
        }
    });
    $('article#'+id).focus();
    if ( navigator.userAgent.match(/Windows/) ) {
        $('section').each(function(i, section){
            $(section).show();
            if ( $(section).find('article').attr('id') != id ) {
                setTimeout(function(){$(section).hide();}, 500);
            }
        });
    }
}

function animateCTA() {
    var colorHexes = [
        '#FF0000',
        '#007EFF',
        '#01A400',
        '#8e25fb'
    ];

    var randomColor;

    intervalCTA = setInterval(function(){
        randomColor = colorHexes[Math.floor(Math.random()*colorHexes.length)];
        $('#buytickets button').transition({
            'background': randomColor
        }, 100, 'cubic-bezier(0.42, 0, 0.58, 1)');
    }, 2500);

    $('#buytickets button').unbind('mouseenter').bind('mouseenter', function(event){
        $('#buytickets button').transition({
            'background': '#fd96fd'
            // 'box-shadow': '0 0 5px rgba(255,255,255,0.2), 0 0 10px rgba(255,255,255,0.2), 0 0 20px #fd96fd, 0 0 40px #fd96fd, 0 0 60px #fd96fd'
        }, 0);
        clearInterval(intervalCTA);
        clearTimeout(timeoutCTA);
    });

    $('#buytickets button').unbind('mouseleave').bind('mouseleave', function(event){
        $('#buytickets button').transition({
            'background': randomColor
            // 'box-shadow': 'none'
        }, 0);
        animateCTA();
    });
}

function animateIntro() {
    var colorClasses = [
        'blue',
        'green',
        'red',
        'purple',
    ];

    var array = shuffle($('#intro h1 div'));

    $(array).each(function(i, letter){

        function animateLetter() {
            var _rand = Math.floor(Math.random()*20);
            if ( _rand > 9 ) _rand -= 10;
            if ( _rand == 0 ) _rand = 1;
            var _interval = _rand*250;
            _rand = Math.floor(Math.random()*colorClasses.length);
            var randomColor = colorClasses[_rand];
            $(letter).removeClass().addClass(randomColor);
            setTimeout(function(){
                $(letter).addClass('neon');
                setTimeout(function(){
                    $(letter).removeClass('neon');
                    animateLetter();
                }, 150);
            }, _interval);
        }

        animateLetter();
    });
}

//mobile check
function isMobile() {
    if( navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)){
        return true;
    } else {
        return false;
    }
}

function isiPad() {
    return (
        (navigator.platform.indexOf("iPad") != -1)
    );
}

function onOrientation() {
    if( isiPad() ){
        $('header#header nav li').css({
            'padding': '5px'
        });
        var orientation = window.orientation;               
        if (orientation == 0 || orientation == 180){
            $('html').css({
                'font-size':'100%'
            });
            $('.csstransforms3d #environment').css({
                'top':'200px'
            });
            $('article#intro').css({
                'margin-top':'50px',
                'overflow':'auto'
            });
            $('article').css({
                'margin-top':'30px',
                'height':'auto'
            });
            $('article#location iframe').css({
                'height': '400px'
            });
            $('article#location').css({
                'margin-top': '90px'
            });
            $('#location #map img').css({
                'margin-top': '55%'
            });            
        } else if(orientation == 90 || orientation == -90){
            $('html').css({
                'font-size':'75%'
            });
            $('.csstransforms3d #environment').css({
                'top':'160px'
            });
            $('article#intro').css({
                'overflow':'hidden'
            });
            $('article').css({
                'margin-top':'60px',
                'min-height':'320px'
            });
            $('article#location').css({
                'margin-top': '60px'
            });
            $('#location #map img').css({
                'margin-top': '15%'
            });
        }
    }
}

function showStarfield() {
    if ( $('#starfield').css('display') == 'none' ) {
        $('#starfield').show();
        startStars();
    }

    $('#starfield').transition({opacity:1}, 500, 'out', function(){
        $('html').css({
            'background':'black'
        });
    });
}

function hideStarfield() {
    // stopStars();
    $('#starfield').transition({opacity:0}, 500, 'out', function(){
        //
    });
}

function showModal() {
    $('body').css('overflow', 'hidden');
    $('#dim').show();
    $('#lightbox').transition({opacity:1}, 250, 'snap', function(){
        $('#lightbox').attr('tabindex', 1);
        $('#lightbox').focus();
    });
    $('#dim').transition({opacity:1}, 250, 'snap', function(){
        $('#dim button').bind('click', function(event){
            hideModal();
        });
    });
}

function hideModal() {
    $('body').css('overflow', 'auto');
    $('#lightbox').css({opacity:0});
    $('#dim').css({opacity:0});
    $('#dim').hide();
    $('#lightbox').empty();
    $('#speakers').attr('tabindex', 1);
    $('#speakers').focus();
}

function shuffle(array) {
    var currentIndex = array.length
    var temporaryValue;
    var randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

//sortBy
(function(){
    if (typeof Object.defineProperty === 'function'){
        try{Object.defineProperty(Array.prototype,'sortBy',{value:sb}); }catch(e){}
    }
    if (!Array.prototype.sortBy) Array.prototype.sortBy = sb;

    function sb(f){
        for (var i=this.length;i;){
            var o = this[--i];
            this[i] = [].concat(f.call(o,o,i),o);
        }
        this.sort(function(a,b){
            for (var i=0,len=a.length;i<len;++i){
                if (a[i]!=b[i]) return a[i]<b[i]?-1:1;
            }
            return 0;
        });
        for (var i=this.length;i;){
            this[--i]=this[i][this[i].length-1];
        }
        return this;
    }
})();