$(function() {

    dropboxTile.loadConfig();

    var $appKey         = $('#setting input[name="appKey"]');
    var $appSecret      = $('#setting input[name="appSecret"]');
    var $accessToken    = $('#setting input[name="accessToken"]');
    var $accessSecret   = $('#setting input[name="accessSecret"]');
    var $mode           = $('#setting input[name="mode"]');
    var $rootDirectory  = $('#setting input[name="rootDirectory"]');
    var $thumbnailSize  = $('#setting input[name="thumbnailSize"]');
    var $baseWidth      = $('#setting input[name="baseWidth"]');
    var $margin         = $('#setting input[name="margin"]');

    $appKey.val(dropboxTile.config.appKey);
    $appSecret.val(dropboxTile.config.appSecret);
    $accessToken.val(dropboxTile.config.accessToken);
    $accessSecret.val(dropboxTile.config.accessSecret);
    $mode.val(dropboxTile.config.mode);
    $rootDirectory.val(dropboxTile.config.rootDirectory);
    $thumbnailSize.val(dropboxTile.config.thumbnailSize);
    $baseWidth.val(dropboxTile.config.baseWidth);
    $margin.val(dropboxTile.config.margin);

    $("#setting").submit(function() {
        var hash = {
            appKey         : $appKey.val(),
            appSecret      : $appSecret.val(),
            accessToken    : $accessToken.val(),
            accessSecret   : $accessSecret.val(),
            mode           : $mode.val(),
            rootDirectory  : $rootDirectory.val(),
            thumbnailSize  : $thumbnailSize.val(),
            baseWidth      : parseInt($baseWidth.val()),
            margin         : parseInt($margin.val())
        };

        dropboxTile.saveConfig(hash);
        return false;
    });
});
