/**
 * Helper utility to read an image file and convert it into Base64 format.
 * Beginner-friendly: checks file type and size, then converts to data URL.
 */
export const readFileAsBase64 = (file, onSuccess, onError) => {
  // Step 1: Make sure a file was selected
  if (!file) return;

  // Step 2: Ensure the file is an image
  if (!file.type.startsWith("image/")) {
    if (onError) {
      onError("Please select a valid image file (PNG, JPG, WebP)");
    }
    return;
  }

  // Step 3: Prevent files larger than 3.5MB to save localStorage memory
  if (file.size > 3.5 * 1024 * 1024) {
    if (onError) {
      onError("Image size is over 3.5MB. Please choose a smaller image.");
    }
    return;
  }

  // Step 4: Read file as Base64 Data URL
  const reader = new FileReader();
  reader.onload = () => {
    if (onSuccess) onSuccess(reader.result);
  };
  reader.onerror = () => {
    if (onError) onError("Failed to read image file.");
  };
  reader.readAsDataURL(file);
};
