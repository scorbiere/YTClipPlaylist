<template>
    <div class="viewer-interface">
        <header>
            <h1>Video Segment Viewer</h1>
        </header>
        <div class="content-area">
            <main>
                <YouTubePlayer class="youtube-player" ref="youtubePlayer" :videoId="selectedSegment.videoId"
                    :startTime="selectedSegment.startTime" :pauseTime="selectedSegment.endTime"
                    @over-pause-time="nextSegment" />
            </main>
            <aside>
                <h2>Segments</h2>
                <div>
                    <input v-model="filterText" type="text" placeholder="Filter segments by name">
                </div>
                <div>
                    <ul class="segments-list">
                        <SegmentItem v-for="(segment, index) in filteredSegments" :key="index" :segment="segment" :index="index"
                            :class="{ 'selected-segment': segment === selectedSegment }" @click="selectSegment(segment)"
                            :is-read-only="true" />
                    </ul>
                </div>
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
    name: 'ViewerInterface',
    data() {
        return {
            segments: [],
            selectedSegment: {},
            filterText: '',
        };
    },
    computed: {
        filteredSegments() {
            return this.segments.filter(segment =>
                segment.name.toLowerCase().includes(this.filterText.toLowerCase())
            );
        },
    },
    methods: {
        nextSegment() {
            console.log("nextSegment.");
            const segments = this.filteredSegments;
            if (segments && segments.length) {
                const currentIndex = segments.findIndex(segment => segment === this.selectedSegment);
                const nextIndex = currentIndex + 1;

                // Check if there is a next segment
                if (nextIndex < segments.length) {
                    const nextSegment = segments[nextIndex];
                    this.selectSegment(nextSegment);
                } else {
                    console.log("You've reached the end of the segments list.");
                    // Optional: Loop to the first segment or handle the end-of-list scenario
                    // For looping to the first segment, you could uncomment the following line:
                    // this.selectSegment(segments[0]);
                }
            }
        },
        selectSegment(segment) {
            this.selectedSegment = segment;
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
            } catch (error) {
                console.error('Error parsing segments data:', error);
                // Handle error (e.g., show an error message)
            }
        }

        if (this.segments && this.segments.length) {
            this.selectSegment(this.segments[0]);
        }
    },
};
</script>
  
  
<style scoped>
.viewer-interface {
    /* Styles for the viewer interface */
}

.video-player {
    /* Styles for the video player container */
}

.segments-navigation {
    /* Styles for the segments navigation list */
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
}

.selected-segment {
    background-color: rgba(0, 123, 255, 0.2);
}
</style>
