export const segmentMixin = {
    methods: {
        decodeQueryParam(param) {
            return decodeURIComponent(window.atob(param));
        },
        convertFromCompact(compactData) {
            return compactData.map(item => ({
                name: item[0],
                videoId: item[1],
                startTime: item[2],
                endTime: item[3],
            }));
        },
        convertToCompactFormat(segments) {
            return segments.map(segment => [
                segment.name, segment.videoId, Math.round(segment.startTime), Math.round(segment.endTime)
            ]);
        },
    },
};
