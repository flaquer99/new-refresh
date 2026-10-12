export function HudBackdrop() {
	return (
		<div
			aria-hidden="true"
			className="hud-grid pointer-events-none fixed inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
			data-hud-backdrop
		/>
	);
}
