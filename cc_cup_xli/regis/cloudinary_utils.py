import cloudinary.uploader

_RESOURCE_TYPES = ('image', 'raw', 'video')


def destroy_asset(public_id):
    """
    Delete a Cloudinary asset by public_id. We don't store which
    resource_type it was uploaded as (unsigned widget uploads can land
    as 'image' or 'raw' depending on the preset), so try each type in
    turn and stop as soon as one actually finds and removes the asset —
    calling destroy() with the wrong resource_type doesn't error, it
    just silently no-ops.
    """
    if not public_id:
        return
    for resource_type in _RESOURCE_TYPES:
        try:
            result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        except Exception:
            continue
        if result.get('result') == 'ok':
            return