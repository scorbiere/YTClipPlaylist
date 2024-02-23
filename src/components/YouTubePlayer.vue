<template>
    <div class="youtube-player" ref="youtubePlayer"></div>
</template>
  
<script>
export default {
    name: 'YouTubePlayer',
    props: {
        videoId: String,
        startTime: Number,
        pauseTime: Number,
        enablePause: {
            type: Boolean,
            default: true, // Default to true if you want the pause behavior enabled by default
        },
    },
    watch: {
        videoId: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.loadVideo(newVal);
                }
            },
        },
        startTime: {
            immediate: false, // Changed to false because immediate seek might not work if player isn't ready
            handler(newVal) {
                if (newVal !== undefined && this.player && typeof this.player.seekTo === 'function') {
                    this.player.seekTo(newVal, true);
                    this.player.playVideo();
                }
            },
        },
        pauseTime(newVal, oldVal) {
            // If pauseTime changes, restart the checking
            if (newVal !== oldVal && this.player && typeof this.player.getPlayerState === 'function') {
                this.startCheckingPlayProgress();
            }
        },
    },
    methods: {
        loadVideo(videoId) {
            const component = this;
            function onYouTubeIframeAPIReady() {
                console.log("Initializing YouTube Player with video ID:", videoId, "and start time:", component.startTime);
                component.player = new window.YT.Player(component.$refs.youtubePlayer, {
                    height: '390',
                    width: '640',
                    videoId: videoId,
                    playerVars: {
                        mute: 1,
                        autoplay: 1, // Auto-play the video on load
                        start: component.startTime, // Start at `startTime` seconds
                        end: component.pauseTime,
                        rel: 0, // Try to limit related videos to those from the same channel
                    },
                    events: {
                        onReady: component.onPlayerReady,
                        onStateChange: component.onPlayerStateChange,
                        onAutoplayBlocked: (event) => { console.log("onAutoplayBlocked", event, event.target.getPlayerState()) }
                    },
                });
            }

            if (!window.YT) {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
            } else if (!component.player) {
                onYouTubeIframeAPIReady();
            } else {
                component.player.loadVideoById({ videoId: videoId, startSeconds: component.startTime, endSeconds: component.pauseTime });
            }
        },
        onPlayerReady(event) {
            // The player is now ready.
            // If additional setup is needed upon player readiness, handle it here.
            this.$emit('player-ready', event);
        },
        onPlayerStateChange(event) {
            console.log("onPlayerStateChange", event.data, this.isInit);
            // YT.PlayerState.UNSTARTED is -1, which may indicate blocking in some cases
            // YT.PlayerState.CUED is 5, indicating the video is cued but not playing
            if (event.data === window.YT.PlayerState.UNSTARTED || event.data === window.YT.PlayerState.CUED) {
                console.log('Autoplay might be blocked, attempting to play video.');
                // Attempt to play the video. Consider muting the player first if not already muted.
                event.target.mute(); // Optional: Mute the player to increase likelihood of autoplay working
                event.target.playVideo();
            }
            else if (this.isInit) {
                event.target.seekTo(this.startTime, true);
                this.startCheckingPlayProgress();
                this.isInit = false;
            }
        },
        getCurrentTime() {
            if (this.player && typeof this.player.getCurrentTime === 'function') {
                const currentTime = this.player.getCurrentTime();
                return currentTime;
            }
        },
        setStartTime(startTime) {
            console.log("setStartTime", startTime);
            // Check if player is ready and seekTo function is available
            if (this.player && typeof this.player.seekTo === 'function') {
                this.player.seekTo(startTime, true);
            }
        },
        startCheckingPlayProgress() {
            // Ensure there's no existing interval running
            if (this.checkPlayProgressInterval) {
                clearInterval(this.checkPlayProgressInterval);
            }

            // Set up an interval to regularly check the pause condition
            this.checkPlayProgressInterval = setInterval(this.checkPlayProgress, 500); // Check every second
        },
        checkPlayProgress() {
            const currentTime = this.getCurrentTime();
            if (this.pauseTime && currentTime >= this.pauseTime) {
                console.log("over-pause-time");
                this.$emit('over-pause-time');
                // Only proceed if pause behavior is enabled
                if (this.enablePause) {
                    console.log("pauseVideo");
                    this.player.pauseVideo();
                    // Optionally, clear the interval once the video is paused
                    if (this.checkPlayProgressInterval) {
                        clearInterval(this.checkPlayProgressInterval);
                        this.checkPlayProgressInterval = null; // Reset the interval ID
                    }
                }
            }
        },
    },
    mounted() {
        this.isInit = true;
    },
    beforeUnmount() {
        if (this.player && this.player.destroy) {
            this.player.destroy();
        }
    }
};
</script>
  
<style scoped>
.youtube-player {
    /* Styles for the YouTube player container */
}
</style>
  