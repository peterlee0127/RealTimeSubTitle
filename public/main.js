let socket = io();
let nowText = $("#title").text;
let showStatus = $("#displaySwitch").is(':checked');
let list = '';
let editPosition = false;

//接收訊息並顯示在前端畫面上
socket.on('new title', function (json) {

    if (nowText != json.title) {

        if (!showStatus) {
            nowText = json.title;
            $("#title").text(nowText);
            return;
        }
        $(".textbox_bg").fadeOut("fast", function () {
            // Animation complete.
        });
        $("#title").animate({ opacity: 0 }, 200, function () {
            $("#title").text(json.title).animate({ opacity: 1 }, 200);
        });
        nowText = json.title;
        $(".textbox_bg").fadeIn("fast", function () {
            // Animation complete.
        });
    }

});

socket.on('new status', function (json) {
    //接收顯示狀態是否改變
    showStatus = json.status;
    $("#displaySwitch").attr("checked", showStatus);

    if (showStatus == false) {
        $(".textbox_bg").fadeOut("slow", function () {
            // Animation complete.
        });
    }
    else {
        $(".textbox_bg").fadeIn("slow", function () {
            // Animation complete.
        });
    }
});

//送出訊息(訊息,顯示狀態)
function sendNewTitle(text) {
    socket.emit('title', { title: text });
}


//更改顯示狀態
function changeShowStatus() {

    if (nowText == "") {
        $("#displaySwitch").attr("checked", false);
        return;
    }
    socket.emit('status', {
        status: $("#displaySwitch").is(':checked')
    });

}

//輸入新訊息
function newTitle() {
    var data = $("#inputField").val();
    if (data == "") {
        return
    }
    sendNewTitle(data);
    $("#inputField").val('');
}

//點選匯入的名單
function clickTitle(title_text) {

    if (title_text != '') {
        $("#inputField").val(title_text);
        newTitle();
    }
};

//將匯入名單轉成按鈕，供直接點選
$.getJSON("api/list", function (json) {
    list = JSON.parse(json).list;

    BindListData();

});
function BindListData() {

    var list_array = "";

    var departStatus = $("#DepartdisplaySwitch").is(':checked');
    var nameStatus = $("#NamedisplaySwitch").is(':checked');
    var titleStatus = $("#JobdisplaySwitch").is(':checked');

    var col_num = 12 / list.length;
    for (var i = 0; i < list.length; i++) {

        var buttonSrc = "<div class='col-lg-" + col_num + "' style='text-align: left;'><ul>";




        list[i].forEach(function (element, index) {


            var depart = element.split(' ')[0];
            var name = element.split(' ')[1].split('/')[0];
            var title = element.split('/')[1];
            var buttonText = '';
            if (departStatus) {
                buttonText += depart + ' ';
            }
            if (nameStatus) {
                buttonText += name;
            }
            if (titleStatus && title != null) {
                buttonText += '/' + title;
            }



            buttonSrc += "<div class='listbutton draggable' id='drag_" + (i + 1) + '-' + (index + 1) + "' ><button type='button' style='float:left;' onClick=\"";
            buttonSrc += "clickTitle('" + element + "')\"" + " class='btn btn-primary btn-sm'>" + (i + 1) + '-' + (index + 1) + "</button><div>" + buttonText + "</div></div> "


        }, this);
        buttonSrc += "</ul></div>";


        list_array += buttonSrc;

    }

    $("#button-array").html(list_array);

    SetPosition();
};

var sPositions = localStorage.positions || "{}",
    positions = JSON.parse(sPositions);


$(function () {

    $.each(positions, function (id, pos) {
        $("#" + id).css(pos)

    })
});

//設定各位置
function SetPosition() {

    $(".draggable").draggable({
        containment: "#container-draw",
        scroll: true,
        stop: function (event, ui) {

            positions[this.id] = ui.position;
            localStorage.positions = JSON.stringify(positions);
            console.log(sPositions);
            
        }
    });

    $.each(positions, function (id, pos) {
        $("#" + id).css(pos)

    })
}



function drabbableDisplay() {
    if (!editPosition) {

        $('.draggable').draggable('enable');
        $("#button_EditPosition").attr('class', 'btn btn-danger ');
        $("#button_EditPosition").html('編輯完成');
    }
    else {
        $('.draggable').draggable('disable');
        $("#button_EditPosition").attr('class', 'btn btn-primary');
        $("#button_EditPosition").html('編輯位置');
    }
    editPosition = !editPosition;

    $.each(positions, function (id, pos) {
        $("#" + id).css(pos)

    })
};


//hotkey
$(document).keypress(function (e) {
    if (e.which == 13) {
        // enter pressed
        newTitle();
    }
});
// ctrl+~ = dislpay click
$(document).keydown(function (e) {
    if (e.keyCode == 192 && e.ctrlKey) {
        $('#displaySwitch').click();
        changeShowStatus();
    }
});



