const fs = require("fs");
const path = require("path");

/**
 * Safely deletes a file from the server uploads directory.
 * @param {string} filePath - Relative or absolute path to the file to delete.
 */
const deleteUploadedFile = (filePath) => {
  if (!filePath) return;

  try {
    // If path starts with /api/v1/uploads or uploads, resolve relative to project root
    let absolutePath = filePath;
    if (!path.isAbsolute(filePath)) {
      // Clean leading slashes
      const cleanedPath = filePath.replace(/^[\/\\]+/, "");
      
      // If path contains api/v1/uploads, strip that prefix to align with directory structure
      const relativeUploadPath = cleanedPath.replace(/^api\/v1\//, "");
      
      absolutePath = path.join(__dirname, "..", relativeUploadPath);
    }

    if (fs.existsSync(absolutePath)) {
      fs.unlink(absolutePath, (err) => {
        if (err) {
          console.error(`Failed to delete file at ${absolutePath}:`, err.message);
        } else {
          console.log(`Successfully deleted file at ${absolutePath}`);
        }
      });
    }
  } catch (error) {
    console.error("Error in deleteUploadedFile utility:", error.message);
  }
};

module.exports = deleteUploadedFile;
