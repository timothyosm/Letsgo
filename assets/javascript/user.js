
function userChecker() {
    let UUID
    let url = window.location.href
    let idInurl = url.substr(url.length - 6)
    rootRef = firebase.database().ref()
    console.log(rootRef.child(idInurl).once("value", snapshot => {
        console.log(snapshot.val())
    }))

    if (snapshot.val() === null) {
        console.log(create_UUID());
        UUID = create_UUID();
    }

    else {
        UUID === idInurl
    }
};


function create_UUID() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}