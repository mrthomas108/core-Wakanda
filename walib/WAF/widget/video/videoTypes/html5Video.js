;(function() {
    var player = {
        // this is the name of your player
        name: 'html5',
        
        // Here are the url types that are recognized by our player
        // In this example, our extension will detect urls like this one:
        // //myplayer.com/video/<videoId>
        fileTypes: [
	       {
				reg: /(mp4|m4v|ogv|webm)$/i
		   },
        ],

            
        videoTypes: {
            'mp4':  'mp4',
            'm4v':  'mp4',
            'ogv':  'ogg',
            'webm': 'webm'
        },
        videos: [],
        
        apiReady: new $.Deferred().resolve(),
        
        onReady: function(func) {
            this.apiReady.done(func);
        },

        getVideoType: function(url) {
            var res = url.match(/\.([^.]+)$/);
            
            if (res) {
                return this.videoTypes[res[1]];
            } else {
                console.warn('[HTML5]Could not get extension for html5 file', url);
                return '';
            }
        },
        
        // this is the method that gets called with the URL
        // this method should return null if the url is not valid for our player
        // otherwise it must return:
        // - the video SIG (id) if running in runtime
        // - an url for the video player if running inside the designer
        detectSig: function(videoUrl) {
            var sig = null,
                reg = null,
                obj = null,
                res = null,
                urls = $.isArray(videoUrl) ? videoUrl : [videoUrl],
                results = [],
                i,
                j,
                max;
            
            // TODO: foreach...
            for (i = 0, max = urls.length; i < max; i++) {
                for (j in this.fileTypes) {
                    obj = this.fileTypes[j];
                    res = urls[i].match(obj.reg);
                    if (res) {
                        results.push({
                            url: urls[i],
                            sourceType: this.getVideoType(urls[i])
                        });
                    }
                }
            }
            
            return results.length ? {sig: results} : null;
        },
            
        // this is the entry point of our extension: this registers our new extension to the Video widget
        // then loads the external API
        init: function() {
            WAF.widget.Video.prototype.extendVideo(this.name, jQuery.proxy(this.detectSig, this), videoPlayer);
        },

        createVideoTag: function(target, options) {            
            options = $.extend({
            }, options);
            
            var video = $('<video/>').attr({
                id: target.attr('id'),
                preload: 'auto',
                width: options.width,
                height: options.height,
                autobuffer: true
            });
            
            if (!options.params.chromeless) {
                video.attr('controls', true);
            }
            
            if (!options.params.autostart) {
                video.attr('autostart', true);
            }            
            
            // TODO: check in Firefox ? seems like it's wasn't supported some time ago
            if (options.params.start) {
                video.attr('startTime', options.params.start);
            }

            console.log('need to add source', options.src);            
            
            // Add source(s)
            $.each(options.src, function(i, source) {
                if (!video.get(0).canPlayType('video/' + source.sourceType).length) {
                    console.log('probably cannot play format', source.sourceType, source.url, 'adding anyway...');
                }
                video.append($('<source/>').attr({
                    src: source.url,
                    type: 'video/' + source.sourceType
                }));
            });

            if (!video.find('source').length) {
                console.warn('Seems like no source can be played by browser', navigator.userAgent);
            }
            
            try{
                target.replaceWith(video);
            } catch(err) {
                console.log('error while adding source...');
            }
                        
            return video.get(0);
        },
        
        // this constructor is called each time a new player of type <myPlayer> needs to be instanciated
        createPlayer: function(config, htmlObj, widget, sourceAtt) {
            var that = this,
                def = new $.Deferred(),
                videoTag = null;

            console.log('[HTML5] createPlayer')
            
            player.apiReady.done(function() {
                console.log('[HTML5] API Loaded!', config);
    
                videoTag = that.createVideoTag(htmlObj, {
                    src: config['data-video-url'],
                    width: '100%',
                    height: '100%',
                    params: {
                        autoplay: config['data-video-autoplay'],
                        repeat: config['data-video-loop'],
                        chromeless: config['data-video-controls'],
                        start: config['data-video-start']
                    }
                });
                
                // since we to have to wait for any communication channel to be ready
                // we resolve the def here
                def.resolve(videoTag);
            });
            
            return def.promise();
        }
    };

    function videoPlayer(config, target, widget, sourceAtt) {
        var that = this,
            currentTimeInt = null;
        
        this.htmlObj = target || $('<div/>').appendTo('body');
        this.widget = widget;
        this.sourceAtt = sourceAtt;
        
        this.videoTag = null;    
        this.config = $.extend({}, config);
    
        this.config['data-video-url']    = config['data-video-url']     || '';
        this.config['data-video-start'] = config['data-video-start']      || '0';
        this.config['data-video-autoplay']          = config['data-video-autoplay']           == 'true' ? 1 : 0;
        this.config['data-video-loop']              = config['data-video-loop']               == 'true' ? 1 : 0;
        this.config['data-video-controls']          = config['data-video-controls']           == 'true' ? 0 : 1;
                
        console.log('[HTML5] loading player with video ', config['data-video-url'], 'to dom element ', this.htmlObj.attr('id'));

        window.html5 = this;
    
        this.id = this.htmlObj.attr('id');    
    }
    
    videoPlayer.prototype = {
        _setSources: function(src) {
            var sources = $.isArray(src) ? src : [src],
                that = this;
            
            if (this.videoTag && !this.videoTag.paused) {
                this.pause();
            }
            
            $(this.videoTag).find('source').remove();
            
            $.each(src, function(i, source) {
                $(that.videoTag).append($('<source/>').attr({
                    src: source.url,
                    type: 'video/' + source.sourceType
                }));
            });
            
            if (!$(this.videoTag).find('source').length) {
                console.warn('Seems like no source can be played by browser', navigator.userAgent);
            }
        },
        
        _bindEvents: function() {
            var that = this;
            
            console.log(this.videoTag);
            
            $(this.videoTag).bind('durationchange', function(e, data) {
                console.log('[HTML5] durationChange', e.target.duration);
                $(that.widget.containerNode).trigger('durationChange', {duration: e.target.duration});
            });
            
//            $(this.videoTag).bind('progress', function(e) {
//                $(that.widget.containerNode).trigger('progress', {time: e.target.bufferedTime});
//            });
            
            this.videoTag.addEventListener('timeupdate', function(e, data) {
                $(that.widget.containerNode).trigger('timeUpdate', {time: e.target.currentTime});
            });
            
            $(this.videoTag).bind('playing', function(e) {
                $(that.widget.containerNode).trigger('playing');
            });
            
            $(this.videoTag).bind('ended', function(e) {
                $(that.widget.containerNode).trigger('ended');
                        
                // set Loop parameter again since the one passed when creating the player seems to be ignored at this point        
                if (that.config['data-video-loop'] === 1) {
                    console.log('[HTML5] reached end of video, need to loop');
                    that._loop();
                }                                
            });
            
            $(this.videoTag).bind('error', function(e) {
                $(that.widget.containerNode).trigger('videoError', {error: e});
            });            
        },
        
        // TODO: handle multiple sources
        _loadOrCueVideoById: function(sig) {
            this._setSources(sig);
            
            if (this.config['data-video-autoplay']) {            
                this.videoTag.play();
            }
            
            if (this.config['data-video-start']) {
                this.seekTo(this.config['data-video-start']);
            }
        },
        
        _loop: function() {
            if (this.config['data-video-loop'] === 1) {
                this.seekTo(0);  // this.config['data-video-start']
                this.play();
            }
        },
        
        pause: function() {
            this.paused = true;
            this.videoTag.pause();
        },
        
        play: function() {
            this.paused = false;
            this.videoTag.play();
        },        

        stop: function() {
            if (!this.videoTag.paused) {
                this.pause();
            }
        },
        
        seekTo: function(secs) {
            this.videoTag.currentTime = secs;
        },
        
        togglePlay: function() {
            console.warn('[HTML5] TODO: togglePlay()');
            console.log('[HTML5] togglePlay()');
            if (this.paused) {
                this.play();
            } else {
                this.pause();
            }
        },
        
        loadVideoById: function(sig, start) {
            var that = this;

            this.config['data-video-start'] = start || this.config['data-video-start'];
            
            console.log('[HTML5] loadVideoById', start, this.config['data-video-start']);
            
            if (!this.videoTag) {
                console.log('[HTML5] loadVideoById -> need to create Player first')
                this.config['data-video-url'] = sig;
                
                player.createPlayer(this.config, this.htmlObj, this.widget, this.sourceAtt).done(function(videoTag) {
                    console.log('[HTML5] oh oh... seems like the iframe is ready to communicate with us! let\'s call load with', sig);
                    that.htmlObj = $('#' + that.id);
                    that.videoTag = videoTag;
                    that._bindEvents();
                    
                    that.gotDuration = false;
                })
            } else {
                this.gotDuration = false;
                // if the video is playing, calling load() will automatically play the video,
                // even if autoplay has been set to 0 when loading the player
                this.stop();
                this._loadOrCueVideoById(sig);
            }
        },
        
        toggleMute: function() {
            console.warn('[HTML5] TODO: toggleMuted()');            
            this.videoTag.muted = ! this.videoTag.muted;
        },
        
        mute: function() {
            console.warn('[HTML5] TODO: mute()');
            this.videoTag.muted = true;
        },
        
        hide: function() {
            $(this.htmlObj).hide();
        },
        
        show: function() {
            $(this.htmlObj).show();        
        },
        
        setVolume: function(vol) {
            this.videoTag.volume = (vol/100);
        },
        
        getVolume: function() {
            return this.videoTag.volume * 100;
        }
    };

    // add ouverselves to the Video tag, and initialize Html5 API
    player.init();
})();
