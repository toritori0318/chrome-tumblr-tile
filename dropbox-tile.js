var dropboxTile;

dropboxTile || (function() {

    dropboxTile = {
        configNs       : "dropbox-tile",
        saveConfig     : saveConfig,
        loadConfig     : loadConfig,
        draw           : draw,
        oauth_url      : oauth_url,
        getDropboxPhotos: getDropboxPhotos,
        config         : undefined,
        dropboxItems   : [],
    };

    function oauth_url(api_url, params) {
        var self = this;

        var accessor = {
            consumerSecret: self.config.appSecret,
            tokenSecret: self.config.accessSecret
        };

        var message = {
            method: "GET",
            action: api_url,
            parameters: {
                oauth_version: "1.0",
                oauth_signature_method: "HMAC-SHA1",
                oauth_consumer_key: self.config.appKey,
                oauth_token: self.config.accessToken
            }
        };
        for (var key in params) {
            message.parameters[key] = params[key];
        }
        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);
        var target = OAuth.addToURL(message.action, message.parameters);
        return target;
    }

    function saveConfig(hash) {
        localStorage[this.configNs] = JSON.stringify(hash);
    }

    function loadConfig() {
        var configStr = localStorage[this.configNs];
        var config    = configStr ? JSON.parse(configStr) : {};

        var defaultConfig = {
            mode: 'sandbox',
            rootDirectory: '/',
            thumbnailSize: 'l',
            baseWidth: 250,
            margin   : 10
        };

        this.config = $.extend(defaultConfig, config);
    }

    function draw() {
        var self = this;

        self.loadConfig();

        if ( !self.config.appKey ) {
            console.log("not exists app key");
            return 1;
        }

        var page = 1;

        var isAccessDropbox = false;

        var $container = $('#container');
        self.getDropboxPhotos(page, function(div) {
            $container.append($(div));
        }).then(function() {
            // 効いてない？
            $container.imagesLoaded( function(){
                $container.masonry({
                    itemSelector : '.item',
                    columnWidth: self.config.baseWidth + self.config.margin,
                    isAnimated : true,
                    isFitted: true,
                });
            });
        }).then(function() {
            $(window).scroll(function() {
                if ( isAccessDropbox == false && $(window).scrollTop() + $(window).height() >= $(document).height() ) {

                    isAccessDropbox = true;
                    page++;

                    self.getDropboxPhotos(page, function(div) {
                        $container.append($(div));
                    }).then(function() {
                        setTimeout(function() {isAccessDropbox = false;}, 1000);
                    });
                }
            });
        });
    }

    function shuffle(list) {
      var i = list.length;
      while (--i) {
        var j = Math.floor(Math.random() * (i + 1));
        if (i == j) continue;
        var k = list[i];
        list[i] = list[j];
        list[j] = k;
      }
      return list;
    }

    function getDropboxPhotos(page, func) {
        var self = this;
        var d = $.Deferred();
        var target = self.oauth_url("https://api.dropbox.com/1/metadata/"+ self.config.mode +escape(self.config.rootDirectory), {});

        // paging
        function getBlob(page) {
            var items = self.dropboxItems;

            page = page-1;
            var max_count = 20;
            var start_pos = (page * max_count);
            var end_pos = start_pos + 20;
            for (var i=start_pos; i<end_pos; i++) {
                var item = items[i];
                if (!item) break;

                param_thumbnail = { size: self.config.thumbnailSize }
                var file_path = escape(item.path);
                var target_thumbnail = self.oauth_url("https://api-content.dropbox.com/1/thumbnails/"+ self.config.mode + file_path, param_thumbnail);

                var xhr = new XMLHttpRequest();
                xhr.open("GET", target_thumbnail);
                xhr.responseType = "blob";
                xhr.onload = function(binaryData) {
                   var blob = this.response;

                   var img = document.createElement('img');
                   img.onload = function(e) {
                     window.URL.revokeObjectURL(img.src); // Clean up after yourself.
                     // adjust
                     img.height = img.height / 1.5
                   };
                   img.src = window.URL.createObjectURL(blob);
                   document.body.appendChild(img);

                   func($('<div class="item">').append($(img)));
                };
                xhr.send(null);
            }
        }

        // call api
        if(self.dropboxItems == 0) {
            $.getJSON(
                target,
                {},
                function(json) {
                    var counter = 0;
                    var contents = [];
                    var len = json.contents.length;
                    var max_len = (len>1000) ? 1000 : len;
                    for (var i=0;i<max_len;i++) {
                      var content = json.contents[i];
                      if (content.is_dir) continue;

                      contents.push(content);
                    }
                    self.dropboxItems = shuffle(contents);

                    getBlob(1);

                    d.resolve();
                }
            );
        } else {
            getBlob(page);
            d.resolve();
        }
        return d;
    }

})();
