cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "id": "cordova-plugin-morphus.morphusSDK",
        "file": "plugins/cordova-plugin-morphus/www/morphusSDK.js",
        "pluginId": "cordova-plugin-morphus",
        "clobbers": [
            "cordova.plugins.morphusSDK"
        ]
    },
    {
        "id": "cordova-plugin-splashscreen.SplashScreen",
        "file": "plugins/cordova-plugin-splashscreen/www/splashscreen.js",
        "pluginId": "cordova-plugin-splashscreen",
        "clobbers": [
            "navigator.splashscreen"
        ]
    },
    {
        "id": "at.modalog.cordova.plugin.cache.Cache",
        "file": "plugins/at.modalog.cordova.plugin.cache/www/Cache.js",
        "pluginId": "at.modalog.cordova.plugin.cache",
        "clobbers": [
            "cache"
        ]
    },
    {
        "id": "cordova-plugin-android-permissions.Permissions",
        "file": "plugins/cordova-plugin-android-permissions/www/permissions.js",
        "pluginId": "cordova-plugin-android-permissions",
        "clobbers": [
            "cordova.plugins.permissions"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.2.2",
    "cordova-plugin-crosswalk-webview": "1.8.0",
    "cordova-plugin-morphus": "0.0.1",
    "cordova-plugin-splashscreen": "4.0.0",
    "at.modalog.cordova.plugin.cache": "1.1.0",
    "cordova-plugin-android-permissions": "0.10.0"
};
// BOTTOM OF METADATA
});