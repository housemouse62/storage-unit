const editButton = document.getElementById("edit-button");
const editForm = document.getElementById("edit-form");

const toggle = () => {
  if (editButton.textContent === "Save Folder Name") {
    editButton.textContent = "Edit Folder Name";
    editForm.submit();
  } else {
    editButton.textContent = "Save Folder Name";
  }
  const title = document.getElementById("folder-title");
  const input = document.getElementById("folder-input");
  title.classList.toggle("hidden");
  input.classList.toggle("hidden");
};

editButton.addEventListener("click", toggle);

const fileInput = document.getElementById("uploaded_file");
const fileNameDisplay = document.getElementById("file-name");

fileInput.addEventListener("change", () => {
  fileNameDisplay.textContent = fileInput.files[0]?.name || "No file chosen";
});
