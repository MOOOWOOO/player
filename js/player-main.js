// utils
{
    var formatSeconds = function (value) {
        var theTime = parseInt(value);// 秒
        var theTime1 = 0;// 分
        var theTime2 = 0;// 小时

        if (theTime > 60) {
            theTime1 = parseInt(theTime / 60);
            theTime = parseInt(theTime % 60);

            if (theTime1 > 60) {
                theTime2 = parseInt(theTime1 / 60);
                theTime1 = parseInt(theTime1 % 60);
            }
        }

        var s = parseInt(theTime);

        var m = 0;
        if (theTime1 > 0) {
            m = parseInt(theTime1);
        }

        var h = 0;
        if (theTime2 > 0) {
            h = parseInt(theTime2);
        }
        return h + ':' + m + ':' + s;
    };

    var log = function () {
        // js 中函数里的 arguments 是一个保存了所有参数的列表
        // 就是这么野鸡
        // 输出用 console.log
        console.log(arguments)
    };

}

var player = document.getElementById('id-audio-player');
var current_track = $('#id-current-track');
var playlist = [];
var track_length = 0;
var playing_process = 0;
var timer_refresh_current_time = null;
var playMode = 'loop';

// 页面组件相关
{
    var init_volume_slider = function (current_volume) {
        $("#id-div-volume-slider").slider({
            range: "min",
            min: 0,
            max: 1,
            step: 0.01,
            value: current_volume,
            change: function (event, ui) {
                player.volume = ui.value;
            },
            slide: function (event, ui) {
                player.volume = ui.value;
            },
        })
    };

    var control_volume_slider = function (current_volume) {
        $("#id-div-volume-slider").slider({value: current_volume});
    };

    var init_playing_slider = function (track_length) {
        log(playing_process);
        $("#id-div-playing-process").slider({
            min: 0,
            max: track_length,
            range: "min",
            step: 0.01,
            value: playing_process,
            change: function (event, ui) {
                player.currentTime = ui.value;
            },
            slide: function (event, ui) {
                player.currentTime = ui.value;
            }
        });
    };

    var control_playing_slider = function (current_process) {
        $("#id-div-playing-process").slider({value: current_process});
    };

    var destroy_slider = function () {
        $("#id-div-playing-process").slider("destroy");
        $("#id-div-volume-slider").slider("destroy");
    };

}

init_playing_slider(0);
init_volume_slider(1);

// 定制播放器行为
{
    // 定制播放动作
    player._play = function () {
        $('#id-player-play').data('mod', 'play');
        total_time();
        destroy_slider();
        init_playing_slider(track_length);
        init_volume_slider(player.volume);
        player.play();
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
    $('#id-label-total-time').text(formatSeconds(track_length));
};

// 获取当前播放时间
var current_time = function () {
    playing_process = player.currentTime;
    $('#id-label-current-time').text(formatSeconds(playing_process));
    control_playing_slider(playing_process);
};

// 播放歌曲操作
{
    // 播放、暂停动作
    var play = function () {
        var self = $('#id-player-play');
        if (self.data('mod') == 'play') {
            player._pause();
            self.css();
            //ui-icon ui-icon-pause
        } else {
            player._play();
            self.css();
            //ui-icon ui-icon-play
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
        log('prev');
        var prev_track = current_track.data('current-track') - 1;
        if (prev_track == -1) {
            prev_track = playlist.length - 1;
        } else {
        }
        $('#id-ol-song-list').find('li').eq(prev_track).click();
    });

    // 下一首
    $('#id-player-next').on('click', function () {
        log('next');
        var next_track = current_track.data('current-track') + 1;
        if (next_track >= playlist.length) {
            next_track = 0;
        } else {
        }
        $('#id-ol-song-list').find('li').eq(next_track).click();
    });

    // 默认速度
    $('#id-p-reset-speed').on('click', function () {
        player.playbackRate = 1;
    });

    // 减速
    $('#id-p-speed-down').on('click', function () {
        if (player.playbackRate >= 0) {
            player.playbackRate -= 0.1;
            // enable
        } else {
            player.playbackRate = 0;
            // disable
        }
    });

    // 加速
    $('#id-p-speed-up').on('click', function () {
        if (player.playbackRate <= 4) {
            player.playbackRate += 0.1;
            // enable
        } else {
            player.playbackRate = 4;
            // disable
        }
    });

    // 静音功能
    $('#id-p-player-mute').on('click', function () {
        var self = $(this);
        if (self.data('mod') == "unmute") {
            self.data('mod', 'mute');
            self.data('vol', player.volume);
            control_volume_slider(0);
            // class add mute ui-icon ui-icon-volume-off
        } else {
            self.data('mod', 'unmute');
            var vol = 0;
            if (self.data('vol') == 0) {
                vol = 1;
            } else {
                vol = self.data('vol');
            }
            control_volume_slider(vol);
            // class add unmute ui-icon ui-icon-volume-on
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
            var t = `<li class="ui-menu-item" data-track-num="${num}" data-track-name="${song}">${song}</li>`;
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
        audio_info(player.src);
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

// read music file info
{
    var jsmediatags = require("jsmediatags");

    var audio_info = function (audio_file_path) {
        new jsmediatags.Reader(audio_file_path)
            .setTagsToRead(["title", "artist", "album"])
            .read({
                onSuccess: function (tag) {
                    var artist = tag.tags.artist;
                    if (artist) {
                    } else {
                        artist = 'default';
                    }
                    var album = tag.tags.album;
                    if (album) {
                    } else {
                        album = 'default';
                    }
                    var title = tag.tags.title;
                    if (title) {
                    } else {
                        var fn = audio_file_path.split('/');
                        title = fn[fn.length - 1];
                    }
                    $("#id-label-artist").text(artist);
                    $("#id-label-album").text(album);
                    $("#id-label-title").text(title);
                },
                onError: function (error) {
                    console.log(':(', error.type, error.info);
                }
            });
    }

}
