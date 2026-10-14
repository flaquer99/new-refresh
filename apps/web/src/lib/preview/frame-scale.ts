type FrameScaleParams = {
	containerWidth: number;
	frameWidth: number;
};

export const frameScale = ({
	containerWidth,
	frameWidth,
}: FrameScaleParams): number => {
	if (containerWidth <= 0) {
		return 1;
	}
	return Math.min(1, containerWidth / frameWidth);
};
