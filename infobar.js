// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

//     request.setValue(String(format: "device=\"%@\"", deviceid), forHTTPHeaderField: "Cookie")

function getRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex;
}

chrome.storage.sync.get('userid', function(items) {
    var userid = items.userid;
    if (!userid) {
        userid = getRandomToken();
        chrome.storage.sync.set({userid: userid}, function() {
        });
    }
});

var server = "http://jtvremote.herokuapp.com/";
//var server = "http://127.0.0.1:8989/";

function sendPOST(url, data) {
    chrome.storage.sync.get('userid', function(items) {
        deviceid = items.userid;
        $.ajax({url: url + "&device=" + deviceid,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(data)})
        .done(function() {
            console.log("OK");
        })
        .error(function (request, status, error) {
            console.log(request.responseText);
        });
    });
}

function register(id) {
    sendPOST(server + "register?tv=" + id, {});
}

function sendToServer(url, force) {
    sendPOST(server + "tv?", {"url": url, "force": "1"});
}
        
console.log("HERE");

chrome.tabs.query({
    active: true,               // Select active tabs
    lastFocusedWindow: true     // In the current window
    }, function(tabs) {
        console.log(tabs);
        tab = tabs[0];
        tabUrl = tab.url;
        $('#test').val(tabUrl);
        sendToServer(tabUrl, 1);
    }
);

$(document).on('click', '#but', function () {
    console.log("PUSH" + $('#tv').val());
    register($('#tv').val());
});
