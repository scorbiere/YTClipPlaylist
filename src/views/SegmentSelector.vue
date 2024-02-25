<template>
    <div class="segment-selector">
        <header>
            <h1>Video Segment Selector</h1>
            <input type="file" @change="loadJson" ref="fileInput" style="display: none;" />
            <button @click="triggerFileInput">Load JSON File</button>
            <button @click="saveJson">Save/Download JSON File</button>
            <button @click="createSharableLink">Create a Sharable Link</button>
            <a v-if="sharableLink" :href="sharableLink" target="_blank">Open Sharable Link</a>
        </header>
        <div class="content-area">

            <main>
                <div class="video-url-input">
                    <label for="videoUrl">Video URL:</label>
                    <input id="videoUrl" v-model="videoUrl" type="text" placeholder="Enter YouTube video URL"
                        class="video-url-input-field">
                    <button @click="applyVideoUrl">Apply</button>
                </div>
                <YouTubePlayer class="youtube-player" ref="youtubePlayer" :videoId="selectedVideoId"
                    :startTime="selectedSegment.startTime" :pauseTime="selectedSegment.endTime" />
            </main>
            <aside>
                <input v-model="filterText" type="text" placeholder="Filter segments by name">
                <button @click="addSegment">Add New Segment</button>
                <ul class="segments-list">
                    <SegmentItem v-for="(segment, index) in segments" :key="index" :segment="segment" :index="index"
                        :class="{ 'selected-segment': segment === selectedSegment }" @click="selectSegment(segment)"
                        @delete-segment="removeSegment" @set-start-time="setCurrentTime($event, 'start')"
                        @set-end-time="setCurrentTime($event, 'end')" />
                </ul>
            </aside>
        </div>
    </div>
</template>
  
<script>
import YouTubePlayer from '@/components/YouTubePlayer.vue';
import SegmentItem from '@/components/SegmentItem.vue';
import { segmentMixin } from '@/mixins/segmentMixin.js';

