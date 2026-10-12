import { useState } from "react";

export type DeleteDialogState = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	markDeleted: () => void;
	restoresFocus: boolean;
};

export function useDeleteDialog(): DeleteDialogState {
	const [open, setOpen] = useState(false);
	const [restoresFocus, setRestoresFocus] = useState(true);
	const onOpenChange = (next: boolean) => {
		if (next) {
			setRestoresFocus(true);
		}
		setOpen(next);
	};
	const markDeleted = () => {
		setRestoresFocus(false);
		setOpen(false);
	};
	return { open, onOpenChange, markDeleted, restoresFocus };
}
