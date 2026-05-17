// GUIDE.JS FORM FIELD UPDATES
// Replace the fields object in guide.js initToursPage() function (around line 2367)

const fields = {
    id: qs('#tourId'),
    title: qs('#tourTitle'),
    shortDescription: qs('#tourShortDescription'),  // RENAMED from description
    category: qs('#tourCategory'),
    region: qs('#tourRegion'),  // NEW: replaces province
    city: qs('#tourCity'),
    meetingArea: qs('#tourMeetingArea'),
    duration: qs('#tourDuration'),
    meetingPoint: qs('#tourMeetingPoint'),
    price: qs('#tourPrice'),
    priceType: qs('#tourPriceType'),
    minGuests: qs('#tourMinGuests'),
    maxGuests: qs('#tourMaxGuests'),
    timeSlots: qs('#tourTimeSlots'),
    reservationType: qs('#tourReservationType'),
    languages: qs('#tourLanguages'),
    includes: qs('#tourIncludes'),
    excludes: qs('#tourExcludes'),
    requirements: qs('#tourRequirements'),
    safetyInfo: qs('#tourSafetyInfo'),
    images: qs('#tourImages'),
    imagePreview: qs('#tourImagePreview'),
    clearImagesBtn: qs('#tourClearImages'),
    imageMeta: qs('#tourImageMeta')
    // REMOVED: guestAdult, guestChildren, guestSenior, difficulty, tags, weather, bestSeason, childFriendly, petFriendly, guidePhoto, status, provider, etc.
};

// REMOVED: selectedGuestTypes() function
// REMOVED: setGuestTypes() function

// UPDATE: buildPayload() function - Remove guest types, difficulty, tags, weather, etc.
function buildPayload(existingTour, forcedStatus) {
    const existing = existingTour || null;
    const galleryBase = imageTouched ? previewGallery.slice(0, 5) : (existing && Array.isArray(existing.gallery) ? existing.gallery.slice(0, 5) : previewGallery.slice(0, 5));
    const gallery = galleryBase.filter(Boolean);
    const minGuests = Math.max(1, Number(fields.minGuests ? fields.minGuests.value : 1));
    const maxGuests = Math.max(minGuests, Number(fields.maxGuests ? fields.maxGuests.value : 10));
    const title = String(fields.title ? fields.title.value : '').trim();

    return {
        id: fields.id && fields.id.value ? fields.id.value : uid('guide-tour'),
        title: title,
        short_description: String(fields.shortDescription ? fields.shortDescription.value : '').trim(),
        category: String(fields.category ? fields.category.value : '').trim(),
        region: String(fields.region ? fields.region.value : '').trim(),  // NEW
        province: String(fields.region ? fields.region.value : '').trim(),  // Keep for DB compatibility
        city: String(fields.city ? fields.city.value : '').trim(),
        meeting_area: String(fields.meetingArea ? fields.meetingArea.value : '').trim(),
        meeting_point: String(fields.meetingPoint ? fields.meetingPoint.value : '').trim(),
        duration_label: String(fields.duration ? fields.duration.value : '').trim(),
        min_guests: minGuests,
        max_guests: maxGuests,
        price: Math.max(1, Number(fields.price ? fields.price.value : 0)),
        price_type: String(fields.priceType ? fields.priceType.value : 'per_person').trim(),
        reservation_type: String(fields.reservationType ? fields.reservationType.value : 'instant').trim(),
        time_slots: parseListValue(fields.timeSlots ? fields.timeSlots.value : ''),
        languages: String(fields.languages ? fields.languages.value : '').trim(),
        includes: parseListValue(fields.includes ? fields.includes.value : ''),
        excludes: String(fields.excludes ? fields.excludes.value : '').trim(),
        requirements: String(fields.requirements ? fields.requirements.value : '').trim(),
        safety_info: String(fields.safetyInfo ? fields.safetyInfo.value : '').trim(),
        gallery_paths: gallery,
        cover_image_path: gallery[0] || (existing && existing.cover_image_path) || null,
        status: forcedStatus === 'published' ? 'published' : 'draft',
        is_active: true
        // REMOVED: guestTypes, difficulty, tags, weather, bestSeason, childFriendly, petFriendly, guidePhoto, cancellationText, freeC ancellation, reserveNowPayLater
    };
}

