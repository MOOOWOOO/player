var log = function () {
    // js 中函数里的 arguments 是一个保存了所有参数的列表
    // 就是这么野鸡
    // 输出用 console.log
    console.log(arguments)
};

var player = document.getElementById('id-audio-player');
var current_track = $('#id-current-track');
var playlist = [];
var track_length = 0;
var playing_process = 0;
var timer_refresh_current_time = null;
var playMode = 'loop';

// 页面组件相关
{
    var init_slider = function () {
        $("#id-div-playing-process").slider({
            min: 0,
            max: track_length,
            range: "min",
            step: 0.01,
            value: playing_process + 0.01,
            slide: function (event, ui) {
                playing_process = ui.value;
            }
        });
    };
    var destroy_slider = function () {
        $("#id-div-playing-process").slider("destroy");
    };


}

init_slider();

// 定制播放器行为
{
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
}

// 获取当前歌曲播放总时长
var total_time = function () {
    track_length = player.duration;
    $('#id-total-time').text(track_length);
};

// 获取当前播放时间
var current_time = function () {
    playing_process = player.currentTime;
    $('#id-current-time').text(playing_process);
};

// 播放歌曲操作
{
    // 播放、暂停动作
    var play = function () {
        var self = $('#id-player-play');
        if (self.data('mod') == 'play') {
            player._pause();
        } else {
            player._play();
        }
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
        var prev_track = current_track.data('current-track') - 1;
        if (prev_track == -1) {
            prev_track = playlist.length - 1;
        } else {
        }
        $('#id-ol-song-list').find('li').eq(prev_track).click();
    });

    // 下一首
    $('#id-player-next').on('click', function () {
        var next_track = current_track.data('current-track') + 1;
        if (next_track >= playlist.length) {
            next_track = 0;
        } else {
        }
        $('#id-ol-song-list').find('li').eq(next_track).click();
    });

    // 默认速度
    $('#id-player-reset').on('click', function () {
        player.playbackRate = 1;
    });

    // 减速
    $('#id-player-slowdown').on('click', function () {
        if (player.playbackRate >= 0) {
            player.playbackRate -= 0.1;
        } else {
            player.playbackRate = 0;
        }
    });

    // 加速
    $('#id-player-speedup').on('click', function () {
        if (player.playbackRate <= 4) {
            player.playbackRate += 0.1;
        } else {
            player.playbackRate = 4;
        }
    });

    // 静音功能
    $('#id-player-mute').on('click', function () {
        var self = $(this);
        if (self.data('mod') == "unmute") {
            self.data('mod', 'mute');
            self.data('vol', player.volume);
            player.volume = 0;
        } else {
            self.data('mod', 'unmute');
            var vol = 0;
            if (self.data('vol') == 0) {
                vol = 1;
            } else {
                vol = self.data('vol');
            }
            player.volume = vol;
        }
    });

}

// 曲目列表相关操作
{
    var fs = require('fs');
    var path = require('path');

    var audioDir = path.join('player', 'audios');
    // readdir 读取包含音乐的文件夹并以函数的形式返回所有文件
    fs.readdir(audioDir, function (error, files) {
        var num = 0;
        var songTemplate = function (song) {
            var t = `<li class="gua-song" data-track-num="${num}" data-track-name="${song}">${song}</li>`;
            num += 1;
            return t;
        };
        // 生成播放列表
        // map 是对 files 里面的每个元素调用 songTemplate 并且用结果生成一个新列表
        playlist = files.map(songTemplate);
        $('#id-ol-song-list').append(playlist);
    });

    // 初始化曲目列表
    $('#id-ol-song-list').on('click', 'li', function () {
        var self = $(this);
        // 生成音乐文件的路径
        var filepath = path.join('audios', self.data('track-name'));
        // 设置为 player 的当前音乐
        player.src = filepath;
        current_track.data('current-track', self.data('track-num'));
    });

    // 加载完成歌曲后进行相关操作
    $('#id-audio-player').on('loadedmetadata', function () {
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
}

