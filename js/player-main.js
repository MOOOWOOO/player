// 又定义了我们的 log 函数
var log = function () {
    // js 中函数里的 arguments 是一个保存了所有参数的列表
    // 就是这么野鸡
    // 输出用 console.log
    console.log(arguments)
};

// 找到 audio 标签并赋值给 player
var player = document.getElementById('id-audio-player');

var timer_refresh_current_time = null;

// 定制播放动作
player._play = function () {
    player.play();
    $('#id-player-play').data('mod', 'play');
    total_time();
    timer_refresh_current_time = setInterval(current_time, 1000);
};

// 定制暂停动作
player._pause = function () {
    player.pause();
    $('#id-player-play').data('mod', 'pause');
    clearInterval(timer_refresh_current_time);
};

// 定制停止动作
player._stop = function () {
    player._pause();
    player.currentTime = 0;
    current_time();
};

// 静音功能
$('#id-player-mute').on('click', function () {
    var self = $(this);
    if (self.data('mod') == "unmute") {
        log('do mute');
        self.data('mod', 'mute');
        self.data('vol', player.volume);
        player.volume = 0;
    } else {
        log('do unmute');
        self.data('mod', 'unmute');
        var vol = 0;
        if (self.data('vol') == 0) {
            vol = 1;
        } else {
            vol = self.data('vol');
        }
        player.volume = vol;
    }
    log(self.data('mod'));
    log(player.volume);
});

// 播放、暂停动作
var play = function () {
    var self = $('#id-player-play');
    if (self.data('mod') == 'play') {
        player._pause();
    } else {
        player._play();
    }
    log(self.data('mod'));
};

// 获取当前歌曲播放总时长
var total_time = function () {
    var t_time = player.duration;
    $('#id-total-time').text(t_time.toString());
    log('total_time', player.duration);
};

// 获取当前播放时间
var current_time = function () {
    $('#id-current-time').text(player.currentTime);
};

// 播放暂停功能
$('#id-player-play').on('click', function () {
    play();
});

// 停止播放
$('#id-player-stop').on('click', function () {
    player._stop();
});

// 上一首
$('#id-player-prev').on('click', function () {

});

// 下一首
$('#id-player-next').on('click', function () {

});

// 设置默认的播放模式, 这个是我们自己用的
var playMode = 'loop';

// require 是 electron 自带的函数
// fs 是一个操作文件的库
var fs = require('fs');
var path = require('path');

var audioDir = path.join('player', 'audios');
if (process.platform == 'darwin') {
    audioDir = 'audios';
}
// readdir 读取文件夹并以函数的形式返回所有文件
// 我们的音乐都放在 audios 文件夹中
fs.readdir(audioDir, function (error, files) {
    log(files, files.length);
    // 这是一个套路, 简而言之就是生成一段字符串
    var songTemplate = function (song) {
        var t = `
              <li class="gua-song">
                    <a href="#">${song}</a>
                </li>
            `;
        return t;
    };
    // 生成播放列表
    // map 是对 files 里面的每个元素调用 songTemplate 并且用结果生成一个新列表
    var songs = files.map(songTemplate);
    // 找到 id 为 id-ul-song-list 的元素并把上面生成的列表添加进去
    $('#id-ul-song-list').append(songs);
});

// 给 id 为 id-ul-song-list 的元素下的 a 标签添加一个点击事件
$('#id-ul-song-list').on('click', 'a', function () {
    // self 是被点击的 a 标签, 套路
    var self = $(this);
    // 生成音乐文件的路径
    var filepath = path.join('audios', self.text());
    // var filepath = 'audios/' + self.text()
    // 设置为 player 的当前音乐
    player.src = filepath;
    // 播放
    player._play();
});

// 给 id 为 id-audio-player 的元素也就是我们的 audio 标签添加一个事件 ended
// 这样在音乐播放完之后就会调用第二个参数(一个匿名函数)
$("#id-audio-player").on('ended', function () {
    log("播放结束, 当前播放模式是", playMode);
    // 如果播放模式是 loop 就重新播放
    if (playMode == 'loop') {
        player._play();
    } else {
        log('mode', playMode);
    }
});