export default {
    mixins: [segmentMixin],
    components: {
        YouTubePlayer,
        SegmentItem,
    },
    name: 'SegmentSelector',
    data() {
        return {
            videoUrl: 'https://www.youtube.com/watch?v=et5Jb68dnio&t=4098s',
            selectedVideoId: '',
            segments: [],
            selectedSegment: {},
            filterText: '',
            sharableLink: '',
        };
    },
    watch: {
        segments: {
            handler(newSegments) {
                sessionStorage.setItem('segments', JSON.stringify(newSegments));
            },
            deep: true // Watch for changes in array objects
        }
    },
    computed: {
        filteredSegments() {
            return this.segments.filter(segment =>
                segment.name.toLowerCase().includes(this.filterText.toLowerCase())
            );
        },
    },
    methods: {
        triggerFileInput() {
            this.$refs.fileInput.click(); // Access the file input using $refs and trigger click
        },
        loadJson(event) {
            const file = event.target.files[0]; // Access the selected file
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    // Handle file content
                    const content = e.target.result;
                    // Assuming content is JSON and needs to be processed
                    try {
                        const compactData = JSON.parse(content);
                        this.segments = this.convertFromCompactFormat(compactData);
                    } catch (error) {
                        console.error("Error parsing JSON:", error);
                        // Handle error
                    }
                };
                reader.readAsText(file);
            }
        },
        saveJson() {
            const compactSegments = this.convertToCompactFormat(this.segments);
            const jsonString = JSON.stringify(compactSegments);
            this.downloadJson(jsonString, "segments.json");
        },
        downloadJson(jsonString, filename) {
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link); // Append link to body temporarily
            link.click(); // Trigger download
            document.body.removeChild(link); // Remove link after triggering download
            URL.revokeObjectURL(url); // Clean up to release resources
        },
        createSharableLink() {
            const compactSegments = this.convertToCompactFormat(this.segments);
            const jsonData = JSON.stringify(compactSegments);
            const base64EncodedData = btoa(encodeURIComponent(jsonData)); // Encode the JSON string as Base64
            const viewerUrl = `${window.location.origin}/viewer?data=${base64EncodedData}`; // Construct the viewer URL with the encoded data as a parameter

            // Check if the URL exceeds 2000 characters, a common practical limit
            if (viewerUrl.length > 2000) {
                alert("The generated link is too long and might not be supported by some browsers. Please reduce the number of segments.");
            } else {
                this.sharableLink = viewerUrl;
                window.focus(); // Attempt to focus the window before accessing the clipboard
                this.copyToClipboard(viewerUrl);
            }
        },
        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                alert("Sharable link created and copied to clipboard!");
                console.log("Text copied to clipboard");
            }).catch(err => {
                console.error('Error in copying text: ', err);
                // Fallback: Display the text in a selectable input or textarea and prompt the user to copy it manually
                alert("Automatic copy failed. Please copy the text manually");
            });
        },

        applyVideoUrl() {
            // Extract the video ID from the URL
            const videoId = this.extractVideoId(this.videoUrl);
            if (videoId) {
                // If a video ID is found, update selectedVideoId with it
                this.selectedVideoId = videoId;
            } else {
                // Handle cases where the URL might not be a valid YouTube watch URL
                console.error("Invalid YouTube URL");
            }
        },
        extractVideoId(url) {
            const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            return match ? match[1] : null;
        },
        removeSegment(index) {
            this.segments.splice(index, 1);
        },
        addSegment() {
            const videoId = this.extractVideoId(this.videoUrl);
            if (videoId) {
                this.segments.push({
                    name: "",
                    videoId: videoId, // Storing only the video ID
                    startTime: this.$refs.youtubePlayer.getCurrentTime(),
                    endTime: 0
                });
                this.selectSegment(this.segments[this.segments.length - 1]);
            } else {
                console.error("Invalid YouTube URL");
            }
        },
        selectSegment(segment) {
            this.selectedSegment = segment;
            this.videoUrl = "https://www.youtube.com/watch?v=" + segment.videoId;
            this.applyVideoUrl();
        },
        // Method to request current time from YouTubePlayer and set it for start/end
        setCurrentTime(segment, timeType) {
            if (timeType === 'start') {
                segment.startTime = this.$refs.youtubePlayer.getCurrentTime();
            } else if (timeType === 'end') {
                segment.endTime = this.$refs.youtubePlayer.getCurrentTime();
            }
        },
    },
    mounted() {
        const urlParams = new URLSearchParams(window.location.search);
        const dataParam = urlParams.get('data');
        if (dataParam) {
            const decodedData = this.decodeQueryParam(dataParam);
            try {
                const compactSegments = JSON.parse(decodedData);
                this.segments = this.convertFromCompact(compactSegments);
                // Save to session storage
                sessionStorage.setItem('segments', JSON.stringify(this.segments));

                // Remove 'data' parameter from URL
                const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.pushState({ path: newUrl }, '', newUrl);
            } catch (error) {
                console.error('Error parsing segments data:', error);
            }
        } else {
            // Load from session storage if 'data' parameter is not present
            const storedSegments = sessionStorage.getItem('segments');
            if (storedSegments) {
                this.segments = JSON.parse(storedSegments);
            }
        }

        if (this.segments && this.segments.length) {
            this.selectSegment(this.segments[0]);
        }
        // Initialize the YouTube player here as well
    },
};
</script>
  
<style scoped>
.video-url-input-field {
    width: 100%;
    /* Makes the input take the full width of its parent container */
    /* Or use a specific pixel width, e.g., width: 500px; */
    max-width: 500px;
    /* Optional: ensures the input doesn't grow beyond a certain width */
    /* Additional styling to improve the input's appearance */
    padding: 8px;
    margin: 5px 0;
    box-sizing: border-box;
    /* Ensures padding does not affect the final size */
}

.segment-selector {
    display: flex;
    flex-direction: column;
}

header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.content-area {
    display: flex;
    flex-direction: row;
    /* Aligns children (main and aside) horizontally */
}

main {
    flex-grow: 1;
}

aside {
    width: 300px;
    /* Adjust the width of the segment list as needed */
    /* Styles for the left side section */
}

.youtube-player {
    /* Styles for the YouTube player container */
}

.segments-list {
    list-style-type: none;
    padding: 0;
}

.segments-list li {
    cursor: pointer;
    margin: 10px 0;
}

.selected-segment {
    background-color: rgba(0, 123, 255, 0.2);
    /* Light transparent blue */
    /* Add other styles as needed (e.g., padding, margin) */
}
</style>
  