// UPDATE: validatePayload() - Update validation rules
function validatePayload(payload) {
    const errors = [];
    if (!payload.title || payload.title.length < 5) {
        errors.push({ field: fields.title, message: 'Tour title is required (at least 5 characters).' });
    }
    if (!payload.short_description || payload.short_description.length < 20) {
        errors.push({ field: fields.shortDescription, message: 'Short description must be at least 20 characters.' });
    }
    if (!payload.category) {
        errors.push({ field: fields.category, message: 'Tour category is required.' });
    }
    if (!payload.duration_label) {
        errors.push({ field: fields.duration, message: 'Tour duration is required.' });
    }
    if (!payload.region) {
        errors.push({ field: fields.region, message: 'Region is required.' });
    }
    if (!payload.city) {
        errors.push({ field: fields.city, message: 'City / Municipality is required.' });
    }
    if (!payload.meeting_area) {
        errors.push({ field: fields.meetingArea, message: 'Specific meeting area is required.' });
    }
    if (!payload.meeting_point) {
        errors.push({ field: fields.meetingPoint, message: 'Meeting point is required.' });
    }
    if (Number(payload.price) < 1) {
        errors.push({ field: fields.price, message: 'Base price must be at least ₱1.' });
    }
    if (!Array.isArray(payload.time_slots) || !payload.time_slots.length) {
        errors.push({ field: fields.timeSlots, message: 'Add at least one available time slot.' });
    }
    if (!payload.languages) {
        errors.push({ field: fields.languages, message: 'Languages spoken is required.' });
    }
    if (!Array.isArray(payload.gallery_paths) || payload.gallery_paths.length < 3 || payload.gallery_paths.length > 5) {
        errors.push({ field: fields.imagePreview, message: 'Please upload 3 to 5 images.' });
    }
    if (Number(payload.max_guests) < Number(payload.min_guests)) {
        errors.push({ field: fields.maxGuests, message: 'Maximum guests cannot be lower than minimum guests.' });
    }
    return errors;
}

// UPDATE: applyPayloadToForm() - Update field mapping
function applyPayloadToForm(tour, clearDraftAfter) {
    if (!tour) return;
    if (fields.id) fields.id.value = tour.id;
    if (fields.title) fields.title.value = tour.title;
    if (fields.shortDescription) fields.shortDescription.value = tour.short_description || '';
    if (fields.category) fields.category.value = tour.category || '';
    if (fields.region) fields.region.value = tour.region || tour.province || '';
    if (fields.city) fields.city.value = tour.city || '';
    if (fields.meetingArea) fields.meetingArea.value = tour.meeting_area || '';
    if (fields.duration) fields.duration.value = tour.duration_label || '';
    if (fields.meetingPoint) fields.meetingPoint.value = tour.meeting_point || '';
    if (fields.price) fields.price.value = String(tour.price);
    if (fields.priceType) fields.priceType.value = tour.price_type || 'per_person';
    if (fields.minGuests) fields.minGuests.value = String(Math.max(1, Number(tour.min_guests || 1)));
    if (fields.maxGuests) fields.maxGuests.value = String(Math.max(1, Number(tour.max_guests || 10)));
    if (fields.timeSlots) fields.timeSlots.value = Array.isArray(tour.time_slots) ? tour.time_slots.join(', ') : '';
    if (fields.reservationType) fields.reservationType.value = tour.reservation_type || 'instant';
    if (fields.languages) fields.languages.value = tour.languages || '';
    if (fields.includes) fields.includes.value = Array.isArray(tour.includes) ? tour.includes.join('\n') : '';
    if (fields.excludes) fields.excludes.value = tour.excludes || '';
    if (fields.requirements) fields.requirements.value = tour.requirements || '';
    if (fields.safetyInfo) fields.safetyInfo.value = tour.safety_info || '';
    if (fields.images) fields.images.value = '';
    previewGallery = (tour.gallery_paths || [tour.cover_image_path]).filter(Boolean).slice(0, 5);
    imageTouched = false;
    renderGallery(fields.imagePreview, previewGallery, tour.title, true);
    updateImageMeta();
    setUploadProgress(0);
    if (clearDraftAfter) writeStore(GUIDE_TOUR_DRAFT_KEY, null);
}

// UPDATE: clearForm() - Remove guest types setup
function clearForm() {
    if (!form) return;
    form.reset();
    if (fields.id) fields.id.value = '';
    previewGallery = [];
    imageTouched = false;
    renderGallery(fields.imagePreview, [], 'Tour', true);
    updateImageMeta();
    setUploadProgress(0);
    writeStore(GUIDE_TOUR_DRAFT_KEY, null);
}
