// src/lib/cloudinary.js
//
// Loads the Cloudinary upload widget script once (lazily) and exposes a
// small wrapper for opening it. Requires the widget script to be reachable
// at runtime — see index.html for the <script> tag, or this loader will
// inject it on first use.

const WIDGET_SRC = "https://upload-widget.cloudinary.com/global/all.js";

let widgetScriptPromise = null;

function loadWidgetScript() {
    if (window.cloudinary) return Promise.resolve();
    if (widgetScriptPromise) return widgetScriptPromise;

    widgetScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = WIDGET_SRC;
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error("Gagal memuat Cloudinary widget."));
        document.head.appendChild(script);
    });

    return widgetScriptPromise;
}

/**
 * Opens the Cloudinary unsigned upload widget.
 *
 * @param {Object} options
 * @param {string[]} [options.allowedFormats] - e.g. ['pdf', 'png', 'jpg']
 * @param {('local'|'camera'|'google_drive')[]} [options.sources]
 * @param {Function} onSuccess - called with `result.info` on a successful upload
 * @param {Function} [onError] - called with the error on failure/close-with-error
 */
export async function openCloudinaryWidget(
    { allowedFormats, sources = ["local", "camera", "google_drive"] } = {},
    onSuccess,
    onError
) {
    await loadWidgetScript();

    console.log("cloudName:", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
    console.log("uploadPreset:", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    console.log("window.cloudinary:", window.cloudinary);

    const widget = window.cloudinary.createUploadWidget(
        {
            cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
            uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
            sources,
            multiple: false,
            maxFiles: 1,
            ...(allowedFormats?.length ? { clientAllowedFormats: allowedFormats } : {}),
        },
        (error, result) => {
            if (error) {
                onError?.(error);
                return;
            }
            if (result.event === "success") {
                onSuccess(result.info);
            }
        }
    );

    widget.open();
}