<template>
    <div class="segment-item">
        <!-- Conditionally display name as input or plain text -->
        <div v-if="isReadOnly">Name: {{ localSegment.name }}</div>
        <div v-else>Name: <input v-model="localSegment.name" placeholder="Segment name"></div>

        <div>Video id: {{ localSegment.videoId }}</div>
        <div>
            <span>Start: {{ formatTime(localSegment.startTime) }}&nbsp;</span>
            <!-- Conditionally display set start time button -->
            <span v-if="!isReadOnly" @click="$emit('set-start-time', localSegment)" class="time-setter fa fa-pencil" title="Set with the current play time"></span>
        </div>
        <div>
            <span>End: {{ formatTime(localSegment.endTime) }}&nbsp;</span>
            <!-- Conditionally display set end time button -->
            <span v-if="!isReadOnly" @click="$emit('set-end-time', localSegment)" class="time-setter fa fa-pencil" title="Set with the current play time"></span>
        </div>
        <!-- The delete button can also be conditionally shown or hidden -->
        <button v-if="!isReadOnly" class="delete-button" @click="$emit('delete-segment', segment)">X</button>
    </div>
</template>
  
<script>
export default {
    props: {
    segment: Object,
    isReadOnly: {
        type: Boolean,
        default: false,
    },
},
    data() {
        return {
            localSegment: this.segment,
        };
    },
    methods: {
        formatTime(seconds) {
            // Convert seconds to HH:MM:SS format
            const pad = (num, size) => ('000' + num).slice(size * -1);
            const time = parseFloat(seconds).toFixed(3);
            const hours = Math.floor(time / 60 / 60);
            const minutes = Math.floor(time / 60) % 60;
            const secs = Math.floor(time - minutes * 60);
            return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(secs, 2);
        },
        deleteSegment() {
            this.$emit('delete-segment', this.index);
        }
    }
}
</script>
  
<style scoped>
.segment-item {
    position: relative;
    /* Additional styling */
}

.delete-button {
    position: absolute;
    top: 0;
    right: 0;
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: red;
}
</style>
  